import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const checks = [
  {
    file: 'package.json',
    includes: ['"clean-room-scan"', '"secret-scan"', '"alpha:readiness"', '"alpha:monero-treasury"', '"alpha:monero-operator-handoff"', '"alpha:local-acceptance"', '"alpha:load-smoke"', '"alpha:browser-presence"', '"alpha:browser-bridge-auth"', '"alpha:responsive-gameplay"', '"alpha:local-site-iframe"', '"alpha:visual-snapshot"', '"alpha:visual-review"', '"alpha:manual-prompt-review"', '"alpha:wallet-daemon-check"', '"alpha:enjin-operator-smoke"', '"alpha:built-server-smoke"', '"alpha:local-suite"', '"alpha:local-evidence"', '"alpha:report-hygiene"', '"alpha:gate-contracts"', '"alpha:preview-ready"', '"alpha:external-gates"', '"alpha:operator-checklist"', '"alpha:provider-preflight"', '"alpha:sync-approval"', '"alpha:sync-approval-self-test"', '"alpha:rc-audit"', '"build:release"', '"unity:verify"', '"dev:legacy"', '"smoke"']
  },
  {
    file: 'scripts/check-clean-room-literals.mjs',
    includes: ['builtInFingerprints', 'legacyIdentityFingerprints', 'legacy identity fingerprint', 'clean-room fingerprint', 'private clean-room denylist literal', 'MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST_PATH', 'MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST', 'docs/asset-ledger.md']
  },
  {
    file: '.github/workflows/ci.yml',
    includes: ['node-version-file: .nvmrc', 'npm run secret-scan', 'npm run alpha:readiness', 'npm run alpha:gate-contracts', 'npm run alpha:browser-bridge-auth', 'npm run alpha:sync-approval-self-test', 'npm run build']
  },
  {
    file: 'Dockerfile',
    includes: ['FROM node:24.17.0-slim', 'MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true', 'unity/Builds/WebGL']
  },
  {
    file: 'AGENTS.md',
    includes: ['Node 24 LTS', 'Unity WebGL is the active runtime', 'legacy rollback/reference', 'no-real-value', 'mainnet is out of scope', 'Supabase schema', 'wallet daemon', 'docs/codex-external-ops.md', 'docs/no-cost-operations.md', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'docs/alpha-preview-ready.md', 'Monero treasury', 'operator-only', 'alpha:monero-treasury', 'alpha:monero-operator-handoff']
  },
  {
    file: 'AGENTS.md',
    includes: ['battle.technique_codex', 'techniqueCodexes: true', 'Jade Technique Codex label/state', 'Jade Technique Codex Seal payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['spirit.lineage_register', 'spiritLineageRegisters: true', 'Jade Lineage Register label/state', 'Jade Lineage Register Seal payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['spirit.roster_cabinet', 'spiritRosterCabinets: true', 'Jade Roster Cabinet label/state', 'Jade Roster Cabinet Tag payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['spirit.blossom_cradle', 'spiritBlossomCradles: true', 'Jade Blossom Cradle label/state', 'Jade Blossom Cradle Ribbon payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['battle.dojo_ladder', 'dojoLadders: true', 'Jade Dojo Ladder label/state', 'Jade Dojo Ladder Seal payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['battle.sifu_council', 'sifuCouncils: true', 'Jade Sifu Council label/state', 'Jade Sifu Council Crest payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['battle.summit_circuit', 'summitCircuits: true', 'Jade Summit Circuit label/state', 'Jade Summit Circuit Laurel payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['spirit.relic_attune', 'spiritRelicAttunements: true', 'Jade Relic Attunement label/state', 'Jade Relic Silk Cord payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['spirit.starter_vow', 'spiritStarterVows: true', 'Jade Starter Vow label/state', 'Jade Starter Knot payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['market.guild_receipt', 'guildReceipts: true', 'Jade Court Market Receipt label/state', 'Jade Market Receipt payload preservation']
  },
  {
    file: 'docs/monero-treasury.md',
    includes: ['Monero can mine XMR, but it cannot directly fund Enjin Canary cENJ', 'operator system', 'No browser mining', 'GitHub Actions mining', 'Starting a miner is cost-bearing', 'dedicated mining wallet', 'Do not expose `monero-wallet-rpc` remotely', 'Alpha remains no-real-value', 'Do not try to convert XMR into cENJ', 'min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations', 'admin kill switch', 'npm run alpha:monero-operator-handoff']
  },
  {
    file: 'scripts/check-monero-treasury-guardrails.mjs',
    includes: ['Monero treasury guardrails OK', 'forbiddenTrackedFilePatterns', 'Monero wallet password assignment', 'Monero private spend key assignment', 'Exchange API secret assignment', 'monero-wallet-cli.exe', 'xmrig.exe', 'p2pool.exe', 'write-monero-operator-handoff.mjs']
  },
  {
    file: 'scripts/write-monero-operator-handoff.mjs',
    includes: ['Wrote no-secret Monero operator handoff', 'monero-operator-handoff.json', 'monero-operator-handoff.md', 'forbiddenProcessNames', 'noMiningStarted: true', 'officialProcedures', 'withdrawalCapFormula']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'Do not set dummy', 'Never credit inventory', 'Mochirii Vercel Preview', 'NEXT_PUBLIC_MOCHI_SOCIAL_URL', 'MOCHI_SOCIAL_AUTH', 'check:mochi-social-bridge-state', 'Alpha Preview Ready can pass while funded-chain gates are red']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Technique Codex proof', 'Jade Technique Codex Seal', 'Move-library proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Lineage Register proof', 'Jade Lineage Register Seal', 'Lineage proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Roster Cabinet proof', 'Jade Roster Cabinet Tag', 'Roster cabinet proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Blossom Cradle proof', 'Jade Blossom Cradle Ribbon', 'Blossom cradle proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Dojo Ladder proof', 'Jade Dojo Ladder Seal', 'Dojo ladder proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Sifu Council proof', 'Jade Sifu Council Crest', 'Sifu council proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Summit Circuit proof', 'Jade Summit Circuit Laurel', 'Summit circuit proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Relic Attunement proof', 'Jade Relic Silk Cord', 'Relic attunement proof is no-real-value']
  },
  {
    file: 'docs/no-cost-operations.md',
    includes: ['No-Cost Operations Guardrail', 'Stop And Ask First', 'Public-repo branch pushes are allowed', 'Fuel Tanks', 'hosted load tests', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'Current Cost Posture', 'alpha:local-site-iframe', 'alpha:manual-prompt-review', 'alpha:wallet-daemon-check', 'alpha:provider-preflight', 'alpha:sync-approval', 'Alpha Preview Ready', 'dummy `ENJIN_COLLECTION_ID`', 'funded-chain lane is expected red', 'verified milestone deploy queue', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy']
  },
  {
    file: 'docs/codex-external-ops.md',
    includes: [
      'Source Hierarchy',
      'Source Basis',
      'Alpha Preview Ready Lane',
      'preview-live-gates',
      'funded-chain-gates',
      'Do not set dummy Enjin IDs',
      'Build the next alpha feature against no-real-value Alpha Preview Ready',
      'Secret Entry Protocol',
      'Preview Environment Matrix',
      'CI Gate Checklist',
      'Supabase Authority Matrix',
      'Enjin Canary State Machine',
      'Fuel Tank Dispatch Contract',
      'WebSocket And Presence Verification',
      'Discord Boundary',
      'Computer Use',
      'No-Cost Default'
    ]
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Alpha RC Ready', 'Enjin Canary', 'static secret scans', 'Two browser tabs show player presence', 'npm run alpha:local-acceptance', 'npm run alpha:browser-presence', 'npm run alpha:local-site-iframe', 'movement/action keys do not scroll', 'Mochirii `/games/mochi-social` iframe', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:enjin-operator-smoke', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'docs/alpha-preview-ready.md']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Technique Codex proof', 'Jade Technique Codex', 'seal the Jade Technique Codex']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Lineage Register proof', 'Jade Lineage Register', 'Record Jade Lineage Register proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Roster Cabinet proof', 'Jade Roster Cabinet', 'Organize Jade Roster Cabinet proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Blossom Cradle proof', 'Jade Blossom Cradle', 'Record Jade Blossom Cradle proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Dojo Ladder proof', 'Jade Dojo Ladder', 'clear the Jade Dojo Ladder', 'no-real-value Jade Dojo Ladder']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Relic Attunement proof', 'Jade Relic Silk Cord', 'Jade Summit Circuit']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Sifu Council proof', 'Jade Sifu Council', 'clear the Jade Sifu Council', 'no-real-value Jade Sifu Council']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Summit Circuit proof', 'Jade Summit Circuit', 'clear the Jade Summit Circuit', 'no-real-value Jade Summit Circuit']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'npm run alpha:browser-presence', 'npm run alpha:responsive-gameplay', 'npm run alpha:visual-snapshot', 'npm run alpha:visual-review', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:enjin-operator-smoke', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:preview-ready', 'npm run alpha:operator-checklist', 'npm run alpha:sync-approval', 'npm run alpha:rc-audit', 'check:mochi-social-bridge-state', 'Two-tab Presence Gate', 'Responsive Gameplay Gate', 'Visual Snapshot Gate', 'Manual Prompt Review Gate', 'Wallet Daemon Local Check', 'canvas movement response', 'observer-side canvas change', 'current local HEAD', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'reports/alpha-browser-presence.json', 'reports/alpha-responsive-gameplay.json', 'reports/alpha-visual-page.png', 'reports/alpha-visual-review.md', 'reports/alpha-manual-prompt-review.md', 'reports/wallet-daemon-local.md', 'reports/alpha-local-evidence.md', 'reports/alpha-operator-checklist.json', 'reports/alpha-external-gates.json', 'reports/alpha-preview-ready.json', 'reports/alpha-report-hygiene.json', 'no-real-value fallback ledger', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'No dummy']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['Jade Scroll Story Chapter proof', 'story-chapter', 'story, chronicle']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.technique_codex', 'Jade Technique Codex', 'Jade Technique Codex Seal', 'techniqueCodexProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.lineage_register', 'Jade Lineage Register', 'Jade Lineage Register Seal', 'lineageRegisterProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.roster_cabinet', 'Jade Roster Cabinet', 'Jade Roster Cabinet Tag', 'rosterCabinetProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.blossom_cradle', 'Jade Blossom Cradle', 'Jade Blossom Cradle Ribbon', 'blossomCradleProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.dojo_ladder', 'Jade Dojo Ladder', 'Jade Dojo Ladder Seal', 'dojoLadderProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.rival_circle', 'Jade Rival Circle proof', 'rival-circle']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.sifu_council', 'Jade Sifu Council', 'Jade Sifu Council Crest', 'sifuCouncilProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.summit_circuit', 'Jade Summit Circuit', 'Jade Summit Circuit Laurel', 'summitCircuitProof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'alpha:browser-presence', 'alpha:responsive-gameplay', 'alpha:manual-prompt-review', 'alpha:wallet-daemon-check', 'alpha:enjin-operator-smoke', 'alpha:external-gates', 'alpha:operator-checklist', 'alpha:sync-approval', 'alpha:preview-ready', 'alpha:rc-audit', 'Wallet Daemon', 'Alpha Preview Ready', 'Alpha RC Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'docs/codex-external-ops.md', 'Current Private Gates']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Scroll Story Chapter proof', 'story-chapter']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['technique-codex', 'seal the Jade Technique Codex proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['lineage-register', 'record the Jade Lineage Register proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['roster-cabinet', 'organize the Jade Roster Cabinet proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['blossom-cradle', 'record the Jade Blossom Cradle proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['sifu-council', 'clear the Jade Sifu Council proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['summit-circuit', 'clear the Jade Summit Circuit proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['dojo-ladder', 'clear the Jade Dojo Ladder proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Rival Circle proof', 'tournament-bracket/rival-circle']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Scroll Story Chapter', 'Jade Scroll Story Chapter proof']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Rival Circle', 'Jade Rival Circle proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Scroll Story Chapter contribution', 'content-only Jade Scroll Story Chapter proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Rival Circle contribution', 'content-only Jade Rival Circle Mark proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Technique Codex contribution', 'content-only Jade Technique Codex Seal proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Roster Cabinet contribution', 'content-only Jade Roster Cabinet Tag proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Blossom Cradle contribution', 'content-only Jade Blossom Cradle Ribbon proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Dojo Ladder contribution', 'content-only Jade Dojo Ladder Seal proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Sifu Council contribution', 'content-only Jade Sifu Council Crest proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Summit Circuit contribution', 'content-only Jade Summit Circuit Laurel proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Scroll Story Chapter proof', 'story']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Rival Circle proof', 'rival, summit']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Technique Codex proof', 'technique codex']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Roster Cabinet proof', 'roster cabinet']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Blossom Cradle proof', 'blossom cradle']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Dojo Ladder proof', 'ladder', 'content-only']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Sifu Council proof', 'council', 'content-only']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Summit Circuit proof', 'summit', 'content-only']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Scroll Story Chapter', 'Jade Scroll Story Chapter proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Rival Circle', 'Jade Rival Circle proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Technique Codex move-library proof', 'battle.technique_codex']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Roster Cabinet proof', 'spirit.roster_cabinet', 'rosterCabinetProof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Blossom Cradle proof', 'spirit.blossom_cradle', 'blossomCradleProof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder proof', 'battle.dojo_ladder']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council proof', 'battle.sifu_council']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Summit Circuit', 'Jade Summit Circuit proof', 'battle.summit_circuit']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Scroll Story Chapter proof', 'record the Jade Scroll Story Chapter']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Rival Circle proof', 'clear the Jade Rival Circle', 'no-real-value Jade Rival Circle']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Scroll Story Chapter', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Rival Circle', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Technique Codex', 'Jade Technique Codex Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Roster Cabinet', 'Jade Roster Cabinet Tag', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Blossom Cradle', 'Jade Blossom Cradle Ribbon', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council Crest', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Summit Circuit', 'Jade Summit Circuit Laurel', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Dialogue Scroll', 'Jade Dialogue Scroll Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Battle Chronicle', 'Jade Battle Chronicle Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Rival Circle', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Scroll Story Chapter', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Technique Codex', 'Jade Technique Codex Seal', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Roster Cabinet', 'Jade Roster Cabinet Tag', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Blossom Cradle', 'Jade Blossom Cradle Ribbon', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder Seal', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council Crest', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Summit Circuit', 'Jade Summit Circuit Laurel', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['Jade Insignia Case proof', 'guild-insignia-case', 'story, insignia case, chronicle']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['world.encounter_atlas', 'Jade Encounter Atlas', 'encounter atlas']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.habitat_census', 'Jade Habitat Census', 'habitat census']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['world.encounter_rotation', 'Jade Encounter Rotation', 'encounter rotation']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['world.weather_veil', 'Jade Weather Veil', 'weather veil']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Insignia Case proof', 'guild-insignia-case']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Encounter Atlas proof', 'encounter-atlas']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Habitat Census proof', 'habitat-census']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Weather Veil proof', 'weather-veil']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Encounter Rotation proof', 'encounter-rotation']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Insignia Case', 'Jade Insignia Case proof']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Encounter Atlas', 'Jade Encounter Atlas proof']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Habitat Census', 'Jade Habitat Census proof']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Encounter Rotation', 'Jade Encounter Rotation proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Insignia Case contribution', 'content-only Jade Insignia Case proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Encounter Atlas contribution', 'content-only Jade Encounter Atlas proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Habitat Census contribution', 'content-only Jade Habitat Census Seal proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Encounter Rotation contribution', 'content-only Jade Encounter Rotation Scroll proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Insignia Case proof', 'insignia case']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Encounter Atlas proof', 'encounter atlas']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Habitat Census proof', 'census']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Encounter Rotation proof', 'encounter rotation']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Insignia Case', 'Jade Insignia Case proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Encounter Atlas', 'Jade Encounter Atlas proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Habitat Census', 'Jade Habitat Census proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Encounter Rotation', 'Jade Encounter Rotation proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Insignia Case proof', 'seal the Jade Insignia Case']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Encounter Atlas proof', 'record the Jade Encounter Atlas']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Habitat Census proof', 'record the Jade Habitat Census']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Encounter Rotation proof', 'record the Jade Encounter Rotation']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Insignia Case', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Encounter Atlas', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Habitat Census', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Encounter Rotation', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Insignia Case', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Encounter Atlas', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Habitat Census', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Encounter Rotation', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'AGENTS.md',
    includes: ['Jade Teahouse Recovery proof', 'nurture/recover/kinship', 'recovery tea proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.recovery_tea', 'Jade Teahouse Recovery proof', 'nurture-rite/recovery-tea']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Teahouse Recovery proof', 'recovery-tea']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Teahouse Recovery', 'Jade Teahouse Recovery proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Teahouse Recovery contribution', 'content-only Jade Teahouse Recovery Cup proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Teahouse Recovery proof', 'recover', 'content-only']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Teahouse Recovery', 'Jade Teahouse Recovery proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Teahouse Recovery proof', 'record the Jade Teahouse Recovery', 'no-real-value Jade Teahouse Recovery']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Teahouse Recovery', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Teahouse Recovery', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'AGENTS.md',
    includes: ['Jade Nursery Grove proof', 'nurture/recover/kinship/nursery/ascendance/lineage/cradle/capture-rite', 'nursery grove proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.nursery_grove', 'Jade Nursery Grove proof', 'kinship-album/nursery-grove/bloom-ascendance/lineage-register/capture-rite']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Nursery Grove proof', 'nursery-grove']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Nursery Grove', 'Jade Nursery Grove proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Nursery Grove contribution', 'content-only Jade Nursery Sprout proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Nursery Grove proof', 'nursery', 'content-only']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Nursery Grove', 'Jade Nursery Grove proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Nursery Grove proof', 'record the Jade Nursery Grove', 'no-real-value Jade Nursery Grove']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Nursery Grove', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Nursery Grove', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'AGENTS.md',
    includes: ['Jade Bloom Ascendance proof', 'nurture/recover/kinship/nursery/ascendance/lineage/cradle/capture-rite', 'bloom ascendance proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.bloom_ascendance', 'Jade Bloom Ascendance proof', 'kinship-album/nursery-grove/bloom-ascendance/lineage-register/capture-rite']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Bloom Ascendance proof', 'bloom-ascendance']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Bloom Ascendance', 'Jade Bloom Ascendance proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Bloom Ascendance contribution', 'content-only Jade Bloom Ascendance Sigil proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Bloom Ascendance proof', 'ascendance', 'content-only']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Bloom Ascendance', 'Jade Bloom Ascendance proof', 'spirit.bloom_ascendance']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Bloom Ascendance proof', 'record the Jade Bloom Ascendance', 'no-real-value Jade Bloom Ascendance']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Bloom Ascendance', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Bloom Ascendance', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'AGENTS.md',
    includes: ['Jade Kinship Album proof', 'Jade Capture Rite proof', 'nurture/recover/kinship/nursery/ascendance/lineage/cradle/capture-rite/bracket', 'capture rite proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['spirit.kinship_album', 'spirit.capture_rite', 'Jade Capture Rite proof', 'kinship-album/nursery-grove/bloom-ascendance/lineage-register/capture-rite']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Kinship Album proof', 'Jade Capture Rite proof']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Kinship Album', 'Jade Capture Rite', 'Jade Capture Rite proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Kinship Album contribution', 'Jade Capture Rite contribution', 'content-only Jade Capture Rite proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Kinship Album proof', 'Jade Capture Rite proof', 'capture rite']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Kinship Album', 'Jade Capture Rite', 'Jade Capture Rite proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Kinship Album proof', 'Jade Capture Rite proof', 'record the Jade Capture Rite']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Affinity Matrix proof', 'affinityMatrixProof', 'Jade Affinity Matrix Seal']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Kinship Album', 'Jade Capture Rite', 'Jade Affinity Matrix', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Kinship Album', 'Jade Capture Rite', 'Jade Affinity Matrix', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['battle.affinity_matrix', 'Jade Affinity Matrix', 'affinityMatrixProof', 'Jade Affinity Matrix Seal']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Affinity Matrix proof', 'Jade Affinity Matrix Seal', 'no-real-value']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Affinity Matrix proof', 'battle.affinity_matrix', 'Jade Affinity Matrix Seal']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Affinity Matrix proof', 'matrix', 'content-only']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Affinity Matrix', 'Jade Affinity Matrix Seal', 'content-only party strategy proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['affinity-matrix', 'map the Jade Affinity Matrix proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['market.guild_receipt', 'Jade Court Market Receipt', 'marketReceiptProof', 'Jade Market Receipt']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Court Market Receipt proof', 'Jade Market Receipt', 'Fixed-price receipt proof is no-real-value']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Court Market Receipt proof', 'market.guild_receipt', 'Jade Market Receipt']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Court Market Receipt proof', 'content-only']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Court Market Receipt', 'Jade Market Receipt', 'content-only fixed-price purchase proof']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Court Market Receipt', 'Jade Market Receipt', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Court Market Receipt', 'Jade Market Receipt', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['market-receipt', 'record the Jade Court Market Receipt proof']
  },
  {
    file: 'AGENTS.md',
    includes: ['item.provision_catalog', 'itemProvisionCatalogs: true', 'Jade Provision Catalog label/state', 'Jade Provision Catalog Seal payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['item.battle_kit', 'battleItemKits: true', 'Jade Battle Kit label/state', 'Jade Battle Kit Tag payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['item.remedy_pouch', 'remedyPouches: true', 'Jade Remedy Pouch label/state', 'Jade Remedy Pouch Tag payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['quest.ledger_record', 'story.dialogue_scroll', 'questLedgers: true', 'storyDialogueScrolls: true', 'Jade Quest Ledger/Jade Dialogue Scroll label state']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['item.provision_catalog', 'Jade Provision Catalog', 'provisionCatalogProof', 'Jade Provision Catalog Seal']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['item.battle_kit', 'Jade Battle Kit', 'battleKitProof', 'Jade Battle Kit Tag']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['quest.ledger_record', 'Jade Quest Ledger', 'questLedgerProof', 'Jade Quest Ledger Seal']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['item.remedy_pouch', 'Jade Remedy Pouch', 'remedyPouchProof', 'Jade Remedy Pouch Tag']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Provision Catalog proof', 'Jade Provision Catalog Seal', 'Provision catalog proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Battle Kit proof', 'Jade Battle Kit Tag', 'Battle kit proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Remedy Pouch proof', 'Jade Remedy Pouch Tag', 'Remedy pouch proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Quest Ledger proof', 'Jade Dialogue Scroll', 'Jade Dialogue Scroll Seal', 'Quest ledger and dialogue scroll proof are no-real-value']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Provision Catalog proof', 'item.provision_catalog', 'Jade Provision Catalog Seal']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Battle Kit proof', 'item.battle_kit', 'Jade Battle Kit Tag']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Remedy Pouch proof', 'item.remedy_pouch', 'Jade Remedy Pouch Tag']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Quest Ledger proof', 'quest.ledger_record', 'Jade Quest Ledger Seal']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Provision Catalog proof', 'catalog', 'content-only']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Battle Kit proof', 'kit', 'content-only']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Remedy Pouch proof', 'Remedy', 'content-only']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Quest Ledger proof', 'quest ledger', 'content-only']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Provision Catalog', 'Jade Provision Catalog Seal', 'content-only item recipe proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Battle Kit', 'Jade Battle Kit Tag', 'content-only battle item kit proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Remedy Pouch', 'Jade Remedy Pouch Tag', 'content-only remedy pouch proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Quest Ledger', 'Jade Quest Ledger Seal', 'content-only quest ledger proof']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Provision Catalog', 'Jade Provision Catalog Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Battle Kit', 'Jade Battle Kit Tag', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Quest Ledger', 'Jade Quest Ledger Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Remedy Pouch', 'Jade Remedy Pouch Tag', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Provision Catalog', 'Jade Provision Catalog Seal', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Battle Kit', 'Jade Battle Kit Tag', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Remedy Pouch', 'Jade Remedy Pouch Tag', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['provision-catalog', 'record the Jade Provision Catalog proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['battle-kit', 'record the Jade Battle Kit proof']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['remedy-pouch', 'record the Jade Remedy Pouch proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Provision Catalog proof', 'item.provision_catalog', 'provisionCatalogProof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Battle Kit proof', 'item.battle_kit', 'battleKitProof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Remedy Pouch proof', 'item.remedy_pouch', 'remedyPouchProof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['trade.exchange_accord', 'Jade Exchange Accord', 'exchangeAccordProof', 'Jade Exchange Accord Tally']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Exchange Accord proof', 'Jade Exchange Accord Tally', 'no-real-value']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Exchange Accord proof', 'trade.exchange_accord', 'Jade Exchange Accord Tally']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Exchange Accord proof', 'accord', 'content-only']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Exchange Accord', 'Jade Exchange Accord Tally', 'content-only social economy proof']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Exchange Accord', 'Jade Exchange Accord Tally', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Exchange Accord', 'Jade Exchange Accord Tally', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['exchange-accord', 'record the Jade Exchange Accord proof']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['world.route_charter', 'Jade Route Charter', 'routeCharterProof', 'Jade Route Charter Slip']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Route Charter proof', 'Jade Route Charter Slip', 'no-real-value']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Route Charter proof', 'world.route_charter', 'routeCharterProof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Route Charter proof', 'route charter', 'content-only']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Route Charter', 'Jade Route Charter Slip', 'content-only route charter proof']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Route Charter', 'Jade Route Charter Slip', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Route Charter', 'Jade Route Charter Slip', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['route-charter', 'record the Jade Route Charter proof']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Route Charter proof', 'world.route_charter', 'routeCharterProof']
  },
  {
    file: 'docs/site-integration.md',
    includes: ['MOCHI_SOCIAL_AUTH', 'chain.operation_update', 'Hot inventory can only be credited after the Enjin state is `FINALIZED`', 'Fuel Tank sponsored Canary transactions', 'CreateTransaction(transaction: { createListing: ... })', '/integration/alpha/enjin/submit', 'Alpha Preview Ready Contract', 'configured-preview-stub', 'Do not set dummy', 'preview-live-gates', 'funded-chain-gates']
  },
  {
    file: 'docs/deployment.md',
    includes: ['Node 24 LTS hosting wrapper plus the Unity WebGL shared-room runtime', 'MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true', 'MOCHI_SOCIAL_ALLOWED_ORIGINS', 'npm run build:release', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'alpha:wallet-daemon-check', 'Wallet Daemon must run as a separate service with no inbound ports', 'alpha:operator-checklist', 'For Alpha Preview Ready', 'Verified Milestone Deploy Queue', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy']
  },
  {
    file: 'docs/enjin-canary-alpha.md',
    includes: ['ENJIN_NETWORK="CANARY"', 'Fuel Tank', 'Only when state is `FINALIZED`', 'no inbound ports', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'pollEnjinTransaction', '/integration/alpha/enjin/submit', 'x-mochi-social-server-token', 'confirmNoRealValue=true', 'alpha:wallet-daemon-check', 'alpha:enjin-operator-smoke', 'Cloud Wallet Daemon Gate', 'Local Wallet Daemon Binary Check', 'AWS CloudFormation', 'KEY_PASS', 'PLATFORM_KEY', 'For Alpha Preview Ready']
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['noRealValue: true', 'sharedRoom: true', 'desktopWebgl: true', 'curatedCharacterPresets: true', 'lirabaoCare: true', 'staleRevisionReload: true', 'avatarUploads: false', 'multipleRooms: false', 'sharding: false', 'mobileSpecificUi: false', "'unity.character.created'", "'unity.character.updated'", "'unity.pet.interaction'", "'unity.pet.state_saved'", "'unity.room.joined'", "'unity.room.left'"]
  },
  {
    file: 'apps/game/src/integration/manifest.ts',
    includes: ['UNITY_SHARED_ROOM_CONTRACT', "engine: 'unity-webgl'", "scene: 'JadeLanternRoom'", "mode: 'single-shared-room'", 'capacity: 25', "sharedPetKey: 'lirabao'", "states: ['idle', 'approach', 'happy', 'care_received', 'stale_revision_reload', 'unavailable']", "artDirection: 'Mochirii courtyard 3D'", "scope: 'single-shared-room'", "integration: ['/integration/alpha/status', '/integration/alpha/progress', '/integration/alpha/action']"]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['UNITY_SHARED_ROOM_CONTRACT', "engine: 'unity-webgl'", "key: 'jade-lantern-room-alpha'", "mode: 'single-shared-room'", 'capacity: 25', "sharedPetKey: 'lirabao'", "states: ['idle', 'approach', 'happy', 'care_received', 'stale_revision_reload', 'unavailable']", "'unity.pet.interaction'", "'unity.pet.state_saved'", "'unity.room.joined'", "'unity.room.left'"]
  },
  {
    file: 'apps/game/src/integration/enjin-canary.ts',
    includes: ["network: 'CANARY'", 'fuelTank: config.fuelTankId', 'idempotencyKey: input.requestId', 'executeEnjinGraphqlPlan', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'createListing:', 'pollEnjinTransaction', 'normalizeEnjinTransactionState', 'canCreditHotInventory', 'config.fuelTankId']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['BRIDGE_EVENTS.auth', 'Authorization', 'lirabao-canary-certificate', 'chain.withdraw_request', 'chain.deposit_request', 'chain.operation_update', 'data-alpha-action="chain.deposit_request"', 'data-alpha-action="chain.operation_update"', 'data-canary-finality-label', 'canaryReturnRequested', 'canaryOperationReviewProof', 'canaryInventoryCredited', 'data-presence-label', 'data-profile-label', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-guild-label', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-rank-label', 'guildRankProof', 'data-growth-label', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-status-label', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'fieldAccordTalismanClaimed', 'SPIRIT_FIELD_ACCORDS', 'resolveSpiritFieldAccord', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'SPIRIT_SANCTUARY_RITES', 'resolveSpiritSanctuaryRite', 'data-alpha-action="spirit.sanctuary_rite"', 'data-sanctuary-label', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'data-compendium-label', 'compendiumProof', 'SPIRIT_ROSTER_ARCHIVES', 'resolveSpiritRosterArchive', 'data-alpha-action="spirit.roster_archive"', 'data-archive-label', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive', 'SPIRIT_CARE_CYCLES', 'resolveSpiritCareCycle', 'data-alpha-action="spirit.care_cycle"', 'data-care-cycle-label', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle', 'SPIRIT_TEMPERAMENT_CONCORDS', 'resolveSpiritTemperamentConcord', 'data-alpha-action="spirit.temperament_concord"', 'data-temperament-label', 'temperamentConcordProof', 'temperamentCharmClaimed', 'Jade Temperament Concord', 'SPIRIT_FIELD_ALMANACS', 'resolveSpiritFieldAlmanac', 'data-alpha-action="spirit.field_almanac"', 'data-field-almanac-label', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac', 'SPIRIT_HABITAT_CENSUSES', 'resolveSpiritHabitatCensus', 'data-alpha-action="spirit.habitat_census"', 'data-habitat-census-label', 'habitatCensusProof', 'habitatCensusSealClaimed', 'Jade Habitat Census', 'data-alpha-action="item.provision_satchel"', 'data-provision-label', 'provisionProof', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'data-alpha-action="guild.social_rally"', 'data-rally-label', 'guildSocialRally', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'GUILD_WAYFARER_CHRONICLES', 'resolveGuildWayfarerChronicle', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'GUILD_ASCENSION_TRIALS', 'resolveGuildAscensionTrial', 'data-alpha-action="guild.ascension_trial"', 'data-ascension-label', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial', 'SPIRIT_TOURNAMENT_BRACKETS', 'resolveSpiritTournamentBracket', 'data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'data-loadout-label', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'data-trait-label', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'data-condition-label', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'data-mentor-label', 'data-battle-round-label', 'battleRoundProof', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['MARKET_GUILD_RECEIPTS', 'resolveMarketGuildReceipt', 'data-alpha-action="market.guild_receipt"', 'marketReceiptProof', 'marketReceiptClaimed', 'Jade Court Market Receipt']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_PROVISION_CATALOGS', 'resolveSpiritProvisionCatalog', 'data-alpha-action="item.provision_catalog"', 'data-provision-catalog-label', 'provisionCatalogProof', 'provisionCatalogSealClaimed', 'Jade Provision Catalog']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_BATTLE_KITS', 'resolveSpiritBattleKit', 'data-alpha-action="item.battle_kit"', 'data-battle-kit-label', 'battleKitProof', 'battleKitTagClaimed', 'Jade Battle Kit']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_REMEDY_POUCHES', 'resolveSpiritRemedyPouch', 'data-alpha-action="item.remedy_pouch"', 'data-remedy-pouch-label', 'remedyPouchProof', 'remedyPouchTagClaimed', 'Jade Remedy Pouch']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_PATROLS', 'resolveSpiritRoutePatrol', 'data-alpha-action="world.route_patrol"', 'data-route-patrol-label', 'routePatrolProof', 'routePatrolPennantClaimed']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_AFFINITY_MATRICES', 'resolveSpiritAffinityMatrix', 'data-alpha-action="battle.affinity_matrix"', 'data-affinity-matrix-label', 'affinityMatrixProof', 'affinityMatrixSealClaimed', 'Jade Affinity Matrix']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_RELIC_ATTUNEMENTS', 'resolveSpiritRelicAttunement', 'data-alpha-action="spirit.relic_attune"', 'data-relic-attunement-label', 'relicAttunementProof', 'relicSilkCordClaimed', 'Jade Relic Attunement']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_STARTER_VOWS', 'resolveSpiritStarterVow', 'data-alpha-action="spirit.starter_vow"', 'data-starter-vow-label', 'starterVowProof', 'starterKnotClaimed', 'Jade Starter Vow']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_TECHNIQUE_CODEXES', 'resolveSpiritTechniqueCodex', 'data-alpha-action="battle.technique_codex"', 'data-technique-codex-label', 'techniqueCodexProof', 'techniqueCodexSealClaimed', 'Jade Technique Codex']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_ECOLOGY_SURVEYS', 'resolveSpiritRouteEcologySurvey', 'data-alpha-action="world.route_ecology"', 'data-route-ecology-label', 'routeInvitedSpiritIds', 'routeEcologyProof', 'routeEcologyMapClaimed', 'Jade Route Ecology Survey']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_WEATHER_VEILS', 'resolveSpiritWeatherVeil', 'data-alpha-action="world.weather_veil"', 'data-weather-veil-label', 'weatherVeilProof', 'weatherVeilChartClaimed', 'Jade Weather Veil']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ENCOUNTER_ATLASES', 'resolveSpiritEncounterAtlas', 'data-alpha-action="world.encounter_atlas"', 'data-encounter-atlas-label', 'encounterAtlasProof', 'encounterAtlasClaimed', 'Jade Encounter Atlas']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_HABITAT_CENSUSES', 'resolveSpiritHabitatCensus', 'data-alpha-action="spirit.habitat_census"', 'data-habitat-census-label', 'habitatCensusProof', 'habitatCensusSealClaimed', 'Jade Habitat Census']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_CRAFT_WRITS', 'resolveSpiritCraftWrit', 'data-alpha-action="item.craft_writ"', 'data-craft-writ-label', 'craftWritProof', 'craftWritClaimed', 'Jade Court Craft Writ']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['TRADE_EXCHANGE_ACCORDS', 'resolveTradeExchangeAccord', 'data-alpha-action="trade.exchange_accord"', 'data-exchange-accord-label', 'exchangeAccordProof', 'exchangeAccordTallyClaimed', 'Jade Exchange Accord']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_WAYSTONES', 'resolveSpiritRouteWaystone', 'data-alpha-action="world.route_waystone"', 'data-route-waystone-label', 'routeWaystoneProof', 'routeWaystoneSealClaimed', 'Jade Cloudbell Waystone']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_CHARTERS', 'resolveSpiritRouteCharter', 'data-alpha-action="world.route_charter"', 'data-route-charter-label', 'routeCharterProof', 'routeCharterSlipClaimed', 'Jade Route Charter']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_NURTURE_RITES', 'resolveSpiritNurtureRite', 'data-alpha-action="spirit.nurture_rite"', 'data-nurture-rite-label', 'nurtureRiteProof', 'nurtureRibbonClaimed', 'Jade Moonwell Nurture Rite']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_RECOVERY_TEAS', 'resolveSpiritRecoveryTea', 'data-alpha-action="spirit.recovery_tea"', 'data-recovery-tea-label', 'recoveryTeaProof', 'recoveryTeaCupClaimed', 'Jade Teahouse Recovery']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_KINSHIP_ALBUMS', 'resolveSpiritKinshipAlbum', 'data-alpha-action="spirit.kinship_album"', 'data-kinship-album-label', 'kinshipAlbumProof', 'kinshipAlbumClaimed', 'Jade Kinship Album']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_NURSERY_GROVES', 'resolveSpiritNurseryGrove', 'data-alpha-action="spirit.nursery_grove"', 'data-nursery-grove-label', 'nurseryGroveProof', 'nurserySproutClaimed', 'Jade Nursery Grove']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_BLOOM_ASCENDANCES', 'resolveSpiritBloomAscendance', 'data-alpha-action="spirit.bloom_ascendance"', 'data-bloom-ascendance-label', 'bloomAscendanceProof', 'bloomAscendanceSigilClaimed', 'Jade Bloom Ascendance']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_LINEAGE_REGISTERS', 'resolveSpiritLineageRegister', 'data-alpha-action="spirit.lineage_register"', 'data-lineage-register-label', 'lineageRegisterProof', 'lineageRegisterSealClaimed', 'Jade Lineage Register']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_CAPTURE_RITES', 'resolveSpiritCaptureRite', 'data-alpha-action="spirit.capture_rite"', 'data-capture-rite-label', 'captureRiteProof', 'captureRiteClaimed', 'Jade Capture Rite']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_DOJO_LADDERS', 'resolveSpiritDojoLadder', 'data-alpha-action="battle.dojo_ladder"', 'data-dojo-ladder-label', 'dojoLadderProof', 'dojoLadderSealClaimed', 'Jade Dojo Ladder']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_TOURNAMENT_BRACKETS', 'resolveSpiritTournamentBracket', 'data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_RIVAL_CIRCLES', 'resolveSpiritRivalCircle', 'data-alpha-action="battle.rival_circle"', 'data-rival-circle-label', 'rivalCircleProof', 'rivalCircleMarkClaimed', 'Jade Rival Circle']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_SIFU_COUNCILS', 'resolveSpiritSifuCouncil', 'data-alpha-action="battle.sifu_council"', 'data-sifu-council-label', 'sifuCouncilProof', 'sifuCouncilCrestClaimed', 'Jade Sifu Council']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_SUMMIT_CIRCUITS', 'resolveSpiritSummitCircuit', 'data-alpha-action="battle.summit_circuit"', 'data-summit-circuit-label', 'summitCircuitProof', 'summitCircuitLaurelClaimed', 'Jade Summit Circuit']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_BATTLE_CHRONICLES', 'resolveSpiritBattleChronicle', 'data-alpha-action="battle.battle_chronicle"', 'data-battle-chronicle-label', 'battleChronicleProof', 'battleChronicleSealClaimed', 'Jade Battle Chronicle']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['MOCHI_STORY_CHAPTERS', 'resolveMochiStoryChapter', 'data-alpha-action="story.chapter_complete"', 'data-story-label', 'storyChapterProof', 'storyScrollClaimed', 'Jade Scroll Story Chapter']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['MOCHI_DIALOGUE_SCROLLS', 'resolveMochiDialogueScroll', 'data-alpha-action="story.dialogue_scroll"', 'data-dialogue-scroll-label', 'dialogueScrollProof', 'dialogueScrollSealClaimed', 'Jade Dialogue Scroll']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['MOCHI_QUEST_LEDGERS', 'resolveMochiQuestLedger', 'data-alpha-action="quest.ledger_record"', 'data-quest-ledger-label', 'questLedgerProof', 'questLedgerSealClaimed', 'Jade Quest Ledger']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROSTER_CABINETS', 'resolveSpiritRosterCabinet', 'data-alpha-action="spirit.roster_cabinet"', 'data-roster-cabinet-label', 'rosterCabinetProof', 'rosterCabinetTagClaimed', 'Jade Roster Cabinet']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_BLOSSOM_CRADLES', 'resolveSpiritBlossomCradle', 'data-alpha-action="spirit.blossom_cradle"', 'data-blossom-cradle-label', 'blossomCradleProof', 'blossomCradleRibbonClaimed', 'Jade Blossom Cradle']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_BOND_GIFT_RITES', 'resolveSpiritBondGiftRite', 'data-alpha-action="item.bond_gift"', 'data-bond-gift-label', 'bondGiftProof', 'bondGiftRibbonClaimed', 'Jade Bond Gift Rite']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_NAME_BANNER_RITES', 'resolveSpiritNameBannerRite', 'data-alpha-action="spirit.name_banner"', 'data-name-banner-label', 'nameBannerProof', 'nameBannerTagClaimed', 'Jade Name Banner Rite']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['GUILD_INSIGNIA_CASES', 'resolveGuildInsigniaCase', 'data-alpha-action="guild.insignia_case"', 'data-insignia-label', 'insigniaCaseProof', 'insigniaCaseClaimed', 'Jade Insignia Case']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['cloudbell-reed-bank', 'aozhen', 'Moonbridge Goldleaf Accord', 'Cloudbell Skyvow Accord', 'jade-field-accord-talisman', 'resolveSpiritFieldAccord', 'spirit-field-accord', 'Jade Cloudbell Circuit', 'cloudbell-route-knot', 'resolveSpiritRouteMastery', 'world-route-mastery', 'Jade Court Habitat Bond', 'jade-court-habitat-tassel', 'resolveSpiritHabitatBond', 'spirit-habitat-bond', 'Jade Court Sanctuary Rite', 'jade-sanctuary-bell', 'resolveSpiritSanctuaryRite', 'spirit-sanctuary-rite', 'Jade Court Research Folio', 'jade-court-research-folio', 'resolveSpiritResearchFolio', 'spirit-research-folio', 'Jade Court Spirit Compendium', 'jade-court-compendium-seal', 'resolveSpiritCompendiumCompletion', 'spirit-compendium', 'Jade Court Roster Archive', 'jade-roster-archive-seal', 'resolveSpiritRosterArchive', 'spirit-roster-archive', 'Jade Court Care Cycle', 'jade-care-cycle-knot', 'resolveSpiritCareCycle', 'spirit-care-cycle', 'Jade Temperament Concord', 'jade-temperament-charm', 'resolveSpiritTemperamentConcord', 'spirit-temperament-concord', 'Jade Field Almanac', 'jade-field-almanac-clasp', 'resolveSpiritFieldAlmanac', 'spirit-field-almanac', 'Jade Court Provision Satchel', 'jade-court-provision-satchel', 'Jade Mooncake Box', 'jade-mooncake-box', 'resolveSpiritProvisionSatchel', 'item-provision-satchel', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'resolveGuildSocialRally', 'guild-social-rally', 'Jade Wayfarer Chronicle', 'jade-wayfarer-chronicle-clasp', 'resolveGuildWayfarerChronicle', 'guild-wayfarer-chronicle', 'Jade Court Ascension Trial', 'jade-court-ascension-ribbon', 'resolveGuildAscensionTrial', 'guild-ascension-trial', 'Jade Step Loadout', 'jade-step-loadout-slip', 'resolveSpiritTechniqueLoadout', 'spirit-technique-loadout', 'Jade Heart Trait Attunement', 'jade-heart-trait-thread', 'resolveSpiritTraitAttunement', 'spirit-trait-attunement', 'Jade Mirror Condition Weave', 'jade-mirror-condition-charm', 'Lantern Ward', 'Goldleaf Tempo', 'Skybell Guard', 'resolveSpiritConditionWeave', 'battle-condition-weave', 'Silk Banner Mentor Drill', 'silk-banner-mentor-seal', 'resolveSpiritMentorChallenge', 'battle-mentor-challenge', 'Jade Banner Tournament', 'jade-banner-tournament-pennant', 'resolveSpiritTournamentBracket', 'battle-tournament-bracket', 'tournamentProof', 'Silk Market Kindness', 'Skybell Spar', 'selectMochiSpiritQuest', 'resolveMochiSpiritQuestProgress', 'quest-chain']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['MOCHI_DIALOGUE_SCROLLS', 'Jade Dialogue Scroll', 'jade-dialogue-scroll-seal', 'resolveMochiDialogueScroll', 'story-dialogue-scroll', 'Sifu Narao', 'Warden Meilin', 'Keeper Haoran']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['MARKET_GUILD_RECEIPTS', 'Jade Court Market Receipt', 'jade-market-receipt', 'resolveMarketGuildReceipt', 'market-guild-receipt', 'marketReceiptProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_PROVISION_CATALOGS', 'Jade Provision Catalog', 'jade-provision-catalog-seal', 'resolveSpiritProvisionCatalog', 'item-provision-catalog', 'provisionCatalogProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_BATTLE_KITS', 'Jade Battle Kit', 'jade-battle-kit-tag', 'resolveSpiritBattleKit', 'item-battle-kit', 'battleKitProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_REMEDY_POUCHES', 'Jade Remedy Pouch', 'jade-remedy-pouch-tag', 'resolveSpiritRemedyPouch', 'item-remedy-pouch', 'remedyPouchProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Cloudbell Patrol', 'jade-route-patrol-pennant', 'resolveSpiritRoutePatrol', 'world-route-patrol']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Affinity Matrix', 'jade-affinity-matrix-seal', 'resolveSpiritAffinityMatrix', 'battle-affinity-matrix', 'affinityMatrixProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Relic Attunement', 'jade-relic-silk-cord', 'resolveSpiritRelicAttunement', 'spirit-relic-attunement', 'relicAttunementProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Starter Vow', 'jade-starter-knot', 'resolveSpiritStarterVow', 'spirit-starter-vow', 'starterVowProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Technique Codex', 'jade-technique-codex-seal', 'resolveSpiritTechniqueCodex', 'spirit-technique-codex', 'techniqueCodexProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Scroll Story Chapter', 'jade-scroll-story-chapter', 'resolveMochiStoryChapter', 'story-chapter', 'storyChapterProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['MOCHI_QUEST_LEDGERS', 'Jade Quest Ledger', 'jade-quest-ledger-seal', 'resolveMochiQuestLedger', 'quest-ledger', 'questLedgerProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Insignia Case', 'jade-insignia-case', 'resolveGuildInsigniaCase', 'guild-insignia-case', 'insigniaCaseProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Route Ecology Survey', 'jade-route-ecology-map', 'resolveSpiritRouteEcologySurvey', 'spirit-route-ecology', 'routeEcologyProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Encounter Atlas', 'jade-encounter-atlas', 'resolveSpiritEncounterAtlas', 'spirit-encounter-atlas', 'encounterAtlasProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_HABITAT_CENSUSES', 'resolveSpiritHabitatCensus', 'Jade Habitat Census', 'jade-habitat-census-seal', 'spirit-habitat-census', 'habitatCensusProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Rival Circle', 'jade-rival-circle-mark', 'resolveSpiritRivalCircle', 'battle-rival-circle', 'rivalCircleProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Court Craft Writ', 'jade-court-craft-writ', 'resolveSpiritCraftWrit', 'spirit-craft-writ', 'craftWritProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Exchange Accord', 'jade-exchange-accord-tally', 'resolveTradeExchangeAccord', 'trade-exchange-accord', 'exchangeAccordProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Cloudbell Waystone', 'jade-waystone-travel-seal', 'resolveSpiritRouteWaystone', 'world-route-waystone', 'routeWaystoneProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_ROUTE_CHARTERS', 'Jade Route Charter', 'jade-route-charter-slip', 'resolveSpiritRouteCharter', 'world-route-charter', 'routeCharterProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Moonwell Nurture Rite', 'jade-moonwell-nurture-ribbon', 'resolveSpiritNurtureRite', 'spirit-nurture-rite', 'nurtureRiteProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Teahouse Recovery', 'jade-teahouse-recovery-cup', 'resolveSpiritRecoveryTea', 'spirit-recovery-tea', 'recoveryTeaCup']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Kinship Album', 'jade-kinship-album', 'resolveSpiritKinshipAlbum', 'spirit-kinship-album', 'kinshipAlbumProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Nursery Grove', 'jade-nursery-sprout', 'resolveSpiritNurseryGrove', 'spirit-nursery-grove', 'nurserySprout']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Bloom Ascendance', 'jade-bloom-ascendance-sigil', 'resolveSpiritBloomAscendance', 'spirit-bloom-ascendance', 'bloomAscendanceProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Lineage Register', 'jade-lineage-register-seal', 'resolveSpiritLineageRegister', 'spirit-lineage-register', 'lineageRegisterProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_ROSTER_CABINETS', 'Jade Roster Cabinet', 'jade-roster-cabinet-tag', 'resolveSpiritRosterCabinet', 'spirit-roster-cabinet', 'rosterCabinetProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_BLOSSOM_CRADLES', 'Jade Blossom Cradle', 'jade-blossom-cradle-ribbon', 'resolveSpiritBlossomCradle', 'spirit-blossom-cradle', 'blossomCradleProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_BOND_GIFT_RITES', 'Jade Bond Gift Rite', 'jade-bond-gift-ribbon', 'resolveSpiritBondGiftRite', 'item-bond-gift', 'SpiritBondGiftProgress']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_NAME_BANNER_RITES', 'Jade Name Banner Rite', 'jade-name-banner-tag', 'resolveSpiritNameBannerRite', 'spirit-name-banner', 'SpiritNameBannerProgress']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Capture Rite', 'jade-court-capture-rite', 'jade-capture-rite-tally', 'resolveSpiritCaptureRite', 'spirit-capture-rite', 'captureRiteProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_DOJO_LADDERS', 'resolveSpiritDojoLadder', 'Jade Dojo Ladder', 'jade-dojo-ladder-seal', 'battle-dojo-ladder', 'dojoLadderProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Banner Tournament', 'jade-banner-tournament-pennant', 'resolveSpiritTournamentBracket', 'battle-tournament-bracket', 'tournamentProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_SIFU_COUNCILS', 'resolveSpiritSifuCouncil', 'Jade Sifu Council', 'jade-sifu-council-crest', 'battle-sifu-council', 'sifuCouncilProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_SUMMIT_CIRCUITS', 'resolveSpiritSummitCircuit', 'Jade Summit Circuit', 'jade-summit-circuit-laurel', 'battle-summit-circuit', 'summitCircuitProof']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['SPIRIT_BATTLE_CHRONICLES', 'resolveSpiritBattleChronicle', 'Jade Battle Chronicle', 'jade-battle-chronicle-seal', 'battle-chronicle', 'battleChronicleProof']
  },
  {
    file: 'scripts/check-alpha-browser-bridge-auth.mjs',
    includes: ['Mochi Social browser bridge auth check passed', 'payload.accessToken', 'setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });', 'postToParent(BRIDGE_EVENTS.authState', 'refreshToken', 'SUPABASE_SERVICE_ROLE_KEY', 'ENJIN_PLATFORM_TOKEN']
  },
  {
    file: 'apps/game/src/integration/supabase-edge-client.ts',
    includes: ['MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'x-mochi-social-server-token', 'ALPHA_EDGE_FUNCTIONS.action', 'ALPHA_EDGE_FUNCTIONS.progress', 'buildAlphaProgressRequest', 'JSON.stringify(action)', 'JSON.stringify({ playerId })']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/progress', '/integration/alpha/action', '/integration/alpha/enjin/submit', 'buildAlphaActionRequest', 'buildAlphaProgressRequest', 'getSupabaseEdgeConfig', 'ledgerVersion: 1', "source: 'local-alpha-ledger'", "alphaStopPoint: 'alpha-rc-ready'", "chainNetwork: 'CANARY'", 'requireGameServerToken', 'confirmNoRealValue', 'ALPHA_ACTION_TYPES.includes', 'questChains: true', 'routeMastery: true', 'fieldAccords: true', 'habitatBonds: true', 'spiritSanctuaryRites: true', 'spiritResearch: true', 'spiritCompendium: true', 'spiritRosterArchives: true', 'spiritCareCycles: true', 'spiritWeatherVeils: true', 'spiritEncounterAtlases: true', 'spiritHabitatCensuses: true', 'spiritCraftWrits: true', 'tradeExchangeAccords: true', 'routeWaystones: true', 'spiritNurtureRites: true', 'spiritTournamentBrackets: true', 'itemProvisions: true', 'guildCommissions: true', 'socialRallies: true', 'wayfarerChronicles: true', 'guildAscensionTrials: true', 'partyHarmony: true', 'harmonyTrials: true', 'teamSparMatches: true', 'mentorChallenges: true', 'techniqueLoadouts: true', 'spiritTraits: true', 'conditionWeaves: true', 'battleRoundTranscripts: true', 'spirit.capture', 'spirit.route_invite', 'world.route_mastery', 'spirit.habitat_bond', 'spirit.sanctuary_rite', 'spirit.research', 'spirit.compendium_complete', 'spirit.roster_archive', 'spirit.care_cycle', 'world.weather_veil', 'world.encounter_atlas', 'spirit.habitat_census', 'item.craft_writ', 'trade.exchange_accord', 'world.route_waystone', 'spirit.nurture_rite', 'battle.tournament_bracket', 'item.provision_satchel', 'guild.commission_complete', 'guild.social_rally', 'guild.wayfarer_chronicle', 'guild.ascension_trial', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'spirit.technique_loadout', 'spirit.trait_attune', 'battle.condition_weave', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'party.set', 'party.harmony_form', 'battle.harmony_trial', 'battle.team_spar_match', 'battle.mentor_challenge', 'battle.affinity_trial', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'chain.deposit_request', 'chain.operation_update', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritRosterCabinets: true', 'spirit.roster_cabinet', 'rosterCabinetIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritBlossomCradles: true', 'spirit.blossom_cradle', 'blossomCradleIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritBondGiftRites: true', 'item.bond_gift', 'bondGiftRiteIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritNameBannerRites: true', 'spirit.name_banner', 'nameBannerRiteIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routePatrols: true', 'world.route_patrol']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['itemProvisionCatalogs: true', 'item.provision_catalog', 'provisionCatalogIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['battleItemKits: true', 'item.battle_kit', 'battleKitIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['remedyPouches: true', 'item.remedy_pouch', 'remedyPouchIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritTemperamentConcords: true', 'spirit.temperament_concord', 'spiritFieldAlmanacs: true', 'spirit.field_almanac']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routeEcologySurveys: true', 'world.route_ecology']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritWeatherVeils: true', 'world.weather_veil']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritEncounterAtlases: true', 'world.encounter_atlas']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritHabitatCensuses: true', 'spirit.habitat_census']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritCraftWrits: true', 'item.craft_writ']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['tradeExchangeAccords: true', 'trade.exchange_accord']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routeWaystones: true', 'world.route_waystone']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routeCharters: true', 'world.route_charter', 'routeCharterIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritNurtureRites: true', 'spirit.nurture_rite']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritRecoveryTeas: true', 'spirit.recovery_tea']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritKinshipAlbums: true', 'spirit.kinship_album']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritNurseryGroves: true', 'spirit.nursery_grove']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritBloomAscendances: true', 'spirit.bloom_ascendance']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritLineageRegisters: true', 'spirit.lineage_register']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritCaptureRites: true', 'spirit.capture_rite']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritTournamentBrackets: true', 'battle.tournament_bracket']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritRivalCircles: true', 'battle.rival_circle']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['dojoLadders: true', 'battle.dojo_ladder']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['sifuCouncils: true', 'battle.sifu_council']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['summitCircuits: true', 'battle.summit_circuit']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['battleChronicles: true', 'battle.battle_chronicle', 'battleChronicleIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['spiritStoryChapters: true', 'story.chapter_complete']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['storyDialogueScrolls: true', 'story.dialogue_scroll', 'dialogueScrollIds']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['questLedgers: true', 'quest.ledger_record', 'questLedgerIds']
  },
  {
    file: 'apps/game/tests/enjin-canary.test.ts',
    includes: ['keeps operation planners Canary-only', 'requires a Canary Fuel Tank', 'only credits hot inventory after finalized chain state', 'chain.operation_update', 'submits hot-to-cold certificate proof', 'submits fixed listing proof', 'polls Enjin finality']
  },
  {
    file: 'apps/game/tests/enjin-operator-contract.test.ts',
    includes: ['allows finality polling without token id or amount fields', 'requires token id and amount for asset-moving submissions', 'requires fixed listing prices to be integer strings', 'keeps the no-real-value confirmation mandatory']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['allowlistRequired', 'noRealValue', 'finalityRequired']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['affinityMatrices: true']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['battleItemKits: true', "battleKitIds: ['jade-battle-kit']"]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['remedyPouches: true', "remedyPouchIds: ['jade-remedy-pouch']"]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['questLedgers: true', "questLedgerIds: ['jade-quest-ledger']"]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['spiritRosterCabinets: true', "rosterCabinetIds: ['jade-roster-cabinet']"]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['spiritBlossomCradles: true', "blossomCradleIds: ['jade-blossom-cradle']"]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['routeCharters: true', "routeCharterIds: ['jade-route-charter']"]
  },
  {
    file: 'apps/game/tests/alpha-content.test.ts',
    includes: ['SPIRIT_BLOSSOM_CRADLES', 'resolveSpiritBlossomCradle', 'jade-blossom-cradle-ribbon', 'blossomCradleProof']
  },
  {
    file: 'apps/game/tests/alpha-contract.test.ts',
    includes: ['ALPHA_ACTION_TYPES).toEqual', 'unity.pet.interaction', 'unity.pet.state_saved', 'market.fixed_list', 'trade.direct_offer', 'chain.operation_update']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['publishes the Unity WebGL shared-room contract', "scene: 'JadeLanternRoom'", "sharedPetKey: 'lirabao'", 'universalStarter: true', 'enabled: false']
  },
  {
    file: 'apps/game/tests/alpha-content.test.ts',
    includes: ['SPIRIT_ROUTE_CHARTERS', 'resolveSpiritRouteCharter', 'jade-route-charter-slip', 'routeCharterProof']
  },
  {
    file: 'apps/game/tests/alpha-contract.test.ts',
    includes: ['sharedRoom).toBe(true)', 'desktopWebgl).toBe(true)', 'curatedCharacterPresets).toBe(true)', 'lirabaoCare).toBe(true)', 'multipleRooms).toBe(false)', 'sharding).toBe(false)']
  },
  {
    file: 'apps/game/tests/map-object-contract.test.ts',
    includes: ['Mochi town map object contract', 'runtimeEventPlacements', 'welcome-npc', 'guild-seal-chest', 'care-shrine', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'market-board', 'trade-post', 'canary-shrine', 'no-real-value Enjin Canary certificate request', 'Jade Vault Return Proof', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'guild-social-rally', 'Jade Lantern Court', '25 * 18']
  },
  {
    file: 'apps/game/tests/map-event-behavior.test.ts',
    includes: ['Mochi town event behavior', 'Welcome NPC dialog', 'Mochirii Guild Seal', 'spirit-care', 'bond 5/5', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'training-ring', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'market-board', 'trade-post', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'guildSocialRally', 'mochiSocial.guild.rallyProof', 'no-real-value Enjin Canary certificate request', 'Jade Vault Return Proof', 'Wallet Daemon services']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['sifuCouncils: true']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['summitCircuits: true']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['battleChronicles: true', 'battleChronicleIds']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['spiritRelicAttunements: true']
  },
  {
    file: 'apps/game/tests/supabase-edge-client.test.ts',
    includes: ['scoped server token in a header only', 'authoritative progress snapshot request', 'not.toContain', 'SUPABASE_SERVICE_ROLE_KEY', 'mochi-social-alpha-action', 'mochi-social-alpha-progress']
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: ['/integration/alpha/status', 'closed Enjin Canary alpha contract', 'fixed-price/no-auction', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['chain.withdraw_request', 'chain.deposit_request', 'chain.operation_update', 'canary-finality-review', 'transactionState', 'previewStub', 'confirmNoCreditUntilFinalized', 'spirit.capture', 'spirit.route_invite', 'cloudbell-reed-bank', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'jade-field-accord-talisman', 'world.route_mastery', 'jade-cloudbell-circuit', 'spirit.habitat_bond', 'jade-court-habitat-bond', 'spirit.sanctuary_rite', 'jade-court-sanctuary-rite', 'spiritSanctuaryRites', 'Jade Court Sanctuary Rite', 'spirit.research', 'jade-court-research-folio', 'spirit.compendium_complete', 'jade-court-spirit-compendium', 'spirit.roster_archive', 'jade-court-roster-archive', 'spiritRosterArchives', 'Jade Court Roster Archive', 'spirit.care_cycle', 'jade-court-care-cycle', 'spiritCareCycles', 'Jade Court Care Cycle', 'spirit.temperament_concord', 'jade-temperament-concord', 'spiritTemperamentConcords', 'Jade Temperament Concord', 'spirit.field_almanac', 'jade-field-almanac', 'spiritFieldAlmanacs', 'Jade Field Almanac', 'spirit.habitat_census', 'jade-habitat-census', 'spiritHabitatCensuses', 'Jade Habitat Census', 'habitatCensusProof', 'jade-habitat-census-seal', 'item.provision_satchel', 'jade-court-provision-satchel', 'guild.commission_complete', 'jade-court-commission-ledger', 'guild.social_rally', 'jade-courtyard-rally', 'guild.wayfarer_chronicle', 'jade-wayfarer-chronicle', 'wayfarerChronicles', 'Jade Wayfarer Chronicle', 'guild.ascension_trial', 'jade-court-ascension-trial', 'guildAscensionTrials', 'Jade Court Ascension Trial', 'party.harmony_form', 'triune-jade-harmony', 'battle.harmony_trial', 'jade-echo-concord', 'battle.team_spar_match', 'jade-mirror-team-match', 'battle.mentor_challenge', 'silk-banner-mentor-drill', 'battle.tournament_bracket', 'jade-banner-tournament', 'spiritTournamentBrackets', 'Jade Banner Tournament', 'tournamentProof', 'spirit.technique_loadout', 'jade-step-loadout', 'spirit.trait_attune', 'jade-heart-trait', 'battle.condition_weave', 'jade-mirror-condition-weave', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'battle.affinity_trial', 'party.set', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'skybell-spar', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'canvasMovement.changedAfterFirstTabMove=true', 'lirabao-canary-certificate', '/integration/alpha/enjin/submit', 'invalid_game_server_token', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['market.guild_receipt', 'jade-court-market-receipt', 'guildReceipts', 'Jade Court Market Receipt', 'marketReceiptProof', 'jade-market-receipt']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['item.provision_catalog', 'jade-provision-catalog', 'itemProvisionCatalogs', 'Jade Provision Catalog', 'provisionCatalogProof', 'jade-provision-catalog-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_patrol', 'jade-cloudbell-patrol', 'routePatrols', 'Jade Cloudbell Patrol', 'two-tester presence proof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.affinity_matrix', 'jade-affinity-matrix', 'affinityMatrices', 'Jade Affinity Matrix', 'affinityMatrixProof', 'jade-affinity-matrix-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.relic_attune', 'jade-relic-attunement', 'spiritRelicAttunements', 'Jade Relic Attunement', 'relicAttunementProof', 'jade-relic-silk-cord']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.starter_vow', 'jade-starter-vow', 'spiritStarterVows', 'Jade Starter Vow', 'starterVowProof', 'jade-starter-knot']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.technique_codex', 'jade-technique-codex', 'techniqueCodexes', 'Jade Technique Codex', 'techniqueCodexProof', 'jade-technique-codex-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['item.battle_kit', 'jade-battle-kit', 'battleItemKits', 'Jade Battle Kit', 'battleKitProof', 'jade-battle-kit-tag']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['item.remedy_pouch', 'jade-remedy-pouch', 'remedyPouches', 'Jade Remedy Pouch', 'remedyPouchProof', 'jade-remedy-pouch-tag']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_ecology', 'jade-route-ecology-survey', 'routeEcologySurveys', 'Jade Route Ecology Survey', 'routeEcologyProof', 'jade-route-ecology-map']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.weather_veil', 'jade-weather-veil', 'spiritWeatherVeils', 'Jade Weather Veil', 'weatherVeilProof', 'jade-weather-veil-chart']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.encounter_atlas', 'jade-encounter-atlas', 'spiritEncounterAtlases', 'Jade Encounter Atlas', 'encounterAtlasProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.habitat_census', 'jade-habitat-census', 'spiritHabitatCensuses', 'Jade Habitat Census', 'habitatCensusProof', 'jade-habitat-census-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['item.craft_writ', 'jade-court-craft-writ', 'spiritCraftWrits', 'Jade Court Craft Writ', 'craftWritProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['trade.exchange_accord', 'jade-exchange-accord', 'tradeExchangeAccords', 'Jade Exchange Accord', 'exchangeAccordProof', 'jade-exchange-accord-tally']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_waystone', 'jade-cloudbell-waystone', 'routeWaystones', 'Jade Cloudbell Waystone', 'routeWaystoneProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_charter', 'jade-route-charter', 'routeCharters', 'Jade Route Charter', 'routeCharterProof', 'jade-route-charter-slip']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.nurture_rite', 'jade-moonwell-nurture-rite', 'spiritNurtureRites', 'Jade Moonwell Nurture Rite', 'nurtureRiteProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.recovery_tea', 'jade-teahouse-recovery', 'spiritRecoveryTeas', 'Jade Teahouse Recovery', 'recoveryTea']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.kinship_album', 'jade-kinship-album', 'spiritKinshipAlbums', 'Jade Kinship Album', 'kinshipAlbumProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.nursery_grove', 'jade-nursery-grove', 'spiritNurseryGroves', 'Jade Nursery Grove', 'nurseryGrove']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.bloom_ascendance', 'jade-bloom-ascendance', 'spiritBloomAscendances', 'Jade Bloom Ascendance', 'bloomAscendanceProof', 'jade-bloom-ascendance-sigil']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.lineage_register', 'jade-lineage-register', 'spiritLineageRegisters', 'Jade Lineage Register', 'lineageRegisterProof', 'jade-lineage-register-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.roster_cabinet', 'jade-roster-cabinet', 'spiritRosterCabinets', 'Jade Roster Cabinet', 'rosterCabinetProof', 'jade-roster-cabinet-tag']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.blossom_cradle', 'jade-blossom-cradle', 'spiritBlossomCradles', 'Jade Blossom Cradle', 'blossomCradleProof', 'jade-blossom-cradle-ribbon']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['item.bond_gift', 'jade-bond-gift-rite', 'Jade Bond Gift Rite', 'bondGift', 'jade-bond-gift-ribbon']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.name_banner', 'jade-name-banner-rite', 'Jade Name Banner Rite', 'nameBanner', 'jade-name-banner-tag']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['spirit.capture_rite', 'jade-court-capture-rite', 'spiritCaptureRites', 'Jade Capture Rite', 'captureRiteProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.dojo_ladder', 'jade-dojo-ladder', 'dojoLadders === true', 'dojoLadderProof', 'jade-dojo-ladder-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.tournament_bracket', 'jade-banner-tournament', 'spiritTournamentBrackets', 'Jade Banner Tournament', 'tournamentProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.rival_circle', 'jade-rival-circle', 'spiritRivalCircles', 'Jade Rival Circle', 'rivalCircleProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.sifu_council', 'jade-sifu-council', 'sifuCouncils === true', 'sifuCouncilProof', 'jade-sifu-council-crest']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.summit_circuit', 'jade-summit-circuit', 'summitCircuits === true', 'summitCircuitProof', 'jade-summit-circuit-laurel']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['battle.battle_chronicle', 'jade-battle-chronicle', 'battleChronicles === true', 'battleChronicle', 'jade-battle-chronicle-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['story.chapter_complete', 'jade-scroll-story-chapter', 'spiritStoryChapters', 'Jade Scroll Story Chapter', 'storyChapterProof']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['quest.ledger_record', 'jade-quest-ledger', 'questLedgers', 'Jade Quest Ledger', 'questLedgerProof', 'jade-quest-ledger-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['guild.insignia_case', 'jade-insignia-case', 'guildInsigniaCases', 'Jade Insignia Case', 'insigniaCaseProof']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['MOCHI_SOCIAL_LOAD_PLAYERS', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'simulated testers', 'HTTP alpha contract load smoke']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['battleKitIds', 'jade-battle-kit']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['remedyPouchIds', 'jade-remedy-pouch']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['questLedgerIds', 'jade-quest-ledger']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['rosterCabinetIds', 'jade-roster-cabinet']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['routeCharterIds', 'jade-route-charter']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['blossomCradleIds', 'jade-blossom-cradle']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['playwright-core', 'createHash', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'reports/alpha-browser-presence.json', 'Nearby: 2 testers', 'data-presence-label', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'Cloudbell Skyvow Accord cleared', 'fieldAccordTalismanClaimed', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'data-alpha-action="spirit.sanctuary_rite"', 'data-sanctuary-label', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite complete', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'compendiumProof', 'data-alpha-action="spirit.roster_archive"', 'data-archive-label', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive sealed', 'data-alpha-action="spirit.care_cycle"', 'data-care-cycle-label', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle complete', 'data-alpha-action="spirit.temperament_concord"', 'data-temperament-label', 'temperamentConcordProof', 'temperamentCharmClaimed', 'Jade Temperament Concord complete', 'data-alpha-action="spirit.field_almanac"', 'data-field-almanac-label', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac recorded', 'data-alpha-action="spirit.habitat_census"', 'data-habitat-census-label', 'habitatCensusProof', 'habitatCensusSealClaimed', 'Jade Habitat Census recorded', 'data-alpha-action="item.provision_satchel"', 'provisionProof', 'jade-court-provision-satchel', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'jade-court-commission-ledger', 'data-alpha-action="guild.social_rally"', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle complete', 'data-alpha-action="guild.ascension_trial"', 'data-ascension-label', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial complete', 'data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament cleared', 'jade-court-spirit-compendium', 'jade-cloudbell-circuit', 'jade-court-habitat-bond', 'jade-court-research-folio', 'cloudbell-reed-bank', 'aozhen', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'triune-jade-harmony', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'jade-echo-concord', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'jade-mirror-team-match', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'silk-banner-mentor-drill', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'jade-step-loadout', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'jade-heart-trait', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'jade-mirror-condition-weave', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'guildRankProof', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="spirit.care"', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'battleRoundProof', 'battleRoundTranscript', 'data-battle-round-label', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'chain.withdraw_request', 'chain.deposit_request', 'canaryReturnRequested', 'Jade Vault Return Proof staged', 'mochiSocial.alphaState', 'canvasMovement', 'changedAfterFirstTabMove', 'ArrowLeft', 'ArrowDown', 'canvas']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.roster_cabinet"', 'data-roster-cabinet-label', 'rosterCabinetProof', 'rosterCabinetTagClaimed', 'Jade Roster Cabinet organized']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.blossom_cradle"', 'data-blossom-cradle-label', 'blossomCradleProof', 'blossomCradleRibbonClaimed', 'Jade Blossom Cradle settled']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="item.bond_gift"', 'data-bond-gift-label', 'bondGiftProof', 'bondGiftRibbonClaimed', 'Jade Bond Gift Rite complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.name_banner"', 'data-name-banner-label', 'nameBannerProof', 'nameBannerTagClaimed', 'Jade Name Banner Rite complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="market.guild_receipt"', 'marketReceiptProof', 'marketReceiptClaimed', 'Jade Court Market Receipt recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="item.provision_catalog"', 'data-provision-catalog-label', 'provisionCatalogProof', 'provisionCatalogSealClaimed', 'Jade Provision Catalog']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="item.battle_kit"', 'data-battle-kit-label', 'battleKitProof', 'battleKitTagClaimed', 'Jade Battle Kit']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="item.remedy_pouch"', 'data-remedy-pouch-label', 'remedyPouchProof', 'remedyPouchTagClaimed', 'Jade Remedy Pouch']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_patrol"', 'data-route-patrol-label', 'routePatrolProof', 'routePatrolPennantClaimed', 'Jade Cloudbell Patrol complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.affinity_matrix"', 'data-affinity-matrix-label', 'affinityMatrixProof', 'affinityMatrixSealClaimed', 'Jade Affinity Matrix mapped']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.relic_attune"', 'data-relic-attunement-label', 'relicAttunementProof', 'relicSilkCordClaimed', 'Jade Relic Attunement complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.starter_vow"', 'data-starter-vow-label', 'starterVowProof', 'starterKnotClaimed', 'Jade Starter Vow']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.technique_codex"', 'data-technique-codex-label', 'techniqueCodexProof', 'techniqueCodexSealClaimed', 'Jade Technique Codex sealed']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_ecology"', 'data-route-ecology-label', 'routeEcologyProof', 'routeEcologyMapClaimed', 'Jade Route Ecology Survey complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.weather_veil"', 'data-weather-veil-label', 'weatherVeilProof', 'weatherVeilChartClaimed', 'Jade Weather Veil recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.encounter_atlas"', 'data-encounter-atlas-label', 'encounterAtlasProof', 'encounterAtlasClaimed', 'Jade Encounter Atlas recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.habitat_census"', 'data-habitat-census-label', 'habitatCensusProof', 'habitatCensusSealClaimed', 'Jade Habitat Census recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="item.craft_writ"', 'data-craft-writ-label', 'craftWritProof', 'craftWritClaimed', 'Jade Court Craft Writ complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="trade.exchange_accord"', 'data-exchange-accord-label', 'exchangeAccordProof', 'exchangeAccordTallyClaimed', 'Jade Exchange Accord complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_waystone"', 'data-route-waystone-label', 'routeWaystoneProof', 'routeWaystoneSealClaimed', 'Jade Cloudbell Waystone activated']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_charter"', 'data-route-charter-label', 'routeCharterProof', 'routeCharterSlipClaimed', 'Jade Route Charter recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.nurture_rite"', 'data-nurture-rite-label', 'nurtureRiteProof', 'nurtureRibbonClaimed', 'Jade Moonwell Nurture Rite complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.recovery_tea"', 'data-recovery-tea-label', 'recoveryTeaProof', 'recoveryTeaCupClaimed', 'Jade Teahouse Recovery complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.kinship_album"', 'data-kinship-album-label', 'kinshipAlbumProof', 'kinshipAlbumClaimed', 'Jade Kinship Album recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.nursery_grove"', 'data-nursery-grove-label', 'nurseryGroveProof', 'nurserySproutClaimed', 'Jade Nursery Grove cultivated']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.bloom_ascendance"', 'data-bloom-ascendance-label', 'bloomAscendanceProof', 'bloomAscendanceSigilClaimed', 'Jade Bloom Ascendance complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.lineage_register"', 'data-lineage-register-label', 'lineageRegisterProof', 'lineageRegisterSealClaimed', 'Jade Lineage Register recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="spirit.capture_rite"', 'data-capture-rite-label', 'captureRiteProof', 'captureRiteClaimed', 'Jade Capture Rite recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.dojo_ladder"', 'data-dojo-ladder-label', 'dojoLadderProof', 'dojoLadderSealClaimed', 'Jade Dojo Ladder']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament cleared']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.rival_circle"', 'data-rival-circle-label', 'rivalCircleProof', 'rivalCircleMarkClaimed', 'Jade Rival Circle cleared']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.sifu_council"', 'data-sifu-council-label', 'sifuCouncilProof', 'sifuCouncilCrestClaimed', 'Jade Sifu Council cleared']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.summit_circuit"', 'data-summit-circuit-label', 'summitCircuitProof', 'summitCircuitLaurelClaimed', 'Jade Summit Circuit cleared']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="battle.battle_chronicle"', 'data-battle-chronicle-label', 'battleChronicleProof', 'battleChronicleSealClaimed', 'Jade Battle Chronicle recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="story.chapter_complete"', 'data-story-label', 'storyChapterProof', 'storyScrollClaimed', 'Jade Scroll Story Chapter recorded']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="quest.ledger_record"', 'data-quest-ledger-label', 'questLedgerProof', 'questLedgerSealClaimed', 'Jade Quest Ledger']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="guild.insignia_case"', 'data-insignia-label', 'insigniaCaseProof', 'insigniaCaseClaimed', 'Jade Insignia Case sealed']
  },
  {
    file: 'scripts/check-alpha-visual-snapshot.mjs',
    includes: ['playwright-core', 'alpha-visual-snapshot.json', 'alpha-visual-page.png', 'alpha-visual-canvas.png', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'local-only by default', 'manualReview', 'createHash', 'canvas']
  },
  {
    file: 'scripts/check-alpha-responsive-gameplay.mjs',
    includes: ['playwright-core', 'alpha-responsive-gameplay.json', 'reports/responsive-gameplay', 'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL', 'MOCHI_SOCIAL_TESTER_PASSWORD', 'MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME', '/games/mochi-social', 'local-only by default', 'viewports', '1920', '390', '/play', '/embed', 'parent iframe', 'siteIframeResults', 'gameplayKeys', 'unhandledKeys', 'ArrowDown', 'Space', 'Enter', 'horizontalOverflow', 'panelOverlaps', 'safeRectObstructions', 'textOverflow', 'assertScrollUnchanged', 'verifyGameplayKeyOwnership', 'verifyUnhandledKeyOwnership', 'verifyEditableInputKeepsText', 'verifyInputSurfaceStyles', 'touchAction', 'overscrollBehaviorY', 'preventedKeyCount']
  },
  {
    file: 'scripts/check-alpha-local-site-iframe.mjs',
    includes: ['Local-only Mochirii site iframe proof', 'resolveMochiSocialSiteRepoPath', 'apps/web', 'NEXT_PUBLIC_MOCHI_SOCIAL_URL', 'MOCHI_SOCIAL_ALPHA_ACCESS_MODE', 'tester-password', 'MOCHI_SOCIAL_TESTER_PASSWORD', 'MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD', 'alpha-site-iframe-responsive.json', 'reports/responsive-site-iframe', 'MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME', '/games/mochi-social', 'siteIframeResults', 'taskkill', 'delete env.SUPABASE_SERVICE_ROLE_KEY', 'delete env.ENJIN_PLATFORM_TOKEN', 'redacted-tester-password']
  },
  {
    file: 'scripts/check-enjin-operator-smoke.mjs',
    includes: ['/integration/alpha/enjin/submit', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID', 'enjin_canary_not_configured', 'invalid_game_server_token']
  },
  {
    file: 'scripts/check-built-server-smoke.mjs',
    includes: ['dist/server/express.js', 'readGitState', 'localHead', 'Built server manifest must not expose legacy playable content catalog', 'Built server alpha status must not expose future chain runtime state', 'Local-only built Express server smoke']
  },
  {
    file: 'scripts/check-alpha-local-suite.mjs',
    includes: ['No-cost localhost Alpha RC suite', 'readGitState', 'localHead', 'npmCommand', 'alpha:wallet-daemon-check', 'alpha:local-acceptance', 'alpha:load-smoke', 'alpha:browser-presence', 'alpha:responsive-gameplay', 'alpha:visual-snapshot', 'alpha:visual-review', 'alpha:enjin-operator-smoke', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'delete env.ENJIN_PLATFORM_TOKEN', 'reports/alpha-local-suite.json']
  },
  {
    file: 'scripts/check-alpha-local-evidence.mjs',
    includes: ['No-secret local Alpha RC evidence summary', 'alpha-local-evidence.json', 'alpha-local-evidence.md', 'readGitState', 'localHead', 'same-suite evidence', 'built server smoke report', 'assertCurrentGitState', 'current HEAD', 'browser presence must prove observer-side movement', 'responsive gameplay must cover the required nine-viewport matrix', 'responsive gameplay must cover /play and /embed', 'parent-iframe input ownership', 'Mochirii site iframe status', 'responsive gameplay must cover the Mochirii site iframe across all viewports when configured', 'summarizeResponsiveInputOwnership', 'summarizeResponsiveSiteIframe', 'previewReadyEvidence', 'editable-input preservation', 'unhandled-key freedom', 'visual snapshot canvas PNG must be non-empty', 'visual review must keep rendered prompt interaction as a manual pre-RC gate', 'Wallet Daemon local check must stay no-cost and metadata-only', 'built server smoke must prove tokened Enjin route fails closed', 'local-only']
  },
  {
    file: 'scripts/check-alpha-report-hygiene.mjs',
    includes: ['No-secret hygiene scan', 'alpha-report-hygiene.json', 'alpha-operator-checklist.json', 'alpha-provider-preflight.json', 'alpha-external-gates.json', 'alpha-preview-ready.json', 'alpha-responsive-gameplay.json', 'alpha-local-site-iframe.json', 'alpha-site-iframe-responsive.json', 'alpha-visual-review.json', 'alpha-manual-prompt-review.json', 'wallet-daemon-local.json', 'readGitState', 'localHead', 'mochi-social-alpha-operator-next-steps.md', 'mochi-social-alpha-provider-preflight.md', 'mochi-social-alpha-sync-approval.md', 'mochi-social-alpha-preview-ready.md', 'Unredacted local suite token', 'Unredacted local site iframe token', 'Wallet daemon password assignment', 'Supabase service role assignment']
  },
  {
    file: 'scripts/mochi-social-site-repo-path.mjs',
    includes: ['resolveMochiSocialSiteRepoPath', 'MOCHI_SOCIAL_SITE_REPO_PATH', '../Mochirii-mochi-social-alpha', '../Mochirii', 'existsSync']
  },
  {
    file: 'scripts/check-alpha-site-repo-path.mjs',
    includes: ['Mochi Social site repo path resolver self-test OK', 'MOCHI_SOCIAL_SITE_REPO_PATH', '../Mochirii-mochi-social-alpha', '../Mochirii', '../custom-site']
  },
  {
    file: 'scripts/check-alpha-gate-contracts.mjs',
    includes: ['Mochi Social alpha gate contract checks passed', 'previewLiveGateNames', 'fundedChainGateNames', 'previewFlySecrets', 'Live game contract', 'Site preview contract', 'Fly funded-chain secret names', 'Enjin Canary operator readiness', 'requiresHostedApproval(gameUrl)', 'fetchJson(`${gameUrl}/healthz`)', 'fundedChainRequiredForPreview: false']
  },
  {
    file: 'scripts/write-alpha-manual-prompt-review.mjs',
    includes: ['alpha-manual-prompt-review.json', 'alpha-manual-prompt-review.md', 'pending-human-review', 'MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER', 'MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER', 'MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED', 'interactionContract', 'reviewTargets', 'visualArtifacts', 'Visual Review Evidence Bundle', 'alpha-visual-page.png', 'alpha-visual-canvas.png', 'setAlphaInteractable', 'spirit-lirabao', 'Source-Tied Target Checklist', 'worldPx', 'logicalTile', 'adjacentWorldPx']
  },
  {
    file: 'scripts/check-wallet-daemon-local.mjs',
    includes: ['wallet-daemon-local.json', 'wallet-daemon-local.md', 'No-cost local Wallet Daemon binary check', 'never runs wallet-daemon import', 'never runs wallet-daemon print-seed', 'never starts a long-running signer process', 'never contacts Enjin Platform', 'MOCHI_SOCIAL_WALLET_DAEMON_PATH', 'MOCHI_SOCIAL_WALLET_DAEMON_REQUIRED', 'sha256']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['alpha-visual-review.json', 'alpha-visual-review.md', 'readGitState', 'manualPromptGate', 'pending-human-review', 'alpha:manual-prompt-review', 'observerMovement', 'guild-seal-chest', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'fieldExpedition', 'fieldAccord', 'fieldAccordProof', 'routeInvitation', 'habitatBond', 'habitatBondProof', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite', 'jade-sanctuary-bell', 'spirit-sanctuary-rite', 'sanctuary rite', 'spiritResearch', 'researchProof', 'spiritCompendium', 'compendiumProof', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive', 'jade-roster-archive-seal', 'spirit-roster-archive', 'roster archive', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle', 'jade-care-cycle-knot', 'spirit-care-cycle', 'care cycle', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac', 'jade-field-almanac-clasp', 'spirit-field-almanac', 'field almanac', 'provisionSatchel', 'provisionProof', 'guildCommission', 'commissionProof', 'socialRally', 'guildSocialRally', 'rallyProof', 'emoteProof', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'jade-wayfarer-chronicle-clasp', 'guild-wayfarer-chronicle', 'wayfarer chronicle', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial', 'jade-court-ascension-ribbon', 'guild-ascension-trial', 'guild ascension trial', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament', 'jade-banner-tournament-pennant', 'battle-tournament-bracket', 'tournament bracket', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'techniqueMastery', 'battleTactic', 'guildRank', 'growthRite', 'partyHarmony', 'harmonyFormProof', 'harmonyTrial', 'harmonyTrialProof', 'teamSparMatch', 'teamSparMatchProof', 'mentorChallengeProof', 'conditionWeaveProof', 'battleConditionWeave', 'relicAttunementProof', 'relicSilkCordClaimed', 'Jade Relic Attunement', 'canaryReturnPreview', 'canaryReturnRequested', 'battleRoundTranscript', 'battleRoundProof', 'affinityTrial', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'Jade Lantern Court']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['rosterCabinetProof', 'rosterCabinetTagClaimed', 'Jade Roster Cabinet', 'jade-roster-cabinet', 'roster cabinet']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['blossomCradleProof', 'blossomCradleRibbonClaimed', 'Jade Blossom Cradle', 'jade-blossom-cradle', 'blossom cradle']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['bondGiftProof', 'bondGiftRibbonClaimed', 'Jade Bond Gift Rite', 'jade-bond-gift-rite', 'bond gift']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['nameBannerProof', 'nameBannerTagClaimed', 'Jade Name Banner Rite', 'jade-name-banner-rite', 'name banner']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['marketReceiptProof', 'marketReceiptClaimed', 'Jade Court Market Receipt', 'jade-market-receipt', 'market-guild-receipt', 'market receipt']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['provisionCatalogProof', 'provisionCatalogSealClaimed', 'Jade Provision Catalog', 'jade-provision-catalog-seal', 'provisionCatalog', 'provision catalog']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['battleKitProof', 'battleKitTagClaimed', 'Jade Battle Kit', 'jade-battle-kit-tag', 'battleKit', 'battle kit']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['remedyPouchProof', 'remedyPouchTagClaimed', 'Jade Remedy Pouch', 'jade-remedy-pouch-tag', 'remedyPouch', 'remedy pouch']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['questLedgerProof', 'questLedgerSealClaimed', 'Jade Quest Ledger', 'jade-quest-ledger', 'quest ledger']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['routePatrolProof', 'routePatrolPennantClaimed', 'Jade Cloudbell Patrol', 'jade-route-patrol-pennant', 'world-route-patrol', 'route patrol']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['affinityMatrixProof', 'affinityMatrixSealClaimed', 'Jade Affinity Matrix', 'jade-affinity-matrix-seal', 'battle-affinity-matrix', 'affinity matrix']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['relicAttunementProof', 'relicSilkCordClaimed', 'Jade Relic Attunement', 'jade-relic-silk-cord', 'spirit-relic-attunement', 'relic attunement']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['starterVowProof', 'starterKnotClaimed', 'Jade Starter Vow', 'jade-starter-knot', 'spirit-starter-vow', 'starter vow']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['techniqueCodexProof', 'techniqueCodexSealClaimed', 'Jade Technique Codex', 'jade-technique-codex-seal', 'spirit-technique-codex', 'technique codex']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['temperamentConcordProof', 'temperamentCharmClaimed', 'Jade Temperament Concord', 'jade-temperament-charm', 'spirit-temperament-concord', 'temperament concord', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac', 'jade-field-almanac-clasp', 'spirit-field-almanac', 'field almanac']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['routeEcologyProof', 'routeEcologyMapClaimed', 'Jade Route Ecology Survey', 'jade-route-ecology-map', 'spirit-route-ecology', 'route ecology']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['encounterAtlasProof', 'encounterAtlasClaimed', 'Jade Encounter Atlas', 'jade-encounter-atlas', 'spirit-encounter-atlas', 'encounter atlas']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['habitatCensusProof', 'habitatCensusSealClaimed', 'Jade Habitat Census', 'jade-habitat-census-seal', 'spirit-habitat-census', 'habitat census']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['craftWritProof', 'craftWritClaimed', 'Jade Court Craft Writ', 'jade-court-craft-writ', 'spirit-craft-writ', 'craft writ']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['exchangeAccordProof', 'exchangeAccordTallyClaimed', 'Jade Exchange Accord', 'jade-exchange-accord-tally', 'trade-exchange-accord', 'exchange accord']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['routeWaystoneProof', 'routeWaystoneSealClaimed', 'Jade Cloudbell Waystone', 'jade-waystone-travel-seal', 'world-route-waystone', 'route waystone']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['routeCharterProof', 'routeCharterSlipClaimed', 'Jade Route Charter', 'jade-route-charter-slip', 'world-route-charter', 'route charter']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['nurtureRiteProof', 'nurtureRibbonClaimed', 'Jade Moonwell Nurture Rite', 'jade-moonwell-nurture-ribbon', 'spirit-nurture-rite', 'nurture rite']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['recoveryTeaProof', 'recoveryTeaCupClaimed', 'Jade Teahouse Recovery', 'jade-teahouse-recovery-cup', 'spirit-recovery-tea', 'recovery tea']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['kinshipAlbumProof', 'kinshipAlbumClaimed', 'Jade Kinship Album', 'jade-kinship-album', 'spirit-kinship-album', 'kinship album']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['nurseryGroveProof', 'nurserySproutClaimed', 'Jade Nursery Grove', 'jade-nursery-sprout', 'spirit-nursery-grove', 'nursery grove']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['bloomAscendanceProof', 'bloomAscendanceSigilClaimed', 'Jade Bloom Ascendance', 'jade-bloom-ascendance-sigil', 'spirit-bloom-ascendance', 'bloom ascendance']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['lineageRegisterProof', 'lineageRegisterSealClaimed', 'Jade Lineage Register', 'jade-lineage-register-seal', 'spirit-lineage-register', 'lineage register']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['dojoLadderProof', 'dojoLadderSealClaimed', 'Jade Dojo Ladder', 'jade-dojo-ladder-seal', 'battle-dojo-ladder', 'dojo ladder']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament', 'jade-banner-tournament-pennant', 'battle-tournament-bracket', 'tournament bracket']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['rivalCircleProof', 'rivalCircleMarkClaimed', 'Jade Rival Circle', 'jade-rival-circle-mark', 'battle-rival-circle', 'rival circle']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['sifuCouncilProof', 'sifuCouncilCrestClaimed', 'Jade Sifu Council', 'jade-sifu-council-crest', 'battle-sifu-council', 'sifu council']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['summitCircuitProof', 'summitCircuitLaurelClaimed', 'Jade Summit Circuit', 'jade-summit-circuit-laurel', 'battle-summit-circuit', 'summit circuit']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['storyChapterProof', 'storyScrollClaimed', 'Jade Scroll Story Chapter', 'jade-scroll-story-chapter', 'story-chapter', 'story chapter']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['insigniaCaseProof', 'insigniaCaseClaimed', 'Jade Insignia Case', 'jade-insignia-case', 'guild-insignia-case', 'insignia case']
  },
  {
    file: 'scripts/check-alpha-external-gates.mjs',
    includes: ['MOCHI_SOCIAL_GAME_URL', 'MOCHI_SOCIAL_SITE_PREVIEW_URL', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'MOCHI_SOCIAL_PREVIEW_ENV_FILE', 'readPreviewEnvFile', 'urlFieldsRead', 'hostedChecksAllowed', 'readGitState', 'localHead', 'flyctl', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'previewFlySecrets', 'fundedChainFlySecrets', 'preview-live-gates', 'funded-chain-gates', 'summarizeGateLanes', 'ENJIN_COLLECTION_ID', 'MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED']
  },
  {
    file: 'scripts/write-alpha-operator-checklist.mjs',
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-operator-next-steps.md', 'alpha-operator-checklist.json', 'readGitState', 'localHead', 'walletDaemonSummary', 'manualPromptSummary', 'providerActionQueue', 'buildProviderActionQueue', 'Provider Action Queue', 'approvalText', 'noCostFallback', 'github-branch-sync', 'github-site-branch-sync', 'fly-secret-update', 'fly-funded-chain-secret-update', 'fly-live-game-contract', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy', 'vercel-supabase-preview-contract', 'enjin-canary-readiness', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'noCostRule', 'This file is intentionally no-secret', 'KEY_PASS=<private-wallet-daemon-passphrase>', 'PLATFORM_KEY=<private-enjin-platform-token>', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:local-suite', 'npm run alpha:responsive-gameplay', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:external-gates']
  },
  {
    file: 'scripts/write-alpha-provider-preflight.mjs',
    includes: ['mochi-social-alpha-provider-preflight.md', 'alpha-provider-preflight.json', 'This file is intentionally no-secret', 'contentsRead: false', 'providerActionQueue', 'missingExpectedPrivateInputFiles', 'does not read private credential file contents', 'Known Provider Action IDs', 'Next Approval IDs', 'Verified Milestone Deploy Queue', 'github-branch-sync', 'github-site-branch-sync', 'fly-secret-update', 'fly-funded-chain-secret-update', 'fly-live-game-contract', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy', 'vercel-supabase-preview-contract', 'enjin-canary-readiness']
  },
  {
    file: 'scripts/write-alpha-sync-approval.mjs',
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-sync-approval.md', 'alpha-sync-approval.json', 'This file is intentionally no-secret', 'hostedChecksAllowed', 'git: audit.data.git', 'git: report.data.git', 'siteGit', 'prState', 'readPr', 'readPrFixture', 'MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE', 'MOCHI_SOCIAL_PREVIEW_ENV_FILE', 'Local Preview URL File', 'readNamedUrl', 'localHeadMatchesPrHead', 'PR State', 'github-site-branch-sync', 'approvalsRequired', 'approvalActions', 'costRisk', 'noCostAlternative', 'Cost-Sensitive Action Matrix', 'Verified Milestone Deploy Queue', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy', 'verifiedMilestoneDeployCandidate', 'GitHub Actions/PR checks', 'Suggested combined public-repo sync command note', 'Proceed with public-repo sync', 'fly-funded-chain-secret-update', 'preview-live-gates', 'funded-chain-gates']
  },
  {
    file: 'scripts/check-alpha-sync-approval-self-test.mjs',
    includes: ['Mochi Social sync approval self-test OK', 'writePrFixture', 'writePreviewEnvFixture', 'MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE', 'localHeadMatchesPrHead === false', '## PR State', '## Local Preview URL File', '## Verified Milestone Deploy Queue', 'fly-verified-milestone-deploy', 'vercel-verified-milestone-deploy', 'https://preview.example.test', 'local HEAD does not match PR head', 'fakeToken']
  },
  {
    file: 'scripts/check-alpha-preview-ready.mjs',
    includes: ['Mochi Social Alpha Preview Ready local game audit', 'reports/alpha-preview-ready.json', 'mochi-social-alpha-preview-ready.md', 'Unity-first report proves the deployable local game runtime only', 'fundedChainRequiredForPreview: false', 'hostedChecksPerformed: false', 'providerMutationPerformed: false', 'preview.unity-verify', 'preview.build-release', 'preview.built-server-smoke', 'preview.unity-required-smoke', 'preview.load-smoke-report', 'MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL', 'MOCHI_SOCIAL_LOAD_PLAYERS', 'preview.game-branch-sync', 'preview.site-branch-sync']
  },
  {
    file: 'scripts/check-alpha-rc-audit.mjs',
    includes: ['Mochi Social Alpha RC audit', 'reports/alpha-rc-audit.json', 'readGitState', 'provider.external-gates', 'hostedChecksAllowed', 'external gate report', 'game.visual-review', 'game.manual-prompt-review-script', 'game.wallet-daemon-local-check', 'game.map-event-behavior', 'local.manual-prompt-review', 'manualPromptSourceEvidence', 'source hash changed since manual prompt review', 'syncExternalGateSnapshotFailures', 'local.evidence-summary', 'local.operator-checklist-current', 'local.provider-preflight-current', 'providerActionQueueIds', 'operator checklist provider action queue missing', 'provider preflight queue missing', 'local.sync-approval-current', 'currentGitStateFailures', 'currentGitStateFailuresForRepo', 'github.local-branch-sync', 'github.site-local-branch-sync', 'github.game-pr', 'github.site-pr', 'rev-list', '--porcelain', 'commandAt', 'Mochirii', 'mochi-social-alpha-provider-preflight.md', 'mochi-social-alpha-sync-approval.md', 'mochirii-mochi-social-alpha-operator-next-steps.md', 'mochi-social-alpha-vercel-preview.local.txt', 'site.bridge-helper', 'site.bridge-state-self-test', 'site.auth-bridge-check', 'resolveMochiSocialBridgeMessage', 'check-mochi-social-bridge-state.mjs', 'site.edge-authority-check', 'site.edge-authority', 'check-mochi-social-edge-authority.mjs', 'site.preview-key-loader-self-test', 'site.preview-key-loader', 'check-mochi-social-preview-key-loader.mjs', 'site.preview-url-self-test', 'check-mochi-social-preview-url-self-test.mjs', 'site.browser-gate-writer', 'write-mochi-social-browser-gates.mjs', 'site.browser-gate-self-test', 'check-mochi-social-browser-gate-self-test.mjs', 'site.report-hygiene-check', 'check-mochi-social-report-hygiene.mjs', 'site.discord-oauth-self-test', 'site.discord-oauth-detector', 'check-mochi-social-discord-oauth-self-test.mjs', 'site.preview-ready-audit', 'site.bridge-state', 'site.auth-bridge', 'MOCHI_SOCIAL_SITE_PREVIEW_READY_SKIP_SELF_TEST_COMMANDS', 'MOCHI_SOCIAL_PREVIEW_ENV_FILE', 'Local Preview URL File', 'readPreviewEnvFile', 'MOCHI_SOCIAL_SITE_BROWSER_GATES_JSON', 'stored browser gate report', 'MOCHI_SOCIAL_SITE_REPORT_HYGIENE_JSON', 'site.report-hygiene', 'site.preview-ready-report', 'check-mochi-social-preview-ready.mjs', 'mochi-social-preview-ready.json']
  }
];

