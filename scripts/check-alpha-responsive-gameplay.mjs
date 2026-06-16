import { chromium } from 'playwright-core';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL || 'http://localhost:3100').replace(/\/+$/, '');
const timeoutMs = Number(process.env.MOCHI_SOCIAL_RESPONSIVE_TIMEOUT_MS || 25000);
const headless = process.env.MOCHI_SOCIAL_RESPONSIVE_HEADFUL !== 'true';
const hostedAllowed = process.env.MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE === 'true';
const localBaseUrl = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(baseUrl);
const siteBaseUrl = normalizeOptionalUrl(process.env.MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL || process.env.MOCHI_SOCIAL_SITE_BASE_URL);
const siteEntryPath = process.env.MOCHI_SOCIAL_RESPONSIVE_SITE_ENTRY_PATH || '/games/mochi-social';
const sitePassword = process.env.MOCHI_SOCIAL_TESTER_PASSWORD || process.env.MOCHI_SOCIAL_RESPONSIVE_SITE_PASSWORD || '';
const requireSiteIframe = process.env.MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME === 'true';
const localSiteBaseUrl = !siteBaseUrl || /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(siteBaseUrl);
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_RESPONSIVE_REPORT || 'reports/alpha-responsive-gameplay.json');
const screenshotDir = resolve(root, process.env.MOCHI_SOCIAL_RESPONSIVE_SCREENSHOT_DIR || 'reports/responsive-gameplay');
const gameplayKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'w', 'a', 's', 'd', 'Space', 'Enter'];
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
  scope: 'Local responsive gameplay and input-scroll guard. Verifies /play, /embed, synthetic parent iframe, and optional Mochirii /games/mochi-social iframe across the Alpha viewport matrix.',
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
  viewports,
  routes,
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
    console.error('Mochi Social responsive gameplay smoke failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    console.error(`Report: ${reportPath}`);
    process.exit(1);
  }
  console.log(`Mochi Social responsive gameplay smoke passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
  report.ok = false;
  await writeReport();
  console.error('Mochi Social responsive gameplay smoke failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  assertNoHostedSmokeWithoutApproval();
  await mkdir(dirname(reportPath), { recursive: true });
  await mkdir(screenshotDir, { recursive: true });

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

async function inspectRoute(browser, route, viewport) {
  const context = await newContext(browser, viewport);
  const page = await context.newPage();
  const label = `${routeName(route)}-${viewport.width}x${viewport.height}`;
  try {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await waitForGame(page);
    const screenshot = await captureScreenshot(page, label);
    const layout = await inspectLayout(page, `${route} ${viewport.width}x${viewport.height}`);
    const inputScroll = await verifyInputScrollGuard(page, `${route} ${viewport.width}x${viewport.height}`);
    const focus = await verifyTabFocus(page, `${route} ${viewport.width}x${viewport.height}`);
    const actions = await verifyActionsReachable(page, `${route} ${viewport.width}x${viewport.height}`);
    return { route, viewport, screenshot, layout, inputScroll, focus, actions };
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
            html,
            body {
              margin: 0;
              min-height: 260vh;
              background: #172017;
            }
            iframe {
              display: block;
              width: 100vw;
              height: 100vh;
              border: 0;
            }
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
    const inputOwnership = await verifyFrameInputOwnership(page, frame, label);
    const screenshot = await captureScreenshot(page, label);
    return { viewport, screenshot, inputOwnership };
  } finally {
    await context.close();
  }
}

async function inspectMochiriiSiteIframeIfConfigured(browser) {
  if (!siteBaseUrl) {
    report.site.status = requireSiteIframe ? 'missing-site-url' : 'skipped';
    if (requireSiteIframe) {
      failures.push('Mochirii site iframe smoke requires MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL or MOCHI_SOCIAL_SITE_BASE_URL.');
    }
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
    const inputOwnership = await verifyFrameInputOwnership(page, frame, label);
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
    failures.push(`${label}: tester password gate is visible but MOCHI_SOCIAL_TESTER_PASSWORD was not provided.`);
    return { gateDetected: true, passwordProvided: false, submitted: false };
  }
  await passwordInput.fill(sitePassword);
  await passwordInput.press('Enter');
  await page.waitForTimeout(1000);
  const stillVisible = await passwordInput.isVisible({ timeout: 1000 }).catch(() => false);
  if (stillVisible) {
    const submit = page.locator('button[type="submit"], button:has-text("Enter"), button:has-text("Unlock"), button:has-text("Play")').first();
    if (await submit.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(1000);
    }
  }
  return { gateDetected: true, passwordProvided: true, submitted: true };
}

async function findGameFrame(page, label) {
  await page.waitForSelector('iframe', { timeout: timeoutMs });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (frame === page.mainFrame()) continue;
      const url = frame.url();
      if (url.includes('/embed') || url.includes('/play') || url.startsWith(baseUrl)) {
        return frame;
      }
      if (await frame.locator('#mochi-social-hud').count().catch(() => 0)) {
        return frame;
      }
    }
    await page.waitForTimeout(250);
  }
  throw new Error(`${label}: Mochi Social iframe was not found on ${siteEntryPath}.`);
}

async function waitForGame(pageOrFrame) {
  await pageOrFrame.waitForSelector('#mochi-social-hud', { timeout: timeoutMs });
  await pageOrFrame.waitForSelector('[data-presence-label]', { timeout: timeoutMs });
  await pageOrFrame.waitForSelector('canvas', { timeout: timeoutMs });
  await pageOrFrame.waitForTimeout(700);
}

async function captureScreenshot(page, label) {
  const path = resolve(screenshotDir, `${label}.png`);
  const buffer = await page.screenshot({ path, fullPage: false, timeout: timeoutMs });
  if (buffer.length <= 1000) failures.push(`${label}: viewport screenshot was unexpectedly small.`);
  return {
    path: pathForReport(path),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex')
  };
}

async function inspectLayout(page, label) {
  const data = await page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body?.scrollWidth || 0
    };
    const safeRect = {
      left: viewport.width * 0.34,
      top: viewport.height * 0.32,
      right: viewport.width * 0.66,
      bottom: viewport.height * 0.68
    };
    const panelSelectors = [
      '.mochi-hud__status-strip',
      '.mochi-hud__social-card',
      '.mochi-hud__spirit-card',
      '.mochi-hud__feed-panel',
      '.mochi-hud__actions'
    ];
    const rectFor = (element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return {
        selector: selectorFor(element),
        text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        left: round(rect.left),
        top: round(rect.top),
        right: round(rect.right),
        bottom: round(rect.bottom),
        width: round(rect.width),
        height: round(rect.height),
        display: styles.display,
        visibility: styles.visibility,
        overflowX: styles.overflowX,
        overflowY: styles.overflowY
      };
    };
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const canvas = document.querySelector('canvas');
    const actions = document.querySelector('.mochi-hud__actions');
    const panels = panelSelectors
      .map((selector) => document.querySelector(selector))
      .filter((element) => element && visible(element))
      .map(rectFor);
    const stylesFor = (element) => {
      if (!element) return null;
      const styles = window.getComputedStyle(element);
      return {
        selector: selectorFor(element),
        touchAction: styles.touchAction,
        overscrollBehaviorX: styles.overscrollBehaviorX,
        overscrollBehaviorY: styles.overscrollBehaviorY
      };
    };
    const hudText = Array.from(document.querySelectorAll('#mochi-social-hud button, #mochi-social-hud span, #mochi-social-hud strong, #mochi-social-hud input'))
      .filter((element) => visible(element))
      .map((element) => ({
        selector: selectorFor(element),
        text: (element.textContent || element.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowX: window.getComputedStyle(element).overflowX,
        rect: rectFor(element)
      }))
      .filter((item) => item.scrollWidth - item.clientWidth > 8);
    const canvasRect = canvas ? rectFor(canvas) : null;
    const panelOverlaps = [];
    for (let leftIndex = 0; leftIndex < panels.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < panels.length; rightIndex += 1) {
        const overlap = overlapRect(panels[leftIndex], panels[rightIndex]);
        if (overlap.area > 64) {
          panelOverlaps.push({
            a: panels[leftIndex].selector,
            b: panels[rightIndex].selector,
            area: round(overlap.area)
          });
        }
      }
    }
    const safeArea = Math.max(1, (safeRect.right - safeRect.left) * (safeRect.bottom - safeRect.top));
    const safeRectObstructions = panels
      .map((panel) => ({ panel: panel.selector, overlap: round(overlapRect(panel, safeRect).area), ratio: round(overlapRect(panel, safeRect).area / safeArea) }))
      .filter((item) => item.ratio > 0.12);
    return {
      viewport,
      safeRect,
      canvas: canvasRect,
      panels,
      horizontalOverflow: Math.max(viewport.documentScrollWidth, viewport.bodyScrollWidth) - viewport.width,
      textOverflow: hudText,
      panelOverlaps,
      safeRectObstructions,
      actionButtonCount: document.querySelectorAll('.mochi-hud__actions button').length,
      inputSurface: {
        rpg: stylesFor(document.querySelector('#rpg')),
        body: stylesFor(document.body),
        canvas: stylesFor(canvas),
        actions: stylesFor(actions)
      }
    };

    function round(value) {
      return Math.round(Number(value) * 100) / 100;
    }

    function selectorFor(element) {
      if (element.id) return `#${element.id}`;
      const className = Array.from(element.classList || []).join('.');
      const dataAction = element.getAttribute('data-alpha-action') || element.getAttribute('data-alpha-local-action');
      if (dataAction) return `${element.tagName.toLowerCase()}[data-alpha-action="${dataAction}"]`;
      return className ? `${element.tagName.toLowerCase()}.${className}` : element.tagName.toLowerCase();
    }

    function overlapRect(a, b) {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      return { width, height, area: width * height };
    }
  });

  if (!data.canvas || data.canvas.width < 240 || data.canvas.height < 240) {
    failures.push(`${label}: canvas is missing or too small.`);
  }
  if (data.horizontalOverflow > 1) {
    failures.push(`${label}: page has horizontal overflow of ${data.horizontalOverflow}px.`);
  }
  for (const panel of data.panels) {
    if (panel.left < -1 || panel.top < -1 || panel.right > data.viewport.width + 1 || panel.bottom > data.viewport.height + 1) {
      failures.push(`${label}: ${panel.selector} is outside the viewport.`);
    }
  }
  for (const item of data.textOverflow) {
    failures.push(`${label}: text overflows ${item.selector} (${item.text || 'empty text'}).`);
  }
  for (const item of data.panelOverlaps) {
    failures.push(`${label}: HUD panels overlap (${item.a} over ${item.b}, ${item.area}px).`);
  }
  for (const item of data.safeRectObstructions) {
    failures.push(`${label}: ${item.panel} obstructs the central gameplay safe area (${Math.round(item.ratio * 100)}%).`);
  }
  if (data.actionButtonCount < 50) {
    failures.push(`${label}: action rail has too few gameplay buttons (${data.actionButtonCount}).`);
  }
  verifyInputSurfaceStyles(data.inputSurface, label);
  return data;
}

