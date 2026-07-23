import { useState } from "react";
import { cn } from "./lib/cn";
import { StoreAssociateView } from "./features/store-associate/StoreAssociateView";
import { ManagerView } from "./features/manager/ManagerView";

type Role = "store-associate" | "manager";

const ROLES: { id: Role; label: string; description: string }[] = [
  {
    id: "store-associate",
    label: "Asociado de Tienda",
    description: "Procesar devoluciones",
  },
  {
    id: "manager",
    label: "Gerente / Ejecutivo",
    description: "Readiness, KPIs y decisiones",
  },
];

function App() {
  const [role, setRole] = useState<Role>("store-associate");

  return (
    <div className="min-h-screen bg-[var(--p-bg)]">
      <header className="border-b border-[var(--p-border)] bg-[var(--p-surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--p-gold-soft)] text-sm font-bold text-[var(--p-gold)]"
            >
              PH
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--p-text)]">
                Palacio Operations Console
              </h1>
              <p className="text-xs text-[var(--p-text-muted)]">
                Proyecto Espejo · Inteligencia Palacio (demo interna)
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Selector de rol"
            data-testid="role-switcher"
            className="flex w-fit gap-1 rounded-lg border border-[var(--p-border)] bg-[var(--p-overlay)]/60 p-1"
          >
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={role === r.id}
                onClick={() => setRole(r.id)}
                data-testid={`role-switcher-${r.id}`}
                className={cn(
                  "flex flex-col items-start rounded-md px-3.5 py-2 text-left transition-colors",
                  role === r.id
                    ? "bg-[var(--p-gold)] text-[#1a1608]"
                    : "text-[var(--p-text-secondary)] hover:bg-[var(--p-overlay)] hover:text-[var(--p-text)]",
                )}
              >
                <span className="text-sm font-semibold">{r.label}</span>
                <span
                  className={cn(
                    "text-[11px]",
                    role === r.id ? "text-[#3d3410]" : "text-[var(--p-text-muted)]",
                  )}
                >
                  {r.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {role === "store-associate" ? <StoreAssociateView /> : <ManagerView />}
      </main>
    </div>
  );
}

export default App;
