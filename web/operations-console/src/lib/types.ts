/**
 * Tipos que reflejan los contratos reales de Palacio.Returns.Api (ver src/Palacio.Returns.Api/DTOs).
 * Se nombran igual que su contraparte en C# para trazabilidad (ver docs/constitution.md §3.3).
 */

export type EligibilityStatus = "Pending" | "Eligible" | "NotEligible";

export type StoreInspectionStatus =
  | "NotReceived"
  | "Received"
  | "Approved"
  | "Rejected";

export type FraudReviewStatus = "NotRequired" | "Pending" | "Cleared" | "Blocked";

export type RefundStatus = "NotStarted" | "Approved" | "Denied" | "Processed";

/** Refleja Api/DTOs/CreateReturnRequestDto.cs */
export interface CreateReturnRequestDto {
  orderId: string;
  customerId: string;
  productCategory: string;
  purchaseAmount: number;
}

/** Refleja Api/DTOs/InspectionDecisionDto.cs */
export interface InspectionDecisionDto {
  approved: boolean;
}

/** Refleja Api/DTOs/ReturnRequestResponseDto.cs */
export interface ReturnRequestResponseDto {
  id: string;
  orderId: string;
  customerId: string;
  productCategory: string;
  purchaseAmount: number;
  eligibilityStatus: EligibilityStatus;
  storeInspectionStatus: StoreInspectionStatus;
  fraudReviewStatus: FraudReviewStatus;
  refundStatus: RefundStatus;
}
