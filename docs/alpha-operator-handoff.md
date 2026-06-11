# Alpha Operator Handoff

This handoff keeps Mochi Social Alpha RC closed, no-real-value, and preview-only. It is for the human operator who has access to Fly, Vercel, Supabase, Enjin Platform, and the Wallet Daemon host.

For Codex tool choice, secret entry, source hierarchy, preview ownership, CI gates, Supabase authority, Enjin state handling, Fuel Tank dispatch, WebSocket presence, and Discord boundaries, follow [`docs/codex-external-ops.md`](codex-external-ops.md).

For no-cost operation rules, follow [`docs/no-cost-operations.md`](no-cost-operations.md). Do not deploy, scale, push CI-triggering branches, run hosted load smoke, create provider resources, fund Fuel Tanks, or submit live Enjin transactions without explicit user approval for that exact action.

## Starting Point

- Game repo PR: `xartaiusx/mochi-social`, branch `codex/mochi-social-alpha-rc`.
- Website repo PR: `Mochirii-Wushu/Mochirii`, branch `codex/mochi-social-alpha-rc`.
- Game runtime target: Fly app `mochi-social-game`.
- Website preview target: Mochirii Vercel preview route `/games/mochi-social`.
- Chain target: Enjin Canary only.
- Local no-cost commits may leave the game or Mochirii branch ahead of GitHub. In that state `npm run alpha:rc-audit` must remain red at `github.local-branch-sync` or `github.site-local-branch-sync` until the user explicitly approves a push/CI-triggering sync.

## Operator Sequence

1. Confirm both PRs are reviewed and the local verification commands in the game and website repos pass.
2. Resolve GitHub Actions billing/budget blocks and require a green `Verify Mochi Social` check before merge, but do not rerun or trigger Actions without explicit approval.
3. Create or confirm the Enjin Canary project, `Mochi Social Alpha` collection, managed-wallet policy, and Canary Fuel Tank only after the user approves any cost-bearing chain or provider action.
4. Start the cloud Wallet Daemon as an outbound-only signer with no inbound ports. Back up the seed/passphrase outside Git and outside chat.
5. Set Fly secrets for the game runtime:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`
   - `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
   - `ENJIN_PLATFORM_URL`
   - `ENJIN_PLATFORM_TOKEN`
   - `ENJIN_NETWORK=CANARY`
   - `ENJIN_COLLECTION_ID`
   - `ENJIN_FUEL_TANK_ID`
   - `RPG_ALLOWED_ORIGINS`
6. Deploy the game preview to Fly with `RPG_SAVE_DIR=/data/saves` and a mounted `/data` volume only after explicit deploy approval.
7. Set the Mochirii Vercel preview env `NEXT_PUBLIC_MOCHI_SOCIAL_URL` to the Fly game URL only after confirming the preview environment will not add charges.
8. Deploy the Mochirii preview branch and Supabase preview Edge Functions only after explicit deploy approval.
9. Grant only signed-in 18+ testers through the Mochirii admin allowlist.
10. Require tester terms before iframe render.
11. Run the acceptance checks below before inviting testers.

Run this whenever the local private handoff folder needs a fresh no-secret checklist:

```powershell
npm run alpha:operator-checklist
npm run alpha:sync-approval
```

The generated files go to `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-operator-next-steps.md`, `reports/alpha-operator-checklist.json`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-sync-approval.md`, and `reports/alpha-sync-approval.json` by default. They may list local credential filenames, required secret names, gate status, commit subjects, branch drift, cost/usage risk, no-cost alternatives, and placeholder commands. They must not contain raw secret values. The operator checklist JSON and sync packet must match the current local HEAD, upstream, and dirty state before `npm run alpha:rc-audit` can pass. The sync packet is not approval; it prepares the exact push/CI/provider approval text for the operator to review.

## Current Private Gates

- Fly billing is complete. Fly app `mochi-social-game` is deployed in `sjc` with volume `mochi_social_data` mounted at `/data`, and the public smoke check passes at `https://mochi-social-game.fly.dev`.
- Enjin Wallet Daemon is running as a separate local operator service. Enjin Platform settings show daemon status online before continuing to collection and Fuel Tank work.
- Remaining Enjin gates are the `Mochi Social Alpha` Canary collection, Canary Fuel Tank, and proof operations. These stay blocked until the user explicitly approves cost-bearing chain/provider actions.
- The Enjin console account state and Platform settings are live dashboard truth; do not infer readiness from docs alone.

## Acceptance Commands

Game repo local:

```powershell
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
npm run alpha:sync-approval
npm run alpha:report-hygiene
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; $env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:browser-presence
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-snapshot
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:enjin-operator-smoke
npm run alpha:external-gates
npm run alpha:operator-checklist
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:rc-audit
```

Game preview:

```powershell
$env:MOCHI_SOCIAL_BASE_URL="https://<fly-preview-host>" # Requires explicit hosted-smoke approval.
npm run smoke
$env:MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE="true"; npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_ALLOW_EDGE="true"; $env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke
npm run alpha:browser-presence
npm run alpha:visual-snapshot
npm run alpha:enjin-operator-smoke
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true"; $env:MOCHI_SOCIAL_GAME_URL="https://<fly-preview-host>"; $env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"; npm run alpha:external-gates
npm run alpha:operator-checklist
npm run alpha:sync-approval
npm run alpha:rc-audit
```

