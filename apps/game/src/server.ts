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
  training?: {
    message?: string;
    victories: number;
    xp: number;
  };
  tradeProof?: boolean;
};

type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

type SpiritTechniqueMasteryLevel = 'novice' | 'practiced' | 'adept';

type SpiritBattleMove = {
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
  preferredRoles: readonly ('guardian' | 'trickster' | 'scout')[];
  rewardXp: number;
  bondDelta: number;
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
    role: 'guardian' | 'trickster' | 'scout';
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
        { id: 'lantern-pulse', label: 'Lantern Pulse', power: 5, focusCost: 1 },
        { id: 'skybell-guard', label: 'Skybell Guard', power: 4, focusCost: 1 }
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
        { id: 'goldleaf-feint', label: 'Goldleaf Feint', power: 6, focusCost: 2 },
        { id: 'lantern-pulse', label: 'Lantern Pulse', power: 5, focusCost: 1 }
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
        { id: 'skybell-guard', label: 'Skybell Guard', power: 4, focusCost: 1 },
        { id: 'goldleaf-feint', label: 'Goldleaf Feint', power: 6, focusCost: 2 }
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
          id: 'technique-dojo',
          x: 896,
          y: 704,
          event: techniqueDojo()
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
