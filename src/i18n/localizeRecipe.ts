import { defaultRecipes } from "../data/defaultRecipes";
import type { Recipe } from "../types";
import type { Lang } from "./i18n";
import { builtinIt } from "./it";

const originals = new Map(defaultRecipes.map((r) => [r.id, r]));

/**
 * Seeded recipes are stored in English. While the user has not edited a field,
 * show its translation; edited text is always shown as written.
 */
export function localizeRecipe(r: Recipe, lang: Lang): Recipe {
  if (lang === "en") return r;
  const orig = originals.get(r.id);
  const tr = builtinIt.recipes[r.id];
  if (!orig || !tr) return r;
  return {
    ...r,
    name: r.name === orig.name ? tr.name : r.name,
    notes: r.notes === orig.notes ? tr.notes : r.notes,
    steps: r.steps.map((s) => {
      const origStep = orig.steps.find((o) => o.id === s.id);
      const label = builtinIt.steps[s.id];
      return origStep && label && s.label === origStep.label ? { ...s, label } : s;
    }),
  };
}