const unityPreviewReadinessChecks = [
  {
    file: 'apps/game/src/entries/express.ts',
    includes: [
      '/healthz',
      '/play',
      '/embed',
      '/integration/game-manifest.json',
      '/integration/alpha/status',
      '/integration/alpha/progress',
      '/integration/alpha/action',
      "alphaStopPoint: 'alpha-preview-ready'",
      "source: 'local-alpha-ledger'",
      'UNITY_SHARED_ROOM_CONTRACT',
      "engine: 'unity-webgl'",
      "key: 'jade-lantern-room-alpha'",
      "mode: 'single-shared-room'",
      'capacity: 25',
      "sharedPetKey: 'lirabao'",
      "realtimeAuthority: 'ugs-distributed-authority'",
      "stateAuthority: 'ugs-cloud-save'",
      "playerCharacterKey: 'character.v1'",
      "sharedPetKey: 'room:jade-lantern-room/sharedPet.v1'",
      "mode: 'curated-presets'",
      'avatarUploads: false',
      "universalStarter: true",
      "stateAuthority: 'cloud-code-authoritative-save'",
      'enabled: false',
      'fixedPrice: false',
      'directTrade: false',
      'cashout: false',
      'unity.character.created',
      'unity.character.updated',
      'unity.pet.interaction',
      'unity.pet.state_saved',
      'unity.room.joined',
      'unity.room.left'
    ]
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: [
      'publishes the Unity WebGL shared-room contract',
      "engine: 'unity-webgl'",
      "key: 'jade-lantern-room-alpha'",
      "scene: 'JadeLanternRoom'",
      "mode: 'single-shared-room'",
      'capacity: 25',
      "sharedPetKey: 'lirabao'",
      "realtimeAuthority: 'ugs-distributed-authority'",
      "authentication: 'unity-authentication-custom-id'",
      "playerCharacterKey: 'character.v1'",
      "sharedPetKey: 'room:jade-lantern-room/sharedPet.v1'",
      "presetIds: ['jade_wayfarer', 'lotus_guardian', 'lantern_scholar']",
      'avatarUploads: false',
      'universalStarter: true',
      'enabled: false',
      'fixedPrice: false',
      'directTrade: false'
    ]
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: [
      'MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL',
      "manifest.activeRuntime !== 'unity-webgl'",
      'Release smoke requires a present Unity WebGL build',
      '/embed did not serve a Unity WebGL page',
      "manifest.engine !== 'unity-webgl'",
      "manifest.room?.mode !== 'single-shared-room'",
      "manifest.room?.capacity !== 25",
      "manifest.room?.sharedPetKey !== 'lirabao'",
      "manifest.runtime?.realtimeAuthority !== 'ugs-distributed-authority'",
      "manifest.runtime?.stateAuthority !== 'ugs-cloud-save'",
      "manifest.market?.enabled !== false",
      'no-market',
      'no-avatar-upload',
      'Alpha status must not expose future asset provider state'
    ]
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: [
      'Unity WebGL Alpha Preview Ready contract acceptance',
      'MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE',
      'unity.room.joined',
      'unity.character.created',
      'unity.character.updated',
      'unity.pet.interaction',
      'unity.pet.state_saved',
      'unity.room.left',
      'jade-lantern-room-alpha',
      'JadeLanternRoom',
      'single-shared-room',
      'room:jade-lantern-room/sharedPet.v1',
      'character.v1',
      'jade_wayfarer',
      'lotus_guardian',
      'lantern_scholar',
      'ugs-distributed-authority',
      'ugs-cloud-save',
      'cloud-code-authoritative-save',
      'local-alpha-ledger',
      'ledgerVersion=1',
      'alpha-preview-ready',
      'must not expose future asset network state',
      'market systems for Preview Ready',
      'avatar uploads'
    ]
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: [
      'MOCHI_SOCIAL_LOAD_PLAYERS',
      'local-alpha-ledger',
      'ledgerVersion=1',
      'alpha-preview-ready',
      'must not expose future asset network state',
      'simulated testers',
      'HTTP alpha contract load smoke',
      'unity.room.joined',
      'unity.pet.interaction',
      'jade-lantern-room-alpha',
      'room:jade-lantern-room/sharedPet.v1',
      "manifest.body.engine === 'unity-webgl'",
      "manifest.body.room?.mode === 'single-shared-room'",
      "manifest.body.market?.enabled === false",
      "alphaStatus.body.runtime?.stateAuthority === 'ugs-cloud-save'"
    ]
  }
];

