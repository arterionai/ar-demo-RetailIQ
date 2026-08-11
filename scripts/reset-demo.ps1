<#
.SYNOPSIS
    Devuelve el código de la demo al estado pre-presentación después de un ensayo.

.DESCRIPTION
    Ensayar la demo CONTAMINA el árbol de trabajo, porque dos escenas escriben código de verdad:

      - Escena 2: Copilot construye `GET /api/returns/{id}` + pruebas  → el repo queda en 11/11.
      - Escena 5: Copilot corrige los dos defectos de FraudReviewGateway → queda en 12/12.

    Si no se revierte, la siguiente pasada ya no tiene nada que construir (Escena 2) ni nada que
    diagnosticar (Escena 5): el endpoint ya existe y los defectos ya están corregidos. Este script
    devuelve `src/` al estado del baseline y verifica las dos invariantes que la demo necesita:

      1. `GET /api/returns/{id}` NO existe.
      2. La suite pasa en 9/9 — prueba de que los dos defectos siguen plantados y que las pruebas
         existentes no los detectan.

    NUNCA descarta a ciegas. Solo toca `src/`, muestra exactamente qué va a destruir y pide
    confirmación (salvo con -Force). Los documentos, `web/`, `scripts/` y `docs/` no se tocan: los
    ensayos no los modifican.

.PARAMETER Check
    Solo reporta el estado actual. No modifica nada y no pregunta nada. Úsalo para saber si el repo
    está listo para ensayar.

.PARAMETER CreateBaseline
    Captura el estado ACTUAL de `src/` como baseline (commit + tag `demo-baseline`). Corre esto una
    vez, ANTES del primer ensayo, con el repo en estado pre-demo. Verifica las invariantes antes de
    commitear: si no se cumplen, se detiene.

.PARAMETER Seed
    Después del reset, reinicia la API y siembra la telemetría. Requiere que la API no esté corriendo
    en otra terminal (este script no la mata: solo avisa).

.PARAMETER Force
    No pregunta antes de descartar. Para uso en ensayos repetidos, cuando ya sabes qué se va a perder.

.PARAMETER BaselineTag
    Nombre del tag de baseline. Por omisión `demo-baseline`.

.EXAMPLE
    ./scripts/reset-demo.ps1 -Check
    Reporta si el repo está listo para ensayar. No modifica nada.

.EXAMPLE
    ./scripts/reset-demo.ps1 -CreateBaseline
    Una sola vez, antes del primer ensayo.

.EXAMPLE
    ./scripts/reset-demo.ps1
    Reset después de un ensayo, con confirmación.

.NOTES
    Ver docs/demo-runbook.md, sección "Ciclo de ensayo y reset".

    Lo que este script NO hace, y hay que hacer a mano:
      - Reiniciar la API entre ensayos. El gateway antifraude recuerda 30 minutos a los clientes ya
        revisados (FraudReviewGateway.ReviewValidityWindow); si no la reinicias, el caso de Sofía se
        salta la consulta al motor y no aparece en el hallazgo de la Escena 5.
      - Revertir cambios en la rama remota. Si un ensayo hizo push o abrió un PR, eso se limpia en
        GitHub, no aquí.
#>
[CmdletBinding()]
param(
    [switch]$Check,
    [switch]$CreateBaseline,
    [switch]$Seed,
    [switch]$Force,
    [string]$BaselineTag = "demo-baseline"
)

$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0) {
    Write-Error "Esto no es un repositorio git. Corre el script desde dentro del repo."
    exit 1
}
Set-Location $repoRoot

$controller = "src/Palacio.Returns.Api/Controllers/ReturnsController.cs"

# --- Verificación de invariantes ------------------------------------------

function Test-NoGetEndpoint {
    if (-not (Test-Path $controller)) { return $false }
    $hits = Select-String -Path $controller -Pattern 'HttpGet' -ErrorAction SilentlyContinue
    return ($null -eq $hits -or $hits.Count -eq 0)
}

function Get-TestResult {
    Write-Host "  corriendo dotnet test..." -ForegroundColor DarkGray
    $out = dotnet test --nologo -v q 2>&1 | Out-String
    if ($out -match 'Failed:\s+(\d+),\s+Passed:\s+(\d+),\s+Skipped:\s+(\d+),\s+Total:\s+(\d+)') {
        return [pscustomobject]@{
            Failed = [int]$Matches[1]
            Passed = [int]$Matches[2]
            Total  = [int]$Matches[4]
            Raw    = $out
        }
    }
    return [pscustomobject]@{ Failed = -1; Passed = -1; Total = -1; Raw = $out }
}

