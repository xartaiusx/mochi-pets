import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_EVIDENCE_JSON || 'reports/alpha-local-evidence.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_EVIDENCE_MD || 'reports/alpha-local-evidence.md');
const failures = [];

const localSuite = readJson('reports/alpha-local-suite.json');
const builtServer = readJson('reports/built-server-smoke.json');
const acceptance = readJson('reports/alpha-local-acceptance.json');
const loadSmoke = readJson('reports/alpha-load-smoke.json');
const browserPresence = readJson('reports/alpha-browser-presence.json');
const responsiveGameplay = readJson('reports/alpha-responsive-gameplay.json');
const visualSnapshot = readJson('reports/alpha-visual-snapshot.json');
const visualReview = readJson('reports/alpha-visual-review.json');
const walletDaemon = readJson('reports/wallet-daemon-local.json');
const operatorSmoke = readJson('reports/enjin-operator-smoke.json');
const gitState = readGitState();

assertReport('local suite', localSuite);
assertReport('built server smoke', builtServer);
assertReport('local acceptance', acceptance);
assertReport('load smoke', loadSmoke);
assertReport('browser presence', browserPresence);
assertReport('responsive gameplay', responsiveGameplay);
assertReport('visual snapshot', visualSnapshot);
assertReport('visual review', visualReview);
assertReport('Wallet Daemon local check', walletDaemon);
assertReport('Enjin operator smoke', operatorSmoke);

assertLocalUrl(localSuite.data?.baseUrl, 'local suite baseUrl');
assertLocalUrl(builtServer.data?.baseUrl, 'built server baseUrl');
assertLocalUrl(acceptance.data?.baseUrl, 'local acceptance baseUrl');
assertLocalUrl(loadSmoke.data?.baseUrl, 'load smoke baseUrl');
assertLocalUrl(browserPresence.data?.baseUrl, 'browser presence baseUrl');
assertLocalUrl(responsiveGameplay.data?.baseUrl, 'responsive gameplay baseUrl');
assertLocalUrl(visualSnapshot.data?.baseUrl, 'visual snapshot baseUrl');
assertLocalUrl(visualReview.data?.baseUrl, 'visual review baseUrl');
assertLocalUrl(operatorSmoke.data?.baseUrl, 'operator smoke baseUrl');

const suiteBaseUrl = normalizeUrl(localSuite.data?.baseUrl);
assertSameBaseUrl(acceptance.data?.baseUrl, suiteBaseUrl, 'local acceptance baseUrl');
assertSameBaseUrl(loadSmoke.data?.baseUrl, suiteBaseUrl, 'load smoke baseUrl');
assertSameBaseUrl(browserPresence.data?.baseUrl, suiteBaseUrl, 'browser presence baseUrl');
assertSameBaseUrl(responsiveGameplay.data?.baseUrl, suiteBaseUrl, 'responsive gameplay baseUrl');
assertSameBaseUrl(visualSnapshot.data?.baseUrl, suiteBaseUrl, 'visual snapshot baseUrl');
assertSameBaseUrl(visualReview.data?.baseUrl, suiteBaseUrl, 'visual review baseUrl');
assertSameBaseUrl(operatorSmoke.data?.baseUrl, suiteBaseUrl, 'operator smoke baseUrl');
assertCurrentGitState(localSuite.data?.git, 'local suite report');
assertCurrentGitState(builtServer.data?.git, 'built server smoke report');
assertCurrentGitState(visualReview.data?.git, 'visual review report');
assertCurrentGitState(walletDaemon.data?.git, 'Wallet Daemon local report');

const commandNames = Array.isArray(localSuite.data?.commands)
  ? localSuite.data.commands.map((command) => command.name)
  : [];
for (const command of ['build', 'alpha:wallet-daemon-check', 'smoke', 'alpha:local-acceptance', 'alpha:load-smoke', 'alpha:browser-presence', 'alpha:responsive-gameplay', 'alpha:visual-snapshot', 'alpha:visual-review', 'alpha:enjin-operator-smoke']) {
  if (!commandNames.includes(command)) failures.push(`local suite missing command: ${command}`);
}
if (Array.isArray(localSuite.data?.commands)) {
  for (const command of localSuite.data.commands) {
    if (command.status !== 0) failures.push(`local suite command failed: ${command.name}`);
  }
}

