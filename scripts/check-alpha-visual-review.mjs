import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_JSON || 'reports/alpha-visual-review.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_MD || 'reports/alpha-visual-review.md');
const visualSnapshotPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REPORT || 'reports/alpha-visual-snapshot.json');
const browserPresencePath = resolve(root, process.env.MOCHI_SOCIAL_BROWSER_PRESENCE_REPORT || 'reports/alpha-browser-presence.json');
const mapEventPath = resolve(root, 'apps/game/src/modules/main/event.ts');
const mapServerPath = resolve(root, 'apps/game/src/modules/main/server.ts');
const alphaContentPath = resolve(root, 'apps/game/src/alpha/content.ts');

const failures = [];
const visualSnapshot = readJson(visualSnapshotPath);
const browserPresence = readJson(browserPresencePath);
const mapEventSource = readText(mapEventPath);
const mapServerSource = readText(mapServerPath);
const alphaContentSource = readText(alphaContentPath);

assertReport('visual snapshot', visualSnapshot);
assertReport('browser presence', browserPresence);
assert(visualSnapshot.data?.localOnlyDefault === true && visualSnapshot.data?.hostedAllowed === false, 'visual snapshot must remain local-only by default');
assert(browserPresence.data?.localOnlyDefault === true && browserPresence.data?.hostedAllowed === false, 'browser presence must remain local-only by default');
assert(Boolean(visualSnapshot.data?.dom?.hud), 'visual snapshot must show HUD DOM evidence');
assert(Boolean(visualSnapshot.data?.dom?.canvas), 'visual snapshot must show canvas DOM evidence');
assert(String(visualSnapshot.data?.dom?.title || '') === 'Mochi Social', 'visual snapshot page title must be Mochi Social');
assert(String(visualSnapshot.data?.dom?.presence || '').includes('Nearby:'), 'visual snapshot must show a Nearby presence label');
assert(Array.isArray(browserPresence.data?.tabs) && browserPresence.data.tabs.length === 2, 'browser presence must include two tabs');
assert(browserPresence.data?.tabs?.every((tab) => String(tab.presence || '').includes('Nearby: 2 testers')), 'browser presence tabs must show Nearby: 2 testers');
assert(browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true, 'browser presence must prove observer-side movement');
assert(browserPresence.data?.hudAction?.state?.petId === 'momo', 'HUD action proof must include the Momo care loop');
assert(browserPresence.data?.hudAction?.state?.profileViewed === true, 'HUD action proof must include profile view');
assert(browserPresence.data?.hudAction?.state?.friendProof === true, 'HUD action proof must include local friend proof');
assert(browserPresence.data?.hudAction?.state?.statusMood === 'cozy', 'HUD action proof must include local status/mood proof');
assert(browserPresence.data?.hudAction?.state?.lastInspectedPetId === 'momo', 'HUD action proof must include pet inspection');
assert(browserPresence.data?.hudAction?.state?.charmListed === true, 'HUD action proof must include fixed market listing');
assert(browserPresence.data?.hudAction?.state?.tradeProof === true, 'HUD action proof must include direct trade proof');
assert(browserPresence.data?.hudAction?.state?.canaryRequested === true, 'HUD action proof must include Canary certificate request');

const screenshotEvidence = {
  page: inspectPng(visualSnapshot.data?.screenshots?.page),
  canvas: inspectPng(visualSnapshot.data?.screenshots?.canvas)
};

for (const [label, item] of Object.entries(screenshotEvidence)) {
  assert(item.exists, `${label} screenshot must exist`);
  assert(item.bytes > 1000, `${label} screenshot must be non-empty`);
  assert(item.width >= 600 && item.height >= 400, `${label} screenshot must be large enough for first-screen review`);
  assert(item.sha256 === item.reportedSha256, `${label} screenshot hash must match visual snapshot report`);
}

const mapObjects = ['welcome-npc', 'token-chest', 'care-shrine', 'market-board', 'trade-post', 'canary-shrine'];
for (const id of mapObjects) {
  assert(mapServerSource.includes(`id: '${id}'`), `map server placement missing ${id}`);
}

for (const snippet of [
  "this.setGraphic('friend')",
  "this.setGraphic('chest')",
  "this.setGraphic('market-board')",
  "this.setGraphic('trade-post')",
  "this.setGraphic('canary-shrine')",
  "source: 'token-chest'",
  "source: 'market-board'",
  "source: 'trade-post'",
  "source: 'canary-shrine'"
]) {
  assert(mapEventSource.includes(snippet), `map event source missing snippet: ${snippet}`);
}
assert((alphaContentSource.match(/habitat:\s*'Lantern Garden'/g) || []).length === 3, 'three Mochi Spirits must share the Lantern Garden habitat');

