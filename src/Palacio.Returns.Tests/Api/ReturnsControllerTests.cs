using Microsoft.AspNetCore.Mvc;
using Palacio.Returns.Api.Controllers;
using Palacio.Returns.Api.DTOs;
using Palacio.Returns.Domain.Services;
using Palacio.Returns.Infrastructure.Fraud;
using Palacio.Returns.Infrastructure.Repositories;
using Palacio.Returns.Infrastructure.Sap;

namespace Palacio.Returns.Tests.Api;

public class ReturnsControllerTests
{
    [Fact]
    public async Task GetReturn_ShouldReturnRequest_WhenIdExists()
    {
        var (controller, workflowService) = CreateController();
        var request = await workflowService.InitiateReturnAsync(
            "ORD-1",
            "CUST-1",
            "Fashion",
            1200m,
            DateTime.UtcNow);

        var result = await controller.GetReturn(request.Id);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ReturnRequestResponseDto>(okResult.Value);
        Assert.Equal(request.Id, response.Id);
        Assert.Equal(request.OrderId, response.OrderId);
        Assert.Equal(request.CustomerId, response.CustomerId);
        Assert.Equal(request.ProductCategory, response.ProductCategory);
        Assert.Equal(request.PurchaseAmount, response.PurchaseAmount);
        Assert.Equal(request.EligibilityStatus.ToString(), response.EligibilityStatus);
        Assert.Equal(request.StoreInspectionStatus.ToString(), response.StoreInspectionStatus);
        Assert.Equal(request.FraudReviewStatus.ToString(), response.FraudReviewStatus);
        Assert.Equal(request.RefundStatus.ToString(), response.RefundStatus);
    }

    [Fact]
    public async Task GetReturn_ShouldReturnNotFound_WhenIdDoesNotExist()
    {
        var (controller, _) = CreateController();

        var result = await controller.GetReturn(Guid.NewGuid());

        Assert.IsType<NotFoundResult>(result.Result);
    }

    private static (ReturnsController Controller, ReturnWorkflowService WorkflowService) CreateController()
    {
        var repository = new InMemoryReturnRequestRepository();
        var workflowService = new ReturnWorkflowService(
            repository,
            new FraudReviewGateway(),
            new SapFolioClient(),
            new QrCodeService());

        return (new ReturnsController(workflowService, repository, null!), workflowService);
    }
}
