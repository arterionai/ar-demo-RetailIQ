<#
.SYNOPSIS
  Verifica si el Tiempo 5 de la Escena 5 (el PR del Copilot cloud agent) se puede presentar.

.DESCRIPTION
  El PR #10 *se lee* como un arreglo terminado —título correcto, descripción detallada, snippet de
  código— aunque su diff esté completamente vacío. Narrar esa descripción en vivo sería mostrar
  trabajo que no existe, y basta un clic en "Files changed" para que quede en evidencia.

  Por eso la verificación NO es leer el PR. Este script comprueba la puerta completa:

    1. El PR existe y sigue abierto.
    2. El diff contra main NO está vacío.
    3. El diff toca FraudReviewGateway.cs (donde vive el defecto).
    4. El diff toca el proyecto de pruebas (sin test no hay "lo arregló de verdad").
    5. El run de dotnet-ci sobre la rama está en verde — no en `action_required`, que es donde
       se queda por omisión porque los PRs de bots necesitan aprobación manual.
    6. El issue sigue asignado a Copilot (es lo que se muestra en pantalla).
    7. El PR NO está mergeado — el defecto tiene que seguir vivo en main para el Tiempo 4.

  Salida: exit 0 si el Tiempo 5 se puede presentar, exit 1 si no.

.EXAMPLE
  ./scripts/check-cloud-agent.ps1
  ./scripts/check-cloud-agent.ps1 -Pr 12 -Issue 11
#>
[CmdletBinding()]
param(
  [int]$Pr = 10,
  [int]$Issue = 9
)

$ErrorActionPreference = 'Stop'

$checks = [System.Collections.Generic.List[object]]::new()
function Add-Check {
  param([string]$Name, [bool]$Ok, [string]$Detail)
  $checks.Add([pscustomobject]@{ Ok = $Ok; Name = $Name; Detail = $Detail })
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "gh CLI no encontrado. Instálalo o corre las verificaciones a mano." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Verificando el Tiempo 5 — PR #$Pr / issue #$Issue" -ForegroundColor Cyan
Write-Host ("-" * 64)

# --- 1-4. Estado y contenido del PR ---------------------------------------
try {
  $prJson = gh pr view $Pr --json state,isDraft,headRefName,changedFiles,additions,files 2>&1 | ConvertFrom-Json
} catch {
  Write-Host "No se pudo leer el PR #$Pr. ¿Estás autenticado (gh auth status) y en el repo correcto?" -ForegroundColor Red
  exit 1
}

Add-Check "El PR sigue abierto" ($prJson.state -eq 'OPEN') "state = $($prJson.state)"
Add-Check "El PR NO está mergeado (el defecto debe seguir vivo en main)" ($prJson.state -ne 'MERGED') "state = $($prJson.state)"

$hasDiff = $prJson.changedFiles -gt 0
Add-Check "El diff NO está vacío" $hasDiff "$($prJson.changedFiles) archivo(s), +$($prJson.additions) línea(s)"

$paths = @($prJson.files | ForEach-Object { $_.path })
Add-Check "Toca FraudReviewGateway.cs" ([bool]($paths -match 'FraudReviewGateway\.cs')) (($paths -match 'FraudReviewGateway\.cs') -join ', ')
Add-Check "Toca el proyecto de pruebas" ([bool]($paths -match 'Palacio\.Returns\.Tests')) (($paths -match 'Palacio\.Returns\.Tests') -join ', ')

# --- 5. CI en verde sobre la rama del agente ------------------------------
$branch = $prJson.headRefName
$ciOk = $false
$ciDetail = 'sin runs'
if ($branch) {
  $runs = gh run list --branch $branch --workflow dotnet-ci.yml --limit 1 --json status,conclusion,url 2>&1 | ConvertFrom-Json
  if ($runs -and $runs.Count -gt 0) {
    $r = $runs[0]
    $ciOk = ($r.conclusion -eq 'success')
    $ciDetail = "status = $($r.status), conclusion = $($r.conclusion)"
    if ($r.conclusion -eq 'action_required') {
      $ciDetail += "  <-- aprueba el run desde el PR o Actions; los PRs de bots no corren solos"
    }
  }
}
Add-Check "dotnet-ci en verde sobre '$branch'" $ciOk $ciDetail

# --- 6. El issue sigue asignado a Copilot ---------------------------------
$issueJson = gh issue view $Issue --json state,assignees 2>&1 | ConvertFrom-Json
$assignedToCopilot = [bool]($issueJson.assignees | Where-Object { $_.login -eq 'Copilot' })
Add-Check "El issue #$Issue sigue asignado a Copilot" $assignedToCopilot (($issueJson.assignees | ForEach-Object { $_.login }) -join ', ')

# --- Reporte ---------------------------------------------------------------
Write-Host ""
foreach ($c in $checks) {
  $mark = if ($c.Ok) { 'OK  ' } else { 'FALLA' }
  $color = if ($c.Ok) { 'Green' } else { 'Red' }
  Write-Host ("  [{0}] {1}" -f $mark, $c.Name) -ForegroundColor $color
  if ($c.Detail) { Write-Host ("         {0}" -f $c.Detail) -ForegroundColor DarkGray }
}

$failed = @($checks | Where-Object { -not $_.Ok })
Write-Host ""
Write-Host ("-" * 64)
if ($failed.Count -eq 0) {
  Write-Host "El Tiempo 5 SE PUEDE PRESENTAR." -ForegroundColor Green
  Write-Host "Aun asi, abre 'Files changed' una vez con tus propios ojos antes de presentar." -ForegroundColor DarkGray
  exit 0
} else {
  Write-Host "El Tiempo 5 NO se puede presentar — $($failed.Count) verificacion(es) en falla." -ForegroundColor Red
  Write-Host "Cierra la Escena 5 en el Tiempo 4: se sostiene sola. Ver docs/demo-script.md." -ForegroundColor Yellow
  if (-not $hasDiff) {
    Write-Host ""
    Write-Host "El diff vacio es el bloqueador conocido: el modelo del cloud agent no hace tool" -ForegroundColor Yellow
    Write-Host "calls. Ver docs/demo-runbook.md, Escena 5, Tiempo 5 — el primer paso es cambiar" -ForegroundColor Yellow
    Write-Host "el modelo del coding agent en la configuracion de Copilot de la org." -ForegroundColor Yellow
  }
  exit 1
}
