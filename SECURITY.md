# Security Policy

Please do not report security issues in public issues or pull requests.

## Reporting

Use GitHub private vulnerability reporting if available for this repository. If it is not available, contact a repository administrator privately and include:

- A concise description of the issue
- Affected route, build artifact, function, workflow, or Unity bridge behavior
- Reproduction steps
- Impact and whether any secret, account, tester, or member data may be exposed

## Scope

Security-sensitive areas include:

- Mochirii member sign-in and Unity authentication handoff
- The parent-to-game bridge for `/embed`
- Shared Lirabao state and saved character progress
- Environment variables and provider credentials
- GitHub Actions, deployment settings, and release artifacts
- No-real-value, no-market, no-trade, and no-funded-chain boundaries

Do not include real secrets, tokens, private member data, or exploit payloads beyond what is necessary to explain the issue.

## Current Hardening Baseline

- Unity service credentials and Supabase service-role keys must stay server-side.
- The browser and Unity WebGL build must receive only player-scoped runtime tokens.
- `MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true` makes deployable routes fail clearly when the Unity WebGL build is missing.
- Hosted checks, provider mutations, deployments, new paid resources, and live load tests require explicit approval before running.
- Run `npm run secret-scan` before security-sensitive changes.
