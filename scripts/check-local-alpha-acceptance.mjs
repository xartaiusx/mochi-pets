import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const saveDir = process.env.RPG_SAVE_DIR ?? '.local/saves';
const ledgerPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ALPHA_LEDGER_PATH ?? join(saveDir, 'alpha-ledger.jsonl'));
const reportPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ACCEPTANCE_REPORT ?? 'reports/alpha-local-acceptance.json');
const allowEdgeMode = process.env.MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE === 'true';
const requestTimeoutMs = Number(process.env.MOCHI_SOCIAL_ACCEPTANCE_REQUEST_TIMEOUT_MS || 10000);
const runId = `local-accept-${Date.now().toString(36)}`;

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  runId,
  endpoints: [],
  actions: [],
  ledgerPath,
  reportPath,
  manualGates: [
    'Run npm run alpha:browser-presence and verify reports/alpha-browser-presence.json contains canvasMovement.changedAfterFirstTabMove=true.',
    'Use the in-game NPC/chest/habitat interactions once before marking Alpha RC Ready.'
  ]
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social local alpha acceptance passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social local alpha acceptance failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const health = await getJson('/healthz', 'health');
  assert(health.body.ok === true && health.body.name === 'Mochi Social', '/healthz did not identify Mochi Social.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assert(manifest.body.name === 'Mochi Social', 'Manifest name changed.');
  assert(manifest.body.auth?.tokenPolicy === 'access-token-only', 'Manifest must keep access-token-only auth policy.');
  assert(manifest.body.alpha?.noRealValue === true, 'Manifest must keep alpha no-real-value.');
  assert(manifest.body.chain?.provider === 'enjin', 'Manifest must keep Enjin as chain provider.');
  assert(manifest.body.chain?.network === 'CANARY', 'Manifest must keep Canary network.');
  assert(manifest.body.market?.fixedPrice === true, 'Manifest must keep fixed-price market enabled.');
  assert(manifest.body.market?.auctions === false, 'Manifest must keep auctions disabled.');
  assert(manifest.body.gameplay?.spiritCapture === true, 'Manifest must expose Mochi Spirit capture.');
  assert(manifest.body.gameplay?.spiritCaptureRites === true, 'Manifest must expose Mochi Spirit capture rites.');
  assert(manifest.body.gameplay?.spiritAttunement === true, 'Manifest must expose Mochi Spirit attunement.');
  assert(manifest.body.gameplay?.routeInvitations === true, 'Manifest must expose Mochi Spirit route invitations.');
  assert(manifest.body.gameplay?.routeMastery === true, 'Manifest must expose Mochi Spirit route mastery.');
  assert(manifest.body.gameplay?.routePatrols === true, 'Manifest must expose Mochi Spirit route patrols.');
  assert(manifest.body.gameplay?.habitatBonds === true, 'Manifest must expose Mochi Spirit habitat bonds.');
  assert(manifest.body.gameplay?.spiritSanctuaryRites === true, 'Manifest must expose Mochi Spirit sanctuary rites.');
  assert(manifest.body.gameplay?.spiritResearch === true, 'Manifest must expose Mochi Spirit research folios.');
  assert(manifest.body.gameplay?.spiritCompendium === true, 'Manifest must expose Mochi Spirit compendium completion.');
  assert(manifest.body.gameplay?.spiritRosterArchives === true, 'Manifest must expose Mochi Spirit roster archives.');
  assert(manifest.body.gameplay?.spiritCareCycles === true, 'Manifest must expose Mochi Spirit care cycles.');
  assert(manifest.body.gameplay?.spiritTemperamentConcords === true, 'Manifest must expose Mochi Spirit temperament concords.');
  assert(manifest.body.gameplay?.spiritFieldAlmanacs === true, 'Manifest must expose Mochi Spirit field almanacs.');
  assert(manifest.body.gameplay?.routeEcologySurveys === true, 'Manifest must expose Mochi Spirit route ecology surveys.');
  assert(manifest.body.gameplay?.spiritEncounterAtlases === true, 'Manifest must expose Mochi Spirit encounter atlases.');
  assert(manifest.body.gameplay?.spiritCraftWrits === true, 'Manifest must expose Mochi Spirit craft writs.');
  assert(manifest.body.gameplay?.spiritRivalCircles === true, 'Manifest must expose Mochi Spirit rival circles.');
  assert(manifest.body.gameplay?.routeWaystones === true, 'Manifest must expose Mochi Spirit route waystones.');
  assert(manifest.body.gameplay?.spiritNurtureRites === true, 'Manifest must expose Mochi Spirit nurture rites.');
  assert(manifest.body.gameplay?.spiritKinshipAlbums === true, 'Manifest must expose Mochi Spirit kinship albums.');
  assert(manifest.body.gameplay?.itemProvisions === true, 'Manifest must expose Mochirii item provision satchels.');
  assert(manifest.body.gameplay?.guildCommissions === true, 'Manifest must expose Mochirii guild commissions.');
  assert(manifest.body.gameplay?.socialRallies === true, 'Manifest must expose Mochirii social rallies.');
  assert(manifest.body.gameplay?.spiritStoryChapters === true, 'Manifest must expose Mochi Spirit story chapters.');
  assert(manifest.body.gameplay?.guildInsigniaCases === true, 'Manifest must expose the Mochirii guild insignia case.');
  assert(manifest.body.gameplay?.wayfarerChronicles === true, 'Manifest must expose the Mochirii wayfarer chronicle.');
  assert(manifest.body.gameplay?.guildAscensionTrials === true, 'Manifest must expose the Mochirii guild ascension trial.');
  assert(manifest.body.gameplay?.partyFormation === true, 'Manifest must expose Mochi Spirit party formation.');
  assert(manifest.body.gameplay?.partyHarmony === true, 'Manifest must expose Mochi Spirit party harmony.');
  assert(manifest.body.gameplay?.harmonyTrials === true, 'Manifest must expose Mochi Spirit harmony trials.');
  assert(manifest.body.gameplay?.teamSparMatches === true, 'Manifest must expose Mochi Spirit team spar matches.');
  assert(manifest.body.gameplay?.mentorChallenges === true, 'Manifest must expose Mochi Spirit mentor challenges.');
  assert(manifest.body.gameplay?.spiritTournamentBrackets === true, 'Manifest must expose Mochi Spirit tournament brackets.');
  assert(manifest.body.gameplay?.battleRoundTranscripts === true, 'Manifest must expose Mochi Spirit battle round transcripts.');
  assert(manifest.body.gameplay?.conditionWeaves === true, 'Manifest must expose Mochi Spirit condition weaves.');
  assert(manifest.body.gameplay?.fieldExpeditions === true, 'Manifest must expose Mochi Spirit field expeditions.');
  assert(manifest.body.gameplay?.sparringLadder === true, 'Manifest must expose Mochi Spirit sparring ladder.');
  assert(manifest.body.gameplay?.spiritJournal === true, 'Manifest must expose Mochi Spirit journal.');
  assert(manifest.body.gameplay?.techniqueMastery === true, 'Manifest must expose Mochi Spirit technique mastery.');
  assert(manifest.body.gameplay?.battleTactics === true, 'Manifest must expose Mochi Spirit battle tactics.');
  assert(manifest.body.gameplay?.techniqueLoadouts === true, 'Manifest must expose Mochi Spirit technique loadouts.');
  assert(manifest.body.gameplay?.spiritTraits === true, 'Manifest must expose Mochi Spirit trait attunements.');
  assert(manifest.body.gameplay?.guildRankTrials === true, 'Manifest must expose Mochirii guild rank trials.');
  assert(manifest.body.gameplay?.spiritGrowthRites === true, 'Manifest must expose Mochi Spirit growth rites.');
  assert(manifest.body.gameplay?.affinityTrials === true, 'Manifest must expose Mochi Spirit affinity trials.');
  assert(manifest.body.gameplay?.copiedUpstreamContent === false, 'Manifest must reject copied upstream content.');

  const alphaStatus = await getJson('/integration/alpha/status', 'alpha status');
  assert(alphaStatus.body.alpha?.stopPoint === 'alpha-rc-ready', 'Alpha status must expose the RC stop point.');
  assert(alphaStatus.body.market?.fixedPrice === true, 'Alpha status must keep fixed-price enabled.');
  assert(alphaStatus.body.market?.auctions === false, 'Alpha status must keep auctions disabled.');
  assert(alphaStatus.body.gameplay?.spiritCapture === true, 'Alpha status must expose Mochi Spirit capture.');
  assert(alphaStatus.body.gameplay?.spiritCaptureRites === true, 'Alpha status must expose Mochi Spirit capture rites.');
  assert(alphaStatus.body.gameplay?.spiritAttunement === true, 'Alpha status must expose Mochi Spirit attunement.');
  assert(alphaStatus.body.gameplay?.routeInvitations === true, 'Alpha status must expose Mochi Spirit route invitations.');
  assert(alphaStatus.body.gameplay?.routeMastery === true, 'Alpha status must expose Mochi Spirit route mastery.');
  assert(alphaStatus.body.gameplay?.routePatrols === true, 'Alpha status must expose Mochi Spirit route patrols.');
  assert(alphaStatus.body.gameplay?.habitatBonds === true, 'Alpha status must expose Mochi Spirit habitat bonds.');
  assert(alphaStatus.body.gameplay?.spiritSanctuaryRites === true, 'Alpha status must expose Mochi Spirit sanctuary rites.');
  assert(alphaStatus.body.gameplay?.spiritResearch === true, 'Alpha status must expose Mochi Spirit research folios.');
  assert(alphaStatus.body.gameplay?.spiritCompendium === true, 'Alpha status must expose Mochi Spirit compendium completion.');
  assert(alphaStatus.body.gameplay?.spiritRosterArchives === true, 'Alpha status must expose Mochi Spirit roster archives.');
  assert(alphaStatus.body.gameplay?.spiritCareCycles === true, 'Alpha status must expose Mochi Spirit care cycles.');
  assert(alphaStatus.body.gameplay?.spiritTemperamentConcords === true, 'Alpha status must expose Mochi Spirit temperament concords.');
  assert(alphaStatus.body.gameplay?.spiritFieldAlmanacs === true, 'Alpha status must expose Mochi Spirit field almanacs.');
  assert(alphaStatus.body.gameplay?.routeEcologySurveys === true, 'Alpha status must expose Mochi Spirit route ecology surveys.');
  assert(alphaStatus.body.gameplay?.spiritEncounterAtlases === true, 'Alpha status must expose Mochi Spirit encounter atlases.');
  assert(alphaStatus.body.gameplay?.spiritCraftWrits === true, 'Alpha status must expose Mochi Spirit craft writs.');
  assert(alphaStatus.body.gameplay?.spiritRivalCircles === true, 'Alpha status must expose Mochi Spirit rival circles.');
  assert(alphaStatus.body.gameplay?.routeWaystones === true, 'Alpha status must expose Mochi Spirit route waystones.');
  assert(alphaStatus.body.gameplay?.spiritNurtureRites === true, 'Alpha status must expose Mochi Spirit nurture rites.');
  assert(alphaStatus.body.gameplay?.spiritRecoveryTeas === true, 'Alpha status must expose Mochi Spirit recovery tea proofs.');
  assert(alphaStatus.body.gameplay?.spiritKinshipAlbums === true, 'Alpha status must expose Mochi Spirit kinship albums.');
  assert(alphaStatus.body.gameplay?.spiritNurseryGroves === true, 'Alpha status must expose Mochi Spirit nursery grove proofs.');
  assert(alphaStatus.body.gameplay?.itemProvisions === true, 'Alpha status must expose Mochirii item provision satchels.');
  assert(alphaStatus.body.gameplay?.guildCommissions === true, 'Alpha status must expose Mochirii guild commissions.');
  assert(alphaStatus.body.gameplay?.socialRallies === true, 'Alpha status must expose Mochirii social rallies.');
  assert(alphaStatus.body.gameplay?.spiritStoryChapters === true, 'Alpha status must expose Mochi Spirit story chapters.');
  assert(alphaStatus.body.gameplay?.guildInsigniaCases === true, 'Alpha status must expose the Mochirii guild insignia case.');
  assert(alphaStatus.body.gameplay?.wayfarerChronicles === true, 'Alpha status must expose the Mochirii wayfarer chronicle.');
  assert(alphaStatus.body.gameplay?.guildAscensionTrials === true, 'Alpha status must expose the Mochirii guild ascension trial.');
  assert(alphaStatus.body.gameplay?.partyFormation === true, 'Alpha status must expose Mochi Spirit party formation.');
  assert(alphaStatus.body.gameplay?.partyHarmony === true, 'Alpha status must expose Mochi Spirit party harmony.');
  assert(alphaStatus.body.gameplay?.harmonyTrials === true, 'Alpha status must expose Mochi Spirit harmony trials.');
  assert(alphaStatus.body.gameplay?.teamSparMatches === true, 'Alpha status must expose Mochi Spirit team spar matches.');
  assert(alphaStatus.body.gameplay?.mentorChallenges === true, 'Alpha status must expose Mochi Spirit mentor challenges.');
  assert(alphaStatus.body.gameplay?.spiritTournamentBrackets === true, 'Alpha status must expose Mochi Spirit tournament brackets.');
  assert(alphaStatus.body.gameplay?.battleRoundTranscripts === true, 'Alpha status must expose Mochi Spirit battle round transcripts.');
  assert(alphaStatus.body.gameplay?.conditionWeaves === true, 'Alpha status must expose Mochi Spirit condition weaves.');
  assert(alphaStatus.body.gameplay?.fieldExpeditions === true, 'Alpha status must expose Mochi Spirit field expeditions.');
  assert(alphaStatus.body.gameplay?.sparringLadder === true, 'Alpha status must expose Mochi Spirit sparring ladder.');
  assert(alphaStatus.body.gameplay?.spiritJournal === true, 'Alpha status must expose Mochi Spirit journal.');
  assert(alphaStatus.body.gameplay?.techniqueMastery === true, 'Alpha status must expose Mochi Spirit technique mastery.');
  assert(alphaStatus.body.gameplay?.battleTactics === true, 'Alpha status must expose Mochi Spirit battle tactics.');
  assert(alphaStatus.body.gameplay?.techniqueLoadouts === true, 'Alpha status must expose Mochi Spirit technique loadouts.');
  assert(alphaStatus.body.gameplay?.spiritTraits === true, 'Alpha status must expose Mochi Spirit trait attunements.');
  assert(alphaStatus.body.gameplay?.guildRankTrials === true, 'Alpha status must expose Mochirii guild rank trials.');
  assert(alphaStatus.body.gameplay?.spiritGrowthRites === true, 'Alpha status must expose Mochi Spirit growth rites.');
  assert(alphaStatus.body.gameplay?.affinityTrials === true, 'Alpha status must expose Mochi Spirit affinity trials.');
  assert(alphaStatus.body.gameplay?.trainingBattles === true, 'Alpha status must expose training battles.');
  assert(alphaStatus.body.gameplay?.raisingCare === true, 'Alpha status must expose raising care.');
  assert(alphaStatus.body.gameplay?.roleplayQuests === true, 'Alpha status must expose roleplay quests.');
  assert(alphaStatus.body.gameplay?.questChains === true, 'Alpha status must expose roleplay quest chains.');
  assert(alphaStatus.body.gameplay?.copiedUpstreamContent === false, 'Alpha status must reject copied upstream content.');
  assert(alphaStatus.body.chain?.network === 'CANARY', 'Alpha status must stay Canary-only.');
  assert(alphaStatus.body.edgeFunctions?.action === 'mochi-social-alpha-action', 'Alpha status must expose the Mochirii action function name.');
  assert(alphaStatus.body.chainRuntime?.network === 'CANARY', 'Alpha status must expose Enjin Canary runtime details.');
  if (alphaStatus.body.enjinCanaryConfigured === false) {
    assert(alphaStatus.body.chainRuntime?.mode === 'configured-preview-stub', 'Missing Enjin env must expose configured-preview-stub mode.');
    assert(
      String(alphaStatus.body.chainRuntime?.message || '').includes('configured preview stub'),
      'Configured preview stub mode must explain the missing Enjin operator setup.'
    );
  }

  if (alphaStatus.body.supabaseEdgeConfigured && !allowEdgeMode) {
    throw new Error(
      'Local acceptance expects the fallback ledger path. Unset MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL and MOCHI_SOCIAL_GAME_SERVER_TOKEN, or set MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true for preview-only endpoint checks.'
    );
  }

  await getOk('/play', 'play');
  await getOk('/embed', 'embed');

  const invalidAction = await postJson('/integration/alpha/action', {
    type: 'chat.send',
    payload: {}
  }, 'invalid action');
  assert(invalidAction.status === 400, 'Invalid alpha action should return 400.');
  assert(invalidAction.body.error === 'invalid_alpha_action', 'Invalid alpha action must use invalid_alpha_action error.');

  const privateEnjinSubmit = await postJson('/integration/alpha/enjin/submit', {
    operation: 'poll-transaction',
    requestId: `${runId}-enjin-private`,
    playerId: 'local-acceptance-player',
    tokenId: '1',
    amount: 1,
    enjinTransactionUuid: 'tx-local-proof',
    confirmNoRealValue: true
  }, 'private enjin operator submit without token');
  assert([401, 503].includes(privateEnjinSubmit.status), 'Private Enjin operator submit must fail closed without the game server token.');
  assert(
    ['invalid_game_server_token', 'enjin_operator_disabled'].includes(privateEnjinSubmit.body.error),
    'Private Enjin operator submit must use a token-gating error.'
  );

  if (allowEdgeMode && alphaStatus.body.supabaseEdgeConfigured) {
    return;
  }

  const actions = [
    {
      requestId: `${runId}-chat`,
      type: 'chat.send',
      payload: { channel: 'local', message: 'Alpha local acceptance hello' }
    },
    {
      requestId: `${runId}-emote`,
      type: 'emote.send',
      payload: { emote: 'wave' }
    },
    {
      requestId: `${runId}-capture`,
      type: 'spirit.capture',
      payload: { spiritId: 'lirabao', offeredItemId: 'lantern-harmony-tea', harmonyScore: 2, source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-attune`,
      type: 'spirit.attune',
      payload: { spiritId: 'lirabao', offeredItemId: 'mochirii-guild-seal', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-party`,
      type: 'party.set',
      payload: { partyIds: ['lirabao'], activeSpiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-journal`,
      type: 'spirit.journal',
      payload: { roster: ['lirabao'], activeSpiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-expedition`,
      type: 'world.expedition',
      payload: { routeId: 'moonbridge-bamboo-trail', roster: ['lirabao'], activeSpiritId: 'lirabao', harmonyScore: 2, discoveredRoutes: [] }
    },
    {
      requestId: `${runId}-route-invite`,
      type: 'spirit.route_invite',
      payload: {
        routeId: 'moonbridge-bamboo-trail',
        offeredItemId: 'jade-thread-charm',
        harmonyScore: 3,
        roster: ['lirabao'],
        discoveredRoutes: ['moonbridge-bamboo-trail'],
        fieldAccordProof: true,
        fieldAccordId: 'moonbridge-goldleaf-accord',
        fieldAccordScore: 7,
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-cloudbell-expedition`,
      type: 'world.expedition',
      payload: { routeId: 'cloudbell-reed-bank', roster: ['lirabao', 'jintari'], activeSpiritId: 'jintari', harmonyScore: 4, discoveredRoutes: ['moonbridge-bamboo-trail'] }
    },
    {
      requestId: `${runId}-cloudbell-route-invite`,
      type: 'spirit.route_invite',
      payload: {
        routeId: 'cloudbell-reed-bank',
        offeredItemId: 'lantern-harmony-tea',
        harmonyScore: 4,
        roster: ['lirabao', 'jintari'],
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        fieldAccordScore: 12,
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-mastery`,
      type: 'world.route_mastery',
      payload: {
        masteryId: 'jade-cloudbell-circuit',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        roster: ['lirabao', 'jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        guildRankProof: true,
        rankTrialId: 'jade-court-initiate',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-patrol`,
      type: 'world.route_patrol',
      payload: {
        patrolId: 'jade-cloudbell-patrol',
        routeId: 'cloudbell-reed-bank',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 18,
        battleRoundOpponentScore: 8,
        harmonyFormProof: true,
        teamSparMatchProof: true,
        mentorChallengeProof: true,
        chatLines: ['Local acceptance route patrol proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-habitat-bond`,
      type: 'spirit.habitat_bond',
      payload: {
        bondId: 'jade-court-habitat-bond',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        careProof: true,
        bond: 3,
        growth: 'sprout',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-sanctuary-rite`,
      type: 'spirit.sanctuary_rite',
      payload: {
        riteId: 'jade-court-sanctuary-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careStreak: 1,
        trainingXp: 3,
        habitatBondProof: true,
        conditionWeaveProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-research`,
      type: 'spirit.research',
      payload: {
        folioId: 'jade-court-research-folio',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        techniqueProof: true,
        tacticProof: true,
        affinityProof: true,
        trainingXp: 3,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-compendium`,
      type: 'spirit.compendium_complete',
      payload: {
        compendiumId: 'jade-court-spirit-compendium',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        researchProof: true,
        researchFolioId: 'jade-court-research-folio',
        routeMasteryProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-roster-archive`,
      type: 'spirit.roster_archive',
      payload: {
        archiveId: 'jade-court-roster-archive',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['aozhen', 'lirabao'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-technique`,
      type: 'spirit.technique',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', currentMasteryXp: 0, bond: 3, noInjury: true }
    },
    {
      requestId: `${runId}-tactic`,
      type: 'battle.tactic_scroll',
      payload: { spiritId: 'jintari', moveId: 'goldleaf-feint', tacticId: 'goldleaf-opening', currentMasteryXp: 10, bond: 3, noInjury: true }
    },
    {
      requestId: `${runId}-technique-loadout`,
      type: 'spirit.technique_loadout',
      payload: {
        loadoutId: 'jade-step-loadout',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        preferredMoveIdBySpiritId: {
          lirabao: 'lantern-pulse',
          jintari: 'goldleaf-feint',
          aozhen: 'skybell-guard'
        },
        techniqueProof: true,
        tacticProof: true,
        tacticId: 'goldleaf-opening',
        techniqueMasteryXp: 17,
        routeMasteryProof: true,
        journalProof: true,
        journalDiscoveredCount: 3,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-rank`,
      type: 'guild.rank_trial',
      payload: { roster: ['lirabao', 'jintari'], activeSpiritId: 'jintari', bond: 3, completedQuestSteps: ['attune-spirit'], tacticProof: true, affinityWins: 1, sparWins: 0, journalDiscoveredCount: 2, noRealValue: true }
    },
    {
      requestId: `${runId}-growth-rite`,
      type: 'spirit.growth_rite',
      payload: { spiritId: 'jintari', bond: 5, growth: 'glow', trainingXp: 3, raisingProof: true, rankTrialProof: true, rankTrialId: 'jade-court-initiate', noRealValue: true }
    },
    {
      requestId: `${runId}-affinity`,
      type: 'battle.affinity_trial',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', trialId: 'jade-mirror-trial', bond: 3, techniqueMasteryXp: 7, noInjury: true }
    },
    {
      requestId: `${runId}-spar`,
      type: 'battle.spar_ladder',
      payload: { partyIds: ['lirabao'], opponentId: 'jade-echo-apprentice', priorWins: 0, noInjury: true }
    },
    {
      requestId: `${runId}-harmony-form`,
      type: 'party.harmony_form',
      payload: {
        formId: 'triune-jade-harmony',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        tacticProof: true,
        affinityProof: true,
        trainingXp: 3,
        sparLadderXp: 5,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-harmony-trial`,
      type: 'battle.harmony_trial',
      payload: {
        trialId: 'jade-echo-concord',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        harmonyFormProof: true,
        harmonyFormId: 'triune-jade-harmony',
        tacticProof: true,
        affinityProof: true,
        sparLadderWins: 1,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance concord proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-team-spar-match`,
      type: 'battle.team_spar_match',
      payload: {
        matchId: 'jade-mirror-team-match',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        harmonyTrialProof: true,
        harmonyTrialId: 'jade-echo-concord',
        harmonyTrialScore: 24,
        routeMasteryProof: true,
        tacticProof: true,
        growthRiteProof: true,
        questChainProof: true,
        trainingXp: 3,
        sparLadderWins: 1,
        chatLines: ['Local acceptance team spar match proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-mentor-challenge`,
      type: 'battle.mentor_challenge',
      payload: {
        challengeId: 'silk-banner-mentor-drill',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        battleRoundProof: true,
        battleRoundId: 'jade-echo-apprentice-round-1',
        battleRoundVictory: true,
        techniqueMasteryXp: 17,
        tacticMasteryXp: 14,
        raisingCareStreak: 1,
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-trait-attune`,
      type: 'spirit.trait_attune',
      payload: {
        traitId: 'jade-heart-trait',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        battleRoundProof: true,
        battleRoundVictory: true,
        growthRiteProof: true,
        careStreak: 2,
        journalProof: true,
        journalDiscoveredCount: 3,
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 4 },
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-condition-weave`,
      type: 'battle.condition_weave',
      payload: {
        weaveId: 'jade-mirror-condition-weave',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        tacticProof: true,
        affinityProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        sparLadderWins: 1,
        trainingXp: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance condition weave proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-capture-rite`,
      type: 'spirit.capture_rite',
      payload: {
        riteId: 'jade-court-capture-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        capturedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        lureItemIds: ['lantern-harmony-tea', 'jade-thread-charm'],
        journalDiscoveredCount: 3,
        localPresenceCount: 2,
        captureProof: true,
        routeInviteProof: true,
        fieldAccordProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance capture rite proof.'],
        rewardItemId: 'jade-capture-rite-tally',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-bond`,
      type: 'spirit.bond',
      payload: { spiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-care`,
      type: 'spirit.care',
      payload: { spiritId: 'lirabao', careType: 'jade-tea', bondDelta: 1 }
    },
    {
      requestId: `${runId}-train`,
      type: 'spirit.train',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', bond: 3, round: 1, noInjury: true }
    },
    {
      requestId: `${runId}-raise`,
      type: 'spirit.raise',
      payload: { spiritId: 'lirabao', needId: 'jade-brush-groom', currentBond: 3 }
    },
    {
      requestId: `${runId}-quest-accept`,
      type: 'quest.accept',
      payload: { questId: 'first-lantern-vow' }
    },
    {
      requestId: `${runId}-quest-progress`,
      type: 'quest.progress',
      payload: { questId: 'first-lantern-vow', stepId: 'attune-spirit' }
    },
    {
      requestId: `${runId}-quest-first-complete`,
      type: 'quest.progress',
      payload: { questId: 'first-lantern-vow', stepId: 'open-journal', completedSteps: ['attune-spirit', 'greet-sifu-narao'] }
    },
    {
      requestId: `${runId}-quest-market-accept`,
      type: 'quest.accept',
      payload: { questId: 'silk-market-kindness' }
    },
    {
      requestId: `${runId}-quest-market-complete`,
      type: 'quest.progress',
      payload: { questId: 'silk-market-kindness', stepId: 'thank-local-buddy', completedSteps: ['list-jade-thread-charm', 'offer-direct-trade'] }
    },
    {
      requestId: `${runId}-quest-skybell-accept`,
      type: 'quest.accept',
      payload: { questId: 'skybell-spar' }
    },
    {
      requestId: `${runId}-quest-skybell-complete`,
      type: 'quest.progress',
      payload: { questId: 'skybell-spar', stepId: 'complete-raising-care', completedSteps: ['choose-training-move', 'finish-training-bout'] }
    },
    {
      requestId: `${runId}-market`,
      type: 'market.fixed_list',
      payload: { itemId: 'jade-thread-charm', quantity: 1, currency: 'guild-seals', price: 5, noRealValue: true }
    },
    {
      requestId: `${runId}-trade`,
      type: 'trade.direct_offer',
      payload: { targetPlayerId: 'local-acceptance-peer', offered: ['jade-thread-charm'], requested: ['guild-seals:5'] }
    },
    {
      requestId: `${runId}-provision-satchel`,
      type: 'item.provision_satchel',
      payload: {
        satchelId: 'jade-court-provision-satchel',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        marketProof: true,
        tradeProof: true,
        routeInviteProof: true,
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        careStreak: 1,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-care-cycle`,
      type: 'spirit.care_cycle',
      payload: {
        cycleId: 'jade-court-care-cycle',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careStreak: 1,
        trainingXp: 3,
        raisingProof: true,
        raisingMilestoneLabel: 'Skybell Whisper Spark',
        rosterArchiveProof: true,
        rosterArchiveId: 'jade-court-roster-archive',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-temperament-concord`,
      type: 'spirit.temperament_concord',
      payload: {
        concordId: 'jade-temperament-concord',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Temperament concord ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-field-almanac`,
      type: 'spirit.field_almanac',
      payload: {
        almanacId: 'jade-field-almanac',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Field almanac ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-ecology`,
      type: 'world.route_ecology',
      payload: {
        surveyId: 'jade-route-ecology-survey',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-route-ecology-map',
        chatLines: ['Route ecology ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-encounter-atlas`,
      type: 'world.encounter_atlas',
      payload: {
        atlasId: 'jade-encounter-atlas',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        encounteredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        capturedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        rarityTiers: ['common', 'uncommon', 'rare'],
        journalDiscoveredCount: 3,
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        captureRiteProof: true,
        captureRiteId: 'jade-court-capture-rite',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-encounter-atlas',
        chatLines: ['Local acceptance encounter atlas proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-craft-writ`,
      type: 'item.craft_writ',
      payload: {
        writId: 'jade-court-craft-writ',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'jintari',
        recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
        stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        marketProof: true,
        tradeProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-court-craft-writ',
        chatLines: ['Local acceptance craft writ proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-waystone`,
      type: 'world.route_waystone',
      payload: {
        waystoneId: 'jade-cloudbell-waystone',
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-waystone-travel-seal',
        chatLines: ['Local acceptance route waystone proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-nurture-rite`,
      type: 'spirit.nurture_rite',
      payload: {
        riteId: 'jade-moonwell-nurture-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        raisingProof: true,
        raisingMilestoneLabel: 'Lacquer Luck Glow',
        bond: 5,
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-moonwell-nurture-ribbon',
        chatLines: ['Local acceptance nurture rite proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-recovery-tea`,
      type: 'spirit.recovery_tea',
      payload: {
        teaId: 'jade-teahouse-recovery',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-teahouse-recovery-cup',
        chatLines: ['Local acceptance recovery tea proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-kinship-album`,
      type: 'spirit.kinship_album',
      payload: {
        albumId: 'jade-kinship-album',
        roster: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        raisingProof: true,
        raisingMilestoneLabel: 'Moonwell Bloom Form',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-kinship-album',
        chatLines: ['Local acceptance kinship album proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-nursery-grove`,
      type: 'spirit.nursery_grove',
      payload: {
        nurseryId: 'jade-nursery-grove',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        recoveryTeaProof: true,
        recoveryTeaId: 'jade-teahouse-recovery',
        kinshipAlbumProof: true,
        kinshipAlbumId: 'jade-kinship-album',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        raisingProof: true,
        raisingMilestoneLabel: 'Moonwell Bloom Form',
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-nursery-sprout',
        chatLines: ['Local acceptance nursery grove proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-tournament-bracket`,
      type: 'battle.tournament_bracket',
      payload: {
        bracketId: 'jade-banner-tournament',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        mentorChallengeScore: 28,
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        harmonyTrialProof: true,
        harmonyTrialId: 'jade-echo-concord',
        conditionWeaveProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        localPresenceCount: 2,
        routePatrolProof: true,
        nurtureRiteProof: true,
        guildRankProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-banner-tournament-pennant',
        chatLines: ['Local acceptance tournament bracket proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-rival-circle`,
      type: 'battle.rival_circle',
      payload: {
        circleId: 'jade-rival-circle',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        tournamentScore: 49,
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        mentorChallengeScore: 28,
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        techniqueLoadoutProof: true,
        traitAttunementProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-rival-circle-mark',
        chatLines: ['Local acceptance rival circle proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-guild-commission`,
      type: 'guild.commission_complete',
      payload: {
        commissionId: 'jade-court-commission-ledger',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        questChainProof: true,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        marketProof: true,
        tradeProof: true,
        trainingXp: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance commission proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-guild-rally`,
      type: 'guild.social_rally',
      payload: {
        rallyId: 'jade-courtyard-rally',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance rally proof.'],
        emoteProof: true,
        commissionProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-story-chapter`,
      type: 'story.chapter_complete',
      payload: {
        chapterId: 'jade-scroll-story-chapter',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        localPresenceCount: 2,
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        routeWaystoneProof: true,
        routeWaystoneId: 'jade-cloudbell-waystone',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        commissionProof: true,
        commissionId: 'jade-court-commission-ledger',
        rallyProof: true,
        rallyId: 'jade-courtyard-rally',
        profileViewed: true,
        guildBuddyProof: true,
        emoteProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-scroll-story-chapter',
        chatLines: ['Local acceptance story chapter proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-canary`,
      type: 'chain.withdraw_request',
      payload: { assetId: 'lirabao-canary-certificate', chainNetwork: 'CANARY', noRealValue: true }
    },
    {
      requestId: `${runId}-canary-return`,
      type: 'chain.deposit_request',
      payload: {
        assetId: 'lirabao-canary-certificate',
        chainNetwork: 'CANARY',
        noRealValue: true,
        priorRequestStaged: true,
        confirmNoCreditUntilFinalized: true
      }
    },
    {
      requestId: `${runId}-insignia-case`,
      type: 'guild.insignia_case',
      payload: {
        caseId: 'jade-insignia-case',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        guildRankProof: true,
        guildRankId: 'jade-court-initiate',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        storyChapterProof: true,
        storyChapterId: 'jade-scroll-story-chapter',
        harmonyFormProof: true,
        harmonyFormId: 'triune-jade-harmony',
        profileViewed: true,
        guildBuddyProof: true,
        emoteProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-insignia-case',
        chatLines: ['Local acceptance insignia case proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-wayfarer-chronicle`,
      type: 'guild.wayfarer_chronicle',
      payload: {
        chronicleId: 'jade-wayfarer-chronicle',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        localPresenceCount: 2,
        captureProof: true,
        captureRiteProof: true,
        encounterAtlasProof: true,
        routeMasteryProof: true,
        routePatrolProof: true,
        routeEcologyProof: true,
        habitatBondProof: true,
        researchProof: true,
        compendiumProof: true,
        provisionProof: true,
        craftWritProof: true,
        routeWaystoneProof: true,
        nurtureRiteProof: true,
        kinshipAlbumProof: true,
        nurseryGroveProof: true,
        commissionProof: true,
        rallyProof: true,
        storyChapterProof: true,
        insigniaCaseProof: true,
        techniqueLoadoutProof: true,
        traitAttunementProof: true,
        conditionWeaveProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        mentorChallengeProof: true,
        tournamentProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        questChainProof: true,
        marketProof: true,
        tradeProof: true,
        canaryPreviewProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance wayfarer chronicle proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-ascension-trial`,
      type: 'guild.ascension_trial',
      payload: {
        trialId: 'jade-court-ascension-trial',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        wayfarerChronicleProof: true,
        kinshipAlbumProof: true,
        nurseryGroveProof: true,
        storyChapterProof: true,
        insigniaCaseProof: true,
        routePatrolProof: true,
        mentorChallengeProof: true,
        tournamentProof: true,
        rivalCircleProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 18,
        battleRoundOpponentScore: 8,
        conditionWeaveProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        questChainProof: true,
        marketProof: true,
        tradeProof: true,
        canaryPreviewProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance guild ascension proof.'],
        noRealValue: true
      }
    }
  ];

  for (const action of actions) {
    const response = await postJson('/integration/alpha/action', action, action.type);
    assert(response.status === 202, `${action.type} should record to the local fallback ledger with 202.`);
    assert(response.body.ok === true, `${action.type} did not return ok=true.`);
    assert(response.body.mode === 'local-alpha-ledger', `${action.type} did not use the local alpha ledger.`);
    assert(response.body.noRealValue === true, `${action.type} did not preserve no-real-value response.`);
    if (action.type.startsWith('chain.')) {
      assert(response.body.chainRuntime?.network === 'CANARY', `${action.type} did not return Enjin Canary runtime details.`);
      assert(response.body.chainRuntime?.mode === 'configured-preview-stub', `${action.type} must explain configured-preview-stub mode locally.`);
    }
    report.actions.push({ requestId: action.requestId, type: action.type, status: response.status });
  }

  const entries = await readLedgerEntries();
  const entriesById = new Map(entries.map((entry) => [entry.requestId, entry]));

  for (const action of actions) {
    const entry = entriesById.get(action.requestId);
    assert(entry, `Missing local ledger entry for ${action.type}. Expected requestId ${action.requestId}.`);
    assert(entry.type === action.type, `Ledger entry ${action.requestId} recorded type ${entry.type}, expected ${action.type}.`);
    assert(entry.ledgerVersion === 1, `Ledger entry ${action.requestId} must use ledgerVersion=1.`);
    assert(entry.source === 'local-alpha-ledger', `Ledger entry ${action.requestId} must identify the local fallback ledger source.`);
    assert(entry.alphaStopPoint === 'alpha-rc-ready', `Ledger entry ${action.requestId} must keep the alpha RC stop point.`);
    assert(entry.chainNetwork === 'CANARY', `Ledger entry ${action.requestId} must stay Canary-scoped.`);
    assert(entry.noRealValue === true, `Ledger entry ${action.requestId} must be no-real-value.`);
    assert(entry.payload && typeof entry.payload === 'object', `Ledger entry ${action.requestId} must preserve the action payload.`);
    assert(typeof entry.receivedAt === 'string', `Ledger entry ${action.requestId} must include receivedAt.`);
  }

  const cloudbellInvite = entriesById.get(`${runId}-cloudbell-route-invite`);
  assert(cloudbellInvite?.payload?.fieldAccordProof === true, 'Cloudbell route invite ledger entry must preserve field accord proof.');
  assert(cloudbellInvite?.payload?.fieldAccordId === 'cloudbell-skyvow-accord', 'Cloudbell route invite ledger entry must preserve the field accord id.');
  assert(cloudbellInvite?.payload?.fieldAccordRewardItemId === 'jade-field-accord-talisman', 'Cloudbell route invite ledger entry must preserve the no-real-value field accord talisman proof.');
  const routePatrol = entriesById.get(`${runId}-route-patrol`);
  assert(routePatrol?.payload?.patrolId === 'jade-cloudbell-patrol', 'Route patrol ledger entry must preserve the Jade Cloudbell Patrol id.');
  assert(routePatrol?.payload?.localPresenceCount === 2, 'Route patrol ledger entry must preserve the two-tester presence proof.');
  assert(routePatrol?.payload?.routeMasteryProof === true, 'Route patrol ledger entry must preserve route mastery proof.');
  assert(routePatrol?.payload?.fieldAccordProof === true, 'Route patrol ledger entry must preserve field accord proof.');
  assert(routePatrol?.payload?.battleRoundProof === true, 'Route patrol ledger entry must preserve battle round proof.');
  assert(routePatrol?.payload?.noRealValue === true, 'Route patrol ledger entry must remain no-real-value.');
  const sanctuary = entriesById.get(`${runId}-sanctuary-rite`);
  assert(sanctuary?.payload?.riteId === 'jade-court-sanctuary-rite', 'Sanctuary rite ledger entry must preserve the Jade Court Sanctuary Rite id.');
  assert(Array.isArray(sanctuary?.payload?.partyIds) && sanctuary.payload.partyIds.length === 3, 'Sanctuary rite ledger entry must preserve full-party proof.');
  assert(sanctuary?.payload?.habitatBondProof === true, 'Sanctuary rite ledger entry must preserve habitat bond proof.');
  assert(sanctuary?.payload?.conditionWeaveProof === true, 'Sanctuary rite ledger entry must preserve condition weave proof.');
  assert(sanctuary?.payload?.battleRoundVictory === true, 'Sanctuary rite ledger entry must preserve no-injury battle victory proof.');
  assert(sanctuary?.payload?.noRealValue === true, 'Sanctuary rite ledger entry must remain no-real-value.');
  const rosterArchive = entriesById.get(`${runId}-roster-archive`);
  assert(rosterArchive?.payload?.archiveId === 'jade-court-roster-archive', 'Roster archive ledger entry must preserve the Jade Court Roster Archive id.');
  assert(Array.isArray(rosterArchive?.payload?.roster) && rosterArchive.payload.roster.length === 3, 'Roster archive ledger entry must preserve full roster proof.');
  assert(Array.isArray(rosterArchive?.payload?.partyIds) && rosterArchive.payload.partyIds.length === 2, 'Roster archive ledger entry must preserve archive party proof.');
  assert(rosterArchive?.payload?.compendiumProof === true, 'Roster archive ledger entry must preserve compendium proof.');
  assert(rosterArchive?.payload?.sanctuaryRiteProof === true, 'Roster archive ledger entry must preserve sanctuary rite proof.');
  assert(rosterArchive?.payload?.noRealValue === true, 'Roster archive ledger entry must remain no-real-value.');
  const careCycle = entriesById.get(`${runId}-care-cycle`);
  assert(careCycle?.payload?.cycleId === 'jade-court-care-cycle', 'Care cycle ledger entry must preserve the Jade Court Care Cycle id.');
  assert(Array.isArray(careCycle?.payload?.roster) && careCycle.payload.roster.length === 3, 'Care cycle ledger entry must preserve full roster proof.');
  assert(careCycle?.payload?.bondBySpiritId?.lirabao >= 3, 'Care cycle ledger entry must preserve Lirabao care bond proof.');
  assert(careCycle?.payload?.bondBySpiritId?.jintari >= 3, 'Care cycle ledger entry must preserve Jintari care bond proof.');
  assert(careCycle?.payload?.bondBySpiritId?.aozhen >= 3, 'Care cycle ledger entry must preserve Aozhen care bond proof.');
  assert(careCycle?.payload?.rosterArchiveProof === true, 'Care cycle ledger entry must preserve roster archive proof.');
  assert(careCycle?.payload?.provisionProof === true, 'Care cycle ledger entry must preserve provision satchel proof.');
  assert(careCycle?.payload?.sanctuaryRiteProof === true, 'Care cycle ledger entry must preserve sanctuary rite proof.');
  assert(careCycle?.payload?.raisingProof === true, 'Care cycle ledger entry must preserve raising proof.');
  assert(careCycle?.payload?.noRealValue === true, 'Care cycle ledger entry must remain no-real-value.');
  const temperamentConcord = entriesById.get(`${runId}-temperament-concord`);
  assert(temperamentConcord?.payload?.concordId === 'jade-temperament-concord', 'Temperament concord ledger entry must preserve the Jade Temperament Concord id.');
  assert(Array.isArray(temperamentConcord?.payload?.roster) && temperamentConcord.payload.roster.length === 3, 'Temperament concord ledger entry must preserve full roster proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.lirabao >= 3, 'Temperament concord ledger entry must preserve Lirabao bond proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.jintari >= 3, 'Temperament concord ledger entry must preserve Jintari bond proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.aozhen >= 3, 'Temperament concord ledger entry must preserve Aozhen bond proof.');
  assert(temperamentConcord?.payload?.careCycleProof === true, 'Temperament concord ledger entry must preserve care cycle proof.');
  assert(temperamentConcord?.payload?.traitAttunementProof === true, 'Temperament concord ledger entry must preserve trait attunement proof.');
  assert(temperamentConcord?.payload?.conditionWeaveProof === true, 'Temperament concord ledger entry must preserve condition weave proof.');
  assert(temperamentConcord?.payload?.profileViewed === true, 'Temperament concord ledger entry must preserve profile proof.');
  assert(temperamentConcord?.payload?.guildBuddyProof === true, 'Temperament concord ledger entry must preserve guild buddy proof.');
  assert(temperamentConcord?.payload?.statusMood === 'cozy', 'Temperament concord ledger entry must preserve social status proof.');
  assert(temperamentConcord?.payload?.noRealValue === true, 'Temperament concord ledger entry must remain no-real-value.');
  const fieldAlmanac = entriesById.get(`${runId}-field-almanac`);
  assert(fieldAlmanac?.payload?.almanacId === 'jade-field-almanac', 'Field almanac ledger entry must preserve the Jade Field Almanac id.');
  assert(Array.isArray(fieldAlmanac?.payload?.roster) && fieldAlmanac.payload.roster.length === 3, 'Field almanac ledger entry must preserve full roster proof.');
  assert(Array.isArray(fieldAlmanac?.payload?.discoveredRoutes) && fieldAlmanac.payload.discoveredRoutes.length === 2, 'Field almanac ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(fieldAlmanac?.payload?.fieldAccordProof === true, 'Field almanac ledger entry must preserve field accord proof.');
  assert(fieldAlmanac?.payload?.routePatrolProof === true, 'Field almanac ledger entry must preserve route patrol proof.');
  assert(fieldAlmanac?.payload?.compendiumProof === true, 'Field almanac ledger entry must preserve compendium proof.');
  assert(fieldAlmanac?.payload?.temperamentConcordProof === true, 'Field almanac ledger entry must preserve temperament proof.');
  assert(fieldAlmanac?.payload?.conditionWeaveProof === true, 'Field almanac ledger entry must preserve condition weave proof.');
  assert(fieldAlmanac?.payload?.noRealValue === true, 'Field almanac ledger entry must remain no-real-value.');
  const routeEcology = entriesById.get(`${runId}-route-ecology`);
  assert(routeEcology?.payload?.surveyId === 'jade-route-ecology-survey', 'Route ecology ledger entry must preserve the Jade Route Ecology Survey id.');
  assert(Array.isArray(routeEcology?.payload?.roster) && routeEcology.payload.roster.length === 3, 'Route ecology ledger entry must preserve full roster proof.');
  assert(Array.isArray(routeEcology?.payload?.discoveredRoutes) && routeEcology.payload.discoveredRoutes.length === 2, 'Route ecology ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(routeEcology?.payload?.routeInvitedSpiritIds) && routeEcology.payload.routeInvitedSpiritIds.includes('jintari') && routeEcology.payload.routeInvitedSpiritIds.includes('aozhen'), 'Route ecology ledger entry must preserve both route spirit invitation proofs.');
  assert(routeEcology?.payload?.fieldAlmanacProof === true, 'Route ecology ledger entry must preserve field almanac proof.');
  assert(routeEcology?.payload?.routePatrolProof === true, 'Route ecology ledger entry must preserve route patrol proof.');
  assert(routeEcology?.payload?.routeMasteryProof === true, 'Route ecology ledger entry must preserve route mastery proof.');
  assert(routeEcology?.payload?.conditionWeaveProof === true, 'Route ecology ledger entry must preserve condition weave proof.');
  assert(routeEcology?.payload?.rewardItemId === 'jade-route-ecology-map', 'Route ecology ledger entry must preserve the no-real-value ecology map proof.');
  assert(routeEcology?.payload?.noRealValue === true, 'Route ecology ledger entry must remain no-real-value.');
  const encounterAtlas = entriesById.get(`${runId}-encounter-atlas`);
  assert(encounterAtlas?.payload?.atlasId === 'jade-encounter-atlas', 'Encounter atlas ledger entry must preserve the Jade Encounter Atlas id.');
  assert(Array.isArray(encounterAtlas?.payload?.discoveredRoutes) && encounterAtlas.payload.discoveredRoutes.length === 2, 'Encounter atlas ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(encounterAtlas?.payload?.encounteredSpiritIds) && encounterAtlas.payload.encounteredSpiritIds.length === 3, 'Encounter atlas ledger entry must preserve full encounter species proof.');
  assert(Array.isArray(encounterAtlas?.payload?.capturedSpiritIds) && encounterAtlas.payload.capturedSpiritIds.length === 3, 'Encounter atlas ledger entry must preserve full captured species proof.');
  assert(Array.isArray(encounterAtlas?.payload?.rarityTiers) && encounterAtlas.payload.rarityTiers.includes('common') && encounterAtlas.payload.rarityTiers.includes('uncommon') && encounterAtlas.payload.rarityTiers.includes('rare'), 'Encounter atlas ledger entry must preserve all first-court rarity tiers.');
  assert(encounterAtlas?.payload?.routeEcologyProof === true, 'Encounter atlas ledger entry must preserve route ecology proof.');
  assert(encounterAtlas?.payload?.captureRiteProof === true, 'Encounter atlas ledger entry must preserve capture rite proof.');
  assert(encounterAtlas?.payload?.fieldAlmanacProof === true, 'Encounter atlas ledger entry must preserve field almanac proof.');
  assert(encounterAtlas?.payload?.localPresenceCount === 2, 'Encounter atlas ledger entry must preserve two-tester witness proof.');
  assert(encounterAtlas?.payload?.rewardItemId === 'jade-encounter-atlas', 'Encounter atlas ledger entry must preserve the no-real-value encounter atlas proof.');
  assert(encounterAtlas?.payload?.noRealValue === true, 'Encounter atlas ledger entry must remain no-real-value.');
  const craftWrit = entriesById.get(`${runId}-craft-writ`);
  assert(craftWrit?.payload?.writId === 'jade-court-craft-writ', 'Craft writ ledger entry must preserve the Jade Court Craft Writ id.');
  assert(Array.isArray(craftWrit?.payload?.roster) && craftWrit.payload.roster.length === 3, 'Craft writ ledger entry must preserve full roster proof.');
  assert(Array.isArray(craftWrit?.payload?.recipeIds) && craftWrit.payload.recipeIds.includes('lantern-tea-threading'), 'Craft writ ledger entry must preserve the lantern tea recipe proof.');
  assert(Array.isArray(craftWrit?.payload?.recipeIds) && craftWrit.payload.recipeIds.includes('moonbridge-provision-wrap'), 'Craft writ ledger entry must preserve the Moonbridge provision recipe proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('jade-thread-charm'), 'Craft writ ledger entry must preserve the Jade Thread Charm stock proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('lantern-harmony-tea'), 'Craft writ ledger entry must preserve Lantern Harmony Tea stock proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('jade-mooncake-box'), 'Craft writ ledger entry must preserve Jade Mooncake Box stock proof.');
  assert(craftWrit?.payload?.provisionProof === true, 'Craft writ ledger entry must preserve provision proof.');
  assert(craftWrit?.payload?.routeEcologyProof === true, 'Craft writ ledger entry must preserve route ecology proof.');
  assert(craftWrit?.payload?.fieldAlmanacProof === true, 'Craft writ ledger entry must preserve field almanac proof.');
  assert(craftWrit?.payload?.careCycleProof === true, 'Craft writ ledger entry must preserve care cycle proof.');
  assert(craftWrit?.payload?.temperamentConcordProof === true, 'Craft writ ledger entry must preserve temperament concord proof.');
  assert(craftWrit?.payload?.rewardItemId === 'jade-court-craft-writ', 'Craft writ ledger entry must preserve the no-real-value craft writ proof.');
  assert(craftWrit?.payload?.noRealValue === true, 'Craft writ ledger entry must remain no-real-value.');
  const routeWaystone = entriesById.get(`${runId}-route-waystone`);
  assert(routeWaystone?.payload?.waystoneId === 'jade-cloudbell-waystone', 'Route waystone ledger entry must preserve the Jade Cloudbell Waystone id.');
  assert(Array.isArray(routeWaystone?.payload?.discoveredRoutes) && routeWaystone.payload.discoveredRoutes.includes('moonbridge-bamboo-trail'), 'Route waystone ledger entry must preserve the Moonbridge route.');
  assert(Array.isArray(routeWaystone?.payload?.discoveredRoutes) && routeWaystone.payload.discoveredRoutes.includes('cloudbell-reed-bank'), 'Route waystone ledger entry must preserve the Cloudbell route.');
  assert(Array.isArray(routeWaystone?.payload?.routeInvitedSpiritIds) && routeWaystone.payload.routeInvitedSpiritIds.includes('jintari'), 'Route waystone ledger entry must preserve Jintari route invitation proof.');
  assert(Array.isArray(routeWaystone?.payload?.routeInvitedSpiritIds) && routeWaystone.payload.routeInvitedSpiritIds.includes('aozhen'), 'Route waystone ledger entry must preserve Aozhen route invitation proof.');
  assert(routeWaystone?.payload?.routeMasteryProof === true, 'Route waystone ledger entry must preserve route mastery proof.');
  assert(routeWaystone?.payload?.routePatrolProof === true, 'Route waystone ledger entry must preserve route patrol proof.');
  assert(routeWaystone?.payload?.routeEcologyProof === true, 'Route waystone ledger entry must preserve route ecology proof.');
  assert(routeWaystone?.payload?.craftWritProof === true, 'Route waystone ledger entry must preserve craft writ proof.');
  assert(routeWaystone?.payload?.rewardItemId === 'jade-waystone-travel-seal', 'Route waystone ledger entry must preserve the no-real-value waystone travel seal proof.');
  assert(routeWaystone?.payload?.noRealValue === true, 'Route waystone ledger entry must remain no-real-value.');
  const nurtureRite = entriesById.get(`${runId}-nurture-rite`);
  assert(nurtureRite?.payload?.riteId === 'jade-moonwell-nurture-rite', 'Nurture rite ledger entry must preserve the Jade Moonwell Nurture Rite id.');
  assert(Array.isArray(nurtureRite?.payload?.roster) && nurtureRite.payload.roster.length === 3, 'Nurture rite ledger entry must preserve full roster proof.');
  assert(Array.isArray(nurtureRite?.payload?.caredSpiritIds) && nurtureRite.payload.caredSpiritIds.length === 3, 'Nurture rite ledger entry must preserve full care-cycle proof.');
  assert(nurtureRite?.payload?.careCycleProof === true, 'Nurture rite ledger entry must preserve care cycle proof.');
  assert(nurtureRite?.payload?.growthRiteProof === true, 'Nurture rite ledger entry must preserve growth rite proof.');
  assert(nurtureRite?.payload?.provisionProof === true, 'Nurture rite ledger entry must preserve provision proof.');
  assert(nurtureRite?.payload?.craftWritProof === true, 'Nurture rite ledger entry must preserve craft writ proof.');
  assert(nurtureRite?.payload?.temperamentConcordProof === true, 'Nurture rite ledger entry must preserve temperament concord proof.');
  assert(nurtureRite?.payload?.raisingProof === true, 'Nurture rite ledger entry must preserve raising proof.');
  assert(nurtureRite?.payload?.raisingMilestoneLabel === 'Lacquer Luck Glow', 'Nurture rite ledger entry must preserve the raising milestone label.');
  assert(nurtureRite?.payload?.bond >= 5, 'Nurture rite ledger entry must preserve max bond proof.');
  assert(nurtureRite?.payload?.trainingXp >= 3, 'Nurture rite ledger entry must preserve training XP proof.');
  assert(nurtureRite?.payload?.sparLadderXp >= 5, 'Nurture rite ledger entry must preserve spar ladder XP proof.');
  assert(nurtureRite?.payload?.rewardItemId === 'jade-moonwell-nurture-ribbon', 'Nurture rite ledger entry must preserve the no-real-value nurture ribbon proof.');
  assert(nurtureRite?.payload?.noRealValue === true, 'Nurture rite ledger entry must remain no-real-value.');
  const recoveryTea = entriesById.get(`${runId}-recovery-tea`);
  assert(recoveryTea?.payload?.teaId === 'jade-teahouse-recovery', 'Recovery tea ledger entry must preserve the Jade Teahouse Recovery id.');
  assert(Array.isArray(recoveryTea?.payload?.roster) && recoveryTea.payload.roster.length === 3, 'Recovery tea ledger entry must preserve full-roster proof.');
  assert(Array.isArray(recoveryTea?.payload?.partyIds) && recoveryTea.payload.partyIds.length === 3, 'Recovery tea ledger entry must preserve full-party proof.');
  assert(Array.isArray(recoveryTea?.payload?.caredSpiritIds) && recoveryTea.payload.caredSpiritIds.length === 3, 'Recovery tea ledger entry must preserve full care proof.');
  assert(recoveryTea?.payload?.careCycleProof === true, 'Recovery tea ledger entry must preserve care cycle proof.');
  assert(recoveryTea?.payload?.sanctuaryRiteProof === true, 'Recovery tea ledger entry must preserve sanctuary rite proof.');
  assert(recoveryTea?.payload?.nurtureRiteProof === true, 'Recovery tea ledger entry must preserve nurture rite proof.');
  assert(recoveryTea?.payload?.battleRoundVictory === true, 'Recovery tea ledger entry must preserve no-injury battle victory proof.');
  assert(recoveryTea?.payload?.localPresenceCount === 2, 'Recovery tea ledger entry must preserve two-tester presence proof.');
  assert(recoveryTea?.payload?.rewardItemId === 'jade-teahouse-recovery-cup', 'Recovery tea ledger entry must preserve the no-real-value recovery cup proof.');
  assert(recoveryTea?.payload?.noRealValue === true, 'Recovery tea ledger entry must remain no-real-value.');
  const kinshipAlbum = entriesById.get(`${runId}-kinship-album`);
  assert(kinshipAlbum?.payload?.albumId === 'jade-kinship-album', 'Kinship album ledger entry must preserve the Jade Kinship Album id.');
  assert(Array.isArray(kinshipAlbum?.payload?.roster) && kinshipAlbum.payload.roster.length === 3, 'Kinship album ledger entry must preserve full roster proof.');
  assert(Array.isArray(kinshipAlbum?.payload?.caredSpiritIds) && kinshipAlbum.payload.caredSpiritIds.length === 3, 'Kinship album ledger entry must preserve full care proof.');
  assert(kinshipAlbum?.payload?.activeSpiritId === 'aozhen', 'Kinship album ledger entry must preserve the active spirit proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.lirabao === 5, 'Kinship album ledger entry must preserve Lirabao bond proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.jintari === 5, 'Kinship album ledger entry must preserve Jintari bond proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.aozhen === 5, 'Kinship album ledger entry must preserve Aozhen bond proof.');
  assert(kinshipAlbum?.payload?.localPresenceCount === 2, 'Kinship album ledger entry must preserve two-tester presence proof.');
  assert(kinshipAlbum?.payload?.careCycleProof === true, 'Kinship album ledger entry must preserve care cycle proof.');
  assert(kinshipAlbum?.payload?.nurtureRiteProof === true, 'Kinship album ledger entry must preserve nurture rite proof.');
  assert(kinshipAlbum?.payload?.growthRiteProof === true, 'Kinship album ledger entry must preserve growth rite proof.');
  assert(kinshipAlbum?.payload?.compendiumProof === true, 'Kinship album ledger entry must preserve compendium proof.');
  assert(kinshipAlbum?.payload?.habitatBondProof === true, 'Kinship album ledger entry must preserve habitat bond proof.');
  assert(kinshipAlbum?.payload?.raisingProof === true, 'Kinship album ledger entry must preserve raising proof.');
  assert(kinshipAlbum?.payload?.rewardItemId === 'jade-kinship-album', 'Kinship album ledger entry must preserve the no-real-value album proof.');
  assert(kinshipAlbum?.payload?.noRealValue === true, 'Kinship album ledger entry must remain no-real-value.');
  const nurseryGrove = entriesById.get(`${runId}-nursery-grove`);
  assert(nurseryGrove?.payload?.nurseryId === 'jade-nursery-grove', 'Nursery grove ledger entry must preserve the Jade Nursery Grove id.');
  assert(Array.isArray(nurseryGrove?.payload?.roster) && nurseryGrove.payload.roster.length === 3, 'Nursery grove ledger entry must preserve full roster proof.');
  assert(Array.isArray(nurseryGrove?.payload?.partyIds) && nurseryGrove.payload.partyIds.length === 3, 'Nursery grove ledger entry must preserve full party proof.');
  assert(Array.isArray(nurseryGrove?.payload?.caredSpiritIds) && nurseryGrove.payload.caredSpiritIds.length === 3, 'Nursery grove ledger entry must preserve full care proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.lirabao === 5, 'Nursery grove ledger entry must preserve Lirabao bond proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.jintari === 5, 'Nursery grove ledger entry must preserve Jintari bond proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.aozhen === 5, 'Nursery grove ledger entry must preserve Aozhen bond proof.');
  assert(nurseryGrove?.payload?.localPresenceCount === 2, 'Nursery grove ledger entry must preserve two-tester presence proof.');
  assert(nurseryGrove?.payload?.careCycleProof === true, 'Nursery grove ledger entry must preserve care cycle proof.');
  assert(nurseryGrove?.payload?.nurtureRiteProof === true, 'Nursery grove ledger entry must preserve nurture rite proof.');
  assert(nurseryGrove?.payload?.recoveryTeaProof === true, 'Nursery grove ledger entry must preserve recovery tea proof.');
  assert(nurseryGrove?.payload?.kinshipAlbumProof === true, 'Nursery grove ledger entry must preserve kinship album proof.');
  assert(nurseryGrove?.payload?.growthRiteProof === true, 'Nursery grove ledger entry must preserve growth rite proof.');
  assert(nurseryGrove?.payload?.raisingProof === true, 'Nursery grove ledger entry must preserve raising proof.');
  assert(nurseryGrove?.payload?.trainingXp >= 3, 'Nursery grove ledger entry must preserve training XP proof.');
  assert(nurseryGrove?.payload?.sparLadderXp >= 5, 'Nursery grove ledger entry must preserve spar ladder XP proof.');
  assert(nurseryGrove?.payload?.rewardItemId === 'jade-nursery-sprout', 'Nursery grove ledger entry must preserve the no-real-value nursery sprout proof.');
  assert(nurseryGrove?.payload?.noRealValue === true, 'Nursery grove ledger entry must remain no-real-value.');
  const captureRite = entriesById.get(`${runId}-capture-rite`);
  assert(captureRite?.payload?.riteId === 'jade-court-capture-rite', 'Capture rite ledger entry must preserve the Jade Capture Rite id.');
  assert(Array.isArray(captureRite?.payload?.roster) && captureRite.payload.roster.length === 3, 'Capture rite ledger entry must preserve full roster proof.');
  assert(Array.isArray(captureRite?.payload?.capturedSpiritIds) && captureRite.payload.capturedSpiritIds.length === 3, 'Capture rite ledger entry must preserve all captured spirit ids.');
  assert(Array.isArray(captureRite?.payload?.routeInvitedSpiritIds) && captureRite.payload.routeInvitedSpiritIds.includes('jintari') && captureRite.payload.routeInvitedSpiritIds.includes('aozhen'), 'Capture rite ledger entry must preserve both route invitation spirits.');
  assert(Array.isArray(captureRite?.payload?.lureItemIds) && captureRite.payload.lureItemIds.includes('lantern-harmony-tea'), 'Capture rite ledger entry must preserve Lantern Harmony Tea lure proof.');
  assert(Array.isArray(captureRite?.payload?.lureItemIds) && captureRite.payload.lureItemIds.includes('jade-thread-charm'), 'Capture rite ledger entry must preserve Jade Thread Charm lure proof.');
  assert(captureRite?.payload?.journalDiscoveredCount === 3, 'Capture rite ledger entry must preserve full journal proof.');
  assert(captureRite?.payload?.localPresenceCount === 2, 'Capture rite ledger entry must preserve two-tester presence proof.');
  assert(captureRite?.payload?.captureProof === true, 'Capture rite ledger entry must preserve basic capture proof.');
  assert(captureRite?.payload?.routeInviteProof === true, 'Capture rite ledger entry must preserve route invite proof.');
  assert(captureRite?.payload?.fieldAccordProof === true, 'Capture rite ledger entry must preserve field accord proof.');
  assert(captureRite?.payload?.battleRoundVictory === true, 'Capture rite ledger entry must preserve no-injury battle victory proof.');
  assert(captureRite?.payload?.rewardItemId === 'jade-capture-rite-tally', 'Capture rite ledger entry must preserve the no-real-value capture rite tally proof.');
  assert(captureRite?.payload?.noRealValue === true, 'Capture rite ledger entry must remain no-real-value.');
  const tournament = entriesById.get(`${runId}-tournament-bracket`);
  assert(tournament?.payload?.bracketId === 'jade-banner-tournament', 'Tournament ledger entry must preserve the Jade Banner Tournament id.');
  assert(Array.isArray(tournament?.payload?.partyIds) && tournament.payload.partyIds.length === 3, 'Tournament ledger entry must preserve full-party proof.');
  assert(tournament?.payload?.mentorChallengeProof === true, 'Tournament ledger entry must preserve mentor challenge proof.');
  assert(tournament?.payload?.mentorChallengeId === 'silk-banner-mentor-drill', 'Tournament ledger entry must preserve the mentor challenge id.');
  assert(tournament?.payload?.teamSparMatchProof === true, 'Tournament ledger entry must preserve team spar match proof.');
  assert(tournament?.payload?.teamSparMatchId === 'jade-mirror-team-match', 'Tournament ledger entry must preserve the team spar match id.');
  assert(tournament?.payload?.harmonyTrialProof === true, 'Tournament ledger entry must preserve harmony trial proof.');
  assert(tournament?.payload?.conditionWeaveProof === true, 'Tournament ledger entry must preserve condition weave proof.');
  assert(tournament?.payload?.battleRoundVictory === true, 'Tournament ledger entry must preserve no-injury battle victory proof.');
  assert(tournament?.payload?.localPresenceCount === 2, 'Tournament ledger entry must preserve two-tester presence proof.');
  assert(tournament?.payload?.routePatrolProof === true, 'Tournament ledger entry must preserve route patrol proof.');
  assert(tournament?.payload?.nurtureRiteProof === true, 'Tournament ledger entry must preserve nurture rite proof.');
  assert(tournament?.payload?.guildRankProof === true, 'Tournament ledger entry must preserve guild rank proof.');
  assert(tournament?.payload?.rewardItemId === 'jade-banner-tournament-pennant', 'Tournament ledger entry must preserve the no-real-value tournament pennant proof.');
  assert(tournament?.payload?.noRealValue === true, 'Tournament ledger entry must remain no-real-value.');
  const rivalCircle = entriesById.get(`${runId}-rival-circle`);
  assert(rivalCircle?.payload?.circleId === 'jade-rival-circle', 'Rival circle ledger entry must preserve the Jade Rival Circle id.');
  assert(Array.isArray(rivalCircle?.payload?.partyIds) && rivalCircle.payload.partyIds.length === 3, 'Rival circle ledger entry must preserve full-party proof.');
  assert(rivalCircle?.payload?.tournamentProof === true, 'Rival circle ledger entry must preserve tournament proof.');
  assert(rivalCircle?.payload?.tournamentId === 'jade-banner-tournament', 'Rival circle ledger entry must preserve tournament id.');
  assert(rivalCircle?.payload?.mentorChallengeProof === true, 'Rival circle ledger entry must preserve mentor proof.');
  assert(rivalCircle?.payload?.teamSparMatchProof === true, 'Rival circle ledger entry must preserve team match proof.');
  assert(rivalCircle?.payload?.conditionWeaveProof === true, 'Rival circle ledger entry must preserve condition weave proof.');
  assert(rivalCircle?.payload?.conditionWeaveId === 'jade-mirror-condition-weave', 'Rival circle ledger entry must preserve condition weave id.');
  assert(rivalCircle?.payload?.battleRoundVictory === true, 'Rival circle ledger entry must preserve no-injury battle victory proof.');
  assert(rivalCircle?.payload?.techniqueLoadoutProof === true, 'Rival circle ledger entry must preserve technique loadout proof.');
  assert(rivalCircle?.payload?.traitAttunementProof === true, 'Rival circle ledger entry must preserve trait proof.');
  assert(rivalCircle?.payload?.guildRankProof === true, 'Rival circle ledger entry must preserve rank proof.');
  assert(rivalCircle?.payload?.growthRiteProof === true, 'Rival circle ledger entry must preserve growth proof.');
  assert(rivalCircle?.payload?.localPresenceCount === 2, 'Rival circle ledger entry must preserve two-tester presence proof.');
  assert(rivalCircle?.payload?.rewardItemId === 'jade-rival-circle-mark', 'Rival circle ledger entry must preserve the no-real-value rival mark proof.');
  assert(rivalCircle?.payload?.noRealValue === true, 'Rival circle ledger entry must remain no-real-value.');
  const storyChapter = entriesById.get(`${runId}-story-chapter`);
  assert(storyChapter?.payload?.chapterId === 'jade-scroll-story-chapter', 'Story chapter ledger entry must preserve the Jade Scroll Story Chapter id.');
  assert(Array.isArray(storyChapter?.payload?.roster) && storyChapter.payload.roster.length === 3, 'Story chapter ledger entry must preserve full roster proof.');
  assert(Array.isArray(storyChapter?.payload?.partyIds) && storyChapter.payload.partyIds.length === 3, 'Story chapter ledger entry must preserve full-party proof.');
  assert(Array.isArray(storyChapter?.payload?.completedQuestIds) && storyChapter.payload.completedQuestIds.length === 3, 'Story chapter ledger entry must preserve full quest proof.');
  assert(Array.isArray(storyChapter?.payload?.discoveredRoutes) && storyChapter.payload.discoveredRoutes.includes('cloudbell-reed-bank'), 'Story chapter ledger entry must preserve Cloudbell route proof.');
  assert(storyChapter?.payload?.routeEcologyProof === true, 'Story chapter ledger entry must preserve route ecology proof.');
  assert(storyChapter?.payload?.routeWaystoneProof === true, 'Story chapter ledger entry must preserve route waystone proof.');
  assert(storyChapter?.payload?.nurtureRiteProof === true, 'Story chapter ledger entry must preserve nurture rite proof.');
  assert(storyChapter?.payload?.tournamentProof === true, 'Story chapter ledger entry must preserve tournament proof.');
  assert(storyChapter?.payload?.commissionProof === true, 'Story chapter ledger entry must preserve commission proof.');
  assert(storyChapter?.payload?.rallyProof === true, 'Story chapter ledger entry must preserve social rally proof.');
  assert(storyChapter?.payload?.rewardItemId === 'jade-scroll-story-chapter', 'Story chapter ledger entry must preserve the no-real-value story scroll proof.');
  assert(storyChapter?.payload?.noRealValue === true, 'Story chapter ledger entry must remain no-real-value.');
  const insigniaCase = entriesById.get(`${runId}-insignia-case`);
  assert(insigniaCase?.payload?.caseId === 'jade-insignia-case', 'Insignia case ledger entry must preserve the Jade Insignia Case id.');
  assert(Array.isArray(insigniaCase?.payload?.roster) && insigniaCase.payload.roster.length === 3, 'Insignia case ledger entry must preserve full roster proof.');
  assert(Array.isArray(insigniaCase?.payload?.partyIds) && insigniaCase.payload.partyIds.length === 3, 'Insignia case ledger entry must preserve full-party proof.');
  assert(insigniaCase?.payload?.routeMasteryProof === true, 'Insignia case ledger entry must preserve route mastery proof.');
  assert(insigniaCase?.payload?.routePatrolProof === true, 'Insignia case ledger entry must preserve route patrol proof.');
  assert(insigniaCase?.payload?.guildRankProof === true, 'Insignia case ledger entry must preserve guild rank proof.');
  assert(insigniaCase?.payload?.growthRiteProof === true, 'Insignia case ledger entry must preserve growth rite proof.');
  assert(insigniaCase?.payload?.tournamentProof === true, 'Insignia case ledger entry must preserve tournament proof.');
  assert(insigniaCase?.payload?.storyChapterProof === true, 'Insignia case ledger entry must preserve story chapter proof.');
  assert(insigniaCase?.payload?.harmonyFormProof === true, 'Insignia case ledger entry must preserve harmony proof.');
  assert(insigniaCase?.payload?.rewardItemId === 'jade-insignia-case', 'Insignia case ledger entry must preserve the no-real-value insignia case proof.');
  assert(insigniaCase?.payload?.noRealValue === true, 'Insignia case ledger entry must remain no-real-value.');
  const chronicle = entriesById.get(`${runId}-wayfarer-chronicle`);
  assert(chronicle?.payload?.chronicleId === 'jade-wayfarer-chronicle', 'Wayfarer chronicle ledger entry must preserve the Jade Wayfarer Chronicle id.');
  assert(chronicle?.payload?.localPresenceCount === 2, 'Wayfarer chronicle ledger entry must preserve two-tester presence proof.');
  assert(chronicle?.payload?.captureRiteProof === true, 'Wayfarer chronicle ledger entry must preserve capture rite proof.');
  assert(chronicle?.payload?.encounterAtlasProof === true, 'Wayfarer chronicle ledger entry must preserve encounter atlas proof.');
  assert(chronicle?.payload?.routePatrolProof === true, 'Wayfarer chronicle ledger entry must preserve route patrol proof.');
  assert(chronicle?.payload?.routeEcologyProof === true, 'Wayfarer chronicle ledger entry must preserve route ecology proof.');
  assert(chronicle?.payload?.craftWritProof === true, 'Wayfarer chronicle ledger entry must preserve craft writ proof.');
  assert(chronicle?.payload?.routeWaystoneProof === true, 'Wayfarer chronicle ledger entry must preserve route waystone proof.');
  assert(chronicle?.payload?.nurtureRiteProof === true, 'Wayfarer chronicle ledger entry must preserve nurture rite proof.');
  assert(chronicle?.payload?.kinshipAlbumProof === true, 'Wayfarer chronicle ledger entry must preserve kinship album proof.');
  assert(chronicle?.payload?.nurseryGroveProof === true, 'Wayfarer chronicle ledger entry must preserve nursery grove proof.');
  assert(chronicle?.payload?.tournamentProof === true, 'Wayfarer chronicle ledger entry must preserve tournament proof.');
  assert(chronicle?.payload?.rallyProof === true, 'Wayfarer chronicle ledger entry must preserve social rally proof.');
  assert(chronicle?.payload?.storyChapterProof === true, 'Wayfarer chronicle ledger entry must preserve story chapter proof.');
  assert(chronicle?.payload?.insigniaCaseProof === true, 'Wayfarer chronicle ledger entry must preserve insignia case proof.');
  assert(chronicle?.payload?.canaryPreviewProof === true, 'Wayfarer chronicle ledger entry must preserve Canary preview proof.');
  assert(chronicle?.payload?.noRealValue === true, 'Wayfarer chronicle ledger entry must remain no-real-value.');
  const ascension = entriesById.get(`${runId}-ascension-trial`);
  assert(ascension?.payload?.trialId === 'jade-court-ascension-trial', 'Ascension trial ledger entry must preserve the Jade Court Ascension Trial id.');
  assert(ascension?.payload?.localPresenceCount === 2, 'Ascension trial ledger entry must preserve two-tester presence proof.');
  assert(ascension?.payload?.wayfarerChronicleProof === true, 'Ascension trial ledger entry must preserve wayfarer chronicle proof.');
  assert(ascension?.payload?.kinshipAlbumProof === true, 'Ascension trial ledger entry must preserve kinship album proof.');
  assert(ascension?.payload?.nurseryGroveProof === true, 'Ascension trial ledger entry must preserve nursery grove proof.');
  assert(ascension?.payload?.storyChapterProof === true, 'Ascension trial ledger entry must preserve story chapter proof.');
  assert(ascension?.payload?.insigniaCaseProof === true, 'Ascension trial ledger entry must preserve insignia case proof.');
  assert(ascension?.payload?.mentorChallengeProof === true, 'Ascension trial ledger entry must preserve mentor challenge proof.');
  assert(ascension?.payload?.tournamentProof === true, 'Ascension trial ledger entry must preserve tournament proof.');
  assert(ascension?.payload?.rivalCircleProof === true, 'Ascension trial ledger entry must preserve rival circle proof.');
  assert(ascension?.payload?.battleRoundVictory === true, 'Ascension trial ledger entry must preserve no-injury battle victory proof.');
  assert(ascension?.payload?.canaryPreviewProof === true, 'Ascension trial ledger entry must preserve Canary preview proof.');
  assert(ascension?.payload?.noRealValue === true, 'Ascension trial ledger entry must remain no-real-value.');
}

async function getOk(path, name) {
  const response = await request(path, { method: 'GET' }, name);
  assert(response.status >= 200 && response.status < 300, `${name} endpoint failed with ${response.status}.`);
  return response;
}

async function getJson(path, name) {
  const response = await getOk(path, name);
  assert(response.body && typeof response.body === 'object', `${name} endpoint did not return JSON.`);
  return response;
}

async function postJson(path, body, name) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, name);
}

async function request(path, init, name) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(requestTimeoutMs)
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${name} request to ${path} failed: ${reason}`);
  }

  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  const result = { name, path, status: response.status, body };
  report.endpoints.push({ name, path, status: response.status });
  return result;
}

async function readLedgerEntries() {
  let text = '';
  try {
    text = await readFile(ledgerPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Local alpha ledger was not created at ${ledgerPath}. Is the server using a different RPG_SAVE_DIR?`);
    }
    throw error;
  }

  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => typeof entry.requestId === 'string' && entry.requestId.startsWith(runId));
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function resolveFromRoot(value) {
  return isAbsolute(value) ? value : resolve(root, value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
