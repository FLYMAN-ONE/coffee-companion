# Animation plans

Plans from the `improve-animations` audit of the Prepare recipe sheet ("sipario di vetro"), 2026-11-25.
Each plan is self-contained: hand it to any agent, or run `improve-animations execute <plan>`.

| #   | Title                                                                                 | Severity | Status |
| --- | ------------------------------------------------------------------------------------- | -------- | ------ |
| 001 | [Remove the animated blur behind the recipe sheet](001-no-blur-behind-sheet.md)       | HIGH     | DONE   |
| 002 | [Shorten the row cascade in the recipe sheet](002-shorter-row-cascade.md)             | MEDIUM   | DONE   |
| 003 | [Content returns as fast as the sheet leaves](003-asymmetric-content-return.md)       | MEDIUM   | DONE   |
| 004 | [Sheet entrance within the 500 ms drawer budget](004-sheet-open-460ms.md)             | LOW      | DONE   |
| 005 | [Lighter press feedback on the wide recipe title](005-lighter-press-on-wide-title.md) | LOW      | DONE   |

## Execution order

1. **001** first: 003 edits the same `transition` line and assumes the `filter` is gone.
2. **003** right after 001.
3. **002**, **004**, **005** in any order (independent files/lines).

## Dependencies

- 003 → depends on 001.
- 004 shares `PrepareScreen.tsx` with 001/003/005 but a different element (the sheet); no conflict.
- 001, 002 and 004 each update one bullet of `docs/refresh/02-decisioni.md` §11 (different bullets or phrases).

All plans are written against the uncommitted working tree on top of `3954efb`; commit the recipe sheet first or apply the plans on the same working tree.
