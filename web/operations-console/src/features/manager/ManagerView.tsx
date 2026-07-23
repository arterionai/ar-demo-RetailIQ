import { useState } from "react";
import { cn } from "../../lib/cn";
import { DecisionRoom } from "./components/DecisionRoom";
import { ExperienceCommandCenter } from "./components/ExperienceCommandCenter";
import { StoreReadinessBoard } from "./components/StoreReadinessBoard";

type ManagerModule = "store-readiness" | "experience" | "decision-room";

const MODULES: { id: ManagerModule; label: string }[] = [
  { id: "store-readiness", label: "Store Readiness" },
  { id: "experience", label: "Experience Command Center" },
  { id: "decision-room", label: "Decision Room" },
];

export function ManagerView() {
  const [activeModule, setActiveModule] = useState<ManagerModule>("store-readiness");

  return (
    <div data-testid="manager-view" className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[var(--p-text)]">
          Gerente / Ejecutivo — Palacio Operations Console
        </h1>
        <p className="text-sm text-[var(--p-text-secondary)]">
          Vista secundaria con datos de muestra estáticos (historia.md §6.2).
        </p>
      </div>

      <nav
        data-testid="manager-module-tabs"
        className="flex w-fit gap-1 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface)] p-1"
      >
        {MODULES.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => setActiveModule(module.id)}
            data-testid={`manager-module-tab-${module.id}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeModule === module.id
                ? "bg-[var(--p-gold)] text-[#1a1608]"
                : "text-[var(--p-text-secondary)] hover:text-[var(--p-text)]",
            )}
          >
            {module.label}
          </button>
        ))}
      </nav>

      {activeModule === "store-readiness" && <StoreReadinessBoard />}
      {activeModule === "experience" && <ExperienceCommandCenter />}
      {activeModule === "decision-room" && <DecisionRoom />}
    </div>
  );
}
