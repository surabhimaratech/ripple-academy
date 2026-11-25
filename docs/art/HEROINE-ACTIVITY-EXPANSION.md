# Milestone 2.3.1 — activity expansion and inspection

The four approved character PNGs (`portrait`, `locomotion`, `activities`, `telescope`) and palette are byte-for-byte unchanged. The supplied sprite presentation is activity inspiration only; it is not used as an in-game texture. No room artwork was redesigned or repainted. The only new raster is `public/art/heroine/activity-expansion.png`, 1448 × 1086 RGBA, a 4 × 3 grid of isolated supplemental poses generated with the built-in ImageGen tool using approved `activities.png` as the strict identity/proportion/palette reference.

## Completed animation coverage

| Activity | Implementation |
|---|---|
| Sitting / working at a desk | Fixed contact rigs and desk-front masks hide the lower body naturally behind the existing desks. Approved seated frames retained. No foot-position tween. |
| Typing / thinking / consulting a book | 36-second quiet work program: alternating hands, a four-second thinking pause, more typing, seven seconds consulting/page-turning, a brief pause, then repeat. Same desk/contact anchor throughout. |
| Notebook / celestial notes | Approved writing pair retained; charts alternate notes and book/chart consultation. |
| Seated reading | Approved book/page-turn poses, now with chair-arm foreground masks. |
| Telescope | Approved eyepiece pair retained, plus a short adjustment phase with a new reaching hand pose. Instrument stays in the room painter. |
| Bookshelves | Approved shelf reach → held book cycle retained with gentle pose crossfades. |
| Interesting objects | New small brass keepsake examination pose, used at chests; no large pedestal/globe baked in. |
| Window | Approved back-facing pose plus a new thoughtful hand-to-chin variation. |
| Tea / coffee | New seated hold/sip loop, available autonomously in Study and Library armchairs. Drinks remain free; there is no need or currency mechanic. |
| Relaxing | Approved resting pose retained and aligned/masked in armchairs. |
| Sleeping | New curled, eyes-closed pair; separate existing bed and quilt remain foreground art. Optional Study activity, with no fatigue system or offline simulation. |
| Stretching | New gentle shoulder-stretch pair, available autonomously. One stretch is queued after a Study session ends when autonomy is enabled and manual input is inactive. Manual input cancels the queue. |
| Celebrating | Approved quiet celebration retained with the existing quest/reward effects and interruption/resumption rules. No extra reward action is introduced. |

There are 42 named source cells and 27 inspection catalog entries. Walking remains the approved four-direction short cycle. The old unused `observe-provisional` cell stays inspectable as raw reference and is still not used in production.

## Registration, transitions and occlusion

`animations.json` assigns related cells to registration groups. `registeredFrames` computes one scale and horizontal reference per group, with a common boot baseline. A changing hand or book no longer recenters/stretches the whole body independently. Source PNGs are never rewritten. Normalized output stays 96 × 144 with origin (48,136), using nearest-neighbor sampling and cached canvases.

`presentation.ts` defines render-only contact anchors and foreground rectangles for the current desks, armchairs and quilt. Navigation points remain on collision-safe floor; occupied-chair/bed render positions are separate from those approach points. `visibleRegions` subtracts foreground rectangles into positive mask regions, working in both Canvas and WebGL. Inverted geometry masks were deliberately avoided because Phaser's Canvas renderer does not support that inversion.

`ScholarView` uses a short 200 ms outgoing/incoming pose crossfade when changing activity/semantic phase. Each pose stays at a fixed anchor; feet are not slid between floor and furniture. Related loop frames keep one registration and are not crossfaded individually. Renewing the same activity at the same location no longer inserts a transient standing/walking frame. Reduced motion disables crossfades, blinking, breathing and loop variation, retaining the correct still pose.

`programs.ts` and `animation.ts` select visual phases only. The existing state machine keeps navigation, manual override, activity durations, pause/resume and celebration resumption. The new after-session queue is optional room configuration. No XP, gold, quests, persistence or save schema code changed.

## Development animation studio

Run the normal Vite development server, then open:

```
http://127.0.0.1:5182/?preview=heroine
```

