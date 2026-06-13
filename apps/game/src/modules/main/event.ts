import { PrebuiltGui } from '@rpgjs/common';
import type { EventDefinition, RpgPlayer } from '@rpgjs/server';
import {
  ALPHA_ITEMS,
  GUILD_COMMISSIONS,
  GUILD_RANK_TRIALS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_COMPENDIUMS,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_MENTOR_CHALLENGES,
  SPIRIT_PROVISION_SATCHELS,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_TEAM_SPAR_MATCHES,
  SPIRIT_TECHNIQUE_LOADOUTS,
  SPIRIT_TRAIT_ATTUNEMENTS,
  growthStageFromBond,
  techniqueMasteryLevelFromXp,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleRound,
  resolveSpiritBattleTactic,
  resolveSpiritCapture,
  resolveSpiritCompendiumCompletion,
  resolveSpiritExpedition,
  resolveGuildCommission,
  resolveGuildRankTrial,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritJournal,
  resolveSpiritMentorChallenge,
  resolveSpiritParty,
  resolveSpiritProvisionSatchel,
  resolveSpiritRaisingAction,
  resolveSpiritResearchFolio,
  resolveSpiritRouteMastery,
  resolveSpiritRouteInvitation,
  selectSpiritRaisingNeed,
  resolveSpiritSparLadder,
  resolveSpiritTeamSparMatch,
  resolveSpiritTechniqueLoadout,
  resolveSpiritTechniqueMastery,
  resolveSpiritTraitAttunement,
  resolveSpiritTrainingBattle,
  type MochiSpirit
} from '../../alpha/content';

const ALPHA_PROMPT_MS = 2600;

type AlphaHudStatePatch = {
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

function showAlphaPrompt(player: RpgPlayer, message: string) {
  if (typeof player.gui !== 'function' || typeof player.removeGui !== 'function') {
    void player.showText(message);
    return;
  }

  const gui = player.gui(PrebuiltGui.Dialog);
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
    player.removeGui(PrebuiltGui.Dialog, undefined, openId);
  }, ALPHA_PROMPT_MS);
}

function emitAlphaHudState(player: RpgPlayer, patch: AlphaHudStatePatch) {
  if (typeof (player as { emit?: unknown }).emit === 'function') {
    (player as { emit(type: string, value?: unknown): void }).emit('mochi-social-alpha-state', patch);
  }
}

export const SPIRITS = [
  ...MOCHI_SPIRITS
] as const;

export function WelcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(player: RpgPlayer) {
      player.showNotification('Guild spark found', { time: 1800, icon: 'sifu-narao' });
      showAlphaPrompt(
        player,
        'Welcome to Mochi Social. This closed alpha guild court is no-real-value and Canary-only, but it is ready for Mochirii spirit testing with friends.'
      );
    }
  };
}

function bondedSpirits(player: RpgPlayer): string[] {
  const spirits = player.getVariable<string[]>('mochiSocial.spirits.bonded');
  return Array.isArray(spirits) ? spirits : [];
}

function activeSpiritId(player: RpgPlayer) {
  return player.getVariable<string>('mochiSocial.spirits.active') || bondedSpirits(player)[0];
}

function partyIds(player: RpgPlayer) {
  const party = player.getVariable<string[]>('mochiSocial.spirits.party');
  return Array.isArray(party) ? party : [];
}

function bondMap(player: RpgPlayer, spirits: readonly string[]) {
  return Object.fromEntries(
    spirits.map((spiritId) => [spiritId, Number(player.getVariable<number>(`mochiSocial.spirit.${spiritId}.bond`) || 1)])
  );
}

function trainingXpTotal(player: RpgPlayer, spirits: readonly string[]) {
  return spirits.reduce((total, spiritId) => {
    return total + Number(player.getVariable<number>(`mochiSocial.spirit.${spiritId}.trainingXp`) || 0);
  }, 0);
}

function techniqueMasteryXpTotal(player: RpgPlayer, spirits: readonly string[]) {
  return spirits.reduce((total, spiritId) => {
    const spirit = MOCHI_SPIRITS.find((entry) => entry.id === spiritId);
    const moveXp = spirit?.battle.moves.reduce((moveTotal, move) => {
      return moveTotal + Number(player.getVariable<number>(`mochiSocial.spirit.${spiritId}.technique.${move.id}.xp`) || 0);
    }, 0) || 0;
    return total + moveXp;
  }, 0);
}

function careStreakTotal(player: RpgPlayer, spirits: readonly string[]) {
  return spirits.reduce((total, spiritId) => {
    return Math.max(total, Number(player.getVariable<number>(`mochiSocial.spirit.${spiritId}.careStreak`) || 0));
  }, 0);
}

function preferredMoveIdBySpiritId() {
  return Object.fromEntries(
    MOCHI_SPIRITS.map((spirit) => {
      const tactic = SPIRIT_BATTLE_TACTICS.find((entry) => entry.preferredRoles.includes(spirit.battle.role));
      return [spirit.id, tactic?.recommendedMoveId || spirit.battle.moves[0].id];
    })
  );
}

function growthMap(player: RpgPlayer, spirits: readonly string[]) {
  return Object.fromEntries(
    spirits.map((spiritId) => [spiritId, player.getVariable<string>(`mochiSocial.spirit.${spiritId}.growth`) || 'seed'])
  );
}

function questSteps(player: RpgPlayer, questId: string): string[] {
  const completedSteps = player.getVariable<string[]>(`mochiSocial.quest.${questId}.steps`);
  return Array.isArray(completedSteps) ? completedSteps : [];
}

function completedQuestIds(player: RpgPlayer): string[] {
  return MOCHI_SPIRIT_QUESTS.filter((quest) => questSteps(player, quest.id).length >= quest.steps.length).map((quest) => quest.id);
}

function selectQuestBoardQuest(player: RpgPlayer) {
  const roster = bondedSpirits(player);
  const completed = new Set(completedQuestIds(player));
  const activeQuestId = player.getVariable<string>('mochiSocial.quest.active');
  const activeQuest = MOCHI_SPIRIT_QUESTS.find((quest) => quest.id === activeQuestId);
  if (
    activeQuest &&
    !completed.has(activeQuest.id) &&
    (!activeQuest.requiredSpiritId || roster.includes(activeQuest.requiredSpiritId))
  ) {
    return activeQuest;
  }

  return (
    MOCHI_SPIRIT_QUESTS.find((quest) => !completed.has(quest.id) && (!quest.requiredSpiritId || roster.includes(quest.requiredSpiritId))) ||
    MOCHI_SPIRIT_QUESTS.find((quest) => !completed.has(quest.id)) ||
    MOCHI_SPIRIT_QUESTS[0]
  );
}

