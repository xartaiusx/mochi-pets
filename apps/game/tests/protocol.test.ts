import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { BRIDGE_EVENTS, MOCHI_PETS_PROTOCOL_VERSION } from '../src/integration/protocol';

const webglBridgeSource = readFileSync('../../unity/Assets/Plugins/WebGL/MochiSocialBridge.jslib', 'utf8');

describe('bridge protocol', () => {
  it('keeps the public postMessage namespace explicit', () => {
    expect(MOCHI_PETS_PROTOCOL_VERSION).toBe(1);
    expect(Object.values(BRIDGE_EVENTS)).toEqual([
      'MOCHI_PETS_READY',
      'MOCHI_PETS_AUTH',
      'MOCHI_PETS_SIGN_OUT',
      'MOCHI_PETS_AUTH_STATE',
      'MOCHI_PETS_ERROR'
    ]);
  });

  it('keeps Unity WebGL auth bridge endpoints fixed by served config', () => {
    expect(webglBridgeSource).toContain('$MochiPetsBridgeRuntime');
    expect(webglBridgeSource).toContain('MochiPetsBridgeReady__deps: ["$MochiPetsBridgeRuntime"]');
    expect(webglBridgeSource).toContain('MochiPetsBridgeAuthState__deps: ["$MochiPetsBridgeRuntime"]');
    expect(webglBridgeSource).toContain('MochiPetsBridgeError__deps: ["$MochiPetsBridgeRuntime"]');
    expect(webglBridgeSource).toContain('__MOCHI_PETS_UNITY_BRIDGE_CONFIG');
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
