# Mochi Social

Mochi Social is a small multiplayer browser RPG scaffolded as its own MIT-licensed game repo. It is designed to be embedded by, or launched from, a separate Vercel/GitHub/Supabase website without mixing website source into the game repository.

## Repo Shape

- `apps/game`: RPGJS v5 game runtime, Express adapter, integration manifest, Supabase bridge prep, and Fly.io deployment entrypoint.
- `docs`: source basis, deployment notes, upstream policy, and website integration contract.
- `.github/workflows/ci.yml`: install, typecheck, lint, test, and build checks.

## Local Development

```powershell
npm install
npm run dev:game
```

Open two browser tabs to the Vite URL, usually `http://localhost:3000`, and verify both players can move around the same town. Interact with the NPC and chest to verify dialog, item pickup, and save-backed player variables.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

For endpoint checks against a running server:

```powershell
$env:MOCHI_SOCIAL_BASE_URL='http://localhost:3000'
npm run smoke
npm run alpha:local-acceptance
```

`npm run alpha:local-acceptance` expects the local fallback ledger unless `MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true` is set for a preview runtime. See `docs/alpha-acceptance.md` for the full Alpha RC gate, including the required two-tab visual presence check.

## Deployment Boundary

Vercel should host the future website. Fly.io should host the Mochi Social game runtime because the game uses a long-lived multiplayer server/WebSocket runtime. The future website should reference the game through one public URL:

- Next.js: `NEXT_PUBLIC_MOCHI_SOCIAL_URL`
- Vite/other: `VITE_MOCHI_SOCIAL_URL`

## Upstream

RPGJS is used as a dependency and fetch-only upstream reference:

```powershell
git remote add upstream https://github.com/RSamaium/RPG-JS.git
git remote set-url --push upstream DISABLED
```

Do not vendor upstream source or unlicensed starter assets into this repo.
