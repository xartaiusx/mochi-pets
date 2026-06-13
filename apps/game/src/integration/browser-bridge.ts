import { ALPHA_FEATURES, type AlphaActionType } from './alpha-contract';
import {
  GUILD_RANK_TRIALS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_TEAM_SPAR_MATCHES,
  growthStageFromBond,
  resolveMochiSpiritQuestProgress,
  resolveSpiritRouteMastery,
  techniqueMasteryLevelFromXp,
  selectMochiSpiritQuest,
  selectSpiritRaisingNeed,
  resolveSpiritAttunement,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleRound,
  resolveSpiritBattleTactic,
  resolveSpiritCapture,
  resolveSpiritExpedition,
  resolveGuildRankTrial,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritJournal,
  resolveSpiritParty,
  resolveSpiritRaisingAction,
  resolveSpiritResearchFolio,
  resolveSpiritRouteInvitation,
  resolveSpiritSparLadder,
  resolveSpiritTeamSparMatch,
  resolveSpiritTechniqueMastery,
  resolveSpiritTrainingBattle
} from '../alpha/content';
import { BRIDGE_EVENTS, type AuthPayload, type AuthState, type BridgeMessage, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';

const TOKEN_KEY = 'mochiSocial.accessToken';
const EXPIRES_KEY = 'mochiSocial.accessTokenExpiresAt';
const ALPHA_STATE_KEY = 'mochiSocial.alphaState';
const PRESENCE_CHANNEL = 'mochi-social-presence';
const MOVEMENT_CHANNEL = 'mochi-social-movement';
const PRESENCE_TAB_KEY = 'mochiSocial.presenceTabId';
const PRESENCE_STORAGE_PREFIX = 'mochiSocial.presence.';
const MOVEMENT_STORAGE_PREFIX = 'mochiSocial.movement.';
const PRESENCE_TTL_MS = 4000;

interface AlphaHudState {
  spiritId?: string;
  attunedSpiritIds: string[];
  lastInspectedSpiritId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  guildRankProof: boolean;
  guildRankId?: string;
  guildRankTitle: string;
  guildRankScore: number;
  guildRankSealClaimed: boolean;
  growthRiteProof: boolean;
  growthRiteId?: string;
  growthForm: string;
  growthSigilClaimed: boolean;
  statusMood: string;
  bond: number;
  growth: string;
  captureProof: boolean;
  lastCaptureSpiritId?: string;
  journalProof: boolean;
  journalDiscoveredCount: number;
  journalTotal: number;
  lastJournalSpiritId?: string;
  expeditionProof: boolean;
  expeditionCount: number;
  discoveredRouteIds: string[];
  lastExpeditionRouteId?: string;
  lastExpeditionEncounterId?: string;
  routeRibbonClaimed: boolean;
  routeInviteProof: boolean;
  lastRouteInviteRouteId?: string;
  lastRouteInviteSpiritId?: string;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  routeMasteryTitle: string;
  routeMasteryScore: number;
  routeMasteryKnotClaimed: boolean;
  habitatBondProof: boolean;
  habitatBondId?: string;
  habitatBondName: string;
  habitatBondScore: number;
  habitatTasselClaimed: boolean;
  researchProof: boolean;
  researchFolioId?: string;
  researchFolioName: string;
  researchScore: number;
  researchFolioClaimed: boolean;
  techniqueProof: boolean;
  techniqueMoveId?: string;
  techniqueMasteryXp: number;
  techniqueMasteryLevel: string;
  techniqueFocusScore: number;
  tacticProof: boolean;
  lastTacticId?: string;
  lastTacticSpiritId?: string;
  lastTacticMoveId?: string;
  tacticStance?: string;
  tacticFocusScore: number;
  tacticMasteryXp: number;
  affinityProof: boolean;
  affinityTrialWins: number;
  lastAffinityTrialId?: string;
  affinityAdvantage: boolean;
  affinityFocusScore: number;
  affinityTrialScore: number;
  activePartyId?: string;
  partyIds: string[];
  supportSpiritIds: string[];
  harmonyFormProof: boolean;
  harmonyFormId?: string;
  harmonyFormName: string;
  harmonyFormScore: number;
  harmonySashClaimed: boolean;
  harmonyTrialProof: boolean;
  harmonyTrialId?: string;
  harmonyTrialName: string;
  harmonyTrialScore: number;
  concordTallyClaimed: boolean;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  teamSparMatchName: string;
  teamSparMatchScore: number;
  teamMatchRibbonClaimed: boolean;
  sparLadderXp: number;
  sparLadderWins: number;
  lastSparOpponentId?: string;
  battleRoundProof: boolean;
  battleRoundId?: string;
  battleRoundOpponentName: string;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  battleRoundVictory: boolean;
  battleRoundTranscript: string[];
  trainingXp: number;
  trainingVictories: number;
  raisingProof: boolean;
  raisingCareStreak: number;
  lastRaisingNeedId?: string;
  nextRaisingNeedId?: string;
  activeQuestId?: string;
  completedQuestSteps: string[];
  completedQuestIds: string[];
  questStepsById: Record<string, string[]>;
  questChainProof: boolean;
  charmListed: boolean;
  tradeProof: boolean;
  canaryRequested: boolean;
  chat: string[];
}

export interface AlphaWorldStatePatch {
  expedition?: {
    count: number;
    discoveredRoutes: string[];
    encounterSpiritId: string;
    message?: string;
    proof: boolean;
    recommendedItemId: string;
    rewardItemId: string;
    routeId: string;
    routeName: string;
  };
  routeInvite?: {
    alreadyRostered: boolean;
    message?: string;
    proof: boolean;
    routeId: string;
    routeName: string;
    roster: string[];
    spiritId: string;
  };
  routeMastery?: {
    masteryId: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  affinity?: {
    affinityAdvantage: boolean;
    focusScore: number;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
    trialId: string;
    trialName: string;
    trialScore: number;
    victory: boolean;
    wins: number;
  };
  canaryRequested?: boolean;
  charmListed?: boolean;
  capture?: {
    message?: string;
    roster: string[];
    spiritId: string;
  };
  journal?: {
    activeSpiritId?: string;
    discoveredCount: number;
    message?: string;
    proof: boolean;
    totalCount: number;
  };
  habitatBond?: {
    activeSpiritId?: string;
    bondId: string;
    bondName: string;
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  research?: {
    activeSpiritId?: string;
    discoveredRoutes: string[];
    folioId: string;
    folioName: string;
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  technique?: {
    focusScore: number;
    masteryLevel: string;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
  };
  tactic?: {
    focusScore: number;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
    stance: string;
    tacticId: string;
    tacticName: string;
  };
  rank?: {
    message?: string;
    proof: boolean;
    rankTitle: string;
    rewardItemId: string;
    score: number;
    trialId: string;
    trialTitle: string;
  };
  growthRite?: {
    formTitle: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    riteId: string;
    riteName: string;
    spiritId: string;
  };
  party?: {
    activeSpiritId?: string;
    message?: string;
    partyIds: string[];
    supportIds: string[];
  };
  harmonyForm?: {
    formId: string;
    message?: string;
    name: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  harmonyTrial?: {
    message?: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
    trialId: string;
    trialName: string;
  };
  teamSparMatch?: {
    matchId: string;
    matchName: string;
    message?: string;
    opponentName: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  quest?: {
    chainComplete?: boolean;
    completedQuestIds?: string[];
    completedSteps: string[];
    id: string;
    message?: string;
    nextQuestId?: string;
  };
  raising?: {
    careStreak?: number;
    message?: string;
    needId: string;
    nextNeedId?: string;
    proof: boolean;
  };
  sealClaimed?: boolean;
  spar?: {
    message?: string;
    opponentId: string;
    victory: boolean;
    wins: number;
    xp: number;
  };
  battleRound?: {
    focusScore: number;
    message?: string;
    noInjury: true;
    opponentName: string;
    opponentScore: number;
    participants: string[];
    roundId: string;
    victory: boolean;
  };
  training?: {
    message?: string;
    victories: number;
    xp: number;
  };
  tradeProof?: boolean;
}

type AlphaLocalActionType = 'spirit.inspect' | 'profile.view' | 'guild.buddy' | 'status.set';

interface PresenceMessage {
  type: 'MOCHI_SOCIAL_LOCAL_PRESENCE';
  tabId: string;
  at: number;
}

interface MovementMessage {
  type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT';
  tabId: string;
  at: number;
  key: string;
}

interface AlphaActionResponse {
  chainRuntime?: {
    mode?: string;
    message?: string;
  };
  message?: string;
}

function defaultAlphaState(): AlphaHudState {
  return {
    attunedSpiritIds: [],
    profileViewed: false,
    guildBuddyProof: false,
    guildRankProof: false,
    guildRankTitle: 'Visitor',
    guildRankScore: 0,
    guildRankSealClaimed: false,
    growthRiteProof: false,
    growthForm: 'Unawakened',
    growthSigilClaimed: false,
    statusMood: 'exploring',
    bond: 0,
    growth: 'seed',
    captureProof: false,
    journalProof: false,
    journalDiscoveredCount: 0,
    journalTotal: MOCHI_SPIRITS.length,
    expeditionProof: false,
    expeditionCount: 0,
    discoveredRouteIds: [],
    routeRibbonClaimed: false,
    routeInviteProof: false,
    routeMasteryProof: false,
    routeMasteryTitle: 'Unmastered',
    routeMasteryScore: 0,
    routeMasteryKnotClaimed: false,
    habitatBondProof: false,
    habitatBondName: 'Unbonded',
    habitatBondScore: 0,
    habitatTasselClaimed: false,
    researchProof: false,
    researchFolioName: 'Unresearched',
    researchScore: 0,
    researchFolioClaimed: false,
    techniqueProof: false,
    techniqueMasteryXp: 0,
    techniqueMasteryLevel: 'novice',
    techniqueFocusScore: 0,
    tacticProof: false,
    tacticFocusScore: 0,
    tacticMasteryXp: 0,
    affinityProof: false,
    affinityTrialWins: 0,
    affinityAdvantage: false,
    affinityFocusScore: 0,
    affinityTrialScore: 0,
    partyIds: [],
    supportSpiritIds: [],
    harmonyFormProof: false,
    harmonyFormName: 'Unformed',
    harmonyFormScore: 0,
    harmonySashClaimed: false,
    harmonyTrialProof: false,
    harmonyTrialName: 'Uncleared',
    harmonyTrialScore: 0,
    concordTallyClaimed: false,
    teamSparMatchProof: false,
    teamSparMatchName: 'Unmatched',
    teamSparMatchScore: 0,
    teamMatchRibbonClaimed: false,
    sparLadderXp: 0,
    sparLadderWins: 0,
    battleRoundProof: false,
    battleRoundOpponentName: 'Unrecorded',
    battleRoundFocusScore: 0,
    battleRoundOpponentScore: 0,
    battleRoundVictory: false,
    battleRoundTranscript: [],
    trainingXp: 0,
    trainingVictories: 0,
    raisingProof: false,
    raisingCareStreak: 0,
    completedQuestSteps: [],
    completedQuestIds: [],
    questStepsById: {},
    questChainProof: false,
    charmListed: false,
    tradeProof: false,
    canaryRequested: false,
    chat: []
  };
}

function postToParent(type: BridgeMessage['type'], payload?: unknown) {
  if (window.parent === window) return;

  window.parent.postMessage(
    {
      type,
      protocolVersion: MOCHI_SOCIAL_PROTOCOL_VERSION,
      payload
    } satisfies BridgeMessage,
    '*'
  );
}

function updateHudAuthState(state: AuthState) {
  document.documentElement.dataset.authState = state;
  window.dispatchEvent(new CustomEvent('mochi-social-auth-state', { detail: { state } }));
}

function setAuth(payload: AuthPayload) {
  localStorage.setItem(TOKEN_KEY, payload.accessToken);
  if (payload.expiresAt) {
    localStorage.setItem(EXPIRES_KEY, String(payload.expiresAt));
  }
  updateHudAuthState('linked');
  postToParent(BRIDGE_EVENTS.authState, { state: 'linked' });
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  updateHudAuthState('guest');
  postToParent(BRIDGE_EVENTS.authState, { state: 'guest' });
}

function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<BridgeMessage>;
  return candidate.protocolVersion === MOCHI_SOCIAL_PROTOCOL_VERSION && typeof candidate.type === 'string';
}

export function installMochiSocialBridge() {
  createHud();
  installLocalTabPresence();
  installLocalMovementPulse();
  void loadAlphaStatus();

  window.addEventListener('message', (event) => {
    if (!isBridgeMessage(event.data)) return;

    if (event.data.type === BRIDGE_EVENTS.auth) {
      const payload = event.data.payload as Partial<AuthPayload> | undefined;
      if (!payload?.accessToken) {
        updateHudAuthState('error');
        postToParent(BRIDGE_EVENTS.error, { message: 'Missing Supabase access token.' });
        return;
      }
      setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });
      return;
    }

    if (event.data.type === BRIDGE_EVENTS.signOut) {
      clearAuth();
    }
  });

  const existingToken = localStorage.getItem(TOKEN_KEY);
  updateHudAuthState(existingToken ? 'linked' : 'guest');
  postToParent(BRIDGE_EVENTS.ready, {
    name: 'Mochi Social',
    protocolVersion: MOCHI_SOCIAL_PROTOCOL_VERSION
  });
}

function createHud() {
  if (document.getElementById('mochi-social-hud')) return;

  const hud = document.createElement('section');
  hud.id = 'mochi-social-hud';
  hud.setAttribute('aria-label', 'Mochi Social status');
  hud.innerHTML = `
    <div class="mochi-hud__status-strip">
      <div class="mochi-hud__brand">
        <strong>Mochi Social</strong>
        <span data-alpha-label>Canary preview stub - no real value</span>
      </div>
      <div class="mochi-hud__status-pills" aria-label="Connection status">
        <span data-auth-label>Guest</span>
        <span data-token-label>Seal: 0/1</span>
        <span data-presence-label>Nearby: 1 tester</span>
      </div>
    </div>
    <div class="mochi-hud__social-card" aria-label="Tester social state">
      <span data-profile-label>Profile: Mochirii wayfarer</span>
      <span data-guild-label>Guild: no buddy</span>
      <span data-rank-label>Rank: Visitor</span>
      <span data-status-label>Status: exploring</span>
      <span data-market-label>Market: ready</span>
    </div>
    <div class="mochi-hud__spirit-card" aria-label="Active Mochi Spirit">
      <span class="mochi-hud__kicker">Active Spirit</span>
      <strong data-spirit-label>Spirit: none</strong>
      <span class="mochi-hud__hint" data-journal-label>Journal: 0/${MOCHI_SPIRITS.length} records</span>
      <span class="mochi-hud__hint" data-expedition-label>Route: not scouted</span>
      <span class="mochi-hud__hint" data-route-invite-label>Route Invite: pending</span>
      <span class="mochi-hud__hint" data-route-mastery-label>Route Mastery: pending</span>
      <span class="mochi-hud__hint" data-habitat-bond-label>Habitat Bond: pending</span>
      <span class="mochi-hud__hint" data-research-label>Research: pending</span>
      <span class="mochi-hud__hint" data-technique-label>Technique: novice, 0 XP</span>
      <span class="mochi-hud__hint" data-tactic-label>Tactic: not set</span>
      <span class="mochi-hud__hint" data-affinity-label>Affinity: trial not started</span>
      <span class="mochi-hud__hint" data-party-label>Party: not formed</span>
      <span class="mochi-hud__hint" data-harmony-label>Harmony: pending</span>
      <span class="mochi-hud__hint" data-harmony-trial-label>Concord: pending</span>
      <span class="mochi-hud__hint" data-team-match-label>Team Match: pending</span>
      <span class="mochi-hud__hint" data-training-label>Attune, train, raise, and quest. Canary remains preview stub.</span>
      <span class="mochi-hud__hint" data-battle-round-label>Battle Round: pending</span>
      <span class="mochi-hud__hint" data-growth-label>Growth Rite: pending</span>
      <span class="mochi-hud__hint" data-quest-label>Quest: not started</span>
    </div>
    <div class="mochi-hud__actions" aria-label="Alpha quick actions">
      <button type="button" data-alpha-local-action="profile.view" aria-label="Open tester profile">Profile</button>
      <button type="button" data-alpha-local-action="guild.buddy" aria-label="Add local guild buddy proof">Guild</button>
      <button type="button" data-alpha-local-action="status.set" aria-label="Set cozy status mood">Mood</button>
      <button type="button" data-alpha-action="spirit.capture" aria-label="Invite a Mochi Spirit from the habitat grove">Invite</button>
      <button type="button" data-alpha-action="spirit.attune" aria-label="Attune a Mochi Spirit">Attune</button>
      <button type="button" data-alpha-action="party.set" aria-label="Form a Mochi Spirit party">Party</button>
      <button type="button" data-alpha-action="party.harmony_form" aria-label="Record the no-real-value three-spirit harmony form">Harmony</button>
      <button type="button" data-alpha-action="battle.harmony_trial" aria-label="Clear the no-injury social harmony battle trial">Concord</button>
      <button type="button" data-alpha-action="battle.team_spar_match" aria-label="Clear the no-injury full-party team spar match">Match</button>
      <button type="button" data-alpha-action="spirit.care" aria-label="Care for active Mochi Spirit">Care</button>
      <button type="button" data-alpha-action="spirit.journal" aria-label="Open the Mochirii spirit journal">Journal</button>
      <button type="button" data-alpha-action="spirit.habitat_bond" aria-label="Record a shared Mochi Spirit habitat bond">Habitat</button>
      <button type="button" data-alpha-action="spirit.research" aria-label="Record the Mochirii spirit research folio">Research</button>
      <button type="button" data-alpha-action="world.expedition" aria-label="Scout a Mochirii field route">Scout</button>
      <button type="button" data-alpha-action="spirit.route_invite" aria-label="Invite the scouted route spirit">Route</button>
      <button type="button" data-alpha-action="world.route_mastery" aria-label="Record Mochirii route mastery proof">Circuit</button>
      <button type="button" data-alpha-action="spirit.technique" aria-label="Practice a Mochirii spirit technique">Dojo</button>
      <button type="button" data-alpha-action="battle.tactic_scroll" aria-label="Study a no-injury Mochirii tactic scroll">Tactic</button>
      <button type="button" data-alpha-action="battle.affinity_trial" aria-label="Practice a no-injury affinity trial">Trial</button>
      <button type="button" data-alpha-action="spirit.train" aria-label="Run a no-injury spirit training battle">Train</button>
      <button type="button" data-alpha-action="battle.spar_ladder" aria-label="Run a no-injury party spar ladder">Spar</button>
      <button type="button" data-alpha-action="spirit.raise" aria-label="Raise and groom the active Mochi Spirit">Raise</button>
      <button type="button" data-alpha-local-action="spirit.inspect" aria-label="Inspect active Mochi Spirit">Inspect</button>
      <button type="button" data-alpha-action="quest.accept" aria-label="Accept the first Mochirii guild quest">Quest</button>
      <button type="button" data-alpha-action="quest.progress" aria-label="Progress the active Mochirii guild quest">Step</button>
      <button type="button" data-alpha-action="guild.rank_trial" aria-label="Record a no-real-value Mochirii guild rank trial">Rank</button>
      <button type="button" data-alpha-action="spirit.growth_rite" aria-label="Record a no-real-value Mochi Spirit growth rite">Bloom</button>
      <button type="button" data-alpha-action="emote.send" aria-label="Wave to nearby testers">Wave</button>
      <button type="button" data-alpha-action="market.fixed_list" aria-label="List a no-real-value market item">List</button>
      <button type="button" data-alpha-action="trade.direct_offer" aria-label="Record a no-real-value direct trade proof">Trade</button>
      <button type="button" data-alpha-action="chain.withdraw_request" aria-label="Stage a no-real-value Enjin Canary preview request">Canary</button>
    </div>
    <section class="mochi-hud__feed-panel" aria-label="Local chat and action log">
      <form class="mochi-hud__chat" data-chat-form>
        <label>
          <span>Local chat</span>
          <input data-chat-input maxlength="120" autocomplete="off" placeholder="Say hello" />
        </label>
        <button type="submit">Send</button>
      </form>
      <ol class="mochi-hud__feed" data-alpha-feed aria-live="polite"></ol>
    </section>
  `;
  document.body.appendChild(hud);

  const tokenLabel = hud.querySelector('[data-token-label]');
  const authLabel = hud.querySelector('[data-auth-label]');
  const profileLabel = hud.querySelector('[data-profile-label]');
  const guildLabel = hud.querySelector('[data-guild-label]');
  const rankLabel = hud.querySelector('[data-rank-label]');
  const statusLabel = hud.querySelector('[data-status-label]');
  const spiritLabel = hud.querySelector('[data-spirit-label]');
  const journalLabel = hud.querySelector('[data-journal-label]');
  const expeditionLabel = hud.querySelector('[data-expedition-label]');
  const routeInviteLabel = hud.querySelector('[data-route-invite-label]');
  const routeMasteryLabel = hud.querySelector('[data-route-mastery-label]');
  const habitatBondLabel = hud.querySelector('[data-habitat-bond-label]');
  const researchLabel = hud.querySelector('[data-research-label]');
  const techniqueLabel = hud.querySelector('[data-technique-label]');
  const tacticLabel = hud.querySelector('[data-tactic-label]');
  const affinityLabel = hud.querySelector('[data-affinity-label]');
  const partyLabel = hud.querySelector('[data-party-label]');
  const harmonyLabel = hud.querySelector('[data-harmony-label]');
  const harmonyTrialLabel = hud.querySelector('[data-harmony-trial-label]');
  const teamMatchLabel = hud.querySelector('[data-team-match-label]');
  const trainingLabel = hud.querySelector('[data-training-label]');
  const battleRoundLabel = hud.querySelector('[data-battle-round-label]');
  const growthLabel = hud.querySelector('[data-growth-label]');
  const questLabel = hud.querySelector('[data-quest-label]');
  const marketLabel = hud.querySelector('[data-market-label]');
  const feed = hud.querySelector<HTMLOListElement>('[data-alpha-feed]');
  const chatForm = hud.querySelector<HTMLFormElement>('[data-chat-form]');
  const chatInput = hud.querySelector<HTMLInputElement>('[data-chat-input]');

  function renderState() {
    const state = readAlphaState();
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    if (profileLabel) {
      profileLabel.textContent = state.profileViewed ? 'Profile: reviewed' : 'Profile: Mochirii wayfarer';
    }
    if (guildLabel) {
      guildLabel.textContent = state.guildBuddyProof ? 'Guild: 1 local buddy' : 'Guild: no buddy';
    }
    if (rankLabel) {
      rankLabel.textContent = state.guildRankProof
        ? `Rank: ${state.guildRankTitle}, score ${state.guildRankScore}`
        : `Rank: ${state.guildRankTitle || 'Visitor'}`;
    }
    if (statusLabel) {
      statusLabel.textContent = `Status: ${state.statusMood || 'exploring'}`;
    }
    if (spiritLabel) {
      spiritLabel.textContent = spirit ? `${spirit.name}: ${state.growth} growth, bond ${state.bond}/5` : 'Spirit: none';
    }
    if (journalLabel) {
      journalLabel.textContent = `Journal: ${state.journalDiscoveredCount}/${state.journalTotal || MOCHI_SPIRITS.length} records`;
    }
    if (expeditionLabel) {
      expeditionLabel.textContent = state.expeditionProof
        ? `Route: ${state.expeditionCount} scout${state.expeditionCount === 1 ? '' : 's'}, ${state.lastExpeditionEncounterId || 'signs'}`
        : 'Route: not scouted';
    }
    if (routeInviteLabel) {
      routeInviteLabel.textContent = state.routeInviteProof
        ? `Route Invite: ${state.lastRouteInviteSpiritId || 'recorded'}`
        : 'Route Invite: pending';
    }
    if (routeMasteryLabel) {
      routeMasteryLabel.textContent = state.routeMasteryProof
        ? `Route Mastery: ${state.routeMasteryTitle}, score ${state.routeMasteryScore}`
        : 'Route Mastery: pending';
    }
    if (habitatBondLabel) {
      habitatBondLabel.textContent = state.habitatBondProof
        ? `Habitat Bond: ${state.habitatBondName}, score ${state.habitatBondScore}`
        : 'Habitat Bond: pending';
    }
    if (researchLabel) {
      researchLabel.textContent = state.researchProof
        ? `Research: ${state.researchFolioName}, score ${state.researchScore}`
        : 'Research: pending';
    }
    if (techniqueLabel) {
      techniqueLabel.textContent = `Technique: ${state.techniqueMasteryLevel || 'novice'}, ${state.techniqueMasteryXp} XP${state.techniqueMoveId ? ` (${state.techniqueMoveId})` : ''}`;
    }
    if (tacticLabel) {
      tacticLabel.textContent = state.tacticProof
        ? `Tactic: ${state.lastTacticId || 'studied'}, ${state.tacticMasteryXp} XP${state.tacticStance ? ` (${state.tacticStance})` : ''}`
        : 'Tactic: not set';
    }
    if (affinityLabel) {
      affinityLabel.textContent = state.affinityProof
        ? `Affinity: ${state.affinityTrialWins} win${state.affinityTrialWins === 1 ? '' : 's'}, ${state.affinityAdvantage ? 'harmonized' : 'studied'}`
        : 'Affinity: trial not started';
    }
    if (partyLabel) {
      partyLabel.textContent = state.partyIds.length
        ? `Party: ${state.partyIds.length} spirit${state.partyIds.length === 1 ? '' : 's'}, ${state.sparLadderWins} ladder win${state.sparLadderWins === 1 ? '' : 's'}`
        : 'Party: not formed';
    }
    if (harmonyLabel) {
      harmonyLabel.textContent = state.harmonyFormProof
        ? `Harmony: ${state.harmonyFormName}, score ${state.harmonyFormScore}`
        : 'Harmony: pending';
    }
    if (harmonyTrialLabel) {
      harmonyTrialLabel.textContent = state.harmonyTrialProof
        ? `Concord: ${state.harmonyTrialName}, score ${state.harmonyTrialScore}`
        : 'Concord: pending';
    }
    if (teamMatchLabel) {
      teamMatchLabel.textContent = state.teamSparMatchProof
        ? `Team Match: ${state.teamSparMatchName}, score ${state.teamSparMatchScore}`
        : 'Team Match: pending';
    }
    if (trainingLabel) {
      trainingLabel.textContent = `Training: ${state.trainingXp} XP, ${state.trainingVictories} spar win${state.trainingVictories === 1 ? '' : 's'}, ladder ${state.sparLadderXp} XP, ${state.raisingProof ? `care streak ${state.raisingCareStreak}` : 'needs care'}`;
    }
    if (battleRoundLabel) {
      battleRoundLabel.textContent = state.battleRoundProof
        ? `Battle Round: ${state.battleRoundOpponentName}, ${state.battleRoundFocusScore}/${state.battleRoundOpponentScore}, ${state.battleRoundVictory ? 'clear' : 'study'}`
        : 'Battle Round: pending';
    }
    if (growthLabel) {
      growthLabel.textContent = state.growthRiteProof
        ? `Growth Rite: ${state.growthForm}`
        : `Growth Rite: ${state.growth === 'glow' ? 'ready' : 'pending'}`;
    }
    if (questLabel) {
      const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId);
      questLabel.textContent = state.questChainProof
        ? `Quest Chain: ${state.completedQuestIds.length}/${MOCHI_SPIRIT_QUESTS.length} complete`
        : quest
          ? `Quest: ${quest.title}, ${state.completedQuestSteps.length}/${quest.steps.length} steps`
          : 'Quest: not started';
    }
    if (marketLabel) {
      marketLabel.textContent = state.canaryRequested
        ? 'Canary: requested - preview stub'
        : state.tradeProof
          ? 'Trade: proofed - test only'
          : state.charmListed
            ? 'Market: listed - test soft currency'
            : 'Market: ready - fixed price';
    }
    if (feed) {
      feed.innerHTML = '';
      state.chat.slice(-5).forEach((line) => {
        const item = document.createElement('li');
        item.textContent = line;
        feed.appendChild(item);
      });
    }
  }

  window.addEventListener('mochi-social-auth-state', (event) => {
    const detail = (event as CustomEvent<{ state: AuthState }>).detail;
    if (authLabel) {
      authLabel.textContent = detail.state === 'linked' ? 'Linked' : detail.state === 'error' ? 'Auth issue' : 'Guest';
    }
  });

  window.addEventListener('mochi-social-token-state', (event) => {
    const detail = (event as CustomEvent<{ claimed: boolean }>).detail;
    if (tokenLabel) {
      tokenLabel.textContent = detail.claimed ? 'Seal: 1/1' : 'Seal: 0/1';
    }
  });

  hud.querySelectorAll<HTMLButtonElement>('[data-alpha-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionType = button.dataset.alphaAction as AlphaActionType;
      void performAlphaAction(actionType, buildHudActionPayload(actionType));
    });
  });

  hud.querySelectorAll<HTMLButtonElement>('[data-alpha-local-action]').forEach((button) => {
    button.addEventListener('click', () => {
      performAlphaLocalAction(button.dataset.alphaLocalAction as AlphaLocalActionType);
    });
  });

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput?.value.trim();
    if (!message) return;
    chatInput!.value = '';
    void performAlphaAction('chat.send', { message });
  });

  window.addEventListener('mochi-social-alpha-state', renderState);
  renderState();
}

