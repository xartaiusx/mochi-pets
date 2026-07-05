import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';

const tempRoot = mkdtempSync(join(tmpdir(), 'mochi-social-site-path-'));

try {
  const alphaRoot = join(tempRoot, 'with-alpha', 'Local RPG');
  mkdirSync(resolve(alphaRoot, '../Mochirii-mochi-social-alpha'), { recursive: true });
  mkdirSync(resolve(alphaRoot, '../Mochirii'), { recursive: true });

  assert.equal(
    resolveMochiSocialSiteRepoPath(alphaRoot, {}),
    resolve(alphaRoot, '../Mochirii-mochi-social-alpha')
  );

  const fallbackRoot = join(tempRoot, 'fallback-only', 'Local RPG');
  mkdirSync(resolve(fallbackRoot, '../Mochirii'), { recursive: true });

  assert.equal(
    resolveMochiSocialSiteRepoPath(fallbackRoot, {}),
    resolve(fallbackRoot, '../Mochirii')
  );

  assert.equal(
    resolveMochiSocialSiteRepoPath(fallbackRoot, { MOCHI_PETS_SITE_REPO_PATH: '../custom-site' }),
    resolve(fallbackRoot, '../custom-site')
  );

  assert.equal(
    resolveMochiSocialSiteRepoPath(fallbackRoot, { MOCHI_SOCIAL_SITE_REPO_PATH: '../legacy-site' }),
    resolve(fallbackRoot, '../legacy-site')
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log('Mochi Pets site repo path resolver self-test OK.');
