import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';

const root = process.cwd();
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_BRANCH_INVENTORY_JSON || 'reports/alpha-branch-inventory.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_BRANCH_INVENTORY_MD || 'reports/alpha-branch-inventory.md');
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
const protectedBranchNames = new Set([
  'main',
  'master',
  'develop',
  'development',
  'dev',
  'staging',
  'production',
  'release',
]);

const repos = [
  { id: 'game', label: 'Mochi Social game', path: root, required: true },
  { id: 'site', label: 'Mochirii site', path: siteRepoPath, required: false },
];

const failures = [];
const repoReports = repos.map(inspectRepo);
const report = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-destructive local branch inventory for Alpha Preview cleanup. This report identifies possible stale local branches only; it does not delete, prune, merge, or mutate Git history.',
  deletionPerformed: false,
  git: readGitState(root),
  repos: repoReports,
  failures,
};

await writeReports();

if (!report.ok) {
  console.error('Mochi Social branch inventory failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

const candidates = repoReports.reduce((total, repo) => total + repo.cleanupCandidates.length, 0);
console.log(`Mochi Social branch inventory OK (${candidates} local-safe cleanup candidate(s), no deletion performed).`);
console.log(`Report: ${reportPath}`);

function inspectRepo(repo) {
  if (!existsSync(repo.path)) {
    const message = `${repo.label} repo not found at ${repo.path}.`;
    if (repo.required) failures.push(message);
    return {
      ...repo,
      exists: false,
      ok: !repo.required,
      message,
      git: null,
      openPrRepository: null,
      openPrBranches: [],
      branches: [],
      cleanupCandidates: [],
      reviewOnly: [],
    };
  }

  const gitState = readGitState(repo.path);
  const mergedBranches = new Set(lines(git(['branch', '--format=%(refname:short)', '--merged', 'HEAD'], repo.path).stdout));
  const worktreeBranches = new Set(readWorktreeBranches(repo.path));
  const originRepository = readOriginRepository(repo.path);
  const openPr = readOpenPullRequestBranches(repo.path, originRepository);
  const openPrBranches = new Set(openPr.branches.map((entry) => entry.branch));
  const branchResult = git([
    'for-each-ref',
    '--format=%(refname:short)%00%(upstream:short)%00%(upstream:track)%00%(objectname)%00%(committerdate:iso8601)%00%(subject)',
    'refs/heads',
  ], repo.path);

  if (!branchResult.ok) failures.push(`${repo.label}: local branches could not be inspected.`);

  const branches = lines(branchResult.stdout).map((line) => parseBranch(line, {
    currentBranch: gitState.branch,
    mergedBranches,
    worktreeBranches,
    openPrBranches,
    openPrCheckReliable: openPr.status === 'checked',
  }));
  const cleanupCandidates = branches.filter((branch) => branch.localSafeCleanupCandidate);
  const reviewOnly = branches.filter((branch) => branch.reviewOnlyReasons.length > 0);

  return {
    id: repo.id,
    label: repo.label,
    path: pathForReport(repo.path),
    exists: true,
    ok: branchResult.ok,
    git: gitState,
    openPrRepository: openPr.repository,
    openPrStatus: openPr.status,
    openPrBranches: openPr.branches,
    worktreeBranches: [...worktreeBranches].sort(),
    branchCount: branches.length,
    branches,
    cleanupCandidates,
    reviewOnly,
  };
}

function parseBranch(line, context) {
  const [name = '', upstream = '', upstreamTrack = '', objectName = '', committedAt = '', subject = ''] = line.split('\0');
  const isCurrent = name === context.currentBranch;
  const inWorktree = context.worktreeBranches.has(name);
  const hasOpenPr = context.openPrBranches.has(name);
  const openPrCheckReliable = context.openPrCheckReliable;
  const protectedName = protectedBranchNames.has(name) || /^release[/-]/i.test(name);
  const mergedIntoHead = context.mergedBranches.has(name);
  const upstreamGone = /\[gone\]/i.test(upstreamTrack);
  const hasUpstream = Boolean(upstream);
  const reviewOnlyReasons = [];

  if (openPrCheckReliable && !isCurrent && !inWorktree && !protectedName && !hasOpenPr && mergedIntoHead && upstreamGone) {
    return {
      name,
      upstream,
      upstreamTrack,
      objectName,
      committedAt,
      subject: sanitize(subject),
      isCurrent,
      inWorktree,
      protectedName,
      hasOpenPr,
      mergedIntoHead,
      upstreamGone,
      hasUpstream,
      localSafeCleanupCandidate: true,
      reason: 'merged into current HEAD and upstream tracking branch is gone',
      reviewOnlyReasons,
    };
  }

  if (!isCurrent && !inWorktree && !protectedName && !hasOpenPr && mergedIntoHead) {
    reviewOnlyReasons.push(hasUpstream ? 'merged but upstream still exists' : 'merged local branch without upstream');
  }
  if (!isCurrent && !inWorktree && !protectedName && upstreamGone && !mergedIntoHead) {
    reviewOnlyReasons.push('upstream is gone but branch is not merged into current HEAD');
  }
  if (!openPrCheckReliable && !isCurrent && !inWorktree && !protectedName) {
    reviewOnlyReasons.push('open pull request state unavailable');
  }
  if (hasOpenPr) reviewOnlyReasons.push('open pull request branch');
  if (inWorktree) reviewOnlyReasons.push('branch is checked out in a worktree');
  if (protectedName) reviewOnlyReasons.push('protected branch name');

  return {
    name,
    upstream,
    upstreamTrack,
    objectName,
    committedAt,
    subject: sanitize(subject),
    isCurrent,
    inWorktree,
    protectedName,
    hasOpenPr,
    mergedIntoHead,
    upstreamGone,
    hasUpstream,
    localSafeCleanupCandidate: false,
    reason: '',
    reviewOnlyReasons,
  };
}

function readOpenPullRequestBranches(repoPath, repository) {
  if (!repository) {
    return {
      repository: null,
      status: 'unavailable',
      branches: [],
      error: 'origin GitHub repository could not be resolved',
    };
  }

  const result = spawnSync(commandForPlatform('gh'), ['pr', 'list', '--repo', repository, '--state', 'open', '--json', 'number,url,headRefName,isDraft'], {
    cwd: repoPath,
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) {
    return {
      repository,
      status: 'unavailable',
      branches: [],
      error: sanitize(result.stderr || result.error?.message || 'gh pr list failed'),
    };
  }

  try {
    const entries = JSON.parse(result.stdout || '[]');
    return {
      repository,
      status: 'checked',
      branches: entries.map((entry) => ({
        branch: String(entry.headRefName || ''),
        number: entry.number,
        url: String(entry.url || ''),
        isDraft: entry.isDraft === true,
      })).filter((entry) => entry.branch),
    };
  } catch (error) {
    return {
      repository,
      status: 'parse-failed',
      branches: [],
      error: sanitize(error instanceof Error ? error.message : String(error)),
    };
  }
}

function readOriginRepository(repoPath) {
  const result = git(['remote', 'get-url', 'origin'], repoPath);
  if (!result.ok) return null;
  return repositoryFromRemoteUrl(firstLine(result.stdout));
}

function repositoryFromRemoteUrl(value) {
  const remote = String(value || '').trim();
  const githubMatch = remote.match(/github\.com[/:]([^/\s:]+)\/([^/\s]+?)(?:\.git)?$/i);
  if (!githubMatch) return null;
  const owner = githubMatch[1];
  const repo = githubMatch[2].replace(/\.git$/i, '');
  return owner && repo ? `${owner}/${repo}` : null;
}

function readWorktreeBranches(repoPath) {
  const result = git(['worktree', 'list', '--porcelain'], repoPath);
  if (!result.ok) return [];
  return lines(result.stdout)
    .filter((line) => line.startsWith('branch refs/heads/'))
    .map((line) => line.slice('branch refs/heads/'.length));
}

function readGitState(repoPath) {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath);
  const localHead = git(['rev-parse', 'HEAD'], repoPath);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repoPath);
  const status = git(['status', '--porcelain'], repoPath);
  return {
    branch: branch.ok ? firstLine(branch.stdout) : '',
    localHead: localHead.ok ? firstLine(localHead.stdout) : '',
    upstream: upstream.ok ? firstLine(upstream.stdout) : '',
    dirty: status.ok ? lines(status.stdout).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, status]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed')),
  };
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error?.message || '',
  };
}

