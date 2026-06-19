# Monero Treasury To Enjin Funding Goal

Use this short goal when resuming work:

```text
/goal Execute docs/goals/monero-treasury-to-enjin-funding.md. Prepare the external Monero mining treasury lane for Mochi Social without starting mining: keep mining operator-only, keep wallet material and binaries outside Git, verify official download/signature procedures, document no-secret evidence, preserve Enjin Canary as no-real-value configured-preview-stub, and define Supabase/Fuel Tank capped withdrawal controls for a later funded phase. Stop when the repo guardrails and operator handoff are ready; do not mine, fund, convert, deploy, or mutate providers.
```

## Starting Point

The game repo owns this goal's runtime-adjacent contracts and docs. Mochirii owns website/Supabase/admin budget authority in its separate repo. Local operator files live outside Git under:

```text
C:\Users\xtyty\Documents\Mochi Social Ops\monero
C:\Users\xtyty\Documents\Mochi Social Ops\p2pool
C:\Users\xtyty\Documents\Mochi Social Ops\xmrig
C:\Users\xtyty\Documents\Mochi Social Ops\wallets
C:\Users\xtyty\Documents\Mochi Social Ops\reports
```

## Source Basis

- Monero downloads and verification: https://www.getmonero.org/downloads/ and https://www.getmonero.org/resources/user-guides/verification-windows-beginner.html
- Monero CLI wallet: https://docs.getmonero.org/interacting/monero-wallet-cli-reference/
- Monero mining and P2Pool/XMRig: https://www.getmonero.org/get-started/mining/ and https://docs.getmonero.org/interacting/mining/guides/p2pool/xmrig-p2pool/
- XMRig config and hashes: https://xmrig.com/docs/miner/config and https://xmrig.com/download
- Enjin Fuel Tanks and Wallet Daemon: https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks and https://docs.enjin.io/getting-started/using-wallet-daemon
- Supabase, Vercel, Fly, and GitHub cost controls: https://supabase.com/docs/guides/platform/cost-control, https://vercel.com/docs/spend-management, https://fly.io/docs/about/cost-management/, and https://docs.github.com/en/billing/how-tos/set-up-budgets
- Discord OAuth boundary: https://docs.discord.com/developers/topics/oauth2
- CISA cryptojacking and IRS digital assets: https://www.cisa.gov/news-events/news/defending-against-illicit-cryptocurrency-mining-activity and https://www.irs.gov/filing/digital-assets

## Hard Stop Rules

