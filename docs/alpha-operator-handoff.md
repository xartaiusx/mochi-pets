# Alpha Operator Handoff

This handoff keeps Mochi Social closed, no-real-value, and preview-only. It covers two stop points: Alpha Preview Ready first, then Alpha RC Ready after funded Enjin proof is explicitly approved. It is for the human operator who has access to Fly, Vercel, Supabase, Enjin Platform, and the Wallet Daemon host.

For Codex tool choice, secret entry, source hierarchy, preview ownership, CI gates, Supabase authority, Enjin state handling, Fuel Tank dispatch, WebSocket presence, and Discord boundaries, follow [`docs/codex-external-ops.md`](codex-external-ops.md).

For no-cost operation rules, follow [`docs/no-cost-operations.md`](no-cost-operations.md). Public-repo commits and pushes are allowed without a separate prompt; verify PR/CI results afterward. Do not deploy, scale, run hosted load smoke, create provider resources, set provider secrets/env vars, fund Fuel Tanks, or submit live Enjin transactions without explicit user approval for that exact action.

## Stop Points

- Alpha Preview Ready means the Fly game is embedded by the Mochirii Vercel Preview route, Supabase allowlist/terms/feedback gates work, and Enjin remains visible as `configured-preview-stub`.
- Alpha RC Ready means Alpha Preview Ready plus funded Enjin Canary collection, Fuel Tank, Wallet Daemon signing, and finalized proof smoke.
- `preview-live-gates` are the tester-entry lane. `funded-chain-gates` are expected red until cENJ, Fuel Tank, and chain transaction approval exists.
- Do not set dummy `ENJIN_COLLECTION_ID`, dummy `ENJIN_FUEL_TANK_ID`, or fake readiness flags to clear funded-chain gates.

## Starting Point

- Game repo PR: `xartaiusx/mochi-social`, branch `codex/mochi-social-fullscale-alpha-preview`.
- Website repo PR: `Mochirii-Wushu/Mochirii`, branch `codex/mochi-social-alpha-rc`.
- Game runtime target: Fly app `mochi-social-game`.
- Website preview target: Mochirii Vercel preview route `/games/mochi-social`.
- Chain target: Enjin Canary only.
- Local no-cost commits may leave the game or Mochirii branch ahead of GitHub. Under the current user policy, public-repo pushes are allowed without a separate approval prompt; push the branch, verify PR checks, and rerun `npm run alpha:rc-audit` so `github.local-branch-sync` or `github.site-local-branch-sync` can clear.

## Operator Sequence

1. Confirm both PRs are reviewed and the local verification commands in the game and website repos pass.
2. Resolve GitHub Actions billing/budget blocks and require a green `Verify Mochi Social` check before merge, but do not rerun or trigger Actions without explicit approval.
3. Complete Alpha Preview Ready first: verify the Fly game URL, bind the Mochirii Vercel Preview env `NEXT_PUBLIC_MOCHI_SOCIAL_URL`, confirm Supabase allowlist/terms/feedback, and confirm the visible Enjin state is `configured-preview-stub`.
4. Set Fly secrets for the preview game runtime:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`
   - `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
   - `ENJIN_PLATFORM_URL`
   - `ENJIN_PLATFORM_TOKEN`
   - `ENJIN_NETWORK=CANARY`
   - `RPG_ALLOWED_ORIGINS`
5. Deploy the game preview to Fly with `RPG_SAVE_DIR=/data/saves` and a mounted `/data` volume only after explicit deploy approval.
6. Set the Mochirii Vercel preview env `NEXT_PUBLIC_MOCHI_SOCIAL_URL` to the Fly game URL only after confirming the preview environment will not add charges.
7. Deploy the Mochirii preview branch and Supabase preview Edge Functions only after explicit deploy approval.
8. Grant only signed-in 18+ testers through the Mochirii admin allowlist.
9. Require tester terms before iframe render.
10. Run the `preview-live-gates` acceptance checks before inviting testers.
11. Create or confirm the Enjin Canary project, `Mochi Social Alpha` collection, managed-wallet policy, and Canary Fuel Tank only after the user approves any cost-bearing chain or provider action.
12. Start the cloud Wallet Daemon as an outbound-only signer with no inbound ports. Back up the seed/passphrase outside Git and outside chat.
13. Add real `ENJIN_COLLECTION_ID` and `ENJIN_FUEL_TANK_ID` Fly secrets only after the matching Canary resources exist. Never use dummy values.
14. Run the `funded-chain-gates` acceptance checks only after funded-chain approval exists.

