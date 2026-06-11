# Agent Guidance for Mochi Social

## Project Intent

Mochi Social is a standalone multiplayer browser RPG repo. Keep the game separate from the future Vercel/GitHub/Supabase website repo. The website may embed or link to this game through the documented integration contract, but website code, Supabase migrations, and website UI do not belong here.

## Commands

- Install: `npm install`
- Dev game: `npm run dev:game`
- Secret scan: `npm run secret-scan`
- Alpha readiness: `npm run alpha:readiness`
- Local alpha acceptance against a running server: `npm run alpha:local-acceptance`
- Local 10-25 tester HTTP load smoke against a running server: `npm run alpha:load-smoke`
- Local two-tab browser presence smoke against a running server: `npm run alpha:browser-presence`
- Local first-screen visual snapshot against a running server: `npm run alpha:visual-snapshot`
- Private Enjin operator route smoke against a running server: `npm run alpha:enjin-operator-smoke`
- Local built Express server smoke after `npm run build`: `npm run alpha:built-server-smoke`
- Local no-cost full Alpha suite: `npm run alpha:local-suite`
- Local no-secret evidence summary after the suite: `npm run alpha:local-evidence`
- Local report/checklist hygiene after evidence: `npm run alpha:report-hygiene`
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
- Keep external-account work no-cost by default. Do not create paid resources, scale services, buy credits, upgrade plans, enable paid add-ons, fund Fuel Tanks, submit live chain transactions, run hosted load tests, deploy/redeploy paid previews, or push branches that trigger CI unless the user explicitly approves that exact cost-bearing action after a cost note.
- Keep the creator surface curated for alpha. Do not add open user uploads, paid assets, cashout, minors support, public launch behavior, or production deploy automation without a later approved plan.
- Use PR-per-milestone delivery. Work from scoped branches, keep CI green, and record handoff notes when a milestone touches game/site/Supabase/Enjin boundaries.
- Supabase schema, privileged database writes, tester allowlist, terms acknowledgement, feedback, and admin UI belong in the separate Mochirii website repo. This repo owns the game runtime, contracts, Enjin orchestration, and game-side docs.
- The game backend may hold a scoped game bridge token in Fly secrets. It must not hold a Supabase service-role key, Enjin wallet seed, or wallet daemon passphrase.

## Done When Playable

- A fresh clone passes install, typecheck, lint, test, and build.
- `npm run dev:game` starts the browser game.
- Two browser tabs can connect and see player presence.
- The town has collision, one NPC dialog, one chest/item pickup, a minimal HUD, and save-backed player state.
- `/healthz`, `/play`, `/embed`, and `/integration/game-manifest.json` respond from the game runtime.
- The website integration contract remains documented and independent from any website repo.

## Alpha RC Goal

- The active alpha goal lives at `docs/goals/mochi-social-alpha-rc.md`.
- External account and deployment behavior lives at `docs/codex-external-ops.md`.
- Alpha RC stops at a closed preview release candidate: no production, no Enjin mainnet, no real-money value, and no open creator marketplace.
- Done for alpha means the scripted local/preview acceptance checks pass and external secret/account steps are documented for an operator.
- The local alpha acceptance and load-smoke commands verify public endpoints and no-real-value fallback ledger writes. `npm run alpha:browser-presence` verifies two same-browser tabs render the game canvas, HUD, `Nearby: 2 testers` presence chip, canvas movement signatures in both tabs, observer-side canvas change after first-tab movement, and the HUD care/chat/emote/market/trade/Canary quick-action loop. `npm run alpha:visual-snapshot` captures ignored first-screen page/canvas PNGs for local visual review. Both browser checks are local-only unless their hosted allow flags are set after explicit hosted-preview approval. `apps/game/tests/map-object-contract.test.ts` verifies first-town event IDs, coordinates, prompts, save sources, habitat labels, and collision evidence. `npm run alpha:enjin-operator-smoke` verifies the private Enjin operator route fails closed and does not submit live Enjin operations by default. `npm run alpha:built-server-smoke` starts the built Express runtime locally with throwaway env and catches server-bundle runtime issues before any deploy. `npm run alpha:local-suite` builds once, starts the built runtime on localhost with throwaway env, runs smoke/local acceptance/load/browser/visual/operator checks, strips live provider env from child processes, and writes `reports/alpha-local-suite.json`. `npm run alpha:local-evidence` reads the ignored localhost reports and writes no-secret `reports/alpha-local-evidence.json` / `.md` summaries. `npm run alpha:sync-approval` writes a no-secret local branch/provider approval packet before any CI-triggering push or hosted/provider action is requested. `npm run alpha:report-hygiene` scans those ignored reports plus the generated operator/sync checklists for accidental secret patterns. `npm run alpha:external-gates` audits GitHub, Fly, Supabase, live game/site contract, and operator-confirmed Enjin readiness without printing secret values. Manual NPC/chest/habitat inspection still completes the rendered map-object visual gate.
- `npm run alpha:operator-checklist` and `npm run alpha:sync-approval` may write no-secret handoff files under `C:\Users\xtyty\Desktop\Creds`; they must contain placeholders, status, commit subjects, and secret names only, never secret values.
- `npm run alpha:rc-audit` writes `reports/alpha-rc-audit.json` and fails until every game, site, provider, PR, and handoff gate proves Alpha RC Ready.
- For external operations, use official docs first, repo docs second, live dashboards/CLI for current state, and memory only for preferences/history.
- Use CLI for reproducible checks, Chrome for logged-in dashboards, Computer Use only when CLI/Chrome are insufficient, and dashboard-only flow for payment details, seed phrases, passphrases, MFA, and private account confirmations.
- Follow `docs/no-cost-operations.md` before using GitHub Actions, Fly, Vercel, Supabase, Enjin, Discord, or any dashboard/CLI surface that can affect billing.

## Implementation Notes

- Prefer small, focused changes that preserve the monorepo layout.
- Use RPGJS v5 package APIs and documented MMORPG entry structure.
- If changing public integration messages, update tests and `docs/site-integration.md`.
- If changing deployment behavior, update `docs/deployment.md` and `fly.toml` together.
