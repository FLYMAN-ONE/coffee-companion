const round = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const calculateCoffee = (water: number, dose: number): number =>
  round((water * dose) / 1000, 1);

export const calculateWater = (coffee: number, dose: number): number => {
  if (dose <= 0) return 0;
  return round((coffee * 1000) / dose, 0);
};

export const calculateRatio = (water: number, coffee: number): number => {
  if (!coffee) return 0;
  return round(water / coffee, 1);
};

/** Slider upper bound that grows with the value so presets never overflow. */
export const rangeMax = (value: number, base: number): number =>
  value <= base ? base : Math.ceil(value / base) * base;

export type Strength = "light" | "balanced" | "strong" | "concentrated";

export const describeStrength = (dose: number): Strength => {
  if (dose <= 55) return "light";
  if (dose <= 70) return "balanced";
  if (dose <= 100) return "strong";
  return "concentrated";
};
