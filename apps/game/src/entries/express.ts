import express, { type Request } from 'express';
import { createServer as createHttpServer } from 'node:http';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRpgServerTransport } from '@rpgjs/server/node';
import { createClient } from '@supabase/supabase-js';
import { WebSocketServer } from 'ws';
import startServer from '../server';
import type { EnjinOperatorEnvelope, EnjinOperatorOperation, ValidEnjinOperatorEnvelope } from '../integration/enjin-operator-contract';

const ALPHA_FEATURES = {
  alpha: {
    allowlistRequired: true,
    termsRequired: true,
    noRealValue: true,
    testerAge: '18+',
    access: 'signed-in-allowlist',
    stopPoint: 'alpha-rc-ready'
  },
  economy: {
    mode: 'test-soft-currency',
    hotLedger: 'supabase-postgres',
    coldInventory: 'enjin-managed-wallet',
    realValue: false
  },
  chain: {
    provider: 'enjin',
    network: 'CANARY',
    custody: 'managed-hot-cold',
    finalityRequired: true
  },
  market: {
    fixedPrice: true,
    guildReceipts: true,
    directTrade: true,
    auctions: false,
    cashout: false
  },
  gameplay: {
    spiritCapture: true,
    spiritStarterVows: true,
    spiritCaptureRites: true,
    spiritAttunement: true,
    routeInvitations: true,
    routeMastery: true,
    habitatBonds: true,
    spiritSanctuaryRites: true,
    spiritResearch: true,
    spiritCompendium: true,
    spiritRosterArchives: true,
    spiritCareCycles: true,
    spiritTemperamentConcords: true,
    spiritFieldAlmanacs: true,
    routeEcologySurveys: true,
    spiritEncounterRotations: true,
    spiritEncounterAtlases: true,
    spiritCraftWrits: true,
    tradeExchangeAccords: true,
    routeWaystones: true,
    spiritNurtureRites: true,
    spiritRecoveryTeas: true,
    spiritKinshipAlbums: true,
    spiritNurseryGroves: true,
    spiritBloomAscendances: true,
    spiritLineageRegisters: true,
    partyFormation: true,
    partyHarmony: true,
    harmonyTrials: true,
    teamSparMatches: true,
    mentorChallenges: true,
    dojoLadders: true,
    sifuCouncils: true,
    summitCircuits: true,
    spiritTournamentBrackets: true,
    spiritRivalCircles: true,
    spiritStoryChapters: true,
    battleRoundTranscripts: true,
    conditionWeaves: true,
    fieldExpeditions: true,
    fieldAccords: true,
    routePatrols: true,
    itemProvisions: true,
    guildCommissions: true,
    socialRallies: true,
    wayfarerChronicles: true,
    guildAscensionTrials: true,
    guildInsigniaCases: true,
    affinityTrials: true,
    affinityMatrices: true,
    battleTactics: true,
    techniqueLoadouts: true,
    techniqueCodexes: true,
    spiritTraits: true,
    spiritRelicAttunements: true,
    guildRankTrials: true,
    spiritGrowthRites: true,
    sparringLadder: true,
    trainingBattles: true,
    techniqueMastery: true,
    raisingCare: true,
    bondMilestones: true,
    roleplayQuests: true,
    questChains: true,
    spiritJournal: true,
    copiedUpstreamContent: false
  },
  ugc: 'curated'
} as const;

