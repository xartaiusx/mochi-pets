# Mochi Social Game Art Bible

This art bible defines the active Mochirii-native look for the Alpha Preview visual lane. It preserves the playable RPGJS town, multiplayer presence, no-real-value Enjin Canary posture, and website integration contract while moving the game identity toward smooth illustrated wuxia fantasy.

## Source Basis

- RPGJS reference repo and v5 package contract: https://github.com/RSamaium/RPG-JS
- Tiled map and layer guidance: https://doc.mapeditor.org/en/stable/manual/layers/
- Sharp image pipeline: https://sharp.pixelplumbing.com/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com/full-list/
- GitHub licensing overview: https://docs.github.com/articles/licensing-a-repository
- CC0 legalcode for intentionally public-domain assets: https://creativecommons.org/publicdomain/zero/1.0/legalcode.en

## Visual Target

- Style: Mochirii High-Fidelity Wuxia. Smooth illustrated 2D, soft lighting, painterly jade, lacquer, gold, silk, and paper materials.
- Mood: Jade Lantern Court, hidden guild hospitality, gentle spirit bonding, quiet social play, and warm alpha-tester welcome.
- Palette: jade greens, cinnabar lacquer, warm gold, parchment ivory, silk blush, sky-jade blue, violet Canary accents, and deep ink shadows.
- Camera: readable top-down / three-quarter 2D RPG presentation for RPGJS. The art should look modern and polished while staying legible at gameplay zoom.
- Prohibited direction: no third-party visual reference dependency, no nostalgic low-resolution styling, no baked-in text, no real-world logos, no paid-pack imitation, and no production or real-value chain symbolism.

## Runtime Art Rules

- Runtime town tiles use 64x64 logical tiles. `apps/game/src/tiled/mochi-tiles.png` is 512x192 with 8 columns and 3 rows.
- Runtime event spritesheets use 3x4 frames. Each spritesheet is 384x768 with 128x192 frames.
- Source masters live under `assets/source/game/hd/` and are exported down through `apps/game/scripts/generate-assets.mjs` using Sharp.
- Preserve Tiled layer names, map dimensions, public routes, bridge messages, and no-real-value labels unless tests and docs change in the same scoped task.
- Use transparent backgrounds for event spritesheets and opaque tilesheet backgrounds.
- Use clear silhouettes, soft contact shadows, material highlights, and object-specific shape language for Sifu Narao, the guild seal chest, spirit habitat grove, journal pavilion, expedition gate, route invitation altar, technique dojo, tactic scroll stand, affinity dais, party banner, training ring, quest board, guild rank bell, growth moonwell, market board, trade post, and Canary shrine.
- Enjin-related visuals must read as Canary preview staging only: configured preview stub, no real value, no settlement implication before `FINALIZED`.

## Canonical Asset Families