async function verifyInputScrollGuard(page, label) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('.mochi-hud__actions, .mochi-hud__feed, .mochi-hud__spirit-card').forEach((element) => {
      element.scrollTop = 0;
    });
  });
  await page.locator('canvas').first().click({ timeout: timeoutMs });
  const gameplay = await verifyGameplayKeyOwnership(page, page, label);
  const unhandled = await verifyUnhandledKeyOwnership(page, page, label);
  const editable = await verifyEditableInputKeepsText(page, page, label);
  return { gameplay, unhandled, editable };
}

async function verifyFrameInputOwnership(parentPage, frame, label) {
  await parentPage.evaluate(() => window.scrollTo(0, 240));
  await frame.locator('canvas').first().click({ timeout: timeoutMs });
  const parentBefore = await parentScrollSnapshot(parentPage);
  const gameplay = await verifyGameplayKeyOwnership(frame, parentPage, `${label} iframe`);
  const unhandled = await verifyUnhandledKeyOwnership(frame, parentPage, `${label} iframe`);
  const editable = await verifyEditableInputKeepsText(frame, parentPage, `${label} iframe`);
  const parentAfter = await parentScrollSnapshot(parentPage);
  assertScrollUnchanged(parentBefore, parentAfter, `${label} parent page`);
  return { parentBefore, parentAfter, gameplay, unhandled, editable };
}

