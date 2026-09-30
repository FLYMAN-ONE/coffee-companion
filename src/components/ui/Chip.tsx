import type { ReactNode } from "react";

interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function Chip({ selected = false, disabled = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`h-11 shrink-0 rounded-full border px-5 text-base font-medium transition active:scale-95 disabled:opacity-40 ${
        selected
          ? "border-accent bg-accent/15 text-accent"
          : "border-line bg-soft text-mute active:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
