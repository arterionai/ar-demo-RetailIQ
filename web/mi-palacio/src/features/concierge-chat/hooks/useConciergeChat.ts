import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, ConciergeStatus, ConversationMessage, ToolCall } from '../types';
import { ConciergeProxyError, sendConciergeTurn } from '../api/concierge-chat-client';
import { generateQrCode, POLANCO_STORE, reserveReplacementSize, startReturnRequest } from '../api/concierge-actions';
import { ReturnsApiError } from '../../../lib/returns-api-client';
import { useAppState } from '../../../lib/app-state';
import { sofiaOrder } from '../../../lib/order-fixture';

// ADR-014 (no negociable): el LLM nunca decide ni ejecuta el cambio/devolución directamente.
// Cuando el modelo invoca esta tool, es ESTE HOOK (frontend) el que dispara las llamadas reales
// ya existentes contra Palacio.Returns.Api, en el mismo orden que el flujo guiado original
// (ver el difunto useConciergeFlow.ts en el historial de git):
//   1. Reserva de talla — simulada localmente (no existe endpoint de inventario real hoy).
//   2. POST /api/returns — real.
//   3. POST /api/returns/{id}/qr-code — real.
// El resultado real se le devuelve al modelo como mensaje de rol "tool" para que anuncie el
// resultado de forma natural, en vez de que el modelo invente o asuma ese resultado.
const SIZE_CHANGE_TOOL_NAME = 'iniciar_cambio_de_talla';

// Tope de rebotes modelo→tool→modelo dentro de un solo turno de usuario, por si el modelo
// insistiera en encadenar tool calls — no debería alcanzarse en el uso normal de la demo.
const MAX_TOOL_ITERATIONS = 4;

let messageCounter = 0;
function nextId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

function friendlyErrorMessage(error: unknown): string {
  if (error instanceof ConciergeProxyError || error instanceof ReturnsApiError) {
    return error.message;
  }
  return 'Ocurrió un problema inesperado al hablar con el concierge.';
}

