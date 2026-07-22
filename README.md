# Palacio Returns — Proyecto Espejo

Backend de referencia para la demo "Proyecto Espejo": una devolución omnicanal para una
cadena de tiendas ficticia (Palacio de Hierro) que permite iniciar una devolución desde la
app móvil y completarla en cualquier tienda física.

Este repositorio es la mitad "ingeniería" de la demo. La mitad "negocio" (correos, reuniones,
políticas, ADRs de negocio, postmortems) vive en Microsoft 365 / SharePoint del proyecto —
ver `docs/adr/ADR-014-returns-orchestration.md` para la decisión de arquitectura que conecta
ambos mundos.

## Estructura

```
src/
  Palacio.Returns.Domain/          reglas de negocio (elegibilidad, fraude, workflow)
  Palacio.Returns.Infrastructure/   repositorio en memoria, clientes mock de SAP/fraude
  Palacio.Returns.Api/              Web API (controllers finos, sin lógica de negocio)
  Palacio.Returns.Tests/            tests unitarios e de integración ligera
web/returns-mobile-web/            diferido a Fase 2 (ver README de esa carpeta)
docs/adr/                          decisiones de arquitectura
docs/runbooks/                     runbooks de incidentes
```

## Cómo correrlo

```bash
dotnet build
dotnet test
dotnet run --project src/Palacio.Returns.Api
```

La API expone Swagger en `/swagger` en entorno de desarrollo.

## Contexto de la demo

Los issues y pull requests de este repositorio incluyen comentarios de revisión atribuidos a
roles simulados (por ejemplo, "Laura Martínez — Arquitectura"). Todos los comentarios se
publican desde una única cuenta de GitHub autenticada; los roles son parte de la narrativa de
la demo, no cuentas reales distintas.
