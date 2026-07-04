import { provideClientGlobalConfig, provideClientModules, Presets } from '@rpgjs/client';
import { provideTiledMap } from '@rpgjs/tiledmap/client';
import { applyAlphaWorldState, type AlphaWorldStatePatch } from '../integration/browser-bridge';
import { provideMain } from '../modules/main';

const SPIRIT_SHEET = {
  ...Presets.RMSpritesheet(3, 4),
  width: 384,
  height: 768,
  rectWidth: 128,
  rectHeight: 192,
  spriteRealSize: {
    width: 64,
    height: 96
  },
  scale: [0.5, 0.5]
};

export default {
  providers: [
    provideTiledMap({
      basePath: '/map'
    }),
    provideClientGlobalConfig(),
    provideMain(),
    provideClientModules([
      {
        engine: {
          onConnected(
            _engine: unknown,
            socket: {
              off?: (event: string, callback: (patch: AlphaWorldStatePatch) => void) => void;
              on?: (event: string, callback: (patch: AlphaWorldStatePatch) => void) => void;
            }
          ) {
            socket?.off?.('mochi-pets-alpha-state', applyAlphaWorldState);
            socket?.on?.('mochi-pets-alpha-state', applyAlphaWorldState);
          }
        }
      },
      {
        spritesheets: [
          {
            id: 'wayfarer',
            image: '/spritesheets/wayfarer.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'sifu-narao',
            image: '/spritesheets/sifu-narao.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'chest',
            image: '/spritesheets/chest.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'spirit-lirabao',
            image: '/spritesheets/spirit-lirabao.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'spirit-jintari',
            image: '/spritesheets/spirit-jintari.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'spirit-aozhen',
            image: '/spritesheets/spirit-aozhen.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'habitat-grove',
            image: '/spritesheets/habitat-grove.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'party-banner',
            image: '/spritesheets/party-banner.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'journal-pavilion',
            image: '/spritesheets/journal-pavilion.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'expedition-gate',
            image: '/spritesheets/expedition-gate.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'route-invitation-altar',
            image: '/spritesheets/route-invitation-altar.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'technique-dojo',
            image: '/spritesheets/technique-dojo.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'tactic-scroll-stand',
            image: '/spritesheets/tactic-scroll-stand.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'affinity-dais',
            image: '/spritesheets/affinity-dais.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'market-board',
            image: '/spritesheets/market-board.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'trade-post',
            image: '/spritesheets/trade-post.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'training-ring',
            image: '/spritesheets/training-ring.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'quest-board',
            image: '/spritesheets/quest-board.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'guild-rank-bell',
            image: '/spritesheets/guild-rank-bell.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'growth-moonwell',
            image: '/spritesheets/growth-moonwell.png',
            ...SPIRIT_SHEET
          },
          {
            id: 'canary-shrine',
            image: '/spritesheets/canary-shrine.png',
            ...SPIRIT_SHEET
          }
        ]
      }
    ])
  ]
};
