# Alpha Acceptance

This file is the repeatable local acceptance gate for Mochi Social Alpha RC. It covers the public game routes, integration contract, local no-real-value economy writes, automated browser presence/movement evidence, a static map-object contract test, and the final manual map-object visual check that still needs human eyes.

## Alpha Preview Ready

Alpha Preview Ready is the live-on-site gate before full Alpha RC Ready. It is allowed to keep Enjin in `configured-preview-stub` mode.

Before inviting testers to the Mochirii Vercel Preview:

- The Fly game URL is known and approved for hosted contract checks.
- The Mochirii Vercel Preview route `/games/mochi-social` uses `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
- Supabase allowlist, terms acknowledgement, feedback, admin audit, and `MOCHI_SOCIAL_AUTH` bridge checks pass.
- The chain UI remains visible and no-real-value, and the Canary request explains `configured-preview-stub`.
- `preview-live-gates` are green.
- `funded-chain-gates` are documented as expected red until cENJ, collection, Fuel Tank, Wallet Daemon signing, and finality smoke are approved.
- No dummy `ENJIN_COLLECTION_ID`, dummy `ENJIN_FUEL_TANK_ID`, or fake Enjin readiness flags are set.

Use [`docs/alpha-preview-ready.md`](alpha-preview-ready.md) as the operator checklist for this stop point.

## Local Script

Build and start the game server from the repo root:

```powershell
npm run build
$env:PORT="3100"
$env:RPG_SAVE_DIR=".local/saves"
npm run start
```

In a second terminal:

```powershell
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"
$env:RPG_SAVE_DIR=".local/saves"
npm run smoke
npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_PLAYERS="25"
npm run alpha:load-smoke
npm run alpha:browser-presence
npm run alpha:visual-snapshot
npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
npm run alpha:enjin-operator-smoke
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:operator-checklist
npm run alpha:provider-preflight
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:external-gates
npm run alpha:rc-audit
```

The acceptance script verifies:

- `GET /healthz`
- `GET /play`
- `GET /embed`
- `GET /integration/game-manifest.json`
- `GET /integration/alpha/status`
- `POST /integration/alpha/action` rejects malformed actions.
- `chat.send`, `emote.send`, `pet.befriend`, `pet.care`, `market.fixed_list`, `trade.direct_offer`, and `chain.withdraw_request` record to the no-real-value fallback ledger when Mochirii Supabase Edge Functions are not configured.
- When Enjin secrets are not configured, alpha status and `chain.withdraw_request` responses expose `configured-preview-stub` so testers know the Canary certificate path is staged but not externally submitted.

By default the script expects local fallback mode and checks `.local/saves/alpha-ledger.jsonl`. If testing a preview runtime with Supabase Edge Functions configured, set `MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true` to limit the script to endpoint and contract checks, then use the Mochirii admin audit views for authoritative ledger proof.

The script writes `reports/alpha-local-acceptance.json` as a local, ignored evidence artifact. Local fallback ledger rows must include `ledgerVersion=1`, `source="local-alpha-ledger"`, `alphaStopPoint="alpha-rc-ready"`, `chainNetwork="CANARY"`, `noRealValue=true`, `receivedAt`, and the original action payload.

## Load Smoke

`npm run alpha:load-smoke` simulates 10-25 testers against the HTTP alpha contract. It opens `/play` concurrently, records chat and emote actions through `/integration/alpha/action`, and verifies the no-real-value fallback ledger entries.

This is a release-candidate smoke, not a capacity benchmark. Use `MOCHI_SOCIAL_LOAD_PLAYERS=10` through `25`; the default is `25`. The script writes `reports/alpha-load-smoke.json`. Run this against `localhost` by default. Hosted Fly/Vercel/Supabase load smoke can increase usage and requires explicit user approval.

## Built Server Smoke

`npm run alpha:built-server-smoke` starts the built `dist/server/express.js` runtime on a disposable localhost port with throwaway server-token env, no Enjin live secrets, and no Supabase Edge forwarding. It verifies `/healthz`, `/play`, `/integration/game-manifest.json`, `/integration/alpha/status`, and the private Enjin operator route fail-closed path. This catches server bundle/runtime drift before any Fly deploy. The ignored `reports/built-server-smoke.json` report includes sanitized server stdout/stderr, Git state, exit code, exit signal, and stopped status even if the built server exits before readiness.

## Local Alpha Suite

`npm run alpha:local-suite` is the local no-cost release-candidate pass. It builds once, runs the local Wallet Daemon binary metadata check, starts the built Express runtime on a disposable localhost port with a throwaway game-server token, uses an isolated `.local/alpha-suite/<run>/saves` directory, clears live Supabase Edge and Enjin env from child processes, and then runs endpoint smoke, local alpha acceptance, HTTP load smoke, browser presence, visual snapshot, visual review, and private Enjin operator smoke. It writes `reports/alpha-local-suite.json` with sanitized command/server output plus stopped status, and shuts the server down at the end.

The suite defaults to `10` simulated testers for the HTTP load-smoke portion to keep local runs quick. Set `MOCHI_SOCIAL_LOCAL_SUITE_LOAD_PLAYERS=25` for the full local release-candidate load count. It remains localhost-only; hosted preview suite runs require explicit hosted-smoke approval and should use the individual preview commands below instead.

Run `npm run alpha:local-evidence` after the local suite to validate the ignored localhost reports and write `reports/alpha-local-evidence.json` plus `reports/alpha-local-evidence.md`. It requires the acceptance, load, browser, visual, and operator reports to share the same local suite base URL, and it requires both the suite report and built-server smoke report to match the current local HEAD, upstream, and dirty worktree state, so stale localhost evidence cannot be mixed into a fresh summary or reused across code changes. The JSON summary also records current Git state, and `npm run alpha:rc-audit` rejects it when it becomes stale. These summaries are no-secret local artifacts; they do not prove hosted Fly, Vercel, Supabase, GitHub, or Enjin readiness.

## Manual Prompt Review Gate

`npm run alpha:manual-prompt-review` writes `reports/alpha-manual-prompt-review.json` and `reports/alpha-manual-prompt-review.md`. By default it records `pending-human-review` and exits non-zero. It passes only after an operator opens the playable game locally, focuses the game canvas, stands adjacent to the map object, holds Space/Action for about 200ms, confirms the rendered welcome NPC dialog, token chest prompt/save feedback, and habitat/care prompt are coherent, then sets explicit confirmation env vars.

Local completion example:

```powershell
$env:MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER="<operator name>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER="<browser and version>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_URL="http://localhost:3100/play"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_TOKEN_CHEST_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK="true"
npm run alpha:manual-prompt-review
```

Hosted prompt review requires explicit hosted-preview approval first, then `MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true`. `npm run alpha:rc-audit` rejects a missing, stale, pending, or hosted-without-approval manual prompt review report.

## Wallet Daemon Local Check

`npm run alpha:wallet-daemon-check` verifies only local Wallet Daemon binary metadata. By default on this Windows workstation it first checks `C:\Users\xtyty\Desktop\Creds\enjin-wallet-daemon\wallet-daemon.exe`, then falls back to `C:\Users\xtyty\Downloads\wallet-daemon_v3.0.7_x86_64-pc-windows-msvc\wallet-daemon.exe`; set `MOCHI_SOCIAL_WALLET_DAEMON_PATH` to override those paths. The script hashes the file, runs `wallet-daemon --help`, records observed help commands, and writes ignored no-secret `reports/wallet-daemon-local.json` and `reports/wallet-daemon-local.md`.

This check is intentionally weaker than Enjin readiness. It does not import wallets, print seeds, start a signer, contact Enjin Platform, create a collection, fund a Fuel Tank, or submit a chain transaction. Alpha RC still requires an operator to confirm Enjin Platform shows Wallet Daemon connected before the collection, Fuel Tank, and proof-operation gates can pass.

Run `npm run alpha:operator-checklist`, refresh `npm run alpha:external-gates` in no-hosted or explicitly approved hosted mode, run `npm run alpha:provider-preflight`, run `npm run alpha:rc-audit` once to stamp the current audit report, then run `npm run alpha:sync-approval` and `npm run alpha:report-hygiene` after local evidence to scan the ignored local reports and generated no-secret operator/sync checklists for accidental token, key, service-role, wallet, or passphrase patterns. The operator checklist command writes `reports/alpha-operator-checklist.json`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-operator-next-steps.md`, and `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-external-gates-status.md` with the current local HEAD, upstream, dirty state, no-cost rule, private gate summary, current external gate state, and a provider action queue with exact approval text and no-cost fallbacks. The provider preflight command writes `reports/alpha-provider-preflight.json` plus `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-provider-preflight.md` with expected private input filenames, queue IDs, and missing filename status without reading private credential file contents. The sync approval command writes `reports/alpha-sync-approval.json` plus `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-sync-approval.md` with local branch drift, expected audit blockers after the freshly generated packet, self-referential sync freshness items, post-packet report-hygiene freshness items, raw prior audit blockers, external-gate snapshot, cost/usage risk, no-cost alternatives, and explicit approval text for CI/provider steps. It is not approval by itself. Report hygiene writes `reports/alpha-report-hygiene.json` with current Git state, and `npm run alpha:rc-audit` rejects stale operator checklist, provider preflight, sync approval, external-gate, or hygiene reports.

