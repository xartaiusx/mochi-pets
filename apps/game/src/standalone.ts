import { mergeConfig } from '@signe/di';
import { provideRpg, startGame } from '@rpgjs/client';
import configClient from './config/config.client';
import startServer from './server';
import { installMochiPetsBridge } from './integration/browser-bridge';
import '@rpgjs/ui-css/reset.css';
import '@rpgjs/ui-css/index.css';
import '@rpgjs/ui-css/theme-default.css';
import './ui/styles.css';

installMochiPetsBridge();

startGame(
  mergeConfig(configClient, {
    providers: [provideRpg(startServer)]
  })
);
