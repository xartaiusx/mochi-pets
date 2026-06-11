# Website Integration Contract

The future Vercel/Supabase website should stay in its own repo. It only needs the deployed Mochi Social URL.

## Website Env Vars

- Next.js: `NEXT_PUBLIC_MOCHI_SOCIAL_URL`
- Vite/other: `VITE_MOCHI_SOCIAL_URL`

## Embed

```html
<iframe
  title="Mochi Social"
  src="https://mochi-social-game.fly.dev/embed"
  allow="fullscreen"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

## Manifest

Fetch:

```text
GET /integration/game-manifest.json
```

The manifest includes name, version, play URL, embed URL, origin, bridge protocol version, and auth mode.

Alpha RC manifests also include:

- `alpha.allowlistRequired=true`
- `alpha.termsRequired=true`
- `alpha.noRealValue=true`
- `economy.mode="test-soft-currency"`
- `chain.provider="enjin"`
- `chain.network="CANARY"`
- `market.fixedPrice=true`
- `market.auctions=false`
- `ugc="curated"`

## Supabase Bridge v1

The parent website owns Supabase session refresh. It may send short-lived access tokens to the iframe. Never send refresh tokens or service-role keys.

Parent to game:

- `MOCHI_SOCIAL_AUTH`
- `MOCHI_SOCIAL_SIGN_OUT`

Game to parent:

- `MOCHI_SOCIAL_READY`
- `MOCHI_SOCIAL_AUTH_STATE`
- `MOCHI_SOCIAL_ERROR`

Recommended website flow:

1. Subscribe to Supabase `onAuthStateChange`.
2. When a signed-in session exists, send `{ type: "MOCHI_SOCIAL_AUTH", protocolVersion: 1, payload: { accessToken, expiresAt } }`.
3. On sign-out, send `{ type: "MOCHI_SOCIAL_SIGN_OUT", protocolVersion: 1 }`.
4. Treat `MOCHI_SOCIAL_AUTH_STATE` as display/status only; the game server remains authoritative.

## Chain Finality Contract

The game backend may send `chain.withdraw_request`, `chain.deposit_request`, and `chain.operation_update` through `/integration/alpha/action`.

- `chain.withdraw_request` stages a no-real-value hot-to-cold Canary proof.
- `chain.deposit_request` stages a no-real-value cold-to-hot Canary proof.
- `chain.operation_update` records the Enjin transaction UUID, optional listing ID, state, and finality evidence for an existing request.
- The Mochirii Edge Function must reject finality updates without a matching request id.
- Hot inventory can only be credited after the Enjin state is `FINALIZED`.
- Game-side Enjin helpers create or find the tester managed wallet, submit Fuel Tank sponsored Canary transactions with an `idempotencyKey`, create fixed-price listing proofs through `CreateTransaction(transaction: { createListing: ... })`, then forward `chain.operation_update` through the same server-token Edge bridge.
- Private Enjin submissions use `POST /integration/alpha/enjin/submit` with `x-mochi-social-server-token`; this endpoint is an operator/backend route, not a website iframe route.

## Alpha Preview Ready Contract

The Mochirii Vercel Preview route may embed Mochi Social while Enjin is unfunded and the game reports `chainRuntime.mode="configured-preview-stub"`.

- Parent site sends only `MOCHI_SOCIAL_AUTH` with a short-lived Supabase access token, plus `MOCHI_SOCIAL_SIGN_OUT` when needed.
- Chain UI remains visible and clearly labeled no-real-value/test-only.
- Chain requests may be recorded as audit-only preview rows, but they must not credit hot inventory, settle trades, settle listings, or imply production ownership.
- Do not set dummy `ENJIN_COLLECTION_ID`, dummy `ENJIN_FUEL_TANK_ID`, or fake Enjin readiness flags for Preview Ready.
- `preview-live-gates` cover Fly embed, Vercel Preview route, Supabase allowlist, terms, feedback, and the no-real-value chain stub.
- `funded-chain-gates` cover real Canary collection, Fuel Tank, Wallet Daemon signing, and finality proof. They can remain red until funded-chain approval exists.
- The Mochirii repo should prove its website tester-entry lane with `npm run check:mochi-social-preview-ready`; that audit is separate from funded-chain gates and remains no-secret.
- The website should treat Alpha Preview Ready as a closed tester preview, not production launch.

## Closed Alpha Route

The Mochirii website should expose the closed alpha at `/games/mochi-social` and read `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.

Before rendering the iframe, the page should:

1. Require a signed-in Supabase session.
2. Call the Mochi Social alpha session Edge Function.
3. Require an active alpha allowlist row.
4. Require explicit acknowledgement that alpha assets are test-only, no-real-value, Enjin Canary assets.
5. Forward only the short-lived Supabase access token to the iframe.
