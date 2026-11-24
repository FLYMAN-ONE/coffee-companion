import { createStore } from "../lib/createStore";
import { en, type Dict } from "./en";
import { it } from "./it";

export type Lang = "en" | "it";

export const languages: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "it", label: "Italiano" },
];

export const dictionaries: Record<Lang, Dict> = { en, it };

export const isLang = (v: unknown): v is Lang => languages.some((l) => l.id === v);

export const detectLang = (): Lang =>
  typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("it") ? "it" : "en";

export interface I18n {
  t: Dict;
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const [I18nContext, useI18n] = createStore<I18n>("I18n");
