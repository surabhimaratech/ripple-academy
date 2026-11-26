# Observatory — Milestone 2.6

The existing `observatory` location now uses a layered nighttime research room based on the approved concept. Existing room/activity IDs, saves, Study/Café paintings and heroine assets are retained. This milestone adds no dependencies, backend, scientific APIs or live data.

## Delivered

- Independent architecture/open dome, Milky Way/mountains, brass telescope, dual-monitor workstation/chair, teal armchair/blanket, side table, lunar globe/armillary instruments, instrument chest and foreground atlas table. Foreground cuts come from their corresponding complete furniture original.
- Seventeen activities with connected approach points: arrival, telescope observation/adjustment, analysis/typing, thinking, notebook recording, galaxy diagram, celestial coordinates, astronomy reference, lunar globe, instrument chest, armillary sphere, foreground atlas, armchair reading/rest, railing sky view and departure.
- Four new telescope frames (observation A/B and adjustment A/B); approved walking, seated, reading, thinking, notebook and transition frames reused. All 66 previous manifest frames and existing clips are unchanged; 70 frames total. The new loop is registered by boot contact to avoid hand movement shifting the body. No observation platform is necessary at the calibrated height.
- Six explicit scientific session categories, optional objective, quest, project/experiment name, curriculum project and duration. Custom saved category lists are preserved; **Add scientific activities** merges missing IDs on request.
- Timed Observatory sessions start the existing Pomodoro in the same repository transaction. Untimed sessions leave it alone. Pause/resume synchronize linked sessions; finishing an activity ends its linked countdown without inventing a completed interval. Breaks use the existing controls and armchair behavior. Focus Mode and navigation are room aware; reload retains timer deadlines and committed session time.
- Lightweight **Observation journal** within the existing Journal. Create/view/edit/delete date, category, notes, objective, results, URL, local-reference text, next steps and optional quest/session/project links. Deleted associations remain readable and survive later edits. No scientific findings are generated; numerical results are explicitly user recorded. Source URLs accept plain HTTP(S), without credentials. Local paths are text only: no file reading or upload.
- Scientific projects reuse curriculum `Course` records. Quests, sessions and observation entries can share `courseId`; project cards summarize associations. No new project-management system.
- Free exploration, WASD/arrows, click-to-walk, furniture clicks/E, default autonomy, 20-second manual override, Ambient view, mute and reduced motion. Hidden tabs use the existing Phaser loop sleep and timer checkpoint infrastructure; there is no offline reward simulation.

Only explicit real-world quest completion changes XP/gold. Science, notes, breaks and autonomous activities are free. The existing optional completion checkbox remains available when finishing a quest-linked session, but defaults **unchecked for Observatory sessions**. Focus intervals never complete quests.

## Source artwork and layers

All paths below are repository relative. Original reference: `docs/art/references/observatory-concept.png`, **1670×941**, user supplied. It is documentation, not a runtime background. Generated layers preserve its composition/palette and are recorded in [the prompt manifest](art/OBSERVATORY-PROMPTS.json).

| Runtime PNG | Source dimensions | Layout / use |
| --- | --- | --- |
| `public/art/rooms/observatory/architecture-v1.png` | 1670×942 RGBA | Clean architecture/floor/railing/charts, transparent dome opening; full 1280×720 scene |
| `public/art/rooms/observatory/sky-v1.png` | 1672×941 RGB | Sky/mountains behind the transparent opening; display 1000×430 centered (850,135) |
| `public/art/rooms/observatory/furniture-v1.png` | 1536×1024 RGBA | 2×2: telescope, workstation, armchair, instrument table |
| `public/art/rooms/observatory/details-v1.png` | 1536×1024 RGBA | 2×2: workstation chair, foreground atlas table, side table, optional observation step (unused) |
| `public/art/rooms/observatory/chest-v1.png` | 1536×1024 RGBA | Standalone instrument chest, transparent margins |
| `public/art/heroine/observatory-telescope-v1.png` | 1199×1312 RGBA | 2×2 observation A/B, adjustment A/B; normalized into 96×144 canvases, foot (48,136), target height112 |

`src/game/observatory.ts` is authoritative for transforms, contact anchors, bounds, obstacle footprints and activity configuration; `observatoryArt.ts` preloads and composes the layers. Alpha silhouettes are trimmed at runtime, not destructively edited. Filtering is nearest-neighbor. Furniture origins are bottom center; sky/architecture origins are center.

| Prop | Bottom-center (x,y) | Display w×h | Depth / front depth |
| --- | --- | --- | --- |
| Telescope | 825,470 | 350×355 | 470 / 536 |
| Workstation | 310,556 | 480×240 | 556 |
| Desk chair | 405,565 | 145×205 | 410 / 580 |
| Armchair | 125,700 | 240×265 | 480 / 702 |
| Side table | 345,700 | 150×220 | 700 |
| Instruments | 1140,550 | 270×260 | 550 |
| Chest | 1140,555 | 155×105 | 555 |
| Foreground atlas | 1070,750 | 480×235 | 740 |

Architecture depth0, sky−10, twinkles−5, furniture contact shadows1. Foreground fractions (x,y,w,h): telescope mount (.36,.48,.64,.52), ocular (0,.38,.30,.26), chair back (.55,0,.45,.8), armchair blanket (0,.30,.4,.7), opposite armrest (.8,.4,.2,.25). These are crops from the **same** source image and transform, not independently generated masks.

