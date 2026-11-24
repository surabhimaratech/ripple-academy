# Milestone 1.5 — implementation plan

1. Retain the v1 IndexedDB database, object store, player key, and atomic quest/shop rules. Add optional discoveries and keepsakes; validate imports and keep a transactionally saved recovery copy before replacement.
2. Replace the two-column dashboard with a full-stage library, compact RPG HUD, bottom command bar, and collapsible folio occupying about 28% of the viewport.
3. Build original layered pixel art, a larger four-direction heroine, walking/idle/seated poses, collision boundaries, and contextual object interactions. Share pure movement rules with tests.
4. Add coin/XP effects, level-up treatment, optional synthesized sound, animated counters, and reduced-motion preferences.
5. Preserve the original tests; add validation, compatibility, import/recovery, notebook, keepsake and movement tests. Inspect common laptop viewports and verify the production build.

## Boundaries

React owns menus, preferences, accessible controls and committed saves. Phaser owns only temporary room position, input, artwork and effects. Pure domain modules own progression, discovery notes, keepsakes, import validation and collision math. All saved changes pass through a single IndexedDB read/write transaction. Import also writes the prior save to `before-import` in that transaction; recovery swaps the two saves atomically. No database migration or reset is needed.

The canvas does not listen globally for movement keys: movement is scoped to the focused room and paused while a menu or editor is open. Every world interaction has an HTML menu alternative. Generated original pixel artwork and synthesized tones avoid external services and licensing dependencies.
