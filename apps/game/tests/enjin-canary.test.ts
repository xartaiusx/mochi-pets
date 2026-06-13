import { describe, expect, it } from 'vitest';
import {
  buildChainOperationUpdateAction,
  buildColdToHotBurnMutation,
  buildCreateManagedWalletMutation,
  buildFixedListingMutation,
  buildGetTransactionQuery,
  buildGetManagedWalletQuery,
  buildHotToColdMintMutation,
  buildManagedWalletExternalId,
  canCreditHotInventory,
  enjinCanaryReady,
  executeEnjinGraphqlPlan,
  getEnjinCanaryConfig,
  isTerminalEnjinState,
  normalizeEnjinTransactionState,
  pollEnjinTransaction,
  submitColdToHotBurnProof,
  submitFixedListingProof,
  submitHotToColdCertificateProof
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
    expect(buildCreateManagedWalletMutation('player-1').query).toContain('CreateManagedWallet(externalId: $externalId)');
    expect(buildGetManagedWalletQuery('player-1').query).toContain('GetManagedWallet(network: CANARY, chain: MATRIX');
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
    expect(mintPlan.query).toContain('idempotencyKey: $idempotencyKey');
    expect(mintPlan.variables.idempotencyKey).toBe(input.requestId);
    expect(mintPlan.variables.fuelTank).toBe('tank-1');
    expect(burnPlan.variables.signerExternalId).toBe('mochi-social-alpha:player-1');
    expect(burnPlan.variables.idempotencyKey).toBe(input.requestId);
    expect(burnPlan.variables.fuelTank).toBe('tank-1');
    const listingPlan = buildFixedListingMutation({ ...input, price: '1000' }, config);
    expect(listingPlan.query).toContain('CreateTransaction(');
    expect(listingPlan.query).toContain('createListing:');
    expect(listingPlan.query).toContain('listingData: { type: FIXED_PRICE }');
    expect(listingPlan.query).not.toContain('AUCTION');
    expect(listingPlan.query).not.toContain('CreateListing(');
    expect(listingPlan.variables.idempotencyKey).toBe(input.requestId);
    expect(listingPlan.variables.signerExternalId).toBe('mochi-social-alpha:player-1');
    expect(listingPlan.variables.fuelTank).toBe('tank-1');
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
      itemId: 'lirabao-canary-certificate',
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

  it('executes Enjin GraphQL plans with bearer auth and blocks incomplete config', async () => {
    const config = readyConfig();
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init || {} });
      return jsonResponse({ data: { CreateManagedWallet: true } });
    };

    await executeEnjinGraphqlPlan(buildCreateManagedWalletMutation('player-1'), config, fetchImpl as typeof fetch);

    expect(calls[0].url).toBe('https://platform.canary.enjin.io/graphql');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    expect(JSON.parse(String(calls[0].init.body)).variables.externalId).toBe('mochi-social-alpha:player-1');
    await expect(executeEnjinGraphqlPlan(buildCreateManagedWalletMutation('player-1'), getEnjinCanaryConfig({}), fetchImpl as typeof fetch)).rejects.toThrow(/not ready/);
  });

  it('submits hot-to-cold certificate proof through managed wallet lookup and transaction update action', async () => {
    const seenQueries: string[] = [];
    const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}')) as { query: string };
      seenQueries.push(body.query);
      if (body.query.includes('CreateManagedWallet')) return jsonResponse({ data: { CreateManagedWallet: true } });
      if (body.query.includes('GetManagedWallet')) {
        return jsonResponse({ data: { GetManagedWallet: { externalId: 'mochi-social-alpha:player-1', publicKey: '0xabc' } } });
      }
      return jsonResponse({ data: { CreateTransaction: { uuid: 'tx-hot-cold', state: 'PENDING', extrinsicHash: null } } });
    };

    const action = await submitHotToColdCertificateProof({
      requestId: 'chain-request-1',
      playerId: 'player-1',
      tokenId: '7',
      amount: 1,
      itemId: 'lirabao-canary-certificate'
    }, readyConfig(), fetchImpl as typeof fetch);

    expect(seenQueries).toHaveLength(3);
    expect(action.type).toBe('chain.operation_update');
    expect(action.requestId).toBe('chain-request-1:enjin-submit');
    expect(action.payload.chainRequestId).toBe('chain-request-1');
    expect(action.payload.enjinTransactionUuid).toBe('tx-hot-cold');
    expect(action.payload.transactionState).toBe('PENDING');
  });

  it('submits cold-to-hot burn proof and polls Enjin finality', async () => {
    const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}')) as { query: string };
      if (body.query.includes('CreateManagedWallet')) return jsonResponse({ data: { CreateManagedWallet: true } });
      if (body.query.includes('GetManagedWallet')) {
        return jsonResponse({ data: { GetManagedWallet: { externalId: 'mochi-social-alpha:player-1', publicKey: '0xabc' } } });
      }
      if (body.query.includes('GetTransaction')) {
        return jsonResponse({ data: { GetTransaction: { uuid: 'tx-cold-hot', state: 'FINALIZED', extrinsicHash: '0x123' } } });
      }
      return jsonResponse({ data: { CreateTransaction: { uuid: 'tx-cold-hot', state: 'BROADCAST' } } });
    };

    const action = await submitColdToHotBurnProof({
      requestId: 'chain-request-2',
      playerId: 'player-1',
      tokenId: '7',
      amount: 1,
      itemId: 'lirabao-canary-certificate'
    }, readyConfig(), fetchImpl as typeof fetch);
    const finality = await pollEnjinTransaction('tx-cold-hot', readyConfig(), fetchImpl as typeof fetch);

    expect(action.payload.transactionState).toBe('BROADCAST');
    expect(finality.state).toBe('FINALIZED');
    expect(finality.extrinsicHash).toBe('0x123');
  });

  it('submits fixed listing proof as a Canary fixed-price transaction', async () => {
    const seenBodies: { query: string; variables: Record<string, unknown> }[] = [];
    const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}')) as { query: string; variables: Record<string, unknown> };
      seenBodies.push(body);
      if (body.query.includes('CreateManagedWallet')) return jsonResponse({ data: { CreateManagedWallet: true } });
      if (body.query.includes('GetManagedWallet')) {
        return jsonResponse({ data: { GetManagedWallet: { externalId: 'mochi-social-alpha:player-1', publicKey: '0xabc' } } });
      }
      return jsonResponse({ data: { CreateTransaction: { uuid: 'tx-listing', action: 'Marketplace.create_listing', state: 'PENDING' } } });
    };

    const action = await submitFixedListingProof({
      requestId: 'chain-listing-1',
      playerId: 'player-1',
      tokenId: '7',
      amount: 1,
      price: '1000000000000000000',
      itemId: 'lirabao-canary-certificate'
    }, readyConfig(), fetchImpl as typeof fetch);
    const listingBody = seenBodies.find((body) => body.query.includes('createListing:'));

    expect(listingBody?.query).toContain('network: CANARY');
    expect(listingBody?.query).toContain('listingData: { type: FIXED_PRICE }');
    expect(listingBody?.query).not.toContain('AUCTION');
    expect(listingBody?.variables.signerExternalId).toBe('mochi-social-alpha:player-1');
    expect(listingBody?.variables.fuelTank).toBe('tank-1');
    expect(listingBody?.variables.idempotencyKey).toBe('chain-listing-1');
    expect(action.type).toBe('chain.operation_update');
    expect(action.payload.chainRequestId).toBe('chain-listing-1');
    expect(action.payload.enjinTransactionUuid).toBe('tx-listing');
    expect(action.payload.transactionState).toBe('PENDING');
  });
});

function readyConfig() {
  return getEnjinCanaryConfig({
    ENJIN_PLATFORM_URL: 'https://platform.canary.enjin.io/graphql',
    ENJIN_PLATFORM_TOKEN: 'test-token',
    ENJIN_COLLECTION_ID: '123',
    ENJIN_FUEL_TANK_ID: 'tank-1',
    ENJIN_NETWORK: 'CANARY'
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
