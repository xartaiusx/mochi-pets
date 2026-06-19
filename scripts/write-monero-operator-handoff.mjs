import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const opsRoot = process.env.MOCHI_SOCIAL_OPS_ROOT || 'C:\\Users\\xtyty\\Documents\\Mochi Social Ops';
const reportsDir = path.join(opsRoot, 'reports');
const timestamp = new Date().toISOString();

const requiredDirs = ['monero', 'p2pool', 'xmrig', 'wallets', 'reports'];
const forbiddenProcessNames = ['monerod.exe', 'monero-wallet-rpc.exe', 'monero-wallet-cli.exe', 'p2pool.exe', 'xmrig.exe'];

const secretPatterns = [
  { label: 'Monero seed words', pattern: /\b(?:abandon|ability|able|about|above|absent|absorb|abstract|absurd|abuse|access|accident)(?:\s+[a-z]+){10,}\b/i },
  { label: 'Monero private key assignment', pattern: /\b(?:PRIVATE_SPEND_KEY|PRIVATE_VIEW_KEY|MONERO_(?:SEED|MNEMONIC|WALLET_PASSWORD))\s*[:=]\s*\S+/i },
  { label: 'Exchange credential assignment', pattern: /\bEXCHANGE_API_(?:KEY|SECRET)\s*[:=]\s*\S+/i },
  { label: 'Supabase secret key', pattern: /\bsb_secret_[A-Za-z0-9_-]{12,}\b/ },
  { label: 'Enjin token assignment', pattern: /\b(?:ENJIN_PLATFORM_TOKEN|KEY_PASS|PLATFORM_KEY)\s*[:=]\s*\S+/i },
  { label: 'JWT-like token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ }
];

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    }).trim();
  } catch (error) {
    return '';
  }
}

function gitState() {
  return {
    branch: run('git', ['branch', '--show-current']),
    head: run('git', ['rev-parse', 'HEAD']),
    statusShort: run('git', ['status', '--short'])
      .split(/\r?\n/)
      .filter(Boolean)
  };
}

function ensureOpsDirs() {
  mkdirSync(opsRoot, { recursive: true });
  const directories = {};
  for (const name of requiredDirs) {
    const dir = path.join(opsRoot, name);
    mkdirSync(dir, { recursive: true });
    directories[name] = {
      path: dir,
      exists: existsSync(dir),
      itemCount: existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).length : 0
    };
  }
  return directories;
}

function inspectProcesses() {
  const output = run('tasklist', ['/FO', 'CSV', '/NH'], { cwd: undefined });
  const running = [];
  for (const name of forbiddenProcessNames) {
    const pattern = new RegExp(`^"${name.replace('.', '\\.')}"`, 'im');
    if (pattern.test(output)) running.push(name);
  }
  return {
    checked: Boolean(output),
    runningForbiddenProcesses: running
  };
}

function assertNoSecretMaterial(label, text) {
  for (const { label: secretLabel, pattern } of secretPatterns) {
    if (pattern.test(text)) {
      throw new Error(`${label} appears to contain forbidden secret material: ${secretLabel}`);
    }
  }
}

