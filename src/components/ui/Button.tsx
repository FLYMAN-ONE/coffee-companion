import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink font-semibold active:brightness-90",
  secondary: "bg-soft text-ink border border-line active:bg-raise",
  ghost: "text-mute active:bg-soft active:text-ink",
  danger: "bg-danger/15 text-danger border border-danger/30 active:bg-danger/25",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-base gap-2",
  lg: "h-16 px-8 text-xl gap-3",
  icon: "h-12 w-12",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center whitespace-nowrap justify-center rounded-2xl transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon ? <Icon name={icon} className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} filled={icon === "play"} /> : null}
      {children}
    </button>
  );
}
