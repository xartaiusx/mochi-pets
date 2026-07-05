import { ALPHA_EDGE_FUNCTIONS, ALPHA_FEATURES } from './alpha-contract';
import { BRIDGE_EVENTS, MOCHI_PETS_PROTOCOL_VERSION } from './protocol';

export const UNITY_SHARED_ROOM_CONTRACT = {
  engine: 'unity-webgl',
  room: {
    key: 'jade-lantern-room-alpha',
    name: 'Jade Lantern Room',
    scene: 'JadeLanternRoom',
    mode: 'single-shared-room',
    capacity: 25,
    sharedPetKey: 'lirabao'
  },
  runtime: {
    renderer: 'unity-6000.5-urp-webgl',
    targetPlatform: 'desktop-browser-webgl',
    realtimeAuthority: 'ugs-distributed-authority',
    sessionService: 'unity-multiplayer-services',
    authentication: 'unity-authentication-custom-id',
    stateAuthority: 'ugs-cloud-save',
    playerState: 'ugs-cloud-save-player-data',
    sharedState: 'ugs-cloud-code-cloud-save-game-data',
    multiplayerHosting: 'not-used-v1'
  },
  state: {
    playerCharacterKey: 'character.v1',
    sharedPetKey: 'room:jade-lantern-room/sharedPet.v1',
    liveAvatarTransformsDurable: false,
    liveEmotesDurable: false
  },
  characterPresets: {
    mode: 'curated-presets',
    count: 3,
    avatarUploads: false,
    presetIds: ['jade_wayfarer', 'lotus_guardian', 'lantern_scholar']
  },
  sharedPet: {
    key: 'lirabao',
    name: 'Lirabao',
    universalStarter: true,
    states: ['idle', 'approach', 'happy', 'care_received', 'stale_revision_reload', 'unavailable'],
    stateAuthority: 'cloud-code-authoritative-save'
  },
  avatarUploads: false
} as const;

export const MANIFEST_CONTRACTS = {
  routes: {
    public: ['/healthz', '/play', '/embed', '/integration/game-manifest.json'],
    integration: ['/integration/alpha/status', '/integration/alpha/progress', '/integration/alpha/action']
  },
  progress: {
    authority: 'mochirii-edge',
    linkedAccount: true,
    guestFallback: true,
    snapshotEndpoint: '/integration/alpha/progress',
    accountMode: 'signed-in-supabase',
    guestMode: 'local-session-only'
  },
  alphaPreview: {
    status: 'closed-preview',
    stopPoint: 'alpha-preview-ready',
    websiteEntryPath: '/games/mochi-pets',
    accessGateOwner: 'parent-website',
    testerPasswordOwner: 'parent-website',
    authBridgeTokenPolicy: 'short-lived-access-token-only',
    localEvidenceRequired: true,
    hostedChecksRequireApproval: true,
    providerMutationAllowedByDefault: false,
    fundedChainRequiredForPreview: false
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
    room: 'Jade Lantern Room',
    sharedPet: 'Lirabao',
    artDirection: 'Mochirii courtyard 3D'
  },
  gameplay: {
    scope: 'single-shared-room',
    desktopWebgl: true,
    movement: true,
    cameraFollow: true,
    emotes: true,
    localSocialSignal: true,
    lirabaoCare: true,
    staleRevisionReload: true
  },
  edgeFunctions: ALPHA_EDGE_FUNCTIONS
} as const;

export interface GameManifest {
  name: 'Mochi Pets';
  slug: 'mochi-pets';
  version: string;
  engine: typeof UNITY_SHARED_ROOM_CONTRACT.engine;
  origin: string;
  playUrl: string;
  embedUrl: string;
  healthUrl: string;
  room: typeof UNITY_SHARED_ROOM_CONTRACT.room;
  runtime: typeof UNITY_SHARED_ROOM_CONTRACT.runtime;
  state: typeof UNITY_SHARED_ROOM_CONTRACT.state;
  characterPresets: typeof UNITY_SHARED_ROOM_CONTRACT.characterPresets;
  sharedPet: typeof UNITY_SHARED_ROOM_CONTRACT.sharedPet;
  avatarUploads: typeof UNITY_SHARED_ROOM_CONTRACT.avatarUploads;
  bridge: {
    protocolVersion: number;
    namespace: 'MOCHI_PETS';
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
  ugc: typeof ALPHA_FEATURES.ugc;
  routes: typeof MANIFEST_CONTRACTS.routes;
  progress: typeof MANIFEST_CONTRACTS.progress;
  alphaPreview: typeof MANIFEST_CONTRACTS.alphaPreview;
  cleanRoom: typeof MANIFEST_CONTRACTS.cleanRoom;
  brand: typeof MANIFEST_CONTRACTS.brand;
  gameplay: typeof MANIFEST_CONTRACTS.gameplay;
  edgeFunctions: typeof MANIFEST_CONTRACTS.edgeFunctions;
}

function trimTrailingSlash(origin: string) {
  return origin.replace(/\/+$/, '');
}

export function createGameManifest(origin: string, version = '0.1.0'): GameManifest {
  const base = trimTrailingSlash(origin);

  return {
    name: 'Mochi Pets',
    slug: 'mochi-pets',
    version,
    origin: base,
    playUrl: `${base}/play`,
    embedUrl: `${base}/embed`,
    healthUrl: `${base}/healthz`,
    bridge: {
      protocolVersion: MOCHI_PETS_PROTOCOL_VERSION,
      namespace: 'MOCHI_PETS',
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
    ...MANIFEST_CONTRACTS,
    ...UNITY_SHARED_ROOM_CONTRACT
  };
}
