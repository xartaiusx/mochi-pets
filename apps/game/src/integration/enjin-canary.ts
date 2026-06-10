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

export interface FixedListingInput extends ChainOperationInput {
  price: string;
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

export interface EnjinGraphqlPlan {
  operation: string;
  idempotencyKey?: string;
  query: string;
  variables: Record<string, unknown>;
}

export interface EnjinManagedWallet {
  externalId: string;
  publicKey: string;
}

export interface EnjinSubmittedTransaction {
  uuid: string;
  state: EnjinTransactionState;
  extrinsicHash?: string;
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
  return Boolean(config.platformUrl && config.platformToken && config.network === 'CANARY' && config.collectionId && config.fuelTankId);
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
  CreateManagedWallet(externalId: $externalId)
}`.trim(),
    variables: {
      externalId: buildManagedWalletExternalId(playerId)
    }
  } satisfies EnjinGraphqlPlan;
}

export function buildGetManagedWalletQuery(playerId: string, config = getEnjinCanaryConfig()) {
  return {
    operation: 'get-managed-wallet',
    query: `
query MochiSocialGetManagedWallet($externalId: String!) {
  GetManagedWallet(network: ${config.network}, chain: MATRIX, externalId: $externalId) {
    publicKey
    externalId
  }
}`.trim(),
    variables: {
      externalId: buildManagedWalletExternalId(playerId)
    }
  } satisfies EnjinGraphqlPlan;
}

export function buildHotToColdMintMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'hot-to-cold-mint',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToCold($recipient: String!, $collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
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
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    }
  } satisfies EnjinGraphqlPlan;
}

export function buildColdToHotBurnMutation(input: ChainOperationInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'cold-to-hot-burn',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialMoveToHot($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $signerExternalId: String!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
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
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    }
  } satisfies EnjinGraphqlPlan;
}

export function buildFixedListingMutation(input: FixedListingInput, config = getEnjinCanaryConfig()) {
  return {
    operation: 'fixed-listing',
    idempotencyKey: input.requestId,
    query: `
mutation MochiSocialFixedListing($collectionId: BigInt!, $tokenId: BigInt!, $amount: BigInt!, $price: BigInt!, $signerExternalId: String!, $fuelTank: String!, $idempotencyKey: String!) {
  CreateTransaction(
    network: ${config.network}
    chain: MATRIX
    signerExternalId: $signerExternalId
    fuelTank: $fuelTank
    idempotencyKey: $idempotencyKey
    transaction: {
      createListing: {
        makeAssetId: { collectionId: $collectionId, tokenId: $tokenId }
        takeAssetId: { collectionId: 0, tokenId: 0 }
        amount: $amount
        price: $price
        usesWhitelist: false
        listingData: { type: FIXED_PRICE }
      }
    }
  ) {
    uuid
    action
    state
  }
}`.trim(),
    variables: {
      collectionId: config.collectionId,
      tokenId: input.tokenId,
      amount: input.amount,
      price: input.price,
      signerExternalId: input.signerExternalId || buildManagedWalletExternalId(input.playerId),
      fuelTank: config.fuelTankId,
      idempotencyKey: input.requestId
    }
  } satisfies EnjinGraphqlPlan;
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
  } satisfies EnjinGraphqlPlan;
}

export async function executeEnjinGraphqlPlan(
  plan: EnjinGraphqlPlan,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
) {
  assertEnjinCanaryReady(config);

  const response = await fetchImpl(config.platformUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.platformToken}`
    },
    body: JSON.stringify({
      query: plan.query,
      variables: plan.variables
    })
  });

  const body = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    throw new Error(`Enjin Platform ${plan.operation} failed with HTTP ${response.status}.`);
  }
  if (hasGraphqlErrors(body)) {
    throw new Error(`Enjin Platform ${plan.operation} failed: ${body.errors.map((error) => error.message).join('; ')}`);
  }
  return body;
}

export async function ensureManagedWallet(
  playerId: string,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
): Promise<EnjinManagedWallet> {
  await executeEnjinGraphqlPlan(buildCreateManagedWalletMutation(playerId), config, fetchImpl);
  const walletResponse = await executeEnjinGraphqlPlan(buildGetManagedWalletQuery(playerId, config), config, fetchImpl);
  return parseManagedWallet(walletResponse);
}

