import type { ReactNode } from "react";
import { CalculatorContext } from "./calculatorStore";
import { useBrewCalculator } from "./hooks/useBrewCalculator";

export function CalculatorProvider({ children }: { children: ReactNode }) {
  return <CalculatorContext value={useBrewCalculator()}>{children}</CalculatorContext>;
}
