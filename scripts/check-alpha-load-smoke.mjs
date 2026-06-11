import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  assert(manifest.body.chain?.network === 'CANARY', 'Manifest must stay Canary-only.');
  assert(manifest.body.market?.auctions === false, 'Manifest must keep auctions disabled.');
  assert(alphaStatus.body.alpha?.noRealValue === true, 'Alpha status must keep no-real-value enabled.');

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
        requestId: `${runId}-p${tester}-emote`,
        type: 'emote.send',
        payload: { emote: 'wave', simulatedTester: tester }
      },
      {
        requestId: `${runId}-p${tester}-chat`,
        type: 'chat.send',
        payload: { channel: 'town', message: `Alpha load smoke tester ${tester}` }
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
    assert(entry.alphaStopPoint === 'alpha-rc-ready', `Ledger entry ${action.requestId} must keep the alpha RC stop point.`);
    assert(entry.chainNetwork === 'CANARY', `Ledger entry ${action.requestId} must stay Canary-scoped.`);
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
