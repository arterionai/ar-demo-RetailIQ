import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REQUIRED_VARS = [
  'AZURE_OPENAI_ENDPOINT',
  'AZURE_OPENAI_DEPLOYMENT',
  'AZURE_OPENAI_API_VERSION',
  'AZURE_OPENAI_API_KEY',
];

/**
 * Parser manual de archivos `KEY=value` (formato dotenv). No usamos el paquete `dotenv` para
 * mantener el proxy con cero dependencias fuera de express/cors, pero el formato de archivo es
 * el mismo.
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    const isQuoted =
      (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (isQuoted) {
      value = value.slice(1, -1);
    }

    // No sobrescribir variables ya presentes en el entorno real (permite overrides explícitos,
    // p. ej. en CI o al correr el proxy dentro de un contenedor).
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * Carga la configuración de Azure OpenAI. Nunca hardcodea valores ni los imprime — solo lee
 * variables de entorno, con dos fuentes posibles para desarrollo local (en este orden de
 * precedencia, la primera que exista una variable la fija):
 *
 *   1. El entorno del proceso (útil en CI/contenedores: `AZURE_OPENAI_API_KEY=... node server.js`).
 *   2. `server/.env` (NUNCA versionado — ver .gitignore de este directorio).
 *   3. `~/.espejo-demo/azure-openai.env` — credenciales compartidas del entorno de demo, fuera
 *      del repo. Esta es la fuente esperada para desarrollo local normal.
 */
export function loadAzureOpenAiConfig() {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
  loadEnvFile(path.join(os.homedir(), '.espejo-demo', 'azure-openai.env'));

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas para el proxy del concierge: ${missing.join(', ')}. ` +
        'Defínelas en el entorno del proceso, en server/.env (no versionado) o revisa que ' +
        '~/.espejo-demo/azure-openai.env exista y tenga las 4 llaves esperadas.',
    );
  }

  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, ''),
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
  };
}
