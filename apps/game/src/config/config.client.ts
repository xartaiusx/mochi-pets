import { provideClientGlobalConfig, provideClientModules, Presets } from '@rpgjs/client';
import { provideTiledMap } from '@rpgjs/tiledmap/client';
import { provideMain } from '../modules/main';

export default {
  providers: [
    provideTiledMap({
      basePath: '/map'
    }),
    provideClientGlobalConfig(),
    provideMain(),
    provideClientModules([
      {
        spritesheets: [
          {
            id: 'mochi',
            image: '/spritesheets/mochi.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'friend',
            image: '/spritesheets/friend.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'chest',
            image: '/spritesheets/chest.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'spirit-momo',
            image: '/spritesheets/spirit-momo.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'spirit-yuzu',
            image: '/spritesheets/spirit-yuzu.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'spirit-sora',
            image: '/spritesheets/spirit-sora.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'market-board',
            image: '/spritesheets/market-board.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'trade-post',
            image: '/spritesheets/trade-post.png',
            ...Presets.RMSpritesheet(3, 4)
          },
          {
            id: 'canary-shrine',
            image: '/spritesheets/canary-shrine.png',
            ...Presets.RMSpritesheet(3, 4)
          }
        ]
      }
    ])
  ]
};
