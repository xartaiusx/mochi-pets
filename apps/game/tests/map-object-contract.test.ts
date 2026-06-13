import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeServerSource = readFileSync('src/server.ts', 'utf8');
const moduleServerSource = readFileSync('src/modules/main/server.ts', 'utf8');
const mapEventSource = readFileSync('src/modules/main/event.ts', 'utf8');
const mapSource = readFileSync('src/tiled/mochi-town.tmx', 'utf8');
const alphaContentSource = readFileSync('src/alpha/content.ts', 'utf8');

const expectedPlacements = {
  'welcome-npc': { x: 896, y: 512 },
  'guild-seal-chest': { x: 640, y: 704 },
  'spirit-lirabao': { x: 384, y: 320 },
  'spirit-jintari': { x: 512, y: 320 },
  'spirit-aozhen': { x: 640, y: 320 },
  'care-shrine': { x: 768, y: 320 },
  'habitat-grove': { x: 896, y: 320 },
  'training-ring': { x: 1024, y: 320 },
  'quest-board': { x: 1024, y: 704 },
  'market-board': { x: 1152, y: 704 },
  'trade-post': { x: 1280, y: 704 },
  'canary-shrine': { x: 1408, y: 320 }
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
      "this.setGraphic('sifu-narao')",
      "this.setGraphic('chest')",
      "this.setGraphic('habitat-grove')",
      "this.setGraphic('market-board')",
      "this.setGraphic('trade-post')",
      "this.setGraphic('training-ring')",
      "this.setGraphic('quest-board')",
      "this.setGraphic('canary-shrine')",
      'Welcome to Mochi Social',
      'Guild Seal added',
      'Bond with a Mochi Spirit first',
      'Care complete',
      'spirit invitation',
      'Training spar complete',
      'test soft currency',
      'Direct trade proof recorded',
      'no-real-value Enjin Canary certificate request',
      "source: 'spirit-bond'",
      "source: 'spirit-care'",
      "source: 'habitat-grove'",
      "source: 'training-ring'",
      "source: 'quest-board'",
      "source: 'market-board'",
      "source: 'trade-post'",
      "source: 'canary-shrine'",
      "source: 'guild-seal-chest'"
    ];

    for (const snippet of requiredSnippets) {
      expect(mapEventSource).toContain(snippet);
      expect(runtimeServerSource).toContain(snippet);
    }

    expect(alphaContentSource).toContain('First Lantern Vow');
    expect(runtimeServerSource).toContain('First Lantern Vow');
  });

  it('keeps the companion habitat and collision layer visible in the town map', () => {
    expect(alphaContentSource).toContain("jadeLanternCourt: 'Jade Lantern Court'");
    expect(alphaContentSource.match(/habitat:\s*SPIRIT_HABITATS\.jadeLanternCourt/g)).toHaveLength(3);

    const cells = collisionCells();
    expect(cells).toHaveLength(25 * 18);
    expect(cells.slice(0, 25).every((cell) => cell === 4)).toBe(true);
    expect(cells.slice(-25).every((cell) => cell === 4)).toBe(true);
    expect(cells).toContain(3);
    expect(cells).toContain(7);
  });
});
