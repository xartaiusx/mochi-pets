# Enjin Canary Alpha Runbook

Mochi Social alpha uses Enjin Canary only. Do not configure Enjin mainnet, paid assets, cashout, or production marketplace behavior for this release candidate.

Enjin work is no-cost gated. Do not create/fund Fuel Tanks, request faucets, mint, burn, transfer, list, or submit any live chain transaction unless the user explicitly approves that exact action after a cost note. Local configured-preview stubs and fail-closed operator smoke checks are preferred until approval.

## Source Basis

- Enjin recommends Canary testnet for proof-of-concept work before immutable mainnet use.
- Enjin Platform mutations are GraphQL `CreateTransaction` operations and must be signed by a wallet account.
- The Wallet Daemon is an outbound-only signer. It polls Enjin Platform, signs pending transactions, and should expose no inbound ports.
- Managed wallets are derived from a stable `externalId`; Mochi Social uses `mochi-social-alpha:<supabase-user-id>`.
- Fuel Tanks can sponsor transaction fees through the `fuelTank` argument on transaction creation.
- Enjin transaction states are treated as `PENDING`, `BROADCAST`, `FINALIZED`, `FAILED`, `ABANDONED`, or `TIMEOUT`. Mochi Social only credits hot inventory after `FINALIZED`.

## Operator Setup

1. In Enjin Platform, switch to Canary.
2. Create an Enjin Platform API token and store it only as a Fly secret.
3. Verify the local Wallet Daemon binary with `npm run alpha:wallet-daemon-check`.
4. Start one Wallet Daemon for the Platform account only after private operator handling of seed/passphrase material. Keep `wallet.seed` and `KEY_PASS` backed up separately and do not expose inbound ports.
5. After Enjin Platform shows Wallet Daemon connected, create the `Mochi Social Alpha` collection.
6. After explicit approval for the exact action, fund/configure a Canary Fuel Tank for the alpha collection.
7. Set Fly secrets:

```powershell
fly secrets set ENJIN_NETWORK="CANARY"
fly secrets set ENJIN_PLATFORM_URL="https://platform.canary.enjin.io/graphql"
fly secrets set ENJIN_PLATFORM_TOKEN="..."
fly secrets set ENJIN_COLLECTION_ID="..."
fly secrets set ENJIN_FUEL_TANK_ID="..."
```

## Cloud Wallet Daemon Gate

The alpha path uses a cloud Wallet Daemon, not local Docker. Enjin's Wallet Daemon signs Platform transactions by polling outbound for pending work, so the host must not expose inbound ports.

Required private inputs:

- Enjin Platform API token as `PLATFORM_KEY`.
- Wallet Daemon passphrase as `KEY_PASS`.
- Persistent encrypted `wallet.seed` storage and a separate seed/passphrase backup in a password manager or encrypted vault.

Official Enjin docs currently document AWS CloudFormation as the simplest managed cloud path. Use the current Enjin docs or dashboard link for the template, then:

```powershell
read -rsp "Enjin Platform API token: " PLATFORM_TOKEN
printf "\n"

aws cloudformation create-stack \
  --stack-name EnjinWalletDaemon \
  --template-url "https://enjin-iac-templates.s3.us-east-2.amazonaws.com/wallet-daemon.yml" \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=PlatformApiToken,ParameterValue="$PLATFORM_TOKEN" \
    ParameterKey=WalletDaemonImage,ParameterValue=<current-official-enjin-wallet-daemon-image>

unset PLATFORM_TOKEN
```

After stack creation, inspect CloudWatch startup logs privately. The first run generates the seed material and prints the wallet addresses. Record only non-secret identifiers needed by the game handoff, such as the signing address, collection ID, Fuel Tank ID/address, and finalized Enjin transaction UUIDs. Never paste the mnemonic, `wallet.seed`, `KEY_PASS`, or raw Platform token into Codex chat, Git, PR comments, screenshots, or local reports.

Do not create the `Mochi Social Alpha` collection until the daemon can sign. The Enjin Platform settings page should move from `Not Connected` to `Connected`, then collection creation should submit a transaction and eventually reach `FINALIZED`.

## Local Wallet Daemon Binary Check

Before any signer, collection, Fuel Tank, or transaction step, verify the downloaded local binary without touching wallet material:

```powershell
npm run alpha:wallet-daemon-check
```

By default on this workstation the script checks `C:\Users\xtyty\Downloads\wallet-daemon_v3.0.7_x86_64-pc-windows-msvc\wallet-daemon.exe`. Set `MOCHI_SOCIAL_WALLET_DAEMON_PATH` to check a different binary. The script records only path, file size, SHA256, and `wallet-daemon --help` command names in `reports/wallet-daemon-local.json` and `reports/wallet-daemon-local.md`.

This is a no-cost metadata gate. It never runs `wallet-daemon import`, never runs `wallet-daemon print-seed`, never starts a signer process, never contacts Enjin Platform, and never submits or funds anything. Enjin readiness still requires an operator-confirmed connected Wallet Daemon in Enjin Platform plus explicit approval before any collection, Fuel Tank, or Canary transaction action.

