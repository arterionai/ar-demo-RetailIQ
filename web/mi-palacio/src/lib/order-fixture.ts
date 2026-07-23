/**
 * Datos sintéticos de la clienta ficticia Sofía de la Garza (historia.md §3).
 * Ninguna PII real: nombre, correo y pedido son inventados para esta demo.
 */

export interface OrderFixture {
  orderId: string;
  customerId: string;
  customerFirstName: string;
  productName: string;
  productCategory: string;
  colorway: string;
  purchasedSize: string;
  requestedSize: string;
  price: number;
  purchaseDate: string;
  sku: string;
  deliveryStatus: string;
}

export const sofiaOrder: OrderFixture = {
  orderId: 'PH-2026-048213',
  customerId: 'CUST-SOF-10452',
  customerFirstName: 'Sofía',
  productName: 'Vestido Midnight Bordado a Mano',
  productCategory: 'Vestidos de Gala',
  colorway: 'Negro medianoche',
  purchasedSize: '4 (MX)',
  requestedSize: '6 (MX)',
  price: 32500,
  purchaseDate: '2026-07-16',
  sku: 'VMB-0446-NGR',
  deliveryStatus: 'Entregado el 19 de julio',
};

/**
 * Reserva de inventario — SIMULADA. No existe un endpoint real de inventario en
 * Palacio.Returns.Api; esta función solo produce un objeto local con fines de demo.
 * La UI la presenta como si fuera un resultado real para mantener la narrativa
 * consistente frente a la audiencia, pero no hay ninguna llamada de red aquí.
 */
export interface InventoryReservation {
  size: string;
  store: string;
  reservedUntil: string;
  confirmationCode: string;
}

export function reserveSizeLocally(size: string, store: string): InventoryReservation {
  const reservedUntil = new Date();
  reservedUntil.setDate(reservedUntil.getDate() + 1);
  reservedUntil.setHours(18, 0, 0, 0);

  return {
    size,
    store,
    reservedUntil: reservedUntil.toISOString(),
    confirmationCode: `RSV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  };
}