const PLAYABLE_CONTENT_CATALOG = {
  scope: 'first-court-alpha-preview',
  contentPolicy: 'original-mochirii-feature-parity',
  capture: {
    spiritIds: ['lirabao', 'jintari', 'aozhen'],
    starterVowIds: ['jade-starter-vow'],
    expeditionRouteIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
    fieldAccordIds: ['moonbridge-goldleaf-accord', 'cloudbell-skyvow-accord'],
    routeMasteryIds: ['jade-cloudbell-circuit'],
    routePatrolIds: ['jade-cloudbell-patrol'],
    captureRiteIds: ['jade-court-capture-rite']
  },
  raising: {
    careActionIds: ['tea-ribbon-care'],
    raiseActionIds: ['jade-brush-groom', 'mooncake-share'],
    bondMilestoneIds: [
      'lirabao-lantern-spark',
      'lirabao-ribbon-warmth',
      'lirabao-moonwell-glow',
      'jintari-market-spark',
      'jintari-trade-step',
      'jintari-lacquer-glow',
      'aozhen-skybell-spark',
      'aozhen-reedwind-step',
      'aozhen-cloud-vow-glow'
    ],
    growthRiteIds: ['moonwell-bloom-rite'],
    careCycleIds: ['jade-court-care-cycle'],
    nurtureRiteIds: ['jade-moonwell-nurture-rite'],
    recoveryTeaIds: ['jade-teahouse-recovery'],
    kinshipAlbumIds: ['jade-kinship-album'],
    nurseryGroveIds: ['jade-nursery-grove'],
    bloomAscendanceIds: ['jade-bloom-ascendance'],
    lineageRegisterIds: ['jade-lineage-register']
  },
  battle: {
    moveIds: ['lantern-pulse', 'goldleaf-feint', 'skybell-guard'],
    tacticIds: ['lantern-anchor', 'goldleaf-opening', 'skybell-ward'],
    techniqueLoadoutIds: ['jade-step-loadout'],
    techniqueCodexIds: ['jade-technique-codex'],
    traitAttunementIds: ['jade-heart-trait'],
    conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
    conditionWeaveIds: ['jade-mirror-condition-weave'],
    affinityTrialIds: ['jade-mirror-trial', 'silk-cinder-trial'],
    affinityMatrixIds: ['jade-affinity-matrix'],
    harmonyFormIds: ['triune-jade-harmony'],
    harmonyTrialIds: ['jade-echo-concord'],
    teamSparMatchIds: ['jade-mirror-team-match'],
    mentorChallengeIds: ['silk-banner-mentor-drill'],
    dojoLadderIds: ['jade-dojo-ladder'],
    sparLadderIds: ['jade-echo-apprentice', 'silk-river-disciple'],
    tournamentBracketIds: ['jade-banner-tournament'],
    rivalCircleIds: ['jade-rival-circle'],
    sifuCouncilIds: ['jade-sifu-council'],
    summitCircuitIds: ['jade-summit-circuit']
  },
  roleplay: {
    questChainIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
    storyChapterIds: ['jade-scroll-story-chapter'],
    guildRankTrialIds: ['jade-court-initiate'],
    guildCommissionIds: ['jade-court-commission-ledger'],
    guildSocialRallyIds: ['jade-courtyard-rally'],
    guildWayfarerChronicleIds: ['jade-wayfarer-chronicle'],
    guildAscensionTrialIds: ['jade-court-ascension-trial'],
    guildInsigniaCaseIds: ['jade-insignia-case'],
    habitatBondIds: ['jade-court-habitat-bond'],
    sanctuaryRiteIds: ['jade-court-sanctuary-rite'],
    researchFolioIds: ['jade-court-research-folio'],
    compendiumIds: ['jade-court-spirit-compendium'],
    rosterArchiveIds: ['jade-court-roster-archive'],
    fieldAlmanacIds: ['jade-field-almanac'],
    routeEcologySurveyIds: ['jade-route-ecology-survey'],
    encounterRotationIds: ['jade-encounter-rotation'],
    encounterAtlasIds: ['jade-encounter-atlas'],
    routeWaystoneIds: ['jade-cloudbell-waystone']
  },
  economyAndCanary: {
    provisionSatchelIds: ['jade-court-provision-satchel'],
    craftWritIds: ['jade-court-craft-writ'],
    marketReceiptIds: ['jade-court-market-receipt'],
    tradeExchangeAccordIds: ['jade-exchange-accord'],
    relicAttunementIds: ['jade-relic-attunement'],
    canaryCertificateItemIds: ['lirabao-canary-certificate'],
    canaryActionTypes: ['chain.withdraw_request', 'chain.deposit_request', 'chain.operation_update']
  },
  runtimeAssets: {
    tileSize: 64,
    tilesheet: {
      path: 'src/tiled/mochi-tiles.png',
      width: 512,
      height: 192
    },
    spritesheets: [
      'wayfarer',
      'sifu-narao',
      'chest',
      'spirit-lirabao',
      'spirit-jintari',
      'spirit-aozhen',
      'habitat-grove',
      'party-banner',
      'journal-pavilion',
      'expedition-gate',
      'route-invitation-altar',
      'technique-dojo',
      'tactic-scroll-stand',
      'affinity-dais',
      'market-board',
      'trade-post',
      'training-ring',
      'quest-board',
      'guild-rank-bell',
      'growth-moonwell',
      'canary-shrine'
    ].map((id) => ({
      path: `public/spritesheets/${id}.png`,
      width: 384,
      height: 768,
      framesWidth: 3,
      framesHeight: 4,
      rectWidth: 128,
      rectHeight: 192
    }))
  }
} as const;

const MANIFEST_CONTRACTS = {
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
    roster: [
      {
        id: 'lirabao',
        name: 'Lirabao',
        title: 'Blush-Cloud Mochi Spirit',
        affinity: 'blossom',
        temperament: 'gentle',
        habitat: 'Jade Lantern Court',
        certificateEligible: true
      },
      {
        id: 'jintari',
        name: 'Jintari',
        title: 'Goldleaf Mochi Spirit',
        affinity: 'citrus-gold',
        temperament: 'bright',
        habitat: 'Jade Lantern Court',
        certificateEligible: false
      },
      {
        id: 'aozhen',
        name: 'Aozhen',
        title: 'Sky-Jade Mochi Spirit',
        affinity: 'sky-jade',
        temperament: 'curious',
        habitat: 'Jade Lantern Court',
        certificateEligible: false
      }
    ]
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

const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  progress: 'mochi-social-alpha-progress',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback'
} as const;

