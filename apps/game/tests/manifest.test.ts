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
        spiritWeatherVeils: true,
        spiritEncounterRotations: true,
        spiritEncounterAtlases: true,
        spiritHabitatCensuses: true,
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
        itemProvisionCatalogs: true,
        battleItemKits: true,
        remedyPouches: true,
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
        integration: ['/integration/alpha/status', '/integration/alpha/progress', '/integration/alpha/action', '/integration/alpha/enjin/submit']
      },
      progress: {
        authority: 'mochirii-edge',
        linkedAccount: true,
        guestFallback: true,
        snapshotEndpoint: '/integration/alpha/progress',
        accountMode: 'signed-in-supabase',
        guestMode: 'local-file-and-local-storage'
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
      playableContent: {
        scope: 'first-court-alpha-preview',
        contentPolicy: 'original-mochirii-feature-parity',
        capture: {
          spiritIds: ['lirabao', 'jintari', 'aozhen'],
          starterVowIds: ['jade-starter-vow'],
          expeditionRouteIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
          fieldAccordIds: ['moonbridge-goldleaf-accord', 'cloudbell-skyvow-accord'],
          routeMasteryIds: ['jade-cloudbell-circuit'],
          routePatrolIds: ['jade-cloudbell-patrol'],
          captureRiteIds: ['jade-court-capture-rite']
        },
        raising: {
          careActionIds: ['tea-ribbon-care'],
          raiseActionIds: ['jade-brush-groom', 'mooncake-share'],
          bondMilestoneIds: [
            'lirabao-lantern-spark',
            'lirabao-ribbon-warmth',
            'lirabao-moonwell-glow',
            'jintari-market-spark',
            'jintari-trade-step',
            'jintari-lacquer-glow',
            'aozhen-skybell-spark',
            'aozhen-reedwind-step',
            'aozhen-cloud-vow-glow'
          ],
          growthRiteIds: ['moonwell-bloom-rite'],
          careCycleIds: ['jade-court-care-cycle'],
          nurtureRiteIds: ['jade-moonwell-nurture-rite'],
          recoveryTeaIds: ['jade-teahouse-recovery'],
          kinshipAlbumIds: ['jade-kinship-album'],
          nurseryGroveIds: ['jade-nursery-grove'],
          bloomAscendanceIds: ['jade-bloom-ascendance'],
          lineageRegisterIds: ['jade-lineage-register']
        },
        battle: {
          moveIds: ['lantern-pulse', 'goldleaf-feint', 'skybell-guard'],
          tacticIds: ['lantern-anchor', 'goldleaf-opening', 'skybell-ward'],
          techniqueLoadoutIds: ['jade-step-loadout'],
          techniqueCodexIds: ['jade-technique-codex'],
          traitAttunementIds: ['jade-heart-trait'],
          conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
          conditionWeaveIds: ['jade-mirror-condition-weave'],
          affinityTrialIds: ['jade-mirror-trial', 'silk-cinder-trial'],
          affinityMatrixIds: ['jade-affinity-matrix'],
          harmonyFormIds: ['triune-jade-harmony'],
          harmonyTrialIds: ['jade-echo-concord'],
          teamSparMatchIds: ['jade-mirror-team-match'],
          mentorChallengeIds: ['silk-banner-mentor-drill'],
          dojoLadderIds: ['jade-dojo-ladder'],
          sparLadderIds: ['jade-echo-apprentice', 'silk-river-disciple'],
          tournamentBracketIds: ['jade-banner-tournament'],
          rivalCircleIds: ['jade-rival-circle'],
          sifuCouncilIds: ['jade-sifu-council'],
          summitCircuitIds: ['jade-summit-circuit']
        },
        roleplay: {
          questChainIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
          storyChapterIds: ['jade-scroll-story-chapter'],
          guildRankTrialIds: ['jade-court-initiate'],
          guildCommissionIds: ['jade-court-commission-ledger'],
          guildSocialRallyIds: ['jade-courtyard-rally'],
          guildWayfarerChronicleIds: ['jade-wayfarer-chronicle'],
          guildAscensionTrialIds: ['jade-court-ascension-trial'],
          guildInsigniaCaseIds: ['jade-insignia-case'],
          habitatBondIds: ['jade-court-habitat-bond'],
          sanctuaryRiteIds: ['jade-court-sanctuary-rite'],
          researchFolioIds: ['jade-court-research-folio'],
          compendiumIds: ['jade-court-spirit-compendium'],
          rosterArchiveIds: ['jade-court-roster-archive'],
          fieldAlmanacIds: ['jade-field-almanac'],
          routeEcologySurveyIds: ['jade-route-ecology-survey'],
          weatherVeilIds: ['jade-weather-veil'],
          encounterRotationIds: ['jade-encounter-rotation'],
          encounterAtlasIds: ['jade-encounter-atlas'],
          habitatCensusIds: ['jade-habitat-census'],
          routeWaystoneIds: ['jade-cloudbell-waystone']
        },
        economyAndCanary: {
          provisionSatchelIds: ['jade-court-provision-satchel'],
          provisionCatalogIds: ['jade-provision-catalog'],
          battleKitIds: ['jade-battle-kit'],
          remedyPouchIds: ['jade-remedy-pouch'],
          craftWritIds: ['jade-court-craft-writ'],
          marketReceiptIds: ['jade-court-market-receipt'],
          tradeExchangeAccordIds: ['jade-exchange-accord'],
          relicAttunementIds: ['jade-relic-attunement'],
          canaryCertificateItemIds: ['lirabao-canary-certificate'],
          canaryActionTypes: ['chain.withdraw_request', 'chain.deposit_request', 'chain.operation_update']
        },
        runtimeAssets: {
          tileSize: 64,
          tilesheet: {
            path: 'src/tiled/mochi-tiles.png',
            width: 512,
            height: 192
          }
        }
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

    expect(manifest.playableContent.runtimeAssets.spritesheets).toHaveLength(21);
    expect(manifest.playableContent.runtimeAssets.spritesheets.map((sheet) => sheet.path)).toContain('public/spritesheets/canary-shrine.png');
  });
});
