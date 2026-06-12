import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

const ignoredFilePatterns = [
  /(^|\/)package-lock\.json$/,
  /(^|\/)LICENSE$/,
  /\.(png|jpg|jpeg|webp|gif|ico|mp3|wav|ogg)$/i
];

const forbiddenTrackedFilePatterns = [
  /(^|\/)\.env(\.|$)/,
  /(^|\/)wallet\.seed$/i,
  /(^|\/).*seed\.txt$/i,
  /(^|\/).*mnemonic.*\.(txt|md|json)$/i
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
  { label: 'Supabase service role assignment', pattern: /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i }
];

const failures = [];

for (const file of trackedFiles) {
  const normalized = file.replace(/\\/g, '/');
  for (const pattern of forbiddenTrackedFilePatterns) {
    if (pattern.test(normalized)) {
      failures.push(`${file}: secret-like runtime file is tracked.`);
    }
  }

  if (ignoredFilePatterns.some((pattern) => pattern.test(normalized))) continue;

  const text = readFileSync(file, 'utf8');
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(text)) {
      failures.push(`${file}: possible ${label} committed.`);
    }
  }
}

if (failures.length) {
  console.error('Secret scan failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Secret scan OK (${trackedFiles.length} tracked files checked).`);
