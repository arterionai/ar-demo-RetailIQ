# Mapeo de issues/PRs — Proyecto Espejo

El guion original de la demo nombraba issues/PRs con números de ejemplo (18, 21, 24, 27, 31,
42, 47, 51) que no coinciden con la numeración real, ya que el repositorio partió vacío. Esta
tabla es la referencia autoritativa para presentar la demo.

## Issues

| Título | Número real |
|---|---|
| Add digital return initiation | [#1](https://github.com/arterionai/ar-demo-RetailIQ/issues/1) |
| Separate received from inspection approved | [#2](https://github.com/arterionai/ar-demo-RetailIQ/issues/2) |
| Add high-value fraud review | [#3](https://github.com/arterionai/ar-demo-RetailIQ/issues/3) |
| Support QR expiration | [#4](https://github.com/arterionai/ar-demo-RetailIQ/issues/4) |
| POS compatibility for legacy stores | [#5](https://github.com/arterionai/ar-demo-RetailIQ/issues/5) |

## Pull Requests

| Título | Número real | Rama |
|---|---|---|
| Initial return workflow (contiene el bug) | [#6](https://github.com/arterionai/ar-demo-RetailIQ/pull/6) | `feature/digital-return-initiation` |
| Incident remediation (fix + fraude) | [#7](https://github.com/arterionai/ar-demo-RetailIQ/pull/7) | `feature/incident-remediation` |
| Polanco pilot (QR 72h) | [#8](https://github.com/arterionai/ar-demo-RetailIQ/pull/8) | `feature/polanco-pilot` |

Todos los PRs fueron mergeados a `main` con merge commit (no squash), preservando la historia
narrativa de commits dentro de cada uno.
