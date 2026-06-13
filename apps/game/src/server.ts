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
  spirit?: {
    bond: number;
    growth: string;
    id: string;
  };
  sealClaimed?: boolean;
  tradeProof?: boolean;
};

type SpiritGrowthStage = 'seed' | 'sprout' | 'glow';

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
    certificateEligible: true
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
    certificateEligible: false
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
    certificateEligible: false
  }
] as const satisfies readonly MochiSpirit[];

function growthStageFromBond(bond: number): SpiritGrowthStage {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
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
      const activeSpirit = actingPlayer.getVariable<string>('mochiSocial.spirits.active') || bondedSpirits(actingPlayer)[0];
      if (!activeSpirit) {
        showAlphaPrompt(actingPlayer, 'The Jade Lantern Court shrine warms gently. Bond with a Mochi Spirit first, then return to care for it.');
        return;
      }

      const bondKey = `mochiSocial.spirit.${activeSpirit}.bond`;
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const nextBond = Math.min(5, currentBond + 1);
      const nextGrowth = growthStageFromBond(nextBond);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.spirit.${activeSpirit}.growth`, nextGrowth);
      actingPlayer.showNotification(`Spirit bond ${nextBond}/5`, { time: 1800, icon: 'sifu-narao' });
      emitAlphaHudState(actingPlayer, { spirit: { id: activeSpirit, bond: nextBond, growth: nextGrowth } });
      await actingPlayer.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'spirit-care' });
      showAlphaPrompt(actingPlayer, `Care complete. Your companion is now in ${nextGrowth} growth with bond ${nextBond}/5.`);
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
