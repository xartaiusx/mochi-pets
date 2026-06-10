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
