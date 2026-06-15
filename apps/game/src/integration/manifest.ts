import { BRIDGE_EVENTS, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';
import { ALPHA_FEATURES } from './alpha-contract';
import { MOCHI_SPIRITS } from '../alpha/content';

const spiritRoster = MOCHI_SPIRITS.map((spirit) => ({
  id: spirit.id,
  name: spirit.name,
  title: spirit.title,
  affinity: spirit.affinity,
  temperament: spirit.temperament,
  habitat: spirit.habitat,
  certificateEligible: spirit.certificateEligible
}));

export const MANIFEST_CONTRACTS = {
  routes: {
    public: ['/healthz', '/play', '/embed', '/integration/game-manifest.json'],
    integration: ['/integration/alpha/status', '/integration/alpha/action', '/integration/alpha/enjin/submit']
  },
  alphaPreview: {
    status: 'closed-preview',
    stopPoint: 'alpha-preview-ready',
    websiteEntryPath: '/games/mochi-social',
    accessGateOwner: 'parent-website',
    testerPasswordOwner: 'parent-website',
    authBridgeTokenPolicy: 'short-lived-access-token-only',
    manualPromptReviewRequired: true,
    localEvidenceRequired: true,
    hostedChecksRequireApproval: true,
    providerMutationAllowedByDefault: false,
    fundedChainRequiredForPreview: false,
    enjinCanaryModeBeforeFunding: 'configured-preview-stub'
  },
  cleanRoom: {
    policy: 'project-authored-original-content-only',
    restrictedSourceReferences: false,
    copiedRestrictedSourceCode: false,
    copiedRestrictedSourceNames: false,
    copiedRestrictedSourceLore: false,
    copiedRestrictedSourceMaps: false,
    copiedRestrictedSourceDialogue: false,
    copiedRestrictedSourceFilenames: false,
    copiedRestrictedSourceAssets: false,
    restrictedSourceVisualDerivatives: false,
    scanner: 'npm run clean-room-scan'
  },
  brand: {
    world: 'Mochirii',
    town: 'Jade Lantern Court',
    playerAvatar: 'Mochirii Wayfarer',
    guide: 'Sifu Narao',
    system: 'Mochi Spirits',
    artDirection: 'Mochirii High-Fidelity Wuxia'
  },
  runtimeArt: {
    style: 'smooth illustrated 2D',
    pixelArt: false,
    retro: false,
    tileSizePx: 64,
    townTilesheet: {
      width: 512,
      height: 192
    },
    eventSpritesheet: {
      width: 384,
      height: 768,
      columns: 3,
      rows: 4,
      frameWidth: 128,
      frameHeight: 192
    }
  },
  spirits: {
    system: 'Mochi Spirits',
    habitat: 'Jade Lantern Court',
    roster: spiritRoster
  },
  manualReview: {
    requiredBeforeAlphaPreviewReady: true,
    requiredTargets: [
      {
        id: 'welcome-npc',
        label: 'Welcome NPC dialog',
        actor: 'sifu-narao'
      },
      {
        id: 'guild-seal-chest',
        label: 'Guild seal chest prompt and save feedback',
        actor: 'chest'
      },
      {
        id: 'care-shrine',
        label: 'Habitat care loop prompt',
        actor: 'sifu-narao',
        setupTarget: 'spirit-lirabao'
      }
    ]
  }
} as const;

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
  gameplay: typeof ALPHA_FEATURES.gameplay;
  ugc: typeof ALPHA_FEATURES.ugc;
  routes: typeof MANIFEST_CONTRACTS.routes;
  alphaPreview: typeof MANIFEST_CONTRACTS.alphaPreview;
  cleanRoom: typeof MANIFEST_CONTRACTS.cleanRoom;
  brand: typeof MANIFEST_CONTRACTS.brand;
  runtimeArt: typeof MANIFEST_CONTRACTS.runtimeArt;
  spirits: typeof MANIFEST_CONTRACTS.spirits;
  manualReview: typeof MANIFEST_CONTRACTS.manualReview;
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
    ...ALPHA_FEATURES,
    ...MANIFEST_CONTRACTS
  };
}
