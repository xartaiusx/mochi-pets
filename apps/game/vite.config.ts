import { defineConfig } from 'vite';
import { rpgjs, tiledMapFolderPlugin } from '@rpgjs/vite';
import startServer from './src/server';

export default defineConfig({
  optimizeDeps: {
    include: ['parse-svg-path', '@xmldom/xmldom']
  },
  plugins: [
    tiledMapFolderPlugin({
      sourceFolder: './src/tiled',
      publicPath: '/map',
      buildOutputPath: 'assets/data'
    }),
    ...rpgjs({
      server: startServer,
      entryPoints: {
        rpg: './src/standalone.ts',
        mmorpg: {
          client: './src/client.ts',
          server: './src/server.ts',
          adapters: {
            express: './src/entries/express.ts',
            'security/html-fallback-rate-limit': './src/security/html-fallback-rate-limit.ts'
          }
        }
      }
    })
  ]
});
