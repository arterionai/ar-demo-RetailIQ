# Guion de demo en vivo — Inteligencia Palacio

> **Propósito de este documento**: qué cuenta usar, qué escribir/hacer y qué esperar en cada escena
> de la demo, para que quien presente (o ensaye) no tenga que improvisar. Distingue explícitamente
> lo **verificado en vivo** (ya lo probamos y funcionó) de lo **esperado pero no verificado**.
>
> **Nota de precisión importante**: no existen conversaciones reales de Teams entre los 10
> personajes — las herramientas disponibles para construir esta demo eran de solo-lectura para
> Teams. Lo que sí existe son documentos de SharePoint tipo "Recap de canal [Nombre]" que simulan
> esas conversaciones. Work IQ los encuentra y cita perfectamente (por eso todas las fuentes dicen
> "sharepoint", nunca "teams"). **Al presentar, di "lo encontré en documentos y correos del
> equipo", nunca "en una conversación de Teams"** — así queda preciso si alguien lo verifica en vivo.

---

## 0. Antes de presentar — checklist de cuentas y accesos

| Cuenta | Rol en la demo | Acceso que necesita |
|---|---|---|
| `maria.torres@fractalcs.com` | Protagonista — hace las preguntas a Work IQ en Teams (Escena 1) | Miembro del sitio "Proyecto Espejo"; **sin acceso** a `00-CONFIDENCIAL-FraudeCompliance` (a propósito) |
| `jaime.sanchez@arterion.ai` (o quien presente) | Observador/demo del comportamiento con permisos completos, si se usa para mostrar el contraste | Miembro del sitio + acceso explícito a la carpeta confidencial (ver instrucciones de sharing pendientes) |
| Cuenta de Jorge Ramírez (`jorge.ramirez@fractalcs.com`) | Construye el endpoint (Escena 2) y diagnostica con Application Insights (Escena 5) en VS Code con Copilot | Acceso al repo `arterionai/ar-demo-RetailIQ` |
| Sesión de Azure CLI (`arterionllc@outlook.com`, suscripción `Sponsored 1000USD Nov 2026`) | Consultar Application Insights en la Escena 5 | `az login` activo; lectura sobre `rg-palacio-retailiq` |

**Antes de la presentación real** (no el mismo día que se sembró el contenido): vuelve a correr las
3 preguntas de la Escena 1 una vez más — la primera vez algunas respuestas no encontraron el
"cuándo/por qué" del cambio de ADR-014 ni el postmortem, muy probablemente por latencia de indexado
de SharePoint/Copilot sobre contenido recién creado. Confirma que ya salen completas.

---

## Escena 1 — María reconstruye el contexto (Teams, Work IQ)

**Quién actúa:** inicia sesión como `maria.torres@fractalcs.com` en Teams (o el presentador
explica "esto lo escribiría María").

**Qué escribir (en este orden, como 3 mensajes separados a Work IQ/Copilot):**

1. > antes de diseñar nada, necesito entender cómo funciona hoy la devolución omnicanal. ¿Qué decisiones existen, qué incidentes hay, y a quién debería involucrar?
   >
   > **✅ Verificado en vivo.** Respuesta real obtenida: flujo AS-IS completo, decisiones de
   > elegibilidad/excepciones/monto de riesgo, el incidente de noviembre, el dato de que **61% de
   > las llamadas al call center son clientes preguntando si su devolución será aceptada**, y la
   > matriz RACI completa (Pedro Molina, Gabriela León, Fernanda Ortiz, Ricardo Salas, Daniel
   > Castro, Laura Martínez, Ana Sofía Ruiz, Carlos Vega). Fuente citada: SharePoint (política
   > vigente, customer journey, arquitectura objetivo, research de clientes, RACI).

