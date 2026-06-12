import { defineModule } from '@rpgjs/common';
import type { RpgServer } from '@rpgjs/server';
import { CanaryShrine, CareShrine, MarketBoard, SPIRITS, SpiritEvent, TokenChest, TradePost, WelcomeNpc } from './event';
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
        },
        {
          id: 'spirit-momo',
          x: 192,
          y: 160,
          event: SpiritEvent(SPIRITS[0])
        },
        {
          id: 'spirit-yuzu',
          x: 256,
          y: 160,
          event: SpiritEvent(SPIRITS[1])
        },
        {
          id: 'spirit-sora',
          x: 320,
          y: 160,
          event: SpiritEvent(SPIRITS[2])
        },
        {
          id: 'care-shrine',
          x: 384,
          y: 160,
          event: CareShrine()
        },
        {
          id: 'market-board',
          x: 576,
          y: 352,
          event: MarketBoard()
        },
        {
          id: 'trade-post',
          x: 640,
          y: 352,
          event: TradePost()
        },
        {
          id: 'canary-shrine',
          x: 704,
          y: 160,
          event: CanaryShrine()
        }
      ]
    }
  ]
});
