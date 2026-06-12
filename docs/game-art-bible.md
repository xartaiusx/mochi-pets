# Mochi Social Game Art Bible

This art bible defines the shipped game look for the Alpha Preview visual upgrade. It keeps the game aligned with the polished Mochirii tester gate while preserving RPGJS readability, local verification, and the no-real-value alpha boundary.

## Source Basis

- Kenney free assets / reference survey: `docs/kenney-reference-analysis.md`
- Kenney Tiny Town, RPG tag, UI Pack, Input Prompts, and support/license pages: https://kenney.nl/assets
- RPGJS tileset guidance: https://docs.rpgjs.dev/guide/create-tileset
- Tiled map and layer guidance: https://doc.mapeditor.org/en/stable/manual/layers/
- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com/full-list/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Enjin network/finality arguments: https://docs.enjin.io/api-reference/important-arguments
- Enjin Fuel Tanks: https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks

## Visual Target

- Style: HD Source Export + Crisp Pixel Kit. Cozy Wushu mood remains the theme, but runtime art should use crisp silhouettes, clean value groups, controlled pixel clusters, and clear interaction cues rather than dense painterly noise.
- Mood: dusk lantern arrival, hidden guild town, warm hospitality, soft magic, gentle social play.
- Palette: jade greens, red timber, warm lantern gold, muted stone, bamboo shadow, soft sky blue, blush/pomelo/sky spirit accents.
- Lighting: painted dusk gradients, warm rim highlights, soft contact shadows, lantern glow, readable black/brown outlines.
- Materials: carved timber, lacquered chests, parchment, jade stone, bamboo, water, paper lanterns, polished path stones. Each material needs one or two readable pixel cues at runtime scale, not full texture realism.
- Camera: current top-down / three-quarter 2D RPG readability. Do not use literal photorealism for tiny runtime sprites.
- Reference posture: use Kenney as a readability benchmark for compact silhouettes, tile clarity, and approachable game-kit cohesion; do not copy, trace, vendor, download, or depend on Kenney files.

## Runtime Art Rules

- Keep current alpha scale unless a later plan explicitly changes map/camera/collision: 32px tiles, 96x192 event spritesheets, 25x18 town map.
- Preserve runtime filenames and paths so RPGJS, tests, `/play`, and `/embed` resolve assets identically.
- Treat `assets/source/game/hd-source-export.md` as the source-art brief. Runtime assets still export from `apps/game/scripts/generate-assets.mjs` until a later plan approves a different art toolchain.
- Use transparent backgrounds for event spritesheets and opaque tile backgrounds for the tilesheet.
- Use strong silhouettes and contact shadows for interactive objects: NPC, pet, chest, market board, trade post, and Canary shrine.
- Prefer Kenney-like icon clarity over dense rendering: simple shapes, strong outlines, bevel highlights, and clear object function at small size.
- Prioritize town readability first: calmer grass, clearer path edges, distinct blocked zones, and obvious landmark framing around NPC, chest, habitat, market, trade, and Canary objects.
- Avoid text baked into sprites. Use shapes, icons, glow, and landmarks instead.
- Avoid logos, real brands, third-party references, paid-pack style imitation, and visual promises of real-money value.
- Enjin-related visuals must read as Canary preview magic or certificate testing, never as production settlement or real value.

## Asset Families

- Town tiles: grass, path, water, timber wall, flower garden, sign, market/trade facade, Canary tile, lantern, habitat bed, bridge, shrine stone, bamboo, shadow, chest marker, care shrine, path edge, market/trade landmark tiles.
- Characters: warm Wushu tester avatar and green/jade welcome NPC, each with readable idle/walk frame variants.
- Mochi Spirits: Momo blush/gentle, Yuzu gold/bright, Sora blue/curious. Each needs distinct color and silhouette at small size.
- Props: chest, market board, trade post, Canary shrine. Each needs a ground shadow and one clear interaction affordance.
- HUD: warm glass, jade/timber accents, readable text over art, no overlap with movement or prompts.

## Prompt Template

Use this template for any generated source art or prompt-recorded handoff:

```text
High-fidelity source intent for a crisp Cozy Wushu 2D RPG asset for Mochi Social, exported as a small readable pixel-kit runtime asset, top-down 2D RPG clarity, dusk lantern lighting, jade green and red timber palette, warm gold rim light, soft contact shadow, strong silhouette at gameplay zoom, no text, no logos, no real-world brands, no people unless requested, alpha preview no-real-value game asset.
```

Append the specific asset role, color identity, animation frame needs, and runtime dimensions. Record the final prompt in `docs/asset-ledger.md` or an asset source note before commit.

## Accessibility Gates

- Important HUD text sits on semi-opaque backing and remains readable over the map.
- Interactive objects use shape and contrast, not color alone.
- Walkable paths, blocked areas, and interactable objects are distinguishable in the first screen without reading debug labels.
- Small labels, badges, and buttons preserve visible focus states and pointer/keyboard affordance.
- Avoid flickering, high-frequency texture noise, and over-detailed sprites that blur at runtime scale.
- Verify first-screen layout at desktop and common laptop widths before any hosted review.

## Done

- Runtime assets preserve filenames, dimensions, and gameplay contracts.
- First screen reads as a cohesive Cozy Wushu town, not a debug map.
- NPC, pets, chest, market board, trade post, and Canary shrine are visually recognizable at gameplay zoom.
- `docs/asset-ledger.md` records every changed art asset, source, license, dimensions, role, and prompt/source note.
