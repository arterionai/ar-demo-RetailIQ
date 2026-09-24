# Azure Deployment Plan — Palacio Returns API

## Status

Validated

## 1. Request

Deploy the RetailIQ Returns Orchestrator API and both React/Vite frontends to Azure so the new read-only status endpoint is publicly reachable from the demo web apps:

- `GET /api/returns/{id}`
- Existing return workflow endpoints under `/api/returns`
- SignalR hub remains part of the API deployment.
- Mi Palacio frontend is deployed as an Azure Static Web App.
- Operations Console frontend is deployed as an Azure Static Web App.

## 2. Target application

Backend API:

- Project: `src/Palacio.Returns.Api/Palacio.Returns.Api.csproj`
- Runtime: .NET 8
- Framework: ASP.NET Core Web API
- Repository: `arterionai/ar-demo-RetailIQ`
- Current branch/session: includes commit `faaf9a5` cherry-picked from the endpoint implementation session
- Validation so far: `dotnet test --nologo` passed 11/11 locally

Frontends:

- `web/mi-palacio` — React + Vite + TypeScript
- `web/operations-console` — React + Vite + TypeScript
- Both frontends are configured with `VITE_RETURNS_API_BASE_URL` pointing to the deployed API.

## 3. Current repository state

- Solution: `Palacio.Returns.sln`
- Domain project: `src/Palacio.Returns.Domain`
- Infrastructure project: `src/Palacio.Returns.Infrastructure`
- API project: `src/Palacio.Returns.Api`
- Tests: `src/Palacio.Returns.Tests`
- Persistence: in-memory repository by design for demo; no database required
- Existing telemetry package: `Azure.Monitor.OpenTelemetry.AspNetCore`
- Swagger is currently enabled only in `Development`
- CORS allows local demo frontends and deployment-provided origins through `PALACIO_ALLOWED_ORIGINS`:
  - `http://localhost:5173`
  - `http://localhost:5174`
  - Azure Static Web App URLs generated during deployment

Important deployment implication:

- Published backend state is in-memory and resets on app restart. This is acceptable for the demo API publish, but any created returns will not survive restarts.

## 4. Proposed Azure architecture

Minimal demo-safe Azure architecture:

- Azure App Service (Linux or Windows; .NET 8 supported)
- App Service Plan, low-cost SKU suitable for demo
- Application Insights for telemetry
- Azure Static Web Apps Free SKU for:
  - Mi Palacio
  - Operations Console
- No Azure SQL / Cosmos DB / Storage persistence in this phase
- No API Management in this phase
- No SAP, POS, Customer Profile, Order Service, Fraud Rules real integrations in this phase; existing mock/in-memory implementations remain unchanged

Rationale:

- The app is a simple .NET 8 API and the constitution explicitly says not to introduce Docker/Kubernetes/Terraform unless necessary for a concrete surface.
- App Service is the lowest-risk publish target for an ASP.NET Core demo API.
- The endpoint is read-only and preserves ADR-014: clients observe status from Returns Orchestrator without deciding eligibility or refund approval.

## 5. Deployment recipe

Selected recipe: Azure CLI + Bicep for Azure App Service.

Artifacts to generate after approval:

- `infra/main.bicep`
- `infra/main.parameters.json`
- App Service configuration for:
  - .NET 8 runtime
  - Application Insights connection string
  - `ASPNETCORE_ENVIRONMENT=Production`
- Static Web Apps resources for both frontends
- Frontend builds configured with:
  - `VITE_RETURNS_API_BASE_URL=https://palacio-returns-demo-api-m2wrmtltxtc4a.azurewebsites.net`

No Dockerfile planned.

## 6. Execution plan

After user approval:

1. Confirm Azure subscription and region with the user.
2. Generate Azure CLI/Bicep App Service infrastructure files.
3. Configure Azure App Service for `src/Palacio.Returns.Api`.
4. Configure Azure Static Web Apps for `web/mi-palacio` and `web/operations-console`.
5. Verify locally:
   - `dotnet test --nologo`
   - `dotnet publish src/Palacio.Returns.Api/Palacio.Returns.Api.csproj -c Release`
   - `npm run build` for both frontends
