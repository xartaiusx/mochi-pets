import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const requestedPlayers = Number(process.env.MOCHI_SOCIAL_LOAD_PLAYERS ?? 25);
const playerCount = Math.max(10, Math.min(25, Number.isFinite(requestedPlayers) ? requestedPlayers : 25));
const saveDir = process.env.RPG_SAVE_DIR ?? '.local/saves';
const ledgerPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ALPHA_LEDGER_PATH ?? join(saveDir, 'alpha-ledger.jsonl'));
const reportPath = resolveFromRoot(process.env.MOCHI_SOCIAL_LOAD_REPORT ?? 'reports/alpha-load-smoke.json');
const allowEdgeMode = process.env.MOCHI_SOCIAL_LOAD_ALLOW_EDGE === 'true';
const runId = `load-smoke-${Date.now().toString(36)}`;

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  runId,
  playerCount,
  git: readGitState(),
  endpoints: [],
  actions: [],
  ledgerPath,
  reportPath,
  scope: 'HTTP alpha contract load smoke; not a replacement for visual WebSocket presence testing.'
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social alpha load smoke passed for ${playerCount} simulated testers at ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social alpha load smoke failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const [health, manifest, alphaStatus] = await Promise.all([
    getJson('/healthz', 'health'),
    getJson('/integration/game-manifest.json', 'manifest'),
    getJson('/integration/alpha/status', 'alpha status')
  ]);

  assert(health.body.ok === true && health.body.name === 'Mochi Social', '/healthz did not identify Mochi Social.');
  assert(!('chain' in manifest.body), 'Manifest must not expose future asset provider configuration.');
  assert(!('chainRuntime' in manifest.body), 'Manifest must not expose future asset runtime state.');
  assert(manifest.body.engine === 'unity-webgl', 'Manifest must expose Unity WebGL as the engine.');
  assert(manifest.body.room?.mode === 'single-shared-room', 'Manifest must expose single-shared-room mode.');
  assert(manifest.body.room?.capacity === 25, 'Manifest must expose room capacity 25.');
  assert(manifest.body.room?.sharedPetKey === 'lirabao', 'Manifest must expose Lirabao as the shared pet key.');
  assert(manifest.body.runtime?.realtimeAuthority === 'ugs-distributed-authority', 'Manifest must expose UGS Distributed Authority.');
  assert(manifest.body.runtime?.stateAuthority === 'ugs-cloud-save', 'Manifest must expose UGS Cloud Save.');
  assert(manifest.body.state?.playerCharacterKey === 'character.v1', 'Manifest must expose character.v1 Player Data.');
  assert(manifest.body.state?.sharedPetKey === 'room:jade-lantern-room/sharedPet.v1', 'Manifest must expose the shared Lirabao state key.');
  assert(manifest.body.characterPresets?.count === 3, 'Manifest must expose three curated presets.');
  assert(manifest.body.characterPresets?.avatarUploads === false, 'Manifest must reject avatar uploads.');
  assert(manifest.body.sharedPet?.key === 'lirabao', 'Manifest must expose Lirabao.');
  assert(manifest.body.sharedPet?.universalStarter === true, 'Manifest must keep Lirabao universal.');
  assert(manifest.body.market?.enabled === false, 'Manifest must disable market systems for Unity Preview Ready.');
  assert(manifest.body.market?.fixedPrice === false, 'Manifest must disable fixed-price listings.');
  assert(manifest.body.market?.directTrade === false, 'Manifest must disable direct trade.');
  assert(manifest.body.market?.auctions === false, 'Manifest must keep auctions disabled.');
  assert(manifest.body.avatarUploads === false, 'Manifest must disable avatar uploads.');
  assert(manifest.body.alphaPreview?.stopPoint === 'alpha-preview-ready', 'Manifest must expose Alpha Preview Ready as the tester-entry stop point.');
  assert(manifest.body.alphaPreview?.providerMutationAllowedByDefault === false, 'Manifest must reject provider mutation by default.');
  assert(manifest.body.cleanRoom?.restrictedSourceReferences === false, 'Manifest must declare zero restricted-source references.');
  assert(alphaStatus.body.alpha?.noRealValue === true, 'Alpha status must keep no-real-value enabled.');
  assert(alphaStatus.body.alpha?.stopPoint === 'alpha-preview-ready', 'Alpha status must expose Alpha Preview Ready.');
  assert(alphaStatus.body.engine === 'unity-webgl', 'Alpha status must expose Unity WebGL as the engine.');
  assert(alphaStatus.body.room?.mode === 'single-shared-room', 'Alpha status must expose single-shared-room mode.');
  assert(alphaStatus.body.room?.capacity === 25, 'Alpha status must expose room capacity 25.');
  assert(alphaStatus.body.room?.sharedPetKey === 'lirabao', 'Alpha status must expose Lirabao as the shared pet key.');
  assert(alphaStatus.body.runtime?.realtimeAuthority === 'ugs-distributed-authority', 'Alpha status must expose UGS Distributed Authority.');
  assert(alphaStatus.body.runtime?.stateAuthority === 'ugs-cloud-save', 'Alpha status must expose UGS Cloud Save.');
  assert(alphaStatus.body.market?.enabled === false, 'Alpha status must disable market systems for Unity Preview Ready.');
  assert(alphaStatus.body.avatarUploads === false, 'Alpha status must disable avatar uploads.');

  if (alphaStatus.body.supabaseEdgeConfigured && !allowEdgeMode) {
    throw new Error(
      'Load smoke expects local fallback ledger mode. Unset MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL and MOCHI_SOCIAL_GAME_SERVER_TOKEN, or set MOCHI_SOCIAL_LOAD_ALLOW_EDGE=true for preview endpoint checks.'
    );
  }

  await Promise.all(Array.from({ length: playerCount }, (_, index) => getOk('/play', `play ${index + 1}`)));

  if (allowEdgeMode && alphaStatus.body.supabaseEdgeConfigured) {
    return;
  }

  const actions = Array.from({ length: playerCount }, (_, index) => {
    const tester = String(index + 1).padStart(2, '0');
    return [
      {
        requestId: `${runId}-p${tester}-room-joined`,
        type: 'unity.room.joined',
        payload: {
          roomSessionId: 'jade-lantern-room-alpha',
          engine: 'unity-webgl',
          simulatedTester: tester,
          noRealValue: true
        }
      },
      {
        requestId: `${runId}-p${tester}-pet-interaction`,
        type: 'unity.pet.interaction',
        payload: {
          sharedPetKey: 'lirabao',
          sharedPetStateKey: 'room:jade-lantern-room/sharedPet.v1',
          interaction: 'wave',
          expectedRevision: index + 1,
          simulatedTester: tester,
          noRealValue: true
        }
      }
    ];
  }).flat();

  const responses = await Promise.all(actions.map((action) => postJson('/integration/alpha/action', action, action.type)));
  for (let index = 0; index < actions.length; index += 1) {
    const action = actions[index];
    const response = responses[index];
    assert(response.status === 202, `${action.type} for ${action.requestId} should record with 202.`);
    assert(response.body.mode === 'local-alpha-ledger', `${action.requestId} did not use local-alpha-ledger.`);
    assert(response.body.noRealValue === true, `${action.requestId} did not preserve no-real-value response.`);
    report.actions.push({ requestId: action.requestId, type: action.type, status: response.status });
  }

  const entries = await readLedgerEntries();
  const entriesById = new Map(entries.map((entry) => [entry.requestId, entry]));
  for (const action of actions) {
    const entry = entriesById.get(action.requestId);
    assert(entry, `Missing local ledger entry for ${action.requestId}.`);
    assert(entry.ledgerVersion === 1, `Ledger entry ${action.requestId} must use ledgerVersion=1.`);
    assert(entry.source === 'local-alpha-ledger', `Ledger entry ${action.requestId} must identify the local fallback ledger source.`);
    assert(entry.alphaStopPoint === 'alpha-preview-ready', `Ledger entry ${action.requestId} must keep the Alpha Preview Ready stop point.`);
    assert(!('chainNetwork' in entry), `Ledger entry ${action.requestId} must not expose future asset network state.`);
    assert(entry.noRealValue === true, `Ledger entry ${action.requestId} must be no-real-value.`);
  }
}

async function getOk(path, name) {
  const response = await request(path, { method: 'GET' }, name);
  assert(response.status >= 200 && response.status < 300, `${name} endpoint failed with ${response.status}.`);
  return response;
}

async function getJson(path, name) {
  const response = await getOk(path, name);
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
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  report.endpoints.push({ name, path, status: response.status });
  return { name, path, status: response.status, body };
}

async function readLedgerEntries() {
  let text = '';
  try {
    text = await readFile(ledgerPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Local alpha ledger was not created at ${ledgerPath}. Is the server using a different RPG_SAVE_DIR?`);
    }
    throw error;
  }

  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => typeof entry.requestId === 'string' && entry.requestId.startsWith(runId));
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function resolveFromRoot(value) {
  return isAbsolute(value) ? value : resolve(root, value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const dirty = git(['status', '--porcelain']);
  return {
    branch: firstLine(branch.stdout),
    localHead: firstLine(localHead.stdout),
    upstream: firstLine(upstream.stdout),
    dirty: dirty.ok ? dirty.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, dirty]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}
