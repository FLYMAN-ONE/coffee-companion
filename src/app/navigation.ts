import type { IconName } from "../components/ui/Icon";

export type TabId = "brew" | "recipes" | "timer" | "log";

export interface NavigationItem {
  id: TabId;
  icon: IconName;
}

export const navigationItems: NavigationItem[] = [
  { id: "brew", icon: "coffee" },
  { id: "recipes", icon: "book" },
  { id: "timer", icon: "timer" },
  { id: "log", icon: "log" },
];
