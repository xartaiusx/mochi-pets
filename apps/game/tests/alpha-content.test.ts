import { describe, expect, it } from 'vitest';
import {
  ALPHA_ITEMS,
  GUILD_ASCENSION_TRIALS,
  GUILD_INSIGNIA_CASES,
  GUILD_WAYFARER_CHRONICLES,
  MOCHI_STORY_CHAPTERS,
  MOCHI_SPIRITS,
  MOCHI_SPIRIT_QUESTS,
  SPIRIT_BLOOM_ASCENDANCES,
  SPIRIT_BOND_MILESTONES,
  SPIRIT_CARE_CYCLES,
  SPIRIT_CAPTURE_RITES,
  SPIRIT_AFFINITY_MATRICES,
  SPIRIT_CRAFT_WRITS,
  SPIRIT_ENCOUNTER_ATLASES,
  SPIRIT_EXPEDITION_ROUTES,
  SPIRIT_FIELD_ACCORDS,
  SPIRIT_FIELD_ALMANACS,
  SPIRIT_HABITATS,
  SPIRIT_MOVES,
  SPIRIT_KINSHIP_ALBUMS,
  SPIRIT_LINEAGE_REGISTERS,
  SPIRIT_NURTURE_RITES,
  SPIRIT_NURSERY_GROVES,
  SPIRIT_RECOVERY_TEAS,
  SPIRIT_RIVAL_CIRCLES,
  SPIRIT_ROUTE_ECOLOGY_SURVEYS,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_ROUTE_PATROLS,
  SPIRIT_ROUTE_WAYSTONES,
  SPIRIT_ROSTER_ARCHIVES,
  SPIRIT_SANCTUARY_RITES,
  SPIRIT_TEMPERAMENT_CONCORDS,
  SPIRIT_TECHNIQUE_CODEXES,
  SPIRIT_TOURNAMENT_BRACKETS,
  TRADE_EXCHANGE_ACCORDS,
  growthStageFromBond,
  resolveGuildCommission,
  resolveGuildAscensionTrial,
  resolveGuildInsigniaCase,
  resolveGuildRankTrial,
  resolveGuildSocialRally,
  resolveGuildWayfarerChronicle,
  resolveMochiStoryChapter,
  resolveMochiSpiritQuestProgress,
  resolveSpiritAffinityMatrix,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleRound,
  resolveSpiritBloomAscendance,
  resolveSpiritBondMilestone,
  resolveSpiritCapture,
  resolveSpiritCaptureRite,
  resolveSpiritCareCycle,
  resolveSpiritCompendiumCompletion,
  resolveSpiritConditionWeave,
  resolveSpiritCraftWrit,
  resolveSpiritEncounterAtlas,
  resolveSpiritExpedition,
  resolveSpiritFieldAccord,
  resolveSpiritFieldAlmanac,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritJournal,
  resolveSpiritMentorChallenge,
  resolveSpiritKinshipAlbum,
  resolveSpiritLineageRegister,
  resolveSpiritNurtureRite,
  resolveSpiritNurseryGrove,
  resolveSpiritParty,
  resolveSpiritProvisionSatchel,
  resolveSpiritRecoveryTea,
  resolveSpiritResearchFolio,
  resolveSpiritRivalCircle,
  resolveSpiritRouteInvitation,
  resolveSpiritRouteEcologySurvey,
  resolveSpiritRouteWaystone,
  resolveSpiritRouteMastery,
  resolveSpiritRoutePatrol,
  resolveSpiritRosterArchive,
  resolveSpiritSanctuaryRite,
  resolveSpiritSparLadder,
  resolveSpiritTeamSparMatch,
  resolveSpiritTemperamentConcord,
  resolveSpiritTechniqueCodex,
  resolveSpiritTechniqueLoadout,
  resolveSpiritTechniqueMastery,
  resolveSpiritTournamentBracket,
  resolveSpiritTraitAttunement,
  resolveTradeExchangeAccord
} from '../src/alpha/content';

const fullRoster = ['lirabao', 'jintari', 'aozhen'] as const;
const firstRouteIds = SPIRIT_EXPEDITION_ROUTES.map((route) => route.id);
const completedQuestIds = MOCHI_SPIRIT_QUESTS.map((quest) => quest.id);
const fullBondMap = { lirabao: 5, jintari: 4, aozhen: 3 };
const preferredMoveIdBySpiritId = {
  lirabao: SPIRIT_MOVES.lanternPulse.id,
  jintari: SPIRIT_MOVES.goldleafFeint.id,
  aozhen: SPIRIT_MOVES.skybellGuard.id
};

type QuestChainState = {
  roster: readonly string[];
  activeQuestId?: string;
  completedQuestIds: string[];
  questStepsById: Record<string, readonly string[]>;
};

