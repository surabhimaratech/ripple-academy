# Milestone 2 — a university of your own

Extend the living-scholar implementation with an original exterior, Personal Study, Observatory, explicit real-world activity sessions and a small personal curriculum.

1. Add optional v1 fields for categories, courses and session history. Session completion and optional quest completion share the existing atomic transaction. Reward totals are still driven solely by quest completion snapshots.
2. Add a modular room registry. Each interior provides its own original pixel artwork, collision map and activity destinations, reusing the existing scholar controller and renderer.
3. Build an exterior with six independently rendered, overscanned pixel-art layers; interpolated pointer parallax, idle drift, local time-of-day palettes and independent ambient details. Clickable architectural destinations have keyboard/HTML alternatives.
4. Add configurable category/room mappings, timed or untimed sessions, pause/resume/finish, optional quest/course associations, notes and durable history. Persist elapsed checkpoints with max-merge and run IDs so multiple tabs cannot double-count time or rewards. Closed time is not simulated.
5. Add readable, minimal welcome/rank/course overlays and session controls. Preserve quest, shop, discovery, keepsake, history, save/recovery and accessibility workflows.
6. Test room mappings, session persistence, concurrency and duplicate reward handling; inspect all scenes and the exterior at laptop sizes, then run all tests and build.

All added data is optional in the existing version-1 player record; the database/store/key are unchanged. Original artwork, locally synthesized tones and system fonts require no paid assets or external services. No permanent university name, authentication, cloud sync, combat or elaborate mythology is introduced.
