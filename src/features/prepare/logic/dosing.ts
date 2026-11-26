import type { MethodId, Recipe } from "../../../types";

/**
 * Coffee (g), ratio (1:N) and water (ml) are tied by water = coffee × ratio.
 * One of the three is locked; changing one of the two free values recomputes
 * the other free one, so only two numbers ever move together.
 * In Prepare only coffee and water move (see `prepareLock`); the ratio is read-only.
 */
export type DoseField = "coffee" | "ratio" | "water";
export const DOSE_FIELDS: DoseField[] = ["coffee", "ratio", "water"];

export interface Dosing {
  coffee: number;
  ratio: number;
  water: number;
}

export interface PrepareState extends Dosing {
  /** Selected recipe; null = "Free" (doses and stopwatch, method chosen by hand). */
  recipeId: string | null;
  method: MethodId;
}

/** Coffee or water: the two values Prepare lets you move. */
export type PrepareField = Exclude<DoseField, "ratio">;
export const PREPARE_FIELDS: PrepareField[] = ["coffee", "water"];

/**
 * What stays put in Prepare when `changed` moves. With a recipe its ratio holds, so the dose
 * scales (less coffee, less water); in Free the other amount holds and the ratio follows.
 */
export const prepareLock = (hasRecipe: boolean, changed: PrepareField): DoseField =>
  hasRecipe ? "ratio" : changed === "coffee" ? "water" : "coffee";

export const round1 = (v: number): number => Math.round(v * 10) / 10;

/** The field that recomputes when `changed` is moved while `lock` is held. */
export const derivedField = (lock: DoseField, changed: DoseField): DoseField =>
  DOSE_FIELDS.find((f) => f !== lock && f !== changed) ?? changed;

/** Set `field` to `value` and recompute the other free field. Moving the locked field does nothing. */
export function applyChange(d: Dosing, lock: DoseField, field: DoseField, value: number): Dosing {
  if (field === lock) return d;
  const next = { ...d, [field]: value };
  switch (derivedField(lock, field)) {
    case "water":
      return { ...next, water: Math.round(next.coffee * next.ratio) };
    case "coffee":
      return { ...next, coffee: next.ratio > 0 ? round1(next.water / next.ratio) : next.coffee };
    case "ratio":
      return { ...next, ratio: next.coffee > 0 ? round1(next.water / next.coffee) : next.ratio };
  }
}

/** Recipes store a dose in g/L; the screen works with coffee, ratio and water. */
export const dosingFromRecipe = (r: Pick<Recipe, "dose" | "water">): Dosing => ({
  water: r.water,
  ratio: r.dose > 0 ? round1(1000 / r.dose) : 16,
  coffee: round1((r.water * r.dose) / 1000),
});

/** g/L dose for a ratio (stored in recipes and log entries). */
export const doseFromRatio = (ratio: number): number => (ratio > 0 ? Math.round(1000 / ratio) : 60);

/** g/L dose for a coffee weight and a water volume (recipe editor: coffee and water are the inputs). */
export const doseFromCoffee = (coffee: number, water: number): number =>
  water > 0 && coffee > 0 ? Math.round((coffee * 1_000_000) / water) / 1000 : 60;

/** How the recipe editor takes the coffee: grams, concentration (g/L) or ratio (1:N). */
export type CoffeeInput = "g" | "gpl" | "ratio";

/** The editor's coffee value in a given input mode, from the stored dose (g/L in whole grams). */
export const coffeeInputValue = (mode: CoffeeInput, dose: number, water: number): number =>
  mode === "g" ? round1((water * dose) / 1000) : mode === "gpl" ? Math.round(dose) : round1(1000 / dose);

/** g/L dose from the editor's coffee value in a given input mode. */
export const doseFromInput = (mode: CoffeeInput, value: number, water: number): number =>
  mode === "g"
    ? doseFromCoffee(value, water)
    : mode === "gpl"
      ? Math.round(value)
      : value > 0
        ? Math.round(1_000_000 / value) / 1000
        : 60;

/** Ruler scales per field: value step, pixels per step, tick and label spacing. */
export const RULER_SCALES: Record<
  DoseField,
  { min: number; max: number; step: number; px: number; major: number; label: number }
> = {
  coffee: { min: 1, max: 70, step: 0.5, px: 12, major: 5, label: 5 },
  ratio: { min: 1, max: 20, step: 0.1, px: 9, major: 1, label: 1 },
  water: { min: 20, max: 1000, step: 5, px: 10, major: 50, label: 100 },
};

export const DEFAULT_PREPARE: PrepareState = {
  recipeId: "builtin-v60",
  method: "v60",
  coffee: 30,
  ratio: 16.7,
  water: 500,
};