function installLocalTabPresence() {
  const label = document.querySelector<HTMLElement>('[data-presence-label]');
  if (!label) return;

  const presenceLabel = label;
  const tabId = getPresenceTabId();
  const peers = new Map<string, number>();
  const storageKey = `${PRESENCE_STORAGE_PREFIX}${tabId}`;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(PRESENCE_CHANNEL) : null;

  function remember(message: PresenceMessage) {
    if (message.tabId !== tabId) {
      peers.set(message.tabId, message.at);
    }
    render();
  }

  function render() {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    for (const [peerId, lastSeen] of peers) {
      if (lastSeen < cutoff) peers.delete(peerId);
    }

    const count = peers.size + 1;
    presenceLabel.dataset.presenceCount = String(count);
    presenceLabel.textContent = count === 1 ? 'Nearby: 1 tester' : `Nearby: ${count} testers`;
  }

  function readStoragePeers() {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(PRESENCE_STORAGE_PREFIX) || key === storageKey) continue;

      try {
        const message = JSON.parse(localStorage.getItem(key) || 'null') as PresenceMessage | null;
        if (message?.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE' && message.at >= cutoff) {
          remember(message);
        }
      } catch {
        // Ignore stale local presence records from older alpha builds.
      }
    }
  }

  function publish() {
    const message: PresenceMessage = {
      type: 'MOCHI_SOCIAL_LOCAL_PRESENCE',
      tabId,
      at: Date.now()
    };

    channel?.postMessage(message);
    localStorage.setItem(storageKey, JSON.stringify(message));
    readStoragePeers();
    render();
  }

  channel?.addEventListener('message', (event: MessageEvent<PresenceMessage>) => {
    if (event.data?.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE') {
      remember(event.data);
    }
  });

  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(PRESENCE_STORAGE_PREFIX) || !event.newValue) return;

    try {
      const message = JSON.parse(event.newValue) as PresenceMessage;
      if (message.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE') remember(message);
    } catch {
      // Ignore malformed storage events; presence is only a local visual cue.
    }
  });

  const timer = window.setInterval(publish, 1000);
  window.addEventListener('pagehide', () => {
    window.clearInterval(timer);
    channel?.close();
    localStorage.removeItem(storageKey);
  });

  publish();
}