`npm run alpha:preview-ready` writes `reports/alpha-preview-ready.json`, `reports/alpha-preview-ready.md`, and `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-preview-ready.md`. It proves the tester-entry lane separately from funded-chain Alpha RC gates by requiring current local evidence, current no-secret hygiene, completed manual prompt review, current handoff packets, synced game/site branches, and green `preview-live-gates` from an explicitly approved hosted external-gates run.

The Mochirii repo mirrors this with `npm run check:mochi-social-preview-ready`, which writes ignored no-secret site-side reports and requires game Preview Ready evidence, site branch sync, hosted game contract proof, Supabase Edge smoke, and explicit manual browser gate confirmation before testers enter.

Full `npm run alpha:rc-audit` reads the Mochirii site-side report from `../Mochirii/reports/mochi-social-preview-ready.json` and fails until it is green and current, because allowlist, terms, feedback, and browser-gate proof belong to the website repo.

## Private Enjin Operator Smoke

`npm run alpha:enjin-operator-smoke` verifies `POST /integration/alpha/enjin/submit` fails closed without the private game server token. When testing a local server that was started with a non-production `MOCHI_SOCIAL_GAME_SERVER_TOKEN`, set `MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN` to the same value to also verify the tokened no-Enjin-secrets path returns `enjin_canary_not_configured`.

