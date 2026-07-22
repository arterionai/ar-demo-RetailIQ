using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Domain.Services;

public static class RefundEligibilityEvaluator
{
    public const decimal FraudReviewThreshold = 25_000m;

    public static bool RequiresFraudReview(ReturnRequest request) =>
        request.PurchaseAmount > FraudReviewThreshold;

    public static bool IsRefundApproved(ReturnRequest request)
    {
        var inspectionApproved = request.StoreInspectionStatus == StoreInspectionStatus.Approved;
        var fraudNotBlocked = request.FraudReviewStatus != FraudReviewStatus.Blocked;
        var fraudReviewSatisfied = !RequiresFraudReview(request)
            || request.FraudReviewStatus == FraudReviewStatus.Cleared;

        return inspectionApproved && fraudNotBlocked && fraudReviewSatisfied;
    }
}
