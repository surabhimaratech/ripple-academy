# Ripple entrance — original artwork production

Created with the built-in OpenAI ImageGen tool for this project on 2026-11-24. No stock/franchise artwork was supplied. The courtyard used our own newly generated academy as its only architectural/style reference. The generated originals remain in Codex's generated_images folder; the application uses the checked-in copies below.

- `public/art/entrance/academy.png`: transparent architecture and rocky peninsula, 1536 × 1024.
- `public/art/entrance/courtyard.png`: complete courtyard perspective, 1536 × 1024.
- `public/art/entrance/foreground.png`: transparent organic foliage/path frame, 1536 × 1024.

## Academy prompt
Use case: stylized-concept. Production game-art transparent parallax layer for Ripple Academy. Original single coherent grand Gothic university on a rugged, forested peninsula, seen from a distant elevated viewpoint across a lake. Sophisticated asymmetrical interconnected slender towers, spires, slate rooflines, cloisters, buttresses, tracery, arched antique-gold windows, weathered moonlit stone and integrated aged copper observatory dome. Mature atmospheric 16-bit pixel art with fine deliberate pixel clusters, premium indie-game matte-painting detail; deep navy, desaturated forest green, moonlit silver, antique gold. Include rocky shore, small organic conifers and winding approach path. Wide 3:2 composition; all sky, empty space and area below shoreline genuinely transparent. No lake, mountains, sky, text, logos, UI or watermark. Do not reproduce a film castle.

## Courtyard prompt
Create a new perspective in the original university, using academy.png only as architectural/palette reference. Grand connected weathered Gothic academic wings, intricate arched windows, warm lamps, graceful stone gateway on the right half, ivy, broad courtyard, organic planting, small understated bronze dolphin fountain and elliptical ripples, distant integrated observatory dome, mature trees and delicate mist. Calm dark stone/foliage on the left third for text. Sophisticated fine-detail 16-bit pixel art, cinematic moonlight, navy/teal, muted forest green and silver. No people, lettering, logo, UI or watermark.

## Foreground prompt
Transparent foreground frame for a sophisticated 16-bit Gothic-university landscape. Dense organic dark conifers, ferns, detailed mossy rocks and shoreline plants at the lower outer corners, a short winding approach path at extreme lower right. Fine deliberate pixel clusters, navy, muted green, tiny silver highlights and restrained gold fireflies. Middle 70% and upper 60% transparent. Asymmetrical natural silhouettes, no architecture, sky, water, text, UI, logo or watermark; no dark matte.

## Milestone 2.2 — Gothic gates

Generated with the built-in ImageGen tool (not the CLI) using the approved courtyard only as a style reference. Original production assets; no franchise or stock references. The approved exterior, courtyard and identity assets are unchanged.

- `public/art/entrance/gates/door-pair.png`: 1024 × 1536, alpha; closed door pair, split at its exact center by two independent HTML layers.
- `public/art/entrance/gates/portal.png`: 1568 × 1003, alpha; stationary carved stone surround with transparent opening.

### Door-pair final prompt

Use case: stylized-concept. Production game art for Ripple Academy, two closed Gothic oak door leaves as one transparent cutout, straight-on orthographic elevation, no perspective baked in. Match the fine detailed mature 16-bit dark academia pixel-art style, moonlit blue grey stone palette and antique gold lighting of the supplied reference (style reference only, do not alter that courtyard). Door pair occupies almost entire image bounding box, portrait 2:3 composition, both leaves meet exactly at vertical center. Overall pointed Gothic arch top, straight vertical outer hinge edges and flat bottom. Rich dark aged wood grain, recessed Gothic tracery panels, wrought iron outer hinges, small antique gold filigree and solid bronze dolphin medallion centered at the seam, understated 4 pointed stars and elliptical ripple ornaments. Left and right halves must be separable at exact center without framing. Dramatic but restrained warm lantern highlights, precise pixel clusters. No stone surround, no wall, no ground, no background, no typography, no UI. Real transparent alpha outside the door shape. Both leaves flat and closed, no pre-opened angles.

### Stone-surround final prompt

Use case: stylized-concept. Original production layered game asset: front-facing Gothic gateway stone surround for Ripple Academy. Landscape 1600 by 1000 proportions. Match the supplied courtyard's fine detailed mature 16-bit pixel art, aged blue-grey Gothic stone, antique gold and moonlit green ivy. This is a STATIC architectural FRAME, with a completely transparent tall pointed Gothic opening exactly centered. The opening occupies x=480 to1120 (40 percent canvas width), y=40 to1000 (96 percent height), pointed apex at (800,40), outer jamb springline around y=380, then vertical sides straight down to bottom. The rest of the image is an opaque rich stone portal wall continuing to all four canvas edges: intricate weathered voussoirs, layered carved Gothic arches, worn tracery, organic ivy along edges, antique gold lanterns on the side pillars. Dark silver-blue moonlight, cozy small amber lanterns. The entire central arch opening must be real alpha transparency, not black or grey, with no doors or view behind it. No ground in the opening, no threshold blocking lower alpha edge. Straight-on orthographic camera, no angled perspective baked in. No text, no crest, no people, no UI, no watermark. This frame will cover two separately animated wooden doors. Keep exact central symmetry for alignment but make weathering and ivy naturally asymmetrical.
