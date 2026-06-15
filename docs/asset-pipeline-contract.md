# Mochi Social Asset Pipeline Contract

This contract tells Codex how to upgrade Mochi Social art without breaking RPGJS multiplayer, Tiled collision, alpha tests, or the Mochirii website integration contract.

## Source And Runtime Split

- Source masters and source cards live under `assets/source/game/hd/`.
- Runtime assets stay in the RPGJS paths:
  - `apps/game/src/tiled/mochi-tiles.png`
  - `apps/game/src/tiled/mochi-tiles.tsx`
  - `apps/game/src/tiled/mochi-town.tmx`
  - `apps/game/public/spritesheets/*.png`
- `apps/game/scripts/generate-assets.mjs` is the reproducible Sharp exporter and remains the entrypoint through `npm run prepare-assets`.
- Runtime files are generated-for-project. Do not import untracked downloads, marketplace packs, screenshots, or derivative external-project art.

## Stable Contracts

- Town tiles are 64x64 logical tiles. The runtime tilesheet is 512x192.
- Character and prop spritesheets are 384x768 with a 3x4 layout and 128x192 frames.
- Keep Tiled layer names, map width/height, collision semantics, object roles, public routes, bridge messages, and HUD `data-*` hooks stable unless tests and docs change in the same task.
- Keep Enjin UI and copy as Canary, no-real-value, and `configured-preview-stub` until funded-chain gates are approved and verified.
- Content-only proof loops such as the Jade Weather Veil, Jade Weather Veil Chart, Jade Encounter Rotation, Jade Encounter Rotation Scroll, Jade Encounter Atlas, Jade Habitat Census, Jade Habitat Census Seal, Jade Court Craft Writ, Jade Court Market Receipt, Jade Market Receipt, Jade Provision Catalog, Jade Provision Catalog Seal, Jade Battle Kit, Jade Battle Kit Tag, Jade Remedy Pouch, Jade Remedy Pouch Tag, Jade Quest Ledger, Jade Quest Ledger Seal, Jade Roster Cabinet, Jade Roster Cabinet Tag, Jade Blossom Cradle, Jade Blossom Cradle Ribbon, Jade Exchange Accord, Jade Exchange Accord Tally, Jade Cloudbell Waystone, Jade Route Charter, Jade Route Charter Slip, Jade Moonwell Nurture Rite, Jade Teahouse Recovery, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Bloom Ascendance Sigil, Jade Lineage Register, Jade Lineage Register Seal, Jade Capture Rite, Jade Dojo Ladder, Jade Dojo Ladder Seal, Jade Banner Tournament, Jade Rival Circle, Jade Sifu Council, Jade Sifu Council Crest, Jade Summit Circuit, Jade Summit Circuit Laurel, Jade Affinity Matrix, Jade Technique Codex, Jade Technique Codex Seal, Jade Scroll Story Chapter, and Jade Insignia Case may add HUD labels/actions and tests without an asset-ledger row when no runtime art file or source card is created.

## Asset Replacement Order

1. `wayfarer`
2. `sifu-narao`
3. `spirit-lirabao`
4. `spirit-jintari`
5. `spirit-aozhen`
6. guild seal chest
7. habitat grove
8. journal pavilion
9. expedition gate
10. route invitation altar
11. technique dojo
12. tactic scroll stand
13. affinity dais
14. party banner
15. training ring
16. quest board
17. guild rank bell
18. growth moonwell
19. market board
20. trade post
21. Canary shrine
22. town tilesheet and map polish
23. HUD and action icons

Each asset gets a source card, runtime export, ledger update, screenshot review, and tests before the next substantial visual pass.

## Upgrade Workflow

1. Read `docs/game-art-bible.md`, `docs/visual-polish-brief.md`, `AGENTS.md`, and this contract.
2. Edit source prompts/cards or `apps/game/scripts/generate-assets.mjs`.
3. Run `npm run prepare-assets`.
4. Update `docs/asset-ledger.md`.
5. Run static and local checks. Do not deploy, mutate providers, set hosted flags, fund Enjin, or clear funded-chain gates without explicit approval.

## Clean-Room Guardrail

Use `npm run clean-room-scan` for built-in clean-room fingerprints, hashed legacy-identity fingerprints, runtime asset ledger coverage, and a private denylist supplied by `MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST` or `.local/clean-room-denylist.txt`. The committed repo stores the scanner and instructions only; private restricted literals and retired literal lists stay outside Git.

## Rejection Conditions

- Asset source or license cannot be explained.
- Runtime dimensions or Tiled contracts change without matching tests/docs.
- HUD or art implies real value, production settlement, or Enjin finality before `FINALIZED`.
- UI text becomes unreadable over the art.
- The pass requires provider secrets, hosted checks, deploys, cENJ funding, dashboard changes, or live chain actions.
