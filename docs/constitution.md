# Constitución del Proyecto — Proyecto Espejo / Inteligencia Palacio

> **Estado**: vivo. Se actualiza cuando cambie el stack, se agregue una superficie nueva o se
> descubra un anti-patrón que deba documentarse.
> **Alcance**: este documento gobierna todo el repositorio `ar-demo-RetailIQ`, incluyendo el
> backend existente (`src/`) y las superficies nuevas planeadas en `historia.md`
> ("Inteligencia Palacio": Agente Palacio en Teams, "Mi Palacio", Operations Console).
> **Relación con Copilot**: `.github/copilot-instructions.md` contiene reglas de ingeniería
> aplicadas por GitHub Copilot al generar código en este repo. Ese archivo debe mantenerse
> **consistente** con esta constitución — si hay conflicto, esta constitución prevalece y
> `.github/copilot-instructions.md` debe actualizarse para alinearse, no al revés.

---

## 1. Identidad del proyecto

- **Nombre**: Proyecto Espejo (mitad "ingeniería" de la demo "Inteligencia Palacio").
- **Tipo**: demo interna, no producto productivo. Simula la operación de devoluciones
  omnicanal de una cadena de tiendas de lujo ficticia ("Palacio de Hierro" como personaje
  narrativo, no el negocio real).
- **Propósito**: demostrar cómo Work IQ (Microsoft 365 Copilot) y GitHub Copilot combinan
  contexto de negocio disperso con código real para acelerar ingeniería y operación.
- **Rigor esperado**: proporcional a una demo. Se prioriza velocidad de desarrollo, coherencia
  narrativa y buen aspecto visual sobre robustez de sistema de misión crítica. No se inventan
  requisitos de compliance/regulación (PCI-DSS, SOX, protección de datos formal, etc.) que no
  aplican a este contexto — ver sección 7 para las restricciones reales que sí aplican (tenant
  M365 real y contenido de referencia de un sitio público real).

### 1.1 Superficies del sistema

| Superficie | Estado | Ubicación en el repo |
|---|---|---|
| Returns Orchestrator API (.NET 8) | Implementado | `src/Palacio.Returns.*` |
| Agente Palacio (bot de Microsoft Teams) | Planeado (Fase 2+) | fuera de este repo o `web/` a definir |
| Mi Palacio (web/app de cliente) | Planeado (Fase 2) | `web/mi-palacio` (a crear) |
| Palacio Operations Console | Planeado (Fase 2) | `web/operations-console` (a crear) |
| `web/returns-mobile-web` | Placeholder, diferido | `web/returns-mobile-web/README.md` |

Toda nueva superficie web debe vivir bajo `web/<nombre-kebab-case>` como proyecto independiente
(su propio `package.json`), nunca mezclada dentro de `src/` (que es exclusivamente .NET).

---

## 2. Stack Backend

### 2.1 Tecnología (ya implementada, no renegociable sin ADR)

- **.NET 8** (`global.json` fija SDK `8.0.423`, `rollForward: latestFeature`). No degradar a
  .NET 6/7 ni saltar a .NET 9 sin ADR explícito.
- **C#** con `Nullable` habilitado (`<Nullable>enable</Nullable>`) e `ImplicitUsings` habilitado
  en los cuatro proyectos. Todo código nuevo debe mantener nullable reference types activado;
  no usar `#nullable disable` salvo justificación puntual comentada en el archivo.
- **ASP.NET Core Web API** (`Palacio.Returns.Api`, SDK `Microsoft.NET.Sdk.Web`) con Swagger
  (`Swashbuckle.AspNetCore`) habilitado en desarrollo.
- **xUnit** (`Palacio.Returns.Tests`) + `coverlet.collector` para cobertura + Test SDK 17.8.

### 2.2 Arquitectura en capas

El repo ya establece una separación estricta de 4 proyectos y **debe mantenerse** al agregar
funcionalidad nueva (nuevos módulos del Operations Console que necesiten backend propio deben
seguir el mismo patrón, no acoplarse directo a `Palacio.Returns.Api`):

```
Palacio.Returns.Domain          → reglas de negocio puras, entidades, enums, abstracciones
                                   (interfaces de repos/gateways), excepciones de dominio.
                                   Sin dependencias a Infrastructure ni Api.
Palacio.Returns.Infrastructure  → implementaciones concretas (repos, clientes mock de SAP y
                                   fraude). Depende de Domain, nunca al revés.
Palacio.Returns.Api             → Web API. Controllers finos + DTOs. Depende de Domain e
                                   Infrastructure (para composición en Program.cs). Sin
                                   lógica de negocio en controllers.
Palacio.Returns.Tests           → xUnit. Depende de los tres anteriores.
```

