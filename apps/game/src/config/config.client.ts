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
          }
        ]
      }
    ])
  ]
};
