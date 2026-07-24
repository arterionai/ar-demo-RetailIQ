import { useState } from 'react';
import { formatCurrencyMXN } from '../../../lib/format-currency';
import { sofiaOrder } from '../../../lib/order-fixture';
import { useAppState } from '../../../lib/app-state';
import { ConciergeChatPanel } from '../../concierge-chat/components/ConciergeChatPanel';
import vestidoX1 from '../../../assets/vestido-sofia/vestido-x1.jpg';
import vestidoX2 from '../../../assets/vestido-sofia/vestido-x2.jpg';
import vestidoX3 from '../../../assets/vestido-sofia/vestido-x3.jpg';

const VESTIDO_GALLERY = [
  { src: vestidoX1, label: 'Vista frontal' },
  { src: vestidoX2, label: 'Vista posterior' },
  { src: vestidoX3, label: 'Detalle de tejido' },
];

export function PurchaseDetailPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const { caseState } = useAppState();
  const hasActiveCase = caseState.returnRequest !== null;

  return (
    <div className="palacio-fade-up" data-testid="purchase-detail-page">
      <nav className="mb-6 text-xs uppercase tracking-[0.2em] text-palacio-muted" data-testid="breadcrumbs">
        Mis pedidos &nbsp;/&nbsp; {sofiaOrder.orderId}
      </nav>

      <div className="grid grid-cols-1 gap-10 rounded-sm border border-palacio-gold/20 bg-white shadow-sm md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="flex flex-col gap-3 bg-palacio-cream p-6">
          <div className="flex items-center justify-center overflow-hidden rounded-sm">
            <img
              src={VESTIDO_GALLERY[activePhoto].src}
              alt={`${sofiaOrder.productName} — ${VESTIDO_GALLERY[activePhoto].label}`}
              className="h-72 w-full object-cover object-top"
              data-testid="product-photo"
            />
          </div>
          <div className="flex justify-center gap-2" data-testid="product-photo-thumbnails">
            {VESTIDO_GALLERY.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActivePhoto(index)}
                aria-label={photo.label}
                aria-pressed={activePhoto === index}
                data-testid={`product-photo-thumbnail-${index}`}
                className={`h-14 w-11 overflow-hidden rounded-sm border transition ${
                  activePhoto === index
                    ? 'border-palacio-gold shadow-gold'
                    : 'border-palacio-black/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.src} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-palacio-gold-dark">
              {sofiaOrder.productCategory}
            </p>
            <h1
              className="mt-1 font-serif text-3xl italic text-palacio-ink"
              data-testid="product-name"
            >
              {sofiaOrder.productName}
            </h1>
            <p className="mt-1 text-sm text-palacio-muted">
              {sofiaOrder.colorway} · SKU {sofiaOrder.sku}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-palacio-muted">Precio</dt>
              <dd className="font-medium text-palacio-ink" data-testid="product-price">
                {formatCurrencyMXN(sofiaOrder.price)}
              </dd>
            </div>
            <div>
              <dt className="text-palacio-muted">Talla comprada</dt>
              <dd className="font-medium text-palacio-ink" data-testid="purchased-size">
                {sofiaOrder.purchasedSize}
              </dd>
            </div>
            <div>
              <dt className="text-palacio-muted">Pedido</dt>
              <dd className="font-medium text-palacio-ink">{sofiaOrder.orderId}</dd>
            </div>
            <div>
              <dt className="text-palacio-muted">Estatus de entrega</dt>
              <dd className="font-medium text-palacio-ink" data-testid="delivery-status">
                {sofiaOrder.deliveryStatus}
              </dd>
            </div>
          </dl>

          <div className="rounded-sm border border-palacio-gold/20 bg-palacio-cream-dark/50 p-4">
            <p className="text-sm text-palacio-ink">
              La talla no te quedó como esperabas y tienes un evento próximo. Nuestro Concierge
              Postcompra puede ayudarte a resolverlo con certeza, de principio a fin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              data-testid="open-concierge-button"
              className="rounded-sm bg-palacio-black px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-palacio-cream shadow-gold transition hover:bg-palacio-charcoal"
            >
              ¿Necesitas ayuda con esta compra?
            </button>
            {hasActiveCase && (
              <span
                className="text-xs uppercase tracking-[0.15em] text-palacio-gold-dark"
                data-testid="active-case-indicator"
              >
                Tienes una solicitud en curso
              </span>
            )}
          </div>
        </div>
      </div>

      {chatOpen && <ConciergeChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
