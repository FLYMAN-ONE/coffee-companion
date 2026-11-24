import type { Recipe } from "../types";
import { SEED_VERSION, defaultRecipes } from "./defaultRecipes";
import { sanitizeList, sanitizeRecipe } from "./schema";
import { STORAGE_KEYS } from "./storageKeys";

/**
 * Version of the stored data layout. Bump it and add a step to `migrations`
 * whenever a stored shape changes, so existing data is converted once.
 */
export const SCHEMA_VERSION = 1;

type Migration = (storage: Storage) => void;

/** Keyed by the version they migrate *to*. Version 1 is the original layout. */
const migrations: Record<number, Migration> = {};

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

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

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
