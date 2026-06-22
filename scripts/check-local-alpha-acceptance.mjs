import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const saveDir = process.env.RPG_SAVE_DIR ?? '.local/saves';
const ledgerPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ALPHA_LEDGER_PATH ?? join(saveDir, 'alpha-ledger.jsonl'));
const reportPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ACCEPTANCE_REPORT ?? 'reports/alpha-local-acceptance.json');
const allowEdgeMode = process.env.MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE === 'true';
const requestTimeoutMs = Number(process.env.MOCHI_SOCIAL_ACCEPTANCE_REQUEST_TIMEOUT_MS || 10000);
const runId = `unity-local-accept-${Date.now().toString(36)}`;

const unityActions = [
  {
    requestId: `${runId}-room-joined`,
    type: 'unity.room.joined',
    payload: {
      roomSessionId: 'jade-lantern-room-alpha',
      scene: 'JadeLanternRoom',
      engine: 'unity-webgl',
      playerId: 'local-alpha-tester-a',
      noRealValue: true
    }
  },
  {
    requestId: `${runId}-character-created`,
    type: 'unity.character.created',
    payload: {
      playerCharacterKey: 'character.v1',
      presetId: 'jade_wayfarer',
      displayNameReference: 'supabase-profile',
      avatarUploads: false,
      noRealValue: true
    }
  },
  {
    requestId: `${runId}-character-updated`,
    type: 'unity.character.updated',
    payload: {
      playerCharacterKey: 'character.v1',
      presetId: 'lotus_guardian',
      lastSpawnPoint: 'jade-lantern-room-alpha:moon-gate',
      avatarUploads: false,
      noRealValue: true
    }
  },
  {
    requestId: `${runId}-pet-interaction`,
    type: 'unity.pet.interaction',
    payload: {
      sharedPetKey: 'lirabao',
      sharedPetStateKey: 'room:jade-lantern-room/sharedPet.v1',
      interaction: 'care',
      expectedRevision: 1,
      actorId: 'local-alpha-tester-a',
      noRealValue: true
    }
  },
  {
    requestId: `${runId}-pet-state-saved`,
    type: 'unity.pet.state_saved',
    payload: {
      sharedPetKey: 'lirabao',
      sharedPetStateKey: 'room:jade-lantern-room/sharedPet.v1',
      revision: 2,
      mood: 'happy',
      careMeter: 62,
      writeLock: 'cloud-code-authoritative-save',
      noRealValue: true
    }
  },
  {
    requestId: `${runId}-room-left`,
    type: 'unity.room.left',
    payload: {
      roomSessionId: 'jade-lantern-room-alpha',
      playerId: 'local-alpha-tester-a',
      reason: 'local-acceptance',
      noRealValue: true
    }
  }
];

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  runId,
  endpoints: [],
  actions: [],
  ledgerPath,
  reportPath,
  scope: 'Local-only Unity WebGL Alpha Preview Ready contract acceptance. Provider forwarding is refused unless explicitly enabled.',
  manualGates: [
    'Open the Unity WebGL /embed build and verify two browser sessions can join jade-lantern-room-alpha.',
    'Verify both sessions see distinct curated avatars and the same universal Lirabao state across reload/logout/login.',
    'Run hosted Preview, provider, load, and cost-bearing checks only after fresh explicit approval.'
  ]
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social Unity local alpha acceptance passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social Unity local alpha acceptance failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const health = await getJson('/healthz', 'health');
  assert(health.body.ok === true && health.body.name === 'Mochi Social', '/healthz did not identify Mochi Social.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assertManifestContract(manifest.body, 'Manifest');

  const alphaStatus = await getJson('/integration/alpha/status', 'alpha status');
  assertStatusContract(alphaStatus.body);

  if (alphaStatus.body.supabaseEdgeConfigured && !allowEdgeMode) {
    throw new Error(
      'Local acceptance refuses to forward alpha actions to Supabase Edge by default. Unset MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL and MOCHI_SOCIAL_GAME_SERVER_TOKEN, or set MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true after explicit provider approval.'
    );
  }

  await assertHtmlRoute('/play', 'play');
  await assertHtmlRoute('/embed', 'embed');

  if (!allowEdgeMode || !alphaStatus.body.supabaseEdgeConfigured) {
    await recordUnityActions();
    await assertLocalLedger();
  }
}