**Regla dura (ya vigente en `.github/copilot-instructions.md`, ratificada aquí)**:
- Las reglas de negocio (elegibilidad, workflow de estados, fraude) viven **solo** en
  `Palacio.Returns.Domain` (ver `RefundEligibilityEvaluator`, `ReturnWorkflowService`,
  `QrCodeService`).
- Los controllers (`ReturnsController`) no contienen lógica de negocio: reciben DTO, invocan
  un servicio de dominio, mapean a DTO de respuesta.
- Ninguna superficie de cliente (móvil, web, POS, ni el futuro Agente Palacio) decide por sí
  misma si un reembolso está aprobado — ver ADR-014. Todo pasa por Returns Orchestrator.
- `StoreInspectionStatus.Received` y `StoreInspectionStatus.Approved`/inspección aprobada son
  estados distintos y **no deben tratarse como equivalentes** (ver
  `docs/runbooks/incident-2025-11-return-fraud.md`).

### 2.3 Patrones

- Repository pattern vía abstracciones en `Domain/Abstractions` (`IReturnRequestRepository`,
  `IFraudReviewGateway`, `ISapFolioClient`), implementadas en `Infrastructure`.
- DTOs explícitos por endpoint en `Api/DTOs` (`CreateReturnRequestDto`,
  `ReturnRequestResponseDto`, `InspectionDecisionDto`, `QrCodeResponseDto`). No exponer
  entidades de dominio directamente en las respuestas de la API.
- Dependency injection vía constructor (registro en `Program.cs`).
- Excepciones de dominio tipadas (`DomainException` y derivadas) para violaciones de reglas de
  negocio; no usar excepciones genéricas de .NET para errores de negocio esperables.

### 2.4 Convenciones de nomenclatura (C#)

- Clases, interfaces, records, enums, métodos públicos y propiedades: **PascalCase**
  (`ReturnWorkflowService`, `IFraudReviewGateway`, `EligibilityStatus`).
- Interfaces con prefijo `I` (`IReturnRequestRepository`).
- Parámetros y variables locales: **camelCase**.
- Campos privados: `_camelCase` (`_workflowService`).
- Namespaces reflejan la ruta de carpeta: `Palacio.Returns.<Proyecto>.<Carpeta>`.
- Nombres de archivo = nombre del tipo público que contienen (1 tipo público por archivo salvo
  DTOs pequeños relacionados).

---

## 3. Stack Frontend (superficies nuevas: Mi Palacio y Operations Console)

Hoy no existe frontend implementado (solo el placeholder diferido en
`web/returns-mobile-web`). Para las superficies nuevas de la Fase 2 (Mi Palacio, Operations
Console) se fija la siguiente decisión, alineada con lo ya sugerido en `historia.md` §9.5:

### 3.1 Decisión de stack

- **React + Vite + TypeScript**. Se elige por velocidad de desarrollo y ecosistema maduro de
  componentes visuales — apropiado para una demo donde el aspecto visual y la velocidad de
  iteración importan más que la robustez enterprise (SSR, SEO, etc. no son requisitos).
- **Gestión de estado**: estado local de React (`useState`/`useReducer`) + Context API para
  estado compartido acotado. No introducir Redux/Zustand salvo que la complejidad real del
  Operations Console (4 módulos con estado cruzado) lo justifique — evaluar cuando se empiece
  a construir, no adelantar infraestructura.
- **Estilos**: Tailwind CSS. Prioriza velocidad de construcción de UI con buen aspecto visual
  sin escribir CSS custom extenso, coherente con la prioridad de "verse bien rápido" para una
  demo de lujo/retail.
- **Componentes UI base**: librería headless (recomendado: shadcn/ui o Radix UI) sobre la que
  se aplica la identidad visual de Palacio. No adoptar un framework de componentes "opinionado"
  visualmente (p. ej. Material UI) que sea difícil de personalizar hacia una estética de lujo.
- **Cliente HTTP**: `fetch` nativo o `axios` con un cliente tipado fino sobre los DTOs que ya
  expone `Palacio.Returns.Api` (reusar los contratos, no reinventarlos en el frontend).
