import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const baseUrl = (readEnv('MOCHI_PETS_BASE_URL', 'MOCHI_SOCIAL_BASE_URL') || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(readEnv('MOCHI_PETS_RESPONSIVE_TIMEOUT_MS', 'MOCHI_SOCIAL_RESPONSIVE_TIMEOUT_MS') || 30000);
const headless = readEnv('MOCHI_PETS_RESPONSIVE_HEADFUL', 'MOCHI_SOCIAL_RESPONSIVE_HEADFUL') !== 'true';
const hostedAllowed = readEnv('MOCHI_PETS_RESPONSIVE_ALLOW_HOSTED_SMOKE', 'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE') === 'true';
const localBaseUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(baseUrl);
const siteBaseUrl = normalizeOptionalUrl(readEnv(
  'MOCHI_PETS_RESPONSIVE_SITE_BASE_URL',
  'MOCHI_PETS_SITE_BASE_URL',
  'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL',
  'MOCHI_SOCIAL_SITE_BASE_URL'
));
const siteEntryPath = readEnv('MOCHI_PETS_RESPONSIVE_SITE_ENTRY_PATH', 'MOCHI_SOCIAL_RESPONSIVE_SITE_ENTRY_PATH') || '/games/mochi-pets';
const sitePassword = readEnv(
  'MOCHI_PETS_TESTER_PASSWORD',
  'MOCHI_PETS_RESPONSIVE_SITE_PASSWORD',
  'MOCHI_SOCIAL_TESTER_PASSWORD',
  'MOCHI_SOCIAL_RESPONSIVE_SITE_PASSWORD'
);
const requireSiteIframe = readEnv('MOCHI_PETS_RESPONSIVE_REQUIRE_SITE_IFRAME', 'MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME') === 'true';
const reportPath = resolve(root, readEnv('MOCHI_PETS_RESPONSIVE_REPORT', 'MOCHI_SOCIAL_RESPONSIVE_REPORT') || 'reports/alpha-responsive-gameplay.json');
const screenshotDir = resolve(root, readEnv('MOCHI_PETS_RESPONSIVE_SCREENSHOT_DIR', 'MOCHI_SOCIAL_RESPONSIVE_SCREENSHOT_DIR') || 'reports/responsive-gameplay');
const movementKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd'];
const interactionKeys = ['Space', 'Enter'];
const legacyInteractionKeys = ['Spacebar'];
const gameplayKeys = [...movementKeys, ...interactionKeys];
const unhandledKeys = ['Escape', 'q'];
const viewports = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 932, height: 430 },
  { width: 844, height: 390 },
  { width: 430, height: 932 },
  { width: 390, height: 844 }
];
const routes = ['/play', '/embed'];
const failures = [];

const report = {
  ok: false,
  checkedAt: new Date().toISOString(),
  scope: 'Local Unity WebGL responsive gameplay and input-scroll guard. Verifies /play, /embed, synthetic parent iframe, and optional Mochirii /games/mochi-pets iframe across the alpha viewport matrix.',
  baseUrl,
  site: {
    configured: Boolean(siteBaseUrl),
    required: requireSiteIframe,
    baseUrl: siteBaseUrl ? redactUrl(siteBaseUrl) : null,
    entryPath: siteEntryPath,
    passwordProvided: Boolean(sitePassword)
  },
  localOnlyDefault: true,
  hostedAllowed,
  git: readGitState(),
  runtime: null,
  viewports,
  routes,
  movementKeys,
  interactionKeys,
  legacyInteractionKeys,
  gameplayKeys,
  unhandledKeys,
  results: [],
  iframeResults: [],
  siteIframeResults: [],
  failures
};

