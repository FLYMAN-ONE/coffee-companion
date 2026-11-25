# 003 — Content behind the sheet returns as fast as the sheet leaves

- **Status**: DONE
- **Commit**: 3954efb + uncommitted working tree (the "sipario di vetro" recipe sheet in Prepare is not committed yet; the excerpts below are from the working tree)
- **Severity**: MEDIUM
- **Category**: Interruptibility (asymmetric timing) / Cohesion
- **Estimated scope**: 1 file, ~6 lines
- **Depends on**: 001 (apply 001 first; this plan's excerpt assumes the `filter` is gone)

## Problem

The Prepare screen content recedes while the recipe sheet is open and comes back when it closes. The content uses the same timing in both directions, while the sheet uses a slower entrance and a fast exit:

```tsx
/* src/features/prepare/PrepareScreen.tsx — content wrapper, after plan 001 */
        style={{
          transformOrigin: "70% 50%",
          transform: listOpen ? "translateX(36px) scale(0.965)" : "none",
          opacity: listOpen ? 0.4 : 1,
          transition: "transform 460ms var(--ease-out), opacity 300ms var(--ease-out)",
        }}
```

```tsx
/* src/features/prepare/PrepareScreen.tsx — sheet, current */
            transition: listOpen
              ? "transform 520ms var(--ease-spring), opacity 150ms var(--ease-out)"
              : "transform 300ms var(--ease-out), opacity 200ms var(--ease-out) 100ms",
```

On close the sheet is gone after 300 ms, but the content is still sliding back for another 160 ms: for a moment the screen looks "pushed away" by a sheet that is no longer there. Closing is the system's response to a pick or a tap outside: it should snap, and both layers should finish together.

## Target

Asymmetric timing on the content wrapper, matching the sheet:

```tsx
/* target — content wrapper */
          transition: listOpen
            ? "transform 460ms var(--ease-out), opacity 300ms var(--ease-out)"
            : "transform 300ms var(--ease-out), opacity 300ms var(--ease-out)",
```

`--ease-out` is `cubic-bezier(0.23, 1, 0.32, 1)` (defined in `src/styles/theme.css`). Opening is unchanged; closing is 300 ms for both properties, ending at the same time as the sheet's transform (300 ms) and opacity (100 ms delay + 200 ms).

## Repo conventions to follow

- Exemplar of an open/closed ternary transition: the sheet's own `transition` in the same file (excerpt above).
- Never `transition: all`; list properties explicitly.

## Steps

1. In `src/features/prepare/PrepareScreen.tsx`, in the content wrapper `style` (the `<div inert={listOpen} className="motion-move flex h-full min-w-0 flex-col gap-[18px]"`), replace the `transition` value with the ternary in Target.
2. Run Prettier on the file (`npx prettier --write src/features/prepare/PrepareScreen.tsx`).

## Boundaries

- Do NOT change the transform/opacity values, the sheet, or other files.
- If `filter` is still present (plan 001 not applied), STOP and apply 001 first or report.
- If the code does not match the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run check` passes.
- **Feel check**: `npm run dev`, Prepare, 1180×820:
  - open the list: same feel as before (content recedes in ~460 ms);
  - pick a recipe or tap outside: sheet and content finish together, no trailing slide of the content;
  - DevTools Animations at 10 %: on close, both layers end at 300 ms;
  - open then close quickly mid-animation: the content reverses from where it is (CSS transitions retarget), no jump.
- **Done when**: closing takes 300 ms for both layers and `npm run check` is green.