export function SpiritEvent(spirit: MochiSpirit): EventDefinition {
  return {
    onInit() {
      this.setGraphic(spirit.sprite);
    },

    async onAction(player: RpgPlayer) {
      const spirits = bondedSpirits(player);
      if (spirits.includes(spirit.id)) {
        showAlphaPrompt(player, `${spirit.name} drifts close by. Your Mochi Spirit bond is already started.`);
        return;
      }

      spirits.push(spirit.id);
      player.setVariable('mochiSocial.spirits.bonded', spirits);
      player.setVariable('mochiSocial.spirits.active', spirit.id);
      player.setVariable(`mochiSocial.spirit.${spirit.id}.bond`, 1);
      player.setVariable(`mochiSocial.spirit.${spirit.id}.growth`, 'seed');
      player.setVariable(`mochiSocial.spirit.${spirit.id}.journalUnlocked`, true);
      player.showNotification(`${spirit.name} bonded`, { time: 1800, icon: spirit.sprite });
      emitAlphaHudState(player, { spirit: { id: spirit.id, bond: 1, growth: 'seed' } });
      await player.save('auto', { title: 'Mochi Spirit bonded' }, { reason: 'auto', source: 'spirit-bond' });
      showAlphaPrompt(player, `${spirit.name} joined your Mochirii spirit journal. Offer care at the court shrine to grow your bond.`);
    }
  };
}

