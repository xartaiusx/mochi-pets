# Mochi Social HD Source Export Notes

These notes define the source-art intent for the Crisp Pixel Kit pass. Runtime PNGs are still exported by `apps/game/scripts/generate-assets.mjs`; this file describes the higher-detail source thinking behind those exports.

## Active Direction

- Theme: Cozy Wushu guild town.
- Finish: Crisp Pixel Kit, not photoreal tiny sprites.
- Priority: Town readability first, then interactable sprites, then HUD cohesion.
- Runtime target: 32px tiles and 96x192 event spritesheets, preserving existing filenames and Tiled contracts.
- Reference posture: Kenney is a clarity benchmark for compact silhouettes and kit cohesion; no Kenney files are copied, traced, downloaded, vendored, or required.

## Export Rules

- Design at a higher conceptual fidelity than the runtime size: clear material, shape, light source, role, and interaction cue.
- Export down into readable pixel clusters: strong outlines, controlled highlights, limited texture noise, and recognizable silhouettes.
- Favor readable value groups over dense micro-detail. At gameplay zoom, the player should understand walkable path, blocked decor, interactable object, and decorative ambience quickly.
- Keep Enjin/Canary visuals magical and test-like: preview stub, no real value, no production settlement implication.

## Asset Intent

- Town ground: calm jade grass with sparse clustered tufts, not uniform static noise.
- Paths: warm stone/timber walkways with obvious edges and enough open space around interactables.
- Water: compact readable blue value bands with bright highlights and distinct banks.
- Walls and blocked decor: darker value, strong rim, obvious obstruction.
- Habitat/NPC/chest/market/trade/Canary zones: each gets a distinct landmark shape, contact shadow, and color accent.
- Characters and pets: chunky readable silhouettes, strong contact shadows, simple expressive faces, no over-rendered details.
- HUD: crisp warm panels, high contrast text, clear focus/action states, no obstruction of prompts.

## Local Review Gate

After exporting runtime PNGs, run local visual evidence and inspect the canvas. The pass is acceptable only when the first screen reads as a polished 2D town within a few seconds and the major interactables are recognizable without debug labels.