- **Chatbot concierge (Mi Palacio)**: revisado por el stakeholder — para esta demo, la lógica
  conversacional del Concierge Postcompra SÍ vive dentro de este repo, como un proxy Node/Express
  propio en `web/mi-palacio/server/` (proyecto Node independiente del build de Vite, con su
  propio `package.json`). El proxy recibe el historial de la conversación (`POST
  /api/concierge/chat`), agrega el system prompt (personalidad + hechos de la orden actual,
  tomados de `src/lib/order-fixture.ts` para no duplicarlos) y llama a Azure OpenAI (chat
  completions, `gpt-4.1-mini`). La API key de Azure OpenAI vive únicamente en el proceso del
  proxy (leída de variables de entorno / `~/.espejo-demo/azure-openai.env` en desarrollo local) y
  nunca llega al bundle del frontend. El frontend sigue sin embeber reglas de negocio de
  devoluciones: el modelo nunca decide ni ejecuta un cambio/devolución directamente (ADR-014) —
  solo puede invocar una tool sin parámetros de negocio sensibles (`iniciar_cambio_de_talla`) que
  señala la intención confirmada de la clienta; es el frontend quien, al recibir esa tool call,
  dispara las llamadas reales ya existentes contra `Palacio.Returns.Api` (`POST /api/returns`,
  `POST /api/returns/{id}/qr-code`) — la lógica de negocio de devoluciones (elegibilidad,
  reembolso) sigue viviendo exclusivamente en `Palacio.Returns.Domain`. Los widgets
  conversacionales de Operations Console (fuera de alcance de esta demo) no están cubiertos por
  esta decisión y podrían resolverse distinto (Copilot Studio / Teams AI Library / Work IQ) si se
  construyen más adelante.

### 3.2 Estructura de carpetas por superficie

Cada superficie web nueva es un proyecto Vite independiente bajo `web/`:

```
web/
  mi-palacio/               (cliente: chatbot concierge, estatus de devolución, QR)
  operations-console/       (operación: 4 módulos — Return Case 360, Store Readiness,
                              Experience Command Center, Decision Room)
```

Dentro de cada proyecto, estructura feature-based:

```
src/
  features/<nombre-feature>/
    components/
    hooks/
    api/
  components/            componentes compartidos presentacionales
  lib/                   utilidades (kebab-case: date-utils.ts, format-currency.ts)
```

### 3.3 Convenciones de nomenclatura (React/TS)

- Componentes: **PascalCase**, un componente por archivo, nombre de archivo = nombre del
  componente (`ReturnStatusCard.tsx`, `ConciergeChatPanel.tsx`).
- Hooks custom: **camelCase** con prefijo `use` (`useReturnEligibility.ts`).
- Utilidades no-componente: **kebab-case** (`date-utils.ts`, `format-currency.ts`).
- Tipos/interfaces TS: PascalCase; DTOs que reflejan contratos de la API deben nombrarse igual
  que su contraparte en `Api/DTOs` (p. ej. `ReturnRequestResponseDto`) para trazabilidad.
- Selectores de testing: siempre `data-testid`, nunca selectores por clase CSS o texto frágil.

---

## 4. Base de datos

### 4.1 Estado actual (deliberado, no un pendiente técnico)

El backend actual **no usa una base de datos real**. `InMemoryReturnRequestRepository` y los
clientes mock (`FraudReviewGateway`, `SapFolioClient`) simulan persistencia e integraciones
externas en memoria de proceso. Esta es una decisión consciente para la demo:

- No hay necesidad de infraestructura de datos para narrar Proyecto Espejo — el foco es el
  código, las reglas de dominio y el historial de issues/PRs, no la persistencia.
- El estado se reinicia en cada ejecución del proceso, lo cual es aceptable y esperado para
  esta demo (no depender de estado persistente entre corridas de la presentación).
- `historia.md` §9.5 sugiere SQLite u "datos simulados" como alternativa — se mantiene
  in-memory por defecto salvo que una escena específica de la demo requiera persistencia real
  entre reinicios (p. ej. para un despliegue web compartido en Azure).

### 4.2 Si se necesita persistencia real (superficies nuevas)

Si Mi Palacio u Operations Console requieren persistencia real (por ejemplo, para que el
Operations Console lea casos que sobreviven a reinicios, o para un despliegue accesible fuera
de una laptop de demo):

- **Motor recomendado**: SQLite para desarrollo local y demo standalone; si se necesita un
  despliegue compartido en Azure, Azure SQL Database (tier básico) — evitar introducir un
  motor nuevo sin necesidad narrativa concreta.
- **ORM**: Entity Framework Core, consistente con el ecosistema .NET 8 ya adoptado.
- **Ubicación**: las implementaciones de persistencia van en `Palacio.Returns.Infrastructure`
  (o un proyecto `Infrastructure` análogo para nuevas superficies backend), nunca en `Domain`
  ni en `Api`.
- **Nomenclatura**: tablas y columnas en `snake_case` si se usa un motor SQL, siguiendo la
  convención estándar de la organización (`return_requests`, `created_at`).
