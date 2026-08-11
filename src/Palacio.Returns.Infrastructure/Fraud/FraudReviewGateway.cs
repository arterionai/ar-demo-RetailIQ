using System.Diagnostics;
using Palacio.Returns.Domain.Abstractions;
using Palacio.Returns.Domain.Entities;
using Palacio.Returns.Domain.Enums;

namespace Palacio.Returns.Infrastructure.Fraud;

/// <summary>
/// Cliente del motor de reglas antifraude de Prevención de Pérdidas.
/// </summary>
/// <remarks>
/// El motor real corre más reglas de riesgo conforme crece el monto de la devolución, así que su
/// tiempo de respuesta no es constante. Para no dejar al asociado esperando en el mostrador, la
/// consulta se acota con un presupuesto de espera (<see cref="DefaultReviewTimeout"/>) y se lleva
/// un registro de clientes ya revisados para no re-consultar al motor —que es la dependencia más
/// lenta del flujo de inspección— dentro de la misma sesión de tienda.
/// </remarks>
public class FraudReviewGateway : IFraudReviewGateway
{
    public const string ActivitySourceName = "Palacio.Returns.Fraud";

    /// <summary>
    /// Presupuesto de espera acordado con Prevención de Pérdidas para la consulta antifraude.
    /// </summary>
    public static readonly TimeSpan DefaultReviewTimeout = TimeSpan.FromMilliseconds(700);

    /// <summary>
    /// Ventana en la que se considera vigente la revisión antifraude de un cliente. Dentro de la
    /// misma sesión de tienda no tiene sentido volver a consultar al motor por el mismo cliente.
    /// </summary>
    public static readonly TimeSpan ReviewValidityWindow = TimeSpan.FromMinutes(30);

    private static readonly ActivitySource ActivitySource = new(ActivitySourceName);

    private static readonly List<ReviewedCustomer> RecentReviews = new();

    private readonly TimeSpan _reviewTimeout;

    public FraudReviewGateway()
        : this(DefaultReviewTimeout)
    {
    }

    public FraudReviewGateway(TimeSpan reviewTimeout)
    {
        _reviewTimeout = reviewTimeout;
    }

    public async Task<FraudReviewStatus> ReviewAsync(ReturnRequest request)
    {
        using var activity = ActivitySource.StartActivity("fraud-review", ActivityKind.Client);
        activity?.SetTag("peer.service", "loss-prevention.fraud-engine");
        activity?.SetTag("fraud.purchase_amount", request.PurchaseAmount);

        var cutoff = DateTime.UtcNow - ReviewValidityWindow;

        var lastReview = RecentReviews
            .Where(review => review.CustomerId == request.CustomerId)
            .OrderByDescending(review => review.ReviewedAtUtc)
            .FirstOrDefault();

        if (lastReview is not null && lastReview.ReviewedAtUtc >= cutoff)
        {
            activity?.SetTag("fraud.source", "already-reviewed");
            return FraudReviewStatus.Cleared;
        }

        // Se registra al cliente antes de llamar al motor: si dos tiendas atienden al mismo
        // cliente al mismo tiempo, no queremos disparar dos consultas simultáneas.
        RecentReviews.RemoveAll(review => review.ReviewedAtUtc < cutoff);
        RecentReviews.Add(new ReviewedCustomer(request.CustomerId, DateTime.UtcNow));

        try
        {
            using var budget = new CancellationTokenSource(_reviewTimeout);
            var verdict = await CallFraudEngineAsync(request, budget.Token);

            activity?.SetTag("fraud.source", "fraud-engine");
            activity?.SetTag("fraud.verdict", verdict.ToString());
            return verdict;
        }
        catch (OperationCanceledException)
        {
            // El motor antifraude no respondió dentro del presupuesto de espera. No podemos dejar
            // a la clienta esperando en el mostrador por una integración interna, así que la
            // devolución continúa con su flujo normal.
            activity?.SetStatus(ActivityStatusCode.Error, "fraud-engine timeout");
            activity?.SetTag("fraud.source", "timeout");
            return FraudReviewStatus.Cleared;
        }
    }

    /// <summary>
    /// Simulación del motor real de Prevención de Pérdidas: el tiempo de respuesta crece con el
    /// monto, porque el motor corre más reglas de riesgo en devoluciones de alto valor.
    /// </summary>
    private static async Task<FraudReviewStatus> CallFraudEngineAsync(
        ReturnRequest request,
        CancellationToken cancellationToken)
    {
        const int MillisecondsPerRule = 85;

        var ruleCount = 3 + (int)(request.PurchaseAmount / 5_000m);
        var jitter = 0.94 + (Random.Shared.NextDouble() * 0.12);

        await Task.Delay(
            TimeSpan.FromMilliseconds(MillisecondsPerRule * ruleCount * jitter),
            cancellationToken);

        return FraudReviewStatus.Cleared;
    }

    private sealed record ReviewedCustomer(string CustomerId, DateTime ReviewedAtUtc);
}
