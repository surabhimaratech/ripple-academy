# Ripple Academy

*Through curiosity, to the stars.*

A cozy, single-player, local-only personal development game. A place to become yourself. The university entrance now leads to the Grand Library, Personal Study, Observatory and Happy Café. The heroine wanders, reads, writes and observes at her own pace, and accompanies activities you explicitly choose in the real world.

## Run locally

Use Node.js 22.12+ or a newer LTS release.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite on a laptop browser. Keep the **same hostname, port and browser profile** to access the same save. If your existing journal is on port 5174:

```sh
npm run dev -- --port 5174 --strictPort
```

No accounts, cloud services, API keys, external AI integrations or paid dependencies are used. Installation downloads packages; the running game uses bundled original artwork, system fonts, IndexedDB and optional locally synthesized reward tones.

```sh
npm test
npm run build
```

The production build is written to `dist/`. Type checking runs as part of the build. Phaser produces a large-bundle warning; this does not prevent the build.

## Arrive at your university

The entrance is one continuous, normally scrolling journey:

1. **Arrival (0–20%)** — the approved Gothic academy and celestial dolphin identity, with a fading title.
2. **Approach (20–40%)** — independent camera depths bring the pathway and entrance closer while distant sky/mountains move less.
3. **Opening the gates (40–60%)** — ornate wooden leaves rotate around their outer hinges inside a stationary carved stone portal, revealing the approved courtyard. Scroll upward to close them again.
4. **Within the grounds (60–80%)** — the welcome, academic progress and functional activity/quest/curriculum controls appear in a gentle stagger.
5. **Academic wings (80–100%)** — normal document scrolling reveals previews captured from the actual Grand Library, Personal Study, Observatory and Happy Café painters. Each opens its existing interactive room.

**Enter the Academy** smoothly scrolls into the approach. **Skip to Academic Wings** bypasses the sequence; **Resume** goes directly to the active/paused activity's room or the last visited room. The grounds anchor lands after the welcome controls appear. All navigation remains keyboard accessible.

A sticky viewport, normalized timeline and bounded RAF smoothing coordinate the canvas layers, camera, perspective hinges and HTML welcome. No wheel/touch handlers, artificial scroll positions or animation dependencies are used. The seven approved exterior layers, typography, palette, logo and courtyard artwork are preserved; only the gateway assets are new.

**Save & settings** offers Off, Very gentle, Gentle and Full scroll parallax. Off disables camera movement and gate animation; reduced motion also uses a shorter journey, still scene changes and non-smooth anchor scrolling. Decorative drawing pauses when hidden or outside the exterior stage, and the timeline sleeps when settled. Morning/afternoon/twilight/night settings continue subtle color grading of the approved moonlit artwork.

See the [entrance architecture and artwork replacement guide](docs/ENTRANCE-ARTWORK.md).

## Your living scholar

Autonomous activities are enabled by default. She walks to meaningful places, browses shelves, selects books, reads in the armchair or by a window, writes, examines the globe, observes the sky and takes breaks. The Study adds laptop and notebook work; the Observatory adds telescope observation, star-atlas notes and astronomy books.

Weighted selection reduces recent repeats, and randomized engagements are longer than walks. Original activity poses include reaching for a book, reading/page turning, writing, typing/consulting a book, sitting, stretching and adjusting her hair. Occasional thoughts are infrequent, optional and never generate tasks or notifications.

| Control                             | Action                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| Click the room / Tab to the room    | Focus movement input                                        |
| WASD or arrow keys                  | Take manual control and walk                                |
| Click accessible floor              | Walk there along a collision-safe route                     |
| Click furniture                     | Approach it, then use its interaction                       |
| E or Space near furniture           | Approach/use that object                                    |
| Wandering toggle / settings         | Switch autonomous or manual-only mode                       |
| Bottom command bar / folio pages    | Use menus without walking                                   |
| Esc, close button, selected command | Close the folio                                             |
| Ambient view / Return to menus      | Hide optional overlays and fill the viewport with the scene |

Manual movement takes priority. Autonomy resumes after about 20 seconds of inactivity, allowing a requested walk to finish. Furniture footprints, a lightweight navigation grid and smoothed routes prevent walking through solid objects; depth-sorted furniture occludes the scholar appropriately. Activity arrival/departure poses blend gently.

The scholar keeps going while you use the folio. The room stops rendering and simulating when the tab is hidden, then resumes without catch-up. Position and behavior are temporary; no offline character progress or inactivity penalties exist. Reduced motion uses still walking poses and quiet, static reward feedback. Manual-only mode is available if you prefer no independent movement.

## The heroine