const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'spirit.starter_vow',
  'spirit.capture',
  'spirit.capture_rite',
  'spirit.route_invite',
  'world.route_mastery',
  'world.route_patrol',
  'spirit.habitat_bond',
  'spirit.sanctuary_rite',
  'spirit.research',
  'spirit.compendium_complete',
  'spirit.roster_archive',
  'spirit.care_cycle',
  'spirit.temperament_concord',
  'spirit.field_almanac',
  'world.route_ecology',
  'world.encounter_rotation',
  'world.encounter_atlas',
  'item.craft_writ',
  'world.route_waystone',
  'spirit.nurture_rite',
  'spirit.recovery_tea',
  'spirit.kinship_album',
  'spirit.nursery_grove',
  'spirit.bloom_ascendance',
  'spirit.lineage_register',
  'item.provision_satchel',
  'guild.commission_complete',
  'guild.social_rally',
  'guild.wayfarer_chronicle',
  'guild.ascension_trial',
  'spirit.attune',
  'spirit.bond',
  'spirit.care',
  'spirit.journal',
  'world.expedition',
  'spirit.technique',
  'spirit.technique_loadout',
  'battle.technique_codex',
  'spirit.trait_attune',
  'spirit.relic_attune',
  'battle.tactic_scroll',
  'guild.rank_trial',
  'spirit.growth_rite',
  'party.set',
  'party.harmony_form',
  'battle.harmony_trial',
  'battle.team_spar_match',
  'battle.mentor_challenge',
  'battle.dojo_ladder',
  'battle.sifu_council',
  'battle.summit_circuit',
  'battle.tournament_bracket',
  'battle.rival_circle',
  'story.chapter_complete',
  'guild.insignia_case',
  'battle.condition_weave',
  'battle.affinity_trial',
  'battle.affinity_matrix',
  'battle.spar_ladder',
  'spirit.train',
  'spirit.raise',
  'quest.accept',
  'quest.progress',
  'market.fixed_list',
  'market.guild_receipt',
  'trade.direct_offer',
  'trade.exchange_accord',
  'chain.withdraw_request',
  'chain.deposit_request',
  'chain.operation_update'
] as const;

const ENJIN_OPERATOR_OPERATIONS: EnjinOperatorOperation[] = [
  'hot-to-cold-certificate',
  'cold-to-hot-burn',
  'fixed-listing',
  'poll-transaction'
];

type AlphaActionType = (typeof ALPHA_ACTION_TYPES)[number];

interface AlphaActionEnvelope {
  requestId: string;
  type: AlphaActionType;
  playerId?: string;
  payload: Record<string, unknown>;
}

interface EnjinCanaryRuntime {
  provider: 'enjin';
  network: 'CANARY';
  configured: boolean;
  mode: 'configured' | 'configured-preview-stub';
  message: string;
  requiredServerEnv: string[];
}

type EnjinTransactionState = 'PENDING' | 'BROADCAST' | 'FINALIZED' | 'FAILED' | 'ABANDONED' | 'TIMEOUT';

interface EnjinCanaryConfig {
  platformUrl: string;
  platformToken?: string;
  network: 'CANARY';
  collectionId?: string;
  fuelTankId?: string;
}

interface EnjinOperatorInput {
  requestId: string;
  playerId: string;
  tokenId?: string;
  amount?: number;
  itemId?: string;
}

interface EnjinAssetOperatorInput extends EnjinOperatorInput {
  tokenId: string;
  amount: number;
}

interface EnjinSubmittedTransaction {
  uuid: string;
  state: EnjinTransactionState;
  extrinsicHash?: string;
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const clientDistDir = resolve(currentDir, '../client');
const mapDistDir = resolve(clientDistDir, 'assets/data');
const indexHtml = resolve(clientDistDir, 'index.html');
const port = Number(process.env.PORT ?? 3000);
const app = express();
const transport = createRpgServerTransport(startServer, {
  tiledBasePaths: ['map', '/map', 'assets/data', '/assets/data']
});
const integrationJsonLimit = '256kb';
const strictIntegrationJson = express.json({ limit: integrationJsonLimit });

app.disable('x-powered-by');

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-mochi-social-server-token');
  next();
});

app.options(/.*/, (_req, res) => {
  res.sendStatus(204);
});

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    name: 'Mochi Social',
    version: process.env.npm_package_version ?? '0.1.0'
  });
});

