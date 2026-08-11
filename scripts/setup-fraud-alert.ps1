<#
.SYNOPSIS
    Crea la regla de alerta de Azure Monitor que despierta al SRE Agent para la Escena 5.

.DESCRIPTION
    El Tiempo 2 de la Escena 5 se apoya en una frase: *"nadie se lo pidió, lo encontró solo"*. Esa
    frase solo es honesta si la investigación la disparó una alerta, no el presentador. Al 6 de agosto
    de 2026 **no existía ninguna regla de alerta en toda la suscripción**: el SRE Agent estaba
    desplegado pero nada lo iba a despertar.

    Este script crea esa regla: una alerta de búsqueda de logs (scheduled query rule) sobre
    `appi-palacio-returns` que dispara cuando hay consultas al motor antifraude que **no completan**
    en devoluciones de alto valor — exactamente el control roto que la escena descubre.

    Usa la API REST vía `az rest` a propósito, para no depender de la extensión `scheduled-query` del
    CLI (que en esta máquina no está instalada y su instalación dinámica se queda esperando input).

    IDEMPOTENTE: si la regla ya existe, lo dice y no la toca, salvo que pases -Replace.

.PARAMETER ResourceGroup
    Resource group del Application Insights. Por omisión `rg-palacio-retailiq`.

.PARAMETER AppInsightsName
    Nombre del recurso de Application Insights. Por omisión `appi-palacio-returns`.

.PARAMETER RuleName
    Nombre de la regla. Por omisión `alert-fraud-review-incomplete`.

.PARAMETER Threshold
    Cuántas consultas antifraude incompletas de alto valor hacen falta en la ventana para disparar.
    Por omisión 5. La siembra normal (`seed-telemetry.ps1`, 250 casos) produce del orden de 60
    expiradas, así que 5 dispara con holgura sin ser ruidoso cuando no hay tráfico.

.PARAMETER WindowMinutes
    Ventana de evaluación en minutos. Por omisión 15.

.PARAMETER FrequencyMinutes
    Cada cuántos minutos se evalúa. Por omisión 5.

.PARAMETER Check
    Solo reporta si la regla existe y cómo está configurada. No modifica nada.

.PARAMETER ShowPayload
    Imprime el JSON que se enviaría y termina, sin crear nada. Para revisarlo antes de ejecutar.

.PARAMETER Replace
    Sobrescribe la regla si ya existe.

.EXAMPLE
    ./scripts/setup-fraud-alert.ps1 -Check
    ¿Existe ya la alerta?

.EXAMPLE
    ./scripts/setup-fraud-alert.ps1 -ShowPayload
    Revisar exactamente qué se va a crear, sin crearlo.

.EXAMPLE
    ./scripts/setup-fraud-alert.ps1
    Crear la regla.

.NOTES
    ESTO NO TERMINA EL CABLEADO. La regla hace que exista el incidente; que el SRE Agent lo tome y
    arranque una investigación por su cuenta se configura del lado del agente, en el portal
    (https://sre.azure.com): fuente de incidentes de Azure Monitor + un incident response plan.
    Ver docs/demo-runbook.md, Escena 5, Tiempo 2 — ese paso es de portal y no tiene ruta por CLI.

    Costo: una regla de búsqueda de logs es del orden de centavos de dólar al mes. Es despreciable
    frente al always-on del propio SRE Agent (~USD $9.60/día, ver el runbook).
#>
[CmdletBinding()]
param(
    [string]$ResourceGroup = "rg-palacio-retailiq",
    [string]$AppInsightsName = "appi-palacio-returns",
    [string]$RuleName = "alert-fraud-review-incomplete",
    [int]$Threshold = 5,
    [int]$WindowMinutes = 15,
    [int]$FrequencyMinutes = 5,
    [switch]$Check,
    [switch]$ShowPayload,
    [switch]$Replace
)

$ErrorActionPreference = "Stop"
$apiVersion = "2023-03-15-preview"

# --- Contexto de la suscripción ------------------------------------------

$subId = az account show --query id -o tsv 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($subId)) {
    Write-Error "No hay sesión de Azure CLI. Corre: az login"
    exit 1
}

$aiId = az resource show `
    --resource-group $ResourceGroup `
    --name $AppInsightsName `
    --resource-type "Microsoft.Insights/components" `
    --query id -o tsv 2>$null

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($aiId)) {
    Write-Error "No se encontró el Application Insights '$AppInsightsName' en el resource group '$ResourceGroup'."
    exit 1
}

$location = az resource show --ids $aiId --query location -o tsv
$ruleId = "/subscriptions/$subId/resourceGroups/$ResourceGroup/providers/Microsoft.Insights/scheduledQueryRules/$RuleName"
$ruleUrl = "https://management.azure.com$ruleId" + "?api-version=$apiVersion"

Write-Host "Suscripción      : $subId"
Write-Host "Application Insights : $AppInsightsName ($location)"
Write-Host "Regla            : $RuleName"
Write-Host ""

# --- ¿Ya existe? ---------------------------------------------------------

$existing = az rest --method get --url $ruleUrl 2>$null
$exists = ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($existing))

