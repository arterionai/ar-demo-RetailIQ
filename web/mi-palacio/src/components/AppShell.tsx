import type { ReactNode } from 'react';
import { PalacioMonogram } from './PalacioMonogram';
import palacioLogo from '../assets/palacio-logo.svg';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-palacio-off-white">
      <header
        className="sticky top-0 z-40 border-b border-palacio-black/10 bg-palacio-white"
        data-testid="app-header"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            {/* SVG servido como <img> (Vite no transforma a componente inline sin
                vite-plugin-svgr) — el fill="currentColor" del archivo cae al negro
                por defecto de su propio contexto de render, que coincide con el
                ink real de marca (#181818). */}
            <img src={palacioLogo} alt="El Palacio de Hierro" className="h-6 w-auto sm:h-7" />
            <span className="hidden h-8 w-px bg-palacio-black/10 sm:block" aria-hidden="true" />
            <div className="hidden items-center gap-2 sm:flex">
              <PalacioMonogram className="h-5 w-5 text-palacio-gold-dark" />
              <div>
                <p className="font-serif text-sm italic leading-tight text-palacio-black">Mi Palacio</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-palacio-gold-dark">
                  Concierge de cliente
                </p>
              </div>
            </div>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-palacio-muted md:block">
            Comercio Digital
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-center text-xs text-palacio-muted">
        Prototipo de demostración — Proyecto Espejo / Inteligencia Palacio. Identidad visual de
        referencia acotada a fines de demo interna, sin relación con sistemas de producción.
      </footer>
    </div>
  );
}
