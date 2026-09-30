import { navigationItems } from "../../app/navigation";
import type { TabId } from "../../app/navigation";
import { Icon } from "../ui/Icon";
import { LanguageSwitch } from "../ui/LanguageSwitch";
import { useI18n } from "../../i18n";

interface SidebarProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

/** Icon rail on iPad portrait, full sidebar from landscape width (lg). */
export function Sidebar({ active, onChange }: SidebarProps) {
  const { t } = useI18n();
  return (
    <aside className="hidden h-full shrink-0 flex-col border-r border-line bg-card px-3 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] md:flex lg:w-60 lg:px-4">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-ink">
          <Icon name="coffee" className="h-7 w-7" />
        </div>
        <span className="hidden text-xl font-semibold leading-tight lg:block">
          Coffee
          <br />
          Companion
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {navigationItems.map((item) => {
          const on = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-current={on ? "page" : undefined}
              className={`flex h-16 items-center justify-center gap-4 rounded-2xl px-4 text-lg font-medium transition active:scale-[0.98] lg:justify-start ${
                on ? "bg-accent/15 text-accent" : "text-mute active:bg-soft active:text-ink"
              }`}
            >
              <Icon name={item.icon} className="h-7 w-7 shrink-0" />
              <span className="hidden lg:block">{t.nav[item.id].label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="hidden lg:block">
          <LanguageSwitch />
        </div>
        <div className="lg:hidden">
          <LanguageSwitch compact />
        </div>
      </div>
    </aside>
  );
}
