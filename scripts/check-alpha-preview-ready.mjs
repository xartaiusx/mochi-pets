import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';

const root = process.cwd();
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_PREVIEW_READY_JSON || 'reports/alpha-preview-ready.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_PREVIEW_READY_MD || 'reports/alpha-preview-ready.md');
const handoffPath = resolve(credsDir, 'mochi-social-alpha-preview-ready.md');
const requirements = [];

await run();

async function run() {
  addStaticContractRequirement();
  addBranchSyncRequirement('preview.game-branch-sync', root, 'Local game branch');
  if (existsSync(siteRepoPath)) {
    addBranchSyncRequirement('preview.site-branch-sync', siteRepoPath, 'Local Mochirii site branch');
  } else {
    add('preview.site-branch-sync', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`, { path: siteRepoPath });
  }

  addCommandRequirement('preview.unity-verify', 'Unity EditMode, PlayMode, and WebGL build verification passed.', commandForPlatform('npm'), ['run', 'unity:verify']);
  addCommandRequirement('preview.unity-cloud-code-contract', 'Unity Cloud Code shared-pet authority contract passed.', commandForPlatform('npm'), ['run', 'unity:cloud-code-contract']);
  addCommandRequirement('preview.build-release', 'Node 24 and Unity WebGL release build passed.', commandForPlatform('npm'), ['run', 'build:release']);
  addCommandRequirement('preview.built-server-smoke', 'Built server Unity WebGL smoke passed.', commandForPlatform('npm'), ['run', 'alpha:built-server-smoke']);
  await addUnityRequiredRuntimeSmokeRequirement();
  addCommandRequirement('preview.typecheck', 'TypeScript checks passed.', commandForPlatform('npm'), ['run', 'typecheck']);
  addCommandRequirement('preview.lint', 'Lint checks passed.', commandForPlatform('npm'), ['run', 'lint']);
  addCommandRequirement('preview.tests', 'Automated tests passed.', commandForPlatform('npm'), ['test']);
  addCommandRequirement('preview.secret-scan', 'Secret scan passed.', commandForPlatform('npm'), ['run', 'secret-scan']);
  addCommandRequirement('preview.public-copy', 'Player-facing alpha copy guard passed.', commandForPlatform('npm'), ['run', 'alpha:public-copy']);
  addCommandRequirement('preview.diff-check', 'Git whitespace check passed.', 'git', ['diff', '--check']);

  addCurrentOkReport('preview.built-server-report', 'Built server smoke report is current and green.', 'reports/built-server-smoke.json', root);
  addCurrentOkReport('preview.load-smoke-report', 'Unity shared-room load smoke report is current and green.', 'reports/alpha-load-smoke.json', root);

  const summary = summarize(requirements);
  const report = {
    ok: summary.failed === 0 && summary.unverified === 0,
    checkedAt: new Date().toISOString(),
    scope: 'Mochi Social Alpha Preview Ready local game audit. This Unity-first report proves the deployable local game runtime only; it does not authorize provider mutations, hosted checks, production deploys, paid resources, Enjin funding, or chain operations.',
    alphaStopPoint: 'alpha-preview-ready',
    fundedChainRequiredForPreview: false,
    hostedChecksPerformed: false,
    providerMutationPerformed: false,
    git: readGitState(root),
    siteGit: existsSync(siteRepoPath) ? readGitState(siteRepoPath) : null,
    summary,
    requirements
  };

  const markdown = renderMarkdown(report);
  await mkdir(dirname(reportPath), { recursive: true });
  await mkdir(dirname(handoffPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(reportMdPath, markdown, 'utf8');
  await writeFile(handoffPath, markdown, 'utf8');

  if (!report.ok) {
    console.error('Mochi Social Alpha Preview Ready audit is not ready:');
    for (const item of requirements.filter((entry) => entry.status !== 'pass')) {
      console.error(`- ${item.id}: ${item.status} - ${item.message}`);
    }
    console.error(`Report: ${reportPath}`);
    process.exit(1);
  }

  console.log(`Mochi Social Alpha Preview Ready local game audit passed. Report: ${reportPath}`);
  console.log(`Markdown: ${reportMdPath}`);
}

function addStaticContractRequirement() {
  const packageJson = readText(resolve(root, 'package.json'));
  const manifestSource = readText(resolve(root, 'apps/game/src/integration/manifest.ts'));
  const expressSource = readText(resolve(root, 'apps/game/src/entries/express.ts'));
  const failures = [];

  for (const snippet of [
    '"node": ">=24.17.0 <25"',
    '"unity:verify"',
    '"unity:cloud-code-contract"',
    '"build:release"',
    '"alpha:built-server-smoke"',
    '"secret-scan"',
    '"alpha:public-copy"'
  ]) {
    if (!packageJson.includes(snippet)) failures.push(`package.json missing ${snippet}`);
  }

  for (const snippet of [
    "engine: 'unity-webgl'",
    'activeRuntime:',
    "mode: 'single-shared-room'",
    'capacity: 25',
    "sharedPetKey: 'lirabao'",
    "playerCharacterKey: 'character.v1'",
    "sharedPetKey: 'room:jade-lantern-room/sharedPet.v1'",
    "realtimeAuthority: 'ugs-distributed-authority'",
    "stateAuthority: 'ugs-cloud-save'",
    "artDirection: 'Mochirii courtyard 3D'",
    "fundedChainRequiredForPreview: false"
  ]) {
    if (!manifestSource.includes(snippet) && !expressSource.includes(snippet)) failures.push(`runtime contract missing ${snippet}`);
  }

  for (const forbidden of [
    "app.post('/integration/alpha/enjin/submit'",
    'MOCHI_SOCIAL_ENABLE_FUTURE_CHAIN_ROUTES',
    'configured-preview-stub',
    'chainRuntime'
  ]) {
    if (expressSource.includes(forbidden)) failures.push(`deployable Express surface still contains ${forbidden}`);
  }

  add('preview.static-contract', failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : 'Unity shared-room deploy contract is encoded locally.', {
    files: ['package.json', 'apps/game/src/integration/manifest.ts', 'apps/game/src/entries/express.ts']
  });
}

async function addUnityRequiredRuntimeSmokeRequirement() {
  const port = Number(process.env.MOCHI_SOCIAL_PREVIEW_READY_PORT || await findFreePort());
  const baseUrl = `http://localhost:${port}`;
  const saveDir = resolve(root, '.local/preview-ready/saves');
  const startedAt = Date.now();
  const server = spawn(process.execPath, ['dist/server/express.js'], {
    cwd: resolve(root, 'apps/game'),
    env: {
      ...process.env,
      PORT: String(port),
      MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
      SUPABASE_AUTH_REQUIRED: 'false',
      MOCHI_SOCIAL_GAME_SERVER_TOKEN: 'local-preview-ready-token',
      MOCHI_SOCIAL_PUBLIC_ORIGIN: baseUrl,
      RPG_SAVE_DIR: saveDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';
  server.stdout?.on('data', (chunk) => {
    stdout += String(chunk);
  });
  server.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
  });

  try {
    await waitForHealth(server, baseUrl);
    const smoke = runCommand(commandForPlatform('npm'), ['run', 'smoke'], {
      MOCHI_SOCIAL_BASE_URL: baseUrl,
      MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
      RPG_SAVE_DIR: saveDir
    });
    const load = runCommand(commandForPlatform('npm'), ['run', 'alpha:load-smoke'], {
      MOCHI_SOCIAL_BASE_URL: baseUrl,
      MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL: 'true',
      RPG_SAVE_DIR: saveDir,
      MOCHI_SOCIAL_LOAD_PLAYERS: '25'
    });
    const failures = [];
    if (smoke.status !== 0) failures.push(`Unity-required smoke failed with exit ${smoke.status}`);
    if (load.status !== 0) failures.push(`25-tester load smoke failed with exit ${load.status}`);
    add('preview.unity-required-smoke', failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : 'Unity-required smoke and 25-tester shared-room load smoke passed.', {
      baseUrl,
      durationMs: Date.now() - startedAt,
      smoke: summarizeCommand(smoke),
      load: summarizeCommand(load),
      server: {
        stdout: sanitize(stdout),
        stderr: sanitize(stderr)
      }
    });
  } catch (error) {
    add('preview.unity-required-smoke', 'fail', error instanceof Error ? error.message : String(error), {
      baseUrl,
      server: {
        stdout: sanitize(stdout),
        stderr: sanitize(stderr)
      }
    });
  } finally {
    await stopServer(server);
  }
}

function addCurrentOkReport(id, message, relativePath, repoPath) {
  const reportJson = readJson(resolve(root, relativePath));
  if (!reportJson.ok) {
    add(id, 'fail', `${message} Report is missing or invalid: ${reportJson.message}.`, { path: relativePath });
    return;
  }

  const failures = currentGitStateFailures(reportJson.data?.git, repoPath, `${relativePath} git state`);
  if (reportJson.data?.ok !== true) failures.push(`${relativePath} is not ok`);
  add(id, failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : message, {
    path: relativePath,
    checkedAt: reportJson.data?.checkedAt
  });
}

function addCommandRequirement(id, passMessage, command, args) {
  const result = runCommand(command, args);
  add(id, result.status === 0 ? 'pass' : 'fail', result.status === 0 ? passMessage : `${command} ${args.join(' ')} failed with exit code ${result.status}.`, summarizeCommand(result));
}

function addBranchSyncRequirement(id, repoPath, label) {
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoPath);
  const aheadBehind = git(['rev-list', '--left-right', '--count', 'HEAD...@{u}'], repoPath);
  const status = git(['status', '--porcelain'], repoPath);
  const failures = [];
  let ahead = 0;
  let behind = 0;

  if (!upstream.ok) failures.push(`${label} has no upstream branch.`);
  if (aheadBehind.ok) {
    const [aheadText, behindText] = firstLine(aheadBehind.stdout).split(/\s+/);
    ahead = Number(aheadText || 0);
    behind = Number(behindText || 0);
    if (ahead !== 0 || behind !== 0) failures.push(`${label} is ahead ${ahead} / behind ${behind} relative to upstream.`);
  } else {
    failures.push(`${label} ahead/behind state could not be read.`);
  }

  const dirty = status.ok ? status.stdout.split(/\r?\n/).filter(Boolean) : ['git status unavailable'];
  if (dirty.length) failures.push(`${label} worktree is dirty.`);

  add(id, failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : `${label} is clean and synced to upstream.`, {
    path: repoPath,
    upstream: firstLine(upstream.stdout),
    ahead,
    behind,
    dirty
  });
}

function currentGitStateFailures(state, repoPath, label) {
  const failures = [];
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath);
  const localHead = git(['rev-parse', 'HEAD'], repoPath);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoPath);
  const dirty = git(['status', '--porcelain'], repoPath);
  if (!state) failures.push(`${label} must include git state`);
  if (!branch.ok) failures.push(`${label} current branch could not be read`);
  if (!localHead.ok) failures.push(`${label} current HEAD could not be read`);
  if (!upstream.ok) failures.push(`${label} current upstream could not be read`);
  if (!dirty.ok) failures.push(`${label} current worktree status could not be read`);
  if (!state || !branch.ok || !localHead.ok || !upstream.ok || !dirty.ok) return failures;

  const currentDirty = dirty.stdout.split(/\r?\n/).filter(Boolean);
  if (state.branch !== firstLine(branch.stdout)) failures.push(`${label} branch does not match current branch`);
  if (state.localHead !== firstLine(localHead.stdout)) failures.push(`${label} localHead does not match current HEAD`);
  if (state.upstream !== firstLine(upstream.stdout)) failures.push(`${label} upstream does not match current upstream`);
  if (!Array.isArray(state.dirty) || state.dirty.length !== currentDirty.length) failures.push(`${label} dirty state does not match current worktree`);
  return failures;
}

