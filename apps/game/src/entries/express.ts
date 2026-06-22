import express, { type Request } from 'express';
import { createServer as createHttpServer } from 'node:http';
import { existsSync } from 'node:fs';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
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
    stopPoint: 'alpha-preview-ready'
  },
  gameplay: {
    sharedRoom: true,
    desktopWebgl: true,
    curatedCharacterPresets: true,
    movement: true,
    cameraFollow: true,
    emotes: true,
    localSocialSignal: true,
    lirabaoCare: true,
    staleRevisionReload: true,
    avatarUploads: false,
    multipleRooms: false,
    sharding: false,
    mobileSpecificUi: false
  },
  ugc: 'curated'
} as const;

const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  progress: 'mochi-social-alpha-progress',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback',
  unityAuth: 'mochi-social-unity-auth'
} as const;

const MANIFEST_CONTRACTS = {
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
    websiteEntryPath: '/games/mochi-social',
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

const UNITY_SHARED_ROOM_CONTRACT = {
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
  edgeFunctions: {
    unityAuth: 'mochi-social-unity-auth',
    action: 'mochi-social-alpha-action',
    progress: 'mochi-social-alpha-progress',
    feedback: 'submit-mochi-social-feedback'
  },
  avatarUploads: false
} as const;

const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'unity.character.created',
  'unity.character.updated',
  'unity.pet.interaction',
  'unity.pet.state_saved',
  'unity.room.joined',
  'unity.room.left'
] as const;

type AlphaActionType = (typeof ALPHA_ACTION_TYPES)[number];

interface AlphaActionEnvelope {
  requestId: string;
  type: AlphaActionType;
  playerId?: string;
  payload: Record<string, unknown>;
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRootDir = resolve(currentDir, '../../../..');
const clientDistDir = resolve(currentDir, '../client');
const mapDistDir = resolve(clientDistDir, 'assets/data');
const indexHtml = resolve(clientDistDir, 'index.html');
const unityWebglDir = process.env.MOCHI_SOCIAL_UNITY_WEBGL_DIR
  ? resolve(process.env.MOCHI_SOCIAL_UNITY_WEBGL_DIR)
  : resolve(repoRootDir, 'unity/Builds/WebGL');
const unityIndexHtml = resolve(unityWebglDir, 'index.html');
const unityWebglBuildPresent = existsSync(unityIndexHtml);
const unityWebglRequired = process.env.MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL === 'true' ||
  (process.env.MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL !== 'false' && process.env.NODE_ENV === 'production');
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
  const unityServing = getUnityServingStatus();
  const ok = !unityWebglRequired || unityWebglBuildPresent;
  res.status(ok ? 200 : 503).json({
    ok,
    name: 'Mochi Social',
    version: process.env.npm_package_version ?? '0.1.0',
    activeRuntime: unityServing.activeRuntime,
    unityWebglBuild: unityServing.unityWebglBuild,
    legacyFallback: unityServing.legacyFallback
  });
});

app.get('/integration/game-manifest.json', (req, res) => {
  const manifest = {
    ...createGameManifestForExpress(getPublicOrigin(req), process.env.npm_package_version ?? '0.1.0'),
    ...getUnityServingStatus()
  };
  assertNoFutureSystemKeys(manifest, 'game manifest');
  res.json(manifest);
});