app.get('/integration/game-manifest.json', (req, res) => {
  res.json(createGameManifestForExpress(getPublicOrigin(req), process.env.npm_package_version ?? '0.1.0'));
});

app.get('/integration/alpha/status', (_req, res) => {
  const edgeConfig = getSupabaseEdgeConfig();
  const enjinConfig = getEnjinCanaryConfig();
  const enjinRuntime = createEnjinCanaryRuntime(enjinConfig);

  res.json({
    ok: true,
    name: 'Mochi Social',
    alpha: ALPHA_FEATURES.alpha,
    economy: ALPHA_FEATURES.economy,
    chain: ALPHA_FEATURES.chain,
    market: ALPHA_FEATURES.market,
    gameplay: ALPHA_FEATURES.gameplay,
    ugc: ALPHA_FEATURES.ugc,
    supabaseEdgeConfigured: Boolean(edgeConfig.functionsUrl && edgeConfig.serverToken),
    enjinCanaryConfigured: enjinRuntime.configured,
    chainRuntime: enjinRuntime,
    edgeFunctions: ALPHA_EDGE_FUNCTIONS
  });
});

app.get('/integration/alpha/progress', async (req, res) => {
  const accessToken = getBearerToken(req);
  const authResult = await validateSupabaseAccessTokenForExpress(accessToken);
  if (!authResult.ok) {
    res.status(process.env.SUPABASE_AUTH_REQUIRED === 'true' ? 401 : 200).json({
      ok: process.env.SUPABASE_AUTH_REQUIRED !== 'true',
      mode: 'guest-local',
      progress: null,
      message: authResult.error ?? 'Guest progress remains local until a signed-in Supabase session is linked.'
    });
    return;
  }

  if (authResult.mode !== 'linked' || !authResult.userId) {
    res.json({
      ok: true,
      mode: 'guest-local',
      progress: null,
      message: 'Guest progress remains local until a signed-in Supabase session is linked.'
    });
    return;
  }

  const forwarded = await forwardAlphaProgress(authResult.userId);
  res.status(forwarded.status).json(forwarded.body);
});

app.post('/integration/alpha/action', strictIntegrationJson, async (req, res) => {
  const action = req.body;
  if (!isAlphaActionEnvelope(action)) {
    res.status(400).json({
      ok: false,
      error: 'invalid_alpha_action',
      message: 'Alpha action requires requestId, type, and payload.'
    });
    return;
  }

  const accessToken = getBearerToken(req);
  const authResult = await validateSupabaseAccessTokenForExpress(accessToken);
  if (!authResult.ok && process.env.SUPABASE_AUTH_REQUIRED === 'true') {
    res.status(401).json(authResult);
    return;
  }

  const actionWithIdentity: AlphaActionEnvelope = authResult.ok && authResult.mode === 'linked' && authResult.userId
    ? { ...action, playerId: authResult.userId }
    : action;

  const forwarded = await forwardAlphaAction(actionWithIdentity);
  res.status(forwarded.status).json(forwarded.body);
});

app.post('/integration/alpha/enjin/submit', strictIntegrationJson, async (req, res) => {
  const tokenResult = requireGameServerToken(req);
  if (!tokenResult.ok) {
    res.status(tokenResult.status).json({
      ok: false,
      error: tokenResult.error,
      message: tokenResult.message
    });
    return;
  }

  const envelope = req.body;
  if (!isEnjinOperatorEnvelope(envelope)) {
    res.status(400).json({
      ok: false,
      error: 'invalid_enjin_operator_request',
      message: 'Enjin operator submission requires operation, requestId, playerId, and confirmNoRealValue=true. Asset submissions require tokenId and amount; fixed listings require price; polling requires enjinTransactionUuid.'
    });
    return;
  }

  const enjinConfig = getEnjinCanaryConfig();
  const chainRuntime = createEnjinCanaryRuntime(enjinConfig);
  if (!enjinCanaryReady(enjinConfig)) {
    res.status(409).json({
      ok: false,
      error: 'enjin_canary_not_configured',
      chainRuntime,
      message: 'Configure Enjin Canary Platform token, collection, and Fuel Tank before operator submissions.'
    });
    return;
  }

  try {
    const updateAction = await buildEnjinOperatorUpdateAction(envelope);
    const forwarded = await forwardAlphaAction(updateAction as AlphaActionEnvelope);
    res.status(forwarded.status).json({
      ok: forwarded.body.ok === true,
      noRealValue: true,
      chainRuntime,
      operation: envelope.operation,
      updateAction,
      ledger: forwarded.body
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: 'enjin_operator_submission_failed',
      chainRuntime,
      message: error instanceof Error ? error.message : 'Enjin Canary operator submission failed.'
    });
  }
});

