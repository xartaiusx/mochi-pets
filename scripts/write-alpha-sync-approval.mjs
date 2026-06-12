import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const outputPath = resolve(credsDir, process.env.MOCHI_SOCIAL_SYNC_APPROVAL || 'mochi-social-alpha-sync-approval.md');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_SYNC_APPROVAL_JSON || 'reports/alpha-sync-approval.json');
const auditPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_RC_AUDIT_REPORT || 'reports/alpha-rc-audit.json');
const externalGatePath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const siteRepoPath = resolve(root, process.env.MOCHI_SOCIAL_SITE_REPO_PATH || '../Mochirii');
const prStateFixturePath = process.env.MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE || '';
const previewEnvPath = resolve(credsDir, process.env.MOCHI_SOCIAL_PREVIEW_ENV_FILE || 'mochi-social-alpha-vercel-preview.local.txt');
const generatedAt = new Date().toISOString();

const gitState = readGitState();
const siteGitState = readGitStateAt(siteRepoPath);
const prState = {
  game: readPr('xartaiusx/mochi-social', '1', gitState.localHead),
  site: readPr('Mochirii-Wushu/Mochirii', '258', siteGitState.localHead)
};
const auditSummary = readAuditSummary();
const externalGateSummary = readExternalGateSummary();
const previewEnv = readPreviewEnvFile(previewEnvPath);
const approvalActions = buildApprovalActions(gitState, siteGitState, externalGateSummary, previewEnv);
const requiredApprovalActions = approvalActions.filter((action) => action.currentlyRequired && action.requiresApproval !== false);

const summary = {
  ok: true,
  generatedAt,
  scope: 'No-secret approval packet for cost-aware GitHub sync and external Alpha RC gates.',
  git: gitState,
  siteGit: siteGitState,
  prState,
  audit: auditSummary,
  externalGates: externalGateSummary,
  previewEnv,
  approvalsRequired: requiredApprovalActions.map((action) => action.action),
  approvalActions
};

