export type EnjinOperatorOperation = 'hot-to-cold-certificate' | 'cold-to-hot-burn' | 'fixed-listing' | 'poll-transaction';

export interface EnjinOperatorEnvelope {
  operation?: EnjinOperatorOperation;
  requestId?: string;
  playerId?: string;
  tokenId?: string;
  amount?: number;
  itemId?: string;
  price?: string;
  enjinTransactionUuid?: string;
  confirmNoRealValue?: boolean;
}

type EnjinOperatorBase = Required<Pick<EnjinOperatorEnvelope, 'operation' | 'requestId' | 'playerId' | 'confirmNoRealValue'>> & EnjinOperatorEnvelope;

export type EnjinTokenOperatorEnvelope = EnjinOperatorBase & {
  operation: 'hot-to-cold-certificate' | 'cold-to-hot-burn';
  tokenId: string;
  amount: number;
};

export type EnjinFixedListingOperatorEnvelope = EnjinOperatorBase & {
  operation: 'fixed-listing';
  tokenId: string;
  amount: number;
  price: string;
};

export type EnjinPollOperatorEnvelope = EnjinOperatorBase & {
  operation: 'poll-transaction';
  enjinTransactionUuid: string;
  tokenId?: string;
  amount?: number;
};

export type ValidEnjinOperatorEnvelope = EnjinTokenOperatorEnvelope | EnjinFixedListingOperatorEnvelope | EnjinPollOperatorEnvelope;

const ENJIN_OPERATOR_OPERATIONS: EnjinOperatorOperation[] = [
  'hot-to-cold-certificate',
  'cold-to-hot-burn',
  'fixed-listing',
  'poll-transaction'
];

export function isEnjinOperatorEnvelope(value: unknown): value is ValidEnjinOperatorEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as EnjinOperatorEnvelope;

  if (!hasBaseOperatorFields(candidate)) return false;

  if (candidate.operation === 'poll-transaction') {
    return typeof candidate.enjinTransactionUuid === 'string' && candidate.enjinTransactionUuid.length > 8;
  }

  if (!hasTokenAmountFields(candidate)) return false;

  if (candidate.operation === 'fixed-listing') {
    return typeof candidate.price === 'string' && /^\d+$/.test(candidate.price);
  }

  return candidate.operation === 'hot-to-cold-certificate' || candidate.operation === 'cold-to-hot-burn';
}

function hasBaseOperatorFields(candidate: EnjinOperatorEnvelope) {
  return (
    typeof candidate.operation === 'string' &&
    ENJIN_OPERATOR_OPERATIONS.includes(candidate.operation) &&
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 8 &&
    typeof candidate.playerId === 'string' &&
    candidate.playerId.length > 8 &&
    candidate.confirmNoRealValue === true
  );
}

function hasTokenAmountFields(candidate: EnjinOperatorEnvelope) {
  return (
    typeof candidate.tokenId === 'string' &&
    candidate.tokenId.length > 0 &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    candidate.amount > 0
  );
}
