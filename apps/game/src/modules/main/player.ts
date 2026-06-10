import type { RpgPlayer, RpgPlayerHooks } from '@rpgjs/server';

const SPAWN = {
  x: 384,
  y: 288
};

function getGuestName(player: RpgPlayer) {
  const id = String(player.id ?? 'guest').slice(-4).toUpperCase();
  return `Mochi ${id}`;
}

export const player: RpgPlayerHooks = {
  async onConnected(player: RpgPlayer) {
    player.name = getGuestName(player);
    player.setGraphic('mochi');
    player.setVariable('mochiSocial.connectedAt', new Date().toISOString());
    await player.changeMap('mochi-town', SPAWN);
    await player.load('auto', { reason: 'load', source: 'connect' }, { changeMap: false }).catch(() => null);
  },

  onInput(player: RpgPlayer, { action }) {
    if (action === 'escape') {
      player.callMainMenu();
    }
  }
};
