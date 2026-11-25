# Canonical Ripple Academy heroine

Approved identity: young adult scholar; long wavy dark brown hair, purple ribbon and warm brown eyes; royal purple academic jacket with antique gold embroidery, ivory blouse/ribbon tie, charcoal pleated skirt, tights, lace-up brown boots, golden dolphin brooch and crossbody satchel. Palette roles are in `palette.json`.

The approved `portrait.png`, `locomotion.png`, `activities.png`, `telescope.png` and palette remain unchanged. Canonical/reference presentation sheets live in sibling `../references/` and are never used as game textures. `activity-expansion.png` is the only supplemental raster: 1448 × 1086 RGBA, four columns by three rows, new isolated thinking, book consultation, telescope adjustment, tea, stretch, sleep, object and window poses.

`animations.json` is the runtime source of truth for source grids, 42 named frames, registration groups, target heights and clips. Related frames share scale and horizontal reference, preserving a common boot baseline. Output frames are 96 × 144 with foot origin (48,136). Keep silhouettes inside their source cells, with clean alpha and no room furniture or labels.

`src/heroine/programs.ts` controls quiet work/chart/telescope phases. `presentation.ts` contains separate room contact anchors and foreground masks; the renderer uses short anchored pose crossfades rather than sliding feet. The original room art, reward rules and saved progress remain separate. Reduced motion keeps still poses.

Development inspection: open `/?preview=heroine` on the Vite server. All 27 catalog entries and all 42 raw cells can be inspected, paused, scrubbed, zoomed and compared with foreground occlusion. `&renderer=canvas` tests the fallback renderer. The studio is excluded from production and does not mount the saved game.

Remaining artwork: fully drawn sit/stand/bed-entry transitions, additional activity directions and smooth arm/neck in-betweens. Approved walking is preserved as its original short cycle. Contact anchors/masks must be checked when new room art arrives.

See `../../../docs/art/HEROINE-ACTIVITY-EXPANSION.md` for the current completion matrix, controls, provenance and exact built-in ImageGen prompt. `HEROINE-PRODUCTION.md` in that directory retains the original Milestone 2.3 production record.
