import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RecipeStep } from "../../types";
import { chimeDone, chimeStep, chimeTick, unlockAudio } from "../../lib/audio";

export type TimerStatus = "idle" | "running" | "paused" | "done";

interface Clock {
  status: TimerStatus;
  /** ms accumulated before the current run */
  base: number;
  /** Date.now() when the current run started */
  startedAt: number;
}

const IDLE: Clock = { status: "idle", base: 0, startedAt: 0 };
const TICK_MS = 100;

const elapsedAt = (c: Clock, now: number): number =>
  c.status === "running" ? c.base + Math.max(0, now - c.startedAt) : c.base;

/** End of each step in ms since start. */
export const stepBounds = (steps: RecipeStep[]): number[] => {
  let acc = 0;
  return steps.map((s) => (acc += s.seconds * 1000));
};

/** Index of the step running at `elapsed`; the last step once past the end, -1 without steps. */
export const stepAt = (bounds: number[], elapsed: number): number => {
  if (!bounds.length) return -1;
  const i = bounds.findIndex((b) => elapsed < b);
  return i === -1 ? bounds.length - 1 : i;
};

/**
 * Brew timer driven by Date.now(), so it stays exact across pauses and while
 * the screen is off. With steps it counts down each step and finishes on its
 * own; without steps it is a plain stopwatch. Actions are stable across ticks.
 */
export function useTimer(steps: RecipeStep[]) {
  const [clock, setClock] = useState<Clock>(IDLE);
  const [now, setNow] = useState(0);

  const bounds = useMemo(() => stepBounds(steps), [steps]);
  const totalMs = bounds.length ? bounds[bounds.length - 1] : 0;
  const hasSteps = bounds.length > 0;

  // Latest values for event handlers and the interval, which must not re-subscribe every tick.
  const latest = useRef({ clock, bounds });
  useEffect(() => {
    latest.current = { clock, bounds };
  }, [clock, bounds]);
  const cues = useRef({ step: -1, sec: -1 });

  // Tick while running: refresh the display, play cues, finish at the end of the recipe.
  useEffect(() => {
    if (clock.status !== "running") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      const b = latest.current.bounds;
      const elapsed = elapsedAt(clock, t);
      if (b.length) {
        const total = b[b.length - 1];
        if (elapsed >= total) {
          setClock({ status: "done", base: total, startedAt: clock.startedAt });
          chimeDone();
          return;
        }
        const i = stepAt(b, elapsed);
        if (cues.current.step !== -1 && i > cues.current.step) chimeStep();
        cues.current.step = i;
        const sec = Math.ceil((b[i] - elapsed) / 1000);
        if (sec >= 1 && sec <= 3 && sec !== cues.current.sec) chimeTick();
        cues.current.sec = sec;
      }
      setNow(t);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [clock]);

  // Keep the iPad awake while brewing.
  useEffect(() => {
    if (clock.status !== "running" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () =>
      navigator.wakeLock
        .request("screen")
        .then((l) => {
          if (cancelled) void l.release();
          else lock = l;
        })
        .catch(() => undefined);
    void acquire();
    const onVisible = () => document.visibilityState === "visible" && void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [clock.status]);

  const run = (base: number) => {
    const t = Date.now();
    setClock({ status: "running", base, startedAt: t });
    setNow(t);
  };

  const start = useCallback(() => {
    unlockAudio();
    cues.current = { step: -1, sec: -1 };
    run(0);
  }, []);

  const pause = useCallback(() => {
    const c = latest.current.clock;
    if (c.status !== "running") return;
    setClock({ ...c, status: "paused", base: elapsedAt(c, Date.now()) });
  }, []);

  const resume = useCallback(() => {
    if (latest.current.clock.status !== "paused") return;
    unlockAudio();
    run(latest.current.clock.base);
  }, []);

  const reset = useCallback(() => setClock(IDLE), []);

  const finish = useCallback(() => {
    const c = latest.current.clock;
    if (c.status === "idle" || c.status === "done") return;
    setClock({ ...c, status: "done", base: elapsedAt(c, Date.now()) });
  }, []);

  const skip = useCallback(() => {
    const { clock: c, bounds: b } = latest.current;
    if (!b.length || c.status === "idle" || c.status === "done") return;
    const end = b[stepAt(b, elapsedAt(c, Date.now()))];
    if (end >= b[b.length - 1]) {
      setClock({ ...c, status: "done", base: end });
      chimeDone();
    } else if (c.status === "running") {
      run(end);
    } else {
      setClock({ ...c, base: end });
    }
  }, []);

  const elapsedMs = Math.min(elapsedAt(clock, now), hasSteps ? totalMs : Infinity);
  const stepIndex = stepAt(bounds, elapsedMs);
  const stepStart = stepIndex > 0 ? bounds[stepIndex - 1] : 0;
  const stepEnd = stepIndex >= 0 ? bounds[stepIndex] : 0;

  return {
    status: clock.status,
    elapsedMs,
    totalMs,
    hasSteps,
    stepIndex,
    stepStart,
    stepEnd,
    stepRemainingMs: hasSteps ? Math.max(0, stepEnd - elapsedMs) : 0,
    start,
    pause,
    resume,
    reset,
    finish,
    skip,
  };
}

export type TimerApi = ReturnType<typeof useTimer>;
