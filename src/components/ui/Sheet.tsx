import { useEffect, type ReactNode } from "react";

interface SheetProps {
  label: string;
  onClose?: () => void;
  children: ReactNode;
  width?: string;
  /** z-index layer: sheets over the focus timer need a higher one. */
  layer?: "base" | "top";
  /** Delay before the sheet appears (ms), e.g. to let the carafe fill first. */
  delayMs?: number;
}

/** Centered panel over a blurred scrim. Escape and a tap on the scrim close it when `onClose` is set. */
export function Sheet({
  label,
  onClose,
  children,
  width = "w-[560px]",
  layer = "base",
  delayMs = 0,
}: SheetProps) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`motion-fade fixed inset-0 grid place-items-center bg-[#0b0a08]/62 p-6 backdrop-blur-[18px] ${
        layer === "top" ? "z-[70]" : "z-50"
      }`}
      style={{ animation: `fade-in 300ms var(--ease-out) ${delayMs}ms both` }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`motion-fade flex max-h-[92dvh] max-w-full flex-col gap-5 overflow-y-auto rounded-[32px] bg-surface p-7 no-scrollbar ${width}`}
        style={{ animation: `sheet-in 500ms var(--ease-spring) ${delayMs}ms both` }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
