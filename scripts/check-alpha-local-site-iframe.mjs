import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';

const root = process.cwd();
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
const siteWebPath = resolve(siteRepoPath, 'apps/web');
const runId = `local-site-iframe-${Date.now().toString(36)}`;
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_REPORT || 'reports/alpha-local-site-iframe.json');
const responsiveReportPath = resolve(root, process.env.MOCHI_SOCIAL_SITE_IFRAME_RESPONSIVE_JSON || 'reports/alpha-site-iframe-responsive.json');
const screenshotDir = resolve(root, process.env.MOCHI_SOCIAL_SITE_IFRAME_SCREENSHOT_DIR || 'reports/responsive-site-iframe');
const gamePort = Number(process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_GAME_PORT || await findFreePort());
const sitePort = Number(process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_SITE_PORT || await findFreePort());
const gameBaseUrl = `http://localhost:${gamePort}`;
const siteBaseUrl = `http://localhost:${sitePort}`;
const testerPassword = process.env.MOCHI_SOCIAL_TESTER_PASSWORD
  || process.env.MOCHI_SOCIAL_RESPONSIVE_SITE_PASSWORD
  || process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD
  || '';
const serverToken = `local-site-iframe-token-${Date.now().toString(36)}`;
const saveDir = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_SAVE_DIR || `.local/site-iframe/${runId}/saves`);
const startupTimeoutMs = Number(process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_STARTUP_TIMEOUT_MS || 90000);
const commandTimeoutMs = Number(process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_COMMAND_TIMEOUT_MS || 300000);

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'Local-only Mochirii site iframe proof. Starts the built game and local Mochirii Next page, unlocks tester-password mode, runs responsive gameplay with the real /games/mochi-social iframe, and writes no-secret evidence.',
  runId,
  gameBaseUrl,
  siteBaseUrl,
  siteRepoPath: pathForReport(siteRepoPath),
  responsiveReportPath: pathForReport(responsiveReportPath),
  screenshotDir: pathForReport(screenshotDir),
  passwordProvided: Boolean(testerPassword),
  git: readGitState(root),
  siteGit: existsSync(siteRepoPath) ? readGitState(siteRepoPath) : null,
  commands: [],
  servers: {
    game: null,
    site: null
  },
  checks: []
};

let gameProcess;
let siteProcess;
let gameStdout = '';
let gameStderr = '';
let siteStdout = '';
let siteStderr = '';
let exitCode = 0;

try {
  await run();
  report.ok = true;
} catch (error) {
  report.error = sanitize(error instanceof Error ? error.message : String(error));
  exitCode = 1;
} finally {
  await stopProcessTree(siteProcess);
  await stopProcessTree(gameProcess);
  recordServerOutput();
  await writeReport();
  if (report.ok) {
    console.log(`Mochi Social local site iframe proof passed for ${siteBaseUrl}/games/mochi-social`);
    console.log(`Report: ${reportPath}`);
  } else {
    console.error('Mochi Social local site iframe proof failed:');
    console.error(report.error);
    console.error(`Report: ${reportPath}`);
  }
  process.exitCode = exitCode;
}

async function run() {
  assert(existsSync(resolve(siteRepoPath, 'package.json')), `Mochirii site repo was not found at ${siteRepoPath}.`);
  assert(existsSync(resolve(siteWebPath, 'package.json')), `Mochirii apps/web package was not found at ${siteWebPath}.`);
  assert(Boolean(testerPassword), 'MOCHI_SOCIAL_TESTER_PASSWORD or MOCHI_SOCIAL_LOCAL_SITE_IFRAME_PASSWORD is required for the local tester-password iframe proof.');

  if (process.env.MOCHI_SOCIAL_LOCAL_SITE_IFRAME_SKIP_BUILD !== 'true') {
    await runCommand('build', npmCommand(), ['run', 'build'], root, process.env);
  }

  await mkdir(dirname(reportPath), { recursive: true });
  await mkdir(dirname(responsiveReportPath), { recursive: true });
  await mkdir(screenshotDir, { recursive: true });

  await startGameServer();
  await waitForUrl(`${gameBaseUrl}/healthz`, 'game health');
  await startSiteServer();
  await waitForUrl(`${siteBaseUrl}/games/mochi-social`, 'Mochirii site game page');
  await runCommand('alpha:responsive-gameplay site iframe', process.execPath, ['scripts/check-alpha-responsive-gameplay.mjs'], root, responsiveEnv());
  verifyResponsiveSiteIframeReport();
}

