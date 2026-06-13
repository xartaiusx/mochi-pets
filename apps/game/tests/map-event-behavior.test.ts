import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CanaryShrine,
  CareShrine,
  GuildSealChest,
  MarketBoard,
  QuestBoard,
  SPIRITS,
  SpiritEvent,
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
    expect(player.saves.filter((save) => save.options.source === 'spirit-care')).toHaveLength(4);
    expect(player.emitted.at(-1)).toEqual({
      type: 'mochi-social-alpha-state',
      value: {
        raising: {
          needId: 'jade-brush-groom',
          proof: true,
          message: 'Jade brush grooming complete for Lirabao. Smooths the spirit aura after training.'
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
          message: 'First Lantern Vow 3/3'
        },
        spirit: { id: 'lirabao', bond: 3, growth: 'sprout' }
      }
    });
    expect(player.texts.at(-1)).toContain('First Lantern Vow complete');
    expect(player.texts.at(-1)).toContain('no-real-value alpha progress');
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

    await runAction(SpiritEvent(SPIRITS[0]), player);
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
