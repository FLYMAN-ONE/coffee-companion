# 004 — Bring the sheet entrance within the 500 ms drawer budget

- **Status**: DONE
- **Commit**: 3954efb + uncommitted working tree (the "sipario di vetro" recipe sheet in Prepare is not committed yet; the excerpts below are from the working tree)
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 1 file, 1 line (+1 line in the design doc)

## Problem

```tsx
/* src/features/prepare/PrepareScreen.tsx:247-249 — current (sheet) */
            transition: listOpen
              ? "transform 520ms var(--ease-spring), opacity 150ms var(--ease-out)"
              : "transform 300ms var(--ease-out), opacity 200ms var(--ease-out) 100ms",
```

The sheet's entrance lasts 520 ms, above the 200–500 ms budget for modals and drawers. The overshoot curve `--ease-spring` (`cubic-bezier(0.34, 1.36, 0.64, 1)`) is a deliberate project decision for rare panel entrances (`docs/refresh/02-decisioni.md` §8) and stays.

## Target

```tsx
/* target */
            transition: listOpen
              ? "transform 460ms var(--ease-spring), opacity 150ms var(--ease-out)"
              : "transform 300ms var(--ease-out), opacity 200ms var(--ease-out) 100ms",
```

460 ms also matches the content wrapper's opening transform (460 ms), so sheet and content arrive together.

## Repo conventions to follow

- Tokens `--ease-spring` / `--ease-out` from `src/styles/theme.css`; inline `style` transitions as in the rest of `PrepareScreen.tsx`.

## Steps

1. In `src/features/prepare/PrepareScreen.tsx`, in the sheet's `style.transition` (element with `id={sheetId}`), change `520ms` to `460ms`. Nothing else.
2. In `docs/refresh/02-decisioni.md` §11, bullet starting "Movimento:", change "in 520 ms" to "in 460 ms".

## Boundaries

- Do NOT change the easing, the closing branch, or other files.
- If the code does not match the excerpt, STOP and report.

## Verification

- **Mechanical**: `npm run check` passes.
- **Feel check**: `npm run dev`, Prepare, 1180×820. Open the list several times:
  - the sheet still has its slight overshoot, a touch quicker;
  - DevTools Animations at 10 %: the sheet's transform ends at 460 ms, together with the content's transform.
- **Done when**: `520ms` no longer appears in `PrepareScreen.tsx` and `npm run check` is green.
