using Palacio.Returns.Domain.Services;
using Palacio.Returns.Infrastructure.Fraud;
using Palacio.Returns.Infrastructure.Repositories;
using Palacio.Returns.Infrastructure.Sap;

namespace Palacio.Returns.Tests.Domain;

public class ReturnWorkflowServiceTests
{
    private static ReturnWorkflowService CreateService() => new(
        new InMemoryReturnRequestRepository(),
        new FraudReviewGateway(),
        new SapFolioClient());

    [Fact]
    public async Task SapFolio_IsNotCreated_OnReturnInitiation()
    {
        var service = CreateService();

        var request = await service.InitiateReturnAsync("ORD-1", "CUST-1", "Fashion", 1200m, DateTime.UtcNow);

        Assert.Null(request.SapFolioNumber);
    }

    [Fact]
    public async Task SapFolio_IsCreated_AfterInspectionApproved()
    {
        var service = CreateService();
        var request = await service.InitiateReturnAsync("ORD-1", "CUST-1", "Fashion", 1200m, DateTime.UtcNow);

        var updated = await service.ApproveInspectionAsync(request.Id);

        Assert.NotNull(updated.SapFolioNumber);
    }
}
