const githubApiBase = 'https://api.github.com';

export async function readPublicPullRequest(repo, selector, localHead = '') {
  const normalizedSelector = String(selector || '').trim();
  if (!repo || !normalizedSelector) {
    return { ok: false, status: 'unavailable', message: 'repository and selector are required' };
  }

  const pr = /^\d+$/.test(normalizedSelector)
    ? await fetchPullRequestByNumber(repo, normalizedSelector)
    : await fetchPullRequestByBranch(repo, normalizedSelector);
  if (!pr.ok) return pr;

  const checks = await fetchCommitChecks(repo, pr.data.headRefOid);
  const data = {
    ...pr.data,
    statusCheckRollup: checks.ok ? checks.checks : [],
    checkReadStatus: checks.ok ? 'checked' : 'unavailable',
    checkReadError: checks.ok ? '' : checks.message,
    localHeadMatchesPrHead: Boolean(localHead && pr.data.headRefOid && localHead === pr.data.headRefOid)
  };
  return { ok: true, status: 'checked', data };
}

export async function readPublicOpenPullRequestBranches(repo) {
  const pulls = await fetchOpenPullRequests(repo);
  if (!pulls.ok) return pulls;
  return {
    ok: true,
    status: 'checked',
    branches: pulls.data
      .map((entry) => ({
        branch: String(entry.head?.ref || ''),
        number: entry.number,
        url: String(entry.html_url || ''),
        isDraft: entry.draft === true,
      }))
      .filter((entry) => entry.branch),
  };
}

async function fetchPullRequestByNumber(repo, number) {
  const response = await githubJson(`${githubApiBase}/repos/${repo}/pulls/${number}`);
  if (!response.ok) return response;
  return { ok: true, data: normalizePull(response.data) };
}

async function fetchPullRequestByBranch(repo, branch) {
  const pulls = await fetchOpenPullRequests(repo);
  if (!pulls.ok) return pulls;
  const matches = pulls.data.filter((entry) => entry.head?.ref === branch || entry.head?.label?.endsWith(`:${branch}`));
  if (matches.length === 0) {
    return { ok: false, status: 'not-found', message: `No open pull request was found for branch ${branch}.` };
  }
  if (matches.length > 1) {
    return {
      ok: false,
      status: 'ambiguous',
      message: `Multiple open pull requests were found for branch ${branch}.`,
      prNumbers: matches.map((entry) => entry.number).filter(Boolean),
    };
  }
  if (matches[0].number) {
    const detail = await fetchPullRequestByNumber(repo, matches[0].number);
    if (detail.ok) return detail;
  }
  return { ok: true, data: normalizePull(matches[0]) };
}

async function fetchOpenPullRequests(repo) {
  const response = await githubJson(`${githubApiBase}/repos/${repo}/pulls?state=open&per_page=100`);
  if (!response.ok) return response;
  return { ok: true, data: Array.isArray(response.data) ? response.data : [] };
}

async function fetchCommitChecks(repo, sha) {
  if (!sha) return { ok: false, message: 'PR head SHA is missing' };
  const statuses = await githubJson(`${githubApiBase}/repos/${repo}/commits/${sha}/status`);
  const checkRuns = await githubJson(`${githubApiBase}/repos/${repo}/commits/${sha}/check-runs?per_page=100`);
  if (!statuses.ok && !checkRuns.ok) {
    return { ok: false, message: `${statuses.message || ''} ${checkRuns.message || ''}`.trim() || 'GitHub checks could not be read' };
  }

  const statusEntries = Array.isArray(statuses.data?.statuses)
    ? statuses.data.statuses.map((entry) => ({
        name: entry.context || '',
        context: entry.context || '',
        state: normalizeStatusState(entry.state),
        conclusion: normalizeStatusState(entry.state),
      }))
    : [];
  const checkEntries = Array.isArray(checkRuns.data?.check_runs)
    ? checkRuns.data.check_runs.map((entry) => ({
        name: entry.name || '',
        context: entry.name || '',
        state: normalizeCheckConclusion(entry),
        conclusion: normalizeCheckConclusion(entry),
      }))
    : [];

  return { ok: true, checks: [...statusEntries, ...checkEntries] };
}

async function githubJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'mochi-social-alpha-local-audit',
      },
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: data?.message || `GitHub API returned HTTP ${response.status}`,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 'network-error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function normalizePull(entry) {
  return {
    number: entry.number,
    url: entry.html_url || '',
    state: String(entry.state || '').toUpperCase(),
    headRefName: entry.head?.ref || '',
    headRefOid: entry.head?.sha || '',
    mergeStateStatus: normalizeMergeState(entry.mergeable_state),
    isDraft: entry.draft === true,
    title: entry.title || '',
  };
}

function normalizeMergeState(value) {
  const state = String(value || '').toUpperCase();
  if (state === 'CLEAN' || state === 'UNSTABLE' || state === 'HAS_HOOKS') return 'CLEAN';
  return state || 'UNKNOWN';
}

function normalizeStatusState(value) {
  const state = String(value || '').toUpperCase();
  if (state === 'SUCCESS') return 'SUCCESS';
  if (state === 'FAILURE' || state === 'ERROR') return 'FAILURE';
  return state || 'PENDING';
}

function normalizeCheckConclusion(entry) {
  if (entry.status && entry.status !== 'completed') return 'PENDING';
  const conclusion = String(entry.conclusion || '').toUpperCase();
  if (conclusion === 'SUCCESS') return 'SUCCESS';
  if (conclusion === 'NEUTRAL' || conclusion === 'SKIPPED') return 'PASS';
  if (!conclusion) return 'PENDING';
  return conclusion;
}
