import { useCallback, useMemo, type ReactNode } from "react";
import { sanitizePrepare } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { useLocalStorage } from "../../lib/storage";
import type { MethodId, Recipe } from "../../types";
import { useRecipes } from "../recipes/recipesStore";
import {
  DEFAULT_PREPARE,
  applyChange,
  dosingFromRecipe,
  prepareLock,
  type PrepareField,
  type PrepareState,
} from "./logic/dosing";
import { PrepareContext } from "./prepareStore";

export function PrepareProvider({ children }: { children: ReactNode }) {
  const { recipes } = useRecipes();
  const [state, setState] = useLocalStorage<PrepareState>(STORAGE_KEYS.prepare, DEFAULT_PREPARE, (raw) =>
    sanitizePrepare(raw, DEFAULT_PREPARE)
  );
  const recipe = state.recipeId ? (recipes.find((r) => r.id === state.recipeId) ?? null) : null;

  const pickRecipe = useCallback(
    (r: Recipe | null) =>
      setState((s) =>
        r ? { ...s, ...dosingFromRecipe(r), recipeId: r.id, method: r.method } : { ...s, recipeId: null }
      ),
    [setState]
  );
  const setMethod = useCallback((method: MethodId) => setState((s) => ({ ...s, method })), [setState]);
  const change = useCallback(
    (field: PrepareField, value: number) =>
      setState((s) => ({ ...s, ...applyChange(s, prepareLock(s.recipeId !== null, field), field, value) })),
    [setState]
  );

  const value = useMemo(
    () => ({ ...state, recipe, pickRecipe, setMethod, change }),
    [state, recipe, pickRecipe, setMethod, change]
  );
  return <PrepareContext value={value}>{children}</PrepareContext>;
}