function Write-State {
    param([switch]$RunTests)

    Write-Host ""
    Write-Host "Estado del repo" -ForegroundColor Cyan
    Write-Host "---------------"

    $noGet = Test-NoGetEndpoint
    if ($noGet) {
        Write-Host "  [OK]    GET /api/returns/{id} ausente  -> la Escena 2 es un build genuino" -ForegroundColor Green
    }
    else {
        Write-Host "  [MAL]   GET /api/returns/{id} PRESENTE -> la Escena 2 pierde su efecto" -ForegroundColor Red
    }

    $baselineExists = $null -ne (git tag -l $BaselineTag | Select-Object -First 1)
    if ($baselineExists) {
        $at = git rev-parse --short "$BaselineTag" 2>$null
        Write-Host "  [OK]    baseline '$BaselineTag' existe (commit $at)" -ForegroundColor Green
    }
    else {
        Write-Host "  [FALTA] no hay baseline '$BaselineTag' -> corre: ./scripts/reset-demo.ps1 -CreateBaseline" -ForegroundColor Yellow
    }

    $dirtySrc = @(git status --porcelain -- src/ 2>$null)
    if ($dirtySrc.Count -eq 0) {
        Write-Host "  [OK]    src/ sin cambios sin commitear" -ForegroundColor Green
    }
    else {
        Write-Host "  [AVISO] src/ tiene $($dirtySrc.Count) archivo(s) modificado(s)/nuevo(s):" -ForegroundColor Yellow
        $dirtySrc | ForEach-Object { Write-Host "            $_" -ForegroundColor DarkGray }
    }

    if ($RunTests) {
        $t = Get-TestResult
        if ($t.Total -eq 9 -and $t.Failed -eq 0) {
            Write-Host "  [OK]    9/9 en verde -> los dos defectos siguen plantados y sin detectar" -ForegroundColor Green
        }
        elseif ($t.Total -lt 0) {
            Write-Host "  [MAL]   no se pudo interpretar la salida de dotnet test" -ForegroundColor Red
            Write-Host $t.Raw -ForegroundColor DarkGray
        }
        else {
            Write-Host "  [MAL]   $($t.Passed)/$($t.Total) (fallidas: $($t.Failed)) -> se esperaba 9/9" -ForegroundColor Red
            if ($t.Total -gt 9) {
                Write-Host "          Hay más pruebas de las esperadas: probablemente quedaron las de un ensayo." -ForegroundColor DarkGray
            }
        }
        return ($noGet -and $t.Total -eq 9 -and $t.Failed -eq 0)
    }

    return $noGet
}

# --- Modo Check ----------------------------------------------------------

if ($Check) {
    $ok = Write-State -RunTests
    Write-Host ""
    if ($ok) {
        Write-Host "LISTO para ensayar (el código, al menos)." -ForegroundColor Green
        Write-Host "Falta que verifiques aparte: los 4 procesos arriba (5163, 5173, 5174, 5176)," -ForegroundColor DarkGray
        Write-Host "la telemetría sembrada, y la API reiniciada desde el último ensayo." -ForegroundColor DarkGray
    }
    else {
        Write-Host "NO listo. Corre ./scripts/reset-demo.ps1 para devolverlo al estado pre-demo." -ForegroundColor Yellow
    }
    exit 0
}

# --- Modo CreateBaseline -------------------------------------------------

if ($CreateBaseline) {
    Write-Host "Creando baseline de la demo" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "El baseline tiene que capturar el estado PRE-DEMO. Verificando invariantes..." -ForegroundColor DarkGray

    if (-not (Test-NoGetEndpoint)) {
        Write-Error "El endpoint GET /api/returns/{id} EXISTE en $controller. Este no es el estado pre-demo: si lo capturas como baseline, la Escena 2 deja de ser un build en vivo. Revierte el endpoint primero."
        exit 1
    }

    $t = Get-TestResult
    if (-not ($t.Total -eq 9 -and $t.Failed -eq 0)) {
        Write-Error "Se esperaba 9/9 en verde y salió $($t.Passed)/$($t.Total) (fallidas: $($t.Failed)). El estado pre-demo son 9 pruebas con los dos defectos plantados. No se creó el baseline."
        exit 1
    }
    Write-Host "  [OK] invariantes cumplidas (sin endpoint GET, 9/9 en verde)" -ForegroundColor Green

    if ($null -ne (git tag -l $BaselineTag | Select-Object -First 1)) {
        Write-Error "El tag '$BaselineTag' ya existe. Si de verdad quieres reemplazarlo: git tag -d $BaselineTag"
        exit 1
    }

    $toCommit = @(git status --porcelain -- src/ 2>$null)
    Write-Host ""
    if ($toCommit.Count -gt 0) {
        Write-Host "Se va a commitear SOLO src/ con estos cambios:" -ForegroundColor Yellow
        $toCommit | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        Write-Host ""
        Write-Host "Todo lo demás (docs/, web/, scripts/) se queda sin commitear, como está." -ForegroundColor DarkGray
    }
    else {
        Write-Host "src/ no tiene cambios: el baseline va a apuntar al HEAD actual." -ForegroundColor DarkGray
    }

    if (-not $Force) {
        Write-Host ""
        $answer = Read-Host "¿Continuar? (escribe SI)"
        if ($answer -ne "SI") { Write-Host "Cancelado. No se cambió nada." -ForegroundColor Yellow; exit 0 }
    }

    if ($toCommit.Count -gt 0) {
        git add -- src/
        git commit -m @'
chore(demo): fija el estado pre-demo de src/ como baseline de ensayos

Captura el codigo tal como tiene que estar antes de presentar: sin
GET /api/returns/{id} (la Escena 2 lo construye en vivo) y con los dos
defectos de FraudReviewGateway plantados, con la suite en 9/9.

El tag demo-baseline apunta aqui: scripts/reset-demo.ps1 restaura src/ a
este punto despues de cada ensayo.
'@
        if ($LASTEXITCODE -ne 0) { Write-Error "El commit falló."; exit 1 }
    }

    git tag -a $BaselineTag -m "Estado pre-demo: sin endpoint GET, dos defectos plantados, 9/9 en verde"
    if ($LASTEXITCODE -ne 0) { Write-Error "No se pudo crear el tag."; exit 1 }

    $at = git rev-parse --short $BaselineTag
    Write-Host ""
    Write-Host "Baseline '$BaselineTag' creado en $at." -ForegroundColor Green
    Write-Host "A partir de ahora, después de cada ensayo: ./scripts/reset-demo.ps1" -ForegroundColor DarkGray
    exit 0
}

