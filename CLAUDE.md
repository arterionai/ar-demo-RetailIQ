# CLAUDE.md — Reglas del Proyecto

Este repositorio usa un **pipeline spec-driven con varios ingenieros trabajando en paralelo**,
cada uno con su propia sesión de Claude Code. Este archivo contiene las reglas que TODA sesión
debe seguir. Lee el `README.md` para el modelo de trabajo en equipo completo.

## 1. Fuentes de verdad y precedencia

1. **`docs/constitution.md`** — documento normativo supremo: stack, versiones, convenciones de
   nomenclatura, comandos de build, reglas de negocio globales. **Léelo al iniciar cualquier
   tarea.** Si aún contiene placeholders `[...]` sin llenar, detente y pide que se complete
   antes de generar código o specs.
2. Documentos normativos de arquitectura en `docs/*.md` (si existen), subordinados a la
   constitución.
3. Documentos de `specs/` por fase/feature.

Este CLAUDE.md solo define **coordinación y proceso** — nunca contradice a la constitución.

## 2. Pipeline y gates de aprobación

```
Vision & Scope → BRD → Prototipo → requirements.md → spec.md → test-strategy → Implementación → QA sign-off
```

- Cada etapa la produce su agente (`product-strategist`, `rapid-prototyper`,
  `requirements-engineer`, `spec-author`, `test-strategist`, `engineer`/`co-dev`, `qa-analyst`)
  y se revisa con `spec-reviewer` (o el workflow `review-panel`) **antes** de pedir aprobación.
- **Ningún documento avanza a la siguiente etapa sin un "APROBADO" explícito del stakeholder
  humano**, registrado en el campo `Status` del documento.
- **NUNCA marques un Status como "Aprobado" por iniciativa propia** ni porque un subagente lo
  reporte — solo con instrucción explícita del stakeholder en la conversación.
- Plantillas de cada documento en `.claude/templates/`.

## 3. Coordinación multi-sesión / multi-ingeniero

Varias sesiones de Claude Code pueden estar editando este repo **al mismo tiempo**. Estas reglas
existen porque su ausencia ya causó colisiones reales (IDs duplicados con significados distintos,
casi-colisión en archivos compartidos). Son obligatorias, sin excepción:

1. **Dueño único por documento.** Cada documento de `specs/` tiene un ingeniero dueño (ver
   tabla de propiedad en el README). Solo el dueño lo edita. Si necesitas un cambio en un
   documento ajeno, **agrega una nota claramente atribuida y fechada** (autor + fecha + motivo)
   en vez de reescribir secciones o incrementar su versión — o pídeselo a su dueño.
2. **Antes de modificar cualquier archivo ya existente bajo `specs/`** (en particular si su
   `Status` es "Aprobado"): pregunta explícitamente al stakeholder si aprueba el cambio —
   describe qué se va a modificar, en qué sección y por qué. La aprobación general de un
   documento no cubre ediciones futuras no vistas.
3. **Vuelve a leer el archivo justo antes de editarlo**, aunque ya lo hayas leído en la misma
   conversación — pudo cambiar por otra sesión. Si no coincide con lo que esperabas: detente y
   avisa al usuario en vez de sobrescribir a ciegas.
4. **Contenido que no generaste y el usuario no mencionó** (secciones nuevas, versión más alta
   de la que recuerdas, documentos desconocidos) = obra de otra sesión concurrente. Repórtalo
   antes de continuar — no lo trates como error propio ni lo descartes en silencio.
5. **Rangos de IDs reservados por fase.** Los IDs (`US-x`, `AC-x`, `BR-x`, `TC-x`) son globales
   al proyecto. Cada fase reserva un bloque de 100: Fase 1 → 001–099, Fase 2 → 100–199,
   Fase 3 → 200–299, Fase 4 → 300–399, etc. Nunca crees un ID fuera del rango de tu fase.
   Registra los rangos asignados en `docs/constitution.md`.
6. **Archivos compartidos entre fases** (prototipo HTML, `vision-scope.md`, `docs/*.md`):
   un solo editor a la vez, con turno anunciado al equipo. Nunca lances un subagente a editar
   un archivo compartido sin confirmar que nadie más lo está tocando.
7. **Verifica el output de todo subagente antes de reportarlo como hecho**: qué archivos tocó
   (¿solo los que debía?), y si afirma que algo quedó "Aprobado" o "verificado", compruébalo
   leyendo el archivo — los subagentes a veces reportan estados que no son ciertos.
8. **Git desde el día uno.** Commit inicial inmediato en todo proyecto nuevo (sin historia git
   no hay worktrees ⇒ no hay trabajo paralelo seguro sobre código, y no hay recuperación ante
   borrados). Commits frecuentes y atómicos. Código en paralelo = ramas o worktrees separados.

## 4. Aceleración con subagentes y workflows

- **Revisiones de calidad**: usa el workflow `review-panel` (args:
  `{"documento": "specs/.../spec.md"}`) — 4 revisores especializados en paralelo + verificación
  adversarial de cada hallazgo. Alternativa secuencial: agente `spec-reviewer`.
- **Auditoría de consistencia**: workflow `consistency-sweep` (o skill `spec-consistency-audit`)
  — detecta colisiones de IDs, referencias con versión obsoleta, referencias rotas y estados
  inconsistentes entre documentos. Es solo-lectura: seguro con otras sesiones activas.
  Ejecútalo **antes de cada gate de aprobación**.
- Los agentes de revisión (`spec-reviewer`, `critic`, `security-analyst`, etc.) son solo-lectura
  y siempre pueden correr en paralelo. Los agentes que escriben requieren conjuntos de archivos
  disjuntos entre sí.

## 5. Convenciones de desarrollo

El detalle por tipo de archivo vive en `.github/instructions/*.instructions.md` (backend,
frontend, database, devops, testing) y el stack concreto en `docs/constitution.md`. Resumen
innegociable:

- **Backend**: validación de inputs en boundaries; never trust user input; capas
  Controller → Service → Repository; DTOs entre capas; dependency injection; nunca secrets
  hardcodeados; queries parametrizadas (jamás interpolación de strings en SQL); logging sin PII.
- **Frontend**: componentes PascalCase, utilidades kebab-case; selectores de testing con
  `data-testid`; accesibilidad WCAG AA (ARIA, keyboard nav, contraste); mobile-first;
  loading states explícitos para toda operación async; error boundaries.
- **Base de datos**: tablas y columnas snake_case; toda migración reversible (down/rollback);
  columnas nuevas con DEFAULT o NULL; nunca DROP column sin verificar uso; índices para FKs y
  columnas de filtro; paginación obligatoria en listados; audit columns (`created_at`,
  `updated_at`) y soft delete según constitución.
- **DevOps**: YAML 2 espacios; Dockerfiles multi-stage con non-root user y tags de versión
  específicos (no `latest`); CI fail-fast Build → Test → Lint → Security Scan → Deploy;
  secrets solo via vault/environment, nunca en archivos commiteados.
- **Testing**: nombres `should_[expected]_when_[condition]`; Arrange-Act-Assert; tests
  independientes del orden; sin `sleep()` arbitrarios; mocks solo en boundaries (DB, APIs
  externas, filesystem); E2E con Playwright y `data-testid`; screenshots on failure.
