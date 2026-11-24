import { useMemo, useState, type ReactNode } from "react";
import { NavigationContext, type TabId } from "./navigation";

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tab, go] = useState<TabId>("brew");
  const value = useMemo(() => ({ tab, go }), [tab]);
  return <NavigationContext value={value}>{children}</NavigationContext>;
}
