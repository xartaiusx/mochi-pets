import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const checks = [
  {
    file: 'package.json',
    includes: ['"secret-scan"', '"alpha:readiness"', '"alpha:local-acceptance"', '"alpha:load-smoke"', '"alpha:browser-presence"', '"alpha:visual-snapshot"', '"alpha:enjin-operator-smoke"', '"alpha:built-server-smoke"', '"alpha:local-suite"', '"alpha:local-evidence"', '"alpha:report-hygiene"', '"alpha:external-gates"', '"alpha:operator-checklist"', '"alpha:sync-approval"', '"alpha:rc-audit"', '"smoke"']
  },
  {
    file: '.github/workflows/ci.yml',
    includes: ['npm run secret-scan', 'npm run alpha:readiness', 'npm run build']
  },
  {
    file: 'AGENTS.md',
    includes: ['no-real-value', 'mainnet is out of scope', 'Supabase schema', 'wallet daemon', 'docs/codex-external-ops.md', 'docs/no-cost-operations.md']
  },
  {
    file: 'docs/no-cost-operations.md',
    includes: ['No-Cost Operations Guardrail', 'Stop And Ask First', 'push branches that trigger CI', 'Fuel Tanks', 'hosted load tests', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'Current Cost Posture', 'alpha:sync-approval']
  },
  {
    file: 'docs/codex-external-ops.md',
    includes: [
      'Source Hierarchy',
      'Source Basis',
      'Secret Entry Protocol',
      'Preview Environment Matrix',
      'CI Gate Checklist',
      'Supabase Authority Matrix',
      'Enjin Canary State Machine',
      'Fuel Tank Dispatch Contract',
      'WebSocket And Presence Verification',
      'Discord Boundary',
      'Computer Use',
      'No-Cost Default'
    ]
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Alpha RC Ready', 'Enjin Canary', 'static secret scans', 'Two browser tabs show player presence', 'npm run alpha:local-acceptance', 'npm run alpha:browser-presence', 'npm run alpha:enjin-operator-smoke']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'npm run alpha:browser-presence', 'npm run alpha:visual-snapshot', 'npm run alpha:enjin-operator-smoke', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:operator-checklist', 'npm run alpha:sync-approval', 'npm run alpha:rc-audit', 'Two-tab Presence Gate', 'Visual Snapshot Gate', 'canvas movement response', 'observer-side canvas change', 'current local HEAD', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'reports/alpha-browser-presence.json', 'reports/alpha-visual-page.png', 'reports/alpha-local-evidence.md', 'reports/alpha-report-hygiene.json', 'no-real-value fallback ledger']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'alpha:browser-presence', 'alpha:enjin-operator-smoke', 'alpha:external-gates', 'alpha:operator-checklist', 'alpha:sync-approval', 'alpha:rc-audit', 'Wallet Daemon', 'Stop at Alpha RC Ready', 'docs/codex-external-ops.md', 'Current Private Gates']
  },
  {
    file: 'docs/site-integration.md',
    includes: ['MOCHI_SOCIAL_AUTH', 'chain.operation_update', 'Hot inventory can only be credited after the Enjin state is `FINALIZED`', 'Fuel Tank sponsored Canary transactions', 'CreateTransaction(transaction: { createListing: ... })', '/integration/alpha/enjin/submit']
  },
  {
    file: 'docs/deployment.md',
    includes: ['RPG_SAVE_DIR=/data/saves', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'Wallet Daemon must run as a separate service with no inbound ports', 'alpha:operator-checklist']
  },
  {
    file: 'docs/enjin-canary-alpha.md',
    includes: ['ENJIN_NETWORK="CANARY"', 'Fuel Tank', 'Only when state is `FINALIZED`', 'no inbound ports', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'pollEnjinTransaction', '/integration/alpha/enjin/submit', 'x-mochi-social-server-token', 'confirmNoRealValue=true', 'alpha:enjin-operator-smoke', 'Cloud Wallet Daemon Gate', 'AWS CloudFormation', 'KEY_PASS', 'PLATFORM_KEY']
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['noRealValue: true', "network: 'CANARY'", "'chain.operation_update'"]
  },
  {
    file: 'apps/game/src/integration/enjin-canary.ts',
    includes: ["network: 'CANARY'", 'fuelTank: config.fuelTankId', 'idempotencyKey: input.requestId', 'executeEnjinGraphqlPlan', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'createListing:', 'pollEnjinTransaction', 'normalizeEnjinTransactionState', 'canCreditHotInventory', 'config.fuelTankId']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['BRIDGE_EVENTS.auth', 'Authorization', 'momo-canary-certificate', 'chain.withdraw_request', 'data-presence-label', 'configured-preview-stub']
  },
  {
    file: 'apps/game/src/integration/supabase-edge-client.ts',
    includes: ['MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'x-mochi-social-server-token', 'ALPHA_EDGE_FUNCTIONS.action', 'JSON.stringify(action)']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/action', '/integration/alpha/enjin/submit', 'buildAlphaActionRequest', 'getSupabaseEdgeConfig', 'ledgerVersion: 1', "source: 'local-alpha-ledger'", "alphaStopPoint: 'alpha-rc-ready'", "chainNetwork: 'CANARY'", 'requireGameServerToken', 'confirmNoRealValue', 'ALPHA_ACTION_TYPES.includes', 'configured-preview-stub']
  },
  {
    file: 'apps/game/tests/enjin-canary.test.ts',
    includes: ['keeps operation planners Canary-only', 'requires a Canary Fuel Tank', 'only credits hot inventory after finalized chain state', 'chain.operation_update', 'submits hot-to-cold certificate proof', 'submits fixed listing proof', 'polls Enjin finality']
  },
  {
    file: 'apps/game/tests/enjin-operator-contract.test.ts',
    includes: ['allows finality polling without token id or amount fields', 'requires token id and amount for asset-moving submissions', 'requires fixed listing prices to be integer strings', 'keeps the no-real-value confirmation mandatory']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['allowlistRequired', 'noRealValue', 'finalityRequired']
  },
  {
    file: 'apps/game/tests/map-object-contract.test.ts',
    includes: ['Mochi town map object contract', 'runtimeEventPlacements', 'welcome-npc', 'token-chest', 'care-shrine', 'market-board', 'trade-post', 'canary-shrine', 'no-real-value Enjin Canary certificate request', 'Lantern Garden', '25 * 18']
  },
  {
    file: 'apps/game/tests/supabase-edge-client.test.ts',
    includes: ['scoped server token in a header only', 'not.toContain', 'SUPABASE_SERVICE_ROLE_KEY', 'mochi-social-alpha-action']
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: ['/integration/alpha/status', 'closed Enjin Canary alpha contract', 'fixed-price/no-auction', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['chain.withdraw_request', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'canvasMovement.changedAfterFirstTabMove=true', 'momo-canary-certificate', '/integration/alpha/enjin/submit', 'invalid_game_server_token', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['MOCHI_SOCIAL_LOAD_PLAYERS', 'local-alpha-ledger', 'ledgerVersion=1', 'alphaStopPoint', 'chainNetwork', 'simulated testers', 'HTTP alpha contract load smoke']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['playwright-core', 'createHash', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'reports/alpha-browser-presence.json', 'Nearby: 2 testers', 'data-presence-label', 'data-alpha-action="pet.care"', 'chain.withdraw_request', 'mochiSocial.alphaState', 'canvasMovement', 'changedAfterFirstTabMove', 'ArrowRight', 'ArrowDown', 'canvas']
  },
  {
    file: 'scripts/check-alpha-visual-snapshot.mjs',
    includes: ['playwright-core', 'alpha-visual-snapshot.json', 'alpha-visual-page.png', 'alpha-visual-canvas.png', 'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT', 'local-only by default', 'manualReview', 'createHash', 'canvas']
  },
  {
    file: 'scripts/check-enjin-operator-smoke.mjs',
    includes: ['/integration/alpha/enjin/submit', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID', 'enjin_canary_not_configured', 'invalid_game_server_token']
  },
  {
    file: 'scripts/check-built-server-smoke.mjs',
    includes: ['dist/server/express.js', 'readGitState', 'localHead', 'configured-preview-stub', 'invalid_game_server_token', 'enjin_canary_not_configured', 'Local-only built Express server smoke']
  },
  {
    file: 'scripts/check-alpha-local-suite.mjs',
    includes: ['No-cost localhost Alpha RC suite', 'readGitState', 'localHead', 'npmCommand', 'alpha:local-acceptance', 'alpha:load-smoke', 'alpha:browser-presence', 'alpha:visual-snapshot', 'alpha:enjin-operator-smoke', 'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'delete env.ENJIN_PLATFORM_TOKEN', 'reports/alpha-local-suite.json']
  },
  {
    file: 'scripts/check-alpha-local-evidence.mjs',
    includes: ['No-secret local Alpha RC evidence summary', 'alpha-local-evidence.json', 'alpha-local-evidence.md', 'same-suite evidence', 'built server smoke report', 'assertCurrentGitState', 'current HEAD', 'browser presence must prove observer-side movement', 'visual snapshot canvas PNG must be non-empty', 'built server smoke must prove tokened Enjin route fails closed', 'local-only']
  },
  {
    file: 'scripts/check-alpha-report-hygiene.mjs',
    includes: ['No-secret hygiene scan', 'alpha-report-hygiene.json', 'mochi-social-alpha-operator-next-steps.md', 'mochi-social-alpha-sync-approval.md', 'Unredacted local suite token', 'Wallet daemon password assignment', 'Supabase service role assignment']
  },
  {
    file: 'scripts/check-alpha-external-gates.mjs',
    includes: ['MOCHI_SOCIAL_GAME_URL', 'MOCHI_SOCIAL_SITE_PREVIEW_URL', 'flyctl', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'ENJIN_COLLECTION_ID', 'MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED']
  },
  {
    file: 'scripts/write-alpha-operator-checklist.mjs',
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-operator-next-steps.md', 'This file is intentionally no-secret', 'KEY_PASS=<private-wallet-daemon-passphrase>', 'PLATFORM_KEY=<private-enjin-platform-token>', 'npm run alpha:local-suite', 'npm run alpha:local-evidence', 'npm run alpha:report-hygiene', 'npm run alpha:external-gates']
  },
  {
    file: 'scripts/write-alpha-sync-approval.mjs',
    includes: ['Desktop', 'Creds', 'mochi-social-alpha-sync-approval.md', 'alpha-sync-approval.json', 'This file is intentionally no-secret', 'approvalsRequired', 'approvalActions', 'costRisk', 'noCostAlternative', 'Cost-Sensitive Action Matrix', 'GitHub Actions/PR checks', 'I approve pushing']
  },
  {
    file: 'scripts/check-alpha-rc-audit.mjs',
    includes: ['Mochi Social Alpha RC audit', 'reports/alpha-rc-audit.json', 'provider.external-gates', 'local.sync-approval-current', 'github.local-branch-sync', 'github.site-local-branch-sync', 'github.game-pr', 'github.site-pr', 'rev-list', '--porcelain', 'commandAt', 'Mochirii', 'mochi-social-alpha-sync-approval.md', 'mochirii-mochi-social-alpha-operator-next-steps.md']
  }
];

function read(file) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) {
    failures.push(`${file}: missing required file.`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

for (const check of checks) {
  const text = read(check.file);
  for (const snippet of check.includes) {
    if (!text.includes(snippet)) {
      failures.push(`${check.file}: expected snippet not found: ${snippet}`);
    }
  }
}

const manifestText = read('apps/game/src/integration/manifest.ts');
if (/network:\s*['"]ENJIN['"]/.test(manifestText)) {
  failures.push('apps/game/src/integration/manifest.ts: alpha manifest must not expose Enjin mainnet.');
}

const packageJson = JSON.parse(read('package.json') || '{}');
if (packageJson.engines?.node !== '>=22 <23') {
  failures.push('package.json: Node 22 engine contract changed.');
}

if (failures.length) {
  console.error('Mochi Social alpha readiness failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social alpha readiness checks passed.');
