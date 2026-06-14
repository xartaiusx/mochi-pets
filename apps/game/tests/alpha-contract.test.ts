import { describe, expect, it } from 'vitest';
import {
  GUILD_ASCENSION_TRIALS,
  GUILD_COMMISSIONS,
  GUILD_INSIGNIA_CASES,
  GUILD_SOCIAL_RALLIES,
  GUILD_WAYFARER_CHRONICLES,
  GUILD_RANK_TRIALS,
  MOCHI_STORY_CHAPTERS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_BOND_MILESTONES,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_BATTLE_CONDITIONS,
  SPIRIT_CARE_CYCLES,
  SPIRIT_COMPENDIUMS,
  SPIRIT_CONDITION_WEAVES,
  SPIRIT_CRAFT_WRITS,
  SPIRIT_GROWTH_RITES,
  SPIRIT_FIELD_ACCORDS,
  SPIRIT_FIELD_ALMANACS,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_KINSHIP_ALBUMS,
  SPIRIT_MENTOR_CHALLENGES,
  SPIRIT_NURTURE_RITES,
  SPIRIT_PROVISION_SATCHELS,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_ROUTE_ECOLOGY_SURVEYS,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_ROUTE_PATROLS,
  SPIRIT_ROUTE_WAYSTONES,
  SPIRIT_ROSTER_ARCHIVES,
  SPIRIT_SANCTUARY_RITES,
  SPIRIT_TEAM_SPAR_MATCHES,
  SPIRIT_TEMPERAMENT_CONCORDS,
  SPIRIT_TECHNIQUE_LOADOUTS,
  SPIRIT_TOURNAMENT_BRACKETS,
  SPIRIT_TRAIT_ATTUNEMENTS,
  growthStageFromBond,
  resolveSpiritAttunement,
  resolveSpiritCapture,
  resolveSpiritCareCycle,
  resolveSpiritCompendiumCompletion,
  resolveSpiritConditionWeave,
  resolveSpiritCraftWrit,
  resolveSpiritExpedition,
  resolveSpiritFieldAccord,
  resolveSpiritFieldAlmanac,
  resolveGuildCommission,
  resolveGuildAscensionTrial,
  resolveGuildInsigniaCase,
  resolveGuildSocialRally,
  resolveGuildWayfarerChronicle,
  resolveMochiStoryChapter,
  resolveSpiritJournal,
  resolveSpiritKinshipAlbum,
  resolveSpiritMentorChallenge,
  resolveSpiritNurtureRite,
  resolveSpiritParty,
  resolveSpiritRaisingAction,
  resolveSpiritBattleRound,
  resolveSpiritBondMilestone,
  resolveSpiritRouteInvitation,
  resolveSpiritRouteEcologySurvey,
  resolveSpiritRouteWaystone,
  resolveSpiritRouteMastery,
  resolveSpiritRoutePatrol,
  resolveMochiSpiritQuestProgress,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleTactic,
  resolveGuildRankTrial,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritProvisionSatchel,
  resolveSpiritResearchFolio,
  resolveSpiritRosterArchive,
  resolveSpiritSanctuaryRite,
  resolveSpiritTeamSparMatch,
  resolveSpiritTemperamentConcord,
  resolveSpiritTechniqueLoadout,
  resolveSpiritTournamentBracket,
  resolveSpiritTraitAttunement,
  selectSpiritRaisingNeed,
  selectMochiSpiritQuest,
  resolveSpiritSparLadder,
  resolveSpiritTechniqueMastery,
  resolveSpiritTrainingBattle
} from '../src/alpha/content';
import { ALPHA_ACTION_TYPES, ALPHA_FEATURES, SERVER_ENV_CONTRACT, isAlphaActionEnvelope } from '../src/integration/alpha-contract';

