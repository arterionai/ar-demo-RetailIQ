namespace Palacio.Returns.Api.DTOs;

public record CreateReturnRequestDto(
    string OrderId,
    string CustomerId,
    string ProductCategory,
    decimal PurchaseAmount);
