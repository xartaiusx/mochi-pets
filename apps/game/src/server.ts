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
      await actingPlayer.showText('Welcome to Mochi Social. This town is small today, but it is ready to grow with friends.');
      actingPlayer.showNotification('Social spark found', { time: 1800, icon: 'friend' });
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
