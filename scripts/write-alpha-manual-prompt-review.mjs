import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_JSON || 'reports/alpha-manual-prompt-review.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_MD || 'reports/alpha-manual-prompt-review.md');
const visualReviewPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_JSON || 'reports/alpha-visual-review.json');
const visualReview = readJson(visualReviewPath);
const hostedAllowed = process.env.MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED === 'true';
const reviewer = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER || '');
const browser = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER || '');
const reviewUrl = (process.env.MOCHI_SOCIAL_MANUAL_PROMPT_URL || visualReview.data?.baseUrl || '').replace(/\/+$/, '');
const notes = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_NOTES || '');
const gitState = readGitState();
const failures = [];

const checks = [
  {
    id: 'welcome-npc',
    label: 'Welcome NPC dialog',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK),
    expectedEvidence: 'Rendered dialog says the closed alpha town is no-real-value and Canary-only after holding the Action key briefly.'
  },
  {
    id: 'guild-seal-chest',
    label: 'Guild seal chest prompt and save feedback',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK),
    expectedEvidence: 'Rendered prompt/notification confirms Mochirii Guild Seal pickup and server save feedback after holding the Action key briefly.'
  },
  {
    id: 'care-shrine',
    label: 'Habitat care loop prompt',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK),
    expectedEvidence: 'Rendered prompt/status confirms companion care, bond, growth, and the current/next bond milestone after holding the Action key briefly.'
  }
];

if (!visualReview.ok) {
  failures.push(`Visual review report is missing or invalid: ${visualReview.message}`);
} else {
  if (visualReview.data?.ok !== true) failures.push('Visual review report is not ok.');
  failures.push(...currentGitStateFailures(visualReview.data?.git, 'visual review report'));
  if (visualReview.data?.manualPromptGate?.requiredBeforeAlphaRcReady !== true) {
    failures.push('Visual review report must keep manual prompt gate enabled.');
  }
}

if (!reviewUrl) failures.push('Manual prompt review URL is required.');
if (reviewUrl && isHostedUrl(reviewUrl) && !hostedAllowed) {
  failures.push('Manual prompt review URL is hosted; set MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true only after explicit hosted-preview approval.');
}

const completedChecks = checks.filter((check) => check.ok);
const pendingChecks = checks.filter((check) => !check.ok);
if (pendingChecks.length === 0) {
  if (!reviewer) failures.push('Completed manual prompt review requires MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER.');
  if (!browser) failures.push('Completed manual prompt review requires MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER.');
}

const report = {
  ok: failures.length === 0 && pendingChecks.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret Alpha RC manual prompt review gate. This records operator confirmation for rendered NPC, guild seal chest, and habitat/care prompts; it does not contain credentials or hosted-provider proof.',
  git: gitState,
  review: {
    status: pendingChecks.length === 0 ? 'completed' : 'pending-human-review',
    reviewer: reviewer || null,
    browser: browser || null,
    url: reviewUrl || null,
    hostedAllowed,
    notes: notes || null
  },
  visualReview: visualReview.ok
    ? {
        path: pathForReport(visualReviewPath),
        ok: visualReview.data?.ok === true,
        checkedAt: visualReview.data?.checkedAt,
        baseUrl: visualReview.data?.baseUrl || null,
        pageSha256: visualReview.data?.evidence?.screenshots?.page?.sha256 || null,
        canvasSha256: visualReview.data?.evidence?.screenshots?.canvas?.sha256 || null,
        manualPromptGate: visualReview.data?.manualPromptGate?.status || null
      }
    : {
        path: pathForReport(visualReviewPath),
        ok: false,
        message: visualReview.message
      },
  checks,
  instructions: {
    localUrl: '${MOCHI_SOCIAL_BASE_URL}/play or the local suite base URL from reports/alpha-visual-review.json',
    actionInput: 'Focus the game canvas, stand adjacent to the map object, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.',
    requiredEnv: checks.map((check) => `${check.env}=true`),
    completionCommand: 'Set the required env vars plus MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER and MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER, then run npm run alpha:manual-prompt-review.'
  },
  completedChecks: completedChecks.map((check) => check.id),
  pendingChecks: pendingChecks.map((check) => check.id),
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(report), 'utf8');

if (!report.ok) {
  console.error('Mochi Social manual prompt review is not complete:');
  for (const failure of [...failures, ...pendingChecks.map((check) => `${check.id} not confirmed; set ${check.env}=true after local visual review.`)]) {
    console.error(`- ${failure}`);
  }
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social manual prompt review passed. Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function parseBool(value) {
  return /^(?:1|true|yes|pass|passed|ok)$/i.test(String(value || '').trim());
}

function isHostedUrl(value) {
  try {
    const parsed = new URL(value);
    return !['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function currentGitStateFailures(state, label) {
  const failuresForState = [];
  const head = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
  if (!state) failuresForState.push(`${label} must include git state`);
  if (!head.ok) failuresForState.push('current local HEAD could not be read');
  if (!upstream.ok) failuresForState.push('current upstream could not be read');
  if (!worktree.ok) failuresForState.push('current worktree status could not be read');
  if (!state || !head.ok || !upstream.ok || !worktree.ok) return failuresForState;

  const currentHead = firstLine(head.stdout);
  const currentUpstream = firstLine(upstream.stdout);
  const currentDirty = worktree.stdout.split(/\r?\n/).filter(Boolean);
  if (state.localHead !== currentHead) failuresForState.push(`${label} localHead does not match current HEAD`);
  if (state.upstream !== currentUpstream) failuresForState.push(`${label} upstream does not match current upstream`);
  if (!Array.isArray(state.dirty) || state.dirty.length !== currentDirty.length) {
    failuresForState.push(`${label} dirty state does not match current worktree`);
  }
  return failuresForState;
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

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
}

function renderMarkdown(summary) {
  const checkRows = summary.checks
    .map((check) => `| ${check.id} | ${check.ok ? 'pass' : 'pending'} | ${check.env} | ${check.expectedEvidence} |`)
    .join('\n');
  const failuresText = summary.failures.length ? summary.failures.map((failure) => `- ${failure}`).join('\n') : '- None';
  const pendingText = summary.pendingChecks.length ? summary.pendingChecks.map((id) => `- ${id}`).join('\n') : '- None';

  return `# Mochi Social Manual Prompt Review

Generated: ${summary.checkedAt}

This file is intentionally no-secret. It records the Alpha RC operator/human review for rendered in-canvas NPC, guild seal chest, and habitat/care prompts.

Input note: focus the game canvas, stand adjacent to the map object, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.

## Status

- Result: ${summary.ok ? 'pass' : 'pending'}
- Review status: ${summary.review.status}
- Reviewer: ${summary.review.reviewer || 'not recorded'}
- Browser: ${summary.review.browser || 'not recorded'}
- URL: ${summary.review.url || 'not recorded'}
- Hosted approval: ${summary.review.hostedAllowed ? 'yes' : 'no'}

## Prompt Checks

| Check | Status | Completion Env | Expected Evidence |
| --- | --- | --- | --- |
${checkRows}

## Pending Checks

${pendingText}

## Completion Command

\`\`\`powershell
$env:MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER="<operator name>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER="<browser and version>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_URL="<local game /play URL>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_WELCOME_NPC_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_GUILD_SEAL_CHEST_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_CARE_SHRINE_OK="true"
npm run alpha:manual-prompt-review
\`\`\`

Use a hosted URL only after explicit hosted-preview approval and set \`MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true\` for that approved run.

## Failures

${failuresText}
`;
}
