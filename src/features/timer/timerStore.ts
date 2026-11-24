import { createStore } from "../../lib/createStore";
import type { Recipe } from "../../types";
import type { TimerApi, TimerStatus } from "./useTimer";

/**
 * Timer state that changes only on user actions or step changes. Safe to use
 * anywhere: it does not re-render on every tick.
 */
export interface TimerSession {
  status: TimerStatus;
  /** Recipe followed by the timer; null for the plain stopwatch. */
  recipe: Recipe | null;
  selectRecipe: (id: string | null) => void;
  /** True while running or paused: the recipe cannot change. */
  busy: boolean;
}

export const [TimerSessionContext, useTimerSession] = createStore<TimerSession>("TimerSession");

/** Live timer, updated every tick. Only the timer screen should use it. */
export const [TimerClockContext, useTimerClock] = createStore<TimerApi>("TimerClock");
