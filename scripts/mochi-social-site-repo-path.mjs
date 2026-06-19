import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function resolveMochiSocialSiteRepoPath(root, env = process.env) {
  const configured = String(env.MOCHI_SOCIAL_SITE_REPO_PATH || '').trim();
  if (configured) return resolve(root, configured);

  const candidates = [
    resolve(root, '../Mochirii-mochi-social-alpha'),
    resolve(root, '../Mochirii')
  ];

  return candidates.find((candidate) => existsSync(candidate)) || candidates[0];
}
