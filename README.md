# Mochi Pets

Mochi Pets is the shared guild room game for Mochirii's closed playtest.

Approved members enter one 3D room, create a curated character, meet Lirabao, care for the guild pet together, and return later with saved progress. The playtest has no real value and is only for closed testing.

## Repository Workspace

The canonical checkout is `C:\Github Repo's\Mochirii Website\Mochi Pets`.
The Website and Mochirii Social projects are independent sibling repositories.
Local integration tools resolve the Website sibling automatically and accept
`MOCHIRII_WORKSPACE_ROOT` and `MOCHIRII_CREDS_DIR` overrides when needed.

## Current Playtest Scope

- One shared Jade Lantern room.
- Three curated character presets.
- One shared guild pet: Lirabao.
- Desktop browser play.
- Member sign-in for saved character and pet progress.
- Tester password page before entry on the live site.

Not included in this playtest: avatar uploads, multiple rooms, paid item value, mobile-specific play, or features outside the closed guild room.

## Local Development

```powershell
fnm use 24.17.0
npm ci
npm run unity:verify
npm run build:release
```

The release build uses the shared 3D room and the Node host together. Deployable builds should run with:

```powershell
$env:MOCHI_PETS_REQUIRE_UNITY_WEBGL='true'
```

If the Unity build is missing while that setting is enabled, the room routes fail clearly instead of opening the old fallback.

Unity `6000.5.2f1` with WebGL Build Support is required for the real playtest build. A contract-only WebGL bundle may satisfy endpoint checks, but it is not alpha gameplay readiness.

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

The website opens Mochi Pets through stable room routes:

- `/embed`
- `/play`
- `/healthz`
- `/integration/game-manifest.json`
- `/integration/alpha/status`

The website doorway is `/games/mochi-pets`. The old `/games/mochi-social` route is retired and should not redirect. The live page stays behind the tester password wall. The password opens the page shell; saved play requires a signed-in approved Mochirii member account.

## Local Workstation Readiness

Use [`docs/workstation-readiness.md`](docs/workstation-readiness.md) before claiming this machine is ready for continued game development. It records the current toolchain, Unity/Docker blockers, PR merge order, and no-cost provider rules.
