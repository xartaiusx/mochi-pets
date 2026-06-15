# Alpha Preview Ready

Alpha Preview Ready is the live-on-site stop point before full Alpha RC Ready. It lets approved testers use Mochi Social through the Mochirii Vercel Preview while Enjin remains unfunded and visibly in `configured-preview-stub` mode.

## Source Basis

- OpenAI Codex manual: https://developers.openai.com/codex/codex-manual.md
- GitHub Actions billing and branch protection: https://docs.github.com/en/billing/concepts/product-billing/github-actions and https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- Vercel environments, environment variables, and WebSocket guidance: https://vercel.com/docs/deployments/environments, https://vercel.com/docs/environment-variables, and https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- Fly.io secrets and volumes: https://fly.io/docs/apps/secrets/ and https://fly.io/docs/volumes/overview/
- Supabase Edge secrets and Auth user validation: https://supabase.com/docs/guides/functions/secrets and https://supabase.com/docs/reference/javascript/auth-getuser
- Enjin Canary, cENJ, Fuel Tanks, and Wallet Daemon: https://docs.enjin.io/getting-started/quick-start-guide, https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks, and https://docs.enjin.io/getting-started/using-wallet-daemon
- RPGJS v5 and browser WebSockets: https://github.com/RSamaium/RPG-JS and https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

## Preview Target

- Game runtime: Fly app `mochi-social-game`.
- Website doorway: Mochirii Vercel Preview route `/games/mochi-social`.
- Website public env: `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
- Website server env for the first live pass: `MOCHI_SOCIAL_ALPHA_ACCESS_MODE=tester-password` plus `MOCHI_SOCIAL_TESTER_PASSWORD`.
- Supabase authority: Mochirii Edge Functions own allowlist, terms, action ledger, feedback, admin, and chain operation rows.
- Enjin: Canary only, visible unfunded preview stub until collection, Fuel Tank, Wallet Daemon signing, and cENJ funding are approved.

## Gate Lanes

Treat `provider.external-gates` as two lanes:

- `preview-live-gates`: Fly game URL, Vercel Preview embed, tester-password access, no-real-value labels, and hosted contract checks after explicit hosted-check approval. Supabase allowlist, terms, and feedback remain the stricter Alpha RC path.
- `funded-chain-gates`: Enjin collection ID, Fuel Tank ID, cENJ funding, Wallet Daemon signing, and finalized proof smoke. This lane is expected red until later approval.

Alpha Preview Ready can pass while funded-chain gates are red. Alpha RC Ready cannot pass until both lanes are green.

## No-Real-Value Chain Mode

- Do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`.
- Keep `ENJIN_NETWORK=CANARY`.
- Keep the Canary certificate and Jade Vault return UI visible with clear `configured-preview-stub` messaging.
- Record chain requests, including return previews, as audit-only preview rows.
- Never credit inventory, cold inventory, market settlement, trade settlement, cashout, or player value from a chain request unless a real Enjin state reaches `FINALIZED`.

## Action Approval Rules

Local code, docs, tests, no-secret reports, and localhost-only checks may proceed without a new approval. The following actions need fresh action-specific approval before Codex runs them:

- Push a branch, rerun GitHub Actions, create or update required checks, or enable branch protection.
- Deploy, restart, scale, mutate, or run hosted smoke/load checks against Fly, Vercel, Supabase, or any public preview URL.
- Set, change, remove, or rotate provider secrets or environment variables in Fly, Vercel, Supabase, GitHub, Discord, or Enjin.
- Fund cENJ, create or fund a Fuel Tank, submit Enjin transactions, start signer-connected Wallet Daemon work, or mark funded-chain gates green.
- Set hosted approval flags such as `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true`, `MOCHI_SOCIAL_SITE_PREVIEW_READY_ALLOW_HOSTED=true`, `MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true`, or hosted load/Edge flags.

Each approval request must name the exact account/provider, command or dashboard action, possible cost or usage impact, and no-cost alternative.

## Codex Prompt Templates

Use these when starting the next implementation pass:

```text
Build the next alpha feature against no-real-value Alpha Preview Ready. Keep Enjin visible as configured-preview-stub and do not clear funded-chain gates.
```

