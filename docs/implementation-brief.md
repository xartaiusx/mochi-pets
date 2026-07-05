# Mochi Pets Implementation Brief

Mochi Pets is the closed Mochirii playtest for one shared 3D guild room.

Approved members enter the room, create a curated character, meet Lirabao, care for the guild pet together, leave, return, and see saved progress. The playtest has no real value.

## Alpha Scope

- One room: Jade Lantern Room.
- One shared pet: Lirabao.
- Three curated character presets.
- Desktop browser play.
- Simple movement, camera follow, wave, and room signal.
- A care prompt near Lirabao.
- Saved member character progress.
- Saved shared Lirabao progress.
- Tester password page first, then Mochirii member sign-in for saved play.

## Lirabao States

- Idle while waiting in the room.
- Approach when a member comes close.
- Happy after a friendly wave.
- Care received after a valid care action.
- Refresh when another member cared for Lirabao first.
- Resting when Lirabao is temporarily unavailable.

## Not In This Playtest

- Avatar uploads.
- Multiple rooms.
- Sharding.
- Mobile-specific controls.
- Real-money value.
- Paid item value.
- Features outside the closed room playtest.

## Player Promise

The live tester page should make the experience easy to understand:

- Enter the shared guild room.
- Create your character.
- Meet Lirabao.
- Care for the guild pet together.
- Return later with saved progress.
- Remember that all alpha progress has no real value.

## Maintainer Priorities

1. Keep the website doorway and game runtime separate.
2. Keep the stable routes working: `/embed`, `/play`, `/healthz`, `/integration/game-manifest.json`, and `/integration/alpha/status`.
3. Keep the old runtime from opening when the Unity room is required.
4. Keep saved play behind member sign-in after the tester password unlock.
5. Keep public wording Mochirii-branded, simple, and focused on the shared guild room.
6. Verify with two browser sessions before asking testers to play.
