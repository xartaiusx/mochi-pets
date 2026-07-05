export const MOCHI_PETS_PROTOCOL_VERSION = 1;

export const BRIDGE_EVENTS = {
  ready: 'MOCHI_PETS_READY',
  auth: 'MOCHI_PETS_AUTH',
  signOut: 'MOCHI_PETS_SIGN_OUT',
  authState: 'MOCHI_PETS_AUTH_STATE',
  error: 'MOCHI_PETS_ERROR'
} as const;

export type BridgeEventType = (typeof BRIDGE_EVENTS)[keyof typeof BRIDGE_EVENTS];

export interface BridgeMessage<TPayload = unknown> {
  type: BridgeEventType;
  protocolVersion: typeof MOCHI_PETS_PROTOCOL_VERSION;
  payload?: TPayload;
}

export interface AuthPayload {
  accessToken: string;
  expiresAt?: number;
}

export type AuthState = 'guest' | 'linked' | 'error';
