import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), 'mochi-social-sync-approval-'));
const reportPath = join(tempDir, 'alpha-sync-approval.json');
const markdownPath = join(tempDir, 'mochi-social-alpha-sync-approval.md');
const prFixturePath = join(tempDir, 'pr-state.json');
const previewEnvPath = join(tempDir, 'mochi-social-alpha-vercel-preview.local.txt');
const fakeToken = ['ghp', 'selftesttoken12345678901234567890'].join('_');

try {
  writePrFixture();
  writePreviewEnvFixture();
  const result = spawnSync(process.execPath, ['scripts/write-alpha-sync-approval.mjs'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      MOCHI_SOCIAL_CREDS_DIR: tempDir,
      MOCHI_SOCIAL_SYNC_APPROVAL: markdownPath,
      MOCHI_SOCIAL_SYNC_APPROVAL_JSON: reportPath,
      MOCHI_SOCIAL_SYNC_APPROVAL_PR_STATE_FILE: prFixturePath,
    },
  });

  assert(result.status === 0, `sync approval self-test command failed: ${result.stderr || result.stdout}`);
  assert(existsSync(reportPath), 'sync approval JSON report was not written.');
  assert(existsSync(markdownPath), 'sync approval markdown packet was not written.');

  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const markdown = readFileSync(markdownPath, 'utf8');
  assert(report.prState?.game?.headRefOid === '1111111111111111111111111111111111111111', 'game PR fake head was not recorded.');
  assert(report.prState?.site?.headRefOid === '2222222222222222222222222222222222222222', 'site PR fake head was not recorded.');
  assert(report.prState?.game?.localHeadMatchesPrHead === false, 'game PR should show local head does not match fake PR head.');
  assert(report.prState?.site?.localHeadMatchesPrHead === false, 'site PR should show local head does not match fake PR head.');
  assert(report.previewEnv?.present === true, 'preview URL fixture should be recorded as present.');
  assert(report.previewEnv?.sitePreviewUrl === 'https://preview.example.test', 'preview site URL fixture was not extracted.');
  assert(report.previewEnv?.gameUrl === 'https://mochi-social-game.fly.dev', 'preview game URL fixture was not extracted.');
  assert(markdown.includes('## PR State'), 'markdown packet should include PR State section.');
  assert(markdown.includes('## Local Preview URL File'), 'markdown packet should include local preview URL source section.');
  assert(markdown.includes('https://preview.example.test'), 'markdown packet should include sanitized preview URL.');
  assert(markdown.includes('local HEAD does not match PR head'), 'markdown packet should explain PR head drift.');

  for (const output of [JSON.stringify(report), markdown, result.stdout, result.stderr]) {
    assert(!String(output || '').includes(fakeToken), 'sync approval self-test leaked a fake GitHub token.');
  }

  console.log('Mochi Social sync approval self-test OK.');
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

function writePreviewEnvFixture() {
  writeFileSync(previewEnvPath, [
    'MOCHI_SOCIAL_GAME_URL=https://mochi-social-game.fly.dev',
    'MOCHI_SOCIAL_SITE_PREVIEW_URL=https://preview.example.test',
    `IGNORED_FAKE_TOKEN=${fakeToken}`,
    ''
  ].join('\n'), 'utf8');
}

function writePrFixture() {
  writeFileSync(prFixturePath, `${JSON.stringify({
    'xartaiusx/mochi-social#1': {
      url: 'https://github.com/xartaiusx/mochi-social/pull/1',
      headRefOid: '1111111111111111111111111111111111111111',
      mergeStateStatus: 'CLEAN',
      isDraft: true,
      title: `fake ${fakeToken} game`,
      statusCheckRollup: [
        { name: `Verify ${fakeToken} Mochi Social`, conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    },
    'Mochirii-Wushu/Mochirii#258': {
      url: 'https://github.com/Mochirii-Wushu/Mochirii/pull/258',
      headRefOid: '2222222222222222222222222222222222222222',
      mergeStateStatus: 'CLEAN',
      isDraft: true,
      title: 'fake site',
      statusCheckRollup: [
        { name: 'Vercel', conclusion: 'SUCCESS', status: 'COMPLETED' },
      ],
    },
  }, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