async function startGameServer() {
  gameProcess = spawn(process.execPath, ['apps/game/dist/server/express.js'], {
    cwd: root,
    env: gameServerEnv(),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  gameProcess.stdout?.on('data', (chunk) => {
    gameStdout += String(chunk);
  });
  gameProcess.stderr?.on('data', (chunk) => {
    gameStderr += String(chunk);
  });
}

async function startSiteServer() {
  siteProcess = spawn(npmCommand(), ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', String(sitePort)], {
    cwd: siteWebPath,
    env: siteServerEnv(),
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  siteProcess.stdout?.on('data', (chunk) => {
    siteStdout += String(chunk);
  });
  siteProcess.stderr?.on('data', (chunk) => {
    siteStderr += String(chunk);
  });
}

function gameServerEnv() {
  const env = localEnv();
  env.PORT = String(gamePort);
  env.MOCHI_SOCIAL_PUBLIC_ORIGIN = gameBaseUrl;
  env.MOCHI_SOCIAL_GAME_SERVER_TOKEN = serverToken;
  env.RPG_ALLOWED_ORIGINS = siteBaseUrl;
  return env;
}

function siteServerEnv() {
  return {
    ...process.env,
    PORT: String(sitePort),
    NEXT_PUBLIC_MOCHI_SOCIAL_URL: gameBaseUrl,
    MOCHI_SOCIAL_ALPHA_ACCESS_MODE: 'tester-password',
    MOCHI_SOCIAL_TESTER_PASSWORD: testerPassword,
    MOCHI_SOCIAL_SITE_ORIGIN: siteBaseUrl,
    MOCHI_SOCIAL_GAME_CONTRACT_URL: gameBaseUrl
  };
}

function responsiveEnv() {
  const env = localEnv();
  env.MOCHI_SOCIAL_BASE_URL = gameBaseUrl;
  env.MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL = siteBaseUrl;
  env.MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME = 'true';
  env.MOCHI_SOCIAL_TESTER_PASSWORD = testerPassword;
  env.MOCHI_SOCIAL_RESPONSIVE_REPORT = responsiveReportPath;
  env.MOCHI_SOCIAL_RESPONSIVE_SCREENSHOT_DIR = screenshotDir;
  env.MOCHI_SOCIAL_RESPONSIVE_TIMEOUT_MS = String(Number(process.env.MOCHI_SOCIAL_RESPONSIVE_TIMEOUT_MS || 40000));
  return env;
}

function localEnv() {
  const env = {
    ...process.env,
    RPG_SAVE_DIR: saveDir,
    MOCHI_SOCIAL_ALPHA_LEDGER_PATH: resolve(saveDir, 'alpha-ledger.jsonl'),
    SUPABASE_AUTH_REQUIRED: 'false',
    MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE: 'false',
    MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE: 'false'
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

async function waitForUrl(url, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < startupTimeoutMs) {
    if (gameProcess && gameProcess.exitCode !== null) throw new Error(`Game server exited before ${label} was ready with code ${gameProcess.exitCode}.`);
    if (siteProcess && siteProcess.exitCode !== null) throw new Error(`Site server exited before ${label} was ready with code ${siteProcess.exitCode}.`);

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        report.checks.push({ name: label, url: redactUrl(url), status: response.status });
        return;
      }
      report.checks.push({ name: label, url: redactUrl(url), status: response.status });
    } catch {
      await delay(500);
    }
  }

  throw new Error(`${label} did not become ready within ${startupTimeoutMs}ms at ${redactUrl(url)}.`);
}

async function runCommand(name, command, args, cwd, env) {
  const startedAt = Date.now();
  const result = await exec(command, args, cwd, env);
  report.commands.push({
    name,
    command: [command, ...args].join(' '),
    cwd: pathForReport(cwd),
    status: result.status,
    durationMs: Date.now() - startedAt,
    stdout: sanitize(result.stdout),
    stderr: sanitize(result.stderr)
  });
  if (result.status !== 0) throw new Error(`${name} failed with exit code ${result.status}.`);
}

function exec(command, args, cwd, env) {
  return new Promise((resolvePromise) => {
    const processHandle = spawn(command, args, {
      cwd,
      env,
      shell: shouldUseShell(command),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      stderr += `\nCommand exceeded ${commandTimeoutMs}ms timeout.`;
      stopProcessTree(processHandle);
    }, commandTimeoutMs);

    const resolveOnce = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise(result);
    };

    processHandle.stdout?.on('data', (chunk) => {
      stdout += String(chunk);
    });
    processHandle.stderr?.on('data', (chunk) => {
      stderr += String(chunk);
    });
    processHandle.on('error', (error) => {
      resolveOnce({ status: 1, stdout, stderr: `${stderr}\n${error.message}` });
    });
    processHandle.on('close', (status) => {
      resolveOnce({ status: timedOut ? 124 : status ?? 1, stdout, stderr });
    });
  });
}

function verifyResponsiveSiteIframeReport() {
  assert(existsSync(responsiveReportPath), `Responsive site iframe report was not written at ${responsiveReportPath}.`);
  const responsive = JSON.parse(readFileSync(responsiveReportPath, 'utf8'));
  const siteResults = Array.isArray(responsive.siteIframeResults) ? responsive.siteIframeResults : [];
  assert(responsive.ok === true, 'Responsive site iframe report must be ok.');
  assert(responsive.site?.configured === true, 'Responsive site iframe report must record configured=true.');
  assert(responsive.site?.required === true, 'Responsive site iframe report must record required=true.');
  assert(responsive.site?.status === 'checked', 'Responsive site iframe report must record site.status=checked.');
  assert(responsive.site?.entryPath === '/games/mochi-social', 'Responsive site iframe report must target /games/mochi-social.');
  assert(siteResults.length === 9, `Responsive site iframe report must cover all nine viewports, found ${siteResults.length}.`);
  assert(siteResults.every((result) => result.screenshot?.bytes > 1000), 'Responsive site iframe screenshots must be non-empty.');
  assert(siteResults.every((result) => result.inputOwnership?.gameplay?.checks?.length === responsive.gameplayKeys?.length), 'Responsive site iframe report must include per-key gameplay input proof for every viewport.');
  report.checks.push({
    name: 'responsive site iframe report',
    status: 200,
    siteIframeResults: siteResults.length,
    responsiveReportPath: pathForReport(responsiveReportPath)
  });
}

async function stopProcessTree(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  if (process.platform === 'win32' && processHandle.pid) {
    spawnSync('taskkill', ['/pid', String(processHandle.pid), '/t', '/f'], {
      encoding: 'utf8',
      shell: false
    });
    await delay(500);
    return;
  }
  processHandle.kill();
  await Promise.race([
    new Promise((resolvePromise) => processHandle.once('exit', resolvePromise)),
    delay(3000).then(() => {
      if (processHandle.exitCode === null) processHandle.kill('SIGKILL');
    })
  ]);
}

function recordServerOutput() {
  report.servers.game = {
    stdout: sanitize(gameStdout),
    stderr: sanitize(gameStderr),
    exitCode: gameProcess?.exitCode ?? null,
    exitSignal: gameProcess?.signalCode ?? null,
    stopped: gameProcess ? gameProcess.exitCode !== null || gameProcess.signalCode !== null : true
  };
  report.servers.site = {
    stdout: sanitize(siteStdout),
    stderr: sanitize(siteStderr),
    exitCode: siteProcess?.exitCode ?? null,
    exitSignal: siteProcess?.signalCode ?? null,
    stopped: siteProcess ? siteProcess.exitCode !== null || siteProcess.signalCode !== null : true
  };
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

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function shouldUseShell(command) {
  return process.platform === 'win32' && /\.(?:cmd|bat)$/i.test(String(command || ''));
}

function readGitState(cwd) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  const localHead = git(['rev-parse', 'HEAD'], cwd);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd);
  const worktree = git(['status', '--porcelain'], cwd);
  return {
    branch: firstLine(branch.stdout),
    localHead: firstLine(localHead.stdout),
    upstream: firstLine(upstream.stdout),
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function git(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
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

function redactUrl(value) {
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return String(value || '').replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

function pathForReport(value) {
  const absolutePath = resolve(String(value || ''));
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath.replace(/\\/g, '/');
}

function sanitize(value) {
  let text = String(value || '');
  if (testerPassword) text = text.split(testerPassword).join('<redacted-tester-password>');
  return text
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .replace(/\blocal-site-iframe-token-[a-z0-9]+\b/gi, '<redacted-local-site-iframe-token>')
    .slice(0, 3000);
}
