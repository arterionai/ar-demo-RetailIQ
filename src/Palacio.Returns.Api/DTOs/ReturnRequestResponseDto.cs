namespace Palacio.Returns.Api.DTOs;

public record ReturnRequestResponseDto(
    Guid Id,
    string OrderId,
    string CustomerId,
    string ProductCategory,
    decimal PurchaseAmount,
    string EligibilityStatus,
    string StoreInspectionStatus,
    string FraudReviewStatus,
    string RefundStatus);
