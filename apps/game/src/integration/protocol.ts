export const MOCHI_SOCIAL_PROTOCOL_VERSION = 1;

export const BRIDGE_EVENTS = {
  ready: 'MOCHI_SOCIAL_READY',
  auth: 'MOCHI_SOCIAL_AUTH',
  signOut: 'MOCHI_SOCIAL_SIGN_OUT',
  authState: 'MOCHI_SOCIAL_AUTH_STATE',
  error: 'MOCHI_SOCIAL_ERROR'
} as const;

export type BridgeEventType = (typeof BRIDGE_EVENTS)[keyof typeof BRIDGE_EVENTS];

export interface BridgeMessage<TPayload = unknown> {
  type: BridgeEventType;
  protocolVersion: typeof MOCHI_SOCIAL_PROTOCOL_VERSION;
  payload?: TPayload;
}

export interface AuthPayload {
  accessToken: string;
  expiresAt?: number;
}

export type AuthState = 'guest' | 'linked' | 'error';
