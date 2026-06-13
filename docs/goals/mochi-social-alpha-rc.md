# Mochi Social Alpha RC Goal

## Objective

Build Mochi Social into a closed, no-real-value, Enjin Canary alpha release candidate. The alpha is a 2D RPGJS Mochi Spirits social vertical slice with Supabase-backed state, Enjin hot/cold ownership proof for selected rare assets, fixed-price/direct trade, Mochirii preview embed, admin allowlist, tester terms, and full verification.

There are two stop points:

- Alpha Preview Ready: the Fly game is live through the Mochirii Vercel Preview, Supabase allowlist/terms/feedback work, and Enjin is visible as `configured-preview-stub`.
- Alpha RC Ready: the preview gates plus funded Enjin Canary collection, Fuel Tank, Wallet Daemon signing, and finalized proof smoke are complete.

Stop at Alpha RC Ready for the full goal. Do not deploy production, do not use Enjin mainnet, do not enable real-money value, do not open UGC uploads, and do not perform any action that can add charges to connected accounts without explicit user approval for that exact action.

Recommended slash goal:

```text
/goal Execute docs/goals/mochi-social-alpha-rc.md. Build Mochi Social into a closed, no-real-value, Enjin Canary alpha release candidate: a 2D RPGJS Mochi Spirits social vertical slice with Supabase-backed state, Enjin hot/cold ownership proof for selected rare assets, fixed-price/direct trade, Mochirii preview embed, admin allowlist, tester terms, and full verification. Stop at Alpha RC Ready, not production/mainnet.
```

## Source Basis

- RPGJS: browser RPG/MMORPG runtime, maps, events, inventory, save/load, multiplayer presence, and server-owned gameplay state.
- Enjin Platform: GraphQL API, managed wallets, Wallet Daemon signing, Fuel Tanks, marketplace listings, Canary testnet, and hot/cold inventory guidance.
- Supabase: Auth JWTs, `getUser(jwt)` validation, Postgres/RLS, Edge Functions, and short-lived access tokens from the parent site.
- Fly.io: long-running WebSocket game runtime and persistent volumes for runtime state.
- Vercel/Next.js: website shell, public env var for the game URL, preview deployments, and no game WebSocket server in serverless functions.
- GitHub: branch protection, PR checks, and required CI before merge.
- Second Life and IMVU: social presence, identity, creator/economy inspiration; alpha stays curated and closed.
- MDA and Self-Determination Theory: prioritize autonomy, competence, relatedness, fellowship, expression, discovery, and a small repeatable loop.

## Implementation Order

1. Game repo contracts and docs.
   - Update `AGENTS.md`, `docs/site-integration.md`, `docs/deployment.md`, `docs/asset-ledger.md`, and this goal file.
   - Preserve routes: `/healthz`, `/play`, `/embed`, `/integration/game-manifest.json`.
   - Extend the manifest with alpha, economy, chain, market, and UGC flags.

2. Game vertical slice.
   - Keep RPGJS 2D.
   - Add one cozy town plus one visible habitat area.
   - Add three original Mochi Spirit companions.
   - Implement attunement, Mochi Spirit journal records, technique mastery, no-injury affinity trials, party formation, no-injury spar ladder practice, care, no-injury training battles, raising, roleplay quest progress, bond/growth, profile/status HUD, inspect spirit, local chat UI, emotes/status actions, fixed market board, direct trade proof, and Enjin Canary certificate request proof.
   - Store local fallback alpha events as no-real-value audit lines when Supabase Edge is not configured.

3. Game backend integrations.
   - Add a scoped Supabase Edge Function client that calls Mochirii functions with `MOCHI_SOCIAL_GAME_SERVER_TOKEN`.
   - Add Enjin Canary orchestration helpers for managed-wallet creation, hot-to-cold mint, cold-to-hot burn, fixed listing creation, and finality checks.
   - Never credit hot inventory until a cold-to-hot burn is finalized.
   - Never hold a Supabase service-role key or Enjin Wallet Daemon seed in the game repo/client.