# --- Modo reset (por omisión) --------------------------------------------

if ($null -eq (git tag -l $BaselineTag | Select-Object -First 1)) {
    Write-Error "No existe el baseline '$BaselineTag', así que no hay a dónde regresar. Con el repo en estado pre-demo, corre primero: ./scripts/reset-demo.ps1 -CreateBaseline"
    exit 1
}

Write-Host "Reset de la demo al baseline '$BaselineTag'" -ForegroundColor Cyan

$modified = @(git diff --name-only "$BaselineTag" -- src/ 2>$null)
$untracked = @(git ls-files --others --exclude-standard -- src/ 2>$null)

if ($modified.Count -eq 0 -and $untracked.Count -eq 0) {
    Write-Host ""
    Write-Host "src/ ya coincide con el baseline: no hay nada que revertir." -ForegroundColor Green
    Write-State -RunTests | Out-Null
    exit 0
}

Write-Host ""
Write-Host "Se va a DESCARTAR lo siguiente (irreversible):" -ForegroundColor Yellow
if ($modified.Count -gt 0) {
    Write-Host "  Modificados, vuelven al baseline:" -ForegroundColor Yellow
    $modified | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
}
if ($untracked.Count -gt 0) {
    Write-Host "  Nuevos, se BORRAN:" -ForegroundColor Yellow
    $untracked | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
}
Write-Host ""
Write-Host "Nada fuera de src/ se toca." -ForegroundColor DarkGray

if (-not $Force) {
    $answer = Read-Host "¿Continuar? (escribe SI)"
    if ($answer -ne "SI") { Write-Host "Cancelado. No se cambió nada." -ForegroundColor Yellow; exit 0 }
}

git restore --source="$BaselineTag" --staged --worktree -- src/
if ($LASTEXITCODE -ne 0) { Write-Error "El restore falló. Revisa el estado con: git status"; exit 1 }

foreach ($f in $untracked) {
    Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue
}

# Los directorios que quedaron vacíos al borrar archivos nuevos (p. ej. carpetas de pruebas que
# creó Copilot) estorban al siguiente ensayo: se ven como estructura existente.
Get-ChildItem -Path "src" -Directory -Recurse -ErrorAction SilentlyContinue |
    Sort-Object { $_.FullName.Length } -Descending |
    Where-Object { -not (Get-ChildItem -LiteralPath $_.FullName -Recurse -File -ErrorAction SilentlyContinue) } |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "src/ restaurado. Verificando..." -ForegroundColor Cyan
$ok = Write-State -RunTests

Write-Host ""
if (-not $ok) {
    Write-Error "El reset corrió pero las invariantes NO se cumplen. No ensayes así: revisa el estado a mano antes de seguir."
    exit 1
}

Write-Host "Reset completo. El código está en estado pre-demo." -ForegroundColor Green
Write-Host ""
Write-Host "Todavía a mano, antes de volver a ensayar:" -ForegroundColor Yellow
Write-Host "  1. REINICIAR la API (el gateway antifraude recuerda 30 min a los clientes revisados)." -ForegroundColor Yellow
Write-Host "  2. Volver a sembrar la telemetría si la última siembra tiene más de 24 h." -ForegroundColor Yellow
Write-Host "  3. Confirmar los 4 procesos: 5163 (API), 5173 (Mi Palacio), 5174 (Ops), 5176 (concierge)." -ForegroundColor Yellow

if ($Seed) {
    Write-Host ""
    Write-Host "-Seed activo: sembrando telemetría." -ForegroundColor Cyan
    Write-Host "OJO: esto solo sirve si YA reiniciaste la API. Si no, la siembra reusa el estado viejo." -ForegroundColor Yellow
    & "$repoRoot/scripts/seed-telemetry.ps1"
}
