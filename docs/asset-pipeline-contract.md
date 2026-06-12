# Mochi Social Asset Pipeline Contract

This contract tells Codex how to upgrade Mochi Social art without breaking the RPGJS alpha.

## Source And Runtime Split

- Source intent, prompts, and art-direction notes live in docs and optional source folders under `assets/source/game/`.
- Runtime assets stay in the existing RPGJS paths:
  - `apps/game/src/tiled/mochi-tiles.png`
  - `apps/game/src/tiled/mochi-tiles.tsx`
  - `apps/game/src/tiled/mochi-town.tmx`
  - `apps/game/public/spritesheets/*.png`
- `apps/game/scripts/generate-assets.mjs` remains the reproducible local runtime exporter for the alpha asset set.
- Do not replace runtime assets with untracked external downloads, marketplace packs, or assets without ledger entries.

## Stable Contracts

- Keep 32px tiles and 96x192 event spritesheets unless a later migration plan changes map/camera/collision and tests together.
- Keep current sprite filenames, tileset source path, map layer names, object IDs, and event placements stable unless tests and docs are updated in the same change.
- Keep `/play`, `/embed`, `/healthz`, `/integration/game-manifest.json`, bridge messages, and HUD `data-*` hooks stable.
- Keep Canary visuals and copy in `configured-preview-stub` / no-real-value mode until funded-chain approval exists.

## Upgrade Workflow

1. Read `docs/game-art-bible.md`, `docs/visual-polish-brief.md`, and `AGENTS.md`.
2. Run or inspect the current local asset generator before editing.
3. Upgrade a small style probe first: town tile sample, one character, one spirit, one prop, and HUD treatment.
4. Run local visual checks, then upgrade the rest of the asset set.
5. Update `docs/asset-ledger.md` with asset dimensions, role, source note, prompt/source method, and license.
6. Run local checks before handoff. Do not push, deploy, or run hosted checks without explicit approval.

## Codex Visual Upgrade Prompt

```text
Implement the next Mochi Social visual upgrade against Alpha Preview Ready only. Use the Cozy Wushu painterly/pixel hybrid art bible, preserve RPGJS/Tiled runtime contracts, update the asset ledger, keep Enjin Canary as configured-preview-stub/no-real-value, and do not mutate providers, push, deploy, fund Enjin, or clear funded-chain gates.
```

## Rejection Conditions

- Asset source or license cannot be explained.
- Runtime asset dimensions, filenames, or Tiled contracts change without matching tests/docs.
- HUD or art makes no-real-value Canary work look like finalized settlement.
- UI text becomes unreadable over the art.
- The pass requires provider secrets, hosted checks, deploys, cENJ funding, or dashboard changes.
