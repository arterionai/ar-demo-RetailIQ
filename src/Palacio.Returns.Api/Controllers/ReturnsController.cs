using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Palacio.Returns.Api.DTOs;
using Palacio.Returns.Api.Hubs;
using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Services;

namespace Palacio.Returns.Api.Controllers;

[ApiController]
[Route("api/returns")]
public class ReturnsController : ControllerBase
{
    private readonly ReturnWorkflowService _workflowService;
    private readonly IReturnRequestRepository _repository;
    private readonly IHubContext<ReturnStatusHub> _statusHub;

    public ReturnsController(
        ReturnWorkflowService workflowService,
        IReturnRequestRepository repository,
        IHubContext<ReturnStatusHub> statusHub)
    {
        _workflowService = workflowService;
        _repository = repository;
        _statusHub = statusHub;
    }

    /// <summary>
    /// Consulta el estatus actual de una devolución sin disparar cambios de estado.
    /// Fuente de verdad: Returns Orchestrator (ADR-014 §2).
    /// Permite auditoría y debugging (incident 2025-11).
    /// </summary>
    /// <response code="200">Devolución encontrada.</response>
    /// <response code="404">No existe una devolución con el ID indicado.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReturnRequestResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ReturnRequestResponseDto>> GetReturnStatus(Guid id)
    {
        var returnRequest = await _repository.GetByIdAsync(id);
        if (returnRequest is null)
            return NotFound();

        return Ok(ToResponseDto(returnRequest));
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
        TagOutcome(response);
        await BroadcastStatusAsync(response);
        return CreatedAtAction(nameof(InitiateReturn), new { id = response.Id }, response);
    }

    [HttpPost("{id:guid}/receive")]
    public async Task<ActionResult<ReturnRequestResponseDto>> ReceiveItem(Guid id)
    {
        var request = await _workflowService.ReceiveItemAsync(id);
        var response = ToResponseDto(request);
        TagOutcome(response);
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
        TagOutcome(response);
        await BroadcastStatusAsync(response);
        return Ok(response);
    }

    [HttpPost("{id:guid}/qr-code")]
    public async Task<ActionResult<QrCodeResponseDto>> IssueQrCode(Guid id)
    {
        var request = await _workflowService.IssueReturnQrCodeAsync(id, DateTime.UtcNow);
        var response = ToResponseDto(request);
        TagOutcome(response);
        await BroadcastStatusAsync(response);
        return Ok(new QrCodeResponseDto(request.QrToken!, request.QrExpiresAtUtc!.Value));
    }

    /// <summary>
    /// Registra en la telemetría el estado con el que quedó la devolución después de la
    /// operación. Puramente observacional — no decide ni valida nada.
    /// </summary>
    private static void TagOutcome(ReturnRequestResponseDto response)
    {
        var activity = Activity.Current;
        if (activity is null)
        {
            return;
        }

        activity.SetTag("palacio.return_id", response.Id);
        activity.SetTag("palacio.purchase_amount", response.PurchaseAmount);
        activity.SetTag("palacio.eligibility_status", response.EligibilityStatus);
        activity.SetTag("palacio.inspection_status", response.StoreInspectionStatus);
        activity.SetTag("palacio.fraud_review_status", response.FraudReviewStatus);
        activity.SetTag("palacio.refund_status", response.RefundStatus);
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
