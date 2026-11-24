import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * primary: full accent pill, one per view. tonal: tinted background + accent text.
 * text: label only. danger: tinted red. icon: square icon-only control.
 */
type Variant = "primary" | "tonal" | "text" | "danger" | "icon";
type Size = "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  active?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink active:brightness-95",
  tonal: "bg-accent/14 text-accent",
  text: "text-mute",
  danger: "bg-danger/13 text-danger",
  icon: "bg-raised text-mute",
};

const sizes: Record<Size, string> = {
  md: "h-13 px-[22px] text-[15.5px] gap-2.5 rounded-full",
  lg: "h-16 px-7 text-lg gap-3 rounded-full",
  xl: "h-18 px-10 text-xl gap-3 rounded-full",
};

export function Button({
  variant = "tonal",
  size = "md",
  icon,
  active = false,
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const shape =
    variant === "icon"
      ? `h-13 w-13 rounded-[18px] ${active ? "bg-accent/14 text-accent" : ""}`
      : `${sizes[size]} ${variant === "text" ? "px-3.5" : ""}`;
  return (
    <button
      type={type}
      className={`press inline-flex shrink-0 items-center justify-center whitespace-nowrap font-bold disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${shape} ${className}`}
      {...rest}
    >
      {icon ? (
        <Icon
          name={icon}
          filled={icon === "play" || (icon === "heart" && active)}
          className={size === "xl" ? "h-6.5 w-6.5" : "h-5.5 w-5.5"}
        />
      ) : null}
      {children}
    </button>
  );
}
