# 001 — Remove the animated blur behind the recipe sheet

- **Status**: DONE
- **Commit**: 3954efb + uncommitted working tree (the "sipario di vetro" recipe sheet in Prepare is not committed yet; the excerpts below are from the working tree)
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file, 2 lines

## Problem

In Prepare, opening the recipe list slides a glass sheet over the screen and pushes the screen content back. The content wrapper animates `filter: blur(2px)` together with transform and opacity:

```tsx
/* src/features/prepare/PrepareScreen.tsx:70-79 — current */
        style={{
          transformOrigin: "70% 50%",
          transform: listOpen ? "translateX(36px) scale(0.965)" : "none",
          opacity: listOpen ? 0.4 : 1,
          filter: listOpen ? "blur(2px)" : "none",
          transition:
            "transform 460ms var(--ease-out), opacity 300ms var(--ease-out), filter 300ms var(--ease-out)",
        }}
```

This wrapper is almost the whole screen (≈1036×764 px on the iPad): the ruler with hundreds of ticks, the SVG water ribbon that already has a `drop-shadow` filter, three 50 px numbers. An animated `filter` radius forces the browser to re-rasterize that whole layer every frame. On top of it, the sheet itself has `backdrop-blur-[26px]` and moves over this content, so Safari recomputes a 26 px backdrop blur over a layer that is itself changing every frame. Transition-time blur must stay cheap (AUDIT: keep transition-time `filter: blur()` light, it is expensive especially in Safari). The sheet's own backdrop blur already gives the depth; the second blur adds cost and little visual value (the content is also at 40 % opacity).

## Target

The content wrapper animates only `transform` and `opacity` (compositor-only properties). No `filter` at all:

```tsx
/* target */
        style={{
          transformOrigin: "70% 50%",
          transform: listOpen ? "translateX(36px) scale(0.965)" : "none",
          opacity: listOpen ? 0.4 : 1,
          transition: "transform 460ms var(--ease-out), opacity 300ms var(--ease-out)",
        }}
```

The sheet's `backdrop-blur-[26px] backdrop-saturate-130` stays unchanged.

## Repo conventions to follow

- Motion values are inline `style` transitions using the tokens `var(--ease-out)` (`cubic-bezier(0.23, 1, 0.32, 1)`) and `var(--ease-spring)`, defined in `src/styles/theme.css`. Never `transition: all` (project rule, `docs/refresh/02-decisioni.md` §8).
- Exemplar of a transform+opacity-only transition: the sheet in the same file, `src/features/prepare/PrepareScreen.tsx:244-250`.

## Steps

1. In `src/features/prepare/PrepareScreen.tsx`, in the `style` of the content wrapper (the `<div inert={listOpen} className="motion-move flex h-full min-w-0 flex-col gap-[18px]"`), delete the line `filter: listOpen ? "blur(2px)" : "none",`.
2. In the same `style`, replace the `transition` value with `"transform 460ms var(--ease-out), opacity 300ms var(--ease-out)"` (one line; Prettier may reflow it).
3. Update `docs/refresh/02-decisioni.md` §11, bullet starting "La lista si apre toccando il titolo": remove ", e si sfoca di 2 px" so it ends with "sfuma al 40 %.".

## Boundaries

- Do NOT touch the sheet element (`id={sheetId}`) or its backdrop blur.
- Do NOT change `transformOrigin`, the transform values or the opacity value.
- Do NOT add dependencies. Do NOT edit other files besides the two above.
- If plan 003 has already been applied, the `transition` is a ternary: remove only the `filter …` parts from both branches and keep its timings.
- If the code does not match the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run check` (lint + test + build) passes.
- **Feel check**: `npm run dev`, Prepare tab, viewport 1180×820. Tap the recipe title to open the list, then tap outside to close it, several times:
  - the content behind recedes and dims, still crisp (no blur);
  - in Chrome DevTools → Animations panel at 10 %, only `transform` and `opacity` animate on the content wrapper;
  - DevTools → Performance, record an open/close: no long "Paint" blocks on the content layer during the transition;
  - on the real iPad, opening/closing is smooth at 60 fps (no stutter as the sheet passes over the ribbon).
- **Done when**: no `filter` remains in the content wrapper style and `npm run check` is green.