4. Mochirii repo integration.
   - Add Supabase migrations and Edge Functions for allowlist, terms, game action recording, chat/report handling, market/trade actions, chain operation recording, admin grant/revoke/list, and feedback.
   - Add `/games/mochi-social` preview route using `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
   - Add required alpha acknowledgement before embedding.
   - Add leader/admin controls for alpha access and audit visibility.

5. Verification and handoff.
   - Run game install/typecheck/lint/test/build/smoke.
   - Run `npm run alpha:local-suite` for the local no-cost bundled RC pass.
   - Run `npm run alpha:local-evidence` to validate and summarize the ignored localhost evidence reports.
   - Run `npm run alpha:operator-checklist`, refresh `npm run alpha:external-gates`, stamp a current `npm run alpha:rc-audit` report, then run `npm run alpha:sync-approval` and `npm run alpha:report-hygiene` to summarize blocked approval steps and scan local evidence plus no-secret handoff artifacts for accidental secret leakage.
   - Run `npm run alpha:preview-ready` after approved hosted preview checks to prove the tester-entry stop point separately from later funded-chain Alpha RC gates.
   - Run local alpha acceptance against a started game server with `npm run alpha:local-acceptance`.
   - Run 10-25 tester HTTP contract load smoke with `npm run alpha:load-smoke` locally by default. Hosted load smoke requires explicit user approval.
   - Run the two-tab browser presence smoke with `npm run alpha:browser-presence` to prove HUD presence, canvas movement signatures, observer-side canvas change, and HUD quick actions; then complete the manual NPC/chest/habitat map-object prompt check.
   - Run `npm run alpha:visual-snapshot` to capture ignored local first-screen page/canvas PNGs for visual review.
   - Run `npm run alpha:visual-review` to tie screenshot hashes, two-tab presence, HUD action proof, map-object IDs, and habitat coverage into ignored local review artifacts while preserving rendered NPC/chest/habitat prompt interaction as a manual gate.
   - Run `npm run alpha:manual-prompt-review` after a local operator/browser review confirms the rendered welcome NPC, guild seal chest, and habitat/care prompts. The command writes a pending report until explicit prompt-confirmation env vars are set.
   - Run `npm run alpha:wallet-daemon-check` to verify only local Wallet Daemon binary metadata, hash, and help output without importing wallets, printing seeds, starting signers, contacting Enjin, funding Fuel Tanks, or submitting chain transactions.
   - Run the private Enjin operator route smoke with `npm run alpha:enjin-operator-smoke`.
   - Run site checks, app lint/build, Supabase function type checks, and static secret scans.
   - Document preview deploy commands and external setup steps for Fly, Vercel, Supabase, Enjin Platform, Fuel Tank, and Wallet Daemon, with no-cost gates for every provider action.
   - Require `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` for any approved `npm run alpha:external-gates` pass that fetches hosted Fly/Vercel contract URLs.
   - Require `reports/alpha-external-gates.json` to carry current Git state and the hosted-check approval flag before `npm run alpha:rc-audit` can treat it as provider evidence.
   - Require `reports/alpha-sync-approval.json` to reference the current external-gates report checkedAt/HEAD/hosted approval state before `npm run alpha:rc-audit` can treat it as the approval packet.

## Alpha Preview Ready Lane

For the next development pass, optimize for [`docs/alpha-preview-ready.md`](alpha-preview-ready.md):

- `preview-live-gates` must pass before testers: Fly game URL, Mochirii Vercel Preview route, `NEXT_PUBLIC_MOCHI_SOCIAL_URL`, Supabase allowlist/terms/feedback, iframe auth, no-real-value labels, and approved hosted contract checks.
- `funded-chain-gates` may remain red: cENJ, collection ID, Fuel Tank ID, Wallet Daemon signing, and finalized Enjin proof.
- Do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`.
- Keep the Canary request UI visible and explain `configured-preview-stub`.
- Record chain requests as no-real-value audit-only preview records until real finality exists.

## Public Contract

- Manifest flags:
  - `auth.required`
  - `alpha.allowlistRequired`
  - `alpha.termsRequired`
  - `economy.mode = "test-soft-currency"`
  - `chain.provider = "enjin"`
  - `chain.network = "CANARY"`
  - `market.fixedPrice = true`
  - `market.auctions = false`
  - `ugc = "curated"`
- Website env:
  - `NEXT_PUBLIC_MOCHI_SOCIAL_URL`
- Game/Fly env:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_AUTH_REQUIRED`
  - `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`
  - `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
  - `ENJIN_PLATFORM_URL`
  - `ENJIN_PLATFORM_TOKEN`
  - `ENJIN_NETWORK=CANARY`
  - `ENJIN_COLLECTION_ID`
  - `ENJIN_FUEL_TANK_ID`
  - `RPG_ALLOWED_ORIGINS`

## Acceptance Criteria

- Two browser tabs show player presence.
- A tester can attune one Mochi Spirit, record discovered spirit journal details, practice one technique mastery action, complete or study one no-injury affinity trial, form a party, practice a no-injury spar ladder, care for it, train in a no-injury guild spar, complete one raising action, progress one roleplay quest, increase bond, unlock a growth state, and see status in the HUD.
- A tester can use local chat/emote UI and see actions recorded locally or through Supabase Edge.
- A tester can create a no-real-value fixed market listing proof and a direct trade proof for eligible alpha assets.
- A tester can request an Enjin Canary certificate path for one eligible rare asset; when Enjin env is missing, the runtime must explain it is a configured preview stub.
- Alpha Preview Ready can be reached with Enjin still in `configured-preview-stub`; Alpha RC Ready cannot pass until funded-chain gates are green.
- The manifest and smoke checks expose alpha flags and no-real-value chain state.
- The Mochirii preview route requires signed-in allowlisted access and tester acknowledgement before embedding.
- Admin tools can grant/revoke alpha access and view audit status.
- Production/mainnet/cashout/open UGC remain disabled and documented as out of scope.

## Handoff Commands

Game repo:

```powershell
npm install
npm run secret-scan
npm run alpha:readiness
npm run typecheck
npm run lint
npm test
npm run build
npm run alpha:built-server-smoke
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:operator-checklist
npm run alpha:provider-preflight
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:preview-ready
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; $env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:browser-presence
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-snapshot
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:enjin-operator-smoke
```

Mochirii repo:

```powershell
npm run check
cd apps/web
npm run lint
npm run build
```

External operator steps stay interactive and cost-gated when they can add charges or mutate sensitive provider state: Fly/Vercel/Supabase/Enjin login, secret entry, Wallet Daemon seed creation, Fuel Tank funding, hosted load smoke, paid/quota-bearing CI reruns, and preview deploy promotion. Public-repo branch pushes are allowed under the current user policy; verify PR/CI checks afterward.

Hosted external gate checks stay no-cost gated too. Set `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` only for an explicitly approved hosted verification run; without it, `npm run alpha:external-gates` must refuse hosted Fly/Vercel contract fetches.
