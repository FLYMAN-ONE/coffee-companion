import type { BrewValues } from "../features/brew-calculator/types";
import type { Grind, LogEntry, MethodId, Recipe, RecipeStep } from "../types";
import { getMethod, grinds, methods } from "./methods";

/*
 * Sanitizers for anything read from storage or from a backup file.
 * They never throw: invalid fields fall back to a sensible default, and a record
 * without an id (or a recipe without a name) is dropped.
 */

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);

const isoDate = (v: unknown, fallback: string): string =>
  typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : fallback;

const methodIds = methods.map((m) => m.id);
const method = (v: unknown): MethodId => (methodIds.includes(v as MethodId) ? (v as MethodId) : "other");
const grind = (v: unknown, fallback: Grind): Grind => (grinds.includes(v as Grind) ? (v as Grind) : fallback);

export function sanitizeStep(x: unknown, index: number): RecipeStep | null {
  if (!isObj(x)) return null;
  return {
    id: str(x.id) || `step-${index}`,
    label: str(x.label),
    seconds: Math.round(num(x.seconds, 30, 1, 3600)),
    waterPct: num(x.waterPct, 100, 0, 100),
  };
}

export function sanitizeRecipe(x: unknown): Recipe | null {
  if (!isObj(x) || !str(x.id) || !str(x.name).trim()) return null;
  const m = getMethod(method(x.method));
  return {
    id: str(x.id),
    name: str(x.name),
    method: m.id,
    dose: num(x.dose, m.dose, 1, 1000),
    water: num(x.water, 250, 1, 5000),
    tempC: num(x.tempC, m.tempC, 0, 100),
    grind: grind(x.grind, m.grind),
    notes: str(x.notes),
    steps: sanitizeList(x.steps, sanitizeStep),
    favorite: x.favorite === true,
    createdAt: isoDate(x.createdAt, new Date(0).toISOString()),
  };
}

export function sanitizeLog(x: unknown): LogEntry | null {
  if (!isObj(x) || !str(x.id) || Number.isNaN(Date.parse(str(x.date)))) return null;
  const m = getMethod(method(x.method));
  return {
    id: str(x.id),
    date: str(x.date),
    method: m.id,
    recipeName: str(x.recipeName),
    beans: str(x.beans),
    dose: num(x.dose, m.dose, 1, 1000),
    water: num(x.water, 250, 1, 5000),
    coffee: num(x.coffee, 15, 0, 500),
    tempC: num(x.tempC, m.tempC, 0, 100),
    grind: grind(x.grind, m.grind),
    timeSec: Math.round(num(x.timeSec, 0, 0, 999 * 60)),
    rating: Math.round(num(x.rating, 0, 0, 5)),
    tastes: Array.isArray(x.tastes) ? x.tastes.filter((t): t is string => typeof t === "string") : [],
    notes: str(x.notes),
  };
}

export function sanitizeBrewValues(x: unknown, fallback: BrewValues): BrewValues {
  if (!isObj(x)) return fallback;
  return {
    method: method(x.method),
    dose: num(x.dose, fallback.dose, 1, 1000),
    water: num(x.water, fallback.water, 1, 5000),
    coffee: num(x.coffee, fallback.coffee, 0, 500),
  };
}

/** Sanitize every item of a list, dropping invalid ones. A non-array gives an empty list. */
export function sanitizeList<T>(raw: unknown, fn: (x: unknown, index: number) => T | null): T[] {
  return Array.isArray(raw) ? raw.map(fn).filter((x): x is T => x !== null) : [];
}

/** Insert or replace by id; new items go first. */
export const upsert = <T extends { id: string }>(list: T[], item: T): T[] =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
