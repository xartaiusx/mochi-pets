# Alpha Acceptance

This file is the repeatable local acceptance gate for Mochi Social Alpha RC. It covers the public game routes, integration contract, local no-real-value economy writes, and the manual multiplayer visual check that still needs human eyes.

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

The script writes `reports/alpha-local-acceptance.json` as a local, ignored evidence artifact.

## Load Smoke

`npm run alpha:load-smoke` simulates 10-25 testers against the HTTP alpha contract. It opens `/play` concurrently, records chat and emote actions through `/integration/alpha/action`, and verifies the no-real-value fallback ledger entries.

This is a release-candidate smoke, not a capacity benchmark. Use `MOCHI_SOCIAL_LOAD_PLAYERS=10` through `25`; the default is `25`. The script writes `reports/alpha-load-smoke.json`.

## Two-tab Presence Gate

`npm run alpha:browser-presence` opens two pages in one browser context and verifies both tabs render the game canvas, the alpha HUD, and a `Nearby: 2 testers` presence chip. It prefers installed Chrome. If Chrome is installed outside the default Playwright channel, set `MOCHI_SOCIAL_BROWSER_EXECUTABLE` to the browser executable path. Set `MOCHI_SOCIAL_BROWSER_HEADFUL=true` when you want to watch the check run.

The browser smoke proves the HUD-level two-tab presence contract, but canvas-level RPGJS sprite movement still needs human eyes before Alpha RC Ready:

1. Open two browser tabs or windows to `${MOCHI_SOCIAL_BASE_URL}/play`.
2. Confirm both tabs show the game canvas, HUD, and a `Nearby: 2 testers` presence chip.
3. Move both players after the scene loads.
4. Verify each tab shows the other player sprite in the same town.
5. Interact with the NPC, chest, and habitat/care loop in at least one tab.
6. Record the date, browser, game URL, and result in the PR or release checklist.

Keep the manual movement check until a later canvas-aware automation can assert both player sprites moving in the same RPGJS scene.

## Alpha RC Stop Point

Alpha RC Ready means local acceptance, endpoint smoke, typecheck, lint, tests, build, load smoke, Mochirii preview checks, admin/terms/feedback checks, Enjin Canary smoke, rollback notes, tester guide, and source/asset ledgers are complete.

Do not use this checklist to promote production, Enjin mainnet, paid assets, cashout, open UGC, or public launch.
