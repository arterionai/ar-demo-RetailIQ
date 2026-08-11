# Consultas de Application Insights — telemetría de devoluciones

> **Para qué sirve este documento**: las consultas KQL que se usan en la Escena 5 de la demo
> (ver `docs/demo-runbook.md`), verificadas contra el recurso real. Sirven tanto para que el
> presentador muestre el síntoma como para que Copilot lo diagnostique.

---

## Recurso

| Dato | Valor |
|---|---|
| Application Insights | `appi-palacio-returns` |
| Resource group | `rg-palacio-retailiq` (westus3) |
| App ID (para `az`) | `f0023bc8-f3bc-4838-9dd5-ce9a40728f41` |
| Log Analytics workspace | `log-palacio-returns` |
| Suscripción | `Sponsored 1000USD Nov 2026` (`33bbf1e1-…`) |

El connection string **no está en el repositorio** (ver `docs/constitution.md` §5.3). Vive en
`dotnet user-secrets` del proyecto de la API:

```powershell
# Ver que está configurado (no imprime el valor completo en pantalla si no quieres)
dotnet user-secrets list --project src/Palacio.Returns.Api

# Volver a configurarlo desde Azure si hiciera falta
$cs = az monitor app-insights component show --app appi-palacio-returns -g rg-palacio-retailiq --query connectionString -o tsv
dotnet user-secrets set "ApplicationInsights:ConnectionString" $cs --project src/Palacio.Returns.Api
```

Alternativa sin user-secrets: variable de entorno `APPLICATIONINSIGHTS_CONNECTION_STRING`.

**Cómo saber si la API está emitiendo telemetría**: al arrancar imprime en el log
`Telemetría de Application Insights: ACTIVA`. Si dice `desactivada (sin connection string
configurado)`, la API funciona igual pero no manda nada a Azure.

---

## Antes de presentar: sembrar el historial

La ingesta de Application Insights tarda **1 a 3 minutos**, así que el síntoma tiene que estar
en la telemetría *antes* de la demo — no se puede generar en vivo y consultar de inmediato.

> ⚠️ **No subas la concurrencia.** Los valores por omisión (`-Cases 250 -Parallel 3`) son los
> correctos. A concurrencia alta el exportador de Azure Monitor desborda su cola y descarta
> ~90% de los eventos **en silencio** — ver `docs/demo-runbook.md`, Escena 5, "Fidelidad de la
> telemetría medida".

```powershell
# Con la API corriendo (dotnet run --project src/Palacio.Returns.Api)
./scripts/seed-telemetry.ps1
```

---

## ⚠️ Comillas al usar `az` desde PowerShell

PowerShell mangla las comillas dobles al pasarlas a `az.cmd`, y la consulta falla con
`BadArgumentError: The request had some invalid properties`. **Usa comillas simples para los
literales dentro del KQL** (KQL las acepta igual) y comillas dobles para envolver el argumento:

```powershell
# ✅ funciona
az monitor app-insights query --app $app --analytics-query "requests | where name endswith 'inspection' | count"

# ❌ falla
az monitor app-insights query --app $app --analytics-query 'requests | where name endswith "inspection" | count'
```

En el portal de Azure (Logs) esto no aplica — ahí se escribe el KQL tal cual, con comillas dobles.

Para todas las consultas de abajo:

```powershell
$app = "f0023bc8-f3bc-4838-9dd5-ce9a40728f41"
```

---

## 1. Panorama de la operación

Lo primero que se muestra en pantalla: la operación *se ve sana*. Ningún reembolso rechazado por
error, ningún pico de errores evidente.

```kql
requests
| summarize peticiones = count(), fallidas = countif(success == false) by name
| order by peticiones desc
```

```powershell
az monitor app-insights query --app $app --offset 24h -o table --analytics-query "requests | summarize peticiones = count(), fallidas = countif(success == false) by name | order by peticiones desc"
```

---

## 2. Salud de la dependencia antifraude — el síntoma

```kql
dependencies
| where name == 'fraud-review'
| summarize consultas = count(), expiradas = countif(success == false)
| extend pct_expiradas = round(100.0 * expiradas / consultas, 1)
```

```powershell
az monitor app-insights query --app $app --offset 24h -o table --analytics-query "dependencies | where name == 'fraud-review' | summarize consultas = count(), expiradas = countif(success == false) | extend pct_expiradas = round(100.0 * expiradas / consultas, 1)"
```

---

## 2b. De dónde salió cada veredicto antifraude

Muy útil porque separa las tres rutas que puede tomar una revisión: la que sí consultó al motor,
la que se sirvió del registro en memoria sin consultar, y la que expiró.

```kql
dependencies
| where name == 'fraud-review'
| summarize n = count(), p50_ms = round(percentile(duration, 50))
    by origen = tostring(customDimensions['fraud.source']), success
| order by n desc
```

```powershell
./scripts/aiq.ps1 "dependencies | where name == 'fraud-review' | summarize n = count(), p50_ms = round(percentile(duration, 50)) by origen = tostring(customDimensions['fraud.source']), success | order by n desc"
```

Medición real de una siembra: **60 expiradas** (`timeout`, ~706 ms) contra **9** que sí obtuvieron
veredicto del motor (`fraud-engine`) y 69 servidas del registro en memoria (`already-reviewed`,
0 ms). Es decir: de todas las revisiones antifraude, una minoría llegó realmente a Prevención de
Pérdidas.

---

