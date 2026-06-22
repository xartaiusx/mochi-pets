import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3100').replace(/\/+$/, '');
const reportPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ENJIN_OPERATOR_REPORT ?? 'reports/enjin-operator-smoke.json');
const operatorToken = process.env.MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN;
const allowLiveSmoke = process.env.MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE === 'true';
const liveSmokeRequestId = process.env.MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID;
const liveSmokeTransactionUuid = process.env.MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID;
const liveSmokePlayerId = process.env.MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_PLAYER_ID ?? 'operator-smoke-player';

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  scope: 'Private Enjin operator route fail-closed smoke; does not submit live Enjin operations by default.',
  checks: []
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social Enjin operator smoke passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social Enjin operator smoke failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const status = await getJson('/integration/alpha/status', 'alpha status');
  const unitySharedRoomAlpha = status.body.engine === 'unity-webgl' && status.body.room?.mode === 'single-shared-room';
  if (unitySharedRoomAlpha && !status.body.chainRuntime) {
    report.checks.push({
      name: 'player alpha chain surface',
      status: 'absent',
      reason: 'Unity shared-room alpha keeps Enjin and funded-chain behavior out of the player-facing status surface.'
    });
  } else {
    assert(status.body.chainRuntime?.network === 'CANARY', 'Alpha status must stay on Enjin Canary when chain runtime is exposed.');
    assert(['configured', 'configured-preview-stub'].includes(status.body.chainRuntime?.mode), 'Alpha status must expose Enjin runtime mode when chain runtime is exposed.');
  }

  const unauthenticated = await submitOperatorProbe(undefined, 'unauthenticated private Enjin operator submit');
  if (unauthenticated.status === 404 && unitySharedRoomAlpha) {
    report.checks.push({
      name: 'private Enjin route inactive',
      status: 'absent',
      reason: 'Unity shared-room alpha has no active Enjin submit route.'
    });
    return;
  }
  assert([401, 503].includes(unauthenticated.status), 'Private Enjin operator submit must reject missing game server token.');
  assert(
    ['invalid_game_server_token', 'enjin_operator_disabled'].includes(unauthenticated.body?.error),
    'Private Enjin operator submit must use an explicit token-gating error.'
  );

  if (!operatorToken) {
    report.checks.push({
      name: 'tokened configured-preview-stub probe',
      status: 'skipped',
      reason: 'Set MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN to the running server token to verify the tokened no-Enjin-secrets path.'
    });
    return;
  }

  const enjinConfigured = status.body.enjinCanaryConfigured === true || status.body.chainRuntime?.mode === 'configured';
  if (enjinConfigured && !allowLiveSmoke) {
    report.checks.push({
      name: 'tokened live Enjin probe',
      status: 'skipped',
      reason: 'Runtime reports Enjin Canary configured. Refusing to submit/poll live Enjin by default; set MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE=true with operator-approved request and transaction IDs.'
    });
    return;
  }

  if (enjinConfigured && allowLiveSmoke) {
    assert(liveSmokeRequestId && liveSmokeRequestId.length > 8, 'Live Enjin operator smoke requires MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID.');
    assert(liveSmokeTransactionUuid && liveSmokeTransactionUuid.length > 8, 'Live Enjin operator smoke requires MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID.');
    assert(liveSmokePlayerId.length > 8, 'Live Enjin operator smoke requires a player id longer than 8 characters.');
    const live = await submitOperatorProbe(operatorToken, 'tokened live Enjin transaction poll', {
      requestId: liveSmokeRequestId,
      playerId: liveSmokePlayerId,
      enjinTransactionUuid: liveSmokeTransactionUuid
    });
    assert(live.status >= 200 && live.status < 300, `Live Enjin operator smoke returned HTTP ${live.status}.`);
    assert(live.body?.updateAction?.type === 'chain.operation_update', 'Live Enjin operator smoke must produce a chain.operation_update action.');
    return;
  }

  const tokened = await submitOperatorProbe(operatorToken, 'tokened private Enjin operator submit');
  assert(tokened.status === 409, 'Tokened private Enjin operator submit without Enjin secrets must return 409.');
  assert(tokened.body?.error === 'enjin_canary_not_configured', 'Tokened private Enjin operator submit must explain missing Enjin Canary configuration.');
  assert(tokened.body?.chainRuntime?.mode === 'configured-preview-stub', 'Missing Enjin config must expose configured-preview-stub mode.');
}

async function getJson(path, name) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await readBody(response);
  const result = { name, path, status: response.status, body };
  report.checks.push(result);
  assert(response.ok, `${name} failed with HTTP ${response.status}.`);
  assert(body && typeof body === 'object', `${name} did not return JSON.`);
  return result;
}

async function submitOperatorProbe(token, name, overrides = {}) {
  const response = await fetch(`${baseUrl}/integration/alpha/enjin/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-mochi-social-server-token': token } : {})
    },
    body: JSON.stringify({
      operation: 'poll-transaction',
      requestId: `operator-smoke-${Date.now().toString(36)}`,
      playerId: 'operator-smoke-player',
      enjinTransactionUuid: 'operator-smoke-transaction',
      confirmNoRealValue: true,
      ...overrides
    })
  });
  const body = await readBody(response);
  const result = {
    name,
    path: '/integration/alpha/enjin/submit',
    status: response.status,
    body
  };
  report.checks.push(result);
  return result;
}

async function readBody(response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json') || !text) return text;
  return JSON.parse(text);
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
