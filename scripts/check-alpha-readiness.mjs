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
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'npm run alpha:browser-presence', 'npm run alpha:visual-snapshot', 'npm run alpha:visual-review', 'npm run alpha:manual-prompt-review', 'npm run alpha:wallet-daemon-check', 'npm run alpha:enjin-operator-smoke', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:preview-ready', 'npm run alpha:operator-checklist', 'npm run alpha:sync-approval', 'npm run alpha:rc-audit', 'check:mochi-social-bridge-state', 'Two-tab Presence Gate', 'Visual Snapshot Gate', 'Manual Prompt Review Gate', 'Wallet Daemon Local Check', 'canvas movement response', 'observer-side canvas change', 'current local HEAD', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'reports/alpha-browser-presence.json', 'reports/alpha-visual-page.png', 'reports/alpha-visual-review.md', 'reports/alpha-manual-prompt-review.md', 'reports/wallet-daemon-local.md', 'reports/alpha-local-evidence.md', 'reports/alpha-operator-checklist.json', 'reports/alpha-external-gates.json', 'reports/alpha-preview-ready.json', 'reports/alpha-report-hygiene.json', 'no-real-value fallback ledger', 'Alpha Preview Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'No dummy']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'alpha:browser-presence', 'alpha:manual-prompt-review', 'alpha:wallet-daemon-check', 'alpha:enjin-operator-smoke', 'alpha:external-gates', 'alpha:operator-checklist', 'alpha:sync-approval', 'alpha:preview-ready', 'alpha:rc-audit', 'Wallet Daemon', 'Alpha Preview Ready', 'Alpha RC Ready', 'preview-live-gates', 'funded-chain-gates', 'configured-preview-stub', 'docs/codex-external-ops.md', 'Current Private Gates']
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
    includes: ['noRealValue: true', "network: 'CANARY'", 'spiritCapture: true', 'routeInvitations: true', 'routeMastery: true', 'habitatBonds: true', 'spiritResearch: true', 'spiritCompendium: true', 'itemProvisions: true', 'guildCommissions: true', 'socialRallies: true', 'wayfarerChronicles: true', 'spiritJournal: true', 'fieldExpeditions: true', 'fieldAccords: true', 'techniqueMastery: true', 'battleTactics: true', 'techniqueLoadouts: true', 'spiritTraits: true', 'conditionWeaves: true', 'guildRankTrials: true', 'spiritGrowthRites: true', 'questChains: true', 'affinityTrials: true', 'partyFormation: true', 'partyHarmony: true', 'harmonyTrials: true', 'teamSparMatches: true', 'mentorChallenges: true', 'battleRoundTranscripts: true', 'sparringLadder: true', "'spirit.capture'", "'spirit.route_invite'", "'world.route_mastery'", "'spirit.habitat_bond'", "'spirit.research'", "'spirit.compendium_complete'", "'item.provision_satchel'", "'guild.commission_complete'", "'guild.social_rally'", "'guild.wayfarer_chronicle'", "'spirit.journal'", "'world.expedition'", "'spirit.technique'", "'spirit.technique_loadout'", "'spirit.trait_attune'", "'battle.condition_weave'", "'battle.tactic_scroll'", "'guild.rank_trial'", "'spirit.growth_rite'", "'party.set'", "'party.harmony_form'", "'battle.harmony_trial'", "'battle.team_spar_match'", "'battle.mentor_challenge'", "'battle.affinity_trial'", "'battle.spar_ladder'", "'chain.operation_update'"]
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['routePatrols: true', "'world.route_patrol'"]
  },
  {
    file: 'apps/game/src/integration/enjin-canary.ts',
    includes: ["network: 'CANARY'", 'fuelTank: config.fuelTankId', 'idempotencyKey: input.requestId', 'executeEnjinGraphqlPlan', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'createListing:', 'pollEnjinTransaction', 'normalizeEnjinTransactionState', 'canCreditHotInventory', 'config.fuelTankId']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['BRIDGE_EVENTS.auth', 'Authorization', 'lirabao-canary-certificate', 'chain.withdraw_request', 'chain.deposit_request', 'data-alpha-action="chain.deposit_request"', 'canaryReturnRequested', 'data-presence-label', 'data-profile-label', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-guild-label', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-rank-label', 'guildRankProof', 'data-growth-label', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-status-label', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'fieldAccordTalismanClaimed', 'SPIRIT_FIELD_ACCORDS', 'resolveSpiritFieldAccord', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'data-compendium-label', 'compendiumProof', 'data-alpha-action="item.provision_satchel"', 'data-provision-label', 'provisionProof', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'data-alpha-action="guild.social_rally"', 'data-rally-label', 'guildSocialRally', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'GUILD_WAYFARER_CHRONICLES', 'resolveGuildWayfarerChronicle', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'data-loadout-label', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'data-trait-label', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'data-condition-label', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'data-mentor-label', 'data-battle-round-label', 'battleRoundProof', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['SPIRIT_ROUTE_PATROLS', 'resolveSpiritRoutePatrol', 'data-alpha-action="world.route_patrol"', 'data-route-patrol-label', 'routePatrolProof', 'routePatrolPennantClaimed']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['cloudbell-reed-bank', 'aozhen', 'Moonbridge Goldleaf Accord', 'Cloudbell Skyvow Accord', 'jade-field-accord-talisman', 'resolveSpiritFieldAccord', 'spirit-field-accord', 'Jade Cloudbell Circuit', 'cloudbell-route-knot', 'resolveSpiritRouteMastery', 'world-route-mastery', 'Jade Court Habitat Bond', 'jade-court-habitat-tassel', 'resolveSpiritHabitatBond', 'spirit-habitat-bond', 'Jade Court Research Folio', 'jade-court-research-folio', 'resolveSpiritResearchFolio', 'spirit-research-folio', 'Jade Court Spirit Compendium', 'jade-court-compendium-seal', 'resolveSpiritCompendiumCompletion', 'spirit-compendium', 'Jade Court Provision Satchel', 'jade-court-provision-satchel', 'Jade Mooncake Box', 'jade-mooncake-box', 'resolveSpiritProvisionSatchel', 'item-provision-satchel', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'resolveGuildSocialRally', 'guild-social-rally', 'Jade Wayfarer Chronicle', 'jade-wayfarer-chronicle-clasp', 'resolveGuildWayfarerChronicle', 'guild-wayfarer-chronicle', 'Jade Step Loadout', 'jade-step-loadout-slip', 'resolveSpiritTechniqueLoadout', 'spirit-technique-loadout', 'Jade Heart Trait Attunement', 'jade-heart-trait-thread', 'resolveSpiritTraitAttunement', 'spirit-trait-attunement', 'Jade Mirror Condition Weave', 'jade-mirror-condition-charm', 'Lantern Ward', 'Goldleaf Tempo', 'Skybell Guard', 'resolveSpiritConditionWeave', 'battle-condition-weave', 'Silk Banner Mentor Drill', 'silk-banner-mentor-seal', 'resolveSpiritMentorChallenge', 'battle-mentor-challenge', 'Silk Market Kindness', 'Skybell Spar', 'selectMochiSpiritQuest', 'resolveMochiSpiritQuestProgress', 'quest-chain']
  },
  {
    file: 'apps/game/src/alpha/content.ts',
    includes: ['Jade Cloudbell Patrol', 'jade-route-patrol-pennant', 'resolveSpiritRoutePatrol', 'world-route-patrol']
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
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/action', '/integration/alpha/enjin/submit', 'buildAlphaActionRequest', 'getSupabaseEdgeConfig', 'ledgerVersion: 1', "source: 'local-alpha-ledger'", "alphaStopPoint: 'alpha-rc-ready'", "chainNetwork: 'CANARY'", 'requireGameServerToken', 'confirmNoRealValue', 'ALPHA_ACTION_TYPES.includes', 'questChains: true', 'routeMastery: true', 'fieldAccords: true', 'habitatBonds: true', 'spiritResearch: true', 'spiritCompendium: true', 'itemProvisions: true', 'guildCommissions: true', 'socialRallies: true', 'wayfarerChronicles: true', 'partyHarmony: true', 'harmonyTrials: true', 'teamSparMatches: true', 'mentorChallenges: true', 'techniqueLoadouts: true', 'spiritTraits: true', 'conditionWeaves: true', 'battleRoundTranscripts: true', 'spirit.capture', 'spirit.route_invite', 'world.route_mastery', 'spirit.habitat_bond', 'spirit.research', 'spirit.compendium_complete', 'item.provision_satchel', 'guild.commission_complete', 'guild.social_rally', 'guild.wayfarer_chronicle', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'spirit.technique_loadout', 'spirit.trait_attune', 'battle.condition_weave', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'party.set', 'party.harmony_form', 'battle.harmony_trial', 'battle.team_spar_match', 'battle.mentor_challenge', 'battle.affinity_trial', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'chain.deposit_request', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['routePatrols: true', 'world.route_patrol']
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
    file: 'apps/game/tests/map-object-contract.test.ts',
    includes: ['Mochi town map object contract', 'runtimeEventPlacements', 'welcome-npc', 'guild-seal-chest', 'care-shrine', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'market-board', 'trade-post', 'canary-shrine', 'no-real-value Enjin Canary certificate request', 'Jade Vault Return Proof', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'guild-social-rally', 'Jade Lantern Court', '25 * 18']
  },
  {
    file: 'apps/game/tests/map-event-behavior.test.ts',
    includes: ['Mochi town event behavior', 'Welcome NPC dialog', 'Mochirii Guild Seal', 'spirit-care', 'bond 5/5', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'training-ring', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'market-board', 'trade-post', 'Jade Courtyard Rally', 'jade-courtyard-rally-knot', 'guildSocialRally', 'mochiSocial.guild.rallyProof', 'no-real-value Enjin Canary certificate request', 'Jade Vault Return Proof', 'Wallet Daemon services']
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
    includes: ['chain.withdraw_request', 'chain.deposit_request', 'confirmNoCreditUntilFinalized', 'spirit.capture', 'spirit.route_invite', 'cloudbell-reed-bank', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'jade-field-accord-talisman', 'world.route_mastery', 'jade-cloudbell-circuit', 'spirit.habitat_bond', 'jade-court-habitat-bond', 'spirit.research', 'jade-court-research-folio', 'spirit.compendium_complete', 'jade-court-spirit-compendium', 'item.provision_satchel', 'jade-court-provision-satchel', 'guild.commission_complete', 'jade-court-commission-ledger', 'guild.social_rally', 'jade-courtyard-rally', 'guild.wayfarer_chronicle', 'jade-wayfarer-chronicle', 'wayfarerChronicles', 'Jade Wayfarer Chronicle', 'party.harmony_form', 'triune-jade-harmony', 'battle.harmony_trial', 'jade-echo-concord', 'battle.team_spar_match', 'jade-mirror-team-match', 'battle.mentor_challenge', 'silk-banner-mentor-drill', 'spirit.technique_loadout', 'jade-step-loadout', 'spirit.trait_attune', 'jade-heart-trait', 'battle.condition_weave', 'jade-mirror-condition-weave', 'spirit.attune', 'spirit.journal', 'world.expedition', 'spirit.technique', 'battle.tactic_scroll', 'guild.rank_trial', 'spirit.growth_rite', 'battle.affinity_trial', 'party.set', 'battle.spar_ladder', 'spirit.train', 'spirit.raise', 'quest.accept', 'quest.progress', 'skybell-spar', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'canvasMovement.changedAfterFirstTabMove=true', 'lirabao-canary-certificate', '/integration/alpha/enjin/submit', 'invalid_game_server_token', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['world.route_patrol', 'jade-cloudbell-patrol', 'routePatrols', 'Jade Cloudbell Patrol', 'two-tester presence proof']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['MOCHI_SOCIAL_LOAD_PLAYERS', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'simulated testers', 'HTTP alpha contract load smoke']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['playwright-core', 'createHash', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'reports/alpha-browser-presence.json', 'Nearby: 2 testers', 'data-presence-label', 'data-alpha-action="spirit.capture"', 'captureProof', 'data-alpha-action="spirit.route_invite"', 'routeInviteProof', 'data-field-accord-label', 'fieldAccordProof', 'cloudbell-skyvow-accord', 'Cloudbell Skyvow Accord cleared', 'fieldAccordTalismanClaimed', 'data-alpha-action="world.route_mastery"', 'routeMasteryProof', 'data-alpha-action="spirit.habitat_bond"', 'habitatBondProof', 'data-alpha-action="spirit.research"', 'researchProof', 'data-alpha-action="spirit.compendium_complete"', 'compendiumProof', 'data-alpha-action="item.provision_satchel"', 'provisionProof', 'jade-court-provision-satchel', 'data-alpha-action="guild.commission_complete"', 'commissionProof', 'jade-court-commission-ledger', 'data-alpha-action="guild.social_rally"', 'rallyProof', 'emoteProof', 'Jade Courtyard Rally', 'data-alpha-action="guild.wayfarer_chronicle"', 'data-chronicle-label', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle complete', 'jade-court-spirit-compendium', 'jade-cloudbell-circuit', 'jade-court-habitat-bond', 'jade-court-research-folio', 'cloudbell-reed-bank', 'aozhen', 'data-alpha-action="party.harmony_form"', 'harmonyFormProof', 'triune-jade-harmony', 'data-alpha-action="battle.harmony_trial"', 'harmonyTrialProof', 'jade-echo-concord', 'data-alpha-action="battle.team_spar_match"', 'teamSparMatchProof', 'jade-mirror-team-match', 'data-alpha-action="battle.mentor_challenge"', 'mentorChallengeProof', 'silk-banner-mentor-drill', 'data-alpha-action="spirit.technique_loadout"', 'techniqueLoadoutProof', 'jade-step-loadout', 'data-alpha-action="spirit.trait_attune"', 'traitAttunementProof', 'jade-heart-trait', 'data-alpha-action="battle.condition_weave"', 'conditionWeaveProof', 'jade-mirror-condition-weave', 'data-alpha-action="spirit.attune"', 'attunedSpiritIds', 'data-alpha-action="spirit.journal"', 'journalProof', 'data-alpha-action="world.expedition"', 'expeditionProof', 'data-alpha-action="spirit.technique"', 'techniqueProof', 'data-alpha-action="battle.tactic_scroll"', 'tacticProof', 'data-alpha-action="guild.rank_trial"', 'guildRankProof', 'data-alpha-action="spirit.growth_rite"', 'growthRiteProof', 'data-alpha-action="battle.affinity_trial"', 'affinityProof', 'data-alpha-action="party.set"', 'partyIds', 'data-alpha-action="spirit.care"', 'data-alpha-action="spirit.train"', 'trainingXp', 'data-alpha-action="battle.spar_ladder"', 'sparLadderXp', 'battleRoundProof', 'battleRoundTranscript', 'data-battle-round-label', 'data-alpha-action="spirit.raise"', 'raisingProof', 'data-alpha-local-action="profile.view"', 'profileViewed', 'data-alpha-local-action="guild.buddy"', 'guildBuddyProof', 'data-alpha-local-action="status.set"', 'statusMood', 'data-alpha-local-action="spirit.inspect"', 'lastInspectedSpiritId', 'data-alpha-action="quest.accept"', 'activeQuestId', 'data-alpha-action="quest.progress"', 'completedQuestSteps', 'completedQuestIds', 'questChainProof', 'chain.withdraw_request', 'chain.deposit_request', 'canaryReturnRequested', 'Jade Vault Return Proof staged', 'mochiSocial.alphaState', 'canvasMovement', 'changedAfterFirstTabMove', 'ArrowLeft', 'ArrowDown', 'canvas']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['data-alpha-action="world.route_patrol"', 'data-route-patrol-label', 'routePatrolProof', 'routePatrolPennantClaimed', 'Jade Cloudbell Patrol complete']
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
    includes: ['alpha-visual-review.json', 'alpha-visual-review.md', 'readGitState', 'manualPromptGate', 'pending-human-review', 'alpha:manual-prompt-review', 'observerMovement', 'guild-seal-chest', 'habitat-grove', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'fieldExpedition', 'fieldAccord', 'fieldAccordProof', 'routeInvitation', 'habitatBond', 'habitatBondProof', 'spiritResearch', 'researchProof', 'spiritCompendium', 'compendiumProof', 'provisionSatchel', 'provisionProof', 'guildCommission', 'commissionProof', 'socialRally', 'guildSocialRally', 'rallyProof', 'emoteProof', 'wayfarerChronicleProof', 'wayfarerChronicleClaspClaimed', 'Jade Wayfarer Chronicle', 'jade-wayfarer-chronicle-clasp', 'guild-wayfarer-chronicle', 'wayfarer chronicle', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'techniqueMastery', 'battleTactic', 'guildRank', 'growthRite', 'partyHarmony', 'harmonyFormProof', 'harmonyTrial', 'harmonyTrialProof', 'teamSparMatch', 'teamSparMatchProof', 'mentorChallengeProof', 'conditionWeaveProof', 'battleConditionWeave', 'canaryReturnPreview', 'canaryReturnRequested', 'battleRoundTranscript', 'battleRoundProof', 'affinityTrial', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'Jade Lantern Court']
  },
  {
    file: 'scripts/check-alpha-visual-review.mjs',
    includes: ['routePatrolProof', 'routePatrolPennantClaimed', 'Jade Cloudbell Patrol', 'jade-route-patrol-pennant', 'world-route-patrol', 'route patrol']
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
