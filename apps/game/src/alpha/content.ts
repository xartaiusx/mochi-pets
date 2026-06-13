export type SpiritHabitat = 'Jade Lantern Court';

export type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

export type SpiritBattleRole = 'guardian' | 'trickster' | 'scout';

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

export interface SpiritPartyFormation {
  ok: boolean;
  activeSpiritId?: string;
  partyIds: string[];
  supportIds: string[];
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
  message: string;
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
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.jadeBrush, SPIRIT_RAISE_ACTIONS.mooncakeShare]
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
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.mooncakeShare]
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
    raisingNeeds: [SPIRIT_RAISE_ACTIONS.jadeBrush]
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
  certificate: {
    id: 'lirabao-canary-certificate',
    name: 'Lirabao Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
} as const;

export const MOCHI_SPIRIT_QUESTS = [
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
] as const satisfies readonly MochiSpiritQuest[];

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
    'technique-dojo',
    'affinity-dais',
    'market-board',
    'trade-post',
    'training-ring',
    'quest-board',
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

export function techniqueMasteryLevelFromXp(xp: number): SpiritTechniqueMasteryLevel {
  if (xp >= 18) return 'adept';
  if (xp >= 7) return 'practiced';
  return 'novice';
}

export function getMochiSpirit(spiritId: string) {
  return MOCHI_SPIRITS.find((spirit) => spirit.id === spiritId);
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

export function resolveSpiritRaisingAction(spiritId: string, needId: string, currentBond = 1): SpiritRaisingResult {
  const spirit = getMochiSpirit(spiritId);
  const need = spirit?.raisingNeeds.find((candidate) => candidate.id === needId);
  if (!spirit || !need) {
    return {
      ok: false,
      spiritId,
      needId,
      bond: Math.max(0, Math.min(5, Math.floor(currentBond))),
      growth: growthStageFromBond(currentBond),
      message: 'Raising action is not available for this Mochi Spirit.'
    };
  }

  const bond = Math.max(0, Math.min(5, Math.floor(currentBond) + need.bondDelta));
  return {
    ok: true,
    spiritId,
    needId,
    bond,
    growth: growthStageFromBond(bond),
    message: `${need.label} complete for ${spirit.name}. ${need.growthHint}`
  };
}
