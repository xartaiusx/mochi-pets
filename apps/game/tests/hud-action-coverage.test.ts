import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const bridgeSource = readFileSync('src/integration/browser-bridge.ts', 'utf8');
const browserPresenceSource = readFileSync('../../scripts/check-alpha-browser-presence.mjs', 'utf8');

describe('Unity browser-smoke coverage', () => {
  it('keeps the two-tab browser presence smoke on the Unity WebGL surface', () => {
    expect(browserPresenceSource).toContain('Unity WebGL two-tab room smoke');
    expect(browserPresenceSource).toContain('/integration/game-manifest.json');
    expect(browserPresenceSource).toContain("manifest.engine === 'unity-webgl'");
    expect(browserPresenceSource).toContain("manifest.activeRuntime === 'unity-webgl'");
    expect(browserPresenceSource).toContain("manifest.legacyFallback?.active === false");
    expect(browserPresenceSource).toContain("manifest.room?.sharedPetKey === 'lirabao'");
    expect(browserPresenceSource).toContain("firstTab.goto(`${baseUrl}/embed?tab=one`");
    expect(browserPresenceSource).toContain("secondTab.goto(`${baseUrl}/embed?tab=two`");
    expect(browserPresenceSource).toContain('legacyHudAbsent');
  });

  it('does not click the legacy RPGJS HUD action path from the Unity browser smoke', () => {
    expect(bridgeSource).toContain('data-alpha-action="market.fixed_list"');
    expect(bridgeSource).toContain('data-alpha-action="trade.direct_offer"');
    expect(browserPresenceSource).not.toContain('page.click(\'[data-alpha-action=');
    expect(browserPresenceSource).not.toContain('page.click("[data-alpha-action=');
    expect(browserPresenceSource).not.toContain('page.fill(\'[data-chat-input]');
    expect(browserPresenceSource).not.toContain('page.fill("[data-chat-input]');
  });
});
