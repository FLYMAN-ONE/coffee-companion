# 002 — Shorten the row cascade in the recipe sheet

- **Status**: DONE
- **Commit**: 3954efb + uncommitted working tree (the "sipario di vetro" recipe sheet in Prepare is not committed yet; the excerpts below are from the working tree)
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens (stagger) / Easing & duration
- **Estimated scope**: 1 file, ~10 lines

## Problem

When the recipe sheet opens in Prepare, its rows enter in a cascade:

```tsx
/* src/features/recipes/RecipeList.tsx:50-55 — current */
      className={`press flex items-center gap-3 rounded-[20px] p-2.5 text-left ${selected ? "bg-raised" : ""} ${cascade ? "motion-move" : ""}`}
      style={
        cascade
          ? { animation: `row-in 460ms var(--ease-out) ${120 + Math.min(i, 12) * 30}ms backwards` }
          : undefined
      }
```

With 13+ rows the last delay is 120 + 12×30 = 480 ms and each row lasts 460 ms: the last row is fully visible after ~940 ms. Meanwhile the rows are already tappable but invisible or half-faded (`backwards` fill). A stagger is decorative and must never delay interaction; uniform 30 ms steps across 13 rows also read as mechanical. Target per the audit rules: a 30–80 ms stagger on the first items, non-uniform (gaps shrinking), and the whole group settled well before ~0.5 s.

`row-in` (in `src/index.css`) is:

```css
@keyframes row-in {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }
}
```

## Target

- Row animation duration: **280ms**, easing `var(--ease-out)` (`cubic-bezier(0.23, 1, 0.32, 1)`), fill `backwards` (unchanged, so `.press:active` still works after the animation).
- Non-uniform delays by row index `i` (0-based, same index already passed to `row`), from this table; any `i ≥ 7` uses the last value:

```ts
/** Cascade delays (ms) for the recipe sheet rows: gaps shrink, the group settles fast. */
const CASCADE_DELAYS = [60, 95, 125, 150, 170, 185, 195, 200];
```

Last row visible at 200 + 280 = 480 ms (was ~940 ms); the first rows, the ones the eye lands on, start at 60 ms while the sheet is still arriving.

```tsx
/* target */
      style={
        cascade
          ? {
              animation: `row-in 280ms var(--ease-out) ${CASCADE_DELAYS[Math.min(i, CASCADE_DELAYS.length - 1)]}ms backwards`,
            }
          : undefined
      }
```

## Repo conventions to follow

- Module-level constants in UPPER_SNAKE_CASE with a one-line JSDoc, e.g. `PICK_CLOSE_DELAY` in `src/features/prepare/PrepareScreen.tsx` (just above the `PrepareScreen` component).
- Code and comments in English. Format with the repo's Prettier (printWidth 110, double quotes).

## Steps

1. In `src/features/recipes/RecipeList.tsx`, above `export function RecipeList`, add the `CASCADE_DELAYS` constant exactly as in Target.
2. In the `row` function's `<button>`, replace the `animation` string with the target one (duration 280ms, delay from `CASCADE_DELAYS`).
3. Leave the `motion-move` class logic, the `row-in` keyframes and everything else unchanged.
4. In `docs/refresh/02-decisioni.md` §11, bullet starting "Movimento:", replace "righe a cascata (30 ms di scarto)" with "righe a cascata in 280 ms, con scarti che si accorciano (tutte visibili entro 0,5 s)".

## Boundaries

- Do NOT change `src/index.css` (`row-in` keyframes) or the Recipes screen (it does not pass `cascade`).
- Do NOT change `PrepareScreen.tsx`.
- Do NOT add dependencies.
- If the code does not match the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run check` passes.
- **Feel check**: `npm run dev`, Prepare tab, 1180×820. Tap the recipe title:
  - the first rows appear almost together with the sheet; the whole list is visible in about half a second;
  - DevTools Animations panel at 10 %: delays grow by shrinking steps (35, 30, 25, 20, 15, 10, 5 ms), rows from the 8th on start together;
  - tap a row immediately after opening: it is visible and responds;
  - Recipes tab: its list has no cascade (unchanged);
  - with `prefers-reduced-motion: reduce` emulated, rows appear with no slide (the existing `.motion-move` rule removes the animation) and the sheet only fades.
- **Done when**: the last row finishes at ≤ 480 ms and `npm run check` is green.
