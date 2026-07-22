using System.Text.Json;
using Palacio.Returns.Domain.Entities;

namespace Palacio.Returns.Domain.Services;

public record QrIssueResult(string Token, DateTime ExpiresAtUtc);

public class QrCodeService
{
    private static readonly TimeSpan PilotValidity = TimeSpan.FromHours(72);

    /// <summary>
    /// Genera el QR de devolución para el piloto Polanco. El payload solo incluye lo
    /// estrictamente necesario para que la tienda identifique la solicitud — nunca el
    /// resultado de la revisión antifraude (ver correo de Ricardo Salas, Prevención de Fraude).
    /// </summary>
    public QrIssueResult IssueReturnQrCode(ReturnRequest request, DateTime issuedAtUtc)
    {
        var payload = new { request.Id, request.OrderId };
        var token = Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(payload));

        return new QrIssueResult(token, issuedAtUtc.Add(PilotValidity));
    }
}