6. Mark this plan as `Ready for Validation`.
7. Invoke `azure-validate`.
8. Only if validation succeeds, invoke `azure-deploy` to publish.
9. Verify deployed endpoint using a fully-qualified `https://...` URL:
   - Create a return with `POST /api/returns`
   - Fetch it with `GET /api/returns/{id}`
   - Load Mi Palacio and Operations Console over HTTPS

## 7. Validation Proof

Validation run completed on 2026-09-24.

- `dotnet test --nologo` passed 11/11.
- Frontend expansion run:
  - `npm run build --prefix web\mi-palacio` completed successfully with `VITE_RETURNS_API_BASE_URL` pointing to Azure backend.
  - `npm run build --prefix web\operations-console` completed successfully with `VITE_RETURNS_API_BASE_URL` pointing to Azure backend.
  - `az bicep build --file infra\main.bicep` completed successfully after adding both Static Web Apps.
  - `validate-deployment.ps1 -Scope group -ResourceGroup rg-palacio-returns-demo -Subscription 33bbf1e1-134d-42e3-a370-0dfb1da16cff` completed with `OVERALL: PASS` after setting Static Web Apps location to `eastus2`.
- `dotnet publish src\Palacio.Returns.Api\Palacio.Returns.Api.csproj -c Release --nologo -o .azure\publish\api` completed successfully.
- `az bicep build --file infra\main.bicep` completed successfully.
- `dotnet build --configuration Release --no-restore --nologo` completed successfully: 0 warnings, 0 errors.
- `pwsh C:\Users\JaimeSanchez\.agents\skills\azure-validate\references\recipes\scripts\validate-deployment.ps1 -Scope group -ResourceGroup rg-palacio-returns-demo -Subscription 33bbf1e1-134d-42e3-a370-0dfb1da16cff` completed with `OVERALL: PASS`.
  - Azure CLI installed: PASS
  - Authenticated subscription: PASS (`Sponsored 1000USD Nov 2026`)
  - Bicep compilation: PASS
  - Template validation: PASS
  - What-if preview: PASS (`Create: 5, Modify: 0, Delete: 0`)
- Static role verification: PASS. Template does not assign custom Azure RBAC roles; the App Service has a system-assigned managed identity but no external role dependencies in this phase.
- Rename cleanup run:
  - Backend public resource naming moved from `palacio-*` to `retailiq-*`.
  - Backend CORS configuration setting renamed from `PALACIO_ALLOWED_ORIGINS` to `DEMO_ALLOWED_ORIGINS`.
  - Existing Static Web Apps are intentionally reused to preserve their already-published public URLs.

All validation checks pass:

- [x] 1. Core Validation (CLI, auth, build, validate, what-if) — run `validate-deployment.ps1`
- [x] 2. Linting/build validation — Bicep build + .NET Release build passed
- [x] 3. Azure Policy Validation — ARM template validation and what-if passed for target subscription/resource group

## 8. Notes

This plan was created first as required by the Azure deployment workflow. Deployment must follow:

`azure-prepare -> azure-validate -> azure-deploy`

## 9. Out of Scope

- Deploying the concierge Node proxy
- Persisting returns across restarts
- API Management gateway
- Custom domain/TLS certificates beyond the default App Service hostname
- Production hardening beyond demo-safe defaults

## 10. Azure Context

- Subscription: `Sponsored 1000USD Nov 2026` (`33bbf1e1-134d-42e3-a370-0dfb1da16cff`)
- Tenant: `Default Directory` (`7b1683c8-3607-4002-a544-89f96fa0ef3a`)
- Region: `eastus`
- Static Web Apps region: `eastus2` (required because `Microsoft.Web/staticSites` is not available in `eastus`)
- Resource group target: `rg-palacio-returns-demo`