Character contact shadows/tint and conservative desktop/drawer sprite masks are defined separately from furniture rendering. Desk occupied depth570; armchair695. Standing depth follows world foot Y, with foreground table and relevant furniture naturally in front.

## Interaction calibration

World is 1280×720, with walkable floor x35–1240 / y435–710. A lightweight grid routes around desk/chair, armchair, side table, mount, instrument cabinet and foreground table. All 17 activities are mutually reachable. Seated rendering interpolates approach → compatible sit transition → occupied anchor → stand → clear exit; navigation remains outside furniture solids.

| Contact | Approach / exit | Occupied reference | Scale |
| --- | --- | --- | --- |
| Workstation | 565,600 | foot370,550; seat380,474 | 1.85 |
| Armchair | 260,710 | foot154,690; seat135,586 | 2.1 |
| Telescope | 625,521 | ocular lip656,307; eye offset(14.5,−99.5); hand offset(22,−102) → control672,302 | 2.15 |
| Railing sky view | 985,445 | Standing, facing sky | perspective scale |

Telescope eye/control measurements are source pose landmarks for visual calibration, not an inverse-kinematics system. Observation and adjustment share the same feet/eye placement. At room scale, subtle breath/blink and small focus-adjustment differences preserve contact.

Development only: `/?preview=heroine&interaction=1&room=observatory&activity=telescope&zoom=2&guides=1`. Select any activity immediately, inspect source frames, reduced motion, arrival/departure blend, sprite bounds, collisions, seat/foot/eye/hand/prop anchors, foreground crops and depth metadata. **Replay approach → sit → activity → leave** uses the production behavior/rendering code. `trigger=1` holds the selected actual activity after navigation. Preview never opens the save repository or awards rewards and is excluded from the production bundle.

## Persistence and extension points

IndexedDB remains `magical-university`, version1, store`save`, key`player`, recovery key`before-import`. Optional fields are validated on import/export: `Discovery.observation`, session objective/experiment, quest courseId, focus room/activity/sessionId/courseId and history context. Legacy saves round-trip unchanged; categories/room IDs are not rewritten. All economic operations still use the existing serialized repository transaction.

Behavior, environment configuration, sprite presentation, persistence and reward mechanics remain separate. `scientificSurfaces.ts` records illustrative monitor quadrilaterals, `telescopeContact` records instrument landmarks, and the separate sky plate can be replaced later. A future local scientific visualization can use these surfaces without changing furniture, sessions or rewards. No data adapter, Python runtime, API connection, credentials or scientific analysis is implemented. The artwork’s displays are explicitly illustrative.

## Validation and evidence

- **178 tests, 24 suites pass**, including all existing regressions, science/timer linkage, duplicate starts, stale timer controls, explicit quest rewards, no automatic awards, safe journal validation/round-trip, concurrent repository persistence/recovery, boot registration and every Observatory activity entering/holding/leaving/resuming after manual input.
- TypeScript `tsc -b` and Vite production build pass. Existing large Phaser chunk warning remains; no dependency was added. Developer preview remains outside the build.
- Browser checks at **1440×900 and 1366×768**: all 17 occupied activity compositions captured; close-up eye/hand/ground contact, typing/thinking/notes, armchair reading/rest, charts, globe, atlas, railing and developer masks inspected. The short recorded telescope replay verifies actual approach/activity/departure, rather than just configured coordinates.
- UI checks on isolated `127.0.0.1:5190`: scientific project creation; timed session/objective/project association; synchronized pause/resume; navigation to Café and reload with paused timer retained; Focus Mode; manual floor navigation/keyboard override; reduced motion/Ambient view; observation create/edit/reload/delete; explicit starter quest15XP/5gold; Café coffee redemption5gold; return with history and15XP/0gold retained. User save on5182 was not opened or modified by QA.
- Screenshots and clip: [evidence index](evidence/observatory/README.md). Captures labelled with viewport/activity are actual browser UI; the text inspection log records settled state/scale/contact, not a substitute for visual review.

## Remaining artwork limitations

**Foreground-table writing is not shipped.** The heroine approaches the left side and examines the open atlas; journal recording uses the reachable scientific workstation and its compatible notebook pose. The current near-overhead foreground perspective cannot support a natural seated writing pose using the approved desk sprites.

Exact dependency: `public/art/rooms/observatory/details-v1.png`, 1536×1024 RGBA, upper-right 768×512 cell, rendered at480×235 bottom-center(1070,750). Keep this approved table original. For writing *at this table*, supply a matching rear/three-quarter, slightly elevated standing or stool-seated writing set on **96×144 transparent character canvases**, foot(48,136), same heroine design, satchel-free seated pose, idle/writeA/writeB/think plus entry/exit frames. Hands must reach the notebook’s near-left writing edge; hips require a separately drawn matching stool if seated. Supply separate transparent stool back/cushion and foreground table-rim/notebook/ink occlusion layers registered to the same768×512 cell. Preserve the source table’s wood/brass lighting; do not force the existing left-facing workstation pose into this perspective. Recalibrate approaches, seat/feet, collision and masks when this artwork arrives.

No other required room artwork is marked placeholder. Generated layers are original adaptations of the supplied reference, not exact pixel extractions of the flattened concept. The existing transition sprites give a restrained blend, not fully hand-drawn contact-specific choreography. Galaxy diagrams can be considered from the workstation; the fixed rear wall behind the workstation is not a walk-through area. Display plots and the Milky Way remain decorative, never live science. No additional room or real astronomical integration was started.
