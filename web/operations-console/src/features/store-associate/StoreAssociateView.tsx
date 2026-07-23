import { CaseDetailPanel } from "./components/CaseDetailPanel";
import { CaseQueueList } from "./components/CaseQueueList";
import { FolioSearchInput } from "./components/FolioSearchInput";
import { LoadSampleCasesButton } from "./components/LoadSampleCasesButton";
import { ReturnCasesProvider, useReturnCases } from "./hooks/ReturnCasesContext";

function StoreAssociateContent() {
  const { actionError, dismissError, cases } = useReturnCases();

  return (
    <div data-testid="store-associate-view" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--p-text)]">
            Devoluciones en tienda
          </h1>
          <p className="text-sm text-[var(--p-text-secondary)]">
            Procesa artículos devueltos: recepción física e inspección.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FolioSearchInput />
          <LoadSampleCasesButton />
        </div>
      </div>

      {actionError && (
        <div
          data-testid="action-error-banner"
          className="flex items-start justify-between gap-3 rounded-lg border border-[rgba(248,81,73,0.4)] bg-[rgba(248,81,73,0.08)] px-4 py-3 text-sm text-[var(--p-red)]"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={dismissError}
            data-testid="dismiss-action-error-button"
            className="shrink-0 text-xs font-semibold underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
            Cola de casos ({cases.length})
          </h3>
          <CaseQueueList />
        </div>
        <CaseDetailPanel />
      </div>
    </div>
  );
}

export function StoreAssociateView() {
  return (
    <ReturnCasesProvider>
      <StoreAssociateContent />
    </ReturnCasesProvider>
  );
}
