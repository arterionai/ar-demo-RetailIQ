/**
 * Datos sintéticos de la clienta ficticia Sofía de la Garza (historia.md §3).
 * Ninguna PII real: nombre, correo y pedido son inventados para esta demo.
 */

export interface StoreAvailability {
  store: string;
  available: boolean;
  /** Solo informativo, para que el concierge pueda ayudarla a decidir entre tiendas disponibles. */
  note: string;
}

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
  /**
   * Disponibilidad de `requestedSize` por tienda — SIMULADA (no existe endpoint real de
   * inventario). Única fuente de verdad de "en qué tiendas está disponible": el system prompt
   * del concierge (ver server/concierge-prompt.js) la recibe tal cual y tiene prohibido inventar
   * disponibilidad en tiendas fuera de esta lista.
   */
  availableStores: StoreAvailability[];
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
  availableStores: [
    { store: 'Palacio Polanco', available: true, note: '2 piezas en piso, a 15 min del centro' },
    { store: 'Palacio Santa Fe', available: true, note: '1 pieza en piso' },
    { store: 'Palacio Perisur', available: false, note: 'agotada en esta talla' },
    { store: 'Palacio Interlomas', available: false, note: 'agotada en esta talla' },
  ],
};

/** Nombres de tienda con la talla solicitada realmente disponible — única lista válida para elegir. */
export function availableStoreNames(order: Pick<OrderFixture, 'availableStores'>): string[] {
  return order.availableStores.filter((s) => s.available).map((s) => s.store);
}

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
