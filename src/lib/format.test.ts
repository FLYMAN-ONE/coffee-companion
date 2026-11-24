import { describe, expect, it } from "vitest";
import { fmtTime, fromInputValue, toInputValue } from "./format";

describe("format", () => {
  it("formats seconds as m:ss", () => {
    expect(fmtTime(0)).toBe("0:00");
    expect(fmtTime(65)).toBe("1:05");
    expect(fmtTime(-3)).toBe("0:00");
    expect(fmtTime(59.6)).toBe("1:00");
  });

  it("round-trips datetime-local values", () => {
    const iso = fromInputValue("2026-03-04T07:30");
    expect(toInputValue(iso)).toBe("2026-03-04T07:30");
  });

  it("falls back to now on an invalid datetime-local value", () => {
    const before = Date.now();
    expect(new Date(fromInputValue("nope")).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });
});
