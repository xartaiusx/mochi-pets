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
      },
      routes: {
        public: ['/healthz', '/play', '/embed', '/integration/game-manifest.json'],
        integration: ['/integration/alpha/status', '/integration/alpha/action', '/integration/alpha/enjin/submit']
      },
      alphaPreview: {
        status: 'closed-preview',
        stopPoint: 'alpha-preview-ready',
        websiteEntryPath: '/games/mochi-social',
        accessGateOwner: 'parent-website',
        testerPasswordOwner: 'parent-website',
        authBridgeTokenPolicy: 'short-lived-access-token-only',
        manualPromptReviewRequired: true,
        localEvidenceRequired: true,
        hostedChecksRequireApproval: true,
        providerMutationAllowedByDefault: false,
        fundedChainRequiredForPreview: false,
        enjinCanaryModeBeforeFunding: 'configured-preview-stub'
      },
      cleanRoom: {
        policy: 'project-authored-original-content-only',
        restrictedSourceReferences: false,
        copiedRestrictedSourceCode: false,
        copiedRestrictedSourceNames: false,
        copiedRestrictedSourceAssets: false,
        restrictedSourceVisualDerivatives: false,
        scanner: 'npm run clean-room-scan'
      },
      brand: {
        world: 'Mochirii',
        town: 'Jade Lantern Court',
        playerAvatar: 'Mochirii Wayfarer',
        guide: 'Sifu Narao',
        system: 'Mochi Spirits',
        artDirection: 'Mochirii High-Fidelity Wuxia'
      },
      runtimeArt: {
        style: 'smooth illustrated 2D',
        pixelArt: false,
        retro: false,
        tileSizePx: 64,
        townTilesheet: {
          width: 512,
          height: 192
        },
        eventSpritesheet: {
          width: 384,
          height: 768,
          columns: 3,
          rows: 4,
          frameWidth: 128,
          frameHeight: 192
        }
      },
      spirits: {
        system: 'Mochi Spirits',
        habitat: 'Jade Lantern Court',
        roster: [
          {
            id: 'lirabao',
            name: 'Lirabao',
            certificateEligible: true
          },
          {
            id: 'jintari',
            name: 'Jintari',
            certificateEligible: false
          },
          {
            id: 'aozhen',
            name: 'Aozhen',
            certificateEligible: false
          }
        ]
      },
      manualReview: {
        requiredBeforeAlphaPreviewReady: true,
        requiredTargets: [
          {
            id: 'welcome-npc',
            actor: 'sifu-narao'
          },
          {
            id: 'guild-seal-chest',
            actor: 'chest'
          },
          {
            id: 'care-shrine',
            actor: 'sifu-narao',
            setupTarget: 'spirit-lirabao'
          }
        ]
      }
    });
  });
});
