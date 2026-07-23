import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ConciergeFlowPhase } from '../types';
import { generateQrCode, POLANCO_STORE, reserveReplacementSize, startReturnRequest } from '../api/concierge-actions';
import { ReturnsApiError } from '../../../lib/returns-api-client';
import { useAppState } from '../../../lib/app-state';
import { sofiaOrder } from '../../../lib/order-fixture';

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

const OPENING_CUSTOMER_MESSAGE =
  'El vestido no me quedó y lo necesito para una gala el sábado.';

const CONCIERGE_OFFER =
  `Puedo ayudarte a cambiarlo o devolverlo. La talla ${sofiaOrder.requestedSize} está disponible ` +
  `en ${POLANCO_STORE} y puedo solicitar que la reserven mientras llevas la talla ${sofiaOrder.purchasedSize}. ` +
  'Por el tipo y valor del artículo, un asesor deberá revisar físicamente la prenda. ' +
  '¿Quieres iniciar el cambio?';

export function useConciergeFlow() {
  const { setReturnRequest, setQrCode, setReservation } = useAppState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ConciergeFlowPhase>('greeting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  const pushMessage = useCallback((author: ChatMessage['author'], text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), author, text }]);
  }, []);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    pushMessage('sofia', OPENING_CUSTOMER_MESSAGE);
    await wait(900);
    pushMessage('concierge', CONCIERGE_OFFER);
    setPhase('awaiting-start-decision');
  }, [pushMessage]);

  const decline = useCallback(() => {
    pushMessage('sofia', 'Prefiero pensarlo, gracias.');
    setPhase('declined');
    void wait(500).then(() =>
      pushMessage(
        'concierge',
        'Entendido. Puedo escalar tu caso a un asesor humano en cualquier momento si cambias de opinión.',
      ),
    );
  }, [pushMessage]);

  const acceptExchange = useCallback(async () => {
    pushMessage('sofia', 'Sí, quiero iniciar el cambio.');
    setErrorMessage(null);

    try {
      setPhase('reserving-size');
      await wait(400);
      pushMessage('system', `Reservando talla ${sofiaOrder.requestedSize} en ${POLANCO_STORE}...`);
      const reservation = await reserveReplacementSize(sofiaOrder.requestedSize, POLANCO_STORE);
      setReservation(reservation, POLANCO_STORE);

      setPhase('validating-eligibility');
      await wait(300);
      pushMessage('system', 'Validando elegibilidad con Returns Orchestrator...');
      const returnRequest = await startReturnRequest(sofiaOrder);
      setReturnRequest(returnRequest);
      pushMessage(
        'concierge',
        returnRequest.eligibilityStatus === 'Eligible'
          ? 'Tu cambio es elegible. Un asesor en tienda revisará físicamente la prenda antes de confirmar el reembolso o el cambio.'
          : `Estatus de elegibilidad: ${returnRequest.eligibilityStatus}.`,
      );

      setPhase('issuing-qr');
      await wait(300);
      pushMessage('system', 'Generando tu código QR para la tienda (vigencia 72 horas)...');
      const qrCode = await generateQrCode(returnRequest.id);
      setQrCode(qrCode);

      pushMessage(
        'concierge',
        `Listo, ${sofiaOrder.customerFirstName}. Tu talla ${sofiaOrder.requestedSize} quedó reservada y generé tu QR para ${POLANCO_STORE}.`,
      );
      setPhase('ready-for-confirmation');
    } catch (error) {
      const message =
        error instanceof ReturnsApiError
          ? error.message
          : 'Ocurrió un problema al conectar con Returns Orchestrator.';
      setErrorMessage(message);
      pushMessage('concierge', `No pude completar la solicitud: ${message}`);
      setPhase('error');
    }
  }, [pushMessage, setQrCode, setReservation, setReturnRequest]);

  return {
    messages,
    phase,
    errorMessage,
    start,
    acceptExchange,
    decline,
  };
}
