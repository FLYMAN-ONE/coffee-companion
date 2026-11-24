import { navigationItems, useNavigation } from "../../app/navigation";
import { useI18n } from "../../i18n";
import { Icon } from "../ui/Icon";
import { LanguageSwitch } from "../ui/LanguageSwitch";

/** Fixed sidebar (the app runs on an iPad in landscape only). */
export function Sidebar() {
  const { tab, go } = useNavigation();
  const { t } = useI18n();
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-card px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-ink">
          <Icon name="coffee" className="h-7 w-7" />
        </div>
        <span className="text-xl font-semibold leading-tight">
          Coffee
          <br />
          Companion
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {navigationItems.map((item) => {
          const on = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={on ? "page" : undefined}
              className={`flex h-16 items-center justify-start gap-4 rounded-2xl px-4 text-lg font-medium transition active:scale-[0.98] ${
                on ? "bg-accent/15 text-accent" : "text-mute active:bg-soft active:text-ink"
              }`}
            >
              <Icon name={item.icon} className="h-7 w-7 shrink-0" />
              <span>{t.nav[item.id]}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <LanguageSwitch />
      </div>
    </aside>
  );
}
