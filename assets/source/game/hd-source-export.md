# Mochi Social HD Source Export Notes

These notes define the source-master intent for the Mochirii High-Fidelity Wuxia pass. Runtime PNGs are exported by `apps/game/scripts/generate-assets.mjs`; source masters and source cards live under `assets/source/game/hd/`.

## Active Direction

- Theme: Jade Lantern Court, Mochirii guild, Mochi Spirits, and wuxia social play.
- Finish: smooth illustrated 2D with soft lighting and painterly material cues.
- Priority: asset-by-asset source master, runtime export, ledger update, screenshot review, and tests.
- Runtime target: 64x64 logical tiles and 384x768 spritesheets with 128x192 frames.
- Clean-room posture: use only project-authored or clearly license-safe source material. Do not rely on third-party visual references, screenshots, copied names, copied lore, or copied assets.

## Export Rules

- Generate or edit one source-master asset at a time.
- Keep source prompts and source cards separate from runtime files.
- Preserve runtime paths unless tests/docs change in the same scoped task.
- Favor clear material, shape, light source, role, and interaction cue.
- Keep Enjin/Canary visuals magical and test-like: preview stub, no real value, no production settlement implication.

## Asset Intent

- Town ground: calm jade grass, readable path and water edges, distinct blocked decor.
- Guild landmarks: Sifu Narao, guild seal chest, spirit habitat grove, journal pavilion, expedition gate, route invitation altar, technique dojo, affinity dais, party banner, training ring, quest board, market board, trade post, and Canary shrine each need a unique silhouette and contact shadow.
- Mochi Spirits: Lirabao, Jintari, and Aozhen need distinct color, temperament, care identity, and journal role.
- HUD: warm panels, high contrast text, clear focus/action states, and no obstruction of prompts.

## Local Review Gate

After exporting runtime PNGs, run local visual evidence and inspect the canvas. The pass is acceptable only when the first screen reads as a polished 2D guild town within a few seconds and the major interactables are recognizable without debug labels.
