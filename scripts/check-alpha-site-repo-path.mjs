import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';
import {
  resolveMochiriiCredsDir,
  resolveMochiriiWorkspaceRoot
} from './mochirii-workspace-paths.mjs';

const tempRoot = mkdtempSync(join(tmpdir(), 'mochi-social-site-path-'));

try {
  const workspaceRoot = join(tempRoot, "Github Repo's", 'Mochirii Website');
  const canonicalRoot = join(workspaceRoot, 'Mochi Pets');
  const canonicalSite = join(workspaceRoot, 'Website');
  const canonicalCreds = join(workspaceRoot, 'Mochi Creds');
  mkdirSync(canonicalRoot, { recursive: true });
  mkdirSync(canonicalSite, { recursive: true });
  mkdirSync(canonicalCreds, { recursive: true });

  assert.equal(resolveMochiriiWorkspaceRoot(canonicalRoot, {}), workspaceRoot);
  assert.equal(resolveMochiSocialSiteRepoPath(canonicalRoot, {}), canonicalSite);
  assert.equal(resolveMochiriiCredsDir(canonicalRoot, {}), canonicalCreds);

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

  assert.equal(
    resolveMochiriiWorkspaceRoot(fallbackRoot, { MOCHIRII_WORKSPACE_ROOT: '../custom-workspace' }),
    resolve(fallbackRoot, '../custom-workspace')
  );

  assert.equal(
    resolveMochiriiCredsDir(fallbackRoot, {
      MOCHIRII_CREDS_DIR: '../canonical-creds',
      MOCHI_SOCIAL_CREDS_DIR: '../legacy-creds'
    }),
    resolve(fallbackRoot, '../canonical-creds')
  );

  assert.equal(
    resolveMochiriiCredsDir(fallbackRoot, { MOCHI_SOCIAL_CREDS_DIR: '../legacy-creds' }),
    resolve(fallbackRoot, '../legacy-creds')
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log('Mochi Pets workspace path resolver self-test OK.');
