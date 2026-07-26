import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import type { ReturnRequestResponseDto } from '../../../lib/api-types';

const HUB_URL =
  (import.meta.env.VITE_RETURNS_API_BASE_URL ?? 'http://localhost:5163') + '/hubs/return-status';

export type LiveConnectionStatus = 'connecting' | 'connected' | 'disconnected';

/**
 * Se suscribe al canal en vivo de Palacio.Returns.Api (SignalR, ver
 * src/Palacio.Returns.Api/Hubs/ReturnStatusHub.cs) para el ID de devolución dado. Cada vez que
 * cualquier cliente real (ej. el asociado en Operations Console) marca el artículo como recibido
 * o resuelve la inspección, este hook recibe el DTO actualizado sin que la clienta recargue nada.
 *
 * No requiere GET /api/returns/{id} — el estado inicial ya lo conoce Mi Palacio (viene del
 * POST /api/returns original de esta sesión); este hook solo agrega actualizaciones en vivo
 * encima de ese estado conocido.
 */
export function useLiveReturnTracking(returnId: string | null) {
  const [latest, setLatest] = useState<ReturnRequestResponseDto | null>(null);
  const [status, setStatus] = useState<LiveConnectionStatus>('connecting');
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!returnId) {
      setStatus('disconnected');
      return;
    }

    setLatest(null);
    setStatus('connecting');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();
    connectionRef.current = connection;

    connection.on('ReturnStatusChanged', (updated: ReturnRequestResponseDto) => {
      if (updated.id === returnId) {
        setLatest(updated);
      }
    });

    connection.onreconnecting(() => setStatus('connecting'));
    connection.onreconnected(() => {
      setStatus('connected');
      void connection.invoke('SubscribeToReturn', returnId);
    });
    connection.onclose(() => setStatus('disconnected'));

    connection
      .start()
      .then(() => {
        setStatus('connected');
        return connection.invoke('SubscribeToReturn', returnId);
      })
      .catch(() => setStatus('disconnected'));

    return () => {
      void connection.stop();
      connectionRef.current = null;
    };
  }, [returnId]);

  return { latestUpdate: latest, connectionStatus: status };
}
