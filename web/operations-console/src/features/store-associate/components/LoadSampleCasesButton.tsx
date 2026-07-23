import { Button } from "../../../components/ui/Button";
import { useReturnCases } from "../hooks/ReturnCasesContext";

export function LoadSampleCasesButton() {
  const { loadSampleCases, isLoadingSamples, hasLoadedSamples } = useReturnCases();

  return (
    <Button
      variant="secondary"
      loading={isLoadingSamples}
      onClick={() => void loadSampleCases()}
      data-testid="load-sample-cases-button"
      icon={
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      }
    >
      {hasLoadedSamples ? "Cargar más casos de ejemplo" : "Cargar casos de ejemplo"}
    </Button>
  );
}