export function CareShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('sifu-narao');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'The Jade Lantern Court shrine warms gently. Bond with a Mochi Spirit first, then return to care for it.');
        return;
      }

      const careStreakKey = `mochiSocial.spirit.${activeSpirit}.careStreak`;
      const currentCareStreak = Number(player.getVariable<number>(careStreakKey) || 0);
      const need = selectSpiritRaisingNeed(activeSpirit, currentCareStreak);
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentBond = Number(player.getVariable<number>(bondKey) || 1);
      const raising = need ? resolveSpiritRaisingAction(activeSpirit, need.id, currentBond, currentCareStreak) : null;
      const nextBond = raising?.ok ? raising.bond : Math.min(5, currentBond + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      if (need) {
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.raisingProof`, true);
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.lastCareNeed`, need.id);
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.nextCareNeed`, raising?.nextNeedId || need.id);
        player.setVariable(careStreakKey, raising?.careStreak || currentCareStreak);
      }
      player.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'spirit-care' });
      showAlphaPrompt(player, `Care complete. ${raising?.message || 'Your companion feels steady.'} Your companion is now in ${nextGrowth} growth with bond ${nextBond}/5.`);
    }
  };
}

export function HabitatGrove(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('habitat-grove');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      if (roster.length >= MOCHI_SPIRITS.length) {
        const activeSpirit = activeSpiritId(player) || roster[0];
        const bond = resolveSpiritHabitatBond(
          {
            roster,
            activeSpiritId: activeSpirit,
            journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
            careProof: Boolean(player.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.raisingProof`)),
            bond: Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1),
            growth: player.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.growth`) || 'seed',
            profileViewed: Boolean(player.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(player.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: player.getVariable<string>('mochiSocial.social.statusMood')
          },
          SPIRIT_HABITAT_BONDS[0].id
        );

        if (!bond.bonded) {
          showAlphaPrompt(player, bond.message);
          return;
        }

        player.setVariable('mochiSocial.spirits.habitatBondProof', true);
        player.setVariable('mochiSocial.spirits.habitatBond', bond.bondId);
        player.setVariable('mochiSocial.spirits.habitatBondName', bond.bondName);
        player.setVariable('mochiSocial.spirits.habitatBondScore', bond.score);
        if (!player.getVariable<boolean>('mochiSocial.spirits.habitatTasselClaimed')) {
          player.addItem(ALPHA_ITEMS.habitatTassel, 1);
          player.setVariable('mochiSocial.spirits.habitatTasselClaimed', true);
        }

        player.showNotification('Habitat bond recorded', { time: 1800, icon: 'habitat-grove' });
        emitAlphaHudState(player, {
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
        await player.save('auto', { title: 'Mochi Spirit habitat bond' }, { reason: 'auto', source: 'habitat-grove' });
        showAlphaPrompt(player, `${bond.message} The Jade Court Habitat Tassel is no-real-value closed-alpha raising and roleplay proof.`);
        return;
      }

      const targetSpirit = MOCHI_SPIRITS.find((spirit) => !roster.includes(spirit.id)) || MOCHI_SPIRITS[0];
      const result = resolveSpiritCapture(targetSpirit.id, targetSpirit.capture.lureItemId, targetSpirit.capture.harmonyRequired, roster);

      if (!result.ok) {
        showAlphaPrompt(player, result.message);
        return;
      }

      const nextRoster = roster.includes(targetSpirit.id) ? roster : [...roster, targetSpirit.id];
      player.setVariable('mochiSocial.spirits.bonded', nextRoster);
      player.setVariable('mochiSocial.spirits.active', targetSpirit.id);
      player.setVariable(`mochiSocial.spirit.${targetSpirit.id}.bond`, Math.max(1, result.bond));
      player.setVariable(`mochiSocial.spirit.${targetSpirit.id}.growth`, result.growth);
      player.setVariable(`mochiSocial.spirit.${targetSpirit.id}.journalUnlocked`, true);
      player.setVariable(`mochiSocial.spirit.${targetSpirit.id}.captureEncounter`, targetSpirit.capture.encounterId);
      player.setVariable(`mochiSocial.spirit.${targetSpirit.id}.captureRarity`, targetSpirit.capture.rarity);
      if (!player.getVariable<boolean>('mochiSocial.alpha.harmonyTeaReceived')) {
        player.addItem(ALPHA_ITEMS.harmonyTea, 1);
        player.setVariable('mochiSocial.alpha.harmonyTeaReceived', true);
      }

      player.showNotification(`${targetSpirit.name} invited`, { time: 1800, icon: 'habitat-grove' });
      emitAlphaHudState(player, {
        capture: {
          spiritId: targetSpirit.id,
          roster: nextRoster,
          message: result.message
        },
        spirit: { id: targetSpirit.id, bond: Math.max(1, result.bond), growth: result.growth }
      });
      await player.save('auto', { title: 'Mochi Spirit invited from habitat grove' }, { reason: 'auto', source: 'habitat-grove' });
      showAlphaPrompt(
        player,
        `${result.message} This spirit invitation is a Mochirii-original, no-real-value alpha capture loop based on harmony, care, and consent.`
      );
    }
  };
}

export function PartyBanner(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('party-banner');
    },

    async onAction(player: RpgPlayer) {
      const formation = resolveSpiritParty(bondedSpirits(player), activeSpiritId(player));
      if (!formation.ok) {
        showAlphaPrompt(player, formation.message);
        return;
      }

      player.setVariable('mochiSocial.spirits.party', formation.partyIds);
      player.setVariable('mochiSocial.spirits.active', formation.activeSpiritId);
      player.setVariable('mochiSocial.spirits.support', formation.supportIds);
      const growthRiteId = formation.partyIds
        .map((spiritId) => player.getVariable<string>(`mochiSocial.spirit.${spiritId}.growthRite`))
        .find(Boolean);
      const harmony = resolveSpiritHarmonyForm(
        {
          partyIds: formation.partyIds,
          routeMasteryProof: Boolean(player.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
          routeMasteryId: player.getVariable<string>('mochiSocial.world.routeMastery'),
          growthRiteProof: formation.partyIds.some((spiritId) => Boolean(player.getVariable<boolean>(`mochiSocial.spirit.${spiritId}.growthRiteProof`))),
          growthRiteId,
          tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityProof: Number(player.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0) > 0,
          trainingXp: trainingXpTotal(player, formation.partyIds),
          sparLadderXp: Number(player.getVariable<number>('mochiSocial.battle.sparLadderXp') || 0)
        },
        SPIRIT_HARMONY_FORMS[0].id
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
        player.setVariable('mochiSocial.spirits.harmonyFormProof', true);
        player.setVariable('mochiSocial.spirits.harmonyForm', harmony.formId);
        player.setVariable('mochiSocial.spirits.harmonyName', harmony.name);
        player.setVariable('mochiSocial.spirits.harmonyScore', harmony.score);
        if (!player.getVariable<boolean>('mochiSocial.spirits.harmonySashClaimed')) {
          player.addItem(ALPHA_ITEMS.harmonySash, 1);
          player.setVariable('mochiSocial.spirits.harmonySashClaimed', true);
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

      player.showNotification(harmony.formed ? 'Harmony formed' : 'Party formed', { time: 1800, icon: 'party-banner' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: saveTitle }, { reason: 'auto', source: 'party-banner' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function JournalPavilion(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('journal-pavilion');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      const journal = resolveSpiritJournal(roster, activeSpiritId(player), bondMap(player, roster), growthMap(player, roster));
      if (!journal.ok) {
        showAlphaPrompt(player, journal.message);
        return;
      }

      player.setVariable('mochiSocial.spirits.journalViewed', true);
      player.setVariable('mochiSocial.spirits.journalDiscovered', journal.records.filter((record) => record.discovered).map((record) => record.spiritId));
      player.setVariable('mochiSocial.spirits.journalCount', journal.discoveredCount);
      const discoveredRoutesRaw = player.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const activeSpirit = journal.activeSpiritId || activeSpiritId(player) || roster[0];
      const research = resolveSpiritResearchFolio(
        {
          roster,
          activeSpiritId: activeSpirit,
          discoveredRoutes,
          journalDiscoveredCount: journal.discoveredCount,
          habitatBondProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.habitatBondProof')),
          habitatBondId: player.getVariable<string>('mochiSocial.spirits.habitatBond'),
          techniqueProof: roster.some((spiritId) => Boolean(player.getVariable<string>(`mochiSocial.spirit.${spiritId}.technique.lastMove`))),
          tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityProof: Number(player.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0) > 0,
          trainingXp: trainingXpTotal(player, roster)
        },
        SPIRIT_RESEARCH_FOLIOS[0].id
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
        player.setVariable('mochiSocial.spirits.researchProof', true);
        player.setVariable('mochiSocial.spirits.researchFolio', research.folioId);
        player.setVariable('mochiSocial.spirits.researchFolioName', research.folioName);
        player.setVariable('mochiSocial.spirits.researchScore', research.score);
        if (!player.getVariable<boolean>('mochiSocial.spirits.researchFolioClaimed')) {
          player.addItem(ALPHA_ITEMS.researchFolio, 1);
          player.setVariable('mochiSocial.spirits.researchFolioClaimed', true);
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
            habitatBondProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.habitatBondProof')),
            habitatBondId: player.getVariable<string>('mochiSocial.spirits.habitatBond'),
            researchProof: true,
            researchFolioId: research.folioId,
            routeMasteryProof: Boolean(player.getVariable<boolean>('mochiSocial.world.routeMasteryProof'))
          },
          SPIRIT_COMPENDIUMS[0].id
        );

        if (compendium.completed) {
          player.setVariable('mochiSocial.spirits.compendiumProof', true);
          player.setVariable('mochiSocial.spirits.compendium', compendium.compendiumId);
          player.setVariable('mochiSocial.spirits.compendiumName', compendium.compendiumName);
          player.setVariable('mochiSocial.spirits.compendiumScore', compendium.score);
          if (!player.getVariable<boolean>('mochiSocial.spirits.compendiumSealClaimed')) {
            player.addItem(ALPHA_ITEMS.compendiumSeal, 1);
            player.setVariable('mochiSocial.spirits.compendiumSealClaimed', true);
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

      player.showNotification('Journal updated', { time: 1800, icon: 'journal-pavilion' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: saveTitle }, { reason: 'auto', source: 'journal-pavilion' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function ExpeditionGate(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('expedition-gate');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit || !roster.length) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before scouting the Moonbridge field route.');
        return;
      }

      const routeCount = Number(player.getVariable<number>('mochiSocial.world.expeditionCount') || 0);
      const discoveredRoutesRaw = player.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const allRoutesDiscovered = SPIRIT_EXPEDITION_ROUTES.every((route) => discoveredRoutes.includes(route.id));

      if (allRoutesDiscovered) {
        const mastery = resolveSpiritRouteMastery({
          discoveredRoutes,
          roster,
          journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
          completedQuestIds: completedQuestIds(player),
          guildRankProof: Boolean(player.getVariable<boolean>('mochiSocial.guild.rankTrialProof')),
          rankTrialId: player.getVariable<string>('mochiSocial.guild.rankTrial')
        });

        if (!mastery.mastered) {
          showAlphaPrompt(player, mastery.message);
          return;
        }

        player.setVariable('mochiSocial.world.routeMasteryProof', true);
        player.setVariable('mochiSocial.world.routeMastery', mastery.masteryId);
        player.setVariable('mochiSocial.world.routeMasteryTitle', mastery.title);
        player.setVariable('mochiSocial.world.routeMasteryScore', mastery.score);
        if (!player.getVariable<boolean>('mochiSocial.world.routeMasteryKnotClaimed')) {
          player.addItem(ALPHA_ITEMS.routeKnot, 1);
          player.setVariable('mochiSocial.world.routeMasteryKnotClaimed', true);
        }
        player.showNotification('Route circuit mastered', { time: 1800, icon: 'expedition-gate' });
        emitAlphaHudState(player, {
          routeMastery: {
            masteryId: mastery.masteryId,
            title: mastery.title,
            score: mastery.score,
            rewardItemId: mastery.rewardItemId,
            proof: true,
            message: mastery.message
          }
        });
        await player.save('auto', { title: 'Mochirii route circuit mastered' }, { reason: 'auto', source: 'expedition-gate' });
        showAlphaPrompt(player, `${mastery.message} This is no-real-value field progression for Alpha Preview testing.`);
        return;
      }

      const route = SPIRIT_EXPEDITION_ROUTES[routeCount % SPIRIT_EXPEDITION_ROUTES.length] || SPIRIT_EXPEDITION_ROUTES[0];
      const bond = Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const harmonyScore = bond + Math.max(1, roster.length) + partyIds(player).length;
      const expedition = resolveSpiritExpedition(route.id, roster, activeSpirit, harmonyScore, discoveredRoutes);
      if (!expedition.ok) {
        showAlphaPrompt(player, expedition.message);
        return;
      }

      const nextCount = routeCount + 1;
      player.setVariable('mochiSocial.world.lastExpeditionRoute', expedition.routeId);
      player.setVariable('mochiSocial.world.lastExpeditionEncounter', expedition.encounterSpiritId);
      player.setVariable('mochiSocial.world.discoveredRoutes', expedition.discoveredRoutes);
      player.setVariable('mochiSocial.world.expeditionCount', nextCount);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.lastExpeditionRoute`, expedition.routeId);

      if (!player.getVariable<boolean>('mochiSocial.world.trailRibbonClaimed')) {
        player.addItem(ALPHA_ITEMS.trailRibbon, 1);
        player.setVariable('mochiSocial.world.trailRibbonClaimed', true);
      }

      player.showNotification('Route scouted', { time: 1800, icon: 'expedition-gate' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochirii field route scouted' }, { reason: 'auto', source: 'expedition-gate' });
      showAlphaPrompt(player, `${expedition.message} Route scouting is a no-real-value alpha field encounter proof; invitations still happen through habitat and consent.`);
    }
  };
}

