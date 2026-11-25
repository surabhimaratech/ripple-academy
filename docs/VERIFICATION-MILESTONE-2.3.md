# Verification — the canonical heroine

## Automated

111 tests across 14 suites pass (all 98 prior tests plus 13 new checks). New coverage validates manifest uniqueness and clip references, fractional atlas partitioning, connected alpha silhouette extraction, common boot baseline, uniform frame scaling, four directional walk/blink states, activity poses, reduced-motion stills and visual-only celebration selection. Explicit Coding, Interview, Reading, Astronomy and Journaling mappings are tested against room activities with zero XP/gold; custom writing room mappings and paused sessions are retained.

All existing quest/reward/idempotence/undo/redemption, IndexedDB/import recovery, navigation/manual override, seeded ten-minute scholar simulations, session clocks and curriculum tests continue passing. The new Study notebook point passes existing all-pairs room reachability tests. `npm run build` passes TypeScript and Vite; the existing Phaser large-chunk advisory remains. No new dependency was added. `git diff --check` passes.

## Browser

Inspected the running preview at `http://127.0.0.1:5182/`, with 1280 × 720, 1440 × 900 and 1366 × 768 viewports. Earlier save origins were not touched.

- Canonical transparent heroine textures render in all three existing wings, including side walking, back-facing idle, reading, typing, notebook writing, browsing and telescope observation. No old geometric character or missing-texture boxes appeared.
- Confirmed the new portrait in the room HUD, Keepsake chest's Scholar profile, and courtyard welcome. The welcome fits at 1440 × 900 and 1366 × 768 without an inner scrollbar or text overflow.
- Confirmed WASD/arrow input and click-to-approach behavior still take manual control; the existing inactivity indicator/countdown remains. Existing character navigation and scene depth sorting are preserved.
- Started and finished unlinked Coding and Journaling **visual test** sessions. Coding selected the Study laptop; Journaling selected the new notebook activity. Both records are clearly marked as visual verification in their notes, and remain in the preview origin's history. XP/gold remained 0/0; no quest was completed. No active test session was left running.
- Selected Reduced motion and restored Follow system preference. Automated selector tests confirm static directional/activity frames; renderer breathing is also disabled in reduced mode. Existing hidden-tab game pausing remains unchanged.
- Moved object prompts above the larger heroine's head. Reviewed desk/chair and eyepiece placement; exact furniture-contact art remains provisional and is disclosed in the production status matrix.
- Browser console error/warning inspection returned empty. The temporary viewport override was reset after inspection.

Saved screenshots in the task visualization directory:

- `ripple-heroine-library-1440.png`
- `ripple-heroine-profile-1440.png`
- `ripple-heroine-courtyard-1440.png`
- `ripple-heroine-courtyard-1366.png`

## Artwork status and practical limits

See `docs/art/HEROINE-PRODUCTION.md` for exact source dimensions, provenance, prompts, palette, source-reference preservation and the complete status table. There are 30 named atlas cells: 16 locomotion, 12 activity (one provisional observing cell unused), and two dedicated eyepiece cells. The separate portrait is not a crop of the complete presentation sheet.

The short stride and activity cycles are implemented; they are not full hand-authored eight-frame animation sets. Window/rest/browse/celebration largely use authored still poses plus limited breathing/pose variations. Directional activity turnarounds, fully drawn sit/stand transitions and precise desk/chair/eyepiece contact require additional artist-matched assets. No geometric placeholders were substituted for these missing refinements.

The original behavior state machine, collision/navigation code, reward rules, IndexedDB identity/version and save validator remain unchanged. Default Journaling is an additive category; existing custom category lists and historical activity room snapshots are not rewritten.