async function verifyGameplayKeyOwnership(auditTarget, keyboardPage, label) {
  await installKeyAudit(auditTarget);
  const focus = await focusGameplayCanvas(auditTarget, label);
  const checks = [];
  for (const key of gameplayKeys) {
    const before = await frameScrollSnapshot(auditTarget);
    const audit = await pressKeyAndReadAudit(auditTarget, keyboardPage, key);
    const after = await frameScrollSnapshot(auditTarget);
    assertScrollUnchanged(before, after, `${label} ${key}`);
    const keydown = firstKeydown(audit);
    if (!keydown) {
      failures.push(`${label}: ${key} did not produce a keydown event in the gameplay frame.`);
    } else {
      if (keydown.editableTarget) failures.push(`${label}: ${key} targeted an editable element while gameplay canvas was focused.`);
      if (keydown.cancelable && !keydown.defaultPrevented) failures.push(`${label}: ${key} was not prevented while gameplay canvas was focused.`);
    }
    checks.push({ key, before, after, keydown });
  }
  return { focus, checks };
}

async function verifyUnhandledKeyOwnership(auditTarget, keyboardPage, label) {
  await installKeyAudit(auditTarget);
  await focusGameplayCanvas(auditTarget, label);
  const checks = [];
  for (const key of unhandledKeys) {
    const audit = await pressKeyAndReadAudit(auditTarget, keyboardPage, key);
    const keydown = firstKeydown(audit);
    if (keydown?.defaultPrevented) failures.push(`${label}: unhandled key ${key} was unexpectedly prevented.`);
    checks.push({ key, keydown });
  }
  return { checks };
}