## Alpha Operation Flow

1. Game backend creates or reuses the managed wallet external id for the signed-in tester.
2. Tester stages a `chain.withdraw_request` or `chain.deposit_request`.
3. Mochirii Edge Functions record the request in `mochi_social_chain_operations` with `status="pending"` and append a no-real-value ledger event.
4. Game backend uses the tested Enjin helper path:
   - `ensureManagedWallet` calls `CreateManagedWallet` and `GetManagedWallet`.
   - `submitHotToColdCertificateProof` mints the selected rare certificate to the managed cold wallet with `fuelTank` and `idempotencyKey`.
   - `submitColdToHotBurnProof` burns from the managed cold wallet with `signerExternalId`, `fuelTank`, and `idempotencyKey`.
   - `submitFixedListingProof` creates only a `FIXED_PRICE` marketplace listing through `CreateTransaction(transaction: { createListing: ... })`; auctions stay disabled for alpha.
   - Both submission helpers return a `chain.operation_update` action for the Mochirii ledger bridge.
5. A backend worker or operator poll reads the transaction state from Enjin Platform with `pollEnjinTransaction`.
6. Only when state is `FINALIZED`, Mochirii records `finalized_at` and applies hot/cold inventory movement.

Failed, abandoned, or timed-out operations stay in the audit log and do not credit hot inventory.

When Enjin/Fly secrets are absent, `/integration/alpha/status` and local `chain.*` action responses must expose `mode="configured-preview-stub"`. That stub is still no-real-value and Canary-only; it proves the game and ledger path while telling testers that Enjin Platform, Fuel Tank, and Wallet Daemon signing are not configured yet.

For Alpha Preview Ready, this configured-preview-stub mode is intentional. Do not set dummy collection IDs, dummy Fuel Tank IDs, or fake readiness flags. Keep the chain UI visible, record chain requests as audit-only preview rows, and leave funded-chain gates red until cENJ, collection, Fuel Tank, Wallet Daemon signing, and finality proof are approved.

## Private Operator Endpoint

The Fly game runtime exposes a private operator route for Canary proof submission:

```text
POST /integration/alpha/enjin/submit
```

This route is not for browser clients or the Mochirii website. It requires:

- `x-mochi-social-server-token` matching the Fly secret `MOCHI_SOCIAL_GAME_SERVER_TOKEN`.
- `confirmNoRealValue=true` in the JSON body.
- Enjin Canary readiness: `ENJIN_PLATFORM_TOKEN`, `ENJIN_COLLECTION_ID`, and `ENJIN_FUEL_TANK_ID`.
- A matching pending `chain.*_request` already recorded in Mochirii Supabase when forwarding to Edge Functions.

Supported operations:

- `hot-to-cold-certificate`: submits a managed-wallet mint proof for the Momo Canary certificate.
- `cold-to-hot-burn`: submits a managed-wallet burn proof.
- `fixed-listing`: submits a `FIXED_PRICE` marketplace listing proof. Requires `price`.
- `poll-transaction`: reads `GetTransaction` and forwards the latest state as `chain.operation_update`. Requires `enjinTransactionUuid`.

Example body shape:

```json
{
  "operation": "hot-to-cold-certificate",
  "requestId": "existing-chain-request-id",
  "playerId": "supabase-user-id",
  "tokenId": "1",
  "amount": 1,
  "itemId": "momo-canary-certificate",
  "confirmNoRealValue": true
}
```

The endpoint returns the generated `chain.operation_update` payload and the ledger bridge response. It never accepts refresh tokens, service-role keys, Wallet Daemon seeds, or Wallet Daemon passphrases.

Run the fail-closed smoke against any preview or local runtime:

```powershell
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"
npm run alpha:enjin-operator-smoke
```

For a local non-production server started with a throwaway `MOCHI_SOCIAL_GAME_SERVER_TOKEN`, set `MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN` to the same value to also verify the tokened no-Enjin-secrets response. A live Canary poll is disabled unless an operator sets `MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE=true`, `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID`, and `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID` for an already-approved transaction. Do not paste production tokens into chat or commit them.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:enjin-operator-smoke
```

External smoke requires real Canary credentials and remains an operator step:

- Wallet Daemon running with no inbound ports.
- Enjin Platform settings show Wallet Daemon status `Connected`.
- Fuel Tank can sponsor the expected transaction.
- `ENJIN_PLATFORM_TOKEN`, `ENJIN_COLLECTION_ID`, and `ENJIN_FUEL_TANK_ID` are set only as Fly secrets.
- `CreateManagedWallet` and `GetManagedWallet` work for the tester's `mochi-social-alpha:<supabase-user-id>` external id.
- `/integration/alpha/enjin/submit` fails closed without `x-mochi-social-server-token`.
- A selected rare certificate reaches `FINALIZED`.
- One fixed-price listing proof returns a transaction UUID. The listing id itself is expected only after finality/event indexing.
- The matching Supabase chain operation records transaction UUID, state, finalized time, and ledger event.
