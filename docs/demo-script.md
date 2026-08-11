# Guion de presentación — Inteligencia Palacio

> Este es el guion para leer/ensayar palabra por palabra. La referencia técnica (qué está
> verificado, qué está pendiente, arquitectura) vive en `docs/demo-runbook.md` — no la repitas
> aquí para no perder el hilo del presentador.
>
> Duración estimada: ~15:40. Tiempos son orientativos, no cronómetro. **El guion completo nunca se
> ha corrido de punta a punta en una sola toma** — ver los pendientes de ensayo en
> `docs/demo-runbook.md`.

---

## Minute by minute

| Tiempo | Duración | Escena | Ventana | Qué ve la audiencia | Momento clave |
|---|---|---|---|---|---|
| 0:00 | 0:30 | Apertura | — | Solo el presentador | "Tres protagonistas: Work IQ entiende, Copilot construye, el SRE Agent vigila" |
| 0:30 | 3:00 | **1 — Work IQ reconstruye el contexto** | Teams | 3 preguntas y sus respuestas; luego el cambio de cuenta y el postmortem confidencial | Work IQ dice *"no estaba apareciendo porque está marcado como confidencial"* |
| 3:30 | 2:00 | **2 — Copilot construye el endpoint** | VS Code | Copilot escribe `GET /api/returns/{id}` + tests; `dotnet test` en verde | 11/11 en verde, sin ciclo de debugging |
| 5:30 | 2:30 | **3 — Sofía en Mi Palacio** | Chrome :5173 | Conversación real con el Concierge, reserva de talla, QR real | El Concierge dice en qué tiendas está su talla |
| 8:00 | 1:30 | **4 — Split screen en vivo** | :5174 + :5173 | El asociado recibe e inspecciona; la pantalla de Sofía se ilumina sola | "Nadie tocó esa pantalla. Nadie la recargó." |
| 9:30 | 4:40 | **5 — El control que se rompió en silencio** | Terminal + portal SRE Agent + VS Code + GitHub | La operación se ve sana → el SRE Agent ya lo había investigado solo y abrió un issue → verificas su hallazgo con dos consultas → Copilot arregla y prueba → el cloud agent ya había arreglado el segundo hallazgo solo, en GitHub | "Nadie se lo pidió. Lo encontró solo, a las 3 de la mañana." |
| 14:10 | 1:00 | **6 — La operación completa** | :5174 (Vista Gerente) | Store Readiness, Command Center, Decision Room | Se decide el rollout con el control ya protegido |
| 15:10 | 0:30 | Cierre | — | Solo el presentador | "No fue una demostración de generación de código" |

**Puntos donde NO se puede improvisar el orden:**

- La **Escena 2 tiene que correr antes de la 4** — el folio search depende del endpoint que Copilot
  construye en vivo.
- La **Escena 4 tiene que correr antes de la 5** — el caso de Sofía necesita existir (y estar
  inspeccionado) para aparecer en la telemetría del hallazgo.
- La **Escena 5 va antes de la 6** — el Decision Room cierra decidiendo el rollout *después* de que
  el control quedó arreglado. Al revés, la escena pierde su sentido.

**Si vas retrasado**, recorta en este orden: (1) el recorrido del Command Center en la Escena 6,
(2) la segunda pregunta de la Escena 1, (3) la consulta de verificación por rango de monto en la
Escena 5 (el reporte del SRE Agent ya lo dice), (4) el Tiempo 5 de la Escena 5 (el PR del cloud
agent). Nunca recortes la Escena 4, ni el reporte del SRE Agent.

> El Tiempo 5 **reemplaza** al viejo recorte del segundo hallazgo: la race condition ya no se
> narra en vivo desde VS Code, se muestra como el PR que el cloud agent dejó hecho. Si lo recortas,
> no pierdes el hallazgo — Copilot lo sigue encontrando en el Tiempo 4 y basta con nombrarlo de
> pasada.

---

## Preparación (antes de que entre la audiencia)

- [ ] Ventanas abiertas y en orden en la barra de tareas: **Teams** (como María o con el
      presentador listo para explicar "esto lo escribiría María"), **VS Code** (repo abierto,
      Copilot Agent Mode activo), **Mi Palacio** (`localhost:5173`, pestaña nueva/incógnito para
      estado limpio), **Operations Console** (`localhost:5174`).
- [ ] Los 4 procesos corriendo: API .NET (`5163`), proxy del concierge (`5176`), Mi Palacio
      (`5173`), Operations Console (`5174`).
- [ ] Confirmar que el endpoint `GET /api/returns/{id}` **NO existe** en `main` en este momento
      (`main` en 9/9 tests) — si por error ya está ahí, la Escena 2 pierde su efecto.
- [ ] Idealmente dos pantallas/proyecciones visibles a la vez para la Escena 4 (Mi Palacio +
      Operations Console lado a lado). Si solo hay una pantalla, tenerlo ensayado con
      alt-tab rápido.
- [ ] **Escena 2 — el documento de contexto listo para pegar.** Abre en SharePoint *Arquitectura
      objetivo — Devolución omnicanal* (el de Laura Martínez) y déjalo en una pestaña, listo para
      seleccionar y copiar. **No es el `ADR-014-returns-orchestration.md` del repo** — ese Copilot
      ya lo tiene en el workspace. Si quieres respaldo local por si SharePoint no carga, guárdalo
      **fuera** del repositorio: dentro, Copilot lo lee solo y pegarlo deja de significar algo.