function assertManifestContract(body, label) {
  assert(body.name === 'Mochi Social', `${label} name changed.`);
  assert(body.engine === 'unity-webgl', `${label} must expose Unity WebGL as the engine.`);
  assert(body.bridge?.namespace === 'MOCHI_SOCIAL', `${label} must expose the Mochi Social bridge namespace.`);
  assert(body.bridge?.protocolVersion === 1, `${label} must expose bridge protocol v1.`);
  assert(includesAll(body.bridge?.parentToGame, ['MOCHI_SOCIAL_AUTH', 'MOCHI_SOCIAL_SIGN_OUT']), `${label} must expose parent-to-game bridge messages.`);
  assert(includesAll(body.bridge?.gameToParent, ['MOCHI_SOCIAL_READY', 'MOCHI_SOCIAL_AUTH_STATE', 'MOCHI_SOCIAL_ERROR']), `${label} must expose game-to-parent bridge messages.`);
  assert(body.auth?.provider === 'supabase', `${label} must keep Supabase as member authority.`);
  assert(body.auth?.tokenPolicy === 'access-token-only', `${label} must keep access-token-only auth policy.`);
  assert(body.alpha?.allowlistRequired === true, `${label} must require the tester allowlist.`);
  assert(body.alpha?.termsRequired === true, `${label} must require terms acceptance.`);
  assert(body.alpha?.noRealValue === true, `${label} must keep alpha no-real-value.`);
  assert(body.alpha?.stopPoint === 'alpha-preview-ready', `${label} must target Alpha Preview Ready first.`);
  assert(body.alphaPreview?.stopPoint === 'alpha-preview-ready', `${label} must expose Alpha Preview Ready as the website stop point.`);
  assert(body.alphaPreview?.providerMutationAllowedByDefault === false, `${label} must reject provider mutation by default.`);
  assert(body.alphaPreview?.fundedChainRequiredForPreview === false, `${label} must not require funded-chain gates for Preview Ready.`);
  assert(!('chain' in body), `${label} must not expose future asset provider configuration.`);
  assert(!('chainRuntime' in body), `${label} must not expose future asset runtime state.`);
  assertNoFutureSystemKeys(body, label);
  assertSharedRoomContract(body, label);
  assertRoutes(body.routes, label);
  assert(body.cleanRoom?.restrictedSourceReferences === false, `${label} must declare zero restricted-source references.`);
  assert(body.cleanRoom?.copiedRestrictedSourceAssets === false, `${label} must declare zero copied restricted-source assets.`);
}

function assertStatusContract(body) {
  assert(body.ok === true, 'Alpha status must be ok.');
  assert(body.name === 'Mochi Social', 'Alpha status must identify Mochi Social.');
  assert(body.alpha?.allowlistRequired === true, 'Alpha status must require the tester allowlist.');
  assert(body.alpha?.termsRequired === true, 'Alpha status must require terms acceptance.');
  assert(body.alpha?.noRealValue === true, 'Alpha status must keep no-real-value enabled.');
  assert(body.alpha?.stopPoint === 'alpha-preview-ready', 'Alpha status must target Alpha Preview Ready first.');
  assert(!('chainRuntime' in body), 'Alpha status must not expose future asset runtime state.');
  assert(!('enjinCanaryConfigured' in body), 'Alpha status must not expose future asset provider state.');
  assertNoFutureSystemKeys(body, 'Alpha status');
  assertSharedRoomContract(body, 'Alpha status');
}

function assertSharedRoomContract(body, label) {
  assert(body.room?.key === 'jade-lantern-room-alpha', `${label} must expose the shared room key.`);
  assert(body.room?.scene === 'JadeLanternRoom', `${label} must expose the JadeLanternRoom Unity scene.`);
  assert(body.room?.mode === 'single-shared-room', `${label} must expose single-shared-room mode.`);
  assert(body.room?.capacity === 25, `${label} must expose room capacity 25.`);
  assert(body.room?.sharedPetKey === 'lirabao', `${label} must expose Lirabao as the shared pet key.`);
  assert(body.runtime?.realtimeAuthority === 'ugs-distributed-authority', `${label} must use UGS Distributed Authority.`);
  assert(body.runtime?.sessionService === 'unity-multiplayer-services', `${label} must use Unity Multiplayer Services.`);
  assert(body.runtime?.authentication === 'unity-authentication-custom-id', `${label} must use Unity Authentication Custom ID.`);
  assert(body.runtime?.stateAuthority === 'ugs-cloud-save', `${label} must use UGS Cloud Save.`);
  assert(body.runtime?.sharedState === 'ugs-cloud-code-cloud-save-game-data', `${label} must use Cloud Code for shared state saves.`);
  assert(body.runtime?.multiplayerHosting === 'not-used-v1', `${label} must not use Unity Multiplay/Game Server Hosting for v1.`);
  assert(body.state?.playerCharacterKey === 'character.v1', `${label} must expose character.v1 Player Data.`);
  assert(body.state?.sharedPetKey === 'room:jade-lantern-room/sharedPet.v1', `${label} must expose the shared Lirabao Game Data key.`);
  assert(body.state?.liveAvatarTransformsDurable === false, `${label} must keep live avatar transforms session-only.`);
  assert(body.state?.liveEmotesDurable === false, `${label} must keep live emotes session-only.`);
  assert(body.characterPresets?.mode === 'curated-presets', `${label} must use curated character presets.`);
  assert(body.characterPresets?.count === 3, `${label} must expose exactly three presets.`);
  assert(body.characterPresets?.avatarUploads === false, `${label} must disable avatar uploads.`);
  assert(includesAll(body.characterPresets?.presetIds, ['jade_wayfarer', 'lotus_guardian', 'lantern_scholar']), `${label} must expose the three curated preset ids.`);
  assert(body.sharedPet?.key === 'lirabao', `${label} must expose Lirabao.`);
  assert(body.sharedPet?.name === 'Lirabao', `${label} must expose Lirabao name.`);
  assert(body.sharedPet?.universalStarter === true, `${label} must keep Lirabao universal.`);
  assert(body.sharedPet?.stateAuthority === 'cloud-code-authoritative-save', `${label} must keep Cloud Code authoritative shared pet saves.`);
  assert(body.avatarUploads === false, `${label} must disable avatar uploads.`);
  assert(body.edgeFunctions?.unityAuth === 'mochi-social-unity-auth', `${label} must expose the Unity auth Edge Function.`);
  assert(body.edgeFunctions?.action === 'mochi-social-alpha-action', `${label} must expose the alpha action Edge Function.`);
  assert(body.edgeFunctions?.progress === 'mochi-social-alpha-progress', `${label} must expose the alpha progress Edge Function.`);
  assert(body.edgeFunctions?.feedback === 'submit-mochi-social-feedback', `${label} must expose the feedback Edge Function.`);
}

