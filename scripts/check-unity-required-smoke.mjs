import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_UNITY_REQUIRED_SMOKE_REPORT || 'reports/alpha-unity-required-smoke.json');
const port = Number(process.env.MOCHI_SOCIAL_UNITY_REQUIRED_SMOKE_PORT || await findFreePort());
const baseUrl = `http://localhost:${port}`;
const saveDir = resolve(root, '.local/unity-required-smoke/saves');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_UNITY_REQUIRED_SMOKE_TIMEOUT_MS || 30000);
const startedAt = Date.now();

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'Local-only Unity-required smoke for the deployable built server. Starts dist/server/express.js with Unity WebGL required, uses throwaway tokens, and performs no provider mutations.',
  baseUrl,
  git: readGitState(),
  checks: []
};

let child;
let serverStdout = '';
let serverStderr = '';
let exitCode = 0;

try {
  await run();
  report.ok = true;
} catch (error) {
  report.error = sanitize(error instanceof Error ? error.message : String(error));
  exitCode = 1;
} finally {
  await stopServer();
  report.durationMs = Date.now() - startedAt;
  report.server = {
    stdout: sanitize(serverStdout),
    stderr: sanitize(serverStderr),
    exitCode: child?.exitCode ?? null,
    exitSignal: child?.signalCode ?? null,
    stopped: child ? child.exitCode !== null || child.signalCode !== null : true
  };
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (report.ok) {
    console.log(`Mochi Social Unity-required smoke passed for ${baseUrl}`);
    console.log(`Report: ${reportPath}`);
  } else {
    console.error('Mochi Social Unity-required smoke failed:');
    console.error(report.error);
    console.error(`Report: ${reportPath}`);
  }
  process.exitCode = exitCode;
}

async function run() {
  child = spawn(process.execPath, ['apps/game/dist/server/express.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      SUPABASE_AUTH_REQUIRED: 'false',
      MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
      MOCHI_SOCIAL_GAME_SERVER_TOKEN: 'local-unity-required-smoke-token',
      MOCHI_SOCIAL_PUBLIC_ORIGIN: baseUrl,
      RPG_SAVE_DIR: saveDir,
      ENJIN_PLATFORM_TOKEN: '',
      ENJIN_COLLECTION_ID: '',
      ENJIN_FUEL_TANK_ID: '',
      MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout?.on('data', (chunk) => {
    serverStdout += String(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    serverStderr += String(chunk);
  });

  await waitForHealth();

  const smoke = runCommand(commandForPlatform('npm'), ['run', 'smoke'], {
    MOCHI_SOCIAL_BASE_URL: baseUrl,
    MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
    RPG_SAVE_DIR: saveDir
  });
  report.checks.push({ id: 'unity-required-smoke', command: 'npm run smoke', ...summarizeCommand(smoke) });

  const load = runCommand(commandForPlatform('npm'), ['run', 'alpha:load-smoke'], {
    MOCHI_SOCIAL_BASE_URL: baseUrl,
    MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
    RPG_SAVE_DIR: saveDir,
    MOCHI_SOCIAL_LOAD_PLAYERS: '25'
  });
  report.checks.push({ id: 'twenty-five-tester-load-smoke', command: 'npm run alpha:load-smoke', ...summarizeCommand(load) });

  const failed = report.checks.filter((check) => check.status !== 0);
  if (failed.length) {
    throw new Error(`Unity-required smoke checks failed: ${failed.map((check) => `${check.id}=${check.status}`).join(', ')}`);
  }
}

async function waitForHealth() {
  const healthUrl = `${baseUrl}/healthz`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Built server exited before readiness with code ${child.exitCode}.`);
    }
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        const body = await response.json();
        if (body.activeRuntime !== 'unity-webgl' || body.unityWebglBuild?.present !== true || body.legacyFallback?.active !== false) {
          throw new Error('Built server health did not report Unity WebGL active with legacy fallback inactive.');
        }
        report.health = {
          ok: true,
          activeRuntime: body.activeRuntime,
          unityWebglBuild: body.unityWebglBuild,
          legacyFallback: body.legacyFallback
        };
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Built server health did not report')) throw error;
    }
    await delay(250);
  }
  throw new Error(`Built server did not become ready within ${timeoutMs}ms.`);
}

function runCommand(command, args, env = {}) {
  const normalizedCommand = String(command).toLowerCase();
  const npmExecPath = process.env.npm_execpath || '';
  const useNpmCli = (normalizedCommand === 'npm' || normalizedCommand === 'npm.cmd') && npmExecPath;
  const actualCommand = useNpmCli ? process.execPath : command;
  const actualArgs = useNpmCli ? [npmExecPath, ...args] : args;
  const displayCommand = `${normalizedCommand === 'npm.cmd' ? 'npm' : command} ${args.join(' ')}`;
  const result = spawnSync(actualCommand, actualArgs, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    shell: false
  });
  return {
    command: displayCommand,
    status: result.status ?? 1,
    signal: result.signal,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function summarizeCommand(result) {
  return {
    status: result.status,
    signal: result.signal,
    stdout: sanitize(result.stdout || ''),
    stderr: sanitize(result.stderr || result.error?.message || '')
  };
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

function findFreePort() {
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

function commandForPlatform(command) {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .replace(/\bMOCHI_SOCIAL_GAME_SERVER_TOKEN\s*=\s*["']?[^ \r\n"']+/gi, 'MOCHI_SOCIAL_GAME_SERVER_TOKEN=<redacted>')
    .slice(0, 2000);
}
