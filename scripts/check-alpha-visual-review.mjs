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
const assetLedgerPath = resolve(root, 'docs/asset-ledger.md');

const failures = [];
const visualSnapshot = readJson(visualSnapshotPath);
const browserPresence = readJson(browserPresencePath);
const mapEventSource = readText(mapEventPath);
const mapServerSource = readText(mapServerPath);
const alphaContentSource = readText(alphaContentPath);
const assetLedgerSource = readText(assetLedgerPath);

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
assert(browserPresence.data?.hudAction?.state?.spiritId === 'jintari', 'HUD action proof must include the Jintari route-invited care loop');
assert(browserPresence.data?.hudAction?.state?.captureProof === true, 'HUD action proof must include the spirit invitation capture loop');
assert(browserPresence.data?.hudAction?.state?.journalProof === true, 'HUD action proof must include the spirit journal loop');
assert(browserPresence.data?.hudAction?.state?.journalDiscoveredCount >= 1, 'HUD action proof must include at least one discovered journal record');
assert(browserPresence.data?.hudAction?.state?.expeditionProof === true, 'HUD action proof must include the field expedition loop');
assert(browserPresence.data?.hudAction?.state?.lastExpeditionRouteId === 'moonbridge-bamboo-trail', 'HUD action proof must include the first field expedition route');
assert(browserPresence.data?.hudAction?.state?.routeInviteProof === true, 'HUD action proof must include the route spirit invitation loop');
assert(browserPresence.data?.hudAction?.state?.lastRouteInviteSpiritId === 'jintari', 'HUD action proof must include Jintari as the route-invited spirit');
assert(browserPresence.data?.hudAction?.state?.techniqueProof === true, 'HUD action proof must include the technique dojo loop');
assert(browserPresence.data?.hudAction?.state?.techniqueMasteryXp >= 1, 'HUD action proof must include technique mastery XP');
assert(browserPresence.data?.hudAction?.state?.affinityProof === true, 'HUD action proof must include the affinity trial loop');
assert(browserPresence.data?.hudAction?.state?.lastAffinityTrialId === 'silk-cinder-trial', 'HUD action proof must include the Silk Cinder affinity trial');
assert(browserPresence.data?.hudAction?.state?.partyIds?.includes?.('jintari'), 'HUD action proof must include Mochi Spirit party formation');
assert(browserPresence.data?.hudAction?.state?.sparLadderXp >= 1, 'HUD action proof must include spar ladder XP');
assert(browserPresence.data?.hudAction?.state?.lastSparOpponentId === 'jade-echo-apprentice', 'HUD action proof must include the first spar ladder opponent');
assert(browserPresence.data?.hudAction?.state?.profileViewed === true, 'HUD action proof must include profile view');
assert(browserPresence.data?.hudAction?.state?.guildBuddyProof === true, 'HUD action proof must include local guild buddy proof');
assert(browserPresence.data?.hudAction?.state?.statusMood === 'cozy', 'HUD action proof must include local status/mood proof');
assert(browserPresence.data?.hudAction?.state?.lastInspectedSpiritId === 'jintari', 'HUD action proof must include spirit inspection');
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

const mapObjects = ['welcome-npc', 'guild-seal-chest', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'affinity-dais', 'care-shrine', 'habitat-grove', 'training-ring', 'party-banner', 'quest-board', 'market-board', 'trade-post', 'canary-shrine'];
for (const id of mapObjects) {
  assert(mapServerSource.includes(`id: '${id}'`), `map server placement missing ${id}`);
}

