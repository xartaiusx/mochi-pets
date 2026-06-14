# Monero Treasury To Enjin Funding Lane

This runbook keeps Monero mining separate from Mochi Social runtime code. Monero can mine XMR, but it cannot directly fund Enjin Canary cENJ. For alpha, Enjin Canary testing still uses cENJ/Fuel Tank tooling. Any mined XMR is an external operator treasury that may later be manually converted to ENJ for mainnet work only after a separate approval.

## Source Basis

- Monero downloads: https://www.getmonero.org/downloads/
- Monero binary verification on Windows: https://www.getmonero.org/resources/user-guides/verification-windows-beginner.html
- Monero CLI wallet reference: https://docs.getmonero.org/interacting/monero-wallet-cli-reference/
- Monero mining overview: https://www.getmonero.org/get-started/mining/
- P2Pool and XMRig guide: https://docs.getmonero.org/interacting/mining/guides/p2pool/xmrig-p2pool/
- XMRig configuration: https://xmrig.com/docs/miner/config
- Enjin Fuel Tanks: https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks
- Enjin Wallet Daemon: https://docs.enjin.io/getting-started/using-wallet-daemon
- Supabase cost control: https://supabase.com/docs/guides/platform/cost-control
- Vercel spend management: https://vercel.com/docs/spend-management
- Fly cost management: https://fly.io/docs/about/cost-management/
- GitHub budgets: https://docs.github.com/en/billing/how-tos/set-up-budgets
- CISA cryptojacking guidance: https://www.cisa.gov/news-events/news/defending-against-illicit-cryptocurrency-mining-activity
- IRS digital assets: https://www.irs.gov/filing/digital-assets

## Scope

Monero mining is an operator system, not a website feature, game feature, CI feature, or player feature. No browser mining, hidden startup, persistence, provider-hosted mining, GitHub Actions mining, visitor/device mining, or mining code belongs in Mochi Social.

Starting a miner is cost-bearing because it uses electricity and hardware. Codex may prepare docs, checks, local folders, and command scaffolding, but must ask for action-time approval before launching `monerod`, P2Pool, XMRig, wallet RPC, or any long-running miner process.

## Local-Only Workspace

Use an ignored folder outside Git:

```text
C:\Users\xtyty\Documents\Mochi Social Ops\monero
C:\Users\xtyty\Documents\Mochi Social Ops\p2pool
C:\Users\xtyty\Documents\Mochi Social Ops\xmrig
C:\Users\xtyty\Documents\Mochi Social Ops\wallets
C:\Users\xtyty\Documents\Mochi Social Ops\reports
```

Do not track mining binaries, wallet files, blockchain data, logs with private addresses, or operator reports in this repo. The repo may record only no-secret status, command templates, and public docs.

## Download And Verification

Download Monero CLI only from the official Monero downloads page, then verify hashes and GPG signatures before extraction. Download P2Pool through the Monero guide or the official P2Pool project release path referenced there. Download XMRig only from the official XMRig site or official release path, then verify the SHA256 published for that release before extraction.

If endpoint protection flags the miner or a download, stop and investigate. Do not globally disable endpoint protection. Use a conservative allow decision only after the hash, signature, source, and operator intent are verified.

## Wallet Rules

Create a dedicated mining wallet, for example `mochi-social-mining`, because P2Pool exposes the primary mining address publicly. The operator privately enters the wallet password and records the seed offline. Never paste seed words, private spend keys, private view keys, wallet passwords, wallet files, or exchange credentials into chat, Git, logs, reports, or PRs.

Do not expose `monero-wallet-rpc` remotely. If local monitoring is needed, bind to `127.0.0.1` and prefer a view-only wallet or a no-secret report path.

## Mining Stack

The approved architecture is local owned hardware only:

1. `monerod` stores blockchain data outside Git.
2. P2Pool Mini connects to the local node and the public mining address.
3. XMRig connects to local P2Pool, typically `127.0.0.1:3333`.
4. CPU settings start conservatively, with pause-on-battery and pause-while-active behavior where practical.

Codex must not start any of those processes without explicit action-time approval.

## Evidence

No-secret mining evidence may record:

- tool names and versions,
- checksum/signature status,
- node sync status,
- P2Pool connected status,
- XMRig accepted-share status,
- timestamp,
- reviewer.

Do not publish wallet balance, wallet file paths with private context, exchange account details, tax records, or raw logs unless the operator intentionally keeps them in a private location outside Git.

Before handing this lane to an operator, run:

```powershell
npm run alpha:monero-operator-handoff
```

That command writes ignored, no-secret handoff files under `C:\Users\xtyty\Documents\Mochi Social Ops\reports`, creates missing ops folders, records official procedure links, records the withdrawal cap formula, and fails if Monero/P2Pool/XMRig wallet or mining processes are already running. It never downloads binaries, opens wallets, starts miners, starts Wallet Daemon signing, contacts Enjin, mutates providers, or reads secret values.

## Canary Funding Lane

Alpha remains no-real-value. Enjin Canary testing uses cENJ/Fuel Tank tooling, not mined XMR. Do not try to convert XMR into cENJ, do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`, and do not clear funded-chain gates until real cENJ, collection, Fuel Tank, Wallet Daemon signing, and finality proof are approved and verified.

Wallet Daemon remains a separate outbound-only signer. Keep `wallet.seed`, `KEY_PASS`, and `PLATFORM_KEY` private and outside the repo.

## Future ENJ Conversion Lane

Later, the operator may manually convert XMR to ENJ through a compliant exchange or wallet flow. That is not alpha work. It requires separate approval before mainnet ENJ funding, and exchange credentials, transfer receipts, and tax/accounting notes stay outside Git.

There is no auto-conversion, auto-top-up, or exchange integration in alpha.

## Withdrawal Cap Enforcement

The Monero wallet cannot cap Enjin or provider bills. Mochirii Supabase owns budget, reservation, finality, and admin controls. Mochi Social asks the authorized Supabase Edge authority before Enjin submission.

Available budget is:

```text
min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations
```

Reject when budget cannot be verified. Use idempotency keys for every Enjin request. Move inventory only after Enjin state is `FINALIZED`. `FAILED`, `ABANDONED`, `TIMEOUT`, or low-budget states must never credit or release assets incorrectly. Keep an admin kill switch for all withdrawals.

## Provider Billing Boundary

Vercel, Supabase, Fly, GitHub, Discord, and Enjin billing controls stay separate from Monero. A crypto wallet cannot cap those bills. Keep spend limits, budgets, and provider approvals in their native dashboards and repo runbooks.
