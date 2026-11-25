# Scholar’s Study verification

## Automated checks

- `npm test`: 129 passing tests across 17 suites.
- `npm run build`: TypeScript project checking and production Vite build pass. Existing Phaser bundle-size advisory remains.
- `git diff --check`: clean.
- Byte comparison confirms `public/art/rooms/personal-study.png` exactly matches the approved source PNG.
- No changes to approved heroine PNGs, Library painter or Observatory/interior painter.

New tests cover timestamp countdown, pause/resume/reset, custom-duration validation, reload reconstruction, idempotent expiry, optional automatic transitions without unattended cycle backfilling, fourth-focus long breaks, stale commands, default starter rewards, additive legacy-save handling, optional collection insertion, structured import errors, transactional bulk rollback, multiple intervals per quest, explicit completion and snapshot undo, JSON round-trip, concurrent IndexedDB expiry/completion, and reachable synchronized heroine activities.

Historical reward tests use an explicit pre-milestone demo-save fixture so their original 40/15 and 50/20 assertions continue to verify existing progress. New-user defaults are tested separately at 35 XP / 11 gold total.

## Browser checks

Used isolated origin `127.0.0.1:5184` to avoid changing the existing user save on `127.0.0.1:5182`.

- Entered Study, clicked illustrated noticeboard, chose Architect of Systems and started a default 25-minute focus interval.
- Entered Focus Mode; heroine walked to the desk and wrote. Verified live clock alignment and furniture occlusion.
- Configured a one-minute verification interval; after expiry and reload it appeared in history, offered a five-minute break, and left XP/gold at zero.
- Started the break and observed tea in the armchair. Break completion offered the next focus interval.
- Started another 25-minute interval, reloaded, and confirmed it continued at the correct remaining time. Paused and resumed successfully.
- Explicit quest completion awarded 15 XP / 5 gold. Completed-history undo restored zero balances. The heroine celebrated and resumed her activity.
- Validated and reviewed a one-entry JSON collection, then imported it without rewards.
- Inspected 1280×720, 1440×900 and 1366×768 laptop layouts and a 900×650 secondary Focus Mode window. Normal Study contains the whole illustration; Focus Mode also contains it when window aspect ratio differs.
- Fresh app load: no browser warning/error logs. Temporary viewport override reset. Verification timer reset to ready; custom focus duration restored to 25 minutes.

## Known limits

The approved room is a flattened illustration, so furniture occlusion uses calibrated rectangular sprite-only masks; it is not a fully separated foreground asset set. Desk and seated activities reuse approved existing poses, rather than generating new perspective-specific character art. The sleeping sprite remains inspectable in the neutral development studio and is not a Study activity. No extra rooms or environmental furniture were added.

Automatic transition begins the next phase when expiry is observed; it never creates a chain of unattended completed intervals. The timer intentionally uses wall-clock time, while the original Activities session clock retains its separate active-time behavior. The illustration is loaded only by Study scenes/previews.
