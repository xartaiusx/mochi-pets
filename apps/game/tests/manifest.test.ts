import { describe, expect, it } from 'vitest';
import { createGameManifest } from '../src/integration/manifest';

describe('game manifest', () => {
  it('publishes stable Mochi Social website integration URLs', () => {
    const manifest = createGameManifest('https://mochi-social-game.fly.dev/');

    expect(manifest).toMatchObject({
      name: 'Mochi Social',
      slug: 'mochi-social',
      origin: 'https://mochi-social-game.fly.dev',
      playUrl: 'https://mochi-social-game.fly.dev/play',
      embedUrl: 'https://mochi-social-game.fly.dev/embed',
      bridge: {
        protocolVersion: 1,
        namespace: 'MOCHI_SOCIAL'
      },
      auth: {
        provider: 'supabase',
        mode: 'guest-first',
        tokenPolicy: 'access-token-only'
      },
      alpha: {
        allowlistRequired: true,
        termsRequired: true,
        noRealValue: true
      },
      economy: {
        mode: 'test-soft-currency',
        realValue: false
      },
      chain: {
        provider: 'enjin',
        network: 'CANARY',
        finalityRequired: true
      },
      market: {
        fixedPrice: true,
        directTrade: true,
        auctions: false
      },
      gameplay: {
        spiritCapture: true,
        spiritAttunement: true,
        routeInvitations: true,
        routeMastery: true,
        partyFormation: true,
        partyHarmony: true,
        harmonyTrials: true,
        fieldExpeditions: true,
        sparringLadder: true,
        trainingBattles: true,
        techniqueMastery: true,
        battleTactics: true,
        guildRankTrials: true,
        spiritGrowthRites: true,
        affinityTrials: true,
        raisingCare: true,
        roleplayQuests: true,
        questChains: true,
        spiritJournal: true,
        copiedUpstreamContent: false
      }
    });
  });
});
