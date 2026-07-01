const round = (
  value: number,
  decimals: number
): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};


export const calculateCoffee = (
  water: number,
  dose: number
): number => {

  return round(
    (water * dose) / 1000,
    1
  );
};


export const calculateWater = (
  coffee: number,
  dose: number
): number => {

  return round(
    (coffee * 1000) / dose,
    0
  );
};


export const calculateRatio = (
  water: number,
  coffee: number
): number => {

  if (!coffee) return 0;

  return round(
    water / coffee,
    1
  );
};