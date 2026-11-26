import { createStore } from "../../lib/createStore";
import type { MethodId, Recipe } from "../../types";
import type { PrepareField, PrepareState } from "./logic/dosing";

export interface PrepareStore extends PrepareState {
  /** The selected recipe (localized), or null for "Free". */
  recipe: Recipe | null;
  /** Select a recipe and load its doses; null switches to "Free" and keeps the doses. */
  pickRecipe: (r: Recipe | null) => void;
  setMethod: (m: MethodId) => void;
  /** Move coffee or water; with a recipe the ratio holds, in Free it follows (see logic/dosing.ts). */
  change: (field: PrepareField, value: number) => void;
}

export const [PrepareContext, usePrepare] = createStore<PrepareStore>("Prepare");
