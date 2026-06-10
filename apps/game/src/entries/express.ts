import express, { type Request } from 'express';
import { createServer as createHttpServer } from 'node:http';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRpgServerTransport } from '@rpgjs/server/node';
import { createClient } from '@supabase/supabase-js';
import { WebSocketServer } from 'ws';
import startServer from '../server';

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
  'pet.befriend',
  'pet.care',
  'market.fixed_list',
  'trade.direct_offer',
  'chain.withdraw_request',
  'chain.deposit_request',
  'chain.operation_update'
] as const;

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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

async function appendLocalAlphaLedger(action: AlphaActionEnvelope) {
  const ledgerDir = resolve(process.env.RPG_SAVE_DIR ?? '.local/saves');
  await mkdir(ledgerDir, { recursive: true });
  await appendFile(
    resolve(ledgerDir, 'alpha-ledger.jsonl'),
    `${JSON.stringify({ ...action, receivedAt: new Date().toISOString(), noRealValue: true })}\n`,
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

function getEnjinCanaryConfig() {
  return {
    platformUrl: process.env.ENJIN_PLATFORM_URL || 'https://platform.canary.enjin.io/graphql',
    platformToken: process.env.ENJIN_PLATFORM_TOKEN,
    network: process.env.ENJIN_NETWORK === 'ENJIN' ? 'ENJIN' : 'CANARY',
    collectionId: process.env.ENJIN_COLLECTION_ID,
    fuelTankId: process.env.ENJIN_FUEL_TANK_ID
  };
}

function enjinCanaryReady(config = getEnjinCanaryConfig()) {
  return Boolean(config.platformUrl && config.platformToken && config.network === 'CANARY' && config.collectionId);
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
