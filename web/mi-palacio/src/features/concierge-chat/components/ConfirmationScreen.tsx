import { formatDateTimeEsMx } from '../../../lib/format-date';
import type { InventoryReservation } from '../../../lib/order-fixture';
import type { QrCodeResponseDto } from '../../../lib/api-types';
import { QrCodeCard } from './QrCodeCard';

interface ConfirmationScreenProps {
  reservation: InventoryReservation;
  qrCode: QrCodeResponseDto;
  onViewStatus: () => void;
}

/**
 * "Momento de lujo digital" — historia.md §3.2. La certeza concreta (talla, tienda, tiempo
 * estimado, qué llevar) importa más que el mecanismo técnico detrás.
 */
export function ConfirmationScreen({ reservation, qrCode, onViewStatus }: ConfirmationScreenProps) {
  return (
    <div
      className="palacio-fade-up flex flex-col gap-6 rounded-sm border border-palacio-gold/30 bg-palacio-black p-6 text-palacio-cream"
      data-testid="confirmation-screen"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-palacio-gold">
          Talla {reservation.size} reservada hasta mañana, 6:00 p. m.
        </p>
        <h2 className="mt-2 font-serif text-2xl italic" data-testid="confirmation-store">
          {reservation.store}
        </h2>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-palacio-cream/60">Tiempo estimado del proceso</dt>
          <dd className="font-medium">12 minutos</dd>
        </div>
        <div>
          <dt className="text-palacio-cream/60">Código de reserva</dt>
          <dd className="font-medium">{reservation.confirmationCode}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-palacio-cream/60">Reserva vigente hasta</dt>
          <dd className="font-medium">{formatDateTimeEsMx(reservation.reservedUntil)}</dd>
        </div>
      </dl>

      <p className="rounded-sm bg-white/5 p-4 text-sm text-palacio-cream/90">
        Lleva la prenda, las etiquetas y este QR. Un asesor revisará físicamente el vestido antes
        de confirmar tu cambio.
      </p>

      <div className="flex justify-center">
        <QrCodeCard token={qrCode.token} expiresAtUtc={qrCode.expiresAtUtc} />
      </div>

      <button
        type="button"
        onClick={onViewStatus}
        data-testid="view-return-status-button"
        className="rounded-sm border border-palacio-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-palacio-gold transition hover:bg-palacio-gold hover:text-palacio-black"
      >
        Ver estatus de mi devolución
      </button>
    </div>
  );
}
