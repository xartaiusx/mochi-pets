import { BRIDGE_EVENTS, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';
import { ALPHA_FEATURES } from './alpha-contract';

export interface GameManifest {
  name: 'Mochi Social';
  slug: 'mochi-social';
  version: string;
  origin: string;
  playUrl: string;
  embedUrl: string;
  healthUrl: string;
  bridge: {
    protocolVersion: number;
    namespace: 'MOCHI_SOCIAL';
    parentToGame: string[];
    gameToParent: string[];
  };
  auth: {
    provider: 'supabase';
    required: boolean;
    mode: 'guest-first' | 'closed-alpha';
    tokenPolicy: 'access-token-only';
  };
  alpha: typeof ALPHA_FEATURES.alpha;
  economy: typeof ALPHA_FEATURES.economy;
  chain: typeof ALPHA_FEATURES.chain;
  market: typeof ALPHA_FEATURES.market;
  ugc: typeof ALPHA_FEATURES.ugc;
}

function trimTrailingSlash(origin: string) {
  return origin.replace(/\/+$/, '');
}

export function createGameManifest(origin: string, version = '0.1.0'): GameManifest {
  const base = trimTrailingSlash(origin);

  return {
    name: 'Mochi Social',
    slug: 'mochi-social',
    version,
    origin: base,
    playUrl: `${base}/play`,
    embedUrl: `${base}/embed`,
    healthUrl: `${base}/healthz`,
    bridge: {
      protocolVersion: MOCHI_SOCIAL_PROTOCOL_VERSION,
      namespace: 'MOCHI_SOCIAL',
      parentToGame: [BRIDGE_EVENTS.auth, BRIDGE_EVENTS.signOut],
      gameToParent: [BRIDGE_EVENTS.ready, BRIDGE_EVENTS.authState, BRIDGE_EVENTS.error]
    },
    auth: {
      provider: 'supabase',
      required: process.env.SUPABASE_AUTH_REQUIRED === 'true',
      mode: process.env.SUPABASE_AUTH_REQUIRED === 'true' ? 'closed-alpha' : 'guest-first',
      tokenPolicy: 'access-token-only'
    },
    ...ALPHA_FEATURES
  };
}
