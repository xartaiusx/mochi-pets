import { join, resolve } from 'node:path';

function configuredPath(root, value) {
  const candidate = String(value || '').trim();
  return candidate ? resolve(root, candidate) : '';
}

export function resolveMochiriiWorkspaceRoot(repoRoot, env = process.env) {
  const configured = configuredPath(repoRoot, env.MOCHIRII_WORKSPACE_ROOT);
  if (configured) return configured;

  return resolve(repoRoot, '..');
}

export function resolveMochiriiCredsDir(repoRoot, env = process.env) {
  const configured = configuredPath(
    repoRoot,
    env.MOCHIRII_CREDS_DIR
  );
  if (configured) return configured;

  return join(resolveMochiriiWorkspaceRoot(repoRoot, env), 'Mochi Creds');
}
