import { PrebuiltGui } from '@rpgjs/common';
import type { EventDefinition, RpgPlayer } from '@rpgjs/server';
import {
  ALPHA_ITEMS,
  GUILD_RANK_TRIALS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_AFFINITY_TRIALS,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HARMONY_FORMS,
  growthStageFromBond,
  techniqueMasteryLevelFromXp,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleTactic,
  resolveSpiritCapture,
  resolveSpiritExpedition,
  resolveGuildRankTrial,
  resolveSpiritGrowthRite,
  resolveSpiritHarmonyForm,
  resolveSpiritJournal,
  resolveSpiritParty,
  resolveSpiritRaisingAction,
  resolveSpiritRouteMastery,
  resolveSpiritRouteInvitation,
  resolveSpiritSparLadder,
  resolveSpiritTechniqueMastery,
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

      const spirit = MOCHI_SPIRITS.find((entry) => entry.id === activeSpirit);
      const need = spirit?.raisingNeeds[0];
      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentBond = Number(player.getVariable<number>(bondKey) || 1);
      const raising = need ? resolveSpiritRaisingAction(activeSpirit, need.id, currentBond) : null;
      const nextBond = raising?.ok ? raising.bond : Math.min(5, currentBond + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      if (need) {
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.raisingProof`, true);
        player.setVariable(`mochiSocial.spirit.${activeSpirit}.lastCareNeed`, need.id);
      }
      player.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(player, {
        raising: need
          ? {
              needId: need.id,
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
      player.showNotification('Journal updated', { time: 1800, icon: 'journal-pavilion' });
      emitAlphaHudState(player, {
        journal: {
          activeSpiritId: journal.activeSpiritId,
          discoveredCount: journal.discoveredCount,
          totalCount: journal.totalCount,
          proof: true,
          message: journal.message
        }
      });
      await player.save('auto', { title: 'Mochi Spirit journal reviewed' }, { reason: 'auto', source: 'journal-pavilion' });
      showAlphaPrompt(player, `${journal.message} The journal records habitat, rarity, temperament, role, and care notes as no-real-value alpha lore.`);
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
      player.showNotification('Technique refined', { time: 1800, icon: 'technique-dojo' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit technique practice' }, { reason: 'auto', source: 'technique-dojo' });
      showAlphaPrompt(player, `${technique.message} Technique mastery is no-injury alpha progression with no real value.`);
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
      player.showNotification(affinity.victory ? 'Affinity trial cleared' : 'Affinity trial studied', { time: 1800, icon: 'affinity-dais' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit affinity trial' }, { reason: 'auto', source: 'affinity-dais' });
      showAlphaPrompt(player, `${affinity.message} Affinity trials are no-injury alpha battle practice with no real value.`);
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
      player.setVariable(bondKey, nextBond);
      player.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      player.showNotification('Training spar complete', { time: 1800, icon: 'training-ring' });
      emitAlphaHudState(player, {
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
      await player.save('auto', { title: 'Mochi Spirit training spar' }, { reason: 'auto', source: 'training-ring' });
      showAlphaPrompt(player, `Training spar complete: ${result.message} ${spar.message} Training is no-injury guild practice with no real value.`);
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

      showAlphaPrompt(player, 'Your Jade Thread Charm listing proof is already recorded for this alpha save.');
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