await mkdir(dirname(reportPath), { recursive: true });
await mkdir(credsDir, { recursive: true });
await writeFile(reportPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(outputPath, renderMarkdown(summary), 'utf8');

console.log(`Wrote no-secret sync approval packet: ${outputPath}`);
console.log(`Report: ${reportPath}`);

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function readGitState() {
  return readGitStateAt(root);
}

function readGitStateAt(cwd) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  const localHead = git(['rev-parse', 'HEAD'], cwd);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd);
  const upstreamHead = upstream.ok ? git(['rev-parse', upstream.stdout.trim()], cwd) : { ok: false, stdout: '', stderr: upstream.stderr };
  const worktree = git(['status', '--porcelain'], cwd);
  const counts = upstream.ok ? git(['rev-list', '--left-right', '--count', `${upstream.stdout.trim()}...HEAD`], cwd) : { ok: false, stdout: '', stderr: upstream.stderr };
  const log = upstream.ok ? git(['log', '--oneline', '--no-decorate', '--max-count=80', `${upstream.stdout.trim()}..HEAD`], cwd) : { ok: false, stdout: '', stderr: upstream.stderr };
  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);

  return {
    branch: sanitize(firstLine(branch.stdout)),
    upstream: sanitize(firstLine(upstream.stdout)),
    localHead: sanitize(firstLine(localHead.stdout)),
    upstreamHead: sanitize(firstLine(upstreamHead.stdout)),
    ahead: Number.parseInt(aheadText, 10) || 0,
    behind: Number.parseInt(behindText, 10) || 0,
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    commitsAhead: log.ok ? log.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : [],
    errors: [branch, localHead, upstream, upstreamHead, worktree, counts, log]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function readAuditSummary() {
  const audit = readJson(auditPath);
  if (!audit.ok) {
    return {
      present: false,
      ok: false,
      failures: [`Alpha RC audit report missing or unreadable: ${audit.message}`],
      expectedFailuresAfterPacket: [`Alpha RC audit report missing or unreadable: ${audit.message}`],
      selfReferentialFailures: [],
      postPacketRefreshFailures: []
    };
  }
  const failing = Array.isArray(audit.data.requirements)
    ? audit.data.requirements
      .filter((item) => item.status !== 'pass')
      .map((item) => `${item.id}: ${item.status} - ${item.message}`)
    : ['Alpha RC audit report did not include requirements.'];
  const sanitizedFailures = failing.map((item) => sanitize(item));
  const selfReferentialFailures = sanitizedFailures.filter(isSelfReferentialSyncApprovalFailure);
  const postPacketRefreshFailures = sanitizedFailures.filter(isPostPacketRefreshFailure);
  const expectedFailuresAfterPacket = sanitizedFailures.filter((item) => {
    return !isSelfReferentialSyncApprovalFailure(item) && !isPostPacketRefreshFailure(item);
  });

  return {
    present: true,
    ok: audit.data.ok === true,
    checkedAt: audit.data.checkedAt,
    git: audit.data.git,
    summary: audit.data.summary,
    failures: sanitizedFailures,
    expectedFailuresAfterPacket,
    selfReferentialFailures,
    postPacketRefreshFailures
  };
}

function readExternalGateSummary() {
  const report = readJson(externalGatePath);
  if (!report.ok) {
    return {
      present: false,
      ok: false,
      failures: [`External gate report missing or unreadable: ${report.message}`]
    };
  }
  const failing = Array.isArray(report.data.checks)
    ? report.data.checks
      .filter((check) => check.status !== 'pass')
      .map((check) => `${check.name}: ${check.message}`)
    : ['External gate report did not include checks.'];
  return {
    present: true,
    ok: report.data.ok === true,
    checkedAt: report.data.checkedAt,
    flyApp: sanitize(report.data.flyApp),
    flyVolume: sanitize(report.data.flyVolume),
    gameUrl: sanitize(report.data.gameUrl),
    sitePreviewUrl: sanitize(report.data.sitePreviewUrl),
    hostedChecksAllowed: report.data.hostedChecksAllowed,
    lanes: report.data.lanes ?? null,
    git: report.data.git,
    failures: failing.map((item) => sanitize(item))
  };
}

function readPr(repo, number, localHead) {
  const fixture = readPrFixture(repo, number, localHead);
  if (fixture) return fixture;

  const result = spawnSync('gh', ['pr', 'view', number, '--repo', repo, '--json', 'url,headRefOid,mergeStateStatus,statusCheckRollup,isDraft,title'], {
    cwd: root,
    encoding: 'utf8',
    shell: false
  });
  if (result.status !== 0) {
    return {
      repo,
      number,
      ok: false,
      message: sanitize(result.stderr || result.error?.message || 'GitHub PR state could not be read.')
    };
  }

  try {
    const data = JSON.parse(result.stdout);
    const checks = Array.isArray(data.statusCheckRollup) ? data.statusCheckRollup : [];
    const failingChecks = checks
      .filter((check) => !['SUCCESS', 'PASS'].includes(String(check.conclusion || check.state || '').toUpperCase()))
      .map((check) => sanitize(check.name || check.context))
      .filter(Boolean);
    const checkNames = checks.map((check) => sanitize(check.name || check.context)).filter(Boolean);
    return {
      repo,
      number,
      ok: data.mergeStateStatus === 'CLEAN' && failingChecks.length === 0,
      url: sanitize(data.url),
      title: sanitize(data.title),
      isDraft: data.isDraft === true,
      headRefOid: sanitize(data.headRefOid),
      localHead: sanitize(localHead),
      localHeadMatchesPrHead: Boolean(localHead && data.headRefOid && localHead === data.headRefOid),
      mergeStateStatus: sanitize(data.mergeStateStatus),
      checkNames,
      failingChecks
    };
  } catch {
    return {
      repo,
      number,
      ok: false,
      message: 'GitHub PR JSON could not be parsed.'
    };
  }
}

function readPrFixture(repo, number, localHead) {
  if (!prStateFixturePath) return null;
  const fixture = readJson(resolve(prStateFixturePath));
  if (!fixture.ok) {
    return {
      repo,
      number,
      ok: false,
      message: `PR fixture could not be read: ${fixture.message}`
    };
  }

  const key = `${repo}#${number}`;
  const data = fixture.data?.[key] || fixture.data?.[repo]?.[number] || null;
  if (!data) {
    return {
      repo,
      number,
      ok: false,
      message: `PR fixture missing ${key}`
    };
  }

  const checks = Array.isArray(data.statusCheckRollup) ? data.statusCheckRollup : [];
  const failingChecks = checks
    .filter((check) => !['SUCCESS', 'PASS'].includes(String(check.conclusion || check.state || '').toUpperCase()))
    .map((check) => sanitize(check.name || check.context))
    .filter(Boolean);
  const checkNames = checks.map((check) => sanitize(check.name || check.context)).filter(Boolean);
  return {
    repo,
    number,
    ok: data.mergeStateStatus === 'CLEAN' && failingChecks.length === 0,
    url: sanitize(data.url),
    title: sanitize(data.title),
    isDraft: data.isDraft === true,
    headRefOid: sanitize(data.headRefOid),
    localHead: sanitize(localHead),
    localHeadMatchesPrHead: Boolean(localHead && data.headRefOid && localHead === data.headRefOid),
    mergeStateStatus: sanitize(data.mergeStateStatus),
    checkNames,
    failingChecks
  };
}

function buildApprovalActions(currentGitState, currentSiteGitState, currentExternalGateSummary, currentPreviewEnv) {
  const branch = currentGitState.branch || '<branch>';
  const upstream = currentGitState.upstream || `origin/${branch}`;
  const siteBranch = currentSiteGitState.branch || 'codex/mochi-social-alpha-rc';
  const siteUpstream = currentSiteGitState.upstream || `origin/${siteBranch}`;
  const flyApp = currentExternalGateSummary.flyApp || 'mochi-social-game';
  const gameUrl = currentExternalGateSummary.gameUrl || currentPreviewEnv?.gameUrl || `https://${flyApp}.fly.dev`;
  const sitePreviewUrl = currentExternalGateSummary.sitePreviewUrl || currentPreviewEnv?.sitePreviewUrl || 'https://<vercel-preview-host>';
  const gameSyncNeeded = branchSyncNeeded(currentGitState);
  const siteSyncNeeded = branchSyncNeeded(currentSiteGitState);
  const flyPreviewSecretsNeeded = hasExternalFailure(currentExternalGateSummary, 'Fly preview secret names');
  const liveGameContractNeeded = hasExternalFailure(currentExternalGateSummary, 'Live game contract') || hasExternalFailure(currentExternalGateSummary, 'Live game URL');
  const sitePreviewContractNeeded = hasExternalFailure(currentExternalGateSummary, 'Site preview contract');

  return [
    {
      id: 'github-branch-sync',
      provider: 'GitHub',
      phase: 'Alpha Preview Ready',
      currentlyRequired: gameSyncNeeded,
      requirementReason: gameSyncNeeded ? `Game branch is ahead ${currentGitState.ahead} / behind ${currentGitState.behind} or has local state that remote PR checks cannot prove.` : 'Game branch is already synced and clean.',
      action: 'Push local game branch to origin and verify GitHub Actions/PR checks.',
      exactAction: `git push origin ${branch}`,
      costRisk: 'No separate approval required under current user policy for public-repo commits/pushes; verify the resulting PR checks afterward.',
      noCostAlternative: 'Keep the branch local only if intentionally avoiding a sync; github.local-branch-sync will remain red in npm run alpha:rc-audit until pushed.',
      approvalText: `Proceed with public-repo sync: push C:\\Users\\xtyty\\Documents\\Local RPG branch ${branch} to ${upstream}, then verify GitHub Actions/PR checks for Mochi Social.`,
      requiresApproval: false
    },
    {
      id: 'github-site-branch-sync',
      provider: 'GitHub',
      phase: 'Alpha Preview Ready',
      currentlyRequired: siteSyncNeeded,
      requirementReason: siteSyncNeeded ? `Mochirii branch is ahead ${currentSiteGitState.ahead} / behind ${currentSiteGitState.behind} or has local state that remote PR checks cannot prove.` : 'Mochirii site branch is already synced and clean.',
      action: 'Push local Mochirii site branch to origin and verify GitHub Actions/PR checks.',
      exactAction: `git -C C:\\Users\\xtyty\\Documents\\Mochirii push origin ${siteBranch}`,
      costRisk: 'No separate approval required under current user policy for public-repo commits/pushes; verify the resulting PR checks afterward.',
      noCostAlternative: 'Keep the branch local only if intentionally avoiding a sync; github.site-local-branch-sync will remain red in npm run alpha:rc-audit until pushed.',
      approvalText: `Proceed with public-repo sync: push C:\\Users\\xtyty\\Documents\\Mochirii branch ${siteBranch} to ${siteUpstream}, then verify GitHub Actions/PR checks for Mochirii.`,
      requiresApproval: false
    },
    {
      id: 'fly-secret-update',
      provider: 'Fly.io',
      phase: 'Alpha Preview Ready',
      currentlyRequired: flyPreviewSecretsNeeded,
      requirementReason: flyPreviewSecretsNeeded ? 'Fly preview runtime secret names are missing for the live game contract.' : 'Fly preview runtime secret names are already present.',
      action: 'Set or change Fly secrets required for Alpha Preview Ready runtime wiring.',
      exactAction: `fly secrets set -a ${flyApp} SUPABASE_URL=<private-supabase-url> SUPABASE_PUBLISHABLE_KEY=<private-supabase-publishable-key> MOCHI_SOCIAL_GAME_SERVER_TOKEN=<private-game-server-token> RPG_ALLOWED_ORIGINS=<approved-origins>`,
      costRisk: 'Fly secret changes can create a new release or restart running Machines, and the existing Fly app and volume can accrue usage while running.',
      noCostAlternative: 'Keep localhost-only checks and leave preview-live-gates red.',
      approvalText: `I approve setting the missing Fly preview secret names on ${flyApp} for Mochi Social Alpha Preview Ready and understand this may restart hosted resources or add usage.`
    },
    {
      id: 'fly-funded-chain-secret-update',
      provider: 'Fly.io/Enjin Canary',
      phase: 'Alpha RC later',
      currentlyRequired: false,
      requirementReason: 'Not required for Alpha Preview Ready. Leave funded-chain Fly secrets unset until real Canary collection and Fuel Tank values exist.',
      action: 'Set funded-chain Fly secrets only after real Enjin Canary resources exist.',
      exactAction: `fly secrets set -a ${flyApp} ENJIN_PLATFORM_TOKEN=<private-enjin-platform-token> ENJIN_COLLECTION_ID=<private-enjin-collection-id> ENJIN_FUEL_TANK_ID=<private-enjin-fuel-tank-id>`,
      costRisk: 'Fly secret changes can restart Machines, and real Enjin values should only be set after collection/Fuel Tank resources exist and funded-chain work is approved.',
      noCostAlternative: 'Leave ENJIN_COLLECTION_ID and ENJIN_FUEL_TANK_ID unset so the runtime stays configured-preview-stub for Alpha Preview Ready.',
      approvalText: `I approve setting real funded-chain Fly secret names on ${flyApp} after Enjin Canary collection and Fuel Tank resources exist. I understand this may restart hosted resources or add usage.`
    },
    {
      id: 'fly-live-game-contract',
      provider: 'Fly.io',
      phase: 'Alpha Preview Ready',
      currentlyRequired: liveGameContractNeeded,
      requirementReason: liveGameContractNeeded ? 'The live game contract gate needs an approved hosted check against the Fly URL.' : 'The live game contract gate is not currently requesting Fly hosted verification.',
      action: 'Run the approved hosted Fly game contract check for Alpha Preview Ready.',
      exactAction: `$env:MOCHI_SOCIAL_GAME_URL="${gameUrl}"; $env:MOCHI_SOCIAL_SITE_PREVIEW_URL="${sitePreviewUrl}"; $env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true"; npm run alpha:external-gates`,
      costRisk: 'Hosted contract checks fetch the Fly runtime and can create Fly request/bandwidth/log usage. They do not deploy, scale, or run load tests.',
      noCostAlternative: 'Run npm run alpha:local-suite, npm run alpha:local-evidence, and localhost smoke checks only.',
      approvalText: `I approve the hosted Fly game contract check for ${flyApp} using MOCHI_SOCIAL_GAME_URL=${gameUrl} with MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true. I understand it may hit Fly resources and add usage.`
    },
    {
      id: 'enjin-canary-operations',
      provider: 'Enjin Canary',
      phase: 'Alpha RC later',
      currentlyRequired: false,
      requirementReason: 'Not required for Alpha Preview Ready. Keep Enjin in configured-preview-stub until funding and transaction proof work is explicitly approved.',
      action: 'Create/fund Fuel Tank resources or submit Canary mint, burn, listing, transfer, or proof operations.',
      exactAction: 'Use Enjin Platform dashboard/API/Wallet Daemon only for the specific approved Canary collection, Fuel Tank, and transaction proof.',
      costRisk: 'Fuel Tank funding, sponsored transactions, cloud Wallet Daemon hosting, faucets, and live chain operations can consume account resources or sponsored balances.',
      noCostAlternative: 'Keep Enjin readiness flags unset and use configured-preview-stub plus local fail-closed operator smoke.',
      approvalText: 'I approve the specific Enjin Canary action: <exact collection, Fuel Tank, Wallet Daemon, or transaction proof action>. I understand it may add usage, sponsored transaction cost, or cloud/resource charges.'
    },
    {
      id: 'vercel-supabase-preview',
      provider: 'Vercel/Supabase',
      phase: 'Alpha Preview Ready',
      currentlyRequired: sitePreviewContractNeeded,
      requirementReason: sitePreviewContractNeeded ? 'The site preview contract gate needs an approved hosted check against the Vercel/Supabase preview lane.' : 'The site preview contract gate is not currently requesting Vercel/Supabase hosted verification.',
      action: 'Change preview env, deploy preview branches, deploy Edge Functions, or run hosted site checks.',
      exactAction: `Set NEXT_PUBLIC_MOCHI_SOCIAL_URL=${gameUrl} for the Mochirii preview and verify ${sitePreviewUrl} only after approval.`,
      costRisk: 'Preview builds, Edge Functions, database/branch activity, logs, and hosted checks can consume Vercel or Supabase usage.',
      noCostAlternative: 'Keep local game/site contract checks and no-secret operator checklist evidence only.',
      approvalText: 'I approve the specific Vercel/Supabase preview action: <exact env/deploy/check command or dashboard action>. I understand it may add usage or charges.'
    }
  ];
}

function branchSyncNeeded(state) {
  if (!state) return true;
  return (state.ahead || 0) !== 0
    || (state.behind || 0) !== 0
    || (Array.isArray(state.dirty) && state.dirty.length > 0)
    || (Array.isArray(state.errors) && state.errors.length > 0);
}

function hasExternalFailure(summary, name) {
  return Array.isArray(summary?.failures)
    && summary.failures.some((failure) => String(failure || '').startsWith(`${name}:`));
}

function readPreviewEnvFile(file) {
  const base = {
    path: pathForReport(file),
    present: false,
    gameUrl: '',
    sitePreviewUrl: '',
    urlFieldsRead: []
  };
  if (!existsSync(file)) return base;

  const text = readFileSync(file, 'utf8');
  const gameUrl = readNamedUrl(text, ['MOCHI_SOCIAL_GAME_URL', 'NEXT_PUBLIC_MOCHI_SOCIAL_URL']);
  const sitePreviewUrl = readNamedUrl(text, ['MOCHI_SOCIAL_SITE_PREVIEW_URL', 'NEXT_PUBLIC_SITE_URL']);
  return {
    ...base,
    present: true,
    gameUrl,
    sitePreviewUrl,
    urlFieldsRead: [
      gameUrl ? 'MOCHI_SOCIAL_GAME_URL/NEXT_PUBLIC_MOCHI_SOCIAL_URL' : '',
      sitePreviewUrl ? 'MOCHI_SOCIAL_SITE_PREVIEW_URL/NEXT_PUBLIC_SITE_URL' : ''
    ].filter(Boolean)
  };
}

function readNamedUrl(text, names) {
  for (const name of names) {
    const pattern = new RegExp(`^\\s*${name}\\s*=\\s*(.+?)\\s*$`, 'm');
    const match = text.match(pattern);
    if (!match) continue;
    const value = sanitizeUrl(match[1]);
    if (value) return value;
  }
  return '';
}

function sanitizeUrl(value) {
  const trimmed = String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  if (!/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:\/[^\s]*)?$/.test(trimmed)) return '';
  return sanitize(trimmed);
}

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function git(args, cwd = root) {
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

function pathForReport(absolutePath) {
  const normalized = String(absolutePath || '').replace(/\\/g, '/');
  const normalizedRoot = root.replace(/\\/g, '/');
  const normalizedCreds = credsDir.replace(/\\/g, '/');
  if (normalized.startsWith(`${normalizedRoot}/`)) return normalized.slice(normalizedRoot.length + 1);
  if (normalized.startsWith(`${normalizedCreds}/`)) return normalized.slice(normalizedCreds.length + 1);
  return sanitize(absolutePath);
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, '<redacted-openai-key>')
    .slice(0, 1200);
}

