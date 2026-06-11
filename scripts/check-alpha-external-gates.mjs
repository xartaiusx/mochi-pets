import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const flyApp = process.env.MOCHI_SOCIAL_FLY_APP || 'mochi-social-game';
const flyVolume = process.env.MOCHI_SOCIAL_FLY_VOLUME || 'mochi_social_data';
const supabasePreviewRef = process.env.MOCHI_SOCIAL_SUPABASE_PROJECT_REF || 'dnxumaiooljdnbjvzbdc';
const gameUrl = (process.env.MOCHI_SOCIAL_GAME_URL || process.env.MOCHI_SOCIAL_BASE_URL || '').replace(/\/+$/, '');
const sitePreviewUrl = (process.env.MOCHI_SOCIAL_SITE_PREVIEW_URL || '').replace(/\/+$/, '');
const siteRepoPath = resolve(root, process.env.MOCHI_SOCIAL_SITE_REPO_PATH || '../Mochirii');
const hostedChecksAllowed = process.env.MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS === 'true';

const previewFlySecrets = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_AUTH_REQUIRED',
  'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
  'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
  'RPG_ALLOWED_ORIGINS'
];

const fundedChainFlySecrets = [
  'ENJIN_PLATFORM_TOKEN',
  'ENJIN_COLLECTION_ID',
  'ENJIN_FUEL_TANK_ID'
];

const previewLiveGateNames = [
  'game PR',
  'site PR',
  'Supabase preview secrets',
  'Fly authentication',
  'Fly app',
  'Fly volume',
  'Fly preview secret names',
  'Live game URL',
  'Live game contract',
  'Site preview contract'
];

const fundedChainGateNames = [
  'Fly funded-chain secret names',
  'Enjin Canary operator readiness'
];

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'Mochi Social Alpha RC external gates. Values are name/status/digest-level only; no secrets are printed. Alpha Preview Ready uses preview-live-gates; full Alpha RC also requires funded-chain-gates.',
  flyApp,
  flyVolume,
  supabasePreviewRef,
  gameUrl: gameUrl || null,
  sitePreviewUrl: sitePreviewUrl || null,
  hostedChecksAllowed,
  lanes: null,
  git: readGitState(),
  checks: []
};

