# Concierge proxy — Mi Palacio

Proxy mínimo Node/Express que llama a Azure OpenAI en nombre del Concierge Postcompra de Mi
Palacio. Es la única razón por la que existe: la API key de Azure OpenAI **no puede llegar al
bundle del frontend**, así que este proceso separado la guarda y hace las llamadas de chat
completions por el frontend.

No implementa ninguna lógica de negocio de devoluciones (elegibilidad, reembolso, inventario) —
eso sigue viviendo exclusivamente en `Palacio.Returns.Domain`, vía `Palacio.Returns.Api`. Ver
`docs/constitution.md` §3.1 y §7 (ADR-014) para el contexto de arquitectura completo.

## Cómo correrlo

```bash
cd web/mi-palacio/server
npm install
npm start        # o: npm run dev (con --watch, recarga automática)
```

Queda escuchando en `http://localhost:5176` (5175, el puerto originalmente sugerido, ya estaba
ocupado por otro proyecto en este entorno de desarrollo). CORS solo permite
`http://localhost:5173` (Mi Palacio).

Prueba rápida:

```bash
curl http://localhost:5176/health
# {"status":"ok"}
```

## Variables de entorno

El proxy requiere estas 4 variables:

| Variable | Descripción |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | Endpoint del recurso, p. ej. `https://<recurso>.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT` | Nombre del deployment (`gpt-4.1-mini`) |
| `AZURE_OPENAI_API_VERSION` | Versión de API de chat completions (`2024-10-21`) |
| `AZURE_OPENAI_API_KEY` | API key del recurso — **secreta** |

Opcionales:

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `5176` | Puerto en el que escucha el proxy |
| `CONCIERGE_ALLOWED_ORIGIN` | `http://localhost:5173` | Único origen permitido por CORS |

### De dónde se toman en desarrollo local

`server/env.js` las carga en este orden de precedencia (la primera fuente que defina una
variable la fija; no se sobrescriben entre sí):

1. **Entorno del proceso** — útil para CI o para forzar un valor puntual:
   `AZURE_OPENAI_API_KEY=... node server.js`.
2. **`server/.env`** (si existe) — archivo local, **nunca versionado** (ver `.gitignore` de este
   directorio). No se necesita para el flujo normal de desarrollo.
3. **`~/.espejo-demo/azure-openai.env`** — credenciales compartidas del entorno de demo, fuera
   del repo por completo. Esta es la fuente esperada en el día a día: el archivo ya existe con
   las 4 llaves en formato `KEY=value` por línea.

Si falta alguna de las 4 variables requeridas, el proceso falla al arrancar con un mensaje que
lista cuáles faltan (nunca imprime valores).

## Contrato de la API

### `POST /api/concierge/chat`

Request:

```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "...", "tool_calls": [...] },
    { "role": "tool", "tool_call_id": "...", "name": "iniciar_cambio_de_talla", "content": "..." }
  ],
  "order": { "customerFirstName": "Sofía", "productName": "...", "...": "..." }
}
```

- `messages`: historial completo de la conversación en el protocolo de chat completions estilo
  OpenAI (sin el mensaje `system` — el proxy lo agrega). Puede venir vacío para el turno de
  apertura (el proxy instruye al modelo a saludar proactivamente).
- `order`: los hechos de la orden actual (de `src/lib/order-fixture.ts` en el frontend) — única
  fuente de verdad para que el modelo no invente datos de la compra.

Response:

```json
{ "message": { "role": "assistant", "content": "...", "tool_calls": [...] } }
```

El `message` es exactamente lo que devolvió Azure OpenAI para ese turno — puede traer `content`,
`tool_calls`, o ambos. El frontend es responsable de ejecutar la tool call real
(`iniciar_cambio_de_talla`) contra `Palacio.Returns.Api` y reenviar el resultado como un mensaje
`role: "tool"` en la siguiente llamada — el proxy no sabe nada de esos contratos.

### `GET /health`

Chequeo de vida simple, sin dependencias externas.