for (const snippet of [
  "this.setGraphic('sifu-narao')",
  "this.setGraphic('chest')",
  "this.setGraphic('journal-pavilion')",
  "this.setGraphic('expedition-gate')",
  "this.setGraphic('route-invitation-altar')",
  "this.setGraphic('technique-dojo')",
  "this.setGraphic('affinity-dais')",
  "this.setGraphic('habitat-grove')",
  "this.setGraphic('party-banner')",
  "this.setGraphic('market-board')",
  "this.setGraphic('trade-post')",
  "this.setGraphic('training-ring')",
  "this.setGraphic('quest-board')",
  "this.setGraphic('canary-shrine')",
  "source: 'guild-seal-chest'",
  "source: 'journal-pavilion'",
  "source: 'expedition-gate'",
  "source: 'route-invitation-altar'",
  "source: 'technique-dojo'",
  "source: 'affinity-dais'",
  "source: 'habitat-grove'",
  "source: 'party-banner'",
  "source: 'training-ring'",
  "source: 'quest-board'",
  "source: 'market-board'",
  "source: 'trade-post'",
  "source: 'canary-shrine'"
]) {
  assert(mapEventSource.includes(snippet), `map event source missing snippet: ${snippet}`);
}
assert(alphaContentSource.includes("jadeLanternCourt: 'Jade Lantern Court'"), 'Jade Lantern Court habitat constant must be present');
assert(
  Array.from(
    alphaContentSource.matchAll(
      /id:\s*'(lirabao|jintari|aozhen)'[\s\S]*?habitat:\s*SPIRIT_HABITATS\.jadeLanternCourt/g
    )
  ).length === 3,
  'three Mochi Spirits must share the Jade Lantern Court habitat'
);

const expectedAssetLedgerEntries = [
  'mochi-tiles.png',
  'wayfarer.png',
  'sifu-narao.png',
  'chest.png',
  'spirit-lirabao.png',
  'spirit-jintari.png',
  'spirit-aozhen.png',
  'habitat-grove.png',
  'party-banner.png',
  'journal-pavilion.png',
  'expedition-gate.png',
  'route-invitation-altar.png',
  'technique-dojo.png',
  'affinity-dais.png',
  'market-board.png',
  'trade-post.png',
  'training-ring.png',
  'quest-board.png',
  'canary-shrine.png',
  'hd-source-export.md',
  'project-authored/generated-for-project'
];

for (const entry of expectedAssetLedgerEntries) {
  assert(assetLedgerSource.includes(entry), `asset ledger missing visual source entry: ${entry}`);
}

