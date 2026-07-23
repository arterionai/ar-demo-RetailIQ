import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.author === 'system') {
    return (
      <div
        className="mx-auto max-w-[85%] rounded-full bg-palacio-cream-dark px-4 py-1.5 text-center text-xs text-palacio-muted"
        data-testid="chat-message-system"
      >
        {message.text}
      </div>
    );
  }

  const isSofia = message.author === 'sofia';

  return (
    <div
      className={`flex ${isSofia ? 'justify-end' : 'justify-start'}`}
      data-testid={isSofia ? 'chat-message-sofia' : 'chat-message-concierge'}
    >
      <div
        className={
          isSofia
            ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-palacio-black px-4 py-2.5 text-sm text-palacio-cream'
            : 'max-w-[80%] rounded-2xl rounded-bl-sm border border-palacio-gold/30 bg-white px-4 py-2.5 text-sm text-palacio-ink'
        }
      >
        {!isSofia && (
          <p className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-palacio-gold-dark">
            Concierge Postcompra
          </p>
        )}
        {message.text}
      </div>
    </div>
  );
}