async function verifyEditableInputKeepsText(auditTarget, keyboardPage, label) {
  await installKeyAudit(auditTarget);
  const target = await focusEditableInput(auditTarget);
  await resetKeyAudit(auditTarget);
  await keyboardPage.keyboard.type('wasd test');
  await keyboardPage.keyboard.press('ArrowLeft');
  await keyboardPage.keyboard.press('Space');
  await keyboardPage.waitForTimeout(60);
  const audit = await readKeyAudit(auditTarget);
  const value = await readEditableInputValue(auditTarget);
  if (!value.includes('wasd')) failures.push(`${label}: chat input did not preserve typed movement letters.`);
  if (!value.includes(' ')) failures.push(`${label}: chat input did not preserve a space while focused.`);
  const prevented = audit.filter((event) => event.type === 'keydown' && event.defaultPrevented);
  if (prevented.length > 0) {
    failures.push(`${label}: editable input keydown events were unexpectedly prevented (${prevented.map((event) => event.key || event.code).join(', ')}).`);
  }
  return {
    target,
    valueLength: value.length,
    containsMovementLetters: value.includes('wasd'),
    containsSpace: value.includes(' '),
    preventedKeyCount: prevented.length,
    auditedKeyCount: audit.filter((event) => event.type === 'keydown').length
  };
}

async function verifyTabFocus(page, label) {
  await installKeyAudit(page);
  await page.locator('canvas').first().click({ timeout: timeoutMs });
  await resetKeyAudit(page);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  const audit = await readKeyAudit(page);
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    return {
      tag: element.tagName,
      text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth
    };
  });
  if (!focus || focus.tag === 'BODY') failures.push(`${label}: Tab did not move focus to an interactive control.`);
  const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  if (focus && (focus.left < -1 || focus.top < -1 || focus.right > viewport.width + 1 || focus.bottom > viewport.height + 1)) {
    failures.push(`${label}: focused control is outside the viewport.`);
  }
  if (focus && (focus.outlineStyle === 'none' || Number.parseFloat(focus.outlineWidth) <= 0)) {
    failures.push(`${label}: focused control does not expose a visible outline.`);
  }
  const keydown = firstKeydown(audit);
  if (keydown?.defaultPrevented) failures.push(`${label}: Tab was unexpectedly prevented while moving focus.`);
  return { focus, tabKeydown: keydown };
}

