# Mochi Social Implementation Brief

Mochi Social starts as a small multiplayer social RPG that can stand alone on Fly.io and later be embedded by a separate Vercel/Supabase website.

## First Playable

- One small town map named `mochi-town`.
- Guest-first multiplayer with visible second-player presence through RPGJS MMORPG mode.
- One NPC dialog for social flavor.
- One guild seal chest that grants a Mochirii Guild Seal, stores a player variable, and triggers a save slot.
- Three Mochi Spirits: Lirabao, Jintari, and Aozhen, with attunement, bond/care/growth, training battle, raising, journal, and roleplay quest state.
- A compact HUD showing title, connection/auth mode, guild seal state, active spirit state, market/trade proof, and Canary preview status.

## Agent Priorities

1. Preserve game/site separation.
2. Preserve fetch-only upstream.
3. Keep assets license-safe.
4. Keep the integration contract versioned and tested.
5. Verify with two local browser sessions after gameplay changes.
