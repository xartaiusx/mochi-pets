import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AffinityDais,
  CanaryShrine,
  CareShrine,
  ExpeditionGate,
  GrowthMoonwell,
  GuildRankBell,
  GuildSealChest,
  HabitatGrove,
  JournalPavilion,
  MarketBoard,
  PartyBanner,
  QuestBoard,
  RouteInvitationAltar,
  SPIRITS,
  SpiritEvent,
  TacticScrollStand,
  TechniqueDojo,
  TradePost,
  TrainingRing,
  WelcomeNpc
} from '../src/modules/main/event';

interface FakeSaveEntry {
  slot: string;
  metadata: unknown;
  options: { reason?: string; source?: string };
}

function createFakePlayer() {
  const variables = new Map<string, unknown>();

  return {
    variables,
    items: [] as Array<{ item: { id: string; name: string; description: string }; quantity: number }>,
    notifications: [] as Array<{ message: string; options: unknown }>,
    emitted: [] as Array<{ type: string; value: unknown }>,
    saves: [] as FakeSaveEntry[],
    texts: [] as string[],
    getVariable<T>(key: string): T | undefined {
      return variables.get(key) as T | undefined;
    },
    setVariable(key: string, value: unknown) {
      variables.set(key, value);
    },
    addItem(item: { id: string; name: string; description: string }, quantity: number) {
      this.items.push({ item, quantity });
    },
    showNotification(message: string, options: unknown) {
      this.notifications.push({ message, options });
    },
    emit(type: string, value: unknown) {
      this.emitted.push({ type, value });
    },
    async save(slot: string, metadata: unknown, options: { reason?: string; source?: string }) {
      this.saves.push({ slot, metadata, options });
    },
    async showText(text: string) {
      this.texts.push(text);
    }
  };
}

function createEventContext() {
  return {
    graphic: '',
    setGraphic(graphic: string) {
      this.graphic = graphic;
    }
  };
}

async function runAction(eventDefinition: ReturnType<typeof WelcomeNpc>, player = createFakePlayer()) {
  const context = createEventContext();
  eventDefinition.onInit?.call(context as never);
  await eventDefinition.onAction?.call(context as never, player as never);
  return { context, player };
}

