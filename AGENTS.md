# Agent Guidance for Mochi Social

## Project Intent

Mochi Social is a standalone multiplayer browser RPG repo. Keep the game separate from the future Vercel/GitHub/Supabase website repo. The website may embed or link to this game through the documented integration contract, but website code, Supabase migrations, and website UI do not belong here.

## Commands

- Install: `npm install`
- Dev game: `npm run dev:game`
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

## Done When Playable

- A fresh clone passes install, typecheck, lint, test, and build.
- `npm run dev:game` starts the browser game.
- Two browser tabs can connect and see player presence.
- The town has collision, one NPC dialog, one chest/item pickup, a minimal HUD, and save-backed player state.
- `/healthz`, `/play`, `/embed`, and `/integration/game-manifest.json` respond from the game runtime.
- The website integration contract remains documented and independent from any website repo.

## Implementation Notes

- Prefer small, focused changes that preserve the monorepo layout.
- Use RPGJS v5 package APIs and documented MMORPG entry structure.
- If changing public integration messages, update tests and `docs/site-integration.md`.
- If changing deployment behavior, update `docs/deployment.md` and `fly.toml` together.
