import { mergeConfig } from '@signe/di';
import { provideMmorpg, startGame } from '@rpgjs/client';
import configClient from './config/config.client';
import { installMochiSocialBridge } from './integration/browser-bridge';
import '@rpgjs/ui-css/reset.css';
import '@rpgjs/ui-css/index.css';
import '@rpgjs/ui-css/theme-default.css';
import './ui/styles.css';

installMochiSocialBridge();

startGame(
  mergeConfig(configClient, {
    providers: [
      provideMmorpg({
        connectionIdScope: 'session',
        query: () => {
          const accessToken = localStorage.getItem('mochiSocial.accessToken');
          return accessToken ? { accessToken } : undefined;
        }
      })
    ]
  })
);
