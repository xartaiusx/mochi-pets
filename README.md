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
npm run alpha:load-smoke
npm run alpha:browser-presence
npm run alpha:visual-snapshot
npm run alpha:enjin-operator-smoke
```

`npm run alpha:local-acceptance` and `npm run alpha:load-smoke` expect the local fallback ledger unless their preview allow flags are set. `npm run alpha:browser-presence` uses local Chrome or `MOCHI_SOCIAL_BROWSER_EXECUTABLE` to verify two tabs show the playable canvas, HUD, presence chip, canvas movement signatures, observer-side canvas change, and HUD care/chat/emote/market/trade/Canary action loop. `npm run alpha:visual-snapshot` captures ignored first-screen page/canvas PNGs for local review. Both browser checks are local-only unless their hosted allow flags are set after explicit hosted-preview approval. `npm run alpha:enjin-operator-smoke` verifies the private Enjin operator route fails closed and avoids live Enjin submissions unless an operator explicitly opts in. See `docs/alpha-acceptance.md` and `docs/alpha-operator-handoff.md` for the full Alpha RC gate, including the remaining manual NPC/chest/habitat map-object check.

For the local no-cost release-candidate pass, run:

```powershell
npm run alpha:local-suite
npm run alpha:local-evidence
```

The suite builds once, starts the built Express runtime on a disposable localhost port with throwaway env, runs endpoint smoke, local alpha acceptance, 10-25 tester HTTP load smoke, two-tab browser presence, first-screen visual snapshot, and the private Enjin operator fail-closed check, then writes `reports/alpha-local-suite.json` and shuts the server down. The evidence command reads the ignored localhost reports and writes no-secret `reports/alpha-local-evidence.json` and `reports/alpha-local-evidence.md` summaries.

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
