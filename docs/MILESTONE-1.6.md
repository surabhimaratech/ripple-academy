# Milestone 1.6 — a living scholar

1. Reuse the room's art, sprite frames and collision primitives. Add room configuration, a cached navigation grid, and a pure, reusable finite-state controller.
2. Use weighted, non-repeating activities with longer engagements than walks, collision-safe approaches, pose transitions, optional thoughts and small gestures. Automatic activity never calls persistence or reward rules.
3. Give manual keys, floor clicks and furniture clicks priority. Resume autonomy after 20 seconds without player movement. Keep menus independent from autonomous activity.
4. Suspend the scene on hidden tabs without catch-up. Add manual-only and ambient-view controls, larger text, and an activity indicator.
5. Test transitions, navigation and a simulated ten-minute session; inspect the live behavior and screenshots, run all tests and the production build.

The controller uses active-time deltas only and contains no React, Phaser, IndexedDB or currency code. The renderer consumes its position, facing, state, pose and thoughts. Room-specific destinations, furniture footprints and activity weights live in configuration. Character position, behavior and thoughts are temporary; existing IndexedDB records and the reward system are unchanged.