The smoke refuses to submit or poll live Enjin by default when the runtime reports `enjinCanaryConfigured=true`. Only an operator should opt into live Canary smoke with `MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE=true`, `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID`, and `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID` after an approved Canary transaction exists. The script writes `reports/enjin-operator-smoke.json`.

## External Gate Audit

`npm run alpha:external-gates` checks live Alpha RC gates without printing secret values. It verifies GitHub PR status, Supabase preview secret names, Fly authentication/app/volume/secret names, live game contract, Mochirii site contract, and operator-confirmed Enjin readiness flags.

Read this report in two lanes while preparing the Vercel Preview:

- `preview-live-gates`: game URL, site preview URL, Supabase preview secrets, hosted game/site contract, allowlist/terms/feedback browser checks.
- `funded-chain-gates`: Enjin collection, Fuel Tank, cENJ, Wallet Daemon signing, finalized proof smoke.

The funded-chain lane is expected red for Alpha Preview Ready. Do not fake it with dummy IDs.

Before Alpha RC Ready, run it with the Fly game URL and Vercel preview origin:

```powershell
$env:MOCHI_SOCIAL_GAME_URL="https://<fly-preview-host>"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="<supabase-preview-ref>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true" # Requires explicit hosted verification approval.
npm run alpha:external-gates
```

Without `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true`, the external gate script refuses hosted Fly/Vercel contract fetches and reports the hosted checks as blocked. This keeps accidental hosted traffic out of local-only work. The script writes `reports/alpha-external-gates.json` with current Git state and the hosted approval flag, and `npm run alpha:rc-audit` rejects stale or pre-guard external gate reports.

For live Enjin completion, the operator must also provide non-public server env/secrets and set local confirmation flags only after dashboard verification: `ENJIN_PLATFORM_TOKEN`, `ENJIN_COLLECTION_ID`, `ENJIN_FUEL_TANK_ID`, `MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED=true`, `MOCHI_SOCIAL_ENJIN_COLLECTION_READY=true`, and `MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY=true`.

`npm run alpha:operator-checklist` writes the current no-secret handoff to the local credentials folder and `reports/alpha-operator-checklist.json` for machine-readable freshness checks. `npm run alpha:provider-preflight` writes expected private input filenames and approval queue evidence without opening private files. Treat both as checklists only; they are not evidence that private provider gates are complete.

## Alpha RC Audit

`npm run alpha:rc-audit` reads the game repo, sibling Mochirii repo, latest external gate report, current local evidence summary, current operator checklist report, current sync approval packet, local Git branch sync for both repos, GitHub PR state, and no-secret operator checklists. It writes `reports/alpha-rc-audit.json` and exits non-zero until every explicit Alpha RC requirement has direct evidence. The external gate report, local evidence summary, operator checklist, and sync approval packet must match the current local HEAD, upstream, and dirty state so stale provider proof, localhost proof, handoff, or push/provider approval text cannot pass the audit. The sync approval packet must also point at the current external-gate report checkedAt/HEAD/hosted approval state. This audit is the final pre-tester stoplight; it should remain red while Fly billing, live preview URLs, Enjin Canary readiness, or game/site local-vs-remote branch drift are incomplete.

