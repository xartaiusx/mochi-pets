import { ALPHA_FEATURES, type AlphaActionType } from './alpha-contract';
import {
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_EXPEDITION_ROUTES,
  growthStageFromBond,
  techniqueMasteryLevelFromXp,
  resolveSpiritAttunement,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleTactic,
  resolveSpiritCapture,
  resolveSpiritExpedition,
  resolveSpiritJournal,
  resolveSpiritParty,
  resolveSpiritRaisingAction,
  resolveSpiritRouteInvitation,
  resolveSpiritSparLadder,
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
  sparLadderXp: number;
  sparLadderWins: number;
  lastSparOpponentId?: string;
  trainingXp: number;
  trainingVictories: number;
  raisingProof: boolean;
  activeQuestId?: string;
  completedQuestSteps: string[];
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
  party?: {
    activeSpiritId?: string;
    message?: string;
    partyIds: string[];
    supportIds: string[];
  };
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  quest?: {
    completedSteps: string[];
    id: string;
    message?: string;
  };
  raising?: {
    message?: string;
    needId: string;
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
    sparLadderXp: 0,
    sparLadderWins: 0,
    trainingXp: 0,
    trainingVictories: 0,
    raisingProof: false,
    completedQuestSteps: [],
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
      <span data-status-label>Status: exploring</span>
      <span data-market-label>Market: ready</span>
    </div>
    <div class="mochi-hud__spirit-card" aria-label="Active Mochi Spirit">
      <span class="mochi-hud__kicker">Active Spirit</span>
      <strong data-spirit-label>Spirit: none</strong>
      <span class="mochi-hud__hint" data-journal-label>Journal: 0/${MOCHI_SPIRITS.length} records</span>
      <span class="mochi-hud__hint" data-expedition-label>Route: not scouted</span>
      <span class="mochi-hud__hint" data-route-invite-label>Route Invite: pending</span>
      <span class="mochi-hud__hint" data-technique-label>Technique: novice, 0 XP</span>
      <span class="mochi-hud__hint" data-tactic-label>Tactic: not set</span>
      <span class="mochi-hud__hint" data-affinity-label>Affinity: trial not started</span>
      <span class="mochi-hud__hint" data-party-label>Party: not formed</span>
      <span class="mochi-hud__hint" data-training-label>Attune, train, raise, and quest. Canary remains preview stub.</span>
      <span class="mochi-hud__hint" data-quest-label>Quest: not started</span>
    </div>
    <div class="mochi-hud__actions" aria-label="Alpha quick actions">
      <button type="button" data-alpha-local-action="profile.view" aria-label="Open tester profile">Profile</button>
      <button type="button" data-alpha-local-action="guild.buddy" aria-label="Add local guild buddy proof">Guild</button>
      <button type="button" data-alpha-local-action="status.set" aria-label="Set cozy status mood">Mood</button>
      <button type="button" data-alpha-action="spirit.capture" aria-label="Invite a Mochi Spirit from the habitat grove">Invite</button>
      <button type="button" data-alpha-action="spirit.attune" aria-label="Attune a Mochi Spirit">Attune</button>
      <button type="button" data-alpha-action="party.set" aria-label="Form a Mochi Spirit party">Party</button>
      <button type="button" data-alpha-action="spirit.care" aria-label="Care for active Mochi Spirit">Care</button>
      <button type="button" data-alpha-action="spirit.journal" aria-label="Open the Mochirii spirit journal">Journal</button>
      <button type="button" data-alpha-action="world.expedition" aria-label="Scout a Mochirii field route">Scout</button>
      <button type="button" data-alpha-action="spirit.route_invite" aria-label="Invite the scouted route spirit">Route</button>
      <button type="button" data-alpha-action="spirit.technique" aria-label="Practice a Mochirii spirit technique">Dojo</button>
      <button type="button" data-alpha-action="battle.tactic_scroll" aria-label="Study a no-injury Mochirii tactic scroll">Tactic</button>
      <button type="button" data-alpha-action="battle.affinity_trial" aria-label="Practice a no-injury affinity trial">Trial</button>
      <button type="button" data-alpha-action="spirit.train" aria-label="Run a no-injury spirit training battle">Train</button>
      <button type="button" data-alpha-action="battle.spar_ladder" aria-label="Run a no-injury party spar ladder">Spar</button>
      <button type="button" data-alpha-action="spirit.raise" aria-label="Raise and groom the active Mochi Spirit">Raise</button>
      <button type="button" data-alpha-local-action="spirit.inspect" aria-label="Inspect active Mochi Spirit">Inspect</button>
      <button type="button" data-alpha-action="quest.accept" aria-label="Accept the first Mochirii guild quest">Quest</button>
      <button type="button" data-alpha-action="quest.progress" aria-label="Progress the active Mochirii guild quest">Step</button>
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
  const statusLabel = hud.querySelector('[data-status-label]');
  const spiritLabel = hud.querySelector('[data-spirit-label]');
  const journalLabel = hud.querySelector('[data-journal-label]');
  const expeditionLabel = hud.querySelector('[data-expedition-label]');
  const routeInviteLabel = hud.querySelector('[data-route-invite-label]');
  const techniqueLabel = hud.querySelector('[data-technique-label]');
  const tacticLabel = hud.querySelector('[data-tactic-label]');
  const affinityLabel = hud.querySelector('[data-affinity-label]');
  const partyLabel = hud.querySelector('[data-party-label]');
  const trainingLabel = hud.querySelector('[data-training-label]');
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
    if (trainingLabel) {
      trainingLabel.textContent = `Training: ${state.trainingXp} XP, ${state.trainingVictories} spar win${state.trainingVictories === 1 ? '' : 's'}, ladder ${state.sparLadderXp} XP, ${state.raisingProof ? 'raised' : 'needs care'}`;
    }
    if (questLabel) {
      const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId);
      questLabel.textContent = quest
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

  if (patch.raising) {
    state.raisingProof = patch.raising.proof || state.raisingProof;
    appendUniqueAlphaChat(state, patch.raising.message || `Raising care recorded: ${patch.raising.needId}.`);
  }

  if (patch.quest?.id) {
    state.activeQuestId = patch.quest.id;
    state.completedQuestSteps = Array.isArray(patch.quest.completedSteps) ? patch.quest.completedSteps.map(String) : state.completedQuestSteps;
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
    return {
      spiritId: spirit.id,
      needId: spirit.raisingNeeds[0].id,
      currentBond: state.bond || 1
    };
  }

  if (type === 'quest.accept') {
    return { questId: state.activeQuestId || MOCHI_SPIRIT_QUESTS[0].id };
  }

  if (type === 'quest.progress') {
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId) || MOCHI_SPIRIT_QUESTS[0];
    const questSteps: readonly string[] = quest.steps;
    return {
      questId: quest.id,
      stepId: questSteps[state.completedQuestSteps.length] || questSteps[questSteps.length - 1]
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

  if (type === 'battle.spar_ladder') {
    const requestedParty = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const result = resolveSpiritSparLadder(requestedParty, String(payload.opponentId || 'jade-echo-apprentice'), { [state.spiritId || 'lirabao']: state.bond || 1 }, Number(payload.priorWins || state.sparLadderWins || 0));
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
  }

  if (type === 'spirit.train') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || spirit.battle.moves[0].id);
    const result = resolveSpiritTrainingBattle(spirit.id, moveId, Number(payload.bond || state.bond || 1), Number(payload.round || 1));
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
  }

  if (type === 'spirit.raise') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const needId = String(payload.needId || spirit.raisingNeeds[0].id);
    const result = resolveSpiritRaisingAction(spirit.id, needId, Number(payload.currentBond || state.bond || 1));
    state.spiritId = spirit.id;
    if (!state.attunedSpiritIds.includes(spirit.id)) {
      state.attunedSpiritIds.push(spirit.id);
    }
    if (result.ok) {
      state.raisingProof = true;
      state.bond = Math.max(state.bond, result.bond);
      state.growth = result.growth;
    }
    state.chat.push(result.message);
  }

  if (type === 'quest.accept') {
    const questId = String(payload.questId || MOCHI_SPIRIT_QUESTS[0].id);
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === questId) || MOCHI_SPIRIT_QUESTS[0];
    state.activeQuestId = quest.id;
    state.completedQuestSteps = [];
    state.chat.push(`Quest accepted: ${quest.title}. ${quest.summary}`);
  }

  if (type === 'quest.progress') {
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === String(payload.questId || state.activeQuestId)) || MOCHI_SPIRIT_QUESTS[0];
    const questSteps: readonly string[] = quest.steps;
    const stepId = String(payload.stepId || questSteps[state.completedQuestSteps.length] || questSteps[questSteps.length - 1]);
    state.activeQuestId = quest.id;
    if (questSteps.includes(stepId) && !state.completedQuestSteps.includes(stepId)) {
      state.completedQuestSteps.push(stepId);
    }
    if (state.completedQuestSteps.length >= questSteps.length) {
      state.bond = Math.min(5, Math.max(state.bond, 1) + quest.rewardBond);
      state.growth = growthStageFromBond(state.bond);
      state.chat.push(`Quest complete: ${quest.title}. Reward recorded as no-real-value alpha progress.`);
    } else {
      state.chat.push(`Quest progress: ${quest.title} ${state.completedQuestSteps.length}/${questSteps.length}.`);
    }
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