```text
Do not clear funded-chain gates unless cENJ, collection, Fuel Tank, and Wallet Daemon proof approval exists.
```

```text
Use Mochi Social for runtime/game changes and Mochirii for website, Supabase, allowlist, terms, feedback, and admin changes.
```

## Game-Design Acceptance

Before testers enter the Vercel Preview:

- Mochi Spirits loop works: Jade Starter Vow first-companion proof, attune, bond, care, unique bond milestones, Moonbridge/Cloudbell field route scouting, Moonbridge Goldleaf and Cloudbell Skyvow no-injury field accord proofs, Jintari/Aozhen route spirit invitation, Jade Cloudbell route mastery, Jade Cloudbell two-tester route patrol, Jade Court Habitat Bond, Jade Court Sanctuary Rite, Jade Court Research Folio, Jade Court Spirit Compendium, Jade Court Roster Archive, Jade Roster Cabinet proof, Jade Court Market Receipt proof, Jade Court Provision Satchel, Jade Provision Catalog, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Court Care Cycle, Jade Temperament Concord, Jade Field Almanac, Jade Route Ecology Survey, Jade Weather Veil, Jade Encounter Atlas, Jade Habitat Census, Jade Court Craft Writ, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone, Jade Moonwell Nurture Rite, Jade Teahouse Recovery, Jade Kinship Album, Jade Nursery Grove, Jade Bloom Ascendance, Jade Lineage Register proof, Jade Capture Rite, Jade Banner Tournament, Jade Rival Circle, Jade Summit Circuit proof, Jade Court Commission Ledger, Jade Courtyard Rally, Jade Quest Ledger proof, Jade Scroll Story Chapter, Jade Insignia Case, Jade Wayfarer Chronicle, Jade Court Ascension Trial, technique mastery, tactic scroll planning, Jade Step Loadout proof, Jade Technique Codex proof, Jade Heart Trait Attunement proof, Jade Mirror Condition Weave proof, guild rank trial proof, Moonwell growth rite proof, affinity trial, three-spirit party formation, Triune Jade Harmony proof, Jade Echo Concord social battle proof, Jade Mirror Team Match proof, Silk Banner Mentor Drill proof, deterministic no-injury battle round transcript, train, raise, inspect, first-chain roleplay quest completion, bond growth, temperament identity proof, 3/3 journal/status, and active spirit status.
- HUD works: profile view, guild buddy proof, social status, spirit status, Jade Starter Vow proof, Jade Court Sanctuary Rite proof, Jade Court Research Folio proof, Jade Court Spirit Compendium proof, Jade Court Roster Archive proof, Jade Roster Cabinet proof, Jade Court Market Receipt proof, Jade Court Provision Satchel proof, Jade Provision Catalog proof, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Weather Veil proof, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Dojo Ladder proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Summit Circuit proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Quest Ledger proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, inspect detail, Jade Court rank proof, Moonwell Bloom proof, technique loadout proof, Jade Technique Codex proof, trait attunement proof, condition weave proof, harmony/concord/team-match/mentor proof, battle round transcript proof, chat, emote, market, market receipt, provision catalog, kit, remedy, trade, accord, Canary request, and Jade Vault return preview.
- Social loop works: local guild buddy proof, chat/emote, two-tab presence, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Exchange Accord proof, Jade Kinship Album proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Courtyard Rally proof, Jade Quest Ledger proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, and Jade Court Ascension Trial proof.
- Economy loop is no-real-value: fixed market proof, Jade Court Market Receipt proof, Jade Court Provision Satchel proof, Jade Provision Catalog proof, Jade Battle Kit proof, Jade Remedy Pouch proof, Jade Court Care Cycle proof, Jade Temperament Concord proof, Jade Field Almanac proof, Jade Route Ecology Survey proof, Jade Encounter Atlas proof, Jade Habitat Census proof, Jade Court Craft Writ proof, Jade Exchange Accord proof, Jade Relic Attunement proof, Jade Cloudbell Waystone proof, Jade Moonwell Nurture Rite proof, Jade Teahouse Recovery proof, Jade Kinship Album proof, Jade Nursery Grove proof, Jade Bloom Ascendance proof, Jade Lineage Register proof, Jade Capture Rite proof, Jade Banner Tournament proof, Jade Rival Circle proof, Jade Court Commission Ledger proof, Jade Courtyard Rally proof, Jade Scroll Story Chapter proof, Jade Insignia Case proof, Jade Wayfarer Chronicle proof, Jade Court Ascension Trial proof, and direct trade proof stay alpha/test labeled.
- Weather veil works: Jade Weather Veil proof records Moonbridge/Cloudbell route conditions, moonlit mist, goldleaf rain, skybell crosswind, route ecology, route patrol, field accord, field almanac, and two-tester witness state before Jade Encounter Rotation while staying no-real-value.
- Encounter rotation works: Jade Encounter Rotation proof records route windows, lure planning, route ecology, weather veil, capture rite, field accord, field almanac, and two-tester witness state before the Jade Encounter Atlas while staying no-real-value.
- Habitat census works: Jade Habitat Census proof records full first-court observations, care logs, route coverage, encounter atlas, route ecology, weather veil, compendium, care cycle, and two-tester witness state before Chronicle and Ascension while staying no-real-value.
- Fixed-price receipt proof is no-real-value: the Jade Market Receipt records `market.guild_receipt` after a fixed-list test purchase and must not imply settlement, inventory credit, cashout, or production value.
- Provision catalog proof is no-real-value: the Jade Provision Catalog records `item.provision_catalog` after satchel, market receipt, direct trade, craft, recovery, care, habitat census, and two-tester social witness proofs, and the Jade Provision Catalog Seal must not imply settlement, inventory credit, cashout, or production value.
- Battle kit proof is no-real-value: the Jade Battle Kit records `item.battle_kit` after full roster, three-spirit party, Jade Provision Catalog, Jade Technique Codex, Jade Mirror Condition Weave, Jade Affinity Matrix, Jade Teahouse Recovery, no-injury battle, and two-tester witness proofs. The Jade Battle Kit Tag must not imply settlement, inventory credit, cashout, production value, or Enjin finality.
- Remedy pouch proof is no-real-value: the Jade Remedy Pouch records `item.remedy_pouch` after full roster, three-spirit party, Lantern Ward/Goldleaf Tempo/Skybell Guard condition proof, Lantern Harmony Tea/Jade Thread Charm/Jade Mooncake Box remedy item proof, Jade Teahouse Recovery, Jade Battle Kit, Jade Court Care Cycle, Jade Court Sanctuary Rite, no-injury battle, and two-tester witness proofs. The Jade Remedy Pouch Tag must not imply settlement, inventory credit, cashout, production value, or Enjin finality.
- Quest ledger proof is no-real-value: the Jade Quest Ledger records `quest.ledger_record` after all three first-court quest postings, journal records, route mastery, route patrol, market receipt, provision satchel, commission ledger, two-tester rally, and social readiness proofs. The Jade Quest Ledger Seal must not imply settlement, inventory credit, cashout, production value, or Enjin finality.
- Exchange economy proof is no-real-value: the Jade Exchange Accord Tally is audit-only and must not imply settlement, inventory credit, cashout, or production value.
- Battle strategy loop works: Jade Affinity Matrix proof records all three first-party affinities, all three Jade Mirror conditions, the Silk Cinder affinity trial, Jade Step Loadout, Jade Heart Trait, and no-injury battle readiness before capstone battle/guild proofs.
- Move-library proof is no-real-value: the Jade Technique Codex Seal records the first three mastered move IDs, three tactic IDs, party composition, Jade Step Loadout proof, training, and no-injury battle readiness before trait, condition, and guild capstone proofs.
- Dojo ladder proof is no-real-value: the Jade Dojo Ladder Seal is a local alpha proof only and does not imply inventory credit, payout, settlement, or Enjin finality.
- Sifu council proof is no-real-value: the Jade Sifu Council Crest is a local alpha proof only and records Jade Sifu Council proof for closed testers without inventory credit, payout, settlement, or Enjin finality.
- Summit circuit proof is no-real-value: the Jade Summit Circuit Laurel is a local alpha proof only and records Jade Summit Circuit proof for closed testers without inventory credit, payout, settlement, or Enjin finality.
- Relic attunement proof is no-real-value: the Jade Relic Silk Cord is a local alpha proof only and records Jade Relic Attunement proof for closed testers without inventory credit, payout, settlement, or Enjin finality.
- Matrix economy proof is no-real-value: the Jade Affinity Matrix Seal is audit-only and must not imply settlement, inventory credit, or production value.
- Ascendance growth proof is no-real-value: the Jade Bloom Ascendance Sigil records roster-wide care, growth, affinity, training, spar, and social readiness and must not imply settlement, inventory credit, or production value.
- Lineage proof is no-real-value: the Jade Lineage Register Seal records capture, care, kinship, nursery, bloom, growth, raising, and bond continuity before Chronicle and Ascension and must not imply settlement, inventory credit, or production value.
- Roster cabinet proof is no-real-value: the Jade Roster Cabinet Tag records party slots, reserve labels, nursery, lineage, roster archive, compendium, and social storage readiness before Chronicle and Ascension and must not imply settlement, inventory credit, or production value.
- Chain request stub works: visible Canary request and Jade Vault return preview record audit-only requests and explain `configured-preview-stub`.
- Visual/manual gates work: map prompt review covers NPC, chest, habitat/care, and first-screen composition.
- Asset ledger is current for any original or CC0 assets.

