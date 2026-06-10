# Enjin Canary Alpha Runbook

Mochi Social alpha uses Enjin Canary only. Do not configure Enjin mainnet, paid assets, cashout, or production marketplace behavior for this release candidate.

## Source Basis

- Enjin recommends Canary testnet for proof-of-concept work before immutable mainnet use.
- Enjin Platform mutations are GraphQL `CreateTransaction` operations and must be signed by a wallet account.
- The Wallet Daemon is an outbound-only signer. It polls Enjin Platform, signs pending transactions, and should expose no inbound ports.
- Managed wallets are derived from a stable `externalId`; Mochi Social uses `mochi-social-alpha:<supabase-user-id>`.
- Fuel Tanks can sponsor transaction fees through the `fuelTank` argument on transaction creation.
- Enjin transaction states are treated as `PENDING`, `BROADCAST`, `FINALIZED`, `FAILED`, `ABANDONED`, or `TIMEOUT`. Mochi Social only credits hot inventory after `FINALIZED`.

## Operator Setup

1. In Enjin Platform, switch to Canary.
2. Create the `Mochi Social Alpha` collection.
3. Create an Enjin Platform API token and store it only as a Fly secret.
4. Start one Wallet Daemon for the Platform account. Keep `wallet.seed` and `KEY_PASS` backed up separately and do not expose inbound ports.
5. Fund/configure a Canary Fuel Tank for the alpha collection.
6. Set Fly secrets:

```powershell
fly secrets set ENJIN_NETWORK="CANARY"
fly secrets set ENJIN_PLATFORM_URL="https://platform.canary.enjin.io/graphql"
fly secrets set ENJIN_PLATFORM_TOKEN="..."
fly secrets set ENJIN_COLLECTION_ID="..."
fly secrets set ENJIN_FUEL_TANK_ID="..."
```

## Alpha Operation Flow

1. Game backend creates or reuses the managed wallet external id for the signed-in tester.
2. Tester stages a `chain.withdraw_request` or `chain.deposit_request`.
3. Mochirii Edge Functions record the request in `mochi_social_chain_operations` with `status="pending"` and append a no-real-value ledger event.
4. Game backend submits an Enjin Canary transaction plan and stores the returned transaction UUID through `chain.operation_update`.
5. A backend worker or operator poll reads the transaction state from Enjin Platform.
6. Only when state is `FINALIZED`, Mochirii records `finalized_at` and applies hot/cold inventory movement.

Failed, abandoned, or timed-out operations stay in the audit log and do not credit hot inventory.

When Enjin/Fly secrets are absent, `/integration/alpha/status` and local `chain.*` action responses must expose `mode="configured-preview-stub"`. That stub is still no-real-value and Canary-only; it proves the game and ledger path while telling testers that Enjin Platform, Fuel Tank, and Wallet Daemon signing are not configured yet.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run smoke
```

External smoke requires real Canary credentials and remains an operator step:

- Wallet Daemon running with no inbound ports.
- Fuel Tank can sponsor the expected transaction.
- A selected rare certificate reaches `FINALIZED`.
- The matching Supabase chain operation records transaction UUID, state, finalized time, and ledger event.
