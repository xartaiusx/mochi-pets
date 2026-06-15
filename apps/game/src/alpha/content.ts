export type SpiritHabitat = 'Jade Lantern Court';

export type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

export type SpiritBattleRole = 'guardian' | 'trickster' | 'scout';

export type SpiritBattleStance = 'anchor' | 'feint' | 'ward';

export type SpiritEncounterRarity = 'common' | 'uncommon' | 'rare';

export type SpiritTechniqueMasteryLevel = 'novice' | 'practiced' | 'adept';

export interface SpiritJournalEntry {
  title: string;
  summary: string;
  unlockHint: string;
}

export interface SpiritCareAction {
  id: string;
  label: string;
  bondDelta: number;
  source: string;
}

export interface SpiritAttunementProfile {
  id: string;
  label: string;
  lureItemId: string;
  socialPrompt: string;
}

export interface SpiritCaptureProfile {
  encounterId: string;
  invitationLabel: string;
  lureItemId: string;
  harmonyRequired: number;
  rarity: SpiritEncounterRarity;
  habitatNote: string;
}

export interface SpiritBattleMove {
  id: string;
  label: string;
  affinity: string;
  power: number;
  focusCost: number;
  effectSummary: string;
}

export interface SpiritTrainingProfile {
  role: SpiritBattleRole;
  baseFocus: number;
  moves: SpiritBattleMove[];
}

export interface SpiritRaisingNeed {
  id: string;
  label: string;
  bondDelta: number;
  source: string;
  growthHint: string;
}

export interface SpiritBondMilestone {
  id: string;
  label: string;
  requiredBond: number;
  requiredGrowth: SpiritGrowthStage;
  summary: string;
  roleplayPrompt: string;
}

export interface MochiSpirit {
  id: string;
  name: string;
  title: string;
  sprite: string;
  affinity: string;
  habitat: SpiritHabitat;
  temperament: string;
  guildRelation: string;
  certificateEligible: boolean;
  attunement: SpiritAttunementProfile;
  capture: SpiritCaptureProfile;
  battle: SpiritTrainingProfile;
  journal: SpiritJournalEntry;
  careActions: SpiritCareAction[];
  raisingNeeds: SpiritRaisingNeed[];
  bondMilestones: readonly SpiritBondMilestone[];
}

export interface MochiSpiritQuest {
  id: string;
  title: string;
  zone: SpiritHabitat;
  summary: string;
  requiredSpiritId?: string;
  steps: string[];
  rewardItemId?: string;
  rewardBond: number;
}

export interface MochiSpiritQuestProgress {
  roster: readonly string[];
  activeQuestId?: string;
  completedQuestIds?: readonly string[];
  questStepsById?: Record<string, readonly string[]>;
}

export interface MochiSpiritQuestProgressResult {
  ok: boolean;
  questId: string;
  title: string;
  completedSteps: string[];
  completedQuestIds: string[];
  completed: boolean;
  chainComplete: boolean;
  nextQuestId?: string;
  rewardItemId?: string;
  rewardBond: number;
  message: string;
  source: string;
}

export interface GuildRankTrial {
  id: string;
  title: string;
  rankTitle: string;
  requiredSpiritCount: number;
  requiredQuestStepCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildRankTrialProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  bond: number;
  completedQuestSteps: readonly string[];
  tacticProof: boolean;
  affinityWins: number;
  sparWins: number;
  journalDiscoveredCount: number;
  guildBuddyProof?: boolean;
}

export interface GuildRankTrialResult {
  ok: boolean;
  passed: boolean;
  trialId: string;
  trialTitle: string;
  rankTitle: string;
  score: number;
  requiredScore: number;
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritGrowthRite {
  id: string;
  name: string;
  formTitle: string;
  requiredGrowth: SpiritGrowthStage;
  requiredBond: number;
  requiredTrainingXp: number;
  requiredRankTrialId: string;
  rewardItemId: string;
  summary: string;
}

export interface SpiritGrowthRiteProgress {
  spiritId?: string;
  bond: number;
  growth: SpiritGrowthStage | string;
  trainingXp: number;
  raisingProof: boolean;
  rankTrialProof: boolean;
  rankTrialId?: string;
}

export interface SpiritGrowthRiteResult {
  ok: boolean;
  passed: boolean;
  riteId: string;
  riteName: string;
  spiritId: string;
  spiritName: string;
  formTitle: string;
  bond: number;
  growth: SpiritGrowthStage;
  trainingXp: number;
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritExpeditionRoute {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredHarmony: number;
  encounterSpiritId: string;
  recommendedItemId: string;
  rewardItemId: string;
  routeNote: string;
}

export interface SpiritExpeditionResult {
  ok: boolean;
  routeId: string;
  routeName: string;
  encounterSpiritId: string;
  recommendedItemId: string;
  rewardItemId: string;
  harmonyScore: number;
  discoveredRoutes: string[];
  message: string;
  source: string;
}

export interface SpiritRouteMastery {
  id: string;
  title: string;
  requiredRouteIds: readonly string[];
  requiredSpiritCount: number;
  requiredJournalCount: number;
  requiredQuestIds: readonly string[];
  requiredRankTrialId: string;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRouteMasteryProgress {
  discoveredRoutes: readonly string[];
  roster: readonly string[];
  journalDiscoveredCount: number;
  completedQuestIds: readonly string[];
  guildRankProof: boolean;
  rankTrialId?: string;
}

export interface SpiritRouteMasteryResult {
  ok: boolean;
  mastered: boolean;
  masteryId: string;
  title: string;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRoutePatrol {
  id: string;
  name: string;
  title: string;
  routeId: string;
  requiredMasteryId: string;
  requiredFieldAccordId: string;
  requiredPartySize: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  patrolNote: string;
}

export interface SpiritRoutePatrolProgress {
  routeId?: string;
  partyIds: readonly string[];
  localPresenceCount: number;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore?: number;
  battleRoundOpponentScore?: number;
  harmonyFormProof?: boolean;
  teamSparMatchProof?: boolean;
  mentorChallengeProof?: boolean;
  chatLines?: readonly string[];
}

export interface SpiritRoutePatrolResult {
  ok: boolean;
  patrolled: boolean;
  patrolId: string;
  patrolName: string;
  title: string;
  routeId: string;
  routeName: string;
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRouteInvitationResult {
  ok: boolean;
  alreadyRostered: boolean;
  routeId: string;
  routeName: string;
  spiritId: string;
  offeredItemId: string;
  requiredItemId: string;
  harmonyRequired: number;
  harmonyScore: number;
  roster: string[];
  bond: number;
  growth: SpiritGrowthStage;
  message: string;
  source: string;
}

export interface SpiritFieldAccord {
  id: string;
  name: string;
  title: string;
  routeId: string;
  targetSpiritId: string;
  requiredHarmony: number;
  requiredRosterCount: number;
  requiredScore: number;
  rewardItemId: string;
  accordNote: string;
}

export interface SpiritFieldAccordProgress {
  routeId?: string;
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  harmonyScore: number;
  bondBySpiritId?: Record<string, number>;
  tacticProof?: boolean;
  affinityProof?: boolean;
  journalDiscoveredCount?: number;
}

export interface SpiritFieldAccordResult {
  ok: boolean;
  cleared: boolean;
  accordId: string;
  accordName: string;
  title: string;
  routeId: string;
  routeName: string;
  targetSpiritId: string;
  spiritName: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  harmonyScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritHabitatBond {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredJournalCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritHabitatBondProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  careProof: boolean;
  bond: number;
  growth?: SpiritGrowthStage | string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
}

export interface SpiritHabitatBondResult {
  ok: boolean;
  bonded: boolean;
  bondId: string;
  bondName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritSanctuaryRite {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredCareStreak: number;
  requiredTrainingXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritSanctuaryRiteProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  careStreak: number;
  trainingXp: number;
  habitatBondProof: boolean;
  conditionWeaveProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
}

export interface SpiritSanctuaryRiteResult {
  ok: boolean;
  restored: boolean;
  riteId: string;
  riteName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  partyIds: string[];
  totalBond: number;
  careStreak: number;
  trainingXp: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritResearchFolio {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredJournalCount: number;
  requiredHabitatBondId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritResearchFolioProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  journalDiscoveredCount: number;
  habitatBondProof: boolean;
  habitatBondId?: string;
  techniqueProof: boolean;
  tacticProof: boolean;
  affinityProof: boolean;
  trainingXp: number;
}

export interface SpiritResearchFolioResult {
  ok: boolean;
  recorded: boolean;
  folioId: string;
  folioName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  discoveredRoutes: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritCompendiumCompletion {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredJournalCount: number;
  requiredHabitatBondId: string;
  requiredResearchFolioId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritCompendiumProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  journalDiscoveredCount: number;
  habitatBondProof: boolean;
  habitatBondId?: string;
  researchProof: boolean;
  researchFolioId?: string;
  routeMasteryProof: boolean;
}

export interface SpiritCompendiumResult {
  ok: boolean;
  completed: boolean;
  compendiumId: string;
  compendiumName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  discoveredRoutes: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRosterArchive {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredPartySize: number;
  requiredReserveCount: number;
  requiredJournalCount: number;
  requiredCompendiumId: string;
  requiredSanctuaryRiteId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRosterArchiveProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  compendiumProof: boolean;
  compendiumId?: string;
  sanctuaryRiteProof: boolean;
  sanctuaryRiteId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
}

export interface SpiritRosterArchiveResult {
  ok: boolean;
  archived: boolean;
  archiveId: string;
  archiveName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  partyIds: string[];
  reserveSpiritIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRosterCabinet {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredPartySize: number;
  requiredStorageSlots: number;
  requiredArchiveId: string;
  requiredCompendiumId: string;
  requiredNurseryGroveId: string;
  requiredLineageRegisterId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRosterCabinetProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  storageSlotLabels: readonly string[];
  activeSpiritId?: string;
  rosterArchiveProof: boolean;
  rosterArchiveId?: string;
  compendiumProof: boolean;
  compendiumId?: string;
  nurseryGroveProof: boolean;
  nurseryGroveId?: string;
  lineageRegisterProof: boolean;
  lineageRegisterId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRosterCabinetResult {
  ok: boolean;
  organized: boolean;
  cabinetId: string;
  cabinetName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  partyIds: string[];
  reserveSpiritIds: string[];
  storageSlotLabels: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritProvisionSatchel {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  stockItemIds: readonly string[];
  requiredRosterCount: number;
  requiredJournalCount: number;
  requiredCareStreak: number;
  requiredCompletedQuestCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritProvisionSatchelProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  marketProof: boolean;
  marketReceiptProof: boolean;
  tradeProof: boolean;
  routeInviteProof: boolean;
  careStreak: number;
  completedQuestIds: readonly string[];
}

export interface SpiritProvisionSatchelResult {
  ok: boolean;
  stocked: boolean;
  satchelId: string;
  satchelName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  stockItemIds: string[];
  completedQuestIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritProvisionCatalog {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredStockItemIds: readonly string[];
  requiredCareItemIds: readonly string[];
  requiredRouteItemIds: readonly string[];
  requiredProvisionSatchelId: string;
  requiredMarketReceiptId: string;
  requiredCraftWritId: string;
  requiredRecoveryTeaId: string;
  requiredCareCycleId: string;
  requiredHabitatCensusId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritProvisionCatalogProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  stockItemIds: readonly string[];
  careItemIds: readonly string[];
  routeItemIds: readonly string[];
  provisionProof: boolean;
  provisionSatchelId?: string;
  marketReceiptProof: boolean;
  marketReceiptId?: string;
  tradeProof: boolean;
  craftWritProof: boolean;
  craftWritId?: string;
  recoveryTeaProof: boolean;
  recoveryTeaId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  habitatCensusProof: boolean;
  habitatCensusId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritProvisionCatalogResult {
  ok: boolean;
  cataloged: boolean;
  catalogId: string;
  catalogName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  itemIds: string[];
  careItemIds: string[];
  routeItemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritBattleKit {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredPartySize: number;
  requiredItemIds: readonly string[];
  requiredProvisionCatalogId: string;
  requiredTechniqueCodexId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredRecoveryTeaId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritBattleKitProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  activeSpiritId?: string;
  itemIds: readonly string[];
  provisionCatalogProof: boolean;
  provisionCatalogId?: string;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  recoveryTeaProof: boolean;
  recoveryTeaId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore?: number;
  battleRoundOpponentScore?: number;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritBattleKitResult {
  ok: boolean;
  prepared: boolean;
  kitId: string;
  kitName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  itemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRemedyPouch {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredPartySize: number;
  requiredConditionIds: readonly string[];
  requiredItemIds: readonly string[];
  requiredRecoveryTeaId: string;
  requiredBattleKitId: string;
  requiredCareCycleId: string;
  requiredSanctuaryRiteId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRemedyPouchProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  activeSpiritId?: string;
  conditionIds: readonly string[];
  itemIds: readonly string[];
  recoveryTeaProof: boolean;
  recoveryTeaId?: string;
  battleKitProof: boolean;
  battleKitId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  sanctuaryRiteProof: boolean;
  sanctuaryRiteId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRemedyPouchResult {
  ok: boolean;
  prepared: boolean;
  pouchId: string;
  pouchName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  conditionIds: string[];
  itemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritCareCycle {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredBondPerSpirit: number;
  requiredCareStreak: number;
  requiredTrainingXp: number;
  requiredRosterArchiveId: string;
  requiredProvisionSatchelId: string;
  requiredSanctuaryRiteId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritCareCycleProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  careStreak: number;
  trainingXp: number;
  raisingProof: boolean;
  raisingMilestoneLabel?: string;
  rosterArchiveProof: boolean;
  rosterArchiveId?: string;
  provisionProof: boolean;
  provisionSatchelId?: string;
  sanctuaryRiteProof: boolean;
  sanctuaryRiteId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
}

export interface SpiritCareCycleResult {
  ok: boolean;
  cycled: boolean;
  cycleId: string;
  cycleName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  caredSpiritIds: string[];
  totalBond: number;
  careStreak: number;
  trainingXp: number;
  raisingMilestoneLabel?: string;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTemperamentConcord {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredTemperaments: readonly string[];
  requiredCareCycleId: string;
  requiredTraitId: string;
  requiredConditionWeaveId: string;
  requiredBondPerSpirit: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritTemperamentConcordProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  careCycleProof: boolean;
  careCycleId?: string;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritTemperamentConcordResult {
  ok: boolean;
  concorded: boolean;
  concordId: string;
  concordName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  temperamentLabels: string[];
  totalBond: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritFieldAlmanac {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredJournalCount: number;
  requiredFieldAccordId: string;
  requiredRoutePatrolId: string;
  requiredCompendiumId: string;
  requiredTemperamentConcordId: string;
  requiredConditionWeaveId: string;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritFieldAlmanacProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  journalDiscoveredCount: number;
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  compendiumProof: boolean;
  compendiumId?: string;
  temperamentConcordProof: boolean;
  temperamentConcordId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritFieldAlmanacResult {
  ok: boolean;
  recorded: boolean;
  almanacId: string;
  almanacName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  routeIds: string[];
  speciesIds: string[];
  journalDiscoveredCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRouteEcologySurvey {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredRouteSpiritIds: readonly string[];
  requiredJournalCount: number;
  requiredFieldAlmanacId: string;
  requiredFieldAccordId: string;
  requiredRoutePatrolId: string;
  requiredRouteMasteryId: string;
  requiredConditionWeaveId: string;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRouteEcologyProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  routeInvitedSpiritIds: readonly string[];
  journalDiscoveredCount: number;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRouteEcologyResult {
  ok: boolean;
  surveyed: boolean;
  surveyId: string;
  surveyName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  routeIds: string[];
  speciesIds: string[];
  routeInvitedSpiritIds: string[];
  journalDiscoveredCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritWeatherVeil {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredRouteIds: readonly string[];
  requiredWeatherConditionIds: readonly string[];
  requiredRouteEcologyId: string;
  requiredFieldAlmanacId: string;
  requiredFieldAccordId: string;
  requiredRoutePatrolId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritWeatherVeilProgress {
  discoveredRoutes: readonly string[];
  weatherConditionIds: readonly string[];
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritWeatherVeilResult {
  ok: boolean;
  recorded: boolean;
  weatherVeilId: string;
  weatherVeilName: string;
  title: string;
  habitat: SpiritHabitat;
  routeIds: string[];
  weatherConditionIds: string[];
  routeConditionWindows: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritEncounterRotation {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredRouteIds: readonly string[];
  requiredEncounterSpiritIds: readonly string[];
  requiredLureItemIds: readonly string[];
  requiredRouteEcologyId: string;
  requiredFieldAlmanacId: string;
  requiredFieldAccordId: string;
  requiredCaptureRiteId: string;
  requiredWeatherVeilId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritEncounterRotationProgress {
  discoveredRoutes: readonly string[];
  encounterSpiritIds: readonly string[];
  lureItemIds: readonly string[];
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  fieldAccordProof: boolean;
  fieldAccordId?: string;
  captureRiteProof: boolean;
  captureRiteId?: string;
  weatherVeilProof: boolean;
  weatherVeilId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritEncounterRotationResult {
  ok: boolean;
  recorded: boolean;
  rotationId: string;
  rotationName: string;
  title: string;
  habitat: SpiritHabitat;
  routeIds: string[];
  encounterSpiritIds: string[];
  lureItemIds: string[];
  rotationWindows: string[];
  weatherVeilId: string;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritEncounterAtlas {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredRouteIds: readonly string[];
  requiredEncounterSpiritIds: readonly string[];
  requiredRarityTiers: readonly SpiritEncounterRarity[];
  requiredJournalCount: number;
  requiredRouteEcologyId: string;
  requiredCaptureRiteId: string;
  requiredFieldAlmanacId: string;
  requiredEncounterRotationId: string;
  requiredWeatherVeilId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritEncounterAtlasProgress {
  discoveredRoutes: readonly string[];
  encounteredSpiritIds: readonly string[];
  capturedSpiritIds: readonly string[];
  rarityTiers: readonly string[];
  journalDiscoveredCount: number;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  captureRiteProof: boolean;
  captureRiteId?: string;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  encounterRotationProof: boolean;
  encounterRotationId?: string;
  weatherVeilProof: boolean;
  weatherVeilId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritEncounterAtlasResult {
  ok: boolean;
  recorded: boolean;
  atlasId: string;
  atlasName: string;
  title: string;
  habitat: SpiritHabitat;
  routeIds: string[];
  encounteredSpiritIds: string[];
  capturedSpiritIds: string[];
  rarityTiers: SpiritEncounterRarity[];
  journalDiscoveredCount: number;
  encounterRotationId: string;
  weatherVeilId: string;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritHabitatCensus {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredEncounterAtlasId: string;
  requiredRouteEcologyId: string;
  requiredWeatherVeilId: string;
  requiredCompendiumId: string;
  requiredCareCycleId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritHabitatCensusProgress {
  roster: readonly string[];
  discoveredRoutes: readonly string[];
  observedSpiritIds: readonly string[];
  careLoggedSpiritIds: readonly string[];
  encounterAtlasProof: boolean;
  encounterAtlasId?: string;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  weatherVeilProof: boolean;
  weatherVeilId?: string;
  compendiumProof: boolean;
  compendiumId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritHabitatCensusResult {
  ok: boolean;
  recorded: boolean;
  censusId: string;
  censusName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  routeIds: string[];
  observedSpiritIds: string[];
  careLoggedSpiritIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritCraftWrit {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRecipeIds: readonly string[];
  requiredStockItemIds: readonly string[];
  requiredProvisionSatchelId: string;
  requiredRouteEcologyId: string;
  requiredFieldAlmanacId: string;
  requiredCareCycleId: string;
  requiredTemperamentConcordId: string;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritCraftWritProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  recipeIds: readonly string[];
  stockItemIds: readonly string[];
  provisionProof: boolean;
  provisionSatchelId?: string;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  fieldAlmanacProof: boolean;
  fieldAlmanacId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  temperamentConcordProof: boolean;
  temperamentConcordId?: string;
  marketProof: boolean;
  tradeProof: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritCraftWritResult {
  ok: boolean;
  crafted: boolean;
  writId: string;
  writName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  recipeIds: string[];
  stockItemIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface MarketGuildReceipt {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  listingItemIds: readonly string[];
  requiredCurrency: string;
  requiredPrice: number;
  requiredQuantity: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface MarketGuildReceiptProgress {
  itemId: string;
  quantity: number;
  currency: string;
  price: number;
  marketProof: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
  noRealValue: boolean;
}

export interface MarketGuildReceiptResult {
  ok: boolean;
  purchased: boolean;
  receiptId: string;
  receiptName: string;
  title: string;
  habitat: SpiritHabitat;
  itemId: string;
  quantity: number;
  currency: string;
  price: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface TradeExchangeAccord {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredItemIds: readonly string[];
  requiredProvisionSatchelId: string;
  requiredCraftWritId: string;
  requiredPresenceCount: number;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface TradeExchangeAccordProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  listedItemIds: readonly string[];
  offeredItemIds: readonly string[];
  marketProof: boolean;
  tradeProof: boolean;
  provisionProof: boolean;
  provisionSatchelId?: string;
  craftWritProof: boolean;
  craftWritId?: string;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface TradeExchangeAccordResult {
  ok: boolean;
  exchanged: boolean;
  accordId: string;
  accordName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  itemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRouteWaystone {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredRouteIds: readonly string[];
  requiredRouteSpiritIds: readonly string[];
  requiredRouteMasteryId: string;
  requiredRoutePatrolId: string;
  requiredRouteEcologyId: string;
  requiredCraftWritId: string;
  requiredChatLines: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRouteWaystoneProgress {
  discoveredRoutes: readonly string[];
  routeInvitedSpiritIds: readonly string[];
  activeSpiritId?: string;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  craftWritProof: boolean;
  craftWritId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRouteWaystoneResult {
  ok: boolean;
  activated: boolean;
  waystoneId: string;
  waystoneName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  routeIds: string[];
  routeInvitedSpiritIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritNurtureRite {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredCareCycleId: string;
  requiredGrowthRiteId: string;
  requiredProvisionSatchelId: string;
  requiredCraftWritId: string;
  requiredTemperamentConcordId: string;
  requiredBond: number;
  requiredTrainingXp: number;
  requiredSparLadderXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritNurtureRiteProgress {
  roster: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  provisionProof: boolean;
  provisionSatchelId?: string;
  craftWritProof: boolean;
  craftWritId?: string;
  temperamentConcordProof: boolean;
  temperamentConcordId?: string;
  raisingProof: boolean;
  raisingMilestoneLabel?: string;
  bond: number;
  trainingXp: number;
  sparLadderXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritNurtureRiteResult {
  ok: boolean;
  nurtured: boolean;
  riteId: string;
  riteName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  caredSpiritIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRecoveryTea {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredCareCycleId: string;
  requiredSanctuaryRiteId: string;
  requiredNurtureRiteId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRecoveryTeaProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  sanctuaryRiteProof: boolean;
  sanctuaryRiteId?: string;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore?: number;
  battleRoundOpponentScore?: number;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRecoveryTeaResult {
  ok: boolean;
  recovered: boolean;
  teaId: string;
  teaName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  caredSpiritIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritKinshipAlbum {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredCareCycleId: string;
  requiredNurtureRiteId: string;
  requiredGrowthRiteId: string;
  requiredCompendiumId: string;
  requiredHabitatBondId: string;
  requiredBondPerSpirit: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritKinshipAlbumProgress {
  roster: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  localPresenceCount: number;
  careCycleProof: boolean;
  careCycleId?: string;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  compendiumProof: boolean;
  compendiumId?: string;
  habitatBondProof: boolean;
  habitatBondId?: string;
  raisingProof: boolean;
  raisingMilestoneLabel?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritKinshipAlbumResult {
  ok: boolean;
  recorded: boolean;
  albumId: string;
  albumName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  caredSpiritIds: string[];
  totalBond: number;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritNurseryGrove {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredCareCycleId: string;
  requiredNurtureRiteId: string;
  requiredRecoveryTeaId: string;
  requiredKinshipAlbumId: string;
  requiredGrowthRiteId: string;
  requiredBondPerSpirit: number;
  requiredTrainingXp: number;
  requiredSparLadderXp: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritNurseryGroveProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  localPresenceCount: number;
  careCycleProof: boolean;
  careCycleId?: string;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  recoveryTeaProof: boolean;
  recoveryTeaId?: string;
  kinshipAlbumProof: boolean;
  kinshipAlbumId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  raisingProof: boolean;
  raisingMilestoneLabel?: string;
  trainingXp: number;
  sparLadderXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritNurseryGroveResult {
  ok: boolean;
  cultivated: boolean;
  nurseryId: string;
  nurseryName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  caredSpiritIds: string[];
  totalBond: number;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritBloomAscendance {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  formTitle: string;
  requiredSpiritIds: readonly string[];
  requiredNurseryGroveId: string;
  requiredNurtureRiteId: string;
  requiredKinshipAlbumId: string;
  requiredGrowthRiteId: string;
  requiredTraitId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredBondPerSpirit: number;
  requiredTrainingXp: number;
  requiredSparLadderXp: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritBloomAscendanceProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  localPresenceCount: number;
  nurseryGroveProof: boolean;
  nurseryGroveId?: string;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  kinshipAlbumProof: boolean;
  kinshipAlbumId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  trainingXp: number;
  sparLadderXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritBloomAscendanceResult {
  ok: boolean;
  ascended: boolean;
  ascendanceId: string;
  ascendanceName: string;
  title: string;
  formTitle: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  caredSpiritIds: string[];
  totalBond: number;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritLineageRegister {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredKinshipAlbumId: string;
  requiredNurseryGroveId: string;
  requiredBloomAscendanceId: string;
  requiredCaptureRiteId: string;
  requiredCareCycleId: string;
  requiredGrowthRiteId: string;
  requiredBondPerSpirit: number;
  requiredTrainingXp: number;
  requiredSparLadderXp: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritLineageRegisterProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  caredSpiritIds: readonly string[];
  activeSpiritId?: string;
  bondBySpiritId?: Record<string, number>;
  localPresenceCount: number;
  kinshipAlbumProof: boolean;
  kinshipAlbumId?: string;
  nurseryGroveProof: boolean;
  nurseryGroveId?: string;
  bloomAscendanceProof: boolean;
  bloomAscendanceId?: string;
  captureRiteProof: boolean;
  captureRiteId?: string;
  careCycleProof: boolean;
  careCycleId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  growthForm?: string;
  raisingProof: boolean;
  raisingMilestoneLabel?: string;
  trainingXp: number;
  sparLadderXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritLineageRegisterResult {
  ok: boolean;
  registered: boolean;
  registerId: string;
  registerName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  activeSpiritName: string;
  roster: string[];
  partyIds: string[];
  caredSpiritIds: string[];
  totalBond: number;
  milestoneLabels: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface GuildCommission {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredRosterCount: number;
  requiredJournalCount: number;
  requiredCompletedQuestCount: number;
  requiredTrainingXp: number;
  requiredProvisionSatchelId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildCommissionProgress {
  roster: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  questChainProof: boolean;
  completedQuestIds: readonly string[];
  provisionProof: boolean;
  provisionSatchelId?: string;
  marketProof: boolean;
  tradeProof: boolean;
  trainingXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface GuildCommissionResult {
  ok: boolean;
  completed: boolean;
  commissionId: string;
  commissionName: string;
  title: string;
  habitat: SpiritHabitat;
  activeSpiritId?: string;
  roster: string[];
  completedQuestIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface GuildSocialRally {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredPartySize: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildSocialRallyProgress {
  partyIds: readonly string[];
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
  emoteProof: boolean;
  commissionProof: boolean;
  harmonyFormProof: boolean;
  harmonyTrialProof: boolean;
  teamSparMatchProof: boolean;
}

export interface GuildSocialRallyResult {
  ok: boolean;
  rallied: boolean;
  rallyId: string;
  rallyName: string;
  title: string;
  habitat: SpiritHabitat;
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface MochiQuestLedger {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredQuestIds: readonly string[];
  requiredSpiritCount: number;
  requiredJournalCount: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface MochiQuestLedgerProgress {
  roster: readonly string[];
  acceptedQuestIds: readonly string[];
  completedQuestIds: readonly string[];
  journalDiscoveredCount: number;
  localPresenceCount: number;
  questChainProof: boolean;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  marketReceiptProof: boolean;
  marketReceiptId?: string;
  provisionProof: boolean;
  provisionSatchelId?: string;
  commissionProof: boolean;
  commissionId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface MochiQuestLedgerResult {
  ok: boolean;
  recorded: boolean;
  ledgerId: string;
  ledgerName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  acceptedQuestIds: string[];
  completedQuestIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface MochiStoryChapter {
  id: string;
  name: string;
  title: string;
  narratorName: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredQuestIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredQuestLedgerId: string;
  requiredNurtureRiteId: string;
  requiredTournamentBracketId: string;
  requiredCommissionId: string;
  requiredRallyId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface MochiStoryChapterProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  completedQuestIds: readonly string[];
  discoveredRoutes: readonly string[];
  journalDiscoveredCount: number;
  localPresenceCount: number;
  routeEcologyProof: boolean;
  routeEcologyId?: string;
  routeWaystoneProof: boolean;
  routeWaystoneId?: string;
  questLedgerProof: boolean;
  questLedgerId?: string;
  nurtureRiteProof: boolean;
  nurtureRiteId?: string;
  tournamentProof: boolean;
  tournamentId?: string;
  commissionProof: boolean;
  commissionId?: string;
  rallyProof: boolean;
  rallyId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  emoteProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface MochiStoryChapterResult {
  ok: boolean;
  recorded: boolean;
  chapterId: string;
  chapterName: string;
  title: string;
  narratorName: string;
  habitat: SpiritHabitat;
  roster: string[];
  partyIds: string[];
  completedQuestIds: string[];
  routeIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface GuildInsigniaCase {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritCount: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildInsigniaCaseProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  localPresenceCount: number;
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  routePatrolProof: boolean;
  routePatrolId?: string;
  guildRankProof: boolean;
  guildRankId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  tournamentProof: boolean;
  tournamentId?: string;
  storyChapterProof: boolean;
  storyChapterId?: string;
  harmonyFormProof: boolean;
  harmonyFormId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  emoteProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface GuildInsigniaCaseResult {
  ok: boolean;
  completed: boolean;
  caseId: string;
  caseName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface GuildWayfarerChronicle {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritCount: number;
  requiredJournalCount: number;
  requiredQuestCount: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildWayfarerChronicleProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  journalDiscoveredCount: number;
  completedQuestIds: readonly string[];
  localPresenceCount: number;
  starterVowProof: boolean;
  captureProof: boolean;
  captureRiteProof: boolean;
  encounterAtlasProof: boolean;
  habitatCensusProof: boolean;
  routeMasteryProof: boolean;
  routePatrolProof: boolean;
  routeEcologyProof: boolean;
  habitatBondProof: boolean;
  researchProof: boolean;
  compendiumProof: boolean;
  provisionProof: boolean;
  provisionCatalogProof: boolean;
  battleKitProof: boolean;
  remedyPouchProof: boolean;
  questLedgerProof: boolean;
  rosterCabinetProof: boolean;
  craftWritProof: boolean;
  routeWaystoneProof: boolean;
  nurtureRiteProof: boolean;
  kinshipAlbumProof: boolean;
  nurseryGroveProof: boolean;
  bloomAscendanceProof: boolean;
  lineageRegisterProof: boolean;
  exchangeAccordProof: boolean;
  affinityMatrixProof: boolean;
  techniqueCodexProof: boolean;
  commissionProof: boolean;
  rallyProof: boolean;
  techniqueLoadoutProof: boolean;
  traitAttunementProof: boolean;
  conditionWeaveProof: boolean;
  relicAttunementProof: boolean;
  guildRankProof: boolean;
  growthRiteProof: boolean;
  harmonyFormProof: boolean;
  harmonyTrialProof: boolean;
  teamSparMatchProof: boolean;
  mentorChallengeProof: boolean;
  dojoLadderProof: boolean;
  sifuCouncilProof: boolean;
  summitCircuitProof: boolean;
  tournamentProof: boolean;
  storyChapterProof: boolean;
  insigniaCaseProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  questChainProof: boolean;
  marketProof: boolean;
  marketReceiptProof: boolean;
  tradeProof: boolean;
  canaryPreviewProof: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface GuildWayfarerChronicleResult {
  ok: boolean;
  chronicled: boolean;
  chronicleId: string;
  chronicleName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  partyIds: string[];
  completedQuestIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface GuildAscensionTrial {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritCount: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface GuildAscensionTrialProgress {
  roster: readonly string[];
  partyIds: readonly string[];
  localPresenceCount: number;
  starterVowProof: boolean;
  wayfarerChronicleProof: boolean;
  kinshipAlbumProof: boolean;
  nurseryGroveProof: boolean;
  bloomAscendanceProof: boolean;
  lineageRegisterProof: boolean;
  exchangeAccordProof: boolean;
  provisionCatalogProof: boolean;
  battleKitProof: boolean;
  remedyPouchProof: boolean;
  questLedgerProof: boolean;
  rosterCabinetProof: boolean;
  affinityMatrixProof: boolean;
  techniqueCodexProof: boolean;
  relicAttunementProof: boolean;
  routePatrolProof: boolean;
  mentorChallengeProof: boolean;
  dojoLadderProof: boolean;
  sifuCouncilProof: boolean;
  summitCircuitProof: boolean;
  tournamentProof: boolean;
  storyChapterProof: boolean;
  insigniaCaseProof: boolean;
  rivalCircleProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore?: number;
  battleRoundOpponentScore?: number;
  conditionWeaveProof: boolean;
  harmonyFormProof: boolean;
  harmonyTrialProof: boolean;
  teamSparMatchProof: boolean;
  guildRankProof: boolean;
  growthRiteProof: boolean;
  questChainProof: boolean;
  marketProof: boolean;
  marketReceiptProof: boolean;
  tradeProof: boolean;
  canaryPreviewProof: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface GuildAscensionTrialResult {
  ok: boolean;
  ascended: boolean;
  trialId: string;
  trialName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritPartyFormation {
  ok: boolean;
  activeSpiritId?: string;
  partyIds: string[];
  supportIds: string[];
  message: string;
  source: string;
}

export interface SpiritHarmonyForm {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredPartySize: number;
  requiredRouteMasteryId: string;
  requiredGrowthRiteId: string;
  requiredTrainingXp: number;
  requiredSparLadderXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritHarmonyFormProgress {
  partyIds: readonly string[];
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  tacticProof: boolean;
  affinityProof: boolean;
  trainingXp: number;
  sparLadderXp: number;
}

export interface SpiritHarmonyFormResult {
  ok: boolean;
  formed: boolean;
  formId: string;
  name: string;
  title: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritHarmonyTrial {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredHarmonyFormId: string;
  requiredSparWins: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritHarmonyTrialProgress {
  partyIds: readonly string[];
  harmonyFormProof: boolean;
  harmonyFormId?: string;
  tacticProof: boolean;
  affinityProof: boolean;
  sparLadderWins: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines: readonly string[];
}

export interface SpiritHarmonyTrialResult {
  ok: boolean;
  cleared: boolean;
  trialId: string;
  trialName: string;
  title: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTeamSparMatch {
  id: string;
  name: string;
  title: string;
  opponentName: string;
  requiredSpiritIds: readonly string[];
  requiredHarmonyTrialId: string;
  requiredTrainingXp: number;
  requiredSparWins: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritTeamSparMatchProgress {
  partyIds: readonly string[];
  harmonyTrialProof: boolean;
  harmonyTrialId?: string;
  harmonyTrialScore: number;
  routeMasteryProof: boolean;
  tacticProof: boolean;
  growthRiteProof: boolean;
  questChainProof: boolean;
  trainingXp: number;
  sparLadderWins: number;
  chatLines: readonly string[];
}

export interface SpiritTeamSparMatchResult {
  ok: boolean;
  cleared: boolean;
  matchId: string;
  matchName: string;
  title: string;
  opponentName: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritMentorChallenge {
  id: string;
  name: string;
  title: string;
  mentorName: string;
  requiredSpiritIds: readonly string[];
  requiredTeamMatchId: string;
  requiredTechniqueXp: number;
  requiredTacticXp: number;
  requiredCareStreak: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritMentorChallengeProgress {
  partyIds: readonly string[];
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  teamSparMatchScore: number;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  techniqueMasteryXp: number;
  tacticMasteryXp: number;
  raisingCareStreak: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
}

export interface SpiritMentorChallengeResult {
  ok: boolean;
  cleared: boolean;
  challengeId: string;
  challengeName: string;
  title: string;
  mentorName: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritDojoLadder {
  id: string;
  name: string;
  title: string;
  mentorName: string;
  requiredSpiritIds: readonly string[];
  requiredOpponentIds: readonly string[];
  requiredTechniqueCodexId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredMentorChallengeId: string;
  requiredTeamMatchId: string;
  requiredSparWins: number;
  requiredSparLadderXp: number;
  requiredTrainingXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritDojoLadderProgress {
  partyIds: readonly string[];
  clearedOpponentIds: readonly string[];
  sparLadderWins: number;
  sparLadderXp: number;
  trainingXp: number;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritDojoLadderResult {
  ok: boolean;
  cleared: boolean;
  ladderId: string;
  ladderName: string;
  title: string;
  mentorName: string;
  partyIds: string[];
  clearedOpponentIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritSifuCouncil {
  id: string;
  name: string;
  title: string;
  hostName: string;
  requiredSpiritIds: readonly string[];
  requiredCouncilMemberIds: readonly string[];
  requiredDojoLadderId: string;
  requiredTournamentBracketId: string;
  requiredRivalCircleId: string;
  requiredTechniqueCodexId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredMentorChallengeId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritSifuCouncilProgress {
  partyIds: readonly string[];
  clearedCouncilMemberIds: readonly string[];
  dojoLadderProof: boolean;
  dojoLadderId?: string;
  dojoLadderScore?: number;
  tournamentProof: boolean;
  tournamentId?: string;
  tournamentScore?: number;
  rivalCircleProof: boolean;
  rivalCircleId?: string;
  rivalCircleScore?: number;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  guildRankProof: boolean;
  routePatrolProof: boolean;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritSifuCouncilResult {
  ok: boolean;
  cleared: boolean;
  councilId: string;
  councilName: string;
  title: string;
  hostName: string;
  partyIds: string[];
  clearedCouncilMemberIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritSummitCircuit {
  id: string;
  name: string;
  title: string;
  hostName: string;
  requiredSpiritIds: readonly string[];
  requiredSummitSealIds: readonly string[];
  requiredDojoLadderId: string;
  requiredTournamentBracketId: string;
  requiredRivalCircleId: string;
  requiredSifuCouncilId: string;
  requiredTechniqueCodexId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredRelicAttunementId: string;
  requiredHarmonyFormId: string;
  requiredHarmonyTrialId: string;
  requiredTeamMatchId: string;
  requiredMentorChallengeId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritSummitCircuitProgress {
  partyIds: readonly string[];
  summitSealIds: readonly string[];
  dojoLadderProof: boolean;
  dojoLadderId?: string;
  dojoLadderScore?: number;
  tournamentProof: boolean;
  tournamentId?: string;
  tournamentScore?: number;
  rivalCircleProof: boolean;
  rivalCircleId?: string;
  rivalCircleScore?: number;
  sifuCouncilProof: boolean;
  sifuCouncilId?: string;
  sifuCouncilScore?: number;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  relicAttunementProof: boolean;
  relicAttunementId?: string;
  harmonyFormProof: boolean;
  harmonyFormId?: string;
  harmonyTrialProof: boolean;
  harmonyTrialId?: string;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  guildRankProof: boolean;
  growthRiteProof: boolean;
  routePatrolProof: boolean;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritSummitCircuitResult {
  ok: boolean;
  cleared: boolean;
  circuitId: string;
  circuitName: string;
  title: string;
  hostName: string;
  partyIds: string[];
  summitSealIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTournamentBracket {
  id: string;
  name: string;
  title: string;
  hostName: string;
  requiredSpiritIds: readonly string[];
  requiredDojoLadderId: string;
  requiredMentorChallengeId: string;
  requiredTeamMatchId: string;
  requiredHarmonyTrialId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritTournamentBracketProgress {
  partyIds: readonly string[];
  dojoLadderProof: boolean;
  dojoLadderId?: string;
  dojoLadderScore?: number;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  mentorChallengeScore: number;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  teamSparMatchScore: number;
  harmonyTrialProof: boolean;
  harmonyTrialId?: string;
  conditionWeaveProof: boolean;
  affinityMatrixProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  localPresenceCount: number;
  routePatrolProof: boolean;
  nurtureRiteProof: boolean;
  guildRankProof: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritTournamentBracketResult {
  ok: boolean;
  cleared: boolean;
  bracketId: string;
  bracketName: string;
  title: string;
  hostName: string;
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRivalCircle {
  id: string;
  name: string;
  title: string;
  rivalName: string;
  requiredSpiritIds: readonly string[];
  requiredTournamentBracketId: string;
  requiredDojoLadderId: string;
  requiredMentorChallengeId: string;
  requiredTeamMatchId: string;
  requiredConditionWeaveId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritRivalCircleProgress {
  partyIds: readonly string[];
  tournamentProof: boolean;
  tournamentId?: string;
  tournamentScore: number;
  dojoLadderProof: boolean;
  dojoLadderId?: string;
  dojoLadderScore?: number;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  mentorChallengeScore: number;
  teamSparMatchProof: boolean;
  teamSparMatchId?: string;
  teamSparMatchScore: number;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  techniqueLoadoutProof: boolean;
  traitAttunementProof: boolean;
  guildRankProof: boolean;
  growthRiteProof: boolean;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRivalCircleResult {
  ok: boolean;
  cleared: boolean;
  circleId: string;
  circleName: string;
  title: string;
  rivalName: string;
  partyIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTechniqueLoadoutMove {
  spiritId: string;
  spiritName: string;
  role: SpiritBattleRole;
  moveId: string;
  moveLabel: string;
  affinity: string;
  focusCost: number;
}

export interface SpiritTechniqueLoadout {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredTechniqueXp: number;
  requiredTacticId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritTechniqueLoadoutProgress {
  partyIds: readonly string[];
  preferredMoveIdBySpiritId?: Record<string, string>;
  techniqueProof: boolean;
  tacticProof: boolean;
  tacticId?: string;
  techniqueMasteryXp: number;
  routeMasteryProof: boolean;
  journalProof: boolean;
  journalDiscoveredCount: number;
}

export interface SpiritTechniqueLoadoutResult {
  ok: boolean;
  prepared: boolean;
  loadoutId: string;
  loadoutName: string;
  title: string;
  partyIds: string[];
  moves: SpiritTechniqueLoadoutMove[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTechniqueCodex {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredMoveIds: readonly string[];
  requiredLoadoutId: string;
  requiredTacticIds: readonly string[];
  requiredTechniqueXp: number;
  requiredTrainingXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritTechniqueCodexProgress {
  partyIds: readonly string[];
  masteredMoveIds: readonly string[];
  tacticIds: readonly string[];
  techniqueProof: boolean;
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  techniqueMasteryXp: number;
  tacticProof: boolean;
  trainingXp: number;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  journalProof: boolean;
  journalDiscoveredCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritTechniqueCodexResult {
  ok: boolean;
  codified: boolean;
  codexId: string;
  codexName: string;
  title: string;
  partyIds: string[];
  masteredMoveIds: string[];
  tacticIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTraitAttunement {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredMentorChallengeId: string;
  requiredLoadoutId: string;
  requiredBond: number;
  requiredCareStreak: number;
  requiredScore: number;
  rewardItemId: string;
  traitBySpiritId: Record<string, string>;
  summary: string;
}

export interface SpiritTraitAttunementProgress {
  partyIds: readonly string[];
  activeSpiritId?: string;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  growthRiteProof: boolean;
  careStreak: number;
  journalProof: boolean;
  journalDiscoveredCount: number;
  bondBySpiritId?: Record<string, number>;
}

export interface SpiritTraitAttunementResult {
  ok: boolean;
  unlocked: boolean;
  traitId: string;
  traitName: string;
  title: string;
  activeSpiritId: string;
  activeSpiritName: string;
  traitLabel: string;
  partyIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritBattleCondition {
  id: string;
  name: string;
  title: string;
  spiritId: string;
  moveId: string;
  affinity: string;
  role: SpiritBattleRole;
  focusBonus: number;
  effect: string;
}

export interface SpiritConditionWeave {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredConditionIds: readonly string[];
  requiredLoadoutId: string;
  requiredTraitId: string;
  requiredMentorChallengeId: string;
  requiredSparWins: number;
  requiredTrainingXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritConditionWeaveProgress {
  partyIds: readonly string[];
  activeSpiritId?: string;
  tacticProof: boolean;
  affinityProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  mentorChallengeProof: boolean;
  mentorChallengeId?: string;
  sparLadderWins: number;
  trainingXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritConditionWeaveResult {
  ok: boolean;
  woven: boolean;
  weaveId: string;
  weaveName: string;
  title: string;
  activeSpiritId: string;
  activeSpiritName: string;
  partyIds: string[];
  conditionIds: string[];
  conditionNames: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritAffinityMatrix {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredAffinityLabels: readonly string[];
  requiredConditionIds: readonly string[];
  requiredTrialId: string;
  requiredLoadoutId: string;
  requiredTraitId: string;
  requiredWeaveId: string;
  requiredSparWins: number;
  requiredTrainingXp: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritAffinityMatrixProgress {
  partyIds: readonly string[];
  activeSpiritId?: string;
  affinityLabels?: readonly string[];
  conditionIds: readonly string[];
  affinityProof: boolean;
  affinityTrialId?: string;
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  battleRoundFocusScore: number;
  battleRoundOpponentScore: number;
  tacticProof: boolean;
  harmonyFormProof: boolean;
  sparLadderWins: number;
  trainingXp: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritAffinityMatrixResult {
  ok: boolean;
  mapped: boolean;
  matrixId: string;
  matrixName: string;
  title: string;
  activeSpiritId: string;
  activeSpiritName: string;
  partyIds: string[];
  affinityLabels: string[];
  conditionIds: string[];
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritRelicAttunement {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredItemIds: readonly string[];
  requiredLoadoutId: string;
  requiredTechniqueCodexId: string;
  requiredTraitId: string;
  requiredConditionWeaveId: string;
  requiredAffinityMatrixId: string;
  requiredCraftWritId: string;
  requiredExchangeAccordId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  relicLabelBySpiritId: Record<string, string>;
  summary: string;
}

export interface SpiritRelicAttunementProgress {
  partyIds: readonly string[];
  activeSpiritId?: string;
  itemIds: readonly string[];
  techniqueLoadoutProof: boolean;
  techniqueLoadoutId?: string;
  techniqueCodexProof: boolean;
  techniqueCodexId?: string;
  traitAttunementProof: boolean;
  traitAttunementId?: string;
  conditionWeaveProof: boolean;
  conditionWeaveId?: string;
  affinityMatrixProof: boolean;
  affinityMatrixId?: string;
  craftWritProof: boolean;
  craftWritId?: string;
  exchangeAccordProof: boolean;
  exchangeAccordId?: string;
  careCycleProof: boolean;
  temperamentConcordProof: boolean;
  growthRiteProof: boolean;
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritRelicAttunementResult {
  ok: boolean;
  attuned: boolean;
  relicAttunementId: string;
  relicAttunementName: string;
  title: string;
  activeSpiritId: string;
  activeSpiritName: string;
  relicLabel: string;
  partyIds: string[];
  itemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritSparOpponent {
  id: string;
  name: string;
  title: string;
  affinity: string;
  baseFocus: number;
  preferredRoles: readonly SpiritBattleRole[];
  rewardXp: number;
  bondDelta: number;
}

export interface SpiritBattleRoundParticipant {
  spiritId: string;
  name: string;
  role: SpiritBattleRole;
  moveId: string;
  moveLabel: string;
  affinity: string;
  bond: number;
  focusContribution: number;
}

export interface SpiritBattleRoundProgress {
  partyIds: readonly string[];
  activeSpiritId?: string;
  moveIdBySpiritId?: Record<string, string>;
  bondBySpiritId?: Record<string, number>;
  opponentId?: string;
  tacticProof?: boolean;
  harmonyFormProof?: boolean;
  priorWins?: number;
}

export interface SpiritBattleRoundResult {
  ok: boolean;
  roundId: string;
  opponentId: string;
  opponentName: string;
  partyIds: string[];
  participants: SpiritBattleRoundParticipant[];
  focusScore: number;
  opponentScore: number;
  victory: boolean;
  noInjury: true;
  trainingXp: number;
  bondDelta: number;
  message: string;
  source: string;
}

export interface SpiritAttunementResult {
  ok: boolean;
  spiritId: string;
  message: string;
  bond: number;
  growth: SpiritGrowthStage;
  source: string;
}

export interface SpiritCaptureResult {
  ok: boolean;
  alreadyRostered: boolean;
  spiritId: string;
  message: string;
  bond: number;
  growth: SpiritGrowthStage;
  source: string;
}

export interface SpiritStarterVow {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredItemId: string;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  vowLabelBySpiritId: Record<string, string>;
  summary: string;
}

export interface SpiritStarterVowProgress {
  selectedSpiritId?: string;
  itemIds: readonly string[];
  localPresenceCount: number;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritStarterVowResult {
  ok: boolean;
  vowed: boolean;
  vowId: string;
  vowName: string;
  title: string;
  habitat: SpiritHabitat;
  selectedSpiritId: string;
  selectedSpiritName: string;
  vowLabel: string;
  itemIds: string[];
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritCaptureRite {
  id: string;
  name: string;
  title: string;
  habitat: SpiritHabitat;
  requiredSpiritIds: readonly string[];
  requiredRouteInviteSpiritIds: readonly string[];
  requiredLureItemIds: readonly string[];
  requiredJournalCount: number;
  requiredPresenceCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
}

export interface SpiritCaptureRiteProgress {
  roster: readonly string[];
  capturedSpiritIds: readonly string[];
  routeInvitedSpiritIds: readonly string[];
  lureItemIds: readonly string[];
  journalDiscoveredCount: number;
  localPresenceCount: number;
  captureProof: boolean;
  routeInviteProof: boolean;
  fieldAccordProof: boolean;
  battleRoundProof: boolean;
  battleRoundVictory: boolean;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
  chatLines?: readonly string[];
}

export interface SpiritCaptureRiteResult {
  ok: boolean;
  recorded: boolean;
  riteId: string;
  riteName: string;
  title: string;
  habitat: SpiritHabitat;
  roster: string[];
  capturedSpiritIds: string[];
  routeInvitedSpiritIds: string[];
  lureItemIds: string[];
  journalDiscoveredCount: number;
  localPresenceCount: number;
  score: number;
  requiredScore: number;
  missing: string[];
  rewardItemId: string;
  message: string;
  source: string;
}

export interface SpiritTrainingBattleResult {
  ok: boolean;
  spiritId: string;
  moveId: string;
  victory: boolean;
  focusScore: number;
  opponentScore: number;
  bondDelta: number;
  trainingXp: number;
  message: string;
}

export interface SpiritTechniqueMasteryResult {
  ok: boolean;
  spiritId: string;
  moveId: string;
  masteryLevel: SpiritTechniqueMasteryLevel;
  masteryXp: number;
  awardedXp: number;
  focusScore: number;
  message: string;
  source: string;
}

export interface SpiritBattleTactic {
  id: string;
  name: string;
  stance: SpiritBattleStance;
  preferredRoles: readonly SpiritBattleRole[];
  favoredAffinities: readonly string[];
  recommendedMoveId: string;
  masteryXp: number;
  bondDelta: number;
  lesson: string;
}

export interface SpiritBattleTacticResult {
  ok: boolean;
  tacticId: string;
  tacticName: string;
  stance: SpiritBattleStance;
  spiritId: string;
  moveId: string;
  focusScore: number;
  masteryXp: number;
  awardedXp: number;
  bondDelta: number;
  message: string;
  source: string;
}

export interface SpiritAffinityTrial {
  id: string;
  name: string;
  title: string;
  affinity: string;
  baseFocus: number;
  favoredAffinities: readonly string[];
  rewardXp: number;
  bondDelta: number;
  lesson: string;
}

export interface SpiritAffinityTrialResult {
  ok: boolean;
  spiritId: string;
  moveId: string;
  trialId: string;
  trialName: string;
  affinityAdvantage: boolean;
  focusScore: number;
  trialScore: number;
  victory: boolean;
  masteryXp: number;
  bondDelta: number;
  message: string;
  source: string;
}

export interface SpiritSparLadderResult {
  ok: boolean;
  opponentId: string;
  opponentName: string;
  partyIds: string[];
  victory: boolean;
  focusScore: number;
  opponentScore: number;
  trainingXp: number;
  bondDelta: number;
  message: string;
  source: string;
}

export interface SpiritJournalRecord {
  spiritId: string;
  name: string;
  title: string;
  discovered: boolean;
  affinity: string;
  temperament: string;
  habitat: SpiritHabitat;
  rarity: SpiritEncounterRarity;
  bond: number;
  growth: SpiritGrowthStage;
  role: SpiritBattleRole;
  certificateEligible: boolean;
  journalTitle: string;
  journalSummary: string;
  unlockHint: string;
}

export interface SpiritJournalResult {
  ok: boolean;
  activeSpiritId?: string;
  discoveredCount: number;
  totalCount: number;
  records: SpiritJournalRecord[];
  message: string;
  source: string;
}

export interface SpiritRaisingResult {
  ok: boolean;
  spiritId: string;
  needId: string;
  bond: number;
  growth: SpiritGrowthStage;
  careStreak: number;
  milestoneId?: string;
  milestoneLabel?: string;
  milestoneReached: boolean;
  nextMilestoneId?: string;
  nextMilestoneLabel?: string;
  nextNeedId?: string;
  message: string;
  source: string;
}

export interface SpiritBondMilestoneResult {
  ok: boolean;
  spiritId: string;
  spiritName: string;
  bond: number;
  growth: SpiritGrowthStage;
  milestone?: SpiritBondMilestone;
  nextMilestone?: SpiritBondMilestone;
  message: string;
  source: string;
}

export interface RuntimeAssetManifest {
  tileSize: 64;
  tilesheet: {
    path: 'src/tiled/mochi-tiles.png';
    width: 512;
    height: 192;
  };
  spritesheets: {
    path: string;
    width: 384;
    height: 768;
    framesWidth: 3;
    framesHeight: 4;
    rectWidth: 128;
    rectHeight: 192;
  }[];
}

export const SPIRIT_HABITATS = {
  jadeLanternCourt: 'Jade Lantern Court'
} as const satisfies Record<string, SpiritHabitat>;

export const SPIRIT_CARE_ACTIONS = {
  teaRibbon: {
    id: 'tea-ribbon-care',
    label: 'Tea ribbon care',
    bondDelta: 1,
    source: 'spirit-care'
  }
} as const satisfies Record<string, SpiritCareAction>;

export const SPIRIT_RAISE_ACTIONS = {
  jadeBrush: {
    id: 'jade-brush-groom',
    label: 'Jade brush grooming',
    bondDelta: 1,
    source: 'spirit-raise',
    growthHint: 'Smooths the spirit aura after training.'
  },
  mooncakeShare: {
    id: 'mooncake-share',
    label: 'Share mooncake',
    bondDelta: 1,
    source: 'spirit-raise',
    growthHint: 'Restores focus for social play.'
  }
} as const satisfies Record<string, SpiritRaisingNeed>;

export const SPIRIT_BOND_MILESTONES = {
  lirabaoLanternSpark: {
    id: 'lirabao-lantern-spark',
    label: 'Blush Lantern Spark',
    requiredBond: 1,
    requiredGrowth: 'seed',
    summary: 'Lirabao steadies a tiny companion glow for first-court greetings.',
    roleplayPrompt: 'Offer quiet tea beside the lanterns and let Lirabao choose the walking pace.'
  },
  lirabaoRibbonWarmth: {
    id: 'lirabao-ribbon-warmth',
    label: 'Ribbon Guardian Warmth',
    requiredBond: 3,
    requiredGrowth: 'sprout',
    summary: 'Lirabao warms guild ribbons before social sparring and no-injury training.',
    roleplayPrompt: 'Brush the jade ribbon once, then greet a nearby wayfarer before practice.'
  },
  lirabaoMoonwellGlow: {
    id: 'lirabao-moonwell-glow',
    label: 'Moonwell Companion Glow',
    requiredBond: 5,
    requiredGrowth: 'glow',
    summary: 'Lirabao opens a calm moonwell glow for closed-alpha growth rite proof.',
    roleplayPrompt: 'Share a mooncake after training and record the glow in the Mochirii journal.'
  },
  jintariMarketSpark: {
    id: 'jintari-market-spark',
    label: 'Goldleaf Market Spark',
    requiredBond: 1,
    requiredGrowth: 'seed',
    summary: 'Jintari flickers near fair trades and generous guild greetings.',
    roleplayPrompt: 'Show the Jade Thread Charm and name one helpful market errand.'
  },
  jintariTradeStep: {
    id: 'jintari-trade-step',
    label: 'Generous Trade Step',
    requiredBond: 3,
    requiredGrowth: 'sprout',
    summary: 'Jintari learns a bright footwork step for fixed-price market practice.',
    roleplayPrompt: 'Offer a no-real-value trade proof and thank the other tester in chat.'
  },
  jintariLacquerGlow: {
    id: 'jintari-lacquer-glow',
    label: 'Lacquer Luck Glow',
    requiredBond: 5,
    requiredGrowth: 'glow',
    summary: 'Jintari carries lacquer-gold luck through guild commissions and rallies.',
    roleplayPrompt: 'Mark one commission complete, then return to the market board with Jintari.'
  },
  aozhenSkybellSpark: {
    id: 'aozhen-skybell-spark',
    label: 'Skybell Whisper Spark',
    requiredBond: 1,
    requiredGrowth: 'seed',
    summary: 'Aozhen catches the first quiet bell note at the court edge.',
    roleplayPrompt: 'Stand near open air and promise to carry one guild message carefully.'
  },
  aozhenReedwindStep: {
    id: 'aozhen-reedwind-step',
    label: 'Reedwind Message Step',
    requiredBond: 3,
    requiredGrowth: 'sprout',
    summary: 'Aozhen practices a light scouting step for Cloudbell route invitations.',
    roleplayPrompt: 'Scout a route, return safely, and describe the wind direction in the journal.'
  },
  aozhenCloudVowGlow: {
    id: 'aozhen-cloud-vow-glow',
    label: 'Cloud Vow Glow',
    requiredBond: 5,
    requiredGrowth: 'glow',
    summary: 'Aozhen keeps a sky-jade vow for full-party harmony and team match proof.',
    roleplayPrompt: 'Complete a team spar match, then ring the guild bell without claiming real value.'
  }
} as const satisfies Record<string, SpiritBondMilestone>;

export const SPIRIT_MOVES = {
  lanternPulse: {
    id: 'lantern-pulse',
    label: 'Lantern Pulse',
    affinity: 'blossom',
    power: 5,
    focusCost: 1,
    effectSummary: 'A soft flash that steadies allies before the next exchange.'
  },
  goldleafFeint: {
    id: 'goldleaf-feint',
    label: 'Goldleaf Feint',
    affinity: 'citrus-gold',
    power: 6,
    focusCost: 2,
    effectSummary: 'A bright side-step used for non-lethal guild training bouts.'
  },
  skybellGuard: {
    id: 'skybell-guard',
    label: 'Skybell Guard',
    affinity: 'sky-jade',
    power: 4,
    focusCost: 1,
    effectSummary: 'A defensive chime that protects the spirit roster.'
  }
} as const satisfies Record<string, SpiritBattleMove>;

export const MOCHI_SPIRIT_PARTY_LIMIT = 3;

export const MOCHI_SPIRITS = [
  {
    id: 'lirabao',
    name: 'Lirabao',
    title: 'Blush-Cloud Mochi Spirit',
    sprite: 'spirit-lirabao',
    affinity: 'blossom',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    temperament: 'gentle',
    guildRelation: 'first-bond guide',
    certificateEligible: true,
    attunement: {
      id: 'lantern-invite',
      label: 'Lantern Invite',
      lureItemId: 'mochirii-guild-seal',
      socialPrompt: 'Offer a calm greeting beside the guild lanterns.'
    },
    capture: {
      encounterId: 'court-habitat-lirabao',
      invitationLabel: 'Lantern Harmony Invitation',
      lureItemId: 'lantern-harmony-tea',
      harmonyRequired: 2,
      rarity: 'common',
      habitatNote: 'Appears where warm lanterns, quiet friends, and soft tea steam overlap.'
    },
    battle: {
      role: 'guardian',
      baseFocus: 4,
      moves: [SPIRIT_MOVES.lanternPulse, SPIRIT_MOVES.skybellGuard]
    },
    journal: {
      title: 'First Lantern Bond',
      summary: 'Lirabao gathers soft lantern warmth into a calm companion glow for new guild wayfarers.',
      unlockHint: 'Meet Lirabao in the Jade Lantern Court and offer a quiet greeting.'
    },
    careActions: [SPIRIT_CARE_ACTIONS.teaRibbon],
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.jadeBrush, SPIRIT_RAISE_ACTIONS.mooncakeShare],
    bondMilestones: [
      SPIRIT_BOND_MILESTONES.lirabaoLanternSpark,
      SPIRIT_BOND_MILESTONES.lirabaoRibbonWarmth,
      SPIRIT_BOND_MILESTONES.lirabaoMoonwellGlow
    ]
  },
  {
    id: 'jintari',
    name: 'Jintari',
    title: 'Goldleaf Mochi Spirit',
    sprite: 'spirit-jintari',
    affinity: 'citrus-gold',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    temperament: 'bright',
    guildRelation: 'market-luck scout',
    certificateEligible: false,
    attunement: {
      id: 'market-ribbon-greeting',
      label: 'Market Ribbon Greeting',
      lureItemId: 'jade-thread-charm',
      socialPrompt: 'Show a Jade Thread Charm near the market ribbons.'
    },
    capture: {
      encounterId: 'court-habitat-jintari',
      invitationLabel: 'Goldleaf Ribbon Invitation',
      lureItemId: 'jade-thread-charm',
      harmonyRequired: 3,
      rarity: 'uncommon',
      habitatNote: 'Appears beside generous trades, guild ribbons, and bright market chatter.'
    },
    battle: {
      role: 'trickster',
      baseFocus: 5,
      moves: [SPIRIT_MOVES.goldleafFeint, SPIRIT_MOVES.lanternPulse]
    },
    journal: {
      title: 'Goldleaf Errand',
      summary: 'Jintari flickers near market ribbons and nudges guildmates toward generous trades.',
      unlockHint: 'Find Jintari beside the guild court path.'
    },
    careActions: [SPIRIT_CARE_ACTIONS.teaRibbon],
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.mooncakeShare],
    bondMilestones: [
      SPIRIT_BOND_MILESTONES.jintariMarketSpark,
      SPIRIT_BOND_MILESTONES.jintariTradeStep,
      SPIRIT_BOND_MILESTONES.jintariLacquerGlow
    ]
  },
  {
    id: 'aozhen',
    name: 'Aozhen',
    title: 'Sky-Jade Mochi Spirit',
    sprite: 'spirit-aozhen',
    affinity: 'sky-jade',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    temperament: 'curious',
    guildRelation: 'wind-message watcher',
    certificateEligible: false,
    attunement: {
      id: 'sky-vow',
      label: 'Sky Vow',
      lureItemId: 'mochirii-guild-seal',
      socialPrompt: 'Stand near the upper path and promise to carry a guild bell message.'
    },
    capture: {
      encounterId: 'court-habitat-aozhen',
      invitationLabel: 'Skybell Vow Invitation',
      lureItemId: 'lantern-harmony-tea',
      harmonyRequired: 4,
      rarity: 'rare',
      habitatNote: 'Appears near open air, guild bells, and wayfarers who keep promises.'
    },
    battle: {
      role: 'scout',
      baseFocus: 6,
      moves: [SPIRIT_MOVES.skybellGuard, SPIRIT_MOVES.goldleafFeint]
    },
    journal: {
      title: 'Sky-Jade Whisper',
      summary: 'Aozhen listens for distant guild bells and carries small hopes between friends.',
      unlockHint: 'Approach Aozhen where the court opens toward the upper path.'
    },
    careActions: [SPIRIT_CARE_ACTIONS.teaRibbon],
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.jadeBrush],
    bondMilestones: [
      SPIRIT_BOND_MILESTONES.aozhenSkybellSpark,
      SPIRIT_BOND_MILESTONES.aozhenReedwindStep,
      SPIRIT_BOND_MILESTONES.aozhenCloudVowGlow
    ]
  }
] as const satisfies readonly MochiSpirit[];

export const ALPHA_ITEMS = {
  guildSeal: {
    id: 'mochirii-guild-seal',
    name: 'Mochirii Guild Seal',
    description: 'A no-real-value proof that you visited the first Mochirii guild court.'
  },
  starterKnot: {
    id: 'jade-starter-knot',
    name: 'Jade Starter Knot',
    description: 'A no-real-value starter companion vow proof for closed-alpha Mochirii first-bond testing.'
  },
  charm: {
    id: 'jade-thread-charm',
    name: 'Jade Thread Charm',
    description: 'A no-real-value alpha market item for fixed-price and trade testing.'
  },
  marketReceipt: {
    id: 'jade-market-receipt',
    name: 'Jade Market Receipt',
    description: 'A no-real-value fixed-price purchase receipt for closed-alpha Mochirii market testing.'
  },
  harmonyTea: {
    id: 'lantern-harmony-tea',
    name: 'Lantern Harmony Tea',
    description: 'A no-real-value spirit invitation lure brewed for Jade Lantern Court encounters.'
  },
  captureRiteTally: {
    id: 'jade-capture-rite-tally',
    name: 'Jade Capture Rite Tally',
    description: 'A no-real-value capture rite proof for closed-alpha Mochirii lure choice, consent invitations, route accords, and social witnesses.'
  },
  mooncakeBox: {
    id: 'jade-mooncake-box',
    name: 'Jade Mooncake Box',
    description: 'A no-real-value care provision for closed-alpha Mochirii spirit raising.'
  },
  provisionSatchel: {
    id: 'jade-court-provision-satchel',
    name: 'Jade Court Provision Satchel',
    description: 'A no-real-value item bag proof for closed-alpha Mochirii shop, care, route, and trade preparation.'
  },
  provisionCatalogSeal: {
    id: 'jade-provision-catalog-seal',
    name: 'Jade Provision Catalog Seal',
    description: 'A no-real-value recipe catalog proof for closed-alpha Mochirii supply, care, craft, route, and recovery planning.'
  },
  battleKitTag: {
    id: 'jade-battle-kit-tag',
    name: 'Jade Battle Kit Tag',
    description: 'A no-real-value battle item kit proof for closed-alpha Mochirii safe spar, recovery, and route-ready item planning.'
  },
  remedyPouchTag: {
    id: 'jade-remedy-pouch-tag',
    name: 'Jade Remedy Pouch Tag',
    description: 'A no-real-value remedy pouch proof for closed-alpha Mochirii status care, recovery tea, safe spar, and post-battle raising.'
  },
  questLedgerSeal: {
    id: 'jade-quest-ledger-seal',
    name: 'Jade Quest Ledger Seal',
    description: 'A no-real-value quest ledger proof for closed-alpha Mochirii roleplay postings, journal records, route patrol, market receipt, and guild commission readiness.'
  },
  careCycleKnot: {
    id: 'jade-care-cycle-knot',
    name: 'Jade Care Cycle Knot',
    description: 'A no-real-value full-roster care cycle proof for closed-alpha Mochirii spirit raising.'
  },
  temperamentCharm: {
    id: 'jade-temperament-charm',
    name: 'Jade Temperament Charm',
    description: 'A no-real-value temperament concord proof for closed-alpha Mochirii spirit identity, care, and battle rhythm.'
  },
  fieldAlmanacClasp: {
    id: 'jade-field-almanac-clasp',
    name: 'Jade Field Almanac Clasp',
    description: 'A no-real-value field almanac proof for closed-alpha Mochirii route, roster, and spirit research.'
  },
  routeEcologyMap: {
    id: 'jade-route-ecology-map',
    name: 'Jade Route Ecology Map',
    description: 'A no-real-value route ecology proof for closed-alpha Mochirii encounter signs, patrol notes, and habitat study.'
  },
  weatherVeilChart: {
    id: 'jade-weather-veil-chart',
    name: 'Jade Weather Veil Chart',
    description: 'A no-real-value route condition proof for closed-alpha Mochirii mist, rain, and wind encounter planning.'
  },
  encounterRotationScroll: {
    id: 'jade-encounter-rotation-scroll',
    name: 'Jade Encounter Rotation Scroll',
    description: 'A no-real-value encounter rotation proof for closed-alpha Mochirii route windows, lure choice, and social capture planning.'
  },
  encounterAtlas: {
    id: 'jade-encounter-atlas',
    name: 'Jade Encounter Atlas',
    description: 'A no-real-value encounter atlas proof for closed-alpha Mochirii route signs, rarity tiers, capture rites, and social witnesses.'
  },
  habitatCensusSeal: {
    id: 'jade-habitat-census-seal',
    name: 'Jade Habitat Census Seal',
    description: 'A no-real-value habitat census proof for closed-alpha Mochirii species observations, care logs, route ecology, and social witnesses.'
  },
  craftWrit: {
    id: 'jade-court-craft-writ',
    name: 'Jade Court Craft Writ',
    description: 'A no-real-value crafting proof for closed-alpha Mochirii supplies, route ecology, care notes, and guild exchange.'
  },
  exchangeAccordTally: {
    id: 'jade-exchange-accord-tally',
    name: 'Jade Exchange Accord Tally',
    description: 'A no-real-value two-tester exchange accord proof for closed-alpha Mochirii market, direct trade, provision, and craft handoff.'
  },
  waystoneSeal: {
    id: 'jade-waystone-travel-seal',
    name: 'Jade Waystone Travel Seal',
    description: 'A no-real-value route navigation proof for closed-alpha Mochirii Moonbridge and Cloudbell travel.'
  },
  nurtureRibbon: {
    id: 'jade-moonwell-nurture-ribbon',
    name: 'Jade Moonwell Nurture Ribbon',
    description: 'A no-real-value raising proof for closed-alpha Mochirii care, growth, supplies, and safe practice.'
  },
  recoveryTeaCup: {
    id: 'jade-teahouse-recovery-cup',
    name: 'Jade Teahouse Recovery Cup',
    description: 'A no-real-value party recovery proof for closed-alpha Mochirii care rhythm, sanctuary rest, nurture rites, and safe battle readiness.'
  },
  kinshipAlbum: {
    id: 'jade-kinship-album',
    name: 'Jade Kinship Album',
    description: 'A no-real-value kinship proof for closed-alpha Mochirii roster bonds, care rhythm, growth, and social raising.'
  },
  nurserySprout: {
    id: 'jade-nursery-sprout',
    name: 'Jade Nursery Sprout',
    description: 'A no-real-value nursery proof for closed-alpha Mochirii companion raising, recovery, kinship, growth, and safe party practice.'
  },
  bloomAscendanceSigil: {
    id: 'jade-bloom-ascendance-sigil',
    name: 'Jade Bloom Ascendance Sigil',
    description: 'A no-real-value ascendance proof for closed-alpha Mochirii full-roster growth, care, affinity, and no-injury battle readiness.'
  },
  lineageRegisterSeal: {
    id: 'jade-lineage-register-seal',
    name: 'Jade Lineage Register Seal',
    description: 'A no-real-value lineage register proof for closed-alpha Mochirii roster care, growth, capture, nursery, bloom, and bond records.'
  },
  tournamentPennant: {
    id: 'jade-banner-tournament-pennant',
    name: 'Jade Banner Tournament Pennant',
    description: 'A no-real-value battle-circuit proof for closed-alpha Mochirii team brackets and social spar readiness.'
  },
  rivalCircleMark: {
    id: 'jade-rival-circle-mark',
    name: 'Jade Rival Circle Mark',
    description: 'A no-real-value rival battle proof for closed-alpha Mochirii party tactics, condition weaving, and social witnesses.'
  },
  storyScroll: {
    id: 'jade-scroll-story-chapter',
    name: 'Jade Scroll Story Chapter',
    description: 'A no-real-value roleplay chapter proof for closed-alpha Mochirii quests, care, routes, guild rally, and tournament readiness.'
  },
  insigniaCase: {
    id: 'jade-insignia-case',
    name: 'Jade Insignia Case',
    description: 'A no-real-value progression case for closed-alpha Mochirii route, rank, growth, harmony, tournament, story, and social proofs.'
  },
  trailRibbon: {
    id: 'moonbridge-field-ribbon',
    name: 'Moonbridge Field Ribbon',
    description: 'A no-real-value route-scouting proof for the first Mochirii field expedition.'
  },
  routeKnot: {
    id: 'cloudbell-route-knot',
    name: 'Cloudbell Route Knot',
    description: 'A no-real-value field mastery proof for completing the first Mochirii route circuit.'
  },
  fieldAccordTalisman: {
    id: 'jade-field-accord-talisman',
    name: 'Jade Field Accord Talisman',
    description: 'A no-real-value route encounter accord proof for original Mochirii spirit invitations.'
  },
  routePatrolPennant: {
    id: 'jade-route-patrol-pennant',
    name: 'Jade Route Patrol Pennant',
    description: 'A no-real-value two-tester route patrol proof for closed-alpha Mochirii overworld play.'
  },
  researchFolio: {
    id: 'jade-court-research-folio',
    name: 'Jade Court Research Folio',
    description: 'A no-real-value field-guide proof for closed-alpha Mochirii spirit research.'
  },
  compendiumSeal: {
    id: 'jade-court-compendium-seal',
    name: 'Jade Court Compendium Seal',
    description: 'A no-real-value species compendium proof for closed-alpha Mochirii spirit collection.'
  },
  rosterArchiveSeal: {
    id: 'jade-roster-archive-seal',
    name: 'Jade Roster Archive Seal',
    description: 'A no-real-value roster archive proof for closed-alpha Mochirii collection management.'
  },
  rosterCabinetTag: {
    id: 'jade-roster-cabinet-tag',
    name: 'Jade Roster Cabinet Tag',
    description: 'A no-real-value roster cabinet proof for closed-alpha Mochirii party, reserve, nursery, lineage, and storage-slot organization.'
  },
  rankSeal: {
    id: 'jade-court-rank-seal',
    name: 'Jade Court Rank Seal',
    description: 'A no-real-value guild rank proof for closed-alpha Mochirii progression.'
  },
  growthSigil: {
    id: 'moonwell-bloom-sigil',
    name: 'Moonwell Bloom Sigil',
    description: 'A no-real-value Mochi Spirit growth rite proof for closed-alpha progression.'
  },
  harmonySash: {
    id: 'triune-jade-sash',
    name: 'Triune Jade Sash',
    description: 'A no-real-value three-spirit party harmony proof for closed-alpha Mochirii progression.'
  },
  concordTally: {
    id: 'jade-echo-concord-tally',
    name: 'Jade Echo Concord Tally',
    description: 'A no-real-value team battle and social concord proof for closed-alpha Mochirii progression.'
  },
  teamMatchRibbon: {
    id: 'jade-mirror-match-ribbon',
    name: 'Jade Mirror Match Ribbon',
    description: 'A no-real-value full-party spar match proof for closed-alpha Mochirii progression.'
  },
  mentorSeal: {
    id: 'silk-banner-mentor-seal',
    name: 'Silk Banner Mentor Seal',
    description: 'A no-real-value mentor challenge proof for closed-alpha Mochirii battle readiness.'
  },
  dojoLadderSeal: {
    id: 'jade-dojo-ladder-seal',
    name: 'Jade Dojo Ladder Seal',
    description: 'A no-real-value dojo ladder proof for closed-alpha Mochirii spar progression, technique literacy, and safe battle readiness.'
  },
  sifuCouncilCrest: {
    id: 'jade-sifu-council-crest',
    name: 'Jade Sifu Council Crest',
    description: 'A no-real-value guild-leader council proof for closed-alpha Mochirii battle mastery, social witness, and safe rival readiness.'
  },
  summitCircuitLaurel: {
    id: 'jade-summit-circuit-laurel',
    name: 'Jade Summit Circuit Laurel',
    description: 'A no-real-value summit circuit proof for closed-alpha Mochirii dojo, tournament, rival, council, harmony, and social battle readiness.'
  },
  loadoutSlip: {
    id: 'jade-step-loadout-slip',
    name: 'Jade Step Loadout Slip',
    description: 'A no-real-value technique loadout proof for closed-alpha Mochirii party battles.'
  },
  techniqueCodexSeal: {
    id: 'jade-technique-codex-seal',
    name: 'Jade Technique Codex Seal',
    description: 'A no-real-value technique codex proof for closed-alpha Mochirii full-party move literacy, tactics, training, and safe battle readiness.'
  },
  traitThread: {
    id: 'jade-heart-trait-thread',
    name: 'Jade Heart Trait Thread',
    description: 'A no-real-value trait attunement proof for closed-alpha Mochirii spirit raising.'
  },
  conditionCharm: {
    id: 'jade-mirror-condition-charm',
    name: 'Jade Mirror Condition Charm',
    description: 'A no-real-value battle condition weave proof for closed-alpha Mochirii party rhythm.'
  },
  affinityMatrixSeal: {
    id: 'jade-affinity-matrix-seal',
    name: 'Jade Affinity Matrix Seal',
    description: 'A no-real-value affinity matrix proof for closed-alpha Mochirii matchup planning, conditions, traits, and no-injury battle readiness.'
  },
  relicSilkCord: {
    id: 'jade-relic-silk-cord',
    name: 'Jade Relic Silk Cord',
    description: 'A no-real-value relic attunement proof for closed-alpha Mochirii held-charm preparation, craft, exchange, care, and social battle readiness.'
  },
  habitatTassel: {
    id: 'jade-court-habitat-tassel',
    name: 'Jade Court Habitat Tassel',
    description: 'A no-real-value habitat bond proof for closed-alpha Mochirii raising and roleplay progression.'
  },
  sanctuaryBell: {
    id: 'jade-sanctuary-bell',
    name: 'Jade Sanctuary Bell',
    description: 'A no-real-value care-shrine restoration proof for closed-alpha Mochirii party recovery.'
  },
  commissionKnot: {
    id: 'jade-court-commission-knot',
    name: 'Jade Court Commission Knot',
    description: 'A no-real-value guild commission proof for closed-alpha Mochirii social roleplay progression.'
  },
  rallyKnot: {
    id: 'jade-courtyard-rally-knot',
    name: 'Jade Courtyard Rally Knot',
    description: 'A no-real-value two-tester guild rally proof for closed-alpha Mochirii social play.'
  },
  wayfarerChronicleClasp: {
    id: 'jade-wayfarer-chronicle-clasp',
    name: 'Jade Wayfarer Chronicle Clasp',
    description: 'A no-real-value closed-alpha completion clasp for the first Mochirii wayfarer chronicle.'
  },
  ascensionRibbon: {
    id: 'jade-court-ascension-ribbon',
    name: 'Jade Court Ascension Ribbon',
    description: 'A no-real-value closed-alpha guild capstone ribbon for the first Mochirii ascension trial.'
  },
  certificate: {
    id: 'lirabao-canary-certificate',
    name: 'Lirabao Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
} as const;

export const SPIRIT_STARTER_VOWS: readonly SpiritStarterVow[] = [
  {
    id: 'jade-starter-vow',
    name: 'Jade Starter Vow',
    title: 'First Companion Vow',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredItemId: ALPHA_ITEMS.guildSeal.id,
    requiredPresenceCount: 1,
    requiredScore: 18,
    rewardItemId: ALPHA_ITEMS.starterKnot.id,
    vowLabelBySpiritId: {
      lirabao: 'Lanternheart First Vow',
      jintari: 'Goldleaf Errand Vow',
      aozhen: 'Skybell Trail Vow'
    },
    summary: 'A no-real-value first-companion pledge for testers who choose an original Mochirii spirit, carry a guild seal, and record social readiness before the wider capture rite.'
  }
];

export const MOCHI_SPIRIT_QUESTS: readonly MochiSpiritQuest[] = [
  {
    id: 'first-lantern-vow',
    title: 'First Lantern Vow',
    zone: SPIRIT_HABITATS.jadeLanternCourt,
    summary: 'Attune with a Mochi Spirit, greet Sifu Narao, and record the first guild journal entry.',
    requiredSpiritId: 'lirabao',
    steps: ['attune-spirit', 'greet-sifu-narao', 'open-journal'],
    rewardItemId: ALPHA_ITEMS.guildSeal.id,
    rewardBond: 1
  },
  {
    id: 'silk-market-kindness',
    title: 'Silk Market Kindness',
    zone: SPIRIT_HABITATS.jadeLanternCourt,
    summary: 'Use a no-real-value market listing and direct trade proof to practice generous guild exchange.',
    requiredSpiritId: 'jintari',
    steps: ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy'],
    rewardItemId: ALPHA_ITEMS.charm.id,
    rewardBond: 1
  },
  {
    id: 'skybell-spar',
    title: 'Skybell Spar',
    zone: SPIRIT_HABITATS.jadeLanternCourt,
    summary: 'Complete one non-lethal training battle and one raising action before returning to the court.',
    requiredSpiritId: 'aozhen',
    steps: ['choose-training-move', 'finish-training-bout', 'complete-raising-care'],
    rewardBond: 2
  }
] as const;

export function selectMochiSpiritQuest(progress: MochiSpiritQuestProgress = { roster: [] }): MochiSpiritQuest {
  const roster = new Set(progress.roster.filter(Boolean));
  const completedQuestIds = new Set(progress.completedQuestIds || []);
  const activeQuest = MOCHI_SPIRIT_QUESTS.find((quest) => quest.id === progress.activeQuestId);
  if (
    activeQuest &&
    !completedQuestIds.has(activeQuest.id) &&
    (!activeQuest.requiredSpiritId || roster.has(activeQuest.requiredSpiritId))
  ) {
    return activeQuest;
  }

  const availableQuest = MOCHI_SPIRIT_QUESTS.find((quest) => {
    return !completedQuestIds.has(quest.id) && (!quest.requiredSpiritId || roster.has(quest.requiredSpiritId));
  });
  if (availableQuest) return availableQuest;

  return MOCHI_SPIRIT_QUESTS.find((quest) => !completedQuestIds.has(quest.id)) || MOCHI_SPIRIT_QUESTS[0];
}

export function resolveMochiSpiritQuestProgress(
  questId: string = MOCHI_SPIRIT_QUESTS[0].id,
  stepId = '',
  progress: MochiSpiritQuestProgress = { roster: [] }
): MochiSpiritQuestProgressResult {
  const quest = MOCHI_SPIRIT_QUESTS.find((entry) => entry.id === questId) || selectMochiSpiritQuest(progress);
  const roster = new Set(progress.roster.filter(Boolean));
  const previousQuestIds = Array.from(new Set(progress.completedQuestIds || []));
  const questStepsById = progress.questStepsById || {};
  const previousSteps = Array.from(new Set(questStepsById[quest.id] || []));

  if (quest.requiredSpiritId && !roster.has(quest.requiredSpiritId)) {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === quest.requiredSpiritId);
    return {
      ok: false,
      questId: quest.id,
      title: quest.title,
      completedSteps: previousSteps,
      completedQuestIds: previousQuestIds,
      completed: previousQuestIds.includes(quest.id),
      chainComplete: previousQuestIds.length >= MOCHI_SPIRIT_QUESTS.length,
      rewardItemId: quest.rewardItemId,
      rewardBond: 0,
      message: `${quest.title} needs ${spirit?.name || quest.requiredSpiritId} in your Mochirii roster before this guild step can be recorded.`,
      source: 'quest-chain'
    };
  }

  const nextStep = stepId && quest.steps.includes(stepId) ? stepId : quest.steps.find((step) => !previousSteps.includes(step));
  const completedSteps = nextStep && !previousSteps.includes(nextStep) ? [...previousSteps, nextStep] : previousSteps;
  const completed = completedSteps.length >= quest.steps.length;
  const completedQuestIds = completed ? Array.from(new Set([...previousQuestIds, quest.id])) : previousQuestIds;
  const nextQuest = MOCHI_SPIRIT_QUESTS.find((entry) => {
    return !completedQuestIds.includes(entry.id) && (!entry.requiredSpiritId || roster.has(entry.requiredSpiritId));
  });
  const chainComplete = completedQuestIds.length >= MOCHI_SPIRIT_QUESTS.length;

  return {
    ok: true,
    questId: quest.id,
    title: quest.title,
    completedSteps,
    completedQuestIds,
    completed,
    chainComplete,
    nextQuestId: nextQuest?.id,
    rewardItemId: quest.rewardItemId,
    rewardBond: completed ? quest.rewardBond : 0,
    message: completed
      ? `${quest.title} complete. ${chainComplete ? 'The first Mochirii quest chain is complete for closed-alpha testing.' : `${nextQuest?.title || 'The next guild posting'} is ready on the quest board.`}`
      : `${quest.title} ${completedSteps.length}/${quest.steps.length} guild steps recorded.`,
    source: 'quest-chain'
  };
}

export const GUILD_RANK_TRIALS: readonly GuildRankTrial[] = [
  {
    id: 'jade-court-initiate',
    title: 'Jade Court Initiate Trial',
    rankTitle: 'Jade Court Initiate',
    requiredSpiritCount: 2,
    requiredQuestStepCount: 1,
    requiredScore: 9,
    rewardItemId: ALPHA_ITEMS.rankSeal.id,
    summary: 'A first guild rank proof for wayfarers who can bond, scout, plan tactics, and practice safely with friends.'
  }
];

export const SPIRIT_GROWTH_RITES: readonly SpiritGrowthRite[] = [
  {
    id: 'moonwell-bloom-rite',
    name: 'Moonwell Bloom Rite',
    formTitle: 'Moonwell Bloom Form',
    requiredGrowth: 'glow',
    requiredBond: 5,
    requiredTrainingXp: 3,
    requiredRankTrialId: GUILD_RANK_TRIALS[0].id,
    rewardItemId: ALPHA_ITEMS.growthSigil.id,
    summary: 'A first Mochirii growth rite for bonded spirits that have trained, received care, and earned Jade Court standing.'
  }
];

export const SPIRIT_EXPEDITION_ROUTES: readonly SpiritExpeditionRoute[] = [
  {
    id: 'moonbridge-bamboo-trail',
    name: 'Moonbridge Bamboo Trail',
    title: 'First Field Route',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredHarmony: 2,
    encounterSpiritId: 'jintari',
    recommendedItemId: ALPHA_ITEMS.charm.id,
    rewardItemId: ALPHA_ITEMS.trailRibbon.id,
    routeNote: 'A moonlit bamboo path where market ribbons flutter and Jintari signs appear before the court opens.'
  },
  {
    id: 'cloudbell-reed-bank',
    name: 'Cloudbell Reed Bank',
    title: 'Sky-Jade Scout Route',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredHarmony: 4,
    encounterSpiritId: 'aozhen',
    recommendedItemId: ALPHA_ITEMS.harmonyTea.id,
    rewardItemId: ALPHA_ITEMS.trailRibbon.id,
    routeNote: 'A quiet reed bank under guild bells where Aozhen listens for careful wayfarers.'
  }
];

export const SPIRIT_CAPTURE_RITES: readonly SpiritCaptureRite[] = [
  {
    id: 'jade-court-capture-rite',
    name: 'Jade Capture Rite',
    title: 'First-Court Consent Capture Rite',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteInviteSpiritIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.encounterSpiritId),
    requiredLureItemIds: Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.lureItemId))),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 38,
    rewardItemId: ALPHA_ITEMS.captureRiteTally.id,
    summary: 'A no-real-value first-court capture rite for testers who prove lure choice, consent invitations, route accord, no-injury battle rhythm, journal study, and nearby social witnesses.'
  }
];

export const SPIRIT_FIELD_ACCORDS: readonly SpiritFieldAccord[] = [
  {
    id: 'moonbridge-goldleaf-accord',
    name: 'Moonbridge Goldleaf Accord',
    title: 'First Route Encounter Accord',
    routeId: 'moonbridge-bamboo-trail',
    targetSpiritId: 'jintari',
    requiredHarmony: 3,
    requiredRosterCount: 1,
    requiredScore: 7,
    rewardItemId: ALPHA_ITEMS.fieldAccordTalisman.id,
    accordNote: 'Jintari follows generous market steps, calm lure timing, and no-injury focus before accepting an invitation.'
  },
  {
    id: 'cloudbell-skyvow-accord',
    name: 'Cloudbell Skyvow Accord',
    title: 'Second Route Encounter Accord',
    routeId: 'cloudbell-reed-bank',
    targetSpiritId: 'aozhen',
    requiredHarmony: 4,
    requiredRosterCount: 2,
    requiredScore: 12,
    rewardItemId: ALPHA_ITEMS.fieldAccordTalisman.id,
    accordNote: 'Aozhen listens for a full route vow, safe scouting rhythm, and a party that can guard without injury.'
  }
];

export const SPIRIT_ROUTE_MASTERIES: readonly SpiritRouteMastery[] = [
  {
    id: 'jade-cloudbell-circuit',
    title: 'Jade Cloudbell Circuit',
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredSpiritCount: MOCHI_SPIRITS.length,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredQuestIds: MOCHI_SPIRIT_QUESTS.map((quest) => quest.id),
    requiredRankTrialId: GUILD_RANK_TRIALS[0].id,
    rewardItemId: ALPHA_ITEMS.routeKnot.id,
    summary: 'A no-real-value field mastery proof for wayfarers who complete the first Mochirii route circuit with a full spirit roster.'
  }
];

export const SPIRIT_ROUTE_PATROLS: readonly SpiritRoutePatrol[] = [
  {
    id: 'jade-cloudbell-patrol',
    name: 'Jade Cloudbell Patrol',
    title: 'First Two-Tester Route Patrol',
    routeId: 'cloudbell-reed-bank',
    requiredMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
    requiredFieldAccordId: 'cloudbell-skyvow-accord',
    requiredPartySize: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 24,
    rewardItemId: ALPHA_ITEMS.routePatrolPennant.id,
    patrolNote: 'Wayfarers keep the reed bank safe by pairing route mastery, field accord trust, chat, and no-injury party battle rhythm.'
  }
];

export const SPIRIT_HABITAT_BONDS: readonly SpiritHabitatBond[] = [
  {
    id: 'jade-court-habitat-bond',
    name: 'Jade Court Habitat Bond',
    title: 'First Shared Habitat Bond',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredScore: 15,
    rewardItemId: ALPHA_ITEMS.habitatTassel.id,
    summary: 'A no-real-value habitat trust proof for testers who invite every first-court Mochi Spirit, record the journal, care for a companion, and show local guild presence.'
  }
];

export const SPIRIT_SANCTUARY_RITES: readonly SpiritSanctuaryRite[] = [
  {
    id: 'jade-court-sanctuary-rite',
    name: 'Jade Court Sanctuary Rite',
    title: 'First Care Shrine Restore',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCareStreak: 1,
    requiredTrainingXp: 3,
    requiredScore: 24,
    rewardItemId: ALPHA_ITEMS.sanctuaryBell.id,
    summary: 'A no-real-value care-shrine restoration proof for testers who connect habitat trust, care streaks, training, condition weaving, and no-injury battle readiness.'
  }
];

export const SPIRIT_RESEARCH_FOLIOS: readonly SpiritResearchFolio[] = [
  {
    id: 'jade-court-research-folio',
    name: 'Jade Court Research Folio',
    title: 'First Mochirii Field Guide',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredHabitatBondId: SPIRIT_HABITAT_BONDS[0].id,
    requiredScore: 18,
    rewardItemId: ALPHA_ITEMS.researchFolio.id,
    summary: 'A no-real-value research folio for testers who connect first-court species, routes, journal notes, habitat trust, and safe battle practice.'
  }
];

export const SPIRIT_COMPENDIUMS: readonly SpiritCompendiumCompletion[] = [
  {
    id: 'jade-court-spirit-compendium',
    name: 'Jade Court Spirit Compendium',
    title: 'First-Court Spirit Collection Proof',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredHabitatBondId: SPIRIT_HABITAT_BONDS[0].id,
    requiredResearchFolioId: SPIRIT_RESEARCH_FOLIOS[0].id,
    requiredScore: 25,
    rewardItemId: ALPHA_ITEMS.compendiumSeal.id,
    summary: 'A no-real-value first-court species compendium for testers who collect every original Mochi Spirit, scout both field routes, and prove habitat plus research coverage.'
  }
];

export const SPIRIT_ROSTER_ARCHIVES: readonly SpiritRosterArchive[] = [
  {
    id: 'jade-court-roster-archive',
    name: 'Jade Court Roster Archive',
    title: 'First Spirit Roster Archive',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredPartySize: 2,
    requiredReserveCount: 1,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredCompendiumId: SPIRIT_COMPENDIUMS[0].id,
    requiredSanctuaryRiteId: SPIRIT_SANCTUARY_RITES[0].id,
    requiredScore: 22,
    rewardItemId: ALPHA_ITEMS.rosterArchiveSeal.id,
    summary: 'A no-real-value roster archive proof for testers who organize a ready party, reserve spirit, compendium record, and care-shrine restoration path.'
  }
];

export const SPIRIT_ROSTER_CABINETS: readonly SpiritRosterCabinet[] = [
  {
    id: 'jade-roster-cabinet',
    name: 'Jade Roster Cabinet',
    title: 'First-Court Spirit Cabinet',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredPartySize: MOCHI_SPIRITS.length,
    requiredStorageSlots: MOCHI_SPIRITS.length,
    requiredArchiveId: SPIRIT_ROSTER_ARCHIVES[0].id,
    requiredCompendiumId: SPIRIT_COMPENDIUMS[0].id,
    requiredNurseryGroveId: 'jade-nursery-grove',
    requiredLineageRegisterId: 'jade-lineage-register',
    requiredScore: 30,
    rewardItemId: ALPHA_ITEMS.rosterCabinetTag.id,
    summary: 'A no-real-value roster cabinet proof for testers who organize all first-court Mochi Spirits across party slots, reserve notes, nursery readiness, lineage records, and social storage labels.'
  }
];

export const SPIRIT_PROVISION_SATCHELS: readonly SpiritProvisionSatchel[] = [
  {
    id: 'jade-court-provision-satchel',
    name: 'Jade Court Provision Satchel',
    title: 'First-Court Provision Bag',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    stockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredRosterCount: MOCHI_SPIRITS.length,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredCareStreak: 1,
    requiredCompletedQuestCount: MOCHI_SPIRIT_QUESTS.length,
    requiredScore: 27,
    rewardItemId: ALPHA_ITEMS.provisionSatchel.id,
    summary: 'A no-real-value first-court item bag proof for testers who stock original Mochirii lures, care provisions, fixed-price receipt proof, direct trades, and quest supplies.'
  }
];

export const SPIRIT_CARE_CYCLES: readonly SpiritCareCycle[] = [
  {
    id: 'jade-court-care-cycle',
    name: 'Jade Court Care Cycle',
    title: 'First Full-Roster Care Rotation',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredBondPerSpirit: 3,
    requiredCareStreak: 1,
    requiredTrainingXp: 3,
    requiredRosterArchiveId: SPIRIT_ROSTER_ARCHIVES[0].id,
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredSanctuaryRiteId: SPIRIT_SANCTUARY_RITES[0].id,
    requiredScore: 32,
    rewardItemId: ALPHA_ITEMS.careCycleKnot.id,
    summary: 'A no-real-value full-roster care rotation proof for testers who raise every first-court Mochi Spirit with supplies, archive tracking, sanctuary restoration, and social guild presence.'
  }
];

export const SPIRIT_TEMPERAMENT_CONCORDS: readonly SpiritTemperamentConcord[] = [
  {
    id: 'jade-temperament-concord',
    name: 'Jade Temperament Concord',
    title: 'First Temperament Identity Concord',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredTemperaments: MOCHI_SPIRITS.map((spirit) => spirit.temperament),
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredTraitId: 'jade-heart-trait',
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredBondPerSpirit: 3,
    requiredChatLines: 1,
    requiredScore: 36,
    rewardItemId: ALPHA_ITEMS.temperamentCharm.id,
    summary: 'A no-real-value temperament identity proof for testers who connect every first-court Mochi Spirit personality with care-cycle trust, trait attunement, battle condition weaving, and guild social presence.'
  }
];

export const SPIRIT_FIELD_ALMANACS: readonly SpiritFieldAlmanac[] = [
  {
    id: 'jade-field-almanac',
    name: 'Jade Field Almanac',
    title: 'First-Court Field Almanac',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredFieldAccordId: 'cloudbell-skyvow-accord',
    requiredRoutePatrolId: SPIRIT_ROUTE_PATROLS[0].id,
    requiredCompendiumId: SPIRIT_COMPENDIUMS[0].id,
    requiredTemperamentConcordId: SPIRIT_TEMPERAMENT_CONCORDS[0].id,
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredChatLines: 1,
    requiredScore: 38,
    rewardItemId: ALPHA_ITEMS.fieldAlmanacClasp.id,
    summary: 'A no-real-value field almanac proof for testers who connect original first-court Mochi Spirit species, route signs, no-injury field accords, patrol notes, compendium seals, temperament identity, and battle-condition study.'
  }
];

export const SPIRIT_ROUTE_ECOLOGY_SURVEYS: readonly SpiritRouteEcologySurvey[] = [
  {
    id: 'jade-route-ecology-survey',
    name: 'Jade Route Ecology Survey',
    title: 'First-Court Encounter Ecology Survey',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredRouteSpiritIds: ['jintari', 'aozhen'],
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredFieldAlmanacId: SPIRIT_FIELD_ALMANACS[0].id,
    requiredFieldAccordId: 'cloudbell-skyvow-accord',
    requiredRoutePatrolId: SPIRIT_ROUTE_PATROLS[0].id,
    requiredRouteMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredChatLines: 1,
    requiredScore: 42,
    rewardItemId: ALPHA_ITEMS.routeEcologyMap.id,
    summary: 'A no-real-value route ecology proof for testers who connect original Mochirii route invitations, encounter signs, field almanac notes, patrol safety, route mastery, and no-injury battle conditions.'
  }
];

export const SPIRIT_WEATHER_VEILS: readonly SpiritWeatherVeil[] = [
  {
    id: 'jade-weather-veil',
    name: 'Jade Weather Veil',
    title: 'First-Court Route Condition Chart',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredWeatherConditionIds: ['moonlit-mist', 'goldleaf-rain', 'skybell-crosswind'],
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredFieldAlmanacId: SPIRIT_FIELD_ALMANACS[0].id,
    requiredFieldAccordId: 'cloudbell-skyvow-accord',
    requiredRoutePatrolId: SPIRIT_ROUTE_PATROLS[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 36,
    rewardItemId: ALPHA_ITEMS.weatherVeilChart.id,
    summary: 'A no-real-value route condition proof for testers who chart original Mochirii mist, rain, and wind veils before encounter rotations and atlas records.'
  }
];

export const SPIRIT_ENCOUNTER_ROTATIONS: readonly SpiritEncounterRotation[] = [
  {
    id: 'jade-encounter-rotation',
    name: 'Jade Encounter Rotation',
    title: 'First-Court Encounter Window Plan',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredEncounterSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredLureItemIds: Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.lureItemId))),
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredFieldAlmanacId: SPIRIT_FIELD_ALMANACS[0].id,
    requiredFieldAccordId: 'cloudbell-skyvow-accord',
    requiredCaptureRiteId: SPIRIT_CAPTURE_RITES[0].id,
    requiredWeatherVeilId: SPIRIT_WEATHER_VEILS[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 45,
    rewardItemId: ALPHA_ITEMS.encounterRotationScroll.id,
    summary: 'A no-real-value encounter rotation proof for testers who plan original Mochirii route windows, consent lures, ecology notes, weather veils, field accord trust, capture rite proof, and social witness before sealing the encounter atlas.'
  }
];

export const SPIRIT_ENCOUNTER_ATLASES: readonly SpiritEncounterAtlas[] = [
  {
    id: 'jade-encounter-atlas',
    name: 'Jade Encounter Atlas',
    title: 'First-Court Encounter Index',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredEncounterSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRarityTiers: Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.capture.rarity))),
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredCaptureRiteId: SPIRIT_CAPTURE_RITES[0].id,
    requiredFieldAlmanacId: SPIRIT_FIELD_ALMANACS[0].id,
    requiredEncounterRotationId: SPIRIT_ENCOUNTER_ROTATIONS[0].id,
    requiredWeatherVeilId: SPIRIT_WEATHER_VEILS[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 53,
    rewardItemId: ALPHA_ITEMS.encounterAtlas.id,
    summary: 'A no-real-value encounter index for testers who prove every first-court route sign, rarity tier, journal entry, capture rite, route ecology note, weather veil, encounter rotation, and nearby social witness.'
  }
];

export const SPIRIT_HABITAT_CENSUSES: readonly SpiritHabitatCensus[] = [
  {
    id: 'jade-habitat-census',
    name: 'Jade Habitat Census',
    title: 'First-Court Habitat Census',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredEncounterAtlasId: SPIRIT_ENCOUNTER_ATLASES[0].id,
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredWeatherVeilId: SPIRIT_WEATHER_VEILS[0].id,
    requiredCompendiumId: SPIRIT_COMPENDIUMS[0].id,
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 49,
    rewardItemId: ALPHA_ITEMS.habitatCensusSeal.id,
    summary: 'A no-real-value habitat census proof for testers who connect original Mochirii species observations, care logs, route ecology, weather veil timing, compendium records, and nearby social witnesses.'
  }
];

export const SPIRIT_CRAFT_WRITS: readonly SpiritCraftWrit[] = [
  {
    id: 'jade-court-craft-writ',
    name: 'Jade Court Craft Writ',
    title: 'First-Court Craft Ledger',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredRecipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
    requiredStockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredFieldAlmanacId: SPIRIT_FIELD_ALMANACS[0].id,
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredTemperamentConcordId: SPIRIT_TEMPERAMENT_CONCORDS[0].id,
    requiredChatLines: 1,
    requiredScore: 44,
    rewardItemId: ALPHA_ITEMS.craftWrit.id,
    summary: 'A no-real-value craft writ proof for testers who turn original Mochirii provisions, route ecology, care-cycle notes, and market/trade handoff into guild-ready supplies.'
  }
];

export const MARKET_GUILD_RECEIPTS: readonly MarketGuildReceipt[] = [
  {
    id: 'jade-court-market-receipt',
    name: 'Jade Court Market Receipt',
    title: 'First Fixed-Price Guild Purchase',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    listingItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredCurrency: 'guild-seals',
    requiredPrice: 5,
    requiredQuantity: 1,
    requiredChatLines: 1,
    requiredScore: 16,
    rewardItemId: ALPHA_ITEMS.marketReceipt.id,
    summary: 'A no-real-value market receipt proof for testers who complete a fixed-price Mochirii supply purchase with profile, guild buddy, status, and chat context.'
  }
];

export const TRADE_EXCHANGE_ACCORDS: readonly TradeExchangeAccord[] = [
  {
    id: 'jade-exchange-accord',
    name: 'Jade Exchange Accord',
    title: 'First-Court Guild Exchange',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredCraftWritId: SPIRIT_CRAFT_WRITS[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 34,
    rewardItemId: ALPHA_ITEMS.exchangeAccordTally.id,
    summary: 'A no-real-value social exchange proof for testers who connect fixed-list market practice, direct trade, provision supplies, craft writs, and two-tester guild presence.'
  }
];

export const SPIRIT_ROUTE_WAYSTONES: readonly SpiritRouteWaystone[] = [
  {
    id: 'jade-cloudbell-waystone',
    name: 'Jade Cloudbell Waystone',
    title: 'First Route Travel Seal',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredRouteSpiritIds: ['jintari', 'aozhen'],
    requiredRouteMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
    requiredRoutePatrolId: SPIRIT_ROUTE_PATROLS[0].id,
    requiredRouteEcologyId: SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id,
    requiredCraftWritId: SPIRIT_CRAFT_WRITS[0].id,
    requiredChatLines: 1,
    requiredScore: 30,
    rewardItemId: ALPHA_ITEMS.waystoneSeal.id,
    summary: 'A no-real-value first route navigation proof for testers who connect Moonbridge, Cloudbell, route spirits, patrol safety, ecology, and crafted travel supplies.'
  }
];

export const SPIRIT_NURTURE_RITES: readonly SpiritNurtureRite[] = [
  {
    id: 'jade-moonwell-nurture-rite',
    name: 'Jade Moonwell Nurture Rite',
    title: 'First-Court Raising Seal',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredCraftWritId: SPIRIT_CRAFT_WRITS[0].id,
    requiredTemperamentConcordId: SPIRIT_TEMPERAMENT_CONCORDS[0].id,
    requiredBond: 5,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredScore: 40,
    rewardItemId: ALPHA_ITEMS.nurtureRibbon.id,
    summary: 'A no-real-value first-court raising proof for testers who connect care, growth, supplies, temperament, bond milestones, and safe training.'
  }
];

export const SPIRIT_RECOVERY_TEAS: readonly SpiritRecoveryTea[] = [
  {
    id: 'jade-teahouse-recovery',
    name: 'Jade Teahouse Recovery',
    title: 'First-Court Party Recovery Table',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredSanctuaryRiteId: SPIRIT_SANCTUARY_RITES[0].id,
    requiredNurtureRiteId: SPIRIT_NURTURE_RITES[0].id,
    requiredPresenceCount: 2,
    requiredScore: 36,
    rewardItemId: ALPHA_ITEMS.recoveryTeaCup.id,
    summary: 'A no-real-value first-court recovery proof for testers who connect care rhythm, sanctuary rest, nurture, battle safety, and social witness before the next route or rival bout.'
  }
];

export const SPIRIT_PROVISION_CATALOGS: readonly SpiritProvisionCatalog[] = [
  {
    id: 'jade-provision-catalog',
    name: 'Jade Provision Catalog',
    title: 'First-Court Item Recipe Catalog',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredStockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredCareItemIds: [ALPHA_ITEMS.mooncakeBox.id, ALPHA_ITEMS.harmonyTea.id],
    requiredRouteItemIds: [ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.charm.id],
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredMarketReceiptId: MARKET_GUILD_RECEIPTS[0].id,
    requiredCraftWritId: SPIRIT_CRAFT_WRITS[0].id,
    requiredRecoveryTeaId: SPIRIT_RECOVERY_TEAS[0].id,
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredHabitatCensusId: SPIRIT_HABITAT_CENSUSES[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 50,
    rewardItemId: ALPHA_ITEMS.provisionCatalogSeal.id,
    summary: 'A no-real-value first-court recipe catalog proof for testers who connect market receipts, provision stock, craft writs, care-cycle supplies, route lures, habitat census notes, recovery tea, and two-tester social readiness.'
  }
];

export const SPIRIT_KINSHIP_ALBUMS: readonly SpiritKinshipAlbum[] = [
  {
    id: 'jade-kinship-album',
    name: 'Jade Kinship Album',
    title: 'First-Court Bond Album',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredNurtureRiteId: SPIRIT_NURTURE_RITES[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredCompendiumId: SPIRIT_COMPENDIUMS[0].id,
    requiredHabitatBondId: SPIRIT_HABITAT_BONDS[0].id,
    requiredBondPerSpirit: 5,
    requiredPresenceCount: 2,
    requiredScore: 38,
    rewardItemId: ALPHA_ITEMS.kinshipAlbum.id,
    summary: 'A no-real-value first-court kinship album for testers who connect roster bonds, care rhythm, nurture, growth, compendium, habitat, and social presence.'
  }
];

export const SPIRIT_NURSERY_GROVES: readonly SpiritNurseryGrove[] = [
  {
    id: 'jade-nursery-grove',
    name: 'Jade Nursery Grove',
    title: 'First-Court Companion Nursery',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredNurtureRiteId: SPIRIT_NURTURE_RITES[0].id,
    requiredRecoveryTeaId: SPIRIT_RECOVERY_TEAS[0].id,
    requiredKinshipAlbumId: SPIRIT_KINSHIP_ALBUMS[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredBondPerSpirit: 5,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredPresenceCount: 2,
    requiredScore: 52,
    rewardItemId: ALPHA_ITEMS.nurserySprout.id,
    summary: 'A no-real-value first-court nursery proof for testers who connect raising, kinship, recovery, growth, safe training, and social witness before tougher battles.'
  }
];

export const SPIRIT_BLOOM_ASCENDANCES: readonly SpiritBloomAscendance[] = [
  {
    id: 'jade-bloom-ascendance',
    name: 'Jade Bloom Ascendance',
    title: 'First-Court Form Ascendance',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    formTitle: 'Jade Bloom Form',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredNurseryGroveId: SPIRIT_NURSERY_GROVES[0].id,
    requiredNurtureRiteId: SPIRIT_NURTURE_RITES[0].id,
    requiredKinshipAlbumId: SPIRIT_KINSHIP_ALBUMS[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredTraitId: 'jade-heart-trait',
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredAffinityMatrixId: 'jade-affinity-matrix',
    requiredBondPerSpirit: 5,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredPresenceCount: 2,
    requiredScore: 58,
    rewardItemId: ALPHA_ITEMS.bloomAscendanceSigil.id,
    summary: 'A no-real-value first-court form ascendance proof for testers who connect full-roster care, nursery cultivation, kinship, growth, affinity matrix planning, and no-injury battle readiness.'
  }
];

export const SPIRIT_LINEAGE_REGISTERS: readonly SpiritLineageRegister[] = [
  {
    id: 'jade-lineage-register',
    name: 'Jade Lineage Register',
    title: 'First-Court Lineage Record',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredKinshipAlbumId: SPIRIT_KINSHIP_ALBUMS[0].id,
    requiredNurseryGroveId: SPIRIT_NURSERY_GROVES[0].id,
    requiredBloomAscendanceId: SPIRIT_BLOOM_ASCENDANCES[0].id,
    requiredCaptureRiteId: SPIRIT_CAPTURE_RITES[0].id,
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredBondPerSpirit: 5,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredPresenceCount: 2,
    requiredScore: 60,
    rewardItemId: ALPHA_ITEMS.lineageRegisterSeal.id,
    summary: 'A no-real-value first-court lineage register for testers who connect capture, care, kinship, nursery, bloom ascendance, growth, raising, bonds, and social witness into one original Mochirii record.'
  }
];

export const GUILD_COMMISSIONS: readonly GuildCommission[] = [
  {
    id: 'jade-court-commission-ledger',
    name: 'Jade Court Commission Ledger',
    title: 'First Social Commission Ledger',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredRosterCount: MOCHI_SPIRITS.length,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredCompletedQuestCount: MOCHI_SPIRIT_QUESTS.length,
    requiredTrainingXp: 1,
    requiredProvisionSatchelId: SPIRIT_PROVISION_SATCHELS[0].id,
    requiredScore: 24,
    rewardItemId: ALPHA_ITEMS.commissionKnot.id,
    summary: 'A no-real-value roleplay commission proof for testers who connect the first quest chain, profile, guild buddy, provisions, training, market, and trade loops.'
  }
];

export const GUILD_SOCIAL_RALLIES: readonly GuildSocialRally[] = [
  {
    id: 'jade-courtyard-rally',
    name: 'Jade Courtyard Rally',
    title: 'First Two-Tester Guild Rally',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredPartySize: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 22,
    rewardItemId: ALPHA_ITEMS.rallyKnot.id,
    summary: 'A no-real-value social rally proof for testers who coordinate two local presences, chat, emote, guild buddy, commission, and full-party Mochi Spirit readiness.'
  }
];

export const GUILD_WAYFARER_CHRONICLES: readonly GuildWayfarerChronicle[] = [
  {
    id: 'jade-wayfarer-chronicle',
    name: 'Jade Wayfarer Chronicle',
    title: 'First-Court Alpha Chronicle',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritCount: MOCHI_SPIRITS.length,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredQuestCount: MOCHI_SPIRIT_QUESTS.length,
    requiredPresenceCount: 2,
    requiredScore: 77,
    rewardItemId: ALPHA_ITEMS.wayfarerChronicleClasp.id,
    summary: 'A no-real-value alpha passport proof for testers who complete the first-court starter vow, capture, route, battle, raising, quest, market receipt, trade, social, and Canary preview loops.'
  }
];

export const GUILD_ASCENSION_TRIALS: readonly GuildAscensionTrial[] = [
  {
    id: 'jade-court-ascension-trial',
    name: 'Jade Court Ascension Trial',
    title: 'First Closed-Alpha Guild Capstone',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritCount: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 66,
    rewardItemId: ALPHA_ITEMS.ascensionRibbon.id,
    summary: 'A no-real-value guild capstone for testers who complete the first Mochirii starter vow, chronicle, social party proof, no-injury battle proof, market receipt proof, route patrol, and Canary preview.'
  }
];

export const SPIRIT_HARMONY_FORMS: readonly SpiritHarmonyForm[] = [
  {
    id: 'triune-jade-harmony',
    name: 'Triune Jade Harmony',
    title: 'First Three-Spirit Harmony Form',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredPartySize: MOCHI_SPIRITS.length,
    requiredRouteMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
    requiredGrowthRiteId: SPIRIT_GROWTH_RITES[0].id,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredScore: 27,
    rewardItemId: ALPHA_ITEMS.harmonySash.id,
    summary: 'A no-real-value social party form for wayfarers who synchronize all first-court Mochi Spirits after mastery, growth, tactics, and safe sparring.'
  }
];

export const SPIRIT_HARMONY_TRIALS: readonly SpiritHarmonyTrial[] = [
  {
    id: 'jade-echo-concord',
    name: 'Jade Echo Concord Trial',
    title: 'First Social Harmony Battle Trial',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredHarmonyFormId: SPIRIT_HARMONY_FORMS[0].id,
    requiredSparWins: 1,
    requiredScore: 24,
    rewardItemId: ALPHA_ITEMS.concordTally.id,
    summary: 'A no-injury team battle proof for a full Mochirii party that has formed harmony, practiced safely, and coordinated with local social presence.'
  }
];

export const SPIRIT_TEAM_SPAR_MATCHES: readonly SpiritTeamSparMatch[] = [
  {
    id: 'jade-mirror-team-match',
    name: 'Jade Mirror Team Match',
    title: 'First Full-Party Spar Match',
    opponentName: 'Mirror Court Trio',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredHarmonyTrialId: SPIRIT_HARMONY_TRIALS[0].id,
    requiredTrainingXp: 3,
    requiredSparWins: 1,
    requiredScore: 30,
    rewardItemId: ALPHA_ITEMS.teamMatchRibbon.id,
    summary: 'A no-injury full-party battle match for testers who have proven route mastery, growth, harmony, concord, tactics, quests, and local social coordination.'
  }
];

export const SPIRIT_MENTOR_CHALLENGES: readonly SpiritMentorChallenge[] = [
  {
    id: 'silk-banner-mentor-drill',
    name: 'Silk Banner Mentor Drill',
    title: 'First Mentor Readiness Challenge',
    mentorName: 'Sifu Narao',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredTeamMatchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
    requiredTechniqueXp: 7,
    requiredTacticXp: 7,
    requiredCareStreak: 1,
    requiredScore: 28,
    rewardItemId: ALPHA_ITEMS.mentorSeal.id,
    summary: 'A no-injury mentor challenge proving the first Mochirii party can blend care, tactics, technique, team sparring, and local social coordination.'
  }
];

export const SPIRIT_DOJO_LADDERS: readonly SpiritDojoLadder[] = [
  {
    id: 'jade-dojo-ladder',
    name: 'Jade Dojo Ladder',
    title: 'First No-Injury Dojo Ladder',
    mentorName: 'Sifu Narao',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredOpponentIds: ['jade-echo-apprentice', 'silk-river-disciple'],
    requiredTechniqueCodexId: 'jade-technique-codex',
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredAffinityMatrixId: 'jade-affinity-matrix',
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredTeamMatchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
    requiredSparWins: 2,
    requiredSparLadderXp: 5,
    requiredTrainingXp: 3,
    requiredScore: 44,
    rewardItemId: ALPHA_ITEMS.dojoLadderSeal.id,
    summary: 'A no-injury dojo ladder proof for testers who clear two original Mochirii spar opponents with technique codex, condition weave, affinity matrix, mentor, team match, battle transcript, and social readiness.'
  }
];

export const SPIRIT_TOURNAMENT_BRACKETS: readonly SpiritTournamentBracket[] = [
  {
    id: 'jade-banner-tournament',
    name: 'Jade Banner Tournament',
    title: 'First Closed-Alpha Battle Circuit',
    hostName: 'Jade Banner Marshal',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredDojoLadderId: SPIRIT_DOJO_LADDERS[0].id,
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredTeamMatchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
    requiredHarmonyTrialId: SPIRIT_HARMONY_TRIALS[0].id,
    requiredPresenceCount: 2,
    requiredScore: 38,
    rewardItemId: ALPHA_ITEMS.tournamentPennant.id,
    summary: 'A no-injury closed-alpha battle bracket for testers who prove party harmony, mentor readiness, dojo ladder progress, route patrol, nurture, rank, and social presence.'
  }
];

export const SPIRIT_RIVAL_CIRCLES: readonly SpiritRivalCircle[] = [
  {
    id: 'jade-rival-circle',
    name: 'Jade Rival Circle',
    title: 'First No-Injury Rival Bout',
    rivalName: 'Qinghei Banner Circle',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredTournamentBracketId: SPIRIT_TOURNAMENT_BRACKETS[0].id,
    requiredDojoLadderId: SPIRIT_DOJO_LADDERS[0].id,
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredTeamMatchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredPresenceCount: 2,
    requiredScore: 46,
    rewardItemId: ALPHA_ITEMS.rivalCircleMark.id,
    summary: 'A no-injury rival battle proof for testers who combine the first-court party, mentor drill, dojo ladder, tournament bracket, condition weave, and nearby social witness.'
  }
];

export const SPIRIT_SIFU_COUNCILS: readonly SpiritSifuCouncil[] = [
  {
    id: 'jade-sifu-council',
    name: 'Jade Sifu Council',
    title: 'First Guild-Leader Council Trial',
    hostName: 'Sifu Narao',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredCouncilMemberIds: ['sifu-narao', 'warden-meilin', 'keeper-haoran'],
    requiredDojoLadderId: SPIRIT_DOJO_LADDERS[0].id,
    requiredTournamentBracketId: SPIRIT_TOURNAMENT_BRACKETS[0].id,
    requiredRivalCircleId: SPIRIT_RIVAL_CIRCLES[0].id,
    requiredTechniqueCodexId: 'jade-technique-codex',
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredAffinityMatrixId: 'jade-affinity-matrix',
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredPresenceCount: 2,
    requiredScore: 62,
    rewardItemId: ALPHA_ITEMS.sifuCouncilCrest.id,
    summary: 'A no-injury guild-leader council proof for testers who clear original Mochirii dojo, tournament, rival, technique, condition, affinity, mentor, route, and social witness readiness.'
  }
];

export const SPIRIT_SUMMIT_CIRCUITS: readonly SpiritSummitCircuit[] = [
  {
    id: 'jade-summit-circuit',
    name: 'Jade Summit Circuit',
    title: 'First Summit Battle Circuit',
    hostName: 'Circuit Marshal Yunxi',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredSummitSealIds: ['jade-dojo-seal', 'banner-ring-seal', 'qinghei-rival-seal', 'sifu-council-seal'],
    requiredDojoLadderId: SPIRIT_DOJO_LADDERS[0].id,
    requiredTournamentBracketId: SPIRIT_TOURNAMENT_BRACKETS[0].id,
    requiredRivalCircleId: SPIRIT_RIVAL_CIRCLES[0].id,
    requiredSifuCouncilId: SPIRIT_SIFU_COUNCILS[0].id,
    requiredTechniqueCodexId: 'jade-technique-codex',
    requiredConditionWeaveId: 'jade-mirror-condition-weave',
    requiredAffinityMatrixId: 'jade-affinity-matrix',
    requiredRelicAttunementId: 'jade-relic-attunement',
    requiredHarmonyFormId: SPIRIT_HARMONY_FORMS[0].id,
    requiredHarmonyTrialId: SPIRIT_HARMONY_TRIALS[0].id,
    requiredTeamMatchId: SPIRIT_TEAM_SPAR_MATCHES[0].id,
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredPresenceCount: 2,
    requiredScore: 80,
    rewardItemId: ALPHA_ITEMS.summitCircuitLaurel.id,
    summary: 'A no-injury summit battle circuit for testers who unify original Mochirii dojo, tournament, rival, sifu council, harmony, team match, route, rank, growth, and social proof.'
  }
];

export const MOCHI_QUEST_LEDGERS: readonly MochiQuestLedger[] = [
  {
    id: 'jade-quest-ledger',
    name: 'Jade Quest Ledger',
    title: 'First-Court Quest Ledger',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredQuestIds: MOCHI_SPIRIT_QUESTS.map((quest) => quest.id),
    requiredSpiritCount: MOCHI_SPIRITS.length,
    requiredJournalCount: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 40,
    rewardItemId: ALPHA_ITEMS.questLedgerSeal.id,
    summary: 'A no-real-value quest ledger proof for testers who complete the first Mochirii roleplay postings with roster, journal, route, market, provision, commission, and social readiness.'
  }
];

export const MOCHI_STORY_CHAPTERS: readonly MochiStoryChapter[] = [
  {
    id: 'jade-scroll-story-chapter',
    name: 'Jade Scroll Story Chapter',
    title: 'First-Court Roleplay Chapter',
    narratorName: 'Sifu Narao',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredQuestIds: MOCHI_SPIRIT_QUESTS.map((quest) => quest.id),
    requiredRouteIds: SPIRIT_EXPEDITION_ROUTES.map((route) => route.id),
    requiredQuestLedgerId: MOCHI_QUEST_LEDGERS[0].id,
    requiredNurtureRiteId: SPIRIT_NURTURE_RITES[0].id,
    requiredTournamentBracketId: SPIRIT_TOURNAMENT_BRACKETS[0].id,
    requiredCommissionId: GUILD_COMMISSIONS[0].id,
    requiredRallyId: GUILD_SOCIAL_RALLIES[0].id,
    requiredPresenceCount: 2,
    requiredScore: 42,
    rewardItemId: ALPHA_ITEMS.storyScroll.id,
    summary: 'A no-real-value first-court roleplay chapter for testers who connect spirit care, route discovery, guild social play, safe battle, and quest vows into one Mochirii story record.'
  }
];

export const GUILD_INSIGNIA_CASES: readonly GuildInsigniaCase[] = [
  {
    id: 'jade-insignia-case',
    name: 'Jade Insignia Case',
    title: 'First-Court Progression Case',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritCount: MOCHI_SPIRITS.length,
    requiredPresenceCount: 2,
    requiredScore: 34,
    rewardItemId: ALPHA_ITEMS.insigniaCase.id,
    summary: 'A no-real-value Mochirii progression case for testers who gather route, rank, growth, harmony, tournament, story, and social proofs into one closed-alpha milestone.'
  }
];

export const SPIRIT_SPAR_LADDER = [
  {
    id: 'jade-echo-apprentice',
    name: 'Jade Echo Apprentice',
    title: 'First Court Sparring Echo',
    affinity: 'jade-echo',
    baseFocus: 17,
    preferredRoles: ['guardian', 'scout'],
    rewardXp: 5,
    bondDelta: 1
  },
  {
    id: 'silk-river-disciple',
    name: 'Silk River Disciple',
    title: 'Market Path Sparring Echo',
    affinity: 'silk-river',
    baseFocus: 21,
    preferredRoles: ['trickster', 'guardian'],
    rewardXp: 7,
    bondDelta: 1
  }
] as const satisfies readonly SpiritSparOpponent[];

export const SPIRIT_AFFINITY_TRIALS: readonly SpiritAffinityTrial[] = [
  {
    id: 'jade-mirror-trial',
    name: 'Jade Mirror Trial',
    title: 'Court Affinity Reflection',
    affinity: 'jade-mirror',
    baseFocus: 14,
    favoredAffinities: ['blossom', 'sky-jade'],
    rewardXp: 4,
    bondDelta: 1,
    lesson: 'Reflects calm and sky-born techniques into a readable no-injury trial rhythm.'
  },
  {
    id: 'silk-cinder-trial',
    name: 'Silk Cinder Trial',
    title: 'Market Spark Reflection',
    affinity: 'silk-cinder',
    baseFocus: 18,
    favoredAffinities: ['citrus-gold', 'blossom'],
    rewardXp: 6,
    bondDelta: 1,
    lesson: 'Rewards bright feints and generous timing without damage, wagers, or real value.'
  }
];

export const SPIRIT_BATTLE_TACTICS: readonly SpiritBattleTactic[] = [
  {
    id: 'lantern-anchor',
    name: 'Lantern Anchor Form',
    stance: 'anchor',
    preferredRoles: ['guardian'],
    favoredAffinities: ['blossom'],
    recommendedMoveId: SPIRIT_MOVES.lanternPulse.id,
    masteryXp: 5,
    bondDelta: 1,
    lesson: 'Plants a warm lantern stance so a companion can defend friends before striking.'
  },
  {
    id: 'goldleaf-opening',
    name: 'Goldleaf Opening Form',
    stance: 'feint',
    preferredRoles: ['trickster'],
    favoredAffinities: ['citrus-gold'],
    recommendedMoveId: SPIRIT_MOVES.goldleafFeint.id,
    masteryXp: 6,
    bondDelta: 1,
    lesson: 'Reads the first market-path beat and turns a bright side-step into clean initiative.'
  },
  {
    id: 'skybell-ward',
    name: 'Skybell Ward Form',
    stance: 'ward',
    preferredRoles: ['scout', 'guardian'],
    favoredAffinities: ['sky-jade'],
    recommendedMoveId: SPIRIT_MOVES.skybellGuard.id,
    masteryXp: 5,
    bondDelta: 1,
    lesson: 'Listens for the bell before motion, keeping the whole party in a safe scouting rhythm.'
  }
];

export const SPIRIT_TECHNIQUE_LOADOUTS: readonly SpiritTechniqueLoadout[] = [
  {
    id: 'jade-step-loadout',
    name: 'Jade Step Loadout',
    title: 'First Three-Spirit Move Loadout',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredTechniqueXp: 7,
    requiredTacticId: SPIRIT_BATTLE_TACTICS[1].id,
    requiredScore: 22,
    rewardItemId: ALPHA_ITEMS.loadoutSlip.id,
    summary: 'A no-real-value battle preparation proof that assigns one original Mochirii move to each first-court spirit before team trials.'
  }
];

export const SPIRIT_TECHNIQUE_CODEXES: readonly SpiritTechniqueCodex[] = [
  {
    id: 'jade-technique-codex',
    name: 'Jade Technique Codex',
    title: 'First-Court Move Library',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredMoveIds: [SPIRIT_MOVES.lanternPulse.id, SPIRIT_MOVES.goldleafFeint.id, SPIRIT_MOVES.skybellGuard.id],
    requiredLoadoutId: SPIRIT_TECHNIQUE_LOADOUTS[0].id,
    requiredTacticIds: SPIRIT_BATTLE_TACTICS.map((tactic) => tactic.id),
    requiredTechniqueXp: 18,
    requiredTrainingXp: 3,
    requiredScore: 46,
    rewardItemId: ALPHA_ITEMS.techniqueCodexSeal.id,
    summary: 'A no-real-value party move-library proof for testers who record each first-court spirit technique, tactic stance, loadout, training, journal, and no-injury battle evidence.'
  }
];

export const SPIRIT_TRAIT_ATTUNEMENTS: readonly SpiritTraitAttunement[] = [
  {
    id: 'jade-heart-trait',
    name: 'Jade Heart Trait Attunement',
    title: 'First Mochirii Party Trait',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredLoadoutId: SPIRIT_TECHNIQUE_LOADOUTS[0].id,
    requiredBond: 3,
    requiredCareStreak: 1,
    requiredScore: 31,
    rewardItemId: ALPHA_ITEMS.traitThread.id,
    traitBySpiritId: {
      lirabao: 'Lanternhearted Guard',
      jintari: 'Goldleaf Quickstep',
      aozhen: 'Skybell Wayfinder'
    },
    summary: 'A no-real-value raising and battle identity proof that gives each first-court Mochi Spirit one original Mochirii trait after care, growth, loadout, mentor, and battle readiness.'
  }
];

export const SPIRIT_BATTLE_CONDITIONS: readonly SpiritBattleCondition[] = [
  {
    id: 'lantern-ward',
    name: 'Lantern Ward',
    title: 'Blossom Guard Condition',
    spiritId: 'lirabao',
    moveId: SPIRIT_MOVES.lanternPulse.id,
    affinity: 'blossom',
    role: 'guardian',
    focusBonus: 3,
    effect: 'Guards the party focus rhythm without damage or injury.'
  },
  {
    id: 'goldleaf-tempo',
    name: 'Goldleaf Tempo',
    title: 'Citrus Initiative Condition',
    spiritId: 'jintari',
    moveId: SPIRIT_MOVES.goldleafFeint.id,
    affinity: 'citrus-gold',
    role: 'trickster',
    focusBonus: 3,
    effect: 'Reads turn-order cues as bright movement timing without harm.'
  },
  {
    id: 'skybell-guard',
    name: 'Skybell Guard',
    title: 'Sky-Jade Stability Condition',
    spiritId: 'aozhen',
    moveId: SPIRIT_MOVES.skybellGuard.id,
    affinity: 'sky-jade',
    role: 'scout',
    focusBonus: 4,
    effect: 'Keeps the formation steady with a soft focus barrier instead of injury.'
  }
];

export const SPIRIT_CONDITION_WEAVES: readonly SpiritConditionWeave[] = [
  {
    id: 'jade-mirror-condition-weave',
    name: 'Jade Mirror Condition Weave',
    title: 'First Non-Injury Condition Weave',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredConditionIds: SPIRIT_BATTLE_CONDITIONS.map((condition) => condition.id),
    requiredLoadoutId: SPIRIT_TECHNIQUE_LOADOUTS[0].id,
    requiredTraitId: SPIRIT_TRAIT_ATTUNEMENTS[0].id,
    requiredMentorChallengeId: SPIRIT_MENTOR_CHALLENGES[0].id,
    requiredSparWins: 1,
    requiredTrainingXp: 3,
    requiredScore: 34,
    rewardItemId: ALPHA_ITEMS.conditionCharm.id,
    summary: 'A no-real-value battle condition proof for testers who can coordinate a full Mochirii party, traits, move loadout, mentor readiness, and local social signals without injury.'
  }
];

export const SPIRIT_AFFINITY_MATRICES: readonly SpiritAffinityMatrix[] = [
  {
    id: 'jade-affinity-matrix',
    name: 'Jade Affinity Matrix',
    title: 'First Three-Spirit Matchup Matrix',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredAffinityLabels: Array.from(new Set(MOCHI_SPIRITS.map((spirit) => spirit.affinity))),
    requiredConditionIds: SPIRIT_BATTLE_CONDITIONS.map((condition) => condition.id),
    requiredTrialId: SPIRIT_AFFINITY_TRIALS[1].id,
    requiredLoadoutId: SPIRIT_TECHNIQUE_LOADOUTS[0].id,
    requiredTraitId: SPIRIT_TRAIT_ATTUNEMENTS[0].id,
    requiredWeaveId: SPIRIT_CONDITION_WEAVES[0].id,
    requiredSparWins: 1,
    requiredTrainingXp: 3,
    requiredScore: 44,
    rewardItemId: ALPHA_ITEMS.affinityMatrixSeal.id,
    summary: 'A no-real-value combat-planning proof for testers who map the first-court affinities, conditions, traits, move loadout, and no-injury battle evidence before brackets and rival bouts.'
  }
];

export const SPIRIT_BATTLE_KITS: readonly SpiritBattleKit[] = [
  {
    id: 'jade-battle-kit',
    name: 'Jade Battle Kit',
    title: 'First-Court Safe Battle Item Kit',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredPartySize: MOCHI_SPIRIT_PARTY_LIMIT,
    requiredItemIds: [ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.charm.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredProvisionCatalogId: SPIRIT_PROVISION_CATALOGS[0].id,
    requiredTechniqueCodexId: SPIRIT_TECHNIQUE_CODEXES[0].id,
    requiredConditionWeaveId: SPIRIT_CONDITION_WEAVES[0].id,
    requiredAffinityMatrixId: SPIRIT_AFFINITY_MATRICES[0].id,
    requiredRecoveryTeaId: SPIRIT_RECOVERY_TEAS[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 48,
    rewardItemId: ALPHA_ITEMS.battleKitTag.id,
    summary: 'A no-real-value first-court battle item kit proof for testers who connect provision catalog recipes, prepared lures, care supplies, technique codex planning, condition weave safety, affinity matrix strategy, recovery tea, and a winning no-injury round.'
  }
];

export const SPIRIT_REMEDY_POUCHES: readonly SpiritRemedyPouch[] = [
  {
    id: 'jade-remedy-pouch',
    name: 'Jade Remedy Pouch',
    title: 'First-Court Remedy And Status Care Pouch',
    habitat: SPIRIT_HABITATS.jadeLanternCourt,
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredPartySize: MOCHI_SPIRIT_PARTY_LIMIT,
    requiredConditionIds: SPIRIT_BATTLE_CONDITIONS.map((condition) => condition.id),
    requiredItemIds: [ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.charm.id, ALPHA_ITEMS.mooncakeBox.id],
    requiredRecoveryTeaId: SPIRIT_RECOVERY_TEAS[0].id,
    requiredBattleKitId: SPIRIT_BATTLE_KITS[0].id,
    requiredCareCycleId: SPIRIT_CARE_CYCLES[0].id,
    requiredSanctuaryRiteId: SPIRIT_SANCTUARY_RITES[0].id,
    requiredPresenceCount: 2,
    requiredChatLines: 1,
    requiredScore: 50,
    rewardItemId: ALPHA_ITEMS.remedyPouchTag.id,
    summary: 'A no-real-value first-court remedy pouch proof for testers who connect status conditions, care items, recovery tea, battle kit safety, sanctuary restoration, and a winning no-injury round.'
  }
];

export const SPIRIT_RELIC_ATTUNEMENTS: readonly SpiritRelicAttunement[] = [
  {
    id: 'jade-relic-attunement',
    name: 'Jade Relic Attunement',
    title: 'First Three-Spirit Held Charm',
    requiredSpiritIds: MOCHI_SPIRITS.map((spirit) => spirit.id),
    requiredItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.provisionSatchel.id],
    requiredLoadoutId: SPIRIT_TECHNIQUE_LOADOUTS[0].id,
    requiredTechniqueCodexId: SPIRIT_TECHNIQUE_CODEXES[0].id,
    requiredTraitId: SPIRIT_TRAIT_ATTUNEMENTS[0].id,
    requiredConditionWeaveId: SPIRIT_CONDITION_WEAVES[0].id,
    requiredAffinityMatrixId: SPIRIT_AFFINITY_MATRICES[0].id,
    requiredCraftWritId: SPIRIT_CRAFT_WRITS[0].id,
    requiredExchangeAccordId: TRADE_EXCHANGE_ACCORDS[0].id,
    requiredPresenceCount: 2,
    requiredScore: 57,
    rewardItemId: ALPHA_ITEMS.relicSilkCord.id,
    relicLabelBySpiritId: {
      lirabao: 'Lantern Jade Cord',
      jintari: 'Goldleaf Silk Cord',
      aozhen: 'Skybell Thread Cord'
    },
    summary: 'A no-real-value held-charm proof for testers who connect original Mochirii items, craft, exchange, care, traits, conditions, affinity planning, and two-tester social readiness before summit and guild capstones.'
  }
];

export const RUNTIME_ASSET_MANIFEST: RuntimeAssetManifest = {
  tileSize: 64,
  tilesheet: {
    path: 'src/tiled/mochi-tiles.png',
    width: 512,
    height: 192
  },
  spritesheets: [
    'wayfarer',
    'sifu-narao',
    'chest',
    'spirit-lirabao',
    'spirit-jintari',
    'spirit-aozhen',
    'habitat-grove',
    'party-banner',
    'journal-pavilion',
    'expedition-gate',
    'route-invitation-altar',
    'technique-dojo',
    'tactic-scroll-stand',
    'affinity-dais',
    'market-board',
    'trade-post',
    'training-ring',
    'quest-board',
    'guild-rank-bell',
    'growth-moonwell',
    'canary-shrine'
  ].map((id) => ({
    path: `public/spritesheets/${id}.png`,
    width: 384,
    height: 768,
    framesWidth: 3,
    framesHeight: 4,
    rectWidth: 128,
    rectHeight: 192
  }))
};

export function growthStageFromBond(bond: number): SpiritGrowthStage {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
}

const GROWTH_STAGE_ORDER: Record<SpiritGrowthStage, number> = {
  seed: 0,
  sprout: 1,
  glow: 2
};

function normalizeSpiritGrowth(growth: SpiritGrowthStage | string | undefined, bond: number): SpiritGrowthStage {
  return ['seed', 'sprout', 'glow'].includes(String(growth))
    ? (growth as SpiritGrowthStage)
    : growthStageFromBond(bond);
}

export function techniqueMasteryLevelFromXp(xp: number): SpiritTechniqueMasteryLevel {
  if (xp >= 18) return 'adept';
  if (xp >= 7) return 'practiced';
  return 'novice';
}

export function getMochiSpirit(spiritId: string) {
  return MOCHI_SPIRITS.find((spirit) => spirit.id === spiritId);
}

export function resolveSpiritBondMilestone(
  spiritId: string,
  bond = 0,
  growth?: SpiritGrowthStage | string
): SpiritBondMilestoneResult {
  const spirit = getMochiSpirit(spiritId);
  const boundedBond = Math.max(0, Math.min(5, Math.floor(bond || 0)));
  const resolvedGrowth = normalizeSpiritGrowth(growth, boundedBond);

  if (!spirit) {
    return {
      ok: false,
      spiritId,
      spiritName: 'Unknown Mochi Spirit',
      bond: boundedBond,
      growth: resolvedGrowth,
      message: 'No Mochirii spirit profile exists for this bond milestone.',
      source: 'spirit-bond-milestone'
    };
  }

  const reached = spirit.bondMilestones.filter((milestone) => {
    return boundedBond >= milestone.requiredBond && GROWTH_STAGE_ORDER[resolvedGrowth] >= GROWTH_STAGE_ORDER[milestone.requiredGrowth];
  });
  const milestone = reached[reached.length - 1];
  const nextMilestone = spirit.bondMilestones.find((candidate) => candidate.id !== milestone?.id && !reached.includes(candidate));

  return {
    ok: Boolean(milestone),
    spiritId: spirit.id,
    spiritName: spirit.name,
    bond: boundedBond,
    growth: resolvedGrowth,
    milestone,
    nextMilestone,
    message: milestone
      ? `${spirit.name} holds ${milestone.label}: ${milestone.summary}`
      : `${spirit.name} has not opened a bond milestone yet. ${spirit.bondMilestones[0]?.roleplayPrompt || 'Offer care in Jade Lantern Court.'}`,
    source: 'spirit-bond-milestone'
  };
}

export function resolveSpiritAttunement(spiritId: string, offeredItemId: string): SpiritAttunementResult {
  const spirit = getMochiSpirit(spiritId);
  if (!spirit) {
    return {
      ok: false,
      spiritId,
      message: 'No Mochirii spirit profile exists for this attunement.',
      bond: 0,
      growth: 'seed',
      source: 'spirit-attune'
    };
  }

  const ok = offeredItemId === spirit.attunement.lureItemId;
  return {
    ok,
    spiritId,
    message: ok
      ? `${spirit.name} accepts the ${spirit.attunement.label} and joins your Mochirii roster.`
      : `${spirit.name} watches kindly, but this attunement needs ${spirit.attunement.lureItemId}.`,
    bond: ok ? 1 : 0,
    growth: 'seed',
    source: 'spirit-attune'
  };
}

export function resolveSpiritCapture(spiritId: string, offeredItemId: string, harmonyScore = 1, roster: readonly string[] = []): SpiritCaptureResult {
  const spirit = getMochiSpirit(spiritId);
  if (!spirit) {
    return {
      ok: false,
      alreadyRostered: false,
      spiritId,
      message: 'No Mochirii spirit profile exists for this invitation encounter.',
      bond: 0,
      growth: 'seed',
      source: 'spirit-capture'
    };
  }

  if (roster.includes(spirit.id)) {
    return {
      ok: true,
      alreadyRostered: true,
      spiritId: spirit.id,
      message: `${spirit.name} already trusts your Mochirii roster and returns to the habitat grove willingly.`,
      bond: 1,
      growth: 'seed',
      source: 'spirit-capture'
    };
  }

  const lureOk = offeredItemId === spirit.capture.lureItemId;
  const harmonyOk = Math.max(0, Math.floor(harmonyScore)) >= spirit.capture.harmonyRequired;
  const ok = lureOk && harmonyOk;

  return {
    ok,
    alreadyRostered: false,
    spiritId: spirit.id,
    message: ok
      ? `${spirit.name} accepts the ${spirit.capture.invitationLabel} and joins your Mochirii roster.`
      : `${spirit.name} notices the grove, but this invitation needs ${spirit.capture.lureItemId} and harmony ${spirit.capture.harmonyRequired}.`,
    bond: ok ? 1 : 0,
    growth: 'seed',
    source: 'spirit-capture'
  };
}

export function resolveSpiritStarterVow(
  progress: SpiritStarterVowProgress,
  vowId: string = SPIRIT_STARTER_VOWS[0].id
): SpiritStarterVowResult {
  const vow = SPIRIT_STARTER_VOWS.find((entry) => entry.id === vowId) || SPIRIT_STARTER_VOWS[0];
  const requiredSpiritIds = new Set(vow.requiredSpiritIds);
  const selectedSpirit = getMochiSpirit(String(progress.selectedSpiritId || vow.requiredSpiritIds[0]));
  const selectedSpiritId = selectedSpirit && requiredSpiritIds.has(selectedSpirit.id) ? selectedSpirit.id : '';
  const itemIds = Array.from(new Set(progress.itemIds.filter(Boolean))).filter((itemId) => itemId === vow.requiredItemId);
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (!selectedSpiritId) missing.push('starter-spirit');
  if (!itemIds.includes(vow.requiredItemId)) missing.push(`item:${vow.requiredItemId}`);
  if (localPresenceCount < vow.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${vow.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    (selectedSpiritId ? 6 : 0) +
    (itemIds.includes(vow.requiredItemId) ? 4 : 0) +
    Math.min(localPresenceCount, vow.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 2 : 0) +
    (progress.guildBuddyProof ? 2 : 0) +
    (statusReady ? 2 : 0) +
    (chatLines.length ? 2 : 0);
  const vowed = missing.length === 0 && score >= vow.requiredScore;
  const selectedSpiritName = selectedSpirit?.name || 'Unchosen spirit';
  const vowLabel = (selectedSpiritId && vow.vowLabelBySpiritId[selectedSpiritId]) || vow.name;

  return {
    ok: true,
    vowed,
    vowId: vow.id,
    vowName: vow.name,
    title: vow.title,
    habitat: vow.habitat,
    selectedSpiritId,
    selectedSpiritName,
    vowLabel,
    itemIds,
    localPresenceCount,
    score,
    requiredScore: vow.requiredScore,
    missing,
    rewardItemId: vow.rewardItemId,
    message: vowed
      ? `${vow.name} complete: ${selectedSpiritName} accepts the ${vowLabel} as first-companion proof for closed-alpha Mochirii play. No real value.`
      : `${vow.name} needs ${missing.join(', ')} before the first companion vow can be recorded.`,
    source: 'spirit-starter-vow'
  };
}

export function resolveSpiritCaptureRite(
  progress: SpiritCaptureRiteProgress,
  riteId: string = SPIRIT_CAPTURE_RITES[0].id
): SpiritCaptureRiteResult {
  const rite = SPIRIT_CAPTURE_RITES.find((entry) => entry.id === riteId) || SPIRIT_CAPTURE_RITES[0];
  const requiredSpiritIds = new Set(rite.requiredSpiritIds);
  const requiredRouteInviteSpiritIds = new Set(rite.requiredRouteInviteSpiritIds);
  const requiredLureItemIds = new Set(rite.requiredLureItemIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const capturedSpiritIds = Array.from(new Set(progress.capturedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const routeInvitedSpiritIds = Array.from(new Set(progress.routeInvitedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredRouteInviteSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const lureItemIds = Array.from(new Set(progress.lureItemIds.filter(Boolean))).filter((itemId) => requiredLureItemIds.has(itemId));
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const noInjuryReady = progress.battleRoundProof && progress.battleRoundVictory;
  const missing: string[] = [];

  if (roster.length < rite.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${rite.requiredSpiritIds.length}`);
  if (capturedSpiritIds.length < rite.requiredSpiritIds.length) missing.push(`captured:${capturedSpiritIds.length}/${rite.requiredSpiritIds.length}`);
  if (routeInvitedSpiritIds.length < rite.requiredRouteInviteSpiritIds.length) {
    missing.push(`route-invites:${routeInvitedSpiritIds.length}/${rite.requiredRouteInviteSpiritIds.length}`);
  }
  if (lureItemIds.length < rite.requiredLureItemIds.length) missing.push(`lures:${lureItemIds.length}/${rite.requiredLureItemIds.length}`);
  if (journalDiscoveredCount < rite.requiredJournalCount) missing.push(`journal:${journalDiscoveredCount}/${rite.requiredJournalCount}`);
  if (localPresenceCount < rite.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${rite.requiredPresenceCount}`);
  if (!progress.captureProof) missing.push('capture-proof');
  if (!progress.routeInviteProof) missing.push('route-invite-proof');
  if (!progress.fieldAccordProof) missing.push('field-accord');
  if (!noInjuryReady) missing.push('no-injury-battle');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, rite.requiredSpiritIds.length) * 2 +
    Math.min(capturedSpiritIds.length, rite.requiredSpiritIds.length) * 3 +
    Math.min(routeInvitedSpiritIds.length, rite.requiredRouteInviteSpiritIds.length) * 2 +
    Math.min(lureItemIds.length, rite.requiredLureItemIds.length) * 2 +
    Math.min(journalDiscoveredCount, rite.requiredJournalCount) * 2 +
    Math.min(localPresenceCount, rite.requiredPresenceCount) * 2 +
    (progress.captureProof ? 4 : 0) +
    (progress.routeInviteProof ? 3 : 0) +
    (progress.fieldAccordProof ? 3 : 0) +
    (noInjuryReady ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const recorded = missing.length === 0 && score >= rite.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    recorded,
    riteId: rite.id,
    riteName: rite.name,
    title: rite.title,
    habitat: rite.habitat,
    roster,
    capturedSpiritIds,
    routeInvitedSpiritIds,
    lureItemIds,
    journalDiscoveredCount,
    localPresenceCount,
    score,
    requiredScore: rite.requiredScore,
    missing,
    rewardItemId: rite.rewardItemId,
    message: recorded
      ? `${rite.name} recorded: ${rosterNames} completed lure choice, consent invitations, route accord, no-injury battle rhythm, journal study, and nearby social witness proof. No real value.`
      : `${rite.name} needs ${missing.join(', ')} before the first-court capture rite can be recorded.`,
    source: 'spirit-capture-rite'
  };
}

export function resolveSpiritExpedition(
  routeId: string = SPIRIT_EXPEDITION_ROUTES[0].id,
  roster: readonly string[] = [],
  activeSpiritId?: string,
  harmonyScore = 1,
  discoveredRoutes: readonly string[] = []
): SpiritExpeditionResult {
  const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === routeId) || SPIRIT_EXPEDITION_ROUTES[0];
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  const activeId = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const activeSpirit = activeId ? getMochiSpirit(activeId) : undefined;
  const boundedHarmony = Math.max(0, Math.floor(harmonyScore));
  const priorRoutes = Array.from(new Set(discoveredRoutes.filter(Boolean)));

  if (!activeSpirit) {
    return {
      ok: false,
      routeId: route.id,
      routeName: route.name,
      encounterSpiritId: route.encounterSpiritId,
      recommendedItemId: route.recommendedItemId,
      rewardItemId: route.rewardItemId,
      harmonyScore: boundedHarmony,
      discoveredRoutes: priorRoutes,
      message: 'Attune with a Mochi Spirit before scouting a Mochirii field route.',
      source: 'world-expedition'
    };
  }

  if (boundedHarmony < route.requiredHarmony) {
    return {
      ok: false,
      routeId: route.id,
      routeName: route.name,
      encounterSpiritId: route.encounterSpiritId,
      recommendedItemId: route.recommendedItemId,
      rewardItemId: route.rewardItemId,
      harmonyScore: boundedHarmony,
      discoveredRoutes: priorRoutes,
      message: `${route.name} needs harmony ${route.requiredHarmony}. Care for ${activeSpirit.name}, form a party, or return after more guild practice.`,
      source: 'world-expedition'
    };
  }

  const discovered = Array.from(new Set([...priorRoutes, route.id]));
  const encounterSpirit = getMochiSpirit(route.encounterSpiritId);

  return {
    ok: true,
    routeId: route.id,
    routeName: route.name,
    encounterSpiritId: route.encounterSpiritId,
    recommendedItemId: route.recommendedItemId,
    rewardItemId: route.rewardItemId,
    harmonyScore: boundedHarmony,
    discoveredRoutes: discovered,
    message: `${activeSpirit.name} scouts the ${route.name} and records ${encounterSpirit?.name || route.encounterSpiritId} signs. Bring ${route.recommendedItemId} for the next invitation. ${route.routeNote}`,
    source: 'world-expedition'
  };
}

export function resolveSpiritRouteMastery(
  progress: SpiritRouteMasteryProgress,
  masteryId: string = SPIRIT_ROUTE_MASTERIES[0].id
): SpiritRouteMasteryResult {
  const mastery = SPIRIT_ROUTE_MASTERIES.find((entry) => entry.id === masteryId) || SPIRIT_ROUTE_MASTERIES[0];
  const discoveredRoutes = new Set(progress.discoveredRoutes.filter(Boolean));
  const roster = new Set(progress.roster.filter((spiritId) => Boolean(getMochiSpirit(spiritId))));
  const completedQuestIds = new Set(progress.completedQuestIds.filter(Boolean));
  const missing: string[] = [];

  for (const routeId of mastery.requiredRouteIds) {
    if (!discoveredRoutes.has(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  if (roster.size < mastery.requiredSpiritCount) {
    missing.push(`spirits:${roster.size}/${mastery.requiredSpiritCount}`);
  }

  if (Math.max(0, Math.floor(progress.journalDiscoveredCount)) < mastery.requiredJournalCount) {
    missing.push(`journal:${Math.max(0, Math.floor(progress.journalDiscoveredCount))}/${mastery.requiredJournalCount}`);
  }

  for (const questId of mastery.requiredQuestIds) {
    if (!completedQuestIds.has(questId)) {
      missing.push(`quest:${questId}`);
    }
  }

  if (!progress.guildRankProof || progress.rankTrialId !== mastery.requiredRankTrialId) {
    missing.push(`rank:${mastery.requiredRankTrialId}`);
  }

  const score =
    Math.min(discoveredRoutes.size, mastery.requiredRouteIds.length) * 3 +
    Math.min(roster.size, mastery.requiredSpiritCount) * 2 +
    Math.min(Math.max(0, Math.floor(progress.journalDiscoveredCount)), mastery.requiredJournalCount) +
    Math.min(completedQuestIds.size, mastery.requiredQuestIds.length) +
    (progress.guildRankProof && progress.rankTrialId === mastery.requiredRankTrialId ? 3 : 0);
  const requiredScore = mastery.requiredRouteIds.length * 3 + mastery.requiredSpiritCount * 2 + mastery.requiredJournalCount + mastery.requiredQuestIds.length + 3;
  const mastered = missing.length === 0 && score >= requiredScore;

  return {
    ok: true,
    mastered,
    masteryId: mastery.id,
    title: mastery.title,
    score,
    requiredScore,
    missing,
    rewardItemId: mastery.rewardItemId,
    message: mastered
      ? `${mastery.title} mastered: all first-circuit Mochirii routes, spirits, journal records, quest postings, and Jade Court rank proof are complete.`
      : `${mastery.title} needs ${missing.join(', ')} before field mastery can be recorded.`,
    source: 'world-route-mastery'
  };
}

export function resolveSpiritHabitatBond(
  progress: SpiritHabitatBondProgress,
  bondId: string = SPIRIT_HABITAT_BONDS[0].id
): SpiritHabitatBondResult {
  const bond = SPIRIT_HABITAT_BONDS.find((entry) => entry.id === bondId) || SPIRIT_HABITAT_BONDS[0];
  const requiredSpiritIds = new Set(bond.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const missing: string[] = [];

  for (const spiritId of bond.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < bond.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${bond.requiredJournalCount}`);
  }

  if (!progress.careProof) {
    missing.push('care');
  }

  if (!progress.profileViewed) {
    missing.push('profile');
  }

  if (!progress.guildBuddyProof) {
    missing.push('guild-buddy');
  }

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const boundedBond = Math.max(0, Math.min(5, Math.floor(progress.bond || 0)));
  const growth = ['seed', 'sprout', 'glow'].includes(String(progress.growth))
    ? (progress.growth as SpiritGrowthStage)
    : growthStageFromBond(boundedBond);
  const score =
    Math.min(roster.length, bond.requiredSpiritIds.length) * 2 +
    Math.min(journalCount, bond.requiredJournalCount) +
    (progress.careProof ? 3 : 0) +
    Math.min(boundedBond, 3) +
    (growth === 'glow' ? 1 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0);
  const bonded = missing.length === 0 && score >= bond.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'your Mochi Spirit';

  return {
    ok: true,
    bonded,
    bondId: bond.id,
    bondName: bond.name,
    title: bond.title,
    habitat: bond.habitat,
    activeSpiritId,
    roster,
    score,
    requiredScore: bond.requiredScore,
    missing,
    rewardItemId: bond.rewardItemId,
    message: bonded
      ? `${bond.name} recorded: ${activeName} and the first-court roster settle into ${bond.habitat} with journal, care, guild, status, and profile proof.`
      : `${bond.name} needs ${missing.join(', ')} before the shared habitat bond can be recorded.`,
    source: 'spirit-habitat-bond'
  };
}

export function resolveSpiritSanctuaryRite(
  progress: SpiritSanctuaryRiteProgress,
  riteId: string = SPIRIT_SANCTUARY_RITES[0].id
): SpiritSanctuaryRiteResult {
  const rite = SPIRIT_SANCTUARY_RITES.find((entry) => entry.id === riteId) || SPIRIT_SANCTUARY_RITES[0];
  const requiredSpiritIds = new Set(rite.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && partyIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || roster[0];
  const missing: string[] = [];

  for (const spiritId of rite.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`spirit:${spiritId}`);
    if (!partyIds.includes(spiritId)) missing.push(`party:${spiritId}`);
  }

  const totalBond = partyIds.reduce((sum, spiritId) => {
    const bond = Number(progress.bondBySpiritId?.[spiritId] ?? 0);
    return sum + Math.max(0, Math.min(5, Math.floor(bond)));
  }, 0);
  if (totalBond < 9) {
    missing.push(`bond:${totalBond}/9`);
  }

  const careStreak = Math.max(0, Math.floor(progress.careStreak || 0));
  if (careStreak < rite.requiredCareStreak) {
    missing.push(`care-streak:${careStreak}/${rite.requiredCareStreak}`);
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < rite.requiredTrainingXp) {
    missing.push(`training-xp:${trainingXp}/${rite.requiredTrainingXp}`);
  }

  if (!progress.habitatBondProof) missing.push('habitat-bond');
  if (!progress.conditionWeaveProof) missing.push('condition-weave');
  if (!progress.battleRoundProof || !progress.battleRoundVictory) missing.push('battle-round');

  const score =
    Math.min(roster.length, rite.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, rite.requiredSpiritIds.length) * 2 +
    Math.min(totalBond, 9) +
    Math.min(careStreak, 2) * 2 +
    Math.min(trainingXp, rite.requiredTrainingXp) +
    (progress.habitatBondProof ? 3 : 0) +
    (progress.conditionWeaveProof ? 2 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory ? 2 : 0);
  const restored = missing.length === 0 && score >= rite.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'the first-court party';

  return {
    ok: true,
    restored,
    riteId: rite.id,
    riteName: rite.name,
    title: rite.title,
    habitat: rite.habitat,
    activeSpiritId,
    roster,
    partyIds,
    totalBond,
    careStreak,
    trainingXp,
    score,
    requiredScore: rite.requiredScore,
    missing,
    rewardItemId: rite.rewardItemId,
    message: restored
      ? `${rite.name} complete: ${activeName} restores the party at the care shrine with habitat, care, training, condition, and no-injury battle proof. No real value.`
      : `${rite.name} needs ${missing.join(', ')} before the care-shrine restoration proof can be recorded.`,
    source: 'spirit-sanctuary-rite'
  };
}

export function resolveSpiritResearchFolio(
  progress: SpiritResearchFolioProgress,
  folioId: string = SPIRIT_RESEARCH_FOLIOS[0].id
): SpiritResearchFolioResult {
  const folio = SPIRIT_RESEARCH_FOLIOS.find((entry) => entry.id === folioId) || SPIRIT_RESEARCH_FOLIOS[0];
  const requiredSpiritIds = new Set(folio.requiredSpiritIds);
  const requiredRouteIds = new Set(folio.requiredRouteIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const discoveredRoutes = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const missing: string[] = [];

  for (const spiritId of folio.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const routeId of folio.requiredRouteIds) {
    if (!discoveredRoutes.includes(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < folio.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${folio.requiredJournalCount}`);
  }

  const habitatReady = progress.habitatBondProof && progress.habitatBondId === folio.requiredHabitatBondId;
  if (!habitatReady) {
    missing.push(`habitat:${folio.requiredHabitatBondId}`);
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (!progress.techniqueProof) {
    missing.push('technique');
  }

  if (!progress.tacticProof) {
    missing.push('tactic');
  }

  if (!progress.affinityProof) {
    missing.push('affinity');
  }

  if (trainingXp < 1) {
    missing.push('training');
  }

  const score =
    Math.min(roster.length, folio.requiredSpiritIds.length) * 2 +
    Math.min(discoveredRoutes.length, folio.requiredRouteIds.length) * 2 +
    Math.min(journalCount, folio.requiredJournalCount) +
    (habitatReady ? 3 : 0) +
    (progress.techniqueProof ? 1 : 0) +
    (progress.tacticProof ? 1 : 0) +
    (progress.affinityProof ? 1 : 0) +
    Math.min(trainingXp, 1);
  const recorded = missing.length === 0 && score >= folio.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'your Mochi Spirit';

  return {
    ok: true,
    recorded,
    folioId: folio.id,
    folioName: folio.name,
    title: folio.title,
    habitat: folio.habitat,
    activeSpiritId,
    roster,
    discoveredRoutes,
    score,
    requiredScore: folio.requiredScore,
    missing,
    rewardItemId: folio.rewardItemId,
    message: recorded
      ? `${folio.name} recorded: ${activeName} anchors a full first-court research folio with roster, routes, journal, habitat, technique, tactic, affinity, and training proof.`
      : `${folio.name} needs ${missing.join(', ')} before the first Mochirii field guide can be recorded.`,
    source: 'spirit-research-folio'
  };
}

export function resolveSpiritCompendiumCompletion(
  progress: SpiritCompendiumProgress,
  compendiumId: string = SPIRIT_COMPENDIUMS[0].id
): SpiritCompendiumResult {
  const compendium = SPIRIT_COMPENDIUMS.find((entry) => entry.id === compendiumId) || SPIRIT_COMPENDIUMS[0];
  const requiredSpiritIds = new Set(compendium.requiredSpiritIds);
  const requiredRouteIds = new Set(compendium.requiredRouteIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const discoveredRoutes = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const missing: string[] = [];

  for (const spiritId of compendium.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const routeId of compendium.requiredRouteIds) {
    if (!discoveredRoutes.includes(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < compendium.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${compendium.requiredJournalCount}`);
  }

  const habitatReady = progress.habitatBondProof && progress.habitatBondId === compendium.requiredHabitatBondId;
  if (!habitatReady) {
    missing.push(`habitat:${compendium.requiredHabitatBondId}`);
  }

  const researchReady = progress.researchProof && progress.researchFolioId === compendium.requiredResearchFolioId;
  if (!researchReady) {
    missing.push(`research:${compendium.requiredResearchFolioId}`);
  }

  if (!progress.routeMasteryProof) {
    missing.push('route-mastery');
  }

  const score =
    Math.min(roster.length, compendium.requiredSpiritIds.length) * 3 +
    Math.min(discoveredRoutes.length, compendium.requiredRouteIds.length) * 3 +
    Math.min(journalCount, compendium.requiredJournalCount) +
    (habitatReady ? 3 : 0) +
    (researchReady ? 5 : 0) +
    (progress.routeMasteryProof ? 3 : 0);
  const completed = missing.length === 0 && score >= compendium.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'the first-court roster';

  return {
    ok: true,
    completed,
    compendiumId: compendium.id,
    compendiumName: compendium.name,
    title: compendium.title,
    habitat: compendium.habitat,
    activeSpiritId,
    roster,
    discoveredRoutes,
    score,
    requiredScore: compendium.requiredScore,
    missing,
    rewardItemId: compendium.rewardItemId,
    message: completed
      ? `${compendium.name} complete: ${activeName} anchors all first-court Mochi Spirit records with roster, journal, route, habitat, and research proof. No-real-value collection progress only.`
      : `${compendium.name} needs ${missing.join(', ')} before the first-court species collection can be sealed.`,
    source: 'spirit-compendium'
  };
}

export function resolveSpiritRosterArchive(
  progress: SpiritRosterArchiveProgress,
  archiveId: string = SPIRIT_ROSTER_ARCHIVES[0].id
): SpiritRosterArchiveResult {
  const archive = SPIRIT_ROSTER_ARCHIVES.find((entry) => entry.id === archiveId) || SPIRIT_ROSTER_ARCHIVES[0];
  const requiredSpiritIds = new Set(archive.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return roster.includes(spiritId) && Boolean(getMochiSpirit(spiritId));
  }).slice(0, archive.requiredPartySize);
  const reserveSpiritIds = roster.filter((spiritId) => !partyIds.includes(spiritId));
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || roster[0];
  const missing: string[] = [];

  for (const spiritId of archive.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (partyIds.length < archive.requiredPartySize) {
    missing.push(`party:${partyIds.length}/${archive.requiredPartySize}`);
  }

  if (reserveSpiritIds.length < archive.requiredReserveCount) {
    missing.push(`reserve:${reserveSpiritIds.length}/${archive.requiredReserveCount}`);
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < archive.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${archive.requiredJournalCount}`);
  }

  const compendiumReady = progress.compendiumProof && progress.compendiumId === archive.requiredCompendiumId;
  if (!compendiumReady) {
    missing.push(`compendium:${archive.requiredCompendiumId}`);
  }

  const sanctuaryReady = progress.sanctuaryRiteProof && progress.sanctuaryRiteId === archive.requiredSanctuaryRiteId;
  if (!sanctuaryReady) {
    missing.push(`sanctuary:${archive.requiredSanctuaryRiteId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const score =
    Math.min(roster.length, archive.requiredSpiritIds.length) * 3 +
    Math.min(partyIds.length, archive.requiredPartySize) * 2 +
    Math.min(reserveSpiritIds.length, archive.requiredReserveCount) * 2 +
    Math.min(journalCount, archive.requiredJournalCount) +
    (compendiumReady ? 5 : 0) +
    (sanctuaryReady ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0);
  const archived = missing.length === 0 && score >= archive.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const reserveNames = reserveSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    archived,
    archiveId: archive.id,
    archiveName: archive.name,
    title: archive.title,
    habitat: archive.habitat,
    activeSpiritId,
    roster,
    partyIds,
    reserveSpiritIds,
    score,
    requiredScore: archive.requiredScore,
    missing,
    rewardItemId: archive.rewardItemId,
    message: archived
      ? `${archive.name} sealed: ${partyNames || 'the active party'} stands ready while ${reserveNames || 'the reserve roster'} rests in the guild archive with compendium and sanctuary proof. No real value.`
      : `${archive.name} needs ${missing.join(', ')} before the first spirit roster archive can be sealed.`,
    source: 'spirit-roster-archive'
  };
}

export function resolveSpiritRosterCabinet(
  progress: SpiritRosterCabinetProgress,
  cabinetId: string = SPIRIT_ROSTER_CABINETS[0].id
): SpiritRosterCabinetResult {
  const cabinet = SPIRIT_ROSTER_CABINETS.find((entry) => entry.id === cabinetId) || SPIRIT_ROSTER_CABINETS[0];
  const requiredSpiritIds = new Set(cabinet.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return roster.includes(spiritId) && Boolean(getMochiSpirit(spiritId));
  }).slice(0, cabinet.requiredPartySize);
  const reserveSpiritIds = roster.filter((spiritId) => !partyIds.includes(spiritId));
  const storageSlotLabels = Array.from(new Set(progress.storageSlotLabels.map((label) => String(label).trim()).filter(Boolean))).slice(0, cabinet.requiredStorageSlots);
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || roster[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of cabinet.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (partyIds.length < cabinet.requiredPartySize) missing.push(`party:${partyIds.length}/${cabinet.requiredPartySize}`);
  if (storageSlotLabels.length < cabinet.requiredStorageSlots) missing.push(`slots:${storageSlotLabels.length}/${cabinet.requiredStorageSlots}`);
  if (!progress.rosterArchiveProof || progress.rosterArchiveId !== cabinet.requiredArchiveId) missing.push(`archive:${cabinet.requiredArchiveId}`);
  if (!progress.compendiumProof || progress.compendiumId !== cabinet.requiredCompendiumId) missing.push(`compendium:${cabinet.requiredCompendiumId}`);
  if (!progress.nurseryGroveProof || progress.nurseryGroveId !== cabinet.requiredNurseryGroveId) missing.push(`nursery:${cabinet.requiredNurseryGroveId}`);
  if (!progress.lineageRegisterProof || progress.lineageRegisterId !== cabinet.requiredLineageRegisterId) missing.push(`lineage:${cabinet.requiredLineageRegisterId}`);
  if (localPresenceCount < 2) missing.push(`presence:${localPresenceCount}/2`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, cabinet.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, cabinet.requiredPartySize) * 2 +
    Math.min(storageSlotLabels.length, cabinet.requiredStorageSlots) * 2 +
    (progress.rosterArchiveProof && progress.rosterArchiveId === cabinet.requiredArchiveId ? 4 : 0) +
    (progress.compendiumProof && progress.compendiumId === cabinet.requiredCompendiumId ? 2 : 0) +
    (progress.nurseryGroveProof && progress.nurseryGroveId === cabinet.requiredNurseryGroveId ? 3 : 0) +
    (progress.lineageRegisterProof && progress.lineageRegisterId === cabinet.requiredLineageRegisterId ? 3 : 0) +
    (localPresenceCount >= 2 ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const organized = missing.length === 0 && score >= cabinet.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const slotSummary = storageSlotLabels.join(', ');

  return {
    ok: true,
    organized,
    cabinetId: cabinet.id,
    cabinetName: cabinet.name,
    title: cabinet.title,
    habitat: cabinet.habitat,
    activeSpiritId,
    roster,
    partyIds,
    reserveSpiritIds,
    storageSlotLabels,
    localPresenceCount,
    score,
    requiredScore: cabinet.requiredScore,
    missing,
    rewardItemId: cabinet.rewardItemId,
    message: organized
      ? `${cabinet.name} organized: ${partyNames || 'the first-court party'} are filed across ${slotSummary || 'guild cabinet slots'} with archive, compendium, nursery, lineage, and social proof. No real value.`
      : `${cabinet.name} needs ${missing.join(', ')} before the first-court roster cabinet can be sealed.`,
    source: 'spirit-roster-cabinet'
  };
}

export function resolveSpiritProvisionSatchel(
  progress: SpiritProvisionSatchelProgress,
  satchelId: string = SPIRIT_PROVISION_SATCHELS[0].id
): SpiritProvisionSatchelResult {
  const satchel = SPIRIT_PROVISION_SATCHELS.find((entry) => entry.id === satchelId) || SPIRIT_PROVISION_SATCHELS[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return MOCHI_SPIRIT_QUESTS.some((quest) => quest.id === questId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const stockItemIds = satchel.stockItemIds.filter((itemId) => {
    return Object.values(ALPHA_ITEMS).some((item) => item.id === itemId);
  });
  const missing: string[] = [];

  if (roster.length < satchel.requiredRosterCount) {
    missing.push(`roster:${roster.length}/${satchel.requiredRosterCount}`);
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < satchel.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${satchel.requiredJournalCount}`);
  }

  if (!progress.marketProof) {
    missing.push('market-listing');
  }

  if (!progress.marketReceiptProof) {
    missing.push('market-receipt');
  }

  if (!progress.tradeProof) {
    missing.push('direct-trade');
  }

  if (!progress.routeInviteProof) {
    missing.push('route-invitation');
  }

  const careStreak = Math.max(0, Math.floor(progress.careStreak || 0));
  if (careStreak < satchel.requiredCareStreak) {
    missing.push(`care-streak:${careStreak}/${satchel.requiredCareStreak}`);
  }

  if (completedQuestIds.length < satchel.requiredCompletedQuestCount) {
    missing.push(`quests:${completedQuestIds.length}/${satchel.requiredCompletedQuestCount}`);
  }

  const score =
    stockItemIds.length * 2 +
    Math.min(roster.length, satchel.requiredRosterCount) * 2 +
    Math.min(journalCount, satchel.requiredJournalCount) +
    (progress.marketProof ? 3 : 0) +
    (progress.marketReceiptProof ? 3 : 0) +
    (progress.tradeProof ? 3 : 0) +
    (progress.routeInviteProof ? 2 : 0) +
    Math.min(careStreak, 2) +
    Math.min(completedQuestIds.length, satchel.requiredCompletedQuestCount) * 2;
  const stocked = missing.length === 0 && score >= satchel.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'the first-court roster';

  return {
    ok: true,
    stocked,
    satchelId: satchel.id,
    satchelName: satchel.name,
    title: satchel.title,
    habitat: satchel.habitat,
    activeSpiritId,
    roster,
    stockItemIds,
    completedQuestIds,
    score,
    requiredScore: satchel.requiredScore,
    missing,
    rewardItemId: satchel.rewardItemId,
    message: stocked
      ? `${satchel.name} stocked: ${activeName} carries original Mochirii lures, care provisions, market listing, receipt proof, trade proof, and quest supplies. No-real-value item preparation only.`
      : `${satchel.name} needs ${missing.join(', ')} before the first-court provision bag can be stocked.`,
    source: 'item-provision-satchel'
  };
}

export function resolveSpiritCareCycle(
  progress: SpiritCareCycleProgress,
  cycleId: string = SPIRIT_CARE_CYCLES[0].id
): SpiritCareCycleResult {
  const cycle = SPIRIT_CARE_CYCLES.find((entry) => entry.id === cycleId) || SPIRIT_CARE_CYCLES[0];
  const requiredSpiritIds = new Set(cycle.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const bondBySpiritId = progress.bondBySpiritId || {};
  const missing: string[] = [];

  for (const spiritId of cycle.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
      continue;
    }

    const bond = Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
    if (bond < cycle.requiredBondPerSpirit) {
      missing.push(`bond:${spiritId}:${bond}/${cycle.requiredBondPerSpirit}`);
    }
  }

  const careStreak = Math.max(0, Math.floor(progress.careStreak || 0));
  if (careStreak < cycle.requiredCareStreak) {
    missing.push(`care-streak:${careStreak}/${cycle.requiredCareStreak}`);
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < cycle.requiredTrainingXp) {
    missing.push(`training-xp:${trainingXp}/${cycle.requiredTrainingXp}`);
  }

  if (!progress.raisingProof) {
    missing.push('raising');
  }

  const archiveReady = progress.rosterArchiveProof && progress.rosterArchiveId === cycle.requiredRosterArchiveId;
  if (!archiveReady) {
    missing.push(`archive:${cycle.requiredRosterArchiveId}`);
  }

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === cycle.requiredProvisionSatchelId;
  if (!provisionReady) {
    missing.push(`provision:${cycle.requiredProvisionSatchelId}`);
  }

  const sanctuaryReady = progress.sanctuaryRiteProof && progress.sanctuaryRiteId === cycle.requiredSanctuaryRiteId;
  if (!sanctuaryReady) {
    missing.push(`sanctuary:${cycle.requiredSanctuaryRiteId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const caredSpiritIds = roster.filter((spiritId) => {
    return Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)) >= cycle.requiredBondPerSpirit;
  });
  const totalBond = roster.reduce((total, spiritId) => total + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)), 0);
  const score =
    Math.min(roster.length, cycle.requiredSpiritIds.length) * 3 +
    Math.min(caredSpiritIds.length, cycle.requiredSpiritIds.length) * 3 +
    Math.min(6, totalBond) +
    Math.min(6, careStreak * 3) +
    Math.min(5, trainingXp) +
    (progress.raisingProof ? 4 : 0) +
    (archiveReady ? 4 : 0) +
    (provisionReady ? 4 : 0) +
    (sanctuaryReady ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0);
  const cycled = missing.length === 0 && score >= cycle.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'the first-court roster';
  const caredNames = caredSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const milestone = progress.raisingMilestoneLabel ? ` ${progress.raisingMilestoneLabel} anchors the rotation.` : '';

  return {
    ok: true,
    cycled,
    cycleId: cycle.id,
    cycleName: cycle.name,
    title: cycle.title,
    habitat: cycle.habitat,
    activeSpiritId,
    roster,
    caredSpiritIds,
    totalBond,
    careStreak,
    trainingXp,
    raisingMilestoneLabel: progress.raisingMilestoneLabel,
    score,
    requiredScore: cycle.requiredScore,
    missing,
    rewardItemId: cycle.rewardItemId,
    message: cycled
      ? `${cycle.name} complete: ${activeName} helps ${caredNames || 'the first-court roster'} rotate care, training, supplies, archive notes, and sanctuary rest.${milestone} No real value.`
      : `${cycle.name} needs ${missing.join(', ')} before the full-roster care rotation can be recorded.`,
    source: 'spirit-care-cycle'
  };
}

export function resolveSpiritTemperamentConcord(
  progress: SpiritTemperamentConcordProgress,
  concordId: string = SPIRIT_TEMPERAMENT_CONCORDS[0].id
): SpiritTemperamentConcordResult {
  const concord = SPIRIT_TEMPERAMENT_CONCORDS.find((entry) => entry.id === concordId) || SPIRIT_TEMPERAMENT_CONCORDS[0];
  const requiredSpiritIds = new Set(concord.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const bondBySpiritId = progress.bondBySpiritId || {};
  const missing: string[] = [];

  for (const spiritId of concord.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
      continue;
    }

    const bond = Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
    if (bond < concord.requiredBondPerSpirit) {
      missing.push(`bond:${spiritId}:${bond}/${concord.requiredBondPerSpirit}`);
    }
  }

  const temperamentLabels: string[] = roster.map((spiritId) => getMochiSpirit(spiritId)?.temperament || '').filter(Boolean);
  const temperamentSet = new Set<string>(temperamentLabels);
  for (const temperament of concord.requiredTemperaments) {
    if (!temperamentSet.has(temperament)) {
      missing.push(`temperament:${temperament}`);
    }
  }

  const careCycleReady = progress.careCycleProof && progress.careCycleId === concord.requiredCareCycleId;
  if (!careCycleReady) {
    missing.push(`care-cycle:${concord.requiredCareCycleId}`);
  }

  const traitReady = progress.traitAttunementProof && progress.traitAttunementId === concord.requiredTraitId;
  if (!traitReady) {
    missing.push(`trait:${concord.requiredTraitId}`);
  }

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === concord.requiredConditionWeaveId;
  if (!conditionReady) {
    missing.push(`condition-weave:${concord.requiredConditionWeaveId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (chatLines.length < concord.requiredChatLines) {
    missing.push(`chat:${chatLines.length}/${concord.requiredChatLines}`);
  }

  const totalBond = roster.reduce((total, spiritId) => total + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)), 0);
  const score =
    Math.min(roster.length, concord.requiredSpiritIds.length) * 3 +
    Math.min(temperamentSet.size, concord.requiredTemperaments.length) * 3 +
    Math.min(6, totalBond) +
    (careCycleReady ? 5 : 0) +
    (traitReady ? 4 : 0) +
    (conditionReady ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const concorded = missing.length === 0 && score >= concord.requiredScore;
  const temperamentSummary = Array.from(temperamentSet).join(', ');

  return {
    ok: true,
    concorded,
    concordId: concord.id,
    concordName: concord.name,
    title: concord.title,
    habitat: concord.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    temperamentLabels: Array.from(temperamentSet),
    totalBond,
    score,
    requiredScore: concord.requiredScore,
    missing,
    rewardItemId: concord.rewardItemId,
    message: concorded
      ? `${concord.name} complete: ${activeSpirit.name} anchors ${temperamentSummary} temperaments through care-cycle trust, trait identity, condition weaving, and local guild presence. No real value.`
      : `${concord.name} needs ${missing.join(', ')} before the first-court temperament identity can be recorded.`,
    source: 'spirit-temperament-concord'
  };
}

export function resolveSpiritFieldAlmanac(
  progress: SpiritFieldAlmanacProgress,
  almanacId: string = SPIRIT_FIELD_ALMANACS[0].id
): SpiritFieldAlmanacResult {
  const almanac = SPIRIT_FIELD_ALMANACS.find((entry) => entry.id === almanacId) || SPIRIT_FIELD_ALMANACS[0];
  const requiredSpiritIds = new Set(almanac.requiredSpiritIds);
  const requiredRouteIds = new Set(almanac.requiredRouteIds);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const speciesIds = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && speciesIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : speciesIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const spiritId of almanac.requiredSpiritIds) {
    if (!speciesIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const routeId of almanac.requiredRouteIds) {
    if (!routeIds.includes(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < almanac.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${almanac.requiredJournalCount}`);
  }

  const fieldAccordReady = progress.fieldAccordProof && progress.fieldAccordId === almanac.requiredFieldAccordId;
  if (!fieldAccordReady) {
    missing.push(`field-accord:${almanac.requiredFieldAccordId}`);
  }

  const routePatrolReady = progress.routePatrolProof && progress.routePatrolId === almanac.requiredRoutePatrolId;
  if (!routePatrolReady) {
    missing.push(`route-patrol:${almanac.requiredRoutePatrolId}`);
  }

  const compendiumReady = progress.compendiumProof && progress.compendiumId === almanac.requiredCompendiumId;
  if (!compendiumReady) {
    missing.push(`compendium:${almanac.requiredCompendiumId}`);
  }

  const temperamentReady = progress.temperamentConcordProof && progress.temperamentConcordId === almanac.requiredTemperamentConcordId;
  if (!temperamentReady) {
    missing.push(`temperament:${almanac.requiredTemperamentConcordId}`);
  }

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === almanac.requiredConditionWeaveId;
  if (!conditionReady) {
    missing.push(`condition-weave:${almanac.requiredConditionWeaveId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (chatLines.length < almanac.requiredChatLines) {
    missing.push(`chat:${chatLines.length}/${almanac.requiredChatLines}`);
  }

  const score =
    Math.min(speciesIds.length, almanac.requiredSpiritIds.length) * 3 +
    Math.min(routeIds.length, almanac.requiredRouteIds.length) * 3 +
    Math.min(6, journalCount * 2) +
    (fieldAccordReady ? 3 : 0) +
    (routePatrolReady ? 4 : 0) +
    (compendiumReady ? 5 : 0) +
    (temperamentReady ? 4 : 0) +
    (conditionReady ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const recorded = missing.length === 0 && score >= almanac.requiredScore;
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unscouted routes';
  const speciesSummary = speciesIds.length
    ? speciesIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'unrecorded spirits';

  return {
    ok: true,
    recorded,
    almanacId: almanac.id,
    almanacName: almanac.name,
    title: almanac.title,
    habitat: almanac.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    routeIds,
    speciesIds,
    journalDiscoveredCount: journalCount,
    score,
    requiredScore: almanac.requiredScore,
    missing,
    rewardItemId: almanac.rewardItemId,
    message: recorded
      ? `${almanac.name} recorded: ${activeSpirit.name} cross-links ${speciesSummary} with ${routeSummary}, field accord notes, patrol signs, compendium seals, temperament identity, and condition weaving. No real value.`
      : `${almanac.name} needs ${missing.join(', ')} before the first-court field almanac can be recorded.`,
    source: 'spirit-field-almanac'
  };
}

export function resolveSpiritRouteEcologySurvey(
  progress: SpiritRouteEcologyProgress,
  surveyId: string = SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id
): SpiritRouteEcologyResult {
  const survey = SPIRIT_ROUTE_ECOLOGY_SURVEYS.find((entry) => entry.id === surveyId) || SPIRIT_ROUTE_ECOLOGY_SURVEYS[0];
  const requiredSpiritIds = new Set(survey.requiredSpiritIds);
  const requiredRouteIds = new Set(survey.requiredRouteIds);
  const requiredRouteSpiritIds = new Set(survey.requiredRouteSpiritIds);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const speciesIds = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const routeInvitedSpiritIds = Array.from(new Set(progress.routeInvitedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredRouteSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && speciesIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : speciesIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const spiritId of survey.requiredSpiritIds) {
    if (!speciesIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const routeId of survey.requiredRouteIds) {
    if (!routeIds.includes(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  for (const spiritId of survey.requiredRouteSpiritIds) {
    if (!routeInvitedSpiritIds.includes(spiritId)) {
      missing.push(`route-invite:${spiritId}`);
    }
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < survey.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${survey.requiredJournalCount}`);
  }

  const fieldAlmanacReady = progress.fieldAlmanacProof && progress.fieldAlmanacId === survey.requiredFieldAlmanacId;
  if (!fieldAlmanacReady) {
    missing.push(`field-almanac:${survey.requiredFieldAlmanacId}`);
  }

  const fieldAccordReady = progress.fieldAccordProof && progress.fieldAccordId === survey.requiredFieldAccordId;
  if (!fieldAccordReady) {
    missing.push(`field-accord:${survey.requiredFieldAccordId}`);
  }

  const routePatrolReady = progress.routePatrolProof && progress.routePatrolId === survey.requiredRoutePatrolId;
  if (!routePatrolReady) {
    missing.push(`route-patrol:${survey.requiredRoutePatrolId}`);
  }

  const routeMasteryReady = progress.routeMasteryProof && progress.routeMasteryId === survey.requiredRouteMasteryId;
  if (!routeMasteryReady) {
    missing.push(`route-mastery:${survey.requiredRouteMasteryId}`);
  }

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === survey.requiredConditionWeaveId;
  if (!conditionReady) {
    missing.push(`condition-weave:${survey.requiredConditionWeaveId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (chatLines.length < survey.requiredChatLines) {
    missing.push(`chat:${chatLines.length}/${survey.requiredChatLines}`);
  }

  const score =
    Math.min(speciesIds.length, survey.requiredSpiritIds.length) * 2 +
    Math.min(routeIds.length, survey.requiredRouteIds.length) * 3 +
    Math.min(routeInvitedSpiritIds.length, survey.requiredRouteSpiritIds.length) * 2 +
    Math.min(6, journalCount * 2) +
    (fieldAlmanacReady ? 5 : 0) +
    (fieldAccordReady ? 3 : 0) +
    (routePatrolReady ? 4 : 0) +
    (routeMasteryReady ? 4 : 0) +
    (conditionReady ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const surveyed = missing.length === 0 && score >= survey.requiredScore;
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unscouted routes';
  const invitedNames = routeInvitedSpiritIds.length
    ? routeInvitedSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'uninvited route spirits';

  return {
    ok: true,
    surveyed,
    surveyId: survey.id,
    surveyName: survey.name,
    title: survey.title,
    habitat: survey.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    routeIds,
    speciesIds,
    routeInvitedSpiritIds,
    journalDiscoveredCount: journalCount,
    score,
    requiredScore: survey.requiredScore,
    missing,
    rewardItemId: survey.rewardItemId,
    message: surveyed
      ? `${survey.name} complete: ${activeSpirit.name} maps ${routeSummary} ecology with ${invitedNames}, field almanac signs, patrol safety, route mastery, and no-injury condition notes. No real value.`
      : `${survey.name} needs ${missing.join(', ')} before first-court route ecology can be recorded.`,
    source: 'spirit-route-ecology'
  };
}

export function resolveSpiritWeatherVeil(
  progress: SpiritWeatherVeilProgress,
  veilId: string = SPIRIT_WEATHER_VEILS[0].id
): SpiritWeatherVeilResult {
  const veil = SPIRIT_WEATHER_VEILS.find((entry) => entry.id === veilId) || SPIRIT_WEATHER_VEILS[0];
  const requiredRouteIds = new Set(veil.requiredRouteIds);
  const requiredWeatherConditionIds = new Set(veil.requiredWeatherConditionIds);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const weatherConditionIds = Array.from(new Set(progress.weatherConditionIds.filter(Boolean))).filter((conditionId) => {
    return requiredWeatherConditionIds.has(conditionId);
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const routeId of veil.requiredRouteIds) {
    if (!routeIds.includes(routeId)) missing.push(`route:${routeId}`);
  }

  for (const conditionId of veil.requiredWeatherConditionIds) {
    if (!weatherConditionIds.includes(conditionId)) missing.push(`weather:${conditionId}`);
  }

  const routeEcologyReady = progress.routeEcologyProof && progress.routeEcologyId === veil.requiredRouteEcologyId;
  if (!routeEcologyReady) missing.push(`route-ecology:${veil.requiredRouteEcologyId}`);

  const fieldAlmanacReady = progress.fieldAlmanacProof && progress.fieldAlmanacId === veil.requiredFieldAlmanacId;
  if (!fieldAlmanacReady) missing.push(`field-almanac:${veil.requiredFieldAlmanacId}`);

  const fieldAccordReady = progress.fieldAccordProof && progress.fieldAccordId === veil.requiredFieldAccordId;
  if (!fieldAccordReady) missing.push(`field-accord:${veil.requiredFieldAccordId}`);

  const routePatrolReady = progress.routePatrolProof && progress.routePatrolId === veil.requiredRoutePatrolId;
  if (!routePatrolReady) missing.push(`route-patrol:${veil.requiredRoutePatrolId}`);

  if (localPresenceCount < veil.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${veil.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < veil.requiredChatLines) missing.push(`chat:${chatLines.length}/${veil.requiredChatLines}`);

  const score =
    Math.min(routeIds.length, veil.requiredRouteIds.length) * 4 +
    Math.min(weatherConditionIds.length, veil.requiredWeatherConditionIds.length) * 3 +
    (routeEcologyReady ? 6 : 0) +
    (fieldAlmanacReady ? 4 : 0) +
    (fieldAccordReady ? 4 : 0) +
    (routePatrolReady ? 4 : 0) +
    Math.min(localPresenceCount, veil.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const recorded = missing.length === 0 && score >= veil.requiredScore;
  const routeConditionWindows = routeIds.map((routeId, index) => {
    const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === routeId);
    const conditionId = weatherConditionIds[index % Math.max(1, weatherConditionIds.length)] || weatherConditionIds[0] || 'calm-veiling';
    return `${route?.name || routeId}:${conditionId}`;
  });
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unscouted routes';
  const conditionSummary = weatherConditionIds.length ? weatherConditionIds.join(', ') : 'uncharted veils';

  return {
    ok: true,
    recorded,
    weatherVeilId: veil.id,
    weatherVeilName: veil.name,
    title: veil.title,
    habitat: veil.habitat,
    routeIds,
    weatherConditionIds,
    routeConditionWindows,
    localPresenceCount,
    score,
    requiredScore: veil.requiredScore,
    missing,
    rewardItemId: veil.rewardItemId,
    message: recorded
      ? `${veil.name} recorded: ${conditionSummary} are charted across ${routeSummary} with ecology, almanac, field accord, patrol, and nearby social witness proof. No real value.`
      : `${veil.name} needs ${missing.join(', ')} before route conditions can be charted.`,
    source: 'spirit-weather-veil'
  };
}

export function resolveSpiritEncounterRotation(
  progress: SpiritEncounterRotationProgress,
  rotationId: string = SPIRIT_ENCOUNTER_ROTATIONS[0].id
): SpiritEncounterRotationResult {
  const rotation = SPIRIT_ENCOUNTER_ROTATIONS.find((entry) => entry.id === rotationId) || SPIRIT_ENCOUNTER_ROTATIONS[0];
  const requiredRouteIds = new Set(rotation.requiredRouteIds);
  const requiredEncounterSpiritIds = new Set(rotation.requiredEncounterSpiritIds);
  const requiredLureItemIds = new Set(rotation.requiredLureItemIds);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const encounterSpiritIds = Array.from(new Set(progress.encounterSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredEncounterSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const lureItemIds = Array.from(new Set(progress.lureItemIds.filter(Boolean))).filter((itemId) => requiredLureItemIds.has(itemId));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const routeId of rotation.requiredRouteIds) {
    if (!routeIds.includes(routeId)) missing.push(`route:${routeId}`);
  }

  for (const spiritId of rotation.requiredEncounterSpiritIds) {
    if (!encounterSpiritIds.includes(spiritId)) missing.push(`encounter:${spiritId}`);
  }

  for (const itemId of rotation.requiredLureItemIds) {
    if (!lureItemIds.includes(itemId)) missing.push(`lure:${itemId}`);
  }

  const routeEcologyReady = progress.routeEcologyProof && progress.routeEcologyId === rotation.requiredRouteEcologyId;
  if (!routeEcologyReady) missing.push(`route-ecology:${rotation.requiredRouteEcologyId}`);

  const fieldAlmanacReady = progress.fieldAlmanacProof && progress.fieldAlmanacId === rotation.requiredFieldAlmanacId;
  if (!fieldAlmanacReady) missing.push(`field-almanac:${rotation.requiredFieldAlmanacId}`);

  const fieldAccordReady = progress.fieldAccordProof && progress.fieldAccordId === rotation.requiredFieldAccordId;
  if (!fieldAccordReady) missing.push(`field-accord:${rotation.requiredFieldAccordId}`);

  const captureRiteReady = progress.captureRiteProof && progress.captureRiteId === rotation.requiredCaptureRiteId;
  if (!captureRiteReady) missing.push(`capture-rite:${rotation.requiredCaptureRiteId}`);

  const weatherVeilReady = progress.weatherVeilProof && progress.weatherVeilId === rotation.requiredWeatherVeilId;
  if (!weatherVeilReady) missing.push(`weather-veil:${rotation.requiredWeatherVeilId}`);

  if (localPresenceCount < rotation.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${rotation.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < rotation.requiredChatLines) missing.push(`chat:${chatLines.length}/${rotation.requiredChatLines}`);

  const score =
    Math.min(routeIds.length, rotation.requiredRouteIds.length) * 3 +
    Math.min(encounterSpiritIds.length, rotation.requiredEncounterSpiritIds.length) * 3 +
    Math.min(lureItemIds.length, rotation.requiredLureItemIds.length) * 3 +
    (routeEcologyReady ? 6 : 0) +
    (fieldAlmanacReady ? 4 : 0) +
    (fieldAccordReady ? 4 : 0) +
    (captureRiteReady ? 5 : 0) +
    (weatherVeilReady ? 5 : 0) +
    Math.min(localPresenceCount, rotation.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const recorded = missing.length === 0 && score >= rotation.requiredScore;
  const rotationWindows = routeIds.map((routeId, index) => {
    const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === routeId);
    const spiritId = route?.encounterSpiritId || encounterSpiritIds[index % Math.max(1, encounterSpiritIds.length)] || encounterSpiritIds[0];
    const spirit = getMochiSpirit(spiritId || '');
    const lure = spirit?.capture.lureItemId || lureItemIds[index % Math.max(1, lureItemIds.length)] || lureItemIds[0] || 'guild-lure';
    return `${route?.name || routeId}:${spirit?.name || spiritId || 'spirit'}:${lure}`;
  });
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unplanned routes';
  const spiritSummary = encounterSpiritIds.length
    ? encounterSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'unplanned spirits';

  return {
    ok: true,
    recorded,
    rotationId: rotation.id,
    rotationName: rotation.name,
    title: rotation.title,
    habitat: rotation.habitat,
    routeIds,
    encounterSpiritIds,
    lureItemIds,
    rotationWindows,
    weatherVeilId: rotation.requiredWeatherVeilId,
    localPresenceCount,
    score,
    requiredScore: rotation.requiredScore,
    missing,
    rewardItemId: rotation.rewardItemId,
    message: recorded
      ? `${rotation.name} recorded: ${spiritSummary} are scheduled across ${routeSummary} with consent lures, ecology notes, weather veil timing, field accord trust, capture rite proof, and nearby social witnesses. No real value.`
      : `${rotation.name} needs ${missing.join(', ')} before encounter windows can be recorded.`,
    source: 'spirit-encounter-rotation'
  };
}

export function resolveSpiritEncounterAtlas(
  progress: SpiritEncounterAtlasProgress,
  atlasId: string = SPIRIT_ENCOUNTER_ATLASES[0].id
): SpiritEncounterAtlasResult {
  const atlas = SPIRIT_ENCOUNTER_ATLASES.find((entry) => entry.id === atlasId) || SPIRIT_ENCOUNTER_ATLASES[0];
  const requiredRouteIds = new Set(atlas.requiredRouteIds);
  const requiredEncounterSpiritIds = new Set(atlas.requiredEncounterSpiritIds);
  const requiredRarityTiers = new Set(atlas.requiredRarityTiers);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const encounteredSpiritIds = Array.from(new Set(progress.encounteredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredEncounterSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const capturedSpiritIds = Array.from(new Set(progress.capturedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredEncounterSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const rarityTiers = Array.from(new Set(progress.rarityTiers.filter(Boolean))).filter((rarity): rarity is SpiritEncounterRarity => {
    return requiredRarityTiers.has(rarity as SpiritEncounterRarity);
  });
  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const routeId of atlas.requiredRouteIds) {
    if (!routeIds.includes(routeId)) missing.push(`route:${routeId}`);
  }

  for (const spiritId of atlas.requiredEncounterSpiritIds) {
    if (!encounteredSpiritIds.includes(spiritId)) missing.push(`encounter:${spiritId}`);
    if (!capturedSpiritIds.includes(spiritId)) missing.push(`capture:${spiritId}`);
  }

  for (const rarity of atlas.requiredRarityTiers) {
    if (!rarityTiers.includes(rarity)) missing.push(`rarity:${rarity}`);
  }

  if (journalCount < atlas.requiredJournalCount) missing.push(`journal:${journalCount}/${atlas.requiredJournalCount}`);

  const routeEcologyReady = progress.routeEcologyProof && progress.routeEcologyId === atlas.requiredRouteEcologyId;
  if (!routeEcologyReady) missing.push(`route-ecology:${atlas.requiredRouteEcologyId}`);

  const captureRiteReady = progress.captureRiteProof && progress.captureRiteId === atlas.requiredCaptureRiteId;
  if (!captureRiteReady) missing.push(`capture-rite:${atlas.requiredCaptureRiteId}`);

  const fieldAlmanacReady = progress.fieldAlmanacProof && progress.fieldAlmanacId === atlas.requiredFieldAlmanacId;
  if (!fieldAlmanacReady) missing.push(`field-almanac:${atlas.requiredFieldAlmanacId}`);

  const encounterRotationReady = progress.encounterRotationProof && progress.encounterRotationId === atlas.requiredEncounterRotationId;
  if (!encounterRotationReady) missing.push(`encounter-rotation:${atlas.requiredEncounterRotationId}`);

  const weatherVeilReady = progress.weatherVeilProof && progress.weatherVeilId === atlas.requiredWeatherVeilId;
  if (!weatherVeilReady) missing.push(`weather-veil:${atlas.requiredWeatherVeilId}`);

  if (localPresenceCount < atlas.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${atlas.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < atlas.requiredChatLines) missing.push(`chat:${chatLines.length}/${atlas.requiredChatLines}`);

  const score =
    Math.min(routeIds.length, atlas.requiredRouteIds.length) * 3 +
    Math.min(encounteredSpiritIds.length, atlas.requiredEncounterSpiritIds.length) * 3 +
    Math.min(capturedSpiritIds.length, atlas.requiredEncounterSpiritIds.length) * 2 +
    Math.min(rarityTiers.length, atlas.requiredRarityTiers.length) * 2 +
    Math.min(6, journalCount * 2) +
    (routeEcologyReady ? 5 : 0) +
    (captureRiteReady ? 5 : 0) +
    (fieldAlmanacReady ? 3 : 0) +
    (encounterRotationReady ? 5 : 0) +
    (weatherVeilReady ? 5 : 0) +
    Math.min(localPresenceCount, atlas.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const recorded = missing.length === 0 && score >= atlas.requiredScore;
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unscouted routes';
  const spiritSummary = encounteredSpiritIds.length
    ? encounteredSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'unindexed spirits';

  return {
    ok: true,
    recorded,
    atlasId: atlas.id,
    atlasName: atlas.name,
    title: atlas.title,
    habitat: atlas.habitat,
    routeIds,
    encounteredSpiritIds,
    capturedSpiritIds,
    rarityTiers,
    journalDiscoveredCount: journalCount,
    encounterRotationId: atlas.requiredEncounterRotationId,
    weatherVeilId: atlas.requiredWeatherVeilId,
    localPresenceCount,
    score,
    requiredScore: atlas.requiredScore,
    missing,
    rewardItemId: atlas.rewardItemId,
    message: recorded
      ? `${atlas.name} recorded: ${spiritSummary} are indexed across ${routeSummary} with rarity tiers, capture rite, route ecology, field almanac, weather veil, encounter rotation, and nearby social witness proof. No real value.`
      : `${atlas.name} needs ${missing.join(', ')} before the first-court encounter index can be recorded.`,
    source: 'spirit-encounter-atlas'
  };
}

export function resolveSpiritHabitatCensus(
  progress: SpiritHabitatCensusProgress,
  censusId: string = SPIRIT_HABITAT_CENSUSES[0].id
): SpiritHabitatCensusResult {
  const census = SPIRIT_HABITAT_CENSUSES.find((entry) => entry.id === censusId) || SPIRIT_HABITAT_CENSUSES[0];
  const requiredSpiritIds = new Set(census.requiredSpiritIds);
  const requiredRouteIds = new Set(census.requiredRouteIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const observedSpiritIds = Array.from(new Set(progress.observedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const careLoggedSpiritIds = Array.from(new Set(progress.careLoggedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of census.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`roster:${spiritId}`);
    if (!observedSpiritIds.includes(spiritId)) missing.push(`observation:${spiritId}`);
    if (!careLoggedSpiritIds.includes(spiritId)) missing.push(`care-log:${spiritId}`);
  }

  for (const routeId of census.requiredRouteIds) {
    if (!routeIds.includes(routeId)) missing.push(`route:${routeId}`);
  }

  const encounterAtlasReady = progress.encounterAtlasProof && progress.encounterAtlasId === census.requiredEncounterAtlasId;
  if (!encounterAtlasReady) missing.push(`encounter-atlas:${census.requiredEncounterAtlasId}`);

  const routeEcologyReady = progress.routeEcologyProof && progress.routeEcologyId === census.requiredRouteEcologyId;
  if (!routeEcologyReady) missing.push(`route-ecology:${census.requiredRouteEcologyId}`);

  const weatherVeilReady = progress.weatherVeilProof && progress.weatherVeilId === census.requiredWeatherVeilId;
  if (!weatherVeilReady) missing.push(`weather-veil:${census.requiredWeatherVeilId}`);

  const compendiumReady = progress.compendiumProof && progress.compendiumId === census.requiredCompendiumId;
  if (!compendiumReady) missing.push(`compendium:${census.requiredCompendiumId}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === census.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${census.requiredCareCycleId}`);

  if (localPresenceCount < census.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${census.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < census.requiredChatLines) missing.push(`chat:${chatLines.length}/${census.requiredChatLines}`);

  const score =
    Math.min(roster.length, census.requiredSpiritIds.length) * 2 +
    Math.min(routeIds.length, census.requiredRouteIds.length) * 3 +
    Math.min(observedSpiritIds.length, census.requiredSpiritIds.length) * 3 +
    Math.min(careLoggedSpiritIds.length, census.requiredSpiritIds.length) * 2 +
    (encounterAtlasReady ? 6 : 0) +
    (routeEcologyReady ? 4 : 0) +
    (weatherVeilReady ? 4 : 0) +
    (compendiumReady ? 4 : 0) +
    (careCycleReady ? 4 : 0) +
    Math.min(localPresenceCount, census.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const recorded = missing.length === 0 && score >= census.requiredScore;
  const spiritSummary = observedSpiritIds.length
    ? observedSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'unobserved spirits';
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unscouted routes';

  return {
    ok: true,
    recorded,
    censusId: census.id,
    censusName: census.name,
    title: census.title,
    habitat: census.habitat,
    roster,
    routeIds,
    observedSpiritIds,
    careLoggedSpiritIds,
    localPresenceCount,
    score,
    requiredScore: census.requiredScore,
    missing,
    rewardItemId: census.rewardItemId,
    message: recorded
      ? `${census.name} recorded: ${spiritSummary} are counted across ${routeSummary} with care logs, route ecology, weather veil timing, compendium records, encounter atlas proof, and nearby social witnesses. No real value.`
      : `${census.name} needs ${missing.join(', ')} before first-court habitat census records can be sealed.`,
    source: 'spirit-habitat-census'
  };
}

export function resolveSpiritCraftWrit(
  progress: SpiritCraftWritProgress,
  writId: string = SPIRIT_CRAFT_WRITS[0].id
): SpiritCraftWritResult {
  const writ = SPIRIT_CRAFT_WRITS.find((entry) => entry.id === writId) || SPIRIT_CRAFT_WRITS[0];
  const requiredSpiritIds = new Set(writ.requiredSpiritIds);
  const requiredRecipeIds = new Set(writ.requiredRecipeIds);
  const requiredStockItemIds = new Set(writ.requiredStockItemIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const recipeIds = Array.from(new Set(progress.recipeIds.filter(Boolean))).filter((recipeId) => requiredRecipeIds.has(recipeId));
  const stockItemIds = Array.from(new Set(progress.stockItemIds.filter(Boolean))).filter((itemId) => {
    return requiredStockItemIds.has(itemId) && Object.values(ALPHA_ITEMS).some((item) => item.id === itemId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const spiritId of writ.requiredSpiritIds) {
    if (!roster.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const recipeId of writ.requiredRecipeIds) {
    if (!recipeIds.includes(recipeId)) {
      missing.push(`recipe:${recipeId}`);
    }
  }

  for (const itemId of writ.requiredStockItemIds) {
    if (!stockItemIds.includes(itemId)) {
      missing.push(`stock:${itemId}`);
    }
  }

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === writ.requiredProvisionSatchelId;
  if (!provisionReady) {
    missing.push(`provision:${writ.requiredProvisionSatchelId}`);
  }

  const routeEcologyReady = progress.routeEcologyProof && progress.routeEcologyId === writ.requiredRouteEcologyId;
  if (!routeEcologyReady) {
    missing.push(`route-ecology:${writ.requiredRouteEcologyId}`);
  }

  const fieldAlmanacReady = progress.fieldAlmanacProof && progress.fieldAlmanacId === writ.requiredFieldAlmanacId;
  if (!fieldAlmanacReady) {
    missing.push(`field-almanac:${writ.requiredFieldAlmanacId}`);
  }

  const careCycleReady = progress.careCycleProof && progress.careCycleId === writ.requiredCareCycleId;
  if (!careCycleReady) {
    missing.push(`care-cycle:${writ.requiredCareCycleId}`);
  }

  const temperamentReady = progress.temperamentConcordProof && progress.temperamentConcordId === writ.requiredTemperamentConcordId;
  if (!temperamentReady) {
    missing.push(`temperament:${writ.requiredTemperamentConcordId}`);
  }

  if (!progress.marketProof) missing.push('market-listing');
  if (!progress.tradeProof) missing.push('direct-trade');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (chatLines.length < writ.requiredChatLines) {
    missing.push(`chat:${chatLines.length}/${writ.requiredChatLines}`);
  }

  const score =
    Math.min(roster.length, writ.requiredSpiritIds.length) * 3 +
    Math.min(recipeIds.length, writ.requiredRecipeIds.length) * 2 +
    Math.min(stockItemIds.length, writ.requiredStockItemIds.length) * 2 +
    (provisionReady ? 5 : 0) +
    (routeEcologyReady ? 5 : 0) +
    (fieldAlmanacReady ? 4 : 0) +
    (careCycleReady ? 3 : 0) +
    (temperamentReady ? 3 : 0) +
    (progress.marketProof ? 2 : 0) +
    (progress.tradeProof ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const crafted = missing.length === 0 && score >= writ.requiredScore;
  const recipeSummary = recipeIds.length ? recipeIds.join(', ') : 'unprepared recipes';
  const stockSummary = stockItemIds.length ? stockItemIds.join(', ') : 'unstocked supplies';

  return {
    ok: true,
    crafted,
    writId: writ.id,
    writName: writ.name,
    title: writ.title,
    habitat: writ.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    recipeIds,
    stockItemIds,
    score,
    requiredScore: writ.requiredScore,
    missing,
    rewardItemId: writ.rewardItemId,
    message: crafted
      ? `${writ.name} complete: ${activeSpirit.name} binds ${recipeSummary} with ${stockSummary}, route ecology, care rhythm, temperament notes, and market/trade handoff. No real value.`
      : `${writ.name} needs ${missing.join(', ')} before the first-court craft ledger can be recorded.`,
    source: 'spirit-craft-writ'
  };
}

export function resolveMarketGuildReceipt(
  progress: MarketGuildReceiptProgress,
  receiptId: string = MARKET_GUILD_RECEIPTS[0].id
): MarketGuildReceiptResult {
  const receipt = MARKET_GUILD_RECEIPTS.find((entry) => entry.id === receiptId) || MARKET_GUILD_RECEIPTS[0];
  const listingItemIds = new Set(receipt.listingItemIds);
  const itemId = String(progress.itemId || '').trim();
  const quantity = Math.max(0, Math.floor(progress.quantity || 0));
  const price = Math.max(0, Math.floor(progress.price || 0));
  const currency = String(progress.currency || '').trim();
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (!listingItemIds.has(itemId)) missing.push(`item:${itemId || 'missing'}`);
  if (quantity < receipt.requiredQuantity) missing.push(`quantity:${quantity}/${receipt.requiredQuantity}`);
  if (currency !== receipt.requiredCurrency) missing.push(`currency:${currency || 'missing'}`);
  if (price !== receipt.requiredPrice) missing.push(`price:${price}/${receipt.requiredPrice}`);
  if (!progress.marketProof) missing.push('market-listing');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < receipt.requiredChatLines) missing.push(`chat:${chatLines.length}/${receipt.requiredChatLines}`);
  if (!progress.noRealValue) missing.push('no-real-value');

  const score =
    (listingItemIds.has(itemId) ? 4 : 0) +
    (quantity >= receipt.requiredQuantity ? 2 : 0) +
    (currency === receipt.requiredCurrency ? 2 : 0) +
    (price === receipt.requiredPrice ? 2 : 0) +
    (progress.marketProof ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(chatLines.length, receipt.requiredChatLines);
  const purchased = missing.length === 0 && score >= receipt.requiredScore;

  return {
    ok: true,
    purchased,
    receiptId: receipt.id,
    receiptName: receipt.name,
    title: receipt.title,
    habitat: receipt.habitat,
    itemId,
    quantity,
    currency,
    price,
    score,
    requiredScore: receipt.requiredScore,
    missing,
    rewardItemId: receipt.rewardItemId,
    message: purchased
      ? `${receipt.name} recorded: ${itemId} was bought through fixed-price Mochirii market practice for ${price} ${currency}. No real value.`
      : `${receipt.name} needs ${missing.join(', ')} before the fixed-price market receipt can be recorded.`,
    source: 'market-guild-receipt'
  };
}

export function resolveTradeExchangeAccord(
  progress: TradeExchangeAccordProgress,
  accordId: string = TRADE_EXCHANGE_ACCORDS[0].id
): TradeExchangeAccordResult {
  const accord = TRADE_EXCHANGE_ACCORDS.find((entry) => entry.id === accordId) || TRADE_EXCHANGE_ACCORDS[0];
  const requiredSpiritIds = new Set(accord.requiredSpiritIds);
  const requiredItemIds = new Set(accord.requiredItemIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const itemIds = Array.from(new Set([...progress.listedItemIds, ...progress.offeredItemIds].filter(Boolean))).filter((itemId) => {
    return requiredItemIds.has(itemId) && Object.values(ALPHA_ITEMS).some((item) => item.id === itemId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of accord.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const itemId of accord.requiredItemIds) {
    if (!itemIds.includes(itemId)) missing.push(`item:${itemId}`);
  }

  if (!progress.marketProof) missing.push('market-listing');
  if (!progress.tradeProof) missing.push('direct-trade');

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === accord.requiredProvisionSatchelId;
  if (!provisionReady) missing.push(`provision:${accord.requiredProvisionSatchelId}`);

  const craftReady = progress.craftWritProof && progress.craftWritId === accord.requiredCraftWritId;
  if (!craftReady) missing.push(`craft:${accord.requiredCraftWritId}`);

  if (localPresenceCount < accord.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${accord.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < accord.requiredChatLines) missing.push(`chat:${chatLines.length}/${accord.requiredChatLines}`);

  const score =
    Math.min(roster.length, accord.requiredSpiritIds.length) * 3 +
    Math.min(itemIds.length, accord.requiredItemIds.length) * 3 +
    (progress.marketProof ? 3 : 0) +
    (progress.tradeProof ? 3 : 0) +
    (provisionReady ? 5 : 0) +
    (craftReady ? 5 : 0) +
    Math.min(localPresenceCount, accord.requiredPresenceCount) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const exchanged = missing.length === 0 && score >= accord.requiredScore;
  const rosterNames = roster.length ? roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ') : 'unregistered spirits';
  const itemSummary = itemIds.length ? itemIds.join(', ') : 'unverified supplies';

  return {
    ok: true,
    exchanged,
    accordId: accord.id,
    accordName: accord.name,
    title: accord.title,
    habitat: accord.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    itemIds,
    localPresenceCount,
    score,
    requiredScore: accord.requiredScore,
    missing,
    rewardItemId: accord.rewardItemId,
    message: exchanged
      ? `${accord.name} complete: ${rosterNames} exchange ${itemSummary} through fixed-list practice, direct trade, provision supplies, and craft writs with two-tester guild witness proof. No real value.`
      : `${accord.name} needs ${missing.join(', ')} before the guild exchange accord can be recorded.`,
    source: 'trade-exchange-accord'
  };
}

export function resolveSpiritRouteWaystone(
  progress: SpiritRouteWaystoneProgress,
  waystoneId: string = SPIRIT_ROUTE_WAYSTONES[0].id
): SpiritRouteWaystoneResult {
  const waystone = SPIRIT_ROUTE_WAYSTONES.find((entry) => entry.id === waystoneId) || SPIRIT_ROUTE_WAYSTONES[0];
  const requiredRouteIds = new Set(waystone.requiredRouteIds);
  const requiredRouteSpiritIds = new Set(waystone.requiredRouteSpiritIds);
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => requiredRouteIds.has(routeId));
  const routeInvitedSpiritIds = Array.from(new Set(progress.routeInvitedSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredRouteSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && routeInvitedSpiritIds.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : routeInvitedSpiritIds[routeInvitedSpiritIds.length - 1] || routeInvitedSpiritIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const routeId of waystone.requiredRouteIds) {
    if (!routeIds.includes(routeId)) {
      missing.push(`route:${routeId}`);
    }
  }

  for (const spiritId of waystone.requiredRouteSpiritIds) {
    if (!routeInvitedSpiritIds.includes(spiritId)) {
      missing.push(`route-invite:${spiritId}`);
    }
  }

  const masteryReady = progress.routeMasteryProof && progress.routeMasteryId === waystone.requiredRouteMasteryId;
  if (!masteryReady) {
    missing.push(`route-mastery:${waystone.requiredRouteMasteryId}`);
  }

  const patrolReady = progress.routePatrolProof && progress.routePatrolId === waystone.requiredRoutePatrolId;
  if (!patrolReady) {
    missing.push(`route-patrol:${waystone.requiredRoutePatrolId}`);
  }

  const ecologyReady = progress.routeEcologyProof && progress.routeEcologyId === waystone.requiredRouteEcologyId;
  if (!ecologyReady) {
    missing.push(`route-ecology:${waystone.requiredRouteEcologyId}`);
  }

  const craftReady = progress.craftWritProof && progress.craftWritId === waystone.requiredCraftWritId;
  if (!craftReady) {
    missing.push(`craft-writ:${waystone.requiredCraftWritId}`);
  }

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (chatLines.length < waystone.requiredChatLines) {
    missing.push(`chat:${chatLines.length}/${waystone.requiredChatLines}`);
  }

  const score =
    Math.min(routeIds.length, waystone.requiredRouteIds.length) * 3 +
    Math.min(routeInvitedSpiritIds.length, waystone.requiredRouteSpiritIds.length) * 2 +
    (masteryReady ? 4 : 0) +
    (patrolReady ? 4 : 0) +
    (ecologyReady ? 5 : 0) +
    (craftReady ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    Math.min(2, chatLines.length);
  const activated = missing.length === 0 && score >= waystone.requiredScore;
  const routeSummary = routeIds.length ? routeIds.join(', ') : 'unmarked routes';
  const spiritSummary = routeInvitedSpiritIds.length
    ? routeInvitedSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ')
    : 'uninvited route spirits';

  return {
    ok: true,
    activated,
    waystoneId: waystone.id,
    waystoneName: waystone.name,
    title: waystone.title,
    habitat: waystone.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    routeIds,
    routeInvitedSpiritIds,
    score,
    requiredScore: waystone.requiredScore,
    missing,
    rewardItemId: waystone.rewardItemId,
    message: activated
      ? `${waystone.name} activated: ${activeSpirit.name} links ${routeSummary} with ${spiritSummary}, patrol safety, ecology, and crafted travel supplies. No real value.`
      : `${waystone.name} needs ${missing.join(', ')} before first-route waystone travel can be recorded.`,
    source: 'world-route-waystone'
  };
}

export function resolveSpiritNurtureRite(
  progress: SpiritNurtureRiteProgress,
  riteId: string = SPIRIT_NURTURE_RITES[0].id
): SpiritNurtureRiteResult {
  const rite = SPIRIT_NURTURE_RITES.find((entry) => entry.id === riteId) || SPIRIT_NURTURE_RITES[0];
  const requiredSpiritIds = new Set(rite.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : roster[roster.length - 1] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const milestoneLabel = String(progress.raisingMilestoneLabel || '').trim();
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const bond = Math.max(0, Math.floor(progress.bond || 0));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  const missing: string[] = [];

  if (roster.length < rite.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${rite.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < rite.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${rite.requiredSpiritIds.length}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === rite.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${rite.requiredCareCycleId}`);

  const growthReady = progress.growthRiteProof && progress.growthRiteId === rite.requiredGrowthRiteId;
  if (!growthReady) missing.push(`growth:${rite.requiredGrowthRiteId}`);

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === rite.requiredProvisionSatchelId;
  if (!provisionReady) missing.push(`provision:${rite.requiredProvisionSatchelId}`);

  const craftReady = progress.craftWritProof && progress.craftWritId === rite.requiredCraftWritId;
  if (!craftReady) missing.push(`craft-writ:${rite.requiredCraftWritId}`);

  const temperamentReady = progress.temperamentConcordProof && progress.temperamentConcordId === rite.requiredTemperamentConcordId;
  if (!temperamentReady) missing.push(`temperament:${rite.requiredTemperamentConcordId}`);

  const raisingReady = progress.raisingProof && milestoneLabel.length > 0;
  if (!raisingReady) missing.push('raising');

  if (bond < rite.requiredBond) missing.push(`bond:${bond}/${rite.requiredBond}`);
  if (trainingXp < rite.requiredTrainingXp) missing.push(`training:${trainingXp}/${rite.requiredTrainingXp}`);
  if (sparLadderXp < rite.requiredSparLadderXp) missing.push(`spar:${sparLadderXp}/${rite.requiredSparLadderXp}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, rite.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, rite.requiredSpiritIds.length) * 2 +
    (careCycleReady ? 4 : 0) +
    (growthReady ? 4 : 0) +
    (provisionReady ? 3 : 0) +
    (craftReady ? 3 : 0) +
    (temperamentReady ? 3 : 0) +
    (raisingReady ? 3 : 0) +
    (bond >= rite.requiredBond ? 3 : 0) +
    (trainingXp >= rite.requiredTrainingXp ? 2 : 0) +
    (sparLadderXp >= rite.requiredSparLadderXp ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const nurtured = missing.length === 0 && score >= rite.requiredScore;
  const caredNames = caredSpiritIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const milestoneText = milestoneLabel ? ` ${milestoneLabel} anchors the care record.` : '';

  return {
    ok: true,
    nurtured,
    riteId: rite.id,
    riteName: rite.name,
    title: rite.title,
    habitat: rite.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    caredSpiritIds,
    score,
    requiredScore: rite.requiredScore,
    missing,
    rewardItemId: rite.rewardItemId,
    message: nurtured
      ? `${rite.name} complete: ${activeSpirit.name} guides ${caredNames || 'the first-court roster'} through care, growth, supplies, temperament, safe sparring, and bond practice.${milestoneText} No real value.`
      : `${rite.name} needs ${missing.join(', ')} before first-court nurture can be sealed.`,
    source: 'spirit-nurture-rite'
  };
}

export function resolveSpiritRecoveryTea(
  progress: SpiritRecoveryTeaProgress,
  teaId: string = SPIRIT_RECOVERY_TEAS[0].id
): SpiritRecoveryTeaResult {
  const tea = SPIRIT_RECOVERY_TEAS.find((entry) => entry.id === teaId) || SPIRIT_RECOVERY_TEAS[0];
  const requiredSpiritIds = new Set(tea.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : partyIds[0] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const battleFocus = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const battleOpponent = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleReady = progress.battleRoundProof && progress.battleRoundVictory && battleFocus > battleOpponent;
  const missing: string[] = [];

  if (roster.length < tea.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${tea.requiredSpiritIds.length}`);
  if (partyIds.length < tea.requiredSpiritIds.length) missing.push(`party:${partyIds.length}/${tea.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < tea.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${tea.requiredSpiritIds.length}`);
  if (localPresenceCount < tea.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${tea.requiredPresenceCount}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === tea.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${tea.requiredCareCycleId}`);

  const sanctuaryReady = progress.sanctuaryRiteProof && progress.sanctuaryRiteId === tea.requiredSanctuaryRiteId;
  if (!sanctuaryReady) missing.push(`sanctuary:${tea.requiredSanctuaryRiteId}`);

  const nurtureReady = progress.nurtureRiteProof && progress.nurtureRiteId === tea.requiredNurtureRiteId;
  if (!nurtureReady) missing.push(`nurture:${tea.requiredNurtureRiteId}`);

  if (!battleReady) missing.push('battle-round-victory');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, tea.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, tea.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, tea.requiredSpiritIds.length) +
    (careCycleReady ? 4 : 0) +
    (sanctuaryReady ? 5 : 0) +
    (nurtureReady ? 4 : 0) +
    (battleReady ? 5 : 0) +
    (localPresenceCount >= tea.requiredPresenceCount ? 4 : 0) +
    (battleReady && battleFocus - battleOpponent >= 8 ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const recovered = missing.length === 0 && score >= tea.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    recovered,
    teaId: tea.id,
    teaName: tea.name,
    title: tea.title,
    habitat: tea.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    caredSpiritIds,
    localPresenceCount,
    score,
    requiredScore: tea.requiredScore,
    missing,
    rewardItemId: tea.rewardItemId,
    message: recovered
      ? `${tea.name} complete: ${activeSpirit.name} settles ${partyNames || 'the first-court party'} with care tea, sanctuary rest, nurture notes, and no-injury battle review. No real value.`
      : `${tea.name} needs ${missing.join(', ')} before the party recovery table can be sealed.`,
    source: 'spirit-recovery-tea'
  };
}

export function resolveSpiritProvisionCatalog(
  progress: SpiritProvisionCatalogProgress,
  catalogId: string = SPIRIT_PROVISION_CATALOGS[0].id
): SpiritProvisionCatalogResult {
  const catalog = SPIRIT_PROVISION_CATALOGS.find((entry) => entry.id === catalogId) || SPIRIT_PROVISION_CATALOGS[0];
  const requiredSpiritIds = new Set(catalog.requiredSpiritIds);
  const knownItemIds = new Set<string>(Object.values(ALPHA_ITEMS).map((item) => item.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const stockItemIds = catalog.requiredStockItemIds.filter((itemId) => {
    return knownItemIds.has(itemId) && progress.stockItemIds.includes(itemId);
  });
  const careItemIds = catalog.requiredCareItemIds.filter((itemId) => {
    return knownItemIds.has(itemId) && progress.careItemIds.includes(itemId);
  });
  const routeItemIds = catalog.requiredRouteItemIds.filter((itemId) => {
    return knownItemIds.has(itemId) && progress.routeItemIds.includes(itemId);
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of catalog.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const itemId of catalog.requiredStockItemIds) {
    if (!stockItemIds.includes(itemId)) missing.push(`stock:${itemId}`);
  }

  for (const itemId of catalog.requiredCareItemIds) {
    if (!careItemIds.includes(itemId)) missing.push(`care-item:${itemId}`);
  }

  for (const itemId of catalog.requiredRouteItemIds) {
    if (!routeItemIds.includes(itemId)) missing.push(`route-item:${itemId}`);
  }

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === catalog.requiredProvisionSatchelId;
  if (!provisionReady) missing.push(`provision:${catalog.requiredProvisionSatchelId}`);

  const marketReady = progress.marketReceiptProof && progress.marketReceiptId === catalog.requiredMarketReceiptId;
  if (!marketReady) missing.push(`market-receipt:${catalog.requiredMarketReceiptId}`);

  if (!progress.tradeProof) missing.push('direct-trade');

  const craftReady = progress.craftWritProof && progress.craftWritId === catalog.requiredCraftWritId;
  if (!craftReady) missing.push(`craft:${catalog.requiredCraftWritId}`);

  const recoveryReady = progress.recoveryTeaProof && progress.recoveryTeaId === catalog.requiredRecoveryTeaId;
  if (!recoveryReady) missing.push(`recovery:${catalog.requiredRecoveryTeaId}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === catalog.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${catalog.requiredCareCycleId}`);

  const censusReady = progress.habitatCensusProof && progress.habitatCensusId === catalog.requiredHabitatCensusId;
  if (!censusReady) missing.push(`habitat-census:${catalog.requiredHabitatCensusId}`);

  if (localPresenceCount < catalog.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${catalog.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < catalog.requiredChatLines) missing.push(`chat:${chatLines.length}/${catalog.requiredChatLines}`);

  const score =
    Math.min(roster.length, catalog.requiredSpiritIds.length) * 2 +
    Math.min(stockItemIds.length, catalog.requiredStockItemIds.length) * 2 +
    Math.min(careItemIds.length, catalog.requiredCareItemIds.length) * 2 +
    Math.min(routeItemIds.length, catalog.requiredRouteItemIds.length) * 2 +
    (provisionReady ? 4 : 0) +
    (marketReady ? 3 : 0) +
    (progress.tradeProof ? 3 : 0) +
    (craftReady ? 4 : 0) +
    (recoveryReady ? 4 : 0) +
    (careCycleReady ? 3 : 0) +
    (censusReady ? 4 : 0) +
    (localPresenceCount >= catalog.requiredPresenceCount ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length >= catalog.requiredChatLines ? 1 : 0);
  const cataloged = missing.length === 0 && score >= catalog.requiredScore;
  const itemIds = Array.from(new Set([...stockItemIds, ...careItemIds, ...routeItemIds]));

  return {
    ok: true,
    cataloged,
    catalogId: catalog.id,
    catalogName: catalog.name,
    title: catalog.title,
    habitat: catalog.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    itemIds,
    careItemIds,
    routeItemIds,
    localPresenceCount,
    score,
    requiredScore: catalog.requiredScore,
    missing,
    rewardItemId: catalog.rewardItemId,
    message: cataloged
      ? `${catalog.name} complete: ${activeSpirit.name} indexes first-court lures, care provisions, recipe notes, habitat census records, recovery tea, market receipt, and direct trade proof for closed-alpha supply planning. No real value.`
      : `${catalog.name} needs ${missing.join(', ')} before the first-court recipe catalog can be sealed.`,
    source: 'item-provision-catalog'
  };
}

export function resolveSpiritBattleKit(
  progress: SpiritBattleKitProgress,
  kitId: string = SPIRIT_BATTLE_KITS[0].id
): SpiritBattleKitResult {
  const kit = SPIRIT_BATTLE_KITS.find((entry) => entry.id === kitId) || SPIRIT_BATTLE_KITS[0];
  const requiredSpiritIds = new Set(kit.requiredSpiritIds);
  const knownItemIds = new Set<string>(Object.values(ALPHA_ITEMS).map((item) => item.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const itemIds = kit.requiredItemIds.filter((itemId) => {
    return knownItemIds.has(itemId) && progress.itemIds.includes(itemId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleLeadReady = focusScore >= opponentScore && focusScore > 0 && opponentScore > 0;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of kit.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  if (partyIds.length < kit.requiredPartySize) missing.push(`party:${partyIds.length}/${kit.requiredPartySize}`);

  for (const itemId of kit.requiredItemIds) {
    if (!itemIds.includes(itemId)) missing.push(`kit-item:${itemId}`);
  }

  const catalogReady = progress.provisionCatalogProof && progress.provisionCatalogId === kit.requiredProvisionCatalogId;
  if (!catalogReady) missing.push(`provision-catalog:${kit.requiredProvisionCatalogId}`);

  const techniqueReady = progress.techniqueCodexProof && progress.techniqueCodexId === kit.requiredTechniqueCodexId;
  if (!techniqueReady) missing.push(`technique-codex:${kit.requiredTechniqueCodexId}`);

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === kit.requiredConditionWeaveId;
  if (!conditionReady) missing.push(`condition-weave:${kit.requiredConditionWeaveId}`);

  const affinityReady = progress.affinityMatrixProof && progress.affinityMatrixId === kit.requiredAffinityMatrixId;
  if (!affinityReady) missing.push(`affinity-matrix:${kit.requiredAffinityMatrixId}`);

  const recoveryReady = progress.recoveryTeaProof && progress.recoveryTeaId === kit.requiredRecoveryTeaId;
  if (!recoveryReady) missing.push(`recovery:${kit.requiredRecoveryTeaId}`);

  if (!progress.battleRoundProof || !progress.battleRoundVictory) missing.push('battle-round');
  if (!battleLeadReady) missing.push('battle-lead');
  if (localPresenceCount < kit.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${kit.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < kit.requiredChatLines) missing.push(`chat:${chatLines.length}/${kit.requiredChatLines}`);

  const score =
    Math.min(roster.length, kit.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, kit.requiredPartySize) * 2 +
    Math.min(itemIds.length, kit.requiredItemIds.length) * 3 +
    (catalogReady ? 5 : 0) +
    (techniqueReady ? 4 : 0) +
    (conditionReady ? 4 : 0) +
    (affinityReady ? 4 : 0) +
    (recoveryReady ? 4 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory ? 3 : 0) +
    (battleLeadReady ? 2 : 0) +
    (localPresenceCount >= kit.requiredPresenceCount ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length >= kit.requiredChatLines ? 1 : 0);
  const prepared = missing.length === 0 && score >= kit.requiredScore;

  return {
    ok: true,
    prepared,
    kitId: kit.id,
    kitName: kit.name,
    title: kit.title,
    habitat: kit.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    itemIds,
    localPresenceCount,
    score,
    requiredScore: kit.requiredScore,
    missing,
    rewardItemId: kit.rewardItemId,
    message: prepared
      ? `${kit.name} prepared: ${activeSpirit.name} carries harmony tea, jade thread, mooncake care, catalog recipes, technique codex planning, condition weave safety, affinity strategy, recovery tea, and no-injury battle proof. No real value.`
      : `${kit.name} needs ${missing.join(', ')} before the safe battle item kit can be tagged.`,
    source: 'item-battle-kit'
  };
}

export function resolveSpiritRemedyPouch(
  progress: SpiritRemedyPouchProgress,
  pouchId: string = SPIRIT_REMEDY_POUCHES[0].id
): SpiritRemedyPouchResult {
  const pouch = SPIRIT_REMEDY_POUCHES.find((entry) => entry.id === pouchId) || SPIRIT_REMEDY_POUCHES[0];
  const requiredSpiritIds = new Set(pouch.requiredSpiritIds);
  const requiredConditionIds = new Set(pouch.requiredConditionIds);
  const knownItemIds = new Set<string>(Object.values(ALPHA_ITEMS).map((item) => item.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const conditionIds = pouch.requiredConditionIds.filter((conditionId) => {
    return requiredConditionIds.has(conditionId) && progress.conditionIds.includes(conditionId);
  });
  const itemIds = pouch.requiredItemIds.filter((itemId) => {
    return knownItemIds.has(itemId) && progress.itemIds.includes(itemId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of pouch.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  if (partyIds.length < pouch.requiredPartySize) missing.push(`party:${partyIds.length}/${pouch.requiredPartySize}`);

  for (const conditionId of pouch.requiredConditionIds) {
    if (!conditionIds.includes(conditionId)) missing.push(`condition:${conditionId}`);
  }

  for (const itemId of pouch.requiredItemIds) {
    if (!itemIds.includes(itemId)) missing.push(`remedy-item:${itemId}`);
  }

  const recoveryReady = progress.recoveryTeaProof && progress.recoveryTeaId === pouch.requiredRecoveryTeaId;
  if (!recoveryReady) missing.push(`recovery:${pouch.requiredRecoveryTeaId}`);

  const battleKitReady = progress.battleKitProof && progress.battleKitId === pouch.requiredBattleKitId;
  if (!battleKitReady) missing.push(`battle-kit:${pouch.requiredBattleKitId}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === pouch.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${pouch.requiredCareCycleId}`);

  const sanctuaryReady = progress.sanctuaryRiteProof && progress.sanctuaryRiteId === pouch.requiredSanctuaryRiteId;
  if (!sanctuaryReady) missing.push(`sanctuary:${pouch.requiredSanctuaryRiteId}`);

  if (!progress.battleRoundProof || !progress.battleRoundVictory) missing.push('battle-round');
  if (localPresenceCount < pouch.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${pouch.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (chatLines.length < pouch.requiredChatLines) missing.push(`chat:${chatLines.length}/${pouch.requiredChatLines}`);

  const score =
    Math.min(roster.length, pouch.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, pouch.requiredPartySize) * 2 +
    Math.min(conditionIds.length, pouch.requiredConditionIds.length) * 3 +
    Math.min(itemIds.length, pouch.requiredItemIds.length) * 2 +
    (recoveryReady ? 4 : 0) +
    (battleKitReady ? 5 : 0) +
    (careCycleReady ? 3 : 0) +
    (sanctuaryReady ? 3 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory ? 3 : 0) +
    (localPresenceCount >= pouch.requiredPresenceCount ? 4 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length >= pouch.requiredChatLines ? 1 : 0);
  const prepared = missing.length === 0 && score >= pouch.requiredScore;

  return {
    ok: true,
    prepared,
    pouchId: pouch.id,
    pouchName: pouch.name,
    title: pouch.title,
    habitat: pouch.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    conditionIds,
    itemIds,
    localPresenceCount,
    score,
    requiredScore: pouch.requiredScore,
    missing,
    rewardItemId: pouch.rewardItemId,
    message: prepared
      ? `${pouch.name} prepared: ${activeSpirit.name} links recovery tea, battle kit safety, condition care, sanctuary rest, and no-injury battle notes for closed-alpha status care. No real value.`
      : `${pouch.name} needs ${missing.join(', ')} before the remedy pouch can be tagged.`,
    source: 'item-remedy-pouch'
  };
}

export function resolveSpiritKinshipAlbum(
  progress: SpiritKinshipAlbumProgress,
  albumId: string = SPIRIT_KINSHIP_ALBUMS[0].id
): SpiritKinshipAlbumResult {
  const album = SPIRIT_KINSHIP_ALBUMS.find((entry) => entry.id === albumId) || SPIRIT_KINSHIP_ALBUMS[0];
  const requiredSpiritIds = new Set(album.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : roster[roster.length - 1] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const bondBySpiritId = progress.bondBySpiritId || {};
  const totalBond = album.requiredSpiritIds.reduce((sum, spiritId) => {
    return sum + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
  }, 0);
  const allBonded = album.requiredSpiritIds.every((spiritId) => {
    return Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)) >= album.requiredBondPerSpirit;
  });
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const milestoneLabel = String(progress.raisingMilestoneLabel || '').trim();
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < album.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${album.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < album.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${album.requiredSpiritIds.length}`);
  if (localPresenceCount < album.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${album.requiredPresenceCount}`);
  if (!allBonded) missing.push(`bond:${totalBond}/${album.requiredBondPerSpirit * album.requiredSpiritIds.length}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === album.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${album.requiredCareCycleId}`);

  const nurtureReady = progress.nurtureRiteProof && progress.nurtureRiteId === album.requiredNurtureRiteId;
  if (!nurtureReady) missing.push(`nurture:${album.requiredNurtureRiteId}`);

  const growthReady = progress.growthRiteProof && progress.growthRiteId === album.requiredGrowthRiteId;
  if (!growthReady) missing.push(`growth:${album.requiredGrowthRiteId}`);

  const compendiumReady = progress.compendiumProof && progress.compendiumId === album.requiredCompendiumId;
  if (!compendiumReady) missing.push(`compendium:${album.requiredCompendiumId}`);

  const habitatReady = progress.habitatBondProof && progress.habitatBondId === album.requiredHabitatBondId;
  if (!habitatReady) missing.push(`habitat:${album.requiredHabitatBondId}`);

  const raisingReady = progress.raisingProof && milestoneLabel.length > 0;
  if (!raisingReady) missing.push('raising');

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, album.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, album.requiredSpiritIds.length) * 2 +
    (allBonded ? 9 : Math.min(9, totalBond)) +
    Math.min(localPresenceCount, album.requiredPresenceCount) * 2 +
    (careCycleReady ? 5 : 0) +
    (nurtureReady ? 5 : 0) +
    (growthReady ? 4 : 0) +
    (compendiumReady ? 4 : 0) +
    (habitatReady ? 3 : 0) +
    (raisingReady ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const recorded = missing.length === 0 && score >= album.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    recorded,
    albumId: album.id,
    albumName: album.name,
    title: album.title,
    habitat: album.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    caredSpiritIds,
    totalBond,
    localPresenceCount,
    score,
    requiredScore: album.requiredScore,
    missing,
    rewardItemId: album.rewardItemId,
    message: recorded
      ? `${album.name} recorded: ${activeSpirit.name} binds ${rosterNames || 'the first-court roster'} through care, nurture, growth, compendium, habitat, and social bond proof. No real value.`
      : `${album.name} needs ${missing.join(', ')} before the first-court kinship album can be recorded.`,
    source: 'spirit-kinship-album'
  };
}

export function resolveSpiritNurseryGrove(
  progress: SpiritNurseryGroveProgress,
  nurseryId: string = SPIRIT_NURSERY_GROVES[0].id
): SpiritNurseryGroveResult {
  const nursery = SPIRIT_NURSERY_GROVES.find((entry) => entry.id === nurseryId) || SPIRIT_NURSERY_GROVES[0];
  const requiredSpiritIds = new Set(nursery.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : partyIds[partyIds.length - 1] || roster[roster.length - 1] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const bondBySpiritId = progress.bondBySpiritId || {};
  const totalBond = nursery.requiredSpiritIds.reduce((sum, spiritId) => {
    return sum + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
  }, 0);
  const allBonded = nursery.requiredSpiritIds.every((spiritId) => {
    return Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)) >= nursery.requiredBondPerSpirit;
  });
  const milestoneLabel = String(progress.raisingMilestoneLabel || '').trim();
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  const missing: string[] = [];

  if (roster.length < nursery.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${nursery.requiredSpiritIds.length}`);
  if (partyIds.length < nursery.requiredSpiritIds.length) missing.push(`party:${partyIds.length}/${nursery.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < nursery.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${nursery.requiredSpiritIds.length}`);
  if (!allBonded) missing.push(`bond:${totalBond}/${nursery.requiredBondPerSpirit * nursery.requiredSpiritIds.length}`);
  if (localPresenceCount < nursery.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${nursery.requiredPresenceCount}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === nursery.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${nursery.requiredCareCycleId}`);

  const nurtureReady = progress.nurtureRiteProof && progress.nurtureRiteId === nursery.requiredNurtureRiteId;
  if (!nurtureReady) missing.push(`nurture:${nursery.requiredNurtureRiteId}`);

  const recoveryReady = progress.recoveryTeaProof && progress.recoveryTeaId === nursery.requiredRecoveryTeaId;
  if (!recoveryReady) missing.push(`recovery:${nursery.requiredRecoveryTeaId}`);

  const kinshipReady = progress.kinshipAlbumProof && progress.kinshipAlbumId === nursery.requiredKinshipAlbumId;
  if (!kinshipReady) missing.push(`kinship:${nursery.requiredKinshipAlbumId}`);

  const growthReady = progress.growthRiteProof && progress.growthRiteId === nursery.requiredGrowthRiteId;
  if (!growthReady) missing.push(`growth:${nursery.requiredGrowthRiteId}`);

  const raisingReady = progress.raisingProof && milestoneLabel.length > 0;
  if (!raisingReady) missing.push('raising');
  if (trainingXp < nursery.requiredTrainingXp) missing.push(`training:${trainingXp}/${nursery.requiredTrainingXp}`);
  if (sparLadderXp < nursery.requiredSparLadderXp) missing.push(`spar:${sparLadderXp}/${nursery.requiredSparLadderXp}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, nursery.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, nursery.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, nursery.requiredSpiritIds.length) +
    (allBonded ? 9 : Math.min(9, totalBond)) +
    Math.min(localPresenceCount, nursery.requiredPresenceCount) * 2 +
    (careCycleReady ? 4 : 0) +
    (nurtureReady ? 4 : 0) +
    (recoveryReady ? 4 : 0) +
    (kinshipReady ? 4 : 0) +
    (growthReady ? 4 : 0) +
    (raisingReady ? 3 : 0) +
    (trainingXp >= nursery.requiredTrainingXp ? 3 : 0) +
    (sparLadderXp >= nursery.requiredSparLadderXp ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cultivated = missing.length === 0 && score >= nursery.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cultivated,
    nurseryId: nursery.id,
    nurseryName: nursery.name,
    title: nursery.title,
    habitat: nursery.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    caredSpiritIds,
    totalBond,
    localPresenceCount,
    score,
    requiredScore: nursery.requiredScore,
    missing,
    rewardItemId: nursery.rewardItemId,
    message: cultivated
      ? `${nursery.name} cultivated: ${activeSpirit.name} steadies ${rosterNames || 'the first-court companions'} through raising, recovery, kinship, growth, and safe practice. No real value.`
      : `${nursery.name} needs ${missing.join(', ')} before the companion nursery can be cultivated.`,
    source: 'spirit-nursery-grove'
  };
}

export function resolveSpiritBloomAscendance(
  progress: SpiritBloomAscendanceProgress,
  ascendanceId: string = SPIRIT_BLOOM_ASCENDANCES[0].id
): SpiritBloomAscendanceResult {
  const ascendance = SPIRIT_BLOOM_ASCENDANCES.find((entry) => entry.id === ascendanceId) || SPIRIT_BLOOM_ASCENDANCES[0];
  const requiredSpiritIds = new Set(ascendance.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : partyIds[partyIds.length - 1] || roster[roster.length - 1] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const bondBySpiritId = progress.bondBySpiritId || {};
  const totalBond = ascendance.requiredSpiritIds.reduce((sum, spiritId) => {
    return sum + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
  }, 0);
  const allBonded = ascendance.requiredSpiritIds.every((spiritId) => {
    return Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)) >= ascendance.requiredBondPerSpirit;
  });
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < ascendance.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${ascendance.requiredSpiritIds.length}`);
  if (partyIds.length < ascendance.requiredSpiritIds.length) missing.push(`party:${partyIds.length}/${ascendance.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < ascendance.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${ascendance.requiredSpiritIds.length}`);
  if (!allBonded) missing.push(`bond:${totalBond}/${ascendance.requiredBondPerSpirit * ascendance.requiredSpiritIds.length}`);
  if (localPresenceCount < ascendance.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${ascendance.requiredPresenceCount}`);

  const nurseryReady = progress.nurseryGroveProof && progress.nurseryGroveId === ascendance.requiredNurseryGroveId;
  if (!nurseryReady) missing.push(`nursery:${ascendance.requiredNurseryGroveId}`);

  const nurtureReady = progress.nurtureRiteProof && progress.nurtureRiteId === ascendance.requiredNurtureRiteId;
  if (!nurtureReady) missing.push(`nurture:${ascendance.requiredNurtureRiteId}`);

  const kinshipReady = progress.kinshipAlbumProof && progress.kinshipAlbumId === ascendance.requiredKinshipAlbumId;
  if (!kinshipReady) missing.push(`kinship:${ascendance.requiredKinshipAlbumId}`);

  const growthReady = progress.growthRiteProof && progress.growthRiteId === ascendance.requiredGrowthRiteId;
  if (!growthReady) missing.push(`growth:${ascendance.requiredGrowthRiteId}`);

  const traitReady = progress.traitAttunementProof && progress.traitAttunementId === ascendance.requiredTraitId;
  if (!traitReady) missing.push(`trait:${ascendance.requiredTraitId}`);

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === ascendance.requiredConditionWeaveId;
  if (!conditionReady) missing.push(`condition:${ascendance.requiredConditionWeaveId}`);

  const matrixReady = progress.affinityMatrixProof && progress.affinityMatrixId === ascendance.requiredAffinityMatrixId;
  if (!matrixReady) missing.push(`matrix:${ascendance.requiredAffinityMatrixId}`);

  const battleReady = progress.battleRoundProof && progress.battleRoundVictory;
  if (!battleReady) missing.push('battle-round');
  if (trainingXp < ascendance.requiredTrainingXp) missing.push(`training:${trainingXp}/${ascendance.requiredTrainingXp}`);
  if (sparLadderXp < ascendance.requiredSparLadderXp) missing.push(`spar:${sparLadderXp}/${ascendance.requiredSparLadderXp}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, ascendance.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, ascendance.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, ascendance.requiredSpiritIds.length) +
    (allBonded ? 9 : Math.min(9, totalBond)) +
    Math.min(localPresenceCount, ascendance.requiredPresenceCount) * 2 +
    (nurseryReady ? 6 : 0) +
    (nurtureReady ? 4 : 0) +
    (kinshipReady ? 4 : 0) +
    (growthReady ? 4 : 0) +
    (traitReady ? 4 : 0) +
    (conditionReady ? 4 : 0) +
    (matrixReady ? 6 : 0) +
    (battleReady ? 5 : 0) +
    (trainingXp >= ascendance.requiredTrainingXp ? 3 : 0) +
    (sparLadderXp >= ascendance.requiredSparLadderXp ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const ascended = missing.length === 0 && score >= ascendance.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    ascended,
    ascendanceId: ascendance.id,
    ascendanceName: ascendance.name,
    title: ascendance.title,
    formTitle: ascendance.formTitle,
    habitat: ascendance.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    caredSpiritIds,
    totalBond,
    localPresenceCount,
    score,
    requiredScore: ascendance.requiredScore,
    missing,
    rewardItemId: ascendance.rewardItemId,
    message: ascended
      ? `${ascendance.name} complete: ${activeSpirit.name} and ${partyNames || 'the first-court party'} enter ${ascendance.formTitle} through nursery care, kinship, growth, affinity planning, and no-injury battle readiness. No real value.`
      : `${ascendance.name} needs ${missing.join(', ')} before the first-court form ascendance can be recorded.`,
    source: 'spirit-bloom-ascendance'
  };
}

export function resolveSpiritLineageRegister(
  progress: SpiritLineageRegisterProgress,
  registerId: string = SPIRIT_LINEAGE_REGISTERS[0].id
): SpiritLineageRegisterResult {
  const register = SPIRIT_LINEAGE_REGISTERS.find((entry) => entry.id === registerId) || SPIRIT_LINEAGE_REGISTERS[0];
  const requiredSpiritIds = new Set(register.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const caredSpiritIds = Array.from(new Set(progress.caredSpiritIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId =
    progress.activeSpiritId && roster.includes(progress.activeSpiritId)
      ? progress.activeSpiritId
      : partyIds[partyIds.length - 1] || roster[roster.length - 1] || roster[0];
  const activeSpirit = getMochiSpirit(activeSpiritId || '') || MOCHI_SPIRITS[0];
  const bondBySpiritId = progress.bondBySpiritId || {};
  const totalBond = register.requiredSpiritIds.reduce((sum, spiritId) => {
    return sum + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0));
  }, 0);
  const allBonded = register.requiredSpiritIds.every((spiritId) => {
    return Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)) >= register.requiredBondPerSpirit;
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const milestoneLabels = Array.from(
    new Set([
      String(progress.growthForm || '').trim(),
      String(progress.raisingMilestoneLabel || '').trim(),
      ...roster.flatMap((spiritId) => {
        const spirit = getMochiSpirit(spiritId);
        return spirit ? spirit.bondMilestones.slice(-1).map((milestone) => milestone.label) : [];
      })
    ].filter(Boolean))
  );
  const missing: string[] = [];

  if (roster.length < register.requiredSpiritIds.length) missing.push(`roster:${roster.length}/${register.requiredSpiritIds.length}`);
  if (partyIds.length < register.requiredSpiritIds.length) missing.push(`party:${partyIds.length}/${register.requiredSpiritIds.length}`);
  if (caredSpiritIds.length < register.requiredSpiritIds.length) missing.push(`care:${caredSpiritIds.length}/${register.requiredSpiritIds.length}`);
  if (!allBonded) missing.push(`bond:${totalBond}/${register.requiredBondPerSpirit * register.requiredSpiritIds.length}`);
  if (localPresenceCount < register.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${register.requiredPresenceCount}`);

  const kinshipReady = progress.kinshipAlbumProof && progress.kinshipAlbumId === register.requiredKinshipAlbumId;
  if (!kinshipReady) missing.push(`kinship:${register.requiredKinshipAlbumId}`);

  const nurseryReady = progress.nurseryGroveProof && progress.nurseryGroveId === register.requiredNurseryGroveId;
  if (!nurseryReady) missing.push(`nursery:${register.requiredNurseryGroveId}`);

  const bloomReady = progress.bloomAscendanceProof && progress.bloomAscendanceId === register.requiredBloomAscendanceId;
  if (!bloomReady) missing.push(`bloom:${register.requiredBloomAscendanceId}`);

  const captureRiteReady = progress.captureRiteProof && progress.captureRiteId === register.requiredCaptureRiteId;
  if (!captureRiteReady) missing.push(`capture-rite:${register.requiredCaptureRiteId}`);

  const careCycleReady = progress.careCycleProof && progress.careCycleId === register.requiredCareCycleId;
  if (!careCycleReady) missing.push(`care-cycle:${register.requiredCareCycleId}`);

  const growthReady = progress.growthRiteProof && progress.growthRiteId === register.requiredGrowthRiteId;
  if (!growthReady) missing.push(`growth:${register.requiredGrowthRiteId}`);

  if (!progress.raisingProof) missing.push('raising');
  if (!milestoneLabels.length) missing.push('milestone');
  if (trainingXp < register.requiredTrainingXp) missing.push(`training:${trainingXp}/${register.requiredTrainingXp}`);
  if (sparLadderXp < register.requiredSparLadderXp) missing.push(`spar:${sparLadderXp}/${register.requiredSparLadderXp}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat:0/1');

  const score =
    Math.min(roster.length, register.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, register.requiredSpiritIds.length) * 2 +
    Math.min(caredSpiritIds.length, register.requiredSpiritIds.length) * 2 +
    (allBonded ? 9 : Math.min(9, totalBond)) +
    Math.min(localPresenceCount, register.requiredPresenceCount) * 2 +
    (kinshipReady ? 4 : 0) +
    (nurseryReady ? 6 : 0) +
    (bloomReady ? 6 : 0) +
    (captureRiteReady ? 5 : 0) +
    (careCycleReady ? 4 : 0) +
    (growthReady ? 4 : 0) +
    (progress.raisingProof ? 3 : 0) +
    (milestoneLabels.length ? 2 : 0) +
    (trainingXp >= register.requiredTrainingXp ? 3 : 0) +
    (sparLadderXp >= register.requiredSparLadderXp ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const registered = missing.length === 0 && score >= register.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    registered,
    registerId: register.id,
    registerName: register.name,
    title: register.title,
    habitat: register.habitat,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    roster,
    partyIds,
    caredSpiritIds,
    totalBond,
    milestoneLabels,
    localPresenceCount,
    score,
    requiredScore: register.requiredScore,
    missing,
    rewardItemId: register.rewardItemId,
    message: registered
      ? `${register.name} recorded: ${activeSpirit.name} links ${rosterNames || 'the first-court roster'} through capture, care, kinship, nursery, bloom, growth, raising, and bond milestones. No real value.`
      : `${register.name} needs ${missing.join(', ')} before the first-court lineage record can be sealed.`,
    source: 'spirit-lineage-register'
  };
}

export function resolveGuildCommission(
  progress: GuildCommissionProgress,
  commissionId: string = GUILD_COMMISSIONS[0].id
): GuildCommissionResult {
  const commission = GUILD_COMMISSIONS.find((entry) => entry.id === commissionId) || GUILD_COMMISSIONS[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return MOCHI_SPIRIT_QUESTS.some((quest) => quest.id === questId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const missing: string[] = [];

  if (roster.length < commission.requiredRosterCount) {
    missing.push(`roster:${roster.length}/${commission.requiredRosterCount}`);
  }

  const journalCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  if (journalCount < commission.requiredJournalCount) {
    missing.push(`journal:${journalCount}/${commission.requiredJournalCount}`);
  }

  if (!progress.questChainProof || completedQuestIds.length < commission.requiredCompletedQuestCount) {
    missing.push(`quests:${completedQuestIds.length}/${commission.requiredCompletedQuestCount}`);
  }

  const provisionReady = progress.provisionProof && progress.provisionSatchelId === commission.requiredProvisionSatchelId;
  if (!provisionReady) {
    missing.push(`provision:${commission.requiredProvisionSatchelId}`);
  }

  if (!progress.marketProof) {
    missing.push('market-listing');
  }

  if (!progress.tradeProof) {
    missing.push('direct-trade');
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < commission.requiredTrainingXp) {
    missing.push(`training:${trainingXp}/${commission.requiredTrainingXp}`);
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter(Boolean) : [];
  const score =
    Math.min(roster.length, commission.requiredRosterCount) * 2 +
    Math.min(journalCount, commission.requiredJournalCount) +
    Math.min(completedQuestIds.length, commission.requiredCompletedQuestCount) * 2 +
    (provisionReady ? 4 : 0) +
    (progress.marketProof ? 2 : 0) +
    (progress.tradeProof ? 2 : 0) +
    Math.min(trainingXp, commission.requiredTrainingXp + 2) +
    (progress.profileViewed ? 2 : 0) +
    (progress.guildBuddyProof ? 2 : 0) +
    (progress.statusMood ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const completed = missing.length === 0 && score >= commission.requiredScore;
  const activeName = getMochiSpirit(activeSpiritId || '')?.name || 'the first-court roster';

  return {
    ok: true,
    completed,
    commissionId: commission.id,
    commissionName: commission.name,
    title: commission.title,
    habitat: commission.habitat,
    activeSpiritId,
    roster,
    completedQuestIds,
    score,
    requiredScore: commission.requiredScore,
    missing,
    rewardItemId: commission.rewardItemId,
    message: completed
      ? `${commission.name} complete: ${activeName} signs a first social commission with quest, provision, training, market, trade, profile, guild buddy, and status proof. No-real-value guild reputation only.`
      : `${commission.name} needs ${missing.join(', ')} before the first social commission can be recorded.`,
    source: 'guild-commission-ledger'
  };
}

export function resolveGuildSocialRally(
  progress: GuildSocialRallyProgress,
  rallyId: string = GUILD_SOCIAL_RALLIES[0].id
): GuildSocialRallyResult {
  const rally = GUILD_SOCIAL_RALLIES.find((entry) => entry.id === rallyId) || GUILD_SOCIAL_RALLIES[0];
  const requiredSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => requiredSpiritIds.has(spiritId));
  const missing: string[] = [];

  if (partyIds.length < rally.requiredPartySize) {
    missing.push(`party:${partyIds.length}/${rally.requiredPartySize}`);
  }

  const localPresenceCount = Math.max(1, Math.floor(progress.localPresenceCount || 1));
  if (localPresenceCount < rally.requiredPresenceCount) {
    missing.push(`presence:${localPresenceCount}/${rally.requiredPresenceCount}`);
  }

  if (!progress.profileViewed) {
    missing.push('profile');
  }

  if (!progress.guildBuddyProof) {
    missing.push('guild-buddy');
  }

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (!chatLines.length) {
    missing.push('chat');
  }

  if (!progress.emoteProof) {
    missing.push('emote');
  }

  if (!progress.commissionProof) {
    missing.push('commission');
  }

  if (!progress.harmonyFormProof) {
    missing.push('harmony');
  }

  if (!progress.harmonyTrialProof) {
    missing.push('concord');
  }

  if (!progress.teamSparMatchProof) {
    missing.push('team-match');
  }

  const score =
    Math.min(partyIds.length, rally.requiredPartySize) * 2 +
    Math.min(localPresenceCount, rally.requiredPresenceCount) * 3 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 2 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0) +
    (progress.emoteProof ? 1 : 0) +
    (progress.commissionProof ? 3 : 0) +
    (progress.harmonyFormProof ? 3 : 0) +
    (progress.harmonyTrialProof ? 3 : 0) +
    (progress.teamSparMatchProof ? 3 : 0);
  const rallied = missing.length === 0 && score >= rally.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    rallied,
    rallyId: rally.id,
    rallyName: rally.name,
    title: rally.title,
    habitat: rally.habitat,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: rally.requiredScore,
    missing,
    rewardItemId: rally.rewardItemId,
    message: rallied
      ? `${rally.name} complete: ${partyNames} rally with ${localPresenceCount} local testers, chat, emote, commission, and no-injury party proof. No-real-value social proof only.`
      : `${rally.name} needs ${missing.join(', ')} before the two-tester guild rally can be recorded.`,
    source: 'guild-social-rally'
  };
}

export function resolveMochiQuestLedger(
  progress: MochiQuestLedgerProgress,
  ledgerId: string = MOCHI_QUEST_LEDGERS[0].id
): MochiQuestLedgerResult {
  const ledger = MOCHI_QUEST_LEDGERS.find((entry) => entry.id === ledgerId) || MOCHI_QUEST_LEDGERS[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const acceptedQuestIds = Array.from(new Set(progress.acceptedQuestIds.filter(Boolean))).filter((questId) => {
    return ledger.requiredQuestIds.includes(questId);
  });
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return ledger.requiredQuestIds.includes(questId);
  });
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < ledger.requiredSpiritCount) missing.push(`roster:${roster.length}/${ledger.requiredSpiritCount}`);
  if (acceptedQuestIds.length < ledger.requiredQuestIds.length) missing.push(`accepted:${acceptedQuestIds.length}/${ledger.requiredQuestIds.length}`);
  if (completedQuestIds.length < ledger.requiredQuestIds.length || !progress.questChainProof) {
    missing.push(`quests:${completedQuestIds.length}/${ledger.requiredQuestIds.length}`);
  }
  if (journalDiscoveredCount < ledger.requiredJournalCount) missing.push(`journal:${journalDiscoveredCount}/${ledger.requiredJournalCount}`);
  if (localPresenceCount < ledger.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${ledger.requiredPresenceCount}`);
  if (!progress.routeMasteryProof || progress.routeMasteryId !== SPIRIT_ROUTE_MASTERIES[0].id) missing.push(`route-mastery:${SPIRIT_ROUTE_MASTERIES[0].id}`);
  if (!progress.routePatrolProof || progress.routePatrolId !== SPIRIT_ROUTE_PATROLS[0].id) missing.push(`route-patrol:${SPIRIT_ROUTE_PATROLS[0].id}`);
  if (!progress.marketReceiptProof || progress.marketReceiptId !== MARKET_GUILD_RECEIPTS[0].id) missing.push(`market-receipt:${MARKET_GUILD_RECEIPTS[0].id}`);
  if (!progress.provisionProof || progress.provisionSatchelId !== SPIRIT_PROVISION_SATCHELS[0].id) missing.push(`provision:${SPIRIT_PROVISION_SATCHELS[0].id}`);
  if (!progress.commissionProof || progress.commissionId !== GUILD_COMMISSIONS[0].id) missing.push(`commission:${GUILD_COMMISSIONS[0].id}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, ledger.requiredSpiritCount) * 2 +
    Math.min(acceptedQuestIds.length, ledger.requiredQuestIds.length) +
    Math.min(completedQuestIds.length, ledger.requiredQuestIds.length) * 3 +
    Math.min(journalDiscoveredCount, ledger.requiredJournalCount) * 2 +
    Math.min(localPresenceCount, ledger.requiredPresenceCount) * 2 +
    (progress.questChainProof ? 4 : 0) +
    (progress.routeMasteryProof && progress.routeMasteryId === SPIRIT_ROUTE_MASTERIES[0].id ? 3 : 0) +
    (progress.routePatrolProof && progress.routePatrolId === SPIRIT_ROUTE_PATROLS[0].id ? 3 : 0) +
    (progress.marketReceiptProof && progress.marketReceiptId === MARKET_GUILD_RECEIPTS[0].id ? 2 : 0) +
    (progress.provisionProof && progress.provisionSatchelId === SPIRIT_PROVISION_SATCHELS[0].id ? 2 : 0) +
    (progress.commissionProof && progress.commissionId === GUILD_COMMISSIONS[0].id ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const recorded = missing.length === 0 && score >= ledger.requiredScore;
  const questNames = completedQuestIds
    .map((questId) => MOCHI_SPIRIT_QUESTS.find((quest) => quest.id === questId)?.title || questId)
    .join(', ');

  return {
    ok: true,
    recorded,
    ledgerId: ledger.id,
    ledgerName: ledger.name,
    title: ledger.title,
    habitat: ledger.habitat,
    roster,
    acceptedQuestIds,
    completedQuestIds,
    localPresenceCount,
    score,
    requiredScore: ledger.requiredScore,
    missing,
    rewardItemId: ledger.rewardItemId,
    message: recorded
      ? `${ledger.name} sealed: ${questNames} become a first-court Mochirii quest record with roster, journal, route, market, provision, commission, and social proof. No real value.`
      : `${ledger.name} needs ${missing.join(', ')} before the first-court quest ledger can be sealed.`,
    source: 'quest-ledger'
  };
}

export function resolveMochiStoryChapter(
  progress: MochiStoryChapterProgress,
  chapterId: string = MOCHI_STORY_CHAPTERS[0].id
): MochiStoryChapterResult {
  const chapter = MOCHI_STORY_CHAPTERS.find((entry) => entry.id === chapterId) || MOCHI_STORY_CHAPTERS[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return chapter.requiredQuestIds.includes(questId);
  });
  const routeIds = Array.from(new Set(progress.discoveredRoutes.filter(Boolean))).filter((routeId) => {
    return chapter.requiredRouteIds.includes(routeId);
  });
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of chapter.requiredSpiritIds) {
    if (!roster.includes(spiritId)) missing.push(`roster:${spiritId}`);
    if (!partyIds.includes(spiritId)) missing.push(`party:${spiritId}`);
  }

  for (const questId of chapter.requiredQuestIds) {
    if (!completedQuestIds.includes(questId)) missing.push(`quest:${questId}`);
  }

  for (const routeId of chapter.requiredRouteIds) {
    if (!routeIds.includes(routeId)) missing.push(`route:${routeId}`);
  }

  if (journalDiscoveredCount < MOCHI_SPIRITS.length) missing.push(`journal:${journalDiscoveredCount}/${MOCHI_SPIRITS.length}`);
  if (localPresenceCount < chapter.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${chapter.requiredPresenceCount}`);
  if (!progress.routeEcologyProof || progress.routeEcologyId !== SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id) missing.push('route-ecology');
  if (!progress.routeWaystoneProof || progress.routeWaystoneId !== SPIRIT_ROUTE_WAYSTONES[0].id) missing.push('route-waystone');
  if (!progress.questLedgerProof || progress.questLedgerId !== chapter.requiredQuestLedgerId) missing.push(`quest-ledger:${chapter.requiredQuestLedgerId}`);
  if (!progress.nurtureRiteProof || progress.nurtureRiteId !== chapter.requiredNurtureRiteId) missing.push(`nurture:${chapter.requiredNurtureRiteId}`);
  if (!progress.tournamentProof || progress.tournamentId !== chapter.requiredTournamentBracketId) missing.push(`tournament:${chapter.requiredTournamentBracketId}`);
  if (!progress.commissionProof || progress.commissionId !== chapter.requiredCommissionId) missing.push(`commission:${chapter.requiredCommissionId}`);
  if (!progress.rallyProof || progress.rallyId !== chapter.requiredRallyId) missing.push(`rally:${chapter.requiredRallyId}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!progress.emoteProof) missing.push('emote');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, chapter.requiredSpiritIds.length) * 2 +
    Math.min(partyIds.length, chapter.requiredSpiritIds.length) * 2 +
    Math.min(completedQuestIds.length, chapter.requiredQuestIds.length) * 2 +
    Math.min(routeIds.length, chapter.requiredRouteIds.length) * 2 +
    Math.min(journalDiscoveredCount, MOCHI_SPIRITS.length) * 2 +
    Math.min(localPresenceCount, chapter.requiredPresenceCount) * 2 +
    (progress.routeEcologyProof && progress.routeEcologyId === SPIRIT_ROUTE_ECOLOGY_SURVEYS[0].id ? 3 : 0) +
    (progress.routeWaystoneProof && progress.routeWaystoneId === SPIRIT_ROUTE_WAYSTONES[0].id ? 3 : 0) +
    (progress.questLedgerProof && progress.questLedgerId === chapter.requiredQuestLedgerId ? 3 : 0) +
    (progress.nurtureRiteProof && progress.nurtureRiteId === chapter.requiredNurtureRiteId ? 3 : 0) +
    (progress.tournamentProof && progress.tournamentId === chapter.requiredTournamentBracketId ? 4 : 0) +
    (progress.commissionProof && progress.commissionId === chapter.requiredCommissionId ? 3 : 0) +
    (progress.rallyProof && progress.rallyId === chapter.requiredRallyId ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (progress.emoteProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const recorded = missing.length === 0 && score >= chapter.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    recorded,
    chapterId: chapter.id,
    chapterName: chapter.name,
    title: chapter.title,
    narratorName: chapter.narratorName,
    habitat: chapter.habitat,
    roster,
    partyIds,
    completedQuestIds,
    routeIds,
    localPresenceCount,
    score,
    requiredScore: chapter.requiredScore,
    missing,
    rewardItemId: chapter.rewardItemId,
    message: recorded
      ? `${chapter.name} recorded: ${chapter.narratorName} binds ${rosterNames} into a first-court Mochirii story across care, routes, quest ledger vows, guild rally, tournament, and social proof. No real value.`
      : `${chapter.name} needs ${missing.join(', ')} before the roleplay chapter can be recorded.`,
    source: 'story-chapter'
  };
}

export function resolveGuildInsigniaCase(
  progress: GuildInsigniaCaseProgress,
  caseId: string = GUILD_INSIGNIA_CASES[0].id
): GuildInsigniaCaseResult {
  const insigniaCase = GUILD_INSIGNIA_CASES.find((entry) => entry.id === caseId) || GUILD_INSIGNIA_CASES[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < insigniaCase.requiredSpiritCount) missing.push(`roster:${roster.length}/${insigniaCase.requiredSpiritCount}`);
  if (partyIds.length < insigniaCase.requiredSpiritCount) missing.push(`party:${partyIds.length}/${insigniaCase.requiredSpiritCount}`);
  if (localPresenceCount < insigniaCase.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${insigniaCase.requiredPresenceCount}`);
  if (!progress.routeMasteryProof || progress.routeMasteryId !== SPIRIT_ROUTE_MASTERIES[0].id) missing.push(`route-mastery:${SPIRIT_ROUTE_MASTERIES[0].id}`);
  if (!progress.routePatrolProof || progress.routePatrolId !== SPIRIT_ROUTE_PATROLS[0].id) missing.push(`route-patrol:${SPIRIT_ROUTE_PATROLS[0].id}`);
  if (!progress.guildRankProof || progress.guildRankId !== GUILD_RANK_TRIALS[0].id) missing.push(`rank:${GUILD_RANK_TRIALS[0].id}`);
  if (!progress.growthRiteProof || progress.growthRiteId !== SPIRIT_GROWTH_RITES[0].id) missing.push(`growth:${SPIRIT_GROWTH_RITES[0].id}`);
  if (!progress.tournamentProof || progress.tournamentId !== SPIRIT_TOURNAMENT_BRACKETS[0].id) missing.push(`tournament:${SPIRIT_TOURNAMENT_BRACKETS[0].id}`);
  if (!progress.storyChapterProof || progress.storyChapterId !== MOCHI_STORY_CHAPTERS[0].id) missing.push(`story:${MOCHI_STORY_CHAPTERS[0].id}`);
  if (!progress.harmonyFormProof || progress.harmonyFormId !== SPIRIT_HARMONY_FORMS[0].id) missing.push(`harmony:${SPIRIT_HARMONY_FORMS[0].id}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!progress.emoteProof) missing.push('emote');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, insigniaCase.requiredSpiritCount) * 2 +
    Math.min(partyIds.length, insigniaCase.requiredSpiritCount) * 2 +
    Math.min(localPresenceCount, insigniaCase.requiredPresenceCount) * 2 +
    (progress.routeMasteryProof && progress.routeMasteryId === SPIRIT_ROUTE_MASTERIES[0].id ? 3 : 0) +
    (progress.routePatrolProof && progress.routePatrolId === SPIRIT_ROUTE_PATROLS[0].id ? 3 : 0) +
    (progress.guildRankProof && progress.guildRankId === GUILD_RANK_TRIALS[0].id ? 3 : 0) +
    (progress.growthRiteProof && progress.growthRiteId === SPIRIT_GROWTH_RITES[0].id ? 3 : 0) +
    (progress.tournamentProof && progress.tournamentId === SPIRIT_TOURNAMENT_BRACKETS[0].id ? 4 : 0) +
    (progress.storyChapterProof && progress.storyChapterId === MOCHI_STORY_CHAPTERS[0].id ? 4 : 0) +
    (progress.harmonyFormProof && progress.harmonyFormId === SPIRIT_HARMONY_FORMS[0].id ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (progress.emoteProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const completed = missing.length === 0 && score >= insigniaCase.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    completed,
    caseId: insigniaCase.id,
    caseName: insigniaCase.name,
    title: insigniaCase.title,
    habitat: insigniaCase.habitat,
    roster,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: insigniaCase.requiredScore,
    missing,
    rewardItemId: insigniaCase.rewardItemId,
    message: completed
      ? `${insigniaCase.name} sealed: ${partyNames} carry route, rank, growth, harmony, tournament, story, and social insignia for closed-alpha Mochirii progression. No real value.`
      : `${insigniaCase.name} needs ${missing.join(', ')} before the progression case can be sealed.`,
    source: 'guild-insignia-case'
  };
}

export function resolveGuildWayfarerChronicle(
  progress: GuildWayfarerChronicleProgress,
  chronicleId: string = GUILD_WAYFARER_CHRONICLES[0].id
): GuildWayfarerChronicleResult {
  const chronicle = GUILD_WAYFARER_CHRONICLES.find((entry) => entry.id === chronicleId) || GUILD_WAYFARER_CHRONICLES[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return MOCHI_SPIRIT_QUESTS.some((quest) => quest.id === questId);
  });
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < chronicle.requiredSpiritCount) missing.push(`roster:${roster.length}/${chronicle.requiredSpiritCount}`);
  if (partyIds.length < chronicle.requiredSpiritCount) missing.push(`party:${partyIds.length}/${chronicle.requiredSpiritCount}`);
  if (journalDiscoveredCount < chronicle.requiredJournalCount) missing.push(`journal:${journalDiscoveredCount}/${chronicle.requiredJournalCount}`);
  if (completedQuestIds.length < chronicle.requiredQuestCount || !progress.questChainProof) missing.push(`quests:${completedQuestIds.length}/${chronicle.requiredQuestCount}`);
  if (localPresenceCount < chronicle.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${chronicle.requiredPresenceCount}`);
  if (!progress.starterVowProof) missing.push('starter-vow');
  if (!progress.captureProof) missing.push('capture');
  if (!progress.captureRiteProof) missing.push('capture-rite');
  if (!progress.encounterAtlasProof) missing.push('encounter-atlas');
  if (!progress.habitatCensusProof) missing.push('habitat-census');
  if (!progress.routeMasteryProof) missing.push('route-mastery');
  if (!progress.routePatrolProof) missing.push('route-patrol');
  if (!progress.routeEcologyProof) missing.push('route-ecology');
  if (!progress.habitatBondProof) missing.push('habitat-bond');
  if (!progress.researchProof) missing.push('research');
  if (!progress.compendiumProof) missing.push('compendium');
  if (!progress.provisionProof) missing.push('provision');
  if (!progress.provisionCatalogProof) missing.push('provision-catalog');
  if (!progress.battleKitProof) missing.push('battle-kit');
  if (!progress.remedyPouchProof) missing.push('remedy-pouch');
  if (!progress.questLedgerProof) missing.push('quest-ledger');
  if (!progress.rosterCabinetProof) missing.push('roster-cabinet');
  if (!progress.craftWritProof) missing.push('craft-writ');
  if (!progress.routeWaystoneProof) missing.push('route-waystone');
  if (!progress.nurtureRiteProof) missing.push('nurture-rite');
  if (!progress.kinshipAlbumProof) missing.push('kinship');
  if (!progress.nurseryGroveProof) missing.push('nursery-grove');
  if (!progress.bloomAscendanceProof) missing.push('bloom-ascendance');
  if (!progress.lineageRegisterProof) missing.push('lineage-register');
  if (!progress.exchangeAccordProof) missing.push('exchange-accord');
  if (!progress.affinityMatrixProof) missing.push('affinity-matrix');
  if (!progress.techniqueCodexProof) missing.push('technique-codex');
  if (!progress.relicAttunementProof) missing.push('relic-attunement');
  if (!progress.commissionProof) missing.push('commission');
  if (!progress.rallyProof) missing.push('rally');
  if (!progress.techniqueLoadoutProof) missing.push('loadout');
  if (!progress.traitAttunementProof) missing.push('trait');
  if (!progress.conditionWeaveProof) missing.push('condition-weave');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.growthRiteProof) missing.push('growth');
  if (!progress.harmonyFormProof) missing.push('harmony');
  if (!progress.harmonyTrialProof) missing.push('concord');
  if (!progress.teamSparMatchProof) missing.push('team-match');
  if (!progress.mentorChallengeProof) missing.push('mentor');
  if (!progress.dojoLadderProof) missing.push('dojo-ladder');
  if (!progress.sifuCouncilProof) missing.push('sifu-council');
  if (!progress.summitCircuitProof) missing.push('summit-circuit');
  if (!progress.tournamentProof) missing.push('tournament');
  if (!progress.storyChapterProof) missing.push('story');
  if (!progress.insigniaCaseProof) missing.push('insignia');
  if (!progress.battleRoundProof || !progress.battleRoundVictory) missing.push('battle-round');
  if (!progress.marketProof) missing.push('market');
  if (!progress.marketReceiptProof) missing.push('market-receipt');
  if (!progress.tradeProof) missing.push('trade');
  if (!progress.canaryPreviewProof) missing.push('canary-preview');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, chronicle.requiredSpiritCount) * 2 +
    Math.min(partyIds.length, chronicle.requiredSpiritCount) * 2 +
    Math.min(journalDiscoveredCount, chronicle.requiredJournalCount) * 2 +
    Math.min(completedQuestIds.length, chronicle.requiredQuestCount) * 2 +
    Math.min(localPresenceCount, chronicle.requiredPresenceCount) * 3 +
    (progress.starterVowProof ? 2 : 0) +
    (progress.captureProof ? 2 : 0) +
    (progress.captureRiteProof ? 3 : 0) +
    (progress.encounterAtlasProof ? 3 : 0) +
    (progress.habitatCensusProof ? 3 : 0) +
    (progress.routeMasteryProof ? 3 : 0) +
    (progress.routePatrolProof ? 3 : 0) +
    (progress.routeEcologyProof ? 3 : 0) +
    (progress.habitatBondProof ? 2 : 0) +
    (progress.researchProof ? 2 : 0) +
    (progress.compendiumProof ? 3 : 0) +
    (progress.provisionProof ? 2 : 0) +
    (progress.provisionCatalogProof ? 3 : 0) +
    (progress.battleKitProof ? 3 : 0) +
    (progress.remedyPouchProof ? 3 : 0) +
    (progress.questLedgerProof ? 3 : 0) +
    (progress.rosterCabinetProof ? 3 : 0) +
    (progress.craftWritProof ? 3 : 0) +
    (progress.routeWaystoneProof ? 3 : 0) +
    (progress.nurtureRiteProof ? 3 : 0) +
    (progress.kinshipAlbumProof ? 3 : 0) +
    (progress.nurseryGroveProof ? 3 : 0) +
    (progress.bloomAscendanceProof ? 3 : 0) +
    (progress.lineageRegisterProof ? 3 : 0) +
    (progress.exchangeAccordProof ? 3 : 0) +
    (progress.affinityMatrixProof ? 3 : 0) +
    (progress.techniqueCodexProof ? 3 : 0) +
    (progress.relicAttunementProof ? 3 : 0) +
    (progress.commissionProof ? 2 : 0) +
    (progress.rallyProof ? 3 : 0) +
    (progress.techniqueLoadoutProof ? 2 : 0) +
    (progress.traitAttunementProof ? 2 : 0) +
    (progress.conditionWeaveProof ? 2 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    (progress.harmonyFormProof ? 2 : 0) +
    (progress.harmonyTrialProof ? 2 : 0) +
    (progress.teamSparMatchProof ? 2 : 0) +
    (progress.mentorChallengeProof ? 2 : 0) +
    (progress.dojoLadderProof ? 3 : 0) +
    (progress.sifuCouncilProof ? 3 : 0) +
    (progress.summitCircuitProof ? 3 : 0) +
    (progress.tournamentProof ? 3 : 0) +
    (progress.storyChapterProof ? 3 : 0) +
    (progress.insigniaCaseProof ? 3 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory ? 2 : 0) +
    (progress.marketProof ? 1 : 0) +
    (progress.marketReceiptProof ? 2 : 0) +
    (progress.tradeProof ? 1 : 0) +
    (progress.canaryPreviewProof ? 1 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const chronicled = missing.length === 0 && score >= chronicle.requiredScore;
  const rosterNames = roster.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    chronicled,
    chronicleId: chronicle.id,
    chronicleName: chronicle.name,
    title: chronicle.title,
    habitat: chronicle.habitat,
    roster,
    partyIds,
    completedQuestIds,
    localPresenceCount,
    score,
    requiredScore: chronicle.requiredScore,
    missing,
    rewardItemId: chronicle.rewardItemId,
    message: chronicled
      ? `${chronicle.name} complete: ${rosterNames} carry the first-court Mochirii alpha passport across the starter vow, capture rites, encounter atlas work, habitat census records, routes, ecology, provision catalog planning, battle item kit readiness, remedy pouch status care, quest ledger records, roster cabinet organization, crafting, market receipt, exchange accords, relic attunement, waystone travel, nurturing, kinship, nursery care, bloom ascendance, lineage records, technique codex study, affinity matrix planning, dojo ladder proof, sifu council proof, summit circuit proof, tournament battles, story vows, insignia, raising, quests, market, trade, social play, and Canary preview. No real value.`
      : `${chronicle.name} needs ${missing.join(', ')} before the first-court alpha chronicle can be recorded.`,
    source: 'guild-wayfarer-chronicle'
  };
}

export function resolveGuildAscensionTrial(
  progress: GuildAscensionTrialProgress,
  trialId: string = GUILD_ASCENSION_TRIALS[0].id
): GuildAscensionTrialResult {
  const trial = GUILD_ASCENSION_TRIALS.find((entry) => entry.id === trialId) || GUILD_ASCENSION_TRIALS[0];
  const knownSpiritIds = new Set<string>(MOCHI_SPIRITS.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const scoreLeadReady = focusScore >= opponentScore && focusScore > 0 && opponentScore > 0;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (roster.length < trial.requiredSpiritCount) missing.push(`roster:${roster.length}/${trial.requiredSpiritCount}`);
  if (partyIds.length < trial.requiredSpiritCount) missing.push(`party:${partyIds.length}/${trial.requiredSpiritCount}`);
  if (localPresenceCount < trial.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${trial.requiredPresenceCount}`);
  if (!progress.starterVowProof) missing.push('starter-vow');
  if (!progress.wayfarerChronicleProof) missing.push('chronicle');
  if (!progress.kinshipAlbumProof) missing.push('kinship');
  if (!progress.nurseryGroveProof) missing.push('nursery-grove');
  if (!progress.bloomAscendanceProof) missing.push('bloom-ascendance');
  if (!progress.lineageRegisterProof) missing.push('lineage-register');
  if (!progress.exchangeAccordProof) missing.push('exchange-accord');
  if (!progress.provisionCatalogProof) missing.push('provision-catalog');
  if (!progress.battleKitProof) missing.push('battle-kit');
  if (!progress.remedyPouchProof) missing.push('remedy-pouch');
  if (!progress.questLedgerProof) missing.push('quest-ledger');
  if (!progress.rosterCabinetProof) missing.push('roster-cabinet');
  if (!progress.affinityMatrixProof) missing.push('affinity-matrix');
  if (!progress.techniqueCodexProof) missing.push('technique-codex');
  if (!progress.relicAttunementProof) missing.push('relic-attunement');
  if (!progress.routePatrolProof) missing.push('route-patrol');
  if (!progress.mentorChallengeProof) missing.push('mentor');
  if (!progress.dojoLadderProof) missing.push('dojo-ladder');
  if (!progress.sifuCouncilProof) missing.push('sifu-council');
  if (!progress.summitCircuitProof) missing.push('summit-circuit');
  if (!progress.tournamentProof) missing.push('tournament');
  if (!progress.storyChapterProof) missing.push('story');
  if (!progress.insigniaCaseProof) missing.push('insignia');
  if (!progress.rivalCircleProof) missing.push('rival-circle');
  if (!progress.battleRoundProof || !progress.battleRoundVictory || !scoreLeadReady) missing.push('battle-round');
  if (!progress.conditionWeaveProof) missing.push('condition-weave');
  if (!progress.harmonyFormProof) missing.push('harmony');
  if (!progress.harmonyTrialProof) missing.push('concord');
  if (!progress.teamSparMatchProof) missing.push('team-match');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.growthRiteProof) missing.push('growth');
  if (!progress.questChainProof) missing.push('quest-chain');
  if (!progress.marketProof) missing.push('market');
  if (!progress.marketReceiptProof) missing.push('market-receipt');
  if (!progress.tradeProof) missing.push('trade');
  if (!progress.canaryPreviewProof) missing.push('canary-preview');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(roster.length, trial.requiredSpiritCount) * 2 +
    Math.min(partyIds.length, trial.requiredSpiritCount) * 2 +
    Math.min(localPresenceCount, trial.requiredPresenceCount) * 3 +
    (progress.starterVowProof ? 2 : 0) +
    (progress.wayfarerChronicleProof ? 5 : 0) +
    (progress.kinshipAlbumProof ? 3 : 0) +
    (progress.nurseryGroveProof ? 3 : 0) +
    (progress.bloomAscendanceProof ? 3 : 0) +
    (progress.lineageRegisterProof ? 3 : 0) +
    (progress.exchangeAccordProof ? 3 : 0) +
    (progress.provisionCatalogProof ? 3 : 0) +
    (progress.battleKitProof ? 3 : 0) +
    (progress.remedyPouchProof ? 3 : 0) +
    (progress.questLedgerProof ? 3 : 0) +
    (progress.rosterCabinetProof ? 3 : 0) +
    (progress.affinityMatrixProof ? 3 : 0) +
    (progress.techniqueCodexProof ? 3 : 0) +
    (progress.relicAttunementProof ? 3 : 0) +
    (progress.routePatrolProof ? 4 : 0) +
    (progress.mentorChallengeProof ? 4 : 0) +
    (progress.dojoLadderProof ? 3 : 0) +
    (progress.sifuCouncilProof ? 3 : 0) +
    (progress.summitCircuitProof ? 3 : 0) +
    (progress.tournamentProof ? 3 : 0) +
    (progress.storyChapterProof ? 3 : 0) +
    (progress.insigniaCaseProof ? 3 : 0) +
    (progress.rivalCircleProof ? 3 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory && scoreLeadReady ? 4 : 0) +
    (progress.conditionWeaveProof ? 3 : 0) +
    (progress.harmonyFormProof ? 2 : 0) +
    (progress.harmonyTrialProof ? 3 : 0) +
    (progress.teamSparMatchProof ? 3 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    (progress.questChainProof ? 2 : 0) +
    (progress.marketProof ? 1 : 0) +
    (progress.marketReceiptProof ? 2 : 0) +
    (progress.tradeProof ? 1 : 0) +
    (progress.canaryPreviewProof ? 1 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const ascended = missing.length === 0 && score >= trial.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    ascended,
    trialId: trial.id,
    trialName: trial.name,
    title: trial.title,
    habitat: trial.habitat,
    roster,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: trial.requiredScore,
    missing,
    rewardItemId: trial.rewardItemId,
    message: ascended
      ? `${trial.name} complete: ${partyNames} clear the closed-alpha guild capstone with starter vow, chronicle, nursery grove, bloom ascendance, technique codex, market receipt, provision catalog, battle kit, remedy pouch, quest ledger, roster cabinet, exchange accord, relic attunement, affinity matrix, route patrol, mentor, dojo ladder, sifu council, summit circuit, rival circle, no-injury battle, social, market, trade, and Canary preview proof. No real value.`
      : `${trial.name} needs ${missing.join(', ')} before the closed-alpha guild capstone can be recorded.`,
    source: 'guild-ascension-trial'
  };
}

export function resolveSpiritHarmonyForm(
  progress: SpiritHarmonyFormProgress,
  formId: string = SPIRIT_HARMONY_FORMS[0].id
): SpiritHarmonyFormResult {
  const form = SPIRIT_HARMONY_FORMS.find((entry) => entry.id === formId) || SPIRIT_HARMONY_FORMS[0];
  const requiredSpiritIds = new Set(form.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of form.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (partyIds.length < form.requiredPartySize) {
    missing.push(`party:${partyIds.length}/${form.requiredPartySize}`);
  }

  const routeMasteryReady = progress.routeMasteryProof && progress.routeMasteryId === form.requiredRouteMasteryId;
  if (!routeMasteryReady) {
    missing.push(`route:${form.requiredRouteMasteryId}`);
  }

  const growthRiteReady = progress.growthRiteProof && progress.growthRiteId === form.requiredGrowthRiteId;
  if (!growthRiteReady) {
    missing.push(`growth:${form.requiredGrowthRiteId}`);
  }

  if (!progress.tacticProof) {
    missing.push('tactic');
  }

  if (!progress.affinityProof) {
    missing.push('affinity');
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  if (trainingXp < form.requiredTrainingXp) {
    missing.push(`training:${trainingXp}/${form.requiredTrainingXp}`);
  }

  if (sparLadderXp < form.requiredSparLadderXp) {
    missing.push(`spar:${sparLadderXp}/${form.requiredSparLadderXp}`);
  }

  const score =
    Math.min(partyIds.length, form.requiredPartySize) * 3 +
    (routeMasteryReady ? 3 : 0) +
    (growthRiteReady ? 3 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.affinityProof ? 2 : 0) +
    Math.min(trainingXp, form.requiredTrainingXp) +
    Math.min(sparLadderXp, form.requiredSparLadderXp);
  const formed = missing.length === 0 && score >= form.requiredScore;
  const partyNames = partyIds
    .map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId)
    .join(', ');

  return {
    ok: true,
    formed,
    formId: form.id,
    name: form.name,
    title: form.title,
    partyIds,
    score,
    requiredScore: form.requiredScore,
    missing,
    rewardItemId: form.rewardItemId,
    message: formed
      ? `${form.name} formed: ${partyNames} synchronize a no-injury party form for closed-alpha Mochirii testing.`
      : `${form.name} needs ${missing.join(', ')} before the three-spirit harmony form can be recorded.`,
    source: 'party-harmony-form'
  };
}

export function resolveSpiritHarmonyTrial(
  progress: SpiritHarmonyTrialProgress,
  trialId: string = SPIRIT_HARMONY_TRIALS[0].id
): SpiritHarmonyTrialResult {
  const trial = SPIRIT_HARMONY_TRIALS.find((entry) => entry.id === trialId) || SPIRIT_HARMONY_TRIALS[0];
  const requiredSpiritIds = new Set(trial.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of trial.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const harmonyReady = progress.harmonyFormProof && progress.harmonyFormId === trial.requiredHarmonyFormId;
  if (!harmonyReady) {
    missing.push(`harmony:${trial.requiredHarmonyFormId}`);
  }

  if (!progress.tacticProof) {
    missing.push('tactic');
  }

  if (!progress.affinityProof) {
    missing.push('affinity');
  }

  const sparWins = Math.max(0, Math.floor(progress.sparLadderWins || 0));
  if (sparWins < trial.requiredSparWins) {
    missing.push(`spar-wins:${sparWins}/${trial.requiredSparWins}`);
  }

  if (!progress.profileViewed) {
    missing.push('profile');
  }

  if (!progress.guildBuddyProof) {
    missing.push('guild-buddy');
  }

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (!chatLines.length) {
    missing.push('chat');
  }

  const score =
    Math.min(partyIds.length, trial.requiredSpiritIds.length) * 3 +
    (harmonyReady ? 4 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.affinityProof ? 2 : 0) +
    Math.min(sparWins, trial.requiredSparWins) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 2 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= trial.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    trialId: trial.id,
    trialName: trial.name,
    title: trial.title,
    partyIds,
    score,
    requiredScore: trial.requiredScore,
    missing,
    rewardItemId: trial.rewardItemId,
    message: cleared
      ? `${trial.name} cleared: ${partyNames} complete a no-injury team battle while local testers coordinate through profile, guild, status, and chat proof.`
      : `${trial.name} needs ${missing.join(', ')} before the social harmony battle trial can be recorded.`,
    source: 'battle-harmony-trial'
  };
}

export function resolveSpiritTeamSparMatch(
  progress: SpiritTeamSparMatchProgress,
  matchId: string = SPIRIT_TEAM_SPAR_MATCHES[0].id
): SpiritTeamSparMatchResult {
  const match = SPIRIT_TEAM_SPAR_MATCHES.find((entry) => entry.id === matchId) || SPIRIT_TEAM_SPAR_MATCHES[0];
  const requiredSpiritIds = new Set(match.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of match.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const harmonyReady = progress.harmonyTrialProof && progress.harmonyTrialId === match.requiredHarmonyTrialId;
  if (!harmonyReady) {
    missing.push(`concord:${match.requiredHarmonyTrialId}`);
  }

  if (!progress.routeMasteryProof) {
    missing.push('route-mastery');
  }

  if (!progress.tacticProof) {
    missing.push('tactic');
  }

  if (!progress.growthRiteProof) {
    missing.push('growth-rite');
  }

  if (!progress.questChainProof) {
    missing.push('quest-chain');
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < match.requiredTrainingXp) {
    missing.push(`training-xp:${trainingXp}/${match.requiredTrainingXp}`);
  }

  const sparWins = Math.max(0, Math.floor(progress.sparLadderWins || 0));
  if (sparWins < match.requiredSparWins) {
    missing.push(`spar-wins:${sparWins}/${match.requiredSparWins}`);
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (!chatLines.length) {
    missing.push('chat');
  }

  const concordScore = Math.max(0, Math.floor(progress.harmonyTrialScore || 0));
  const score =
    Math.min(partyIds.length, match.requiredSpiritIds.length) * 3 +
    (harmonyReady ? 5 : 0) +
    (progress.routeMasteryProof ? 2 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    (progress.questChainProof ? 2 : 0) +
    Math.min(trainingXp, match.requiredTrainingXp) +
    Math.min(sparWins, match.requiredSparWins) * 2 +
    Math.min(4, Math.floor(concordScore / 6)) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= match.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    matchId: match.id,
    matchName: match.name,
    title: match.title,
    opponentName: match.opponentName,
    partyIds,
    score,
    requiredScore: match.requiredScore,
    missing,
    rewardItemId: match.rewardItemId,
    message: cleared
      ? `${match.name} cleared: ${partyNames} complete a no-injury full-party spar match against ${match.opponentName} with route, growth, tactic, quest, concord, and chat proof.`
      : `${match.name} needs ${missing.join(', ')} before the full-party spar match can be recorded.`,
    source: 'battle-team-spar-match'
  };
}

export function resolveSpiritMentorChallenge(
  progress: SpiritMentorChallengeProgress,
  challengeId: string = SPIRIT_MENTOR_CHALLENGES[0].id
): SpiritMentorChallengeResult {
  const challenge = SPIRIT_MENTOR_CHALLENGES.find((entry) => entry.id === challengeId) || SPIRIT_MENTOR_CHALLENGES[0];
  const requiredSpiritIds = new Set(challenge.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of challenge.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const teamMatchReady = progress.teamSparMatchProof && progress.teamSparMatchId === challenge.requiredTeamMatchId;
  if (!teamMatchReady) {
    missing.push(`team-match:${challenge.requiredTeamMatchId}`);
  }

  const battleRoundReady = progress.battleRoundProof && progress.battleRoundVictory && progress.battleRoundFocusScore >= progress.battleRoundOpponentScore;
  if (!battleRoundReady) {
    missing.push('battle-round');
  }

  const techniqueXp = Math.max(0, Math.floor(progress.techniqueMasteryXp || 0));
  if (techniqueXp < challenge.requiredTechniqueXp) {
    missing.push(`technique-xp:${techniqueXp}/${challenge.requiredTechniqueXp}`);
  }

  const tacticXp = Math.max(0, Math.floor(progress.tacticMasteryXp || 0));
  if (tacticXp < challenge.requiredTacticXp) {
    missing.push(`tactic-xp:${tacticXp}/${challenge.requiredTacticXp}`);
  }

  const careStreak = Math.max(0, Math.floor(progress.raisingCareStreak || 0));
  if (careStreak < challenge.requiredCareStreak) {
    missing.push(`care-streak:${careStreak}/${challenge.requiredCareStreak}`);
  }

  if (!progress.profileViewed) {
    missing.push('profile');
  }

  if (!progress.guildBuddyProof) {
    missing.push('guild-buddy');
  }

  const score =
    Math.min(partyIds.length, challenge.requiredSpiritIds.length) * 3 +
    (teamMatchReady ? 6 : 0) +
    (battleRoundReady ? 4 : 0) +
    Math.min(4, Math.floor(techniqueXp / 5)) +
    Math.min(4, Math.floor(tacticXp / 5)) +
    Math.min(3, careStreak * 2) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0);
  const cleared = missing.length === 0 && score >= challenge.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    challengeId: challenge.id,
    challengeName: challenge.name,
    title: challenge.title,
    mentorName: challenge.mentorName,
    partyIds,
    score,
    requiredScore: challenge.requiredScore,
    missing,
    rewardItemId: challenge.rewardItemId,
    message: cleared
      ? `${challenge.name} cleared: ${challenge.mentorName} records ${partyNames} as no-injury mentor-ready with care, tactics, technique, team sparring, and social proof.`
      : `${challenge.name} needs ${missing.join(', ')} before mentor readiness can be recorded.`,
    source: 'battle-mentor-challenge'
  };
}

export function resolveSpiritDojoLadder(
  progress: SpiritDojoLadderProgress,
  ladderId: string = SPIRIT_DOJO_LADDERS[0].id
): SpiritDojoLadderResult {
  const ladder = SPIRIT_DOJO_LADDERS.find((entry) => entry.id === ladderId) || SPIRIT_DOJO_LADDERS[0];
  const requiredSpiritIds = new Set(ladder.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const clearedOpponentIds = Array.from(new Set(progress.clearedOpponentIds.filter(Boolean))).filter((opponentId) => {
    return ladder.requiredOpponentIds.includes(opponentId);
  });
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleRoundReady =
    progress.battleRoundProof &&
    progress.battleRoundVictory &&
    focusScore > 0 &&
    opponentScore > 0 &&
    focusScore >= opponentScore;
  const techniqueReady = progress.techniqueCodexProof && progress.techniqueCodexId === ladder.requiredTechniqueCodexId;
  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === ladder.requiredConditionWeaveId;
  const affinityReady = progress.affinityMatrixProof && progress.affinityMatrixId === ladder.requiredAffinityMatrixId;
  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === ladder.requiredMentorChallengeId;
  const teamMatchReady = progress.teamSparMatchProof && progress.teamSparMatchId === ladder.requiredTeamMatchId;
  const sparWins = Math.max(0, Math.floor(progress.sparLadderWins || 0));
  const sparLadderXp = Math.max(0, Math.floor(progress.sparLadderXp || 0));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of ladder.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  for (const opponentId of ladder.requiredOpponentIds) {
    if (!clearedOpponentIds.includes(opponentId)) {
      missing.push(`opponent:${opponentId}`);
    }
  }

  if (sparWins < ladder.requiredSparWins) missing.push(`spar-wins:${sparWins}/${ladder.requiredSparWins}`);
  if (sparLadderXp < ladder.requiredSparLadderXp) missing.push(`spar-xp:${sparLadderXp}/${ladder.requiredSparLadderXp}`);
  if (trainingXp < ladder.requiredTrainingXp) missing.push(`training:${trainingXp}/${ladder.requiredTrainingXp}`);
  if (!battleRoundReady) missing.push('battle-round');
  if (!techniqueReady) missing.push(`technique-codex:${ladder.requiredTechniqueCodexId}`);
  if (!conditionReady) missing.push(`condition:${ladder.requiredConditionWeaveId}`);
  if (!affinityReady) missing.push(`affinity-matrix:${ladder.requiredAffinityMatrixId}`);
  if (!mentorReady) missing.push(`mentor:${ladder.requiredMentorChallengeId}`);
  if (!teamMatchReady) missing.push(`team-match:${ladder.requiredTeamMatchId}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(partyIds.length, ladder.requiredSpiritIds.length) * 3 +
    Math.min(clearedOpponentIds.length, ladder.requiredOpponentIds.length) * 4 +
    Math.min(sparWins, ladder.requiredSparWins) * 2 +
    (sparLadderXp >= ladder.requiredSparLadderXp ? 3 : Math.min(2, Math.floor(sparLadderXp / 2))) +
    (trainingXp >= ladder.requiredTrainingXp ? 4 : Math.min(2, trainingXp)) +
    (battleRoundReady ? 4 : 0) +
    (techniqueReady ? 5 : 0) +
    (conditionReady ? 4 : 0) +
    (affinityReady ? 4 : 0) +
    (mentorReady ? 4 : 0) +
    (teamMatchReady ? 3 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= ladder.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const opponentNames = clearedOpponentIds
    .map((opponentId) => SPIRIT_SPAR_LADDER.find((entry) => entry.id === opponentId)?.name || opponentId)
    .join(', ');

  return {
    ok: true,
    cleared,
    ladderId: ladder.id,
    ladderName: ladder.name,
    title: ladder.title,
    mentorName: ladder.mentorName,
    partyIds,
    clearedOpponentIds,
    score,
    requiredScore: ladder.requiredScore,
    missing,
    rewardItemId: ladder.rewardItemId,
    message: cleared
      ? `${ladder.name} cleared: ${ladder.mentorName} records ${partyNames} through ${opponentNames} with technique codex, condition weave, affinity matrix, mentor, team match, battle transcript, and social proof. No real value.`
      : `${ladder.name} needs ${missing.join(', ')} before the no-injury dojo ladder can be recorded.`,
    source: 'battle-dojo-ladder'
  };
}

export function resolveSpiritSifuCouncil(
  progress: SpiritSifuCouncilProgress,
  councilId: string = SPIRIT_SIFU_COUNCILS[0].id
): SpiritSifuCouncilResult {
  const council = SPIRIT_SIFU_COUNCILS.find((entry) => entry.id === councilId) || SPIRIT_SIFU_COUNCILS[0];
  const requiredSpiritIds = new Set(council.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const clearedCouncilMemberIds = Array.from(new Set(progress.clearedCouncilMemberIds.filter(Boolean))).filter((memberId) => {
    return council.requiredCouncilMemberIds.includes(memberId);
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleRoundReady =
    progress.battleRoundProof &&
    progress.battleRoundVictory &&
    focusScore > 0 &&
    opponentScore > 0 &&
    focusScore >= opponentScore;
  const dojoReady = progress.dojoLadderProof && progress.dojoLadderId === council.requiredDojoLadderId;
  const tournamentReady = progress.tournamentProof && progress.tournamentId === council.requiredTournamentBracketId;
  const rivalReady = progress.rivalCircleProof && progress.rivalCircleId === council.requiredRivalCircleId;
  const techniqueReady = progress.techniqueCodexProof && progress.techniqueCodexId === council.requiredTechniqueCodexId;
  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === council.requiredConditionWeaveId;
  const affinityReady = progress.affinityMatrixProof && progress.affinityMatrixId === council.requiredAffinityMatrixId;
  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === council.requiredMentorChallengeId;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of council.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const memberId of council.requiredCouncilMemberIds) {
    if (!clearedCouncilMemberIds.includes(memberId)) missing.push(`council:${memberId}`);
  }

  if (localPresenceCount < council.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${council.requiredPresenceCount}`);
  if (!dojoReady) missing.push(`dojo-ladder:${council.requiredDojoLadderId}`);
  if (!tournamentReady) missing.push(`tournament:${council.requiredTournamentBracketId}`);
  if (!rivalReady) missing.push(`rival:${council.requiredRivalCircleId}`);
  if (!techniqueReady) missing.push(`technique-codex:${council.requiredTechniqueCodexId}`);
  if (!conditionReady) missing.push(`condition:${council.requiredConditionWeaveId}`);
  if (!affinityReady) missing.push(`affinity-matrix:${council.requiredAffinityMatrixId}`);
  if (!mentorReady) missing.push(`mentor:${council.requiredMentorChallengeId}`);
  if (!battleRoundReady) missing.push('battle-round');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.routePatrolProof) missing.push('route-patrol');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const dojoScore = Math.max(0, Math.floor(progress.dojoLadderScore || 0));
  const tournamentScore = Math.max(0, Math.floor(progress.tournamentScore || 0));
  const rivalScore = Math.max(0, Math.floor(progress.rivalCircleScore || 0));
  const score =
    Math.min(partyIds.length, council.requiredSpiritIds.length) * 3 +
    Math.min(clearedCouncilMemberIds.length, council.requiredCouncilMemberIds.length) * 4 +
    Math.min(localPresenceCount, council.requiredPresenceCount) * 3 +
    (dojoReady ? 4 : 0) +
    (tournamentReady ? 5 : 0) +
    (rivalReady ? 5 : 0) +
    (techniqueReady ? 4 : 0) +
    (conditionReady ? 3 : 0) +
    (affinityReady ? 4 : 0) +
    (mentorReady ? 3 : 0) +
    (battleRoundReady ? 4 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    (progress.routePatrolProof ? 2 : 0) +
    Math.min(2, Math.floor(dojoScore / 22)) +
    Math.min(3, Math.floor(tournamentScore / 20)) +
    Math.min(3, Math.floor(rivalScore / 20)) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= council.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const memberNames = clearedCouncilMemberIds
    .map((memberId) => {
      if (memberId === 'sifu-narao') return 'Sifu Narao';
      if (memberId === 'warden-meilin') return 'Warden Meilin';
      if (memberId === 'keeper-haoran') return 'Keeper Haoran';
      return memberId;
    })
    .join(', ');

  return {
    ok: true,
    cleared,
    councilId: council.id,
    councilName: council.name,
    title: council.title,
    hostName: council.hostName,
    partyIds,
    clearedCouncilMemberIds,
    localPresenceCount,
    score,
    requiredScore: council.requiredScore,
    missing,
    rewardItemId: council.rewardItemId,
    message: cleared
      ? `${council.name} cleared: ${council.hostName} records ${partyNames} before ${memberNames} with dojo ladder, tournament, rival, technique, condition, affinity, route, rank, battle transcript, and two-tester social proof. No real value.`
      : `${council.name} needs ${missing.join(', ')} before the guild-leader council can be recorded.`,
    source: 'battle-sifu-council'
  };
}

export function resolveSpiritSummitCircuit(
  progress: SpiritSummitCircuitProgress,
  circuitId: string = SPIRIT_SUMMIT_CIRCUITS[0].id
): SpiritSummitCircuitResult {
  const circuit = SPIRIT_SUMMIT_CIRCUITS.find((entry) => entry.id === circuitId) || SPIRIT_SUMMIT_CIRCUITS[0];
  const requiredSpiritIds = new Set(circuit.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const summitSealIds = Array.from(new Set(progress.summitSealIds.filter(Boolean))).filter((sealId) => {
    return circuit.requiredSummitSealIds.includes(sealId);
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleRoundReady =
    progress.battleRoundProof &&
    progress.battleRoundVictory &&
    focusScore > 0 &&
    opponentScore > 0 &&
    focusScore > opponentScore;
  const dojoReady = progress.dojoLadderProof && progress.dojoLadderId === circuit.requiredDojoLadderId;
  const tournamentReady = progress.tournamentProof && progress.tournamentId === circuit.requiredTournamentBracketId;
  const rivalReady = progress.rivalCircleProof && progress.rivalCircleId === circuit.requiredRivalCircleId;
  const sifuReady = progress.sifuCouncilProof && progress.sifuCouncilId === circuit.requiredSifuCouncilId;
  const techniqueReady = progress.techniqueCodexProof && progress.techniqueCodexId === circuit.requiredTechniqueCodexId;
  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === circuit.requiredConditionWeaveId;
  const affinityReady = progress.affinityMatrixProof && progress.affinityMatrixId === circuit.requiredAffinityMatrixId;
  const relicReady = progress.relicAttunementProof && progress.relicAttunementId === circuit.requiredRelicAttunementId;
  const harmonyReady = progress.harmonyFormProof && progress.harmonyFormId === circuit.requiredHarmonyFormId;
  const concordReady = progress.harmonyTrialProof && progress.harmonyTrialId === circuit.requiredHarmonyTrialId;
  const teamReady = progress.teamSparMatchProof && progress.teamSparMatchId === circuit.requiredTeamMatchId;
  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === circuit.requiredMentorChallengeId;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of circuit.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const sealId of circuit.requiredSummitSealIds) {
    if (!summitSealIds.includes(sealId)) missing.push(`summit-seal:${sealId}`);
  }

  if (localPresenceCount < circuit.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${circuit.requiredPresenceCount}`);
  if (!dojoReady) missing.push(`dojo-ladder:${circuit.requiredDojoLadderId}`);
  if (!tournamentReady) missing.push(`tournament:${circuit.requiredTournamentBracketId}`);
  if (!rivalReady) missing.push(`rival:${circuit.requiredRivalCircleId}`);
  if (!sifuReady) missing.push(`sifu-council:${circuit.requiredSifuCouncilId}`);
  if (!techniqueReady) missing.push(`technique-codex:${circuit.requiredTechniqueCodexId}`);
  if (!conditionReady) missing.push(`condition:${circuit.requiredConditionWeaveId}`);
  if (!affinityReady) missing.push(`affinity-matrix:${circuit.requiredAffinityMatrixId}`);
  if (!relicReady) missing.push(`relic:${circuit.requiredRelicAttunementId}`);
  if (!harmonyReady) missing.push(`harmony:${circuit.requiredHarmonyFormId}`);
  if (!concordReady) missing.push(`concord:${circuit.requiredHarmonyTrialId}`);
  if (!teamReady) missing.push(`team-match:${circuit.requiredTeamMatchId}`);
  if (!mentorReady) missing.push(`mentor:${circuit.requiredMentorChallengeId}`);
  if (!battleRoundReady) missing.push('battle-round');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.growthRiteProof) missing.push('growth');
  if (!progress.routePatrolProof) missing.push('route-patrol');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const dojoScore = Math.max(0, Math.floor(progress.dojoLadderScore || 0));
  const tournamentScore = Math.max(0, Math.floor(progress.tournamentScore || 0));
  const rivalScore = Math.max(0, Math.floor(progress.rivalCircleScore || 0));
  const sifuScore = Math.max(0, Math.floor(progress.sifuCouncilScore || 0));
  const score =
    Math.min(partyIds.length, circuit.requiredSpiritIds.length) * 3 +
    Math.min(summitSealIds.length, circuit.requiredSummitSealIds.length) * 4 +
    Math.min(localPresenceCount, circuit.requiredPresenceCount) * 3 +
    (dojoReady ? 3 : 0) +
    (tournamentReady ? 4 : 0) +
    (rivalReady ? 4 : 0) +
    (sifuReady ? 5 : 0) +
    (techniqueReady ? 3 : 0) +
    (conditionReady ? 3 : 0) +
    (affinityReady ? 3 : 0) +
    (relicReady ? 4 : 0) +
    (harmonyReady ? 3 : 0) +
    (concordReady ? 3 : 0) +
    (teamReady ? 3 : 0) +
    (mentorReady ? 3 : 0) +
    (battleRoundReady ? 4 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    (progress.routePatrolProof ? 2 : 0) +
    Math.min(2, Math.floor(dojoScore / 22)) +
    Math.min(2, Math.floor(tournamentScore / 25)) +
    Math.min(3, Math.floor(rivalScore / 21)) +
    Math.min(3, Math.floor(sifuScore / 24)) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= circuit.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    circuitId: circuit.id,
    circuitName: circuit.name,
    title: circuit.title,
    hostName: circuit.hostName,
    partyIds,
    summitSealIds,
    localPresenceCount,
    score,
    requiredScore: circuit.requiredScore,
    missing,
    rewardItemId: circuit.rewardItemId,
    message: cleared
      ? `${circuit.name} cleared: ${circuit.hostName} records ${partyNames} with relic attunement, dojo, tournament, rival, sifu council, harmony, team match, mentor, rank, growth, route patrol, no-injury battle, and two-tester social proof. No real value.`
      : `${circuit.name} needs ${missing.join(', ')} before the summit battle circuit can be recorded.`,
    source: 'battle-summit-circuit'
  };
}

export function resolveSpiritTournamentBracket(
  progress: SpiritTournamentBracketProgress,
  bracketId: string = SPIRIT_TOURNAMENT_BRACKETS[0].id
): SpiritTournamentBracketResult {
  const bracket = SPIRIT_TOURNAMENT_BRACKETS.find((entry) => entry.id === bracketId) || SPIRIT_TOURNAMENT_BRACKETS[0];
  const requiredSpiritIds = new Set(bracket.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const scoreLeadReady = focusScore >= opponentScore && focusScore > 0 && opponentScore > 0;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of bracket.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (localPresenceCount < bracket.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${bracket.requiredPresenceCount}`);

  const dojoReady = progress.dojoLadderProof && progress.dojoLadderId === bracket.requiredDojoLadderId;
  if (!dojoReady) missing.push(`dojo-ladder:${bracket.requiredDojoLadderId}`);

  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === bracket.requiredMentorChallengeId;
  if (!mentorReady) missing.push(`mentor:${bracket.requiredMentorChallengeId}`);

  const teamMatchReady = progress.teamSparMatchProof && progress.teamSparMatchId === bracket.requiredTeamMatchId;
  if (!teamMatchReady) missing.push(`team-match:${bracket.requiredTeamMatchId}`);

  const harmonyReady = progress.harmonyTrialProof && progress.harmonyTrialId === bracket.requiredHarmonyTrialId;
  if (!harmonyReady) missing.push(`concord:${bracket.requiredHarmonyTrialId}`);

  if (!progress.conditionWeaveProof) missing.push('condition-weave');
  if (!progress.affinityMatrixProof) missing.push('affinity-matrix');
  if (!progress.battleRoundProof || !progress.battleRoundVictory || !scoreLeadReady) missing.push('battle-round');
  if (!progress.routePatrolProof) missing.push('route-patrol');
  if (!progress.nurtureRiteProof) missing.push('nurture-rite');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const mentorScore = Math.max(0, Math.floor(progress.mentorChallengeScore || 0));
  const dojoScore = Math.max(0, Math.floor(progress.dojoLadderScore || 0));
  const teamScore = Math.max(0, Math.floor(progress.teamSparMatchScore || 0));
  const score =
    Math.min(partyIds.length, bracket.requiredSpiritIds.length) * 3 +
    Math.min(localPresenceCount, bracket.requiredPresenceCount) * 3 +
    (dojoReady ? 3 : 0) +
    (mentorReady ? 6 : 0) +
    (teamMatchReady ? 4 : 0) +
    (harmonyReady ? 3 : 0) +
    (progress.conditionWeaveProof ? 3 : 0) +
    (progress.affinityMatrixProof ? 3 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory && scoreLeadReady ? 4 : 0) +
    (progress.routePatrolProof ? 2 : 0) +
    (progress.nurtureRiteProof ? 2 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    Math.min(2, Math.floor(dojoScore / 22)) +
    Math.min(2, Math.floor(mentorScore / 14)) +
    Math.min(2, Math.floor(teamScore / 15)) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= bracket.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    bracketId: bracket.id,
    bracketName: bracket.name,
    title: bracket.title,
    hostName: bracket.hostName,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: bracket.requiredScore,
    missing,
    rewardItemId: bracket.rewardItemId,
    message: cleared
      ? `${bracket.name} cleared: ${bracket.hostName} records ${partyNames} through a no-injury social battle circuit with dojo ladder, mentor, team-match, affinity matrix, route patrol, nurture, rank, and chat proof. No real value.`
      : `${bracket.name} needs ${missing.join(', ')} before the closed-alpha tournament bracket can be recorded.`,
    source: 'battle-tournament-bracket'
  };
}

export function resolveSpiritRivalCircle(
  progress: SpiritRivalCircleProgress,
  circleId: string = SPIRIT_RIVAL_CIRCLES[0].id
): SpiritRivalCircleResult {
  const circle = SPIRIT_RIVAL_CIRCLES.find((entry) => entry.id === circleId) || SPIRIT_RIVAL_CIRCLES[0];
  const requiredSpiritIds = new Set(circle.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const scoreLeadReady = focusScore >= opponentScore && focusScore > 0 && opponentScore > 0;
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of circle.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  if (localPresenceCount < circle.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${circle.requiredPresenceCount}`);

  const tournamentReady = progress.tournamentProof && progress.tournamentId === circle.requiredTournamentBracketId;
  if (!tournamentReady) missing.push(`tournament:${circle.requiredTournamentBracketId}`);

  const dojoReady = progress.dojoLadderProof && progress.dojoLadderId === circle.requiredDojoLadderId;
  if (!dojoReady) missing.push(`dojo-ladder:${circle.requiredDojoLadderId}`);

  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === circle.requiredMentorChallengeId;
  if (!mentorReady) missing.push(`mentor:${circle.requiredMentorChallengeId}`);

  const teamMatchReady = progress.teamSparMatchProof && progress.teamSparMatchId === circle.requiredTeamMatchId;
  if (!teamMatchReady) missing.push(`team-match:${circle.requiredTeamMatchId}`);

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === circle.requiredConditionWeaveId;
  if (!conditionReady) missing.push(`condition:${circle.requiredConditionWeaveId}`);

  if (!progress.affinityMatrixProof) missing.push('affinity-matrix');
  if (!progress.battleRoundProof || !progress.battleRoundVictory || !scoreLeadReady) missing.push('battle-round');
  if (!progress.techniqueLoadoutProof) missing.push('loadout');
  if (!progress.traitAttunementProof) missing.push('trait');
  if (!progress.guildRankProof) missing.push('rank');
  if (!progress.growthRiteProof) missing.push('growth');
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const tournamentScore = Math.max(0, Math.floor(progress.tournamentScore || 0));
  const dojoScore = Math.max(0, Math.floor(progress.dojoLadderScore || 0));
  const mentorScore = Math.max(0, Math.floor(progress.mentorChallengeScore || 0));
  const teamScore = Math.max(0, Math.floor(progress.teamSparMatchScore || 0));
  const score =
    Math.min(partyIds.length, circle.requiredSpiritIds.length) * 3 +
    Math.min(localPresenceCount, circle.requiredPresenceCount) * 3 +
    (tournamentReady ? 6 : 0) +
    (dojoReady ? 3 : 0) +
    (mentorReady ? 4 : 0) +
    (teamMatchReady ? 3 : 0) +
    (conditionReady ? 3 : 0) +
    (progress.affinityMatrixProof ? 3 : 0) +
    (progress.battleRoundProof && progress.battleRoundVictory && scoreLeadReady ? 5 : 0) +
    (progress.techniqueLoadoutProof ? 2 : 0) +
    (progress.traitAttunementProof ? 2 : 0) +
    (progress.guildRankProof ? 2 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    Math.min(3, Math.floor(tournamentScore / 12)) +
    Math.min(2, Math.floor(dojoScore / 22)) +
    Math.min(2, Math.floor(mentorScore / 14)) +
    Math.min(2, Math.floor(teamScore / 15)) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= circle.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    circleId: circle.id,
    circleName: circle.name,
    title: circle.title,
    rivalName: circle.rivalName,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: circle.requiredScore,
    missing,
    rewardItemId: circle.rewardItemId,
    message: cleared
      ? `${circle.name} cleared: ${partyNames} complete a no-injury rival bout against ${circle.rivalName} with dojo ladder, tournament, mentor, team match, affinity matrix, condition weave, and social witness proof. No real value.`
      : `${circle.name} needs ${missing.join(', ')} before the no-injury rival circle can be recorded.`,
    source: 'battle-rival-circle'
  };
}

export function resolveSpiritRoutePatrol(
  progress: SpiritRoutePatrolProgress,
  patrolId: string = SPIRIT_ROUTE_PATROLS[0].id
): SpiritRoutePatrolResult {
  const patrol = SPIRIT_ROUTE_PATROLS.find((entry) => entry.id === patrolId) || SPIRIT_ROUTE_PATROLS[0];
  const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === (progress.routeId || patrol.routeId)) || SPIRIT_EXPEDITION_ROUTES[0];
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const battleRoundFocusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const battleRoundOpponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleScoreReady =
    progress.battleRoundVictory &&
    battleRoundFocusScore > 0 &&
    battleRoundOpponentScore > 0 &&
    battleRoundFocusScore >= battleRoundOpponentScore;
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  if (route.id !== patrol.routeId) {
    missing.push(`route:${patrol.routeId}`);
  }

  if (partyIds.length < patrol.requiredPartySize) {
    missing.push(`party:${partyIds.length}/${patrol.requiredPartySize}`);
  }

  if (localPresenceCount < patrol.requiredPresenceCount) {
    missing.push(`presence:${localPresenceCount}/${patrol.requiredPresenceCount}`);
  }

  if (!progress.routeMasteryProof || progress.routeMasteryId !== patrol.requiredMasteryId) {
    missing.push(`mastery:${patrol.requiredMasteryId}`);
  }

  if (!progress.fieldAccordProof || progress.fieldAccordId !== patrol.requiredFieldAccordId) {
    missing.push(`accord:${patrol.requiredFieldAccordId}`);
  }

  if (!progress.battleRoundProof || !battleScoreReady) {
    missing.push('battle-round');
  }

  if (!chatLines.length) {
    missing.push('chat');
  }

  const score =
    Math.min(partyIds.length, patrol.requiredPartySize) * 3 +
    Math.min(localPresenceCount, patrol.requiredPresenceCount) * 3 +
    (progress.routeMasteryProof && progress.routeMasteryId === patrol.requiredMasteryId ? 4 : 0) +
    (progress.fieldAccordProof && progress.fieldAccordId === patrol.requiredFieldAccordId ? 3 : 0) +
    (progress.battleRoundProof && battleScoreReady ? 4 : 0) +
    (progress.harmonyFormProof ? 2 : 0) +
    (progress.teamSparMatchProof ? 2 : 0) +
    (progress.mentorChallengeProof ? 2 : 0) +
    (chatLines.length ? 1 : 0);
  const patrolled = missing.length === 0 && score >= patrol.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    patrolled,
    patrolId: patrol.id,
    patrolName: patrol.name,
    title: patrol.title,
    routeId: route.id,
    routeName: route.name,
    partyIds,
    localPresenceCount,
    score,
    requiredScore: patrol.requiredScore,
    missing,
    rewardItemId: patrol.rewardItemId,
    message: patrolled
      ? `${patrol.name} complete: ${partyNames} patrol ${route.name} with ${localPresenceCount} local testers, route mastery, field accord trust, chat, and a no-injury battle transcript. ${patrol.patrolNote} No real value.`
      : `${patrol.name} needs ${missing.join(', ')} before the shared route patrol can be recorded.`,
    source: 'world-route-patrol'
  };
}

export function resolveSpiritFieldAccord(
  progress: SpiritFieldAccordProgress,
  accordId?: string
): SpiritFieldAccordResult {
  const route =
    SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === progress.routeId) ||
    SPIRIT_EXPEDITION_ROUTES.find((entry) => progress.discoveredRoutes.includes(entry.id)) ||
    SPIRIT_EXPEDITION_ROUTES[0];
  const accord =
    SPIRIT_FIELD_ACCORDS.find((entry) => entry.id === accordId) ||
    SPIRIT_FIELD_ACCORDS.find((entry) => entry.routeId === route.id) ||
    SPIRIT_FIELD_ACCORDS[0];
  const targetSpirit = getMochiSpirit(accord.targetSpiritId) || getMochiSpirit(route.encounterSpiritId);
  const knownRoster = Array.from(new Set(progress.roster.filter((spiritId) => Boolean(getMochiSpirit(spiritId)))));
  const partyIds = resolveSpiritParty(knownRoster, progress.activeSpiritId).partyIds;
  const discoveredRoutes = Array.from(new Set(progress.discoveredRoutes.filter(Boolean)));
  const boundedHarmony = Math.max(0, Math.floor(progress.harmonyScore || 0));
  const missing: string[] = [];

  if (!discoveredRoutes.includes(route.id)) {
    missing.push(`route:${route.id}`);
  }

  if (!targetSpirit || targetSpirit.id !== route.encounterSpiritId) {
    missing.push(`spirit:${accord.targetSpiritId}`);
  }

  if (boundedHarmony < accord.requiredHarmony) {
    missing.push(`harmony:${boundedHarmony}/${accord.requiredHarmony}`);
  }

  if (knownRoster.length < accord.requiredRosterCount) {
    missing.push(`roster:${knownRoster.length}/${accord.requiredRosterCount}`);
  }

  if (!partyIds.length) {
    missing.push('party');
  }

  const bondBySpiritId = progress.bondBySpiritId || {};
  const bondScore = partyIds.reduce((total, spiritId) => {
    return total + Math.max(1, Math.min(5, Math.floor(bondBySpiritId[spiritId] || 1)));
  }, 0);
  const roleVariety = new Set(partyIds.map((spiritId) => getMochiSpirit(spiritId)?.battle.role).filter(Boolean)).size;
  const journalScore = Math.min(MOCHI_SPIRITS.length, Math.max(0, Math.floor(progress.journalDiscoveredCount || 0)));
  const score =
    Math.min(boundedHarmony, accord.requiredHarmony + 2) +
    Math.min(partyIds.length, accord.requiredRosterCount + 1) * 2 +
    Math.min(4, bondScore) +
    roleVariety +
    (progress.tacticProof ? 2 : 0) +
    (progress.affinityProof ? 2 : 0) +
    journalScore;
  const cleared = missing.length === 0 && score >= accord.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ') || 'No party';
  const spiritName = targetSpirit?.name || accord.targetSpiritId;

  return {
    ok: true,
    cleared,
    accordId: accord.id,
    accordName: accord.name,
    title: accord.title,
    routeId: route.id,
    routeName: route.name,
    targetSpiritId: targetSpirit?.id || accord.targetSpiritId,
    spiritName,
    partyIds,
    score,
    requiredScore: accord.requiredScore,
    harmonyScore: boundedHarmony,
    missing,
    rewardItemId: accord.rewardItemId,
    message: cleared
      ? `${accord.name} cleared: ${partyNames} read ${spiritName}'s ${route.name} signs with score ${score}/${accord.requiredScore}. ${accord.accordNote} No-injury field accord only; no real value.`
      : `${accord.name} needs ${missing.join(', ')} before ${spiritName} can accept a route invitation.`,
    source: 'spirit-field-accord'
  };
}

export function resolveSpiritRouteInvitation(
  routeId: string = SPIRIT_EXPEDITION_ROUTES[0].id,
  offeredItemId = '',
  harmonyScore = 1,
  roster: readonly string[] = [],
  discoveredRoutes: readonly string[] = [],
  fieldAccordProof = false
): SpiritRouteInvitationResult {
  const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === routeId) || SPIRIT_EXPEDITION_ROUTES[0];
  const spirit = getMochiSpirit(route.encounterSpiritId);
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  const discovered = Array.from(new Set(discoveredRoutes.filter(Boolean)));
  const boundedHarmony = Math.max(0, Math.floor(harmonyScore));
  const requiredHarmony = Math.max(route.requiredHarmony, spirit?.capture.harmonyRequired || route.requiredHarmony);
  const requiredItemId = route.recommendedItemId;
  const base = {
    routeId: route.id,
    routeName: route.name,
    spiritId: spirit?.id || route.encounterSpiritId,
    offeredItemId,
    requiredItemId,
    harmonyRequired: requiredHarmony,
    harmonyScore: boundedHarmony,
    roster: knownRoster,
    bond: 0,
    growth: 'seed' as SpiritGrowthStage,
    source: 'spirit-route-invite'
  };

  if (!spirit) {
    return {
      ...base,
      ok: false,
      alreadyRostered: false,
      message: `The ${route.name} has no registered Mochirii encounter spirit yet.`
    };
  }

  if (!discovered.includes(route.id)) {
    return {
      ...base,
      ok: false,
      alreadyRostered: false,
      message: `Scout the ${route.name} before offering a Mochirii field invitation.`
    };
  }

  if (knownRoster.includes(spirit.id)) {
    return {
      ...base,
      ok: true,
      alreadyRostered: true,
      bond: 1,
      roster: knownRoster,
      message: `${spirit.name} already trusts your Mochirii roster and answers the ${route.name} field invitation calmly.`
    };
  }

  if (!fieldAccordProof) {
    return {
      ...base,
      ok: false,
      alreadyRostered: false,
      message: `${spirit.name} needs a cleared Mochirii field accord before accepting the ${route.name} route invitation.`
    };
  }

  const lureOk = offeredItemId === requiredItemId && offeredItemId === spirit.capture.lureItemId;
  const harmonyOk = boundedHarmony >= requiredHarmony;
  if (!lureOk || !harmonyOk) {
    return {
      ...base,
      ok: false,
      alreadyRostered: false,
      message: `${route.name} invitation needs ${requiredItemId} and harmony ${requiredHarmony} before ${spirit.name} will join.`
    };
  }

  return {
    ...base,
    ok: true,
    alreadyRostered: false,
    bond: 1,
    roster: [...knownRoster, spirit.id],
    message: `${spirit.name} accepts the ${spirit.capture.invitationLabel} at ${route.name} and joins your Mochirii roster by consent.`
  };
}

export function resolveSpiritParty(roster: readonly string[], activeSpiritId?: string): SpiritPartyFormation {
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  if (!knownRoster.length) {
    return {
      ok: false,
      partyIds: [],
      supportIds: [],
      message: 'Invite a Mochi Spirit before forming a Mochirii party.',
      source: 'party-formation'
    };
  }

  const requestedActive = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const orderedParty = [requestedActive, ...knownRoster.filter((spiritId) => spiritId !== requestedActive)].slice(0, MOCHI_SPIRIT_PARTY_LIMIT);
  const activeSpirit = getMochiSpirit(requestedActive);
  const supportIds = orderedParty.slice(1);

  return {
    ok: true,
    activeSpiritId: requestedActive,
    partyIds: orderedParty,
    supportIds,
    message: `${activeSpirit?.name || requestedActive} leads a ${orderedParty.length}-spirit Mochirii party for no-injury sparring.`,
    source: 'party-formation'
  };
}

export function resolveSpiritSparLadder(
  partyIds: readonly string[],
  opponentId: string = SPIRIT_SPAR_LADDER[0].id,
  bondBySpiritId: Record<string, number> = {},
  priorWins = 0
): SpiritSparLadderResult {
  const party = Array.from(new Set(partyIds)).map((spiritId) => getMochiSpirit(spiritId)).filter(Boolean) as MochiSpirit[];
  const opponent: SpiritSparOpponent = SPIRIT_SPAR_LADDER.find((entry) => entry.id === opponentId) || SPIRIT_SPAR_LADDER[0];
  if (!party.length) {
    return {
      ok: false,
      opponentId: opponent.id,
      opponentName: opponent.name,
      partyIds: [],
      victory: false,
      focusScore: 0,
      opponentScore: opponent.baseFocus,
      trainingXp: 0,
      bondDelta: 0,
      message: 'A Mochirii party is required before entering the spar ladder.',
      source: 'battle-spar-ladder'
    };
  }

  const focusScore = party.reduce((total, spirit, index) => {
    const bond = Math.max(1, Math.min(5, Math.floor(bondBySpiritId[spirit.id] || 1)));
    const roleBonus = opponent.preferredRoles.includes(spirit.battle.role) ? 2 : 0;
    const leadBonus = index === 0 ? 2 : 0;
    return total + spirit.battle.baseFocus + bond + roleBonus + leadBonus;
  }, 0);
  const opponentScore = opponent.baseFocus + Math.max(0, Math.min(5, Math.floor(priorWins)));
  const victory = focusScore >= opponentScore;

  return {
    ok: true,
    opponentId: opponent.id,
    opponentName: opponent.name,
    partyIds: party.map((spirit) => spirit.id),
    victory,
    focusScore,
    opponentScore,
    trainingXp: victory ? opponent.rewardXp : Math.max(1, Math.floor(opponent.rewardXp / 2)),
    bondDelta: victory ? opponent.bondDelta : 0,
    message: victory
      ? `${party[0].name}'s party clears the ${opponent.name} spar ladder with calm wuxia teamwork.`
      : `${party[0].name}'s party studies the ${opponent.name} spar ladder rhythm and prepares for another no-injury round.`,
    source: 'battle-spar-ladder'
  };
}

export function resolveSpiritBattleRound(
  progress: SpiritBattleRoundProgress,
  fallbackOpponentId: string = SPIRIT_SPAR_LADDER[0].id
): SpiritBattleRoundResult {
  const opponent: SpiritSparOpponent = SPIRIT_SPAR_LADDER.find((entry) => entry.id === (progress.opponentId || fallbackOpponentId)) || SPIRIT_SPAR_LADDER[0];
  const formation = resolveSpiritParty(progress.partyIds || [], progress.activeSpiritId);
  if (!formation.ok) {
    return {
      ok: false,
      roundId: `${opponent.id}-round-0`,
      opponentId: opponent.id,
      opponentName: opponent.name,
      partyIds: [],
      participants: [],
      focusScore: 0,
      opponentScore: opponent.baseFocus,
      victory: false,
      noInjury: true,
      trainingXp: 0,
      bondDelta: 0,
      message: 'A Mochirii party is required before a battle round transcript can be recorded.',
      source: 'battle-round-transcript'
    };
  }

  const bondBySpiritId = progress.bondBySpiritId || {};
  const moveIdBySpiritId = progress.moveIdBySpiritId || {};
  const participants = formation.partyIds.map((spiritId, index) => {
    const spirit = getMochiSpirit(spiritId) as MochiSpirit;
    const selectedMove = spirit.battle.moves.find((move) => move.id === moveIdBySpiritId[spirit.id]) || spirit.battle.moves[0];
    const bond = Math.max(1, Math.min(5, Math.floor(bondBySpiritId[spirit.id] || 1)));
    const roleBonus = opponent.preferredRoles.includes(spirit.battle.role) ? 2 : 0;
    const leadBonus = index === 0 ? 2 : 0;
    const tacticBonus = progress.tacticProof ? 1 : 0;
    const harmonyBonus = progress.harmonyFormProof ? 1 : 0;
    return {
      spiritId: spirit.id,
      name: spirit.name,
      role: spirit.battle.role,
      moveId: selectedMove.id,
      moveLabel: selectedMove.label,
      affinity: selectedMove.affinity,
      bond,
      focusContribution: spirit.battle.baseFocus + selectedMove.power + bond + roleBonus + leadBonus + tacticBonus + harmonyBonus - selectedMove.focusCost
    };
  });
  const priorWins = Math.max(0, Math.min(5, Math.floor(progress.priorWins || 0)));
  const focusScore = participants.reduce((total, participant) => total + participant.focusContribution, 0);
  const opponentScore = opponent.baseFocus + priorWins + Math.max(0, participants.length - 1);
  const victory = focusScore >= opponentScore;
  const roundNumber = priorWins + 1;
  const lead = participants[0];
  const moveSummary = participants.map((participant) => `${participant.name}:${participant.moveLabel}`).join(', ');

  return {
    ok: true,
    roundId: `${opponent.id}-round-${roundNumber}`,
    opponentId: opponent.id,
    opponentName: opponent.name,
    partyIds: participants.map((participant) => participant.spiritId),
    participants,
    focusScore,
    opponentScore,
    victory,
    noInjury: true,
    trainingXp: victory ? opponent.rewardXp + Math.max(0, participants.length - 1) : Math.max(1, Math.floor(opponent.rewardXp / 2)),
    bondDelta: victory ? opponent.bondDelta : 0,
    message: victory
      ? `Battle round transcript: ${lead.name} leads ${moveSummary} against ${opponent.name}, focus ${focusScore}/${opponentScore}. No-injury victory recorded with no real value.`
      : `Battle round transcript: ${lead.name} studies ${opponent.name} with ${moveSummary}, focus ${focusScore}/${opponentScore}. No-injury practice recorded with no real value.`,
    source: 'battle-round-transcript'
  };
}

export function resolveSpiritJournal(
  roster: readonly string[],
  activeSpiritId?: string,
  bondBySpiritId: Record<string, number> = {},
  growthBySpiritId: Record<string, SpiritGrowthStage | string> = {}
): SpiritJournalResult {
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  const active = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const records = MOCHI_SPIRITS.map((spirit) => {
    const discovered = knownRoster.includes(spirit.id);
    const bond = discovered ? Math.max(1, Math.min(5, Math.floor(bondBySpiritId[spirit.id] || 1))) : 0;
    const growthCandidate = growthBySpiritId[spirit.id];
    const growth = discovered && ['seed', 'sprout', 'glow'].includes(String(growthCandidate))
      ? (growthCandidate as SpiritGrowthStage)
      : growthStageFromBond(bond);
    return {
      spiritId: spirit.id,
      name: spirit.name,
      title: spirit.title,
      discovered,
      affinity: spirit.affinity,
      temperament: spirit.temperament,
      habitat: spirit.habitat,
      rarity: spirit.capture.rarity,
      bond,
      growth,
      role: spirit.battle.role,
      certificateEligible: spirit.certificateEligible,
      journalTitle: spirit.journal.title,
      journalSummary: spirit.journal.summary,
      unlockHint: spirit.journal.unlockHint
    };
  });
  const discoveredCount = records.filter((record) => record.discovered).length;
  const activeRecord = records.find((record) => record.spiritId === active && record.discovered);

  return {
    ok: discoveredCount > 0,
    activeSpiritId: active,
    discoveredCount,
    totalCount: records.length,
    records,
    message: activeRecord
      ? `Mochirii spirit journal updated: ${discoveredCount}/${records.length} records. ${activeRecord.name} is ${activeRecord.growth} growth, ${activeRecord.rarity} rarity, ${activeRecord.role} role.`
      : 'Invite a Mochi Spirit before the journal can record a discovered companion.',
    source: 'spirit-journal'
  };
}

export function resolveSpiritTrainingBattle(spiritId: string, moveId: string, bond = 1, round = 1): SpiritTrainingBattleResult {
  const spirit = getMochiSpirit(spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  if (!spirit || !move) {
    return {
      ok: false,
      spiritId,
      moveId,
      victory: false,
      focusScore: 0,
      opponentScore: 0,
      bondDelta: 0,
      trainingXp: 0,
      message: 'Training battle could not start because the spirit or move is not in the Mochirii registry.'
    };
  }

  const boundedBond = Math.max(0, Math.min(5, Math.floor(bond)));
  const boundedRound = Math.max(1, Math.min(5, Math.floor(round)));
  const focusScore = spirit.battle.baseFocus + move.power + boundedBond - move.focusCost;
  const opponentScore = 8 + boundedRound;
  const victory = focusScore >= opponentScore;

  return {
    ok: true,
    spiritId,
    moveId,
    victory,
    focusScore,
    opponentScore,
    bondDelta: victory ? 1 : 0,
    trainingXp: victory ? 3 : 1,
    message: victory
      ? `${spirit.name} completes a no-injury guild spar with ${move.label}.`
      : `${spirit.name} practices ${move.label} and learns the training rhythm.`
  };
}

export function resolveSpiritTechniqueMastery(
  spiritId: string,
  moveId: string,
  currentMasteryXp = 0,
  bond = 1
): SpiritTechniqueMasteryResult {
  const spirit = getMochiSpirit(spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  if (!spirit || !move) {
    return {
      ok: false,
      spiritId,
      moveId,
      masteryLevel: 'novice',
      masteryXp: Math.max(0, Math.floor(currentMasteryXp)),
      awardedXp: 0,
      focusScore: 0,
      message: 'Technique practice could not start because the spirit or move is not in the Mochirii registry.',
      source: 'spirit-technique'
    };
  }

  const boundedBond = Math.max(1, Math.min(5, Math.floor(bond)));
  const boundedCurrentXp = Math.max(0, Math.min(30, Math.floor(currentMasteryXp)));
  const focusScore = spirit.battle.baseFocus + move.power + boundedBond - move.focusCost;
  const awardedXp = Math.max(2, move.power + boundedBond - move.focusCost);
  const masteryXp = Math.min(30, boundedCurrentXp + awardedXp);
  const masteryLevel = techniqueMasteryLevelFromXp(masteryXp);

  return {
    ok: true,
    spiritId: spirit.id,
    moveId: move.id,
    masteryLevel,
    masteryXp,
    awardedXp,
    focusScore,
    message: `${spirit.name} refines ${move.label} at the Mochirii Technique Dojo: ${masteryLevel} mastery, ${masteryXp} XP. No-injury wuxia practice only.`,
    source: 'spirit-technique'
  };
}

export function resolveSpiritBattleTactic(
  spiritId: string,
  moveId: string,
  tacticId = '',
  currentMasteryXp = 0,
  bond = 1
): SpiritBattleTacticResult {
  const spirit = getMochiSpirit(spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  const fallbackTactic = SPIRIT_BATTLE_TACTICS[0];
  const tactic =
    SPIRIT_BATTLE_TACTICS.find((entry) => entry.id === tacticId) ||
    SPIRIT_BATTLE_TACTICS.find((entry) => entry.recommendedMoveId === move?.id) ||
    SPIRIT_BATTLE_TACTICS.find((entry) => move && entry.favoredAffinities.includes(move.affinity)) ||
    SPIRIT_BATTLE_TACTICS.find((entry) => spirit && entry.preferredRoles.includes(spirit.battle.role)) ||
    fallbackTactic;

  if (!spirit || !move) {
    return {
      ok: false,
      tacticId: tactic.id,
      tacticName: tactic.name,
      stance: tactic.stance,
      spiritId,
      moveId,
      focusScore: 0,
      masteryXp: Math.max(0, Math.min(30, Math.floor(currentMasteryXp))),
      awardedXp: 0,
      bondDelta: 0,
      message: 'Battle tactic planning could not start because the spirit or move is not in the Mochirii registry.',
      source: 'battle-tactic-scroll'
    };
  }

  const boundedBond = Math.max(1, Math.min(5, Math.floor(bond)));
  const boundedCurrentXp = Math.max(0, Math.min(30, Math.floor(currentMasteryXp)));
  const roleMatch = tactic.preferredRoles.includes(spirit.battle.role);
  const affinityMatch = tactic.favoredAffinities.includes(move.affinity);
  const moveMatch = tactic.recommendedMoveId === move.id;
  const focusScore = spirit.battle.baseFocus + move.power + boundedBond + (roleMatch ? 2 : 0) + (affinityMatch ? 3 : 0) - move.focusCost;
  const awardedXp = tactic.masteryXp + (roleMatch ? 1 : 0) + (affinityMatch ? 1 : 0) + (moveMatch ? 1 : 0);
  const masteryXp = Math.min(30, boundedCurrentXp + awardedXp);

  return {
    ok: true,
    tacticId: tactic.id,
    tacticName: tactic.name,
    stance: tactic.stance,
    spiritId: spirit.id,
    moveId: move.id,
    focusScore,
    masteryXp,
    awardedXp,
    bondDelta: tactic.bondDelta,
    message: `${spirit.name} studies ${tactic.name} with ${move.label}: ${tactic.stance} stance, ${focusScore} focus, ${masteryXp} tactic XP. ${tactic.lesson} No-injury Mochirii battle planning only; no real value.`,
    source: 'battle-tactic-scroll'
  };
}

export function resolveSpiritTechniqueLoadout(
  progress: SpiritTechniqueLoadoutProgress,
  loadoutId: string = SPIRIT_TECHNIQUE_LOADOUTS[0].id
): SpiritTechniqueLoadoutResult {
  const loadout = SPIRIT_TECHNIQUE_LOADOUTS.find((entry) => entry.id === loadoutId) || SPIRIT_TECHNIQUE_LOADOUTS[0];
  const requiredSpiritIds = new Set(loadout.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of loadout.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (!progress.techniqueProof) {
    missing.push('technique');
  }

  const tacticReady = progress.tacticProof && progress.tacticId === loadout.requiredTacticId;
  if (!tacticReady) {
    missing.push(`tactic:${loadout.requiredTacticId}`);
  }

  const techniqueXp = Math.max(0, Math.floor(progress.techniqueMasteryXp || 0));
  if (techniqueXp < loadout.requiredTechniqueXp) {
    missing.push(`technique-xp:${techniqueXp}/${loadout.requiredTechniqueXp}`);
  }

  if (!progress.routeMasteryProof) {
    missing.push('route-mastery');
  }

  if (!progress.journalProof || progress.journalDiscoveredCount < loadout.requiredSpiritIds.length) {
    missing.push(`journal:${Math.max(0, Math.floor(progress.journalDiscoveredCount || 0))}/${loadout.requiredSpiritIds.length}`);
  }

  const preferredMoveIdBySpiritId = progress.preferredMoveIdBySpiritId || {};
  const moves = partyIds.map((spiritId): SpiritTechniqueLoadoutMove => {
    const spirit = getMochiSpirit(spiritId) as MochiSpirit;
    const selectedMove =
      spirit.battle.moves.find((move) => move.id === preferredMoveIdBySpiritId[spirit.id]) ||
      spirit.battle.moves.find((move) => move.id === SPIRIT_BATTLE_TACTICS.find((tactic) => tactic.preferredRoles.includes(spirit.battle.role))?.recommendedMoveId) ||
      spirit.battle.moves[0];

    return {
      spiritId: spirit.id,
      spiritName: spirit.name,
      role: spirit.battle.role,
      moveId: selectedMove.id,
      moveLabel: selectedMove.label,
      affinity: selectedMove.affinity,
      focusCost: selectedMove.focusCost
    };
  });

  const score =
    Math.min(partyIds.length, loadout.requiredSpiritIds.length) * 3 +
    (progress.techniqueProof ? 4 : 0) +
    (tacticReady ? 4 : 0) +
    Math.min(4, Math.floor(techniqueXp / 5)) +
    (progress.routeMasteryProof ? 3 : 0) +
    (progress.journalProof ? 2 : 0);
  const prepared = missing.length === 0 && score >= loadout.requiredScore;
  const moveSummary = moves.map((move) => `${move.spiritName}:${move.moveLabel}`).join(', ');

  return {
    ok: true,
    prepared,
    loadoutId: loadout.id,
    loadoutName: loadout.name,
    title: loadout.title,
    partyIds,
    moves,
    score,
    requiredScore: loadout.requiredScore,
    missing,
    rewardItemId: loadout.rewardItemId,
    message: prepared
      ? `${loadout.name} prepared: ${moveSummary} are set as no-injury Mochirii party moves for closed-alpha battles.`
      : `${loadout.name} needs ${missing.join(', ')} before party moves can be locked for battle practice.`,
    source: 'spirit-technique-loadout'
  };
}

export function resolveSpiritTechniqueCodex(
  progress: SpiritTechniqueCodexProgress,
  codexId: string = SPIRIT_TECHNIQUE_CODEXES[0].id
): SpiritTechniqueCodexResult {
  const codex = SPIRIT_TECHNIQUE_CODEXES.find((entry) => entry.id === codexId) || SPIRIT_TECHNIQUE_CODEXES[0];
  const requiredSpiritIds = new Set(codex.requiredSpiritIds);
  const requiredMoveIds = new Set(codex.requiredMoveIds);
  const requiredTacticIds = new Set(codex.requiredTacticIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const masteredMoveIds = Array.from(new Set(progress.masteredMoveIds.filter(Boolean))).filter((moveId) => {
    return requiredMoveIds.has(moveId);
  });
  const tacticIds = Array.from(new Set(progress.tacticIds.filter(Boolean))).filter((tacticId) => {
    return requiredTacticIds.has(tacticId);
  });
  const techniqueXp = Math.max(0, Math.floor(progress.techniqueMasteryXp || 0));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of codex.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const moveId of codex.requiredMoveIds) {
    if (!masteredMoveIds.includes(moveId)) missing.push(`move:${moveId}`);
  }

  for (const tacticId of codex.requiredTacticIds) {
    if (!tacticIds.includes(tacticId)) missing.push(`tactic:${tacticId}`);
  }

  if (!progress.techniqueProof) missing.push('technique');

  const loadoutReady = progress.techniqueLoadoutProof && progress.techniqueLoadoutId === codex.requiredLoadoutId;
  if (!loadoutReady) missing.push(`loadout:${codex.requiredLoadoutId}`);

  if (!progress.tacticProof) missing.push('tactic-proof');
  if (techniqueXp < codex.requiredTechniqueXp) missing.push(`technique-xp:${techniqueXp}/${codex.requiredTechniqueXp}`);
  if (trainingXp < codex.requiredTrainingXp) missing.push(`training-xp:${trainingXp}/${codex.requiredTrainingXp}`);
  if (!progress.battleRoundProof || !progress.battleRoundVictory) missing.push('battle-round');
  if (!progress.journalProof || journalDiscoveredCount < codex.requiredSpiritIds.length) {
    missing.push(`journal:${journalDiscoveredCount}/${codex.requiredSpiritIds.length}`);
  }
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(partyIds.length, codex.requiredSpiritIds.length) * 3 +
    Math.min(masteredMoveIds.length, codex.requiredMoveIds.length) * 4 +
    Math.min(tacticIds.length, codex.requiredTacticIds.length) * 2 +
    (progress.techniqueProof ? 4 : 0) +
    (loadoutReady ? 5 : 0) +
    (progress.tacticProof ? 3 : 0) +
    Math.min(6, Math.floor(techniqueXp / 3)) +
    Math.min(trainingXp, codex.requiredTrainingXp) +
    (progress.battleRoundProof && progress.battleRoundVictory ? 4 : 0) +
    (progress.journalProof ? 2 : 0) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const codified = missing.length === 0 && score >= codex.requiredScore;
  const moveNames = masteredMoveIds.map((moveId) => {
    return Object.values(SPIRIT_MOVES).find((move) => move.id === moveId)?.label || moveId;
  });

  return {
    ok: true,
    codified,
    codexId: codex.id,
    codexName: codex.name,
    title: codex.title,
    partyIds,
    masteredMoveIds,
    tacticIds,
    score,
    requiredScore: codex.requiredScore,
    missing,
    rewardItemId: codex.rewardItemId,
    message: codified
      ? `${codex.name} sealed: ${moveNames.join(', ')} and ${tacticIds.length} tactic stances are recorded for no-injury Mochirii party battles. No real value.`
      : `${codex.name} needs ${missing.join(', ')} before full-party technique literacy can be sealed.`,
    source: 'spirit-technique-codex'
  };
}

export function resolveSpiritTraitAttunement(
  progress: SpiritTraitAttunementProgress,
  traitId: string = SPIRIT_TRAIT_ATTUNEMENTS[0].id
): SpiritTraitAttunementResult {
  const trait = SPIRIT_TRAIT_ATTUNEMENTS.find((entry) => entry.id === traitId) || SPIRIT_TRAIT_ATTUNEMENTS[0];
  const requiredSpiritIds = new Set(trait.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && partyIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || trait.requiredSpiritIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId) || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const spiritId of trait.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === trait.requiredMentorChallengeId;
  if (!mentorReady) {
    missing.push(`mentor:${trait.requiredMentorChallengeId}`);
  }

  const loadoutReady = progress.techniqueLoadoutProof && progress.techniqueLoadoutId === trait.requiredLoadoutId;
  if (!loadoutReady) {
    missing.push(`loadout:${trait.requiredLoadoutId}`);
  }

  const battleReady = progress.battleRoundProof && progress.battleRoundVictory;
  if (!battleReady) {
    missing.push('battle-round');
  }

  if (!progress.growthRiteProof) {
    missing.push('growth-rite');
  }

  const careStreak = Math.max(0, Math.floor(progress.careStreak || 0));
  if (careStreak < trait.requiredCareStreak) {
    missing.push(`care-streak:${careStreak}/${trait.requiredCareStreak}`);
  }

  const bondBySpiritId = progress.bondBySpiritId || {};
  const activeBond = Math.max(0, Math.floor(bondBySpiritId[activeSpiritId] ?? bondBySpiritId[activeSpirit.id] ?? 0));
  if (activeBond < trait.requiredBond) {
    missing.push(`bond:${activeBond}/${trait.requiredBond}`);
  }

  if (!progress.journalProof || progress.journalDiscoveredCount < trait.requiredSpiritIds.length) {
    missing.push(`journal:${Math.max(0, Math.floor(progress.journalDiscoveredCount || 0))}/${trait.requiredSpiritIds.length}`);
  }

  const bondScore = Math.min(6, partyIds.reduce((total, spiritId) => total + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)), 0));
  const score =
    Math.min(partyIds.length, trait.requiredSpiritIds.length) * 3 +
    (mentorReady ? 6 : 0) +
    (loadoutReady ? 4 : 0) +
    (battleReady ? 3 : 0) +
    (progress.growthRiteProof ? 3 : 0) +
    Math.min(3, careStreak * 2) +
    bondScore +
    (progress.journalProof ? 2 : 0);
  const unlocked = missing.length === 0 && score >= trait.requiredScore;
  const traitLabel = trait.traitBySpiritId[activeSpirit.id] || trait.traitBySpiritId[activeSpiritId] || trait.name;

  return {
    ok: true,
    unlocked,
    traitId: trait.id,
    traitName: trait.name,
    title: trait.title,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    traitLabel,
    partyIds,
    score,
    requiredScore: trait.requiredScore,
    missing,
    rewardItemId: trait.rewardItemId,
    message: unlocked
      ? `${activeSpirit.name} unlocks ${traitLabel} through ${trait.name}: care, growth, mentor readiness, battle proof, and Jade Step moves are recorded as no-real-value Mochirii trait progress.`
      : `${trait.name} needs ${missing.join(', ')} before an original Mochirii trait can be attuned.`,
    source: 'spirit-trait-attunement'
  };
}

export function resolveSpiritConditionWeave(
  progress: SpiritConditionWeaveProgress,
  weaveId: string = SPIRIT_CONDITION_WEAVES[0].id
): SpiritConditionWeaveResult {
  const weave = SPIRIT_CONDITION_WEAVES.find((entry) => entry.id === weaveId) || SPIRIT_CONDITION_WEAVES[0];
  const requiredSpiritIds = new Set(weave.requiredSpiritIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && partyIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || weave.requiredSpiritIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId) || MOCHI_SPIRITS[0];
  const missing: string[] = [];

  for (const spiritId of weave.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const conditionSet = new Set(weave.requiredConditionIds);
  const conditions = SPIRIT_BATTLE_CONDITIONS.filter((condition) => conditionSet.has(condition.id));
  for (const conditionId of weave.requiredConditionIds) {
    const condition = conditions.find((entry) => entry.id === conditionId);
    if (!condition || !partyIds.includes(condition.spiritId)) {
      missing.push(`condition:${conditionId}`);
    }
  }

  if (!progress.tacticProof) {
    missing.push('tactic');
  }

  if (!progress.affinityProof) {
    missing.push('affinity');
  }

  const battleReady = progress.battleRoundProof && progress.battleRoundVictory;
  if (!battleReady) {
    missing.push('battle-round');
  }

  const loadoutReady = progress.techniqueLoadoutProof && progress.techniqueLoadoutId === weave.requiredLoadoutId;
  if (!loadoutReady) {
    missing.push(`loadout:${weave.requiredLoadoutId}`);
  }

  const traitReady = progress.traitAttunementProof && progress.traitAttunementId === weave.requiredTraitId;
  if (!traitReady) {
    missing.push(`trait:${weave.requiredTraitId}`);
  }

  const mentorReady = progress.mentorChallengeProof && progress.mentorChallengeId === weave.requiredMentorChallengeId;
  if (!mentorReady) {
    missing.push(`mentor:${weave.requiredMentorChallengeId}`);
  }

  const sparWins = Math.max(0, Math.floor(progress.sparLadderWins || 0));
  if (sparWins < weave.requiredSparWins) {
    missing.push(`spar-wins:${sparWins}/${weave.requiredSparWins}`);
  }

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < weave.requiredTrainingXp) {
    missing.push(`training-xp:${trainingXp}/${weave.requiredTrainingXp}`);
  }

  if (!progress.profileViewed) {
    missing.push('profile');
  }

  if (!progress.guildBuddyProof) {
    missing.push('guild-buddy');
  }

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) {
    missing.push('status');
  }

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (!chatLines.length) {
    missing.push('chat');
  }

  const conditionScore = conditions.reduce((total, condition) => total + condition.focusBonus, 0);
  const score =
    Math.min(partyIds.length, weave.requiredSpiritIds.length) * 3 +
    conditionScore +
    (progress.tacticProof ? 3 : 0) +
    (progress.affinityProof ? 2 : 0) +
    (battleReady ? 4 : 0) +
    (loadoutReady ? 4 : 0) +
    (traitReady ? 4 : 0) +
    (mentorReady ? 4 : 0) +
    Math.min(sparWins, weave.requiredSparWins) * 2 +
    Math.min(trainingXp, weave.requiredTrainingXp) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const woven = missing.length === 0 && score >= weave.requiredScore;
  const conditionNames = conditions.map((condition) => condition.name);
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    woven,
    weaveId: weave.id,
    weaveName: weave.name,
    title: weave.title,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    partyIds,
    conditionIds: conditions.map((condition) => condition.id),
    conditionNames,
    score,
    requiredScore: weave.requiredScore,
    missing,
    rewardItemId: weave.rewardItemId,
    message: woven
      ? `${weave.name} complete: ${partyNames} coordinate ${conditionNames.join(', ')} as no-injury battle conditions for closed-alpha testing. No-real-value condition proof only.`
      : `${weave.name} needs ${missing.join(', ')} before non-injury battle conditions can be woven.`,
    source: 'battle-condition-weave'
  };
}

export function resolveSpiritAffinityMatrix(
  progress: SpiritAffinityMatrixProgress,
  matrixId: string = SPIRIT_AFFINITY_MATRICES[0].id
): SpiritAffinityMatrixResult {
  const matrix = SPIRIT_AFFINITY_MATRICES.find((entry) => entry.id === matrixId) || SPIRIT_AFFINITY_MATRICES[0];
  const requiredSpiritIds = new Set(matrix.requiredSpiritIds);
  const requiredAffinityLabels = new Set<string>(matrix.requiredAffinityLabels);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && partyIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || matrix.requiredSpiritIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId) || MOCHI_SPIRITS[0];
  const inferredAffinityLabels = partyIds
    .map((spiritId) => getMochiSpirit(spiritId)?.affinity || '')
    .filter((affinity) => affinity.length > 0);
  const affinityLabels = Array.from(new Set((progress.affinityLabels?.length ? progress.affinityLabels : inferredAffinityLabels).filter(Boolean))).filter((affinity) => {
    return requiredAffinityLabels.has(affinity);
  });
  const conditionIds = Array.from(new Set(progress.conditionIds.filter(Boolean))).filter((conditionId) => {
    return matrix.requiredConditionIds.includes(conditionId);
  });
  const localConditionIds = new Set(conditionIds);
  const missing: string[] = [];

  for (const spiritId of matrix.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const affinity of matrix.requiredAffinityLabels) {
    if (!affinityLabels.includes(affinity)) missing.push(`affinity:${affinity}`);
  }

  for (const conditionId of matrix.requiredConditionIds) {
    if (!localConditionIds.has(conditionId)) missing.push(`condition:${conditionId}`);
  }

  const affinityReady = progress.affinityProof && progress.affinityTrialId === matrix.requiredTrialId;
  if (!affinityReady) missing.push(`trial:${matrix.requiredTrialId}`);

  const loadoutReady = progress.techniqueLoadoutProof && progress.techniqueLoadoutId === matrix.requiredLoadoutId;
  if (!loadoutReady) missing.push(`loadout:${matrix.requiredLoadoutId}`);

  const traitReady = progress.traitAttunementProof && progress.traitAttunementId === matrix.requiredTraitId;
  if (!traitReady) missing.push(`trait:${matrix.requiredTraitId}`);

  const weaveReady = progress.conditionWeaveProof && progress.conditionWeaveId === matrix.requiredWeaveId;
  if (!weaveReady) missing.push(`weave:${matrix.requiredWeaveId}`);

  const focusScore = Math.max(0, Math.floor(progress.battleRoundFocusScore || 0));
  const opponentScore = Math.max(0, Math.floor(progress.battleRoundOpponentScore || 0));
  const battleReady = progress.battleRoundProof && progress.battleRoundVictory && focusScore >= opponentScore && focusScore > 0 && opponentScore > 0;
  if (!battleReady) missing.push('battle-round');

  if (!progress.tacticProof) missing.push('tactic');
  if (!progress.harmonyFormProof) missing.push('harmony');

  const sparWins = Math.max(0, Math.floor(progress.sparLadderWins || 0));
  if (sparWins < matrix.requiredSparWins) missing.push(`spar-wins:${sparWins}/${matrix.requiredSparWins}`);

  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  if (trainingXp < matrix.requiredTrainingXp) missing.push(`training-xp:${trainingXp}/${matrix.requiredTrainingXp}`);

  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');

  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  if (!statusReady) missing.push('status');

  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(partyIds.length, matrix.requiredSpiritIds.length) * 3 +
    Math.min(affinityLabels.length, matrix.requiredAffinityLabels.length) * 2 +
    Math.min(conditionIds.length, matrix.requiredConditionIds.length) * 2 +
    (affinityReady ? 5 : 0) +
    (loadoutReady ? 4 : 0) +
    (traitReady ? 4 : 0) +
    (weaveReady ? 5 : 0) +
    (battleReady ? 4 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.harmonyFormProof ? 2 : 0) +
    Math.min(sparWins, matrix.requiredSparWins) * 2 +
    Math.min(trainingXp, matrix.requiredTrainingXp) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const mapped = missing.length === 0 && score >= matrix.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    mapped,
    matrixId: matrix.id,
    matrixName: matrix.name,
    title: matrix.title,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    partyIds,
    affinityLabels,
    conditionIds,
    score,
    requiredScore: matrix.requiredScore,
    missing,
    rewardItemId: matrix.rewardItemId,
    message: mapped
      ? `${matrix.name} mapped: ${partyNames} link ${affinityLabels.join(', ')} affinities with ${conditionIds.join(', ')} conditions before no-injury brackets and rival bouts. No real value.`
      : `${matrix.name} needs ${missing.join(', ')} before matchup planning can be recorded.`,
    source: 'battle-affinity-matrix'
  };
}

export function resolveSpiritRelicAttunement(
  progress: SpiritRelicAttunementProgress,
  relicAttunementId: string = SPIRIT_RELIC_ATTUNEMENTS[0].id
): SpiritRelicAttunementResult {
  const relic = SPIRIT_RELIC_ATTUNEMENTS.find((entry) => entry.id === relicAttunementId) || SPIRIT_RELIC_ATTUNEMENTS[0];
  const requiredSpiritIds = new Set(relic.requiredSpiritIds);
  const requiredItemIds = new Set(relic.requiredItemIds);
  const partyIds = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getMochiSpirit(spiritId));
  });
  const itemIds = Array.from(new Set(progress.itemIds.filter(Boolean))).filter((itemId) => requiredItemIds.has(itemId));
  const activeSpiritId = progress.activeSpiritId && partyIds.includes(progress.activeSpiritId) ? progress.activeSpiritId : partyIds[0] || relic.requiredSpiritIds[0];
  const activeSpirit = getMochiSpirit(activeSpiritId) || MOCHI_SPIRITS[0];
  const localPresenceCount = Math.max(0, Math.floor(progress.localPresenceCount || 0));
  const statusMood = String(progress.statusMood || '').trim();
  const statusReady = Boolean(statusMood) && statusMood !== 'exploring';
  const chatLines = Array.isArray(progress.chatLines) ? progress.chatLines.filter((line) => String(line).trim().length > 0) : [];
  const missing: string[] = [];

  for (const spiritId of relic.requiredSpiritIds) {
    if (!partyIds.includes(spiritId)) missing.push(`spirit:${spiritId}`);
  }

  for (const itemId of relic.requiredItemIds) {
    if (!itemIds.includes(itemId)) missing.push(`item:${itemId}`);
  }

  const loadoutReady = progress.techniqueLoadoutProof && progress.techniqueLoadoutId === relic.requiredLoadoutId;
  if (!loadoutReady) missing.push(`loadout:${relic.requiredLoadoutId}`);

  const codexReady = progress.techniqueCodexProof && progress.techniqueCodexId === relic.requiredTechniqueCodexId;
  if (!codexReady) missing.push(`technique-codex:${relic.requiredTechniqueCodexId}`);

  const traitReady = progress.traitAttunementProof && progress.traitAttunementId === relic.requiredTraitId;
  if (!traitReady) missing.push(`trait:${relic.requiredTraitId}`);

  const conditionReady = progress.conditionWeaveProof && progress.conditionWeaveId === relic.requiredConditionWeaveId;
  if (!conditionReady) missing.push(`condition:${relic.requiredConditionWeaveId}`);

  const affinityReady = progress.affinityMatrixProof && progress.affinityMatrixId === relic.requiredAffinityMatrixId;
  if (!affinityReady) missing.push(`affinity-matrix:${relic.requiredAffinityMatrixId}`);

  const craftReady = progress.craftWritProof && progress.craftWritId === relic.requiredCraftWritId;
  if (!craftReady) missing.push(`craft-writ:${relic.requiredCraftWritId}`);

  const exchangeReady = progress.exchangeAccordProof && progress.exchangeAccordId === relic.requiredExchangeAccordId;
  if (!exchangeReady) missing.push(`exchange-accord:${relic.requiredExchangeAccordId}`);

  if (!progress.careCycleProof) missing.push('care-cycle');
  if (!progress.temperamentConcordProof) missing.push('temperament');
  if (!progress.growthRiteProof) missing.push('growth');
  if (localPresenceCount < relic.requiredPresenceCount) missing.push(`presence:${localPresenceCount}/${relic.requiredPresenceCount}`);
  if (!progress.profileViewed) missing.push('profile');
  if (!progress.guildBuddyProof) missing.push('guild-buddy');
  if (!statusReady) missing.push('status');
  if (!chatLines.length) missing.push('chat');

  const score =
    Math.min(partyIds.length, relic.requiredSpiritIds.length) * 3 +
    Math.min(itemIds.length, relic.requiredItemIds.length) * 3 +
    (loadoutReady ? 4 : 0) +
    (codexReady ? 5 : 0) +
    (traitReady ? 4 : 0) +
    (conditionReady ? 4 : 0) +
    (affinityReady ? 5 : 0) +
    (craftReady ? 4 : 0) +
    (exchangeReady ? 4 : 0) +
    (progress.careCycleProof ? 3 : 0) +
    (progress.temperamentConcordProof ? 3 : 0) +
    (progress.growthRiteProof ? 2 : 0) +
    Math.min(localPresenceCount, relic.requiredPresenceCount) * 3 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const attuned = missing.length === 0 && score >= relic.requiredScore;
  const partyNames = partyIds.map((spiritId) => getMochiSpirit(spiritId)?.name || spiritId).join(', ');
  const relicLabel = relic.relicLabelBySpiritId[activeSpirit.id] || relic.name;

  return {
    ok: true,
    attuned,
    relicAttunementId: relic.id,
    relicAttunementName: relic.name,
    title: relic.title,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    relicLabel,
    partyIds,
    itemIds,
    localPresenceCount,
    score,
    requiredScore: relic.requiredScore,
    missing,
    rewardItemId: relic.rewardItemId,
    message: attuned
      ? `${relic.name} complete: ${partyNames} bind ${relicLabel} with craft, exchange, care, traits, conditions, affinity planning, and two-tester social proof for closed-alpha held-charm readiness. No real value.`
      : `${relic.name} needs ${missing.join(', ')} before the held charm can be attuned for closed-alpha battle readiness.`,
    source: 'spirit-relic-attunement'
  };
}

export function resolveGuildRankTrial(
  progress: GuildRankTrialProgress,
  trialId: string = GUILD_RANK_TRIALS[0].id
): GuildRankTrialResult {
  const trial = GUILD_RANK_TRIALS.find((entry) => entry.id === trialId) || GUILD_RANK_TRIALS[0];
  const roster = Array.from(new Set(progress.roster || [])).filter((spiritId) => Boolean(getMochiSpirit(spiritId)));
  const activeSpirit = getMochiSpirit(progress.activeSpiritId || roster[0] || '');
  const bond = Math.max(0, Math.min(5, Math.floor(progress.bond || 0)));
  const completedQuestSteps = Array.from(new Set((progress.completedQuestSteps || []).filter(Boolean)));
  const affinityWins = Math.max(0, Math.floor(progress.affinityWins || 0));
  const sparWins = Math.max(0, Math.floor(progress.sparWins || 0));
  const journalDiscoveredCount = Math.max(0, Math.floor(progress.journalDiscoveredCount || 0));
  const score =
    roster.length * 2 +
    bond +
    completedQuestSteps.length +
    (progress.tacticProof ? 2 : 0) +
    Math.min(4, affinityWins * 2) +
    Math.min(2, sparWins) +
    Math.min(2, journalDiscoveredCount) +
    (progress.guildBuddyProof ? 1 : 0);
  const enoughRoster = roster.length >= trial.requiredSpiritCount;
  const enoughQuest = completedQuestSteps.length >= trial.requiredQuestStepCount;
  const passed = enoughRoster && enoughQuest && progress.tacticProof && score >= trial.requiredScore;
  const activeName = activeSpirit?.name || 'your lead Mochi Spirit';

  return {
    ok: passed,
    passed,
    trialId: trial.id,
    trialTitle: trial.title,
    rankTitle: trial.rankTitle,
    score,
    requiredScore: trial.requiredScore,
    rewardItemId: trial.rewardItemId,
    message: passed
      ? `${activeName} presents the ${trial.title}: score ${score}/${trial.requiredScore}. ${trial.rankTitle} recorded as no-real-value Mochirii guild progress.`
      : `${trial.title} needs ${trial.requiredSpiritCount} spirits, ${trial.requiredQuestStepCount} quest step, tactic proof, and score ${trial.requiredScore}. Current score ${score}; keep bonding, scouting, and practicing safely.`,
    source: 'guild-rank-trial'
  };
}

export function resolveSpiritGrowthRite(
  progress: SpiritGrowthRiteProgress,
  riteId: string = SPIRIT_GROWTH_RITES[0].id
): SpiritGrowthRiteResult {
  const rite = SPIRIT_GROWTH_RITES.find((entry) => entry.id === riteId) || SPIRIT_GROWTH_RITES[0];
  const spirit = getMochiSpirit(progress.spiritId || '');
  const spiritId = spirit?.id || String(progress.spiritId || '');
  const bond = Math.max(0, Math.min(5, Math.floor(progress.bond || 0)));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const growth = normalizeSpiritGrowth(progress.growth, bond);
  const rankMatches = Boolean(progress.rankTrialProof) && progress.rankTrialId === rite.requiredRankTrialId;
  const passed = Boolean(spirit) &&
    bond >= rite.requiredBond &&
    growth === rite.requiredGrowth &&
    trainingXp >= rite.requiredTrainingXp &&
    progress.raisingProof &&
    rankMatches;
  const spiritName = spirit?.name || 'your Mochi Spirit';

  return {
    ok: passed,
    passed,
    riteId: rite.id,
    riteName: rite.name,
    spiritId,
    spiritName,
    formTitle: rite.formTitle,
    bond,
    growth,
    trainingXp,
    rewardItemId: rite.rewardItemId,
    message: passed
      ? `${spiritName} completes the ${rite.name} and opens ${rite.formTitle}. This is no-real-value Mochirii growth proof for closed-alpha testing.`
      : `${rite.name} needs ${rite.requiredGrowth} growth, bond ${rite.requiredBond}/5, ${rite.requiredTrainingXp} training XP, raising care, and Jade Court rank proof before a spirit can bloom.`,
    source: 'spirit-growth-rite'
  };
}

export function resolveSpiritAffinityTrial(
  spiritId: string,
  moveId: string,
  trialId: string = SPIRIT_AFFINITY_TRIALS[0].id,
  bond = 1,
  techniqueMasteryXp = 0
): SpiritAffinityTrialResult {
  const spirit = getMochiSpirit(spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  const trial = SPIRIT_AFFINITY_TRIALS.find((entry) => entry.id === trialId) || SPIRIT_AFFINITY_TRIALS[0];
  if (!spirit || !move) {
    return {
      ok: false,
      spiritId,
      moveId,
      trialId: trial.id,
      trialName: trial.name,
      affinityAdvantage: false,
      focusScore: 0,
      trialScore: trial.baseFocus,
      victory: false,
      masteryXp: Math.max(0, Math.floor(techniqueMasteryXp)),
      bondDelta: 0,
      message: 'Affinity trial could not start because the spirit or move is not in the Mochirii registry.',
      source: 'battle-affinity-trial'
    };
  }

  const boundedBond = Math.max(1, Math.min(5, Math.floor(bond)));
  const boundedMasteryXp = Math.max(0, Math.min(30, Math.floor(techniqueMasteryXp)));
  const affinityAdvantage = trial.favoredAffinities.includes(move.affinity);
  const masteryBonus = Math.floor(boundedMasteryXp / 7);
  const focusScore = spirit.battle.baseFocus + move.power + boundedBond + masteryBonus + (affinityAdvantage ? 3 : 0) - move.focusCost;
  const trialScore = trial.baseFocus;
  const victory = focusScore >= trialScore;
  const masteryXp = Math.min(30, boundedMasteryXp + (victory ? trial.rewardXp : Math.max(1, Math.floor(trial.rewardXp / 2))));

  return {
    ok: true,
    spiritId: spirit.id,
    moveId: move.id,
    trialId: trial.id,
    trialName: trial.name,
    affinityAdvantage,
    focusScore,
    trialScore,
    victory,
    masteryXp,
    bondDelta: victory ? trial.bondDelta : 0,
    message: victory
      ? `${spirit.name} clears the ${trial.name} with ${move.label}; affinity ${affinityAdvantage ? 'harmonized' : 'studied'}, mastery ${masteryXp} XP.`
      : `${spirit.name} studies the ${trial.name} with ${move.label}; ${trial.lesson}`,
    source: 'battle-affinity-trial'
  };
}

export function selectSpiritRaisingNeed(spiritId: string, careStreak = 0): SpiritRaisingNeed | undefined {
  const spirit = getMochiSpirit(spiritId);
  if (!spirit?.raisingNeeds.length) return undefined;

  const index = Math.max(0, Math.floor(careStreak)) % spirit.raisingNeeds.length;
  return spirit.raisingNeeds[index];
}

export function resolveSpiritRaisingAction(spiritId: string, needId: string, currentBond = 1, careStreak = 0): SpiritRaisingResult {
  const spirit = getMochiSpirit(spiritId);
  const need = spirit?.raisingNeeds.find((candidate) => candidate.id === needId);
  const boundedCareStreak = Math.max(0, Math.floor(careStreak));
  const boundedBond = Math.max(0, Math.min(5, Math.floor(currentBond)));
  if (!spirit || !need) {
    return {
      ok: false,
      spiritId,
      needId,
      bond: boundedBond,
      growth: growthStageFromBond(boundedBond),
      careStreak: boundedCareStreak,
      milestoneReached: false,
      message: 'Raising action is not available for this Mochi Spirit.',
      source: 'spirit-raise'
    };
  }

  const previousMilestone = resolveSpiritBondMilestone(spirit.id, boundedBond);
  const bond = Math.max(0, Math.min(5, boundedBond + need.bondDelta));
  const milestone = resolveSpiritBondMilestone(spirit.id, bond);
  const milestoneReached = Boolean(milestone.milestone && milestone.milestone.id !== previousMilestone.milestone?.id);
  const nextCareStreak = boundedCareStreak + 1;
  const nextNeed = selectSpiritRaisingNeed(spiritId, nextCareStreak);
  const milestoneText = milestoneReached
    ? ` ${milestone.milestone?.label} milestone opened.`
    : milestone.nextMilestone
      ? ` Next milestone: ${milestone.nextMilestone.label}.`
      : ' All first-court bond milestones are open.';
  return {
    ok: true,
    spiritId,
    needId,
    bond,
    growth: growthStageFromBond(bond),
    careStreak: nextCareStreak,
    milestoneId: milestone.milestone?.id,
    milestoneLabel: milestone.milestone?.label,
    milestoneReached,
    nextMilestoneId: milestone.nextMilestone?.id,
    nextMilestoneLabel: milestone.nextMilestone?.label,
    nextNeedId: nextNeed?.id,
    message: `${need.label} complete for ${spirit.name}. ${need.growthHint} Care streak ${nextCareStreak}.${milestoneText}`,
    source: 'spirit-raise'
  };
}
