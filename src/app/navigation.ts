import type { IconName } from "../components/ui/Icon";

export type TabId = "brew" | "recipes" | "timer" | "log";

export interface NavigationItem {
  id: TabId;
  label: string;
  short: string;
  icon: IconName;
}

export const navigationItems: NavigationItem[] = [
  { id: "brew", label: "Brew Calculator", short: "Brew", icon: "coffee" },
  { id: "recipes", label: "Recipes", short: "Recipes", icon: "book" },
  { id: "timer", label: "Timer", short: "Timer", icon: "timer" },
  { id: "log", label: "Brew Log", short: "Log", icon: "log" },
];
