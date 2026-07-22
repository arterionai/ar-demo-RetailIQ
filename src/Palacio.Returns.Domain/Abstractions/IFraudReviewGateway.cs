using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Domain.Abstractions;

public interface IFraudReviewGateway
{
    Task<FraudReviewStatus> ReviewAsync(ReturnRequest request);
}
