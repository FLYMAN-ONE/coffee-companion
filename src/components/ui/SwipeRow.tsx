import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

interface SwipeRowProps {
  children: ReactNode;
  /** Whether the action is revealed (controlled, so only one row in a list is open). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Label of the revealed delete action. */
  actionLabel: string;
  onAction: () => void;
}

/** Width of the revealed action. */
const ACTION_W = 104;
/** Movement (px) before a touch is read as a swipe or as a scroll. */
const SLOP = 8;
const SETTLE = "transform 260ms var(--ease-out)";

/**
 * Row that slides left under the finger (1:1) to reveal a delete action behind it.
 * Released past half the action it stays open; a fast flick also opens it.
 * Tapping the row while open closes it. Vertical drags are left to the list's scroll.
 */
export function SwipeRow({ children, open, onOpenChange, actionLabel, onAction }: SwipeRowProps) {
  const front = useRef<HTMLDivElement>(null);
  const action = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    x: number;
    y: number;
    base: number;
    mode: "pending" | "swipe" | "scroll";
    last: number;
    lastX: number;
    v: number;
  } | null>(null);
  /** Set after a swipe so the click that follows the release does not pick the row. */
  const swiped = useRef(false);
  const [removing, setRemoving] = useState(false);

  const place = (x: number, settle: boolean) => {
    const el = front.current;
    if (el) {
      el.style.transition = settle ? SETTLE : "none";
      el.style.transform = x ? `translateX(${x}px)` : "";
    }
    // The action fades in with the first pixels, so its rounded corners never peek at rest.
    if (action.current) action.current.style.opacity = String(Math.min(1, -x / 24));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const t = performance.now();
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      base: open ? -ACTION_W : 0,
      mode: "pending",
      last: t,
      lastX: e.clientX,
      v: 0,
    };
    swiped.current = false;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.mode === "scroll") return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.mode === "pending") {
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        g.mode = "scroll";
        return;
      }
      if (Math.abs(dx) <= SLOP) return;
      g.mode = "swipe";
      swiped.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // The pointer may already be gone; the swipe still works without capture.
      }
    }
    const t = performance.now();
    if (t > g.last) g.v = (e.clientX - g.lastX) / (t - g.last);
    g.last = t;
    g.lastX = e.clientX;
    let x = g.base + dx;
    // Resistance past both ends: right of rest, and beyond the action's width.
    if (x > 0) x *= 0.2;
    else if (x < -ACTION_W) x = -ACTION_W + (x + ACTION_W) * 0.3;
    place(x, false);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.mode !== "swipe") return;
    const x = g.base + (e.clientX - g.x);
    // A flick (px/ms) decides on its own; otherwise the position does.
    const next = g.v < -0.5 ? true : g.v > 0.5 ? false : x < -ACTION_W / 2;
    place(next ? -ACTION_W : 0, true);
    if (next !== open) onOpenChange(next);
  };

  const onPointerCancel = () => {
    const g = gesture.current;
    gesture.current = null;
    if (g?.mode === "swipe") place(g.base, true);
  };

  const remove = () => {
    setRemoving(true);
    window.setTimeout(onAction, 220);
  };

  // Follow `open` from outside (another row opened) when no finger is down.
  useLayoutEffect(() => {
    if (!gesture.current) place(open ? -ACTION_W : 0, true);
  }, [open]);

  return (
    // The row collapses (grid rows 1fr → 0fr) once deleted, so the rows below close the gap.
    <div
      className="grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)]"
      style={{ gridTemplateRows: removing ? "0fr" : "1fr", opacity: removing ? 0 : 1 }}
    >
      <div className="relative min-h-0 overflow-hidden rounded-[20px]">
        <div
          ref={action}
          className="absolute inset-y-0 right-0 flex items-stretch p-1 opacity-0"
          style={{ width: ACTION_W }}
          aria-hidden={!open}
        >
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={remove}
            className="press flex flex-1 flex-col items-center justify-center gap-1 rounded-[16px] bg-danger text-[12.5px] font-semibold text-app"
          >
            <Icon name="trash" className="h-5 w-5" />
            {actionLabel}
          </button>
        </div>
        <div
          ref={front}
          className="relative touch-pan-y bg-surface"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClickCapture={(e) => {
            if (swiped.current || open) {
              e.preventDefault();
              e.stopPropagation();
              swiped.current = false;
              if (open) onOpenChange(false);
            }
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
