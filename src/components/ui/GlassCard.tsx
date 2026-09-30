import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
}

export function GlassCard({ children, className = "", active = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-[28px] border bg-card p-6 transition ${
        active
          ? "border-accent/70 shadow-[0_0_30px_rgb(157_187_120_/_0.12)]"
          : "border-line"
      } ${className}`}
    >
      {children}
    </div>
  );
}
