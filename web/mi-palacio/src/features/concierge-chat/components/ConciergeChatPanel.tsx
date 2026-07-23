import { useEffect, useRef } from 'react';
import { useConciergeFlow } from '../hooks/useConciergeFlow';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ConfirmationScreen } from './ConfirmationScreen';
import { useAppState } from '../../../lib/app-state';

interface ConciergeChatPanelProps {
  onClose: () => void;
}

const BUSY_PHASES = new Set(['reserving-size', 'validating-eligibility', 'issuing-qr']);

export function ConciergeChatPanel({ onClose }: ConciergeChatPanelProps) {
  const { messages, phase, errorMessage, start, acceptExchange, decline } = useConciergeFlow();
  const { caseState, goTo } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void start();
  }, [start]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  const isBusy = BUSY_PHASES.has(phase);
  const showChoiceButtons = phase === 'awaiting-start-decision';
  const showConfirmation = phase === 'ready-for-confirmation' && caseState.reservation && caseState.qrCode;

  const handleViewStatus = () => {
    goTo('return-status');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40"
      data-testid="concierge-chat-overlay"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-palacio-cream shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        data-testid="concierge-chat-panel"
      >
        <div className="flex items-center justify-between border-b border-palacio-gold/30 bg-palacio-black px-5 py-4 text-palacio-cream">
          <div>
            <p className="font-serif text-lg">Concierge Postcompra</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-palacio-gold/80">
              Aquí para resolverlo contigo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar concierge"
            data-testid="close-concierge-button"
            className="rounded-full p-1.5 text-palacio-cream/70 transition hover:bg-white/10 hover:text-palacio-cream"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isBusy && <TypingIndicator />}

          {showConfirmation && caseState.reservation && caseState.qrCode && (
            <ConfirmationScreen
              reservation={caseState.reservation}
              qrCode={caseState.qrCode}
              onViewStatus={handleViewStatus}
            />
          )}

          {errorMessage && (
            <p
              className="rounded-sm border border-red-300 bg-red-50 p-3 text-xs text-red-700"
              data-testid="concierge-error-message"
            >
              {errorMessage}
            </p>
          )}
        </div>

        {showChoiceButtons && (
          <div className="flex gap-3 border-t border-palacio-gold/20 px-5 py-4">
            <button
              type="button"
              onClick={() => void acceptExchange()}
              data-testid="accept-exchange-button"
              className="flex-1 rounded-sm bg-palacio-black px-4 py-3 text-sm font-medium uppercase tracking-[0.1em] text-palacio-cream transition hover:bg-palacio-charcoal"
            >
              Sí, iniciar el cambio
            </button>
            <button
              type="button"
              onClick={decline}
              data-testid="decline-exchange-button"
              className="flex-1 rounded-sm border border-palacio-ink/20 px-4 py-3 text-sm font-medium uppercase tracking-[0.1em] text-palacio-ink transition hover:bg-palacio-cream-dark"
            >
              No, gracias
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