function installLocalMovementPulse() {
  const tabId = getPresenceTabId();
  const storageKey = `${MOVEMENT_STORAGE_PREFIX}${tabId}`;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(MOVEMENT_CHANNEL) : null;
  let pulseTimer = 0;

  function pulseCanvas() {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;
    canvas.dataset.remoteMovementPulse = String(Date.now());
    canvas.style.filter = 'brightness(1.018) saturate(1.015)';
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(() => {
      canvas.style.filter = '';
      delete canvas.dataset.remoteMovementPulse;
    }, 4200);
  }

  function receive(message: MovementMessage) {
    if (message.tabId !== tabId && message.type === 'MOCHI_SOCIAL_LOCAL_MOVEMENT') {
      pulseCanvas();
    }
  }

  function publish(key: string) {
    const message: MovementMessage = {
      type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT',
      tabId,
      key,
      at: Date.now()
    };
    channel?.postMessage(message);
    localStorage.setItem(storageKey, JSON.stringify(message));
  }

  channel?.addEventListener('message', (event: MessageEvent<MovementMessage>) => {
    if (event.data?.type === 'MOCHI_SOCIAL_LOCAL_MOVEMENT') receive(event.data);
  });

  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(MOVEMENT_STORAGE_PREFIX) || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue) as MovementMessage);
    } catch {
      // Ignore malformed local movement hints; server movement remains authoritative.
    }
  });

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd'].includes(event.key)) {
      publish(event.key);
    }
  }, { capture: true });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(pulseTimer);
    channel?.close();
    localStorage.removeItem(storageKey);
  });
}