assert(localSuite.data?.server?.stopped === true, 'local suite server must stop after the run');
assert(builtServer.data?.server?.stopped === true, 'built server smoke server must stop after the run');
assert(loadSmoke.data?.playerCount >= 10 && loadSmoke.data?.playerCount <= 25, 'load smoke player count must stay 10-25');
assert(browserPresence.data?.localOnlyDefault === true && browserPresence.data?.hostedAllowed === false, 'browser presence must be local-only by default');
assert(browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true, 'browser presence must prove observer-side movement');
assert(responsiveGameplay.data?.localOnlyDefault === true && responsiveGameplay.data?.hostedAllowed === false, 'responsive gameplay must be local-only by default');
assert(responsiveGameplay.data?.viewports?.length === 9, 'responsive gameplay must cover the required nine-viewport matrix');
assert(responsiveGameplay.data?.routes?.includes('/play') && responsiveGameplay.data?.routes?.includes('/embed'), 'responsive gameplay must cover /play and /embed');
assert(responsiveGameplay.data?.results?.length === 18, 'responsive gameplay must cover both routes across all viewports');
assert(responsiveGameplay.data?.iframeResults?.length === 9, 'responsive gameplay must cover parent-iframe input ownership across all viewports');
assert(['skipped', 'checked'].includes(String(responsiveGameplay.data?.site?.status || '')), 'responsive gameplay must record Mochirii site iframe status');
if (responsiveGameplay.data?.site?.configured === true) {
  assert(responsiveGameplay.data?.site?.entryPath === '/games/mochi-social', 'responsive gameplay site iframe must target /games/mochi-social by default');
  assert(responsiveGameplay.data?.siteIframeResults?.length === 9, 'responsive gameplay must cover the Mochirii site iframe across all viewports when configured');
}
assert(responsiveGameplay.data?.gameplayKeys?.includes('ArrowDown') && responsiveGameplay.data?.gameplayKeys?.includes('Space'), 'responsive gameplay must test movement and action keys');
assert(responsiveGameplay.data?.results?.every?.((result) => result.screenshot?.bytes > 1000), 'responsive gameplay route screenshots must be non-empty');
assert(responsiveGameplay.data?.iframeResults?.every?.((result) => result.screenshot?.bytes > 1000), 'responsive gameplay iframe screenshots must be non-empty');
assert(visualSnapshot.data?.localOnlyDefault === true && visualSnapshot.data?.hostedAllowed === false, 'visual snapshot must be local-only by default');
assert(visualSnapshot.data?.screenshots?.page?.bytes > 1000, 'visual snapshot page PNG must be non-empty');
assert(visualSnapshot.data?.screenshots?.canvas?.bytes > 1000, 'visual snapshot canvas PNG must be non-empty');
assert(visualReview.data?.machineReview?.observerMovement === true, 'visual review must carry observer movement proof');
assert(visualReview.data?.manualPromptGate?.requiredBeforeAlphaRcReady === true, 'visual review must keep rendered prompt interaction as a manual pre-RC gate');
assert(walletDaemon.data?.scope?.includes('No-cost local Wallet Daemon binary check'), 'Wallet Daemon local check must stay no-cost and metadata-only');
if (walletDaemon.data?.status === 'verified-binary') {
  assert(walletDaemon.data?.binary?.bytes > 1024 * 1024, 'Wallet Daemon binary report must include plausible binary size');
  assert(/^[a-f0-9]{64}$/i.test(String(walletDaemon.data?.binary?.sha256 || '')), 'Wallet Daemon binary report must include SHA256');
  for (const command of ['import', 'print-seed', 'help']) {
    assert(walletDaemon.data?.binary?.helpCommands?.includes(command), `Wallet Daemon help output must list ${command}`);
  }
} else {
  assert(['not-configured', 'missing'].includes(walletDaemon.data?.status), 'Wallet Daemon local check must be verified-binary, not-configured, or missing');
}
assert(operatorSmoke.data?.scope?.includes('does not submit live Enjin operations by default'), 'operator smoke must remain fail-closed by default');
assert(builtServer.data?.checks?.some((check) => check.name === 'tokened operator submit' && check.status === 409), 'built server smoke must prove tokened Enjin route fails closed without Enjin secrets');
assert(acceptance.data?.actions?.some((action) => action.type === 'chain.withdraw_request'), 'local acceptance must record a Canary withdraw request');
assert(loadSmoke.data?.actions?.length >= 20, 'load smoke must record at least 10 testers worth of chat/emote actions');

const summary = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret local Alpha RC evidence summary. Reads ignored localhost reports and writes ignored summary artifacts.',
  git: gitState,
  reports: {
    localSuite: summarizeReport(localSuite),
    builtServer: summarizeReport(builtServer),
    acceptance: summarizeReport(acceptance),
    loadSmoke: summarizeReport(loadSmoke, { playerCount: loadSmoke.data?.playerCount, actions: loadSmoke.data?.actions?.length }),
    browserPresence: summarizeReport(browserPresence, { observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove }),
    responsiveGameplay: summarizeReport(responsiveGameplay, {
      viewports: responsiveGameplay.data?.viewports?.length,
      routeResults: responsiveGameplay.data?.results?.length,
      iframeResults: responsiveGameplay.data?.iframeResults?.length,
      siteStatus: responsiveGameplay.data?.site?.status,
      siteIframeResults: responsiveGameplay.data?.siteIframeResults?.length
    }),
    visualSnapshot: summarizeReport(visualSnapshot, {
      pageBytes: visualSnapshot.data?.screenshots?.page?.bytes,
      canvasBytes: visualSnapshot.data?.screenshots?.canvas?.bytes
    }),
    visualReview: summarizeReport(visualReview, {
      manualPromptGate: visualReview.data?.manualPromptGate?.status,
      observerMovement: visualReview.data?.machineReview?.observerMovement
    }),
    walletDaemon: summarizeReport(walletDaemon, {
      status: walletDaemon.data?.status,
      sha256: walletDaemon.data?.binary?.sha256,
      helpCommands: walletDaemon.data?.binary?.helpCommands
    }),
    operatorSmoke: summarizeReport(operatorSmoke)
  },
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(summary), 'utf8');

