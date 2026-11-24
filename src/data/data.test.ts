import { beforeEach, describe, expect, it } from "vitest";
import { buildBackup, parseBackup } from "./backup";
import { SEED_VERSION, defaultRecipes } from "./defaultRecipes";
import { newLogEntry, newRecipe } from "./factories";
import { SCHEMA_VERSION, mergeSeed, prepareStorage } from "./migrations";
import { DEFAULT_PREPARE } from "../features/prepare/logic/dosing";
import { sanitizeLog, sanitizePrepare, sanitizeRecipe, sanitizeSettings, upsert } from "./schema";
import { STORAGE_KEYS } from "./storageKeys";

const userRecipe = newRecipe({ id: "user-1", name: "Mine", favorite: true });

describe("sanitizers", () => {
  it("keeps valid records unchanged", () => {
    for (const r of defaultRecipes) expect(sanitizeRecipe(r)).toEqual(r);
    const log = newLogEntry({ beans: "Kenya", rating: 4, tastes: ["Fruity"] });
    expect(sanitizeLog(log)).toEqual(log);
  });

  it("drops records without id or name", () => {
    expect(sanitizeRecipe({ id: "x", name: "  " })).toBeNull();
    expect(sanitizeRecipe({ name: "x" })).toBeNull();
    expect(sanitizeRecipe("nope")).toBeNull();
    expect(sanitizeLog({ id: "x", date: "not a date" })).toBeNull();
  });

  it("repairs bad fields with method defaults", () => {
    const r = sanitizeRecipe({
      id: "x",
      name: "X",
      method: "chemex",
      dose: "60",
      grind: "Powder",
      steps: [{}],
    });
    expect(r).toMatchObject({ method: "chemex", dose: 60, grind: "Medium", favorite: false });
    expect(r!.steps).toHaveLength(1);
    expect(r!.steps[0]).toMatchObject({ seconds: 30, waterPct: 100 });
    expect(sanitizeRecipe({ id: "x", name: "X", method: "siphon" })!.method).toBe("other");
  });

  it("clamps out-of-range numbers", () => {
    const log = sanitizeLog({ id: "x", date: "2026-01-01T00:00:00Z", rating: 9, tempC: 400 });
    expect(log).toMatchObject({ rating: 5, tempC: 100 });
  });

  it("repairs the prepare state and settings", () => {
    expect(sanitizePrepare(null, DEFAULT_PREPARE)).toBe(DEFAULT_PREPARE);
    expect(
      sanitizePrepare({ method: "moka", coffee: 16, lock: "nope", recipeId: 3 }, DEFAULT_PREPARE)
    ).toEqual({
      ...DEFAULT_PREPARE,
      recipeId: null,
      method: "moka",
      coffee: 16,
      lock: "ratio",
    });
    expect(sanitizeSettings(undefined)).toEqual({ sound: true });
    expect(sanitizeSettings({ sound: false })).toEqual({ sound: false });
  });

  it("upserts by id, new items first", () => {
    const a = { id: "a", v: 1 };
    const b = { id: "b", v: 1 };
    expect(upsert([a], b)).toEqual([b, a]);
    expect(upsert([a, b], { id: "a", v: 2 })).toEqual([{ id: "a", v: 2 }, b]);
  });
});

describe("mergeSeed", () => {
  it("refreshes builtin recipes, keeps favorites and user recipes", () => {
    const stale = { ...defaultRecipes[1], name: "Old", favorite: true };
    const merged = mergeSeed([stale, userRecipe]);
    expect(merged).toHaveLength(defaultRecipes.length + 1);
    const chemex = merged.find((r) => r.id === stale.id)!;
    expect(chemex.name).toBe(defaultRecipes[1].name);
    expect(chemex.favorite).toBe(true);
    expect(merged.at(-1)).toEqual(userRecipe);
  });
});

describe("prepareStorage", () => {
  beforeEach(() => localStorage.clear());

  it("seeds a fresh install", () => {
    prepareStorage();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.recipes)!)).toEqual(defaultRecipes);
    expect(localStorage.getItem(STORAGE_KEYS.seed)).toBe(String(SEED_VERSION));
    expect(localStorage.getItem(STORAGE_KEYS.schema)).toBe(String(SCHEMA_VERSION));
  });

  it("keeps user data from an existing install", () => {
    const log = newLogEntry();
    localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify([...defaultRecipes, userRecipe]));
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify([log]));
    localStorage.setItem(STORAGE_KEYS.seed, "1");
    prepareStorage();
    const recipes = JSON.parse(localStorage.getItem(STORAGE_KEYS.recipes)!);
    expect(recipes).toContainEqual(userRecipe);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.logs)!)).toEqual([log]);
  });

  it("does nothing when the seed is current", () => {
    localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify([userRecipe]));
    localStorage.setItem(STORAGE_KEYS.seed, String(SEED_VERSION));
    prepareStorage();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.recipes)!)).toEqual([userRecipe]);
  });

  it("migrates the old calculator to the prepare state (v2)", () => {
    localStorage.setItem(
      "cc:calc:v1",
      JSON.stringify({ dose: 75, water: 200, coffee: 15, method: "aeropress" })
    );
    prepareStorage();
    expect(localStorage.getItem("cc:calc:v1")).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.prepare)!)).toEqual({
      recipeId: null,
      method: "aeropress",
      water: 200,
      ratio: 13.3,
      coffee: 15,
      lock: "ratio",
    });
  });

  it("does not migrate twice", () => {
    localStorage.setItem(STORAGE_KEYS.schema, String(SCHEMA_VERSION));
    localStorage.setItem("cc:calc:v1", JSON.stringify({ dose: 75, water: 200 }));
    prepareStorage();
    expect(localStorage.getItem(STORAGE_KEYS.prepare)).toBeNull();
  });

  it("survives corrupted stored JSON", () => {
    localStorage.setItem(STORAGE_KEYS.recipes, "{broken");
    expect(() => prepareStorage()).not.toThrow();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.recipes)!)).toEqual(defaultRecipes);
  });
});

describe("backup", () => {
  it("round-trips recipes and logs", () => {
    const log = newLogEntry({ beans: "Ethiopia" });
    const text = JSON.stringify(buildBackup([userRecipe], [log]));
    expect(parseBackup(text)).toEqual({ recipes: [userRecipe], logs: [log] });
  });

  it("rejects invalid or empty files", () => {
    expect(() => parseBackup("not json")).toThrow();
    expect(() => parseBackup("{}")).toThrow();
    expect(() => parseBackup(JSON.stringify({ recipes: [{ id: "x" }] }))).toThrow();
  });

  it("skips invalid items but keeps the valid ones", () => {
    const parsed = parseBackup(JSON.stringify({ recipes: [userRecipe, { foo: 1 }], logs: "nope" }));
    expect(parsed.recipes).toEqual([userRecipe]);
    expect(parsed.logs).toEqual([]);
  });
});
