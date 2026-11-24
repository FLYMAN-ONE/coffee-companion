import { navigationItems, useNavigation, type TabId } from "../../app/navigation";
import { useI18n } from "../../i18n";
import { Icon, type IconName } from "../ui/Icon";

/** Narrow icon rail: the app runs on an iPad in landscape only. */
export function Rail() {
  const { tab, go } = useNavigation();
  const { t } = useI18n();

  const item = (id: TabId, icon: IconName) => {
    const on = tab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => go(id)}
        aria-current={on ? "page" : undefined}
        className={`press flex w-[72px] flex-col items-center gap-[5px] rounded-[20px] pt-2.5 pb-2 text-[11.5px] font-semibold ${
          on ? "text-ink" : "text-mute"
        }`}
      >
        <span
          className={`grid h-8 w-[52px] place-items-center rounded-2xl transition-colors duration-200 ${
            on ? "bg-sage/14 text-sage" : ""
          }`}
        >
          <Icon name={icon} className="h-[22px] w-[22px]" />
        </span>
        {t.nav[id]}
      </button>
    );
  };

  return (
    <nav
      aria-label="Coffee Companion"
      className="flex w-[88px] shrink-0 flex-col items-center gap-1.5 border-r border-line pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]"
    >
      <div
        className="mb-[22px] grid h-12 w-12 place-items-center rounded-2xl bg-sage text-sage-ink"
        aria-hidden="true"
      >
        <Icon name="dripper" className="h-7 w-7" />
      </div>
      {navigationItems.map((n) => item(n.id, n.icon))}
      <div className="flex-1" />
      {item("settings", "settings")}
    </nav>
  );
}