- Do not start `monerod`, P2Pool, XMRig, wallet RPC, Wallet Daemon signing, Enjin GraphQL mutations, exchange flows, or any long-running miner process without explicit action-time approval.
- Do not add browser mining, hidden startup, persistence, provider-hosted mining, GitHub Actions mining, visitor/device mining, or mining code to the game or website.
- Do not commit mining binaries, Monero wallet files, blockchain data, wallet reports, wallet seeds, private spend keys, private view keys, wallet passwords, exchange credentials, transfer receipts, tax/accounting records, Enjin `wallet.seed`, `KEY_PASS`, `PLATFORM_KEY`, Supabase service-role keys, or provider secrets.
- Do not try to convert XMR into cENJ. Enjin Canary alpha remains cENJ/Fuel Tank based and no-real-value.
- Do not clear funded-chain gates with dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`.
- Do not use the Monero wallet as a cap for Vercel, Supabase, Fly, GitHub, Discord, or Enjin bills; provider budgets stay in provider controls.

## Parallel-Agent Safety

A second agent may be working on Mochi Social game development in parallel. This goal must stay out of that agent's gameplay/art/runtime lane unless the user explicitly merges scopes.

- Treat `docs/monero-treasury.md`, this goal file, `scripts/check-monero-treasury-guardrails.mjs`, `scripts/check-secrets.mjs`, and package script wiring as the normal scope.
- Avoid gameplay/map/HUD/asset files unless the user explicitly merges scopes. More specifically: avoid editing gameplay files, RPGJS map files, HUD/browser bridge files, alpha content files, generated assets, visual docs, or tests unrelated to Monero treasury guardrails.
- Before editing any file that may also be touched by the game-dev agent, run `git status --short` and inspect the file diff. If unrelated changes are present, work around them or stage only exact hunks.
- Do not run `npm run prepare-assets`, visual generators, map exporters, or formatting commands that could rewrite game assets during this goal.
- Do not run destructive Git commands, broad cleanup, or `git add -A` in a mixed worktree.
- If the second agent has unpushed local changes in the same file, preserve them and add a narrow patch. Stop only if the file-level conflict makes the goal impossible without user direction.
- Keep commits scoped: one Monero treasury doc/check commit is better than bundling gameplay changes.

## Implementation Order

1. Confirm workspace state with `git status --short --branch`.
2. Keep or create `docs/monero-treasury.md` with the external treasury lane, wallet rules, verification flow, Canary separation, future ENJ conversion lane, and withdrawal cap formula.
3. Keep or create `scripts/check-monero-treasury-guardrails.mjs` to block tracked mining binaries, wallet files, node data, and secret-shaped Monero/exchange material.
4. Keep `scripts/check-secrets.mjs` hardened for Monero wallet material, miner archives/binaries, exchange credentials, Enjin secrets, and Supabase service-role keys.
5. Ensure `package.json` exposes `npm run alpha:monero-treasury`.
6. Ensure `package.json` exposes `npm run alpha:monero-operator-handoff`.
7. Create or verify local-only operator folders outside Git. Do not download, extract, or run miner binaries unless a later action-time approval explicitly asks for it.
8. Run `npm run alpha:monero-operator-handoff` to write no-secret local handoff files under `C:\Users\xtyty\Documents\Mochi Social Ops\reports`.
9. Run local checks:
   - `npm run alpha:monero-treasury`
   - `npm run alpha:monero-operator-handoff`
   - `npm run secret-scan`
   - `npm run alpha:readiness`
   - `npm run clean-room-scan`
   - `git diff --check`
10. Commit and push public-repo changes. Public pushes are allowed; provider mutations and cost-bearing actions are not.

## Future Operator Lane

These steps are intentionally outside this goal unless separately approved:

1. Download Monero CLI, P2Pool, and XMRig from official sources.
2. Verify Monero hashes/GPG signatures and XMRig SHA256 before extraction.
3. Run `monero-wallet-cli` interactively and create `mochi-social-mining`; the user records seed/password offline.
4. Start `monerod`, wait for sync, start P2Pool Mini, then start XMRig with conservative CPU settings.
5. Record no-secret evidence only: versions, checksum status, sync status, P2Pool connection, accepted-share status, timestamp, and reviewer.
6. Later, manually convert XMR to ENJ through a compliant exchange/wallet flow after separate approval.

## Withdrawal Cap Design

Mochirii Supabase owns budget/reservation/finality controls. Mochi Social asks the authorized Supabase Edge authority before Enjin submission.

```text
availableBudget = min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations
```

Reject if budget cannot be verified. Use idempotency keys. Credit inventory only after Enjin state is `FINALIZED`. `FAILED`, `ABANDONED`, `TIMEOUT`, and low-budget states must never release assets or credit inventory. Keep an admin kill switch for all withdrawals.

## Done When

- `docs/monero-treasury.md` and this goal file explain the external treasury lane and no-real-value Enjin separation.
- Guardrail scripts reject tracked wallet files, mining binaries, node data, Monero private keys, wallet passwords, exchange credentials, and tax/accounting material.
- `npm run alpha:monero-treasury`, `npm run alpha:monero-operator-handoff`, `npm run secret-scan`, `npm run alpha:readiness`, `npm run clean-room-scan`, and `git diff --check` pass locally.
- Local operator folders exist outside Git.
- No-secret operator handoff files exist at `C:\Users\xtyty\Documents\Mochi Social Ops\reports\monero-operator-handoff.json` and `.md`.
- No miner, wallet, exchange, provider, Enjin, Fly, Vercel, Supabase, Discord, hosted check, or chain action was started.
