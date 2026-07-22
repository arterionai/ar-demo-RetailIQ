using Microsoft.AspNetCore.Mvc;
using Palacio.Returns.Api.DTOs;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Api.Controllers;

[ApiController]
[Route("api/returns")]
public class ReturnsController : ControllerBase
{
    private readonly ReturnWorkflowService _workflowService;

    public ReturnsController(ReturnWorkflowService workflowService)
    {
        _workflowService = workflowService;
    }

    [HttpPost]
    public async Task<ActionResult<ReturnRequestResponseDto>> InitiateReturn(CreateReturnRequestDto dto)
    {
        var request = await _workflowService.InitiateReturnAsync(
            dto.OrderId,
            dto.CustomerId,
            dto.ProductCategory,
            dto.PurchaseAmount,
            DateTime.UtcNow);

        var response = ToResponseDto(request);
        return CreatedAtAction(nameof(InitiateReturn), new { id = response.Id }, response);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<ActionResult<ReturnRequestResponseDto>> ReceiveItem(Guid id)
    {
        var request = await _workflowService.ReceiveItemAsync(id);
        return Ok(ToResponseDto(request));
    }

    [HttpPost("{id:guid}/inspection")]
    public async Task<ActionResult<ReturnRequestResponseDto>> RecordInspectionDecision(Guid id, InspectionDecisionDto dto)
    {
        var request = dto.Approved
            ? await _workflowService.ApproveInspectionAsync(id)
            : await _workflowService.RejectInspectionAsync(id);

        return Ok(ToResponseDto(request));
    }

    [HttpPost("{id:guid}/qr-code")]
    public async Task<ActionResult<QrCodeResponseDto>> IssueQrCode(Guid id)
    {
        var request = await _workflowService.IssueReturnQrCodeAsync(id, DateTime.UtcNow);
        return Ok(new QrCodeResponseDto(request.QrToken!, request.QrExpiresAtUtc!.Value));
    }

    private static ReturnRequestResponseDto ToResponseDto(Domain.Entities.ReturnRequest request) => new(
        request.Id,
        request.OrderId,
        request.CustomerId,
        request.ProductCategory,
        request.PurchaseAmount,
        request.EligibilityStatus.ToString(),
        request.StoreInspectionStatus.ToString(),
        request.FraudReviewStatus.ToString(),
        request.RefundStatus.ToString());
}
