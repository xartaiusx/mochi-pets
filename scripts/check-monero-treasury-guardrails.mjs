import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const textFileSkip = /\.(png|jpg|jpeg|webp|gif|ico|mp3|wav|ogg|zip|7z|exe|dll|mdb|keys|wallet)$/i;

const requiredSnippets = [
  {
    file: 'package.json',
    includes: ['"alpha:monero-treasury"', '"alpha:monero-operator-handoff"']
  },
  {
    file: 'AGENTS.md',
    includes: ['Monero treasury', 'operator-only', 'No browser mining', 'mining binaries', 'alpha:monero-treasury', 'alpha:monero-operator-handoff']
  },
  {
    file: 'docs/monero-treasury.md',
    includes: [
      'Monero can mine XMR, but it cannot directly fund Enjin Canary cENJ',
      'operator system',
      'No browser mining',
      'GitHub Actions mining',
      'Starting a miner is cost-bearing',
      'C:\\Users\\xtyty\\Documents\\Mochi Social Ops',
      'dedicated mining wallet',
      'Do not expose `monero-wallet-rpc` remotely',
      'Alpha remains no-real-value',
      'Do not try to convert XMR into cENJ',
      'min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations',
      'admin kill switch',
      'A crypto wallet cannot cap those bills',
      'npm run alpha:monero-operator-handoff',
      'fails if Monero/P2Pool/XMRig wallet or mining processes are already running'
    ]
  },
  {
    file: 'docs/goals/monero-treasury-to-enjin-funding.md',
    includes: [
      '/goal Execute docs/goals/monero-treasury-to-enjin-funding.md',
      'Parallel-Agent Safety',
      'second maintainer may be working on Mochi Social game development in parallel',
      'Avoid gameplay/map/HUD/asset files',
      'Do not run `npm run prepare-assets`',
      'Do not run destructive Git commands',
      'npm run alpha:monero-operator-handoff',
      'availableBudget = min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations',
      'monero-operator-handoff.json',
      'No miner, wallet, exchange, provider, Enjin, Fly, Vercel, Supabase, Discord, hosted check, or chain action was started'
    ]
  },
  {
    file: 'scripts/write-monero-operator-handoff.mjs',
    includes: [
      'Wrote no-secret Monero operator handoff',
      'C:\\\\Users\\\\xtyty\\\\Documents\\\\Mochi Social Ops',
      'monero-operator-handoff.json',
      'monero-operator-handoff.md',
      'forbiddenProcessNames',
      'monerod.exe',
      'xmrig.exe',
      'noMiningStarted: true',
      'noProviderMutation: true',
      'officialProcedures',
      'withdrawalCapFormula',
      'min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations'
    ]
  },
  {
    file: 'AGENTS.md',
    includes: ['docs/goals/monero-treasury-to-enjin-funding.md', 'another maintainer is working on Mochi Social gameplay', 'avoid gameplay/map/HUD/asset files', 'never use `git add -A`']
  },
  {
    file: 'scripts/check-secrets.mjs',
    includes: [
      'Monero wallet password assignment',
      'Monero private spend key assignment',
      'Exchange API secret assignment',
      'monero-wallet-cli.exe',
      'xmrig.exe',
      'p2pool.exe'
    ]
  }
];

const forbiddenTrackedFilePatterns = [
  { label: 'ops workspace', pattern: /(^|\/)Mochi Social Ops(\/|$)/i },
  { label: 'Monero wallet keys', pattern: /(^|\/).*\.keys$/i },
  { label: 'Monero wallet file', pattern: /(^|\/).*\.wallet$/i },
  { label: 'wallet seed file', pattern: /(^|\/)wallet\.seed$/i },
  { label: 'wallet address note', pattern: /(^|\/).*\.address\.txt$/i },
  { label: 'Monero blockchain data', pattern: /(^|\/)lmdb\/data\.mdb$/i },
  { label: 'Monero archive', pattern: /(^|\/)monero.*\.(zip|tar\.bz2|7z)$/i },
  { label: 'XMRig archive', pattern: /(^|\/)xmrig.*\.(zip|tar\.gz|7z)$/i },
  { label: 'P2Pool archive', pattern: /(^|\/)p2pool.*\.(zip|tar\.gz|7z)$/i },
  { label: 'Monero executable', pattern: /(^|\/)monero(?:d|-wallet-cli|-wallet-rpc)?\.exe$/i },
  { label: 'XMRig executable', pattern: /(^|\/)xmrig\.exe$/i },
  { label: 'P2Pool executable', pattern: /(^|\/)p2pool\.exe$/i }
];

const forbiddenSecretPatterns = [
  { label: 'Monero wallet password assignment', pattern: /\bMONERO_WALLET_PASSWORD\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Monero seed assignment', pattern: /\b(?:XMR|MONERO)_(?:SEED|MNEMONIC)\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\r\n"']{12,}/i },
  { label: 'Monero private spend key assignment', pattern: /\b(?:MONERO_)?PRIVATE_SPEND_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[0-9a-f]{32,}/i },
  { label: 'Monero private view key assignment', pattern: /\b(?:MONERO_)?PRIVATE_VIEW_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[0-9a-f]{32,}/i },
  { label: 'Exchange API key assignment', pattern: /\bEXCHANGE_API_KEY\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i },
  { label: 'Exchange API secret assignment', pattern: /\bEXCHANGE_API_SECRET\s*=\s*["']?(?!\.\.\.|<|your-|YOUR_|REPLACE_|example\b)[^\s"']{8,}/i }
];

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file}: missing required file.`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

for (const check of requiredSnippets) {
  const text = read(check.file);
  for (const snippet of check.includes) {
    if (!text.includes(snippet)) {
      failures.push(`${check.file}: expected snippet not found: ${snippet}`);
    }
  }
}

const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

for (const file of trackedFiles) {
  const normalized = file.replace(/\\/g, '/');
  for (const { label, pattern } of forbiddenTrackedFilePatterns) {
    if (pattern.test(normalized)) {
      failures.push(`${file}: tracked ${label} is not allowed.`);
    }
  }

  if (textFileSkip.test(normalized) || !existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const { label, pattern } of forbiddenSecretPatterns) {
    if (pattern.test(text)) {
      failures.push(`${file}: possible ${label} committed.`);
    }
  }
}

if (failures.length) {
  console.error('Monero treasury guardrails failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Monero treasury guardrails OK (${trackedFiles.length} tracked files checked).`);
