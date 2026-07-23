import { cn } from "../../../lib/cn";
import { formatCurrencyMxn } from "../../../lib/format-currency";
import { requiresFraudReviewContext } from "../../../lib/fraud-review-rule";
import { useReturnCases } from "../hooks/ReturnCasesContext";
import { INSPECTION_LABELS } from "../status-labels";
import { Badge } from "../../../components/ui/Badge";

export function CaseQueueList() {
  const { cases, selectedCaseId, selectCase } = useReturnCases();

  if (cases.length === 0) {
    return (
      <div
        data-testid="case-queue-empty-state"
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--p-border)] p-8 text-center"
      >
        <p className="text-sm text-[var(--p-text-secondary)]">
          Aún no hay casos cargados en esta sesión.
        </p>
        <p className="text-xs text-[var(--p-text-muted)]">
          Usa "Cargar casos de ejemplo" para crear casos reales vía la API.
        </p>
      </div>
    );
  }

  return (
    <ul data-testid="case-queue-list" className="flex flex-col gap-2">
      {cases.map((c) => {
        const inspection = INSPECTION_LABELS[c.storeInspectionStatus];
        const isSelected = c.id === selectedCaseId;
        return (
          <li key={c.id}>
            <button
              type="button"
              data-testid={`case-queue-item-${c.id}`}
              onClick={() => selectCase(c.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                isSelected
                  ? "border-[var(--p-gold)] bg-[var(--p-gold-soft)]"
                  : "border-[var(--p-border)] bg-[var(--p-surface)] hover:bg-[var(--p-overlay)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[var(--p-text)]">
                  {c.orderId}
                </span>
                {requiresFraudReviewContext(c.purchaseAmount) && (
                  <span
                    data-testid={`case-queue-item-${c.id}-high-value-flag`}
                    className="text-[var(--p-gold)]"
                    title="Monto superior a MXN $25,000"
                  >
                    ★
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-[var(--p-text-secondary)]">
                {c.customerId}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--p-text-secondary)]">
                  {formatCurrencyMxn(c.purchaseAmount)}
                </span>
                <Badge tone={inspection.tone} testId={`case-queue-item-${c.id}-status-badge`}>
                  {inspection.label}
                </Badge>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
