export const ALPHA_FEATURES = {
  alpha: {
    allowlistRequired: true,
    termsRequired: true,
    noRealValue: true,
    testerAge: '18+',
    access: 'signed-in-allowlist',
    stopPoint: 'alpha-preview-ready'
  },
  gameplay: {
    sharedRoom: true,
    desktopWebgl: true,
    curatedCharacterPresets: true,
    movement: true,
    cameraFollow: true,
    emotes: true,
    localSocialSignal: true,
    lirabaoCare: true,
    staleRevisionReload: true,
    avatarUploads: false,
    multipleRooms: false,
    sharding: false,
    mobileSpecificUi: false
  },
  ugc: 'curated'
} as const;

export const ALPHA_EDGE_FUNCTIONS = {
  session: 'mochi-social-alpha-session',
  action: 'mochi-social-alpha-action',
  progress: 'mochi-social-alpha-progress',
  admin: 'mochi-social-alpha-admin',
  feedback: 'submit-mochi-social-feedback',
  unityAuth: 'mochi-social-unity-auth'
} as const;

export const SERVER_ENV_CONTRACT = [
  'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
  'MOCHI_SOCIAL_GAME_SERVER_TOKEN'
] as const;

export const ALPHA_ACTION_TYPES = [
  'chat.send',
  'emote.send',
  'unity.character.created',
  'unity.character.updated',
  'unity.pet.interaction',
  'unity.pet.state_saved',
  'unity.room.joined',
  'unity.room.left'
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