## Verification

Game repo local checks:

```powershell
npm run secret-scan
npm run alpha:readiness
npm run typecheck
npm run lint
npm test
npm run build
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:enjin-operator-smoke
npm run alpha:preview-ready
```

Mochirii preview checks:

```powershell
npm run check:mochi-social-alpha
npm run check:mochi-social-bridge-state
npm run check:mochi-social-game-contract
npm run smoke:mochi-social-alpha-edge
npm run check
cd apps/web
npm run lint
npm run build
```

Browser preview gates:

- Signed-out users are blocked.
- Signed-in non-testers are blocked.
- Allowlisted testers must accept terms.
- The iframe loads the Fly game.
- The parent sends only `MOCHI_SOCIAL_AUTH`.
- The chain request and return preview show stub/no-real-value messaging and do not imply inventory credit before `FINALIZED`.
- Feedback appears in the admin/audit flow.

Preview Ready audit:

```powershell
$env:MOCHI_SOCIAL_GAME_URL="https://mochi-social-game.fly.dev"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="<Mochirii Vercel Preview URL>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true"
npm run alpha:external-gates
npm run alpha:preview-ready
```

`npm run alpha:preview-ready` writes ignored no-secret reports to `reports/alpha-preview-ready.json`, `reports/alpha-preview-ready.md`, and `C:\Users\xtyty\Desktop\Creds\mochi-social-alpha-preview-ready.md`. It can pass with funded-chain gates red, but it cannot pass until `preview-live-gates` are green, hosted checks were explicitly approved, and both local branches are synced to their PR branches.

The Mochirii repo also has a site-side tester-entry audit:

```powershell
cd C:\Users\xtyty\Documents\Mochirii
npm run check:mochi-social-preview-ready
```

That command writes ignored no-secret reports to `reports/mochi-social-preview-ready.json`, `reports/mochi-social-preview-ready.md`, and `C:\Users\xtyty\Desktop\Creds\mochirii-mochi-social-preview-ready.md`. It stays red until the game Preview Ready report, Vercel Preview/browser gates, Supabase Edge smoke, and site branch sync are proven.

## Funding Later

After Alpha Preview Ready, a separate approval can move to funded Alpha RC:

1. Fund the Wallet Daemon address with Canary cENJ.
2. Create and finalize `Mochi Social Alpha` collection.
3. Create and finalize a Canary Fuel Tank.
4. Set real `ENJIN_COLLECTION_ID` and `ENJIN_FUEL_TANK_ID` as Fly secrets.
5. Run approved live Enjin operator smoke.
6. Credit or settle only after `FINALIZED`.
