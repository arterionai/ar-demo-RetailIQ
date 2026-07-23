import { STORE_READINESS_DATA } from "../store-readiness-data";
import { StoreReadinessCard } from "./StoreReadinessCard";

export function StoreReadinessBoard() {
  return (
    <section data-testid="store-readiness-board" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--p-text)]">Store Readiness</h2>
        <p className="text-sm text-[var(--p-text-secondary)]">
          Preparación operativa por tienda para el piloto de devoluciones omnicanal. Datos de
          muestra (historia.md §6.2 y §5.5), no telemetría real.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {STORE_READINESS_DATA.map((store) => (
          <StoreReadinessCard key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
}