try {
  await run();
  report.lanes = summarizeGateLanes();
  report.ok = !report.checks.some((check) => check.status === 'fail');
  await writeReport();
  if (!report.ok) {
    console.error('Mochi Social external Alpha RC gates are not complete:');
    if (report.lanes) {
      console.error(`- preview-live-gates: ${report.lanes.previewLive.ok ? 'pass' : 'fail'} (${report.lanes.previewLive.failingChecks.join(', ') || 'none'})`);
      console.error(`- funded-chain-gates: ${report.lanes.fundedChain.ok ? 'pass' : 'fail'} (${report.lanes.fundedChain.failingChecks.join(', ') || 'none'})`);
    }
    for (const check of report.checks.filter((entry) => entry.status === 'fail')) {
      console.error(`- ${check.name}: ${check.message}`);
    }
    console.error(`Report: ${reportPath}`);
    process.exit(1);
  }
  console.log(`Mochi Social external Alpha RC gates passed. Report: ${reportPath}`);
} catch (error) {
  report.ok = false;
  report.error = error instanceof Error ? error.message : String(error);
  report.lanes = summarizeGateLanes();
  await writeReport();
  console.error('Mochi Social external Alpha RC gate check failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  checkGitHubPr('game PR', 'xartaiusx/mochi-social', '1', 'Verify Mochi Social');
  checkGitHubPr('site PR', 'Mochirii-Wushu/Mochirii', '258');
  checkSupabasePreviewSecrets();
  checkFly();
  await checkLiveGameContract();
  checkSiteContract();
  checkEnjinOperatorInputs();
}

function checkGitHubPr(name, repo, pr, requiredCheckName) {
  const result = command('gh', ['pr', 'view', pr, '--repo', repo, '--json', 'url,headRefOid,mergeStateStatus,statusCheckRollup']);
  if (!result.ok) {
    add('fail', name, 'GitHub PR state could not be read.', { stderr: result.stderr });
    return;
  }

  const data = parseJson(result.stdout);
  if (!data) {
    add('fail', name, 'GitHub PR JSON could not be parsed.');
    return;
  }

  const checks = Array.isArray(data.statusCheckRollup) ? data.statusCheckRollup : [];
  const failing = checks.filter((check) => {
    const conclusion = String(check.conclusion || check.state || '').toUpperCase();
    return !['SUCCESS', 'PASS'].includes(conclusion);
  });
  const required = requiredCheckName ? checks.find((check) => check.name === requiredCheckName || check.context === requiredCheckName) : null;
  const missingRequired = requiredCheckName && !required;
  const status = data.mergeStateStatus === 'CLEAN' && failing.length === 0 && !missingRequired ? 'pass' : 'fail';
  add(status, name, status === 'pass' ? 'PR is clean and all visible checks are green.' : 'PR is not clean, has failing checks, or is missing a required check.', {
    url: data.url,
    headRefOid: data.headRefOid,
    mergeStateStatus: data.mergeStateStatus,
    checkNames: checks.map((check) => check.name || check.context).filter(Boolean),
    failingChecks: failing.map((check) => check.name || check.context).filter(Boolean)
  });
}

function checkSupabasePreviewSecrets() {
  const result = command('supabase', ['secrets', 'list', '--project-ref', supabasePreviewRef]);
  if (!result.ok) {
    add('fail', 'Supabase preview secrets', 'Supabase preview secrets could not be listed by name/digest.', { stderr: result.stderr });
    return;
  }

  const missing = ['MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'MOCHI_SOCIAL_ALPHA_TERMS_VERSION'].filter((name) => !result.stdout.includes(name));
  add(missing.length ? 'fail' : 'pass', 'Supabase preview secrets', missing.length ? `Missing required secret names: ${missing.join(', ')}.` : 'Required Mochi Social preview secret names are present.', {
    projectRef: supabasePreviewRef,
    requiredNames: ['MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'MOCHI_SOCIAL_ALPHA_TERMS_VERSION']
  });
}

function checkFly() {
  const whoami = command(resolveFlyctl(), ['auth', 'whoami']);
  if (!whoami.ok) {
    add('fail', 'Fly authentication', 'flyctl is not authenticated.', { stderr: whoami.stderr });
    return;
  }
  add('pass', 'Fly authentication', 'flyctl is authenticated.', { account: sanitizeLine(whoami.stdout) });

  const status = command(resolveFlyctl(), ['status', '-a', flyApp]);
  if (!status.ok) {
    add('fail', 'Fly app', `${flyApp} is not available yet. If this mentions payment information, complete Fly billing privately before app creation.`, {
      stderr: sanitizeMultiline(status.stderr)
    });
    return;
  }
  add('pass', 'Fly app', `${flyApp} exists and status can be read.`);

  const volumes = command(resolveFlyctl(), ['volumes', 'list', '-a', flyApp]);
  const volumePresent = volumes.ok && volumes.stdout.includes(flyVolume);
  add(volumePresent ? 'pass' : 'fail', 'Fly volume', volumePresent ? `${flyVolume} exists.` : `${flyVolume} is missing or could not be listed.`, {
    requiredVolume: flyVolume,
    stderr: sanitizeMultiline(volumes.stderr)
  });

  const secrets = command(resolveFlyctl(), ['secrets', 'list', '-a', flyApp]);
  const missingPreviewSecrets = previewFlySecrets.filter((name) => !secrets.stdout.includes(name));
  add(secrets.ok && missingPreviewSecrets.length === 0 ? 'pass' : 'fail', 'Fly preview secret names', missingPreviewSecrets.length ? `Missing Fly preview secret/config names: ${missingPreviewSecrets.join(', ')}.` : 'Required Fly preview secret/config names are present.', {
    lane: 'preview-live-gates',
    requiredFlySecrets: previewFlySecrets,
    missingSecrets: missingPreviewSecrets
  });

  const missingFundedChainSecrets = fundedChainFlySecrets.filter((name) => !secrets.stdout.includes(name));
  add(secrets.ok && missingFundedChainSecrets.length === 0 ? 'pass' : 'fail', 'Fly funded-chain secret names', missingFundedChainSecrets.length ? `Missing funded-chain Fly secret names: ${missingFundedChainSecrets.join(', ')}. Leave these unset for Alpha Preview Ready when Enjin is configured-preview-stub; set only real Canary values for Alpha RC Ready.` : 'Required funded-chain Fly secret names are present.', {
    lane: 'funded-chain-gates',
    requiredFlySecrets: fundedChainFlySecrets,
    missingSecrets: missingFundedChainSecrets,
    previewStubAllowed: true
  });
}

async function checkLiveGameContract() {
  if (!gameUrl) {
    add('fail', 'Live game URL', 'Set MOCHI_SOCIAL_GAME_URL to the Fly game URL after deployment.');
    return;
  }
  add('pass', 'Live game URL', 'MOCHI_SOCIAL_GAME_URL is recorded for preview verification.', { gameUrl });
  if (requiresHostedApproval(gameUrl)) {
    add('fail', 'Live game contract', 'Hosted game contract checks require explicit approval via MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true.', {
      gameUrl,
      hostedChecksAllowed
    });
    return;
  }

  try {
    const health = await fetchJson(`${gameUrl}/healthz`);
    const manifest = await fetchJson(`${gameUrl}/integration/game-manifest.json`);
    const alpha = await fetchJson(`${gameUrl}/integration/alpha/status`);
    const ok = health.ok === true &&
      health.name === 'Mochi Social' &&
      manifest.name === 'Mochi Social' &&
      manifest.chain?.network === 'CANARY' &&
      manifest.alpha?.noRealValue === true &&
      alpha.chain?.network === 'CANARY' &&
      alpha.market?.auctions === false;
    add(ok ? 'pass' : 'fail', 'Live game contract', ok ? 'Live game runtime exposes the required Alpha RC contract.' : 'Live game runtime contract is missing required Alpha RC fields.', {
      gameUrl,
      healthName: health.name,
      manifestName: manifest.name,
      chainNetwork: manifest.chain?.network,
      noRealValue: manifest.alpha?.noRealValue,
      auctions: alpha.market?.auctions
    });
  } catch (error) {
    add('fail', 'Live game contract', 'Live game runtime could not be reached or did not return JSON.', { gameUrl, error: error instanceof Error ? error.message : String(error) });
  }
}

function checkSiteContract() {
  if (!gameUrl || !sitePreviewUrl) {
    add('fail', 'Site preview contract', 'Set MOCHI_SOCIAL_GAME_URL and MOCHI_SOCIAL_SITE_PREVIEW_URL after Fly/Vercel preview binding.');
    return;
  }
  if (requiresHostedApproval(gameUrl) || requiresHostedApproval(sitePreviewUrl)) {
    add('fail', 'Site preview contract', 'Hosted site/game contract checks require explicit approval via MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true.', {
      sitePreviewUrl,
      gameUrl,
      hostedChecksAllowed
    });
    return;
  }

  if (!existsSync(siteRepoPath)) {
    add('fail', 'Site preview contract', `Site repo path not found: ${siteRepoPath}`);
    return;
  }

  const result = command('npm', ['run', 'check:mochi-social-game-contract'], {
    cwd: siteRepoPath,
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      MOCHI_SOCIAL_GAME_CONTRACT_URL: gameUrl,
      MOCHI_SOCIAL_SITE_ORIGIN: new URL(sitePreviewUrl).origin
    }
  });
  add(result.ok ? 'pass' : 'fail', 'Site preview contract', result.ok ? 'Mochirii site contract check passed against the game URL and site origin.' : 'Mochirii site contract check failed.', {
    siteRepoPath,
    sitePreviewUrl,
    gameUrl,
    stderr: sanitizeMultiline(result.stderr),
    stdout: sanitizeMultiline(result.stdout)
  });
}

function checkEnjinOperatorInputs() {
  const fields = {
    ENJIN_PLATFORM_TOKEN: Boolean(process.env.ENJIN_PLATFORM_TOKEN),
    ENJIN_COLLECTION_ID: Boolean(process.env.ENJIN_COLLECTION_ID),
    ENJIN_FUEL_TANK_ID: Boolean(process.env.ENJIN_FUEL_TANK_ID),
    MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED: process.env.MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED === 'true',
    MOCHI_SOCIAL_ENJIN_COLLECTION_READY: process.env.MOCHI_SOCIAL_ENJIN_COLLECTION_READY === 'true',
    MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY: process.env.MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY === 'true'
  };
  const missing = Object.entries(fields).filter(([, value]) => !value).map(([key]) => key);
  add(missing.length ? 'fail' : 'pass', 'Enjin Canary operator readiness', missing.length ? `Missing operator-confirmed Enjin readiness flags/secrets: ${missing.join(', ')}. This is expected red for Alpha Preview Ready while Enjin remains configured-preview-stub.` : 'Enjin Canary operator inputs are present for live proof smoke.', {
    lane: 'funded-chain-gates',
    requiredFlags: Object.keys(fields),
    missing
  });
}

function summarizeGateLanes() {
  return {
    previewLive: summarizeGateLane('preview-live-gates', previewLiveGateNames),
    fundedChain: summarizeGateLane('funded-chain-gates', fundedChainGateNames),
    alphaPreviewReady: {
      ok: summarizeGateLane('preview-live-gates', previewLiveGateNames).ok,
      note: 'Alpha Preview Ready requires preview-live-gates only. Funded-chain gates may stay red while Enjin is configured-preview-stub.'
    },
    alphaRcReady: {
      ok: !report.checks.some((check) => check.status === 'fail'),
      note: 'Alpha RC Ready requires both preview-live-gates and funded-chain-gates.'
    }
  };
}

function summarizeGateLane(name, gateNames) {
  const checks = report.checks.filter((check) => gateNames.includes(check.name));
  const missingChecks = gateNames.filter((gateName) => !checks.some((check) => check.name === gateName));
  const failingChecks = checks.filter((check) => check.status === 'fail').map((check) => check.name);
  return {
    name,
    ok: checks.length > 0 && missingChecks.length === 0 && failingChecks.length === 0,
    checks: checks.map((check) => ({ name: check.name, status: check.status })),
    missingChecks,
    failingChecks
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function command(commandName, args, options = {}) {
  const result = spawnSync(commandName, args, {
    cwd: options.cwd || root,
    env: options.env || process.env,
    encoding: 'utf8',
    shell: Boolean(options.shell)
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function resolveFlyctl() {
  if (process.env.FLYCTL_PATH) return process.env.FLYCTL_PATH;
  const local = process.env.USERPROFILE ? resolve(process.env.USERPROFILE, '.fly/bin/flyctl.exe') : '';
  return local && existsSync(local) ? local : 'flyctl';
}

function parseJson(text) {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function add(status, name, message, evidence = {}) {
  report.checks.push({ status, name, message, evidence });
}

function requiresHostedApproval(url) {
  return Boolean(url) && !hostedChecksAllowed && !isLocalUrl(url);
}

function isLocalUrl(url) {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
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
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitizeMultiline(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitizeMultiline(result.stderr || result.error || 'git command failed'))
  };
}

function git(args) {
  return command('git', args);
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function sanitizeLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function sanitizeMultiline(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 2000);
}