The scholar now follows the approved Ripple Academy character design: wavy dark brown hair and purple ribbon, purple/gold embroidered academic jacket, ivory blouse, charcoal skirt, tights, leather boots, dolphin brooch and satchel. The original reference is preserved in `public/art/references/`; the entire presentation sheet is never used as a game texture.

The shared transparent artwork set includes a portrait, four directional idle/blink/stride sets and activity poses for reading, typing, writing, telescope observation, window watching, resting, browsing and celebrating. The portrait appears in the courtyard, RPG HUD and **Keepsake chest → Scholar profile**. The old block character and SVG portrait have been removed.

`public/art/heroine/animations.json` controls source grids, named poses and frame timing. The renderer normalizes alpha silhouettes into aligned 96 × 144 canvases, with the same foot anchor and uniform scaling. Reduced motion uses still poses and disables blinking/breathing. Room artwork, navigation, autonomous behavior and rewards remain separate.

The activity expansion adds type/think/book-consultation work loops, telescope adjustment, chart consultation, tea/coffee, bed rest, and post-session stretching. Desk fronts, chair arms and the quilt occlude the heroine using separate masks; approved character PNGs and room paintings are unchanged. Related frames share registration to prevent scale/anchor flicker. Fully hand-drawn sit/stand/bed-entry transitions and more directional activity variants remain future artwork. See the [current animation status and remaining limitations](docs/art/HEROINE-ACTIVITY-EXPANSION.md).

