# Repository Settings

These settings keep the public Mochi Social repository easy to review while the closed playtest stays focused on the shared Unity room.

## Public Profile

- Description: `Mochi Social Unity WebGL shared guild room for Mochirii's closed playtest.`
- Website: `https://mochirii.com/games/mochi-social`
- Default branch: `main`

## Merge Policy

- Prefer squash merges for feature branches.
- Keep merge commits available only when a release-style PR needs its branch history preserved.
- Keep rebase merges disabled unless the branch is intentionally linear and small.
- Enable update-branch support so stale PR branches can be brought current from the GitHub UI.

## Main Branch Rule

Protect `main` with:

- Require a pull request before merging.
- Require passing status checks before merging.
- Require the game CI check.
- Require CodeQL once the workflow has run successfully on `main`.
- Block force pushes.
- Block branch deletion.
- Include administrators unless an emergency rollback procedure is being used.

## Cost And Provider Boundary

These repository settings do not approve hosted deploys, provider secret changes, paid resources, live load tests, funded-chain work, or public launch. Those actions still need explicit approval at the time they are performed.
