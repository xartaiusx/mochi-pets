# Mochi Social

Mochi Social is the shared guild room for Mochirii's closed playtest.

Approved members enter one 3D room, create a curated character, meet Lirabao, care for the guild pet together, and return later with saved progress. The playtest has no real value and is only for closed testing.

## Current Playtest Scope

- One shared Jade Lantern room.
- Three curated character presets.
- One shared guild pet: Lirabao.
- Desktop browser play.
- Member sign-in for saved character and pet progress.
- Tester password page before entry on the live site.

Not included in this playtest: avatar uploads, multiple rooms, buying or selling, paid item value, mobile-specific play, or public release features.

## Local Development

```powershell
npm install
npm run unity:verify
npm run build:release
```

The release build uses the shared 3D room and the Node host together. Deployable builds should run with:

```powershell
$env:MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL='true'
```

If the Unity build is missing while that setting is enabled, the room routes fail clearly instead of opening the old fallback.

## Local Checks

```powershell
npm run unity:verify
npm run build:release
npm run alpha:built-server-smoke
npm run smoke
npm run alpha:local-acceptance
npm run alpha:load-smoke
npm run typecheck
npm run lint
npm test
npm run secret-scan
git diff --check
```

Hosted checks, provider settings, deployments, new paid resources, and live load tests require explicit approval before running.

## Live Site Contract

The website opens Mochi Social through stable room routes:

- `/embed`
- `/play`
- `/healthz`
- `/integration/game-manifest.json`
- `/integration/alpha/status`

The live page stays behind the tester password wall. The password opens the page shell; saved play requires a signed-in approved Mochirii member account.
