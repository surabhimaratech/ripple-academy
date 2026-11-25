# Happy Café — Milestone 2.5

## Implementation plan
1. Preserve the Study and inspect existing room, behavior, furniture and reward abstractions.
2. Create a clean architectural plate and transparent furniture originals matching the supplied concept; render furniture foreground cuts from the same source asset.
3. Add room-local navigation, reachable activity approaches, compatible seated anchors and developer calibration.
4. Extend the existing reward ledger with persisted confirmation intents, optional starter rewards, enjoyed tracking and atomic refunds. Keep IndexedDB version 1 with optional validated fields.
5. Drive a save-independent visual sequence from committed redemptions; skipping or reloading never changes the purchase.
6. Verify activities, economy, persistence, focus continuity and laptop layouts; document evidence and limitations; commit locally.

## Architecture
1280×720 room coordinates remain independent of viewport dimensions. Phaser composes the base, transparent furniture and props with depth sorting; foreground chair/table cuts use their original texture. The existing behavior FSM owns navigation and activity timing, with no access to the reward ledger. Furniture definitions own contact, approach, exit, scale, collision and occlusion metadata. React owns menus and dispatches transactional domain actions through the existing IndexedDB repository. Redemption history is the authoritative ledger; optional visual state has no economic effects. Developer previews use the same room configuration and a pure sequence controller, without opening IndexedDB.

The original concept is a reference, not a separable source. New clean architecture and transparent furniture are necessary; the approved Study artwork and interactions are unchanged.

## Completed functionality
- New free café destination in the courtyard, room navigation, room previews and Reward Shop shortcut.
- Coffee counter, menu board, gift shelf, courtyard door and reachable window-side seating; manual and autonomous movement reuse the existing grid/FSM.
- Eleven individually triggerable activities: arrival, menu, ordering, waiting, coffee, pastry, reading, gifts, relaxation, window reflection and departure.
- Same seated contact/scale across reading, coffee, pastry, resting and reflection; satchel-free poses, approach/sit/stand transitions, contact shadows and furniture foreground occlusion.
- Existing reward CRUD with explicit presentation selection, optional starter collection, persistent confirmation, displayed resulting balance, insufficient-funds protection, single atomic spending, skip-safe presentation and history.
- Redeemed-for-later / optional Enjoyed / Cancelled-refunded tracking. Refunds use the immutable redemption snapshot, survive edits/deletions and cannot repeat or follow Enjoyed.
- Gentle cup steam, reduced-motion stills, existing mute behavior, free ambient activities and hidden-tab sleeping.
- Developer interaction studio supports all café activities, prop anchors/depth, same-texture foreground cuts and save-free reward sequence previews.

## Artwork and coordinates
All world coordinates use 1280×720. Source PNGs retain alpha and original pixel data; only transparent gutters are trimmed at runtime, using the existing connected-silhouette helper. No furniture is erased from the concept. New matching originals were generated with the built-in image tool; the supplied concept is retained at `docs/art/references/happy-cafe-concept.png`.

| Asset | Source dimensions | Layout / role |
|---|---|---|
| `public/art/rooms/happy-cafe/base-v1.png` | 1672×941 | Fixed architecture; drawn at (640,360), 1280×720, depth 0 |
| `public/art/rooms/happy-cafe/furniture-v1.png` | 1536×1024 RGBA | 2×2 cells of 768×512: counter, gifts, chair, table |
| `public/art/rooms/happy-cafe/props-v1.png` | 1536×1024 RGBA | Same cell grid: coffee, pastry, open book, foreground plant |
| `public/art/heroine/cafe-counter-v1.png` | 1774×887 RGBA | 2×1 rear three-quarter counter gestures; normalized height 112 |
| `public/art/heroine/cafe-pastry-v1.png` | 1774×887 RGBA | 2×1 satchel-free seated pastry frames; normalized height 116 |

The complete furniture originals are independently positioned in `src/game/cafe.ts` (`cafeProps`); `src/game/cafeArt.ts` composes them. Bottom-center origins:

