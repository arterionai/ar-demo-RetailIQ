# Guion de presentación — Inteligencia Palacio

> Este es el guion para leer/ensayar palabra por palabra. La referencia técnica (qué está
> verificado, qué está pendiente, arquitectura) vive en `docs/demo-runbook.md` — no la repitas
> aquí para no perder el hilo del presentador.
>
> Duración estimada: ~10-12 minutos. Tiempos son orientativos, no cronómetro.

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
- [ ] Copiado al portapapeles: nada todavía — el folio de Sofía se copia en vivo, en la Escena 3.

---

## Apertura (0:00)

**DECIR:**

> "Lo que van a ver no es una demo de generación de código. Es una historia de cómo Palacio de
> Hierro puede convertir su conocimiento disperso en decisiones y acciones coordinadas — y cómo
> ese conocimiento, en minutos, se convierte en software real. Dos productos van a ser
> protagonistas por igual: Work IQ, que entiende; y GitHub Copilot, que construye."

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

**HACER:** cambiar a VS Code, abrir Copilot Agent Mode, escribir exactamente:

> *"Con el contexto que Work IQ acaba de reconstruir sobre devoluciones omnicanal — ADR-014 (todo
> pasa por Returns Orchestrator, ningún canal de cliente decide el reembolso, SAP solo participa
> después de la inspección aprobada) y el incidente de noviembre 2025 (recibido ≠ aprobado,
> revisión antifraude obligatoria para montos > MXN $25,000) — agrega el endpoint que falta hoy:
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

> "Esto no es autocompletado. Está leyendo el ADR real, el incidente real, y las convenciones de
> capas de este proyecto — y va a respetar todo eso sin que nadie se lo repita."

**Cuando termine, HACER:** mostrar el endpoint nuevo, correr `dotnet test` en la terminal, mostrar
verde. Mostrar el texto del PR que redactó.

**Frase de cierre de escena:**

> "La conversación no terminó en una minuta. Se convirtió, en minutos, en un cambio de software
> real, probado, y listo para revisión."

*(Fallback: si Copilot titubea en la decisión de diseño de dónde inyectar el repositorio, el
prompt ya lo especifica explícitamente — no debería pasar. Si el build/test tarda o falla, ten
el repo del ensayo previo como respaldo mental de cómo se ve el resultado correcto, pero no lo
muestres — deja que esto sea genuinamente en vivo.)*

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

## Escena 5 — La operación completa — ~9:30 a 10:30

**DECIR (transición):**

> "Y desde el lado de la operación, el gerente ve todo esto en contexto."

**HACER:** en Operations Console, cambiar a la Vista de Gerente/Ejecutivo.

**DECIR (recorriendo rápido, sin detenerte demasiado en cada módulo):**

> "Store Readiness — qué tiendas están listas para este proceso. El Command Center — el impacto
> del piloto en números. Y la Decision Room — la pregunta que de verdad importa: ¿extendemos esto
> a toda la cadena? Con evidencia, riesgos y una recomendación, no solo una corazonada."

---

## Cierre (10:30)

**DECIR (word for word — esta es la línea final):**

> "En Teams, Work IQ conectó la memoria dispersa de Palacio de Hierro — y cuando no supo algo con
> certeza, lo dijo. En VS Code, GitHub Copilot convirtió esa memoria en código real, en minutos.
> En la app, la clienta vio esa memoria convertida en una decisión que la cuidó a ella. Y en la
> tienda, la operación vio esa misma decisión pasar frente a sus ojos, en tiempo real.
>
> No fue una demostración de generación de código. Fue Work IQ y Copilot resolviendo, juntos, el
> mismo problema desde dos ángulos — uno recordando, el otro construyendo."

**HACER:** nada — deja el silencio un segundo antes de abrir a preguntas.

---

## Notas rápidas de manejo de errores (léelas una vez antes de presentar, no durante)

- **Nunca inventes una respuesta que no salió en pantalla** — ni de Work IQ, ni de Copilot, ni del
  sistema en vivo. Si algo no sale como se ensayó, nárralo con calma y sigue adelante.
- **La Escena 4 depende de que la Escena 2 haya corrido antes** — si por alguna razón se saltó la
  Escena 2, el folio search no va a funcionar. No lo intentes de todas formas.
- Si un paso tarda más de lo esperado, llena el silencio narrando lo que está pasando por dentro
  ("está leyendo el ADR real ahora mismo...") — nunca te quedes callado esperando.
