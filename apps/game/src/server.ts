import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createModule, defineModule } from '@rpgjs/common';
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
  x: 384,
  y: 288
};

const tokenItem = {
  id: 'mochi-token',
  name: 'Mochi Token',
  description: 'A tiny proof that you visited the first Mochi Social town.'
};

const alphaItems = {
  charm: {
    id: 'lantern-charm',
    name: 'Lantern Charm',
    description: 'A no-real-value alpha market item for fixed-price and trade testing.'
  },
  certificate: {
    id: 'momo-canary-certificate',
    name: 'Momo Canary Certificate',
    description: 'A no-real-value Canary certificate request for the managed hot/cold Enjin alpha path.'
  }
};

const spirits = [
  { id: 'momo', name: 'Momo', graphic: 'spirit-momo', eligible: true },
  { id: 'yuzu', name: 'Yuzu', graphic: 'spirit-yuzu', eligible: false },
  { id: 'sora', name: 'Sora', graphic: 'spirit-sora', eligible: false }
];

const player: RpgPlayerHooks = {
  async onConnected(connectedPlayer: RpgPlayer) {
    connectedPlayer.name = getGuestName(connectedPlayer);
    connectedPlayer.setGraphic('mochi');
    connectedPlayer.setVariable('mochiSocial.connectedAt', new Date().toISOString());
    await connectedPlayer.changeMap('mochi-town', spawn);
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
  return `Mochi ${id}`;
}

function welcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('friend');
    },

    async onAction(actingPlayer: RpgPlayer) {
      await actingPlayer.showText('Welcome to Mochi Social. This closed alpha town is no-real-value and Canary-only, but it is ready for cozy pet testing with friends.');
      actingPlayer.showNotification('Social spark found', { time: 1800, icon: 'friend' });
    }
  };
}

function adoptedPets(actingPlayer: RpgPlayer): string[] {
  const pets = actingPlayer.getVariable<string[]>('mochiSocial.alpha.pets');
  return Array.isArray(pets) ? pets : [];
}

function growthStage(bond: number) {
  if (bond >= 5) return 'glow';
  if (bond >= 3) return 'sprout';
  return 'seed';
}

function spiritEvent(spirit: (typeof spirits)[number]): EventDefinition {
  return {
    onInit() {
      this.setGraphic(spirit.graphic);
    },

    async onAction(actingPlayer: RpgPlayer) {
      const pets = adoptedPets(actingPlayer);
      if (pets.includes(spirit.id)) {
        await actingPlayer.showText(`${spirit.name} bounces close by. Your bond is already started.`);
        return;
      }

      pets.push(spirit.id);
      actingPlayer.setVariable('mochiSocial.alpha.pets', pets);
      actingPlayer.setVariable('mochiSocial.alpha.activePet', spirit.id);
      actingPlayer.setVariable(`mochiSocial.alpha.pet.${spirit.id}.bond`, 1);
      actingPlayer.setVariable(`mochiSocial.alpha.pet.${spirit.id}.growth`, 'seed');
      actingPlayer.showNotification(`${spirit.name} befriended`, { time: 1800, icon: spirit.graphic });
      await actingPlayer.save('auto', { title: 'Mochi Spirit befriended' }, { reason: 'auto', source: 'pet-befriend' });
      await actingPlayer.showText(`${spirit.name} joined your alpha companion list. Care at the garden shrine to grow your bond.`);
    }
  };
}

function careShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('friend');
    },

    async onAction(actingPlayer: RpgPlayer) {
      const activePet = actingPlayer.getVariable<string>('mochiSocial.alpha.activePet') || adoptedPets(actingPlayer)[0];
      if (!activePet) {
        await actingPlayer.showText('The garden shrine warms gently. Befriend a Mochi Spirit first, then return to care for it.');
        return;
      }

      const bondKey = `mochiSocial.alpha.pet.${activePet}.bond`;
      const currentBond = Number(actingPlayer.getVariable<number>(bondKey) || 1);
      const nextBond = Math.min(5, currentBond + 1);
      const nextGrowth = growthStage(nextBond);
      actingPlayer.setVariable(bondKey, nextBond);
      actingPlayer.setVariable(`mochiSocial.alpha.pet.${activePet}.growth`, nextGrowth);
      actingPlayer.showNotification(`Bond ${nextBond}/5`, { time: 1800, icon: 'friend' });
      await actingPlayer.save('auto', { title: 'Mochi Spirit cared for' }, { reason: 'auto', source: 'pet-care' });
      await actingPlayer.showText(`Care complete. Your companion is now in ${nextGrowth} growth with bond ${nextBond}/5.`);
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
        await actingPlayer.save('auto', { title: 'Alpha market proof' }, { reason: 'auto', source: 'market-board' });
        await actingPlayer.showText('You listed a Lantern Charm for test soft currency. This proves fixed-price market flow without real value.');
        return;
      }

      await actingPlayer.showText('Your Lantern Charm listing proof is already recorded for this alpha save.');
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
      await actingPlayer.save('auto', { title: 'Alpha trade proof' }, { reason: 'auto', source: 'trade-post' });
      await actingPlayer.showText('Direct trade proof recorded. Alpha direct trades stay eligible-assets-only and no-real-value.');
    }
  };
}

