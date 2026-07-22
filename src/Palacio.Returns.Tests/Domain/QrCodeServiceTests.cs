using System.Text;
using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Tests.Domain;

public class QrCodeServiceTests
{
    private static ReturnRequest CreateRequest() => new()
    {
        Id = Guid.NewGuid(),
        OrderId = "ORD-1",
        CustomerId = "CUST-1",
        ProductCategory = "Jewelry",
        PurchaseAmount = 30_000m,
        RequestedAt = DateTime.UtcNow,
        EligibilityStatus = EligibilityStatus.Eligible,
        StoreInspectionStatus = StoreInspectionStatus.NotReceived,
        FraudReviewStatus = FraudReviewStatus.Blocked,
        RefundStatus = RefundStatus.NotStarted
    };

    [Fact]
    public void QrPayload_DoesNotExposeFraudReviewStatus()
    {
        var service = new QrCodeService();
        var request = CreateRequest();

        var result = service.IssueReturnQrCode(request, DateTime.UtcNow);
        var decodedPayload = Encoding.UTF8.GetString(Convert.FromBase64String(result.Token));

        Assert.DoesNotContain("FraudReviewStatus", decodedPayload, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Blocked", decodedPayload, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void QrCode_ExpiresAfter72Hours()
    {
        var service = new QrCodeService();
        var request = CreateRequest();
        var issuedAt = new DateTime(2026, 7, 22, 10, 0, 0, DateTimeKind.Utc);

        var result = service.IssueReturnQrCode(request, issuedAt);

        Assert.Equal(issuedAt.AddHours(72), result.ExpiresAtUtc);
    }
}
