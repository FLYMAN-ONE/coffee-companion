import type { Recipe, RecipeStep } from "../types";

/** Bump when the seeded recipes change: builtin recipes are refreshed once per version. */
export const SEED_VERSION = 3;

const steps = (prefix: string, rows: [string, number, number][]): RecipeStep[] =>
  rows.map(([label, seconds, waterPct], i) => ({
    id: `${prefix}-${i}`,
    label,
    seconds,
    waterPct,
  }));

const base = { favorite: false, createdAt: "2026-01-01T00:00:00.000Z" };
const SRC = "Source: The World Atlas of Coffee.";
const SRC_CHEMEX = "Sources: The World Atlas of Coffee and James Hoffmann's Chemex video.";

// Recipes follow James Hoffmann's "The World Atlas of Coffee" (brewing chapter) and his Chemex video.
// Times marked "estimated" in the notes are not given in the book.
export const defaultRecipes: Recipe[] = [
  {
    ...base,
    id: "builtin-pourover-cone",
    name: "Pour-Over Cone",
    method: "v60",
    dose: 60,
    water: 500,
    tempC: 95,
    grind: "Medium",
    notes: `60 g/L, medium grind (finer for a single cup). Rinse the paper, wait about 10 s after the boil, bloom with roughly twice the coffee's weight in water for 30 s, then pour slowly onto the coffee, not the walls. Swirl at the end. Too bitter: grind coarser. Weak or sour: grind finer. Timings after the bloom are estimated. ${SRC}`,
    favorite: true,
    steps: steps("poc", [
      ["Bloom", 30, 12],
      ["Pour slowly", 90, 100],
      ["Swirl & drawdown", 60, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-chemex",
    name: "Chemex",
    method: "chemex",
    dose: 60,
    water: 500,
    tempC: 95,
    grind: "Medium",
    notes: `60 g/L (30 g to 500 ml). Rinse the paper and keep its thick, triple-ply side over the spout so it cannot seal against the glass and stall the brew (a chopstick in the brewer also works). Do not grind much coarser than for a V60 to make up for the thick paper: 4-5 minutes for 500 ml is normal. Bloom with 2-3 times the coffee's weight for at least 45 s (60-90 g for 30 g of coffee), pour in phases as for a V60, then stir gently and swirl for a flat bed. Pour and drawdown timings are estimated. ${SRC_CHEMEX}`,
    steps: steps("chx", [
      ["Bloom", 45, 18],
      ["Pour slowly", 150, 100],
      ["Stir & swirl", 15, 100],
      ["Drawdown", 60, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-french-press",
    name: "French Press (No Plunge)",
    method: "french-press",
    dose: 75,
    water: 500,
    tempC: 95,
    grind: "Medium",
    notes: `75 g/L, medium grind. Pour quickly, steep 4 min, stir the crust and skim off the foam, wait 5 more minutes, then rest the plunger on top without pressing and pour slowly, leaving the silt behind. Pouring, stirring and serving times are estimated. ${SRC}`,
    steps: steps("fp", [
      ["Pour water", 15, 100],
      ["Steep", 240, 100],
      ["Stir crust & skim", 30, 100],
      ["Settle", 300, 100],
      ["Pour slowly", 30, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-aeropress-traditional",
    name: "AeroPress Traditional",
    method: "aeropress",
    dose: 75,
    water: 200,
    tempC: 94,
    grind: "Medium-fine",
    notes: `75 g/L (15 g to 200 ml). Rinse the paper, wait 10-20 s after the boil, stir, seat the plunger, steep 1 min, then press slowly. For short and strong use 100 g/L. Change one variable at a time. ${SRC}`,
    steps: steps("aer", [
      ["Pour & stir", 15, 100],
      ["Steep", 45, 100],
      ["Press slowly", 30, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-aeropress-inverted",
    name: "AeroPress Inverted",
    method: "aeropress",
    dose: 75,
    water: 200,
    tempC: 94,
    grind: "Medium-fine",
    notes: `Maximum about 200 ml of water. Plunger in by 2 cm, flip, add coffee and water, steep 1 min, fit the rinsed filter cap, flip onto the mug and press slowly. Take care when flipping. Cap and flip time is estimated. ${SRC}`,
    steps: steps("aei", [
      ["Pour & stir", 15, 100],
      ["Steep", 45, 100],
      ["Fit filter & flip", 30, 100],
      ["Press slowly", 30, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-moka",
    name: "Moka Pot (Gentle)",
    method: "moka",
    dose: 200,
    water: 80,
    tempC: 95,
    grind: "Medium-fine",
    notes: `200 g/L: fill the basket level without tamping and fill the base with hot water to just under the valve. Low-medium heat with the lid open; at the first gurgle stop the heat and cool the base under cold water. Grind quite fine (salt), coarser than espresso. Works best with a light espresso roast. Heating time is estimated. ${SRC}`,
    steps: steps("mok", [
      ["Fill with hot water", 30, 100],
      ["Heat gently", 150, 100],
      ["Stop & cool the base", 20, 100],
    ]),
  },
  {
    ...base,
    id: "builtin-espresso",
    name: "Espresso 1:2",
    method: "espresso",
    dose: 500,
    water: 36,
    tempC: 93,
    grind: "Fine",
    notes: `18 g in, 36 g out in 27-29 s, water at 90-94 °C. Too much liquid: grind finer. Too little: grind coarser. Lighter roasts like a higher temperature. ${SRC}`,
    steps: steps("esp", [["Extraction", 28, 100]]),
  },
  {
    ...base,
    id: "builtin-espresso-15",
    name: "Espresso 1:1.5",
    method: "espresso",
    dose: 667,
    water: 27,
    tempC: 92,
    grind: "Fine",
    notes: `18 g in, 27 g out. Fuller body, suits slightly darker roasts. Grind finer so the shot still takes about the same time. ${SRC}`,
    steps: steps("es2", [["Extraction", 28, 100]]),
  },
  {
    ...base,
    id: "builtin-cold-brew",
    name: "Cold Brew Concentrate",
    method: "cold-brew",
    dose: 125,
    water: 1000,
    tempC: 4,
    grind: "Coarse",
    notes: "Steep in the fridge for 12-18 hours, filter, dilute 1:1 to serve. Not covered in the book.",
    steps: [],
  },
];