## Two-tab Presence Gate

`npm run alpha:browser-presence` opens two pages in one browser context and verifies both tabs render the game canvas, the alpha HUD, and a `Nearby: 2 testers` presence chip. It captures canvas screenshot signatures, sends movement keys in both tabs, verifies each canvas changes, and verifies the observer tab changes after first-tab movement. It also clicks the HUD care, profile view, local friend proof, pet inspect, chat, emote, fixed-list, direct-trade, and Canary certificate actions, then verifies the visible HUD and `mochiSocial.alphaState` update. It writes `reports/alpha-browser-presence.json`.

The browser smoke is local-only by default to avoid hosted preview usage. Set `MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true` only after explicit hosted-preview approval. It prefers installed Chrome. If Chrome is installed outside the default Playwright channel, set `MOCHI_SOCIAL_BROWSER_EXECUTABLE` to the browser executable path. Set `MOCHI_SOCIAL_BROWSER_HEADFUL=true` when you want to watch the check run.

## Visual Snapshot Gate

`npm run alpha:visual-snapshot` opens `/play`, waits for the HUD, presence label, and canvas, and writes ignored first-screen evidence to `reports/alpha-visual-snapshot.json`, `reports/alpha-visual-page.png`, and `reports/alpha-visual-canvas.png`. It is local-only by default; set `MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT=true` only after explicit hosted-preview approval.

Use the PNGs for local human/Codex visual review of the town composition. The snapshot proves the first screen is renderable and reviewable; browser presence and map-object contract tests still provide the movement, HUD action, event ID, prompt, save-source, habitat, and collision evidence.

`npm run alpha:visual-review` reads `reports/alpha-visual-snapshot.json`, `reports/alpha-browser-presence.json`, the PNGs, and the first-town map-object sources, then writes ignored no-secret `reports/alpha-visual-review.json` and `reports/alpha-visual-review.md`. It verifies screenshot dimensions and hashes, HUD/presence evidence, observer movement, HUD pet/market/trade/Canary actions, required map-object IDs, and Lantern Garden habitat coverage. It keeps rendered NPC/chest/habitat prompt interaction as `pending-human-review`; it is a durable local review bundle, not a fake replacement for the manual prompt check.

The browser smoke proves HUD-level two-tab presence, canvas movement response, and a synchronized observer-side canvas change. The unit suite also includes `apps/game/tests/map-object-contract.test.ts`, which verifies stable RPGJS event IDs, event coordinates, prompt/save-source snippets, companion habitat labels, and collision-layer evidence for the first town. `apps/game/tests/map-event-behavior.test.ts` executes the welcome NPC, token chest, Momo befriend/care, market board, trade post, and Canary shrine handlers with item, save-source, variable, dialog-text, no-real-value, and Wallet Daemon-stub assertions.

Those tests prove the event contract and behavior. The remaining human visual check is for rendered in-browser prompt behavior and overall scene confidence before Alpha RC Ready:

1. Open two browser tabs or windows to `${MOCHI_SOCIAL_BASE_URL}/play`.
2. Confirm the game canvas, HUD, and town scene are visually coherent.
3. Interact with the NPC, chest, and habitat/care loop in at least one tab. Focus the canvas, stand adjacent to the object, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.
4. Confirm the prompts and notifications match the alpha no-real-value scope.
5. Record the date, browser, game URL, `reports/alpha-browser-presence.json` result, and manual map-object result in the PR or release checklist.

Keep the manual map-object check until a later RPGJS runtime-level automation can interact with NPC, chest, habitat, and dialog state directly inside the canvas.

## Alpha RC Stop Point

Alpha Preview Ready means local acceptance, endpoint smoke, typecheck, lint, tests, build, approved hosted preview contract checks, Mochirii preview allowlist/terms/feedback checks, rollback notes, tester guide, source/asset ledgers, and Enjin `configured-preview-stub` messaging are complete.

Alpha RC Ready means Alpha Preview Ready plus approved Enjin Canary collection, Fuel Tank, Wallet Daemon signing, finalized proof smoke, and funded-chain gate evidence are complete.

Do not use this checklist to promote production, Enjin mainnet, paid assets, cashout, open UGC, or public launch.
Do not use this checklist to add billing usage. Follow [`docs/no-cost-operations.md`](no-cost-operations.md) before any hosted, CI, provider, Fuel Tank, or live chain action.
