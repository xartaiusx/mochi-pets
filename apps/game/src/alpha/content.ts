export type SpiritHabitat = 'Jade Lantern Court';

export type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

export type SpiritBattleRole = 'guardian' | 'trickster' | 'scout';

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

export interface SpiritAttunementResult {
  ok: boolean;
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