function getPresenceTabId() {
  const existing = sessionStorage.getItem(PRESENCE_TAB_KEY);
  if (existing) return existing;

  const tabId = crypto.randomUUID();
  sessionStorage.setItem(PRESENCE_TAB_KEY, tabId);
  return tabId;
}

function readAlphaState(): AlphaHudState {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALPHA_STATE_KEY) || 'null') as Partial<AlphaHudState> | null;
    return {
      ...defaultAlphaState(),
      ...(parsed || {}),
      attunedSpiritIds: Array.isArray(parsed?.attunedSpiritIds) ? parsed.attunedSpiritIds.map(String) : [],
      partyIds: Array.isArray(parsed?.partyIds) ? parsed.partyIds.map(String) : [],
      supportSpiritIds: Array.isArray(parsed?.supportSpiritIds) ? parsed.supportSpiritIds.map(String) : [],
      battleRoundTranscript: Array.isArray(parsed?.battleRoundTranscript) ? parsed.battleRoundTranscript.map(String) : [],
      completedQuestSteps: Array.isArray(parsed?.completedQuestSteps) ? parsed.completedQuestSteps.map(String) : [],
      chat: Array.isArray(parsed?.chat) ? parsed.chat.slice(-32).map(String) : []
    };
  } catch {
    return defaultAlphaState();
  }
}

function writeAlphaState(state: AlphaHudState) {
  localStorage.setItem(ALPHA_STATE_KEY, JSON.stringify({ ...state, chat: state.chat.slice(-32) }));
  window.dispatchEvent(new CustomEvent('mochi-social-alpha-state'));
}

function appendUniqueAlphaChat(state: AlphaHudState, message: string) {
  if (state.chat[state.chat.length - 1] !== message) {
    state.chat.push(message);
  }
}

function applyBattleRoundState(state: AlphaHudState, result: ReturnType<typeof resolveSpiritBattleRound>) {
  if (!result.ok) {
    state.chat.push(result.message);
    return;
  }

  state.battleRoundProof = true;
  state.battleRoundId = result.roundId;
  state.battleRoundOpponentName = result.opponentName;
  state.battleRoundFocusScore = result.focusScore;
  state.battleRoundOpponentScore = result.opponentScore;
  state.battleRoundVictory = result.victory;
  state.battleRoundTranscript = result.participants.map((participant) => `${participant.name}:${participant.moveLabel}:${participant.focusContribution}`);
  appendUniqueAlphaChat(state, result.message);
}

