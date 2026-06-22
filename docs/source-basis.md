# Source Basis

These are the credible sources used for the initial architecture.

- Repo maintenance guidance: local instructions, clear verification, and task decomposition.
- GitHub Docs: GitHub Flow, upstream remotes for forks, licensing, status checks, and protected branches.
- RPGJS v5 docs and package metadata: lightweight browser RPG/MMORPG structure, `client.ts`, `server.ts`, `standalone.ts`, and server adapter pattern.
- Vercel Docs: Vercel Functions are not the WebSocket game server; Vercel can consume the game URL from environment variables in the separate website repo.
- Fly.io Docs: Dockerfile deployment and persistent Fly Volumes for runtime save storage.
- Supabase Docs: browser auth sessions, JWT/access-token handling, `onAuthStateChange`, and server-side `getUser(jwt)` token validation.
- Unity Docs: Web builds, browser bridge scripting, Authentication, Cloud Save, Cloud Code, and Multiplayer Services for the shared-room runtime.

## Implementation Rule

When docs conflict with a local working package version, prefer the package version pinned in `apps/game/package.json` and update this note with the reason.