const report = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret local visual review bundle for Alpha RC. Verifies screenshot, presence, HUD action, and static map-object evidence; keeps rendered prompt interaction as a manual gate.',
  git: readGitState(),
  baseUrl: visualSnapshot.data?.baseUrl || browserPresence.data?.baseUrl || null,
  evidence: {
    visualSnapshot: summarizeReport(visualSnapshot),
    browserPresence: summarizeReport(browserPresence),
    screenshots: screenshotEvidence,
    mapObjects,
    habitat: 'Lantern Garden'
  },
  machineReview: {
    firstScreenRenderable: failures.length === 0,
    hudReadable: Boolean(visualSnapshot.data?.dom?.hud),
    townCanvasRenderable: Boolean(visualSnapshot.data?.dom?.canvas),
    twoTabPresence: browserPresence.data?.tabs?.length === 2,
    observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true,
    hudActionLoop: {
      petCare: browserPresence.data?.hudAction?.state?.petId === 'momo',
      profileView: browserPresence.data?.hudAction?.state?.profileViewed === true,
      friendProof: browserPresence.data?.hudAction?.state?.friendProof === true,
      statusMood: browserPresence.data?.hudAction?.state?.statusMood === 'cozy',
      petInspect: browserPresence.data?.hudAction?.state?.lastInspectedPetId === 'momo',
      fixedMarket: browserPresence.data?.hudAction?.state?.charmListed === true,
      directTrade: browserPresence.data?.hudAction?.state?.tradeProof === true,
      canaryRequest: browserPresence.data?.hudAction?.state?.canaryRequested === true
    }
  },
  manualPromptGate: {
    requiredBeforeAlphaRcReady: true,
    status: 'pending-human-review',
    reason: 'Automated screenshots and DOM/HUD evidence do not replace the final rendered NPC/chest/habitat prompt review inside the canvas.',
    requiredChecks: [
      'Open the local playable game in a browser.',
      'Focus the game canvas, stand adjacent to the map object, and hold Space/Action for about 200ms.',
      'Interact with the welcome NPC and confirm the rendered prompt/dialog is coherent.',
      'Interact with the token chest and confirm the rendered prompt/save feedback is coherent.',
      'Interact with the habitat/care loop and confirm the rendered prompt/status feedback is coherent.',
      'Run npm run alpha:manual-prompt-review with the explicit prompt confirmation env vars set.',
      'Record browser, date, URL, report hashes, and any issues in the PR or release checklist.'
    ]
  },
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(report), 'utf8');

if (!report.ok) {
  console.error('Mochi Social local visual review bundle failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social local visual review bundle passed. Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

function readJson(file) {
  if (!existsSync(file)) return { ok: false, pathForReport: pathForReport(file), message: 'missing report' };
  try {
    return { ok: true, pathForReport: pathForReport(file), data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, pathForReport: pathForReport(file), message: 'parse failed' };
  }
}

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`${pathForReport(file)} is missing`);
    return '';
  }
  return readFileSync(file, 'utf8');
}

function assertReport(label, report) {
  if (!report.ok) {
    failures.push(`${label} report unavailable: ${report.message}`);
    return;
  }
  if (report.data?.ok !== true) failures.push(`${label} report is not ok`);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function inspectPng(entry) {
  const absolutePath = resolve(root, entry?.path || '');
  const exists = existsSync(absolutePath);
  const result = {
    path: entry?.path ? pathForReport(absolutePath) : null,
    exists,
    bytes: 0,
    width: 0,
    height: 0,
    sha256: null,
    reportedSha256: entry?.sha256 || null
  };
  if (!exists) return result;

  const buffer = readFileSync(absolutePath);
  const png = pngDimensions(buffer);
  result.bytes = buffer.length;
  result.width = png.width;
  result.height = png.height;
  result.sha256 = createHash('sha256').update(buffer).digest('hex');
  return result;
}

function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature) return { width: 0, height: 0 };
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function summarizeReport(report) {
  return {
    path: report.pathForReport,
    ok: report.data?.ok === true,
    checkedAt: report.data?.checkedAt,
    baseUrl: report.data?.baseUrl
  };
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
    .slice(0, 1000);
}

function renderMarkdown(summary) {
  const failureText = summary.failures.length
    ? summary.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None';
  const manualChecks = summary.manualPromptGate.requiredChecks.map((item) => `- ${item}`).join('\n');

  return `# Mochi Social Local Visual Review

Generated: ${summary.checkedAt}

This file is intentionally no-secret and local-only. It ties together first-screen PNG evidence, two-tab browser presence, HUD action proof, and static map-object coverage.

## Evidence

- Base URL: ${summary.baseUrl || 'not recorded'}
- Page PNG: ${summary.evidence.screenshots.page.path || 'missing'} (${summary.evidence.screenshots.page.width}x${summary.evidence.screenshots.page.height})
- Canvas PNG: ${summary.evidence.screenshots.canvas.path || 'missing'} (${summary.evidence.screenshots.canvas.width}x${summary.evidence.screenshots.canvas.height})
- Two-tab presence: ${summary.machineReview.twoTabPresence ? 'yes' : 'no'}
- Observer movement: ${summary.machineReview.observerMovement ? 'yes' : 'no'}
- HUD action loop: pet care ${summary.machineReview.hudActionLoop.petCare ? 'yes' : 'no'}, profile view ${summary.machineReview.hudActionLoop.profileView ? 'yes' : 'no'}, friend proof ${summary.machineReview.hudActionLoop.friendProof ? 'yes' : 'no'}, status mood ${summary.machineReview.hudActionLoop.statusMood ? 'yes' : 'no'}, pet inspect ${summary.machineReview.hudActionLoop.petInspect ? 'yes' : 'no'}, fixed market ${summary.machineReview.hudActionLoop.fixedMarket ? 'yes' : 'no'}, direct trade ${summary.machineReview.hudActionLoop.directTrade ? 'yes' : 'no'}, Canary request ${summary.machineReview.hudActionLoop.canaryRequest ? 'yes' : 'no'}
- Map objects: ${summary.evidence.mapObjects.join(', ')}
- Habitat: ${summary.evidence.habitat}

## Manual Prompt Gate

Status: ${summary.manualPromptGate.status}

${summary.manualPromptGate.reason}

${manualChecks}

## Failures

${failureText}
`;
}