## 3. El patrón: la tasa de falla crece con el monto

Esta es la consulta que hace visible lo perverso del bug — **entre más caro el artículo, más
probable es que la revisión antifraude no se complete.**

```kql
dependencies
| where name == 'fraud-review'
| extend monto = todouble(customDimensions['fraud.purchase_amount'])
| summarize consultas = count(),
            expiradas = countif(success == false),
            p95_ms = round(percentile(duration, 95))
    by rango = case(monto <= 30000, '25k-30k',
                    monto <= 35000, '30k-35k',
                    monto <= 40000, '35k-40k',
                    'mas de 40k')
| extend pct_falla = round(100.0 * expiradas / consultas, 1)
| order by rango asc
```

**Importante**: excluye las servidas del registro en memoria (`already-reviewed`), que tardan 0 ms
y ensucian el patrón:

```powershell
./scripts/aiq.ps1 "dependencies | where name == 'fraud-review' and tostring(customDimensions['fraud.source']) != 'already-reviewed' | extend monto = todouble(customDimensions['fraud.purchase_amount']) | summarize consultas = count(), expiradas = countif(success == false) by rango = case(monto <= 30000, '1) 25k-30k', monto <= 35000, '2) 30k-35k', '3) mas de 35k') | extend pct_falla = round(100.0 * expiradas / consultas, 1) | order by rango asc"
```

Medición real de una siembra:

| Rango de monto | Consultas | Expiradas | % falla |
|---|---|---|---|
| 25k–30k | 11 | 2 | 18.2% |
| 30k–35k | 21 | 21 | **100%** |
| más de 35k | 37 | 37 | **100%** |

**Toda revisión antifraude por arriba de MXN $30,000 falla.** El presupuesto de espera está por
debajo de lo que el motor tarda para esos montos, así que el control es estructuralmente
inalcanzable justo en los casos para los que fue diseñado.

---

## 4. El hallazgo principal: reembolsos aprobados sin revisión antifraude completada

El control que nació del incidente de noviembre de 2025 (revisión antifraude obligatoria para
montos > MXN $25,000 — ver `docs/runbooks/incident-2025-11-return-fraud.md`) **no se está
cumpliendo**, y nada en la aplicación lo reporta como error.

```kql
requests
| where name endswith 'inspection'
| project operation_Id,
          devolucion = tostring(customDimensions['palacio.return_id']),
          antifraude = tostring(customDimensions['palacio.fraud_review_status']),
          reembolso  = tostring(customDimensions['palacio.refund_status'])
| join kind=inner (
    dependencies
    | where name == 'fraud-review' and success == false
    | project operation_Id, monto = todouble(customDimensions['fraud.purchase_amount'])
  ) on operation_Id
| where reembolso == 'Approved'
| project devolucion, monto, antifraude, reembolso
| order by monto desc
```

```powershell
az monitor app-insights query --app $app --offset 24h -o table --analytics-query "requests | where name endswith 'inspection' | project operation_Id, devolucion = tostring(customDimensions['palacio.return_id']), antifraude = tostring(customDimensions['palacio.fraud_review_status']), reembolso = tostring(customDimensions['palacio.refund_status']) | join kind=inner (dependencies | where name == 'fraud-review' and success == false | project operation_Id, monto = todouble(customDimensions['fraud.purchase_amount'])) on operation_Id | where reembolso == 'Approved' | project devolucion, monto, antifraude, reembolso | order by monto desc"
```

Cada renglón es una devolución de alto valor que quedó marcada como `Cleared` y con reembolso
`Approved` **aunque la consulta al motor antifraude nunca terminó**.

### Cuánto dinero representa

```kql
requests
| where name endswith 'inspection'
| project operation_Id, reembolso = tostring(customDimensions['palacio.refund_status'])
| join kind=inner (
    dependencies
    | where name == 'fraud-review' and success == false
    | project operation_Id, monto = todouble(customDimensions['fraud.purchase_amount'])
  ) on operation_Id
| where reembolso == 'Approved'
| summarize casos = count(), monto_total = sum(monto), monto_maximo = max(monto)
```

---

## 5. El segundo hallazgo: fallas intermitentes bajo concurrencia

```kql
exceptions
| summarize ocurrencias = count(), ultima = max(timestamp) by type, method, outerMessage
| order by ocurrencias desc
```

```powershell
az monitor app-insights query --app $app --offset 24h -o table --analytics-query "exceptions | summarize ocurrencias = count(), ultima = max(timestamp) by type, method, outerMessage | order by ocurrencias desc"
```

Aparece muy poco (del orden de **1 por cada varios cientos de inspecciones de alto valor**), lo
cual es justamente el punto: es imposible de reproducir a mano y no lo detecta ninguna prueba,
pero la telemetría lo tiene registrado con stack trace completo.

Para ver el stack trace, que apunta a la línea exacta:

```kql
exceptions
| where type == 'System.InvalidOperationException'
| project timestamp, method, outerMessage, details
| take 1
```

---

## Notas de uso

- `--offset 24h` define la ventana de tiempo; súbelo a `48h` o `7d` si sembraste el historial
  hace más tiempo.
- `-o table` es lo más legible en pantalla para una demo; `-o tsv` para procesar el resultado.
- Los `customDimensions` provienen de las etiquetas que la API pone en cada operación
  (`TagOutcome` en `ReturnsController`) y en la consulta al motor antifraude
  (`FraudReviewGateway`). Son puramente observacionales: no deciden ni validan nada.
