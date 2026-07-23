import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { toneForStatus, type StoreReadiness } from "../store-readiness-data";

export function StoreReadinessCard({ store }: { store: StoreReadiness }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card data-testid={`store-readiness-card-${store.id}`} className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--p-text)]">{store.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--p-text-secondary)]">{store.summary}</p>
        </div>
        <Badge tone={toneForStatus(store.status)} testId={`store-readiness-card-${store.id}-badge`}>
          {store.statusLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {store.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-md border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-2"
          >
            <p className="text-[10px] uppercase tracking-wide text-[var(--p-text-muted)]">
              {metric.label}
            </p>
            <p className="text-xs font-semibold text-[var(--p-text)]">{metric.value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        data-testid={`store-readiness-card-${store.id}-toggle`}
        className="self-start text-xs font-medium text-[var(--p-gold)] hover:underline"
      >
        {expanded ? "Ocultar detalle" : `¿Por qué ${store.name.split(" ").pop()} está así?`}
      </button>

      {expanded && (
        <p
          data-testid={`store-readiness-card-${store.id}-detail`}
          className="rounded-md bg-[var(--p-overlay)]/60 p-3 text-xs leading-relaxed text-[var(--p-text-secondary)]"
        >
          {store.detail}
        </p>
      )}
    </Card>
  );
}
