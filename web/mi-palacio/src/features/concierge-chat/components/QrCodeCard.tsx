import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatDateTimeEsMx } from '../../../lib/format-date';

interface QrCodeCardProps {
  token: string;
  expiresAtUtc: string;
}

export function QrCodeCard({ token, expiresAtUtc }: QrCodeCardProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi-palacio-qr-devolucion.png';
    link.click();
  };

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-sm border border-palacio-gold/30 bg-white p-6"
      data-testid="qr-code-card"
    >
      <div ref={canvasWrapperRef} className="rounded-sm bg-white p-3 shadow-gold">
        <QRCodeCanvas value={token} size={168} fgColor="#181818" bgColor="#FFFFFF" level="M" />
      </div>
      <p className="text-center text-xs text-palacio-muted">
        Válido hasta {formatDateTimeEsMx(expiresAtUtc)}
      </p>
      <button
        type="button"
        onClick={handleDownload}
        data-testid="download-qr-button"
        className="rounded-sm border border-palacio-gold/50 px-4 py-2 text-xs uppercase tracking-[0.15em] text-palacio-gold-dark transition hover:bg-palacio-cream-dark"
      >
        Descargar QR
      </button>
    </div>
  );
}