**Development preview:** open `/?preview=heroine` on the Vite server, for example [the local animation studio](http://127.0.0.1:5182/?preview=heroine). Inspect every animation or individual raw frame, pause/scrub, change zoom, compare foreground occlusion, and test reduced motion. This page does not mount saved progress and is excluded from production builds.

## Real-world activity sessions

Open **Activities** or choose **Begin a real-world activity** on the entrance screen.

Default mappings:

- Coding, engineering and interview preparation → typing in Personal Study.
- Journaling → notebook writing in Personal Study (new default activity).
- Reading/literature and history → Grand Library.
- Astronomy and physics → Observatory.

Choose an activity, optionally associate a quest and a course, and optionally set a focus timer (1–1,440 minutes). Untimed sessions are equally welcome. **Begin activity** takes you to the corresponding room and directs the scholar to appropriate furniture. Reading starts by selecting a book. Longer sessions include related book/chart consultation and small pose variations.

The compact session indicator shows the activity and elapsed time, with Pause, Resume and Finish controls. Reaching a timer target does not force completion or award anything; finish when ready. A paused session holds its time and companion activity. One unfinished session is supported at a time. You can navigate elsewhere and return to its room through the session controls.

**Finish** opens a reflection with optional notes. If a quest is associated, you may mark it complete in the same transaction. The quest awards its existing rewards once; the session itself adds no extra XP or gold. Already-completed quests cannot award again. Retrying session completion is idempotent. Ending a session resumes ordinary autonomous behavior, after any brief reward celebration.

Past sessions, durations and notes appear in Activities. Expand **Activity categories & room mappings** to create, rename, remap or remove categories. Existing session history keeps its original activity title and room.

### Timer persistence

Elapsed time uses a monotonic in-memory clock with atomic checkpoints every ten seconds, and an extra checkpoint on export or page hide when possible. Pausing and finishing save exact current elapsed time. Absolute checkpoints max-merge across tabs, and run IDs reject stale controls, preventing duplicate time or rewards. The running focus timer can continue while the app is open in a hidden tab; decorative scene animation is paused.

Reload starts from the last committed elapsed time and never adds time spent with the application closed. An abrupt close may lose up to roughly ten seconds since the last checkpoint. Import/recovery resets the clock anchor, including in other open tabs, rather than reapplying time from an older in-memory session.

## Personal curriculum and progression

**Curriculum** stores courses with a title, subject, preferred room, exploration notes and current/resting status. Associate sessions with a course if useful. Current courses appear on the entrance. There are no compulsory assignments, deadlines, punitive mechanics or automatic curriculum rewards.

Academic titles derive from XP: Curious scholar, Inquisitive scholar (100 XP), Independent scholar (400 XP), University fellow (900 XP). The existing four keepsakes remain: first quest, first discovery, three completed quests and level 2. Earned keepsakes stay through undo. The definition registry and room decorations/chests leave space for future artifacts, certificates, books and discoveries without adding an elaborate economy now.

## Existing journal, rewards and discoveries

All existing quest creation, editing, deletion, completion, completed views and undo are preserved. XP determines level; gold is separately spendable. Level L requires `100 × (L − 1)²` XP.

Completion awards exactly once. Editing a completed quest preserves the original award snapshot, so undo reverses exactly that amount. Deleting a completed quest retains its earnings and removes the entry; undo first if you want to reverse rewards. Undo after spending may leave negative gold; future earnings restore it and purchases remain blocked until affordable. No interest or additional penalties apply.

Personal real-world rewards remain editable in the shop. Redemption checks affordability transactionally and retains the original title, cost and date in History. Rest, meals and essential self-care are always freely yours. Discoveries, keepsakes and redemption history remain available through the folio page buttons, even when not on the main command bar.

Quest completion plays coins, floating XP, a short companion celebration, animated HUD values and a distinct level-up treatment. Reward sound is off by default. Celebrations briefly interrupt a current activity and resume it when appropriate. Automatic character activities never call the reward system.

## Export, import and recovery

**Save & settings** supports JSON export and validated file or pasted-JSON import. Review the summary before choosing **Import this save**. Import replaces the current journal while saving its predecessor in a recovery slot, in the same transaction. **Restore pre-import save** swaps the two journals, including after restarting. Export copies elsewhere if you want multiple backups.

Exports include quests, shop rewards, redemptions, discoveries, keepsakes, activity categories, courses and session history. Validation checks schema, safe balances, reward ranges, unique IDs, dates, snapshots, known rooms, session phases/times and at most one unfinished session. Invalid data leaves the active and recovery saves untouched. Unknown properties are stripped; import files are limited to 5 MB.

The original database name, IndexedDB version, object store and player key remain unchanged. Milestone 2 fields are optional additions to the version-1 record. Legacy saves load with sensible empty/default views and no reset or destructive migration. No synchronization service is introduced.

Saves belong to this browser profile and origin. Clearing storage removes the active save and recovery copy. Keep exported backups and avoid private browsing for durable progress. Sound, motion, autonomy, thought and entrance-atmosphere preferences are separate localStorage values.

## Architecture

- `src/domain/model.ts`: original quest/currency/discovery rules and the atomic action boundary.
- `src/domain/sessions.ts`: category mappings, courses, session lifecycle and transactional quest association; no rendering dependency.
- `src/domain/sessionClock.ts`: monotonic timer anchoring, pause/resume, max-merge and restore semantics.
- `src/domain/save.ts`: backward-compatible validation, parsing and export.
- `src/domain/keepsakes.ts`: extensible initial achievement definitions.
- `src/persistence/repository.ts`: atomic IndexedDB changes, import and recovery; suitable for a future persistence adapter.
- `src/game/behavior.ts`: reusable finite-state scholar controller, weighted activities, manual override, session direction, thoughts and celebration resumption. No React, Phaser, storage, XP or gold code.
- `src/game/navigation.ts`, `movement.ts`: cached grid, route finding, collision clearance and manual movement primitives.
- `src/game/room.ts`, `rooms.ts`: room-specific destinations, interaction bounds, solids, spawn points and session behavior mappings.
- `src/game/art.ts`, `interiorArt.ts`: original room artwork.
- `src/heroine/`: canonical atlas manifest, alpha/foot normalization, visual animation selection and Phaser texture registration.
- `src/game/scholarView.ts`: canonical sprite selection, furniture offsets and depth-sorted rendering.
- `src/game/sessionActivity.ts`: explicit activity intent mapped to existing room activities; no rewards or storage.
- `src/entrance/`: React entrance stages, seven-layer Canvas2D panorama, asset manifest, scroll math and lazy room previews.
- `src/game/roomPreview.ts`: one-shot snapshots of the actual room painters; no persistence access.
- `src/game/atmosphere.ts`: local time palette helpers. `exterior.ts` retains the earlier exterior renderer for reference and supplies the interior fade helper; the earlier exterior is no longer mounted.
- `src/game/Library.tsx`: React/Phaser bridge and visibility/resize lifecycle for the scene registry.
- `src/ui/`: accessible folio/editor/session/curriculum controls, preferences and optional sound.

Plans: [original architecture](docs/PLAN.md), [visual polish](docs/MILESTONE-1.5.md), [living scholar](docs/MILESTONE-1.6.md), [university milestone](docs/MILESTONE-2.md). See the [Ripple entrance plan](docs/MILESTONE-2.1.md) , the [continuous arrival plan](docs/MILESTONE-2.2.md), and [current verification](docs/VERIFICATION-MILESTONE-2.3.1.md).

## Art and attribution

The original Library, legacy Study/Observatory, crest and keepsake artwork was authored in TypeScript, SVG and CSS for this project. Current illustrated rooms use the supplied or reference-derived artwork documented below. The canonical heroine portrait and transparent pose atlases were generated from the user-approved design reference using the built-in ImageGen tool; see [heroine provenance, prompts and asset status](docs/art/HEROINE-PRODUCTION.md). The entrance adds original raster assets generated with OpenAI ImageGen: academy architecture, courtyard, foreground foliage, carved gateway and ornate wooden doors. Supporting sky, mountain, mist, lake and forest layers are original SVG. See [asset provenance and final prompts](docs/ARTWORK-PROMPTS.md). The architecture, identity and silhouettes are original; no franchise assets, third-party sprites, fonts, photographs or music are used. Reward tones are synthesized locally with Web Audio. Dependencies retain their own licenses in `node_modules`.

The scope remains three intimate rooms and a university entrance. There is no combat, survival system, character needs, authentication, cloud service, mobile layout, external application monitoring or dragon storyline.

## Scholar’s Study — Milestone 2.4

The Personal Study uses the supplied **Sunset Scholar’s Gothic Study** illustration unchanged. Enter through Academic Wings or room navigation. Click the noticeboard for quests, desk or illustrated clock for focus controls, chalkboard for System Design preparation, shelves for research notes, armchair for breaks, and window for reflection. Menus provide the same functions without walking. WASD / arrow keys and click-to-walk remain available.

**Study focus** provides 25-minute focus, 5-minute short break and 15-minute long break intervals. Timer settings accept 1–240 whole minutes per phase, optional automatic transitions and an optional completion chime (also controlled by master mute). Start, pause, resume and reset are saved transactionally. Changes to settings apply to future intervals; resetting an existing interval retains its original duration. Use **Start focus / Short break / Long break** after reset to select a different interval.

Timers use wall-clock deadlines: switching tabs, closing the page or reloading does not stop a running countdown. When an expired timer is next observed, one completed interval is recorded with its original deadline. With automatic transitions enabled, the next interval begins **when the app observes completion**; unattended cycles are never backfilled. Every fourth completed focus interval offers a long break. No timer action awards XP or gold. Existing Activities sessions retain their original active-time accounting.

**Focus Mode** keeps only the Study, heroine, objective, countdown and essential controls. Enter or exit without interrupting the timer. Background animation sleeps in hidden tabs; the countdown reconciles when visible again. Reduced-motion settings apply to existing heroine rendering. A focus activity directs the heroine to writing, laptop work, seated reading or tea; normal autonomous activities resume after reset. Manual movement remains an override.

The quest journal now supports practical objectives, descriptions, checklists, priorities, estimates, room/activity associations, notes, duplication and linked focus histories. New scholars receive Architect of Systems, The Art of Artificial Intelligence and Letters Beyond the Gates (35 XP / 11 gold total). Existing scholars can optionally add this collection; their saved quests are never replaced. Quick add uses 8 XP / 2 gold. Templates and bulk JSON import include preview and validation; see [the import schema and example](docs/quest-import.md).

Complete quests explicitly, with or without a timer. A quest may span several intervals. Completion and undo retain their existing exactly-once reward snapshots. JSON save export/import includes the richer quests and focus timer, using optional fields in the existing version-1 IndexedDB save; there is no destructive migration or database rename.

Artwork limits: the supplied illustration remains a flattened image and the live clock covers its original face. Milestone 2.4.1 adds separate furniture-compatible heroine sheets and calibrated polygon masks; the original approved sprites are preserved. No bed, telescope or large carpet was added to the Study. The sleeping asset remains available in the development animation studio only. Library and Observatory artwork are unchanged.

## Study interaction calibration — Milestone 2.4.1

The Study now has furniture-compatible desk and armchair poses, satchel-free seated activities, shared furniture contacts, polygon foreground masks, contact shadows and drawn sit/stand transitions. Reading, resting and tea retain the same occupied-chair position; desk work keeps a consistent chair contact. Reflection uses the desk chair beneath the large window. The approved room and original heroine PNGs remain intact.

Development preview: `/?preview=heroine&animation=study-reading`. Open **Interaction calibration** to adjust contact X/Y/scale, inspect collision/approach guides, read calibration JSON and freeze entry/exit phases. **Replay approach → sit → activity → leave** runs the real behavior/navigation code without opening saved progress. **Compare original 2.4 contacts** provides a matched before view. Useful query parameters: `baseline=1`, `still=1`, `t=11.5`, `zoom=1|2|3`, `guides=0`, `calibration=1`, `renderer=canvas`. The preview is development-only.

See [the milestone report](docs/MILESTONE-2.4.1.md) for selected asset dimensions, original-pose diagnosis, replacement specifications and furniture relocation dependencies. Furniture was not moved; no Happy Café work was included. Normal controls, saved progress and all XP/gold rules are preserved.

## Room interaction preview and Study follow-up

Use `/?preview=heroine&interaction=1&room=personal-study&activity=study-window` during development. **Room interaction calibration** lists every configured activity in all three existing rooms. Choose one, then **Trigger selected activity** to watch its real approach and hold the activity. Turn off room calibration to inspect individual animation clips. Walking bounds, collisions/routes, approaches, seated/standing anchors, sprite bounds, masks, current frame/facing/scale and blend status are available as overlays and calibration JSON. No saved progress is opened by this preview.

Window reflection now uses the desk chair beneath the window, reusing the compatible thoughtful desk pose. The armchair/side table have not been crudely moved out of the flattened background. See [the follow-up report](docs/STUDY-FOLLOWUP.md) for the exact clean-plate, furniture, shadow, inward-facing sprite requirements and requested before/after screenshots. Player-facing labels use “explorer” and “Journal”; XP thresholds and saved data are unchanged. Happy Café remains out of scope.

## Happy Café (Milestone 2.5)

Visit **Happy Café** from the courtyard, room navigation or **Reward shop**. The café is free to visit: wander, read, watch the lake or relax without spending gold. WASD/arrows, click-to-walk, furniture interactions, autonomy/manual control and Ambient view work here too. The active Pomodoro continues when you visit another room.

The counter/menu board and gift shelves open your existing reward menu. Optionally add six starter ideas (5-gold coffee, 8-gold coffee/pastry, movie evening, takeout, a book and a special treat); existing rewards and prices are preserved. Edit a reward's café presentation to choose coffee, pastry, book or a simple celebration. Choose a reward, review its price/resulting balance, then confirm. Confirmation is saved across reloads and charges once. XP and level never decrease when spending gold.

After redemption she visits the counter or gift shelf and settles into the window seat. **Skip reward animation** keeps the redemption. **History / Rewards for later** distinguishes Redeemed, optionally Enjoyed, and Cancelled/refunded. Unenjoyed redemptions can be cancelled with an in-game confirmation; the original cost is refunded once. Watching an animation never marks a real-world reward enjoyed.

The café uses a clean architectural plate, transparent furniture/prop atlases, same-source foreground cuts, and registered satchel-free seated poses. Its furniture can be moved independently of the walls/window. See [the milestone report and art manifest](docs/HAPPY-CAFE.md), [asset attribution](docs/ASSETS.md), and [generation prompts](docs/art/HAPPY-CAFE-PROMPTS.json).

Development only: `/?preview=heroine&interaction=1&room=happy-cafe&activity=cafe-drink&zoom=1` opens the real room calibration. Trigger any activity or preview coffee/pastry/book/celebration sequences without opening IndexedDB. `trigger=1` starts the selected approach automatically; `sequence=coffee` previews a reward flow, `nav=0` hides navigation guides, `reduced=1` previews reduced motion, and `still=1&t=6` freezes a pose. Collision, approach/exit/seat, sprite bounds, furniture foreground crops, prop anchors and depth metadata are inspectable. This studio is excluded from production bundles.

## Observatory (Milestone 2.6)

Enter **Observatory** through the academy or room navigation. The open dome, brass telescope, dual-monitor desk, lunar instruments and quiet armchair are separate pixel-art layers based on the approved concept. Click furniture or use **E** nearby; WASD/arrows and click-to-walk work as before. **Ambient view** hides optional interface overlays.

**Scientific activity** offers six science categories, an optional objective, quest, experiment and curriculum project. Timed activities use the **existing Pomodoro**; untimed exploration is welcome. Pause/resume controls stay linked, Focus Mode stays in the Observatory, and countdowns survive navigation/reload. A timer never completes a quest automatically. Scientific activities, the telescope, notes and relaxation are free.

**Observation journal** stores your own observations, numerical results, source URL, local-file reference text and next questions. Optionally link a quest, session or scientific project. These are user-written notes; monitor plots and sky artwork are illustrative. Local reference paths are not read or uploaded. **Scientific projects** reuse Curriculum, with associated quest/session/observation counts.

The animation studio supports all17 Observatory activities, eye/eyepiece/hand/foot contacts, furniture masks and replay: `/?preview=heroine&interaction=1&room=observatory&activity=telescope&guides=1`. Existing character art is preserved; four telescope frames are added. The foreground atlas can be examined; notebook writing uses the workstation until a compatible foreground-table pose is supplied. See [the milestone report](docs/OBSERVATORY.md), [art attribution](docs/ASSETS.md) and [visual evidence](docs/evidence/observatory/README.md).
