import { describe, expect, it } from 'vitest';
import { isEnjinOperatorEnvelope } from '../src/integration/enjin-operator-contract';

describe('Enjin operator route contract', () => {
  it('allows finality polling without token id or amount fields', () => {
    expect(isEnjinOperatorEnvelope({
      operation: 'poll-transaction',
      requestId: 'operator-poll-123',
      playerId: 'operator-player-123',
      enjinTransactionUuid: 'enjin-transaction-123',
      confirmNoRealValue: true
    })).toBe(true);
  });

  it('requires token id and amount for asset-moving submissions', () => {
    expect(isEnjinOperatorEnvelope({
      operation: 'hot-to-cold-certificate',
      requestId: 'operator-hot-123',
      playerId: 'operator-player-123',
      confirmNoRealValue: true
    })).toBe(false);

    expect(isEnjinOperatorEnvelope({
      operation: 'cold-to-hot-burn',
      requestId: 'operator-cold-123',
      playerId: 'operator-player-123',
      tokenId: '7',
      amount: 1,
      confirmNoRealValue: true
    })).toBe(true);
  });

  it('requires fixed listing prices to be integer strings', () => {
    expect(isEnjinOperatorEnvelope({
      operation: 'fixed-listing',
      requestId: 'operator-listing-123',
      playerId: 'operator-player-123',
      tokenId: '7',
      amount: 1,
      confirmNoRealValue: true
    })).toBe(false);

    expect(isEnjinOperatorEnvelope({
      operation: 'fixed-listing',
      requestId: 'operator-listing-123',
      playerId: 'operator-player-123',
      tokenId: '7',
      amount: 1,
      price: '1000000000000000000',
      confirmNoRealValue: true
    })).toBe(true);
  });

  it('keeps the no-real-value confirmation mandatory', () => {
    expect(isEnjinOperatorEnvelope({
      operation: 'poll-transaction',
      requestId: 'operator-poll-123',
      playerId: 'operator-player-123',
      enjinTransactionUuid: 'enjin-transaction-123'
    })).toBe(false);
  });
});