const visualChecklist = {
  firstScreenReadability: {
    status: failures.length === 0 ? 'machine-supported' : 'blocked',
    records: 'First screen has current page/canvas PNG evidence; human review must still confirm the town reads as polished within 3 seconds.'
  },
  interactableRecognition: {
    status: mapObjects.every((id) => mapServerSource.includes(`id: '${id}'`)) ? 'machine-supported' : 'blocked',
    records: 'Sifu Narao, guild seal chest, journal pavilion, expedition gate, route invitation altar, technique dojo, affinity dais, care shrine, habitat grove, training ring, party banner, quest board, market board, trade post, and Canary shrine are present in the stable map-object contract.'
  },
  hudContrast: {
    status: Boolean(visualSnapshot.data?.dom?.hud) ? 'machine-supported' : 'blocked',
    records: 'HUD DOM is present in the first-screen snapshot; human review checks text contrast over the rendered map.'
  },
  canaryNoRealValueClarity: {
    status: browserPresence.data?.hudAction?.state?.canaryRequested === true ? 'machine-supported' : 'blocked',
    records: 'Canary action remains a staged preview/no-real-value HUD flow; funded-chain gates stay out of this visual pass.'
  },
  twoTabPresence: {
    status: browserPresence.data?.tabs?.length === 2 ? 'machine-supported' : 'blocked',
    records: 'Two browser tabs report Nearby: 2 testers and observer-side movement.'
  },
  assetLedgerCoverage: {
    status: expectedAssetLedgerEntries.every((entry) => assetLedgerSource.includes(entry)) ? 'machine-supported' : 'blocked',
    records: 'Asset ledger covers runtime PNGs, source masters, HD export intent, and project-authored generation status.'
  }
};

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
    habitat: 'Jade Lantern Court'
  },
  machineReview: {
    firstScreenRenderable: failures.length === 0,
    hudReadable: Boolean(visualSnapshot.data?.dom?.hud),
    townCanvasRenderable: Boolean(visualSnapshot.data?.dom?.canvas),
    twoTabPresence: browserPresence.data?.tabs?.length === 2,
    observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true,
    hudActionLoop: {
      spiritCare: browserPresence.data?.hudAction?.state?.spiritId === 'jintari',
      spiritCapture: browserPresence.data?.hudAction?.state?.captureProof === true,
      spiritJournal: browserPresence.data?.hudAction?.state?.journalProof === true,
      fieldExpedition: browserPresence.data?.hudAction?.state?.expeditionProof === true,
      routeInvitation: browserPresence.data?.hudAction?.state?.routeInviteProof === true,
      techniqueMastery: browserPresence.data?.hudAction?.state?.techniqueProof === true,
      affinityTrial: browserPresence.data?.hudAction?.state?.affinityProof === true,
      partyFormation: browserPresence.data?.hudAction?.state?.partyIds?.includes?.('jintari') === true,
      sparLadder: browserPresence.data?.hudAction?.state?.sparLadderXp >= 1,
      profileView: browserPresence.data?.hudAction?.state?.profileViewed === true,
      guildBuddyProof: browserPresence.data?.hudAction?.state?.guildBuddyProof === true,
      statusMood: browserPresence.data?.hudAction?.state?.statusMood === 'cozy',
      spiritInspect: browserPresence.data?.hudAction?.state?.lastInspectedSpiritId === 'jintari',
      fixedMarket: browserPresence.data?.hudAction?.state?.charmListed === true,
      directTrade: browserPresence.data?.hudAction?.state?.tradeProof === true,
      canaryRequest: browserPresence.data?.hudAction?.state?.canaryRequested === true
    }
  },
  visualChecklist,
  manualPromptGate: {
    requiredBeforeAlphaRcReady: true,
    status: 'pending-human-review',
    reason: 'Automated screenshots and DOM/HUD evidence do not replace the final rendered NPC/chest/habitat prompt review inside the canvas.',
    requiredChecks: [
      'Open the local playable game in a browser.',
      'Focus the game canvas, stand adjacent to the map object, and hold Space/Action for about 200ms.',
      'Interact with the welcome NPC and confirm the rendered prompt/dialog is coherent.',
      'Interact with the guild seal chest and confirm the rendered prompt/save feedback is coherent.',
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
- HUD action loop: spirit capture ${summary.machineReview.hudActionLoop.spiritCapture ? 'yes' : 'no'}, spirit care ${summary.machineReview.hudActionLoop.spiritCare ? 'yes' : 'no'}, spirit journal ${summary.machineReview.hudActionLoop.spiritJournal ? 'yes' : 'no'}, field expedition ${summary.machineReview.hudActionLoop.fieldExpedition ? 'yes' : 'no'}, route invitation ${summary.machineReview.hudActionLoop.routeInvitation ? 'yes' : 'no'}, technique mastery ${summary.machineReview.hudActionLoop.techniqueMastery ? 'yes' : 'no'}, affinity trial ${summary.machineReview.hudActionLoop.affinityTrial ? 'yes' : 'no'}, party formation ${summary.machineReview.hudActionLoop.partyFormation ? 'yes' : 'no'}, spar ladder ${summary.machineReview.hudActionLoop.sparLadder ? 'yes' : 'no'}, profile view ${summary.machineReview.hudActionLoop.profileView ? 'yes' : 'no'}, guild buddy proof ${summary.machineReview.hudActionLoop.guildBuddyProof ? 'yes' : 'no'}, status mood ${summary.machineReview.hudActionLoop.statusMood ? 'yes' : 'no'}, spirit inspect ${summary.machineReview.hudActionLoop.spiritInspect ? 'yes' : 'no'}, fixed market ${summary.machineReview.hudActionLoop.fixedMarket ? 'yes' : 'no'}, direct trade ${summary.machineReview.hudActionLoop.directTrade ? 'yes' : 'no'}, Canary request ${summary.machineReview.hudActionLoop.canaryRequest ? 'yes' : 'no'}
- Map objects: ${summary.evidence.mapObjects.join(', ')}
- Habitat: ${summary.evidence.habitat}

## Visual Checklist

- First-screen readability: ${summary.visualChecklist.firstScreenReadability.status}
- Interactable recognition: ${summary.visualChecklist.interactableRecognition.status}
- HUD contrast: ${summary.visualChecklist.hudContrast.status}
- Canary no-real-value clarity: ${summary.visualChecklist.canaryNoRealValueClarity.status}
- Two-tab presence: ${summary.visualChecklist.twoTabPresence.status}
- Asset ledger coverage: ${summary.visualChecklist.assetLedgerCoverage.status}

## Manual Prompt Gate

Status: ${summary.manualPromptGate.status}

${summary.manualPromptGate.reason}

${manualChecks}

## Failures

${failureText}
`;
}
