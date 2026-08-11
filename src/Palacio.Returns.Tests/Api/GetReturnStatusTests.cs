using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Palacio.Returns.Api.DTOs;

namespace Palacio.Returns.Tests.Api;

public class GetReturnStatusTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GetReturnStatusTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetReturnStatus_ReturnsOk_WithMatchingDto_WhenReturnExists()
    {
        // Arrange — create a return via POST /api/returns
        var createDto = new CreateReturnRequestDto("ORD-999", "CUST-999", "Electronics", 2500m);
        var postResponse = await _client.PostAsJsonAsync("/api/returns", createDto);
        postResponse.EnsureSuccessStatusCode();

        var created = await postResponse.Content.ReadFromJsonAsync<ReturnRequestResponseDto>();
        Assert.NotNull(created);

        // Act — query its status via GET /api/returns/{id}
        var getResponse = await _client.GetAsync($"/api/returns/{created.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ReturnRequestResponseDto>();
        Assert.NotNull(fetched);
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal(created.OrderId, fetched.OrderId);
        Assert.Equal(created.CustomerId, fetched.CustomerId);
        Assert.Equal(created.EligibilityStatus, fetched.EligibilityStatus);
        Assert.Equal(created.RefundStatus, fetched.RefundStatus);
    }

    [Fact]
    public async Task GetReturnStatus_ReturnsNotFound_WhenReturnDoesNotExist()
    {
        // Arrange — use an ID that was never created
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/returns/{nonExistentId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
