# Mochi Social Source Art Prompts

These notes document the original project-authored prompt basis for the Alpha Preview visual upgrade. Runtime assets are exported by `apps/game/scripts/generate-assets.mjs`.

## Master Prompt

```text
High-fidelity source intent for a crisp Cozy Wushu 2D RPG asset for Mochi Social, exported as a small readable pixel-kit runtime asset, top-down 2D RPG clarity, Kenney-informed compact silhouette clarity, dusk lantern lighting, jade green and red timber palette, warm gold rim light, soft contact shadow, clear silhouette at gameplay zoom, no text, no logos, no real-world brands, alpha preview no-real-value game asset.
```

## Kenney Reference Basis

The current refresh uses Kenney's official free asset catalog as a readability reference, especially Tiny Town, RPG-tagged packs, UI Pack, and Input Prompts. No Kenney files are copied, traced, downloaded into runtime, vendored, or required at runtime. The source analysis lives in `docs/kenney-reference-analysis.md`.

## HD Source Export Basis

The active pass uses `assets/source/game/hd-source-export.md`: design each asset with a high-detail source intent, then export down into crisp 32px/96x192 runtime PNGs with clean value groups, fewer noisy textures, strong outlines, and obvious interaction cues.

## Runtime Asset Set

- Town tilesheet: cozy hidden Wushu guild town tiles with crisp kit clarity, calmer grass, stronger path/water/wall separation, readable landmark zones, lanterns, bridge, shrine stone, market/trade landmarks, and soft shadows.
- Player avatar: friendly guild tester in warm Wushu travel robes, chunky readable walk/idle frames, no brand marks.
- Welcome NPC: jade-robed local guild friend, warm posture, readable small silhouette and stronger robe contrast.
- Momo Mochi Spirit: blush companion spirit, gentle temperament, soft glow, rounded silhouette.
- Yuzu Mochi Spirit: gold companion spirit, bright temperament, citrus glow, distinct ears and outline.
- Sora Mochi Spirit: sky-blue companion spirit, curious temperament, airy glow, distinct crest.
- Chest: lacquered alpha reward chest with stronger bevel, gold trim, contact shadow, no real-money cue.
- Market board: fixed-price test market board with parchment shapes, lantern glow, no readable text.
- Trade post: direct-trade preview post with jade cloth, exchange tokens as abstract shapes, no real-value cue.
- Canary shrine: Canary preview shrine with jade/gold crystal, stronger crystal silhouette, soft glow, no production/mainnet value cue.
