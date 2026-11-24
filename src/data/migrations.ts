import type { Recipe } from "../types";
import { SEED_VERSION, defaultRecipes } from "./defaultRecipes";
import { sanitizeList, sanitizeRecipe } from "./schema";
import { STORAGE_KEYS } from "./storageKeys";

/**
 * Version of the stored data layout. Bump it and add a step to `migrations`
 * whenever a stored shape changes, so existing data is converted once.
 */
export const SCHEMA_VERSION = 2;

type Migration = (storage: Storage) => void;

const LEGACY_CALC_KEY = "cc:calc:v1";

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

/** Keyed by the version they migrate *to*. Version 1 is the original layout. */
const migrations: Record<number, Migration> = {
  // v2: the calculator ({dose g/L, water, coffee, method}) becomes the Prepare
  // screen ({coffee, ratio, water, lock, recipeId, method}).
  2: (storage) => {
    const old = readJson(storage, LEGACY_CALC_KEY);
    if (old && typeof old === "object") {
      const o = old as Record<string, unknown>;
      const dose = typeof o.dose === "number" && o.dose > 0 ? o.dose : 60;
      const water = typeof o.water === "number" && o.water > 0 ? o.water : 500;
      storage.setItem(
        STORAGE_KEYS.prepare,
        JSON.stringify({
          recipeId: null,
          method: o.method,
          water,
          ratio: Math.round((1000 / dose) * 10) / 10,
          coffee: Math.round(((water * dose) / 1000) * 10) / 10,
          lock: "ratio",
        })
      );
    }
    storage.removeItem(LEGACY_CALC_KEY);
  },
};

/**
 * Builtin recipes refreshed to the current seed: favorites are kept, recipes
 * created by the user are left untouched and listed after the builtin ones.
 */
export function mergeSeed(list: Recipe[], seed: Recipe[] = defaultRecipes): Recipe[] {
  const favorites = new Set(list.filter((r) => r.favorite).map((r) => r.id));
  const own = list.filter((r) => !r.id.startsWith("builtin-"));
  const fresh = seed.map((r) => ({ ...r, favorite: r.favorite || favorites.has(r.id) }));
  return [...fresh, ...own];
}

/**
 * Run once at startup, before React renders: applies pending schema migrations
 * and refreshes the seeded recipes when SEED_VERSION changed.
 */
export function prepareStorage(storage: Storage = localStorage): void {
  try {
    const from = Number(storage.getItem(STORAGE_KEYS.schema) ?? 0) || 0;
    for (let v = from + 1; v <= SCHEMA_VERSION; v++) migrations[v]?.(storage);
    if (from < SCHEMA_VERSION) storage.setItem(STORAGE_KEYS.schema, String(SCHEMA_VERSION));

    const seed = Number(readJson(storage, STORAGE_KEYS.seed) ?? 0) || 0;
    if (seed < SEED_VERSION) {
      const stored = sanitizeList(readJson(storage, STORAGE_KEYS.recipes), sanitizeRecipe);
      storage.setItem(STORAGE_KEYS.recipes, JSON.stringify(mergeSeed(stored)));
      storage.setItem(STORAGE_KEYS.seed, JSON.stringify(SEED_VERSION));
    }
  } catch {
    // Storage unavailable: the app falls back to in-memory defaults.
  }
}
