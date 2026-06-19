# Deployment

Mochi Social uses a split deployment boundary.

- The future Vercel website hosts the site, account UI, Supabase session management, and game launch/embed surface.
- The Mochi Social game repo deploys the multiplayer RPG runtime to Fly.io.

## Why Fly.io for the Game

The game runtime needs a long-lived server process and multiplayer transport. Vercel Functions are not the game WebSocket server, so Vercel should only reference the deployed game URL.

## Verified Milestone Deploy Queue

The active Alpha Preview goal asks for each verified major milestone to be committed, pushed, and deployed before the next milestone. In this repo, commit and public-repo push may proceed after local verification, followed by PR/CI verification. The deploy step is always represented as an approval queue entry until the operator gives fresh action-specific approval after a cost/usage note.

- `fly-verified-milestone-deploy`: deploy the verified Mochi Social game milestone to the Fly app.
- `vercel-verified-milestone-deploy`: deploy the verified Mochirii web milestone or preview embed to the approved Vercel target.

Generate `npm run alpha:operator-checklist`, `npm run alpha:provider-preflight`, and `npm run alpha:sync-approval` before asking for those deploy approvals. These packets are no-secret evidence, not approval. They do not run `fly deploy`, trigger Vercel builds, set secrets, run hosted checks, or mutate Supabase/Discord/Enjin.

## Fly Setup

Fly operations are no-cost gated. Read-only checks such as `fly status` and `fly secrets list` are allowed. Smoke or contract checks against an already-running hosted URL can still create traffic, so `npm run alpha:external-gates` requires `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` before it fetches hosted Fly/Vercel contract URLs. Creating apps, creating or resizing volumes, deploying, scaling, cloning Machines, changing regions, or running hosted load tests can add usage or charges and requires fresh user approval. See [`docs/no-cost-operations.md`](no-cost-operations.md).

Cost-bearing example. Do not run this block without explicit user approval:

```powershell
fly launch --no-deploy --name mochi-social-game
fly volumes create mochi_social_data --size 1 --region sjc
fly secrets set SUPABASE_URL="..." SUPABASE_PUBLISHABLE_KEY="..."
fly deploy
```

If Fly app creation returns a payment or billing prompt, stop and hand the browser dashboard to the operator. Codex must not enter payment details. If the user explicitly approves app or volume creation, use the explicit app/volume path so the preview environment stays predictable:

```powershell
$fly = Join-Path $env:USERPROFILE ".fly\bin\flyctl.exe"
if (!(Test-Path $fly)) { $fly = "flyctl" }
& $fly apps create mochi-social-game
& $fly volumes create mochi_social_data --size 1 --region sjc -a mochi-social-game
```

Runtime env defaults:

- `PORT=8080`
- `RPG_SAVE_DIR=/data/saves`
- `SUPABASE_AUTH_REQUIRED=false`
- `RPG_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173`
- `ENJIN_NETWORK=CANARY`

Alpha RC server-only secrets and config:

- `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`: Supabase Edge Functions base URL, usually `https://<project-ref>.supabase.co/functions/v1`.
- `MOCHI_SOCIAL_GAME_SERVER_TOKEN`: scoped shared secret accepted only by Mochirii alpha Edge Functions.
- `ENJIN_PLATFORM_URL`: Enjin Platform GraphQL endpoint, defaults to Canary/Core platform examples in docs.
- `ENJIN_PLATFORM_TOKEN`: Enjin Platform API token. Keep it in Fly secrets only.
- `ENJIN_COLLECTION_ID`: Mochi Social Alpha collection id.
- `ENJIN_FUEL_TANK_ID`: Canary Fuel Tank id used to sponsor test transactions.

For Alpha Preview Ready, leave `ENJIN_COLLECTION_ID` and `ENJIN_FUEL_TANK_ID` unset until real Canary collection/Fuel Tank resources exist. Do not set dummy values. The runtime should stay in `configured-preview-stub` mode and visibly explain that chain requests are no-real-value preview records until funding and finality proof are approved.

Add the future Vercel domain to `RPG_ALLOWED_ORIGINS` before embedding in production.

Do not put Supabase service-role keys, Enjin Wallet Daemon seeds, or Wallet Daemon passphrases in the game runtime. `npm run alpha:wallet-daemon-check` may verify only the downloaded local binary metadata before deployment work; it is not a live signer readiness check. The Wallet Daemon must run as a separate service with no inbound ports.

For the Canary operator sequence, managed-wallet id convention, Fuel Tank setup, and finality rules, see [`docs/enjin-canary-alpha.md`](enjin-canary-alpha.md).

To refresh the local no-secret operator handoff in `C:\Users\xtyty\Desktop\Creds`, run:

```powershell
npm run alpha:wallet-daemon-check
npm run alpha:operator-checklist
```
