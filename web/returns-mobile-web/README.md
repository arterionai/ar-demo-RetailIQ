# returns-mobile-web (diferido a Fase 2)

El frontend móvil/web no forma parte del MVP de esta demo. La narrativa central ocurre sobre
el backend (`src/Palacio.Returns.Domain` y `src/Palacio.Returns.Api`) y su historia de
issues/PRs — es ahí donde GitHub Copilot demuestra que puede combinar contexto de negocio con
código real.

Por diseño (ver `docs/adr/ADR-014-returns-orchestration.md`), esta capa **nunca debe llamar a
SAP directamente**: toda decisión de elegibilidad, inspección y reembolso pasa por
`Palacio.Returns.Api` / Returns Orchestrator.
