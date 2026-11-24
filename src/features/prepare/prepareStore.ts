import { createStore } from "../../lib/createStore";
import type { MethodId, Recipe } from "../../types";
import type { DoseField, PrepareState } from "./logic/dosing";

export interface PrepareStore extends PrepareState {
  /** The selected recipe (localized), or null for "Free". */
  recipe: Recipe | null;
  /** Select a recipe and load its doses; null switches to "Free" and keeps the doses. */
  pickRecipe: (r: Recipe | null) => void;
  setMethod: (m: MethodId) => void;
  /** Move one free value; the other free one is recomputed (see logic/dosing.ts). */
  change: (field: DoseField, value: number) => void;
  setLock: (f: DoseField) => void;
}

export const [PrepareContext, usePrepare] = createStore<PrepareStore>("Prepare");
