import { ALPHA_FEATURES, type AlphaActionType } from './alpha-contract';
import {
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  growthStageFromBond,
  resolveSpiritAttunement,
  resolveSpiritRaisingAction,
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
  canaryRequested?: boolean;
  charmListed?: boolean;
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  sealClaimed?: boolean;
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
      <span class="mochi-hud__hint" data-training-label>Attune, train, raise, and quest. Canary remains preview stub.</span>
      <span class="mochi-hud__hint" data-quest-label>Quest: not started</span>
    </div>
    <div class="mochi-hud__actions" aria-label="Alpha quick actions">
      <button type="button" data-alpha-local-action="profile.view" aria-label="Open tester profile">Profile</button>
      <button type="button" data-alpha-local-action="guild.buddy" aria-label="Add local guild buddy proof">Guild</button>
      <button type="button" data-alpha-local-action="status.set" aria-label="Set cozy status mood">Mood</button>
      <button type="button" data-alpha-action="spirit.attune" aria-label="Attune a Mochi Spirit">Attune</button>
      <button type="button" data-alpha-action="spirit.care" aria-label="Care for active Mochi Spirit">Care</button>
      <button type="button" data-alpha-action="spirit.train" aria-label="Run a no-injury spirit training battle">Train</button>
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
    if (trainingLabel) {
      trainingLabel.textContent = `Training: ${state.trainingXp} XP, ${state.trainingVictories} spar win${state.trainingVictories === 1 ? '' : 's'}, ${state.raisingProof ? 'raised' : 'needs care'}`;
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
      completedQuestSteps: Array.isArray(parsed?.completedQuestSteps) ? parsed.completedQuestSteps.map(String) : [],
      chat: Array.isArray(parsed?.chat) ? parsed.chat.slice(-24).map(String) : []
    };
  } catch {
    return defaultAlphaState();
  }
}

function writeAlphaState(state: AlphaHudState) {
  localStorage.setItem(ALPHA_STATE_KEY, JSON.stringify({ ...state, chat: state.chat.slice(-24) }));
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

  if (patch.charmListed) {
    state.charmListed = true;
    appendUniqueAlphaChat(state, 'Jade Thread Charm listed from the town board. Test soft currency only.');
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

  if (type === 'spirit.train') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    return {
      spiritId: spirit.id,
      moveId: spirit.battle.moves[0].id,
      bond: state.bond || 1,
      round: Math.max(1, state.trainingVictories + 1)
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

  if (type === 'spirit.care') {
    state.spiritId = state.spiritId || 'lirabao';
    if (!state.attunedSpiritIds.includes(state.spiritId)) {
      state.attunedSpiritIds.push(state.spiritId);
    }
    state.bond = Math.min(5, state.bond + 1);
    state.growth = growthStageFromBond(state.bond);
    state.chat.push(`Care complete: ${state.growth} bond ${state.bond}`);
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
