import type { LogEntry, Recipe } from "../types";
import { sanitizeList, sanitizeLog, sanitizeRecipe } from "./schema";

export const BACKUP_VERSION = 1;

export interface Backup {
  app: "coffee-companion";
  version: number;
  recipes: Recipe[];
  logs: LogEntry[];
}

export const buildBackup = (recipes: Recipe[], logs: LogEntry[]): Backup => ({
  app: "coffee-companion",
  version: BACKUP_VERSION,
  recipes,
  logs,
});

export const backupFileName = (date = new Date()): string =>
  `coffee-companion-backup-${date.toISOString().slice(0, 10)}.json`;

/** Parse a backup file. Throws when it is not JSON or holds nothing usable. */
export function parseBackup(text: string): { recipes: Recipe[]; logs: LogEntry[] } {
  const data: unknown = JSON.parse(text);
  const obj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const recipes = sanitizeList(obj.recipes, sanitizeRecipe);
  const logs = sanitizeList(obj.logs, sanitizeLog);
  if (!recipes.length && !logs.length) throw new Error("Backup holds no recipes or logs");
  return { recipes, logs };
}
