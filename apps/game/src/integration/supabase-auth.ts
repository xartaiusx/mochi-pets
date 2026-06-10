import { createClient } from '@supabase/supabase-js';

export interface SupabaseAuthConfig {
  url?: string;
  publishableKey?: string;
  required?: boolean;
}

export interface SupabaseAuthResult {
  ok: boolean;
  mode: 'guest' | 'linked';
  userId?: string;
  error?: string;
}

export function getSupabaseAuthConfig(env = process.env): SupabaseAuthConfig {
  return {
    url: env.SUPABASE_URL,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
    required: env.SUPABASE_AUTH_REQUIRED === 'true'
  };
}

export function isSupabaseConfigured(config = getSupabaseAuthConfig()) {
  return Boolean(config.url && config.publishableKey);
}

export async function validateSupabaseAccessToken(
  accessToken: string | undefined,
  config = getSupabaseAuthConfig()
): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured(config)) {
    if (config.required) {
      return { ok: false, mode: 'guest', error: 'Supabase auth is required but not configured.' };
    }
    return { ok: true, mode: 'guest' };
  }

  if (!accessToken) {
    if (config.required) {
      return { ok: false, mode: 'guest', error: 'Missing Supabase access token.' };
    }
    return { ok: true, mode: 'guest' };
  }

  const supabase = createClient(config.url!, config.publishableKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return { ok: false, mode: 'guest', error: error?.message ?? 'Supabase token did not resolve to a user.' };
  }

  return { ok: true, mode: 'linked', userId: data.user.id };
}
