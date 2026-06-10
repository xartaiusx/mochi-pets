import { ALPHA_EDGE_FUNCTIONS, type AlphaActionEnvelope } from './alpha-contract';

export interface SupabaseEdgeConfig {
  functionsUrl?: string;
  serverToken?: string;
}

export function getSupabaseEdgeConfig(env = process.env): SupabaseEdgeConfig {
  return {
    functionsUrl: env.MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL,
    serverToken: env.MOCHI_SOCIAL_GAME_SERVER_TOKEN
  };
}

export function isSupabaseEdgeConfigured(config = getSupabaseEdgeConfig()) {
  return Boolean(config.functionsUrl && config.serverToken);
}

export function buildAlphaActionRequest(action: AlphaActionEnvelope, config = getSupabaseEdgeConfig()) {
  if (!isSupabaseEdgeConfigured(config)) return null;

  return {
    url: `${config.functionsUrl!.replace(/\/+$/, '')}/${ALPHA_EDGE_FUNCTIONS.action}`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mochi-social-server-token': config.serverToken!
      },
      body: JSON.stringify(action)
    }
  };
}