if ($Check) {
    if ($exists) {
        $e = $existing | ConvertFrom-Json
        Write-Host "[OK] La regla existe." -ForegroundColor Green
        Write-Host "  habilitada : $($e.properties.enabled)"
        Write-Host "  severidad  : $($e.properties.severity)"
        Write-Host "  frecuencia : $($e.properties.evaluationFrequency)  ventana: $($e.properties.windowSize)"
        Write-Host "  umbral     : $($e.properties.criteria.allOf[0].operator) $($e.properties.criteria.allOf[0].threshold)"
        Write-Host ""
        Write-Host "Recuerda: que la alerta exista NO garantiza que el SRE Agent la tome." -ForegroundColor Yellow
        Write-Host "Eso se configura en https://sre.azure.com (fuente de incidentes + response plan)." -ForegroundColor Yellow
    }
    else {
        Write-Host "[FALTA] La regla '$RuleName' no existe." -ForegroundColor Yellow
        Write-Host "Sin ella nada despierta al SRE Agent, y la frase 'nadie se lo pidió' no se sostiene." -ForegroundColor Yellow
        Write-Host "Créala con: ./scripts/setup-fraud-alert.ps1" -ForegroundColor DarkGray
    }
    exit 0
}

if ($exists -and -not $Replace) {
    Write-Host "[OK] La regla ya existe. No se tocó nada." -ForegroundColor Green
    Write-Host "Si quieres sobrescribirla: ./scripts/setup-fraud-alert.ps1 -Replace" -ForegroundColor DarkGray
    exit 0
}

# --- La consulta ---------------------------------------------------------

# El control roto de la Escena 5: consultas al motor antifraude que no completan en devoluciones de
# alto valor. Se excluye 'already-reviewed' porque esas no consultan al motor (salen del registro en
# memoria) y no representan un control saltado.
$query = @"
dependencies
| where name == 'fraud-review'
| where success == false
| where tostring(customDimensions['fraud.source']) != 'already-reviewed'
| where todouble(customDimensions['fraud.purchase_amount']) > 30000
"@

$payload = [ordered]@{
    location   = $location
    properties = [ordered]@{
        displayName         = "Revisión antifraude incompleta en devoluciones de alto valor"
        description         = "La consulta al motor antifraude de Prevención de Pérdidas no completó en devoluciones arriba de MXN 30,000. La aplicación no lo reporta como error: la devolución sigue su curso. Ver ADR-014 y el postmortem de noviembre 2025."
        severity            = 2
        enabled             = $true
        evaluationFrequency = "PT${FrequencyMinutes}M"
        windowSize          = "PT${WindowMinutes}M"
        scopes              = @($aiId)
        targetResourceTypes = @("Microsoft.Insights/components")
        criteria            = [ordered]@{
            allOf = @(
                [ordered]@{
                    query           = $query
                    timeAggregation = "Count"
                    operator        = "GreaterThan"
                    threshold       = $Threshold
                    failingPeriods  = [ordered]@{
                        numberOfEvaluationPeriods = 1
                        minFailingPeriodsToAlert  = 1
                    }
                }
            )
        }
        autoMitigate        = $true
    }
}

$json = $payload | ConvertTo-Json -Depth 12

if ($ShowPayload) {
    Write-Host "JSON que se enviaría (no se creó nada):" -ForegroundColor Cyan
    Write-Host $json
    exit 0
}

# --- Crear ---------------------------------------------------------------

$tmp = Join-Path ([IO.Path]::GetTempPath()) "fraud-alert-$([guid]::NewGuid().ToString('N')).json"
try {
    # az rest --body con JSON inline se rompe por el escapado de comillas en Windows; el archivo con
    # prefijo @ es la vía confiable.
    Set-Content -LiteralPath $tmp -Value $json -Encoding utf8
    $verb = if ($exists) { "Reemplazando" } else { "Creando" }
    Write-Host "$verb la regla..." -ForegroundColor Cyan

    $result = az rest --method put --url $ruleUrl --headers "Content-Type=application/json" --body "@$tmp" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falló la creación de la regla:`n$result"
        exit 1
    }
}
finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Regla '$RuleName' creada." -ForegroundColor Green
Write-Host "  dispara con más de $Threshold consultas incompletas de alto valor en $WindowMinutes min," -ForegroundColor DarkGray
Write-Host "  evaluando cada $FrequencyMinutes min." -ForegroundColor DarkGray
Write-Host ""
Write-Host "FALTA EL PASO QUE NO TIENE CLI:" -ForegroundColor Yellow
Write-Host "  En https://sre.azure.com, sobre el agente 'dem-pdh-sreagent':" -ForegroundColor Yellow
Write-Host "   1. Confirmar que 'rg-palacio-retailiq' está en sus recursos administrados." -ForegroundColor Yellow
Write-Host "   2. Habilitar Azure Monitor como fuente de incidentes." -ForegroundColor Yellow
Write-Host "   3. Crear un incident response plan que le diga cómo investigar esto y que abra un" -ForegroundColor Yellow
Write-Host "      issue en GitHub (arterionai/ar-demo-RetailIQ) con el resultado." -ForegroundColor Yellow
Write-Host ""
Write-Host "Y después ENSAYARLO: sembrar, esperar a que la alerta dispare sola, y medir cuánto tarda" -ForegroundColor Yellow
Write-Host "la investigación de verdad. Los ~15 minutos del guion son una estimación, no una medición." -ForegroundColor Yellow
