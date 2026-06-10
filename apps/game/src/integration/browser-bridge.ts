import { ALPHA_FEATURES, type AlphaActionType } from './alpha-contract';
import { MOCHI_SPIRITS, growthStageFromBond } from '../alpha/content';
import { BRIDGE_EVENTS, type AuthPayload, type AuthState, type BridgeMessage, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';

const TOKEN_KEY = 'mochiSocial.accessToken';
const EXPIRES_KEY = 'mochiSocial.accessTokenExpiresAt';
const ALPHA_STATE_KEY = 'mochiSocial.alphaState';
const PRESENCE_CHANNEL = 'mochi-social-presence';
const PRESENCE_TAB_KEY = 'mochiSocial.presenceTabId';
const PRESENCE_STORAGE_PREFIX = 'mochiSocial.presence.';
const PRESENCE_TTL_MS = 4000;

interface AlphaHudState {
  petId?: string;
  bond: number;
  growth: string;
  charmListed: boolean;
  tradeProof: boolean;
  canaryRequested: boolean;
  chat: string[];
}

interface PresenceMessage {
  type: 'MOCHI_SOCIAL_LOCAL_PRESENCE';
  tabId: string;
  at: number;
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
    bond: 0,
    growth: 'seed',
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
    <div class="mochi-hud__top">
      <strong>Mochi Social</strong>
      <span data-auth-label>Guest</span>
      <span data-token-label>Token: 0/1</span>
      <span data-presence-label>Nearby: 1 tester</span>
    </div>
    <div class="mochi-hud__alpha">
      <span data-alpha-label>Closed Canary alpha - no real value</span>
      <span data-pet-label>Pet: none</span>
      <span data-market-label>Market: ready</span>
    </div>
    <div class="mochi-hud__actions" aria-label="Alpha quick actions">
      <button type="button" data-alpha-action="pet.care">Care</button>
      <button type="button" data-alpha-action="emote.send">Wave</button>
      <button type="button" data-alpha-action="market.fixed_list">List</button>
      <button type="button" data-alpha-action="trade.direct_offer">Trade</button>
      <button type="button" data-alpha-action="chain.withdraw_request">Canary</button>
    </div>
    <form class="mochi-hud__chat" data-chat-form>
      <label>
        <span>Local chat</span>
        <input data-chat-input maxlength="120" autocomplete="off" placeholder="Say hello" />
      </label>
      <button type="submit">Send</button>
    </form>
    <ol class="mochi-hud__feed" data-alpha-feed aria-live="polite"></ol>
  `;
  document.body.appendChild(hud);

  const tokenLabel = hud.querySelector('[data-token-label]');
  const authLabel = hud.querySelector('[data-auth-label]');
  const petLabel = hud.querySelector('[data-pet-label]');
  const marketLabel = hud.querySelector('[data-market-label]');
  const feed = hud.querySelector<HTMLOListElement>('[data-alpha-feed]');
  const chatForm = hud.querySelector<HTMLFormElement>('[data-chat-form]');
  const chatInput = hud.querySelector<HTMLInputElement>('[data-chat-input]');

  function renderState() {
    const state = readAlphaState();
    const pet = MOCHI_SPIRITS.find((spirit) => spirit.id === state.petId);
    if (petLabel) {
      petLabel.textContent = pet ? `${pet.name}: ${state.growth} bond ${state.bond}` : 'Pet: none';
    }
    if (marketLabel) {
      marketLabel.textContent = state.canaryRequested
        ? 'Canary: requested'
        : state.tradeProof
          ? 'Trade: proofed'
          : state.charmListed
            ? 'Market: listed'
            : 'Market: ready';
    }
    if (feed) {
      feed.innerHTML = '';
      state.chat.slice(-4).forEach((line) => {
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
      tokenLabel.textContent = detail.claimed ? 'Token: 1/1' : 'Token: 0/1';
    }
  });

  hud.querySelectorAll<HTMLButtonElement>('[data-alpha-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionType = button.dataset.alphaAction as AlphaActionType;
      const payload = actionType === 'chain.withdraw_request'
        ? {
            itemId: 'momo-canary-certificate',
            tokenId: '1',
            amount: 1,
            entityType: 'chain_operation',
            entityId: 'momo-canary-certificate'
          }
        : {};
      void performAlphaAction(actionType, payload);
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
      chat: Array.isArray(parsed?.chat) ? parsed.chat.slice(-8).map(String) : []
    };
  } catch {
    return defaultAlphaState();
  }
}

function writeAlphaState(state: AlphaHudState) {
  localStorage.setItem(ALPHA_STATE_KEY, JSON.stringify({ ...state, chat: state.chat.slice(-8) }));
  window.dispatchEvent(new CustomEvent('mochi-social-alpha-state'));
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

async function performAlphaAction(type: AlphaActionType, payload: Record<string, unknown> = {}) {
  const state = readAlphaState();
  const requestId = crypto.randomUUID();

  if (type === 'pet.care') {
    state.petId = state.petId || 'momo';
    state.bond = Math.min(5, state.bond + 1);
    state.growth = growthStageFromBond(state.bond);
    state.chat.push(`Care complete: ${state.growth} bond ${state.bond}`);
  }

  if (type === 'emote.send') {
    state.chat.push('You wave from the town square.');
  }

  if (type === 'market.fixed_list') {
    state.charmListed = true;
    state.chat.push('Lantern Charm listed for test soft currency.');
  }

  if (type === 'trade.direct_offer') {
    state.tradeProof = true;
    state.chat.push('Direct trade proof recorded.');
  }

  if (type === 'chain.withdraw_request') {
    state.canaryRequested = true;
    state.chat.push('Canary certificate request staged. No real value.');
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
