# Website Integration Contract

Mochi Social stays in this game repo. The Mochirii website stays in its own repo and opens the game through the public game URL.

## Live Doorway

The live player path is:

1. Member opens `https://mochirii.com/games/mochi-social`.
2. Tester password unlocks the page shell.
3. Mochirii member sign-in is required for saved play.
4. The website sends the signed-in member access token to the game iframe.
5. The Unity room loads only when the shared-room build is available.

The password does not prove saved play by itself. Signed-out visitors, non-testers, and testers who have not accepted the playtest terms must be blocked before saved play.

## Website Env Vars

- `NEXT_PUBLIC_MOCHI_SOCIAL_URL`: production game origin.
- `MOCHI_SOCIAL_ALPHA_ACCESS_MODE=tester-password`: keeps the tester password wall first.
- `MOCHI_SOCIAL_TESTER_PASSWORD`: server-only tester password.

Never expose the tester password, Supabase service-role keys, Unity service credentials, Discord tokens, game server tokens, or wallet material through browser env vars, iframe messages, logs, public docs, or PR text.

## Stable Game Routes

The website can rely on these routes:

- `/embed`
- `/play`
- `/healthz`
- `/integration/game-manifest.json`
- `/integration/alpha/status`

Release builds must run with `MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true`. If the Unity build is missing, the game routes must fail clearly or show a playtest paused state; they must not silently open the old room.

## Runtime Contract

The manifest and alpha status must report:

- `engine="unity-webgl"`
- `activeRuntime="unity-webgl"`
- `room.key="jade-lantern-room-alpha"`
- `room.scene="JadeLanternRoom"`
- `room.mode="single-shared-room"`
- `room.capacity=25`
- `room.sharedPetKey="lirabao"`
- `unityWebglBuild.present=true`
- `legacyFallback.active=false`
- `characterPresets.mode="curated-presets"`
- `characterPresets.count=3`
- `characterPresets.avatarUploads=false`
- `sharedPet.key="lirabao"`
- `sharedPet.universalStarter=true`
- `alpha.noRealValue=true`

The closed playtest includes one shared room, three curated character presets, desktop browser controls, simple social signals, and one shared Lirabao pet.

## Bridge Protocol

Parent to game:

- `MOCHI_SOCIAL_AUTH`
- `MOCHI_SOCIAL_SIGN_OUT`

Game to parent:

- `MOCHI_SOCIAL_READY`
- `MOCHI_SOCIAL_AUTH_STATE`
- `MOCHI_SOCIAL_ERROR`

The website owns Supabase session refresh. It may send a short-lived Supabase access token to the iframe. It must never send refresh tokens, service-role keys, tester passwords, Discord tokens, Unity service credentials, or game server tokens.

## Saved Play

Supabase is the member authority for tester allowlist, terms, audit, feedback, Unity player mapping, and the latest Lirabao audit mirror.

Unity services own runtime saves:

- Player character data: `character.v1`.
- Shared Lirabao data: `room:jade-lantern-room/sharedPet.v1`.

The Unity client sends care intent for Lirabao. Shared pet writes must go through the server-side authority path, and stale revisions should reload the latest Lirabao state instead of overwriting it.

Live avatar movement, camera state, emotes, and moment-to-moment transforms are session state only.

## Player-Facing Copy

Public page and game UI copy should stay simple:

- shared guild room
- create your character
- meet Lirabao
- care for the guild pet together
- closed alpha playtest
- no real value

Do not show implementation names, provider setup details, future asset systems, internal reports, secret names, or readiness gate jargon to testers.

## Not In This Playtest

- Avatar uploads.
- Multiple rooms.
- Mobile-specific UI.
- Opening the playtest beyond approved testers.
- Real-value features.
- Player-facing future asset systems.

If future server-only provider code remains for later work, it must stay inactive, fail closed, and absent from tester-facing copy.

## Website Verification

Before the live tester page is considered ready:

- Password wall blocks the page before unlock.
- Correct password unlocks the page shell.
- Signed-in valid tester reaches the Unity room.
- Signed-out, non-tester, and terms-missing states are blocked.
- The iframe uses the Unity shared-room runtime.
- Two testers can see distinct characters in one room.
- Both testers can interact with the same Lirabao state.
- Character and Lirabao progress return after reload and sign-in.
- Invalid character preset IDs are rejected.
- The page is `noindex`.
- The page shows a playtest paused message if the room is unavailable.
- Public copy stays Mochirii-branded and no-real-value.
