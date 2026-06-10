import type { EventDefinition, RpgPlayer } from '@rpgjs/server';

const TOKEN_ITEM = {
  id: 'mochi-token',
  name: 'Mochi Token',
  description: 'A tiny proof that you visited the first Mochi Social town.'
};

export function WelcomeNpc(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('friend');
    },

    async onAction(player: RpgPlayer) {
      await player.showText('Welcome to Mochi Social. This town is small today, but it is ready to grow with friends.');
      player.showNotification('Social spark found', { time: 1800, icon: 'friend' });
    }
  };
}

export function TokenChest(): EventDefinition {
  return {
    onInit() {
      this.setGraphic('chest');
    },

    async onAction(player: RpgPlayer) {
      if (player.getVariable<boolean>('mochiSocial.tokenClaimed')) {
        await player.showText('The chest is empty. Your Mochi Token is already tucked away.');
        return;
      }

      player.addItem(TOKEN_ITEM, 1);
      player.setVariable('mochiSocial.tokenClaimed', true);
      player.showNotification('Mochi Token added', { time: 1800, icon: 'chest' });
      await player.save('auto', { title: 'Mochi Social first token' }, { reason: 'auto', source: 'token-chest' });
      await player.showText('You found a Mochi Token. The server saved this little milestone.');
    }
  };
}
