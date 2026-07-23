# Palacio Operations Console

Prototipo de la superficie web operativa/interna de "Proyecto Espejo" / "Inteligencia
Palacio" (ver `historia.md` §6.2 en la raíz del repo). Prioriza velocidad de construcción y
buen aspecto visual sobre robustez de producción — es un prototipo para una demo en vivo, no
tiene pipeline formal de specs.

## Cómo correrlo

Requiere la API real corriendo primero:

```bash
# Terminal 1 — backend (desde la raíz del repo)
dotnet run --project src/Palacio.Returns.Api
# Swagger en http://localhost:5163/swagger
```

```bash
# Terminal 2 — este proyecto
cd web/operations-console
npm install
npm run dev
# abre http://localhost:5174
```

El proyecto está fijado al puerto **5174** (`vite.config.ts`, `strictPort: true`) porque
`Program.cs` del backend solo habilita CORS para `http://localhost:5173` (Mi Palacio) y
`http://localhost:5174` (este proyecto). Si el puerto 5174 ya está en uso, cierra el proceso
que lo ocupa en vez de dejar que Vite tome otro puerto — si no, CORS bloqueará las llamadas.

```bash
npm run build   # verifica que compila sin errores (tsc -b && vite build)
```

## Qué construye este prototipo

### Vista de Asociado de Tienda (prioridad máxima del encargo)

Es la parte más cuidada del prototipo — la petición explícita del stakeholder fue una app
para que los empleados procesen devoluciones físicamente.

- **Cola de casos** (`src/features/store-associate/components/CaseQueueList.tsx`): lista los
  casos cargados en la sesión actual del navegador.
- **"Cargar casos de ejemplo"** (`LoadSampleCasesButton.tsx`): dispara 2-3 llamadas reales
  `POST /api/returns` (no datos inventados en el cliente) con datos variados — un caso
  estándar, uno de alto valor (>MXN $25,000, para forzar la revisión de fraude) y un tercero
  estándar. Las respuestas completas de la API se guardan en el estado local de React
  (`ReturnCasesContext.tsx`) y de ahí en adelante cada acción (recibir, aprobar/rechazar
  inspección) actualiza ese mismo estado con la respuesta completa del POST correspondiente.
  No se necesita ningún GET para que el flujo completo de un caso funcione dentro de la misma
  sesión de navegador.
- **Detalle de caso** (`CaseDetailPanel.tsx`): cliente, orden, categoría, monto y los 4 status
  reales del backend (`eligibilityStatus`, `storeInspectionStatus`, `fraudReviewStatus`,
  `refundStatus`) con badges de color. Muestra un banner contextual "¿Por qué este caso
  requiere revisión?" cuando el monto supera MXN $25,000 (réplica en cliente de la regla real
  de `RefundEligibilityEvaluator.FraudReviewThreshold`, ver `src/lib/fraud-review-rule.ts` —
  el umbral vive en un solo lugar comentado y nunca decide nada por sí mismo; la decisión
  real siempre viene de la respuesta de la API).
- **Acciones reales**: "Recibir artículo" (`POST /api/returns/{id}/receive`), "Aprobar
  inspección" / "Rechazar inspección" (`POST /api/returns/{id}/inspection`). Los botones se
  habilitan/deshabilitan según el estado real devuelto por la API (p. ej. no puedes decidir
  la inspección antes de recibir el artículo).
- **"Buscar por folio / ID de caso"** (`FolioSearchInput.tsx`): existe visualmente, con un
  badge "Próximamente" y tooltip, pero está **deshabilitado y no dispara ninguna llamada de
  red**. Ver la sección "Qué quedó reservado" abajo.

### Vista de Gerente / Ejecutivo (secundaria)

Datos de muestra estáticos — no conectada a la API real, según el alcance pedido.

- **Store Readiness** (`src/features/manager/components/StoreReadinessBoard.tsx`): 4 tiendas
  de ejemplo tomadas de `historia.md` §6.2 y §5.5 — Polanco (verde, piloto activo), Perisur
  (amarillo, 62% de capacitación y 2 terminales con POS anterior), Santa Fe (amarillo, lector
  QR aún no habilitado, folio manual esta semana) e Interlomas (verde, lista para ampliar el
  rollout). Cada tarjeta tiene un toggle "¿Por qué está así?" con el detalle textual.
- **Experience Command Center** (`ExperienceCommandCenter.tsx`): 6 tiles de KPI con datos
  **simulados** (marcado explícitamente en el código y en la UI) — devoluciones iniciadas,
  cambios exitosos, tiempo promedio, abandono, casos con revisión de fraude, NPS.
- **Decision Room** (`DecisionRoom.tsx`): tarjeta de decisión "¿Debemos extender el piloto a
  todas las tiendas?" con evidencia/riesgos/recomendación/responsables (contenido estático de
  `historia.md` §6.2) y botones de acción cosméticos (solo estado local de React, no llaman a
  ninguna API).

Un selector de rol en el header (`data-testid="role-switcher"`) alterna entre ambas vistas.

## Qué quedó reservado para el live-build (NO implementado a propósito)

El backend hoy **no expone ningún endpoint GET** — es intencional, se construirá en vivo con
GitHub Copilot como clímax de la demo (junto con Mi Palacio). Por lo tanto:

- El input "Buscar por folio / ID" en la Vista de Asociado está **deshabilitado** (`disabled`
  en el `<input>`), con un tooltip "Próximamente: se conectará a GET /api/returns/{id} durante
  la demo en vivo" y un badge visual de "Próximamente". **No existe ninguna llamada `fetch` a
  un GET en este código** — confirmado: `src/lib/api-client.ts` solo expone
  `createReturnRequest`, `receiveReturnItem` y `submitInspectionDecision` (los 3 POST reales),
  con un comentario `// TODO(demo-live-build): se conecta a GET /api/returns/{id} durante la
  presentación en vivo` justo antes de esas exportaciones.
- Esto significa que un caso creado en otra sesión de navegador (o en Mi Palacio) **no es
  visible aquí** hasta que se implemente el GET en vivo. Por eso existe el botón "Cargar casos
  de ejemplo": crea casos reales propios para poder demostrar el flujo completo de Asociado
  de Tienda sin depender de ese GET.

## Estructura

```
src/
  features/
    store-associate/     Cola de casos, detalle, acciones (prioridad máxima)
    manager/              Store Readiness, Experience Command Center, Decision Room
  components/ui/          Button, Badge, Card, Tooltip (headless, estilo Palacio)
  lib/                    api-client.ts, types.ts, format-currency.ts, fraud-review-rule.ts, cn.ts
```

## Notas de implementación

- No usa librerías de iconos externas — todos los íconos son SVG inline.
- Sin dependencias de UI de terceros más allá de React/Vite/Tailwind (no se instaló shadcn/ui
  vía CLI para minimizar setup; los componentes en `components/ui/` siguen su misma filosofía
  headless + Tailwind).
- Todo elemento interactivo tiene `data-testid` (botones de acción, tabs, cards expandibles,
  banners de error, etc.) para permitir E2E con Playwright más adelante si se decide formalizar
  este prototipo.
- Tema oscuro con acento dorado (`--p-gold`) para la identidad de lujo de Palacio de Hierro,
  definido en `src/index.css`.
