# Alpha Acceptance

This file is the repeatable local acceptance gate for Mochi Social Alpha RC. It covers the public game routes, integration contract, local no-real-value economy writes, automated browser presence/movement evidence, a static map-object contract test, and the final manual map-object visual check that still needs human eyes.

## Alpha Preview Ready

Alpha Preview Ready is the live-on-site gate before full Alpha RC Ready. It is allowed to keep Enjin in `configured-preview-stub` mode.

Before inviting testers to the Mochirii Vercel Preview:

- The Fly game URL is known and approved for hosted contract checks.
- The Mochirii Vercel Preview route `/games/mochi-social` uses `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
- Supabase allowlist, terms acknowledgement, feedback, admin audit, and `MOCHI_SOCIAL_AUTH` bridge checks pass.
- The chain UI remains visible and no-real-value, and the Canary request plus Jade Vault return preview explain `configured-preview-stub`.
- `preview-live-gates` are green.
- `funded-chain-gates` are documented as expected red until cENJ, collection, Fuel Tank, Wallet Daemon signing, and finality smoke are approved.
- No dummy `ENJIN_COLLECTION_ID`, dummy `ENJIN_FUEL_TANK_ID`, or fake Enjin readiness flags are set.

Use [`docs/alpha-preview-ready.md`](alpha-preview-ready.md) as the operator checklist for this stop point.

## Local Script

Build and start the game server from the repo root:

```powershell
npm run build
$env:PORT="3100"
$env:RPG_SAVE_DIR=".local/saves"
npm run start
```

In a second terminal:

```powershell
$env:MOCHI_SOCIAL_BASE_URL="http://localhost:3100"
$env:RPG_SAVE_DIR=".local/saves"
npm run smoke
npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_PLAYERS="25"
npm run alpha:load-smoke
npm run alpha:browser-presence
npm run alpha:visual-snapshot
npm run alpha:visual-review
npm run alpha:manual-prompt-review
npm run alpha:wallet-daemon-check
npm run alpha:enjin-operator-smoke
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:operator-checklist
npm run alpha:provider-preflight
npm run alpha:sync-approval
npm run alpha:report-hygiene
npm run alpha:external-gates
npm run alpha:rc-audit
```

The acceptance script verifies:

- `GET /healthz`
- `GET /play`
- `GET /embed`
- `GET /integration/game-manifest.json`
- `GET /integration/alpha/status`
- `POST /integration/alpha/action` rejects malformed actions.
- `chat.send`, `emote.send`, `spirit.starter_vow`, `spirit.capture`, `spirit.route_invite`, `world.route_mastery`, `world.route_patrol`, `world.route_ecology`, `world.weather_veil`, `world.encounter_rotation`, `world.encounter_atlas`, `spirit.habitat_census`, `item.craft_writ`, `trade.exchange_accord`, `spirit.relic_attune`, `world.route_waystone`, `spirit.nurture_rite`, `spirit.recovery_tea`, `item.provision_catalog`, `item.battle_kit`, `item.remedy_pouch`, `spirit.kinship_album`, `spirit.nursery_grove`, `spirit.bloom_ascendance`, `spirit.lineage_register`, `spirit.capture_rite`, `battle.dojo_ladder`, `battle.tournament_bracket`, `battle.rival_circle`, `battle.sifu_council`, `battle.summit_circuit`, `spirit.habitat_bond`, `spirit.sanctuary_rite`, `spirit.research`, `spirit.compendium_complete`, `spirit.roster_archive`, `item.provision_satchel`, `spirit.care_cycle`, `spirit.temperament_concord`, `spirit.field_almanac`, `guild.commission_complete`, `guild.social_rally`, `story.chapter_complete`, `guild.insignia_case`, `guild.wayfarer_chronicle`, `guild.ascension_trial`, `spirit.attune`, `spirit.journal`, `world.expedition`, `spirit.technique`, `spirit.technique_loadout`, `battle.technique_codex`, `spirit.trait_attune`, `battle.condition_weave`, `battle.tactic_scroll`, `guild.rank_trial`, `spirit.growth_rite`, `battle.affinity_trial`, `party.set`, `party.harmony_form`, `battle.harmony_trial`, `battle.team_spar_match`, `battle.mentor_challenge`, `battle.spar_ladder`, `spirit.bond`, `spirit.care`, `spirit.train`, `spirit.raise`, `quest.accept`, `quest.progress`, `market.fixed_list`, `market.guild_receipt`, `trade.direct_offer`, `chain.withdraw_request`, and `chain.deposit_request` record to the no-real-value fallback ledger when Mochirii Supabase Edge Functions are not configured. The scripted payloads cover Jade Starter Vow, Moonbridge/Jintari and Cloudbell/Aozhen no-injury field accord proofs before route invitations, Jade Cloudbell route mastery, Jade Cloudbell two-tester route patrol, Jade Court Habitat Bond, Jade Court Sanctuary Rite, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive, Jade Court Market Receipt, Jade Court Provision Satchel, Jade Provision Catalog, Jade Battle Kit, Jade Remedy Pouch, Jade Court Care Cycle, Jade Temperament Concord, Jade Field Almanac, Jade Route Ecology Survey, Jade Weather Veil, Jade Encounter Rotation, Jade Encounter Atlas, Jade Habitat Census, Jade Court Craft Writ, Jade Exchange Accord, Jade Relic Attunement, Jade Cloudbell Waystone, Jade Moonwell Nurture Rite, Jade Teahouse Recovery, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Lineage Register, Jade Capture Rite, Jade Dojo Ladder, Jade Banner Tournament, Jade Rival Circle, Jade Summit Circuit, Jade Court Commission Ledger, Jade Courtyard Rally, Jade Scroll Story Chapter, Jade Insignia Case, Jade Wayfarer Chronicle, Jade Court Ascension Trial, Jade Step Loadout, Jade Technique Codex, Jade Heart Trait Attunement, Jade Mirror Condition Weave, per-spirit bond milestone display through care/raise, Triune Jade Harmony, Jade Echo Concord, Jade Mirror Team Match, Silk Banner Mentor Drill, Jade Vault return preview, plus the First Lantern Vow, Silk Market Kindness, and Skybell Spar quest postings. The capstone path is starter vow, market receipt, provision catalog, battle kit, remedy pouch, exchange accord, relic attunement, kinship album, nursery grove, bloom ascendance, lineage register, capture rite, dojo ladder, weather veil, encounter rotation, encounter atlas, habitat census, summit circuit, story, insignia case, chronicle, and ascension, while the older story, chronicle pairing remains covered with `guild-insignia-case` ledger proof before the later capstones.
- `world.encounter_rotation` records the no-real-value Jade Encounter Rotation payload as an encounter rotation proof with route ecology, field almanac, field accord, capture rite, route windows, lure planning, two-tester witness, and Jade Encounter Rotation Scroll proof before the encounter atlas.
- `world.weather_veil` records the no-real-value Jade Weather Veil payload as a weather veil proof with Moonbridge/Cloudbell routes, moonlit mist, goldleaf rain, skybell crosswind, route ecology, field almanac, field accord, route patrol, two-tester witness, and Jade Weather Veil Chart proof before encounter rotation.
- `spirit.habitat_census` records the no-real-value Jade Habitat Census payload with full Lirabao/Jintari/Aozhen observation proof, full care-log proof, Moonbridge/Cloudbell routes, encounter atlas, route ecology, weather veil, compendium, care cycle, two-tester witness, and Jade Habitat Census Seal proof before Chronicle and Ascension payloads preserve `habitatCensusProof`.
- `market.guild_receipt` records the no-real-value Jade Court Market Receipt payload with fixed-list market proof, Jade Thread Charm item ID, quantity one, five `guild-seals`, profile, local guild buddy, non-exploring status, chat context, and Jade Market Receipt proof. Jade Court Provision Satchel, Chronicle, and Ascension payloads preserve `marketReceiptProof`.
- `item.provision_catalog` records the no-real-value Jade Provision Catalog payload with full roster proof, stocked Jade Thread Charm/Lantern Harmony Tea/Jade Mooncake Box items, care and route item proofs, Jade Court Provision Satchel, Jade Court Market Receipt, direct trade, Jade Court Craft Writ, Jade Teahouse Recovery, care cycle, habitat census, two-tester witness, and Jade Provision Catalog Seal proof. Chronicle and Ascension payloads preserve `provisionCatalogProof`.
- `item.battle_kit` records the no-real-value Jade Battle Kit payload with full roster/party proof, Lantern Harmony Tea/Jade Thread Charm/Jade Mooncake Box kit item IDs, Jade Provision Catalog, Jade Technique Codex, Jade Mirror Condition Weave, Jade Affinity Matrix, Jade Teahouse Recovery, a winning no-injury battle round, two-tester witness, and Jade Battle Kit Tag proof. Chronicle and Ascension payloads preserve `battleKitProof`.
- `item.remedy_pouch` records the no-real-value Jade Remedy Pouch payload with full roster/party proof, Lantern Harmony Tea/Jade Thread Charm/Jade Mooncake Box remedy item IDs, Lantern Ward/Goldleaf Tempo/Skybell Guard condition IDs, Jade Teahouse Recovery, Jade Battle Kit, Jade Court Care Cycle, Jade Court Sanctuary Rite, a winning no-injury battle round, two-tester witness, and Jade Remedy Pouch Tag proof. Chronicle and Ascension payloads preserve `remedyPouchProof`.
- `trade.exchange_accord` records the no-real-value Jade Exchange Accord payload with full Lirabao/Jintari/Aozhen roster proof, fixed-list market proof, direct trade proof, Jade Court Provision Satchel proof, Jade Court Craft Writ proof, two-tester presence, and Jade Exchange Accord Tally proof. Chronicle and Ascension payloads preserve `exchangeAccordProof`.
- `battle.affinity_matrix` records the no-real-value Jade Affinity Matrix payload with the full party, blossom/citrus-gold/sky-jade affinities, Lantern Ward/Goldleaf Tempo/Skybell Guard conditions, Jade Step Loadout, Jade Heart Trait, Jade Mirror Condition Weave, Silk Cinder affinity trial, and Jade Affinity Matrix Seal proof. Tournament, Rival Circle, Chronicle, and Ascension payloads preserve `affinityMatrixProof`.
- `spirit.relic_attune` records the no-real-value Jade Relic Attunement payload with full-party proof, Jade Thread Charm, Lantern Harmony Tea, Jade Court Provision Satchel, Jade Step Loadout, Jade Technique Codex, Jade Heart Trait, Jade Mirror Condition Weave, Jade Affinity Matrix, Jade Court Craft Writ, Jade Exchange Accord, care, temperament, growth, two-tester social proof, and Jade Relic Silk Cord proof. Summit, Chronicle, and Ascension payloads preserve `relicAttunementProof`.
- `spirit.starter_vow` records the no-real-value Jade Starter Vow payload with selected first companion, Mochirii Guild Seal, local social readiness, status, chat, and Jade Starter Knot proof. Chronicle and Ascension payloads preserve `starterVowProof`.
- `battle.technique_codex` records the no-real-value Jade Technique Codex payload with the full party, three mastered move IDs, three tactic IDs, Jade Step Loadout proof, technique mastery XP, training XP, no-injury battle proof, and Jade Technique Codex Seal proof. Chronicle and Ascension payloads preserve `techniqueCodexProof`.
- `battle.dojo_ladder` records the no-real-value Jade Dojo Ladder payload with full-party spar clears, Jade Technique Codex proof, Jade Mirror Condition Weave proof, Jade Affinity Matrix proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, training XP, no-injury battle transcript proof, and Jade Dojo Ladder Seal proof. Tournament, Rival Circle, Chronicle, and Ascension payloads preserve `dojoLadderProof`.
- `battle.sifu_council` records the no-real-value Jade Sifu Council payload with full-party proof, Sifu Narao/Warden Meilin/Keeper Haoran council member clears, dojo ladder proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Technique Codex proof, Jade Mirror Condition Weave proof, Jade Affinity Matrix proof, Silk Banner Mentor Drill proof, no-injury battle transcript proof, two-tester presence, and Jade Sifu Council Crest proof. Chronicle and Ascension payloads preserve `sifuCouncilProof`.
- `battle.summit_circuit` records the no-real-value Jade Summit Circuit payload with full-party proof, four summit seals, dojo ladder proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Sifu Council proof, Jade Technique Codex proof, Jade Mirror Condition Weave proof, Jade Affinity Matrix proof, Jade Relic Attunement proof, Triune Jade Harmony proof, Jade Echo Concord proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, no-injury battle transcript proof, two-tester presence, rank/growth/route proof, and Jade Summit Circuit Laurel proof. Chronicle and Ascension payloads preserve `summitCircuitProof`.
- `spirit.bloom_ascendance` records the no-real-value Jade Bloom Ascendance payload with full Lirabao/Jintari/Aozhen roster, party, care, bond, growth, nursery, nurture, kinship, affinity matrix, training, spar, profile, guild, status, and chat proof. Chronicle and Ascension payloads preserve `bloomAscendanceProof`.
- `spirit.lineage_register` records the no-real-value Jade Lineage Register payload with full Lirabao/Jintari/Aozhen roster, party, care, bond, kinship album, nursery grove, bloom ascendance, capture rite, care cycle, growth rite, raising milestone, training, spar, profile, guild, status, and chat proof. Chronicle and Ascension payloads preserve `lineageRegisterProof`, and the Jade Lineage Register Seal stays no-real-value.
- When Enjin secrets are not configured, alpha status and `chain.withdraw_request` / `chain.deposit_request` responses expose `configured-preview-stub` so testers know the Canary certificate and return paths are staged but not externally submitted.

By default the script expects local fallback mode and checks `.local/saves/alpha-ledger.jsonl`. If testing a preview runtime with Supabase Edge Functions configured, set `MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true` to limit the script to endpoint and contract checks, then use the Mochirii admin audit views for authoritative ledger proof.

The script writes `reports/alpha-local-acceptance.json` as a local, ignored evidence artifact. Local fallback ledger rows must include `ledgerVersion=1`, `source="local-alpha-ledger"`, `alphaStopPoint="alpha-rc-ready"`, `chainNetwork="CANARY"`, `noRealValue=true`, `receivedAt`, and the original action payload.

## Load Smoke

`npm run alpha:load-smoke` simulates 10-25 testers against the HTTP alpha contract. It opens `/play` concurrently, records chat and emote actions through `/integration/alpha/action`, and verifies the no-real-value fallback ledger entries.

This is a release-candidate smoke, not a capacity benchmark. Use `MOCHI_SOCIAL_LOAD_PLAYERS=10` through `25`; the default is `25`. The script writes `reports/alpha-load-smoke.json`. Run this against `localhost` by default. Hosted Fly/Vercel/Supabase load smoke can increase usage and requires explicit user approval.

## Built Server Smoke

`npm run alpha:built-server-smoke` starts the built `dist/server/express.js` runtime on a disposable localhost port with throwaway server-token env, no Enjin live secrets, and no Supabase Edge forwarding. It verifies `/healthz`, `/play`, `/integration/game-manifest.json`, `/integration/alpha/status`, and the private Enjin operator route fail-closed path. This catches server bundle/runtime drift before any Fly deploy. The ignored `reports/built-server-smoke.json` report includes sanitized server stdout/stderr, Git state, exit code, exit signal, and stopped status even if the built server exits before readiness.

The built server smoke and local suite use file-backed saves, so they are also the local guard for save durability regressions before Fly volume deployment. Save writes must remain per-player serialized and written through a temporary file before rename, so overlapping autosave and event-save writes cannot leave malformed JSON in the save directory.

## Local Alpha Suite

`npm run alpha:local-suite` is the local no-cost release-candidate pass. It builds once, runs the local Wallet Daemon binary metadata check, starts the built Express runtime on a disposable localhost port with a throwaway game-server token, uses an isolated `.local/alpha-suite/<run>/saves` directory, clears live Supabase Edge and Enjin env from child processes, and then runs endpoint smoke, local alpha acceptance, HTTP load smoke, browser presence, visual snapshot, visual review, and private Enjin operator smoke. It writes `reports/alpha-local-suite.json` with sanitized command/server output plus stopped status, and shuts the server down at the end.

The suite defaults to `10` simulated testers for the HTTP load-smoke portion to keep local runs quick. Set `MOCHI_SOCIAL_LOCAL_SUITE_LOAD_PLAYERS=25` for the full local release-candidate load count. It remains localhost-only; hosted preview suite runs require explicit hosted-smoke approval and should use the individual preview commands below instead.

Run `npm run alpha:local-evidence` after the local suite to validate the ignored localhost reports and write `reports/alpha-local-evidence.json` plus `reports/alpha-local-evidence.md`. It requires the acceptance, load, browser, visual, and operator reports to share the same local suite base URL, and it requires both the suite report and built-server smoke report to match the current local HEAD, upstream, and dirty worktree state, so stale localhost evidence cannot be mixed into a fresh summary or reused across code changes. The JSON summary also records current Git state, and `npm run alpha:rc-audit` rejects it when it becomes stale. These summaries are no-secret local artifacts; they do not prove hosted Fly, Vercel, Supabase, GitHub, or Enjin readiness.

## Manual Prompt Review Gate

`npm run alpha:manual-prompt-review` writes `reports/alpha-manual-prompt-review.json` and `reports/alpha-manual-prompt-review.md`. By default it records `pending-human-review` and exits non-zero. It passes only after an operator opens the playable game locally, focuses the game canvas, stands within one 64px logical tile of the map object, faces that object, presses Space/Action for about 200ms, confirms the rendered welcome NPC dialog, guild seal chest prompt/save feedback, and habitat/care prompt are coherent, then sets explicit confirmation env vars. The prompt-critical town entities use 64px action hitboxes so the review can be done from normal tile-adjacent RPG positioning.

The pending report includes a source-tied target checklist with current map coordinates, setup prerequisites, expected rendered phrases, graphics, and save sources for the welcome NPC, guild seal chest, Lirabao setup interaction, and care shrine. It also records a step-by-step review route, adjacent action tiles, source SHA-256 hashes, and line anchors for placements, rendered phrases, notifications, and save-source calls so the final human review can be tied to the exact current runtime sources.

Local completion example:

```powershell
$env:MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER="<operator name>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER="<browser and version>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_URL="http://localhost:3100/play"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK="true"
npm run alpha:manual-prompt-review
```

Hosted prompt review requires explicit hosted-preview approval first, then `MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true`. `npm run alpha:rc-audit` rejects a missing, stale, pending, or hosted-without-approval manual prompt review report.

## Wallet Daemon Local Check

`npm run alpha:wallet-daemon-check` verifies only local Wallet Daemon binary metadata. By default on this Windows workstation it first checks `C:\Users\xtyty\Desktop\Creds\enjin-wallet-daemon\wallet-daemon.exe`, then falls back to `C:\Users\xtyty\Downloads\wallet-daemon_v3.0.7_x86_64-pc-windows-msvc\wallet-daemon.exe`; set `MOCHI_SOCIAL_WALLET_DAEMON_PATH` to override those paths. The script hashes the file, runs `wallet-daemon --help`, records observed help commands, and writes ignored no-secret `reports/wallet-daemon-local.json` and `reports/wallet-daemon-local.md`.

This check is intentionally weaker than Enjin readiness. It does not import wallets, print seeds, start a signer, contact Enjin Platform, create a collection, fund a Fuel Tank, or submit a chain transaction. Alpha RC still requires an operator to confirm Enjin Platform shows Wallet Daemon connected before the collection, Fuel Tank, and proof-operation gates can pass.

Run `npm run alpha:operator-checklist`, refresh `npm run alpha:external-gates` in no-hosted or explicitly approved hosted mode, run `npm run alpha:provider-preflight`, run `npm run alpha:rc-audit` once to stamp the current audit report, then run `npm run alpha:sync-approval` and `npm run alpha:report-hygiene` after local evidence to scan the ignored local reports and generated no-secret operator/sync checklists for accidental token, key, service-role, wallet, or passphrase patterns. The operator checklist command writes `reports/alpha-operator-checklist.json`, `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-operator-next-steps.md`, and `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-external-gates-status.md` with the current local HEAD, upstream, dirty state, no-cost rule, private gate summary, current external gate state, and a provider action queue with exact approval text and no-cost fallbacks. The provider preflight command writes `reports/alpha-provider-preflight.json` plus `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-provider-preflight.md` with expected private input filenames, queue IDs, and missing filename status without reading private credential file contents. The sync approval command writes `reports/alpha-sync-approval.json` plus `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-sync-approval.md` with local branch drift, expected audit blockers after the freshly generated packet, self-referential sync freshness items, post-packet report-hygiene freshness items, raw prior audit blockers, external-gate snapshot, cost/usage risk, no-cost alternatives, and explicit approval text for CI/provider steps. It is not approval by itself. Report hygiene writes `reports/alpha-report-hygiene.json` with current Git state, and `npm run alpha:rc-audit` rejects stale operator checklist, provider preflight, sync approval, external-gate, or hygiene reports.

`npm run alpha:preview-ready` writes `reports/alpha-preview-ready.json`, `reports/alpha-preview-ready.md`, and `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-preview-ready.md`. It proves the tester-entry lane separately from funded-chain Alpha RC gates by requiring current local evidence, current no-secret hygiene, completed manual prompt review, current handoff packets, synced game/site branches, and green `preview-live-gates` from an explicitly approved hosted external-gates run.

The Mochirii repo mirrors this with `npm run check:mochi-social-preview-ready`, which writes ignored no-secret site-side reports and requires local bridge-state, auth-bridge, publishable-key loader, Discord provider detector, and Edge authority self-tests before game Preview Ready evidence, site branch sync, hosted game contract proof, Supabase Edge smoke, hosted Discord OAuth proof, and explicit manual browser gate confirmation can let testers enter.

Full `npm run alpha:rc-audit` reads the Mochirii site-side report from `../Mochirii/reports/mochi-social-preview-ready.json` and fails until it is green and current, because allowlist, terms, feedback, Discord OAuth proof, and browser-gate proof belong to the website repo.

The game-side RC audit also checks the Mochirii bridge and preview-detector contracts directly: `check:mochi-social-bridge-state` must prove the website parent handles `MOCHI_SOCIAL_READY`, `MOCHI_SOCIAL_AUTH_STATE`, and `MOCHI_SOCIAL_ERROR` with a shared resolver, `check:mochi-social-auth-bridge` must keep iframe auth access-token-only, and the preview key-loader and Discord OAuth self-tests must pass before manual browser evidence can be trusted.

## Private Enjin Operator Smoke

`npm run alpha:enjin-operator-smoke` verifies `POST /integration/alpha/enjin/submit` fails closed without the private game server token. When testing a local server that was started with a non-production `MOCHI_SOCIAL_GAME_SERVER_TOKEN`, set `MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN` to the same value to also verify the tokened no-Enjin-secrets path returns `enjin_canary_not_configured`.

The smoke refuses to submit or poll live Enjin by default when the runtime reports `enjinCanaryConfigured=true`. Only an operator should opt into live Canary smoke with `MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE=true`, `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID`, and `MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID` after an approved Canary transaction exists. The script writes `reports/enjin-operator-smoke.json`.

## External Gate Audit

`npm run alpha:external-gates` checks live Alpha RC gates without printing secret values. It verifies GitHub PR status, Supabase preview secret names, Fly authentication/app/volume/secret names, live game contract, Mochirii site contract, and operator-confirmed Enjin readiness flags.

Read this report in two lanes while preparing the Vercel Preview:

- `preview-live-gates`: game URL, site preview URL, Supabase preview secrets, hosted game/site contract, allowlist/terms/feedback browser checks.
- `funded-chain-gates`: Enjin collection, Fuel Tank, cENJ, Wallet Daemon signing, finalized proof smoke.

The funded-chain lane is expected red for Alpha Preview Ready. Do not fake it with dummy IDs.

Before Alpha RC Ready, run it with the Fly game URL and Vercel preview origin:

```powershell
$env:MOCHI_SOCIAL_GAME_URL="https://<fly-preview-host>"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="<supabase-preview-ref>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true" # Requires explicit hosted verification approval.
npm run alpha:external-gates
```

Without `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true`, the external gate script refuses hosted Fly/Vercel contract fetches and reports the hosted checks as blocked. This keeps accidental hosted traffic out of local-only work. The script writes `reports/alpha-external-gates.json` with current Git state and the hosted approval flag, and `npm run alpha:rc-audit` rejects stale or pre-guard external gate reports.

For live Enjin completion, the operator must also provide non-public server env/secrets and set local confirmation flags only after dashboard verification: `ENJIN_PLATFORM_TOKEN`, `ENJIN_COLLECTION_ID`, `ENJIN_FUEL_TANK_ID`, `MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED=true`, `MOCHI_SOCIAL_ENJIN_COLLECTION_READY=true`, and `MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY=true`.

`npm run alpha:operator-checklist` writes the current no-secret handoff to the local credentials folder and `reports/alpha-operator-checklist.json` for machine-readable freshness checks. `npm run alpha:provider-preflight` writes expected private input filenames and approval queue evidence without opening private files. Treat both as checklists only; they are not evidence that private provider gates are complete.

## Alpha RC Audit

`npm run alpha:rc-audit` reads the game repo, sibling Mochirii repo, latest external gate report, current local evidence summary, current operator checklist report, current sync approval packet, local Git branch sync for both repos, GitHub PR state, and no-secret operator checklists. It writes `reports/alpha-rc-audit.json` and exits non-zero until every explicit Alpha RC requirement has direct evidence. The external gate report, local evidence summary, operator checklist, and sync approval packet must match the current local HEAD, upstream, and dirty state so stale provider proof, localhost proof, handoff, or provider approval text cannot pass the audit. Public-repo branch pushes are allowed under the current user policy, but PR checks must be verified afterward. The sync approval packet must also point at the current external-gate report checkedAt/HEAD/hosted approval state. This audit is the final pre-tester stoplight; it should remain red while Fly billing, live preview URLs, Enjin Canary readiness, or game/site local-vs-remote branch drift are incomplete.

## Two-tab Presence Gate

`npm run alpha:browser-presence` opens two pages in one browser context and verifies both tabs render the game canvas, the alpha HUD, and a `Nearby: 2 testers` presence chip. It captures canvas screenshot signatures, sends movement keys in both tabs, verifies each canvas changes, and verifies the observer tab changes after first-tab movement. It also clicks the HUD invite, attune, journal, scout, route invite, circuit, patrol, habitat bond, rite, research, codex, archive, bag, cycle, temper, almanac, ecology, veil, rotation, encounter atlas, census, craft, accord, relic, waystone, nurture, recover, kinship album, nursery, ascendance, lineage, capture rite, bracket, rival, commission, rally, story, insignia, chronicle, ascend, dojo, tactic, moves, technique codex, trait, weave, rank, bloom, affinity trial, party, harmony, concord, match, mentor, care, train, spar, battle-round transcript, raise, quest, profile view, local guild buddy proof, social status, spirit inspect, chat, emote, fixed-list, market-receipt, direct-trade, Canary certificate, Jade Vault return actions, and roster focus controls, then verifies the visible HUD, first-court roster panel, and `mochiSocial.alphaState` update. The HUD proof must include Lirabao, Jintari, and Aozhen in roster/party and in the readable roster detail panel with original invitation, care, battle, growth, active-spirit focus history, per-spirit bond/growth maps, and no-real-value Canary cues, 3/3 journal records, Moonbridge and Cloudbell route proof, Cloudbell Skyvow field accord proof, Jade Cloudbell route mastery proof, Jade Cloudbell two-tester route patrol proof, Jade Court Habitat Bond proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio proof, Jade Court Spirit Compendium proof, Jade Court Roster Archive proof, Jade Court Market Receipt proof, Jade Court Provision Satchel proof, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Weather Veil proof, Jade Encounter Rotation proof, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, Jade Step Loadout proof, Jade Technique Codex proof, Jade Heart Trait Attunement proof, Jade Mirror Condition Weave proof, Triune Jade Harmony proof, Jade Echo Concord proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, deterministic no-injury battle round transcript proof, Jade Vault return preview proof, and the completed first Mochirii quest chain. It writes `reports/alpha-browser-presence.json`.
The browser HUD loop also clicks `market.guild_receipt` after the fixed-list action and verifies the Market label, `marketReceiptProof`, receipt score, Jade Thread Charm item ID, one-item quantity, five `guild-seals`, and Jade Market Receipt no-real-value state.
The browser HUD loop also clicks `trade.exchange_accord` after the craft writ and verifies the Exchange label, `exchangeAccordProof`, accord score, three exchange item IDs, two-tester presence, and Jade Exchange Accord Tally no-real-value state.
The browser HUD loop also clicks `battle.affinity_matrix` after the condition weave and verifies the Matrix label, `affinityMatrixProof`, matrix score, three spirit IDs, three affinity labels, three condition IDs, and Jade Affinity Matrix Seal no-real-value state.
The browser HUD loop also clicks `battle.technique_codex` after the Jade Step Loadout and verifies the Technique Codex label, `techniqueCodexProof`, codex score, three spirit IDs, three move IDs, three tactic IDs, and Jade Technique Codex Seal no-real-value state.
The browser HUD loop also clicks `world.weather_veil` after route ecology and verifies the Weather Veil label, `weatherVeilProof`, route IDs, moonlit mist/goldleaf rain/skybell crosswind condition IDs, condition windows, two-tester witness, and Jade Weather Veil Chart no-real-value state.
The browser HUD loop also clicks `world.encounter_rotation` after the weather veil and verifies the Rotation label, `encounterRotationProof`, route IDs, spirit IDs, lure IDs, weather veil proof, rotation windows, two-tester witness, and Jade Encounter Rotation Scroll no-real-value state.
The browser HUD loop also clicks `spirit.habitat_census` after the encounter atlas and verifies the Census label, `habitatCensusProof`, route IDs, spirit observation IDs, care-log IDs, score threshold, and Jade Habitat Census Seal no-real-value state.
The browser HUD loop also clicks `battle.dojo_ladder` after the encounter atlas and verifies the Jade Dojo Ladder label, `dojoLadderProof`, ladder score, three party IDs, two cleared opponent IDs, and Jade Dojo Ladder Seal no-real-value state.

The browser HUD loop also clicks `battle.sifu_council` after the rival circle and verifies the Jade Sifu Council label, `sifuCouncilProof`, council score, three party IDs, three council member IDs, and Jade Sifu Council Crest no-real-value state.
The browser HUD loop also clicks `battle.summit_circuit` after the council and verifies the Jade Summit Circuit label, `summitCircuitProof`, summit score, three party IDs, four summit seal IDs, and Jade Summit Circuit Laurel no-real-value state.
The browser HUD loop also clicks `spirit.bloom_ascendance` after nursery grove and verifies the Ascendance label, `bloomAscendanceProof`, bloom score, full roster/party/care IDs, total bond, and Jade Bloom Ascendance Sigil no-real-value state.
The browser HUD loop also clicks `spirit.lineage_register` after the Jade Capture Rite and verifies the Lineage label, `lineageRegisterProof`, register score, full roster/party/care IDs, raising milestone labels, and Jade Lineage Register Seal no-real-value state.

The browser smoke is local-only by default to avoid hosted preview usage. Set `MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true` only after explicit hosted-preview approval. It prefers installed Chrome. If Chrome is installed outside the default Playwright channel, set `MOCHI_SOCIAL_BROWSER_EXECUTABLE` to the browser executable path. Set `MOCHI_SOCIAL_BROWSER_HEADFUL=true` when you want to watch the check run.

## Visual Snapshot Gate

`npm run alpha:visual-snapshot` opens `/play`, waits for the HUD, presence label, and canvas, and writes ignored first-screen evidence to `reports/alpha-visual-snapshot.json`, `reports/alpha-visual-page.png`, and `reports/alpha-visual-canvas.png`. It is local-only by default; set `MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT=true` only after explicit hosted-preview approval.

Use the PNGs for local human/Codex visual review of the town composition. The snapshot proves the first screen is renderable and reviewable; browser presence and map-object contract tests still provide the movement, HUD action, event ID, prompt, save-source, habitat, and collision evidence.

`npm run alpha:visual-review` reads `reports/alpha-visual-snapshot.json`, `reports/alpha-browser-presence.json`, the PNGs, and the first-town map-object sources, then writes ignored no-secret `reports/alpha-visual-review.json` and `reports/alpha-visual-review.md`. It verifies screenshot dimensions and hashes, HUD/presence evidence, observer movement, HUD spirit invitation/journal/field-expedition/field-accord/route-invitation/route-mastery/habitat-bond/sanctuary-rite/spirit-research/spirit-compendium/roster-archive/market-receipt/provision-satchel/care-cycle/temperament-concord/field-almanac/route-ecology/encounter-atlas/habitat-census/craft-writ/route-waystone/nurture-rite/recovery-tea/kinship-album/nursery-grove/bloom-ascendance/lineage-register/capture-rite/tournament-bracket/rival-circle/summit-circuit/guild-commission/social-rally/story-chapter/guild-insignia-case/wayfarer-chronicle/guild-ascension-trial/technique/tactic/loadout/technique-codex/trait/condition-weave/rank/growth-rite/affinity-trial/party/harmony/concord/team-match/mentor/spar/battle-round/training/quest/market/trade/Canary actions, required map-object IDs, and Jade Lantern Court habitat coverage. It keeps rendered NPC/guild-seal-chest/habitat care and bond-milestone prompt interaction as `pending-human-review`; it is a durable local review bundle, not a fake replacement for the manual prompt check.
Visual review includes Jade Court Market Receipt static and browser evidence: `resolveMarketGuildReceipt`, `market-guild-receipt`, `data-alpha-action="market.guild_receipt"`, `marketReceiptProof`, `marketReceiptClaimed`, and the no-real-value Jade Market Receipt.
Visual review includes Jade Exchange Accord static and browser evidence: `resolveTradeExchangeAccord`, `trade-exchange-accord`, `data-alpha-action="trade.exchange_accord"`, `data-exchange-accord-label`, `exchangeAccordProof`, and the no-real-value Jade Exchange Accord Tally.
Visual review includes Jade Affinity Matrix static and browser evidence: `resolveSpiritAffinityMatrix`, `battle-affinity-matrix`, `data-alpha-action="battle.affinity_matrix"`, `data-affinity-matrix-label`, `affinityMatrixProof`, and the no-real-value Jade Affinity Matrix Seal.
Visual review includes Jade Bloom Ascendance static and browser evidence: `resolveSpiritBloomAscendance`, `spirit-bloom-ascendance`, `data-alpha-action="spirit.bloom_ascendance"`, `data-bloom-ascendance-label`, `bloomAscendanceProof`, and the no-real-value Jade Bloom Ascendance Sigil.
Visual review includes Jade Lineage Register static and browser evidence: `resolveSpiritLineageRegister`, `spirit-lineage-register`, `data-alpha-action="spirit.lineage_register"`, `data-lineage-register-label`, `lineageRegisterProof`, and the no-real-value Jade Lineage Register Seal.
Visual review includes Jade Dojo Ladder static and browser evidence: `resolveSpiritDojoLadder`, `battle-dojo-ladder`, `data-alpha-action="battle.dojo_ladder"`, `data-dojo-ladder-label`, `dojoLadderProof`, and the no-real-value Jade Dojo Ladder Seal.
Visual review includes Jade Habitat Census static and browser evidence: `resolveSpiritHabitatCensus`, `spirit-habitat-census`, `data-alpha-action="spirit.habitat_census"`, `data-habitat-census-label`, `habitatCensusProof`, and the no-real-value Jade Habitat Census Seal.

Visual review includes Jade Sifu Council static and browser evidence: `resolveSpiritSifuCouncil`, `battle-sifu-council`, `data-alpha-action="battle.sifu_council"`, `data-sifu-council-label`, `sifuCouncilProof`, and the no-real-value Jade Sifu Council Crest.
Visual review includes Jade Summit Circuit static and browser evidence: `resolveSpiritSummitCircuit`, `battle-summit-circuit`, `data-alpha-action="battle.summit_circuit"`, `data-summit-circuit-label`, `summitCircuitProof`, and the no-real-value Jade Summit Circuit Laurel.

The browser smoke proves HUD-level two-tab presence, canvas movement response, and a synchronized observer-side canvas change. The unit suite also includes `apps/game/tests/map-object-contract.test.ts`, which verifies stable RPGJS event IDs, event coordinates, prompt/save-source snippets, companion habitat labels, and collision-layer evidence for the first town. `apps/game/tests/map-event-behavior.test.ts` executes the welcome NPC, guild seal chest, Lirabao bond/care, journal pavilion, expedition gate, route invitation altar, technique dojo, tactic scroll stand, affinity dais, party banner, guild rank bell, growth moonwell, market board, trade post, and Canary shrine handlers with item, save-source, variable, dialog-text, no-real-value, and Wallet Daemon-stub assertions.
The in-world habitat grove, journal pavilion, expedition gate, route invitation altar, technique dojo, tactic scroll stand, affinity dais, party banner, training ring, quest board, guild rank bell, growth moonwell, market board, and trade post are also covered by those contracts, including spirit invitation/capture proof, discovered journal records, Moonbridge and Cloudbell route scouting proof, Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accord proof, route spirit invitation proof for Jintari and Aozhen, Jade Cloudbell route mastery proof, Jade Cloudbell two-tester route patrol proof, Jade Court Habitat Bond proof, Jade Court Sanctuary Rite HUD proof, Jade Court Research Folio proof, Jade Court Spirit Compendium proof, Jade Court Roster Archive HUD proof, Jade Court Market Receipt proof, Jade Court Provision Satchel proof, Jade Court Care Cycle HUD proof, Jade Temperament Concord HUD proof, Jade Field Almanac HUD proof, Jade Route Ecology Survey HUD proof, Jade Weather Veil HUD proof, Jade Encounter Rotation HUD proof, Jade Encounter Atlas HUD proof, Jade Habitat Census HUD proof, Jade Court Craft Writ HUD proof, Jade Relic Attunement HUD proof, Jade Cloudbell Waystone HUD proof, Jade Moonwell Nurture Rite HUD proof, Jade Teahouse Recovery HUD proof, Jade Kinship Album HUD proof, Jade Nursery Grove HUD proof, Jade Bloom Ascendance HUD proof, Jade Lineage Register HUD proof, Jade Capture Rite HUD proof, Jade Banner Tournament HUD proof, Jade Rival Circle HUD proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Scroll Story Chapter HUD proof, Jade Insignia Case HUD proof, Jade Wayfarer Chronicle HUD proof, Jade Court Ascension Trial HUD proof, technique mastery proof, Jade Step Loadout proof, Jade Heart Trait Attunement proof, Jade Mirror Condition Weave proof, tactic scroll proof, Jade Court rank proof, Moonwell Bloom growth proof, Jade Mirror affinity trial proof, party formation proof, Triune Jade Harmony proof, Jade Echo Concord social battle proof, Jade Mirror Team Match full-party spar proof, Silk Banner Mentor Drill proof, no-injury spar ladder XP, no-injury training XP, First Lantern Vow/Silk Market Kindness/Skybell Spar quest-chain progress, save sources, and no-real-value alpha reward text.

Those tests prove the event contract and behavior. The remaining human visual check is for rendered in-browser prompt behavior and overall scene confidence before Alpha RC Ready:

1. Open two browser tabs or windows to `${MOCHI_SOCIAL_BASE_URL}/play`.
2. Confirm the game canvas, HUD, and town scene are visually coherent.
3. Interact with the NPC, chest, and habitat/care loop in at least one tab. Focus the canvas, stand adjacent to the object, hold the relevant facing direction toward it, and press Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.
4. Confirm the prompts and notifications match the alpha no-real-value scope.
5. Record the date, browser, game URL, `reports/alpha-browser-presence.json` result, and manual map-object result in the PR or release checklist.

Keep the manual map-object check until a later RPGJS runtime-level automation can interact with NPC, chest, habitat, and dialog state directly inside the canvas.

## Alpha RC Stop Point

Alpha Preview Ready means local acceptance, endpoint smoke, typecheck, lint, tests, build, approved hosted preview contract checks, Mochirii preview allowlist/terms/feedback checks, rollback notes, tester guide, source/asset ledgers, and Enjin `configured-preview-stub` messaging are complete.

Alpha RC Ready means Alpha Preview Ready plus approved Enjin Canary collection, Fuel Tank, Wallet Daemon signing, finalized proof smoke, and funded-chain gate evidence are complete.

Do not use this checklist to promote production, Enjin mainnet, paid assets, cashout, open UGC, or public launch.
Do not use this checklist to add billing usage. Follow [`docs/no-cost-operations.md`](no-cost-operations.md) before any hosted, CI, provider, Fuel Tank, or live chain action.
