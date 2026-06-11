import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const outputPath = resolve(credsDir, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST || 'mochi-social-alpha-operator-next-steps.md');
const externalStatusPath = resolve(credsDir, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_STATUS_MD || 'mochi-social-alpha-external-gates-status.md');
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST_JSON || 'reports/alpha-operator-checklist.json');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const flyApp = process.env.MOCHI_SOCIAL_FLY_APP || 'mochi-social-game';
const flyRegion = process.env.MOCHI_SOCIAL_FLY_REGION || 'sjc';
const flyVolume = process.env.MOCHI_SOCIAL_FLY_VOLUME || 'mochi_social_data';
const supabaseProjectRef = process.env.MOCHI_SOCIAL_SUPABASE_PROJECT_REF || 'dnxumaiooljdnbjvzbdc';
const generatedAt = new Date().toISOString();

const externalGateSummary = readExternalGateSummary();
const walletDaemonSummary = readWalletDaemonSummary();
const manualPromptSummary = readManualPromptSummary();
const credentialFiles = listCredentialFiles();
const gitState = readGitState();
const providerActionQueue = buildProviderActionQueue();

await mkdir(credsDir, { recursive: true });
await writeFile(outputPath, renderChecklist(), 'utf8');
await writeFile(externalStatusPath, renderExternalGateStatus(), 'utf8');
await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(renderReport(), null, 2)}\n`, 'utf8');
console.log(`Wrote no-secret Mochi Social alpha operator checklist: ${outputPath}`);
console.log(`Wrote no-secret Mochi Social external gate status: ${externalStatusPath}`);
console.log(`Wrote no-secret Mochi Social alpha operator checklist report: ${reportJsonPath}`);

function defaultCredsDir() {
  if (process.env.USERPROFILE) return join(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return join(process.env.HOME, 'Desktop', 'Creds');
  return join(root, '.local', 'creds');
}

function listCredentialFiles() {
  if (!existsSync(credsDir)) return [];
  return readdirSync(credsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^mochi-social-alpha|^supabase-preview-|^enjin-|^fly-/i.test(name))
    .sort((a, b) => a.localeCompare(b));
}

function readExternalGateSummary() {
  if (!existsSync(reportPath)) {
    return {
      present: false,
      ok: false,
      failures: ['Run npm run alpha:external-gates to generate the latest external gate report.']
    };
  }

  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    const failures = Array.isArray(report.checks)
      ? report.checks
        .filter((check) => check.status === 'fail')
        .map((check) => `${check.name}: ${check.message}`)
      : ['External gate report did not contain a checks array.'];
    const checks = Array.isArray(report.checks)
      ? report.checks.map((check) => ({
        name: sanitize(check.name),
        status: sanitize(check.status),
        message: sanitize(check.message)
      }))
      : [];
    return {
      present: true,
      ok: report.ok === true,
      checkedAt: report.checkedAt,
      hostedChecksAllowed: report.hostedChecksAllowed,
      flyApp: sanitize(report.flyApp),
      flyVolume: sanitize(report.flyVolume),
      gameUrl: sanitize(report.gameUrl),
      sitePreviewUrl: sanitize(report.sitePreviewUrl),
      checks,
      failures
    };
  } catch {
    return {
      present: true,
      ok: false,
      failures: ['External gate report exists but could not be parsed.']
    };
  }
}

function readWalletDaemonSummary() {
  const walletReportPath = resolve(root, process.env.MOCHI_SOCIAL_WALLET_DAEMON_REPORT || 'reports/wallet-daemon-local.json');
  if (!existsSync(walletReportPath)) {
    return {
      present: false,
      ok: false,
      status: 'missing-report',
      message: 'Run npm run alpha:wallet-daemon-check to generate the local Wallet Daemon binary report.'
    };
  }

  try {
    const report = JSON.parse(readFileSync(walletReportPath, 'utf8'));
    return {
      present: true,
      ok: report.ok === true,
      checkedAt: report.checkedAt,
      status: report.status,
      path: report.binary?.path || report.configuredPath || null,
      sha256: report.binary?.sha256 || null,
      helpCommands: report.binary?.helpCommands || [],
      message: report.ok === true
        ? 'Local Wallet Daemon binary metadata check is current enough for handoff context only.'
        : `Local Wallet Daemon binary check is not passing: ${(report.failures || []).join(', ')}`
    };
  } catch {
    return {
      present: true,
      ok: false,
      status: 'parse-failed',
      message: 'Wallet Daemon local report exists but could not be parsed.'
    };
  }
}

function readManualPromptSummary() {
  const promptReportPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_JSON || 'reports/alpha-manual-prompt-review.json');
  if (!existsSync(promptReportPath)) {
    return {
      present: false,
      ok: false,
      status: 'missing-report',
      pendingChecks: ['welcome-npc', 'token-chest', 'care-shrine'],
      message: 'Run npm run alpha:manual-prompt-review to generate the prompt review gate report.'
    };
  }

  try {
    const report = JSON.parse(readFileSync(promptReportPath, 'utf8'));
    return {
      present: true,
      ok: report.ok === true,
      checkedAt: report.checkedAt,
      status: report.review?.status || 'unknown',
      url: report.review?.url || null,
      reviewer: report.review?.reviewer || null,
      browser: report.review?.browser || null,
      completedChecks: report.completedChecks || [],
      pendingChecks: report.pendingChecks || [],
      message: report.ok === true
        ? 'Manual rendered prompt review is complete.'
        : 'Manual rendered prompt review is pending or incomplete.'
    };
  } catch {
    return {
      present: true,
      ok: false,
      status: 'parse-failed',
      pendingChecks: ['welcome-npc', 'token-chest', 'care-shrine'],
      message: 'Manual prompt review report exists but could not be parsed.'
    };
  }
}

function renderReport() {
  return {
    ok: true,
    generatedAt,
    scope: 'No-secret operator checklist evidence for local Alpha RC handoff. This report lists paths, statuses, and secret names only.',
    markdownPath: pathForReport(outputPath),
    externalStatusPath: pathForReport(externalStatusPath),
    git: gitState,
    credentialFiles,
    targets: {
      flyApp,
      flyRegion,
      flyVolume,
      supabaseProjectRef
    },
    externalGateSummary,
    walletDaemonSummary,
    manualPromptSummary,
    providerActionQueue,
    noCostRule: 'No push, CI rerun, deploy, hosted smoke, provider mutation, Fuel Tank funding, or live Enjin transaction without explicit approval for that exact action.'
  };
}

function renderExternalGateStatus() {
  const passList = externalGateSummary.checks?.filter((check) => check.status === 'pass') ?? [];
  const failList = externalGateSummary.checks?.filter((check) => check.status === 'fail') ?? [];
  const passes = passList.length
    ? passList.map((check) => `- ${check.name}: ${check.message}`).join('\n')
    : '- No passing external checks were recorded.';
  const failures = failList.length
    ? failList.map((check) => `- ${check.name}: ${check.message}`).join('\n')
    : '- No failing external checks were recorded.';

  return `# Mochi Social Alpha External Gates Status

