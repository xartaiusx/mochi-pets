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
  charm: {
    id: 'jade-thread-charm',
    name: 'Jade Thread Charm',
    description: 'A no-real-value alpha market item for fixed-price and trade testing.'
  },
  harmonyTea: {
    id: 'lantern-harmony-tea',
    name: 'Lantern Harmony Tea',
    description: 'A no-real-value spirit invitation lure brewed for Jade Lantern Court encounters.'
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
  loadoutSlip: {
    id: 'jade-step-loadout-slip',
    name: 'Jade Step Loadout Slip',
    description: 'A no-real-value technique loadout proof for closed-alpha Mochirii party battles.'
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
  habitatTassel: {
    id: 'jade-court-habitat-tassel',
    name: 'Jade Court Habitat Tassel',
    description: 'A no-real-value habitat bond proof for closed-alpha Mochirii raising and roleplay progression.'
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
  certificate: {
    id: 'lirabao-canary-certificate',
    name: 'Lirabao Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
} as const;

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
    requiredScore: 24,
    rewardItemId: ALPHA_ITEMS.provisionSatchel.id,
    summary: 'A no-real-value first-court item bag proof for testers who stock original Mochirii lures, care provisions, market listings, direct trades, and quest supplies.'
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
      ? `${satchel.name} stocked: ${activeName} carries original Mochirii lures, care provisions, market proof, trade proof, and quest supplies. No-real-value item preparation only.`
      : `${satchel.name} needs ${missing.join(', ')} before the first-court provision bag can be stocked.`,
    source: 'item-provision-satchel'
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
