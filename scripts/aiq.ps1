<#
.SYNOPSIS
    Corre una consulta KQL contra el Application Insights de la demo y la imprime como tabla.

.DESCRIPTION
    `az monitor app-insights query` devuelve un objeto anidado ({tables:[{columns,rows}]}), así
    que `-o table` no imprime nada útil. Este helper aplana el resultado a objetos de PowerShell
    con los nombres de columna correctos — legible en pantalla durante la demo y fácil de
    encadenar (Where-Object, Export-Csv, etc.).

    También evita la trampa de comillas: al recibir el KQL como un solo parámetro, puedes usar
    comillas dobles dentro del query sin que PowerShell las mangle al invocar az.cmd.

.PARAMETER Query
    La consulta KQL.

.PARAMETER Offset
    Ventana de tiempo hacia atrás. Por omisión 24h.

.PARAMETER AppId
    App ID de Application Insights. Por omisión el recurso de la demo
    (appi-palacio-returns), o la variable de entorno PALACIO_AI_APP_ID si está definida.

.EXAMPLE
    ./scripts/aiq.ps1 "dependencies | where name == 'fraud-review' | summarize count() by success"

.EXAMPLE
    ./scripts/aiq.ps1 -Offset 7d "exceptions | summarize ocurrencias = count() by type, method"

.NOTES
    Consultas listas para copiar: docs/runbooks/appinsights-queries.md
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Query,

    [string]$Offset = "24h",

    [string]$AppId = $(if ($env:PALACIO_AI_APP_ID) { $env:PALACIO_AI_APP_ID } else { "f0023bc8-f3bc-4838-9dd5-ce9a40728f41" })
)

$ErrorActionPreference = "Stop"

$raw = az monitor app-insights query --app $AppId --offset $Offset --analytics-query $Query -o json
if ($LASTEXITCODE -ne 0) {
    Write-Error "La consulta falló. Revisa el KQL, o corre 'az login' si expiró la sesión."
    exit 1
}

$table = ($raw | ConvertFrom-Json).tables[0]
$columns = @($table.columns.name)

if ($table.rows.Count -eq 0) {
    Write-Host "Sin resultados en la ventana -Offset $Offset." -ForegroundColor Yellow
    Write-Host "Recuerda que la ingesta de Application Insights tarda 1-3 minutos." -ForegroundColor Yellow
    return
}

$table.rows | ForEach-Object {
    $row = $_
    $record = [ordered]@{}
    for ($i = 0; $i -lt $columns.Count; $i++) {
        $record[$columns[$i]] = $row[$i]
    }
    [pscustomobject]$record
}
