import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../lib/storage";
import { defaultRecipes } from "../data/defaultRecipes";
import type { Recipe } from "../types";
import { en, type Dict } from "./en";
import { it, builtinIt } from "./it";

export type Lang = "en" | "it";

export const languages: { id: Lang; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "it", label: "Italiano", short: "IT" },
];

const dicts: Record<Lang, Dict> = { en, it };

const detect = (): Lang =>
  typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("it") ? "it" : "en";

interface I18n {
  t: Dict;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>("cc:lang:v1", detect());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ t: dicts[lang] ?? en, lang, setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside LanguageProvider");
  return v;
}

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
