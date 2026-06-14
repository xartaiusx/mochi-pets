# Mochi Social Implementation Brief

Mochi Social starts as a small multiplayer social RPG that can stand alone on Fly.io and later be embedded by a separate Vercel/Supabase website.

## First Playable

- One small town map named `mochi-town`.
- Guest-first multiplayer with visible second-player presence through RPGJS MMORPG mode.
- One NPC dialog for social flavor.
- One guild seal chest that grants a Mochirii Guild Seal, stores a player variable, and triggers a save slot.
- Three Mochi Spirits: Lirabao, Jintari, and Aozhen, with capture/invitation, attunement, 3/3 journal records, Moonbridge and Cloudbell field route scouting, Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accords, route spirit invitations, Jade Cloudbell route mastery, Jade Cloudbell two-tester route patrol, Jade Court Habitat Bond, Jade Court Sanctuary Rite, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive, Jade Court Provision Satchel, Jade Court Commission Ledger, Jade Courtyard Rally, Jade Wayfarer Chronicle, Jade Court Ascension Trial, technique mastery, battle tactic scroll planning, Jade Step Loadout move preparation, Jade Heart Trait Attunement, Jade Mirror Condition Weave, guild rank trial proof, Moonwell growth rite proof, affinity trials, party formation, Triune Jade Harmony, Jade Echo Concord social battle proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, deterministic no-injury battle round transcripts, spar ladder practice, bond/care/growth, per-spirit bond milestones, training battle, rotating care-streak raising actions, and a three-posting roleplay quest chain.
- One habitat grove for invitation and Jade Court Habitat Bond proof, one care shrine for Jade Court Sanctuary Rite proof, one journal pavilion, one expedition gate, one route invitation altar, one technique dojo, one tactic scroll stand, one affinity dais, one party banner for formation and harmony proof, one no-injury training ring, one quest board, one guild rank bell, and one growth moonwell that turn Mochi Spirit progression into in-world saved alpha actions.
- A compact HUD showing title, connection/auth mode, guild seal state, active spirit state, Jade Cloudbell route patrol proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive proof, Jade Court Provision Satchel progress, Jade Court Commission Ledger progress, Jade Courtyard Rally proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, technique loadout, trait attunement, condition weave, party harmony/concord/team-match/mentor proof, battle round transcript proof, market/trade proof, Canary certificate request, and Jade Vault return preview status.

## Agent Priorities

1. Preserve game/site separation.
2. Preserve fetch-only upstream.
3. Keep assets license-safe.
4. Keep the integration contract versioned and tested.
5. Verify with two local browser sessions after gameplay changes.
