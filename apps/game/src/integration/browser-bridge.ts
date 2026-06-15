import { ALPHA_FEATURES, type AlphaActionType } from './alpha-contract';
import {
  GUILD_ASCENSION_TRIALS,
  GUILD_COMMISSIONS,
  GUILD_INSIGNIA_CASES,
  GUILD_SOCIAL_RALLIES,
  GUILD_WAYFARER_CHRONICLES,
  GUILD_RANK_TRIALS,
  MARKET_GUILD_RECEIPTS,
  MOCHI_QUEST_LEDGERS,
  MOCHI_STORY_CHAPTERS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_AFFINITY_MATRICES,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_BATTLE_KITS,
  SPIRIT_BLOOM_ASCENDANCES,
  SPIRIT_BOND_GIFT_RITES,
  SPIRIT_BLOSSOM_CRADLES,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_CARE_CYCLES,
  SPIRIT_CAPTURE_RITES,
  SPIRIT_COMPENDIUMS,
  SPIRIT_CONDITION_WEAVES,
  SPIRIT_CRAFT_WRITS,
  SPIRIT_DOJO_LADDERS,
  SPIRIT_ENCOUNTER_ATLASES,
  SPIRIT_ENCOUNTER_ROTATIONS,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_FIELD_ACCORDS,
  SPIRIT_FIELD_ALMANACS,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HABITAT_CENSUSES,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_KINSHIP_ALBUMS,
  SPIRIT_LINEAGE_REGISTERS,
  SPIRIT_MENTOR_CHALLENGES,
  SPIRIT_NURTURE_RITES,
  SPIRIT_NURSERY_GROVES,
  SPIRIT_PROVISION_CATALOGS,
  SPIRIT_PROVISION_SATCHELS,
  SPIRIT_RECOVERY_TEAS,
  SPIRIT_REMEDY_POUCHES,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_RIVAL_CIRCLES,
  SPIRIT_ROSTER_CABINETS,
  SPIRIT_ROUTE_CHARTERS,
  SPIRIT_ROUTE_ECOLOGY_SURVEYS,
  SPIRIT_ROSTER_ARCHIVES,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_ROUTE_PATROLS,
  SPIRIT_ROUTE_WAYSTONES,
  SPIRIT_SANCTUARY_RITES,
  SPIRIT_SIFU_COUNCILS,
  SPIRIT_RELIC_ATTUNEMENTS,
  SPIRIT_STARTER_VOWS,
  SPIRIT_SUMMIT_CIRCUITS,
  SPIRIT_TEAM_SPAR_MATCHES,
  SPIRIT_TEMPERAMENT_CONCORDS,
  SPIRIT_TECHNIQUE_CODEXES,
  SPIRIT_TECHNIQUE_LOADOUTS,
  SPIRIT_TOURNAMENT_BRACKETS,
  SPIRIT_TRAIT_ATTUNEMENTS,
  SPIRIT_WEATHER_VEILS,
  TRADE_EXCHANGE_ACCORDS,
  growthStageFromBond,
  resolveMochiSpiritQuestProgress,
  resolveSpiritRouteMastery,
  resolveSpiritWeatherVeil,
  techniqueMasteryLevelFromXp,
  selectMochiSpiritQuest,
  selectSpiritRaisingNeed,
  resolveSpiritAttunement,
  resolveSpiritAffinityMatrix,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleKit,
  resolveSpiritBattleRound,
  resolveSpiritBattleTactic,
  resolveSpiritBlossomCradle,
  resolveSpiritBloomAscendance,
  resolveSpiritBondGiftRite,
  resolveSpiritCapture,
  resolveSpiritCaptureRite,
  resolveSpiritCareCycle,
  resolveSpiritCompendiumCompletion,
  resolveSpiritConditionWeave,
  resolveSpiritCraftWrit,
  resolveSpiritDojoLadder,
  resolveSpiritEncounterAtlas,
  resolveSpiritEncounterRotation,
  resolveSpiritExpedition,
  resolveSpiritFieldAccord,
  resolveSpiritFieldAlmanac,
  resolveGuildCommission,
  resolveGuildAscensionTrial,
  resolveGuildInsigniaCase,
  resolveGuildRankTrial,
  resolveGuildSocialRally,
  resolveGuildWayfarerChronicle,
  resolveMochiQuestLedger,
  resolveMochiStoryChapter,
  resolveMarketGuildReceipt,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHabitatCensus,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritJournal,
  resolveSpiritKinshipAlbum,
  resolveSpiritLineageRegister,
  resolveSpiritMentorChallenge,
  resolveSpiritNurseryGrove,
  resolveSpiritNurtureRite,
  resolveSpiritParty,
  resolveSpiritBondMilestone,
  resolveSpiritProvisionCatalog,
  resolveSpiritProvisionSatchel,
  resolveSpiritRaisingAction,
  resolveSpiritRecoveryTea,
  resolveSpiritRemedyPouch,
  resolveSpiritRelicAttunement,
  resolveSpiritResearchFolio,
  resolveSpiritRivalCircle,
  resolveSpiritRosterArchive,
  resolveSpiritRosterCabinet,
  resolveSpiritRouteCharter,
  resolveSpiritRouteInvitation,
  resolveSpiritRouteEcologySurvey,
  resolveSpiritRouteWaystone,
  resolveSpiritSanctuaryRite,
  resolveSpiritSifuCouncil,
  resolveSpiritStarterVow,
  resolveSpiritSummitCircuit,
  resolveSpiritSparLadder,
  resolveSpiritRoutePatrol,
  resolveSpiritTeamSparMatch,
  resolveSpiritTemperamentConcord,
  resolveSpiritTechniqueCodex,
  resolveSpiritTechniqueLoadout,
  resolveSpiritTechniqueMastery,
  resolveSpiritTournamentBracket,
  resolveSpiritTraitAttunement,
  resolveSpiritTrainingBattle,
  resolveTradeExchangeAccord
} from '../alpha/content';
import { BRIDGE_EVENTS, type AuthPayload, type AuthState, type BridgeMessage, MOCHI_SOCIAL_PROTOCOL_VERSION } from './protocol';

const TOKEN_KEY = 'mochiSocial.accessToken';
const EXPIRES_KEY = 'mochiSocial.accessTokenExpiresAt';
const ALPHA_STATE_KEY = 'mochiSocial.alphaState';
const ALPHA_STATE_REVISION_KEY = 'mochiSocial.alphaStateRevision';
const ALPHA_STATE_UPDATED_AT_KEY = 'mochiSocial.alphaStateUpdatedAt';
const ALPHA_STATE_AUTHORITY_KEY = 'mochiSocial.alphaStateAuthority';
const PRESENCE_CHANNEL = 'mochi-social-presence';
const MOVEMENT_CHANNEL = 'mochi-social-movement';
const PRESENCE_TAB_KEY = 'mochiSocial.presenceTabId';
const PRESENCE_STORAGE_PREFIX = 'mochiSocial.presence.';
const MOVEMENT_STORAGE_PREFIX = 'mochiSocial.movement.';
const PRESENCE_TTL_MS = 4000;
const ALPHA_CHAT_HISTORY_LIMIT = 140;

interface AlphaHudState {
  spiritId?: string;
  attunedSpiritIds: string[];
  lastInspectedSpiritId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  guildRankProof: boolean;
  guildRankId?: string;
  guildRankTitle: string;
  guildRankScore: number;
  guildRankSealClaimed: boolean;
  growthRiteProof: boolean;
  growthRiteId?: string;
  growthForm: string;
  growthSigilClaimed: boolean;
  statusMood: string;
  bond: number;
  growth: string;
  bondBySpiritId: Record<string, number>;
  growthBySpiritId: Record<string, string>;
  careStreakBySpiritId: Record<string, number>;
  lastFocusedSpiritId?: string;
  focusedSpiritHistory: string[];
  captureProof: boolean;
  lastCaptureSpiritId?: string;
  starterVowProof: boolean;
  starterVowId?: string;
  starterVowName: string;
  starterVowLabel: string;
  starterVowScore: number;
  starterVowRequiredScore: number;
  starterVowItemIds: string[];
  starterSpiritId?: string;
  starterSpiritName: string;
  starterKnotClaimed: boolean;
  captureRiteProof: boolean;
  captureRiteId?: string;
  captureRiteName: string;
  captureRiteScore: number;
  captureRiteRequiredScore: number;
  captureRiteSpiritIds: string[];
  captureRiteRouteInvitedSpiritIds: string[];
  captureRiteLureItemIds: string[];
  captureRiteClaimed: boolean;
  journalProof: boolean;
  journalDiscoveredCount: number;
  journalTotal: number;
  lastJournalSpiritId?: string;
  expeditionProof: boolean;
  expeditionCount: number;
  discoveredRouteIds: string[];
  lastExpeditionRouteId?: string;
  lastExpeditionEncounterId?: string;
  routeRibbonClaimed: boolean;
  routeInviteProof: boolean;
  lastRouteInviteRouteId?: string;
  lastRouteInviteSpiritId?: string;
  routeInvitedSpiritIds: string[];
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  fieldAccordName: string;
  fieldAccordScore: number;
  fieldAccordRequiredScore: number;
  lastFieldAccordRouteId?: string;
  lastFieldAccordSpiritId?: string;
  fieldAccordTalismanClaimed: boolean;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  routeMasteryTitle: string;
  routeMasteryScore: number;
  routeMasteryKnotClaimed: boolean;
  routePatrolProof: boolean;
  routePatrolId?: string;
  routePatrolName: string;
  routePatrolScore: number;
  routePatrolRequiredScore: number;
  routePatrolPennantClaimed: boolean;
  habitatBondProof: boolean;
  habitatBondId?: string;
  habitatBondName: string;
  habitatBondScore: number;
  habitatTasselClaimed: boolean;
  sanctuaryRiteProof: boolean;
  sanctuaryRiteId?: string;
  sanctuaryRiteName: string;
  sanctuaryRiteScore: number;
  sanctuaryRiteRequiredScore: number;
  sanctuaryBellClaimed: boolean;
  researchProof: boolean;
  researchFolioId?: string;
  researchFolioName: string;
  researchScore: number;
  researchFolioClaimed: boolean;
  compendiumProof: boolean;
  compendiumId?: string;
  compendiumName: string;
  compendiumScore: number;
  compendiumSealClaimed: boolean;
  rosterArchiveProof: boolean;
  rosterArchiveId?: string;
  rosterArchiveName: string;
  rosterArchiveScore: number;
  rosterArchiveRequiredScore: number;
  rosterArchivePartyIds: string[];
  rosterArchiveReserveIds: string[];
  rosterArchiveSealClaimed: boolean;
  rosterCabinetProof: boolean;
  rosterCabinetId?: string;
  rosterCabinetName: string;
  rosterCabinetScore: number;
  rosterCabinetRequiredScore: number;
  rosterCabinetSpiritIds: string[];
  rosterCabinetPartyIds: string[];
  rosterCabinetReserveIds: string[];
  rosterCabinetSlotLabels: string[];
  rosterCabinetTagClaimed: boolean;
  blossomCradleProof: boolean;
  blossomCradleId?: string;
  blossomCradleName: string;
  blossomCradleScore: number;
  blossomCradleRequiredScore: number;
  blossomCradleSpiritIds: string[];
  blossomCradlePartyIds: string[];
  blossomCradleCareIds: string[];
  blossomCradleMilestoneLabels: string[];
  blossomCradleTotalBond: number;
  blossomCradleRibbonClaimed: boolean;
  provisionProof: boolean;
  provisionSatchelId?: string;
  provisionSatchelName: string;
  provisionScore: number;
  provisionStockItemIds: string[];
  provisionSatchelClaimed: boolean;
  bondGiftProof: boolean;
  bondGiftRiteId?: string;
  bondGiftRiteName: string;
  bondGiftScore: number;
  bondGiftRequiredScore: number;
  bondGiftItemIds: string[];
  bondGiftPresenceCount: number;
  bondGiftRibbonClaimed: boolean;
  provisionCatalogProof: boolean;
  provisionCatalogId?: string;
  provisionCatalogName: string;
  provisionCatalogScore: number;
  provisionCatalogRequiredScore: number;
  provisionCatalogItemIds: string[];
  provisionCatalogCareItemIds: string[];
  provisionCatalogRouteItemIds: string[];
  provisionCatalogPresenceCount: number;
  provisionCatalogSealClaimed: boolean;
  battleKitProof: boolean;
  battleKitId?: string;
  battleKitName: string;
  battleKitScore: number;
  battleKitRequiredScore: number;
  battleKitItemIds: string[];
  battleKitPartyIds: string[];
  battleKitPresenceCount: number;
  battleKitTagClaimed: boolean;
  remedyPouchProof: boolean;
  remedyPouchId?: string;
  remedyPouchName: string;
  remedyPouchScore: number;
  remedyPouchRequiredScore: number;
  remedyPouchItemIds: string[];
  remedyPouchConditionIds: string[];
  remedyPouchPartyIds: string[];
  remedyPouchPresenceCount: number;
  remedyPouchTagClaimed: boolean;
  careCycleProof: boolean;
  careCycleId?: string;
  careCycleName: string;
  careCycleScore: number;
  careCycleRequiredScore: number;
  careCycleCaredSpiritIds: string[];
  careCycleTotalBond: number;
  careCycleKnotClaimed: boolean;
  temperamentConcordProof: boolean;
  temperamentConcordId?: string;
  temperamentConcordName: string;
  temperamentConcordScore: number;
  temperamentConcordRequiredScore: number;
  temperamentConcordLabels: string[];
  temperamentConcordTotalBond: number;
  temperamentCharmClaimed: boolean;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  fieldAlmanacName: string;
  fieldAlmanacScore: number;
  fieldAlmanacRequiredScore: number;
  fieldAlmanacRouteIds: string[];
  fieldAlmanacSpeciesIds: string[];
  fieldAlmanacClaspClaimed: boolean;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  routeEcologyName: string;
  routeEcologyScore: number;
  routeEcologyRequiredScore: number;
  routeEcologyRouteIds: string[];
  routeEcologySpeciesIds: string[];
  routeEcologyInvitedSpiritIds: string[];
  routeEcologyMapClaimed: boolean;
  weatherVeilProof: boolean;
  weatherVeilId?: string;
  weatherVeilName: string;
  weatherVeilScore: number;
  weatherVeilRequiredScore: number;
  weatherVeilRouteIds: string[];
  weatherVeilConditionIds: string[];
  weatherVeilWindows: string[];
  weatherVeilChartClaimed: boolean;
  encounterRotationProof: boolean;
  encounterRotationId?: string;
  encounterRotationName: string;
  encounterRotationScore: number;
  encounterRotationRequiredScore: number;
  encounterRotationRouteIds: string[];
  encounterRotationSpiritIds: string[];
  encounterRotationLureItemIds: string[];
  encounterRotationWindows: string[];
  encounterRotationScrollClaimed: boolean;
  encounterAtlasProof: boolean;
  encounterAtlasId?: string;
  encounterAtlasName: string;
  encounterAtlasScore: number;
  encounterAtlasRequiredScore: number;
  encounterAtlasRouteIds: string[];
  encounterAtlasSpiritIds: string[];
  encounterAtlasCapturedSpiritIds: string[];
  encounterAtlasRarityTiers: string[];
  encounterAtlasClaimed: boolean;
  habitatCensusProof: boolean;
  habitatCensusId?: string;
  habitatCensusName: string;
  habitatCensusScore: number;
  habitatCensusRequiredScore: number;
  habitatCensusRouteIds: string[];
  habitatCensusSpiritIds: string[];
  habitatCensusCareLoggedSpiritIds: string[];
  habitatCensusSealClaimed: boolean;
  craftWritProof: boolean;
  craftWritId?: string;
  craftWritName: string;
  craftWritScore: number;
  craftWritRequiredScore: number;
  craftWritRecipeIds: string[];
  craftWritStockItemIds: string[];
  craftWritClaimed: boolean;
  exchangeAccordProof: boolean;
  exchangeAccordId?: string;
  exchangeAccordName: string;
  exchangeAccordScore: number;
  exchangeAccordRequiredScore: number;
  exchangeAccordItemIds: string[];
  exchangeAccordPresenceCount: number;
  exchangeAccordTallyClaimed: boolean;
  routeWaystoneProof: boolean;
  routeWaystoneId?: string;
  routeWaystoneName: string;
  routeWaystoneScore: number;
  routeWaystoneRequiredScore: number;
  routeWaystoneRouteIds: string[];
  routeWaystoneInvitedSpiritIds: string[];
  routeWaystoneSealClaimed: boolean;
  routeCharterProof: boolean;
  routeCharterId?: string;
  routeCharterName: string;
  routeCharterScore: number;
  routeCharterRequiredScore: number;
  routeCharterRouteIds: string[];
  routeCharterPartyIds: string[];
  routeCharterProofIds: string[];
  routeCharterPresenceCount: number;
  routeCharterSlipClaimed: boolean;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  nurtureRiteName: string;
  nurtureRiteScore: number;
  nurtureRiteRequiredScore: number;
  nurtureRiteRosterIds: string[];
  nurtureRiteCaredSpiritIds: string[];
  nurtureRibbonClaimed: boolean;
  recoveryTeaProof: boolean;
  recoveryTeaId?: string;
  recoveryTeaName: string;
  recoveryTeaScore: number;
  recoveryTeaRequiredScore: number;
  recoveryTeaPartyIds: string[];
  recoveryTeaCaredSpiritIds: string[];
  recoveryTeaCupClaimed: boolean;
  kinshipAlbumProof: boolean;
  kinshipAlbumId?: string;
  kinshipAlbumName: string;
  kinshipAlbumScore: number;
  kinshipAlbumRequiredScore: number;
  kinshipAlbumSpiritIds: string[];
  kinshipAlbumCaredSpiritIds: string[];
  kinshipAlbumTotalBond: number;
  kinshipAlbumClaimed: boolean;
  nurseryGroveProof: boolean;
  nurseryGroveId?: string;
  nurseryGroveName: string;
  nurseryGroveScore: number;
  nurseryGroveRequiredScore: number;
  nurseryGroveSpiritIds: string[];
  nurseryGrovePartyIds: string[];
  nurseryGroveCaredSpiritIds: string[];
  nurseryGroveTotalBond: number;
  nurserySproutClaimed: boolean;
  bloomAscendanceProof: boolean;
  bloomAscendanceId?: string;
  bloomAscendanceName: string;
  bloomAscendanceFormTitle: string;
  bloomAscendanceScore: number;
  bloomAscendanceRequiredScore: number;
  bloomAscendanceSpiritIds: string[];
  bloomAscendancePartyIds: string[];
  bloomAscendanceCaredSpiritIds: string[];
  bloomAscendanceTotalBond: number;
  bloomAscendanceSigilClaimed: boolean;
  lineageRegisterProof: boolean;
  lineageRegisterId?: string;
  lineageRegisterName: string;
  lineageRegisterScore: number;
  lineageRegisterRequiredScore: number;
  lineageRegisterSpiritIds: string[];
  lineageRegisterPartyIds: string[];
  lineageRegisterCaredSpiritIds: string[];
  lineageRegisterMilestoneLabels: string[];
  lineageRegisterSealClaimed: boolean;
  commissionProof: boolean;
  commissionId?: string;
  commissionName: string;
  commissionScore: number;
  commissionKnotClaimed: boolean;
  emoteProof: boolean;
  rallyProof: boolean;
  rallyId?: string;
  rallyName: string;
  rallyScore: number;
  rallyPresenceCount: number;
  rallyKnotClaimed: boolean;
  questLedgerProof: boolean;
  questLedgerId?: string;
  questLedgerName: string;
  questLedgerScore: number;
  questLedgerRequiredScore: number;
  questLedgerAcceptedQuestIds: string[];
  questLedgerCompletedQuestIds: string[];
  questLedgerSealClaimed: boolean;
  storyChapterProof: boolean;
  storyChapterId?: string;
  storyChapterName: string;
  storyChapterScore: number;
  storyChapterRequiredScore: number;
  storyChapterRouteIds: string[];
  storyChapterQuestIds: string[];
  storyScrollClaimed: boolean;
  insigniaCaseProof: boolean;
  insigniaCaseId?: string;
  insigniaCaseName: string;
  insigniaCaseScore: number;
  insigniaCaseRequiredScore: number;
  insigniaCaseSpiritIds: string[];
  insigniaCasePartyIds: string[];
  insigniaCaseClaimed: boolean;
  wayfarerChronicleProof: boolean;
  wayfarerChronicleId?: string;
  wayfarerChronicleName: string;
  wayfarerChronicleScore: number;
  wayfarerChronicleRequiredScore: number;
  wayfarerChronicleClaspClaimed: boolean;
  guildAscensionProof: boolean;
  guildAscensionTrialId?: string;
  guildAscensionTrialName: string;
  guildAscensionScore: number;
  guildAscensionRequiredScore: number;
  guildAscensionRibbonClaimed: boolean;
  techniqueProof: boolean;
  techniqueMoveId?: string;
  techniqueMasteryXp: number;
  techniqueMasteryLevel: string;
  techniqueFocusScore: number;
  tacticProof: boolean;
  lastTacticId?: string;
  lastTacticSpiritId?: string;
  lastTacticMoveId?: string;
  tacticStance?: string;
  tacticFocusScore: number;
  tacticMasteryXp: number;
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  techniqueLoadoutName: string;
  techniqueLoadoutScore: number;
  techniqueLoadoutMoves: string[];
  loadoutSlipClaimed: boolean;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  techniqueCodexName: string;
  techniqueCodexScore: number;
  techniqueCodexRequiredScore: number;
  techniqueCodexPartyIds: string[];
  techniqueCodexMoveIds: string[];
  techniqueCodexTacticIds: string[];
  techniqueCodexSealClaimed: boolean;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  traitAttunementName: string;
  traitLabel: string;
  traitAttunementScore: number;
  traitThreadClaimed: boolean;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  conditionWeaveName: string;
  conditionWeaveScore: number;
  conditionIds: string[];
  conditionCharmClaimed: boolean;
  affinityProof: boolean;
  affinityTrialWins: number;
  lastAffinityTrialId?: string;
  affinityAdvantage: boolean;
  affinityFocusScore: number;
  affinityTrialScore: number;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  affinityMatrixName: string;
  affinityMatrixScore: number;
  affinityMatrixRequiredScore: number;
  affinityMatrixSpiritIds: string[];
  affinityMatrixAffinityLabels: string[];
  affinityMatrixConditionIds: string[];
  affinityMatrixSealClaimed: boolean;
  relicAttunementProof: boolean;
  relicAttunementId?: string;
  relicAttunementName: string;
  relicAttunementScore: number;
  relicAttunementRequiredScore: number;
  relicAttunementSpiritIds: string[];
  relicAttunementItemIds: string[];
  relicLabel: string;
  relicSilkCordClaimed: boolean;
  activePartyId?: string;
  partyIds: string[];
  supportSpiritIds: string[];
  harmonyFormProof: boolean;
  harmonyFormId?: string;
  harmonyFormName: string;
  harmonyFormScore: number;
  harmonySashClaimed: boolean;
  harmonyTrialProof: boolean;
  harmonyTrialId?: string;
  harmonyTrialName: string;
  harmonyTrialScore: number;
  concordTallyClaimed: boolean;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  teamSparMatchName: string;
  teamSparMatchScore: number;
  teamMatchRibbonClaimed: boolean;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  mentorChallengeName: string;
  mentorChallengeScore: number;
  mentorSealClaimed: boolean;
  dojoLadderProof: boolean;
  dojoLadderId?: string;
  dojoLadderName: string;
  dojoLadderScore: number;
  dojoLadderRequiredScore: number;
  dojoLadderPartyIds: string[];
  dojoLadderOpponentIds: string[];
  dojoLadderSealClaimed: boolean;
  sifuCouncilProof: boolean;
  sifuCouncilId?: string;
  sifuCouncilName: string;
  sifuCouncilScore: number;
  sifuCouncilRequiredScore: number;
  sifuCouncilPartyIds: string[];
  sifuCouncilMemberIds: string[];
  sifuCouncilCrestClaimed: boolean;
  summitCircuitProof: boolean;
  summitCircuitId?: string;
  summitCircuitName: string;
  summitCircuitScore: number;
  summitCircuitRequiredScore: number;
  summitCircuitPartyIds: string[];
  summitCircuitSealIds: string[];
  summitCircuitLaurelClaimed: boolean;
  tournamentProof: boolean;
  tournamentId?: string;
  tournamentName: string;
  tournamentScore: number;
  tournamentRequiredScore: number;
  tournamentPartyIds: string[];
  tournamentPresenceCount: number;
  tournamentPennantClaimed: boolean;
  rivalCircleProof: boolean;
  rivalCircleId?: string;
  rivalCircleName: string;
  rivalCircleRivalName: string;
  rivalCircleScore: number;
  rivalCircleRequiredScore: number;
  rivalCirclePartyIds: string[];
  rivalCircleMarkClaimed: boolean;
  sparLadderXp: number;
  sparLadderWins: number;
  lastSparOpponentId?: string;
  battleRoundProof: boolean;
  battleRoundId?: string;
  battleRoundOpponentName: string;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  battleRoundVictory: boolean;
  battleRoundTranscript: string[];
  trainingXp: number;
  trainingVictories: number;
  raisingProof: boolean;
  raisingCareStreak: number;
  lastRaisingNeedId?: string;
  nextRaisingNeedId?: string;
  lastRaisingMilestoneId?: string;
  raisingMilestoneLabel: string;
  nextRaisingMilestoneId?: string;
  nextRaisingMilestoneLabel?: string;
  activeQuestId?: string;
  acceptedQuestIds: string[];
  completedQuestSteps: string[];
  completedQuestIds: string[];
  questStepsById: Record<string, string[]>;
  questChainProof: boolean;
  charmListed: boolean;
  marketReceiptProof: boolean;
  marketReceiptId?: string;
  marketReceiptName: string;
  marketReceiptItemId?: string;
  marketReceiptQuantity: number;
  marketReceiptPrice: number;
  marketReceiptCurrency: string;
  marketReceiptScore: number;
  marketReceiptRequiredScore: number;
  marketReceiptClaimed: boolean;
  tradeProof: boolean;
  canaryRequested: boolean;
  canaryReturnRequested: boolean;
  canaryOperationReviewProof: boolean;
  canaryOperationRequestId?: string;
  canaryOperationState: string;
  canaryOperationFinalized: boolean;
  canaryInventoryCredited: boolean;
  canaryOperationItemId?: string;
  chat: string[];
}

export interface AlphaWorldStatePatch {
  expedition?: {
    count: number;
    discoveredRoutes: string[];
    encounterSpiritId: string;
    message?: string;
    proof: boolean;
    recommendedItemId: string;
    rewardItemId: string;
    routeId: string;
    routeName: string;
  };
  routeInvite?: {
    alreadyRostered: boolean;
    message?: string;
    proof: boolean;
    routeId: string;
    routeName: string;
    roster: string[];
    spiritId: string;
  };
  fieldAccord?: {
    accordId: string;
    accordName: string;
    harmonyScore: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    routeId: string;
    routeName: string;
    score: number;
    spiritId: string;
    spiritName: string;
    title: string;
  };
  routeMastery?: {
    masteryId: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  affinity?: {
    affinityAdvantage: boolean;
    focusScore: number;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
    trialId: string;
    trialName: string;
    trialScore: number;
    victory: boolean;
    wins: number;
  };
  canaryRequested?: boolean;
  canaryReturnRequested?: boolean;
  charmListed?: boolean;
  marketReceipt?: {
    currency: string;
    itemId: string;
    message?: string;
    price: number;
    proof: boolean;
    quantity: number;
    receiptId: string;
    receiptName: string;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  capture?: {
    message?: string;
    roster: string[];
    spiritId: string;
  };
  starterVow?: {
    itemIds: string[];
    localPresenceCount: number;
    message?: string;
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    selectedSpiritId: string;
    selectedSpiritName: string;
    title: string;
    vowId: string;
    vowLabel: string;
    vowName: string;
  };
  journal?: {
    activeSpiritId?: string;
    discoveredCount: number;
    message?: string;
    proof: boolean;
    totalCount: number;
  };
  habitatBond?: {
    activeSpiritId?: string;
    bondId: string;
    bondName: string;
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  research?: {
    activeSpiritId?: string;
    discoveredRoutes: string[];
    folioId: string;
    folioName: string;
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  compendium?: {
    activeSpiritId?: string;
    compendiumId: string;
    compendiumName: string;
    discoveredRoutes: string[];
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  provisionSatchel?: {
    activeSpiritId?: string;
    completedQuestIds: string[];
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    satchelId: string;
    satchelName: string;
    score: number;
    stockItemIds: string[];
    title: string;
  };
  provisionCatalog?: {
    activeSpiritId?: string;
    catalogId: string;
    catalogName: string;
    careItemIds: string[];
    habitat: string;
    itemIds: string[];
    localPresenceCount: number;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    routeItemIds: string[];
    score: number;
    requiredScore: number;
    title: string;
  };
  battleKit?: {
    activeSpiritId?: string;
    itemIds: string[];
    kitId: string;
    kitName: string;
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    requiredScore: number;
    title: string;
  };
  remedyPouch?: {
    activeSpiritId?: string;
    conditionIds: string[];
    itemIds: string[];
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    pouchId: string;
    pouchName: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    requiredScore: number;
    title: string;
  };
  guildCommission?: {
    activeSpiritId?: string;
    commissionId: string;
    commissionName: string;
    completedQuestIds: string[];
    habitat: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    title: string;
  };
  guildSocialRally?: {
    habitat: string;
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    rallyId: string;
    rallyName: string;
    rewardItemId: string;
    score: number;
    title: string;
  };
  questLedger?: {
    acceptedQuestIds: string[];
    completedQuestIds: string[];
    habitat: string;
    ledgerId: string;
    ledgerName: string;
    localPresenceCount: number;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    roster: string[];
    score: number;
    requiredScore: number;
    title: string;
  };
  technique?: {
    focusScore: number;
    masteryLevel: string;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
  };
  tactic?: {
    focusScore: number;
    masteryXp: number;
    message?: string;
    moveId: string;
    proof: boolean;
    spiritId: string;
    stance: string;
    tacticId: string;
    tacticName: string;
  };
  rank?: {
    message?: string;
    proof: boolean;
    rankTitle: string;
    rewardItemId: string;
    score: number;
    trialId: string;
    trialTitle: string;
  };
  growthRite?: {
    formTitle: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    riteId: string;
    riteName: string;
    spiritId: string;
  };
  party?: {
    activeSpiritId?: string;
    message?: string;
    partyIds: string[];
    supportIds: string[];
  };
  harmonyForm?: {
    formId: string;
    message?: string;
    name: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  harmonyTrial?: {
    message?: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
    trialId: string;
    trialName: string;
  };
  teamSparMatch?: {
    matchId: string;
    matchName: string;
    message?: string;
    opponentName: string;
    partyIds: string[];
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
  };
  techniqueLoadout?: {
    loadoutId: string;
    loadoutName: string;
    message?: string;
    moves: string[];
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  techniqueCodex?: {
    codexId: string;
    codexName: string;
    masteredMoveIds: string[];
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    tacticIds: string[];
    title: string;
  };
  traitAttunement?: {
    activeSpiritId: string;
    activeSpiritName: string;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
    traitId: string;
    traitLabel: string;
    traitName: string;
  };
  conditionWeave?: {
    activeSpiritId: string;
    activeSpiritName: string;
    conditionIds: string[];
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
    weaveId: string;
    weaveName: string;
  };
  relicAttunement?: {
    activeSpiritId: string;
    activeSpiritName: string;
    itemIds: string[];
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    relicAttunementId: string;
    relicAttunementName: string;
    relicLabel: string;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  mentorChallenge?: {
    challengeId: string;
    challengeName: string;
    mentorName: string;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  dojoLadder?: {
    clearedOpponentIds: string[];
    ladderId: string;
    ladderName: string;
    mentorName: string;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  sifuCouncil?: {
    clearedCouncilMemberIds: string[];
    councilId: string;
    councilName: string;
    hostName: string;
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    title: string;
  };
  summitCircuit?: {
    circuitId: string;
    circuitName: string;
    hostName: string;
    localPresenceCount: number;
    message?: string;
    partyIds: string[];
    proof: boolean;
    requiredScore: number;
    rewardItemId: string;
    score: number;
    summitSealIds: string[];
    title: string;
  };
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  quest?: {
    chainComplete?: boolean;
    completedQuestIds?: string[];
    completedSteps: string[];
    id: string;
    message?: string;
    nextQuestId?: string;
  };
  raising?: {
    careStreak?: number;
    message?: string;
    milestoneId?: string;
    milestoneLabel?: string;
    milestoneReached?: boolean;
    needId: string;
    nextMilestoneId?: string;
    nextMilestoneLabel?: string;
    nextNeedId?: string;
    proof: boolean;
  };
  sealClaimed?: boolean;
  spar?: {
    message?: string;
    opponentId: string;
    victory: boolean;
    wins: number;
    xp: number;
  };
  battleRound?: {
    focusScore: number;
    message?: string;
    noInjury: true;
    opponentName: string;
    opponentScore: number;
    participants: string[];
    roundId: string;
    victory: boolean;
  };
  training?: {
    message?: string;
    victories: number;
    xp: number;
  };
  tradeProof?: boolean;
}

type AlphaLocalActionType = 'spirit.inspect' | 'spirit.focus' | 'profile.view' | 'guild.buddy' | 'status.set';

interface PresenceMessage {
  type: 'MOCHI_SOCIAL_LOCAL_PRESENCE';
  tabId: string;
  at: number;
}

interface MovementMessage {
  type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT';
  tabId: string;
  at: number;
  key: string;
}

interface AlphaActionResponse {
  ok?: boolean;
  error?: string;
  chainRuntime?: {
    mode?: string;
    message?: string;
  };
  data?: {
    progress?: AlphaProgressSnapshot | null;
  };
  progress?: AlphaProgressSnapshot | null;
  message?: string;
}

interface AlphaProgressSnapshot {
  authority?: string;
  revision?: number;
  state?: Partial<AlphaHudState>;
  updatedAt?: string;
}

function defaultAlphaState(): AlphaHudState {
  return {
    attunedSpiritIds: [],
    profileViewed: false,
    guildBuddyProof: false,
    guildRankProof: false,
    guildRankTitle: 'Visitor',
    guildRankScore: 0,
    guildRankSealClaimed: false,
    growthRiteProof: false,
    growthForm: 'Unawakened',
    growthSigilClaimed: false,
    statusMood: 'exploring',
    bond: 0,
    growth: 'seed',
    bondBySpiritId: {},
    growthBySpiritId: {},
    careStreakBySpiritId: {},
    focusedSpiritHistory: [],
    captureProof: false,
    starterVowProof: false,
    starterVowName: 'Unchosen',
    starterVowLabel: 'No vow',
    starterVowScore: 0,
    starterVowRequiredScore: 0,
    starterVowItemIds: [],
    starterSpiritName: 'Unchosen',
    starterKnotClaimed: false,
    captureRiteProof: false,
    captureRiteName: 'Unrecorded',
    captureRiteScore: 0,
    captureRiteRequiredScore: 0,
    captureRiteSpiritIds: [],
    captureRiteRouteInvitedSpiritIds: [],
    captureRiteLureItemIds: [],
    captureRiteClaimed: false,
    journalProof: false,
    journalDiscoveredCount: 0,
    journalTotal: MOCHI_SPIRITS.length,
    expeditionProof: false,
    expeditionCount: 0,
    discoveredRouteIds: [],
    routeRibbonClaimed: false,
    routeInviteProof: false,
    routeInvitedSpiritIds: [],
    fieldAccordProof: false,
    fieldAccordName: 'Pending',
    fieldAccordScore: 0,
    fieldAccordRequiredScore: 0,
    fieldAccordTalismanClaimed: false,
    routeMasteryProof: false,
    routeMasteryTitle: 'Unmastered',
    routeMasteryScore: 0,
    routeMasteryKnotClaimed: false,
    routePatrolProof: false,
    routePatrolName: 'Unpatrolled',
    routePatrolScore: 0,
    routePatrolRequiredScore: 0,
    routePatrolPennantClaimed: false,
    habitatBondProof: false,
    habitatBondName: 'Unbonded',
    habitatBondScore: 0,
    habitatTasselClaimed: false,
    sanctuaryRiteProof: false,
    sanctuaryRiteName: 'Unrestored',
    sanctuaryRiteScore: 0,
    sanctuaryRiteRequiredScore: 0,
    sanctuaryBellClaimed: false,
    researchProof: false,
    researchFolioName: 'Unresearched',
    researchScore: 0,
    researchFolioClaimed: false,
    compendiumProof: false,
    compendiumName: 'Unsealed',
    compendiumScore: 0,
    compendiumSealClaimed: false,
    rosterArchiveProof: false,
    rosterArchiveName: 'Unarchived',
    rosterArchiveScore: 0,
    rosterArchiveRequiredScore: 0,
    rosterArchivePartyIds: [],
    rosterArchiveReserveIds: [],
    rosterArchiveSealClaimed: false,
    rosterCabinetProof: false,
    rosterCabinetName: 'Unfiled',
    rosterCabinetScore: 0,
    rosterCabinetRequiredScore: 0,
    rosterCabinetSpiritIds: [],
    rosterCabinetPartyIds: [],
    rosterCabinetReserveIds: [],
    rosterCabinetSlotLabels: [],
    rosterCabinetTagClaimed: false,
    blossomCradleProof: false,
    blossomCradleName: 'Uncradled',
    blossomCradleScore: 0,
    blossomCradleRequiredScore: 0,
    blossomCradleSpiritIds: [],
    blossomCradlePartyIds: [],
    blossomCradleCareIds: [],
    blossomCradleMilestoneLabels: [],
    blossomCradleTotalBond: 0,
    blossomCradleRibbonClaimed: false,
    provisionProof: false,
    provisionSatchelName: 'Unstocked',
    provisionScore: 0,
    provisionStockItemIds: [],
    provisionSatchelClaimed: false,
    bondGiftProof: false,
    bondGiftRiteName: 'Ungifted',
    bondGiftScore: 0,
    bondGiftRequiredScore: 0,
    bondGiftItemIds: [],
    bondGiftPresenceCount: 1,
    bondGiftRibbonClaimed: false,
    provisionCatalogProof: false,
    provisionCatalogName: 'Uncataloged',
    provisionCatalogScore: 0,
    provisionCatalogRequiredScore: 0,
    provisionCatalogItemIds: [],
    provisionCatalogCareItemIds: [],
    provisionCatalogRouteItemIds: [],
    provisionCatalogPresenceCount: 0,
    provisionCatalogSealClaimed: false,
    battleKitProof: false,
    battleKitName: 'Unpacked',
    battleKitScore: 0,
    battleKitRequiredScore: 0,
    battleKitItemIds: [],
    battleKitPartyIds: [],
    battleKitPresenceCount: 0,
    battleKitTagClaimed: false,
    remedyPouchProof: false,
    remedyPouchName: 'Unpacked',
    remedyPouchScore: 0,
    remedyPouchRequiredScore: 0,
    remedyPouchItemIds: [],
    remedyPouchConditionIds: [],
    remedyPouchPartyIds: [],
    remedyPouchPresenceCount: 0,
    remedyPouchTagClaimed: false,
    careCycleProof: false,
    careCycleName: 'Uncycled',
    careCycleScore: 0,
    careCycleRequiredScore: 0,
    careCycleCaredSpiritIds: [],
    careCycleTotalBond: 0,
    careCycleKnotClaimed: false,
    temperamentConcordProof: false,
    temperamentConcordName: 'Unmatched',
    temperamentConcordScore: 0,
    temperamentConcordRequiredScore: 0,
    temperamentConcordLabels: [],
    temperamentConcordTotalBond: 0,
    temperamentCharmClaimed: false,
    fieldAlmanacProof: false,
    fieldAlmanacName: 'Unrecorded',
    fieldAlmanacScore: 0,
    fieldAlmanacRequiredScore: 0,
    fieldAlmanacRouteIds: [],
    fieldAlmanacSpeciesIds: [],
    fieldAlmanacClaspClaimed: false,
    routeEcologyProof: false,
    routeEcologyName: 'Unsurveyed',
    routeEcologyScore: 0,
    routeEcologyRequiredScore: 0,
    routeEcologyRouteIds: [],
    routeEcologySpeciesIds: [],
    routeEcologyInvitedSpiritIds: [],
    routeEcologyMapClaimed: false,
    weatherVeilProof: false,
    weatherVeilName: 'Uncharted',
    weatherVeilScore: 0,
    weatherVeilRequiredScore: 0,
    weatherVeilRouteIds: [],
    weatherVeilConditionIds: [],
    weatherVeilWindows: [],
    weatherVeilChartClaimed: false,
    encounterRotationProof: false,
    encounterRotationName: 'Unplanned',
    encounterRotationScore: 0,
    encounterRotationRequiredScore: 0,
    encounterRotationRouteIds: [],
    encounterRotationSpiritIds: [],
    encounterRotationLureItemIds: [],
    encounterRotationWindows: [],
    encounterRotationScrollClaimed: false,
    encounterAtlasProof: false,
    encounterAtlasName: 'Unindexed',
    encounterAtlasScore: 0,
    encounterAtlasRequiredScore: 0,
    encounterAtlasRouteIds: [],
    encounterAtlasSpiritIds: [],
    encounterAtlasCapturedSpiritIds: [],
    encounterAtlasRarityTiers: [],
    encounterAtlasClaimed: false,
    habitatCensusProof: false,
    habitatCensusName: 'Uncounted',
    habitatCensusScore: 0,
    habitatCensusRequiredScore: 0,
    habitatCensusRouteIds: [],
    habitatCensusSpiritIds: [],
    habitatCensusCareLoggedSpiritIds: [],
    habitatCensusSealClaimed: false,
    craftWritProof: false,
    craftWritName: 'Uncrafted',
    craftWritScore: 0,
    craftWritRequiredScore: 0,
    craftWritRecipeIds: [],
    craftWritStockItemIds: [],
    craftWritClaimed: false,
    exchangeAccordProof: false,
    exchangeAccordName: 'Pending',
    exchangeAccordScore: 0,
    exchangeAccordRequiredScore: 0,
    exchangeAccordItemIds: [],
    exchangeAccordPresenceCount: 1,
    exchangeAccordTallyClaimed: false,
    routeWaystoneProof: false,
    routeWaystoneName: 'Inactive',
    routeWaystoneScore: 0,
    routeWaystoneRequiredScore: 0,
    routeWaystoneRouteIds: [],
    routeWaystoneInvitedSpiritIds: [],
    routeWaystoneSealClaimed: false,
    routeCharterProof: false,
    routeCharterName: 'Uncharted',
    routeCharterScore: 0,
    routeCharterRequiredScore: 0,
    routeCharterRouteIds: [],
    routeCharterPartyIds: [],
    routeCharterProofIds: [],
    routeCharterPresenceCount: 1,
    routeCharterSlipClaimed: false,
    nurtureRiteProof: false,
    nurtureRiteName: 'Unsealed',
    nurtureRiteScore: 0,
    nurtureRiteRequiredScore: 0,
    nurtureRiteRosterIds: [],
    nurtureRiteCaredSpiritIds: [],
    nurtureRibbonClaimed: false,
    recoveryTeaProof: false,
    recoveryTeaName: 'Unserved',
    recoveryTeaScore: 0,
    recoveryTeaRequiredScore: 0,
    recoveryTeaPartyIds: [],
    recoveryTeaCaredSpiritIds: [],
    recoveryTeaCupClaimed: false,
    kinshipAlbumProof: false,
    kinshipAlbumName: 'Unrecorded',
    kinshipAlbumScore: 0,
    kinshipAlbumRequiredScore: 0,
    kinshipAlbumSpiritIds: [],
    kinshipAlbumCaredSpiritIds: [],
    kinshipAlbumTotalBond: 0,
    kinshipAlbumClaimed: false,
    nurseryGroveProof: false,
    nurseryGroveName: 'Uncultivated',
    nurseryGroveScore: 0,
    nurseryGroveRequiredScore: 0,
    nurseryGroveSpiritIds: [],
    nurseryGrovePartyIds: [],
    nurseryGroveCaredSpiritIds: [],
    nurseryGroveTotalBond: 0,
    nurserySproutClaimed: false,
    bloomAscendanceProof: false,
    bloomAscendanceName: 'Unascended',
    bloomAscendanceFormTitle: 'Unformed',
    bloomAscendanceScore: 0,
    bloomAscendanceRequiredScore: 0,
    bloomAscendanceSpiritIds: [],
    bloomAscendancePartyIds: [],
    bloomAscendanceCaredSpiritIds: [],
    bloomAscendanceTotalBond: 0,
    bloomAscendanceSigilClaimed: false,
    lineageRegisterProof: false,
    lineageRegisterName: 'Unrecorded',
    lineageRegisterScore: 0,
    lineageRegisterRequiredScore: 0,
    lineageRegisterSpiritIds: [],
    lineageRegisterPartyIds: [],
    lineageRegisterCaredSpiritIds: [],
    lineageRegisterMilestoneLabels: [],
    lineageRegisterSealClaimed: false,
    commissionProof: false,
    commissionName: 'Pending',
    commissionScore: 0,
    commissionKnotClaimed: false,
    emoteProof: false,
    rallyProof: false,
    rallyName: 'Pending',
    rallyScore: 0,
    rallyPresenceCount: 1,
    rallyKnotClaimed: false,
    questLedgerProof: false,
    questLedgerName: 'Unsealed',
    questLedgerScore: 0,
    questLedgerRequiredScore: 0,
    questLedgerAcceptedQuestIds: [],
    questLedgerCompletedQuestIds: [],
    questLedgerSealClaimed: false,
    storyChapterProof: false,
    storyChapterName: 'Unrecorded',
    storyChapterScore: 0,
    storyChapterRequiredScore: 0,
    storyChapterRouteIds: [],
    storyChapterQuestIds: [],
    storyScrollClaimed: false,
    insigniaCaseProof: false,
    insigniaCaseName: 'Unsealed',
    insigniaCaseScore: 0,
    insigniaCaseRequiredScore: 0,
    insigniaCaseSpiritIds: [],
    insigniaCasePartyIds: [],
    insigniaCaseClaimed: false,
    wayfarerChronicleProof: false,
    wayfarerChronicleName: 'Unchronicled',
    wayfarerChronicleScore: 0,
    wayfarerChronicleRequiredScore: 0,
    wayfarerChronicleClaspClaimed: false,
    guildAscensionProof: false,
    guildAscensionTrialName: 'Unascended',
    guildAscensionScore: 0,
    guildAscensionRequiredScore: 0,
    guildAscensionRibbonClaimed: false,
    techniqueProof: false,
    techniqueMasteryXp: 0,
    techniqueMasteryLevel: 'novice',
    techniqueFocusScore: 0,
    tacticProof: false,
    tacticFocusScore: 0,
    tacticMasteryXp: 0,
    techniqueLoadoutProof: false,
    techniqueLoadoutName: 'Unprepared',
    techniqueLoadoutScore: 0,
    techniqueLoadoutMoves: [],
    loadoutSlipClaimed: false,
    techniqueCodexProof: false,
    techniqueCodexName: 'Unsealed',
    techniqueCodexScore: 0,
    techniqueCodexRequiredScore: 0,
    techniqueCodexPartyIds: [],
    techniqueCodexMoveIds: [],
    techniqueCodexTacticIds: [],
    techniqueCodexSealClaimed: false,
    traitAttunementProof: false,
    traitAttunementName: 'Unattuned',
    traitLabel: 'No trait',
    traitAttunementScore: 0,
    traitThreadClaimed: false,
    conditionWeaveProof: false,
    conditionWeaveName: 'Pending',
    conditionWeaveScore: 0,
    conditionIds: [],
    conditionCharmClaimed: false,
    affinityProof: false,
    affinityTrialWins: 0,
    affinityAdvantage: false,
    affinityFocusScore: 0,
    affinityTrialScore: 0,
    affinityMatrixProof: false,
    affinityMatrixName: 'Unmapped',
    affinityMatrixScore: 0,
    affinityMatrixRequiredScore: 0,
    affinityMatrixSpiritIds: [],
    affinityMatrixAffinityLabels: [],
    affinityMatrixConditionIds: [],
    affinityMatrixSealClaimed: false,
    relicAttunementProof: false,
    relicAttunementName: 'Unattuned',
    relicAttunementScore: 0,
    relicAttunementRequiredScore: 0,
    relicAttunementSpiritIds: [],
    relicAttunementItemIds: [],
    relicLabel: 'No relic',
    relicSilkCordClaimed: false,
    partyIds: [],
    supportSpiritIds: [],
    harmonyFormProof: false,
    harmonyFormName: 'Unformed',
    harmonyFormScore: 0,
    harmonySashClaimed: false,
    harmonyTrialProof: false,
    harmonyTrialName: 'Uncleared',
    harmonyTrialScore: 0,
    concordTallyClaimed: false,
    teamSparMatchProof: false,
    teamSparMatchName: 'Unmatched',
    teamSparMatchScore: 0,
    teamMatchRibbonClaimed: false,
    mentorChallengeProof: false,
    mentorChallengeName: 'Unchallenged',
    mentorChallengeScore: 0,
    mentorSealClaimed: false,
    dojoLadderProof: false,
    dojoLadderName: 'Pending',
    dojoLadderScore: 0,
    dojoLadderRequiredScore: 0,
    dojoLadderPartyIds: [],
    dojoLadderOpponentIds: [],
    dojoLadderSealClaimed: false,
    sifuCouncilProof: false,
    sifuCouncilName: 'Pending',
    sifuCouncilScore: 0,
    sifuCouncilRequiredScore: 0,
    sifuCouncilPartyIds: [],
    sifuCouncilMemberIds: [],
    sifuCouncilCrestClaimed: false,
    summitCircuitProof: false,
    summitCircuitName: 'Pending',
    summitCircuitScore: 0,
    summitCircuitRequiredScore: 0,
    summitCircuitPartyIds: [],
    summitCircuitSealIds: [],
    summitCircuitLaurelClaimed: false,
    tournamentProof: false,
    tournamentName: 'Pending',
    tournamentScore: 0,
    tournamentRequiredScore: 0,
    tournamentPartyIds: [],
    tournamentPresenceCount: 1,
    tournamentPennantClaimed: false,
    rivalCircleProof: false,
    rivalCircleName: 'Unchallenged',
    rivalCircleRivalName: 'No rival circle',
    rivalCircleScore: 0,
    rivalCircleRequiredScore: 0,
    rivalCirclePartyIds: [],
    rivalCircleMarkClaimed: false,
    sparLadderXp: 0,
    sparLadderWins: 0,
    battleRoundProof: false,
    battleRoundOpponentName: 'Unrecorded',
    battleRoundFocusScore: 0,
    battleRoundOpponentScore: 0,
    battleRoundVictory: false,
    battleRoundTranscript: [],
    trainingXp: 0,
    trainingVictories: 0,
    raisingProof: false,
    raisingCareStreak: 0,
    raisingMilestoneLabel: 'Unopened',
    acceptedQuestIds: [],
    completedQuestSteps: [],
    completedQuestIds: [],
    questStepsById: {},
    questChainProof: false,
    charmListed: false,
    marketReceiptProof: false,
    marketReceiptName: 'No receipt',
    marketReceiptQuantity: 0,
    marketReceiptPrice: 0,
    marketReceiptCurrency: 'guild-seals',
    marketReceiptScore: 0,
    marketReceiptRequiredScore: 0,
    marketReceiptClaimed: false,
    tradeProof: false,
    canaryRequested: false,
    canaryReturnRequested: false,
    canaryOperationReviewProof: false,
    canaryOperationState: 'UNSUBMITTED',
    canaryOperationFinalized: false,
    canaryInventoryCredited: false,
    chat: []
  };
}

function postToParent(type: BridgeMessage['type'], payload?: unknown) {
  if (window.parent === window) return;

  window.parent.postMessage(
    {
      type,
      protocolVersion: MOCHI_SOCIAL_PROTOCOL_VERSION,
      payload
    } satisfies BridgeMessage,
    '*'
  );
}

function clearAlphaStateForSignedOutAccount() {
  localStorage.removeItem(ALPHA_STATE_KEY);
  localStorage.removeItem(ALPHA_STATE_REVISION_KEY);
  localStorage.removeItem(ALPHA_STATE_UPDATED_AT_KEY);
  localStorage.removeItem(ALPHA_STATE_AUTHORITY_KEY);
  window.dispatchEvent(new CustomEvent('mochi-social-alpha-state'));
}

function alphaProgressFromResponse(body: AlphaActionResponse | null): AlphaProgressSnapshot | null {
  return body?.progress || body?.data?.progress || null;
}

function alphaProgressUpdatedAt(progress: AlphaProgressSnapshot) {
  const timestamp = Date.parse(progress.updatedAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isRemoteAlphaProgressNewer(progress: AlphaProgressSnapshot) {
  const remoteRevision = Number(progress.revision || 0);
  const localRevision = Number(localStorage.getItem(ALPHA_STATE_REVISION_KEY) || '0');
  if (remoteRevision > localRevision) return true;
  if (remoteRevision < localRevision) return false;

  const remoteUpdatedAt = alphaProgressUpdatedAt(progress);
  const localUpdatedAt = Date.parse(localStorage.getItem(ALPHA_STATE_UPDATED_AT_KEY) || '') || 0;
  return remoteUpdatedAt > localUpdatedAt;
}

function applyAuthoritativeAlphaProgress(progress: AlphaProgressSnapshot | null) {
  if (!progress?.state || typeof progress.state !== 'object' || Array.isArray(progress.state)) return false;
  if (!isRemoteAlphaProgressNewer(progress)) return false;

  const state = {
    ...progress.state,
    chat: Array.isArray(progress.state.chat) ? progress.state.chat.slice(-ALPHA_CHAT_HISTORY_LIMIT).map(String) : []
  };
  localStorage.setItem(ALPHA_STATE_KEY, JSON.stringify(state));
  localStorage.setItem(ALPHA_STATE_REVISION_KEY, String(Math.max(0, Math.floor(Number(progress.revision || 0)))));
  localStorage.setItem(ALPHA_STATE_UPDATED_AT_KEY, progress.updatedAt || new Date().toISOString());
  localStorage.setItem(ALPHA_STATE_AUTHORITY_KEY, progress.authority || 'mochirii-edge');
  window.dispatchEvent(new CustomEvent('mochi-social-alpha-state'));
  return true;
}

async function loadLinkedAlphaProgress(accessToken: string) {
  try {
    const response = await fetch('/integration/alpha/progress', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const body = (await response.json().catch(() => null)) as AlphaActionResponse | null;
    if (response.ok && applyAuthoritativeAlphaProgress(alphaProgressFromResponse(body))) {
      const state = readAlphaState();
      appendUniqueAlphaChat(state, 'Account progress synced from Mochirii.');
      writeAlphaState(state, {
        preserveSyncMetadata: true
      });
      return;
    }
    if (!response.ok || body?.ok === false) {
      const state = readAlphaState();
      appendUniqueAlphaChat(state, body?.message || 'Account progress sync is unavailable. Local HUD feedback remains no-real-value preview state.');
      writeAlphaState(state, {
        preserveSyncMetadata: true
      });
      postToParent(BRIDGE_EVENTS.error, { message: 'Mochi Social account progress could not sync.' });
    }
  } catch {
    const state = readAlphaState();
    appendUniqueAlphaChat(state, 'Account progress sync is offline. Local HUD feedback remains no-real-value preview state.');
    writeAlphaState(state, {
      preserveSyncMetadata: true
    });
    postToParent(BRIDGE_EVENTS.error, { message: 'Mochi Social account progress could not sync.' });
  }
}

function updateHudAuthState(state: AuthState) {
  document.documentElement.dataset.authState = state;
  window.dispatchEvent(new CustomEvent('mochi-social-auth-state', { detail: { state } }));
}

function setAuth(payload: AuthPayload) {
  localStorage.setItem(TOKEN_KEY, payload.accessToken);
  if (payload.expiresAt) {
    localStorage.setItem(EXPIRES_KEY, String(payload.expiresAt));
  }
  updateHudAuthState('linked');
  postToParent(BRIDGE_EVENTS.authState, { state: 'linked' });
  void loadLinkedAlphaProgress(payload.accessToken);
}

function clearAuth() {
  const hadLinkedToken = Boolean(localStorage.getItem(TOKEN_KEY));
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  if (hadLinkedToken) {
    clearAlphaStateForSignedOutAccount();
  }
  updateHudAuthState('guest');
  postToParent(BRIDGE_EVENTS.authState, { state: 'guest' });
}

function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<BridgeMessage>;
  return candidate.protocolVersion === MOCHI_SOCIAL_PROTOCOL_VERSION && typeof candidate.type === 'string';
}

export function installMochiSocialBridge() {
  createHud();
  installLocalTabPresence();
  installLocalMovementPulse();
  void loadAlphaStatus();

  window.addEventListener('message', (event) => {
    if (!isBridgeMessage(event.data)) return;

    if (event.data.type === BRIDGE_EVENTS.auth) {
      const payload = event.data.payload as Partial<AuthPayload> | undefined;
      if (!payload?.accessToken) {
        updateHudAuthState('error');
        postToParent(BRIDGE_EVENTS.error, { message: 'Missing Supabase access token.' });
        return;
      }
      setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });
      return;
    }

    if (event.data.type === BRIDGE_EVENTS.signOut) {
      clearAuth();
    }
  });

  const existingToken = localStorage.getItem(TOKEN_KEY);
  updateHudAuthState(existingToken ? 'linked' : 'guest');
  if (existingToken) {
    void loadLinkedAlphaProgress(existingToken);
  }
  postToParent(BRIDGE_EVENTS.ready, {
    name: 'Mochi Social',
    protocolVersion: MOCHI_SOCIAL_PROTOCOL_VERSION
  });
}

function createHud() {
  if (document.getElementById('mochi-social-hud')) return;

  const hud = document.createElement('section');
  hud.id = 'mochi-social-hud';
  hud.setAttribute('aria-label', 'Mochi Social status');
  hud.innerHTML = `
    <div class="mochi-hud__status-strip">
      <div class="mochi-hud__brand">
        <strong>Mochi Social</strong>
        <span data-alpha-label>Canary preview stub - no real value</span>
      </div>
      <div class="mochi-hud__status-pills" aria-label="Connection status">
        <span data-auth-label>Guest</span>
        <span data-token-label>Seal: 0/1</span>
        <span data-presence-label>Nearby: 1 tester</span>
      </div>
    </div>
    <div class="mochi-hud__social-card" aria-label="Tester social state">
      <span data-profile-label>Profile: Mochirii wayfarer</span>
      <span data-guild-label>Guild: no buddy</span>
      <span data-rank-label>Rank: Visitor</span>
      <span data-status-label>Status: exploring</span>
      <span data-market-label>Market: ready</span>
    </div>
    <div class="mochi-hud__spirit-card" aria-label="Active Mochi Spirit">
      <span class="mochi-hud__kicker">Active Spirit</span>
      <strong data-spirit-label>Spirit: none</strong>
      <section class="mochi-hud__roster-panel" data-roster-panel aria-label="First-Court Mochi Spirit roster"></section>
      <span class="mochi-hud__hint" data-starter-vow-label>Starter: pending</span>
      <span class="mochi-hud__hint" data-journal-label>Journal: 0/${MOCHI_SPIRITS.length} records</span>
      <span class="mochi-hud__hint" data-expedition-label>Route: not scouted</span>
      <span class="mochi-hud__hint" data-route-invite-label>Route Invite: pending</span>
      <span class="mochi-hud__hint" data-capture-rite-label>Capture Rite: pending</span>
      <span class="mochi-hud__hint" data-field-accord-label>Field Accord: pending</span>
      <span class="mochi-hud__hint" data-route-mastery-label>Route Mastery: pending</span>
      <span class="mochi-hud__hint" data-route-patrol-label>Route Patrol: pending</span>
      <span class="mochi-hud__hint" data-habitat-bond-label>Habitat Bond: pending</span>
      <span class="mochi-hud__hint" data-sanctuary-label>Sanctuary: pending</span>
      <span class="mochi-hud__hint" data-research-label>Research: pending</span>
      <span class="mochi-hud__hint" data-compendium-label>Compendium: pending</span>
      <span class="mochi-hud__hint" data-archive-label>Archive: pending</span>
      <span class="mochi-hud__hint" data-roster-cabinet-label>Cabinet: pending</span>
      <span class="mochi-hud__hint" data-blossom-cradle-label>Cradle: pending</span>
      <span class="mochi-hud__hint" data-provision-label>Satchel: pending</span>
      <span class="mochi-hud__hint" data-provision-catalog-label>Catalog: pending</span>
      <span class="mochi-hud__hint" data-battle-kit-label>Kit: pending</span>
      <span class="mochi-hud__hint" data-remedy-pouch-label>Remedy: pending</span>
      <span class="mochi-hud__hint" data-care-cycle-label>Care Cycle: pending</span>
      <span class="mochi-hud__hint" data-bond-gift-label>Gift: pending</span>
      <span class="mochi-hud__hint" data-temperament-label>Temperament: pending</span>
      <span class="mochi-hud__hint" data-field-almanac-label>Almanac: pending</span>
      <span class="mochi-hud__hint" data-route-ecology-label>Ecology: pending</span>
      <span class="mochi-hud__hint" data-weather-veil-label>Weather Veil: pending</span>
      <span class="mochi-hud__hint" data-encounter-rotation-label>Rotation: pending</span>
      <span class="mochi-hud__hint" data-encounter-atlas-label>Atlas: pending</span>
      <span class="mochi-hud__hint" data-habitat-census-label>Census: pending</span>
      <span class="mochi-hud__hint" data-craft-writ-label>Craft: pending</span>
      <span class="mochi-hud__hint" data-exchange-accord-label>Exchange: pending</span>
      <span class="mochi-hud__hint" data-route-waystone-label>Waystone: pending</span>
      <span class="mochi-hud__hint" data-route-charter-label>Charter: pending</span>
      <span class="mochi-hud__hint" data-nurture-rite-label>Nurture: pending</span>
      <span class="mochi-hud__hint" data-recovery-tea-label>Recovery: pending</span>
      <span class="mochi-hud__hint" data-kinship-album-label>Kinship: pending</span>
      <span class="mochi-hud__hint" data-nursery-grove-label>Nursery: pending</span>
      <span class="mochi-hud__hint" data-bloom-ascendance-label>Ascendance: pending</span>
      <span class="mochi-hud__hint" data-lineage-register-label>Lineage: pending</span>
      <span class="mochi-hud__hint" data-commission-label>Commission: pending</span>
      <span class="mochi-hud__hint" data-rally-label>Rally: pending</span>
      <span class="mochi-hud__hint" data-quest-ledger-label>Quest Ledger: pending</span>
      <span class="mochi-hud__hint" data-story-label>Story: pending</span>
      <span class="mochi-hud__hint" data-insignia-label>Insignia: pending</span>
      <span class="mochi-hud__hint" data-chronicle-label>Chronicle: pending</span>
      <span class="mochi-hud__hint" data-ascension-label>Ascension: pending</span>
      <span class="mochi-hud__hint" data-technique-label>Technique: novice, 0 XP</span>
      <span class="mochi-hud__hint" data-tactic-label>Tactic: not set</span>
      <span class="mochi-hud__hint" data-loadout-label>Loadout: pending</span>
      <span class="mochi-hud__hint" data-technique-codex-label>Technique Codex: pending</span>
      <span class="mochi-hud__hint" data-trait-label>Trait: pending</span>
      <span class="mochi-hud__hint" data-condition-label>Condition: pending</span>
      <span class="mochi-hud__hint" data-affinity-matrix-label>Matrix: pending</span>
      <span class="mochi-hud__hint" data-relic-attunement-label>Relic: pending</span>
      <span class="mochi-hud__hint" data-affinity-label>Affinity: trial not started</span>
      <span class="mochi-hud__hint" data-party-label>Party: not formed</span>
      <span class="mochi-hud__hint" data-harmony-label>Harmony: pending</span>
      <span class="mochi-hud__hint" data-harmony-trial-label>Concord: pending</span>
      <span class="mochi-hud__hint" data-team-match-label>Team Match: pending</span>
      <span class="mochi-hud__hint" data-mentor-label>Mentor: pending</span>
      <span class="mochi-hud__hint" data-dojo-ladder-label>Dojo Ladder: pending</span>
      <span class="mochi-hud__hint" data-tournament-label>Tournament: pending</span>
      <span class="mochi-hud__hint" data-rival-circle-label>Rival: pending</span>
      <span class="mochi-hud__hint" data-sifu-council-label>Sifu Council: pending</span>
      <span class="mochi-hud__hint" data-summit-circuit-label>Summit: pending</span>
      <span class="mochi-hud__hint" data-training-label>Attune, train, raise, and quest. Canary remains preview stub.</span>
      <span class="mochi-hud__hint" data-battle-round-label>Battle Round: pending</span>
      <span class="mochi-hud__hint" data-growth-label>Growth Rite: pending</span>
      <span class="mochi-hud__hint" data-quest-label>Quest: not started</span>
      <span class="mochi-hud__hint" data-canary-finality-label>Canary Finality: not reviewed</span>
    </div>
    <div class="mochi-hud__actions" aria-label="Alpha quick actions">
      <button type="button" data-alpha-local-action="profile.view" aria-label="Open tester profile">Profile</button>
      <button type="button" data-alpha-local-action="guild.buddy" aria-label="Add local guild buddy proof">Guild</button>
      <button type="button" data-alpha-local-action="status.set" aria-label="Set cozy status mood">Mood</button>
      <button type="button" data-alpha-action="spirit.starter_vow" aria-label="Record the no-real-value Jade Starter Vow first companion proof">Starter</button>
      <button type="button" data-alpha-action="spirit.capture" aria-label="Invite a Mochi Spirit from the habitat grove">Invite</button>
      <button type="button" data-alpha-action="spirit.capture_rite" aria-label="Record the no-real-value Jade Capture Rite">Rite+</button>
      <button type="button" data-alpha-action="spirit.attune" aria-label="Attune a Mochi Spirit">Attune</button>
      <button type="button" data-alpha-action="party.set" aria-label="Form a Mochi Spirit party">Party</button>
      <button type="button" data-alpha-action="party.harmony_form" aria-label="Record the no-real-value three-spirit harmony form">Harmony</button>
      <button type="button" data-alpha-action="battle.harmony_trial" aria-label="Clear the no-injury social harmony battle trial">Concord</button>
      <button type="button" data-alpha-action="battle.team_spar_match" aria-label="Clear the no-injury full-party team spar match">Match</button>
      <button type="button" data-alpha-action="battle.mentor_challenge" aria-label="Clear the no-injury Mochirii mentor challenge">Mentor</button>
      <button type="button" data-alpha-action="battle.dojo_ladder" aria-label="Clear the no-injury Jade Dojo Ladder">Ladder</button>
      <button type="button" data-alpha-action="battle.tournament_bracket" aria-label="Clear the no-injury Jade Banner Tournament bracket">Bracket</button>
      <button type="button" data-alpha-action="battle.rival_circle" aria-label="Clear the no-injury Jade Rival Circle">Rival</button>
      <button type="button" data-alpha-action="battle.sifu_council" aria-label="Clear the no-injury Jade Sifu Council">Council</button>
      <button type="button" data-alpha-action="battle.summit_circuit" aria-label="Clear the no-injury Jade Summit Circuit">Summit</button>
      <button type="button" data-alpha-action="spirit.care" aria-label="Care for active Mochi Spirit">Care</button>
      <button type="button" data-alpha-action="spirit.journal" aria-label="Open the Mochirii spirit journal">Journal</button>
      <button type="button" data-alpha-action="spirit.habitat_bond" aria-label="Record a shared Mochi Spirit habitat bond">Habitat</button>
      <button type="button" data-alpha-action="spirit.sanctuary_rite" aria-label="Record the no-real-value Jade Court Sanctuary Rite">Rite</button>
      <button type="button" data-alpha-action="spirit.research" aria-label="Record the Mochirii spirit research folio">Research</button>
      <button type="button" data-alpha-action="spirit.compendium_complete" aria-label="Seal the no-real-value Mochirii spirit compendium">Codex</button>
      <button type="button" data-alpha-action="spirit.roster_archive" aria-label="Seal the no-real-value Jade Court Roster Archive">Archive</button>
      <button type="button" data-alpha-action="spirit.roster_cabinet" aria-label="Organize the no-real-value Jade Roster Cabinet">Cabinet</button>
      <button type="button" data-alpha-action="item.provision_satchel" aria-label="Stock the no-real-value Mochirii provision satchel">Bag</button>
      <button type="button" data-alpha-action="spirit.care_cycle" aria-label="Record the no-real-value Jade Court Care Cycle">Cycle</button>
      <button type="button" data-alpha-action="item.bond_gift" aria-label="Record the no-real-value Jade Bond Gift Rite">Gift</button>
      <button type="button" data-alpha-action="spirit.temperament_concord" aria-label="Record the no-real-value Jade Temperament Concord">Temper</button>
      <button type="button" data-alpha-action="spirit.field_almanac" aria-label="Record the no-real-value Jade Field Almanac">Almanac</button>
      <button type="button" data-alpha-action="world.route_ecology" aria-label="Record the no-real-value Jade Route Ecology Survey">Ecology</button>
      <button type="button" data-alpha-action="world.weather_veil" aria-label="Record the no-real-value Jade Weather Veil">Veil</button>
      <button type="button" data-alpha-action="world.encounter_rotation" aria-label="Record the no-real-value Jade Encounter Rotation">Rotate</button>
      <button type="button" data-alpha-action="world.encounter_atlas" aria-label="Record the no-real-value Jade Encounter Atlas">Atlas</button>
      <button type="button" data-alpha-action="spirit.habitat_census" aria-label="Record the no-real-value Jade Habitat Census">Census</button>
      <button type="button" data-alpha-action="item.craft_writ" aria-label="Record the no-real-value Jade Court Craft Writ">Craft</button>
      <button type="button" data-alpha-action="world.route_waystone" aria-label="Record the no-real-value Jade Cloudbell Waystone">Waystone</button>
      <button type="button" data-alpha-action="world.route_charter" aria-label="Record the no-real-value Jade Route Charter">Charter</button>
      <button type="button" data-alpha-action="spirit.nurture_rite" aria-label="Record the no-real-value Jade Moonwell Nurture Rite">Nurture</button>
      <button type="button" data-alpha-action="spirit.recovery_tea" aria-label="Record the no-real-value Jade Teahouse Recovery">Recover</button>
      <button type="button" data-alpha-action="item.provision_catalog" aria-label="Seal the no-real-value Jade Provision Catalog">Catalog</button>
      <button type="button" data-alpha-action="item.battle_kit" aria-label="Pack the no-real-value Jade Battle Kit">Kit</button>
      <button type="button" data-alpha-action="item.remedy_pouch" aria-label="Pack the no-real-value Jade Remedy Pouch">Remedy</button>
      <button type="button" data-alpha-action="spirit.kinship_album" aria-label="Record the no-real-value Jade Kinship Album">Kinship</button>
      <button type="button" data-alpha-action="spirit.nursery_grove" aria-label="Record the no-real-value Jade Nursery Grove">Nursery</button>
      <button type="button" data-alpha-action="spirit.bloom_ascendance" aria-label="Record the no-real-value Jade Bloom Ascendance">Ascend+</button>
      <button type="button" data-alpha-action="spirit.lineage_register" aria-label="Record the no-real-value Jade Lineage Register">Lineage</button>
      <button type="button" data-alpha-action="spirit.blossom_cradle" aria-label="Settle the no-real-value Jade Blossom Cradle">Cradle</button>
      <button type="button" data-alpha-action="guild.commission_complete" aria-label="Record the no-real-value Mochirii guild commission">Comm</button>
      <button type="button" data-alpha-action="guild.social_rally" aria-label="Record the no-real-value Jade Courtyard Rally">Rally</button>
      <button type="button" data-alpha-action="quest.ledger_record" aria-label="Seal the no-real-value Jade Quest Ledger">Ledger</button>
      <button type="button" data-alpha-action="story.chapter_complete" aria-label="Record the no-real-value Jade Scroll Story Chapter">Story</button>
      <button type="button" data-alpha-action="guild.insignia_case" aria-label="Seal the no-real-value Jade Insignia Case">Insignia</button>
      <button type="button" data-alpha-action="guild.wayfarer_chronicle" aria-label="Record the no-real-value Jade Wayfarer Chronicle">Chronicle</button>
      <button type="button" data-alpha-action="guild.ascension_trial" aria-label="Record the no-real-value Jade Court Ascension Trial">Ascend</button>
      <button type="button" data-alpha-action="world.expedition" aria-label="Scout a Mochirii field route">Scout</button>
      <button type="button" data-alpha-action="spirit.route_invite" aria-label="Invite the scouted route spirit">Route</button>
      <button type="button" data-alpha-action="world.route_mastery" aria-label="Record Mochirii route mastery proof">Circuit</button>
      <button type="button" data-alpha-action="world.route_patrol" aria-label="Record a two-tester no-injury route patrol proof">Patrol</button>
      <button type="button" data-alpha-action="spirit.technique" aria-label="Practice a Mochirii spirit technique">Dojo</button>
      <button type="button" data-alpha-action="battle.tactic_scroll" aria-label="Study a no-injury Mochirii tactic scroll">Tactic</button>
      <button type="button" data-alpha-action="spirit.technique_loadout" aria-label="Prepare the three-spirit Mochirii move loadout">Moves</button>
      <button type="button" data-alpha-action="battle.technique_codex" aria-label="Seal the no-real-value Jade Technique Codex">Codex+</button>
      <button type="button" data-alpha-action="spirit.trait_attune" aria-label="Attune an original no-real-value Mochirii spirit trait">Trait</button>
      <button type="button" data-alpha-action="battle.condition_weave" aria-label="Weave original no-injury Mochirii battle conditions">Weave</button>
      <button type="button" data-alpha-action="battle.affinity_matrix" aria-label="Record the no-real-value Jade Affinity Matrix">Matrix</button>
      <button type="button" data-alpha-action="spirit.relic_attune" aria-label="Attune the no-real-value Jade Relic Attunement held charm">Relic</button>
      <button type="button" data-alpha-action="battle.affinity_trial" aria-label="Practice a no-injury affinity trial">Trial</button>
      <button type="button" data-alpha-action="spirit.train" aria-label="Run a no-injury spirit training battle">Train</button>
      <button type="button" data-alpha-action="battle.spar_ladder" aria-label="Run a no-injury party spar ladder">Spar</button>
      <button type="button" data-alpha-action="spirit.raise" aria-label="Raise and groom the active Mochi Spirit">Raise</button>
      <button type="button" data-alpha-local-action="spirit.inspect" aria-label="Inspect active Mochi Spirit">Inspect</button>
      <button type="button" data-alpha-action="quest.accept" aria-label="Accept the first Mochirii guild quest">Quest</button>
      <button type="button" data-alpha-action="quest.progress" aria-label="Progress the active Mochirii guild quest">Step</button>
      <button type="button" data-alpha-action="guild.rank_trial" aria-label="Record a no-real-value Mochirii guild rank trial">Rank</button>
      <button type="button" data-alpha-action="spirit.growth_rite" aria-label="Record a no-real-value Mochi Spirit growth rite">Bloom</button>
      <button type="button" data-alpha-action="emote.send" aria-label="Wave to nearby testers">Wave</button>
      <button type="button" data-alpha-action="market.fixed_list" aria-label="List a no-real-value market item">List</button>
      <button type="button" data-alpha-action="market.guild_receipt" aria-label="Record the no-real-value Jade Court Market Receipt">Buy</button>
      <button type="button" data-alpha-action="trade.direct_offer" aria-label="Record a no-real-value direct trade proof">Trade</button>
      <button type="button" data-alpha-action="trade.exchange_accord" aria-label="Record the no-real-value Jade Exchange Accord">Accord</button>
      <button type="button" data-alpha-action="chain.withdraw_request" aria-label="Stage a no-real-value Enjin Canary preview request">Canary</button>
      <button type="button" data-alpha-action="chain.deposit_request" aria-label="Stage a no-real-value Enjin Canary return preview">Return</button>
      <button type="button" data-alpha-action="chain.operation_update" aria-label="Review no-real-value Canary finality without inventory credit">Finality</button>
    </div>
    <section class="mochi-hud__feed-panel" aria-label="Local chat and action log">
      <form class="mochi-hud__chat" data-chat-form>
        <label>
          <span>Local chat</span>
          <input data-chat-input maxlength="120" autocomplete="off" placeholder="Say hello" />
        </label>
        <button type="submit">Send</button>
      </form>
      <ol class="mochi-hud__feed" data-alpha-feed aria-live="polite"></ol>
    </section>
  `;
  document.body.appendChild(hud);

  const tokenLabel = hud.querySelector('[data-token-label]');
  const authLabel = hud.querySelector('[data-auth-label]');
  const profileLabel = hud.querySelector('[data-profile-label]');
  const guildLabel = hud.querySelector('[data-guild-label]');
  const rankLabel = hud.querySelector('[data-rank-label]');
  const statusLabel = hud.querySelector('[data-status-label]');
  const spiritLabel = hud.querySelector('[data-spirit-label]');
  const rosterPanel = hud.querySelector<HTMLElement>('[data-roster-panel]');
  const starterVowLabel = hud.querySelector('[data-starter-vow-label]');
  const journalLabel = hud.querySelector('[data-journal-label]');
  const expeditionLabel = hud.querySelector('[data-expedition-label]');
  const routeInviteLabel = hud.querySelector('[data-route-invite-label]');
  const captureRiteLabel = hud.querySelector('[data-capture-rite-label]');
  const fieldAccordLabel = hud.querySelector('[data-field-accord-label]');
  const routeMasteryLabel = hud.querySelector('[data-route-mastery-label]');
  const routePatrolLabel = hud.querySelector('[data-route-patrol-label]');
  const habitatBondLabel = hud.querySelector('[data-habitat-bond-label]');
  const sanctuaryLabel = hud.querySelector('[data-sanctuary-label]');
  const researchLabel = hud.querySelector('[data-research-label]');
  const compendiumLabel = hud.querySelector('[data-compendium-label]');
  const archiveLabel = hud.querySelector('[data-archive-label]');
  const rosterCabinetLabel = hud.querySelector('[data-roster-cabinet-label]');
  const blossomCradleLabel = hud.querySelector('[data-blossom-cradle-label]');
  const provisionLabel = hud.querySelector('[data-provision-label]');
  const provisionCatalogLabel = hud.querySelector('[data-provision-catalog-label]');
  const battleKitLabel = hud.querySelector('[data-battle-kit-label]');
  const remedyPouchLabel = hud.querySelector('[data-remedy-pouch-label]');
  const careCycleLabel = hud.querySelector('[data-care-cycle-label]');
  const bondGiftLabel = hud.querySelector('[data-bond-gift-label]');
  const temperamentLabel = hud.querySelector('[data-temperament-label]');
  const fieldAlmanacLabel = hud.querySelector('[data-field-almanac-label]');
  const routeEcologyLabel = hud.querySelector('[data-route-ecology-label]');
  const weatherVeilLabel = hud.querySelector('[data-weather-veil-label]');
  const encounterRotationLabel = hud.querySelector('[data-encounter-rotation-label]');
  const encounterAtlasLabel = hud.querySelector('[data-encounter-atlas-label]');
  const habitatCensusLabel = hud.querySelector('[data-habitat-census-label]');
  const craftWritLabel = hud.querySelector('[data-craft-writ-label]');
  const exchangeAccordLabel = hud.querySelector('[data-exchange-accord-label]');
  const routeWaystoneLabel = hud.querySelector('[data-route-waystone-label]');
  const routeCharterLabel = hud.querySelector('[data-route-charter-label]');
  const nurtureRiteLabel = hud.querySelector('[data-nurture-rite-label]');
  const recoveryTeaLabel = hud.querySelector('[data-recovery-tea-label]');
  const kinshipAlbumLabel = hud.querySelector('[data-kinship-album-label]');
  const nurseryGroveLabel = hud.querySelector('[data-nursery-grove-label]');
  const bloomAscendanceLabel = hud.querySelector('[data-bloom-ascendance-label]');
  const lineageRegisterLabel = hud.querySelector('[data-lineage-register-label]');
  const commissionLabel = hud.querySelector('[data-commission-label]');
  const rallyLabel = hud.querySelector('[data-rally-label]');
  const questLedgerLabel = hud.querySelector('[data-quest-ledger-label]');
  const storyLabel = hud.querySelector('[data-story-label]');
  const insigniaLabel = hud.querySelector('[data-insignia-label]');
  const chronicleLabel = hud.querySelector('[data-chronicle-label]');
  const ascensionLabel = hud.querySelector('[data-ascension-label]');
  const techniqueLabel = hud.querySelector('[data-technique-label]');
  const tacticLabel = hud.querySelector('[data-tactic-label]');
  const loadoutLabel = hud.querySelector('[data-loadout-label]');
  const techniqueCodexLabel = hud.querySelector('[data-technique-codex-label]');
  const traitLabel = hud.querySelector('[data-trait-label]');
  const conditionLabel = hud.querySelector('[data-condition-label]');
  const affinityMatrixLabel = hud.querySelector('[data-affinity-matrix-label]');
  const relicAttunementLabel = hud.querySelector('[data-relic-attunement-label]');
  const affinityLabel = hud.querySelector('[data-affinity-label]');
  const partyLabel = hud.querySelector('[data-party-label]');
  const harmonyLabel = hud.querySelector('[data-harmony-label]');
  const harmonyTrialLabel = hud.querySelector('[data-harmony-trial-label]');
  const teamMatchLabel = hud.querySelector('[data-team-match-label]');
  const mentorLabel = hud.querySelector('[data-mentor-label]');
  const dojoLadderLabel = hud.querySelector('[data-dojo-ladder-label]');
  const sifuCouncilLabel = hud.querySelector('[data-sifu-council-label]');
  const summitCircuitLabel = hud.querySelector('[data-summit-circuit-label]');
  const tournamentLabel = hud.querySelector('[data-tournament-label]');
  const rivalCircleLabel = hud.querySelector('[data-rival-circle-label]');
  const trainingLabel = hud.querySelector('[data-training-label]');
  const battleRoundLabel = hud.querySelector('[data-battle-round-label]');
  const growthLabel = hud.querySelector('[data-growth-label]');
  const questLabel = hud.querySelector('[data-quest-label]');
  const canaryFinalityLabel = hud.querySelector('[data-canary-finality-label]');
  const marketLabel = hud.querySelector('[data-market-label]');
  const feed = hud.querySelector<HTMLOListElement>('[data-alpha-feed]');
  const chatForm = hud.querySelector<HTMLFormElement>('[data-chat-form]');
  const chatInput = hud.querySelector<HTMLInputElement>('[data-chat-input]');

  function renderState() {
    const state = readAlphaState();
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    if (profileLabel) {
      profileLabel.textContent = state.profileViewed ? 'Profile: reviewed' : 'Profile: Mochirii wayfarer';
    }
    if (guildLabel) {
      guildLabel.textContent = state.guildBuddyProof ? 'Guild: 1 local buddy' : 'Guild: no buddy';
    }
    if (rankLabel) {
      rankLabel.textContent = state.guildRankProof
        ? `Rank: ${state.guildRankTitle}, score ${state.guildRankScore}`
        : `Rank: ${state.guildRankTitle || 'Visitor'}`;
    }
    if (statusLabel) {
      statusLabel.textContent = `Status: ${state.statusMood || 'exploring'}`;
    }
    if (spiritLabel) {
      spiritLabel.textContent = spirit ? `${spirit.name}: ${state.growth} growth, bond ${state.bond}/5` : 'Spirit: none';
    }
    if (rosterPanel) {
      rosterPanel.innerHTML = renderRosterPanel(state);
    }
    if (starterVowLabel) {
      starterVowLabel.textContent = state.starterVowProof
        ? `Starter: ${state.starterVowName}, ${state.starterSpiritName}, score ${state.starterVowScore}/${state.starterVowRequiredScore}`
        : 'Starter: pending';
    }
    if (journalLabel) {
      journalLabel.textContent = `Journal: ${state.journalDiscoveredCount}/${state.journalTotal || MOCHI_SPIRITS.length} records`;
    }
    if (expeditionLabel) {
      expeditionLabel.textContent = state.expeditionProof
        ? `Route: ${state.expeditionCount} scout${state.expeditionCount === 1 ? '' : 's'}, ${state.lastExpeditionEncounterId || 'signs'}`
        : 'Route: not scouted';
    }
    if (routeInviteLabel) {
      routeInviteLabel.textContent = state.routeInviteProof
        ? `Route Invite: ${state.lastRouteInviteSpiritId || 'recorded'}`
        : 'Route Invite: pending';
    }
    if (captureRiteLabel) {
      captureRiteLabel.textContent = state.captureRiteProof
        ? `Capture Rite: ${state.captureRiteName}, ${state.captureRiteSpiritIds.length} spirits, score ${state.captureRiteScore}/${state.captureRiteRequiredScore}`
        : 'Capture Rite: pending';
    }
    if (fieldAccordLabel) {
      fieldAccordLabel.textContent = state.fieldAccordProof
        ? `Field Accord: ${state.fieldAccordName}, score ${state.fieldAccordScore}/${state.fieldAccordRequiredScore}`
        : 'Field Accord: pending';
    }
    if (routeMasteryLabel) {
      routeMasteryLabel.textContent = state.routeMasteryProof
        ? `Route Mastery: ${state.routeMasteryTitle}, score ${state.routeMasteryScore}`
        : 'Route Mastery: pending';
    }
    if (routePatrolLabel) {
      routePatrolLabel.textContent = state.routePatrolProof
        ? `Route Patrol: ${state.routePatrolName}, score ${state.routePatrolScore}/${state.routePatrolRequiredScore}`
        : 'Route Patrol: pending';
    }
    if (questLedgerLabel) {
      questLedgerLabel.textContent = state.questLedgerProof
        ? `Quest Ledger: ${state.questLedgerName}, ${state.questLedgerCompletedQuestIds.length}/${MOCHI_SPIRIT_QUESTS.length} quests, score ${state.questLedgerScore}/${state.questLedgerRequiredScore}`
        : 'Quest Ledger: pending';
    }
    if (storyLabel) {
      storyLabel.textContent = state.storyChapterProof
        ? `Story: ${state.storyChapterName}, score ${state.storyChapterScore}/${state.storyChapterRequiredScore}`
        : 'Story: pending';
    }
    if (insigniaLabel) {
      insigniaLabel.textContent = state.insigniaCaseProof
        ? `Insignia: ${state.insigniaCaseName}, score ${state.insigniaCaseScore}/${state.insigniaCaseRequiredScore}`
        : 'Insignia: pending';
    }
    if (chronicleLabel) {
      chronicleLabel.textContent = state.wayfarerChronicleProof
        ? `Chronicle: ${state.wayfarerChronicleName}, score ${state.wayfarerChronicleScore}/${state.wayfarerChronicleRequiredScore}`
        : 'Chronicle: pending';
    }
    if (ascensionLabel) {
      ascensionLabel.textContent = state.guildAscensionProof
        ? `Ascension: ${state.guildAscensionTrialName}, score ${state.guildAscensionScore}/${state.guildAscensionRequiredScore}`
        : 'Ascension: pending';
    }
    if (habitatBondLabel) {
      habitatBondLabel.textContent = state.habitatBondProof
        ? `Habitat Bond: ${state.habitatBondName}, score ${state.habitatBondScore}`
        : 'Habitat Bond: pending';
    }
    if (sanctuaryLabel) {
      sanctuaryLabel.textContent = state.sanctuaryRiteProof
        ? `Sanctuary: ${state.sanctuaryRiteName}, score ${state.sanctuaryRiteScore}/${state.sanctuaryRiteRequiredScore}`
        : 'Sanctuary: pending';
    }
    if (researchLabel) {
      researchLabel.textContent = state.researchProof
        ? `Research: ${state.researchFolioName}, score ${state.researchScore}`
        : 'Research: pending';
    }
    if (compendiumLabel) {
      compendiumLabel.textContent = state.compendiumProof
        ? `Compendium: ${state.compendiumName}, score ${state.compendiumScore}`
        : 'Compendium: pending';
    }
    if (archiveLabel) {
      archiveLabel.textContent = state.rosterArchiveProof
        ? `Archive: ${state.rosterArchiveName}, reserve ${state.rosterArchiveReserveIds.length}, score ${state.rosterArchiveScore}/${state.rosterArchiveRequiredScore}`
        : 'Archive: pending';
    }
    if (rosterCabinetLabel) {
      rosterCabinetLabel.textContent = state.rosterCabinetProof
        ? `Cabinet: ${state.rosterCabinetName}, slots ${state.rosterCabinetSlotLabels.length}, score ${state.rosterCabinetScore}/${state.rosterCabinetRequiredScore}`
        : 'Cabinet: pending';
    }
    if (blossomCradleLabel) {
      blossomCradleLabel.textContent = state.blossomCradleProof
        ? `Cradle: ${state.blossomCradleName}, ${state.blossomCradleCareIds.length} care, bond ${state.blossomCradleTotalBond}, score ${state.blossomCradleScore}/${state.blossomCradleRequiredScore}`
        : 'Cradle: pending';
    }
    if (provisionLabel) {
      provisionLabel.textContent = state.provisionProof
        ? `Satchel: ${state.provisionSatchelName}, ${state.provisionStockItemIds.length} items`
        : 'Satchel: pending';
    }
    if (provisionCatalogLabel) {
      provisionCatalogLabel.textContent = state.provisionCatalogProof
        ? `Catalog: ${state.provisionCatalogName}, ${state.provisionCatalogItemIds.length} items, score ${state.provisionCatalogScore}/${state.provisionCatalogRequiredScore}`
        : 'Catalog: pending';
    }
    if (battleKitLabel) {
      battleKitLabel.textContent = state.battleKitProof
        ? `Kit: ${state.battleKitName}, ${state.battleKitItemIds.length} items, score ${state.battleKitScore}/${state.battleKitRequiredScore}`
        : 'Kit: pending';
    }
    if (remedyPouchLabel) {
      remedyPouchLabel.textContent = state.remedyPouchProof
        ? `Remedy: ${state.remedyPouchName}, ${state.remedyPouchConditionIds.length} conditions, score ${state.remedyPouchScore}/${state.remedyPouchRequiredScore}`
        : 'Remedy: pending';
    }
    if (careCycleLabel) {
      careCycleLabel.textContent = state.careCycleProof
        ? `Care Cycle: ${state.careCycleName}, ${state.careCycleCaredSpiritIds.length} spirits, score ${state.careCycleScore}/${state.careCycleRequiredScore}`
        : 'Care Cycle: pending';
    }
    if (bondGiftLabel) {
      bondGiftLabel.textContent = state.bondGiftProof
        ? `Gift: ${state.bondGiftRiteName}, ${state.bondGiftItemIds.length} items, score ${state.bondGiftScore}/${state.bondGiftRequiredScore}`
        : 'Gift: pending';
    }
    if (temperamentLabel) {
      temperamentLabel.textContent = state.temperamentConcordProof
        ? `Temperament: ${state.temperamentConcordName}, ${state.temperamentConcordLabels.length} moods, score ${state.temperamentConcordScore}/${state.temperamentConcordRequiredScore}`
        : 'Temperament: pending';
    }
    if (fieldAlmanacLabel) {
      fieldAlmanacLabel.textContent = state.fieldAlmanacProof
        ? `Almanac: ${state.fieldAlmanacName}, ${state.fieldAlmanacSpeciesIds.length} spirits, ${state.fieldAlmanacRouteIds.length} routes`
        : 'Almanac: pending';
    }
    if (routeEcologyLabel) {
      routeEcologyLabel.textContent = state.routeEcologyProof
        ? `Ecology: ${state.routeEcologyName}, ${state.routeEcologyRouteIds.length} routes, ${state.routeEcologyInvitedSpiritIds.length} invites`
        : 'Ecology: pending';
    }
    if (weatherVeilLabel) {
      weatherVeilLabel.textContent = state.weatherVeilProof
        ? `Weather Veil: ${state.weatherVeilName}, ${state.weatherVeilConditionIds.length} veils, score ${state.weatherVeilScore}/${state.weatherVeilRequiredScore}`
        : 'Weather Veil: pending';
    }
    if (encounterRotationLabel) {
      encounterRotationLabel.textContent = state.encounterRotationProof
        ? `Rotation: ${state.encounterRotationName}, ${state.encounterRotationWindows.length} windows, score ${state.encounterRotationScore}/${state.encounterRotationRequiredScore}`
        : 'Rotation: pending';
    }
    if (encounterAtlasLabel) {
      encounterAtlasLabel.textContent = state.encounterAtlasProof
        ? `Atlas: ${state.encounterAtlasName}, ${state.encounterAtlasSpiritIds.length} spirits, ${state.encounterAtlasRarityTiers.length} tiers`
        : 'Atlas: pending';
    }
    if (habitatCensusLabel) {
      habitatCensusLabel.textContent = state.habitatCensusProof
        ? `Census: ${state.habitatCensusName}, ${state.habitatCensusSpiritIds.length} spirits, ${state.habitatCensusCareLoggedSpiritIds.length} care logs`
        : 'Census: pending';
    }
    if (craftWritLabel) {
      craftWritLabel.textContent = state.craftWritProof
        ? `Craft: ${state.craftWritName}, ${state.craftWritRecipeIds.length} recipes, score ${state.craftWritScore}/${state.craftWritRequiredScore}`
        : 'Craft: pending';
    }
    if (exchangeAccordLabel) {
      exchangeAccordLabel.textContent = state.exchangeAccordProof
        ? `Exchange: ${state.exchangeAccordName}, ${state.exchangeAccordItemIds.length} supplies, ${state.exchangeAccordPresenceCount} testers`
        : 'Exchange: pending';
    }
    if (routeWaystoneLabel) {
      routeWaystoneLabel.textContent = state.routeWaystoneProof
        ? `Waystone: ${state.routeWaystoneName}, ${state.routeWaystoneRouteIds.length} routes, score ${state.routeWaystoneScore}/${state.routeWaystoneRequiredScore}`
        : 'Waystone: pending';
    }
    if (routeCharterLabel) {
      routeCharterLabel.textContent = state.routeCharterProof
        ? `Charter: ${state.routeCharterName}, ${state.routeCharterRouteIds.length} routes, ${state.routeCharterPartyIds.length} party, score ${state.routeCharterScore}/${state.routeCharterRequiredScore}`
        : 'Charter: pending';
    }
    if (nurtureRiteLabel) {
      nurtureRiteLabel.textContent = state.nurtureRiteProof
        ? `Nurture: ${state.nurtureRiteName}, ${state.nurtureRiteCaredSpiritIds.length} spirits, score ${state.nurtureRiteScore}/${state.nurtureRiteRequiredScore}`
        : 'Nurture: pending';
    }
    if (recoveryTeaLabel) {
      recoveryTeaLabel.textContent = state.recoveryTeaProof
        ? `Recovery: ${state.recoveryTeaName}, ${state.recoveryTeaPartyIds.length} spirits, score ${state.recoveryTeaScore}/${state.recoveryTeaRequiredScore}`
        : 'Recovery: pending';
    }
    if (kinshipAlbumLabel) {
      kinshipAlbumLabel.textContent = state.kinshipAlbumProof
        ? `Kinship: ${state.kinshipAlbumName}, ${state.kinshipAlbumCaredSpiritIds.length} cared, bond ${state.kinshipAlbumTotalBond}, score ${state.kinshipAlbumScore}/${state.kinshipAlbumRequiredScore}`
        : 'Kinship: pending';
    }
    if (nurseryGroveLabel) {
      nurseryGroveLabel.textContent = state.nurseryGroveProof
        ? `Nursery: ${state.nurseryGroveName}, ${state.nurseryGroveSpiritIds.length} spirits, score ${state.nurseryGroveScore}/${state.nurseryGroveRequiredScore}`
        : 'Nursery: pending';
    }
    if (bloomAscendanceLabel) {
      bloomAscendanceLabel.textContent = state.bloomAscendanceProof
        ? `Ascendance: ${state.bloomAscendanceName}, ${state.bloomAscendanceFormTitle}, score ${state.bloomAscendanceScore}/${state.bloomAscendanceRequiredScore}`
        : 'Ascendance: pending';
    }
    if (lineageRegisterLabel) {
      lineageRegisterLabel.textContent = state.lineageRegisterProof
        ? `Lineage: ${state.lineageRegisterName}, ${state.lineageRegisterSpiritIds.length} spirits, score ${state.lineageRegisterScore}/${state.lineageRegisterRequiredScore}`
        : 'Lineage: pending';
    }
    if (commissionLabel) {
      commissionLabel.textContent = state.commissionProof
        ? `Commission: ${state.commissionName}, score ${state.commissionScore}`
        : 'Commission: pending';
    }
    if (rallyLabel) {
      rallyLabel.textContent = state.rallyProof
        ? `Rally: ${state.rallyName}, ${state.rallyPresenceCount} testers, score ${state.rallyScore}`
        : 'Rally: pending';
    }
    if (techniqueLabel) {
      techniqueLabel.textContent = `Technique: ${state.techniqueMasteryLevel || 'novice'}, ${state.techniqueMasteryXp} XP${state.techniqueMoveId ? ` (${state.techniqueMoveId})` : ''}`;
    }
    if (tacticLabel) {
      tacticLabel.textContent = state.tacticProof
        ? `Tactic: ${state.lastTacticId || 'studied'}, ${state.tacticMasteryXp} XP${state.tacticStance ? ` (${state.tacticStance})` : ''}`
        : 'Tactic: not set';
    }
    if (loadoutLabel) {
      loadoutLabel.textContent = state.techniqueLoadoutProof
        ? `Loadout: ${state.techniqueLoadoutName}, score ${state.techniqueLoadoutScore}`
        : 'Loadout: pending';
    }
    if (techniqueCodexLabel) {
      techniqueCodexLabel.textContent = state.techniqueCodexProof
        ? `Technique Codex: ${state.techniqueCodexName}, ${state.techniqueCodexMoveIds.length} moves, score ${state.techniqueCodexScore}/${state.techniqueCodexRequiredScore}`
        : 'Technique Codex: pending';
    }
    if (traitLabel) {
      traitLabel.textContent = state.traitAttunementProof
        ? `Trait: ${state.traitLabel}, score ${state.traitAttunementScore}`
        : 'Trait: pending';
    }
    if (conditionLabel) {
      conditionLabel.textContent = state.conditionWeaveProof
        ? `Condition: ${state.conditionWeaveName}, score ${state.conditionWeaveScore}`
        : 'Condition: pending';
    }
    if (affinityMatrixLabel) {
      affinityMatrixLabel.textContent = state.affinityMatrixProof
        ? `Matrix: ${state.affinityMatrixName}, ${state.affinityMatrixAffinityLabels.length} affinities, score ${state.affinityMatrixScore}/${state.affinityMatrixRequiredScore}`
        : 'Matrix: pending';
    }
    if (relicAttunementLabel) {
      relicAttunementLabel.textContent = state.relicAttunementProof
        ? `Relic: ${state.relicAttunementName}, ${state.relicLabel}, score ${state.relicAttunementScore}/${state.relicAttunementRequiredScore}`
        : 'Relic: pending';
    }
    if (affinityLabel) {
      affinityLabel.textContent = state.affinityProof
        ? `Affinity: ${state.affinityTrialWins} win${state.affinityTrialWins === 1 ? '' : 's'}, ${state.affinityAdvantage ? 'harmonized' : 'studied'}`
        : 'Affinity: trial not started';
    }
    if (partyLabel) {
      partyLabel.textContent = state.partyIds.length
        ? `Party: ${state.partyIds.length} spirit${state.partyIds.length === 1 ? '' : 's'}, ${state.sparLadderWins} ladder win${state.sparLadderWins === 1 ? '' : 's'}`
        : 'Party: not formed';
    }
    if (harmonyLabel) {
      harmonyLabel.textContent = state.harmonyFormProof
        ? `Harmony: ${state.harmonyFormName}, score ${state.harmonyFormScore}`
        : 'Harmony: pending';
    }
    if (harmonyTrialLabel) {
      harmonyTrialLabel.textContent = state.harmonyTrialProof
        ? `Concord: ${state.harmonyTrialName}, score ${state.harmonyTrialScore}`
        : 'Concord: pending';
    }
    if (teamMatchLabel) {
      teamMatchLabel.textContent = state.teamSparMatchProof
        ? `Team Match: ${state.teamSparMatchName}, score ${state.teamSparMatchScore}`
        : 'Team Match: pending';
    }
    if (mentorLabel) {
      mentorLabel.textContent = state.mentorChallengeProof
        ? `Mentor: ${state.mentorChallengeName}, score ${state.mentorChallengeScore}`
        : 'Mentor: pending';
    }
    if (dojoLadderLabel) {
      dojoLadderLabel.textContent = state.dojoLadderProof
        ? `Dojo Ladder: ${state.dojoLadderName}, ${state.dojoLadderOpponentIds.length} clears, score ${state.dojoLadderScore}/${state.dojoLadderRequiredScore}`
        : 'Dojo Ladder: pending';
    }
    if (sifuCouncilLabel) {
      sifuCouncilLabel.textContent = state.sifuCouncilProof
        ? `Sifu Council: ${state.sifuCouncilName}, ${state.sifuCouncilMemberIds.length} seals, score ${state.sifuCouncilScore}/${state.sifuCouncilRequiredScore}`
        : 'Sifu Council: pending';
    }
    if (summitCircuitLabel) {
      summitCircuitLabel.textContent = state.summitCircuitProof
        ? `Summit: ${state.summitCircuitName}, ${state.summitCircuitSealIds.length} seals, score ${state.summitCircuitScore}/${state.summitCircuitRequiredScore}`
        : 'Summit: pending';
    }
    if (tournamentLabel) {
      tournamentLabel.textContent = state.tournamentProof
        ? `Tournament: ${state.tournamentName}, ${state.tournamentPresenceCount} testers, score ${state.tournamentScore}/${state.tournamentRequiredScore}`
        : 'Tournament: pending';
    }
    if (rivalCircleLabel) {
      rivalCircleLabel.textContent = state.rivalCircleProof
        ? `Rival: ${state.rivalCircleName}, ${state.rivalCircleRivalName}, score ${state.rivalCircleScore}/${state.rivalCircleRequiredScore}`
        : 'Rival: pending';
    }
    if (trainingLabel) {
      const raisingLabel = state.raisingProof
        ? `care ${state.raisingCareStreak}, ${state.raisingMilestoneLabel}`
        : 'needs care';
      trainingLabel.textContent = `Training: ${state.trainingXp} XP, ${state.trainingVictories} spar win${state.trainingVictories === 1 ? '' : 's'}, ladder ${state.sparLadderXp} XP, ${raisingLabel}`;
    }
    if (battleRoundLabel) {
      battleRoundLabel.textContent = state.battleRoundProof
        ? `Battle Round: ${state.battleRoundOpponentName}, ${state.battleRoundFocusScore}/${state.battleRoundOpponentScore}, ${state.battleRoundVictory ? 'clear' : 'study'}`
        : 'Battle Round: pending';
    }
    if (growthLabel) {
      growthLabel.textContent = state.growthRiteProof
        ? `Growth Rite: ${state.growthForm}`
        : `Growth Rite: ${state.growth === 'glow' ? 'ready' : 'pending'}`;
    }
    if (questLabel) {
      const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId);
      questLabel.textContent = state.questChainProof
        ? `Quest Chain: ${state.completedQuestIds.length}/${MOCHI_SPIRIT_QUESTS.length} complete`
        : quest
          ? `Quest: ${quest.title}, ${state.completedQuestSteps.length}/${quest.steps.length} steps`
          : 'Quest: not started';
    }
    if (canaryFinalityLabel) {
      canaryFinalityLabel.textContent = state.canaryOperationReviewProof
        ? `Canary Finality: ${state.canaryOperationState}, ${state.canaryInventoryCredited ? 'inventory credited' : 'no inventory credit'}`
        : 'Canary Finality: not reviewed';
    }
    if (marketLabel) {
      let marketText = 'Market: ready - fixed price';
      if (state.charmListed) marketText = 'Market: listed - test soft currency';
      if (state.marketReceiptProof) marketText = `Market: ${state.marketReceiptName} - test only`;
      if (state.tradeProof) marketText = state.provisionProof ? 'Bag: stocked - test only' : 'Trade: proofed - test only';
      if (state.canaryRequested) marketText = 'Canary: requested - preview stub';
      if (state.canaryReturnRequested) marketText = state.canaryRequested ? 'Canary: request + return staged - preview stub' : 'Canary: return staged - preview stub';
      if (state.canaryOperationReviewProof) marketText = `Canary: finality ${state.canaryOperationState} - no credit`;
      marketLabel.textContent = marketText;
    }
    if (feed) {
      feed.innerHTML = '';
      state.chat.slice(-5).forEach((line) => {
        const item = document.createElement('li');
        item.textContent = line;
        feed.appendChild(item);
      });
    }
  }

  window.addEventListener('mochi-social-auth-state', (event) => {
    const detail = (event as CustomEvent<{ state: AuthState }>).detail;
    if (authLabel) {
      authLabel.textContent = detail.state === 'linked' ? 'Linked' : detail.state === 'error' ? 'Auth issue' : 'Guest';
    }
  });

  window.addEventListener('mochi-social-token-state', (event) => {
    const detail = (event as CustomEvent<{ claimed: boolean }>).detail;
    if (tokenLabel) {
      tokenLabel.textContent = detail.claimed ? 'Seal: 1/1' : 'Seal: 0/1';
    }
  });

  hud.querySelectorAll<HTMLButtonElement>('[data-alpha-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionType = button.dataset.alphaAction as AlphaActionType;
      void performAlphaAction(actionType, buildHudActionPayload(actionType));
    });
  });

  hud.querySelectorAll<HTMLButtonElement>('[data-alpha-local-action]').forEach((button) => {
    button.addEventListener('click', () => {
      performAlphaLocalAction(button.dataset.alphaLocalAction as AlphaLocalActionType);
    });
  });
  hud.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-roster-focus]');
    if (!button || button.disabled) return;
    performAlphaLocalAction('spirit.focus', { spiritId: button.dataset.rosterFocus || '' });
  });

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput?.value.trim();
    if (!message) return;
    chatInput!.value = '';
    void performAlphaAction('chat.send', { message });
  });

  window.addEventListener('mochi-social-alpha-state', renderState);
  renderState();
}

function installLocalTabPresence() {
  const label = document.querySelector<HTMLElement>('[data-presence-label]');
  if (!label) return;

  const presenceLabel = label;
  const tabId = getPresenceTabId();
  const peers = new Map<string, number>();
  const storageKey = `${PRESENCE_STORAGE_PREFIX}${tabId}`;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(PRESENCE_CHANNEL) : null;

  function remember(message: PresenceMessage) {
    if (message.tabId !== tabId) {
      peers.set(message.tabId, message.at);
    }
    render();
  }

  function render() {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    for (const [peerId, lastSeen] of peers) {
      if (lastSeen < cutoff) peers.delete(peerId);
    }

    const count = peers.size + 1;
    presenceLabel.dataset.presenceCount = String(count);
    presenceLabel.textContent = count === 1 ? 'Nearby: 1 tester' : `Nearby: ${count} testers`;
  }

  function readStoragePeers() {
    const cutoff = Date.now() - PRESENCE_TTL_MS;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(PRESENCE_STORAGE_PREFIX) || key === storageKey) continue;

      try {
        const message = JSON.parse(localStorage.getItem(key) || 'null') as PresenceMessage | null;
        if (message?.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE' && message.at >= cutoff) {
          remember(message);
        }
      } catch {
        // Ignore stale local presence records from older alpha builds.
      }
    }
  }

  function publish() {
    const message: PresenceMessage = {
      type: 'MOCHI_SOCIAL_LOCAL_PRESENCE',
      tabId,
      at: Date.now()
    };

    channel?.postMessage(message);
    localStorage.setItem(storageKey, JSON.stringify(message));
    readStoragePeers();
    render();
  }

  channel?.addEventListener('message', (event: MessageEvent<PresenceMessage>) => {
    if (event.data?.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE') {
      remember(event.data);
    }
  });

  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(PRESENCE_STORAGE_PREFIX) || !event.newValue) return;

    try {
      const message = JSON.parse(event.newValue) as PresenceMessage;
      if (message.type === 'MOCHI_SOCIAL_LOCAL_PRESENCE') remember(message);
    } catch {
      // Ignore malformed storage events; presence is only a local visual cue.
    }
  });

  const timer = window.setInterval(publish, 1000);
  window.addEventListener('pagehide', () => {
    window.clearInterval(timer);
    channel?.close();
    localStorage.removeItem(storageKey);
  });

  publish();
}

function installLocalMovementPulse() {
  const tabId = getPresenceTabId();
  const storageKey = `${MOVEMENT_STORAGE_PREFIX}${tabId}`;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(MOVEMENT_CHANNEL) : null;
  let pulseTimer = 0;

  function pulseCanvas() {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) return;
    canvas.dataset.remoteMovementPulse = String(Date.now());
    canvas.style.filter = 'brightness(1.018) saturate(1.015)';
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(() => {
      canvas.style.filter = '';
      delete canvas.dataset.remoteMovementPulse;
    }, 4200);
  }

  function receive(message: MovementMessage) {
    if (message.tabId !== tabId && message.type === 'MOCHI_SOCIAL_LOCAL_MOVEMENT') {
      pulseCanvas();
    }
  }

  function publish(key: string) {
    const message: MovementMessage = {
      type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT',
      tabId,
      key,
      at: Date.now()
    };
    channel?.postMessage(message);
    localStorage.setItem(storageKey, JSON.stringify(message));
  }

  channel?.addEventListener('message', (event: MessageEvent<MovementMessage>) => {
    if (event.data?.type === 'MOCHI_SOCIAL_LOCAL_MOVEMENT') receive(event.data);
  });

  window.addEventListener('storage', (event) => {
    if (!event.key?.startsWith(MOVEMENT_STORAGE_PREFIX) || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue) as MovementMessage);
    } catch {
      // Ignore malformed local movement hints; server movement remains authoritative.
    }
  });

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd'].includes(event.key)) {
      publish(event.key);
    }
  }, { capture: true });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(pulseTimer);
    channel?.close();
    localStorage.removeItem(storageKey);
  });
}

function getPresenceTabId() {
  const existing = sessionStorage.getItem(PRESENCE_TAB_KEY);
  if (existing) return existing;

  const tabId = crypto.randomUUID();
  sessionStorage.setItem(PRESENCE_TAB_KEY, tabId);
  return tabId;
}

function readAlphaState(): AlphaHudState {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALPHA_STATE_KEY) || 'null') as Partial<AlphaHudState> | null;
    return {
      ...defaultAlphaState(),
      ...(parsed || {}),
      attunedSpiritIds: Array.isArray(parsed?.attunedSpiritIds) ? parsed.attunedSpiritIds.map(String) : [],
      bondBySpiritId: normalizeBondMap(parsed?.bondBySpiritId, 0),
      growthBySpiritId: normalizeGrowthMap(parsed?.growthBySpiritId),
      careStreakBySpiritId: normalizeBondMap(parsed?.careStreakBySpiritId, 0),
      focusedSpiritHistory: Array.isArray(parsed?.focusedSpiritHistory) ? parsed.focusedSpiritHistory.map(String) : [],
      canaryOperationReviewProof: parsed?.canaryOperationReviewProof === true,
      canaryOperationState: typeof parsed?.canaryOperationState === 'string' ? parsed.canaryOperationState : 'UNSUBMITTED',
      canaryOperationFinalized: parsed?.canaryOperationFinalized === true,
      canaryInventoryCredited: false,
      captureRiteSpiritIds: Array.isArray(parsed?.captureRiteSpiritIds) ? parsed.captureRiteSpiritIds.map(String) : [],
      captureRiteRouteInvitedSpiritIds: Array.isArray(parsed?.captureRiteRouteInvitedSpiritIds) ? parsed.captureRiteRouteInvitedSpiritIds.map(String) : [],
      captureRiteLureItemIds: Array.isArray(parsed?.captureRiteLureItemIds) ? parsed.captureRiteLureItemIds.map(String) : [],
      routeInvitedSpiritIds: Array.isArray(parsed?.routeInvitedSpiritIds) ? parsed.routeInvitedSpiritIds.map(String) : [],
      partyIds: Array.isArray(parsed?.partyIds) ? parsed.partyIds.map(String) : [],
      supportSpiritIds: Array.isArray(parsed?.supportSpiritIds) ? parsed.supportSpiritIds.map(String) : [],
      starterVowItemIds: Array.isArray(parsed?.starterVowItemIds) ? parsed.starterVowItemIds.map(String) : [],
      techniqueCodexPartyIds: Array.isArray(parsed?.techniqueCodexPartyIds) ? parsed.techniqueCodexPartyIds.map(String) : [],
      techniqueCodexMoveIds: Array.isArray(parsed?.techniqueCodexMoveIds) ? parsed.techniqueCodexMoveIds.map(String) : [],
      techniqueCodexTacticIds: Array.isArray(parsed?.techniqueCodexTacticIds) ? parsed.techniqueCodexTacticIds.map(String) : [],
      rosterArchivePartyIds: Array.isArray(parsed?.rosterArchivePartyIds) ? parsed.rosterArchivePartyIds.map(String) : [],
      rosterArchiveReserveIds: Array.isArray(parsed?.rosterArchiveReserveIds) ? parsed.rosterArchiveReserveIds.map(String) : [],
      rosterCabinetSpiritIds: Array.isArray(parsed?.rosterCabinetSpiritIds) ? parsed.rosterCabinetSpiritIds.map(String) : [],
      rosterCabinetPartyIds: Array.isArray(parsed?.rosterCabinetPartyIds) ? parsed.rosterCabinetPartyIds.map(String) : [],
      rosterCabinetReserveIds: Array.isArray(parsed?.rosterCabinetReserveIds) ? parsed.rosterCabinetReserveIds.map(String) : [],
      rosterCabinetSlotLabels: Array.isArray(parsed?.rosterCabinetSlotLabels) ? parsed.rosterCabinetSlotLabels.map(String) : [],
      blossomCradleSpiritIds: Array.isArray(parsed?.blossomCradleSpiritIds) ? parsed.blossomCradleSpiritIds.map(String) : [],
      blossomCradlePartyIds: Array.isArray(parsed?.blossomCradlePartyIds) ? parsed.blossomCradlePartyIds.map(String) : [],
      blossomCradleCareIds: Array.isArray(parsed?.blossomCradleCareIds) ? parsed.blossomCradleCareIds.map(String) : [],
      blossomCradleMilestoneLabels: Array.isArray(parsed?.blossomCradleMilestoneLabels) ? parsed.blossomCradleMilestoneLabels.map(String) : [],
      conditionIds: Array.isArray(parsed?.conditionIds) ? parsed.conditionIds.map(String) : [],
      affinityMatrixSpiritIds: Array.isArray(parsed?.affinityMatrixSpiritIds) ? parsed.affinityMatrixSpiritIds.map(String) : [],
      affinityMatrixAffinityLabels: Array.isArray(parsed?.affinityMatrixAffinityLabels) ? parsed.affinityMatrixAffinityLabels.map(String) : [],
      affinityMatrixConditionIds: Array.isArray(parsed?.affinityMatrixConditionIds) ? parsed.affinityMatrixConditionIds.map(String) : [],
      relicAttunementSpiritIds: Array.isArray(parsed?.relicAttunementSpiritIds) ? parsed.relicAttunementSpiritIds.map(String) : [],
      relicAttunementItemIds: Array.isArray(parsed?.relicAttunementItemIds) ? parsed.relicAttunementItemIds.map(String) : [],
      routeEcologyRouteIds: Array.isArray(parsed?.routeEcologyRouteIds) ? parsed.routeEcologyRouteIds.map(String) : [],
      routeEcologySpeciesIds: Array.isArray(parsed?.routeEcologySpeciesIds) ? parsed.routeEcologySpeciesIds.map(String) : [],
      routeEcologyInvitedSpiritIds: Array.isArray(parsed?.routeEcologyInvitedSpiritIds) ? parsed.routeEcologyInvitedSpiritIds.map(String) : [],
      weatherVeilRouteIds: Array.isArray(parsed?.weatherVeilRouteIds) ? parsed.weatherVeilRouteIds.map(String) : [],
      weatherVeilConditionIds: Array.isArray(parsed?.weatherVeilConditionIds) ? parsed.weatherVeilConditionIds.map(String) : [],
      weatherVeilWindows: Array.isArray(parsed?.weatherVeilWindows) ? parsed.weatherVeilWindows.map(String) : [],
      encounterRotationRouteIds: Array.isArray(parsed?.encounterRotationRouteIds) ? parsed.encounterRotationRouteIds.map(String) : [],
      encounterRotationSpiritIds: Array.isArray(parsed?.encounterRotationSpiritIds) ? parsed.encounterRotationSpiritIds.map(String) : [],
      encounterRotationLureItemIds: Array.isArray(parsed?.encounterRotationLureItemIds) ? parsed.encounterRotationLureItemIds.map(String) : [],
      encounterRotationWindows: Array.isArray(parsed?.encounterRotationWindows) ? parsed.encounterRotationWindows.map(String) : [],
      encounterAtlasRouteIds: Array.isArray(parsed?.encounterAtlasRouteIds) ? parsed.encounterAtlasRouteIds.map(String) : [],
      encounterAtlasSpiritIds: Array.isArray(parsed?.encounterAtlasSpiritIds) ? parsed.encounterAtlasSpiritIds.map(String) : [],
      encounterAtlasCapturedSpiritIds: Array.isArray(parsed?.encounterAtlasCapturedSpiritIds) ? parsed.encounterAtlasCapturedSpiritIds.map(String) : [],
      encounterAtlasRarityTiers: Array.isArray(parsed?.encounterAtlasRarityTiers) ? parsed.encounterAtlasRarityTiers.map(String) : [],
      habitatCensusRouteIds: Array.isArray(parsed?.habitatCensusRouteIds) ? parsed.habitatCensusRouteIds.map(String) : [],
      habitatCensusSpiritIds: Array.isArray(parsed?.habitatCensusSpiritIds) ? parsed.habitatCensusSpiritIds.map(String) : [],
      habitatCensusCareLoggedSpiritIds: Array.isArray(parsed?.habitatCensusCareLoggedSpiritIds) ? parsed.habitatCensusCareLoggedSpiritIds.map(String) : [],
      bondGiftItemIds: Array.isArray(parsed?.bondGiftItemIds) ? parsed.bondGiftItemIds.map(String) : [],
      provisionCatalogItemIds: Array.isArray(parsed?.provisionCatalogItemIds) ? parsed.provisionCatalogItemIds.map(String) : [],
      provisionCatalogCareItemIds: Array.isArray(parsed?.provisionCatalogCareItemIds) ? parsed.provisionCatalogCareItemIds.map(String) : [],
      provisionCatalogRouteItemIds: Array.isArray(parsed?.provisionCatalogRouteItemIds) ? parsed.provisionCatalogRouteItemIds.map(String) : [],
      battleKitItemIds: Array.isArray(parsed?.battleKitItemIds) ? parsed.battleKitItemIds.map(String) : [],
      battleKitPartyIds: Array.isArray(parsed?.battleKitPartyIds) ? parsed.battleKitPartyIds.map(String) : [],
      remedyPouchItemIds: Array.isArray(parsed?.remedyPouchItemIds) ? parsed.remedyPouchItemIds.map(String) : [],
      remedyPouchConditionIds: Array.isArray(parsed?.remedyPouchConditionIds) ? parsed.remedyPouchConditionIds.map(String) : [],
      remedyPouchPartyIds: Array.isArray(parsed?.remedyPouchPartyIds) ? parsed.remedyPouchPartyIds.map(String) : [],
      craftWritRecipeIds: Array.isArray(parsed?.craftWritRecipeIds) ? parsed.craftWritRecipeIds.map(String) : [],
      craftWritStockItemIds: Array.isArray(parsed?.craftWritStockItemIds) ? parsed.craftWritStockItemIds.map(String) : [],
      exchangeAccordItemIds: Array.isArray(parsed?.exchangeAccordItemIds) ? parsed.exchangeAccordItemIds.map(String) : [],
      routeWaystoneRouteIds: Array.isArray(parsed?.routeWaystoneRouteIds) ? parsed.routeWaystoneRouteIds.map(String) : [],
      routeWaystoneInvitedSpiritIds: Array.isArray(parsed?.routeWaystoneInvitedSpiritIds) ? parsed.routeWaystoneInvitedSpiritIds.map(String) : [],
      routeCharterRouteIds: Array.isArray(parsed?.routeCharterRouteIds) ? parsed.routeCharterRouteIds.map(String) : [],
      routeCharterPartyIds: Array.isArray(parsed?.routeCharterPartyIds) ? parsed.routeCharterPartyIds.map(String) : [],
      routeCharterProofIds: Array.isArray(parsed?.routeCharterProofIds) ? parsed.routeCharterProofIds.map(String) : [],
      nurtureRiteRosterIds: Array.isArray(parsed?.nurtureRiteRosterIds) ? parsed.nurtureRiteRosterIds.map(String) : [],
      nurtureRiteCaredSpiritIds: Array.isArray(parsed?.nurtureRiteCaredSpiritIds) ? parsed.nurtureRiteCaredSpiritIds.map(String) : [],
      recoveryTeaPartyIds: Array.isArray(parsed?.recoveryTeaPartyIds) ? parsed.recoveryTeaPartyIds.map(String) : [],
      recoveryTeaCaredSpiritIds: Array.isArray(parsed?.recoveryTeaCaredSpiritIds) ? parsed.recoveryTeaCaredSpiritIds.map(String) : [],
      kinshipAlbumSpiritIds: Array.isArray(parsed?.kinshipAlbumSpiritIds) ? parsed.kinshipAlbumSpiritIds.map(String) : [],
      kinshipAlbumCaredSpiritIds: Array.isArray(parsed?.kinshipAlbumCaredSpiritIds) ? parsed.kinshipAlbumCaredSpiritIds.map(String) : [],
      nurseryGroveSpiritIds: Array.isArray(parsed?.nurseryGroveSpiritIds) ? parsed.nurseryGroveSpiritIds.map(String) : [],
      nurseryGrovePartyIds: Array.isArray(parsed?.nurseryGrovePartyIds) ? parsed.nurseryGrovePartyIds.map(String) : [],
      nurseryGroveCaredSpiritIds: Array.isArray(parsed?.nurseryGroveCaredSpiritIds) ? parsed.nurseryGroveCaredSpiritIds.map(String) : [],
      bloomAscendanceSpiritIds: Array.isArray(parsed?.bloomAscendanceSpiritIds) ? parsed.bloomAscendanceSpiritIds.map(String) : [],
      bloomAscendancePartyIds: Array.isArray(parsed?.bloomAscendancePartyIds) ? parsed.bloomAscendancePartyIds.map(String) : [],
      bloomAscendanceCaredSpiritIds: Array.isArray(parsed?.bloomAscendanceCaredSpiritIds) ? parsed.bloomAscendanceCaredSpiritIds.map(String) : [],
      lineageRegisterSpiritIds: Array.isArray(parsed?.lineageRegisterSpiritIds) ? parsed.lineageRegisterSpiritIds.map(String) : [],
      lineageRegisterPartyIds: Array.isArray(parsed?.lineageRegisterPartyIds) ? parsed.lineageRegisterPartyIds.map(String) : [],
      lineageRegisterCaredSpiritIds: Array.isArray(parsed?.lineageRegisterCaredSpiritIds) ? parsed.lineageRegisterCaredSpiritIds.map(String) : [],
      lineageRegisterMilestoneLabels: Array.isArray(parsed?.lineageRegisterMilestoneLabels) ? parsed.lineageRegisterMilestoneLabels.map(String) : [],
      questLedgerAcceptedQuestIds: Array.isArray(parsed?.questLedgerAcceptedQuestIds) ? parsed.questLedgerAcceptedQuestIds.map(String) : [],
      questLedgerCompletedQuestIds: Array.isArray(parsed?.questLedgerCompletedQuestIds) ? parsed.questLedgerCompletedQuestIds.map(String) : [],
      storyChapterRouteIds: Array.isArray(parsed?.storyChapterRouteIds) ? parsed.storyChapterRouteIds.map(String) : [],
      storyChapterQuestIds: Array.isArray(parsed?.storyChapterQuestIds) ? parsed.storyChapterQuestIds.map(String) : [],
      insigniaCaseSpiritIds: Array.isArray(parsed?.insigniaCaseSpiritIds) ? parsed.insigniaCaseSpiritIds.map(String) : [],
      insigniaCasePartyIds: Array.isArray(parsed?.insigniaCasePartyIds) ? parsed.insigniaCasePartyIds.map(String) : [],
      dojoLadderPartyIds: Array.isArray(parsed?.dojoLadderPartyIds) ? parsed.dojoLadderPartyIds.map(String) : [],
      dojoLadderOpponentIds: Array.isArray(parsed?.dojoLadderOpponentIds) ? parsed.dojoLadderOpponentIds.map(String) : [],
      sifuCouncilPartyIds: Array.isArray(parsed?.sifuCouncilPartyIds) ? parsed.sifuCouncilPartyIds.map(String) : [],
      sifuCouncilMemberIds: Array.isArray(parsed?.sifuCouncilMemberIds) ? parsed.sifuCouncilMemberIds.map(String) : [],
      summitCircuitPartyIds: Array.isArray(parsed?.summitCircuitPartyIds) ? parsed.summitCircuitPartyIds.map(String) : [],
      summitCircuitSealIds: Array.isArray(parsed?.summitCircuitSealIds) ? parsed.summitCircuitSealIds.map(String) : [],
      tournamentPartyIds: Array.isArray(parsed?.tournamentPartyIds) ? parsed.tournamentPartyIds.map(String) : [],
      rivalCirclePartyIds: Array.isArray(parsed?.rivalCirclePartyIds) ? parsed.rivalCirclePartyIds.map(String) : [],
      battleRoundTranscript: Array.isArray(parsed?.battleRoundTranscript) ? parsed.battleRoundTranscript.map(String) : [],
      acceptedQuestIds: Array.isArray(parsed?.acceptedQuestIds) ? parsed.acceptedQuestIds.map(String) : [],
      completedQuestSteps: Array.isArray(parsed?.completedQuestSteps) ? parsed.completedQuestSteps.map(String) : [],
      chat: Array.isArray(parsed?.chat) ? parsed.chat.slice(-ALPHA_CHAT_HISTORY_LIMIT).map(String) : []
    };
  } catch {
    return defaultAlphaState();
  }
}

function writeAlphaState(state: AlphaHudState, options: { preserveSyncMetadata?: boolean } = {}) {
  localStorage.setItem(ALPHA_STATE_KEY, JSON.stringify({ ...state, chat: state.chat.slice(-ALPHA_CHAT_HISTORY_LIMIT) }));
  if (!options.preserveSyncMetadata) {
    localStorage.setItem(ALPHA_STATE_UPDATED_AT_KEY, new Date().toISOString());
  }
  window.dispatchEvent(new CustomEvent('mochi-social-alpha-state'));
}

function appendUniqueAlphaChat(state: AlphaHudState, message: string) {
  if (state.chat[state.chat.length - 1] !== message) {
    state.chat.push(message);
  }
}

function escapeHudText(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderRosterPanel(state: AlphaHudState) {
  const rosterIds = new Set(state.attunedSpiritIds);
  const activeSpiritId = state.spiritId || '';

  return MOCHI_SPIRITS.map((spirit) => {
    const isActive = spirit.id === activeSpiritId;
    const bond = getSpiritBond(state, spirit.id);
    const growth = getSpiritGrowth(state, spirit.id);
    const isBonded = rosterIds.has(spirit.id) || bond > 0;
    const milestone = resolveSpiritBondMilestone(spirit.id, bond, growth);
    const nextMilestone = milestone.nextMilestone?.label || milestone.milestone?.label || spirit.bondMilestones[0]?.label || 'First bond';
    const move = spirit.battle.moves[0];
    const careAction = spirit.careActions[0];
    const raisingNeed = spirit.raisingNeeds[0];
    const status = isBonded ? `${isActive ? 'active' : 'rostered'} ${growth} bond ${bond}/5` : 'invite pending';
    const canary = spirit.certificateEligible ? 'Canary eligible, no real value' : 'preview roster, no real value';

    return `
      <article class="mochi-hud__roster-spirit" data-roster-spirit="${escapeHudText(spirit.id)}" data-roster-active="${isActive ? 'true' : 'false'}" data-roster-bonded="${isBonded ? 'true' : 'false'}">
        <strong>${escapeHudText(spirit.name)}</strong>
        <span>${escapeHudText(spirit.title)}</span>
        <span>${escapeHudText(status)}</span>
        <span>${escapeHudText(spirit.affinity)} affinity, ${escapeHudText(spirit.temperament)}</span>
        <span>${escapeHudText(spirit.capture.invitationLabel)} - ${escapeHudText(spirit.capture.rarity)}</span>
        <span>${escapeHudText(move.label)} / ${escapeHudText(spirit.battle.role)}</span>
        <span>Care: ${escapeHudText(careAction.label)}; Raise: ${escapeHudText(raisingNeed.label)}</span>
        <span>${escapeHudText(nextMilestone)}</span>
        <span>${escapeHudText(canary)}</span>
        <button type="button" data-roster-focus="${escapeHudText(spirit.id)}" ${isBonded ? '' : 'disabled'} aria-label="Focus ${escapeHudText(spirit.name)} as active Mochi Spirit">${isActive ? 'Active' : 'Focus'}</button>
      </article>
    `;
  }).join('');
}

function normalizeBondMap(value: unknown, fallbackBond = 1): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key)
      .map(([key, score]) => [key, Math.max(0, Math.floor(Number(score) || fallbackBond || 0))])
  );
}

function normalizeGrowthMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key)
      .map(([key, growth]) => [key, String(growth || 'seed')])
  );
}

function clampSpiritBond(value: unknown) {
  return Math.max(0, Math.min(5, Math.floor(Number(value) || 0)));
}

function strongestGrowthStage(storedGrowth: string | undefined, bond: number) {
  const stages = ['seed', 'sprout', 'glow'];
  const inferredGrowth = growthStageFromBond(bond);
  const storedIndex = Math.max(0, stages.indexOf(storedGrowth || 'seed'));
  const inferredIndex = Math.max(0, stages.indexOf(inferredGrowth));
  return stages[Math.max(storedIndex, inferredIndex)] || inferredGrowth;
}

function rosterProofBond(state: AlphaHudState, spiritId: string) {
  if (
    state.lineageRegisterSpiritIds.includes(spiritId) ||
    state.blossomCradleSpiritIds.includes(spiritId) ||
    state.bloomAscendanceSpiritIds.includes(spiritId) ||
    state.nurseryGroveSpiritIds.includes(spiritId) ||
    state.kinshipAlbumSpiritIds.includes(spiritId)
  ) {
    return 5;
  }

  if (
    state.nurtureRiteRosterIds.includes(spiritId) ||
    state.recoveryTeaPartyIds.includes(spiritId) ||
    state.careCycleCaredSpiritIds.includes(spiritId) ||
    state.blossomCradleCareIds.includes(spiritId)
  ) {
    return 3;
  }

  if (state.attunedSpiritIds.includes(spiritId) || state.captureRiteSpiritIds.includes(spiritId) || state.routeInvitedSpiritIds.includes(spiritId)) {
    return 1;
  }

  return 0;
}

function getSpiritBond(state: AlphaHudState, spiritId: string) {
  const stored = clampSpiritBond(state.bondBySpiritId[spiritId]);
  const active = state.spiritId === spiritId ? clampSpiritBond(state.bond) : 0;
  return Math.max(stored, active, rosterProofBond(state, spiritId));
}

function getSpiritGrowth(state: AlphaHudState, spiritId: string) {
  const bond = getSpiritBond(state, spiritId);
  return strongestGrowthStage(state.growthBySpiritId[spiritId] || (state.spiritId === spiritId ? state.growth : undefined), bond);
}

function setSpiritProgress(state: AlphaHudState, spiritId: string, bond: unknown, growth?: string) {
  const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId);
  if (!spirit) return false;

  const boundedBond = Math.max(getSpiritBond(state, spiritId), clampSpiritBond(bond));
  const nextGrowth = strongestGrowthStage(growth, boundedBond);
  state.bondBySpiritId[spiritId] = boundedBond;
  state.growthBySpiritId[spiritId] = nextGrowth;
  if (!state.attunedSpiritIds.includes(spiritId)) {
    state.attunedSpiritIds.push(spiritId);
  }
  if (state.spiritId === spiritId) {
    state.bond = boundedBond;
    state.growth = nextGrowth;
  }
  return true;
}

function setRosterProgress(state: AlphaHudState, spiritIds: readonly string[], bond: unknown, growth?: string) {
  for (const spiritId of Array.from(new Set(spiritIds.filter(Boolean)))) {
    setSpiritProgress(state, spiritId, bond, growth);
  }
}

function focusSpirit(state: AlphaHudState, spiritId: string) {
  const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId);
  if (!spirit || !state.attunedSpiritIds.includes(spiritId)) return false;

  const bond = Math.max(1, getSpiritBond(state, spiritId));
  const growth = getSpiritGrowth(state, spiritId);
  state.spiritId = spiritId;
  state.bond = bond;
  state.growth = growth;
  state.bondBySpiritId[spiritId] = bond;
  state.growthBySpiritId[spiritId] = growth;
  state.lastFocusedSpiritId = spiritId;
  state.focusedSpiritHistory = Array.from(new Set([...(state.focusedSpiritHistory || []), spiritId]));
  return true;
}

function applyBattleRoundState(state: AlphaHudState, result: ReturnType<typeof resolveSpiritBattleRound>) {
  if (!result.ok) {
    state.chat.push(result.message);
    return;
  }

  state.battleRoundProof = true;
  state.battleRoundId = result.roundId;
  state.battleRoundOpponentName = result.opponentName;
  state.battleRoundFocusScore = result.focusScore;
  state.battleRoundOpponentScore = result.opponentScore;
  state.battleRoundVictory = result.victory;
  state.battleRoundTranscript = result.participants.map((participant) => `${participant.name}:${participant.moveLabel}:${participant.focusContribution}`);
  appendUniqueAlphaChat(state, result.message);
}

export function applyAlphaWorldState(patch: AlphaWorldStatePatch) {
  const state = readAlphaState();

  if (typeof patch.sealClaimed === 'boolean') {
    window.dispatchEvent(new CustomEvent('mochi-social-token-state', { detail: { claimed: patch.sealClaimed } }));
  }

  if (patch.spirit?.id) {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === patch.spirit?.id);
    state.spiritId = patch.spirit.id;
    if (!state.attunedSpiritIds.includes(patch.spirit.id)) {
      state.attunedSpiritIds.push(patch.spirit.id);
    }
    state.bond = Math.max(0, Math.min(5, Number(patch.spirit.bond) || 0));
    state.growth = patch.spirit.growth || growthStageFromBond(state.bond);
    setSpiritProgress(state, patch.spirit.id, state.bond, state.growth);
    if (spirit) {
      appendUniqueAlphaChat(state, `${spirit.name}: ${state.growth} growth, bond ${state.bond}/5.`);
    }
  }

  if (patch.capture?.spiritId) {
    state.captureProof = true;
    state.lastCaptureSpiritId = patch.capture.spiritId;
    state.spiritId = patch.capture.spiritId;
    setSpiritProgress(state, patch.capture.spiritId, Math.max(1, getSpiritBond(state, patch.capture.spiritId)), 'seed');
    for (const spiritId of patch.capture.roster || [patch.capture.spiritId]) {
      if (!state.attunedSpiritIds.includes(spiritId)) {
        state.attunedSpiritIds.push(spiritId);
      }
      setSpiritProgress(state, spiritId, Math.max(1, getSpiritBond(state, spiritId)));
    }
    appendUniqueAlphaChat(state, patch.capture.message || `Spirit invitation recorded for ${patch.capture.spiritId}.`);
  }

  if (patch.starterVow) {
    state.starterVowProof = patch.starterVow.proof || state.starterVowProof;
    state.starterVowId = patch.starterVow.vowId || state.starterVowId;
    state.starterVowName = patch.starterVow.vowName || state.starterVowName;
    state.starterVowLabel = patch.starterVow.vowLabel || state.starterVowLabel;
    state.starterVowScore = Math.max(state.starterVowScore, Number(patch.starterVow.score) || 0);
    state.starterVowRequiredScore = Math.max(state.starterVowRequiredScore, Number(patch.starterVow.requiredScore) || 0);
    state.starterVowItemIds = Array.isArray(patch.starterVow.itemIds) ? patch.starterVow.itemIds.map(String) : state.starterVowItemIds;
    state.starterSpiritId = patch.starterVow.selectedSpiritId || state.starterSpiritId;
    state.starterSpiritName = patch.starterVow.selectedSpiritName || state.starterSpiritName;
    state.starterKnotClaimed = state.starterKnotClaimed || patch.starterVow.rewardItemId === 'jade-starter-knot';
    if (state.starterSpiritId && !state.attunedSpiritIds.includes(state.starterSpiritId)) {
      state.attunedSpiritIds.push(state.starterSpiritId);
    }
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...(state.starterSpiritId ? [state.starterSpiritId] : [])]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.spiritId = state.starterSpiritId || state.spiritId;
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.starterVow.localPresenceCount) || 1);
    appendUniqueAlphaChat(state, patch.starterVow.message || `${state.starterVowName} recorded as no-real-value starter proof.`);
  }

  if (patch.journal) {
    state.journalProof = patch.journal.proof || state.journalProof;
    state.journalDiscoveredCount = Math.max(state.journalDiscoveredCount, Number(patch.journal.discoveredCount) || 0);
    state.journalTotal = Math.max(1, Number(patch.journal.totalCount) || MOCHI_SPIRITS.length);
    state.lastJournalSpiritId = patch.journal.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.journal.message || `Mochirii spirit journal ${state.journalDiscoveredCount}/${state.journalTotal}.`);
  }

  if (patch.habitatBond) {
    state.habitatBondProof = patch.habitatBond.proof || state.habitatBondProof;
    state.habitatBondId = patch.habitatBond.bondId || state.habitatBondId;
    state.habitatBondName = patch.habitatBond.bondName || state.habitatBondName;
    state.habitatBondScore = Math.max(state.habitatBondScore, Number(patch.habitatBond.score) || 0);
    state.habitatTasselClaimed = state.habitatTasselClaimed || patch.habitatBond.rewardItemId === 'jade-court-habitat-tassel';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.habitatBond.roster.map(String)]));
    state.spiritId = patch.habitatBond.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.habitatBond.message || `${state.habitatBondName} recorded as no-real-value habitat proof.`);
  }

  if (patch.research) {
    state.researchProof = patch.research.proof || state.researchProof;
    state.researchFolioId = patch.research.folioId || state.researchFolioId;
    state.researchFolioName = patch.research.folioName || state.researchFolioName;
    state.researchScore = Math.max(state.researchScore, Number(patch.research.score) || 0);
    state.researchFolioClaimed = state.researchFolioClaimed || patch.research.rewardItemId === 'jade-court-research-folio';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.research.roster.map(String)]));
    state.discoveredRouteIds = Array.from(new Set([...(state.discoveredRouteIds || []), ...patch.research.discoveredRoutes.map(String)]));
    state.spiritId = patch.research.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.research.message || `${state.researchFolioName} recorded as no-real-value research proof.`);
  }

  if (patch.compendium) {
    state.compendiumProof = patch.compendium.proof || state.compendiumProof;
    state.compendiumId = patch.compendium.compendiumId || state.compendiumId;
    state.compendiumName = patch.compendium.compendiumName || state.compendiumName;
    state.compendiumScore = Math.max(state.compendiumScore, Number(patch.compendium.score) || 0);
    state.compendiumSealClaimed = state.compendiumSealClaimed || patch.compendium.rewardItemId === 'jade-court-compendium-seal';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.compendium.roster.map(String)]));
    state.discoveredRouteIds = Array.from(new Set([...(state.discoveredRouteIds || []), ...patch.compendium.discoveredRoutes.map(String)]));
    state.spiritId = patch.compendium.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.compendium.message || `${state.compendiumName} sealed as no-real-value collection proof.`);
  }

  if (patch.provisionSatchel) {
    state.provisionProof = patch.provisionSatchel.proof || state.provisionProof;
    state.provisionSatchelId = patch.provisionSatchel.satchelId || state.provisionSatchelId;
    state.provisionSatchelName = patch.provisionSatchel.satchelName || state.provisionSatchelName;
    state.provisionScore = Math.max(state.provisionScore, Number(patch.provisionSatchel.score) || 0);
    state.provisionStockItemIds = Array.isArray(patch.provisionSatchel.stockItemIds)
      ? patch.provisionSatchel.stockItemIds.map(String)
      : state.provisionStockItemIds;
    state.provisionSatchelClaimed = state.provisionSatchelClaimed || patch.provisionSatchel.rewardItemId === 'jade-court-provision-satchel';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.provisionSatchel.roster.map(String)]));
    state.completedQuestIds = Array.from(new Set([...(state.completedQuestIds || []), ...patch.provisionSatchel.completedQuestIds.map(String)]));
    state.spiritId = patch.provisionSatchel.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.provisionSatchel.message || `${state.provisionSatchelName} stocked as no-real-value item proof.`);
  }

  if (patch.provisionCatalog) {
    state.provisionCatalogProof = patch.provisionCatalog.proof || state.provisionCatalogProof;
    state.provisionCatalogId = patch.provisionCatalog.catalogId || state.provisionCatalogId;
    state.provisionCatalogName = patch.provisionCatalog.catalogName || state.provisionCatalogName;
    state.provisionCatalogScore = Math.max(state.provisionCatalogScore, Number(patch.provisionCatalog.score) || 0);
    state.provisionCatalogRequiredScore = Math.max(state.provisionCatalogRequiredScore, Number(patch.provisionCatalog.requiredScore) || 0);
    state.provisionCatalogItemIds = Array.isArray(patch.provisionCatalog.itemIds)
      ? patch.provisionCatalog.itemIds.map(String)
      : state.provisionCatalogItemIds;
    state.provisionCatalogCareItemIds = Array.isArray(patch.provisionCatalog.careItemIds)
      ? patch.provisionCatalog.careItemIds.map(String)
      : state.provisionCatalogCareItemIds;
    state.provisionCatalogRouteItemIds = Array.isArray(patch.provisionCatalog.routeItemIds)
      ? patch.provisionCatalog.routeItemIds.map(String)
      : state.provisionCatalogRouteItemIds;
    state.provisionCatalogPresenceCount = Math.max(state.provisionCatalogPresenceCount, Number(patch.provisionCatalog.localPresenceCount) || 0);
    state.provisionCatalogSealClaimed = state.provisionCatalogSealClaimed || patch.provisionCatalog.rewardItemId === 'jade-provision-catalog-seal';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.provisionCatalog.roster.map(String)]));
    state.spiritId = patch.provisionCatalog.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.provisionCatalog.message || `${state.provisionCatalogName} sealed as no-real-value item catalog proof.`);
  }

  if (patch.battleKit) {
    state.battleKitProof = patch.battleKit.proof || state.battleKitProof;
    state.battleKitId = patch.battleKit.kitId || state.battleKitId;
    state.battleKitName = patch.battleKit.kitName || state.battleKitName;
    state.battleKitScore = Math.max(state.battleKitScore, Number(patch.battleKit.score) || 0);
    state.battleKitRequiredScore = Math.max(state.battleKitRequiredScore, Number(patch.battleKit.requiredScore) || 0);
    state.battleKitItemIds = Array.isArray(patch.battleKit.itemIds) ? patch.battleKit.itemIds.map(String) : state.battleKitItemIds;
    state.battleKitPartyIds = Array.isArray(patch.battleKit.partyIds) ? patch.battleKit.partyIds.map(String) : state.battleKitPartyIds;
    state.battleKitPresenceCount = Math.max(state.battleKitPresenceCount, Number(patch.battleKit.localPresenceCount) || 0);
    state.battleKitTagClaimed = state.battleKitTagClaimed || patch.battleKit.rewardItemId === 'jade-battle-kit-tag';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.battleKit.roster.map(String)]));
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.battleKit.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.activePartyId = state.partyIds[0] || state.activePartyId;
    state.spiritId = patch.battleKit.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.battleKit.message || `${state.battleKitName} packed as no-real-value battle item kit proof.`);
  }

  if (patch.remedyPouch) {
    state.remedyPouchProof = patch.remedyPouch.proof || state.remedyPouchProof;
    state.remedyPouchId = patch.remedyPouch.pouchId || state.remedyPouchId;
    state.remedyPouchName = patch.remedyPouch.pouchName || state.remedyPouchName;
    state.remedyPouchScore = Math.max(state.remedyPouchScore, Number(patch.remedyPouch.score) || 0);
    state.remedyPouchRequiredScore = Math.max(state.remedyPouchRequiredScore, Number(patch.remedyPouch.requiredScore) || 0);
    state.remedyPouchItemIds = Array.isArray(patch.remedyPouch.itemIds) ? patch.remedyPouch.itemIds.map(String) : state.remedyPouchItemIds;
    state.remedyPouchConditionIds = Array.isArray(patch.remedyPouch.conditionIds)
      ? patch.remedyPouch.conditionIds.map(String)
      : state.remedyPouchConditionIds;
    state.remedyPouchPartyIds = Array.isArray(patch.remedyPouch.partyIds)
      ? patch.remedyPouch.partyIds.map(String)
      : state.remedyPouchPartyIds;
    state.remedyPouchPresenceCount = Math.max(state.remedyPouchPresenceCount, Number(patch.remedyPouch.localPresenceCount) || 0);
    state.remedyPouchTagClaimed = state.remedyPouchTagClaimed || patch.remedyPouch.rewardItemId === 'jade-remedy-pouch-tag';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.remedyPouch.roster.map(String)]));
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.remedyPouch.partyIds.map(String)]));
    state.conditionIds = Array.from(new Set([...(state.conditionIds || []), ...patch.remedyPouch.conditionIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.activePartyId = state.partyIds[0] || state.activePartyId;
    state.spiritId = patch.remedyPouch.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.remedyPouch.message || `${state.remedyPouchName} packed as no-real-value remedy pouch proof.`);
  }

  if (patch.guildCommission) {
    state.commissionProof = patch.guildCommission.proof || state.commissionProof;
    state.commissionId = patch.guildCommission.commissionId || state.commissionId;
    state.commissionName = patch.guildCommission.commissionName || state.commissionName;
    state.commissionScore = Math.max(state.commissionScore, Number(patch.guildCommission.score) || 0);
    state.commissionKnotClaimed = state.commissionKnotClaimed || patch.guildCommission.rewardItemId === 'jade-court-commission-knot';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.guildCommission.roster.map(String)]));
    state.completedQuestIds = Array.from(new Set([...(state.completedQuestIds || []), ...patch.guildCommission.completedQuestIds.map(String)]));
    state.spiritId = patch.guildCommission.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.guildCommission.message || `${state.commissionName} recorded as no-real-value guild proof.`);
  }

  if (patch.guildSocialRally) {
    state.rallyProof = patch.guildSocialRally.proof || state.rallyProof;
    state.rallyId = patch.guildSocialRally.rallyId || state.rallyId;
    state.rallyName = patch.guildSocialRally.rallyName || state.rallyName;
    state.rallyScore = Math.max(state.rallyScore, Number(patch.guildSocialRally.score) || 0);
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.guildSocialRally.localPresenceCount) || 1);
    state.rallyKnotClaimed = state.rallyKnotClaimed || patch.guildSocialRally.rewardItemId === 'jade-courtyard-rally-knot';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.guildSocialRally.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.activePartyId = state.partyIds[0] || state.activePartyId;
    state.spiritId = state.partyIds[0] || state.spiritId;
    appendUniqueAlphaChat(state, patch.guildSocialRally.message || `${state.rallyName} recorded as no-real-value two-tester guild proof.`);
  }

  if (patch.questLedger) {
    state.questLedgerProof = patch.questLedger.proof || state.questLedgerProof;
    state.questLedgerId = patch.questLedger.ledgerId || state.questLedgerId;
    state.questLedgerName = patch.questLedger.ledgerName || state.questLedgerName;
    state.questLedgerScore = Math.max(state.questLedgerScore, Number(patch.questLedger.score) || 0);
    state.questLedgerRequiredScore = Math.max(state.questLedgerRequiredScore, Number(patch.questLedger.requiredScore) || 0);
    state.questLedgerAcceptedQuestIds = Array.isArray(patch.questLedger.acceptedQuestIds) ? patch.questLedger.acceptedQuestIds.map(String) : state.questLedgerAcceptedQuestIds;
    state.questLedgerCompletedQuestIds = Array.isArray(patch.questLedger.completedQuestIds) ? patch.questLedger.completedQuestIds.map(String) : state.questLedgerCompletedQuestIds;
    state.questLedgerSealClaimed = state.questLedgerSealClaimed || patch.questLedger.rewardItemId === 'jade-quest-ledger-seal';
    state.attunedSpiritIds = Array.from(new Set([...(state.attunedSpiritIds || []), ...patch.questLedger.roster.map(String)]));
    state.acceptedQuestIds = Array.from(new Set([...(state.acceptedQuestIds || []), ...patch.questLedger.acceptedQuestIds.map(String)]));
    state.completedQuestIds = Array.from(new Set([...(state.completedQuestIds || []), ...patch.questLedger.completedQuestIds.map(String)]));
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.questLedger.localPresenceCount) || 1);
    appendUniqueAlphaChat(state, patch.questLedger.message || `${state.questLedgerName} sealed as no-real-value quest ledger proof.`);
  }

  if (patch.expedition) {
    state.expeditionProof = patch.expedition.proof || state.expeditionProof;
    state.lastExpeditionRouteId = patch.expedition.routeId || state.lastExpeditionRouteId;
    state.lastExpeditionEncounterId = patch.expedition.encounterSpiritId || state.lastExpeditionEncounterId;
    state.discoveredRouteIds = Array.from(new Set([...(state.discoveredRouteIds || []), ...patch.expedition.discoveredRoutes.map(String)]));
    state.expeditionCount = Math.max(state.expeditionCount, Number(patch.expedition.count) || state.discoveredRouteIds.length);
    state.routeRibbonClaimed = state.routeRibbonClaimed || patch.expedition.rewardItemId === 'moonbridge-field-ribbon';
    appendUniqueAlphaChat(state, patch.expedition.message || `Route scouted: ${patch.expedition.routeName}.`);
  }

  if (patch.fieldAccord) {
    state.fieldAccordProof = patch.fieldAccord.proof || state.fieldAccordProof;
    state.fieldAccordId = patch.fieldAccord.accordId || state.fieldAccordId;
    state.fieldAccordName = patch.fieldAccord.accordName || state.fieldAccordName;
    state.fieldAccordScore = Math.max(state.fieldAccordScore, Number(patch.fieldAccord.score) || 0);
    state.fieldAccordRequiredScore = Math.max(state.fieldAccordRequiredScore, Number(patch.fieldAccord.requiredScore) || 0);
    state.lastFieldAccordRouteId = patch.fieldAccord.routeId || state.lastFieldAccordRouteId;
    state.lastFieldAccordSpiritId = patch.fieldAccord.spiritId || state.lastFieldAccordSpiritId;
    state.fieldAccordTalismanClaimed = state.fieldAccordTalismanClaimed || patch.fieldAccord.rewardItemId === 'jade-field-accord-talisman';
    appendUniqueAlphaChat(state, patch.fieldAccord.message || `${state.fieldAccordName} recorded as no-real-value field accord proof.`);
  }

  if (patch.routeInvite) {
    state.routeInviteProof = patch.routeInvite.proof || state.routeInviteProof;
    state.lastRouteInviteRouteId = patch.routeInvite.routeId || state.lastRouteInviteRouteId;
    state.lastRouteInviteSpiritId = patch.routeInvite.spiritId || state.lastRouteInviteSpiritId;
    if (patch.routeInvite.spiritId && !state.routeInvitedSpiritIds.includes(patch.routeInvite.spiritId)) {
      state.routeInvitedSpiritIds.push(patch.routeInvite.spiritId);
    }
    state.captureProof = true;
    state.lastCaptureSpiritId = patch.routeInvite.spiritId || state.lastCaptureSpiritId;
    state.spiritId = patch.routeInvite.spiritId || state.spiritId;
    for (const spiritId of patch.routeInvite.roster || [patch.routeInvite.spiritId]) {
      if (!state.attunedSpiritIds.includes(spiritId)) {
        state.attunedSpiritIds.push(spiritId);
      }
    }
    state.bond = Math.max(state.bond, 1);
    state.growth = state.growth || 'seed';
    appendUniqueAlphaChat(state, patch.routeInvite.message || `Route invitation recorded for ${patch.routeInvite.routeName}.`);
  }

  if (patch.routeMastery) {
    state.routeMasteryProof = patch.routeMastery.proof || state.routeMasteryProof;
    state.routeMasteryId = patch.routeMastery.masteryId || state.routeMasteryId;
    state.routeMasteryTitle = patch.routeMastery.title || state.routeMasteryTitle;
    state.routeMasteryScore = Math.max(state.routeMasteryScore, Number(patch.routeMastery.score) || 0);
    state.routeMasteryKnotClaimed = state.routeMasteryKnotClaimed || patch.routeMastery.rewardItemId === 'cloudbell-route-knot';
    appendUniqueAlphaChat(state, patch.routeMastery.message || `${state.routeMasteryTitle} field mastery recorded.`);
  }

  if (patch.technique) {
    state.techniqueProof = patch.technique.proof || state.techniqueProof;
    state.techniqueMoveId = patch.technique.moveId || state.techniqueMoveId;
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, Number(patch.technique.masteryXp) || 0);
    state.techniqueMasteryLevel = patch.technique.masteryLevel || state.techniqueMasteryLevel;
    state.techniqueFocusScore = Math.max(state.techniqueFocusScore, Number(patch.technique.focusScore) || 0);
    state.spiritId = patch.technique.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.technique.message || `Technique mastery ${state.techniqueMasteryLevel} ${state.techniqueMasteryXp} XP.`);
  }

  if (patch.tactic) {
    state.tacticProof = patch.tactic.proof || state.tacticProof;
    state.lastTacticId = patch.tactic.tacticId || state.lastTacticId;
    state.lastTacticSpiritId = patch.tactic.spiritId || state.lastTacticSpiritId;
    state.lastTacticMoveId = patch.tactic.moveId || state.lastTacticMoveId;
    state.tacticStance = patch.tactic.stance || state.tacticStance;
    state.tacticFocusScore = Math.max(state.tacticFocusScore, Number(patch.tactic.focusScore) || 0);
    state.tacticMasteryXp = Math.max(state.tacticMasteryXp, Number(patch.tactic.masteryXp) || 0);
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, state.tacticMasteryXp);
    state.techniqueMasteryLevel = techniqueMasteryLevelFromXp(state.techniqueMasteryXp);
    state.techniqueMoveId = patch.tactic.moveId || state.techniqueMoveId;
    state.spiritId = patch.tactic.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.tactic.message || `Battle tactic ${state.lastTacticId || 'studied'} ${state.tacticMasteryXp} XP.`);
  }

  if (patch.techniqueLoadout) {
    state.techniqueLoadoutProof = patch.techniqueLoadout.proof || state.techniqueLoadoutProof;
    state.techniqueLoadoutId = patch.techniqueLoadout.loadoutId || state.techniqueLoadoutId;
    state.techniqueLoadoutName = patch.techniqueLoadout.loadoutName || state.techniqueLoadoutName;
    state.techniqueLoadoutScore = Math.max(state.techniqueLoadoutScore, Number(patch.techniqueLoadout.score) || 0);
    state.techniqueLoadoutMoves = Array.isArray(patch.techniqueLoadout.moves) ? patch.techniqueLoadout.moves.map(String) : state.techniqueLoadoutMoves;
    state.loadoutSlipClaimed = state.loadoutSlipClaimed || patch.techniqueLoadout.rewardItemId === 'jade-step-loadout-slip';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.techniqueLoadout.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.techniqueLoadout.message || `${state.techniqueLoadoutName} recorded as no-real-value move loadout proof.`);
  }

  if (patch.techniqueCodex) {
    state.techniqueCodexProof = patch.techniqueCodex.proof || state.techniqueCodexProof;
    state.techniqueCodexId = patch.techniqueCodex.codexId || state.techniqueCodexId;
    state.techniqueCodexName = patch.techniqueCodex.codexName || state.techniqueCodexName;
    state.techniqueCodexScore = Math.max(state.techniqueCodexScore, Number(patch.techniqueCodex.score) || 0);
    state.techniqueCodexRequiredScore = Math.max(state.techniqueCodexRequiredScore, Number(patch.techniqueCodex.requiredScore) || 0);
    state.techniqueCodexPartyIds = Array.isArray(patch.techniqueCodex.partyIds) ? patch.techniqueCodex.partyIds.map(String) : state.techniqueCodexPartyIds;
    state.techniqueCodexMoveIds = Array.isArray(patch.techniqueCodex.masteredMoveIds) ? patch.techniqueCodex.masteredMoveIds.map(String) : state.techniqueCodexMoveIds;
    state.techniqueCodexTacticIds = Array.isArray(patch.techniqueCodex.tacticIds) ? patch.techniqueCodex.tacticIds.map(String) : state.techniqueCodexTacticIds;
    state.techniqueCodexSealClaimed = state.techniqueCodexSealClaimed || patch.techniqueCodex.rewardItemId === 'jade-technique-codex-seal';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...state.techniqueCodexPartyIds]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.techniqueCodex.message || `${state.techniqueCodexName} sealed as no-real-value technique codex proof.`);
  }

  if (patch.traitAttunement) {
    state.traitAttunementProof = patch.traitAttunement.proof || state.traitAttunementProof;
    state.traitAttunementId = patch.traitAttunement.traitId || state.traitAttunementId;
    state.traitAttunementName = patch.traitAttunement.traitName || state.traitAttunementName;
    state.traitLabel = patch.traitAttunement.traitLabel || state.traitLabel;
    state.traitAttunementScore = Math.max(state.traitAttunementScore, Number(patch.traitAttunement.score) || 0);
    state.traitThreadClaimed = state.traitThreadClaimed || patch.traitAttunement.rewardItemId === 'jade-heart-trait-thread';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.traitAttunement.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.spiritId = patch.traitAttunement.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.traitAttunement.message || `${state.traitLabel} recorded as no-real-value trait proof.`);
  }

  if (patch.conditionWeave) {
    state.conditionWeaveProof = patch.conditionWeave.proof || state.conditionWeaveProof;
    state.conditionWeaveId = patch.conditionWeave.weaveId || state.conditionWeaveId;
    state.conditionWeaveName = patch.conditionWeave.weaveName || state.conditionWeaveName;
    state.conditionWeaveScore = Math.max(state.conditionWeaveScore, Number(patch.conditionWeave.score) || 0);
    state.conditionIds = Array.isArray(patch.conditionWeave.conditionIds) ? patch.conditionWeave.conditionIds.map(String) : state.conditionIds;
    state.conditionCharmClaimed = state.conditionCharmClaimed || patch.conditionWeave.rewardItemId === 'jade-mirror-condition-charm';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.conditionWeave.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.spiritId = patch.conditionWeave.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.conditionWeave.message || `${state.conditionWeaveName} recorded as no-real-value condition proof.`);
  }

  if (patch.relicAttunement) {
    state.relicAttunementProof = patch.relicAttunement.proof || state.relicAttunementProof;
    state.relicAttunementId = patch.relicAttunement.relicAttunementId || state.relicAttunementId;
    state.relicAttunementName = patch.relicAttunement.relicAttunementName || state.relicAttunementName;
    state.relicAttunementScore = Math.max(state.relicAttunementScore, Number(patch.relicAttunement.score) || 0);
    state.relicAttunementRequiredScore = Math.max(state.relicAttunementRequiredScore, Number(patch.relicAttunement.requiredScore) || 0);
    state.relicAttunementSpiritIds = Array.isArray(patch.relicAttunement.partyIds) ? patch.relicAttunement.partyIds.map(String) : state.relicAttunementSpiritIds;
    state.relicAttunementItemIds = Array.isArray(patch.relicAttunement.itemIds) ? patch.relicAttunement.itemIds.map(String) : state.relicAttunementItemIds;
    state.relicLabel = patch.relicAttunement.relicLabel || state.relicLabel;
    state.relicSilkCordClaimed = state.relicSilkCordClaimed || patch.relicAttunement.rewardItemId === 'jade-relic-silk-cord';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...state.relicAttunementSpiritIds]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.relicAttunement.localPresenceCount) || 1);
    state.spiritId = patch.relicAttunement.activeSpiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.relicAttunement.message || `${state.relicAttunementName} recorded as no-real-value relic attunement proof.`);
  }

  if (patch.rank) {
    state.guildRankProof = patch.rank.proof || state.guildRankProof;
    state.guildRankId = patch.rank.trialId || state.guildRankId;
    state.guildRankTitle = patch.rank.rankTitle || state.guildRankTitle;
    state.guildRankScore = Math.max(state.guildRankScore, Number(patch.rank.score) || 0);
    state.guildRankSealClaimed = state.guildRankSealClaimed || patch.rank.rewardItemId === 'jade-court-rank-seal';
    appendUniqueAlphaChat(state, patch.rank.message || `Guild rank recorded: ${state.guildRankTitle}.`);
  }

  if (patch.growthRite) {
    state.growthRiteProof = patch.growthRite.proof || state.growthRiteProof;
    state.growthRiteId = patch.growthRite.riteId || state.growthRiteId;
    state.growthForm = patch.growthRite.formTitle || state.growthForm;
    state.growthSigilClaimed = state.growthSigilClaimed || patch.growthRite.rewardItemId === 'moonwell-bloom-sigil';
    state.spiritId = patch.growthRite.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.growthRite.message || `Growth rite recorded: ${state.growthForm}.`);
  }

  if (patch.affinity) {
    state.affinityProof = patch.affinity.proof || state.affinityProof;
    state.lastAffinityTrialId = patch.affinity.trialId || state.lastAffinityTrialId;
    state.affinityAdvantage = Boolean(patch.affinity.affinityAdvantage);
    state.affinityFocusScore = Math.max(state.affinityFocusScore, Number(patch.affinity.focusScore) || 0);
    state.affinityTrialScore = Math.max(state.affinityTrialScore, Number(patch.affinity.trialScore) || 0);
    state.affinityTrialWins = Math.max(state.affinityTrialWins, Number(patch.affinity.wins) || 0);
    state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, Number(patch.affinity.masteryXp) || 0);
    state.techniqueMoveId = patch.affinity.moveId || state.techniqueMoveId;
    state.spiritId = patch.affinity.spiritId || state.spiritId;
    appendUniqueAlphaChat(state, patch.affinity.message || `Affinity trial ${patch.affinity.victory ? 'cleared' : 'studied'}.`);
  }

  if (patch.charmListed) {
    state.charmListed = true;
    appendUniqueAlphaChat(state, 'Jade Thread Charm listed from the town board. Test soft currency only.');
  }

  if (patch.marketReceipt) {
    state.marketReceiptProof = patch.marketReceipt.proof || state.marketReceiptProof;
    state.marketReceiptId = patch.marketReceipt.receiptId || state.marketReceiptId;
    state.marketReceiptName = patch.marketReceipt.receiptName || state.marketReceiptName;
    state.marketReceiptItemId = patch.marketReceipt.itemId || state.marketReceiptItemId;
    state.marketReceiptQuantity = Number(patch.marketReceipt.quantity) || state.marketReceiptQuantity;
    state.marketReceiptPrice = Number(patch.marketReceipt.price) || state.marketReceiptPrice;
    state.marketReceiptCurrency = patch.marketReceipt.currency || state.marketReceiptCurrency;
    state.marketReceiptScore = Math.max(state.marketReceiptScore, Number(patch.marketReceipt.score) || 0);
    state.marketReceiptRequiredScore = Math.max(state.marketReceiptRequiredScore, Number(patch.marketReceipt.requiredScore) || 0);
    state.marketReceiptClaimed = state.marketReceiptClaimed || patch.marketReceipt.rewardItemId === 'jade-market-receipt';
    appendUniqueAlphaChat(state, patch.marketReceipt.message || `${state.marketReceiptName} recorded from the town board. No real value.`);
  }

  if (patch.party) {
    state.activePartyId = patch.party.activeSpiritId || patch.party.partyIds[0];
    state.partyIds = patch.party.partyIds.map(String);
    state.supportSpiritIds = patch.party.supportIds.map(String);
    appendUniqueAlphaChat(state, patch.party.message || `Party formed with ${state.partyIds.length} Mochi Spirits.`);
  }

  if (patch.harmonyForm) {
    state.harmonyFormProof = patch.harmonyForm.proof || state.harmonyFormProof;
    state.harmonyFormId = patch.harmonyForm.formId || state.harmonyFormId;
    state.harmonyFormName = patch.harmonyForm.name || state.harmonyFormName;
    state.harmonyFormScore = Math.max(state.harmonyFormScore, Number(patch.harmonyForm.score) || 0);
    state.harmonySashClaimed = state.harmonySashClaimed || patch.harmonyForm.rewardItemId === 'triune-jade-sash';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.harmonyForm.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.harmonyForm.message || `${state.harmonyFormName} recorded as no-real-value party harmony proof.`);
  }

  if (patch.harmonyTrial) {
    state.harmonyTrialProof = patch.harmonyTrial.proof || state.harmonyTrialProof;
    state.harmonyTrialId = patch.harmonyTrial.trialId || state.harmonyTrialId;
    state.harmonyTrialName = patch.harmonyTrial.trialName || state.harmonyTrialName;
    state.harmonyTrialScore = Math.max(state.harmonyTrialScore, Number(patch.harmonyTrial.score) || 0);
    state.concordTallyClaimed = state.concordTallyClaimed || patch.harmonyTrial.rewardItemId === 'jade-echo-concord-tally';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.harmonyTrial.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.harmonyTrial.message || `${state.harmonyTrialName} recorded as no-real-value concord proof.`);
  }

  if (patch.teamSparMatch) {
    state.teamSparMatchProof = patch.teamSparMatch.proof || state.teamSparMatchProof;
    state.teamSparMatchId = patch.teamSparMatch.matchId || state.teamSparMatchId;
    state.teamSparMatchName = patch.teamSparMatch.matchName || state.teamSparMatchName;
    state.teamSparMatchScore = Math.max(state.teamSparMatchScore, Number(patch.teamSparMatch.score) || 0);
    state.teamMatchRibbonClaimed = state.teamMatchRibbonClaimed || patch.teamSparMatch.rewardItemId === 'jade-mirror-match-ribbon';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.teamSparMatch.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.teamSparMatch.message || `${state.teamSparMatchName} recorded as no-real-value team match proof.`);
  }

  if (patch.mentorChallenge) {
    state.mentorChallengeProof = patch.mentorChallenge.proof || state.mentorChallengeProof;
    state.mentorChallengeId = patch.mentorChallenge.challengeId || state.mentorChallengeId;
    state.mentorChallengeName = patch.mentorChallenge.challengeName || state.mentorChallengeName;
    state.mentorChallengeScore = Math.max(state.mentorChallengeScore, Number(patch.mentorChallenge.score) || 0);
    state.mentorSealClaimed = state.mentorSealClaimed || patch.mentorChallenge.rewardItemId === 'silk-banner-mentor-seal';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...patch.mentorChallenge.partyIds.map(String)]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.mentorChallenge.message || `${state.mentorChallengeName} recorded as no-real-value mentor challenge proof.`);
  }

  if (patch.dojoLadder) {
    state.dojoLadderProof = patch.dojoLadder.proof || state.dojoLadderProof;
    state.dojoLadderId = patch.dojoLadder.ladderId || state.dojoLadderId;
    state.dojoLadderName = patch.dojoLadder.ladderName || state.dojoLadderName;
    state.dojoLadderScore = Math.max(state.dojoLadderScore, Number(patch.dojoLadder.score) || 0);
    state.dojoLadderRequiredScore = Math.max(state.dojoLadderRequiredScore, Number(patch.dojoLadder.requiredScore) || 0);
    state.dojoLadderPartyIds = Array.isArray(patch.dojoLadder.partyIds) ? patch.dojoLadder.partyIds.map(String) : state.dojoLadderPartyIds;
    state.dojoLadderOpponentIds = Array.isArray(patch.dojoLadder.clearedOpponentIds) ? patch.dojoLadder.clearedOpponentIds.map(String) : state.dojoLadderOpponentIds;
    state.dojoLadderSealClaimed = state.dojoLadderSealClaimed || patch.dojoLadder.rewardItemId === 'jade-dojo-ladder-seal';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...state.dojoLadderPartyIds]));
    state.supportSpiritIds = state.partyIds.slice(1);
    appendUniqueAlphaChat(state, patch.dojoLadder.message || `${state.dojoLadderName} recorded as no-real-value dojo ladder proof.`);
  }

  if (patch.sifuCouncil) {
    state.sifuCouncilProof = patch.sifuCouncil.proof || state.sifuCouncilProof;
    state.sifuCouncilId = patch.sifuCouncil.councilId || state.sifuCouncilId;
    state.sifuCouncilName = patch.sifuCouncil.councilName || state.sifuCouncilName;
    state.sifuCouncilScore = Math.max(state.sifuCouncilScore, Number(patch.sifuCouncil.score) || 0);
    state.sifuCouncilRequiredScore = Math.max(state.sifuCouncilRequiredScore, Number(patch.sifuCouncil.requiredScore) || 0);
    state.sifuCouncilPartyIds = Array.isArray(patch.sifuCouncil.partyIds) ? patch.sifuCouncil.partyIds.map(String) : state.sifuCouncilPartyIds;
    state.sifuCouncilMemberIds = Array.isArray(patch.sifuCouncil.clearedCouncilMemberIds) ? patch.sifuCouncil.clearedCouncilMemberIds.map(String) : state.sifuCouncilMemberIds;
    state.sifuCouncilCrestClaimed = state.sifuCouncilCrestClaimed || patch.sifuCouncil.rewardItemId === 'jade-sifu-council-crest';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...state.sifuCouncilPartyIds]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.sifuCouncil.localPresenceCount) || 1);
    appendUniqueAlphaChat(state, patch.sifuCouncil.message || `${state.sifuCouncilName} recorded as no-real-value sifu council proof.`);
  }

  if (patch.summitCircuit) {
    state.summitCircuitProof = patch.summitCircuit.proof || state.summitCircuitProof;
    state.summitCircuitId = patch.summitCircuit.circuitId || state.summitCircuitId;
    state.summitCircuitName = patch.summitCircuit.circuitName || state.summitCircuitName;
    state.summitCircuitScore = Math.max(state.summitCircuitScore, Number(patch.summitCircuit.score) || 0);
    state.summitCircuitRequiredScore = Math.max(state.summitCircuitRequiredScore, Number(patch.summitCircuit.requiredScore) || 0);
    state.summitCircuitPartyIds = Array.isArray(patch.summitCircuit.partyIds) ? patch.summitCircuit.partyIds.map(String) : state.summitCircuitPartyIds;
    state.summitCircuitSealIds = Array.isArray(patch.summitCircuit.summitSealIds) ? patch.summitCircuit.summitSealIds.map(String) : state.summitCircuitSealIds;
    state.summitCircuitLaurelClaimed = state.summitCircuitLaurelClaimed || patch.summitCircuit.rewardItemId === 'jade-summit-circuit-laurel';
    state.partyIds = Array.from(new Set([...(state.partyIds || []), ...state.summitCircuitPartyIds]));
    state.supportSpiritIds = state.partyIds.slice(1);
    state.rallyPresenceCount = Math.max(state.rallyPresenceCount, Number(patch.summitCircuit.localPresenceCount) || 1);
    appendUniqueAlphaChat(state, patch.summitCircuit.message || `${state.summitCircuitName} recorded as no-real-value summit circuit proof.`);
  }

  if (patch.training) {
    state.trainingXp = Math.max(state.trainingXp, Number(patch.training.xp) || 0);
    state.trainingVictories = Math.max(state.trainingVictories, Number(patch.training.victories) || 0);
    appendUniqueAlphaChat(state, patch.training.message || `Training ring: ${state.trainingXp} XP, ${state.trainingVictories} spar wins.`);
  }

  if (patch.spar) {
    state.sparLadderXp = Math.max(state.sparLadderXp, Number(patch.spar.xp) || 0);
    state.sparLadderWins = Math.max(state.sparLadderWins, Number(patch.spar.wins) || 0);
    state.lastSparOpponentId = patch.spar.opponentId;
    appendUniqueAlphaChat(state, patch.spar.message || `Spar ladder ${patch.spar.victory ? 'cleared' : 'practiced'}.`);
  }

  if (patch.battleRound) {
    state.battleRoundProof = true;
    state.battleRoundId = patch.battleRound.roundId;
    state.battleRoundOpponentName = patch.battleRound.opponentName;
    state.battleRoundFocusScore = Number(patch.battleRound.focusScore) || 0;
    state.battleRoundOpponentScore = Number(patch.battleRound.opponentScore) || 0;
    state.battleRoundVictory = Boolean(patch.battleRound.victory);
    state.battleRoundTranscript = Array.isArray(patch.battleRound.participants) ? patch.battleRound.participants.map(String) : state.battleRoundTranscript;
    appendUniqueAlphaChat(state, patch.battleRound.message || `Battle round transcript recorded against ${state.battleRoundOpponentName}.`);
  }

  if (patch.raising) {
    state.raisingProof = patch.raising.proof || state.raisingProof;
    state.raisingCareStreak = Math.max(state.raisingCareStreak, Number(patch.raising.careStreak) || 0);
    state.lastRaisingNeedId = patch.raising.needId || state.lastRaisingNeedId;
    state.nextRaisingNeedId = patch.raising.nextNeedId || state.nextRaisingNeedId;
    state.lastRaisingMilestoneId = patch.raising.milestoneId || state.lastRaisingMilestoneId;
    state.raisingMilestoneLabel = patch.raising.milestoneLabel || state.raisingMilestoneLabel;
    state.nextRaisingMilestoneId = patch.raising.nextMilestoneId || state.nextRaisingMilestoneId;
    state.nextRaisingMilestoneLabel = patch.raising.nextMilestoneLabel || state.nextRaisingMilestoneLabel;
    appendUniqueAlphaChat(state, patch.raising.message || `Raising care recorded: ${patch.raising.needId}.`);
  }

  if (patch.quest?.id) {
    state.activeQuestId = patch.quest.id;
    state.acceptedQuestIds = Array.from(new Set([...(state.acceptedQuestIds || []), patch.quest.id]));
    state.completedQuestSteps = Array.isArray(patch.quest.completedSteps) ? patch.quest.completedSteps.map(String) : state.completedQuestSteps;
    state.questStepsById = {
      ...state.questStepsById,
      [patch.quest.id]: state.completedQuestSteps
    };
    if (Array.isArray(patch.quest.completedQuestIds)) {
      state.completedQuestIds = Array.from(new Set(patch.quest.completedQuestIds.map(String)));
    }
    if (patch.quest.chainComplete) {
      state.questChainProof = true;
    }
    if (patch.quest.nextQuestId && !state.questChainProof) {
      state.activeQuestId = patch.quest.nextQuestId;
      state.completedQuestSteps = state.questStepsById[patch.quest.nextQuestId] || [];
    }
    appendUniqueAlphaChat(state, patch.quest.message || `Quest progress: ${state.completedQuestSteps.length} steps.`);
  }

  if (patch.tradeProof) {
    state.tradeProof = true;
    appendUniqueAlphaChat(state, 'Direct trade proof recorded from the trade post. No real value.');
  }

  if (patch.canaryRequested) {
    state.canaryRequested = true;
    appendUniqueAlphaChat(state, 'Canary certificate request staged from the shrine as preview stub. No real value.');
  }

  if (patch.canaryReturnRequested) {
    state.canaryReturnRequested = true;
    appendUniqueAlphaChat(state, 'Jade Vault Return Proof staged from the shrine as preview stub. No inventory credit before FINALIZED. No real value.');
  }

  writeAlphaState(state);
}

function selectHudQuest(state: AlphaHudState) {
  return selectMochiSpiritQuest({
    roster: state.attunedSpiritIds,
    activeQuestId: state.activeQuestId,
    completedQuestIds: state.completedQuestIds,
    questStepsById: state.questStepsById
  });
}

function buildHudActionPayload(type: AlphaActionType): Record<string, unknown> {
  const state = readAlphaState();
  const spiritId = state.spiritId || 'lirabao';

  if (type === 'spirit.attune') {
    return {
      spiritId,
      offeredItemId: spiritId === 'jintari' ? 'jade-thread-charm' : 'mochirii-guild-seal'
    };
  }

  if (type === 'spirit.starter_vow') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const selectedSpiritId = state.starterSpiritId || state.spiritId || MOCHI_SPIRITS[0].id;
    const selectedSpirit = MOCHI_SPIRITS.find((entry) => entry.id === selectedSpiritId) || MOCHI_SPIRITS[0];
    return {
      vowId: SPIRIT_STARTER_VOWS[0].id,
      selectedSpiritId: selectedSpirit.id,
      itemIds: ['mochirii-guild-seal'],
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.capture') {
    const targetSpirit = MOCHI_SPIRITS.find((entry) => !state.attunedSpiritIds.includes(entry.id)) || MOCHI_SPIRITS[0];
    return {
      spiritId: targetSpirit.id,
      offeredItemId: targetSpirit.capture.lureItemId,
      harmonyScore: targetSpirit.capture.harmonyRequired,
      roster: state.attunedSpiritIds
    };
  }

  if (type === 'spirit.capture_rite') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : [state.spiritId].filter(Boolean);
    return {
      riteId: SPIRIT_CAPTURE_RITES[0].id,
      roster,
      capturedSpiritIds: roster,
      routeInvitedSpiritIds: state.routeInvitedSpiritIds,
      lureItemIds: Array.from(new Set(MOCHI_SPIRITS.map((entry) => entry.capture.lureItemId))),
      journalDiscoveredCount: state.journalDiscoveredCount,
      localPresenceCount: presenceCount,
      captureProof: state.captureProof,
      routeInviteProof: state.routeInviteProof,
      fieldAccordProof: state.fieldAccordProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.train') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    return {
      spiritId: spirit.id,
      moveId: spirit.battle.moves[0].id,
      bond: getSpiritBond(state, spirit.id) || state.bond || 1,
      round: Math.max(1, state.trainingVictories + 1)
    };
  }

  if (type === 'spirit.journal') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    return {
      roster,
      activeSpiritId: state.spiritId || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((id) => [id, getSpiritBond(state, id) || 1])),
      growthBySpiritId: Object.fromEntries(roster.map((id) => [id, getSpiritGrowth(state, id) || 'seed']))
    };
  }

  if (type === 'spirit.habitat_bond') {
    const activeSpiritId = state.spiritId || state.attunedSpiritIds[0];
    const activeBond = activeSpiritId ? getSpiritBond(state, activeSpiritId) : state.bond || 1;
    return {
      bondId: SPIRIT_HABITAT_BONDS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId,
      journalDiscoveredCount: state.journalDiscoveredCount,
      careProof: state.raisingProof || activeBond > 1,
      bond: activeBond,
      growth: activeSpiritId ? getSpiritGrowth(state, activeSpiritId) : state.growth || 'seed',
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood
    };
  }

  if (type === 'spirit.sanctuary_rite') {
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      riteId: SPIRIT_SANCTUARY_RITES[0].id,
      roster: state.attunedSpiritIds,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0] || state.attunedSpiritIds[0],
      bondBySpiritId: Object.fromEntries(partyIds.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1])),
      careStreak: state.raisingCareStreak,
      trainingXp: state.trainingXp,
      habitatBondProof: state.habitatBondProof,
      conditionWeaveProof: state.conditionWeaveProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory
    };
  }

  if (type === 'spirit.research') {
    return {
      folioId: SPIRIT_RESEARCH_FOLIOS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      discoveredRoutes: state.discoveredRouteIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      habitatBondProof: state.habitatBondProof,
      habitatBondId: state.habitatBondId,
      techniqueProof: state.techniqueProof,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      trainingXp: state.trainingXp
    };
  }

  if (type === 'spirit.compendium_complete') {
    return {
      compendiumId: SPIRIT_COMPENDIUMS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      discoveredRoutes: state.discoveredRouteIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      habitatBondProof: state.habitatBondProof,
      habitatBondId: state.habitatBondId,
      researchProof: state.researchProof,
      researchFolioId: state.researchFolioId,
      routeMasteryProof: state.routeMasteryProof
    };
  }

  if (type === 'spirit.roster_archive') {
    const archivePartyIds = (state.partyIds.length ? state.partyIds : state.attunedSpiritIds).slice(0, 2);
    return {
      archiveId: SPIRIT_ROSTER_ARCHIVES[0].id,
      roster: state.attunedSpiritIds,
      partyIds: archivePartyIds,
      activeSpiritId: state.spiritId || archivePartyIds[0] || state.attunedSpiritIds[0],
      journalDiscoveredCount: state.journalDiscoveredCount,
      compendiumProof: state.compendiumProof,
      compendiumId: state.compendiumId,
      sanctuaryRiteProof: state.sanctuaryRiteProof,
      sanctuaryRiteId: state.sanctuaryRiteId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof
    };
  }

  if (type === 'spirit.roster_cabinet') {
    const cabinet = SPIRIT_ROSTER_CABINETS[0];
    const roster = state.attunedSpiritIds.length >= cabinet.requiredSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const partyIds = state.partyIds.length >= cabinet.requiredPartySize ? state.partyIds.slice(0, cabinet.requiredPartySize) : roster.slice(0, cabinet.requiredPartySize);
    const storageSlotLabels =
      state.rosterCabinetSlotLabels.length >= cabinet.requiredStorageSlots
        ? state.rosterCabinetSlotLabels
        : roster.slice(0, cabinet.requiredStorageSlots).map((spiritId, index) => `${index + 1}-${spiritId}-guild-slot`);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      cabinetId: cabinet.id,
      roster,
      partyIds,
      storageSlotLabels,
      activeSpiritId: state.spiritId || partyIds[0] || roster[0],
      rosterArchiveProof: state.rosterArchiveProof,
      rosterArchiveId: state.rosterArchiveId,
      compendiumProof: state.compendiumProof,
      compendiumId: state.compendiumId,
      nurseryGroveProof: state.nurseryGroveProof,
      nurseryGroveId: state.nurseryGroveId,
      lineageRegisterProof: state.lineageRegisterProof,
      lineageRegisterId: state.lineageRegisterId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood || 'cozy',
      chatLines: state.chat.length ? state.chat : ['Jade Roster Cabinet ready.'],
      rewardItemId: 'jade-roster-cabinet-tag',
      noRealValue: true
    };
  }

  if (type === 'spirit.blossom_cradle') {
    const cradle = SPIRIT_BLOSSOM_CRADLES[0];
    const roster = state.attunedSpiritIds.length >= cradle.requiredSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const partyIds = state.partyIds.length >= cradle.requiredPartySize ? state.partyIds.slice(0, cradle.requiredPartySize) : roster.slice(0, cradle.requiredPartySize);
    const caredSpiritIds =
      state.careCycleCaredSpiritIds.length >= cradle.requiredCareCount ? state.careCycleCaredSpiritIds.slice(0, cradle.requiredCareCount) : roster.slice(0, cradle.requiredCareCount);
    const raisingMilestoneLabels =
      state.lineageRegisterMilestoneLabels.length >= cradle.requiredSpiritIds.length
        ? state.lineageRegisterMilestoneLabels.slice(0, cradle.requiredSpiritIds.length)
        : roster.map((spiritId) => resolveSpiritBondMilestone(spiritId, getSpiritBond(state, spiritId), getSpiritGrowth(state, spiritId)).milestone?.label || 'First-care milestone');
    const totalBond = Math.max(state.careCycleTotalBond, roster.reduce((total, spiritId) => total + getSpiritBond(state, spiritId), 0), cradle.requiredTotalBond);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      cradleId: cradle.id,
      roster,
      partyIds,
      caredSpiritIds,
      raisingMilestoneLabels,
      activeSpiritId: state.spiritId || partyIds[0] || roster[0],
      totalBond,
      kinshipAlbumProof: state.kinshipAlbumProof,
      kinshipAlbumId: state.kinshipAlbumId,
      nurseryGroveProof: state.nurseryGroveProof,
      nurseryGroveId: state.nurseryGroveId,
      bloomAscendanceProof: state.bloomAscendanceProof,
      bloomAscendanceId: state.bloomAscendanceId,
      lineageRegisterProof: state.lineageRegisterProof,
      lineageRegisterId: state.lineageRegisterId,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood || 'cozy',
      chatLines: state.chat.length ? state.chat : ['Jade Blossom Cradle ready.'],
      rewardItemId: 'jade-blossom-cradle-ribbon',
      noRealValue: true
    };
  }

  if (type === 'market.guild_receipt') {
    return {
      receiptId: MARKET_GUILD_RECEIPTS[0].id,
      itemId: 'jade-thread-charm',
      quantity: 1,
      currency: 'guild-seals',
      price: 5,
      marketProof: state.charmListed,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat,
      noRealValue: true
    };
  }

  if (type === 'item.provision_satchel') {
    return {
      satchelId: SPIRIT_PROVISION_SATCHELS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      journalDiscoveredCount: state.journalDiscoveredCount,
      marketProof: state.charmListed,
      marketReceiptProof: state.marketReceiptProof,
      tradeProof: state.tradeProof,
      routeInviteProof: state.routeInviteProof,
      careStreak: state.raisingCareStreak,
      completedQuestIds: state.completedQuestIds
    };
  }

  if (type === 'spirit.care_cycle') {
    const roster = state.attunedSpiritIds;
    return {
      cycleId: SPIRIT_CARE_CYCLES[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1])),
      careStreak: state.raisingCareStreak,
      trainingXp: state.trainingXp,
      raisingProof: state.raisingProof,
      raisingMilestoneLabel: state.raisingMilestoneLabel,
      rosterArchiveProof: state.rosterArchiveProof,
      rosterArchiveId: state.rosterArchiveId,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      sanctuaryRiteProof: state.sanctuaryRiteProof,
      sanctuaryRiteId: state.sanctuaryRiteId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof
    };
  }

  if (type === 'item.bond_gift') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const roster = state.attunedSpiritIds.length >= MOCHI_SPIRITS.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    return {
      riteId: SPIRIT_BOND_GIFT_RITES[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      giftItemIds: ['jade-mooncake-box', 'lantern-harmony-tea', 'jade-thread-charm'],
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      marketReceiptProof: state.marketReceiptProof,
      marketReceiptId: 'jade-court-market-receipt',
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat,
      noRealValue: true
    };
  }

  if (type === 'spirit.temperament_concord') {
    const roster = state.attunedSpiritIds;
    return {
      concordId: SPIRIT_TEMPERAMENT_CONCORDS[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1])),
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      traitAttunementProof: state.traitAttunementProof,
      traitAttunementId: state.traitAttunementId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.field_almanac') {
    const roster = state.attunedSpiritIds;
    return {
      almanacId: SPIRIT_FIELD_ALMANACS[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      discoveredRoutes: state.discoveredRouteIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      fieldAccordProof: state.fieldAccordProof,
      fieldAccordId: state.fieldAccordId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      compendiumProof: state.compendiumProof,
      compendiumId: state.compendiumId,
      temperamentConcordProof: state.temperamentConcordProof,
      temperamentConcordId: state.temperamentConcordId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.route_ecology') {
    const roster = state.attunedSpiritIds;
    return {
      surveyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      discoveredRoutes: state.discoveredRouteIds,
      routeInvitedSpiritIds: state.routeInvitedSpiritIds.length
        ? state.routeInvitedSpiritIds
        : roster.filter((rosterSpiritId) => rosterSpiritId === 'jintari' || rosterSpiritId === 'aozhen'),
      journalDiscoveredCount: state.journalDiscoveredCount,
      fieldAlmanacProof: state.fieldAlmanacProof,
      fieldAlmanacId: state.fieldAlmanacId,
      fieldAccordProof: state.fieldAccordProof,
      fieldAccordId: state.fieldAccordId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.weather_veil') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      weatherVeilId: SPIRIT_WEATHER_VEILS[0].id,
      discoveredRoutes: state.discoveredRouteIds,
      weatherConditionIds: SPIRIT_WEATHER_VEILS[0].requiredWeatherConditionIds,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      fieldAlmanacProof: state.fieldAlmanacProof,
      fieldAlmanacId: state.fieldAlmanacId,
      fieldAccordProof: state.fieldAccordProof,
      fieldAccordId: state.fieldAccordId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.encounter_rotation') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      rotationId: SPIRIT_ENCOUNTER_ROTATIONS[0].id,
      discoveredRoutes: state.discoveredRouteIds,
      encounterSpiritIds: roster,
      lureItemIds: state.captureRiteLureItemIds.length
        ? state.captureRiteLureItemIds
        : Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.lureItemId))),
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      fieldAlmanacProof: state.fieldAlmanacProof,
      fieldAlmanacId: state.fieldAlmanacId,
      fieldAccordProof: state.fieldAccordProof,
      fieldAccordId: state.fieldAccordId,
      captureRiteProof: state.captureRiteProof,
      captureRiteId: state.captureRiteId,
      weatherVeilProof: state.weatherVeilProof,
      weatherVeilId: state.weatherVeilId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.encounter_atlas') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      atlasId: SPIRIT_ENCOUNTER_ATLASES[0].id,
      discoveredRoutes: state.discoveredRouteIds,
      encounteredSpiritIds: roster,
      capturedSpiritIds: state.captureRiteSpiritIds.length ? state.captureRiteSpiritIds : roster,
      rarityTiers: Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.rarity))),
      journalDiscoveredCount: state.journalDiscoveredCount,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      captureRiteProof: state.captureRiteProof,
      captureRiteId: state.captureRiteId,
      fieldAlmanacProof: state.fieldAlmanacProof,
      fieldAlmanacId: state.fieldAlmanacId,
      encounterRotationProof: state.encounterRotationProof,
      encounterRotationId: state.encounterRotationId,
      weatherVeilProof: state.weatherVeilProof,
      weatherVeilId: state.weatherVeilId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.habitat_census') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      censusId: SPIRIT_HABITAT_CENSUSES[0].id,
      roster,
      discoveredRoutes: state.discoveredRouteIds,
      observedSpiritIds: state.encounterAtlasSpiritIds.length ? state.encounterAtlasSpiritIds : roster,
      careLoggedSpiritIds: state.careCycleCaredSpiritIds.length ? state.careCycleCaredSpiritIds : roster,
      encounterAtlasProof: state.encounterAtlasProof,
      encounterAtlasId: state.encounterAtlasId,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      weatherVeilProof: state.weatherVeilProof,
      weatherVeilId: state.weatherVeilId,
      compendiumProof: state.compendiumProof,
      compendiumId: state.compendiumId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'item.craft_writ') {
    const roster = state.attunedSpiritIds;
    return {
      writId: SPIRIT_CRAFT_WRITS[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      recipeIds: state.craftWritRecipeIds.length ? state.craftWritRecipeIds : SPIRIT_CRAFT_WRITS[0].requiredRecipeIds,
      stockItemIds: state.provisionStockItemIds.length ? state.provisionStockItemIds : SPIRIT_CRAFT_WRITS[0].requiredStockItemIds,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      fieldAlmanacProof: state.fieldAlmanacProof,
      fieldAlmanacId: state.fieldAlmanacId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      temperamentConcordProof: state.temperamentConcordProof,
      temperamentConcordId: state.temperamentConcordId,
      marketProof: state.charmListed,
      marketReceiptProof: state.marketReceiptProof,
      tradeProof: state.tradeProof,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'trade.exchange_accord') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const exchangeItemIds = state.provisionStockItemIds.length
      ? state.provisionStockItemIds
      : TRADE_EXCHANGE_ACCORDS[0].requiredItemIds;
    return {
      accordId: TRADE_EXCHANGE_ACCORDS[0].id,
      roster,
      activeSpiritId: state.spiritId || roster[roster.length - 1] || roster[0],
      listedItemIds: exchangeItemIds,
      offeredItemIds: TRADE_EXCHANGE_ACCORDS[0].requiredItemIds,
      marketProof: state.charmListed,
      tradeProof: state.tradeProof,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.route_waystone') {
    return {
      waystoneId: SPIRIT_ROUTE_WAYSTONES[0].id,
      activeSpiritId: state.spiritId || state.routeInvitedSpiritIds[state.routeInvitedSpiritIds.length - 1] || state.attunedSpiritIds[0],
      discoveredRoutes: state.discoveredRouteIds,
      routeInvitedSpiritIds: state.routeInvitedSpiritIds.length
        ? state.routeInvitedSpiritIds
        : state.attunedSpiritIds.filter((spiritId) => spiritId === 'jintari' || spiritId === 'aozhen'),
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.route_charter') {
    const charter = SPIRIT_ROUTE_CHARTERS[0];
    const partyIds = state.partyIds.length >= charter.requiredPartySize
      ? state.partyIds.slice(0, charter.requiredPartySize)
      : (state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id)).slice(0, charter.requiredPartySize);
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      charterId: charter.id,
      discoveredRoutes: state.discoveredRouteIds.length >= charter.requiredRouteIds.length
        ? state.discoveredRouteIds
        : SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
      partyIds,
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      routeWaystoneProof: state.routeWaystoneProof,
      routeWaystoneId: state.routeWaystoneId,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      weatherVeilProof: state.weatherVeilProof,
      weatherVeilId: state.weatherVeilId,
      encounterAtlasProof: state.encounterAtlasProof,
      encounterAtlasId: state.encounterAtlasId,
      habitatCensusProof: state.habitatCensusProof,
      habitatCensusId: state.habitatCensusId,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      localPresenceCount: Math.max(presenceCount, 2),
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood || 'cozy',
      chatLines: state.chat.length ? state.chat : ['Jade Route Charter ready.'],
      rewardItemId: 'jade-route-charter-slip',
      noRealValue: true
    };
  }

  if (type === 'spirit.nurture_rite') {
    return {
      riteId: SPIRIT_NURTURE_RITES[0].id,
      roster: state.attunedSpiritIds,
      caredSpiritIds: state.careCycleCaredSpiritIds.length ? state.careCycleCaredSpiritIds : state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[state.attunedSpiritIds.length - 1] || state.attunedSpiritIds[0],
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      temperamentConcordProof: state.temperamentConcordProof,
      temperamentConcordId: state.temperamentConcordId,
      raisingProof: state.raisingProof,
      raisingMilestoneLabel: state.raisingMilestoneLabel,
      bond: state.bond,
      trainingXp: state.trainingXp,
      sparLadderXp: state.sparLadderXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.recovery_tea') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : [state.spiritId].filter(Boolean);
    const partyIds = state.partyIds.length ? state.partyIds : roster.slice(0, 3);
    const caredSpiritIds = state.nurtureRiteCaredSpiritIds.length
      ? state.nurtureRiteCaredSpiritIds
      : state.careCycleCaredSpiritIds.length
        ? state.careCycleCaredSpiritIds
        : roster;
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      teaId: SPIRIT_RECOVERY_TEAS[0].id,
      roster,
      partyIds,
      caredSpiritIds,
      activeSpiritId: state.spiritId || partyIds[0] || roster[0],
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      sanctuaryRiteProof: state.sanctuaryRiteProof,
      sanctuaryRiteId: state.sanctuaryRiteId,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'item.provision_catalog') {
    const catalog = SPIRIT_PROVISION_CATALOGS[0];
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      catalogId: catalog.id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      stockItemIds: state.provisionStockItemIds.length ? state.provisionStockItemIds : catalog.requiredStockItemIds,
      careItemIds: catalog.requiredCareItemIds,
      routeItemIds: catalog.requiredRouteItemIds,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      marketReceiptProof: state.marketReceiptProof,
      marketReceiptId: state.marketReceiptId,
      tradeProof: state.tradeProof,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      recoveryTeaProof: state.recoveryTeaProof,
      recoveryTeaId: state.recoveryTeaId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      habitatCensusProof: state.habitatCensusProof,
      habitatCensusId: state.habitatCensusId,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'item.battle_kit') {
    const kit = SPIRIT_BATTLE_KITS[0];
    const presenceCount = Number(
      document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount ||
        state.battleKitPresenceCount ||
        state.rallyPresenceCount ||
        1
    );
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const partyIds = state.partyIds.length ? state.partyIds : roster.slice(0, kit.requiredPartySize);
    return {
      kitId: kit.id,
      roster,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0] || roster[0],
      itemIds: state.provisionCatalogItemIds.length ? state.provisionCatalogItemIds : kit.requiredItemIds,
      provisionCatalogProof: state.provisionCatalogProof,
      provisionCatalogId: state.provisionCatalogId,
      techniqueCodexProof: state.techniqueCodexProof,
      techniqueCodexId: state.techniqueCodexId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      recoveryTeaProof: state.recoveryTeaProof,
      recoveryTeaId: state.recoveryTeaId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'item.remedy_pouch') {
    const pouch = SPIRIT_REMEDY_POUCHES[0];
    const presenceCount = Number(
      document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount ||
        state.remedyPouchPresenceCount ||
        state.battleKitPresenceCount ||
        state.rallyPresenceCount ||
        1
    );
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id);
    const partyIds = state.partyIds.length ? state.partyIds : roster.slice(0, pouch.requiredPartySize);
    return {
      pouchId: pouch.id,
      roster,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0] || roster[0],
      conditionIds: state.conditionIds.length ? state.conditionIds : pouch.requiredConditionIds,
      itemIds: state.battleKitItemIds.length ? state.battleKitItemIds : pouch.requiredItemIds,
      recoveryTeaProof: state.recoveryTeaProof,
      recoveryTeaId: state.recoveryTeaId,
      battleKitProof: state.battleKitProof,
      battleKitId: state.battleKitId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      sanctuaryRiteProof: state.sanctuaryRiteProof,
      sanctuaryRiteId: state.sanctuaryRiteId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.kinship_album') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : [state.spiritId].filter(Boolean);
    const caredSpiritIds = state.nurtureRiteCaredSpiritIds.length
      ? state.nurtureRiteCaredSpiritIds
      : state.careCycleCaredSpiritIds.length
        ? state.careCycleCaredSpiritIds
        : roster;
    const inferredBond = Math.max(
      state.bond || 0,
      Math.ceil((state.careCycleTotalBond || 0) / Math.max(1, roster.length)),
      5
    );
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      albumId: SPIRIT_KINSHIP_ALBUMS[0].id,
      roster,
      caredSpiritIds,
      activeSpiritId: state.spiritId || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, inferredBond])),
      localPresenceCount: presenceCount,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      compendiumProof: state.compendiumProof,
      compendiumId: state.compendiumId,
      habitatBondProof: state.habitatBondProof,
      habitatBondId: state.habitatBondId,
      raisingProof: state.raisingProof,
      raisingMilestoneLabel: state.raisingMilestoneLabel,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.nursery_grove') {
    const roster = state.kinshipAlbumSpiritIds.length
      ? state.kinshipAlbumSpiritIds
      : state.attunedSpiritIds.length
        ? state.attunedSpiritIds
        : [state.spiritId].filter(Boolean);
    const partyIds = state.recoveryTeaPartyIds.length
      ? state.recoveryTeaPartyIds
      : state.partyIds.length
        ? state.partyIds
        : roster.slice(0, 3);
    const caredSpiritIds = state.kinshipAlbumCaredSpiritIds.length
      ? state.kinshipAlbumCaredSpiritIds
      : state.recoveryTeaCaredSpiritIds.length
        ? state.recoveryTeaCaredSpiritIds
        : state.careCycleCaredSpiritIds.length
          ? state.careCycleCaredSpiritIds
          : roster;
    const inferredBond = Math.max(
      state.bond || 0,
      Math.ceil((state.kinshipAlbumTotalBond || state.careCycleTotalBond || 0) / Math.max(1, roster.length)),
      5
    );
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      nurseryId: SPIRIT_NURSERY_GROVES[0].id,
      roster,
      partyIds,
      caredSpiritIds,
      activeSpiritId: state.spiritId || partyIds[partyIds.length - 1] || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, inferredBond])),
      localPresenceCount: presenceCount,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      recoveryTeaProof: state.recoveryTeaProof,
      recoveryTeaId: state.recoveryTeaId,
      kinshipAlbumProof: state.kinshipAlbumProof,
      kinshipAlbumId: state.kinshipAlbumId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      raisingProof: state.raisingProof,
      raisingMilestoneLabel: state.raisingMilestoneLabel,
      trainingXp: state.trainingXp,
      sparLadderXp: state.sparLadderXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.bloom_ascendance') {
    const roster = state.nurseryGroveSpiritIds.length
      ? state.nurseryGroveSpiritIds
      : state.attunedSpiritIds.length
        ? state.attunedSpiritIds
        : [state.spiritId].filter(Boolean);
    const partyIds = state.nurseryGrovePartyIds.length
      ? state.nurseryGrovePartyIds
      : state.partyIds.length
        ? state.partyIds
        : roster.slice(0, 3);
    const caredSpiritIds = state.nurseryGroveCaredSpiritIds.length
      ? state.nurseryGroveCaredSpiritIds
      : state.careCycleCaredSpiritIds.length
        ? state.careCycleCaredSpiritIds
        : roster;
    const inferredBond = Math.max(
      state.bond || 0,
      Math.ceil((state.nurseryGroveTotalBond || state.kinshipAlbumTotalBond || state.careCycleTotalBond || 0) / Math.max(1, roster.length)),
      5
    );
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      ascendanceId: SPIRIT_BLOOM_ASCENDANCES[0].id,
      roster,
      partyIds,
      caredSpiritIds,
      activeSpiritId: state.spiritId || partyIds[partyIds.length - 1] || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, inferredBond])),
      localPresenceCount: presenceCount,
      nurseryGroveProof: state.nurseryGroveProof,
      nurseryGroveId: state.nurseryGroveId,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      kinshipAlbumProof: state.kinshipAlbumProof,
      kinshipAlbumId: state.kinshipAlbumId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      traitAttunementProof: state.traitAttunementProof,
      traitAttunementId: state.traitAttunementId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      trainingXp: state.trainingXp,
      sparLadderXp: state.sparLadderXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.lineage_register') {
    const register = SPIRIT_LINEAGE_REGISTERS[0];
    const roster = state.bloomAscendanceSpiritIds.length
      ? state.bloomAscendanceSpiritIds
      : state.nurseryGroveSpiritIds.length
        ? state.nurseryGroveSpiritIds
        : state.attunedSpiritIds.length
          ? state.attunedSpiritIds
          : [state.spiritId].filter(Boolean);
    const partyIds = state.bloomAscendancePartyIds.length
      ? state.bloomAscendancePartyIds
      : state.nurseryGrovePartyIds.length
        ? state.nurseryGrovePartyIds
        : state.partyIds.length
          ? state.partyIds
          : roster.slice(0, 3);
    const caredSpiritIds = state.bloomAscendanceCaredSpiritIds.length
      ? state.bloomAscendanceCaredSpiritIds
      : state.nurseryGroveCaredSpiritIds.length
        ? state.nurseryGroveCaredSpiritIds
        : state.careCycleCaredSpiritIds.length
          ? state.careCycleCaredSpiritIds
          : roster;
    const inferredBond = Math.max(
      state.bond || 0,
      Math.ceil((state.bloomAscendanceTotalBond || state.nurseryGroveTotalBond || state.kinshipAlbumTotalBond || state.careCycleTotalBond || 0) / Math.max(1, roster.length)),
      register.requiredBondPerSpirit
    );
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      registerId: register.id,
      roster,
      partyIds,
      caredSpiritIds,
      activeSpiritId: state.spiritId || partyIds[partyIds.length - 1] || roster[0],
      bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, inferredBond])),
      localPresenceCount: presenceCount,
      kinshipAlbumProof: state.kinshipAlbumProof,
      kinshipAlbumId: state.kinshipAlbumId,
      nurseryGroveProof: state.nurseryGroveProof,
      nurseryGroveId: state.nurseryGroveId,
      bloomAscendanceProof: state.bloomAscendanceProof,
      bloomAscendanceId: state.bloomAscendanceId,
      captureRiteProof: state.captureRiteProof,
      captureRiteId: state.captureRiteId,
      careCycleProof: state.careCycleProof,
      careCycleId: state.careCycleId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      growthForm: state.growthForm,
      raisingProof: state.raisingProof,
      raisingMilestoneLabel: state.raisingMilestoneLabel,
      trainingXp: Math.max(state.trainingXp || 0, register.requiredTrainingXp),
      sparLadderXp: Math.max(state.sparLadderXp || 0, register.requiredSparLadderXp),
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'guild.commission_complete') {
    return {
      commissionId: GUILD_COMMISSIONS[0].id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      journalDiscoveredCount: state.journalDiscoveredCount,
      questChainProof: state.questChainProof,
      completedQuestIds: state.completedQuestIds,
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId,
      marketProof: state.charmListed,
      tradeProof: state.tradeProof,
      trainingXp: state.trainingXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'guild.social_rally') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || 1);
    return {
      rallyId: GUILD_SOCIAL_RALLIES[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat,
      emoteProof: state.emoteProof,
      commissionProof: state.commissionProof,
      harmonyFormProof: state.harmonyFormProof,
      harmonyTrialProof: state.harmonyTrialProof,
      teamSparMatchProof: state.teamSparMatchProof
    };
  }

  if (type === 'quest.ledger_record') {
    const ledger = MOCHI_QUEST_LEDGERS[0];
    const acceptedQuestIds = state.acceptedQuestIds.length >= ledger.requiredQuestIds.length
      ? state.acceptedQuestIds
      : [...ledger.requiredQuestIds];
    const completedQuestIds = state.completedQuestIds.length >= ledger.requiredQuestIds.length
      ? state.completedQuestIds
      : [...ledger.requiredQuestIds];
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      ledgerId: ledger.id,
      roster: state.attunedSpiritIds.length >= ledger.requiredSpiritCount ? state.attunedSpiritIds : MOCHI_SPIRITS.map((spirit) => spirit.id),
      acceptedQuestIds,
      completedQuestIds,
      journalDiscoveredCount: Math.max(state.journalDiscoveredCount, MOCHI_SPIRITS.length),
      localPresenceCount: Math.max(presenceCount, 2),
      questChainProof: state.questChainProof || completedQuestIds.length >= ledger.requiredQuestIds.length,
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId || 'jade-cloudbell-circuit',
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId || 'jade-cloudbell-patrol',
      marketReceiptProof: state.marketReceiptProof,
      marketReceiptId: state.marketReceiptId || 'jade-court-market-receipt',
      provisionProof: state.provisionProof,
      provisionSatchelId: state.provisionSatchelId || 'jade-court-provision-satchel',
      commissionProof: state.commissionProof,
      commissionId: state.commissionId || 'jade-court-commission-ledger',
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood || 'cozy',
      rewardItemId: 'jade-quest-ledger-seal',
      chatLines: state.chat.length ? state.chat : ['Jade Quest Ledger ready.'],
      noRealValue: true
    };
  }

  if (type === 'story.chapter_complete') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      chapterId: MOCHI_STORY_CHAPTERS[0].id,
      roster: state.attunedSpiritIds.length ? state.attunedSpiritIds : [state.spiritId].filter(Boolean),
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      completedQuestIds: state.completedQuestIds,
      discoveredRoutes: state.discoveredRouteIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      localPresenceCount: presenceCount,
      routeEcologyProof: state.routeEcologyProof,
      routeEcologyId: state.routeEcologyId,
      routeWaystoneProof: state.routeWaystoneProof,
      routeWaystoneId: state.routeWaystoneId,
      questLedgerProof: state.questLedgerProof,
      questLedgerId: state.questLedgerId || MOCHI_QUEST_LEDGERS[0].id,
      nurtureRiteProof: state.nurtureRiteProof,
      nurtureRiteId: state.nurtureRiteId,
      tournamentProof: state.tournamentProof,
      tournamentId: state.tournamentId,
      commissionProof: state.commissionProof,
      commissionId: state.commissionId,
      rallyProof: state.rallyProof,
      rallyId: state.rallyId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      emoteProof: state.emoteProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'guild.insignia_case') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      caseId: GUILD_INSIGNIA_CASES[0].id,
      roster: state.attunedSpiritIds.length ? state.attunedSpiritIds : [state.spiritId].filter(Boolean),
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      localPresenceCount: presenceCount,
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      routePatrolProof: state.routePatrolProof,
      routePatrolId: state.routePatrolId,
      guildRankProof: state.guildRankProof,
      guildRankId: state.guildRankId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      tournamentProof: state.tournamentProof,
      tournamentId: state.tournamentId,
      storyChapterProof: state.storyChapterProof,
      storyChapterId: state.storyChapterId,
      harmonyFormProof: state.harmonyFormProof,
      harmonyFormId: state.harmonyFormId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      emoteProof: state.emoteProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'guild.wayfarer_chronicle') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      chronicleId: GUILD_WAYFARER_CHRONICLES[0].id,
      roster: state.attunedSpiritIds,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      journalDiscoveredCount: state.journalDiscoveredCount,
      completedQuestIds: state.completedQuestIds,
      localPresenceCount: presenceCount,
      starterVowProof: state.starterVowProof,
      captureProof: state.captureProof,
      captureRiteProof: state.captureRiteProof,
      encounterAtlasProof: state.encounterAtlasProof,
      habitatCensusProof: state.habitatCensusProof,
      routeMasteryProof: state.routeMasteryProof,
      routePatrolProof: state.routePatrolProof,
      routeEcologyProof: state.routeEcologyProof,
      habitatBondProof: state.habitatBondProof,
      researchProof: state.researchProof,
      compendiumProof: state.compendiumProof,
      provisionProof: state.provisionProof,
      provisionCatalogProof: state.provisionCatalogProof,
      battleKitProof: state.battleKitProof,
      remedyPouchProof: state.remedyPouchProof,
      questLedgerProof: state.questLedgerProof,
      craftWritProof: state.craftWritProof,
      routeWaystoneProof: state.routeWaystoneProof,
      routeCharterProof: state.routeCharterProof,
      nurtureRiteProof: state.nurtureRiteProof,
      kinshipAlbumProof: state.kinshipAlbumProof,
      nurseryGroveProof: state.nurseryGroveProof,
      bloomAscendanceProof: state.bloomAscendanceProof,
      lineageRegisterProof: state.lineageRegisterProof,
      rosterCabinetProof: state.rosterCabinetProof,
      blossomCradleProof: state.blossomCradleProof,
      exchangeAccordProof: state.exchangeAccordProof,
      affinityMatrixProof: state.affinityMatrixProof,
      techniqueCodexProof: state.techniqueCodexProof,
      relicAttunementProof: state.relicAttunementProof,
      commissionProof: state.commissionProof,
      rallyProof: state.rallyProof,
      storyChapterProof: state.storyChapterProof,
      insigniaCaseProof: state.insigniaCaseProof,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      traitAttunementProof: state.traitAttunementProof,
      conditionWeaveProof: state.conditionWeaveProof,
      guildRankProof: state.guildRankProof,
      growthRiteProof: state.growthRiteProof,
      harmonyFormProof: state.harmonyFormProof,
      harmonyTrialProof: state.harmonyTrialProof,
      teamSparMatchProof: state.teamSparMatchProof,
      mentorChallengeProof: state.mentorChallengeProof,
      dojoLadderProof: state.dojoLadderProof,
      sifuCouncilProof: state.sifuCouncilProof,
      summitCircuitProof: state.summitCircuitProof,
      tournamentProof: state.tournamentProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      questChainProof: state.questChainProof,
      marketProof: state.charmListed,
      marketReceiptProof: state.marketReceiptProof,
      tradeProof: state.tradeProof,
      canaryPreviewProof: state.canaryRequested && state.canaryReturnRequested,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'guild.ascension_trial') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      trialId: GUILD_ASCENSION_TRIALS[0].id,
      roster: state.attunedSpiritIds,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      localPresenceCount: presenceCount,
      starterVowProof: state.starterVowProof,
      wayfarerChronicleProof: state.wayfarerChronicleProof,
      kinshipAlbumProof: state.kinshipAlbumProof,
      nurseryGroveProof: state.nurseryGroveProof,
      bloomAscendanceProof: state.bloomAscendanceProof,
      lineageRegisterProof: state.lineageRegisterProof,
      rosterCabinetProof: state.rosterCabinetProof,
      blossomCradleProof: state.blossomCradleProof,
      exchangeAccordProof: state.exchangeAccordProof,
      affinityMatrixProof: state.affinityMatrixProof,
      techniqueCodexProof: state.techniqueCodexProof,
      relicAttunementProof: state.relicAttunementProof,
      storyChapterProof: state.storyChapterProof,
      insigniaCaseProof: state.insigniaCaseProof,
      rivalCircleProof: state.rivalCircleProof,
      routePatrolProof: state.routePatrolProof,
      mentorChallengeProof: state.mentorChallengeProof,
      dojoLadderProof: state.dojoLadderProof,
      sifuCouncilProof: state.sifuCouncilProof,
      summitCircuitProof: state.summitCircuitProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      conditionWeaveProof: state.conditionWeaveProof,
      harmonyFormProof: state.harmonyFormProof,
      harmonyTrialProof: state.harmonyTrialProof,
      teamSparMatchProof: state.teamSparMatchProof,
      tournamentProof: state.tournamentProof,
      guildRankProof: state.guildRankProof,
      growthRiteProof: state.growthRiteProof,
      questChainProof: state.questChainProof,
      marketProof: state.charmListed,
      marketReceiptProof: state.marketReceiptProof,
      provisionCatalogProof: state.provisionCatalogProof,
      battleKitProof: state.battleKitProof,
      remedyPouchProof: state.remedyPouchProof,
      questLedgerProof: state.questLedgerProof,
      tradeProof: state.tradeProof,
      canaryPreviewProof: state.canaryRequested && state.canaryReturnRequested,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'world.expedition') {
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    const route = SPIRIT_EXPEDITION_ROUTES[state.expeditionCount % SPIRIT_EXPEDITION_ROUTES.length] || SPIRIT_EXPEDITION_ROUTES[0];
    return {
      routeId: route.id,
      roster,
      activeSpiritId: state.spiritId || roster[0],
      harmonyScore: (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length,
      discoveredRoutes: state.discoveredRouteIds
    };
  }

  if (type === 'spirit.route_invite') {
    const route =
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === state.lastExpeditionRouteId) ||
      SPIRIT_EXPEDITION_ROUTES.find((entry) => state.discoveredRouteIds.includes(entry.id)) ||
      SPIRIT_EXPEDITION_ROUTES[0];
    const roster = state.attunedSpiritIds.length ? state.attunedSpiritIds : state.spiritId ? [state.spiritId] : [];
    return {
      routeId: route.id,
      offeredItemId: route.recommendedItemId,
      harmonyScore: (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length + state.expeditionCount,
      roster,
      discoveredRoutes: state.discoveredRouteIds
    };
  }

  if (type === 'world.route_mastery') {
    return {
      masteryId: SPIRIT_ROUTE_MASTERIES[0].id,
      discoveredRoutes: state.discoveredRouteIds,
      roster: state.attunedSpiritIds,
      journalDiscoveredCount: state.journalDiscoveredCount,
      completedQuestIds: state.completedQuestIds,
      guildRankProof: state.guildRankProof,
      rankTrialId: state.guildRankId
    };
  }

  if (type === 'world.route_patrol') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || 1);
    return {
      patrolId: SPIRIT_ROUTE_PATROLS[0].id,
      routeId: state.lastExpeditionRouteId || SPIRIT_ROUTE_PATROLS[0].routeId,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      localPresenceCount: presenceCount,
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      fieldAccordProof: state.fieldAccordProof,
      fieldAccordId: state.fieldAccordId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      harmonyFormProof: state.harmonyFormProof,
      teamSparMatchProof: state.teamSparMatchProof,
      mentorChallengeProof: state.mentorChallengeProof,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.technique') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    return {
      spiritId: spirit.id,
      moveId: spirit.battle.moves[0].id,
      currentMasteryXp: state.techniqueMasteryXp,
      bond: state.bond || 1
    };
  }

  if (type === 'battle.tactic_scroll') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    const move = spirit.battle.moves.find((entry) => entry.id === state.techniqueMoveId) || spirit.battle.moves[0];
    const tactic =
      SPIRIT_BATTLE_TACTICS.find((entry) => entry.recommendedMoveId === move.id) ||
      SPIRIT_BATTLE_TACTICS.find((entry) => entry.favoredAffinities.includes(move.affinity)) ||
      SPIRIT_BATTLE_TACTICS[0];
    return {
      spiritId: spirit.id,
      moveId: move.id,
      tacticId: tactic.id,
      currentMasteryXp: Math.max(state.tacticMasteryXp || 0, state.techniqueMasteryXp || 0),
      bond: state.bond || 1
    };
  }

  if (type === 'battle.affinity_trial') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId) || MOCHI_SPIRITS[0];
    const move = spirit.battle.moves.find((entry) => entry.id === state.techniqueMoveId) || spirit.battle.moves[0];
    const trial = SPIRIT_AFFINITY_TRIALS.find((entry) => entry.favoredAffinities.includes(move.affinity)) || SPIRIT_AFFINITY_TRIALS[0];
    return {
      spiritId: spirit.id,
      moveId: move.id,
      trialId: trial.id,
      bond: state.bond || 1,
      techniqueMasteryXp: state.techniqueMasteryXp || 0
    };
  }

  if (type === 'battle.technique_codex') {
    const codex = SPIRIT_TECHNIQUE_CODEXES[0];
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    const masteredMoveIds = state.techniqueLoadoutMoves.length
      ? state.techniqueLoadoutMoves.map((entry) => entry.split(':')[1]).filter(Boolean)
      : [...codex.requiredMoveIds];
    return {
      codexId: codex.id,
      partyIds,
      masteredMoveIds,
      tacticIds: [...codex.requiredTacticIds],
      techniqueProof: state.techniqueProof,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      techniqueLoadoutId: state.techniqueLoadoutId,
      techniqueMasteryXp: Math.max(state.techniqueMasteryXp || 0, codex.requiredTechniqueXp),
      tacticProof: state.tacticProof,
      trainingXp: Math.max(state.trainingXp || 0, codex.requiredTrainingXp),
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      journalProof: state.journalProof,
      journalDiscoveredCount: state.journalDiscoveredCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.trait_attune') {
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      traitId: SPIRIT_TRAIT_ATTUNEMENTS[0].id,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0],
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      techniqueLoadoutId: state.techniqueLoadoutId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      growthRiteProof: state.growthRiteProof,
      careStreak: state.raisingCareStreak,
      journalProof: state.journalProof,
      journalDiscoveredCount: state.journalDiscoveredCount,
      bondBySpiritId: Object.fromEntries(partyIds.map((partySpiritId) => [partySpiritId, getSpiritBond(state, partySpiritId) || 1]))
    };
  }

  if (type === 'battle.condition_weave') {
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      weaveId: SPIRIT_CONDITION_WEAVES[0].id,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0],
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      techniqueLoadoutId: state.techniqueLoadoutId,
      traitAttunementProof: state.traitAttunementProof,
      traitAttunementId: state.traitAttunementId,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      sparLadderWins: state.sparLadderWins,
      trainingXp: state.trainingXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.affinity_matrix') {
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    const affinityLabels = partyIds
      .map((spiritId) => MOCHI_SPIRITS.find((entry) => entry.id === spiritId)?.affinity)
      .filter(Boolean);
    return {
      matrixId: SPIRIT_AFFINITY_MATRICES[0].id,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0],
      affinityLabels,
      conditionIds: state.conditionIds.length ? state.conditionIds : SPIRIT_AFFINITY_MATRICES[0].requiredConditionIds,
      affinityProof: state.affinityProof,
      affinityTrialId: state.lastAffinityTrialId,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      techniqueLoadoutId: state.techniqueLoadoutId,
      traitAttunementProof: state.traitAttunementProof,
      traitAttunementId: state.traitAttunementId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      tacticProof: state.tacticProof,
      harmonyFormProof: state.harmonyFormProof,
      sparLadderWins: state.sparLadderWins,
      trainingXp: state.trainingXp,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'spirit.relic_attune') {
    const relic = SPIRIT_RELIC_ATTUNEMENTS[0];
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    const itemIds = Array.from(new Set([
      ...relic.requiredItemIds,
      ...state.provisionStockItemIds,
      ...state.craftWritStockItemIds,
      ...state.exchangeAccordItemIds
    ]));
    return {
      relicAttunementId: relic.id,
      partyIds,
      activeSpiritId: state.spiritId || partyIds[0],
      itemIds,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      techniqueLoadoutId: state.techniqueLoadoutId,
      techniqueCodexProof: state.techniqueCodexProof,
      techniqueCodexId: state.techniqueCodexId,
      traitAttunementProof: state.traitAttunementProof,
      traitAttunementId: state.traitAttunementId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      craftWritProof: state.craftWritProof,
      craftWritId: state.craftWritId,
      exchangeAccordProof: state.exchangeAccordProof,
      exchangeAccordId: state.exchangeAccordId,
      careCycleProof: state.careCycleProof,
      temperamentConcordProof: state.temperamentConcordProof,
      growthRiteProof: state.growthRiteProof,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'party.set') {
    return {
      partyIds: state.attunedSpiritIds.slice(0, 3),
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0]
    };
  }

  if (type === 'party.harmony_form') {
    return {
      formId: SPIRIT_HARMONY_FORMS[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      routeMasteryProof: state.routeMasteryProof,
      routeMasteryId: state.routeMasteryId,
      growthRiteProof: state.growthRiteProof,
      growthRiteId: state.growthRiteId,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      trainingXp: state.trainingXp,
      sparLadderXp: state.sparLadderXp
    };
  }

  if (type === 'battle.harmony_trial') {
    return {
      trialId: SPIRIT_HARMONY_TRIALS[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      harmonyFormProof: state.harmonyFormProof,
      harmonyFormId: state.harmonyFormId,
      tacticProof: state.tacticProof,
      affinityProof: state.affinityProof,
      sparLadderWins: state.sparLadderWins,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.team_spar_match') {
    return {
      matchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      harmonyTrialProof: state.harmonyTrialProof,
      harmonyTrialId: state.harmonyTrialId,
      harmonyTrialScore: state.harmonyTrialScore,
      routeMasteryProof: state.routeMasteryProof,
      tacticProof: state.tacticProof,
      growthRiteProof: state.growthRiteProof,
      questChainProof: state.questChainProof,
      trainingXp: state.trainingXp,
      sparLadderWins: state.sparLadderWins,
      chatLines: state.chat
    };
  }

  if (type === 'battle.dojo_ladder') {
    const ladder = SPIRIT_DOJO_LADDERS[0];
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      ladderId: ladder.id,
      partyIds,
      clearedOpponentIds: [...ladder.requiredOpponentIds],
      sparLadderWins: Math.max(state.sparLadderWins || 0, ladder.requiredSparWins),
      sparLadderXp: Math.max(state.sparLadderXp || 0, ladder.requiredSparLadderXp),
      trainingXp: Math.max(state.trainingXp || 0, ladder.requiredTrainingXp),
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      techniqueCodexProof: state.techniqueCodexProof,
      techniqueCodexId: state.techniqueCodexId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      teamSparMatchProof: state.teamSparMatchProof,
      teamSparMatchId: state.teamSparMatchId,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.sifu_council') {
    const council = SPIRIT_SIFU_COUNCILS[0];
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      councilId: council.id,
      partyIds,
      clearedCouncilMemberIds: [...council.requiredCouncilMemberIds],
      dojoLadderProof: state.dojoLadderProof,
      dojoLadderId: state.dojoLadderId,
      dojoLadderScore: state.dojoLadderScore,
      tournamentProof: state.tournamentProof,
      tournamentId: state.tournamentId,
      tournamentScore: state.tournamentScore,
      rivalCircleProof: state.rivalCircleProof,
      rivalCircleId: state.rivalCircleId,
      rivalCircleScore: state.rivalCircleScore,
      techniqueCodexProof: state.techniqueCodexProof,
      techniqueCodexId: state.techniqueCodexId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      guildRankProof: state.guildRankProof,
      routePatrolProof: state.routePatrolProof,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.summit_circuit') {
    const circuit = SPIRIT_SUMMIT_CIRCUITS[0];
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      circuitId: circuit.id,
      partyIds,
      summitSealIds: state.summitCircuitSealIds.length ? state.summitCircuitSealIds : [...circuit.requiredSummitSealIds],
      dojoLadderProof: state.dojoLadderProof,
      dojoLadderId: state.dojoLadderId,
      dojoLadderScore: state.dojoLadderScore,
      tournamentProof: state.tournamentProof,
      tournamentId: state.tournamentId,
      tournamentScore: state.tournamentScore,
      rivalCircleProof: state.rivalCircleProof,
      rivalCircleId: state.rivalCircleId,
      rivalCircleScore: state.rivalCircleScore,
      sifuCouncilProof: state.sifuCouncilProof,
      sifuCouncilId: state.sifuCouncilId,
      sifuCouncilScore: state.sifuCouncilScore,
      techniqueCodexProof: state.techniqueCodexProof,
      techniqueCodexId: state.techniqueCodexId,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      affinityMatrixId: state.affinityMatrixId,
      relicAttunementProof: state.relicAttunementProof,
      relicAttunementId: state.relicAttunementId,
      harmonyFormProof: state.harmonyFormProof,
      harmonyFormId: state.harmonyFormId,
      harmonyTrialProof: state.harmonyTrialProof,
      harmonyTrialId: state.harmonyTrialId,
      teamSparMatchProof: state.teamSparMatchProof,
      teamSparMatchId: state.teamSparMatchId,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      guildRankProof: state.guildRankProof,
      growthRiteProof: state.growthRiteProof,
      routePatrolProof: state.routePatrolProof,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.tournament_bracket') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      bracketId: SPIRIT_TOURNAMENT_BRACKETS[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      dojoLadderProof: state.dojoLadderProof,
      dojoLadderId: state.dojoLadderId,
      dojoLadderScore: state.dojoLadderScore,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      mentorChallengeScore: state.mentorChallengeScore,
      teamSparMatchProof: state.teamSparMatchProof,
      teamSparMatchId: state.teamSparMatchId,
      teamSparMatchScore: state.teamSparMatchScore,
      harmonyTrialProof: state.harmonyTrialProof,
      harmonyTrialId: state.harmonyTrialId,
      conditionWeaveProof: state.conditionWeaveProof,
      affinityMatrixProof: state.affinityMatrixProof,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      localPresenceCount: presenceCount,
      routePatrolProof: state.routePatrolProof,
      nurtureRiteProof: state.nurtureRiteProof,
      guildRankProof: state.guildRankProof,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.rival_circle') {
    const presenceCount = Number(document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount || state.rallyPresenceCount || 1);
    return {
      circleId: SPIRIT_RIVAL_CIRCLES[0].id,
      partyIds: state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
      tournamentProof: state.tournamentProof,
      tournamentId: state.tournamentId,
      tournamentScore: state.tournamentScore,
      dojoLadderProof: state.dojoLadderProof,
      dojoLadderId: state.dojoLadderId,
      dojoLadderScore: state.dojoLadderScore,
      mentorChallengeProof: state.mentorChallengeProof,
      mentorChallengeId: state.mentorChallengeId,
      mentorChallengeScore: state.mentorChallengeScore,
      teamSparMatchProof: state.teamSparMatchProof,
      teamSparMatchId: state.teamSparMatchId,
      teamSparMatchScore: state.teamSparMatchScore,
      battleRoundProof: state.battleRoundProof,
      battleRoundVictory: state.battleRoundVictory,
      battleRoundFocusScore: state.battleRoundFocusScore,
      battleRoundOpponentScore: state.battleRoundOpponentScore,
      conditionWeaveProof: state.conditionWeaveProof,
      conditionWeaveId: state.conditionWeaveId,
      affinityMatrixProof: state.affinityMatrixProof,
      techniqueLoadoutProof: state.techniqueLoadoutProof,
      traitAttunementProof: state.traitAttunementProof,
      guildRankProof: state.guildRankProof,
      growthRiteProof: state.growthRiteProof,
      localPresenceCount: presenceCount,
      profileViewed: state.profileViewed,
      guildBuddyProof: state.guildBuddyProof,
      statusMood: state.statusMood,
      chatLines: state.chat
    };
  }

  if (type === 'battle.spar_ladder') {
    const partyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    return {
      partyIds,
      opponentId: 'jade-echo-apprentice',
      bondBySpiritId: Object.fromEntries(partyIds.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1])),
      priorWins: state.sparLadderWins
    };
  }

  if (type === 'spirit.raise') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const careStreak = state.careStreakBySpiritId[spirit.id] ?? state.raisingCareStreak;
    const need = selectSpiritRaisingNeed(spirit.id, careStreak) || spirit.raisingNeeds[0];
    return {
      spiritId: spirit.id,
      needId: need.id,
      currentBond: getSpiritBond(state, spirit.id) || state.bond || 1,
      careStreak
    };
  }

  if (type === 'quest.accept') {
    return { questId: selectHudQuest(state).id };
  }

  if (type === 'quest.progress') {
    const quest = state.activeQuestId ? MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === state.activeQuestId) || selectHudQuest(state) : selectHudQuest(state);
    const questSteps: readonly string[] = quest.steps;
    const completedSteps = state.questStepsById[quest.id] || [];
    return {
      questId: quest.id,
      stepId: questSteps[completedSteps.length] || questSteps[questSteps.length - 1]
    };
  }

  if (type === 'guild.rank_trial') {
    const trial = GUILD_RANK_TRIALS[0];
    return {
      trialId: trial.id,
      roster: state.attunedSpiritIds,
      activeSpiritId: state.spiritId || state.attunedSpiritIds[0],
      bond: state.bond || 1,
      completedQuestSteps: state.completedQuestSteps,
      tacticProof: state.tacticProof,
      affinityWins: state.affinityTrialWins,
      sparWins: state.sparLadderWins,
      journalDiscoveredCount: state.journalDiscoveredCount,
      guildBuddyProof: state.guildBuddyProof
    };
  }

  if (type === 'spirit.growth_rite') {
    const rite = SPIRIT_GROWTH_RITES[0];
    return {
      riteId: rite.id,
      spiritId: state.spiritId || state.attunedSpiritIds[0],
      bond: state.bond || 1,
      growth: state.growth || 'seed',
      trainingXp: state.trainingXp || 0,
      raisingProof: state.raisingProof,
      rankTrialProof: state.guildRankProof,
      rankTrialId: state.guildRankId
    };
  }

  if (type === 'chain.withdraw_request') {
    return {
      itemId: 'lirabao-canary-certificate',
      tokenId: '1',
      amount: 1,
      entityType: 'chain_operation',
      entityId: 'lirabao-canary-certificate'
    };
  }

  if (type === 'chain.deposit_request') {
    return {
      itemId: 'lirabao-canary-certificate',
      tokenId: '1',
      amount: 1,
      entityType: 'chain_operation',
      entityId: 'jade-vault-return-proof',
      priorRequestStaged: state.canaryRequested,
      confirmNoCreditUntilFinalized: true
    };
  }

  if (type === 'chain.operation_update') {
    return {
      chainRequestId: 'lirabao-canary-certificate-preview',
      transactionState: 'PENDING',
      itemId: 'lirabao-canary-certificate',
      tokenId: '1',
      amount: 1,
      chainNetwork: 'CANARY',
      priorRequestStaged: state.canaryRequested,
      priorReturnStaged: state.canaryReturnRequested,
      previewStub: true,
      noRealValue: true,
      confirmNoCreditUntilFinalized: true
    };
  }

  return {};
}

async function loadAlphaStatus() {
  try {
    const response = await fetch('/integration/alpha/status');
    if (!response.ok) return;
    const status = await response.json();
    window.dispatchEvent(new CustomEvent('mochi-social-alpha-runtime', { detail: status }));
  } catch {
    // The HUD remains playable in static/dev fallback mode.
  }
}

function performAlphaLocalAction(type: AlphaLocalActionType, payload: Record<string, unknown> = {}) {
  const state = readAlphaState();

  if (type === 'profile.view') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    state.profileViewed = true;
    state.chat.push(
      `Profile: Mochirii Wayfarer, local alpha presence, ${spirit ? `${spirit.name} active` : 'no active Mochi Spirit'}, ${state.guildBuddyProof ? 'one local guild buddy' : 'no guild buddy yet'}, status ${state.statusMood}, no real value.`
    );
  }

  if (type === 'guild.buddy') {
    state.guildBuddyProof = true;
    state.chat.push('Guild proof: Local Buddy added for closed-alpha social testing. No DMs, no real value.');
  }

  if (type === 'status.set') {
    state.statusMood = 'cozy';
    state.chat.push('Status set: cozy alpha hangout, visible locally for social presence testing.');
  }

  if (type === 'spirit.focus') {
    const spiritId = String(payload.spiritId || '');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId);
    if (!spirit) {
      state.chat.push('That Mochi Spirit is not registered in the first-court roster.');
    } else if (!focusSpirit(state, spirit.id)) {
      state.chat.push(`${spirit.name} is still invite pending. Record the invitation before focusing this companion.`);
    } else {
      state.chat.push(`Focused ${spirit.name}: ${state.growth} growth, bond ${state.bond}/5 for care, training, battle, and roleplay.`);
    }
  }

  if (type === 'spirit.inspect') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    if (!spirit) {
      state.chat.push('No Mochi Spirit is bonded yet. Bond with Lirabao, Jintari, or Aozhen first.');
    } else {
      const milestone = resolveSpiritBondMilestone(spirit.id, state.bond, state.growth);
      const milestoneLabel = milestone.milestone?.label || state.raisingMilestoneLabel;
      const nextMilestone = milestone.nextMilestone?.label ? ` Next: ${milestone.nextMilestone.label}.` : '';
      state.lastInspectedSpiritId = spirit.id;
      state.chat.push(
        `Inspect ${spirit.name}: ${spirit.title}, ${state.growth} growth, bond ${state.bond}/5, ${milestoneLabel}, ${spirit.habitat}, ${spirit.certificateEligible ? 'Canary certificate eligible, no real value' : 'curated preview spirit, no real value'}.${nextMilestone}`
      );
    }
  }

  writeAlphaState(state);
}

async function performAlphaAction(type: AlphaActionType, payload: Record<string, unknown> = {}) {
  const state = readAlphaState();
  const requestId = crypto.randomUUID();

  if (type === 'spirit.attune') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const offeredItemId = String(payload.offeredItemId || 'mochirii-guild-seal');
    const result = resolveSpiritAttunement(spiritId, offeredItemId);
    if (result.ok) {
      state.spiritId = result.spiritId;
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
      setSpiritProgress(state, result.spiritId, Math.max(getSpiritBond(state, result.spiritId), result.bond), result.growth);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.starter_vow') {
    const result = resolveSpiritStarterVow(
      {
        selectedSpiritId: String(payload.selectedSpiritId || state.starterSpiritId || state.spiritId || SPIRIT_STARTER_VOWS[0].requiredSpiritIds[0]),
        itemIds: Array.isArray(payload.itemIds) ? payload.itemIds.map(String) : ['mochirii-guild-seal'],
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.vowId || SPIRIT_STARTER_VOWS[0].id)
    );
    if (result.vowed) {
      state.starterVowProof = true;
      state.starterVowId = result.vowId;
      state.starterVowName = result.vowName;
      state.starterVowLabel = result.vowLabel;
      state.starterVowScore = result.score;
      state.starterVowRequiredScore = result.requiredScore;
      state.starterVowItemIds = result.itemIds;
      state.starterSpiritId = result.selectedSpiritId;
      state.starterSpiritName = result.selectedSpiritName;
      state.starterKnotClaimed = result.rewardItemId === 'jade-starter-knot';
      state.spiritId = result.selectedSpiritId;
      if (!state.attunedSpiritIds.includes(result.selectedSpiritId)) {
        state.attunedSpiritIds.push(result.selectedSpiritId);
      }
      state.partyIds = Array.from(new Set([...(state.partyIds || []), result.selectedSpiritId]));
      state.supportSpiritIds = state.partyIds.slice(1);
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      setSpiritProgress(state, result.selectedSpiritId, Math.max(getSpiritBond(state, result.selectedSpiritId), 1));
      focusSpirit(state, result.selectedSpiritId);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.capture') {
    const targetSpirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || '')) || MOCHI_SPIRITS.find((entry) => !state.attunedSpiritIds.includes(entry.id)) || MOCHI_SPIRITS[0];
    const result = resolveSpiritCapture(
      targetSpirit.id,
      String(payload.offeredItemId || targetSpirit.capture.lureItemId),
      Number(payload.harmonyScore || targetSpirit.capture.harmonyRequired),
      state.attunedSpiritIds
    );
    if (result.ok) {
      state.spiritId = targetSpirit.id;
      state.captureProof = true;
      state.lastCaptureSpiritId = targetSpirit.id;
      if (!state.attunedSpiritIds.includes(targetSpirit.id)) {
        state.attunedSpiritIds.push(targetSpirit.id);
      }
      setSpiritProgress(state, targetSpirit.id, Math.max(getSpiritBond(state, targetSpirit.id), result.bond), result.growth);
      focusSpirit(state, targetSpirit.id);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.capture_rite') {
    const presenceCount = Number(payload.localPresenceCount ?? document.querySelector<HTMLElement>('[data-presence-label]')?.dataset.presenceCount ?? state.rallyPresenceCount ?? 1);
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const capturedSpiritIds = Array.isArray(payload.capturedSpiritIds) ? payload.capturedSpiritIds.map(String) : roster;
    const result = resolveSpiritCaptureRite(
      {
        roster,
        capturedSpiritIds,
        routeInvitedSpiritIds: Array.isArray(payload.routeInvitedSpiritIds) ? payload.routeInvitedSpiritIds.map(String) : state.routeInvitedSpiritIds,
        lureItemIds: Array.isArray(payload.lureItemIds) ? payload.lureItemIds.map(String) : Array.from(new Set(MOCHI_SPIRITS.map((entry) => entry.capture.lureItemId))),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        localPresenceCount: presenceCount,
        captureProof: Boolean(payload.captureProof ?? state.captureProof),
        routeInviteProof: Boolean(payload.routeInviteProof ?? state.routeInviteProof),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.riteId || SPIRIT_CAPTURE_RITES[0].id)
    );
    if (result.recorded) {
      state.captureRiteProof = true;
      state.captureRiteId = result.riteId;
      state.captureRiteName = result.riteName;
      state.captureRiteScore = result.score;
      state.captureRiteRequiredScore = result.requiredScore;
      state.captureRiteSpiritIds = result.capturedSpiritIds;
      state.captureRiteRouteInvitedSpiritIds = result.routeInvitedSpiritIds;
      state.captureRiteLureItemIds = result.lureItemIds;
      state.captureRiteClaimed = result.rewardItemId === 'jade-capture-rite-tally';
      state.attunedSpiritIds = result.roster;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      state.captureProof = true;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.care') {
    state.spiritId = state.spiritId || 'lirabao';
    if (!state.attunedSpiritIds.includes(state.spiritId)) {
      state.attunedSpiritIds.push(state.spiritId);
    }
    const nextBond = Math.min(5, Math.max(getSpiritBond(state, state.spiritId), state.bond) + 1);
    setSpiritProgress(state, state.spiritId, nextBond, growthStageFromBond(nextBond));
    state.careStreakBySpiritId[state.spiritId] = Math.max((state.careStreakBySpiritId[state.spiritId] || 0) + 1, state.raisingCareStreak);
    const caredSpirit = MOCHI_SPIRITS.find((entry) => entry.id === state.spiritId);
    state.chat.push(`Care complete for ${caredSpirit?.name || state.spiritId}: ${state.growth} bond ${state.bond}/5.`);
  }

  if (type === 'spirit.journal') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const result = resolveSpiritJournal(roster, String(payload.activeSpiritId || state.spiritId || roster[0] || ''), { [state.spiritId || 'lirabao']: state.bond || 1 }, { [state.spiritId || 'lirabao']: state.growth || 'seed' });
    if (result.ok) {
      state.journalProof = true;
      state.journalDiscoveredCount = result.discoveredCount;
      state.journalTotal = result.totalCount;
      state.lastJournalSpiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.habitat_bond') {
    const result = resolveSpiritHabitatBond(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        careProof: Boolean(payload.careProof ?? state.raisingProof ?? state.bond > 1),
        bond: Number(payload.bond || state.bond || 1),
        growth: String(payload.growth || state.growth || 'seed'),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || '')
      },
      String(payload.bondId || SPIRIT_HABITAT_BONDS[0].id)
    );
    if (result.bonded) {
      state.habitatBondProof = true;
      state.habitatBondId = result.bondId;
      state.habitatBondName = result.bondName;
      state.habitatBondScore = result.score;
      state.habitatTasselClaimed = result.rewardItemId === 'jade-court-habitat-tassel';
      state.attunedSpiritIds = result.roster;
      setRosterProgress(state, result.roster, 2, 'sprout');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.sanctuary_rite') {
    const fallbackPartyIds = state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3);
    const partyIds = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : fallbackPartyIds;
    const bondBySpiritId =
      payload.bondBySpiritId && typeof payload.bondBySpiritId === 'object'
        ? (payload.bondBySpiritId as Record<string, number>)
        : Object.fromEntries(partyIds.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1]));
    const result = resolveSpiritSanctuaryRite(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || partyIds[0] || ''),
        bondBySpiritId,
        careStreak: Number(payload.careStreak ?? state.raisingCareStreak ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory)
      },
      String(payload.riteId || SPIRIT_SANCTUARY_RITES[0].id)
    );
    if (result.restored) {
      state.sanctuaryRiteProof = true;
      state.sanctuaryRiteId = result.riteId;
      state.sanctuaryRiteName = result.riteName;
      state.sanctuaryRiteScore = result.score;
      state.sanctuaryRiteRequiredScore = result.requiredScore;
      state.sanctuaryBellClaimed = result.rewardItemId === 'jade-sanctuary-bell';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      setRosterProgress(state, result.partyIds, 3, 'sprout');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.research') {
    const result = resolveSpiritResearchFolio(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        habitatBondId: String(payload.habitatBondId || state.habitatBondId || ''),
        techniqueProof: Boolean(payload.techniqueProof ?? state.techniqueProof),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0)
      },
      String(payload.folioId || SPIRIT_RESEARCH_FOLIOS[0].id)
    );
    if (result.recorded) {
      state.researchProof = true;
      state.researchFolioId = result.folioId;
      state.researchFolioName = result.folioName;
      state.researchScore = result.score;
      state.researchFolioClaimed = result.rewardItemId === 'jade-court-research-folio';
      state.attunedSpiritIds = result.roster;
      state.discoveredRouteIds = result.discoveredRoutes;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.compendium_complete') {
    const result = resolveSpiritCompendiumCompletion(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        habitatBondId: String(payload.habitatBondId || state.habitatBondId || ''),
        researchProof: Boolean(payload.researchProof ?? state.researchProof),
        researchFolioId: String(payload.researchFolioId || state.researchFolioId || ''),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof)
      },
      String(payload.compendiumId || SPIRIT_COMPENDIUMS[0].id)
    );
    if (result.completed) {
      state.compendiumProof = true;
      state.compendiumId = result.compendiumId;
      state.compendiumName = result.compendiumName;
      state.compendiumScore = result.score;
      state.compendiumSealClaimed = result.rewardItemId === 'jade-court-compendium-seal';
      state.attunedSpiritIds = result.roster;
      state.discoveredRouteIds = result.discoveredRoutes;
      setRosterProgress(state, result.roster, 2, 'sprout');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.roster_archive') {
    const result = resolveSpiritRosterArchive(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.slice(0, 2),
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || ''),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        compendiumId: String(payload.compendiumId || state.compendiumId || ''),
        sanctuaryRiteProof: Boolean(payload.sanctuaryRiteProof ?? state.sanctuaryRiteProof),
        sanctuaryRiteId: String(payload.sanctuaryRiteId || state.sanctuaryRiteId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof)
      },
      String(payload.archiveId || SPIRIT_ROSTER_ARCHIVES[0].id)
    );
    if (result.archived) {
      state.rosterArchiveProof = true;
      state.rosterArchiveId = result.archiveId;
      state.rosterArchiveName = result.archiveName;
      state.rosterArchiveScore = result.score;
      state.rosterArchiveRequiredScore = result.requiredScore;
      state.rosterArchivePartyIds = result.partyIds;
      state.rosterArchiveReserveIds = result.reserveSpiritIds;
      state.rosterArchiveSealClaimed = result.rewardItemId === 'jade-roster-archive-seal';
      state.attunedSpiritIds = result.roster;
      setRosterProgress(state, result.roster, 3, 'sprout');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.roster_cabinet') {
    const result = resolveSpiritRosterCabinet(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds,
        storageSlotLabels: Array.isArray(payload.storageSlotLabels) ? payload.storageSlotLabels.map(String) : state.rosterCabinetSlotLabels,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        rosterArchiveProof: Boolean(payload.rosterArchiveProof ?? state.rosterArchiveProof),
        rosterArchiveId: String(payload.rosterArchiveId || state.rosterArchiveId || ''),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        compendiumId: String(payload.compendiumId || state.compendiumId || ''),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        nurseryGroveId: String(payload.nurseryGroveId || state.nurseryGroveId || ''),
        lineageRegisterProof: Boolean(payload.lineageRegisterProof ?? state.lineageRegisterProof),
        lineageRegisterId: String(payload.lineageRegisterId || state.lineageRegisterId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.cabinetId || SPIRIT_ROSTER_CABINETS[0].id)
    );
    if (result.organized) {
      state.rosterCabinetProof = true;
      state.rosterCabinetId = result.cabinetId;
      state.rosterCabinetName = result.cabinetName;
      state.rosterCabinetScore = result.score;
      state.rosterCabinetRequiredScore = result.requiredScore;
      state.rosterCabinetSpiritIds = result.roster;
      state.rosterCabinetPartyIds = result.partyIds;
      state.rosterCabinetReserveIds = result.reserveSpiritIds;
      state.rosterCabinetSlotLabels = result.storageSlotLabels;
      state.rosterCabinetTagClaimed = result.rewardItemId === 'jade-roster-cabinet-tag';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.blossom_cradle') {
    const result = resolveSpiritBlossomCradle(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds) ? payload.caredSpiritIds.map(String) : state.careCycleCaredSpiritIds,
        raisingMilestoneLabels: Array.isArray(payload.raisingMilestoneLabels) ? payload.raisingMilestoneLabels.map(String) : state.lineageRegisterMilestoneLabels,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        totalBond: Number(payload.totalBond ?? state.careCycleTotalBond ?? 0),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        kinshipAlbumId: String(payload.kinshipAlbumId || state.kinshipAlbumId || ''),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        nurseryGroveId: String(payload.nurseryGroveId || state.nurseryGroveId || ''),
        bloomAscendanceProof: Boolean(payload.bloomAscendanceProof ?? state.bloomAscendanceProof),
        bloomAscendanceId: String(payload.bloomAscendanceId || state.bloomAscendanceId || ''),
        lineageRegisterProof: Boolean(payload.lineageRegisterProof ?? state.lineageRegisterProof),
        lineageRegisterId: String(payload.lineageRegisterId || state.lineageRegisterId || ''),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.cradleId || SPIRIT_BLOSSOM_CRADLES[0].id)
    );
    if (result.cradled) {
      state.blossomCradleProof = true;
      state.blossomCradleId = result.cradleId;
      state.blossomCradleName = result.cradleName;
      state.blossomCradleScore = result.score;
      state.blossomCradleRequiredScore = result.requiredScore;
      state.blossomCradleSpiritIds = result.roster;
      state.blossomCradlePartyIds = result.partyIds;
      state.blossomCradleCareIds = result.caredSpiritIds;
      state.blossomCradleMilestoneLabels = result.raisingMilestoneLabels;
      state.blossomCradleTotalBond = result.totalBond;
      state.blossomCradleRibbonClaimed = result.rewardItemId === 'jade-blossom-cradle-ribbon';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      setRosterProgress(state, result.roster, 5, 'moonwell bloom');
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'item.provision_satchel') {
    const result = resolveSpiritProvisionSatchel(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        routeInviteProof: Boolean(payload.routeInviteProof ?? state.routeInviteProof),
        careStreak: Number(payload.careStreak ?? state.raisingCareStreak ?? 0),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds
      },
      String(payload.satchelId || SPIRIT_PROVISION_SATCHELS[0].id)
    );
    if (result.stocked) {
      state.provisionProof = true;
      state.provisionSatchelId = result.satchelId;
      state.provisionSatchelName = result.satchelName;
      state.provisionScore = result.score;
      state.provisionStockItemIds = result.stockItemIds;
      state.provisionSatchelClaimed = result.rewardItemId === 'jade-court-provision-satchel';
      state.attunedSpiritIds = result.roster;
      state.completedQuestIds = result.completedQuestIds;
      setRosterProgress(state, result.roster, 3, 'sprout');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.care_cycle') {
    const payloadBondBySpiritId =
      payload.bondBySpiritId && typeof payload.bondBySpiritId === 'object'
        ? Object.fromEntries(Object.entries(payload.bondBySpiritId as Record<string, unknown>).map(([spiritId, bond]) => [spiritId, Number(bond)]))
        : Object.fromEntries(state.attunedSpiritIds.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1]));
    const result = resolveSpiritCareCycle(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bondBySpiritId: payloadBondBySpiritId,
        careStreak: Number(payload.careStreak ?? state.raisingCareStreak ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        raisingMilestoneLabel: String(payload.raisingMilestoneLabel || state.raisingMilestoneLabel || ''),
        rosterArchiveProof: Boolean(payload.rosterArchiveProof ?? state.rosterArchiveProof),
        rosterArchiveId: String(payload.rosterArchiveId || state.rosterArchiveId || ''),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        sanctuaryRiteProof: Boolean(payload.sanctuaryRiteProof ?? state.sanctuaryRiteProof),
        sanctuaryRiteId: String(payload.sanctuaryRiteId || state.sanctuaryRiteId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof)
      },
      String(payload.cycleId || SPIRIT_CARE_CYCLES[0].id)
    );
    if (result.cycled) {
      state.careCycleProof = true;
      state.careCycleId = result.cycleId;
      state.careCycleName = result.cycleName;
      state.careCycleScore = result.score;
      state.careCycleRequiredScore = result.requiredScore;
      state.careCycleCaredSpiritIds = result.caredSpiritIds;
      state.careCycleTotalBond = result.totalBond;
      state.careCycleKnotClaimed = result.rewardItemId === 'jade-care-cycle-knot';
      state.attunedSpiritIds = result.roster;
      setRosterProgress(state, result.caredSpiritIds, 4, 'glow');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'item.bond_gift') {
    const result = resolveSpiritBondGiftRite(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        giftItemIds: Array.isArray(payload.giftItemIds) ? payload.giftItemIds.map(String) : state.provisionStockItemIds,
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        marketReceiptId: String(payload.marketReceiptId || state.marketReceiptId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.riteId || SPIRIT_BOND_GIFT_RITES[0].id)
    );
    if (result.gifted) {
      state.bondGiftProof = true;
      state.bondGiftRiteId = result.riteId;
      state.bondGiftRiteName = result.riteName;
      state.bondGiftScore = result.score;
      state.bondGiftRequiredScore = result.requiredScore;
      state.bondGiftItemIds = result.giftItemIds;
      state.bondGiftPresenceCount = result.localPresenceCount;
      state.bondGiftRibbonClaimed = result.rewardItemId === 'jade-bond-gift-ribbon';
      state.attunedSpiritIds = result.roster;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      state.spiritId = result.activeSpiritId || state.spiritId;
      if (result.activeSpiritId) {
        setSpiritProgress(state, result.activeSpiritId, Math.max(getSpiritBond(state, result.activeSpiritId), 4), getSpiritGrowth(state, result.activeSpiritId));
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.temperament_concord') {
    const payloadBondBySpiritId =
      payload.bondBySpiritId && typeof payload.bondBySpiritId === 'object'
        ? Object.fromEntries(Object.entries(payload.bondBySpiritId as Record<string, unknown>).map(([spiritId, bond]) => [spiritId, Number(bond)]))
        : Object.fromEntries(state.attunedSpiritIds.map((spiritId) => [spiritId, getSpiritBond(state, spiritId) || 1]));
    const result = resolveSpiritTemperamentConcord(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bondBySpiritId: payloadBondBySpiritId,
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        traitAttunementId: String(payload.traitAttunementId || state.traitAttunementId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.concordId || SPIRIT_TEMPERAMENT_CONCORDS[0].id)
    );
    if (result.concorded) {
      state.temperamentConcordProof = true;
      state.temperamentConcordId = result.concordId;
      state.temperamentConcordName = result.concordName;
      state.temperamentConcordScore = result.score;
      state.temperamentConcordRequiredScore = result.requiredScore;
      state.temperamentConcordLabels = result.temperamentLabels;
      state.temperamentConcordTotalBond = result.totalBond;
      state.temperamentCharmClaimed = result.rewardItemId === 'jade-temperament-charm';
      state.attunedSpiritIds = result.roster;
      setRosterProgress(state, result.roster, Math.ceil(result.totalBond / Math.max(1, result.roster.length)), 'glow');
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.field_almanac') {
    const result = resolveSpiritFieldAlmanac(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        fieldAccordId: String(payload.fieldAccordId || state.fieldAccordId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        compendiumId: String(payload.compendiumId || state.compendiumId || ''),
        temperamentConcordProof: Boolean(payload.temperamentConcordProof ?? state.temperamentConcordProof),
        temperamentConcordId: String(payload.temperamentConcordId || state.temperamentConcordId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.almanacId || SPIRIT_FIELD_ALMANACS[0].id)
    );
    if (result.recorded) {
      state.fieldAlmanacProof = true;
      state.fieldAlmanacId = result.almanacId;
      state.fieldAlmanacName = result.almanacName;
      state.fieldAlmanacScore = result.score;
      state.fieldAlmanacRequiredScore = result.requiredScore;
      state.fieldAlmanacRouteIds = result.routeIds;
      state.fieldAlmanacSpeciesIds = result.speciesIds;
      state.fieldAlmanacClaspClaimed = result.rewardItemId === 'jade-field-almanac-clasp';
      state.attunedSpiritIds = result.speciesIds;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.route_ecology') {
    const result = resolveSpiritRouteEcologySurvey(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        routeInvitedSpiritIds: Array.isArray(payload.routeInvitedSpiritIds) ? payload.routeInvitedSpiritIds.map(String) : state.routeInvitedSpiritIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        fieldAlmanacProof: Boolean(payload.fieldAlmanacProof ?? state.fieldAlmanacProof),
        fieldAlmanacId: String(payload.fieldAlmanacId || state.fieldAlmanacId || ''),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        fieldAccordId: String(payload.fieldAccordId || state.fieldAccordId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.surveyId || SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id)
    );
    if (result.surveyed) {
      state.routeEcologyProof = true;
      state.routeEcologyId = result.surveyId;
      state.routeEcologyName = result.surveyName;
      state.routeEcologyScore = result.score;
      state.routeEcologyRequiredScore = result.requiredScore;
      state.routeEcologyRouteIds = result.routeIds;
      state.routeEcologySpeciesIds = result.speciesIds;
      state.routeEcologyInvitedSpiritIds = result.routeInvitedSpiritIds;
      state.routeEcologyMapClaimed = result.rewardItemId === 'jade-route-ecology-map';
      state.routeInvitedSpiritIds = Array.from(new Set([...state.routeInvitedSpiritIds, ...result.routeInvitedSpiritIds]));
      state.attunedSpiritIds = result.speciesIds;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.weather_veil') {
    const result = resolveSpiritWeatherVeil(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        weatherConditionIds: Array.isArray(payload.weatherConditionIds)
          ? payload.weatherConditionIds.map(String)
          : SPIRIT_WEATHER_VEILS[0].requiredWeatherConditionIds,
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        fieldAlmanacProof: Boolean(payload.fieldAlmanacProof ?? state.fieldAlmanacProof),
        fieldAlmanacId: String(payload.fieldAlmanacId || state.fieldAlmanacId || ''),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        fieldAccordId: String(payload.fieldAccordId || state.fieldAccordId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.weatherVeilId || SPIRIT_WEATHER_VEILS[0].id)
    );
    if (result.recorded) {
      state.weatherVeilProof = true;
      state.weatherVeilId = result.weatherVeilId;
      state.weatherVeilName = result.weatherVeilName;
      state.weatherVeilScore = result.score;
      state.weatherVeilRequiredScore = result.requiredScore;
      state.weatherVeilRouteIds = result.routeIds;
      state.weatherVeilConditionIds = result.weatherConditionIds;
      state.weatherVeilWindows = result.routeConditionWindows;
      state.weatherVeilChartClaimed = result.rewardItemId === 'jade-weather-veil-chart';
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'world.encounter_rotation') {
    const result = resolveSpiritEncounterRotation(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        encounterSpiritIds: Array.isArray(payload.encounterSpiritIds) ? payload.encounterSpiritIds.map(String) : state.attunedSpiritIds,
        lureItemIds: Array.isArray(payload.lureItemIds) ? payload.lureItemIds.map(String) : state.captureRiteLureItemIds,
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        fieldAlmanacProof: Boolean(payload.fieldAlmanacProof ?? state.fieldAlmanacProof),
        fieldAlmanacId: String(payload.fieldAlmanacId || state.fieldAlmanacId || ''),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        fieldAccordId: String(payload.fieldAccordId || state.fieldAccordId || ''),
        captureRiteProof: Boolean(payload.captureRiteProof ?? state.captureRiteProof),
        captureRiteId: String(payload.captureRiteId || state.captureRiteId || ''),
        weatherVeilProof: Boolean(payload.weatherVeilProof ?? state.weatherVeilProof),
        weatherVeilId: String(payload.weatherVeilId || state.weatherVeilId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.rotationId || SPIRIT_ENCOUNTER_ROTATIONS[0].id)
    );
    if (result.recorded) {
      state.encounterRotationProof = true;
      state.encounterRotationId = result.rotationId;
      state.encounterRotationName = result.rotationName;
      state.encounterRotationScore = result.score;
      state.encounterRotationRequiredScore = result.requiredScore;
      state.encounterRotationRouteIds = result.routeIds;
      state.encounterRotationSpiritIds = result.encounterSpiritIds;
      state.encounterRotationLureItemIds = result.lureItemIds;
      state.encounterRotationWindows = result.rotationWindows;
      state.encounterRotationScrollClaimed = result.rewardItemId === 'jade-encounter-rotation-scroll';
      state.weatherVeilId = result.weatherVeilId || state.weatherVeilId;
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.attunedSpiritIds = Array.from(new Set([...state.attunedSpiritIds, ...result.encounterSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'world.encounter_atlas') {
    const result = resolveSpiritEncounterAtlas(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        encounteredSpiritIds: Array.isArray(payload.encounteredSpiritIds) ? payload.encounteredSpiritIds.map(String) : state.attunedSpiritIds,
        capturedSpiritIds: Array.isArray(payload.capturedSpiritIds) ? payload.capturedSpiritIds.map(String) : state.captureRiteSpiritIds,
        rarityTiers: Array.isArray(payload.rarityTiers) ? payload.rarityTiers.map(String) : Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.rarity))),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        captureRiteProof: Boolean(payload.captureRiteProof ?? state.captureRiteProof),
        captureRiteId: String(payload.captureRiteId || state.captureRiteId || ''),
        fieldAlmanacProof: Boolean(payload.fieldAlmanacProof ?? state.fieldAlmanacProof),
        fieldAlmanacId: String(payload.fieldAlmanacId || state.fieldAlmanacId || ''),
        encounterRotationProof: Boolean(payload.encounterRotationProof ?? state.encounterRotationProof),
        encounterRotationId: String(payload.encounterRotationId || state.encounterRotationId || ''),
        weatherVeilProof: Boolean(payload.weatherVeilProof ?? state.weatherVeilProof),
        weatherVeilId: String(payload.weatherVeilId || state.weatherVeilId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.atlasId || SPIRIT_ENCOUNTER_ATLASES[0].id)
    );
    if (result.recorded) {
      state.encounterAtlasProof = true;
      state.encounterAtlasId = result.atlasId;
      state.encounterAtlasName = result.atlasName;
      state.encounterAtlasScore = result.score;
      state.encounterAtlasRequiredScore = result.requiredScore;
      state.encounterAtlasRouteIds = result.routeIds;
      state.encounterAtlasSpiritIds = result.encounteredSpiritIds;
      state.encounterAtlasCapturedSpiritIds = result.capturedSpiritIds;
      state.encounterAtlasRarityTiers = result.rarityTiers;
      state.encounterAtlasClaimed = result.rewardItemId === 'jade-encounter-atlas';
      state.encounterRotationId = result.encounterRotationId || state.encounterRotationId;
      state.weatherVeilId = result.weatherVeilId || state.weatherVeilId;
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.attunedSpiritIds = Array.from(new Set([...state.attunedSpiritIds, ...result.encounteredSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.habitat_census') {
    const result = resolveSpiritHabitatCensus(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        observedSpiritIds: Array.isArray(payload.observedSpiritIds) ? payload.observedSpiritIds.map(String) : state.encounterAtlasSpiritIds,
        careLoggedSpiritIds: Array.isArray(payload.careLoggedSpiritIds) ? payload.careLoggedSpiritIds.map(String) : state.careCycleCaredSpiritIds,
        encounterAtlasProof: Boolean(payload.encounterAtlasProof ?? state.encounterAtlasProof),
        encounterAtlasId: String(payload.encounterAtlasId || state.encounterAtlasId || ''),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        weatherVeilProof: Boolean(payload.weatherVeilProof ?? state.weatherVeilProof),
        weatherVeilId: String(payload.weatherVeilId || state.weatherVeilId || ''),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        compendiumId: String(payload.compendiumId || state.compendiumId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.censusId || SPIRIT_HABITAT_CENSUSES[0].id)
    );
    if (result.recorded) {
      state.habitatCensusProof = true;
      state.habitatCensusId = result.censusId;
      state.habitatCensusName = result.censusName;
      state.habitatCensusScore = result.score;
      state.habitatCensusRequiredScore = result.requiredScore;
      state.habitatCensusRouteIds = result.routeIds;
      state.habitatCensusSpiritIds = result.observedSpiritIds;
      state.habitatCensusCareLoggedSpiritIds = result.careLoggedSpiritIds;
      state.habitatCensusSealClaimed = result.rewardItemId === 'jade-habitat-census-seal';
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.attunedSpiritIds = Array.from(new Set([...state.attunedSpiritIds, ...result.roster, ...result.observedSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'item.craft_writ') {
    const result = resolveSpiritCraftWrit(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        recipeIds: Array.isArray(payload.recipeIds) ? payload.recipeIds.map(String) : SPIRIT_CRAFT_WRITS[0].requiredRecipeIds,
        stockItemIds: Array.isArray(payload.stockItemIds) ? payload.stockItemIds.map(String) : state.provisionStockItemIds,
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        fieldAlmanacProof: Boolean(payload.fieldAlmanacProof ?? state.fieldAlmanacProof),
        fieldAlmanacId: String(payload.fieldAlmanacId || state.fieldAlmanacId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        temperamentConcordProof: Boolean(payload.temperamentConcordProof ?? state.temperamentConcordProof),
        temperamentConcordId: String(payload.temperamentConcordId || state.temperamentConcordId || ''),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.writId || SPIRIT_CRAFT_WRITS[0].id)
    );
    if (result.crafted) {
      state.craftWritProof = true;
      state.craftWritId = result.writId;
      state.craftWritName = result.writName;
      state.craftWritScore = result.score;
      state.craftWritRequiredScore = result.requiredScore;
      state.craftWritRecipeIds = result.recipeIds;
      state.craftWritStockItemIds = result.stockItemIds;
      state.craftWritClaimed = result.rewardItemId === 'jade-court-craft-writ';
      state.attunedSpiritIds = result.roster;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'trade.exchange_accord') {
    const result = resolveTradeExchangeAccord(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        listedItemIds: Array.isArray(payload.listedItemIds) ? payload.listedItemIds.map(String) : state.provisionStockItemIds,
        offeredItemIds: Array.isArray(payload.offeredItemIds) ? payload.offeredItemIds.map(String) : TRADE_EXCHANGE_ACCORDS[0].requiredItemIds,
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.accordId || TRADE_EXCHANGE_ACCORDS[0].id)
    );
    if (result.exchanged) {
      state.exchangeAccordProof = true;
      state.exchangeAccordId = result.accordId;
      state.exchangeAccordName = result.accordName;
      state.exchangeAccordScore = result.score;
      state.exchangeAccordRequiredScore = result.requiredScore;
      state.exchangeAccordItemIds = result.itemIds;
      state.exchangeAccordPresenceCount = result.localPresenceCount;
      state.exchangeAccordTallyClaimed = result.rewardItemId === 'jade-exchange-accord-tally';
      state.attunedSpiritIds = result.roster;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.route_waystone') {
    const result = resolveSpiritRouteWaystone(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        routeInvitedSpiritIds: Array.isArray(payload.routeInvitedSpiritIds) ? payload.routeInvitedSpiritIds.map(String) : state.routeInvitedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.waystoneId || SPIRIT_ROUTE_WAYSTONES[0].id)
    );
    if (result.activated) {
      state.routeWaystoneProof = true;
      state.routeWaystoneId = result.waystoneId;
      state.routeWaystoneName = result.waystoneName;
      state.routeWaystoneScore = result.score;
      state.routeWaystoneRequiredScore = result.requiredScore;
      state.routeWaystoneRouteIds = result.routeIds;
      state.routeWaystoneInvitedSpiritIds = result.routeInvitedSpiritIds;
      state.routeWaystoneSealClaimed = result.rewardItemId === 'jade-waystone-travel-seal';
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.routeInvitedSpiritIds = Array.from(new Set([...state.routeInvitedSpiritIds, ...result.routeInvitedSpiritIds]));
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'world.route_charter') {
    const result = resolveSpiritRouteCharter(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        routeWaystoneProof: Boolean(payload.routeWaystoneProof ?? state.routeWaystoneProof),
        routeWaystoneId: String(payload.routeWaystoneId || state.routeWaystoneId || ''),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        weatherVeilProof: Boolean(payload.weatherVeilProof ?? state.weatherVeilProof),
        weatherVeilId: String(payload.weatherVeilId || state.weatherVeilId || ''),
        encounterAtlasProof: Boolean(payload.encounterAtlasProof ?? state.encounterAtlasProof),
        encounterAtlasId: String(payload.encounterAtlasId || state.encounterAtlasId || ''),
        habitatCensusProof: Boolean(payload.habitatCensusProof ?? state.habitatCensusProof),
        habitatCensusId: String(payload.habitatCensusId || state.habitatCensusId || ''),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.charterId || SPIRIT_ROUTE_CHARTERS[0].id)
    );
    if (result.charted) {
      state.routeCharterProof = true;
      state.routeCharterId = result.charterId;
      state.routeCharterName = result.charterName;
      state.routeCharterScore = result.score;
      state.routeCharterRequiredScore = result.requiredScore;
      state.routeCharterRouteIds = result.routeIds;
      state.routeCharterPartyIds = result.partyIds;
      state.routeCharterProofIds = result.proofIds;
      state.routeCharterPresenceCount = result.localPresenceCount;
      state.routeCharterSlipClaimed = result.rewardItemId === 'jade-route-charter-slip';
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.nurture_rite') {
    const result = resolveSpiritNurtureRite(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds) ? payload.caredSpiritIds.map(String) : state.careCycleCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        temperamentConcordProof: Boolean(payload.temperamentConcordProof ?? state.temperamentConcordProof),
        temperamentConcordId: String(payload.temperamentConcordId || state.temperamentConcordId || ''),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        raisingMilestoneLabel: String(payload.raisingMilestoneLabel || state.raisingMilestoneLabel || ''),
        bond: Number(payload.bond ?? state.bond ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.riteId || SPIRIT_NURTURE_RITES[0].id)
    );
    if (result.nurtured) {
      state.nurtureRiteProof = true;
      state.nurtureRiteId = result.riteId;
      state.nurtureRiteName = result.riteName;
      state.nurtureRiteScore = result.score;
      state.nurtureRiteRequiredScore = result.requiredScore;
      state.nurtureRiteRosterIds = result.roster;
      state.nurtureRiteCaredSpiritIds = result.caredSpiritIds;
      state.nurtureRibbonClaimed = result.rewardItemId === 'jade-moonwell-nurture-ribbon';
      state.attunedSpiritIds = result.roster;
      state.careCycleCaredSpiritIds = Array.from(new Set([...state.careCycleCaredSpiritIds, ...result.caredSpiritIds]));
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.recovery_tea') {
    const result = resolveSpiritRecoveryTea(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds) ? payload.caredSpiritIds.map(String) : state.nurtureRiteCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[0] || state.attunedSpiritIds[0] || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        sanctuaryRiteProof: Boolean(payload.sanctuaryRiteProof ?? state.sanctuaryRiteProof),
        sanctuaryRiteId: String(payload.sanctuaryRiteId || state.sanctuaryRiteId || ''),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.teaId || SPIRIT_RECOVERY_TEAS[0].id)
    );
    if (result.recovered) {
      state.recoveryTeaProof = true;
      state.recoveryTeaId = result.teaId;
      state.recoveryTeaName = result.teaName;
      state.recoveryTeaScore = result.score;
      state.recoveryTeaRequiredScore = result.requiredScore;
      state.recoveryTeaPartyIds = result.partyIds;
      state.recoveryTeaCaredSpiritIds = result.caredSpiritIds;
      state.recoveryTeaCupClaimed = result.rewardItemId === 'jade-teahouse-recovery-cup';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.careCycleCaredSpiritIds = Array.from(new Set([...state.careCycleCaredSpiritIds, ...result.caredSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'item.provision_catalog') {
    const result = resolveSpiritProvisionCatalog(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        stockItemIds: Array.isArray(payload.stockItemIds) ? payload.stockItemIds.map(String) : state.provisionStockItemIds,
        careItemIds: Array.isArray(payload.careItemIds) ? payload.careItemIds.map(String) : SPIRIT_PROVISION_CATALOGS[0].requiredCareItemIds,
        routeItemIds: Array.isArray(payload.routeItemIds) ? payload.routeItemIds.map(String) : SPIRIT_PROVISION_CATALOGS[0].requiredRouteItemIds,
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        marketReceiptId: String(payload.marketReceiptId || state.marketReceiptId || ''),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        recoveryTeaProof: Boolean(payload.recoveryTeaProof ?? state.recoveryTeaProof),
        recoveryTeaId: String(payload.recoveryTeaId || state.recoveryTeaId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        habitatCensusProof: Boolean(payload.habitatCensusProof ?? state.habitatCensusProof),
        habitatCensusId: String(payload.habitatCensusId || state.habitatCensusId || ''),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.catalogId || SPIRIT_PROVISION_CATALOGS[0].id)
    );
    if (result.cataloged) {
      state.provisionCatalogProof = true;
      state.provisionCatalogId = result.catalogId;
      state.provisionCatalogName = result.catalogName;
      state.provisionCatalogScore = result.score;
      state.provisionCatalogRequiredScore = result.requiredScore;
      state.provisionCatalogItemIds = result.itemIds;
      state.provisionCatalogCareItemIds = result.careItemIds;
      state.provisionCatalogRouteItemIds = result.routeItemIds;
      state.provisionCatalogPresenceCount = result.localPresenceCount;
      state.provisionCatalogSealClaimed = result.rewardItemId === 'jade-provision-catalog-seal';
      state.attunedSpiritIds = result.roster;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'item.battle_kit') {
    const result = resolveSpiritBattleKit(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[0] || state.attunedSpiritIds[0] || ''),
        itemIds: Array.isArray(payload.itemIds) ? payload.itemIds.map(String) : state.provisionCatalogItemIds,
        provisionCatalogProof: Boolean(payload.provisionCatalogProof ?? state.provisionCatalogProof),
        provisionCatalogId: String(payload.provisionCatalogId || state.provisionCatalogId || ''),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        techniqueCodexId: String(payload.techniqueCodexId || state.techniqueCodexId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        recoveryTeaProof: Boolean(payload.recoveryTeaProof ?? state.recoveryTeaProof),
        recoveryTeaId: String(payload.recoveryTeaId || state.recoveryTeaId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        localPresenceCount: Number(payload.localPresenceCount ?? state.battleKitPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.kitId || SPIRIT_BATTLE_KITS[0].id)
    );
    if (result.prepared) {
      state.battleKitProof = true;
      state.battleKitId = result.kitId;
      state.battleKitName = result.kitName;
      state.battleKitScore = result.score;
      state.battleKitRequiredScore = result.requiredScore;
      state.battleKitItemIds = result.itemIds;
      state.battleKitPartyIds = result.partyIds;
      state.battleKitPresenceCount = result.localPresenceCount;
      state.battleKitTagClaimed = result.rewardItemId === 'jade-battle-kit-tag';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'item.remedy_pouch') {
    const result = resolveSpiritRemedyPouch(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[0] || state.attunedSpiritIds[0] || ''),
        conditionIds: Array.isArray(payload.conditionIds) ? payload.conditionIds.map(String) : state.conditionIds,
        itemIds: Array.isArray(payload.itemIds) ? payload.itemIds.map(String) : state.battleKitItemIds,
        recoveryTeaProof: Boolean(payload.recoveryTeaProof ?? state.recoveryTeaProof),
        recoveryTeaId: String(payload.recoveryTeaId || state.recoveryTeaId || ''),
        battleKitProof: Boolean(payload.battleKitProof ?? state.battleKitProof),
        battleKitId: String(payload.battleKitId || state.battleKitId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        sanctuaryRiteProof: Boolean(payload.sanctuaryRiteProof ?? state.sanctuaryRiteProof),
        sanctuaryRiteId: String(payload.sanctuaryRiteId || state.sanctuaryRiteId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        localPresenceCount: Number(payload.localPresenceCount ?? state.remedyPouchPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.pouchId || SPIRIT_REMEDY_POUCHES[0].id)
    );
    if (result.prepared) {
      state.remedyPouchProof = true;
      state.remedyPouchId = result.pouchId;
      state.remedyPouchName = result.pouchName;
      state.remedyPouchScore = result.score;
      state.remedyPouchRequiredScore = result.requiredScore;
      state.remedyPouchItemIds = result.itemIds;
      state.remedyPouchConditionIds = result.conditionIds;
      state.remedyPouchPartyIds = result.partyIds;
      state.remedyPouchPresenceCount = result.localPresenceCount;
      state.remedyPouchTagClaimed = result.rewardItemId === 'jade-remedy-pouch-tag';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.conditionIds = result.conditionIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.kinship_album') {
    const result = resolveSpiritKinshipAlbum(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds)
          ? payload.caredSpiritIds.map(String)
          : state.nurtureRiteCaredSpiritIds.length
            ? state.nurtureRiteCaredSpiritIds
            : state.careCycleCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || ''),
        bondBySpiritId: normalizeBondMap(payload.bondBySpiritId, state.bond),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        compendiumId: String(payload.compendiumId || state.compendiumId || ''),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        habitatBondId: String(payload.habitatBondId || state.habitatBondId || ''),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        raisingMilestoneLabel: String(payload.raisingMilestoneLabel || state.raisingMilestoneLabel || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.albumId || SPIRIT_KINSHIP_ALBUMS[0].id)
    );
    if (result.recorded) {
      state.kinshipAlbumProof = true;
      state.kinshipAlbumId = result.albumId;
      state.kinshipAlbumName = result.albumName;
      state.kinshipAlbumScore = result.score;
      state.kinshipAlbumRequiredScore = result.requiredScore;
      state.kinshipAlbumSpiritIds = result.roster;
      state.kinshipAlbumCaredSpiritIds = result.caredSpiritIds;
      state.kinshipAlbumTotalBond = result.totalBond;
      state.kinshipAlbumClaimed = result.rewardItemId === 'jade-kinship-album';
      state.attunedSpiritIds = result.roster;
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.nursery_grove') {
    const result = resolveSpiritNurseryGrove(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.kinshipAlbumSpiritIds.length ? state.kinshipAlbumSpiritIds : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.recoveryTeaPartyIds.length ? state.recoveryTeaPartyIds : state.partyIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds)
          ? payload.caredSpiritIds.map(String)
          : state.kinshipAlbumCaredSpiritIds.length
            ? state.kinshipAlbumCaredSpiritIds
            : state.recoveryTeaCaredSpiritIds.length
              ? state.recoveryTeaCaredSpiritIds
              : state.careCycleCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[state.partyIds.length - 1] || state.attunedSpiritIds[0] || ''),
        bondBySpiritId: normalizeBondMap(payload.bondBySpiritId, state.bond),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        recoveryTeaProof: Boolean(payload.recoveryTeaProof ?? state.recoveryTeaProof),
        recoveryTeaId: String(payload.recoveryTeaId || state.recoveryTeaId || ''),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        kinshipAlbumId: String(payload.kinshipAlbumId || state.kinshipAlbumId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        raisingMilestoneLabel: String(payload.raisingMilestoneLabel || state.raisingMilestoneLabel || ''),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.nurseryId || SPIRIT_NURSERY_GROVES[0].id)
    );
    if (result.cultivated) {
      state.nurseryGroveProof = true;
      state.nurseryGroveId = result.nurseryId;
      state.nurseryGroveName = result.nurseryName;
      state.nurseryGroveScore = result.score;
      state.nurseryGroveRequiredScore = result.requiredScore;
      state.nurseryGroveSpiritIds = result.roster;
      state.nurseryGrovePartyIds = result.partyIds;
      state.nurseryGroveCaredSpiritIds = result.caredSpiritIds;
      state.nurseryGroveTotalBond = result.totalBond;
      state.nurserySproutClaimed = result.rewardItemId === 'jade-nursery-sprout';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.careCycleCaredSpiritIds = Array.from(new Set([...state.careCycleCaredSpiritIds, ...result.caredSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.bloom_ascendance') {
    const result = resolveSpiritBloomAscendance(
      {
        roster: Array.isArray(payload.roster)
          ? payload.roster.map(String)
          : state.nurseryGroveSpiritIds.length
            ? state.nurseryGroveSpiritIds
            : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds)
          ? payload.partyIds.map(String)
          : state.nurseryGrovePartyIds.length
            ? state.nurseryGrovePartyIds
            : state.partyIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds)
          ? payload.caredSpiritIds.map(String)
          : state.nurseryGroveCaredSpiritIds.length
            ? state.nurseryGroveCaredSpiritIds
            : state.careCycleCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[state.partyIds.length - 1] || state.attunedSpiritIds[0] || ''),
        bondBySpiritId: normalizeBondMap(payload.bondBySpiritId, state.bond),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        nurseryGroveId: String(payload.nurseryGroveId || state.nurseryGroveId || ''),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        kinshipAlbumId: String(payload.kinshipAlbumId || state.kinshipAlbumId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        traitAttunementId: String(payload.traitAttunementId || state.traitAttunementId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.ascendanceId || SPIRIT_BLOOM_ASCENDANCES[0].id)
    );
    if (result.ascended) {
      state.bloomAscendanceProof = true;
      state.bloomAscendanceId = result.ascendanceId;
      state.bloomAscendanceName = result.ascendanceName;
      state.bloomAscendanceFormTitle = result.formTitle;
      state.bloomAscendanceScore = result.score;
      state.bloomAscendanceRequiredScore = result.requiredScore;
      state.bloomAscendanceSpiritIds = result.roster;
      state.bloomAscendancePartyIds = result.partyIds;
      state.bloomAscendanceCaredSpiritIds = result.caredSpiritIds;
      state.bloomAscendanceTotalBond = result.totalBond;
      state.bloomAscendanceSigilClaimed = result.rewardItemId === 'jade-bloom-ascendance-sigil';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.careCycleCaredSpiritIds = Array.from(new Set([...state.careCycleCaredSpiritIds, ...result.caredSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.lineage_register') {
    const result = resolveSpiritLineageRegister(
      {
        roster: Array.isArray(payload.roster)
          ? payload.roster.map(String)
          : state.bloomAscendanceSpiritIds.length
            ? state.bloomAscendanceSpiritIds
            : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds)
          ? payload.partyIds.map(String)
          : state.bloomAscendancePartyIds.length
            ? state.bloomAscendancePartyIds
            : state.partyIds,
        caredSpiritIds: Array.isArray(payload.caredSpiritIds)
          ? payload.caredSpiritIds.map(String)
          : state.bloomAscendanceCaredSpiritIds.length
            ? state.bloomAscendanceCaredSpiritIds
            : state.careCycleCaredSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.partyIds[state.partyIds.length - 1] || state.attunedSpiritIds[0] || ''),
        bondBySpiritId: normalizeBondMap(payload.bondBySpiritId, state.bond),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        kinshipAlbumId: String(payload.kinshipAlbumId || state.kinshipAlbumId || ''),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        nurseryGroveId: String(payload.nurseryGroveId || state.nurseryGroveId || ''),
        bloomAscendanceProof: Boolean(payload.bloomAscendanceProof ?? state.bloomAscendanceProof),
        bloomAscendanceId: String(payload.bloomAscendanceId || state.bloomAscendanceId || ''),
        captureRiteProof: Boolean(payload.captureRiteProof ?? state.captureRiteProof),
        captureRiteId: String(payload.captureRiteId || state.captureRiteId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        careCycleId: String(payload.careCycleId || state.careCycleId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        growthForm: String(payload.growthForm || state.growthForm || ''),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        raisingMilestoneLabel: String(payload.raisingMilestoneLabel || state.raisingMilestoneLabel || ''),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.registerId || SPIRIT_LINEAGE_REGISTERS[0].id)
    );
    if (result.registered) {
      state.lineageRegisterProof = true;
      state.lineageRegisterId = result.registerId;
      state.lineageRegisterName = result.registerName;
      state.lineageRegisterScore = result.score;
      state.lineageRegisterRequiredScore = result.requiredScore;
      state.lineageRegisterSpiritIds = result.roster;
      state.lineageRegisterPartyIds = result.partyIds;
      state.lineageRegisterCaredSpiritIds = result.caredSpiritIds;
      state.lineageRegisterMilestoneLabels = result.milestoneLabels;
      state.lineageRegisterSealClaimed = result.rewardItemId === 'jade-lineage-register-seal';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.spiritId = result.activeSpiritId || state.spiritId;
      state.careCycleCaredSpiritIds = Array.from(new Set([...state.careCycleCaredSpiritIds, ...result.caredSpiritIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'guild.commission_complete') {
    const result = resolveGuildCommission(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.commissionId || GUILD_COMMISSIONS[0].id)
    );
    if (result.completed) {
      state.commissionProof = true;
      state.commissionId = result.commissionId;
      state.commissionName = result.commissionName;
      state.commissionScore = result.score;
      state.commissionKnotClaimed = result.rewardItemId === 'jade-court-commission-knot';
      state.attunedSpiritIds = result.roster;
      state.completedQuestIds = result.completedQuestIds;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'guild.social_rally') {
    const result = resolveGuildSocialRally(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat,
        emoteProof: Boolean(payload.emoteProof ?? state.emoteProof),
        commissionProof: Boolean(payload.commissionProof ?? state.commissionProof),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof)
      },
      String(payload.rallyId || GUILD_SOCIAL_RALLIES[0].id)
    );
    if (result.rallied) {
      state.rallyProof = true;
      state.rallyId = result.rallyId;
      state.rallyName = result.rallyName;
      state.rallyScore = result.score;
      state.rallyPresenceCount = result.localPresenceCount;
      state.rallyKnotClaimed = result.rewardItemId === 'jade-courtyard-rally-knot';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'quest.ledger_record') {
    const result = resolveMochiQuestLedger(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        acceptedQuestIds: Array.isArray(payload.acceptedQuestIds) ? payload.acceptedQuestIds.map(String) : state.acceptedQuestIds,
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        marketReceiptId: String(payload.marketReceiptId || state.marketReceiptId || ''),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionSatchelId: String(payload.provisionSatchelId || state.provisionSatchelId || ''),
        commissionProof: Boolean(payload.commissionProof ?? state.commissionProof),
        commissionId: String(payload.commissionId || state.commissionId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.ledgerId || MOCHI_QUEST_LEDGERS[0].id)
    );
    if (result.recorded) {
      state.questLedgerProof = true;
      state.questLedgerId = result.ledgerId;
      state.questLedgerName = result.ledgerName;
      state.questLedgerScore = result.score;
      state.questLedgerRequiredScore = result.requiredScore;
      state.questLedgerAcceptedQuestIds = result.acceptedQuestIds;
      state.questLedgerCompletedQuestIds = result.completedQuestIds;
      state.questLedgerSealClaimed = result.rewardItemId === 'jade-quest-ledger-seal';
      state.attunedSpiritIds = result.roster;
      state.acceptedQuestIds = Array.from(new Set([...state.acceptedQuestIds, ...result.acceptedQuestIds]));
      state.completedQuestIds = Array.from(new Set([...state.completedQuestIds, ...result.completedQuestIds]));
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'story.chapter_complete') {
    const result = resolveMochiStoryChapter(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        routeEcologyId: String(payload.routeEcologyId || state.routeEcologyId || ''),
        routeWaystoneProof: Boolean(payload.routeWaystoneProof ?? state.routeWaystoneProof),
        routeWaystoneId: String(payload.routeWaystoneId || state.routeWaystoneId || ''),
        questLedgerProof: Boolean(payload.questLedgerProof ?? state.questLedgerProof),
        questLedgerId: String(payload.questLedgerId || state.questLedgerId || MOCHI_QUEST_LEDGERS[0].id),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        nurtureRiteId: String(payload.nurtureRiteId || state.nurtureRiteId || ''),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        tournamentId: String(payload.tournamentId || state.tournamentId || ''),
        commissionProof: Boolean(payload.commissionProof ?? state.commissionProof),
        commissionId: String(payload.commissionId || state.commissionId || ''),
        rallyProof: Boolean(payload.rallyProof ?? state.rallyProof),
        rallyId: String(payload.rallyId || state.rallyId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        emoteProof: Boolean(payload.emoteProof ?? state.emoteProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.chapterId || MOCHI_STORY_CHAPTERS[0].id)
    );
    if (result.recorded) {
      state.storyChapterProof = true;
      state.storyChapterId = result.chapterId;
      state.storyChapterName = result.chapterName;
      state.storyChapterScore = result.score;
      state.storyChapterRequiredScore = result.requiredScore;
      state.storyChapterRouteIds = result.routeIds;
      state.storyChapterQuestIds = result.completedQuestIds;
      state.storyScrollClaimed = result.rewardItemId === 'jade-scroll-story-chapter';
      state.discoveredRouteIds = Array.from(new Set([...state.discoveredRouteIds, ...result.routeIds]));
      state.completedQuestIds = Array.from(new Set([...state.completedQuestIds, ...result.completedQuestIds]));
    }
    state.chat.push(result.message);
  }

  if (type === 'guild.insignia_case') {
    const result = resolveGuildInsigniaCase(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routePatrolId: String(payload.routePatrolId || state.routePatrolId || ''),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        guildRankId: String(payload.guildRankId || state.guildRankId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        tournamentId: String(payload.tournamentId || state.tournamentId || ''),
        storyChapterProof: Boolean(payload.storyChapterProof ?? state.storyChapterProof),
        storyChapterId: String(payload.storyChapterId || state.storyChapterId || ''),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyFormId: String(payload.harmonyFormId || state.harmonyFormId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        emoteProof: Boolean(payload.emoteProof ?? state.emoteProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.caseId || GUILD_INSIGNIA_CASES[0].id)
    );
    if (result.completed) {
      state.insigniaCaseProof = true;
      state.insigniaCaseId = result.caseId;
      state.insigniaCaseName = result.caseName;
      state.insigniaCaseScore = result.score;
      state.insigniaCaseRequiredScore = result.requiredScore;
      state.insigniaCaseSpiritIds = result.roster;
      state.insigniaCasePartyIds = result.partyIds;
      state.insigniaCaseClaimed = result.rewardItemId === 'jade-insignia-case';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'guild.wayfarer_chronicle') {
    const result = resolveGuildWayfarerChronicle(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        starterVowProof: Boolean(payload.starterVowProof ?? state.starterVowProof),
        captureProof: Boolean(payload.captureProof ?? state.captureProof),
        captureRiteProof: Boolean(payload.captureRiteProof ?? state.captureRiteProof),
        encounterAtlasProof: Boolean(payload.encounterAtlasProof ?? state.encounterAtlasProof),
        habitatCensusProof: Boolean(payload.habitatCensusProof ?? state.habitatCensusProof),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        routeEcologyProof: Boolean(payload.routeEcologyProof ?? state.routeEcologyProof),
        habitatBondProof: Boolean(payload.habitatBondProof ?? state.habitatBondProof),
        researchProof: Boolean(payload.researchProof ?? state.researchProof),
        compendiumProof: Boolean(payload.compendiumProof ?? state.compendiumProof),
        provisionProof: Boolean(payload.provisionProof ?? state.provisionProof),
        provisionCatalogProof: Boolean(payload.provisionCatalogProof ?? state.provisionCatalogProof),
        battleKitProof: Boolean(payload.battleKitProof ?? state.battleKitProof),
        remedyPouchProof: Boolean(payload.remedyPouchProof ?? state.remedyPouchProof),
        questLedgerProof: Boolean(payload.questLedgerProof ?? state.questLedgerProof),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        routeWaystoneProof: Boolean(payload.routeWaystoneProof ?? state.routeWaystoneProof),
        routeCharterProof: Boolean(payload.routeCharterProof ?? state.routeCharterProof),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        bloomAscendanceProof: Boolean(payload.bloomAscendanceProof ?? state.bloomAscendanceProof),
        lineageRegisterProof: Boolean(payload.lineageRegisterProof ?? state.lineageRegisterProof),
        rosterCabinetProof: Boolean(payload.rosterCabinetProof ?? state.rosterCabinetProof),
        blossomCradleProof: Boolean(payload.blossomCradleProof ?? state.blossomCradleProof),
        exchangeAccordProof: Boolean(payload.exchangeAccordProof ?? state.exchangeAccordProof),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        relicAttunementProof: Boolean(payload.relicAttunementProof ?? state.relicAttunementProof),
        commissionProof: Boolean(payload.commissionProof ?? state.commissionProof),
        rallyProof: Boolean(payload.rallyProof ?? state.rallyProof),
        storyChapterProof: Boolean(payload.storyChapterProof ?? state.storyChapterProof),
        insigniaCaseProof: Boolean(payload.insigniaCaseProof ?? state.insigniaCaseProof),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        sifuCouncilProof: Boolean(payload.sifuCouncilProof ?? state.sifuCouncilProof),
        summitCircuitProof: Boolean(payload.summitCircuitProof ?? state.summitCircuitProof),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        canaryPreviewProof: Boolean(payload.canaryPreviewProof ?? (state.canaryRequested && state.canaryReturnRequested)),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.chronicleId || GUILD_WAYFARER_CHRONICLES[0].id)
    );
    if (result.chronicled) {
      state.wayfarerChronicleProof = true;
      state.wayfarerChronicleId = result.chronicleId;
      state.wayfarerChronicleName = result.chronicleName;
      state.wayfarerChronicleScore = result.score;
      state.wayfarerChronicleRequiredScore = result.requiredScore;
      state.wayfarerChronicleClaspClaimed = result.rewardItemId === 'jade-wayfarer-chronicle-clasp';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.completedQuestIds = result.completedQuestIds;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'guild.ascension_trial') {
    const result = resolveGuildAscensionTrial(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds.slice(0, 3),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        starterVowProof: Boolean(payload.starterVowProof ?? state.starterVowProof),
        wayfarerChronicleProof: Boolean(payload.wayfarerChronicleProof ?? state.wayfarerChronicleProof),
        kinshipAlbumProof: Boolean(payload.kinshipAlbumProof ?? state.kinshipAlbumProof),
        nurseryGroveProof: Boolean(payload.nurseryGroveProof ?? state.nurseryGroveProof),
        bloomAscendanceProof: Boolean(payload.bloomAscendanceProof ?? state.bloomAscendanceProof),
        lineageRegisterProof: Boolean(payload.lineageRegisterProof ?? state.lineageRegisterProof),
        rosterCabinetProof: Boolean(payload.rosterCabinetProof ?? state.rosterCabinetProof),
        blossomCradleProof: Boolean(payload.blossomCradleProof ?? state.blossomCradleProof),
        routeCharterProof: Boolean(payload.routeCharterProof ?? state.routeCharterProof),
        exchangeAccordProof: Boolean(payload.exchangeAccordProof ?? state.exchangeAccordProof),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        relicAttunementProof: Boolean(payload.relicAttunementProof ?? state.relicAttunementProof),
        storyChapterProof: Boolean(payload.storyChapterProof ?? state.storyChapterProof),
        insigniaCaseProof: Boolean(payload.insigniaCaseProof ?? state.insigniaCaseProof),
        rivalCircleProof: Boolean(payload.rivalCircleProof ?? state.rivalCircleProof),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        sifuCouncilProof: Boolean(payload.sifuCouncilProof ?? state.sifuCouncilProof),
        summitCircuitProof: Boolean(payload.summitCircuitProof ?? state.summitCircuitProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        marketReceiptProof: Boolean(payload.marketReceiptProof ?? state.marketReceiptProof),
        provisionCatalogProof: Boolean(payload.provisionCatalogProof ?? state.provisionCatalogProof),
        battleKitProof: Boolean(payload.battleKitProof ?? state.battleKitProof),
        remedyPouchProof: Boolean(payload.remedyPouchProof ?? state.remedyPouchProof),
        questLedgerProof: Boolean(payload.questLedgerProof ?? state.questLedgerProof),
        tradeProof: Boolean(payload.tradeProof ?? state.tradeProof),
        canaryPreviewProof: Boolean(payload.canaryPreviewProof ?? (state.canaryRequested && state.canaryReturnRequested)),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.trialId || GUILD_ASCENSION_TRIALS[0].id)
    );
    if (result.ascended) {
      state.guildAscensionProof = true;
      state.guildAscensionTrialId = result.trialId;
      state.guildAscensionTrialName = result.trialName;
      state.guildAscensionScore = result.score;
      state.guildAscensionRequiredScore = result.requiredScore;
      state.guildAscensionRibbonClaimed = result.rewardItemId === 'jade-court-ascension-ribbon';
      state.attunedSpiritIds = result.roster;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'world.expedition') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === String(payload.routeId || '')) || SPIRIT_EXPEDITION_ROUTES[0];
    const result = resolveSpiritExpedition(
      route.id,
      roster,
      String(payload.activeSpiritId || state.spiritId || roster[0] || ''),
      Number(payload.harmonyScore || (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length),
      Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds
    );
    if (result.ok) {
      state.expeditionProof = true;
      state.lastExpeditionRouteId = result.routeId;
      state.lastExpeditionEncounterId = result.encounterSpiritId;
      state.discoveredRouteIds = result.discoveredRoutes;
      state.expeditionCount = Math.max(state.expeditionCount + 1, result.discoveredRoutes.length);
      state.routeRibbonClaimed = state.routeRibbonClaimed || result.rewardItemId === 'moonbridge-field-ribbon';
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.route_invite') {
    const roster = Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds;
    const route =
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === String(payload.routeId || '')) ||
      SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === state.lastExpeditionRouteId) ||
      SPIRIT_EXPEDITION_ROUTES[0];
    const harmonyScore = Number(payload.harmonyScore || (state.bond || 1) + Math.max(1, roster.length) + state.partyIds.length + state.expeditionCount);
    const accord = resolveSpiritFieldAccord(
      {
        routeId: route.id,
        roster,
        activeSpiritId: state.spiritId || roster[0],
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        harmonyScore,
        bondBySpiritId: Object.fromEntries(roster.map((spiritId) => [spiritId, Math.max(1, getSpiritBond(state, spiritId))])),
        tacticProof: state.tacticProof,
        affinityProof: state.affinityProof,
        journalDiscoveredCount: state.journalDiscoveredCount
      },
      SPIRIT_FIELD_ACCORDS.find((entry) => entry.routeId === route.id)?.id
    );
    if (accord.cleared) {
      state.fieldAccordProof = true;
      state.fieldAccordId = accord.accordId;
      state.fieldAccordName = accord.accordName;
      state.fieldAccordScore = accord.score;
      state.fieldAccordRequiredScore = accord.requiredScore;
      state.lastFieldAccordRouteId = accord.routeId;
      state.lastFieldAccordSpiritId = accord.targetSpiritId;
      state.fieldAccordTalismanClaimed = accord.rewardItemId === 'jade-field-accord-talisman';
    }
    state.chat.push(accord.message);
    if (accord.cleared) {
      const result = resolveSpiritRouteInvitation(
        route.id,
        String(payload.offeredItemId || route.recommendedItemId),
        harmonyScore,
        roster,
        Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        true
      );
      if (result.ok) {
        state.routeInviteProof = true;
        state.lastRouteInviteRouteId = result.routeId;
        state.lastRouteInviteSpiritId = result.spiritId;
        if (!state.routeInvitedSpiritIds.includes(result.spiritId)) {
          state.routeInvitedSpiritIds.push(result.spiritId);
        }
        state.captureProof = true;
        state.lastCaptureSpiritId = result.spiritId;
        state.spiritId = result.spiritId;
        for (const spiritId of result.roster) {
          if (!state.attunedSpiritIds.includes(spiritId)) {
            state.attunedSpiritIds.push(spiritId);
          }
          setSpiritProgress(state, spiritId, Math.max(1, getSpiritBond(state, spiritId)));
        }
        setSpiritProgress(state, result.spiritId, Math.max(getSpiritBond(state, result.spiritId), result.bond), result.growth);
        focusSpirit(state, result.spiritId);
      }
      state.chat.push(result.message);
    }
  }

  if (type === 'world.route_mastery') {
    const result = resolveSpiritRouteMastery(
      {
        discoveredRoutes: Array.isArray(payload.discoveredRoutes) ? payload.discoveredRoutes.map(String) : state.discoveredRouteIds,
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        completedQuestIds: Array.isArray(payload.completedQuestIds) ? payload.completedQuestIds.map(String) : state.completedQuestIds,
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        rankTrialId: String(payload.rankTrialId || state.guildRankId || '')
      },
      String(payload.masteryId || SPIRIT_ROUTE_MASTERIES[0].id)
    );
    if (result.mastered) {
      state.routeMasteryProof = true;
      state.routeMasteryId = result.masteryId;
      state.routeMasteryTitle = result.title;
      state.routeMasteryScore = result.score;
      state.routeMasteryKnotClaimed = result.rewardItemId === 'cloudbell-route-knot';
    }
    state.chat.push(result.message);
  }

  if (type === 'world.route_patrol') {
    const result = resolveSpiritRoutePatrol(
      {
        routeId: String(payload.routeId || state.lastExpeditionRouteId || SPIRIT_ROUTE_PATROLS[0].routeId),
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        fieldAccordProof: Boolean(payload.fieldAccordProof ?? state.fieldAccordProof),
        fieldAccordId: String(payload.fieldAccordId || state.fieldAccordId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.patrolId || SPIRIT_ROUTE_PATROLS[0].id)
    );
    if (result.patrolled) {
      state.routePatrolProof = true;
      state.routePatrolId = result.patrolId;
      state.routePatrolName = result.patrolName;
      state.routePatrolScore = result.score;
      state.routePatrolRequiredScore = result.requiredScore;
      state.routePatrolPennantClaimed = result.rewardItemId === 'jade-route-patrol-pennant';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.technique') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || spirit.battle.moves[0].id);
    const result = resolveSpiritTechniqueMastery(spirit.id, moveId, Number(payload.currentMasteryXp || state.techniqueMasteryXp || 0), Number(payload.bond || state.bond || 1));
    if (result.ok) {
      state.techniqueProof = true;
      state.techniqueMoveId = result.moveId;
      state.techniqueMasteryXp = result.masteryXp;
      state.techniqueMasteryLevel = result.masteryLevel;
      state.techniqueFocusScore = result.focusScore;
      state.spiritId = result.spiritId;
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.tactic_scroll') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || state.techniqueMoveId || spirit.battle.moves[0].id);
    const tacticId = String(payload.tacticId || state.lastTacticId || '');
    const result = resolveSpiritBattleTactic(
      spirit.id,
      moveId,
      tacticId,
      Number(payload.currentMasteryXp || Math.max(state.tacticMasteryXp || 0, state.techniqueMasteryXp || 0)),
      Number(payload.bond || state.bond || 1)
    );
    if (result.ok) {
      state.tacticProof = true;
      state.lastTacticId = result.tacticId;
      state.lastTacticSpiritId = result.spiritId;
      state.lastTacticMoveId = result.moveId;
      state.tacticStance = result.stance;
      state.tacticFocusScore = result.focusScore;
      state.tacticMasteryXp = result.masteryXp;
      state.techniqueMasteryXp = Math.max(state.techniqueMasteryXp, result.masteryXp);
      state.techniqueMasteryLevel = techniqueMasteryLevelFromXp(state.techniqueMasteryXp);
      state.techniqueMoveId = result.moveId;
      state.spiritId = result.spiritId;
      state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
      state.growth = growthStageFromBond(state.bond);
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.technique_loadout') {
    const preferredMoveIdBySpiritId = Object.fromEntries(
      MOCHI_SPIRITS.map((spirit) => {
        const tacticMove = SPIRIT_BATTLE_TACTICS.find((tactic) => tactic.preferredRoles.includes(spirit.battle.role))?.recommendedMoveId;
        return [spirit.id, tacticMove || spirit.battle.moves[0].id];
      })
    );
    const result = resolveSpiritTechniqueLoadout(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        preferredMoveIdBySpiritId,
        techniqueProof: Boolean(payload.techniqueProof ?? state.techniqueProof),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        tacticId: String(payload.tacticId || state.lastTacticId || ''),
        techniqueMasteryXp: Number(payload.techniqueMasteryXp ?? state.techniqueMasteryXp ?? 0),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        journalProof: Boolean(payload.journalProof ?? state.journalProof),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0)
      },
      String(payload.loadoutId || SPIRIT_TECHNIQUE_LOADOUTS[0].id)
    );
    if (result.prepared) {
      state.techniqueLoadoutProof = true;
      state.techniqueLoadoutId = result.loadoutId;
      state.techniqueLoadoutName = result.loadoutName;
      state.techniqueLoadoutScore = result.score;
      state.techniqueLoadoutMoves = result.moves.map((move) => `${move.spiritId}:${move.moveId}`);
      state.loadoutSlipClaimed = result.rewardItemId === 'jade-step-loadout-slip';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.technique_codex') {
    const result = resolveSpiritTechniqueCodex(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        masteredMoveIds: Array.isArray(payload.masteredMoveIds) ? payload.masteredMoveIds.map(String) : SPIRIT_TECHNIQUE_CODEXES[0].requiredMoveIds,
        tacticIds: Array.isArray(payload.tacticIds) ? payload.tacticIds.map(String) : SPIRIT_TECHNIQUE_CODEXES[0].requiredTacticIds,
        techniqueProof: Boolean(payload.techniqueProof ?? state.techniqueProof),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        techniqueLoadoutId: String(payload.techniqueLoadoutId || state.techniqueLoadoutId || ''),
        techniqueMasteryXp: Number(payload.techniqueMasteryXp ?? state.techniqueMasteryXp ?? 0),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        journalProof: Boolean(payload.journalProof ?? state.journalProof),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.codexId || SPIRIT_TECHNIQUE_CODEXES[0].id)
    );
    if (result.codified) {
      state.techniqueCodexProof = true;
      state.techniqueCodexId = result.codexId;
      state.techniqueCodexName = result.codexName;
      state.techniqueCodexScore = result.score;
      state.techniqueCodexRequiredScore = result.requiredScore;
      state.techniqueCodexPartyIds = result.partyIds;
      state.techniqueCodexMoveIds = result.masteredMoveIds;
      state.techniqueCodexTacticIds = result.tacticIds;
      state.techniqueCodexSealClaimed = result.rewardItemId === 'jade-technique-codex-seal';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.trait_attune') {
    const partyIds = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const result = resolveSpiritTraitAttunement(
      {
        partyIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || partyIds[0] || ''),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        techniqueLoadoutId: String(payload.techniqueLoadoutId || state.techniqueLoadoutId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        careStreak: Number(payload.careStreak ?? state.raisingCareStreak ?? 0),
        journalProof: Boolean(payload.journalProof ?? state.journalProof),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        bondBySpiritId:
          payload.bondBySpiritId && typeof payload.bondBySpiritId === 'object'
            ? (payload.bondBySpiritId as Record<string, number>)
            : Object.fromEntries(partyIds.map((spiritId) => [spiritId, state.bond || 1]))
      },
      String(payload.traitId || SPIRIT_TRAIT_ATTUNEMENTS[0].id)
    );
    if (result.unlocked) {
      state.traitAttunementProof = true;
      state.traitAttunementId = result.traitId;
      state.traitAttunementName = result.traitName;
      state.traitLabel = result.traitLabel;
      state.traitAttunementScore = result.score;
      state.traitThreadClaimed = result.rewardItemId === 'jade-heart-trait-thread';
      state.spiritId = result.activeSpiritId;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.condition_weave') {
    const partyIds = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const result = resolveSpiritConditionWeave(
      {
        partyIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || partyIds[0] || ''),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        techniqueLoadoutId: String(payload.techniqueLoadoutId || state.techniqueLoadoutId || ''),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        traitAttunementId: String(payload.traitAttunementId || state.traitAttunementId || ''),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.weaveId || SPIRIT_CONDITION_WEAVES[0].id)
    );
    if (result.woven) {
      state.conditionWeaveProof = true;
      state.conditionWeaveId = result.weaveId;
      state.conditionWeaveName = result.weaveName;
      state.conditionWeaveScore = result.score;
      state.conditionIds = result.conditionIds;
      state.conditionCharmClaimed = result.rewardItemId === 'jade-mirror-condition-charm';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.spiritId = result.activeSpiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.affinity_matrix') {
    const partyIds = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const result = resolveSpiritAffinityMatrix(
      {
        partyIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || partyIds[0] || ''),
        affinityLabels: Array.isArray(payload.affinityLabels)
          ? payload.affinityLabels.map(String)
          : partyIds.map((partySpiritId) => MOCHI_SPIRITS.find((entry) => entry.id === partySpiritId)?.affinity || ''),
        conditionIds: Array.isArray(payload.conditionIds) ? payload.conditionIds.map(String) : state.conditionIds,
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        affinityTrialId: String(payload.affinityTrialId || state.lastAffinityTrialId || ''),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        techniqueLoadoutId: String(payload.techniqueLoadoutId || state.techniqueLoadoutId || ''),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        traitAttunementId: String(payload.traitAttunementId || state.traitAttunementId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.matrixId || SPIRIT_AFFINITY_MATRICES[0].id)
    );
    if (result.mapped) {
      state.affinityMatrixProof = true;
      state.affinityMatrixId = result.matrixId;
      state.affinityMatrixName = result.matrixName;
      state.affinityMatrixScore = result.score;
      state.affinityMatrixRequiredScore = result.requiredScore;
      state.affinityMatrixSpiritIds = result.partyIds;
      state.affinityMatrixAffinityLabels = result.affinityLabels;
      state.affinityMatrixConditionIds = result.conditionIds;
      state.affinityMatrixSealClaimed = result.rewardItemId === 'jade-affinity-matrix-seal';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0] || state.activePartyId;
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.relic_attune') {
    const partyIds = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const result = resolveSpiritRelicAttunement(
      {
        partyIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || partyIds[0] || ''),
        itemIds: Array.isArray(payload.itemIds) ? payload.itemIds.map(String) : SPIRIT_RELIC_ATTUNEMENTS[0].requiredItemIds,
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        techniqueLoadoutId: String(payload.techniqueLoadoutId || state.techniqueLoadoutId || ''),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        techniqueCodexId: String(payload.techniqueCodexId || state.techniqueCodexId || ''),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        traitAttunementId: String(payload.traitAttunementId || state.traitAttunementId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        craftWritProof: Boolean(payload.craftWritProof ?? state.craftWritProof),
        craftWritId: String(payload.craftWritId || state.craftWritId || ''),
        exchangeAccordProof: Boolean(payload.exchangeAccordProof ?? state.exchangeAccordProof),
        exchangeAccordId: String(payload.exchangeAccordId || state.exchangeAccordId || ''),
        careCycleProof: Boolean(payload.careCycleProof ?? state.careCycleProof),
        temperamentConcordProof: Boolean(payload.temperamentConcordProof ?? state.temperamentConcordProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.relicAttunementId || SPIRIT_RELIC_ATTUNEMENTS[0].id)
    );
    if (result.attuned) {
      state.relicAttunementProof = true;
      state.relicAttunementId = result.relicAttunementId;
      state.relicAttunementName = result.relicAttunementName;
      state.relicAttunementScore = result.score;
      state.relicAttunementRequiredScore = result.requiredScore;
      state.relicAttunementSpiritIds = result.partyIds;
      state.relicAttunementItemIds = result.itemIds;
      state.relicLabel = result.relicLabel;
      state.relicSilkCordClaimed = result.rewardItemId === 'jade-relic-silk-cord';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
      state.spiritId = result.activeSpiritId || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.affinity_trial') {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === String(payload.spiritId || state.spiritId)) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || state.techniqueMoveId || spirit.battle.moves[0].id);
    const result = resolveSpiritAffinityTrial(
      spirit.id,
      moveId,
      String(payload.trialId || SPIRIT_AFFINITY_TRIALS[0].id),
      Number(payload.bond || state.bond || 1),
      Number(payload.techniqueMasteryXp || state.techniqueMasteryXp || 0)
    );
    if (result.ok) {
      state.affinityProof = true;
      state.lastAffinityTrialId = result.trialId;
      state.affinityAdvantage = result.affinityAdvantage;
      state.affinityFocusScore = result.focusScore;
      state.affinityTrialScore = result.trialScore;
      state.techniqueMasteryXp = result.masteryXp;
      state.techniqueMoveId = result.moveId;
      state.spiritId = result.spiritId;
      if (result.victory) {
        state.affinityTrialWins += 1;
        state.bond = Math.min(5, Math.max(state.bond, 1) + result.bondDelta);
        state.growth = growthStageFromBond(state.bond);
      }
      if (!state.attunedSpiritIds.includes(result.spiritId)) {
        state.attunedSpiritIds.push(result.spiritId);
      }
    }
    state.chat.push(result.message);
  }

  if (type === 'party.set') {
    const requestedParty = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.attunedSpiritIds;
    const result = resolveSpiritParty(requestedParty, String(payload.activeSpiritId || state.spiritId || requestedParty[0] || ''));
    if (result.ok) {
      state.activePartyId = result.activeSpiritId;
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.supportIds;
      state.spiritId = result.activeSpiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'party.harmony_form') {
    const result = resolveSpiritHarmonyForm(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        routeMasteryId: String(payload.routeMasteryId || state.routeMasteryId || ''),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        growthRiteId: String(payload.growthRiteId || state.growthRiteId || ''),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0)
      },
      String(payload.formId || SPIRIT_HARMONY_FORMS[0].id)
    );
    if (result.formed) {
      state.harmonyFormProof = true;
      state.harmonyFormId = result.formId;
      state.harmonyFormName = result.name;
      state.harmonyFormScore = result.score;
      state.harmonySashClaimed = result.rewardItemId === 'triune-jade-sash';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.harmony_trial') {
    const result = resolveSpiritHarmonyTrial(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyFormId: String(payload.harmonyFormId || state.harmonyFormId || ''),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityProof: Boolean(payload.affinityProof ?? state.affinityProof),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.trialId || SPIRIT_HARMONY_TRIALS[0].id)
    );
    if (result.cleared) {
      state.harmonyTrialProof = true;
      state.harmonyTrialId = result.trialId;
      state.harmonyTrialName = result.trialName;
      state.harmonyTrialScore = result.score;
      state.concordTallyClaimed = result.rewardItemId === 'jade-echo-concord-tally';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.team_spar_match') {
    const result = resolveSpiritTeamSparMatch(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        harmonyTrialId: String(payload.harmonyTrialId || state.harmonyTrialId || ''),
        harmonyTrialScore: Number(payload.harmonyTrialScore ?? state.harmonyTrialScore ?? 0),
        routeMasteryProof: Boolean(payload.routeMasteryProof ?? state.routeMasteryProof),
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        questChainProof: Boolean(payload.questChainProof ?? state.questChainProof),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.matchId || SPIRIT_TEAM_SPAR_MATCHES[0].id)
    );
    if (result.cleared) {
      state.teamSparMatchProof = true;
      state.teamSparMatchId = result.matchId;
      state.teamSparMatchName = result.matchName;
      state.teamSparMatchScore = result.score;
      state.teamMatchRibbonClaimed = result.rewardItemId === 'jade-mirror-match-ribbon';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.mentor_challenge') {
    const result = resolveSpiritMentorChallenge(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        teamSparMatchId: String(payload.teamSparMatchId || state.teamSparMatchId || ''),
        teamSparMatchScore: Number(payload.teamSparMatchScore ?? state.teamSparMatchScore ?? 0),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        techniqueMasteryXp: Number(payload.techniqueMasteryXp ?? state.techniqueMasteryXp ?? 0),
        tacticMasteryXp: Number(payload.tacticMasteryXp ?? state.tacticMasteryXp ?? 0),
        raisingCareStreak: Number(payload.raisingCareStreak ?? state.raisingCareStreak ?? 0),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof)
      },
      String(payload.challengeId || SPIRIT_MENTOR_CHALLENGES[0].id)
    );
    if (result.cleared) {
      state.mentorChallengeProof = true;
      state.mentorChallengeId = result.challengeId;
      state.mentorChallengeName = result.challengeName;
      state.mentorChallengeScore = result.score;
      state.mentorSealClaimed = result.rewardItemId === 'silk-banner-mentor-seal';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.dojo_ladder') {
    const result = resolveSpiritDojoLadder(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        clearedOpponentIds: Array.isArray(payload.clearedOpponentIds) ? payload.clearedOpponentIds.map(String) : state.dojoLadderOpponentIds,
        sparLadderWins: Number(payload.sparLadderWins ?? state.sparLadderWins ?? 0),
        sparLadderXp: Number(payload.sparLadderXp ?? state.sparLadderXp ?? 0),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        techniqueCodexId: String(payload.techniqueCodexId || state.techniqueCodexId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        teamSparMatchId: String(payload.teamSparMatchId || state.teamSparMatchId || ''),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.ladderId || SPIRIT_DOJO_LADDERS[0].id)
    );
    if (result.cleared) {
      state.dojoLadderProof = true;
      state.dojoLadderId = result.ladderId;
      state.dojoLadderName = result.ladderName;
      state.dojoLadderScore = result.score;
      state.dojoLadderRequiredScore = result.requiredScore;
      state.dojoLadderPartyIds = result.partyIds;
      state.dojoLadderOpponentIds = result.clearedOpponentIds;
      state.dojoLadderSealClaimed = result.rewardItemId === 'jade-dojo-ladder-seal';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.sparLadderWins = Math.max(state.sparLadderWins, SPIRIT_DOJO_LADDERS[0].requiredSparWins);
      state.sparLadderXp = Math.max(state.sparLadderXp, SPIRIT_DOJO_LADDERS[0].requiredSparLadderXp);
      state.trainingXp = Math.max(state.trainingXp, SPIRIT_DOJO_LADDERS[0].requiredTrainingXp);
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.sifu_council') {
    const result = resolveSpiritSifuCouncil(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        clearedCouncilMemberIds: Array.isArray(payload.clearedCouncilMemberIds) ? payload.clearedCouncilMemberIds.map(String) : state.sifuCouncilMemberIds,
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        dojoLadderId: String(payload.dojoLadderId || state.dojoLadderId || ''),
        dojoLadderScore: Number(payload.dojoLadderScore ?? state.dojoLadderScore ?? 0),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        tournamentId: String(payload.tournamentId || state.tournamentId || ''),
        tournamentScore: Number(payload.tournamentScore ?? state.tournamentScore ?? 0),
        rivalCircleProof: Boolean(payload.rivalCircleProof ?? state.rivalCircleProof),
        rivalCircleId: String(payload.rivalCircleId || state.rivalCircleId || ''),
        rivalCircleScore: Number(payload.rivalCircleScore ?? state.rivalCircleScore ?? 0),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        techniqueCodexId: String(payload.techniqueCodexId || state.techniqueCodexId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.councilId || SPIRIT_SIFU_COUNCILS[0].id)
    );
    if (result.cleared) {
      state.sifuCouncilProof = true;
      state.sifuCouncilId = result.councilId;
      state.sifuCouncilName = result.councilName;
      state.sifuCouncilScore = result.score;
      state.sifuCouncilRequiredScore = result.requiredScore;
      state.sifuCouncilPartyIds = result.partyIds;
      state.sifuCouncilMemberIds = result.clearedCouncilMemberIds;
      state.sifuCouncilCrestClaimed = result.rewardItemId === 'jade-sifu-council-crest';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.summit_circuit') {
    const result = resolveSpiritSummitCircuit(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        summitSealIds: Array.isArray(payload.summitSealIds) ? payload.summitSealIds.map(String) : state.summitCircuitSealIds,
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        dojoLadderId: String(payload.dojoLadderId || state.dojoLadderId || ''),
        dojoLadderScore: Number(payload.dojoLadderScore ?? state.dojoLadderScore ?? 0),
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        tournamentId: String(payload.tournamentId || state.tournamentId || ''),
        tournamentScore: Number(payload.tournamentScore ?? state.tournamentScore ?? 0),
        rivalCircleProof: Boolean(payload.rivalCircleProof ?? state.rivalCircleProof),
        rivalCircleId: String(payload.rivalCircleId || state.rivalCircleId || ''),
        rivalCircleScore: Number(payload.rivalCircleScore ?? state.rivalCircleScore ?? 0),
        sifuCouncilProof: Boolean(payload.sifuCouncilProof ?? state.sifuCouncilProof),
        sifuCouncilId: String(payload.sifuCouncilId || state.sifuCouncilId || ''),
        sifuCouncilScore: Number(payload.sifuCouncilScore ?? state.sifuCouncilScore ?? 0),
        techniqueCodexProof: Boolean(payload.techniqueCodexProof ?? state.techniqueCodexProof),
        techniqueCodexId: String(payload.techniqueCodexId || state.techniqueCodexId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        affinityMatrixId: String(payload.affinityMatrixId || state.affinityMatrixId || ''),
        relicAttunementProof: Boolean(payload.relicAttunementProof ?? state.relicAttunementProof),
        relicAttunementId: String(payload.relicAttunementId || state.relicAttunementId || ''),
        harmonyFormProof: Boolean(payload.harmonyFormProof ?? state.harmonyFormProof),
        harmonyFormId: String(payload.harmonyFormId || state.harmonyFormId || ''),
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        harmonyTrialId: String(payload.harmonyTrialId || state.harmonyTrialId || ''),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        teamSparMatchId: String(payload.teamSparMatchId || state.teamSparMatchId || ''),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.circuitId || SPIRIT_SUMMIT_CIRCUITS[0].id)
    );
    if (result.cleared) {
      state.summitCircuitProof = true;
      state.summitCircuitId = result.circuitId;
      state.summitCircuitName = result.circuitName;
      state.summitCircuitScore = result.score;
      state.summitCircuitRequiredScore = result.requiredScore;
      state.summitCircuitPartyIds = result.partyIds;
      state.summitCircuitSealIds = result.summitSealIds;
      state.summitCircuitLaurelClaimed = result.rewardItemId === 'jade-summit-circuit-laurel';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.tournament_bracket') {
    const result = resolveSpiritTournamentBracket(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        dojoLadderId: String(payload.dojoLadderId || state.dojoLadderId || ''),
        dojoLadderScore: Number(payload.dojoLadderScore ?? state.dojoLadderScore ?? 0),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        mentorChallengeScore: Number(payload.mentorChallengeScore ?? state.mentorChallengeScore ?? 0),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        teamSparMatchId: String(payload.teamSparMatchId || state.teamSparMatchId || ''),
        teamSparMatchScore: Number(payload.teamSparMatchScore ?? state.teamSparMatchScore ?? 0),
        harmonyTrialProof: Boolean(payload.harmonyTrialProof ?? state.harmonyTrialProof),
        harmonyTrialId: String(payload.harmonyTrialId || state.harmonyTrialId || ''),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        routePatrolProof: Boolean(payload.routePatrolProof ?? state.routePatrolProof),
        nurtureRiteProof: Boolean(payload.nurtureRiteProof ?? state.nurtureRiteProof),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.bracketId || SPIRIT_TOURNAMENT_BRACKETS[0].id)
    );
    if (result.cleared) {
      state.tournamentProof = true;
      state.tournamentId = result.bracketId;
      state.tournamentName = result.bracketName;
      state.tournamentScore = result.score;
      state.tournamentRequiredScore = result.requiredScore;
      state.tournamentPartyIds = result.partyIds;
      state.tournamentPresenceCount = result.localPresenceCount;
      state.tournamentPennantClaimed = result.rewardItemId === 'jade-banner-tournament-pennant';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.rival_circle') {
    const result = resolveSpiritRivalCircle(
      {
        partyIds: Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds,
        tournamentProof: Boolean(payload.tournamentProof ?? state.tournamentProof),
        tournamentId: String(payload.tournamentId || state.tournamentId || ''),
        tournamentScore: Number(payload.tournamentScore ?? state.tournamentScore ?? 0),
        dojoLadderProof: Boolean(payload.dojoLadderProof ?? state.dojoLadderProof),
        dojoLadderId: String(payload.dojoLadderId || state.dojoLadderId || ''),
        dojoLadderScore: Number(payload.dojoLadderScore ?? state.dojoLadderScore ?? 0),
        mentorChallengeProof: Boolean(payload.mentorChallengeProof ?? state.mentorChallengeProof),
        mentorChallengeId: String(payload.mentorChallengeId || state.mentorChallengeId || ''),
        mentorChallengeScore: Number(payload.mentorChallengeScore ?? state.mentorChallengeScore ?? 0),
        teamSparMatchProof: Boolean(payload.teamSparMatchProof ?? state.teamSparMatchProof),
        teamSparMatchId: String(payload.teamSparMatchId || state.teamSparMatchId || ''),
        teamSparMatchScore: Number(payload.teamSparMatchScore ?? state.teamSparMatchScore ?? 0),
        battleRoundProof: Boolean(payload.battleRoundProof ?? state.battleRoundProof),
        battleRoundVictory: Boolean(payload.battleRoundVictory ?? state.battleRoundVictory),
        battleRoundFocusScore: Number(payload.battleRoundFocusScore ?? state.battleRoundFocusScore ?? 0),
        battleRoundOpponentScore: Number(payload.battleRoundOpponentScore ?? state.battleRoundOpponentScore ?? 0),
        conditionWeaveProof: Boolean(payload.conditionWeaveProof ?? state.conditionWeaveProof),
        conditionWeaveId: String(payload.conditionWeaveId || state.conditionWeaveId || ''),
        affinityMatrixProof: Boolean(payload.affinityMatrixProof ?? state.affinityMatrixProof),
        techniqueLoadoutProof: Boolean(payload.techniqueLoadoutProof ?? state.techniqueLoadoutProof),
        traitAttunementProof: Boolean(payload.traitAttunementProof ?? state.traitAttunementProof),
        guildRankProof: Boolean(payload.guildRankProof ?? state.guildRankProof),
        growthRiteProof: Boolean(payload.growthRiteProof ?? state.growthRiteProof),
        localPresenceCount: Number(payload.localPresenceCount ?? state.rallyPresenceCount ?? 1),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat
      },
      String(payload.circleId || SPIRIT_RIVAL_CIRCLES[0].id)
    );
    if (result.cleared) {
      state.rivalCircleProof = true;
      state.rivalCircleId = result.circleId;
      state.rivalCircleName = result.circleName;
      state.rivalCircleRivalName = result.rivalName;
      state.rivalCircleScore = result.score;
      state.rivalCircleRequiredScore = result.requiredScore;
      state.rivalCirclePartyIds = result.partyIds;
      state.rivalCircleMarkClaimed = result.rewardItemId === 'jade-rival-circle-mark';
      state.partyIds = result.partyIds;
      state.supportSpiritIds = result.partyIds.slice(1);
      state.activePartyId = result.partyIds[0];
      state.spiritId = result.partyIds[0] || state.spiritId;
      state.rallyPresenceCount = Math.max(state.rallyPresenceCount, result.localPresenceCount);
    }
    state.chat.push(result.message);
  }

  if (type === 'battle.spar_ladder') {
    const requestedParty = Array.isArray(payload.partyIds) ? payload.partyIds.map(String) : state.partyIds.length ? state.partyIds : state.attunedSpiritIds;
    const priorWins = Number(payload.priorWins || state.sparLadderWins || 0);
    const bondBySpiritId = Object.fromEntries(requestedParty.map((spiritId) => [spiritId, Math.max(1, getSpiritBond(state, spiritId))]));
    const result = resolveSpiritSparLadder(requestedParty, String(payload.opponentId || 'jade-echo-apprentice'), bondBySpiritId, priorWins);
    const battleRound = resolveSpiritBattleRound({
      partyIds: requestedParty,
      activeSpiritId: state.spiritId || requestedParty[0],
      bondBySpiritId,
      opponentId: result.opponentId,
      tacticProof: state.tacticProof,
      harmonyFormProof: state.harmonyFormProof,
      priorWins
    });
    if (result.ok) {
      state.partyIds = result.partyIds;
      state.activePartyId = result.partyIds[0];
      state.supportSpiritIds = result.partyIds.slice(1);
      state.sparLadderXp += result.trainingXp;
      state.lastSparOpponentId = result.opponentId;
      if (result.victory) {
        state.sparLadderWins += 1;
        for (const spiritId of result.partyIds) {
          const nextBond = Math.min(5, Math.max(1, getSpiritBond(state, spiritId)) + result.bondDelta);
          setSpiritProgress(state, spiritId, nextBond, growthStageFromBond(nextBond));
        }
        focusSpirit(state, state.spiritId || result.partyIds[0]);
      }
    }
    state.chat.push(result.message);
    applyBattleRoundState(state, battleRound);
  }

  if (type === 'spirit.train') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const moveId = String(payload.moveId || spirit.battle.moves[0].id);
    const priorBond = Number(payload.bond || getSpiritBond(state, spirit.id) || state.bond || 1);
    const result = resolveSpiritTrainingBattle(spirit.id, moveId, priorBond, Number(payload.round || 1));
    const battleParty = state.partyIds.length ? state.partyIds : [spirit.id];
    const battleRound = resolveSpiritBattleRound({
      partyIds: battleParty,
      activeSpiritId: spirit.id,
      moveIdBySpiritId: { [spirit.id]: moveId },
      bondBySpiritId: Object.fromEntries(battleParty.map((partySpiritId) => [partySpiritId, partySpiritId === spirit.id ? priorBond : Math.max(1, getSpiritBond(state, partySpiritId))])),
      opponentId: state.lastSparOpponentId || 'jade-echo-apprentice',
      tacticProof: state.tacticProof,
      harmonyFormProof: state.harmonyFormProof,
      priorWins: state.sparLadderWins
    });
    state.spiritId = spirit.id;
    if (!state.attunedSpiritIds.includes(spirit.id)) {
      state.attunedSpiritIds.push(spirit.id);
    }
    state.trainingXp += result.trainingXp;
    if (result.victory) {
      state.trainingVictories += 1;
      const nextBond = Math.min(5, Math.max(1, getSpiritBond(state, spirit.id)) + result.bondDelta);
      setSpiritProgress(state, spirit.id, nextBond, growthStageFromBond(nextBond));
      focusSpirit(state, spirit.id);
    }
    state.chat.push(result.message);
    applyBattleRoundState(state, battleRound);
  }

  if (type === 'spirit.raise') {
    const spiritId = String(payload.spiritId || state.spiritId || 'lirabao');
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId) || MOCHI_SPIRITS[0];
    const careStreak = Number(payload.careStreak ?? state.careStreakBySpiritId[spirit.id] ?? state.raisingCareStreak ?? 0);
    const need = selectSpiritRaisingNeed(spirit.id, careStreak) || spirit.raisingNeeds[0];
    const needId = String(payload.needId || need.id);
    const result = resolveSpiritRaisingAction(spirit.id, needId, Number(payload.currentBond || getSpiritBond(state, spirit.id) || state.bond || 1), careStreak);
    state.spiritId = spirit.id;
    if (!state.attunedSpiritIds.includes(spirit.id)) {
      state.attunedSpiritIds.push(spirit.id);
    }
    if (result.ok) {
      state.raisingProof = true;
      state.raisingCareStreak = Math.max(state.raisingCareStreak, result.careStreak);
      state.lastRaisingNeedId = result.needId;
      state.nextRaisingNeedId = result.nextNeedId;
      state.lastRaisingMilestoneId = result.milestoneId;
      state.raisingMilestoneLabel = result.milestoneLabel || state.raisingMilestoneLabel;
      state.nextRaisingMilestoneId = result.nextMilestoneId;
      state.nextRaisingMilestoneLabel = result.nextMilestoneLabel;
      state.careStreakBySpiritId[spirit.id] = Math.max(state.careStreakBySpiritId[spirit.id] || 0, result.careStreak);
      setSpiritProgress(state, spirit.id, Math.max(getSpiritBond(state, spirit.id), result.bond), result.growth);
      focusSpirit(state, spirit.id);
    }
    state.chat.push(result.message);
  }

  if (type === 'quest.accept') {
    const questId = String(payload.questId || selectHudQuest(state).id);
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === questId) || selectHudQuest(state);
    state.activeQuestId = quest.id;
    state.acceptedQuestIds = Array.from(new Set([...state.acceptedQuestIds, quest.id]));
    state.completedQuestSteps = state.questStepsById[quest.id] || [];
    state.chat.push(`Quest accepted: ${quest.title}. ${quest.summary}`);
  }

  if (type === 'quest.progress') {
    const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === String(payload.questId || state.activeQuestId)) || selectHudQuest(state);
    const completedSteps = state.questStepsById[quest.id] || [];
    const stepId = String(payload.stepId || quest.steps[completedSteps.length] || quest.steps[quest.steps.length - 1]);
    const result = resolveMochiSpiritQuestProgress(quest.id, stepId, {
      roster: state.attunedSpiritIds,
      activeQuestId: state.activeQuestId,
      completedQuestIds: state.completedQuestIds,
      questStepsById: state.questStepsById
    });
    state.activeQuestId = result.nextQuestId && result.completed ? result.nextQuestId : result.questId;
    state.questStepsById = {
      ...state.questStepsById,
      [result.questId]: result.completedSteps
    };
    state.completedQuestSteps = state.questStepsById[state.activeQuestId] || result.completedSteps;
    state.completedQuestIds = result.completedQuestIds;
    state.questChainProof = result.chainComplete;
    if (result.completed && result.rewardBond > 0) {
      const activeSpiritId = state.spiritId || state.attunedSpiritIds[0] || 'lirabao';
      const nextBond = Math.min(5, Math.max(getSpiritBond(state, activeSpiritId), state.bond, 1) + result.rewardBond);
      setSpiritProgress(state, activeSpiritId, nextBond, growthStageFromBond(nextBond));
      focusSpirit(state, activeSpiritId);
      state.chat.push(`Quest complete: ${result.title}. Reward recorded as no-real-value alpha progress.`);
    } else {
      state.chat.push(result.message);
    }
    if (result.completed && result.nextQuestId) {
      const nextQuest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === result.nextQuestId);
      if (nextQuest) {
        state.chat.push(`Quest posted: ${nextQuest.title}.`);
      }
    }
    if (result.chainComplete) {
      state.chat.push('Quest chain complete: first Mochirii guild postings finished for closed-alpha testing.');
    }
  }

  if (type === 'guild.rank_trial') {
    const result = resolveGuildRankTrial(
      {
        roster: Array.isArray(payload.roster) ? payload.roster.map(String) : state.attunedSpiritIds,
        activeSpiritId: String(payload.activeSpiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bond: Number(payload.bond || state.bond || 1),
        completedQuestSteps: Array.isArray(payload.completedQuestSteps) ? payload.completedQuestSteps.map(String) : state.completedQuestSteps,
        tacticProof: Boolean(payload.tacticProof ?? state.tacticProof),
        affinityWins: Number(payload.affinityWins ?? state.affinityTrialWins ?? 0),
        sparWins: Number(payload.sparWins ?? state.sparLadderWins ?? 0),
        journalDiscoveredCount: Number(payload.journalDiscoveredCount ?? state.journalDiscoveredCount ?? 0),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof)
      },
      String(payload.trialId || GUILD_RANK_TRIALS[0].id)
    );
    if (result.passed) {
      state.guildRankProof = true;
      state.guildRankId = result.trialId;
      state.guildRankTitle = result.rankTitle;
      state.guildRankScore = result.score;
      state.guildRankSealClaimed = result.rewardItemId === 'jade-court-rank-seal';
    }
    state.chat.push(result.message);
  }

  if (type === 'spirit.growth_rite') {
    const result = resolveSpiritGrowthRite(
      {
        spiritId: String(payload.spiritId || state.spiritId || state.attunedSpiritIds[0] || ''),
        bond: Number(payload.bond || getSpiritBond(state, String(payload.spiritId || state.spiritId || state.attunedSpiritIds[0] || '')) || state.bond || 1),
        growth: String(payload.growth || getSpiritGrowth(state, String(payload.spiritId || state.spiritId || state.attunedSpiritIds[0] || '')) || state.growth || 'seed'),
        trainingXp: Number(payload.trainingXp ?? state.trainingXp ?? 0),
        raisingProof: Boolean(payload.raisingProof ?? state.raisingProof),
        rankTrialProof: Boolean(payload.rankTrialProof ?? state.guildRankProof),
        rankTrialId: String(payload.rankTrialId || state.guildRankId || '')
      },
      String(payload.riteId || SPIRIT_GROWTH_RITES[0].id)
    );
    if (result.passed) {
      state.growthRiteProof = true;
      state.growthRiteId = result.riteId;
      state.growthForm = result.formTitle;
      state.growthSigilClaimed = result.rewardItemId === 'moonwell-bloom-sigil';
      state.spiritId = result.spiritId;
      setSpiritProgress(state, result.spiritId, Math.max(getSpiritBond(state, result.spiritId), result.bond), result.growth);
      focusSpirit(state, result.spiritId);
    }
    state.chat.push(result.message);
  }

  if (type === 'emote.send') {
    state.emoteProof = true;
    state.chat.push('You wave from the town square.');
  }

  if (type === 'market.fixed_list') {
    state.charmListed = true;
    state.chat.push('Jade Thread Charm listed for test soft currency. No real value.');
  }

  if (type === 'market.guild_receipt') {
    const result = resolveMarketGuildReceipt(
      {
        itemId: String(payload.itemId || 'jade-thread-charm'),
        quantity: Number(payload.quantity ?? 1),
        currency: String(payload.currency || 'guild-seals'),
        price: Number(payload.price ?? 5),
        marketProof: Boolean(payload.marketProof ?? state.charmListed),
        profileViewed: Boolean(payload.profileViewed ?? state.profileViewed),
        guildBuddyProof: Boolean(payload.guildBuddyProof ?? state.guildBuddyProof),
        statusMood: String(payload.statusMood || state.statusMood || ''),
        chatLines: Array.isArray(payload.chatLines) ? payload.chatLines.map(String) : state.chat,
        noRealValue: Boolean(payload.noRealValue ?? true)
      },
      String(payload.receiptId || MARKET_GUILD_RECEIPTS[0].id)
    );
    if (result.purchased) {
      state.marketReceiptProof = true;
      state.marketReceiptId = result.receiptId;
      state.marketReceiptName = result.receiptName;
      state.marketReceiptItemId = result.itemId;
      state.marketReceiptQuantity = result.quantity;
      state.marketReceiptPrice = result.price;
      state.marketReceiptCurrency = result.currency;
      state.marketReceiptScore = result.score;
      state.marketReceiptRequiredScore = result.requiredScore;
      state.marketReceiptClaimed = result.rewardItemId === 'jade-market-receipt';
    }
    state.chat.push(result.message);
  }

  if (type === 'trade.direct_offer') {
    state.tradeProof = true;
    state.chat.push('Direct trade proof recorded for alpha testing. No real value.');
  }

  if (type === 'chain.withdraw_request') {
    state.canaryRequested = true;
    state.chat.push('Canary certificate request staged as preview stub. No real value.');
  }

  if (type === 'chain.deposit_request') {
    if (state.canaryRequested || payload.priorRequestStaged === true) {
      state.canaryReturnRequested = true;
      state.chat.push('Jade Vault Return Proof staged as preview stub. No inventory credit unless a future Canary operation reaches FINALIZED. No real value.');
    } else {
      state.chat.push('Stage the Canary certificate request before the Jade Vault Return Proof. No real value.');
    }
  }

  if (type === 'chain.operation_update') {
    const rawState = String(payload.transactionState || 'PENDING').trim().toUpperCase();
    const operationState = ['PENDING', 'BROADCAST', 'FINALIZED', 'FAILED', 'ABANDONED', 'TIMEOUT'].includes(rawState)
      ? rawState
      : 'PENDING';
    const authoritativeFinalized = operationState === 'FINALIZED' && payload.previewStub !== true && Boolean(payload.enjinTransactionUuid);
    state.canaryOperationReviewProof = true;
    state.canaryOperationRequestId = String(payload.chainRequestId || 'lirabao-canary-certificate-preview');
    state.canaryOperationState = operationState;
    state.canaryOperationFinalized = authoritativeFinalized;
    state.canaryInventoryCredited = false;
    state.canaryOperationItemId = String(payload.itemId || 'lirabao-canary-certificate');
    state.chat.push(
      authoritativeFinalized
        ? 'Canary finality review recorded FINALIZED operator evidence, but this alpha HUD still records no inventory credit locally. No real value.'
        : `Canary finality review recorded ${operationState} preview-stub status. No inventory credit before FINALIZED. No real value.`
    );
  }

  if (type === 'chat.send') {
    state.chat.push(`You: ${String(payload.message || '').slice(0, 120)}`);
  }

  writeAlphaState(state);

  try {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch('/integration/alpha/action', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requestId,
        type,
        payload: {
          ...payload,
          state,
          alpha: ALPHA_FEATURES.alpha
        }
      })
    });
    const body = (await response.json().catch(() => null)) as AlphaActionResponse | null;
    applyAuthoritativeAlphaProgress(alphaProgressFromResponse(body));
    const chainMessage = type.startsWith('chain.') && body?.chainRuntime?.mode === 'configured-preview-stub'
      ? body.chainRuntime.message
      : null;
    if (chainMessage) {
      const nextState = readAlphaState();
      nextState.chat.push(chainMessage);
      writeAlphaState(nextState);
    }
    if ((!response.ok || body?.ok === false) && accessToken) {
      const nextState = readAlphaState();
      appendUniqueAlphaChat(nextState, body?.message || 'Account progress sync failed. The local HUD update remains preview-only until the next successful save.');
      writeAlphaState(nextState, {
        preserveSyncMetadata: true
      });
      postToParent(BRIDGE_EVENTS.error, { message: 'Mochi Social account progress could not sync.' });
    }
  } catch {
    if (localStorage.getItem(TOKEN_KEY)) {
      const nextState = readAlphaState();
      appendUniqueAlphaChat(nextState, 'Account progress sync failed. The local HUD update remains preview-only until the next successful save.');
      writeAlphaState(nextState, {
        preserveSyncMetadata: true
      });
      postToParent(BRIDGE_EVENTS.error, { message: 'Mochi Social account progress could not sync.' });
    }
  }
}