Run this whenever the local private handoff folder needs a fresh no-secret checklist:

```powershell
npm run alpha:operator-checklist
npm run alpha:provider-preflight
npm run alpha:sync-approval
```

The generated files go to `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-operator-next-steps.md`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-external-gates-status.md`, `reports/alpha-operator-checklist.json`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-provider-preflight.md`, `reports/alpha-provider-preflight.json`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-sync-approval.md`, and `reports/alpha-sync-approval.json` by default. They may list local credential filenames, required secret names, gate status, commit subjects, branch drift, provider action queue items, cost/usage risk, no-cost alternatives, and placeholder commands. They must not contain raw secret values. The operator checklist JSON, provider preflight, and sync packet must match the current local HEAD, upstream, and dirty state before `npm run alpha:rc-audit` can pass. The sync packet is not approval; it records branch sync status and prepares exact provider approval text for cost-bearing work.

## Current Private Gates

- Fly billing is complete. Current no-secret external gate evidence says Fly app `mochi-social-game` and volume `mochi_social_data` exist, but the live game URL and hosted contract checks are not recorded yet. Treat hosted deploy/smoke as approval-gated until `npm run alpha:external-gates` records an approved `MOCHI_SOCIAL_GAME_URL`.
- Enjin Wallet Daemon binary is downloaded locally and must be verified with `npm run alpha:wallet-daemon-check`; this only proves file hash/help metadata. Enjin Platform must still show daemon status online before continuing to collection and Fuel Tank work.
- Remaining Enjin gates are the `Mochi Social Alpha` Canary collection, Canary Fuel Tank, and proof operations. These are `funded-chain-gates` and stay blocked until the user explicitly approves cost-bearing chain/provider actions.
- For Alpha Preview Ready, Enjin may remain in `configured-preview-stub` and chain requests, including Jade Vault return previews, are audit-only/no-real-value preview records. This is not a blocker for `preview-live-gates`.
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
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:enjin-operator-smoke
npm run alpha:external-gates
npm run alpha:operator-checklist
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:preview-ready
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
npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
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

- Read `provider.external-gates` in two lanes: `preview-live-gates` must pass before testers, while `funded-chain-gates` can remain red for Alpha Preview Ready.
- `npm run alpha:browser-presence` passes with two-tab canvas movement signatures and observer-side canvas change evidence, then an operator confirms NPC, chest, and habitat/care prompts look correct in the town. Focus the canvas, stand within one 64px logical tile of the object, face it, and press Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.
- `npm run alpha:visual-snapshot` passes and the ignored `reports/alpha-visual-page.png` / `reports/alpha-visual-canvas.png` screenshots are reviewed for first-screen town/HUD composition.
- `npm run alpha:visual-review` passes and writes `reports/alpha-visual-review.json` / `.md`, tying screenshot hashes, HUD/presence evidence, HUD action proof, journal/expedition/route-invitation/route-mastery/habitat-bond/spirit-research/spirit-compendium/roster-archive/market-receipt/provision-satchel/care-cycle/temperament-concord/field-almanac/route-ecology/encounter-atlas/craft-writ/exchange-accord/route-waystone/nurture-rite/recovery-tea/kinship-album/nursery-grove/bloom-ascendance/lineage-register/capture-rite/dojo-ladder/tournament-bracket/rival-circle/sifu-council/summit-circuit/guild-commission/social-rally/story-chapter/guild-insignia-case/technique/tactic/loadout/technique-codex/trait/condition-weave/affinity-matrix/guild-rank/growth-rite/affinity/party/harmony/concord/team-match/mentor map-object IDs, and habitat coverage to the current local HEAD while keeping rendered NPC/chest/habitat prompts as a pending human review gate.
- `npm run alpha:manual-prompt-review` writes `reports/alpha-manual-prompt-review.json` / `.md` and stays pending until an operator records explicit local confirmation for the welcome NPC, guild seal chest, and habitat/care prompts.
- `npm run alpha:wallet-daemon-check` passes and writes `reports/wallet-daemon-local.json` / `.md` with local binary path, SHA256, and `--help` command evidence only. It is not proof that a signer is running or that Enjin Platform is connected.
- `npm run alpha:local-suite` passes on localhost and writes `reports/alpha-local-suite.json` with the bundled endpoint, acceptance, load, browser, and operator smoke evidence.
- File-backed saves remain durable under overlapping autosave and event-save writes: per-player writes are serialized and written through a temporary file before rename, and the local suite plus built-server smoke are the pre-deploy guards for this behavior.
- `npm run alpha:local-evidence` passes and writes the no-secret ignored `reports/alpha-local-evidence.json` / `.md` summary, with acceptance, load, browser, visual, operator, and built-server reports tied to the same local suite evidence set and current local HEAD. `npm run alpha:rc-audit` fails if that local evidence summary is stale against the current local HEAD, upstream, or dirty state.
- `npm run alpha:operator-checklist` writes the no-secret ignored `reports/alpha-operator-checklist.json`, local `mochi-social-alpha-operator-next-steps.md`, and local `mochi-social-alpha-external-gates-status.md` handoffs with the current local HEAD, upstream, dirty state, external gate summary, provider action queue, and no-cost approval rule. `npm run alpha:rc-audit` fails if that checklist report is stale against the current local HEAD, upstream, dirty state, or missing the expected provider action queue IDs and approval/fallback fields.
- `npm run alpha:provider-preflight` writes the no-secret ignored `reports/alpha-provider-preflight.json` and local `mochi-social-alpha-provider-preflight.md` handoff with expected private input filenames, provider action queue IDs, and missing filename status. It never reads private credential file contents. `npm run alpha:rc-audit` fails if that preflight report is stale against the current local HEAD or missing expected queue/private-input evidence.
- `npm run alpha:external-gates` writes the no-secret ignored `reports/alpha-external-gates.json` with current Git state and `hostedChecksAllowed`. `npm run alpha:rc-audit` fails if that external gate report is stale, was generated before the hosted-check guard, or tries to count hosted Fly/Vercel contract proof without explicit hosted-check approval.
- Run `npm run alpha:rc-audit` once after the current external-gates report so `reports/alpha-rc-audit.json` has current Git state, then run `npm run alpha:sync-approval`.
- `npm run alpha:sync-approval` writes the no-secret ignored `reports/alpha-sync-approval.json` and local `mochi-social-alpha-sync-approval.md` packet with a cost-sensitive action matrix before requesting any provider approval. Public-repo pushes are allowed, but the packet still records branch drift and PR state. The packet separates raw prior audit failures from the expected blockers after the packet is freshly generated, so prior `local.sync-approval-current` self-freshness and post-packet `local.report-hygiene` freshness failures do not look like active provider blockers. `npm run alpha:rc-audit` fails if that packet is stale against the current local HEAD, upstream, dirty state, current audit report Git state, or current external-gate report checkedAt/HEAD/hosted approval state.
- `npm run alpha:report-hygiene` passes and writes `reports/alpha-report-hygiene.json` after scanning ignored local reports and generated no-secret checklist artifacts. `npm run alpha:rc-audit` fails if the hygiene report is stale against the current local HEAD, upstream, or dirty state.
- Mochirii preview blocks non-testers.
- Mochirii preview blocks allowlisted testers until alpha terms are acknowledged.
- Feedback submission appears in the admin audit view.
- For Alpha Preview Ready, Enjin chain UI is visible with `configured-preview-stub`, no dummy Enjin IDs are set, and certificate request plus Jade Vault return rows are audit-only/no-real-value preview records.
- For Alpha RC Ready, Enjin Canary managed wallet, Fuel Tank sponsorship, Wallet Daemon signing, one hot-to-cold proof, one finalized cold-to-hot proof, and one fixed-listing proof are submitted through `POST /integration/alpha/enjin/submit` and recorded in the chain ledger.
- `npm run alpha:preview-ready` proves the tester-entry lane after hosted preview checks are approved. It can pass while funded-chain gates are red, but it cannot pass with unsynced local branches or disabled hosted contract checks.
- `npm run alpha:enjin-operator-smoke` proves the private Enjin route fails closed; live Canary smoke is operator-approved only and requires explicit smoke request/transaction IDs.
- `npm run alpha:external-gates` can prove `preview-live-gates` with the Fly URL, Vercel preview URL, Supabase preview ref, and `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` for an approved hosted verification run while funded-chain readiness remains red.
- `npm run alpha:external-gates` only proves full Alpha RC Ready when operator-confirmed Enjin readiness flags are set from real Canary resources and finalized proof evidence.
- `npm run alpha:rc-audit` passes only after game branch sync, Mochirii site branch sync, site, PR, provider, and handoff evidence all agree that Alpha RC Ready is true.
- A 10-25 tester load-smoke report is attached to the PR or release checklist.

## Tester Guide

Tell testers:

- This is a closed alpha preview for allowlisted 18+ testers only.
- Assets, Mochi Spirits, currency, trades, listings, and Enjin Canary operations have no real value.
- Do not buy, sell, cash out, or represent alpha assets as production assets.
- Use a desktop browser.
- Sign in through Mochirii, open `/games/mochi-social`, accept the alpha terms, and wait for the iframe to load.
- Try the town loop: move, meet one Mochi Spirit, scout Moonbridge and Cloudbell, invite the route spirits, record the Jade Cloudbell route mastery proof, record the Jade Court Habitat Bond proof, record the Jade Court Research Folio proof, seal the Jade Court Spirit Compendium proof, record the Jade Court Roster Archive proof, record the Jade Court Market Receipt proof, stock the Jade Court Provision Satchel proof, record the Jade Court Care Cycle proof, record the Jade Temperament Concord proof, record the Jade Field Almanac proof, record the Jade Route Ecology Survey proof, record the Jade Weather Veil proof, record the Jade Encounter Atlas proof, record the Jade Court Craft Writ proof, record the Jade Exchange Accord proof, activate the Jade Cloudbell Waystone proof, seal the Jade Moonwell Nurture Rite proof, record the Jade Teahouse Recovery proof, record the Jade Kinship Album proof, record the Jade Nursery Grove proof, record the Jade Bloom Ascendance proof, record the Jade Capture Rite proof, record the Jade Lineage Register proof, complete the first quest-chain board postings, clear the Jade Dojo Ladder proof, clear the Jade Banner Tournament proof, clear the Jade Rival Circle proof, clear the Jade Sifu Council proof, clear the Jade Summit Circuit proof, record the Jade Court Commission Ledger proof, record the two-tester Jade Courtyard Rally proof, record the Jade Scroll Story Chapter proof, seal the Jade Insignia Case proof, practice a technique, study a tactic scroll, prepare the Jade Step Loadout proof, seal the Jade Technique Codex proof, attune the Jade Heart Trait proof, weave the Jade Mirror Condition Weave proof, map the Jade Affinity Matrix proof, record the Jade Court rank proof, open the Moonwell Bloom growth proof, try the Jade Mirror affinity trial, form the three-spirit party, record Triune Jade Harmony, clear the Jade Echo Concord no-injury social battle proof, clear the Jade Mirror Team Match full-party spar proof, clear the Silk Banner Mentor Drill proof, care for it, view the profile status, add the local guild buddy proof, set the social status, inspect the HUD, send one local chat message, use one emote, create one test market listing, record one no-real-value Jade Court Market Receipt proof, create one direct trade proof, request the Canary certificate proof, and stage the Jade Vault return preview.
- Also record the Jade Encounter Rotation proof before the atlas; the local encounter-rotation report id should remain no-real-value and never imply settled inventory.
- Also record the Jade Weather Veil proof before encounter rotation; the local weather-veil report id should remain no-real-value and never imply dynamic loot, scarcity, or settled inventory.
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

## Final Stop Point

Stop at Alpha Preview Ready before inviting closed testers. Stop again at Alpha RC Ready after funded-chain evidence exists. The next phase is a separate human tester run, not production launch.