async function waitForHealth(serverProcess, baseUrl) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 20000) {
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
  throw new Error('Built server did not become ready within 20000ms.');
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill();
  await Promise.race([
    new Promise((resolvePromise) => serverProcess.once('exit', resolvePromise)),
    delay(3000).then(() => {
      if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
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

function runCommand(command, args, env = {}) {
  const normalizedCommand = String(command).toLowerCase();
  const npmExecPath = process.env.npm_execpath || '';
  const useNpmCli = (normalizedCommand === 'npm' || normalizedCommand === 'npm.cmd') && npmExecPath;
  const actualCommand = useNpmCli ? process.execPath : command;
  const actualArgs = useNpmCli ? [npmExecPath, ...args] : args;
  const displayCommand = `${normalizedCommand === 'npm.cmd' ? 'npm' : command} ${args.join(' ')}`;
  const result = spawnSync(actualCommand, actualArgs, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    env: { ...process.env, ...env }
  });
  return {
    command: displayCommand,
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function summarizeCommand(result) {
  return {
    command: result.command,
    status: result.status,
    stdout: sanitize(result.stdout),
    stderr: sanitize(result.stderr)
  };
}

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function readText(file) {
  return existsSync(file) ? readFileSync(file, 'utf8') : '';
}

function git(args, cwd = root) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function readGitState(repoPath) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath);
  const localHead = git(['rev-parse', 'HEAD'], repoPath);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoPath);
  const dirty = git(['status', '--porcelain'], repoPath);
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

function add(id, status, message, evidence = {}) {
  requirements.push({ id, status, message, evidence });
}

function summarize(items) {
  return {
    total: items.length,
    passed: items.filter((item) => item.status === 'pass').length,
    failed: items.filter((item) => item.status === 'fail').length,
    unverified: items.filter((item) => item.status === 'unverified').length
  };
}

function renderMarkdown(summaryReport) {
  const rows = summaryReport.requirements
    .map((item) => `| ${item.id} | ${item.status} | ${item.message.replace(/\|/g, '/')} |`)
    .join('\n');
  const failures = summaryReport.requirements
    .filter((item) => item.status !== 'pass')
    .map((item) => `- ${item.id}: ${item.message}`)
    .join('\n') || '- None';

  return `# Mochi Social Alpha Preview Ready Local Game Audit

Generated: ${summaryReport.checkedAt}

This file is intentionally no-secret. It proves the local Unity WebGL game build and shared-room server contract only. It does not approve provider mutations, hosted checks, production deploys, paid resources, Enjin funding, or chain operations.

## Result

- Ready locally: ${summaryReport.ok ? 'yes' : 'no'}
- Passed: ${summaryReport.summary.passed}/${summaryReport.summary.total}
- Alpha stop point: ${summaryReport.alphaStopPoint}
- Funded-chain required for Preview Ready: ${summaryReport.fundedChainRequiredForPreview ? 'yes' : 'no'}
- Hosted checks performed: ${summaryReport.hostedChecksPerformed ? 'yes' : 'no'}
- Provider mutation performed: ${summaryReport.providerMutationPerformed ? 'yes' : 'no'}

## Requirements

| Requirement | Status | Message |
| --- | --- | --- |
${rows}

## Remaining Local Game Work

${failures}
`;
}

function commandForPlatform(command) {
  if (process.platform === 'win32' && command === 'npm') return 'npm.cmd';
  return command;
}

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function delay(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 2500);
}
