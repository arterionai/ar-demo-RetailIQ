<#
.SYNOPSIS
    Genera tráfico realista de devoluciones contra Palacio.Returns.Api para poblar Application
    Insights antes de la demo.

.DESCRIPTION
    La Escena 5 de la demo (ver docs/demo-runbook.md) arranca con un síntoma YA visible en la
    telemetría: el presentador no puede esperar a que la ingesta de Application Insights procese
    el tráfico en vivo (tarda 1-3 minutos). Este script siembra ese historial.

    Corre el flujo completo de cada caso (iniciar → recibir → inspeccionar) con una mezcla de
    montos alta/baja, que es como se ve un día normal de operación en varias tiendas a la vez.

    REQUISITO: la API debe estar corriendo con el connection string de Application Insights
    configurado (dotnet user-secrets, clave ApplicationInsights:ConnectionString), o el tráfico
    no se registra en Azure.

.PARAMETER BaseUrl
    URL base de la API. Por omisión http://localhost:5163 (perfil "http" de launchSettings.json).

.PARAMETER Cases
    Número de devoluciones a generar.

.PARAMETER Parallel
    Cuántos casos se procesan al mismo tiempo.

    ⚠️ NO lo subas mucho. Medido contra este recurso: con concurrencia 3-4 la telemetría llega
    completa (verificado: 30 de 30 peticiones y 10 de 10 dependencias). Con concurrencia 40 el
    exportador de Azure Monitor desborda su cola interna y **descarta ~90% de los eventos en
    silencio** — la siembra parece exitosa pero la telemetría queda incompleta.

.EXAMPLE
    ./scripts/seed-telemetry.ps1
    Siembra 250 casos con concurrencia 3 — el perfil recomendado antes de presentar (~40 s).

.EXAMPLE
    ./scripts/seed-telemetry.ps1 -Cases 60 -Parallel 3
    Siembra rápida para una verificación puntual.
#>
[CmdletBinding()]
param(
    [string]$BaseUrl = "http://localhost:5163",
    [int]$Cases = 250,
    [int]$Parallel = 3
)

$ErrorActionPreference = "Stop"

# Categorías del piloto de devoluciones (joyería está fuera de alcance — ver Decision Room).
$categories = @("Fashion", "Fashion", "Fashion", "Calzado", "Belleza", "Hogar", "Accesorios")

# Identificador de corrida: los clientes tienen que ser distintos en cada siembra. El gateway
# antifraude no vuelve a consultar al motor por un cliente ya revisado (ver
# FraudReviewGateway.ReviewValidityWindow), así que reusar los mismos IDs haría que la segunda
# siembra se salte la consulta por completo y no genere telemetría del motor.
$runId = Get-Date -Format "HHmmss"

Write-Host "Sembrando $Cases devoluciones contra $BaseUrl (concurrencia $Parallel, corrida $runId)..." -ForegroundColor Cyan

try {
    Invoke-RestMethod -Uri "$BaseUrl/api/returns" -Method Post -TimeoutSec 10 -ContentType "application/json" -Body (@{
        orderId        = "SEED-PROBE"
        customerId     = "SEED-PROBE"
        productCategory = "Fashion"
        purchaseAmount = 1000
    } | ConvertTo-Json) | Out-Null
}
catch {
    Write-Error "No se pudo alcanzar la API en $BaseUrl. Arráncala con: dotnet run --project src/Palacio.Returns.Api"
    exit 1
}

$results = 1..$Cases | ForEach-Object -ThrottleLimit $Parallel -Parallel {
    $baseUrl = $using:BaseUrl
    $categories = $using:categories
    $runId = $using:runId
    $index = $_

    # ~35% de las devoluciones son de alto valor (> MXN $25,000 ⇒ requieren revisión antifraude).
    $isHighValue = (Get-Random -Minimum 1 -Maximum 101) -le 35
    $amount = if ($isHighValue) {
        [math]::Round((Get-Random -Minimum 25500 -Maximum 48000), 2)
    }
    else {
        [math]::Round((Get-Random -Minimum 800 -Maximum 19000), 2)
    }

    $case = [ordered]@{
        index      = $index
        amount     = $amount
        highValue  = $isHighValue
        error      = $null
        refund     = $null
        fraud      = $null
    }

    try {
        $created = Invoke-RestMethod -Uri "$baseUrl/api/returns" -Method Post -TimeoutSec 30 -ContentType "application/json" -Body (@{
            orderId         = "ORD-{0}-{1:D5}" -f $runId, $index
            customerId      = "CUST-{0}-{1:D5}" -f $runId, $index
            productCategory = $categories | Get-Random
            purchaseAmount  = $amount
        } | ConvertTo-Json)

        Invoke-RestMethod -Uri "$baseUrl/api/returns/$($created.id)/receive" -Method Post -TimeoutSec 30 | Out-Null

        # ~8% de las inspecciones se rechazan (artículo dañado o fuera de política).
        $approved = (Get-Random -Minimum 1 -Maximum 101) -gt 8
        $inspected = Invoke-RestMethod -Uri "$baseUrl/api/returns/$($created.id)/inspection" -Method Post -TimeoutSec 30 -ContentType "application/json" -Body (@{ approved = $approved } | ConvertTo-Json)

        $case.refund = $inspected.refundStatus
        $case.fraud = $inspected.fraudReviewStatus
    }
    catch {
        $case.error = $_.Exception.Message
    }

    [pscustomobject]$case
}

$failed = @($results | Where-Object { $null -ne $_.error })
$highValue = @($results | Where-Object { $_.highValue -and $null -eq $_.error })
$highValueApproved = @($highValue | Where-Object { $_.refund -eq "Approved" })

Write-Host ""
Write-Host "Listo." -ForegroundColor Green
Write-Host "  Casos generados:              $($results.Count)"
Write-Host "  Casos con error HTTP:         $($failed.Count)"
Write-Host "  Casos de alto valor:          $($highValue.Count)"
Write-Host "  Alto valor con reembolso OK:  $($highValueApproved.Count)"
Write-Host ""
Write-Host "La telemetría tarda 1-3 minutos en aparecer en Application Insights." -ForegroundColor Yellow
Write-Host "Consultas de verificación: docs/runbooks/appinsights-queries.md" -ForegroundColor Yellow
