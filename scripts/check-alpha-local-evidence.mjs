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
const visualSnapshot = readJson('reports/alpha-visual-snapshot.json');
const operatorSmoke = readJson('reports/enjin-operator-smoke.json');

assertReport('local suite', localSuite);
assertReport('built server smoke', builtServer);
assertReport('local acceptance', acceptance);
assertReport('load smoke', loadSmoke);
assertReport('browser presence', browserPresence);
assertReport('visual snapshot', visualSnapshot);
assertReport('Enjin operator smoke', operatorSmoke);

assertLocalUrl(localSuite.data?.baseUrl, 'local suite baseUrl');
assertLocalUrl(builtServer.data?.baseUrl, 'built server baseUrl');
assertLocalUrl(acceptance.data?.baseUrl, 'local acceptance baseUrl');
assertLocalUrl(loadSmoke.data?.baseUrl, 'load smoke baseUrl');
assertLocalUrl(browserPresence.data?.baseUrl, 'browser presence baseUrl');
assertLocalUrl(visualSnapshot.data?.baseUrl, 'visual snapshot baseUrl');
assertLocalUrl(operatorSmoke.data?.baseUrl, 'operator smoke baseUrl');

const suiteBaseUrl = normalizeUrl(localSuite.data?.baseUrl);
assertSameBaseUrl(acceptance.data?.baseUrl, suiteBaseUrl, 'local acceptance baseUrl');
assertSameBaseUrl(loadSmoke.data?.baseUrl, suiteBaseUrl, 'load smoke baseUrl');
assertSameBaseUrl(browserPresence.data?.baseUrl, suiteBaseUrl, 'browser presence baseUrl');
assertSameBaseUrl(visualSnapshot.data?.baseUrl, suiteBaseUrl, 'visual snapshot baseUrl');
assertSameBaseUrl(operatorSmoke.data?.baseUrl, suiteBaseUrl, 'operator smoke baseUrl');
assertCurrentGitState(localSuite.data?.git);

const commandNames = Array.isArray(localSuite.data?.commands)
  ? localSuite.data.commands.map((command) => command.name)
  : [];
for (const command of ['build', 'smoke', 'alpha:local-acceptance', 'alpha:load-smoke', 'alpha:browser-presence', 'alpha:visual-snapshot', 'alpha:enjin-operator-smoke']) {
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
assert(visualSnapshot.data?.localOnlyDefault === true && visualSnapshot.data?.hostedAllowed === false, 'visual snapshot must be local-only by default');
assert(visualSnapshot.data?.screenshots?.page?.bytes > 1000, 'visual snapshot page PNG must be non-empty');
assert(visualSnapshot.data?.screenshots?.canvas?.bytes > 1000, 'visual snapshot canvas PNG must be non-empty');
assert(operatorSmoke.data?.scope?.includes('does not submit live Enjin operations by default'), 'operator smoke must remain fail-closed by default');
assert(builtServer.data?.checks?.some((check) => check.name === 'tokened operator submit' && check.status === 409), 'built server smoke must prove tokened Enjin route fails closed without Enjin secrets');
assert(acceptance.data?.actions?.some((action) => action.type === 'chain.withdraw_request'), 'local acceptance must record a Canary withdraw request');
assert(loadSmoke.data?.actions?.length >= 20, 'load smoke must record at least 10 testers worth of chat/emote actions');

const summary = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret local Alpha RC evidence summary. Reads ignored localhost reports and writes ignored summary artifacts.',
  reports: {
    localSuite: summarizeReport(localSuite),
    builtServer: summarizeReport(builtServer),
    acceptance: summarizeReport(acceptance),
    loadSmoke: summarizeReport(loadSmoke, { playerCount: loadSmoke.data?.playerCount, actions: loadSmoke.data?.actions?.length }),
    browserPresence: summarizeReport(browserPresence, { observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove }),
    visualSnapshot: summarizeReport(visualSnapshot, {
      pageBytes: visualSnapshot.data?.screenshots?.page?.bytes,
      canvasBytes: visualSnapshot.data?.screenshots?.canvas?.bytes
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

function assertCurrentGitState(gitState) {
  const head = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
  if (!gitState) failures.push('local suite report must include git state for current-HEAD evidence');
  if (!head.ok) failures.push('current local HEAD could not be read');
  if (!upstream.ok) failures.push('current upstream could not be read');
  if (!worktree.ok) failures.push('current worktree status could not be read');
  if (!gitState || !head.ok || !upstream.ok || !worktree.ok) return;

  const currentHead = firstLine(head.stdout);
  const currentUpstream = firstLine(upstream.stdout);
  const currentDirty = worktree.stdout.split(/\r?\n/).filter(Boolean);
  if (gitState.localHead !== currentHead) failures.push('local suite report localHead must match current HEAD');
  if (gitState.upstream !== currentUpstream) failures.push('local suite report upstream must match current upstream');
  if (!Array.isArray(gitState.dirty) || gitState.dirty.length !== currentDirty.length) {
    failures.push('local suite report dirty state must match current worktree');
  }
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
- Public routes, manifest, alpha status, local ledger writes, load smoke, two-tab browser presence, first-screen visual snapshot, and private Enjin fail-closed behavior passed.
- Acceptance, load, browser, visual, and operator reports share the same local suite base URL, so the evidence is not mixed across stale localhost runs.
- The local suite report matches the current local HEAD, upstream, and dirty worktree state, so the evidence is not stale across code changes.
- Browser and visual evidence stayed localhost-only.
- Enjin remains configured-preview-stub locally; no live chain operation was submitted.

## Failures

${failuresText}
`;
}
