import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const externalGates = read('scripts/check-alpha-external-gates.mjs');
const syncApproval = read('scripts/write-alpha-sync-approval.mjs');
const previewReady = read('scripts/check-alpha-preview-ready.mjs');
const rcAudit = read('scripts/check-alpha-rc-audit.mjs');
const noCostDocs = read('docs/no-cost-operations.md');
const externalOpsDocs = read('docs/external-ops.md');

assertSnippets('external gates', externalGates, [
  "const previewFlySecrets = [",
  "'SUPABASE_URL'",
  "'SUPABASE_PUBLISHABLE_KEY'",
  "'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL'",
  "'MOCHI_SOCIAL_GAME_SERVER_TOKEN'",
  "'RPG_ALLOWED_ORIGINS'",
  "const fundedChainFlySecrets = [",
  "'ENJIN_PLATFORM_TOKEN'",
  "'ENJIN_COLLECTION_ID'",
  "'ENJIN_FUEL_TANK_ID'",
  "const previewLiveGateNames = [",
  "MOCHI_SOCIAL_PREVIEW_ENV_FILE",
  "readPreviewEnvFile",
  "urlFieldsRead",
  "'Live game contract'",
  "'Site preview contract'",
  "const fundedChainGateNames = [",
  "'Fly funded-chain secret names'",
  "'Enjin Canary operator readiness'",
  "Alpha Preview Ready requires preview-live-gates only. Funded-chain gates may stay red while Enjin is configured-preview-stub.",
  "Alpha RC Ready requires both preview-live-gates and funded-chain-gates."
]);

assertSnippets('sync approval', syncApproval, [
  "id: 'fly-funded-chain-secret-update'",
  "currentlyRequired: false",
  "Not required for Alpha Preview Ready",
  "noCostAlternative: 'Leave ENJIN_COLLECTION_ID and ENJIN_FUEL_TANK_ID unset so the runtime stays configured-preview-stub for Alpha Preview Ready.'",
  "id: 'fly-live-game-contract'",
  "MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=\"true\"",
  "Hosted contract checks fetch the Fly runtime"
]);

assertSnippets('preview ready', previewReady, [
  'Mochi Social Alpha Preview Ready local game audit',
  'Unity-first report proves the deployable local game runtime only',
  "fundedChainRequiredForPreview: false",
  "hostedChecksPerformed: false",
  "providerMutationPerformed: false",
  "preview.unity-verify",
  "preview.build-release",
  "preview.unity-required-smoke",
  "preview.load-smoke-report"
]);

assertSnippets('RC audit', rcAudit, [
  "'provider.external-gates'",
  "'preview-live-gates'",
  "'funded-chain-gates'",
  "'fly-funded-chain-secret-update'",
  "'fly-live-game-contract'"
]);

assertSnippets('no-cost docs', noCostDocs, [
  'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS',
  'Current Cost Posture',
  'funded-chain lane is expected red',
  'dummy `ENJIN_COLLECTION_ID`'
]);

assertSnippets('external ops docs', externalOpsDocs, [
  'Alpha Preview Ready Lane',
  'preview-live-gates',
  'funded-chain-gates',
  'Do not set dummy Enjin IDs',
  'No-Cost Default'
]);

assertArrayMembership(externalGates, 'previewLiveGateNames', [
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
], [
  'Fly funded-chain secret names',
  'Enjin Canary operator readiness'
]);

assertArrayMembership(externalGates, 'fundedChainGateNames', [
  'Fly funded-chain secret names',
  'Enjin Canary operator readiness'
], [
  'Live game contract',
  'Site preview contract'
]);

assertArrayMembership(externalGates, 'previewFlySecrets', [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_AUTH_REQUIRED',
  'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
  'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
  'RPG_ALLOWED_ORIGINS'
], [
  'ENJIN_COLLECTION_ID',
  'ENJIN_FUEL_TANK_ID'
]);

assertOrder('live game hosted approval before fetch', externalGates, [
  "if (requiresHostedApproval(gameUrl))",
  "const health = await fetchJson(`${gameUrl}/healthz`);"
]);

assertOrder('site hosted approval before site contract command', externalGates, [
  "if (requiresHostedApproval(gameUrl) || requiresHostedApproval(sitePreviewUrl))",
  "const result = command('npm', ['run', 'check:mochi-social-game-contract']"
]);

if (failures.length) {
  console.error('Mochi Social alpha gate contract checks failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social alpha gate contract checks passed.');

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file}: missing required file.`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

function assertSnippets(label, text, snippets) {
  for (const snippet of snippets) {
    if (!text.includes(snippet)) failures.push(`${label}: expected snippet not found: ${snippet}`);
  }
}

function assertArrayMembership(text, arrayName, required, forbidden) {
  const body = arrayBody(text, arrayName);
  if (!body) {
    failures.push(`${arrayName}: array body not found.`);
    return;
  }
  for (const value of required) {
    if (!body.includes(`'${value}'`) && !body.includes(`"${value}"`)) {
      failures.push(`${arrayName}: missing ${value}.`);
    }
  }
  for (const value of forbidden) {
    if (body.includes(`'${value}'`) || body.includes(`"${value}"`)) {
      failures.push(`${arrayName}: must not include ${value}.`);
    }
  }
}

function arrayBody(text, name) {
  const start = text.indexOf(`const ${name} = [`);
  if (start < 0) return '';
  const end = text.indexOf('];', start);
  if (end < 0) return '';
  return text.slice(start, end);
}

function assertOrder(label, text, snippets) {
  let cursor = -1;
  for (const snippet of snippets) {
    const next = text.indexOf(snippet, cursor + 1);
    if (next < 0) {
      failures.push(`${label}: expected snippet not found after previous check: ${snippet}`);
      return;
    }
    cursor = next;
  }
}
