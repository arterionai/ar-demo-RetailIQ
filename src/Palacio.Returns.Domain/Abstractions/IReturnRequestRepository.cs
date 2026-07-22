using Palacio.Returns.Domain.Entities;

namespace Palacio.Returns.Domain.Abstractions;

public interface IReturnRequestRepository
{
    Task AddAsync(ReturnRequest request);
    Task<ReturnRequest?> GetByIdAsync(Guid id);
    Task UpdateAsync(ReturnRequest request);
}
