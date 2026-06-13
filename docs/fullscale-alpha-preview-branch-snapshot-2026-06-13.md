# Fullscale Alpha Preview Branch Snapshot

Generated: 2026-06-13

This is a no-secret coordination report for the remote branch
`origin/codex/mochi-social-fullscale-alpha-preview`. It is intended to help
merge the parallel Mochi Social runtime/art lane without colliding with the
current `main` release candidate or the website repo.

## Current Git State

- Local snapshot branch: `codex/fullscale-alpha-preview-branch-snapshot`
- Current `main` / `origin/main`: `3176775` `[codex] Build Mochi Social alpha RC slice (#1)`
- Remote branch under review: `origin/codex/mochi-social-fullscale-alpha-preview`
- Merge-base with current `main`: `b194be8`
- Commits reachable from the remote branch but not current `main`: `105`
- Open GitHub PRs at snapshot time: none returned by `gh pr list`

The remote branch is not a small forward-only branch from the current squash
merged `main`. It includes the pre-squash alpha lineage plus newer fullscale
alpha visual/runtime commits. A direct PR from this branch would be difficult
to review cleanly unless it is rebased, cherry-picked, or split first.

Latest visible commits in the remote branch:

- `8696fdb` Add Mochirii training and quest map loop
- `c5ba069` Stabilize Mochirii asset source cards
- `3b7457a` Build Mochirii alpha spirit loop

## Diff Footprint Against Current Main

- Total: 95 files changed, 3485 insertions, 1625 deletions
- `apps/game/src/**`: 14 changed files
- `apps/game/tests/**`: 7 changed files
- `apps/game/public/spritesheets/**`: 16 changed files
- `assets/source/game/hd/**`: 24 changed files
- `docs/**`: 12 changed files
- `scripts/**`: 14 changed files
- Package manifests/lockfiles touched:
  - `package.json`
  - `package-lock.json`
  - `apps/game/package.json`

Add/delete highlights:

- Deleted runtime spritesheets: `friend.png`, `mochi.png`, `spirit-momo.png`,
  `spirit-sora.png`, `spirit-yuzu.png`
- Added runtime spritesheets: `quest-board.png`, `sifu-narao.png`,
  `spirit-aozhen.png`, `spirit-jintari.png`, `spirit-lirabao.png`,
  `training-ring.png`, `wayfarer.png`
- Added HD source-art masters and source metadata for shrine, chest, market,
  map tiles, quest board, NPCs, trade post, training ring, and wayfarer assets
- Deleted `docs/kenney-reference-analysis.md`
- Added `scripts/check-clean-room-literals.mjs`

## Risk Clusters

1. Runtime contracts:
   - `apps/game/src/integration/**`
   - `apps/game/src/server.ts`
   - `apps/game/src/entries/express.ts`
   - `apps/game/src/config/config.client.ts`

2. Map and RPGJS behavior:
   - `apps/game/src/tiled/**`
   - `apps/game/src/modules/main/**`
   - `apps/game/tests/map-event-behavior.test.ts`
   - `apps/game/tests/map-object-contract.test.ts`

3. Art pipeline and runtime assets:
   - `apps/game/public/spritesheets/**`
   - `assets/source/game/hd/**`
   - `assets/source/game/prompts.md`
   - `docs/asset-ledger.md`
   - `docs/asset-pipeline-contract.md`

4. Alpha gates and local evidence:
   - `scripts/check-alpha-*.mjs`
   - `scripts/write-alpha-*.mjs`
   - `docs/alpha-preview-ready.md`
   - `docs/alpha-operator-handoff.md`
   - `docs/alpha-acceptance.md`

5. Enjin Canary and no-real-value posture:
   - `docs/enjin-canary-alpha.md`
   - `apps/game/tests/enjin-canary.test.ts`
   - `apps/game/src/alpha/content.ts`
   - `apps/game/src/integration/alpha-contract.ts`
   - `apps/game/src/integration/browser-bridge.ts`

6. Install and CI shape:
   - `package.json`
   - `package-lock.json`
   - `apps/game/package.json`

## Recommended Review And Merge Path

1. Do not merge the remote branch directly from its current base.
2. Create a fresh branch from current `origin/main`.
3. Cherry-pick or manually port the three latest fullscale commits first:
   - `3b7457a`
   - `c5ba069`
   - `8696fdb`
4. If those commits depend on older unsquashed commits, split the work into
   smaller PRs in this order:
   - clean-room/source-art and asset ledger updates
   - runtime sprite/map/object contract updates
   - HUD/browser bridge and alpha content updates
   - alpha gate/check script updates
   - operator docs and evidence docs
5. Re-run `npm install` if package-lock changes remain after the port.
6. Open a draft PR and verify CI before considering merge readiness.

## No-Cost Validation Ladder

Run these checks before opening or marking a ported PR ready:

```sh
npm run secret-scan
npm run alpha:readiness
npm run alpha:gate-contracts
npm run typecheck
npm run lint
npm test
npm run build
```

For a runtime/art PR that changes maps, sprites, or source art, also run:

```sh
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:report-hygiene
```

Browser, visual, and manual prompt review commands should stay local-only unless
the explicit hosted-check approval flag has been granted.

## Provider Boundary

No provider mutation is part of this snapshot. Do not deploy Fly, run hosted
load checks, mutate Vercel/Supabase/Fly/GitHub/Discord/Enjin secrets, fund cENJ,
create Fuel Tanks, start or import Wallet Daemon signer material, or submit
Enjin transactions from this coordination branch.

The correct next action is a clean rebased/cherry-picked PR with local no-cost
evidence, followed by normal public GitHub PR check verification.
