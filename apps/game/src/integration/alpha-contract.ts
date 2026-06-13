export const ALPHA_FEATURES = {
  alpha: {
    allowlistRequired: true,
    termsRequired: true,
    noRealValue: true,
    testerAge: '18+',
    access: 'signed-in-allowlist',
    stopPoint: 'alpha-rc-ready'
  },
  economy: {
    mode: 'test-soft-currency',
    hotLedger: 'supabase-postgres',
    coldInventory: 'enjin-managed-wallet',
    realValue: false
  },
  chain: {
    provider: 'enjin',
    network: 'CANARY',
    custody: 'managed-hot-cold',
    finalityRequired: true
  },
  market: {
    fixedPrice: true,
    directTrade: true,
    auctions: false,
    cashout: false
  },
  gameplay: {
    spiritAttunement: true,
    trainingBattles: true,
    raisingCare: true,
    roleplayQuests: true,
    spiritJournal: true,
    copiedUpstreamContent: false
  },
  ugc: 'curated'
} as const;

export const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback'
} as const;

export const SERVER_ENV_CONTRACT = [
  'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
  'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
  'ENJIN_PLATFORM_URL',
  'ENJIN_PLATFORM_TOKEN',
  'ENJIN_NETWORK',
  'ENJIN_COLLECTION_ID',
  'ENJIN_FUEL_TANK_ID'
] as const;

export const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'spirit.attune',
  'spirit.bond',
  'spirit.care',
  'spirit.train',
  'spirit.raise',
  'quest.accept',
  'quest.progress',
  'market.fixed_list',
  'trade.direct_offer',
  'chain.withdraw_request',
  'chain.deposit_request',
  'chain.operation_update'
] as const;

export type AlphaActionType = (typeof ALPHA_ACTION_TYPES)[number];

export interface AlphaActionEnvelope {
  requestId: string;
  type: AlphaActionType;
  playerId?: string;
  payload: Record<string, unknown>;
}

export function isAlphaActionEnvelope(value: unknown): value is AlphaActionEnvelope {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AlphaActionEnvelope>;
  return (
    typeof candidate.requestId === 'string' &&
    candidate.requestId.length > 8 &&
    typeof candidate.type === 'string' &&
    ALPHA_ACTION_TYPES.includes(candidate.type as AlphaActionType) &&
    typeof candidate.payload === 'object' &&
    candidate.payload !== null
  );
}
