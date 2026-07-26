using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Palacio.Returns.Api.DTOs;

namespace Palacio.Returns.Tests.Api;

public class ReturnsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ReturnsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetReturnStatus_ReturnsOkWithDto_WhenRequestExists()
    {
        var createResponse = await _client.PostAsJsonAsync(
            "/api/returns",
            new CreateReturnRequestDto("ORD-GET-1", "CUST-GET-1", "Fashion", 1200m));
        var created = await createResponse.Content.ReadFromJsonAsync<ReturnRequestResponseDto>();

        var getResponse = await _client.GetAsync($"/api/returns/{created!.Id}");
        var fetched = await getResponse.Content.ReadFromJsonAsync<ReturnRequestResponseDto>();

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        Assert.Equal(created.Id, fetched!.Id);
        Assert.Equal("ORD-GET-1", fetched.OrderId);
    }

    [Fact]
    public async Task GetReturnStatus_ReturnsNotFound_WhenRequestDoesNotExist()
    {
        var response = await _client.GetAsync($"/api/returns/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
