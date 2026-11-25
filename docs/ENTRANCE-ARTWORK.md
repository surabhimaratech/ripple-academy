# Ripple Academy entrance: architecture and artwork

The entrance is a React document, separate from the Phaser room registry. `Entrance.tsx` owns three semantic sections and HTML navigation. `Panorama.tsx` paints the arrival, `scroll.ts` supplies pure clamped/smoothed parallax math, and `assets.ts` supplies artwork placement. Normal browser scrolling drives the scene. No game mechanics, persistence, currency or session rules belong here.

The courtyard is a full-bleed image with separate animated mist and readable HTML progress. Academic wings lazy-load `roomPreview.ts`, which paints each existing room and scholar once in an offscreen canvas, snapshots it, then destroys the engine. Results are cached for the page lifetime. Actual rooms load on entry via the existing lazy React/Phaser bridge. No room artwork or behavior was replaced.

## Replace artwork without game changes

1. Put locally bundled PNG/WebP/SVG assets in `public/art/entrance/`. Retain transparency on architecture and foreground layers; avoid baked opaque skies on cutouts. Never load assets from external servers at runtime.
2. Update only the `src`, `box` and `depth` fields in `src/entrance/assets.ts`. Coordinates are normalized to a 1600 × 1000 composition. `box` is `[x,y,width,height]`; preserve image aspect ratios. Positive depth moves a layer upward as the arrival scrolls. Use larger depth for nearer elements and overscan to cover maximum translation plus viewport aspect-ratio cropping.
3. Preserve the seven compositing roles/order: sky, mountains, atmosphere, architecture, lake, forest, foreground. Raster artwork can replace every supporting SVG without rendering or game changes. The lake reflection derives from the architecture image and placement. If changing shoreline height substantially, align the reflection horizon in `Panorama.tsx`; optional animation coordinates also live there.
4. Set `courtyard` to a full scene in the manifest. Keep the left third dark and quiet enough for welcome text. `roomPreviews` optionally accepts one image URL per existing room, replacing generated snapshots without changing navigation.
5. Inspect 1280 × 720, 1366 × 768 and 1440 × 900: initial arrival, partial scroll, courtyard and wings. Test parallax Off/Full, reduced motion and keyboard focus. Avoid exposed edges, text over bright windows, stretching or overly enlarged source pixels. Canvas image smoothing is disabled; CSS uses pixelated rendering.
6. Record creator, source, license, modifications and any attribution requirements in `ARTWORK-PROMPTS.md`. Keep any required license files with supplied assets. Do not add franchise imagery.

## Performance and accessibility

The panorama draws at most about 20 fps using one Canvas2D element. Its RAF loop sleeps when the document is hidden or the arrival is outside the viewport; elapsed animation time does not catch up on return. Reduced motion renders still frames only on resize/settings/scroll. CSS mist pauses when the tab is hidden. Scroll parallax intensity is the existing saved setting; Off is zero translation. OS or explicit reduced motion also disables smooth anchor scrolling.

The hero contains no currencies or tasks. Subsequent progress and room navigation use native HTML controls. Entrance folios use a dismissible scrim, dialog semantics, focus management and a keyboard focus trap. Conventional room/menu controls remain available inside every room.

## Save compatibility

IndexedDB remains `magical-university`, version 1, store `save`, key `player`. Existing preference keys and room IDs remain stable. Branding is not a database migration. New JSON exports identify as `ripple-academy-save`; both the previous `magical-university-save` envelope and raw version-1 saves remain accepted. The last visited room is an optional local preference, separate from the save; an active session overrides it for the resume shortcut.
