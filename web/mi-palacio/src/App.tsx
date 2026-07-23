import { AppShell } from './components/AppShell';
import { AppStateProvider, useAppState } from './lib/app-state';
import { PurchaseDetailPage } from './features/purchase-detail/components/PurchaseDetailPage';
import { ReturnStatusPage } from './features/return-status/components/ReturnStatusPage';

function TopNav() {
  const { view, goTo } = useAppState();

  return (
    <div className="mb-6 flex gap-2" data-testid="top-nav">
      <button
        type="button"
        onClick={() => goTo('purchase-detail')}
        data-testid="nav-purchase-detail"
        className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
          view === 'purchase-detail'
            ? 'bg-palacio-black text-palacio-cream'
            : 'border border-palacio-gold/30 text-palacio-ink hover:bg-palacio-cream-dark'
        }`}
      >
        Mi pedido
      </button>
      <button
        type="button"
        onClick={() => goTo('return-status')}
        data-testid="nav-return-status"
        className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition ${
          view === 'return-status'
            ? 'bg-palacio-black text-palacio-cream'
            : 'border border-palacio-gold/30 text-palacio-ink hover:bg-palacio-cream-dark'
        }`}
      >
        Estatus de mi devolución
      </button>
    </div>
  );
}

function AppContent() {
  const { view } = useAppState();

  return (
    <AppShell>
      <TopNav />
      {view === 'purchase-detail' ? <PurchaseDetailPage /> : <ReturnStatusPage />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
