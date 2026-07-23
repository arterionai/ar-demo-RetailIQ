export type ChatAuthor = 'sofia' | 'concierge' | 'system';

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
}

export type ConciergeFlowPhase =
  | 'greeting'
  | 'awaiting-start-decision'
  | 'reserving-size'
  | 'validating-eligibility'
  | 'issuing-qr'
  | 'ready-for-confirmation'
  | 'declined'
  | 'error';
