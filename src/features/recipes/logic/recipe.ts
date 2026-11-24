import type { Recipe } from "../../../types";

/** Total duration of a recipe's steps, in seconds. */
export const totalSeconds = (r: Pick<Recipe, "steps">): number => r.steps.reduce((s, x) => s + x.seconds, 0);
