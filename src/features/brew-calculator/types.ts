import type { MethodId } from "../../types";

export type ActiveField = "dose" | "water" | "coffee" | null;

export interface BrewValues {
  dose: number; // g/L
  water: number; // ml
  coffee: number; // g
  method: MethodId;
}

export interface BrewCalculatorReturn extends BrewValues {
  activeField: ActiveField;
  ratio: number;
  setDose: (value: number) => void;
  setWater: (value: number) => void;
  setCoffee: (value: number) => void;
  setMethod: (id: MethodId) => void;
  /** Load dose + water at once (recipes). */
  setAll: (dose: number, water: number, method?: MethodId) => void;
  reset: () => void;
}