Mochirii repo:

```powershell
npm run check
cd apps/web
npm run lint
npm run build
```

Manual gates:

- `npm run alpha:browser-presence` passes with two-tab canvas movement signatures and observer-side canvas change evidence, then a human confirms NPC, chest, and habitat/care prompts look correct in the town.
- `npm run alpha:visual-snapshot` passes and the ignored `reports/alpha-visual-page.png` / `reports/alpha-visual-canvas.png` screenshots are reviewed for first-screen town/HUD composition.
- `npm run alpha:local-suite` passes on localhost and writes `reports/alpha-local-suite.json` with the bundled endpoint, acceptance, load, browser, and operator smoke evidence.
- `npm run alpha:local-evidence` passes and writes the no-secret ignored `reports/alpha-local-evidence.json` / `.md` summary, with acceptance, load, browser, visual, operator, and built-server reports tied to the same local suite evidence set and current local HEAD. `npm run alpha:rc-audit` fails if that local evidence summary is stale against the current local HEAD, upstream, or dirty state.
- `npm run alpha:operator-checklist` writes the no-secret ignored `reports/alpha-operator-checklist.json` and local `mochi-social-alpha-operator-next-steps.md` handoff with the current local HEAD, upstream, dirty state, external gate summary, and no-cost approval rule. `npm run alpha:rc-audit` fails if that checklist report is stale against the current local HEAD, upstream, or dirty state.
- `npm run alpha:sync-approval` writes the no-secret ignored `reports/alpha-sync-approval.json` and local `mochi-social-alpha-sync-approval.md` packet with a cost-sensitive action matrix before requesting any push/CI/provider approval. `npm run alpha:rc-audit` fails if that packet is stale against the current local HEAD, upstream, or dirty state.
- `npm run alpha:external-gates` writes the no-secret ignored `reports/alpha-external-gates.json` with current Git state and `hostedChecksAllowed`. `npm run alpha:rc-audit` fails if that external gate report is stale, was generated before the hosted-check guard, or tries to count hosted Fly/Vercel contract proof without explicit hosted-check approval.
- `npm run alpha:report-hygiene` passes and writes `reports/alpha-report-hygiene.json` after scanning ignored local reports and generated no-secret checklist artifacts. `npm run alpha:rc-audit` fails if the hygiene report is stale against the current local HEAD, upstream, or dirty state.
- Mochirii preview blocks non-testers.
- Mochirii preview blocks allowlisted testers until alpha terms are acknowledged.
- Feedback submission appears in the admin audit view.
- Enjin Canary managed wallet, Fuel Tank sponsorship, Wallet Daemon signing, one hot-to-cold proof, one finalized cold-to-hot proof, and one fixed-listing proof are submitted through `POST /integration/alpha/enjin/submit` and recorded in the chain ledger.
- `npm run alpha:enjin-operator-smoke` proves the private Enjin route fails closed; live Canary smoke is operator-approved only and requires explicit smoke request/transaction IDs.
- `npm run alpha:external-gates` passes with the Fly URL, Vercel preview URL, Supabase preview ref, `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` for an approved hosted verification run, and operator-confirmed Enjin readiness flags set.
- `npm run alpha:rc-audit` passes after game branch sync, Mochirii site branch sync, site, PR, provider, and handoff evidence all agree that Alpha RC Ready is true.
- A 10-25 tester load-smoke report is attached to the PR or release checklist.

## Tester Guide

Tell testers:

- This is a closed alpha preview for allowlisted 18+ testers only.
- Assets, pets, currency, trades, listings, and Enjin Canary operations have no real value.
- Do not buy, sell, cash out, or represent alpha assets as production assets.
- Use a desktop browser.
- Sign in through Mochirii, open `/games/mochi-social`, accept the alpha terms, and wait for the iframe to load.
- Try the town loop: move, meet one Mochi Spirit, care for it, inspect the HUD, send one local chat message, use one emote, create one test market listing, create one direct trade proof, and request the Canary certificate proof.
- Report bugs through the Mochirii feedback form. Do not send secrets, wallet seed phrases, or personal payment details in feedback.

## Rollback

If an alpha issue appears:

1. Revoke new tester grants in the Mochirii admin allowlist.
2. Disable the Mochirii preview route or unset `NEXT_PUBLIC_MOCHI_SOCIAL_URL` for the affected preview deployment.
3. Scale the Fly game app down or roll back to the previous Fly release.
4. Rotate `MOCHI_SOCIAL_GAME_SERVER_TOKEN` if Edge Function trust is in question.
5. Revoke or rotate the Enjin Platform API token if chain orchestration is in question.
6. Stop the Wallet Daemon if signing behavior is in question.
7. Preserve `/data/saves`, Supabase ledger rows, and Enjin transaction IDs for audit before deleting anything.
8. Document the incident, affected request IDs, rollback command, and recovery decision in the PR or release checklist.

Do not respond to alpha issues by switching to production, mainnet, cashout, paid assets, public UGC, or service-role keys in the game runtime.

## Stop Point

Stop at Alpha RC Ready. The next phase is a separate human tester run, not production launch.