| Furniture | Origin | Display size | Depth |
|---|---|---|---|
| Counter | 378,560 | 360×230 | 560; front cut 561 |
| Gift shelves | 1140,548 | 222×318 | 548 |
| Window chair | 758,582 | 132×190 | 468; front cut 589 |
| Window table | 860,580 | 172×155 | 591 |
| Near chair / table | 402,731 / 520,741 | 166×236 / 190×175 | 735 / 745 |
| Right chair / table | 1150,735 / 1050,744 | 172×244 / 192×176 | 738 / 746 |

Counter foreground = the bottom 45% of its **same trimmed original**. Chair foreground = bottom 24% of the **same chair original**. The complete table is in front of the seated heroine, providing its own alpha occlusion. No independently generated front/back furniture halves exist. Dev guides expose these crops and depth values. Furniture contact shadows are separate graphics; coffee (887,466), pastry (906,465), shelf book (1081,427) and plant (1245,719) are independent prop layers.

Window seat approach/exit (698,600), foot contact (766,583), hip contact (755,488), scale 1.8, heroine depth 583. Standing scale varies continuously from 2.15–2.5 with floor depth. The common sprite canvas remains 96×144 with foot (48,136). Seat activity changes reuse the same anchor without repositioning. The other two tables furnish the foreground; the window seat is the usable seat for this single-player slice.

Counter approach (460,586), menu (380,586), gift shelf (1110,578), entrance (116,609), exit (78,550). The solid workstation, seat/table, gifts and foreground groups leave connected walking corridors. All eleven approaches are mutually reachable. Reposition furniture by updating its original transform, footprint, approach/contact, prop positions and foreground crop together; the base does not need repainting.

## Save compatibility and transaction rules
The existing `magical-university` IndexedDB database, version 1, `save` store and `player` key are unchanged. No destructive migration or reseeding occurs. Optional additions:
- State: `cafeStartersAdded`, `redemptionIntent` (stable ID and reviewed reward snapshot).
- Reward: optional `kind` (`coffee`, `pastry`, `book`, `celebrate`). Legacy rewards retain their prices and use simple celebration until edited.
- Redemption: optional `kind`, `visualPending`, `enjoyedAt`, `cancelledAt`.

`prepareRedemption` persists a review ticket without spending. `confirmRedemption` checks the current reward against its snapshot and current funds, then deducts and writes history in one existing IDB read/write transaction. An already-recorded ticket is a no-op, including after reload. Refunds and Enjoyed use that same serialized transaction path; they are mutually exclusive. Refund amount is the recorded cost. Imports validate all new fields, reject contradictory usage states, and exclude cancelled purchases from net spending when checking balances. Existing import backups/recovery remain unchanged.

`RewardSequence` is pure active-time presentation with no state/repository access. It directs the existing FSM via explicit activities. Reloading or leaving mid-sequence may restart the short presentation when returning; it never repeats the charge. Skip clears only the visual flag. Manual movement can interrupt, and normal 20-second manual override applies. Autonomous selection never dispatches economy actions; order/wait have zero autonomous selection weight. The focus timer remains independently persisted and follows its existing wall-clock rules.

