import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_JSON || 'reports/alpha-manual-prompt-review.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_MD || 'reports/alpha-manual-prompt-review.md');
const visualReviewPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_JSON || 'reports/alpha-visual-review.json');
const mapEventSourcePath = resolve(root, 'apps/game/src/modules/main/event.ts');
const mapServerSourcePath = resolve(root, 'apps/game/src/modules/main/server.ts');
const visualReview = readJson(visualReviewPath);
const mapEventSource = readText(mapEventSourcePath);
const mapServerSource = readText(mapServerSourcePath);
const visualArtifacts = buildVisualArtifactEvidence(visualReview);
const hostedAllowed = process.env.MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED === 'true';
const reviewer = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER || '');
const browser = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER || '');
const reviewUrl = (process.env.MOCHI_SOCIAL_MANUAL_PROMPT_URL || visualReview.data?.baseUrl || '').replace(/\/+$/, '');
const notes = sanitize(process.env.MOCHI_SOCIAL_MANUAL_PROMPT_NOTES || '');
const gitState = readGitState();
const failures = [];
const logicalTileSizePx = 64;

const interactionContract = {
  source: pathForReport(mapEventSourcePath),
  helper: 'setAlphaInteractable',
  tileSizePx: logicalTileSizePx,
  actionHitbox: { width: 64, height: 64 },
  actionInput: 'Focus the game canvas, stand within one 64px logical tile of the map object, face it, and hold Space/Action for about 200ms.'
};

const reviewTargets = [
  {
    id: 'welcome-npc',
    label: 'Welcome NPC dialog',
    position: eventPlacement(mapServerSource, 'welcome-npc'),
    setup: 'No setup required after the player spawns in Jade Lantern Court.',
    graphic: 'sifu-narao',
    expectedRenderedPhrases: ['Welcome to Mochi Social', 'no-real-value', 'Canary-only'],
    expectedNotification: 'Guild spark found',
    saveSource: null
  },
  {
    id: 'guild-seal-chest',
    label: 'Guild seal chest prompt and save feedback',
    position: eventPlacement(mapServerSource, 'guild-seal-chest'),
    setup: 'Use a fresh local save or confirm the repeat prompt says the Mochirii Guild Seal is already tucked away.',
    graphic: 'chest',
    expectedRenderedPhrases: ['Mochirii Guild Seal', 'server saved'],
    expectedNotification: 'Guild Seal added',
    saveSource: 'guild-seal-chest'
  },
  {
    id: 'care-shrine',
    label: 'Habitat care loop prompt',
    position: eventPlacement(mapServerSource, 'care-shrine'),
    setup: 'First bond with Lirabao at spirit-lirabao, then interact with the care shrine.',
    setupTarget: {
      id: 'spirit-lirabao',
      position: eventPlacement(mapServerSource, 'spirit-lirabao'),
      expectedRenderedPhrases: ['joined your Mochirii spirit journal']
    },
    graphic: 'sifu-narao',
    expectedRenderedPhrases: ['Care complete', 'growth with bond'],
    expectedNotification: 'Spirit bond',
    saveSource: 'spirit-care'
  }
];

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
  failures.push(...visualArtifactFailures(visualArtifacts));
}

for (const snippet of [
  'ALPHA_INTERACTABLE_HITBOX = { width: 64, height: 64 }',
  "setAlphaInteractable(this, 'sifu-narao')",
  'setAlphaInteractable(this, spirit.sprite)',
  "setAlphaInteractable(this, 'chest')"
]) {
  if (!mapEventSource.includes(snippet)) failures.push(`Manual prompt review source contract missing snippet: ${snippet}`);
}

for (const target of reviewTargets) {
  if (!target.position) failures.push(`Manual prompt review target placement missing: ${target.id}`);
  for (const phrase of target.expectedRenderedPhrases) {
    if (!mapEventSource.includes(phrase)) failures.push(`Manual prompt review target ${target.id} missing expected phrase in source: ${phrase}`);
  }
  if (target.expectedNotification && !mapEventSource.includes(target.expectedNotification)) {
    failures.push(`Manual prompt review target ${target.id} missing expected notification in source: ${target.expectedNotification}`);
  }
  if (target.saveSource && !mapEventSource.includes(`source: '${target.saveSource}'`)) {
    failures.push(`Manual prompt review target ${target.id} missing save source in source: ${target.saveSource}`);
  }
  if (target.setupTarget) {
    if (!target.setupTarget.position) failures.push(`Manual prompt review setup target placement missing: ${target.setupTarget.id}`);
    for (const phrase of target.setupTarget.expectedRenderedPhrases) {
      if (!mapEventSource.includes(phrase)) failures.push(`Manual prompt review setup target ${target.setupTarget.id} missing expected phrase in source: ${phrase}`);
    }
  }
}

if (!reviewUrl) failures.push('Manual prompt review URL is required.');
if (reviewUrl && isHostedUrl(reviewUrl) && !hostedAllowed) {
  failures.push('Manual prompt review URL is hosted; set MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED=true only after explicit hosted-preview approval.');
}

