import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { brotliDecompressSync } from 'node:zlib';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const reportPath = resolve(root, process.env.MOCHI_PETS_BUILT_SERVER_REPORT || 'reports/built-server-smoke.json');
const unityFrameworkPath = resolve(root, 'unity/Builds/WebGL/Build/WebGL.framework.js.br');
const port = Number(process.env.MOCHI_PETS_BUILT_SERVER_PORT || await findFreePort());
const baseUrl = `http://localhost:${port}`;
const token = 'local-built-server-smoke-token';
const timeoutMs = Number(process.env.MOCHI_PETS_BUILT_SERVER_TIMEOUT_MS || 20000);

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  scope: 'Local-only built Express server smoke. Starts dist/server/express.js with Unity WebGL required and throwaway secrets.',
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
    console.log(`Mochi Pets built server smoke passed for ${baseUrl}`);
    console.log(`Report: ${reportPath}`);
  } else {
    console.error('Mochi Pets built server smoke failed:');
    console.error(report.error);
    console.error(`Report: ${reportPath}`);
  }
  process.exitCode = exitCode;
}

async function run() {
  verifyUnityBridgeBuild();

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
  assert(health.body.ok === true && health.body.name === 'Mochi Pets', 'Built server health check must identify Mochi Pets.');
  assert(health.body.activeRuntime === 'unity-webgl', 'Built server health check must serve Unity WebGL when required.');
  assert(health.body.unityWebglBuild?.present === true, 'Built server health check must see the local Unity WebGL build.');
  assert(health.body.unityWebglBuild?.required === true, 'Built server health check must require Unity WebGL for release smoke.');
  assert(health.body.legacyFallback?.active === false, 'Built server health check must report legacy fallback inactive.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assert(manifest.body.name === 'Mochi Pets', 'Built server manifest must identify Mochi Pets.');
  assert(manifest.body.engine === 'unity-webgl', 'Built server manifest must expose Unity WebGL as the engine.');
  assert(manifest.body.activeRuntime === 'unity-webgl', 'Built server manifest must report Unity WebGL as the active runtime.');
  assert(manifest.body.unityWebglBuild?.present === true, 'Built server manifest must report a present Unity WebGL build.');
  assert(manifest.body.unityWebglBuild?.required === true, 'Built server manifest must report Unity WebGL as required.');
  assert(manifest.body.legacyFallback?.active === false, 'Built server manifest must not use legacy fallback for release smoke.');
  assert(manifest.body.room?.mode === 'single-shared-room', 'Built server manifest must expose the Unity single shared room.');
  assert(manifest.body.room?.capacity === 25, 'Built server manifest must expose the 25-tester Unity room capacity.');
  assert(manifest.body.room?.sharedPetKey === 'lirabao', 'Built server manifest must expose Lirabao as the shared starter pet.');
  assert(manifest.body.runtime?.realtimeAuthority === 'ugs-distributed-authority', 'Built server manifest must expose UGS Distributed Authority.');
  assert(manifest.body.runtime?.stateAuthority === 'ugs-cloud-save', 'Built server manifest must expose UGS Cloud Save.');
  assert(manifest.body.alpha?.noRealValue === true, 'Built server manifest must keep no-real-value posture.');
  assertNoFutureSystemKeys(manifest.body, 'Built server manifest');
  assert(manifest.body.alphaPreview?.stopPoint === 'alpha-preview-ready', 'Built server manifest must expose Alpha Preview Ready as the website stop point.');
  assert(manifest.body.alphaPreview?.providerMutationAllowedByDefault === false, 'Built server manifest must reject provider mutation by default.');
  assert(manifest.body.alphaPreview?.fundedChainRequiredForPreview === false, 'Built server manifest must not require funded-chain gates for Preview Ready.');
  assert(manifest.body.progress?.authority === 'mochirii-edge', 'Built server manifest must expose Mochirii Edge account-progress authority.');
  assert(manifest.body.progress?.snapshotEndpoint === '/integration/alpha/progress', 'Built server manifest must expose the local progress snapshot endpoint.');
  assert(manifest.body.cleanRoom?.restrictedSourceReferences === false, 'Built server manifest must declare zero restricted-source references.');
  assert(manifest.body.cleanRoom?.copiedRestrictedSourceAssets === false, 'Built server manifest must declare zero copied restricted-source assets.');
  assert(manifest.body.brand?.artDirection === 'Mochirii courtyard 3D', 'Built server manifest must expose Mochirii courtyard 3D art direction.');
  assert(manifest.body.sharedPet?.states?.includes('care_received'), 'Built server manifest must expose Lirabao care state.');
  assert(!('playableContent' in manifest.body), 'Built server manifest must not expose legacy playable content catalog.');
  assert(!('chainRuntime' in manifest.body), 'Built server manifest must not expose future chain runtime state.');

  const alpha = await getJson('/integration/alpha/status', 'alpha status');
  assert(alpha.body.engine === 'unity-webgl', 'Built server alpha status must expose Unity WebGL as the engine.');
  assert(alpha.body.activeRuntime === 'unity-webgl', 'Built server alpha status must report Unity WebGL as the active runtime.');
  assert(alpha.body.unityWebglBuild?.present === true, 'Built server alpha status must report a present Unity WebGL build.');
  assert(alpha.body.room?.mode === 'single-shared-room', 'Built server alpha status must expose the Unity single shared room.');
  assert(alpha.body.room?.capacity === 25, 'Built server alpha status must expose the 25-tester Unity room capacity.');
  assert(alpha.body.room?.sharedPetKey === 'lirabao', 'Built server alpha status must expose Lirabao as the shared starter pet.');
  assertNoFutureSystemKeys(alpha.body, 'Built server alpha status');
  assert(!('chainRuntime' in alpha.body), 'Built server alpha status must not expose future chain runtime state.');
  assert(!('enjinCanaryConfigured' in alpha.body), 'Built server alpha status must not expose future chain provider state.');
  assert(alpha.body.edgeFunctions?.progress === 'mochi-pets-alpha-progress', 'Built server alpha status must expose the progress Edge Function name.');

  const progress = await getJson('/integration/alpha/progress', 'guest progress');
  assert(progress.body.ok === true, 'Guest progress endpoint must stay playable without Supabase auth.');
  assert(progress.body.mode === 'guest-local', 'Guest progress endpoint must identify local guest fallback.');

  const play = await request('/play', 'play route');
  assert(play.status === 200 && isUnityWebglHtml(play.body), 'Built server /play must return the Unity WebGL HTML.');
  assert(hasUnityBridgeGuard(play.body), 'Built server /play must install the Unity bridge origin and auth endpoint guard.');

  const embed = await request('/embed', 'embed route');
  assert(embed.status === 200 && isUnityWebglHtml(embed.body), 'Built server /embed must return the Unity WebGL HTML.');
  assert(hasUnityBridgeGuard(embed.body), 'Built server /embed must install the Unity bridge origin and auth endpoint guard.');

  const frameworkAsset = await request('/Build/WebGL.framework.js.br', 'Unity framework brotli asset', { method: 'HEAD' });
  assert(frameworkAsset.status === 200, 'Built server must serve the Unity WebGL framework asset.');
  assert(frameworkAsset.contentEncoding === 'br', 'Built server must serve Brotli Unity assets with Content-Encoding: br.');
  assert(frameworkAsset.contentType.includes('application/javascript'), 'Built server must serve the Unity framework asset as JavaScript.');

  const wasmAsset = await request('/Build/WebGL.wasm.br', 'Unity wasm brotli asset', { method: 'HEAD' });
  assert(wasmAsset.status === 200, 'Built server must serve the Unity WebGL wasm asset.');
  assert(wasmAsset.contentEncoding === 'br', 'Built server must serve Brotli Unity wasm with Content-Encoding: br.');
  assert(wasmAsset.contentType.includes('application/wasm'), 'Built server must serve the Unity wasm asset as application/wasm.');
}

function verifyUnityBridgeBuild() {
  const framework = brotliDecompressSync(readFileSync(unityFrameworkPath)).toString('utf8');
  assert(framework.includes('MochiPetsBridgeRuntime'), 'Unity WebGL framework must include the Mochi Pets bridge runtime helper.');
  assert(framework.includes('__MOCHI_PETS_UNITY_RUNTIME_READY'), 'Unity WebGL framework must publish a browser runtime-ready marker after C# bootstrap.');
  assert(framework.includes('__MOCHI_PETS_UNITY_LAST_EVENT'), 'Unity WebGL framework must publish the latest browser bridge event for local evidence.');
  assert(framework.includes('__MOCHI_PETS_UNITY_BRIDGE_CONFIG'), 'Unity WebGL framework must read the served bridge config.');
  assert(framework.includes('isAllowedParentOrigin'), 'Unity WebGL framework must check parent origins before accepting auth messages.');
  assert(framework.includes('targetParentOrigin'), 'Unity WebGL framework must target a configured parent origin for replies.');
  assert(!framework.includes('payload.functionsUrl || payload.supabaseFunctionsUrl'), 'Unity WebGL framework must not trust parent-supplied Supabase function URLs.');
  assert(!framework.includes('payload.unityAuthUrl || data.unityAuthUrl'), 'Unity WebGL framework must not trust parent-supplied Unity auth URLs.');
  assert(!framework.includes('payload.supabaseUrl || data.supabaseUrl'), 'Unity WebGL framework must not trust parent-supplied Supabase URLs.');
  assert(!framework.includes('postMessage(message, "*")'), 'Unity WebGL framework must not send bridge replies with a wildcard target origin.');
}

function buildServerEnv() {
  const env = {
    ...process.env,
    PORT: String(port),
    SUPABASE_AUTH_REQUIRED: 'false',
    MOCHI_PETS_REQUIRE_UNITY_WEBGL: 'true',
    MOCHI_PETS_GAME_SERVER_TOKEN: token,
    MOCHI_PETS_PUBLIC_ORIGIN: baseUrl,
    RPG_SAVE_DIR: resolve(root, '.local/built-server-smoke/saves')
  };

  delete env.ENJIN_PLATFORM_TOKEN;
  delete env.ENJIN_COLLECTION_ID;
  delete env.ENJIN_FUEL_TANK_ID;
  delete env.MOCHI_PETS_SUPABASE_FUNCTIONS_URL;
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
  const contentEncoding = response.headers.get('content-encoding') || '';
  const text = init.method === 'HEAD' ? '' : await response.text();
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  const result = { name, path, status: response.status, contentType, contentEncoding, body };
  report.checks.push(result);
  return result;
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

function assertNoFutureSystemKeys(body, label) {
  const text = JSON.stringify(body);
  assert(!/\b(?:market|trade|cashout)\b/i.test(text), `${label} must not publish future economy keys for the Unity shared-room alpha.`);
}

function isUnityWebglHtml(value) {
  return /createUnityInstance|Build\/.+\.loader\.js|Unity WebGL/i.test(String(value || ''));
}

function hasUnityBridgeGuard(value) {
  const html = String(value || '');
  return html.includes('data-mochi-pets-unity-bridge-config') &&
    html.includes('__MOCHI_PETS_UNITY_BRIDGE_CONFIG') &&
    html.includes('allowedParentOrigins.has(event.origin)') &&
    html.includes('sanitizeAuthMessage(event.data)');
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
