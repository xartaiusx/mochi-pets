import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const checks = [
  {
    file: 'package.json',
    includes: ['"clean-room-scan"', '"secret-scan"', '"alpha:readiness"', '"alpha:monero-treasury"', '"alpha:monero-operator-handoff"', '"alpha:local-acceptance"', '"alpha:load-smoke"', '"alpha:browser-presence"', '"alpha:browser-bridge-auth"', '"alpha:visual-snapshot"', '"alpha:visual-review"', '"alpha:manual-prompt-review"', '"alpha:wallet-daemon-check"', '"alpha:enjin-operator-smoke"', '"alpha:built-server-smoke"', '"alpha:local-suite"', '"alpha:local-evidence"', '"alpha:report-hygiene"', '"alpha:gate-contracts"', '"alpha:preview-ready"', '"alpha:external-gates"', '"alpha:operator-checklist"', '"alpha:provider-preflight"', '"alpha:sync-approval"', '"alpha:sync-approval-self-test"', '"alpha:rc-audit"', '"smoke"']
  },
  {
    file: 'scripts/check-clean-room-literals.mjs',
    includes: ['builtInFingerprints', 'clean-room fingerprint', 'private clean-room denylist literal', 'MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST_PATH', 'MOCHI_SOCIAL_CLEAN_ROOM_DENYLIST', 'docs/asset-ledger.md']
  },
  {
    file: '.github/workflows/ci.yml',
    includes: ['npm run secret-scan', 'npm run alpha:readiness', 'npm run alpha:gate-contracts', 'npm run alpha:browser-bridge-auth', 'npm run alpha:sync-approval-self-test', 'npm run build']
  },
  {
    file: 'AGENTS.md',
    includes: ['no-real-value', 'mainnet is out of scope', 'Supabase schema', 'wallet daemon', 'docs/codex-external-ops.md', 'docs/no-cost-operations.md', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'docs/alpha-preview-ready.md', 'Monero treasury', 'operator-only', 'alpha:monero-treasury', 'alpha:monero-operator-handoff']
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
    includes: ['battle.dojo_ladder', 'dojoLadders: true', 'Jade Dojo Ladder label/state', 'Jade Dojo Ladder Seal payload preservation']
  },
  {
    file: 'AGENTS.md',
    includes: ['battle.sifu_council', 'sifuCouncils: true', 'Jade Sifu Council label/state', 'Jade Sifu Council Crest payload preservation']
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
    includes: ['Jade Dojo Ladder proof', 'Jade Dojo Ladder Seal', 'Dojo ladder proof is no-real-value']
  },
  {
    file: 'docs/alpha-preview-ready.md',
    includes: ['Jade Sifu Council proof', 'Jade Sifu Council Crest', 'Sifu council proof is no-real-value']
  },
  {
    file: 'docs/no-cost-operations.md',
    includes: ['No-Cost Operations Guardrail', 'Stop And Ask First', 'Public-repo branch pushes are allowed', 'Fuel Tanks', 'hosted load tests', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'Current Cost Posture', 'alpha:manual-prompt-review', 'alpha:wallet-daemon-check', 'alpha:provider-preflight', 'alpha:sync-approval', 'Alpha Preview Ready', 'dummy `ENJIN_COLLECTION_ID`', 'funded-chain lane is expected red']
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
    includes: ['Alpha RC Ready', 'Enjin Canary', 'static secret scans', 'Two browser tabs show player presence', 'npm run alpha:local-acceptance', 'npm run alpha:browser-presence', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:enjin-operator-smoke', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'docs/alpha-preview-ready.md']
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
    includes: ['Jade Dojo Ladder proof', 'Jade Dojo Ladder', 'clear the Jade Dojo Ladder', 'no-real-value Jade Dojo Ladder']
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Jade Sifu Council proof', 'Jade Sifu Council', 'clear the Jade Sifu Council', 'no-real-value Jade Sifu Council']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'npm run alpha:browser-presence', 'npm run alpha:visual-snapshot', 'npm run alpha:visual-review', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:enjin-operator-smoke', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:preview-ready', 'npm run alpha:operator-checklist', 'npm run alpha:sync-approval', 'npm run alpha:rc-audit', 'check:mochi-social-bridge-state', 'Two-tab Presence Gate', 'Visual Snapshot Gate', 'Manual Prompt Review Gate', 'Wallet Daemon Local Check', 'canvas movement response', 'observer-side canvas change', 'current local HEAD', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'reports/alpha-browser-presence.json', 'reports/alpha-visual-page.png', 'reports/alpha-visual-review.md', 'reports/alpha-manual-prompt-review.md', 'reports/wallet-daemon-local.md', 'reports/alpha-local-evidence.md', 'reports/alpha-operator-checklist.json', 'reports/alpha-external-gates.json', 'reports/alpha-preview-ready.json', 'reports/alpha-report-hygiene.json', 'no-real-value fallback ledger', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'No dummy']
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
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'alpha:browser-presence', 'alpha:manual-prompt-review', 'alpha:wallet-daemon-check', 'alpha:enjin-operator-smoke', 'alpha:external-gates', 'alpha:operator-checklist', 'alpha:sync-approval', 'alpha:preview-ready', 'alpha:rc-audit', 'Wallet Daemon', 'Alpha Preview Ready', 'Alpha RC Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'docs/codex-external-ops.md', 'Current Private Gates']
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
    includes: ['sifu-council', 'clear the Jade Sifu Council proof']
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
    includes: ['Jade Dojo Ladder contribution', 'content-only Jade Dojo Ladder Seal proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Sifu Council contribution', 'content-only Jade Sifu Council Crest proof']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Scroll Story Chapter proof', 'story']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Rival Circle proof', 'rival, commission']
  },
  {
    file: 'docs/visual-polish-brief.md',
    includes: ['Jade Technique Codex proof', 'technique codex']
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
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder proof', 'battle.dojo_ladder']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council proof', 'battle.sifu_council']
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
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder Seal', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council Crest', 'Content-only proof loops']
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
    includes: ['Jade Dojo Ladder', 'Jade Dojo Ladder Seal', 'Content-only HUD and ledger proofs']
  },
  {
    file: 'docs/asset-ledger.md',
    includes: ['Jade Sifu Council', 'Jade Sifu Council Crest', 'Content-only HUD and ledger proofs']
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
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Insignia Case proof', 'guild-insignia-case']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Jade Encounter Atlas proof', 'encounter-atlas']
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
    file: 'docs/game-art-bible.md',
    includes: ['Jade Insignia Case contribution', 'content-only Jade Insignia Case proof']
  },
  {
    file: 'docs/game-art-bible.md',
    includes: ['Jade Encounter Atlas contribution', 'content-only Jade Encounter Atlas proof']
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
    file: 'docs/implementation-brief.md',
    includes: ['Jade Insignia Case', 'Jade Insignia Case proof']
  },
  {
    file: 'docs/implementation-brief.md',
    includes: ['Jade Encounter Atlas', 'Jade Encounter Atlas proof']
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
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Insignia Case', 'Content-only proof loops']
  },
  {
    file: 'docs/asset-pipeline-contract.md',
    includes: ['Jade Encounter Atlas', 'Content-only proof loops']
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
    includes: ['Jade Nursery Grove proof', 'nurture/recover/kinship/nursery/ascendance/lineage/capture-rite', 'nursery grove proof']
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
    includes: ['Jade Bloom Ascendance proof', 'nurture/recover/kinship/nursery/ascendance/lineage/capture-rite', 'bloom ascendance proof']
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
    includes: ['Jade Kinship Album proof', 'Jade Capture Rite proof', 'nurture/recover/kinship/nursery/ascendance/lineage/capture-rite/bracket', 'capture rite proof']
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
    file: 'docs/site-integration.md',
    includes: ['MOCHI_SOCIAL_AUTH', 'chain.operation_update', 'Hot inventory can only be credited after the Enjin state is `FINALIZED`', 'Fuel Tank sponsored Canary transactions', 'CreateTransaction(transaction: { createListing: ... })', '/integration/alpha/enjin/submit', 'Alpha Preview Ready Contract', 'configured-preview-stub', 'Do not set dummy', 'preview-live-gates', 'funded-chain-gates']
  },
  {
    file: 'docs/deployment.md',
    includes: ['RPG_SAVE_DIR=/data/saves', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'alpha:wallet-daemon-check', 'Wallet Daemon must run as a separate service with no inbound ports', 'alpha:operator-checklist', 'For Alpha Preview Ready']
  },
  {
    file: 'docs/enjin-canary-alpha.md',
    includes: ['ENJIN_NETWORK="CANARY"', 'Fuel Tank', 'Only when state is `FINALIZED`', 'no inbound ports', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'pollEnjinTransaction', '/integration/alpha/enjin/submit', 'x-mochi-social-server-token', 'confirmNoRealValue=true', 'alpha:wallet-daemon-check', 'alpha:enjin-operator-smoke', 'Cloud Wallet Daemon Gate', 'Local Wallet Daemon Binary Check', 'AWS CloudFormation', 'KEY_PASS', 'PLATFORM_KEY', 'For Alpha Preview Ready']
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['noRealValue: true', "network: 'CANARY'", 'spiritCapture: true', 'routeInvitations: true', 'routeMastery: true', 'habitatBonds: true', 'spiritSanctuaryRites: true', 'spiritResearch: true', 'spiritCompendium: true', 'spiritRosterArchives: true', 'spiritCareCycles: true', 'spiritTemperamentConcords: true', 'spiritFieldAlmanacs: true', 'spiritEncounterAtlases: true', 'spiritCraftWrits: true', 'tradeExchangeAccords: true', 'routeWaystones: true', 'spiritNurtureRites: true', 'spiritLineageRegisters: true', 'spiritTournamentBrackets: true', 'itemProvisions: true', 'guildCommissions: true', 'socialRallies: true', 'wayfarerChronicles: true', 'guildAscensionTrials: true', 'spiritJournal: true', 'fieldExpeditions: true', 'fieldAccords: true', 'techniqueMastery: true', 'battleTactics: true', 'techniqueLoadouts: true', 'spiritTraits: true', 'conditionWeaves: true', 'guildRankTrials: true', 'spiritGrowthRites: true', 'questChains: true', 'affinityTrials: true', 'partyFormation: true', 'partyHarmony: true', 'harmonyTrials: true', 'teamSparMatches: true', 'mentorChallenges: true', 'battleRoundTranscripts: true', 'sparringLadder: true', "'spirit.capture'", "'spirit.route_invite'", "'world.route_mastery'", "'spirit.habitat_bond'", "'spirit.sanctuary_rite'", "'spirit.research'", "'spirit.compendium_complete'", "'spirit.roster_archive'", "'spirit.care_cycle'", "'spirit.temperament_concord'", "'spirit.field_almanac'", "'world.encounter_atlas'", "'item.craft_writ'", "'trade.exchange_accord'", "'world.route_waystone'", "'spirit.nurture_rite'", "'spirit.lineage_register'", "'battle.tournament_bracket'", "'item.provision_satchel'", "'guild.commission_complete'", "'guild.social_rally'", "'guild.wayfarer_chronicle'", "'guild.ascension_trial'", "'spirit.journal'", "'world.expedition'", "'spirit.technique'", "'spirit.technique_loadout'", "'spirit.trait_attune'", "'battle.condition_weave'", "'battle.tactic_scroll'", "'guild.rank_trial'", "'spirit.growth_rite'", "'party.set'", "'party.harmony_form'", "'battle.harmony_trial'", "'battle.team_spar_match'", "'battle.mentor_challenge'", "'battle.affinity_trial'", "'battle.spar_ladder'", "'chain.operation_update'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['routePatrols: true', "'world.route_patrol'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['affinityMatrices: true', "'battle.affinity_matrix'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['techniqueCodexes: true', "'battle.technique_codex'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['routeEcologySurveys: true', "'world.route_ecology'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritEncounterAtlases: true', "'world.encounter_atlas'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritCraftWrits: true', "'item.craft_writ'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['tradeExchangeAccords: true', "'trade.exchange_accord'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['routeWaystones: true', "'world.route_waystone'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritNurtureRites: true', "'spirit.nurture_rite'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritRecoveryTeas: true', "'spirit.recovery_tea'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritKinshipAlbums: true', "'spirit.kinship_album'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritNurseryGroves: true', "'spirit.nursery_grove'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritBloomAscendances: true', "'spirit.bloom_ascendance'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritLineageRegisters: true', "'spirit.lineage_register'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritCaptureRites: true', "'spirit.capture_rite'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritTournamentBrackets: true', "'battle.tournament_bracket'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritRivalCircles: true', "'battle.rival_circle'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['dojoLadders: true', "'battle.dojo_ladder'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['sifuCouncils: true', "'battle.sifu_council'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['spiritStoryChapters: true', "'story.chapter_complete'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['guildInsigniaCases: true', "'guild.insignia_case'"]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['guildInsigniaCases: true', "'guild.insignia_case'"]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['affinityMatrices: true', "'battle.affinity_matrix'"]
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['techniqueCodexes: true', "'battle.technique_codex'"]
  },
  {
    file: 'apps/game/src/integration/enjin-canary.ts',
    includes: ["network: 'CANARY'", 'fuelTank: config.fuelTankId', 'idempotencyKey: input.requestId', 'executeEnjinGraphqlPlan', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'createListing:', 'pollEnjinTransaction', 'normalizeEnjinTransactionState', 'canCreditHotInventory', 'config.fuelTankId']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['BRIDGE_EVENTS.auth', 'Authorization', 'lirabao-canary-certificate', 'chain.withdraw_request', 'chain.deposit_request', 'data-alpha-action="chain.deposit_request"', 'canaryReturnRequested', 'data-presence-label', 'data-profile-label', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-guild-label', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-rank-label', 'guildRankProof', 'data-growth-label', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-status-label', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'fieldAccordTalismanClaimed', 'SPIRIT_FIELD_ACCORDS', 'resolveSpiritFieldAccord', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'SPIRIT_SANCTUARY_RITES', 'resolveSpiritSanctuaryRite', 'data-alpha-action="spirit.sanctuary_rite"', 'data-sanctuary-label', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'data-compendium-label', 'compendiumProof', 'SPIRIT_ROSTER_ARCHIVES', 'resolveSpiritRosterArchive', 'data-alpha-action="spirit.roster_archive"', 'data-archive-label', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive', 'SPIRIT_CARE_CYCLES', 'resolveSpiritCareCycle', 'data-alpha-action="spirit.care_cycle"', 'data-care-cycle-label', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle', 'SPIRIT_TEMPERAMENT_CONCORDS', 'resolveSpiritTemperamentConcord', 'data-alpha-action="spirit.temperament_concord"', 'data-temperament-label', 'temperamentConcordProof', 'temperamentCharmClaimed', 'Jade Temperament Concord', 'SPIRIT_FIELD_ALMANACS', 'resolveSpiritFieldAlmanac', 'data-alpha-action="spirit.field_almanac"', 'data-field-almanac-label', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac', 'data-alpha-action="item.provision_satchel"', 'data-provision-label', 'provisionProof', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'data-alpha-action="guild.social_rally"', 'data-rally-label', 'guildSocialRally', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'GUILD_WAYFARER_CHRONICLES', 'resolveGuildWayfarerChronicle', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'GUILD_ASCENSION_TRIALS', 'resolveGuildAscensionTrial', 'data-alpha-action="guild.ascension_trial"', 'data-ascension-label', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial', 'SPIRIT_TOURNAMENT_BRACKETS', 'resolveSpiritTournamentBracket', 'data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'data-loadout-label', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'data-trait-label', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'data-condition-label', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'data-mentor-label', 'data-battle-round-label', 'battleRoundProof', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'configured-preview-stub']
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
    includes: ['SPIRIT_TECHNIQUE_CODEXES', 'resolveSpiritTechniqueCodex', 'data-alpha-action="battle.technique_codex"', 'data-technique-codex-label', 'techniqueCodexProof', 'techniqueCodexSealClaimed', 'Jade Technique Codex']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_ECOLOGY_SURVEYS', 'resolveSpiritRouteEcologySurvey', 'data-alpha-action="world.route_ecology"', 'data-route-ecology-label', 'routeInvitedSpiritIds', 'routeEcologyProof', 'routeEcologyMapClaimed', 'Jade Route Ecology Survey']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ENCOUNTER_ATLASES', 'resolveSpiritEncounterAtlas', 'data-alpha-action="world.encounter_atlas"', 'data-encounter-atlas-label', 'encounterAtlasProof', 'encounterAtlasClaimed', 'Jade Encounter Atlas']
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
    includes: ['MOCHI_STORY_CHAPTERS', 'resolveMochiStoryChapter', 'data-alpha-action="story.chapter_complete"', 'data-story-label', 'storyChapterProof', 'storyScrollClaimed', 'Jade Scroll Story Chapter']
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
    includes: ['Jade Cloudbell Patrol', 'jade-route-patrol-pennant', 'resolveSpiritRoutePatrol', 'world-route-patrol']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Affinity Matrix', 'jade-affinity-matrix-seal', 'resolveSpiritAffinityMatrix', 'battle-affinity-matrix', 'affinityMatrixProof']
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
    file: 'scripts/check-alpha-browser-bridge-auth.mjs',
    includes: ['Mochi Social browser bridge auth check passed', 'payload.accessToken', 'setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });', 'postToParent(BRIDGE_EVENTS.authState', 'refreshToken', 'SUPABASE_SERVICE_ROLE_KEY', 'ENJIN_PLATFORM_TOKEN']
  },
  {
    file: 'apps/game/src/integration/supabase-edge-client.ts',
    includes: ['MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'x-mochi-social-server-token', 'ALPHA_EDGE_FUNCTIONS.action', 'JSON.stringify(action)']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/action', '/integration/alpha/enjin/submit', 'buildAlphaActionRequest', 'getSupabaseEdgeConfig', 'ledgerVersion: 1', "source: 'local-alpha-ledger'", "alphaStopPoint: 'alpha-rc-ready'", "chainNetwork: 'CANARY'", 'requireGameServerToken', 'confirmNoRealValue', 'ALPHA_ACTION_TYPES.includes', 'questChains: true', 'routeMastery: true', 'fieldAccords: true', 'habitatBonds: true', 'spiritSanctuaryRites: true', 'spiritResearch: true', 'spiritCompendium: true', 'spiritRosterArchives: true', 'spiritCareCycles: true', 'spiritEncounterAtlases: true', 'spiritCraftWrits: true', 'tradeExchangeAccords: true', 'routeWaystones: true', 'spiritNurtureRites: true', 'spiritTournamentBrackets: true', 'itemProvisions: true', 'guildCommissions: true', 'socialRallies: true', 'wayfarerChronicles: true', 'guildAscensionTrials: true', 'partyHarmony: true', 'harmonyTrials: true', 'teamSparMatches: true', 'mentorChallenges: true', 'techniqueLoadouts: true', 'spiritTraits: true', 'conditionWeaves: true', 'battleRoundTranscripts: true', 'spirit.capture', 'spirit.route_invite', 'world.route_mastery', 'spirit.habitat_bond', 'spirit.sanctuary_rite', 'spirit.research', 'spirit.compendium_complete', 'spirit.roster_archive', 'spirit.care_cycle', 'world.encounter_atlas', 'item.craft_writ', 'trade.exchange_accord', 'world.route_waystone', 'spirit.nurture_rite', 'battle.tournament_bracket', 'item.provision_satchel', 'guild.commission_complete', 'guild.social_rally', 'guild.wayfarer_chronicle', 'guild.ascension_trial', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'spirit.technique_loadout', 'spirit.trait_attune', 'battle.condition_weave', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'party.set', 'party.harmony_form', 'battle.harmony_trial', 'battle.team_spar_match', 'battle.mentor_challenge', 'battle.affinity_trial', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'chain.deposit_request', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routePatrols: true', 'world.route_patrol']
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
    includes: ['spiritEncounterAtlases: true', 'world.encounter_atlas']
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
    includes: ['spiritStoryChapters: true', 'story.chapter_complete']
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
    includes: ['spiritBloomAscendances: true']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['dojoLadders: true']
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
    file: 'apps/game/tests/supabase-edge-client.test.ts',
    includes: ['scoped server token in a header only', 'not.toContain', 'SUPABASE_SERVICE_ROLE_KEY', 'mochi-social-alpha-action']
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: ['/integration/alpha/status', 'closed Enjin Canary alpha contract', 'fixed-price/no-auction', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['chain.withdraw_request', 'chain.deposit_request', 'confirmNoCreditUntilFinalized', 'spirit.capture', 'spirit.route_invite', 'cloudbell-reed-bank', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'jade-field-accord-talisman', 'world.route_mastery', 'jade-cloudbell-circuit', 'spirit.habitat_bond', 'jade-court-habitat-bond', 'spirit.sanctuary_rite', 'jade-court-sanctuary-rite', 'spiritSanctuaryRites', 'Jade Court Sanctuary Rite', 'spirit.research', 'jade-court-research-folio', 'spirit.compendium_complete', 'jade-court-spirit-compendium', 'spirit.roster_archive', 'jade-court-roster-archive', 'spiritRosterArchives', 'Jade Court Roster Archive', 'spirit.care_cycle', 'jade-court-care-cycle', 'spiritCareCycles', 'Jade Court Care Cycle', 'spirit.temperament_concord', 'jade-temperament-concord', 'spiritTemperamentConcords', 'Jade Temperament Concord', 'spirit.field_almanac', 'jade-field-almanac', 'spiritFieldAlmanacs', 'Jade Field Almanac', 'item.provision_satchel', 'jade-court-provision-satchel', 'guild.commission_complete', 'jade-court-commission-ledger', 'guild.social_rally', 'jade-courtyard-rally', 'guild.wayfarer_chronicle', 'jade-wayfarer-chronicle', 'wayfarerChronicles', 'Jade Wayfarer Chronicle', 'guild.ascension_trial', 'jade-court-ascension-trial', 'guildAscensionTrials', 'Jade Court Ascension Trial', 'party.harmony_form', 'triune-jade-harmony', 'battle.harmony_trial', 'jade-echo-concord', 'battle.team_spar_match', 'jade-mirror-team-match', 'battle.mentor_challenge', 'silk-banner-mentor-drill', 'battle.tournament_bracket', 'jade-banner-tournament', 'spiritTournamentBrackets', 'Jade Banner Tournament', 'tournamentProof', 'spirit.technique_loadout', 'jade-step-loadout', 'spirit.trait_attune', 'jade-heart-trait', 'battle.condition_weave', 'jade-mirror-condition-weave', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'battle.affinity_trial', 'party.set', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'skybell-spar', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'canvasMovement.changedAfterFirstTabMove=true', 'lirabao-canary-certificate', '/integration/alpha/enjin/submit', 'invalid_game_server_token', 'configured-preview-stub']
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
    includes: ['battle.technique_codex', 'jade-technique-codex', 'techniqueCodexes', 'Jade Technique Codex', 'techniqueCodexProof', 'jade-technique-codex-seal']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_ecology', 'jade-route-ecology-survey', 'routeEcologySurveys', 'Jade Route Ecology Survey', 'routeEcologyProof', 'jade-route-ecology-map']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.encounter_atlas', 'jade-encounter-atlas', 'spiritEncounterAtlases', 'Jade Encounter Atlas', 'encounterAtlasProof']
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
    includes: ['story.chapter_complete', 'jade-scroll-story-chapter', 'spiritStoryChapters', 'Jade Scroll Story Chapter', 'storyChapterProof']
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
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['playwright-core', 'createHash', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'reports/alpha-browser-presence.json', 'Nearby: 2 testers', 'data-presence-label', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'Cloudbell Skyvow Accord cleared', 'fieldAccordTalismanClaimed', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'data-alpha-action="spirit.sanctuary_rite"', 'data-sanctuary-label', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite complete', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'compendiumProof', 'data-alpha-action="spirit.roster_archive"', 'data-archive-label', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive sealed', 'data-alpha-action="spirit.care_cycle"', 'data-care-cycle-label', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle complete', 'data-alpha-action="spirit.temperament_concord"', 'data-temperament-label', 'temperamentConcordProof', 'temperamentCharmClaimed', 'Jade Temperament Concord complete', 'data-alpha-action="spirit.field_almanac"', 'data-field-almanac-label', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac recorded', 'data-alpha-action="item.provision_satchel"', 'provisionProof', 'jade-court-provision-satchel', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'jade-court-commission-ledger', 'data-alpha-action="guild.social_rally"', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle complete', 'data-alpha-action="guild.ascension_trial"', 'data-ascension-label', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial complete', 'data-alpha-action="battle.tournament_bracket"', 'data-tournament-label', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament cleared', 'jade-court-spirit-compendium', 'jade-cloudbell-circuit', 'jade-court-habitat-bond', 'jade-court-research-folio', 'cloudbell-reed-bank', 'aozhen', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'triune-jade-harmony', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'jade-echo-concord', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'jade-mirror-team-match', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'silk-banner-mentor-drill', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'jade-step-loadout', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'jade-heart-trait', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'jade-mirror-condition-weave', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'guildRankProof', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="spirit.care"', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'battleRoundProof', 'battleRoundTranscript', 'data-battle-round-label', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'chain.withdraw_request', 'chain.deposit_request', 'canaryReturnRequested', 'Jade Vault Return Proof staged', 'mochiSocial.alphaState', 'canvasMovement', 'changedAfterFirstTabMove', 'ArrowLeft', 'ArrowDown', 'canvas']
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
    includes: ['data-alpha-action="battle.technique_codex"', 'data-technique-codex-label', 'techniqueCodexProof', 'techniqueCodexSealClaimed', 'Jade Technique Codex sealed']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_ecology"', 'data-route-ecology-label', 'routeEcologyProof', 'routeEcologyMapClaimed', 'Jade Route Ecology Survey complete']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.encounter_atlas"', 'data-encounter-atlas-label', 'encounterAtlasProof', 'encounterAtlasClaimed', 'Jade Encounter Atlas recorded']
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
    includes: ['data-alpha-action="story.chapter_complete"', 'data-story-label', 'storyChapterProof', 'storyScrollClaimed', 'Jade Scroll Story Chapter recorded']
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
    file: 'scripts/check-enjin-operator-smoke.mjs',
    includes: ['/integration/alpha/enjin/submit', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID', 'enjin_canary_not_configured', 'invalid_game_server_token']
  },
  {
    file: 'scripts/check-built-server-smoke.mjs',
    includes: ['dist/server/express.js', 'readGitState', 'localHead', 'configured-preview-stub', 'invalid_game_server_token', 'enjin_canary_not_configured', 'Local-only built Express server smoke']
  },
  {
    file: 'scripts/check-alpha-local-suite.mjs',
    includes: ['No-cost localhost Alpha RC suite', 'readGitState', 'localHead', 'npmCommand', 'alpha:wallet-daemon-check', 'alpha:local-acceptance', 'alpha:load-smoke', 'alpha:browser-presence', 'alpha:visual-snapshot', 'alpha:visual-review', 'alpha:enjin-operator-smoke', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'delete env.ENJIN_PLATFORM_TOKEN', 'reports/alpha-local-suite.json']
  },
  {
    file: 'scripts/check-alpha-local-evidence.mjs',
    includes: ['No-secret local Alpha RC evidence summary', 'alpha-local-evidence.json', 'alpha-local-evidence.md', 'readGitState', 'localHead', 'same-suite evidence', 'built server smoke report', 'assertCurrentGitState', 'current HEAD', 'browser presence must prove observer-side movement', 'visual snapshot canvas PNG must be non-empty', 'visual review must keep rendered prompt interaction as a manual pre-RC gate', 'Wallet Daemon local check must stay no-cost and metadata-only', 'built server smoke must prove tokened Enjin route fails closed', 'local-only']
  },
  {
    file: 'scripts/check-alpha-report-hygiene.mjs',
    includes: ['No-secret hygiene scan', 'alpha-report-hygiene.json', 'alpha-operator-checklist.json', 'alpha-provider-preflight.json', 'alpha-external-gates.json', 'alpha-preview-ready.json', 'alpha-visual-review.json', 'alpha-manual-prompt-review.json', 'wallet-daemon-local.json', 'readGitState', 'localHead', 'mochi-social-alpha-operator-next-steps.md', 'mochi-social-alpha-provider-preflight.md', 'mochi-social-alpha-sync-approval.md', 'mochi-social-alpha-preview-ready.md', 'Unredacted local suite token', 'Wallet daemon password assignment', 'Supabase service role assignment']
  },
  {
    file: 'scripts/check-alpha-gate-contracts.mjs',
    includes: ['Mochi Social alpha gate contract checks passed', 'previewLiveGateNames', 'fundedChainGateNames', 'previewFlySecrets', 'Live game contract', 'Site preview contract', 'Fly funded-chain secret names', 'Enjin Canary operator readiness', 'requiresHostedApproval(gameUrl)', 'fetchJson(`${gameUrl}/healthz`)', 'fundedChainRequiredForPreview: false']
  },
  {
    file: 'scripts/write-alpha-manual-prompt-review.mjs',
    includes: ['alpha-manual-prompt-review.json', 'alpha-manual-prompt-review.md', 'pending-human-review', 'MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK', 'MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER', 'MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER', 'MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED']
  },
  {
    file: 'scripts/check-wallet-daemon-local.mjs',
    includes: ['wallet-daemon-local.json', 'wallet-daemon-local.md', 'No-cost local Wallet Daemon binary check', 'never runs wallet-daemon import', 'never runs wallet-daemon print-seed', 'never starts a long-running signer process', 'never contacts Enjin Platform', 'MOCHI_SOCIAL_WALLET_DAEMON_PATH', 'MOCHI_SOCIAL_WALLET_DAEMON_REQUIRED', 'sha256']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['alpha-visual-review.json', 'alpha-visual-review.md', 'readGitState', 'manualPromptGate', 'pending-human-review', 'alpha:manual-prompt-review', 'observerMovement', 'guild-seal-chest', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'fieldExpedition', 'fieldAccord', 'fieldAccordProof', 'routeInvitation', 'habitatBond', 'habitatBondProof', 'sanctuaryRiteProof', 'sanctuaryBellClaimed', 'Jade Court Sanctuary Rite', 'jade-sanctuary-bell', 'spirit-sanctuary-rite', 'sanctuary rite', 'spiritResearch', 'researchProof', 'spiritCompendium', 'compendiumProof', 'rosterArchiveProof', 'rosterArchiveSealClaimed', 'Jade Court Roster Archive', 'jade-roster-archive-seal', 'spirit-roster-archive', 'roster archive', 'careCycleProof', 'careCycleKnotClaimed', 'Jade Court Care Cycle', 'jade-care-cycle-knot', 'spirit-care-cycle', 'care cycle', 'fieldAlmanacProof', 'fieldAlmanacClaspClaimed', 'Jade Field Almanac', 'jade-field-almanac-clasp', 'spirit-field-almanac', 'field almanac', 'provisionSatchel', 'provisionProof', 'guildCommission', 'commissionProof', 'socialRally', 'guildSocialRally', 'rallyProof', 'emoteProof', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'jade-wayfarer-chronicle-clasp', 'guild-wayfarer-chronicle', 'wayfarer chronicle', 'guildAscensionProof', 'guildAscensionRibbonClaimed', 'Jade Court Ascension Trial', 'jade-court-ascension-ribbon', 'guild-ascension-trial', 'guild ascension trial', 'tournamentProof', 'tournamentPennantClaimed', 'Jade Banner Tournament', 'jade-banner-tournament-pennant', 'battle-tournament-bracket', 'tournament bracket', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'techniqueMastery', 'battleTactic', 'guildRank', 'growthRite', 'partyHarmony', 'harmonyFormProof', 'harmonyTrial', 'harmonyTrialProof', 'teamSparMatch', 'teamSparMatchProof', 'mentorChallengeProof', 'conditionWeaveProof', 'battleConditionWeave', 'canaryReturnPreview', 'canaryReturnRequested', 'battleRoundTranscript', 'battleRoundProof', 'affinityTrial', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'Jade Lantern Court']
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
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-operator-next-steps.md', 'alpha-operator-checklist.json', 'readGitState', 'localHead', 'walletDaemonSummary', 'manualPromptSummary', 'providerActionQueue', 'buildProviderActionQueue', 'Provider Action Queue', 'approvalText', 'noCostFallback', 'github-branch-sync', 'github-site-branch-sync', 'fly-secret-update', 'fly-funded-chain-secret-update', 'fly-live-game-contract', 'vercel-supabase-preview-contract', 'enjin-canary-readiness', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'noCostRule', 'This file is intentionally no-secret', 'KEY_PASS=<private-wallet-daemon-passphrase>', 'PLATFORM_KEY=<private-enjin-platform-token>', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:external-gates']
  },
  {
    file: 'scripts/write-alpha-provider-preflight.mjs',
    includes: ['mochi-social-alpha-provider-preflight.md', 'alpha-provider-preflight.json', 'This file is intentionally no-secret', 'contentsRead: false', 'providerActionQueue', 'missingExpectedPrivateInputFiles', 'does not read private credential file contents', 'Known Provider Action IDs', 'Next Approval IDs', 'github-branch-sync', 'github-site-branch-sync', 'fly-secret-update', 'fly-funded-chain-secret-update', 'fly-live-game-contract', 'vercel-supabase-preview-contract', 'enjin-canary-readiness']
  },
  {
    file: 'scripts/write-alpha-sync-approval.mjs',
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-sync-approval.md', 'alpha-sync-approval.json', 'This file is intentionally no-secret', 'hostedChecksAllowed', 'git: audit.data.git', 'git: report.data.git', 'siteGit', 'prState', 'readPr', 'readPrFixture', 'MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE', 'MOCHI_SOCIAL_PREVIEW_ENV_FILE', 'Local Preview URL File', 'readNamedUrl', 'localHeadMatchesPrHead', 'PR State', 'github-site-branch-sync', 'approvalsRequired', 'approvalActions', 'costRisk', 'noCostAlternative', 'Cost-Sensitive Action Matrix', 'GitHub Actions/PR checks', 'Suggested combined public-repo sync command note', 'Proceed with public-repo sync', 'fly-funded-chain-secret-update', 'preview-live-gates', 'funded-chain-gates']
  },
  {
    file: 'scripts/check-alpha-sync-approval-self-test.mjs',
    includes: ['Mochi Social sync approval self-test OK', 'writePrFixture', 'writePreviewEnvFixture', 'MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE', 'localHeadMatchesPrHead === false', '## PR State', '## Local Preview URL File', 'https://preview.example.test', 'local HEAD does not match PR head', 'fakeToken']
  },
  {
    file: 'scripts/check-alpha-preview-ready.mjs',
    includes: ['Mochi Social Alpha Preview Ready audit', 'reports/alpha-preview-ready.json', 'mochi-social-alpha-preview-ready.md', 'tester-entry lane only', 'preview-live-gates', 'hosted contract checks have not been explicitly approved/run', 'fundedChainRequiredForPreview: false', 'preview.game-branch-sync', 'preview.site-branch-sync', 'alpha-manual-prompt-review.json']
  },
  {
    file: 'scripts/check-alpha-rc-audit.mjs',
    includes: ['Mochi Social Alpha RC audit', 'reports/alpha-rc-audit.json', 'readGitState', 'provider.external-gates', 'hostedChecksAllowed', 'external gate report', 'game.visual-review', 'game.manual-prompt-review-script', 'game.wallet-daemon-local-check', 'game.map-event-behavior', 'local.manual-prompt-review', 'syncExternalGateSnapshotFailures', 'local.evidence-summary', 'local.operator-checklist-current', 'local.provider-preflight-current', 'providerActionQueueIds', 'operator checklist provider action queue missing', 'provider preflight queue missing', 'local.sync-approval-current', 'currentGitStateFailures', 'currentGitStateFailuresForRepo', 'github.local-branch-sync', 'github.site-local-branch-sync', 'github.game-pr', 'github.site-pr', 'rev-list', '--porcelain', 'commandAt', 'Mochirii', 'mochi-social-alpha-provider-preflight.md', 'mochi-social-alpha-sync-approval.md', 'mochirii-mochi-social-alpha-operator-next-steps.md', 'mochi-social-alpha-vercel-preview.local.txt', 'site.bridge-helper', 'site.bridge-state-self-test', 'site.auth-bridge-check', 'resolveMochiSocialBridgeMessage', 'check-mochi-social-bridge-state.mjs', 'site.edge-authority-check', 'site.edge-authority', 'check-mochi-social-edge-authority.mjs', 'site.preview-key-loader-self-test', 'site.preview-key-loader', 'check-mochi-social-preview-key-loader.mjs', 'site.preview-url-self-test', 'check-mochi-social-preview-url-self-test.mjs', 'site.browser-gate-writer', 'write-mochi-social-browser-gates.mjs', 'site.browser-gate-self-test', 'check-mochi-social-browser-gate-self-test.mjs', 'site.report-hygiene-check', 'check-mochi-social-report-hygiene.mjs', 'site.discord-oauth-self-test', 'site.discord-oauth-detector', 'check-mochi-social-discord-oauth-self-test.mjs', 'site.preview-ready-audit', 'site.bridge-state', 'site.auth-bridge', 'MOCHI_SOCIAL_SITE_PREVIEW_READY_SKIP_SELF_TEST_COMMANDS', 'MOCHI_SOCIAL_PREVIEW_ENV_FILE', 'Local Preview URL File', 'readPreviewEnvFile', 'MOCHI_SOCIAL_SITE_BROWSER_GATES_JSON', 'stored browser gate report', 'MOCHI_SOCIAL_SITE_REPORT_HYGIENE_JSON', 'site.report-hygiene', 'site.preview-ready-report', 'check-mochi-social-preview-ready.mjs', 'mochi-social-preview-ready.json']
  }
];

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file}: missing required file.`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

for (const check of checks) {
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
if (packageJson.engines?.node !== '>=22 <23') {
  failures.push('package.json: Node 22 engine contract changed.');
}

if (failures.length) {
  console.error('Mochi Social alpha readiness failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social alpha readiness checks passed.');