const completedChecks = checks.filter((check) => check.ok);
const pendingChecks = checks.filter((check) => !check.ok);
const sourceEvidence = buildSourceEvidence();
const reviewRoute = buildReviewRoute();
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
  visualArtifacts,
  checks,
  instructions: {
    localUrl: reviewUrl ? reviewPlayUrl(reviewUrl) : '${MOCHI_SOCIAL_BASE_URL}/play or the local suite base URL from reports/alpha-visual-review.json',
    actionInput: 'Focus the game canvas, stand within one 64px logical tile of the map object, face it, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.',
    requiredEnv: checks.map((check) => `${check.env}=true`),
    completionCommand: 'Set the required env vars plus MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER and MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER, then run npm run alpha:manual-prompt-review.'
  },
  interactionContract,
  reviewTargets,
  reviewRoute,
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
    mapObjects: Array.isArray(data?.evidence?.mapObjects) ? data.evidence.mapObjects.map(sanitize) : [],
    habitat: sanitize(data?.evidence?.habitat || ''),
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
  if (!artifacts.mapObjects.includes('welcome-npc')) artifactFailures.push('Manual prompt visual artifact map-object list missing welcome-npc.');
  if (!artifacts.mapObjects.includes('guild-seal-chest')) artifactFailures.push('Manual prompt visual artifact map-object list missing guild-seal-chest.');
  if (!artifacts.mapObjects.includes('care-shrine')) artifactFailures.push('Manual prompt visual artifact map-object list missing care-shrine.');
  if (artifacts.habitat !== 'Jade Lantern Court') artifactFailures.push('Manual prompt visual artifact habitat must be Jade Lantern Court.');
  return artifactFailures;
}

