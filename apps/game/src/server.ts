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
    completedSteps: string[];
    id: string;
    message?: string;
  };
  raising?: {
    message?: string;
    needId: string;
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
  trailRibbon: {
    id: 'moonbridge-field-ribbon',
    name: 'Moonbridge Field Ribbon',
    description: 'A no-real-value route-scouting proof for the first Mochirii field expedition.'
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
    requiredSpiritId: 'lirabao',
    steps: ['attune-spirit', 'greet-sifu-narao', 'open-journal'],
    rewardBond: 1
  }
] as const;

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

function resolveSpiritRaisingAction(spiritId: string, needId: string, currentBond = 1) {
  const spirit = spirits.find((entry) => entry.id === spiritId);
  const need = spirit?.raisingNeeds.find((candidate) => candidate.id === needId);
  const boundedBond = Math.max(0, Math.min(5, Math.floor(currentBond)));
  if (!spirit || !need) {
    return {
      ok: false,
      bond: boundedBond,
      growth: growthStageFromBond(boundedBond),
      message: 'Raising action is not available for this Mochi Spirit.'
    };
  }

  const bond = Math.max(0, Math.min(5, boundedBond + need.bondDelta));
  return {
    ok: true,
    bond,
    growth: growthStageFromBond(bond),
    message: `${need.label} complete for ${spirit.name}. ${need.growthHint}`
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

function growthMap(actingPlayer: RpgPlayer, party: readonly string[]) {
  return Object.fromEntries(
    party.map((spiritId) => [spiritId, actingPlayer.getVariable<string>(`mochiSocial.spirit.${spiritId}.growth`) || 'seed'])
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

      const spirit = spirits.find((entry) => entry.id === activeSpirit);
      const need = spirit?.raisingNeeds[0];
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const raising = need ? resolveSpiritRaisingAction(activeSpirit, need.id, currentBond) : null;
      const nextBond = raising?.ok ? raising.bond : Math.min(5, currentBond + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      if (need) {
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.raisingProof`, true);
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.lastCareNeed`, need.id);
      }
      actingPlayer.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(actingPlayer, {
        raising: need
          ? {
              needId: need.id,
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
      actingPlayer.showNotification('Party formed', { time: 1800, icon: 'party-banner' });
      emitAlphaHudState(actingPlayer, {
        party: {
          activeSpiritId: formation.activeSpiritId,
          partyIds: formation.partyIds,
          supportIds: formation.supportIds,
          message: formation.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit party formed' }, { reason: 'auto', source: 'party-banner' });
      showAlphaPrompt(actingPlayer, `${formation.message} Party formation stays no-injury, social-first, and no-real-value.`);
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
      actingPlayer.showNotification('Journal updated', { time: 1800, icon: 'journal-pavilion' });
      emitAlphaHudState(actingPlayer, {
        journal: {
          activeSpiritId: journal.activeSpiritId,
          discoveredCount: journal.discoveredCount,
          totalCount: journal.totalCount,
          proof: true,
          message: journal.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit journal reviewed' }, { reason: 'auto', source: 'journal-pavilion' });
      showAlphaPrompt(actingPlayer, `${journal.message} The journal records habitat, rarity, temperament, role, and care notes as no-real-value alpha lore.`);
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

      const routeCount = Number(actingPlayer.getVariable<number>('mochiSocial.world.expeditionCount') || 0);
      const route = expeditionRoutes[routeCount % expeditionRoutes.length] || expeditionRoutes[0];
      const discoveredRoutesRaw = actingPlayer.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
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
      actingPlayer.showNotification('Technique refined', { time: 1800, icon: 'technique-dojo' });
      emitAlphaHudState(actingPlayer, {
        technique: {
          spiritId: activeSpirit,
          moveId: move.id,
          masteryXp: technique.masteryXp,
          masteryLevel: technique.masteryLevel,
          focusScore: technique.focusScore,
          proof: true,
          message: technique.message
        }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit technique practice' }, { reason: 'auto', source: 'technique-dojo' });
      showAlphaPrompt(actingPlayer, `${technique.message} Technique mastery is no-injury alpha progression with no real value.`);
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
      actingPlayer.showNotification(affinity.victory ? 'Affinity trial cleared' : 'Affinity trial studied', { time: 1800, icon: 'affinity-dais' });
      emitAlphaHudState(actingPlayer, {
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
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit affinity trial' }, { reason: 'auto', source: 'affinity-dais' });
      showAlphaPrompt(actingPlayer, `${affinity.message} Affinity trials are no-injury alpha battle practice with no real value.`);
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
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      actingPlayer.showNotification('Training spar complete', { time: 1800, icon: 'training-ring' });
      emitAlphaHudState(actingPlayer, {
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
        }
      });
      await actingPlayer.save('auto', { title: 'Mochi Spirit training spar' }, { reason: 'auto', source: 'training-ring' });
      showAlphaPrompt(actingPlayer, `Training spar complete: ${result.message} ${spar.message} Training is no-injury guild practice with no real value.`);
    }
  };
}

function questBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('quest-board');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const quest = quests[0];
      const activeSpirit = activeSpiritId(actingPlayer);
      if (!activeSpirit || !bondedSpirits(actingPlayer).includes(quest.requiredSpiritId)) {
        showAlphaPrompt(actingPlayer, `${quest.title} is posted on the Mochirii quest board. Bond with Lirabao before recording this guild vow.`);
        return;
      }

      const stepsKey = `mochiSocial.quest.${quest.id}.steps`;
      const rewardKey = `mochiSocial.quest.${quest.id}.rewardClaimed`;
      const completedSteps = actingPlayer.getVariable<string[]>(stepsKey);
      const nextCompleted = Array.isArray(completedSteps) ? [...completedSteps] : [];
      const nextStep = quest.steps.find((step) => !nextCompleted.includes(step));
      if (nextStep) {
        nextCompleted.push(nextStep);
      }

      actingPlayer.setVariable('mochiSocial.quest.active', quest.id);
      actingPlayer.setVariable(stepsKey, nextCompleted);

      const patch: AlphaHudStatePatch = {
        quest: {
          id: quest.id,
          completedSteps: nextCompleted,
          message: `${quest.title} ${nextCompleted.length}/${quest.steps.length}`
        }
      };
      let prompt = `${quest.title}: ${nextCompleted.length}/${quest.steps.length} guild steps recorded. This is no-real-value alpha quest progress.`;

      if (nextCompleted.length >= quest.steps.length && !actingPlayer.getVariable<boolean>(rewardKey)) {
        actingPlayer.setVariable(rewardKey, true);
        const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
        const nextBond = Math.min(5, Number(actingPlayer.getVariable<number>(bondKey) || 1) + quest.rewardBond);
        const nextGrowth = growthStageFromBond(nextBond);
        actingPlayer.setVariable(bondKey, nextBond);
        actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
        patch.spirit = { id: activeSpirit, bond: nextBond, growth: nextGrowth };
        const spiritName = spirits.find((entry) => entry.id === activeSpirit)?.name || activeSpirit;
        prompt = `${quest.title} complete. Guild reward recorded as no-real-value alpha progress; ${spiritName} is now ${nextGrowth} bond ${nextBond}/5.`;
      }

      actingPlayer.showNotification(nextCompleted.length >= quest.steps.length ? 'Quest complete' : 'Quest step recorded', { time: 1800, icon: 'quest-board' });
      emitAlphaHudState(actingPlayer, patch);
      await actingPlayer.save('auto', { title: 'Mochirii quest board progress' }, { reason: 'auto', source: 'quest-board' });
      showAlphaPrompt(actingPlayer, prompt);
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

      showAlphaPrompt(actingPlayer, 'Your Jade Thread Charm listing proof is already recorded for this alpha save.');
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
      }
      actingPlayer.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
      emitAlphaHudState(actingPlayer, { canaryRequested: true });
      await actingPlayer.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
      showAlphaPrompt(
        actingPlayer,
        'A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.'
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
