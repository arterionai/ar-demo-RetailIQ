import { useAppState } from '../../../lib/app-state';
import { formatDateTimeEsMx } from '../../../lib/format-date';
import { sofiaOrder } from '../../../lib/order-fixture';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  Eligible: 'Elegible',
  NotEligible: 'No elegible',
  NotReceived: 'No recibido en tienda',
  Received: 'Recibido en tienda',
  Approved: 'Aprobado',
  Rejected: 'Rechazado',
  NotRequired: 'No requerida',
  Cleared: 'Autorizada',
  Blocked: 'Bloqueada',
  NotStarted: 'No iniciado',
  Processed: 'Procesado',
};

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-palacio-gold/40 bg-palacio-cream-dark px-3 py-1 text-xs font-medium text-palacio-ink">
      {STATUS_LABELS[label] ?? label}
    </span>
  );
}

export function ReturnStatusPage() {
  const { caseState, goTo } = useAppState();
  const { returnRequest, qrCode, reservation, selectedStore } = caseState;

  if (!returnRequest) {
    return (
      <div className="palacio-fade-up rounded-sm border border-palacio-gold/20 bg-white/60 p-10 text-center" data-testid="return-status-empty">
        <p className="font-serif text-xl text-palacio-ink">Aún no tienes una devolución en curso</p>
        <p className="mt-2 text-sm text-palacio-muted">
          Inicia una conversación con el Concierge Postcompra desde el detalle de tu pedido.
        </p>
        <button
          type="button"
          onClick={() => goTo('purchase-detail')}
          data-testid="back-to-purchase-detail-button"
          className="mt-6 rounded-sm bg-palacio-black px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-palacio-cream transition hover:bg-palacio-charcoal"
        >
          Ir a mi pedido
        </button>
      </div>
    );
  }

  return (
    <div className="palacio-fade-up space-y-6" data-testid="return-status-page">
      <nav className="text-xs uppercase tracking-[0.2em] text-palacio-muted">
        Mis pedidos &nbsp;/&nbsp; {sofiaOrder.orderId} &nbsp;/&nbsp; Estatus de devolución
      </nav>

      <div className="rounded-sm border border-palacio-gold/20 bg-white/60 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-palacio-gold-dark">
              Solicitud {returnRequest.id.slice(0, 8)}
            </p>
            <h1 className="mt-1 font-serif text-2xl text-palacio-ink">
              {sofiaOrder.productName}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2" data-testid="status-pills">
            <StatusPill label={returnRequest.eligibilityStatus} />
            <StatusPill label={returnRequest.storeInspectionStatus} />
            <StatusPill label={returnRequest.fraudReviewStatus} />
            <StatusPill label={returnRequest.refundStatus} />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-palacio-gold/10 pt-6 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-palacio-muted">Tienda seleccionada</dt>
            <dd className="font-medium text-palacio-ink">{selectedStore ?? 'Por definir'}</dd>
          </div>
          <div>
            <dt className="text-palacio-muted">Talla reservada</dt>
            <dd className="font-medium text-palacio-ink">{reservation?.size ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-palacio-muted">Reserva vigente hasta</dt>
            <dd className="font-medium text-palacio-ink">
              {reservation ? formatDateTimeEsMx(reservation.reservedUntil) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-palacio-muted">QR vigente hasta</dt>
            <dd className="font-medium text-palacio-ink">
              {qrCode ? formatDateTimeEsMx(qrCode.expiresAtUtc) : 'Aún no generado'}
            </dd>
          </div>
        </dl>
      </div>

      {/*
        TODO(demo-live-build): se conecta a GET /api/returns/{id} durante la presentación en vivo.
        Hoy Palacio.Returns.Api no expone ningún endpoint GET (es intencional — ver
        docs/constitution.md y la propuesta de demo en historia.md §7.2, "momento killer en
        VS Code"). Esta sección solo refleja el último estado conocido en el navegador, devuelto
        por el POST /api/returns original de esta sesión. NO se debe llamar a un GET inexistente.
      */}
      <div
        className="rounded-sm border border-dashed border-palacio-gold/40 bg-palacio-cream-dark/40 p-8 text-center"
        data-testid="live-tracking-coming-soon"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-palacio-gold-dark">Próximamente</p>
        <p className="mt-2 font-serif text-xl text-palacio-ink">Seguimiento en tiempo real</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-palacio-muted">
          Muy pronto podrás consultar el estatus más reciente de tu devolución directamente desde
          la tienda — recepción, inspección y reembolso — sin salir de Mi Palacio.
        </p>
      </div>
    </div>
  );
}
