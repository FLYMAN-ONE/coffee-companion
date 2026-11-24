import { useEffect, useMemo, type ReactNode } from "react";
import { STORAGE_KEYS } from "../data/storageKeys";
import { useLocalStorage } from "../lib/storage";
import { I18nContext, detectLang, dictionaries, isLang, type Lang } from "./i18n";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>(STORAGE_KEYS.lang, detectLang(), (raw) =>
    isLang(raw) ? raw : detectLang()
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ t: dictionaries[lang], lang, setLang }), [lang, setLang]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
