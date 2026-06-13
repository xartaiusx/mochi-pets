import { defineModule } from '@rpgjs/common';
import type { RpgServer } from '@rpgjs/server';
import { CanaryShrine, CareShrine, GuildSealChest, HabitatGrove, MarketBoard, PartyBanner, QuestBoard, SPIRITS, SpiritEvent, TradePost, TrainingRing, WelcomeNpc } from './event';
import { player } from './player';

export default defineModule<RpgServer>({
  player,
  maps: [
    {
      id: 'mochi-town',
      events: [
        {
          id: 'welcome-npc',
          x: 896,
          y: 512,
          event: WelcomeNpc()
        },
        {
          id: 'guild-seal-chest',
          x: 640,
          y: 704,
          event: GuildSealChest()
        },
        {
          id: 'spirit-lirabao',
          x: 384,
          y: 320,
          event: SpiritEvent(SPIRITS[0])
        },
        {
          id: 'spirit-jintari',
          x: 512,
          y: 320,
          event: SpiritEvent(SPIRITS[1])
        },
        {
          id: 'spirit-aozhen',
          x: 640,
          y: 320,
          event: SpiritEvent(SPIRITS[2])
        },
        {
          id: 'care-shrine',
          x: 768,
          y: 320,
          event: CareShrine()
        },
        {
          id: 'habitat-grove',
          x: 896,
          y: 320,
          event: HabitatGrove()
        },
        {
          id: 'party-banner',
          x: 1152,
          y: 320,
          event: PartyBanner()
        },
        {
          id: 'training-ring',
          x: 1024,
          y: 320,
          event: TrainingRing()
        },
        {
          id: 'quest-board',
          x: 1024,
          y: 704,
          event: QuestBoard()
        },
        {
          id: 'market-board',
          x: 1152,
          y: 704,
          event: MarketBoard()
        },
        {
          id: 'trade-post',
          x: 1280,
          y: 704,
          event: TradePost()
        },
        {
          id: 'canary-shrine',
          x: 1408,
          y: 320,
          event: CanaryShrine()
        }
      ]
    }
  ]
});