async function verifyActionsReachable(page, label) {
  const result = await page.evaluate(() => {
    const actions = document.querySelector('.mochi-hud__actions');
    const buttons = Array.from(actions?.querySelectorAll('button') || []);
    if (!actions || buttons.length === 0) return { ok: false, buttonCount: buttons.length };
    const actionRect = actions.getBoundingClientRect();
    const visibleWithin = (button) => {
      const rect = button.getBoundingClientRect();
      return rect.left >= actionRect.left - 1
        && rect.right <= actionRect.right + 1
        && rect.top >= actionRect.top - 1
        && rect.bottom <= actionRect.bottom + 1;
    };
    actions.scrollTop = 0;
    const firstVisible = visibleWithin(buttons[0]);
    actions.scrollTop = actions.scrollHeight;
    const lastVisible = visibleWithin(buttons[buttons.length - 1]);
    return {
      ok: firstVisible && lastVisible,
      buttonCount: buttons.length,
      scrollHeight: actions.scrollHeight,
      clientHeight: actions.clientHeight,
      firstText: buttons[0]?.textContent?.trim(),
      lastText: buttons[buttons.length - 1]?.textContent?.trim(),
      firstVisible,
      lastVisible
    };
  });
  if (!result.ok) failures.push(`${label}: first and last action buttons are not reachable in the action rail.`);
  return result;
}

function verifyInputSurfaceStyles(inputSurface, label) {
  if (!inputSurface?.canvas) {
    failures.push(`${label}: gameplay canvas input-surface styles were not inspectable.`);
    return;
  }
  if (inputSurface.canvas.touchAction !== 'none') {
    failures.push(`${label}: gameplay canvas touch-action is ${inputSurface.canvas.touchAction}, expected none.`);
  }
  if (inputSurface.rpg && inputSurface.rpg.overscrollBehaviorY !== 'none') {
    failures.push(`${label}: #rpg overscroll-behavior-y is ${inputSurface.rpg.overscrollBehaviorY}, expected none.`);
  }
  if (inputSurface.body && inputSurface.body.overscrollBehaviorY !== 'none') {
    failures.push(`${label}: body overscroll-behavior-y is ${inputSurface.body.overscrollBehaviorY}, expected none.`);
  }
  if (inputSurface.actions && !['contain', 'none'].includes(inputSurface.actions.overscrollBehaviorY)) {
    failures.push(`${label}: action rail overscroll-behavior-y is ${inputSurface.actions.overscrollBehaviorY}, expected contain or none.`);
  }
}

async function installKeyAudit(pageOrFrame) {
  await pageOrFrame.evaluate(() => {
    const key = '__mochiResponsiveKeyAudit';
    const installKey = '__mochiResponsiveKeyAuditInstalled';
    window[key] = Array.isArray(window[key]) ? window[key] : [];
    if (window[installKey]) return;
    window[installKey] = true;

    const selectorFor = (element) => {
      if (!element) return null;
      if (element.id) return `#${element.id}`;
      const dataAction = element.getAttribute('data-alpha-action') || element.getAttribute('data-alpha-local-action');
      if (dataAction) return `${element.tagName.toLowerCase()}[data-alpha-action="${dataAction}"]`;
      const className = Array.from(element.classList || []).join('.');
      return className ? `${element.tagName.toLowerCase()}.${className}` : element.tagName.toLowerCase();
    };
    const isEditable = (element) => {
      if (!element) return false;
      return Boolean(element.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
    };

    window.addEventListener('keydown', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const active = document.activeElement instanceof Element ? document.activeElement : null;
      window[key].push({
        type: 'keydown',
        key: event.key,
        code: event.code,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        target: selectorFor(target),
        targetTag: target?.tagName || null,
        active: selectorFor(active),
        activeTag: active?.tagName || null,
        editableTarget: isEditable(target),
        editableActive: isEditable(active),
        at: Date.now()
      });
    }, { capture: true });
  });
}

async function resetKeyAudit(pageOrFrame) {
  await pageOrFrame.evaluate(() => {
    window.__mochiResponsiveKeyAudit = [];
  });
}

async function readKeyAudit(pageOrFrame) {
  return pageOrFrame.evaluate(() => Array.isArray(window.__mochiResponsiveKeyAudit) ? window.__mochiResponsiveKeyAudit.slice() : []);
}

async function focusGameplayCanvas(pageOrFrame, label) {
  await pageOrFrame.locator('canvas').first().click({ timeout: timeoutMs });
  const focus = await pageOrFrame.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const active = document.activeElement;
    const rect = canvas?.getBoundingClientRect();
    return {
      activeTag: active?.tagName || null,
      activeIsCanvas: active === canvas,
      canvasTabIndex: canvas?.getAttribute('tabindex') || null,
      canvasAriaLabel: canvas?.getAttribute('aria-label') || null,
      canvasRect: rect ? {
        left: Math.round(rect.left * 100) / 100,
        top: Math.round(rect.top * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100
      } : null
    };
  });
  if (!focus.activeIsCanvas) failures.push(`${label}: gameplay canvas did not receive focus before key ownership checks.`);
  return focus;
}

