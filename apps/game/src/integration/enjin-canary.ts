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
  recipient?: string;
  signerExternalId?: string;
}

export function getEnjinCanaryConfig(env = process.env): EnjinCanaryConfig {
  return {
    platformUrl: env.ENJIN_PLATFORM_URL || 'https://platform.canary.enjin.io/graphql',
    platformToken: env.ENJIN_PLATFORM_TOKEN,
    network: (env.ENJIN_NETWORK === 'ENJIN' ? 'ENJIN' : 'CANARY') as EnjinNetwork,
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

export function buildHotToColdMintMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'hot-to-cold-mint',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToCold($recipient: String!, $collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
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
      amount: input.amount
    }
  };
}

export function buildColdToHotBurnMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'cold-to-hot-burn',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToHot($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $signerExternalId: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
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
      signerExternalId: input.signerExternalId || buildManagedWalletExternalId(input.playerId)
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

export function canCreditHotInventory(transactionState: string) {
  return transactionState === 'FINALIZED';
}
