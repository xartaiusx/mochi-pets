# Mochi Pets Account-Linked Progression

Mochi Pets keeps guest play local and makes signed-in Mochirii play account-linked through Supabase-owned Edge Functions in the separate Mochirii repo.

## Source Basis

- RPGJS save/runtime model: https://docs.rpgjs.dev/guide/save
- Supabase token validation with `getUser(jwt)`: https://supabase.com/docs/reference/javascript/auth-getuser
- Supabase Edge Functions and secrets: https://supabase.com/docs/guides/functions
- Fly Volumes for local persistent fallback saves: https://fly.io/docs/volumes/overview/
- Vercel WebSocket guidance for keeping the multiplayer runtime off Vercel Functions: https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections

## Runtime Contract

- The parent website sends only `MOCHI_PETS_AUTH` with a short-lived Supabase access token or `MOCHI_PETS_SIGN_OUT`.
- The game backend validates the access token with Supabase `getUser(jwt)` before deriving a linked `playerId`.
- `GET /integration/alpha/progress` loads an account snapshot from Mochirii Edge only after token validation.
- `POST /integration/alpha/action` forwards signed-in actions to Mochirii Edge with the scoped `MOCHI_PETS_GAME_SERVER_TOKEN`.
- Guest and tester-password preview play remains local: RPGJS file saves plus browser HUD state. It must not claim account persistence.
- When signed-in sync fails, the HUD must show sync-unavailable copy instead of implying the action saved to the account.

Legacy `MOCHI_SOCIAL_*` names may be accepted by local scripts as temporary aliases for one transition window, but current website/game work must use `MOCHI_PETS_*`.

## Parallel-Agent Guardrail

Before editing, run `git status --short --branch` in both repos. Preserve unrelated dirty work, stage exact files or hunks only, and never use `git add -A` while another maintainer may be editing gameplay, HUD, map, asset, Reaper, or ModMail files.

## No-Cost Boundary

This contract is local code and docs only. Do not deploy, mutate Fly/Vercel/Supabase/Discord/Enjin settings, set secrets, run hosted checks, fund Enjin, or clear funded-chain gates without fresh action-specific approval.
