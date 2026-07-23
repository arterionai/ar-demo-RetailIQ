import type { ReactNode } from 'react';
import { PalacioMonogram } from './PalacioMonogram';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-palacio-cream">
      <header
        className="sticky top-0 z-40 border-b border-palacio-gold/30 bg-palacio-black text-palacio-cream"
        data-testid="app-header"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <PalacioMonogram className="h-8 w-8 text-palacio-gold" />
            <div>
              <p className="font-serif text-lg tracking-[0.15em]">MI PALACIO</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-palacio-gold/80">
                Concierge de cliente
              </p>
            </div>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-palacio-muted sm:block">
            Palacio de Hierro · Comercio Digital
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-center text-xs text-palacio-muted">
        Prototipo de demostración — Proyecto Espejo / Inteligencia Palacio. Datos e identidad
        visual ficticios, sin relación con sistemas de producción.
      </footer>
    </div>
  );
}