Generated: ${generatedAt}

This file is intentionally no-secret and generated from the latest \`reports/alpha-external-gates.json\`. It may list provider names, resource names, URLs, and required secret names, but it must not contain raw API tokens, seed phrases, passphrases, payment details, one-time codes, or secret values.

## Current Git State

- Branch: ${gitState.branch || 'unknown'}
- Local HEAD: ${gitState.localHead || 'unknown'}
- Upstream: ${gitState.upstream || 'unknown'}
- Dirty tracked files: ${gitState.dirty.length}

## Gate Snapshot

- Report present: ${externalGateSummary.present ? 'yes' : 'no'}
- Report checked at: ${externalGateSummary.checkedAt || 'not recorded'}
- Overall pass: ${externalGateSummary.ok ? 'yes' : 'no'}
- Hosted checks allowed: ${externalGateSummary.hostedChecksAllowed === true ? 'yes' : 'no'}
- Fly app: ${externalGateSummary.flyApp || flyApp}
- Fly volume: ${externalGateSummary.flyVolume || flyVolume}
- Game URL: ${externalGateSummary.gameUrl || 'not recorded'}
- Site preview URL: ${externalGateSummary.sitePreviewUrl || 'not recorded'}

## Passing External Checks

${passes}

## Failing Or Blocked External Checks

${failures}

## No-Cost Boundary

Read-only provider status checks are allowed. Creating resources, setting secrets, deploying, running hosted smoke/load/browser checks, submitting Enjin Canary operations, funding Fuel Tanks, or pushing a branch that triggers CI still requires explicit approval for that exact action.
`;
}

