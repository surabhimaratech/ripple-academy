# Milestone 2.4.1 — Study interaction calibration

## Completed implementation

Inspected the supplied room, approved atlases, normalization, animation programs, behavior state machine, navigation grid and render masks before changing interactions. Extended the development preview first: original-2.4 comparison, live contact offsets/scale, JSON readout, collision/approach guides and matching furniture views. Subsequent additions include frozen transition-phase inspection and replay of the real approach → sit → activity → stand → departure sequence. The preview never opens IndexedDB or grants rewards and is excluded from production.

`src/game/furniture.ts` is the shared source of Study furniture approach/exit points, occupied contacts, scale, seat support, collisions, foreground polygons, frame maps and shadows. These are world-space coordinates on the unchanged 1280×720 illustration projection. The room’s 1672×941 source PNG remains byte-identical. Rendering maps approved activity intent to Study-specific art; behavior and rewards stay separate.

Desk typing, alternating hands, thinking, consulting a book, page-turning and notebook writing now use rear three-quarter chair-compatible poses without satchels. Body and legs occupy the illustrated chair. The apron, drawers, backrest and chair posts occlude only their actual polygon regions; the central leg opening is visible.

Armchair reading, page turns, looking up, blinking, resting and tea use a new chair-compatible family. Hips rest on the cushion, lower legs hang below bent knees, and no satchel/strap appears. The first art pass still had short lower legs; the selected v2 corrects that anatomy. All armchair activities share one fixed contact and scale. Switching activity at an occupied chair retains that contact instead of replaying entry. Blanket, armrest and cushion-edge masks leave the knees and lower legs visible. Seat and floor contact shadows anchor the character.

Study-specific drawn standing and half-standing frames support entry/departure, with brief blends and eased local contact motion. Navigation stays on valid floor; an occupied furniture transition is distinct from free walking through solids. Manual movement waits for standing-up completion. Reduced motion snaps render contacts to their resting endpoints. Celebration preserves the occupied contact and resumes the activity.

Window reflection now takes place at an accessible floor viewpoint facing the large window, rather than beside the right cabinet. The desk blocks direct access to the glass; the heroine watches the window from the open floor. Her feet stay on that navigable floor point.

Player-facing terminology now uses **Focus timer**, **Scholar: autonomous**, **Manual control** and **journal**. Saved keys, quest/reward rules, focus accounting, IndexedDB schema, other room artwork and original heroine PNGs are unchanged. No Milestone 2.5 or Happy Café work is included.

## Selected art and original-asset diagnosis

| Asset | Source dimensions / grid | Usage |
| --- | --- | --- |
| `public/art/heroine/study-armchair-v2.png` | 1586×992, 4×2 (fractional cell boundaries partitioned deterministically) | Eight registered seated reading/page/look/blink/rest/tea poses; normalized height 116 |
| `public/art/heroine/study-desk-v1.png` | 1536×1024, 4×2, 384×512 cells | Seven desk work frames plus an alternate rise pose available in raw-frame inspection; normalized height 126 |
| `public/art/heroine/study-transitions-v1.png` | 1254×1254, 2×2, 627×627 cells | Front/rear standing and half-standing; normalized maximum height 112 within each perspective group |

All frames normalize to the existing 96×144 transparent runtime canvas with baseline (48,136). Original assets are not overwritten. New art was generated with the built-in imagegen tool from approved identity references; prompts and invariants are recorded in [the prompt set](art/STUDY-INTERACTION-PROMPTS.json).

The unsuitable original assets were `public/art/heroine/activities.png` (1448×1086, 4×3, 362×362 cells): seated read/page at row 0 columns 0–1, typing at row 0 columns 2–3, writing at row 1 columns 0–1, and rest at row 2 column 0. Those poses fold the legs underneath the body and include a satchel. `public/art/heroine/activity-expansion.png` (1448×1086, same cell grid) has the same issue in thinking/consulting (row 0 columns 0–2) and tea (row 1 columns 0–1). They are retained for backward visual reference and other rooms; Study frame maps select the compatible replacements.

Future replacement art should use equal 512×640 transparent source cells (2048×1280 for a 4×2 sheet), the approved adult identity, a fixed hip/knee/boot registration and no satchel. Armchair perspective is elevated front three-quarter facing screen-right; desk perspective is elevated rear three-quarter facing up-left. Required poses are seated book idle/page/look/blink, hands-on-lap rest, mug hold/sip, typing A/B, thinking, consulting A/page B, pen A/B, and front/rear stand/half-stand. Furniture must remain separate from character art. Runtime dimensions and baseline remain 96×144 / (48,136).

## Furniture relocation feasibility and outstanding art dependencies

Furniture relocation was evaluated and intentionally not performed. The approved room is one flattened illustration: moving the chair or desk would expose missing floor/wall pixels and leave embedded shadows, cushions and furniture edges behind. Safe relocation requires an approved clean room plate and transparent furniture layers, preserving the same perspective and lighting:

- A furniture-free room at source 1672×941 or registered runtime 1280×720.
- Armchair back/cushion layer, near and far armrests, foreground blanket and cushion lips, legs, and separate floor shadow.
- Desk body, tabletop/apron/drawers, chair backrest/seat/legs, and separate cast shadows. Laptop and books remain separate when editable.
- Full-canvas transparent 1280×720 layers, or tightly cropped PNGs with explicit world origins; no baked heroine, text overlays, or opaque bounding backgrounds.

No blocking artwork dependency remains for the implemented Study contacts. Masks are calibrated polygons over a flattened painting, not extracted furniture layers; they approximate fine upholstery/hair intersections. Transitions use drawn intermediate poses and brief blends, not a full skeletal/IK animation. More authored in-betweens and layered furniture would improve close-up polish and are future artwork work, not silently substituted placeholders. No separate satchel prop was added without suitable prop art.
