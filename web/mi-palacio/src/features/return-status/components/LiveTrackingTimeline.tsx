import { useEffect, useRef, useState } from 'react';
import type { ReturnRequestResponseDto } from '../../../lib/api-types';
import type { LiveConnectionStatus } from '../hooks/useLiveReturnTracking';

type StepState = 'done' | 'active' | 'pending';

interface Step {
  id: string;
  label: string;
  state: StepState;
  timestamp: Date | null;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

/** Deriva los 5 pasos del recorrido a partir del estatus real más reciente (POST inicial + SignalR). */
function computeSteps(
  request: ReturnRequestResponseDto,
  hasQrCode: boolean,
  seenAt: Record<string, Date>,
): Step[] {
  const inspection = request.storeInspectionStatus;
  const refund = request.refundStatus;

  const received = inspection !== 'NotReceived';
  const inspectionResolved = inspection === 'Approved' || inspection === 'Rejected';
  const refundResolved = refund === 'Approved' || refund === 'Denied' || refund === 'Processed';

  return [
    { id: 'created', label: 'Solicitud creada', state: 'done', timestamp: seenAt.created ?? null },
    {
      id: 'qr',
      label: 'QR generado',
      state: hasQrCode ? 'done' : 'pending',
      timestamp: seenAt.qr ?? null,
    },
    {
      id: 'received',
      label: received ? 'Artículo recibido en tienda' : 'Esperando que llegues a tienda…',
      state: received ? 'done' : 'active',
      timestamp: seenAt.received ?? null,
    },
    {
      id: 'inspection',
      label: inspectionResolved
        ? inspection === 'Approved'
          ? 'Inspección aprobada'
          : 'Inspección rechazada'
        : 'Inspección en tienda',
      state: inspectionResolved ? 'done' : received ? 'active' : 'pending',
      timestamp: seenAt.inspection ?? null,
    },
    {
      id: 'refund',
      label: refundResolved
        ? refund === 'Denied'
          ? 'Solicitud no procede'
          : '¡Tu cambio fue confirmado!'
        : 'Cambio o reembolso',
      state: refundResolved ? 'done' : inspectionResolved ? 'active' : 'pending',
      timestamp: seenAt.refund ?? null,
    },
  ];
}

export function LiveTrackingTimeline({
  request,
  hasQrCode,
  connectionStatus,
}: {
  request: ReturnRequestResponseDto;
  hasQrCode: boolean;
  connectionStatus: LiveConnectionStatus;
}) {
  // Primera vez que se observó cada paso como cumplido — solo para mostrar una hora, no viene del
  // backend (el DTO no trae timestamps por transición). Se conserva entre renders con useRef.
  const seenAtRef = useRef<Record<string, Date>>({ created: new Date() });
  const [, forceRender] = useState(0);

  useEffect(() => {
    const seen = seenAtRef.current;
    let changed = false;
    if (hasQrCode && !seen.qr) {
      seen.qr = new Date();
      changed = true;
    }
    if (request.storeInspectionStatus !== 'NotReceived' && !seen.received) {
      seen.received = new Date();
      changed = true;
    }
    if (
      (request.storeInspectionStatus === 'Approved' || request.storeInspectionStatus === 'Rejected') &&
      !seen.inspection
    ) {
      seen.inspection = new Date();
      changed = true;
    }
    if (
      (request.refundStatus === 'Approved' ||
        request.refundStatus === 'Denied' ||
        request.refundStatus === 'Processed') &&
      !seen.refund
    ) {
      seen.refund = new Date();
      changed = true;
    }
    if (changed) forceRender((n) => n + 1);
  }, [hasQrCode, request.storeInspectionStatus, request.refundStatus]);

  const steps = computeSteps(request, hasQrCode, seenAtRef.current);

  return (
    <div
      className="rounded-sm border border-palacio-gold/20 bg-white p-8"
      data-testid="live-tracking-timeline"
    >
      <div className="flex items-center justify-between">
        <p className="font-serif text-xl italic text-palacio-ink">Seguimiento en vivo</p>
        <span
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-palacio-muted"
          data-testid="live-tracking-connection-status"
        >
          <span
            className={
              'h-2 w-2 rounded-full ' +
              (connectionStatus === 'connected'
                ? 'animate-pulse bg-emerald-500'
                : connectionStatus === 'connecting'
                  ? 'bg-palacio-gold'
                  : 'bg-palacio-muted')
            }
          />
          {connectionStatus === 'connected'
            ? 'En vivo'
            : connectionStatus === 'connecting'
              ? 'Conectando…'
              : 'Sin conexión'}
        </span>
      </div>

      <ol className="mt-6 space-y-0" data-testid="live-tracking-steps">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-4" data-testid={`live-tracking-step-${step.id}`}>
            <div className="flex flex-col items-center">
              <span
                className={
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ' +
                  (step.state === 'done'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : step.state === 'active'
                      ? 'animate-pulse border-palacio-gold bg-palacio-gold text-white'
                      : 'border-palacio-gold/30 bg-white text-palacio-muted')
                }
              >
                {step.state === 'done' ? '✓' : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={
                    'my-1 h-8 w-px ' +
                    (step.state === 'done' ? 'bg-emerald-500' : 'bg-palacio-gold/20')
                  }
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={
                  'text-sm font-medium ' +
                  (step.state === 'pending' ? 'text-palacio-muted' : 'text-palacio-ink')
                }
              >
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-palacio-muted">{formatTime(step.timestamp)}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
