import type { CreateReturnRequestDto, QrCodeResponseDto, ReturnRequestResponseDto } from './api-types';

// El backend Palacio.Returns.Api corre en http://localhost:5163 (perfil "http" de
// `dotnet run --project src/Palacio.Returns.Api`). CORS ya está habilitado ahí para
// http://localhost:5173, que es el puerto fijo en el que corre este proyecto Vite.
const API_BASE_URL = import.meta.env.VITE_RETURNS_API_BASE_URL ?? 'http://localhost:5163';

export class ReturnsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ReturnsApiError';
  }
}

async function postJson<TResponse>(path: string, body?: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ReturnsApiError(
      'No se pudo contactar a Returns Orchestrator. Verifica que la API esté corriendo en ' +
        `${API_BASE_URL} (dotnet run --project src/Palacio.Returns.Api).`,
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ReturnsApiError(
      `Returns Orchestrator respondió ${response.status} en ${path}${detail ? `: ${detail}` : ''}`,
      response.status,
    );
  }

  return (await response.json()) as TResponse;
}

/**
 * Llamada real: POST /api/returns — inicia la solicitud de devolución/cambio.
 * Nunca decide elegibilidad ni reembolso en el cliente: eso vive en Palacio.Returns.Domain.
 */
export function initiateReturn(dto: CreateReturnRequestDto): Promise<ReturnRequestResponseDto> {
  return postJson<ReturnRequestResponseDto>('/api/returns', dto);
}

/**
 * Llamada real: POST /api/returns/{id}/qr-code — genera el QR de devolución (72h de vigencia).
 */
export function issueQrCode(returnRequestId: string): Promise<QrCodeResponseDto> {
  return postJson<QrCodeResponseDto>(`/api/returns/${returnRequestId}/qr-code`);
}
