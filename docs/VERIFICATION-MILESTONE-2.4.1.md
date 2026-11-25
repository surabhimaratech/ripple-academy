# Milestone 2.4.1 verification

## Regression checks

- `npm test`: **136 passing tests across 18 suites**.
- `npm run build`: TypeScript project checking and production Vite build pass. The existing Phaser bundle-size advisory remains.
- `git diff --check`: clean.
- Original atlas definitions, clip timing and common runtime canvas exactly match the pre-milestone manifest; only new atlas entries were added.
- Original approved heroine PNGs and Library/Observatory artwork are unchanged. The Study asset is byte-identical to the supplied illustration.
- Development calibration identifiers are absent from production JavaScript.
- No persistence schema, quest mechanics, gold, XP, focus accounting or reward rules changed. Existing domain and IndexedDB regression suites pass.

New regression coverage checks occupied-chair continuity across reading/rest/tea, all desk work frame maps, reachable approaches, collision-safe walking, settling and standing-up phases, manual override after departure, reversal of an interrupted sit-down, reduced-motion endpoints, celebration/pause compatibility, window-facing floor placement and nonoverlapping positive polygon-mask bands.

## Browser verification

Used isolated origin `127.0.0.1:5184` for the production work-session check; the existing user save at port 5182 was not modified. Developer previews never open IndexedDB. The verification timer was reset to ready afterward.

Checked the default renderer and forced Canvas rendering, 1440×900 and 1366×768 preview viewports, and production Focus Mode at 1280×720. Verified chair occupancy, satchel removal, book/mug placement, desk backrest and leg opening, page turn/look-up/sip frames, a frozen half-standing frame, real approach/activity/departure replay, reduced-motion stills and window-facing observation. Fresh preview/game console checks contained no warnings or errors. Temporary viewport override reset.

The comparison checkbox uses a frozen original-2.4 presentation implementation and original sprite names, with a shared camera and unchanged room illustration. These are rendered comparisons, not mockups.

## Before and after

| Interaction | Before | After |
| --- | --- | --- |
| Armchair reading | [Original](verification/2.4.1/reading-before.png) | [Compatible seated pose](verification/2.4.1/reading-after.png) |
| Armchair resting | [Original pose](verification/2.4.1/rest-before.png) | [Resting in the chair](verification/2.4.1/rest-after.png) |
| Tea / coffee | [Original pose](verification/2.4.1/tea-before.png) | [Mug hold](verification/2.4.1/tea-after.png) |
| Laptop typing | [Original](verification/2.4.1/typing-before.png) | [Occupied desk chair](verification/2.4.1/typing-after.png) |
| Pausing to think | [Original](verification/2.4.1/thinking-before.png) | [Consistent desk contact](verification/2.4.1/thinking-after.png) |
| Notebook writing | [Original](verification/2.4.1/writing-before.png) | [Consistent seated posture](verification/2.4.1/writing-after.png) |

Additional checks: [page turn](verification/2.4.1/page-turn.png), [looking up](verification/2.4.1/looking-up.png), [tea sip](verification/2.4.1/tea-sip.png), [half-stand](verification/2.4.1/chair-half-stand.png), [Canvas at 1366×768](verification/2.4.1/reading-canvas-1366x768.png), [window viewpoint](verification/2.4.1/window-after.png).

## Remaining artwork work

See [the milestone report](MILESTONE-2.4.1.md) for exact asset paths, dimensions, perspective, poses and foreground-layer specifications. Current Study interactions use selected compatible art, not placeholders. Relocating furniture still requires a clean room plate and separately authored furniture/shadow layers. More drawn transition in-betweens would improve close-up polish; the implemented transitions use standing/half-standing poses, local contact interpolation and brief blends. No furniture relocation, extra room or Happy Café implementation was attempted.
