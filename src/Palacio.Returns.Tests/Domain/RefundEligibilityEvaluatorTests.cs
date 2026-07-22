using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Tests.Domain;

public class RefundEligibilityEvaluatorTests
{
    [Fact]
    public void ReceivedItem_IsApprovedForRefund()
    {
        var request = new ReturnRequest
        {
            Id = Guid.NewGuid(),
            OrderId = "ORD-1",
            CustomerId = "CUST-1",
            ProductCategory = "Fashion",
            PurchaseAmount = 1200m,
            RequestedAt = DateTime.UtcNow,
            EligibilityStatus = EligibilityStatus.Eligible,
            StoreInspectionStatus = StoreInspectionStatus.Received,
            FraudReviewStatus = FraudReviewStatus.NotRequired,
            RefundStatus = RefundStatus.NotStarted
        };

        Assert.True(RefundEligibilityEvaluator.IsRefundApproved(request));
    }
}
