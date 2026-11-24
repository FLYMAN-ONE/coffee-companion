import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecipeStep } from "../../types";
import { useTimer } from "./useTimer";

const steps: RecipeStep[] = [
  { id: "a", label: "Bloom", seconds: 30, waterPct: 20 },
  { id: "b", label: "Pour", seconds: 60, waterPct: 100 },
];

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T08:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("starts idle on the first step", () => {
    const { result } = renderHook(() => useTimer(steps));
    expect(result.current.status).toBe("idle");
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.totalMs).toBe(90_000);
  });

  it("moves through steps as time passes and finishes on its own", () => {
    const { result } = renderHook(() => useTimer(steps));
    act(() => result.current.start());
    advance(10_000);
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.stepRemainingMs).toBeCloseTo(20_000, -2);

    advance(25_000);
    expect(result.current.stepIndex).toBe(1);

    advance(60_000);
    expect(result.current.status).toBe("done");
    expect(result.current.elapsedMs).toBe(90_000);
  });

  it("does not count time while paused", () => {
    const { result } = renderHook(() => useTimer(steps));
    act(() => result.current.start());
    advance(10_000);
    act(() => result.current.pause());
    const paused = result.current.elapsedMs;
    advance(60_000);
    expect(result.current.status).toBe("paused");
    expect(result.current.elapsedMs).toBe(paused);

    act(() => result.current.resume());
    advance(5_000);
    expect(result.current.elapsedMs).toBeCloseTo(paused + 5_000, -2);
  });

  it("skips to the next step and finishes when skipping the last one", () => {
    const { result } = renderHook(() => useTimer(steps));
    act(() => result.current.start());
    advance(1_000);
    act(() => result.current.skip());
    advance(100);
    expect(result.current.stepIndex).toBe(1);
    act(() => result.current.skip());
    expect(result.current.status).toBe("done");
  });

  it("skips while paused without starting to run", () => {
    const { result } = renderHook(() => useTimer(steps));
    act(() => result.current.start());
    advance(5_000);
    act(() => result.current.pause());
    act(() => result.current.skip());
    expect(result.current.status).toBe("paused");
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.elapsedMs).toBe(30_000);
  });

  it("keeps its actions stable while ticking", () => {
    const { result } = renderHook(() => useTimer(steps));
    const { pause, skip, finish } = result.current;
    act(() => result.current.start());
    advance(3_000);
    expect(result.current.pause).toBe(pause);
    expect(result.current.skip).toBe(skip);
    expect(result.current.finish).toBe(finish);
  });

  it("works as a plain stopwatch without steps", () => {
    const { result } = renderHook(() => useTimer([]));
    act(() => result.current.start());
    advance(200_000);
    expect(result.current.status).toBe("running");
    expect(result.current.hasSteps).toBe(false);
    act(() => result.current.finish());
    expect(result.current.status).toBe("done");
    expect(result.current.elapsedMs).toBeCloseTo(200_000, -2);
  });

  it("reset returns to idle at zero", () => {
    const { result } = renderHook(() => useTimer(steps));
    act(() => result.current.start());
    advance(40_000);
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.elapsedMs).toBe(0);
  });
});
