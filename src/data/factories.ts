import { uid } from "../lib/format";
import type { LogEntry, Recipe } from "../types";
import { getMethod } from "./methods";

/** A new, unsaved recipe. Method defaults fill whatever `init` leaves out. */
export function newRecipe(init: Partial<Recipe> = {}): Recipe {
  const m = getMethod(init.method ?? "v60");
  return {
    id: uid(),
    name: "",
    method: m.id,
    dose: m.dose,
    water: 250,
    tempC: m.tempC,
    grind: m.grind,
    notes: "",
    steps: [],
    favorite: false,
    createdAt: new Date().toISOString(),
    ...init,
  };
}

/** A new, unsaved log entry dated now. Method defaults fill whatever `init` leaves out. */
export function newLogEntry(init: Partial<LogEntry> = {}): LogEntry {
  const m = getMethod(init.method ?? "v60");
  return {
    id: uid(),
    date: new Date().toISOString(),
    method: m.id,
    recipeName: "",
    beans: "",
    dose: m.dose,
    water: 250,
    coffee: 15,
    tempC: m.tempC,
    grind: m.grind,
    timeSec: 0,
    rating: 0,
    tastes: [],
    notes: "",
    ...init,
  };
}
