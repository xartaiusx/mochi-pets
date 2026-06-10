import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const checks = [
  {
    file: 'package.json',
    includes: ['"secret-scan"', '"alpha:readiness"', '"alpha:local-acceptance"', '"alpha:load-smoke"', '"alpha:browser-presence"', '"alpha:enjin-operator-smoke"', '"alpha:external-gates"', '"smoke"']
  },
  {
    file: '.github/workflows/ci.yml',
    includes: ['npm run secret-scan', 'npm run alpha:readiness', 'npm run build']
  },
  {
    file: 'AGENTS.md',
    includes: ['no-real-value', 'mainnet is out of scope', 'Supabase schema', 'wallet daemon', 'docs/codex-external-ops.md']
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
      'Computer Use'
    ]
  },
  {
    file: 'docs/goals/mochi-social-alpha-rc.md',
    includes: ['Alpha RC Ready', 'Enjin Canary', 'static secret scans', 'Two browser tabs show player presence', 'npm run alpha:local-acceptance', 'npm run alpha:browser-presence', 'npm run alpha:enjin-operator-smoke']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'npm run alpha:browser-presence', 'npm run alpha:enjin-operator-smoke', 'Two-tab Presence Gate', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'no-real-value fallback ledger']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'alpha:browser-presence', 'alpha:enjin-operator-smoke', 'alpha:external-gates', 'Wallet Daemon', 'Stop at Alpha RC Ready', 'docs/codex-external-ops.md']
  },
  {
    file: 'docs/site-integration.md',
    includes: ['MOCHI_SOCIAL_AUTH', 'chain.operation_update', 'Hot inventory can only be credited after the Enjin state is `FINALIZED`', 'Fuel Tank sponsored Canary transactions', 'CreateTransaction(transaction: { createListing: ... })', '/integration/alpha/enjin/submit']
  },
  {
    file: 'docs/deployment.md',
    includes: ['RPG_SAVE_DIR=/data/saves', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'Wallet Daemon must run as a separate service with no inbound ports']
  },
  {
    file: 'docs/enjin-canary-alpha.md',
    includes: ['ENJIN_NETWORK="CANARY"', 'Fuel Tank', 'Only when state is `FINALIZED`', 'no inbound ports', 'submitHotToColdCertificateProof', 'submitFixedListingProof', 'pollEnjinTransaction', '/integration/alpha/enjin/submit', 'x-mochi-social-server-token', 'confirmNoRealValue=true', 'alpha:enjin-operator-smoke']
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
    file: 'apps/game/src/entries/express.ts',
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/action', '/integration/alpha/enjin/submit', 'requireGameServerToken', 'confirmNoRealValue', 'ALPHA_ACTION_TYPES.includes', 'configured-preview-stub']
  },
  {
    file: 'apps/game/tests/enjin-canary.test.ts',
    includes: ['keeps operation planners Canary-only', 'requires a Canary Fuel Tank', 'only credits hot inventory after finalized chain state', 'chain.operation_update', 'submits hot-to-cold certificate proof', 'submits fixed listing proof', 'polls Enjin finality']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['allowlistRequired', 'noRealValue', 'finalityRequired']
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: ['/integration/alpha/status', 'closed Enjin Canary alpha contract', 'fixed-price/no-auction', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['chain.withdraw_request', 'local-alpha-ledger', 'momo-canary-certificate', '/integration/alpha/enjin/submit', 'invalid_game_server_token', 'Open two browser tabs', 'configured-preview-stub']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['MOCHI_SOCIAL_LOAD_PLAYERS', 'local-alpha-ledger', 'simulated testers', 'HTTP alpha contract load smoke']
  },
  {
    file: 'scripts/check-alpha-browser-presence.mjs',
    includes: ['playwright-core', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE', 'Nearby: 2 testers', 'data-presence-label', 'canvas']
  },
  {
    file: 'scripts/check-enjin-operator-smoke.mjs',
    includes: ['/integration/alpha/enjin/submit', 'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN', 'MOCHI_SOCIAL_ENJIN_OPERATOR_ALLOW_LIVE_SMOKE', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_REQUEST_ID', 'MOCHI_SOCIAL_ENJIN_OPERATOR_SMOKE_TRANSACTION_UUID', 'enjin_canary_not_configured', 'invalid_game_server_token']
  },
  {
    file: 'scripts/check-alpha-external-gates.mjs',
    includes: ['MOCHI_SOCIAL_GAME_URL', 'MOCHI_SOCIAL_SITE_PREVIEW_URL', 'flyctl', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'ENJIN_COLLECTION_ID', 'MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED']
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
