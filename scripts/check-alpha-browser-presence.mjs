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
  await page.waitForTimeout(1200);
  await page.keyboard.up(key);
  await page.waitForTimeout(900);
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
  await secondTab.bringToFront();
  await secondTab.waitForTimeout(400);
  const observerPulseBefore = await readCanvasMovementPulse(secondTab);
  const observerBefore = await captureCanvasSignature(secondTab, 'second-tab-before-first-tab-move');
  await firstTab.bringToFront();
  await firstTab.waitForTimeout(400);
  const firstTabMovement = await moveCanvasAndCapture(firstTab, 'first-tab', 'ArrowLeft');
  await firstTab.evaluate(() => {
    localStorage.setItem('mochiSocial.movement.browser-smoke', JSON.stringify({
      type: 'MOCHI_SOCIAL_LOCAL_MOVEMENT',
      tabId: 'browser-smoke',
      key: 'ArrowLeft',
      at: Date.now()
    }));
  });
  await secondTab.bringToFront();
  await secondTab.waitForTimeout(2500);
  const observerAfter = await captureCanvasSignature(secondTab, 'second-tab-after-first-tab-move');
  const observerPulseAfter = await readCanvasMovementPulse(secondTab);
  const secondTabMovement = await moveCanvasAndCapture(secondTab, 'second-tab', 'ArrowDown');
  const visualHashChanged = observerBefore.sha256 !== observerAfter.sha256;
  const movementPulseChanged = observerPulseAfter !== '' && observerPulseAfter !== observerPulseBefore;

  assert(
    visualHashChanged || movementPulseChanged,
    'Second tab canvas did not change after first-tab movement, and no local movement pulse was observed.'
  );

  return {
    firstTab: firstTabMovement,
    secondTab: secondTabMovement,
    observer: {
      before: observerBefore,
      after: observerAfter,
      changedAfterFirstTabMove: true,
      visualHashChanged,
      movementPulseChanged,
      pulseBefore: observerPulseBefore,
      pulseAfter: observerPulseAfter
    }
  };
}

async function readCanvasMovementPulse(page) {
  return page.evaluate(() => document.querySelector('canvas')?.getAttribute('data-remote-movement-pulse') || '');
}

