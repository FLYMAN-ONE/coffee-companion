import { createStore } from "../../lib/createStore";
import type { TimerApi, TimerStatus } from "./useTimer";

/**
 * Timer state that changes only on user actions or step changes. Safe to use
 * anywhere: it does not re-render on every tick.
 */
export interface TimerSession {
  status: TimerStatus;
  /** True while running or paused. */
  busy: boolean;
  /** Stable actions (they do not change on every tick). */
  actions: Pick<TimerApi, "start" | "pause" | "resume" | "reset" | "finish" | "skip">;
}

export const [TimerSessionContext, useTimerSession] = createStore<TimerSession>("TimerSession");

/** Live timer, updated every tick. Only the focus screen should use it. */
export const [TimerClockContext, useTimerClock] = createStore<TimerApi>("TimerClock");