- **Migraciones**: reversibles, con columnas nuevas siempre `NULL`able o con `DEFAULT` para no
  romper datos de demo existentes.
- Dado que esto es una demo, no se requiere replicación, alta disponibilidad ni estrategias de
  backup — basta con que el esquema sea claro y reproducible desde script/seed.

---

## 5. DevOps / Infraestructura

### 5.1 CI actual

- **GitHub Actions** (`.github/workflows/dotnet-ci.yml`): build + test en cada push/PR a
  `main`, sobre `ubuntu-latest`, .NET 8.0.x. Pipeline: `restore` → `build` (Release) → `test`.
- Al agregar las superficies frontend nuevas, crear un workflow paralelo
  (`.github/workflows/web-ci.yml` o similar) con: install → lint → build → test (Vitest) →
  opcionalmente Playwright E2E. No mezclar el pipeline de frontend dentro del pipeline .NET.
- Mantener el principio fail-fast: si un step falla, no continuar al siguiente.

### 5.2 Despliegue

- No hay despliegue productivo — esto es una demo. Si se despliega alguna superficie web para
  la presentación (p. ej. Azure Static Web Apps / App Service para Operations Console), se
  documenta como despliegue de demo, no como entorno productivo con SLA.
- No introducir Docker/Kubernetes/Terraform salvo que una superficie concreta lo requiera
  explícitamente — evitar sobre-ingeniería de infraestructura para una demo.

### 5.3 Secrets y configuración

- Nunca hardcodear secrets, tokens de Microsoft Graph, credenciales de Copilot Studio/Teams AI,
  ni tokens de scraping en el repositorio. Usar variables de entorno / GitHub Actions secrets.
- `appsettings.Development.json` es para configuración local no sensible; cualquier secret real
  (aunque sea de un tenant de demo) va fuera del control de versiones.

---

## 6. Testing

### 6.1 Backend

- **xUnit** para unit tests de dominio (`Palacio.Returns.Tests/Domain`) — ya cubre
  `RefundEligibilityEvaluator`, `ReturnWorkflowService`, `QrCodeService`.
- Toda transición de estado de devolución (received, inspection, refund, fraude) debe tener
  test unitario y, cuando aplique, test de integración ligera contra los controllers.
- Nomenclatura de tests: `MethodName_Should[Expected]_When[Condition]` o equivalente
  descriptivo ya usado en el proyecto — mantener consistencia con los archivos existentes en
  `Palacio.Returns.Tests/Domain`.
- Mocking solo en boundaries: los mocks de SAP/fraude ya existen como implementaciones
  in-memory en `Infrastructure`; no mockear el dominio mismo.
- Cualquier fix relacionado con el incidente narrativo de noviembre (`docs/runbooks/`) debe
  incluir un test de regresión explícito que referencie el escenario.

### 6.2 Frontend (nuevo, a definir al construir Mi Palacio / Operations Console)

- **Unit/component tests**: Vitest + Testing Library (coherente con Vite, rápido de configurar
  para una demo).
- **E2E**: Playwright, con selectores `data-testid` exclusivamente.
- Nomenclatura de specs: `[feature].spec.ts`, `[feature].role-access.spec.ts` para escenarios
  con roles distintos (cliente vs. asociado de tienda vs. gerente en Operations Console).
- Screenshots on failure habilitados en la config de Playwright.
- No usar `sleep()`/waits arbitrarios; usar los mecanismos de espera de Playwright/Testing
  Library basados en estado real de la UI.

### 6.3 Regla general

- Tests independientes entre sí (no dependen de orden de ejecución ni de estado dejado por
  otro test).
- Un assert por concepto; múltiples asserts aceptables si verifican el mismo concepto.
- Dado que es una demo, no se exige un umbral de cobertura formal, pero todo cambio en reglas
  de negocio de `Domain` debe llevar test — esto es lo que hace creíble la narrativa de
  "Copilot generó pruebas junto con el código".

---

## 7. Seguridad y datos — restricciones específicas de esta demo

Esta demo corre en parte sobre un **tenant real de Microsoft 365** (`fractalcs.com`) con
usuarios ficticios pero reales dentro de ese tenant, y hace referencia visual a un sitio web
público real (palaciodehierro.com). Esto introduce restricciones concretas que son parte de
esta constitución, no un anexo opcional:

### 7.1 Tenant Microsoft 365

- Los usuarios ficticios (María Torres, Jorge Ramírez, etc. — ver `historia.md` §9.1) son
  personas simuladas dentro de un tenant real; no deben mezclarse con datos de usuarios reales
  de la organización ni usarse para enviar comunicación fuera del contexto de la demo.
