import type { RecipeStep } from "../../../types";

/** Minimum share of the width for a step, so short steps keep a readable label. */
export const MIN_SHARE = 0.15;

export interface SequenceStep {
  id: string;
  label: string;
  seconds: number;
  /** Seconds from the start of the brew. */
  start: number;
  /** Water in the carafe at the start / end of the step (% of the total). */
  fromPct: number;
  toPct: number;
  pour: boolean;
  /** Horizontal span as fractions of the width (0–1). */
  x0: number;
  x1: number;
}

/** Lays out the steps of a recipe: width ∝ duration (with a minimum share), water before/after each step. */
export function sequenceLayout(steps: RecipeStep[]): SequenceStep[] {
  const total = steps.reduce((s, x) => s + x.seconds, 0);
  const raw = steps.map((s) => Math.max(total ? s.seconds / total : 0, MIN_SHARE));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  let x = 0;
  let start = 0;
  return steps.map((s, i) => {
    const fromPct = i ? steps[i - 1].waterPct : 0;
    const out: SequenceStep = {
      id: s.id,
      label: s.label,
      seconds: s.seconds,
      start,
      fromPct,
      toPct: s.waterPct,
      pour: s.waterPct > fromPct,
      x0: x,
      x1: x + raw[i] / sum,
    };
    x = out.x1;
    start += s.seconds;
    return out;
  });
}

/**
 * SVG paths of the water ribbon: thickness follows the water in the carafe, rising with an
 * S-curve during each step. `width` is in user units, `y` maps a water % to a y coordinate.
 */
export function ribbonPaths(
  steps: SequenceStep[],
  width: number,
  y: (pct: number) => number,
  base: number
): { area: string; line: string } {
  const f = (n: number) => Math.round(n * 10) / 10;
  const edge = steps
    .map((s) => {
      const a = s.x0 * width;
      const b = s.x1 * width;
      const mid = (a + b) / 2;
      return `L${f(a)} ${f(y(s.fromPct))} C${f(mid)} ${f(y(s.fromPct))} ${f(mid)} ${f(y(s.toPct))} ${f(b)} ${f(y(s.toPct))}`;
    })
    .join(" ");
  return {
    area: `M0 ${base} L0 ${f(y(0))} ${edge} L${width} ${base} Z`,
    line: `M0 ${f(y(0))} ${edge}`,
  };
}

/**
 * Water % on the ribbon's top edge at a horizontal position `u` (0–1), following the same
 * S-curve as `ribbonPaths` (cubic Bézier with both control points at the middle of the step).
 */
export function levelAt(steps: SequenceStep[], u: number): number {
  if (!steps.length) return 0;
  const s = steps.find((x) => u <= x.x1) ?? steps[steps.length - 1];
  const span = s.x1 - s.x0;
  const v = span > 0 ? Math.min(1, Math.max(0, (u - s.x0) / span)) : 1;
  // x(t) = 1.5t(1-t)² + 1.5t²(1-t) + t³ is monotonic: find t by bisection, then y(t).
  const xt = (t: number) => 1.5 * t * (1 - t) ** 2 + 1.5 * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (xt(mid) < v) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  const yt = 3 * t * t * (1 - t) + t ** 3;
  return s.fromPct + (s.toPct - s.fromPct) * yt;
}
