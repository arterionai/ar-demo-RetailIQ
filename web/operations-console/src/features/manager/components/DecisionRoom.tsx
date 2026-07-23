import { useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

type DecisionAction = "approve" | "extend" | "controls" | "remediation";

const ACTION_LABELS: Record<DecisionAction, string> = {
  approve: "Rollout aprobado a todas las tiendas",
  extend: "Piloto extendido (sin cambios de alcance)",
  controls: "Se solicitaron controles adicionales antes de decidir",
  remediation: "Se creó un plan de remediación",
};

/**
 * Contenido estático de historia.md §6.2 (Módulo 4: Decision Room). Las acciones son
 * cosméticas (solo estado local de React) — no hay backend de decisiones en este prototipo.
 */
export function DecisionRoom() {
  const [recordedAction, setRecordedAction] = useState<DecisionAction | null>(null);

  return (
    <section data-testid="decision-room" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--p-text)]">Decision Room</h2>
        <p className="text-sm text-[var(--p-text-secondary)]">
          Decisiones de rollout con evidencia, riesgos y recomendación reunidos en un solo lugar.
        </p>
      </div>

      <Card data-testid="decision-card-extend-pilot" className="flex flex-col gap-5 p-6">
        <div>
          <Badge tone="gold">Decisión pendiente</Badge>
          <h3 className="mt-2 text-base font-semibold text-[var(--p-text)]">
            ¿Debemos extender el piloto a todas las tiendas?
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
              Recomendación
            </h4>
            <p className="mt-1.5 text-sm text-[var(--p-text-secondary)]">
              Extender el piloto a Interlomas y Perisur una vez completada la capacitación
              faltante; mantener Santa Fe en folio manual hasta habilitar el lector QR el
              jueves.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
              Evidencia
            </h4>
            <ul className="mt-1.5 list-inside list-disc text-sm text-[var(--p-text-secondary)]">
              <li>58 casos/semana en Polanco sin incidentes desde el fix de noviembre</li>
              <li>NPS post-devolución de 62 (+5 pts vs. mes anterior)</li>
              <li>34 casos de alto valor procesados con revisión de fraude correcta</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
              Riesgos
            </h4>
            <ul className="mt-1.5 list-inside list-disc text-sm text-[var(--p-text-secondary)]">
              <li>Perisur: 62% de capacitación y 2 terminales con POS anterior</li>
              <li>Santa Fe: lector QR aún no habilitado (folio manual esta semana)</li>
              <li>Sin joyería en el alcance del piloto (restricción vigente)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/40 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--p-text-muted)]">
              Responsables y dependencias
            </h4>
            <p className="mt-1.5 text-sm text-[var(--p-text-secondary)]">
              Gabriela León (Operaciones de Tienda) y Pedro Molina (Product Owner de
              Devoluciones). Depende de completar capacitación en Perisur y del despliegue del
              lector QR en Santa Fe (programado para el jueves).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--p-border)] pt-4">
          <Button
            variant="primary"
            onClick={() => setRecordedAction("approve")}
            data-testid="decision-approve-rollout-button"
          >
            Aprobar rollout
          </Button>
          <Button
            variant="secondary"
            onClick={() => setRecordedAction("extend")}
            data-testid="decision-extend-pilot-button"
          >
            Extender piloto
          </Button>
          <Button
            variant="secondary"
            onClick={() => setRecordedAction("controls")}
            data-testid="decision-request-controls-button"
          >
            Solicitar controles adicionales
          </Button>
          <Button
            variant="ghost"
            onClick={() => setRecordedAction("remediation")}
            data-testid="decision-create-remediation-button"
          >
            Crear plan de remediación
          </Button>
        </div>

        {recordedAction && (
          <p
            data-testid="decision-recorded-note"
            className="text-xs text-[var(--p-text-muted)]"
          >
            Registrado en esta sesión: <strong>{ACTION_LABELS[recordedAction]}</strong>. Esta
            acción es solo cosmética en el prototipo (no persiste ni llama a la API).
          </p>
        )}
      </Card>
    </section>
  );
}
