# Verification — Milestone 1.5

## Automated checks

40 tests pass across four Vitest suites. All 11 original tests remain. New coverage includes legacy save round trips, malformed import rejection, version/range/type/duplicate/date validation, reversal-safe balances, unknown-property stripping, discovery CRUD, permanent keepsakes, normalized movement, frame-time caps, furniture collisions, room boundaries, reachable interaction positions, atomic import/recovery, recovery after reopening, unchanged legacy database loading, concurrent import/completion and duplicate redemption across connections.

TypeScript and the Vite production build pass. Phaser still produces a large bundle-size warning; this is a local-only game with no runtime-loaded art assets.

## Browser checks

Inspected screenshots at **1440 × 900** and **1366 × 768**, with both unobstructed room and open folio. No document-level horizontal overflow was present in the measured 1440-pixel view. The open folio leaves about 70% of the room visible; the folio itself scrolls for longer content.

Confirmed:

- WASD walking, proximity prompt, E interaction, seated desk pose and journal opening.
- Direct bookshelf, personal chest and reserved door interactions.
- Menu alternatives, collapsible folio and focused native editor fields.
- Three quest completions: 120 total XP, level 2, 45 gold; animated coins, floating XP, counter movement and level-up treatment. Removed overlapping level-up announcements identified during review.
- Coffee redemption: 45 → 15 gold; unaffordable rewards disabled afterward.
- Discovery creation, four earned keepsakes, and retained progress after reload.
- Invalid pasted save rejected without changing progress; valid import preview did not change progress until confirmed; import replaced the journal; pre-import recovery restored level 2, 120 XP and 15 gold.
- Export action reported a generated save download.
- Reduced-motion selection and mute controls update correctly; mute restored to off in the isolated test.

Mutating browser checks used **port 5180**, a separate IndexedDB/localStorage origin. The prior **port 5174** save was read for compatibility and artwork checks without completing, deleting, importing or redeeming anything there.

The browser’s file-chooser automation timed out. Native file selection could not be verified end-to-end through that automation; the same validation, review, import and recovery pipeline was verified through the accessible pasted-JSON alternative, in addition to automated persistence tests. No claim is made about audible output quality from the browser automation.

Screenshots were saved as local review artifacts outside the source tree.

## Remaining boundaries

One original, procedurally illustrated environment; no additional locations, cloud sync, authentication, mobile support or paid services. Canvas position is session-only. IndexedDB saves are browser-profile and origin specific. Import replaces the journal and keeps one reversible recovery copy. Undo after spending may create a negative gold balance as documented in the original accounting model.
