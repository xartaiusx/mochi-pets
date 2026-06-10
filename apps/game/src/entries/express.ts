import express, { type Request } from 'express';
import { createServer as createHttpServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRpgServerTransport } from '@rpgjs/server/node';
import { createClient } from '@supabase/supabase-js';
import { WebSocketServer } from 'ws';
import startServer from '../server';

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
      mode: 'guest-first',
      tokenPolicy: 'access-token-only'
    }
  };
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
