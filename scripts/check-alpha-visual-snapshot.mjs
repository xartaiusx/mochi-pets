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
  scope: 'Local visual snapshot evidence for the playable Unity WebGL first screen. Writes ignored PNGs for human review; does not replace provider preview gates.',
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
    const manifest = await fetchJson(`${baseUrl}/integration/game-manifest.json`);
    assert(manifest.engine === 'unity-webgl', 'Snapshot manifest must expose Unity WebGL.');
    assert(manifest.activeRuntime === 'unity-webgl', 'Snapshot manifest must report Unity WebGL as active.');
    assert(manifest.room?.mode === 'single-shared-room', 'Snapshot manifest must expose the single shared room.');
    assert(manifest.room?.sharedPetKey === 'lirabao', 'Snapshot manifest must expose Lirabao as the shared pet.');
    assert(manifest.legacyFallback?.active === false, 'Snapshot manifest must not serve the legacy runtime as active.');
    report.manifest = {
      engine: manifest.engine,
      activeRuntime: manifest.activeRuntime,
      room: manifest.room,
      unityWebglBuild: manifest.unityWebglBuild,
      legacyFallback: manifest.legacyFallback
    };

    const page = await context.newPage();
    const pageMessages = [];
    const pageFailures = [];
    page.on('console', (message) => {
      pageMessages.push({
        type: message.type(),
        text: sanitize(message.text())
      });
    });
    page.on('pageerror', (error) => {
      pageFailures.push(sanitize(error.message));
    });
    await page.goto(`${baseUrl}/play`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    const canvas = page.locator('canvas').first();
    await canvas.waitFor({ timeout: timeoutMs });
    await page.waitForFunction(() => Boolean(window.__mochiSocialUnityKeyGuard?.active), { timeout: timeoutMs });
    await page.waitForFunction(() => window.__MOCHI_SOCIAL_UNITY_RUNTIME_READY === true, { timeout: timeoutMs });
    await page.waitForTimeout(500);
    const loaderDiagnostics = await page.evaluate(() => {
      const text = document.body?.textContent || '';
      return {
        bodyTextSnippet: text.slice(0, 2000),
        unityLoaderErrorPresent: /Unable to parse Build\/|Content-Encoding|Decompression Fallback|WebGL build may be compressed/i.test(text)
      };
    });
    const loaderConsoleErrors = pageMessages.filter((entry) =>
      /Unable to parse Build\/|Content-Encoding|Decompression Fallback|WebGL build may be compressed/i.test(entry.text)
    );

    assert(loaderDiagnostics.unityLoaderErrorPresent === false, 'Snapshot page must not show a Unity WebGL loader or compression error.');
    assert(loaderConsoleErrors.length === 0, 'Snapshot console must not report a Unity WebGL loader or compression error.');

    const canvasBox = await canvas.boundingBox({ timeout: timeoutMs });
    assert(canvasBox && canvasBox.width >= 600 && canvasBox.height >= 400, 'Game canvas must be large enough for first-screen visual review.');

    const pagePng = await page.screenshot({ fullPage: true, timeout: timeoutMs });
    const canvasPng = await canvas.screenshot({ timeout: timeoutMs });
    await writeFile(pageScreenshotPath, pagePng);
    await writeFile(canvasScreenshotPath, canvasPng);

    const dom = await page.evaluate(() => ({
      title: document.title,
      runtime: 'unity-webgl',
      hud: Boolean(document.querySelector('#mochi-social-hud')),
      canvas: Boolean(document.querySelector('canvas')),
      keyGuard: Boolean(window.__mochiSocialUnityKeyGuard?.active),
      unityRuntimeReady: window.__MOCHI_SOCIAL_UNITY_RUNTIME_READY === true,
      unityLastEventType: window.__MOCHI_SOCIAL_UNITY_LAST_EVENT?.type || '',
      unityCanvasId: document.querySelector('canvas')?.id || '',
      unityBuildTitle: document.querySelector('#unity-build-title')?.textContent?.trim() || '',
      createUnityInstance: document.body.textContent?.includes('createUnityInstance') || false,
      unityLoaderErrorPresent: /Unable to parse Build\/|Content-Encoding|Decompression Fallback|WebGL build may be compressed/i.test(document.body.textContent || ''),
      legacyHudSelectors: [
        '#mochi-social-hud',
        '[data-presence-label]',
        '[data-spirit-label]',
        '[data-market-label]',
        '[data-alpha-feed]'
      ].filter((selector) => Boolean(document.querySelector(selector))),
      futureEconomyTextPresent: /\b(?:market|trade|cashout|funded-chain)\b/i.test(document.body.textContent || '')
    }));

    assert(dom.title.includes('Mochi Social'), 'Snapshot page title must identify Mochi Social.');
    assert(dom.canvas, 'Snapshot page must render the game canvas.');
    assert(dom.keyGuard, 'Snapshot page must install the Unity input guard.');
    assert(dom.unityRuntimeReady, 'Snapshot page must wait for the Unity runtime ready marker.');
    assert(dom.unityLastEventType === 'MOCHI_SOCIAL_READY', 'Snapshot page must record the Unity READY bridge event.');
    assert(dom.unityCanvasId === 'unity-canvas', 'Snapshot page must render the Unity canvas.');
    assert(dom.legacyHudSelectors.length === 0, 'Snapshot page must not expose legacy RPGJS HUD selectors.');
    assert(dom.futureEconomyTextPresent === false, 'Snapshot page must not expose future economy language.');
    assert(pagePng.length > 1000, 'Page screenshot was unexpectedly small.');
    assert(canvasPng.length > 1000, 'Canvas screenshot was unexpectedly small.');

    report.dom = dom;
    report.loaderDiagnostics = {
      bodyTextSnippet: sanitize(loaderDiagnostics.bodyTextSnippet),
      consoleErrors: loaderConsoleErrors,
      pageErrors: pageFailures
    };
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
      'Confirm the shared guild room, character view, and Lirabao area read clearly.',
      'Use the separate browser presence and responsive gameplay checks for movement and shared-room evidence.'
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

async function fetchJson(url) {
  const response = await fetch(url);
  assert(response.ok, `Failed to fetch ${url}: HTTP ${response.status}`);
  return response.json();
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 2000);
}
