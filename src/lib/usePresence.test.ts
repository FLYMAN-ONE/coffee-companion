import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePresence } from "./usePresence";

describe("usePresence", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("stays mounted during the exit, then unmounts", () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 150), {
      initialProps: { open: true },
    });
    expect(result.current).toEqual({ mounted: true, exiting: false });

    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, exiting: true });

    act(() => void vi.advanceTimersByTime(150));
    expect(result.current).toEqual({ mounted: false, exiting: false });
  });

  it("cancels the exit when reopened", () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 150), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    act(() => void vi.advanceTimersByTime(100));
    rerender({ open: true });
    act(() => void vi.advanceTimersByTime(200));
    expect(result.current).toEqual({ mounted: true, exiting: false });
  });

  it("starts unmounted when closed", () => {
    const { result } = renderHook(() => usePresence(false, 150));
    expect(result.current).toEqual({ mounted: false, exiting: false });
  });
});
