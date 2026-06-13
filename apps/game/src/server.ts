import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrebuiltGui, createModule, defineModule } from '@rpgjs/common';
import {
  createServer,
  provideAutoSave,
  provideSaveStorage,
  provideServerModules,
  type EventDefinition,
  type RpgPlayer,
  type RpgPlayerHooks,
  type SaveStorageStrategy
} from '@rpgjs/server';
import { provideTiledMap } from '@rpgjs/tiledmap/server';
import type { SaveSlot, SaveSlotEntries, SaveSlotList, SaveSlotMeta } from '@rpgjs/common';

const saveDir = process.env.RPG_SAVE_DIR ?? '.local/saves';
const spawn = {
  x: 768,
  y: 576
};

const spawnOffsets = [
  { x: 0, y: 0 },
  { x: 64, y: 0 },
  { x: 0, y: 64 },
  { x: 64, y: 64 },
  { x: -64, y: 0 },
  { x: 0, y: -64 }
] as const;

const playerSpawnSlots = new Map<string, number>();
let nextSpawnSlot = 0;

const alphaPromptMs = 2600;

type AlphaHudStatePatch = {
  canaryRequested?: boolean;
  canaryReturnRequested?: boolean;
  charmListed?: boolean;
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
  routeMastery?: {
    masteryId: string;
    message?: string;
    proof: boolean;
    rewardItemId: string;
    score: number;
    title: string;
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
  capture?: {
    message?: string;
    roster: string[];
    spiritId: string;
  };
  journal?: {
    activeSpiritId?: string;
    discoveredCount: number;
    message?: string;
    proof: boolean;
    totalCount: number;
  };
  party?: {
    activeSpiritId?: string;
    message?: string;
    partyIds: string[];
    supportIds: string[];
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
    needId: string;
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
  training?: {
    message?: string;
    victories: number;
    xp: number;
  };
  tradeProof?: boolean;
};

type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

type SpiritBattleRole = 'guardian' | 'trickster' | 'scout';

type SpiritBattleStance = 'anchor' | 'feint' | 'ward';

type SpiritTechniqueMasteryLevel = 'novice' | 'practiced' | 'adept';

type SpiritBattleMove = {
  affinity: string;
  id: string;
  label: string;
  power: number;
  focusCost: number;
};

type SpiritRaisingNeed = {
  id: string;
  label: string;
  bondDelta: number;
  growthHint: string;
};

type SpiritCaptureProfile = {
  encounterId: string;
  invitationLabel: string;
  lureItemId: string;
  harmonyRequired: number;
  rarity: 'common' | 'uncommon' | 'rare';
  habitatNote: string;
};

type SpiritJournalEntry = {
  title: string;
  summary: string;
  unlockHint: string;
};

type SpiritSparOpponent = {
  id: string;
  name: string;
  affinity: string;
  baseFocus: number;
  preferredRoles: readonly SpiritBattleRole[];
  rewardXp: number;
  bondDelta: number;
};

type SpiritAffinityTrial = {
  id: string;
  name: string;
  title: string;
  affinity: string;
  baseFocus: number;
  favoredAffinities: readonly string[];
  rewardXp: number;
  bondDelta: number;
  lesson: string;
};

type SpiritBattleTactic = {
  id: string;
  name: string;
  stance: SpiritBattleStance;
  preferredRoles: readonly SpiritBattleRole[];
  favoredAffinities: readonly string[];
  recommendedMoveId: string;
  masteryXp: number;
  bondDelta: number;
  lesson: string;
};

type GuildRankTrial = {
  id: string;
  title: string;
  rankTitle: string;
  requiredSpiritCount: number;
  requiredQuestStepCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type GuildRankTrialProgress = {
  roster: readonly string[];
  activeSpiritId?: string;
  bond: number;
  completedQuestSteps: readonly string[];
  tacticProof: boolean;
  affinityWins: number;
  sparWins: number;
  journalDiscoveredCount: number;
  guildBuddyProof?: boolean;
};

type SpiritGrowthRite = {
  id: string;
  name: string;
  formTitle: string;
  requiredGrowth: SpiritGrowthStage;
  requiredBond: number;
  requiredTrainingXp: number;
  requiredRankTrialId: string;
  rewardItemId: string;
  summary: string;
};

type SpiritGrowthRiteProgress = {
  spiritId?: string;
  bond: number;
  growth: SpiritGrowthStage | string;
  trainingXp: number;
  raisingProof: boolean;
  rankTrialProof: boolean;
  rankTrialId?: string;
};

type SpiritExpeditionRoute = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  requiredHarmony: number;
  encounterSpiritId: string;
  recommendedItemId: string;
  rewardItemId: string;
  routeNote: string;
};

type SpiritRouteMastery = {
  id: string;
  title: string;
  requiredRouteIds: readonly string[];
  requiredSpiritCount: number;
  requiredJournalCount: number;
  requiredQuestIds: readonly string[];
  requiredRankTrialId: string;
  rewardItemId: string;
  summary: string;
};

type SpiritRouteMasteryProgress = {
  discoveredRoutes: readonly string[];
  roster: readonly string[];
  journalDiscoveredCount: number;
  completedQuestIds: readonly string[];
  guildRankProof: boolean;
  rankTrialId?: string;
};

type SpiritHabitatBond = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  requiredSpiritIds: readonly string[];
  requiredJournalCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritHabitatBondProgress = {
  roster: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  careProof: boolean;
  bond: number;
  growth?: SpiritGrowthStage | string;
  profileViewed: boolean;
  guildBuddyProof: boolean;
  statusMood?: string;
};

type SpiritResearchFolio = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredJournalCount: number;
  requiredHabitatBondId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritResearchFolioProgress = {
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
};

type SpiritCompendiumCompletion = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  requiredSpiritIds: readonly string[];
  requiredRouteIds: readonly string[];
  requiredJournalCount: number;
  requiredHabitatBondId: string;
  requiredResearchFolioId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritCompendiumProgress = {
  roster: readonly string[];
  activeSpiritId?: string;
  discoveredRoutes: readonly string[];
  journalDiscoveredCount: number;
  habitatBondProof: boolean;
  habitatBondId?: string;
  researchProof: boolean;
  researchFolioId?: string;
  routeMasteryProof: boolean;
};

type SpiritProvisionSatchel = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  stockItemIds: readonly string[];
  requiredRosterCount: number;
  requiredJournalCount: number;
  requiredCareStreak: number;
  requiredCompletedQuestCount: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritProvisionSatchelProgress = {
  roster: readonly string[];
  activeSpiritId?: string;
  journalDiscoveredCount: number;
  marketProof: boolean;
  tradeProof: boolean;
  routeInviteProof: boolean;
  careStreak: number;
  completedQuestIds: readonly string[];
};

type GuildCommission = {
  id: string;
  name: string;
  title: string;
  habitat: 'Jade Lantern Court';
  requiredRosterCount: number;
  requiredJournalCount: number;
  requiredCompletedQuestCount: number;
  requiredTrainingXp: number;
  requiredProvisionSatchelId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type GuildCommissionProgress = {
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
};

type SpiritHarmonyForm = {
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
};

type SpiritHarmonyFormProgress = {
  partyIds: readonly string[];
  routeMasteryProof: boolean;
  routeMasteryId?: string;
  growthRiteProof: boolean;
  growthRiteId?: string;
  tacticProof: boolean;
  affinityProof: boolean;
  trainingXp: number;
  sparLadderXp: number;
};

type SpiritHarmonyTrial = {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredHarmonyFormId: string;
  requiredSparWins: number;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritHarmonyTrialProgress = {
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
};

type SpiritTeamSparMatch = {
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
};

type SpiritTeamSparMatchProgress = {
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
};

type SpiritTechniqueLoadoutMove = {
  spiritId: string;
  spiritName: string;
  role: SpiritBattleRole;
  moveId: string;
  moveLabel: string;
  affinity: string;
  focusCost: number;
};

type SpiritTechniqueLoadout = {
  id: string;
  name: string;
  title: string;
  requiredSpiritIds: readonly string[];
  requiredTechniqueXp: number;
  requiredTacticId: string;
  requiredScore: number;
  rewardItemId: string;
  summary: string;
};

type SpiritTechniqueLoadoutProgress = {
  partyIds: readonly string[];
  preferredMoveIdBySpiritId?: Record<string, string>;
  techniqueProof: boolean;
  tacticProof: boolean;
  tacticId?: string;
  techniqueMasteryXp: number;
  routeMasteryProof: boolean;
  journalProof: boolean;
  journalDiscoveredCount: number;
};

type SpiritTraitAttunement = {
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
};

type SpiritTraitAttunementProgress = {
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
};

type SpiritBattleCondition = {
  id: string;
  name: string;
  title: string;
  spiritId: string;
  moveId: string;
  affinity: string;
  role: SpiritBattleRole;
  focusBonus: number;
  effect: string;
};

type SpiritConditionWeave = {
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
};

type SpiritConditionWeaveProgress = {
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
};

type SpiritMentorChallenge = {
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
};

type SpiritMentorChallengeProgress = {
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
};

type MochiSpirit = {
  id: string;
  name: string;
  title: string;
  sprite: string;
  affinity: string;
  habitat: 'Jade Lantern Court';
  temperament: string;
  guildRelation: string;
  certificateEligible: boolean;
  capture: SpiritCaptureProfile;
  journal: SpiritJournalEntry;
  battle: {
    role: SpiritBattleRole;
    baseFocus: number;
    moves: SpiritBattleMove[];
  };
  raisingNeeds: SpiritRaisingNeed[];
};

const alphaItems = {
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
  habitatTassel: {
    id: 'jade-court-habitat-tassel',
    name: 'Jade Court Habitat Tassel',
    description: 'A no-real-value habitat bond proof for closed-alpha Mochirii raising and roleplay.'
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
  commissionKnot: {
    id: 'jade-court-commission-knot',
    name: 'Jade Court Commission Knot',
    description: 'A no-real-value guild commission proof for closed-alpha Mochirii social roleplay progression.'
  },
  certificate: {
    id: 'lirabao-canary-certificate',
    name: 'Lirabao Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
} as const;

const spirits = [
  {
    id: 'lirabao',
    name: 'Lirabao',
    title: 'Blush-Cloud Mochi Spirit',
    sprite: 'spirit-lirabao',
    affinity: 'blossom',
    habitat: 'Jade Lantern Court',
    temperament: 'gentle',
    guildRelation: 'first-bond guide',
    certificateEligible: true,
    capture: {
      encounterId: 'court-habitat-lirabao',
      invitationLabel: 'Lantern Harmony Invitation',
      lureItemId: 'lantern-harmony-tea',
      harmonyRequired: 2,
      rarity: 'common',
      habitatNote: 'Appears where warm lanterns, quiet friends, and soft tea steam overlap.'
    },
    journal: {
      title: 'First Lantern Bond',
      summary: 'Lirabao gathers soft lantern warmth into a calm companion glow for new guild wayfarers.',
      unlockHint: 'Meet Lirabao in the Jade Lantern Court and offer a quiet greeting.'
    },
    battle: {
      role: 'guardian',
      baseFocus: 4,
      moves: [
        { affinity: 'blossom', id: 'lantern-pulse', label: 'Lantern Pulse', power: 5, focusCost: 1 },
        { affinity: 'sky-jade', id: 'skybell-guard', label: 'Skybell Guard', power: 4, focusCost: 1 }
      ]
    },
    raisingNeeds: [
      { id: 'jade-brush-groom', label: 'Jade brush grooming', bondDelta: 1, growthHint: 'Smooths the spirit aura after training.' },
      { id: 'mooncake-share', label: 'Share mooncake', bondDelta: 1, growthHint: 'Restores focus for social play.' }
    ]
  },
  {
    id: 'jintari',
    name: 'Jintari',
    title: 'Goldleaf Mochi Spirit',
    sprite: 'spirit-jintari',
    affinity: 'citrus-gold',
    habitat: 'Jade Lantern Court',
    temperament: 'bright',
    guildRelation: 'market-luck scout',
    certificateEligible: false,
    capture: {
      encounterId: 'court-habitat-jintari',
      invitationLabel: 'Goldleaf Ribbon Invitation',
      lureItemId: 'jade-thread-charm',
      harmonyRequired: 3,
      rarity: 'uncommon',
      habitatNote: 'Appears beside generous trades, guild ribbons, and bright market chatter.'
    },
    journal: {
      title: 'Goldleaf Errand',
      summary: 'Jintari flickers near market ribbons and nudges guildmates toward generous trades.',
      unlockHint: 'Find Jintari beside the guild court path.'
    },
    battle: {
      role: 'trickster',
      baseFocus: 5,
      moves: [
        { affinity: 'citrus-gold', id: 'goldleaf-feint', label: 'Goldleaf Feint', power: 6, focusCost: 2 },
        { affinity: 'blossom', id: 'lantern-pulse', label: 'Lantern Pulse', power: 5, focusCost: 1 }
      ]
    },
    raisingNeeds: [
      { id: 'mooncake-share', label: 'Share mooncake', bondDelta: 1, growthHint: 'Restores focus for social play.' }
    ]
  },
  {
    id: 'aozhen',
    name: 'Aozhen',
    title: 'Sky-Jade Mochi Spirit',
    sprite: 'spirit-aozhen',
    affinity: 'sky-jade',
    habitat: 'Jade Lantern Court',
    temperament: 'curious',
    guildRelation: 'wind-message watcher',
    certificateEligible: false,
    capture: {
      encounterId: 'court-habitat-aozhen',
      invitationLabel: 'Skybell Vow Invitation',
      lureItemId: 'lantern-harmony-tea',
      harmonyRequired: 4,
      rarity: 'rare',
      habitatNote: 'Appears near open air, guild bells, and wayfarers who keep promises.'
    },
    journal: {
      title: 'Sky-Jade Whisper',
      summary: 'Aozhen listens for distant guild bells and carries small hopes between friends.',
      unlockHint: 'Approach Aozhen where the court opens toward the upper path.'
    },
    battle: {
      role: 'scout',
      baseFocus: 6,
      moves: [
        { affinity: 'sky-jade', id: 'skybell-guard', label: 'Skybell Guard', power: 4, focusCost: 1 },
        { affinity: 'citrus-gold', id: 'goldleaf-feint', label: 'Goldleaf Feint', power: 6, focusCost: 2 }
      ]
    },
    raisingNeeds: [
      { id: 'jade-brush-groom', label: 'Jade brush grooming', bondDelta: 1, growthHint: 'Smooths the spirit aura after training.' }
    ]
  }
] as const satisfies readonly MochiSpirit[];

const partyLimit = 3;

const sparLadder = [
  {
    id: 'jade-echo-apprentice',
    name: 'Jade Echo Apprentice',
    affinity: 'jade-echo',
    baseFocus: 17,
    preferredRoles: ['guardian', 'scout'],
    rewardXp: 5,
    bondDelta: 1
  },
  {
    id: 'silk-river-disciple',
    name: 'Silk River Disciple',
    affinity: 'silk-river',
    baseFocus: 21,
    preferredRoles: ['trickster', 'guardian'],
    rewardXp: 7,
    bondDelta: 1
  }
] as const satisfies readonly SpiritSparOpponent[];

const affinityTrials: readonly SpiritAffinityTrial[] = [
  {
    id: 'jade-mirror-trial',
    name: 'Jade Mirror Trial',
    title: 'Court Affinity Reflection',
    affinity: 'jade-mirror',
    baseFocus: 14,
    favoredAffinities: ['blossom', 'sky-jade'],
    rewardXp: 4,
    bondDelta: 1,
    lesson: 'The jade mirror favors calm, sky-born, and blossom-hearted rhythms. Study safely, then return with steadier focus.'
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
    lesson: 'The silk-cinder reflection rewards bright feints and warm resolve without harm, damage, or real-value settlement.'
  }
];

const battleTactics: readonly SpiritBattleTactic[] = [
  {
    id: 'lantern-anchor',
    name: 'Lantern Anchor Form',
    stance: 'anchor',
    preferredRoles: ['guardian'],
    favoredAffinities: ['blossom'],
    recommendedMoveId: 'lantern-pulse',
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
    recommendedMoveId: 'goldleaf-feint',
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
    recommendedMoveId: 'skybell-guard',
    masteryXp: 5,
    bondDelta: 1,
    lesson: 'Listens for the bell before motion, keeping the whole party in a safe scouting rhythm.'
  }
];

const expeditionRoutes: readonly SpiritExpeditionRoute[] = [
  {
    id: 'moonbridge-bamboo-trail',
    name: 'Moonbridge Bamboo Trail',
    title: 'First Field Route',
    habitat: 'Jade Lantern Court',
    requiredHarmony: 2,
    encounterSpiritId: 'jintari',
    recommendedItemId: alphaItems.charm.id,
    rewardItemId: alphaItems.trailRibbon.id,
    routeNote: 'A moonlit bamboo path where market ribbons flutter and Jintari signs appear before the court opens.'
  },
  {
    id: 'cloudbell-reed-bank',
    name: 'Cloudbell Reed Bank',
    title: 'Sky-Jade Scout Route',
    habitat: 'Jade Lantern Court',
    requiredHarmony: 4,
    encounterSpiritId: 'aozhen',
    recommendedItemId: alphaItems.harmonyTea.id,
    rewardItemId: alphaItems.trailRibbon.id,
    routeNote: 'A quiet reed bank under guild bells where Aozhen listens for careful wayfarers.'
  }
];

const quests = [
  {
    id: 'first-lantern-vow',
    title: 'First Lantern Vow',
    summary: 'Attune with a Mochi Spirit, greet Sifu Narao, and record the first guild journal entry.',
    requiredSpiritId: 'lirabao',
    steps: ['attune-spirit', 'greet-sifu-narao', 'open-journal'],
    rewardItemId: alphaItems.guildSeal.id,
    rewardBond: 1
  },
  {
    id: 'silk-market-kindness',
    title: 'Silk Market Kindness',
    summary: 'Use a no-real-value market listing and direct trade proof to practice generous guild exchange.',
    requiredSpiritId: 'jintari',
    steps: ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy'],
    rewardItemId: alphaItems.charm.id,
    rewardBond: 1
  },
  {
    id: 'skybell-spar',
    title: 'Skybell Spar',
    summary: 'Complete one non-lethal training battle and one raising action before returning to the court.',
    requiredSpiritId: 'aozhen',
    steps: ['choose-training-move', 'finish-training-bout', 'complete-raising-care'],
    rewardBond: 2
  }
] as const;

const guildRankTrials: readonly GuildRankTrial[] = [
  {
    id: 'jade-court-initiate',
    title: 'Jade Court Initiate Trial',
    rankTitle: 'Jade Court Initiate',
    requiredSpiritCount: 2,
    requiredQuestStepCount: 1,
    requiredScore: 9,
    rewardItemId: alphaItems.rankSeal.id,
    summary: 'A first guild rank proof for wayfarers who can bond, scout, plan tactics, and practice safely with friends.'
  }
];

const routeMasteries: readonly SpiritRouteMastery[] = [
  {
    id: 'jade-cloudbell-circuit',
    title: 'Jade Cloudbell Circuit',
    requiredRouteIds: expeditionRoutes.map((route) => route.id),
    requiredSpiritCount: spirits.length,
    requiredJournalCount: spirits.length,
    requiredQuestIds: quests.map((quest) => quest.id),
    requiredRankTrialId: guildRankTrials[0].id,
    rewardItemId: alphaItems.routeKnot.id,
    summary: 'A no-real-value field mastery proof for wayfarers who complete the first Mochirii route circuit with a full spirit roster.'
  }
];

const habitatBonds: readonly SpiritHabitatBond[] = [
  {
    id: 'jade-court-habitat-bond',
    name: 'Jade Court Habitat Bond',
    title: 'First Shared Habitat Bond',
    habitat: 'Jade Lantern Court',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredJournalCount: spirits.length,
    requiredScore: 15,
    rewardItemId: alphaItems.habitatTassel.id,
    summary: 'A no-real-value habitat trust proof for testers who invite every first-court Mochi Spirit, record the journal, care for a companion, and show local guild presence.'
  }
];

const researchFolios: readonly SpiritResearchFolio[] = [
  {
    id: 'jade-court-research-folio',
    name: 'Jade Court Research Folio',
    title: 'First Mochirii Field Guide',
    habitat: 'Jade Lantern Court',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredRouteIds: expeditionRoutes.map((route) => route.id),
    requiredJournalCount: spirits.length,
    requiredHabitatBondId: habitatBonds[0].id,
    requiredScore: 18,
    rewardItemId: alphaItems.researchFolio.id,
    summary: 'A no-real-value research folio for testers who connect first-court species, routes, journal notes, habitat trust, and safe battle practice.'
  }
];

const compendiums: readonly SpiritCompendiumCompletion[] = [
  {
    id: 'jade-court-spirit-compendium',
    name: 'Jade Court Spirit Compendium',
    title: 'First-Court Spirit Collection Proof',
    habitat: 'Jade Lantern Court',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredRouteIds: expeditionRoutes.map((route) => route.id),
    requiredJournalCount: spirits.length,
    requiredHabitatBondId: habitatBonds[0].id,
    requiredResearchFolioId: researchFolios[0].id,
    requiredScore: 25,
    rewardItemId: alphaItems.compendiumSeal.id,
    summary: 'A no-real-value first-court species compendium for testers who collect every original Mochi Spirit, scout both field routes, and prove habitat plus research coverage.'
  }
];

const provisionSatchels: readonly SpiritProvisionSatchel[] = [
  {
    id: 'jade-court-provision-satchel',
    name: 'Jade Court Provision Satchel',
    title: 'First-Court Provision Bag',
    habitat: 'Jade Lantern Court',
    stockItemIds: [alphaItems.charm.id, alphaItems.harmonyTea.id, alphaItems.mooncakeBox.id],
    requiredRosterCount: spirits.length,
    requiredJournalCount: spirits.length,
    requiredCareStreak: 1,
    requiredCompletedQuestCount: quests.length,
    requiredScore: 24,
    rewardItemId: alphaItems.provisionSatchel.id,
    summary: 'A no-real-value first-court item bag proof for testers who stock original Mochirii lures, care provisions, market listings, direct trades, and quest supplies.'
  }
];

const guildCommissions: readonly GuildCommission[] = [
  {
    id: 'jade-court-commission-ledger',
    name: 'Jade Court Commission Ledger',
    title: 'First Social Commission Ledger',
    habitat: 'Jade Lantern Court',
    requiredRosterCount: spirits.length,
    requiredJournalCount: spirits.length,
    requiredCompletedQuestCount: quests.length,
    requiredTrainingXp: 1,
    requiredProvisionSatchelId: provisionSatchels[0].id,
    requiredScore: 24,
    rewardItemId: alphaItems.commissionKnot.id,
    summary: 'A no-real-value roleplay commission proof for testers who connect the first quest chain, profile, guild buddy, provisions, training, market, and trade loops.'
  }
];

const spiritGrowthRites: readonly SpiritGrowthRite[] = [
  {
    id: 'moonwell-bloom-rite',
    name: 'Moonwell Bloom Rite',
    formTitle: 'Moonwell Bloom Form',
    requiredGrowth: 'glow',
    requiredBond: 5,
    requiredTrainingXp: 3,
    requiredRankTrialId: guildRankTrials[0].id,
    rewardItemId: alphaItems.growthSigil.id,
    summary: 'A first Mochirii growth rite for bonded spirits that have trained, received care, and earned Jade Court standing.'
  }
];

const harmonyForms: readonly SpiritHarmonyForm[] = [
  {
    id: 'triune-jade-harmony',
    name: 'Triune Jade Harmony',
    title: 'First Three-Spirit Harmony Form',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredPartySize: spirits.length,
    requiredRouteMasteryId: routeMasteries[0].id,
    requiredGrowthRiteId: spiritGrowthRites[0].id,
    requiredTrainingXp: 3,
    requiredSparLadderXp: 5,
    requiredScore: 27,
    rewardItemId: alphaItems.harmonySash.id,
    summary: 'A no-real-value social party form for wayfarers who synchronize all first-court Mochi Spirits after mastery, growth, tactics, and safe sparring.'
  }
];

const harmonyTrials: readonly SpiritHarmonyTrial[] = [
  {
    id: 'jade-echo-concord',
    name: 'Jade Echo Concord Trial',
    title: 'First Social Harmony Battle Trial',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredHarmonyFormId: harmonyForms[0].id,
    requiredSparWins: 1,
    requiredScore: 24,
    rewardItemId: alphaItems.concordTally.id,
    summary: 'A no-injury team battle proof for a full Mochirii party that has formed harmony, practiced safely, and coordinated with local social presence.'
  }
];

const teamSparMatches: readonly SpiritTeamSparMatch[] = [
  {
    id: 'jade-mirror-team-match',
    name: 'Jade Mirror Team Match',
    title: 'First Full-Party Spar Match',
    opponentName: 'Mirror Court Trio',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredHarmonyTrialId: harmonyTrials[0].id,
    requiredTrainingXp: 3,
    requiredSparWins: 1,
    requiredScore: 30,
    rewardItemId: alphaItems.teamMatchRibbon.id,
    summary: 'A no-injury full-party battle match for testers who have proven route mastery, growth, harmony, concord, tactics, quests, and local social coordination.'
  }
];

const techniqueLoadouts: readonly SpiritTechniqueLoadout[] = [
  {
    id: 'jade-step-loadout',
    name: 'Jade Step Loadout',
    title: 'First Three-Spirit Move Loadout',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredTechniqueXp: 7,
    requiredTacticId: battleTactics[1].id,
    requiredScore: 22,
    rewardItemId: alphaItems.loadoutSlip.id,
    summary: 'A no-real-value battle preparation proof that assigns one original Mochirii move to each first-court spirit before team trials.'
  }
];

const mentorChallenges: readonly SpiritMentorChallenge[] = [
  {
    id: 'silk-banner-mentor-drill',
    name: 'Silk Banner Mentor Drill',
    title: 'First Mentor Readiness Challenge',
    mentorName: 'Sifu Narao',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredTeamMatchId: teamSparMatches[0].id,
    requiredTechniqueXp: 7,
    requiredTacticXp: 7,
    requiredCareStreak: 1,
    requiredScore: 28,
    rewardItemId: alphaItems.mentorSeal.id,
    summary: 'A no-injury mentor challenge proving the first Mochirii party can blend care, tactics, technique, team sparring, and local social coordination.'
  }
];

const traitAttunements: readonly SpiritTraitAttunement[] = [
  {
    id: 'jade-heart-trait',
    name: 'Jade Heart Trait Attunement',
    title: 'First Mochirii Party Trait',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredMentorChallengeId: mentorChallenges[0].id,
    requiredLoadoutId: techniqueLoadouts[0].id,
    requiredBond: 3,
    requiredCareStreak: 1,
    requiredScore: 31,
    rewardItemId: alphaItems.traitThread.id,
    traitBySpiritId: {
      lirabao: 'Lanternhearted Guard',
      jintari: 'Goldleaf Quickstep',
      aozhen: 'Skybell Wayfinder'
    },
    summary: 'A no-real-value raising and battle identity proof that gives each first-court Mochi Spirit one original Mochirii trait after care, growth, loadout, mentor, and battle readiness.'
  }
];

const battleConditions: readonly SpiritBattleCondition[] = [
  {
    id: 'lantern-ward',
    name: 'Lantern Ward',
    title: 'Blossom Guard Condition',
    spiritId: 'lirabao',
    moveId: 'lantern-pulse',
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
    moveId: 'goldleaf-feint',
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
    moveId: 'skybell-guard',
    affinity: 'sky-jade',
    role: 'scout',
    focusBonus: 4,
    effect: 'Keeps the formation steady with a soft focus barrier instead of injury.'
  }
];

const conditionWeaves: readonly SpiritConditionWeave[] = [
  {
    id: 'jade-mirror-condition-weave',
    name: 'Jade Mirror Condition Weave',
    title: 'First Non-Injury Condition Weave',
    requiredSpiritIds: spirits.map((spirit) => spirit.id),
    requiredConditionIds: battleConditions.map((condition) => condition.id),
    requiredLoadoutId: techniqueLoadouts[0].id,
    requiredTraitId: traitAttunements[0].id,
    requiredMentorChallengeId: mentorChallenges[0].id,
    requiredSparWins: 1,
    requiredTrainingXp: 3,
    requiredScore: 34,
    rewardItemId: alphaItems.conditionCharm.id,
    summary: 'A no-real-value battle condition proof for testers who can coordinate a full Mochirii party, traits, move loadout, mentor readiness, and local social signals without injury.'
  }
];

function growthStageFromBond(bond: number): SpiritGrowthStage {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
}

function techniqueMasteryLevelFromXp(xp: number): SpiritTechniqueMasteryLevel {
  if (xp >= 18) return 'adept';
  if (xp >= 7) return 'practiced';
  return 'novice';
}

function getSpirit(spiritId: string) {
  return spirits.find((entry) => entry.id === spiritId);
}

function resolveSpiritCapture(spiritId: string, offeredItemId: string, harmonyScore = 1, roster: readonly string[] = []) {
  const spirit = getSpirit(spiritId);
  if (!spirit) {
    return {
      ok: false,
      alreadyRostered: false,
      message: 'No Mochirii spirit profile exists for this invitation encounter.',
      bond: 0,
      growth: 'seed' as SpiritGrowthStage
    };
  }

  if (roster.includes(spirit.id)) {
    return {
      ok: true,
      alreadyRostered: true,
      message: `${spirit.name} already trusts your Mochirii roster and returns to the habitat grove willingly.`,
      bond: 1,
      growth: 'seed' as SpiritGrowthStage
    };
  }

  const lureOk = offeredItemId === spirit.capture.lureItemId;
  const harmonyOk = Math.max(0, Math.floor(harmonyScore)) >= spirit.capture.harmonyRequired;
  const ok = lureOk && harmonyOk;

  return {
    ok,
    alreadyRostered: false,
    message: ok
      ? `${spirit.name} accepts the ${spirit.capture.invitationLabel} and joins your Mochirii roster.`
      : `${spirit.name} notices the grove, but this invitation needs ${spirit.capture.lureItemId} and harmony ${spirit.capture.harmonyRequired}.`,
    bond: ok ? 1 : 0,
    growth: 'seed' as SpiritGrowthStage
  };
}

function resolveSpiritExpedition(
  routeId: string = expeditionRoutes[0].id,
  roster: readonly string[] = [],
  activeSpiritId?: string,
  harmonyScore = 1,
  discoveredRoutes: readonly string[] = []
) {
  const route = expeditionRoutes.find((entry) => entry.id === routeId) || expeditionRoutes[0];
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getSpirit(spiritId)));
  const activeId = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const activeSpirit = activeId ? getSpirit(activeId) : undefined;
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
  const encounterSpirit = getSpirit(route.encounterSpiritId);

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

function resolveSpiritRouteMastery(progress: SpiritRouteMasteryProgress, masteryId: string = routeMasteries[0].id) {
  const mastery = routeMasteries.find((entry) => entry.id === masteryId) || routeMasteries[0];
  const discoveredRoutes = new Set(progress.discoveredRoutes.filter(Boolean));
  const roster = new Set(progress.roster.filter((spiritId) => Boolean(getSpirit(spiritId))));
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

function resolveSpiritHabitatBond(progress: SpiritHabitatBondProgress, bondId: string = habitatBonds[0].id) {
  const bond = habitatBonds.find((entry) => entry.id === bondId) || habitatBonds[0];
  const requiredSpiritIds = new Set(bond.requiredSpiritIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
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
  const activeName = getSpirit(activeSpiritId || '')?.name || 'your Mochi Spirit';

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

function resolveSpiritResearchFolio(progress: SpiritResearchFolioProgress, folioId: string = researchFolios[0].id) {
  const folio = researchFolios.find((entry) => entry.id === folioId) || researchFolios[0];
  const requiredSpiritIds = new Set(folio.requiredSpiritIds);
  const requiredRouteIds = new Set(folio.requiredRouteIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
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
  const activeName = getSpirit(activeSpiritId || '')?.name || 'your Mochi Spirit';

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

function resolveSpiritCompendiumCompletion(progress: SpiritCompendiumProgress, compendiumId: string = compendiums[0].id) {
  const compendium = compendiums.find((entry) => entry.id === compendiumId) || compendiums[0];
  const requiredSpiritIds = new Set(compendium.requiredSpiritIds);
  const requiredRouteIds = new Set(compendium.requiredRouteIds);
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
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
  const activeName = getSpirit(activeSpiritId || '')?.name || 'the first-court roster';

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

function resolveSpiritProvisionSatchel(progress: SpiritProvisionSatchelProgress, satchelId: string = provisionSatchels[0].id) {
  const satchel = provisionSatchels.find((entry) => entry.id === satchelId) || provisionSatchels[0];
  const knownSpiritIds = new Set<string>(spirits.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return quests.some((quest) => quest.id === questId);
  });
  const activeSpiritId = progress.activeSpiritId && roster.includes(progress.activeSpiritId) ? progress.activeSpiritId : roster[0];
  const stockItemIds = satchel.stockItemIds.filter((itemId) => {
    return Object.values(alphaItems).some((item) => item.id === itemId);
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
  const activeName = getSpirit(activeSpiritId || '')?.name || 'the first-court roster';

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

function resolveGuildCommission(progress: GuildCommissionProgress, commissionId: string = guildCommissions[0].id) {
  const commission = guildCommissions.find((entry) => entry.id === commissionId) || guildCommissions[0];
  const knownSpiritIds = new Set<string>(spirits.map((spirit) => spirit.id));
  const roster = Array.from(new Set(progress.roster.filter(Boolean))).filter((spiritId) => knownSpiritIds.has(spiritId));
  const completedQuestIds = Array.from(new Set(progress.completedQuestIds.filter(Boolean))).filter((questId) => {
    return quests.some((quest) => quest.id === questId);
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
  const activeName = getSpirit(activeSpiritId || '')?.name || 'the first-court roster';

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

function resolveSpiritHarmonyForm(progress: SpiritHarmonyFormProgress, formId: string = harmonyForms[0].id) {
  const form = harmonyForms.find((entry) => entry.id === formId) || harmonyForms[0];
  const requiredSpiritIds = new Set(form.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of form.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  if (party.length < form.requiredPartySize) {
    missing.push(`party:${party.length}/${form.requiredPartySize}`);
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
    Math.min(party.length, form.requiredPartySize) * 3 +
    (routeMasteryReady ? 3 : 0) +
    (growthRiteReady ? 3 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.affinityProof ? 2 : 0) +
    Math.min(trainingXp, form.requiredTrainingXp) +
    Math.min(sparLadderXp, form.requiredSparLadderXp);
  const formed = missing.length === 0 && score >= form.requiredScore;
  const partyNames = party.map((spiritId) => getSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    formed,
    formId: form.id,
    name: form.name,
    title: form.title,
    partyIds: party,
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

function resolveSpiritHarmonyTrial(progress: SpiritHarmonyTrialProgress, trialId: string = harmonyTrials[0].id) {
  const trial = harmonyTrials.find((entry) => entry.id === trialId) || harmonyTrials[0];
  const requiredSpiritIds = new Set(trial.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of trial.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
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
    Math.min(party.length, trial.requiredSpiritIds.length) * 3 +
    (harmonyReady ? 4 : 0) +
    (progress.tacticProof ? 2 : 0) +
    (progress.affinityProof ? 2 : 0) +
    Math.min(sparWins, trial.requiredSparWins) * 2 +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 2 : 0) +
    (statusReady ? 1 : 0) +
    (chatLines.length ? 1 : 0);
  const cleared = missing.length === 0 && score >= trial.requiredScore;
  const partyNames = party.map((spiritId) => getSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    trialId: trial.id,
    trialName: trial.name,
    title: trial.title,
    partyIds: party,
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

function resolveSpiritTeamSparMatch(progress: SpiritTeamSparMatchProgress, matchId: string = teamSparMatches[0].id) {
  const match = teamSparMatches.find((entry) => entry.id === matchId) || teamSparMatches[0];
  const requiredSpiritIds = new Set(match.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of match.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
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
    Math.min(party.length, match.requiredSpiritIds.length) * 3 +
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
  const partyNames = party.map((spiritId) => getSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    matchId: match.id,
    matchName: match.name,
    title: match.title,
    opponentName: match.opponentName,
    partyIds: party,
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

function resolveSpiritMentorChallenge(
  progress: SpiritMentorChallengeProgress,
  challengeId: string = mentorChallenges[0].id
) {
  const challenge = mentorChallenges.find((entry) => entry.id === challengeId) || mentorChallenges[0];
  const requiredSpiritIds = new Set(challenge.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of challenge.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
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
    Math.min(party.length, challenge.requiredSpiritIds.length) * 3 +
    (teamMatchReady ? 6 : 0) +
    (battleRoundReady ? 4 : 0) +
    Math.min(4, Math.floor(techniqueXp / 5)) +
    Math.min(4, Math.floor(tacticXp / 5)) +
    Math.min(3, careStreak * 2) +
    (progress.profileViewed ? 1 : 0) +
    (progress.guildBuddyProof ? 1 : 0);
  const cleared = missing.length === 0 && score >= challenge.requiredScore;
  const partyNames = party.map((spiritId) => getSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    cleared,
    challengeId: challenge.id,
    challengeName: challenge.name,
    title: challenge.title,
    mentorName: challenge.mentorName,
    partyIds: party,
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

function resolveSpiritRouteInvitation(
  routeId: string = expeditionRoutes[0].id,
  offeredItemId = '',
  harmonyScore = 1,
  roster: readonly string[] = [],
  discoveredRoutes: readonly string[] = []
) {
  const route = expeditionRoutes.find((entry) => entry.id === routeId) || expeditionRoutes[0];
  const spirit = getSpirit(route.encounterSpiritId);
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getSpirit(spiritId)));
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

function resolveSpiritParty(roster: readonly string[], activeSpiritId?: string) {
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getSpirit(spiritId)));
  if (!knownRoster.length) {
    return {
      ok: false,
      partyIds: [] as string[],
      supportIds: [] as string[],
      message: 'Invite a Mochi Spirit before forming a Mochirii party.'
    };
  }

  const requestedActive = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const partyIds = [requestedActive, ...knownRoster.filter((spiritId) => spiritId !== requestedActive)].slice(0, partyLimit);
  const activeSpirit = getSpirit(requestedActive);
  return {
    ok: true,
    activeSpiritId: requestedActive,
    partyIds,
    supportIds: partyIds.slice(1),
    message: `${activeSpirit?.name || requestedActive} leads a ${partyIds.length}-spirit Mochirii party for no-injury sparring.`
  };
}

function resolveSpiritSparLadder(partyIds: readonly string[], opponentId: string = sparLadder[0].id, bondBySpiritId: Record<string, number> = {}, priorWins = 0) {
  const party = Array.from(new Set(partyIds)).map((spiritId) => getSpirit(spiritId)).filter(Boolean) as MochiSpirit[];
  const opponent: SpiritSparOpponent = sparLadder.find((entry) => entry.id === opponentId) || sparLadder[0];
  if (!party.length) {
    return {
      ok: false,
      opponentId: opponent.id,
      opponentName: opponent.name,
      partyIds: [] as string[],
      victory: false,
      focusScore: 0,
      opponentScore: opponent.baseFocus,
      trainingXp: 0,
      bondDelta: 0,
      message: 'A Mochirii party is required before entering the spar ladder.'
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
      : `${party[0].name}'s party studies the ${opponent.name} spar ladder rhythm and prepares for another no-injury round.`
  };
}

function resolveSpiritBattleRound(progress: {
  partyIds: readonly string[];
  activeSpiritId?: string;
  moveIdBySpiritId?: Record<string, string>;
  bondBySpiritId?: Record<string, number>;
  opponentId?: string;
  tacticProof?: boolean;
  harmonyFormProof?: boolean;
  priorWins?: number;
}, fallbackOpponentId: string = sparLadder[0].id) {
  const opponent: SpiritSparOpponent = sparLadder.find((entry) => entry.id === (progress.opponentId || fallbackOpponentId)) || sparLadder[0];
  const formation = resolveSpiritParty(progress.partyIds || [], progress.activeSpiritId);
  if (!formation.ok) {
    return {
      ok: false,
      roundId: `${opponent.id}-round-0`,
      opponentId: opponent.id,
      opponentName: opponent.name,
      partyIds: [] as string[],
      participants: [] as Array<{ spiritId: string; name: string; moveLabel: string; focusContribution: number }>,
      focusScore: 0,
      opponentScore: opponent.baseFocus,
      victory: false,
      noInjury: true as const,
      trainingXp: 0,
      bondDelta: 0,
      message: 'A Mochirii party is required before a battle round transcript can be recorded.',
      source: 'battle-round-transcript'
    };
  }

  const bondBySpiritId = progress.bondBySpiritId || {};
  const moveIdBySpiritId = progress.moveIdBySpiritId || {};
  const participants = formation.partyIds.map((spiritId, index) => {
    const spirit = getSpirit(spiritId) as MochiSpirit;
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
    noInjury: true as const,
    trainingXp: victory ? opponent.rewardXp + Math.max(0, participants.length - 1) : Math.max(1, Math.floor(opponent.rewardXp / 2)),
    bondDelta: victory ? opponent.bondDelta : 0,
    message: victory
      ? `Battle round transcript: ${lead.name} leads ${moveSummary} against ${opponent.name}, focus ${focusScore}/${opponentScore}. No-injury victory recorded with no real value.`
      : `Battle round transcript: ${lead.name} studies ${opponent.name} with ${moveSummary}, focus ${focusScore}/${opponentScore}. No-injury practice recorded with no real value.`,
    source: 'battle-round-transcript'
  };
}

function resolveSpiritJournal(
  roster: readonly string[],
  activeSpiritId?: string,
  bondBySpiritId: Record<string, number> = {},
  growthBySpiritId: Record<string, string> = {}
) {
  const knownRoster = Array.from(new Set(roster)).filter((spiritId) => Boolean(getSpirit(spiritId)));
  const active = activeSpiritId && knownRoster.includes(activeSpiritId) ? activeSpiritId : knownRoster[0];
  const records = spirits.map((spirit) => {
    const discovered = knownRoster.includes(spirit.id);
    const bond = discovered ? Math.max(1, Math.min(5, Math.floor(bondBySpiritId[spirit.id] || 1))) : 0;
    const growthCandidate = growthBySpiritId[spirit.id];
    const growth = discovered && ['seed', 'sprout', 'glow'].includes(String(growthCandidate))
      ? growthCandidate as SpiritGrowthStage
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
      : 'Invite a Mochi Spirit before the journal can record a discovered companion.'
  };
}

function resolveSpiritTrainingBattle(spiritId: string, moveId: string, bond = 1, round = 1) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  if (!spirit || !move) {
    return {
      ok: false,
      victory: false,
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
    victory,
    bondDelta: victory ? 1 : 0,
    trainingXp: victory ? 3 : 1,
    message: victory
      ? `${spirit.name} completes a no-injury guild spar with ${move.label}.`
      : `${spirit.name} practices ${move.label} and learns the training rhythm.`
  };
}

function resolveSpiritTechniqueMastery(spiritId: string, moveId: string, currentMasteryXp = 0, bond = 1) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  if (!spirit || !move) {
    return {
      ok: false,
      masteryLevel: 'novice' as SpiritTechniqueMasteryLevel,
      masteryXp: Math.max(0, Math.floor(currentMasteryXp)),
      awardedXp: 0,
      focusScore: 0,
      message: 'Technique practice could not start because the spirit or move is not in the Mochirii registry.'
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
    masteryLevel,
    masteryXp,
    awardedXp,
    focusScore,
    message: `${spirit.name} refines ${move.label} at the Mochirii Technique Dojo: ${masteryLevel} mastery, ${masteryXp} XP. No-injury wuxia practice only.`
  };
}

function resolveSpiritBattleTactic(spiritId: string, moveId: string, tacticId = '', currentMasteryXp = 0, bond = 1) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  const fallbackTactic = battleTactics[0];
  const tactic =
    battleTactics.find((entry) => entry.id === tacticId) ||
    battleTactics.find((entry) => entry.recommendedMoveId === move?.id) ||
    battleTactics.find((entry) => move && entry.favoredAffinities.includes(move.affinity)) ||
    battleTactics.find((entry) => spirit && entry.preferredRoles.includes(spirit.battle.role)) ||
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

function resolveSpiritTechniqueLoadout(
  progress: SpiritTechniqueLoadoutProgress,
  loadoutId: string = techniqueLoadouts[0].id
) {
  const loadout = techniqueLoadouts.find((entry) => entry.id === loadoutId) || techniqueLoadouts[0];
  const requiredSpiritIds = new Set(loadout.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const missing: string[] = [];

  for (const spiritId of loadout.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
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
  const moves = party.map((spiritId): SpiritTechniqueLoadoutMove => {
    const spirit = getSpirit(spiritId) as MochiSpirit;
    const selectedMove =
      spirit.battle.moves.find((move) => move.id === preferredMoveIdBySpiritId[spirit.id]) ||
      spirit.battle.moves.find((move) => move.id === battleTactics.find((tactic) => tactic.preferredRoles.includes(spirit.battle.role))?.recommendedMoveId) ||
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
    Math.min(party.length, loadout.requiredSpiritIds.length) * 3 +
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
    partyIds: party,
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

function resolveSpiritTraitAttunement(
  progress: SpiritTraitAttunementProgress,
  traitId: string = traitAttunements[0].id
) {
  const trait = traitAttunements.find((entry) => entry.id === traitId) || traitAttunements[0];
  const requiredSpiritIds = new Set(trait.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && party.includes(progress.activeSpiritId) ? progress.activeSpiritId : party[0] || trait.requiredSpiritIds[0];
  const activeSpirit = getSpirit(activeSpiritId) || spirits[0];
  const missing: string[] = [];

  for (const spiritId of trait.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
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

  const bondScore = Math.min(6, party.reduce((total, spiritId) => total + Math.max(0, Math.floor(bondBySpiritId[spiritId] || 0)), 0));
  const score =
    Math.min(party.length, trait.requiredSpiritIds.length) * 3 +
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
    partyIds: party,
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

function resolveSpiritConditionWeave(
  progress: SpiritConditionWeaveProgress,
  weaveId: string = conditionWeaves[0].id
) {
  const weave = conditionWeaves.find((entry) => entry.id === weaveId) || conditionWeaves[0];
  const requiredSpiritIds = new Set(weave.requiredSpiritIds);
  const party = Array.from(new Set(progress.partyIds.filter(Boolean))).filter((spiritId) => {
    return requiredSpiritIds.has(spiritId) && Boolean(getSpirit(spiritId));
  });
  const activeSpiritId = progress.activeSpiritId && party.includes(progress.activeSpiritId) ? progress.activeSpiritId : party[0] || weave.requiredSpiritIds[0];
  const activeSpirit = getSpirit(activeSpiritId) || spirits[0];
  const missing: string[] = [];

  for (const spiritId of weave.requiredSpiritIds) {
    if (!party.includes(spiritId)) {
      missing.push(`spirit:${spiritId}`);
    }
  }

  const conditionSet = new Set(weave.requiredConditionIds);
  const conditions = battleConditions.filter((condition) => conditionSet.has(condition.id));
  for (const conditionId of weave.requiredConditionIds) {
    const condition = conditions.find((entry) => entry.id === conditionId);
    if (!condition || !party.includes(condition.spiritId)) {
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
    Math.min(party.length, weave.requiredSpiritIds.length) * 3 +
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
  const partyNames = party.map((spiritId) => getSpirit(spiritId)?.name || spiritId).join(', ');

  return {
    ok: true,
    woven,
    weaveId: weave.id,
    weaveName: weave.name,
    title: weave.title,
    activeSpiritId: activeSpirit.id,
    activeSpiritName: activeSpirit.name,
    partyIds: party,
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

function resolveGuildRankTrial(progress: GuildRankTrialProgress, trialId: string = guildRankTrials[0].id) {
  const trial = guildRankTrials.find((entry) => entry.id === trialId) || guildRankTrials[0];
  const roster = Array.from(new Set(progress.roster || [])).filter((spiritId) => Boolean(getSpirit(spiritId)));
  const activeSpirit = getSpirit(progress.activeSpiritId || roster[0] || '');
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

function resolveSpiritGrowthRite(progress: SpiritGrowthRiteProgress, riteId: string = spiritGrowthRites[0].id) {
  const rite = spiritGrowthRites.find((entry) => entry.id === riteId) || spiritGrowthRites[0];
  const spirit = getSpirit(progress.spiritId || '');
  const spiritId = spirit?.id || String(progress.spiritId || '');
  const bond = Math.max(0, Math.min(5, Math.floor(progress.bond || 0)));
  const trainingXp = Math.max(0, Math.floor(progress.trainingXp || 0));
  const growth = ['seed', 'sprout', 'glow'].includes(String(progress.growth))
    ? progress.growth as SpiritGrowthStage
    : growthStageFromBond(bond);
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

function resolveSpiritAffinityTrial(
  spiritId: string,
  moveId: string,
  trialId: string = affinityTrials[0].id,
  bond = 1,
  techniqueMasteryXp = 0
) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const move = spirit?.battle.moves.find((candidate) => candidate.id === moveId);
  const trial: SpiritAffinityTrial = affinityTrials.find((entry) => entry.id === trialId) || affinityTrials[0];
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
      masteryXp: Math.max(0, Math.min(30, Math.floor(techniqueMasteryXp))),
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

function selectSpiritRaisingNeed(spiritId: string, careStreak = 0) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  if (!spirit?.raisingNeeds.length) return undefined;

  const index = Math.max(0, Math.floor(careStreak)) % spirit.raisingNeeds.length;
  return spirit.raisingNeeds[index];
}

function resolveSpiritRaisingAction(spiritId: string, needId: string, currentBond = 1, careStreak = 0) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const need = spirit?.raisingNeeds.find((candidate) => candidate.id === needId);
  const boundedBond = Math.max(0, Math.min(5, Math.floor(currentBond)));
  const boundedCareStreak = Math.max(0, Math.floor(careStreak));
  if (!spirit || !need) {
    return {
      ok: false,
      bond: boundedBond,
      growth: growthStageFromBond(boundedBond),
      careStreak: boundedCareStreak,
      message: 'Raising action is not available for this Mochi Spirit.'
    };
  }

  const bond = Math.max(0, Math.min(5, boundedBond + need.bondDelta));
  const nextCareStreak = boundedCareStreak + 1;
  const nextNeed = selectSpiritRaisingNeed(spiritId, nextCareStreak);
  return {
    ok: true,
    bond,
    growth: growthStageFromBond(bond),
    careStreak: nextCareStreak,
    nextNeedId: nextNeed?.id,
    message: `${need.label} complete for ${spirit.name}. ${need.growthHint} Care streak ${nextCareStreak}.`
  };
}

function showAlphaPrompt(actingPlayer: RpgPlayer, message: string) {
  if (typeof actingPlayer.gui !== 'function' || typeof actingPlayer.removeGui !== 'function') {
    void actingPlayer.showText(message);
    return;
  }

  const gui = actingPlayer.gui(PrebuiltGui.Dialog);
  void gui.open(
    {
      message,
      choices: [],
      autoClose: true,
      fullWidth: false,
      typewriterEffect: false
    },
    {
      waitingAction: false,
      blockPlayerInput: false
    }
  );

  const openId = gui.openId;
  setTimeout(() => {
    actingPlayer.removeGui(PrebuiltGui.Dialog, undefined, openId);
  }, alphaPromptMs);
}

function emitAlphaHudState(actingPlayer: RpgPlayer, patch: AlphaHudStatePatch) {
  if (typeof (actingPlayer as { emit?: unknown }).emit === 'function') {
    (actingPlayer as { emit(type: string, value?: unknown): void }).emit('mochi-social-alpha-state', patch);
  }
}

const player: RpgPlayerHooks = {
  async onConnected(connectedPlayer: RpgPlayer) {
    connectedPlayer.name = getGuestName(connectedPlayer);
    connectedPlayer.setGraphic('wayfarer');
    connectedPlayer.setVariable('mochiSocial.connectedAt', new Date().toISOString());
    await connectedPlayer.changeMap('mochi-town', getSpawn(connectedPlayer));
    await connectedPlayer.load('auto', { reason: 'load', source: 'connect' }, { changeMap: false }).catch(() => null);
  },

  onInput(connectedPlayer: RpgPlayer, { action }) {
    if (action === 'escape') {
      connectedPlayer.callMainMenu();
    }
  }
};

function getGuestName(connectedPlayer: RpgPlayer) {
  const id = String(connectedPlayer.id ?? 'guest').slice(-4).toUpperCase();
  return `Wayfarer ${id}`;
}

function getSpawn(connectedPlayer: RpgPlayer) {
  const id = String(connectedPlayer.id ?? 'guest');
  if (!playerSpawnSlots.has(id)) {
    playerSpawnSlots.set(id, nextSpawnSlot);
    nextSpawnSlot += 1;
  }

  const offset = spawnOffsets[playerSpawnSlots.get(id)! % spawnOffsets.length];
  return {
    x: spawn.x + offset.x,
    y: spawn.y + offset.y
  };
}

function welcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(actingPlayer: RpgPlayer) {
      actingPlayer.showNotification('Guild spark found', { time: 1800, icon: 'sifu-narao' });
      showAlphaPrompt(
        actingPlayer,
        'Welcome to Mochi Social. This closed alpha guild court is no-real-value and Canary-only, but it is ready for Mochirii spirit testing with friends.'
      );
    }
  };
}

function bondedSpirits(actingPlayer: RpgPlayer): string[] {
  const spirits = actingPlayer.getVariable<string[]>('mochiSocial.spirits.bonded');
  return Array.isArray(spirits) ? spirits : [];
}

function activeSpiritId(actingPlayer: RpgPlayer) {
  return actingPlayer.getVariable<string>('mochiSocial.spirits.active') || bondedSpirits(actingPlayer)[0];
}

function partyIds(actingPlayer: RpgPlayer) {
  const party = actingPlayer.getVariable<string[]>('mochiSocial.spirits.party');
  return Array.isArray(party) ? party : [];
}

function bondMap(actingPlayer: RpgPlayer, party: readonly string[]) {
  return Object.fromEntries(
    party.map((spiritId) => [spiritId, Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${spiritId}.bond`) || 1)])
  );
}

function trainingXpTotal(actingPlayer: RpgPlayer, party: readonly string[]) {
  return party.reduce((total, spiritId) => {
    return total + Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${spiritId}.trainingXp`) || 0);
  }, 0);
}

function techniqueMasteryXpTotal(actingPlayer: RpgPlayer, party: readonly string[]) {
  return party.reduce((total, spiritId) => {
    const spirit = getSpirit(spiritId);
    const moveXp = spirit?.battle.moves.reduce((moveTotal, move) => {
      return moveTotal + Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${spiritId}.technique.${move.id}.xp`) || 0);
    }, 0) || 0;
    return total + moveXp;
  }, 0);
}

function careStreakTotal(actingPlayer: RpgPlayer, party: readonly string[]) {
  return party.reduce((total, spiritId) => {
    return Math.max(total, Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${spiritId}.careStreak`) || 0));
  }, 0);
}

function preferredMoveIdBySpiritId() {
  return Object.fromEntries(
    spirits.map((spirit) => {
      const tactic = battleTactics.find((entry) => entry.preferredRoles.includes(spirit.battle.role));
      return [spirit.id, tactic?.recommendedMoveId || spirit.battle.moves[0].id];
    })
  );
}

function growthMap(actingPlayer: RpgPlayer, party: readonly string[]) {
  return Object.fromEntries(
    party.map((spiritId) => [spiritId, actingPlayer.getVariable<string>(`mochiSocial.spirit.${spiritId}.growth`) || 'seed'])
  );
}

function questSteps(actingPlayer: RpgPlayer, questId: string): string[] {
  const completedSteps = actingPlayer.getVariable<string[]>(`mochiSocial.quest.${questId}.steps`);
  return Array.isArray(completedSteps) ? completedSteps : [];
}

function completedQuestIds(actingPlayer: RpgPlayer): string[] {
  return quests.filter((quest) => questSteps(actingPlayer, quest.id).length >= quest.steps.length).map((quest) => quest.id);
}

function selectQuestBoardQuest(actingPlayer: RpgPlayer) {
  const roster = bondedSpirits(actingPlayer);
  const completed = new Set(completedQuestIds(actingPlayer));
  const activeQuestId = actingPlayer.getVariable<string>('mochiSocial.quest.active');
  const activeQuest = quests.find((quest) => quest.id === activeQuestId);
  if (
    activeQuest &&
    !completed.has(activeQuest.id) &&
    (!activeQuest.requiredSpiritId || roster.includes(activeQuest.requiredSpiritId))
  ) {
    return activeQuest;
  }

  return (
    quests.find((quest) => !completed.has(quest.id) && (!quest.requiredSpiritId || roster.includes(quest.requiredSpiritId))) ||
    quests.find((quest) => !completed.has(quest.id)) ||
    quests[0]
  );
}

function spiritEvent(spirit: MochiSpirit): EventDefinition {
  return {
    onInit() {
      this.setGraphic(spirit.sprite);
    },

    async onAction(actingPlayer: RpgPlayer) {
      const spirits = bondedSpirits(actingPlayer);
      if (spirits.includes(spirit.id)) {
        showAlphaPrompt(actingPlayer, `${spirit.name} drifts close by. Your Mochi Spirit bond is already started.`);
        return;
      }

      spirits.push(spirit.id);
      actingPlayer.setVariable('mochiSocial.spirits.bonded', spirits);
      actingPlayer.setVariable('mochiSocial.spirits.active', spirit.id);
      actingPlayer.setVariable(`mochiSocial.spirit.${spirit.id}.bond`, 1);
      actingPlayer.setVariable(`mochiSocial.spirit.${spirit.id}.growth`, 'seed');
      actingPlayer.setVariable(`mochiSocial.spirit.${spirit.id}.journalUnlocked`, true);
      actingPlayer.showNotification(`${spirit.name} bonded`, { time: 1800, icon: spirit.sprite });
      emitAlphaHudState(actingPlayer, { spirit: { id: spirit.id, bond: 1, growth: 'seed' } });
      await actingPlayer.save('auto', { title: 'Mochi Spirit bonded' }, { reason: 'auto', source: 'spirit-bond' });
      showAlphaPrompt(actingPlayer, `${spirit.name} joined your Mochirii spirit journal. Offer care at the court shrine to grow your bond.`);
    }
  };
}

function careShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'The Jade Lantern Court shrine warms gently. Bond with a Mochi Spirit first, then return to care for it.');
        return;
      }

      const careStreakKey = `mochiSocial.spirit.${activeSpirit}.careStreak`;
      const currentCareStreak = Number(actingPlayer.getVariable<number>(careStreakKey) || 0);
      const need = selectSpiritRaisingNeed(activeSpirit, currentCareStreak);
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const raising = need ? resolveSpiritRaisingAction(activeSpirit, need.id, currentBond, currentCareStreak) : null;
      const nextBond = raising?.ok ? raising.bond : Math.min(5, currentBond + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      if (need) {
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.raisingProof`, true);
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.lastCareNeed`, need.id);
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.nextCareNeed`, raising?.nextNeedId || need.id);
        actingPlayer.setVariable(careStreakKey, raising?.careStreak || currentCareStreak);
      }
      actingPlayer.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(actingPlayer, {
        raising: need
          ? {
              careStreak: raising?.careStreak,
              needId: need.id,
              nextNeedId: raising?.nextNeedId,
              proof: true,
              message: raising?.message
            }
          : undefined,
        spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'spirit-care' });
      showAlphaPrompt(actingPlayer, `Care complete. ${raising?.message || 'Your companion feels steady.'} Your companion is now in ${nextGrowth} growth with bond ${nextBond}/5.`);
    }
  };
}

function habitatGrove(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('habitat-grove');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      if (roster.length >= spirits.length) {
        const activeSpirit = activeSpiritId(actingPlayer) || roster[0];
        const bond = resolveSpiritHabitatBond(
          {
            roster,
            activeSpiritId: activeSpirit,
            journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
            careProof: Boolean(actingPlayer.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.raisingProof`)),
            bond: Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1),
            growth: actingPlayer.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.growth`) || 'seed',
            profileViewed: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: actingPlayer.getVariable<string>('mochiSocial.social.statusMood')
          },
          habitatBonds[0].id
        );

        if (!bond.bonded) {
          showAlphaPrompt(actingPlayer, bond.message);
          return;
        }

        actingPlayer.setVariable('mochiSocial.spirits.habitatBondProof', true);
        actingPlayer.setVariable('mochiSocial.spirits.habitatBond', bond.bondId);
        actingPlayer.setVariable('mochiSocial.spirits.habitatBondName', bond.bondName);
        actingPlayer.setVariable('mochiSocial.spirits.habitatBondScore', bond.score);
        if (!actingPlayer.getVariable<boolean>('mochiSocial.spirits.habitatTasselClaimed')) {
          actingPlayer.addItem(alphaItems.habitatTassel, 1);
          actingPlayer.setVariable('mochiSocial.spirits.habitatTasselClaimed', true);
        }

        actingPlayer.showNotification('Habitat bond recorded', { time: 1800, icon: 'habitat-grove' });
        emitAlphaHudState(actingPlayer, {
          habitatBond: {
            bondId: bond.bondId,
            bondName: bond.bondName,
            title: bond.title,
            habitat: bond.habitat,
            activeSpiritId: bond.activeSpiritId,
            roster: bond.roster,
            score: bond.score,
            rewardItemId: bond.rewardItemId,
            proof: true,
            message: bond.message
          }
        });
        await actingPlayer.save('auto', { title: 'Mochi Spirit habitat bond' }, { reason: 'auto', source: 'habitat-grove' });
        showAlphaPrompt(actingPlayer, `${bond.message} The Jade Court Habitat Tassel is no-real-value closed-alpha raising and roleplay proof.`);
        return;
      }

      const targetSpirit = spirits.find((spirit) => !roster.includes(spirit.id)) || spirits[0];
      const result = resolveSpiritCapture(targetSpirit.id, targetSpirit.capture.lureItemId, targetSpirit.capture.harmonyRequired, roster);

      if (!result.ok) {
        showAlphaPrompt(actingPlayer, result.message);
        return;
      }

      const nextRoster = roster.includes(targetSpirit.id) ? roster : [...roster, targetSpirit.id];
      actingPlayer.setVariable('mochiSocial.spirits.bonded', nextRoster);
      actingPlayer.setVariable('mochiSocial.spirits.active', targetSpirit.id);
      actingPlayer.setVariable(`mochiSocial.spirit.${targetSpirit.id}.bond`, Math.max(1, result.bond));
      actingPlayer.setVariable(`mochiSocial.spirit.${targetSpirit.id}.growth`, result.growth);
      actingPlayer.setVariable(`mochiSocial.spirit.${targetSpirit.id}.journalUnlocked`, true);
      actingPlayer.setVariable(`mochiSocial.spirit.${targetSpirit.id}.captureEncounter`, targetSpirit.capture.encounterId);
      actingPlayer.setVariable(`mochiSocial.spirit.${targetSpirit.id}.captureRarity`, targetSpirit.capture.rarity);
      if (!actingPlayer.getVariable<boolean>('mochiSocial.alpha.harmonyTeaReceived')) {
        actingPlayer.addItem(alphaItems.harmonyTea, 1);
        actingPlayer.setVariable('mochiSocial.alpha.harmonyTeaReceived', true);
      }

      actingPlayer.showNotification(`${targetSpirit.name} invited`, { time: 1800, icon: 'habitat-grove' });
      emitAlphaHudState(actingPlayer, {
        capture: {
          spiritId: targetSpirit.id,
          roster: nextRoster,
          message: result.message
        },
        spirit: { id: targetSpirit.id, bond: Math.max(1, result.bond), growth: result.growth }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit invited from habitat grove' }, { reason: 'auto', source: 'habitat-grove' });
      showAlphaPrompt(
        actingPlayer,
        `${result.message} This spirit invitation is a Mochirii-original, no-real-value alpha capture loop based on harmony, care, and consent.`
      );
    }
  };
}

function partyBanner(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('party-banner');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const formation = resolveSpiritParty(bondedSpirits(actingPlayer), activeSpiritId(actingPlayer));
      if (!formation.ok) {
        showAlphaPrompt(actingPlayer, formation.message);
        return;
      }

      actingPlayer.setVariable('mochiSocial.spirits.party', formation.partyIds);
      actingPlayer.setVariable('mochiSocial.spirits.active', formation.activeSpiritId);
      actingPlayer.setVariable('mochiSocial.spirits.support', formation.supportIds);
      const growthRiteId = formation.partyIds
        .map((spiritId) => actingPlayer.getVariable<string>(`mochiSocial.spirit.${spiritId}.growthRite`))
        .find(Boolean);
      const harmony = resolveSpiritHarmonyForm(
        {
          partyIds: formation.partyIds,
          routeMasteryProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
          routeMasteryId: actingPlayer.getVariable<string>('mochiSocial.world.routeMastery'),
          growthRiteProof: formation.partyIds.some((spiritId) => Boolean(actingPlayer.getVariable<boolean>(`mochiSocial.spirit.${spiritId}.growthRiteProof`))),
          growthRiteId,
          tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityProof: Number(actingPlayer.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0) > 0,
          trainingXp: trainingXpTotal(actingPlayer, formation.partyIds),
          sparLadderXp: Number(actingPlayer.getVariable<number>('mochiSocial.battle.sparLadderXp') || 0)
        },
        harmonyForms[0].id
      );
      const patch: AlphaHudStatePatch = {
        party: {
          activeSpiritId: formation.activeSpiritId,
          partyIds: formation.partyIds,
          supportIds: formation.supportIds,
          message: formation.message
        }
      };
      let prompt = `${formation.message} Party formation stays no-injury, social-first, and no-real-value.`;
      let saveTitle = 'Mochi Spirit party formed';

      if (harmony.formed) {
        actingPlayer.setVariable('mochiSocial.spirits.harmonyFormProof', true);
        actingPlayer.setVariable('mochiSocial.spirits.harmonyForm', harmony.formId);
        actingPlayer.setVariable('mochiSocial.spirits.harmonyName', harmony.name);
        actingPlayer.setVariable('mochiSocial.spirits.harmonyScore', harmony.score);
        if (!actingPlayer.getVariable<boolean>('mochiSocial.spirits.harmonySashClaimed')) {
          actingPlayer.addItem(alphaItems.harmonySash, 1);
          actingPlayer.setVariable('mochiSocial.spirits.harmonySashClaimed', true);
        }
        patch.harmonyForm = {
          formId: harmony.formId,
          name: harmony.name,
          title: harmony.title,
          partyIds: harmony.partyIds,
          score: harmony.score,
          rewardItemId: harmony.rewardItemId,
          proof: true,
          message: harmony.message
        };
        prompt = `${formation.message} ${harmony.message} The Triune Jade Sash is no-real-value closed-alpha proof.`;
        saveTitle = 'Mochi Spirit party harmony formed';
      }

      actingPlayer.showNotification(harmony.formed ? 'Harmony formed' : 'Party formed', { time: 1800, icon: 'party-banner' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: saveTitle }, { reason: 'auto', source: 'party-banner' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function journalPavilion(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('journal-pavilion');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      const journal = resolveSpiritJournal(roster, activeSpiritId(actingPlayer), bondMap(actingPlayer, roster), growthMap(actingPlayer, roster));
      if (!journal.ok) {
        showAlphaPrompt(actingPlayer, journal.message);
        return;
      }

      actingPlayer.setVariable('mochiSocial.spirits.journalViewed', true);
      actingPlayer.setVariable('mochiSocial.spirits.journalDiscovered', journal.records.filter((record) => record.discovered).map((record) => record.spiritId));
      actingPlayer.setVariable('mochiSocial.spirits.journalCount', journal.discoveredCount);
      const discoveredRoutesRaw = actingPlayer.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const activeSpirit = journal.activeSpiritId || activeSpiritId(actingPlayer) || roster[0];
      const research = resolveSpiritResearchFolio(
        {
          roster,
          activeSpiritId: activeSpirit,
          discoveredRoutes,
          journalDiscoveredCount: journal.discoveredCount,
          habitatBondProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.habitatBondProof')),
          habitatBondId: actingPlayer.getVariable<string>('mochiSocial.spirits.habitatBond'),
          techniqueProof: roster.some((spiritId) => Boolean(actingPlayer.getVariable<string>(`mochiSocial.spirit.${spiritId}.technique.lastMove`))),
          tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityProof: Number(actingPlayer.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0) > 0,
          trainingXp: trainingXpTotal(actingPlayer, roster)
        },
        researchFolios[0].id
      );
      const patch: AlphaHudStatePatch = {
        journal: {
          activeSpiritId: journal.activeSpiritId,
          discoveredCount: journal.discoveredCount,
          totalCount: journal.totalCount,
          proof: true,
          message: journal.message
        }
      };
      let prompt = `${journal.message} The journal records habitat, rarity, temperament, role, and care notes as no-real-value alpha lore.`;
      let saveTitle = 'Mochi Spirit journal reviewed';

      if (research.recorded) {
        actingPlayer.setVariable('mochiSocial.spirits.researchProof', true);
        actingPlayer.setVariable('mochiSocial.spirits.researchFolio', research.folioId);
        actingPlayer.setVariable('mochiSocial.spirits.researchFolioName', research.folioName);
        actingPlayer.setVariable('mochiSocial.spirits.researchScore', research.score);
        if (!actingPlayer.getVariable<boolean>('mochiSocial.spirits.researchFolioClaimed')) {
          actingPlayer.addItem(alphaItems.researchFolio, 1);
          actingPlayer.setVariable('mochiSocial.spirits.researchFolioClaimed', true);
        }
        patch.research = {
          folioId: research.folioId,
          folioName: research.folioName,
          title: research.title,
          habitat: research.habitat,
          activeSpiritId: research.activeSpiritId,
          roster: research.roster,
          discoveredRoutes: research.discoveredRoutes,
          score: research.score,
          rewardItemId: research.rewardItemId,
          proof: true,
          message: research.message
        };
        prompt = `${journal.message} ${research.message} The Jade Court Research Folio is no-real-value closed-alpha field-guide proof.`;
        saveTitle = 'Mochi Spirit research folio recorded';

        const compendium = resolveSpiritCompendiumCompletion(
          {
            roster,
            activeSpiritId: research.activeSpiritId,
            discoveredRoutes,
            journalDiscoveredCount: journal.discoveredCount,
            habitatBondProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.habitatBondProof')),
            habitatBondId: actingPlayer.getVariable<string>('mochiSocial.spirits.habitatBond'),
            researchProof: true,
            researchFolioId: research.folioId,
            routeMasteryProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.world.routeMasteryProof'))
          },
          compendiums[0].id
        );

        if (compendium.completed) {
          actingPlayer.setVariable('mochiSocial.spirits.compendiumProof', true);
          actingPlayer.setVariable('mochiSocial.spirits.compendium', compendium.compendiumId);
          actingPlayer.setVariable('mochiSocial.spirits.compendiumName', compendium.compendiumName);
          actingPlayer.setVariable('mochiSocial.spirits.compendiumScore', compendium.score);
          if (!actingPlayer.getVariable<boolean>('mochiSocial.spirits.compendiumSealClaimed')) {
            actingPlayer.addItem(alphaItems.compendiumSeal, 1);
            actingPlayer.setVariable('mochiSocial.spirits.compendiumSealClaimed', true);
          }
          patch.compendium = {
            compendiumId: compendium.compendiumId,
            compendiumName: compendium.compendiumName,
            title: compendium.title,
            habitat: compendium.habitat,
            activeSpiritId: compendium.activeSpiritId,
            roster: compendium.roster,
            discoveredRoutes: compendium.discoveredRoutes,
            score: compendium.score,
            rewardItemId: compendium.rewardItemId,
            proof: true,
            message: compendium.message
          };
          prompt = `${journal.message} ${research.message} ${compendium.message} The Jade Court Compendium Seal is no-real-value closed-alpha collection proof.`;
          saveTitle = 'Mochi Spirit compendium sealed';
        }
      }

      actingPlayer.showNotification('Journal updated', { time: 1800, icon: 'journal-pavilion' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: saveTitle }, { reason: 'auto', source: 'journal-pavilion' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function expeditionGate(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('expedition-gate');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit || !roster.length) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before scouting the Moonbridge field route.');
        return;
      }

      const discoveredRoutesRaw = actingPlayer.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const allRoutesDiscovered = expeditionRoutes.every((route) => discoveredRoutes.includes(route.id));

      if (allRoutesDiscovered) {
        const mastery = resolveSpiritRouteMastery({
          discoveredRoutes,
          roster,
          journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
          completedQuestIds: completedQuestIds(actingPlayer),
          guildRankProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.guild.rankTrialProof')),
          rankTrialId: actingPlayer.getVariable<string>('mochiSocial.guild.rankTrial')
        });

        if (!mastery.mastered) {
          showAlphaPrompt(actingPlayer, mastery.message);
          return;
        }

        actingPlayer.setVariable('mochiSocial.world.routeMasteryProof', true);
        actingPlayer.setVariable('mochiSocial.world.routeMastery', mastery.masteryId);
        actingPlayer.setVariable('mochiSocial.world.routeMasteryTitle', mastery.title);
        actingPlayer.setVariable('mochiSocial.world.routeMasteryScore', mastery.score);
        if (!actingPlayer.getVariable<boolean>('mochiSocial.world.routeMasteryKnotClaimed')) {
          actingPlayer.addItem(alphaItems.routeKnot, 1);
          actingPlayer.setVariable('mochiSocial.world.routeMasteryKnotClaimed', true);
        }
        actingPlayer.showNotification('Route circuit mastered', { time: 1800, icon: 'expedition-gate' });
        emitAlphaHudState(actingPlayer, {
          routeMastery: {
            masteryId: mastery.masteryId,
            title: mastery.title,
            score: mastery.score,
            rewardItemId: mastery.rewardItemId,
            proof: true,
            message: mastery.message
          }
        });
        await actingPlayer.save('auto', { title: 'Mochirii route circuit mastered' }, { reason: 'auto', source: 'expedition-gate' });
        showAlphaPrompt(actingPlayer, `${mastery.message} This is no-real-value field progression for Alpha Preview testing.`);
        return;
      }

      const routeCount = Number(actingPlayer.getVariable<number>('mochiSocial.world.expeditionCount') || 0);
      const route = expeditionRoutes[routeCount % expeditionRoutes.length] || expeditionRoutes[0];
      const bond = Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const harmonyScore = bond + Math.max(1, roster.length) + partyIds(actingPlayer).length;
      const expedition = resolveSpiritExpedition(route.id, roster, activeSpirit, harmonyScore, discoveredRoutes);
      if (!expedition.ok) {
        showAlphaPrompt(actingPlayer, expedition.message);
        return;
      }

      const nextCount = routeCount + 1;
      actingPlayer.setVariable('mochiSocial.world.lastExpeditionRoute', expedition.routeId);
      actingPlayer.setVariable('mochiSocial.world.lastExpeditionEncounter', expedition.encounterSpiritId);
      actingPlayer.setVariable('mochiSocial.world.discoveredRoutes', expedition.discoveredRoutes);
      actingPlayer.setVariable('mochiSocial.world.expeditionCount', nextCount);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.lastExpeditionRoute`, expedition.routeId);

      if (!actingPlayer.getVariable<boolean>('mochiSocial.world.trailRibbonClaimed')) {
        actingPlayer.addItem(alphaItems.trailRibbon, 1);
        actingPlayer.setVariable('mochiSocial.world.trailRibbonClaimed', true);
      }

      actingPlayer.showNotification('Route scouted', { time: 1800, icon: 'expedition-gate' });
      emitAlphaHudState(actingPlayer, {
        expedition: {
          routeId: expedition.routeId,
          routeName: expedition.routeName,
          encounterSpiritId: expedition.encounterSpiritId,
          recommendedItemId: expedition.recommendedItemId,
          rewardItemId: expedition.rewardItemId,
          discoveredRoutes: expedition.discoveredRoutes,
          count: nextCount,
          proof: true,
          message: expedition.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochirii field route scouted' }, { reason: 'auto', source: 'expedition-gate' });
      showAlphaPrompt(
        actingPlayer,
        `${expedition.message} Route scouting is a no-real-value alpha field encounter proof; invitations still happen through habitat and consent.`
      );
    }
  };
}

function routeInvitationAltar(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('route-invitation-altar');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      const discoveredRoutesRaw = actingPlayer.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const routeId = actingPlayer.getVariable<string>('mochiSocial.world.lastExpeditionRoute') || discoveredRoutes[0] || expeditionRoutes[0].id;
      const route = expeditionRoutes.find((entry) => entry.id === routeId) || expeditionRoutes[0];
      const activeSpirit = activeSpiritId(actingPlayer);
      const bond = activeSpirit ? Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1) : 1;
      const expeditionCount = Number(actingPlayer.getVariable<number>('mochiSocial.world.expeditionCount') || 0);
      const harmonyScore = bond + Math.max(1, roster.length) + partyIds(actingPlayer).length + expeditionCount;
      const invitation = resolveSpiritRouteInvitation(route.id, route.recommendedItemId, harmonyScore, roster, discoveredRoutes);

      if (!invitation.ok) {
        showAlphaPrompt(actingPlayer, invitation.message);
        return;
      }

      actingPlayer.setVariable('mochiSocial.spirits.bonded', invitation.roster);
      actingPlayer.setVariable('mochiSocial.spirits.active', invitation.spiritId);
      actingPlayer.setVariable(`mochiSocial.spirit.${invitation.spiritId}.bond`, Math.max(1, invitation.bond));
      actingPlayer.setVariable(`mochiSocial.spirit.${invitation.spiritId}.growth`, invitation.growth);
      actingPlayer.setVariable(`mochiSocial.spirit.${invitation.spiritId}.journalUnlocked`, true);
      actingPlayer.setVariable(`mochiSocial.spirit.${invitation.spiritId}.captureEncounter`, `${invitation.routeId}-route-invitation`);
      actingPlayer.setVariable(`mochiSocial.spirit.${invitation.spiritId}.lastRouteInvitation`, invitation.routeId);
      actingPlayer.setVariable('mochiSocial.world.lastRouteInvitation', invitation.routeId);
      actingPlayer.setVariable('mochiSocial.world.lastRouteInvitationSpirit', invitation.spiritId);
      actingPlayer.setVariable('mochiSocial.world.routeInvitationProof', true);

      actingPlayer.showNotification('Route spirit invited', { time: 1800, icon: 'route-invitation-altar' });
      emitAlphaHudState(actingPlayer, {
        routeInvite: {
          routeId: invitation.routeId,
          routeName: invitation.routeName,
          spiritId: invitation.spiritId,
          roster: invitation.roster,
          alreadyRostered: invitation.alreadyRostered,
          proof: true,
          message: invitation.message
        },
        capture: {
          spiritId: invitation.spiritId,
          roster: invitation.roster,
          message: invitation.message
        },
        spirit: { id: invitation.spiritId, bond: Math.max(1, invitation.bond), growth: invitation.growth }
      });
      await actingPlayer.save('auto', { title: 'Mochirii route spirit invited' }, { reason: 'auto', source: 'route-invitation-altar' });
      showAlphaPrompt(
        actingPlayer,
        `${invitation.message} Route invitations are Mochirii-original, consent-based, no-real-value alpha capture progress.`
      );
    }
  };
}

function techniqueDojo(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('technique-dojo');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before practicing at the Mochirii Technique Dojo.');
        return;
      }

      const spirit = spirits.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(actingPlayer, 'The Technique Dojo cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const bond = Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const currentXp = Number(actingPlayer.getVariable<number>(xpKey) || 0);
      const technique = resolveSpiritTechniqueMastery(activeSpirit, move.id, currentXp, bond);
      if (!technique.ok) {
        showAlphaPrompt(actingPlayer, technique.message);
        return;
      }

      actingPlayer.setVariable(xpKey, technique.masteryXp);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.${move.id}.level`, technique.masteryLevel);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`, move.id);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.focusScore`, technique.focusScore);
      const patch: AlphaHudStatePatch = {
        technique: {
          spiritId: activeSpirit,
          moveId: move.id,
          masteryXp: technique.masteryXp,
          masteryLevel: technique.masteryLevel,
          focusScore: technique.focusScore,
          proof: true,
          message: technique.message
        }
      };
      let notification = 'Technique refined';
      let saveTitle = 'Mochi Spirit technique practice';
      let prompt = `${technique.message} Technique mastery is no-injury alpha progression with no real value.`;
      const loadoutParty = partyIds(actingPlayer);

      if (loadoutParty.length >= spirits.length) {
        const loadout = resolveSpiritTechniqueLoadout(
          {
            partyIds: loadoutParty,
            preferredMoveIdBySpiritId: preferredMoveIdBySpiritId(),
            techniqueProof: true,
            tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            tacticId: actingPlayer.getVariable<string>('mochiSocial.battle.lastTacticScroll'),
            techniqueMasteryXp: Math.max(technique.masteryXp, techniqueMasteryXpTotal(actingPlayer, loadoutParty)),
            routeMasteryProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
            journalProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.journalProof')),
            journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || 0)
          },
          techniqueLoadouts[0].id
        );

        if (loadout.prepared) {
          actingPlayer.setVariable('mochiSocial.battle.techniqueLoadoutProof', true);
          actingPlayer.setVariable('mochiSocial.battle.techniqueLoadout', loadout.loadoutId);
          actingPlayer.setVariable('mochiSocial.battle.techniqueLoadoutName', loadout.loadoutName);
          actingPlayer.setVariable('mochiSocial.battle.techniqueLoadoutScore', loadout.score);
          actingPlayer.setVariable('mochiSocial.battle.techniqueLoadoutMoves', loadout.moves.map((entry) => `${entry.spiritId}:${entry.moveId}`));
          if (!actingPlayer.getVariable<boolean>('mochiSocial.battle.loadoutSlipClaimed')) {
            actingPlayer.addItem(alphaItems.loadoutSlip, 1);
            actingPlayer.setVariable('mochiSocial.battle.loadoutSlipClaimed', true);
          }
          patch.techniqueLoadout = {
            loadoutId: loadout.loadoutId,
            loadoutName: loadout.loadoutName,
            title: loadout.title,
            partyIds: loadout.partyIds,
            moves: loadout.moves.map((entry) => `${entry.spiritId}:${entry.moveId}`),
            score: loadout.score,
            requiredScore: loadout.requiredScore,
            rewardItemId: loadout.rewardItemId,
            proof: true,
            message: loadout.message
          };
          notification = 'Loadout prepared';
          saveTitle = 'Mochi Spirit technique loadout';
          prompt = `${technique.message} ${loadout.message} The Jade Step Loadout Slip is no-real-value closed-alpha move preparation proof.`;
        }
      }

      actingPlayer.showNotification(notification, { time: 1800, icon: 'technique-dojo' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: saveTitle }, { reason: 'auto', source: 'technique-dojo' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function tacticScrollStand(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('tactic-scroll-stand');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before studying a Mochirii tactic scroll.');
        return;
      }

      const spirit = spirits.find((entry) => entry.id === activeSpirit);
      const lastMove = actingPlayer.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`);
      const move = spirit?.battle.moves.find((entry) => entry.id === lastMove) || spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(actingPlayer, 'The tactic scroll stand cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentXp = Number(actingPlayer.getVariable<number>(xpKey) || 0);
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const tactic = resolveSpiritBattleTactic(activeSpirit, move.id, '', currentXp, currentBond);
      if (!tactic.ok) {
        showAlphaPrompt(actingPlayer, tactic.message);
        return;
      }

      const nextBond = Math.min(5, currentBond + tactic.bondDelta);
      const nextGrowth = growthStageFromBond(nextBond);
      const nextLevel = techniqueMasteryLevelFromXp(tactic.masteryXp);
      actingPlayer.setVariable(xpKey, tactic.masteryXp);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.${move.id}.level`, nextLevel);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`, move.id);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.last`, tactic.tacticId);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.lastMove`, tactic.moveId);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.stance`, tactic.stance);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.focusScore`, tactic.focusScore);
      actingPlayer.setVariable('mochiSocial.battle.lastTacticScroll', tactic.tacticId);
      actingPlayer.setVariable('mochiSocial.battle.tacticScrollProof', true);
      actingPlayer.setVariable('mochiSocial.battle.tacticMasteryXp', tactic.masteryXp);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      actingPlayer.showNotification('Tactic scroll studied', { time: 1800, icon: 'tactic-scroll-stand' });
      emitAlphaHudState(actingPlayer, {
        tactic: {
          spiritId: activeSpirit,
          moveId: move.id,
          tacticId: tactic.tacticId,
          tacticName: tactic.tacticName,
          stance: tactic.stance,
          masteryXp: tactic.masteryXp,
          focusScore: tactic.focusScore,
          proof: true,
          message: tactic.message
        },
        spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit tactic scroll practice' }, { reason: 'auto', source: 'tactic-scroll-stand' });
      showAlphaPrompt(actingPlayer, `${tactic.message} Tactic scroll practice is no-injury alpha battle planning with no real value.`);
    }
  };
}

function affinityDais(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('affinity-dais');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before entering the Jade Mirror affinity trial.');
        return;
      }

      const spirit = spirits.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(actingPlayer, 'The affinity dais cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const trial = affinityTrials[0];
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const winsKey = 'mochiSocial.battle.affinityTrialWins';
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const currentTechniqueXp = Number(actingPlayer.getVariable<number>(xpKey) || 0);
      const currentWins = Number(actingPlayer.getVariable<number>(winsKey) || 0);
      const affinity = resolveSpiritAffinityTrial(activeSpirit, move.id, trial.id, currentBond, currentTechniqueXp);
      const nextWins = currentWins + (affinity.victory ? 1 : 0);
      const nextBond = affinity.victory ? Math.min(5, currentBond + affinity.bondDelta) : currentBond;
      const nextGrowth = growthStageFromBond(nextBond);

      actingPlayer.setVariable('mochiSocial.battle.lastAffinityTrial', affinity.trialId);
      actingPlayer.setVariable('mochiSocial.battle.affinityTrialWins', nextWins);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.lastAffinityTrialMove`, move.id);
      actingPlayer.setVariable(xpKey, affinity.masteryXp);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      const patch: AlphaHudStatePatch = {
        affinity: {
          spiritId: activeSpirit,
          moveId: move.id,
          trialId: affinity.trialId,
          trialName: affinity.trialName,
          affinityAdvantage: affinity.affinityAdvantage,
          focusScore: affinity.focusScore,
          trialScore: affinity.trialScore,
          victory: affinity.victory,
          wins: nextWins,
          masteryXp: affinity.masteryXp,
          proof: true,
          message: affinity.message
        },
        spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth }
      };
      let notification = affinity.victory ? 'Affinity trial cleared' : 'Affinity trial studied';
      let saveTitle = 'Mochi Spirit affinity trial';
      let prompt = `${affinity.message} Affinity trials are no-injury alpha battle practice with no real value.`;

      if (actingPlayer.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')) {
        const concord = resolveSpiritHarmonyTrial(
          {
            partyIds: partyIds(actingPlayer),
            harmonyFormProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')),
            harmonyFormId: actingPlayer.getVariable<string>('mochiSocial.spirits.harmonyForm'),
            tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            affinityProof: nextWins > 0,
            sparLadderWins: Number(actingPlayer.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0),
            profileViewed: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: actingPlayer.getVariable<string>('mochiSocial.social.statusMood'),
            chatLines: actingPlayer.getVariable<string[]>('mochiSocial.social.chatLines') || []
          },
          harmonyTrials[0].id
        );

        if (concord.cleared) {
          actingPlayer.setVariable('mochiSocial.battle.harmonyTrialProof', true);
          actingPlayer.setVariable('mochiSocial.battle.harmonyTrial', concord.trialId);
          actingPlayer.setVariable('mochiSocial.battle.harmonyTrialName', concord.trialName);
          actingPlayer.setVariable('mochiSocial.battle.harmonyTrialScore', concord.score);
          if (!actingPlayer.getVariable<boolean>('mochiSocial.battle.concordTallyClaimed')) {
            actingPlayer.addItem(alphaItems.concordTally, 1);
            actingPlayer.setVariable('mochiSocial.battle.concordTallyClaimed', true);
          }
          patch.harmonyTrial = {
            trialId: concord.trialId,
            trialName: concord.trialName,
            title: concord.title,
            partyIds: concord.partyIds,
            score: concord.score,
            rewardItemId: concord.rewardItemId,
            proof: true,
            message: concord.message
          };
          notification = 'Concord trial cleared';
          saveTitle = 'Mochi Spirit harmony trial';
          prompt = `${affinity.message} ${concord.message} The Jade Echo Concord Tally is no-real-value closed-alpha battle proof.`;
        }
      }

      actingPlayer.showNotification(notification, { time: 1800, icon: 'affinity-dais' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: saveTitle }, { reason: 'auto', source: 'affinity-dais' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function trainingRing(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('training-ring');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before entering the Jade Lantern Court training ring.');
        return;
      }

      const spirit = spirits.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(actingPlayer, 'The training ring cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const xpKey = `mochiSocial.spirit.${activeSpirit}.trainingXp`;
      const victoryKey = `mochiSocial.spirit.${activeSpirit}.trainingVictories`;
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const currentXp = Number(actingPlayer.getVariable<number>(xpKey) || 0);
      const currentVictories = Number(actingPlayer.getVariable<number>(victoryKey) || 0);
      const result = resolveSpiritTrainingBattle(activeSpirit, move.id, currentBond, currentVictories + 1);
      const sparParty = partyIds(actingPlayer).length ? partyIds(actingPlayer) : [activeSpirit];
      const priorSparWins = Number(actingPlayer.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0);
      const spar = resolveSpiritSparLadder(sparParty, 'jade-echo-apprentice', bondMap(actingPlayer, sparParty), priorSparWins);
      const battleRound = resolveSpiritBattleRound({
        partyIds: sparParty,
        activeSpiritId: activeSpirit,
        moveIdBySpiritId: { [activeSpirit]: move.id },
        bondBySpiritId: bondMap(actingPlayer, sparParty),
        opponentId: spar.opponentId,
        tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
        harmonyFormProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')),
        priorWins: priorSparWins
      });
      const nextXp = currentXp + result.trainingXp;
      const nextVictories = currentVictories + (result.victory ? 1 : 0);
      const nextSparXp = Number(actingPlayer.getVariable<number>('mochiSocial.battle.sparLadderXp') || 0) + spar.trainingXp;
      const nextSparWins = priorSparWins + (spar.victory ? 1 : 0);
      const nextBond = result.victory ? Math.min(5, currentBond + result.bondDelta) : currentBond;
      const nextGrowth = growthStageFromBond(nextBond);

      actingPlayer.setVariable(xpKey, nextXp);
      actingPlayer.setVariable(victoryKey, nextVictories);
      actingPlayer.setVariable('mochiSocial.battle.sparLadderXp', nextSparXp);
      actingPlayer.setVariable('mochiSocial.battle.sparLadderWins', nextSparWins);
      actingPlayer.setVariable('mochiSocial.battle.lastSparOpponent', spar.opponentId);
      actingPlayer.setVariable('mochiSocial.battle.lastRound', battleRound.roundId);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundOpponent', battleRound.opponentId);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundFocusScore', battleRound.focusScore);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundOpponentScore', battleRound.opponentScore);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundVictory', battleRound.victory);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundNoInjury', battleRound.noInjury);
      actingPlayer.setVariable('mochiSocial.battle.lastRoundParty', battleRound.partyIds);
      actingPlayer.setVariable(
        'mochiSocial.battle.lastRoundTranscript',
        battleRound.participants.map((participant) => `${participant.name}:${participant.moveLabel}:${participant.focusContribution}`)
      );
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      const patch: AlphaHudStatePatch = {
        spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth },
        training: {
          xp: nextXp,
          victories: nextVictories,
          message: result.message
        },
        spar: {
          opponentId: spar.opponentId,
          victory: spar.victory,
          xp: nextSparXp,
          wins: nextSparWins,
          message: spar.message
        },
        battleRound: {
          roundId: battleRound.roundId,
          opponentName: battleRound.opponentName,
          focusScore: battleRound.focusScore,
          opponentScore: battleRound.opponentScore,
          victory: battleRound.victory,
          noInjury: battleRound.noInjury,
          participants: battleRound.participants.map((participant) => participant.spiritId),
          message: battleRound.message
        }
      };
      let notification = 'Training spar complete';
      let saveTitle = 'Mochi Spirit training spar';
      let prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} Training is no-injury guild practice with no real value.`;

      if (actingPlayer.getVariable<boolean>('mochiSocial.battle.harmonyTrialProof')) {
        const matchParty = partyIds(actingPlayer).length ? partyIds(actingPlayer) : sparParty;
        const match = resolveSpiritTeamSparMatch(
          {
            partyIds: matchParty,
            harmonyTrialProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.harmonyTrialProof')),
            harmonyTrialId: actingPlayer.getVariable<string>('mochiSocial.battle.harmonyTrial'),
            harmonyTrialScore: Number(actingPlayer.getVariable<number>('mochiSocial.battle.harmonyTrialScore') || 0),
            routeMasteryProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
            tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            growthRiteProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.growthRiteProof')),
            questChainProof: completedQuestIds(actingPlayer).length >= quests.length,
            trainingXp: Math.max(trainingXpTotal(actingPlayer, matchParty), nextXp),
            sparLadderWins: nextSparWins,
            chatLines: actingPlayer.getVariable<string[]>('mochiSocial.social.chatLines') || []
          },
          teamSparMatches[0].id
        );

        if (match.cleared) {
          actingPlayer.setVariable('mochiSocial.battle.teamSparMatchProof', true);
          actingPlayer.setVariable('mochiSocial.battle.teamSparMatch', match.matchId);
          actingPlayer.setVariable('mochiSocial.battle.teamSparMatchName', match.matchName);
          actingPlayer.setVariable('mochiSocial.battle.teamSparMatchScore', match.score);
          if (!actingPlayer.getVariable<boolean>('mochiSocial.battle.teamMatchRibbonClaimed')) {
            actingPlayer.addItem(alphaItems.teamMatchRibbon, 1);
            actingPlayer.setVariable('mochiSocial.battle.teamMatchRibbonClaimed', true);
          }
          patch.teamSparMatch = {
            matchId: match.matchId,
            matchName: match.matchName,
            title: match.title,
            opponentName: match.opponentName,
            partyIds: match.partyIds,
            score: match.score,
            rewardItemId: match.rewardItemId,
            proof: true,
            message: match.message
          };
          const mentor = resolveSpiritMentorChallenge(
            {
              partyIds: match.partyIds,
              teamSparMatchProof: true,
              teamSparMatchId: match.matchId,
              teamSparMatchScore: match.score,
              battleRoundProof: battleRound.victory,
              battleRoundVictory: battleRound.victory,
              battleRoundFocusScore: battleRound.focusScore,
              battleRoundOpponentScore: battleRound.opponentScore,
              techniqueMasteryXp: techniqueMasteryXpTotal(actingPlayer, match.partyIds),
              tacticMasteryXp: Number(actingPlayer.getVariable<number>('mochiSocial.battle.tacticMasteryXp') || 0),
              raisingCareStreak: careStreakTotal(actingPlayer, match.partyIds),
              profileViewed: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.profileViewed')),
              guildBuddyProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.guildBuddyProof'))
            },
            mentorChallenges[0].id
          );

          if (mentor.cleared) {
            actingPlayer.setVariable('mochiSocial.battle.mentorChallengeProof', true);
            actingPlayer.setVariable('mochiSocial.battle.mentorChallenge', mentor.challengeId);
            actingPlayer.setVariable('mochiSocial.battle.mentorChallengeName', mentor.challengeName);
            actingPlayer.setVariable('mochiSocial.battle.mentorChallengeScore', mentor.score);
            if (!actingPlayer.getVariable<boolean>('mochiSocial.battle.mentorSealClaimed')) {
              actingPlayer.addItem(alphaItems.mentorSeal, 1);
              actingPlayer.setVariable('mochiSocial.battle.mentorSealClaimed', true);
            }
            patch.mentorChallenge = {
              challengeId: mentor.challengeId,
              challengeName: mentor.challengeName,
              mentorName: mentor.mentorName,
              title: mentor.title,
              partyIds: mentor.partyIds,
              score: mentor.score,
              requiredScore: mentor.requiredScore,
              rewardItemId: mentor.rewardItemId,
              proof: true,
              message: mentor.message
            };
            notification = 'Mentor challenge cleared';
            saveTitle = 'Mochi Spirit mentor challenge';
            prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} ${match.message} ${mentor.message} The Silk Banner Mentor Seal is no-real-value closed-alpha battle readiness proof.`;

            const trait = resolveSpiritTraitAttunement(
              {
                partyIds: mentor.partyIds,
                activeSpiritId: activeSpirit,
                mentorChallengeProof: true,
                mentorChallengeId: mentor.challengeId,
                techniqueLoadoutProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.techniqueLoadoutProof')),
                techniqueLoadoutId: actingPlayer.getVariable<string>('mochiSocial.battle.techniqueLoadout'),
                battleRoundProof: battleRound.victory,
                battleRoundVictory: battleRound.victory,
                growthRiteProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.growthRiteProof')),
                careStreak: careStreakTotal(actingPlayer, mentor.partyIds),
                journalProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.spirits.journalProof')),
                journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
                bondBySpiritId: bondMap(actingPlayer, mentor.partyIds)
              },
              traitAttunements[0].id
            );

            if (trait.unlocked) {
              actingPlayer.setVariable('mochiSocial.spirits.traitAttunementProof', true);
              actingPlayer.setVariable('mochiSocial.spirits.traitAttunement', trait.traitId);
              actingPlayer.setVariable('mochiSocial.spirits.traitAttunementName', trait.traitName);
              actingPlayer.setVariable('mochiSocial.spirits.traitAttunementScore', trait.score);
              actingPlayer.setVariable(`mochiSocial.spirit.${trait.activeSpiritId}.traitProof`, true);
              actingPlayer.setVariable(`mochiSocial.spirit.${trait.activeSpiritId}.trait`, trait.traitLabel);
              if (!actingPlayer.getVariable<boolean>('mochiSocial.spirits.traitThreadClaimed')) {
                actingPlayer.addItem(alphaItems.traitThread, 1);
                actingPlayer.setVariable('mochiSocial.spirits.traitThreadClaimed', true);
              }
              patch.traitAttunement = {
                activeSpiritId: trait.activeSpiritId,
                activeSpiritName: trait.activeSpiritName,
                title: trait.title,
                partyIds: trait.partyIds,
                score: trait.score,
                requiredScore: trait.requiredScore,
                rewardItemId: trait.rewardItemId,
                proof: true,
                traitId: trait.traitId,
                traitLabel: trait.traitLabel,
                traitName: trait.traitName,
                message: trait.message
              };
              notification = 'Trait attuned';
              saveTitle = 'Mochi Spirit trait attunement';
              prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} ${match.message} ${mentor.message} ${trait.message} The Jade Heart Trait Thread is no-real-value closed-alpha raising proof.`;

              const conditionWeave = resolveSpiritConditionWeave(
                {
                  partyIds: trait.partyIds,
                  activeSpiritId: trait.activeSpiritId,
                  tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
                  affinityProof: Number(actingPlayer.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0) > 0,
                  battleRoundProof: battleRound.victory,
                  battleRoundVictory: battleRound.victory,
                  techniqueLoadoutProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.techniqueLoadoutProof')),
                  techniqueLoadoutId: actingPlayer.getVariable<string>('mochiSocial.battle.techniqueLoadout'),
                  traitAttunementProof: true,
                  traitAttunementId: trait.traitId,
                  mentorChallengeProof: true,
                  mentorChallengeId: mentor.challengeId,
                  sparLadderWins: nextSparWins,
                  trainingXp: Math.max(trainingXpTotal(actingPlayer, trait.partyIds), nextXp),
                  profileViewed: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.profileViewed')),
                  guildBuddyProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
                  statusMood: actingPlayer.getVariable<string>('mochiSocial.social.statusMood'),
                  chatLines: actingPlayer.getVariable<string[]>('mochiSocial.social.chatLines') || []
                },
                conditionWeaves[0].id
              );

              if (conditionWeave.woven) {
                actingPlayer.setVariable('mochiSocial.battle.conditionWeaveProof', true);
                actingPlayer.setVariable('mochiSocial.battle.conditionWeave', conditionWeave.weaveId);
                actingPlayer.setVariable('mochiSocial.battle.conditionWeaveName', conditionWeave.weaveName);
                actingPlayer.setVariable('mochiSocial.battle.conditionWeaveScore', conditionWeave.score);
                actingPlayer.setVariable('mochiSocial.battle.conditionIds', conditionWeave.conditionIds);
                if (!actingPlayer.getVariable<boolean>('mochiSocial.battle.conditionCharmClaimed')) {
                  actingPlayer.addItem(alphaItems.conditionCharm, 1);
                  actingPlayer.setVariable('mochiSocial.battle.conditionCharmClaimed', true);
                }
                patch.conditionWeave = {
                  weaveId: conditionWeave.weaveId,
                  weaveName: conditionWeave.weaveName,
                  title: conditionWeave.title,
                  activeSpiritId: conditionWeave.activeSpiritId,
                  activeSpiritName: conditionWeave.activeSpiritName,
                  partyIds: conditionWeave.partyIds,
                  conditionIds: conditionWeave.conditionIds,
                  score: conditionWeave.score,
                  requiredScore: conditionWeave.requiredScore,
                  rewardItemId: conditionWeave.rewardItemId,
                  proof: true,
                  message: conditionWeave.message
                };
                notification = 'Condition weave complete';
                saveTitle = 'Mochi Spirit condition weave';
                prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} ${match.message} ${mentor.message} ${trait.message} ${conditionWeave.message} The Jade Mirror Condition Charm is no-real-value closed-alpha condition proof.`;
              }
            }
          } else {
            notification = 'Team match cleared';
            saveTitle = 'Mochi Spirit team match';
            prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} ${match.message} The Jade Mirror Match Ribbon is no-real-value closed-alpha battle proof.`;
          }
        }
      }

      actingPlayer.showNotification(notification, { time: 1800, icon: 'training-ring' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: saveTitle }, { reason: 'auto', source: 'training-ring' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function questBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('quest-board');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      const completedQuestChainIds = completedQuestIds(actingPlayer);
      if (completedQuestChainIds.length >= quests.length) {
        if (actingPlayer.getVariable<boolean>('mochiSocial.guild.commissionKnotClaimed')) {
          showAlphaPrompt(actingPlayer, 'Your Jade Court Commission Ledger is already recorded for this alpha save. Guild reputation remains no-real-value.');
          return;
        }

        const commission = resolveGuildCommission(
          {
            roster,
            activeSpiritId: activeSpiritId(actingPlayer),
            journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || roster.length),
            questChainProof: true,
            completedQuestIds: completedQuestChainIds,
            provisionProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.alpha.provisionSatchelProof')),
            provisionSatchelId: actingPlayer.getVariable<string>('mochiSocial.alpha.provisionSatchel'),
            marketProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.alpha.charmListed')),
            tradeProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.alpha.tradeProof')),
            trainingXp: trainingXpTotal(actingPlayer, roster),
            profileViewed: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: actingPlayer.getVariable<string>('mochiSocial.social.statusMood'),
            chatLines: []
          },
          guildCommissions[0].id
        );

        if (!commission.completed) {
          showAlphaPrompt(actingPlayer, commission.message);
          return;
        }

        actingPlayer.setVariable('mochiSocial.guild.commissionProof', true);
        actingPlayer.setVariable('mochiSocial.guild.commission', commission.commissionId);
        actingPlayer.setVariable('mochiSocial.guild.commissionName', commission.commissionName);
        actingPlayer.setVariable('mochiSocial.guild.commissionScore', commission.score);
        actingPlayer.setVariable('mochiSocial.guild.commissionCompletedQuests', commission.completedQuestIds);
        actingPlayer.addItem(alphaItems.commissionKnot, 1);
        actingPlayer.setVariable('mochiSocial.guild.commissionKnotClaimed', true);
        actingPlayer.showNotification('Guild commission recorded', { time: 1800, icon: 'quest-board' });
        emitAlphaHudState(actingPlayer, {
          guildCommission: {
            commissionId: commission.commissionId,
            commissionName: commission.commissionName,
            title: commission.title,
            habitat: commission.habitat,
            activeSpiritId: commission.activeSpiritId,
            roster: commission.roster,
            completedQuestIds: commission.completedQuestIds,
            score: commission.score,
            rewardItemId: commission.rewardItemId,
            proof: true,
            message: commission.message
          }
        });
        await actingPlayer.save('auto', { title: 'Mochirii guild commission' }, { reason: 'auto', source: 'quest-board' });
        showAlphaPrompt(actingPlayer, `${commission.message} The Jade Court Commission Knot is no-real-value closed-alpha guild reputation proof.`);
        return;
      }

      const quest = selectQuestBoardQuest(actingPlayer);
      const requiredSpiritId = quest.requiredSpiritId || activeSpiritId(actingPlayer);
      const rewardSpiritId = requiredSpiritId && roster.includes(requiredSpiritId) ? requiredSpiritId : activeSpiritId(actingPlayer);
      if (!requiredSpiritId || !roster.includes(requiredSpiritId)) {
        const spiritName = spirits.find((entry) => entry.id === requiredSpiritId)?.name || requiredSpiritId || 'a Mochi Spirit';
        showAlphaPrompt(actingPlayer, `${quest.title} is posted on the Mochirii quest board. Bond with ${spiritName} before recording this guild step.`);
        return;
      }

      const stepsKey = `mochiSocial.quest.${quest.id}.steps`;
      const rewardKey = `mochiSocial.quest.${quest.id}.rewardClaimed`;
      const nextCompleted = [...questSteps(actingPlayer, quest.id)];
      const nextStep = quest.steps.find((step) => !nextCompleted.includes(step));
      if (nextStep) {
        nextCompleted.push(nextStep);
      }

      actingPlayer.setVariable('mochiSocial.quest.active', quest.id);
      actingPlayer.setVariable(stepsKey, nextCompleted);
      const nextCompletedQuestIds = completedQuestIds(actingPlayer);
      const nextQuest = quests.find((entry) => {
        return !nextCompletedQuestIds.includes(entry.id) && (!entry.requiredSpiritId || roster.includes(entry.requiredSpiritId));
      });

      const patch: AlphaHudStatePatch = {
        quest: {
          id: quest.id,
          completedSteps: nextCompleted,
          completedQuestIds: nextCompletedQuestIds,
          chainComplete: nextCompletedQuestIds.length >= quests.length,
          nextQuestId: nextCompleted.length >= quest.steps.length ? nextQuest?.id : undefined,
          message: nextCompleted.length >= quest.steps.length
            ? `${quest.title} complete. ${nextCompletedQuestIds.length}/${quests.length} Mochirii quest postings complete.`
            : `${quest.title} ${nextCompleted.length}/${quest.steps.length}`
        }
      };
      let prompt = `${quest.title}: ${nextCompleted.length}/${quest.steps.length} guild steps recorded. This is no-real-value alpha quest progress.`;

      if (nextCompleted.length >= quest.steps.length && !actingPlayer.getVariable<boolean>(rewardKey)) {
        actingPlayer.setVariable(rewardKey, true);
        actingPlayer.setVariable('mochiSocial.quest.completed', nextCompletedQuestIds);
        const bondKey = `mochiSocial.spirit.${rewardSpiritId}.bond`;
        const nextBond = Math.min(5, Number(actingPlayer.getVariable<number>(bondKey) || 1) + quest.rewardBond);
        const nextGrowth = growthStageFromBond(nextBond);
        actingPlayer.setVariable(bondKey, nextBond);
        actingPlayer.setVariable(`mochiSocial.spirit.${rewardSpiritId}.growth`, nextGrowth);
        patch.spirit = { id: rewardSpiritId, bond: nextBond, growth: nextGrowth };
        const spiritName = spirits.find((entry) => entry.id === rewardSpiritId)?.name || rewardSpiritId;
        prompt = `${quest.title} complete. Guild reward recorded as no-real-value alpha progress; ${spiritName} is now ${nextGrowth} bond ${nextBond}/5.`;
        if (nextCompletedQuestIds.length >= quests.length) {
          prompt = `${prompt} The first Mochirii quest chain is complete for closed-alpha testers.`;
        }
      }

      actingPlayer.showNotification(nextCompleted.length >= quest.steps.length ? 'Quest complete' : 'Quest step recorded', { time: 1800, icon: 'quest-board' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: 'Mochirii quest board progress' }, { reason: 'auto', source: 'quest-board' });
      showAlphaPrompt(actingPlayer, prompt);
    }
  };
}

function guildRankBell(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('guild-rank-bell');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const roster = bondedSpirits(actingPlayer);
      const activeSpirit = activeSpiritId(actingPlayer);
      const trial = guildRankTrials[0];
      const completedQuestSteps = quests.flatMap((quest) => questSteps(actingPlayer, quest.id));
      const bond = activeSpirit ? Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1) : 0;
      const rank = resolveGuildRankTrial(
        {
          roster,
          activeSpiritId: activeSpirit,
          bond,
          completedQuestSteps,
          tacticProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityWins: Number(actingPlayer.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0),
          sparWins: Number(actingPlayer.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0),
          journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || roster.length)
        },
        trial.id
      );

      if (!rank.passed) {
        showAlphaPrompt(actingPlayer, rank.message);
        return;
      }

      actingPlayer.setVariable('mochiSocial.guild.rankTrialProof', true);
      actingPlayer.setVariable('mochiSocial.guild.rankTrial', rank.trialId);
      actingPlayer.setVariable('mochiSocial.guild.rankTitle', rank.rankTitle);
      actingPlayer.setVariable('mochiSocial.guild.rankScore', rank.score);
      if (!actingPlayer.getVariable<boolean>('mochiSocial.guild.rankSealClaimed')) {
        actingPlayer.addItem(alphaItems.rankSeal, 1);
        actingPlayer.setVariable('mochiSocial.guild.rankSealClaimed', true);
      }

      actingPlayer.showNotification('Guild rank recorded', { time: 1800, icon: 'guild-rank-bell' });
      emitAlphaHudState(actingPlayer, {
        rank: {
          trialId: rank.trialId,
          trialTitle: rank.trialTitle,
          rankTitle: rank.rankTitle,
          score: rank.score,
          rewardItemId: rank.rewardItemId,
          proof: true,
          message: rank.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochirii guild rank trial' }, { reason: 'auto', source: 'guild-rank-bell' });
      showAlphaPrompt(actingPlayer, `${rank.message} Guild rank is closed-alpha, no-real-value progression for tester coordination.`);
    }
  };
}

function growthMoonwell(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('growth-moonwell');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'Attune with a Mochi Spirit before opening the Moonwell Bloom Rite.');
        return;
      }

      const rite = spiritGrowthRites[0];
      const bond = Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const growth = actingPlayer.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.growth`) || growthStageFromBond(bond);
      const trainingXp = Number(actingPlayer.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.trainingXp`) || 0);
      const riteResult = resolveSpiritGrowthRite(
        {
          spiritId: activeSpirit,
          bond,
          growth,
          trainingXp,
          raisingProof: Boolean(actingPlayer.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.raisingProof`)),
          rankTrialProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.guild.rankTrialProof')),
          rankTrialId: actingPlayer.getVariable<string>('mochiSocial.guild.rankTrial')
        },
        rite.id
      );

      if (!riteResult.passed) {
        showAlphaPrompt(actingPlayer, riteResult.message);
        return;
      }

      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growthRiteProof`, true);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growthRite`, riteResult.riteId);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growthForm`, riteResult.formTitle);
      if (!actingPlayer.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.growthSigilClaimed`)) {
        actingPlayer.addItem(alphaItems.growthSigil, 1);
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growthSigilClaimed`, true);
      }

      actingPlayer.showNotification('Growth rite opened', { time: 1800, icon: 'growth-moonwell' });
      emitAlphaHudState(actingPlayer, {
        growthRite: {
          riteId: riteResult.riteId,
          riteName: riteResult.riteName,
          spiritId: riteResult.spiritId,
          formTitle: riteResult.formTitle,
          rewardItemId: riteResult.rewardItemId,
          proof: true,
          message: riteResult.message
        },
        spirit: { id: activeSpirit, bond: riteResult.bond, growth: riteResult.growth }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit growth rite' }, { reason: 'auto', source: 'growth-moonwell' });
      showAlphaPrompt(actingPlayer, `${riteResult.message} Growth rites are closed-alpha, no-real-value spirit progression.`);
    }
  };
}

function marketBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('market-board');
    },

    async onAction(actingPlayer: RpgPlayer) {
      if (!actingPlayer.getVariable<boolean>('mochiSocial.alpha.charmListed')) {
        actingPlayer.addItem(alphaItems.charm, 1);
        actingPlayer.setVariable('mochiSocial.alpha.charmListed', true);
        actingPlayer.showNotification('Fixed listing proof', { time: 1800, icon: 'market-board' });
        emitAlphaHudState(actingPlayer, { charmListed: true });
        await actingPlayer.save('auto', { title: 'Alpha market proof' }, { reason: 'auto', source: 'market-board' });
        showAlphaPrompt(actingPlayer, 'You listed a Jade Thread Charm for test soft currency. This proves fixed-price market flow without real value.');
        return;
      }

      if (actingPlayer.getVariable<boolean>('mochiSocial.alpha.provisionSatchelClaimed')) {
        showAlphaPrompt(actingPlayer, 'Your Jade Court Provision Satchel is already stocked for this alpha save. Item prep remains no-real-value.');
        return;
      }

      const roster = bondedSpirits(actingPlayer);
      const satchel = resolveSpiritProvisionSatchel(
        {
          roster,
          activeSpiritId: activeSpiritId(actingPlayer),
          journalDiscoveredCount: Number(actingPlayer.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
          marketProof: true,
          tradeProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.alpha.tradeProof')),
          routeInviteProof: Boolean(actingPlayer.getVariable<boolean>('mochiSocial.world.routeInvitationProof')),
          careStreak: careStreakTotal(actingPlayer, roster),
          completedQuestIds: completedQuestIds(actingPlayer)
        },
        provisionSatchels[0].id
      );

      if (!satchel.stocked) {
        showAlphaPrompt(actingPlayer, satchel.message);
        return;
      }

      actingPlayer.setVariable('mochiSocial.alpha.provisionSatchelProof', true);
      actingPlayer.setVariable('mochiSocial.alpha.provisionSatchel', satchel.satchelId);
      actingPlayer.setVariable('mochiSocial.alpha.provisionSatchelName', satchel.satchelName);
      actingPlayer.setVariable('mochiSocial.alpha.provisionScore', satchel.score);
      actingPlayer.setVariable('mochiSocial.alpha.provisionStockItems', satchel.stockItemIds);
      actingPlayer.addItem(alphaItems.mooncakeBox, 1);
      actingPlayer.addItem(alphaItems.provisionSatchel, 1);
      actingPlayer.setVariable('mochiSocial.alpha.provisionSatchelClaimed', true);
      actingPlayer.showNotification('Provision satchel stocked', { time: 1800, icon: 'market-board' });
      emitAlphaHudState(actingPlayer, {
        provisionSatchel: {
          satchelId: satchel.satchelId,
          satchelName: satchel.satchelName,
          title: satchel.title,
          habitat: satchel.habitat,
          activeSpiritId: satchel.activeSpiritId,
          roster: satchel.roster,
          stockItemIds: satchel.stockItemIds,
          completedQuestIds: satchel.completedQuestIds,
          score: satchel.score,
          rewardItemId: satchel.rewardItemId,
          proof: true,
          message: satchel.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochirii provision satchel stocked' }, { reason: 'auto', source: 'market-board' });
      showAlphaPrompt(actingPlayer, `${satchel.message} The Jade Court Provision Satchel is no-real-value closed-alpha item preparation proof.`);
    }
  };
}

function tradePost(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('trade-post');
    },

    async onAction(actingPlayer: RpgPlayer) {
      actingPlayer.setVariable('mochiSocial.alpha.tradeProof', true);
      actingPlayer.showNotification('Direct trade proof', { time: 1800, icon: 'trade-post' });
      emitAlphaHudState(actingPlayer, { tradeProof: true });
      await actingPlayer.save('auto', { title: 'Alpha trade proof' }, { reason: 'auto', source: 'trade-post' });
      showAlphaPrompt(actingPlayer, 'Direct trade proof recorded. Alpha direct trades stay eligible-assets-only and no-real-value.');
    }
  };
}

function canaryShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('canary-shrine');
    },

    async onAction(actingPlayer: RpgPlayer) {
      if (!bondedSpirits(actingPlayer).includes('lirabao')) {
        showAlphaPrompt(actingPlayer, 'The Canary shrine responds to Lirabao certificates first. Bond with Lirabao before staging this proof.');
        return;
      }

      if (!actingPlayer.getVariable<boolean>('mochiSocial.alpha.canaryCertificateRequested')) {
        actingPlayer.addItem(alphaItems.certificate, 1);
        actingPlayer.setVariable('mochiSocial.alpha.canaryCertificateRequested', true);
        actingPlayer.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
        emitAlphaHudState(actingPlayer, { canaryRequested: true });
        await actingPlayer.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
        showAlphaPrompt(
          actingPlayer,
          'A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.'
        );
        return;
      }

      actingPlayer.setVariable('mochiSocial.alpha.canaryReturnRequested', true);
      actingPlayer.showNotification('Jade Vault return staged', { time: 1800, icon: 'canary-shrine' });
      emitAlphaHudState(actingPlayer, { canaryRequested: true, canaryReturnRequested: true });
      await actingPlayer.save('auto', { title: 'Jade Vault return proof' }, { reason: 'auto', source: 'canary-shrine' });
      showAlphaPrompt(
        actingPlayer,
        'Jade Vault Return Proof staged as a no-real-value Canary preview. It does not credit hot inventory unless a future Enjin operation reaches FINALIZED.'
      );
    }
  };
}

function guildSealChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(actingPlayer: RpgPlayer) {
      if (actingPlayer.getVariable<boolean>('mochiSocial.guildSealClaimed')) {
        showAlphaPrompt(actingPlayer, 'The chest is empty. Your Mochirii Guild Seal is already tucked away.');
        return;
      }

      actingPlayer.addItem(alphaItems.guildSeal, 1);
      actingPlayer.setVariable('mochiSocial.guildSealClaimed', true);
      actingPlayer.showNotification('Guild Seal added', { time: 1800, icon: 'chest' });
      emitAlphaHudState(actingPlayer, { sealClaimed: true });
      await actingPlayer.save('auto', { title: 'Mochirii first guild seal' }, { reason: 'auto', source: 'guild-seal-chest' });
      showAlphaPrompt(actingPlayer, 'You found a Mochirii Guild Seal. The server saved this little milestone.');
    }
  };
}

const mainServerModule = defineModule({
  player,
  maps: [
    {
      id: 'mochi-town',
      events: [
        {
          id: 'welcome-npc',
          x: 896,
          y: 512,
          event: welcomeNpc()
        },
        {
          id: 'guild-seal-chest',
          x: 640,
          y: 704,
          event: guildSealChest()
        },
        {
          id: 'journal-pavilion',
          x: 768,
          y: 704,
          event: journalPavilion()
        },
        {
          id: 'expedition-gate',
          x: 256,
          y: 704,
          event: expeditionGate()
        },
        {
          id: 'route-invitation-altar',
          x: 384,
          y: 704,
          event: routeInvitationAltar()
        },
        {
          id: 'technique-dojo',
          x: 896,
          y: 704,
          event: techniqueDojo()
        },
        {
          id: 'tactic-scroll-stand',
          x: 1280,
          y: 320,
          event: tacticScrollStand()
        },
        {
          id: 'affinity-dais',
          x: 1408,
          y: 704,
          event: affinityDais()
        },
        {
          id: 'spirit-lirabao',
          x: 384,
          y: 320,
          event: spiritEvent(spirits[0])
        },
        {
          id: 'spirit-jintari',
          x: 512,
          y: 320,
          event: spiritEvent(spirits[1])
        },
        {
          id: 'spirit-aozhen',
          x: 640,
          y: 320,
          event: spiritEvent(spirits[2])
        },
        {
          id: 'care-shrine',
          x: 768,
          y: 320,
          event: careShrine()
        },
        {
          id: 'habitat-grove',
          x: 896,
          y: 320,
          event: habitatGrove()
        },
        {
          id: 'party-banner',
          x: 1152,
          y: 320,
          event: partyBanner()
        },
        {
          id: 'training-ring',
          x: 1024,
          y: 320,
          event: trainingRing()
        },
        {
          id: 'quest-board',
          x: 1024,
          y: 704,
          event: questBoard()
        },
        {
          id: 'guild-rank-bell',
          x: 1280,
          y: 512,
          event: guildRankBell()
        },
        {
          id: 'growth-moonwell',
          x: 1408,
          y: 512,
          event: growthMoonwell()
        },
        {
          id: 'market-board',
          x: 1152,
          y: 704,
          event: marketBoard()
        },
        {
          id: 'trade-post',
          x: 1280,
          y: 704,
          event: tradePost()
        },
        {
          id: 'canary-shrine',
          x: 1408,
          y: 320,
          event: canaryShrine()
        }
      ]
    }
  ]
});

function provideMochiSocialMain() {
  return createModule('mochi-social-main', [
    {
      server: mainServerModule
    }
  ]);
}

class FileSaveStorageStrategy implements SaveStorageStrategy {
  private readonly directory: string;
  private readonly fileLocks = new Map<string, Promise<void>>();

  constructor(directory: string) {
    this.directory = directory;
  }

  async list(listPlayer: RpgPlayer): Promise<SaveSlotList> {
    return this.stripSnapshots(await this.readSlotsFromFile(this.getPlayerFile(listPlayer)));
  }

  async get(getPlayer: RpgPlayer, index: number): Promise<SaveSlot | null> {
    const slots = await this.readSlotsFromFile(this.getPlayerFile(getPlayer));
    return slots[index] ?? null;
  }

  async save(savePlayer: RpgPlayer, index: number, snapshot: string, meta: SaveSlotMeta): Promise<void> {
    const file = this.getPlayerFile(savePlayer);
    await this.withFileLock(file, async () => {
      const slots = await this.readSlotsFromFile(file);
      const existing = slots[index];
      slots[index] = {
        ...(existing ?? {}),
        ...meta,
        snapshot
      };
      await this.writeSlotsToFile(file, slots);
    });
  }

  async delete(deletePlayer: RpgPlayer, index: number): Promise<void> {
    const file = this.getPlayerFile(deletePlayer);
    await this.withFileLock(file, async () => {
      const slots = await this.readSlotsFromFile(file);
      slots[index] = null;
      await this.writeSlotsToFile(file, slots);
    });
  }

  private async readSlotsFromFile(file: string): Promise<SaveSlotEntries> {
    try {
      const raw = await readFile(file, 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeSlotsToFile(file: string, slots: SaveSlotEntries) {
    await mkdir(this.directory, { recursive: true });
    const tempFile = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    await writeFile(tempFile, JSON.stringify(slots, null, 2), 'utf8');
    await rename(tempFile, file);
  }

  private getPlayerFile(storagePlayer: RpgPlayer) {
    const rawId = String(storagePlayer.id ?? 'guest');
    const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return join(this.directory, `${safeId}.json`);
  }

  private stripSnapshots(slots: SaveSlotEntries): SaveSlotList {
    return slots.map((slot) => {
      if (!slot) return null;
      const { snapshot: _snapshot, ...meta } = slot;
      return meta;
    });
  }

  private async withFileLock<T>(file: string, action: () => Promise<T>): Promise<T> {
    const previous = this.fileLocks.get(file) ?? Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((resolveLock) => {
      release = resolveLock;
    });
    const chained = previous.catch(() => undefined).then(() => next);
    this.fileLocks.set(file, chained);

    await previous.catch(() => undefined);
    try {
      return await action();
    } finally {
      release();
      if (this.fileLocks.get(file) === chained) {
        this.fileLocks.delete(file);
      }
    }
  }
}

export default createServer({
  providers: [
    provideMochiSocialMain(),
    provideSaveStorage(new FileSaveStorageStrategy(saveDir)),
    provideAutoSave({
      shouldAutoSave: () => true,
      getDefaultSlot: () => 0
    }),
    provideServerModules([]),
    provideTiledMap({
      basePath: '/map'
    })
  ]
});
