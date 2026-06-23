# Mochi Social Alpha RC Goal

Current direction note: Unity WebGL shared-room development supersedes the older RPGJS 2D feature-parity language in this file. For the next alpha path, target one `JadeLanternRoom`, three curated presets, one shared Lirabao pet, UGS Distributed Authority, Cloud Save, Cloud Code, and the Mochirii iframe bridge. Treat RPGJS-specific language below as rollback/reference until it is intentionally retired from scripts and docs.

## Objective

Build Mochi Social into a closed, no-real-value, Enjin Canary alpha release candidate. The alpha is a 2D RPGJS Mochi Spirits social vertical slice with Supabase-backed state, Enjin hot/cold ownership proof for selected rare assets, fixed-price/direct trade, Mochirii preview embed, admin allowlist, tester terms, and full verification.

There are two stop points:

- Alpha Preview Ready: the Fly game is live through the Mochirii Vercel Preview, Supabase allowlist/terms/feedback work, and Enjin is visible as `configured-preview-stub`.
- Alpha RC Ready: the preview gates plus funded Enjin Canary collection, Fuel Tank, Wallet Daemon signing, and finalized proof smoke are complete.

Stop at Alpha RC Ready for the full goal. Do not deploy production, do not use Enjin mainnet, do not enable real-money value, do not open UGC uploads, and do not perform any action that can add charges to connected accounts without explicit user approval for that exact action.

Recommended slash goal:

```text
/goal Execute docs/goals/mochi-social-alpha-rc.md. Build Mochi Social into a fully playable closed Alpha Preview first, then Alpha RC: original Mochirii feature parity for the restricted upstream monster-RPG scope with no copied code, names, lore, maps, dialogue, filenames, assets, project names, character names, town names, item names, or visual derivatives; high-fidelity wuxia Mochi Spirits branding; multiplayer-social RPGJS/Tiled gameplay; Supabase/Discord/Vercel/Fly integration; Enjin Canary configured-preview-stub/no-real-value; tester-password Mochirii page embedding; local clean-room, responsive gameplay, local site-iframe, input-scroll, visual, build, and evidence verification before hosted/provider action. Stop before production/mainnet, funded Enjin, paid resources, or provider mutation unless explicitly approved for that exact action.
```

## Source Basis

- RPGJS: browser RPG/MMORPG runtime, maps, events, inventory, save/load, multiplayer presence, and server-owned gameplay state.
- Enjin Platform: GraphQL API, managed wallets, Wallet Daemon signing, Fuel Tanks, marketplace listings, Canary testnet, and hot/cold inventory guidance.
- Supabase: Auth JWTs, `getUser(jwt)` validation, Postgres/RLS, Edge Functions, and short-lived access tokens from the parent site.
- Fly.io: long-running WebSocket game runtime and persistent volumes for runtime state.
- Vercel/Next.js: website shell, public env var for the game URL, preview deployments, and no game WebSocket server in serverless functions.
- GitHub: branch protection, PR checks, and required CI before merge.
- WCAG/MDN/Playwright: responsive reflow, non-obstructive fixed UI, focused gameplay input ownership, touch/overscroll containment, and reproducible screenshot/runtime viewport checks.
- Second Life and IMVU: social presence, identity, creator/economy inspiration; alpha stays curated and closed.
- MDA and Self-Determination Theory: prioritize autonomy, competence, relatedness, fellowship, expression, discovery, and a small repeatable loop.

## Implementation Order

1. Game repo contracts and docs.
   - Update `AGENTS.md`, `docs/site-integration.md`, `docs/deployment.md`, `docs/asset-ledger.md`, and this goal file.
   - Preserve routes: `/healthz`, `/play`, `/embed`, `/integration/game-manifest.json`.
   - Extend the manifest with alpha, economy, chain, market, and UGC flags.

2. Game vertical slice.
   - Keep RPGJS 2D.
   - Add one cozy town plus one visible habitat area.
   - Add three original Mochi Spirit companions.
