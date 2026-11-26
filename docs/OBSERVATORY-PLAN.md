# Observatory — Milestone 2.6 implementation plan

Status: approved reference located at `Cozy Pixel-Art Observatory at Night.png` and inspected. Preserve its composition. The flattened illustration needs a clean architectural plate and matching independent furniture originals; no contacts are considered verified until browser calibration.

## Existing contracts to preserve
- Upgrade location `observatory` in place. Preserve existing activity IDs (`telescope`, `charts`, `astronomy-books`, `observatory-read`, `sky`, `observatory-chest`), category IDs `astronomy` / `physics`, saved room references, quests, rewards and history.
- Existing room uses `paintInterior`, generic obstacles and legacy presentation offsets. These are not evidence of suitability for the approved concept.
- Reuse the 1280×720 room coordinate system, `RoomDefinition.preload/paint`, `ScholarBehavior`, navigation grid, furniture anchors, `ScholarView`, shared heroine manifest and developer interaction studio.
- Preserve the Personal Study and Happy Café artwork, contacts and reward transactions. Preserve all 66 existing heroine frames and clip definitions.
- Keep IndexedDB database `magical-university`, version 1, store `save`, key `player`; new state must be optional and validated on import/export/recovery.

## Implementation sequence
1. Inspect the approved reference at full resolution. Save it in the art reference directory. Inventory what can be separated cleanly; document missing layers with exact source dimensions and perspectives. Do not crudely erase baked furniture.
2. Prepare the sky/mountains, architectural plate, complete telescope/mount, workstation/chair, armchair, side table, instrument/globe table, observation table and independent instrument props. Foreground parts must use the same source originals as their furniture backs. Preserve composition, brass/wood/navy/teal palette and the scientific focus; no plants or workstation mug.
3. Define transforms, walkable floor, conservative furniture footprints, entrance/exit, approach/departure points and contact anchors. Evaluate telescope eyepiece height and a separate observation step if needed. Leave observation-table interaction pending if its perspective cannot support a grounded pose.
4. Extend the existing calibration preview before declaring interactions complete: show eyepiece/eye, foot/platform, hand/control contacts, all furniture masks, source crop/depth, sprite bounds and routes. Use the production renderer without mounting persistence.
5. Reuse suitable approved poses; create registered telescope observation/adjustment variants only if needed. Eye/hand/foot contacts must remain consistent through frames. Configure workstation typing/thinking/analysis and satchel-free armchair reading/rest. Visually verify all activities at 1440×900 and 1366×768.
6. Extend existing activity/session metadata with optional objective and project/experiment association. Preserve legacy category IDs, offer the six science activity choices without overwriting custom categories, and map explicit intent to telescope/workstation/charts/journal/rest.
7. Extend the existing Pomodoro with optional room/activity context and retained history context. Preserve wall-clock deadlines and Study defaults for legacy saves. Remove unconditional Study redirects for scientific sessions; reuse existing pause/resume/break/Focus Mode controls. Do not create another countdown implementation or auto-complete quests.
8. Add an Observatory view to the existing Journal: observation CRUD with date/title/category/objective/brief notes/results/source URL/local file reference/questions and optional quest/session/project links. Local references are text references, never scanned or uploaded. Validate bounded text, dates and safe URLs; never automatically add the illustrative Kepler example as a finding.
9. Reuse curriculum courses for optional scientific projects, with quest/session/observation associations. Preserve ungrouped activities and deleted-link history gracefully. No separate project manager, automatic research, scientific API, backend or Python runtime.
10. Add restrained sky/monitor/lantern animation, simulated-data labels, reduced motion and hidden-tab sleeping. Keep screen surfaces and telescope contacts as extension points for future adapters; no live-observation claims.
11. Run regressions, persistence/legacy-save tests, exact-once reward checks and production build. Capture required room/contact/session/journal screenshots, and a telescope approach/leave recording if supported. Separate shipped engineering from any unresolved art dependency. Commit completed work locally.

## Architectural findings
- `focusPlan` currently supports only the Study, and `App` routes focus start/resume/Focus Mode to the Study. Both need optional room-aware routing while retaining legacy behavior.
- The activity-session clock already supplies active-time accounting; Pomodoro is the existing wall-clock timer. Scientific sessions should reuse those responsibilities and avoid a second timer.
- `Course` already groups activity sessions. Extend that abstraction for optional projects rather than adding a competing collection.
- `Discovery` currently supplies lightweight Journal CRUD. Observation entries can extend/reuse that infrastructure with optional typed metadata and Observatory filtering.
- The existing telescope pose, old eyepiece placement and generic desk masks must be assessed against the approved artwork; no claim of physical alignment is made yet.

## Outcome
The supplied reference was found at the project root and preserved in `docs/art/references/observatory-concept.png`. Implementation and browser calibration are complete; final architecture, checks, evidence and the explicit foreground-table writing dependency are documented in [OBSERVATORY.md](OBSERVATORY.md).
