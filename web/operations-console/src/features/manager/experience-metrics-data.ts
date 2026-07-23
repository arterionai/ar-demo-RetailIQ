export interface ExperienceMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendTone: "positive" | "negative" | "neutral";
}

/**
 * Datos SIMULADOS para la demo — no son telemetría real (ver historia.md §6.2, Módulo 3:
 * Experience Command Center). Sirven para ilustrar el tipo de indicadores que la consola
 * mostraría una vez conectada a fuentes reales.
 */
export const EXPERIENCE_METRICS: ExperienceMetric[] = [
  {
    id: "initiated",
    label: "Devoluciones iniciadas",
    value: "1,248",
    trend: "+8% semana anterior",
    trendTone: "positive",
  },
  {
    id: "exchanges",
    label: "Cambios exitosos",
    value: "742",
    trend: "59% del total",
    trendTone: "positive",
  },
  {
    id: "avg-time",
    label: "Tiempo promedio en tienda",
    value: "13 min",
    trend: "Meta: 12 min",
    trendTone: "neutral",
  },
  {
    id: "abandonment",
    label: "Abandono antes de visitar tienda",
    value: "11%",
    trend: "-3 pts vs. mes anterior",
    trendTone: "positive",
  },
  {
    id: "fraud-flagged",
    label: "Casos con revisión de fraude",
    value: "34",
    trend: "MXN >$25,000",
    trendTone: "neutral",
  },
  {
    id: "csat",
    label: "Satisfacción (NPS post-devolución)",
    value: "62",
    trend: "+5 pts vs. mes anterior",
    trendTone: "positive",
  },
];