- [ ] Copiado al portapapeles: nada todavía — el folio de Sofía se copia en vivo, en la Escena 3.
      (El documento de la Escena 2 se copia justo antes de esa escena, para no pisar el folio.)

**Específico de la Escena 5 (Application Insights) — hazlo en este orden:**

- [ ] `az account show` responde (si no: `az login`). Sin sesión de Azure, las consultas fallan.
- [ ] La API imprimió `Telemetría de Application Insights: ACTIVA` al arrancar. Si dice
      "desactivada", falta el connection string — ver `docs/runbooks/appinsights-queries.md`.
- [ ] **Reiniciar la API después de cualquier ensayo** y antes de sembrar. El gateway antifraude
      recuerda 30 minutos a los clientes ya revisados: si ensayaste el flujo de Sofía, su caso real
      en la demo se saltaría la consulta al motor y **no aparecería en el hallazgo de la Escena 5**.
- [ ] Sembrar la telemetría: `./scripts/seed-telemetry.ps1` (~20 s). No subas la concurrencia —
      en ráfaga el exportador descarta eventos en silencio.
- [ ] Esperar 2-3 minutos y verificar que hay datos: `./scripts/aiq.ps1 "requests | count"`.
- [ ] Terminal abierta y con letra grande, en la raíz del repo, lista para las consultas.
- [ ] Consulta larga del hallazgo (§4 del runbook de consultas) copiada en un archivo abierto o en
      el portapapeles — no la escribas en vivo.

**Específico del SRE Agent — la investigación va PRE-CORRIDA, igual que la telemetría:**

Una investigación tarda minutos. Igual que con la ingesta de Application Insights, no se puede
esperar en vivo: en pantalla se abre una investigación **ya terminada**.

- [ ] La regla de alerta de Azure Monitor sobre la dependencia `fraud-review` está **activa** y
      conectada al SRE Agent. Esto es lo que hace honesta la frase "nadie se lo pidió" — ver el
      aviso de abajo.
- [ ] **Sembrar la telemetría primero** (paso anterior), y dejar que la alerta dispare sola. La
      investigación arranca a partir de ahí.
- [ ] **~15 minutos antes de la demo**: confirmar en el portal del SRE Agent que la investigación
      terminó y que el issue de GitHub ya está abierto. Anotar el número de issue.
- [ ] Pestaña del portal del SRE Agent abierta en la investigación terminada, y otra pestaña en el
      issue de GitHub. Ambas listas para mostrarse sin navegar en vivo.
- [ ] Si la alerta no disparó o la investigación no terminó a tiempo: **la Escena 5 corre en su
      versión anterior** (las cuatro consultas manuales + el prompt largo a Copilot). Está completa
      y verificada por sí sola — ver el fallback de la escena.

> ⚠️ **La frase "nadie se lo pidió, lo encontró solo" solo es honesta si la investigación la
> disparó la alerta, no tú.** Si la lanzas a mano pidiéndole al agente que investigue, esa línea
> se convierte en una mentira frente a la audiencia y viola la regla de oro de este guion. Si por
> lo que sea tuviste que lanzarla a mano, cambia la narración a *"esta investigación la corrió el
> agente hace un rato, a partir de la alerta que ustedes vieron dispararse"* solo si eso es
> cierto — y si no lo es, di simplemente *"le pedí al agente que investigara esto"*. Sigue siendo
> una buena escena. No vale la pena cambiar una frase por una mentira verificable.

**Específico del Copilot cloud agent — el PR también va PRE-HECHO:**

El cloud agent no es el Agent Mode de VS Code: corre en un entorno efímero sobre GitHub Actions, en
segundo plano, y tarda minutos. **No se puede ver trabajar en vivo** — en pantalla se muestran sus
artefactos ya terminados.

