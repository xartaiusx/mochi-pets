# Mochi Social Alpha Preview Ready Production Goal

Ship Mochi Social to the live Mochirii site at `https://mochirii.com/games/mochi-social`, still behind the tester password wall.

The player promise is simple: approved guild members enter one shared 3D room, create a curated character, meet Lirabao, care for the guild pet together, leave, return, and see saved progress.

## Current Target

- Live page remains password-gated.
- Tester password opens the page shell only.
- Mochirii member sign-in is required for saved play.
- Unity WebGL is the active game runtime.
- There is one shared room: `JadeLanternRoom`.
- There are three curated character presets.
- There is one universal shared starter pet: Lirabao.
- All alpha progress has no real value.
- No new provider cost is introduced by default.

## Runtime Requirements

Release builds require `MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true`.

Keep these game routes stable:

- `/embed`
- `/play`
- `/healthz`
- `/integration/game-manifest.json`
- `/integration/alpha/status`

Manifest and status responses must show:

- `engine="unity-webgl"`
- `activeRuntime="unity-webgl"`
- `room.mode="single-shared-room"`
- `room.capacity=25`
- `room.sharedPetKey="lirabao"`
- `unityWebglBuild.present=true`
- `legacyFallback.active=false`

If the Unity build is unavailable, the tester page should remain online and show a friendly playtest paused message. The old runtime must not silently open.

## Room Scope

Finish one cozy Jade Lantern room with:

- Desktop movement.
- Camera follow.
- Wave or room signal.
- Three curated character presets.
- Interaction prompt near Lirabao.
- Shared Lirabao states: idle, approach, happy, care received, stale refresh, and unavailable.

Do not add avatar uploads, multiple rooms, sharding, mobile-specific UI, player-facing future asset systems, or real-value features.

## Saved Play

Supabase owns member identity, tester allowlist, terms, audit, feedback, Unity player mapping, and the latest Lirabao audit mirror.

Unity owns runtime saves:

- Character save key: `character.v1`.
- Shared Lirabao save key: `room:jade-lantern-room/sharedPet.v1`.

Unity player identity maps to `mochirii:<supabase_user_id>`.

The Unity client sends Lirabao interaction intent. Shared Lirabao writes go through the server-side authority path. Stale revisions reload the latest shared pet state. Live movement and emotes are session-only.

## Access Flow

- Signed-out users see a sign-in prompt before saved play.
- Non-testers are blocked.
- Testers who have not accepted terms are blocked until terms are accepted.
- Valid testers receive Unity play access and enter the shared room.
- Logout and login preserve the member character and shared Lirabao progress.

## Public Copy

Public wording should feel player-facing and Mochirii-branded:

- shared guild room
- create your character
- meet Lirabao
- care for the guild pet together
- closed alpha playtest
- no real value

Keep implementation details, provider setup, readiness gate wording, secret names, and future-system language out of the tester page and game UI.

## Cost And Safety Boundaries

Do not create new Fly apps, machines, volumes, IPs, databases, paid resources, hosted load tests, funded asset resources, chain transactions, signer activity, or dummy readiness IDs without explicit action-time approval.

Use existing configured providers only when deployment is approved. Server-side credentials stay in server-side provider secrets and must not enter browser code, Unity WebGL builds, logs, public docs, or PR text.

## Required Local Checks

Game repo:

```powershell
npm run unity:verify
npm run build:release
npm run alpha:built-server-smoke
npm run alpha:unity-required-smoke
npm run typecheck
npm run lint
npm test
npm run secret-scan
git diff --check
```

Website repo:

```powershell
npm run check:mochi-social-alpha
npm run check:mochi-social-bridge-state
npm run check:mochi-social-edge-authority
npm run check:mochi-social-game-contract
npm run check:mochi-social-tester-password-gate
npm run check
cd apps/web
npm run lint
npm run build
```

Supabase checks include Deno tests, function type checks, RLS/grant verification, signed-out and blocked-user cases, valid tester cases, and no-secret scans.

## Live Acceptance

- Live `/games/mochi-social` blocks access before tester password.
- Correct password unlocks the page shell.
- Signed-in valid tester enters the Unity room.
- Two testers see distinct characters in the same room.
- Both testers interact with the same shared Lirabao state.
- Character and Lirabao progress persist across reload and logout/login.
- Invalid preset IDs are rejected.
- Non-testers and terms-missing testers are blocked.
- Public page remains hidden from search indexing.
- No real-value or paid-feature language appears.
- No new provider resources or costs are introduced.

## Approval Gates

The following remain explicit approval steps:

- Provider login or secret changes.
- Hosted game or website deployment.
- Hosted smoke checks.
- Hosted load tests.
- Any provider action that can create cost or consume paid quota.
- Any future value-bearing asset, funding, signer, or chain operation.
