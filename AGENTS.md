# Agent Guidance for Mochi Social

## Project Intent

Mochi Social is a standalone multiplayer browser RPG repo. Keep the game separate from the future Vercel/GitHub/Supabase website repo. The website may embed or link to this game through the documented integration contract, but website code, Supabase migrations, and website UI do not belong here.

## Commands

- Install: `npm install`
- Dev game: `npm run dev:game`
- Clean-room literal and asset ledger scan: `npm run clean-room-scan`
- Secret scan: `npm run secret-scan`
- Alpha readiness: `npm run alpha:readiness`
- Local alpha acceptance against a running server: `npm run alpha:local-acceptance`
- Local 10-25 tester HTTP load smoke against a running server: `npm run alpha:load-smoke`
- Local two-tab browser presence smoke against a running server: `npm run alpha:browser-presence`
- Local first-screen visual snapshot against a running server: `npm run alpha:visual-snapshot`
- Local visual review bundle after browser/visual reports exist: `npm run alpha:visual-review`
- Local manual prompt review gate: `npm run alpha:manual-prompt-review`
- Local Wallet Daemon binary metadata check: `npm run alpha:wallet-daemon-check`
- Private Enjin operator route smoke against a running server: `npm run alpha:enjin-operator-smoke`
- Local built Express server smoke after `npm run build`: `npm run alpha:built-server-smoke`
- Local no-cost full Alpha suite: `npm run alpha:local-suite`
- Local no-secret evidence summary after the suite: `npm run alpha:local-evidence`
- Local report/checklist hygiene after evidence: `npm run alpha:report-hygiene`
- Alpha Preview Ready tester-entry audit: `npm run alpha:preview-ready`
- External Alpha RC gate audit: `npm run alpha:external-gates`
- Write no-secret local operator checklist: `npm run alpha:operator-checklist`
- Write no-secret sync approval packet: `npm run alpha:sync-approval`
- Requirement-by-requirement Alpha RC audit: `npm run alpha:rc-audit`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`
- Endpoint smoke against a running server: `npm run smoke`

## Guardrails

- Use Node 22.
- Keep `origin` as the user-owned GitHub repo and `upstream` as the fetch-only RPGJS reference.
- Never push to `upstream`.
- Keep secrets out of Git. Do not commit `.env`, runtime saves, Fly secrets, Supabase service-role keys, or generated local state.
- Use only original, project-authored, MIT-compatible, or clearly CC0 assets. Update `docs/asset-ledger.md` for every asset.
- Keep Supabase service-role keys out of client and game code. The optional bridge only accepts short-lived user access tokens from the parent website.
- Keep the alpha no-real-value by default: Enjin work targets Canary only, mainnet is out of scope, and all player-facing economy labels must say test/alpha when relevant.
- Optimize the next live-site pass for Alpha Preview Ready before Alpha RC Ready. Preview Ready means the Fly game is embedded by the Mochirii Vercel Preview with Supabase allowlist/terms/feedback working, while Enjin remains visible as `configured-preview-stub`.
- Do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID` to clear a gate. Leave funded-chain gates red until real cENJ, collection, Fuel Tank, Wallet Daemon signing, and finality proof are approved and verified.
- Keep external-account work no-cost by default. Public-repo commits and pushes are allowed without a separate approval prompt; verify PR/CI results afterward. Do not create paid resources, scale services, buy credits, upgrade plans, enable paid add-ons, fund Fuel Tanks, submit live chain transactions, run hosted load tests, deploy/redeploy paid previews, set provider secrets/env vars, or mutate external provider resources unless the user explicitly approves that exact cost-bearing action after a cost note.
- Do not set, change, remove, or rotate provider secrets or environment variables in Fly, Vercel, Supabase, GitHub, Discord, or Enjin unless the user explicitly approves that exact action after a cost/usage note.
- Do not set `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` unless the user explicitly approves the hosted Fly/Vercel external verification run that may add usage.
- Keep the creator surface curated for alpha. Do not add open user uploads, paid assets, cashout, minors support, public launch behavior, or production deploy automation without a later approved plan.
- Use PR-per-milestone delivery. Work from scoped branches, keep CI green, and record handoff notes when a milestone touches game/site/Supabase/Enjin boundaries.
- Supabase schema, privileged database writes, tester allowlist, terms acknowledgement, feedback, and admin UI belong in the separate Mochirii website repo. This repo owns the game runtime, contracts, Enjin orchestration, and game-side docs.
- The game backend may hold a scoped game bridge token in Fly secrets. It must not hold a Supabase service-role key, Enjin wallet seed, or wallet daemon passphrase.

## Visual Polish Lane