app.post('/integration/auth/verify', strictIntegrationJson, async (req, res) => {
  const accessToken = typeof req.body?.accessToken === 'string' ? req.body.accessToken : undefined;
  const result = await validateSupabaseAccessTokenForExpress(accessToken);
  res.status(result.ok ? 200 : 401).json(result);
});

app.use('/parties', async (req, res, next) => {
  const handled = await transport.handleNodeRequest(req, res, next, {
    mountedPath: '/parties'
  });
  if (!handled) next();
});

app.use('/map', express.static(mapDistDir, { index: false }));
app.use(express.static(clientDistDir, { index: false }));

app.get(['/', '/play', '/embed'], (_req, res) => {
  res.sendFile(indexHtml);
});

app.get(/.*/, (_req, res) => {
  res.sendFile(indexHtml);
});

const httpServer = createHttpServer(app);
const wsServer = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
  void transport.handleUpgrade(wsServer, request, socket, head);
});

httpServer.listen(port, () => {
  console.log(`Mochi Social listening on ${port}`);
});

function getPublicOrigin(req: Request) {
  if (process.env.MOCHI_SOCIAL_PUBLIC_ORIGIN) {
    return process.env.MOCHI_SOCIAL_PUBLIC_ORIGIN;
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
  const scheme = proto ?? req.protocol;
  return `${scheme}://${req.headers.host}`;
}

function getAllowedOrigins() {
  const defaults = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
  const configured = process.env.RPG_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [];
  return new Set([...defaults, ...configured].filter(Boolean));
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header || Array.isArray(header)) return undefined;
  return header.replace(/^Bearer\s+/i, '').trim() || undefined;
}

function requireGameServerToken(req: Request) {
  const expected = process.env.MOCHI_SOCIAL_GAME_SERVER_TOKEN;
  if (!expected) {
    return {
      ok: false as const,
      status: 503,
      error: 'enjin_operator_disabled',
      message: 'Set MOCHI_SOCIAL_GAME_SERVER_TOKEN before enabling private Enjin operator submissions.'
    };
  }

  const header = req.headers['x-mochi-social-server-token'];
  const provided = Array.isArray(header) ? header[0] : header;
  if (provided !== expected) {
    return {
      ok: false as const,
      status: 401,
      error: 'invalid_game_server_token',
      message: 'Private Enjin operator submissions require the game server token.'
    };
  }

  return { ok: true as const };
}

function createGameManifestForExpress(origin: string, version: string) {
  const base = origin.replace(/\/+$/, '');

  return {
    name: 'Mochi Social',
    slug: 'mochi-social',
    version,
    origin: base,
    playUrl: `${base}/play`,
    embedUrl: `${base}/embed`,
    healthUrl: `${base}/healthz`,
    bridge: {
      protocolVersion: 1,
      namespace: 'MOCHI_SOCIAL',
      parentToGame: ['MOCHI_SOCIAL_AUTH', 'MOCHI_SOCIAL_SIGN_OUT'],
      gameToParent: ['MOCHI_SOCIAL_READY', 'MOCHI_SOCIAL_AUTH_STATE', 'MOCHI_SOCIAL_ERROR']
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

async function forwardAlphaAction(action: AlphaActionEnvelope): Promise<{ status: number; body: Record<string, unknown> }> {
  const request = buildAlphaActionRequest(action);
  if (request) {
    try {
      const response = await fetch(request.url, request.init);
      const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      return {
        status: response.status,
        body
      };
    } catch (error) {
      return {
        status: 502,
        body: {
          ok: false,
          error: 'alpha_edge_unreachable',
          message: error instanceof Error ? error.message : 'Supabase alpha Edge Function could not be reached.'
        }
      };
    }
  }

  await appendLocalAlphaLedger(action);
  const chainRuntime = action.type.startsWith('chain.') ? createEnjinCanaryRuntime() : undefined;
  return {
    status: 202,
    body: {
      ok: true,
      mode: 'local-alpha-ledger',
      noRealValue: true,
      ...(chainRuntime ? { chainRuntime } : {}),
      message: 'Alpha action recorded locally. Configure Mochirii Supabase Edge Functions for authoritative preview writes.'
    }
  };
}

async function forwardAlphaProgress(playerId: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const request = buildAlphaProgressRequest(playerId);
  if (!request) {
    return {
      status: 503,
      body: {
        ok: false,
        error: 'alpha_progress_edge_not_configured',
        message: 'Signed-in account progress requires Mochirii Supabase Edge Functions and a scoped game server token.'
      }
    };
  }

  try {
    const response = await fetch(request.url, request.init);
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      status: response.status,
      body
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        ok: false,
        error: 'alpha_progress_edge_unreachable',
        message: error instanceof Error ? error.message : 'Mochirii Supabase alpha progress could not be reached.'
      }
    };
  }
}

async function buildEnjinOperatorUpdateAction(envelope: ValidEnjinOperatorEnvelope) {
  const baseInput = {
    requestId: envelope.requestId,
    playerId: envelope.playerId,
    itemId: envelope.itemId || 'lirabao-canary-certificate'
  };

  if (envelope.operation === 'poll-transaction') {
    const transaction = await pollEnjinTransaction(envelope.enjinTransactionUuid);
    return buildPolledChainOperationUpdateAction({
      ...baseInput,
      tokenId: envelope.tokenId,
      amount: envelope.amount
    }, transaction);
  }

  const input = {
    ...baseInput,
    tokenId: envelope.tokenId,
    amount: envelope.amount
  };

  if (envelope.operation === 'hot-to-cold-certificate') {
    return submitHotToColdCertificateProof(input);
  }

  if (envelope.operation === 'cold-to-hot-burn') {
    return submitColdToHotBurnProof(input);
  }

  if (envelope.operation === 'fixed-listing') {
    return submitFixedListingProof({ ...input, price: envelope.price });
  }

  throw new Error(`Unsupported Enjin operator operation: ${envelope.operation}`);
}

async function appendLocalAlphaLedger(action: AlphaActionEnvelope) {
  const ledgerDir = resolve(process.env.RPG_SAVE_DIR ?? '.local/saves');
  await mkdir(ledgerDir, { recursive: true });
  await appendFile(
    resolve(ledgerDir, 'alpha-ledger.jsonl'),
    `${JSON.stringify({
      ledgerVersion: 1,
      source: 'local-alpha-ledger',
      alphaStopPoint: 'alpha-rc-ready',
      chainNetwork: 'CANARY',
      noRealValue: true,
      receivedAt: new Date().toISOString(),
      ...action
    })}\n`,
    'utf8'
  );
}

async function validateSupabaseAccessTokenForExpress(accessToken: string | undefined) {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const required = process.env.SUPABASE_AUTH_REQUIRED === 'true';

  if (!url || !publishableKey) {
    return required
      ? { ok: false, mode: 'guest', error: 'Supabase auth is required but not configured.' }
      : { ok: true, mode: 'guest' };
  }

  if (!accessToken) {
    return required ? { ok: false, mode: 'guest', error: 'Missing Supabase access token.' } : { ok: true, mode: 'guest' };
  }

  const supabase = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return { ok: false, mode: 'guest', error: error?.message ?? 'Supabase token did not resolve to a user.' };
  }

  return { ok: true, mode: 'linked', userId: data.user.id };
}

