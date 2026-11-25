# Verification — heroine activity expansion

## Automated and preservation checks

- 118 tests in 15 suites pass: all 111 prior tests and seven new expansion/regression tests.
- New checks cover work/thinking/book phases, chart/telescope variants, reduced-motion stills, all catalog frame references, shared frame registration, non-overlapping positive occlusion masks, fixed desk/bed anchors, post-session stretch/manual cancellation, and activity renewal without a standing/walking flash.
- The existing room all-pairs reachability, seeded ten-minute behavior simulations, manual override, sessions, persistence, quest idempotence/undo and redemption tests still pass.
- TypeScript and Vite production build pass. Existing Phaser chunk-size advisory remains; no dependency or package changes were needed.
- Production JavaScript was checked for the studio component/style markers: the development-only preview is excluded.
- Git diff checks confirmed the four approved heroine PNGs, palette, room painters, domain model, save validator and IndexedDB repository are unchanged. Only a supplemental PNG was added; no approved sprites were regenerated.
- `git diff --check` passes.

## Browser checks

Used the local development server on port 5182. Inspected the studio at 1280 × 720 and 1440 × 900; reset the temporary viewport override afterward.

- The studio exposes all 27 animation choices and 42 raw frames, actual room context, checkerboard inspection, pause/play, timeline scrubbing, zoom, guides, foreground masks and reduced-motion controls.
- Scrubbed the full work loop to 18 seconds (thinking) and 30 seconds (consulting/page turn), verified the reported frame and artwork, and selected reduced motion (type-a still).
- Verified chair tea and bed sleep against the unchanged room art. Toggling foreground occlusion reveals/hides the lower body behind desk fronts, chair arms and the quilt.
- Tested forced Canvas renderer and normal WebGL/auto: desk masking works in both. Console error/warning inspections returned empty.
- Raw sleep-frame selection automatically switched to the transparent-art checkerboard, with the entire isolated heroine visible and no baked-in room furniture.
- The normal application still enters Library and Study. Click-to-approach the Study desk opened the existing quest journal; the heroine continued activities behind the desk and folio. Closing the folio preserved gameplay controls. XP and gold remained 0/0; no quests or sessions were created/completed during this milestone's checks.
- DOM inspection of the studio confirmed the normal `.app` is not mounted. Preview code imports neither the persistence repository nor reward operations.

Screenshots saved in the task visualization directory:

- `ripple-heroine-activity-studio-1440.png`
- `ripple-activities-in-game.png`

## Remaining limits

Short multi-pose loops and 200 ms anchored pose crossfades are provided. Fully drawn sit/stand/bed-entry and additional arm/neck in-between frames remain future artwork. Activity facing variants are limited to authored views; the approved walking cycle is unchanged. Current contact masks/anchors must be recalibrated to the upcoming new room artwork. See `docs/art/HEROINE-ACTIVITY-EXPANSION.md` for the full completion matrix, asset pipeline and exact supplemental generation prompt.