- Implement Jade Starter Vow first-companion proof, attunement, Mochi Spirit journal records, Moonbridge/Cloudbell field route scouting, Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accord proofs, route spirit invitations for Jintari and Aozhen, Jade Cloudbell route mastery proof, Jade Cloudbell two-tester route patrol proof, Jade Court Habitat Bond proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio proof, Jade Court Spirit Compendium proof, Jade Court Roster Archive proof, Jade Roster Cabinet proof, Jade Blossom Cradle proof, Jade Court Provision Satchel proof, Jade Provision Catalog proof, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Weather Veil proof, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone proof, Jade Route Charter proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Dojo Ladder proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Summit Circuit proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Quest Ledger proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, technique mastery, battle tactic scroll planning, Jade Step Loadout proof, Jade Technique Codex proof, Jade Heart Trait Attunement proof, Jade Mirror Condition Weave proof, guild rank trial proof, spirit growth rite proof, no-injury affinity trials, party formation, Triune Jade Harmony proof, Jade Echo Concord social battle proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, no-injury spar ladder practice, care, no-injury training battles, raising, per-spirit bond milestone proof, first-chain roleplay quest progress, temperament identity proof, bond/growth, profile/status HUD, inspect spirit, local chat UI, emotes/status actions, fixed market board, direct trade proof, Enjin Canary certificate request proof, Jade Vault return preview proof, and Canary finality no-credit review proof.
   - Record the Jade Weather Veil proof before the Jade Encounter Rotation: route-condition planning, moonlit mist, goldleaf rain, skybell crosswind, route ecology, field accord, field almanac, route patrol, social witness, and a no-real-value Jade Weather Veil Chart.
   - Record the Jade Encounter Rotation proof before the Jade Encounter Atlas: route-window planning, lure items, route ecology, weather veil, field accord, field almanac, capture rite, social witness, and a no-real-value Jade Encounter Rotation Scroll.
   - Record the Jade Habitat Census proof after the Jade Encounter Atlas: full first-court observations, care logs, route coverage, encounter atlas, route ecology, weather veil, compendium, care cycle, social witness, and a no-real-value Jade Habitat Census Seal before Chronicle and Ascension capstones.
   - Record Jade Provision Catalog proof as original Mochirii item recipe parity: `item.provision_catalog`, full roster, provision satchel, market receipt, direct trade, craft writ, recovery tea, care cycle, habitat census, route/care/stocked item IDs, two-tester presence, and Jade Provision Catalog Seal no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Battle Kit proof as original Mochirii battle-item kit parity: `item.battle_kit`, full roster, first-party setup, Jade Provision Catalog, Jade Technique Codex, Jade Mirror Condition Weave, Jade Affinity Matrix, Jade Teahouse Recovery, kit item IDs, no-injury battle round, two-tester witness, `battleKitProof`, and Jade Battle Kit Tag no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Remedy Pouch proof as original Mochirii remedy/status item parity: `item.remedy_pouch`, full roster, first-party setup, Lantern Ward/Goldleaf Tempo/Skybell Guard condition IDs, Lantern Harmony Tea/Jade Thread Charm/Jade Mooncake Box remedy item IDs, Jade Teahouse Recovery, Jade Battle Kit, Jade Court Care Cycle, Jade Court Sanctuary Rite, no-injury battle round, two-tester witness, `remedyPouchProof`, and Jade Remedy Pouch Tag no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Quest Ledger proof as original Mochirii roleplay quest parity: `quest.ledger_record`, all three accepted and completed first-court quest postings, full roster, 3/3 journal, route mastery, route patrol, market receipt, provision satchel, commission ledger, two-tester rally, `questLedgerProof`, and Jade Quest Ledger Seal no-real-value proof before Story, Chronicle, and Ascension capstones.
   - Record Jade Exchange Accord proof as original Mochirii social economy parity: `trade.exchange_accord`, fixed-list market, direct trade, provision satchel, craft writ, two-tester presence, and Jade Exchange Accord Tally no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Affinity Matrix proof as original Mochirii party strategy parity: full-party affinities, Jade Mirror battle conditions, affinity trial, move loadout, trait, condition weave, no-injury battle round, training, and social readiness before Tournament, Rival Circle, Chronicle, and Ascension capstones, with the Jade Affinity Matrix Seal kept no-real-value.
   - Record Jade Bloom Ascendance proof as original Mochirii roster-growth parity: `spirit.bloom_ascendance`, full roster/party/care, nursery, nurture, kinship, growth, affinity matrix, training, spar, and social readiness before Capture Rite, Chronicle, and Ascension capstones, with the Jade Bloom Ascendance Sigil kept no-real-value.
   - Record Jade Lineage Register proof as original Mochirii lineage/evolution parity: `spirit.lineage_register`, full roster/party/care, kinship album, nursery grove, bloom ascendance, capture rite, care cycle, growth rite, raising milestone, training, spar, and social readiness before Chronicle and Ascension capstones, with the Jade Lineage Register Seal kept no-real-value.
   - Record Jade Roster Cabinet proof as original Mochirii storage and party organization parity: `spirit.roster_cabinet`, full roster, three party slots, reserve storage labels, Jade Court Roster Archive, Jade Court Spirit Compendium, Jade Nursery Grove, Jade Lineage Register, two-tester social readiness, `rosterCabinetProof`, and Jade Roster Cabinet Tag no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Blossom Cradle proof as original Mochirii nursery continuity parity: `spirit.blossom_cradle`, full roster, three party slots, three care IDs, three raising milestone labels, total bond 15, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Lineage Register, Jade Moonwell Nurture Rite, Moonwell Bloom Rite, Jade Court Care Cycle, two-tester social readiness, `blossomCradleProof`, and Jade Blossom Cradle Ribbon no-real-value proof before Chronicle and Ascension capstones.
   - Record Jade Bond Gift Rite proof as original Mochirii care-gift parity: `item.bond_gift`, full roster, Jade Court Market Receipt, Jade Court Provision Satchel, Jade Court Care Cycle, Jade Mooncake Box, Lantern Harmony Tea, Jade Thread Charm, two-tester witness, profile/guild/status/chat readiness, `bondGiftProof`, and Jade Bond Gift Ribbon no-real-value proof.
   - Record Jade Name Banner Rite proof as original Mochirii spirit-identity parity: `spirit.name_banner`, full roster, Lirabao Lanternheart, Jintari Goldleaf Step, Aozhen Skybell Veil, 3/3 journal identity records, Jade Court Spirit Compendium, Jade Court Roster Archive, Jade Roster Cabinet, Jade Bond Gift Rite, two-tester witness, profile/guild/status/chat readiness, `nameBannerProof`, and Jade Name Banner Tag no-real-value proof.
   - Organize Jade Roster Cabinet proof before the guild capstones so tester storage, party slots, reserve labels, nursery readiness, and lineage readiness are all represented by original Mochirii data.
   - Record Jade Dojo Ladder proof as original Mochirii no-injury battle-ladder parity: `battle.dojo_ladder`, full-party clears, technique codex, condition weave, affinity matrix, team match, mentor drill, training, and battle transcript evidence before Tournament, Rival Circle, Chronicle, and Ascension capstones, with the Jade Dojo Ladder Seal kept no-real-value.
   - Record Jade Sifu Council proof as original Mochirii guild-leader parity: `battle.sifu_council`, full-party clears, Sifu Narao/Warden Meilin/Keeper Haoran council member proof, dojo ladder, Jade Banner Tournament, Jade Rival Circle, technique codex, condition weave, affinity matrix, mentor drill, battle transcript, route patrol, rank, and social readiness before Chronicle and Ascension capstones, with the Jade Sifu Council Crest kept no-real-value.
