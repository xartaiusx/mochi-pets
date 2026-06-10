import { chromium } from 'playwright-core';

const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_BROWSER_TIMEOUT_MS || 20000);
const headless = process.env.MOCHI_SOCIAL_BROWSER_HEADFUL !== 'true';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function launchBrowser() {
  const commonOptions = {
    headless,
    args: ['--no-sandbox']
  };

  if (process.env.MOCHI_SOCIAL_BROWSER_EXECUTABLE) {
    return chromium.launch({
      ...commonOptions,
      executablePath: process.env.MOCHI_SOCIAL_BROWSER_EXECUTABLE
    });
  }

  const channel = process.env.MOCHI_SOCIAL_BROWSER_CHANNEL || 'chrome';
  try {
    return await chromium.launch({ ...commonOptions, channel });
  } catch (error) {
    try {
      return await chromium.launch(commonOptions);
    } catch {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Could not launch a browser for the two-tab presence smoke. Install Chrome, set MOCHI_SOCIAL_BROWSER_EXECUTABLE, or run this on a machine with Playwright browsers installed. First launch error: ${detail}`
      );
    }
  }
}

async function waitForPresence(page, expectedCount) {
  await page.waitForSelector('canvas', { timeout: timeoutMs });
  await page.waitForSelector('[data-presence-label]', { timeout: timeoutMs });
  await page.waitForFunction(
    (count) => document.querySelector('[data-presence-label]')?.getAttribute('data-presence-count') === String(count),
    expectedCount,
    { timeout: timeoutMs }
  );
}

async function main() {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  try {
    const [firstTab, secondTab] = await Promise.all([context.newPage(), context.newPage()]);
    await firstTab.goto(`${baseUrl}/play`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await secondTab.goto(`${baseUrl}/play`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

    await Promise.all([waitForPresence(firstTab, 2), waitForPresence(secondTab, 2)]);

    const evidence = await Promise.all([
      firstTab.evaluate(() => ({
        title: document.title,
        hud: Boolean(document.querySelector('#mochi-social-hud')),
        canvas: Boolean(document.querySelector('canvas')),
        presence: document.querySelector('[data-presence-label]')?.textContent?.trim() || ''
      })),
      secondTab.evaluate(() => ({
        title: document.title,
        hud: Boolean(document.querySelector('#mochi-social-hud')),
        canvas: Boolean(document.querySelector('canvas')),
        presence: document.querySelector('[data-presence-label]')?.textContent?.trim() || ''
      }))
    ]);

    for (const [index, tab] of evidence.entries()) {
      assert(tab.title.includes('Mochi Social'), `Tab ${index + 1} did not load the Mochi Social title.`);
      assert(tab.hud, `Tab ${index + 1} did not render the alpha HUD.`);
      assert(tab.canvas, `Tab ${index + 1} did not render the game canvas.`);
      assert(tab.presence === 'Nearby: 2 testers', `Tab ${index + 1} presence label was "${tab.presence}".`);
    }

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      scope: 'Two-tab browser presence smoke for the playable alpha HUD and canvas.',
      tabs: evidence
    }, null, 2));
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
