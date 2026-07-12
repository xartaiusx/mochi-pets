import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveMochiriiCredsDir } from './mochirii-workspace-paths.mjs';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_WALLET_DAEMON_REPORT || 'reports/wallet-daemon-local.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_WALLET_DAEMON_MD || 'reports/wallet-daemon-local.md');
const configuredPath = process.env.MOCHI_SOCIAL_WALLET_DAEMON_PATH || defaultWalletDaemonPath();
const requireBinary = process.env.MOCHI_SOCIAL_WALLET_DAEMON_REQUIRED === 'true' || Boolean(process.env.MOCHI_SOCIAL_WALLET_DAEMON_PATH);
const failures = [];

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'No-cost local Wallet Daemon binary check. This does not import wallets, print seeds, start a signer, contact Enjin, fund Fuel Tanks, or submit chain transactions.',
  git: readGitState(),
  noCostGuarantees: [
    'Only file metadata, SHA256 hashing, and --help output are inspected.',
    'The script never runs wallet-daemon import.',
    'The script never runs wallet-daemon print-seed.',
    'The script never starts a long-running signer process.',
    'The script never contacts Enjin Platform or submits a transaction.'
  ],
  manualNextGates: [
    'Operator privately creates or imports wallet material outside Git/chat.',
    'Operator confirms Wallet Daemon connected status in Enjin Platform.',
    'Operator records only non-secret readiness flags and IDs after explicit approval for any cost-bearing provider action.'
  ],
  configuredPath: configuredPath || null,
  binary: null,
  status: 'not-configured',
  failures
};

await run();
report.ok = failures.length === 0;
await writeReports();

if (!report.ok) {
  console.error('Mochi Social Wallet Daemon local check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social Wallet Daemon local check ${report.status}.`);
console.log(`Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

async function run() {
  if (!configuredPath) {
    report.status = 'not-configured';
    report.binary = {
      exists: false,
      reason: 'No MOCHI_SOCIAL_WALLET_DAEMON_PATH was provided and no Windows default path could be inferred.'
    };
    if (requireBinary) failures.push('Wallet Daemon binary is required but no path was configured.');
    return;
  }

  if (!existsSync(configuredPath)) {
    report.status = 'missing';
    report.binary = {
      path: configuredPath,
      exists: false
    };
    if (requireBinary) failures.push(`Wallet Daemon binary was not found at ${configuredPath}.`);
    return;
  }

  const stats = statSync(configuredPath);
  if (!stats.isFile()) {
    report.status = 'invalid-path';
    report.binary = {
      path: configuredPath,
      exists: true,
      isFile: false
    };
    failures.push(`Wallet Daemon path is not a file: ${configuredPath}.`);
    return;
  }

  const fileBytes = readFileSync(configuredPath);
  const help = spawnSync(configuredPath, ['--help'], {
    cwd: dirname(configuredPath),
    encoding: 'utf8',
    shell: false,
    timeout: 10000
  });
  const helpText = `${help.stdout || ''}\n${help.stderr || ''}`;
  const commands = ['import', 'print-seed', 'help'].filter((command) => new RegExp(`\\b${escapeRegExp(command)}\\b`).test(helpText));

  report.status = help.status === 0 ? 'verified-binary' : 'help-failed';
  report.binary = {
    path: configuredPath,
    exists: true,
    isFile: true,
    bytes: stats.size,
    sha256: createHash('sha256').update(fileBytes).digest('hex'),
    helpStatus: help.status,
    helpSignal: help.signal || null,
    helpCommands: commands,
    helpOutputPreview: sanitize(helpText)
  };

  if (stats.size < 1024 * 1024) failures.push('Wallet Daemon binary is unexpectedly small.');
  if (help.status !== 0) failures.push(`wallet-daemon --help exited with status ${help.status}.`);
  for (const command of ['import', 'print-seed', 'help']) {
    if (!commands.includes(command)) failures.push(`wallet-daemon --help did not list expected command: ${command}.`);
  }
}

function defaultWalletDaemonPath() {
  const credsDir = resolveMochiriiCredsDir(root);
  const candidates = [
    resolve(credsDir, 'enjin-wallet-daemon', 'wallet-daemon.exe'),
    resolve(credsDir, 'Enjin', 'enjin-wallet-daemon', 'wallet-daemon.exe')
  ];
  if (process.env.USERPROFILE) {
    candidates.push(
      resolve(process.env.USERPROFILE, 'Desktop', 'Creds', 'enjin-wallet-daemon', 'wallet-daemon.exe'),
      resolve(process.env.USERPROFILE, 'Downloads', 'wallet-daemon_v3.0.7_x86_64-pc-windows-msvc', 'wallet-daemon.exe')
    );
  }
  return candidates.find((candidate) => existsSync(candidate)) || candidates[0] || '';
}

async function writeReports() {
  await mkdir(dirname(reportJsonPath), { recursive: true });
  await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(reportMdPath, renderMarkdown(), 'utf8');
}

function renderMarkdown() {
  const binary = report.binary || {};
  const failuresText = failures.length ? failures.map((failure) => `- ${failure}`).join('\n') : '- None';
  const commandsText = Array.isArray(binary.helpCommands) && binary.helpCommands.length
    ? binary.helpCommands.map((command) => `- ${command}`).join('\n')
    : '- None recorded';

  return `# Mochi Social Wallet Daemon Local Check

Generated: ${report.checkedAt}

This file is intentionally no-secret. It verifies only the local Wallet Daemon binary file and its \`--help\` output. It does not import wallets, print seeds, start a signer, contact Enjin, fund a Fuel Tank, or submit a chain transaction.

## Status

- Result: ${report.ok ? 'pass' : 'fail'}
- Gate status: ${report.status}
- Binary path: ${binary.path || report.configuredPath || 'not configured'}
- Bytes: ${binary.bytes || 0}
- SHA256: ${binary.sha256 || 'not recorded'}

## Help Commands Observed

${commandsText}

## Remaining Manual Gates

- Enjin Platform must show Wallet Daemon connected before any collection, Fuel Tank, or proof operation can count as ready.
- Wallet seed material and passphrases must stay outside Git, chat, PRs, screenshots, and local reports.
- Any collection creation, Fuel Tank setup/funding, hosted daemon deployment, or live Canary transaction still requires explicit approval for that exact action.

## Failures

${failuresText}
`;
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
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
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

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 2000);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