const legacyFeatureParityFiles = new Set([
  'apps/game/src/entries/express.ts',
  'apps/game/tests/manifest.test.ts',
  'apps/game/scripts/smoke.mjs',
  'scripts/check-local-alpha-acceptance.mjs',
  'scripts/check-alpha-load-smoke.mjs'
]);

const readinessChecks = [
  ...checks.filter((check) => !legacyFeatureParityFiles.has(check.file)),
  ...unityPreviewReadinessChecks
];

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file}: missing required file.`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

for (const check of readinessChecks) {
  const text = read(check.file);
  for (const snippet of check.includes) {
    if (!text.includes(snippet)) {
      failures.push(`${check.file}: expected snippet not found: ${snippet}`);
    }
  }
}

const manifestText = read('apps/game/src/integration/manifest.ts');
if (/network:\s*['"]ENJIN['"]/.test(manifestText)) {
  failures.push('apps/game/src/integration/manifest.ts: alpha manifest must not expose Enjin mainnet.');
}

const packageJson = JSON.parse(read('package.json') || '{}');
if (packageJson.engines?.node !== '>=24.17.0 <25') {
  failures.push('package.json: Node 24 LTS engine contract changed.');
}

if (failures.length) {
  console.error('Mochi Social alpha readiness failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social alpha readiness checks passed.');
