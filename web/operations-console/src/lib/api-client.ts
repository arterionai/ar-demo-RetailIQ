import type {
  CreateReturnRequestDto,
  InspectionDecisionDto,
  ReturnRequestResponseDto,
} from "./types";

/**
 * Cliente HTTP fino sobre Palacio.Returns.Api (ver docs/constitution.md §3.1).
 * La API real corre en http://localhost:5163 (perfil `http` de `dotnet run`, ver launchSettings.json).
 */
const API_BASE_URL = "http://localhost:5163";

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

/**
 * GET /api/returns/{id} — busca un caso existente por folio/ID (usado por "Buscar por folio").
 * Devuelve null en 404 (folio no encontrado) en vez de lanzar, para que la UI muestre un mensaje
 * de "no encontrado" en vez de un error genérico.
 */
export async function searchReturnByFolio(
  id: string,
): Promise<ReturnRequestResponseDto | null> {
  const response = await fetch(`${API_BASE_URL}/api/returns/${id}`);
  if (response.status === 404) {
    return null;
  }
  return handleResponse<ReturnRequestResponseDto>(response);
}
