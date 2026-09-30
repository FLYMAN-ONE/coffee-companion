export type MethodId =
  | "v60"
  | "chemex"
  | "aeropress"
  | "french-press"
  | "moka"
  | "espresso"
  | "cold-brew"
  | "other";

export type Grind =
  | "Extra fine"
  | "Fine"
  | "Medium-fine"
  | "Medium"
  | "Medium-coarse"
  | "Coarse";

export interface RecipeStep {
  id: string;
  label: string;
  seconds: number;
  /** Cumulative water target at the end of the step, 0-100 % of total water. */
  waterPct: number;
}

export interface Recipe {
  id: string;
  name: string;
  method: MethodId;
  dose: number; // g/L
  water: number; // ml
  tempC: number;
  grind: Grind;
  notes: string;
  steps: RecipeStep[];
  favorite: boolean;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  date: string; // ISO
  method: MethodId;
  recipeName: string;
  beans: string;
  dose: number;
  water: number;
  coffee: number;
  tempC: number;
  grind: Grind;
  timeSec: number;
  rating: number; // 0 = not rated
  tastes: string[];
  notes: string;
}
