interface DressIllustrationProps {
  className?: string;
}

/**
 * Ilustración vectorial original de un vestido de gala — no es una fotografía ni un asset
 * de terceros. Sirve como marcador visual del producto en el prototipo.
 */
export function DressIllustration({ className }: DressIllustrationProps) {
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label="Vestido de gala Midnight">
      <defs>
        <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A2622" />
          <stop offset="100%" stopColor="#12100E" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="200" height="260" fill="#F8F3E9" />
      {/* torso */}
      <path
        d="M80 40 C80 30 120 30 120 40 L128 100 C160 130 168 210 150 250 L50 250 C32 210 40 130 72 100 Z"
        fill="url(#dressGrad)"
      />
      {/* escote */}
      <path d="M84 40 Q100 55 116 40" fill="none" stroke="#B6893F" strokeWidth="2" />
      {/* bordado dorado */}
      <g stroke="#B6893F" strokeWidth="1.2" fill="none" opacity="0.9">
        <path d="M70 110 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0" />
        <path d="M62 140 q12 -10 24 0 q12 10 24 0 q12 -10 24 0" />
        <circle cx="100" cy="95" r="3" fill="#B6893F" stroke="none" />
        <circle cx="86" cy="102" r="2" fill="#D8B978" stroke="none" />
        <circle cx="114" cy="102" r="2" fill="#D8B978" stroke="none" />
      </g>
      {/* cinturon */}
      <rect x="70" y="118" width="60" height="6" rx="3" fill="#B6893F" />
    </svg>
  );
}