export function useConciergeChat() {
  const { caseState, setReturnRequest, setQrCode, setReservation } = useAppState();
  const [uiMessages, setUiMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [status, setStatus] = useState<ConciergeStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  // Leído dentro de callbacks async sin forzar recrearlos en cada render de caseState.
  const caseStateRef = useRef(caseState);
  caseStateRef.current = caseState;

  const pushUi = useCallback((author: ChatMessage['author'], text: string, attachConfirmation = false) => {
    setUiMessages((prev) => [...prev, { id: nextId(), author, text, attachConfirmation }]);
  }, []);

  /** Ejecuta la tool `iniciar_cambio_de_talla`: llamadas reales, en el mismo orden que antes. */
  const executeSizeChangeTool = useCallback(
    async (toolCallId: string): Promise<{ result: ConversationMessage; succeeded: boolean }> => {
      const current = caseStateRef.current;
      if (current.reservation && current.qrCode) {
        // Ya se completó antes en esta misma conversación — no repetir POST /api/returns.
        return {
          succeeded: true,
          result: {
            role: 'tool',
            tool_call_id: toolCallId,
            name: SIZE_CHANGE_TOOL_NAME,
            content: JSON.stringify({
              exito: true,
              yaCompletadoAntes: true,
              reserva: current.reservation,
              qr: { token: current.qrCode.token, expiraUtc: current.qrCode.expiresAtUtc },
            }),
          },
        };
      }

      try {
        pushUi('system', `Reservando talla ${sofiaOrder.requestedSize} en ${POLANCO_STORE}...`);
        const reservation = await reserveReplacementSize(sofiaOrder.requestedSize, POLANCO_STORE);
        setReservation(reservation, POLANCO_STORE);

        pushUi('system', 'Validando elegibilidad con Returns Orchestrator...');
        const returnRequest = await startReturnRequest(sofiaOrder);
        setReturnRequest(returnRequest);

        pushUi('system', 'Generando tu código QR para la tienda (vigencia 72 horas)...');
        const qrCode = await generateQrCode(returnRequest.id);
        setQrCode(qrCode);

        return {
          succeeded: true,
          result: {
            role: 'tool',
            tool_call_id: toolCallId,
            name: SIZE_CHANGE_TOOL_NAME,
            content: JSON.stringify({
              exito: true,
              reserva: reservation,
              elegibilidad: returnRequest.eligibilityStatus,
              returnRequestId: returnRequest.id,
              qr: { token: qrCode.token, expiraUtc: qrCode.expiresAtUtc },
            }),
          },
        };
      } catch (error) {
        const message = friendlyErrorMessage(error);
        setErrorMessage(message);
        return {
          succeeded: false,
          result: {
            role: 'tool',
            tool_call_id: toolCallId,
            name: SIZE_CHANGE_TOOL_NAME,
            content: JSON.stringify({ exito: false, error: message }),
          },
        };
      }
    },
    [pushUi, setQrCode, setReservation, setReturnRequest],
  );

  const executeToolCalls = useCallback(
    async (toolCalls: ToolCall[]): Promise<{ results: ConversationMessage[]; anySucceeded: boolean }> => {
      const results: ConversationMessage[] = [];
      let anySucceeded = false;

      for (const call of toolCalls) {
        if (call.function.name !== SIZE_CHANGE_TOOL_NAME) {
          results.push({
            role: 'tool',
            tool_call_id: call.id,
            name: call.function.name,
            content: JSON.stringify({ error: `Herramienta desconocida: ${call.function.name}` }),
          });
          continue;
        }

        const { result, succeeded } = await executeSizeChangeTool(call.id);
        results.push(result);
        anySucceeded = anySucceeded || succeeded;
      }

      return { results, anySucceeded };
    },
    [executeSizeChangeTool],
  );

  /**
   * Corre el ciclo modelo → (tool → modelo)* hasta que el modelo responda solo con texto (sin
   * más tool_calls), o hasta agotar MAX_TOOL_ITERATIONS.
   */
  const runTurn = useCallback(
    async (startingHistory: ConversationMessage[]) => {
      setStatus('sending');
      setErrorMessage(null);
      let workingHistory = startingHistory;
      // true si el mensaje de texto del asistente que sigue debe llevar <ConfirmationScreen />
      // debajo (porque acaba de llegar el resultado real y exitoso de la tool).
      let attachConfirmationToNextMessage = false;

      try {
        for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
          const assistantMessage = await sendConciergeTurn(workingHistory, sofiaOrder);
          workingHistory = [...workingHistory, assistantMessage];

          if (assistantMessage.content) {
            pushUi('concierge', assistantMessage.content, attachConfirmationToNextMessage);
            attachConfirmationToNextMessage = false;
          }

          const toolCalls = assistantMessage.tool_calls ?? [];
          if (toolCalls.length === 0) {
            break;
          }

          setStatus('executing-tool');
          const { results, anySucceeded } = await executeToolCalls(toolCalls);
          workingHistory = [...workingHistory, ...results];
          setStatus('sending');
          attachConfirmationToNextMessage = anySucceeded;
        }

        setHistory(workingHistory);
        setStatus('idle');
      } catch (error) {
        const message = friendlyErrorMessage(error);
        setErrorMessage(message);
        pushUi('system', `No pude completar la solicitud: ${message}`);
        setHistory(workingHistory);
        setStatus('error');
      }
    },
    [executeToolCalls, pushUi],
  );

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Turno de apertura: historial vacío + system prompt (armado en el proxy) instruye al modelo
    // a saludar y preguntar proactivamente, sin esperar a que la clienta escriba primero.
    void runTurn([]);
  }, [runTurn]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'sending' || status === 'executing-tool') return;

      pushUi('sofia', trimmed);
      const nextHistory: ConversationMessage[] = [...history, { role: 'user', content: trimmed }];
      setHistory(nextHistory);
      void runTurn(nextHistory);
    },
    [history, pushUi, runTurn, status],
  );

  const isBusy = status === 'sending' || status === 'executing-tool';

  return {
    messages: uiMessages,
    status,
    isBusy,
    errorMessage,
    start,
    sendMessage,
  };
}
