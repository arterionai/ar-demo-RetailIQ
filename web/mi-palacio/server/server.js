import cors from 'cors';
import express from 'express';
import { loadAzureOpenAiConfig } from './env.js';
import { buildSystemPrompt, TOOLS } from './concierge-prompt.js';

// Proxy mínimo: la única razón de que exista es que la API key de Azure OpenAI no puede llegar
// al bundle del frontend. No implementa lógica de negocio de devoluciones (eso vive en
// Palacio.Returns.Domain vía Palacio.Returns.Api) — solo reenvía la conversación a Azure OpenAI
// con el system prompt y la tool de "iniciar_cambio_de_talla" (ADR-014: el LLM nunca decide ni
// ejecuta el cambio directamente, solo puede señalar la intención confirmada de la clienta).

const config = loadAzureOpenAiConfig();

// Nota: 5175 (sugerido inicialmente) ya está ocupado en este entorno por un proyecto no
// relacionado (ar-JaimesOS); se usa 5176 para el proxy del concierge de Mi Palacio.
const PORT = Number(process.env.PORT ?? 5176);
// Mi Palacio (Vite) corre fijo en 5173 — ver web/mi-palacio/vite.config.ts.
const ALLOWED_ORIGIN = process.env.CONCIERGE_ALLOWED_ORIGIN ?? 'http://localhost:5173';

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/concierge/chat', async (req, res) => {
  const { messages, order } = req.body ?? {};

  if (!Array.isArray(messages)) {
    res.status(400).json({ error: '"messages" debe ser un arreglo.' });
    return;
  }
  if (!order || typeof order !== 'object') {
    res.status(400).json({ error: '"order" es requerido (hechos de la orden actual).' });
    return;
  }

  const isOpeningTurn = messages.length === 0;
  const systemMessage = { role: 'system', content: buildSystemPrompt(order, { isOpeningTurn }) };

  try {
    const assistantMessage = await callAzureChatCompletion([systemMessage, ...messages]);
    res.json({ message: assistantMessage });
  } catch (error) {
    console.error('[concierge-proxy] Error llamando a Azure OpenAI:', error.message);
    res.status(502).json({
      error: 'No se pudo obtener respuesta del concierge. Intenta de nuevo en unos segundos.',
    });
  }
});

async function callAzureChatCompletion(messages) {
  const url =
    `${config.endpoint}/openai/deployments/${config.deployment}/chat/completions` +
    `?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Azure OpenAI respondió ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice?.message) {
    throw new Error('Azure OpenAI no devolvió ningún choice utilizable.');
  }

  return choice.message;
}

app.listen(PORT, () => {
  console.log(`[concierge-proxy] escuchando en http://localhost:${PORT} (CORS: ${ALLOWED_ORIGIN})`);
  console.log(`[concierge-proxy] deployment=${config.deployment} apiVersion=${config.apiVersion}`);
});
