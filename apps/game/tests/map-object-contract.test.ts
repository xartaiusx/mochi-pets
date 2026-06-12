import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeServerSource = readFileSync('src/server.ts', 'utf8');
const moduleServerSource = readFileSync('src/modules/main/server.ts', 'utf8');
const mapEventSource = readFileSync('src/modules/main/event.ts', 'utf8');
const mapSource = readFileSync('src/tiled/mochi-town.tmx', 'utf8');
const alphaContentSource = readFileSync('src/alpha/content.ts', 'utf8');

const expectedPlacements = {
  'welcome-npc': { x: 448, y: 256 },
  'token-chest': { x: 320, y: 352 },
  'spirit-momo': { x: 192, y: 160 },
  'spirit-yuzu': { x: 256, y: 160 },
  'spirit-sora': { x: 320, y: 160 },
  'care-shrine': { x: 384, y: 160 },
  'market-board': { x: 576, y: 352 },
  'trade-post': { x: 640, y: 352 },
  'canary-shrine': { x: 704, y: 160 }
} as const;

function eventPlacements(source: string) {
  return Object.fromEntries(
    Array.from(source.matchAll(/id:\s*'([^']+)',\s*x:\s*(\d+),\s*y:\s*(\d+),/g), (match) => [
      match[1],
      {
        x: Number(match[2]),
        y: Number(match[3])
      }
    ])
  );
}

function runtimeEventPlacements() {
  return eventPlacements(runtimeServerSource);
}

function collisionCells() {
  const match = mapSource.match(/<layer[^>]+name="Collision"[\s\S]*?<data[^>]*>([\s\S]*?)<\/data>/);
  expect(match?.[1]).toBeTruthy();
  return String(match?.[1] || '')
    .split(',')
    .map((cell) => Number(cell.trim()))
    .filter((cell) => Number.isFinite(cell));
}

describe('Mochi town map object contract', () => {
  it('keeps the first playable town events stable and reachable', () => {
    expect(runtimeEventPlacements()).toEqual(expectedPlacements);
    expect(eventPlacements(moduleServerSource)).toEqual(expectedPlacements);
  });

  it('keeps required map-object graphics, prompts, and save sources wired', () => {
    const requiredSnippets = [
      "this.setGraphic('friend')",
      "this.setGraphic('chest')",
      "this.setGraphic('market-board')",
      "this.setGraphic('trade-post')",
      "this.setGraphic('canary-shrine')",
      'Welcome to Mochi Social',
      'Mochi Token added',
      'Befriend a Mochi Spirit first',
      'Care complete',
      'test soft currency',
      'Direct trade proof recorded',
      'no-real-value Enjin Canary certificate request',
      "source: 'pet-befriend'",
      "source: 'pet-care'",
      "source: 'market-board'",
      "source: 'trade-post'",
      "source: 'canary-shrine'",
      "source: 'token-chest'"
    ];

    for (const snippet of requiredSnippets) {
      expect(mapEventSource).toContain(snippet);
      expect(runtimeServerSource).toContain(snippet);
    }
  });

  it('keeps the companion habitat and collision layer visible in the town map', () => {
    expect(alphaContentSource.match(/habitat:\s*'Lantern Garden'/g)).toHaveLength(3);

    const cells = collisionCells();
    expect(cells).toHaveLength(25 * 18);
    expect(cells.slice(0, 25).every((cell) => cell === 4)).toBe(true);
    expect(cells.slice(-25).every((cell) => cell === 4)).toBe(true);
    expect(cells).toContain(3);
    expect(cells).toContain(7);
  });
});
