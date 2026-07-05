import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const scriptPath = resolve(root, 'scripts/check-alpha-local-evidence.mjs');
const tempRoots = [];
const selfTestScope = 'Temporary ignored local reports only; no provider mutations.';

const failureCases = [
  {
    name: 'missing-unity-required-report',
    mutate(workRoot) {
      unlinkSync(join(workRoot, 'reports/alpha-unity-required-smoke.json'));
    },
    expected: 'Unity-required smoke report unavailable'
  },
  {
    name: 'legacy-fallback-active',
    mutate(workRoot) {
      const report = readReport(workRoot, 'alpha-unity-required-smoke.json');
      report.health.legacyFallback.active = true;
      writeReport(workRoot, 'alpha-unity-required-smoke.json', report);
    },
    expected: 'Unity-required smoke health must report legacy fallback inactive'
  },
  {
    name: 'missing-load-smoke-proof',
    mutate(workRoot) {
      const report = readReport(workRoot, 'alpha-unity-required-smoke.json');
      report.checks = report.checks.filter((check) => check.id !== 'twenty-five-tester-load-smoke');
      writeReport(workRoot, 'alpha-unity-required-smoke.json', report);
    },
    expected: 'Unity-required smoke must run npm smoke and the 25-tester load smoke successfully'
  },
  {
    name: 'stale-unity-required-head',
    mutate(workRoot) {
      const report = readReport(workRoot, 'alpha-unity-required-smoke.json');
      report.git.localHead = '0000000000000000000000000000000000000000';
      writeReport(workRoot, 'alpha-unity-required-smoke.json', report);
    },
    expected: 'Unity-required smoke report localHead must match current HEAD'
  }
];

