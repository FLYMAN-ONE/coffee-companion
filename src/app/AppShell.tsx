import { Sidebar } from "../components/layout/Sidebar";
import { TabBar } from "../components/layout/TabBar";
import { BrewCalculator } from "../features/brew-calculator/BrewCalculator";
import { Recipes } from "../features/recipes/Recipes";
import { Timer } from "../features/timer/Timer";
import { BrewLog } from "../features/log/BrewLog";
import { LanguageSwitch } from "../components/ui/LanguageSwitch";
import { useApp } from "./store";

export function AppShell() {
  const { tab, go, toastMessage } = useApp();

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-app md:flex-row">
      <Sidebar active={tab} onChange={go} />

      <main className="min-h-0 flex-1 overflow-y-auto p-4 pt-[max(1rem,env(safe-area-inset-top))] md:p-6 lg:p-8">
        <div className="mb-4 flex justify-end md:hidden">
          <div className="w-32">
            <LanguageSwitch compact />
          </div>
        </div>
        {tab === "brew" && <BrewCalculator />}
        {tab === "recipes" && <Recipes />}
        {tab === "timer" && <Timer />}
        {tab === "log" && <BrewLog />}
      </main>

      <TabBar active={tab} onChange={go} />

      {toastMessage ? (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center px-4"
        >
          <div className="rounded-full border border-line bg-raise px-6 py-3 text-base shadow-card">
            {toastMessage}
          </div>
        </div>
      ) : null}
    </div>
  );
}