- Treat visual polish as Alpha Preview Ready work, not production launch. The target is Mochirii High-Fidelity Wuxia, tester-password first, playable-town first, local verification first.
- Preserve the public game routes, postMessage bridge, test hooks, and no-real-value labels while improving art, layout, contrast, and first-screen clarity.
- Keep the first visible game screen playable. Do not add a landing page, onboarding wall, marketing hero, or production/live-value language inside the game runtime.
- Use original/project-authored, generated-for-project, MIT-compatible, or clearly CC0 visuals only. Update `docs/asset-ledger.md` whenever art changes.
- Follow `docs/game-art-bible.md` and `docs/asset-pipeline-contract.md` for game art work. The active art target is Mochirii High-Fidelity Wuxia: smooth illustrated 2D, soft lantern lighting, painterly jade/lacquer/gold/silk/paper materials, and no third-party visual reference dependency.
- Keep source prompts and source-art notes separate from runtime assets. Source masters and source cards live under `assets/source/game/hd/`; runtime files stay in RPGJS paths unless tests/docs change in the same scoped task.
- Keep 64px logical tiles, 384x768 event spritesheets, 128x192 frames, Tiled layer names, collision behavior, and alpha event placements stable during visual passes.
- Keep canonical runtime sprite IDs as `wayfarer`, `sifu-narao`, `spirit-lirabao`, `spirit-jintari`, `spirit-aozhen`, `chest`, `habitat-grove`, `journal-pavilion`, `expedition-gate`, `route-invitation-altar`, `technique-dojo`, `tactic-scroll-stand`, `affinity-dais`, `party-banner`, `training-ring`, `quest-board`, `guild-rank-bell`, `growth-moonwell`, `market-board`, `trade-post`, and `canary-shrine`.
- Use `npm run clean-room-scan` with a private denylist at `.local/clean-room-denylist.txt` or `MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST` whenever restricted-source literal checking is needed. Do not commit the private denylist.
- Maintain readable UI over game art with semi-opaque backing, strong focus states, keyboard-usable controls, and non-color-only status labels for auth, market, trade, chain, and error states.
- Enjin UI must stay visibly Canary and `configured-preview-stub` until funded-chain gates are approved. Canary copy must say preview stub, request staged, no real value, and must not imply settlement before `FINALIZED`.
- Website tester-gate polish belongs in the Mochirii repo. Game town, HUD, runtime manifest, and asset ledger polish belong here.
- For follow-up visual work, use this prompt: `Upgrade Mochi Social art as Mochirii High-Fidelity Wuxia 2D assets for Alpha Preview Ready only. Use source-master plus Sharp runtime-export thinking, prioritize Jade Lantern Court readability first, preserve RPGJS paths, Tiled contracts, tests, no-real-value labels, and local verification, update the asset ledger, keep Enjin Canary as configured-preview-stub/no-real-value, and do not mutate providers, deploy, fund Enjin, or clear funded-chain gates. Public-repo commits and pushes are allowed; verify PR checks afterward.`

## Done When Playable

- A fresh clone passes install, typecheck, lint, test, and build.
- `npm run dev:game` starts the browser game.
- Two browser tabs can connect and see player presence.
- The town has collision, one NPC dialog, one chest/item pickup, spirit invitation/capture, 3/3 journal records, Moonbridge/Cloudbell field route scouting, route spirit invitations for Jintari and Aozhen, Jade Cloudbell route mastery proof, technique mastery, battle tactic scroll planning, guild rank trial proof, spirit growth rite proof, affinity trial practice, party formation, Triune Jade Harmony proof, Jade Echo Concord social battle proof, Jade Mirror Team Match proof, no-injury spar ladder practice, spirit training, quest-chain board progress, a minimal HUD, and save-backed player state.
- `/healthz`, `/play`, `/embed`, and `/integration/game-manifest.json` respond from the game runtime.
- The website integration contract remains documented and independent from any website repo.

## Alpha RC Goal

