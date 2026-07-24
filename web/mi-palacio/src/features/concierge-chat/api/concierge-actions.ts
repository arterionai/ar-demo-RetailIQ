import { initiateReturn, issueQrCode } from '../../../lib/returns-api-client';
import { reserveSizeLocally } from '../../../lib/order-fixture';
import type { OrderFixture } from '../../../lib/order-fixture';

/**
 * "Reservar talla en tienda" — SIMULADO localmente (no existe endpoint de inventario en
 * Palacio.Returns.Api hoy). Ver order-fixture.ts para el detalle de la simulación.
 */
export async function reserveReplacementSize(size: string, store: string) {
  await simulateLatency(500, 900);
  return reserveSizeLocally(size, store);
}

/** Llamada real: POST /api/returns */
export async function startReturnRequest(order: OrderFixture) {
  return initiateReturn({
    orderId: order.orderId,
    customerId: order.customerId,
    productCategory: order.productCategory,
    purchaseAmount: order.price,
  });
}

/** Llamada real: POST /api/returns/{id}/qr-code */
export async function generateQrCode(returnRequestId: string) {
  return issueQrCode(returnRequestId);
}

function simulateLatency(minMs: number, maxMs: number): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
