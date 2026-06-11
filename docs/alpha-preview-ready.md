# Alpha Preview Ready

Alpha Preview Ready is the live-on-site stop point before full Alpha RC Ready. It lets allowlisted testers use Mochi Social through the Mochirii Vercel Preview while Enjin remains unfunded and visibly in `configured-preview-stub` mode.

## Preview Target

- Game runtime: Fly app `mochi-social-game`.
- Website doorway: Mochirii Vercel Preview route `/games/mochi-social`.
- Website public env: `NEXT_PUBLIC_MOCHI_SOCIAL_URL`.
- Supabase authority: Mochirii Edge Functions own allowlist, terms, action ledger, feedback, admin, and chain operation rows.
- Enjin: Canary only, visible unfunded preview stub until collection, Fuel Tank, Wallet Daemon signing, and cENJ funding are approved.

## Gate Lanes

Treat `provider.external-gates` as two lanes:

- `preview-live-gates`: Fly game URL, Vercel Preview embed, Supabase allowlist/terms/feedback, no-real-value labels, and hosted contract checks after explicit hosted-check approval.
- `funded-chain-gates`: Enjin collection ID, Fuel Tank ID, cENJ funding, Wallet Daemon signing, and finalized proof smoke. This lane is expected red until later approval.

Alpha Preview Ready can pass while funded-chain gates are red. Alpha RC Ready cannot pass until both lanes are green.

## No-Real-Value Chain Mode

- Do not set dummy `ENJIN_COLLECTION_ID` or `ENJIN_FUEL_TANK_ID`.
- Keep `ENJIN_NETWORK=CANARY`.
- Keep the Canary/certificate UI visible with clear `configured-preview-stub` messaging.
- Record chain requests as audit-only preview rows.
- Never credit inventory, cold inventory, market settlement, trade settlement, cashout, or player value from a chain request unless a real Enjin state reaches `FINALIZED`.

## Codex Prompt Templates

Use these when starting the next implementation pass:

```text
Build the next alpha feature against no-real-value Alpha Preview Ready. Keep Enjin visible as configured-preview-stub and do not clear funded-chain gates.
```

```text
Do not clear funded-chain gates unless cENJ, collection, Fuel Tank, and Wallet Daemon proof approval exists.
```

```text
Use Mochi Social for runtime/game changes and Mochirii for website, Supabase, allowlist, terms, feedback, and admin changes.
```

## Game-Design Acceptance

Before testers enter the Vercel Preview:

- Pet loop works: befriend, care, bond, growth, active pet status.
- HUD works: profile/pet status, chat, emote, market, trade, Canary request.
- Social loop works: local chat/emote and two-tab presence.
- Economy loop is no-real-value: fixed market proof and direct trade proof stay alpha/test labeled.
- Chain request stub works: visible Canary request records an audit-only request and explains `configured-preview-stub`.
- Visual/manual gates work: map prompt review covers NPC, chest, habitat/care, and first-screen composition.
- Asset ledger is current for any original or CC0 assets.

## Verification

Game repo local checks:

```powershell
npm run secret-scan
npm run alpha:readiness
npm run typecheck
npm run lint
npm test
npm run build
npm run alpha:local-suite
npm run alpha:local-evidence
npm run alpha:enjin-operator-smoke
```

Mochirii preview checks:

```powershell
npm run check:mochi-social-alpha
npm run check:mochi-social-game-contract
npm run smoke:mochi-social-alpha-edge
npm run check
cd apps/web
npm run lint
npm run build
```

Browser preview gates:

- Signed-out users are blocked.
- Signed-in non-testers are blocked.
- Allowlisted testers must accept terms.
- The iframe loads the Fly game.
- The parent sends only `MOCHI_SOCIAL_AUTH`.
- The chain request shows stub/no-real-value messaging.
- Feedback appears in the admin/audit flow.

## Funding Later

After Alpha Preview Ready, a separate approval can move to funded Alpha RC:

1. Fund the Wallet Daemon address with Canary cENJ.
2. Create and finalize `Mochi Social Alpha` collection.
3. Create and finalize a Canary Fuel Tank.
4. Set real `ENJIN_COLLECTION_ID` and `ENJIN_FUEL_TANK_ID` as Fly secrets.
5. Run approved live Enjin operator smoke.
6. Credit or settle only after `FINALIZED`.
