export function TypingIndicator() {
  return (
    <div className="flex justify-start" data-testid="chat-typing-indicator">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-palacio-gold/30 bg-white px-4 py-3">
        <span className="palacio-typing-dot h-1.5 w-1.5 rounded-full bg-palacio-gold-dark" />
        <span
          className="palacio-typing-dot h-1.5 w-1.5 rounded-full bg-palacio-gold-dark"
          style={{ animationDelay: '0.15s' }}
        />
        <span
          className="palacio-typing-dot h-1.5 w-1.5 rounded-full bg-palacio-gold-dark"
          style={{ animationDelay: '0.3s' }}
        />
      </div>
    </div>
  );
}