export function applyAlphaWorldState(patch: AlphaWorldStatePatch) {
  const state = readAlphaState();

  if (typeof patch.sealClaimed === 'boolean') {
    window.dispatchEvent(new CustomEvent('mochi-social-token-state', { detail: { claimed: patch.sealClaimed } }));
  }

  if (patch.spirit?.id) {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === patch.spirit?.id);
    state.spiritId = patch.spirit.id;
    if (!state.attunedSpiritIds.includes(patch.spirit.id)) {
      state.attunedSpiritIds.push(patch.spirit.id);
    }
    state.bond = Math.max(0, Math.min(5, Number(patch.spirit.bond) || 0));
    state.growth = patch.spirit.growth || growthStageFromBond(state.bond);
    if (spirit) {
      appendUniqueAlphaChat(state, `${spirit.name}: ${state.growth} growth, bond ${state.bond}/5.`);
    }
  }

  if (patch.capture?.spiritId) {
    state.captureProof = true;
    state.lastCaptureSpiritId = patch.capture.spiritId;
    state.spiritId = patch.capture.spiritId;
    for (const spiritId of patch.capture.roster || [patch.capture.spiritId]) {
      if (!state.attunedSpiritIds.includes(spiritId)) {
        state.attunedSpiritIds.push(spiritId);
      }
    }
    appendUniqueAlphaChat(state, patch.capture.message || `Spirit invitation recorded for ${patch.capture.spiritId}.`);
  }

  if (patch.journal) {
    state.journalProof = patch.journal.proof || state.journalProof;
    state.journalDiscoveredCount = Math.max(state.journalDiscoveredCount, Number(patch.journal.discoveredCount) || 0);
    state.journalTotal = Math.max(1, Number(patch.journal.totalCount) || MOCHI_SPIRITS.length);
    state.lastJournalSpiritId = patch.journal.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.journal.message || `Mochirii spirit journal ${state.journalDiscoveredCount}/${state.journalTotal}.`);
  }

  if (patch.habitatBond) {
    state.habitatBondProof = patch.habitatBond.proof || state.habitatBondProof;
    state.habitatBondId = patch.habitatBond.bondId || state.habitatBondId;
    state.habitatBondName = patch.habitatBond.bondName || state.habitatBondName;
    state.habitatBondScore = Math.max(state.habitatBondScore, Number(patch.habitatBond.score) || 0);
    state.habitatTasselClaimed = state.habitatTasselClaimed || patch.habitatBond.rewardItemId === 'jade-court-habitat-tassel';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.habitatBond.roster.map(String)]));
    state.spiritId = patch.habitatBond.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.habitatBond.message || `${state.habitatBondName} recorded as no-real-value habitat proof.`);
  }

  if (patch.research) {
    state.researchProof = patch.research.proof || state.researchProof;
    state.researchFolioId = patch.research.folioId || state.researchFolioId;
    state.researchFolioName = patch.research.folioName || state.researchFolioName;
    state.researchScore = Math.max(state.researchScore, Number(patch.research.score) || 0);
    state.researchFolioClaimed = state.researchFolioClaimed || patch.research.rewardItemId === 'jade-court-research-folio';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.research.roster.map(String)]));
    state.discoveredRouteIds = Array.from(new Set([...(state.discoveredRouteIds || []), ...patch.research.discoveredRoutes.map(String)]));
    state.spiritId = patch.research.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.research.message || `${state.researchFolioName} recorded as no-real-value research proof.`);
  }

  if (patch.expedition) {
    state.expeditionProof = patch.expedition.proof || state.expeditionProof;
    state.lastExpeditionRouteId = patch.expedition.routeId || state.lastExpeditionRouteId;
    state.lastExpeditionEncounterId = patch.expedition.encounterSpiritId || state.lastExpeditionEncounterId;
    state.discoveredRouteIds = Array.from(new Set([...(state.discoveredRouteIds || []), ...patch.expedition.discoveredRoutes.map(String)]));
    state.expeditionCount = Math.max(state.expeditionCount, Number(patch.expedition.count) || state.discoveredRouteIds.length);
    state.routeRibbonClaimed = state.routeRibbonClaimed || patch.expedition.rewardItemId === 'moonbridge-field-ribbon';
    appendUniqueAlphaChat(state, patch.expedition.message || `Route scouted: ${patch.expedition.routeName}.`);
  }

  if (patch.routeInvite) {
    state.routeInviteProof = patch.routeInvite.proof || state.routeInviteProof;
    state.lastRouteInviteRouteId = patch.routeInvite.routeId || state.lastRouteInviteRouteId;
    state.lastRouteInviteSpiritId = patch.routeInvite.spiritId || state.lastRouteInviteSpiritId;
    state.captureProof = true;
    state.lastCaptureSpiritId = patch.routeInvite.spiritId || state.lastCaptureSpiritId;
    state.spiritId = patch.routeInvite.spiritId || state.spiritId;
    for (const spiritId of patch.routeInvite.roster || [patch.routeInvite.spiritId]) {
      if (!state.attunedSpiritIds.includes(spiritId)) {
        state.attunedSpiritIds.push(spiritId);
      }
    }
    state.bond = Math.max(state.bond, 1);
    state.growth = state.growth || 'seed';
    appendUniqueAlphaChat(state, patch.routeInvite.message || `Route invitation recorded for ${patch.routeInvite.routeName}.`);
  }

  if (patch.routeMastery) {
    state.routeMasteryProof = patch.routeMastery.proof || state.routeMasteryProof;
    state.routeMasteryId = patch.routeMastery.masteryId || state.routeMasteryId;
    state.routeMasteryTitle = patch.routeMastery.title || state.routeMasteryTitle;
    state.routeMasteryScore = Math.max(state.routeMasteryScore, Number(patch.routeMastery.score) || 0);
    state.routeMasteryKnotClaimed = state.routeMasteryKnotClaimed || patch.routeMastery.rewardItemId === 'cloudbell-route-knot';
    appendUniqueAlphaChat(state, patch.routeMastery.message || `${state.routeMasteryTitle} field mastery recorded.`);
  }

  if (patch.technique) {
    state.techniqueProof = patch.technique.proof || state.techniqueProof;
    state.techniqueMoveId = patch.technique.moveId || state.techniqueMoveId;
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, Number(patch.technique.masteryXp) || 0);
    state.techniqueMasteryLevel = patch.technique.masteryLevel || state.techniqueMasteryLevel;
    state.techniqueFocusScore = Math.max(state.techniqueFocusScore, Number(patch.technique.focusScore) || 0);
    state.spiritId = patch.technique.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.technique.message || `Technique mastery ${state.techniqueMasteryLevel} ${state.techniqueMasteryXp} XP.`);
  }

  if (patch.tactic) {
    state.tacticProof = patch.tactic.proof || state.tacticProof;
    state.lastTacticId = patch.tactic.tacticId || state.lastTacticId;
    state.lastTacticSpiritId = patch.tactic.spiritId || state.lastTacticSpiritId;
    state.lastTacticMoveId = patch.tactic.moveId || state.lastTacticMoveId;
    state.tacticStance = patch.tactic.stance || state.tacticStance;
    state.tacticFocusScore = Math.max(state.tacticFocusScore, Number(patch.tactic.focusScore) || 0);
    state.tacticMasteryXp = Math.max(state.tacticMasteryXp, Number(patch.tactic.masteryXp) || 0);
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, state.tacticMasteryXp);
    state.techniqueMasteryLevel = techniqueMasteryLevelFromXp(state.techniqueMasteryXp);
    state.techniqueMoveId = patch.tactic.moveId || state.techniqueMoveId;
    state.spiritId = patch.tactic.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.tactic.message || `Battle tactic ${state.lastTacticId || 'studied'} ${state.tacticMasteryXp} XP.`);
  }

  if (patch.rank) {
    state.guildRankProof = patch.rank.proof || state.guildRankProof;
    state.guildRankId = patch.rank.trialId || state.guildRankId;
    state.guildRankTitle = patch.rank.rankTitle || state.guildRankTitle;
    state.guildRankScore = Math.max(state.guildRankScore, Number(patch.rank.score) || 0);
    state.guildRankSealClaimed = state.guildRankSealClaimed || patch.rank.rewardItemId === 'jade-court-rank-seal';
    appendUniqueAlphaChat(state, patch.rank.message || `Guild rank recorded: ${state.guildRankTitle}.`);
  }

  if (patch.growthRite) {
    state.growthRiteProof = patch.growthRite.proof || state.growthRiteProof;
    state.growthRiteId = patch.growthRite.riteId || state.growthRiteId;
    state.growthForm = patch.growthRite.formTitle || state.growthForm;
    state.growthSigilClaimed = state.growthSigilClaimed || patch.growthRite.rewardItemId === 'moonwell-bloom-sigil';
    state.spiritId = patch.growthRite.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.growthRite.message || `Growth rite recorded: ${state.growthForm}.`);
  }

  if (patch.affinity) {
    state.affinityProof = patch.affinity.proof || state.affinityProof;
    state.lastAffinityTrialId = patch.affinity.trialId || state.lastAffinityTrialId;
    state.affinityAdvantage = Boolean(patch.affinity.affinityAdvantage);
    state.affinityFocusScore = Math.max(state.affinityFocusScore, Number(patch.affinity.focusScore) || 0);
    state.affinityTrialScore = Math.max(state.affinityTrialScore, Number(patch.affinity.trialScore) || 0);
    state.affinityTrialWins = Math.max(state.affinityTrialWins, Number(patch.affinity.wins) || 0);
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, Number(patch.affinity.masteryXp) || 0);
    state.techniqueMoveId = patch.affinity.moveId || state.techniqueMoveId;
    state.spiritId = patch.affinity.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.affinity.message || `Affinity trial ${patch.affinity.victory ? 'cleared' : 'studied'}.`);
  }

  if (patch.charmListed) {
    state.charmListed = true;
    appendUniqueAlphaChat(state, 'Jade Thread Charm listed from the town board. Test soft currency only.');
  }

  if (patch.party) {
    state.activePartyId = patch.party.activeSpiritId || patch.party.partyIds[0];
    state.partyIds = patch.party.partyIds.map(String);
    state.supportSpiritIds = patch.party.supportIds.map(String);
    appendUniqueAlphaChat(state, patch.party.message || `Party formed with ${state.partyIds.length} Mochi Spirits.`);
  }

  if (patch.harmonyForm) {
    state.harmonyFormProof = patch.harmonyForm.proof || state.harmonyFormProof;
    state.harmonyFormId = patch.harmonyForm.formId || state.harmonyFormId;
    state.harmonyFormName = patch.harmonyForm.name || state.harmonyFormName;
    state.harmonyFormScore = Math.max(state.harmonyFormScore, Number(patch.harmonyForm.score) || 0);
    state.harmonySashClaimed = state.harmonySashClaimed || patch.harmonyForm.rewardItemId === 'triune-jade-sash';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.harmonyForm.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.harmonyForm.message || `${state.harmonyFormName} recorded as no-real-value party harmony proof.`);
  }

  if (patch.harmonyTrial) {
    state.harmonyTrialProof = patch.harmonyTrial.proof || state.harmonyTrialProof;
    state.harmonyTrialId = patch.harmonyTrial.trialId || state.harmonyTrialId;
    state.harmonyTrialName = patch.harmonyTrial.trialName || state.harmonyTrialName;
    state.harmonyTrialScore = Math.max(state.harmonyTrialScore, Number(patch.harmonyTrial.score) || 0);
    state.concordTallyClaimed = state.concordTallyClaimed || patch.harmonyTrial.rewardItemId === 'jade-echo-concord-tally';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.harmonyTrial.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.harmonyTrial.message || `${state.harmonyTrialName} recorded as no-real-value concord proof.`);
  }

  if (patch.teamSparMatch) {
    state.teamSparMatchProof = patch.teamSparMatch.proof || state.teamSparMatchProof;
    state.teamSparMatchId = patch.teamSparMatch.matchId || state.teamSparMatchId;
    state.teamSparMatchName = patch.teamSparMatch.matchName || state.teamSparMatchName;
    state.teamSparMatchScore = Math.max(state.teamSparMatchScore, Number(patch.teamSparMatch.score) || 0);
    state.teamMatchRibbonClaimed = state.teamMatchRibbonClaimed || patch.teamSparMatch.rewardItemId === 'jade-mirror-match-ribbon';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.teamSparMatch.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.teamSparMatch.message || `${state.teamSparMatchName} recorded as no-real-value team match proof.`);
  }

  if (patch.training) {
    state.trainingXp = Math.max(state.trainingXp, Number(patch.training.xp) || 0);
    state.trainingVictories = Math.max(state.trainingVictories, Number(patch.training.victories) || 0);
    appendUniqueAlphaChat(state, patch.training.message || `Training ring: ${state.trainingXp} XP, ${state.trainingVictories} spar wins.`);
  }

  if (patch.spar) {
    state.sparLadderXp = Math.max(state.sparLadderXp, Number(patch.spar.xp) || 0);
    state.sparLadderWins = Math.max(state.sparLadderWins, Number(patch.spar.wins) || 0);
    state.lastSparOpponentId = patch.spar.opponentId;
    appendUniqueAlphaChat(state, patch.spar.message || `Spar ladder ${patch.spar.victory ? 'cleared' : 'practiced'}.`);
  }

  if (patch.battleRound) {
    state.battleRoundProof = true;
    state.battleRoundId = patch.battleRound.roundId;
    state.battleRoundOpponentName = patch.battleRound.opponentName;
    state.battleRoundFocusScore = Number(patch.battleRound.focusScore) || 0;
    state.battleRoundOpponentScore = Number(patch.battleRound.opponentScore) || 0;
    state.battleRoundVictory = Boolean(patch.battleRound.victory);
    state.battleRoundTranscript = Array.isArray(patch.battleRound.participants) ? patch.battleRound.participants.map(String) : state.battleRoundTranscript;
    appendUniqueAlphaChat(state, patch.battleRound.message || `Battle round transcript recorded against ${state.battleRoundOpponentName}.`);
  }

  if (patch.raising) {
    state.raisingProof = patch.raising.proof || state.raisingProof;
    state.raisingCareStreak = Math.max(state.raisingCareStreak, Number(patch.raising.careStreak) || 0);
    state.lastRaisingNeedId = patch.raising.needId || state.lastRaisingNeedId;
    state.nextRaisingNeedId = patch.raising.nextNeedId || state.nextRaisingNeedId;
    appendUniqueAlphaChat(state, patch.raising.message || `Raising care recorded: ${patch.raising.needId}.`);
  }

  if (patch.quest?.id) {
    state.activeQuestId = patch.quest.id;
    state.completedQuestSteps = Array.isArray(patch.quest.completedSteps) ? patch.quest.completedSteps.map(String) : state.completedQuestSteps;
    state.questStepsById = {
      ...state.questStepsById,
      [patch.quest.id]: state.completedQuestSteps
    };
    if (Array.isArray(patch.quest.completedQuestIds)) {
      state.completedQuestIds = Array.from(new Set(patch.quest.completedQuestIds.map(String)));
    }
    if (patch.quest.chainComplete) {
      state.questChainProof = true;
    }
    if (patch.quest.nextQuestId && !state.questChainProof) {
      state.activeQuestId = patch.quest.nextQuestId;
      state.completedQuestSteps = state.questStepsById[patch.quest.nextQuestId] || [];
    }
    appendUniqueAlphaChat(state, patch.quest.message || `Quest progress: ${state.completedQuestSteps.length} steps.`);
  }

  if (patch.tradeProof) {
    state.tradeProof = true;
    appendUniqueAlphaChat(state, 'Direct trade proof recorded from the trade post. No real value.');
  }

  if (patch.canaryRequested) {
    state.canaryRequested = true;
    appendUniqueAlphaChat(state, 'Canary certificate request staged from the shrine as preview stub. No real value.');
  }

  writeAlphaState(state);
}