- Record Jade Summit Circuit proof as original Mochirii summit parity: `battle.summit_circuit`, full-party clears, four summit seals, dojo ladder, Jade Banner Tournament, Jade Rival Circle, Jade Sifu Council, harmony, concord, team match, mentor drill, battle transcript, route patrol, rank, growth, and two-tester social readiness before Battle Chronicle, Chronicle, and Ascension capstones, with the Jade Summit Circuit Laurel kept no-real-value.
- Record Jade Battle Chronicle proof as original Mochirii no-injury battle-history parity: `battle.battle_chronicle`, full-party clears, dojo ladder, Jade Banner Tournament, Jade Rival Circle, Jade Sifu Council, Jade Summit Circuit, Jade Technique Codex, Jade Mirror Condition Weave, Jade Affinity Matrix, Jade Remedy Pouch, battle transcript, and two-tester witness, with the Jade Battle Chronicle Seal kept no-real-value.
   - Store local fallback alpha events as no-real-value audit lines when Supabase Edge is not configured.

3. Game backend integrations.
   - Add a scoped Supabase Edge Function client that calls Mochirii functions with `MOCHI_SOCIAL_GAME_SERVER_TOKEN`.
   - Add Enjin Canary orchestration helpers for managed-wallet creation, hot-to-cold mint, cold-to-hot burn, fixed listing creation, and finality checks.
   - Never credit hot inventory until a cold-to-hot burn is finalized.
   - Never hold a Supabase service-role key or Enjin Wallet Daemon seed in the game repo/client.