function canaryShrine(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('canary-shrine');
    },

    async onAction(actingPlayer: RpgPlayer) {
      if (!adoptedPets(actingPlayer).includes('momo')) {
        await actingPlayer.showText('The Canary shrine responds to Momo certificates first. Befriend Momo before staging this proof.');
        return;
      }

      if (!actingPlayer.getVariable<boolean>('mochiSocial.alpha.canaryCertificateRequested')) {
        actingPlayer.addItem(alphaItems.certificate, 1);
        actingPlayer.setVariable('mochiSocial.alpha.canaryCertificateRequested', true);
      }
      actingPlayer.showNotification('Canary certificate staged', { time: 1800, icon: 'canary-shrine' });
      await actingPlayer.save('auto', { title: 'Canary certificate request' }, { reason: 'auto', source: 'canary-shrine' });
      await actingPlayer.showText('A no-real-value Enjin Canary certificate request is staged. Final mint/burn settlement requires configured Enjin Platform and Wallet Daemon services.');
    }
  };
}

function tokenChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(actingPlayer: RpgPlayer) {
      if (actingPlayer.getVariable<boolean>('mochiSocial.tokenClaimed')) {
        await actingPlayer.showText('The chest is empty. Your Mochi Token is already tucked away.');
        return;
      }

      actingPlayer.addItem(tokenItem, 1);
      actingPlayer.setVariable('mochiSocial.tokenClaimed', true);
      actingPlayer.showNotification('Mochi Token added', { time: 1800, icon: 'chest' });
      await actingPlayer.save('auto', { title: 'Mochi Social first token' }, { reason: 'auto', source: 'token-chest' });
      await actingPlayer.showText('You found a Mochi Token. The server saved this little milestone.');
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
          x: 448,
          y: 256,
          event: welcomeNpc()
        },
        {
          id: 'token-chest',
          x: 320,
          y: 352,
          event: tokenChest()
        },
        {
          id: 'spirit-momo',
          x: 192,
          y: 160,
          event: spiritEvent(spirits[0])
        },
        {
          id: 'spirit-yuzu',
          x: 256,
          y: 160,
          event: spiritEvent(spirits[1])
        },
        {
          id: 'spirit-sora',
          x: 320,
          y: 160,
          event: spiritEvent(spirits[2])
        },
        {
          id: 'care-shrine',
          x: 384,
          y: 160,
          event: careShrine()
        },
        {
          id: 'market-board',
          x: 576,
          y: 352,
          event: marketBoard()
        },
        {
          id: 'trade-post',
          x: 640,
          y: 352,
          event: tradePost()
        },
        {
          id: 'canary-shrine',
          x: 704,
          y: 160,
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

  constructor(directory: string) {
    this.directory = directory;
  }

  async list(listPlayer: RpgPlayer): Promise<SaveSlotList> {
    return this.stripSnapshots(await this.readSlots(listPlayer));
  }

  async get(getPlayer: RpgPlayer, index: number): Promise<SaveSlot | null> {
    const slots = await this.readSlots(getPlayer);
    return slots[index] ?? null;
  }

  async save(savePlayer: RpgPlayer, index: number, snapshot: string, meta: SaveSlotMeta): Promise<void> {
    const slots = await this.readSlots(savePlayer);
    const existing = slots[index];
    slots[index] = {
      ...(existing ?? {}),
      ...meta,
      snapshot
    };
    await this.writeSlots(savePlayer, slots);
  }

  async delete(deletePlayer: RpgPlayer, index: number): Promise<void> {
    const slots = await this.readSlots(deletePlayer);
    slots[index] = null;
    await this.writeSlots(deletePlayer, slots);
  }

  private async readSlots(storagePlayer: RpgPlayer): Promise<SaveSlotEntries> {
    try {
      const raw = await readFile(this.getPlayerFile(storagePlayer), 'utf8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async writeSlots(storagePlayer: RpgPlayer, slots: SaveSlotEntries) {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.getPlayerFile(storagePlayer), JSON.stringify(slots, null, 2), 'utf8');
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
