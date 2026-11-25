# Canonical Ripple Academy heroine

Approved reference: `../references/ripple-academy-heroine-design-sheet.png`. Do not load the presentation sheet as a game texture.

Identity: young adult scholar; long wavy dark brown hair, purple ribbon, warm brown eyes; royal purple embroidered academic jacket with antique gold details, ivory blouse/ribbon tie, charcoal pleated skirt, tights, lace-up brown boots, dolphin brooch and crossbody satchel. Palette roles are in `palette.json`.

`animations.json` is the runtime source of truth for atlas files/grids, frame names, target sizes and playback. The atlas importer fits each alpha silhouette uniformly to a 96 × 144 canvas, foot anchor (48,136). Keep every character fully inside its cell, with clean transparency and no furniture or labels. New outfit/pose assets should replace entries, not alter behavior or collision logic.

Delivered: separate portrait; 16 directional locomotion cells; 12 activity cells (one provisional observing cell unused); two eyepiece cells. Idle blinking, short directional walks, reading/page turn, two-frame typing/writing/eyepiece adjustments, authored window/rest/browse/book/celebration poses. Reduced motion freezes animation.

Limited/future: full eight-frame gait, directional activity variants, hand-authored sit/stand transitions, and artist refinement of desk/chair/eyepiece contact. Window/rest use still art plus breathing; they are not full custom multi-frame cycles. No geometric character placeholders are used.

See `../../../docs/art/HEROINE-PRODUCTION.md` for the complete status matrix, original asset dimensions, canonical reference provenance and exact built-in ImageGen prompts.