4. Mochirii repo integration.
   - Add Supabase migrations and Edge Functions for allowlist, terms, game action recording, chat/report handling, market/trade actions, chain operation recording, admin grant/revoke/list, and feedback.
   - Add `/games/mochi-social` preview route using `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
   - Add required alpha acknowledgement before embedding.
   - Add leader/admin controls for alpha access and audit visibility.

5. Verification and handoff.
   - Run game install/typecheck/lint/test/build/smoke.
   - Run `npm run alpha:local-suite` for the local no-cost bundled RC pass.
   - Run `npm run alpha:responsive-gameplay` whenever HUD/gameplay layout or input handling changes, and treat failures as Alpha Preview blockers.
   - Run `npm run alpha:local-site-iframe` before Alpha Preview Ready to prove the built game works inside the local Mochirii tester-password page, the unlocked `/games/mochi-social` iframe passes all nine responsive gameplay viewports, and movement/action keys do not scroll the browser or parent page.
   - Run `npm run alpha:local-evidence` to validate and summarize the ignored localhost evidence reports.
   - Run `npm run alpha:operator-checklist`, refresh `npm run alpha:external-gates`, stamp a current `npm run alpha:rc-audit` report, then run `npm run alpha:sync-approval` and `npm run alpha:report-hygiene` to summarize blocked approval steps and scan local evidence plus no-secret handoff artifacts for accidental secret leakage.
   - Run `npm run alpha:preview-ready` after approved hosted preview checks to prove the tester-entry stop point separately from later funded-chain Alpha RC gates.
   - Run local alpha acceptance against a started game server with `npm run alpha:local-acceptance`.
   - Run 10-25 tester HTTP contract load smoke with `npm run alpha:load-smoke` locally by default. Hosted load smoke requires explicit user approval.
- Run the two-tab browser presence smoke with `npm run alpha:browser-presence` to prove Unity canvas presence, movement signatures, observer-side shared-room pulse evidence, Lirabao contract evidence, and absence of legacy HUD/future-economy copy; then complete the manual Unity character creation, Lirabao care, and saved-progress prompt check.
- Run the responsive gameplay smoke with `npm run alpha:responsive-gameplay` to prove `/play`, `/embed`, synthetic parent-iframe gameplay, and, when `MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL` is configured, the real Mochirii `/games/mochi-social` iframe stay usable across the alpha viewport matrix, with no horizontal overflow, incoherent HUD panel overlap, central gameplay safe-area obstruction, unreachable action controls, invisible focus, editable-chat key capture regressions, or movement/action keys scrolling the browser or parent page.
- Run the local Mochirii tester-page iframe smoke with `npm run alpha:local-site-iframe` after major HUD, layout, input, embed, tester-password, or build-server changes. Use `MOCHI_SOCIAL_TESTER_PASSWORD` for the real local tester gate or `MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD` for a throwaway local-only password; the command writes no-secret `reports/alpha-local-site-iframe.json`, dedicated `reports/alpha-site-iframe-responsive.json`, and ignored screenshots under `reports/responsive-site-iframe/`.
   - The same browser presence proof must include `trade.exchange_accord`, the Exchange HUD label, Jade Exchange Accord Tally state, and preserved `exchangeAccordProof` for the later guild capstones.
   - The same browser presence proof must include `world.route_charter`, the Charter HUD label, Jade Route Charter Slip state, and preserved `routeCharterProof` for the later guild capstones.
   - The same browser presence proof must include `world.weather_veil`, the Weather Veil HUD label, Jade Weather Veil Chart state, and preserved `weatherVeilProof` before `world.encounter_rotation`, the Rotation HUD label, Jade Encounter Rotation Scroll state, and preserved `encounterRotationProof` for the Jade Encounter Atlas.
   - The same browser presence proof must include `spirit.habitat_census`, the Census HUD label, Jade Habitat Census Seal state, and preserved `habitatCensusProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `item.provision_catalog`, the Catalog HUD label, Jade Provision Catalog Seal state, and preserved `provisionCatalogProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `item.battle_kit`, the Kit HUD label, Jade Battle Kit Tag state, and preserved `battleKitProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `item.remedy_pouch`, the Remedy HUD label, Jade Remedy Pouch Tag state, and preserved `remedyPouchProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `item.bond_gift`, the Gift HUD label, Jade Bond Gift Ribbon state, and preserved `bondGiftProof` as no-real-value care-gift evidence.
   - The same browser presence proof must include `spirit.name_banner`, the Name Banner HUD label, Jade Name Banner Tag state, preserved `nameBannerProof`, and all three original first-court title records.
   - The same browser presence proof must include `quest.ledger_record`, the Quest Ledger HUD label, Jade Quest Ledger Seal state, `story.dialogue_scroll`, the Dialogue HUD label, Jade Dialogue Scroll Seal state, and preserved `questLedgerProof` plus `dialogueScrollProof` for the Jade Scroll Story Chapter, Jade Wayfarer Chronicle, and Jade Court Ascension Trial.
   - The same browser presence proof must include `spirit.roster_cabinet`, the Jade Roster Cabinet HUD label, Jade Roster Cabinet Tag state, and preserved `rosterCabinetProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `spirit.blossom_cradle`, the Jade Blossom Cradle HUD label, Jade Blossom Cradle Ribbon state, and preserved `blossomCradleProof` for the Jade Wayfarer Chronicle and Jade Court Ascension Trial.
   - The same browser presence proof must include `battle.affinity_matrix`, the Matrix HUD label, Jade Affinity Matrix Seal state, and preserved `affinityMatrixProof` for the later battle and guild capstones.
   - Run `npm run alpha:visual-snapshot` to capture ignored local first-screen page/canvas PNGs for visual review.
   - Run `npm run alpha:visual-review` to tie screenshot hashes, two-tab presence, Unity canvas evidence, Lirabao contract, input guard evidence, and absence of legacy/future-economy copy into ignored local review artifacts while preserving character creation, Lirabao care, and saved-progress interaction as a manual gate.
   - Run `npm run alpha:manual-prompt-review` after a local operator/browser review confirms Unity character creation, the Lirabao care prompt, and saved progress across reload/logout/login. The command writes a pending report until explicit prompt-confirmation env vars are set.
   - Run `npm run alpha:wallet-daemon-check` to verify only local Wallet Daemon binary metadata, hash, and help output without importing wallets, printing seeds, starting signers, contacting Enjin, funding Fuel Tanks, or submitting chain transactions.
   - Run the private Enjin operator route smoke with `npm run alpha:enjin-operator-smoke`.
   - Run site checks, app lint/build, Supabase function type checks, and static secret scans.
   - Document preview deploy commands and external setup steps for Fly, Vercel, Supabase, Enjin Platform, Fuel Tank, and Wallet Daemon, with no-cost gates for every provider action.
   - Require `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` for any approved `npm run alpha:external-gates` pass that fetches hosted Fly/Vercel contract URLs.
   - Require `reports/alpha-external-gates.json` to carry current Git state and the hosted-check approval flag before `npm run alpha:rc-audit` can treat it as provider evidence.
   - Require `reports/alpha-sync-approval.json` to reference the current external-gates report checkedAt/HEAD/hosted approval state before `npm run alpha:rc-audit` can treat it as the approval packet.

