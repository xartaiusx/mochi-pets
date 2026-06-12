import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeAssets = [
  { path: 'src/tiled/mochi-tiles.png', width: 256, height: 96 },
  { path: 'public/spritesheets/mochi.png', width: 96, height: 192 },
  { path: 'public/spritesheets/friend.png', width: 96, height: 192 },
  { path: 'public/spritesheets/chest.png', width: 96, height: 192 },
  { path: 'public/spritesheets/spirit-momo.png', width: 96, height: 192 },
  { path: 'public/spritesheets/spirit-yuzu.png', width: 96, height: 192 },
  { path: 'public/spritesheets/spirit-sora.png', width: 96, height: 192 },
  { path: 'public/spritesheets/market-board.png', width: 96, height: 192 },
  { path: 'public/spritesheets/trade-post.png', width: 96, height: 192 },
  { path: 'public/spritesheets/canary-shrine.png', width: 96, height: 192 }
] as const;

function readPngSize(path: string) {
  const image = readFileSync(path);
  expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(image.subarray(12, 16).toString('ascii')).toBe('IHDR');

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20)
  };
}

describe('runtime asset paths', () => {
  it('keeps runtime PNG dimensions aligned with RPGJS and Tiled contracts', () => {
    for (const asset of runtimeAssets) {
      expect(readPngSize(asset.path)).toEqual({
        width: asset.width,
        height: asset.height
      });
    }
  });

  it('keeps tilesheet images relative to the absolute /map base path', () => {
    const tileset = readFileSync('src/tiled/mochi-tiles.tsx', 'utf8');

    expect(tileset).toContain('source="mochi-tiles.png"');
    expect(tileset).toContain('tilewidth="32"');
    expect(tileset).toContain('tileheight="32"');
    expect(tileset).toContain('tilecount="24"');
    expect(tileset).toContain('columns="8"');
    expect(tileset).toContain('width="256" height="96"');
  });

  it('uses absolute sprite URLs so /play and /embed resolve assets identically', () => {
    const clientConfig = readFileSync('src/config/config.client.ts', 'utf8');

    for (const asset of runtimeAssets.filter((asset) => asset.path.startsWith('public/'))) {
      expect(clientConfig).toContain(`image: '/${asset.path.replace('public/', '')}'`);
    }
  });

  it('uses tab-scoped multiplayer guest connection ids', () => {
    const clientEntry = readFileSync('src/client.ts', 'utf8');

    expect(clientEntry).toContain("connectionIdScope: 'session'");
  });
});