export async function submitHotToColdCertificateProof(
  input: ChainOperationInput,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
) {
  const wallet = await ensureManagedWallet(input.playerId, config, fetchImpl);
  const transactionResponse = await executeEnjinGraphqlPlan(
    buildHotToColdMintMutation({ ...input, recipient: input.recipient || wallet.publicKey }, config),
    config,
    fetchImpl
  );
  const transaction = parseSubmittedTransaction(transactionResponse);
  return buildChainOperationUpdateAction({
    requestId: `${input.requestId}:enjin-submit`,
    playerId: input.playerId,
    chainRequestId: input.requestId,
    transactionState: transaction.state,
    enjinTransactionUuid: transaction.uuid,
    extrinsicHash: transaction.extrinsicHash,
    itemId: input.itemId,
    tokenId: input.tokenId,
    amount: input.amount
  });
}

export async function submitColdToHotBurnProof(
  input: ChainOperationInput,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
) {
  await ensureManagedWallet(input.playerId, config, fetchImpl);
  const transactionResponse = await executeEnjinGraphqlPlan(buildColdToHotBurnMutation(input, config), config, fetchImpl);
  const transaction = parseSubmittedTransaction(transactionResponse);
  return buildChainOperationUpdateAction({
    requestId: `${input.requestId}:enjin-submit`,
    playerId: input.playerId,
    chainRequestId: input.requestId,
    transactionState: transaction.state,
    enjinTransactionUuid: transaction.uuid,
    extrinsicHash: transaction.extrinsicHash,
    itemId: input.itemId,
    tokenId: input.tokenId,
    amount: input.amount
  });
}

export async function submitFixedListingProof(
  input: FixedListingInput,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
) {
  await ensureManagedWallet(input.playerId, config, fetchImpl);
  const transactionResponse = await executeEnjinGraphqlPlan(buildFixedListingMutation(input, config), config, fetchImpl);
  const transaction = parseSubmittedTransaction(transactionResponse);
  return buildChainOperationUpdateAction({
    requestId: `${input.requestId}:enjin-submit`,
    playerId: input.playerId,
    chainRequestId: input.requestId,
    transactionState: transaction.state,
    enjinTransactionUuid: transaction.uuid,
    extrinsicHash: transaction.extrinsicHash,
    itemId: input.itemId,
    tokenId: input.tokenId,
    amount: input.amount
  });
}

export async function pollEnjinTransaction(
  enjinTransactionUuid: string,
  config = getEnjinCanaryConfig(),
  fetchImpl: typeof fetch = fetch
) {
  const response = await executeEnjinGraphqlPlan(buildGetTransactionQuery(enjinTransactionUuid, config), config, fetchImpl);
  return parseSubmittedTransaction(response, 'GetTransaction');
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

function assertEnjinCanaryReady(config: EnjinCanaryConfig) {
  if (!enjinCanaryReady(config)) {
    throw new Error('Enjin Canary is not ready. Configure Platform token, Canary collection, and Fuel Tank before submitting operations.');
  }
}

function hasGraphqlErrors(value: unknown): value is { errors: { message: string }[] } {
  const candidate = value as { errors?: unknown };
  return Array.isArray(candidate?.errors) && candidate.errors.some((error) => typeof (error as { message?: unknown }).message === 'string');
}

function responseData(value: unknown) {
  const candidate = value as { data?: unknown };
  if (!candidate?.data || typeof candidate.data !== 'object') {
    throw new Error('Enjin Platform response did not include data.');
  }
  return candidate.data as Record<string, unknown>;
}

function parseManagedWallet(value: unknown): EnjinManagedWallet {
  const data = responseData(value);
  const wallet = data.GetManagedWallet as Partial<EnjinManagedWallet> | null | undefined;
  if (!wallet?.externalId || !wallet.publicKey) {
    throw new Error('Enjin managed wallet lookup did not return publicKey and externalId.');
  }
  return {
    externalId: String(wallet.externalId),
    publicKey: String(wallet.publicKey)
  };
}

function parseSubmittedTransaction(value: unknown, fieldName = 'CreateTransaction'): EnjinSubmittedTransaction {
  const data = responseData(value);
  const transaction = data[fieldName] as { uuid?: unknown; state?: unknown; extrinsicHash?: unknown } | null | undefined;
  const state = normalizeEnjinTransactionState(String(transaction?.state || ''));
  if (!transaction?.uuid || !state) {
    throw new Error(`Enjin ${fieldName} response did not include a supported uuid/state pair.`);
  }
  return {
    uuid: String(transaction.uuid),
    state,
    extrinsicHash: transaction.extrinsicHash ? String(transaction.extrinsicHash) : undefined
  };
}