function selectHudQuest(state: AlphaHudState) {
  return selectMochiSpiritQuest({
    roster: state.attunedSpiritIds,
    activeQuestId: state.activeQuestId,
    completedQuestIds: state.completedQuestIds,
    questStepsById: state.questStepsById
  });
}

function buildHudActionPayload(type: AlphaActionType): Record<string, unknown> {
  const state = readAlphaState();
  const spiritId = state.spiritId || 'lirabao';

  if (type === 'spirit.attune') {
    return {
      spiritId,
      offeredItemId: spiritId === 'jintari' ? 'jade-thread-charm' : 'mochirii-guild-seal'
    };
  }

  if (type === 'spirit.capture') {
    const targetSpirit = MOCHI_SPIRITS.find((entry) => !state.attunedSpiritIds.includes(entry.id)) || MOCHI_SPIRITS[0];
    return {
      spiritId: targetSpirit.id,
      offeredItemId: targetSpirit.capture.lureItemId,
      harmonyScore: targetSpirit.capture.harmonyRequired,
      roster: state.attunedSpiritIds
    };
  }

  if (type === 'spirit.train') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    return {
      spiritId: spirit.id,
      moveId: spirit.battle.moves[0].id,
      bond: state.bond || 1,
      round: Math.max(1, state.trainingVictories + 1)
    };
  }

  if (type === 'spirit.journal') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    return {
      roster,
      activeSpiritId: state.spiritId || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((id) => [id, state.bond || 1])),
      growthBySpiritId: Object.fromEntries(roster.map((id) => [id, state.growth || 'seed']))
    };
  }

  if (type === 'spirit.habitat_bond') {
    return {
      bondId: SPIRIT_HABITAT_BONDS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      journalDiscoveredCount: state.journalDiscoveredCount,
      careProof: state.raisingProof || state.bond > 1,
      bond: state.bond || 1,
      growth: state.growth || 'seed',
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood
    };
  }

  if (type === 'spirit.research') {
    return {
      folioId: SPIRIT_RESEARCH_FOLIOS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      discoveredRoutes: state.discoveredRouteIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      habitatBondProof: state.habitatBondProof,
      habitatBondId: state.habitatBondId,
      techniqueProof: state.techniqueProof,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      trainingXp: state.trainingXp
    };
  }

  if (type === 'world.expedition') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    const route = SPIRIT_EXPEDITION_ROUTES[state.expeditionCount % SPIRIT_EXPEDITION_ROUTES.length] || SPIRIT_EXPEDITION_ROUTES[0];
    return {
      routeId: route.id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      harmonyScore: (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length,
      discoveredRoutes: state.discoveredRouteIds
    };
  }

  if (type === 'spirit.route_invite') {
    const route =
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === state.lastExpeditionRouteId) ||
      SPIRIT_EXPEDITION_ROUTES.find((entry) => state.discoveredRouteIds.includes(entry.id)) ||
      SPIRIT_EXPEDITION_ROUTES[0];
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    return {
      routeId: route.id,
      offeredItemId: route.recommendedItemId,
      harmonyScore: (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length + state.expeditionCount,
      roster,
      discoveredRoutes: state.discoveredRouteIds
    };
  }

  if (type === 'world.route_mastery') {
    return {
      masteryId: SPIRIT_ROUTE_MASTERIES[0].id,
      discoveredRoutes: state.discoveredRouteIds,
      roster: state.attunedSpiritIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      completedQuestIds: state.completedQuestIds,
      guildRankProof: state.guildRankProof,
      rankTrialId: state.guildRankId
    };
  }

  if (type === 'spirit.technique') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    return {
      spiritId: spirit.id,
      moveId: spirit.battle.moves[0].id,
      currentMasteryXp: state.techniqueMasteryXp,
      bond: state.bond || 1
    };
  }

  if (type === 'battle.tactic_scroll') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    const move = spirit.battle.moves.find((entry) => entry.id === state.techniqueMoveId) || spirit.battle.moves[0];
    const tactic =
      SPIRIT_BATTLE_TACTICS.find((entry) => entry.recommendedMoveId === move.id) ||
      SPIRIT_BATTLE_TACTICS.find((entry) => entry.favoredAffinities.includes(move.affinity)) ||
      SPIRIT_BATTLE_TACTICS[0];
    return {
      spiritId: spirit.id,
      moveId: move.id,
      tacticId: tactic.id,
      currentMasteryXp: Math.max(state.tacticMasteryXp || 0, state.techniqueMasteryXp || 0),
      bond: state.bond || 1
    };
  }

  if (type === 'battle.affinity_trial') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    const move = spirit.battle.moves.find((entry) => entry.id === state.techniqueMoveId) || spirit.battle.moves[0];
    const trial = SPIRIT_AFFINITY_TRIALS.find((entry) => entry.favoredAffinities.includes(move.affinity)) || SPIRIT_AFFINITY_TRIALS[0];
    return {
      spiritId: spirit.id,
      moveId: move.id,
      trialId: trial.id,
      bond: state.bond || 1,
      techniqueMasteryXp: state.techniqueMasteryXp || 0
    };
  }

  if (type === 'party.set') {
    return {
      partyIds: state.attunedSpiritIds.slice(0, 3),
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0]
    };
  }

  if (type === 'party.harmony_form') {
    return {
      formId: SPIRIT_HARMONY_FORMS[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      trainingXp: state.trainingXp,
      sparLadderXp: state.sparLadderXp
    };
  }

  if (type === 'battle.harmony_trial') {
    return {
      trialId: SPIRIT_HARMONY_TRIALS[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      harmonyFormProof: state.harmonyFormProof,
      harmonyFormId: state.harmonyFormId,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      sparLadderWins: state.sparLadderWins,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.team_spar_match') {
    return {
      matchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      harmonyTrialProof: state.harmonyTrialProof,
      harmonyTrialId: state.harmonyTrialId,
      harmonyTrialScore: state.harmonyTrialScore,
      routeMasteryProof: state.routeMasteryProof,
      tacticProof: state.tacticProof,
      growthRiteProof: state.growthRiteProof,
      questChainProof: state.questChainProof,
      trainingXp: state.trainingXp,
      sparLadderWins: state.sparLadderWins,
      chatLines: state.chat
    };
  }

  if (type === 'battle.spar_ladder') {
    return {
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      opponentId: 'jade-echo-apprentice',
      bondBySpiritId: Object.fromEntries((state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3)).map((spiritId) => [spiritId, state.bond || 1])),
      priorWins: state.sparLadderWins
    };
  }

  if (type === 'spirit.raise') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const need = selectSpiritRaisingNeed(spirit.id, state.raisingCareStreak) || spirit.raisingNeeds[0];
    return {
      spiritId: spirit.id,
      needId: need.id,
      currentBond: state.bond || 1,
      careStreak: state.raisingCareStreak
    };
  }

  if (type === 'quest.accept') {
    return { questId: selectHudQuest(state).id };
  }

  if (type === 'quest.progress') {
    const quest = state.activeQuestId ? MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId) || selectHudQuest(state) : selectHudQuest(state);
    const questSteps: readonly string[] = quest.steps;
    const completedSteps = state.questStepsById[quest.id] || [];
    return {
      questId: quest.id,
      stepId: questSteps[completedSteps.length] || questSteps[questSteps.length - 1]
    };
  }

  if (type === 'guild.rank_trial') {
    const trial = GUILD_RANK_TRIALS[0];
    return {
      trialId: trial.id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      bond: state.bond || 1,
      completedQuestSteps: state.completedQuestSteps,
      tacticProof: state.tacticProof,
      affinityWins: state.affinityTrialWins,
      sparWins: state.sparLadderWins,
      journalDiscoveredCount: state.journalDiscoveredCount,
      guildBuddyProof: state.guildBuddyProof
    };
  }

  if (type === 'spirit.growth_rite') {
    const rite = SPIRIT_GROWTH_RITES[0];
    return {
      riteId: rite.id,
      spiritId: state.spiritId || state.attunedSpiritIds[0],
      bond: state.bond || 1,
      growth: state.growth || 'seed',
      trainingXp: state.trainingXp || 0,
      raisingProof: state.raisingProof,
      rankTrialProof: state.guildRankProof,
      rankTrialId: state.guildRankId
    };
  }

  if (type === 'chain.withdraw_request') {
    return {
      itemId: 'lirabao-canary-certificate',
      tokenId: '1',
      amount: 1,
      entityType: 'chain_operation',
      entityId: 'lirabao-canary-certificate'
    };
  }

  return {};
}

async function loadAlphaStatus() {
  try {
    const response = await fetch('/integration/alpha/status');
    if (!response.ok) return;
    const status = await response.json();
    window.dispatchEvent(new CustomEvent('mochi-social-alpha-runtime', { detail: status }));
  } catch {
    // The HUD remains playable in static/dev fallback mode.
  }
}

