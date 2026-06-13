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
    directTrade: true,
    auctions: false,
    cashout: false
  },
  gameplay: {
    spiritCapture: true,
    spiritAttunement: true,
    routeInvitations: true,
    partyFormation: true,
    fieldExpeditions: true,
    affinityTrials: true,
    battleTactics: true,
    sparringLadder: true,
    trainingBattles: true,
    techniqueMastery: true,
    raisingCare: true,
    roleplayQuests: true,
    spiritJournal: true,
    copiedUpstreamContent: false
  },
  ugc: 'curated'
} as const;

const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback'
} as const;

const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'spirit.capture',
  'spirit.route_invite',
  'spirit.attune',
  'spirit.bond',
  'spirit.care',
  'spirit.journal',
  'world.expedition',
  'spirit.technique',
  'battle.tactic_scroll',
  'party.set',
  'battle.affinity_trial',
  'battle.spar_ladder',
  'spirit.train',
  'spirit.raise',
  'quest.accept',
  'quest.progress',
  'market.fixed_list',
  'trade.direct_offer',
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

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

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

app.post('/integration/alpha/action', async (req, res) => {
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

app.post('/integration/alpha/enjin/submit', async (req, res) => {
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

app.post('/integration/auth/verify', async (req, res) => {
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
    ...ALPHA_FEATURES
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
      : 'Enjin Canary is running as a configured preview stub. The certificate request is recorded with no real value until Fly secrets, Enjin Platform, Fuel Tank, and Wallet Daemon signing are configured.',
    requiredServerEnv: ['ENJIN_PLATFORM_TOKEN', 'ENJIN_COLLECTION_ID', 'ENJIN_FUEL_TANK_ID']
  };
}