app.get('/integration/alpha/status', (_req, res) => {
  const edgeConfig = getSupabaseEdgeConfig();

  const status = {
    ok: true,
    name: 'Mochi Social',
    alpha: ALPHA_FEATURES.alpha,
    gameplay: ALPHA_FEATURES.gameplay,
    ugc: ALPHA_FEATURES.ugc,
    engine: UNITY_SHARED_ROOM_CONTRACT.engine,
    room: UNITY_SHARED_ROOM_CONTRACT.room,
    runtime: UNITY_SHARED_ROOM_CONTRACT.runtime,
    state: UNITY_SHARED_ROOM_CONTRACT.state,
    characterPresets: UNITY_SHARED_ROOM_CONTRACT.characterPresets,
    sharedPet: UNITY_SHARED_ROOM_CONTRACT.sharedPet,
    avatarUploads: UNITY_SHARED_ROOM_CONTRACT.avatarUploads,
    ...getUnityServingStatus(),
    supabaseEdgeConfigured: Boolean(edgeConfig.functionsUrl && edgeConfig.serverToken),
    edgeFunctions: ALPHA_EDGE_FUNCTIONS
  };
  assertNoFutureSystemKeys(status, 'alpha status');
  res.json(status);
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
if (unityWebglBuildPresent) {
  app.use(express.static(unityWebglDir, { index: false }));
  app.get(['/play', '/embed'], async (_req, res, next) => {
    try {
      res.type('html').send(await renderUnityIndexHtml());
    } catch (error) {
      next(error);
    }
  });
} else if (unityWebglRequired) {
  app.get(['/play', '/embed'], (_req, res) => {
    res.status(503).type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Mochi Social playtest paused</title></head>
<body>
<main>
<h1>Playtest temporarily paused</h1>
<p>The Mochi Social room is not available right now. The tester page can stay open, and saved play will resume when the room is ready.</p>
</main>
</body>
</html>`);
  });
}
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
  const defaults = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  const configured = [
    ...(process.env.RPG_ALLOWED_ORIGINS?.split(',') ?? []),
    ...(process.env.MOCHI_SOCIAL_ALLOWED_ORIGINS?.split(',') ?? []),
    process.env.MOCHI_SOCIAL_SITE_ORIGIN ?? ''
  ].map((origin) => origin.trim());
  return new Set([...defaults, ...configured].filter(Boolean));
}

function getUnityServingStatus() {
  return {
    activeRuntime: unityWebglBuildPresent
      ? 'unity-webgl'
      : unityWebglRequired
        ? 'unity-webgl-missing'
        : 'legacy-fallback',
    unityWebglBuild: {
      present: unityWebglBuildPresent,
      required: unityWebglRequired,
      source: process.env.MOCHI_SOCIAL_UNITY_WEBGL_DIR ? 'MOCHI_SOCIAL_UNITY_WEBGL_DIR' : 'unity/Builds/WebGL'
    },
    legacyFallback: {
      available: true,
      active: !unityWebglBuildPresent && !unityWebglRequired
    }
  };
}

async function renderUnityIndexHtml() {
  const html = await readFile(unityIndexHtml, 'utf8');
  if (html.includes('data-mochi-social-unity-key-guard')) {
    return html;
  }

  const bridgeConfigJson = escapeScriptJson(getUnityBridgeConfig());
  const injection = `<style data-mochi-social-unity-frame-style>
html,
body {
  width: 100%;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: #231f20;
}

#unity-container,
#unity-container.unity-desktop,
#unity-container.unity-mobile {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  transform: none !important;
}

#unity-canvas {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  display: block;
  outline: none;
}

#unity-footer {
  position: fixed;
  right: 0.75rem;
  bottom: 0.75rem;
  z-index: 4;
}
</style>
<script data-mochi-social-unity-bridge-config>
(() => {
  const config = ${bridgeConfigJson};
  const allowedParentOrigins = new Set(config.allowedParentOrigins || []);
  const fixedFunctionsUrl = normalizeUrl(config.functionsUrl);
  const fixedUnityAuthUrl = normalizeUrl(config.unityAuthUrl);
  const fixedSupabaseUrl = normalizeUrl(config.supabaseUrl);

  function normalizeUrl(value) {
    return typeof value === 'string' ? value.trim().replace(/\\/+$/, '') : '';
  }

  function isBridgeAuthMessage(data) {
    return data && (data.type === 'MOCHI_SOCIAL_AUTH' || data.type === 'MOCHI_SOCIAL_SIGN_OUT');
  }

  function sanitizeAuthMessage(data) {
    const payload = data.payload && typeof data.payload === 'object' ? data.payload : {};
    const accessToken = payload.accessToken || data.accessToken || '';
    const expiresAt = payload.expiresAt || data.expiresAt || '';
    const sanitizedPayload = {
      accessToken,
      expiresAt,
      functionsUrl: fixedFunctionsUrl,
      supabaseFunctionsUrl: fixedFunctionsUrl,
      unityAuthUrl: fixedUnityAuthUrl,
      supabaseUrl: fixedSupabaseUrl
    };

    data.payload = sanitizedPayload;
    data.accessToken = accessToken;
    data.expiresAt = expiresAt;
    data.functionsUrl = fixedFunctionsUrl;
    data.unityAuthUrl = fixedUnityAuthUrl;
    data.supabaseUrl = fixedSupabaseUrl;
  }

  window.__MOCHI_SOCIAL_UNITY_BRIDGE_CONFIG = Object.freeze({
    allowedParentOrigins: Array.from(allowedParentOrigins),
    functionsUrl: fixedFunctionsUrl,
    unityAuthUrl: fixedUnityAuthUrl,
    supabaseUrl: fixedSupabaseUrl,
    targetParentOrigin: config.targetParentOrigin || Array.from(allowedParentOrigins)[0] || ''
  });

  window.addEventListener('message', (event) => {
    if (!isBridgeAuthMessage(event.data)) return;
    if (!allowedParentOrigins.has(event.origin)) {
      event.stopImmediatePropagation();
      return;
    }
    try {
      sanitizeAuthMessage(event.data);
    } catch (_error) {
      event.stopImmediatePropagation();
    }
  }, true);
})();
</script>
<script data-mochi-social-unity-key-guard>
(() => {
  const gameplayKeys = new Set(['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'Enter', 'Space', ' ', 'Spacebar']);
  function prepareCanvas() {
    document.querySelectorAll('canvas').forEach((canvas) => {
      if (canvas.getAttribute('tabindex') !== '0') canvas.setAttribute('tabindex', '0');
    });
  }
  document.addEventListener('DOMContentLoaded', prepareCanvas);
  window.addEventListener('load', prepareCanvas);
  window.setInterval(prepareCanvas, 1000);
  function isEditable(element) {
    const tag = String(element?.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || element?.isContentEditable === true;
  }
  function preventGameplayKey(event) {
    if (!document.querySelector('canvas')) return;
    if (isEditable(event.target) || isEditable(document.activeElement)) return;
    if (gameplayKeys.has(event.key) || gameplayKeys.has(event.code)) event.preventDefault();
  }
  window.__mochiSocialUnityKeyGuard = { active: true };
  window.addEventListener('keydown', preventGameplayKey, true);
  document.addEventListener('keydown', preventGameplayKey, true);
})();
</script>`;

  return html.includes('</body>')
    ? html.replace('</body>', `${injection}</body>`)
    : `${html}${injection}`;
}

function getUnityBridgeConfig() {
  const functionsUrl = trimTrailingSlash(process.env.MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL ?? '');
  const supabaseUrl = trimTrailingSlash(process.env.MOCHI_SOCIAL_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '');
  const allowedParentOrigins = Array.from(getAllowedOrigins());
  const targetParentOrigin = process.env.MOCHI_SOCIAL_SITE_ORIGIN?.trim() ||
    allowedParentOrigins.find((origin) => !/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|$)/i.test(origin)) ||
    allowedParentOrigins[0] ||
    '';

  return {
    allowedParentOrigins,
    targetParentOrigin,
    functionsUrl,
    unityAuthUrl: functionsUrl ? `${functionsUrl}/${ALPHA_EDGE_FUNCTIONS.unityAuth}` : '',
    supabaseUrl
  };
}

function trimTrailingSlash(value: string) {
  return value.trim().replace(/\/+$/, '');
}

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function assertNoFutureSystemKeys(payload: unknown, label: string) {
  if (/\b(?:market|trade|cashout)\b/i.test(JSON.stringify(payload))) {
    throw new Error(`${label} must not publish future economy keys for the Unity shared-room alpha.`);
  }
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
    ...ALPHA_FEATURES,
    ...MANIFEST_CONTRACTS,
    ...UNITY_SHARED_ROOM_CONTRACT
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
  return {
    status: 202,
    body: {
      ok: true,
      mode: 'local-alpha-ledger',
      noRealValue: true,
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

async function appendLocalAlphaLedger(action: AlphaActionEnvelope) {
  const ledgerDir = resolve(process.env.RPG_SAVE_DIR ?? '.local/saves');
  await mkdir(ledgerDir, { recursive: true });
  await appendFile(
    resolve(ledgerDir, 'alpha-ledger.jsonl'),
    `${JSON.stringify({
      ledgerVersion: 1,
      source: 'local-alpha-ledger',
      alphaStopPoint: 'alpha-preview-ready',
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
