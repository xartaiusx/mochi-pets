import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_JSON || 'reports/alpha-manual-prompt-review.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_MD || 'reports/alpha-manual-prompt-review.md');
const visualReviewPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_JSON || 'reports/alpha-visual-review.json');

const unitySources = [
  {
    id: 'bootstrap',
    path: 'unity/Assets/MochiSocial/Scripts/Runtime/MochiSocialBootstrap.cs',
    snippets: [
      'Create your character',
      'Choose your character.',
      'Saved play uses one of these curated Mochirii presets.',
      'Joined Jade Lantern Room as',
      'LoadCharacterAsync',
      'SaveCharacterAsync',
      'LoadSharedPetOrDefaultAsync',
      'InteractWithSharedPetAsync'
    ]
  },
  {
    id: 'lirabaoPrompt',
    path: 'unity/Assets/MochiSocial/Scripts/Runtime/LirabaoInteractionPrompt.cs',
    snippets: [
      'E Care  |  Q Wave',
      'InteractWithLirabao("approach")',
      'InteractWithLirabao("care")',
      'InteractWithLirabao("wave")'
    ]
  },
  {
    id: 'lirabaoPet',
    path: 'unity/Assets/MochiSocial/Scripts/Runtime/LirabaoPetController.cs',
    snippets: [
      'ShowStaleRevisionReload',
      'ShowUnavailable',
      'TryRequestInteraction',
      'shared_pet_revision_conflict'
    ]
  },
  {
    id: 'stateStore',
    path: 'unity/Assets/MochiSocial/Scripts/Services/MochiSocialUgsStateStore.cs',
    snippets: [
      'MochiSocialConstants.CharacterSaveKey',
      'MochiSocialConstants.SharedPetSaveKey',
      'CloudSaveService.Instance.Data.Player',
      'CloudCodeService.Instance.CallEndpointAsync<SharedPetState>'
    ]
  },
  {
    id: 'constants',
    path: 'unity/Assets/MochiSocial/Scripts/Core/MochiSocialConstants.cs',
    snippets: [
      'jade-lantern-room-alpha',
      'single-shared-room',
      'lirabao',
      'character.v1',
      'room:jade-lantern-room/sharedPet.v1'
    ]
  }
];

const visualReview = readJson(visualReviewPath);
const visualArtifacts = buildVisualArtifactEvidence(visualReview);
const hostedAllowed = process.env.MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED === 'true';
const reviewer = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER || '');
const browser = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER || '');
const reviewUrl = (process.env.MOCHI_SOCIAL_MANUAL_PROMPT_URL || visualReview.data?.baseUrl || '').replace(/\/+$/, '');
const notes = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_NOTES || '');
const gitState = readGitState();
const failures = [];

const interactionContract = {
  runtime: 'Unity WebGL',
  scene: 'JadeLanternRoom',
  roomSessionId: 'jade-lantern-room-alpha',
  sharedPetKey: 'lirabao',
  keyboardReviewInputs: [
    'Choose one curated character preset in the Create your character panel.',
    'Move near Lirabao until the prompt reads E Care | Q Wave.',
    'Press E or Return to care for Lirabao.',
    'Press Q to wave to Lirabao.',
    'Use sign out, reload, and sign in again to confirm saved character and shared Lirabao progress.'
  ]
};

const reviewTargets = [
  {
    id: 'character-creation',
    label: 'Curated character creation',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_CHARACTER_CREATE_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_CHARACTER_CREATE_OK),
    expectedEvidence: 'The Unity panel lets a signed-in tester choose only one curated Mochirii preset, saves it, and joins Jade Lantern Room.',
    sourceIds: ['bootstrap', 'stateStore', 'constants'],
    steps: [
      'Sign in as a valid alpha tester through the website bridge.',
      'Confirm the Unity canvas shows Create your character.',
      'Confirm exactly the curated preset buttons are available and no avatar upload appears.',
      'Choose a preset and confirm the bridge state becomes signed-in for Jade Lantern Room.'
    ]
  },
  {
    id: 'lirabao-care',
    label: 'Shared Lirabao care prompt',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_LIRABAO_CARE_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_LIRABAO_CARE_OK),
    expectedEvidence: 'Lirabao is visible or reachable in the shared room, the E Care / Q Wave prompt appears in range, and care updates the shared pet through the Unity state path.',
    sourceIds: ['bootstrap', 'lirabaoPrompt', 'lirabaoPet', 'stateStore', 'constants'],
    steps: [
      'Move the tester avatar near Lirabao in JadeLanternRoom.',
      'Confirm the prompt text reads E Care | Q Wave.',
      'Press E or Return and confirm Lirabao accepts care or reloads cleanly on a stale revision.',
      'Confirm the message stays friendly and no-real-value.'
    ]
  },
  {
    id: 'saved-progress',
    label: 'Saved character and shared pet progress',
    env: 'MOCHI_SOCIAL_MANUAL_PROMPT_SAVED_PROGRESS_OK',
    ok: parseBool(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_SAVED_PROGRESS_OK),
    expectedEvidence: 'After logout, reload, and login, the tester returns with the saved curated character and current shared Lirabao state.',
    sourceIds: ['bootstrap', 'stateStore', 'constants'],
    steps: [
      'Create or load a tester character.',
      'Care for Lirabao once.',
      'Sign out, reload the page, sign in again, and confirm the tester character returns.',
      'Confirm Lirabao state reloads from the shared room state instead of resetting silently.'
    ]
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
  failures.push(...visualArtifactFailures(visualArtifacts));
}

