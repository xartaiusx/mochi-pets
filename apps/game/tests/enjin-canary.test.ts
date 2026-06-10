import { describe, expect, it } from 'vitest';
import {
  buildChainOperationUpdateAction,
  buildColdToHotBurnMutation,
  buildCreateManagedWalletMutation,
  buildFixedListingMutation,
  buildGetTransactionQuery,
  buildHotToColdMintMutation,
  buildManagedWalletExternalId,
  canCreditHotInventory,
  enjinCanaryReady,
  getEnjinCanaryConfig,
  isTerminalEnjinState,
  normalizeEnjinTransactionState
} from '../src/integration/enjin-canary';

describe('Enjin Canary orchestration helpers', () => {
  it('defaults to Canary and is not ready without secrets/config ids', () => {
    const config = getEnjinCanaryConfig({});

    expect(config.network).toBe('CANARY');
    expect(enjinCanaryReady(config)).toBe(false);
  });

  it('keeps operation planners Canary-only even if a mainnet env value is present', () => {
    const config = getEnjinCanaryConfig({
      ENJIN_NETWORK: 'ENJIN',
      ENJIN_PLATFORM_TOKEN: 'test',
      ENJIN_COLLECTION_ID: '123'
    });

    expect(config.network).toBe('CANARY');
    expect(enjinCanaryReady(config)).toBe(false);
    expect(buildGetTransactionQuery('tx-1', config).query).toContain('network: CANARY');
  });

  it('requires a Canary Fuel Tank before reporting Enjin readiness', () => {
    expect(enjinCanaryReady(getEnjinCanaryConfig({
      ENJIN_PLATFORM_TOKEN: 'test',
      ENJIN_COLLECTION_ID: '123',
      ENJIN_NETWORK: 'CANARY'
    }))).toBe(false);

    expect(enjinCanaryReady(getEnjinCanaryConfig({
      ENJIN_PLATFORM_TOKEN: 'test',
      ENJIN_COLLECTION_ID: '123',
      ENJIN_FUEL_TANK_ID: 'tank-1',
      ENJIN_NETWORK: 'CANARY'
    }))).toBe(true);
  });

  it('builds deterministic managed wallet ids', () => {
    expect(buildManagedWalletExternalId('player-1')).toBe('mochi-social-alpha:player-1');
    expect(buildCreateManagedWalletMutation('player-1').variables.externalId).toBe('mochi-social-alpha:player-1');
  });

  it('builds idempotent hot/cold GraphQL operation plans', () => {
    const config = getEnjinCanaryConfig({
      ENJIN_PLATFORM_TOKEN: 'test',
      ENJIN_COLLECTION_ID: '123',
      ENJIN_FUEL_TANK_ID: 'tank-1',
      ENJIN_NETWORK: 'CANARY'
    });
    const input = {
      requestId: 'req-alpha-123',
      playerId: 'player-1',
      tokenId: '7',
      amount: 1,
      recipient: 'efRecipient'
    };

    expect(enjinCanaryReady(config)).toBe(true);
    const mintPlan = buildHotToColdMintMutation(input, config);
    const burnPlan = buildColdToHotBurnMutation(input, config);
    expect(mintPlan.idempotencyKey).toBe(input.requestId);
    expect(mintPlan.variables.fuelTank).toBe('tank-1');
    expect(burnPlan.variables.signerExternalId).toBe('mochi-social-alpha:player-1');
    expect(burnPlan.variables.fuelTank).toBe('tank-1');
    expect(buildFixedListingMutation({ ...input, price: '1000' }, config).variables.salt).toBe(input.requestId);
    expect(buildGetTransactionQuery('tx-1', config).variables.uuid).toBe('tx-1');
  });

  it('only credits hot inventory after finalized chain state', () => {
    expect(normalizeEnjinTransactionState('finalized')).toBe('FINALIZED');
    expect(canCreditHotInventory('PENDING')).toBe(false);
    expect(canCreditHotInventory('BROADCAST')).toBe(false);
    expect(canCreditHotInventory('FINALIZED')).toBe(true);
    expect(isTerminalEnjinState('FAILED')).toBe(true);
    expect(isTerminalEnjinState('BROADCAST')).toBe(false);
  });

  it('builds finality update actions for the Supabase ledger bridge', () => {
    const action = buildChainOperationUpdateAction({
      requestId: 'update-1',
      playerId: 'player-1',
      chainRequestId: 'withdraw-1',
      transactionState: 'FINALIZED',
      enjinTransactionUuid: 'tx-1',
      enjinListingId: 'listing-1',
      extrinsicHash: '0xabc',
      itemId: 'momo-canary-certificate',
      tokenId: '7',
      amount: 1
    });

    expect(action.type).toBe('chain.operation_update');
    expect(action.payload.chainNetwork).toBe('CANARY');
    expect(action.payload.transactionState).toBe('FINALIZED');
    expect(() => buildChainOperationUpdateAction({
      requestId: 'bad-1',
      playerId: 'player-1',
      chainRequestId: 'withdraw-1',
      transactionState: 'CONFUSED'
    })).toThrow(/Unsupported Enjin/);
  });
});