describe('Mochi town event behavior', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the Welcome NPC dialog rendered as Sifu Narao and scoped to alpha', async () => {
    const { context, player } = await runAction(WelcomeNpc());

    expect(context.graphic).toBe('sifu-narao');
    expect(player.texts.at(-1)).toContain('Welcome to Mochi Social');
    expect(player.texts.at(-1)).toContain('no-real-value');
    expect(player.texts.at(-1)).toContain('Canary-only');
    expect(player.notifications.at(-1)?.message).toBe('Guild spark found');
  });

  it('opens alpha prompts without blocking movement and auto-closes by dialog id', async () => {
    vi.useFakeTimers();
    const player = createFakePlayer();
    const opened: Array<{ guiId: string; data: unknown; options: unknown }> = [];
    const removed: Array<{ guiId: string; data: unknown; openId: unknown }> = [];

    Object.assign(player, {
      gui(guiId: string) {
        return {
          openId: 'alpha-dialog-open-1',
          open(data: unknown, options: unknown) {
            opened.push({ guiId, data, options });
            return Promise.resolve(null);
          }
        };
      },
      removeGui(guiId: string, data: unknown, openId: unknown) {
        removed.push({ guiId, data, openId });
      }
    });

    await runAction(WelcomeNpc(), player);

    expect(opened).toHaveLength(1);
    expect(opened[0].guiId).toBe('rpg-dialog');
    expect(opened[0].data).toMatchObject({
      message: expect.stringContaining('Welcome to Mochi Social'),
      choices: [],
      autoClose: true,
      fullWidth: false,
      typewriterEffect: false
    });
    expect(opened[0].options).toEqual({
      waitingAction: false,
      blockPlayerInput: false
    });
    expect(player.texts).toEqual([]);

    vi.advanceTimersByTime(2600);
    expect(removed).toEqual([
      {
        guiId: 'rpg-dialog',
        data: undefined,
        openId: 'alpha-dialog-open-1'
      }
    ]);
  });

  it('lets the guild seal chest grant exactly one Mochirii Guild Seal and records save source', async () => {
    const event = GuildSealChest();
    const player = createFakePlayer();

    await runAction(event, player);
    await event.onAction?.call(createEventContext() as never, player as never);

    expect(player.items).toHaveLength(1);
    expect(player.items[0].item.id).toBe('mochirii-guild-seal');
    expect(player.variables.get('mochiSocial.guildSealClaimed')).toBe(true);
    expect(player.notifications[0].message).toBe('Guild Seal added');
    expect(player.emitted[0]).toEqual({
      type: 'mochi-social-alpha-state',
      value: { sealClaimed: true }
    });
    expect(player.saves[0].options.source).toBe('guild-seal-chest');
    expect(player.texts[0]).toContain('server saved');
    expect(player.texts[1]).toContain('already tucked away');
  });

  it('supports Lirabao bonding and care growth through seed, sprout, and glow', async () => {
    const player = createFakePlayer();
    await runAction(CareShrine(), player);
    expect(player.texts.at(-1)).toContain('Bond with a Mochi Spirit first');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao']);
    expect(player.variables.get('mochiSocial.spirits.active')).toBe('lirabao');
    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(1);
    expect(player.variables.get('mochiSocial.spirit.lirabao.growth')).toBe('seed');
    expect(player.saves.at(-1)?.options.source).toBe('spirit-bond');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: { spirit: { id: 'lirabao', bond: 1, growth: 'seed' } }
    });
    expect(player.texts.at(-1)).toContain('Mochirii spirit journal');

    for (let i = 0; i < 4; i += 1) {
      await runAction(CareShrine(), player);
    }

    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(5);
    expect(player.variables.get('mochiSocial.spirit.lirabao.growth')).toBe('glow');
    expect(player.variables.get('mochiSocial.spirit.lirabao.careStreak')).toBe(4);
    expect(player.variables.get('mochiSocial.spirit.lirabao.lastCareNeed')).toBe('mooncake-share');
    expect(player.variables.get('mochiSocial.spirit.lirabao.nextCareNeed')).toBe('jade-brush-groom');
    expect(player.saves.filter((save) => save.options.source === 'spirit-care')).toHaveLength(4);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        raising: {
          careStreak: 4,
          needId: 'mooncake-share',
          nextNeedId: 'jade-brush-groom',
          proof: true,
          message: 'Share mooncake complete for Lirabao. Restores focus for social play. Care streak 4.'
        },
        spirit: { id: 'lirabao', bond: 5, growth: 'glow' }
      }
    });
    expect(player.texts.at(-1)).toContain('Care complete');
    expect(player.texts.at(-1)).toContain('bond 5/5');
  });

  it('turns training ring and quest board interactions into saved Mochirii alpha progress', async () => {
    const player = createFakePlayer();

    await runAction(TrainingRing(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit');

    await runAction(QuestBoard(), player);
    expect(player.texts.at(-1)).toContain('Bond with Lirabao');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(TrainingRing(), player);

    expect(player.variables.get('mochiSocial.spirit.lirabao.trainingXp')).toBe(3);
    expect(player.variables.get('mochiSocial.spirit.lirabao.trainingVictories')).toBe(1);
    expect(player.variables.get('mochiSocial.battle.sparLadderXp')).toBe(2);
    expect(player.variables.get('mochiSocial.battle.sparLadderWins')).toBe(0);
    expect(player.variables.get('mochiSocial.battle.lastSparOpponent')).toBe('jade-echo-apprentice');
    expect(player.variables.get('mochiSocial.battle.lastRound')).toBe('jade-echo-apprentice-round-1');
    expect(player.variables.get('mochiSocial.battle.lastRoundFocusScore')).toBe(13);
    expect(player.variables.get('mochiSocial.battle.lastRoundOpponentScore')).toBe(17);
    expect(player.variables.get('mochiSocial.battle.lastRoundVictory')).toBe(false);
    expect(player.variables.get('mochiSocial.battle.lastRoundNoInjury')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.lastRoundParty')).toEqual(['lirabao']);
    expect(player.variables.get('mochiSocial.battle.lastRoundTranscript')).toEqual(['Lirabao:Lantern Pulse:13']);
    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(2);
    expect(player.saves.at(-1)?.options.source).toBe('training-ring');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        spirit: { id: 'lirabao', bond: 2, growth: 'seed' },
        training: {
          xp: 3,
          victories: 1,
          message: 'Lirabao completes a no-injury guild spar with Lantern Pulse.'
        },
        spar: {
          opponentId: 'jade-echo-apprentice',
          victory: false,
          xp: 2,
          wins: 0,
          message: "Lirabao's party studies the Jade Echo Apprentice spar ladder rhythm and prepares for another no-injury round."
        },
        battleRound: {
          roundId: 'jade-echo-apprentice-round-1',
          opponentName: 'Jade Echo Apprentice',
          focusScore: 13,
          opponentScore: 17,
          victory: false,
          noInjury: true,
          participants: ['lirabao'],
          message: 'Battle round transcript: Lirabao studies Jade Echo Apprentice with Lirabao:Lantern Pulse, focus 13/17. No-injury practice recorded with no real value.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('no-injury guild practice');
    expect(player.texts.at(-1)).toContain('no real value');

    await runAction(QuestBoard(), player);
    await runAction(QuestBoard(), player);
    await runAction(QuestBoard(), player);

    expect(player.variables.get('mochiSocial.quest.active')).toBe('first-lantern-vow');
    expect(player.variables.get('mochiSocial.quest.first-lantern-vow.steps')).toEqual(['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    expect(player.variables.get('mochiSocial.quest.first-lantern-vow.rewardClaimed')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(3);
    expect(player.saves.filter((save) => save.options.source === 'quest-board')).toHaveLength(3);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        quest: {
          id: 'first-lantern-vow',
          completedSteps: ['attune-spirit', 'greet-sifu-narao', 'open-journal'],
          completedQuestIds: ['first-lantern-vow'],
          chainComplete: false,
          nextQuestId: undefined,
          message: 'First Lantern Vow complete. 1/3 Mochirii quest postings complete.'
        },
        spirit: { id: 'lirabao', bond: 3, growth: 'sprout' }
      }
    });
    expect(player.texts.at(-1)).toContain('First Lantern Vow complete');
    expect(player.texts.at(-1)).toContain('no-real-value alpha progress');
  });

  it('advances the in-world quest board through the first Mochirii quest chain', async () => {
    const player = createFakePlayer();

    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);

    for (let step = 0; step < 9; step += 1) {
      await runAction(QuestBoard(), player);
    }

    expect(player.variables.get('mochiSocial.quest.active')).toBe('skybell-spar');
    expect(player.variables.get('mochiSocial.quest.first-lantern-vow.steps')).toEqual(['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    expect(player.variables.get('mochiSocial.quest.silk-market-kindness.steps')).toEqual(['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    expect(player.variables.get('mochiSocial.quest.skybell-spar.steps')).toEqual(['choose-training-move', 'finish-training-bout', 'complete-raising-care']);
    expect(player.variables.get('mochiSocial.quest.completed')).toEqual(['first-lantern-vow', 'silk-market-kindness', 'skybell-spar']);
    expect(player.variables.get('mochiSocial.quest.skybell-spar.rewardClaimed')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.aozhen.bond')).toBe(3);
    expect(player.variables.get('mochiSocial.spirit.aozhen.growth')).toBe('sprout');
    expect(player.saves.filter((save) => save.options.source === 'quest-board')).toHaveLength(9);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        quest: {
          id: 'skybell-spar',
          completedSteps: ['choose-training-move', 'finish-training-bout', 'complete-raising-care'],
          completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
          chainComplete: true,
          nextQuestId: undefined,
          message: 'Skybell Spar complete. 3/3 Mochirii quest postings complete.'
        },
        spirit: { id: 'aozhen', bond: 3, growth: 'sprout' }
      }
    });
    expect(player.texts.at(-1)).toContain('first Mochirii quest chain is complete');
    expect(player.texts.at(-1)).toContain('closed-alpha testers');
  });

  it('forms a Mochi Spirit party and clears the first no-injury spar ladder', async () => {
    const player = createFakePlayer();

    await runAction(PartyBanner(), player);
    expect(player.texts.at(-1)).toContain('Invite a Mochi Spirit before forming a Mochirii party');

    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(PartyBanner(), player);

    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao', 'jintari', 'aozhen']);
    expect(player.variables.get('mochiSocial.spirits.active')).toBe('aozhen');
    expect(player.variables.get('mochiSocial.spirits.party')).toEqual(['aozhen', 'lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.spirits.support')).toEqual(['lirabao', 'jintari']);
    expect(player.notifications.at(-1)?.message).toBe('Party formed');
    expect(player.saves.at(-1)?.options.source).toBe('party-banner');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        party: {
          activeSpiritId: 'aozhen',
          partyIds: ['aozhen', 'lirabao', 'jintari'],
          supportIds: ['lirabao', 'jintari'],
          message: 'Aozhen leads a 3-spirit Mochirii party for no-injury sparring.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('social-first');

    await runAction(TrainingRing(), player);

    expect(player.variables.get('mochiSocial.battle.sparLadderXp')).toBe(5);
    expect(player.variables.get('mochiSocial.battle.sparLadderWins')).toBe(1);
    expect(player.variables.get('mochiSocial.battle.lastSparOpponent')).toBe('jade-echo-apprentice');
    expect(player.variables.get('mochiSocial.battle.lastRound')).toBe('jade-echo-apprentice-round-1');
    expect(player.variables.get('mochiSocial.battle.lastRoundFocusScore')).toBe(35);
    expect(player.variables.get('mochiSocial.battle.lastRoundOpponentScore')).toBe(19);
    expect(player.variables.get('mochiSocial.battle.lastRoundVictory')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.lastRoundNoInjury')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.lastRoundParty')).toEqual(['aozhen', 'lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.battle.lastRoundTranscript')).toEqual([
      'Aozhen:Skybell Guard:14',
      'Lirabao:Lantern Pulse:11',
      'Jintari:Goldleaf Feint:10'
    ]);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        spirit: { id: 'aozhen', bond: 2, growth: 'seed' },
        training: {
          xp: 3,
          victories: 1,
          message: 'Aozhen completes a no-injury guild spar with Skybell Guard.'
        },
        spar: {
          opponentId: 'jade-echo-apprentice',
          victory: true,
          xp: 5,
          wins: 1,
          message: "Aozhen's party clears the Jade Echo Apprentice spar ladder with calm wuxia teamwork."
        },
        battleRound: {
          roundId: 'jade-echo-apprentice-round-1',
          opponentName: 'Jade Echo Apprentice',
          focusScore: 35,
          opponentScore: 19,
          victory: true,
          noInjury: true,
          participants: ['aozhen', 'lirabao', 'jintari'],
          message: 'Battle round transcript: Aozhen leads Aozhen:Skybell Guard, Lirabao:Lantern Pulse, Jintari:Goldleaf Feint against Jade Echo Apprentice, focus 35/19. No-injury victory recorded with no real value.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('spar ladder');
    expect(player.texts.at(-1)).toContain('no real value');
  });

  it('records Triune Jade Harmony from the party banner after mastery and growth proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'aozhen');
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.world.routeMastery', 'jade-cloudbell-circuit');
    player.variables.set('mochiSocial.spirit.aozhen.growthRiteProof', true);
    player.variables.set('mochiSocial.spirit.aozhen.growthRite', 'moonwell-bloom-rite');
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.affinityTrialWins', 1);
    player.variables.set('mochiSocial.spirit.aozhen.trainingXp', 3);
    player.variables.set('mochiSocial.battle.sparLadderXp', 5);

    await runAction(PartyBanner(), player);

    expect(player.variables.get('mochiSocial.spirits.party')).toEqual(['aozhen', 'lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.spirits.harmonyFormProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.harmonyForm')).toBe('triune-jade-harmony');
    expect(player.variables.get('mochiSocial.spirits.harmonyName')).toBe('Triune Jade Harmony');
    expect(player.variables.get('mochiSocial.spirits.harmonyScore')).toBe(27);
    expect(player.variables.get('mochiSocial.spirits.harmonySashClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('triune-jade-sash');
    expect(player.notifications.at(-1)?.message).toBe('Harmony formed');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit party harmony formed' });
    expect(player.saves.at(-1)?.options.source).toBe('party-banner');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        party: {
          activeSpiritId: 'aozhen',
          partyIds: ['aozhen', 'lirabao', 'jintari'],
          supportIds: ['lirabao', 'jintari'],
          message: 'Aozhen leads a 3-spirit Mochirii party for no-injury sparring.'
        },
        harmonyForm: {
          formId: 'triune-jade-harmony',
          name: 'Triune Jade Harmony',
          title: 'First Three-Spirit Harmony Form',
          partyIds: ['aozhen', 'lirabao', 'jintari'],
          score: 27,
          rewardItemId: 'triune-jade-sash',
          proof: true,
          message: 'Triune Jade Harmony formed: Aozhen, Lirabao, Jintari synchronize a no-injury party form for closed-alpha Mochirii testing.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Triune Jade Harmony formed');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha proof');
  });

  it('records the Jade Echo Concord trial from the affinity dais after harmony and social proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'lirabao');
    player.variables.set('mochiSocial.spirits.party', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.harmonyFormProof', true);
    player.variables.set('mochiSocial.spirits.harmonyForm', 'triune-jade-harmony');
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.sparLadderWins', 1);
    player.variables.set('mochiSocial.spirit.lirabao.bond', 5);
    player.variables.set('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp', 7);
    player.variables.set('mochiSocial.social.profileViewed', true);
    player.variables.set('mochiSocial.social.guildBuddyProof', true);
    player.variables.set('mochiSocial.social.statusMood', 'cozy');
    player.variables.set('mochiSocial.social.chatLines', ['Ready for concord.']);

    await runAction(AffinityDais(), player);

    expect(player.variables.get('mochiSocial.battle.harmonyTrialProof')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.harmonyTrial')).toBe('jade-echo-concord');
    expect(player.variables.get('mochiSocial.battle.harmonyTrialName')).toBe('Jade Echo Concord Trial');
    expect(player.variables.get('mochiSocial.battle.harmonyTrialScore')).toBe(24);
    expect(player.variables.get('mochiSocial.battle.concordTallyClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('jade-echo-concord-tally');
    expect(player.notifications.at(-1)?.message).toBe('Concord trial cleared');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit harmony trial' });
    expect(player.saves.at(-1)?.options.source).toBe('affinity-dais');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        harmonyTrial: {
          trialId: 'jade-echo-concord',
          trialName: 'Jade Echo Concord Trial',
          title: 'First Social Harmony Battle Trial',
          partyIds: ['lirabao', 'jintari', 'aozhen'],
          score: 24,
          rewardItemId: 'jade-echo-concord-tally',
          proof: true,
          message: 'Jade Echo Concord Trial cleared: Lirabao, Jintari, Aozhen complete a no-injury team battle while local testers coordinate through profile, guild, status, and chat proof.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Echo Concord Trial cleared');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha battle proof');
  });

  it('records the Jade Mirror team match from the training ring after concord proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'lirabao');
    player.variables.set('mochiSocial.spirits.party', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirit.lirabao.bond', 5);
    player.variables.set('mochiSocial.spirit.lirabao.trainingXp', 3);
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.spirits.growthRiteProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrialProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrial', 'jade-echo-concord');
    player.variables.set('mochiSocial.battle.harmonyTrialScore', 24);
    player.variables.set('mochiSocial.battle.sparLadderWins', 1);
    player.variables.set('mochiSocial.social.chatLines', ['Ready for the team match.']);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    player.variables.set('mochiSocial.quest.silk-market-kindness.steps', ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    player.variables.set('mochiSocial.quest.skybell-spar.steps', ['choose-training-move', 'finish-training-bout', 'complete-raising-care']);

    await runAction(TrainingRing(), player);

    expect(player.variables.get('mochiSocial.battle.teamSparMatchProof')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.teamSparMatch')).toBe('jade-mirror-team-match');
    expect(player.variables.get('mochiSocial.battle.teamSparMatchName')).toBe('Jade Mirror Team Match');
    expect(player.variables.get('mochiSocial.battle.teamSparMatchScore')).toBe(32);
    expect(player.variables.get('mochiSocial.battle.teamMatchRibbonClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('jade-mirror-match-ribbon');
    expect(player.notifications.at(-1)?.message).toBe('Team match cleared');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit team match' });
    expect(player.saves.at(-1)?.options.source).toBe('training-ring');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        teamSparMatch: {
          matchId: 'jade-mirror-team-match',
          matchName: 'Jade Mirror Team Match',
          title: 'First Full-Party Spar Match',
          opponentName: 'Mirror Court Trio',
          partyIds: ['lirabao', 'jintari', 'aozhen'],
          score: 32,
          rewardItemId: 'jade-mirror-match-ribbon',
          proof: true,
          message: 'Jade Mirror Team Match cleared: Lirabao, Jintari, Aozhen complete a no-injury full-party spar match against Mirror Court Trio with route, growth, tactic, quest, concord, and chat proof.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Mirror Team Match cleared');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha battle proof');
  });

  it('records the Silk Banner mentor drill from the training ring after full party readiness proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'lirabao');
    player.variables.set('mochiSocial.spirits.party', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirit.lirabao.bond', 5);
    player.variables.set('mochiSocial.spirit.lirabao.trainingXp', 3);
    player.variables.set('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp', 17);
    player.variables.set('mochiSocial.spirit.lirabao.careStreak', 1);
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.tacticMasteryXp', 14);
    player.variables.set('mochiSocial.spirits.growthRiteProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrialProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrial', 'jade-echo-concord');
    player.variables.set('mochiSocial.battle.harmonyTrialScore', 24);
    player.variables.set('mochiSocial.battle.sparLadderWins', 1);
    player.variables.set('mochiSocial.social.profileViewed', true);
    player.variables.set('mochiSocial.social.guildBuddyProof', true);
    player.variables.set('mochiSocial.social.chatLines', ['Ready for the mentor drill.']);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    player.variables.set('mochiSocial.quest.silk-market-kindness.steps', ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    player.variables.set('mochiSocial.quest.skybell-spar.steps', ['choose-training-move', 'finish-training-bout', 'complete-raising-care']);

    await runAction(TrainingRing(), player);

    expect(player.variables.get('mochiSocial.battle.teamSparMatchProof')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.mentorChallengeProof')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.mentorChallenge')).toBe('silk-banner-mentor-drill');
    expect(player.variables.get('mochiSocial.battle.mentorChallengeName')).toBe('Silk Banner Mentor Drill');
    expect(player.variables.get('mochiSocial.battle.mentorChallengeScore')).toBe(28);
    expect(player.variables.get('mochiSocial.battle.mentorSealClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('silk-banner-mentor-seal');
    expect(player.notifications.at(-1)?.message).toBe('Mentor challenge cleared');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit mentor challenge' });
    expect(player.saves.at(-1)?.options.source).toBe('training-ring');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        mentorChallenge: {
          challengeId: 'silk-banner-mentor-drill',
          challengeName: 'Silk Banner Mentor Drill',
          mentorName: 'Sifu Narao',
          title: 'First Mentor Readiness Challenge',
          partyIds: ['lirabao', 'jintari', 'aozhen'],
          score: 28,
          requiredScore: 28,
          rewardItemId: 'silk-banner-mentor-seal',
          proof: true,
          message: 'Silk Banner Mentor Drill cleared: Sifu Narao records Lirabao, Jintari, Aozhen as no-injury mentor-ready with care, tactics, technique, team sparring, and social proof.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Silk Banner Mentor Drill cleared');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha battle readiness proof');
  });

  it('attunes the Jade Heart trait from the training ring after mentor, loadout, growth, and care proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'lirabao');
    player.variables.set('mochiSocial.spirits.party', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirit.lirabao.bond', 5);
    player.variables.set('mochiSocial.spirit.lirabao.trainingXp', 3);
    player.variables.set('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp', 17);
    player.variables.set('mochiSocial.spirit.lirabao.careStreak', 1);
    player.variables.set('mochiSocial.spirits.journalProof', true);
    player.variables.set('mochiSocial.spirits.journalCount', 3);
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.tacticMasteryXp', 14);
    player.variables.set('mochiSocial.battle.techniqueLoadoutProof', true);
    player.variables.set('mochiSocial.battle.techniqueLoadout', 'jade-step-loadout');
    player.variables.set('mochiSocial.spirits.growthRiteProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrialProof', true);
    player.variables.set('mochiSocial.battle.harmonyTrial', 'jade-echo-concord');
    player.variables.set('mochiSocial.battle.harmonyTrialScore', 24);
    player.variables.set('mochiSocial.battle.sparLadderWins', 1);
    player.variables.set('mochiSocial.social.profileViewed', true);
    player.variables.set('mochiSocial.social.guildBuddyProof', true);
    player.variables.set('mochiSocial.social.chatLines', ['Ready for the trait rite.']);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    player.variables.set('mochiSocial.quest.silk-market-kindness.steps', ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    player.variables.set('mochiSocial.quest.skybell-spar.steps', ['choose-training-move', 'finish-training-bout', 'complete-raising-care']);

    await runAction(TrainingRing(), player);

    expect(player.variables.get('mochiSocial.battle.mentorChallengeProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.traitAttunementProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.traitAttunement')).toBe('jade-heart-trait');
    expect(player.variables.get('mochiSocial.spirits.traitAttunementName')).toBe('Jade Heart Trait Attunement');
    expect(player.variables.get('mochiSocial.spirits.traitAttunementScore')).toBe(35);
    expect(player.variables.get('mochiSocial.spirit.lirabao.traitProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.lirabao.trait')).toBe('Lanternhearted Guard');
    expect(player.variables.get('mochiSocial.spirits.traitThreadClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('jade-heart-trait-thread');
    expect(player.notifications.at(-1)?.message).toBe('Trait attuned');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit trait attunement' });
    expect(player.saves.at(-1)?.options.source).toBe('training-ring');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        traitAttunement: {
          activeSpiritId: 'lirabao',
          activeSpiritName: 'Lirabao',
          title: 'First Mochirii Party Trait',
          partyIds: ['lirabao', 'jintari', 'aozhen'],
          score: 35,
          requiredScore: 31,
          rewardItemId: 'jade-heart-trait-thread',
          proof: true,
          traitId: 'jade-heart-trait',
          traitLabel: 'Lanternhearted Guard',
          traitName: 'Jade Heart Trait Attunement',
          message: 'Lirabao unlocks Lanternhearted Guard through Jade Heart Trait Attunement: care, growth, mentor readiness, battle proof, and Jade Step moves are recorded as no-real-value Mochirii trait progress.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Heart Trait Attunement');
    expect(player.texts.at(-1)).toContain('Jade Heart Trait Thread is no-real-value closed-alpha raising proof');
  });

  it('invites Mochi Spirits from the habitat grove as the alpha capture loop', async () => {
    const player = createFakePlayer();

    await runAction(HabitatGrove(), player);

    expect(player.items.at(-1)?.item.id).toBe('lantern-harmony-tea');
    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao']);
    expect(player.variables.get('mochiSocial.spirits.active')).toBe('lirabao');
    expect(player.variables.get('mochiSocial.spirit.lirabao.captureEncounter')).toBe('court-habitat-lirabao');
    expect(player.variables.get('mochiSocial.spirit.lirabao.captureRarity')).toBe('common');
    expect(player.saves.at(-1)?.options.source).toBe('habitat-grove');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        capture: {
          spiritId: 'lirabao',
          roster: ['lirabao'],
          message: 'Lirabao accepts the Lantern Harmony Invitation and joins your Mochirii roster.'
        },
        spirit: { id: 'lirabao', bond: 1, growth: 'seed' }
      }
    });
    expect(player.texts.at(-1)).toContain('Mochirii-original');
    expect(player.texts.at(-1)).toContain('no-real-value alpha capture loop');

    await runAction(HabitatGrove(), player);
    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.spirit.jintari.captureRarity')).toBe('uncommon');
    expect(player.items.filter((entry) => entry.item.id === 'lantern-harmony-tea')).toHaveLength(1);
  });

  it('records the Jade Court Habitat Bond after roster, journal, care, and local social proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'aozhen');
    player.variables.set('mochiSocial.spirits.journalCount', 3);
    player.variables.set('mochiSocial.spirit.aozhen.raisingProof', true);
    player.variables.set('mochiSocial.spirit.aozhen.bond', 3);
    player.variables.set('mochiSocial.spirit.aozhen.growth', 'sprout');
    player.variables.set('mochiSocial.social.profileViewed', true);
    player.variables.set('mochiSocial.social.guildBuddyProof', true);
    player.variables.set('mochiSocial.social.statusMood', 'cozy');

    await runAction(HabitatGrove(), player);

    expect(player.items.at(-1)?.item.id).toBe('jade-court-habitat-tassel');
    expect(player.variables.get('mochiSocial.spirits.habitatBondProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.habitatBond')).toBe('jade-court-habitat-bond');
    expect(player.variables.get('mochiSocial.spirits.habitatBondName')).toBe('Jade Court Habitat Bond');
    expect(player.variables.get('mochiSocial.spirits.habitatBondScore')).toBe(18);
    expect(player.variables.get('mochiSocial.spirits.habitatTasselClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Habitat bond recorded');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit habitat bond' });
    expect(player.saves.at(-1)?.options.source).toBe('habitat-grove');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        habitatBond: {
          bondId: 'jade-court-habitat-bond',
          bondName: 'Jade Court Habitat Bond',
          title: 'First Shared Habitat Bond',
          habitat: 'Jade Lantern Court',
          activeSpiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          score: 18,
          rewardItemId: 'jade-court-habitat-tassel',
          proof: true,
          message: 'Jade Court Habitat Bond recorded: Aozhen and the first-court roster settle into Jade Lantern Court with journal, care, guild, status, and profile proof.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Court Habitat Bond recorded');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha raising and roleplay proof');
  });

  it('records discovered Mochi Spirits in the field journal pavilion', async () => {
    const player = createFakePlayer();

    await runAction(JournalPavilion(), player);
    expect(player.texts.at(-1)).toContain('Invite a Mochi Spirit before the journal can record');

    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(JournalPavilion(), player);

    expect(player.variables.get('mochiSocial.spirits.journalViewed')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.journalDiscovered')).toEqual(['lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.spirits.journalCount')).toBe(2);
    expect(player.notifications.at(-1)?.message).toBe('Journal updated');
    expect(player.saves.at(-1)?.options.source).toBe('journal-pavilion');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        journal: {
          activeSpiritId: 'jintari',
          discoveredCount: 2,
          totalCount: 3,
          proof: true,
          message: 'Mochirii spirit journal updated: 2/3 records. Jintari is seed growth, uncommon rarity, trickster role.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('habitat, rarity, temperament, role, and care notes');
    expect(player.texts.at(-1)).toContain('no-real-value alpha lore');
  });

  it('records the Jade Court Research Folio from the journal pavilion after field and battle proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'aozhen');
    player.variables.set('mochiSocial.spirit.aozhen.bond', 3);
    player.variables.set('mochiSocial.spirit.aozhen.growth', 'sprout');
    player.variables.set('mochiSocial.world.discoveredRoutes', ['moonbridge-bamboo-trail', 'cloudbell-reed-bank']);
    player.variables.set('mochiSocial.spirits.habitatBondProof', true);
    player.variables.set('mochiSocial.spirits.habitatBond', 'jade-court-habitat-bond');
    player.variables.set('mochiSocial.spirit.aozhen.technique.lastMove', 'skybell-guard');
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.affinityTrialWins', 1);
    player.variables.set('mochiSocial.spirit.aozhen.trainingXp', 3);

    await runAction(JournalPavilion(), player);

    expect(player.items.at(-1)?.item.id).toBe('jade-court-research-folio');
    expect(player.variables.get('mochiSocial.spirits.journalCount')).toBe(3);
    expect(player.variables.get('mochiSocial.spirits.researchProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.researchFolio')).toBe('jade-court-research-folio');
    expect(player.variables.get('mochiSocial.spirits.researchFolioName')).toBe('Jade Court Research Folio');
    expect(player.variables.get('mochiSocial.spirits.researchScore')).toBe(20);
    expect(player.variables.get('mochiSocial.spirits.researchFolioClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Journal updated');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit research folio recorded' });
    expect(player.saves.at(-1)?.options.source).toBe('journal-pavilion');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        journal: {
          activeSpiritId: 'aozhen',
          discoveredCount: 3,
          totalCount: 3,
          proof: true,
          message: 'Mochirii spirit journal updated: 3/3 records. Aozhen is sprout growth, rare rarity, scout role.'
        },
        research: {
          folioId: 'jade-court-research-folio',
          folioName: 'Jade Court Research Folio',
          title: 'First Mochirii Field Guide',
          habitat: 'Jade Lantern Court',
          activeSpiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
          score: 20,
          rewardItemId: 'jade-court-research-folio',
          proof: true,
          message: 'Jade Court Research Folio recorded: Aozhen anchors a full first-court research folio with roster, routes, journal, habitat, technique, tactic, affinity, and training proof.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Court Research Folio recorded');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha field-guide proof');
  });

  it('seals the Jade Court Spirit Compendium from the journal pavilion after collection proof', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'aozhen');
    player.variables.set('mochiSocial.spirit.aozhen.bond', 3);
    player.variables.set('mochiSocial.spirit.aozhen.growth', 'sprout');
    player.variables.set('mochiSocial.world.discoveredRoutes', ['moonbridge-bamboo-trail', 'cloudbell-reed-bank']);
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.spirits.habitatBondProof', true);
    player.variables.set('mochiSocial.spirits.habitatBond', 'jade-court-habitat-bond');
    player.variables.set('mochiSocial.spirit.aozhen.technique.lastMove', 'skybell-guard');
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.affinityTrialWins', 1);
    player.variables.set('mochiSocial.spirit.aozhen.trainingXp', 3);

    await runAction(JournalPavilion(), player);

    expect(player.items.at(-1)?.item.id).toBe('jade-court-compendium-seal');
    expect(player.variables.get('mochiSocial.spirits.researchProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.compendiumProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirits.compendium')).toBe('jade-court-spirit-compendium');
    expect(player.variables.get('mochiSocial.spirits.compendiumName')).toBe('Jade Court Spirit Compendium');
    expect(player.variables.get('mochiSocial.spirits.compendiumScore')).toBe(29);
    expect(player.variables.get('mochiSocial.spirits.compendiumSealClaimed')).toBe(true);
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit compendium sealed' });
    expect(player.saves.at(-1)?.options.source).toBe('journal-pavilion');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        compendium: {
          compendiumId: 'jade-court-spirit-compendium',
          compendiumName: 'Jade Court Spirit Compendium',
          title: 'First-Court Spirit Collection Proof',
          habitat: 'Jade Lantern Court',
          activeSpiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
          score: 29,
          rewardItemId: 'jade-court-compendium-seal',
          proof: true,
          message: 'Jade Court Spirit Compendium complete: Aozhen anchors all first-court Mochi Spirit records with roster, journal, route, habitat, and research proof. No-real-value collection progress only.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Court Spirit Compendium complete');
    expect(player.texts.at(-1)).toContain('Jade Court Compendium Seal is no-real-value closed-alpha collection proof');
  });

  it('records Moonbridge field expedition scouting as no-real-value route proof', async () => {
    const player = createFakePlayer();

    await runAction(ExpeditionGate(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit before scouting');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(ExpeditionGate(), player);

    expect(player.items.at(-1)?.item.id).toBe('moonbridge-field-ribbon');
    expect(player.variables.get('mochiSocial.world.lastExpeditionRoute')).toBe('moonbridge-bamboo-trail');
    expect(player.variables.get('mochiSocial.world.lastExpeditionEncounter')).toBe('jintari');
    expect(player.variables.get('mochiSocial.world.discoveredRoutes')).toEqual(['moonbridge-bamboo-trail']);
    expect(player.variables.get('mochiSocial.world.expeditionCount')).toBe(1);
    expect(player.variables.get('mochiSocial.spirit.lirabao.lastExpeditionRoute')).toBe('moonbridge-bamboo-trail');
    expect(player.variables.get('mochiSocial.world.trailRibbonClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Route scouted');
    expect(player.saves.at(-1)?.options.source).toBe('expedition-gate');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        expedition: {
          routeId: 'moonbridge-bamboo-trail',
          routeName: 'Moonbridge Bamboo Trail',
          encounterSpiritId: 'jintari',
          recommendedItemId: 'jade-thread-charm',
          rewardItemId: 'moonbridge-field-ribbon',
          discoveredRoutes: ['moonbridge-bamboo-trail'],
          count: 1,
          proof: true,
          message: 'Lirabao scouts the Moonbridge Bamboo Trail and records Jintari signs. Bring jade-thread-charm for the next invitation. A moonlit bamboo path where market ribbons flutter and Jintari signs appear before the court opens.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('field encounter proof');
    expect(player.texts.at(-1)).toContain('no-real-value alpha');
  });

  it('invites a route spirit only after Moonbridge scouting proof', async () => {
    const player = createFakePlayer();

    await runAction(RouteInvitationAltar(), player);
    expect(player.texts.at(-1)).toContain('Scout the Moonbridge Bamboo Trail before offering');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(ExpeditionGate(), player);
    await runAction(RouteInvitationAltar(), player);

    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao', 'jintari']);
    expect(player.variables.get('mochiSocial.spirits.active')).toBe('jintari');
    expect(player.variables.get('mochiSocial.spirit.jintari.bond')).toBe(1);
    expect(player.variables.get('mochiSocial.spirit.jintari.growth')).toBe('seed');
    expect(player.variables.get('mochiSocial.spirit.jintari.journalUnlocked')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.jintari.captureEncounter')).toBe('moonbridge-bamboo-trail-route-invitation');
    expect(player.variables.get('mochiSocial.spirit.jintari.lastRouteInvitation')).toBe('moonbridge-bamboo-trail');
    expect(player.variables.get('mochiSocial.world.lastRouteInvitation')).toBe('moonbridge-bamboo-trail');
    expect(player.variables.get('mochiSocial.world.lastRouteInvitationSpirit')).toBe('jintari');
    expect(player.variables.get('mochiSocial.world.routeInvitationProof')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Route spirit invited');
    expect(player.saves.at(-1)?.options.source).toBe('route-invitation-altar');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        routeInvite: {
          routeId: 'moonbridge-bamboo-trail',
          routeName: 'Moonbridge Bamboo Trail',
          spiritId: 'jintari',
          roster: ['lirabao', 'jintari'],
          alreadyRostered: false,
          proof: true,
          message: 'Jintari accepts the Goldleaf Ribbon Invitation at Moonbridge Bamboo Trail and joins your Mochirii roster by consent.'
        },
        capture: {
          spiritId: 'jintari',
          roster: ['lirabao', 'jintari'],
          message: 'Jintari accepts the Goldleaf Ribbon Invitation at Moonbridge Bamboo Trail and joins your Mochirii roster by consent.'
        },
        spirit: { id: 'jintari', bond: 1, growth: 'seed' }
      }
    });
    expect(player.texts.at(-1)).toContain('consent-based');
    expect(player.texts.at(-1)).toContain('no-real-value alpha capture progress');

    await runAction(CareShrine(), player);
    await runAction(ExpeditionGate(), player);

    expect(player.variables.get('mochiSocial.world.lastExpeditionRoute')).toBe('cloudbell-reed-bank');
    expect(player.variables.get('mochiSocial.world.lastExpeditionEncounter')).toBe('aozhen');
    expect(player.variables.get('mochiSocial.world.discoveredRoutes')).toEqual(['moonbridge-bamboo-trail', 'cloudbell-reed-bank']);
    expect(player.variables.get('mochiSocial.world.expeditionCount')).toBe(2);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        expedition: {
          routeId: 'cloudbell-reed-bank',
          routeName: 'Cloudbell Reed Bank',
          encounterSpiritId: 'aozhen',
          recommendedItemId: 'lantern-harmony-tea',
          rewardItemId: 'moonbridge-field-ribbon',
          discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
          count: 2,
          proof: true,
          message: 'Jintari scouts the Cloudbell Reed Bank and records Aozhen signs. Bring lantern-harmony-tea for the next invitation. A quiet reed bank under guild bells where Aozhen listens for careful wayfarers.'
        }
      }
    });

    await runAction(RouteInvitationAltar(), player);

    expect(player.variables.get('mochiSocial.spirits.bonded')).toEqual(['lirabao', 'jintari', 'aozhen']);
    expect(player.variables.get('mochiSocial.spirits.active')).toBe('aozhen');
    expect(player.variables.get('mochiSocial.spirit.aozhen.captureEncounter')).toBe('cloudbell-reed-bank-route-invitation');
    expect(player.variables.get('mochiSocial.spirit.aozhen.lastRouteInvitation')).toBe('cloudbell-reed-bank');
    expect(player.variables.get('mochiSocial.world.lastRouteInvitation')).toBe('cloudbell-reed-bank');
    expect(player.variables.get('mochiSocial.world.lastRouteInvitationSpirit')).toBe('aozhen');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        routeInvite: {
          routeId: 'cloudbell-reed-bank',
          routeName: 'Cloudbell Reed Bank',
          spiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          alreadyRostered: false,
          proof: true,
          message: 'Aozhen accepts the Skybell Vow Invitation at Cloudbell Reed Bank and joins your Mochirii roster by consent.'
        },
        capture: {
          spiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          message: 'Aozhen accepts the Skybell Vow Invitation at Cloudbell Reed Bank and joins your Mochirii roster by consent.'
        },
        spirit: { id: 'aozhen', bond: 1, growth: 'seed' }
      }
    });
  });

  it('records Jade Cloudbell route mastery after the first circuit proof is complete', async () => {
    const player = createFakePlayer();

    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(HabitatGrove(), player);
    await runAction(ExpeditionGate(), player);
    await runAction(ExpeditionGate(), player);
    await runAction(ExpeditionGate(), player);

    expect(player.variables.get('mochiSocial.world.routeMasteryProof')).toBeUndefined();
    expect(player.texts.at(-1)).toContain('Jade Cloudbell Circuit needs');

    await runAction(JournalPavilion(), player);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    player.variables.set('mochiSocial.quest.silk-market-kindness.steps', ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    player.variables.set('mochiSocial.quest.skybell-spar.steps', ['choose-training-move', 'finish-training-bout', 'complete-raising-care']);
    player.variables.set('mochiSocial.guild.rankTrialProof', true);
    player.variables.set('mochiSocial.guild.rankTrial', 'jade-court-initiate');
    await runAction(ExpeditionGate(), player);

    expect(player.items.at(-1)?.item.id).toBe('cloudbell-route-knot');
    expect(player.variables.get('mochiSocial.world.routeMasteryProof')).toBe(true);
    expect(player.variables.get('mochiSocial.world.routeMastery')).toBe('jade-cloudbell-circuit');
    expect(player.variables.get('mochiSocial.world.routeMasteryTitle')).toBe('Jade Cloudbell Circuit');
    expect(player.variables.get('mochiSocial.world.routeMasteryScore')).toBe(21);
    expect(player.variables.get('mochiSocial.world.routeMasteryKnotClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Route circuit mastered');
    expect(player.saves.at(-1)?.options.source).toBe('expedition-gate');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        routeMastery: {
          masteryId: 'jade-cloudbell-circuit',
          title: 'Jade Cloudbell Circuit',
          score: 21,
          rewardItemId: 'cloudbell-route-knot',
          proof: true,
          message: 'Jade Cloudbell Circuit mastered: all first-circuit Mochirii routes, spirits, journal records, quest postings, and Jade Court rank proof are complete.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('no-real-value field progression');
  });

  it('records no-injury technique mastery at the Mochirii dojo', async () => {
    const player = createFakePlayer();

    await runAction(TechniqueDojo(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit before practicing');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(CareShrine(), player);
    await runAction(CareShrine(), player);
    await runAction(TechniqueDojo(), player);

    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp')).toBe(7);
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lantern-pulse.level')).toBe('practiced');
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lastMove')).toBe('lantern-pulse');
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.focusScore')).toBe(11);
    expect(player.notifications.at(-1)?.message).toBe('Technique refined');
    expect(player.saves.at(-1)?.options.source).toBe('technique-dojo');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        technique: {
          spiritId: 'lirabao',
          moveId: 'lantern-pulse',
          masteryXp: 7,
          masteryLevel: 'practiced',
          focusScore: 11,
          proof: true,
          message: 'Lirabao refines Lantern Pulse at the Mochirii Technique Dojo: practiced mastery, 7 XP. No-injury wuxia practice only.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Technique mastery is no-injury alpha progression');
    expect(player.texts.at(-1)).toContain('no real value');
  });

  it('records the Jade Step technique loadout at the Mochirii dojo after party preparation', async () => {
    const player = createFakePlayer();
    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'lirabao');
    player.variables.set('mochiSocial.spirits.party', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirit.lirabao.bond', 5);
    player.variables.set('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp', 10);
    player.variables.set('mochiSocial.spirits.journalProof', true);
    player.variables.set('mochiSocial.spirits.journalCount', 3);
    player.variables.set('mochiSocial.world.routeMasteryProof', true);
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.lastTacticScroll', 'goldleaf-opening');

    await runAction(TechniqueDojo(), player);

    expect(player.variables.get('mochiSocial.battle.techniqueLoadoutProof')).toBe(true);
    expect(player.variables.get('mochiSocial.battle.techniqueLoadout')).toBe('jade-step-loadout');
    expect(player.variables.get('mochiSocial.battle.techniqueLoadoutName')).toBe('Jade Step Loadout');
    expect(player.variables.get('mochiSocial.battle.techniqueLoadoutScore')).toBe(25);
    expect(player.variables.get('mochiSocial.battle.techniqueLoadoutMoves')).toEqual([
      'lirabao:lantern-pulse',
      'jintari:goldleaf-feint',
      'aozhen:skybell-guard'
    ]);
    expect(player.variables.get('mochiSocial.battle.loadoutSlipClaimed')).toBe(true);
    expect(player.items.at(-1)?.item.id).toBe('jade-step-loadout-slip');
    expect(player.notifications.at(-1)?.message).toBe('Loadout prepared');
    expect(player.saves.at(-1)?.metadata).toEqual({ title: 'Mochi Spirit technique loadout' });
    expect(player.saves.at(-1)?.options.source).toBe('technique-dojo');
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        techniqueLoadout: {
          loadoutId: 'jade-step-loadout',
          loadoutName: 'Jade Step Loadout',
          title: 'First Three-Spirit Move Loadout',
          partyIds: ['lirabao', 'jintari', 'aozhen'],
          moves: ['lirabao:lantern-pulse', 'jintari:goldleaf-feint', 'aozhen:skybell-guard'],
          score: 25,
          requiredScore: 22,
          rewardItemId: 'jade-step-loadout-slip',
          proof: true,
          message: 'Jade Step Loadout prepared: Lirabao:Lantern Pulse, Jintari:Goldleaf Feint, Aozhen:Skybell Guard are set as no-injury Mochirii party moves for closed-alpha battles.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('Jade Step Loadout prepared');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha move preparation proof');
  });

  it('records no-injury battle tactic scroll planning before affinity trials', async () => {
    const player = createFakePlayer();

    await runAction(TacticScrollStand(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit before studying');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(CareShrine(), player);
    await runAction(CareShrine(), player);
    await runAction(TechniqueDojo(), player);
    await runAction(TacticScrollStand(), player);

    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp')).toBe(15);
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lantern-pulse.level')).toBe('practiced');
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lastMove')).toBe('lantern-pulse');
    expect(player.variables.get('mochiSocial.spirit.lirabao.tactic.last')).toBe('lantern-anchor');
    expect(player.variables.get('mochiSocial.spirit.lirabao.tactic.lastMove')).toBe('lantern-pulse');
    expect(player.variables.get('mochiSocial.spirit.lirabao.tactic.stance')).toBe('anchor');
    expect(player.variables.get('mochiSocial.spirit.lirabao.tactic.focusScore')).toBe(16);
    expect(player.variables.get('mochiSocial.battle.lastTacticScroll')).toBe('lantern-anchor');
    expect(player.variables.get('mochiSocial.battle.tacticScrollProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(4);
    expect(player.variables.get('mochiSocial.spirit.lirabao.growth')).toBe('sprout');
    expect(player.notifications.at(-1)?.message).toBe('Tactic scroll studied');
    expect(player.saves.at(-1)?.options.source).toBe('tactic-scroll-stand');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        tactic: {
          spiritId: 'lirabao',
          moveId: 'lantern-pulse',
          tacticId: 'lantern-anchor',
          tacticName: 'Lantern Anchor Form',
          stance: 'anchor',
          masteryXp: 15,
          focusScore: 16,
          proof: true,
          message: 'Lirabao studies Lantern Anchor Form with Lantern Pulse: anchor stance, 16 focus, 15 tactic XP. Plants a warm lantern stance so a companion can defend friends before striking. No-injury Mochirii battle planning only; no real value.'
        },
        spirit: { id: 'lirabao', bond: 4, growth: 'sprout' }
      }
    });
    expect(player.texts.at(-1)).toContain('Tactic scroll practice is no-injury alpha battle planning');
    expect(player.texts.at(-1)).toContain('no real value');
  });

  it('records the first Mochirii guild rank trial as no-real-value progression', async () => {
    const player = createFakePlayer();

    await runAction(GuildRankBell(), player);
    expect(player.texts.at(-1)).toContain('Jade Court Initiate Trial needs');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(HabitatGrove(), player);
    player.variables.set('mochiSocial.spirit.jintari.bond', 3);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit']);
    player.variables.set('mochiSocial.battle.tacticScrollProof', true);
    player.variables.set('mochiSocial.battle.affinityTrialWins', 1);
    player.variables.set('mochiSocial.spirits.journalCount', 2);
    await runAction(GuildRankBell(), player);

    expect(player.items.at(-1)?.item.id).toBe('jade-court-rank-seal');
    expect(player.variables.get('mochiSocial.guild.rankTrialProof')).toBe(true);
    expect(player.variables.get('mochiSocial.guild.rankTrial')).toBe('jade-court-initiate');
    expect(player.variables.get('mochiSocial.guild.rankTitle')).toBe('Jade Court Initiate');
    expect(player.variables.get('mochiSocial.guild.rankScore')).toBe(14);
    expect(player.variables.get('mochiSocial.guild.rankSealClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Guild rank recorded');
    expect(player.saves.at(-1)?.options.source).toBe('guild-rank-bell');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        rank: {
          trialId: 'jade-court-initiate',
          trialTitle: 'Jade Court Initiate Trial',
          rankTitle: 'Jade Court Initiate',
          score: 14,
          rewardItemId: 'jade-court-rank-seal',
          proof: true,
          message: 'Jintari presents the Jade Court Initiate Trial: score 14/9. Jade Court Initiate recorded as no-real-value Mochirii guild progress.'
        }
      }
    });
    expect(player.texts.at(-1)).toContain('closed-alpha, no-real-value progression');
  });

  it('records a Mochi Spirit growth rite after care, training, and rank proof', async () => {
    const player = createFakePlayer();

    await runAction(GrowthMoonwell(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit');

    await runAction(SpiritEvent(SPIRITS[1]), player);
    await runAction(GrowthMoonwell(), player);
    expect(player.texts.at(-1)).toContain('Moonwell Bloom Rite needs');

    player.variables.set('mochiSocial.spirit.jintari.bond', 5);
    player.variables.set('mochiSocial.spirit.jintari.growth', 'glow');
    player.variables.set('mochiSocial.spirit.jintari.trainingXp', 3);
    player.variables.set('mochiSocial.spirit.jintari.raisingProof', true);
    player.variables.set('mochiSocial.guild.rankTrialProof', true);
    player.variables.set('mochiSocial.guild.rankTrial', 'jade-court-initiate');
    await runAction(GrowthMoonwell(), player);

    expect(player.items.at(-1)?.item.id).toBe('moonwell-bloom-sigil');
    expect(player.variables.get('mochiSocial.spirit.jintari.growthRiteProof')).toBe(true);
    expect(player.variables.get('mochiSocial.spirit.jintari.growthRite')).toBe('moonwell-bloom-rite');
    expect(player.variables.get('mochiSocial.spirit.jintari.growthForm')).toBe('Moonwell Bloom Form');
    expect(player.variables.get('mochiSocial.spirit.jintari.growthSigilClaimed')).toBe(true);
    expect(player.notifications.at(-1)?.message).toBe('Growth rite opened');
    expect(player.saves.at(-1)?.options.source).toBe('growth-moonwell');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        growthRite: {
          riteId: 'moonwell-bloom-rite',
          riteName: 'Moonwell Bloom Rite',
          spiritId: 'jintari',
          formTitle: 'Moonwell Bloom Form',
          rewardItemId: 'moonwell-bloom-sigil',
          proof: true,
          message: 'Jintari completes the Moonwell Bloom Rite and opens Moonwell Bloom Form. This is no-real-value Mochirii growth proof for closed-alpha testing.'
        },
        spirit: { id: 'jintari', bond: 5, growth: 'glow' }
      }
    });
    expect(player.texts.at(-1)).toContain('closed-alpha, no-real-value spirit progression');
  });

  it('records no-injury affinity trial battle proof at the Jade Mirror dais', async () => {
    const player = createFakePlayer();

    await runAction(AffinityDais(), player);
    expect(player.texts.at(-1)).toContain('Attune with a Mochi Spirit before entering');

    await runAction(SpiritEvent(SPIRITS[0]), player);
    await runAction(CareShrine(), player);
    await runAction(CareShrine(), player);
    await runAction(TechniqueDojo(), player);
    await runAction(AffinityDais(), player);

    expect(player.variables.get('mochiSocial.battle.lastAffinityTrial')).toBe('jade-mirror-trial');
    expect(player.variables.get('mochiSocial.battle.affinityTrialWins')).toBe(1);
    expect(player.variables.get('mochiSocial.spirit.lirabao.lastAffinityTrialMove')).toBe('lantern-pulse');
    expect(player.variables.get('mochiSocial.spirit.lirabao.technique.lantern-pulse.xp')).toBe(11);
    expect(player.variables.get('mochiSocial.spirit.lirabao.bond')).toBe(4);
    expect(player.variables.get('mochiSocial.spirit.lirabao.growth')).toBe('sprout');
    expect(player.notifications.at(-1)?.message).toBe('Affinity trial cleared');
    expect(player.saves.at(-1)?.options.source).toBe('affinity-dais');
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        affinity: {
          spiritId: 'lirabao',
          moveId: 'lantern-pulse',
          trialId: 'jade-mirror-trial',
          trialName: 'Jade Mirror Trial',
          affinityAdvantage: true,
          focusScore: 15,
          trialScore: 14,
          victory: true,
          wins: 1,
          masteryXp: 11,
          proof: true,
          message: 'Lirabao clears the Jade Mirror Trial with Lantern Pulse; affinity harmonized, mastery 11 XP.'
        },
        spirit: { id: 'lirabao', bond: 4, growth: 'sprout' }
      }
    });
    expect(player.texts.at(-1)).toContain('no-injury alpha battle practice');
    expect(player.texts.at(-1)).toContain('no real value');
  });

  it('records no-real-value market, direct trade, and Canary certificate proofs', async () => {
    const player = createFakePlayer();

    await runAction(MarketBoard(), player);
    expect(player.items.at(-1)?.item.id).toBe('jade-thread-charm');
    expect(player.variables.get('mochiSocial.alpha.charmListed')).toBe(true);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: { charmListed: true }
    });
    expect(player.saves.at(-1)?.options.source).toBe('market-board');
    expect(player.texts.at(-1)).toContain('without real value');

    await runAction(TradePost(), player);
    expect(player.variables.get('mochiSocial.alpha.tradeProof')).toBe(true);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: { tradeProof: true }
    });
    expect(player.saves.at(-1)?.options.source).toBe('trade-post');
    expect(player.texts.at(-1)).toContain('no-real-value');

    await runAction(CanaryShrine(), player);
    expect(player.texts.at(-1)).toContain('Bond with Lirabao');

    player.variables.set('mochiSocial.spirits.bonded', ['lirabao', 'jintari', 'aozhen']);
    player.variables.set('mochiSocial.spirits.active', 'aozhen');
    player.variables.set('mochiSocial.spirits.journalCount', 3);
    player.variables.set('mochiSocial.world.routeInvitationProof', true);
    player.variables.set('mochiSocial.spirit.lirabao.careStreak', 1);
    player.variables.set('mochiSocial.quest.first-lantern-vow.steps', ['attune-spirit', 'greet-sifu-narao', 'open-journal']);
    player.variables.set('mochiSocial.quest.silk-market-kindness.steps', ['list-jade-thread-charm', 'offer-direct-trade', 'thank-local-buddy']);
    player.variables.set('mochiSocial.quest.skybell-spar.steps', ['choose-training-move', 'finish-training-bout', 'complete-raising-care']);

    await runAction(MarketBoard(), player);
    expect(player.items.at(-1)?.item.id).toBe('jade-court-provision-satchel');
    expect(player.variables.get('mochiSocial.alpha.provisionSatchelProof')).toBe(true);
    expect(player.variables.get('mochiSocial.alpha.provisionSatchel')).toBe('jade-court-provision-satchel');
    expect(player.variables.get('mochiSocial.alpha.provisionScore')).toBe(30);
    expect(player.variables.get('mochiSocial.alpha.provisionStockItems')).toEqual([
      'jade-thread-charm',
      'lantern-harmony-tea',
      'jade-mooncake-box'
    ]);
    expect(player.emitted.at(-1)).toMatchObject({
      type: 'mochi-social-alpha-state',
      value: {
        provisionSatchel: {
          satchelId: 'jade-court-provision-satchel',
          satchelName: 'Jade Court Provision Satchel',
          title: 'First-Court Provision Bag',
          habitat: 'Jade Lantern Court',
          activeSpiritId: 'aozhen',
          roster: ['lirabao', 'jintari', 'aozhen'],
          stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
          completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
          score: 30,
          rewardItemId: 'jade-court-provision-satchel',
          proof: true,
          message: expect.stringContaining('No-real-value item preparation')
        }
      }
    });
    expect(player.saves.at(-1)?.options.source).toBe('market-board');
    expect(player.texts.at(-1)).toContain('Jade Court Provision Satchel stocked');
    expect(player.texts.at(-1)).toContain('no-real-value closed-alpha item preparation proof');

    await runAction(CanaryShrine(), player);
    expect(player.items.at(-1)?.item.id).toBe('lirabao-canary-certificate');
    expect(player.variables.get('mochiSocial.alpha.canaryCertificateRequested')).toBe(true);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: { canaryRequested: true }
    });
    expect(player.saves.at(-1)?.options.source).toBe('canary-shrine');
    expect(player.texts.at(-1)).toContain('no-real-value Enjin Canary certificate request');
    expect(player.texts.at(-1)).toContain('Wallet Daemon services');
  });
});