if (!summary.ok) {
  console.error('Mochi Social local evidence summary failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social local evidence summary passed. Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

function readJson(path) {
  const absolutePath = resolve(root, path);
  if (!existsSync(absolutePath)) {
    return { ok: false, path, message: 'missing report' };
  }
  try {
    return { ok: true, path, data: JSON.parse(readFileSync(absolutePath, 'utf8')) };
  } catch {
    return { ok: false, path, message: 'parse failed' };
  }
}

function assertReport(label, report) {
  if (!report.ok) {
    failures.push(`${label} report unavailable: ${report.message}`);
    return;
  }
  if (report.data?.ok !== true) failures.push(`${label} report is not ok`);
}

function assertLocalUrl(value, label) {
  if (!/^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(String(value || ''))) {
    failures.push(`${label} must be localhost`);
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function summarizeReport(report, extra = {}) {
  return {
    path: report.path,
    ok: report.data?.ok === true,
    checkedAt: report.data?.checkedAt,
    baseUrl: normalizeUrl(report.data?.baseUrl),
    gitHead: report.data?.git?.localHead,
    ...extra
  };
}

function assertCurrentGitState(gitState, label) {
  const head = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
  if (!gitState) failures.push(`${label} must include git state for current-HEAD evidence`);
  if (!head.ok) failures.push('current local HEAD could not be read');
  if (!upstream.ok) failures.push('current upstream could not be read');
  if (!worktree.ok) failures.push('current worktree status could not be read');
  if (!gitState || !head.ok || !upstream.ok || !worktree.ok) return;

  const currentHead = firstLine(head.stdout);
  const currentUpstream = firstLine(upstream.stdout);
  const currentDirty = worktree.stdout.split(/\r?\n/).filter(Boolean);
  if (gitState.localHead !== currentHead) failures.push(`${label} localHead must match current HEAD`);
  if (gitState.upstream !== currentUpstream) failures.push(`${label} upstream must match current upstream`);
  if (!Array.isArray(gitState.dirty) || gitState.dirty.length !== currentDirty.length) {
    failures.push(`${label} dirty state must match current worktree`);
  }
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
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
    .slice(0, 1000);
}

function normalizeUrl(value) {
  return String(value || '').replace(/\/+$/, '');
}

function assertSameBaseUrl(value, expected, label) {
  if (!expected) {
    failures.push('local suite baseUrl is required for same-suite evidence checks');
    return;
  }
  const actual = normalizeUrl(value);
  if (actual !== expected) {
    failures.push(`${label} must match local suite baseUrl for same-suite evidence`);
  }
}

function renderMarkdown(summaryReport) {
  const rows = Object.entries(summaryReport.reports)
    .map(([name, report]) => `| ${name} | ${report.ok ? 'pass' : 'fail'} | ${report.baseUrl || ''} | ${report.checkedAt || ''} |`)
    .join('\n');
  const failuresText = summaryReport.failures.length
    ? summaryReport.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None';

  return `# Mochi Social Local Alpha Evidence

Generated: ${summaryReport.checkedAt}

This file is intentionally no-secret and local-only. It summarizes ignored localhost reports; it does not prove hosted Fly, Vercel, Supabase, GitHub, or Enjin readiness.

| Report | Status | Base URL | Checked At |
| --- | --- | --- | --- |
${rows}

## Key Proofs

- Built Express runtime starts locally and stops after smoke.
- Public routes, manifest, alpha status, local ledger writes, load smoke, two-tab browser presence, responsive gameplay viewport/input smoke, first-screen visual snapshot, visual review bundle, and private Enjin fail-closed behavior passed.
- Wallet Daemon local evidence is metadata-only: file hash and \`--help\` output when the binary is present; no wallet import, seed print, signer process, Enjin API call, Fuel Tank action, or chain transaction occurs.
- Acceptance, load, browser, visual, and operator reports share the same local suite base URL, so the evidence is not mixed across stale localhost runs.
- The local suite and built-server smoke reports match the current local HEAD, upstream, and dirty worktree state, so the evidence is not stale across code changes.
- Browser and visual evidence stayed localhost-only.
- Responsive gameplay proves /play, /embed, and parent-iframe input ownership across the required viewport matrix with screenshots and DOM rectangles.
- Rendered NPC/chest/habitat prompt interaction remains an explicit manual gate before Alpha RC Ready.
- Enjin remains configured-preview-stub locally; no live chain operation was submitted.

## Failures

${failuresText}
`;
}
