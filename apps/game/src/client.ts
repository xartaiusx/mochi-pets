import { mergeConfig } from '@signe/di';
import { provideMmorpg, startGame } from '@rpgjs/client';
import configClient from './config/config.client';
import { installMochiSocialBridge } from './integration/browser-bridge';
import '@rpgjs/ui-css/reset.css';
import '@rpgjs/ui-css/index.css';
import '@rpgjs/ui-css/theme-default.css';
import './ui/styles.css';

const ACCESS_TOKEN_KEY = 'mochiSocial.accessToken';
const CONNECTION_ID_KEY = 'mochiSocial.connectionId';
let fallbackConnectionId: string | undefined;

installMochiSocialBridge();

startGame(
  mergeConfig(configClient, {
    providers: [
      provideMmorpg({
        connectionId: resolveMochiSocialConnectionId(),
        query: () => {
          const accessToken = readLocalStorage(ACCESS_TOKEN_KEY);
          return accessToken ? { accessToken } : undefined;
        }
      })
    ]
  })
);

function resolveMochiSocialConnectionId() {
  const existing = readLocalStorage(CONNECTION_ID_KEY);
  if (existing) return existing;

  const connectionId = fallbackConnectionId || createConnectionId();
  fallbackConnectionId = connectionId;
  writeLocalStorage(CONNECTION_ID_KEY, connectionId);
  return connectionId;
}

function createConnectionId() {
  return globalThis.crypto?.randomUUID?.() || `mochi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readLocalStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be denied in embedded preview contexts. The in-memory ID still lets the game boot.
  }
}
