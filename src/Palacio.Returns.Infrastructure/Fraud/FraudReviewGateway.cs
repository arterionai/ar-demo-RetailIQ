using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Infrastructure.Fraud;

/// <summary>
/// Mock del motor de reglas antifraude. En producción esto llama al servicio real de
/// Prevención de Fraude; aquí simplemente aprueba la revisión para efectos de la demo.
/// </summary>
public class FraudReviewGateway : IFraudReviewGateway
{
    public Task<FraudReviewStatus> ReviewAsync(ReturnRequest request)
    {
        return Task.FromResult(FraudReviewStatus.Cleared);
    }
}
