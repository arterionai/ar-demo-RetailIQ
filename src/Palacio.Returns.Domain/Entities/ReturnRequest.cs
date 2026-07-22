using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Domain.Entities;

public class ReturnRequest
{
    public Guid Id { get; init; }
    public string OrderId { get; init; } = default!;
    public string CustomerId { get; init; } = default!;
    public string ProductCategory { get; init; } = default!;
    public decimal PurchaseAmount { get; init; }
    public DateTime RequestedAt { get; init; }

    public EligibilityStatus EligibilityStatus { get; set; }
    public StoreInspectionStatus StoreInspectionStatus { get; set; }
    public FraudReviewStatus FraudReviewStatus { get; set; }
    public RefundStatus RefundStatus { get; set; }

    /// <summary>
    /// Folio de devolución en SAP. Se asigna únicamente tras la aprobación de inspección
    /// (ver ISapFolioClient) — nunca al iniciar la devolución.
    /// </summary>
    public string? SapFolioNumber { get; set; }
}