- The active alpha goal lives at `docs/goals/mochi-social-alpha-rc.md`.
- The live-site preview stop point lives at `docs/alpha-preview-ready.md`.
- External account and deployment behavior lives at `docs/codex-external-ops.md`.
- Alpha Preview Ready is a separate stop point before Alpha RC Ready. Treat `preview-live-gates` as the tester-entry lane and `funded-chain-gates` as expected red until cENJ/Fuel Tank approval.
- Alpha RC stops at a closed preview release candidate: no production, no Enjin mainnet, no real-money value, and no open creator marketplace.
- Done for alpha means the scripted local/preview acceptance checks pass and external secret/account steps are documented for an operator.
- The local alpha acceptance and load-smoke commands verify public endpoints and no-real-value fallback ledger writes. `npm run alpha:browser-presence` verifies two same-browser tabs render the game canvas, HUD, `Nearby: 2 testers` presence chip, canvas movement signatures in both tabs, observer-side canvas change after first-tab movement, and the HUD spirit invite/attune/journal/scout/route-invite/circuit/dojo/tactic/rank/bloom/affinity-trial/party/harmony/concord/match/care/train/spar/raise/quest/chat/emote/market/trade/Canary quick-action loop, including Lirabao/Jintari/Aozhen roster proof, 3/3 journal proof, Moonbridge/Cloudbell route proof, Jade Cloudbell route mastery proof, Triune Jade Harmony proof, Jade Echo Concord proof, Jade Mirror Team Match proof, and first quest-chain completion. `npm run alpha:visual-snapshot` captures ignored first-screen page/canvas PNGs for local visual review. `npm run alpha:visual-review` ties screenshot hashes, browser presence, HUD action proof, habitat-grove/journal-pavilion/expedition-gate/route-invitation-altar/technique-dojo/tactic-scroll-stand/affinity-dais/party-banner/training-ring/quest-board/guild-rank-bell/growth-moonwell map-object IDs, and Jade Lantern Court habitat coverage to current HEAD while keeping rendered NPC/guild-seal-chest/habitat prompt interaction as a manual gate. `npm run alpha:manual-prompt-review` records the explicit operator/human confirmation for rendered NPC, guild seal chest, and habitat/care prompts; it remains pending until those prompt env flags are set after local review. Both browser checks are local-only unless their hosted allow flags are set after explicit hosted-preview approval. `apps/game/tests/map-object-contract.test.ts` verifies first-town event IDs, coordinates, prompts, save sources, habitat labels, and collision evidence. `npm run alpha:wallet-daemon-check` verifies only local Wallet Daemon binary metadata/hash/help output and never imports wallets, prints seeds, starts signers, contacts Enjin, funds Fuel Tanks, or submits transactions. `npm run alpha:enjin-operator-smoke` verifies the private Enjin operator route fails closed and does not submit live Enjin operations by default. `npm run alpha:built-server-smoke` starts the built Express runtime locally with throwaway env and catches server-bundle runtime issues before any deploy. `npm run alpha:local-suite` builds once, starts the built runtime on localhost with throwaway env, runs wallet-daemon metadata, smoke/local acceptance/load/browser/visual/operator checks, strips live provider env from child processes, and writes `reports/alpha-local-suite.json`. `npm run alpha:local-evidence` reads the ignored localhost reports and writes no-secret `reports/alpha-local-evidence.json` / `.md` summaries. `npm run alpha:sync-approval` writes a no-secret local branch/provider approval packet before cost-bearing hosted/provider actions; public-repo pushes are allowed and should be followed by PR check verification. `npm run alpha:report-hygiene` scans those ignored reports plus the generated operator/sync checklists for accidental secret patterns. `npm run alpha:external-gates` audits GitHub, Fly, Supabase, live game/site contract, and operator-confirmed Enjin readiness without printing secret values.
- `npm run alpha:operator-checklist` and `npm run alpha:sync-approval` may write no-secret handoff files under `C:\Users\xtyty\Desktop\Creds` plus ignored JSON reports under `reports/`; they must contain placeholders, status, commit subjects, branch freshness, and secret names only, never secret values.
- `npm run alpha:preview-ready` is the tester-entry audit. It requires current local evidence, manual prompt review, handoff packets, synced game/site branches, and green `preview-live-gates`; it records funded-chain gates as later Alpha RC work instead of treating them as Preview Ready blockers.
- `npm run alpha:sync-approval` should be generated after the current external-gates report and a current `npm run alpha:rc-audit` stamp, so its approval text points at fresh blockers.
- `npm run alpha:rc-audit` must reject stale external gates, local evidence, operator checklist, sync approval, and report hygiene JSON when they do not match the current local HEAD, upstream, dirty state, or referenced external-gate snapshot.
- `npm run alpha:rc-audit` must also reject missing or pending `reports/alpha-manual-prompt-review.json` until the rendered NPC/guild-seal-chest/habitat prompt review is explicitly completed.
- `npm run alpha:rc-audit` writes `reports/alpha-rc-audit.json` and fails until every game, site, provider, PR, and handoff gate proves Alpha RC Ready.
- For external operations, use official docs first, repo docs second, live dashboards/CLI for current state, and memory only for preferences/history.
- Use CLI for reproducible checks, Chrome for logged-in dashboards, Computer Use only when CLI/Chrome are insufficient, and dashboard-only flow for payment details, seed phrases, passphrases, MFA, and private account confirmations.
- Follow `docs/no-cost-operations.md` before using GitHub Actions, Fly, Vercel, Supabase, Enjin, Discord, or any dashboard/CLI surface that can affect billing.

## Implementation Notes

- Prefer small, focused changes that preserve the monorepo layout.
- Use RPGJS v5 package APIs and documented MMORPG entry structure.
- If changing public integration messages, update tests and `docs/site-integration.md`.
- If changing deployment behavior, update `docs/deployment.md` and `fly.toml` together.
