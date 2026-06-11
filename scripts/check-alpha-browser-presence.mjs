import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_BROWSER_TIMEOUT_MS || 20000);
const headless = process.env.MOCHI_SOCIAL_BROWSER_HEADFUL !== 'true';
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_BROWSER_PRESENCE_REPORT || 'reports/alpha-browser-presence.json');
const hostedAllowed = process.env.MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE === 'true';
const localBaseUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(baseUrl);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoHostedSmokeWithoutApproval() {
  if (localBaseUrl || hostedAllowed) return;
  throw new Error(
    'Browser presence smoke is local-only by default. Set MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true only after explicit hosted-preview approval.'
  );
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

async function captureCanvasSignature(page, label) {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: timeoutMs });
  const screenshot = await canvas.screenshot({ timeout: timeoutMs });
  return {
    label,
    bytes: screenshot.length,
    sha256: createHash('sha256').update(screenshot).digest('hex')
  };
}

async function focusCanvas(page, label) {
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox({ timeout: timeoutMs });
  assert(box && box.width > 100 && box.height > 100, `${label} canvas was not large enough to focus for movement.`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function moveCanvasAndCapture(page, label, key) {
  const before = await captureCanvasSignature(page, `${label}-before-${key}`);
  await focusCanvas(page, label);
  await page.keyboard.down(key);
  await page.waitForTimeout(450);
  await page.keyboard.up(key);
  await page.waitForTimeout(450);
  const after = await captureCanvasSignature(page, `${label}-after-${key}`);

  assert(before.bytes > 1000, `${label} before-move canvas screenshot was unexpectedly small.`);
  assert(after.bytes > 1000, `${label} after-move canvas screenshot was unexpectedly small.`);
  assert(before.sha256 !== after.sha256, `${label} canvas did not change after ${key}.`);

  return {
    key,
    before,
    after
  };
}

async function verifyCanvasMovement(firstTab, secondTab) {
  const observerBefore = await captureCanvasSignature(secondTab, 'second-tab-before-first-tab-move');
  const firstTabMovement = await moveCanvasAndCapture(firstTab, 'first-tab', 'ArrowRight');
  await secondTab.waitForTimeout(700);
  const observerAfter = await captureCanvasSignature(secondTab, 'second-tab-after-first-tab-move');
  const secondTabMovement = await moveCanvasAndCapture(secondTab, 'second-tab', 'ArrowDown');

  assert(
    observerBefore.sha256 !== observerAfter.sha256,
    'Second tab canvas did not change after first-tab movement, so synchronized sprite presence was not observed.'
  );

  return {
    firstTab: firstTabMovement,
    secondTab: secondTabMovement,
    observer: {
      before: observerBefore,
      after: observerAfter,
      changedAfterFirstTabMove: true
    }
  };
}

async function exerciseAlphaHud(page) {
  const chatMessage = `Hello from browser smoke ${Date.now().toString(36)}`;
  await page.click('[data-alpha-action="pet.care"]', { timeout: timeoutMs });
  await page.fill('[data-chat-input]', chatMessage, { timeout: timeoutMs });
  await page.press('[data-chat-input]', 'Enter', { timeout: timeoutMs });
  await page.click('[data-alpha-action="emote.send"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="market.fixed_list"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="trade.direct_offer"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="chain.withdraw_request"]', { timeout: timeoutMs });

  await page.waitForFunction(
    () => {
      const pet = document.querySelector('[data-pet-label]')?.textContent || '';
      const market = document.querySelector('[data-market-label]')?.textContent || '';
      const feed = document.querySelector('[data-alpha-feed]')?.textContent || '';
      const state = JSON.parse(localStorage.getItem('mochiSocial.alphaState') || '{}');
      const chat = Array.isArray(state.chat) ? state.chat.join(' ') : '';
      return pet.includes('Momo')
        && market.includes('Canary: requested')
        && state.petId === 'momo'
        && state.charmListed === true
        && state.tradeProof === true
        && state.canaryRequested === true
        && chat.includes('Care complete')
        && chat.includes('You wave')
        && chat.includes('Lantern Charm listed')
        && chat.includes('Direct trade proof')
        && chat.includes('Canary certificate request staged')
        && feed.includes('Canary');
    },
    undefined,
    { timeout: timeoutMs }
  );

  const snapshot = await page.evaluate(() => {
    const rawState = localStorage.getItem('mochiSocial.alphaState') || '{}';
    const state = JSON.parse(rawState);
    return {
      pet: document.querySelector('[data-pet-label]')?.textContent?.trim() || '',
      market: document.querySelector('[data-market-label]')?.textContent?.trim() || '',
      feed: Array.from(document.querySelectorAll('[data-alpha-feed] li')).map((item) => item.textContent?.trim() || ''),
      state
    };
  });

  assert(snapshot.state.petId === 'momo', 'HUD care action must select Momo as the active pet.');
  assert(snapshot.state.bond >= 1, 'HUD care action must increase pet bond.');
  assert(snapshot.state.charmListed === true, 'HUD market action must mark a fixed listing proof.');
  assert(snapshot.state.tradeProof === true, 'HUD trade action must mark a direct trade proof.');
  assert(snapshot.state.canaryRequested === true, 'HUD Canary action must stage a certificate request.');
  const chat = Array.isArray(snapshot.state.chat) ? snapshot.state.chat : [];
  assert(chat.some((line) => String(line).includes('Care complete')), 'HUD chat state must record the care action.');
  assert(chat.some((line) => String(line).includes('You wave')), 'HUD chat state must record the emote action.');
  assert(chat.some((line) => String(line).includes('Lantern Charm listed')), 'HUD chat state must record the fixed-list action.');
  assert(chat.some((line) => String(line).includes('Direct trade proof')), 'HUD chat state must record the trade action.');
  assert(chat.some((line) => String(line).includes('Canary certificate request staged')), 'HUD chat state must record the Canary action.');

  return {
    chatMessage,
    ...snapshot
  };
}

async function main() {
  assertNoHostedSmokeWithoutApproval();
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const report = {
    ok: false,
    checkedAt: new Date().toISOString(),
    baseUrl,
    localOnlyDefault: true,
    hostedAllowed,
    scope: 'Two-tab browser presence and alpha HUD action smoke for the playable first screen.',
    tabs: [],
    canvasMovement: null,
    hudAction: null
  };

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

    const canvasMovement = await verifyCanvasMovement(firstTab, secondTab);
    const hudAction = await exerciseAlphaHud(firstTab);

    report.ok = true;
    report.tabs = evidence;
    report.canvasMovement = canvasMovement;
    report.hudAction = hudAction;
    await writeReport(report);

    console.log(JSON.stringify(report, null, 2));
    console.log(`Report: ${reportPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function writeReport(report) {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
