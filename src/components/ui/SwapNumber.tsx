import { useLayoutEffect, useRef } from "react";

interface SwapNumberProps {
  text: string;
  /** Widest usual value (e.g. "00,0"): its width is reserved so units never shift. */
  template: string;
  /** When this changes (e.g. another recipe), the number does a short swap; otherwise it changes instantly. */
  swapKey?: string | null;
  className?: string;
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Right-aligned number with reserved width. No animation while values stream (dragging). */
export function SwapNumber({ text, template, swapKey, className = "" }: SwapNumberProps) {
  const el = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const node = el.current;
    if (!node) return;
    node.getAnimations().forEach((a) => a.cancel());
    node.animate(
      reduced()
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(6px)", filter: "blur(2px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
      { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
    );
  }, [swapKey]);

  return (
    <span className={`num inline-grid text-right ${className}`}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {template}
      </span>
      <span ref={el} className="col-start-1 row-start-1">
        {text}
      </span>
    </span>
  );
}
