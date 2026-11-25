# Personal Study follow-up

## Implemented

Window reflection now uses the **existing workstation chair beneath the large window**, rather than a standing waypoint in front of drawers or the right cabinet. The window is behind the solid workstation; plants and furniture leave no convincing walk-to-glass position in the approved image. The activity uses the reachable desk approach, the same seated contact/collision/foreground system as desk work, and the existing rear three-quarter thoughtful pose. She faces toward the window, with no floor path through the desk. A bespoke head-turn/blink gaze loop would need additional sprite art; no unsuitable standing pose was cropped into a seated substitute.

The development preview now offers **Room interaction calibration** with all actual activities in Grand Library, Personal Study and Observatory. Select a room/activity for immediate pose inspection, then **Trigger selected activity** to watch the real approach and hold that activity without waiting for autonomous selection. The existing replay also demonstrates departure. All of this remains development-only and never opens IndexedDB or generates rewards.

Inspection includes walking boundaries, furniture collision polygons (the existing rectangular collision geometry), navigation routes, the character’s foot collision footprint, approach waypoints, seated contacts/support points, standing anchors, padded canvas bounds, actual normalized sprite bounds, foreground masks, scale, facing direction, current state/frame and transition/blend status. Calibration JSON contains the same metadata. The original animation-clip mode remains available separately.

Player-facing labels now use **Curious explorer**, **Inquisitive explorer**, **Independent explorer**, **Lifelong explorer**, **Journal**, **Your journey**, **Your progress**, **Autonomous movement**, and “She continues her day while you use the journal.” The courtyard welcomes an explorer. Internal identifiers and progression thresholds are unchanged; no save migration or account system was added.

## Furniture relocation: not implemented without revised artwork

The armchair and side table **remain in their approved left-hand position**. Their overlap with the left bookshelf/ladder cannot be removed cleanly by moving runtime objects, because the furniture, background behind it, lighting and shadows are baked into `public/art/rooms/personal-study.png` (1672×941). That file remains byte-identical. The left shelf’s current side approach and conventional journal access remain available, but the preferred unobstructed left-hand layout is an outstanding artwork dependency.

The requested right-hand foreground arrangement is feasible with a clean plate and separated furniture, **not by translating a crop**. It must preserve the left bookshelf/ladder and workstation under the large window, keep the chair angled inward, and reserve clear approach routes to the cabinet, chalkboard and quest noticeboard. The existing foreground plant also occupies the proposed chair area and must be composed on a separate layer. No automatic erasing, crude cloning, mirrored furniture crop or background regeneration was performed.

## Exact artwork deliverables for clean relocation

1. **Clean room plate** — proposed `public/art/rooms/personal-study/clean-room.png`, 1672×941 source (or an exactly registered 1280×720 runtime plate). Remove the original armchair, blanket, side table, table props and their shadows; reconstruct the newly visible books/floor/wall convincingly. Preserve the left bookshelf, ladder, Gothic window, desk/laptop, chalkboard, quest board and right cabinet. The approximate old chair/table retouch region is source X 0–455, Y 455–845; this is an artist’s reconstruction region, not a rectangular runtime erase mask.
2. **Inward-facing chair** — `armchair-back.png` and `armchair-front.png`, transparent 1280×720 registered layers or tightly cropped PNGs with explicit world origins. The chair belongs in the right foreground facing screen-left toward the room. Separate the cushion/backrest from near/far armrests, blanket, cushion lips and legs so she can enter and occupy it naturally.
3. **Side table and props** — `side-table.png`, with separate mug/flowers/steam if independently animated, plus a registered `furniture-shadows.png` or individual shadows. Place the table on the inward side while retaining a cabinet approach corridor. Supply separate `foreground-plants.png` for the existing right-side foliage so it does not obscure the new chair or interactions.
4. **Composition constraints** — keep the chalkboard and noticeboard visibly clear above the chair; keep an open route from the central floor to the cabinet. A candidate chair footprint near world X 1040–1265, Y 610–695 and a table to its left must be reviewed against actual perspective and sprite reach. The current cabinet approach at (1016,630) would need to be recalibrated outside that footprint, for example near the cabinet’s left front. These are layout constraints, not implemented or approved relocation coordinates. Leave a generous central walking corridor and validate every approach after art arrives.
5. **Matching inward-facing character art** — the current `public/art/heroine/study-armchair-v2.png` is 1586×992, 4×2, elevated front three-quarter facing screen-right. The relocated chair requires **screen-left-facing** read/page/look/blink/rest/mug/sip poses, plus matching stand/half-stand transitions. Do not blindly mirror the current sheet: lighting, ribbon, embroidery and brooch placement must remain faithful. Recommended delivery: 4×2 sheets of equal 512×640 transparent cells (2048×1280), fixed hips/knees/boots, no satchel, normalized to the existing 96×144 runtime canvas and (48,136) foot baseline.

