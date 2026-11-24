# Verification — Milestone 2 and living-scholar carry-forward

## Automated

85 tests across ten suites pass. Original quest, reward, undo, persistence and import tests remain.

Coverage includes:

- Quest reward idempotence, undo snapshots, spending/undo, redemption records and transaction rollback.
- Legacy database loading without migration/reset; import validation, recovery, duplicate IDs and reversal-safe balances.
- Manual override, 20-second inactivity, floor/furniture navigation, celebration resumption and optional thoughts.
- Four seeded ten-minute scholar simulations: collision-safe positions, varied activities, no autonomous interaction events, and more time engaged than walking.
- Reachable activity/session furniture in every room, routes between all activity pairs, blocked destinations, padded diagonal clearance and manual-only behavior.
- Session-directed activities, initial reading book selection, longer-session variations, pause/resume and unaffected behavior in unrelated rooms.
- Default and configurable activity mappings, course editing, timer validation, max-merged checkpoints, stale run rejection, session persistence/reopening and concurrent completion.
- Exactly one quest award for a linked session, no reward for an unlinked session or already-complete quest, and no re-award after undo/retry.
- Monotonic clock pause/resume, closed-time exclusion, cross-tab max-merge and import anchor reset.
- Morning/afternoon/twilight/night boundaries, clamped/interpolated parallax, idle drift limits and reduced-motion/off behavior.

TypeScript and the Vite production build pass. Phaser emits the existing large-bundle advisory; no new runtime service or paid dependency was added.

## Browser

The mutating checks used **port 5181**, keeping prior saves on 5174 separate. At 1440 × 900 and 1366 × 768, inspected the exterior, all three interiors, folio and session/ambient layouts. A ResizeObserver was added after visual review found the canvas retaining its old size in ambient view.

Observed:

- Autonomous window observation, writing, browsing, reading, telescope use and post-session independent activity.
- WASD/manual takeover with a visible 20-second autonomy countdown.
- The original Library preserved and both new rooms showing consistent scholar scale and functional furniture navigation.
- Coding → Study/laptop; pause held at 00:46 while other work continued, then resumed; finishing recorded notes with **zero XP/gold** added.
- Timed reading with an associated quest → Library/book selection; finishing recorded notes and awarded **40 XP / 15 gold** once. Progress retained after reload.
- Astronomy with a course and quest → Observatory/telescope; ambient view hid optional panels, filled the viewport and retained session controls; finishing showed the existing coins/XP celebration and then returned to ordinary behavior.
- A personal astronomy course was created and appeared under Current curiosities on the entrance.
- Nighttime palette, warm windows, lanterns, the six-layer composition and destination hover illumination/name. Parallax Off and Reduced motion were selected successfully and restored to the normal preferences. Mouse movement produced bounded parallax without exposed edges.
- Direct building click navigation, conventional room navigation and gentle fades; all folio alternatives, export/import and existing controls remain accessible.

The four ten-minute runs are deterministic simulated active-time tests, not a claim of a recorded uninterrupted ten-minute browser video. Browser screenshots are local review artifacts outside the source tree. File-picker automation was previously unavailable; the validated pasted-JSON import alternative and persistence tests remain available for that workflow.

## Boundaries

Elapsed session checkpoints occur every ten seconds while open and on explicit pause/finish/export. An abrupt close can lose the most recent checkpoint interval; closed time is never added on reload. The running focus timer may continue in a hidden open tab, while scene rendering/simulation sleeps. No performance benchmark or cloud synchronization is claimed.

All newly persisted data is optional in the existing version-1 save. Character/scene position and activity are temporary. Room navigation and autonomous activity never generate currency. No extra rooms beyond Library, Study and Observatory, permanent name, character needs, combat, authentication or external AI services were introduced.
