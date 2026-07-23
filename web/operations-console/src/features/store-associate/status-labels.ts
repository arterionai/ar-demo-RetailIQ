import type { BadgeTone } from "../../components/ui/Badge";
import type {
  EligibilityStatus,
  FraudReviewStatus,
  RefundStatus,
  StoreInspectionStatus,
} from "../../lib/types";

export const ELIGIBILITY_LABELS: Record<EligibilityStatus, { label: string; tone: BadgeTone }> = {
  Pending: { label: "Elegibilidad pendiente", tone: "neutral" },
  Eligible: { label: "Elegible", tone: "green" },
  NotEligible: { label: "No elegible", tone: "red" },
};

export const INSPECTION_LABELS: Record<
  StoreInspectionStatus,
  { label: string; tone: BadgeTone }
> = {
  NotReceived: { label: "No recibido", tone: "neutral" },
  Received: { label: "Recibido en tienda", tone: "blue" },
  Approved: { label: "Inspección aprobada", tone: "green" },
  Rejected: { label: "Inspección rechazada", tone: "red" },
};

export const FRAUD_LABELS: Record<FraudReviewStatus, { label: string; tone: BadgeTone }> = {
  NotRequired: { label: "Sin revisión de fraude", tone: "neutral" },
  Pending: { label: "Revisión de fraude pendiente", tone: "yellow" },
  Cleared: { label: "Fraude: sin hallazgos", tone: "green" },
  Blocked: { label: "Bloqueado por fraude", tone: "red" },
};

export const REFUND_LABELS: Record<RefundStatus, { label: string; tone: BadgeTone }> = {
  NotStarted: { label: "Reembolso no iniciado", tone: "neutral" },
  Approved: { label: "Reembolso aprobado", tone: "green" },
  Denied: { label: "Reembolso denegado", tone: "red" },
  Processed: { label: "Reembolso procesado", tone: "purple" },
};