function isSelfReferentialSyncApprovalFailure(value) {
  const text = String(value || '');
  return text.startsWith('local.sync-approval-current:')
    && (
      text.includes('stale')
      || text.includes('Run npm run alpha:sync-approval')
      || text.includes('does not match current external gate report')
    );
}

function isPostPacketRefreshFailure(value) {
  const text = String(value || '');
  return text.startsWith('local.report-hygiene:')
    && (
      text.includes('localHead does not match current HEAD')
      || text.includes('dirty state does not match current worktree')
      || text.includes('Run npm run alpha:report-hygiene')
    );
}

function renderMarkdown(report) {
  const commits = report.git.commitsAhead.length
    ? report.git.commitsAhead.map((commit) => `- ${commit}`).join('\n')
    : '- No commits ahead of upstream were detected.';
  const dirty = report.git.dirty.length
    ? report.git.dirty.map((line) => `- ${line}`).join('\n')
    : '- Worktree clean.';
  const siteDirty = report.siteGit.dirty.length
    ? report.siteGit.dirty.map((line) => `- ${line}`).join('\n')
    : '- Worktree clean.';
  const siteCommits = report.siteGit.commitsAhead.length
    ? report.siteGit.commitsAhead.map((commit) => `- ${commit}`).join('\n')
    : '- No commits ahead of upstream were detected.';
  const auditFailures = report.audit.failures.length
    ? report.audit.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const expectedAuditFailures = report.audit.expectedFailuresAfterPacket?.length
    ? report.audit.expectedFailuresAfterPacket.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const selfReferentialFailures = report.audit.selfReferentialFailures?.length
    ? report.audit.selfReferentialFailures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const postPacketRefreshFailures = report.audit.postPacketRefreshFailures?.length
    ? report.audit.postPacketRefreshFailures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const externalFailures = report.externalGates.failures.length
    ? report.externalGates.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const previewLane = formatLaneStatus(report.externalGates.lanes?.previewLive);
  const fundedLane = formatLaneStatus(report.externalGates.lanes?.fundedChain);
  const rcLane = formatLaneStatus(report.externalGates.lanes?.alphaRcReady);
  const prState = formatPrState(report.prState);
  const gameSyncAction = report.approvalActions.find((action) => action.id === 'github-branch-sync');
  const siteSyncAction = report.approvalActions.find((action) => action.id === 'github-site-branch-sync');
  const combinedGitHubSyncApproval = gameSyncAction?.currentlyRequired && siteSyncAction?.currentlyRequired
    ? `Suggested combined public-repo sync command note:

\`\`\`text
Push C:\\Users\\xtyty\\Documents\\Local RPG branch ${report.git.branch || '<branch>'} to ${report.git.upstream || 'origin/<branch>'} and push C:\\Users\\xtyty\\Documents\\Mochirii branch ${report.siteGit.branch || '<branch>'} to ${report.siteGit.upstream || 'origin/<branch>'}; then verify GitHub Actions/PR checks for both Mochi Social and Mochirii.
\`\`\`

`
    : '';
  const approvals = report.approvalsRequired.length
    ? report.approvalsRequired.map((item) => `- ${item}`).join('\n')
    : '- None. No immediate cost-sensitive approval is required by this packet.';
  const previewEnvGame = report.previewEnv.gameUrl || 'not recorded';
  const previewEnvSite = report.previewEnv.sitePreviewUrl || 'not recorded';
  const actionMatrix = report.approvalActions.map((action) => `### ${action.id}

- Provider: ${action.provider}
- Phase: ${action.phase}
- Required now: ${action.currentlyRequired ? 'yes' : 'no'}
- Reason: ${action.requirementReason}
- Action: ${action.action}
- Exact action: ${action.exactAction}
- Cost/usage risk: ${action.costRisk}
- No-cost alternative: ${action.noCostAlternative}
- Approval text: ${action.approvalText}
`).join('\n');

  return `# Mochi Social Alpha Sync Approval Packet

Generated: ${report.generatedAt}

This file is intentionally no-secret. It summarizes local branch sync, Alpha RC audit, and external gate state so the next provider/cost-sensitive actions can be approved deliberately. Public-repo commits and pushes are allowed under the current user policy; provider mutations and real-cost actions still require explicit approval. It does not contain API tokens, wallet seeds, passphrases, payment details, one-time codes, or raw secret values.

## Current Branch

- Branch: ${report.git.branch || 'unknown'}
- Upstream: ${report.git.upstream || 'unknown'}
- Local HEAD: ${report.git.localHead || 'unknown'}
- Upstream HEAD: ${report.git.upstreamHead || 'unknown'}
- Ahead: ${report.git.ahead}
- Behind: ${report.git.behind}

Dirty worktree:

${dirty}

Commits ahead of upstream:

${commits}

## Current Site Branch

- Path: ${siteRepoPath}
- Branch: ${report.siteGit.branch || 'unknown'}
- Upstream: ${report.siteGit.upstream || 'unknown'}
- Local HEAD: ${report.siteGit.localHead || 'unknown'}
- Upstream HEAD: ${report.siteGit.upstreamHead || 'unknown'}
- Ahead: ${report.siteGit.ahead}
- Behind: ${report.siteGit.behind}

Site dirty worktree:

${siteDirty}

Site commits ahead of upstream:

${siteCommits}

## PR State

${prState}

## Current Audit Stoplight

- Alpha RC audit present: ${report.audit.present ? 'yes' : 'no'}
- Alpha RC audit passed: ${report.audit.ok ? 'yes' : 'no'}
- Alpha RC checked at: ${report.audit.checkedAt || 'not recorded'}

Expected Alpha RC audit items after this packet:

${expectedAuditFailures}

Self-referential audit items resolved by generating this packet:

${selfReferentialFailures}

Post-packet freshness items resolved by running report hygiene after this packet:

${postPacketRefreshFailures}

Raw prior Alpha RC audit items:

${auditFailures}

## External Gate Snapshot

- External gate report present: ${report.externalGates.present ? 'yes' : 'no'}
- External gates passed: ${report.externalGates.ok ? 'yes' : 'no'}
- External gates checked at: ${report.externalGates.checkedAt || 'not recorded'}
- Hosted checks allowed: ${report.externalGates.hostedChecksAllowed === true ? 'yes' : 'no'}
- External report HEAD: ${report.externalGates.git?.localHead || 'not recorded'}
- Fly app: ${report.externalGates.flyApp || 'not recorded'}
- Fly volume: ${report.externalGates.flyVolume || 'not recorded'}
- Game URL: ${report.externalGates.gameUrl || 'not recorded'}
- Site preview URL: ${report.externalGates.sitePreviewUrl || 'not recorded'}
- Alpha Preview Ready / preview-live-gates: ${previewLane}
- Funded-chain gates / funded-chain-gates: ${fundedLane}
- Full Alpha RC Ready: ${rcLane}

Open external gates:

${externalFailures}

## Local Preview URL File

- File: ${report.previewEnv.path}
- Present: ${report.previewEnv.present ? 'yes' : 'no'}
- Game URL: ${previewEnvGame}
- Site preview URL: ${previewEnvSite}
- URL fields read: ${report.previewEnv.urlFieldsRead.length ? report.previewEnv.urlFieldsRead.join(', ') : 'none'}

This file is no-secret and should contain URLs only, for example:

\`\`\`text
MOCHI_SOCIAL_GAME_URL=https://mochi-social-game.fly.dev
MOCHI_SOCIAL_SITE_PREVIEW_URL=https://<vercel-preview-host>
\`\`\`

## Approval Required Before Continuing

${approvals}

## Cost-Sensitive Action Matrix

${actionMatrix}

${combinedGitHubSyncApproval}Public-repo sync note for the GitHub game branch:

\`\`\`text
Push C:\\Users\\xtyty\\Documents\\Local RPG branch ${report.git.branch || '<branch>'} to ${report.git.upstream || 'origin/<branch>'}, then verify GitHub Actions/PR checks for Mochi Social.
\`\`\`

Public-repo sync note for the Mochirii site branch:

${siteSyncAction?.currentlyRequired ? '' : 'No Mochirii site push is required right now because the site branch is already synced.\n\n'}
\`\`\`text
Push C:\\Users\\xtyty\\Documents\\Mochirii branch ${report.siteGit.branch || '<branch>'} to ${report.siteGit.upstream || 'origin/<branch>'}, then verify GitHub Actions/PR checks for Mochirii.
\`\`\`

Suggested explicit approval text for hosted/provider gates:

\`\`\`text
I approve the specific provider action: <exact Fly/Vercel/Supabase/Enjin action>. I understand it may add usage or charges.
\`\`\`

Do not use this packet as approval by itself. It is a checklist for the operator and Codex before requesting or granting approval for provider/cost-sensitive work.
`;
}

