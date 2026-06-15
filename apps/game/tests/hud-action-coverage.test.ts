import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const bridgeSource = readFileSync('src/integration/browser-bridge.ts', 'utf8');
const browserPresenceSource = readFileSync('../../scripts/check-alpha-browser-presence.mjs', 'utf8');

function uniqueAttributeValues(source: string, attribute: string) {
  return Array.from(
    new Set(
      Array.from(source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')), (match) => match[1])
    )
  ).sort();
}

describe('HUD alpha action browser-smoke coverage', () => {
  it('exercises every tester-visible alpha action in the two-tab browser presence smoke', () => {
    const hudActions = uniqueAttributeValues(bridgeSource, 'data-alpha-action');
    const smokeActions = uniqueAttributeValues(browserPresenceSource, 'data-alpha-action');

    expect(hudActions.length).toBeGreaterThan(60);
    expect(smokeActions).toEqual(hudActions);
  });

  it('exercises every tester-visible local-only alpha action in the browser presence smoke', () => {
    const hudLocalActions = uniqueAttributeValues(bridgeSource, 'data-alpha-local-action');
    const smokeLocalActions = uniqueAttributeValues(browserPresenceSource, 'data-alpha-local-action');

    expect(hudLocalActions).toEqual([
      'guild.buddy',
      'profile.view',
      'spirit.inspect',
      'status.set'
    ]);
    expect(smokeLocalActions).toEqual(hudLocalActions);
  });
});