## Verification and evidence
- **158 tests across 22 suites passed**, including existing quest completion/undo/duplicate awards, level calculation, activity/focus behavior, save import/export and persistence.
- New coverage: optional starter preservation, pending confirmation reload, duplicate confirmations, insufficient funds/changed prices, immutable one-time refunds after reward deletion, Enjoyed/refund exclusion, visual-only completion/skip, focus-state preservation, concurrent IDB confirmations/refunds/usage races, all four sequence kinds, manual-only mode/override, shared seated contacts, correct foreground depth and rear-facing counter art.
- A deterministic ten-minute autonomous café simulation stayed on accessible floor, spent over two-thirds of the time engaged in activities, visited varied activities and emitted no menu or reward events.
- Type checking and production build passed. The existing Phaser bundle-size warning remains; no new dependency was installed.
- Browser: **all eleven activities approached and settled at both 1440×900 and 1366×768** (22 checks). The stored interaction log records orientation, scale, contact and settled transitions.
- Browser acceptance on isolated port 5186: completed Study quest (15 XP, 5 gold), added optional menu, reloaded a pending coffee confirmation, confirmed a single 5-gold charge, watched counter → window-seat coffee, marked Enjoyed later, returned to Study and reloaded with history/progress intact. Subsequent test quests brought XP to 35; a coffee purchase took gold 6→1, skip retained it, cancellation restored 1→6 and removed the refund controls. Enjoyed rewards exposed no refund action. Insufficient rewards were disabled.
- The active 25-minute Pomodoro continued through café navigation and Focus Mode; its normal completion recorded an interval without awarding XP/gold. Manual input produced the 20-second override and stand-up transition. Ambient view hid the optional café controls. Approved Study and original heroine assets were checked unchanged.
- Visual iterations corrected the initial generic front-facing ordering pose with counter-specific rear gestures, reduced the counter to its natural aspect, aligned the chair cushion to the hip contact, and matched standing head/body scale to the existing room conventions.

Screenshots and the interaction log are in `docs/evidence/happy-cafe/`. They cover the full café, ordering, coffee, gift browsing, pastry, reward menu, successful redemption/history, refund, and developer calibration. The initial native refund confirmation stalled the test browser; the shipped refund uses an in-game confirmation and was subsequently verified successfully.

## Completed art and remaining limitations
All required architecture, furniture, prop and heroine assets for these interactions are included. There is **no blocking external artwork dependency** and no placeholder geometric room or heroine art. Existing approved heroine PNGs/animations were preserved; only two small activity atlases were added.

The window seat is the active seat; the two foreground tables are decorative. Counter actions are two subtle ordering/acknowledgement gestures, without a barista NPC or a carried-cup walking cycle. The short visual presentation restarts after a reload/return rather than saving every animation frame; spending remains exactly once. Custom rewards without a matching physical presentation use a simple celebration. No new ambient audio track was added; existing mute/reward sound settings remain intact.

Optional future artwork (not required to use this milestone): a carried-cup walk extension would need transparent 96×144 registered frames at foot (48,136), target standing height 112, all four approved walking directions with two strides, fixed waist-height hand/cup contacts, and unchanged heroine proportions. A barista handoff would need aligned rear three-quarter reach/receive poses and a separate cup prop matched to the counter tabletop, not a repainted background. Neither is silently represented as completed.

Personal Study furniture relocation remains deferred. No Library, Observatory, dormitory or Field Trips redesign was undertaken.

### Selected screenshots

| View | Evidence |
|---|---|
| Four courtyard destinations, 1366×768 | [Navigation](evidence/happy-cafe/courtyard-navigation-1366x768.png) |
| Full café, 1366×768 | [Room](evidence/happy-cafe/full-room-1366x768.png) |
| Counter gestures, 1440×900 | [Ordering](evidence/happy-cafe/ordering-1440x900.png) |
| Seated coffee, 1440×900 | [Coffee](evidence/happy-cafe/coffee-1440x900.png) |
| Seated pastry, 1440×900 | [Pastry](evidence/happy-cafe/pastry-1440x900.png) |
| Gift shelves, 1440×900 | [Gifts](evidence/happy-cafe/gifts-1440x900.png) |
| Menu, 1366×768 | [Reward menu](evidence/happy-cafe/reward-menu-1366x768.png) |
| Successful redemption / usage | [History](evidence/happy-cafe/redemption-history-1366x768.png) |
| One-time refund | [Refund](evidence/happy-cafe/refund-verified.png) |
| Interaction calibration / reduced motion | [Developer studio](evidence/happy-cafe/developer-calibration-1440x900.png) |
| Unobstructed café | [Ambient](evidence/happy-cafe/ambient-1366x768.png) |
| All 22 settled activity checks | [JSON log](evidence/happy-cafe/interaction-checks.json) |