async function pressKeyAndReadAudit(auditTarget, keyboardPage, key) {
  await resetKeyAudit(auditTarget);
  await keyboardPage.keyboard.press(key);
  await keyboardPage.waitForTimeout(60);
  return readKeyAudit(auditTarget);
}

function firstKeydown(audit) {
  return Array.isArray(audit) ? audit.find((event) => event.type === 'keydown') || null : null;
}

async function focusEditableInput(pageOrFrame) {
  return pageOrFrame.evaluate(() => {
    const visible = (element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };

    let input = document.querySelector('.mochi-hud__chat input');
    let source = 'chat';
    if (!input || !visible(input)) {
      input = document.querySelector('[data-responsive-input-sentinel]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('data-responsive-input-sentinel', 'true');
        input.setAttribute('aria-hidden', 'true');
        input.style.position = 'fixed';
        input.style.left = '0';
        input.style.top = '0';
        input.style.width = '1px';
        input.style.height = '1px';
        input.style.opacity = '0';
        input.style.pointerEvents = 'none';
        input.style.zIndex = '-1';
        document.body.appendChild(input);
      }
      source = 'sentinel';
    }

    input.value = '';
    input.focus({ preventScroll: true });
    return {
      source,
      chatVisible: source === 'chat',
      activeTag: document.activeElement?.tagName || null,
      focused: document.activeElement === input
    };
  });
}

async function readEditableInputValue(pageOrFrame) {
  return pageOrFrame.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return active.value;
    const input = document.querySelector('.mochi-hud__chat input, [data-responsive-input-sentinel]');
    return input instanceof HTMLInputElement ? input.value : '';
  });
}

async function parentScrollSnapshot(page) {
  return page.evaluate(() => ({
    windowX: window.scrollX,
    windowY: window.scrollY,
    documentTop: document.documentElement.scrollTop,
    bodyTop: document.body.scrollTop
  }));
}

async function frameScrollSnapshot(pageOrFrame) {
  return pageOrFrame.evaluate(() => ({
    windowX: window.scrollX,
    windowY: window.scrollY,
    documentTop: document.documentElement.scrollTop,
    bodyTop: document.body.scrollTop,
    actionsTop: document.querySelector('.mochi-hud__actions')?.scrollTop || 0,
    feedTop: document.querySelector('.mochi-hud__feed')?.scrollTop || 0,
    spiritTop: document.querySelector('.mochi-hud__spirit-card')?.scrollTop || 0
  }));
}

function assertScrollUnchanged(before, after, label) {
  for (const key of Object.keys(before)) {
    if (Math.abs(Number(before[key]) - Number(after[key])) > 1) {
      failures.push(`${label}: gameplay keys changed ${key} from ${before[key]} to ${after[key]}.`);
    }
  }
}

function assertNoHostedSmokeWithoutApproval() {
  if ((localBaseUrl && localSiteBaseUrl) || hostedAllowed) return;
  throw new Error(
    'Responsive gameplay smoke is local-only by default. Set MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE=true only after explicit hosted-preview approval.'
  );
}

function siteUrl() {
  return `${siteBaseUrl}${siteEntryPath.startsWith('/') ? siteEntryPath : `/${siteEntryPath}`}`;
}

function normalizeOptionalUrl(value) {
  if (!value) return '';
  return String(value).replace(/\/+$/, '');
}

function redactUrl(value) {
  try {
    const url = new URL(value);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return String(value).replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

async function newContext(browser, viewport) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: viewport.width <= 430,
    hasTouch: viewport.width <= 932
  });
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
        `Could not launch a browser for the responsive gameplay smoke. Install Chrome, set MOCHI_SOCIAL_BROWSER_EXECUTABLE, or run this on a machine with Playwright browsers installed. First launch error: ${detail}`
      );
    }
  }
}

function routeName(route) {
  return route.replace(/^\//, '').replace(/[^a-z0-9_-]+/gi, '-') || 'root';
}

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
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
    dirty: worktree.ok ? worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line)) : ['git status unavailable'],
    errors: [branch, localHead, upstream, worktree]
      .filter((result) => !result.ok)
      .map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function git(args) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    shell: false
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}
