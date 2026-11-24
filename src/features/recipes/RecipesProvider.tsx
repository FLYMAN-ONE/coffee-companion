import { useCallback, useMemo, useState, type ReactNode } from "react";
import { defaultRecipes } from "../../data/defaultRecipes";
import { sanitizeList, sanitizeRecipe, upsert } from "../../data/schema";
import { STORAGE_KEYS } from "../../data/storageKeys";
import { localizeRecipe, useI18n } from "../../i18n";
import { useLocalStorage } from "../../lib/storage";
import type { Recipe } from "../../types";
import { RecipesContext } from "./recipesStore";

const sanitize = (raw: unknown) => sanitizeList(raw, sanitizeRecipe);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const [storedRecipes, setRecipes] = useLocalStorage<Recipe[]>(
    STORAGE_KEYS.recipes,
    defaultRecipes,
    sanitize
  );
  const [editing, setEditing] = useState<Recipe | null>(null);

  const recipes = useMemo(() => storedRecipes.map((r) => localizeRecipe(r, lang)), [storedRecipes, lang]);

  const saveRecipe = useCallback((r: Recipe) => setRecipes((list) => upsert(list, r)), [setRecipes]);
  const deleteRecipe = useCallback(
    (id: string) => setRecipes((list) => list.filter((r) => r.id !== id)),
    [setRecipes]
  );
  const toggleFavorite = useCallback(
    (id: string) =>
      setRecipes((list) => list.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r))),
    [setRecipes]
  );
  const importRecipes = useCallback(
    (items: Recipe[]) => setRecipes((list) => items.reduce(upsert, list)),
    [setRecipes]
  );
  const closeEditor = useCallback(() => setEditing(null), []);

  const value = useMemo(
    () => ({
      recipes,
      storedRecipes,
      saveRecipe,
      deleteRecipe,
      toggleFavorite,
      importRecipes,
      editing,
      openEditor: setEditing,
      closeEditor,
    }),
    [recipes, storedRecipes, saveRecipe, deleteRecipe, toggleFavorite, importRecipes, editing, closeEditor]
  );

  return <RecipesContext value={value}>{children}</RecipesContext>;
}