describe('Mochi Spirits alpha content contract', () => {
  it('keeps the canonical first-court spirits original, ledgered, and certificate-scoped', () => {
    expect(MOCHI_SPIRITS.map((spirit) => spirit.id)).toEqual([...fullRoster]);
    expect(MOCHI_SPIRITS.map((spirit) => spirit.name)).toEqual(['Lirabao', 'Jintari', 'Aozhen']);
    expect(MOCHI_SPIRITS.map((spirit) => spirit.sprite)).toEqual([
      'spirit-lirabao',
      'spirit-jintari',
      'spirit-aozhen'
    ]);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.habitat === SPIRIT_HABITATS.jadeLanternCourt)).toBe(true);
    expect(MOCHI_SPIRITS.map((spirit) => spirit.certificateEligible)).toEqual([true, false, false]);
    expect(ALPHA_ITEMS.certificate).toMatchObject({
      id: 'lirabao-canary-certificate',
      name: 'Lirabao Canary Certificate'
    });

    const allItemText = Object.values(ALPHA_ITEMS).map((item) => `${item.id} ${item.name} ${item.description}`).join('\n');
    expect(allItemText).toContain('no-real-value');
  });

  it('keeps Mochi Spirit bond milestones unique, staged, and original to the Jade Lantern Court', () => {
    const milestoneIds = MOCHI_SPIRITS.flatMap((spirit) => spirit.bondMilestones.map((milestone) => milestone.id));
    const milestoneLabels = MOCHI_SPIRITS.flatMap((spirit) => spirit.bondMilestones.map((milestone) => milestone.label));

    expect(milestoneIds).toHaveLength(9);
    expect(new Set(milestoneIds).size).toBe(9);
    expect(new Set(milestoneLabels).size).toBe(9);
    expect(Object.values(SPIRIT_BOND_MILESTONES).map((milestone) => milestone.id).sort()).toEqual([...milestoneIds].sort());
    expect(MOCHI_SPIRITS.every((spirit) => spirit.bondMilestones.map((milestone) => milestone.requiredBond).join(',') === '1,3,5')).toBe(true);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.bondMilestones.map((milestone) => milestone.requiredGrowth).join(',') === 'seed,sprout,glow')).toBe(true);

    expect(resolveSpiritBondMilestone('lirabao', 5, 'glow')).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      milestone: expect.objectContaining({
        id: 'lirabao-moonwell-glow',
        label: 'Moonwell Companion Glow'
      }),
      nextMilestone: undefined,
      source: 'spirit-bond-milestone'
    });

    expect(resolveSpiritBondMilestone('jintari', 3, 'sprout')).toMatchObject({
      ok: true,
      milestone: expect.objectContaining({
        id: 'jintari-trade-step',
        label: 'Generous Trade Step'
      }),
      nextMilestone: expect.objectContaining({
        id: 'jintari-lacquer-glow'
      })
    });

    expect(resolveSpiritBondMilestone('aozhen', 0)).toMatchObject({
      ok: false,
      nextMilestone: expect.objectContaining({
        id: 'aozhen-skybell-spark'
      }),
      source: 'spirit-bond-milestone'
    });
  });

  it('gates capture, route scouting, field accords, route invitations, and journal discovery by original Mochirii rules', () => {
    expect(resolveSpiritCapture('aozhen', ALPHA_ITEMS.harmonyTea.id, 3, [])).toMatchObject({
      ok: false,
      spiritId: 'aozhen',
      bond: 0
    });

    const captured = resolveSpiritCapture('aozhen', ALPHA_ITEMS.harmonyTea.id, 4, []);
    expect(captured).toMatchObject({
      ok: true,
      alreadyRostered: false,
      spiritId: 'aozhen',
      bond: 1,
      growth: 'seed',
      source: 'spirit-capture'
    });
    expect(captured.message).toContain('Skybell Vow Invitation');

    expect(SPIRIT_CAPTURE_RITES[0]).toMatchObject({
      id: 'jade-court-capture-rite',
      rewardItemId: ALPHA_ITEMS.captureRiteTally.id,
      requiredScore: 38
    });

    const captureRite = resolveSpiritCaptureRite({
      roster: [...fullRoster],
      capturedSpiritIds: [...fullRoster],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      lureItemIds: [ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.charm.id],
      journalDiscoveredCount: 3,
      localPresenceCount: 2,
      captureProof: true,
      routeInviteProof: true,
      fieldAccordProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Capture rite test proof.']
    });
    expect(captureRite).toMatchObject({
      recorded: true,
      riteId: 'jade-court-capture-rite',
      riteName: 'Jade Capture Rite',
      score: 51,
      requiredScore: 38,
      rewardItemId: ALPHA_ITEMS.captureRiteTally.id,
      source: 'spirit-capture-rite'
    });
    expect(captureRite.message).toContain('No real value');

    const blockedCaptureRite = resolveSpiritCaptureRite({
      roster: ['lirabao'],
      capturedSpiritIds: ['lirabao'],
      routeInvitedSpiritIds: [],
      lureItemIds: [ALPHA_ITEMS.harmonyTea.id],
      journalDiscoveredCount: 1,
      localPresenceCount: 1,
      captureProof: true,
      routeInviteProof: false,
      fieldAccordProof: false,
      battleRoundProof: false,
      battleRoundVictory: false,
      profileViewed: false,
      guildBuddyProof: false,
      statusMood: 'exploring',
      chatLines: []
    });
    expect(blockedCaptureRite.recorded).toBe(false);
    expect(blockedCaptureRite.missing).toEqual(expect.arrayContaining([
      'captured:1/3',
      'route-invites:0/2',
      'presence:1/2',
      'field-accord',
      'no-injury-battle'
    ]));

    const firstScout = resolveSpiritExpedition('moonbridge-bamboo-trail', ['lirabao'], 'lirabao', 2, []);
    expect(firstScout).toMatchObject({
      ok: true,
      routeId: 'moonbridge-bamboo-trail',
      routeName: 'Moonbridge Bamboo Trail',
      encounterSpiritId: 'jintari',
      recommendedItemId: ALPHA_ITEMS.charm.id,
      discoveredRoutes: ['moonbridge-bamboo-trail']
    });

    const blockedInvite = resolveSpiritRouteInvitation('cloudbell-reed-bank', ALPHA_ITEMS.harmonyTea.id, 4, ['lirabao'], ['moonbridge-bamboo-trail']);
    expect(blockedInvite).toMatchObject({
      ok: false,
      routeId: 'cloudbell-reed-bank',
      spiritId: 'aozhen'
    });
    expect(blockedInvite.message).toContain('Scout the Cloudbell Reed Bank');

    const blockedWithoutAccord = resolveSpiritRouteInvitation('cloudbell-reed-bank', ALPHA_ITEMS.harmonyTea.id, 4, ['lirabao', 'jintari'], firstRouteIds);
    expect(blockedWithoutAccord).toMatchObject({
      ok: false,
      routeId: 'cloudbell-reed-bank',
      spiritId: 'aozhen'
    });
    expect(blockedWithoutAccord.message).toContain('field accord');

    expect(SPIRIT_FIELD_ACCORDS.map((accord) => accord.id)).toEqual([
      'moonbridge-goldleaf-accord',
      'cloudbell-skyvow-accord'
    ]);

    const moonbridgeAccord = resolveSpiritFieldAccord({
      routeId: 'moonbridge-bamboo-trail',
      roster: ['lirabao'],
      activeSpiritId: 'lirabao',
      discoveredRoutes: ['moonbridge-bamboo-trail'],
      harmonyScore: 3,
      bondBySpiritId: { lirabao: 2 },
      journalDiscoveredCount: 1
    });
    expect(moonbridgeAccord).toMatchObject({
      cleared: true,
      accordId: 'moonbridge-goldleaf-accord',
      targetSpiritId: 'jintari',
      rewardItemId: ALPHA_ITEMS.fieldAccordTalisman.id,
      source: 'spirit-field-accord'
    });
    expect(moonbridgeAccord.message).toContain('No-injury field accord');

    const cloudbellAccord = resolveSpiritFieldAccord({
      routeId: 'cloudbell-reed-bank',
      roster: ['lirabao', 'jintari'],
      activeSpiritId: 'jintari',
      discoveredRoutes: firstRouteIds,
      harmonyScore: 5,
      bondBySpiritId: { lirabao: 3, jintari: 3 },
      tacticProof: true,
      affinityProof: true,
      journalDiscoveredCount: 3
    });
    expect(cloudbellAccord).toMatchObject({
      cleared: true,
      accordId: 'cloudbell-skyvow-accord',
      targetSpiritId: 'aozhen',
      score: 22,
      requiredScore: 12
    });

    const routeInvite = resolveSpiritRouteInvitation('cloudbell-reed-bank', ALPHA_ITEMS.harmonyTea.id, 4, ['lirabao', 'jintari'], firstRouteIds, true);
    expect(routeInvite).toMatchObject({
      ok: true,
      alreadyRostered: false,
      routeId: 'cloudbell-reed-bank',
      spiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      source: 'spirit-route-invite'
    });
    expect(routeInvite.message).toContain('joins your Mochirii roster by consent');

    expect(SPIRIT_ROUTE_PATROLS.map((patrol) => patrol.id)).toEqual(['jade-cloudbell-patrol']);
    const blockedPatrol = resolveSpiritRoutePatrol({
      routeId: 'cloudbell-reed-bank',
      partyIds: fullRoster,
      localPresenceCount: 1,
      routeMasteryProof: true,
      routeMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 12,
      battleRoundOpponentScore: 8,
      chatLines: ['Local patrol proof.']
    });
    expect(blockedPatrol).toMatchObject({
      patrolled: false,
      patrolId: 'jade-cloudbell-patrol',
      missing: ['presence:1/2']
    });

    const patrol = resolveSpiritRoutePatrol({
      routeId: 'cloudbell-reed-bank',
      partyIds: fullRoster,
      localPresenceCount: 2,
      routeMasteryProof: true,
      routeMasteryId: SPIRIT_ROUTE_MASTERIES[0].id,
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 18,
      battleRoundOpponentScore: 8,
      harmonyFormProof: true,
      teamSparMatchProof: true,
      mentorChallengeProof: true,
      chatLines: ['Local patrol proof.']
    });
    expect(patrol).toMatchObject({
      patrolled: true,
      patrolId: 'jade-cloudbell-patrol',
      patrolName: 'Jade Cloudbell Patrol',
      routeId: 'cloudbell-reed-bank',
      localPresenceCount: 2,
      score: 33,
      requiredScore: 24,
      rewardItemId: ALPHA_ITEMS.routePatrolPennant.id,
      source: 'world-route-patrol'
    });
    expect(patrol.message).toContain('No real value');

    const journal = resolveSpiritJournal(fullRoster, 'aozhen', fullBondMap, { lirabao: 'glow', jintari: 'sprout', aozhen: 'sprout' });
    expect(journal).toMatchObject({
      ok: true,
      activeSpiritId: 'aozhen',
      discoveredCount: 3,
      totalCount: 3,
      source: 'spirit-journal'
    });
    expect(journal.records.map((record) => [record.spiritId, record.rarity, record.certificateEligible])).toEqual([
      ['lirabao', 'common', true],
      ['jintari', 'uncommon', false],
      ['aozhen', 'rare', false]
    ]);
  });

  it('proves the first Mochirii roleplay quest chain progresses only with the required spirit roster', () => {
    const blockedMarketQuest = resolveMochiSpiritQuestProgress('silk-market-kindness', 'list-jade-thread-charm', {
      roster: ['lirabao'],
      completedQuestIds: ['first-lantern-vow'],
      questStepsById: {}
    });
    expect(blockedMarketQuest).toMatchObject({
      ok: false,
      questId: 'silk-market-kindness',
      completedSteps: []
    });
    expect(blockedMarketQuest.message).toContain('needs Jintari in your Mochirii roster');

    const progress = MOCHI_SPIRIT_QUESTS.reduce<QuestChainState>(
      (state, quest) => {
        let next = state;
        for (const step of quest.steps) {
          const result = resolveMochiSpiritQuestProgress(quest.id, step, next);
          expect(result.ok).toBe(true);
          next = {
            roster: fullRoster,
            activeQuestId: result.nextQuestId || quest.id,
            completedQuestIds: result.completedQuestIds,
            questStepsById: {
              ...next.questStepsById,
              [quest.id]: result.completedSteps
            }
          };
        }
        return next;
      },
      { roster: fullRoster, completedQuestIds: [] as string[], questStepsById: {} as Record<string, readonly string[]> }
    );

    expect(progress.completedQuestIds).toEqual(completedQuestIds);
    expect(progress.questStepsById).toEqual({
      'first-lantern-vow': ['attune-spirit', 'greet-sifu-narao', 'open-journal'],
      'silk-market-kindness': ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy'],
      'skybell-spar': ['choose-training-move', 'finish-training-bout', 'complete-raising-care']
    });
  });

  it('scores route mastery, habitat, research, compendium, provisions, commission, and rally as one closed alpha chain', () => {
    const rank = resolveGuildRankTrial({
      roster: ['lirabao', 'jintari'],
      activeSpiritId: 'lirabao',
      bond: 5,
      completedQuestSteps: ['attune-spirit'],
      tacticProof: true,
      affinityWins: 1,
      sparWins: 1,
      journalDiscoveredCount: 3,
      guildBuddyProof: true
    });
    expect(rank).toMatchObject({
      ok: true,
      passed: true,
      trialId: 'jade-court-initiate',
      score: 18,
      rewardItemId: ALPHA_ITEMS.rankSeal.id
    });

    const routeMastery = resolveSpiritRouteMastery({
      discoveredRoutes: firstRouteIds,
      roster: fullRoster,
      journalDiscoveredCount: 3,
      completedQuestIds,
      guildRankProof: true,
      rankTrialId: 'jade-court-initiate'
    });
    expect(routeMastery).toMatchObject({
      mastered: true,
      masteryId: SPIRIT_ROUTE_MASTERIES[0].id,
      score: 21,
      requiredScore: 21,
      rewardItemId: ALPHA_ITEMS.routeKnot.id
    });

    const habitat = resolveSpiritHabitatBond({
      roster: fullRoster,
      activeSpiritId: 'lirabao',
      journalDiscoveredCount: 3,
      careProof: true,
      bond: 5,
      growth: 'glow',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy'
    });
    expect(habitat).toMatchObject({
      bonded: true,
      bondId: 'jade-court-habitat-bond',
      score: 19,
      rewardItemId: ALPHA_ITEMS.habitatTassel.id
    });

    expect(SPIRIT_SANCTUARY_RITES.map((rite) => rite.id)).toEqual(['jade-court-sanctuary-rite']);
    const blockedSanctuary = resolveSpiritSanctuaryRite({
      roster: fullRoster,
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      bondBySpiritId: fullBondMap,
      careStreak: 1,
      trainingXp: 3,
      habitatBondProof: true,
      conditionWeaveProof: false,
      battleRoundProof: true,
      battleRoundVictory: true
    });
    expect(blockedSanctuary).toMatchObject({
      restored: false,
      riteId: 'jade-court-sanctuary-rite',
      missing: ['condition-weave']
    });

    const sanctuary = resolveSpiritSanctuaryRite({
      roster: fullRoster,
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      bondBySpiritId: fullBondMap,
      careStreak: 1,
      trainingXp: 3,
      habitatBondProof: true,
      conditionWeaveProof: true,
      battleRoundProof: true,
      battleRoundVictory: true
    });
    expect(sanctuary).toMatchObject({
      restored: true,
      riteId: 'jade-court-sanctuary-rite',
      riteName: 'Jade Court Sanctuary Rite',
      score: 33,
      requiredScore: 24,
      rewardItemId: ALPHA_ITEMS.sanctuaryBell.id,
      source: 'spirit-sanctuary-rite'
    });
    expect(sanctuary.message).toContain('No real value');

    const research = resolveSpiritResearchFolio({
      roster: fullRoster,
      activeSpiritId: 'lirabao',
      discoveredRoutes: firstRouteIds,
      journalDiscoveredCount: 3,
      habitatBondProof: true,
      habitatBondId: 'jade-court-habitat-bond',
      techniqueProof: true,
      tacticProof: true,
      affinityProof: true,
      trainingXp: 1
    });
    expect(research).toMatchObject({
      recorded: true,
      folioId: 'jade-court-research-folio',
      score: 20,
      rewardItemId: ALPHA_ITEMS.researchFolio.id
    });

    const compendium = resolveSpiritCompendiumCompletion({
      roster: fullRoster,
      activeSpiritId: 'lirabao',
      discoveredRoutes: firstRouteIds,
      journalDiscoveredCount: 3,
      habitatBondProof: true,
      habitatBondId: 'jade-court-habitat-bond',
      researchProof: true,
      researchFolioId: 'jade-court-research-folio',
      routeMasteryProof: true
    });
    expect(compendium).toMatchObject({
      completed: true,
      compendiumId: 'jade-court-spirit-compendium',
      score: 29,
      rewardItemId: ALPHA_ITEMS.compendiumSeal.id
    });

    expect(SPIRIT_ROSTER_ARCHIVES.map((archive) => archive.id)).toEqual(['jade-court-roster-archive']);
    const blockedArchive = resolveSpiritRosterArchive({
      roster: fullRoster,
      partyIds: ['lirabao', 'jintari'],
      activeSpiritId: 'lirabao',
      journalDiscoveredCount: 3,
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      sanctuaryRiteProof: false,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(blockedArchive).toMatchObject({
      archived: false,
      archiveId: 'jade-court-roster-archive',
      missing: ['sanctuary:jade-court-sanctuary-rite']
    });

    const archive = resolveSpiritRosterArchive({
      roster: fullRoster,
      partyIds: ['lirabao', 'jintari'],
      activeSpiritId: 'lirabao',
      journalDiscoveredCount: 3,
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(archive).toMatchObject({
      archived: true,
      archiveId: 'jade-court-roster-archive',
      archiveName: 'Jade Court Roster Archive',
      partyIds: ['lirabao', 'jintari'],
      reserveSpiritIds: ['aozhen'],
      score: 29,
      requiredScore: 22,
      rewardItemId: ALPHA_ITEMS.rosterArchiveSeal.id,
      source: 'spirit-roster-archive'
    });
    expect(archive.message).toContain('No real value');

    const provision = resolveSpiritProvisionSatchel({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      journalDiscoveredCount: 3,
      marketProof: true,
      tradeProof: true,
      routeInviteProof: true,
      careStreak: 2,
      completedQuestIds
    });
    expect(provision).toMatchObject({
      stocked: true,
      satchelId: 'jade-court-provision-satchel',
      stockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      score: 31,
      rewardItemId: ALPHA_ITEMS.provisionSatchel.id
    });

    expect(SPIRIT_CARE_CYCLES.map((cycle) => cycle.id)).toEqual(['jade-court-care-cycle']);
    const blockedCareCycle = resolveSpiritCareCycle({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      bondBySpiritId: fullBondMap,
      careStreak: 1,
      trainingXp: 3,
      raisingProof: true,
      raisingMilestoneLabel: 'Lacquer Luck Glow',
      rosterArchiveProof: true,
      rosterArchiveId: 'jade-court-roster-archive',
      provisionProof: false,
      provisionSatchelId: 'jade-court-provision-satchel',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(blockedCareCycle).toMatchObject({
      cycled: false,
      cycleId: 'jade-court-care-cycle',
      missing: ['provision:jade-court-provision-satchel']
    });

    const careCycle = resolveSpiritCareCycle({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      bondBySpiritId: fullBondMap,
      careStreak: 2,
      trainingXp: 5,
      raisingProof: true,
      raisingMilestoneLabel: 'Lacquer Luck Glow',
      rosterArchiveProof: true,
      rosterArchiveId: 'jade-court-roster-archive',
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(careCycle).toMatchObject({
      cycled: true,
      cycleId: 'jade-court-care-cycle',
      cycleName: 'Jade Court Care Cycle',
      activeSpiritId: 'jintari',
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      totalBond: 12,
      score: 53,
      requiredScore: 32,
      rewardItemId: ALPHA_ITEMS.careCycleKnot.id,
      source: 'spirit-care-cycle'
    });
    expect(careCycle.message).toContain('No real value');

    expect(SPIRIT_TEMPERAMENT_CONCORDS.map((concord) => concord.id)).toEqual(['jade-temperament-concord']);
    const blockedTemperament = resolveSpiritTemperamentConcord({
      roster: fullRoster,
      activeSpiritId: 'lirabao',
      bondBySpiritId: fullBondMap,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: false,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Temperament check.']
    });
    expect(blockedTemperament).toMatchObject({
      concorded: false,
      concordId: 'jade-temperament-concord',
      missing: ['condition-weave:jade-mirror-condition-weave']
    });

    const temperament = resolveSpiritTemperamentConcord({
      roster: fullRoster,
      activeSpiritId: 'lirabao',
      bondBySpiritId: fullBondMap,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Temperament check.']
    });
    expect(temperament).toMatchObject({
      concorded: true,
      concordId: 'jade-temperament-concord',
      concordName: 'Jade Temperament Concord',
      activeSpiritId: 'lirabao',
      temperamentLabels: ['gentle', 'bright', 'curious'],
      totalBond: 12,
      score: 41,
      requiredScore: 36,
      rewardItemId: ALPHA_ITEMS.temperamentCharm.id,
      source: 'spirit-temperament-concord'
    });
    expect(temperament.message).toContain('No real value');

    expect(SPIRIT_FIELD_ALMANACS.map((almanac) => almanac.id)).toEqual(['jade-field-almanac']);
    const blockedAlmanac = resolveSpiritFieldAlmanac({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      discoveredRoutes: firstRouteIds,
      journalDiscoveredCount: 3,
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      routePatrolProof: false,
      routePatrolId: 'jade-cloudbell-patrol',
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Almanac notes ready.']
    });
    expect(blockedAlmanac).toMatchObject({
      recorded: false,
      almanacId: 'jade-field-almanac',
      missing: ['route-patrol:jade-cloudbell-patrol']
    });

    const almanac = resolveSpiritFieldAlmanac({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      discoveredRoutes: firstRouteIds,
      journalDiscoveredCount: 3,
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Almanac notes ready.']
    });
    expect(almanac).toMatchObject({
      recorded: true,
      almanacId: 'jade-field-almanac',
      almanacName: 'Jade Field Almanac',
      activeSpiritId: 'aozhen',
      routeIds: [...firstRouteIds],
      speciesIds: [...fullRoster],
      journalDiscoveredCount: 3,
      score: 44,
      requiredScore: 38,
      rewardItemId: ALPHA_ITEMS.fieldAlmanacClasp.id,
      source: 'spirit-field-almanac'
    });
    expect(almanac.message).toContain('No real value');

    expect(SPIRIT_ROUTE_ECOLOGY_SURVEYS.map((survey) => survey.id)).toEqual(['jade-route-ecology-survey']);
    const blockedRouteEcology = resolveSpiritRouteEcologySurvey({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      discoveredRoutes: firstRouteIds,
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      fieldAlmanacProof: false,
      fieldAlmanacId: 'jade-field-almanac',
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Route ecology ready.']
    });
    expect(blockedRouteEcology).toMatchObject({
      surveyed: false,
      surveyId: 'jade-route-ecology-survey',
      missing: ['field-almanac:jade-field-almanac']
    });

    const routeEcology = resolveSpiritRouteEcologySurvey({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      discoveredRoutes: firstRouteIds,
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      fieldAlmanacProof: true,
      fieldAlmanacId: 'jade-field-almanac',
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Route ecology ready.']
    });
    expect(routeEcology).toMatchObject({
      surveyed: true,
      surveyId: 'jade-route-ecology-survey',
      surveyName: 'Jade Route Ecology Survey',
      routeIds: [...firstRouteIds],
      speciesIds: [...fullRoster],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      score: 45,
      requiredScore: 42,
      rewardItemId: ALPHA_ITEMS.routeEcologyMap.id,
      source: 'spirit-route-ecology'
    });
    expect(routeEcology.message).toContain('No real value');

    expect(SPIRIT_ENCOUNTER_ATLASES.map((atlas) => atlas.id)).toEqual(['jade-encounter-atlas']);
    const blockedEncounterAtlas = resolveSpiritEncounterAtlas({
      discoveredRoutes: firstRouteIds,
      encounteredSpiritIds: fullRoster,
      capturedSpiritIds: ['lirabao'],
      rarityTiers: ['common'],
      journalDiscoveredCount: 3,
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      captureRiteProof: false,
      captureRiteId: 'jade-court-capture-rite',
      fieldAlmanacProof: true,
      fieldAlmanacId: 'jade-field-almanac',
      localPresenceCount: 1,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Atlas notes need witnesses.']
    });
    expect(blockedEncounterAtlas.recorded).toBe(false);
    expect(blockedEncounterAtlas.missing).toEqual(expect.arrayContaining([
      'capture:jintari',
      'capture:aozhen',
      'rarity:uncommon',
      'rarity:rare',
      'capture-rite:jade-court-capture-rite',
      'presence:1/2'
    ]));

    const encounterAtlas = resolveSpiritEncounterAtlas({
      discoveredRoutes: firstRouteIds,
      encounteredSpiritIds: fullRoster,
      capturedSpiritIds: fullRoster,
      rarityTiers: ['common', 'uncommon', 'rare'],
      journalDiscoveredCount: 3,
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      captureRiteProof: true,
      captureRiteId: 'jade-court-capture-rite',
      fieldAlmanacProof: true,
      fieldAlmanacId: 'jade-field-almanac',
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Encounter atlas ready.']
    });
    expect(encounterAtlas).toMatchObject({
      recorded: true,
      atlasId: 'jade-encounter-atlas',
      atlasName: 'Jade Encounter Atlas',
      routeIds: [...firstRouteIds],
      encounteredSpiritIds: [...fullRoster],
      capturedSpiritIds: [...fullRoster],
      rarityTiers: ['common', 'uncommon', 'rare'],
      score: 54,
      requiredScore: 44,
      rewardItemId: ALPHA_ITEMS.encounterAtlas.id,
      source: 'spirit-encounter-atlas'
    });
    expect(encounterAtlas.message).toContain('No real value');

    expect(SPIRIT_CRAFT_WRITS.map((writ) => writ.id)).toEqual(['jade-court-craft-writ']);
    const blockedCraftWrit = resolveSpiritCraftWrit({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      routeEcologyProof: false,
      routeEcologyId: 'jade-route-ecology-survey',
      fieldAlmanacProof: true,
      fieldAlmanacId: 'jade-field-almanac',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      marketProof: true,
      tradeProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Craft writ ready.']
    });
    expect(blockedCraftWrit).toMatchObject({
      crafted: false,
      writId: 'jade-court-craft-writ',
      missing: ['route-ecology:jade-route-ecology-survey']
    });

    const craftWrit = resolveSpiritCraftWrit({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      fieldAlmanacProof: true,
      fieldAlmanacId: 'jade-field-almanac',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      marketProof: true,
      tradeProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Craft writ ready.']
    });
    expect(craftWrit).toMatchObject({
      crafted: true,
      writId: 'jade-court-craft-writ',
      writName: 'Jade Court Craft Writ',
      activeSpiritId: 'jintari',
      activeSpiritName: 'Jintari',
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      score: 47,
      requiredScore: 44,
      rewardItemId: ALPHA_ITEMS.craftWrit.id,
      source: 'spirit-craft-writ'
    });
    expect(craftWrit.message).toContain('No real value');

    expect(TRADE_EXCHANGE_ACCORDS.map((accord) => accord.id)).toEqual(['jade-exchange-accord']);
    const blockedExchangeAccord = resolveTradeExchangeAccord({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      listedItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      offeredItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      marketProof: true,
      tradeProof: false,
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      craftWritProof: true,
      craftWritId: 'jade-court-craft-writ',
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Exchange accord ready.']
    });
    expect(blockedExchangeAccord).toMatchObject({
      exchanged: false,
      accordId: 'jade-exchange-accord',
      missing: ['direct-trade']
    });

    const exchangeAccord = resolveTradeExchangeAccord({
      roster: fullRoster,
      activeSpiritId: 'aozhen',
      listedItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      offeredItemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      marketProof: true,
      tradeProof: true,
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      craftWritProof: true,
      craftWritId: 'jade-court-craft-writ',
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Exchange accord ready.']
    });
    expect(exchangeAccord).toMatchObject({
      exchanged: true,
      accordId: 'jade-exchange-accord',
      accordName: 'Jade Exchange Accord',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: [...fullRoster],
      itemIds: [ALPHA_ITEMS.charm.id, ALPHA_ITEMS.harmonyTea.id, ALPHA_ITEMS.mooncakeBox.id],
      localPresenceCount: 2,
      score: 42,
      requiredScore: 34,
      rewardItemId: ALPHA_ITEMS.exchangeAccordTally.id,
      source: 'trade-exchange-accord'
    });
    expect(exchangeAccord.message).toContain('No real value');

    expect(SPIRIT_ROUTE_WAYSTONES.map((waystone) => waystone.id)).toEqual(['jade-cloudbell-waystone']);
    const blockedWaystone = resolveSpiritRouteWaystone({
      discoveredRoutes: firstRouteIds,
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      craftWritProof: false,
      craftWritId: 'jade-court-craft-writ',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Waystone ready.']
    });
    expect(blockedWaystone).toMatchObject({
      activated: false,
      waystoneId: 'jade-cloudbell-waystone',
      missing: ['craft-writ:jade-court-craft-writ']
    });

    const routeWaystone = resolveSpiritRouteWaystone({
      discoveredRoutes: firstRouteIds,
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      craftWritProof: true,
      craftWritId: 'jade-court-craft-writ',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Waystone ready.']
    });
    expect(routeWaystone).toMatchObject({
      activated: true,
      waystoneId: 'jade-cloudbell-waystone',
      waystoneName: 'Jade Cloudbell Waystone',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      routeIds: [...firstRouteIds],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      score: 31,
      requiredScore: 30,
      rewardItemId: ALPHA_ITEMS.waystoneSeal.id,
      source: 'world-route-waystone'
    });
    expect(routeWaystone.message).toContain('No real value');

    expect(SPIRIT_NURTURE_RITES.map((rite) => rite.id)).toEqual(['jade-moonwell-nurture-rite']);
    const blockedNurtureRite = resolveSpiritNurtureRite({
      roster: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      craftWritProof: true,
      craftWritId: 'jade-court-craft-writ',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      raisingProof: false,
      bond: 5,
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Nurture rite ready.']
    });
    expect(blockedNurtureRite).toMatchObject({
      nurtured: false,
      riteId: 'jade-moonwell-nurture-rite',
      missing: ['raising']
    });

    const nurtureRite = resolveSpiritNurtureRite({
      roster: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      craftWritProof: true,
      craftWritId: 'jade-court-craft-writ',
      temperamentConcordProof: true,
      temperamentConcordId: 'jade-temperament-concord',
      raisingProof: true,
      raisingMilestoneLabel: 'Lacquer Luck Glow',
      bond: 5,
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Nurture rite ready.']
    });
    expect(nurtureRite).toMatchObject({
      nurtured: true,
      riteId: 'jade-moonwell-nurture-rite',
      riteName: 'Jade Moonwell Nurture Rite',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: [...fullRoster],
      caredSpiritIds: [...fullRoster],
      score: 43,
      requiredScore: 40,
      rewardItemId: ALPHA_ITEMS.nurtureRibbon.id,
      source: 'spirit-nurture-rite'
    });
    expect(nurtureRite.message).toContain('No real value');

    expect(SPIRIT_RECOVERY_TEAS.map((entry) => entry.id)).toEqual(['jade-teahouse-recovery']);
    const blockedRecoveryTea = resolveSpiritRecoveryTea({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'lirabao',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      sanctuaryRiteProof: false,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 31,
      battleRoundOpponentScore: 18,
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Recovery tea ready.']
    });
    expect(blockedRecoveryTea).toMatchObject({
      recovered: false,
      teaId: 'jade-teahouse-recovery',
      missing: ['sanctuary:jade-court-sanctuary-rite']
    });

    const recoveryTea = resolveSpiritRecoveryTea({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'lirabao',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 31,
      battleRoundOpponentScore: 18,
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Recovery tea ready.']
    });
    expect(recoveryTea).toMatchObject({
      recovered: true,
      teaId: 'jade-teahouse-recovery',
      teaName: 'Jade Teahouse Recovery',
      activeSpiritId: 'lirabao',
      activeSpiritName: 'Lirabao',
      roster: [...fullRoster],
      partyIds: [...fullRoster],
      caredSpiritIds: [...fullRoster],
      localPresenceCount: 2,
      score: 43,
      requiredScore: 36,
      rewardItemId: ALPHA_ITEMS.recoveryTeaCup.id,
      source: 'spirit-recovery-tea'
    });
    expect(recoveryTea.message).toContain('No real value');

    expect(SPIRIT_KINSHIP_ALBUMS.map((entry) => entry.id)).toEqual(['jade-kinship-album']);
    const kinshipAlbum = resolveSpiritKinshipAlbum({
      roster: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      habitatBondProof: true,
      habitatBondId: 'jade-court-habitat-bond',
      raisingProof: true,
      raisingMilestoneLabel: 'Moonwell Bloom Form',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Kinship album ready.']
    });
    expect(kinshipAlbum).toMatchObject({
      recorded: true,
      albumId: 'jade-kinship-album',
      albumName: 'Jade Kinship Album',
      score: 53,
      requiredScore: 38,
      rewardItemId: ALPHA_ITEMS.kinshipAlbum.id,
      source: 'spirit-kinship-album'
    });
    expect(kinshipAlbum.message).toContain('No real value');

    expect(SPIRIT_NURSERY_GROVES.map((entry) => entry.id)).toEqual(['jade-nursery-grove']);
    const blockedNurseryGrove = resolveSpiritNurseryGrove({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      recoveryTeaProof: true,
      recoveryTeaId: 'jade-teahouse-recovery',
      kinshipAlbumProof: false,
      kinshipAlbumId: 'jade-kinship-album',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      raisingProof: true,
      raisingMilestoneLabel: 'Moonwell Bloom Form',
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Nursery grove ready.']
    });
    expect(blockedNurseryGrove).toMatchObject({
      cultivated: false,
      nurseryId: 'jade-nursery-grove',
      missing: ['kinship:jade-kinship-album']
    });

    const nurseryGrove = resolveSpiritNurseryGrove({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      recoveryTeaProof: true,
      recoveryTeaId: 'jade-teahouse-recovery',
      kinshipAlbumProof: true,
      kinshipAlbumId: 'jade-kinship-album',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      raisingProof: true,
      raisingMilestoneLabel: 'Moonwell Bloom Form',
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Nursery grove ready.']
    });
    expect(nurseryGrove).toMatchObject({
      cultivated: true,
      nurseryId: 'jade-nursery-grove',
      nurseryName: 'Jade Nursery Grove',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: [...fullRoster],
      partyIds: [...fullRoster],
      caredSpiritIds: [...fullRoster],
      totalBond: 15,
      localPresenceCount: 2,
      score: 61,
      requiredScore: 52,
      rewardItemId: ALPHA_ITEMS.nurserySprout.id,
      source: 'spirit-nursery-grove'
    });
    expect(nurseryGrove.message).toContain('No real value');

    expect(SPIRIT_BLOOM_ASCENDANCES.map((entry) => entry.id)).toEqual(['jade-bloom-ascendance']);
    const blockedBloomAscendance = resolveSpiritBloomAscendance({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      nurseryGroveProof: true,
      nurseryGroveId: 'jade-nursery-grove',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      kinshipAlbumProof: true,
      kinshipAlbumId: 'jade-kinship-album',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      affinityMatrixProof: false,
      affinityMatrixId: 'jade-affinity-matrix',
      battleRoundProof: true,
      battleRoundVictory: true,
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Bloom ascendance ready.']
    });
    expect(blockedBloomAscendance).toMatchObject({
      ascended: false,
      ascendanceId: 'jade-bloom-ascendance',
      missing: ['matrix:jade-affinity-matrix']
    });

    const bloomAscendance = resolveSpiritBloomAscendance({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      nurseryGroveProof: true,
      nurseryGroveId: 'jade-nursery-grove',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      kinshipAlbumProof: true,
      kinshipAlbumId: 'jade-kinship-album',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      affinityMatrixProof: true,
      affinityMatrixId: 'jade-affinity-matrix',
      battleRoundProof: true,
      battleRoundVictory: true,
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Bloom ascendance ready.']
    });
    expect(bloomAscendance).toMatchObject({
      ascended: true,
      ascendanceId: 'jade-bloom-ascendance',
      ascendanceName: 'Jade Bloom Ascendance',
      formTitle: 'Jade Bloom Form',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: [...fullRoster],
      partyIds: [...fullRoster],
      caredSpiritIds: [...fullRoster],
      totalBond: 15,
      localPresenceCount: 2,
      score: 75,
      requiredScore: 58,
      rewardItemId: ALPHA_ITEMS.bloomAscendanceSigil.id,
      source: 'spirit-bloom-ascendance'
    });
    expect(bloomAscendance.message).toContain('No real value');

    expect(SPIRIT_LINEAGE_REGISTERS.map((entry) => entry.id)).toEqual(['jade-lineage-register']);
    const blockedLineageRegister = resolveSpiritLineageRegister({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      kinshipAlbumProof: true,
      kinshipAlbumId: 'jade-kinship-album',
      nurseryGroveProof: true,
      nurseryGroveId: 'jade-nursery-grove',
      bloomAscendanceProof: true,
      bloomAscendanceId: 'jade-bloom-ascendance',
      captureRiteProof: false,
      captureRiteId: 'jade-court-capture-rite',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      raisingProof: true,
      raisingMilestoneLabel: 'Moonwell Bloom Form',
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Lineage register ready.']
    });
    expect(blockedLineageRegister).toMatchObject({
      registered: false,
      registerId: 'jade-lineage-register',
      missing: ['capture-rite:jade-court-capture-rite']
    });

    const lineageRegister = resolveSpiritLineageRegister({
      roster: fullRoster,
      partyIds: fullRoster,
      caredSpiritIds: fullRoster,
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 2,
      kinshipAlbumProof: true,
      kinshipAlbumId: 'jade-kinship-album',
      nurseryGroveProof: true,
      nurseryGroveId: 'jade-nursery-grove',
      bloomAscendanceProof: true,
      bloomAscendanceId: 'jade-bloom-ascendance',
      captureRiteProof: true,
      captureRiteId: 'jade-court-capture-rite',
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      raisingProof: true,
      raisingMilestoneLabel: 'Moonwell Bloom Form',
      trainingXp: 3,
      sparLadderXp: 5,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Lineage register ready.']
    });
    expect(lineageRegister).toMatchObject({
      registered: true,
      registerId: 'jade-lineage-register',
      registerName: 'Jade Lineage Register',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: [...fullRoster],
      partyIds: [...fullRoster],
      caredSpiritIds: [...fullRoster],
      totalBond: 15,
      localPresenceCount: 2,
      score: 75,
      requiredScore: 60,
      rewardItemId: ALPHA_ITEMS.lineageRegisterSeal.id,
      source: 'spirit-lineage-register'
    });
    expect(lineageRegister.milestoneLabels).toContain('Moonwell Bloom Form');
    expect(lineageRegister.message).toContain('No real value');

    const commission = resolveGuildCommission({
      roster: fullRoster,
      activeSpiritId: 'jintari',
      journalDiscoveredCount: 3,
      questChainProof: true,
      completedQuestIds,
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      marketProof: true,
      tradeProof: true,
      trainingXp: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Jade Court commission ready.']
    });
    expect(commission).toMatchObject({
      completed: true,
      commissionId: 'jade-court-commission-ledger',
      score: 32,
      rewardItemId: ALPHA_ITEMS.commissionKnot.id
    });

    const rally = resolveGuildSocialRally({
      partyIds: fullRoster,
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Rally in Jade Lantern Court.'],
      emoteProof: true,
      commissionProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true
    });
    expect(rally).toMatchObject({
      rallied: true,
      rallyId: 'jade-courtyard-rally',
      score: 30,
      rewardItemId: ALPHA_ITEMS.rallyKnot.id
    });

    expect(MOCHI_STORY_CHAPTERS.map((chapter) => chapter.id)).toEqual(['jade-scroll-story-chapter']);
    const storyChapter = resolveMochiStoryChapter({
      roster: fullRoster,
      partyIds: fullRoster,
      completedQuestIds,
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      journalDiscoveredCount: 3,
      localPresenceCount: 2,
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      routeWaystoneProof: true,
      routeWaystoneId: 'jade-cloudbell-waystone',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      tournamentProof: true,
      tournamentId: 'jade-banner-tournament',
      commissionProof: true,
      commissionId: 'jade-court-commission-ledger',
      rallyProof: true,
      rallyId: 'jade-courtyard-rally',
      profileViewed: true,
      guildBuddyProof: true,
      emoteProof: true,
      statusMood: 'cozy',
      chatLines: ['Story chapter ready.']
    });
    expect(storyChapter).toMatchObject({
      recorded: true,
      chapterId: 'jade-scroll-story-chapter',
      chapterName: 'Jade Scroll Story Chapter',
      score: 56,
      requiredScore: 42,
      rewardItemId: ALPHA_ITEMS.storyScroll.id,
      source: 'story-chapter'
    });
    expect(storyChapter.message).toContain('No real value');

    expect(GUILD_INSIGNIA_CASES.map((entry) => entry.id)).toEqual(['jade-insignia-case']);
    const insigniaCase = resolveGuildInsigniaCase({
      roster: fullRoster,
      partyIds: fullRoster,
      localPresenceCount: 2,
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      routePatrolProof: true,
      routePatrolId: 'jade-cloudbell-patrol',
      guildRankProof: true,
      guildRankId: 'jade-court-initiate',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      tournamentProof: true,
      tournamentId: 'jade-banner-tournament',
      storyChapterProof: true,
      storyChapterId: 'jade-scroll-story-chapter',
      harmonyFormProof: true,
      harmonyFormId: 'triune-jade-harmony',
      profileViewed: true,
      guildBuddyProof: true,
      emoteProof: true,
      statusMood: 'cozy',
      chatLines: ['Insignia case ready.']
    });
    expect(insigniaCase).toMatchObject({
      completed: true,
      caseId: 'jade-insignia-case',
      caseName: 'Jade Insignia Case',
      score: 44,
      requiredScore: 34,
      rewardItemId: ALPHA_ITEMS.insigniaCase.id,
      source: 'guild-insignia-case'
    });
    expect(insigniaCase.message).toContain('No real value');

    expect(GUILD_WAYFARER_CHRONICLES.map((chronicle) => chronicle.id)).toEqual(['jade-wayfarer-chronicle']);
    const blockedChronicle = resolveGuildWayfarerChronicle({
      roster: fullRoster,
      partyIds: fullRoster,
      journalDiscoveredCount: 3,
      completedQuestIds,
      localPresenceCount: 1,
      captureProof: true,
      captureRiteProof: true,
      encounterAtlasProof: true,
      routeMasteryProof: true,
      routePatrolProof: true,
      routeEcologyProof: true,
      habitatBondProof: true,
      researchProof: true,
      compendiumProof: true,
      provisionProof: true,
      craftWritProof: true,
      routeWaystoneProof: true,
      nurtureRiteProof: true,
      kinshipAlbumProof: true,
      nurseryGroveProof: true,
      bloomAscendanceProof: true,
      lineageRegisterProof: true,
      exchangeAccordProof: true,
      affinityMatrixProof: true,
      techniqueCodexProof: true,
      commissionProof: true,
      rallyProof: true,
      techniqueLoadoutProof: true,
      traitAttunementProof: true,
      conditionWeaveProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      questChainProof: true,
      marketProof: true,
      tradeProof: true,
      canaryPreviewProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Chronicle ready.']
    });
    expect(blockedChronicle).toMatchObject({
      chronicled: false,
      chronicleId: 'jade-wayfarer-chronicle',
      missing: ['presence:1/2']
    });

    const chronicle = resolveGuildWayfarerChronicle({
      roster: fullRoster,
      partyIds: fullRoster,
      journalDiscoveredCount: 3,
      completedQuestIds,
      localPresenceCount: 2,
      captureProof: true,
      captureRiteProof: true,
      encounterAtlasProof: true,
      routeMasteryProof: true,
      routePatrolProof: true,
      routeEcologyProof: true,
      habitatBondProof: true,
      researchProof: true,
      compendiumProof: true,
      provisionProof: true,
      craftWritProof: true,
      routeWaystoneProof: true,
      nurtureRiteProof: true,
      kinshipAlbumProof: true,
      nurseryGroveProof: true,
      bloomAscendanceProof: true,
      lineageRegisterProof: true,
      exchangeAccordProof: true,
      affinityMatrixProof: true,
      techniqueCodexProof: true,
      commissionProof: true,
      rallyProof: true,
      techniqueLoadoutProof: true,
      traitAttunementProof: true,
      conditionWeaveProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      questChainProof: true,
      marketProof: true,
      tradeProof: true,
      canaryPreviewProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Chronicle ready.']
    });
    expect(chronicle).toMatchObject({
      chronicled: true,
      chronicleId: 'jade-wayfarer-chronicle',
      chronicleName: 'Jade Wayfarer Chronicle',
      score: 127,
      requiredScore: 70,
      rewardItemId: ALPHA_ITEMS.wayfarerChronicleClasp.id,
      source: 'guild-wayfarer-chronicle'
    });
    expect(chronicle.message).toContain('No real value');

    expect(GUILD_ASCENSION_TRIALS.map((trial) => trial.id)).toEqual(['jade-court-ascension-trial']);
    const blockedAscension = resolveGuildAscensionTrial({
      roster: fullRoster,
      partyIds: fullRoster,
      localPresenceCount: 2,
      wayfarerChronicleProof: false,
      kinshipAlbumProof: true,
      nurseryGroveProof: true,
      bloomAscendanceProof: true,
      lineageRegisterProof: true,
      exchangeAccordProof: true,
      affinityMatrixProof: true,
      techniqueCodexProof: true,
      routePatrolProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
      rivalCircleProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 18,
      battleRoundOpponentScore: 8,
      conditionWeaveProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      questChainProof: true,
      marketProof: true,
      tradeProof: true,
      canaryPreviewProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ascension ready.']
    });
    expect(blockedAscension).toMatchObject({
      ascended: false,
      trialId: 'jade-court-ascension-trial',
      missing: ['chronicle']
    });

    const ascension = resolveGuildAscensionTrial({
      roster: fullRoster,
      partyIds: fullRoster,
      localPresenceCount: 2,
      wayfarerChronicleProof: true,
      kinshipAlbumProof: true,
      nurseryGroveProof: true,
      bloomAscendanceProof: true,
      lineageRegisterProof: true,
      exchangeAccordProof: true,
      affinityMatrixProof: true,
      techniqueCodexProof: true,
      routePatrolProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
      rivalCircleProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 18,
      battleRoundOpponentScore: 8,
      conditionWeaveProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      questChainProof: true,
      marketProof: true,
      tradeProof: true,
      canaryPreviewProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ascension ready.']
    });
    expect(ascension).toMatchObject({
      ascended: true,
      trialId: 'jade-court-ascension-trial',
      trialName: 'Jade Court Ascension Trial',
      score: 92,
      requiredScore: 59,
      rewardItemId: ALPHA_ITEMS.ascensionRibbon.id,
      source: 'guild-ascension-trial'
    });
    expect(ascension.message).toContain('No real value');
  });

  it('proves the no-injury battle, loadout, trait, condition, growth, and mentor readiness chain', () => {
    const party = resolveSpiritParty(fullRoster, 'aozhen');
    expect(party).toMatchObject({
      ok: true,
      activeSpiritId: 'aozhen',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      supportIds: ['lirabao', 'jintari']
    });

    const spar = resolveSpiritSparLadder(party.partyIds, 'jade-echo-apprentice', fullBondMap, 0);
    expect(spar).toMatchObject({
      victory: true,
      focusScore: 33,
      opponentScore: 17,
      trainingXp: 5,
      source: 'battle-spar-ladder'
    });

    const battleRound = resolveSpiritBattleRound({
      partyIds: party.partyIds,
      activeSpiritId: 'aozhen',
      opponentId: 'jade-echo-apprentice',
      bondBySpiritId: fullBondMap,
      moveIdBySpiritId: preferredMoveIdBySpiritId,
      tacticProof: true,
      harmonyFormProof: true,
      priorWins: 1
    });
    expect(battleRound).toMatchObject({
      victory: true,
      noInjury: true,
      focusScore: 50,
      opponentScore: 20,
      participants: [
        expect.objectContaining({ spiritId: 'aozhen', moveId: 'skybell-guard' }),
        expect.objectContaining({ spiritId: 'lirabao', moveId: 'lantern-pulse' }),
        expect.objectContaining({ spiritId: 'jintari', moveId: 'goldleaf-feint' })
      ],
      source: 'battle-round-transcript'
    });

    expect(resolveSpiritTechniqueMastery('jintari', 'goldleaf-feint', 0, 4)).toMatchObject({
      ok: true,
      masteryLevel: 'practiced',
      masteryXp: 8,
      awardedXp: 8,
      source: 'spirit-technique'
    });

    expect(resolveSpiritAffinityTrial('lirabao', 'lantern-pulse', 'jade-mirror-trial', 5, 7)).toMatchObject({
      ok: true,
      affinityAdvantage: true,
      victory: true,
      focusScore: 17,
      trialScore: 14,
      masteryXp: 11,
      source: 'battle-affinity-trial'
    });

    const loadout = resolveSpiritTechniqueLoadout({
      partyIds: fullRoster,
      techniqueProof: true,
      tacticProof: true,
      tacticId: 'goldleaf-opening',
      techniqueMasteryXp: 18,
      routeMasteryProof: true,
      journalProof: true,
      journalDiscoveredCount: 3,
      preferredMoveIdBySpiritId
    });
    expect(loadout).toMatchObject({
      prepared: true,
      loadoutId: 'jade-step-loadout',
      score: 25,
      moves: [
        expect.objectContaining({ spiritId: 'lirabao', moveId: 'lantern-pulse' }),
        expect.objectContaining({ spiritId: 'jintari', moveId: 'goldleaf-feint' }),
        expect.objectContaining({ spiritId: 'aozhen', moveId: 'skybell-guard' })
      ],
      rewardItemId: ALPHA_ITEMS.loadoutSlip.id
    });

    expect(SPIRIT_TECHNIQUE_CODEXES.map((entry) => entry.id)).toEqual(['jade-technique-codex']);
    const blockedCodex = resolveSpiritTechniqueCodex({
      partyIds: fullRoster,
      masteredMoveIds: [SPIRIT_MOVES.lanternPulse.id, SPIRIT_MOVES.goldleafFeint.id],
      tacticIds: ['lantern-anchor'],
      techniqueProof: true,
      techniqueLoadoutProof: false,
      techniqueLoadoutId: 'jade-step-loadout',
      techniqueMasteryXp: 18,
      tacticProof: true,
      trainingXp: 3,
      battleRoundProof: true,
      battleRoundVictory: true,
      journalProof: true,
      journalDiscoveredCount: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for codex.']
    });
    expect(blockedCodex.codified).toBe(false);
    expect(blockedCodex.missing).toContain('move:skybell-guard');
    expect(blockedCodex.missing).toContain('loadout:jade-step-loadout');

    const techniqueCodex = resolveSpiritTechniqueCodex({
      partyIds: fullRoster,
      masteredMoveIds: [SPIRIT_MOVES.lanternPulse.id, SPIRIT_MOVES.goldleafFeint.id, SPIRIT_MOVES.skybellGuard.id],
      tacticIds: ['lantern-anchor', 'goldleaf-opening', 'skybell-ward'],
      techniqueProof: true,
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      techniqueMasteryXp: 18,
      tacticProof: true,
      trainingXp: 3,
      battleRoundProof: true,
      battleRoundVictory: true,
      journalProof: true,
      journalDiscoveredCount: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for codex.']
    });
    expect(techniqueCodex).toMatchObject({
      codified: true,
      codexId: 'jade-technique-codex',
      codexName: 'Jade Technique Codex',
      partyIds: [...fullRoster],
      masteredMoveIds: [SPIRIT_MOVES.lanternPulse.id, SPIRIT_MOVES.goldleafFeint.id, SPIRIT_MOVES.skybellGuard.id],
      tacticIds: ['lantern-anchor', 'goldleaf-opening', 'skybell-ward'],
      score: 58,
      requiredScore: 46,
      rewardItemId: ALPHA_ITEMS.techniqueCodexSeal.id,
      source: 'spirit-technique-codex'
    });
    expect(techniqueCodex.message).toContain('No real value');

    const growth = resolveSpiritGrowthRite({
      spiritId: 'lirabao',
      bond: 5,
      growth: 'glow',
      trainingXp: 3,
      raisingProof: true,
      rankTrialProof: true,
      rankTrialId: 'jade-court-initiate'
    });
    expect(growth).toMatchObject({
      passed: true,
      riteId: 'moonwell-bloom-rite',
      growth: 'glow',
      rewardItemId: ALPHA_ITEMS.growthSigil.id
    });

    const harmony = resolveSpiritHarmonyForm({
      partyIds: fullRoster,
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      tacticProof: true,
      affinityProof: true,
      trainingXp: 3,
      sparLadderXp: 5
    });
    expect(harmony).toMatchObject({
      formed: true,
      formId: 'triune-jade-harmony',
      score: 27,
      rewardItemId: ALPHA_ITEMS.harmonySash.id
    });

    const concord = resolveSpiritHarmonyTrial({
      partyIds: fullRoster,
      harmonyFormProof: true,
      harmonyFormId: 'triune-jade-harmony',
      sparLadderWins: 1,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for concord.'],
      tacticProof: true,
      affinityProof: true
    });
    expect(concord).toMatchObject({
      cleared: true,
      trialId: 'jade-echo-concord',
      score: 24,
      rewardItemId: ALPHA_ITEMS.concordTally.id
    });

    const teamMatch = resolveSpiritTeamSparMatch({
      partyIds: fullRoster,
      harmonyTrialProof: true,
      harmonyTrialId: 'jade-echo-concord',
      harmonyTrialScore: concord.score,
      routeMasteryProof: true,
      growthRiteProof: true,
      tacticProof: true,
      trainingXp: 3,
      sparLadderWins: 1,
      questChainProof: true,
      chatLines: ['Ready for the team match.']
    });
    expect(teamMatch).toMatchObject({
      cleared: true,
      matchId: 'jade-mirror-team-match',
      score: 32,
      rewardItemId: ALPHA_ITEMS.teamMatchRibbon.id
    });

    const mentor = resolveSpiritMentorChallenge({
      partyIds: fullRoster,
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: teamMatch.score,
      techniqueMasteryXp: 18,
      tacticMasteryXp: 14,
      raisingCareStreak: 1,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(mentor).toMatchObject({
      cleared: true,
      challengeId: 'silk-banner-mentor-drill',
      score: 28,
      rewardItemId: ALPHA_ITEMS.mentorSeal.id
    });

    const trait = resolveSpiritTraitAttunement({
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      battleRoundProof: true,
      battleRoundVictory: true,
      growthRiteProof: true,
      careStreak: 1,
      journalProof: true,
      journalDiscoveredCount: 3,
      bondBySpiritId: fullBondMap
    });
    expect(trait).toMatchObject({
      unlocked: true,
      traitId: 'jade-heart-trait',
      traitLabel: 'Lanternhearted Guard',
      score: 35,
      rewardItemId: ALPHA_ITEMS.traitThread.id
    });

    const conditionWeave = resolveSpiritConditionWeave({
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      tacticProof: true,
      affinityProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      sparLadderWins: 1,
      trainingXp: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the condition weave.']
    });
    expect(conditionWeave).toMatchObject({
      woven: true,
      weaveId: 'jade-mirror-condition-weave',
      conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
      score: 49,
      rewardItemId: ALPHA_ITEMS.conditionCharm.id
    });

    expect(SPIRIT_AFFINITY_MATRICES.map((matrix) => matrix.id)).toEqual(['jade-affinity-matrix']);
    const blockedAffinityMatrix = resolveSpiritAffinityMatrix({
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      affinityLabels: ['blossom', 'citrus-gold', 'sky-jade'],
      conditionIds: conditionWeave.conditionIds,
      affinityProof: false,
      affinityTrialId: 'silk-cinder-trial',
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      tacticProof: true,
      harmonyFormProof: true,
      sparLadderWins: 1,
      trainingXp: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the affinity matrix.']
    });
    expect(blockedAffinityMatrix).toMatchObject({
      mapped: false,
      matrixId: 'jade-affinity-matrix',
      missing: ['trial:silk-cinder-trial']
    });

    const affinityMatrix = resolveSpiritAffinityMatrix({
      partyIds: fullRoster,
      activeSpiritId: 'lirabao',
      affinityLabels: ['blossom', 'citrus-gold', 'sky-jade'],
      conditionIds: conditionWeave.conditionIds,
      affinityProof: true,
      affinityTrialId: 'silk-cinder-trial',
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      tacticProof: true,
      harmonyFormProof: true,
      sparLadderWins: 1,
      trainingXp: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the affinity matrix.']
    });
    expect(affinityMatrix).toMatchObject({
      mapped: true,
      matrixId: 'jade-affinity-matrix',
      matrixName: 'Jade Affinity Matrix',
      affinityLabels: ['blossom', 'citrus-gold', 'sky-jade'],
      conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
      score: 56,
      requiredScore: 44,
      rewardItemId: ALPHA_ITEMS.affinityMatrixSeal.id,
      source: 'battle-affinity-matrix'
    });
    expect(affinityMatrix.message).toContain('No real value');

    expect(SPIRIT_TOURNAMENT_BRACKETS.map((bracket) => bracket.id)).toEqual(['jade-banner-tournament']);
    const tournament = resolveSpiritTournamentBracket({
      partyIds: fullRoster,
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      mentorChallengeScore: mentor.score,
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: teamMatch.score,
      harmonyTrialProof: true,
      harmonyTrialId: 'jade-echo-concord',
      conditionWeaveProof: true,
      affinityMatrixProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      localPresenceCount: 2,
      routePatrolProof: true,
      nurtureRiteProof: true,
      guildRankProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Tournament ready.']
    });
    expect(tournament).toMatchObject({
      cleared: true,
      bracketId: 'jade-banner-tournament',
      bracketName: 'Jade Banner Tournament',
      score: 52,
      requiredScore: 38,
      rewardItemId: ALPHA_ITEMS.tournamentPennant.id,
      source: 'battle-tournament-bracket'
    });
    expect(tournament.message).toContain('No real value');

    expect(SPIRIT_RIVAL_CIRCLES.map((circle) => circle.id)).toEqual(['jade-rival-circle']);
    const blockedRivalCircle = resolveSpiritRivalCircle({
      partyIds: fullRoster,
      tournamentProof: false,
      tournamentId: 'jade-banner-tournament',
      tournamentScore: tournament.score,
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      mentorChallengeScore: mentor.score,
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: teamMatch.score,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      affinityMatrixProof: true,
      techniqueLoadoutProof: true,
      traitAttunementProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Rival circle ready.']
    });
    expect(blockedRivalCircle).toMatchObject({
      cleared: false,
      circleId: 'jade-rival-circle',
      missing: ['tournament:jade-banner-tournament']
    });

    const rivalCircle = resolveSpiritRivalCircle({
      partyIds: fullRoster,
      tournamentProof: true,
      tournamentId: 'jade-banner-tournament',
      tournamentScore: tournament.score,
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      mentorChallengeScore: mentor.score,
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: teamMatch.score,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: battleRound.focusScore,
      battleRoundOpponentScore: battleRound.opponentScore,
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      affinityMatrixProof: true,
      techniqueLoadoutProof: true,
      traitAttunementProof: true,
      guildRankProof: true,
      growthRiteProof: true,
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Rival circle ready.']
    });
    expect(rivalCircle).toMatchObject({
      cleared: true,
      circleId: 'jade-rival-circle',
      circleName: 'Jade Rival Circle',
      rivalName: 'Qinghei Banner Circle',
      partyIds: [...fullRoster],
      score: 58,
      requiredScore: 46,
      rewardItemId: ALPHA_ITEMS.rivalCircleMark.id,
      source: 'battle-rival-circle'
    });
    expect(rivalCircle.message).toContain('No real value');

    expect(growthStageFromBond(2)).toBe('seed');
    expect(growthStageFromBond(3)).toBe('sprout');
    expect(growthStageFromBond(5)).toBe('glow');
  });
});
