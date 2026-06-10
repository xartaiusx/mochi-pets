import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = process.cwd();
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const outputPath = resolve(credsDir, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST || 'mochi-social-alpha-operator-next-steps.md');
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
const flyApp = process.env.MOCHI_SOCIAL_FLY_APP || 'mochi-social-game';
const flyRegion = process.env.MOCHI_SOCIAL_FLY_REGION || 'sea';
const flyVolume = process.env.MOCHI_SOCIAL_FLY_VOLUME || 'mochi_social_data';
const supabaseProjectRef = process.env.MOCHI_SOCIAL_SUPABASE_PROJECT_REF || 'dnxumaiooljdnbjvzbdc';
const generatedAt = new Date().toISOString();

const externalGateSummary = readExternalGateSummary();
const credentialFiles = listCredentialFiles();

await mkdir(credsDir, { recursive: true });
await writeFile(outputPath, renderChecklist(), 'utf8');
console.log(`Wrote no-secret Mochi Social alpha operator checklist: ${outputPath}`);

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
    return {
      present: true,
      ok: report.ok === true,
      checkedAt: report.checkedAt,
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

function renderChecklist() {
  const fileList = credentialFiles.length
    ? credentialFiles.map((file) => `- ${file}`).join('\n')
    : '- No matching local credential checklist files were found.';
  const gateList = externalGateSummary.failures.length
    ? externalGateSummary.failures.map((failure) => `- ${failure}`).join('\n')
    : '- No failing external gates were recorded in the last report.';

  return `# Mochi Social Alpha Operator Next Steps

Generated: ${generatedAt}

This file is intentionally no-secret. It lists names, commands, and private-entry placeholders only. Do not paste raw API tokens, wallet seed phrases, passphrases, payment details, or one-time codes into Codex chat, Git, PR comments, screenshots, or reports.

## Local Credential Files

${fileList}

## Latest External Gate Summary

- Report present: ${externalGateSummary.present ? 'yes' : 'no'}
- Last checked: ${externalGateSummary.checkedAt || 'not recorded'}
- Overall pass: ${externalGateSummary.ok ? 'yes' : 'no'}

Failing or missing gates:

${gateList}

## Fly Gate

Current target:

- App: ${flyApp}
- Region: ${flyRegion}
- Volume: ${flyVolume}
- Save mount: /data

Private operator step first:

1. Open https://fly.io/dashboard/artaius/billing.
2. Add payment information or buy credit privately.
3. Do not ask Codex to type or store payment details.

After billing is complete, run from the game repo:

\`\`\`powershell
$fly = Join-Path $env:USERPROFILE ".fly\\bin\\flyctl.exe"
if (!(Test-Path $fly)) { $fly = "flyctl" }
& $fly apps create ${flyApp}
& $fly volumes create ${flyVolume} --size 1 --region ${flyRegion} -a ${flyApp}
\`\`\`

Then set Fly secrets privately. The values come from the Supabase preview key file, the generated game bridge token file, the Enjin dashboard, and the Vercel preview origin:

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
4. The Canary Fuel Tank ID/address is recorded privately.
5. One managed wallet, one rare certificate operation, and one fixed listing proof are recorded through the game operator route.

Cloud Wallet Daemon path:

1. Keep one Enjin Platform API token ready. The dashboard may show that a token exists, but Codex should not read or print it.
2. Deploy the official Wallet Daemon as an outbound-only cloud signer. The Enjin docs describe AWS CloudFormation as the simplest managed path; use the current official template/link from the docs or Enjin settings.
3. Enter PLATFORM_KEY=<private-enjin-platform-token> and KEY_PASS=<private-wallet-daemon-passphrase> privately in the cloud secret fields.
4. Save the generated mnemonic/seed backup and passphrase in a password manager or encrypted vault only.
5. Verify Enjin Platform settings changes from Not Connected to Connected.

Do not put Wallet Daemon seed material, KEY_PASS, service-role keys, or payment details in this repo, Fly game secrets, Supabase browser env, PR comments, screenshots, or chat.

## Preview Verification After Fly And Enjin Gates

\`\`\`powershell
$env:MOCHI_SOCIAL_GAME_URL="https://${flyApp}.fly.dev"
$env:MOCHI_SOCIAL_SITE_PREVIEW_URL="https://<vercel-preview-host>"
$env:MOCHI_SOCIAL_SUPABASE_PROJECT_REF="${supabaseProjectRef}"
$env:MOCHI_SOCIAL_ENJIN_DAEMON_CONNECTED="true"
$env:MOCHI_SOCIAL_ENJIN_COLLECTION_READY="true"
$env:MOCHI_SOCIAL_ENJIN_FUEL_TANK_READY="true"
npm run smoke
npm run alpha:local-acceptance
$env:MOCHI_SOCIAL_LOAD_PLAYERS="25"; npm run alpha:load-smoke
npm run alpha:browser-presence
npm run alpha:enjin-operator-smoke
npm run alpha:external-gates
\`\`\`

Alpha RC Ready still requires the Mochirii preview to block non-testers, gate terms, forward auth, record feedback/ledger rows, and embed the Fly game URL.
`;
}
