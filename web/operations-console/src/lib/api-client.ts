import type {
  CreateReturnRequestDto,
  InspectionDecisionDto,
  ReturnRequestResponseDto,
} from "./types";

/**
 * Cliente HTTP fino sobre Palacio.Returns.Api (ver docs/constitution.md §3.1).
 * La API real corre en http://localhost:5163 localmente o en la URL configurada para despliegue.
 * Solo existen 3 endpoints POST hoy — no existe ningún GET (ver README del proyecto).
 */
const API_BASE_URL = import.meta.env.VITE_RETURNS_API_BASE_URL ?? "http://localhost:5163";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(
      `La API respondió ${response.status} ${response.statusText}${detail ? `: ${detail}` : ""}`,
      response.status,
    );
  }
  return (await response.json()) as T;
}

/** POST /api/returns — crea una nueva solicitud de devolución. */
export async function createReturnRequest(
  dto: CreateReturnRequestDto,
): Promise<ReturnRequestResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handleResponse<ReturnRequestResponseDto>(response);
}

/** POST /api/returns/{id}/receive — marca el artículo como recibido en tienda. */
export async function receiveReturnItem(
  id: string,
): Promise<ReturnRequestResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/returns/${id}/receive`, {
    method: "POST",
  });
  return handleResponse<ReturnRequestResponseDto>(response);
}

/** POST /api/returns/{id}/inspection — aprueba o rechaza la inspección física. */
export async function submitInspectionDecision(
  id: string,
  dto: InspectionDecisionDto,
): Promise<ReturnRequestResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/returns/${id}/inspection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handleResponse<ReturnRequestResponseDto>(response);
}

// TODO(demo-live-build): se conecta a GET /api/returns/{id} durante la presentación en vivo.
// Hoy el backend NO expone ningún endpoint GET (es intencional, ver README del proyecto) —
// por eso "Buscar por folio" en la UI queda deshabilitado con un tooltip en vez de intentar
// una llamada real que fallaría o no existiría.
