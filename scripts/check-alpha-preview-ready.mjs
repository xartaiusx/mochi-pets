import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';

const root = process.cwd();
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_PREVIEW_READY_JSON || 'reports/alpha-preview-ready.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_PREVIEW_READY_MD || 'reports/alpha-preview-ready.md');
const handoffPath = resolve(credsDir, 'mochi-social-alpha-preview-ready.md');
const requirements = [];

addCurrentOkReport('preview.local-evidence', 'Local alpha evidence is current and green.', 'reports/alpha-local-evidence.json', root);
addResponsiveSiteIframeRequirement();
addCurrentOkReport('preview.report-hygiene', 'No-secret report hygiene is current and green.', 'reports/alpha-report-hygiene.json', root);
addManualPromptRequirement();
addCurrentOkReport('preview.operator-checklist', 'Operator checklist is current and green.', 'reports/alpha-operator-checklist.json', root);
addCurrentOkReport('preview.provider-preflight', 'Provider preflight is current and green.', 'reports/alpha-provider-preflight.json', root);
addCurrentOkReport('preview.sync-approval', 'Sync approval packet is current and green.', 'reports/alpha-sync-approval.json', root);
addHandoffArtifacts();
addExternalPreviewGateRequirement();
addBranchSyncRequirement('preview.game-branch-sync', root, 'Local game branch');
if (existsSync(siteRepoPath)) {
  addBranchSyncRequirement('preview.site-branch-sync', siteRepoPath, 'Local Mochirii site branch');
} else {
  add('preview.site-branch-sync', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`, { path: siteRepoPath });
}

const summary = summarize(requirements);
const report = {
  ok: summary.failed === 0 && summary.unverified === 0,
  checkedAt: new Date().toISOString(),
  scope: 'Mochi Social Alpha Preview Ready audit. This no-secret report checks the tester-entry lane only; funded-chain gates are intentionally reported but not required.',
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

console.log(`Mochi Social Alpha Preview Ready audit passed. Report: ${reportPath}`);
console.log(`Markdown: ${reportMdPath}`);

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

function addManualPromptRequirement() {
  const prompt = readJson(resolve(root, 'reports/alpha-manual-prompt-review.json'));
  if (!prompt.ok) {
    add('preview.manual-prompt-review', 'fail', `Manual prompt review report is missing or invalid: ${prompt.message}.`, {
      path: 'reports/alpha-manual-prompt-review.json'
    });
    return;
  }

  const gitFailures = currentGitStateFailures(prompt.data?.git, root, 'manual prompt review report');
  const sourceEvidence = manualPromptSourceEvidence(prompt.data);
  const failures = sourceEvidence.matchesCurrentSource
    ? gitFailures.filter((failure) => !failure.includes('localHead does not match current HEAD'))
    : gitFailures;
  if (prompt.data?.ok !== true) failures.push('manual prompt review report is not ok');
  if (prompt.data?.review?.status !== 'completed') failures.push('manual prompt review is not completed');
  if (!sourceEvidence.matchesCurrentSource) failures.push(...sourceEvidence.failures);
  const completed = Array.isArray(prompt.data?.completedChecks) ? prompt.data.completedChecks : [];
  const missing = ['welcome-npc', 'guild-seal-chest', 'care-shrine'].filter((id) => !completed.includes(id));
  if (missing.length) failures.push(`manual prompt review missing completed checks: ${missing.join(', ')}`);

  add('preview.manual-prompt-review', failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : 'Rendered NPC, guild seal chest, and habitat/care prompt review is complete for current HEAD.', {
    path: 'reports/alpha-manual-prompt-review.json',
    status: prompt.data?.review?.status,
    completedChecks: completed,
    sourceEvidence
  });
}

function addResponsiveSiteIframeRequirement() {
  const responsive = readJson(resolve(root, 'reports/alpha-responsive-gameplay.json'));
  if (!responsive.ok) {
    add('preview.responsive-site-iframe', 'fail', `Responsive gameplay report is missing or invalid: ${responsive.message}.`, {
      path: 'reports/alpha-responsive-gameplay.json'
    });
    return;
  }

  const failures = currentGitStateFailures(responsive.data?.git, root, 'responsive gameplay report');
  const site = responsive.data?.site || {};
  const siteResults = Array.isArray(responsive.data?.siteIframeResults) ? responsive.data.siteIframeResults : [];
  if (responsive.data?.ok !== true) failures.push('responsive gameplay report is not ok');
  if (site.required !== true) failures.push('Mochirii site iframe smoke must run with MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME=true for Preview Ready');
  if (site.configured !== true) failures.push('Mochirii site iframe base URL was not configured');
  if (site.status !== 'checked') failures.push(`Mochirii site iframe status is ${site.status || 'missing'}, expected checked`);
  if (site.entryPath !== '/games/mochi-social') failures.push(`Mochirii site iframe entry path is ${site.entryPath || 'missing'}, expected /games/mochi-social`);
  if (siteResults.length !== 9) failures.push(`Mochirii site iframe must cover all nine viewports, found ${siteResults.length}`);

  const missingScreenshots = siteResults.filter((result) => !(result.screenshot?.bytes > 1000));
  if (missingScreenshots.length) failures.push(`${missingScreenshots.length} Mochirii site iframe viewport screenshot(s) were empty or missing`);

  const expectedGameplayKeys = Array.isArray(responsive.data?.gameplayKeys) ? responsive.data.gameplayKeys.length : 0;
  const weakInputProof = siteResults.filter((result) => result.inputOwnership?.gameplay?.checks?.length !== expectedGameplayKeys);
  if (weakInputProof.length) failures.push(`${weakInputProof.length} Mochirii site iframe viewport(s) are missing full per-key gameplay input proof`);

  add('preview.responsive-site-iframe', failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : 'Responsive gameplay covered the unlocked Mochirii /games/mochi-social iframe across all nine viewports.', {
    path: 'reports/alpha-responsive-gameplay.json',
    site,
    siteIframeResults: siteResults.length,
    expectedGameplayKeys
  });
}

function addHandoffArtifacts() {
  for (const file of [
    resolve(credsDir, 'mochi-social-alpha-operator-next-steps.md'),
    resolve(credsDir, 'mochi-social-alpha-external-gates-status.md'),
    resolve(credsDir, 'mochi-social-alpha-provider-preflight.md'),
    resolve(credsDir, 'mochi-social-alpha-sync-approval.md'),
    resolve(credsDir, 'mochirii-mochi-social-alpha-operator-next-steps.md')
  ]) {
    const exists = existsSync(file);
    add(`preview.handoff.${basenameForId(file)}`, exists ? 'pass' : 'fail', exists ? 'No-secret handoff artifact exists.' : `Missing no-secret handoff artifact: ${file}`, {
      path: file
    });
  }
}

function addExternalPreviewGateRequirement() {
  const external = readJson(resolve(root, 'reports/alpha-external-gates.json'));
  if (!external.ok) {
    add('preview.external-gates', 'fail', `External gate report is missing or invalid: ${external.message}.`, {
      path: 'reports/alpha-external-gates.json'
    });
    return;
  }

  const failures = currentGitStateFailures(external.data?.git, root, 'external gate report');
  const previewLane = external.data?.lanes?.previewLive;
  const fundedLane = external.data?.lanes?.fundedChain;
  if (external.data?.hostedChecksAllowed !== true) failures.push('hosted contract checks have not been explicitly approved/run');
  if (previewLane?.ok !== true) {
    failures.push(`preview-live-gates are not green: ${(previewLane?.failingChecks || []).join(', ') || 'unknown failure'}`);
  }

  add('preview.external-gates', failures.length ? 'fail' : 'pass', failures.length ? failures.join('; ') : 'Preview live gates are green with hosted checks approved.', {
    path: 'reports/alpha-external-gates.json',
    hostedChecksAllowed: external.data?.hostedChecksAllowed === true,
    previewLive: previewLane || null,
    fundedChain: fundedLane || null,
    fundedChainRequiredForPreview: false
  });
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

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function manualPromptSourceEvidence(report) {
  const expected = [
    {
      label: 'eventSource',
      path: resolve(root, 'apps/game/src/modules/main/event.ts'),
      expectedHash: report?.sourceEvidence?.eventSource?.sha256
    },
    {
      label: 'mapServerSource',
      path: resolve(root, 'apps/game/src/modules/main/server.ts'),
      expectedHash: report?.sourceEvidence?.mapServerSource?.sha256
    }
  ];
  const failures = [];
  const files = expected.map((entry) => {
    const currentHash = fileSha256(entry.path);
    if (!entry.expectedHash) failures.push(`${entry.label} hash is missing from manual prompt review report`);
    if (!currentHash) failures.push(`${entry.label} source file is missing`);
    if (entry.expectedHash && currentHash && entry.expectedHash !== currentHash) {
      failures.push(`${entry.label} source hash changed since manual prompt review`);
    }
    return {
      label: entry.label,
      path: pathForReport(entry.path),
      matches: Boolean(entry.expectedHash && currentHash && entry.expectedHash === currentHash)
    };
  });
  return {
    matchesCurrentSource: failures.length === 0,
    files,
    failures
  };
}

function fileSha256(file) {
  if (!existsSync(file)) return '';
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function pathForReport(file) {
  return String(file || '').startsWith(root)
    ? String(file).slice(root.length + 1).replace(/\\/g, '/')
    : String(file || '').replace(/\\/g, '/');
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
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

  return `# Mochi Social Alpha Preview Ready Audit

Generated: ${summaryReport.checkedAt}

This file is intentionally no-secret. It verifies the tester-entry lane only. Funded Enjin collection, Fuel Tank, cENJ, Wallet Daemon signing, and finality proof remain Alpha RC gates and are not required for Preview Ready.

## Result

- Ready: ${summaryReport.ok ? 'yes' : 'no'}
- Passed: ${summaryReport.summary.passed}/${summaryReport.summary.total}
- Funded-chain required here: no

## Requirements

| Requirement | Status | Message |
| --- | --- | --- |
${rows}

## Remaining Preview Work

${failures}

## Next Actions

\`\`\`text
Push ${root} branch ${summaryReport.git.branch || '<game-branch>'} to ${summaryReport.git.upstream || '<game-upstream>'} if it is ahead, then verify GitHub Actions/PR checks for Mochi Social.
\`\`\`

\`\`\`text
Push ${siteRepoPath} branch ${summaryReport.siteGit.branch || '<site-branch>'} to ${summaryReport.siteGit.upstream || '<site-upstream>'} if it is ahead, then verify GitHub Actions/PR checks for Mochirii.
\`\`\`

\`\`\`text
I approve the hosted Preview Ready contract check using MOCHI_SOCIAL_GAME_URL and MOCHI_SOCIAL_SITE_PREVIEW_URL with MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true. I understand this may hit Fly/Vercel/Supabase preview resources and add usage.
\`\`\`
`;
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

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function basenameForId(file) {
  return file.split(/[\\/]/).pop().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}