function formatLaneStatus(lane) {
  if (!lane) return 'not recorded';
  const failing = Array.isArray(lane.failingChecks) && lane.failingChecks.length ? ` failing=${lane.failingChecks.join(', ')}` : '';
  const missing = Array.isArray(lane.missingChecks) && lane.missingChecks.length ? ` missing=${lane.missingChecks.join(', ')}` : '';
  return `${lane.ok ? 'pass' : 'fail'}${failing}${missing}`;
}

function formatPrState(prState) {
  if (!prState) return '- PR state was not recorded.';
  return [
    formatPr('Game PR', prState.game),
    formatPr('Site PR', prState.site)
  ].join('\n');
}

function formatPr(label, pr) {
  if (!pr) return `- ${label}: not recorded.`;
  if (!pr.ok) {
    return `- ${label}: ${pr.repo}#${pr.number} not verified (${pr.message || 'unknown'}).`;
  }
  const localMatch = pr.localHeadMatchesPrHead ? 'local HEAD matches PR head' : 'local HEAD does not match PR head';
  const checks = Array.isArray(pr.checkNames) && pr.checkNames.length ? pr.checkNames.join(', ') : 'none';
  const draft = pr.isDraft ? 'draft' : 'ready';
  return `- ${label}: ${pr.url} ${draft} ${pr.mergeStateStatus} remote=${pr.headRefOid || 'unknown'} ${localMatch}; checks=${checks}`;
}
