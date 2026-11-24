import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useRecipes } from "../recipes/recipesStore";
import { TimerClockContext, TimerSessionContext } from "./timerStore";
import { useTimer } from "./useTimer";

const NO_STEPS: never[] = [];

export function TimerProvider({ children }: { children: ReactNode }) {
  const { recipes } = useRecipes();
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const recipe = recipes.find((r) => r.id === recipeId) ?? null;
  const timer = useTimer(recipe?.steps ?? NO_STEPS);
  const { status, reset } = timer;
  const busy = status === "running" || status === "paused";

  const selectRecipe = useCallback(
    (id: string | null) => {
      reset();
      setRecipeId(id);
    },
    [reset]
  );

  const session = useMemo(
    () => ({ status, recipe, selectRecipe, busy }),
    [status, recipe, selectRecipe, busy]
  );

  return (
    <TimerSessionContext value={session}>
      <TimerClockContext value={timer}>{children}</TimerClockContext>
    </TimerSessionContext>
  );
}
