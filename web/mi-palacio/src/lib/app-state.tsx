import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ReturnRequestResponseDto, QrCodeResponseDto } from './api-types';
import type { InventoryReservation } from './order-fixture';

export type AppView = 'purchase-detail' | 'return-status';

interface CaseState {
  returnRequest: ReturnRequestResponseDto | null;
  qrCode: QrCodeResponseDto | null;
  reservation: InventoryReservation | null;
  selectedStore: string | null;
}

interface AppStateValue {
  view: AppView;
  goTo: (view: AppView) => void;
  caseState: CaseState;
  setReturnRequest: (r: ReturnRequestResponseDto) => void;
  setQrCode: (qr: QrCodeResponseDto) => void;
  setReservation: (r: InventoryReservation, store: string) => void;
}

const AppStateContext = createContext<AppStateValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('purchase-detail');
  const [caseState, setCaseState] = useState<CaseState>({
    returnRequest: null,
    qrCode: null,
    reservation: null,
    selectedStore: null,
  });

  const value = useMemo<AppStateValue>(
    () => ({
      view,
      goTo: setView,
      caseState,
      setReturnRequest: (r) => setCaseState((prev) => ({ ...prev, returnRequest: r })),
      setQrCode: (qr) => setCaseState((prev) => ({ ...prev, qrCode: qr })),
      setReservation: (r, store) =>
        setCaseState((prev) => ({ ...prev, reservation: r, selectedStore: store })),
    }),
    [view, caseState],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState debe usarse dentro de <AppStateProvider>');
  }
  return ctx;
}