export function RouteInvitationAltar(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('route-invitation-altar');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      const discoveredRoutesRaw = player.getVariable<string[]>('mochiSocial.world.discoveredRoutes');
      const discoveredRoutes = Array.isArray(discoveredRoutesRaw) ? discoveredRoutesRaw : [];
      const routeId = player.getVariable<string>('mochiSocial.world.lastExpeditionRoute') || discoveredRoutes[0] || SPIRIT_EXPEDITION_ROUTES[0].id;
      const route = SPIRIT_EXPEDITION_ROUTES.find((entry) => entry.id === routeId) || SPIRIT_EXPEDITION_ROUTES[0];
      const activeSpirit = activeSpiritId(player);
      const bond = activeSpirit ? Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1) : 1;
      const expeditionCount = Number(player.getVariable<number>('mochiSocial.world.expeditionCount') || 0);
      const harmonyScore = bond + Math.max(1, roster.length) + partyIds(player).length + expeditionCount;
      const invitation = resolveSpiritRouteInvitation(route.id, route.recommendedItemId, harmonyScore, roster, discoveredRoutes);

      if (!invitation.ok) {
        showAlphaPrompt(player, invitation.message);
        return;
      }

      player.setVariable('mochiSocial.spirits.bonded', invitation.roster);
      player.setVariable('mochiSocial.spirits.active', invitation.spiritId);
      player.setVariable(`mochiSocial.spirit.${invitation.spiritId}.bond`, Math.max(1, invitation.bond));
      player.setVariable(`mochiSocial.spirit.${invitation.spiritId}.growth`, invitation.growth);
      player.setVariable(`mochiSocial.spirit.${invitation.spiritId}.journalUnlocked`, true);
      player.setVariable(`mochiSocial.spirit.${invitation.spiritId}.captureEncounter`, `${invitation.routeId}-route-invitation`);
      player.setVariable(`mochiSocial.spirit.${invitation.spiritId}.lastRouteInvitation`, invitation.routeId);
      player.setVariable('mochiSocial.world.lastRouteInvitation', invitation.routeId);
      player.setVariable('mochiSocial.world.lastRouteInvitationSpirit', invitation.spiritId);
      player.setVariable('mochiSocial.world.routeInvitationProof', true);

      player.showNotification('Route spirit invited', { time: 1800, icon: 'route-invitation-altar' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochirii route spirit invited' }, { reason: 'auto', source: 'route-invitation-altar' });
      showAlphaPrompt(
        player,
        `${invitation.message} Route invitations are Mochirii-original, consent-based, no-real-value alpha capture progress.`
      );
    }
  };
}

export function TechniqueDojo(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('technique-dojo');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before practicing at the Mochirii Technique Dojo.');
        return;
      }

      const spirit = MOCHI_SPIRITS.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(player, 'The Technique Dojo cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const bond = Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const currentXp = Number(player.getVariable<number>(xpKey) || 0);
      const technique = resolveSpiritTechniqueMastery(activeSpirit, move.id, currentXp, bond);
      if (!technique.ok) {
        showAlphaPrompt(player, technique.message);
        return;
      }

      player.setVariable(xpKey, technique.masteryXp);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.${move.id}.level`, technique.masteryLevel);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`, move.id);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.focusScore`, technique.focusScore);
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
      const loadoutParty = partyIds(player);

      if (loadoutParty.length >= MOCHI_SPIRITS.length) {
        const loadout = resolveSpiritTechniqueLoadout(
          {
            partyIds: loadoutParty,
            preferredMoveIdBySpiritId: preferredMoveIdBySpiritId(),
            techniqueProof: true,
            tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            tacticId: player.getVariable<string>('mochiSocial.battle.lastTacticScroll'),
            techniqueMasteryXp: Math.max(technique.masteryXp, techniqueMasteryXpTotal(player, loadoutParty)),
            routeMasteryProof: Boolean(player.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
            journalProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.journalProof')),
            journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || 0)
          },
          SPIRIT_TECHNIQUE_LOADOUTS[0].id
        );

        if (loadout.prepared) {
          player.setVariable('mochiSocial.battle.techniqueLoadoutProof', true);
          player.setVariable('mochiSocial.battle.techniqueLoadout', loadout.loadoutId);
          player.setVariable('mochiSocial.battle.techniqueLoadoutName', loadout.loadoutName);
          player.setVariable('mochiSocial.battle.techniqueLoadoutScore', loadout.score);
          player.setVariable('mochiSocial.battle.techniqueLoadoutMoves', loadout.moves.map((entry) => `${entry.spiritId}:${entry.moveId}`));
          if (!player.getVariable<boolean>('mochiSocial.battle.loadoutSlipClaimed')) {
            player.addItem(ALPHA_ITEMS.loadoutSlip, 1);
            player.setVariable('mochiSocial.battle.loadoutSlipClaimed', true);
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

      player.showNotification(notification, { time: 1800, icon: 'technique-dojo' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: saveTitle }, { reason: 'auto', source: 'technique-dojo' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function TacticScrollStand(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('tactic-scroll-stand');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before studying a Mochirii tactic scroll.');
        return;
      }

      const spirit = MOCHI_SPIRITS.find((entry) => entry.id === activeSpirit);
      const lastMove = player.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`);
      const move = spirit?.battle.moves.find((entry) => entry.id === lastMove) || spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(player, 'The tactic scroll stand cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentXp = Number(player.getVariable<number>(xpKey) || 0);
      const currentBond = Number(player.getVariable<number>(bondKey) || 1);
      const tactic = resolveSpiritBattleTactic(activeSpirit, move.id, '', currentXp, currentBond);
      if (!tactic.ok) {
        showAlphaPrompt(player, tactic.message);
        return;
      }

      const nextBond = Math.min(5, currentBond + tactic.bondDelta);
      const nextGrowth = growthStageFromBond(nextBond);
      const nextLevel = techniqueMasteryLevelFromXp(tactic.masteryXp);
      player.setVariable(xpKey, tactic.masteryXp);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.${move.id}.level`, nextLevel);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.technique.lastMove`, move.id);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.last`, tactic.tacticId);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.lastMove`, tactic.moveId);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.stance`, tactic.stance);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.tactic.focusScore`, tactic.focusScore);
      player.setVariable('mochiSocial.battle.lastTacticScroll', tactic.tacticId);
      player.setVariable('mochiSocial.battle.tacticScrollProof', true);
      player.setVariable('mochiSocial.battle.tacticMasteryXp', tactic.masteryXp);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      player.showNotification('Tactic scroll studied', { time: 1800, icon: 'tactic-scroll-stand' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit tactic scroll practice' }, { reason: 'auto', source: 'tactic-scroll-stand' });
      showAlphaPrompt(player, `${tactic.message} Tactic scroll practice is no-injury alpha battle planning with no real value.`);
    }
  };
}

