# Contributing

Mochi Social is the Unity WebGL shared guild room for Mochirii's closed playtest. Contributions should preserve the one-room, shared-Lirabao, no-real-value alpha scope unless a task explicitly says otherwise.

## Workflow

- Work on a scoped branch; do not commit directly to `main`.
- Keep this game repo separate from the Mochirii website repo.
- Keep Unity WebGL as the active alpha runtime.
- Keep the old browser runtime as rollback/reference material only.
- Do not add avatar uploads, market, trade, funded-chain behavior, multiple rooms, mobile-specific scope, or public-launch claims unless the alpha scope changes.
- Do not commit `.env`, local saves, Unity generated state, provider secrets, service-role keys, wallet material, or private tester data.

## Validation

Run the checks that match your change:

```sh
npm run typecheck
npm run lint
npm test
npm run secret-scan
git diff --check
```

For Unity alpha runtime or release-surface changes, also run:

```sh
npm run unity:verify
npm run build:release
npm run alpha:built-server-smoke
npm run smoke
```

Hosted checks, provider settings, deployments, new paid resources, and live load tests require explicit approval before running.

## Pull Requests

Include the purpose, changed surfaces, validation run, and any effect on the website bridge contract. Call out changes to `/embed`, `/play`, `/healthz`, `/integration/game-manifest.json`, `/integration/alpha/status`, Unity WebGL build behavior, tester access, saved progress, or shared Lirabao state.
