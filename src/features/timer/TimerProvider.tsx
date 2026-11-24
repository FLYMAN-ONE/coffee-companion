import { useMemo, type ReactNode } from "react";
import { usePrepare } from "../prepare/prepareStore";
import { TimerClockContext, TimerSessionContext } from "./timerStore";
import { useTimer } from "./useTimer";

const NO_STEPS: never[] = [];

/** The timer follows the recipe selected in Prepare (no steps = stopwatch). */
export function TimerProvider({ children }: { children: ReactNode }) {
  const { recipe } = usePrepare();
  const timer = useTimer(recipe?.steps ?? NO_STEPS);
  const { status, start, pause, resume, reset, finish, skip } = timer;
  const busy = status === "running" || status === "paused";
  const session = useMemo(
    () => ({ status, busy, actions: { start, pause, resume, reset, finish, skip } }),
    [status, busy, start, pause, resume, reset, finish, skip]
  );

  return (
    <TimerSessionContext value={session}>
      <TimerClockContext value={timer}>{children}</TimerClockContext>
    </TimerSessionContext>
  );
}
