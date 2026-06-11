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
const generatedAt = new Date().toISOString();

const gitState = readGitState();
const auditSummary = readAuditSummary();
const externalGateSummary = readExternalGateSummary();

const summary = {
  ok: true,
  generatedAt,
  scope: 'No-secret approval packet for cost-aware GitHub sync and external Alpha RC gates.',
  git: gitState,
  audit: auditSummary,
  externalGates: externalGateSummary,
  approvalsRequired: [
    'Push local game branch to origin and allow GitHub Actions/PR checks to run.',
    'Set or change Fly secrets, deploy, scale, or run hosted Fly smoke/load checks.',
    'Create, fund, or dispatch Enjin Canary Fuel Tank or chain operations.',
    'Change Vercel/Supabase preview configuration or deploy preview resources.',
    'Run hosted browser, acceptance, or load smokes against Fly/Vercel/Supabase.'
  ]
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
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const upstreamHead = upstream.ok ? git(['rev-parse', upstream.stdout.trim()]) : { ok: false, stdout: '', stderr: upstream.stderr };
  const worktree = git(['status', '--porcelain']);
  const counts = upstream.ok ? git(['rev-list', '--left-right', '--count', `${upstream.stdout.trim()}...HEAD`]) : { ok: false, stdout: '', stderr: upstream.stderr };
  const log = upstream.ok ? git(['log', '--oneline', '--no-decorate', '--max-count=80', `${upstream.stdout.trim()}..HEAD`]) : { ok: false, stdout: '', stderr: upstream.stderr };
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
      failures: [`Alpha RC audit report missing or unreadable: ${audit.message}`]
    };
  }
  const failing = Array.isArray(audit.data.requirements)
    ? audit.data.requirements
      .filter((item) => item.status !== 'pass')
      .map((item) => `${item.id}: ${item.status} - ${item.message}`)
    : ['Alpha RC audit report did not include requirements.'];
  return {
    present: true,
    ok: audit.data.ok === true,
    checkedAt: audit.data.checkedAt,
    summary: audit.data.summary,
    failures: failing.map((item) => sanitize(item))
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
    failures: failing.map((item) => sanitize(item))
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
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, '<redacted-openai-key>')
    .slice(0, 1200);
}

function renderMarkdown(report) {
  const commits = report.git.commitsAhead.length
    ? report.git.commitsAhead.map((commit) => `- ${commit}`).join('\n')
    : '- No commits ahead of upstream were detected.';
  const dirty = report.git.dirty.length
    ? report.git.dirty.map((line) => `- ${line}`).join('\n')
    : '- Worktree clean.';
  const auditFailures = report.audit.failures.length
    ? report.audit.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const externalFailures = report.externalGates.failures.length
    ? report.externalGates.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None.';
  const approvals = report.approvalsRequired.map((item) => `- ${item}`).join('\n');

  return `# Mochi Social Alpha Sync Approval Packet

Generated: ${report.generatedAt}

This file is intentionally no-secret. It summarizes local branch sync, Alpha RC audit, and external gate state so the next cost-sensitive actions can be approved deliberately. It does not contain API tokens, wallet seeds, passphrases, payment details, one-time codes, or raw secret values.

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

## Current Audit Stoplight

- Alpha RC audit present: ${report.audit.present ? 'yes' : 'no'}
- Alpha RC audit passed: ${report.audit.ok ? 'yes' : 'no'}
- Alpha RC checked at: ${report.audit.checkedAt || 'not recorded'}

Open Alpha RC audit items:

${auditFailures}

## External Gate Snapshot

- External gate report present: ${report.externalGates.present ? 'yes' : 'no'}
- External gates passed: ${report.externalGates.ok ? 'yes' : 'no'}
- External gates checked at: ${report.externalGates.checkedAt || 'not recorded'}
- Fly app: ${report.externalGates.flyApp || 'not recorded'}
- Fly volume: ${report.externalGates.flyVolume || 'not recorded'}
- Game URL: ${report.externalGates.gameUrl || 'not recorded'}
- Site preview URL: ${report.externalGates.sitePreviewUrl || 'not recorded'}

Open external gates:

${externalFailures}

## Approval Required Before Continuing

${approvals}

Suggested explicit approval text for the GitHub sync gate:

\`\`\`text
I approve pushing C:\\Users\\xtyty\\Documents\\Local RPG branch ${report.git.branch || '<branch>'} to ${report.git.upstream || 'origin/<branch>'} and allow GitHub Actions/PR checks to run for Mochi Social.
\`\`\`

Suggested explicit approval text for hosted/provider gates:

\`\`\`text
I approve the specific provider action: <exact Fly/Vercel/Supabase/Enjin action>. I understand it may add usage or charges.
\`\`\`

Do not use this packet as approval by itself. It is a checklist for the operator and Codex before requesting or granting approval.
`;
}