function performAlphaLocalAction(type: AlphaLocalActionType) {
  const state = readAlphaState();

  if (type === 'profile.view') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    state.profileViewed = true;
    state.chat.push(
      `Profile: Mochirii Wayfarer, local alpha presence, ${spirit ? `${spirit.name} active` : 'no active Mochi Spirit'}, ${state.guildBuddyProof ? 'one local guild buddy' : 'no guild buddy yet'}, status ${state.statusMood}, no real value.`
    );
  }

  if (type === 'guild.buddy') {
    state.guildBuddyProof = true;
    state.chat.push('Guild proof: Local Buddy added for closed-alpha social testing. No DMs, no real value.');
  }

  if (type === 'status.set') {
    state.statusMood = 'cozy';
    state.chat.push('Status set: cozy alpha hangout, visible locally for social presence testing.');
  }

  if (type === 'spirit.inspect') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    if (!spirit) {
      state.chat.push('No Mochi Spirit is bonded yet. Bond with Lirabao, Jintari, or Aozhen first.');
    } else {
      state.lastInspectedSpiritId = spirit.id;
      state.chat.push(
        `Inspect ${spirit.name}: ${spirit.title}, ${state.growth} growth, bond ${state.bond}/5, ${spirit.habitat}, ${spirit.certificateEligible ? 'Canary certificate eligible, no real value' : 'curated preview spirit, no real value'}.`
      );
    }
  }

  writeAlphaState(state);
}

