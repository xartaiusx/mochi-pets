import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

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
  /(^|\/).*mnemonic.*\.(txt|md|json)$/i,
  /(^|\/)Mochi Social Ops(\/|$)/i,
  /(^|\/).*\.keys$/i,
  /(^|\/).*\.wallet$/i,
  /(^|\/).*\.address\.txt$/i,
  /(^|\/)lmdb\/data\.mdb$/i,
  /(^|\/)monero.*\.(zip|tar\.bz2|7z)$/i,
  /(^|\/)xmrig.*\.(zip|tar\.gz|7z)$/i,
  /(^|\/)p2pool.*\.(zip|tar\.gz|7z)$/i,
  /(^|\/)monero(?:d|-wallet-cli|-wallet-rpc)?\.exe$/i,
  /(^|\/)xmrig\.exe$/i,
  /(^|\/)p2pool\.exe$/i
];

// Explicit names covered by the executable regexes above: monerod.exe, monero-wallet-cli.exe, monero-wallet-rpc.exe, xmrig.exe, p2pool.exe.

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
  { label: 'Monero wallet password assignment', pattern: /\bMONERO_WALLET_PASSWORD\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Monero seed assignment', pattern: /\b(?:XMR|MONERO)_(?:SEED|MNEMONIC)\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\r\n"']{12,}/i },
  { label: 'Monero private spend key assignment', pattern: /\b(?:MONERO_)?PRIVATE_SPEND_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[0-9a-f]{32,}/i },
  { label: 'Monero private view key assignment', pattern: /\b(?:MONERO_)?PRIVATE_VIEW_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[0-9a-f]{32,}/i },
  { label: 'Exchange API key assignment', pattern: /\bEXCHANGE_API_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Exchange API secret assignment', pattern: /\bEXCHANGE_API_SECRET\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i }
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
  if (!existsSync(file)) continue;

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
