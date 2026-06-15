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
        guildReceipts: true,
        directTrade: true,
        auctions: false
      },
      gameplay: {
        spiritCapture: true,
        spiritStarterVows: true,
        spiritCaptureRites: true,
        spiritAttunement: true,
        routeInvitations: true,
        routeMastery: true,
        routePatrols: true,
        habitatBonds: true,
        spiritSanctuaryRites: true,
        spiritResearch: true,
        spiritCompendium: true,
        spiritRosterArchives: true,
        spiritCareCycles: true,
        spiritTemperamentConcords: true,
        spiritFieldAlmanacs: true,
        routeEcologySurveys: true,
        spiritEncounterAtlases: true,
        spiritCraftWrits: true,
        tradeExchangeAccords: true,
        spiritRivalCircles: true,
        routeWaystones: true,
        spiritNurtureRites: true,
        spiritRecoveryTeas: true,
        spiritKinshipAlbums: true,
        spiritNurseryGroves: true,
        spiritBloomAscendances: true,
        spiritLineageRegisters: true,
        itemProvisions: true,
        guildCommissions: true,
        socialRallies: true,
        spiritStoryChapters: true,
        guildInsigniaCases: true,
        wayfarerChronicles: true,
        guildAscensionTrials: true,
        partyFormation: true,
        partyHarmony: true,
        harmonyTrials: true,
        teamSparMatches: true,
        mentorChallenges: true,
        dojoLadders: true,
        spiritTournamentBrackets: true,
        sifuCouncils: true,
        summitCircuits: true,
        battleRoundTranscripts: true,
        conditionWeaves: true,
        fieldExpeditions: true,
        fieldAccords: true,
        sparringLadder: true,
        trainingBattles: true,
        techniqueMastery: true,
        battleTactics: true,
        techniqueLoadouts: true,
        techniqueCodexes: true,
        spiritTraits: true,
        spiritRelicAttunements: true,
        guildRankTrials: true,
        spiritGrowthRites: true,
        affinityTrials: true,
        affinityMatrices: true,
        raisingCare: true,
        roleplayQuests: true,
        questChains: true,
        spiritJournal: true,
        copiedUpstreamContent: false
      }
    });
  });
});
