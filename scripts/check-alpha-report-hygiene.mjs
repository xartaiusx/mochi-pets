import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
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
  'reports/alpha-local-evidence.json',
  'reports/alpha-local-evidence.md',
  'reports/alpha-sync-approval.json',
  'reports/enjin-operator-smoke.json',
  resolve(credsDir, 'mochi-social-alpha-operator-next-steps.md'),
  resolve(credsDir, 'mochi-social-alpha-sync-approval.md')
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

for (const file of files) {
  const absolutePath = resolve(root, file);
  if (!existsSync(absolutePath)) {
    failures.push(`${pathForReport(absolutePath)}: expected no-secret artifact is missing.`);
    continue;
  }
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
    scope: 'No-secret hygiene scan for ignored local Alpha RC reports and generated operator/sync approval checklists.',
    scanned,
    failures
  }, null, 2)}\n`, 'utf8');
}
