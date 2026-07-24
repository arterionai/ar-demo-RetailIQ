import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useConciergeChat } from '../hooks/useConciergeChat';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ConfirmationScreen } from './ConfirmationScreen';
import { useAppState } from '../../../lib/app-state';

interface ConciergeChatPanelProps {
  onClose: () => void;
}

export function ConciergeChatPanel({ onClose }: ConciergeChatPanelProps) {
  const { messages, isBusy, errorMessage, start, sendMessage } = useConciergeChat();
  const { caseState, goTo } = useAppState();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isBusy]);

  useEffect(() => {
    if (!isBusy) {
      inputRef.current?.focus();
    }
  }, [isBusy]);

  const hasReadyReservation = Boolean(caseState.reservation && caseState.qrCode);

  const handleViewStatus = () => {
    goTo('return-status');
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || isBusy) return;
    sendMessage(draft);
    setDraft('');
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
            <p className="font-serif text-lg italic">Concierge Postcompra</p>
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

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
          role="log"
          aria-live="polite"
          aria-label="Conversación con el Concierge Postcompra"
          data-testid="concierge-message-log"
        >
          {messages.map((message) => (
            <div key={message.id}>
              <ChatBubble message={message} />
              {message.attachConfirmation && hasReadyReservation && caseState.reservation && caseState.qrCode && (
                <div className="mt-3">
                  <ConfirmationScreen
                    reservation={caseState.reservation}
                    qrCode={caseState.qrCode}
                    onViewStatus={handleViewStatus}
                  />
                </div>
              )}
            </div>
          ))}

          {isBusy && <TypingIndicator />}

          {errorMessage && (
            <p
              className="rounded-sm border border-red-300 bg-red-50 p-3 text-xs text-red-700"
              data-testid="concierge-error-message"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-palacio-gold/20 bg-white px-4 py-3"
          data-testid="concierge-message-form"
        >
          <label htmlFor="concierge-message-input" className="sr-only">
            Escribe tu mensaje para el Concierge Postcompra
          </label>
          <input
            id="concierge-message-input"
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isBusy}
            autoComplete="off"
            data-testid="concierge-message-input"
            className="flex-1 rounded-full border border-palacio-ink/15 bg-palacio-cream px-4 py-2.5 text-sm text-palacio-ink placeholder:text-palacio-muted focus:border-palacio-gold focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isBusy || !draft.trim()}
            data-testid="send-message-button"
            className="rounded-full bg-palacio-black px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-palacio-cream transition hover:bg-palacio-charcoal disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
