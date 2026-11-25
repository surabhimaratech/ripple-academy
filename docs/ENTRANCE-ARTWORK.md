# Ripple Academy entrance: architecture and artwork

The entrance is a React document separate from the Phaser room registry. Milestone 2.2 replaces separate exterior/courtyard sections with one sticky viewport inside a tall native-scroll journey, followed by ordinary academic-wing document content. `journey.ts` is the pure five-stage timeline and independent camera-depth math; `useJourney.ts` smooths normalized document progress, shares a frame with `Panorama.tsx` and writes CSS variables for opacity, perspective hinges and staggered welcome content. It schedules RAF only while progress is converging, pauses hidden, and jumps to the correct pose on return. No mechanics, persistence or currency rules belong here.

The first four stages occupy 0–80% of normalized progress over the sticky travel; the wings consume 80–100% as they naturally scroll into view. No wheel/touch handlers or forced scroll updates are installed. Native anchors target approach, grounds and wings. Reduced motion shortens the scroll runway, removes zoom/hinges/light spill and uses still scene changes. Parallax Off also removes zoom/hinges while leaving conventional navigation intact.

The approved exterior is still painted as seven independent layers, now with different approach transforms (near vegetation advances faster than architecture, distant sky much less). The approved courtyard fills the same viewport behind the independent gates. HTML welcome content fades in after opening; inactive controls are inert. At the end the sticky viewport unpins naturally, revealing the existing room selection. Lazy room snapshots still use the actual room painters, then destroy their temporary engine. No room behavior was replaced.

## Replace artwork without game changes

1. Put locally bundled PNG/WebP/SVG assets in `public/art/entrance/`. Retain transparency on architecture and foreground layers; avoid baked opaque skies on cutouts. Never load assets from external servers at runtime.
2. Update only the `src`, `box` and `depth` fields in `src/entrance/assets.ts`. Coordinates are normalized to a 1600 × 1000 composition. `box` is `[x,y,width,height]`; preserve image aspect ratios. Positive depth moves a layer upward as the arrival scrolls. Use larger depth for nearer elements and overscan to cover maximum translation plus viewport aspect-ratio cropping.
3. Preserve the seven compositing roles/order: sky, mountains, atmosphere, architecture, lake, forest, foreground. Raster artwork can replace every supporting SVG without rendering or game changes. The lake reflection derives from the architecture image and placement. If changing shoreline height substantially, align the reflection horizon in `Panorama.tsx`; optional animation coordinates also live there.
4. Set `courtyard` to a full scene in the manifest. Keep the left third dark and quiet enough for welcome text. `roomPreviews` optionally accepts one image URL per existing room, replacing generated snapshots without changing navigation.
5. Inspect 1280 × 720, 1366 × 768 and 1440 × 900: initial arrival, partial scroll, courtyard and wings. Test parallax Off/Full, reduced motion and keyboard focus. Avoid exposed edges, text over bright windows, stretching or overly enlarged source pixels. Canvas image smoothing is disabled; CSS uses pixelated rendering.
6. Record creator, source, license, modifications and any attribution requirements in `ARTWORK-PROMPTS.md`. Keep any required license files with supplied assets. Do not add franchise imagery.

## Gateway asset contract

New originals live in `public/art/entrance/gates/`; source paths are replaceable in `assets.ts`. They are production artwork generated with the built-in ImageGen tool, not temporary geometric stand-ins. The approved exterior/courtyard/logo files were not edited. See `ARTWORK-PROMPTS.md` for provenance and exact final prompts.

- `door-pair.png`: 1024 × 1536 RGBA, straight-on closed pointed-arch doors. Split at exactly x=512. No baked perspective. Transparent outside the door silhouette; no wall or floor. Two independent half-width elements crop the same image; each retains its own outer hinge and rotates in 3D. To supply separate leaf files later, retain the same half-image bounding boxes and change the two leaf image sources/cropping rules.
- `portal.png`: 1568 × 1003 RGBA, stone wall/arch/lantern/ivy surround. Opening is fully transparent and extends off the bottom; opaque stone covers surrounding edges. The requested normalized composition is 1600 × 1000 with an arch opening approximately x=480–1120, y=40–1000. The generated surround's inner jambs are slightly inset, intentionally masking the door edges.
- Assembly coordinates use 1600 × 1000, with cover-style sizing (`max(100vw,160svh)` by `max(100svh,62.5vw)`). Door pair occupies left 30%, top 4%, width 40%, height 96%. Minor edge overlap behind the surround prevents pinholes. Keep the same normalized opening when replacing assets, or adjust these percentages together in `entrance.css`.
- Left leaf origin is its outer left jamb (`0% 62%`), right leaf its outer right jamb (`100% 62%`), with opposite signed Y rotations. Leaf container perspective is 1100 px. At 40% both are closed; at 60% they reach 103 degrees and their backs are culled. No horizontal sliding drives the opening.
- Back-to-front order: layered exterior; approved full-bleed courtyard; door leaves; warm spill overlay; stationary stone surround; welcome shade/copy. The assembly scales gently through the threshold and fades out after the doors open. Keep alpha intact and avoid opaque black mattes in the opening.
- For upcoming room images, set `roomPreviews` in `assets.ts` using the stable room IDs. Supply 1280 × 720 or higher, 16:9 artwork; the existing preview frame crops to 16:10. Navigation and saves need no changes.

## Performance and accessibility

The panorama draws at most about 20 fps using one Canvas2D element, and stops once the exterior is occluded by the gate/courtyard. Its RAF loop sleeps when the document is hidden or the arrival is outside the viewport; elapsed animation time does not catch up on return. Reduced motion renders still frames only on resize/settings/scroll. CSS mist pauses when the tab is hidden. Scroll parallax intensity is the existing saved setting; Off is zero translation. OS or explicit reduced motion also disables smooth anchor scrolling.

The hero contains no currencies or tasks. Subsequent progress and room navigation use native HTML controls. Entrance folios use a dismissible scrim, dialog semantics, focus management and a keyboard focus trap. Conventional room/menu controls remain available inside every room.

## Save compatibility

IndexedDB remains `magical-university`, version 1, store `save`, key `player`. Existing preference keys and room IDs remain stable. Branding is not a database migration. New JSON exports identify as `ripple-academy-save`; both the previous `magical-university-save` envelope and raw version-1 saves remain accepted. The last visited room is an optional local preference, separate from the save; an active session overrides it for the resume shortcut.
