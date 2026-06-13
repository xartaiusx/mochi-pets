import { describe, expect, it } from 'vitest';
import {
  GUILD_RANK_TRIALS,
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  SPIRIT_BATTLE_TACTICS,
  SPIRIT_GROWTH_RITES,
  SPIRIT_HABITAT_BONDS,
  SPIRIT_HARMONY_FORMS,
  SPIRIT_HARMONY_TRIALS,
  SPIRIT_RESEARCH_FOLIOS,
  SPIRIT_ROUTE_MASTERIES,
  SPIRIT_TEAM_SPAR_MATCHES,
  growthStageFromBond,
  resolveSpiritAttunement,
  resolveSpiritCapture,
  resolveSpiritExpedition,
  resolveSpiritJournal,
  resolveSpiritParty,
  resolveSpiritRaisingAction,
  resolveSpiritBattleRound,
  resolveSpiritRouteInvitation,
  resolveSpiritRouteMastery,
  resolveMochiSpiritQuestProgress,
  resolveSpiritAffinityTrial,
  resolveSpiritBattleTactic,
  resolveGuildRankTrial,
  resolveSpiritGrowthRite,
  resolveSpiritHabitatBond,
  resolveSpiritHarmonyForm,
  resolveSpiritHarmonyTrial,
  resolveSpiritResearchFolio,
  resolveSpiritTeamSparMatch,
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
    expect(ALPHA_FEATURES.gameplay.fieldExpeditions).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeInvitations).toBe(true);
    expect(ALPHA_FEATURES.gameplay.routeMastery).toBe(true);
    expect(ALPHA_FEATURES.gameplay.habitatBonds).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritResearch).toBe(true);
    expect(ALPHA_FEATURES.gameplay.affinityTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.battleTactics).toBe(true);
    expect(ALPHA_FEATURES.gameplay.guildRankTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.spiritGrowthRites).toBe(true);
    expect(ALPHA_FEATURES.gameplay.partyHarmony).toBe(true);
    expect(ALPHA_FEATURES.gameplay.harmonyTrials).toBe(true);
    expect(ALPHA_FEATURES.gameplay.teamSparMatches).toBe(true);
    expect(ALPHA_FEATURES.gameplay.battleRoundTranscripts).toBe(true);
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
    expect(ALPHA_ACTION_TYPES).toContain('spirit.habitat_bond');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.research');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.attune');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.journal');
    expect(ALPHA_ACTION_TYPES).toContain('world.expedition');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.technique');
    expect(ALPHA_ACTION_TYPES).toContain('battle.tactic_scroll');
    expect(ALPHA_ACTION_TYPES).toContain('guild.rank_trial');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.growth_rite');
    expect(ALPHA_ACTION_TYPES).toContain('party.set');
    expect(ALPHA_ACTION_TYPES).toContain('party.harmony_form');
    expect(ALPHA_ACTION_TYPES).toContain('battle.harmony_trial');
    expect(ALPHA_ACTION_TYPES).toContain('battle.team_spar_match');
    expect(ALPHA_ACTION_TYPES).toContain('battle.affinity_trial');
    expect(ALPHA_ACTION_TYPES).toContain('battle.spar_ladder');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.train');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.raise');
    expect(ALPHA_ACTION_TYPES).toContain('quest.accept');
    expect(ALPHA_ACTION_TYPES).toContain('quest.progress');
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

    const routeInvitation = resolveSpiritRouteInvitation(
      'moonbridge-bamboo-trail',
      'jade-thread-charm',
      3,
      ['lirabao'],
      ['moonbridge-bamboo-trail']
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
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'lantern-harmony-tea', 3, ['lirabao'], ['moonbridge-bamboo-trail']).ok).toBe(false);
    expect(resolveSpiritRouteInvitation('moonbridge-bamboo-trail', 'jade-thread-charm', 2, ['lirabao'], ['moonbridge-bamboo-trail']).ok).toBe(false);

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
      ['moonbridge-bamboo-trail', 'cloudbell-reed-bank']
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
      nextNeedId: 'mooncake-share'
    });
    expect(selectSpiritRaisingNeed('lirabao', 0)?.id).toBe('jade-brush-groom');
    expect(selectSpiritRaisingNeed('lirabao', 1)?.id).toBe('mooncake-share');
    expect(resolveSpiritRaisingAction('lirabao', 'mooncake-share', raising.bond, raising.careStreak)).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      needId: 'mooncake-share',
      careStreak: 2,
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
