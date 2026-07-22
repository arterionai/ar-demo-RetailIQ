# Runbook: Incidente de noviembre 2025 — reembolsos aprobados antes de inspección

## Resumen
Un release permitió que la API autorizara el reembolso antes de que la inspección física
en tienda estuviera completa. `RefundEligibilityEvaluator.IsRefundApproved` trataba
`StoreInspectionStatus.Received` como si fuera `StoreInspectionStatus.Approved`.

## Causa raíz
- Se interpretó `received == true` como `inspectionApproved == true`.
- Faltaba una prueba de integración que cubriera la transición completa
  recibido → inspeccionado → aprobado.
- ADR-014 no estaba referenciado desde el repositorio de código, por lo que la regla de
  "el móvil nunca decide la aprobación de reembolso" no era verificable en revisión de PR.

## Impacto
- 41 devoluciones procesadas anticipadamente.
- 6 casos de alto valor (> MXN $25,000, sin revisión antifraude).
- Reversión manual de los reembolsos indebidos.
- Pérdida estimada: MXN $380,000.

## Remediación (este PR)
- `RefundEligibilityEvaluator.IsRefundApproved` ahora exige `StoreInspectionStatus.Approved`
  explícitamente (issue #21).
- Revisión antifraude obligatoria para devoluciones > MXN $25,000 (issue #24).
- El folio SAP se crea únicamente después de la inspección aprobada, nunca al iniciar la
  devolución.
- `docs/adr/ADR-014-returns-orchestration.md` ahora vive dentro del repositorio y se referencia
  desde las descripciones de PR.
- Cobertura de regresión agregada: ver
  `src/Palacio.Returns.Tests/Domain/RefundEligibilityEvaluatorTests.cs` y
  `ReturnWorkflowServiceTests.cs`.

## Seguimiento
- Pedro Molina (Producto de Devoluciones) y Jorge Ramírez (Engineering Lead) son responsables
  de verificar que ningún flujo futuro vuelva a tratar "recibido" como "aprobado".