## Alpha Preview Ready Lane

For the next development pass, optimize for [`docs/alpha-preview-ready.md`](alpha-preview-ready.md):

- `preview-live-gates` must pass before testers: Fly game URL, Mochirii Vercel Preview route, `NEXT_PUBLIC_MOCHI_SOCIAL_URL`, Supabase allowlist/terms/feedback, iframe auth, no-real-value labels, and approved hosted contract checks.
- Local tester-entry proof must include current `npm run alpha:local-site-iframe` evidence for the Mochirii `/games/mochi-social` iframe across the nine viewport matrix before any hosted preview deploy or tester entry is treated as ready.
- `funded-chain-gates` may remain red: cENJ, collection ID, Fuel Tank ID, Wallet Daemon signing, and finalized Enjin proof.
- Do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`.
- Keep the Canary request, Jade Vault return preview, and Canary finality review UI visible and explain `configured-preview-stub`.
- Record chain requests, return previews, and finality reviews as no-real-value audit-only preview records until real finality exists.

## Public Contract

- Manifest flags:
  - `auth.required`
  - `alpha.allowlistRequired`
  - `alpha.termsRequired`
  - `economy.mode = "test-soft-currency"`
  - `chain.provider = "enjin"`
  - `chain.network = "CANARY"`
  - `market.fixedPrice = true`
  - `market.auctions = false`
  - `ugc = "curated"`
- Website env:
  - `NEXT_PUBLIC_MOCHI_SOCIAL_URL`
- Game/Fly env:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_AUTH_REQUIRED`
  - `MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL`
  - `MOCHI_SOCIAL_GAME_SERVER_TOKEN`
  - `ENJIN_PLATFORM_URL`
  - `ENJIN_PLATFORM_TOKEN`
  - `ENJIN_NETWORK=CANARY`
  - `ENJIN_COLLECTION_ID`
  - `ENJIN_FUEL_TANK_ID`
  - `RPG_ALLOWED_ORIGINS`

