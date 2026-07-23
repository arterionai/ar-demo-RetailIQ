/**
 * Réplica en cliente de la regla real de dominio (NO la reinventa con otro umbral).
 * Ver src/Palacio.Returns.Domain/Services/RefundEligibilityEvaluator.cs:
 *   public const decimal FraudReviewThreshold = 25_000m;
 *   public static bool RequiresFraudReview(ReturnRequest request) =>
 *       request.PurchaseAmount > FraudReviewThreshold; // estrictamente mayor a, no >=
 *
 * Esta constante existe SOLO para dar contexto narrativo en la UI (por qué un caso requiere
 * revisión adicional) antes de que el backend confirme el estado real de FraudReviewStatus.
 * La decisión de negocio real siempre la determina la API — este archivo nunca decide por sí
 * mismo si un reembolso se aprueba (ver ADR-014, docs/constitution.md §2.2).
 */
export const FRAUD_REVIEW_THRESHOLD_MXN = 25_000;

export function requiresFraudReviewContext(purchaseAmount: number): boolean {
  return purchaseAmount > FRAUD_REVIEW_THRESHOLD_MXN;
}
