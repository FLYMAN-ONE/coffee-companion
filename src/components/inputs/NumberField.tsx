import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../ui/Icon";

interface NumberFieldProps {
  label?: string;
  value: number;
  unit?: string;
  step: number;
  min?: number;
  max?: number;
  decimals?: number;
  size?: "lg" | "md";
  onChange: (value: number) => void;
}

/** Hold a +/- button: fires once, then repeats while held. */
function useHoldRepeat(action: () => void) {
  const actionRef = useRef(action);
  useLayoutEffect(() => {
    actionRef.current = action;
  });
  const timers = useRef<{ t?: number; i?: number }>({});

  const stop = () => {
    window.clearTimeout(timers.current.t);
    window.clearInterval(timers.current.i);
  };
  useEffect(() => stop, []);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      actionRef.current();
      timers.current.t = window.setTimeout(() => {
        timers.current.i = window.setInterval(() => actionRef.current(), 70);
      }, 400);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}

export function NumberField({
  label,
  value,
  unit,
  step,
  min = 0,
  max = Infinity,
  decimals = 0,
  size = "md",
  onChange,
}: NumberFieldProps) {
  const fmt = (v: number) => String(Number(v.toFixed(decimals)));
  // What the user is typing; null when the field is not being edited (shows `value`).
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? fmt(value);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const round = (v: number) => Number(v.toFixed(decimals));
  const parse = (s: string) => parseFloat(s.replace(",", "."));

  const nudge = (dir: 1 | -1) => onChange(round(clamp(value + dir * step)));
  const dec = useHoldRepeat(() => nudge(-1));
  const inc = useHoldRepeat(() => nudge(1));

  const big = size === "lg";
  const btn = big ? "h-16 w-16" : "h-12 w-12";
  const btnClass = `${btn} press flex shrink-0 items-center justify-center rounded-2xl bg-raised text-ink`;

  return (
    <div className="flex flex-col gap-2">
      {label ? <span className="eyebrow">{label}</span> : null}
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Decrease ${label ?? ""}`} className={btnClass} {...dec}>
          <Icon name="minus" className={big ? "h-7 w-7" : "h-5 w-5"} />
        </button>

        <div
          className={`flex min-w-0 flex-1 items-baseline justify-center gap-2 rounded-2xl bg-raised px-3 focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)] ${
            big ? "h-16 items-center" : "h-12 items-center"
          }`}
        >
          <input
            type="text"
            inputMode="decimal"
            aria-label={label ?? unit}
            value={text}
            onFocus={(e) => {
              setDraft(fmt(value));
              e.target.select();
            }}
            onChange={(e) => {
              setDraft(e.target.value);
              const v = parse(e.target.value);
              if (!Number.isNaN(v) && v >= min && v <= max) onChange(round(v));
            }}
            onBlur={() => {
              const v = parse(text);
              if (!Number.isNaN(v)) onChange(round(clamp(v)));
              setDraft(null);
            }}
            className={`num w-full min-w-0 flex-1 bg-transparent text-center font-semibold text-ink outline-none ${
              big ? "text-4xl" : "text-xl"
            }`}
          />
          {unit ? (
            <span className={`shrink-0 text-mute ${big ? "text-xl" : "text-base"}`}>{unit}</span>
          ) : null}
        </div>

        <button type="button" aria-label={`Increase ${label ?? ""}`} className={btnClass} {...inc}>
          <Icon name="plus" className={big ? "h-7 w-7" : "h-5 w-5"} />
        </button>
      </div>
    </div>
  );
}