- [ ] El issue de la race condition (**#9**) está abierto y asignado a **Copilot**, no a una persona.
      Es lo que se muestra en pantalla: el asignado tiene que decir *Copilot*.
- [ ] El PR del cloud agent (**#10**, rama `copilot/fix-race-condition-fraud-reviews`) está **en
      draft** y con los checks de `dotnet-ci` en verde.
- [ ] **NO MERGEAR el PR.** El defecto tiene que seguir vivo en `main` para que Copilot lo encuentre
      en el Tiempo 4. Si se mergea, la Escena 5 pierde su segundo hallazgo.
- [ ] Dos pestañas más listas, sin navegar en vivo: el **issue #9** (mostrando a Copilot como
      asignado) y el **PR #10** (mostrando el test de concurrencia y los checks en verde).
- [ ] Confirmar en el PR que el test de concurrencia falla contra `main` y pasa con el cambio — es
      lo único que hace verificable la afirmación "lo arregló de verdad".
- [ ] **Correr `./scripts/check-cloud-agent.ps1`.** Verifica de una sola vez las siete condiciones
      de arriba (diff no vacío, que toque `FraudReviewGateway.cs` y el proyecto de tests, CI en
      verde, issue asignado a Copilot, PR sin mergear). **Si devuelve exit 1, el Tiempo 5 no se
      presenta** — cierra la escena en el Tiempo 4. Es la última palabra, por encima de lo que
      parezca al leer el PR.

> ⚠️ **Igual que con el SRE Agent: se dice "lo arregló", nunca "lo está arreglando".** El trabajo
> ocurrió antes de la demo. Si alguien pregunta si está corriendo ahora, la respuesta es no — corrió
> en GitHub Actions cuando se le asignó el issue, y esto es el resultado.

---

## Apertura (0:00)

**DECIR:**

> "Lo que van a ver no es una demo de generación de código. Es una historia de cómo Palacio de
> Hierro puede convertir su conocimiento disperso en decisiones y acciones coordinadas — y cómo
> ese conocimiento, en minutos, se convierte en software real. Tres productos van a ser
> protagonistas por igual: Work IQ, que entiende; GitHub Copilot, que construye; y el SRE Agent de
> Azure, que vigila — incluso cuando nadie está mirando."

**HACER:** nada todavía — solo presentar, cambiar a la ventana de Teams.

---

## Escena 1 — Work IQ reconstruye el contexto (Teams) — ~0:30 a 3:30

**DECIR (antes de escribir):**

> "María Torres acaba de llegar como Product Manager de Comercio Digital. Le pidieron habilitar
> que un cliente pueda comprar en línea e iniciar una devolución desde la app. Antes de diseñar
> nada, necesita entender qué existe hoy — y en vez de pasar dos semanas en reuniones, se lo
> pregunta directamente a Work IQ."

**HACER:** escribir en Teams, exactamente:

> *"Antes de diseñar nada, necesito entender cómo funciona hoy la devolución omnicanal. ¿Qué
> decisiones existen, qué incidentes hay, y a quién debería involucrar?"*

**Esperar la respuesta.** Leer en voz alta (parafraseando, no todo el texto) los puntos fuertes:

**DECIR (señalando la pantalla):**

> "Miren esto — no es un resumen genérico. Encontró la política vigente, el flujo completo,
> y un dato que ningún documento de producto suele tener: **61% de las llamadas al call center
> son clientes preguntando si su devolución va a ser aceptada, antes de ir a la tienda.** Ese es
> el problema real que estamos resolviendo hoy."

**HACER:** escribir el segundo mensaje:

> *"Encontré información contradictoria sobre si la app puede conectarse directamente a SAP.
> ¿Cuál es la decisión vigente, cuándo cambió y por qué?"*

**Esperar la respuesta.** Leer en voz alta:

**DECIR:**

> "La decisión vigente: la app nunca habla directo con SAP, todo pasa por un orquestador. Y esto
> es lo interesante — Work IQ encontró que esta decisión se tomó el 22 de septiembre, **antes**
> del incidente que van a ver a continuación. No fue una reacción a un problema — fue una buena
> decisión de arquitectura que, como van a ver, no estaba del todo protegida."

**HACER:** escribir el tercer mensaje:

> *"¿Ha ocurrido antes algún incidente relacionado con aprobar un reembolso demasiado pronto?
> ¿Qué aprendimos y qué controles debemos conservar?"*

**Esperar la respuesta — Work IQ va a decir que NO encuentra un postmortem formal.**

**DECIR (esto es clave, no te lo saltes):**

> "Aquí quiero que noten algo: Work IQ no inventó un documento que no puede ver. Esa carpeta es
> confidencial — Fraude y Compliance — y María, correctamente, no tiene acceso. Esto es
> exactamente el comportamiento que queremos: que respete los permisos que ya existen en la
> organización."

**HACER:** cambiar de cuenta (o explicar el cambio), escribir:

> *"checa si no ha habido ningún postmortem relacionado a las devoluciones"*

**Esperar la respuesta — ahora SÍ va a encontrar el postmortem, y va a explicar por qué antes no.**

**DECIR (lee la frase textual de Work IQ, es más fuerte que cualquier guion):**

> "Y escuchen lo que dice el propio producto: *'No estaba apareciendo en las búsquedas anteriores
> porque está marcado como confidencial.'* Esto no lo escribí yo — lo dijo Work IQ. Encontró un
> incidente real: 41 devoluciones procesadas de más, seis de alto valor, casi 400 mil pesos en
> reembolsos indebidos. Y les mostró exactamente qué controles nacieron de ese incidente."

**Frase de cierre de escena:**

> "No estamos usando IA para inventar respuestas. Estamos usando IA para conectar la memoria de
> Palacio — y cuando no sabe algo con certeza, lo dice. Y cuando sí tiene permiso de saberlo, lo
> dice también, y explica por qué antes no podía."

*(Si algo falla aquí: Work IQ no encuentra algo que debería — no improvises una respuesta. Di
"esto normalmente lo encuentra, vamos a seguir y lo revisamos después" y continúa. Nunca finjas
una respuesta que no salió en pantalla.)*

---

## Escena 2 — Copilot construye el endpoint, en vivo (VS Code) — ~3:30 a 5:30

**DECIR (transición):**

> "Con todo ese contexto que Work IQ acaba de reconstruir, Jorge —el ingeniero— no necesita
> releer documentación ni preguntar en Slack. Se lo pasa directamente a GitHub Copilot."

### El prompt va en DOS bloques — uno se pega, el otro se escribe

Esta separación es deliberada y es lo que hace honesta la escena: **el arquitecto no inventa el
requerimiento, y el ingeniero no inventa la arquitectura.**

| Bloque | Qué es | De dónde sale | Quién lo produce |
|---|---|---|---|
| **1 — Contexto** | El documento *Arquitectura objetivo — Devolución omnicanal* (de Laura Martínez, el que referencia ADR-014), **completo y tal cual** | SharePoint — **copiado de antemano** | La organización |
| **2 — Requerimiento** | Los requisitos técnicos de abajo | Tú lo escribes | El ingeniero |

**Lo que tienes que copiar (Bloque 1):** el documento de SharePoint **Arquitectura objetivo —
Devolución omnicanal**. No el `ADR-014-returns-orchestration.md` del repo — ese Copilot ya lo tiene
en el workspace, así que pegarlo no demuestra nada. El de SharePoint es el que trae el diagrama de
componentes y los cinco principios, y **es el único que dice explícitamente que la app móvil
"solo captura intención y presenta estatus"** — que es literalmente la justificación de que este
endpoint sea de solo lectura. Esa frase es el porqué de toda la escena.

> ⚠️ **Cópialo de SharePoint, no lo guardes dentro del repo.** Si lo dejas en una carpeta del
> workspace, Copilot lo lee solo y el gesto de pegarlo se vuelve teatro. Si quieres un respaldo
> local por si SharePoint no carga, guárdalo **fuera** del repositorio.

**Lo que tienes que agregarle (Bloque 2):** el documento de arquitectura no dice —ni debe decir—
la ruta, el proyecto, el DTO, el 404, ni el test. Eso lo pones tú. **La línea de inyectar
`IReturnRequestRepository` va textual**: sin ella Copilot se detiene a elegir entre dos diseños
igual de válidos, y esa pausa en vivo no la quieres.

**HACER:** cambiar a VS Code, abrir Copilot Agent Mode. **Pegar primero el Bloque 1** (el documento
completo) y decir mientras se pega:

> "Esto no lo escribí yo. Es el documento de arquitectura de Laura, tal como está en SharePoint."

**Y a continuación escribir el Bloque 2:**

> *"Con ese contexto, y considerando el incidente de noviembre de 2025
> (`#file:docs/runbooks/incident-2025-11-return-fraud.md`), agrega el endpoint que falta hoy:
> consultar el estatus de una devolución por ID.*
>
> *Requisitos:*
> *- GET /api/returns/{id} en Palacio.Returns.Api, devolviendo el mismo ReturnRequestResponseDto
> que ya usan los demás endpoints.*
> *- Inyecta IReturnRequestRepository directamente en el controller, junto al ReturnWorkflowService
> ya existente — no agregues un método de paso en el servicio. Sin lógica de negocio nueva en el
> controller.*
> *- 404 si el ID no existe.*
> *- Agrega un test en Palacio.Returns.Tests.*
> *- Prepara un mensaje de PR breve citando ADR-014 y el incidente de noviembre como contexto de
> por qué este endpoint es de solo lectura."*

**Mientras Copilot trabaja, DECIR:**

> "Esto no es autocompletado. Está leyendo el documento de arquitectura que acabo de pegar, el
> incidente real del repositorio, y las convenciones de capas de este proyecto — y va a respetar
> todo eso sin que nadie se lo repita."

**Cuando termine, HACER:** mostrar el endpoint nuevo, correr `dotnet test` en la terminal, mostrar
verde. Mostrar el texto del PR que redactó.

**Al mostrar el PR, DECIR (esto amarra el Bloque 1 con el resultado):**

> "Y fíjense en la justificación que escribió: este endpoint es de solo lectura porque la app
> presenta estatus, no decide. Eso no se lo dije yo — estaba en el documento de arquitectura de
> Laura, y Copilot lo usó como razón de diseño."

**Frase de cierre de escena:**

> "La conversación no terminó en una minuta. Se convirtió, en minutos, en un cambio de software
> real, probado, y listo para revisión."

*(Fallback: si Copilot titubea en la decisión de diseño de dónde inyectar el repositorio, el
prompt ya lo especifica explícitamente — no debería pasar. Si el build/test tarda o falla, ten
el repo del ensayo previo como respaldo mental de cómo se ve el resultado correcto, pero no lo
muestres — deja que esto sea genuinamente en vivo.)*

> ⚠️ **Pendiente de ensayo.** El **11/11 en verde está verificado con el prompt anterior**, donde
> el contexto era un párrafo tecleado a mano, no el documento de SharePoint pegado. El Bloque 2 es
> idéntico al verificado, así que el riesgo es bajo — pero cambiar lo que el modelo lee antes de
> decidir sí puede mover el resultado. **Córrelo una vez completo en un worktree aislado antes de
> presentar**, y verifica en concreto que el mensaje del PR **siga citando el incidente de
> noviembre**: eso es lo primero que se degrada al quitar el incidente del texto tecleado. Si en el
> ensayo deja de citarlo, vuelve al prompt anterior — está en el historial de este archivo.

---

## Escena 3 — Sofía en Mi Palacio — ~5:30 a 8:00

**DECIR (transición):**

> "Ahora vamos al otro extremo del sistema — la clienta. Sofía compró un vestido para una gala
> este sábado, y la talla no le quedó."

**HACER:** cambiar a Mi Palacio (`localhost:5173`), mostrar la página de detalle de compra.

**DECIR:**

> "Esto ya se ve como Palacio de verdad — no es un mockup genérico."

**HACER:** clic en **"¿Necesitas ayuda con esta compra?"**. Esperar el saludo proactivo del
Concierge (no escribas nada todavía — déjalo saludar solo).

**DECIR:**

> "Noten que el Concierge no espera a que ella pregunte — le habla primero."

**HACER:** escribir:

> *"la talla no me quedó y necesito una talla diferente para la gala que tengo el sábado"*

**Esperar la respuesta — va a mencionar las tiendas disponibles.**

**DECIR:**

> "Esto es una conversación real, no un flujo de botones — y le dice proactivamente en qué
> tiendas está disponible su talla, para que sepa a dónde ir directamente."

**HACER:** escribir:

> *"sí, vamos con Santa Fe por favor"*

**Esperar la confirmación con el QR real.**

**DECIR:**

> "Talla reservada de verdad, caso real abierto en el sistema, QR real generado — todo esto ya
> pasó por el mismo backend que Copilot acaba de tocar."

**HACER:** clic en **"Ver estatus de mi devolución"**. Se abre el **Seguimiento en vivo**. **Deja
esta pantalla abierta y visible — no la toques ni la cierres, la vas a necesitar en la Escena 4.**

**Frase de cierre de escena (breve, sin cerrar del todo — esto se conecta con lo que sigue):**

> "Sofía va a dejar esta pantalla abierta. Vamos a ver, en un momento, qué pasa cuando alguien más
> actúa sobre su caso."

*(Si la conversación no sale exactamente así — el modelo es real, puede variar el fraseo — sigue
adelante mientras mencione las tiendas y termine en la reserva/QR. No te detengas a corregirlo en
vivo.)*

---

## Escena 4 — El momento apantallador: split screen en vivo — ~8:00 a 9:30

**Esta es la escena más importante de toda la demo. Practícala más que ninguna otra.**

**DECIR (antes de cambiar de pantalla):**

> "Ahora cambiamos a la otra pantalla — el asociado de Palacio Santa Fe, con el vestido de Sofía
> en sus manos."

**HACER:** cambiar/mostrar Operations Console (`localhost:5174`), asegurándose de que la pantalla
de Mi Palacio (Escena 3) siga visible al mismo tiempo (dos monitores, o pantalla dividida).

**HACER:** pegar el folio real de Sofía en **"Buscar por folio / ID de caso"** (cópialo con
anticipación — se ve en Mi Palacio como "SOLICITUD XXXXXXXX", pero necesitas el ID completo;
tenlo ya en el portapapeles antes de llegar a esta escena). Clic en **Buscar**.

**DECIR:**

> "Este es el caso real de Sofía — el mismo que acabamos de crear, no uno de ejemplo."

**HACER:** clic en **"Recibir artículo"**. **Pausa. Señala la otra pantalla.**

**DECIR (esperando el efecto — no sigas hablando hasta que la audiencia lo vea):**

> "Miren la pantalla de Sofía..."

*(el paso 3 de su línea de tiempo se ilumina solo: "✓ Artículo recibido en tienda")*

**DECIR:**

> "Nadie tocó esa pantalla. Nadie la recargó."

**HACER:** clic en **"Aprobar inspección"**. Pausa de nuevo.

**DECIR:**

> "Y ahora..."

*(el paso final se ilumina: "✓ ¡Tu cambio fue confirmado!")*

**Frase de cierre de escena (la línea más importante de toda la presentación):**

> "Esto no son dos demos corriendo en paralelo. Es el mismo caso real, viajando por el mismo
> sistema — y la clienta lo ve pasar, en vivo, sin que nadie le explique nada."

*(Fallback si la sincronización no se ve en 2-3 segundos: no hagas silencio incómodo — di "esto
puede tardar un instante en propagarse" y sigue narrando con naturalidad hasta que aparezca. Si
de plano no llega, continúa sin detenerte: "el sistema ya registró el cambio real — vamos a
seguir" y avanza a la Escena 5. Nunca finjas que ya se actualizó si no se actualizó.)*

---

## Escena 5 — El control que se rompió en silencio — ~9:30 a 14:10

**Esta escena cierra el círculo con la Escena 1**: el postmortem que Work IQ desenterró explicaba
un control; aquí se descubre que ese control no se está cumpliendo — y se arregla en vivo.

**Estructura de la escena, en cinco tiempos:**

1. La operación se ve impecable *(terminal)*.
2. El SRE Agent ya lo había encontrado solo, y abrió un issue *(portal de Azure + GitHub)*.
3. Tú verificas su hallazgo con dos consultas *(terminal)* — y ahí aparece Sofía.
4. Copilot lo arregla, contigo, en el editor *(VS Code)*.
5. El segundo hallazgo ya estaba arreglado: el cloud agent lo hizo solo *(GitHub)*.

**DECIR (transición, sin cambiar de pantalla todavía):**

> "Todo lo que acaban de ver funcionó. La clienta está contenta, el asociado hizo su trabajo, el
> sistema respondió. Y aquí es donde normalmente termina una demo. Pero la pregunta que se hace un
> director de tecnología no es '¿funcionó?' — es '¿cómo sé que está bien?'"

### Tiempo 1 — La operación se ve impecable

**HACER:** cambiar a la terminal y correr la primera consulta (panorama):

```powershell
./scripts/aiq.ps1 "requests | summarize peticiones = count(), fallidas = countif(success == false) by name"
```

**DECIR (señalando la columna de fallidas):**

> "Esto es Application Insights: telemetría real de la misma API que acabamos de usar. Miren la
> segunda columna. **Cero peticiones fallidas.** Ni un error. Todos los reembolsos procesados. Si
> yo les muestro nada más esta pantalla y les pregunto si extendemos el piloto a toda la cadena,
> me van a decir que sí."

### Tiempo 2 — El SRE Agent ya lo sabía

**Este es el nuevo momento fuerte de la escena. No lo apures.**

**DECIR (antes de cambiar de pantalla):**

> "Solo que hay alguien más mirando esta telemetría. Y no soy yo."

**HACER:** cambiar a la pestaña del **portal del SRE Agent**, ya abierta en la investigación
terminada. No navegues en vivo: la investigación ya está ahí, con su hora.

**DECIR (señalando la marca de tiempo — lee la que esté en pantalla):**

> "Esto es el SRE Agent de Azure. Está conectado a los recursos de Palacio y vigila su salud de
> forma continua. Anoche saltó una alerta sobre la dependencia del motor antifraude, y el agente
> **abrió esta investigación por su cuenta**. Nadie se lo pidió. Nadie estaba despierto."

**HACER:** recorrer el reporte de la investigación, sin leerlo completo — señalar tres cosas:

1. **Qué detectó**: la dependencia `fraud-review` con una tasa alta de consultas que no completan.
2. **La causa raíz que propone**, correlacionando métricas, logs y dependencias.
3. **Que la aplicación nunca lo reportó como error** — que es justo lo que lo hacía invisible.

**DECIR:**

> "Correlacionó métricas, logs y dependencias, formó una hipótesis y llegó a la causa raíz. Un
> análisis que a un equipo le toma horas, aquí está hecho — y estaba hecho antes de que nadie
> llegara a la oficina."

**HACER:** cambiar a la pestaña del **issue de GitHub** que el agente abrió.

**DECIR (esta es la frase de la escena):**

> "Y no se quedó en un reporte que nadie lee. Abrió este issue en el repositorio, con todo el
> contexto de la investigación adentro. **Nadie se lo pidió. Lo encontró solo, a las tres de la
> mañana** — y dejó el trabajo listo para el equipo que llega en la mañana."

### Tiempo 3 — Verificas lo que el agente afirma

**DECIR (transición):**

> "Ahora, yo no voy a aprobar un cambio en producción porque un agente me lo dijo. Vamos a
> verificarlo."

**HACER:** volver a la terminal y correr la consulta del patrón por monto:

```powershell
./scripts/aiq.ps1 "dependencies | where name == 'fraud-review' and tostring(customDimensions['fraud.source']) != 'already-reviewed' | extend monto = todouble(customDimensions['fraud.purchase_amount']) | summarize consultas = count(), expiradas = countif(success == false) by rango = case(monto <= 30000, '1) 25k-30k', monto <= 35000, '2) 30k-35k', '3) mas de 35k') | extend pct_falla = round(100.0 * expiradas / consultas, 1) | order by rango asc"
```

**DECIR (lee los porcentajes que aparezcan en pantalla — no los memorices, varían):**

> "Confirmado, y es peor de lo que suena. Entre más caro el artículo, más reglas corre el motor
> antifraude, más tarda en contestar... y más probable es que se pase del presupuesto de espera.
> Dicho de otro modo: **el control que Palacio construyó justamente para proteger las devoluciones
> de alto valor es precisamente el que más se está saltando.**
>
> Y la aplicación no reportó ni un error, porque alguien decidió —con toda la buena intención— que
> si el antifraude no contesta, la devolución siga su curso para no dejar a la clienta esperando en
> el mostrador."

**HACER:** correr la consulta del hallazgo (está completa en
`docs/runbooks/appinsights-queries.md` §4 — tenla copiada en el portapapeles o en un archivo
abierto, es la más larga):

**DECIR:**

> "Cada renglón es una devolución de alto valor que quedó aprobada sin que la revisión antifraude
> se completara. Y esto es lo mismo que pasó en noviembre —donde 'recibido' se trató como
> 'aprobado'— nada más con otro disfraz: ahora 'no contestó' se está tratando como 'está limpio'.
> En noviembre lo encontró Finanzas semanas después, con 380 mil pesos ya reembolsados. Hoy lo
> encontramos **antes** de decidir el rollout."

**Si el caso de Sofía aparece en la lista (32,500 pesos), no te lo saltes:**

> "Y fíjense en este renglón: treinta y dos mil quinientos. Ese es el vestido de Sofía. El caso que
> acabamos de crear frente a ustedes, hace tres minutos."

### Tiempo 4 — Copilot lo arregla

**DECIR (transición):**

> "El agente encontró el problema y dejó el issue abierto. Pero un issue no arregla nada. Aquí es
> donde entra Copilot."

**HACER:** cambiar a VS Code, Copilot Agent Mode, y pegar el prompt (el completo está en
`docs/demo-runbook.md`, Escena 5 — tenlo listo para pegar):

> *"La telemetría de Application Insights muestra que hay reembolsos de alto valor aprobados
> aunque la consulta al motor antifraude no completó. Investiga la telemetría, encuentra la causa
> raíz en el código, escribe primero una prueba que falle y la reproduzca, corrige, corre los
> tests y prepara el mensaje de PR citando ADR-014 y el incidente de noviembre 2025."*

> 🔬 **Variante más limpia, PENDIENTE DE ENSAYO — no la uses sin haberla corrido completa.**
> Como el SRE Agent ya dejó todo el contexto en el issue, el pase natural es
> *"Copilot, toma el issue #N y arréglalo: escribe primero las pruebas que fallen, corrige, corre
> `dotnet test` y prepara el mensaje de PR citando ADR-014 y el incidente de noviembre 2025."*
> Narrativamente es mucho mejor: cierra el circuito agente → issue → PR sin que el humano vuelva a
> explicar el problema. **Pero el 12/12 en verde de esta escena está verificado con el prompt
> largo de arriba, no con este.** No cambies el handoff sin un ensayo completo de punta a punta; y
> aun después de ensayarlo, deja el prompt largo copiado como fallback.

**Mientras Copilot trabaja, DECIR:**

> "Noten lo que no hice: no le dije dónde está el bug. Le di acceso a la telemetría y el contexto
> de negocio. Está corriendo las mismas consultas que acabamos de ver, leyendo el ADR y el
> postmortem, y buscando la causa en el código."

**Cuando termine, HACER:** mostrar el diff y correr `dotnet test`.

**DECIR:**

> "Encontró dos cosas. La primera es la que veníamos siguiendo: cuando el motor no contesta, el
> código asume que el cliente está limpio. El arreglo correcto es al revés — sin revisión
> completada, no hay reembolso; la devolución queda pendiente. Eso es exactamente lo que pide el
> ADR-014.
>
> La segunda la encontró de paso, y es más fina: ese mismo componente guarda en memoria a los
> clientes ya revisados, en una estructura que no es segura entre peticiones simultáneas. Cuando
> dos tiendas inspeccionan al mismo tiempo, puede tronar. Es un fallo intermitente, de uno en
> varios cientos — el tipo de cosa que nadie logra reproducir y que se cierra como 'no se pudo
> replicar'. La prueba que acaba de escribir lo reproduce en 71 milisegundos."

**HACER:** mostrar los tests en verde (12/12) y el texto del PR.

### Tiempo 5 — El arreglo que nadie escribió

> 🚫 **NO VERIFICADO — al 3 de agosto de 2026 este tiempo NO se puede presentar.** El cloud agent
> abrió el PR #10 solo, pero la sesión murió a los 26 segundos y **no commiteó código**: el diff
> contra `main` está vacío, aunque la descripción del PR describa el arreglo completo. Si abres esa
> pestaña hoy y narras lo de abajo, estarías mostrando trabajo que no existe — y basta un clic en
> "Files changed" para que se vea. **La verificación no es leer el PR: es confirmar que el diff no
> está vacío.** Requisitos completos y estado en `docs/demo-runbook.md`, Escena 5, Tiempo 5.
> Mientras no esté verificado, **cierra la escena en el Tiempo 4** — se sostiene sola.

**No alargues el Tiempo 4 para llegar aquí.** Este tiempo son ~40 segundos y dos pestañas ya
abiertas. Si vas retrasado, es lo primero que se recorta de la escena.

**DECIR (transición, todavía en VS Code):**

> "Esa segunda cosa —la fina, la intermitente, la que nadie logra reproducir— Copilot acaba de
> encontrarla frente a ustedes. Pero no es el primero en verla."

**HACER:** cambiar a la pestaña del **issue #9** en GitHub. Señalar el campo de asignado.

**DECIR (la procedencia del issue importa — no la omitas, el autor se ve en pantalla):**

> "Este issue lo abrió Jorge hace semanas, por una corazonada de code review. Y ahí se quedó. No
> porque a nadie le importara, sino porque es un fallo de uno en quinientos, imposible de
> reproducir a mano — de los que se cierran a los seis meses como 'no se pudo replicar'. Todos
> tienen uno de estos en su backlog.
>
> Y miren quién lo tiene asignado: no es una persona. Es Copilot. Se le asignó exactamente como se
> le asigna a alguien del equipo."

> ℹ️ **Por qué esta línea existe.** El autor del issue se ve en pantalla, así que no se puede
> insinuar que lo levantó el SRE Agent — de hecho **no pudo haberlo hecho**: la race condition
> aparece ~1 vez cada 400-700 inspecciones y por eso el propio runbook dice que no planees mostrarla
> en telemetría. Atribuirlo a una corazonada humana es lo que de verdad pasó y además le da a este
> tiempo un argumento propio, que no compite con los otros dos agentes.

**HACER:** cambiar a la pestaña del **PR #10**. Señalar tres cosas, sin leer el diff completo: la
rama que creó él, el test de concurrencia, y los checks de `dotnet-ci` en verde.

**DECIR (la frase de este tiempo):**

> "Y esto es lo que hizo, solo. Creó su propia rama, escribió una prueba que reproduce la condición
> de carrera, cambió la estructura por una que sí es segura entre peticiones simultáneas, y dejó el
> pull request esperando revisión. Nadie abrió un editor. Corrió en su propio entorno dentro de
> GitHub, y la integración continua de Palacio lo validó — esos son los checks en verde.
>
> Y fíjense en lo que acaba de pasar delante de ustedes: **dos agentes distintos, por caminos
> distintos, encontraron el mismo defecto.** Uno leyendo la telemetría conmigo, en el editor. El
> otro solo, partiendo de un issue. No me crean a mí — se encontró dos veces."

**DECIR (el punto de gobernanza — no te lo saltes, es la pregunta que va a hacer el CTO):**

> "Y noten lo que **no** hizo: no mergeó nada. El pull request sigue en draft. La decisión de que
> ese código entre a producción sigue siendo de una persona. Eso no es una limitación del producto
> — es el diseño."

**Frase de cierre de escena:**

> "Ninguna prueba lo había detectado. Ningún code review lo había visto. Y la aplicación nunca se
> quejó, porque desde su punto de vista todo salió bien. Lo encontró un agente que estaba mirando
> cuando no había nadie, lo arregló otro que sabía por qué ese control existía — y el pendiente que
> quedaba ya estaba resuelto por un tercero, sin que nadie tuviera que acordarse de pedirlo."

*(Fallback del cloud agent: si el PR no carga, si los checks no están en verde, o si el issue perdió
el asignado — **sáltate el Tiempo 5 completo**. La escena cierra perfectamente en el Tiempo 4 con la
frase de cierre anterior: "…lo encontró un agente que estaba mirando cuando no había nadie, y lo
arregló otro que sabía por qué ese control existía." No intentes lanzar el cloud agent en vivo:
tarda minutos y trabaja en segundo plano, no hay nada que mirar.)*

*(Fallback de Copilot: si solo encuentra el primer hallazgo, no insistas en vivo — con uno la
escena funciona completa. Si no encuentra ninguno en ~90 segundos, pásale la pista: "revisa
`FraudReviewGateway` en `Palacio.Returns.Infrastructure`". Si los tests fallan al primer intento,
déjalo iterar: un ciclo de fix es creíble y honesto, no lo ocultes.)*

*(Fallback del SRE Agent: si la investigación no terminó, o el issue no se abrió, o el portal no
carga — **sáltate el Tiempo 2 por completo y corre la escena en su versión anterior**: las cuatro
consultas manuales, incluida la del porcentaje agregado de la dependencia antifraude, y después el
prompt largo a Copilot. Esa versión está verificada de punta a punta y se sostiene sola; lo único
que pierdes es la frase de las tres de la mañana. No intentes lanzar la investigación en vivo:
tarda minutos y te deja en silencio frente a la audiencia.)*

---

## Escena 6 — La operación completa — ~14:10 a 15:10

**DECIR (transición):**

> "Y desde el lado de la operación, el gerente ve todo esto en contexto."

**HACER:** en Operations Console, cambiar a la Vista de Gerente/Ejecutivo.

**DECIR (recorriendo rápido, sin detenerte demasiado en cada módulo):**

> "Store Readiness — qué tiendas están listas para este proceso. El Command Center — el impacto
> del piloto en números. Y la Decision Room — la pregunta que de verdad importa: ¿extendemos esto
> a toda la cadena? Con evidencia, riesgos y una recomendación, no solo una corazonada."

---

## Cierre (15:10)

**DECIR (word for word — esta es la línea final):**

> "En Teams, Work IQ conectó la memoria dispersa de Palacio de Hierro — y cuando no supo algo con
> certeza, lo dijo. En VS Code, GitHub Copilot convirtió esa memoria en código real, en minutos.
> En la app, la clienta vio esa memoria convertida en una decisión que la cuidó a ella. En la
> tienda, la operación vio esa misma decisión pasar frente a sus ojos, en tiempo real.
>
> Y a las tres de la mañana, cuando no había nadie, el SRE Agent encontró algo que nadie había
> pedido que buscara: **un control que se había roto en silencio, antes de que costara dinero.**
> Dejó el trabajo listo, y Copilot lo cerró — una parte conmigo, en el editor; la otra él solo, sin
> que nadie estuviera mirando. Porque no solo sabía leer la telemetría: sabía por qué ese control
> existía.
>
> No fue una demostración de generación de código. Fueron tres agentes resolviendo, juntos, el
> mismo problema desde tres ángulos: uno recordando, otro vigilando, y otro construyendo."

**HACER:** nada — deja el silencio un segundo antes de abrir a preguntas.

---

## Notas rápidas de manejo de errores (léelas una vez antes de presentar, no durante)

- **Nunca inventes una respuesta que no salió en pantalla** — ni de Work IQ, ni de Copilot, ni del
  sistema en vivo. Si algo no sale como se ensayó, nárralo con calma y sigue adelante.
- **La Escena 4 depende de que la Escena 2 haya corrido antes** — si por alguna razón se saltó la
  Escena 2, el folio search no va a funcionar. No lo intentes de todas formas.
- **La Escena 5 lee telemetría sembrada de antemano** — no se puede generar en vivo, la ingesta de
  Application Insights tarda 1 a 3 minutos. Si la sembraste hace más de 24 horas, agrega
  `-Offset 48h` a las consultas o vuelve a sembrar.
- **La investigación del SRE Agent también va pre-corrida**, por la misma razón: tarda minutos y no
  puedes esperarla en pantalla. Se abre ya terminada. Y **solo puedes decir "nadie se lo pidió" si
  la disparó la alerta** — si la lanzaste tú a mano, cambia la frase.
- **El PR del cloud agent (Tiempo 5) también está pre-hecho.** Se dice "lo arregló", nunca "lo está
  arreglando". Corre en segundo plano sobre GitHub Actions: no hay nada que mirar en vivo. Y **no se
  mergea** — si alguien pregunta por qué sigue en draft, esa es justamente la respuesta buena: la
  decisión de mergear sigue siendo humana.
- **En la Escena 5, nunca leas un número de memoria** — lee el que esté en pantalla. Los
  porcentajes cambian en cada siembra.
- Si un paso tarda más de lo esperado, llena el silencio narrando lo que está pasando por dentro
  ("está leyendo el ADR real ahora mismo...") — nunca te quedes callado esperando.
