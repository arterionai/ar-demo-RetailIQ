import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

/** Tooltip minimalista vía título nativo + estilo visual "próximamente". No requiere JS extra. */
export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="group relative inline-flex" title={label}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--p-border)] bg-[var(--p-overlay)] px-2.5 py-1.5 text-xs text-[var(--p-text-secondary)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