## Acceptance Criteria

- Two browser tabs show player presence.
- A tester can attune one Mochi Spirit, record 3/3 discovered spirit journal details, scout Moonbridge and Cloudbell field routes, clear Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accords, invite those routes' Jintari and Aozhen encounter spirits, record Jade Cloudbell route mastery, record Jade Cloudbell two-tester route patrol, record Jade Court Habitat Bond, record the Jade Court Sanctuary Rite, record the Jade Court Research Folio, seal the Jade Court Spirit Compendium, record the Jade Court Roster Archive, record the Jade Roster Cabinet, record the Jade Blossom Cradle, stock the Jade Court Provision Satchel, record the Jade Provision Catalog, record the Jade Battle Kit proof, record the Jade Remedy Pouch proof, record the Jade Court Care Cycle, record the Jade Temperament Concord, record the Jade Field Almanac, record the Jade Route Ecology Survey, record the Jade Weather Veil proof, record the Jade Encounter Atlas proof, record the Jade Habitat Census proof, record the Jade Court Craft Writ, record the Jade Exchange Accord proof, record the Jade Relic Attunement proof, activate the Jade Cloudbell Waystone, record the Jade Route Charter proof, seal the Jade Moonwell Nurture Rite, record the Jade Teahouse Recovery proof, record the Jade Kinship Album proof, record the Jade Nursery Grove proof, record the Jade Bloom Ascendance proof, record the Jade Capture Rite proof, clear the Jade Banner Tournament, clear the Jade Rival Circle, record the Jade Court Commission Ledger, record the two-tester Jade Courtyard Rally, record the Jade Quest Ledger, record the Jade Scroll Story Chapter, seal the Jade Insignia Case proof, record the Jade Wayfarer Chronicle, record the Jade Court Ascension Trial, practice one technique mastery action, study one battle tactic scroll, prepare the Jade Step Loadout, seal the Jade Technique Codex, attune the Jade Heart party trait, weave Jade Mirror non-injury battle conditions, record one Jade Court guild rank trial proof, open one Moonwell Bloom growth rite proof, complete or study one no-injury affinity trial, form a three-spirit party, record Triune Jade Harmony, clear Jade Echo Concord as a no-injury social battle proof, clear Jade Mirror Team Match as a no-injury full-party spar proof, clear Silk Banner Mentor Drill as a no-injury party readiness proof, practice a no-injury spar ladder, care for it, train in a no-injury guild spar, complete one raising action, open or inspect a per-spirit bond milestone, complete the First Lantern Vow/Silk Market Kindness/Skybell Spar roleplay quest chain, increase bond, unlock a growth state, and see status in the HUD.
- A tester can use local chat/emote UI and see actions recorded locally or through Supabase Edge, including no-injury Jade Banner Tournament proof, Jade Rival Circle proof, Jade Scroll Story Chapter proof, and Jade Insignia Case proof.
- A tester can record the no-real-value Jade Affinity Matrix proof and see it feed the Jade Banner Tournament, Jade Rival Circle, Jade Wayfarer Chronicle, and Jade Court Ascension Trial readiness checks.
- A tester can record the no-real-value Jade Relic Attunement proof and see the Jade Relic Silk Cord feed the Jade Summit Circuit, Jade Wayfarer Chronicle, and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Encounter Rotation as a no-real-value Jade Encounter Rotation proof and see it feed the Jade Encounter Atlas readiness checks.
- A tester can record the Jade Weather Veil as a no-real-value Jade Weather Veil proof and see it feed the Jade Encounter Rotation and Jade Encounter Atlas readiness checks.
- A tester can record the Jade Habitat Census as a no-real-value Jade Habitat Census proof and see it feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Provision Catalog as a no-real-value Jade Provision Catalog proof and see it feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Battle Kit proof with `item.battle_kit`, keep the Jade Battle Kit Tag no-real-value, and see `battleKitProof` feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Remedy Pouch proof with `item.remedy_pouch`, keep the Jade Remedy Pouch Tag no-real-value, and see `remedyPouchProof` feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Bond Gift Rite proof with `item.bond_gift`, keep the Jade Bond Gift Ribbon no-real-value, and see `bondGiftProof` preserved in the local HUD and browser evidence.
- A tester can record the Jade Name Banner Rite proof with `spirit.name_banner`, keep the Jade Name Banner Tag no-real-value, and see `nameBannerProof` plus Lirabao Lanternheart/Jintari Goldleaf Step/Aozhen Skybell Veil preserved in local HUD and browser evidence.
- A tester can record the Jade Quest Ledger proof with `quest.ledger_record`, keep the Jade Quest Ledger Seal no-real-value, and see `questLedgerProof` feed the Jade Scroll Story Chapter, Jade Wayfarer Chronicle, and Jade Court Ascension Trial readiness checks.
- A tester can record the no-real-value Jade Bloom Ascendance proof and see it feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the no-real-value Jade Lineage Register proof and see it feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the no-real-value Jade Roster Cabinet proof with `spirit.roster_cabinet`, keep the Jade Roster Cabinet Tag no-real-value, and see `rosterCabinetProof` feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can record the no-real-value Jade Blossom Cradle proof with `spirit.blossom_cradle`, keep the Jade Blossom Cradle Ribbon no-real-value, and see `blossomCradleProof` feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can clear the Jade Dojo Ladder as a no-real-value Jade Dojo Ladder proof and see it feed the Jade Banner Tournament, Jade Rival Circle, Jade Wayfarer Chronicle, and Jade Court Ascension Trial readiness checks.
- A tester can clear the Jade Sifu Council as a no-real-value Jade Sifu Council proof and see it feed the Jade Wayfarer Chronicle and Jade Court Ascension Trial readiness checks.
- A tester can clear the Jade Summit Circuit as a no-real-value Jade Summit Circuit proof and see it feed the Jade Battle Chronicle, Jade Wayfarer Chronicle, and Jade Court Ascension Trial readiness checks.
- A tester can record the Jade Battle Chronicle as a no-real-value no-injury battle history proof and see the Jade Battle Chronicle Seal preserved in browser, visual review, local acceptance, and readiness evidence.
- A tester can create a no-real-value fixed market listing proof, stock a no-real-value Jade Court Provision Satchel, record a no-real-value Jade Provision Catalog, record the Jade Court Care Cycle, record the Jade Temperament Concord, record the Jade Field Almanac, record the Jade Route Ecology Survey, record the no-real-value Jade Encounter Atlas, record the no-real-value Jade Habitat Census, record the Jade Court Craft Writ, record the no-real-value Jade Exchange Accord proof, activate the no-real-value Jade Cloudbell Waystone, record the no-real-value Jade Route Charter proof, seal the no-real-value Jade Moonwell Nurture Rite, record the no-real-value Jade Teahouse Recovery, record the no-real-value Jade Kinship Album, record the no-real-value Jade Nursery Grove, record the no-real-value Jade Bloom Ascendance, record the no-real-value Jade Lineage Register, record the no-real-value Jade Capture Rite, clear the no-real-value Jade Banner Tournament, clear the no-real-value Jade Rival Circle, record the Jade Court Commission Ledger, record the Jade Scroll Story Chapter, seal the no-real-value Jade Insignia Case, and record a direct trade proof for eligible alpha assets.
- A tester can request an Enjin Canary certificate path, stage the Jade Vault return preview for one eligible rare asset, and review Canary finality as `PENDING`; when Enjin env is missing, the runtime must explain it is a configured preview stub and must not credit inventory before `FINALIZED`.
- Alpha Preview Ready can be reached with Enjin still in `configured-preview-stub`; Alpha RC Ready cannot pass until funded-chain gates are green.
- The manifest and smoke checks expose alpha flags and no-real-value chain state.
- The Mochirii preview route requires signed-in allowlisted access and tester acknowledgement before embedding.
- The Mochirii tester-page iframe passes the responsive gameplay matrix without horizontal overflow, incoherent HUD overlap, central gameplay obstruction, unreachable actions, invisible focus, editable-chat capture regressions, or movement/action key browser scrolling.
- Admin tools can grant/revoke alpha access and view audit status.
- Production/mainnet/cashout/open UGC remain disabled and documented as out of scope.

