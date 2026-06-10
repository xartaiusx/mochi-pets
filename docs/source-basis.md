# Source Basis

These are the credible sources used for the initial architecture.

- Codex best practices and AGENTS.md guidance: repo-local instructions, clear verification, and task decomposition.
- GitHub Docs: GitHub Flow, upstream remotes for forks, licensing, status checks, and protected branches.
- RPGJS v5 docs and package metadata: lightweight browser RPG/MMORPG structure, `client.ts`, `server.ts`, `standalone.ts`, and server adapter pattern.
- Vercel Docs: Vercel Functions are not the WebSocket game server; Vercel can consume the game URL from environment variables in the separate website repo.
- Fly.io Docs: Dockerfile deployment and persistent Fly Volumes for runtime save storage.
- Supabase Docs: browser auth sessions, JWT/access-token handling, `onAuthStateChange`, and server-side `getUser(jwt)` token validation.
- Enjin Docs: Canary testnet for proof-of-concept work, Platform GraphQL transaction creation, managed wallets, Fuel Tanks, Wallet Daemon signing, and finalized transaction state handling.

## Implementation Rule

When docs conflict with a local working package version, prefer the package version pinned in `apps/game/package.json` and update this note with the reason.