const sourceEvidence = buildSourceEvidence();
for (const source of sourceEvidence.files) {
  if (source.exists !== true) {
    failures.push(`Manual prompt Unity source missing: ${source.path}`);
    continue;
  }
  for (const missing of source.missingSnippets) {
    failures.push(`Manual prompt Unity source ${source.path} missing snippet: ${missing}`);
  }
}

if (!reviewUrl) failures.push('Manual prompt review URL is required.');
if (reviewUrl && isHostedUrl(reviewUrl) && !hostedAllowed) {
  failures.push('Manual prompt review URL is hosted; set MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true only after explicit hosted-preview approval.');
}

const completedChecks = reviewTargets.filter((check) => check.ok);
const pendingChecks = reviewTargets.filter((check) => !check.ok);
if (pendingChecks.length === 0) {
  if (!reviewer) failures.push('Completed manual prompt review requires MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER.');
  if (!browser) failures.push('Completed manual prompt review requires MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER.');
}

const report = {
  ok: failures.length === 0 && pendingChecks.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret Alpha RC manual prompt review gate for the Unity shared-room alpha. This records operator confirmation for character creation, Lirabao care, and saved progress; it does not contain credentials or hosted-provider proof.',
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
  visualArtifacts,
  checks: reviewTargets.map(({ id, label, env, ok, expectedEvidence }) => ({ id, label, env, ok, expectedEvidence })),
  instructions: {
    localUrl: reviewUrl ? reviewPlayUrl(reviewUrl) : '${MOCHI_SOCIAL_BASE_URL}/play or the local suite base URL from reports/alpha-visual-review.json',
    actionInput: 'Focus the Unity canvas, use desktop movement controls, choose a curated character, then use the Lirabao prompt with E/Return for care and Q for wave.',
    requiredEnv: reviewTargets.map((check) => `${check.env}=true`),
    completionCommand: 'Set the required env vars plus MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER and MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER, then run npm run alpha:manual-prompt-review.'
  },
  interactionContract,
  reviewTargets,
  sourceEvidence,
  completedChecks: completedChecks.map((check) => check.id),
  pendingChecks: pendingChecks.map((check) => check.id),
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(report), 'utf8');

