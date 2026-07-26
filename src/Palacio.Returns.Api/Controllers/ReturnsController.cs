using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Palacio.Returns.Api.DTOs;
using Palacio.Returns.Api.Hubs;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Api.Controllers;

// TODO(demo-live-build): falta GET /api/returns/{id} — se construye en vivo con GitHub Copilot
// como clímax de la demo (ver docs/demo-runbook.md, Escena 2). IReturnRequestRepository ya expone
// GetByIdAsync; no hace falta agregar nada al dominio, solo el endpoint aquí.
[ApiController]
[Route("api/returns")]
public class ReturnsController : ControllerBase
{
    private readonly ReturnWorkflowService _workflowService;
    private readonly IHubContext<ReturnStatusHub> _statusHub;

    public ReturnsController(
        ReturnWorkflowService workflowService,
        IHubContext<ReturnStatusHub> statusHub)
    {
        _workflowService = workflowService;
        _statusHub = statusHub;
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
        await BroadcastStatusAsync(response);
        return CreatedAtAction(nameof(InitiateReturn), new { id = response.Id }, response);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<ActionResult<ReturnRequestResponseDto>> ReceiveItem(Guid id)
    {
        var request = await _workflowService.ReceiveItemAsync(id);
        var response = ToResponseDto(request);
        await BroadcastStatusAsync(response);
        return Ok(response);
    }

    [HttpPost("{id:guid}/inspection")]
    public async Task<ActionResult<ReturnRequestResponseDto>> RecordInspectionDecision(Guid id, InspectionDecisionDto dto)
    {
        var request = dto.Approved
            ? await _workflowService.ApproveInspectionAsync(id)
            : await _workflowService.RejectInspectionAsync(id);

        var response = ToResponseDto(request);
        await BroadcastStatusAsync(response);
        return Ok(response);
    }

    [HttpPost("{id:guid}/qr-code")]
    public async Task<ActionResult<QrCodeResponseDto>> IssueQrCode(Guid id)
    {
        var request = await _workflowService.IssueReturnQrCodeAsync(id, DateTime.UtcNow);
        await BroadcastStatusAsync(ToResponseDto(request));
        return Ok(new QrCodeResponseDto(request.QrToken!, request.QrExpiresAtUtc!.Value));
    }

    /// <summary>
    /// Transmite el estatus actualizado a quien esté suscrito a este ID en
    /// <see cref="ReturnStatusHub"/> (ver seguimiento en vivo de Mi Palacio). Puramente
    /// informativo — no decide ni valida nada; el estatus ya fue calculado por
    /// <see cref="ReturnWorkflowService"/> antes de llegar aquí.
    /// </summary>
    private Task BroadcastStatusAsync(ReturnRequestResponseDto response) =>
        _statusHub.Clients.Group(response.Id.ToString()).SendAsync("ReturnStatusChanged", response);

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
