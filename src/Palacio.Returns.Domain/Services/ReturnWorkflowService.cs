using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;
using Palacio.Returns.Domain.Exceptions;

namespace Palacio.Returns.Domain.Services;

public class ReturnWorkflowService
{
    private readonly IReturnRequestRepository _repository;
    private readonly IFraudReviewGateway _fraudReviewGateway;
    private readonly ISapFolioClient _sapFolioClient;
    private readonly QrCodeService _qrCodeService;

    public ReturnWorkflowService(
        IReturnRequestRepository repository,
        IFraudReviewGateway fraudReviewGateway,
        ISapFolioClient sapFolioClient,
        QrCodeService qrCodeService)
    {
        _repository = repository;
        _fraudReviewGateway = fraudReviewGateway;
        _sapFolioClient = sapFolioClient;
        _qrCodeService = qrCodeService;
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

    /// <summary>
    /// El artículo llegó físicamente a la tienda. Esto NO implica que la inspección haya sido
    /// aprobada — ver ADR-014 e incidente de noviembre (docs/runbooks).
    /// </summary>
    public async Task<ReturnRequest> ReceiveItemAsync(Guid requestId)
    {
        var request = await GetRequestOrThrowAsync(requestId);
        request.StoreInspectionStatus = StoreInspectionStatus.Received;

        await _repository.UpdateAsync(request);
        return request;
    }

    public async Task<ReturnRequest> ApproveInspectionAsync(Guid requestId)
    {
        var request = await GetRequestOrThrowAsync(requestId);
        request.StoreInspectionStatus = StoreInspectionStatus.Approved;

        if (RefundEligibilityEvaluator.RequiresFraudReview(request))
        {
            request.FraudReviewStatus = await _fraudReviewGateway.ReviewAsync(request);
        }

        if (RefundEligibilityEvaluator.IsRefundApproved(request))
        {
            request.RefundStatus = RefundStatus.Approved;
            request.SapFolioNumber = await _sapFolioClient.CreateFolioAsync(request);
        }

        await _repository.UpdateAsync(request);
        return request;
    }

    public async Task<ReturnRequest> IssueReturnQrCodeAsync(Guid requestId, DateTime issuedAtUtc)
    {
        var request = await GetRequestOrThrowAsync(requestId);
        var qr = _qrCodeService.IssueReturnQrCode(request, issuedAtUtc);

        request.QrToken = qr.Token;
        request.QrExpiresAtUtc = qr.ExpiresAtUtc;

        await _repository.UpdateAsync(request);
        return request;
    }

    public async Task<ReturnRequest> RejectInspectionAsync(Guid requestId)
    {
        var request = await GetRequestOrThrowAsync(requestId);
        request.StoreInspectionStatus = StoreInspectionStatus.Rejected;
        request.RefundStatus = RefundStatus.Denied;

        await _repository.UpdateAsync(request);
        return request;
    }

    private async Task<ReturnRequest> GetRequestOrThrowAsync(Guid requestId) =>
        await _repository.GetByIdAsync(requestId)
            ?? throw new DomainException($"Return request {requestId} not found.");
}
