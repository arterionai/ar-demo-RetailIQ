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
| Cuenta de Jorge Ramírez (`jorge.ramirez@fractalcs.com`) | Construye el endpoint en VS Code con Copilot (Escena 3) | Acceso al repo `arterionai/ar-demo-RetailIQ` |

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
verdad.** El `GET /api/returns/{id}` se había implementado para construir la Escena 5, pero ya se
quitó de `ReturnsController.cs` (y su test) — `main` vuelve a compilar en 9/9 tests, sin el
endpoint. El hub SignalR y las transmisiones en vivo (`BroadcastStatusAsync`) SÍ se quedaron
permanentemente, porque no dependen del GET. Consecuencia importante: **hasta que esta escena se
corra en vivo, "Buscar por folio" en Operations Console y por lo tanto la Escena 5 no van a
funcionar** — eso es intencional, es lo que hace que el orden Escena 2 → Escena 5 tenga sentido
dramático (Copilot construye la pieza que el asociado necesita, y de inmediato se usa).

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
Escena 5 de punta a punta (con datos reales, no supuestos) — y una vez confirmado que la Escena 5
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
   animada, ver Escena 5). Déjala abierta: es la pantalla que va a reaccionar sola en la Escena 5.

**✅ Verificado en vivo** (los 6 pasos, con navegador real, contra los 4 procesos reales corriendo:
API .NET + proxy Azure OpenAI + hub SignalR + Vite).

---

## Escena 4 — Operaciones (Operations Console)

**Quién actúa:** el presentador, como asociado de tienda, en `http://localhost:5174`.

**Qué hacer (si se presenta de forma aislada, sin encadenar con la Escena 3):**
1. Clic en **"Cargar casos de ejemplo"**.
2. Seleccionar el caso, clic en **"Recibir artículo"**, luego **"Aprobar inspección"**.
3. Cambiar a la Vista de Gerente: mostrar Store Readiness, Command Center, Decision Room (datos de muestra, no requieren backend).

**✅ Vista de Asociado verificada** con llamadas reales contra la API. Vista de Gerente usa datos
estáticos de `historia.md` §6.2 — no requiere verificación adicional, no depende de ningún backend.

Si en cambio se encadena con la Escena 3 (recomendado — es el momento fuerte), salta a la Escena 5.

---

## Escena 5 — El momento apantallador: la clienta ve el cambio en vivo

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
      verificado (Escena 5): folio search real + hub SignalR + línea de tiempo animada en Mi
      Palacio.
- [x] **Resuelto**: el `GET /api/returns/{id}` se revirtió deliberadamente de `main` después de
      verificar la Escena 5 (9/9 tests, sin el endpoint) — la Escena 2 vuelve a ser una
      construcción en vivo genuina. El hub SignalR y las transmisiones quedaron permanentes. **El
      día de la presentación, correr la Escena 2 antes que la Escena 5** — si por cualquier motivo
      la Escena 2 no se corre (o falla en vivo), la Escena 5 no va a funcionar hasta que el
      endpoint exista de nuevo.
- [ ] Decidir explícitamente si la Escena 1 se presenta como "dos actos" (primero sin acceso a la
      carpeta confidencial, luego con acceso) — recomendado, es más fuerte que preguntar una sola
      vez ya con acceso completo desde el principio.
- [ ] Ensayar el timing conjunto de las 5 escenas en una sola toma continua (nunca se ha corrido
      el demo completo de principio a fin sin cortes).