- Wayfarer: Mochirii Wayfarer player avatar in layered silk travel robes.
- Sifu Narao: welcome mentor and care-shrine guide with jade/ivory guild styling.
- Mochi Spirits: Lirabao, Jintari, and Aozhen. Each has profile, affinity, temperament, habitat, Jade Starter Vow eligibility, capture/invitation profile, field route signs, no-injury field accord eligibility, route invitation eligibility, route mastery contribution, Jade Cloudbell route patrol contribution, Jade Court Habitat Bond contribution, Jade Court Sanctuary Rite contribution, Jade Court Research Folio contribution, Jade Court Spirit Compendium contribution, Jade Court Roster Archive contribution, Jade Court Provision Satchel contribution, Jade Court Care Cycle contribution, Jade Temperament Concord contribution, Jade Field Almanac contribution, Jade Route Ecology Survey contribution, Jade Encounter Atlas contribution, Jade Court Craft Writ contribution, Jade Exchange Accord contribution, Jade Relic Attunement contribution, Jade Cloudbell Waystone contribution, Jade Moonwell Nurture Rite contribution, Jade Teahouse Recovery contribution, Jade Kinship Album contribution, Jade Nursery Grove contribution, Jade Bloom Ascendance contribution, Jade Lineage Register contribution, Jade Capture Rite contribution, Jade Dojo Ladder contribution, Jade Banner Tournament contribution, Jade Rival Circle contribution, Jade Sifu Council contribution, Jade Summit Circuit contribution, Jade Court Commission Ledger contribution, Jade Courtyard Rally contribution, Jade Scroll Story Chapter contribution, Jade Insignia Case contribution, Jade Wayfarer Chronicle contribution, Jade Court Ascension Trial contribution, bond, unique bond milestones, growth, Moonwell Bloom Rite eligibility, journal, care action, technique mastery, battle tactic scroll eligibility, Jade Step Loadout contribution, Jade Technique Codex contribution, Jade Heart Trait Attunement eligibility, Jade Mirror Condition Weave contribution, guild rank trial contribution, affinity trial eligibility, Triune Jade Harmony contribution, Jade Echo Concord social battle contribution, Jade Mirror Team Match contribution, Silk Banner Mentor Drill contribution, guild relation, and optional Canary certificate eligibility in code.
- Jade Affinity Matrix: content-only party strategy proof that preserves each spirit's affinity identity, condition IDs, no-injury battle readiness, and Jade Affinity Matrix Seal no-real-value reward until a dedicated runtime visual is generated.
- Jade Exchange Accord: content-only social economy proof that preserves fixed market, direct trade, provision, craft, two-tester presence, and Jade Exchange Accord Tally no-real-value reward until a dedicated runtime visual is generated.
- Jade Relic Attunement: content-only held-charm proof that preserves full-party readiness, Jade Thread Charm, Lantern Harmony Tea, provision, craft, exchange, care, temperament, and Jade Relic Silk Cord no-real-value reward until a dedicated runtime visual is generated.
- Jade Starter Vow: content-only first-companion proof that preserves selected spirit identity, Mochirii Guild Seal input, social readiness, and Jade Starter Knot no-real-value reward until a dedicated ritual visual is generated.
- Guild objects: Mochirii Guild Seal chest, spirit invitation and Jade Court Habitat Bond grove, Jade Court Sanctuary Bell care shrine, Mochi Spirit field journal, Jade Court Research Folio, Jade Court Spirit Compendium pavilion, Jade Roster Archive Seal proof, Jade Care Cycle Knot proof, Jade Temperament Charm proof, Jade Field Almanac Clasp proof, Jade Route Ecology Map proof, content-only Jade Encounter Atlas proof, Jade Court Craft Writ proof, content-only Jade Exchange Accord Tally proof, content-only Jade Relic Silk Cord proof, Jade Waystone Travel Seal proof, Jade Moonwell Nurture Ribbon proof, content-only Jade Teahouse Recovery Cup proof, content-only Jade Kinship Album proof, content-only Jade Nursery Sprout proof, content-only Jade Bloom Ascendance Sigil proof, content-only Jade Lineage Register Seal proof, content-only Jade Capture Rite proof, content-only Jade Dojo Ladder Seal proof, Jade Banner Tournament Pennant proof, content-only Jade Rival Circle Mark proof, content-only Jade Sifu Council Crest proof, content-only Jade Summit Circuit Laurel proof, content-only Jade Scroll Story Chapter proof, content-only Jade Insignia Case proof, and content-only Jade Technique Codex Seal proof, Moonbridge/Cloudbell expedition gate, route invitation altar with clear field accord and route patrol feedback, technique mastery dojo, tactic scroll stand, affinity trial dais, party formation and Triune Jade Harmony banner, Jade Echo Concord tally proof, Jade Mirror Match ribbon proof, Silk Banner Mentor Seal proof, Jade Heart Trait Thread proof, Jade Mirror Condition Charm proof, Jade Court Commission Knot proof, Jade Wayfarer Chronicle Clasp proof, Jade Court Ascension Ribbon proof, no-injury spirit training ring, Mochirii quest-chain and Jade Court Commission Ledger board, guild rank trial bell, Moonwell Bloom Rite shrine, Jade Thread Charm and Jade Court Provision Satchel market board, direct trade post, and Canary shrine.
- Town: Jade Lantern Court with readable path/water/wall zones, guild garden, spirit habitat cues, lanterns, bridge, market/trade landmarks, and Canary staging area.
- HUD: warm glass panels, jade/timber accents, readable text over art, visible focus states, and non-color-only status labels.

## Prompt Template

```text
Mochirii High-Fidelity Wuxia 2D game asset for Mochi Social, smooth illustrated finish, soft lantern lighting, jade, lacquer, silk, paper, and gold materials, transparent background for sprites or cohesive world-art background for tiles, clear gameplay silhouette, no baked-in text, no logos, no third-party visual reference dependency, no production value implication, alpha no-real-value game asset.
```

Append the specific asset role, color identity, animation frame needs, source-master dimensions, runtime dimensions, and care/market/trade/Canary constraints. Record the prompt in the source card under `assets/source/game/hd/` and summarize the asset in `docs/asset-ledger.md`.

## Accessibility Gates

- HUD text sits on semi-opaque backing and remains readable over the map.
- Interactive objects use shape, contrast, and placement, not color alone.
- Walkable paths, blocked areas, and interactable objects are distinguishable in first-screen review without debug labels.
- Buttons, inputs, and focus states remain keyboard-usable.
- Avoid flickering, noisy texture density, and fine detail that blurs at runtime scale.

## Done

- Runtime PNGs match the 64px tile and 128x192 frame contracts.
- First screen reads as Jade Lantern Court, not a debug map.
- Sifu Narao, guild seal chest, Mochi Spirits, habitat grove, journal pavilion, expedition gate, route invitation altar with field accord state, technique dojo, tactic scroll stand, affinity dais, party banner, Jade Echo Concord tally proof, Jade Mirror Match ribbon proof, training ring, quest board, guild rank bell, growth moonwell, market board, trade post, and Canary shrine are visually recognizable at gameplay zoom.
- `docs/asset-ledger.md` records every runtime asset, dimensions, source card, generation status, and license.
