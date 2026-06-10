import { describe, expect, it } from 'vitest';
import { BRIDGE_EVENTS, MOCHI_SOCIAL_PROTOCOL_VERSION } from '../src/integration/protocol';

describe('bridge protocol', () => {
  it('keeps the public postMessage namespace explicit', () => {
    expect(MOCHI_SOCIAL_PROTOCOL_VERSION).toBe(1);
    expect(Object.values(BRIDGE_EVENTS)).toEqual([
      'MOCHI_SOCIAL_READY',
      'MOCHI_SOCIAL_AUTH',
      'MOCHI_SOCIAL_SIGN_OUT',
      'MOCHI_SOCIAL_AUTH_STATE',
      'MOCHI_SOCIAL_ERROR'
    ]);
  });
});
