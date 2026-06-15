import { BRIDGE_EVENTS, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';
import { ALPHA_FEATURES } from './alpha-contract';
import {
  GUILD_ASCENSION_TRIALS,
  GUILD_COMMISSIONS,
  GUILD_INSIGNIA_CASES,
  GUILD_RANK_TRIALS,
  GUILD_SOCIAL_RALLIES,
  GUILD_WAYFARER_CHRONICLES,
  MARKET_GUILD_RECEIPTS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  MOCHI_STORY_CHAPTERS,
  RUNTIME_ASSET_MANIFEST,
  SPIRIT_AFFINITY_MATRICES,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_BATTLE_CONDITIONS,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_BLOOM_ASCENDANCES,
  SPIRIT_BOND_MILESTONES,
  SPIRIT_CAPTURE_RITES,
  SPIRIT_CARE_ACTIONS,
  SPIRIT_CARE_CYCLES,
  SPIRIT_COMPENDIUMS,
  SPIRIT_CONDITION_WEAVES,
  SPIRIT_CRAFT_WRITS,
  SPIRIT_DOJO_LADDERS,
  SPIRIT_ENCOUNTER_ATLASES,
  SPIRIT_ENCOUNTER_ROTATIONS,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_FIELD_ACCORDS,
  SPIRIT_FIELD_ALMANACS,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_KINSHIP_ALBUMS,
  SPIRIT_LINEAGE_REGISTERS,
  SPIRIT_MENTOR_CHALLENGES,
  SPIRIT_MOVES,
  SPIRIT_NURSERY_GROVES,
  SPIRIT_NURTURE_RITES,
  SPIRIT_PROVISION_SATCHELS,
  SPIRIT_RAISE_ACTIONS,
  SPIRIT_RECOVERY_TEAS,
  SPIRIT_RELIC_ATTUNEMENTS,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_RIVAL_CIRCLES,
  SPIRIT_ROSTER_ARCHIVES,
  SPIRIT_ROUTE_ECOLOGY_SURVEYS,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_ROUTE_PATROLS,
  SPIRIT_ROUTE_WAYSTONES,
  SPIRIT_SANCTUARY_RITES,
  SPIRIT_SIFU_COUNCILS,
  SPIRIT_SPAR_LADDER,
  SPIRIT_STARTER_VOWS,
  SPIRIT_SUMMIT_CIRCUITS,
  SPIRIT_TEAM_SPAR_MATCHES,
  SPIRIT_TECHNIQUE_CODEXES,
  SPIRIT_TECHNIQUE_LOADOUTS,
  SPIRIT_TOURNAMENT_BRACKETS,
  SPIRIT_TRAIT_ATTUNEMENTS,
  TRADE_EXCHANGE_ACCORDS
} from '../alpha/content';

function idsFrom<T extends { id: string }>(entries: readonly T[]) {
  return entries.map((entry) => entry.id);
}

const spiritRoster = MOCHI_SPIRITS.map((spirit) => ({
  id: spirit.id,
  name: spirit.name,
  title: spirit.title,
  affinity: spirit.affinity,
  temperament: spirit.temperament,
  habitat: spirit.habitat,
  certificateEligible: spirit.certificateEligible
}));

export const PLAYABLE_CONTENT_CATALOG = {
  scope: 'first-court-alpha-preview',
  contentPolicy: 'original-mochirii-feature-parity',
  capture: {
    spiritIds: idsFrom(MOCHI_SPIRITS),
    starterVowIds: idsFrom(SPIRIT_STARTER_VOWS),
    expeditionRouteIds: idsFrom(SPIRIT_EXPEDITION_ROUTES),
    fieldAccordIds: idsFrom(SPIRIT_FIELD_ACCORDS),
    routeMasteryIds: idsFrom(SPIRIT_ROUTE_MASTERIES),
    routePatrolIds: idsFrom(SPIRIT_ROUTE_PATROLS),
    captureRiteIds: idsFrom(SPIRIT_CAPTURE_RITES)
  },
  raising: {
    careActionIds: Object.values(SPIRIT_CARE_ACTIONS).map((action) => action.id),
    raiseActionIds: Object.values(SPIRIT_RAISE_ACTIONS).map((action) => action.id),
    bondMilestoneIds: Object.values(SPIRIT_BOND_MILESTONES).map((milestone) => milestone.id),
    growthRiteIds: idsFrom(SPIRIT_GROWTH_RITES),
    careCycleIds: idsFrom(SPIRIT_CARE_CYCLES),
    nurtureRiteIds: idsFrom(SPIRIT_NURTURE_RITES),
    recoveryTeaIds: idsFrom(SPIRIT_RECOVERY_TEAS),
    kinshipAlbumIds: idsFrom(SPIRIT_KINSHIP_ALBUMS),
    nurseryGroveIds: idsFrom(SPIRIT_NURSERY_GROVES),
    bloomAscendanceIds: idsFrom(SPIRIT_BLOOM_ASCENDANCES),
    lineageRegisterIds: idsFrom(SPIRIT_LINEAGE_REGISTERS)
  },
  battle: {
    moveIds: Object.values(SPIRIT_MOVES).map((move) => move.id),
    tacticIds: idsFrom(SPIRIT_BATTLE_TACTICS),
    techniqueLoadoutIds: idsFrom(SPIRIT_TECHNIQUE_LOADOUTS),
    techniqueCodexIds: idsFrom(SPIRIT_TECHNIQUE_CODEXES),
    traitAttunementIds: idsFrom(SPIRIT_TRAIT_ATTUNEMENTS),
    conditionIds: idsFrom(SPIRIT_BATTLE_CONDITIONS),
    conditionWeaveIds: idsFrom(SPIRIT_CONDITION_WEAVES),
    affinityTrialIds: idsFrom(SPIRIT_AFFINITY_TRIALS),
    affinityMatrixIds: idsFrom(SPIRIT_AFFINITY_MATRICES),
    harmonyFormIds: idsFrom(SPIRIT_HARMONY_FORMS),
    harmonyTrialIds: idsFrom(SPIRIT_HARMONY_TRIALS),
    teamSparMatchIds: idsFrom(SPIRIT_TEAM_SPAR_MATCHES),
    mentorChallengeIds: idsFrom(SPIRIT_MENTOR_CHALLENGES),
    dojoLadderIds: idsFrom(SPIRIT_DOJO_LADDERS),
    sparLadderIds: idsFrom(SPIRIT_SPAR_LADDER),
    tournamentBracketIds: idsFrom(SPIRIT_TOURNAMENT_BRACKETS),
    rivalCircleIds: idsFrom(SPIRIT_RIVAL_CIRCLES),
    sifuCouncilIds: idsFrom(SPIRIT_SIFU_COUNCILS),
    summitCircuitIds: idsFrom(SPIRIT_SUMMIT_CIRCUITS)
  },
  roleplay: {
    questChainIds: idsFrom(MOCHI_SPIRIT_QUESTS),
    storyChapterIds: idsFrom(MOCHI_STORY_CHAPTERS),
    guildRankTrialIds: idsFrom(GUILD_RANK_TRIALS),
    guildCommissionIds: idsFrom(GUILD_COMMISSIONS),
    guildSocialRallyIds: idsFrom(GUILD_SOCIAL_RALLIES),
    guildWayfarerChronicleIds: idsFrom(GUILD_WAYFARER_CHRONICLES),
    guildAscensionTrialIds: idsFrom(GUILD_ASCENSION_TRIALS),
    guildInsigniaCaseIds: idsFrom(GUILD_INSIGNIA_CASES),
    habitatBondIds: idsFrom(SPIRIT_HABITAT_BONDS),
    sanctuaryRiteIds: idsFrom(SPIRIT_SANCTUARY_RITES),
    researchFolioIds: idsFrom(SPIRIT_RESEARCH_FOLIOS),
    compendiumIds: idsFrom(SPIRIT_COMPENDIUMS),
    rosterArchiveIds: idsFrom(SPIRIT_ROSTER_ARCHIVES),
    fieldAlmanacIds: idsFrom(SPIRIT_FIELD_ALMANACS),
    routeEcologySurveyIds: idsFrom(SPIRIT_ROUTE_ECOLOGY_SURVEYS),
    encounterRotationIds: idsFrom(SPIRIT_ENCOUNTER_ROTATIONS),
    encounterAtlasIds: idsFrom(SPIRIT_ENCOUNTER_ATLASES),
    routeWaystoneIds: idsFrom(SPIRIT_ROUTE_WAYSTONES)
  },
  economyAndCanary: {
    provisionSatchelIds: idsFrom(SPIRIT_PROVISION_SATCHELS),
    craftWritIds: idsFrom(SPIRIT_CRAFT_WRITS),
    marketReceiptIds: idsFrom(MARKET_GUILD_RECEIPTS),
    tradeExchangeAccordIds: idsFrom(TRADE_EXCHANGE_ACCORDS),
    relicAttunementIds: idsFrom(SPIRIT_RELIC_ATTUNEMENTS),
    canaryCertificateItemIds: ['lirabao-canary-certificate'],
    canaryActionTypes: ['chain.withdraw_request', 'chain.deposit_request', 'chain.operation_update']
  },
  runtimeAssets: RUNTIME_ASSET_MANIFEST
} as const;

export const MANIFEST_CONTRACTS = {
  routes: {
    public: ['/healthz', '/play', '/embed', '/integration/game-manifest.json'],
    integration: ['/integration/alpha/status', '/integration/alpha/progress', '/integration/alpha/action', '/integration/alpha/enjin/submit']
  },
  progress: {
    authority: 'mochirii-edge',
    linkedAccount: true,
    guestFallback: true,
    snapshotEndpoint: '/integration/alpha/progress',
    accountMode: 'signed-in-supabase',
    guestMode: 'local-file-and-local-storage'
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
  playableContent: PLAYABLE_CONTENT_CATALOG,
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
  progress: typeof MANIFEST_CONTRACTS.progress;
  alphaPreview: typeof MANIFEST_CONTRACTS.alphaPreview;
  cleanRoom: typeof MANIFEST_CONTRACTS.cleanRoom;
  brand: typeof MANIFEST_CONTRACTS.brand;
  runtimeArt: typeof MANIFEST_CONTRACTS.runtimeArt;
  spirits: typeof MANIFEST_CONTRACTS.spirits;
  playableContent: typeof MANIFEST_CONTRACTS.playableContent;
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
