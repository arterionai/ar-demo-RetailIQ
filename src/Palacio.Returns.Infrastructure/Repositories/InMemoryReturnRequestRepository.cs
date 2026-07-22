using System.Collections.Concurrent;
using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;

namespace Palacio.Returns.Infrastructure.Repositories;

public class InMemoryReturnRequestRepository : IReturnRequestRepository
{
    private readonly ConcurrentDictionary<Guid, ReturnRequest> _requests = new();

    public Task AddAsync(ReturnRequest request)
    {
        _requests[request.Id] = request;
        return Task.CompletedTask;
    }

    public Task<ReturnRequest?> GetByIdAsync(Guid id)
    {
        _requests.TryGetValue(id, out var request);
        return Task.FromResult(request);
    }

    public Task UpdateAsync(ReturnRequest request)
    {
        _requests[request.Id] = request;
        return Task.CompletedTask;
    }
}
