import { describe, expect, it } from 'vitest';
import {
  MOCHI_SPIRIT_QUESTS,
  MOCHI_SPIRITS,
  growthStageFromBond,
  resolveSpiritAttunement,
  resolveSpiritRaisingAction,
  resolveSpiritTrainingBattle
} from '../src/alpha/content';
import { ALPHA_ACTION_TYPES, ALPHA_FEATURES, SERVER_ENV_CONTRACT, isAlphaActionEnvelope } from '../src/integration/alpha-contract';

describe('alpha contract', () => {
  it('keeps the closed alpha no-real-value and Canary scoped', () => {
    expect(ALPHA_FEATURES.alpha.noRealValue).toBe(true);
    expect(ALPHA_FEATURES.alpha.allowlistRequired).toBe(true);
    expect(ALPHA_FEATURES.chain.network).toBe('CANARY');
    expect(ALPHA_FEATURES.market.auctions).toBe(false);
    expect(ALPHA_FEATURES.ugc).toBe('curated');
  });

  it('defines exactly three original alpha companion species', () => {
    expect(MOCHI_SPIRITS).toHaveLength(3);
    expect(MOCHI_SPIRITS.map((spirit) => spirit.id)).toEqual(['lirabao', 'jintari', 'aozhen']);
    expect(MOCHI_SPIRITS.filter((spirit) => spirit.certificateEligible)).toHaveLength(1);
    expect(MOCHI_SPIRITS.filter((spirit) => spirit.certificateEligible).map((spirit) => spirit.id)).toEqual(['lirabao']);
    expect(MOCHI_SPIRITS.every((spirit) => spirit.attunement.label.length > 4)).toBe(true);
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
    expect(ALPHA_ACTION_TYPES).toContain('spirit.attune');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.train');
    expect(ALPHA_ACTION_TYPES).toContain('spirit.raise');
    expect(ALPHA_ACTION_TYPES).toContain('quest.accept');
    expect(ALPHA_ACTION_TYPES).toContain('quest.progress');
    expect(isAlphaActionEnvelope({ requestId: 'req_123456789', type: 'spirit.care', payload: {} })).toBe(true);
    expect(isAlphaActionEnvelope({ requestId: 'short', type: 'spirit.care', payload: {} })).toBe(false);
    expect(isAlphaActionEnvelope({ requestId: 'req_123456789', type: 'economy.cashout', payload: {} })).toBe(false);
  });

  it('resolves original Mochirii attunement, training, raising, and quest content', () => {
    const attunement = resolveSpiritAttunement('lirabao', 'mochirii-guild-seal');
    expect(attunement).toMatchObject({
      ok: true,
      spiritId: 'lirabao',
      bond: 1,
      growth: 'seed',
      source: 'spirit-attune'
    });
    expect(resolveSpiritAttunement('jintari', 'mochirii-guild-seal').ok).toBe(false);

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
      growth: 'sprout'
    });

    expect(MOCHI_SPIRIT_QUESTS.map((quest) => quest.id)).toEqual([
      'first-lantern-vow',
      'silk-market-kindness',
      'skybell-spar'
    ]);
    expect(MOCHI_SPIRIT_QUESTS.every((quest) => quest.steps.length >= 3)).toBe(true);
  });
});
