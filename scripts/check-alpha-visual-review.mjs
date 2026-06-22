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

const failures = [];
const visualSnapshot = readJson(visualSnapshotPath);
const browserPresence = readJson(browserPresencePath);

assertReport('visual snapshot', visualSnapshot);
assertReport('browser presence', browserPresence);
assert(visualSnapshot.data?.localOnlyDefault === true && visualSnapshot.data?.hostedAllowed === false, 'visual snapshot must remain local-only by default');
assert(browserPresence.data?.localOnlyDefault === true && browserPresence.data?.hostedAllowed === false, 'browser presence must remain local-only by default');

const snapshotDom = visualSnapshot.data?.dom || {};
const snapshotManifest = visualSnapshot.data?.manifest || browserPresence.data?.runtime || {};
const pagePng = inspectPng(visualSnapshot.data?.screenshots?.page);
const canvasPng = inspectPng(visualSnapshot.data?.screenshots?.canvas);
const room = snapshotManifest.room || {};

assert(String(snapshotDom.title || '').includes('Mochi Social'), 'visual snapshot page title must identify Mochi Social');
assert(snapshotDom.runtime === 'unity-webgl', 'visual snapshot must identify the Unity WebGL runtime');
assert(snapshotDom.canvas === true, 'visual snapshot must show canvas DOM evidence');
assert(snapshotDom.keyGuard === true, 'visual snapshot must show Unity input guard evidence');
assert(snapshotDom.unityCanvasId === 'unity-canvas', 'visual snapshot must show the Unity canvas id');
assert(Array.isArray(snapshotDom.legacyHudSelectors) && snapshotDom.legacyHudSelectors.length === 0, 'visual snapshot must not expose legacy HUD selectors');
assert(snapshotDom.futureEconomyTextPresent === false, 'visual snapshot must not expose market, trade, cashout, or funded-chain text');
assert(snapshotManifest.engine === 'unity-webgl', 'visual snapshot manifest must expose Unity WebGL');
assert(snapshotManifest.activeRuntime === 'unity-webgl', 'visual snapshot manifest must report Unity WebGL as active');
assert(room.mode === 'single-shared-room', 'visual snapshot manifest must expose one shared room');
assert(room.capacity === 25, 'visual snapshot manifest must expose the 25-tester room capacity');
assert(room.sharedPetKey === 'lirabao', 'visual snapshot manifest must expose Lirabao as the shared pet');
assert(snapshotManifest.unityWebglBuild?.present === true, 'visual snapshot manifest must report the Unity WebGL build as present');
assert(snapshotManifest.legacyFallback?.active === false, 'visual snapshot manifest must not activate the legacy fallback');

assert(pagePng.exists && pagePng.bytes > 1000 && pagePng.width >= 600 && pagePng.height >= 400, 'visual snapshot page PNG must be non-empty');
assert(canvasPng.exists && canvasPng.bytes > 1000 && canvasPng.width >= 600 && canvasPng.height >= 400, 'visual snapshot canvas PNG must be non-empty');
assert(Array.isArray(browserPresence.data?.tabs) && browserPresence.data.tabs.length === 2, 'browser presence must include two tabs');
assert(browserPresence.data?.tabs?.every((tab) => String(tab.title || '').includes('Mochi Social')), 'browser presence tabs must identify Mochi Social');
assert(browserPresence.data?.tabs?.every((tab) => tab.canvas?.screenshotBytes > 1000), 'browser presence tabs must include non-empty Unity canvas screenshots');
assert(browserPresence.data?.bridge?.hasCreateUnityInstance === true, 'browser presence must detect the Unity loader bridge');
assert(browserPresence.data?.bridge?.hasUnityCanvas === true, 'browser presence must detect the Unity canvas');
assert(browserPresence.data?.legacyHudAbsent?.ok === true, 'browser presence must prove legacy HUD selectors are absent');
assert(browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true, 'browser presence must carry observer-side shared-room pulse proof');

