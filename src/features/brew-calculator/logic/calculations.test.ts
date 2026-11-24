import { describe, expect, it } from "vitest";
import { calculateCoffee, calculateRatio, calculateWater, describeStrength, rangeMax } from "./calculations";

describe("calculations", () => {
  it("derives coffee grams from water and dose, rounded to 0.1 g", () => {
    expect(calculateCoffee(500, 60)).toBe(30);
    expect(calculateCoffee(250, 65)).toBe(16.3);
  });

  it("derives water from coffee and dose, rounded to 1 ml", () => {
    expect(calculateWater(30, 60)).toBe(500);
    expect(calculateWater(15, 65)).toBe(231);
    expect(calculateWater(15, 0)).toBe(0);
  });

  it("computes the 1:N ratio", () => {
    expect(calculateRatio(500, 30)).toBe(16.7);
    expect(calculateRatio(500, 0)).toBe(0);
  });

  it("grows the slider max in steps of the base", () => {
    expect(rangeMax(80, 150)).toBe(150);
    expect(rangeMax(151, 150)).toBe(300);
    expect(rangeMax(1200, 1000)).toBe(2000);
  });

  it("describes strength by dose", () => {
    expect(describeStrength(55)).toBe("light");
    expect(describeStrength(60)).toBe("balanced");
    expect(describeStrength(100)).toBe("strong");
    expect(describeStrength(200)).toBe("concentrated");
  });
});