function isAlphaActionEnvelope(value: unknown): value is AlphaActionEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AlphaActionEnvelope>;
  return (
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 8 &&
    typeof candidate.type === 'string' &&
    ALPHA_ACTION_TYPES.includes(candidate.type as AlphaActionType) &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null
  );
}

function isEnjinOperatorEnvelope(value: unknown): value is ValidEnjinOperatorEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as EnjinOperatorEnvelope;

  if (!hasBaseOperatorFields(candidate)) return false;

  if (candidate.operation === 'poll-transaction') {
    return typeof candidate.enjinTransactionUuid === 'string' && candidate.enjinTransactionUuid.length > 8;
  }

  if (!hasTokenAmountFields(candidate)) return false;

  if (candidate.operation === 'fixed-listing') {
    return typeof candidate.price === 'string' && /^\d+$/.test(candidate.price);
  }

  return candidate.operation === 'hot-to-cold-certificate' || candidate.operation === 'cold-to-hot-burn';
}

function hasBaseOperatorFields(candidate: EnjinOperatorEnvelope) {
  return (
    typeof candidate.operation === 'string' &&
    ENJIN_OPERATOR_OPERATIONS.includes(candidate.operation) &&
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 8 &&
    typeof candidate.playerId === 'string' &&
    candidate.playerId.length > 8 &&
    candidate.confirmNoRealValue === true
  );
}

function hasTokenAmountFields(candidate: EnjinOperatorEnvelope) {
  return (
    typeof candidate.tokenId === 'string' &&
    candidate.tokenId.length > 0 &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0
  );
}

function getSupabaseEdgeConfig() {
  return {
    functionsUrl: process.env.MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL,
    serverToken: process.env.MOCHI_SOCIAL_GAME_SERVER_TOKEN
  };
}

function buildAlphaActionRequest(action: AlphaActionEnvelope) {
  const config = getSupabaseEdgeConfig();
  if (!config.functionsUrl || !config.serverToken) return null;

  return {
    url: `${config.functionsUrl.replace(/\/+$/, '')}/${ALPHA_EDGE_FUNCTIONS.action}`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mochi-social-server-token': config.serverToken
      },
      body: JSON.stringify(action)
    }
  };
}