export function AffinityDais(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('affinity-dais');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before entering the Jade Mirror affinity trial.');
        return;
      }

      const spirit = MOCHI_SPIRITS.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(player, 'The affinity dais cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const trial = SPIRIT_AFFINITY_TRIALS[0];
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const xpKey = `mochiSocial.spirit.${activeSpirit}.technique.${move.id}.xp`;
      const winsKey = 'mochiSocial.battle.affinityTrialWins';
      const currentBond = Number(player.getVariable<number>(bondKey) || 1);
      const currentTechniqueXp = Number(player.getVariable<number>(xpKey) || 0);
      const currentWins = Number(player.getVariable<number>(winsKey) || 0);
      const affinity = resolveSpiritAffinityTrial(activeSpirit, move.id, trial.id, currentBond, currentTechniqueXp);
      const nextWins = currentWins + (affinity.victory ? 1 : 0);
      const nextBond = affinity.victory ? Math.min(5, currentBond + affinity.bondDelta) : currentBond;
      const nextGrowth = growthStageFromBond(nextBond);

      player.setVariable('mochiSocial.battle.lastAffinityTrial', affinity.trialId);
      player.setVariable('mochiSocial.battle.affinityTrialWins', nextWins);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.lastAffinityTrialMove`, move.id);
      player.setVariable(xpKey, affinity.masteryXp);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
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

      if (player.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')) {
        const concord = resolveSpiritHarmonyTrial(
          {
            partyIds: partyIds(player),
            harmonyFormProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')),
            harmonyFormId: player.getVariable<string>('mochiSocial.spirits.harmonyForm'),
            tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            affinityProof: nextWins > 0,
            sparLadderWins: Number(player.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0),
            profileViewed: Boolean(player.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(player.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: player.getVariable<string>('mochiSocial.social.statusMood'),
            chatLines: player.getVariable<string[]>('mochiSocial.social.chatLines') || []
          },
          SPIRIT_HARMONY_TRIALS[0].id
        );

        if (concord.cleared) {
          player.setVariable('mochiSocial.battle.harmonyTrialProof', true);
          player.setVariable('mochiSocial.battle.harmonyTrial', concord.trialId);
          player.setVariable('mochiSocial.battle.harmonyTrialName', concord.trialName);
          player.setVariable('mochiSocial.battle.harmonyTrialScore', concord.score);
          if (!player.getVariable<boolean>('mochiSocial.battle.concordTallyClaimed')) {
            player.addItem(ALPHA_ITEMS.concordTally, 1);
            player.setVariable('mochiSocial.battle.concordTallyClaimed', true);
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

      player.showNotification(notification, { time: 1800, icon: 'affinity-dais' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: saveTitle }, { reason: 'auto', source: 'affinity-dais' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function TrainingRing(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('training-ring');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before entering the Jade Lantern Court training ring.');
        return;
      }

      const spirit = MOCHI_SPIRITS.find((entry) => entry.id === activeSpirit);
      const move = spirit?.battle.moves[0];
      if (!spirit || !move) {
        showAlphaPrompt(player, 'The training ring cannot find a registered Mochirii spirit move for this alpha save.');
        return;
      }

      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const xpKey = `mochiSocial.spirit.${activeSpirit}.trainingXp`;
      const victoryKey = `mochiSocial.spirit.${activeSpirit}.trainingVictories`;
      const currentBond = Number(player.getVariable<number>(bondKey) || 1);
      const currentXp = Number(player.getVariable<number>(xpKey) || 0);
      const currentVictories = Number(player.getVariable<number>(victoryKey) || 0);
      const result = resolveSpiritTrainingBattle(activeSpirit, move.id, currentBond, currentVictories + 1);
      const sparParty = partyIds(player).length ? partyIds(player) : [activeSpirit];
      const priorSparWins = Number(player.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0);
      const spar = resolveSpiritSparLadder(sparParty, 'jade-echo-apprentice', bondMap(player, sparParty), priorSparWins);
      const battleRound = resolveSpiritBattleRound({
        partyIds: sparParty,
        activeSpiritId: activeSpirit,
        moveIdBySpiritId: { [activeSpirit]: move.id },
        bondBySpiritId: bondMap(player, sparParty),
        opponentId: spar.opponentId,
        tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
        harmonyFormProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.harmonyFormProof')),
        priorWins: priorSparWins
      });
      const nextXp = currentXp + result.trainingXp;
      const nextVictories = currentVictories + (result.victory ? 1 : 0);
      const nextSparXp = Number(player.getVariable<number>('mochiSocial.battle.sparLadderXp') || 0) + spar.trainingXp;
      const nextSparWins = priorSparWins + (spar.victory ? 1 : 0);
      const nextBond = result.victory ? Math.min(5, currentBond + result.bondDelta) : currentBond;
      const nextGrowth = growthStageFromBond(nextBond);

      player.setVariable(xpKey, nextXp);
      player.setVariable(victoryKey, nextVictories);
      player.setVariable('mochiSocial.battle.sparLadderXp', nextSparXp);
      player.setVariable('mochiSocial.battle.sparLadderWins', nextSparWins);
      player.setVariable('mochiSocial.battle.lastSparOpponent', spar.opponentId);
      player.setVariable('mochiSocial.battle.lastRound', battleRound.roundId);
      player.setVariable('mochiSocial.battle.lastRoundOpponent', battleRound.opponentId);
      player.setVariable('mochiSocial.battle.lastRoundFocusScore', battleRound.focusScore);
      player.setVariable('mochiSocial.battle.lastRoundOpponentScore', battleRound.opponentScore);
      player.setVariable('mochiSocial.battle.lastRoundVictory', battleRound.victory);
      player.setVariable('mochiSocial.battle.lastRoundNoInjury', battleRound.noInjury);
      player.setVariable('mochiSocial.battle.lastRoundParty', battleRound.partyIds);
      player.setVariable(
        'mochiSocial.battle.lastRoundTranscript',
        battleRound.participants.map((participant) => `${participant.name}:${participant.moveLabel}:${participant.focusContribution}`)
      );
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
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

      if (player.getVariable<boolean>('mochiSocial.battle.harmonyTrialProof')) {
        const matchParty = partyIds(player).length ? partyIds(player) : sparParty;
        const match = resolveSpiritTeamSparMatch(
          {
            partyIds: matchParty,
            harmonyTrialProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.harmonyTrialProof')),
            harmonyTrialId: player.getVariable<string>('mochiSocial.battle.harmonyTrial'),
            harmonyTrialScore: Number(player.getVariable<number>('mochiSocial.battle.harmonyTrialScore') || 0),
            routeMasteryProof: Boolean(player.getVariable<boolean>('mochiSocial.world.routeMasteryProof')),
            tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
            growthRiteProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.growthRiteProof')),
            questChainProof: completedQuestIds(player).length >= MOCHI_SPIRIT_QUESTS.length,
            trainingXp: Math.max(trainingXpTotal(player, matchParty), nextXp),
            sparLadderWins: nextSparWins,
            chatLines: player.getVariable<string[]>('mochiSocial.social.chatLines') || []
          },
          SPIRIT_TEAM_SPAR_MATCHES[0].id
        );

        if (match.cleared) {
          player.setVariable('mochiSocial.battle.teamSparMatchProof', true);
          player.setVariable('mochiSocial.battle.teamSparMatch', match.matchId);
          player.setVariable('mochiSocial.battle.teamSparMatchName', match.matchName);
          player.setVariable('mochiSocial.battle.teamSparMatchScore', match.score);
          if (!player.getVariable<boolean>('mochiSocial.battle.teamMatchRibbonClaimed')) {
            player.addItem(ALPHA_ITEMS.teamMatchRibbon, 1);
            player.setVariable('mochiSocial.battle.teamMatchRibbonClaimed', true);
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
              techniqueMasteryXp: techniqueMasteryXpTotal(player, match.partyIds),
              tacticMasteryXp: Number(player.getVariable<number>('mochiSocial.battle.tacticMasteryXp') || 0),
              raisingCareStreak: careStreakTotal(player, match.partyIds),
              profileViewed: Boolean(player.getVariable<boolean>('mochiSocial.social.profileViewed')),
              guildBuddyProof: Boolean(player.getVariable<boolean>('mochiSocial.social.guildBuddyProof'))
            },
            SPIRIT_MENTOR_CHALLENGES[0].id
          );

          if (mentor.cleared) {
            player.setVariable('mochiSocial.battle.mentorChallengeProof', true);
            player.setVariable('mochiSocial.battle.mentorChallenge', mentor.challengeId);
            player.setVariable('mochiSocial.battle.mentorChallengeName', mentor.challengeName);
            player.setVariable('mochiSocial.battle.mentorChallengeScore', mentor.score);
            if (!player.getVariable<boolean>('mochiSocial.battle.mentorSealClaimed')) {
              player.addItem(ALPHA_ITEMS.mentorSeal, 1);
              player.setVariable('mochiSocial.battle.mentorSealClaimed', true);
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
                techniqueLoadoutProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.techniqueLoadoutProof')),
                techniqueLoadoutId: player.getVariable<string>('mochiSocial.battle.techniqueLoadout'),
                battleRoundProof: battleRound.victory,
                battleRoundVictory: battleRound.victory,
                growthRiteProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.growthRiteProof')),
                careStreak: careStreakTotal(player, mentor.partyIds),
                journalProof: Boolean(player.getVariable<boolean>('mochiSocial.spirits.journalProof')),
                journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
                bondBySpiritId: bondMap(player, mentor.partyIds)
              },
              SPIRIT_TRAIT_ATTUNEMENTS[0].id
            );

            if (trait.unlocked) {
              player.setVariable('mochiSocial.spirits.traitAttunementProof', true);
              player.setVariable('mochiSocial.spirits.traitAttunement', trait.traitId);
              player.setVariable('mochiSocial.spirits.traitAttunementName', trait.traitName);
              player.setVariable('mochiSocial.spirits.traitAttunementScore', trait.score);
              player.setVariable(`mochiSocial.spirit.${trait.activeSpiritId}.traitProof`, true);
              player.setVariable(`mochiSocial.spirit.${trait.activeSpiritId}.trait`, trait.traitLabel);
              if (!player.getVariable<boolean>('mochiSocial.spirits.traitThreadClaimed')) {
                player.addItem(ALPHA_ITEMS.traitThread, 1);
                player.setVariable('mochiSocial.spirits.traitThreadClaimed', true);
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
            }
          }
          if (!mentor.cleared) {
            notification = 'Team match cleared';
            saveTitle = 'Mochi Spirit team match';
            prompt = `Training spar complete: ${result.message} ${spar.message} ${battleRound.message} ${match.message} The Jade Mirror Match Ribbon is no-real-value closed-alpha battle proof.`;
          }
        }
      }

      player.showNotification(notification, { time: 1800, icon: 'training-ring' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: saveTitle }, { reason: 'auto', source: 'training-ring' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function QuestBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('quest-board');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      const completedQuestChainIds = completedQuestIds(player);
      if (completedQuestChainIds.length >= MOCHI_SPIRIT_QUESTS.length) {
        if (player.getVariable<boolean>('mochiSocial.guild.commissionKnotClaimed')) {
          showAlphaPrompt(player, 'Your Jade Court Commission Ledger is already recorded for this alpha save. Guild reputation remains no-real-value.');
          return;
        }

        const commission = resolveGuildCommission(
          {
            roster,
            activeSpiritId: activeSpiritId(player),
            journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || roster.length),
            questChainProof: true,
            completedQuestIds: completedQuestChainIds,
            provisionProof: Boolean(player.getVariable<boolean>('mochiSocial.alpha.provisionSatchelProof')),
            provisionSatchelId: player.getVariable<string>('mochiSocial.alpha.provisionSatchel'),
            marketProof: Boolean(player.getVariable<boolean>('mochiSocial.alpha.charmListed')),
            tradeProof: Boolean(player.getVariable<boolean>('mochiSocial.alpha.tradeProof')),
            trainingXp: trainingXpTotal(player, roster),
            profileViewed: Boolean(player.getVariable<boolean>('mochiSocial.social.profileViewed')),
            guildBuddyProof: Boolean(player.getVariable<boolean>('mochiSocial.social.guildBuddyProof')),
            statusMood: player.getVariable<string>('mochiSocial.social.statusMood'),
            chatLines: []
          },
          GUILD_COMMISSIONS[0].id
        );

        if (!commission.completed) {
          showAlphaPrompt(player, commission.message);
          return;
        }

        player.setVariable('mochiSocial.guild.commissionProof', true);
        player.setVariable('mochiSocial.guild.commission', commission.commissionId);
        player.setVariable('mochiSocial.guild.commissionName', commission.commissionName);
        player.setVariable('mochiSocial.guild.commissionScore', commission.score);
        player.setVariable('mochiSocial.guild.commissionCompletedQuests', commission.completedQuestIds);
        player.addItem(ALPHA_ITEMS.commissionKnot, 1);
        player.setVariable('mochiSocial.guild.commissionKnotClaimed', true);
        player.showNotification('Guild commission recorded', { time: 1800, icon: 'quest-board' });
        emitAlphaHudState(player, {
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
        await player.save('auto', { title: 'Mochirii guild commission' }, { reason: 'auto', source: 'quest-board' });
        showAlphaPrompt(player, `${commission.message} The Jade Court Commission Knot is no-real-value closed-alpha guild reputation proof.`);
        return;
      }

      const quest = selectQuestBoardQuest(player);
      const requiredSpiritId = quest.requiredSpiritId || activeSpiritId(player);
      const rewardSpiritId = requiredSpiritId && roster.includes(requiredSpiritId) ? requiredSpiritId : activeSpiritId(player);
      if (!requiredSpiritId || !roster.includes(requiredSpiritId)) {
        const spiritName = MOCHI_SPIRITS.find((entry) => entry.id === requiredSpiritId)?.name || requiredSpiritId || 'a Mochi Spirit';
        showAlphaPrompt(player, `${quest.title} is posted on the Mochirii quest board. Bond with ${spiritName} before recording this guild step.`);
        return;
      }

      const stepsKey = `mochiSocial.quest.${quest.id}.steps`;
      const rewardKey = `mochiSocial.quest.${quest.id}.rewardClaimed`;
      const nextCompleted = [...questSteps(player, quest.id)];
      const nextStep = quest.steps.find((step) => !nextCompleted.includes(step));
      if (nextStep) {
        nextCompleted.push(nextStep);
      }

      player.setVariable('mochiSocial.quest.active', quest.id);
      player.setVariable(stepsKey, nextCompleted);
      const nextCompletedQuestIds = completedQuestIds(player);
      const nextQuest = MOCHI_SPIRIT_QUESTS.find((entry) => {
        return !nextCompletedQuestIds.includes(entry.id) && (!entry.requiredSpiritId || roster.includes(entry.requiredSpiritId));
      });

      const patch: AlphaHudStatePatch = {
        quest: {
          id: quest.id,
          completedSteps: nextCompleted,
          completedQuestIds: nextCompletedQuestIds,
          chainComplete: nextCompletedQuestIds.length >= MOCHI_SPIRIT_QUESTS.length,
          nextQuestId: nextCompleted.length >= quest.steps.length ? nextQuest?.id : undefined,
          message: nextCompleted.length >= quest.steps.length
            ? `${quest.title} complete. ${nextCompletedQuestIds.length}/${MOCHI_SPIRIT_QUESTS.length} Mochirii quest postings complete.`
            : `${quest.title} ${nextCompleted.length}/${quest.steps.length}`
        }
      };
      let prompt = `${quest.title}: ${nextCompleted.length}/${quest.steps.length} guild steps recorded. This is no-real-value alpha quest progress.`;

      if (nextCompleted.length >= quest.steps.length && !player.getVariable<boolean>(rewardKey)) {
        player.setVariable(rewardKey, true);
        player.setVariable('mochiSocial.quest.completed', nextCompletedQuestIds);
        const bondKey = `mochiSocial.spirit.${rewardSpiritId}.bond`;
        const nextBond = Math.min(5, Number(player.getVariable<number>(bondKey) || 1) + quest.rewardBond);
        const nextGrowth = growthStageFromBond(nextBond);
        player.setVariable(bondKey, nextBond);
        player.setVariable(`mochiSocial.spirit.${rewardSpiritId}.growth`, nextGrowth);
        patch.spirit = { id: rewardSpiritId, bond: nextBond, growth: nextGrowth };
        const spiritName = MOCHI_SPIRITS.find((entry) => entry.id === rewardSpiritId)?.name || rewardSpiritId;
        prompt = `${quest.title} complete. Guild reward recorded as no-real-value alpha progress; ${spiritName} is now ${nextGrowth} bond ${nextBond}/5.`;
        if (nextCompletedQuestIds.length >= MOCHI_SPIRIT_QUESTS.length) {
          prompt = `${prompt} The first Mochirii quest chain is complete for closed-alpha testers.`;
        }
      }

      player.showNotification(nextCompleted.length >= quest.steps.length ? 'Quest complete' : 'Quest step recorded', { time: 1800, icon: 'quest-board' });
      emitAlphaHudState(player, patch);
      await player.save('auto', { title: 'Mochirii quest board progress' }, { reason: 'auto', source: 'quest-board' });
      showAlphaPrompt(player, prompt);
    }
  };
}

export function GuildRankBell(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('guild-rank-bell');
    },

    async onAction(player: RpgPlayer) {
      const roster = bondedSpirits(player);
      const activeSpirit = activeSpiritId(player);
      const trial = GUILD_RANK_TRIALS[0];
      const completedQuestSteps = MOCHI_SPIRIT_QUESTS.flatMap((quest) => questSteps(player, quest.id));
      const bond = activeSpirit ? Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1) : 0;
      const rank = resolveGuildRankTrial(
        {
          roster,
          activeSpiritId: activeSpirit,
          bond,
          completedQuestSteps,
          tacticProof: Boolean(player.getVariable<boolean>('mochiSocial.battle.tacticScrollProof')),
          affinityWins: Number(player.getVariable<number>('mochiSocial.battle.affinityTrialWins') || 0),
          sparWins: Number(player.getVariable<number>('mochiSocial.battle.sparLadderWins') || 0),
          journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || roster.length)
        },
        trial.id
      );

      if (!rank.passed) {
        showAlphaPrompt(player, rank.message);
        return;
      }

      player.setVariable('mochiSocial.guild.rankTrialProof', true);
      player.setVariable('mochiSocial.guild.rankTrial', rank.trialId);
      player.setVariable('mochiSocial.guild.rankTitle', rank.rankTitle);
      player.setVariable('mochiSocial.guild.rankScore', rank.score);
      if (!player.getVariable<boolean>('mochiSocial.guild.rankSealClaimed')) {
        player.addItem(ALPHA_ITEMS.rankSeal, 1);
        player.setVariable('mochiSocial.guild.rankSealClaimed', true);
      }

      player.showNotification('Guild rank recorded', { time: 1800, icon: 'guild-rank-bell' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochirii guild rank trial' }, { reason: 'auto', source: 'guild-rank-bell' });
      showAlphaPrompt(player, `${rank.message} Guild rank is closed-alpha, no-real-value progression for tester coordination.`);
    }
  };
}

export function GrowthMoonwell(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('growth-moonwell');
    },

    async onAction(player: RpgPlayer) {
      const activeSpirit = activeSpiritId(player);
      if (!activeSpirit) {
        showAlphaPrompt(player, 'Attune with a Mochi Spirit before opening the Moonwell Bloom Rite.');
        return;
      }

      const rite = SPIRIT_GROWTH_RITES[0];
      const bond = Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.bond`) || 1);
      const growth = player.getVariable<string>(`mochiSocial.spirit.${activeSpirit}.growth`) || growthStageFromBond(bond);
      const trainingXp = Number(player.getVariable<number>(`mochiSocial.spirit.${activeSpirit}.trainingXp`) || 0);
      const riteResult = resolveSpiritGrowthRite(
        {
          spiritId: activeSpirit,
          bond,
          growth,
          trainingXp,
          raisingProof: Boolean(player.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.raisingProof`)),
          rankTrialProof: Boolean(player.getVariable<boolean>('mochiSocial.guild.rankTrialProof')),
          rankTrialId: player.getVariable<string>('mochiSocial.guild.rankTrial')
        },
        rite.id
      );

      if (!riteResult.passed) {
        showAlphaPrompt(player, riteResult.message);
        return;
      }

      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growthRiteProof`, true);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growthRite`, riteResult.riteId);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growthForm`, riteResult.formTitle);
      if (!player.getVariable<boolean>(`mochiSocial.spirit.${activeSpirit}.growthSigilClaimed`)) {
        player.addItem(ALPHA_ITEMS.growthSigil, 1);
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.growthSigilClaimed`, true);
      }

      player.showNotification('Growth rite opened', { time: 1800, icon: 'growth-moonwell' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit growth rite' }, { reason: 'auto', source: 'growth-moonwell' });
      showAlphaPrompt(player, `${riteResult.message} Growth rites are closed-alpha, no-real-value spirit progression.`);
    }
  };
}

export function MarketBoard(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('market-board');
    },

    async onAction(player: RpgPlayer) {
      if (!player.getVariable<boolean>('mochiSocial.alpha.charmListed')) {
        player.addItem(ALPHA_ITEMS.charm, 1);
        player.setVariable('mochiSocial.alpha.charmListed', true);
        player.showNotification('Fixed listing proof', { time: 1800, icon: 'market-board' });
        emitAlphaHudState(player, { charmListed: true });
        await player.save('auto', { title: 'Alpha market proof' }, { reason: 'auto', source: 'market-board' });
        showAlphaPrompt(player, 'You listed a Jade Thread Charm for test soft currency. This proves fixed-price market flow without real value.');
        return;
      }

      if (player.getVariable<boolean>('mochiSocial.alpha.provisionSatchelClaimed')) {
        showAlphaPrompt(player, 'Your Jade Court Provision Satchel is already stocked for this alpha save. Item prep remains no-real-value.');
        return;
      }

      const roster = bondedSpirits(player);
      const satchel = resolveSpiritProvisionSatchel(
        {
          roster,
          activeSpiritId: activeSpiritId(player),
          journalDiscoveredCount: Number(player.getVariable<number>('mochiSocial.spirits.journalCount') || 0),
          marketProof: true,
          tradeProof: Boolean(player.getVariable<boolean>('mochiSocial.alpha.tradeProof')),
          routeInviteProof: Boolean(player.getVariable<boolean>('mochiSocial.world.routeInvitationProof')),
          careStreak: careStreakTotal(player, roster),
          completedQuestIds: completedQuestIds(player)
        },
        SPIRIT_PROVISION_SATCHELS[0].id
      );

      if (!satchel.stocked) {
        showAlphaPrompt(player, satchel.message);
        return;
      }

      player.setVariable('mochiSocial.alpha.provisionSatchelProof', true);
      player.setVariable('mochiSocial.alpha.provisionSatchel', satchel.satchelId);
      player.setVariable('mochiSocial.alpha.provisionSatchelName', satchel.satchelName);
      player.setVariable('mochiSocial.alpha.provisionScore', satchel.score);
      player.setVariable('mochiSocial.alpha.provisionStockItems', satchel.stockItemIds);
      player.addItem(ALPHA_ITEMS.mooncakeBox, 1);
      player.addItem(ALPHA_ITEMS.provisionSatchel, 1);
      player.setVariable('mochiSocial.alpha.provisionSatchelClaimed', true);
      player.showNotification('Provision satchel stocked', { time: 1800, icon: 'market-board' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochirii provision satchel stocked' }, { reason: 'auto', source: 'market-board' });
      showAlphaPrompt(player, `${satchel.message} The Jade Court Provision Satchel is no-real-value closed-alpha item preparation proof.`);
    }
  };
}

export function TradePost(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('trade-post');
    },

    async onAction(player: RpgPlayer) {
      player.setVariable('mochiSocial.alpha.tradeProof', true);
      player.showNotification('Direct trade proof', { time: 1800, icon: 'trade-post' });
      emitAlphaHudState(player, { tradeProof: true });
      await player.save('auto', { title: 'Alpha trade proof' }, { reason: 'auto', source: 'trade-post' });
      showAlphaPrompt(player, 'Direct trade proof recorded. Alpha direct trades stay eligible-assets-only and no-real-value.');
    }
  };
}

export function CanaryShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('canary-shrine');
    },

    async onAction(player: RpgPlayer) {
      if (!bondedSpirits(player).includes('lirabao')) {
        showAlphaPrompt(player, 'The Canary shrine responds to Lirabao certificates first. Bond with Lirabao before staging this proof.');
        return;
      }

      if (!player.getVariable<boolean>('mochiSocial.alpha.canaryCertificateRequested')) {
        player.addItem(ALPHA_ITEMS.certificate, 1);
        player.setVariable('mochiSocial.alpha.canaryCertificateRequested', true);
      }
      player.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
      emitAlphaHudState(player, { canaryRequested: true });
      await player.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
      showAlphaPrompt(
        player,
        'A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.'
      );
    }
  };
}

export function GuildSealChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(player: RpgPlayer) {
      if (player.getVariable<boolean>('mochiSocial.guildSealClaimed')) {
        showAlphaPrompt(player, 'The chest is empty. Your Mochirii Guild Seal is already tucked away.');
        return;
      }

      player.addItem(ALPHA_ITEMS.guildSeal, 1);
      player.setVariable('mochiSocial.guildSealClaimed', true);
      player.showNotification('Guild Seal added', { time: 1800, icon: 'chest' });
      emitAlphaHudState(player, { sealClaimed: true });
      await player.save('auto', { title: 'Mochirii first guild seal' }, { reason: 'auto', source: 'guild-seal-chest' });
      showAlphaPrompt(player, 'You found a Mochirii Guild Seal. The server saved this little milestone.');
    }
  };
}
