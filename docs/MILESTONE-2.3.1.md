# Heroine activity expansion

Preserve all approved PNGs and existing room artwork. First fix frame registration and furniture contact: share scale across related frames, use explicit seated/bed/eyepiece anchors, foreground occlusion masks and short pose crossfades rather than sliding the feet. Keep behavior/navigation decisions independent of rendering.

Add a single new transparent atlas for missing work/thinking/book consultation, telescope adjustment, mug, stretch, sleep and object/window poses. Reuse approved typing/writing/reading/walking art. Sequence these as quiet phases within existing activities, add reachable optional tea/stretch/sleep activities to current room configs, and retain explicit session direction with no XP/gold changes.

Create a development-only preview entry with every animation, playback/pause/scrub, still/reduced mode, anchor overlay, separate room/furniture context and raw-frame inspection. It must not open IndexedDB or mount the normal app, and must be absent from production bundles. Test clips, transitions, anchors/occlusion and navigation, visually inspect preview plus real rooms, run all tests/type checking/build, and report remaining art limitations.
