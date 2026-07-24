export type ChatAuthor = 'sofia' | 'concierge' | 'system';

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  /**
   * true cuando este mensaje es el anuncio de que la reserva + QR ya se generaron de verdad —
   * la UI renderiza <ConfirmationScreen /> justo debajo de este mensaje.
   */
  attachConfirmation?: boolean;
}

/** Roles del protocolo de chat completions estilo OpenAI que usa Azure OpenAI. */
export type ConversationRole = 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Mensaje en el historial de conversación que se envía/recibe del proxy (`server/`). Es el
 * historial "de verdad" que se reenvía completo en cada request — Azure OpenAI no guarda estado
 * entre llamadas. El system prompt NO vive aquí: lo agrega el proxy en cada request.
 */
export interface ConversationMessage {
  role: ConversationRole;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export type ConciergeStatus = 'idle' | 'sending' | 'executing-tool' | 'error';
