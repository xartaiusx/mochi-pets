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
const runId = `local-accept-${Date.now().toString(36)}`;

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  runId,
  endpoints: [],
  actions: [],
  ledgerPath,
  reportPath,
  manualGates: [
    'Open two browser tabs to /play and verify both player sprites are visible after movement.',
    'Use the in-game NPC/chest/habitat interactions once before marking Alpha RC Ready.'
  ]
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social local alpha acceptance passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social local alpha acceptance failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const health = await getJson('/healthz', 'health');
  assert(health.body.ok === true && health.body.name === 'Mochi Social', '/healthz did not identify Mochi Social.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assert(manifest.body.name === 'Mochi Social', 'Manifest name changed.');
  assert(manifest.body.auth?.tokenPolicy === 'access-token-only', 'Manifest must keep access-token-only auth policy.');
  assert(manifest.body.alpha?.noRealValue === true, 'Manifest must keep alpha no-real-value.');
  assert(manifest.body.chain?.provider === 'enjin', 'Manifest must keep Enjin as chain provider.');
  assert(manifest.body.chain?.network === 'CANARY', 'Manifest must keep Canary network.');
  assert(manifest.body.market?.fixedPrice === true, 'Manifest must keep fixed-price market enabled.');
  assert(manifest.body.market?.auctions === false, 'Manifest must keep auctions disabled.');

  const alphaStatus = await getJson('/integration/alpha/status', 'alpha status');
  assert(alphaStatus.body.alpha?.stopPoint === 'alpha-rc-ready', 'Alpha status must expose the RC stop point.');
  assert(alphaStatus.body.market?.fixedPrice === true, 'Alpha status must keep fixed-price enabled.');
  assert(alphaStatus.body.market?.auctions === false, 'Alpha status must keep auctions disabled.');
  assert(alphaStatus.body.chain?.network === 'CANARY', 'Alpha status must stay Canary-only.');
  assert(alphaStatus.body.edgeFunctions?.action === 'mochi-social-alpha-action', 'Alpha status must expose the Mochirii action function name.');
  assert(alphaStatus.body.chainRuntime?.network === 'CANARY', 'Alpha status must expose Enjin Canary runtime details.');
  if (alphaStatus.body.enjinCanaryConfigured === false) {
    assert(alphaStatus.body.chainRuntime?.mode === 'configured-preview-stub', 'Missing Enjin env must expose configured-preview-stub mode.');
    assert(
      String(alphaStatus.body.chainRuntime?.message || '').includes('configured preview stub'),
      'Configured preview stub mode must explain the missing Enjin operator setup.'
    );
  }

  if (alphaStatus.body.supabaseEdgeConfigured && !allowEdgeMode) {
    throw new Error(
      'Local acceptance expects the fallback ledger path. Unset MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL and MOCHI_SOCIAL_GAME_SERVER_TOKEN, or set MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true for preview-only endpoint checks.'
    );
  }

  await getOk('/play', 'play');
  await getOk('/embed', 'embed');

  const invalidAction = await postJson('/integration/alpha/action', {
    type: 'chat.send',
    payload: {}
  }, 'invalid action');
  assert(invalidAction.status === 400, 'Invalid alpha action should return 400.');
  assert(invalidAction.body.error === 'invalid_alpha_action', 'Invalid alpha action must use invalid_alpha_action error.');

  const privateEnjinSubmit = await postJson('/integration/alpha/enjin/submit', {
    operation: 'poll-transaction',
    requestId: `${runId}-enjin-private`,
    playerId: 'local-acceptance-player',
    tokenId: '1',
    amount: 1,
    enjinTransactionUuid: 'tx-local-proof',
    confirmNoRealValue: true
  }, 'private enjin operator submit without token');
  assert([401, 503].includes(privateEnjinSubmit.status), 'Private Enjin operator submit must fail closed without the game server token.');
  assert(
    ['invalid_game_server_token', 'enjin_operator_disabled'].includes(privateEnjinSubmit.body.error),
    'Private Enjin operator submit must use a token-gating error.'
  );

  if (allowEdgeMode && alphaStatus.body.supabaseEdgeConfigured) {
    return;
  }

  const actions = [
    {
      requestId: `${runId}-chat`,
      type: 'chat.send',
      payload: { channel: 'local', message: 'Alpha local acceptance hello' }
    },
    {
      requestId: `${runId}-emote`,
      type: 'emote.send',
      payload: { emote: 'wave' }
    },
    {
      requestId: `${runId}-befriend`,
      type: 'pet.befriend',
      payload: { spiritId: 'momo', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-care`,
      type: 'pet.care',
      payload: { petId: 'momo', careType: 'snack', bondDelta: 1 }
    },
    {
      requestId: `${runId}-market`,
      type: 'market.fixed_list',
      payload: { itemId: 'lantern-charm', quantity: 1, currency: 'petals', price: 5, noRealValue: true }
    },
    {
      requestId: `${runId}-trade`,
      type: 'trade.direct_offer',
      payload: { targetPlayerId: 'local-acceptance-peer', offered: ['lantern-charm'], requested: ['petals:5'] }
    },
    {
      requestId: `${runId}-canary`,
      type: 'chain.withdraw_request',
      payload: { assetId: 'momo-canary-certificate', chainNetwork: 'CANARY', noRealValue: true }
    }
  ];

  for (const action of actions) {
    const response = await postJson('/integration/alpha/action', action, action.type);
    assert(response.status === 202, `${action.type} should record to the local fallback ledger with 202.`);
    assert(response.body.ok === true, `${action.type} did not return ok=true.`);
    assert(response.body.mode === 'local-alpha-ledger', `${action.type} did not use the local alpha ledger.`);
    assert(response.body.noRealValue === true, `${action.type} did not preserve no-real-value response.`);
    if (action.type.startsWith('chain.')) {
      assert(response.body.chainRuntime?.network === 'CANARY', `${action.type} did not return Enjin Canary runtime details.`);
      assert(response.body.chainRuntime?.mode === 'configured-preview-stub', `${action.type} must explain configured-preview-stub mode locally.`);
    }
    report.actions.push({ requestId: action.requestId, type: action.type, status: response.status });
  }

  const entries = await readLedgerEntries();
  const entriesById = new Map(entries.map((entry) => [entry.requestId, entry]));

  for (const action of actions) {
    const entry = entriesById.get(action.requestId);
    assert(entry, `Missing local ledger entry for ${action.type}. Expected requestId ${action.requestId}.`);
    assert(entry.type === action.type, `Ledger entry ${action.requestId} recorded type ${entry.type}, expected ${action.type}.`);
    assert(entry.noRealValue === true, `Ledger entry ${action.requestId} must be no-real-value.`);
    assert(typeof entry.receivedAt === 'string', `Ledger entry ${action.requestId} must include receivedAt.`);
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
  const result = { name, path, status: response.status, body };
  report.endpoints.push({ name, path, status: response.status });
  return result;
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