async function performAlphaAction(type: AlphaActionType, payload: Record<string, unknown> = {}) {
  const state = readAlphaState();
  const requestId = crypto.randomUUID();

  if (type === 'spirit.attune') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const offeredItemId = String(payload.offeredItemId || 'mochirii-guild-seal');
    const result = resolveSpiritAttunement(spiritId, offeredItemId);
    if (result.ok) {
      state.spiritId = result.spiritId;
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
      state.bond = Math.max(state.bond, result.bond);
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.capture') {
    const targetSpirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || '')) || MOCHI_SPIRITS.find((entry) => !state.attunedSpiritIds.includes(entry.id)) || MOCHI_SPIRITS[0];
    const result = resolveSpiritCapture(
      targetSpirit.id,
      String(payload.offeredItemId || targetSpirit.capture.lureItemId),
      Number(payload.harmonyScore || targetSpirit.capture.harmonyRequired),
      state.attunedSpiritIds
    );
    if (result.ok) {
      state.spiritId = targetSpirit.id;
      state.captureProof = true;
      state.lastCaptureSpiritId = targetSpirit.id;
      if (!state.attunedSpiritIds.includes(targetSpirit.id)) {
        state.attunedSpiritIds.push(targetSpirit.id);
      }
      state.bond = Math.max(state.bond, result.bond);
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.care') {
    state.spiritId = state.spiritId || 'lirabao';
    if (!state.attunedSpiritIds.includes(state.spiritId)) {
      state.attunedSpiritIds.push(state.spiritId);
    }
    state.bond = Math.min(5, state.bond + 1);
    state.growth = growthStageFromBond(state.bond);
    state.chat.push(`Care complete: ${state.growth} bond ${state.bond}`);
  }

  if (type === 'spirit.journal') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const result = resolveSpiritJournal(roster, String(payload.activeSpiritId || state.spiritId || roster[0] || ''), { [state.spiritId || 'lirabao']: state.bond || 1 }, { [state.spiritId || 'lirabao']: state.growth || 'seed' });
    if (result.ok) {
      state.journalProof = true;
      state.journalDiscoveredCount = result.discoveredCount;
      state.journalTotal = result.totalCount;
      state.lastJournalSpiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.habitat_bond') {
    const result = resolveSpiritHabitatBond(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        careProof: Boolean(payload.careProof ?? state.raisingProof ?? state.bond > 1),
        bond: Number(payload.bond || state.bond || 1),
        growth: String(payload.growth || state.growth || 'seed'),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || '')
      },
      String(payload.bondId || SPIRIT_HABITAT_BONDS[0].id)
    );
    if (result.bonded) {
      state.habitatBondProof = true;
      state.habitatBondId = result.bondId;
      state.habitatBondName = result.bondName;
      state.habitatBondScore = result.score;
      state.habitatTasselClaimed = result.rewardItemId === 'jade-court-habitat-tassel';
      state.attunedSpiritIds = result.roster;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.research') {
    const result = resolveSpiritResearchFolio(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        habitatBondId: String(payload.habitatBondId || state.habitatBondId || ''),
        techniqueProof: Boolean(payload.techniqueProof ?? state.techniqueProof),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0)
      },
      String(payload.folioId || SPIRIT_RESEARCH_FOLIOS[0].id)
    );
    if (result.recorded) {
      state.researchProof = true;
      state.researchFolioId = result.folioId;
      state.researchFolioName = result.folioName;
      state.researchScore = result.score;
      state.researchFolioClaimed = result.rewardItemId === 'jade-court-research-folio';
      state.attunedSpiritIds = result.roster;
      state.discoveredRouteIds = result.discoveredRoutes;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.expedition') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === String(payload.routeId || '')) || SPIRIT_EXPEDITION_ROUTES[0];
    const result = resolveSpiritExpedition(
      route.id,
      roster,
      String(payload.activeSpiritId || state.spiritId || roster[0] || ''),
      Number(payload.harmonyScore || (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length),
      Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds
    );
    if (result.ok) {
      state.expeditionProof = true;
      state.lastExpeditionRouteId = result.routeId;
      state.lastExpeditionEncounterId = result.encounterSpiritId;
      state.discoveredRouteIds = result.discoveredRoutes;
      state.expeditionCount = Math.max(state.expeditionCount + 1, result.discoveredRoutes.length);
      state.routeRibbonClaimed = state.routeRibbonClaimed || result.rewardItemId === 'moonbridge-field-ribbon';
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.route_invite') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const route =
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === String(payload.routeId || '')) ||
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === state.lastExpeditionRouteId) ||
      SPIRIT_EXPEDITION_ROUTES[0];
    const result = resolveSpiritRouteInvitation(
      route.id,
      String(payload.offeredItemId || route.recommendedItemId),
      Number(payload.harmonyScore || (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length + state.expeditionCount),
      roster,
      Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds
    );
    if (result.ok) {
      state.routeInviteProof = true;
      state.lastRouteInviteRouteId = result.routeId;
      state.lastRouteInviteSpiritId = result.spiritId;
      state.captureProof = true;
      state.lastCaptureSpiritId = result.spiritId;
      state.spiritId = result.spiritId;
      for (const spiritId of result.roster) {
        if (!state.attunedSpiritIds.includes(spiritId)) {
          state.attunedSpiritIds.push(spiritId);
        }
      }
      state.bond = Math.max(state.bond, result.bond);
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.route_mastery') {
    const result = resolveSpiritRouteMastery(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        rankTrialId: String(payload.rankTrialId || state.guildRankId || '')
      },
      String(payload.masteryId || SPIRIT_ROUTE_MASTERIES[0].id)
    );
    if (result.mastered) {
      state.routeMasteryProof = true;
      state.routeMasteryId = result.masteryId;
      state.routeMasteryTitle = result.title;
      state.routeMasteryScore = result.score;
      state.routeMasteryKnotClaimed = result.rewardItemId === 'cloudbell-route-knot';
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.technique') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || spirit.battle.moves[0].id);
    const result = resolveSpiritTechniqueMastery(spirit.id, moveId, Number(payload.currentMasteryXp || state.techniqueMasteryXp || 0), Number(payload.bond || state.bond || 1));
    if (result.ok) {
      state.techniqueProof = true;
      state.techniqueMoveId = result.moveId;
      state.techniqueMasteryXp = result.masteryXp;
      state.techniqueMasteryLevel = result.masteryLevel;
      state.techniqueFocusScore = result.focusScore;
      state.spiritId = result.spiritId;
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.tactic_scroll') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || state.techniqueMoveId || spirit.battle.moves[0].id);
    const tacticId = String(payload.tacticId || state.lastTacticId || '');
    const result = resolveSpiritBattleTactic(
      spirit.id,
      moveId,
      tacticId,
      Number(payload.currentMasteryXp || Math.max(state.tacticMasteryXp || 0, state.techniqueMasteryXp || 0)),
      Number(payload.bond || state.bond || 1)
    );
    if (result.ok) {
      state.tacticProof = true;
      state.lastTacticId = result.tacticId;
      state.lastTacticSpiritId = result.spiritId;
      state.lastTacticMoveId = result.moveId;
      state.tacticStance = result.stance;
      state.tacticFocusScore = result.focusScore;
      state.tacticMasteryXp = result.masteryXp;
      state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, result.masteryXp);
      state.techniqueMasteryLevel = techniqueMasteryLevelFromXp(state.techniqueMasteryXp);
      state.techniqueMoveId = result.moveId;
      state.spiritId = result.spiritId;
      state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
      state.growth = growthStageFromBond(state.bond);
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.affinity_trial') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || state.techniqueMoveId || spirit.battle.moves[0].id);
    const result = resolveSpiritAffinityTrial(
      spirit.id,
      moveId,
      String(payload.trialId || SPIRIT_AFFINITY_TRIALS[0].id),
      Number(payload.bond || state.bond || 1),
      Number(payload.techniqueMasteryXp || state.techniqueMasteryXp || 0)
    );
    if (result.ok) {
      state.affinityProof = true;
      state.lastAffinityTrialId = result.trialId;
      state.affinityAdvantage = result.affinityAdvantage;
      state.affinityFocusScore = result.focusScore;
      state.affinityTrialScore = result.trialScore;
      state.techniqueMasteryXp = result.masteryXp;
      state.techniqueMoveId = result.moveId;
      state.spiritId = result.spiritId;
      if (result.victory) {
        state.affinityTrialWins += 1;
        state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
        state.growth = growthStageFromBond(state.bond);
      }
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'party.set') {
    const requestedParty = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.attunedSpiritIds;
    const result = resolveSpiritParty(requestedParty, String(payload.activeSpiritId || state.spiritId || requestedParty[0] || ''));
    if (result.ok) {
      state.activePartyId = result.activeSpiritId;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.supportIds;
      state.spiritId = result.activeSpiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'party.harmony_form') {
    const result = resolveSpiritHarmonyForm(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0)
      },
      String(payload.formId || SPIRIT_HARMONY_FORMS[0].id)
    );
    if (result.formed) {
      state.harmonyFormProof = true;
      state.harmonyFormId = result.formId;
      state.harmonyFormName = result.name;
      state.harmonyFormScore = result.score;
      state.harmonySashClaimed = result.rewardItemId === 'triune-jade-sash';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.harmony_trial') {
    const result = resolveSpiritHarmonyTrial(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyFormId: String(payload.harmonyFormId || state.harmonyFormId || ''),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.trialId || SPIRIT_HARMONY_TRIALS[0].id)
    );
    if (result.cleared) {
      state.harmonyTrialProof = true;
      state.harmonyTrialId = result.trialId;
      state.harmonyTrialName = result.trialName;
      state.harmonyTrialScore = result.score;
      state.concordTallyClaimed = result.rewardItemId === 'jade-echo-concord-tally';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.team_spar_match') {
    const result = resolveSpiritTeamSparMatch(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        harmonyTrialId: String(payload.harmonyTrialId || state.harmonyTrialId || ''),
        harmonyTrialScore: Number(payload.harmonyTrialScore ?? state.harmonyTrialScore ?? 0),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.matchId || SPIRIT_TEAM_SPAR_MATCHES[0].id)
    );
    if (result.cleared) {
      state.teamSparMatchProof = true;
      state.teamSparMatchId = result.matchId;
      state.teamSparMatchName = result.matchName;
      state.teamSparMatchScore = result.score;
      state.teamMatchRibbonClaimed = result.rewardItemId === 'jade-mirror-match-ribbon';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.spar_ladder') {
    const requestedParty = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const priorWins = Number(payload.priorWins || state.sparLadderWins || 0);
    const bondBySpiritId = Object.fromEntries(requestedParty.map((spiritId) => [spiritId, state.bond || 1]));
    const result = resolveSpiritSparLadder(requestedParty, String(payload.opponentId || 'jade-echo-apprentice'), bondBySpiritId, priorWins);
    const battleRound = resolveSpiritBattleRound({
      partyIds: requestedParty,
      activeSpiritId: state.spiritId || requestedParty[0],
      bondBySpiritId,
      opponentId: result.opponentId,
      tacticProof: state.tacticProof,
      harmonyFormProof: state.harmonyFormProof,
      priorWins
    });
    if (result.ok) {
      state.partyIds = result.partyIds;
      state.activePartyId = result.partyIds[0];
      state.supportSpiritIds = result.partyIds.slice(1);
      state.sparLadderXp += result.trainingXp;
      state.lastSparOpponentId = result.opponentId;
      if (result.victory) {
        state.sparLadderWins += 1;
        state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
        state.growth = growthStageFromBond(state.bond);
      }
    }
    state.chat.push(result.message);
    applyBattleRoundState(state, battleRound);
  }

  if (type === 'spirit.train') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || spirit.battle.moves[0].id);
    const priorBond = Number(payload.bond || state.bond || 1);
    const result = resolveSpiritTrainingBattle(spirit.id, moveId, priorBond, Number(payload.round || 1));
    const battleParty = state.partyIds.length ? state.partyIds : [spirit.id];
    const battleRound = resolveSpiritBattleRound({
      partyIds: battleParty,
      activeSpiritId: spirit.id,
      moveIdBySpiritId: { [spirit.id]: moveId },
      bondBySpiritId: Object.fromEntries(battleParty.map((partySpiritId) => [partySpiritId, partySpiritId === spirit.id ? priorBond : state.bond || 1])),
      opponentId: state.lastSparOpponentId || 'jade-echo-apprentice',
      tacticProof: state.tacticProof,
      harmonyFormProof: state.harmonyFormProof,
      priorWins: state.sparLadderWins
    });
    state.spiritId = spirit.id;
    if (!state.attunedSpiritIds.includes(spirit.id)) {
      state.attunedSpiritIds.push(spirit.id);
    }
    state.trainingXp += result.trainingXp;
    if (result.victory) {
      state.trainingVictories += 1;
      state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
      state.growth = growthStageFromBond(state.bond);
    }
    state.chat.push(result.message);
    applyBattleRoundState(state, battleRound);
  }

  if (type === 'spirit.raise') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const careStreak = Number(payload.careStreak ?? state.raisingCareStreak ?? 0);
    const need = selectSpiritRaisingNeed(spirit.id, careStreak) || spirit.raisingNeeds[0];
    const needId = String(payload.needId || need.id);
    const result = resolveSpiritRaisingAction(spirit.id, needId, Number(payload.currentBond || state.bond || 1), careStreak);
    state.spiritId = spirit.id;
    if (!state.attunedSpiritIds.includes(spirit.id)) {
      state.attunedSpiritIds.push(spirit.id);
    }
    if (result.ok) {
      state.raisingProof = true;
      state.raisingCareStreak = Math.max(state.raisingCareStreak, result.careStreak);
      state.lastRaisingNeedId = result.needId;
      state.nextRaisingNeedId = result.nextNeedId;
      state.bond = Math.max(state.bond, result.bond);
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'quest.accept') {
    const questId = String(payload.questId || selectHudQuest(state).id);
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === questId) || selectHudQuest(state);
    state.activeQuestId = quest.id;
    state.completedQuestSteps = state.questStepsById[quest.id] || [];
    state.chat.push(`Quest accepted: ${quest.title}. ${quest.summary}`);
  }

  if (type === 'quest.progress') {
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === String(payload.questId || state.activeQuestId)) || selectHudQuest(state);
    const completedSteps = state.questStepsById[quest.id] || [];
    const stepId = String(payload.stepId || quest.steps[completedSteps.length] || quest.steps[quest.steps.length - 1]);
    const result = resolveMochiSpiritQuestProgress(quest.id, stepId, {
      roster: state.attunedSpiritIds,
      activeQuestId: state.activeQuestId,
      completedQuestIds: state.completedQuestIds,
      questStepsById: state.questStepsById
    });
    state.activeQuestId = result.nextQuestId && result.completed ? result.nextQuestId : result.questId;
    state.questStepsById = {
      ...state.questStepsById,
      [result.questId]: result.completedSteps
    };
    state.completedQuestSteps = state.questStepsById[state.activeQuestId] || result.completedSteps;
    state.completedQuestIds = result.completedQuestIds;
    state.questChainProof = result.chainComplete;
    if (result.completed && result.rewardBond > 0) {
      state.bond = Math.min(5, Math.max(state.bond, 1) + result.rewardBond);
      state.growth = growthStageFromBond(state.bond);
      state.chat.push(`Quest complete: ${result.title}. Reward recorded as no-real-value alpha progress.`);
    } else {
      state.chat.push(result.message);
    }
    if (result.completed && result.nextQuestId) {
      const nextQuest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === result.nextQuestId);
      if (nextQuest) {
        state.chat.push(`Quest posted: ${nextQuest.title}.`);
      }
    }
    if (result.chainComplete) {
      state.chat.push('Quest chain complete: first Mochirii guild postings finished for closed-alpha testing.');
    }
  }

  if (type === 'guild.rank_trial') {
    const result = resolveGuildRankTrial(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bond: Number(payload.bond || state.bond || 1),
        completedQuestSteps: Array.isArray(payload.completedQuestSteps) ? payload.completedQuestSteps.map(String) : state.completedQuestSteps,
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityWins: Number(payload.affinityWins ?? state.affinityTrialWins ?? 0),
        sparWins: Number(payload.sparWins ?? state.sparLadderWins ?? 0),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof)
      },
      String(payload.trialId || GUILD_RANK_TRIALS[0].id)
    );
    if (result.passed) {
      state.guildRankProof = true;
      state.guildRankId = result.trialId;
      state.guildRankTitle = result.rankTitle;
      state.guildRankScore = result.score;
      state.guildRankSealClaimed = result.rewardItemId === 'jade-court-rank-seal';
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.growth_rite') {
    const result = resolveSpiritGrowthRite(
      {
        spiritId: String(payload.spiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bond: Number(payload.bond || state.bond || 1),
        growth: String(payload.growth || state.growth || 'seed'),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        rankTrialProof: Boolean(payload.rankTrialProof ?? state.guildRankProof),
        rankTrialId: String(payload.rankTrialId || state.guildRankId || '')
      },
      String(payload.riteId || SPIRIT_GROWTH_RITES[0].id)
    );
    if (result.passed) {
      state.growthRiteProof = true;
      state.growthRiteId = result.riteId;
      state.growthForm = result.formTitle;
      state.growthSigilClaimed = result.rewardItemId === 'moonwell-bloom-sigil';
      state.spiritId = result.spiritId;
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'emote.send') {
    state.chat.push('You wave from the town square.');
  }

  if (type === 'market.fixed_list') {
    state.charmListed = true;
    state.chat.push('Jade Thread Charm listed for test soft currency. No real value.');
  }

  if (type === 'trade.direct_offer') {
    state.tradeProof = true;
    state.chat.push('Direct trade proof recorded for alpha testing. No real value.');
  }

  if (type === 'chain.withdraw_request') {
    state.canaryRequested = true;
    state.chat.push('Canary certificate request staged as preview stub. No real value.');
  }

  if (type === 'chat.send') {
    state.chat.push(`You: ${String(payload.message || '').slice(0, 120)}`);
  }

  writeAlphaState(state);

  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch('/integration/alpha/action', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId,
        type,
        payload: {
          ...payload,
          state,
          alpha: ALPHA_FEATURES.alpha
        }
      })
    });
    const body = (await response.json().catch(() => null)) as AlphaActionResponse | null;
    const chainMessage = type.startsWith('chain.') && body?.chainRuntime?.mode === 'configured-preview-stub'
      ? body.chainRuntime.message
      : null;
    if (chainMessage) {
      const nextState = readAlphaState();
      nextState.chat.push(chainMessage);
      writeAlphaState(nextState);
    }
  } catch {
    // Local HUD state remains the immediate alpha feedback path.
  }
}
