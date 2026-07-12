import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';
import { resolveMochiriiCredsDir } from './mochirii-workspace-paths.mjs';

const root = process.cwd();
const credsDir = resolveMochiriiCredsDir(root);
const outputPath = resolve(credsDir, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST || 'mochi-social-alpha-operator-next-steps.md');
const externalStatusPath = resolve(credsDir, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_STATUS_MD || 'mochi-social-alpha-external-gates-status.md');
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST_JSON || 'reports/alpha-operator-checklist.json');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
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
const siteGitState = readGitStateAt(siteRepoPath);
const providerActionQueue = buildProviderActionQueue();

await mkdir(credsDir, { recursive: true });
await writeFile(outputPath, renderChecklist(), 'utf8');
await writeFile(externalStatusPath, renderExternalGateStatus(), 'utf8');
await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(renderReport(), null, 2)}\n`, 'utf8');
console.log(`Wrote no-secret Mochi Social alpha operator checklist: ${outputPath}`);
console.log(`Wrote no-secret Mochi Social external gate status: ${externalStatusPath}`);
console.log(`Wrote no-secret Mochi Social alpha operator checklist report: ${reportJsonPath}`);

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
      lanes: report.lanes ?? null,
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
      pendingChecks: ['welcome-npc', 'guild-seal-chest', 'care-shrine'],
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
      pendingChecks: ['welcome-npc', 'guild-seal-chest', 'care-shrine'],
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
    siteGit: siteGitState,
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
    noCostRule: 'Public-repo commits and pushes are allowed; verify PR checks afterward. No paid/quota-bearing CI rerun, deploy, hosted smoke, provider mutation, Fuel Tank funding, or live Enjin transaction without explicit approval for that exact cost-bearing action.'
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

## Gate Lanes

- Alpha Preview Ready / preview-live-gates: ${formatLaneStatus(externalGateSummary.lanes?.previewLive)}
- Funded-chain gates: ${formatLaneStatus(externalGateSummary.lanes?.fundedChain)}
- Full Alpha RC Ready: ${formatLaneStatus(externalGateSummary.lanes?.alphaRcReady)}

## Passing External Checks

${passes}

## Failing Or Blocked External Checks

${failures}

## No-Cost Boundary

Read-only provider status checks are allowed. Public-repo commits and pushes are allowed; verify PR checks afterward. Creating resources, setting secrets, deploying, running hosted smoke/load/browser checks, submitting Enjin Canary operations, funding Fuel Tanks, or rerunning paid/quota-bearing CI still requires explicit approval when it can create real provider cost or mutate external state.
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

This file is intentionally no-secret. It lists names, commands, and private-entry placeholders only. Do not paste raw API tokens, wallet seed phrases, passphrases, payment details, or one-time codes into chat, Git, PR comments, screenshots, or reports.

No-cost rule: public-repo commits and pushes are allowed; verify PR checks afterward. Do not create, deploy, scale, fund, submit chain transactions, run hosted load smoke, rerun paid/quota-bearing Actions, set provider secrets/env vars, or mutate provider resources without explicit user approval for that exact cost-bearing action. Prefer local checks and read-only provider status commands.

## Git State

- Branch: ${gitState.branch || 'unknown'}
- Local HEAD: ${gitState.localHead || 'unknown'}
- Upstream: ${gitState.upstream || 'unknown'}
- Dirty tracked files: ${gitState.dirty.length}

Dirty tracked file summary:

${dirtyList}

## Site Git State

- Path: ${siteRepoPath}
- Branch: ${siteGitState.branch || 'unknown'}
- Local HEAD: ${siteGitState.localHead || 'unknown'}
- Upstream: ${siteGitState.upstream || 'unknown'}
- Ahead: ${siteGitState.ahead}
- Behind: ${siteGitState.behind}
- Dirty tracked files: ${siteGitState.dirty.length}

## Local Credential Files

${fileList}

## Latest External Gate Summary

- Report present: ${externalGateSummary.present ? 'yes' : 'no'}
- Last checked: ${externalGateSummary.checkedAt || 'not recorded'}
- Overall pass: ${externalGateSummary.ok ? 'yes' : 'no'}
- Alpha Preview Ready / preview-live-gates: ${formatLaneStatus(externalGateSummary.lanes?.previewLive)}
- Funded-chain gates: ${formatLaneStatus(externalGateSummary.lanes?.fundedChain)}

Failing or missing gates:

${gateList}

## Stop Points

- Alpha Preview Ready means the Fly game URL, Mochirii Vercel Preview embed, Supabase allowlist/terms/feedback, short-lived iframe auth, no-real-value labels, approved hosted contract checks, and player-facing shared-room copy pass while funded-chain work stays deferred and absent from the player alpha.
- Alpha RC Ready means Alpha Preview Ready plus funded-chain-gates: funded Enjin Canary collection, Fuel Tank, Wallet Daemon signing, and finalized proof smoke.
- Do not set dummy \`ENJIN_COLLECTION_ID\`, dummy \`ENJIN_FUEL_TANK_ID\`, or fake Enjin readiness flags. Funded-chain gates may stay red until real Canary resources and approvals exist.

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

Complete this gate only after a local browser review confirms the welcome NPC dialog, guild seal chest prompt/save feedback, and habitat care-loop prompt are rendered coherently. Focus the game canvas, stand adjacent to the object, and hold Space/Action for about 200ms so the RPGJS/CanvasEngine polling loop emits the action.

## Local No-Cost Gate

Run this before any hosted or provider work:

\`\`\`powershell
npm run alpha:wallet-daemon-check
npm run alpha:manual-prompt-review # Writes pending report until operator confirmation env vars are set.
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:report-hygiene
\`\`\`

The suite builds once, starts the built game server on localhost with throwaway env, clears live Supabase/Enjin settings from child processes, runs endpoint smoke, local acceptance, load smoke, browser presence, responsive gameplay, visual snapshot, and the private Enjin fail-closed check, then writes \`reports/alpha-local-suite.json\`. The evidence command reads ignored localhost reports and writes no-secret \`reports/alpha-local-evidence.json\` and \`reports/alpha-local-evidence.md\`. The hygiene command scans ignored local reports and the generated no-secret checklist for accidental secret patterns.

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

Only after explicit user approval for deploy/secret changes, set Alpha Preview Ready Fly secrets privately. The values come from the Supabase preview key file, the generated game bridge token file, and the Vercel preview origin:

\`\`\`powershell
$previewFlySecrets = @(
  "SUPABASE_URL=<private-supabase-url>",
  "SUPABASE_PUBLISHABLE_KEY=<private-supabase-publishable-key>",
  "SUPABASE_AUTH_REQUIRED=true",
  "MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL=https://${supabaseProjectRef}.supabase.co/functions/v1",
  "MOCHI_SOCIAL_GAME_SERVER_TOKEN=<private-game-server-token>",
  "RPG_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://<vercel-preview-host>",
  "RPG_SAVE_DIR=/data/saves"
)
& $fly secrets set -a ${flyApp} $previewFlySecrets
& $fly deploy -a ${flyApp}
\`\`\`

Leave \`ENJIN_COLLECTION_ID\` and \`ENJIN_FUEL_TANK_ID\` unset for Alpha Preview Ready unless real Canary resources exist. Funded-chain work stays deferred and absent from the player alpha; private future-chain routes may remain fail-closed for later Alpha RC validation.

## Enjin Canary Gate

Current required outcome:

1. Enjin Platform settings show Wallet Daemon status Connected.
2. The daemon signing address is known to the operator and backed up outside Git/chat.
3. The Mochi Social Alpha collection reaches FINALIZED on Canary.
4. The Canary Fuel Tank ID/address is recorded privately after explicit approval to create or fund it.
5. One managed wallet, one rare certificate operation, and one fixed listing proof are recorded through the game operator route.

Cloud Wallet Daemon path:

1. Keep one Enjin Platform API token ready. The dashboard may show that a token exists, but shared workflows should not read or print it.
2. Deploy the official Wallet Daemon as an outbound-only cloud signer only after explicit approval for any cloud resources. The Enjin docs describe AWS CloudFormation as the simplest managed path; use the current official template/link from the docs or Enjin settings.
3. Enter PLATFORM_KEY=<private-enjin-platform-token> and KEY_PASS=<private-wallet-daemon-passphrase> privately in the cloud secret fields.
4. Save the generated mnemonic/seed backup and passphrase in a password manager or encrypted vault only.
5. Verify Enjin Platform settings changes from Not Connected to Connected.

Do not put Wallet Daemon seed material, KEY_PASS, service-role keys, or payment details in this repo, Fly game secrets, Supabase browser env, PR comments, screenshots, or chat.

Only after explicit user approval for funded-chain work and after real Canary resources exist, set the funded-chain Fly secrets:

\`\`\`powershell
$fundedChainFlySecrets = @(
  "ENJIN_PLATFORM_URL=https://platform.canary.enjin.io/graphql",
  "ENJIN_PLATFORM_TOKEN=<private-enjin-platform-token>",
  "ENJIN_NETWORK=CANARY",
  "ENJIN_COLLECTION_ID=<private-enjin-collection-id>",
  "ENJIN_FUEL_TANK_ID=<private-enjin-fuel-tank-id>"
)
& $fly secrets set -a ${flyApp} $fundedChainFlySecrets
\`\`\`

## Alpha Preview Verification After Preview Gates

\`\`\`powershell
$env:MOCHI_SOCIAL_GAME_URL="https://${flyApp}.fly.dev"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true" # Requires explicit hosted verification approval.
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="${supabaseProjectRef}"
npm run smoke
npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke # Hosted load smoke requires explicit approval.
npm run alpha:browser-presence
npm run alpha:responsive-gameplay
$env:MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL="https://<vercel-preview-host>"; $env:MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME="true"; npm run alpha:responsive-gameplay # Hosted site smoke requires explicit approval.
npm run alpha:visual-snapshot
npm run alpha:external-gates
\`\`\`

For Alpha Preview Ready, \`npm run alpha:external-gates\` may still show funded-chain gates red. That is expected while funded-chain work remains deferred and absent from the player alpha.

## Funded Alpha RC Verification After Enjin Gates

\`\`\`powershell
$env:MOCHI_SOCIAL_GAME_URL="https://${flyApp}.fly.dev"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS="true" # Requires explicit hosted verification approval.
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="${supabaseProjectRef}"
$env:ENJIN_PLATFORM_TOKEN="<private-enjin-platform-token>"
$env:ENJIN_COLLECTION_ID="<private-enjin-collection-id>"
$env:ENJIN_FUEL_TANK_ID="<private-enjin-fuel-tank-id>"
$env:MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED="true"
$env:MOCHI_SOCIAL_ENJIN_COLLECTION_READY="true"
$env:MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY="true"
npm run alpha:enjin-operator-smoke
npm run alpha:external-gates
\`\`\`

Alpha RC Ready still requires the Mochirii preview to block non-testers, gate terms, forward auth, record feedback/ledger rows, and embed the Fly game URL.
`;
}

