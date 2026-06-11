# Alpha Acceptance

This file is the repeatable local acceptance gate for Mochi Social Alpha RC. It covers the public game routes, integration contract, local no-real-value economy writes, automated browser presence/movement evidence, a static map-object contract test, and the final manual map-object visual check that still needs human eyes.

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
npm run alpha:enjin-operator-smoke
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:operator-checklist
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

`npm run alpha:built-server-smoke` starts the built `dist/server/express.js` runtime on a disposable localhost port with throwaway server-token env, no Enjin live secrets, and no Supabase Edge forwarding. It verifies `/healthz`, `/play`, `/integration/game-manifest.json`, `/integration/alpha/status`, and the private Enjin operator route fail-closed path. This catches server bundle/runtime drift before any Fly deploy. The ignored `reports/built-server-smoke.json` report includes sanitized server stdout/stderr, exit code, exit signal, and stopped status even if the built server exits before readiness.

## Local Alpha Suite

`npm run alpha:local-suite` is the local no-cost release-candidate pass. It builds once, starts the built Express runtime on a disposable localhost port with a throwaway game-server token, uses an isolated `.local/alpha-suite/<run>/saves` directory, clears live Supabase Edge and Enjin env from child processes, and then runs endpoint smoke, local alpha acceptance, HTTP load smoke, browser presence, visual snapshot, and private Enjin operator smoke. It writes `reports/alpha-local-suite.json` with sanitized command/server output plus stopped status, and shuts the server down at the end.

The suite defaults to `10` simulated testers for the HTTP load-smoke portion to keep local runs quick. Set `MOCHI_SOCIAL_LOCAL_SUITE_LOAD_PLAYERS=25` for the full local release-candidate load count. It remains localhost-only; hosted preview suite runs require explicit hosted-smoke approval and should use the individual preview commands below instead.

Run `npm run alpha:local-evidence` after the local suite to validate the ignored localhost reports and write `reports/alpha-local-evidence.json` plus `reports/alpha-local-evidence.md`. These summaries are no-secret local artifacts; they do not prove hosted Fly, Vercel, Supabase, GitHub, or Enjin readiness.

Run `npm run alpha:operator-checklist`, then `npm run alpha:report-hygiene` after local evidence to scan the ignored local reports and generated no-secret operator checklist for accidental token, key, service-role, wallet, or passphrase patterns. It writes `reports/alpha-report-hygiene.json`.

## Private Enjin Operator Smoke

`npm run alpha:enjin-operator-smoke` verifies `POST /integration/alpha/enjin/submit` fails closed without the private game server token. When testing a local server that was started with a non-production `MOCHI_SOCIAL_GAME_SERVER_TOKEN`, set `MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN` to the same value to also verify the tokened no-Enjin-secrets path returns `enjin_canary_not_configured`.

The smoke refuses to submit or poll live Enjin by default when the runtime reports `enjinCanaryConfigured=true`. Only an operator should opt into live Canary smoke with `MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE=true`, `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID`, and `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID` after an approved Canary transaction exists. The script writes `reports/enjin-operator-smoke.json`.

## External Gate Audit

`npm run alpha:external-gates` checks live Alpha RC gates without printing secret values. It verifies GitHub PR status, Supabase preview secret names, Fly authentication/app/volume/secret names, live game contract, Mochirii site contract, and operator-confirmed Enjin readiness flags.

Before Alpha RC Ready, run it with the Fly game URL and Vercel preview origin:

```powershell
$env:MOCHI_SOCIAL_GAME_URL="https://<fly-preview-host>"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="<supabase-preview-ref>"
npm run alpha:external-gates
```

For live Enjin completion, the operator must also provide non-public server env/secrets and set local confirmation flags only after dashboard verification: `ENJIN_PLATFORM_TOKEN`, `ENJIN_COLLECTION_ID`, `ENJIN_FUEL_TANK_ID`, `MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED=true`, `MOCHI_SOCIAL_ENJIN_COLLECTION_READY=true`, and `MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY=true`.

