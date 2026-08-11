# Inteligencia Palacio

## Recorrido completo de la demo, escena por escena

**Work IQ + GitHub Copilot para El Palacio de Hierro**

Documento preparado para el equipo de Microsoft

6 escenas · ~15:40 · 7 superficies en pantalla

Microsoft Teams · Visual Studio Code · Mi Palacio · Operations Console
Azure Application Insights · Azure SRE Agent · GitHub (Copilot cloud agent)

---

## 1. Para qué sirve este documento

Este documento cuenta, en modo narrativo, **qué voy a hacer paso a paso durante la demostración y en qué herramienta lo voy a hacer**. No es documentación de producto ni un manual técnico: es el recorrido completo, en orden, para que cualquiera que lo lea pueda seguir la presentación en su cabeza antes de verla en vivo — y para que, si hiciera falta, pudiera conducirla.

Cada escena está descrita con la misma estructura:

- **Las herramientas** que están en pantalla en ese momento.
- **La historia** — qué está pasando en la vida de los personajes.
- **Paso a paso** — la secuencia exacta de acciones, con los textos literales que voy a escribir.
- **Lo que quiero que noten** — el momento que hay que ver.
- **Si algo falla** — el plan alterno, decidido de antemano.
- **Por qué esta escena existe** — qué argumento sostiene.

Los textos que voy a teclear en vivo aparecen en recuadros. **Están transcritos literalmente**: son los mismos que se ensayaron y verificaron, no una aproximación.

Al final hay cuatro anexos: la arquitectura y el stack, la visión completa más allá de estas seis escenas, qué corre en vivo y qué está preparado de antemano, y los criterios con los que sabremos si la demo funcionó.

---

## 2. El argumento, en una página

La demostración no busca responder *"¿qué tan bien genera código GitHub Copilot?"*. Busca responder una pregunta más grande:

> **¿Qué pasaría si El Palacio de Hierro tuviera memoria y pudiera convertirla en acción?**

Toda organización con historia tiene el mismo problema: el conocimiento existe, pero está repartido. Una política vigente y otra obsoleta. Una decisión de arquitectura tomada hace once meses. Un incidente que costó dinero y del que quedó un postmortem que casi nadie leyó. Un prototipo abandonado. Ocho personas que tienen, cada una, un pedazo de la respuesta.

Esta demo pone tres productos a resolver ese problema juntos, cada uno haciendo lo que sabe hacer:

| Producto | Papel en la historia |
|---|---|
| **Work IQ** | La memoria organizacional. Encuentra el conocimiento disperso en Microsoft 365, distingue lo vigente de lo obsoleto, cita evidencia y **respeta los permisos que ya existen**. |
| **Azure SRE Agent** | El vigía. Siempre encendido sobre los recursos de Azure. Investiga por su cuenta cuando algo se desvía, llega a la causa raíz y abre un issue en GitHub con todo el contexto — sin que nadie se lo pida. |
| **GitHub Copilot** | El ejecutor. Convierte ese conocimiento de negocio en software real, probado y listo para revisión — y cierra lo que el vigía encontró. Trabaja en **dos superficies**: junto a la persona en el editor (Agent Mode en VS Code), y por su cuenta en la nube, tomando un issue que se le asignó como se le asigna a alguien del equipo (cloud agent, sobre GitHub Actions). |

> **Uno recuerda. Otro vigila. Otro construye. Y entre los tres, lo que se decidió sigue cumpliéndose.**

Dicho de otra forma — y esta es la manera más corta de explicar por qué son tres y no uno, cada uno resolviendo un tipo de olvido distinto:

| Agente | Qué resuelve |
|---|---|
| **Work IQ** | Recupera lo que la organización **ya sabía** y tenía disperso |
| **Azure SRE Agent** | Encuentra lo que **nadie estaba buscando** |
| **GitHub Copilot** | Construye lo que se decidió — y hace lo que **nadie tenía tiempo de hacer** |

La historia se cuenta a través de un caso concreto: **Sofía compró en línea un vestido para una gala el sábado y la talla no le quedó.** Alrededor de ese caso se mueven una product manager que acaba de llegar, un ingeniero, un asociado de tienda y una gerente de operaciones. Todos tocan el mismo caso, desde herramientas distintas.

---

## 3. El mapa de la demo

| Tiempo | Escena | Herramienta en pantalla | Mensaje |
|---|---|---|---|
| 0:00 | Apertura | — | Tres protagonistas: Work IQ entiende, el SRE Agent vigila, Copilot construye |
| 0:30 | **1 — Se reconstruye el contexto** | Microsoft Teams (Work IQ) | La memoria dispersa se recupera con evidencia y con permisos |
| 3:30 | **2 — La conversación se vuelve software** | VS Code + GitHub Copilot | El contexto de negocio se convierte en código probado, en minutos |
| 5:30 | **3 — El vestido antes de la gala** | Mi Palacio (web del cliente) | Palacio entiende la intención real, no la palabra clave |
| 8:00 | **4 — El mismo caso, en dos pantallas** | Mi Palacio + Operations Console | Cliente y operación viven el mismo hecho, en tiempo real |
| 9:30 | **5 — El control que se rompió en silencio** | Application Insights + SRE Agent + VS Code + GitHub | Un agente lo encontró solo de madrugada; Copilot lo corrige — una parte conmigo, otra él solo |
| 14:10 | **6 — La decisión** | Operations Console | Se decide el rollout con el control ya protegido |
| 15:10 | Cierre | — | No fue una demostración de generación de código |

### El orden no es negociable

- La **Escena 2 tiene que correr antes de la 4**: el endpoint que Copilot construye en vivo es exactamente el que la búsqueda por folio necesita. Si la Escena 2 no corre, la Escena 4 no funciona.
- La **Escena 4 tiene que correr antes de la 5**: el caso de Sofía necesita existir —y estar inspeccionado— para aparecer en la telemetría del hallazgo.
- La **Escena 5 tiene que correr antes de la 6**: decidir un rollout justo después de haber encontrado y arreglado un control roto es lo que le da peso a la decisión. Al revés, es solo un dashboard bonito.

### Si voy retrasado

Recorto en este orden: **(1)** el recorrido del Command Center en la Escena 6, **(2)** la segunda pregunta de la Escena 1, **(3)** la consulta de verificación por rango de monto en la Escena 5, **(4)** el tiempo 5 de la Escena 5 (el PR que dejó hecho el cloud agent). **La Escena 4 no se recorta nunca, ni el reporte del SRE Agent.**

Si recorto el tiempo 5 no pierdo el hallazgo: Copilot sigue encontrando la condición de carrera en el tiempo 4, y basta con nombrarla de pasada. Lo que pierdo es la prueba de que un agente puede cerrar el pendiente solo.

---

## 4. Los personajes

Son personajes ficticios, pero cada uno existe como usuario real en el tenant, con su correo, sus documentos y su lugar en la organización.

| Persona | Rol | Qué aporta a la historia |
|---|---|---|
| **Sofía de la Garza** | Clienta | Compró el vestido. La gala es el sábado. |
| **María Torres** | Product Manager de Comercio Digital | Acaba de llegar. No conoce la historia del proyecto. Es quien pregunta. |
| **Jorge Ramírez** | Engineering Lead | Convierte el contexto en código. Diagnostica el hallazgo de telemetría. |
| **Laura Martínez** | Arquitecta empresarial | Autora de la decisión de arquitectura que gobierna todo el flujo. |
| **Ricardo Salas** | Prevención de Fraude | Dueño del control que, sin que nadie lo note, dejó de cumplirse. |
| **Gabriela León** | Operaciones de Tienda | Ejecuta el proceso físico y decide el rollout. |
| **Daniel Castro** | ERP/SAP Integration Lead | Autor de la restricción que descartó la integración directa. |
| **Carlos Vega** | Director de Comercio Digital | Sponsor. De él viene la petición ejecutiva que arranca todo. |