try {
  const passingFixture = createFixture('passing');
  const passing = runLocalEvidence(passingFixture.workRoot, 'passing');
  assert(passing.status === 0, `passing fixture failed: ${passing.stderr || passing.stdout}`);

  for (const failureCase of failureCases) {
    const fixture = createFixture(failureCase.name);
    failureCase.mutate(fixture.workRoot);
    const result = runLocalEvidence(fixture.workRoot, failureCase.name);
    const output = `${result.stdout}\n${result.stderr}`;
    assert(result.status !== 0, `${failureCase.name} unexpectedly passed.`);
    assert(output.includes(failureCase.expected), `${failureCase.name} did not report expected failure: ${failureCase.expected}`);
  }

  console.log('Mochi Social local evidence self-test OK.');
} finally {
  for (const tempRoot of tempRoots) {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function createFixture(name) {
  const tempRoot = mkdtempSync(join(tmpdir(), `mochi-social-local-evidence-${name}-`));
  tempRoots.push(tempRoot);
  const workRoot = join(tempRoot, 'work');
  const remoteRoot = join(tempRoot, 'remote.git');
  mkdirSync(workRoot, { recursive: true });

  runGit(workRoot, ['init', '--initial-branch=main']);
  runGit(workRoot, ['config', 'user.email', 'local-evidence-self-test@example.invalid']);
  runGit(workRoot, ['config', 'user.name', 'Mochi Social Local Evidence Self Test']);
  writeFileSync(join(workRoot, '.gitignore'), 'reports/\n', 'utf8');
  writeFileSync(join(workRoot, 'README.md'), `local evidence fixture\n${selfTestScope}\n`, 'utf8');
  runGit(workRoot, ['add', '.gitignore', 'README.md']);
  runGit(workRoot, ['commit', '-m', 'local evidence fixture']);
  runGit(tempRoot, ['init', '--bare', remoteRoot]);
  runGit(workRoot, ['remote', 'add', 'origin', remoteRoot]);
  runGit(workRoot, ['push', '-u', 'origin', 'main']);

  writeReports(workRoot, readGitState(workRoot));
  return { tempRoot, workRoot };
}

function writeReports(workRoot, git) {
  const baseUrl = 'http://localhost:43210';
  const checkedAt = {
    browser: '2026-01-01T00:00:00.000Z',
    responsive: '2026-01-01T00:01:00.000Z',
    snapshot: '2026-01-01T00:02:00.000Z',
    review: '2026-01-01T00:03:00.000Z'
  };

  writeReport(workRoot, 'alpha-local-suite.json', {
    ok: true,
    checkedAt: '2026-01-01T00:04:00.000Z',
    baseUrl,
    git,
    server: { stopped: true },
    commands: [
      { name: 'build', status: 0 },
      { name: 'alpha:wallet-daemon-check', status: 0 },
      { name: 'smoke', status: 0 },
      { name: 'alpha:local-acceptance', status: 0 },
      { name: 'alpha:load-smoke', status: 0 },
      { name: 'alpha:browser-presence', status: 0 },
      { name: 'alpha:responsive-gameplay', status: 0 },
      { name: 'alpha:visual-snapshot', status: 0 },
      { name: 'alpha:visual-review', status: 0 },
      { name: 'alpha:enjin-operator-smoke', status: 0 }
    ]
  });

  writeReport(workRoot, 'built-server-smoke.json', {
    ok: true,
    checkedAt: '2026-01-01T00:04:30.000Z',
    baseUrl,
    git,
    server: { stopped: true },
    checks: [
      { name: 'healthz', body: { legacyFallback: { active: false } } },
      { name: 'manifest', body: { legacyFallback: { active: false } } }
    ]
  });

  writeReport(workRoot, 'alpha-unity-required-smoke.json', {
    ok: true,
    checkedAt: '2026-01-01T00:05:00.000Z',
    scope: 'Local-only Unity-required smoke for the deployable built server.',
    baseUrl,
    git,
    checks: [
      { id: 'unity-required-smoke', status: 0 },
      { id: 'twenty-five-tester-load-smoke', status: 0 }
    ],
    health: {
      activeRuntime: 'unity-webgl',
      unityWebglBuild: { present: true, required: true, source: 'unity/Builds/WebGL' },
      legacyFallback: { available: true, active: false }
    },
    server: { stopped: true }
  });

  writeReport(workRoot, 'alpha-local-acceptance.json', {
    ok: true,
    checkedAt: '2026-01-01T00:05:30.000Z',
    baseUrl,
    actions: [
      { type: 'unity.room.joined' },
      { type: 'unity.character.created' },
      { type: 'unity.character.updated' },
      { type: 'unity.pet.interaction' },
      { type: 'unity.pet.state_saved' },
      { type: 'unity.room.left' }
    ]
  });

  writeReport(workRoot, 'alpha-load-smoke.json', {
    ok: true,
    checkedAt: '2026-01-01T00:06:00.000Z',
    baseUrl,
    playerCount: 25,
    actions: Array.from({ length: 25 }, (_, index) => ({
      type: index % 2 === 0 ? 'unity.pet.interaction' : 'unity.room.joined',
      playerId: `tester-${index + 1}`
    }))
  });

  writeReport(workRoot, 'alpha-browser-presence.json', {
    ok: true,
    checkedAt: checkedAt.browser,
    baseUrl,
    localOnlyDefault: true,
    hostedAllowed: false,
    canvasMovement: {
      observer: {
        changedAfterFirstTabMove: true
      }
    }
  });

  writeReport(workRoot, 'alpha-responsive-gameplay.json', buildResponsiveReport(baseUrl, checkedAt.responsive));

  writeReport(workRoot, 'alpha-visual-snapshot.json', {
    ok: true,
    checkedAt: checkedAt.snapshot,
    baseUrl,
    localOnlyDefault: true,
    hostedAllowed: false,
    screenshots: {
      page: { bytes: 2048 },
      canvas: { bytes: 2048 }
    }
  });

  writeReport(workRoot, 'alpha-visual-review.json', {
    ok: true,
    checkedAt: checkedAt.review,
    baseUrl,
    git,
    machineReview: {
      observerMovement: true
    },
    manualPromptGate: {
      status: 'pending-human-review',
      requiredBeforeAlphaRcReady: true
    }
  });

  writeReport(workRoot, 'wallet-daemon-local.json', {
    ok: true,
    checkedAt: '2026-01-01T00:07:00.000Z',
    git,
    scope: 'No-cost local Wallet Daemon binary check.',
    status: 'not-configured'
  });

  writeReport(workRoot, 'enjin-operator-smoke.json', {
    ok: true,
    checkedAt: '2026-01-01T00:08:00.000Z',
    baseUrl,
    scope: 'Local smoke that does not submit live Enjin operations by default.',
    checks: [
      { name: 'private Enjin route inactive', status: 'absent' }
    ]
  });
}

function buildResponsiveReport(baseUrl, checkedAt) {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
    { width: 900, height: 700 },
    { width: 768, height: 1024 },
    { width: 640, height: 900 },
    { width: 430, height: 932 },
    { width: 390, height: 844 }
  ];
  const routes = ['/play', '/embed'];
  const gameplayKeys = ['ArrowDown', 'Space'];
  const interactionKeys = ['Space', 'Enter'];
  const legacyInteractionKeys = ['Spacebar'];
  const unhandledKeys = ['Tab'];

  return {
    ok: true,
    checkedAt,
    baseUrl,
    localOnlyDefault: true,
    hostedAllowed: false,
    viewports,
    routes,
    movementKeys: ['ArrowDown', 'd'],
    interactionKeys,
    legacyInteractionKeys,
    gameplayKeys,
    unhandledKeys,
    site: {
      configured: false,
      required: false,
      status: 'skipped',
      entryPath: ''
    },
    results: viewports.flatMap((viewport) => routes.map((route) => ({
      route,
      viewport,
      screenshot: { bytes: 2048 },
      focus: { tabKeydown: { defaultPrevented: false } },
      inputScroll: makeOwnership({ gameplayKeys, legacyInteractionKeys, unhandledKeys, includeParent: false })
    }))),
    iframeResults: viewports.map((viewport) => ({
      viewport,
      screenshot: { bytes: 2048 },
      inputOwnership: makeOwnership({ gameplayKeys, legacyInteractionKeys, unhandledKeys, includeParent: true })
    })),
    siteIframeResults: []
  };
}

function makeOwnership({ gameplayKeys, legacyInteractionKeys, unhandledKeys, includeParent }) {
  return {
    gameplay: {
      focus: { editableActive: false },
      checks: gameplayKeys.map((key) => ({
        key,
        keydown: { defaultPrevented: true, editableTarget: false, editableActive: false },
        before: scrollSnapshot(),
        after: scrollSnapshot(),
        ...(includeParent ? { parentBefore: scrollSnapshot(), parentAfter: scrollSnapshot() } : {})
      }))
    },
    legacyInteraction: {
      checks: legacyInteractionKeys.map((key) => ({
        key,
        synthetic: { defaultPrevented: true },
        before: scrollSnapshot(),
        after: scrollSnapshot(),
        ...(includeParent ? { parentBefore: scrollSnapshot(), parentAfter: scrollSnapshot() } : {})
      }))
    },
    unhandled: {
      checks: unhandledKeys.map((key) => ({
        key,
        keydown: { defaultPrevented: false }
      }))
    },
    editable: {
      preventedKeyCount: 0,
      containsMovementLetters: true,
      containsSpace: true
    }
  };
}

function scrollSnapshot() {
  return { top: 0, left: 0, x: 0, y: 0 };
}

function runLocalEvidence(workRoot, name) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: workRoot,
    encoding: 'utf8',
    shell: false,
    env: {
      ...process.env,
      MOCHI_SOCIAL_LOCAL_EVIDENCE_JSON: join(workRoot, `reports/alpha-local-evidence-${name}.json`),
      MOCHI_SOCIAL_LOCAL_EVIDENCE_MD: join(workRoot, `reports/alpha-local-evidence-${name}.md`)
    }
  });
}

function readReport(workRoot, filename) {
  return JSON.parse(readFileSync(join(workRoot, 'reports', filename), 'utf8'));
}

function writeReport(workRoot, filename, value) {
  const reportsDir = join(workRoot, 'reports');
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(join(reportsDir, filename), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readGitState(workRoot) {
  return {
    branch: firstLine(runGit(workRoot, ['rev-parse', '--abbrev-ref', 'HEAD']).stdout),
    localHead: firstLine(runGit(workRoot, ['rev-parse', 'HEAD']).stdout),
    upstream: firstLine(runGit(workRoot, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']).stdout),
    dirty: runGit(workRoot, ['status', '--porcelain']).stdout.split(/\r?\n/).filter(Boolean),
    errors: []
  };
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    shell: false
  });
  assert(result.status === 0, `git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  return result;
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