`npm run alpha:operator-checklist` writes the current no-secret handoff to the local credentials folder. Treat it as a checklist only; it is not evidence that private provider gates are complete.

## Alpha RC Audit

`npm run alpha:rc-audit` reads the game repo, sibling Mochirii repo, latest external gate report, local Git branch sync for both repos, GitHub PR state, and no-secret operator checklists. It writes `reports/alpha-rc-audit.json` and exits non-zero until every explicit Alpha RC requirement has direct evidence. This audit is the final pre-tester stoplight; it should remain red while Fly billing, live preview URLs, Enjin Canary readiness, or game/site local-vs-remote branch drift are incomplete.

## Two-tab Presence Gate

`npm run alpha:browser-presence` opens two pages in one browser context and verifies both tabs render the game canvas, the alpha HUD, and a `Nearby: 2 testers` presence chip. It captures canvas screenshot signatures, sends movement keys in both tabs, verifies each canvas changes, and verifies the observer tab changes after first-tab movement. It also clicks the HUD care, chat, emote, fixed-list, direct-trade, and Canary certificate actions, then verifies the visible HUD and `mochiSocial.alphaState` update. It writes `reports/alpha-browser-presence.json`.

The browser smoke is local-only by default to avoid hosted preview usage. Set `MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true` only after explicit hosted-preview approval. It prefers installed Chrome. If Chrome is installed outside the default Playwright channel, set `MOCHI_SOCIAL_BROWSER_EXECUTABLE` to the browser executable path. Set `MOCHI_SOCIAL_BROWSER_HEADFUL=true` when you want to watch the check run.

## Visual Snapshot Gate

`npm run alpha:visual-snapshot` opens `/play`, waits for the HUD, presence label, and canvas, and writes ignored first-screen evidence to `reports/alpha-visual-snapshot.json`, `reports/alpha-visual-page.png`, and `reports/alpha-visual-canvas.png`. It is local-only by default; set `MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT=true` only after explicit hosted-preview approval.

Use the PNGs for local human/Codex visual review of the town composition. The snapshot proves the first screen is renderable and reviewable; browser presence and map-object contract tests still provide the movement, HUD action, event ID, prompt, save-source, habitat, and collision evidence.

The browser smoke proves HUD-level two-tab presence, canvas movement response, and a synchronized observer-side canvas change. The unit suite also includes `apps/game/tests/map-object-contract.test.ts`, which verifies stable RPGJS event IDs, event coordinates, prompt/save-source snippets, companion habitat labels, and collision-layer evidence for the first town. The remaining human visual check is for rendered prompt behavior and overall scene confidence before Alpha RC Ready:

1. Open two browser tabs or windows to `${MOCHI_SOCIAL_BASE_URL}/play`.
2. Confirm the game canvas, HUD, and town scene are visually coherent.
3. Interact with the NPC, chest, and habitat/care loop in at least one tab.
4. Confirm the prompts and notifications match the alpha no-real-value scope.
5. Record the date, browser, game URL, `reports/alpha-browser-presence.json` result, and manual map-object result in the PR or release checklist.

Keep the manual map-object check until a later RPGJS runtime-level automation can interact with NPC, chest, habitat, and dialog state directly inside the canvas.

## Alpha RC Stop Point

Alpha RC Ready means local acceptance, endpoint smoke, typecheck, lint, tests, build, approved load smoke, Mochirii preview checks, admin/terms/feedback checks, approved Enjin Canary smoke, rollback notes, tester guide, and source/asset ledgers are complete.

Do not use this checklist to promote production, Enjin mainnet, paid assets, cashout, open UGC, or public launch.
Do not use this checklist to add billing usage. Follow [`docs/no-cost-operations.md`](no-cost-operations.md) before any hosted, CI, provider, Fuel Tank, or live chain action.
