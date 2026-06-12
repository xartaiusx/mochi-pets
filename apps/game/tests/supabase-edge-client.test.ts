import { describe, expect, it } from 'vitest';
import { buildAlphaActionRequest, getSupabaseEdgeConfig, isSupabaseEdgeConfigured } from '../src/integration/supabase-edge-client';
import type { AlphaActionEnvelope } from '../src/integration/alpha-contract';

const action: AlphaActionEnvelope = {
  requestId: 'req_alpha_edge_123',
  type: 'pet.care',
  playerId: 'tester-123',
  payload: {
    petId: 'momo',
    noRealValue: true
  }
};

describe('supabase edge bridge client', () => {
  it('stays disabled until both the functions URL and scoped game token are configured', () => {
    expect(isSupabaseEdgeConfigured(getSupabaseEdgeConfig({}))).toBe(false);
    expect(buildAlphaActionRequest(action, { functionsUrl: 'https://example.supabase.co/functions/v1' })).toBeNull();
    expect(buildAlphaActionRequest(action, { serverToken: 'scoped-game-token' })).toBeNull();
  });

  it('builds an authoritative action request with the scoped server token in a header only', () => {
    const request = buildAlphaActionRequest(action, {
      functionsUrl: 'https://example.supabase.co/functions/v1///',
      serverToken: 'scoped-game-token'
    });

    expect(request?.url).toBe('https://example.supabase.co/functions/v1/mochi-social-alpha-action');
    expect(request?.init.method).toBe('POST');
    expect(request?.init.headers).toEqual({
      'Content-Type': 'application/json',
      'x-mochi-social-server-token': 'scoped-game-token'
    });
    expect(JSON.parse(String(request?.init.body))).toEqual(action);
    expect(String(request?.init.body)).not.toContain('scoped-game-token');
  });

  it('ignores service-role shaped environment names in the game runtime contract', () => {
    const config = getSupabaseEdgeConfig({
      MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL: 'https://example.supabase.co/functions/v1',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-keys-do-not-belong-here'
    });

    expect(config).toEqual({
      functionsUrl: 'https://example.supabase.co/functions/v1',
      serverToken: undefined
    });
    expect(isSupabaseEdgeConfigured(config)).toBe(false);
    expect(buildAlphaActionRequest(action, config)).toBeNull();
  });
});
