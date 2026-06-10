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

## Closed Alpha Route

The Mochirii website should expose the closed alpha at `/games/mochi-social` and read `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.

Before rendering the iframe, the page should:

1. Require a signed-in Supabase session.
2. Call the Mochi Social alpha session Edge Function.
3. Require an active alpha allowlist row.
4. Require explicit acknowledgement that alpha assets are test-only, no-real-value, Enjin Canary assets.
5. Forward only the short-lived Supabase access token to the iframe.