function commandForPlatform(command) {
  if (process.platform === 'win32' && command === 'gh') return 'gh.exe';
  return command;
}

function lines(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function firstLine(value) {
  return lines(value)[0] || '';
}

function pathForReport(value) {
  const absolute = resolve(value);
  return absolute.startsWith(root)
    ? absolute.slice(root.length + 1).replace(/\\/g, '/')
    : absolute.replace(/\\/g, '/');
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}

async function writeReports() {
  await mkdir(dirname(reportPath), { recursive: true });
  await mkdir(dirname(reportMdPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(reportMdPath, renderMarkdown(report), 'utf8');
}

function renderMarkdown(data) {
  const linesOut = [
    '# Mochi Social Branch Inventory',
    '',
    'This report is no-destructive. It does not delete, prune, merge, or mutate Git history.',
    '',
    `- Status: ${data.ok ? 'ok' : 'failed'}`,
    `- Checked at: ${data.checkedAt}`,
    '',
  ];

  for (const repo of data.repos) {
    linesOut.push(`## ${repo.label}`, '');
    if (!repo.exists) {
      linesOut.push(`- Missing: ${repo.path}`, '');
      continue;
    }
    linesOut.push(`- Path: ${repo.path}`);
    linesOut.push(`- Branch: ${repo.git?.branch || 'unknown'}`);
    linesOut.push(`- Open PR repository: ${repo.openPrRepository || 'unresolved'}`);
    linesOut.push(`- Open PR check: ${repo.openPrStatus}`);
    linesOut.push(`- Branches: ${repo.branchCount}`);
    linesOut.push(`- Local-safe cleanup candidates: ${repo.cleanupCandidates.length}`);
    linesOut.push('');
    if (repo.cleanupCandidates.length) {
      linesOut.push('| Branch | Upstream | Reason |');
      linesOut.push('| --- | --- | --- |');
      for (const branch of repo.cleanupCandidates) {
        linesOut.push(`| ${branch.name} | ${branch.upstream || 'none'} | ${branch.reason} |`);
      }
      linesOut.push('');
    }
    if (repo.reviewOnly.length) {
      linesOut.push('Review-only branches:');
      for (const branch of repo.reviewOnly) {
        linesOut.push(`- ${branch.name}: ${branch.reviewOnlyReasons.join(', ')}`);
      }
      linesOut.push('');
    }
  }

  if (data.failures.length) {
    linesOut.push('## Failures', '', ...data.failures.map((failure) => `- ${failure}`), '');
  }

  return `${linesOut.join('\n')}\n`;
}
