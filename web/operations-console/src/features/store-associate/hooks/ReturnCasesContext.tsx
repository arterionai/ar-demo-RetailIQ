import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  createReturnRequest,
  receiveReturnItem,
  submitInspectionDecision,
} from "../../../lib/api-client";
import type { ReturnRequestResponseDto } from "../../../lib/types";

/**
 * Datos de muestra para el botón "Cargar casos de ejemplo".
 * Cada uno dispara un POST /api/returns real — no son datos mockeados en el cliente, son
 * respuestas reales de la API que luego se refrescan en este mismo estado local de React
 * (ver historia.md §9.3: piloto Polanco = categorías de moda, sin joyería).
 */
const SAMPLE_CASES: Array<{
  orderId: string;
  customerId: string;
  productCategory: string;
  purchaseAmount: number;
  label: string;
}> = [
  {
    orderId: "WEB-58291",
    customerId: "Sofía de la Garza",
    productCategory: "Vestidos de gala",
    purchaseAmount: 4200,
    label: "Caso estándar",
  },
  {
    orderId: "WEB-58317",
    customerId: "Mariana Gutiérrez Ibarra",
    productCategory: "Bolsos de piel",
    purchaseAmount: 32500,
    label: "Caso de alto valor (revisión de fraude)",
  },
  {
    orderId: "WEB-58340",
    customerId: "Roberto Fernández Solís",
    productCategory: "Calzado",
    purchaseAmount: 2800,
    label: "Caso estándar",
  },
];

interface ReturnCasesContextValue {
  cases: ReturnRequestResponseDto[];
  selectedCaseId: string | null;
  isLoadingSamples: boolean;
  actionError: string | null;
  pendingActionId: string | null;
  hasLoadedSamples: boolean;
  selectCase: (id: string) => void;
  loadSampleCases: () => Promise<void>;
  receiveItem: (id: string) => Promise<void>;
  submitInspection: (id: string, approved: boolean) => Promise<void>;
  dismissError: () => void;
}

const ReturnCasesContext = createContext<ReturnCasesContextValue | undefined>(undefined);

export function ReturnCasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<ReturnRequestResponseDto[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [hasLoadedSamples, setHasLoadedSamples] = useState(false);

  const upsertCase = useCallback((updated: ReturnRequestResponseDto) => {
    setCases((prev) => {
      const exists = prev.some((c) => c.id === updated.id);
      return exists
        ? prev.map((c) => (c.id === updated.id ? updated : c))
        : [...prev, updated];
    });
  }, []);

  const loadSampleCases = useCallback(async () => {
    setIsLoadingSamples(true);
    setActionError(null);
    try {
      for (const sample of SAMPLE_CASES) {
        const created = await createReturnRequest({
          orderId: sample.orderId,
          customerId: sample.customerId,
          productCategory: sample.productCategory,
          purchaseAmount: sample.purchaseAmount,
        });
        upsertCase(created);
      }
      setHasLoadedSamples(true);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? `No se pudieron crear los casos de ejemplo: ${err.message}. ¿Está corriendo la API en http://localhost:5163?`
          : "No se pudieron crear los casos de ejemplo.",
      );
    } finally {
      setIsLoadingSamples(false);
    }
  }, [upsertCase]);

  const selectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
  }, []);

  const receiveItem = useCallback(
    async (id: string) => {
      setPendingActionId(id);
      setActionError(null);
      try {
        const updated = await receiveReturnItem(id);
        upsertCase(updated);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "No se pudo marcar el artículo como recibido.",
        );
      } finally {
        setPendingActionId(null);
      }
    },
    [upsertCase],
  );

  const submitInspection = useCallback(
    async (id: string, approved: boolean) => {
      setPendingActionId(id);
      setActionError(null);
      try {
        const updated = await submitInspectionDecision(id, { approved });
        upsertCase(updated);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "No se pudo registrar la decisión de inspección.",
        );
      } finally {
        setPendingActionId(null);
      }
    },
    [upsertCase],
  );

  const dismissError = useCallback(() => setActionError(null), []);

  return (
    <ReturnCasesContext.Provider
      value={{
        cases,
        selectedCaseId,
        isLoadingSamples,
        actionError,
        pendingActionId,
        hasLoadedSamples,
        selectCase,
        loadSampleCases,
        receiveItem,
        submitInspection,
        dismissError,
      }}
    >
      {children}
    </ReturnCasesContext.Provider>
  );
}

export function useReturnCases() {
  const ctx = useContext(ReturnCasesContext);
  if (!ctx) {
    throw new Error("useReturnCases debe usarse dentro de ReturnCasesProvider");
  }
  return ctx;
}
