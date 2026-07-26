import { useState, type FormEvent } from "react";
import { useReturnCases } from "../hooks/ReturnCasesContext";

/**
 * Búsqueda real por folio/ID vía GET /api/returns/{id} — trae el caso real que una clienta creó
 * desde Mi Palacio (o cualquier otro caso existente) para que el asociado pueda procesarlo.
 */
export function FolioSearchInput() {
  const { searchFolio, isSearchingFolio, folioNotFound } = useReturnCases();
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void searchFolio(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/50 px-3 py-2">
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
          value={value}
          onChange={(event) => setValue(event.target.value)}
          data-testid="folio-search-input"
          className="w-56 bg-transparent text-sm text-[var(--p-text)] placeholder:text-[var(--p-text-muted)] outline-none"
        />
        <button
          type="submit"
          disabled={isSearchingFolio || !value.trim()}
          data-testid="folio-search-submit-button"
          className="rounded-full bg-[var(--p-gold-soft)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--p-gold)] transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearchingFolio ? "Buscando…" : "Buscar"}
        </button>
      </div>
      {folioNotFound && (
        <span className="text-xs text-red-600" data-testid="folio-search-not-found">
          No se encontró ese folio.
        </span>
      )}
    </form>
  );
}
