using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Domain.Services;

public static class RefundEligibilityEvaluator
{
    public static bool IsRefundApproved(ReturnRequest request)
    {
        return request.StoreInspectionStatus == StoreInspectionStatus.Approved
            && request.FraudReviewStatus != FraudReviewStatus.Blocked;
    }
}
