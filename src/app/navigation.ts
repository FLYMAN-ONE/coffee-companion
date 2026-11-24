import type { IconName } from "../components/ui/Icon";
import { createStore } from "../lib/createStore";

export type TabId = "prepare" | "recipes" | "log" | "settings";

export interface NavigationItem {
  id: TabId;
  icon: IconName;
}

/** Main sections in the rail; settings sits apart at the bottom. */
export const navigationItems: NavigationItem[] = [
  { id: "prepare", icon: "prepare" },
  { id: "recipes", icon: "book" },
  { id: "log", icon: "journal" },
];

export interface NavigationStore {
  tab: TabId;
  go: (tab: TabId) => void;
}

export const [NavigationContext, useNavigation] = createStore<NavigationStore>("Navigation");
