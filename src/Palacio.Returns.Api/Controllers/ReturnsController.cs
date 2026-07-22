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

    [HttpPost("{id:guid}/inspection")]
    public async Task<ActionResult<ReturnRequestResponseDto>> RegisterStoreInspection(Guid id, InspectionResultDto dto)
    {
        var request = await _workflowService.RegisterStoreInspectionAsync(id, dto.Status);
        return Ok(ToResponseDto(request));
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
