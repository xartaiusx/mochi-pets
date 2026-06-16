import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeAssets = [
  { path: 'src/tiled/mochi-tiles.png', width: 512, height: 192 },
  { path: 'public/spritesheets/wayfarer.png', width: 384, height: 768 },
  { path: 'public/spritesheets/sifu-narao.png', width: 384, height: 768 },
  { path: 'public/spritesheets/chest.png', width: 384, height: 768 },
  { path: 'public/spritesheets/spirit-lirabao.png', width: 384, height: 768 },
  { path: 'public/spritesheets/spirit-jintari.png', width: 384, height: 768 },
  { path: 'public/spritesheets/spirit-aozhen.png', width: 384, height: 768 },
  { path: 'public/spritesheets/habitat-grove.png', width: 384, height: 768 },
  { path: 'public/spritesheets/party-banner.png', width: 384, height: 768 },
  { path: 'public/spritesheets/journal-pavilion.png', width: 384, height: 768 },
  { path: 'public/spritesheets/expedition-gate.png', width: 384, height: 768 },
  { path: 'public/spritesheets/route-invitation-altar.png', width: 384, height: 768 },
  { path: 'public/spritesheets/technique-dojo.png', width: 384, height: 768 },
  { path: 'public/spritesheets/tactic-scroll-stand.png', width: 384, height: 768 },
  { path: 'public/spritesheets/affinity-dais.png', width: 384, height: 768 },
  { path: 'public/spritesheets/market-board.png', width: 384, height: 768 },
  { path: 'public/spritesheets/trade-post.png', width: 384, height: 768 },
  { path: 'public/spritesheets/training-ring.png', width: 384, height: 768 },
  { path: 'public/spritesheets/quest-board.png', width: 384, height: 768 },
  { path: 'public/spritesheets/guild-rank-bell.png', width: 384, height: 768 },
  { path: 'public/spritesheets/growth-moonwell.png', width: 384, height: 768 },
  { path: 'public/spritesheets/canary-shrine.png', width: 384, height: 768 }
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

  it('keeps every runtime PNG tied to a project-authored source card and source master', () => {
    for (const asset of runtimeAssets) {
      const id = asset.path.split('/').pop()?.replace(/\.png$/, '') || '';
      const cardPath = `../../assets/source/game/hd/${id}.source.json`;
      const card = JSON.parse(readFileSync(cardPath, 'utf8')) as {
        id: string;
        role: string;
        runtimePath: string;
        masterPath: string;
        masterDimensions: string;
        runtimeDimensions: string;
        frameLayout: string;
        prompt: string;
        exportStatus: string;
        tool: string;
        generatedAt: string;
      };
      const expectedRuntimePath = `apps/game/${asset.path}`;
      const expectedMasterDimensions = id === 'mochi-tiles' ? '1024x384' : '768x1536';
      const expectedFrameLayout = id === 'mochi-tiles' ? '8x3 tiles, 64x64 runtime tiles' : '3x4 frames, 128x192 runtime frames';

      expect(card).toMatchObject({
        id,
        runtimePath: expectedRuntimePath,
        masterPath: `assets/source/game/hd/${id}-master.png`,
        masterDimensions: expectedMasterDimensions,
        runtimeDimensions: `${asset.width}x${asset.height}`,
        frameLayout: expectedFrameLayout,
        exportStatus: 'project-authored/generated-for-project'
      });
      expect(card.role.trim().length).toBeGreaterThan(0);
      expect(card.prompt).toContain('Mochirii');
      expect(card.prompt).toMatch(/smooth illustrated 2D|High-Fidelity Wuxia/);
      expect(card.prompt).not.toMatch(/third[- ]party|marketplace|screenshot|derivative/i);
      expect(card.tool).toContain('sharp');
      expect(card.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(existsSync(`../../${card.masterPath}`)).toBe(true);
      expect(readPngSize(`../../${card.masterPath}`)).toEqual(
        id === 'mochi-tiles'
          ? { width: 1024, height: 384 }
          : { width: 768, height: 1536 }
      );
    }
  });

  it('keeps tilesheet images relative to the absolute /map base path', () => {
    const tileset = readFileSync('src/tiled/mochi-tiles.tsx', 'utf8');

    expect(tileset).toContain('source="mochi-tiles.png"');
    expect(tileset).toContain('tilewidth="64"');
    expect(tileset).toContain('tileheight="64"');
    expect(tileset).toContain('tilecount="24"');
    expect(tileset).toContain('columns="8"');
    expect(tileset).toContain('width="512" height="192"');
  });

  it('uses absolute sprite URLs so /play and /embed resolve assets identically', () => {
    const clientConfig = readFileSync('src/config/config.client.ts', 'utf8');

    for (const asset of runtimeAssets.filter((asset) => asset.path.startsWith('public/'))) {
      expect(clientConfig).toContain(`image: '/${asset.path.replace('public/', '')}'`);
    }
  });

  it('keeps CanvasEngine transform metadata iterable for runtime animation updates', () => {
    const clientConfig = readFileSync('src/config/config.client.ts', 'utf8');

    expect(clientConfig).toContain('scale: [0.5, 0.5]');
    expect(clientConfig).not.toMatch(/scale:\s*0\.5\b/);
  });

  it('uses storage-safe multiplayer guest connection ids for embeds', () => {
    const clientEntry = readFileSync('src/client.ts', 'utf8');

    expect(clientEntry).toContain("const CONNECTION_ID_KEY = 'mochiSocial.connectionId';");
    expect(clientEntry).toContain('connectionId: resolveMochiSocialConnectionId()');
    expect(clientEntry).toContain('fallbackConnectionId');
    expect(clientEntry).not.toContain("connectionIdScope: 'session'");
  });
});
