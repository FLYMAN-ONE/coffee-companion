import { navigationItems } from "../../app/navigation";
import type { TabId } from "../../app/navigation";
import { Icon } from "../ui/Icon";
import { useI18n } from "../../i18n";

interface TabBarProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

/** Bottom bar for narrow screens (phones). */
export function TabBar({ active, onChange }: TabBarProps) {
  const { t } = useI18n();
  return (
    <nav className="flex shrink-0 justify-around border-t border-line bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      {navigationItems.map((item) => {
        const on = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-current={on ? "page" : undefined}
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs ${
              on ? "text-accent" : "text-mute"
            }`}
          >
            <Icon name={item.icon} className="h-6 w-6" />
            {t.nav[item.id].short}
          </button>
        );
      })}
    </nav>
  );
}
