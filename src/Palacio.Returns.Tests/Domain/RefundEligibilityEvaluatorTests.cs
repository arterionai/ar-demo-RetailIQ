using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Tests.Domain;

public class RefundEligibilityEvaluatorTests
{
    private static ReturnRequest CreateRequest(
        StoreInspectionStatus storeInspectionStatus,
        FraudReviewStatus fraudReviewStatus = FraudReviewStatus.NotRequired,
        decimal purchaseAmount = 1200m) => new()
    {
        Id = Guid.NewGuid(),
        OrderId = "ORD-1",
        CustomerId = "CUST-1",
        ProductCategory = "Fashion",
        PurchaseAmount = purchaseAmount,
        RequestedAt = DateTime.UtcNow,
        EligibilityStatus = EligibilityStatus.Eligible,
        StoreInspectionStatus = storeInspectionStatus,
        FraudReviewStatus = fraudReviewStatus,
        RefundStatus = RefundStatus.NotStarted
    };

    [Fact]
    public void Regression_Nov2025Incident_ReceivedWithoutInspectionApproval_IsNotApproved()
    {
        // Ver docs/runbooks/incident-2025-11-return-fraud.md: recibido en tienda no equivale
        // a inspección aprobada.
        var request = CreateRequest(StoreInspectionStatus.Received);

        Assert.False(RefundEligibilityEvaluator.IsRefundApproved(request));
    }

    [Fact]
    public void InspectionApprovedAndFraudNotRequired_IsApproved()
    {
        var request = CreateRequest(StoreInspectionStatus.Approved);

        Assert.True(RefundEligibilityEvaluator.IsRefundApproved(request));
    }

    [Fact]
    public void InspectionApprovedButFraudBlocked_IsNotApproved()
    {
        var request = CreateRequest(StoreInspectionStatus.Approved, FraudReviewStatus.Blocked);

        Assert.False(RefundEligibilityEvaluator.IsRefundApproved(request));
    }
}