## Handoff Commands

Game repo:

```powershell
npm install
npm run secret-scan
npm run alpha:readiness
npm run typecheck
npm run lint
npm test
npm run build
npm run alpha:built-server-smoke
npm run alpha:local-suite
npm run alpha:local-evidence
$env:MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD="<local-only-private-password>"; npm run alpha:local-site-iframe
npm run alpha:operator-checklist
npm run alpha:provider-preflight
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:preview-ready
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; $env:RPG_SAVE_DIR=".local/saves"; $env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:browser-presence
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:responsive-gameplay
$env:MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD="<local-only-private-password>"; npm run alpha:local-site-iframe
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-snapshot
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"; npm run alpha:enjin-operator-smoke
```

Mochirii repo:

```powershell
npm run check
cd apps/web
npm run lint
npm run build
```

External operator steps stay interactive and cost-gated when they can add charges or mutate sensitive provider state: Fly/Vercel/Supabase/Enjin login, secret entry, Wallet Daemon seed creation, Fuel Tank funding, hosted load smoke, paid/quota-bearing CI reruns, and preview deploy promotion. Public-repo branch pushes are allowed under the current user policy; verify PR/CI checks afterward.

Hosted external gate checks stay no-cost gated too. Set `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` only for an explicitly approved hosted verification run; without it, `npm run alpha:external-gates` must refuse hosted Fly/Vercel contract fetches.
