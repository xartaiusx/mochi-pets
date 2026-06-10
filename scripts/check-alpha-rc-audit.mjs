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
    '/integration/alpha/enjin/submit',
    'invalid_game_server_token'
  ]);
  requireFileIncludes('game.browser-presence', 'Two-tab browser presence smoke verifies canvas, HUD, and Nearby presence.', 'scripts/check-alpha-browser-presence.mjs', [
    'Nearby: 2 testers',
    'data-presence-label',
    'canvas'
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

function addPrRequirements() {
  checkPr('github.game-pr', 'xartaiusx/mochi-social', '1', 'Verify Mochi Social');
  checkPr('github.site-pr', 'Mochirii-Wushu/Mochirii', '258');
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
  const result = spawnSync(commandName, args, {
    cwd: root,
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