function assertRoutes(routes, label) {
  assert(includesAll(routes?.public, ['/healthz', '/play', '/embed', '/integration/game-manifest.json']), `${label} must expose public integration routes.`);
  assert(includesAll(routes?.integration, ['/integration/alpha/status', '/integration/alpha/progress', '/integration/alpha/action']), `${label} must expose alpha integration routes.`);
}

async function recordUnityActions() {
  for (const action of unityActions) {
    const response = await postJson('/integration/alpha/action', action, action.type);
    assert(response.status === 202, `${action.type} for ${action.requestId} should record with 202.`);
    assert(response.body?.ok === true, `${action.requestId} did not return ok=true.`);
    assert(response.body?.mode === 'local-playtest-record', `${action.requestId} did not use local-playtest-record.`);
    assert(response.body?.noRealValue === true, `${action.requestId} did not preserve no-real-value response.`);
    report.actions.push({ requestId: action.requestId, type: action.type, status: response.status });
  }
}

async function assertLocalLedger() {
  const entries = await readLedgerEntries();
  const entriesById = new Map(entries.map((entry) => [entry.requestId, entry]));
  for (const action of unityActions) {
    const entry = entriesById.get(action.requestId);
    assert(entry, `Missing local ledger entry for ${action.requestId}.`);
    assert(entry.ledgerVersion === 1, `Ledger entry ${action.requestId} must use ledgerVersion=1.`);
    assert(entry.source === 'local-alpha-ledger', `Ledger entry ${action.requestId} must identify the local fallback ledger source.`);
    assert(entry.alphaStopPoint === 'alpha-preview-ready', `Ledger entry ${action.requestId} must keep the Alpha Preview Ready stop point.`);
    assert(!('chainNetwork' in entry), `Ledger entry ${action.requestId} must not expose future asset network state.`);
    assert(entry.noRealValue === true, `Ledger entry ${action.requestId} must be no-real-value.`);
    assert(entry.type === action.type, `Ledger entry ${action.requestId} type changed.`);
    assert(entry.payload?.noRealValue === true, `Ledger entry ${action.requestId} payload must preserve no-real-value.`);
  }
}

async function assertHtmlRoute(path, name) {
  const response = await request(path, { method: 'GET' }, name);
  assert(response.status === 200, `${name} endpoint failed with ${response.status}.`);
  assert(String(response.body).includes('Mochi Social'), `${name} route must return Mochi Social HTML.`);
}

async function getJson(path, name) {
  const response = await request(path, { method: 'GET' }, name);
  assert(response.status >= 200 && response.status < 300, `${name} endpoint failed with ${response.status}.`);
  assert(response.body && typeof response.body === 'object', `${name} endpoint did not return JSON.`);
  return response;
}

async function postJson(path, body, name) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, name);
}

async function request(path, init, name) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(requestTimeoutMs)
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();
  report.endpoints.push({
    name,
    path,
    status: response.status,
    elapsedMs: Date.now() - startedAt
  });
  return { status: response.status, body };
}

async function readLedgerEntries() {
  const text = await readFile(ledgerPath, 'utf8');
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function includesAll(value, required) {
  return Array.isArray(value) && required.every((item) => value.includes(item));
}

function resolveFromRoot(path) {
  return isAbsolute(path) ? path : resolve(root, path);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNoFutureSystemKeys(body, label) {
  const text = JSON.stringify(body);
  assert(!/\b(?:market|trade|cashout)\b/i.test(text), `${label} must not publish future economy keys for the Unity shared-room alpha.`);
}
