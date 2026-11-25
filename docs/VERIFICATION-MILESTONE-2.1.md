# Verification — Ripple Academy entrance

## Automated

- 91 tests across 11 suites pass (85 existing tests preserved, six new checks).
- Added coverage for natural/clamped section progress, relative parallax depth, Off/reduced motion, bounded smoothing, safe resume defaults, active/paused activity priority, and pre-Ripple JSON envelope compatibility.
- Existing tests continue covering transactional completion/idempotence/undo/redemption, IndexedDB persistence/import recovery, scholar behavior/navigation, seeded ten-minute activity simulations, sessions and curriculum.
- TypeScript (`tsc -b`) and Vite production build pass. `git diff --check` passes.
- The existing Phaser bundle-size advisory remains. The initial entrance bundle is separate from the room engine; artwork is bundled locally, with no additional runtime service or paid dependency.

## Browser

Used an isolated local preview on port 5182; prior save origins were not modified. Inspected 1280 × 720, 1366 × 768 and 1440 × 900.

- Initial hero, partial scroll at full parallax, courtyard and academic wings render without exposed canvas edges or horizontal overflow. Moved the moon after finding an overlap with the header navigation.
- Actual room snapshots appear for all three previews. Entered Personal Study and Observatory; switched to Grand Library and returned home. The remembered-room shortcut updated correctly.
- Scholar autonomy continued in the rooms. The room engine is unmounted on the entrance, with no change to persisted game records.
- Entrance quest completion updated 40 XP / 15 gold; undo returned both to zero. Reload retained the test journal and room preference. No database migration/reset was introduced.
- Parallax Off and explicit Reduced motion were selected through settings. Confirmed reduced mode applies automatic (non-smooth) scrolling, modal semantics and locked background scrolling.
- Opened the quest editor from the entrance and verified Tab remained in the native editor dialog; Escape dismissed it and the folio.
- No browser console errors or warnings observed during the final inspection. The viewport override was reset afterward.

Screenshots saved in the task's visualization directory:

- `ripple-arrival-1366.png`, `ripple-arrival-1440.png`
- `ripple-mid-scroll-1366.png`
- `ripple-grounds-1440.png`, `ripple-wings-1440.png`

## Practical limits

The new raster artwork has a moonlit composition. Time-of-day preferences apply subtle color grading; separate painted daylight scenes are not included. Room previews use existing room artwork, while the cinematic entrance uses newly generated original raster assets. The earlier procedural exterior remains in source for reference but is not mounted. Offline progress is not simulated.