const summary = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret local visual review bundle for the Unity shared-room alpha. Verifies screenshots, two-tab room evidence, Lirabao contract, input guard, and absence of legacy player UI.',
  git: readGitState(),
  baseUrl: visualSnapshot.data?.baseUrl || browserPresence.data?.baseUrl || null,
  evidence: {
    visualSnapshot: summarizeReport(visualSnapshot),
    browserPresence: summarizeReport(browserPresence),
    screenshots: {
      page: pagePng,
      canvas: canvasPng
    },
    sharedRoom: {
      key: room.key || null,
      name: room.name || null,
      scene: room.scene || null,
      mode: room.mode || null,
      capacity: room.capacity || null
    },
    sharedPet: {
      key: room.sharedPetKey || null,
      name: room.sharedPetKey === 'lirabao' ? 'Lirabao' : null
    },
    unityWebglBuild: snapshotManifest.unityWebglBuild || null,
    legacyFallback: snapshotManifest.legacyFallback || null
  },
  machineReview: {
    firstScreenRenderable: pagePng.exists && pagePng.bytes > 1000,
    unityCanvasRenderable: canvasPng.exists && canvasPng.bytes > 1000,
    twoTabPresence: Array.isArray(browserPresence.data?.tabs) && browserPresence.data.tabs.length === 2,
    observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true,
    legacyHudAbsent: browserPresence.data?.legacyHudAbsent?.ok === true && snapshotDom.legacyHudSelectors?.length === 0,
    inputGuardPresent: snapshotDom.keyGuard === true,
    noFutureEconomyCopy: snapshotDom.futureEconomyTextPresent === false
  },
  visualChecklist: {
    firstScreenReadability: {
      status: pagePng.exists ? 'machine-supported' : 'blocked',
      records: 'First screen has current page and canvas PNG evidence for human review.'
    },
    sharedRoomRecognition: {
      status: room.mode === 'single-shared-room' ? 'machine-supported' : 'blocked',
      records: 'Manifest and browser evidence point to one shared Jade Lantern room.'
    },
    lirabaoRecognition: {
      status: room.sharedPetKey === 'lirabao' ? 'machine-supported' : 'blocked',
      records: 'Manifest exposes Lirabao as the shared guild pet for this alpha.'
    },
    inputSafety: {
      status: snapshotDom.keyGuard ? 'machine-supported' : 'blocked',
      records: 'Unity input guard is present and responsive gameplay checks verify movement keys do not scroll the page.'
    },
    noRealValueClarity: {
      status: snapshotDom.futureEconomyTextPresent === false ? 'machine-supported' : 'blocked',
      records: 'First-screen Unity wrapper does not expose market, trade, cashout, or funded-chain wording.'
    },
    twoTabPresence: {
      status: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true ? 'machine-supported' : 'blocked',
      records: 'Two local browser tabs load the Unity room surface and carry observer-side shared-room pulse evidence.'
    }
  },
  manualPromptGate: {
    requiredBeforeAlphaRcReady: true,
    status: 'pending-human-review',
    reason: 'Automated screenshots do not replace a final hands-on review of character creation, Lirabao care prompts, and saved progress messaging.',
    requiredChecks: [
      'Open the local playable game in a browser.',
      'Confirm the shared guild room loads clearly and the character view is readable.',
      'Confirm Lirabao is visible or reachable from the first-room interaction flow.',
      'Confirm the care prompt and response text are clear, friendly, and no-real-value.',
      'Confirm reload/login flow preserves the tester character and shared Lirabao progress in the configured alpha environment.',
      'Record browser, date, URL, report hashes, and any visual issues in the release checklist.'
    ]
  },
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(summary), 'utf8');

if (!summary.ok) {
  console.error('Mochi Social local visual review bundle failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social local visual review bundle passed. Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

function readJson(absolutePath) {
  const pathForReportValue = pathForReport(absolutePath);
  if (!existsSync(absolutePath)) return { ok: false, pathForReport: pathForReportValue, message: 'missing report' };
  try {
    return { ok: true, pathForReport: pathForReportValue, data: JSON.parse(readFileSync(absolutePath, 'utf8')) };
  } catch {
    return { ok: false, pathForReport: pathForReportValue, message: 'parse failed' };
  }
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

This file is intentionally no-secret and local-only. It ties together first-screen PNG evidence, two-tab room evidence, the Lirabao room contract, input safety, and absence of legacy player UI.

## Evidence

- Base URL: ${summary.baseUrl || 'not recorded'}
- Page PNG: ${summary.evidence.screenshots.page.path || 'missing'} (${summary.evidence.screenshots.page.width}x${summary.evidence.screenshots.page.height})
- Canvas PNG: ${summary.evidence.screenshots.canvas.path || 'missing'} (${summary.evidence.screenshots.canvas.width}x${summary.evidence.screenshots.canvas.height})
- Shared room: ${summary.evidence.sharedRoom.name || 'not recorded'} (${summary.evidence.sharedRoom.mode || 'not recorded'})
- Shared pet: ${summary.evidence.sharedPet.name || 'not recorded'}
- Two local tabs: ${summary.machineReview.twoTabPresence ? 'yes' : 'no'}
- Observer shared-room pulse: ${summary.machineReview.observerMovement ? 'yes' : 'no'}
- Legacy player UI absent: ${summary.machineReview.legacyHudAbsent ? 'yes' : 'no'}
- No future economy copy: ${summary.machineReview.noFutureEconomyCopy ? 'yes' : 'no'}

## Visual Checklist

- First-screen readability: ${summary.visualChecklist.firstScreenReadability.status}
- Shared room recognition: ${summary.visualChecklist.sharedRoomRecognition.status}
- Lirabao recognition: ${summary.visualChecklist.lirabaoRecognition.status}
- Input safety: ${summary.visualChecklist.inputSafety.status}
- No-real-value clarity: ${summary.visualChecklist.noRealValueClarity.status}
- Two-tab room evidence: ${summary.visualChecklist.twoTabPresence.status}

## Manual Prompt Gate

Status: ${summary.manualPromptGate.status}

${summary.manualPromptGate.reason}

${manualChecks}

## Failures

${failureText}
`;
}