if (!report.ok) {
  console.error('Mochi Social manual prompt review is not complete:');
  for (const failure of [...failures, ...pendingChecks.map((check) => `${check.id} not confirmed; set ${check.env}=true after local Unity review.`)]) {
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

function readText(file) {
  if (!existsSync(file)) return '';
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function buildVisualArtifactEvidence(source) {
  const data = source.ok ? source.data : null;
  const screenshots = data?.evidence?.screenshots || {};
  const sharedRoom = data?.evidence?.sharedRoom || {};
  const sharedPet = data?.evidence?.sharedPet || {};
  const machineReview = data?.machineReview || {};
  return {
    visualReviewReport: {
      path: pathForReport(visualReviewPath),
      ok: data?.ok === true,
      checkedAt: data?.checkedAt || null,
      baseUrl: data?.baseUrl || null
    },
    visualSnapshotReport: {
      path: data?.evidence?.visualSnapshot?.path || 'reports/alpha-visual-snapshot.json',
      ok: data?.evidence?.visualSnapshot?.ok === true,
      checkedAt: data?.evidence?.visualSnapshot?.checkedAt || null,
      baseUrl: data?.evidence?.visualSnapshot?.baseUrl || null
    },
    browserPresenceReport: {
      path: data?.evidence?.browserPresence?.path || 'reports/alpha-browser-presence.json',
      ok: data?.evidence?.browserPresence?.ok === true,
      checkedAt: data?.evidence?.browserPresence?.checkedAt || null,
      baseUrl: data?.evidence?.browserPresence?.baseUrl || null
    },
    screenshots: {
      page: normalizeScreenshotEvidence(screenshots.page, 'reports/alpha-visual-page.png'),
      canvas: normalizeScreenshotEvidence(screenshots.canvas, 'reports/alpha-visual-canvas.png')
    },
    sharedRoom: {
      key: sanitize(sharedRoom.key || ''),
      name: sanitize(sharedRoom.name || ''),
      scene: sanitize(sharedRoom.scene || ''),
      mode: sanitize(sharedRoom.mode || ''),
      capacity: Number(sharedRoom.capacity) || 0
    },
    sharedPet: {
      key: sanitize(sharedPet.key || ''),
      name: sanitize(sharedPet.name || '')
    },
    machineReview: {
      firstScreenRenderable: machineReview.firstScreenRenderable === true,
      unityCanvasRenderable: machineReview.unityCanvasRenderable === true,
      twoTabPresence: machineReview.twoTabPresence === true,
      observerMovement: machineReview.observerMovement === true,
      legacyHudAbsent: machineReview.legacyHudAbsent === true,
      inputGuardPresent: machineReview.inputGuardPresent === true,
      noFutureEconomyCopy: machineReview.noFutureEconomyCopy === true
    },
    manualPromptGate: {
      status: sanitize(data?.manualPromptGate?.status || ''),
      reason: sanitize(data?.manualPromptGate?.reason || ''),
      requiredChecks: Array.isArray(data?.manualPromptGate?.requiredChecks)
        ? data.manualPromptGate.requiredChecks.map(sanitize)
        : []
    }
  };
}

function normalizeScreenshotEvidence(value, fallbackPath) {
  return {
    path: sanitize(value?.path || fallbackPath),
    exists: value?.exists === true,
    bytes: Number(value?.bytes) || 0,
    width: Number(value?.width) || 0,
    height: Number(value?.height) || 0,
    sha256: sanitize(value?.sha256 || ''),
    reportedSha256: sanitize(value?.reportedSha256 || '')
  };
}

function visualArtifactFailures(artifacts) {
  const artifactFailures = [];
  if (artifacts.visualReviewReport.ok !== true) artifactFailures.push('Manual prompt visual artifact bundle requires a passing visual review report.');
  if (artifacts.visualSnapshotReport.ok !== true) artifactFailures.push('Manual prompt visual artifact bundle requires a passing visual snapshot report.');
  if (artifacts.browserPresenceReport.ok !== true) artifactFailures.push('Manual prompt visual artifact bundle requires a passing browser presence report.');
  for (const [label, screenshot] of Object.entries(artifacts.screenshots)) {
    if (screenshot.exists !== true) artifactFailures.push(`Manual prompt visual artifact ${label} screenshot is missing.`);
    if (!screenshot.sha256) artifactFailures.push(`Manual prompt visual artifact ${label} screenshot hash is missing.`);
    if (!screenshot.width || !screenshot.height) artifactFailures.push(`Manual prompt visual artifact ${label} screenshot dimensions are missing.`);
  }
  if (artifacts.sharedRoom.key !== 'jade-lantern-room-alpha') artifactFailures.push('Manual prompt visual artifact room key must be jade-lantern-room-alpha.');
  if (artifacts.sharedRoom.mode !== 'single-shared-room') artifactFailures.push('Manual prompt visual artifact room mode must be single-shared-room.');
  if (artifacts.sharedRoom.scene !== 'JadeLanternRoom') artifactFailures.push('Manual prompt visual artifact scene must be JadeLanternRoom.');
  if (artifacts.sharedPet.key !== 'lirabao') artifactFailures.push('Manual prompt visual artifact shared pet must be Lirabao.');
  for (const [key, value] of Object.entries(artifacts.machineReview)) {
    if (value !== true) artifactFailures.push(`Manual prompt machine visual evidence missing ${key}.`);
  }
  return artifactFailures;
}

function buildSourceEvidence() {
  return {
    files: unitySources.map((source) => {
      const absolutePath = resolve(root, source.path);
      const text = readText(absolutePath);
      const missingSnippets = source.snippets.filter((snippet) => !text.includes(snippet));
      return {
        id: source.id,
        path: source.path,
        exists: Boolean(text),
        sha256: text ? sha256Text(text) : '',
        snippets: source.snippets,
        missingSnippets
      };
    })
  };
}

function reviewPlayUrl(value) {
  try {
    const parsed = new URL(value);
    if (!/\/(?:play|embed)$/.test(parsed.pathname)) {
      parsed.pathname = `${parsed.pathname.replace(/\/+$/, '')}/play`;
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return `${String(value || '').replace(/\/+$/, '')}/play`;
  }
}

function sha256Text(value) {
  return createHash('sha256').update(String(value || '')).digest('hex');
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
  const targetRows = summary.reviewTargets
    .map((target) => `| ${target.id} | ${target.sourceIds.join(', ')} | ${target.steps.join('<br>')} |`)
    .join('\n');
  const sourceRows = summary.sourceEvidence.files
    .map((source) => `| ${source.id} | ${source.path} | ${source.exists ? 'yes' : 'no'} | ${source.sha256 || 'missing'} | ${source.missingSnippets.length ? source.missingSnippets.join('; ') : 'none'} |`)
    .join('\n');
  const screenshotRows = Object.entries(summary.visualArtifacts.screenshots)
    .map(([label, screenshot]) => `| ${label} | ${screenshot.path} | ${screenshot.width}x${screenshot.height} | ${screenshot.bytes} | ${screenshot.sha256 || 'missing'} |`)
    .join('\n');
  const manualGateChecks = summary.visualArtifacts.manualPromptGate.requiredChecks.length
    ? summary.visualArtifacts.manualPromptGate.requiredChecks.map((check) => `- ${check}`).join('\n')
    : '- None recorded';
  const failuresText = summary.failures.length ? summary.failures.map((failure) => `- ${failure}`).join('\n') : '- None';
  const pendingText = summary.pendingChecks.length ? summary.pendingChecks.map((id) => `- ${id}`).join('\n') : '- None';

  return `# Mochi Social Manual Prompt Review

Generated: ${summary.checkedAt}

This file is intentionally no-secret. It records the Alpha RC operator/human review for the Unity shared-room alpha: character creation, Lirabao care, and saved progress.

Input note: focus the Unity canvas, create or load a curated character, move near Lirabao, use E/Return for care and Q for wave, then reload/logout/login to confirm saved progress.

## Status

- Result: ${summary.ok ? 'pass' : 'pending'}
- Review status: ${summary.review.status}
- Reviewer: ${summary.review.reviewer || 'not recorded'}
- Browser: ${summary.review.browser || 'not recorded'}
- URL: ${summary.review.url || 'not recorded'}
- Hosted approval: ${summary.review.hostedAllowed ? 'yes' : 'no'}

## Visual Review Evidence Bundle

- Visual review report: ${summary.visualArtifacts.visualReviewReport.path} (${summary.visualArtifacts.visualReviewReport.ok ? 'pass' : 'not passing'}, ${summary.visualArtifacts.visualReviewReport.checkedAt || 'not recorded'})
- Visual snapshot report: ${summary.visualArtifacts.visualSnapshotReport.path} (${summary.visualArtifacts.visualSnapshotReport.ok ? 'pass' : 'not passing'}, ${summary.visualArtifacts.visualSnapshotReport.checkedAt || 'not recorded'})
- Browser presence report: ${summary.visualArtifacts.browserPresenceReport.path} (${summary.visualArtifacts.browserPresenceReport.ok ? 'pass' : 'not passing'}, ${summary.visualArtifacts.browserPresenceReport.checkedAt || 'not recorded'})
- Review base URL: ${summary.visualArtifacts.visualReviewReport.baseUrl || summary.visualArtifacts.visualSnapshotReport.baseUrl || summary.visualArtifacts.browserPresenceReport.baseUrl || 'not recorded'}
- Shared room: ${summary.visualArtifacts.sharedRoom.name || 'not recorded'} (${summary.visualArtifacts.sharedRoom.key || 'not recorded'}, ${summary.visualArtifacts.sharedRoom.mode || 'not recorded'})
- Shared pet: ${summary.visualArtifacts.sharedPet.name || 'not recorded'} (${summary.visualArtifacts.sharedPet.key || 'not recorded'})
- Manual gate status from visual review: ${summary.visualArtifacts.manualPromptGate.status || 'not recorded'}
- Manual gate reason: ${summary.visualArtifacts.manualPromptGate.reason || 'not recorded'}

Screenshot artifacts:

| Artifact | Path | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | --- | --- |
${screenshotRows}

Visual-review required manual checks:

${manualGateChecks}

## Prompt Checks

| Check | Status | Completion Env | Expected Evidence |
| --- | --- | --- | --- |
${checkRows}

## Unity Review Route

| Target | Source Evidence | Steps |
| --- | --- | --- |
${targetRows}

## Source Evidence

| Source | Path | Exists | SHA-256 | Missing Snippets |
| --- | --- | --- | --- | --- |
${sourceRows}

## Pending Checks

${pendingText}

## Completion Command

\`\`\`powershell
$env:MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER="<operator name>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER="<browser and version>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_URL="<local game /play URL>"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_CHARACTER_CREATE_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_LIRABAO_CARE_OK="true"
$env:MOCHI_SOCIAL_MANUAL_PROMPT_SAVED_PROGRESS_OK="true"
npm run alpha:manual-prompt-review
\`\`\`

Use a hosted URL only after explicit hosted-preview approval and set \`MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true\` for that approved run.

## Failures

${failuresText}
`;
}
