# Milestone 1 plan

1. Define pure game rules and an atomic persistence boundary.
2. Build an original pixel-art Grand Library in Phaser, with an animated scholar and candlelight.
3. Add accessible React journal, progression, personal rewards and redemption history.
4. Test reward idempotence, undo, levels, redemption and IndexedDB restarts; verify production build and browser behavior.

# Architecture

React owns accessible controls and saved state. Domain functions own all rules and never import React or Phaser. An IndexedDB repository serializes read/modify/write operations in a single transaction so duplicate clicks and multiple tabs cannot double-award rewards. The canvas receives celebration events only after a transaction commits.

Quest completions retain reward snapshots. Undo reverses that snapshot even after a quest is edited. Deleting a completed quest retains the award and removes the entry; undo first to reverse its rewards. Spending does not prevent undo: a negative gold balance represents already-redeemed rewards and future earnings restore it; new purchases remain blocked until affordable. No penalty, interest, or loss of XP beyond the undone award.

Locations are independent Phaser scenes selected through a registry; only the Grand Library ships now. Persistence uses a versioned schema and repository boundary for a future sync adapter. All art is original procedural pixel art; no external assets or runtime services.
