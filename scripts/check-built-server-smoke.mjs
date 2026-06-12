import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_BUILT_SERVER_REPORT || 'reports/built-server-smoke.json');
const port = Number(process.env.MOCHI_SOCIAL_BUILT_SERVER_PORT || await findFreePort());
const baseUrl = `http://localhost:${port}`;
const token = 'local-built-server-smoke-token';
const timeoutMs = Number(process.env.MOCHI_SOCIAL_BUILT_SERVER_TIMEOUT_MS || 20000);

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  scope: 'Local-only built Express server smoke. Starts dist/server/express.js with throwaway secrets and no Enjin live configuration.',
  git: readGitState(),
  checks: []
};

let child;
let exitCode = 0;
let stdout = '';
let stderr = '';

try {
  await run();
  report.ok = true;
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  exitCode = 1;
} finally {
  await stopServer();
  recordServerOutput();
  await writeReport();
  if (report.ok) {
    console.log(`Mochi Social built server smoke passed for ${baseUrl}`);
    console.log(`Report: ${reportPath}`);
  } else {
    console.error('Mochi Social built server smoke failed:');
    console.error(report.error);
    console.error(`Report: ${reportPath}`);
  }
  process.exitCode = exitCode;
}

async function run() {
  child = spawn(process.execPath, ['apps/game/dist/server/express.js'], {
    cwd: root,
    env: buildServerEnv(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout?.on('data', (chunk) => {
    stdout += String(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
  });

  await waitForHealth(child);

  const health = await getJson('/healthz', 'health');
  assert(health.body.ok === true && health.body.name === 'Mochi Social', 'Built server health check must identify Mochi Social.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assert(manifest.body.name === 'Mochi Social', 'Built server manifest must identify Mochi Social.');
  assert(manifest.body.chain?.network === 'CANARY', 'Built server manifest must stay Canary-only.');
  assert(manifest.body.alpha?.noRealValue === true, 'Built server manifest must keep no-real-value posture.');
  assert(manifest.body.market?.auctions === false, 'Built server manifest must keep auctions disabled.');

  const alpha = await getJson('/integration/alpha/status', 'alpha status');
  assert(alpha.body.chainRuntime?.mode === 'configured-preview-stub', 'Built server must expose configured-preview-stub without Enjin secrets.');
  assert(alpha.body.enjinCanaryConfigured === false, 'Built server must not report Enjin configured under smoke env.');

  const play = await request('/play', 'play route');
  assert(play.status === 200 && String(play.body).includes('Mochi Social'), 'Built server /play must return the game HTML.');

  const unauthenticated = await postOperator(undefined, 'unauthenticated operator submit');
  assert(unauthenticated.status === 401, 'Built server private Enjin operator route must reject missing token.');
  assert(unauthenticated.body?.error === 'invalid_game_server_token', 'Missing token must return invalid_game_server_token.');

  const tokened = await postOperator(token, 'tokened operator submit');
  assert(tokened.status === 409, 'Built server tokened Enjin operator route must fail closed without Enjin secrets.');
  assert(tokened.body?.error === 'enjin_canary_not_configured', 'Tokened operator route must explain missing Enjin Canary config.');
  assert(tokened.body?.chainRuntime?.mode === 'configured-preview-stub', 'Tokened operator response must expose configured-preview-stub.');
}

function buildServerEnv() {
  const env = {
    ...process.env,
    PORT: String(port),
    SUPABASE_AUTH_REQUIRED: 'false',
    MOCHI_SOCIAL_GAME_SERVER_TOKEN: token,
    MOCHI_SOCIAL_PUBLIC_ORIGIN: baseUrl,
    RPG_SAVE_DIR: resolve(root, '.local/built-server-smoke/saves')
  };

  delete env.ENJIN_PLATFORM_TOKEN;
  delete env.ENJIN_COLLECTION_ID;
  delete env.ENJIN_FUEL_TANK_ID;
  delete env.MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL;
  return env;
}

async function waitForHealth(serverProcess) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Built server exited before readiness with code ${serverProcess.exitCode}.`);
    }
    try {
      const response = await fetch(`${baseUrl}/healthz`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }
  throw new Error(`Built server did not become ready within ${timeoutMs}ms.`);
}

async function getJson(path, name) {
  const result = await request(path, name);
  assert((result.contentType || '').includes('application/json'), `${name} must return JSON.`);
  return result;
}

async function request(path, name, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  const result = { name, path, status: response.status, contentType, body };
  report.checks.push(result);
  return result;
}

async function postOperator(operatorToken, name) {
  return request('/integration/alpha/enjin/submit', name, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(operatorToken ? { 'x-mochi-social-server-token': operatorToken } : {})
    },
    body: JSON.stringify({
      operation: 'poll-transaction',
      requestId: `built-server-smoke-${Date.now().toString(36)}`,
      playerId: 'built-server-smoke-player',
      enjinTransactionUuid: 'built-server-smoke-transaction',
      confirmNoRealValue: true
    })
  });
}

async function stopServer() {
  if (!child || child.exitCode !== null) return;
  child.kill();
  await Promise.race([
    new Promise((resolvePromise) => child.once('exit', resolvePromise)),
    delay(3000).then(() => {
      if (child.exitCode === null) child.kill('SIGKILL');
    })
  ]);
}

async function findFreePort() {
  return new Promise((resolvePromise, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === 'object' && address?.port) resolvePromise(address.port);
        else reject(new Error('Could not allocate a free local port.'));
      });
    });
  });
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function recordServerOutput() {
  report.server = {
    stdout: sanitize(stdout),
    stderr: sanitize(stderr),
    exitCode: child?.exitCode ?? null,
    exitSignal: child?.signalCode ?? null,
    stopped: child ? child.exitCode !== null || child.signalCode !== null : true
  };
}

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
  return {
    branch: sanitize(firstLine(branch.stdout)),
    localHead: sanitize(firstLine(localHead.stdout)),
    upstream: sanitize(firstLine(upstream.stdout)),
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function git(args) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    shell: false
  });
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
    .slice(0, 2000);
}
