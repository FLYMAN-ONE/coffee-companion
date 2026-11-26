import { describe, expect, it } from "vitest";
import {
  applyChange,
  coffeeInputValue,
  derivedField,
  doseFromCoffee,
  doseFromInput,
  doseFromRatio,
  dosingFromRecipe,
  prepareLock,
} from "./dosing";

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

describe("doseFromCoffee", () => {
  it("keeps coffee and water exact through the stored dose", () => {
    const dose = doseFromCoffee(18, 300);
    expect(dosingFromRecipe({ dose, water: 300 })).toEqual({ coffee: 18, ratio: 16.7, water: 300 });
  });
});

describe("coffee input modes", () => {
  it("round-trips every mode through the stored dose", () => {
    for (const mode of ["g", "gpl", "ratio"] as const) {
      for (const v of mode === "gpl" ? [48, 60, 64] : [16.1, 17.3, 64.5]) {
        expect(coffeeInputValue(mode, doseFromInput(mode, v, 333), 333)).toBe(v);
      }
    }
  });

  it("takes g/L as whole numbers", () => {
    expect(doseFromInput("gpl", 64.4, 500)).toBe(64);
    expect(coffeeInputValue("gpl", 59.88, 500)).toBe(60);
  });

  it("nudging the ratio by 0.1 always moves it", () => {
    let r = 16.7;
    for (let i = 0; i < 20; i++) {
      const next = coffeeInputValue("ratio", doseFromInput("ratio", r + 0.1, 500), 500);
      expect(next).toBeCloseTo(r + 0.1, 5);
      r = next;
    }
  });
});

describe("prepareLock", () => {
  const d = { coffee: 30, ratio: 16.7, water: 500 };
  it("scales the dose with a recipe: the ratio holds", () => {
    expect(applyChange(d, prepareLock(true, "coffee"), "coffee", 15)).toEqual({
      coffee: 15,
      ratio: 16.7,
      water: 251,
    });
  });
  it("in Free the other amount holds and the ratio follows", () => {
    expect(applyChange(d, prepareLock(false, "coffee"), "coffee", 25)).toEqual({
      coffee: 25,
      ratio: 20,
      water: 500,
    });
    expect(applyChange(d, prepareLock(false, "water"), "water", 450)).toEqual({
      coffee: 30,
      ratio: 15,
      water: 450,
    });
  });
});
