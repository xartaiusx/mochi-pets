import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('runtime asset paths', () => {
  it('keeps tilesheet images relative to the absolute /map base path', () => {
    const tileset = readFileSync('src/tiled/mochi-tiles.tsx', 'utf8');

    expect(tileset).toContain('source="mochi-tiles.png"');
  });

  it('uses absolute sprite URLs so /play and /embed resolve assets identically', () => {
    const clientConfig = readFileSync('src/config/config.client.ts', 'utf8');

    expect(clientConfig).toContain("image: '/spritesheets/mochi.png'");
    expect(clientConfig).toContain("image: '/spritesheets/friend.png'");
    expect(clientConfig).toContain("image: '/spritesheets/chest.png'");
    expect(clientConfig).toContain("image: '/spritesheets/spirit-momo.png'");
    expect(clientConfig).toContain("image: '/spritesheets/market-board.png'");
    expect(clientConfig).toContain("image: '/spritesheets/canary-shrine.png'");
  });

  it('uses tab-scoped multiplayer guest connection ids', () => {
    const clientEntry = readFileSync('src/client.ts', 'utf8');

    expect(clientEntry).toContain("connectionIdScope: 'session'");
  });
});
