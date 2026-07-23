/**
 * Tipos que reflejan, campo por campo, los DTOs reales de Palacio.Returns.Api
 * (src/Palacio.Returns.Api/DTOs). No inventar campos que no existan en el backend.
 *
 * Nomenclatura: ASP.NET Core serializa records de C# a JSON con camelCase por defecto
 * (System.Text.Json), de ahí que `Token`/`ExpiresAtUtc` del record C# se reciban aquí
 * como `token`/`expiresAtUtc`.
 */

// Coincide con CreateReturnRequestDto
export interface CreateReturnRequestDto {
  orderId: string;
  customerId: string;
  productCategory: string;
  purchaseAmount: number;
}

// Coincide con ReturnRequestResponseDto — los *Status son strings porque el controller
// llama a `.ToString()` sobre los enums de dominio antes de mapear a DTO.
export interface ReturnRequestResponseDto {
  id: string;
  orderId: string;
  customerId: string;
  productCategory: string;
  purchaseAmount: number;
  eligibilityStatus: 'Pending' | 'Eligible' | 'NotEligible';
  storeInspectionStatus: 'NotReceived' | 'Received' | 'Approved' | 'Rejected';
  fraudReviewStatus: 'NotRequired' | 'Pending' | 'Cleared' | 'Blocked';
  refundStatus: 'NotStarted' | 'Approved' | 'Denied' | 'Processed';
}

// Coincide con QrCodeResponseDto(string Token, DateTime ExpiresAtUtc)
export interface QrCodeResponseDto {
  token: string;
  expiresAtUtc: string;
}
