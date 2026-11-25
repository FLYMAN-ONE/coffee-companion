import { useId } from "react";
import { levelAt, ribbonPaths, type SequenceStep } from "./logic/sequence";

interface WaterRibbonProps {
  steps: SequenceStep[];
  /** Total water (ml), for the labels above each pour. */
  water: number;
  /** Height in px, labels included. */
  height: number;
  /** Background the ribbon sits on: paints the gaps between steps. */
  gap: "app" | "surface" | "focus";
  /** Font size of the ml labels. */
  labelSize?: number;
  /** Brew progress as a fraction of the width: lit up to here, dimmed after, with a marker. */
  progress?: number;
  /** Marker turns accent and pulses (step about to end). */
  warn?: boolean;
}

const GAP = { app: "bg-app", surface: "bg-surface", focus: "bg-focus" } as const;
const glow = "drop-shadow(0 0 8px color-mix(in srgb, var(--color-water) 55%, transparent))";

/**
 * The recipe as a ribbon of water: its thickness is the water in the carafe, rising during
 * each pour and flat while waiting, with the total to reach above every pour. Used in
 * Prepare, in the focus timer (with progress) and in the recipe editor.
 */
export function WaterRibbon({
  steps,
  water,
  height: H,
  gap,
  labelSize = 22,
  progress,
  warn = false,
}: WaterRibbonProps) {
  const id = useId();
  // 1000-unit wide box stretched to the container; the vertical axis is in px (1:1).
  const W = 1000;
  const top = labelSize + 12;
  const y = (pct: number) => H - 8 - (pct / 100) * (H - 8 - top);
  const { area, line } = ribbonPaths(steps, W, y, H);
  const ml = (pct: number) => Math.round((pct / 100) * water);
  const tracked = progress !== undefined;
  const lit = Math.min(1, Math.max(0, progress ?? 1));

  return (
    <div className="relative" style={{ height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--color-water)", stopOpacity: 0.55 }} />
            <stop offset="1" style={{ stopColor: "var(--color-water-deep)", stopOpacity: 0.12 }} />
          </linearGradient>
          <clipPath id={`${id}c`}>
            <rect x={-20} y={-40} width={lit * W + 20} height={H + 80} />
          </clipPath>
        </defs>
        {tracked ? (
          <g>
            <path d={area} fill="var(--color-water)" fillOpacity={0.07} />
            <path
              d={line}
              fill="none"
              stroke="var(--color-glass)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ) : null}
        <g clipPath={tracked ? `url(#${id}c)` : undefined}>
          <path d={area} fill={`url(#${id}g)`} />
          <path
            d={line}
            fill="none"
            stroke="var(--color-water)"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: glow }}
          />
        </g>
      </svg>

      {steps.slice(1).map((s) => (
        <i
          key={s.id}
          aria-hidden="true"
          className={`absolute top-0 bottom-0 w-[3px] -translate-x-1/2 ${GAP[gap]}`}
          style={{ left: `${s.x0 * 100}%` }}
        />
      ))}

      {steps.map((s) => {
        if (!s.pour) return null;
        const end = s.x1 > 0.92;
        const reached = !tracked || s.x0 < lit;
        return (
          <div
            key={s.id}
            className="absolute flex flex-col"
            style={{
              left: `${s.x1 * 100}%`,
              top: y(s.toPct),
              transform: end ? "translate(calc(-100% + 7px), -100%)" : "translate(-50%, -100%)",
              alignItems: end ? "flex-end" : "center",
            }}
          >
            <span
              className={`num pb-1.5 leading-none font-medium whitespace-nowrap transition-colors duration-300 ${
                reached ? "text-ink" : "text-faint"
              }`}
              style={{ fontSize: labelSize }}
            >
              {ml(s.toPct)}
              <small className="ml-0.5 font-sans text-[0.52em] font-semibold tracking-normal text-mute">
                ml
              </small>
            </span>
            {tracked ? null : (
              <i
                aria-hidden="true"
                className="h-2.5 w-2.5 translate-y-1/2 rounded-full border-[2.5px] border-water bg-ink"
              />
            )}
          </div>
        );
      })}

      {tracked ? (
        <div
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${lit * 100}%`, top: y(levelAt(steps, lit)) }}
        >
          <i
            className={`motion-move block h-4 w-4 rounded-full border-[3px] bg-ink transition-colors duration-300 ${
              warn ? "border-accent" : "border-water"
            }`}
            style={{
              boxShadow: warn
                ? undefined
                : "0 0 12px color-mix(in srgb, var(--color-water) 70%, transparent)",
              animation: warn ? "pulse-bar 1s ease-in-out infinite" : undefined,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
