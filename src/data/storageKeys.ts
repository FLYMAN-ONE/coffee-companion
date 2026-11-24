/**
 * Every localStorage key the app uses. Changing the shape of stored data needs
 * a migration in `migrations.ts` (and usually a bump of SCHEMA_VERSION).
 */
export const STORAGE_KEYS = {
  schema: "cc:schema",
  recipes: "cc:recipes:v1",
  logs: "cc:logs:v1",
  prepare: "cc:prepare:v2",
  seed: "cc:seed:v1",
  lang: "cc:lang:v1",
  settings: "cc:settings:v1",
} as const;