2. > Encontré información contradictoria sobre si la app puede conectarse directamente a SAP. ¿Cuál es la decisión vigente, cuándo cambió y por qué? / (seguimiento) ¿Por qué cambió la decisión de SAP?
   >
   > **✅ Verificado en vivo — confirma que era indexado, no permisos.** Al reintentar más tarde,
   > Work IQ ya cita todo completo: la propuesta original (conectar la app directo a SAP para
   > simplificar y acelerar el desarrollo), que se discutió y descartó en la revisión de
   > arquitectura del **22 de septiembre de 2025**, y las 5 razones documentadas (desacoplar
   > móvil/ERP, auditoría centralizada, manejo de errores sin duplicar lógica por canal, antifraude
   > consistente, trazabilidad completa) más la restricción de Daniel Castro ("SAP no puede recibir
   > solicitudes incompletas").
   >
   > **Matiz importante que Work IQ corrigió solo, mejor que el guion original:** el ADR-014 (22 de
   > septiembre) **ya existía antes** del incidente de noviembre — no fue una reacción al
   > incidente. Lo que pasó es que la regla "el móvil nunca decide la aprobación" no era verificable
   > en code review porque el ADR **no estaba referenciado desde el repositorio de código todavía**.
   > La acción correctiva del postmortem fue justamente incorporar el ADR-014 al repo como
   > referencia obligatoria en los PRs — que es exactamente lo que existe hoy en
   > `docs/adr/ADR-014-returns-orchestration.md` y las referencias en las PRs reales del repo. Usa
   > esta versión (gobernanza-sin-enforcement-en-código, no "cambio de opinión post-incidente") al
   > narrar la escena — es más precisa y más interesante.

3. > ¿Ha ocurrido antes algún incidente relacionado con aprobar un reembolso demasiado pronto? ¿Qué aprendimos y qué controles debemos conservar?
   >
   > **✅ Verificado en vivo — y es una escena en dos actos, mejor que lo guionado originalmente.**
   >
   > **Acto 1 — preguntando sin acceso a la carpeta confidencial:** Work IQ encuentra
   > correctamente el incidente y los controles vigentes (inspección física obligatoria antes de
   > reembolso, validación de elegibilidad, registro de aprobación/rechazo, antifraude,
   > desacoplamiento del ERP), pero dice explícitamente que **no encontró una sección de
   > "lecciones aprendidas" ni un postmortem formal**. Este es el comportamiento CORRECTO — la
   > carpeta `00-CONFIDENCIAL-FraudeCompliance` tiene permisos restringidos a propósito. Work IQ
   > no inventa un documento que no puede ver.
   >
   > **Acto 2 — con permisos, preguntando explícitamente** ("checa si no ha habido ningún
   > postmortem relacionado a las devoluciones"): Work IQ encuentra el postmortem y **dice él
   > mismo por qué no había aparecido antes** — cita textual real: *"No estaba apareciendo en las
   > búsquedas anteriores porque está marcado como confidencial."* Esta frase, dicha por el propio
   > producto, es más fuerte que cualquier línea de guion que yo hubiera escrito — úsala tal cual
   > en la presentación.
   >
   > Detalle real que sacó del postmortem (coincide con el código real del repo): causa raíz
   > `RefundEligibilityEvaluator.IsRefundApproved` interpretando "recibido" como "aprobado", 41
   > devoluciones procesadas de más, 6 de alto valor, ~MXN $380,000, y los 5 controles que nacieron
   > de ese incidente (separar recibido/inspeccionado, prohibición de reembolso pre-inspección,
   > antifraude para alto valor, orquestación obligatoria, pruebas de regresión).

**Frase narrativa de cierre de escena:** "No estamos usando IA para inventar respuestas. Estamos
usando IA para conectar la memoria de Palacio — y cuando no sabe algo con certeza, lo dice. Y
cuando sí tiene permiso de saberlo, lo dice también, y explica por qué antes no podía."

---

## Escena 2 — Jorge construye el endpoint en vivo (VS Code + GitHub Copilot)

**Resuelto: se revirtió el GET a propósito, para que esta escena vuelva a ser en vivo de
verdad.** El `GET /api/returns/{id}` se había implementado para construir la Escena 4, pero ya se
quitó de `ReturnsController.cs` (y su test) — `main` vuelve a compilar en 9/9 tests, sin el
endpoint. El hub SignalR y las transmisiones en vivo (`BroadcastStatusAsync`) SÍ se quedaron
permanentemente, porque no dependen del GET. Consecuencia importante: **hasta que esta escena se
corra en vivo, "Buscar por folio" en Operations Console y por lo tanto la Escena 4 no van a
funcionar** — eso es intencional, es lo que hace que el orden Escena 2 → Escena 4 tenga sentido
dramático (Copilot construye la pieza que el asociado necesita, y de inmediato se usa).

### ⚠️ El revert se había llevado también el frontend — corregido el 11 de agosto de 2026

**Esto era un fallo que rompía la Escena 4.** El revert `2fc8e21` quitó el endpoint del backend
(intencional) **pero además borró el frontend que lo consumía**, que se había construido en
`b8a913e`:

| Archivo | Qué se había perdido |
|---|---|
| `web/operations-console/.../FolioSearchInput.tsx` | 85 líneas: el input funcional, el botón Buscar, el estado de carga y el mensaje "No se encontró ese folio" |
| `web/operations-console/.../hooks/ReturnCasesContext.tsx` | 41 líneas: la lógica `searchFolio` |
| `web/operations-console/src/lib/api-client.ts` | La función `searchReturnByFolio` |

Lo que quedó en su lugar fue un input con **`disabled` clavado en el código** y un badge estático
"Próximamente" — no condicional. Es decir: **la Escena 2 podía correr perfecto, quedar en 11/11
verde, y la consola seguiría diciendo "Próximamente" para siempre**, porque el prompt de la Escena 2
solo pide el backend. Sin búsqueda por folio, el asociado no tiene ninguna forma de traer el caso
real que Sofía acaba de crear: la cola visible son 3 mocks estáticos cuyos IDs no son GUIDs de la
API.

**Corregido**: los tres archivos se restauraron tal cual desde `b8a913e`. Se descartó ampliar el
prompt de la Escena 2 para que Copilot construyera también el frontend — habría invalidado el 11/11
ya verificado y alargado una escena de 2 minutos.

**Verificado tras la restauración:**

- `tsc -b --noEmit` de `operations-console` en limpio.
- Un `GET /api/returns/{cualquier-cosa}` contra la API sin el endpoint devuelve **404** (probado con
  un GUID y con un folio tipo `WEB-58317`), y **CORS responde al origen `http://localhost:5174`**.
  Eso importa: el navegador ve el 404 limpio y la UI muestra *"No se encontró ese folio."* en vez de
  un error de CORS genérico. **El fallo previo a la Escena 2 es elegante, no roto.**
- El backend sigue sin `HttpGet`: la Escena 2 sigue siendo una construcción en vivo genuina.
- Este mismo código **ya estaba verificado de punta a punta** cuando el endpoint existía (ver el
  pendiente cerrado de la Escena 4: folio search real + hub SignalR + línea de tiempo animada). Lo
  único que le faltaba era el endpoint, que es justo lo que la Escena 2 construye.

**Beneficio narrativo que esto habilita**: la dependencia Escena 2 → Escena 4 deja de ser una
afirmación de este runbook y se vuelve visible en pantalla. Al inicio de la Escena 2 el presentador
enseña la búsqueda sin nada detrás; en la Escena 4 la misma caja trae el caso real de Sofía. Ver
`docs/demo-script.md`, Escena 2 ("Antes de construir: enseña el hueco") y Escena 4.

> ⚠️ **Precisión obligatoria al narrar el hueco:** el "No se encontró ese folio" es idéntico a lo que
> se vería si el folio simplemente no existiera — **la pantalla no prueba que falte el endpoint.** El
> presentador afirma "no hay nada detrás" como algo que sabe y está por demostrar construyéndolo,
> nunca como algo que la pantalla acaba de demostrar.

**`reset-demo.ps1` no necesita cambios por esto.** Copilot solo toca `src/` en las Escenas 2 y 5; el
frontend restaurado queda permanente en `main` y ningún ensayo lo modifica.

**Quién actúa:** Jorge Ramírez (o el presentador en su nombre), en VS Code con Copilot Agent Mode
abierto sobre el repo `arterionai/ar-demo-RetailIQ`.

**Qué escribir a Copilot** (✅ ensayado en un worktree aislado, descartado después — build y tests
en verde a la primera; ver nota de ambigüedad resuelta abajo):

> Con el contexto que Work IQ acaba de reconstruir sobre devoluciones omnicanal — ADR-014 (todo
> pasa por Returns Orchestrator, ningún canal de cliente decide el reembolso, SAP solo participa
> después de la inspección aprobada) y el incidente de noviembre 2025 (recibido ≠ aprobado,
> revisión antifraude obligatoria para montos > MXN $25,000) — agrega el endpoint que falta hoy:
> consultar el estatus de una devolución por ID.
>
> Requisitos:
> - `GET /api/returns/{id}` en `Palacio.Returns.Api`, devolviendo el mismo
>   `ReturnRequestResponseDto` que ya usan los demás endpoints.
> - **Inyecta `IReturnRequestRepository` directamente en el controller**, junto al
>   `ReturnWorkflowService` ya existente — no agregues un método de paso en el servicio. Sin
>   lógica de negocio nueva en el controller.
> - 404 si el ID no existe.
> - Agrega un test en `Palacio.Returns.Tests`.
> - Prepara un mensaje de PR breve citando ADR-014 y el incidente de noviembre como contexto de
>   por qué este endpoint es de solo lectura.

**Nota sobre la línea en negritas:** el ensayo reveló que sin esa instrucción explícita, Copilot
tiene que decidir entre dos diseños igual de válidos (inyectar el repo directo, o agregar un
método de paso en `ReturnWorkflowService`) — una pausa de diseño evitable en vivo. Ya viene resuelta
en el prompt de arriba.

**Qué debería pasar (verificado en el ensayo):**
- Nuevo `GetReturnStatus` en `ReturnsController.cs`, reutilizando el `ToResponseDto` privado ya
  existente — sin duplicar lógica.
- `IReturnRequestRepository.GetByIdAsync` ya existía (Copilot no tuvo que inventarlo ni asumir que
  hacía falta agregarlo — buena señal de "revisa antes de asumir").
- 2 tests nuevos seguiendo la convención `MethodName_Should[Expected]_When[Condition]`:
  `GetReturnStatus_ReturnsOkWithDto_WhenRequestExists`,
  `GetReturnStatus_ReturnsNotFound_WhenRequestDoesNotExist`.
- `dotnet build` + `dotnet test`: **11/11 en verde**, sin ciclo de fix.
- Texto de PR redactado citando ADR-014 y el runbook del incidente, explicando por qué el endpoint
  es deliberadamente de solo lectura (no reintroduce la ambigüedad recibido/aprobado del incidente).

**Timing:** en el ensayo, lectura de contexto + implementación + verificación fue rápido y sin
ciclo de debugging — cómodo para el tiempo de una demo en vivo.

**Nota histórica:** este prompt se ensayó dos veces. La primera, en un worktree aislado y
descartado. La segunda, se implementó de verdad en `main` para poder construir y verificar la
Escena 4 de punta a punta (con datos reales, no supuestos) — y una vez confirmado que la Escena 4
funciona, **se revirtió deliberadamente** (se quitó `GetReturnStatus` de `ReturnsController.cs` y
su test; el hub SignalR y las transmisiones en vivo NO se tocaron, esos se quedan permanentes) para
que esta escena vuelva a ser una construcción en vivo genuina. `main` está hoy en 9/9 tests, sin
el endpoint — exactamente como debe estar antes de presentar.

---

## Escena 3 — Sofía completa el flujo en Mi Palacio (cliente)

**Quién actúa:** el presentador, como clienta (Sofía), en `http://localhost:5173`.

**Qué hacer:**
1. Clic en **"¿Necesitas ayuda con esta compra?"**.
2. Esperar el saludo proactivo del Concierge (no hace falta escribir primero).
3. Escribir: *"la talla no me quedó y necesito una talla diferente para la gala que tengo el sábado"*.
4. El Concierge dirá en qué tiendas está disponible (Polanco y Santa Fe) — elegir una, ej. *"sí, vamos con Santa Fe por favor"*.
5. Se reserva de verdad, se abre el caso real, se genera el QR real.
6. Clic en **"Ver estatus de mi devolución"** — se abre el **Seguimiento en vivo** (línea de tiempo
   animada, ver Escena 4). Déjala abierta: es la pantalla que va a reaccionar sola en la Escena 4.

**✅ Verificado en vivo** (los 6 pasos, con navegador real, contra los 4 procesos reales corriendo:
API .NET + proxy Azure OpenAI + hub SignalR + Vite).

---

## Escena 4 — El momento apantallador: la clienta ve el cambio en vivo

**Esta es la escena que conecta Mi Palacio y Operations Console de verdad, en tiempo real, frente
a la audiencia.** Requiere dos pantallas visibles a la vez (proyector dividido, o dos laptops).

**Qué hacer:**
1. Con la pantalla de **Seguimiento en vivo** de Sofía (Escena 3, paso 6) todavía abierta y
   visible, cambia a Operations Console.
2. En **"Buscar por folio / ID de caso"**, pega el ID real de la devolución de Sofía (el
   presentador lo copia de la pantalla de Mi Palacio — visible como "SOLICITUD XXXXXXXX", aunque
   para pegarlo completo conviene tenerlo copiado de antemano en el portapapeles, ya que la UI solo
   muestra los primeros 8 caracteres).
3. Clic en **"Recibir artículo"**. → En la pantalla de Sofía, sin tocar nada ni recargar, el paso
   3 de la línea de tiempo se ilumina: **"✓ Artículo recibido en tienda"**.
4. Clic en **"Aprobar inspección"**. → En la pantalla de Sofía, de nuevo en vivo, el paso final se
   ilumina: **"✓ ¡Tu cambio fue confirmado!"**.

**Frase narrativa:** "Esto no son dos demos por separado. Es el mismo caso real, viajando por el
mismo sistema — y la clienta lo ve pasar, en vivo, sin refrescar nada."

> ⚠️ **Depende de la Escena 2**: "Buscar por folio" (paso 2 de arriba) solo funciona una vez que
> el `GET /api/returns/{id}` existe — hoy está deliberadamente revertido (ver Escena 2). Esta
> escena se verificó de punta a punta ANTES de revertirlo (ver nota de verificación abajo); en la
> presentación real, correrá igual en cuanto la Escena 2 termine de construirlo en vivo.

**✅ Verificado en vivo, con dos navegadores reales por separado** (contextos de browser
independientes, simulando dos dispositivos distintos), en el momento en que el GET aún existía
en `main` para poder probarlo: se creó el caso real de Sofía por conversación completa en Mi
Palacio, se buscó ese mismo ID en Operations Console, y ambas acciones
(`recibir` y `aprobar inspección`) se reflejaron en la pantalla de Mi Palacio sin recargar, vía el
hub `ReturnStatusHub` (SignalR). En el camino se encontró y arregló un bug real: el CORS del
backend no permitía credenciales, y el cliente SignalR las manda por defecto en su negociación —
sin esto, la conexión fallaba silenciosamente y la línea de tiempo se quedaba en "Sin conexión".

**Arquitectura (para preguntas técnicas de la audiencia):** `Palacio.Returns.Api` expone un hub
SignalR (`/hubs/return-status`) que agrupa conexiones por ID de devolución. Cada acción real
(recibir, inspección, etc.) transmite el DTO actualizado a ese grupo. El hub no contiene lógica de
negocio — solo relé de un estado ya calculado por `ReturnWorkflowService`.

**Alternativa si NO se encadena con la Escena 3** (por ejemplo, si se presenta Operations Console
de forma aislada): clic en **"Cargar casos de ejemplo"**, seleccionar un caso, **"Recibir artículo"**
y **"Aprobar inspección"**. Vista de Asociado verificada con llamadas reales contra la API. Esta
variante pierde el efecto del split screen — úsala solo como respaldo.

---

## Escena 5 — Application Insights encuentra lo que nadie vio

**Qué demuestra esta escena:** que el mismo contexto de negocio que Work IQ desenterró en la
Escena 1 (el postmortem, los controles que nacieron de él) sirve para *auditar* el sistema, no solo
para construirlo. Y que hay una clase de defecto que ninguna prueba y ningún code review detecta,
pero la telemetría sí.

**Quién actúa:** Jorge Ramírez (o el presentador), en terminal + VS Code con Copilot Agent Mode.

### El defecto está deliberadamente en `main`

Igual que el `GET /api/returns/{id}` de la Escena 2, esto **no es un bug accidental**: está plantado
a propósito para que la escena sea un diagnóstico real y en vivo.

**A propósito NO hay ningún comentario en el código fuente que lo delate** — si lo hubiera, Copilot
lo leería y la escena sería falsa. El único lugar donde está documentado es este runbook.

Vive en `src/Palacio.Returns.Infrastructure/Fraud/FraudReviewGateway.cs`, que pasó de ser un mock
trivial a simular el motor real de Prevención de Pérdidas. Son **dos defectos** introducidos como
si vinieran de un mismo cambio bienintencionado de "robustez y performance":

| # | Defecto | Por qué sobrevive un code review | Cómo se ve en telemetría |
|---|---|---|---|
| 1 | El `catch (OperationCanceledException)` devuelve `FraudReviewStatus.Cleared` cuando el motor antifraude expira | Hay try/catch, hay fallback, hay un comentario razonable ("no dejar a la clienta esperando"). Se lee como código defensivo. | Dependencia `fraud-review` con `success == false`, y la misma operación con `refund_status = Approved` |
| 2 | El registro de clientes ya revisados es un `List<T>` estático, mutado y recorrido sin sincronización desde peticiones concurrentes | Se lee como un caché sensato. Los 9 tests existentes son single-thread y pasan. | 500 intermitentes con `InvalidOperationException: Collection was modified` — **muy raros** (ver aviso abajo) |

El motor simulado tarda más conforme crece el monto (85 ms por regla, y más reglas a mayor monto),
contra un presupuesto de espera de 700 ms. Consecuencia perversa y medida: **el 100% de las
revisiones arriba de MXN $30,000 expira** — el control se salta exactamente en los casos para los
que existe.

> ⚠️ **El defecto #2 casi nunca aparece en la telemetría sembrada.** Medido: ~1 ocurrencia por cada
> 400-700 inspecciones de alto valor, y el exportador descarta eventos cuando se siembra en ráfaga.
> **No planees mostrarlo en Application Insights.** Aparece por lectura de código (Copilot lo
> encuentra al abrir el archivo que la telemetría señaló) y se reproduce de forma **determinista**
> con un test de concurrencia. Así se presentó en el ensayo y funciona mejor así: "esto es lo que
> la telemetría no alcanza a mostrarte, y aun así estaba ahí".

### Verificado

- **9/9 tests en verde en `main` con los dos defectos plantados**, build sin warnings. Es la prueba
  de que la suite existente no los detecta.
- **Telemetría real verificada** contra `appi-palacio-returns` (ver
  `docs/runbooks/appinsights-queries.md` para las consultas y los números medidos): 138 revisiones
  antifraude, 60 expiradas, y solo 9 con veredicto real del motor.
- **Fidelidad de la telemetría medida**: a concurrencia baja llega el 100% (verificado: 30 de 30
  peticiones y 10 de 10 dependencias). A concurrencia 40 el exportador de Azure Monitor desborda su
  cola y **descarta ~90% de los eventos en silencio**. Por eso `seed-telemetry.ps1` usa
  concurrencia 3 por omisión — no la subas.

### Qué escribir a Copilot

> La telemetría de Application Insights de `Palacio.Returns.Api` muestra algo que no cuadra: hay
> devoluciones de alto valor con el reembolso aprobado aunque la consulta al motor antifraude no
> completó.
>
> Tienes acceso a la telemetría real: el helper `./scripts/aiq.ps1 "<KQL>"` corre consultas contra
> el recurso, y en `docs/runbooks/appinsights-queries.md` están las consultas de referencia.
>
> Investiga la telemetría, encuentra la causa raíz en el código y arréglala. En concreto:
> - explica qué está pasando y por qué la aplicación nunca lo reportó como error;
> - relaciónalo con ADR-014 y con el incidente de noviembre 2025
>   (`docs/runbooks/incident-2025-11-return-fraud.md`);
> - escribe **primero** las pruebas que fallen y reproduzcan el problema, luego corrige;
> - corre `dotnet test`;
> - prepara un mensaje de PR breve.

### Qué debería pasar (ensayado en worktree aislado, luego descartado)

El ensayo se hizo con Claude Code sobre un worktree separado (mismas capacidades que Copilot Agent
Mode: leer el repo y correr comandos en terminal). Resultado:

- **3 pruebas nuevas** en `src/Palacio.Returns.Tests/Domain/FraudReviewGatewayTests.cs`, las tres
  fallando contra el código con los defectos — reproducciones genuinas, no pruebas decorativas:
  - `ReviewAsync_ShouldNotReportCleared_WhenFraudEngineExceedsItsTimeBudget` → devolvía `Cleared`
  - `ApproveInspection_ShouldNotApproveRefund_WhenFraudReviewDidNotComplete` → el reembolso quedaba
    `Approved` (este es el que conecta con el incidente de noviembre)
  - `ReviewAsync_ShouldNotThrow_WhenManyReviewsRunConcurrently` → `InvalidOperationException:
    Collection was modified`, **en 71 ms**
- **El fix**: en el timeout devolver `FraudReviewStatus.Pending` en lugar de `Cleared` (fail-closed
  — sin revisión completada no hay reembolso ni folio de SAP), y cambiar el `List<T>` estático por
  `ConcurrentDictionary<string, DateTime>`, registrando solo revisiones efectivamente resueltas.
- **`dotnet test`: 12/12 en verde.**
- Copilot debería además actualizar el comentario de la clase, que todavía describe la lógica vieja.

**Timing del ensayo:** el diagnóstico (correr consultas, leer el archivo, escribir 3 pruebas,
corregir, verificar) es cómodo en ~2 minutos de trabajo de agente. Presupuesta 3:15 en total con la
narración.

### Consecuencia importante del fix, para no llevarte una sorpresa

Después del fix, una devolución de alto valor cuya revisión antifraude expire **ya no llega a
reembolso aprobado**: queda pendiente. En la línea de tiempo de Mi Palacio eso significa que el
paso final ("✓ ¡Tu cambio fue confirmado!") **no se ilumina** para el caso de Sofía (MXN $32,500),
porque `LiveTrackingTimeline` exige que el reembolso esté resuelto.

Esto es el comportamiento **correcto** —es literalmente lo que pidió el postmortem de noviembre—
pero cambia lo que se ve en pantalla. Dos implicaciones:

1. **Corre la Escena 4 antes de la Escena 5.** Si vuelves a hacer el flujo de Sofía después del
   fix, el final feliz del split screen ya no sale igual.
2. Si alguien de la audiencia lo pregunta, la respuesta es buena: *"exacto — ahora la clienta espera
   unos minutos a que se resuelva su revisión, en lugar de que Palacio pierda 380 mil pesos."*

Si prefieres cerrar sin ese matiz, el fix completo también implicaría subir el presupuesto de espera
o volver asíncrona la consulta al motor; el mensaje de PR de Copilot suele mencionarlo como
siguiente paso.

### Tiempo 2 — la alerta que despierta al SRE Agent

**Verificado el 6 de agosto de 2026:** el agente `dem-pdh-sreagent` **está desplegado** en
`rg-palacio-retailiq`, junto al Application Insights que vigila.

Pero se encontró un hueco de fondo: **no existía ninguna regla de alerta en toda la suscripción.**
El agente estaba desplegado y nada lo iba a despertar. Toda la frase *"nadie se lo pidió, lo encontró
solo"* colgaba de una alerta que no existía.

**Ya creada, con `scripts/setup-fraud-alert.ps1`:**

| Campo | Valor |
|---|---|
| Nombre | `alert-fraud-review-incomplete` |
| Tipo | Búsqueda de logs (scheduled query rule) sobre `appi-palacio-returns` |
| Condición | Más de **5** consultas a `fraud-review` que no completan, en devoluciones **> MXN 30,000**, excluyendo `already-reviewed` |
| Ventana / frecuencia | 15 min / evalúa cada 5 min |
| Severidad | 2, con auto-mitigación |
| Estado | ✅ creada, habilitada y verificada (`-Check`) |

El KQL se validó por separado contra el recurso real antes de crear la regla: parsea correctamente.
Se excluye `already-reviewed` porque esas revisiones no consultan al motor —salen del registro en
memoria— y no representan un control saltado.

#### ✅ VERIFICADO: la alerta dispara sola, en 1 a 5 minutos

Tres corridas medidas el 6 de agosto de 2026 (horas UTC):

| Siembra | Alerta disparada | Retraso |
|---|---|---|
| 07:39:30 | 07:40:35 | ~1 min |
| 14:16:13 | 14:20:38 | ~4 min |
| 15:17:41 | 15:20:03 | ~2.4 min |

**El rango honesto es 1 a 5 minutos**, según dónde caiga la siembra en la cadencia de evaluación de 5
minutos de la regla. (La primera medición dio ~1 min y por un rato se documentó como "poco más de un
minuto": era suerte, no la norma.)

Muy por debajo de los ~15 minutos que estima el guion. Esa cifra cubría toda la cadena
(alerta + investigación); ahora sabemos que **el tramo de la alerta es despreciable y lo que falta
medir es solo la investigación**.

También verificado: **`autoMitigate` funciona** — la alerta de las 14:20:38 se resolvió sola a las
14:46:40 cuando la ventana de 15 min dejó de contener los datos. Y el umbral está bien calibrado: la
siembra normal produjo 10 ocurrencias contra un umbral de 5.

#### ❌ NO FUNCIONA: el agente no recibe el incidente

Probado el 6 de agosto de 2026 con el response plan `escena5-antifraude-incompleto` ya creado
(**On**, Sev2, Meta Agent, autonomía **Review**). En https://sre.azure.com → *Incidents*:
**"No incidents found"**, todos los contadores en 0.

La alerta permaneció en `alertState: New` / `lastModifiedUserName: System` durante más de 12 minutos.
La documentación dice que el scanner del agente corre **cada minuto** y que **reconoce la alerta al
tomarla** — así que 12 minutos sin cambio no es lentitud: no está llegando.

**Lo que se descartó, con evidencia:**

| Hipótesis | Descartada porque |
|---|---|
| Falta `Monitoring Contributor` en la suscripción (lo pide la doc) | ✅ la identidad del agente **sí lo tiene** a nivel suscripción |
| El `targetResource` de la alerta cae fuera del RG administrado | ✅ apunta a `appi-palacio-returns`, `targetResourceGroup = rg-palacio-retailiq` |
| Severidad o título no coinciden con el plan | ✅ alerta Sev2 con "antifraude" en el título; plan en Sev2 con `Title contains: antifraude` |
| El cooldown de reinvestigación (3 h) la salta | ✅ entre los dos disparos pasaron 6h40m |
| El *merge lookback* de 7 días la fusiona con el disparo anterior de la misma regla | ✅ **experimento decisivo**: se creó una regla con **otro nombre** (`alert-antifraude-control-saltado`), disparó a las 15:20:03, y tampoco produjo incidente en ~7 min. Una regla distinta no se puede fusionar. Regla de prueba ya borrada |
| Providers sin registrar | ✅ `Microsoft.AlertsManagement` y `Microsoft.Monitor` registrados |

**Conclusión: el incident platform de Azure Monitor NO está conectado de verdad.** Que el portal
permita *crear un response plan* no implica que la plataforma esté conectada — son dos cosas
distintas, y el banner rojo original ("Connection to Azure Monitor failed") nunca se vio desaparecer.

**El obstáculo concreto:** la documentación dice *"Connect Azure Monitor from **Builder → Incident
platform** and save"*, y **ese menú no existe en el build de agosto de 2026**. Bajo Builder solo hay
Agent Canvas, Connectors, Knowledge Sources, Code Access, Skill Builder, Plugins y Hooks.

**Siguiente pista a probar:** el agente tiene `experimentalSettings.EnableConnectorsV2 = true`. Con
Connectors V2 el incident platform probablemente se movió a **Builder → Connectors** como un conector
más — es el único elemento de ese menú que no se ha revisado. Buscar ahí "Azure Monitor". Si tampoco
está, es caso de soporte de Microsoft: la configuración del lado del cliente está completa y
verificada.

El script es idempotente (`-Check`, `-ShowPayload`, `-Replace`) y usa `az rest` a propósito, para no
depender de la extensión `scheduled-query` del CLI, que no está instalada en esta máquina y cuya
instalación dinámica se queda esperando input. **Vuelve a correrlo si alguna vez borras y recreas el
agente.**

#### ⚠️ El cableado NO está terminado — y este paso no tiene CLI

Que la alerta exista hace que **el incidente exista**. Que el SRE Agent lo tome y arranque una
investigación por su cuenta se configura **del lado del agente**, en el portal, y no hay ruta por
línea de comandos.

**Síntoma observado el 6 de agosto de 2026:** en https://sre.azure.com, en *Incidents → Triggers +
response plans*, el portal muestra en rojo **"Connection to Azure Monitor failed. Please check your
configuration and try again."** y el botón *Add a response plan* aparece deshabilitado.

**Lo que se descartó revisando la configuración real del agente (todo esto está BIEN):**

| Cosa | Estado |
|---|---|
| `knowledgeGraphConfiguration.managedResources` | ✅ incluye `rg-palacio-retailiq` |
| `logConfiguration.applicationInsightsConfiguration` | ✅ apunta a `appi-palacio-returns` (appId `f0023bc8…`) |
| RBAC de la identidad administrada del agente sobre el RG | ✅ Reader + Monitoring Contributor + Log Analytics Reader |
| La regla de alerta | ✅ existe, Sev2, sobre un recurso del RG administrado |

El `incidentManagementConfiguration` está como `type: AzMonitor` con `connectionKey: ""` y
`oboUser: null`. **Eso NO es el bug**: la documentación de incident platforms dice explícitamente que
para Azure Monitor *"you don't need to provide any credentials"* y que las alertas de los resource
groups administrados fluyen automáticamente. Así que no es un problema de permisos ni de
autenticación.

**Causa encontrada y corregida: resource providers sin registrar.** La plataforma de incidentes de
Azure Monitor lee las alertas por la API de `Microsoft.AlertsManagement`, y ese provider estaba en
**`NotRegistered`** en la suscripción — igual que `Microsoft.Monitor`. Es el mismo tipo de
prerrequisito que `Microsoft.App` (que sí estaba registrado). Ya se corrigió:

```powershell
az provider register --namespace Microsoft.AlertsManagement
az provider register --namespace Microsoft.Monitor
```

Ambos verificados en **`Registered`** el 6 de agosto de 2026. **Después de esto hay que darle Refresh
en el portal.** Si alguna vez se recrea la suscripción o el agente, revisa esto primero.

**RBAC descartado definitivamente.** La identidad administrada del agente
(`5d41cc66-ba4a-482a-b7c0-2ebfb03b54f8`) tiene **7 asignaciones**: Reader, Monitoring Reader,
Monitoring Contributor, Log Analytics Reader, Log Analytics Contributor y Application Insights
Component Contributor sobre `rg-palacio-retailiq`, **más Monitoring Contributor a nivel de toda la
suscripción**. Los permisos no son el problema.

> Nota de higiene, sin urgencia: ese `Monitoring Contributor` a nivel suscripción es más alcance del
> recomendado —le da lectura de monitoreo sobre `clarity-prod`, `arterion-sql` y el resto de la
> suscripción compartida—. Es solo monitoreo, no datos de aplicación. Cuando el cableado funcione,
> vale la pena probar si se puede quitar y dejar solo el scope del RG.

**Ojo con la ruta del portal:** la documentación ubica el incident platform en *Builder → Incident
platform*, **pero ese menú no existe en el build de agosto de 2026**. Bajo Builder solo hay Agent
Canvas, Connectors, Knowledge Sources, Code Access, Skill Builder, Plugins y Hooks. Buscarlo en
**Settings** (lo más probable, porque `incidentManagementConfiguration` es propiedad del agente) o en
**Capabilities**.

Cuando la plataforma quede conectada se crea solo un response plan **`quickstart_handler`** que cubre
**Sev0, Sev1 y Sev2 en modo autónomo**. La alerta de esta demo es **Sev2 a propósito**: queda cubierta
por el plan por omisión, sin tener que crear un plan a mano.

> ⚠️ **Gotcha documentado:** si más adelante creas tus propios response plans, **borra el
> `quickstart_handler`** (Builder → Incident response plans → Table view). Corre en paralelo a los
> tuyos y puede procesar el incidente dos veces o enrutarlo al custom agent equivocado.

#### Segundo bloqueador del Tiempo 2: GitHub no está conectado

`gitHubConfiguration: null` en la configuración del agente. Aunque Azure Monitor quede conectado y el
agente investigue, **no tiene por dónde abrir el issue** — y ese issue es justamente la bisagra entre
el Tiempo 2 y el Tiempo 4 de la escena. Se conecta en **Builder → Connectors → GitHub** (OAuth o el
MCP server de GitHub), y ese paso **sí** requiere consentimiento OAuth de un miembro de la org de
GitHub.

#### Aviso de costo: el tope está en todo el crédito

El agente tiene `monthlyAgentUnitLimit: 10000` AAU. A USD $0.10 por AAU (tarifa de eastus2, ver
"Costo del SRE Agent"), ese tope son **USD $1,000/mes: exactamente el crédito patrocinado completo**.
El always-on consume solo 2,880 AAU/mes, así que sobra margen: conviene **bajarlo a ~4,000 AAU
(≈$400)** para que un response plan autónomo mal configurado no pueda agotar el crédito.

**Nada de este cableado está verificado.** Y sigue en pie el pendiente de ensayo de siempre: sembrar
—hoy la telemetría está en **cero**, así que la alerta no tiene sobre qué disparar—, esperar a que
dispare **sola** (evalúa cada 5 min, ventana de 15), y **medir** cuánto tarda la investigación de
verdad. Los ~15 minutos del guion son una estimación, no una medición.

### Tiempo 5 — el Copilot cloud agent — ⚠️ NO VERIFICADO, HOY NO SE PUEDE PRESENTAR

El **Copilot cloud agent** (`copilot-swe-agent`) no es el Agent Mode de VS Code: se le asigna un
issue como a una persona, corre en un entorno efímero sobre GitHub Actions y deja un pull request en
draft. Trabaja en segundo plano, tarda minutos y **no se puede ver trabajar en vivo** — en la demo se
muestran sus artefactos ya terminados.

**Reparto de los dos defectos** (diseño de la escena): el defecto #1 (el fallback del timeout) lo
arregla Copilot en vivo desde VS Code, como hasta ahora. El defecto #2 (la race condition) es el que
se le encarga al cloud agent. La narración **no oculta** que Copilot también encuentra el #2 en
vivo — al contrario, lo usa: dos agentes independientes convergieron en el mismo defecto, uno desde
la telemetría y otro desde un issue. Ese es el argumento, y no exige cambiar nada de lo ya verificado
del Tiempo 4.

**Estado del entorno:**

| Requisito | Estado |
|---|---|
| `copilot-swe-agent` asignable en el repo | ✅ verificado — aparece en `suggestedActors` con `CAN_BE_ASSIGNED`; no hizo falta habilitar nada |
| Branch protection / rulesets que bloqueen al agente | ✅ ninguna en `main` — la incompatibilidad documentada no aplica |
| `.github/workflows/copilot-setup-steps.yml` | ~~⚠️ creado pero NO commiteado ni subido a `main`~~ → ✅ **ya está en `main`** (ver nota de corrección abajo) |
| Issue #9 asignado a Copilot | ✅ abierto y asignado a *Copilot* |
| PR #10 con el arreglo | ❌ **vacío** — ver abajo |

> **Nota de corrección — Claude Code, 2026-08-11.** La fila de `copilot-setup-steps.yml` decía que
> el workflow no estaba commiteado. Ya no aplica: está en el commit `0f553e3` ("ci: pin the .NET SDK
> for the Copilot cloud agent environment") y verificado presente en `origin/main` con
> `git ls-tree origin/main .github/workflows/`. **Eso deja hecho el punto 3 de "Qué falta para que
> el Tiempo 5 se pueda presentar"** — el bloqueador real sigue siendo únicamente el modelo del
> coding agent. No reescribí el resto de la sección por ser de otra sesión.

**Por qué existe `copilot-setup-steps.yml`:** `global.json` pinea el SDK `8.0.423` con
`rollForward: latestFeature`. Un runner con un 8.0.1xx falla en `dotnet restore` y el agente se
atoraría antes de leer código. El workflow instala el SDK exacto del repo.

#### Lo que pasó de verdad el 3 de agosto de 2026 (medido, no estimado)

Al asignar el issue #9, el agente **arrancó solo**: creó la rama
`copilot/fix-race-condition-fraud-reviews` y abrió el PR #10 en draft. Hasta ahí, el mecanismo
funciona de punta a punta sin intervención humana.

Pero el resultado fue **un PR vacío**:

- La sesión corrió **26 segundos y 2 turnos** (`turn=2 session.idle` en el log del run) y se apagó.
- El único commit es `Initial plan`. **`git diff origin/main...` está vacío**: la rama es idéntica a
  `main`.
- Y aun así, la **descripción del PR describe el arreglo completo y correcto** —
  `ConcurrentDictionary`, el test de concurrencia, la corrección del comentario XML— con un fragmento
  de código incluido.

Se pidió un reintento por comentario `@copilot` en el PR. **Corrió y falló igual: 28 segundos, cero
commits.** O sea que no es un fallo aislado — es reproducible.

**Causa raíz, medida en el log del segundo run:**

```
turn=1 assistant.usage: model=gpt-5.3-codex input=24131 output=4
turn=1 assistant.message: 0 chars, 0 tool call(s)
turn=2 assistant.usage: model=gpt-5.3-codex input=25986 output=7
turn=2 assistant.message: 7 chars, 0 tool call(s)
in-session runtime checkQuota callback v3: quota is sufficient, continuing session
```

El modelo del cloud agent (**`gpt-5.3-codex`**) está devolviendo respuestas prácticamente vacías —**4
y 7 tokens de salida**— y **cero llamadas a herramientas**. Sin tool calls no lee archivos, no edita
y no commitea; la sesión concluye correctamente que no hay nada que hacer y se va a `idle`.

Lo que esto descarta, con evidencia:

- **No es cuota.** El log dice explícitamente `quota is sufficient`.
- **No es el firewall.** Los dominios de NuGet están en la allowlist del agente.
- **No es el SDK de `global.json`.** Nunca llegó a correr `dotnet` — no hizo una sola llamada a
  herramienta. `copilot-setup-steps.yml` sigue siendo buena idea, pero **no es la causa de esto** y
  subirlo no lo va a arreglar.

Es un fallo del lado de la plataforma, no de la configuración de este repo. **Lo primero que hay que
probar es cambiar el modelo del coding agent** (en la configuración de Copilot de la org
`arterionai`) a uno que no sea `gpt-5.3-codex`, y volver a asignar el issue. Si con otro modelo hace
tool calls, el problema queda confirmado y resuelto. Si no, es reporte a soporte de GitHub.

> ⚠️ **La trampa de honestidad más peligrosa de todo el guion está aquí.** El PR #10 *se lee* como un
> arreglo terminado: título correcto, descripción detallada, snippet de código. Si alguien abre esa
> pestaña en vivo y narra la descripción, estaría mostrando trabajo que **no existe** — y basta con
> que alguien de la audiencia haga clic en "Files changed" para que quede en evidencia. **Antes de
> presentar el Tiempo 5, la verificación no es leer el PR: es confirmar que el diff no está vacío.**

#### Un segundo bloqueador, independiente del anterior

El run de `dotnet-ci` sobre la rama del agente quedó en **`action_required`**: los PRs de bots
necesitan aprobación manual para que sus workflows corran. Es decir, **los "checks en verde" que
promete el guion no aparecen solos** — alguien tiene que aprobar la ejecución del workflow desde la
pestaña de Actions o del PR. Esto hay que hacerlo en la preparación, no en vivo.

#### Qué falta para que el Tiempo 5 se pueda presentar

1. **Cambiar el modelo del coding agent** en la configuración de Copilot de la org `arterionai` —
   `gpt-5.3-codex` no está haciendo tool calls (ver causa raíz arriba). Es el primer paso y el único
   que ataca el bloqueador real.
2. Volver a asignar el issue #9 y confirmar en el log del run que el agente **sí hace llamadas a
   herramientas** (`tool call(s)` distinto de 0). Si sigue en cero con otro modelo, reportar a
   soporte de GitHub.
3. ~~Commitear y subir `.github/workflows/copilot-setup-steps.yml` a `main`~~ — ✅ **hecho**
   (commit `0f553e3`, verificado en `origin/main` el 2026-08-11; ver nota de corrección arriba).
3. Verificar con `git diff origin/main...origin/copilot/fix-race-condition-fraud-reviews` que el diff
   **no está vacío** y que toca `FraudReviewGateway.cs` y el proyecto de tests.
   **Atajo:** `./scripts/check-cloud-agent.ps1` corre esta verificación y las de los puntos 5 y 7 de
   una sola vez, y devuelve exit 0 solo si el Tiempo 5 se puede presentar.
4. Confirmar que el test de concurrencia **falla contra `main`** y pasa con el cambio. Sin esto, la
   frase "lo arregló de verdad" no es verificable.
5. Aprobar el run de `dotnet-ci` en el PR y confirmar que queda en verde.
6. Revisar el consumo de premium requests de Copilot en la org `arterionai` — cada ensayo del cloud
   agent consume cuota, y esto se va a correr varias veces antes de que quede.
7. **No mergear el PR.** El defecto tiene que seguir vivo en `main` para que Copilot lo encuentre en
   el Tiempo 4.

> Mientras los puntos 2 a 5 no estén verificados, **el Tiempo 5 no se presenta**. El fallback está
> documentado en `docs/demo-script.md`: la escena cierra en el Tiempo 4 y se sostiene sola.

#### Riesgo colateral que hay que vigilar en el ensayo

El texto del issue #9 **nombra explícitamente el defecto #2**. Está redactado a propósito para **no
mencionar el defecto #1** (el fallback del timeout), que es el que sostiene el diagnóstico en vivo de
la Escena 5. Aun así, si Copilot Agent Mode tuviera contexto de los issues del repositorio, podría
mencionar que ya existe un issue del #2 durante el Tiempo 4. **No se ha ensayado si eso pasa.** Si
pasa, no es grave —la respuesta honesta es buena: "sí, ese ya lo tomó el otro agente"— pero conviene
saberlo antes y no descubrirlo frente a la audiencia.

---

## Escena 6 — La operación completa (Vista de Gerente)

**Quién actúa:** el presentador, en Operations Console (`http://localhost:5174`), Vista de
Gerente/Ejecutivo.

**Qué hacer:** recorrer los tres módulos sin detenerse demasiado: **Store Readiness**,
**Experience Command Center** y **Decision Room** (la decisión de extender el piloto).

**✅ Verificado** — usa datos estáticos de `historia.md` §6.2; no depende de ningún backend, así que
no puede fallar en vivo.

**Por qué va después de la Escena 5:** el Decision Room pregunta "¿extendemos el piloto a toda la
cadena?". Llegar ahí justo después de haber encontrado y arreglado un control roto es lo que le da
peso a la decisión. En el orden inverso, la escena es solo un dashboard bonito.

---

## Ciclo de ensayo y reset

**Ensayar contamina el repo.** Dos escenas escriben código de verdad, y si no se revierte, la
siguiente pasada se queda sin nada que hacer:

| Escena | Qué deja escrito | Efecto en la siguiente pasada |
|---|---|---|
| 2 | `GET /api/returns/{id}` + pruebas → 11/11 | El endpoint ya existe: **no hay nada que construir en vivo** |
| 5 | El fix de los dos defectos + 3 pruebas → 12/12 | Los defectos ya están corregidos: **no hay nada que diagnosticar** |

Para eso está **`scripts/reset-demo.ps1`**. Devuelve `src/` al baseline y verifica las dos
invariantes que la demo necesita: que el endpoint GET **no** exista y que la suite pase en **9/9**
(la prueba de que los dos defectos siguen plantados y que las pruebas existentes no los detectan).

Solo toca `src/`. `docs/`, `web/` y `scripts/` no se tocan — los ensayos no los modifican.

### Una sola vez, antes del primer ensayo

```powershell
./scripts/reset-demo.ps1 -CreateBaseline
```

Captura el estado pre-demo de `src/` como commit + tag `demo-baseline`. **Verifica las invariantes
antes de commitear**: si el endpoint GET existe o la suite no da 9/9, se detiene sin hacer nada.

> ⚠️ **Esto commitea.** Al 6 de agosto de 2026, `src/` tiene 5 archivos sin commitear que **son** el
> estado pre-demo (`Observability/`, `Program.cs`, el `.csproj`, `ReturnsController.cs` y
> `FraudReviewGateway.cs` con los dos defectos). Sin baseline **no hay a dónde regresar**: un reset a
> ciegas los borraría. Por eso el baseline es el primer paso y no es opcional.

### Antes de cada ensayo

```powershell
./scripts/reset-demo.ps1 -Check
```

No modifica nada, no pregunta nada. Reporta si el código está listo: endpoint ausente, baseline
existe, `src/` limpio, 9/9 en verde.

### Después de cada ensayo

```powershell
./scripts/reset-demo.ps1            # con confirmación: escribe SI
./scripts/reset-demo.ps1 -Force     # sin preguntar, para ensayos en serie
```

Muestra **exactamente** qué va a descartar antes de tocar nada, restaura `src/` desde el baseline,
borra los archivos nuevos que dejó el ensayo, limpia los directorios que quedaron vacíos, y vuelve a
verificar las invariantes. **Si al terminar no se cumplen, sale con error** — no te deja ensayar sobre
un estado sucio creyendo que está limpio.

### Lo que el script NO hace, y hay que hacer a mano

1. **Reiniciar la API.** El gateway antifraude recuerda 30 minutos a los clientes ya revisados
   (`FraudReviewGateway.ReviewValidityWindow`). Si no la reinicias, el caso de Sofía se salta la
   consulta al motor y **no aparece en el hallazgo de la Escena 5**. El script te lo recuerda al
   terminar, pero no mata el proceso: puede estar corriendo en otra terminal.
2. **Volver a sembrar la telemetría** si la última siembra tiene más de 24 h
   (`./scripts/seed-telemetry.ps1`, ~20 s + 2-3 min de ingesta). Con `-Seed` el script la siembra al
   final, pero solo sirve si ya reiniciaste la API.
3. **Levantar los 4 procesos**: 5163 (API), 5173 (Mi Palacio), 5174 (Operations Console), 5176 (proxy
   del concierge).
4. **Limpiar lo que quedó en GitHub.** Si un ensayo hizo push o abrió un PR, eso se limpia allá, no
   con este script.

---

## Pendientes antes de la presentación real

- [x] Compartir el sitio SharePoint y la carpeta confidencial con `jaime.sanchez@arterion.ai` —
      hecho; confirmado en vivo que ya encuentra el postmortem confidencial y explica por qué
      antes no podía.
- [x] Re-correr la pregunta #2 de la Escena 1 (cuándo/por qué cambió la decisión de SAP) — hecho;
      ya sale completa con fecha, razones y el matiz gobernanza-vs-enforcement-en-código. **La
      Escena 1 completa está verificada en vivo.**
- [x] Redactar y ensayar el prompt exacto de la Escena 2 (Copilot/VS Code) — hecho, en worktree
      aislado y descartado inicialmente; **luego se implementó de verdad en `main`** (ver
      siguiente pendiente).
- [x] Mi Palacio y Operations Console ahora comparten el mismo caso real en vivo — construido y
      verificado (Escena 4): folio search real + hub SignalR + línea de tiempo animada en Mi
      Palacio.
- [x] **Resuelto**: el `GET /api/returns/{id}` se revirtió deliberadamente de `main` después de
      verificar la Escena 4 (9/9 tests, sin el endpoint) — la Escena 2 vuelve a ser una
      construcción en vivo genuina. El hub SignalR y las transmisiones quedaron permanentes. **El
      día de la presentación, correr la Escena 2 antes que la Escena 4** — si por cualquier motivo
      la Escena 2 no se corre (o falla en vivo), la Escena 4 no va a funcionar hasta que el
      endpoint exista de nuevo.
- [x] **Escena 5 construida y verificada**: Application Insights real (`appi-palacio-returns` en
      `rg-palacio-retailiq`), API instrumentada con Azure Monitor OpenTelemetry, dos defectos
      plantados en `FraudReviewGateway`, script de siembra y helper de consultas. El fix se ensayó
      en worktree aislado (12/12 en verde) y se descartó — `main` sigue con los defectos, como debe
      estar antes de presentar.
- [ ] Decidir explícitamente si la Escena 1 se presenta como "dos actos" (primero sin acceso a la
      carpeta confidencial, luego con acceso) — recomendado, es más fuerte que preguntar una sola
      vez ya con acceso completo desde el principio.
- [ ] Ensayar el timing conjunto de las 6 escenas en una sola toma continua (nunca se ha corrido
      el demo completo de principio a fin sin cortes). Con la Escena 5, el bloque del SRE Agent y el
      Tiempo 5 del cloud agent, el guion queda en **~15:40** — y ese número es aritmética sobre los
      tiempos del guion, **no una medición**.
- [ ] **Crear el baseline de ensayos: `./scripts/reset-demo.ps1 -CreateBaseline`.** Es el primer
      paso y no es opcional: hoy `src/` tiene 5 archivos sin commitear que **son** el estado
      pre-demo, y sin baseline no hay a dónde regresar después de un ensayo. Ver "Ciclo de ensayo y
      reset".
- [ ] **BLOQUEADOR del Tiempo 2 — conectar el incident platform de Azure Monitor.** Probado el 6 de
      agosto de 2026: la alerta dispara sola y de forma confiable (3 de 3 corridas, 1-5 min), pero el
      agente **no recibe el incidente** — *Incidents* muestra "No incidents found" y la alerta se
      queda en `New` más de 12 min, con un scanner que corre cada minuto. Ya se descartaron con
      evidencia: permisos, `targetResource`, severidad, título, cooldown, merge de 7 días (con una
      regla nueva de nombre distinto) y providers. **Lo que falta es la conexión misma**, y la ruta
      que da la doc (*Builder → Incident platform*) **no existe en este build**. Pista: el agente
      tiene `EnableConnectorsV2 = true`, así que revisar **Builder → Connectors** — es el único menú
      sin revisar. Si no está ahí, es caso de soporte de Microsoft. Ver Escena 5, Tiempo 2.
- [x] **La configuración del lado del cliente está completa y verificada**: regla
      `alert-fraud-review-incomplete` (Sev2, habilitada), response plan `escena5-antifraude-incompleto`
      (On, Sev2, Meta Agent, Review), `rg-palacio-retailiq` en recursos administrados, RBAC con
      Monitoring Contributor a nivel suscripción, y `Microsoft.AlertsManagement` + `Microsoft.Monitor`
      registrados.
- [ ] **Conectar GitHub en Builder → Connectors.** `gitHubConfiguration` está en `null`: hoy el
      agente **no tiene por dónde abrir el issue**, que es la bisagra del Tiempo 2 al Tiempo 4.
      Requiere consentimiento OAuth de un miembro de la org de GitHub.
- [ ] **Bajar `monthlyAgentUnitLimit` de 10,000 a ~4,000 AAU.** Hoy el tope equivale a **USD $1,000/mes
      — el crédito patrocinado completo**. El always-on solo usa 2,880 AAU/mes, así que 4,000 (≈$400)
      deja margen de sobra y acota el daño de un response plan autónomo mal configurado.
- [x] **La alerta dispara sola: VERIFICADO** el 6 de agosto de 2026. Sembrar → alerta `Fired` en Sev2
      en **poco más de un minuto** (07:39:30 → 07:40:35 UTC), con 10 ocurrencias contra un umbral de
      5. Ver Escena 5, Tiempo 2.
- [ ] **Ensayar el resto de la Escena 5 con el SRE Agent** — falta el tramo que no se ha podido
      verificar: que el agente **reciba** el incidente (confirmar en https://sre.azure.com →
      *Incidents*, no en *Triggers + response plans*), **cuánto tarda la investigación** —el único
      número que sigue siendo estimación y no medición— y que el issue de GitHub se abra con contexto
      suficiente (bloqueado hasta conectar GitHub). Ver `docs/demo-script.md`, Escena 5, Tiempo 2.
- [ ] **BLOQUEADOR del Tiempo 5 — cambiar el modelo del coding agent en la org `arterionai`.** El
      mecanismo arranca bien (al asignar el issue #9 el agente creó su rama y abrió el PR #10 solo),
      pero **produce PRs vacíos de forma reproducible**: dos corridas, 26 s y 28 s, cero commits. En
      el log, `gpt-5.3-codex` devuelve 4 y 7 tokens de salida y **cero tool calls**; el log dice
      explícitamente `quota is sufficient`, así que no es cuota, ni firewall, ni el SDK. Cambiar el
      modelo, reasignar el issue y confirmar en el log que hay `tool call(s)` distinto de 0. Si sigue
      en cero, reportar a soporte de GitHub. Ver Escena 5, Tiempo 5.
- [ ] Una vez que el agente sí produzca código, verificar en este orden: (a) que
      `git diff origin/main...origin/copilot/fix-race-condition-fraud-reviews` **no** esté vacío,
      (b) que el test de concurrencia falle contra `main` y pase con el cambio, (c) **aprobar el run
      de `dotnet-ci`** —quedó en `action_required` porque es un PR de bot, los checks en verde **no
      aparecen solos**— y confirmar el verde. **Hasta que esto no esté verificado, el Tiempo 5 no se
      presenta**; la escena cierra en el Tiempo 4 y se sostiene sola.
- [ ] **Subir `.github/workflows/copilot-setup-steps.yml` a `main`.** Está creado pero no
      commiteado, y **no surte efecto hasta estar en la rama default**. Fija el SDK `8.0.423` de
      `global.json` en el entorno efímero del cloud agent. **No arregla el bloqueador de arriba** —el
      agente nunca llegó a correr `dotnet`— pero evita el siguiente fallo en cuanto empiece a
      trabajar.
- [ ] **Ensayar si Copilot Agent Mode ve los issues del repo durante el Tiempo 4.** El issue #9
      nombra el defecto #2 (está redactado a propósito para **no** mencionar el #1, que es el que
      sostiene el diagnóstico en vivo). Si Copilot lo menciona en vivo no es grave, pero hay que
      saberlo antes y no descubrirlo frente a la audiencia.
- [ ] **Revisar la cuota de premium requests de Copilot en la org `arterionai`** antes de ensayar el
      cloud agent en serie. Cada corrida consume cuota y esto se va a repetir varias veces hasta que
      quede. No se pudo verificar desde esta sesión: el token disponible solo tiene `gist`,
      `read:org` y `repo`.
- [ ] **Opcional, solo si sobra tiempo de ensayo**: probar el handoff corto a Copilot
      (*"toma el issue #N"*) en lugar del prompt largo. El 12/12 en verde está verificado con el
      prompt largo; no cambiar el handoff sin haber corrido la variante completa.
- [ ] Decidir si en la Escena 5 se usa la terminal (`./scripts/aiq.ps1`, ya verificado) o el portal
      de Azure para mostrar las consultas. La terminal es más rápida y no depende del navegador; el
      portal se ve más "producto" y permite mostrar la gráfica de dependencias fallidas. **No se ha
      ensayado la variante del portal.**
