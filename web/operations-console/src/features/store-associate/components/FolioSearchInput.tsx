import { Tooltip } from "../../../components/ui/Tooltip";

// TODO(demo-live-build): se conecta a GET /api/returns/{id} durante la presentación en vivo.
// El backend hoy NO expone ningún endpoint GET (es intencional — se construye en vivo con
// GitHub Copilot como clímax de la demo, junto con Mi Palacio). Por eso este input existe
// visualmente pero está deshabilitado: no dispara ninguna llamada de red.
export function FolioSearchInput() {
  return (
    <div className="flex items-center gap-2">
      <Tooltip label="Próximamente: se conectará a GET /api/returns/{id} durante la demo en vivo">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--p-border)] bg-[var(--p-overlay)]/50 px-3 py-2">
          <svg
            className="h-4 w-4 text-[var(--p-text-muted)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por folio / ID de caso…"
            disabled
            data-testid="folio-search-input"
            className="w-56 bg-transparent text-sm text-[var(--p-text-muted)] placeholder:text-[var(--p-text-muted)] outline-none disabled:cursor-not-allowed"
          />
          <span
            data-testid="folio-search-coming-soon-badge"
            className="rounded-full bg-[var(--p-gold-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--p-gold)]"
          >
            Próximamente
          </span>
        </div>
      </Tooltip>
    </div>
  );
}