function buildAlphaProgressRequest(playerId: string) {
  const config = getSupabaseEdgeConfig();
  if (!config.functionsUrl || !config.serverToken) return null;

  return {
    url: `${config.functionsUrl.replace(/\/+$/, '')}/${ALPHA_EDGE_FUNCTIONS.progress}`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mochi-social-server-token': config.serverToken
      },
      body: JSON.stringify({ playerId })
    }
  };
}

function getEnjinCanaryConfig(): EnjinCanaryConfig {
  return {
    platformUrl: process.env.ENJIN_PLATFORM_URL || 'https://platform.canary.enjin.io/graphql',
    platformToken: process.env.ENJIN_PLATFORM_TOKEN,
    network: 'CANARY',
    collectionId: process.env.ENJIN_COLLECTION_ID,
    fuelTankId: process.env.ENJIN_FUEL_TANK_ID
  };
}

function enjinCanaryReady(config = getEnjinCanaryConfig()) {
  return Boolean(config.platformUrl && config.platformToken && config.network === 'CANARY' && config.collectionId && config.fuelTankId);
}

function buildManagedWalletExternalId(playerId: string) {
  return `mochi-social-alpha:${playerId}`;
}

async function executeEnjinGraphql(operation: string, query: string, variables: Record<string, unknown>, config = getEnjinCanaryConfig()) {
  if (!enjinCanaryReady(config)) {
    throw new Error('Enjin Canary is not ready. Configure Platform token, Canary collection, and Fuel Tank before submitting operations.');
  }

  const response = await fetch(config.platformUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.platformToken}`
    },
    body: JSON.stringify({ query, variables })
  });
  const body = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    throw new Error(`Enjin Platform ${operation} failed with HTTP ${response.status}.`);
  }
  if (hasGraphqlErrors(body)) {
    throw new Error(`Enjin Platform ${operation} failed: ${body.errors.map((error) => error.message).join('; ')}`);
  }
  return responseData(body);
}

async function ensureManagedWallet(playerId: string, config = getEnjinCanaryConfig()) {
  const externalId = buildManagedWalletExternalId(playerId);
  await executeEnjinGraphql(
    'create-managed-wallet',
    `
mutation MochiSocialCreateManagedWallet($externalId: String!) {
  CreateManagedWallet(externalId: $externalId)
}`.trim(),
    { externalId },
    config
  );

  const data = await executeEnjinGraphql(
    'get-managed-wallet',
    `
query MochiSocialGetManagedWallet($externalId: String!) {
  GetManagedWallet(network: ${config.network}, chain: MATRIX, externalId: $externalId) {
    publicKey
    externalId
  }
}`.trim(),
    { externalId },
    config
  );
  const wallet = data.GetManagedWallet as { publicKey?: unknown; externalId?: unknown } | null | undefined;
  if (!wallet?.publicKey || !wallet.externalId) {
    throw new Error('Enjin managed wallet lookup did not return publicKey and externalId.');
  }
  return {
    publicKey: String(wallet.publicKey),
    externalId: String(wallet.externalId)
  };
}

async function submitHotToColdCertificateProof(input: EnjinAssetOperatorInput) {
  const config = getEnjinCanaryConfig();
  const wallet = await ensureManagedWallet(input.playerId, config);
  const transaction = parseSubmittedTransaction(await executeEnjinGraphql(
    'hot-to-cold-mint',
    `
mutation MochiSocialMoveToCold($recipient: String!, $collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
    transaction: {
      mintToken: {
        recipient: $recipient
        collectionId: $collectionId
        tokenId: $tokenId
        amount: $amount
      }
    }
  ) {
    uuid
    state
    extrinsicHash
  }
}`.trim(),
    {
      recipient: wallet.publicKey,
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    },
    config
  ));
  return buildChainOperationUpdateAction(input, transaction);
}

async function submitColdToHotBurnProof(input: EnjinAssetOperatorInput) {
  const config = getEnjinCanaryConfig();
  await ensureManagedWallet(input.playerId, config);
  const transaction = parseSubmittedTransaction(await executeEnjinGraphql(
    'cold-to-hot-burn',
    `
mutation MochiSocialMoveToHot($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $signerExternalId: String!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
    transaction: {
      burnToken: {
        collectionId: $collectionId
        tokenId: $tokenId
        amount: $amount
        removeTokenStorage: false
      }
    }
  ) {
    uuid
    state
    extrinsicHash
  }
}`.trim(),
    {
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      signerExternalId: buildManagedWalletExternalId(input.playerId),
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    },
    config
  ));
  return buildChainOperationUpdateAction(input, transaction);
}

async function submitFixedListingProof(input: EnjinAssetOperatorInput & { price: string }) {
  const config = getEnjinCanaryConfig();
  await ensureManagedWallet(input.playerId, config);
  const transaction = parseSubmittedTransaction(await executeEnjinGraphql(
    'fixed-listing',
    `
