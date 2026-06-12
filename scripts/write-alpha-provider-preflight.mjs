import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_PROVIDER_PREFLIGHT_JSON || 'reports/alpha-provider-preflight.json');
const outputPath = resolve(credsDir, process.env.MOCHI_SOCIAL_PROVIDER_PREFLIGHT_MD || 'mochi-social-alpha-provider-preflight.md');
const operatorReportPath = resolve(root, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST_JSON || 'reports/alpha-operator-checklist.json');
const externalGatePath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const syncApprovalPath = resolve(root, process.env.MOCHI_SOCIAL_SYNC_APPROVAL_JSON || 'reports/alpha-sync-approval.json');
const generatedAt = new Date().toISOString();
const expectedProviderActionIds = [
  'github-branch-sync',
  'github-site-branch-sync',
  'fly-secret-update',
  'fly-funded-chain-secret-update',
  'fly-live-game-url',
  'fly-live-game-contract',
  'vercel-supabase-preview-contract',
  'enjin-canary-readiness'
];

const externalGates = readJson(externalGatePath);
const operatorChecklist = readJson(operatorReportPath);
const syncApproval = readJson(syncApprovalPath);
const gitState = readGitState();
const supabaseProjectRef = externalGates.data?.supabasePreviewRef || operatorChecklist.data?.targets?.supabaseProjectRef || 'dnxumaiooljdnbjvzbdc';
const privateInputs = buildPrivateInputInventory(supabaseProjectRef);
const actionQueue = Array.isArray(operatorChecklist.data?.providerActionQueue)
  ? operatorChecklist.data.providerActionQueue.map(sanitizeAction)
  : [];
const externalFailures = Array.isArray(externalGates.data?.checks)
  ? externalGates.data.checks
    .filter((check) => check.status === 'fail')
    .map((check) => `${sanitize(check.name)}: ${sanitize(check.message)}`)
  : [];

const report = {
  ok: true,
  generatedAt,
  scope: 'No-secret provider preflight for Mochi Social Alpha RC. This report reads no private credential file contents and performs no provider mutations.',
  markdownPath: pathForReport(outputPath),
  git: gitState,
  expectedProviderActionIds,
  sources: {
    externalGates: summarizeSource(externalGates, externalGatePath),
    operatorChecklist: summarizeSource(operatorChecklist, operatorReportPath),
    syncApproval: summarizeSource(syncApproval, syncApprovalPath)
  },
  noCostBoundary: 'Preflight checks filenames and generated no-secret reports only. Pushing, setting secrets, deploying, hosted smokes, Wallet Daemon startup/import, Enjin operations, and Fuel Tank funding still require explicit action-specific approval.',
  privateInputs,
  providerActionQueue: mergeProviderActionQueue(actionQueue, externalGates.data?.checks || []),
  externalFailures,
  nextApprovalIds: mergeProviderActionQueue(actionQueue, externalGates.data?.checks || []).map((item) => item.id),
  missingExpectedPrivateInputFiles: privateInputs.filter((input) => input.expectedBeforeProviderWork && !input.exists).map((input) => input.fileName)
};

await mkdir(dirname(reportPath), { recursive: true });
await mkdir(credsDir, { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(outputPath, renderMarkdown(report), 'utf8');

console.log(`Wrote no-secret Mochi Social provider preflight: ${outputPath}`);
console.log(`Report: ${reportPath}`);

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found', data: null };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed', data: null };
  }
}

function buildPrivateInputInventory(projectRef) {
  const entries = [
    {
      id: 'supabase-preview-api-keys',
      fileName: `supabase-preview-${projectRef}-api-keys.local.json`,
      expectedBeforeProviderWork: true,
      purpose: 'Operator-owned Supabase preview URL and publishable key source for Fly/Vercel setup.',
      usedBy: ['fly-secret-update', 'vercel-supabase-preview-contract']
    },
    {
      id: 'game-bridge-token',
      fileName: 'mochi-social-alpha-generated-secrets.local.txt',
      expectedBeforeProviderWork: true,
      purpose: 'Operator-owned scoped game bridge token source for Fly and Supabase Edge Functions.',
      usedBy: ['fly-secret-update']
    },
    {
      id: 'enjin-operator-values',
      fileName: 'enjin-mochi-social-alpha.local.txt',
      expectedBeforeProviderWork: false,
      purpose: 'Optional operator-owned place to track Enjin collection ID, Fuel Tank ID/address, Platform token status, and Wallet Daemon connected status without committing values.',
      usedBy: ['fly-funded-chain-secret-update', 'enjin-canary-readiness']
    },
    {
      id: 'vercel-preview-origin',
      fileName: 'mochi-social-alpha-vercel-preview.local.txt',
      expectedBeforeProviderWork: false,
      purpose: 'Optional operator-owned place to track the approved Vercel preview origin used for RPG_ALLOWED_ORIGINS and site contract checks.',
      usedBy: ['fly-secret-update', 'vercel-supabase-preview-contract']
    }
  ];

  return entries.map((entry) => ({
    ...entry,
    exists: existsSync(resolve(credsDir, entry.fileName)),
    contentsRead: false
  }));
}

function sanitizeAction(action) {
  return {
    id: sanitize(action.id),
    provider: sanitize(action.provider),
    title: sanitize(action.title),
    blocker: sanitize(action.blocker),
    approvalText: sanitize(action.approvalText),
    noCostFallback: sanitize(action.noCostFallback)
  };
}

