import type { ReactNode } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { formatCurrencyMxn } from "../../../lib/format-currency";
import {
  FRAUD_REVIEW_THRESHOLD_MXN,
  requiresFraudReviewContext,
} from "../../../lib/fraud-review-rule";
import { useReturnCases } from "../hooks/ReturnCasesContext";
import {
  ELIGIBILITY_LABELS,
  FRAUD_LABELS,
  INSPECTION_LABELS,
  REFUND_LABELS,
} from "../status-labels";

export function CaseDetailPanel() {
  const { cases, selectedCaseId, receiveItem, submitInspection, pendingActionId } =
    useReturnCases();

  const selected = cases.find((c) => c.id === selectedCaseId);

  if (!selected) {
    return (
      <Card
        data-testid="case-detail-empty-state"
        className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center"
      >
        <p className="text-sm text-[var(--p-text-secondary)]">
          Selecciona un caso de la cola para ver el detalle.
        </p>
      </Card>
    );
  }

  const isPending = pendingActionId === selected.id;
  const canReceive = selected.storeInspectionStatus === "NotReceived";
  const canDecideInspection = selected.storeInspectionStatus === "Received";
  const isHighValue = requiresFraudReviewContext(selected.purchaseAmount);

  const eligibility = ELIGIBILITY_LABELS[selected.eligibilityStatus];
  const inspection = INSPECTION_LABELS[selected.storeInspectionStatus];
  const fraud = FRAUD_LABELS[selected.fraudReviewStatus];
  const refund = REFUND_LABELS[selected.refundStatus];

  return (
    <Card data-testid="case-detail-panel" className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1 border-b border-[var(--p-border)] pb-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--p-text)]">
            Orden {selected.orderId}
          </h2>
          <span
            data-testid="case-detail-amount"
            className="text-lg font-semibold text-[var(--p-gold)]"
          >
            {formatCurrencyMxn(selected.purchaseAmount)}
          </span>
        </div>
        <p className="text-sm text-[var(--p-text-secondary)]" data-testid="case-detail-customer">
          Cliente: {selected.customerId}
        </p>
        <p className="text-xs text-[var(--p-text-muted)]" data-testid="case-detail-category">
          Categoría: {selected.productCategory} · Folio interno {selected.id.slice(0, 8)}
        </p>
      </header>

      {isHighValue && (
        <div
          data-testid="fraud-review-context-banner"
          className="rounded-lg border border-[rgba(210,153,34,0.4)] bg-[rgba(210,153,34,0.08)] px-4 py-3 text-sm text-[var(--p-yellow)]"
        >
          <p className="font-medium">¿Por qué este caso requiere revisión?</p>
          <p className="mt-1 text-[var(--p-text-secondary)]">
            El importe ({formatCurrencyMxn(selected.purchaseAmount)}) supera{" "}
            {formatCurrencyMxn(FRAUD_REVIEW_THRESHOLD_MXN)} y el producto pertenece a una
            categoría de alto valor. La política vigente exige validación física y revisión
            adicional (réplica de la regla real de{" "}
            <code className="text-xs">RefundEligibilityEvaluator</code>).
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatusCell label="Elegibilidad" testId="case-detail-eligibility-status">
          <Badge tone={eligibility.tone}>{eligibility.label}</Badge>
        </StatusCell>
        <StatusCell label="Inspección" testId="case-detail-inspection-status">
          <Badge tone={inspection.tone}>{inspection.label}</Badge>
        </StatusCell>
        <StatusCell label="Revisión de fraude" testId="case-detail-fraud-status">
          <Badge tone={fraud.tone}>{fraud.label}</Badge>
        </StatusCell>
        <StatusCell label="Reembolso" testId="case-detail-refund-status">
          <Badge tone={refund.tone}>{refund.label}</Badge>
        </StatusCell>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--p-border)] pt-4">
        <Button
          variant="secondary"
          disabled={!canReceive}
          loading={isPending && canReceive}
          onClick={() => void receiveItem(selected.id)}
          data-testid="receive-item-button"
        >
          Recibir artículo
        </Button>
        <Button
          variant="primary"
          disabled={!canDecideInspection}
          loading={isPending && canDecideInspection}
          onClick={() => void submitInspection(selected.id, true)}
          data-testid="approve-inspection-button"
        >
          Aprobar inspección
        </Button>
        <Button
          variant="danger"
          disabled={!canDecideInspection}
          loading={isPending && canDecideInspection}
          onClick={() => void submitInspection(selected.id, false)}
          data-testid="reject-inspection-button"
        >
          Rechazar inspección
        </Button>
      </div>

      {selected.storeInspectionStatus === "Approved" && (
        <p
          data-testid="case-detail-final-note"
          className="text-xs text-[var(--p-text-muted)]"
        >
          Inspección finalizada. {refund.label.toLowerCase()}.
        </p>
      )}
      {selected.storeInspectionStatus === "Rejected" && (
        <p
          data-testid="case-detail-final-note"
          className="text-xs text-[var(--p-text-muted)]"
        >
          Inspección rechazada. El reembolso no procede para este artículo.
        </p>
      )}
    </Card>
  );
}

function StatusCell({
  label,
  testId,
  children,
}: {
  label: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-1.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-3"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}
