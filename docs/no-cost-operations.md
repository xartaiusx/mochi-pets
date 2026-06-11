# No-Cost Operations Guardrail

Mochi Social development is no-cost by default. Agents may inspect local files, run local tests, and read existing provider state, but must stop before any action that can add charges or increase usage on a connected account.

## Source Basis

- Fly.io bills usage-based infrastructure, and persistent volumes can accrue charges while created.
- Vercel paid plans and usage-based resources can create on-demand usage charges.
- Supabase paid plans include fixed subscription fees and variable usage fees.
- Enjin Fuel Tanks sponsor transaction fees from an on-chain pool, so funding or dispatching through a tank is cost-bearing even on a test workflow.
- GitHub Actions can consume metered minutes/storage depending on account, plan, runner, and repository settings.

## Default Allowed Actions

Allowed without extra approval:

- Read local files and edit repo docs/code.
- Run local-only commands such as `npm run secret-scan`, `npm run alpha:readiness`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run alpha:visual-snapshot`, `npm run alpha:visual-review`, `npm run alpha:local-suite`, `npm run alpha:local-evidence`, `npm run alpha:sync-approval`, and `npm run alpha:report-hygiene`.
- Read existing provider state with safe commands, such as `fly status`, `fly secrets list`, `gh pr view`, and dashboard status pages.
- Run smoke checks against `localhost`.
- Generate no-secret handoff files under `C:\Users\xtyty\Desktop\Creds`.
- Generate `npm run alpha:sync-approval` before requesting a push, CI rerun, hosted smoke, deploy, or provider mutation. The packet is not approval; it records the exact state, cost/usage risk, no-cost alternative, and approval text to review.

## Stop And Ask First

Ask for fresh, explicit user approval before:

- Creating, resizing, scaling, cloning, or deleting Fly apps, Machines, volumes, snapshots, or regions.
- Running hosted load tests or any `fly deploy`, `fly scale`, `fly volumes create`, `fly machine clone`, or command that changes hosted resources.
- Deploying to Vercel, changing Vercel plan/add-ons, enabling paid analytics, or triggering production/preview traffic tests.
- Creating Supabase projects/branches that may bill, upgrading plans, changing compute size, creating paid storage, or running heavy Edge/database load.
- Creating, funding, or dispatching Enjin Fuel Tanks; minting, burning, listing, or transferring any Enjin asset; requesting faucets; or submitting live chain proofs.
- Pushing branches, rerunning GitHub Actions, enabling branch protection checks, or creating workflows when that can consume Actions minutes/storage. Treat push branches that trigger CI as cost-bearing until approved.
- Running `npm run alpha:load-smoke` or browser presence checks against hosted URLs. Keep those local unless the user approves a hosted smoke.
- Setting `MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true`, `MOCHI_SOCIAL_LOAD_ALLOW_EDGE=true`, `MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true`, or `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` against hosted previews without explicit approval.
- Sending Discord messages, installing bots, changing OAuth apps, or enabling paid/community features.

## Approval Format

Before a cost-bearing action, state:

1. The exact account/provider.
2. The exact command or dashboard action.
3. Why it could add charges or usage.
4. The no-cost alternative, if one exists.
5. That Codex will not proceed without explicit approval for that action.

## Current Cost Posture

- Existing Fly app: `mochi-social-game`.
- Existing Fly region: `sjc`.
- Existing Fly volume: `mochi_social_data`.
- Treat the existing Fly machine and volume as already-provisioned resources that may accrue usage. Do not scale, redeploy, resize, or create more resources without approval.
- Enjin Wallet Daemon may remain a local operator process, but do not submit live Enjin operations or fund a Fuel Tank without approval.
- Prefer local Alpha RC checks until the user explicitly authorizes any hosted preview, chain, CI, or load-smoke step.
- `npm run alpha:external-gates` refuses hosted Fly/Vercel contract fetches unless `MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS=true` is set for an explicitly approved hosted verification run. Its ignored report records current Git state and `hostedChecksAllowed`, and `npm run alpha:rc-audit` rejects stale or pre-guard external gate evidence.
- Local no-cost commits that are not pushed can make `npm run alpha:rc-audit` fail at `github.local-branch-sync`. That is expected; do not push just to clear it unless the user explicitly approves the CI-triggering sync.
- Use `npm run alpha:sync-approval` after refreshing `npm run alpha:external-gates` and stamping a current `npm run alpha:rc-audit` report. It summarizes the unpushed commits, current external blockers, and cost-sensitive approval text before requesting approval.