function readGitState() {
  return readGitStateAt(root);
}

function readGitStateAt(cwd) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd);
  const localHead = git(['rev-parse', 'HEAD'], cwd);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd);
  const counts = upstream.ok ? git(['rev-list', '--left-right', '--count', `${firstLine(upstream.stdout)}...HEAD`], cwd) : { ok: false, stdout: '', stderr: upstream.stderr };
  const worktree = git(['status', '--porcelain'], cwd);
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
  const branch = gitState.branch || 'codex/mochi-social-fullscale-alpha-preview';
  const upstream = gitState.upstream || `origin/${branch}`;

  if ((gitState.ahead || 0) > 0 || gitState.dirty.length > 0) {
    queue.push({
      id: 'github-branch-sync',
      provider: 'GitHub',
      title: 'Sync the local game branch and verify PR checks.',
      blocker: `${gitState.ahead || 0} local commit(s) ahead of ${upstream}; remote PR checks cannot prove this HEAD.`,
      approvalText: `Proceed with public-repo sync: push ${root} branch ${branch} to ${upstream}, then verify GitHub Actions/PR checks for Mochi Social.`,
      noCostFallback: 'Keep the branch local only if intentionally avoiding a sync; github.local-branch-sync remains red until pushed.'
    });
  }

  if ((siteGitState.ahead || 0) > 0 || siteGitState.dirty.length > 0) {
    const siteBranch = siteGitState.branch || 'codex/mochi-social-alpha-rc';
    const siteUpstream = siteGitState.upstream || `origin/${siteBranch}`;
    queue.push({
      id: 'github-site-branch-sync',
      provider: 'GitHub',
      title: 'Sync the local Mochirii site branch and verify PR checks.',
      blocker: `${siteGitState.ahead || 0} local site commit(s) ahead of ${siteUpstream}; remote PR checks cannot prove this HEAD.`,
      approvalText: `Proceed with public-repo sync: push ${siteRepoPath} branch ${siteBranch} to ${siteUpstream}, then verify GitHub Actions/PR checks for Mochirii.`,
      noCostFallback: 'Keep the site branch local only if intentionally avoiding a sync; github.site-local-branch-sync remains red until pushed.'
    });
  }

  queue.push({
    id: 'fly-verified-milestone-deploy',
    provider: 'Fly.io',
    title: 'Deploy the verified Mochi Social game milestone to Fly after approval.',
    blocker: 'The active goal requests deploys after verified milestones, but Fly deploys mutate hosted resources and can add usage. Local proof, push, and PR/CI verification may proceed first.',
    approvalText: `I approve deploying the verified Mochi Social game milestone to Fly app ${flyApp} with fly deploy after local checks, push, and PR/CI verification. I understand this may restart hosted resources or add usage.`,
    noCostFallback: 'Keep the milestone committed, pushed, and locally verified; leave the Fly runtime unchanged until deploy approval is granted.'
  });

  queue.push({
    id: 'vercel-verified-milestone-deploy',
    provider: 'Vercel',
    title: 'Deploy the verified Mochirii web milestone or preview embed after approval.',
    blocker: 'The active goal requests live-site deploys after verified milestones, but the Mochirii site is a separate repo and Vercel deploys or preview traffic can add usage.',
    approvalText: `I approve deploying the verified Mochirii web milestone that embeds ${externalGateSummary.gameUrl || `https://${flyApp}.fly.dev`} to the approved Vercel target after local checks, push, and PR/CI verification. I understand this may trigger builds, hosted traffic, logs, or usage.`,
    noCostFallback: 'Keep the game/site branches pushed and PR checks verified; leave the Mochirii live/preview deployment unchanged until deploy approval is granted.'
  });

  if (hasExternalFailure('Fly preview secret names')) {
    queue.push({
      id: 'fly-secret-update',
      provider: 'Fly.io',
      title: 'Set the missing Fly preview secret names for Alpha Preview Ready.',
      blocker: 'Fly is missing one or more preview runtime secret/config names in the latest external gate report.',
      approvalText: 'I approve setting the missing Fly secret names on mochi-social-game and understand this may restart hosted resources or add usage.',
      noCostFallback: 'Keep localhost-only preview checks and leave preview-live-gates red.'
    });
  }

  if (hasExternalFailure('Fly funded-chain secret names')) {
    queue.push({
      id: 'fly-funded-chain-secret-update',
      provider: 'Fly.io/Enjin Canary',
      title: 'Set funded-chain Fly secret names only after real Enjin Canary resources exist.',
      blocker: 'Fly funded-chain secrets are missing. This is expected red for Alpha Preview Ready while funded-chain work is deferred.',
      approvalText: 'I approve setting real funded-chain Fly secret names on mochi-social-game after Enjin Canary collection and Fuel Tank resources exist. I understand this may restart hosted resources or add usage.',
      noCostFallback: 'Leave ENJIN_COLLECTION_ID and ENJIN_FUEL_TANK_ID unset and keep funded-chain work deferred and absent from the player alpha.'
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

  if (hasExternalFailure('Live game contract')) {
    queue.push({
      id: 'fly-live-game-contract',
      provider: 'Fly.io',
      title: 'Run the hosted Fly game contract check after approval.',
      blocker: 'The Fly game URL exists, but the latest external gate report has not fetched the live game contract with hosted checks approved.',
      approvalText: `I approve the hosted Fly game contract check for ${externalGateSummary.gameUrl || `https://${flyApp}.fly.dev`} using MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true. I understand it may hit Fly resources and add usage.`,
      noCostFallback: 'Keep localhost-only proof and leave the Live game contract gate red.'
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
      noCostFallback: 'Keep Enjin readiness flags unset and use local fail-closed operator smoke only; keep funded-chain work absent from the player alpha.'
    });
  }

  return queue;
}

function formatLaneStatus(lane) {
  if (!lane) return 'not recorded';
  const failing = Array.isArray(lane.failingChecks) && lane.failingChecks.length ? ` failing=${lane.failingChecks.join(', ')}` : '';
  const missing = Array.isArray(lane.missingChecks) && lane.missingChecks.length ? ` missing=${lane.missingChecks.join(', ')}` : '';
  return `${lane.ok ? 'pass' : 'fail'}${failing}${missing}`;
}

function git(args, cwd = root) {
  const result = spawnSync('git', args, {
    cwd,
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
