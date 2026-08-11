using Palacio.Returns.Api.Hubs;
using Palacio.Returns.Api.Observability;
using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Services;
using Palacio.Returns.Infrastructure.Fraud;
using Palacio.Returns.Infrastructure.Repositories;
using Palacio.Returns.Infrastructure.Sap;

var builder = WebApplication.CreateBuilder(args);

// Telemetría a Azure Application Insights. Opcional: si no hay connection string configurado,
// la API arranca igual y sin telemetría (ver PalacioTelemetry).
builder.AddPalacioTelemetry();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

const string DemoWebClients = "DemoWebClients";
builder.Services.AddCors(options =>
{
    options.AddPolicy(DemoWebClients, policy =>
    {
        // AllowCredentials es necesario para el hub de SignalR (ReturnStatusHub): el cliente
        // @microsoft/signalr manda credentials: 'include' por defecto en la petición de
        // negotiate, y el navegador rechaza esa respuesta si el servidor no lo permite
        // explícitamente (no se puede combinar con AllowAnyOrigin, por eso WithOrigins es
        // explícito con la lista de puertos de los frontends de la demo).
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSingleton<IReturnRequestRepository, InMemoryReturnRequestRepository>();
builder.Services.AddScoped<IFraudReviewGateway, FraudReviewGateway>();
builder.Services.AddScoped<ISapFolioClient, SapFolioClient>();
builder.Services.AddScoped<QrCodeService>();
builder.Services.AddScoped<ReturnWorkflowService>();

var app = builder.Build();

app.Logger.LogInformation(
    "Telemetría de Application Insights: {Estado}",
    PalacioTelemetry.IsEnabled ? "ACTIVA" : "desactivada (sin connection string configurado)");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(DemoWebClients);

app.UseAuthorization();

app.MapControllers();
app.MapHub<ReturnStatusHub>("/hubs/return-status");

app.Run();

public partial class Program
{
}
