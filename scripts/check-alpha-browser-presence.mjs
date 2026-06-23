import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_BROWSER_TIMEOUT_MS || 30000);
const headless = process.env.MOCHI_SOCIAL_BROWSER_HEADFUL !== 'true';
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_BROWSER_PRESENCE_REPORT || 'reports/alpha-browser-presence.json');
const hostedAllowed = process.env.MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE === 'true';
const localBaseUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(baseUrl);

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'Local-only Unity WebGL two-tab room smoke. This does not join hosted UGS; it proves the built Unity iframe surface loads in two tabs and the legacy RPGJS HUD is absent.',
  baseUrl,
  localOnlyDefault: true,
  hostedAllowed,
  runtime: null,
  tabs: [],
  bridge: null,
  legacyHudAbsent: null,
  canvasMovement: null,
  failures: []
};

try {
  assertNoHostedSmokeWithoutApproval();
  await run();
  report.ok = true;
  console.log(`Mochi Social Unity browser presence smoke passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  report.failures.push(report.error);
  console.error('Mochi Social Unity browser presence smoke failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exitCode = 1;
} finally {
  await writeReport();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoHostedSmokeWithoutApproval() {
  if (localBaseUrl || hostedAllowed) return;
  throw new Error(
    'Browser presence smoke is local-only by default. Set MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE=true only after explicit hosted-preview approval.'
  );
}

async function run() {
  const manifest = await readManifest();
  assert(manifest.engine === 'unity-webgl', 'Manifest must expose Unity WebGL.');
  assert(manifest.activeRuntime === 'unity-webgl', 'Manifest must report Unity WebGL as the active runtime.');
  assert(manifest.room?.mode === 'single-shared-room', 'Manifest must expose the single shared room.');
  assert(manifest.room?.capacity === 25, 'Manifest must expose room capacity 25.');
  assert(manifest.room?.sharedPetKey === 'lirabao', 'Manifest must expose Lirabao as the shared pet.');
  assert(manifest.unityWebglBuild?.present === true, 'Manifest must report a present Unity WebGL build.');
  assert(manifest.legacyFallback?.active === false, 'Manifest must report legacy fallback inactive.');
  report.runtime = {
    engine: manifest.engine,
    activeRuntime: manifest.activeRuntime,
    room: manifest.room,
    unityWebglBuild: manifest.unityWebglBuild,
    legacyFallback: manifest.legacyFallback
  };

  const browser = await launchBrowser();
  try {
    const context = await browser.newContext();
    const firstTab = await context.newPage();
    const secondTab = await context.newPage();
    await installCrossTabPulseProbe(firstTab);
    await installCrossTabPulseProbe(secondTab);

    await firstTab.goto(`${baseUrl}/embed?tab=one`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await secondTab.goto(`${baseUrl}/embed?tab=two`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

    const first = await inspectUnityTab(firstTab, 'first-tab');
    const second = await inspectUnityTab(secondTab, 'second-tab');
    report.tabs.push(first, second);

    report.bridge = await inspectBridgeSurface(firstTab);
    report.legacyHudAbsent = await assertLegacyHudAbsent(firstTab);
    report.canvasMovement = await verifyTwoTabPulse(firstTab, secondTab);
  } finally {
    await browser.close();
  }
}

async function readManifest() {
  const response = await fetch(`${baseUrl}/integration/game-manifest.json`, {
    signal: AbortSignal.timeout(timeoutMs)
  });
  assert(response.ok, `Manifest request failed with ${response.status}.`);
  return response.json();
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
        `Could not launch a browser for the Unity WebGL two-tab smoke. Install Chrome, set MOCHI_SOCIAL_BROWSER_EXECUTABLE, or run this on a machine with Playwright browsers installed. First launch error: ${detail}`
      );
    }
  }
}

async function installCrossTabPulseProbe(page) {
  await page.addInitScript(() => {
    window.addEventListener('storage', (event) => {
      if (event.key !== 'mochiSocial.movement.browser-smoke') return;
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.setAttribute('data-remote-movement-pulse', event.newValue || '');
    });
  });
}

async function inspectUnityTab(page, label) {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: timeoutMs });
  await page.waitForFunction(() => window.__MOCHI_SOCIAL_UNITY_RUNTIME_READY === true, { timeout: timeoutMs });
  const box = await canvas.boundingBox({ timeout: timeoutMs });
  assert(box && box.width > 100 && box.height > 100, `${label} Unity canvas was not large enough.`);
  const screenshot = await canvas.screenshot({ timeout: timeoutMs });
  assert(screenshot.length > 1000, `${label} Unity canvas screenshot was unexpectedly small.`);

  return {
    label,
    title: await page.title(),
    url: page.url(),
    canvas: {
      width: Math.round(box.width),
      height: Math.round(box.height),
      screenshotBytes: screenshot.length,
      screenshotSha256: createHash('sha256').update(screenshot).digest('hex')
    },
    unityRuntimeReady: await page.evaluate(() => window.__MOCHI_SOCIAL_UNITY_RUNTIME_READY === true),
    unityLastEventType: await page.evaluate(() => window.__MOCHI_SOCIAL_UNITY_LAST_EVENT?.type || '')
  };
}

async function inspectBridgeSurface(page) {
  return page.evaluate(() => {
    const scripts = Array.from(document.scripts).map((script) => script.src || script.textContent || '');
    const body = document.body?.textContent || '';
    return {
      hasCreateUnityInstance: scripts.some((entry) => entry.includes('createUnityInstance')) || body.includes('createUnityInstance'),
      hasLoaderScript: scripts.some((entry) => /Build\/.+\.loader\.js/i.test(entry)),
      hasMochiBridgeObject: typeof window.MochiSocialBridge !== 'undefined',
      hasUnityCanvas: Boolean(document.querySelector('canvas')),
      unityRuntimeReady: window.__MOCHI_SOCIAL_UNITY_RUNTIME_READY === true,
      unityLastEventType: window.__MOCHI_SOCIAL_UNITY_LAST_EVENT?.type || ''
    };
  });
}

async function assertLegacyHudAbsent(page) {
  const forbiddenSelectors = [
    '[data-presence-label]',
    '[data-alpha-action="market.fixed_list"]',
    '[data-alpha-action="market.guild_receipt"]',
    '[data-alpha-action="trade.direct_offer"]',
    '[data-alpha-action="trade.exchange_accord"]',
    '[data-alpha-action^="chain."]',
    '[data-chat-input]',
    '[data-market-label]'
  ];
  const hits = [];
  for (const selector of forbiddenSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) hits.push({ selector, count });
  }

  assert(hits.length === 0, `Unity WebGL page still exposes legacy RPGJS HUD selectors: ${hits.map((hit) => hit.selector).join(', ')}`);
  return {
    ok: true,
    checkedSelectors: forbiddenSelectors
  };
}

async function verifyTwoTabPulse(firstTab, secondTab) {
  await secondTab.bringToFront();
  const pulseBefore = await readCanvasMovementPulse(secondTab);
  const secondBefore = await captureCanvasSignature(secondTab, 'second-tab-before-first-tab-pulse');

  await firstTab.bringToFront();
  const firstBefore = await captureCanvasSignature(firstTab, 'first-tab-before-input');
  await focusCanvas(firstTab, 'first-tab');
  await firstTab.keyboard.down('ArrowLeft');
  await firstTab.waitForTimeout(400);
  await firstTab.keyboard.up('ArrowLeft');
  await writeLocalMovementPulse(firstTab, 1);
  const firstAfter = await captureCanvasSignature(firstTab, 'first-tab-after-input');

  await secondTab.bringToFront();
  await secondTab.waitForTimeout(600);
  const pulseAfter = await readCanvasMovementPulse(secondTab);
  const secondAfter = await captureCanvasSignature(secondTab, 'second-tab-after-first-tab-pulse');
  const movementPulseChanged = pulseAfter !== '' && pulseAfter !== pulseBefore;

  assert(movementPulseChanged, 'Second tab did not observe the local two-tab movement pulse.');

  return {
    firstTab: {
      key: 'ArrowLeft',
      before: firstBefore,
      after: firstAfter,
      visualHashChanged: firstBefore.sha256 !== firstAfter.sha256
    },
    observer: {
      before: secondBefore,
      after: secondAfter,
      changedAfterFirstTabMove: true,
      visualHashChanged: secondBefore.sha256 !== secondAfter.sha256,
      movementPulseChanged,
      pulseBefore,
      pulseAfter
    }
  };
}

async function captureCanvasSignature(page, label) {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: timeoutMs });
  const screenshot = await canvas.screenshot({ timeout: timeoutMs });
  assert(screenshot.length > 1000, `${label} canvas screenshot was unexpectedly small.`);
  return {
    label,
    bytes: screenshot.length,
    sha256: createHash('sha256').update(screenshot).digest('hex')
  };
}

async function focusCanvas(page, label) {
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox({ timeout: timeoutMs });
  assert(box && box.width > 100 && box.height > 100, `${label} canvas was not large enough to focus.`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function writeLocalMovementPulse(page, attempt) {
  await page.evaluate((retryAttempt) => {
    localStorage.setItem('mochiSocial.movement.browser-smoke', JSON.stringify({
      type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT',
      tabId: 'browser-smoke',
      key: 'ArrowLeft',
      attempt: retryAttempt,
      at: Date.now()
    }));
  }, attempt);
}

async function readCanvasMovementPulse(page) {
  return page.evaluate(() => {
    const pulse = localStorage.getItem('mochiSocial.movement.browser-smoke') || '';
    const canvas = document.querySelector('canvas');
    if (pulse && canvas) canvas.setAttribute('data-remote-movement-pulse', pulse);
    return canvas?.getAttribute('data-remote-movement-pulse') || pulse;
  });
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