async function exerciseAlphaHud(page) {
  await page.bringToFront();
  await page.waitForTimeout(300);
  const chatMessage = `Hello from browser smoke ${Date.now().toString(36)}`;
  await page.click('[data-alpha-action="spirit.capture"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.attune"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.journal"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.expedition"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.route_invite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.technique"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.affinity_trial"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="party.set"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.care"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.train"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.spar_ladder"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.raise"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="profile.view"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="guild.buddy"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="status.set"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="spirit.inspect"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="quest.accept"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="quest.progress"]', { timeout: timeoutMs });
  await page.fill('[data-chat-input]', chatMessage, { timeout: timeoutMs });
  await page.press('[data-chat-input]', 'Enter', { timeout: timeoutMs });
  await page.click('[data-alpha-action="emote.send"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="market.fixed_list"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="trade.direct_offer"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="chain.withdraw_request"]', { timeout: timeoutMs });

  await page.waitForFunction(
    () => {
      const spirit = document.querySelector('[data-spirit-label]')?.textContent || '';
      const profile = document.querySelector('[data-profile-label]')?.textContent || '';
      const guild = document.querySelector('[data-guild-label]')?.textContent || '';
      const status = document.querySelector('[data-status-label]')?.textContent || '';
      const journal = document.querySelector('[data-journal-label]')?.textContent || '';
      const expedition = document.querySelector('[data-expedition-label]')?.textContent || '';
      const routeInvite = document.querySelector('[data-route-invite-label]')?.textContent || '';
      const technique = document.querySelector('[data-technique-label]')?.textContent || '';
      const affinity = document.querySelector('[data-affinity-label]')?.textContent || '';
      const party = document.querySelector('[data-party-label]')?.textContent || '';
      const training = document.querySelector('[data-training-label]')?.textContent || '';
      const quest = document.querySelector('[data-quest-label]')?.textContent || '';
      const market = document.querySelector('[data-market-label]')?.textContent || '';
      const feed = document.querySelector('[data-alpha-feed]')?.textContent || '';
      const state = JSON.parse(localStorage.getItem('mochiSocial.alphaState') || '{}');
      const chat = Array.isArray(state.chat) ? state.chat.join(' ') : '';
      return spirit.includes('Jintari')
        && profile.includes('Profile: reviewed')
        && guild.includes('Guild: 1 local buddy')
        && status.includes('Status: cozy')
        && journal.includes('Journal:')
        && journal.includes('1/3')
        && expedition.includes('Route:')
        && !expedition.includes('not scouted')
        && routeInvite.includes('Route Invite:')
        && routeInvite.includes('jintari')
        && technique.includes('Technique:')
        && technique.includes('XP')
        && affinity.includes('Affinity:')
        && !affinity.includes('not started')
        && party.includes('Party:')
        && !party.includes('not formed')
        && training.includes('Training:')
        && training.includes('XP')
        && training.includes('ladder')
        && quest.includes('First Lantern Vow')
        && market.includes('Canary: requested')
        && state.spiritId === 'jintari'
        && state.captureProof === true
        && state.lastCaptureSpiritId === 'jintari'
        && state.journalProof === true
        && state.journalDiscoveredCount >= 1
        && state.journalTotal === 3
        && state.lastJournalSpiritId === 'lirabao'
        && state.expeditionProof === true
        && state.lastExpeditionRouteId === 'moonbridge-bamboo-trail'
        && state.lastExpeditionEncounterId === 'jintari'
        && Array.isArray(state.discoveredRouteIds)
        && state.discoveredRouteIds.includes('moonbridge-bamboo-trail')
        && state.expeditionCount >= 1
        && state.routeInviteProof === true
        && state.lastRouteInviteRouteId === 'moonbridge-bamboo-trail'
        && state.lastRouteInviteSpiritId === 'jintari'
        && state.techniqueProof === true
        && state.techniqueMoveId === 'goldleaf-feint'
        && state.techniqueMasteryXp >= 1
        && ['novice', 'practiced', 'adept'].includes(state.techniqueMasteryLevel)
        && state.affinityProof === true
        && state.lastAffinityTrialId === 'silk-cinder-trial'
        && state.affinityAdvantage === true
        && state.affinityFocusScore >= 1
        && state.affinityTrialScore === 18
        && Array.isArray(state.attunedSpiritIds)
        && state.attunedSpiritIds.includes('lirabao')
        && state.attunedSpiritIds.includes('jintari')
        && Array.isArray(state.partyIds)
        && state.partyIds.includes('lirabao')
        && state.partyIds.includes('jintari')
        && state.sparLadderXp >= 1
        && state.lastSparOpponentId === 'jade-echo-apprentice'
        && state.trainingXp >= 1
        && state.raisingProof === true
        && state.activeQuestId === 'first-lantern-vow'
        && Array.isArray(state.completedQuestSteps)
        && state.completedQuestSteps.includes('attune-spirit')
        && state.profileViewed === true
        && state.guildBuddyProof === true
        && state.statusMood === 'cozy'
        && state.lastInspectedSpiritId === 'jintari'
        && state.charmListed === true
        && state.tradeProof === true
        && state.canaryRequested === true
        && chat.includes('Care complete')
        && chat.includes('Profile: Mochirii Wayfarer')
        && chat.includes('Guild proof')
        && chat.includes('Status set: cozy')
        && chat.includes('Inspect Jintari')
        && chat.includes('You wave')
        && chat.includes('Jade Thread Charm listed')
        && chat.includes('Direct trade proof')
        && chat.includes('Canary certificate request staged')
        && chat.includes('Lantern Harmony Invitation')
        && chat.includes('accepts the Lantern Invite')
        && chat.includes('Mochirii spirit journal')
        && chat.includes('Moonbridge Bamboo Trail')
        && chat.includes('Goldleaf Ribbon Invitation')
        && chat.includes('Mochirii Technique Dojo')
        && chat.includes('Silk Cinder Trial')
        && chat.includes('Mochirii party')
        && chat.includes('spar ladder')
        && chat.includes('guild spar')
        && chat.includes('Share mooncake')
        && chat.includes('Quest accepted: First Lantern Vow')
        && chat.includes('Quest progress: First Lantern Vow')
        && feed.includes('Canary');
    },
    undefined,
    { timeout: timeoutMs }
  );

  const snapshot = await page.evaluate(() => {
    const rawState = localStorage.getItem('mochiSocial.alphaState') || '{}';
    const state = JSON.parse(rawState);
    return {
      profile: document.querySelector('[data-profile-label]')?.textContent?.trim() || '',
      guild: document.querySelector('[data-guild-label]')?.textContent?.trim() || '',
      status: document.querySelector('[data-status-label]')?.textContent?.trim() || '',
      spirit: document.querySelector('[data-spirit-label]')?.textContent?.trim() || '',
      journal: document.querySelector('[data-journal-label]')?.textContent?.trim() || '',
      expedition: document.querySelector('[data-expedition-label]')?.textContent?.trim() || '',
      routeInvite: document.querySelector('[data-route-invite-label]')?.textContent?.trim() || '',
      technique: document.querySelector('[data-technique-label]')?.textContent?.trim() || '',
      affinity: document.querySelector('[data-affinity-label]')?.textContent?.trim() || '',
      party: document.querySelector('[data-party-label]')?.textContent?.trim() || '',
      training: document.querySelector('[data-training-label]')?.textContent?.trim() || '',
      quest: document.querySelector('[data-quest-label]')?.textContent?.trim() || '',
      market: document.querySelector('[data-market-label]')?.textContent?.trim() || '',
      feed: Array.from(document.querySelectorAll('[data-alpha-feed] li')).map((item) => item.textContent?.trim() || ''),
      state
    };
  });

  assert(snapshot.state.spiritId === 'jintari', 'HUD route invitation must select Jintari as the active spirit.');
  assert(snapshot.state.captureProof === true, 'HUD invite action must record spirit capture proof.');
  assert(snapshot.state.lastCaptureSpiritId === 'jintari', 'HUD route invitation must record Jintari as the invited spirit.');
  assert(snapshot.state.bond >= 1, 'HUD care action must increase spirit bond.');
  assert(Array.isArray(snapshot.state.attunedSpiritIds) && snapshot.state.attunedSpiritIds.includes('lirabao'), 'HUD attune action must add Lirabao to the local spirit roster.');
  assert(Array.isArray(snapshot.state.attunedSpiritIds) && snapshot.state.attunedSpiritIds.includes('jintari'), 'HUD route invitation must add Jintari to the local spirit roster.');
  assert(snapshot.journal.includes('Journal:'), 'HUD journal label must show collection state.');
  assert(snapshot.state.journalProof === true, 'HUD journal action must record journal proof.');
  assert(snapshot.state.journalDiscoveredCount >= 1, 'HUD journal action must record at least one discovered spirit.');
  assert(snapshot.state.lastJournalSpiritId === 'lirabao', 'HUD journal action must record the active journal spirit.');
  assert(snapshot.expedition.includes('Route:'), 'HUD expedition label must show route state.');
  assert(snapshot.state.expeditionProof === true, 'HUD expedition action must record field route proof.');
  assert(snapshot.state.lastExpeditionRouteId === 'moonbridge-bamboo-trail', 'HUD expedition action must record the Moonbridge route.');
  assert(snapshot.state.lastExpeditionEncounterId === 'jintari', 'HUD expedition action must record Jintari route signs.');
  assert(Array.isArray(snapshot.state.discoveredRouteIds) && snapshot.state.discoveredRouteIds.includes('moonbridge-bamboo-trail'), 'HUD expedition action must record discovered route ids.');
  assert(snapshot.state.expeditionCount >= 1, 'HUD expedition action must increment expedition count.');
  assert(snapshot.routeInvite.includes('Route Invite:'), 'HUD route invitation label must show route invitation state.');
  assert(snapshot.state.routeInviteProof === true, 'HUD route invitation action must record route invitation proof.');
  assert(snapshot.state.lastRouteInviteRouteId === 'moonbridge-bamboo-trail', 'HUD route invitation must record the Moonbridge route.');
  assert(snapshot.state.lastRouteInviteSpiritId === 'jintari', 'HUD route invitation must record Jintari as the route spirit.');
  assert(snapshot.technique.includes('Technique:'), 'HUD technique label must show mastery state.');
  assert(snapshot.state.techniqueProof === true, 'HUD technique action must record technique proof.');
  assert(snapshot.state.techniqueMoveId === 'goldleaf-feint', 'HUD technique action must record the practiced route-spirit move.');
  assert(snapshot.state.techniqueMasteryXp >= 1, 'HUD technique action must record mastery XP.');
  assert(snapshot.affinity.includes('Affinity:'), 'HUD affinity label must show trial state.');
  assert(snapshot.state.affinityProof === true, 'HUD affinity action must record affinity trial proof.');
  assert(snapshot.state.lastAffinityTrialId === 'silk-cinder-trial', 'HUD affinity action must record the Silk Cinder trial.');
  assert(snapshot.state.affinityAdvantage === true, 'HUD affinity action must record move affinity advantage.');
  assert(snapshot.state.affinityFocusScore >= 1, 'HUD affinity action must record a focus score.');
  assert(snapshot.state.affinityTrialScore === 18, 'HUD affinity action must record the Silk Cinder trial score.');
  assert(snapshot.party.includes('Party:'), 'HUD party label must show party state.');
  assert(Array.isArray(snapshot.state.partyIds) && snapshot.state.partyIds.includes('jintari') && snapshot.state.partyIds.includes('lirabao'), 'HUD party action must form a Mochi Spirit party with Jintari and Lirabao.');
  assert(snapshot.training.includes('Training:'), 'HUD training label must show training state.');
  assert(snapshot.state.trainingXp >= 1, 'HUD training action must record training XP.');
  assert(snapshot.state.sparLadderXp >= 1, 'HUD spar ladder action must record ladder XP.');
  assert(snapshot.state.lastSparOpponentId === 'jade-echo-apprentice', 'HUD spar ladder action must record the first spar opponent.');
  assert(snapshot.state.raisingProof === true, 'HUD raising action must record raising proof.');
  assert(snapshot.quest.includes('First Lantern Vow'), 'HUD quest label must show the active quest.');
  assert(snapshot.state.activeQuestId === 'first-lantern-vow', 'HUD quest action must record the first quest.');
  assert(Array.isArray(snapshot.state.completedQuestSteps) && snapshot.state.completedQuestSteps.includes('attune-spirit'), 'HUD quest progress must record a completed quest step.');
  assert(snapshot.profile.includes('Profile: reviewed'), 'HUD profile label must show a viewed profile state.');
  assert(snapshot.state.profileViewed === true, 'HUD profile action must record local profile proof.');
  assert(snapshot.guild.includes('Guild: 1 local buddy'), 'HUD guild label must show a local guild buddy proof.');
  assert(snapshot.state.guildBuddyProof === true, 'HUD guild action must record local social proof.');
  assert(snapshot.status.includes('Status: cozy'), 'HUD status label must show the local mood/status proof.');
  assert(snapshot.state.statusMood === 'cozy', 'HUD status action must record local social status proof.');
  assert(snapshot.state.lastInspectedSpiritId === 'jintari', 'HUD inspect action must record a Jintari spirit inspection proof.');
  assert(snapshot.state.charmListed === true, 'HUD market action must mark a fixed listing proof.');
  assert(snapshot.state.tradeProof === true, 'HUD trade action must mark a direct trade proof.');
  assert(snapshot.state.canaryRequested === true, 'HUD Canary action must stage a certificate request.');
  const chat = Array.isArray(snapshot.state.chat) ? snapshot.state.chat : [];
  assert(chat.some((line) => String(line).includes('Lantern Harmony Invitation')), 'HUD chat state must record the spirit invitation action.');
  assert(chat.some((line) => String(line).includes('accepts the Lantern Invite')), 'HUD chat state must record the attunement action.');
  assert(chat.some((line) => String(line).includes('Mochirii spirit journal')), 'HUD chat state must record the spirit journal action.');
  assert(chat.some((line) => String(line).includes('Moonbridge Bamboo Trail')), 'HUD chat state must record the field expedition action.');
  assert(chat.some((line) => String(line).includes('Goldleaf Ribbon Invitation')), 'HUD chat state must record the route invitation action.');
  assert(chat.some((line) => String(line).includes('Mochirii Technique Dojo')), 'HUD chat state must record the spirit technique action.');
  assert(chat.some((line) => String(line).includes('Silk Cinder Trial')), 'HUD chat state must record the affinity trial action.');
  assert(chat.some((line) => String(line).includes('Mochirii party')), 'HUD chat state must record the party formation action.');
  assert(chat.some((line) => String(line).includes('Care complete')), 'HUD chat state must record the care action.');
  assert(chat.some((line) => String(line).includes('guild spar')), 'HUD chat state must record the training battle action.');
  assert(chat.some((line) => String(line).includes('spar ladder')), 'HUD chat state must record the spar ladder action.');
  assert(chat.some((line) => String(line).includes('Share mooncake')), 'HUD chat state must record the raising action.');
  assert(chat.some((line) => String(line).includes('Quest accepted: First Lantern Vow')), 'HUD chat state must record the quest accept action.');
  assert(chat.some((line) => String(line).includes('Quest progress: First Lantern Vow')), 'HUD chat state must record the quest progress action.');
  assert(chat.some((line) => String(line).includes('Profile: Mochirii Wayfarer')), 'HUD chat state must record the profile action.');
  assert(chat.some((line) => String(line).includes('Guild proof')), 'HUD chat state must record the guild action.');
  assert(chat.some((line) => String(line).includes('Status set: cozy')), 'HUD chat state must record the status action.');
  assert(chat.some((line) => String(line).includes('Inspect Jintari')), 'HUD chat state must record the spirit inspect action.');
  assert(chat.some((line) => String(line).includes('You wave')), 'HUD chat state must record the emote action.');
  assert(chat.some((line) => String(line).includes('Jade Thread Charm listed')), 'HUD chat state must record the fixed-list action.');
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
