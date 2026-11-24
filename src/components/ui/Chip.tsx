import type { ReactNode } from "react";
import type { MethodId } from "../../types";
import { Icon, type IconName } from "./Icon";

interface ChipProps {
  selected?: boolean;
  onClick: () => void;
  icon?: IconName | MethodId;
  /** Background for unselected chips: `surface` on the page, `raised` inside panels. */
  tone?: "surface" | "raised";
  children: ReactNode;
}

export function Chip({ selected = false, onClick, icon, tone = "surface", children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`press flex h-11 shrink-0 items-center gap-2 rounded-full text-sm font-semibold ${
        icon ? "pr-4 pl-3" : "px-4"
      } ${selected ? "bg-accent/14 text-accent" : `${tone === "raised" ? "bg-raised" : "bg-surface"} text-mute`}`}
    >
      {icon ? <Icon name={icon} className="h-5 w-5" /> : null}
      {children}
    </button>
  );
}
