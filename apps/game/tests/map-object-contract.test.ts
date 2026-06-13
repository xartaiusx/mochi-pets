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
  'journal-pavilion': { x: 768, y: 704 },
  'expedition-gate': { x: 256, y: 704 },
  'route-invitation-altar': { x: 384, y: 704 },
  'technique-dojo': { x: 896, y: 704 },
  'tactic-scroll-stand': { x: 1280, y: 320 },
  'affinity-dais': { x: 1408, y: 704 },
  'spirit-lirabao': { x: 384, y: 320 },
  'spirit-jintari': { x: 512, y: 320 },
  'spirit-aozhen': { x: 640, y: 320 },
  'care-shrine': { x: 768, y: 320 },
  'habitat-grove': { x: 896, y: 320 },
  'training-ring': { x: 1024, y: 320 },
  'party-banner': { x: 1152, y: 320 },
  'quest-board': { x: 1024, y: 704 },
  'guild-rank-bell': { x: 1280, y: 512 },
  'growth-moonwell': { x: 1408, y: 512 },
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
      "this.setGraphic('journal-pavilion')",
      "this.setGraphic('expedition-gate')",
      "this.setGraphic('route-invitation-altar')",
      "this.setGraphic('technique-dojo')",
      "this.setGraphic('tactic-scroll-stand')",
      "this.setGraphic('affinity-dais')",
      "this.setGraphic('habitat-grove')",
      "this.setGraphic('party-banner')",
      "this.setGraphic('market-board')",
      "this.setGraphic('trade-post')",
      "this.setGraphic('training-ring')",
      "this.setGraphic('quest-board')",
      "this.setGraphic('guild-rank-bell')",
      "this.setGraphic('growth-moonwell')",
      "this.setGraphic('canary-shrine')",
      'Welcome to Mochi Social',
      'Guild Seal added',
      'Bond with a Mochi Spirit first',
      'Care complete',
      'Journal updated',
      'Route scouted',
      'Route spirit invited',
      'Technique refined',
      'Tactic scroll studied',
      'Affinity trial',
      'spirit invitation',
      'Party formed',
      'Training spar complete',
      'Guild rank recorded',
      'Growth rite opened',
      'test soft currency',
      'Direct trade proof recorded',
      'no-real-value Enjin Canary certificate request',
      "source: 'spirit-bond'",
      "source: 'spirit-care'",
      "source: 'journal-pavilion'",
      "source: 'expedition-gate'",
      "source: 'route-invitation-altar'",
      "source: 'technique-dojo'",
      "source: 'tactic-scroll-stand'",
      "source: 'affinity-dais'",
      "source: 'habitat-grove'",
      "source: 'party-banner'",
      "source: 'training-ring'",
      "source: 'quest-board'",
      "source: 'guild-rank-bell'",
      "source: 'growth-moonwell'",
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
    expect(alphaContentSource).toContain('Silk Market Kindness');
    expect(alphaContentSource).toContain('Skybell Spar');
    expect(alphaContentSource).toContain('Mochirii spirit journal updated');
    expect(alphaContentSource).toContain('Moonbridge Bamboo Trail');
    expect(alphaContentSource).toContain('Cloudbell Reed Bank');
    expect(alphaContentSource).toContain('Jade Cloudbell Circuit');
    expect(alphaContentSource).toContain('cloudbell-route-knot');
    expect(alphaContentSource).toContain('world-route-mastery');
    expect(alphaContentSource).toContain('spirit-route-invite');
    expect(alphaContentSource).toContain('Mochirii Technique Dojo');
    expect(alphaContentSource).toContain('Goldleaf Opening Form');
    expect(alphaContentSource).toContain('battle-tactic-scroll');
    expect(alphaContentSource).toContain('Jade Mirror Trial');
    expect(alphaContentSource).toContain('Jade Echo Apprentice');
    expect(alphaContentSource).toContain('Jade Court Initiate Trial');
    expect(alphaContentSource).toContain('guild-rank-trial');
    expect(alphaContentSource).toContain('Moonwell Bloom Rite');
    expect(alphaContentSource).toContain('spirit-growth-rite');
    expect(runtimeServerSource).toContain('First Lantern Vow');
    expect(runtimeServerSource).toContain('Silk Market Kindness');
    expect(runtimeServerSource).toContain('Skybell Spar');
    expect(runtimeServerSource).toContain('Mochirii spirit journal updated');
    expect(runtimeServerSource).toContain('Moonbridge Bamboo Trail');
    expect(runtimeServerSource).toContain('Cloudbell Reed Bank');
    expect(runtimeServerSource).toContain('Jade Cloudbell Circuit');
    expect(runtimeServerSource).toContain('cloudbell-route-knot');
    expect(runtimeServerSource).toContain('world-route-mastery');
    expect(runtimeServerSource).toContain('spirit-route-invite');
    expect(runtimeServerSource).toContain('Mochirii Technique Dojo');
    expect(runtimeServerSource).toContain('Goldleaf Opening Form');
    expect(runtimeServerSource).toContain('battle-tactic-scroll');
    expect(runtimeServerSource).toContain('Jade Mirror Trial');
    expect(runtimeServerSource).toContain('Jade Echo Apprentice');
    expect(runtimeServerSource).toContain('Jade Court Initiate Trial');
    expect(runtimeServerSource).toContain('guild-rank-trial');
    expect(runtimeServerSource).toContain('Moonwell Bloom Rite');
    expect(runtimeServerSource).toContain('spirit-growth-rite');
  });

  it('keeps the companion habitat and collision layer visible in the town map', () => {
    expect(alphaContentSource).toContain("jadeLanternCourt: 'Jade Lantern Court'");
    expect(
      Array.from(alphaContentSource.matchAll(/id:\s*'(lirabao|jintari|aozhen)'[\s\S]*?habitat:\s*SPIRIT_HABITATS\.jadeLanternCourt/g))
    ).toHaveLength(3);

    const cells = collisionCells();
    expect(cells).toHaveLength(25 * 18);
    expect(cells.slice(0, 25).every((cell) => cell === 4)).toBe(true);
    expect(cells.slice(-25).every((cell) => cell === 4)).toBe(true);
    expect(cells).toContain(3);
    expect(cells).toContain(7);
  });
});
