# Mochi Social Visual Polish Brief

This brief keeps the next polish pass focused on Alpha Preview Ready. It improves the tester doorway and first playable town without changing production, provider settings, funded-chain gates, or the game/site repository split.

## Source Basis

- Codex best practices and AGENTS.md guidance: https://developers.openai.com/codex/learn/best-practices and https://developers.openai.com/codex/guides/agents-md
- Vercel environment and preview behavior: https://vercel.com/docs/environment-variables and https://vercel.com/docs/deployments/environments
- Supabase Edge secrets and Auth user validation: https://supabase.com/docs/guides/functions/secrets and https://supabase.com/docs/reference/javascript/auth-getuser
- Enjin Platform, Fuel Tanks, and transaction state/finality arguments: https://docs.enjin.io/enjin-platform, https://docs.enjin.io/guides/platform/managing-users/using-fuel-tanks, and https://docs.enjin.io/api-reference/important-arguments
- Discord OAuth2 boundaries: https://docs.discord.com/developers/topics/oauth2
- WCAG 2.2 and sign-in form guidance: https://www.w3.org/WAI/WCAG22/quickref/ and https://web.dev/articles/sign-in-form-best-practices
- Game Accessibility Guidelines: https://gameaccessibilityguidelines.com/full-list/
- RPGJS and Tiled map conventions: https://rpgjs.dev/ and https://doc.mapeditor.org/en/stable/manual/layers/
- Browser WebSockets: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API

## Defaults

- Theme: Cozy Wushu.
- Stop point: Alpha Preview Ready visual polish, not Alpha RC Ready or production.
- Website target: Mochirii Vercel Preview `/games/mochi-social`.
- Game target: Fly-compatible RPGJS runtime and local playable town.
- Auth target: tester-password page first; strict Supabase/Discord allowlist remains supported.
- Chain target: Enjin Canary `configured-preview-stub`, no real value, no funded-chain gate clearing.

## Game Visual Direction

- The first screen should read as a social town, not a debug map.
- Landmarks should be recognizable: habitat nook, NPC welcome area, chest, market board, trade post, Canary shrine, path, greenery, signage, lantern-like accents, and soft shadows.
- Keep collision and map object IDs stable unless tests and docs are updated in the same change.
- Keep the asset pipeline reproducible through `apps/game/scripts/generate-assets.mjs`.
- Follow `docs/game-art-bible.md` for the visual target: HD Source Export + Crisp Pixel Kit + Town Readability First, with Cozy Wushu dusk lantern mood, jade/red timber palette, readable silhouettes, and strong interaction cues.
- Follow `docs/asset-pipeline-contract.md` for the source/runtime split. Runtime assets keep existing paths, filenames, and dimensions; source prompts and art-direction notes live separately.
- Follow `assets/source/game/hd-source-export.md` for the source-art intent behind exported runtime PNGs.
- Treat the Mochirii gate image as a fidelity and atmosphere reference, not as a mandate for photorealistic tiny sprites.

## Access And Provider Boundaries

- Vercel Deployment Protection or automation bypass is a hosting/preview access layer.
- The Mochirii tester-password gate is the player access layer for Alpha Preview Ready.
- Supabase/Discord allowlist is the stricter auth/admin layer.
- Supabase privileged writes stay in Edge Functions; browser/game code must never receive service-role keys, secret keys, Discord bot tokens, Enjin tokens, Wallet Daemon seeds, or passphrases.
- Discord OAuth remains website/Supabase auth only. Preserve `state`, exact redirect URI behavior, and no client secret exposure.
- Future Enjin work must use `network: CANARY`, transaction UUID/state tracking, `FINALIZED` finality before inventory credit, and no real-value copy. Preview-stub chain actions never settle inventory.

## HUD Direction

- Top status strip: title, guest/auth state, nearby testers, and no-real-value badge.
- Pet status card: active pet name, bond, growth, and care prompt.
- Bottom action bar: profile, friend, mood, care, inspect, wave, list, trade, Canary.
- Side/feed panel: local chat and recent action log.
- Preserve test hooks: `data-alpha-action`, `data-alpha-local-action`, `data-presence-label`, `data-chat-input`, and `data-alpha-feed`.
- Canary action copy must say preview stub, request staged, and no real value.

## Accessibility Requirements

- Use strong text contrast against art.
- Keep important text on semi-opaque backing.
- Ensure visible focus for fields and buttons.
- Do not rely on color alone for chain, market, error, auth, or trade states.
- Confirm desktop-first layout is usable at common laptop widths and that mobile fallback does not overlap.

## No-Cost Boundary

Local code, docs, generated assets, tests, builds, localhost visual checks, commits, and public-repo pushes are allowed. Do not deploy, redeploy, mutate provider settings, set hosted flags, run hosted checks, fund cENJ, create or fund Fuel Tanks, start signer-connected Wallet Daemon work, or submit Enjin transactions without fresh action-specific approval when the action can create real provider cost or mutate external state.
Vercel advanced deployment protection and similar provider features can add cost; do not enable them as part of visual polish.

## Acceptance

- Local checks pass: `npm run secret-scan`, `npm run alpha:readiness`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
- Browser checks still preserve two-tab presence, HUD actions, and no-real-value Canary stub behavior.
- `docs/asset-ledger.md` describes every generated asset, dimensions, role, source, license, and prompt/source note.
- The Mochirii visual brief documents the matching tester-gate design.
