import { describe, expect, it } from "vitest";
import { MIN_SHARE, levelAt, ribbonPaths, sequenceLayout } from "./sequence";

const step = (id: string, seconds: number, waterPct: number) => ({ id, label: id, seconds, waterPct });

describe("sequenceLayout", () => {
  it("tracks start time, water before/after and pours", () => {
    const s = sequenceLayout([step("a", 45, 12), step("b", 30, 60), step("c", 60, 60)]);
    expect(s.map((x) => x.start)).toEqual([0, 45, 75]);
    expect(s.map((x) => [x.fromPct, x.toPct])).toEqual([
      [0, 12],
      [12, 60],
      [60, 60],
    ]);
    expect(s.map((x) => x.pour)).toEqual([true, true, false]);
  });

  it("spans the full width, contiguously, with a minimum share for short steps", () => {
    const s = sequenceLayout([step("a", 15, 100), step("b", 240, 100), step("c", 300, 100)]);
    expect(s[0].x0).toBe(0);
    expect(s[2].x1).toBeCloseTo(1);
    expect(s[1].x0).toBe(s[0].x1);
    const share = (x: (typeof s)[number]) => x.x1 - x.x0;
    expect(share(s[0])).toBeGreaterThan(MIN_SHARE * 0.8);
    expect(share(s[2])).toBeGreaterThan(share(s[1]));
  });

  it("handles zero-length recipes", () => {
    const s = sequenceLayout([step("a", 0, 50), step("b", 0, 100)]);
    expect(s[0].x1).toBeCloseTo(0.5);
    expect(s[1].x1).toBeCloseTo(1);
  });
});

describe("ribbonPaths", () => {
  it("closes the area on the base line and starts the line at empty", () => {
    const { area, line } = ribbonPaths(sequenceLayout([step("a", 10, 100)]), 100, (p) => 100 - p, 100);
    expect(area).toBe("M0 100 L0 100 L0 100 C50 100 50 0 100 0 L100 100 Z");
    expect(line).toBe("M0 100 L0 100 C50 100 50 0 100 0");
  });
});

describe("levelAt", () => {
  const s = sequenceLayout([step("a", 10, 50), step("b", 10, 50)]);
  it("follows the curve: start, middle and end of a pour, flat during a wait", () => {
    expect(levelAt(s, 0)).toBeCloseTo(0);
    expect(levelAt(s, s[0].x1 / 2)).toBeCloseTo(25, 0);
    expect(levelAt(s, s[0].x1)).toBeCloseTo(50);
    expect(levelAt(s, 0.8)).toBeCloseTo(50);
    expect(levelAt(s, 1)).toBeCloseTo(50);
  });
});