describe('alpha contract', () => {
  it('keeps the closed alpha no-real-value and Canary scoped', () => {
    expect(ALPHA_FEATURES.alpha.noRealValue).toBe(true);
    expect(ALPHA_FEATURES.alpha.allowlistRequired).toBe(true);
    expect(ALPHA_FEATURES.chain.network).toBe('CANARY');
    expect(ALPHA_FEATURES.gameplay.partyFormation).toBe(true);
    expect(ALPHA_FEATURES.gameplay.sparringLadder).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritJournal).toBe(true);
    expect(ALPHA_FEATURES.gameplay.techniqueMastery).toBe(true);
    expect(ALPHA_FEATURES.gameplay.techniqueLoadouts).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritTraits).toBe(true);
    expect(ALPHA_FEATURES.gameplay.fieldExpeditions).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeInvitations).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeMastery).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routePatrols).toBe(true);
    expect(ALPHA_FEATURES.gameplay.habitatBonds).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritSanctuaryRites).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritResearch).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritCompendium).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritRosterArchives).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritCareCycles).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritTemperamentConcords).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritFieldAlmanacs).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeEcologySurveys).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritCraftWrits).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeWaystones).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritNurtureRites).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritKinshipAlbums).toBe(true);
    expect(ALPHA_FEATURES.gameplay.itemProvisions).toBe(true);
    expect(ALPHA_FEATURES.gameplay.guildCommissions).toBe(true);
    expect(ALPHA_FEATURES.gameplay.socialRallies).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritStoryChapters).toBe(true);
    expect(ALPHA_FEATURES.gameplay.guildInsigniaCases).toBe(true);
    expect(ALPHA_FEATURES.gameplay.wayfarerChronicles).toBe(true);
    expect(ALPHA_FEATURES.gameplay.guildAscensionTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.affinityTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.battleTactics).toBe(true);
    expect(ALPHA_FEATURES.gameplay.guildRankTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritGrowthRites).toBe(true);
    expect(ALPHA_FEATURES.gameplay.bondMilestones).toBe(true);
    expect(ALPHA_FEATURES.gameplay.partyHarmony).toBe(true);
    expect(ALPHA_FEATURES.gameplay.harmonyTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.teamSparMatches).toBe(true);
    expect(ALPHA_FEATURES.gameplay.mentorChallenges).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritTournamentBrackets).toBe(true);
    expect(ALPHA_FEATURES.gameplay.battleRoundTranscripts).toBe(true);
    expect(ALPHA_FEATURES.gameplay.conditionWeaves).toBe(true);
    expect(ALPHA_FEATURES.gameplay.fieldAccords).toBe(true);
    expect(ALPHA_FEATURES.gameplay.questChains).toBe(true);
    expect(ALPHA_FEATURES.market.auctions).toBe(false);
    expect(ALPHA_FEATURES.ugc).toBe('curated');
  });

  it('defines exactly three original alpha companion species', () => {
    expect(MOCHI_SPIRITS).toHaveLength(3);
    expect(MOCHI_SPIRITS.map((spirit) => spirit.id)).toEqual(['lirabao', 'jintari', 'aozhen']);
    expect(MOCHI_SPIRITS.filter((spirit) => spirit.certificateEligible)).toHaveLength(1);
    expect(MOCHI_SPIRITS.filter((spirit) => spirit.certificateEligible).map((spirit) => spirit.id)).toEqual(['lirabao']);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.attunement.label.length > 4)).toBe(true);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.capture.invitationLabel.length > 4)).toBe(true);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.battle.moves.length >= 2)).toBe(true);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.raisingNeeds.length >= 1)).toBe(true);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.bondMilestones.length === 3)).toBe(true);
    expect(new Set(Object.values(SPIRIT_BOND_MILESTONES).map((milestone) => milestone.label)).size).toBe(9);
  });

  it('uses stable bond thresholds for visible growth', () => {
    expect(growthStageFromBond(1)).toBe('seed');
    expect(growthStageFromBond(3)).toBe('sprout');
    expect(growthStageFromBond(5)).toBe('glow');
  });

  it('documents server-only environment names without service-role keys', () => {
    expect(SERVER_ENV_CONTRACT).toContain('MOCHI_SOCIAL_GAME_SERVER_TOKEN');
    expect(SERVER_ENV_CONTRACT.some((name) => name.includes('SERVICE_ROLE'))).toBe(false);
  });

  it('validates alpha action envelopes', () => {
    expect(ALPHA_ACTION_TYPES).toContain('chain.operation_update');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.capture');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.route_invite');
    expect(ALPHA_ACTION_TYPES).toContain('world.route_mastery');
    expect(ALPHA_ACTION_TYPES).toContain('world.route_patrol');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.habitat_bond');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.sanctuary_rite');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.research');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.compendium_complete');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.roster_archive');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.care_cycle');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.temperament_concord');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.field_almanac');
    expect(ALPHA_ACTION_TYPES).toContain('world.route_ecology');
    expect(ALPHA_ACTION_TYPES).toContain('item.craft_writ');
    expect(ALPHA_ACTION_TYPES).toContain('world.route_waystone');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.nurture_rite');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.kinship_album');
    expect(ALPHA_ACTION_TYPES).toContain('item.provision_satchel');
    expect(ALPHA_ACTION_TYPES).toContain('guild.commission_complete');
    expect(ALPHA_ACTION_TYPES).toContain('guild.social_rally');
    expect(ALPHA_ACTION_TYPES).toContain('story.chapter_complete');
    expect(ALPHA_ACTION_TYPES).toContain('guild.insignia_case');
    expect(ALPHA_ACTION_TYPES).toContain('guild.wayfarer_chronicle');
    expect(ALPHA_ACTION_TYPES).toContain('guild.ascension_trial');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.attune');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.journal');
    expect(ALPHA_ACTION_TYPES).toContain('world.expedition');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.technique');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.technique_loadout');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.trait_attune');
    expect(ALPHA_ACTION_TYPES).toContain('battle.tactic_scroll');
    expect(ALPHA_ACTION_TYPES).toContain('guild.rank_trial');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.growth_rite');
    expect(ALPHA_ACTION_TYPES).toContain('party.set');
    expect(ALPHA_ACTION_TYPES).toContain('party.harmony_form');
    expect(ALPHA_ACTION_TYPES).toContain('battle.harmony_trial');
    expect(ALPHA_ACTION_TYPES).toContain('battle.team_spar_match');
    expect(ALPHA_ACTION_TYPES).toContain('battle.mentor_challenge');
    expect(ALPHA_ACTION_TYPES).toContain('battle.tournament_bracket');
    expect(ALPHA_ACTION_TYPES).toContain('battle.condition_weave');
    expect(ALPHA_ACTION_TYPES).toContain('battle.affinity_trial');
    expect(ALPHA_ACTION_TYPES).toContain('battle.spar_ladder');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.train');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.raise');
    expect(ALPHA_ACTION_TYPES).toContain('quest.accept');
    expect(ALPHA_ACTION_TYPES).toContain('quest.progress');
    expect(ALPHA_ACTION_TYPES).toContain('market.fixed_list');
    expect(ALPHA_ACTION_TYPES).toContain('trade.direct_offer');
    expect(ALPHA_ACTION_TYPES).toContain('chain.withdraw_request');
    expect(ALPHA_ACTION_TYPES).toContain('chain.deposit_request');
    expect(ALPHA_ACTION_TYPES).toContain('chain.operation_update');
    expect(isAlphaActionEnvelope({ requestId: 'req_123456789', type: 'spirit.care', payload: {} })).toBe(true);
    expect(isAlphaActionEnvelope({ requestId: 'short', type: 'spirit.care', payload: {} })).toBe(false);
    expect(isAlphaActionEnvelope({ requestId: 'req_123456789', type: 'economy.cashout', payload: {} })).toBe(false);
  });

  it('resolves original Mochirii capture, attunement, journal, technique, party, spar, training, raising, and quest content', () => {
    const capture = resolveSpiritCapture('lirabao', 'lantern-harmony-tea', 2, []);
    expect(capture).toMatchObject({
      ok: true,
      alreadyRostered: false,
      spiritId: 'lirabao',
      bond: 1,
      growth: 'seed',
      source: 'spirit-capture'
    });
    expect(capture.message).toContain('Lantern Harmony Invitation');
    expect(resolveSpiritCapture('aozhen', 'lantern-harmony-tea', 1, []).ok).toBe(false);
    expect(resolveSpiritCapture('lirabao', 'lantern-harmony-tea', 2, ['lirabao']).alreadyRostered).toBe(true);

    const attunement = resolveSpiritAttunement('lirabao', 'mochirii-guild-seal');
    expect(attunement).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      bond: 1,
      growth: 'seed',
      source: 'spirit-attune'
    });
    expect(resolveSpiritAttunement('jintari', 'mochirii-guild-seal').ok).toBe(false);

    const journal = resolveSpiritJournal(['lirabao', 'jintari'], 'jintari', { lirabao: 3, jintari: 2 }, { lirabao: 'sprout', jintari: 'seed' });
    expect(journal).toMatchObject({
      ok: true,
      activeSpiritId: 'jintari',
      discoveredCount: 2,
      totalCount: 3,
      source: 'spirit-journal'
    });
    expect(journal.records.filter((record) => record.discovered).map((record) => record.spiritId)).toEqual(['lirabao', 'jintari']);
    expect(journal.records.find((record) => record.spiritId === 'aozhen')?.discovered).toBe(false);
    expect(journal.message).toContain('Mochirii spirit journal');
    expect(resolveSpiritJournal([]).ok).toBe(false);

    const expedition = resolveSpiritExpedition('moonbridge-bamboo-trail', ['lirabao'], 'lirabao', 2, []);
    expect(expedition).toMatchObject({
      ok: true,
      routeId: 'moonbridge-bamboo-trail',
      routeName: 'Moonbridge Bamboo Trail',
      encounterSpiritId: 'jintari',
      recommendedItemId: 'jade-thread-charm',
      rewardItemId: 'moonbridge-field-ribbon',
      harmonyScore: 2,
      discoveredRoutes: ['moonbridge-bamboo-trail'],
      source: 'world-expedition'
    });
    expect(expedition.message).toContain('Jintari signs');
    expect(resolveSpiritExpedition('moonbridge-bamboo-trail', [], undefined, 2, []).ok).toBe(false);
    expect(resolveSpiritExpedition('cloudbell-reed-bank', ['lirabao'], 'lirabao', 2, []).ok).toBe(false);

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
      rewardItemId: 'jade-field-accord-talisman',
      source: 'spirit-field-accord'
    });

    const routeInvitation = resolveSpiritRouteInvitation(
      'moonbridge-bamboo-trail',
      'jade-thread-charm',
      3,
      ['lirabao'],
      ['moonbridge-bamboo-trail'],
      true
    );
    expect(routeInvitation).toMatchObject({
      ok: true,
      alreadyRostered: false,
      routeId: 'moonbridge-bamboo-trail',
      routeName: 'Moonbridge Bamboo Trail',
      spiritId: 'jintari',
      requiredItemId: 'jade-thread-charm',
      harmonyRequired: 3,
      harmonyScore: 3,
      roster: ['lirabao', 'jintari'],
      bond: 1,
      growth: 'seed',
      source: 'spirit-route-invite'
    });
    expect(routeInvitation.message).toContain('joins your Mochirii roster by consent');
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'jade-thread-charm', 3, ['lirabao'], []).ok).toBe(false);
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'jade-thread-charm', 3, ['lirabao'], ['moonbridge-bamboo-trail']).ok).toBe(false);
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'lantern-harmony-tea', 3, ['lirabao'], ['moonbridge-bamboo-trail']).ok).toBe(false);
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'jade-thread-charm', 2, ['lirabao'], ['moonbridge-bamboo-trail'], true).ok).toBe(false);

    const cloudbell = resolveSpiritExpedition('cloudbell-reed-bank', ['lirabao', 'jintari'], 'jintari', 4, ['moonbridge-bamboo-trail']);
    expect(cloudbell).toMatchObject({
      ok: true,
      routeId: 'cloudbell-reed-bank',
      routeName: 'Cloudbell Reed Bank',
      encounterSpiritId: 'aozhen',
      recommendedItemId: 'lantern-harmony-tea',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      source: 'world-expedition'
    });
    const cloudbellInvitation = resolveSpiritRouteInvitation(
      'cloudbell-reed-bank',
      'lantern-harmony-tea',
      4,
      ['lirabao', 'jintari'],
      ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      true
    );
    expect(cloudbellInvitation).toMatchObject({
      ok: true,
      routeId: 'cloudbell-reed-bank',
      routeName: 'Cloudbell Reed Bank',
      spiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      source: 'spirit-route-invite'
    });

    expect(SPIRIT_ROUTE_MASTERIES.map((mastery) => mastery.id)).toEqual(['jade-cloudbell-circuit']);
    const routeMastery = resolveSpiritRouteMastery({
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      roster: ['lirabao', 'jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      guildRankProof: true,
      rankTrialId: 'jade-court-initiate'
    });
    expect(routeMastery).toMatchObject({
      ok: true,
      mastered: true,
      masteryId: 'jade-cloudbell-circuit',
      title: 'Jade Cloudbell Circuit',
      score: 21,
      requiredScore: 21,
      rewardItemId: 'cloudbell-route-knot',
      source: 'world-route-mastery'
    });
    expect(routeMastery.message).toContain('first-circuit Mochirii routes');
    expect(resolveSpiritRouteMastery({
      discoveredRoutes: ['moonbridge-bamboo-trail'],
      roster: ['lirabao', 'jintari'],
      journalDiscoveredCount: 2,
      completedQuestIds: ['first-lantern-vow'],
      guildRankProof: false
    }).mastered).toBe(false);

    expect(SPIRIT_ROUTE_PATROLS.map((patrol) => patrol.id)).toEqual(['jade-cloudbell-patrol']);
    const routePatrol = resolveSpiritRoutePatrol({
      routeId: 'cloudbell-reed-bank',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 18,
      battleRoundOpponentScore: 8,
      harmonyFormProof: true,
      teamSparMatchProof: true,
      mentorChallengeProof: true,
      chatLines: ['Local route patrol proof.']
    });
    expect(routePatrol).toMatchObject({
      ok: true,
      patrolled: true,
      patrolId: 'jade-cloudbell-patrol',
      patrolName: 'Jade Cloudbell Patrol',
      routeId: 'cloudbell-reed-bank',
      score: 33,
      requiredScore: 24,
      rewardItemId: 'jade-route-patrol-pennant',
      source: 'world-route-patrol'
    });
    expect(resolveSpiritRoutePatrol({
      routeId: 'cloudbell-reed-bank',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      routeMasteryProof: false,
      fieldAccordProof: true,
      fieldAccordId: 'cloudbell-skyvow-accord',
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 18,
      battleRoundOpponentScore: 8,
      chatLines: ['Local route patrol proof.']
    }).patrolled).toBe(false);

    expect(SPIRIT_HABITAT_BONDS.map((bond) => bond.id)).toEqual(['jade-court-habitat-bond']);
    const habitatBond = resolveSpiritHabitatBond({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      journalDiscoveredCount: 3,
      careProof: true,
      bond: 3,
      growth: 'sprout',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy'
    });
    expect(habitatBond).toMatchObject({
      ok: true,
      bonded: true,
      bondId: 'jade-court-habitat-bond',
      bondName: 'Jade Court Habitat Bond',
      title: 'First Shared Habitat Bond',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      score: 18,
      requiredScore: 15,
      rewardItemId: 'jade-court-habitat-tassel',
      source: 'spirit-habitat-bond'
    });
    expect(habitatBond.message).toContain('journal, care, guild, status, and profile proof');
    expect(resolveSpiritHabitatBond({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      journalDiscoveredCount: 3,
      careProof: false,
      bond: 3,
      growth: 'sprout',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy'
    }).bonded).toBe(false);

    expect(SPIRIT_SANCTUARY_RITES.map((rite) => rite.id)).toEqual(['jade-court-sanctuary-rite']);
    const sanctuary = resolveSpiritSanctuaryRite({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careStreak: 1,
      trainingXp: 3,
      habitatBondProof: true,
      conditionWeaveProof: true,
      battleRoundProof: true,
      battleRoundVictory: true
    });
    expect(sanctuary).toMatchObject({
      ok: true,
      restored: true,
      riteId: 'jade-court-sanctuary-rite',
      riteName: 'Jade Court Sanctuary Rite',
      title: 'First Care Shrine Restore',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      totalBond: 12,
      careStreak: 1,
      trainingXp: 3,
      score: 33,
      requiredScore: 24,
      rewardItemId: 'jade-sanctuary-bell',
      source: 'spirit-sanctuary-rite'
    });
    expect(sanctuary.message).toContain('No real value');
    expect(resolveSpiritSanctuaryRite({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careStreak: 1,
      trainingXp: 3,
      habitatBondProof: false,
      conditionWeaveProof: true,
      battleRoundProof: true,
      battleRoundVictory: true
    }).restored).toBe(false);

    expect(SPIRIT_RESEARCH_FOLIOS.map((folio) => folio.id)).toEqual(['jade-court-research-folio']);
    const research = resolveSpiritResearchFolio({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      journalDiscoveredCount: 3,
      habitatBondProof: true,
      habitatBondId: 'jade-court-habitat-bond',
      techniqueProof: true,
      tacticProof: true,
      affinityProof: true,
      trainingXp: 3
    });
    expect(research).toMatchObject({
      ok: true,
      recorded: true,
      folioId: 'jade-court-research-folio',
      folioName: 'Jade Court Research Folio',
      title: 'First Mochirii Field Guide',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      score: 20,
      requiredScore: 18,
      rewardItemId: 'jade-court-research-folio',
      source: 'spirit-research-folio'
    });
    expect(research.message).toContain('roster, routes, journal, habitat, technique, tactic, affinity, and training proof');
    expect(resolveSpiritResearchFolio({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      journalDiscoveredCount: 3,
      habitatBondProof: false,
      techniqueProof: true,
      tacticProof: true,
      affinityProof: true,
      trainingXp: 3
    }).recorded).toBe(false);

    expect(SPIRIT_COMPENDIUMS.map((compendium) => compendium.id)).toEqual(['jade-court-spirit-compendium']);
    const compendium = resolveSpiritCompendiumCompletion({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      journalDiscoveredCount: 3,
      habitatBondProof: true,
      habitatBondId: 'jade-court-habitat-bond',
      researchProof: true,
      researchFolioId: 'jade-court-research-folio',
      routeMasteryProof: true
    });
    expect(compendium).toMatchObject({
      ok: true,
      completed: true,
      compendiumId: 'jade-court-spirit-compendium',
      compendiumName: 'Jade Court Spirit Compendium',
      title: 'First-Court Spirit Collection Proof',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      score: 29,
      requiredScore: 25,
      rewardItemId: 'jade-court-compendium-seal',
      source: 'spirit-compendium'
    });
    expect(compendium.message).toContain('No-real-value collection progress');
    expect(resolveSpiritCompendiumCompletion({
      roster: ['lirabao'],
      discoveredRoutes: [],
      journalDiscoveredCount: 1,
      habitatBondProof: false,
      researchProof: false,
      routeMasteryProof: false
    }).completed).toBe(false);

    expect(SPIRIT_ROSTER_ARCHIVES.map((archive) => archive.id)).toEqual(['jade-court-roster-archive']);
    const rosterArchive = resolveSpiritRosterArchive({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['aozhen', 'lirabao'],
      activeSpiritId: 'aozhen',
      journalDiscoveredCount: 3,
      compendiumProof: true,
      compendiumId: 'jade-court-spirit-compendium',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(rosterArchive).toMatchObject({
      ok: true,
      archived: true,
      archiveId: 'jade-court-roster-archive',
      archiveName: 'Jade Court Roster Archive',
      title: 'First Spirit Roster Archive',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['aozhen', 'lirabao'],
      reserveSpiritIds: ['jintari'],
      score: 29,
      requiredScore: 22,
      rewardItemId: 'jade-roster-archive-seal',
      source: 'spirit-roster-archive'
    });
    expect(rosterArchive.message).toContain('No real value');
    expect(resolveSpiritRosterArchive({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['aozhen', 'lirabao'],
      journalDiscoveredCount: 3,
      compendiumProof: false,
      compendiumId: 'jade-court-spirit-compendium',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    }).archived).toBe(false);

    expect(SPIRIT_PROVISION_SATCHELS.map((satchel) => satchel.id)).toEqual(['jade-court-provision-satchel']);
    const satchel = resolveSpiritProvisionSatchel({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      journalDiscoveredCount: 3,
      marketProof: true,
      tradeProof: true,
      routeInviteProof: true,
      careStreak: 1,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar']
    });
    expect(satchel).toMatchObject({
      ok: true,
      stocked: true,
      satchelId: 'jade-court-provision-satchel',
      satchelName: 'Jade Court Provision Satchel',
      title: 'First-Court Provision Bag',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      score: 30,
      requiredScore: 24,
      rewardItemId: 'jade-court-provision-satchel',
      source: 'item-provision-satchel'
    });
    expect(satchel.message).toContain('No-real-value item preparation');
    expect(resolveSpiritProvisionSatchel({
      roster: ['lirabao'],
      journalDiscoveredCount: 1,
      marketProof: false,
      tradeProof: false,
      routeInviteProof: false,
      careStreak: 0,
      completedQuestIds: []
    }).stocked).toBe(false);

    expect(SPIRIT_CARE_CYCLES.map((cycle) => cycle.id)).toEqual(['jade-court-care-cycle']);
    const careCycle = resolveSpiritCareCycle({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careStreak: 1,
      trainingXp: 3,
      raisingProof: true,
      raisingMilestoneLabel: 'Skybell Whisper Spark',
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
      ok: true,
      cycled: true,
      cycleId: 'jade-court-care-cycle',
      cycleName: 'Jade Court Care Cycle',
      title: 'First Full-Roster Care Rotation',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      totalBond: 12,
      careStreak: 1,
      trainingXp: 3,
      score: 48,
      requiredScore: 32,
      rewardItemId: 'jade-care-cycle-knot',
      source: 'spirit-care-cycle'
    });
    expect(careCycle.message).toContain('No real value');
    expect(resolveSpiritCareCycle({
      roster: ['lirabao', 'jintari', 'aozhen'],
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careStreak: 1,
      trainingXp: 3,
      raisingProof: true,
      rosterArchiveProof: true,
      rosterArchiveId: 'jade-court-roster-archive',
      provisionProof: false,
      provisionSatchelId: 'jade-court-provision-satchel',
      sanctuaryRiteProof: true,
      sanctuaryRiteId: 'jade-court-sanctuary-rite',
      profileViewed: true,
      guildBuddyProof: true
    }).cycled).toBe(false);

    expect(SPIRIT_TEMPERAMENT_CONCORDS.map((concord) => concord.id)).toEqual(['jade-temperament-concord']);
    const temperament = resolveSpiritTemperamentConcord({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Temperament concord ready.']
    });
    expect(temperament).toMatchObject({
      ok: true,
      concorded: true,
      concordId: 'jade-temperament-concord',
      concordName: 'Jade Temperament Concord',
      title: 'First Temperament Identity Concord',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      temperamentLabels: ['gentle', 'bright', 'curious'],
      totalBond: 12,
      score: 41,
      requiredScore: 36,
      rewardItemId: 'jade-temperament-charm',
      source: 'spirit-temperament-concord'
    });
    expect(temperament.message).toContain('No real value');
    expect(resolveSpiritTemperamentConcord({
      roster: ['lirabao', 'jintari', 'aozhen'],
      bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
      careCycleProof: false,
      careCycleId: 'jade-court-care-cycle',
      traitAttunementProof: true,
      traitAttunementId: 'jade-heart-trait',
      conditionWeaveProof: true,
      conditionWeaveId: 'jade-mirror-condition-weave',
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Temperament concord ready.']
    }).concorded).toBe(false);

    expect(SPIRIT_FIELD_ALMANACS.map((almanac) => almanac.id)).toEqual(['jade-field-almanac']);
    const almanac = resolveSpiritFieldAlmanac({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
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
      chatLines: ['Field almanac ready.']
    });
    expect(almanac).toMatchObject({
      ok: true,
      recorded: true,
      almanacId: 'jade-field-almanac',
      almanacName: 'Jade Field Almanac',
      title: 'First-Court Field Almanac',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      routeIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      speciesIds: ['lirabao', 'jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      score: 44,
      requiredScore: 38,
      rewardItemId: 'jade-field-almanac-clasp',
      source: 'spirit-field-almanac'
    });
    expect(almanac.message).toContain('No real value');
    expect(resolveSpiritFieldAlmanac({
      roster: ['lirabao', 'jintari', 'aozhen'],
      discoveredRoutes: ['moonbridge-bamboo-trail'],
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
      chatLines: ['Field almanac ready.']
    }).recorded).toBe(false);

    expect(SPIRIT_ROUTE_ECOLOGY_SURVEYS.map((survey) => survey.id)).toEqual(['jade-route-ecology-survey']);
    const routeEcology = resolveSpiritRouteEcologySurvey({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
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
      ok: true,
      surveyed: true,
      surveyId: 'jade-route-ecology-survey',
      surveyName: 'Jade Route Ecology Survey',
      title: 'First-Court Encounter Ecology Survey',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      routeIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      speciesIds: ['lirabao', 'jintari', 'aozhen'],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      score: 45,
      requiredScore: 42,
      rewardItemId: 'jade-route-ecology-map',
      source: 'spirit-route-ecology'
    });
    expect(routeEcology.message).toContain('No real value');
    expect(resolveSpiritRouteEcologySurvey({
      roster: ['lirabao', 'jintari', 'aozhen'],
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
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
    }).surveyed).toBe(false);

    expect(SPIRIT_CRAFT_WRITS.map((writ) => writ.id)).toEqual(['jade-court-craft-writ']);
    const craftWrit = resolveSpiritCraftWrit({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'jintari',
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
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
      ok: true,
      crafted: true,
      writId: 'jade-court-craft-writ',
      writName: 'Jade Court Craft Writ',
      title: 'First-Court Craft Ledger',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'jintari',
      activeSpiritName: 'Jintari',
      roster: ['lirabao', 'jintari', 'aozhen'],
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
      score: 47,
      requiredScore: 44,
      rewardItemId: 'jade-court-craft-writ',
      source: 'spirit-craft-writ'
    });
    expect(craftWrit.message).toContain('No real value');
    expect(resolveSpiritCraftWrit({
      roster: ['lirabao', 'jintari', 'aozhen'],
      recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
      stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
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
    }).crafted).toBe(false);

    expect(SPIRIT_ROUTE_WAYSTONES.map((waystone) => waystone.id)).toEqual(['jade-cloudbell-waystone']);
    const routeWaystone = resolveSpiritRouteWaystone({
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
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
      ok: true,
      activated: true,
      waystoneId: 'jade-cloudbell-waystone',
      waystoneName: 'Jade Cloudbell Waystone',
      title: 'First Route Travel Seal',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      routeIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
      score: 31,
      requiredScore: 30,
      rewardItemId: 'jade-waystone-travel-seal',
      source: 'world-route-waystone'
    });
    expect(routeWaystone.message).toContain('No real value');
    expect(resolveSpiritRouteWaystone({
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      routeInvitedSpiritIds: ['jintari', 'aozhen'],
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
    }).activated).toBe(false);

    expect(SPIRIT_NURTURE_RITES.map((rite) => rite.id)).toEqual(['jade-moonwell-nurture-rite']);
    const nurtureRite = resolveSpiritNurtureRite({
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
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
      chatLines: ['Ready for the first nurture rite.']
    });
    expect(nurtureRite).toMatchObject({
      ok: true,
      nurtured: true,
      riteId: 'jade-moonwell-nurture-rite',
      riteName: 'Jade Moonwell Nurture Rite',
      title: 'First-Court Raising Seal',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      score: 43,
      requiredScore: 40,
      rewardItemId: 'jade-moonwell-nurture-ribbon',
      source: 'spirit-nurture-rite'
    });
    expect(nurtureRite.message).toContain('No real value');

    expect(SPIRIT_KINSHIP_ALBUMS.map((entry) => entry.id)).toEqual(['jade-kinship-album']);
    const kinshipAlbum = resolveSpiritKinshipAlbum({
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
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
      ok: true,
      recorded: true,
      albumId: 'jade-kinship-album',
      albumName: 'Jade Kinship Album',
      title: 'First-Court Bond Album',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      totalBond: 15,
      score: 53,
      requiredScore: 38,
      rewardItemId: 'jade-kinship-album',
      source: 'spirit-kinship-album'
    });
    expect(kinshipAlbum.message).toContain('No real value');
    const missingKinshipAlbum = resolveSpiritKinshipAlbum({
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
      localPresenceCount: 1,
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      nurtureRiteProof: false,
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
    expect(missingKinshipAlbum.recorded).toBe(false);
    expect(missingKinshipAlbum.missing).toContain('presence:1/2');
    expect(missingKinshipAlbum.missing).toContain('nurture:jade-moonwell-nurture-rite');
    expect(resolveSpiritNurtureRite({
      roster: ['lirabao', 'jintari', 'aozhen'],
      caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
      careCycleProof: true,
      careCycleId: 'jade-court-care-cycle',
      growthRiteProof: false,
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
      chatLines: ['Ready for the first nurture rite.']
    }).nurtured).toBe(false);

    expect(GUILD_COMMISSIONS.map((commission) => commission.id)).toEqual(['jade-court-commission-ledger']);
    const commission = resolveGuildCommission({
      roster: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      journalDiscoveredCount: 3,
      questChainProof: true,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      provisionProof: true,
      provisionSatchelId: 'jade-court-provision-satchel',
      marketProof: true,
      tradeProof: true,
      trainingXp: 3,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the first social commission.']
    });
    expect(commission).toMatchObject({
      ok: true,
      completed: true,
      commissionId: 'jade-court-commission-ledger',
      commissionName: 'Jade Court Commission Ledger',
      title: 'First Social Commission Ledger',
      habitat: 'Jade Lantern Court',
      activeSpiritId: 'aozhen',
      roster: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      score: 32,
      requiredScore: 24,
      rewardItemId: 'jade-court-commission-knot',
      source: 'guild-commission-ledger'
    });
    expect(commission.message).toContain('No-real-value guild reputation');
    expect(resolveGuildCommission({
      roster: ['lirabao'],
      journalDiscoveredCount: 1,
      questChainProof: false,
      completedQuestIds: [],
      provisionProof: false,
      marketProof: false,
      tradeProof: false,
      trainingXp: 0,
      profileViewed: false,
      guildBuddyProof: false
    }).completed).toBe(false);

    expect(GUILD_SOCIAL_RALLIES.map((rally) => rally.id)).toEqual(['jade-courtyard-rally']);
    const socialRally = resolveGuildSocialRally({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the first guild rally.'],
      emoteProof: true,
      commissionProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true
    });
    expect(socialRally).toMatchObject({
      ok: true,
      rallied: true,
      rallyId: 'jade-courtyard-rally',
      rallyName: 'Jade Courtyard Rally',
      title: 'First Two-Tester Guild Rally',
      habitat: 'Jade Lantern Court',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      score: 30,
      requiredScore: 22,
      rewardItemId: 'jade-courtyard-rally-knot',
      source: 'guild-social-rally'
    });
    expect(socialRally.message).toContain('no-injury party proof');
    const missingRally = resolveGuildSocialRally({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 1,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the first guild rally.'],
      emoteProof: true,
      commissionProof: true,
      harmonyFormProof: true,
      harmonyTrialProof: true,
      teamSparMatchProof: true
    });
    expect(missingRally.rallied).toBe(false);
    expect(missingRally.missing).toContain('presence:1/2');

    expect(MOCHI_STORY_CHAPTERS.map((chapter) => chapter.id)).toEqual(['jade-scroll-story-chapter']);
    const storyChapter = resolveMochiStoryChapter({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
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
      chatLines: ['Ready for the first story chapter.']
    });
    expect(storyChapter).toMatchObject({
      ok: true,
      recorded: true,
      chapterId: 'jade-scroll-story-chapter',
      chapterName: 'Jade Scroll Story Chapter',
      title: 'First-Court Roleplay Chapter',
      narratorName: 'Sifu Narao',
      habitat: 'Jade Lantern Court',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      routeIds: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      localPresenceCount: 2,
      score: 56,
      requiredScore: 42,
      rewardItemId: 'jade-scroll-story-chapter',
      source: 'story-chapter'
    });
    expect(storyChapter.message).toContain('No real value');
    const missingStoryChapter = resolveMochiStoryChapter({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
      journalDiscoveredCount: 3,
      localPresenceCount: 1,
      routeEcologyProof: true,
      routeEcologyId: 'jade-route-ecology-survey',
      routeWaystoneProof: true,
      routeWaystoneId: 'jade-cloudbell-waystone',
      nurtureRiteProof: true,
      nurtureRiteId: 'jade-moonwell-nurture-rite',
      tournamentProof: false,
      tournamentId: 'jade-banner-tournament',
      commissionProof: true,
      commissionId: 'jade-court-commission-ledger',
      rallyProof: true,
      rallyId: 'jade-courtyard-rally',
      profileViewed: true,
      guildBuddyProof: true,
      emoteProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the first story chapter.']
    });
    expect(missingStoryChapter.recorded).toBe(false);
    expect(missingStoryChapter.missing).toContain('presence:1/2');
    expect(missingStoryChapter.missing).toContain('tournament:jade-banner-tournament');

    expect(GUILD_INSIGNIA_CASES.map((entry) => entry.id)).toEqual(['jade-insignia-case']);
    const insigniaCase = resolveGuildInsigniaCase({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
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
      chatLines: ['Ready for the first insignia case.']
    });
    expect(insigniaCase).toMatchObject({
      ok: true,
      completed: true,
      caseId: 'jade-insignia-case',
      caseName: 'Jade Insignia Case',
      title: 'First-Court Progression Case',
      habitat: 'Jade Lantern Court',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      score: 44,
      requiredScore: 34,
      rewardItemId: 'jade-insignia-case',
      source: 'guild-insignia-case'
    });
    expect(insigniaCase.message).toContain('No real value');
    const missingInsigniaCase = resolveGuildInsigniaCase({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 1,
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
      storyChapterProof: false,
      storyChapterId: 'jade-scroll-story-chapter',
      harmonyFormProof: true,
      harmonyFormId: 'triune-jade-harmony',
      profileViewed: true,
      guildBuddyProof: true,
      emoteProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the first insignia case.']
    });
    expect(missingInsigniaCase.completed).toBe(false);
    expect(missingInsigniaCase.missing).toContain('presence:1/2');
    expect(missingInsigniaCase.missing).toContain('story:jade-scroll-story-chapter');

    expect(GUILD_WAYFARER_CHRONICLES.map((chronicle) => chronicle.id)).toEqual(['jade-wayfarer-chronicle']);
    const chronicle = resolveGuildWayfarerChronicle({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      localPresenceCount: 2,
      captureProof: true,
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
      chatLines: ['Ready for the first wayfarer chronicle.']
    });
    expect(chronicle).toMatchObject({
      ok: true,
      chronicled: true,
      chronicleId: 'jade-wayfarer-chronicle',
      chronicleName: 'Jade Wayfarer Chronicle',
      title: 'First-Court Alpha Chronicle',
      habitat: 'Jade Lantern Court',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      score: 103,
      requiredScore: 64,
      rewardItemId: 'jade-wayfarer-chronicle-clasp',
      source: 'guild-wayfarer-chronicle'
    });
    expect(chronicle.message).toContain('No real value');
    const missingChronicle = resolveGuildWayfarerChronicle({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      journalDiscoveredCount: 3,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      localPresenceCount: 2,
      captureProof: true,
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
      commissionProof: true,
      rallyProof: false,
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
      chatLines: ['Ready for the first wayfarer chronicle.']
    });
    expect(missingChronicle.chronicled).toBe(false);
    expect(missingChronicle.missing).toContain('rally');

    expect(GUILD_ASCENSION_TRIALS.map((trial) => trial.id)).toEqual(['jade-court-ascension-trial']);
    const ascension = resolveGuildAscensionTrial({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      wayfarerChronicleProof: true,
      kinshipAlbumProof: true,
      routePatrolProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
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
      chatLines: ['Ready for the first ascension trial.']
    });
    expect(ascension).toMatchObject({
      ok: true,
      ascended: true,
      trialId: 'jade-court-ascension-trial',
      trialName: 'Jade Court Ascension Trial',
      title: 'First Closed-Alpha Guild Capstone',
      habitat: 'Jade Lantern Court',
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      score: 71,
      requiredScore: 56,
      rewardItemId: 'jade-court-ascension-ribbon',
      source: 'guild-ascension-trial'
    });
    expect(ascension.message).toContain('No real value');
    const missingAscension = resolveGuildAscensionTrial({
      roster: ['lirabao', 'jintari', 'aozhen'],
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      localPresenceCount: 2,
      wayfarerChronicleProof: false,
      kinshipAlbumProof: true,
      routePatrolProof: true,
      mentorChallengeProof: true,
      tournamentProof: true,
      storyChapterProof: true,
      insigniaCaseProof: true,
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
      chatLines: ['Ready for the first ascension trial.']
    });
    expect(missingAscension.ascended).toBe(false);
    expect(missingAscension.missing).toContain('chronicle');

    expect(SPIRIT_HARMONY_FORMS.map((form) => form.id)).toEqual(['triune-jade-harmony']);
    const harmonyForm = resolveSpiritHarmonyForm({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      growthRiteProof: true,
      growthRiteId: 'moonwell-bloom-rite',
      tacticProof: true,
      affinityProof: true,
      trainingXp: 3,
      sparLadderXp: 5
    });
    expect(harmonyForm).toMatchObject({
      ok: true,
      formed: true,
      formId: 'triune-jade-harmony',
      name: 'Triune Jade Harmony',
      title: 'First Three-Spirit Harmony Form',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      score: 27,
      requiredScore: 27,
      rewardItemId: 'triune-jade-sash',
      source: 'party-harmony-form'
    });
    expect(harmonyForm.message).toContain('no-injury party form');
    expect(resolveSpiritHarmonyForm({
      partyIds: ['lirabao', 'jintari'],
      routeMasteryProof: true,
      routeMasteryId: 'jade-cloudbell-circuit',
      growthRiteProof: false,
      tacticProof: true,
      affinityProof: true,
      trainingXp: 1,
      sparLadderXp: 0
    }).formed).toBe(false);

    expect(SPIRIT_HARMONY_TRIALS.map((trial) => trial.id)).toEqual(['jade-echo-concord']);
    const concord = resolveSpiritHarmonyTrial({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      harmonyFormProof: true,
      harmonyFormId: 'triune-jade-harmony',
      tacticProof: true,
      affinityProof: true,
      sparLadderWins: 1,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for concord.']
    });
    expect(concord).toMatchObject({
      ok: true,
      cleared: true,
      trialId: 'jade-echo-concord',
      trialName: 'Jade Echo Concord Trial',
      title: 'First Social Harmony Battle Trial',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      score: 24,
      requiredScore: 24,
      rewardItemId: 'jade-echo-concord-tally',
      source: 'battle-harmony-trial'
    });
    expect(concord.message).toContain('no-injury team battle');
    expect(resolveSpiritHarmonyTrial({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      harmonyFormProof: true,
      harmonyFormId: 'triune-jade-harmony',
      tacticProof: true,
      affinityProof: true,
      sparLadderWins: 1,
      profileViewed: false,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for concord.']
    }).cleared).toBe(false);

    expect(SPIRIT_TEAM_SPAR_MATCHES.map((match) => match.id)).toEqual(['jade-mirror-team-match']);
    const teamMatch = resolveSpiritTeamSparMatch({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      harmonyTrialProof: true,
      harmonyTrialId: 'jade-echo-concord',
      harmonyTrialScore: 24,
      routeMasteryProof: true,
      tacticProof: true,
      growthRiteProof: true,
      questChainProof: true,
      trainingXp: 3,
      sparLadderWins: 1,
      chatLines: ['Ready for the team match.']
    });
    expect(teamMatch).toMatchObject({
      ok: true,
      cleared: true,
      matchId: 'jade-mirror-team-match',
      matchName: 'Jade Mirror Team Match',
      title: 'First Full-Party Spar Match',
      opponentName: 'Mirror Court Trio',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      score: 32,
      requiredScore: 30,
      rewardItemId: 'jade-mirror-match-ribbon',
      source: 'battle-team-spar-match'
    });
    expect(teamMatch.message).toContain('no-injury full-party spar match');
    expect(resolveSpiritTeamSparMatch({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      harmonyTrialProof: true,
      harmonyTrialId: 'jade-echo-concord',
      harmonyTrialScore: 24,
      routeMasteryProof: true,
      tacticProof: true,
      growthRiteProof: false,
      questChainProof: true,
      trainingXp: 3,
      sparLadderWins: 1,
      chatLines: ['Ready for the team match.']
    }).cleared).toBe(false);

    const technique = resolveSpiritTechniqueMastery('lirabao', 'lantern-pulse', 0, 3);
    expect(technique).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      moveId: 'lantern-pulse',
      masteryLevel: 'practiced',
      masteryXp: 7,
      awardedXp: 7,
      focusScore: 11,
      source: 'spirit-technique'
    });
    expect(technique.message).toContain('Mochirii Technique Dojo');
    expect(resolveSpiritTechniqueMastery('lirabao', 'missing-technique').ok).toBe(false);

    expect(SPIRIT_BATTLE_TACTICS.map((tactic) => tactic.id)).toEqual([
      'lantern-anchor',
      'goldleaf-opening',
      'skybell-ward'
    ]);
    const tactic = resolveSpiritBattleTactic('jintari', 'goldleaf-feint', 'goldleaf-opening', 5, 1);
    expect(tactic).toMatchObject({
      ok: true,
      spiritId: 'jintari',
      moveId: 'goldleaf-feint',
      tacticId: 'goldleaf-opening',
      tacticName: 'Goldleaf Opening Form',
      stance: 'feint',
      focusScore: 15,
      masteryXp: 14,
      awardedXp: 9,
      bondDelta: 1,
      source: 'battle-tactic-scroll'
    });
    expect(tactic.message).toContain('No-injury Mochirii battle planning');
    expect(resolveSpiritBattleTactic('jintari', 'missing-move').ok).toBe(false);

    expect(GUILD_RANK_TRIALS.map((trial) => trial.id)).toEqual(['jade-court-initiate']);
    const rank = resolveGuildRankTrial({
      roster: ['lirabao', 'jintari'],
      activeSpiritId: 'jintari',
      bond: 3,
      completedQuestSteps: ['attune-spirit'],
      tacticProof: true,
      affinityWins: 1,
      sparWins: 0,
      journalDiscoveredCount: 2,
      guildBuddyProof: true
    });
    expect(rank).toMatchObject({
      ok: true,
      passed: true,
      trialId: 'jade-court-initiate',
      trialTitle: 'Jade Court Initiate Trial',
      rankTitle: 'Jade Court Initiate',
      score: 15,
      requiredScore: 9,
      rewardItemId: 'jade-court-rank-seal',
      source: 'guild-rank-trial'
    });
    expect(rank.message).toContain('no-real-value Mochirii guild progress');
    expect(resolveGuildRankTrial({
      roster: ['lirabao'],
      activeSpiritId: 'lirabao',
      bond: 1,
      completedQuestSteps: [],
      tacticProof: false,
      affinityWins: 0,
      sparWins: 0,
      journalDiscoveredCount: 1
    }).passed).toBe(false);

    expect(SPIRIT_GROWTH_RITES.map((rite) => rite.id)).toEqual(['moonwell-bloom-rite']);
    const growthRite = resolveSpiritGrowthRite({
      spiritId: 'jintari',
      bond: 5,
      growth: 'glow',
      trainingXp: 3,
      raisingProof: true,
      rankTrialProof: true,
      rankTrialId: 'jade-court-initiate'
    });
    expect(growthRite).toMatchObject({
      ok: true,
      passed: true,
      riteId: 'moonwell-bloom-rite',
      riteName: 'Moonwell Bloom Rite',
      spiritId: 'jintari',
      spiritName: 'Jintari',
      formTitle: 'Moonwell Bloom Form',
      bond: 5,
      growth: 'glow',
      trainingXp: 3,
      rewardItemId: 'moonwell-bloom-sigil',
      source: 'spirit-growth-rite'
    });
    expect(growthRite.message).toContain('no-real-value Mochirii growth proof');
    expect(resolveSpiritGrowthRite({
      spiritId: 'jintari',
      bond: 4,
      growth: 'sprout',
      trainingXp: 2,
      raisingProof: true,
      rankTrialProof: true,
      rankTrialId: 'jade-court-initiate'
    }).passed).toBe(false);

    const affinity = resolveSpiritAffinityTrial('lirabao', 'lantern-pulse', 'jade-mirror-trial', 3, 7);
    expect(affinity).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      moveId: 'lantern-pulse',
      trialId: 'jade-mirror-trial',
      trialName: 'Jade Mirror Trial',
      affinityAdvantage: true,
      focusScore: 15,
      trialScore: 14,
      victory: true,
      masteryXp: 11,
      bondDelta: 1,
      source: 'battle-affinity-trial'
    });
    expect(affinity.message).toContain('Jade Mirror Trial');
    expect(resolveSpiritAffinityTrial('lirabao', 'missing-move').ok).toBe(false);

    const party = resolveSpiritParty(['lirabao', 'jintari', 'aozhen'], 'jintari');
    expect(party).toMatchObject({
      ok: true,
      activeSpiritId: 'jintari',
      partyIds: ['jintari', 'lirabao', 'aozhen'],
      supportIds: ['lirabao', 'aozhen'],
      source: 'party-formation'
    });
    expect(resolveSpiritParty([]).ok).toBe(false);

    const spar = resolveSpiritSparLadder(['lirabao', 'jintari', 'aozhen'], 'jade-echo-apprentice', {
      lirabao: 3,
      jintari: 2,
      aozhen: 2
    });
    expect(spar.ok).toBe(true);
    expect(spar.victory).toBe(true);
    expect(spar.trainingXp).toBeGreaterThan(0);
    expect(spar.message).toContain('spar ladder');

    expect(SPIRIT_TECHNIQUE_LOADOUTS.map((loadout) => loadout.id)).toEqual(['jade-step-loadout']);
    const loadout = resolveSpiritTechniqueLoadout({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      preferredMoveIdBySpiritId: {
        lirabao: 'lantern-pulse',
        jintari: 'goldleaf-feint',
        aozhen: 'skybell-guard'
      },
      techniqueProof: true,
      tacticProof: true,
      tacticId: 'goldleaf-opening',
      techniqueMasteryXp: 17,
      routeMasteryProof: true,
      journalProof: true,
      journalDiscoveredCount: 3
    });
    expect(loadout).toMatchObject({
      ok: true,
      prepared: true,
      loadoutId: 'jade-step-loadout',
      loadoutName: 'Jade Step Loadout',
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      score: 25,
      requiredScore: 22,
      rewardItemId: 'jade-step-loadout-slip',
      source: 'spirit-technique-loadout'
    });
    expect(loadout.moves.map((move) => [move.spiritId, move.moveId])).toEqual([
      ['lirabao', 'lantern-pulse'],
      ['jintari', 'goldleaf-feint'],
      ['aozhen', 'skybell-guard']
    ]);
    expect(loadout.message).toContain('no-injury Mochirii party moves');
    expect(resolveSpiritTechniqueLoadout({
      partyIds: ['lirabao'],
      techniqueProof: false,
      tacticProof: false,
      techniqueMasteryXp: 0,
      routeMasteryProof: false,
      journalProof: false,
      journalDiscoveredCount: 0
    }).prepared).toBe(false);

    const battleRound = resolveSpiritBattleRound({
      partyIds: ['lirabao', 'jintari', 'aozhen'],
      activeSpiritId: 'aozhen',
      moveIdBySpiritId: { aozhen: 'skybell-guard' },
      bondBySpiritId: { lirabao: 3, jintari: 2, aozhen: 2 },
      opponentId: 'jade-echo-apprentice',
      tacticProof: true,
      harmonyFormProof: true,
      priorWins: 1
    });
    expect(battleRound).toMatchObject({
      ok: true,
      roundId: 'jade-echo-apprentice-round-2',
      opponentId: 'jade-echo-apprentice',
      opponentName: 'Jade Echo Apprentice',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      focusScore: 45,
      opponentScore: 20,
      victory: true,
      noInjury: true,
      source: 'battle-round-transcript'
    });
    expect(battleRound.participants.map((participant) => [participant.spiritId, participant.moveId])).toEqual([
      ['aozhen', 'skybell-guard'],
      ['lirabao', 'lantern-pulse'],
      ['jintari', 'goldleaf-feint']
    ]);
    expect(battleRound.message).toContain('No-injury victory recorded with no real value');
    expect(resolveSpiritBattleRound({ partyIds: [] }).ok).toBe(false);

    expect(SPIRIT_MENTOR_CHALLENGES.map((challenge) => challenge.id)).toEqual(['silk-banner-mentor-drill']);
    const mentor = resolveSpiritMentorChallenge({
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: 32,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 31,
      battleRoundOpponentScore: 18,
      techniqueMasteryXp: 17,
      tacticMasteryXp: 14,
      raisingCareStreak: 1,
      profileViewed: true,
      guildBuddyProof: true
    });
    expect(mentor).toMatchObject({
      ok: true,
      cleared: true,
      challengeId: 'silk-banner-mentor-drill',
      challengeName: 'Silk Banner Mentor Drill',
      mentorName: 'Sifu Narao',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      score: 28,
      requiredScore: 28,
      rewardItemId: 'silk-banner-mentor-seal',
      source: 'battle-mentor-challenge'
    });
    expect(mentor.message).toContain('no-injury mentor-ready');
    expect(resolveSpiritMentorChallenge({
      partyIds: ['lirabao'],
      teamSparMatchProof: false,
      teamSparMatchScore: 0,
      battleRoundProof: false,
      battleRoundVictory: false,
      battleRoundFocusScore: 0,
      battleRoundOpponentScore: 1,
      techniqueMasteryXp: 0,
      tacticMasteryXp: 0,
      raisingCareStreak: 0,
      profileViewed: false,
      guildBuddyProof: false
    }).cleared).toBe(false);

    expect(SPIRIT_TOURNAMENT_BRACKETS.map((bracket) => bracket.id)).toEqual(['jade-banner-tournament']);
    const tournament = resolveSpiritTournamentBracket({
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      mentorChallengeScore: mentor.score,
      teamSparMatchProof: true,
      teamSparMatchId: 'jade-mirror-team-match',
      teamSparMatchScore: 32,
      harmonyTrialProof: true,
      harmonyTrialId: 'jade-echo-concord',
      conditionWeaveProof: true,
      battleRoundProof: true,
      battleRoundVictory: true,
      battleRoundFocusScore: 31,
      battleRoundOpponentScore: 18,
      localPresenceCount: 2,
      routePatrolProof: true,
      nurtureRiteProof: true,
      guildRankProof: true,
      profileViewed: true,
      guildBuddyProof: true,
      statusMood: 'cozy',
      chatLines: ['Ready for the bracket.']
    });
    expect(tournament).toMatchObject({
      ok: true,
      cleared: true,
      bracketId: 'jade-banner-tournament',
      bracketName: 'Jade Banner Tournament',
      title: 'First Closed-Alpha Battle Circuit',
      hostName: 'Jade Banner Marshal',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      localPresenceCount: 2,
      score: 49,
      requiredScore: 38,
      rewardItemId: 'jade-banner-tournament-pennant',
      source: 'battle-tournament-bracket'
    });
    expect(tournament.message).toContain('No real value');
    expect(resolveSpiritTournamentBracket({
      partyIds: ['aozhen'],
      mentorChallengeProof: false,
      mentorChallengeScore: 0,
      teamSparMatchProof: false,
      teamSparMatchScore: 0,
      harmonyTrialProof: false,
      conditionWeaveProof: false,
      battleRoundProof: false,
      battleRoundVictory: false,
      battleRoundFocusScore: 0,
      battleRoundOpponentScore: 1,
      localPresenceCount: 1,
      routePatrolProof: false,
      nurtureRiteProof: false,
      guildRankProof: false,
      profileViewed: false,
      guildBuddyProof: false
    }).cleared).toBe(false);

    expect(SPIRIT_TRAIT_ATTUNEMENTS.map((trait) => trait.id)).toEqual(['jade-heart-trait']);
    const trait = resolveSpiritTraitAttunement({
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      activeSpiritId: 'aozhen',
      mentorChallengeProof: true,
      mentorChallengeId: 'silk-banner-mentor-drill',
      techniqueLoadoutProof: true,
      techniqueLoadoutId: 'jade-step-loadout',
      battleRoundProof: true,
      battleRoundVictory: true,
      growthRiteProof: true,
      careStreak: 2,
      journalProof: true,
      journalDiscoveredCount: 3,
      bondBySpiritId: { aozhen: 5, lirabao: 4, jintari: 4 }
    });
    expect(trait).toMatchObject({
      ok: true,
      unlocked: true,
      traitId: 'jade-heart-trait',
      traitName: 'Jade Heart Trait Attunement',
      title: 'First Mochirii Party Trait',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      traitLabel: 'Skybell Wayfinder',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      score: 36,
      requiredScore: 31,
      rewardItemId: 'jade-heart-trait-thread',
      source: 'spirit-trait-attunement'
    });
    expect(trait.message).toContain('no-real-value Mochirii trait progress');
    expect(resolveSpiritTraitAttunement({
      partyIds: ['lirabao'],
      mentorChallengeProof: false,
      techniqueLoadoutProof: false,
      battleRoundProof: false,
      battleRoundVictory: false,
      growthRiteProof: false,
      careStreak: 0,
      journalProof: false,
      journalDiscoveredCount: 0
    }).unlocked).toBe(false);

    expect(SPIRIT_BATTLE_CONDITIONS.map((condition) => condition.id)).toEqual(['lantern-ward', 'goldleaf-tempo', 'skybell-guard']);
    expect(SPIRIT_CONDITION_WEAVES.map((weave) => weave.id)).toEqual(['jade-mirror-condition-weave']);
    const conditionWeave = resolveSpiritConditionWeave({
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      activeSpiritId: 'aozhen',
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
      chatLines: ['Condition weave ready.']
    });
    expect(conditionWeave).toMatchObject({
      ok: true,
      woven: true,
      weaveId: 'jade-mirror-condition-weave',
      weaveName: 'Jade Mirror Condition Weave',
      title: 'First Non-Injury Condition Weave',
      activeSpiritId: 'aozhen',
      activeSpiritName: 'Aozhen',
      partyIds: ['aozhen', 'lirabao', 'jintari'],
      conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
      score: 49,
      requiredScore: 34,
      rewardItemId: 'jade-mirror-condition-charm',
      source: 'battle-condition-weave'
    });
    expect(conditionWeave.message).toContain('no-injury battle conditions');
    expect(resolveSpiritConditionWeave({
      partyIds: ['lirabao'],
      tacticProof: false,
      affinityProof: false,
      battleRoundProof: false,
      battleRoundVictory: false,
      techniqueLoadoutProof: false,
      traitAttunementProof: false,
      mentorChallengeProof: false,
      sparLadderWins: 0,
      trainingXp: 0,
      profileViewed: false,
      guildBuddyProof: false
    }).woven).toBe(false);

    const battle = resolveSpiritTrainingBattle('lirabao', 'lantern-pulse', 5, 1);
    expect(battle.ok).toBe(true);
    expect(battle.victory).toBe(true);
    expect(battle.trainingXp).toBeGreaterThan(0);
    expect(battle.message).toContain('guild spar');

    const raising = resolveSpiritRaisingAction('lirabao', 'jade-brush-groom', 2);
    expect(raising).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      needId: 'jade-brush-groom',
      growth: 'sprout',
      careStreak: 1,
      milestoneId: 'lirabao-ribbon-warmth',
      milestoneLabel: 'Ribbon Guardian Warmth',
      milestoneReached: true,
      nextMilestoneId: 'lirabao-moonwell-glow',
      nextNeedId: 'mooncake-share'
    });
    expect(resolveSpiritBondMilestone('lirabao', 5, 'glow')).toMatchObject({
      ok: true,
      milestone: expect.objectContaining({
        id: 'lirabao-moonwell-glow',
        label: 'Moonwell Companion Glow'
      }),
      nextMilestone: undefined
    });
    expect(selectSpiritRaisingNeed('lirabao', 0)?.id).toBe('jade-brush-groom');
    expect(selectSpiritRaisingNeed('lirabao', 1)?.id).toBe('mooncake-share');
    expect(resolveSpiritRaisingAction('lirabao', 'mooncake-share', raising.bond, raising.careStreak)).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      needId: 'mooncake-share',
      careStreak: 2,
      milestoneReached: false,
      nextNeedId: 'jade-brush-groom'
    });

    expect(MOCHI_SPIRIT_QUESTS.map((quest) => quest.id)).toEqual([
      'first-lantern-vow',
      'silk-market-kindness',
      'skybell-spar'
    ]);
    expect(MOCHI_SPIRIT_QUESTS.every((quest) => quest.steps.length >= 3)).toBe(true);
    expect(selectMochiSpiritQuest({
      roster: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow']
    }).id).toBe('silk-market-kindness');

    const firstQuest = resolveMochiSpiritQuestProgress('first-lantern-vow', 'open-journal', {
      roster: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: [],
      questStepsById: { 'first-lantern-vow': ['attune-spirit', 'greet-sifu-narao'] }
    });
    expect(firstQuest).toMatchObject({
      ok: true,
      questId: 'first-lantern-vow',
      completed: true,
      completedQuestIds: ['first-lantern-vow'],
      nextQuestId: 'silk-market-kindness',
      rewardBond: 1,
      source: 'quest-chain'
    });

    const finalQuest = resolveMochiSpiritQuestProgress('skybell-spar', 'complete-raising-care', {
      roster: ['lirabao', 'jintari', 'aozhen'],
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness'],
      questStepsById: { 'skybell-spar': ['choose-training-move', 'finish-training-bout'] }
    });
    expect(finalQuest).toMatchObject({
      ok: true,
      questId: 'skybell-spar',
      completed: true,
      chainComplete: true,
      completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
      rewardBond: 2
    });
  });
});