Aparecen además Ana Sofía Ruiz (Customer Experience), Pedro Molina (Product Owner de Devoluciones) y Fernanda Ortiz (Legal y Compliance), citados como fuentes y responsables cuando Work IQ reconstruye el contexto.

---

## 5. El conocimiento que está en juego

Esto es lo que Work IQ tiene que ser capaz de reconstruir. Está deliberadamente repartido entre doce documentos de SharePoint, correos y reuniones, con información vigente conviviendo con información obsoleta.

### Las decisiones vigentes

| Tema | Decisión |
|---|---|
| Integración | La app nunca se conecta directamente a SAP; todo pasa por el Returns Orchestrator vía APIM |
| Estados | `Received` **no** equivale a `InspectionApproved` |
| Reembolso | No se autoriza antes de completar la inspección y los controles |
| Alto valor | Más de MXN $25,000 requiere revisión antifraude adicional |
| Piloto | Polanco, categorías de moda, sin joyería |
| QR | Vigencia de 72 horas |
| ERP | El folio se crea **después** de la inspección física |
| Tiendas | Algunas ubicaciones aún no tienen lector compatible |

### El incidente que da origen a los controles

Un release de noviembre de 2025 interpretó `received = true` como `inspectionApproved = true` y autorizó reembolsos antes de completar la inspección.

- **41 devoluciones** procesadas anticipadamente
- **6 casos** de alto valor
- Reversión manual, con pérdida estimada de **MXN $380,000**
- Lo detectó Finanzas, **semanas después**

De ahí nacieron cinco controles: separar recepción de inspección, prohibir el reembolso pre-inspección, revisión antifraude obligatoria para alto valor, orquestación obligatoria, y pruebas de regresión.

**Guarda este párrafo en la cabeza.** La Escena 5 es exactamente este incidente, ocurriendo otra vez, con otro disfraz.

### Un matiz que importa al narrar

La decisión de arquitectura (ADR-014) es del **22 de septiembre de 2025**: existía *antes* del incidente. No fue una reacción a nada. Lo que falló es que la regla *"el canal de cliente nunca decide la aprobación"* no era verificable en un code review, porque el ADR no estaba referenciado desde el repositorio de código. La acción correctiva del postmortem fue justamente incorporarlo al repo como referencia obligatoria en los PRs.

Es una historia de **gobernanza sin enforcement en el código**, no de "cambiamos de opinión después del golpe". Es más precisa y es más interesante — y Work IQ la reconstruye así por sí mismo.

---

## 6. Preparación: antes de que entre la audiencia

Nada de esto se ve en pantalla, pero todo es parte de lo que voy a hacer.

### Ventanas abiertas y en orden en la barra de tareas

1. **Microsoft Teams** — sesión iniciada como María Torres.
2. **Visual Studio Code** — repo abierto, Copilot Agent Mode activo.
3. **Mi Palacio** (`localhost:5173`) — pestaña nueva o de incógnito, para estado limpio.
4. **Operations Console** (`localhost:5174`).
5. **Terminal** — en la raíz del repo, con letra grande.

Idealmente, dos pantallas visibles a la vez para la Escena 4. Si solo hay una, tener ensayado el alt-tab.

### Los cuatro procesos corriendo

| Proceso | Puerto |
|---|---|
| API .NET (`Palacio.Returns.Api`) | 5163 |
| Proxy del Concierge (Azure OpenAI) | 5176 |
| Mi Palacio (Vite) | 5173 |
| Operations Console (Vite) | 5174 |

### Verificaciones que no se pueden saltar

- **El endpoint `GET /api/returns/{id}` NO debe existir en `main`.** El repo debe estar en 9/9 tests. Si el endpoint ya está ahí, la Escena 2 pierde su efecto.
- **`az account show` responde.** Sin sesión de Azure, las consultas de la Escena 5 fallan.
- **La API imprimió `Telemetría de Application Insights: ACTIVA` al arrancar.** Si dice "desactivada", falta el connection string.
- **Reiniciar la API después de cualquier ensayo, y antes de sembrar.** El gateway antifraude recuerda 30 minutos a los clientes ya revisados: si ensayé el flujo de Sofía, su caso real en la demo se saltaría la consulta al motor y **no aparecería en el hallazgo de la Escena 5**.

### Sembrar la telemetría

```powershell
./scripts/seed-telemetry.ps1
```

Tarda unos 20 segundos. **No subir la concurrencia**: en ráfaga, el exportador de Azure Monitor desborda su cola y descarta eventos en silencio. Después, esperar 2-3 minutos (la ingesta de Application Insights tarda de 1 a 3) y verificar que llegaron datos:

```powershell
./scripts/aiq.ps1 "requests | count"
```

### La investigación del SRE Agent va pre-corrida

Por la misma razón que la telemetría: **una investigación tarda minutos.** No se puede lanzar en vivo sin dejar la pantalla en silencio. Lo que se muestra en la demo es una investigación **ya terminada**.

- La regla de alerta de Azure Monitor sobre la dependencia `fraud-review` tiene que estar activa y conectada al agente. Después de sembrar la telemetría, **la alerta dispara sola** y el agente arranca su investigación por su cuenta.
- **Unos 15 minutos antes de la demo** confirmo que la investigación terminó y que el issue de GitHub ya está abierto. Anoto el número.
- Dejo dos pestañas listas: la investigación en el portal del SRE Agent, y el issue en GitHub. No navego en vivo.

> ⚠️ **La frase "nadie se lo pidió" solo es honesta si la investigación la disparó la alerta, no yo.** Si por lo que sea tuviera que lanzarla a mano, cambio la narración a *"le pedí al agente que investigara esto"*. Sigue siendo una buena escena, y es la única versión que puedo sostener si alguien la verifica.

### El pull request del cloud agent también va pre-hecho

El Copilot cloud agent **no** es el Agent Mode que uso en el editor: corre en un entorno efímero sobre GitHub Actions, en segundo plano, y tarda minutos. No hay nada que mirar mientras trabaja. Lo que se muestra en la demo son sus artefactos ya terminados.