function renderChecklist() {
  const fileList = credentialFiles.length
    ? credentialFiles.map((file) => `- ${file}`).join('\n')
    : '- No matching local credential checklist files were found.';
  const gateList = externalGateSummary.failures.length
    ? externalGateSummary.failures.map((failure) => `- ${failure}`).join('\n')
    : '- No failing external gates were recorded in the last report.';
  const walletCommands = walletDaemonSummary.helpCommands?.length
    ? walletDaemonSummary.helpCommands.map((command) => `- ${command}`).join('\n')
    : '- None recorded';
  const manualPromptPending = manualPromptSummary.pendingChecks?.length
    ? manualPromptSummary.pendingChecks.map((check) => `- ${check}`).join('\n')
    : '- None';
  const actionQueue = providerActionQueue.length
    ? providerActionQueue.map((item, index) => `${index + 1}. ${item.title}
   - Provider: ${item.provider}
   - Blocker: ${item.blocker}
   - Exact approval needed: ${item.approvalText}
   - No-cost fallback: ${item.noCostFallback}`).join('\n')
    : '1. No provider or sync actions are queued from the latest reports.';
  const dirtyList = gitState.dirty.length
    ? gitState.dirty.slice(0, 20).map((line) => `- ${line}`).join('\n')
    : '- No tracked dirty files were recorded when this checklist was generated.';

  return `# Mochi Social Alpha Operator Next Steps

Generated: ${generatedAt}

This file is intentionally no-secret. It lists names, commands, and private-entry placeholders only. Do not paste raw API tokens, wallet seed phrases, passphrases, payment details, or one-time codes into Codex chat, Git, PR comments, screenshots, or reports.

No-cost rule: do not create, deploy, scale, fund, submit chain transactions, run hosted load smoke, rerun Actions, or push CI-triggering branches without explicit user approval for that exact action. Prefer local checks and read-only provider status commands.

## Git State

- Branch: ${gitState.branch || 'unknown'}
- Local HEAD: ${gitState.localHead || 'unknown'}
- Upstream: ${gitState.upstream || 'unknown'}
- Dirty tracked files: ${gitState.dirty.length}

Dirty tracked file summary:

${dirtyList}

## Local Credential Files

${fileList}

## Latest External Gate Summary

- Report present: ${externalGateSummary.present ? 'yes' : 'no'}
- Last checked: ${externalGateSummary.checkedAt || 'not recorded'}
- Overall pass: ${externalGateSummary.ok ? 'yes' : 'no'}

Failing or missing gates:

${gateList}

## Provider Action Queue

This queue is generated from the latest local audit and external gate report. It is not approval and it does not contain secrets.

${actionQueue}

## Local Wallet Daemon Binary Check

- Report present: ${walletDaemonSummary.present ? 'yes' : 'no'}
- Last checked: ${walletDaemonSummary.checkedAt || 'not recorded'}
- Overall pass: ${walletDaemonSummary.ok ? 'yes' : 'no'}
- Status: ${walletDaemonSummary.status}
- Binary path: ${walletDaemonSummary.path || 'not recorded'}
- SHA256: ${walletDaemonSummary.sha256 || 'not recorded'}
- Note: ${walletDaemonSummary.message}

Observed \`--help\` commands:

${walletCommands}

This only proves the downloaded local binary responds to metadata/help inspection. It is not proof that a Wallet Daemon signer is running, that Enjin Platform shows Connected, or that any collection/Fuel Tank/transaction gate is complete.

## Manual Prompt Review Gate

- Report present: ${manualPromptSummary.present ? 'yes' : 'no'}
- Last checked: ${manualPromptSummary.checkedAt || 'not recorded'}
- Overall pass: ${manualPromptSummary.ok ? 'yes' : 'no'}
- Status: ${manualPromptSummary.status}
- URL: ${manualPromptSummary.url || 'not recorded'}
- Reviewer: ${manualPromptSummary.reviewer || 'not recorded'}
- Browser: ${manualPromptSummary.browser || 'not recorded'}
- Note: ${manualPromptSummary.message}

Pending prompt checks:

${manualPromptPending}

Complete this gate only after a local browser review confirms the welcome NPC dialog, token chest prompt/save feedback, and habitat care-loop prompt are rendered coherently. Focus the game canvas, stand adjacent to the object, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.

## Local No-Cost Gate

Run this before any hosted or provider work:

\`\`\`powershell
npm run alpha:wallet-daemon-check
npm run alpha:manual-prompt-review # Writes pending report until operator confirmation env vars are set.
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:report-hygiene
\`\`\`

The suite builds once, starts the built game server on localhost with throwaway env, clears live Supabase/Enjin settings from child processes, runs endpoint smoke, local acceptance, load smoke, browser presence, visual snapshot, and the private Enjin fail-closed check, then writes \`reports/alpha-local-suite.json\`. The evidence command reads ignored localhost reports and writes no-secret \`reports/alpha-local-evidence.json\` and \`reports/alpha-local-evidence.md\`. The hygiene command scans ignored local reports and the generated no-secret checklist for accidental secret patterns.

## Fly Gate

Current target:

- App: ${flyApp}
- Region: ${flyRegion}
- Volume: ${flyVolume}
- Save mount: /data

Read-only checks are allowed:

1. Inspect existing Fly app status.
2. Inspect existing Fly secret names.
3. Run local checks and local smoke.

Only after explicit user approval for possible Fly charges, run from the game repo:

\`\`\`powershell
$fly = Join-Path $env:USERPROFILE ".fly\\bin\\flyctl.exe"
if (!(Test-Path $fly)) { $fly = "flyctl" }
& $fly apps create ${flyApp}
& $fly volumes create ${flyVolume} --size 1 --region ${flyRegion} -a ${flyApp}
\`\`\`

Only after explicit user approval for deploy/secret changes, set Fly secrets privately. The values come from the Supabase preview key file, the generated game bridge token file, the Enjin dashboard, and the Vercel preview origin:

\`\`\`powershell
$flySecrets = @(
  "SUPABASE_URL=<private-supabase-url>",
  "SUPABASE_PUBLISHABLE_KEY=<private-supabase-publishable-key>",
  "SUPABASE_AUTH_REQUIRED=true",
  "MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL=https://${supabaseProjectRef}.supabase.co/functions/v1",
  "MOCHI_SOCIAL_GAME_SERVER_TOKEN=<private-game-server-token>",
  "ENJIN_PLATFORM_URL=https://platform.canary.enjin.io/graphql",
  "ENJIN_PLATFORM_TOKEN=<private-enjin-platform-token>",
  "ENJIN_NETWORK=CANARY",
  "ENJIN_COLLECTION_ID=<private-enjin-collection-id>",
  "ENJIN_FUEL_TANK_ID=<private-enjin-fuel-tank-id>",
  "RPG_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://<vercel-preview-host>",
  "RPG_SAVE_DIR=/data/saves"
)
& $fly secrets set -a ${flyApp} $flySecrets
& $fly deploy -a ${flyApp}
\`\`\`

## Enjin Canary Gate

Current required outcome:

1. Enjin Platform settings show Wallet Daemon status Connected.
2. The daemon signing address is known to the operator and backed up outside Git/chat.
3. The Mochi Social Alpha collection reaches FINALIZED on Canary.
4. The Canary Fuel Tank ID/address is recorded privately after explicit approval to create or fund it.
5. One managed wallet, one rare certificate operation, and one fixed listing proof are recorded through the game operator route.

Cloud Wallet Daemon path:

1. Keep one Enjin Platform API token ready. The dashboard may show that a token exists, but Codex should not read or print it.
2. Deploy the official Wallet Daemon as an outbound-only cloud signer only after explicit approval for any cloud resources. The Enjin docs describe AWS CloudFormation as the simplest managed path; use the current official template/link from the docs or Enjin settings.
3. Enter PLATFORM_KEY=<private-enjin-platform-token> and KEY_PASS=<private-wallet-daemon-passphrase> privately in the cloud secret fields.
4. Save the generated mnemonic/seed backup and passphrase in a password manager or encrypted vault only.
5. Verify Enjin Platform settings changes from Not Connected to Connected.

Do not put Wallet Daemon seed material, KEY_PASS, service-role keys, or payment details in this repo, Fly game secrets, Supabase browser env, PR comments, screenshots, or chat.

## Preview Verification After Fly And Enjin Gates

\`\`\`powershell
$env:MOCHI_SOCIAL_GAME_URL="https://${flyApp}.fly.dev"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true" # Requires explicit hosted verification approval.
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="${supabaseProjectRef}"
$env:MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED="true"
$env:MOCHI_SOCIAL_ENJIN_COLLECTION_READY="true"
$env:MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY="true"
npm run smoke
npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke # Hosted load smoke requires explicit approval.
npm run alpha:browser-presence
npm run alpha:visual-snapshot
npm run alpha:enjin-operator-smoke
npm run alpha:external-gates
\`\`\`

Alpha RC Ready still requires the Mochirii preview to block non-testers, gate terms, forward auth, record feedback/ledger rows, and embed the Fly game URL.
`;
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const counts = upstream.ok ? git(['rev-list', '--left-right', '--count', `${firstLine(upstream.stdout)}...HEAD`]) : { ok: false, stdout: '', stderr: upstream.stderr };
  const worktree = git(['status', '--porcelain']);
  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);
  return {
    branch: firstLine(branch.stdout),
    localHead: firstLine(localHead.stdout),
    upstream: firstLine(upstream.stdout),
    ahead: Number.parseInt(aheadText, 10) || 0,
    behind: Number.parseInt(behindText, 10) || 0,
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, counts, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function buildProviderActionQueue() {
  const queue = [];
  const failures = new Set(externalGateSummary.failures || []);
  const hasExternalFailure = (needle) => [...failures].some((failure) => failure.includes(needle));
  const branch = gitState.branch || 'codex/mochi-social-alpha-rc';
  const upstream = gitState.upstream || `origin/${branch}`;

  if ((gitState.ahead || 0) > 0 || gitState.dirty.length > 0) {
    queue.push({
      id: 'github-branch-sync',
      provider: 'GitHub',
      title: 'Sync the local game branch only after CI-trigger approval.',
      blocker: `${gitState.ahead || 0} local commit(s) ahead of ${upstream}; remote PR checks cannot prove this HEAD.`,
      approvalText: `I approve pushing C:\\Users\\xtyty\\Documents\\Local RPG branch ${branch} to ${upstream} and allow GitHub Actions/PR checks to run for Mochi Social.`,
      noCostFallback: 'Keep the branch local and leave github.local-branch-sync red.'
    });
  }

  if (hasExternalFailure('Fly secret names')) {
    queue.push({
      id: 'fly-secret-update',
      provider: 'Fly.io',
      title: 'Set the missing Fly secret names for Enjin Canary runtime wiring.',
      blocker: 'Fly is missing ENJIN_COLLECTION_ID and ENJIN_FUEL_TANK_ID in the latest external gate report.',
      approvalText: 'I approve setting the missing Fly secret names on mochi-social-game and understand this may restart hosted resources or add usage.',
      noCostFallback: 'Leave the Fly runtime in configured-preview-stub mode and keep local Enjin smoke fail-closed.'
    });
  }

  if (hasExternalFailure('Live game URL')) {
    queue.push({
      id: 'fly-live-game-url',
      provider: 'Fly.io',
      title: 'Record and verify the Fly game URL after an approved deploy or existing live runtime check.',
      blocker: 'MOCHI_SOCIAL_GAME_URL is not recorded, so hosted game contract checks cannot run.',
      approvalText: 'I approve the specific Fly hosted action: <exact deploy or hosted smoke command>. I understand it may add usage or charges.',
      noCostFallback: 'Use localhost only and leave the live game URL gate red.'
    });
  }

  if (hasExternalFailure('Site preview contract')) {
    queue.push({
      id: 'vercel-supabase-preview-contract',
      provider: 'Vercel/Supabase',
      title: 'Bind the Mochirii preview to the Fly game URL and verify the site contract.',
      blocker: 'MOCHI_SOCIAL_GAME_URL and MOCHI_SOCIAL_SITE_PREVIEW_URL are not both recorded.',
      approvalText: 'I approve the specific Vercel/Supabase preview action: <exact env/deploy/check command or dashboard action>. I understand it may add usage or charges.',
      noCostFallback: 'Keep local game/site contract checks only.'
    });
  }

  if (hasExternalFailure('Enjin Canary operator readiness')) {
    queue.push({
      id: 'enjin-canary-readiness',
      provider: 'Enjin Canary',
      title: 'Complete operator-confirmed Enjin Canary readiness before live proof smoke.',
      blocker: 'The latest report lacks Enjin token/collection/Fuel Tank inputs and connected Wallet Daemon confirmation flags.',
      approvalText: 'I approve the specific Enjin Canary action: <exact collection, Fuel Tank, Wallet Daemon, or transaction proof action>. I understand it may add usage, sponsored transaction cost, or cloud/resource charges.',
      noCostFallback: 'Keep Enjin readiness flags unset and use configured-preview-stub plus local fail-closed operator smoke.'
    });
  }

  return queue;
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

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}
