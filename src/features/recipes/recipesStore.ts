import { createStore } from "../../lib/createStore";
import type { Recipe } from "../../types";

export interface RecipesStore {
  /** Recipes in the current language (seeded text translated). */
  recipes: Recipe[];
  /** Recipes as stored, for backups. */
  storedRecipes: Recipe[];
  saveRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  /** Merge recipes from a backup (same id replaces). */
  importRecipes: (list: Recipe[]) => void;

  /** Recipe open in the editor; may be new (not in `recipes` yet). */
  editing: Recipe | null;
  openEditor: (r: Recipe) => void;
  closeEditor: () => void;
}

export const [RecipesContext, useRecipes] = createStore<RecipesStore>("Recipes");
