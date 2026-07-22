# ADR-014: Orquestación de devoluciones

## Estado
Aceptado.

## Contexto
Palacio de Hierro quiere permitir que un cliente inicie una devolución desde la app móvil y
la entregue físicamente en cualquier tienda. Antes de esta decisión se evaluó conectar la app
móvil directamente a SAP para simplificar el flujo.

## Decisión
La aplicación móvil **no se integrará directamente con SAP**. Toda devolución debe pasar por el
**Returns Orchestrator API**, que centraliza:

- validación de elegibilidad;
- reglas de revisión antifraude;
- reintentos y trazabilidad;
- creación del folio SAP únicamente después de que la inspección en tienda ha sido aprobada
  (nunca en el momento en que el cliente inicia la solicitud).

## Razones
- Desacoplamiento entre el canal móvil y el ERP.
- Auditoría centralizada de decisiones de reembolso.
- Reintentos y manejo de fallas sin duplicar lógica en el cliente.
- Reglas antifraude aplicadas de forma consistente sin importar el canal de origen.
- Trazabilidad completa del ciclo de vida de una devolución.

## Consecuencias
- Ningún servicio de cliente (móvil, web, POS) debe decidir por sí mismo si un reembolso está
  aprobado. Esa decisión vive exclusivamente en el dominio de Returns Orchestrator
  (`Palacio.Returns.Domain`).
- "Recibido en tienda" (`StoreInspectionStatus.Received`) y "inspección aprobada"
  (`StoreInspectionStatus.Approved`) son estados distintos y no deben tratarse como
  equivalentes — ver `docs/runbooks/incident-2025-11-return-fraud.md` para el incidente que
  motivó esta distinción explícita.

## Fuente canónica
Este documento es un resumen técnico. La versión de negocio completa (con historial de
discusión y aprobación ejecutiva) vive en el sitio de SharePoint del proyecto — este archivo
debe mantenerse consistente con esa fuente, no divergir de ella.
