import { existsSync, readFileSync } from 'node:fs';

const currentFiles = [
  'README.md',
  'docs/README.md',
  'docs/alpha-preview-ready.md',
  'docs/account-linked-progression.md',
  'docs/implementation-brief.md',
  'docs/site-integration.md',
  'docs/unity-bootstrap.md',
  'docs/workstation-readiness.md',
  'docs/asset-pipeline-contract.md',
  'docs/game-art-bible.md',
  'scripts/check-local-alpha-acceptance.mjs',
  'apps/game/scripts/smoke.mjs',
  'apps/game/src/integration/alpha-contract.ts',
  'apps/game/src/integration/manifest.ts',
  'apps/game/src/integration/protocol.ts'
];

const failures = [];

for (const file of currentFiles) {
  if (!existsSync(file)) {
    failures.push(`${file}: missing current rename-hygiene file.`);
    continue;
  }

  const text = readFileSync(file, 'utf8');
  if (!file.startsWith('apps/game/src/integration/')) {
    assertIncludes(file, text, 'Mochi Pets');
  }
  assertDoesNotMatch(file, text, /\bMochi Social\b/, 'current game-facing files must not call the game Mochi Social');
  assertDoesNotMatch(file, text, /\bname\s*[:=]=?\s*['"]Mochi Social['"]/, 'runtime identity must be Mochi Pets');
  assertDoesNotMatch(file, text, /\bslug\s*[:=]=?\s*['"]mochi-social['"]/, 'runtime slug must be mochi-pets');
  assertDoesNotMatch(file, text, /\bnamespace\s*[:=]=?\s*['"]MOCHI_SOCIAL['"]/, 'bridge namespace must be MOCHI_PETS');
  assertDoesNotMatch(file, text, /mochi-social-(?:unity-auth|alpha-action|alpha-progress|alpha-admin|feedback)/, 'Edge function slugs must use mochi-pets-*');
}

const aliasAllowedFiles = [
  'AGENTS.md',
  'docs/site-integration.md',
  'docs/account-linked-progression.md',
  'scripts/run-unity.mjs',
  'scripts/check-local-alpha-acceptance.mjs',
  'scripts/mochi-social-site-repo-path.mjs'
];

for (const file of aliasAllowedFiles) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (text.includes('MOCHI_SOCIAL') && !text.includes('MOCHI_PETS')) {
    failures.push(`${file}: legacy MOCHI_SOCIAL aliases must be paired with MOCHI_PETS primary names.`);
  }
}

const manifestText = readFileSync('apps/game/src/integration/manifest.ts', 'utf8');
assertIncludes('apps/game/src/integration/manifest.ts', manifestText, "websiteEntryPath: '/games/mochi-pets'");
assertIncludes('apps/game/src/integration/manifest.ts', manifestText, "namespace: 'MOCHI_PETS'");
assertDoesNotMatch('apps/game/src/integration/manifest.ts', manifestText, /\/games\/mochi-social/, 'website entry path must not point at the retired route');

if (failures.length) {
  console.error('Mochi Pets rename hygiene failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Pets rename hygiene passed.');

function assertIncludes(file, text, snippet) {
  if (!text.includes(snippet)) {
    failures.push(`${file}: missing ${snippet}`);
  }
}

function assertDoesNotMatch(file, text, pattern, reason) {
  if (pattern.test(text)) {
    failures.push(`${file}: ${reason}`);
  }
}