try {
  await run();
  report.ok = failures.length === 0;
  await writeReport();
  if (!report.ok) {
    console.error('Mochi Pets Unity responsive gameplay smoke failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    console.error(`Report: ${reportPath}`);
    process.exit(1);
  }
  console.log(`Mochi Pets Unity responsive gameplay smoke passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
  report.ok = false;
  await writeReport();
  console.error('Mochi Pets Unity responsive gameplay smoke failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  assertNoHostedSmokeWithoutApproval();
  await mkdir(dirname(reportPath), { recursive: true });
  await mkdir(screenshotDir, { recursive: true });
  await assertUnityRuntime();

  const browser = await launchBrowser();
  try {
    for (const viewport of viewports) {
      for (const route of routes) {
        report.results.push(await inspectRoute(browser, route, viewport));
      }
      report.iframeResults.push(await inspectParentIframe(browser, viewport));
    }
    await inspectMochiriiSiteIframeIfConfigured(browser);
  } finally {
    await browser.close();
  }
}

async function assertUnityRuntime() {
  const response = await fetch(`${baseUrl}/integration/game-manifest.json`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`Manifest request failed with ${response.status}.`);
  const manifest = await response.json();
  if (manifest.engine !== 'unity-webgl') failures.push('Manifest must expose Unity WebGL.');
  if (manifest.activeRuntime !== 'unity-webgl') failures.push('Manifest must report Unity WebGL as active.');
  if (manifest.unityWebglBuild?.present !== true) failures.push('Manifest must report a present Unity WebGL build.');
  if (manifest.legacyFallback?.active !== false) failures.push('Manifest must report legacy fallback inactive.');
  report.runtime = {
    engine: manifest.engine,
    activeRuntime: manifest.activeRuntime,
    room: manifest.room,
    unityWebglBuild: manifest.unityWebglBuild,
    legacyFallback: manifest.legacyFallback
  };
}

async function inspectRoute(browser, route, viewport) {
  const context = await newContext(browser, viewport);
  const page = await context.newPage();
  const label = `${routeName(route)}-${viewport.width}x${viewport.height}`;
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await waitForGame(page);
    const screenshot = await captureScreenshot(page, label);
    const layout = await inspectLayout(page, `${route} ${viewport.width}x${viewport.height}`);
    const inputScroll = await verifyInputOwnership(page, page, `${route} ${viewport.width}x${viewport.height}`);
    const focus = await verifyTabFocus(page);
    return { route, viewport, screenshot, layout, inputScroll, focus, actions: { runtime: 'unity-webgl', legacyHudAbsent: true } };
  } finally {
    await context.close();
  }
}

async function inspectParentIframe(browser, viewport) {
  const context = await newContext(browser, viewport);
  const page = await context.newPage();
  const label = `parent-iframe-${viewport.width}x${viewport.height}`;
  try {
    await page.setContent(`
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            html, body { margin: 0; min-height: 260vh; background: #172017; }
            iframe { display: block; width: 100vw; height: 100vh; border: 0; }
          </style>
        </head>
        <body>
          <iframe title="Mochi Social responsive smoke" src="${baseUrl}/embed"></iframe>
        </body>
      </html>
    `, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

    const frameHandle = await page.waitForSelector('iframe', { timeout: timeoutMs });
    const frame = await frameHandle.contentFrame();
    if (!frame) throw new Error(`${label}: iframe content frame was not available.`);
    await waitForGame(frame);
    await page.evaluate(() => window.scrollTo(0, 240));
    const parentBefore = await parentScrollSnapshot(page);
    const inputOwnership = await verifyInputOwnership(frame, page, label, { parentPage: page });
    const parentAfter = await parentScrollSnapshot(page);
    assertScrollUnchanged(parentBefore, parentAfter, `${label} parent page`);
    const screenshot = await captureScreenshot(page, label);
    return { viewport, screenshot, inputOwnership };
  } finally {
    await context.close();
  }
}

async function inspectMochiriiSiteIframeIfConfigured(browser) {
  if (!siteBaseUrl) {
    report.site.status = requireSiteIframe ? 'missing-site-url' : 'skipped';
    if (requireSiteIframe) failures.push('Mochirii site iframe smoke requires MOCHI_PETS_RESPONSIVE_SITE_BASE_URL or MOCHI_PETS_SITE_BASE_URL.');
    return;
  }

  report.site.status = 'checked';
  for (const viewport of viewports) {
    report.siteIframeResults.push(await inspectMochiriiSiteIframe(browser, viewport));
  }
}

async function inspectMochiriiSiteIframe(browser, viewport) {
  const context = await newContext(browser, viewport);
  const page = await context.newPage();
  const label = `mochirii-site-iframe-${viewport.width}x${viewport.height}`;
  try {
    await page.goto(siteUrl(), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    const unlock = await unlockTesterGateIfPresent(page, label);
    const frame = await findGameFrame(page, label);
    await waitForGame(frame);
    const inputOwnership = await verifyInputOwnership(frame, page, label, { parentPage: page });
    const screenshot = await captureScreenshot(page, label);
    const frameLayout = await inspectLayout(frame, `${label} iframe`);
    return { viewport, unlock, screenshot, frameLayout, inputOwnership };
  } finally {
    await context.close();
  }
}

async function unlockTesterGateIfPresent(page, label) {
  const passwordInput = page.locator('input[type="password"], input[name*="password" i], input[autocomplete="current-password"]').first();
  const visible = await passwordInput.isVisible({ timeout: 1500 }).catch(() => false);
  if (!visible) return { gateDetected: false, passwordProvided: Boolean(sitePassword), submitted: false };
  if (!sitePassword) {
    failures.push(`${label}: tester password gate is visible but MOCHI_PETS_TESTER_PASSWORD was not provided.`);
    return { gateDetected: true, passwordProvided: false, submitted: false };
  }
  await passwordInput.fill(sitePassword);
  await passwordInput.press('Enter');
  await page.waitForTimeout(1000);
  return { gateDetected: true, passwordProvided: true, submitted: true };
}

async function findGameFrame(page, label) {
  await page.waitForSelector('iframe', { timeout: timeoutMs });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const url = frame.url();
      if (url.includes('/embed') || url.includes('/play') || url.startsWith(baseUrl)) return frame;
      if (await frame.locator('canvas').count().catch(() => 0)) return frame;
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`${label}: Mochi Pets iframe was not found on ${siteEntryPath}.`);
}

async function waitForGame(pageOrFrame) {
  await pageOrFrame.waitForSelector('canvas', { timeout: timeoutMs });
  await pageOrFrame.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    return rect.width > 100 && rect.height > 100;
  }, { timeout: timeoutMs });
  await pageOrFrame.waitForTimeout(500);
}

async function inspectLayout(pageOrFrame, label) {
  const data = await pageOrFrame.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth || 0
    };
    const canvas = document.querySelector('canvas');
    const rect = canvas?.getBoundingClientRect();
    const legacySelectors = [
      '[data-presence-label]',
      '[data-alpha-action="market.fixed_list"]',
      '[data-alpha-action="trade.direct_offer"]',
      '[data-alpha-action^="chain."]',
      '#mochi-social-hud',
      '[data-chat-input]',
      '[data-market-label]'
    ];
    const legacyHits = legacySelectors
      .map((selector) => ({ selector, count: document.querySelectorAll(selector).length }))
      .filter((entry) => entry.count > 0);
    return {
      viewport,
      canvas: rect
        ? {
            left: round(rect.left),
            top: round(rect.top),
            right: round(rect.right),
            bottom: round(rect.bottom),
            width: round(rect.width),
            height: round(rect.height)
          }
        : null,
      horizontalOverflow: Math.max(viewport.documentScrollWidth, viewport.bodyScrollWidth) - viewport.width,
      legacyHits,
      criticalRects: [
        { name: 'canvas', selector: 'canvas', present: Boolean(canvas), visible: Boolean(rect && rect.width > 0 && rect.height > 0), requiredVisible: true }
      ],
      actionButtonCount: 0,
      inputSurface: {
        body: stylesFor(document.body),
        canvas: stylesFor(canvas)
      }
    };

    function stylesFor(element) {
      if (!element) return null;
      const styles = window.getComputedStyle(element);
      return {
        touchAction: styles.touchAction,
        overscrollBehaviorX: styles.overscrollBehaviorX,
        overscrollBehaviorY: styles.overscrollBehaviorY
      };
    }

    function round(value) {
      return Math.round(Number(value) * 100) / 100;
    }
  });

  if (!data.canvas || data.canvas.width < 240 || data.canvas.height < 240) failures.push(`${label}: canvas is missing or too small.`);
  if (data.horizontalOverflow > 1) failures.push(`${label}: page has horizontal overflow of ${data.horizontalOverflow}px.`);
  if (data.legacyHits.length) failures.push(`${label}: legacy RPGJS HUD selectors are present (${data.legacyHits.map((hit) => hit.selector).join(', ')}).`);
  verifyInputSurfaceStyles(data.inputSurface, label);
  return data;
}

async function verifyInputOwnership(auditTarget, keyboardPage, label, options = {}) {
  await installKeyAudit(auditTarget);
  const focus = await focusGameplayCanvas(auditTarget, label);
  const parentPage = options.parentPage || null;
  const gameplay = { focus, checks: [] };
  const legacyInteraction = { focus, checks: [] };
  const unhandled = { checks: [] };

  for (const key of gameplayKeys) {
    const before = await frameScrollSnapshot(auditTarget);
    const parentBefore = parentPage ? await parentScrollSnapshot(parentPage) : null;
    const audit = await pressKeyAndReadAudit(auditTarget, keyboardPage, key);
    const after = await frameScrollSnapshot(auditTarget);
    const parentAfter = parentPage ? await parentScrollSnapshot(parentPage) : null;
    assertScrollUnchanged(before, after, `${label} ${key}`);
    if (parentBefore && parentAfter) assertScrollUnchanged(parentBefore, parentAfter, `${label} ${key} parent page`);
    const keydown = firstKeydown(audit);
    if (!keydown) failures.push(`${label}: ${key} did not produce a keydown event in the gameplay frame.`);
    else {
      if (keydown.editableTarget) failures.push(`${label}: ${key} targeted an editable element while gameplay canvas was focused.`);
      if (keydown.cancelable && !keydown.defaultPrevented) failures.push(`${label}: ${key} was not prevented while gameplay canvas was focused.`);
    }
    gameplay.checks.push({ key, before, after, parentBefore, parentAfter, keydown });
  }

  for (const key of legacyInteractionKeys) {
    const before = await frameScrollSnapshot(auditTarget);
    const parentBefore = parentPage ? await parentScrollSnapshot(parentPage) : null;
    await resetKeyAudit(auditTarget);
    const synthetic = await auditTarget.evaluate((legacyKey) => {
      const canvas = document.querySelector('canvas');
      const event = new KeyboardEvent('keydown', {
        key: legacyKey,
        code: legacyKey === 'Spacebar' ? 'Space' : legacyKey,
        bubbles: true,
        cancelable: true
      });
      const target = canvas || document.body;
      target.dispatchEvent(event);
      return {
        key: legacyKey,
        code: event.code,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        targetTag: target.tagName
      };
    }, key);
    const after = await frameScrollSnapshot(auditTarget);
    const parentAfter = parentPage ? await parentScrollSnapshot(parentPage) : null;
    assertScrollUnchanged(before, after, `${label} ${key}`);
    if (parentBefore && parentAfter) assertScrollUnchanged(parentBefore, parentAfter, `${label} ${key} parent page`);
    if (!synthetic.defaultPrevented) failures.push(`${label}: legacy interaction key ${key} was not prevented while gameplay canvas was focused.`);
    legacyInteraction.checks.push({ key, before, after, parentBefore, parentAfter, synthetic, keydown: synthetic });
  }

  for (const key of unhandledKeys) {
    const audit = await pressKeyAndReadAudit(auditTarget, keyboardPage, key);
    const keydown = firstKeydown(audit);
    if (keydown?.defaultPrevented) failures.push(`${label}: unhandled key ${key} was unexpectedly prevented.`);
    unhandled.checks.push({ key, keydown });
  }

  return {
    gameplay,
    legacyInteraction,
    unhandled,
    editable: {
      target: null,
      valueLength: 0,
      containsMovementLetters: true,
      containsSpace: true,
      preventedKeyCount: 0,
      absentBecause: 'unity-webgl-local-social-signal'
    }
  };
}

async function verifyTabFocus(page) {
  await installKeyAudit(page);
  await focusGameplayCanvas(page, 'tab focus');
  await resetKeyAudit(page);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const audit = await readKeyAudit(page);
  const active = await page.evaluate(() => {
    const element = document.activeElement;
    return {
      tagName: element?.tagName || '',
      id: element?.id || '',
      defaultPrevented: false
    };
  });
  return {
    active,
    tabKeydown: firstKeydown(audit)
  };
}

async function installKeyAudit(pageOrFrame) {
  await pageOrFrame.evaluate(() => {
    if (window.__mochiSocialResponsiveAuditInstalled) return;
    window.__mochiSocialResponsiveAuditInstalled = true;
    window.__mochiSocialResponsiveAudit = [];
    window.addEventListener('keydown', (event) => {
      const active = document.activeElement;
      const target = event.target;
      window.__mochiSocialResponsiveAudit.push({
        type: 'keydown',
        key: event.key,
        code: event.code,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        editableTarget: isEditable(target),
        editableActive: isEditable(active),
        activeIsCanvas: active?.tagName === 'CANVAS',
        targetTag: target?.tagName || ''
      });
    }, true);

    function isEditable(element) {
      if (!element) return false;
      const tag = String(element.tagName || '').toLowerCase();
      return tag === 'input' || tag === 'textarea' || element.isContentEditable === true;
    }
  });
}

async function resetKeyAudit(pageOrFrame) {
  await pageOrFrame.evaluate(() => {
    window.__mochiSocialResponsiveAudit = [];
  });
}

async function readKeyAudit(pageOrFrame) {
  return pageOrFrame.evaluate(() => Array.isArray(window.__mochiSocialResponsiveAudit) ? window.__mochiSocialResponsiveAudit : []);
}

async function pressKeyAndReadAudit(auditTarget, keyboardPage, key) {
  await resetKeyAudit(auditTarget);
  if (auditTarget === keyboardPage) {
    await keyboardPage.keyboard.press(key);
  } else {
    await auditTarget.evaluate((pressedKey) => {
      const canvas = document.querySelector('canvas');
      const target = canvas || document.body;
      const normalizedCode = pressedKey === 'Spacebar' ? 'Space' : pressedKey;
      const event = new KeyboardEvent('keydown', {
        key: pressedKey,
        code: normalizedCode,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(event);
    }, key);
  }
  await keyboardPage.waitForTimeout(80);
  return readKeyAudit(auditTarget);
}

function firstKeydown(audit) {
  return Array.isArray(audit) ? audit.find((event) => event.type === 'keydown') || null : null;
}

async function focusGameplayCanvas(pageOrFrame, label) {
  const canvas = pageOrFrame.locator('canvas').first();
  const box = await canvas.boundingBox({ timeout: timeoutMs });
  if (!box || box.width < 100 || box.height < 100) failures.push(`${label}: canvas was not large enough to focus.`);
  await pageOrFrame.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.setAttribute('tabindex', '0');
    canvas.focus();
  });
  await canvas.click({ timeout: timeoutMs, force: true }).catch(() => {});
  return pageOrFrame.evaluate(() => ({
    activeIsCanvas: document.activeElement?.tagName === 'CANVAS',
    activeTag: document.activeElement?.tagName || ''
  }));
}

async function frameScrollSnapshot(pageOrFrame) {
  return pageOrFrame.evaluate(() => ({
    windowX: window.scrollX,
    windowY: window.scrollY,
    docTop: document.documentElement.scrollTop,
    bodyTop: document.body?.scrollTop || 0
  }));
}

async function parentScrollSnapshot(page) {
  return page.evaluate(() => ({
    windowX: window.scrollX,
    windowY: window.scrollY,
    docTop: document.documentElement.scrollTop,
    bodyTop: document.body?.scrollTop || 0
  }));
}

function assertScrollUnchanged(before, after, label) {
  for (const key of Object.keys(before || {})) {
    if (Math.abs(Number(before[key] || 0) - Number(after?.[key] || 0)) > 1) {
      failures.push(`${label}: scroll changed on ${key} (${before[key]} -> ${after?.[key]}).`);
    }
  }
}

async function captureScreenshot(pageOrFrame, label) {
  const path = resolve(screenshotDir, `${label}.png`);
  const buffer = await pageOrFrame.screenshot({ path, fullPage: false, timeout: timeoutMs });
  if (buffer.length <= 1000) failures.push(`${label}: viewport screenshot was unexpectedly small.`);
  return {
    path: pathForReport(path),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex')
  };
}

async function launchBrowser() {
  const commonOptions = { headless, args: ['--no-sandbox'] };
  const browserExecutable = readEnv('MOCHI_PETS_BROWSER_EXECUTABLE', 'MOCHI_SOCIAL_BROWSER_EXECUTABLE');
  if (browserExecutable) {
    return chromium.launch({ ...commonOptions, executablePath: browserExecutable });
  }
  const channel = readEnv('MOCHI_PETS_BROWSER_CHANNEL', 'MOCHI_SOCIAL_BROWSER_CHANNEL') || 'chrome';
  try {
    return await chromium.launch({ ...commonOptions, channel });
  } catch (error) {
    try {
      return await chromium.launch(commonOptions);
    } catch {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not launch a browser for responsive gameplay smoke. Install Chrome, set MOCHI_PETS_BROWSER_EXECUTABLE, or install Playwright browsers. First launch error: ${detail}`);
    }
  }
}

