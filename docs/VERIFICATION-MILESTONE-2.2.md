# Verification — continuous cinematic arrival

## Automated

98 tests across 12 suites pass, including all 91 prior tests and seven new journey tests. New coverage includes natural scroll-range mapping (sticky stages 0–80%, wings 80–100%), stage boundaries, delayed welcome content, deterministic reversal, bounded opacity, reduced-motion/Off transforms, independently scaled camera layers and clamped endpoints. Existing domain, session, navigation, behavior and IndexedDB tests are retained.

`npm run build` passes TypeScript and the Vite production build. The existing Phaser large-chunk advisory remains; there are no new dependencies. `git diff --check` passes. Approved exterior/courtyard/foreground rasters, logo, page metadata and game/persistence modules are unchanged.

## Browser

Used the existing isolated preview origin at `http://127.0.0.1:5182/`, leaving earlier save origins untouched. Verified at 1280 × 720, 1366 × 768 and 1440 × 900:

- Initial identity and native Enter anchor; independent approach camera motion; closed gates around 39%; partially open at 46%, 49% and 53%; courtyard around 67–74%; ordinary wings scroll.
- Upward scroll from the courtyard returned to a partially open gateway with the correct lower angle. Doors pivot around outside hinges; the stationary stone surround masks the leaf edges. No exposed canvas edges or horizontal overflow observed.
- Welcome content fits the laptop viewport without an inner scrollbar. The courtyard remains visible behind progress and controls; not-yet-visible controls are inert.
- Reduced motion selected in settings: zero door angle/gate opacity, shorter scroll runway, automatic rather than smooth anchors, and functional grounds/journal access. Parallax Off also gave zero approach/gate transforms. Test preferences were restored.
- Skip to Academic Wings bypassed the full sequence. All three actual room snapshots loaded. Entered the existing Observatory, saw the living scholar, and returned to the entrance; Resume updated to Observatory.
- A clean final load and gate traversal produced no console errors/warnings. During development, changing the custom hook signature triggered a Vite hot-refresh hook-order warning; a clean load confirmed the final hook order is stable.
- Reset the temporary viewport override after inspection.

Screenshots in the task visualization directory:

- `ripple-2-2-gates-1280.png`
- `ripple-2-2-gates-1366.png`
- `ripple-2-2-gates-1440.png`
- `ripple-2-2-courtyard-1366.png`
- `ripple-2-2-wings-1440.png`

The new gate/portal alpha assets are documented in `ENTRANCE-ARTWORK.md`; exact built-in ImageGen prompts and provenance are in `ARTWORK-PROMPTS.md`. Upcoming room artwork can be supplied through the existing manifest overrides. No saved-data format, IndexedDB identity, XP/gold rules or room behavior changed.
