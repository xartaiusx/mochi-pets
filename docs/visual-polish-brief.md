# Mochi Social Visual Polish Brief

This brief keeps visual work focused on Alpha Preview Ready. It improves the first playable town and HUD without changing production, provider settings, funded-chain gates, or the game/site repository split.

## Source Basis

- RPGJS reference repo: https://github.com/RSamaium/RPG-JS
- Tiled layers: https://doc.mapeditor.org/en/stable/manual/layers/
- Sharp image pipeline: https://sharp.pixelplumbing.com/
- Browser WebSockets: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- Vercel WebSocket limits: https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- Supabase Auth `getUser`: https://supabase.com/docs/reference/javascript/auth-getuser
- Enjin Fuel Tanks: https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com/full-list/

## Defaults

- Theme: Mochirii High-Fidelity Wuxia.
- Stop point: Alpha Preview Ready visual polish, not production.
- Website target: Mochirii Vercel Preview `/games/mochi-social`.
- Game target: Fly-compatible RPGJS runtime and local playable town.
- Chain target: Enjin Canary `configured-preview-stub`, no real value, no funded-chain gate clearing.

## Game Visual Direction

- First screen should read as Jade Lantern Court: a social guild town with Sifu Narao, Mochi Spirits, guild seal chest, habitat grove, journal pavilion, expedition gate, route invitation altar, technique dojo, tactic scroll stand, affinity dais, party banner, training ring, quest board, guild rank bell, growth moonwell, market board, trade post, and Canary shrine.
- Use smooth illustrated 2D with soft lantern lighting, jade/lacquer/gold/silk/paper materials, readable silhouettes, and modern polish.
- Keep collision and map object IDs stable unless tests and docs are updated in the same change.
- Keep the asset pipeline reproducible through `apps/game/scripts/generate-assets.mjs` and `npm run prepare-assets`.
- Follow `docs/game-art-bible.md` for the visual target and `docs/asset-pipeline-contract.md` for source/runtime rules.
- Runtime art uses 64x64 logical tiles and 128x192 sprite frames.

## HUD Direction

- Top status strip: title, guest/auth state, nearby testers, guild seal state, and no-real-value badge.
- Spirit card: active Mochi Spirit name, Jade Starter Vow proof, invited/captured roster proof, journal records, field route scouting, field accord proof, route invitation proof, route mastery proof, Jade Cloudbell route patrol proof, Jade Court Habitat Bond proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio proof, Jade Court Spirit Compendium proof, Jade Court Roster Archive proof, Jade Roster Cabinet proof, Jade Blossom Cradle proof, Jade Court Market Receipt proof, Jade Court Provision Satchel proof, Jade Provision Catalog proof, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Weather Veil proof, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone proof, Jade Route Charter proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Sifu Council proof, Jade Summit Circuit proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Quest Ledger proof, Jade Dialogue Scroll proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, technique mastery, tactic scroll proof, Jade Step Loadout proof, Jade Technique Codex proof, Jade Heart Trait Attunement proof, Jade Mirror Condition Weave proof, Jade Affinity Matrix proof, guild rank proof, Moonwell growth rite proof, affinity trial proof, party formation, Triune Jade Harmony proof, Jade Echo Concord proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, spar ladder progress, battle round transcript proof, bond, unique bond milestone, growth, training, raising, and quest progress.
- Bottom action bar: profile, guild, mood, starter, invite, attune, journal, scout, route invite with field accord proof, circuit, patrol, bond, research, codex, archive, cabinet, cradle, bag, catalog, kit, remedy, cycle, temper, almanac, ecology, veil, encounter atlas, census, craft, waystone, charter, nurture, recover, kinship album, nursery, ascendance, lineage, capture rite, ladder, bracket, rival, council, commission, rally, ledger, story, dojo, tactic, moves, technique codex, weave, matrix, trial, party, harmony, concord, match, mentor, care, train, spar, raise, inspect, quest, rank, bloom, wave, list, trade, Canary.
- The Jade Encounter Rotation proof uses the same compact encounter rotation HUD rhythm as the ecology and atlas buttons, with readable route-window, lure, and no-real-value state.
- The Jade Weather Veil proof uses the same compact route-condition HUD rhythm as ecology and rotation, with readable mist/rain/wind condition IDs and no-real-value chart state.
- The Jade Route Charter proof uses the same compact route charter HUD rhythm as waystone and nurture, with readable route, full-party, prerequisite proof, and no-real-value slip state.
- The Jade Roster Cabinet proof uses the same compact roster cabinet HUD rhythm as archive and lineage, with readable party-slot, reserve-label, and no-real-value tag state. The Jade Blossom Cradle proof should follow that blossom cradle rhythm with full-care, milestone, total-bond, and no-real-value ribbon state.
- Side/feed panel: local chat and recent action log.
- Preserve test hooks: `data-alpha-action`, `data-alpha-local-action`, `data-presence-label`, `data-chat-input`, and `data-alpha-feed`.
- Canary action copy must say preview stub, request staged, and no real value.

## Access And Provider Boundaries

- The website tester gate belongs in the separate Mochirii repo.
- Supabase privileged writes stay in Edge Functions; browser/game code must never receive service-role keys, secret keys, Discord bot tokens, Enjin tokens, Wallet Daemon seeds, or passphrases.
- Future Enjin work must use `network: CANARY`, transaction UUID/state tracking, `FINALIZED` finality before inventory credit, and no-real-value copy. Preview-stub chain actions never settle inventory.

## Acceptance

- Local checks pass: `npm run clean-room-scan`, `npm run secret-scan`, `npm run alpha:readiness`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
- Browser checks preserve two-tab presence, HUD actions, and no-real-value Canary stub behavior.
- The Jade Starter Vow, Jade Roster Cabinet proof, Jade Blossom Cradle proof, Jade Court Market Receipt proof, Jade Provision Catalog proof, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Quest Ledger proof, Jade Weather Veil proof, Jade Encounter Rotation proof, Jade Encounter Atlas, Jade Habitat Census, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Route Charter proof, Jade Teahouse Recovery, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Lineage Register, Jade Capture Rite, Jade Dojo Ladder proof, Jade Rival Circle, Jade Sifu Council proof, Jade Summit Circuit proof, Jade Battle Chronicle proof, Jade Affinity Matrix, Jade Technique Codex, and insignia case proofs are content-only and should keep the same compact HUD roster cabinet rhythm as nearby starter, market, bag, remedy, ecology, atlas, craft, relic, charter, nurture, rival, summit, battle chronicle, commission, quest ledger, story, and chronicle actions.
- `docs/asset-ledger.md` describes every generated asset, dimensions, source card, generation status, and license.
- Visual review confirms the town, HUD, and first-screen composition are coherent.