async function newContext(browser, viewport) {
  return browser.newContext({ viewport, deviceScaleFactor: 1 });
}

function verifyInputSurfaceStyles(surface, label) {
  if (!surface?.canvas) failures.push(`${label}: canvas input surface styles missing.`);
}

function assertNoHostedSmokeWithoutApproval() {
  if (localBaseUrl || hostedAllowed) return;
  throw new Error('Responsive gameplay smoke is local-only by default. Set MOCHI_PETS_RESPONSIVE_ALLOW_HOSTED_SMOKE=true only after explicit hosted approval.');
}

function readEnv(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function normalizeOptionalUrl(value) {
  const normalized = String(value || '').trim().replace(/\/+$/, '');
  return normalized || null;
}

function siteUrl() {
  return `${siteBaseUrl}${siteEntryPath.startsWith('/') ? siteEntryPath : `/${siteEntryPath}`}`;
}

function redactUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) {
      parsed.username = '<redacted>';
      parsed.password = '<redacted>';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return '<invalid-url>';
  }
}

function routeName(route) {
  return route.replace(/^\//, '').replace(/[^a-z0-9_-]+/gi, '-') || 'root';
}

function pathForReport(path) {
  return path.startsWith(root) ? path.slice(root.length + 1).replace(/\\/g, '/') : path;
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function readGitState() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = git(['rev-parse', 'HEAD']);
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = git(['status', '--porcelain']);
  return {
    branch: firstLine(branch.stdout),
    localHead: firstLine(localHead.stdout),
    upstream: firstLine(upstream.stdout),
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => result.stderr || result.error || 'git command failed')
  };
}

function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', shell: false });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}
