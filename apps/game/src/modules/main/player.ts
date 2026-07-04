import type { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server';

const SPAWN = {
  x: 768,
  y: 576
};

const SPAWN_OFFSETS = [
  { x: 0, y: 0 },
  { x: 64, y: 0 },
  { x: 0, y: 64 },
  { x: 64, y: 64 },
  { x: -64, y: 0 },
  { x: 0, y: -64 }
] as const;

const playerSpawnSlots = new Map<string, number>();
let nextSpawnSlot = 0;

function getGuestName(player: RpgPlayer) {
  const id = String(player.id ?? 'guest').slice(-4).toUpperCase();
  return `Wayfarer ${id}`;
}

function getSpawn(player: RpgPlayer) {
  const id = String(player.id ?? 'guest');
  if (!playerSpawnSlots.has(id)) {
    playerSpawnSlots.set(id, nextSpawnSlot);
    nextSpawnSlot += 1;
  }

  const offset = SPAWN_OFFSETS[playerSpawnSlots.get(id)! % SPAWN_OFFSETS.length];
  return {
    x: SPAWN.x + offset.x,
    y: SPAWN.y + offset.y
  };
}

export const player: RpgPlayerHooks = {
  async onConnected(player: RpgPlayer) {
    player.name = getGuestName(player);
    player.setGraphic('wayfarer');
    player.setVariable('mochiPets.connectedAt', new Date().toISOString());
    await player.changeMap('mochi-town', getSpawn(player));
    await player.load('auto', { reason: 'load', source: 'connect' }, { changeMap: false }).catch(() => null);
  },

  onInput(player: RpgPlayer, { action }) {
    if (action === 'escape') {
      player.callMainMenu();
    }
  }
};
