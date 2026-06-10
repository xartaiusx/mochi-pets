import { describe, expect, it } from 'vitest';
import { getSupabaseAuthConfig, isSupabaseConfigured, validateSupabaseAccessToken } from '../src/integration/supabase-auth';

describe('supabase auth bridge prep', () => {
  it('defaults to optional guest mode when Supabase is not configured', async () => {
    const config = getSupabaseAuthConfig({});
    const result = await validateSupabaseAccessToken(undefined, config);

    expect(isSupabaseConfigured(config)).toBe(false);
    expect(result).toEqual({ ok: true, mode: 'guest' });
  });

  it('fails closed when auth is required but Supabase is not configured', async () => {
    const result = await validateSupabaseAccessToken(undefined, { required: true });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('required');
  });
});