Use the actual port printed by Vite if different. For a particular entry, append `&animation=work`, `&animation=tea`, `&animation=sleep` or another catalog ID. `&renderer=canvas` exercises the Canvas fallback.

Controls include an animation selector covering all available cycles/poses, actual matching room/furniture or a checkerboard inspection grid, raw-frame selection for all 42 cells, pause/play, timeline scrubbing, small time steps, 1×/2×/3× view, reduced-motion stills, foreground occlusion toggle and contact/canvas/mask guides. Room cameras are bounded to avoid showing void beyond the existing backgrounds.

The studio reuses the production atlas importer, pose selector, contact rigs, masks and renderer. It never mounts `App` or imports the persistence repository. It does not write saved progress or produce rewards. The entry is guarded by `import.meta.env.DEV`; its component, catalog and stylesheet are excluded from the production bundle. Hidden tabs sleep the preview loop and do not catch up offline time.

## Remaining limitations / next artwork pass

- These remain short, deliberately quiet cycles. Fully hand-drawn sit-down, stand-up, climbing into bed, and lowering arms between stretches are not supplied; anchored crossfades bridge those transitions.
- Activity artwork has limited authored facing variants. Exact chair/hand/eyepiece contact is calibrated to the current stylized room geometry and should be rechecked when the next milestone supplies new room art.
- The telescope adjustment, object examination and thoughtful window variations each have one new principal pose; smooth multi-frame arm/neck in-betweens would need additional artist work.
- Approved walking was preserved rather than regenerated. A longer gait is outside this expansion's scope.
- No geometric replacement character or baked-in desk, laptop, bed, chair or telescope is used. New handheld books, mug and keepsake are part of the character art as allowed.

## Exact supplemental prompt — built-in ImageGen mode
Use case: stylized-concept. NEW SUPPLEMENTAL transparent sprite atlas for Ripple Academy. The first supplied image (approved activities.png) is the STRICT style/identity/proportion/palette reference: match this exact adult heroine, her face, long wavy dark brown hair/purple ribbon, tailored purple gold-embroidered academic jacket, ivory blouse/ribbon, charcoal skirt/tights, lace-up brown boots, golden dolphin brooch and crossbody leather satchel. Do not redraw or replace existing frames. The second supplied presentation sheet is ACTIVITY INSPIRATION only; do not copy its furniture, labels or layout. Fine richly shaded mature 16-bit pixel art. Not chibi, no exaggerated motion. Create 12 NEW isolated poses on a LANDSCAPE 4:3 transparent canvas in exactly FOUR equal columns by THREE equal rows, one figure per cell with generous clear alpha margins. Same head/body scale and palette as approved art in every cell, no overlap. Seated figures have identical scale to approved seated art; standing figures identical to approved standing art. No desks, laptops, chairs, beds, blankets, pillows, telescopes or ground shadows; all are already in-game. Small handheld books/quill/mug/object allowed. Row1: col1 seated rear-three-quarter facing upper right, pausing at work with one hand thoughtfully near chin; col2 seated SAME rear-three-quarter position consulting a small open book with both hands near upper torso; col3 SAME pose turning one page (nearly identical posture); col4 standing side profile facing SCREEN RIGHT, adjusting an unseen telescope with one hand reaching forward at eye level, other hand at waist, same slight lean as approved telescope sprite. Row2: col1 seated front-three-quarter, holding a small ivory tea mug near chest; col2 SAME seated pose bringing mug to lips, almost identical body/legs; col3 standing front-three-quarter, beginning a gentle shoulder stretch hands raised behind head; col4 SAME standing gentle stretch slightly extended, no jump. Row3: col1 lying curled gently on her side, head SCREEN LEFT and feet right, eyes closed sleeping (no bedding), full body comfortably curled to fit cell; col2 SAME sleeping pose tiny breathing variation no change in outline/scale; col3 standing front-three-quarter closely examining a small brass keepsake held in her hands; col4 standing back/rear-three-quarter, looking thoughtfully up at an unseen window, hand lightly near chin. Keep precise coherent scale/boot baselines for each matching pair. Transparent alpha outside every figure. No text, borders, grid lines, watermark, scenery or geometric placeholder art.
