import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BRIDGE_EVENTS, MOCHI_SOCIAL_PROTOCOL_VERSION } from '../src/integration/protocol';

const webglBridgeSource = readFileSync('../../unity/Assets/Plugins/WebGL/MochiSocialBridge.jslib', 'utf8');

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

  it('keeps Unity WebGL auth bridge endpoints fixed by served config', () => {
    expect(webglBridgeSource).toContain('$MochiSocialBridgeRuntime');
    expect(webglBridgeSource).toContain('MochiSocialBridgeReady__deps: ["$MochiSocialBridgeRuntime"]');
    expect(webglBridgeSource).toContain('MochiSocialBridgeAuthState__deps: ["$MochiSocialBridgeRuntime"]');
    expect(webglBridgeSource).toContain('MochiSocialBridgeError__deps: ["$MochiSocialBridgeRuntime"]');
    expect(webglBridgeSource).toContain('__MOCHI_SOCIAL_UNITY_BRIDGE_CONFIG');
    expect(webglBridgeSource).toContain('isAllowedParentOrigin(event.origin)');
    expect(webglBridgeSource).toContain('config.functionsUrl');
    expect(webglBridgeSource).toContain('config.unityAuthUrl');
    expect(webglBridgeSource).toContain('config.supabaseUrl');
    expect(webglBridgeSource).not.toContain('payload.functionsUrl || payload.supabaseFunctionsUrl');
    expect(webglBridgeSource).not.toContain('payload.unityAuthUrl || data.unityAuthUrl');
    expect(webglBridgeSource).not.toContain('payload.supabaseUrl || data.supabaseUrl');
    expect(webglBridgeSource).not.toContain('postMessage(message, "*")');
    expect(webglBridgeSource).not.toContain('return allowed.length ? allowed[0] : "*"');
  });
});
