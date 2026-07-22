using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;
using Palacio.Returns.Domain.Exceptions;

namespace Palacio.Returns.Domain.Services;

public class ReturnWorkflowService
{
    private readonly IReturnRequestRepository _repository;

    public ReturnWorkflowService(IReturnRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReturnRequest> InitiateReturnAsync(
        string orderId,
        string customerId,
        string productCategory,
        decimal purchaseAmount,
        DateTime requestedAt)
    {
        var request = new ReturnRequest
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            CustomerId = customerId,
            ProductCategory = productCategory,
            PurchaseAmount = purchaseAmount,
            RequestedAt = requestedAt,
            EligibilityStatus = EligibilityStatus.Eligible,
            StoreInspectionStatus = StoreInspectionStatus.NotReceived,
            FraudReviewStatus = FraudReviewStatus.NotRequired,
            RefundStatus = RefundStatus.NotStarted
        };

        await _repository.AddAsync(request);
        return request;
    }

    public async Task<ReturnRequest> RegisterStoreInspectionAsync(Guid requestId, StoreInspectionStatus status)
    {
        var request = await _repository.GetByIdAsync(requestId)
            ?? throw new DomainException($"Return request {requestId} not found.");

        request.StoreInspectionStatus = status;
        request.RefundStatus = RefundEligibilityEvaluator.IsRefundApproved(request)
            ? RefundStatus.Approved
            : request.RefundStatus;

        await _repository.UpdateAsync(request);
        return request;
    }
}
