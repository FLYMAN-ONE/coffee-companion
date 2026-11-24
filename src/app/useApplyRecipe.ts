import { useCallback } from "react";
import { useCalculator } from "../features/brew-calculator/calculatorStore";
import { useTimerSession } from "../features/timer/timerStore";
import type { Recipe } from "../types";
import { useNavigation, type TabId } from "./navigation";

/**
 * Load a recipe into the calculator and, unless a brew is in progress, select
 * it for the timer. Optionally switch tab.
 */
export function useApplyRecipe() {
  const { setAll } = useCalculator();
  const { busy, selectRecipe } = useTimerSession();
  const { go } = useNavigation();

  return useCallback(
    (r: Recipe, goTo?: TabId) => {
      setAll(r.dose, r.water, r.method);
      if (!busy) selectRecipe(r.id);
      if (goTo) go(goTo);
    },
    [setAll, busy, selectRecipe, go]
  );
}
