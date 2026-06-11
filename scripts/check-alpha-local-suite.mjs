import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const runId = `local-suite-${Date.now().toString(36)}`;
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_SUITE_REPORT || 'reports/alpha-local-suite.json');
const port = Number(process.env.MOCHI_SOCIAL_LOCAL_SUITE_PORT || await findFreePort());
const baseUrl = `http://localhost:${port}`;
const saveDir = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_SUITE_SAVE_DIR || `.local/alpha-suite/${runId}/saves`);
const serverToken = `local-suite-token-${Date.now().toString(36)}`;
const timeoutMs = Number(process.env.MOCHI_SOCIAL_LOCAL_SUITE_TIMEOUT_MS || 30000);
const loadPlayers = String(process.env.MOCHI_SOCIAL_LOCAL_SUITE_LOAD_PLAYERS || process.env.MOCHI_SOCIAL_LOAD_PLAYERS || '10');

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'No-cost localhost Alpha RC suite. Builds once, starts the built Express runtime with throwaway env, runs endpoint/acceptance/load/browser/visual/operator smokes, and shuts down the server.',
  runId,
  baseUrl,
  saveDir,
  commands: [],
  server: null
};

let child;
let serverStdout = '';
let serverStderr = '';
let exitCode = 0;

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
    console.log(`Mochi Social local Alpha suite passed for ${baseUrl}`);
    console.log(`Report: ${reportPath}`);
  } else {
    console.error('Mochi Social local Alpha suite failed:');
    console.error(report.error);
    console.error(`Report: ${reportPath}`);
  }
  process.exitCode = exitCode;
}

async function run() {
  await runCommand('build', npmCommand(), ['run', 'build'], process.env);
  await startServer();
  await waitForHealth();

  const env = localCheckEnv();
  await runCommand('smoke', npmCommand(), ['run', 'smoke'], env);
  await runCommand('alpha:local-acceptance', npmCommand(), ['run', 'alpha:local-acceptance'], env);
  await runCommand('alpha:load-smoke', npmCommand(), ['run', 'alpha:load-smoke'], {
    ...env,
    MOCHI_SOCIAL_LOAD_PLAYERS: loadPlayers
  });
  await runCommand('alpha:browser-presence', npmCommand(), ['run', 'alpha:browser-presence'], env);
  await runCommand('alpha:visual-snapshot', npmCommand(), ['run', 'alpha:visual-snapshot'], env);
  await runCommand('alpha:enjin-operator-smoke', npmCommand(), ['run', 'alpha:enjin-operator-smoke'], {
    ...env,
    MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN: serverToken
  });
}

async function startServer() {
  child = spawn(process.execPath, ['apps/game/dist/server/express.js'], {
    cwd: root,
    env: localServerEnv(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout?.on('data', (chunk) => {
    serverStdout += String(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    serverStderr += String(chunk);
  });
}

function localServerEnv() {
  const env = localCheckEnv();
  env.PORT = String(port);
  env.MOCHI_SOCIAL_PUBLIC_ORIGIN = baseUrl;
  env.MOCHI_SOCIAL_GAME_SERVER_TOKEN = serverToken;
  return env;
}

function localCheckEnv() {
  const env = {
    ...process.env,
    MOCHI_SOCIAL_BASE_URL: baseUrl,
    RPG_SAVE_DIR: saveDir,
    MOCHI_SOCIAL_ALPHA_LEDGER_PATH: resolve(saveDir, 'alpha-ledger.jsonl'),
    SUPABASE_AUTH_REQUIRED: 'false',
    MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE: 'false'
  };

  delete env.MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL;
  delete env.SUPABASE_URL;
  delete env.SUPABASE_PUBLISHABLE_KEY;
  delete env.SUPABASE_SERVICE_ROLE_KEY;
  delete env.ENJIN_PLATFORM_TOKEN;
  delete env.ENJIN_COLLECTION_ID;
  delete env.ENJIN_FUEL_TANK_ID;
  delete env.MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE;
  delete env.MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID;
  delete env.MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID;
  return env;
}

async function waitForHealth() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (child?.exitCode !== null) {
      throw new Error(`Local Alpha suite server exited before readiness with code ${child?.exitCode}.`);
    }

    try {
      const response = await fetch(`${baseUrl}/healthz`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      await delay(250);
    }
  }

  throw new Error(`Local Alpha suite server did not become ready within ${timeoutMs}ms.`);
}

async function runCommand(name, command, args, env) {
  const startedAt = Date.now();
  const result = await exec(command, args, env);
  report.commands.push({
    name,
    command: [command, ...args].join(' '),
    status: result.status,
    durationMs: Date.now() - startedAt,
    stdout: sanitize(result.stdout),
    stderr: sanitize(result.stderr)
  });
  if (result.status !== 0) {
    throw new Error(`${name} failed with exit code ${result.status}.`);
  }
}

function exec(command, args, env) {
  return new Promise((resolvePromise) => {
    const processHandle = spawn(command, args, {
      cwd: root,
      env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    processHandle.stdout?.on('data', (chunk) => {
      stdout += String(chunk);
    });
    processHandle.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });
    processHandle.on('error', (error) => {
      resolvePromise({ status: 1, stdout, stderr: `${stderr}\n${error.message}` });
    });
    processHandle.on('close', (status) => {
      resolvePromise({ status: status ?? 1, stdout, stderr });
    });
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
    stdout: sanitize(serverStdout),
    stderr: sanitize(serverStderr),
    exitCode: child?.exitCode ?? null,
    exitSignal: child?.signalCode ?? null,
    stopped: child ? child.exitCode !== null || child.signalCode !== null : true
  };
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .replace(/\blocal-suite-token-[a-z0-9]+\b/gi, '<redacted-local-suite-token>')
    .slice(0, 3000);
}
