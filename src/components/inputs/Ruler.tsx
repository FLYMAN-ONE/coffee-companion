import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export interface RulerScale {
  min: number;
  max: number;
  /** value step between two ticks */
  step: number;
  /** pixels between two ticks */
  px: number;
  /** a long tick every `major` */
  major: number;
  /** a number label every `label` */
  label: number;
}

interface RulerProps extends RulerScale {
  value: number;
  onChange: (v: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  formatLabel?: (v: number) => string;
  ariaLabel: string;
  ariaValueText?: string;
  size?: "lg" | "sm";
}

const SETTLE = "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)";
/** Past min/max the track follows the finger with resistance, up to this many pixels. */
const RUBBER_MAX = 40;
const RUBBER_FACTOR = 0.3;
const isMultiple = (v: number, of: number) => Math.abs(v / of - Math.round(v / of)) < 1e-6;

/**
 * Horizontal ruler under a fixed centre pointer. The track follows the finger
 * 1:1 (no stepping); the value is the nearest tick and changes with no animation.
 * On release the track settles onto that tick (at most half a tick away).
 */
export function Ruler({
  value,
  min,
  max,
  step,
  px,
  major,
  label,
  onChange,
  onDragStart,
  onDragEnd,
  formatLabel = (v) => String(Math.round(v * 10) / 10),
  ariaLabel,
  ariaValueText,
  size = "lg",
}: RulerProps) {
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const drag = useRef<{ x: number; pos: number } | null>(null);
  const pos = useRef(value);
  const emitted = useRef(value);
  /** Width the track was last placed for; -1 forces the first placement. */
  const placedWidth = useRef(-1);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => +(Math.round(clamp(v) / step) * step).toFixed(3);

  const place = (p: number, settle: boolean) => {
    const el = track.current;
    if (!el) return;
    // Measure at call time: the observed `width` state can lag right after mount.
    const w = box.current?.clientWidth || width;
    el.style.transition = settle ? SETTLE : "none";
    el.style.transform = `translateX(${w / 2 - ((p - min) / step) * px}px)`;
  };

  // Follow the value from outside (recipe change, other field) or a resize, unless the finger
  // is on it. Skip when nothing changed, so the settle transition after a release is not cut short.
  useLayoutEffect(() => {
    if (drag.current) return;
    if (pos.current === value && placedWidth.current === width) return;
    pos.current = value;
    emitted.current = value;
    placedWidth.current = width;
    place(value, false);
  });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ticks = useMemo(() => {
    const n = Math.round((max - min) / step);
    return Array.from({ length: n + 1 }, (_, i) => {
      const v = +(min + i * step).toFixed(3);
      return { v, x: i * px, major: isMultiple(v, major), label: isMultiple(v, label) };
    });
  }, [min, max, step, px, major, label]);

  const emit = (v: number) => {
    if (v === emitted.current) return;
    emitted.current = v;
    onChange(v);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, pos: pos.current };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // The pointer may already be gone (cancelled touch); dragging still works without capture.
    }
    onDragStart?.();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const raw = d.pos - ((e.clientX - d.x) / px) * step;
    const p = clamp(raw);
    pos.current = p;
    // Rubber-band past the ends: the value stays clamped, only the track stretches.
    const overPx = ((raw - p) / step) * px;
    const rubberPx = Math.sign(overPx) * Math.min(RUBBER_MAX, Math.abs(overPx) * RUBBER_FACTOR);
    place(p + (rubberPx / px) * step, false);
    emit(snap(p));
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    pos.current = emitted.current;
    place(emitted.current, true);
    onDragEnd?.();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    emit(snap(value + delta));
  };

  const big = size === "lg";
  return (
    <div className={`relative rounded-3xl ${big ? "bg-surface pt-3.5 pb-2.5" : "bg-surface pt-2 pb-1.5"}`}>
      <div
        ref={box}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={ariaValueText}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative cursor-grab touch-none overflow-hidden rounded-2xl active:cursor-grabbing ${big ? "h-[132px]" : "h-[92px]"}`}
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)",
        }}
      >
        {/* A new scale (another field) fades in so the change reads as one, without moving. */}
        <div
          ref={track}
          className="motion-fade absolute inset-y-0 left-0 will-change-transform"
          style={{ animation: "fade-in 120ms var(--ease-out)" }}
        >
          {ticks.map((t) => {
            const lit = t.v <= value + 1e-6;
            return (
              <div key={t.v}>
                <i
                  className={`absolute -ml-0.5 w-1 rounded-sm ${lit ? "bg-accent" : "bg-accent-dim"}`}
                  style={{
                    left: t.x,
                    bottom: big ? 16 : 8,
                    height: big ? (t.major ? 64 : 40) : t.major ? 40 : 24,
                  }}
                />
                {t.label ? (
                  <span
                    className={`num absolute -translate-x-1/2 font-medium ${big ? "top-1 text-[22px]" : "top-0.5 text-[15px]"} ${
                      lit ? "text-accent" : "text-faint"
                    }`}
                    style={{ left: t.x }}
                  >
                    {formatLabel(t.v)}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mx-auto mt-0.5 h-0 w-0 border-x-[9px] border-b-[12px] border-x-transparent border-b-accent" />
    </div>
  );
}
