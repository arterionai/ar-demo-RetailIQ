interface PalacioMonogramProps {
  className?: string;
}

/**
 * Monograma inline original para esta demo — no reproduce ningún logo real de
 * Palacio de Hierro (docs/constitution.md §7.2). Es una "P" estilizada sobre un rombo.
 */
export function PalacioMonogram({ className }: PalacioMonogramProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Mi Palacio"
    >
      <rect x="4" y="4" width="40" height="40" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M18 14h7.5c4.14 0 7.5 2.91 7.5 6.5s-3.36 6.5-7.5 6.5H21v7h-3V14zm3 3v7h4.5c2.35 0 4.5-1.42 4.5-3.5S27.85 17 25.5 17H21z"
        fill="currentColor"
      />
    </svg>
  );
}
