import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_REPORT_HYGIENE_JSON || 'reports/alpha-report-hygiene.json');
const files = [
  'reports/alpha-local-suite.json',
  'reports/built-server-smoke.json',
  'reports/alpha-local-acceptance.json',
  'reports/alpha-load-smoke.json',
  'reports/alpha-browser-presence.json',
  'reports/alpha-visual-snapshot.json',
  'reports/alpha-visual-review.json',
  'reports/alpha-visual-review.md',
  'reports/alpha-manual-prompt-review.json',
  'reports/alpha-manual-prompt-review.md',
  'reports/wallet-daemon-local.json',
  'reports/wallet-daemon-local.md',
  'reports/alpha-local-evidence.json',
  'reports/alpha-local-evidence.md',
  'reports/alpha-operator-checklist.json',
  'reports/alpha-provider-preflight.json',
  'reports/alpha-sync-approval.json',
  'reports/alpha-external-gates.json',
  'reports/enjin-operator-smoke.json',
  resolve(credsDir, 'mochi-social-alpha-operator-next-steps.md'),
  resolve(credsDir, 'mochi-social-alpha-external-gates-status.md'),
  resolve(credsDir, 'mochi-social-alpha-provider-preflight.md'),
  resolve(credsDir, 'mochi-social-alpha-sync-approval.md')
];

const optionalFiles = [
  'reports/alpha-preview-ready.json',
  'reports/alpha-preview-ready.md',
  resolve(credsDir, 'mochi-social-alpha-preview-ready.md'),
  resolve(credsDir, 'mochirii-mochi-social-preview-ready.md')
];

const secretPatterns = [
  { label: 'GitHub token', pattern: /\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/ },
  { label: 'OpenAI key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'Supabase secret key', pattern: /\bsb_secret_[A-Za-z0-9_-]{20,}\b/ },
  { label: 'JWT-like token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { label: 'Private key block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/ },
  { label: 'Discord bot token', pattern: /\b(?:mfa\.[A-Za-z0-9_-]{20,}|[A-Za-z0-9_-]{24}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,})\b/ },
  { label: 'Wallet daemon password assignment', pattern: /\bKEY_PASS\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Enjin token assignment', pattern: /\bENJIN_PLATFORM_TOKEN\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Supabase service role assignment', pattern: /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Unredacted local suite token', pattern: /\blocal-suite-token-[a-z0-9]+\b/i },
  { label: 'Wallet seed filename with contents marker', pattern: /\bwallet\.seed\s*[:=]\s*["']?(?!<|private|redacted|placeholder)[^\s"']+/i }
];

const failures = [];
const scanned = [];
const gitState = readGitState();

for (const file of files) {
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath)) {
    failures.push(`${pathForReport(absolutePath)}: expected no-secret artifact is missing.`);
    continue;
  }
  scanFile(absolutePath);
}

for (const file of optionalFiles) {
  const absolutePath = resolve(root, file);
  if (existsSync(absolutePath)) scanFile(absolutePath);
}

function scanFile(absolutePath) {
  const text = readFileSync(absolutePath, 'utf8');
  scanned.push(pathForReport(absolutePath));
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(text)) {
      failures.push(`${pathForReport(absolutePath)}: possible ${label} found.`);
    }
  }
}

if (failures.length) {
  await writeReport(false);
  console.error('Mochi Social local report hygiene failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

await writeReport(true);
console.log(`Mochi Social local report hygiene OK (${scanned.length} no-secret artifact(s) scanned).`);
console.log(`Report: ${reportPath}`);

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
}

async function writeReport(ok) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify({
    ok,
    checkedAt: new Date().toISOString(),
    scope: 'No-secret hygiene scan for ignored local Alpha RC reports and generated operator, external-gate, and sync approval checklists.',
    git: gitState,
    scanned,
    failures
  }, null, 2)}\n`, 'utf8');
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
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => result.stderr || result.error || 'git command failed')
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
