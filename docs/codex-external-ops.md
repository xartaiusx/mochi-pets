# Codex External Ops Runbook

This runbook tells Codex how to operate Mochi Social Alpha RC across local code, Chrome dashboards, CLI tools, and external services without guessing.

## Source Basis

- Codex manual: `AGENTS.md`, skills, MCP, Chrome, Computer Use, and hooks.
- GitHub Docs: Actions billing, budgets, branch protection, required checks, and PR checks.
- Vercel Docs: Preview environment variables and WebSocket guidance.
- Supabase Docs: Edge Function secrets and `getUser(jwt)` token validation.
- Fly.io Docs: app secrets, services, and persistent volumes.
- Enjin Docs: Platform GraphQL, Canary, Wallet Daemon, managed wallets, Fuel Tanks, transaction states, and marketplace operations.
- Discord Docs: OAuth2, `state`, scopes, bot tokens, and permissions.
- MDN: browser WebSocket behavior.
- OWASP: secrets management, least privilege, rotation, and incident response.

## Source Hierarchy

Use sources in this order:

1. Official platform docs for current product behavior.
2. Repo docs and checked-in contracts for project decisions.
3. Live dashboards and CLI status for current deployment state.
4. Prior memory only for user preferences and historical context, never as current external truth.

When source behavior conflicts with repo intent, stop and record the conflict before changing code, secrets, branch protection, deployment, or chain state.

## Tool Choice

- Use CLI for reproducible verification: `gh`, `npm`, `supabase`, `fly`, build checks, smoke checks, and PR checks.
- Use Chrome for logged-in dashboards: GitHub billing, Vercel project env, Supabase project/branch UI, Fly dashboard, Enjin Platform, cloud Wallet Daemon setup, and Discord Developer Portal.
- Use Computer Use only when CLI and Chrome automation cannot reach a required desktop or dashboard interaction.
- Use the in-app browser for local or public preview testing that does not require the user's signed-in Chrome profile.
- Use dashboard-only flow for payment details, recovery phrases, seed/passphrase creation, and any provider step that requires MFA or private account confirmation.

## Secret Entry Protocol

- The user types payment details, API tokens, seed phrases, passphrases, and one-time codes privately.
- Codex may verify only secret names, digests, creation timestamps, deployment status, health checks, or successful API responses.
- Repo scripts may write no-secret operator checklists into `C:\Users\xtyty\Desktop\Creds`; those files must contain placeholders, secret names, statuses, and commands only.
- Never print, summarize, screenshot, commit, or paste secret values.
- Never store secrets in `.env`, docs, PR comments, local ledger output, screenshots, or chat.
- Rotate `MOCHI_SOCIAL_GAME_SERVER_TOKEN`, Enjin Platform token, and Wallet Daemon credentials if a secret value is exposed.

## Preview Environment Matrix

| Surface | Owner | Value |
| --- | --- | --- |
| Game branch | `xartaiusx/mochi-social` | `codex/mochi-social-alpha-rc` |
| Site branch | `Mochirii-Wushu/Mochirii` | `codex/mochi-social-alpha-rc` |
| Game host | Fly | `mochi-social-game`, region `sea` |
| Game saves | Fly volume | `mochi_social_data` mounted at `/data` |
| Site host | Vercel Preview | `/games/mochi-social` |
| Supabase authority | Mochirii Supabase preview branch | migrations, Edge Functions, RLS, allowlist, terms, feedback, ledger |
| Chain | Enjin Canary | `Mochi Social Alpha` collection and Canary Fuel Tank |
| Signer | Cloud Wallet Daemon | outbound-only, no inbound ports |

Use `npm run alpha:operator-checklist` to refresh the local no-secret checklist for this matrix and the current external gate report.

Game/Fly env ownership:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_AUTH_REQUIRED=true`
- `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`
- `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
- `ENJIN_PLATFORM_URL=https://platform.canary.enjin.io/graphql`
- `ENJIN_PLATFORM_TOKEN`
- `ENJIN_NETWORK=CANARY`
- `ENJIN_COLLECTION_ID`
- `ENJIN_FUEL_TANK_ID`
- `RPG_ALLOWED_ORIGINS`

Website/Vercel Preview env ownership:

- `NEXT_PUBLIC_MOCHI_SOCIAL_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Supabase Edge Function secret ownership:

- `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
- `MOCHI_SOCIAL_ALPHA_TERMS_VERSION`

## CI Gate Checklist

1. Resolve GitHub Actions billing, payment, and budget blocks before deployment work.
2. Rerun the latest failed game PR workflow.
3. Require green `Verify Mochi Social` before merge.
4. Keep check names unique before enabling required status checks.
5. Enable branch protection only after the first successful check run exists.
6. Do not merge while the job has zero steps, no log, or a billing/runner failure.

## Supabase Authority Matrix

| Action | Authority |
| --- | --- |
| Supabase session refresh | Mochirii website |
| Parent-to-game auth bridge | short-lived access token only |
| Token validation | game server with Supabase `getUser(jwt)` |
| Privileged game writes | Mochirii Edge Functions |
| Scoped server trust | `MOCHI_SOCIAL_GAME_SERVER_TOKEN` |
| Allowlist and terms | Mochirii Supabase |
| Pets, inventory, market, trades, chat, reports, feedback, ledger | Mochirii Supabase |
| Service-role key | Supabase Edge runtime only, never game/client |

## Enjin Canary State Machine

Allowed states:

- `PENDING`
- `BROADCAST`
- `FINALIZED`
- `FAILED`
- `ABANDONED`
- `TIMEOUT`

Rules:

- All chain operations must stay `network=CANARY`.
- Every operation needs a stable request ID before Enjin submission.
- Store Enjin transaction UUID and optional listing ID as soon as Platform returns them.
- Record finality evidence before inventory movement.
- Never credit hot inventory before `FINALIZED`.
- Failed, abandoned, timed-out, pending, and broadcast operations remain audit-only.
- Wallet Daemon must be cloud hosted, outbound-only, and separate from Fly game runtime.

## Fuel Tank Dispatch Contract

Every sponsored Enjin transaction must record:

- chain network `CANARY`
- managed wallet external ID
- collection ID
- token ID or asset ID
- Fuel Tank ID/address
- request ID
- transaction UUID
- transaction state
- final ledger event

If Fuel Tank sponsorship fails, keep the Supabase operation pending or failed; do not debit or credit player inventory unless the matching finalized chain operation proves it.

## WebSocket And Presence Verification

HTTP smoke and 10-25 tester load smoke prove routes and alpha action contracts only. They do not prove live RPGJS WebSocket presence.

Before Alpha RC Ready:

1. Open two tabs to `/play`.
2. Move both players after scene load.
3. Confirm each tab shows the other player.
4. Record browser, URL, date, and result in the PR or release checklist.

Only replace this gate after adding a real browser/WebSocket automation dependency and a committed visual/presence test.

## Discord Boundary

- Discord OAuth, roles, bot tokens, and moderation dashboards belong to the Mochirii website/admin side.
- Use OAuth `state` in any Discord auth flow.
- Keep bot tokens and OAuth client secrets out of browser, game, docs, and PR comments.
- No alpha DMs, open user uploads, creator marketplace, or Discord-driven item grants without a later approved plan.
