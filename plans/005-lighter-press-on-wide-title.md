# 005 — Lighter press feedback on the wide recipe title

- **Status**: DONE
- **Commit**: 3954efb + uncommitted working tree (the "sipario di vetro" recipe sheet in Prepare is not committed yet; the excerpts below are from the working tree)
- **Severity**: LOW
- **Category**: Physicality & origin (press feedback)
- **Estimated scope**: 2 files, ~6 lines

## Problem

In Prepare the recipe title is now a button that opens the recipe sheet. It stretches across the header (`flex-1`, ≈ 900 px wide on the iPad) and uses the shared `press` class:

<!-- prettier-ignore -->
```tsx
/* src/features/prepare/PrepareScreen.tsx:88 — current */
            className="press -my-1.5 -ml-1.5 flex min-w-0 flex-1 items-center gap-4 rounded-[24px] bg-linear-to-r from-surface to-transparent to-85% py-1.5 pr-[18px] pl-1.5 text-left"
```

```css
/* src/index.css — current, inside @layer components */
.press:active {
  transform: scale(0.97);
}
```

`scale(0.97)` is right for 44–200 px controls, but on a 900 px element each edge moves ~14 px toward the centre: the whole header visibly shrinks instead of giving a subtle press. Press feedback must stay subtle (0.95–0.98 for normal controls); for very wide elements the same perceived depth needs a smaller factor.

## Target

A modifier class for wide pressables, scale **0.985** (≈ 7 px per edge on 900 px), same 160 ms `var(--ease-out)` transition inherited from `.press`:

```css
/* target — src/index.css, inside @layer components, right after .press:active */
/* Wide pressables (e.g. the recipe title in Prepare): same depth, smaller travel. */
.press-wide:active {
  transform: scale(0.985);
}
```

<!-- prettier-ignore -->
```tsx
/* target — src/features/prepare/PrepareScreen.tsx, title button */
            className="press press-wide -my-1.5 -ml-1.5 flex min-w-0 flex-1 items-center gap-4 rounded-[24px] bg-linear-to-r from-surface to-transparent to-85% py-1.5 pr-[18px] pl-1.5 text-left"
```

`.press-wide:active` and `.press:active` have equal specificity in the same layer, so the later rule wins: it must come after `.press:active`. Reduced motion is already handled: the unlayered `@media (prefers-reduced-motion: reduce) { .press:active { transform: none !important; } }` in `src/index.css` beats both.

## Repo conventions to follow

- Our own classes live in `@layer components` in `src/index.css` (CSS outside the layers would beat Tailwind utilities). Exemplar: `.press` / `.press:active` in that layer.
- Comments in English.

## Steps

1. In `src/index.css`, inside `@layer components`, immediately after the `.press:active { transform: scale(0.97); }` block, add the `.press-wide:active` block from Target.
2. In `src/features/prepare/PrepareScreen.tsx`, add `press-wide` right after `press` in the title button's `className` (the button with `aria-haspopup="dialog"`).

## Boundaries

- Do NOT change `.press` itself or any other button.
- Do NOT touch the reduced-motion block.
- If the code does not match the excerpts, STOP and report.

## Verification

- **Mechanical**: `npm run check` passes.
- **Feel check**: `npm run dev`, Prepare, 1180×820:
  - press and hold the recipe title: it sinks slightly, the right edge moves a few pixels, not a visible shrink of the header;
  - DevTools → computed style on `:active` (force state): `transform: matrix(0.985, …)`;
  - other buttons (Play, lock, dose cards) still scale to 0.97;
  - with `prefers-reduced-motion: reduce` emulated, the title does not scale at all.
- **Done when**: the title button uses `press press-wide`, the rule exists after `.press:active`, and `npm run check` is green.
