import { Rail } from "../components/layout/Rail";
import { LogScreen } from "../features/log/LogScreen";
import { PrepareScreen } from "../features/prepare/PrepareScreen";
import { RecipesScreen } from "../features/recipes/RecipesScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { FocusScreen } from "../features/timer/FocusScreen";
import { useTimerSession } from "../features/timer/timerStore";
import { useNavigation } from "./navigation";

/** iPad landscape layout: icon rail + the active screen; the focus timer covers both while brewing. */
export function AppShell() {
  const { tab } = useNavigation();
  const { status } = useTimerSession();

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-app">
      <Rail />
      <main
        key={tab}
        className="screen-in motion-fade min-h-0 min-w-0 flex-1 p-7 pt-[max(28px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]"
      >
        {tab === "prepare" && <PrepareScreen />}
        {tab === "recipes" && <RecipesScreen />}
        {tab === "log" && <LogScreen />}
        {tab === "settings" && <SettingsScreen />}
      </main>
      {status !== "idle" ? <FocusScreen /> : null}
    </div>
  );
}
