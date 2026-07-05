# No-Cost Operations Guardrail

Mochi Pets development is no-cost by default. Agents may inspect local files, run local tests, and read existing provider state, but must stop before any action that can add charges or increase usage on a connected account.

## Source Basis

- Fly.io bills usage-based infrastructure, and persistent volumes can accrue charges while created.
- Vercel paid plans and usage-based resources can create on-demand usage charges.
- Supabase paid plans include fixed subscription fees and variable usage fees.
- Enjin Fuel Tanks sponsor transaction fees from an on-chain pool, so funding or dispatching through a tank is cost-bearing even on a test workflow.
- GitHub Actions can consume metered minutes/storage depending on account, plan, runner, and repository settings.

## Default Allowed Actions

Allowed without extra approval:

- Read local files and edit repo docs/code.
- Run local-only commands such as `npm run secret-scan`, `npm run alpha:readiness`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run alpha:unity-required-smoke`, `npm run alpha:responsive-gameplay`, `npm run alpha:local-site-iframe`, `npm run alpha:visual-snapshot`, `npm run alpha:visual-review`, `npm run alpha:manual-prompt-review`, `npm run alpha:wallet-daemon-check`, `npm run alpha:local-suite`, `npm run alpha:local-evidence`, `npm run alpha:local-evidence-self-test`, `npm run alpha:provider-preflight`, `npm run alpha:sync-approval`, `npm run alpha:preview-ready`, and `npm run alpha:report-hygiene`.
- Read existing provider state with safe commands, such as `fly status`, `fly secrets list`, `gh pr view`, and dashboard status pages.
- Run smoke checks against `localhost`.
- Generate no-secret handoff files under `C:\Users\xtyty\Desktop\Creds`.
- Generate `npm run alpha:sync-approval` before hosted smoke, deploy, provider mutation, funded-chain work, or any CI rerun that could create actual charges. The packet is not approval; it records the exact state, branch sync status, cost/usage risk, no-cost alternative, and provider approval text to review. Public-repo commits and pushes are allowed under the current user policy and should be followed by PR/CI verification.
- Queue a verified milestone deploy request in `npm run alpha:operator-checklist`, `npm run alpha:provider-preflight`, or `npm run alpha:sync-approval`. The queue may name `fly-verified-milestone-deploy` and `vercel-verified-milestone-deploy`, but it does not authorize Fly or Vercel mutation by itself.
- Implement local code/docs/tests for Alpha Preview Ready, including the deferred funded-chain guardrails, as long as no provider state is mutated.

## Stop And Ask First

Ask for fresh, explicit user approval before:

- Creating, resizing, scaling, cloning, or deleting Fly apps, Machines, volumes, snapshots, or regions.
- Running hosted load tests or any `fly deploy`, `fly scale`, `fly volumes create`, `fly machine clone`, or command that changes hosted resources.
- Deploying to Vercel, changing Vercel plan/add-ons, enabling paid analytics, or triggering production/preview traffic tests.
- Creating Supabase projects/branches that may bill, upgrading plans, changing compute size, creating paid storage, or running heavy Edge/database load.
- Creating, funding, or dispatching Enjin Fuel Tanks; minting, burning, listing, or transferring any Enjin asset; requesting faucets; or submitting live chain proofs.
- Rerunning GitHub Actions, enabling branch protection checks, or creating workflows only when the account/repo settings indicate the action can create actual charges. Public-repo branch pushes are allowed without a separate prompt under the current user policy, along with their ordinary PR checks; verify the resulting checks afterward.
- Running `npm run alpha:load-smoke` or browser presence checks against hosted URLs. Keep those local unless the user approves a hosted smoke.
- Setting `MOCHI_PETS_BROWSER_ALLOW_HOSTED_SMOKE=true`, `MOCHI_PETS_RESPONSIVE_ALLOW_HOSTED_SMOKE=true`, `MOCHI_PETS_RESPONSIVE_SITE_BASE_URL=<hosted-site-origin>`, `MOCHI_PETS_LOAD_ALLOW_EDGE=true`, `MOCHI_PETS_ACCEPTANCE_ALLOW_EDGE=true`, or `MOCHI_PETS_EXTERNAL_ALLOW_HOSTED_CHECKS=true` against hosted previews without explicit approval.
- Setting dummy `ENJIN_COLLECTION_ID`, dummy `ENJIN_FUEL_TANK_ID`, or fake Enjin readiness flags just to clear funded-chain gates.
- Sending Discord messages, installing bots, changing OAuth apps, or enabling paid/community features.

## Approval Format

Before a cost-bearing action, state:

1. The exact account/provider.
2. The exact command or dashboard action.
3. Why it could add charges or usage.
4. The no-cost alternative, if one exists.
5. That no maintainer workflow proceeds without explicit approval for that action.

## Current Cost Posture

- Existing Fly app: `mochi-pets-game`.
- Existing Fly region: `sjc`.
- Current contract-recovery config intentionally has no required Fly volume.
- Treat any existing Fly machine as already-provisioned infrastructure that may accrue usage. Do not scale, redeploy, resize, add volumes, or create more resources without approval.
- Enjin Wallet Daemon local binary checks may inspect file metadata, SHA256, and `--help` output only. A downloaded binary is not proof that a signer is running or that Enjin Platform is connected.
- Enjin Wallet Daemon may later run as a local or cloud operator process, but do not import wallets, print seeds, start a signer, submit live Enjin operations, or fund a Fuel Tank without approval and private operator handling.
- Prefer local Alpha RC checks until the user explicitly authorizes any hosted preview, chain, paid/quota-bearing CI, or load-smoke step that can create actual charges.
- Prefer Alpha Preview Ready work until the user explicitly authorizes funded-chain work. The funded-chain lane is expected red while funded-chain work remains deferred and absent from the player alpha.
- `npm run alpha:external-gates` refuses hosted Fly/Vercel contract fetches unless `MOCHI_PETS_EXTERNAL_ALLOW_HOSTED_CHECKS=true` is set for an explicitly approved hosted verification run. Its ignored report records current Git state and `hostedChecksAllowed`, and `npm run alpha:rc-audit` rejects stale or pre-guard external gate evidence.
- Local CLI installation is allowed only as no-provider tooling: the repo-pinned Supabase CLI may be installed with `npm install`, and Fly CLI may be kept under ignored `.local/tools/flyctl` or pointed to with `FLYCTL_PATH`. CLI presence is not provider approval; Supabase login tokens, Fly login, hosted reads, deployments, secret changes, and resource mutations still require the normal approval gates.
- `npm run alpha:preview-ready` reads ignored no-secret reports and exits red until branches are synced and approved hosted preview contract checks are recorded. It does not submit Enjin work and does not require funded-chain gates.
- Local no-cost commits that are not pushed can make `npm run alpha:rc-audit` fail at `github.local-branch-sync`. Under the current user policy, public-repo pushes are allowed; push the branch and verify PR/CI results afterward when branch sync is the remaining blocker.
- Use `npm run alpha:sync-approval` after refreshing `npm run alpha:external-gates` and stamping a current `npm run alpha:rc-audit` report. It summarizes branch sync state, current external blockers, verified milestone deploy queue state, and cost-sensitive provider approval text.

Legacy `MOCHI_SOCIAL_*` environment names may still appear in older scripts or reports. New docs, new checks, and new provider packets should use `MOCHI_PETS_*` unless they are explicitly documenting historical compatibility.
