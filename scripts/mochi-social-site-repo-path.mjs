import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveMochiriiWorkspaceRoot } from './mochirii-workspace-paths.mjs';

export function resolveMochiSocialSiteRepoPath(root, env = process.env) {
  const configured = String(env.MOCHI_PETS_SITE_REPO_PATH || env.MOCHI_SOCIAL_SITE_REPO_PATH || '').trim();
  if (configured) return resolve(root, configured);

  const workspaceRoot = resolveMochiriiWorkspaceRoot(root, env);
  const candidates = [
    join(workspaceRoot, 'Website'),
    resolve(root, '../Website'),
    resolve(root, '../Mochirii Website'),
    resolve(root, '../Mochirii-mochi-social-alpha'),
    resolve(root, '../Mochirii')
  ];

  return candidates.find((candidate) => existsSync(candidate)) || candidates[0];
}
