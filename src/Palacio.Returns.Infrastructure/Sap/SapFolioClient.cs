using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;

namespace Palacio.Returns.Infrastructure.Sap;

/// <summary>
/// Mock del cliente de SAP. Solo debe invocarse tras la aprobación de inspección — ver
/// ISapFolioClient y ADR-014.
/// </summary>
public class SapFolioClient : ISapFolioClient
{
    public Task<string> CreateFolioAsync(ReturnRequest request)
    {
        var folio = $"SAP-{request.Id:N}"[..12].ToUpperInvariant();
        return Task.FromResult(folio);
    }
}