function mergeProviderActionQueue(operatorQueue, externalChecks) {
  const merged = [...operatorQueue];
  const existingIds = new Set(merged.map((item) => item.id));

  for (const action of derivedExternalGateActions(externalChecks)) {
    if (!existingIds.has(action.id)) {
      merged.push(action);
      existingIds.add(action.id);
    }
  }

  return merged;
}

function derivedExternalGateActions(checks) {
  if (!Array.isArray(checks)) return [];

  const failed = new Set(
    checks
      .filter((check) => check?.status === 'fail')
      .map((check) => String(check.name || ''))
  );
  const actions = [];

  if (failed.has('Live game contract')) {
    actions.push({
      id: 'fly-live-game-contract',
      provider: 'Fly.io',
      title: 'Run the approved hosted Fly game contract check.',
      blocker: 'Hosted Fly game contract checks are gated until MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true is approved for the current Fly URL.',
      approvalText: 'I approve running the hosted Fly game contract check with MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true against https://mochi-social-game.fly.dev. I understand this may hit Fly resources and add usage.',
      noCostFallback: 'Keep the check local-only and leave the live game contract gate red.'
    });
  }

  if (failed.has('Site preview contract')) {
    actions.push({
      id: 'vercel-supabase-preview-contract',
      provider: 'Vercel/Supabase/Fly',
      title: 'Run the approved hosted Mochirii preview contract check.',
      blocker: 'Hosted site/game preview contract checks are gated until MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true is approved for the current Vercel Preview and Fly URLs.',
      approvalText: 'I approve running the hosted Mochirii preview contract check with MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true against the configured Vercel Preview, Fly game URL, and Supabase Preview URLs. I understand this may hit Vercel/Supabase/Fly resources and add usage.',
      noCostFallback: 'Keep the check local-only and leave the site preview contract gate red.'
    });
  }

  return actions;
}

function summarizeSource(source, file) {
  return {
    path: pathForReport(resolve(root, file)),
    present: source.ok,
    checkedAt: source.data?.checkedAt || source.data?.generatedAt || null,
    ok: source.data?.ok === true
  };
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const counts = upstream.ok ? git(['rev-list', '--left-right', '--count', `${firstLine(upstream.stdout)}...HEAD`]) : { ok: false, stdout: '', stderr: upstream.stderr };
  const worktree = git(['status', '--porcelain']);
  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);
  return {
    branch: firstLine(branch.stdout),
    localHead: firstLine(localHead.stdout),
    upstream: firstLine(upstream.stdout),
    ahead: Number.parseInt(aheadText, 10) || 0,
    behind: Number.parseInt(behindText, 10) || 0,
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, counts, worktree]
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

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, '<redacted-openai-key>')
    .slice(0, 1200);
}

function renderMarkdown(summary) {
  const privateInputLines = summary.privateInputs.map((input) => `- ${input.fileName}: ${input.exists ? 'present' : 'not found'}; contents read: no; used by ${input.usedBy.join(', ')}`).join('\n');
  const queueLines = summary.providerActionQueue.length
    ? summary.providerActionQueue.map((item, index) => `${index + 1}. ${item.id} (${item.provider})
   - Blocker: ${item.blocker}
   - Approval text: ${item.approvalText}
   - No-cost fallback: ${item.noCostFallback}`).join('\n')
    : '1. No provider action queue was found. Run npm run alpha:operator-checklist.';
  const failureLines = summary.externalFailures.length
    ? summary.externalFailures.map((failure) => `- ${failure}`).join('\n')
    : '- None recorded.';
  const expectedActionLines = summary.expectedProviderActionIds.map((id) => `- ${id}`).join('\n');
  const nextApprovalLines = summary.nextApprovalIds.length
    ? summary.nextApprovalIds.map((id) => `- ${id}`).join('\n')
    : '- None.';

  return `# Mochi Social Alpha Provider Preflight

Generated: ${summary.generatedAt}

This file is intentionally no-secret. It checks expected local filenames and generated no-secret reports only. It does not read private credential file contents, open dashboards, set secrets, push branches, deploy, start Wallet Daemon, submit Enjin operations, or fund Fuel Tanks.

## Git State

- Branch: ${summary.git.branch || 'unknown'}
- Local HEAD: ${summary.git.localHead || 'unknown'}
- Upstream: ${summary.git.upstream || 'unknown'}
- Dirty tracked files: ${summary.git.dirty.length}

## Source Reports

- External gates: ${summary.sources.externalGates.present ? 'present' : 'missing'} (${summary.sources.externalGates.checkedAt || 'not recorded'})
- Operator checklist: ${summary.sources.operatorChecklist.present ? 'present' : 'missing'} (${summary.sources.operatorChecklist.checkedAt || 'not recorded'})
- Sync approval: ${summary.sources.syncApproval.present ? 'present' : 'missing'} (${summary.sources.syncApproval.checkedAt || 'not recorded'})

## Expected Private Input Filenames

${privateInputLines}

Missing expected private input files:

${summary.missingExpectedPrivateInputFiles.length ? summary.missingExpectedPrivateInputFiles.map((file) => `- ${file}`).join('\n') : '- None.'}

## Current External Failures

${failureLines}

## Known Provider Action IDs

These are all provider action IDs the Alpha RC tooling recognizes. Not every known action is required on every pass.

${expectedActionLines}

## Next Approval IDs

These IDs are the currently actionable queue from the latest operator checklist.

${nextApprovalLines}

## Approval Queue

${queueLines}

## Boundary

${summary.noCostBoundary}
`;
}
