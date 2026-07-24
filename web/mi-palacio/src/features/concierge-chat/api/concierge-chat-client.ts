import type { ConversationMessage } from '../types';
import type { OrderFixture } from '../../../lib/order-fixture';

// El proxy propio (web/mi-palacio/server/) es lo único que conoce la API key de Azure OpenAI —
// nunca llega al frontend. Corre en 5176 (5175 ya estaba ocupado por otro proyecto en este
// entorno de desarrollo; ver server/README.md).
const CONCIERGE_PROXY_URL = import.meta.env.VITE_CONCIERGE_PROXY_URL ?? 'http://localhost:5176';

export class ConciergeProxyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConciergeProxyError';
  }
}

/**
 * Envía el historial completo de la conversación (estilo OpenAI) más los hechos de la orden
 * actual al proxy, y regresa el siguiente turno del asistente (puede traer `content`,
 * `tool_calls`, o ambos). El proxy agrega el system prompt — el frontend nunca lo construye para
 * evitar que la personalidad/reglas de negocio del concierge diverjan en dos lugares.
 */
export async function sendConciergeTurn(
  messages: ConversationMessage[],
  order: OrderFixture,
): Promise<ConversationMessage> {
  let response: Response;
  try {
    response = await fetch(`${CONCIERGE_PROXY_URL}/api/concierge/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, order }),
    });
  } catch {
    throw new ConciergeProxyError(
      `No se pudo contactar al proxy del concierge en ${CONCIERGE_PROXY_URL}. Verifica que esté ` +
        'corriendo (npm start en web/mi-palacio/server).',
    );
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ConciergeProxyError(
      (detail && typeof detail.error === 'string' && detail.error) ||
        `El proxy del concierge respondió ${response.status}.`,
    );
  }

  const data = (await response.json()) as { message: ConversationMessage };
  return data.message;
}
