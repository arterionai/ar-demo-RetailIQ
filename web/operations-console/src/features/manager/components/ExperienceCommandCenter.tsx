import { Card } from "../../../components/ui/Card";
import { EXPERIENCE_METRICS } from "../experience-metrics-data";

const TREND_COLOR: Record<string, string> = {
  positive: "text-[var(--p-green)]",
  negative: "text-[var(--p-red)]",
  neutral: "text-[var(--p-text-muted)]",
};

export function ExperienceCommandCenter() {
  return (
    <section data-testid="experience-command-center" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--p-text)]">Experience Command Center</h2>
        <p className="text-sm text-[var(--p-text-secondary)]">
          Indicadores de la experiencia de devolución omnicanal.{" "}
          <span className="italic">Datos simulados para la demo, no telemetría real.</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {EXPERIENCE_METRICS.map((metric) => (
          <Card
            key={metric.id}
            data-testid={`experience-metric-${metric.id}`}
            className="flex flex-col gap-1.5 p-4"
          >
            <span className="text-xs font-medium text-[var(--p-text-secondary)]">
              {metric.label}
            </span>
            <span className="text-2xl font-semibold text-[var(--p-text)]">{metric.value}</span>
            <span className={`text-xs ${TREND_COLOR[metric.trendTone]}`}>{metric.trend}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
