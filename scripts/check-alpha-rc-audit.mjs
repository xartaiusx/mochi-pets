import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const siteRepoPath = resolve(root, process.env.MOCHI_SOCIAL_SITE_REPO_PATH || '../Mochirii');
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_RC_AUDIT_REPORT || 'reports/alpha-rc-audit.json');
const checkedAt = new Date().toISOString();
const requirements = [];

addStaticRequirements();
addSiteRequirements();
addProviderGateRequirements();
addLocalEvidenceRequirements();
addReportHygieneRequirements();
addLocalBranchRequirements();
addSiteBranchRequirements();
addPrRequirements();
addLocalHandoffRequirements();

const summary = summarize(requirements);
const report = {
  ok: summary.failed === 0 && summary.unverified === 0,
  checkedAt,
  scope: 'Mochi Social Alpha RC requirement audit. This report is no-secret and points to evidence, not raw provider credentials.',
  summary,
  requirements
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (!report.ok) {
  console.error('Mochi Social Alpha RC audit is not ready:');
  for (const item of requirements.filter((entry) => entry.status !== 'pass')) {
    console.error(`- ${item.id}: ${item.status} - ${item.message}`);
  }
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

console.log(`Mochi Social Alpha RC audit passed. Report: ${reportPath}`);

function addStaticRequirements() {
  requireFileIncludes('game.contracts', 'Game runtime exposes required public routes and alpha contracts.', 'apps/game/src/entries/express.ts', [
    '/healthz',
    '/play',
    '/embed',
    '/integration/game-manifest.json',
    '/integration/alpha/status',
    '/integration/alpha/action',
    '/integration/alpha/enjin/submit'
  ]);
  requireFileIncludes('game.no-real-value', 'Game manifest and alpha status keep Canary/no-real-value scope.', 'apps/game/src/integration/alpha-contract.ts', [
    'noRealValue: true',
    "network: 'CANARY'",
    'cashout: false',
    "ugc: 'curated'"
  ]);
  requireFileIncludes('game.bridge-protocol', 'Bridge protocol declares Supabase access-token auth and sign-out events.', 'apps/game/src/integration/protocol.ts', [
    'MOCHI_SOCIAL_AUTH',
    'MOCHI_SOCIAL_SIGN_OUT',
    'MOCHI_SOCIAL_READY',
    'MOCHI_SOCIAL_AUTH_STATE',
    'MOCHI_SOCIAL_ERROR'
  ]);
  requireFileIncludes('game.bridge-runtime', 'Browser bridge consumes auth/sign-out protocol and stores only the access token state.', 'apps/game/src/integration/browser-bridge.ts', [
    'BRIDGE_EVENTS.auth',
    'BRIDGE_EVENTS.signOut',
    'accessToken',
    'configured-preview-stub'
  ]);
  requireFileIncludes('game.supabase-edge-bridge', 'Supabase Edge bridge uses the scoped game server token header and keeps service-role secrets out of game requests.', 'apps/game/src/integration/supabase-edge-client.ts', [
    'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
    'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
    'x-mochi-social-server-token',
    'ALPHA_EDGE_FUNCTIONS.action',
    'JSON.stringify(action)'
  ]);
  requireFileIncludes('game.supabase-edge-tests', 'Supabase Edge bridge tests prove no service-role fallback and no server token in the action body.', 'apps/game/tests/supabase-edge-client.test.ts', [
    'scoped server token in a header only',
    'not.toContain',
    'SUPABASE_SERVICE_ROLE_KEY',
    'mochi-social-alpha-action'
  ]);
  requireFileIncludes('game.enjin-finality', 'Enjin helper enforces Canary, Fuel Tank, idempotency, and finality before hot credit.', 'apps/game/src/integration/enjin-canary.ts', [
    "network: 'CANARY'",
    'fuelTank: config.fuelTankId',
    'idempotencyKey: input.requestId',
    'canCreditHotInventory',
    "state === 'FINALIZED'"
  ]);
  requireFileIncludes('game.local-acceptance', 'Local acceptance covers pet, market, trade, chain, and fail-closed Enjin route paths.', 'scripts/check-local-alpha-acceptance.mjs', [
    'pet.befriend',
    'pet.care',
    'market.fixed_list',
    'trade.direct_offer',
    'chain.withdraw_request',
    'ledgerVersion=1',
    'alphaStopPoint',
    'chainNetwork',
    '/integration/alpha/enjin/submit',
    'invalid_game_server_token'
  ]);
  requireFileIncludes('game.local-suite', 'Local Alpha suite builds, starts the built runtime, runs localhost smokes, strips live provider env, and writes one no-secret report.', 'scripts/check-alpha-local-suite.mjs', [
    'No-cost localhost Alpha RC suite',
    'npmCommand',
    'alpha:local-acceptance',
    'alpha:load-smoke',
    'alpha:browser-presence',
    'alpha:visual-snapshot',
    'alpha:enjin-operator-smoke',
    'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE',
    'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN',
    'delete env.ENJIN_PLATFORM_TOKEN',
    'reports/alpha-local-suite.json'
  ]);
  requireFileIncludes('game.local-evidence-script', 'Local evidence summary validates ignored localhost reports and writes no-secret summary artifacts.', 'scripts/check-alpha-local-evidence.mjs', [
    'No-secret local Alpha RC evidence summary',
    'alpha-local-evidence.json',
    'alpha-local-evidence.md',
    'browser presence must prove observer-side movement',
    'visual snapshot canvas PNG must be non-empty',
    'built server smoke must prove tokened Enjin route fails closed',
    'local-only'
  ]);
  requireFileIncludes('game.report-hygiene-script', 'Report hygiene scans ignored local reports and generated no-secret handoff artifacts for accidental secret leakage.', 'scripts/check-alpha-report-hygiene.mjs', [
    'No-secret hygiene scan',
    'alpha-report-hygiene.json',
    'mochi-social-alpha-operator-next-steps.md',
    'Unredacted local suite token',
    'Wallet daemon password assignment',
    'Supabase service role assignment'
  ]);
  requireFileIncludes('game.local-ledger-writer', 'Local fallback ledger rows are versioned, Canary-scoped, and no-real-value.', 'apps/game/src/entries/express.ts', [
    'ledgerVersion: 1',
    "source: 'local-alpha-ledger'",
    "alphaStopPoint: 'alpha-rc-ready'",
    "chainNetwork: 'CANARY'",
    'noRealValue: true',
    'receivedAt: new Date().toISOString()'
  ]);
  requireFileIncludes('game.browser-presence', 'Two-tab browser presence smoke verifies canvas, movement signatures, HUD, and Nearby presence.', 'scripts/check-alpha-browser-presence.mjs', [
    'Nearby: 2 testers',
    'data-presence-label',
    'data-alpha-action="pet.care"',
    'chain.withdraw_request',
    'mochiSocial.alphaState',
    'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE',
    'reports/alpha-browser-presence.json',
    'canvasMovement',
    'changedAfterFirstTabMove',
    'ArrowRight',
    'ArrowDown',
    'createHash',
    'canvas'
  ]);
  requireFileIncludes('game.visual-snapshot', 'Visual snapshot captures ignored local page/canvas PNGs for first-screen review and blocks hosted snapshots by default.', 'scripts/check-alpha-visual-snapshot.mjs', [
    'playwright-core',
    'alpha-visual-snapshot.json',
    'alpha-visual-page.png',
    'alpha-visual-canvas.png',
    'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT',
    'local-only by default',
    'manualReview',
    'createHash',
    'canvas'
  ]);
  requireFileIncludes('game.map-object-contract', 'Map-object contract test verifies stable town event IDs, prompts, save sources, habitat, and collision evidence.', 'apps/game/tests/map-object-contract.test.ts', [
    'Mochi town map object contract',
    'runtimeEventPlacements',
    'welcome-npc',
    'token-chest',
    'care-shrine',
    'market-board',
    'trade-post',
    'canary-shrine',
    'no-real-value Enjin Canary certificate request',
    'Lantern Garden',
    '25 * 18'
  ]);
  requireFileIncludes('game.acceptance-docs', 'Alpha acceptance docs name every local and preview gate.', 'docs/alpha-acceptance.md', [
    'alpha:local-acceptance',
    'alpha:load-smoke',
    'alpha:browser-presence',
    'alpha:enjin-operator-smoke',
    'alpha:external-gates',
    'alpha:operator-checklist'
  ]);
}

function addSiteRequirements() {
  if (!existsSync(siteRepoPath)) {
    add('site.repo', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`);
    return;
  }

  requireSiteFileIncludes('site.route', 'Mochirii preview route embeds Mochi Social behind auth, allowlist, terms, and feedback UI.', 'apps/web/components/mochi-social/MochiSocialAlphaClient.tsx', [
    'NEXT_PUBLIC_MOCHI_SOCIAL_URL',
    'MOCHI_SOCIAL_AUTH',
    'Alpha allowlist required',
    'Alpha acknowledgement',
    'submitMochiSocialFeedback'
  ]);
  requireSiteFileIncludes('site.admin', 'Leader dashboard exposes alpha grant, revoke, and audit controls.', 'apps/web/components/member-workflow/LeaderDashboard.tsx', [
    'Mochi Social Alpha',
    'Grant alpha access',
    'Revoke alpha access',
    'AlphaAuditPanel'
  ]);
  requireSiteFileIncludes('site.edge-functions', 'Mochirii Supabase config owns all alpha Edge Functions.', 'supabase/config.toml', [
    'mochi-social-alpha-session',
    'mochi-social-alpha-action',
    'mochi-social-alpha-admin',
    'submit-mochi-social-feedback'
  ]);
  requireSiteFileIncludes('site.schema', 'Mochirii migration owns allowlist, terms, pets, inventory, trades, market, feedback, chat, and chain ledger tables.', 'supabase/migrations/20260610090000_add_mochi_social_alpha.sql', [
    'mochi_social_alpha_testers',
    'mochi_social_terms_acknowledgements',
    'mochi_social_pets',
    'mochi_social_inventory',
    'mochi_social_market_listings',
    'mochi_social_trades',
    'mochi_social_chat_messages',
    'mochi_social_feedback',
    'mochi_social_chain_operations',
    'mochi_social_ledger_events'
  ]);
  requireSiteFileIncludes('site.action-finality', 'Mochirii action Edge Function gates allowlist/terms and finality-aware chain updates.', 'supabase/functions/mochi-social-alpha-action/index.ts', [
    'alphaAccess(adminClient, playerId)',
    'alpha_terms_required',
    'chain.operation_update',
    'chain_request_missing',
    'nextStatus === "finalized"',
    'location: "hot"'
  ]);
  requireSiteFileIncludes('site.checklist', 'Mochirii repo can generate its no-secret website-side operator checklist.', 'scripts/prepare-mochi-social-alpha-operator-checklist.mjs', [
    'mochirii-mochi-social-alpha-operator-next-steps.md',
    'NEXT_PUBLIC_MOCHI_SOCIAL_URL',
    'MOCHI_SOCIAL_ALPHA_EDGE_URL',
    'MOCHI_SOCIAL_GAME_SERVER_TOKEN'
  ]);
}

function addProviderGateRequirements() {
  const externalReportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
  const externalReport = readJson(externalReportPath);
  if (!externalReport.ok) {
    add('provider.external-gates', 'fail', `External gate report is missing or invalid: ${externalReport.message}.`, { path: externalReportPath });
    return;
  }
  const report = externalReport.data;
  const failures = Array.isArray(report.checks)
    ? report.checks.filter((check) => check.status === 'fail').map((check) => check.name)
    : ['checks array missing'];
  add(report.ok === true ? 'provider.external-gates' : 'provider.external-gates',
    report.ok === true ? 'pass' : 'fail',
    report.ok === true
      ? 'Fly, live game/site contract, Supabase, GitHub, and Enjin readiness gates passed.'
      : `External gates still incomplete: ${failures.join(', ')}.`,
    { reportPath: externalReportPath, checkedAt: report.checkedAt, failingChecks: failures });
}

function addLocalEvidenceRequirements() {
  const evidenceReportPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_EVIDENCE_JSON || 'reports/alpha-local-evidence.json');
  const evidenceReport = readJson(evidenceReportPath);
  if (!evidenceReport.ok) {
    add('local.evidence-summary', 'fail', `Local evidence summary is missing or invalid: ${evidenceReport.message}. Run npm run alpha:local-suite, then npm run alpha:local-evidence.`, { path: evidenceReportPath });
    return;
  }

  const report = evidenceReport.data;
  const failures = Array.isArray(report.failures) ? report.failures : ['failures array missing'];
  add(
    'local.evidence-summary',
    report.ok === true && failures.length === 0 ? 'pass' : 'fail',
    report.ok === true && failures.length === 0
      ? 'Local no-secret evidence summary passed for localhost suite, browser, visual, load, built-server, and operator reports.'
      : `Local evidence summary still has failures: ${failures.join(', ')}.`,
    {
      reportPath: evidenceReportPath,
      checkedAt: report.checkedAt,
      failures
    }
  );
}

function addReportHygieneRequirements() {
  const hygieneReportPath = resolve(root, process.env.MOCHI_SOCIAL_REPORT_HYGIENE_JSON || 'reports/alpha-report-hygiene.json');
  const hygieneReport = readJson(hygieneReportPath);
  if (!hygieneReport.ok) {
    add('local.report-hygiene', 'fail', `Local report hygiene summary is missing or invalid: ${hygieneReport.message}. Run npm run alpha:local-evidence, npm run alpha:operator-checklist, then npm run alpha:report-hygiene.`, { path: hygieneReportPath });
    return;
  }

  const report = hygieneReport.data;
  const failures = Array.isArray(report.failures) ? report.failures : ['failures array missing'];
  add(
    'local.report-hygiene',
    report.ok === true && failures.length === 0 ? 'pass' : 'fail',
    report.ok === true && failures.length === 0
      ? 'Local report hygiene passed for ignored reports and generated no-secret handoff artifacts.'
      : `Local report hygiene still has failures: ${failures.join(', ')}.`,
    {
      reportPath: hygieneReportPath,
      checkedAt: report.checkedAt,
      scanned: report.scanned,
      failures
    }
  );
}

function addPrRequirements() {
  checkPr('github.game-pr', 'xartaiusx/mochi-social', '1', 'Verify Mochi Social');
  checkPr('github.site-pr', 'Mochirii-Wushu/Mochirii', '258');
}

function addLocalBranchRequirements() {
  addGitBranchSyncRequirement('github.local-branch-sync', root, 'Local game branch');
}

function addSiteBranchRequirements() {
  if (!existsSync(siteRepoPath)) {
    add('github.site-local-branch-sync', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`, { path: siteRepoPath });
    return;
  }
  addGitBranchSyncRequirement('github.site-local-branch-sync', siteRepoPath, 'Local Mochirii site branch');
}

function addGitBranchSyncRequirement(id, cwd, label) {
  const branch = commandAt(cwd, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = commandAt(cwd, 'git', ['rev-parse', 'HEAD']);
  const upstream = commandAt(cwd, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(cwd, 'git', ['status', '--porcelain']);
  const baseEvidence = {
    path: cwd,
    branch: firstLine(branch.stdout),
    localHead: firstLine(head.stdout),
    upstream: firstLine(upstream.stdout)
  };

  if (!branch.ok || !head.ok || !upstream.ok || !worktree.ok) {
    add(id, 'unverified', `${label} Git branch/upstream state could not be verified.`, {
      ...baseEvidence,
      branchError: sanitize(branch.stderr),
      headError: sanitize(head.stderr),
      upstreamError: sanitize(upstream.stderr),
      worktreeError: sanitize(worktree.stderr)
    });
    return;
  }

  const counts = commandAt(cwd, 'git', ['rev-list', '--left-right', '--count', `${baseEvidence.upstream}...HEAD`]);
  if (!counts.ok) {
    add(id, 'unverified', `${label} ahead/behind count could not be verified.`, {
      ...baseEvidence,
      stderr: sanitize(counts.stderr)
    });
    return;
  }

  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);
  const behind = Number.parseInt(behindText, 10);
  const ahead = Number.parseInt(aheadText, 10);
  const dirtyStatus = worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line));
  const ok = Number.isFinite(ahead) && Number.isFinite(behind) && ahead === 0 && behind === 0 && dirtyStatus.length === 0;

  add(
    id,
    ok ? 'pass' : 'fail',
    ok
      ? `${label} matches upstream and the worktree is clean, so remote PR checks apply to this source.`
      : `${label} differs from upstream or has local changes; remote PR checks do not prove this source.`,
    {
      ...baseEvidence,
      ahead,
      behind,
      dirtyFiles: dirtyStatus.length,
      dirtyStatus: dirtyStatus.slice(0, 20)
    }
  );
}

function addLocalHandoffRequirements() {
  requireLocalFile('handoff.game-checklist', resolve(credsDir, 'mochi-social-alpha-operator-next-steps.md'), [
    'This file is intentionally no-secret',
    'Fly Gate',
    'Enjin Canary Gate',
    'Preview Verification After Fly And Enjin Gates'
  ]);
  requireLocalFile('handoff.site-checklist', resolve(credsDir, 'mochirii-mochi-social-alpha-operator-next-steps.md'), [
    'This file is intentionally no-secret',
    'Vercel Preview Gate',
    'Supabase Preview Gate',
    'Manual Website Gates'
  ]);
}

function requireFileIncludes(id, description, file, snippets) {
  requireTextIncludes(id, description, resolve(root, file), snippets, file);
}

function requireSiteFileIncludes(id, description, file, snippets) {
  requireTextIncludes(id, description, resolve(siteRepoPath, file), snippets, `Mochirii/${file}`);
}

function requireLocalFile(id, file, snippets) {
  requireTextIncludes(id, `${id} exists and contains no-secret operator handoff sections.`, file, snippets, file);
}

function requireTextIncludes(id, description, file, snippets, label) {
  if (!existsSync(file)) {
    add(id, 'fail', `${description} Missing file: ${label}.`, { file: label });
    return;
  }
  const text = readFileSync(file, 'utf8');
  const missing = snippets.filter((snippet) => !text.includes(snippet));
  add(id, missing.length ? 'fail' : 'pass',
    missing.length ? `${description} Missing snippets: ${missing.join(', ')}.` : description,
    { file: label, missing });
}

function checkPr(id, repo, pr, requiredCheckName) {
  const result = command(resolveGh(), ['pr', 'view', pr, '--repo', repo, '--json', 'url,headRefOid,mergeStateStatus,statusCheckRollup']);
  if (!result.ok) {
    add(id, 'unverified', 'GitHub PR state could not be read from this shell.', { repo, pr, stderr: sanitize(result.stderr) });
    return;
  }
  const data = parseJson(result.stdout);
  if (!data) {
    add(id, 'unverified', 'GitHub PR JSON could not be parsed.', { repo, pr });
    return;
  }
  const checks = Array.isArray(data.statusCheckRollup) ? data.statusCheckRollup : [];
  const failing = checks.filter((check) => !['SUCCESS', 'PASS'].includes(String(check.conclusion || check.state || '').toUpperCase()));
  const required = requiredCheckName ? checks.find((check) => check.name === requiredCheckName || check.context === requiredCheckName) : true;
  const ok = data.mergeStateStatus === 'CLEAN' && failing.length === 0 && Boolean(required);
  add(id, ok ? 'pass' : 'fail', ok ? `${repo}#${pr} is clean and checks are green.` : `${repo}#${pr} is not clean, has failing checks, or is missing required checks.`, {
    url: data.url,
    headRefOid: data.headRefOid,
    mergeStateStatus: data.mergeStateStatus,
    checks: checks.map((check) => check.name || check.context).filter(Boolean),
    failingChecks: failing.map((check) => check.name || check.context).filter(Boolean)
  });
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

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function command(commandName, args) {
  return commandAt(root, commandName, args);
}

function commandAt(cwd, commandName, args) {
  const result = spawnSync(commandName, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
    shell: false
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function resolveGh() {
  if (process.env.GH_CLI_PATH) return process.env.GH_CLI_PATH;
  return process.platform === 'win32' ? 'gh.exe' : 'gh';
}

function parseJson(text) {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function defaultCredsDir() {
  if (process.env.USERPROFILE) return resolve(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return resolve(process.env.HOME, 'Desktop', 'Creds');
  return resolve(root, '.local', 'creds');
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}
