# Mochi Social Implementation Brief

Mochi Social starts as a small multiplayer social RPG that can stand alone on Fly.io and later be embedded by a separate Vercel/Supabase website.

## First Playable

- One small town map named `mochi-town`.
- Guest-first multiplayer with visible second-player presence through RPGJS MMORPG mode.
- One NPC dialog for social flavor.
- One guild seal chest that grants a Mochirii Guild Seal, stores a player variable, and triggers a save slot.
- Three Mochi Spirits: Lirabao, Jintari, and Aozhen, with capture/invitation, attunement, 3/3 journal records, Moonbridge and Cloudbell field route scouting, Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accords, route spirit invitations, Jade Cloudbell route mastery, Jade Cloudbell two-tester route patrol, Jade Court Habitat Bond, Jade Court Sanctuary Rite, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive, Jade Court Provision Satchel, Jade Court Care Cycle, Jade Temperament Concord, Jade Field Almanac, Jade Route Ecology Survey, Jade Encounter Atlas, Jade Court Craft Writ, Jade Exchange Accord proof, Jade Cloudbell Waystone, Jade Moonwell Nurture Rite, Jade Teahouse Recovery, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Lineage Register, Jade Capture Rite, Jade Banner Tournament, Jade Rival Circle, Jade Sifu Council, Jade Court Commission Ledger, Jade Courtyard Rally, Jade Scroll Story Chapter, Jade Insignia Case, Jade Wayfarer Chronicle, Jade Court Ascension Trial, technique mastery, battle tactic scroll planning, Jade Step Loadout move preparation, Jade Technique Codex move-library proof, Jade Heart Trait Attunement, Jade Mirror Condition Weave, guild rank trial proof, Moonwell growth rite proof, affinity trials, party formation, Triune Jade Harmony, Jade Echo Concord social battle proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, deterministic no-injury battle round transcripts, spar ladder practice, bond/care/growth, per-spirit bond milestones, temperament identity proof, training battle, rotating care-streak raising actions, and a three-posting roleplay quest chain.
- Jade Exchange Accord proof links `trade.exchange_accord`, fixed-list market, direct trade, provision satchel, craft writ, two-tester presence, and the no-real-value Jade Exchange Accord Tally before Chronicle and Ascension proofs.
- Jade Affinity Matrix proof links the first party's affinities, battle conditions, affinity trial, move loadout, trait, condition weave, and no-injury battle evidence before Tournament, Rival Circle, Chronicle, and Ascension proofs.
- Jade Lineage Register proof links `spirit.lineage_register`, full roster/party/care, kinship album, nursery grove, bloom ascendance, capture rite, growth rite, raising milestones, training, spar, and the no-real-value Jade Lineage Register Seal before Chronicle and Ascension proofs.
- Jade Dojo Ladder proof links `battle.dojo_ladder`, full-party spar ladder clears, technique codex, condition weave, affinity matrix, team match, mentor drill, training, and no-injury battle transcript evidence before Tournament, Rival Circle, Chronicle, and Ascension proofs.
- Jade Sifu Council proof links `battle.sifu_council`, full-party readiness, three council member clears, dojo ladder, tournament, rival, technique codex, condition weave, affinity matrix, mentor drill, rank, route patrol, social readiness, and no-injury battle transcript evidence before Chronicle and Ascension proofs.
- One habitat grove for invitation and Jade Court Habitat Bond proof, one care shrine for Jade Court Sanctuary Rite proof, one journal pavilion, one expedition gate, one route invitation altar, one technique dojo, one tactic scroll stand, one affinity dais, one party banner for formation and harmony proof, one no-injury training ring, one quest board, one guild rank bell, and one growth moonwell that turn Mochi Spirit progression into in-world saved alpha actions.
- A compact HUD showing title, connection/auth mode, guild seal state, active spirit state, Jade Cloudbell route patrol proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive proof, Jade Court Provision Satchel progress, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Encounter Atlas proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Cloudbell Waystone proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Court Commission Ledger progress, Jade Courtyard Rally proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, technique loadout, technique codex, trait attunement, condition weave, party harmony/concord/team-match/mentor proof, battle round transcript proof, market/trade proof, Canary certificate request, and Jade Vault return preview status.
- The HUD includes a `battle.affinity_matrix` quick action and Matrix label for the no-real-value Jade Affinity Matrix Seal proof.
- The HUD includes a `battle.technique_codex` quick action and Technique Codex label for the no-real-value Jade Technique Codex Seal proof.
- The HUD includes a `spirit.bloom_ascendance` quick action and Ascendance label for the no-real-value Jade Bloom Ascendance Sigil proof.
- The HUD includes a `spirit.lineage_register` quick action and Lineage label for the no-real-value Jade Lineage Register Seal proof.
- The HUD includes a `battle.dojo_ladder` quick action and Jade Dojo Ladder label for the no-real-value Jade Dojo Ladder Seal proof.
- The HUD includes a `battle.sifu_council` quick action and Jade Sifu Council label for the no-real-value Jade Sifu Council Crest proof.

## Agent Priorities

1. Preserve game/site separation.
2. Preserve fetch-only upstream.
3. Keep assets license-safe.
4. Keep the integration contract versioned and tested.
5. Verify with two local browser sessions after gameplay changes.
