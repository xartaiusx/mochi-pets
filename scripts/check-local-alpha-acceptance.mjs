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
  assert(manifest.body.gameplay?.spiritAttunement === true, 'Manifest must expose Mochi Spirit attunement.');
  assert(manifest.body.gameplay?.routeInvitations === true, 'Manifest must expose Mochi Spirit route invitations.');
  assert(manifest.body.gameplay?.routeMastery === true, 'Manifest must expose Mochi Spirit route mastery.');
  assert(manifest.body.gameplay?.habitatBonds === true, 'Manifest must expose Mochi Spirit habitat bonds.');
  assert(manifest.body.gameplay?.spiritResearch === true, 'Manifest must expose Mochi Spirit research folios.');
  assert(manifest.body.gameplay?.partyFormation === true, 'Manifest must expose Mochi Spirit party formation.');
  assert(manifest.body.gameplay?.partyHarmony === true, 'Manifest must expose Mochi Spirit party harmony.');
  assert(manifest.body.gameplay?.harmonyTrials === true, 'Manifest must expose Mochi Spirit harmony trials.');
  assert(manifest.body.gameplay?.teamSparMatches === true, 'Manifest must expose Mochi Spirit team spar matches.');
  assert(manifest.body.gameplay?.mentorChallenges === true, 'Manifest must expose Mochi Spirit mentor challenges.');
  assert(manifest.body.gameplay?.battleRoundTranscripts === true, 'Manifest must expose Mochi Spirit battle round transcripts.');
  assert(manifest.body.gameplay?.fieldExpeditions === true, 'Manifest must expose Mochi Spirit field expeditions.');
  assert(manifest.body.gameplay?.sparringLadder === true, 'Manifest must expose Mochi Spirit sparring ladder.');
  assert(manifest.body.gameplay?.spiritJournal === true, 'Manifest must expose Mochi Spirit journal.');
  assert(manifest.body.gameplay?.techniqueMastery === true, 'Manifest must expose Mochi Spirit technique mastery.');
  assert(manifest.body.gameplay?.battleTactics === true, 'Manifest must expose Mochi Spirit battle tactics.');
  assert(manifest.body.gameplay?.guildRankTrials === true, 'Manifest must expose Mochirii guild rank trials.');
  assert(manifest.body.gameplay?.spiritGrowthRites === true, 'Manifest must expose Mochi Spirit growth rites.');
  assert(manifest.body.gameplay?.affinityTrials === true, 'Manifest must expose Mochi Spirit affinity trials.');
  assert(manifest.body.gameplay?.copiedUpstreamContent === false, 'Manifest must reject copied upstream content.');

  const alphaStatus = await getJson('/integration/alpha/status', 'alpha status');
  assert(alphaStatus.body.alpha?.stopPoint === 'alpha-rc-ready', 'Alpha status must expose the RC stop point.');
  assert(alphaStatus.body.market?.fixedPrice === true, 'Alpha status must keep fixed-price enabled.');
  assert(alphaStatus.body.market?.auctions === false, 'Alpha status must keep auctions disabled.');
  assert(alphaStatus.body.gameplay?.spiritCapture === true, 'Alpha status must expose Mochi Spirit capture.');
  assert(alphaStatus.body.gameplay?.spiritAttunement === true, 'Alpha status must expose Mochi Spirit attunement.');
  assert(alphaStatus.body.gameplay?.routeInvitations === true, 'Alpha status must expose Mochi Spirit route invitations.');
  assert(alphaStatus.body.gameplay?.routeMastery === true, 'Alpha status must expose Mochi Spirit route mastery.');
  assert(alphaStatus.body.gameplay?.habitatBonds === true, 'Alpha status must expose Mochi Spirit habitat bonds.');
  assert(alphaStatus.body.gameplay?.spiritResearch === true, 'Alpha status must expose Mochi Spirit research folios.');
  assert(alphaStatus.body.gameplay?.partyFormation === true, 'Alpha status must expose Mochi Spirit party formation.');
  assert(alphaStatus.body.gameplay?.partyHarmony === true, 'Alpha status must expose Mochi Spirit party harmony.');
  assert(alphaStatus.body.gameplay?.harmonyTrials === true, 'Alpha status must expose Mochi Spirit harmony trials.');
  assert(alphaStatus.body.gameplay?.teamSparMatches === true, 'Alpha status must expose Mochi Spirit team spar matches.');
  assert(alphaStatus.body.gameplay?.mentorChallenges === true, 'Alpha status must expose Mochi Spirit mentor challenges.');
  assert(alphaStatus.body.gameplay?.battleRoundTranscripts === true, 'Alpha status must expose Mochi Spirit battle round transcripts.');
  assert(alphaStatus.body.gameplay?.fieldExpeditions === true, 'Alpha status must expose Mochi Spirit field expeditions.');
  assert(alphaStatus.body.gameplay?.sparringLadder === true, 'Alpha status must expose Mochi Spirit sparring ladder.');
  assert(alphaStatus.body.gameplay?.spiritJournal === true, 'Alpha status must expose Mochi Spirit journal.');
  assert(alphaStatus.body.gameplay?.techniqueMastery === true, 'Alpha status must expose Mochi Spirit technique mastery.');
  assert(alphaStatus.body.gameplay?.battleTactics === true, 'Alpha status must expose Mochi Spirit battle tactics.');
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
      payload: { routeId: 'moonbridge-bamboo-trail', offeredItemId: 'jade-thread-charm', harmonyScore: 3, roster: ['lirabao'], discoveredRoutes: ['moonbridge-bamboo-trail'] }
    },
    {
      requestId: `${runId}-cloudbell-expedition`,
      type: 'world.expedition',
      payload: { routeId: 'cloudbell-reed-bank', roster: ['lirabao', 'jintari'], activeSpiritId: 'jintari', harmonyScore: 4, discoveredRoutes: ['moonbridge-bamboo-trail'] }
    },
    {
      requestId: `${runId}-cloudbell-route-invite`,
      type: 'spirit.route_invite',
      payload: { routeId: 'cloudbell-reed-bank', offeredItemId: 'lantern-harmony-tea', harmonyScore: 4, roster: ['lirabao', 'jintari'], discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'] }
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
      requestId: `${runId}-technique`,
      type: 'spirit.technique',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', currentMasteryXp: 0, bond: 3, noInjury: true }
    },
    {
      requestId: `${runId}-tactic`,
      type: 'battle.tactic_scroll',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', tacticId: 'lantern-anchor', currentMasteryXp: 7, bond: 3, noInjury: true }
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
      requestId: `${runId}-canary`,
      type: 'chain.withdraw_request',
      payload: { assetId: 'lirabao-canary-certificate', chainNetwork: 'CANARY', noRealValue: true }
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
  const response = await fetch(`${baseUrl}${path}`, init);
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
