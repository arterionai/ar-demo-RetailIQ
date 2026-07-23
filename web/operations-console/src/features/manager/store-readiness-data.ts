import type { BadgeTone } from "../../components/ui/Badge";

export type ReadinessStatus = "ready" | "attention" | "blocked";

export interface StoreReadiness {
  id: string;
  name: string;
  status: ReadinessStatus;
  statusLabel: string;
  summary: string;
  detail: string;
  metrics: { label: string; value: string }[];
}

const STATUS_TONE: Record<ReadinessStatus, BadgeTone> = {
  ready: "green",
  attention: "yellow",
  blocked: "red",
};

export function toneForStatus(status: ReadinessStatus): BadgeTone {
  return STATUS_TONE[status];
}

/**
 * Datos de ejemplo tomados de historia.md §6.2 (Módulo 2: Store Readiness) y §5.5
 * (canal "Operaciones de tienda"). No son telemetría real — son el contenido narrativo
 * de la demo.
 */
export const STORE_READINESS_DATA: StoreReadiness[] = [
  {
    id: "polanco",
    name: "Palacio Polanco",
    status: "ready",
    statusLabel: "Listo — piloto activo",
    summary: "Piloto de devoluciones omnicanal activo. Categorías de moda, sin joyería.",
    detail:
      "Personal capacitado al 100%, lector QR habilitado y POS actualizado. Es la tienda " +
      "seleccionada para el piloto (historia.md §9.3): categorías de moda, sin joyería, QR con " +
      "vigencia de 72 horas.",
    metrics: [
      { label: "Capacitación", value: "100%" },
      { label: "Lector QR", value: "Habilitado" },
      { label: "Volumen semanal", value: "58 casos" },
    ],
  },
  {
    id: "perisur",
    name: "Palacio Perisur",
    status: "attention",
    statusLabel: "Atención — capacitación y POS",
    summary: "62% del personal completó la capacitación y quedan 2 terminales con POS anterior.",
    detail:
      "¿Por qué Perisur está en amarillo? Porque 62% del personal completó la capacitación y " +
      "quedan dos terminales con una versión anterior del POS (cita textual de historia.md §6.2).",
    metrics: [
      { label: "Capacitación", value: "62%" },
      { label: "Terminales POS desactualizadas", value: "2" },
      { label: "Volumen semanal", value: "31 casos" },
    ],
  },
  {
    id: "santa-fe",
    name: "Palacio Santa Fe",
    status: "attention",
    statusLabel: "Atención — sin lector QR",
    summary: "Lector QR nuevo aún no habilitado. Esta semana se usa folio manual.",
    detail:
      "Santa Fe todavía no tiene habilitado el nuevo lector. Para esta semana debe utilizarse " +
      "el folio manual. El despliegue está programado para el jueves (cita textual de " +
      "historia.md §5.5, respuesta del Agente Palacio a un gerente de tienda).",
    metrics: [
      { label: "Lector QR", value: "No habilitado" },
      { label: "Despliegue programado", value: "Jueves" },
      { label: "Volumen semanal", value: "19 casos" },
    ],
  },
  {
    id: "interlomas",
    name: "Palacio Interlomas",
    status: "ready",
    statusLabel: "Listo — pendiente de rollout",
    summary: "Capacitación y hardware completos. En espera de aprobación de rollout ampliado.",
    detail:
      "Cumple los mismos requisitos que Polanco (capacitación, POS y lector QR) pero aún no " +
      "forma parte del piloto activo. Es candidata directa si se aprueba extender el piloto " +
      "(ver Decision Room).",
    metrics: [
      { label: "Capacitación", value: "97%" },
      { label: "Lector QR", value: "Habilitado" },
      { label: "Volumen semanal", value: "0 casos (sin activar)" },
    ],
  },
];