function eventPlacement(source, id) {
  const pattern = new RegExp(`id:\\s*'${escapeRegExp(id)}',\\s*x:\\s*(\\d+),\\s*y:\\s*(\\d+),`);
  const match = source.match(pattern);
  if (!match) return null;
  const worldPx = {
    x: Number(match[1]),
    y: Number(match[2])
  };
  return {
    ...worldPx,
    unit: 'world-px',
    worldPx,
    logicalTile: worldToLogicalTile(worldPx)
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

function buildReviewRoute() {
  return reviewTargets.map((target, index) => {
    const position = target.position;
    const setupPosition = target.setupTarget?.position || null;
    const adjacentLogicalTiles = position ? adjacentTiles(position.logicalTile) : [];
    return {
      step: index + 1,
      id: target.id,
      label: target.label,
      position,
      approach: position
        ? {
            adjacentLogicalTiles,
            adjacentWorldPx: adjacentLogicalTiles.map((tile) => ({
              ...tile,
              worldPx: logicalTileToWorld(tile)
            })),
            actionInput: interactionContract.actionInput
          }
        : null,
      setupTarget: target.setupTarget
        ? {
            id: target.setupTarget.id,
            position: setupPosition,
            expectedRenderedPhrases: target.setupTarget.expectedRenderedPhrases
          }
        : null,
      expectedRenderedPhrases: target.expectedRenderedPhrases,
      expectedNotification: target.expectedNotification,
      saveSource: target.saveSource
    };
  });
}

function worldToLogicalTile(position) {
  return {
    x: Math.round(position.x / logicalTileSizePx),
    y: Math.round(position.y / logicalTileSizePx)
  };
}

function logicalTileToWorld(tile) {
  return {
    x: tile.x * logicalTileSizePx,
    y: tile.y * logicalTileSizePx
  };
}

function adjacentTiles(tile) {
  return [
    { x: tile.x, y: Math.max(0, tile.y - 1), face: 'down' },
    { x: Math.max(0, tile.x - 1), y: tile.y, face: 'right' },
    { x: tile.x + 1, y: tile.y, face: 'left' },
    { x: tile.x, y: tile.y + 1, face: 'up' }
  ];
}

function buildSourceEvidence() {
  return {
    eventSource: {
      path: pathForReport(mapEventSourcePath),
      sha256: sha256Text(mapEventSource),
      targets: Object.fromEntries(reviewTargets.map((target) => [target.id, sourceTargetEvidence(target, mapEventSource, mapServerSource)]))
    },
    mapServerSource: {
      path: pathForReport(mapServerSourcePath),
      sha256: sha256Text(mapServerSource)
    }
  };
}

function sourceTargetEvidence(target, eventSource, serverSource) {
  const sourcePhrases = Object.fromEntries(
    target.expectedRenderedPhrases.map((phrase) => [phrase, sourceLineNumber(eventSource, phrase)])
  );
  const setupPhrases = target.setupTarget
    ? Object.fromEntries(target.setupTarget.expectedRenderedPhrases.map((phrase) => [phrase, sourceLineNumber(eventSource, phrase)]))
    : {};
  return {
    placementLine: sourceLineNumber(serverSource, `id: '${target.id}'`),
    expectedPhraseLines: sourcePhrases,
    expectedNotificationLine: target.expectedNotification ? sourceLineNumber(eventSource, target.expectedNotification) : null,
    saveSourceLine: target.saveSource ? sourceLineNumber(eventSource, `source: '${target.saveSource}'`) : null,
    setupTarget: target.setupTarget
      ? {
          id: target.setupTarget.id,
          placementLine: sourceLineNumber(serverSource, `id: '${target.setupTarget.id}'`),
          expectedPhraseLines: setupPhrases
        }
      : null
  };
}

function sourceLineNumber(source, snippet) {
  const index = source.indexOf(snippet);
  if (index < 0) return null;
  return source.slice(0, index).split(/\r?\n/).length;
}

function sha256Text(value) {
  return createHash('sha256').update(String(value || '')).digest('hex');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    .map((target) => {
      const position = formatPosition(target.position);
      const setupPosition = target.setupTarget?.position ? ` Setup ${target.setupTarget.id}: ${formatPosition(target.setupTarget.position)}.` : '';
      return `| ${target.id} | ${position} | ${target.graphic} | ${target.expectedRenderedPhrases.join('; ')} | ${target.setup}${setupPosition} |`;
    })
    .join('\n');
  const routeRows = summary.reviewRoute
    .map((target) => {
      const position = formatPosition(target.position);
      const approach = target.approach?.adjacentWorldPx
        ?.map((tile) => `tile ${tile.x},${tile.y} / px ${tile.worldPx.x},${tile.worldPx.y} face ${tile.face}`)
        .join('; ') || 'missing';
      const setup = target.setupTarget?.position ? `${target.setupTarget.id} at ${formatPosition(target.setupTarget.position)}` : 'none';
      return `| ${target.step} | ${target.id} | ${position} | ${approach} | ${setup} |`;
    })
    .join('\n');
  const sourceRows = summary.reviewTargets
    .map((target) => {
      const evidence = summary.sourceEvidence.eventSource.targets[target.id] || {};
      const phraseLines = Object.entries(evidence.expectedPhraseLines || {})
        .map(([phrase, line]) => `${phrase}: ${line || 'missing'}`)
        .join('; ');
      return `| ${target.id} | ${evidence.placementLine || 'missing'} | ${phraseLines || 'missing'} | ${evidence.expectedNotificationLine || 'n/a'} | ${evidence.saveSourceLine || 'n/a'} |`;
    })
    .join('\n');
  const failuresText = summary.failures.length ? summary.failures.map((failure) => `- ${failure}`).join('\n') : '- None';
  const pendingText = summary.pendingChecks.length ? summary.pendingChecks.map((id) => `- ${id}`).join('\n') : '- None';
  const screenshotRows = Object.entries(summary.visualArtifacts.screenshots)
    .map(([label, screenshot]) => `| ${label} | ${screenshot.path} | ${screenshot.width}x${screenshot.height} | ${screenshot.bytes} | ${screenshot.sha256 || 'missing'} |`)
    .join('\n');
  const visualMapObjects = summary.visualArtifacts.mapObjects.length
    ? summary.visualArtifacts.mapObjects.join(', ')
    : 'none recorded';
  const manualGateChecks = summary.visualArtifacts.manualPromptGate.requiredChecks.length
    ? summary.visualArtifacts.manualPromptGate.requiredChecks.map((check) => `- ${check}`).join('\n')
    : '- None recorded';

  return `# Mochi Social Manual Prompt Review

Generated: ${summary.checkedAt}

This file is intentionally no-secret. It records the Alpha RC operator/human review for rendered in-canvas NPC, guild seal chest, and habitat/care prompts.

Input note: focus the game canvas, stand within one 64px logical tile of the map object, face it, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.

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
- Habitat: ${summary.visualArtifacts.habitat || 'not recorded'}
- Map objects covered: ${visualMapObjects}
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

## Source-Tied Target Checklist

- Action hitbox: ${summary.interactionContract.actionHitbox.width}x${summary.interactionContract.actionHitbox.height}px
- Logical tile size: ${summary.interactionContract.tileSizePx}px
- Source helper: ${summary.interactionContract.source} / ${summary.interactionContract.helper}

| Target | Position | Graphic | Confirm Rendered Phrases | Setup |
| --- | --- | --- | --- | --- |
${targetRows}

## Review Route

| Step | Target | Target Position | Adjacent Action Positions | Setup Target |
| --- | --- | --- | --- | --- |
${routeRows}

## Source Evidence

- Event source: ${summary.sourceEvidence.eventSource.path}
- Event source SHA-256: ${summary.sourceEvidence.eventSource.sha256}
- Map server source: ${summary.sourceEvidence.mapServerSource.path}
- Map server source SHA-256: ${summary.sourceEvidence.mapServerSource.sha256}

| Target | Placement Line | Expected Phrase Lines | Notification Line | Save Source Line |
| --- | --- | --- | --- | --- |
${sourceRows}

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

function formatPosition(position) {
  if (!position) return 'missing';
  const world = position.worldPx || position;
  const tile = position.logicalTile || worldToLogicalTile(world);
  return `tile ${tile.x},${tile.y} / px ${world.x},${world.y}`;
}