After those assets arrive, update chair/table world origins, furniture collision polygons, left-ladder collision geometry, seated/standing contacts, approach and exit waypoints, depth, masks and shadows together. Re-test left shelves/ladder, desk, cabinet, chalkboard and noticeboard access at laptop sizes. The current desk and its approved sprite sheets need not be redesigned.

## Optional dedicated window-gazing sprites

Current seated reflection reuses `public/art/heroine/study-desk-v1.png` (1536×1024, 4×2, 384×512 source cells), thinking frame at row 0 / column 2, with subtle existing idle movement. For a bespoke gaze loop, provide a separate `study-window-gaze.png` with two to four transparent 384×512 cells, matching that rear three-quarter up-left perspective and exact body/hip/boot registration: relaxed hands on desk, head looking beyond the laptop toward the window, blink, slight thoughtful head turn. Runtime height 126, canvas 96×144, baseline (48,136); chair backrest/apron foreground masks remain separate. This is polish artwork, not a blocker for the implemented seated alternative.

## Regression and visual verification

- **138 tests across 19 suites pass**; TypeScript checking and production Vite build pass. The existing Phaser bundle-size advisory remains.
- Every configured activity in all three rooms is directly triggerable in unit tests, reaches its destination on valid floor, and emits no menu/reward events.
- All nine Study activities were triggered through the actual developer UI at **1440×900 and 1366×768**, including approach and settled contact checks. Reading, writing, typing, reflection, research shelves, cabinet, tea, stretching and rest were covered. Room switching and direct Library/Observatory triggers were also checked in the browser.
- Quest, Pomodoro, Focus Mode, XP/gold and IndexedDB mechanics remain unchanged; their regression suites pass. No new background or character assets were generated or altered in this follow-up.
- Production bundles exclude the developer interaction UI. Existing saved progress on port 5182 is untouched; browser verification uses port 5184 and the save-free developer preview.

Detailed browser evidence: [18 interaction checks](verification/study-followup/interaction-checks.json), [calibration overlay](verification/study-followup/calibration-mode.png), [window contact metadata](verification/study-followup/window-calibration.json), and [player UI terminology](verification/study-followup/player-ui.png).

### Requested before-and-after captures

Typing, thinking, writing and armchair reading retain their approved compatible poses; their before/after images verify preservation. Window reflection changes from standing in front of furniture to occupying the workstation chair.

| Interaction | Before | After |
| --- | --- | --- |
| Typing | [Before](verification/study-followup/typing-before.png) | [After](verification/study-followup/typing-after.png) |
| Pausing to think | [Before](verification/study-followup/thinking-before.png) | [After](verification/study-followup/thinking-after.png) |
| Writing notes | [Before](verification/study-followup/writing-before.png) | [After](verification/study-followup/writing-after.png) |
| Reading in the armchair | [Before](verification/study-followup/reading-before.png) | [After](verification/study-followup/reading-after.png) |
| Window reflection | [Before](verification/study-followup/window-before.png) | [After](verification/study-followup/window-after.png) |

All other remaining layout work above depends on revised artwork. No Happy Café implementation was started.
