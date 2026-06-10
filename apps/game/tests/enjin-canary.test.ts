import { describe, expect, it } from 'vitest';
import {
  buildColdToHotBurnMutation,
  buildFixedListingMutation,
  buildHotToColdMintMutation,
  buildManagedWalletExternalId,
  canCreditHotInventory,
  enjinCanaryReady,
  getEnjinCanaryConfig
} from '../src/integration/enjin-canary';

describe('Enjin Canary orchestration helpers', () => {
  it('defaults to Canary and is not ready without secrets/config ids', () => {
    const config = getEnjinCanaryConfig({});

    expect(config.network).toBe('CANARY');
    expect(enjinCanaryReady(config)).toBe(false);
  });

  it('builds deterministic managed wallet ids', () => {
    expect(buildManagedWalletExternalId('player-1')).toBe('mochi-social-alpha:player-1');
  });

  it('builds idempotent hot/cold GraphQL operation plans', () => {
    const config = getEnjinCanaryConfig({
      ENJIN_PLATFORM_TOKEN: 'test',
      ENJIN_COLLECTION_ID: '123',
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
    expect(buildHotToColdMintMutation(input, config).idempotencyKey).toBe(input.requestId);
    expect(buildColdToHotBurnMutation(input, config).variables.signerExternalId).toBe('mochi-social-alpha:player-1');
    expect(buildFixedListingMutation({ ...input, price: '1000' }, config).variables.salt).toBe(input.requestId);
  });

  it('only credits hot inventory after finalized chain state', () => {
    expect(canCreditHotInventory('PENDING')).toBe(false);
    expect(canCreditHotInventory('BROADCAST')).toBe(false);
    expect(canCreditHotInventory('FINALIZED')).toBe(true);
  });
});
