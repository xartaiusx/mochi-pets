# Mochi Pets Workstation Readiness

This is the no-secret local setup gate for continued Mochi Pets development.

## Required Local Tools

- Git and GitHub CLI authenticated for `xartaiusx/mochi-social`.
- `fnm` with Node `24.17.0`, matching `.nvmrc`.
- npm from the active Node runtime and lockfile-based installs with `npm ci`.
- Fly CLI available from `C:\Users\xtyty\.fly\bin\flyctl.exe` or on `PATH`.
- Repo-local Supabase CLI through `npx supabase`; do not require a global install.
- Docker Desktop Linux engine running before local Supabase/Docker parity checks.
- Unity Hub plus Unity Editor `6000.5.2f1` with WebGL Build Support.
- Chrome or a Playwright-compatible browser for local browser smokes.

## Current Workstation Findings

- Unity Hub is installed and Unity Editor `6000.5.2f1` is available at the repo default path with WebGL Build Support.
- Docker CLI is installed, but the Docker Desktop Linux engine was not reachable from this shell.
- Fly CLI exists under the user profile; use the explicit path if `flyctl` is not on `PATH`.
- The recovered Fly contract endpoint is only a contract bundle. Alpha gameplay still requires a real Unity WebGL export.

## No-Cost Rules

- Do not run `fly deploy`, create Fly resources, change Fly secrets, scale Machines, add volumes, or run hosted load/smoke checks without a fresh approval.
- Keep local checks on localhost until hosted verification is explicitly approved.
- Enjin remains Canary-only and no-real-value. Do not start signers, import wallets, fund Fuel Tanks, mint, transfer, or submit chain operations during workstation setup.
- Credentials stay under `C:\Users\xtyty\Documents\Creds`; never print or commit secret values.

## PR Order

1. Finish PR #6 into `alpha/unity-webgl-shared-room-bootstrap`.
2. Refresh and undraft PR #5 after PR #6 lands.
3. Merge PR #5 to `main` only after checks, review policy, and CodeQL/private-repo policy are satisfied.
4. After `main` is current, create or refresh the clean local clone at `C:\Users\xtyty\Documents\Mochi Pets`.

## Ready Check

```powershell
git --version
gh --version
fnm use 24.17.0
node --version
npm --version
npm ci
npx supabase --version
docker info
& "$env:USERPROFILE\.fly\bin\flyctl.exe" version
Test-Path "C:\Program Files\Unity\Hub\Editor\6000.5.2f1\Editor\Unity.exe"
Test-Path "C:\Program Files\Unity\Hub\Editor\6000.5.2f1\Editor\Data\PlaybackEngines\WebGLSupport"
npm run secret-scan
npm run alpha:public-copy
npm run alpha:readiness
npm run unity:cloud-code-contract
npm run typecheck
npm run lint
npm test
npm run build
```

After Unity is installed, add:

```powershell
npm run unity:test:editmode
npm run unity:test:playmode
npm run unity:build:webgl
npm run build:release
npm run alpha:built-server-smoke
npm run smoke
```
