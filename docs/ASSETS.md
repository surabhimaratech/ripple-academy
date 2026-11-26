# Asset attribution

## Personal Study (Milestone 2.4)

`public/art/rooms/personal-study.png` is an unchanged copy of the user-supplied, approved `Sunset Scholar’s Gothic Study.png` (1672 × 941). Used directly with permission through the milestone request; no regeneration, reinterpretation or external asset acquisition. Original source retained at repository root. The image is flattened: the clock face is covered at runtime with an accessible SVG/HTML timer and heroine occlusion masks affect only the sprite. Room art remains separate from approved character assets. No license for third-party redistribution beyond the supplied project is inferred.

## Study-compatible heroine poses (Milestone 2.4.1)

New, separate transparent sprite sheets: `public/art/heroine/study-armchair-v2.png`, `study-desk-v1.png` and `study-transitions-v1.png`. Created with built-in imagegen using the approved heroine assets and supplied Study illustration as identity/perspective references. No external asset packs or paid runtime services were added. Originals remain unchanged. The armchair first pass was superseded by v2 to correct lower-leg anatomy; it is not shipped as a runtime asset. See `docs/art/STUDY-INTERACTION-PROMPTS.json` for the prompt set and `docs/MILESTONE-2.4.1.md` for dimensions, layer requirements and usage.

## Happy Café (Milestone 2.5)

User-supplied concept: `docs/art/references/happy-cafe-concept.png` (1672×941), retained as a reference. The flattened concept is not used as furniture or crudely erased. New original project artwork was generated with the **built-in image_gen tool**, using that concept and the approved heroine sheets as references; no downloaded asset packs or new third-party attribution obligations were introduced. Full prompts, including the pastry strap correction, are recorded in `docs/art/HAPPY-CAFE-PROMPTS.json`.

- `public/art/rooms/happy-cafe/base-v1.png` — 1672×941 clean architectural plate.
- `public/art/rooms/happy-cafe/furniture-v1.png` — 1536×1024 RGBA, 2×2 atlas: complete counter, gift shelf, chair, table. Foreground cuts are drawn from these exact originals.
- `public/art/rooms/happy-cafe/props-v1.png` — 1536×1024 RGBA, 2×2 atlas: coffee, pastry, open book, plant.
- `public/art/heroine/cafe-pastry-v1.png` — 1774×887 RGBA, 2×1 seated pastry poses without a satchel. The initial strap-bearing draft was rejected and corrected; only the corrected asset ships.
- `public/art/heroine/cafe-counter-v1.png` — 1774×887 RGBA, 2×1 counter-facing standing gestures, preserving the standing satchel.

All 62 pre-existing heroine frames and their clip definitions remain unchanged. Four frames are added (66 total); existing walking, sitting, reading, tea and transition art is reused. Source atlas frames are registered to the existing 96×144 canvas and (48,136) foot anchor. Source PNG alpha is preserved; runtime trimming removes only transparent gutters/specks. The room uses nearest-neighbor rendering. Exact display dimensions, bottom-center origins, foreground fractions, depth order and interaction coordinates are documented in `docs/HAPPY-CAFE.md` and defined in `src/game/cafe.ts`.

## Observatory (Milestone 2.6)

Approved source `docs/art/references/observatory-concept.png` (1670×941) was supplied by the user. Runtime architecture, independent sky, complete furniture/prop atlases and four compatible telescope heroine variants were created using the **built-in image_gen tool**, preserving that reference and the approved heroine identity. No external asset packs or paid runtime service was introduced. See [exact prompts](art/OBSERVATORY-PROMPTS.json) and [dimensions, origins, depth, crop masks and remaining table-writing artwork](OBSERVATORY.md). The source is preserved for reference; redistribution rights beyond this supplied project are not inferred. All previous66 heroine frames, existing room PNGs and clip definitions are retained.
