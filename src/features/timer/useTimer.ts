import { useCallback, useEffect, useRef, useState } from "react";
import type { RecipeStep } from "../../types";
import { chimeDone, chimeStep, chimeTick, unlockAudio } from "../../lib/audio";

export type TimerStatus = "idle" | "running" | "paused" | "done";

export function useTimer(steps: RecipeStep[]) {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [base, setBase] = useState(0); // ms accumulated before the current run
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [status]);

  const elapsedMs =
    status === "running" ? base + Math.max(0, now - startedAt) : base;

  // End of each step in ms since start.
  const bounds: number[] = [];
  steps.reduce((acc, s) => {
    const end = acc + s.seconds * 1000;
    bounds.push(end);
    return end;
  }, 0);
  const totalMs = bounds.length ? bounds[bounds.length - 1] : 0;
  const hasSteps = steps.length > 0;

  const foundIndex = bounds.findIndex((b) => elapsedMs < b);
  const stepIndex = hasSteps ? (foundIndex === -1 ? steps.length - 1 : foundIndex) : -1;
  const stepStart = stepIndex > 0 ? bounds[stepIndex - 1] : 0;
  const stepEnd = stepIndex >= 0 ? bounds[stepIndex] : 0;
  const stepRemainingMs = hasSteps ? Math.max(0, stepEnd - elapsedMs) : 0;

  // Recipe finished on its own.
  useEffect(() => {
    if (status === "running" && hasSteps && elapsedMs >= totalMs) {
      setBase(totalMs);
      setStatus("done");
      chimeDone();
    }
  }, [status, hasSteps, elapsedMs, totalMs]);

  // Chime on step change and during the last 3 seconds of a step.
  const prevStep = useRef(-1);
  useEffect(() => {
    if (status !== "running") return;
    if (prevStep.current !== -1 && stepIndex > prevStep.current) chimeStep();
    prevStep.current = stepIndex;
  }, [status, stepIndex]);

  const remainingSec = Math.ceil(stepRemainingMs / 1000);
  const prevSec = useRef(-1);
  useEffect(() => {
    if (status !== "running" || !hasSteps) return;
    if (remainingSec >= 1 && remainingSec <= 3 && prevSec.current !== remainingSec) {
      chimeTick();
    }
    prevSec.current = remainingSec;
  }, [status, hasSteps, remainingSec]);

  // Keep the iPad awake while brewing.
  useEffect(() => {
    if (status !== "running" || !("wakeLock" in navigator)) return;
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
  }, [status]);

  const start = useCallback(() => {
    unlockAudio();
    const t = Date.now();
    prevStep.current = -1;
    prevSec.current = -1;
    setBase(0);
    setStartedAt(t);
    setNow(t);
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setBase((b) => b + Math.max(0, Date.now() - startedAt));
    setStatus("paused");
  }, [startedAt]);

  const resume = useCallback(() => {
    unlockAudio();
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    setBase(0);
    setStatus("idle");
  }, []);

  const finish = useCallback(() => {
    setBase(elapsedMs);
    setStatus("done");
  }, [elapsedMs]);

  const skip = useCallback(() => {
    if (!hasSteps || stepIndex < 0) return;
    const t = Date.now();
    setBase(stepEnd);
    setStartedAt(t);
    setNow(t);
    if (stepIndex === steps.length - 1) {
      setStatus("done");
      chimeDone();
    }
  }, [hasSteps, stepIndex, stepEnd, steps.length]);

  return {
    status,
    elapsedMs,
    totalMs,
    hasSteps,
    stepIndex,
    stepStart,
    stepEnd,
    stepRemainingMs,
    start,
    pause,
    resume,
    reset,
    finish,
    skip,
  };
}

export type TimerApi = ReturnType<typeof useTimer>;