const directories = ensureOpsDirs();
const processEvidence = inspectProcesses();
const report = {
  scope: 'Mochi Social external Monero treasury operator handoff',
  timestamp,
  noSecret: true,
  noRuntimeActionStarted: true,
  noMiningStarted: true,
  noProviderMutation: true,
  noWalletCreated: true,
  noExchangeAction: true,
  noEnjinFunding: true,
  opsRoot,
  directories,
  processEvidence,
  git: gitState(),
  officialProcedures: {
    moneroDownloads: 'https://www.getmonero.org/downloads/',
    moneroWindowsVerification: 'https://www.getmonero.org/resources/user-guides/verification-windows-beginner.html',
    moneroCliWallet: 'https://docs.getmonero.org/interacting/monero-wallet-cli-reference/',
    moneroMining: 'https://www.getmonero.org/get-started/mining/',
    p2poolXmrig: 'https://docs.getmonero.org/interacting/mining/guides/p2pool/xmrig-p2pool/',
    xmrigDownload: 'https://xmrig.com/download',
    enjinFuelTanks: 'https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks',
    enjinWalletDaemon: 'https://docs.enjin.io/getting-started/using-wallet-daemon'
  },
  nextActionApprovalRequiredFor: [
    'download or extract miner binaries',
    'create or open a Monero wallet',
    'start monerod, P2Pool, XMRig, wallet RPC, or Wallet Daemon signing',
    'fund cENJ/Fuel Tank or submit Enjin transactions',
    'convert XMR to ENJ or use exchange credentials',
    'mutate Fly, Vercel, Supabase, Discord, GitHub provider settings, or hosted checks'
  ],
  withdrawalCapFormula: 'min(fuelTankRemaining, tankBudget, perUserBudget, operatorCap, dailyCap) - pendingReservations',
  notes: [
    'Monero mining remains an operator-only external treasury lane.',
    'Alpha Enjin Canary remains configured-preview-stub and no-real-value.',
    'This handoff records only directories, source procedures, process absence/presence, and approval boundaries.'
  ]
};

if (processEvidence.runningForbiddenProcesses.length) {
  throw new Error(`Mining or wallet process appears to be running: ${processEvidence.runningForbiddenProcesses.join(', ')}`);
}

const json = JSON.stringify(report, null, 2);
assertNoSecretMaterial('operator handoff JSON', json);

const markdown = renderMarkdown(report);
assertNoSecretMaterial('operator handoff Markdown', markdown);

mkdirSync(reportsDir, { recursive: true });
const jsonPath = path.join(reportsDir, 'monero-operator-handoff.json');
const mdPath = path.join(reportsDir, 'monero-operator-handoff.md');
writeFileSync(jsonPath, `${json}\n`, 'utf8');
writeFileSync(mdPath, markdown, 'utf8');

console.log(`Wrote no-secret Monero operator handoff: ${mdPath}`);

function renderMarkdown(data) {
  const dirs = Object.entries(data.directories)
    .map(([name, value]) => `- ${name}: ${value.exists ? 'ready' : 'missing'} (${value.itemCount} item(s)) at \`${value.path}\``)
    .join('\n');

  const processLine = data.processEvidence.checked
    ? 'No Monero/P2Pool/XMRig process was detected by this no-secret local check.'
    : 'Process list was not available; rerun locally before starting any operator action.';

  const approvals = data.nextActionApprovalRequiredFor.map((item) => `- ${item}`).join('\n');

  return `# Monero Operator Handoff

This file is intentionally no-secret. It records local operator readiness only and does not contain wallet addresses, wallet balances, seeds, private keys, passwords, exchange credentials, provider secrets, cookies, tokens, tax records, or screenshots.

Generated: ${data.timestamp}

## Status

- Mining started by this goal: no
- Wallet created by this goal: no
- Exchange action by this goal: no
- Enjin funding by this goal: no
- Provider mutation by this goal: no
- Enjin Canary alpha posture: configured-preview-stub, no-real-value

## Local Ops Folders

${dirs}

## Process Check

${processLine}

## Official Procedure Sources

- Monero downloads: ${data.officialProcedures.moneroDownloads}
- Monero Windows verification: ${data.officialProcedures.moneroWindowsVerification}
- Monero CLI wallet: ${data.officialProcedures.moneroCliWallet}
- Monero mining: ${data.officialProcedures.moneroMining}
- P2Pool plus XMRig: ${data.officialProcedures.p2poolXmrig}
- XMRig download and SHA256: ${data.officialProcedures.xmrigDownload}
- Enjin Fuel Tanks: ${data.officialProcedures.enjinFuelTanks}
- Enjin Wallet Daemon: ${data.officialProcedures.enjinWalletDaemon}

## Approval Required Before Next Actions

${approvals}

## Withdrawal Cap Formula

\`\`\`text
${data.withdrawalCapFormula}
\`\`\`

Reject if budget cannot be verified. Use idempotency keys. Credit inventory only after Enjin state is \`FINALIZED\`. Keep an admin kill switch for all withdrawals.
`;
}
