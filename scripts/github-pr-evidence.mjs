import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function readLocalPullRequestEvidence(repo, selector, localHead = '') {
  const evidencePath = process.env.MOCHI_SOCIAL_GITHUB_PR_EVIDENCE_FILE || '';
  if (!evidencePath) {
    return { ok: false, status: 'not-configured', message: 'MOCHI_SOCIAL_GITHUB_PR_EVIDENCE_FILE is not set.' };
  }

  const absolutePath = resolve(evidencePath);
  if (!existsSync(absolutePath)) {
    return { ok: false, status: 'not-found', message: `GitHub PR evidence file was not found: ${absolutePath}` };
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(absolutePath, 'utf8'));
  } catch {
    return { ok: false, status: 'parse-failed', message: `GitHub PR evidence file could not be parsed: ${absolutePath}` };
  }

  const normalizedSelector = String(selector || '').trim();
  const candidates = collectEvidenceEntries(parsed)
    .map(normalizeEvidenceEntry)
    .filter((entry) => entry.repo === repo)
    .filter((entry) => evidenceMatches(entry, normalizedSelector, localHead));

  if (candidates.length === 0) {
    return { ok: false, status: 'not-found', message: `No local GitHub PR evidence matched ${repo} ${normalizedSelector || localHead || '<missing selector>'}.` };
  }

  if (candidates.length > 1) {
    return {
      ok: false,
      status: 'ambiguous',
      message: `Multiple local GitHub PR evidence entries matched ${repo} ${normalizedSelector || localHead}.`,
      prNumbers: candidates.map((entry) => entry.number).filter(Boolean)
    };
  }

  const data = candidates[0];
  data.localHeadMatchesPrHead = Boolean(localHead && data.headRefOid && localHead === data.headRefOid);
  data.evidencePath = absolutePath;
  return { ok: true, status: 'checked', data };
}

function collectEvidenceEntries(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.pullRequests)) return value.pullRequests;
  if (Array.isArray(value?.prs)) return value.prs;

  const entries = [];
  for (const [repo, repoEvidence] of Object.entries(value?.repositories || {})) {
    for (const entry of collectEvidenceEntries(repoEvidence)) {
      entries.push({ repo, ...entry });
    }
  }

  return entries;
}

function normalizeEvidenceEntry(entry) {
  const checks = Array.isArray(entry.statusCheckRollup)
    ? entry.statusCheckRollup
    : Array.isArray(entry.checks)
      ? entry.checks
      : [];

  return {
    number: entry.number,
    url: entry.url || entry.display_url || '',
    state: normalizeState(entry.state),
    repo: entry.repo || entry.repository || entry.repository_full_name || '',
    headRefName: entry.headRefName || entry.head || entry.branch || '',
    headRefOid: entry.headRefOid || entry.head_sha || entry.headSha || '',
    mergeStateStatus: normalizeMergeState(entry.mergeStateStatus || entry.mergeable_state),
    isDraft: entry.isDraft === true || entry.draft === true,
    title: entry.title || '',
    statusCheckRollup: checks.map(normalizeCheck),
    evidenceSource: entry.evidenceSource || 'local-github-pr-evidence-file'
  };
}

function evidenceMatches(entry, selector, localHead) {
  if (selector) {
    return String(entry.number || '') === selector ||
      entry.headRefName === selector ||
      entry.headRefOid === selector;
  }

  return Boolean(localHead && entry.headRefOid === localHead);
}

function normalizeCheck(entry) {
  const name = entry.name || entry.context || '';
  const conclusion = normalizeCheckState(entry.conclusion || entry.state || entry.status);
  return {
    name,
    context: entry.context || name,
    state: conclusion,
    conclusion
  };
}

function normalizeState(value) {
  const state = String(value || '').toUpperCase();
  if (state === 'OPEN' || state === 'CLOSED') return state;
  return state || 'UNKNOWN';
}

function normalizeMergeState(value) {
  const state = String(value || '').toUpperCase();
  if (state === 'CLEAN' || state === 'UNSTABLE' || state === 'HAS_HOOKS') return 'CLEAN';
  return state || 'UNKNOWN';
}

function normalizeCheckState(value) {
  const state = String(value || '').toUpperCase();
  if (state === 'SUCCESS') return 'SUCCESS';
  if (state === 'PASS' || state === 'NEUTRAL' || state === 'SKIPPED') return 'PASS';
  if (state === 'FAILURE' || state === 'ERROR' || state === 'FAILED') return 'FAILURE';
  return state || 'PENDING';
}
