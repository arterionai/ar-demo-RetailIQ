using Azure.Monitor.OpenTelemetry.AspNetCore;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Palacio.Returns.Infrastructure.Fraud;

namespace Palacio.Returns.Api.Observability;

/// <summary>
/// Instrumentación de Azure Application Insights para la API de devoluciones.
/// </summary>
/// <remarks>
/// Es <b>opcional a propósito</b>: si no hay connection string configurado, la API arranca
/// igual y simplemente no emite telemetría. La demo tiene que poder correr sin Azure (por
/// ejemplo, sin red en la sala de presentación).
/// <para>
/// El connection string se lee de <c>ApplicationInsights:ConnectionString</c> (en desarrollo
/// local: <c>dotnet user-secrets</c>) o de la variable de entorno estándar
/// <c>APPLICATIONINSIGHTS_CONNECTION_STRING</c>. Nunca se commitea al repositorio — ver
/// docs/constitution.md §5.3.
/// </para>
/// </remarks>
public static class PalacioTelemetry
{
    public const string ServiceName = "palacio-returns-api";

    /// <summary>
    /// Indica si se configuró el exportador de Application Insights. Se registra en el log de
    /// arranque para que sea evidente, antes de presentar, si la API está emitiendo telemetría.
    /// </summary>
    public static bool IsEnabled { get; private set; }

    public static WebApplicationBuilder AddPalacioTelemetry(this WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration["ApplicationInsights:ConnectionString"]
            ?? Environment.GetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return builder;
        }

        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(ServiceName))
            .WithTracing(tracing => tracing.AddSource(FraudReviewGateway.ActivitySourceName))
            .UseAzureMonitor(options =>
            {
                options.ConnectionString = connectionString;

                // Sin sampling. El distro de Azure Monitor descarta telemetría por omisión para
                // controlar costo, y en esta demo el volumen es mínimo pero los eventos que
                // importan son justamente los raros (una falla intermitente cada varios cientos
                // de operaciones). Con sampling activo, esos eventos simplemente no llegan.
                options.SamplingRatio = 1.0f;
            });

        IsEnabled = true;
        return builder;
    }
}
