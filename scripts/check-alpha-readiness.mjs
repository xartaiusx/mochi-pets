import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const checks = [
  {
    file: 'package.json',
    includes: ['"secret-scan"', '"alpha:readiness"', '"alpha:local-acceptance"', '"alpha:load-smoke"', '"smoke"']
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
    includes: ['Alpha RC Ready', 'Enjin Canary', 'static secret scans', 'Two browser tabs show player presence', 'npm run alpha:local-acceptance']
  },
  {
    file: 'docs/alpha-acceptance.md',
    includes: ['npm run alpha:local-acceptance', 'npm run alpha:load-smoke', 'Two-tab Presence Gate', 'no-real-value fallback ledger']
  },
  {
    file: 'docs/alpha-operator-handoff.md',
    includes: ['Tester Guide', 'Rollback', 'MOCHI_SOCIAL_LOAD_PLAYERS="25"', 'Wallet Daemon', 'Stop at Alpha RC Ready', 'docs/codex-external-ops.md']
  },
  {
    file: 'docs/site-integration.md',
    includes: ['MOCHI_SOCIAL_AUTH', 'chain.operation_update', 'Hot inventory can only be credited after the Enjin state is `FINALIZED`']
  },
  {
    file: 'docs/deployment.md',
    includes: ['RPG_SAVE_DIR=/data/saves', 'MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'Wallet Daemon must run as a separate service with no inbound ports']
  },
  {
    file: 'docs/enjin-canary-alpha.md',
    includes: ['ENJIN_NETWORK="CANARY"', 'Fuel Tank', 'Only when state is `FINALIZED`', 'no inbound ports']
  },
  {
    file: 'apps/game/src/integration/alpha-contract.ts',
    includes: ['noRealValue: true', "network: 'CANARY'", "'chain.operation_update'"]
  },
  {
    file: 'apps/game/src/integration/enjin-canary.ts',
    includes: ["network: 'CANARY'", 'fuelTank: config.fuelTankId', 'normalizeEnjinTransactionState', 'canCreditHotInventory']
  },
  {
    file: 'apps/game/src/integration/browser-bridge.ts',
    includes: ['BRIDGE_EVENTS.auth', 'Authorization', 'momo-canary-certificate', 'chain.withdraw_request', 'data-presence-label']
  },
  {
    file: 'apps/game/src/entries/express.ts',
    includes: ['/healthz', '/play', '/embed', '/integration/game-manifest.json', '/integration/alpha/action', 'ALPHA_ACTION_TYPES.includes']
  },
  {
    file: 'apps/game/tests/enjin-canary.test.ts',
    includes: ['keeps operation planners Canary-only', 'only credits hot inventory after finalized chain state', 'chain.operation_update']
  },
  {
    file: 'apps/game/tests/manifest.test.ts',
    includes: ['allowlistRequired', 'noRealValue', 'finalityRequired']
  },
  {
    file: 'apps/game/scripts/smoke.mjs',
    includes: ['/integration/alpha/status', 'closed Enjin Canary alpha contract', 'fixed-price/no-auction']
  },
  {
    file: 'scripts/check-local-alpha-acceptance.mjs',
    includes: ['chain.withdraw_request', 'local-alpha-ledger', 'momo-canary-certificate', 'Open two browser tabs']
  },
  {
    file: 'scripts/check-alpha-load-smoke.mjs',
    includes: ['MOCHI_SOCIAL_LOAD_PLAYERS', 'local-alpha-ledger', 'simulated testers', 'HTTP alpha contract load smoke']
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
