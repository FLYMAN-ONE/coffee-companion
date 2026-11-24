import { Sidebar } from "../components/layout/Sidebar";
import { BrewCalculator } from "../features/brew-calculator/BrewCalculator";
import { BrewLog } from "../features/log/BrewLog";
import { Recipes } from "../features/recipes/Recipes";
import { Timer } from "../features/timer/Timer";
import { useNavigation } from "./navigation";

/** iPad landscape layout: sidebar on the left, the active screen on the right. */
export function AppShell() {
  const { tab } = useNavigation();

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-app">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto p-8 pt-[max(2rem,env(safe-area-inset-top))]">
        {tab === "brew" && <BrewCalculator />}
        {tab === "recipes" && <Recipes />}
        {tab === "timer" && <Timer />}
        {tab === "log" && <BrewLog />}
      </main>
    </div>
  );
}
