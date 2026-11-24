import { describe, expect, it } from "vitest";
import { applyChange, derivedField, doseFromRatio, dosingFromRecipe } from "./dosing";

const d = { coffee: 30, ratio: 16.7, water: 500 };

describe("dosing with a locked value", () => {
  it("ratio locked: coffee drives water and water drives coffee", () => {
    expect(applyChange(d, "ratio", "coffee", 36)).toEqual({ coffee: 36, ratio: 16.7, water: 601 });
    expect(applyChange(d, "ratio", "water", 560)).toEqual({ coffee: 33.5, ratio: 16.7, water: 560 });
  });

  it("water locked: coffee and ratio move, water stays", () => {
    expect(applyChange(d, "water", "coffee", 25)).toEqual({ coffee: 25, ratio: 20, water: 500 });
    expect(applyChange(d, "water", "ratio", 15)).toEqual({ coffee: 33.3, ratio: 15, water: 500 });
  });

  it("coffee locked: ratio and water move, coffee stays", () => {
    expect(applyChange(d, "coffee", "ratio", 15)).toEqual({ coffee: 30, ratio: 15, water: 450 });
    expect(applyChange(d, "coffee", "water", 600)).toEqual({ coffee: 30, ratio: 20, water: 600 });
  });

  it("never changes the locked value, and ignores moves of the locked field", () => {
    for (const lock of ["coffee", "ratio", "water"] as const) {
      for (const field of ["coffee", "ratio", "water"] as const) {
        const next = applyChange(d, lock, field, 42);
        expect(next[lock]).toBe(d[lock]);
      }
    }
  });

  it("names the field that recomputes", () => {
    expect(derivedField("ratio", "coffee")).toBe("water");
    expect(derivedField("ratio", "water")).toBe("coffee");
    expect(derivedField("water", "coffee")).toBe("ratio");
  });
});

describe("recipe conversion", () => {
  it("turns a g/L dose into coffee and ratio", () => {
    expect(dosingFromRecipe({ dose: 60, water: 500 })).toEqual({ coffee: 30, ratio: 16.7, water: 500 });
    expect(dosingFromRecipe({ dose: 500, water: 36 })).toEqual({ coffee: 18, ratio: 2, water: 36 });
  });

  it("turns a ratio back into a g/L dose", () => {
    expect(doseFromRatio(16.7)).toBe(60);
    expect(doseFromRatio(2)).toBe(500);
  });
});
