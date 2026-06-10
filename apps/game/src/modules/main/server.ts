import { defineModule } from '@rpgjs/common';
import type { RpgServer } from '@rpgjs/server';
import { TokenChest, WelcomeNpc } from './event';
import { player } from './player';

export default defineModule<RpgServer>({
  player,
  maps: [
    {
      id: 'mochi-town',
      events: [
        {
          id: 'welcome-npc',
          x: 448,
          y: 256,
          event: WelcomeNpc()
        },
        {
          id: 'token-chest',
          x: 320,
          y: 352,
          event: TokenChest()
        }
      ]
    }
  ]
});
