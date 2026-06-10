export type EnjinNetwork = 'CANARY' | 'ENJIN';

export interface EnjinCanaryConfig {
  platformUrl: string;
  platformToken?: string;
  network: EnjinNetwork;
  collectionId?: string;
  fuelTankId?: string;
}

export interface ChainOperationInput {
  requestId: string;
  playerId: string;
  tokenId: string;
  amount: number;
  itemId?: string;
  recipient?: string;
  signerExternalId?: string;
}

export type EnjinTransactionState = 'PENDING' | 'BROADCAST' | 'FINALIZED' | 'FAILED' | 'ABANDONED' | 'TIMEOUT';

export interface ChainOperationUpdateInput {
  requestId: string;
  playerId: string;
  chainRequestId: string;
  transactionState: string;
  enjinTransactionUuid?: string;
  enjinListingId?: string;
  extrinsicHash?: string;
  itemId?: string;
  tokenId?: string;
  amount?: number;
}

export function getEnjinCanaryConfig(env = process.env): EnjinCanaryConfig {
  return {
    platformUrl: env.ENJIN_PLATFORM_URL || 'https://platform.canary.enjin.io/graphql',
    platformToken: env.ENJIN_PLATFORM_TOKEN,
    network: 'CANARY',
    collectionId: env.ENJIN_COLLECTION_ID,
    fuelTankId: env.ENJIN_FUEL_TANK_ID
  };
}

export function enjinCanaryReady(config = getEnjinCanaryConfig()) {
  return Boolean(config.platformUrl && config.platformToken && config.network === 'CANARY' && config.collectionId);
}

export function buildManagedWalletExternalId(playerId: string) {
  return `mochi-social-alpha:${playerId}`;
}

export function buildCreateManagedWalletMutation(playerId: string) {
  return {
    operation: 'create-managed-wallet',
    idempotencyKey: buildManagedWalletExternalId(playerId),
    query: `
mutation MochiSocialCreateManagedWallet($externalId: String!) {
  CreateManagedWallet(externalId: $externalId) {
    id
    account {
      publicKey
      address
    }
  }
}`.trim(),
    variables: {
      externalId: buildManagedWalletExternalId(playerId)
    }
  };
}

export function buildHotToColdMintMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'hot-to-cold-mint',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToCold($recipient: String!, $collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $fuelTank: String) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    fuelTank: $fuelTank
    transaction: {
      mintToken: {
        recipient: $recipient
        collectionId: $collectionId
        tokenId: $tokenId
        amount: $amount
      }
    }
  ) {
    uuid
    state
  }
}`.trim(),
    variables: {
      recipient: input.recipient,
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      fuelTank: config.fuelTankId
    }
  };
}

export function buildColdToHotBurnMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'cold-to-hot-burn',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToHot($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $signerExternalId: String!, $fuelTank: String) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
    fuelTank: $fuelTank
    transaction: {
      burnToken: {
        collectionId: $collectionId
        tokenId: $tokenId
        amount: $amount
        removeTokenStorage: false
      }
    }
  ) {
    uuid
    state
  }
}`.trim(),
    variables: {
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      signerExternalId: input.signerExternalId || buildManagedWalletExternalId(input.playerId),
      fuelTank: config.fuelTankId
    }
  };
}

export function buildFixedListingMutation(input: ChainOperationInput & { price: string }, config = getEnjinCanaryConfig()) {
  return {
    operation: 'fixed-listing',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialFixedListing($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $price: BigInt!, $salt: String!) {
  CreateListing(
    makeAssetId: { collectionId: $collectionId, tokenId: { integer: $tokenId } }
    takeAssetId: { collectionId: 0, tokenId: { integer: 0 } }
    amount: $amount
    price: $price
    salt: $salt
    listingData: { type: FIXED_PRICE }
  ) {
    id
    state
  }
}`.trim(),
    variables: {
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      price: input.price,
      salt: input.requestId
    }
  };
}

export function buildGetTransactionQuery(enjinTransactionUuid: string, config = getEnjinCanaryConfig()) {
  return {
    operation: 'get-transaction',
    query: `
query MochiSocialGetTransaction($uuid: String!) {
  GetTransaction(network: ${config.network}, uuid: $uuid) {
    uuid
    state
    extrinsicHash
  }
}`.trim(),
    variables: {
      uuid: enjinTransactionUuid
    }
  };
}

export function normalizeEnjinTransactionState(state: string): EnjinTransactionState | null {
  const normalized = state.trim().toUpperCase();
  if (['PENDING', 'BROADCAST', 'FINALIZED', 'FAILED', 'ABANDONED', 'TIMEOUT'].includes(normalized)) {
    return normalized as EnjinTransactionState;
  }
  return null;
}

export function buildChainOperationUpdateAction(input: ChainOperationUpdateInput) {
  const state = normalizeEnjinTransactionState(input.transactionState);
  if (!state) {
    throw new Error(`Unsupported Enjin transaction state: ${input.transactionState}`);
  }

  return {
    requestId: input.requestId,
    type: 'chain.operation_update',
    playerId: input.playerId,
    payload: {
      chainRequestId: input.chainRequestId,
      transactionState: state,
      enjinTransactionUuid: input.enjinTransactionUuid,
      enjinListingId: input.enjinListingId,
      extrinsicHash: input.extrinsicHash,
      itemId: input.itemId,
      tokenId: input.tokenId,
      amount: input.amount,
      noRealValue: true,
      chainNetwork: 'CANARY'
    }
  } as const;
}

export function canCreditHotInventory(transactionState: string) {
  return normalizeEnjinTransactionState(transactionState) === 'FINALIZED';
}

export function isTerminalEnjinState(transactionState: string) {
  const state = normalizeEnjinTransactionState(transactionState);
  return state === 'FINALIZED' || state === 'FAILED' || state === 'ABANDONED' || state === 'TIMEOUT';
}