mutation MochiSocialFixedListing($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $price: BigInt!, $signerExternalId: String!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
    transaction: {
      createListing: {
        makeAssetId: { collectionId: $collectionId, tokenId: $tokenId }
        takeAssetId: { collectionId: 0, tokenId: 0 }
        amount: $amount
        price: $price
        usesWhitelist: false
        listingData: { type: FIXED_PRICE }
      }
    }
  ) {
    uuid
    action
    state
    extrinsicHash
  }
}`.trim(),
    {
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      price: input.price,
      signerExternalId: buildManagedWalletExternalId(input.playerId),
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    },
    config
  ));
  return buildChainOperationUpdateAction(input, transaction);
}

async function pollEnjinTransaction(enjinTransactionUuid: string) {
  const config = getEnjinCanaryConfig();
  return parseSubmittedTransaction(
    await executeEnjinGraphql(
      'get-transaction',
      `
query MochiSocialGetTransaction($uuid: String!) {
  GetTransaction(network: ${config.network}, uuid: $uuid) {
    uuid
    state
    extrinsicHash
  }
}`.trim(),
      { uuid: enjinTransactionUuid },
      config
    ),
    'GetTransaction'
  );
}

function buildChainOperationUpdateAction(input: EnjinOperatorInput, transaction: EnjinSubmittedTransaction) {
  return {
    requestId: `${input.requestId}:enjin-submit`,
    type: 'chain.operation_update',
    playerId: input.playerId,
    payload: {
      chainRequestId: input.requestId,
      transactionState: transaction.state,
      enjinTransactionUuid: transaction.uuid,
      extrinsicHash: transaction.extrinsicHash,
      itemId: input.itemId,
      tokenId: input.tokenId,
      amount: input.amount,
      noRealValue: true,
      chainNetwork: 'CANARY'
    }
  } as const;
}

function buildPolledChainOperationUpdateAction(input: EnjinOperatorInput, transaction: EnjinSubmittedTransaction) {
  return {
    requestId: `${input.requestId}:enjin-poll:${Date.now().toString(36)}`,
    type: 'chain.operation_update',
    playerId: input.playerId,
    payload: {
      chainRequestId: input.requestId,
      transactionState: transaction.state,
      enjinTransactionUuid: transaction.uuid,
      extrinsicHash: transaction.extrinsicHash,
      itemId: input.itemId,
      tokenId: input.tokenId,
      amount: input.amount,
      noRealValue: true,
      chainNetwork: 'CANARY'
    }
  } as const;
}

function parseSubmittedTransaction(data: Record<string, unknown>, fieldName = 'CreateTransaction'): EnjinSubmittedTransaction {
  const transaction = data[fieldName] as { uuid?: unknown; state?: unknown; extrinsicHash?: unknown } | null | undefined;
  const state = normalizeEnjinTransactionState(String(transaction?.state || ''));
  if (!transaction?.uuid || !state) {
    throw new Error(`Enjin ${fieldName} response did not include a supported uuid/state pair.`);
  }
  return {
    uuid: String(transaction.uuid),
    state,
    extrinsicHash: transaction.extrinsicHash ? String(transaction.extrinsicHash) : undefined
  };
}

function normalizeEnjinTransactionState(state: string): EnjinTransactionState | null {
  const normalized = state.trim().toUpperCase();
  if (['PENDING', 'BROADCAST', 'FINALIZED', 'FAILED', 'ABANDONED', 'TIMEOUT'].includes(normalized)) {
    return normalized as EnjinTransactionState;
  }
  return null;
}

function hasGraphqlErrors(value: unknown): value is { errors: { message: string }[] } {
  const candidate = value as { errors?: unknown };
  return Array.isArray(candidate?.errors) && candidate.errors.some((error) => typeof (error as { message?: unknown }).message === 'string');
}

function responseData(value: unknown) {
  const candidate = value as { data?: unknown };
  if (!candidate?.data || typeof candidate.data !== 'object') {
    throw new Error('Enjin Platform response did not include data.');
  }
  return candidate.data as Record<string, unknown>;
}

function createEnjinCanaryRuntime(config = getEnjinCanaryConfig()): EnjinCanaryRuntime {
  const configured = enjinCanaryReady(config);
  return {
    provider: 'enjin',
    network: 'CANARY',
    configured,
    mode: configured ? 'configured' : 'configured-preview-stub',
    message: configured
      ? 'Enjin Canary is configured for operator-verified hot/cold proof submission.'
      : 'Enjin Canary is running as a configured preview stub. Chain requests are recorded with no real value until Fly secrets, Enjin Platform, Fuel Tank, and Wallet Daemon signing are configured.',
    requiredServerEnv: ['ENJIN_PLATFORM_TOKEN', 'ENJIN_COLLECTION_ID', 'ENJIN_FUEL_TANK_ID']
  };
}
