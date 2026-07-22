using Palacio.Returns.Domain.Entities;

namespace Palacio.Returns.Domain.Abstractions;

public interface ISapFolioClient
{
    /// <summary>
    /// Crea el folio de devolución en SAP. Debe invocarse únicamente después de que la
    /// inspección en tienda fue aprobada — nunca al iniciar la devolución (ver ADR-014).
    /// </summary>
    Task<string> CreateFolioAsync(ReturnRequest request);
}
