import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_VISUAL_TIMEOUT_MS || 20000);
const headless = process.env.MOCHI_SOCIAL_VISUAL_HEADFUL !== 'true';
const hostedAllowed = process.env.MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT === 'true';
const localBaseUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(baseUrl);
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REPORT || 'reports/alpha-visual-snapshot.json');
const pageScreenshotPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_PAGE_PNG || 'reports/alpha-visual-page.png');
const canvasScreenshotPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_CANVAS_PNG || 'reports/alpha-visual-canvas.png');

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  baseUrl,
  localOnlyDefault: true,
  hostedAllowed,
  scope: 'Local visual snapshot evidence for the playable first screen. Writes ignored PNGs for human/Codex review; does not replace provider preview gates.',
  screenshots: {
    page: pageScreenshotPath,
    canvas: canvasScreenshotPath
  }
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social visual snapshot passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
  console.log(`Page screenshot: ${pageScreenshotPath}`);
  console.log(`Canvas screenshot: ${canvasScreenshotPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social visual snapshot failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  assertNoHostedSnapshotWithoutApproval();
  await mkdir(dirname(pageScreenshotPath), { recursive: true });
  await mkdir(dirname(canvasScreenshotPath), { recursive: true });

  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1
  });

  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}/play`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await page.waitForSelector('#mochi-social-hud', { timeout: timeoutMs });
    await page.waitForSelector('[data-presence-label]', { timeout: timeoutMs });
    const canvas = page.locator('canvas').first();
    await canvas.waitFor({ timeout: timeoutMs });
    await page.waitForTimeout(1000);

    const canvasBox = await canvas.boundingBox({ timeout: timeoutMs });
    assert(canvasBox && canvasBox.width >= 600 && canvasBox.height >= 400, 'Game canvas must be large enough for first-screen visual review.');

    const pagePng = await page.screenshot({ fullPage: true, timeout: timeoutMs });
    const canvasPng = await canvas.screenshot({ timeout: timeoutMs });
    await writeFile(pageScreenshotPath, pagePng);
    await writeFile(canvasScreenshotPath, canvasPng);

    const dom = await page.evaluate(() => ({
      title: document.title,
      hud: Boolean(document.querySelector('#mochi-social-hud')),
      canvas: Boolean(document.querySelector('canvas')),
      presence: document.querySelector('[data-presence-label]')?.textContent?.trim() || '',
      pet: document.querySelector('[data-pet-label]')?.textContent?.trim() || '',
      market: document.querySelector('[data-market-label]')?.textContent?.trim() || '',
      feed: Array.from(document.querySelectorAll('[data-alpha-feed] li')).map((item) => item.textContent?.trim() || '')
    }));

    assert(dom.title.includes('Mochi Social'), 'Snapshot page title must identify Mochi Social.');
    assert(dom.hud, 'Snapshot page must render the alpha HUD.');
    assert(dom.canvas, 'Snapshot page must render the game canvas.');
    assert(dom.presence.includes('Nearby'), 'Snapshot page must render the presence label.');
    assert(pagePng.length > 1000, 'Page screenshot was unexpectedly small.');
    assert(canvasPng.length > 1000, 'Canvas screenshot was unexpectedly small.');

    report.dom = dom;
    report.canvasBox = canvasBox;
    report.screenshots = {
      page: {
        path: pageScreenshotPath,
        bytes: pagePng.length,
        sha256: createHash('sha256').update(pagePng).digest('hex')
      },
      canvas: {
        path: canvasScreenshotPath,
        bytes: canvasPng.length,
        sha256: createHash('sha256').update(canvasPng).digest('hex')
      }
    };
    report.manualReview = [
      'Open reports/alpha-visual-page.png and reports/alpha-visual-canvas.png.',
      'Confirm the town, HUD, and first-screen composition are coherent.',
      'Use the separate browser presence and map-object contract checks for movement/HUD/event evidence.'
    ];
  } finally {
    await context.close();
    await browser.close();
  }
}

function assertNoHostedSnapshotWithoutApproval() {
  if (localBaseUrl || hostedAllowed) return;
  throw new Error(
    'Visual snapshot is local-only by default. Set MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT=true only after explicit hosted-preview approval.'
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
        `Could not launch a browser for the visual snapshot. Install Chrome, set MOCHI_SOCIAL_BROWSER_EXECUTABLE, or run this on a machine with Playwright browsers installed. First launch error: ${detail}`
      );
    }
  }
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
