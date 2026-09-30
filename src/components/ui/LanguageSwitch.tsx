import { languages, useI18n } from "../../i18n";

/** Segmented EN | IT toggle. `compact` shows short codes only. */
export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className="flex rounded-2xl border border-line bg-soft p-1"
    >
      {languages.map((l) => (
        <button
          key={l.id}
          type="button"
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className={`h-11 flex-1 rounded-xl px-3 text-base font-medium transition active:scale-95 ${
            lang === l.id ? "bg-accent text-accent-ink" : "text-mute active:text-ink"
          }`}
        >
          {compact ? l.short : l.label}
        </button>
      ))}
    </div>
  );
}