- El contenido narrativo (políticas, ADRs de negocio, postmortems, correos) es ficticio y debe
  quedar claramente delimitado al propósito de demo — no debe presentarse como información
  operativa real de Palacio de Hierro dentro ni fuera del tenant.
- No se manejan datos personales reales de clientes ni de empleados de Palacio de Hierro en
  ningún artefacto de este repositorio ni del tenant de demo.

### 7.2 Referencia visual a palaciodehierro.com

- Cualquier "scraping" o extracción de referencia visual del sitio público
  **palaciodehierro.com** debe ser:
  - **Acotado**: solo páginas públicas (sin login, sin checkout, sin áreas que requieran
    autenticación de cliente).
  - **Sin bypass de controles de acceso**: no evadir robots.txt, rate limiting, CAPTCHAs ni
    ningún mecanismo de protección del sitio.
  - **No masivo**: extracción puntual de estilos/layout de referencia para mockup visual, no
    crawling sistemático del catálogo ni de datos de producto/precio a escala.
  - **Uso interno, no distribuido**: los assets/capturas resultantes se usan solo para
    construir el mockup visual interno de "Mi Palacio" en esta demo; no se publican, no se
    redistribuyen fuera del equipo de la demo, y no se presentan como propiedad de Palacio de
    Hierro real ante audiencias externas sin aclarar que es una recreación ficticia con fines
    de demostración.
- Cualquier duda razonable sobre si una extracción específica excede este alcance debe
  resolverse hacia el lado conservador (no hacerla) y consultarse antes de automatizarla.

### 7.3 Reglas generales de seguridad (proporcional a demo)

- Nunca hardcodear secrets, tokens de Graph API, ni credenciales de ningún tipo en el repo.
- Parameterized queries si en algún momento se introduce SQL real (sección 4.2) — nunca
  interpolación de strings en queries.
- Logging sin PII: aunque los datos son ficticios, mantener la disciplina de no loggear
  contenido sensible como si fuera un sistema real, ya que sirve como ejemplo de buenas
  prácticas dentro de la demo misma.
- No se requieren controles de compliance regulatorio (PCI-DSS, GDPR formal, SOX, etc.) — esto
  es una demo interna sin datos reales de tarjetas ni transacciones reales; no se deben
  implementar estos controles como si aplicaran, para no desviar esfuerzo de la narrativa.

---

## 8. Convenciones de Copilot / agentes de IA

- `.github/copilot-instructions.md` es la fuente de reglas de ingeniería que GitHub Copilot
  aplica automáticamente en este repo (nullable reference types, dominio aislado, controllers
  finos, Mobile nunca conecta directo a SAP, reglas de aprobación de reembolso, tests
  obligatorios en transiciones de estado, referencia a ADR en PRs).
- Esta constitución es la fuente de verdad de arquitectura; `.github/copilot-instructions.md`
  debe ser un subconjunto operativo consistente con ella. Si se agrega una regla nueva a
  `copilot-instructions.md`, debe reflejarse aquí (o viceversa) para evitar divergencia.
- Al construir las superficies nuevas (Agente Palacio, Mi Palacio, Operations Console), si se
  usan agentes de IA (Copilot Agent Mode, Teams AI Library, Copilot Studio) para generar código
  dentro de este repo, deben respetar las mismas reglas de capas y boundaries de esta
  constitución — un agente de IA no es una excepción a los límites de `Domain`/`Infrastructure`
  /`Api`.
- Los subagentes de este repositorio (`.claude/agents/`, `.github/agents/`) que revisen o
  generen código deben leer este archivo como referencia obligatoria de arquitectura, tal como
  indican sus propias instrucciones.

---

## 9. Comandos de build y desarrollo

```bash
# Backend
dotnet build
dotnet test
dotnet run --project src/Palacio.Returns.Api    # Swagger en /swagger (Development)

# Frontend (una vez creado un proyecto en web/<nombre>)
npm install
npm run dev
npm run build
npm run test          # Vitest
npx playwright test   # E2E
```

---

## 10. Cuándo actualizar esta constitución

- Al agregar una superficie nueva (Agente Palacio, Mi Palacio, Operations Console) que
  introduzca stack o patrones no cubiertos aquí.
- Al tomar una decisión de arquitectura formal (ADR) que cambie algo descrito en este
  documento — el ADR debe referenciarse desde aquí y esta constitución debe actualizarse para
  no divergir de la decisión vigente.
- Al descubrir un anti-patrón que deba prohibirse explícitamente.
- Al cambiar de versión mayor de .NET, React o cualquier pieza fija del stack.