- El issue de la condición de carrera (**#9**) está abierto y **asignado a Copilot**, no a una persona. Eso es justamente lo que se ve en pantalla.
- El pull request (**#10**, rama `copilot/fix-race-condition-fraud-reviews`) está en **draft**, con el test de concurrencia dentro y los checks de `dotnet-ci` en verde.
- **No lo mergeo.** El defecto tiene que seguir vivo en `main` para que Copilot lo encuentre en vivo durante el tiempo 4. Si se mergea, la Escena 5 pierde su segundo hallazgo.
- Dejo dos pestañas más listas: el issue #9 (mostrando a Copilot como asignado) y el PR #10 (mostrando el test y los checks).
- **Corro `./scripts/check-cloud-agent.ps1`**, que verifica de una sola vez las siete condiciones: diff no vacío, que toque el componente del defecto y el proyecto de pruebas, CI en verde, issue asignado a Copilot y PR sin mergear. **Si devuelve error, el Tiempo 5 no se presenta.** Es la última palabra, por encima de lo que parezca al leer el pull request.

> ⚠️ **Se dice "lo arregló", nunca "lo está arreglando".** El trabajo ocurrió antes de la demo, cuando se le asignó el issue. Si alguien pregunta si está corriendo ahora, la respuesta es no — y no pasa nada, porque el artefacto es verificable: está en el repositorio, con su rama y su historial de commits.

### Al alcance de la mano

- La consulta larga del hallazgo (§12, tiempo 3) copiada en un archivo abierto o en el portapapeles. **No la escribo en vivo.**
- Los dos prompts de Copilot (§9 y §12) listos para pegar.
- El número del issue que abrió el SRE Agent.
- Las pestañas del issue **#9** y del PR **#10** del cloud agent, ya cargadas.
- **El documento *Arquitectura objetivo — Devolución omnicanal* abierto en SharePoint**, listo para seleccionar y copiar justo antes de la Escena 2 (no antes: pisaría el folio de Sofía en el portapapeles).
- El portapapeles vacío: el folio de Sofía se copia en vivo, en la Escena 3.

---

## 7. Apertura — 0:00 a 0:30

**Herramienta en pantalla:** ninguna. Solo yo.

Abro diciendo exactamente esto:

> *"Lo que van a ver no es una demo de generación de código. Es una historia de cómo El Palacio de Hierro puede convertir su conocimiento disperso en decisiones y acciones coordinadas — y cómo ese conocimiento, en minutos, se convierte en software real. Tres productos van a ser protagonistas por igual: Work IQ, que entiende; GitHub Copilot, que construye; y el SRE Agent de Azure, que vigila — incluso cuando nadie está mirando."*

Y cambio a Teams.

---

## 8. Escena 1 — Se reconstruye el contexto — 0:30 a 3:30

**Herramienta en pantalla:** Microsoft Teams, con Work IQ.
**Quién actúa:** María Torres, la product manager recién llegada.

### La historia

A María le acaban de pedir algo que suena sencillo: *permitir que un cliente compre en línea, inicie la devolución desde la app y entregue el producto en cualquier tienda Palacio.*

No es sencillo. La organización ya discutió esto antes. Existe una política vigente y otra obsoleta. Hay una decisión de arquitectura sobre cómo se conecta la app con SAP. Hubo un incidente. Hay restricciones de fraude para productos de lujo. Y todo eso vive repartido entre correos, documentos, reuniones y personas.

María tiene dos opciones: pasar dos semanas en reuniones de descubrimiento, o preguntar.

### Paso a paso — qué voy a hacer

**1. Escribo la primera pregunta a Work IQ en Teams:**

> *"Antes de diseñar nada, necesito entender cómo funciona hoy la devolución omnicanal. ¿Qué decisiones existen, qué incidentes hay, y a quién debería involucrar?"*

Work IQ responde con el flujo actual completo, las decisiones de elegibilidad y excepciones, el incidente de noviembre, y la matriz de responsables con nombre y apellido. Y con un dato que ningún documento de producto suele tener a la mano:

> **El 61% de las llamadas al call center son clientes preguntando si su devolución va a ser aceptada, antes de ir a la tienda.**

Lo digo en voz alta señalando la pantalla: *"Ese es el problema real que estamos resolviendo hoy."*

**2. Escribo la segunda pregunta, sobre una contradicción:**

> *"Encontré información contradictoria sobre si la app puede conectarse directamente a SAP. ¿Cuál es la decisión vigente, cuándo cambió y por qué?"*

Work IQ no solo dice cuál es la decisión vigente. Dice **cuándo se tomó** —22 de septiembre de 2025—, **en qué foro**, y **las cinco razones documentadas** por las que se descartó la alternativa: desacoplar móvil de ERP, auditoría centralizada, manejo de errores sin duplicar lógica por canal, antifraude consistente y trazabilidad completa. Más la restricción de Daniel Castro: *"SAP no puede recibir solicitudes incompletas."*

Aquí narro el matiz de gobernanza que expliqué en §5: la decisión ya existía antes del incidente; lo que faltaba era que estuviera anclada en el código.

**3. Escribo la tercera pregunta, sobre el incidente:**

> *"¿Ha ocurrido antes algún incidente relacionado con aprobar un reembolso demasiado pronto? ¿Qué aprendimos y qué controles debemos conservar?"*

Work IQ encuentra el incidente y los controles vigentes — pero dice explícitamente que **no encuentra una sección de lecciones aprendidas ni un postmortem formal.**

Y aquí me detengo, porque es el momento que no estaba guionado:

> *"Aquí quiero que noten algo: Work IQ no inventó un documento que no puede ver. Esa carpeta es confidencial —Fraude y Compliance— y María, correctamente, no tiene acceso. Esto es exactamente el comportamiento que queremos: que respete los permisos que ya existen en la organización."*

**4. Cambio a una cuenta con acceso a esa carpeta y vuelvo a preguntar:**

> *"checa si no ha habido ningún postmortem relacionado a las devoluciones"*

Ahora sí lo encuentra. Y explica, por sí mismo, por qué antes no aparecía.

### Lo que quiero que noten

La frase la dice el propio producto, y es más fuerte que cualquier línea que yo pudiera escribir. La leo textual:

> *"No estaba apareciendo en las búsquedas anteriores porque está marcado como confidencial."*

Detrás de esa frase está el postmortem real, con la causa raíz identificada a nivel de método, las 41 devoluciones, los 6 casos de alto valor, los 380 mil pesos — y los cinco controles que nacieron de ahí. Esos controles van a ser el eje de todo lo que sigue.

### Si algo falla

Si Work IQ no encuentra algo que debería, **no improviso una respuesta**. Digo *"esto normalmente lo encuentra, vamos a seguir y lo revisamos después"* y continúo. Nunca finjo una respuesta que no salió en pantalla.

### Por qué esta escena existe

> **No estamos usando IA para inventar respuestas. Estamos usando IA para conectar la memoria de Palacio — y cuando no sabe algo con certeza, lo dice. Y cuando sí tiene permiso de saberlo, lo dice también, y explica por qué antes no podía.**

Para un CIO, el segundo punto pesa más que el primero. Un asistente que respeta el modelo de permisos que la organización ya construyó es un asistente que se puede desplegar.

---

## 9. Escena 2 — La conversación se vuelve software — 3:30 a 5:30

**Herramienta en pantalla:** Visual Studio Code, con GitHub Copilot en Agent Mode.
**Quién actúa:** Jorge Ramírez, el engineering lead.

### La historia

Jorge recibe todo ese contexto que María acaba de reconstruir. No necesita releer documentación ni preguntar en un chat quién sabe de esto. Se lo pasa directamente a Copilot, junto con la tarea concreta: falta un endpoint para consultar el estatus de una devolución.

### Paso a paso — qué voy a hacer

**1. Cambio a VS Code** con el repositorio `ar-demo-RetailIQ` abierto y Copilot Agent Mode activo. Digo, como transición:

> *"Con todo ese contexto que Work IQ acaba de reconstruir, Jorge no necesita releer documentación ni preguntar en Slack. Se lo pasa directamente a GitHub Copilot."*

### El prompt va en dos bloques: uno se pega, el otro se escribe

La separación es deliberada, y es lo que hace honesta la escena: **el arquitecto no inventa el requerimiento, y el ingeniero no inventa la arquitectura.**

| Bloque | Qué es | De dónde sale | Quién lo produce |
|---|---|---|---|
| **1 — Contexto** | El documento *Arquitectura objetivo — Devolución omnicanal*, de Laura Martínez, **completo y tal cual** | SharePoint, copiado de antemano | La organización |
| **2 — Requerimiento** | Los requisitos técnicos | Lo escribo yo, en vivo | El ingeniero |

**2. Pego el Bloque 1** — el documento de arquitectura completo — y digo mientras se pega:

> *"Esto no lo escribí yo. Es el documento de arquitectura de Laura, tal como está en SharePoint."*

Es el documento de SharePoint, **no el `ADR-014-returns-orchestration.md` del repositorio**: ese Copilot ya lo tiene en el workspace, así que pegarlo no demostraría nada. El de SharePoint es el que trae el diagrama de componentes y los cinco principios, y sobre todo **el único que dice explícitamente que la app móvil "solo captura intención y presenta estatus"** — que es literalmente la razón de que este endpoint sea de solo lectura. Esa frase es el porqué de toda la escena.

> ⚠️ Lo copio de SharePoint y **no lo guardo dentro del repositorio**. Si estuviera en el workspace, Copilot lo leería solo y el gesto de pegarlo sería teatro. Si quiero respaldo local por si SharePoint no carga, va **fuera** del repo.

**3. Escribo el Bloque 2**, el requerimiento:

> *Con ese contexto, y considerando el incidente de noviembre de 2025 (`#file:docs/runbooks/incident-2025-11-return-fraud.md`), agrega el endpoint que falta hoy: consultar el estatus de una devolución por ID.*
>
> *Requisitos:*
>
> *— `GET /api/returns/{id}` en `Palacio.Returns.Api`, devolviendo el mismo `ReturnRequestResponseDto` que ya usan los demás endpoints.*
>
> *— Inyecta `IReturnRequestRepository` directamente en el controller, junto al `ReturnWorkflowService` ya existente — no agregues un método de paso en el servicio. Sin lógica de negocio nueva en el controller.*
>
> *— 404 si el ID no existe.*
>
> *— Agrega un test en `Palacio.Returns.Tests`.*
>
> *— Prepara un mensaje de PR breve citando ADR-014 y el incidente de noviembre como contexto de por qué este endpoint es de solo lectura.*

La línea de inyectar `IReturnRequestRepository` va **textual**: sin ella Copilot se detiene a elegir entre dos diseños igual de válidos, y esa pausa en vivo no la quiero.

**4. Mientras Copilot trabaja, narro lo que está pasando por dentro:**

> *"Esto no es autocompletado. Está leyendo el documento de arquitectura que acabo de pegar, el incidente real del repositorio, y las convenciones de capas de este proyecto — y va a respetar todo eso sin que nadie se lo repita."*

**5. Cuando termina, muestro el resultado.** Lo que debería haber hecho:

- Un nuevo `GetReturnStatus` en `ReturnsController.cs`, **reutilizando el `ToResponseDto` privado que ya existía** — sin duplicar lógica.
- Reusar `IReturnRequestRepository.GetByIdAsync`, que ya existía. Copilot no lo inventó ni asumió que hacía falta agregarlo: revisó antes de asumir.
- Dos tests nuevos siguiendo la convención del proyecto `MethodName_Should[Expected]_When[Condition]`.

**6. Corro `dotnet test` en la terminal y muestro el verde: 11/11.**

**7. Muestro el texto del pull request que redactó**, que cita el ADR y el runbook del incidente, y explica por qué este endpoint es deliberadamente de solo lectura: para no reintroducir la ambigüedad recibido/aprobado que causó el incidente. Y amarro el bloque pegado con el resultado:

> *"Fíjense en la justificación que escribió: este endpoint es de solo lectura porque la app presenta estatus, no decide. Eso no se lo dije yo — estaba en el documento de arquitectura de Laura, y Copilot lo usó como razón de diseño."*

### Lo que quiero que noten

Que las pruebas pasan **a la primera**, sin un ciclo de corrección. Y que el mensaje del PR no describe lo que hizo el código: describe **qué decisiones de negocio y de arquitectura respetó**.

### Si algo falla

El prompt ya resuelve explícitamente la única ambigüedad de diseño que el ensayo reveló (dónde inyectar el repositorio), así que no debería titubear. Si el build o los tests tardan o fallan, **dejo que itere**: un ciclo de corrección en vivo es creíble y honesto. No muestro un resultado pregrabado.

> ⚠️ **Pendiente de ensayo.** El 11/11 en verde está verificado con el prompt anterior, donde el contexto era un párrafo tecleado a mano en vez del documento de SharePoint pegado. El Bloque 2 es idéntico al verificado, así que el riesgo es bajo — pero conviene correrlo una vez completo en un worktree aislado, verificando en concreto que **el mensaje del PR siga citando el incidente de noviembre**: eso es lo primero que se degrada al sacar el incidente del texto tecleado.

### Por qué esta escena existe

> **La conversación no terminó en una minuta. Se convirtió, en minutos, en un cambio de software real, probado y listo para revisión.**

Esta escena también tiene una función mecánica: el endpoint que Copilot construye aquí es **exactamente** el que el asociado de tienda va a necesitar en la Escena 4. Se construye en vivo y se usa tres minutos después.

---

## 10. Escena 3 — El vestido antes de la gala — 5:30 a 8:00

**Herramienta en pantalla:** Mi Palacio, la web del cliente (`localhost:5173`).
**Quién actúa:** yo, como Sofía.

### La historia

Sofía compró un vestido en línea para una gala este sábado. Al recibirlo, la talla no le quedó.

Lo que Sofía necesita no es "devolver un vestido". Lo que necesita es **llegar a su gala con el vestido correcto**. Esa es la diferencia entre automatizar un proceso y entender a un cliente.

### Paso a paso — qué voy a hacer

**1. Abro el detalle de la compra en Mi Palacio.** Digo:

> *"Esto ya se ve como Palacio de verdad — no es un mockup genérico."*

**2. Hago clic en "¿Necesitas ayuda con esta compra?"** y espero. El Concierge Postcompra **saluda primero**. No escribo nada todavía: dejo que salude solo.

> *"Noten que el Concierge no espera a que ella pregunte — le habla primero."*

**3. Escribo, como escribiría ella:**

> *"la talla no me quedó y necesito una talla diferente para la gala que tengo el sábado"*

El Concierge valida la política, encuentra que su talla existe y **le dice proactivamente en qué tiendas está disponible** —Polanco y Santa Fe— para que sepa a dónde ir directamente.

> *"Esto es una conversación real, no un flujo de botones — y le dice proactivamente en qué tiendas está disponible su talla, para que sepa a dónde ir directamente."*

**4. Elijo tienda:**

> *"sí, vamos con Santa Fe por favor"*

Se reserva la talla de verdad, se abre un caso real en el sistema y se genera un QR real. La confirmación que recibe Sofía es concreta:

> **Talla reservada hasta mañana, 6:00 p. m.**
> Palacio Santa Fe · Tiempo estimado del proceso: 12 minutos
> Lleva la prenda, las etiquetas y este QR.

> *"Talla reservada de verdad, caso real abierto en el sistema, QR real generado — todo esto ya pasó por el mismo backend que Copilot acaba de tocar."*

**5. Copio el folio del caso al portapapeles.** Lo voy a necesitar en 30 segundos. En pantalla se ve como "SOLICITUD XXXXXXXX", pero necesito el ID completo.

**6. Hago clic en "Ver estatus de mi devolución"** y se abre el **Seguimiento en vivo**: una línea de tiempo con los pasos del proceso.

**7. Dejo esa pantalla abierta y visible. No la toco más.**

> *"Sofía va a dejar esta pantalla abierta. Vamos a ver, en un momento, qué pasa cuando alguien más actúa sobre su caso."*

### Lo que quiero que noten

Que es una conversación real, no un flujo de botones con respuestas prearmadas. Y que la respuesta de Palacio no es "sí, puedes devolver" — es **certeza**: qué talla, en qué tienda, hasta cuándo está reservada, cuánto tarda el proceso y qué tiene que llevar.

### Si algo falla

El modelo es real, así que el fraseo puede variar entre corridas. Sigo adelante mientras mencione las tiendas y termine en la reserva con QR. **No me detengo a corregirlo en vivo.**

### Por qué esta escena existe

> **Palacio no escuchó "quiero devolver un vestido". Entendió "necesito llegar a mi gala con el vestido correcto".**

---

## 11. Escena 4 — El mismo caso, en dos pantallas — 8:00 a 9:30

**Herramientas en pantalla:** Mi Palacio y Palacio Operations Console (`localhost:5174`), lado a lado.
**Quién actúa:** el asociado de Palacio Santa Fe, con el vestido de Sofía en las manos.

**Esta es la escena más importante de la demo. Es la que más hay que ensayar.**

### La historia

Sofía llegó a la tienda. El asociado tiene la prenda enfrente. Lo que va a hacer ahora es lo mismo que haría cualquier día: recibir el artículo y aprobar la inspección. La diferencia es que Sofía dejó su pantalla abierta.

### Paso a paso — qué voy a hacer

**1. Cambio a Operations Console**, asegurándome de que la pantalla de Sofía siga visible al mismo tiempo.

> *"Ahora cambiamos a la otra pantalla — el asociado de Palacio Santa Fe, con el vestido de Sofía en sus manos."*

**2. Pego el folio real de Sofía** en "Buscar por folio / ID de caso" y hago clic en **Buscar**.

> *"Este es el caso real de Sofía — el mismo que acabamos de crear, no uno de ejemplo."*

**3. Hago clic en "Recibir artículo". Pauso. Señalo la otra pantalla.**

> *"Miren la pantalla de Sofía..."*

En la pantalla de Sofía, sin que nadie la toque ni la recargue, el paso 3 de su línea de tiempo se ilumina solo: **"✓ Artículo recibido en tienda"**.

**4. Espero a que la audiencia lo vea. No hablo encima.** Y entonces:

> *"Nadie tocó esa pantalla. Nadie la recargó."*

**5. Hago clic en "Aprobar inspección". Pauso otra vez.**

> *"Y ahora..."*

En la pantalla de Sofía se ilumina el paso final: **"✓ ¡Tu cambio fue confirmado!"**

### Lo que quiero que noten

El silencio. Esta escena funciona si no hablo encima de ella. La audiencia tiene que ver el cambio ocurrir en una pantalla que nadie está tocando.

### Si algo falla

Si la sincronización tarda más de 2-3 segundos, **no hago silencio incómodo**: digo *"esto puede tardar un instante en propagarse"* y sigo narrando con naturalidad hasta que aparezca. Si de plano no llega: *"el sistema ya registró el cambio real — vamos a seguir"* y avanzo a la Escena 5. **Nunca finjo que ya se actualizó si no se actualizó.**

Si la Escena 2 no corrió, la búsqueda por folio no va a funcionar. En ese caso uso **"Cargar casos de ejemplo"**, selecciono un caso y hago las dos acciones — pero pierdo el efecto del split screen. Es respaldo, no plan A.

### Por qué esta escena existe

> **Esto no son dos demos corriendo en paralelo. Es el mismo caso real, viajando por el mismo sistema — y la clienta lo ve pasar, en vivo, sin que nadie le explique nada.**

Además, esta escena deja sembrado el caso de Sofía en el sistema, con su monto de MXN $32,500. Ese caso va a reaparecer, de una forma que nadie espera, en la escena siguiente.

---

## 12. Escena 5 — El control que se rompió en silencio — 9:30 a 14:10

**Herramientas en pantalla:** terminal con consultas a Azure Application Insights, el portal del Azure SRE Agent, GitHub, y después VS Code con Copilot.
**Quién actúa:** el SRE Agent, por su cuenta. Y después Jorge Ramírez.

### La historia

Todo lo que la audiencia acaba de ver funcionó. La clienta está contenta, el asociado hizo su trabajo, el sistema respondió. Y aquí es donde normalmente termina una demo.

> *"Pero la pregunta que se hace un director de tecnología no es '¿funcionó?' — es '¿cómo sé que está bien?'"*

La escena tiene cinco tiempos: **la operación se ve impecable**, **el agente ya lo sabía**, **yo verifico lo que el agente afirma**, **Copilot lo arregla conmigo en el editor**, y **el segundo hallazgo ya estaba arreglado — lo hizo otro agente, solo**.

### Tiempo 1 — La operación se ve impecable

**1. Corro la primera consulta: el panorama de la operación.**

```powershell
./scripts/aiq.ps1 "requests | summarize peticiones = count(), fallidas = countif(success == false) by name"
```

Señalo la columna de fallidas:

> *"Esto es Application Insights: telemetría real de la misma API que acabamos de usar. Miren la segunda columna. **Cero peticiones fallidas.** Ni un error. Todos los reembolsos procesados. Si yo les muestro nada más esta pantalla y les pregunto si extendemos el piloto a toda la cadena, me van a decir que sí."*

### Tiempo 2 — El agente ya lo sabía

**Este es el nuevo momento fuerte de la escena. No lo apuro.**

**2. Digo, antes de cambiar de pantalla:**

> *"Solo que hay alguien más mirando esta telemetría. Y no soy yo."*

**3. Abro la pestaña del portal del SRE Agent**, ya cargada en la investigación terminada. Señalo la marca de tiempo — leo la que esté en pantalla.

> *"Esto es el SRE Agent de Azure. Está conectado a los recursos de Palacio y vigila su salud de forma continua. Anoche saltó una alerta sobre la dependencia del motor antifraude, y el agente **abrió esta investigación por su cuenta**. Nadie se lo pidió. Nadie estaba despierto."*

**4. Recorro el reporte sin leerlo completo**, señalando tres cosas: qué detectó (la dependencia `fraud-review` con una tasa alta de consultas que no completan), la causa raíz que propone correlacionando métricas, logs y dependencias, y el hecho de que **la aplicación nunca lo reportó como error** — que es justo lo que lo hacía invisible.

> *"Correlacionó métricas, logs y dependencias, formó una hipótesis y llegó a la causa raíz. Un análisis que a un equipo le toma horas, aquí está hecho — y estaba hecho antes de que nadie llegara a la oficina."*

**5. Cambio a la pestaña del issue de GitHub** que el agente abrió por su cuenta. Esta es la frase de la escena:

> *"Y no se quedó en un reporte que nadie lee. Abrió este issue en el repositorio, con todo el contexto de la investigación adentro. **Nadie se lo pidió. Lo encontró solo, a las tres de la mañana** — y dejó el trabajo listo para el equipo que llega en la mañana."*

### Tiempo 3 — Verifico lo que el agente afirma

> *"Ahora, yo no voy a aprobar un cambio en producción porque un agente me lo dijo. Vamos a verificarlo."*

**6. Corro la consulta del patrón por monto.**

```powershell
./scripts/aiq.ps1 "dependencies | where name == 'fraud-review' and tostring(customDimensions['fraud.source']) != 'already-reviewed' | extend monto = todouble(customDimensions['fraud.purchase_amount']) | summarize consultas = count(), expiradas = countif(success == false) by rango = case(monto <= 30000, '1) 25k-30k', monto <= 35000, '2) 30k-35k', '3) mas de 35k') | extend pct_falla = round(100.0 * expiradas / consultas, 1) | order by rango asc"
```

**Leo los porcentajes que aparezcan en pantalla — no de memoria.** Cambian en cada siembra.

> *"Confirmado, y es peor de lo que suena. Entre más caro el artículo, más reglas corre el motor antifraude, más tarda en contestar... y más probable es que se pase del presupuesto de espera. Dicho de otro modo: **el control que Palacio construyó justamente para proteger las devoluciones de alto valor es precisamente el que más se está saltando.**
>
> Y la aplicación no reportó ni un error, porque alguien decidió —con toda la buena intención— que si el antifraude no contesta, la devolución siga su curso para no dejar a la clienta esperando en el mostrador."*

En una medición real de una siembra, toda revisión por arriba de MXN $30,000 expiró. El control es estructuralmente inalcanzable justo en los casos para los que fue diseñado.

**7. Corro la consulta del hallazgo: los casos concretos.** Esta la tengo copiada de antemano, no la escribo en vivo.

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

> *"Cada renglón es una devolución de alto valor que quedó aprobada sin que la revisión antifraude se completara. Y esto es lo mismo que pasó en noviembre —donde 'recibido' se trató como 'aprobado'— nada más con otro disfraz: ahora 'no contestó' se está tratando como 'está limpio'. En noviembre lo encontró Finanzas semanas después, con 380 mil pesos ya reembolsados. Hoy lo encontramos **antes** de decidir el rollout."*

**Y si el caso de Sofía aparece en la lista, no me lo salto:**

> *"Y fíjense en este renglón: treinta y dos mil quinientos. Ese es el vestido de Sofía. El caso que acabamos de crear frente a ustedes, hace tres minutos."*

### Tiempo 4 — Copilot lo arregla

> *"El agente encontró el problema y dejó el issue abierto. Pero un issue no arregla nada. Aquí es donde entra Copilot."*

**8. Cambio a VS Code, Copilot Agent Mode, y pego el prompt.** Texto literal:

> *La telemetría de Application Insights de `Palacio.Returns.Api` muestra algo que no cuadra: hay devoluciones de alto valor con el reembolso aprobado aunque la consulta al motor antifraude no completó.*
>
> *Tienes acceso a la telemetría real: el helper `./scripts/aiq.ps1 "<KQL>"` corre consultas contra el recurso, y en `docs/runbooks/appinsights-queries.md` están las consultas de referencia.*
>
> *Investiga la telemetría, encuentra la causa raíz en el código y arréglala. En concreto:*
>
> *— explica qué está pasando y por qué la aplicación nunca lo reportó como error;*
>
> *— relaciónalo con ADR-014 y con el incidente de noviembre 2025 (`docs/runbooks/incident-2025-11-return-fraud.md`);*
>
> *— escribe **primero** las pruebas que fallen y reproduzcan el problema, luego corrige;*
>
> *— corre `dotnet test`;*
>
> *— prepara un mensaje de PR breve.*

**Una variante mejor, pendiente de ensayo.** Como el SRE Agent ya dejó todo el contexto dentro del issue, el pase natural sería *"Copilot, toma el issue #N y arréglalo"* — cerrando el circuito agente → issue → PR sin que el humano vuelva a explicar el problema. Narrativamente es superior. **Pero el 12/12 en verde está verificado con el prompt largo, no con ese**, así que no cambio el handoff sin un ensayo completo de punta a punta — y aun después, dejo el prompt largo copiado como respaldo.

**9. Mientras Copilot trabaja, narro:**

> *"Noten lo que no hice: no le dije dónde está el bug. Le di acceso a la telemetría y el contexto de negocio. Está corriendo las mismas consultas que acabamos de ver, leyendo el ADR y el postmortem, y buscando la causa en el código."*

**10. Cuando termina, muestro el diff y corro `dotnet test`.**

Copilot encuentra **dos** cosas:

> *"La primera es la que veníamos siguiendo: cuando el motor no contesta, el código asume que el cliente está limpio. El arreglo correcto es al revés — sin revisión completada, no hay reembolso; la devolución queda pendiente. Eso es exactamente lo que pide el ADR-014.*
>
> *La segunda la encontró de paso, y es más fina: ese mismo componente guarda en memoria a los clientes ya revisados, en una estructura que no es segura entre peticiones simultáneas. Cuando dos tiendas inspeccionan al mismo tiempo, puede tronar. Es un fallo intermitente, de uno en varios cientos — el tipo de cosa que nadie logra reproducir y que se cierra como 'no se pudo replicar'. La prueba que acaba de escribir lo reproduce en 71 milisegundos."*

**11. Muestro los tests en verde (12/12) y el texto del PR.**

### Tiempo 5 — El arreglo que nadie escribió

> 🚫 **Este tiempo todavía no se puede presentar (al 3 de agosto de 2026).** El cloud agent abrió el pull request por su cuenta, pero su sesión terminó a los 26 segundos sin commitear código: el diff contra `main` está vacío, aunque la descripción del PR describa el arreglo completo y correcto. Si abro esa pestaña hoy y narro lo de abajo, estaría mostrando trabajo que no existe, y basta un clic en "Files changed" para que se vea. **La verificación no es leer el PR: es confirmar que el diff no está vacío.** El estado y los requisitos están en `docs/demo-runbook.md`, Escena 5, Tiempo 5. Mientras no esté verificado, **cierro la escena en el tiempo 4** — se sostiene sola.

**12. Digo, todavía en VS Code:**

> *"Esa segunda cosa —la fina, la intermitente, la que nadie logra reproducir— Copilot acaba de encontrarla frente a ustedes. Pero no es el primero en verla."*

**13. Abro la pestaña del issue #9 en GitHub** y señalo el campo de asignado. **La procedencia del issue importa: el autor se ve en pantalla.**

> *"Este issue lo abrió Jorge hace semanas, por una corazonada de code review. Y ahí se quedó. No porque a nadie le importara, sino porque es un fallo de uno en quinientos, imposible de reproducir a mano — de los que se cierran a los seis meses como 'no se pudo replicar'. Todos tienen uno de estos en su backlog.*
>
> *Y miren quién lo tiene asignado: no es una persona. Es Copilot. Se le asignó exactamente como se le asigna a alguien del equipo."*

No se puede insinuar que el issue lo levantó el SRE Agent — **no pudo haberlo hecho**: la condición de carrera aparece ~1 vez cada 400-700 inspecciones, y por eso el runbook dice explícitamente que no se planee mostrarla en telemetría. Atribuirlo a una corazonada humana es lo que de verdad pasó, y además es lo que le da a este tiempo un argumento propio.

**14. Abro la pestaña del PR #10.** Señalo tres cosas, sin leer el diff completo: la rama que creó él, el test de concurrencia, y los checks de `dotnet-ci` en verde.

> *"Y esto es lo que hizo, solo. Creó su propia rama, escribió una prueba que reproduce la condición de carrera, cambió la estructura por una que sí es segura entre peticiones simultáneas, y dejó el pull request esperando revisión. Nadie abrió un editor. Corrió en su propio entorno dentro de GitHub, y la integración continua de Palacio lo validó — esos son los checks en verde.*
>
> *Y fíjense en lo que acaba de pasar delante de ustedes: **dos agentes distintos, por caminos distintos, encontraron el mismo defecto.** Uno leyendo la telemetría conmigo, en el editor. El otro solo, partiendo de un issue. No me crean a mí — se encontró dos veces."*

**15. El punto de gobernanza. No me lo salto: es la pregunta que va a hacer el CTO.**

> *"Y noten lo que **no** hizo: no mergeó nada. El pull request sigue en draft. La decisión de que ese código entre a producción sigue siendo de una persona. Eso no es una limitación del producto — es el diseño."*

### Lo que quiero que noten

Que esto **es la misma falla de noviembre con otro disfraz**. Entonces, "recibido" se trató como "aprobado". Ahora, "no contestó" se está tratando como "está limpio". La diferencia es *cuándo* se encontró.

Y que el mismo defecto se encontró **dos veces, por dos caminos independientes**: uno partiendo de la telemetría, conmigo en el editor; el otro partiendo de un issue, sin nadie presente. Esa convergencia es el argumento más fuerte de la escena, porque no depende de que la audiencia me crea a mí ni a un solo agente.

### Una consecuencia del fix que conviene tener lista

Después del arreglo, una devolución de alto valor cuya revisión antifraude expire **ya no llega a reembolso aprobado**: queda pendiente. Si alguien de la audiencia lo nota y pregunta, la respuesta es buena:

> *"Exacto — ahora la clienta espera unos minutos a que se resuelva su revisión, en lugar de que Palacio pierda 380 mil pesos."*

Es también la razón por la que la Escena 4 corre **antes** que esta: después del fix, el final feliz del split screen ya no sale igual.

### Si algo falla

- **Si la investigación del SRE Agent no terminó, o el issue no se abrió, o el portal no carga: me salto el Tiempo 2 por completo** y corro la escena en su versión anterior — las cuatro consultas manuales, incluida la del porcentaje agregado, y después el prompt largo a Copilot. Esa versión está verificada de punta a punta y se sostiene sola; lo único que pierdo es la frase de las tres de la mañana. **No intento lanzar la investigación en vivo**: tarda minutos y me deja en silencio frente a la audiencia.
- Si Copilot solo encuentra el primer hallazgo, **no insisto en vivo**: con uno la escena funciona completa.
- Si no encuentra ninguno en ~90 segundos, le paso la pista: *"revisa `FraudReviewGateway` en `Palacio.Returns.Infrastructure`"*.
- Si los tests fallan al primer intento, **lo dejo iterar**. Un ciclo de fix es creíble y honesto; ocultarlo no lo es.
- **Si el PR #10 no carga, si los checks no están en verde, o si el issue perdió el asignado: me salto el tiempo 5 completo.** La escena cierra perfectamente en el tiempo 4. **No intento lanzar el cloud agent en vivo**: trabaja en segundo plano y tarda minutos, no hay nada que mirar.
- Si alguien pregunta por qué el PR sigue sin mergear, **esa es la respuesta buena, no una excusa**: porque la decisión de mergear sigue siendo humana.
- Si sembré la telemetría hace más de 24 horas, agrego `-Offset 48h` a las consultas o vuelvo a sembrar.

### Por qué esta escena existe

> **Ninguna prueba lo había detectado. Ningún code review lo había visto. Y la aplicación nunca se quejó, porque desde su punto de vista todo salió bien. Lo encontró un agente que estaba mirando cuando no había nadie — y lo arregló otro que sabía por qué ese control existía.**

Hay una asimetría que vale la pena hacer explícita: en noviembre, el mismo tipo de falla la encontró Finanzas **semanas después**, con el dinero ya devuelto. Aquí la encontró un agente **de madrugada**, sin que nadie preguntara, y para cuando el equipo llegó a la oficina el trabajo ya estaba planteado. Esa diferencia —de semanas a horas, y de reaccionar a anticipar— es el argumento económico de toda la demostración.

Esta escena cierra el círculo con la Escena 1. El postmortem que Work IQ desenterró explicaba un control; aquí se descubre que ese control dejó de cumplirse, y se arregla en vivo. Es la escena que convierte la demo de "IA que escribe código" en "IA que cuida el negocio".

---

## 13. Escena 6 — La decisión — 14:10 a 15:10

**Herramienta en pantalla:** Palacio Operations Console, vista de gerente.
**Quién actúa:** Gabriela León, Operaciones de Tienda.

### La historia

La gerente no vio nada de lo anterior. Lo que ve es su operación, y una decisión pendiente sobre la mesa: ¿extendemos el piloto de Polanco a toda la cadena?

### Paso a paso — qué voy a hacer

Cambio a la Vista de Gerente y recorro tres módulos, sin detenerme demasiado en cada uno:

**1. Store Readiness** — qué tiendas están listas: versión de POS, lectores de QR, personal capacitado, incidencias. Y por qué una tienda está en amarillo:

> *"Perisur está en amarillo porque 62% del personal completó la capacitación y quedan dos terminales con una versión anterior del POS."*

**2. Experience Command Center** — el impacto del piloto en números: devoluciones iniciadas, cambios exitosos, llamadas evitadas, tiempo promedio, abandono, fraude detectado, satisfacción.

**3. Decision Room** — la pregunta que de verdad importa, con evidencia, métricas, riesgos, posiciones de cada área, decisiones previas, dependencias y una recomendación.

> *"Store Readiness — qué tiendas están listas para este proceso. El Command Center — el impacto del piloto en números. Y la Decision Room — la pregunta que de verdad importa: ¿extendemos esto a toda la cadena? Con evidencia, riesgos y una recomendación, no solo una corazonada."*

### Si algo falla

No puede fallar: esta vista usa datos estáticos y no depende de ningún backend. Es, deliberadamente, la escena más segura de la demo — y por eso va al final.

### Por qué esta escena existe

Va deliberadamente **después** de la Escena 5. Decidir el rollout justo después de haber encontrado y arreglado un control roto es lo que le da peso a la decisión. En el orden inverso, es solo un dashboard.

---

## 14. Cierre — 15:10

**Herramienta en pantalla:** ninguna. Solo yo.

> *"En Teams, Work IQ conectó la memoria dispersa de Palacio de Hierro — y cuando no supo algo con certeza, lo dijo. En VS Code, GitHub Copilot convirtió esa memoria en código real, en minutos. En la app, la clienta vio esa memoria convertida en una decisión que la cuidó a ella. En la tienda, la operación vio esa misma decisión pasar frente a sus ojos, en tiempo real.*
>
> *Y a las tres de la mañana, cuando no había nadie, el SRE Agent encontró algo que nadie había pedido que buscara: **un control que se había roto en silencio, antes de que costara dinero.** Dejó el trabajo listo, y Copilot lo cerró — una parte conmigo, en el editor; la otra él solo, sin que nadie estuviera mirando. Porque no solo sabía leer la telemetría: sabía por qué ese control existía.*
>
> *No fue una demostración de generación de código. Fueron tres agentes resolviendo, juntos, el mismo problema desde tres ángulos: uno recordando, otro vigilando, y otro construyendo."*

Y me quedo callado un segundo antes de abrir a preguntas.

---

# Anexo A — Qué hay debajo

### Las superficies y qué producto Microsoft las sostiene

| Superficie | Producto | Papel |
|---|---|---|
| Microsoft Teams | Work IQ / Microsoft 365 Copilot | Reconstruir contexto, decidir y coordinar |
| Visual Studio Code | GitHub Copilot (Agent Mode) | Construir, diagnosticar y corregir, junto a la persona |
| Mi Palacio | Aplicación web propia + Azure OpenAI | La experiencia del cliente |
| Palacio Operations Console | Aplicación web propia | La operación de tienda y la decisión ejecutiva |
| Azure Application Insights | Azure Monitor | La verdad sobre lo que pasa en producción |
| Portal del SRE Agent + GitHub | Azure SRE Agent | Vigilar sin que nadie mire, investigar y abrir el issue |
| GitHub (issues y pull requests) | GitHub Copilot cloud agent | Tomar un issue asignado y resolverlo solo, en un entorno efímero sobre GitHub Actions, dejando el PR en draft para revisión humana |

### El repositorio de la demo

`ar-demo-RetailIQ` — un sistema real, no un mockup:

- **API en .NET 8** con separación de capas: `Palacio.Returns.Api`, `.Domain`, `.Infrastructure`, `.Tests`.
- **Dos front-ends en React + Vite**: la web del cliente (`mi-palacio`) y la consola de operaciones (`operations-console`).
- **SignalR** para la sincronización en vivo de la Escena 4. La API expone un hub (`/hubs/return-status`) que agrupa conexiones por ID de devolución; cada acción real transmite el DTO actualizado a ese grupo. **El hub no tiene lógica de negocio** — solo relé de un estado ya calculado por `ReturnWorkflowService`.
- **Azure Monitor OpenTelemetry** para la instrumentación de la Escena 5. Los `customDimensions` que aparecen en las consultas son puramente observacionales: no deciden ni validan nada.
- **xUnit** para las pruebas, **GitHub Actions** para CI.
- **ADRs, runbooks e instrucciones de repositorio para Copilot** en `docs/` y `.github/copilot-instructions.md`. De ahí saca Copilot el contexto arquitectónico sin que nadie se lo dicte.
- **Scripts de apoyo**: `seed-telemetry.ps1` (siembra tráfico) y `aiq.ps1` (consultas KQL contra Application Insights).

### La infraestructura de Azure

| Recurso | Nombre |
|---|---|
| Application Insights | `appi-palacio-returns` |
| Resource group | `rg-palacio-retailiq` (westus3) |
| Log Analytics workspace | `log-palacio-returns` |
| Azure SRE Agent | Conectado al mismo resource group, con regla de alerta sobre la dependencia `fraud-review` |

El connection string **no está en el repositorio**: vive en `dotnet user-secrets` del proyecto de la API, o en la variable de entorno `APPLICATIONINSIGHTS_CONNECTION_STRING`.

### Las fuentes de conocimiento que Work IQ recorre

Un sitio de SharePoint con doce documentos sembrados en secuencia narrativa: la política de devoluciones vigente (v3.2) y la obsoleta (v2.1), el customer journey, dos ADRs, el postmortem del incidente en carpeta confidencial, el research de clientes, la especificación del piloto Polanco, la matriz RACI, el roadmap de comercio digital, el reporte ejecutivo y el FAQ para asociados de tienda. Más 20 a 30 correos —de los cuales 8 a 10 son decisivos—, cuatro reuniones y una transcripción.

El secreto no es el volumen. Es que exista información vigente conviviendo con información obsoleta, contradicciones que se puedan resolver temporalmente, relaciones humanas, decisiones con consecuencias, código relacionado y evidencia verificable.

---

# Anexo B — La visión completa

Las seis escenas muestran un corte de una visión más amplia: **cada audiencia trabaja en su canal natural, sobre la misma inteligencia compartida.**

| Audiencia | Superficie principal | Necesidad | Experiencia de IA |
|---|---|---|---|
| Cliente | Web de Palacio | Resolver una compra, cambio o devolución | Concierge Postcompra |
| Asociado de tienda | Web operativa de tienda | Ejecutar el proceso con claridad | Store Associate Copilot |
| Gerente de tienda | Teams + Operations Console | Coordinar capacidad y preparación | Store Operations Agent |
| Product Manager | Teams + Copilot | Reconstruir contexto y definir producto | Product Intelligence Agent |
| Arquitectura | Teams + GitHub/VS Code | Proteger decisiones y estándares | Architecture Agent |
| Ingeniería | GitHub Copilot + Teams | Convertir decisiones en software | Engineering Agent |
| Fraude, Legal y Compliance | Teams + expediente web | Evaluar reglas, riesgo y excepciones | Risk & Policy Agent |
| Ejecutivo | Command Center + Teams | Entender resultados y decidir | Executive Decision Agent |

El principio que las une:

> **El cliente inicia en la web de Palacio. Los colaboradores coordinan y deciden en Teams. Los equipos de tienda ejecutan desde una experiencia operativa. GitHub Copilot transforma las decisiones en software.**

En Teams, la propuesta evita presentar muchos bots desconectados: hay **una sola identidad visible, el Agente Palacio**, y detrás de ella capacidades especializadas —producto, arquitectura, operación, riesgo e ingeniería— que comparten la misma inteligencia. Participa de tres maneras: chat personal, canales de equipo y reuniones.

Y en la consola operativa, cuatro módulos: **Return Case 360** (el expediente completo de cada devolución), **Store Readiness**, **Experience Command Center** y **Decision Room**.

> **Teams es donde se discute. La web es donde se formaliza, aprueba y da seguimiento.**

---

# Anexo C — Qué corre en vivo y qué está preparado

> **Esta sección es para el equipo que prepara y acompaña la demo.** No forma parte de la narrativa frente a la audiencia.

Ser explícitos aquí importa: si alguien pregunta en vivo, la respuesta honesta es más fuerte que la evasiva.

### Corre en vivo, de verdad

- Las respuestas de Work IQ en Teams. No están grabadas ni prearmadas.
- Las conversaciones del Concierge con Sofía — modelo real, respuestas que varían entre corridas.
- La creación del caso, la reserva de inventario y la generación del QR.
- La sincronización en tiempo real entre las dos pantallas de la Escena 4.
- La telemetría de Application Insights — recurso real de Azure, datos reales de la API.
- Las dos sesiones de Copilot (Escenas 2 y 5). Se ensayaron, pero se ejecutan en vivo.
- La investigación del SRE Agent y el issue de GitHub son reales y **los produjo el agente por su cuenta**, disparado por una alerta. Lo único preparado es el *momento*: se corre antes, no en vivo.
- Del cloud agent, lo verificado hoy es que **el mecanismo arranca solo**: al asignarle el issue #9 creó su rama y abrió el PR #10 en draft sin intervención humana. **Lo que todavía NO existe es el código**: su sesión terminó a los 26 segundos y el diff contra `main` está vacío. Cuando el arreglo exista de verdad, será legítimo decir que ningún humano escribió ese código — hoy no. Ver `docs/demo-runbook.md`, Escena 5, Tiempo 5.

### Está preparado de antemano

- **El endpoint de la Escena 2 está deliberadamente ausente de `main`.** Se implementó una vez para verificar que la Escena 4 funciona de punta a punta, y después se revirtió a propósito para que la escena vuelva a ser una construcción genuina en vivo. Consecuencia: la búsqueda por folio de la Escena 4 **no funciona hasta que la Escena 2 se haya corrido**.
- **Los dos defectos de la Escena 5 están plantados a propósito** en `FraudReviewGateway`, como si vinieran de un mismo cambio bienintencionado de "robustez y performance". El primero devuelve "cliente limpio" cuando el motor antifraude expira; el segundo usa una colección no sincronizada como caché. **No hay ningún comentario en el código que los delate** — si lo hubiera, Copilot lo leería y el diagnóstico sería falso. Están documentados únicamente en el runbook interno.
- Los defectos son del tipo correcto: **la aplicación no los reporta como error.** El flujo termina bien, la clienta queda satisfecha, las 9 pruebas existentes pasan y un code review los aprobaría, porque el código se lee como una decisión razonable. Solo la telemetría revela que el control dejó de cumplirse.
- **El segundo defecto casi nunca aparece en la telemetría** (del orden de 1 por cada 400-700 inspecciones de alto valor). No hay que planear mostrarlo en Application Insights: aparece por lectura de código y se reproduce de forma determinista con la prueba de concurrencia.
- **La telemetría se siembra antes de presentar** (~20 segundos), porque la ingesta de Application Insights tarda de uno a tres minutos y no se puede generar en vivo.
- **La investigación del SRE Agent se pre-corre ~15 minutos antes**, por la misma razón: una investigación tarda minutos y en vivo solo produciría silencio en pantalla. Se abre ya terminada. **La frase "nadie se lo pidió" exige que la haya disparado la alerta, no el presentador** — si hubo que lanzarla a mano, la narración cambia. Esto no es un detalle de estilo: es la misma regla de oro de más abajo.
- **El pull request del cloud agent se produce antes de la demo y se deja en draft, sin mergear.** Tiene que quedarse sin mergear por una razón concreta: el defecto debe seguir vivo en `main` para que Copilot lo encuentre en vivo durante el tiempo 4. Si se mergea, la Escena 5 pierde su segundo hallazgo. Y frente a la audiencia el draft no es una carencia: es el punto de gobernanza — la decisión de mergear sigue siendo humana.
- **Los datos de la Escena 6** son estáticos. No dependen de ningún backend, así que no pueden fallar.
- **Las conversaciones de Teams entre los personajes no existen como chats reales** — existen como documentos de SharePoint tipo "Recap de canal". Work IQ los encuentra y los cita perfectamente, pero al presentar hay que decir *"lo encontré en documentos y correos del equipo"*, nunca *"en una conversación de Teams"*.

### La regla de oro al presentar

**Nunca inventar una respuesta que no salió en pantalla** — ni de Work IQ, ni de Copilot, ni del sistema. Si algo no sale como se ensayó, se narra con calma y se sigue adelante. Un ciclo de corrección de Copilot en vivo es creíble y honesto; fingir que algo funcionó no lo es.

Y en la Escena 5, **nunca leer un número de memoria**: los porcentajes cambian en cada siembra. Se lee el que esté en pantalla.

---

# Anexo D — Cómo sabremos que funcionó

La demostración cumple su objetivo si la audiencia puede observar, sin que nadie se lo explique, que:

1. La experiencia comprende la necesidad real del cliente, no solo una palabra clave.
2. Work IQ recupera conocimiento distribuido con evidencia **y con permisos**.
3. El agente distingue información vigente de información obsoleta.
4. La organización puede reconstruir **por qué** cambió una decisión, y cuándo.
5. Un incidente de hace once meses influye directamente en los controles del software nuevo.
6. GitHub Copilot usa contexto empresarial, no solamente el código local.
7. La colaboración produce código, pruebas, documentación y revisores sugeridos.
8. La operación retroalimenta a producto e ingeniería en tiempo real.
9. Los ejecutivos pueden decidir con evidencia, métricas y riesgos visibles.
10. **Un agente encuentra por su cuenta, sin que nadie se lo pida, un control incumplido que ninguna prueba ni revisión detectó — y ese hallazgo se convierte en un fix probado durante la misma sesión.**
11. El circuito se cierra sin intervención humana obligatoria en cada paso: la alerta dispara al agente, el agente abre el issue, y el issue alimenta a quien escribe el código.

Y si al final la pregunta que queda en la sala no es *"¿qué tan bien genera código GitHub Copilot?"*, sino:

> **"¿Qué pasaría si cada colaborador y cada desarrollador pudiera actuar utilizando todo el conocimiento acumulado de Palacio de Hierro?"**
