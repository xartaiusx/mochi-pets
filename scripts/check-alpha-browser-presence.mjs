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

async function verifyCanvasMovement(firstTab, secondTab) {
  await secondTab.bringToFront();
  await secondTab.waitForTimeout(400);
  const observerPulseBefore = await readCanvasMovementPulse(secondTab);
  const observerBefore = await captureCanvasSignature(secondTab, 'second-tab-before-first-tab-move');
  await firstTab.bringToFront();
  await firstTab.waitForTimeout(400);
  const firstTabMovement = await moveCanvasAndCapture(firstTab, 'first-tab', 'ArrowLeft');
  await writeLocalMovementPulse(firstTab, 1);

  let observerAfter = observerBefore;
  let observerPulseAfter = observerPulseBefore;
  let observerAttempts = 0;
  let visualHashChanged = false;
  let movementPulseChanged = false;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (attempt > 1) {
      await firstTab.bringToFront();
      await writeLocalMovementPulse(firstTab, attempt);
    }

    await secondTab.bringToFront();
    await secondTab.waitForTimeout(1800 + attempt * 700);
    observerAfter = await captureCanvasSignature(
      secondTab,
      attempt === 1 ? 'second-tab-after-first-tab-move' : `second-tab-after-first-tab-move-retry-${attempt}`
    );
    observerPulseAfter = await readCanvasMovementPulse(secondTab);
    observerAttempts = attempt;
    visualHashChanged = observerBefore.sha256 !== observerAfter.sha256;
    movementPulseChanged = observerPulseAfter !== '' && observerPulseAfter !== observerPulseBefore;

    if (visualHashChanged || movementPulseChanged) {
      break;
    }
  }

  const secondTabMovement = await moveCanvasAndCapture(secondTab, 'second-tab', 'ArrowDown');

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
      attempts: observerAttempts,
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
  await page.click('[data-alpha-action="battle.tactic_scroll"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.affinity_trial"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="party.set"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.care"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.train"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.spar_ladder"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.raise"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="profile.view"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="guild.buddy"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="status.set"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.starter_vow"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="spirit.inspect"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="quest.accept"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="quest.progress"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.rank_trial"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.growth_rite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.expedition"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.route_invite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.journal"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.habitat_bond"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.research"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="party.set"]', { timeout: timeoutMs });
  await page.click('[data-alpha-local-action="spirit.inspect"]', { timeout: timeoutMs });
  for (let step = 0; step < 8; step += 1) {
    await page.click('[data-alpha-action="quest.progress"]', { timeout: timeoutMs });
  }
  await page.click('[data-alpha-action="world.route_mastery"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.compendium_complete"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.technique_loadout"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.technique_codex"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="party.harmony_form"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.harmony_trial"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.team_spar_match"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.mentor_challenge"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.route_patrol"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.trait_attune"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.condition_weave"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.affinity_matrix"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.sanctuary_rite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.roster_archive"]', { timeout: timeoutMs });
  await page.fill('[data-chat-input]', chatMessage, { timeout: timeoutMs });
  await page.press('[data-chat-input]', 'Enter', { timeout: timeoutMs });
  await page.click('[data-alpha-action="emote.send"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="market.fixed_list"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="market.guild_receipt"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="trade.direct_offer"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.provision_satchel"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.care_cycle"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.temperament_concord"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.field_almanac"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.route_ecology"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.weather_veil"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.craft_writ"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="trade.exchange_accord"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.relic_attune"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.route_waystone"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.nurture_rite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.recovery_tea"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.kinship_album"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.nursery_grove"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.bloom_ascendance"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.capture_rite"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.lineage_register"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.roster_cabinet"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.blossom_cradle"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.encounter_rotation"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.encounter_atlas"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.habitat_census"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="world.route_charter"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.provision_catalog"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.battle_kit"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.remedy_pouch"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.dojo_ladder"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.tournament_bracket"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.rival_circle"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.sifu_council"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.summit_circuit"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.commission_complete"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.social_rally"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="quest.ledger_record"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="story.chapter_complete"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.insignia_case"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="chain.withdraw_request"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="chain.deposit_request"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.wayfarer_chronicle"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="guild.ascension_trial"]', { timeout: timeoutMs });
  await page.click('[data-roster-focus="lirabao"]', { timeout: timeoutMs });
  await page.waitForFunction(
    () => JSON.parse(localStorage.getItem('mochiSocial.alphaState') || '{}').spiritId === 'lirabao',
    { timeout: timeoutMs }
  );
  await page.click('[data-roster-focus="aozhen"]', { timeout: timeoutMs });

  try {
    await page.waitForFunction(
      () => {
      const spirit = document.querySelector('[data-spirit-label]')?.textContent || '';
      const profile = document.querySelector('[data-profile-label]')?.textContent || '';
      const guild = document.querySelector('[data-guild-label]')?.textContent || '';
      const rank = document.querySelector('[data-rank-label]')?.textContent || '';
      const status = document.querySelector('[data-status-label]')?.textContent || '';
      const journal = document.querySelector('[data-journal-label]')?.textContent || '';
      const expedition = document.querySelector('[data-expedition-label]')?.textContent || '';
      const routeInvite = document.querySelector('[data-route-invite-label]')?.textContent || '';
      const fieldAccord = document.querySelector('[data-field-accord-label]')?.textContent || '';
      const routeMastery = document.querySelector('[data-route-mastery-label]')?.textContent || '';
      const routePatrol = document.querySelector('[data-route-patrol-label]')?.textContent || '';
      const habitatBond = document.querySelector('[data-habitat-bond-label]')?.textContent || '';
      const sanctuary = document.querySelector('[data-sanctuary-label]')?.textContent || '';
      const research = document.querySelector('[data-research-label]')?.textContent || '';
      const compendium = document.querySelector('[data-compendium-label]')?.textContent || '';
      const archive = document.querySelector('[data-archive-label]')?.textContent || '';
      const rosterCabinet = document.querySelector('[data-roster-cabinet-label]')?.textContent || '';
      const blossomCradle = document.querySelector('[data-blossom-cradle-label]')?.textContent || '';
      const provision = document.querySelector('[data-provision-label]')?.textContent || '';
      const provisionCatalog = document.querySelector('[data-provision-catalog-label]')?.textContent || '';
      const battleKit = document.querySelector('[data-battle-kit-label]')?.textContent || '';
      const remedyPouch = document.querySelector('[data-remedy-pouch-label]')?.textContent || '';
      const careCycle = document.querySelector('[data-care-cycle-label]')?.textContent || '';
      const temperament = document.querySelector('[data-temperament-label]')?.textContent || '';
      const fieldAlmanac = document.querySelector('[data-field-almanac-label]')?.textContent || '';
      const routeEcology = document.querySelector('[data-route-ecology-label]')?.textContent || '';
      const weatherVeil = document.querySelector('[data-weather-veil-label]')?.textContent || '';
      const encounterRotation = document.querySelector('[data-encounter-rotation-label]')?.textContent || '';
      const encounterAtlas = document.querySelector('[data-encounter-atlas-label]')?.textContent || '';
      const habitatCensus = document.querySelector('[data-habitat-census-label]')?.textContent || '';
      const craftWrit = document.querySelector('[data-craft-writ-label]')?.textContent || '';
      const exchangeAccord = document.querySelector('[data-exchange-accord-label]')?.textContent || '';
      const routeWaystone = document.querySelector('[data-route-waystone-label]')?.textContent || '';
      const routeCharter = document.querySelector('[data-route-charter-label]')?.textContent || '';
      const nurtureRite = document.querySelector('[data-nurture-rite-label]')?.textContent || '';
      const recoveryTea = document.querySelector('[data-recovery-tea-label]')?.textContent || '';
      const kinship = document.querySelector('[data-kinship-album-label]')?.textContent || '';
      const nursery = document.querySelector('[data-nursery-grove-label]')?.textContent || '';
      const bloomAscendance = document.querySelector('[data-bloom-ascendance-label]')?.textContent || '';
      const captureRite = document.querySelector('[data-capture-rite-label]')?.textContent || '';
      const lineageRegister = document.querySelector('[data-lineage-register-label]')?.textContent || '';
      const dojoLadder = document.querySelector('[data-dojo-ladder-label]')?.textContent || '';
      const tournament = document.querySelector('[data-tournament-label]')?.textContent || '';
      const rivalCircle = document.querySelector('[data-rival-circle-label]')?.textContent || '';
      const sifuCouncil = document.querySelector('[data-sifu-council-label]')?.textContent || '';
      const summitCircuit = document.querySelector('[data-summit-circuit-label]')?.textContent || '';
      const commission = document.querySelector('[data-commission-label]')?.textContent || '';
      const rally = document.querySelector('[data-rally-label]')?.textContent || '';
      const questLedger = document.querySelector('[data-quest-ledger-label]')?.textContent || '';
      const story = document.querySelector('[data-story-label]')?.textContent || '';
      const insignia = document.querySelector('[data-insignia-label]')?.textContent || '';
      const chronicle = document.querySelector('[data-chronicle-label]')?.textContent || '';
      const ascension = document.querySelector('[data-ascension-label]')?.textContent || '';
      const starterVow = document.querySelector('[data-starter-vow-label]')?.textContent || '';
      const technique = document.querySelector('[data-technique-label]')?.textContent || '';
      const tactic = document.querySelector('[data-tactic-label]')?.textContent || '';
      const loadout = document.querySelector('[data-loadout-label]')?.textContent || '';
      const techniqueCodex = document.querySelector('[data-technique-codex-label]')?.textContent || '';
      const trait = document.querySelector('[data-trait-label]')?.textContent || '';
      const condition = document.querySelector('[data-condition-label]')?.textContent || '';
      const affinityMatrix = document.querySelector('[data-affinity-matrix-label]')?.textContent || '';
      const relicAttunement = document.querySelector('[data-relic-attunement-label]')?.textContent || '';
      const affinity = document.querySelector('[data-affinity-label]')?.textContent || '';
      const party = document.querySelector('[data-party-label]')?.textContent || '';
      const harmony = document.querySelector('[data-harmony-label]')?.textContent || '';
      const concord = document.querySelector('[data-harmony-trial-label]')?.textContent || '';
      const teamMatch = document.querySelector('[data-team-match-label]')?.textContent || '';
      const mentor = document.querySelector('[data-mentor-label]')?.textContent || '';
      const training = document.querySelector('[data-training-label]')?.textContent || '';
      const battleRound = document.querySelector('[data-battle-round-label]')?.textContent || '';
      const growth = document.querySelector('[data-growth-label]')?.textContent || '';
      const quest = document.querySelector('[data-quest-label]')?.textContent || '';
      const market = document.querySelector('[data-market-label]')?.textContent || '';
      const rosterPanel = document.querySelector('[data-roster-panel]')?.textContent || '';
      const feed = document.querySelector('[data-alpha-feed]')?.textContent || '';
      const state = JSON.parse(localStorage.getItem('mochiSocial.alphaState') || '{}');
      const chat = Array.isArray(state.chat) ? state.chat.join(' ') : '';
      return spirit.includes('Aozhen')
        && profile.includes('Profile: reviewed')
        && guild.includes('Guild: 1 local buddy')
        && rank.includes('Jade Court Initiate')
        && status.includes('Status: cozy')
        && journal.includes('Journal:')
        && journal.includes('3/3')
        && expedition.includes('Route:')
        && !expedition.includes('not scouted')
        && routeInvite.includes('Route Invite:')
        && routeInvite.includes('aozhen')
        && fieldAccord.includes('Cloudbell Skyvow Accord')
        && routeMastery.includes('Jade Cloudbell Circuit')
        && routePatrol.includes('Jade Cloudbell Patrol')
        && habitatBond.includes('Jade Court Habitat Bond')
        && sanctuary.includes('Jade Court Sanctuary Rite')
        && research.includes('Jade Court Research Folio')
        && compendium.includes('Jade Court Spirit Compendium')
        && archive.includes('Jade Court Roster Archive')
        && rosterCabinet.includes('Jade Roster Cabinet')
        && blossomCradle.includes('Jade Blossom Cradle')
        && provision.includes('Jade Court Provision Satchel')
        && provisionCatalog.includes('Jade Provision Catalog')
        && battleKit.includes('Jade Battle Kit')
        && remedyPouch.includes('Jade Remedy Pouch')
        && careCycle.includes('Jade Court Care Cycle')
        && temperament.includes('Jade Temperament Concord')
        && fieldAlmanac.includes('Jade Field Almanac')
        && routeEcology.includes('Jade Route Ecology Survey')
      && weatherVeil.includes('Jade Weather Veil')
      && encounterRotation.includes('Jade Encounter Rotation')
      && encounterAtlas.includes('Jade Encounter Atlas')
      && habitatCensus.includes('Jade Habitat Census')
      && craftWrit.includes('Jade Court Craft Writ')
        && exchangeAccord.includes('Jade Exchange Accord')
        && routeWaystone.includes('Jade Cloudbell Waystone')
        && routeCharter.includes('Jade Route Charter')
        && nurtureRite.includes('Jade Moonwell Nurture Rite')
        && recoveryTea.includes('Jade Teahouse Recovery')
        && kinship.includes('Jade Kinship Album')
        && nursery.includes('Jade Nursery Grove')
        && bloomAscendance.includes('Jade Bloom Ascendance')
        && captureRite.includes('Jade Capture Rite')
        && lineageRegister.includes('Jade Lineage Register')
        && dojoLadder.includes('Jade Dojo Ladder')
        && tournament.includes('Jade Banner Tournament')
        && rivalCircle.includes('Jade Rival Circle')
        && sifuCouncil.includes('Jade Sifu Council')
        && summitCircuit.includes('Jade Summit Circuit')
        && commission.includes('Jade Court Commission Ledger')
        && rally.includes('Jade Courtyard Rally')
        && questLedger.includes('Jade Quest Ledger')
        && story.includes('Jade Scroll Story Chapter')
        && insignia.includes('Jade Insignia Case')
        && chronicle.includes('Jade Wayfarer Chronicle')
        && ascension.includes('Jade Court Ascension Trial')
        && starterVow.includes('Jade Starter Vow')
        && technique.includes('Technique:')
        && technique.includes('XP')
        && tactic.includes('Tactic:')
        && tactic.includes('goldleaf-opening')
        && loadout.includes('Jade Step Loadout')
        && techniqueCodex.includes('Jade Technique Codex')
        && trait.includes('Skybell Wayfinder')
        && condition.includes('Jade Mirror Condition Weave')
        && relicAttunement.includes('Jade Relic Attunement')
        && affinity.includes('Affinity:')
        && !affinity.includes('not started')
        && party.includes('Party:')
        && !party.includes('not formed')
        && harmony.includes('Triune Jade Harmony')
        && concord.includes('Jade Echo Concord Trial')
        && teamMatch.includes('Jade Mirror Team Match')
        && mentor.includes('Silk Banner Mentor Drill')
        && training.includes('Training:')
        && training.includes('XP')
        && training.includes('ladder')
        && typeof state.raisingMilestoneLabel === 'string'
        && state.raisingMilestoneLabel.length > 4
        && training.includes(state.raisingMilestoneLabel)
        && battleRound.includes('Battle Round:')
        && battleRound.includes('Jade Echo Apprentice')
        && !battleRound.includes('pending')
        && growth.includes('Moonwell Bloom Form')
        && quest.includes('Quest Chain')
        && market.includes('Canary: request + return staged')
        && rosterPanel.includes('Lirabao')
        && rosterPanel.includes('Jintari')
        && rosterPanel.includes('Aozhen')
        && rosterPanel.includes('active glow bond 5/5')
        && rosterPanel.includes('Skybell Vow Invitation')
        && rosterPanel.includes('Skybell Guard')
        && rosterPanel.includes('Tea ribbon care')
        && rosterPanel.includes('Jade brush grooming')
        && rosterPanel.includes('Canary eligible, no real value')
        && state.spiritId === 'aozhen'
        && state.lastFocusedSpiritId === 'aozhen'
        && Array.isArray(state.focusedSpiritHistory)
        && state.focusedSpiritHistory.includes('lirabao')
        && state.focusedSpiritHistory.includes('aozhen')
        && state.bondBySpiritId?.lirabao >= 1
        && state.bondBySpiritId?.jintari >= 1
        && state.bondBySpiritId?.aozhen >= 5
        && state.growthBySpiritId?.lirabao === 'glow'
        && state.growthBySpiritId?.aozhen === 'glow'
        && state.captureProof === true
        && state.lastCaptureSpiritId === 'aozhen'
        && state.journalProof === true
        && state.journalDiscoveredCount === 3
        && state.journalTotal === 3
        && state.lastJournalSpiritId === 'aozhen'
        && state.expeditionProof === true
        && state.lastExpeditionRouteId === 'cloudbell-reed-bank'
        && state.lastExpeditionEncounterId === 'aozhen'
        && Array.isArray(state.discoveredRouteIds)
        && state.discoveredRouteIds.includes('moonbridge-bamboo-trail')
        && state.discoveredRouteIds.includes('cloudbell-reed-bank')
        && state.expeditionCount >= 2
        && state.routeInviteProof === true
        && state.lastRouteInviteRouteId === 'cloudbell-reed-bank'
        && state.lastRouteInviteSpiritId === 'aozhen'
        && Array.isArray(state.routeInvitedSpiritIds)
        && state.routeInvitedSpiritIds.includes('jintari')
        && state.routeInvitedSpiritIds.includes('aozhen')
        && state.fieldAccordProof === true
        && state.fieldAccordId === 'cloudbell-skyvow-accord'
        && state.fieldAccordName === 'Cloudbell Skyvow Accord'
        && state.fieldAccordScore >= 12
        && state.fieldAccordRequiredScore === 12
        && state.lastFieldAccordRouteId === 'cloudbell-reed-bank'
        && state.lastFieldAccordSpiritId === 'aozhen'
        && state.fieldAccordTalismanClaimed === true
        && state.routeMasteryProof === true
        && state.routeMasteryId === 'jade-cloudbell-circuit'
        && state.routeMasteryTitle === 'Jade Cloudbell Circuit'
        && state.routeMasteryScore >= 21
        && state.routeMasteryKnotClaimed === true
        && routePatrol.includes('Jade Cloudbell Patrol')
        && state.routePatrolProof === true
        && state.routePatrolId === 'jade-cloudbell-patrol'
        && state.routePatrolName === 'Jade Cloudbell Patrol'
        && state.routePatrolScore >= 24
        && state.routePatrolRequiredScore === 24
        && state.routePatrolPennantClaimed === true
        && state.habitatBondProof === true
        && state.habitatBondId === 'jade-court-habitat-bond'
        && state.habitatBondName === 'Jade Court Habitat Bond'
        && state.habitatBondScore >= 15
        && state.habitatTasselClaimed === true
        && state.sanctuaryRiteProof === true
        && state.sanctuaryRiteId === 'jade-court-sanctuary-rite'
        && state.sanctuaryRiteName === 'Jade Court Sanctuary Rite'
        && state.sanctuaryRiteScore >= 24
        && state.sanctuaryRiteRequiredScore === 24
        && state.sanctuaryBellClaimed === true
        && state.researchProof === true
        && state.researchFolioId === 'jade-court-research-folio'
        && state.researchFolioName === 'Jade Court Research Folio'
        && state.researchScore >= 18
        && state.researchFolioClaimed === true
        && state.compendiumProof === true
        && state.compendiumId === 'jade-court-spirit-compendium'
        && state.compendiumName === 'Jade Court Spirit Compendium'
        && state.compendiumScore >= 25
        && state.compendiumSealClaimed === true
        && state.rosterArchiveProof === true
        && state.rosterArchiveId === 'jade-court-roster-archive'
        && state.rosterArchiveName === 'Jade Court Roster Archive'
        && state.rosterArchiveScore >= 22
        && state.rosterArchiveRequiredScore === 22
        && Array.isArray(state.rosterArchivePartyIds)
        && state.rosterArchivePartyIds.length === 2
        && Array.isArray(state.rosterArchiveReserveIds)
        && state.rosterArchiveReserveIds.length >= 1
        && state.rosterArchiveSealClaimed === true
        && state.rosterCabinetProof === true
        && state.rosterCabinetId === 'jade-roster-cabinet'
        && state.rosterCabinetName === 'Jade Roster Cabinet'
        && state.rosterCabinetScore >= 30
        && state.rosterCabinetRequiredScore === 30
        && Array.isArray(state.rosterCabinetSpiritIds)
        && state.rosterCabinetSpiritIds.length === 3
        && Array.isArray(state.rosterCabinetPartyIds)
        && state.rosterCabinetPartyIds.length === 3
        && Array.isArray(state.rosterCabinetSlotLabels)
        && state.rosterCabinetSlotLabels.length === 3
        && state.rosterCabinetTagClaimed === true
        && state.blossomCradleProof === true
        && state.blossomCradleId === 'jade-blossom-cradle'
        && state.blossomCradleName === 'Jade Blossom Cradle'
        && state.blossomCradleScore >= 48
        && state.blossomCradleRequiredScore === 48
        && Array.isArray(state.blossomCradleSpiritIds)
        && state.blossomCradleSpiritIds.length === 3
        && Array.isArray(state.blossomCradlePartyIds)
        && state.blossomCradlePartyIds.length === 3
        && Array.isArray(state.blossomCradleCareIds)
        && state.blossomCradleCareIds.length === 3
        && Array.isArray(state.blossomCradleMilestoneLabels)
        && state.blossomCradleMilestoneLabels.length === 3
        && state.blossomCradleTotalBond >= 15
        && state.blossomCradleRibbonClaimed === true
        && state.provisionProof === true
        && state.provisionSatchelId === 'jade-court-provision-satchel'
        && state.provisionSatchelName === 'Jade Court Provision Satchel'
        && state.provisionScore >= 27
        && Array.isArray(state.provisionStockItemIds)
        && state.provisionStockItemIds.includes('jade-thread-charm')
        && state.provisionStockItemIds.includes('lantern-harmony-tea')
        && state.provisionStockItemIds.includes('jade-mooncake-box')
        && state.provisionSatchelClaimed === true
        && state.provisionCatalogProof === true
        && state.provisionCatalogId === 'jade-provision-catalog'
        && state.provisionCatalogName === 'Jade Provision Catalog'
        && state.provisionCatalogScore >= 50
        && state.provisionCatalogRequiredScore === 50
        && Array.isArray(state.provisionCatalogItemIds)
        && state.provisionCatalogItemIds.includes('jade-thread-charm')
        && state.provisionCatalogItemIds.includes('lantern-harmony-tea')
        && state.provisionCatalogItemIds.includes('jade-mooncake-box')
        && Array.isArray(state.provisionCatalogCareItemIds)
        && state.provisionCatalogCareItemIds.includes('jade-mooncake-box')
        && state.provisionCatalogCareItemIds.includes('lantern-harmony-tea')
        && Array.isArray(state.provisionCatalogRouteItemIds)
        && state.provisionCatalogRouteItemIds.includes('lantern-harmony-tea')
        && state.provisionCatalogRouteItemIds.includes('jade-thread-charm')
        && state.provisionCatalogPresenceCount >= 2
        && state.provisionCatalogSealClaimed === true
        && state.battleKitProof === true
        && state.battleKitId === 'jade-battle-kit'
        && state.battleKitName === 'Jade Battle Kit'
        && state.battleKitScore >= 48
        && state.battleKitRequiredScore === 48
        && Array.isArray(state.battleKitItemIds)
        && state.battleKitItemIds.includes('lantern-harmony-tea')
        && state.battleKitItemIds.includes('jade-thread-charm')
        && state.battleKitItemIds.includes('jade-mooncake-box')
        && Array.isArray(state.battleKitPartyIds)
        && state.battleKitPartyIds.length === 3
        && state.battleKitPresenceCount >= 2
        && state.battleKitTagClaimed === true
        && state.remedyPouchProof === true
        && state.remedyPouchId === 'jade-remedy-pouch'
        && state.remedyPouchName === 'Jade Remedy Pouch'
        && state.remedyPouchScore >= 50
        && state.remedyPouchRequiredScore === 50
        && Array.isArray(state.remedyPouchItemIds)
        && state.remedyPouchItemIds.includes('lantern-harmony-tea')
        && state.remedyPouchItemIds.includes('jade-thread-charm')
        && state.remedyPouchItemIds.includes('jade-mooncake-box')
        && Array.isArray(state.remedyPouchConditionIds)
        && state.remedyPouchConditionIds.includes('lantern-ward')
        && state.remedyPouchConditionIds.includes('goldleaf-tempo')
        && state.remedyPouchConditionIds.includes('skybell-guard')
        && Array.isArray(state.remedyPouchPartyIds)
        && state.remedyPouchPartyIds.length === 3
        && state.remedyPouchPresenceCount >= 2
        && state.remedyPouchTagClaimed === true
        && state.careCycleProof === true
        && state.careCycleId === 'jade-court-care-cycle'
        && state.careCycleName === 'Jade Court Care Cycle'
        && state.careCycleScore >= 32
        && state.careCycleRequiredScore === 32
        && Array.isArray(state.careCycleCaredSpiritIds)
        && state.careCycleCaredSpiritIds.length === 3
        && state.careCycleTotalBond >= 9
        && state.careCycleKnotClaimed === true
        && state.temperamentConcordProof === true
        && state.temperamentConcordId === 'jade-temperament-concord'
        && state.temperamentConcordName === 'Jade Temperament Concord'
        && state.temperamentConcordScore >= 36
        && state.temperamentConcordRequiredScore === 36
        && Array.isArray(state.temperamentConcordLabels)
        && state.temperamentConcordLabels.includes('gentle')
        && state.temperamentConcordLabels.includes('bright')
        && state.temperamentConcordLabels.includes('curious')
        && state.temperamentConcordTotalBond >= 9
        && state.temperamentCharmClaimed === true
        && state.fieldAlmanacProof === true
        && state.fieldAlmanacId === 'jade-field-almanac'
        && state.fieldAlmanacName === 'Jade Field Almanac'
        && state.fieldAlmanacScore >= 38
        && state.fieldAlmanacRequiredScore === 38
        && Array.isArray(state.fieldAlmanacRouteIds)
        && state.fieldAlmanacRouteIds.includes('moonbridge-bamboo-trail')
        && state.fieldAlmanacRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.fieldAlmanacSpeciesIds)
        && state.fieldAlmanacSpeciesIds.includes('lirabao')
        && state.fieldAlmanacSpeciesIds.includes('jintari')
        && state.fieldAlmanacSpeciesIds.includes('aozhen')
        && state.fieldAlmanacClaspClaimed === true
        && state.routeEcologyProof === true
        && state.routeEcologyId === 'jade-route-ecology-survey'
        && state.routeEcologyName === 'Jade Route Ecology Survey'
        && state.routeEcologyScore >= 42
        && state.routeEcologyRequiredScore === 42
        && Array.isArray(state.routeEcologyRouteIds)
        && state.routeEcologyRouteIds.includes('moonbridge-bamboo-trail')
        && state.routeEcologyRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.routeEcologySpeciesIds)
        && state.routeEcologySpeciesIds.includes('lirabao')
        && state.routeEcologySpeciesIds.includes('jintari')
        && state.routeEcologySpeciesIds.includes('aozhen')
        && Array.isArray(state.routeEcologyInvitedSpiritIds)
        && state.routeEcologyInvitedSpiritIds.includes('jintari')
        && state.routeEcologyInvitedSpiritIds.includes('aozhen')
        && state.routeEcologyMapClaimed === true
        && state.weatherVeilProof === true
        && state.weatherVeilId === 'jade-weather-veil'
        && state.weatherVeilName === 'Jade Weather Veil'
        && state.weatherVeilScore >= 36
        && state.weatherVeilRequiredScore === 36
        && Array.isArray(state.weatherVeilRouteIds)
        && state.weatherVeilRouteIds.includes('moonbridge-bamboo-trail')
        && state.weatherVeilRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.weatherVeilConditionIds)
        && state.weatherVeilConditionIds.includes('moonlit-mist')
        && state.weatherVeilConditionIds.includes('goldleaf-rain')
        && state.weatherVeilConditionIds.includes('skybell-crosswind')
        && Array.isArray(state.weatherVeilWindows)
        && state.weatherVeilWindows.length >= 2
        && state.weatherVeilChartClaimed === true
        && state.encounterRotationProof === true
        && state.encounterRotationId === 'jade-encounter-rotation'
        && state.encounterRotationName === 'Jade Encounter Rotation'
        && state.encounterRotationScore >= 45
        && state.encounterRotationRequiredScore === 45
        && Array.isArray(state.encounterRotationRouteIds)
        && state.encounterRotationRouteIds.includes('moonbridge-bamboo-trail')
        && state.encounterRotationRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.encounterRotationSpiritIds)
        && state.encounterRotationSpiritIds.includes('lirabao')
        && state.encounterRotationSpiritIds.includes('jintari')
        && state.encounterRotationSpiritIds.includes('aozhen')
        && Array.isArray(state.encounterRotationLureItemIds)
        && state.encounterRotationLureItemIds.includes('lantern-harmony-tea')
        && state.encounterRotationLureItemIds.includes('jade-thread-charm')
        && Array.isArray(state.encounterRotationWindows)
        && state.encounterRotationWindows.length >= 2
        && state.encounterRotationScrollClaimed === true
        && state.craftWritProof === true
        && state.craftWritId === 'jade-court-craft-writ'
        && state.craftWritName === 'Jade Court Craft Writ'
        && state.craftWritScore >= 44
        && state.craftWritRequiredScore === 44
        && Array.isArray(state.craftWritRecipeIds)
        && state.craftWritRecipeIds.includes('lantern-tea-threading')
        && state.craftWritRecipeIds.includes('moonbridge-provision-wrap')
        && Array.isArray(state.craftWritStockItemIds)
        && state.craftWritStockItemIds.includes('jade-thread-charm')
        && state.craftWritStockItemIds.includes('lantern-harmony-tea')
        && state.craftWritStockItemIds.includes('jade-mooncake-box')
        && state.craftWritClaimed === true
        && state.exchangeAccordProof === true
        && state.exchangeAccordId === 'jade-exchange-accord'
        && state.exchangeAccordName === 'Jade Exchange Accord'
        && state.exchangeAccordScore >= 34
        && state.exchangeAccordRequiredScore === 34
        && Array.isArray(state.exchangeAccordItemIds)
        && state.exchangeAccordItemIds.includes('jade-thread-charm')
        && state.exchangeAccordItemIds.includes('lantern-harmony-tea')
        && state.exchangeAccordItemIds.includes('jade-mooncake-box')
        && state.exchangeAccordPresenceCount >= 2
        && state.exchangeAccordTallyClaimed === true
        && state.routeWaystoneProof === true
        && state.routeWaystoneId === 'jade-cloudbell-waystone'
        && state.routeWaystoneName === 'Jade Cloudbell Waystone'
        && state.routeWaystoneScore >= 30
        && state.routeWaystoneRequiredScore === 30
        && Array.isArray(state.routeWaystoneRouteIds)
        && state.routeWaystoneRouteIds.includes('moonbridge-bamboo-trail')
        && state.routeWaystoneRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.routeWaystoneInvitedSpiritIds)
        && state.routeWaystoneInvitedSpiritIds.includes('jintari')
        && state.routeWaystoneInvitedSpiritIds.includes('aozhen')
        && state.routeWaystoneSealClaimed === true
        && state.routeCharterProof === true
        && state.routeCharterId === 'jade-route-charter'
        && state.routeCharterName === 'Jade Route Charter'
        && state.routeCharterScore >= 40
        && state.routeCharterRequiredScore === 40
        && Array.isArray(state.routeCharterRouteIds)
        && state.routeCharterRouteIds.includes('moonbridge-bamboo-trail')
        && state.routeCharterRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.routeCharterPartyIds)
        && state.routeCharterPartyIds.includes('lirabao')
        && state.routeCharterPartyIds.includes('jintari')
        && state.routeCharterPartyIds.includes('aozhen')
        && Array.isArray(state.routeCharterProofIds)
        && state.routeCharterProofIds.includes('jade-cloudbell-waystone')
        && state.routeCharterPresenceCount >= 2
        && state.routeCharterSlipClaimed === true
        && state.nurtureRiteProof === true
        && state.nurtureRiteId === 'jade-moonwell-nurture-rite'
        && state.nurtureRiteName === 'Jade Moonwell Nurture Rite'
        && state.nurtureRiteScore >= 40
        && state.nurtureRiteRequiredScore === 40
        && Array.isArray(state.nurtureRiteRosterIds)
        && state.nurtureRiteRosterIds.includes('lirabao')
        && state.nurtureRiteRosterIds.includes('jintari')
        && state.nurtureRiteRosterIds.includes('aozhen')
        && Array.isArray(state.nurtureRiteCaredSpiritIds)
        && state.nurtureRiteCaredSpiritIds.includes('lirabao')
        && state.nurtureRiteCaredSpiritIds.includes('jintari')
        && state.nurtureRiteCaredSpiritIds.includes('aozhen')
        && state.nurtureRibbonClaimed === true
        && state.recoveryTeaProof === true
        && state.recoveryTeaId === 'jade-teahouse-recovery'
        && state.recoveryTeaName === 'Jade Teahouse Recovery'
        && state.recoveryTeaScore >= 36
        && state.recoveryTeaRequiredScore === 36
        && Array.isArray(state.recoveryTeaPartyIds)
        && state.recoveryTeaPartyIds.includes('lirabao')
        && state.recoveryTeaPartyIds.includes('jintari')
        && state.recoveryTeaPartyIds.includes('aozhen')
        && Array.isArray(state.recoveryTeaCaredSpiritIds)
        && state.recoveryTeaCaredSpiritIds.includes('lirabao')
        && state.recoveryTeaCaredSpiritIds.includes('jintari')
        && state.recoveryTeaCaredSpiritIds.includes('aozhen')
        && state.recoveryTeaCupClaimed === true
        && state.kinshipAlbumProof === true
        && state.kinshipAlbumId === 'jade-kinship-album'
        && state.kinshipAlbumName === 'Jade Kinship Album'
        && state.kinshipAlbumScore >= 38
        && state.kinshipAlbumRequiredScore === 38
        && Array.isArray(state.kinshipAlbumSpiritIds)
        && state.kinshipAlbumSpiritIds.includes('lirabao')
        && state.kinshipAlbumSpiritIds.includes('jintari')
        && state.kinshipAlbumSpiritIds.includes('aozhen')
        && Array.isArray(state.kinshipAlbumCaredSpiritIds)
        && state.kinshipAlbumCaredSpiritIds.includes('lirabao')
        && state.kinshipAlbumCaredSpiritIds.includes('jintari')
        && state.kinshipAlbumCaredSpiritIds.includes('aozhen')
        && state.kinshipAlbumTotalBond >= 15
        && state.kinshipAlbumClaimed === true
        && state.nurseryGroveProof === true
        && state.nurseryGroveId === 'jade-nursery-grove'
        && state.nurseryGroveName === 'Jade Nursery Grove'
        && state.nurseryGroveScore >= 52
        && state.nurseryGroveRequiredScore === 52
        && Array.isArray(state.nurseryGroveSpiritIds)
        && state.nurseryGroveSpiritIds.includes('lirabao')
        && state.nurseryGroveSpiritIds.includes('jintari')
        && state.nurseryGroveSpiritIds.includes('aozhen')
        && Array.isArray(state.nurseryGrovePartyIds)
        && state.nurseryGrovePartyIds.includes('lirabao')
        && state.nurseryGrovePartyIds.includes('jintari')
        && state.nurseryGrovePartyIds.includes('aozhen')
        && Array.isArray(state.nurseryGroveCaredSpiritIds)
        && state.nurseryGroveCaredSpiritIds.includes('lirabao')
        && state.nurseryGroveCaredSpiritIds.includes('jintari')
        && state.nurseryGroveCaredSpiritIds.includes('aozhen')
        && state.nurseryGroveTotalBond >= 15
        && state.nurserySproutClaimed === true
        && state.bloomAscendanceProof === true
        && state.bloomAscendanceId === 'jade-bloom-ascendance'
        && state.bloomAscendanceName === 'Jade Bloom Ascendance'
        && state.bloomAscendanceFormTitle === 'Jade Bloom Form'
        && state.bloomAscendanceScore >= 58
        && state.bloomAscendanceRequiredScore === 58
        && Array.isArray(state.bloomAscendanceSpiritIds)
        && state.bloomAscendanceSpiritIds.includes('lirabao')
        && state.bloomAscendanceSpiritIds.includes('jintari')
        && state.bloomAscendanceSpiritIds.includes('aozhen')
        && Array.isArray(state.bloomAscendancePartyIds)
        && state.bloomAscendancePartyIds.includes('lirabao')
        && state.bloomAscendancePartyIds.includes('jintari')
        && state.bloomAscendancePartyIds.includes('aozhen')
        && Array.isArray(state.bloomAscendanceCaredSpiritIds)
        && state.bloomAscendanceCaredSpiritIds.includes('lirabao')
        && state.bloomAscendanceCaredSpiritIds.includes('jintari')
        && state.bloomAscendanceCaredSpiritIds.includes('aozhen')
        && state.bloomAscendanceTotalBond >= 15
        && state.bloomAscendanceSigilClaimed === true
        && state.lineageRegisterProof === true
        && state.lineageRegisterId === 'jade-lineage-register'
        && state.lineageRegisterName === 'Jade Lineage Register'
        && state.lineageRegisterScore >= 60
        && state.lineageRegisterRequiredScore === 60
        && Array.isArray(state.lineageRegisterSpiritIds)
        && state.lineageRegisterSpiritIds.includes('lirabao')
        && state.lineageRegisterSpiritIds.includes('jintari')
        && state.lineageRegisterSpiritIds.includes('aozhen')
        && Array.isArray(state.lineageRegisterPartyIds)
        && state.lineageRegisterPartyIds.includes('lirabao')
        && state.lineageRegisterPartyIds.includes('jintari')
        && state.lineageRegisterPartyIds.includes('aozhen')
        && Array.isArray(state.lineageRegisterCaredSpiritIds)
        && state.lineageRegisterCaredSpiritIds.includes('lirabao')
        && state.lineageRegisterCaredSpiritIds.includes('jintari')
        && state.lineageRegisterCaredSpiritIds.includes('aozhen')
        && Array.isArray(state.lineageRegisterMilestoneLabels)
        && state.lineageRegisterMilestoneLabels.includes('Moonwell Bloom Form')
        && state.lineageRegisterSealClaimed === true
        && state.dojoLadderProof === true
        && state.dojoLadderId === 'jade-dojo-ladder'
        && state.dojoLadderName === 'Jade Dojo Ladder'
        && state.dojoLadderScore >= 44
        && state.dojoLadderRequiredScore === 44
        && Array.isArray(state.dojoLadderPartyIds)
        && state.dojoLadderPartyIds.includes('lirabao')
        && state.dojoLadderPartyIds.includes('jintari')
        && state.dojoLadderPartyIds.includes('aozhen')
        && Array.isArray(state.dojoLadderOpponentIds)
        && state.dojoLadderOpponentIds.includes('jade-echo-apprentice')
        && state.dojoLadderOpponentIds.includes('silk-river-disciple')
        && state.dojoLadderSealClaimed === true
        && state.tournamentProof === true
        && state.tournamentId === 'jade-banner-tournament'
        && state.tournamentName === 'Jade Banner Tournament'
        && state.tournamentScore >= 38
        && state.tournamentRequiredScore === 38
        && Array.isArray(state.tournamentPartyIds)
        && state.tournamentPartyIds.includes('lirabao')
        && state.tournamentPartyIds.includes('jintari')
        && state.tournamentPartyIds.includes('aozhen')
        && state.tournamentPresenceCount >= 2
        && state.tournamentPennantClaimed === true
        && state.rivalCircleProof === true
        && state.rivalCircleId === 'jade-rival-circle'
        && state.rivalCircleName === 'Jade Rival Circle'
        && state.rivalCircleRivalName === 'Qinghei Banner Circle'
        && state.rivalCircleScore >= 46
        && state.rivalCircleRequiredScore === 46
        && Array.isArray(state.rivalCirclePartyIds)
        && state.rivalCirclePartyIds.includes('lirabao')
        && state.rivalCirclePartyIds.includes('jintari')
        && state.rivalCirclePartyIds.includes('aozhen')
        && state.rivalCircleMarkClaimed === true
        && state.sifuCouncilProof === true
        && state.sifuCouncilId === 'jade-sifu-council'
        && state.sifuCouncilName === 'Jade Sifu Council'
        && state.sifuCouncilScore >= 62
        && state.sifuCouncilRequiredScore === 62
        && Array.isArray(state.sifuCouncilPartyIds)
        && state.sifuCouncilPartyIds.includes('lirabao')
        && state.sifuCouncilPartyIds.includes('jintari')
        && state.sifuCouncilPartyIds.includes('aozhen')
        && Array.isArray(state.sifuCouncilMemberIds)
        && state.sifuCouncilMemberIds.includes('sifu-narao')
        && state.sifuCouncilMemberIds.includes('warden-meilin')
        && state.sifuCouncilMemberIds.includes('keeper-haoran')
        && state.sifuCouncilCrestClaimed === true
        && state.summitCircuitProof === true
        && state.summitCircuitId === 'jade-summit-circuit'
        && state.summitCircuitName === 'Jade Summit Circuit'
        && state.summitCircuitScore >= 80
        && state.summitCircuitRequiredScore === 80
        && Array.isArray(state.summitCircuitPartyIds)
        && state.summitCircuitPartyIds.includes('lirabao')
        && state.summitCircuitPartyIds.includes('jintari')
        && state.summitCircuitPartyIds.includes('aozhen')
        && Array.isArray(state.summitCircuitSealIds)
        && state.summitCircuitSealIds.includes('jade-dojo-seal')
        && state.summitCircuitSealIds.includes('banner-ring-seal')
        && state.summitCircuitSealIds.includes('qinghei-rival-seal')
        && state.summitCircuitSealIds.includes('sifu-council-seal')
        && state.summitCircuitLaurelClaimed === true
        && state.commissionProof === true
        && state.commissionId === 'jade-court-commission-ledger'
        && state.commissionName === 'Jade Court Commission Ledger'
        && state.commissionScore >= 24
        && state.commissionKnotClaimed === true
        && state.emoteProof === true
        && state.rallyProof === true
        && state.rallyId === 'jade-courtyard-rally'
        && state.rallyName === 'Jade Courtyard Rally'
        && state.rallyScore >= 22
        && state.rallyPresenceCount >= 2
        && state.rallyKnotClaimed === true
        && state.questLedgerProof === true
        && state.questLedgerId === 'jade-quest-ledger'
        && state.questLedgerName === 'Jade Quest Ledger'
        && state.questLedgerScore >= 40
        && state.questLedgerRequiredScore === 40
        && Array.isArray(state.questLedgerAcceptedQuestIds)
        && state.questLedgerAcceptedQuestIds.includes('first-lantern-vow')
        && state.questLedgerAcceptedQuestIds.includes('silk-market-kindness')
        && state.questLedgerAcceptedQuestIds.includes('skybell-spar')
        && Array.isArray(state.questLedgerCompletedQuestIds)
        && state.questLedgerCompletedQuestIds.includes('first-lantern-vow')
        && state.questLedgerCompletedQuestIds.includes('silk-market-kindness')
        && state.questLedgerCompletedQuestIds.includes('skybell-spar')
        && state.questLedgerSealClaimed === true
        && state.storyChapterProof === true
        && state.storyChapterId === 'jade-scroll-story-chapter'
        && state.storyChapterName === 'Jade Scroll Story Chapter'
        && state.storyChapterScore >= 42
        && state.storyChapterRequiredScore === 42
        && Array.isArray(state.storyChapterRouteIds)
        && state.storyChapterRouteIds.includes('moonbridge-bamboo-trail')
        && state.storyChapterRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.storyChapterQuestIds)
        && state.storyChapterQuestIds.length === 3
        && state.storyScrollClaimed === true
        && state.insigniaCaseProof === true
        && state.insigniaCaseId === 'jade-insignia-case'
        && state.insigniaCaseName === 'Jade Insignia Case'
        && state.insigniaCaseScore >= 34
        && state.insigniaCaseRequiredScore === 34
        && Array.isArray(state.insigniaCaseSpiritIds)
        && state.insigniaCaseSpiritIds.includes('lirabao')
        && state.insigniaCaseSpiritIds.includes('jintari')
        && state.insigniaCaseSpiritIds.includes('aozhen')
        && Array.isArray(state.insigniaCasePartyIds)
        && state.insigniaCasePartyIds.includes('lirabao')
        && state.insigniaCasePartyIds.includes('jintari')
        && state.insigniaCasePartyIds.includes('aozhen')
        && state.insigniaCaseClaimed === true
        && state.captureRiteProof === true
        && state.captureRiteId === 'jade-court-capture-rite'
        && state.captureRiteName === 'Jade Capture Rite'
        && state.captureRiteScore >= 38
        && state.captureRiteRequiredScore === 38
        && Array.isArray(state.captureRiteSpiritIds)
        && state.captureRiteSpiritIds.includes('lirabao')
        && state.captureRiteSpiritIds.includes('jintari')
        && state.captureRiteSpiritIds.includes('aozhen')
        && Array.isArray(state.captureRiteRouteInvitedSpiritIds)
        && state.captureRiteRouteInvitedSpiritIds.includes('jintari')
        && state.captureRiteRouteInvitedSpiritIds.includes('aozhen')
        && Array.isArray(state.captureRiteLureItemIds)
        && state.captureRiteLureItemIds.includes('lantern-harmony-tea')
        && state.captureRiteLureItemIds.includes('jade-thread-charm')
        && state.captureRiteClaimed === true
        && state.encounterAtlasProof === true
        && state.encounterAtlasId === 'jade-encounter-atlas'
        && state.encounterAtlasName === 'Jade Encounter Atlas'
        && state.encounterAtlasScore >= 53
        && state.encounterAtlasRequiredScore === 53
        && Array.isArray(state.encounterAtlasRouteIds)
        && state.encounterAtlasRouteIds.includes('moonbridge-bamboo-trail')
        && state.encounterAtlasRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.encounterAtlasSpiritIds)
        && state.encounterAtlasSpiritIds.includes('lirabao')
        && state.encounterAtlasSpiritIds.includes('jintari')
        && state.encounterAtlasSpiritIds.includes('aozhen')
        && Array.isArray(state.encounterAtlasCapturedSpiritIds)
        && state.encounterAtlasCapturedSpiritIds.includes('lirabao')
        && state.encounterAtlasCapturedSpiritIds.includes('jintari')
        && state.encounterAtlasCapturedSpiritIds.includes('aozhen')
        && Array.isArray(state.encounterAtlasRarityTiers)
        && state.encounterAtlasRarityTiers.includes('common')
        && state.encounterAtlasRarityTiers.includes('uncommon')
        && state.encounterAtlasRarityTiers.includes('rare')
        && state.encounterRotationId === 'jade-encounter-rotation'
        && state.weatherVeilId === 'jade-weather-veil'
        && state.encounterAtlasClaimed === true
        && state.habitatCensusProof === true
        && state.habitatCensusId === 'jade-habitat-census'
        && state.habitatCensusName === 'Jade Habitat Census'
        && state.habitatCensusScore >= 49
        && state.habitatCensusRequiredScore === 49
        && Array.isArray(state.habitatCensusRouteIds)
        && state.habitatCensusRouteIds.includes('moonbridge-bamboo-trail')
        && state.habitatCensusRouteIds.includes('cloudbell-reed-bank')
        && Array.isArray(state.habitatCensusSpiritIds)
        && state.habitatCensusSpiritIds.includes('lirabao')
        && state.habitatCensusSpiritIds.includes('jintari')
        && state.habitatCensusSpiritIds.includes('aozhen')
        && Array.isArray(state.habitatCensusCareLoggedSpiritIds)
        && state.habitatCensusCareLoggedSpiritIds.includes('lirabao')
        && state.habitatCensusCareLoggedSpiritIds.includes('jintari')
        && state.habitatCensusCareLoggedSpiritIds.includes('aozhen')
        && state.habitatCensusSealClaimed === true
        && state.wayfarerChronicleProof === true
        && state.wayfarerChronicleId === 'jade-wayfarer-chronicle'
        && state.wayfarerChronicleName === 'Jade Wayfarer Chronicle'
        && state.wayfarerChronicleScore >= 77
        && state.wayfarerChronicleRequiredScore === 77
        && state.wayfarerChronicleClaspClaimed === true
        && state.guildAscensionProof === true
        && state.guildAscensionTrialId === 'jade-court-ascension-trial'
        && state.guildAscensionTrialName === 'Jade Court Ascension Trial'
        && state.guildAscensionScore >= 66
        && state.guildAscensionRequiredScore === 66
        && state.guildAscensionRibbonClaimed === true
        && state.harmonyFormProof === true
        && state.harmonyFormId === 'triune-jade-harmony'
        && state.harmonyFormName === 'Triune Jade Harmony'
        && state.harmonyFormScore >= 27
        && state.harmonySashClaimed === true
        && state.harmonyTrialProof === true
        && state.harmonyTrialId === 'jade-echo-concord'
        && state.harmonyTrialName === 'Jade Echo Concord Trial'
        && state.harmonyTrialScore >= 24
        && state.concordTallyClaimed === true
        && state.teamSparMatchProof === true
        && state.teamSparMatchId === 'jade-mirror-team-match'
        && state.teamSparMatchName === 'Jade Mirror Team Match'
        && state.teamSparMatchScore >= 30
        && state.teamMatchRibbonClaimed === true
        && state.mentorChallengeProof === true
        && state.mentorChallengeId === 'silk-banner-mentor-drill'
        && state.mentorChallengeName === 'Silk Banner Mentor Drill'
        && state.mentorChallengeScore >= 28
        && state.mentorSealClaimed === true
        && state.traitAttunementProof === true
        && state.traitAttunementId === 'jade-heart-trait'
        && state.traitAttunementName === 'Jade Heart Trait Attunement'
        && state.traitLabel === 'Skybell Wayfinder'
        && state.traitAttunementScore >= 31
        && state.traitThreadClaimed === true
        && state.conditionWeaveProof === true
        && state.conditionWeaveId === 'jade-mirror-condition-weave'
        && state.conditionWeaveName === 'Jade Mirror Condition Weave'
        && state.conditionWeaveScore >= 34
        && Array.isArray(state.conditionIds)
        && state.conditionIds.includes('lantern-ward')
        && state.conditionIds.includes('goldleaf-tempo')
        && state.conditionIds.includes('skybell-guard')
        && state.conditionCharmClaimed === true
        && affinityMatrix.includes('Jade Affinity Matrix')
        && state.affinityMatrixProof === true
        && state.affinityMatrixId === 'jade-affinity-matrix'
        && state.affinityMatrixName === 'Jade Affinity Matrix'
        && state.affinityMatrixScore >= 44
        && state.affinityMatrixRequiredScore === 44
        && Array.isArray(state.affinityMatrixSpiritIds)
        && state.affinityMatrixSpiritIds.includes('lirabao')
        && state.affinityMatrixSpiritIds.includes('jintari')
        && state.affinityMatrixSpiritIds.includes('aozhen')
        && Array.isArray(state.affinityMatrixAffinityLabels)
        && state.affinityMatrixAffinityLabels.includes('blossom')
        && state.affinityMatrixAffinityLabels.includes('citrus-gold')
        && state.affinityMatrixAffinityLabels.includes('sky-jade')
        && Array.isArray(state.affinityMatrixConditionIds)
        && state.affinityMatrixConditionIds.includes('lantern-ward')
        && state.affinityMatrixConditionIds.includes('goldleaf-tempo')
        && state.affinityMatrixConditionIds.includes('skybell-guard')
        && state.affinityMatrixSealClaimed === true
        && state.starterVowProof === true
        && state.starterVowId === 'jade-starter-vow'
        && state.starterVowName === 'Jade Starter Vow'
        && state.starterVowScore >= 18
        && state.starterVowRequiredScore === 18
        && state.starterKnotClaimed === true
        && ['lirabao', 'jintari', 'aozhen'].includes(state.starterSpiritId)
        && Array.isArray(state.starterVowItemIds)
        && state.starterVowItemIds.includes('mochirii-guild-seal')
        && state.relicAttunementProof === true
        && state.relicAttunementId === 'jade-relic-attunement'
        && state.relicAttunementName === 'Jade Relic Attunement'
        && state.relicAttunementScore >= 57
        && state.relicAttunementRequiredScore === 57
        && Array.isArray(state.relicAttunementSpiritIds)
        && state.relicAttunementSpiritIds.includes('lirabao')
        && state.relicAttunementSpiritIds.includes('jintari')
        && state.relicAttunementSpiritIds.includes('aozhen')
        && Array.isArray(state.relicAttunementItemIds)
        && state.relicAttunementItemIds.includes('jade-thread-charm')
        && state.relicAttunementItemIds.includes('lantern-harmony-tea')
        && state.relicAttunementItemIds.includes('jade-court-provision-satchel')
        && state.relicLabel === 'Skybell Thread Cord'
        && state.relicSilkCordClaimed === true
        && state.techniqueProof === true
        && state.techniqueMoveId === 'goldleaf-feint'
        && state.techniqueMasteryXp >= 1
        && ['novice', 'practiced', 'adept'].includes(state.techniqueMasteryLevel)
        && state.tacticProof === true
        && state.lastTacticId === 'goldleaf-opening'
        && state.lastTacticSpiritId === 'jintari'
        && state.lastTacticMoveId === 'goldleaf-feint'
        && state.tacticStance === 'feint'
        && state.tacticFocusScore >= 1
        && state.tacticMasteryXp >= 1
        && state.techniqueLoadoutProof === true
        && state.techniqueLoadoutId === 'jade-step-loadout'
        && state.techniqueLoadoutName === 'Jade Step Loadout'
        && state.techniqueLoadoutScore >= 22
        && state.loadoutSlipClaimed === true
        && Array.isArray(state.techniqueLoadoutMoves)
        && state.techniqueLoadoutMoves.includes('lirabao:lantern-pulse')
        && state.techniqueLoadoutMoves.includes('jintari:goldleaf-feint')
        && state.techniqueLoadoutMoves.includes('aozhen:skybell-guard')
        && state.techniqueCodexProof === true
        && state.techniqueCodexId === 'jade-technique-codex'
        && state.techniqueCodexName === 'Jade Technique Codex'
        && state.techniqueCodexScore >= 46
        && state.techniqueCodexRequiredScore === 46
        && Array.isArray(state.techniqueCodexPartyIds)
        && state.techniqueCodexPartyIds.includes('lirabao')
        && state.techniqueCodexPartyIds.includes('jintari')
        && state.techniqueCodexPartyIds.includes('aozhen')
        && Array.isArray(state.techniqueCodexMoveIds)
        && state.techniqueCodexMoveIds.includes('lantern-pulse')
        && state.techniqueCodexMoveIds.includes('goldleaf-feint')
        && state.techniqueCodexMoveIds.includes('skybell-guard')
        && Array.isArray(state.techniqueCodexTacticIds)
        && state.techniqueCodexTacticIds.includes('lantern-anchor')
        && state.techniqueCodexTacticIds.includes('goldleaf-opening')
        && state.techniqueCodexTacticIds.includes('skybell-ward')
        && state.techniqueCodexSealClaimed === true
        && state.affinityProof === true
        && state.lastAffinityTrialId === 'silk-cinder-trial'
        && state.affinityAdvantage === true
        && state.affinityFocusScore >= 1
        && state.affinityTrialScore === 18
        && Array.isArray(state.attunedSpiritIds)
        && state.attunedSpiritIds.includes('lirabao')
        && state.attunedSpiritIds.includes('jintari')
        && state.attunedSpiritIds.includes('aozhen')
        && Array.isArray(state.partyIds)
        && state.partyIds.includes('lirabao')
        && state.partyIds.includes('jintari')
        && state.partyIds.includes('aozhen')
        && state.sparLadderXp >= 1
        && state.lastSparOpponentId === 'jade-echo-apprentice'
        && state.battleRoundProof === true
        && state.battleRoundId === 'jade-echo-apprentice-round-1'
        && state.battleRoundOpponentName === 'Jade Echo Apprentice'
        && state.battleRoundFocusScore >= state.battleRoundOpponentScore
        && state.battleRoundOpponentScore >= 1
        && state.battleRoundVictory === true
        && Array.isArray(state.battleRoundTranscript)
        && state.battleRoundTranscript.length >= 1
        && state.trainingXp >= 1
        && state.raisingProof === true
        && typeof state.raisingMilestoneLabel === 'string'
        && state.raisingMilestoneLabel.length > 4
        && training.includes(state.raisingMilestoneLabel)
        && state.activeQuestId === 'skybell-spar'
        && Array.isArray(state.completedQuestSteps)
        && state.completedQuestSteps.includes('complete-raising-care')
        && Array.isArray(state.completedQuestIds)
        && state.completedQuestIds.length === 3
        && state.completedQuestIds.includes('first-lantern-vow')
        && state.completedQuestIds.includes('silk-market-kindness')
        && state.completedQuestIds.includes('skybell-spar')
        && state.questChainProof === true
        && state.profileViewed === true
        && state.guildBuddyProof === true
        && state.guildRankProof === true
        && state.guildRankId === 'jade-court-initiate'
        && state.guildRankTitle === 'Jade Court Initiate'
        && state.guildRankScore >= 9
        && state.guildRankSealClaimed === true
        && state.growthRiteProof === true
        && state.growthRiteId === 'moonwell-bloom-rite'
        && state.growthForm === 'Moonwell Bloom Form'
        && state.growthSigilClaimed === true
        && state.statusMood === 'cozy'
        && state.lastInspectedSpiritId === 'aozhen'
        && state.charmListed === true
        && state.marketReceiptProof === true
        && state.marketReceiptId === 'jade-court-market-receipt'
        && state.marketReceiptName === 'Jade Court Market Receipt'
        && state.marketReceiptItemId === 'jade-thread-charm'
        && state.marketReceiptQuantity === 1
        && state.marketReceiptPrice === 5
        && state.marketReceiptCurrency === 'guild-seals'
        && state.marketReceiptScore >= 16
        && state.marketReceiptRequiredScore === 16
        && state.marketReceiptClaimed === true
        && state.tradeProof === true
        && state.canaryRequested === true
        && state.canaryReturnRequested === true
        && chat.includes('Inspect Aozhen')
        && chat.includes('You wave')
        && chat.includes('Jade Thread Charm listed')
        && chat.includes('Jade Court Market Receipt recorded')
        && chat.includes('Direct trade proof')
        && chat.includes('Canary certificate request staged')
        && chat.includes('Jade Vault Return Proof staged')
        && chat.includes('Cloudbell Reed Bank')
        && chat.includes('Cloudbell Skyvow Accord cleared')
        && (chat.includes('Skybell Vow Invitation') || chat.includes('already trusts your Mochirii roster'))
        && chat.includes('Jade Cloudbell Circuit mastered')
        && chat.includes('Jade Cloudbell Patrol complete')
        && chat.includes('Jade Court Habitat Bond recorded')
        && chat.includes('Jade Court Sanctuary Rite complete')
        && chat.includes('Jade Court Research Folio recorded')
        && chat.includes('Jade Court Spirit Compendium complete')
        && chat.includes('Jade Court Roster Archive sealed')
        && chat.includes('Jade Roster Cabinet organized')
        && chat.includes('Jade Blossom Cradle settled')
        && chat.includes('Jade Court Care Cycle complete')
        && chat.includes('Jade Temperament Concord complete')
        && chat.includes('Jade Route Ecology Survey complete')
        && chat.includes('Jade Court Provision Satchel stocked')
        && chat.includes('Jade Moonwell Nurture Rite complete')
        && chat.includes('Jade Kinship Album recorded')
        && chat.includes('Jade Bloom Ascendance complete')
        && chat.includes('Jade Lineage Register recorded')
        && chat.includes('Jade Weather Veil recorded')
        && chat.includes('Jade Encounter Rotation recorded')
        && chat.includes('Jade Encounter Atlas recorded')
        && chat.includes('Jade Habitat Census recorded')
        && chat.includes('Jade Banner Tournament cleared')
        && chat.includes('Jade Rival Circle cleared')
        && chat.includes('Jade Court Commission Ledger complete')
        && chat.includes('Jade Courtyard Rally complete')
        && chat.includes('Jade Scroll Story Chapter recorded')
        && chat.includes('Jade Wayfarer Chronicle complete')
        && chat.includes('Jade Court Ascension Trial complete')
        && chat.includes('Jade Step Loadout prepared')
        && chat.includes('Jade Heart Trait Attunement')
        && chat.includes('Jade Mirror Condition Weave complete')
        && chat.includes('Jade Affinity Matrix mapped')
        && chat.includes('Jade Relic Attunement complete')
        && chat.includes('Triune Jade Harmony formed')
        && chat.includes('Jade Echo Concord Trial cleared')
        && chat.includes('Jade Mirror Team Match cleared')
        && chat.includes('Silk Banner Mentor Drill cleared')
        && chat.includes('Quest chain complete')
        && feed.includes('Canary');
      },
      undefined,
      { timeout: timeoutMs }
    );
  } catch {
    await page.waitForTimeout(500);
  }

  const snapshot = await page.evaluate(() => {
    const rawState = localStorage.getItem('mochiSocial.alphaState') || '{}';
    const state = JSON.parse(rawState);
    return {
      profile: document.querySelector('[data-profile-label]')?.textContent?.trim() || '',
      guild: document.querySelector('[data-guild-label]')?.textContent?.trim() || '',
      rank: document.querySelector('[data-rank-label]')?.textContent?.trim() || '',
      status: document.querySelector('[data-status-label]')?.textContent?.trim() || '',
      spirit: document.querySelector('[data-spirit-label]')?.textContent?.trim() || '',
      starterVow: document.querySelector('[data-starter-vow-label]')?.textContent?.trim() || '',
      journal: document.querySelector('[data-journal-label]')?.textContent?.trim() || '',
      expedition: document.querySelector('[data-expedition-label]')?.textContent?.trim() || '',
      routeInvite: document.querySelector('[data-route-invite-label]')?.textContent?.trim() || '',
      captureRite: document.querySelector('[data-capture-rite-label]')?.textContent?.trim() || '',
      fieldAccord: document.querySelector('[data-field-accord-label]')?.textContent?.trim() || '',
      routeMastery: document.querySelector('[data-route-mastery-label]')?.textContent?.trim() || '',
      routePatrol: document.querySelector('[data-route-patrol-label]')?.textContent?.trim() || '',
      habitatBond: document.querySelector('[data-habitat-bond-label]')?.textContent?.trim() || '',
      sanctuary: document.querySelector('[data-sanctuary-label]')?.textContent?.trim() || '',
      research: document.querySelector('[data-research-label]')?.textContent?.trim() || '',
      compendium: document.querySelector('[data-compendium-label]')?.textContent?.trim() || '',
      archive: document.querySelector('[data-archive-label]')?.textContent?.trim() || '',
      rosterCabinet: document.querySelector('[data-roster-cabinet-label]')?.textContent?.trim() || '',
      blossomCradle: document.querySelector('[data-blossom-cradle-label]')?.textContent?.trim() || '',
      provision: document.querySelector('[data-provision-label]')?.textContent?.trim() || '',
      careCycle: document.querySelector('[data-care-cycle-label]')?.textContent?.trim() || '',
      temperament: document.querySelector('[data-temperament-label]')?.textContent?.trim() || '',
      fieldAlmanac: document.querySelector('[data-field-almanac-label]')?.textContent?.trim() || '',
    routeEcology: document.querySelector('[data-route-ecology-label]')?.textContent?.trim() || '',
    weatherVeil: document.querySelector('[data-weather-veil-label]')?.textContent?.trim() || '',
    encounterRotation: document.querySelector('[data-encounter-rotation-label]')?.textContent?.trim() || '',
    encounterAtlas: document.querySelector('[data-encounter-atlas-label]')?.textContent?.trim() || '',
    habitatCensus: document.querySelector('[data-habitat-census-label]')?.textContent?.trim() || '',
    craftWrit: document.querySelector('[data-craft-writ-label]')?.textContent?.trim() || '',
    exchangeAccord: document.querySelector('[data-exchange-accord-label]')?.textContent?.trim() || '',
    routeWaystone: document.querySelector('[data-route-waystone-label]')?.textContent?.trim() || '',
    routeCharter: document.querySelector('[data-route-charter-label]')?.textContent?.trim() || '',
    nurtureRite: document.querySelector('[data-nurture-rite-label]')?.textContent?.trim() || '',
    recoveryTea: document.querySelector('[data-recovery-tea-label]')?.textContent?.trim() || '',
    kinship: document.querySelector('[data-kinship-album-label]')?.textContent?.trim() || '',
    nursery: document.querySelector('[data-nursery-grove-label]')?.textContent?.trim() || '',
    bloomAscendance: document.querySelector('[data-bloom-ascendance-label]')?.textContent?.trim() || '',
    lineageRegister: document.querySelector('[data-lineage-register-label]')?.textContent?.trim() || '',
    dojoLadder: document.querySelector('[data-dojo-ladder-label]')?.textContent?.trim() || '',
    tournament: document.querySelector('[data-tournament-label]')?.textContent?.trim() || '',
    rivalCircle: document.querySelector('[data-rival-circle-label]')?.textContent?.trim() || '',
    sifuCouncil: document.querySelector('[data-sifu-council-label]')?.textContent?.trim() || '',
    summitCircuit: document.querySelector('[data-summit-circuit-label]')?.textContent?.trim() || '',
    commission: document.querySelector('[data-commission-label]')?.textContent?.trim() || '',
      rally: document.querySelector('[data-rally-label]')?.textContent?.trim() || '',
      questLedger: document.querySelector('[data-quest-ledger-label]')?.textContent?.trim() || '',
      story: document.querySelector('[data-story-label]')?.textContent?.trim() || '',
      insignia: document.querySelector('[data-insignia-label]')?.textContent?.trim() || '',
      chronicle: document.querySelector('[data-chronicle-label]')?.textContent?.trim() || '',
      ascension: document.querySelector('[data-ascension-label]')?.textContent?.trim() || '',
      technique: document.querySelector('[data-technique-label]')?.textContent?.trim() || '',
      tactic: document.querySelector('[data-tactic-label]')?.textContent?.trim() || '',
      loadout: document.querySelector('[data-loadout-label]')?.textContent?.trim() || '',
      techniqueCodex: document.querySelector('[data-technique-codex-label]')?.textContent?.trim() || '',
      trait: document.querySelector('[data-trait-label]')?.textContent?.trim() || '',
      condition: document.querySelector('[data-condition-label]')?.textContent?.trim() || '',
      affinityMatrix: document.querySelector('[data-affinity-matrix-label]')?.textContent?.trim() || '',
      relicAttunement: document.querySelector('[data-relic-attunement-label]')?.textContent?.trim() || '',
      affinity: document.querySelector('[data-affinity-label]')?.textContent?.trim() || '',
      party: document.querySelector('[data-party-label]')?.textContent?.trim() || '',
      harmony: document.querySelector('[data-harmony-label]')?.textContent?.trim() || '',
      concord: document.querySelector('[data-harmony-trial-label]')?.textContent?.trim() || '',
      teamMatch: document.querySelector('[data-team-match-label]')?.textContent?.trim() || '',
      mentor: document.querySelector('[data-mentor-label]')?.textContent?.trim() || '',
      training: document.querySelector('[data-training-label]')?.textContent?.trim() || '',
      battleRound: document.querySelector('[data-battle-round-label]')?.textContent?.trim() || '',
      growth: document.querySelector('[data-growth-label]')?.textContent?.trim() || '',
      quest: document.querySelector('[data-quest-label]')?.textContent?.trim() || '',
      market: document.querySelector('[data-market-label]')?.textContent?.trim() || '',
      rosterPanel: document.querySelector('[data-roster-panel]')?.textContent?.trim() || '',
      feed: Array.from(document.querySelectorAll('[data-alpha-feed] li')).map((item) => item.textContent?.trim() || ''),
      state
    };
  });

  assert(snapshot.state.spiritId === 'aozhen', 'HUD second route invitation must select Aozhen as the active spirit.');
  assert(snapshot.state.captureProof === true, 'HUD invite action must record spirit capture proof.');
  assert(snapshot.state.lastCaptureSpiritId === 'aozhen', 'HUD route invitation must record Aozhen as the invited spirit.');
  assert(snapshot.state.bond >= 1, 'HUD care action must increase spirit bond.');
  assert(Array.isArray(snapshot.state.attunedSpiritIds) && snapshot.state.attunedSpiritIds.includes('lirabao'), 'HUD attune action must add Lirabao to the local spirit roster.');
  assert(Array.isArray(snapshot.state.attunedSpiritIds) && snapshot.state.attunedSpiritIds.includes('jintari'), 'HUD route invitation must add Jintari to the local spirit roster.');
  assert(Array.isArray(snapshot.state.attunedSpiritIds) && snapshot.state.attunedSpiritIds.includes('aozhen'), 'HUD second route invitation must add Aozhen to the local spirit roster.');
  assert(snapshot.state.lastFocusedSpiritId === 'aozhen', 'HUD roster focus control must return active focus to Aozhen.');
  assert(Array.isArray(snapshot.state.focusedSpiritHistory) && snapshot.state.focusedSpiritHistory.includes('lirabao'), 'HUD roster focus history must record Lirabao focus.');
  assert(Array.isArray(snapshot.state.focusedSpiritHistory) && snapshot.state.focusedSpiritHistory.includes('aozhen'), 'HUD roster focus history must record Aozhen focus.');
  assert(snapshot.state.bondBySpiritId?.lirabao >= 1, 'HUD roster progress map must track Lirabao bond.');
  assert(snapshot.state.bondBySpiritId?.jintari >= 1, 'HUD roster progress map must track Jintari bond.');
  assert(snapshot.state.bondBySpiritId?.aozhen >= 5, 'HUD roster progress map must track Aozhen raised bond.');
  assert(snapshot.state.growthBySpiritId?.lirabao === 'glow', 'HUD roster progress map must upgrade Lirabao growth from full-roster bond proof.');
  assert(snapshot.state.growthBySpiritId?.aozhen === 'glow', 'HUD roster progress map must track Aozhen glow growth.');
  assert(snapshot.rosterPanel.includes('Lirabao'), 'HUD roster panel must include Lirabao.');
  assert(snapshot.rosterPanel.includes('Jintari'), 'HUD roster panel must include Jintari.');
  assert(snapshot.rosterPanel.includes('Aozhen'), 'HUD roster panel must include Aozhen.');
  assert(snapshot.rosterPanel.includes('active glow bond 5/5'), 'HUD roster panel must expose the active spirit growth and bond.');
  assert(snapshot.rosterPanel.includes('Skybell Vow Invitation'), 'HUD roster panel must expose original capture invitation labels.');
  assert(snapshot.rosterPanel.includes('Skybell Guard'), 'HUD roster panel must expose original battle move labels.');
  assert(snapshot.rosterPanel.includes('Tea ribbon care'), 'HUD roster panel must expose original care actions.');
  assert(snapshot.rosterPanel.includes('Jade brush grooming'), 'HUD roster panel must expose original raising needs.');
  assert(snapshot.rosterPanel.includes('Canary eligible, no real value'), 'HUD roster panel must retain Canary no-real-value language.');
  assert(snapshot.journal.includes('Journal:'), 'HUD journal label must show collection state.');
  assert(snapshot.state.journalProof === true, 'HUD journal action must record journal proof.');
  assert(snapshot.state.journalDiscoveredCount === 3, 'HUD journal action must record all three alpha spirits.');
  assert(snapshot.state.lastJournalSpiritId === 'aozhen', 'HUD journal action must record Aozhen as the active journal spirit.');
  assert(snapshot.expedition.includes('Route:'), 'HUD expedition label must show route state.');
  assert(snapshot.state.expeditionProof === true, 'HUD expedition action must record field route proof.');
  assert(snapshot.state.lastExpeditionRouteId === 'cloudbell-reed-bank', 'HUD expedition action must record the Cloudbell route.');
  assert(snapshot.state.lastExpeditionEncounterId === 'aozhen', 'HUD expedition action must record Aozhen route signs.');
  assert(Array.isArray(snapshot.state.discoveredRouteIds) && snapshot.state.discoveredRouteIds.includes('moonbridge-bamboo-trail'), 'HUD expedition action must record discovered route ids.');
  assert(Array.isArray(snapshot.state.discoveredRouteIds) && snapshot.state.discoveredRouteIds.includes('cloudbell-reed-bank'), 'HUD expedition action must record the second discovered route id.');
  assert(snapshot.state.expeditionCount >= 2, 'HUD expedition action must increment expedition count twice.');
  assert(snapshot.routeInvite.includes('Route Invite:'), 'HUD route invitation label must show route invitation state.');
  assert(snapshot.state.routeInviteProof === true, 'HUD route invitation action must record route invitation proof.');
  assert(snapshot.state.lastRouteInviteRouteId === 'cloudbell-reed-bank', 'HUD route invitation must record the Cloudbell route.');
  assert(snapshot.state.lastRouteInviteSpiritId === 'aozhen', 'HUD route invitation must record Aozhen as the route spirit.');
  assert(Array.isArray(snapshot.state.routeInvitedSpiritIds) && snapshot.state.routeInvitedSpiritIds.includes('jintari'), 'HUD route invitation history must record Jintari.');
  assert(Array.isArray(snapshot.state.routeInvitedSpiritIds) && snapshot.state.routeInvitedSpiritIds.includes('aozhen'), 'HUD route invitation history must record Aozhen.');
  assert(snapshot.captureRite.includes('Jade Capture Rite'), 'HUD capture rite label must show the completed capture rite.');
  assert(snapshot.state.captureRiteProof === true, 'HUD capture rite action must record capture rite proof.');
  assert(snapshot.state.captureRiteId === 'jade-court-capture-rite', 'HUD capture rite action must record the rite id.');
  assert(snapshot.state.captureRiteName === 'Jade Capture Rite', 'HUD capture rite action must record the rite name.');
  assert(snapshot.state.captureRiteScore >= 38, 'HUD capture rite action must record a passing rite score.');
  assert(snapshot.state.captureRiteRequiredScore === 38, 'HUD capture rite action must record the rite requirement.');
  assert(Array.isArray(snapshot.state.captureRiteSpiritIds) && snapshot.state.captureRiteSpiritIds.includes('lirabao'), 'HUD capture rite action must preserve Lirabao capture proof.');
  assert(Array.isArray(snapshot.state.captureRiteSpiritIds) && snapshot.state.captureRiteSpiritIds.includes('jintari'), 'HUD capture rite action must preserve Jintari capture proof.');
  assert(Array.isArray(snapshot.state.captureRiteSpiritIds) && snapshot.state.captureRiteSpiritIds.includes('aozhen'), 'HUD capture rite action must preserve Aozhen capture proof.');
  assert(Array.isArray(snapshot.state.captureRiteRouteInvitedSpiritIds) && snapshot.state.captureRiteRouteInvitedSpiritIds.includes('jintari'), 'HUD capture rite action must preserve Jintari route invitation proof.');
  assert(Array.isArray(snapshot.state.captureRiteRouteInvitedSpiritIds) && snapshot.state.captureRiteRouteInvitedSpiritIds.includes('aozhen'), 'HUD capture rite action must preserve Aozhen route invitation proof.');
  assert(Array.isArray(snapshot.state.captureRiteLureItemIds) && snapshot.state.captureRiteLureItemIds.includes('lantern-harmony-tea'), 'HUD capture rite action must preserve Lantern Harmony Tea lure proof.');
  assert(Array.isArray(snapshot.state.captureRiteLureItemIds) && snapshot.state.captureRiteLureItemIds.includes('jade-thread-charm'), 'HUD capture rite action must preserve Jade Thread Charm lure proof.');
  assert(snapshot.state.captureRiteClaimed === true, 'HUD capture rite action must mark the no-real-value capture tally proof.');
  assert(snapshot.encounterRotation.includes('Jade Encounter Rotation'), 'HUD encounter rotation label must show the completed encounter rotation.');
  assert(snapshot.state.encounterRotationProof === true, 'HUD encounter rotation action must record encounter rotation proof.');
  assert(snapshot.state.encounterRotationId === 'jade-encounter-rotation', 'HUD encounter rotation action must record the rotation id.');
  assert(snapshot.state.encounterRotationName === 'Jade Encounter Rotation', 'HUD encounter rotation action must record the rotation name.');
  assert(snapshot.state.encounterRotationScore >= 45, 'HUD encounter rotation action must record a passing rotation score.');
  assert(snapshot.state.encounterRotationRequiredScore === 45, 'HUD encounter rotation action must record the rotation requirement.');
  assert(Array.isArray(snapshot.state.encounterRotationRouteIds) && snapshot.state.encounterRotationRouteIds.includes('moonbridge-bamboo-trail'), 'HUD encounter rotation action must preserve the Moonbridge route.');
  assert(Array.isArray(snapshot.state.encounterRotationRouteIds) && snapshot.state.encounterRotationRouteIds.includes('cloudbell-reed-bank'), 'HUD encounter rotation action must preserve the Cloudbell route.');
  assert(Array.isArray(snapshot.state.encounterRotationSpiritIds) && snapshot.state.encounterRotationSpiritIds.includes('lirabao'), 'HUD encounter rotation action must preserve Lirabao encounter proof.');
  assert(Array.isArray(snapshot.state.encounterRotationSpiritIds) && snapshot.state.encounterRotationSpiritIds.includes('jintari'), 'HUD encounter rotation action must preserve Jintari encounter proof.');
  assert(Array.isArray(snapshot.state.encounterRotationSpiritIds) && snapshot.state.encounterRotationSpiritIds.includes('aozhen'), 'HUD encounter rotation action must preserve Aozhen encounter proof.');
  assert(Array.isArray(snapshot.state.encounterRotationLureItemIds) && snapshot.state.encounterRotationLureItemIds.includes('lantern-harmony-tea'), 'HUD encounter rotation action must preserve Lantern Harmony Tea lure proof.');
  assert(Array.isArray(snapshot.state.encounterRotationLureItemIds) && snapshot.state.encounterRotationLureItemIds.includes('jade-thread-charm'), 'HUD encounter rotation action must preserve Jade Thread Charm lure proof.');
  assert(Array.isArray(snapshot.state.encounterRotationWindows) && snapshot.state.encounterRotationWindows.length >= 2, 'HUD encounter rotation action must preserve route window proof.');
  assert(snapshot.state.weatherVeilId === 'jade-weather-veil', 'HUD encounter rotation action must preserve weather veil proof.');
  assert(snapshot.state.encounterRotationScrollClaimed === true, 'HUD encounter rotation action must mark the no-real-value rotation scroll proof.');
  assert(snapshot.encounterAtlas.includes('Jade Encounter Atlas'), 'HUD encounter atlas label must show the completed encounter atlas.');
  assert(snapshot.state.encounterAtlasProof === true, 'HUD encounter atlas action must record encounter atlas proof.');
  assert(snapshot.state.encounterAtlasId === 'jade-encounter-atlas', 'HUD encounter atlas action must record the atlas id.');
  assert(snapshot.state.encounterAtlasName === 'Jade Encounter Atlas', 'HUD encounter atlas action must record the atlas name.');
  assert(snapshot.state.encounterAtlasScore >= 53, 'HUD encounter atlas action must record a passing atlas score.');
  assert(snapshot.state.encounterAtlasRequiredScore === 53, 'HUD encounter atlas action must record the atlas requirement.');
  assert(Array.isArray(snapshot.state.encounterAtlasRouteIds) && snapshot.state.encounterAtlasRouteIds.includes('moonbridge-bamboo-trail'), 'HUD encounter atlas action must preserve the Moonbridge route.');
  assert(Array.isArray(snapshot.state.encounterAtlasRouteIds) && snapshot.state.encounterAtlasRouteIds.includes('cloudbell-reed-bank'), 'HUD encounter atlas action must preserve the Cloudbell route.');
  assert(Array.isArray(snapshot.state.encounterAtlasSpiritIds) && snapshot.state.encounterAtlasSpiritIds.includes('lirabao'), 'HUD encounter atlas action must preserve Lirabao encounter proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasSpiritIds) && snapshot.state.encounterAtlasSpiritIds.includes('jintari'), 'HUD encounter atlas action must preserve Jintari encounter proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasSpiritIds) && snapshot.state.encounterAtlasSpiritIds.includes('aozhen'), 'HUD encounter atlas action must preserve Aozhen encounter proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasCapturedSpiritIds) && snapshot.state.encounterAtlasCapturedSpiritIds.includes('lirabao'), 'HUD encounter atlas action must preserve Lirabao capture proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasCapturedSpiritIds) && snapshot.state.encounterAtlasCapturedSpiritIds.includes('jintari'), 'HUD encounter atlas action must preserve Jintari capture proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasCapturedSpiritIds) && snapshot.state.encounterAtlasCapturedSpiritIds.includes('aozhen'), 'HUD encounter atlas action must preserve Aozhen capture proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasRarityTiers) && snapshot.state.encounterAtlasRarityTiers.includes('common'), 'HUD encounter atlas action must preserve common rarity proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasRarityTiers) && snapshot.state.encounterAtlasRarityTiers.includes('uncommon'), 'HUD encounter atlas action must preserve uncommon rarity proof.');
  assert(Array.isArray(snapshot.state.encounterAtlasRarityTiers) && snapshot.state.encounterAtlasRarityTiers.includes('rare'), 'HUD encounter atlas action must preserve rare rarity proof.');
  assert(snapshot.state.encounterRotationId === 'jade-encounter-rotation', 'HUD encounter atlas action must preserve encounter rotation proof.');
  assert(snapshot.state.weatherVeilId === 'jade-weather-veil', 'HUD encounter atlas action must preserve weather veil proof.');
  assert(snapshot.state.encounterAtlasClaimed === true, 'HUD encounter atlas action must mark the no-real-value atlas proof.');
  assert(snapshot.habitatCensus.includes('Jade Habitat Census'), 'HUD habitat census label must show the completed habitat census.');
  assert(snapshot.state.habitatCensusProof === true, 'HUD habitat census action must record habitat census proof.');
  assert(snapshot.state.habitatCensusId === 'jade-habitat-census', 'HUD habitat census action must record the census id.');
  assert(snapshot.state.habitatCensusName === 'Jade Habitat Census', 'HUD habitat census action must record the census name.');
  assert(snapshot.state.habitatCensusScore >= 49, 'HUD habitat census action must record a passing census score.');
  assert(snapshot.state.habitatCensusRequiredScore === 49, 'HUD habitat census action must record the census requirement.');
  assert(Array.isArray(snapshot.state.habitatCensusRouteIds) && snapshot.state.habitatCensusRouteIds.includes('moonbridge-bamboo-trail'), 'HUD habitat census action must preserve the Moonbridge route.');
  assert(Array.isArray(snapshot.state.habitatCensusRouteIds) && snapshot.state.habitatCensusRouteIds.includes('cloudbell-reed-bank'), 'HUD habitat census action must preserve the Cloudbell route.');
  assert(Array.isArray(snapshot.state.habitatCensusSpiritIds) && snapshot.state.habitatCensusSpiritIds.includes('lirabao'), 'HUD habitat census action must preserve Lirabao observation proof.');
  assert(Array.isArray(snapshot.state.habitatCensusSpiritIds) && snapshot.state.habitatCensusSpiritIds.includes('jintari'), 'HUD habitat census action must preserve Jintari observation proof.');
  assert(Array.isArray(snapshot.state.habitatCensusSpiritIds) && snapshot.state.habitatCensusSpiritIds.includes('aozhen'), 'HUD habitat census action must preserve Aozhen observation proof.');
  assert(Array.isArray(snapshot.state.habitatCensusCareLoggedSpiritIds) && snapshot.state.habitatCensusCareLoggedSpiritIds.includes('lirabao'), 'HUD habitat census action must preserve Lirabao care log.');
  assert(Array.isArray(snapshot.state.habitatCensusCareLoggedSpiritIds) && snapshot.state.habitatCensusCareLoggedSpiritIds.includes('jintari'), 'HUD habitat census action must preserve Jintari care log.');
  assert(Array.isArray(snapshot.state.habitatCensusCareLoggedSpiritIds) && snapshot.state.habitatCensusCareLoggedSpiritIds.includes('aozhen'), 'HUD habitat census action must preserve Aozhen care log.');
  assert(snapshot.state.habitatCensusSealClaimed === true, 'HUD habitat census action must mark the no-real-value habitat census seal proof.');
  assert(snapshot.fieldAccord.includes('Cloudbell Skyvow Accord'), 'HUD field accord label must show the cleared Cloudbell accord.');
  assert(snapshot.state.fieldAccordProof === true, 'HUD field accord action must record field accord proof.');
  assert(snapshot.state.fieldAccordId === 'cloudbell-skyvow-accord', 'HUD field accord action must record the Cloudbell accord id.');
  assert(snapshot.state.fieldAccordName === 'Cloudbell Skyvow Accord', 'HUD field accord action must record the Cloudbell accord name.');
  assert(snapshot.state.fieldAccordScore >= 12, 'HUD field accord action must record a passing accord score.');
  assert(snapshot.state.fieldAccordRequiredScore === 12, 'HUD field accord action must record the Cloudbell accord requirement.');
  assert(snapshot.state.lastFieldAccordRouteId === 'cloudbell-reed-bank', 'HUD field accord action must record the Cloudbell route.');
  assert(snapshot.state.lastFieldAccordSpiritId === 'aozhen', 'HUD field accord action must record Aozhen as the accord spirit.');
  assert(snapshot.state.fieldAccordTalismanClaimed === true, 'HUD field accord action must mark the no-real-value accord talisman proof.');
  assert(snapshot.routeMastery.includes('Jade Cloudbell Circuit'), 'HUD route mastery label must show the completed circuit.');
  assert(snapshot.state.routeMasteryProof === true, 'HUD route mastery action must record route mastery proof.');
  assert(snapshot.state.routeMasteryId === 'jade-cloudbell-circuit', 'HUD route mastery action must record the circuit id.');
  assert(snapshot.state.routeMasteryTitle === 'Jade Cloudbell Circuit', 'HUD route mastery action must record the circuit title.');
  assert(snapshot.state.routeMasteryScore >= 21, 'HUD route mastery action must record a passing circuit score.');
  assert(snapshot.state.routeMasteryKnotClaimed === true, 'HUD route mastery action must mark the no-real-value route knot proof.');
  assert(snapshot.routePatrol.includes('Jade Cloudbell Patrol'), 'HUD route patrol label must show the completed patrol.');
  assert(snapshot.state.routePatrolProof === true, 'HUD route patrol action must record route patrol proof.');
  assert(snapshot.state.routePatrolId === 'jade-cloudbell-patrol', 'HUD route patrol action must record the patrol id.');
  assert(snapshot.state.routePatrolName === 'Jade Cloudbell Patrol', 'HUD route patrol action must record the patrol name.');
  assert(snapshot.state.routePatrolScore >= 24, 'HUD route patrol action must record a passing patrol score.');
  assert(snapshot.state.routePatrolRequiredScore === 24, 'HUD route patrol action must record the patrol requirement.');
  assert(snapshot.state.routePatrolPennantClaimed === true, 'HUD route patrol action must mark the no-real-value patrol pennant proof.');
  assert(snapshot.habitatBond.includes('Jade Court Habitat Bond'), 'HUD habitat bond label must show the completed shared habitat proof.');
  assert(snapshot.state.habitatBondProof === true, 'HUD habitat bond action must record habitat bond proof.');
  assert(snapshot.state.habitatBondId === 'jade-court-habitat-bond', 'HUD habitat bond action must record the habitat bond id.');
  assert(snapshot.state.habitatBondName === 'Jade Court Habitat Bond', 'HUD habitat bond action must record the habitat bond name.');
  assert(snapshot.state.habitatBondScore >= 15, 'HUD habitat bond action must record a passing habitat score.');
  assert(snapshot.state.habitatTasselClaimed === true, 'HUD habitat bond action must mark the no-real-value habitat tassel proof.');
  assert(snapshot.sanctuary.includes('Jade Court Sanctuary Rite'), 'HUD sanctuary label must show the completed care-shrine rite.');
  assert(snapshot.state.sanctuaryRiteProof === true, 'HUD sanctuary action must record care-shrine restoration proof.');
  assert(snapshot.state.sanctuaryRiteId === 'jade-court-sanctuary-rite', 'HUD sanctuary action must record the Jade Court Sanctuary Rite id.');
  assert(snapshot.state.sanctuaryRiteName === 'Jade Court Sanctuary Rite', 'HUD sanctuary action must record the Jade Court Sanctuary Rite name.');
  assert(snapshot.state.sanctuaryRiteScore >= 24, 'HUD sanctuary action must record a passing sanctuary score.');
  assert(snapshot.state.sanctuaryRiteRequiredScore === 24, 'HUD sanctuary action must record the sanctuary requirement.');
  assert(snapshot.state.sanctuaryBellClaimed === true, 'HUD sanctuary action must mark the no-real-value sanctuary bell proof.');
  assert(snapshot.research.includes('Jade Court Research Folio'), 'HUD research label must show the completed field guide proof.');
  assert(snapshot.state.researchProof === true, 'HUD research action must record research folio proof.');
  assert(snapshot.state.researchFolioId === 'jade-court-research-folio', 'HUD research action must record the research folio id.');
  assert(snapshot.state.researchFolioName === 'Jade Court Research Folio', 'HUD research action must record the research folio name.');
  assert(snapshot.state.researchScore >= 18, 'HUD research action must record a passing research score.');
  assert(snapshot.state.researchFolioClaimed === true, 'HUD research action must mark the no-real-value research folio proof.');
  assert(snapshot.compendium.includes('Jade Court Spirit Compendium'), 'HUD compendium label must show the completed collection proof.');
  assert(snapshot.state.compendiumProof === true, 'HUD compendium action must record compendium proof.');
  assert(snapshot.state.compendiumId === 'jade-court-spirit-compendium', 'HUD compendium action must record the compendium id.');
  assert(snapshot.state.compendiumName === 'Jade Court Spirit Compendium', 'HUD compendium action must record the compendium name.');
  assert(snapshot.state.compendiumScore >= 25, 'HUD compendium action must record a passing compendium score.');
  assert(snapshot.state.compendiumSealClaimed === true, 'HUD compendium action must mark the no-real-value compendium seal proof.');
  assert(snapshot.archive.includes('Jade Court Roster Archive'), 'HUD roster archive label must show the completed archive proof.');
  assert(snapshot.state.rosterArchiveProof === true, 'HUD roster archive action must record collection-management proof.');
  assert(snapshot.state.rosterArchiveId === 'jade-court-roster-archive', 'HUD roster archive action must record the archive id.');
  assert(snapshot.state.rosterArchiveName === 'Jade Court Roster Archive', 'HUD roster archive action must record the archive name.');
  assert(snapshot.state.rosterArchiveScore >= 22, 'HUD roster archive action must record a passing archive score.');
  assert(snapshot.state.rosterArchiveRequiredScore === 22, 'HUD roster archive action must record the archive requirement.');
  assert(Array.isArray(snapshot.state.rosterArchivePartyIds) && snapshot.state.rosterArchivePartyIds.length === 2, 'HUD roster archive action must record the active archive party.');
  assert(Array.isArray(snapshot.state.rosterArchiveReserveIds) && snapshot.state.rosterArchiveReserveIds.length >= 1, 'HUD roster archive action must record a reserve spirit.');
  assert(snapshot.state.rosterArchiveSealClaimed === true, 'HUD roster archive action must mark the no-real-value archive seal proof.');
  assert(snapshot.rosterCabinet.includes('Jade Roster Cabinet'), 'HUD roster cabinet label must show the organized storage proof.');
  assert(snapshot.state.rosterCabinetProof === true, 'HUD roster cabinet action must record storage organization proof.');
  assert(snapshot.state.rosterCabinetId === 'jade-roster-cabinet', 'HUD roster cabinet action must record the cabinet id.');
  assert(snapshot.state.rosterCabinetName === 'Jade Roster Cabinet', 'HUD roster cabinet action must record the cabinet name.');
  assert(snapshot.state.rosterCabinetScore >= 30, 'HUD roster cabinet action must record a passing cabinet score.');
  assert(snapshot.state.rosterCabinetRequiredScore === 30, 'HUD roster cabinet action must record the cabinet requirement.');
  assert(Array.isArray(snapshot.state.rosterCabinetSpiritIds) && snapshot.state.rosterCabinetSpiritIds.length === 3, 'HUD roster cabinet action must record the full cabinet spirit roster.');
  assert(Array.isArray(snapshot.state.rosterCabinetPartyIds) && snapshot.state.rosterCabinetPartyIds.length === 3, 'HUD roster cabinet action must record the full cabinet party.');
  assert(Array.isArray(snapshot.state.rosterCabinetSlotLabels) && snapshot.state.rosterCabinetSlotLabels.length === 3, 'HUD roster cabinet action must record three storage labels.');
  assert(snapshot.state.rosterCabinetTagClaimed === true, 'HUD roster cabinet action must mark the no-real-value cabinet tag proof.');
  assert(snapshot.blossomCradle.includes('Jade Blossom Cradle'), 'HUD blossom cradle label must show the nursery continuity proof.');
  assert(snapshot.state.blossomCradleProof === true, 'HUD blossom cradle action must record cradle continuity proof.');
  assert(snapshot.state.blossomCradleId === 'jade-blossom-cradle', 'HUD blossom cradle action must record the cradle id.');
  assert(snapshot.state.blossomCradleName === 'Jade Blossom Cradle', 'HUD blossom cradle action must record the cradle name.');
  assert(snapshot.state.blossomCradleScore >= 48, 'HUD blossom cradle action must record a passing cradle score.');
  assert(snapshot.state.blossomCradleRequiredScore === 48, 'HUD blossom cradle action must record the cradle requirement.');
  assert(Array.isArray(snapshot.state.blossomCradleSpiritIds) && snapshot.state.blossomCradleSpiritIds.length === 3, 'HUD blossom cradle action must record the full cradle spirit roster.');
  assert(Array.isArray(snapshot.state.blossomCradlePartyIds) && snapshot.state.blossomCradlePartyIds.length === 3, 'HUD blossom cradle action must record the full cradle party.');
  assert(Array.isArray(snapshot.state.blossomCradleCareIds) && snapshot.state.blossomCradleCareIds.length === 3, 'HUD blossom cradle action must record every cared spirit.');
  assert(Array.isArray(snapshot.state.blossomCradleMilestoneLabels) && snapshot.state.blossomCradleMilestoneLabels.length === 3, 'HUD blossom cradle action must record three raising milestones.');
  assert(snapshot.state.blossomCradleTotalBond >= 15, 'HUD blossom cradle action must record enough full-roster bond proof.');
  assert(snapshot.state.blossomCradleRibbonClaimed === true, 'HUD blossom cradle action must mark the no-real-value cradle ribbon proof.');
  assert(snapshot.provision.includes('Jade Court Provision Satchel'), 'HUD provision label must show the stocked no-real-value satchel.');
  assert(snapshot.state.provisionProof === true, 'HUD provision action must record provision satchel proof.');
  assert(snapshot.state.provisionSatchelId === 'jade-court-provision-satchel', 'HUD provision action must record the provision satchel id.');
  assert(snapshot.state.provisionSatchelName === 'Jade Court Provision Satchel', 'HUD provision action must record the provision satchel name.');
  assert(snapshot.state.provisionScore >= 27, 'HUD provision action must record a passing provision score.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('jade-thread-charm'), 'HUD provision action must stock the Jade Thread Charm.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('lantern-harmony-tea'), 'HUD provision action must stock Lantern Harmony Tea.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('jade-mooncake-box'), 'HUD provision action must stock the Jade Mooncake Box.');
  assert(snapshot.state.provisionSatchelClaimed === true, 'HUD provision action must mark the no-real-value satchel proof.');
  assert(snapshot.careCycle.includes('Jade Court Care Cycle'), 'HUD care cycle label must show the completed full-roster care proof.');
  assert(snapshot.state.careCycleProof === true, 'HUD care cycle action must record full-roster care proof.');
  assert(snapshot.state.careCycleId === 'jade-court-care-cycle', 'HUD care cycle action must record the care cycle id.');
  assert(snapshot.state.careCycleName === 'Jade Court Care Cycle', 'HUD care cycle action must record the care cycle name.');
  assert(snapshot.state.careCycleScore >= 32, 'HUD care cycle action must record a passing care cycle score.');
  assert(snapshot.state.careCycleRequiredScore === 32, 'HUD care cycle action must record the care cycle requirement.');
  assert(Array.isArray(snapshot.state.careCycleCaredSpiritIds) && snapshot.state.careCycleCaredSpiritIds.length === 3, 'HUD care cycle action must record every cared spirit.');
  assert(snapshot.state.careCycleTotalBond >= 9, 'HUD care cycle action must record enough full-roster bond proof.');
  assert(snapshot.state.careCycleKnotClaimed === true, 'HUD care cycle action must mark the no-real-value care cycle knot proof.');
  assert(snapshot.temperament.includes('Jade Temperament Concord'), 'HUD temperament label must show the completed temperament proof.');
  assert(snapshot.state.temperamentConcordProof === true, 'HUD temperament action must record temperament concord proof.');
  assert(snapshot.state.temperamentConcordId === 'jade-temperament-concord', 'HUD temperament action must record the temperament concord id.');
  assert(snapshot.state.temperamentConcordName === 'Jade Temperament Concord', 'HUD temperament action must record the temperament concord name.');
  assert(snapshot.state.temperamentConcordScore >= 36, 'HUD temperament action must record a passing temperament score.');
  assert(snapshot.state.temperamentConcordRequiredScore === 36, 'HUD temperament action must record the temperament requirement.');
  assert(Array.isArray(snapshot.state.temperamentConcordLabels) && snapshot.state.temperamentConcordLabels.includes('gentle'), 'HUD temperament action must record Lirabao temperament.');
  assert(Array.isArray(snapshot.state.temperamentConcordLabels) && snapshot.state.temperamentConcordLabels.includes('bright'), 'HUD temperament action must record Jintari temperament.');
  assert(Array.isArray(snapshot.state.temperamentConcordLabels) && snapshot.state.temperamentConcordLabels.includes('curious'), 'HUD temperament action must record Aozhen temperament.');
  assert(snapshot.state.temperamentConcordTotalBond >= 9, 'HUD temperament action must record enough full-roster bond proof.');
  assert(snapshot.state.temperamentCharmClaimed === true, 'HUD temperament action must mark the no-real-value temperament charm proof.');
  assert(snapshot.fieldAlmanac.includes('Jade Field Almanac'), 'HUD almanac label must show the completed field almanac proof.');
  assert(snapshot.state.fieldAlmanacProof === true, 'HUD almanac action must record field almanac proof.');
  assert(snapshot.state.fieldAlmanacId === 'jade-field-almanac', 'HUD almanac action must record the field almanac id.');
  assert(snapshot.state.fieldAlmanacName === 'Jade Field Almanac', 'HUD almanac action must record the field almanac name.');
  assert(snapshot.state.fieldAlmanacScore >= 38, 'HUD almanac action must record a passing field almanac score.');
  assert(snapshot.state.fieldAlmanacRequiredScore === 38, 'HUD almanac action must record the field almanac requirement.');
  assert(Array.isArray(snapshot.state.fieldAlmanacRouteIds) && snapshot.state.fieldAlmanacRouteIds.includes('moonbridge-bamboo-trail'), 'HUD almanac action must record the Moonbridge route.');
  assert(Array.isArray(snapshot.state.fieldAlmanacRouteIds) && snapshot.state.fieldAlmanacRouteIds.includes('cloudbell-reed-bank'), 'HUD almanac action must record the Cloudbell route.');
  assert(Array.isArray(snapshot.state.fieldAlmanacSpeciesIds) && snapshot.state.fieldAlmanacSpeciesIds.includes('lirabao'), 'HUD almanac action must record Lirabao.');
  assert(Array.isArray(snapshot.state.fieldAlmanacSpeciesIds) && snapshot.state.fieldAlmanacSpeciesIds.includes('jintari'), 'HUD almanac action must record Jintari.');
  assert(Array.isArray(snapshot.state.fieldAlmanacSpeciesIds) && snapshot.state.fieldAlmanacSpeciesIds.includes('aozhen'), 'HUD almanac action must record Aozhen.');
  assert(snapshot.state.fieldAlmanacClaspClaimed === true, 'HUD almanac action must mark the no-real-value almanac clasp proof.');
  assert(snapshot.routeEcology.includes('Jade Route Ecology Survey'), 'HUD ecology label must show the completed route ecology proof.');
  assert(snapshot.state.routeEcologyProof === true, 'HUD ecology action must record route ecology proof.');
  assert(snapshot.state.routeEcologyId === 'jade-route-ecology-survey', 'HUD ecology action must record the route ecology survey id.');
  assert(snapshot.state.routeEcologyName === 'Jade Route Ecology Survey', 'HUD ecology action must record the route ecology survey name.');
  assert(snapshot.state.routeEcologyScore >= 42, 'HUD ecology action must record a passing route ecology score.');
  assert(snapshot.state.routeEcologyRequiredScore === 42, 'HUD ecology action must record the route ecology requirement.');
  assert(Array.isArray(snapshot.state.routeEcologyRouteIds) && snapshot.state.routeEcologyRouteIds.includes('moonbridge-bamboo-trail'), 'HUD ecology action must record the Moonbridge route.');
  assert(Array.isArray(snapshot.state.routeEcologyRouteIds) && snapshot.state.routeEcologyRouteIds.includes('cloudbell-reed-bank'), 'HUD ecology action must record the Cloudbell route.');
  assert(Array.isArray(snapshot.state.routeEcologySpeciesIds) && snapshot.state.routeEcologySpeciesIds.includes('lirabao'), 'HUD ecology action must record Lirabao.');
  assert(Array.isArray(snapshot.state.routeEcologySpeciesIds) && snapshot.state.routeEcologySpeciesIds.includes('jintari'), 'HUD ecology action must record Jintari.');
  assert(Array.isArray(snapshot.state.routeEcologySpeciesIds) && snapshot.state.routeEcologySpeciesIds.includes('aozhen'), 'HUD ecology action must record Aozhen.');
  assert(Array.isArray(snapshot.state.routeEcologyInvitedSpiritIds) && snapshot.state.routeEcologyInvitedSpiritIds.includes('jintari'), 'HUD ecology action must record Jintari route invitation proof.');
  assert(Array.isArray(snapshot.state.routeEcologyInvitedSpiritIds) && snapshot.state.routeEcologyInvitedSpiritIds.includes('aozhen'), 'HUD ecology action must record Aozhen route invitation proof.');
  assert(snapshot.state.routeEcologyMapClaimed === true, 'HUD ecology action must mark the no-real-value ecology map proof.');
  assert(snapshot.weatherVeil.includes('Jade Weather Veil'), 'HUD weather veil label must show the completed weather veil.');
  assert(snapshot.state.weatherVeilProof === true, 'HUD weather veil action must record weather veil proof.');
  assert(snapshot.state.weatherVeilId === 'jade-weather-veil', 'HUD weather veil action must record the weather veil id.');
  assert(snapshot.state.weatherVeilName === 'Jade Weather Veil', 'HUD weather veil action must record the weather veil name.');
  assert(snapshot.state.weatherVeilScore >= 36, 'HUD weather veil action must record a passing weather veil score.');
  assert(snapshot.state.weatherVeilRequiredScore === 36, 'HUD weather veil action must record the weather veil requirement.');
  assert(Array.isArray(snapshot.state.weatherVeilRouteIds) && snapshot.state.weatherVeilRouteIds.includes('moonbridge-bamboo-trail'), 'HUD weather veil action must preserve the Moonbridge route.');
  assert(Array.isArray(snapshot.state.weatherVeilRouteIds) && snapshot.state.weatherVeilRouteIds.includes('cloudbell-reed-bank'), 'HUD weather veil action must preserve the Cloudbell route.');
  assert(Array.isArray(snapshot.state.weatherVeilConditionIds) && snapshot.state.weatherVeilConditionIds.includes('moonlit-mist'), 'HUD weather veil action must preserve moonlit mist proof.');
  assert(Array.isArray(snapshot.state.weatherVeilConditionIds) && snapshot.state.weatherVeilConditionIds.includes('goldleaf-rain'), 'HUD weather veil action must preserve goldleaf rain proof.');
  assert(Array.isArray(snapshot.state.weatherVeilConditionIds) && snapshot.state.weatherVeilConditionIds.includes('skybell-crosswind'), 'HUD weather veil action must preserve skybell crosswind proof.');
  assert(Array.isArray(snapshot.state.weatherVeilWindows) && snapshot.state.weatherVeilWindows.length >= 2, 'HUD weather veil action must preserve route condition window proof.');
  assert(snapshot.state.weatherVeilChartClaimed === true, 'HUD weather veil action must mark the no-real-value weather veil chart proof.');
  assert(snapshot.craftWrit.includes('Jade Court Craft Writ'), 'HUD craft label must show the completed no-real-value craft writ.');
  assert(snapshot.state.craftWritProof === true, 'HUD craft action must record craft writ proof.');
  assert(snapshot.state.craftWritId === 'jade-court-craft-writ', 'HUD craft action must record the craft writ id.');
  assert(snapshot.state.craftWritName === 'Jade Court Craft Writ', 'HUD craft action must record the craft writ name.');
  assert(snapshot.state.craftWritScore >= 44, 'HUD craft action must record a passing craft writ score.');
  assert(snapshot.state.craftWritRequiredScore === 44, 'HUD craft action must record the craft writ requirement.');
  assert(Array.isArray(snapshot.state.craftWritRecipeIds) && snapshot.state.craftWritRecipeIds.includes('lantern-tea-threading'), 'HUD craft action must record the lantern tea recipe.');
  assert(Array.isArray(snapshot.state.craftWritRecipeIds) && snapshot.state.craftWritRecipeIds.includes('moonbridge-provision-wrap'), 'HUD craft action must record the Moonbridge provision recipe.');
  assert(Array.isArray(snapshot.state.craftWritStockItemIds) && snapshot.state.craftWritStockItemIds.includes('jade-thread-charm'), 'HUD craft action must record the Jade Thread Charm stock.');
  assert(Array.isArray(snapshot.state.craftWritStockItemIds) && snapshot.state.craftWritStockItemIds.includes('lantern-harmony-tea'), 'HUD craft action must record Lantern Harmony Tea stock.');
  assert(Array.isArray(snapshot.state.craftWritStockItemIds) && snapshot.state.craftWritStockItemIds.includes('jade-mooncake-box'), 'HUD craft action must record Jade Mooncake Box stock.');
  assert(snapshot.state.craftWritClaimed === true, 'HUD craft action must mark the no-real-value craft writ proof.');
  assert(snapshot.exchangeAccord.includes('Jade Exchange Accord'), 'HUD exchange label must show the completed no-real-value exchange accord.');
  assert(snapshot.state.exchangeAccordProof === true, 'HUD exchange action must record exchange accord proof.');
  assert(snapshot.state.exchangeAccordId === 'jade-exchange-accord', 'HUD exchange action must record the exchange accord id.');
  assert(snapshot.state.exchangeAccordName === 'Jade Exchange Accord', 'HUD exchange action must record the exchange accord name.');
  assert(snapshot.state.exchangeAccordScore >= 34, 'HUD exchange action must record a passing exchange accord score.');
  assert(snapshot.state.exchangeAccordRequiredScore === 34, 'HUD exchange action must record the exchange accord requirement.');
  assert(Array.isArray(snapshot.state.exchangeAccordItemIds) && snapshot.state.exchangeAccordItemIds.includes('jade-thread-charm'), 'HUD exchange action must record the Jade Thread Charm exchange item.');
  assert(Array.isArray(snapshot.state.exchangeAccordItemIds) && snapshot.state.exchangeAccordItemIds.includes('lantern-harmony-tea'), 'HUD exchange action must record Lantern Harmony Tea exchange item.');
  assert(Array.isArray(snapshot.state.exchangeAccordItemIds) && snapshot.state.exchangeAccordItemIds.includes('jade-mooncake-box'), 'HUD exchange action must record Jade Mooncake Box exchange item.');
  assert(snapshot.state.exchangeAccordPresenceCount >= 2, 'HUD exchange action must record two local tester presences.');
  assert(snapshot.state.exchangeAccordTallyClaimed === true, 'HUD exchange action must mark the no-real-value accord tally proof.');
  assert(snapshot.routeWaystone.includes('Jade Cloudbell Waystone'), 'HUD waystone label must show the completed route waystone proof.');
  assert(snapshot.state.routeWaystoneProof === true, 'HUD waystone action must record route waystone proof.');
  assert(snapshot.state.routeWaystoneId === 'jade-cloudbell-waystone', 'HUD waystone action must record the route waystone id.');
  assert(snapshot.state.routeWaystoneName === 'Jade Cloudbell Waystone', 'HUD waystone action must record the route waystone name.');
  assert(snapshot.state.routeWaystoneScore >= 30, 'HUD waystone action must record a passing route waystone score.');
  assert(snapshot.state.routeWaystoneRequiredScore === 30, 'HUD waystone action must record the route waystone requirement.');
  assert(Array.isArray(snapshot.state.routeWaystoneRouteIds) && snapshot.state.routeWaystoneRouteIds.includes('moonbridge-bamboo-trail'), 'HUD waystone action must record the Moonbridge route.');
  assert(Array.isArray(snapshot.state.routeWaystoneRouteIds) && snapshot.state.routeWaystoneRouteIds.includes('cloudbell-reed-bank'), 'HUD waystone action must record the Cloudbell route.');
  assert(Array.isArray(snapshot.state.routeWaystoneInvitedSpiritIds) && snapshot.state.routeWaystoneInvitedSpiritIds.includes('jintari'), 'HUD waystone action must record Jintari route invitation proof.');
  assert(Array.isArray(snapshot.state.routeWaystoneInvitedSpiritIds) && snapshot.state.routeWaystoneInvitedSpiritIds.includes('aozhen'), 'HUD waystone action must record Aozhen route invitation proof.');
  assert(snapshot.state.routeWaystoneSealClaimed === true, 'HUD waystone action must mark the no-real-value waystone travel seal proof.');
  assert(snapshot.routeCharter.includes('Jade Route Charter'), 'HUD charter label must show the completed route charter proof.');
  assert(snapshot.state.routeCharterProof === true, 'HUD charter action must record route charter proof.');
  assert(snapshot.state.routeCharterId === 'jade-route-charter', 'HUD charter action must record the route charter id.');
  assert(snapshot.state.routeCharterName === 'Jade Route Charter', 'HUD charter action must record the route charter name.');
  assert(snapshot.state.routeCharterScore >= 40, 'HUD charter action must record a passing route charter score.');
  assert(snapshot.state.routeCharterRequiredScore === 40, 'HUD charter action must record the route charter requirement.');
  assert(Array.isArray(snapshot.state.routeCharterRouteIds) && snapshot.state.routeCharterRouteIds.includes('moonbridge-bamboo-trail'), 'HUD charter action must record the Moonbridge route.');
  assert(Array.isArray(snapshot.state.routeCharterRouteIds) && snapshot.state.routeCharterRouteIds.includes('cloudbell-reed-bank'), 'HUD charter action must record the Cloudbell route.');
  assert(Array.isArray(snapshot.state.routeCharterPartyIds) && snapshot.state.routeCharterPartyIds.includes('lirabao'), 'HUD charter action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.routeCharterPartyIds) && snapshot.state.routeCharterPartyIds.includes('jintari'), 'HUD charter action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.routeCharterPartyIds) && snapshot.state.routeCharterPartyIds.includes('aozhen'), 'HUD charter action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.routeCharterProofIds) && snapshot.state.routeCharterProofIds.includes('jade-cloudbell-waystone'), 'HUD charter action must record waystone prerequisite proof.');
  assert(snapshot.state.routeCharterPresenceCount >= 2, 'HUD charter action must record two local tester presences.');
  assert(snapshot.state.routeCharterSlipClaimed === true, 'HUD charter action must mark the no-real-value route charter slip proof.');
  assert(snapshot.nurtureRite.includes('Jade Moonwell Nurture Rite'), 'HUD nurture label must show the completed no-real-value nurture rite.');
  assert(snapshot.state.nurtureRiteProof === true, 'HUD nurture action must record nurture rite proof.');
  assert(snapshot.state.nurtureRiteId === 'jade-moonwell-nurture-rite', 'HUD nurture action must record the nurture rite id.');
  assert(snapshot.state.nurtureRiteName === 'Jade Moonwell Nurture Rite', 'HUD nurture action must record the nurture rite name.');
  assert(snapshot.state.nurtureRiteScore >= 40, 'HUD nurture action must record a passing nurture rite score.');
  assert(snapshot.state.nurtureRiteRequiredScore === 40, 'HUD nurture action must record the nurture rite requirement.');
  assert(Array.isArray(snapshot.state.nurtureRiteRosterIds) && snapshot.state.nurtureRiteRosterIds.includes('lirabao'), 'HUD nurture action must record Lirabao roster proof.');
  assert(Array.isArray(snapshot.state.nurtureRiteRosterIds) && snapshot.state.nurtureRiteRosterIds.includes('jintari'), 'HUD nurture action must record Jintari roster proof.');
  assert(Array.isArray(snapshot.state.nurtureRiteRosterIds) && snapshot.state.nurtureRiteRosterIds.includes('aozhen'), 'HUD nurture action must record Aozhen roster proof.');
  assert(Array.isArray(snapshot.state.nurtureRiteCaredSpiritIds) && snapshot.state.nurtureRiteCaredSpiritIds.includes('lirabao'), 'HUD nurture action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.nurtureRiteCaredSpiritIds) && snapshot.state.nurtureRiteCaredSpiritIds.includes('jintari'), 'HUD nurture action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.nurtureRiteCaredSpiritIds) && snapshot.state.nurtureRiteCaredSpiritIds.includes('aozhen'), 'HUD nurture action must record Aozhen care proof.');
  assert(snapshot.state.nurtureRibbonClaimed === true, 'HUD nurture action must mark the no-real-value nurture ribbon proof.');
  assert(snapshot.recoveryTea.includes('Jade Teahouse Recovery'), 'HUD recovery label must show the completed no-real-value recovery tea proof.');
  assert(snapshot.state.recoveryTeaProof === true, 'HUD recovery action must record recovery tea proof.');
  assert(snapshot.state.recoveryTeaId === 'jade-teahouse-recovery', 'HUD recovery action must record the recovery tea id.');
  assert(snapshot.state.recoveryTeaName === 'Jade Teahouse Recovery', 'HUD recovery action must record the recovery tea name.');
  assert(snapshot.state.recoveryTeaScore >= 36, 'HUD recovery action must record a passing recovery tea score.');
  assert(snapshot.state.recoveryTeaRequiredScore === 36, 'HUD recovery action must record the recovery tea requirement.');
  assert(Array.isArray(snapshot.state.recoveryTeaPartyIds) && snapshot.state.recoveryTeaPartyIds.includes('lirabao'), 'HUD recovery action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.recoveryTeaPartyIds) && snapshot.state.recoveryTeaPartyIds.includes('jintari'), 'HUD recovery action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.recoveryTeaPartyIds) && snapshot.state.recoveryTeaPartyIds.includes('aozhen'), 'HUD recovery action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.recoveryTeaCaredSpiritIds) && snapshot.state.recoveryTeaCaredSpiritIds.includes('lirabao'), 'HUD recovery action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.recoveryTeaCaredSpiritIds) && snapshot.state.recoveryTeaCaredSpiritIds.includes('jintari'), 'HUD recovery action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.recoveryTeaCaredSpiritIds) && snapshot.state.recoveryTeaCaredSpiritIds.includes('aozhen'), 'HUD recovery action must record Aozhen care proof.');
  assert(snapshot.state.recoveryTeaCupClaimed === true, 'HUD recovery action must mark the no-real-value recovery cup proof.');
  assert(snapshot.kinship.includes('Jade Kinship Album'), 'HUD kinship label must show the completed no-real-value kinship album.');
  assert(snapshot.state.kinshipAlbumProof === true, 'HUD kinship action must record kinship album proof.');
  assert(snapshot.state.kinshipAlbumId === 'jade-kinship-album', 'HUD kinship action must record the kinship album id.');
  assert(snapshot.state.kinshipAlbumName === 'Jade Kinship Album', 'HUD kinship action must record the kinship album name.');
  assert(snapshot.state.kinshipAlbumScore >= 38, 'HUD kinship action must record a passing album score.');
  assert(snapshot.state.kinshipAlbumRequiredScore === 38, 'HUD kinship action must record the album requirement.');
  assert(Array.isArray(snapshot.state.kinshipAlbumSpiritIds) && snapshot.state.kinshipAlbumSpiritIds.includes('lirabao'), 'HUD kinship action must record Lirabao roster proof.');
  assert(Array.isArray(snapshot.state.kinshipAlbumSpiritIds) && snapshot.state.kinshipAlbumSpiritIds.includes('jintari'), 'HUD kinship action must record Jintari roster proof.');
  assert(Array.isArray(snapshot.state.kinshipAlbumSpiritIds) && snapshot.state.kinshipAlbumSpiritIds.includes('aozhen'), 'HUD kinship action must record Aozhen roster proof.');
  assert(Array.isArray(snapshot.state.kinshipAlbumCaredSpiritIds) && snapshot.state.kinshipAlbumCaredSpiritIds.includes('lirabao'), 'HUD kinship action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.kinshipAlbumCaredSpiritIds) && snapshot.state.kinshipAlbumCaredSpiritIds.includes('jintari'), 'HUD kinship action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.kinshipAlbumCaredSpiritIds) && snapshot.state.kinshipAlbumCaredSpiritIds.includes('aozhen'), 'HUD kinship action must record Aozhen care proof.');
  assert(snapshot.state.kinshipAlbumTotalBond >= 15, 'HUD kinship action must record full-roster bond proof.');
  assert(snapshot.state.kinshipAlbumClaimed === true, 'HUD kinship action must mark the no-real-value kinship album proof.');
  assert(snapshot.nursery.includes('Jade Nursery Grove'), 'HUD nursery label must show the completed no-real-value nursery proof.');
  assert(snapshot.state.nurseryGroveProof === true, 'HUD nursery action must record nursery grove proof.');
  assert(snapshot.state.nurseryGroveId === 'jade-nursery-grove', 'HUD nursery action must record the nursery grove id.');
  assert(snapshot.state.nurseryGroveName === 'Jade Nursery Grove', 'HUD nursery action must record the nursery grove name.');
  assert(snapshot.state.nurseryGroveScore >= 52, 'HUD nursery action must record a passing nursery score.');
  assert(snapshot.state.nurseryGroveRequiredScore === 52, 'HUD nursery action must record the nursery requirement.');
  assert(Array.isArray(snapshot.state.nurseryGroveSpiritIds) && snapshot.state.nurseryGroveSpiritIds.includes('lirabao'), 'HUD nursery action must record Lirabao roster proof.');
  assert(Array.isArray(snapshot.state.nurseryGroveSpiritIds) && snapshot.state.nurseryGroveSpiritIds.includes('jintari'), 'HUD nursery action must record Jintari roster proof.');
  assert(Array.isArray(snapshot.state.nurseryGroveSpiritIds) && snapshot.state.nurseryGroveSpiritIds.includes('aozhen'), 'HUD nursery action must record Aozhen roster proof.');
  assert(Array.isArray(snapshot.state.nurseryGrovePartyIds) && snapshot.state.nurseryGrovePartyIds.includes('lirabao'), 'HUD nursery action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.nurseryGrovePartyIds) && snapshot.state.nurseryGrovePartyIds.includes('jintari'), 'HUD nursery action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.nurseryGrovePartyIds) && snapshot.state.nurseryGrovePartyIds.includes('aozhen'), 'HUD nursery action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.nurseryGroveCaredSpiritIds) && snapshot.state.nurseryGroveCaredSpiritIds.includes('lirabao'), 'HUD nursery action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.nurseryGroveCaredSpiritIds) && snapshot.state.nurseryGroveCaredSpiritIds.includes('jintari'), 'HUD nursery action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.nurseryGroveCaredSpiritIds) && snapshot.state.nurseryGroveCaredSpiritIds.includes('aozhen'), 'HUD nursery action must record Aozhen care proof.');
  assert(snapshot.state.nurseryGroveTotalBond >= 15, 'HUD nursery action must record full-roster bond proof.');
  assert(snapshot.state.nurserySproutClaimed === true, 'HUD nursery action must mark the no-real-value nursery sprout proof.');
  assert(snapshot.bloomAscendance.includes('Jade Bloom Ascendance'), 'HUD bloom ascendance label must show the completed no-real-value form proof.');
  assert(snapshot.state.bloomAscendanceProof === true, 'HUD bloom ascendance action must record ascendance proof.');
  assert(snapshot.state.bloomAscendanceId === 'jade-bloom-ascendance', 'HUD bloom ascendance action must record the ascendance id.');
  assert(snapshot.state.bloomAscendanceName === 'Jade Bloom Ascendance', 'HUD bloom ascendance action must record the ascendance name.');
  assert(snapshot.state.bloomAscendanceFormTitle === 'Jade Bloom Form', 'HUD bloom ascendance action must record the form title.');
  assert(snapshot.state.bloomAscendanceScore >= 58, 'HUD bloom ascendance action must record a passing ascendance score.');
  assert(snapshot.state.bloomAscendanceRequiredScore === 58, 'HUD bloom ascendance action must record the ascendance requirement.');
  assert(Array.isArray(snapshot.state.bloomAscendanceSpiritIds) && snapshot.state.bloomAscendanceSpiritIds.includes('lirabao'), 'HUD bloom ascendance action must record Lirabao roster proof.');
  assert(Array.isArray(snapshot.state.bloomAscendanceSpiritIds) && snapshot.state.bloomAscendanceSpiritIds.includes('jintari'), 'HUD bloom ascendance action must record Jintari roster proof.');
  assert(Array.isArray(snapshot.state.bloomAscendanceSpiritIds) && snapshot.state.bloomAscendanceSpiritIds.includes('aozhen'), 'HUD bloom ascendance action must record Aozhen roster proof.');
  assert(Array.isArray(snapshot.state.bloomAscendancePartyIds) && snapshot.state.bloomAscendancePartyIds.includes('lirabao'), 'HUD bloom ascendance action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.bloomAscendancePartyIds) && snapshot.state.bloomAscendancePartyIds.includes('jintari'), 'HUD bloom ascendance action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.bloomAscendancePartyIds) && snapshot.state.bloomAscendancePartyIds.includes('aozhen'), 'HUD bloom ascendance action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.bloomAscendanceCaredSpiritIds) && snapshot.state.bloomAscendanceCaredSpiritIds.includes('lirabao'), 'HUD bloom ascendance action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.bloomAscendanceCaredSpiritIds) && snapshot.state.bloomAscendanceCaredSpiritIds.includes('jintari'), 'HUD bloom ascendance action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.bloomAscendanceCaredSpiritIds) && snapshot.state.bloomAscendanceCaredSpiritIds.includes('aozhen'), 'HUD bloom ascendance action must record Aozhen care proof.');
  assert(snapshot.state.bloomAscendanceTotalBond >= 15, 'HUD bloom ascendance action must record full-roster bond proof.');
  assert(snapshot.state.bloomAscendanceSigilClaimed === true, 'HUD bloom ascendance action must mark the no-real-value ascendance sigil proof.');
  assert(snapshot.lineageRegister.includes('Jade Lineage Register'), 'HUD lineage register label must show the completed no-real-value lineage record.');
  assert(snapshot.state.lineageRegisterProof === true, 'HUD lineage register action must record lineage proof.');
  assert(snapshot.state.lineageRegisterId === 'jade-lineage-register', 'HUD lineage register action must record the register id.');
  assert(snapshot.state.lineageRegisterName === 'Jade Lineage Register', 'HUD lineage register action must record the register name.');
  assert(snapshot.state.lineageRegisterScore >= 60, 'HUD lineage register action must record a passing register score.');
  assert(snapshot.state.lineageRegisterRequiredScore === 60, 'HUD lineage register action must record the register requirement.');
  assert(Array.isArray(snapshot.state.lineageRegisterSpiritIds) && snapshot.state.lineageRegisterSpiritIds.includes('lirabao'), 'HUD lineage register action must record Lirabao roster proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterSpiritIds) && snapshot.state.lineageRegisterSpiritIds.includes('jintari'), 'HUD lineage register action must record Jintari roster proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterSpiritIds) && snapshot.state.lineageRegisterSpiritIds.includes('aozhen'), 'HUD lineage register action must record Aozhen roster proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterPartyIds) && snapshot.state.lineageRegisterPartyIds.includes('lirabao'), 'HUD lineage register action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterPartyIds) && snapshot.state.lineageRegisterPartyIds.includes('jintari'), 'HUD lineage register action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterPartyIds) && snapshot.state.lineageRegisterPartyIds.includes('aozhen'), 'HUD lineage register action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterCaredSpiritIds) && snapshot.state.lineageRegisterCaredSpiritIds.includes('lirabao'), 'HUD lineage register action must record Lirabao care proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterCaredSpiritIds) && snapshot.state.lineageRegisterCaredSpiritIds.includes('jintari'), 'HUD lineage register action must record Jintari care proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterCaredSpiritIds) && snapshot.state.lineageRegisterCaredSpiritIds.includes('aozhen'), 'HUD lineage register action must record Aozhen care proof.');
  assert(Array.isArray(snapshot.state.lineageRegisterMilestoneLabels) && snapshot.state.lineageRegisterMilestoneLabels.includes('Moonwell Bloom Form'), 'HUD lineage register action must record the raising milestone label.');
  assert(snapshot.state.lineageRegisterSealClaimed === true, 'HUD lineage register action must mark the no-real-value lineage seal proof.');
  assert(snapshot.dojoLadder.includes('Jade Dojo Ladder'), 'HUD dojo ladder label must show the cleared no-injury dojo ladder.');
  assert(snapshot.state.dojoLadderProof === true, 'HUD dojo ladder action must record dojo ladder proof.');
  assert(snapshot.state.dojoLadderId === 'jade-dojo-ladder', 'HUD dojo ladder action must record the dojo ladder id.');
  assert(snapshot.state.dojoLadderName === 'Jade Dojo Ladder', 'HUD dojo ladder action must record the dojo ladder name.');
  assert(snapshot.state.dojoLadderScore >= 44, 'HUD dojo ladder action must record a passing dojo ladder score.');
  assert(snapshot.state.dojoLadderRequiredScore === 44, 'HUD dojo ladder action must record the dojo ladder requirement.');
  assert(Array.isArray(snapshot.state.dojoLadderPartyIds) && snapshot.state.dojoLadderPartyIds.includes('lirabao'), 'HUD dojo ladder action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.dojoLadderPartyIds) && snapshot.state.dojoLadderPartyIds.includes('jintari'), 'HUD dojo ladder action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.dojoLadderPartyIds) && snapshot.state.dojoLadderPartyIds.includes('aozhen'), 'HUD dojo ladder action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.dojoLadderOpponentIds) && snapshot.state.dojoLadderOpponentIds.includes('jade-echo-apprentice'), 'HUD dojo ladder action must record the Jade Echo Apprentice clear.');
  assert(Array.isArray(snapshot.state.dojoLadderOpponentIds) && snapshot.state.dojoLadderOpponentIds.includes('silk-river-disciple'), 'HUD dojo ladder action must record the Silk River Disciple clear.');
  assert(snapshot.state.dojoLadderSealClaimed === true, 'HUD dojo ladder action must mark the no-real-value dojo ladder seal proof.');
  assert(snapshot.tournament.includes('Jade Banner Tournament'), 'HUD tournament label must show the cleared no-injury battle bracket.');
  assert(snapshot.state.tournamentProof === true, 'HUD tournament action must record tournament proof.');
  assert(snapshot.state.tournamentId === 'jade-banner-tournament', 'HUD tournament action must record the tournament id.');
  assert(snapshot.state.tournamentName === 'Jade Banner Tournament', 'HUD tournament action must record the tournament name.');
  assert(snapshot.state.tournamentScore >= 38, 'HUD tournament action must record a passing tournament score.');
  assert(snapshot.state.tournamentRequiredScore === 38, 'HUD tournament action must record the tournament requirement.');
  assert(Array.isArray(snapshot.state.tournamentPartyIds) && snapshot.state.tournamentPartyIds.includes('lirabao'), 'HUD tournament action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.tournamentPartyIds) && snapshot.state.tournamentPartyIds.includes('jintari'), 'HUD tournament action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.tournamentPartyIds) && snapshot.state.tournamentPartyIds.includes('aozhen'), 'HUD tournament action must record Aozhen party proof.');
  assert(snapshot.state.tournamentPresenceCount >= 2, 'HUD tournament action must record two local tester presences.');
  assert(snapshot.state.tournamentPennantClaimed === true, 'HUD tournament action must mark the no-real-value tournament pennant proof.');
  assert(snapshot.rivalCircle.includes('Jade Rival Circle'), 'HUD rival label must show the cleared no-injury rival circle.');
  assert(snapshot.state.rivalCircleProof === true, 'HUD rival circle action must record rival circle proof.');
  assert(snapshot.state.rivalCircleId === 'jade-rival-circle', 'HUD rival circle action must record the rival circle id.');
  assert(snapshot.state.rivalCircleName === 'Jade Rival Circle', 'HUD rival circle action must record the rival circle name.');
  assert(snapshot.state.rivalCircleRivalName === 'Qinghei Banner Circle', 'HUD rival circle action must record the rival opponent name.');
  assert(snapshot.state.rivalCircleScore >= 46, 'HUD rival circle action must record a passing rival circle score.');
  assert(snapshot.state.rivalCircleRequiredScore === 46, 'HUD rival circle action must record the rival circle requirement.');
  assert(Array.isArray(snapshot.state.rivalCirclePartyIds) && snapshot.state.rivalCirclePartyIds.includes('lirabao'), 'HUD rival circle action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.rivalCirclePartyIds) && snapshot.state.rivalCirclePartyIds.includes('jintari'), 'HUD rival circle action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.rivalCirclePartyIds) && snapshot.state.rivalCirclePartyIds.includes('aozhen'), 'HUD rival circle action must record Aozhen party proof.');
  assert(snapshot.state.rivalCircleMarkClaimed === true, 'HUD rival circle action must mark the no-real-value rival circle mark proof.');
  assert(snapshot.sifuCouncil.includes('Jade Sifu Council'), 'HUD sifu council label must show the cleared no-injury guild-leader council.');
  assert(snapshot.state.sifuCouncilProof === true, 'HUD sifu council action must record sifu council proof.');
  assert(snapshot.state.sifuCouncilId === 'jade-sifu-council', 'HUD sifu council action must record the council id.');
  assert(snapshot.state.sifuCouncilName === 'Jade Sifu Council', 'HUD sifu council action must record the council name.');
  assert(snapshot.state.sifuCouncilScore >= 62, 'HUD sifu council action must record a passing council score.');
  assert(snapshot.state.sifuCouncilRequiredScore === 62, 'HUD sifu council action must record the council requirement.');
  assert(Array.isArray(snapshot.state.sifuCouncilPartyIds) && snapshot.state.sifuCouncilPartyIds.includes('lirabao'), 'HUD sifu council action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.sifuCouncilPartyIds) && snapshot.state.sifuCouncilPartyIds.includes('jintari'), 'HUD sifu council action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.sifuCouncilPartyIds) && snapshot.state.sifuCouncilPartyIds.includes('aozhen'), 'HUD sifu council action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.sifuCouncilMemberIds) && snapshot.state.sifuCouncilMemberIds.includes('sifu-narao'), 'HUD sifu council action must record Sifu Narao council proof.');
  assert(Array.isArray(snapshot.state.sifuCouncilMemberIds) && snapshot.state.sifuCouncilMemberIds.includes('warden-meilin'), 'HUD sifu council action must record Warden Meilin council proof.');
  assert(Array.isArray(snapshot.state.sifuCouncilMemberIds) && snapshot.state.sifuCouncilMemberIds.includes('keeper-haoran'), 'HUD sifu council action must record Keeper Haoran council proof.');
  assert(snapshot.state.sifuCouncilCrestClaimed === true, 'HUD sifu council action must mark the no-real-value sifu council crest proof.');
  assert(snapshot.summitCircuit.includes('Jade Summit Circuit'), 'HUD summit circuit label must show the cleared no-injury summit circuit.');
  assert(snapshot.state.summitCircuitProof === true, 'HUD summit circuit action must record summit circuit proof.');
  assert(snapshot.state.summitCircuitId === 'jade-summit-circuit', 'HUD summit circuit action must record the circuit id.');
  assert(snapshot.state.summitCircuitName === 'Jade Summit Circuit', 'HUD summit circuit action must record the circuit name.');
  assert(snapshot.state.summitCircuitScore >= 80, 'HUD summit circuit action must record a passing summit score.');
  assert(snapshot.state.summitCircuitRequiredScore === 80, 'HUD summit circuit action must record the summit requirement.');
  assert(Array.isArray(snapshot.state.summitCircuitPartyIds) && snapshot.state.summitCircuitPartyIds.includes('lirabao'), 'HUD summit circuit action must record Lirabao party proof.');
  assert(Array.isArray(snapshot.state.summitCircuitPartyIds) && snapshot.state.summitCircuitPartyIds.includes('jintari'), 'HUD summit circuit action must record Jintari party proof.');
  assert(Array.isArray(snapshot.state.summitCircuitPartyIds) && snapshot.state.summitCircuitPartyIds.includes('aozhen'), 'HUD summit circuit action must record Aozhen party proof.');
  assert(Array.isArray(snapshot.state.summitCircuitSealIds) && snapshot.state.summitCircuitSealIds.includes('jade-dojo-seal'), 'HUD summit circuit action must record dojo seal proof.');
  assert(Array.isArray(snapshot.state.summitCircuitSealIds) && snapshot.state.summitCircuitSealIds.includes('banner-ring-seal'), 'HUD summit circuit action must record tournament seal proof.');
  assert(Array.isArray(snapshot.state.summitCircuitSealIds) && snapshot.state.summitCircuitSealIds.includes('qinghei-rival-seal'), 'HUD summit circuit action must record rival seal proof.');
  assert(Array.isArray(snapshot.state.summitCircuitSealIds) && snapshot.state.summitCircuitSealIds.includes('sifu-council-seal'), 'HUD summit circuit action must record council seal proof.');
  assert(snapshot.state.summitCircuitLaurelClaimed === true, 'HUD summit circuit action must mark the no-real-value summit laurel proof.');
  assert(snapshot.commission.includes('Jade Court Commission Ledger'), 'HUD commission label must show the completed no-real-value guild commission.');
  assert(snapshot.state.commissionProof === true, 'HUD commission action must record commission proof.');
  assert(snapshot.state.commissionId === 'jade-court-commission-ledger', 'HUD commission action must record the commission id.');
  assert(snapshot.state.commissionName === 'Jade Court Commission Ledger', 'HUD commission action must record the commission name.');
  assert(snapshot.state.commissionScore >= 24, 'HUD commission action must record a passing commission score.');
  assert(snapshot.state.commissionKnotClaimed === true, 'HUD commission action must mark the no-real-value commission knot proof.');
  assert(snapshot.rally.includes('Jade Courtyard Rally'), 'HUD rally label must show the completed two-tester guild rally.');
  assert(snapshot.state.emoteProof === true, 'HUD rally action must include a prior local emote proof.');
  assert(snapshot.state.rallyProof === true, 'HUD rally action must record two-tester rally proof.');
  assert(snapshot.state.rallyId === 'jade-courtyard-rally', 'HUD rally action must record the Jade Courtyard Rally id.');
  assert(snapshot.state.rallyName === 'Jade Courtyard Rally', 'HUD rally action must record the Jade Courtyard Rally name.');
  assert(snapshot.state.rallyScore >= 22, 'HUD rally action must record a passing rally score.');
  assert(snapshot.state.rallyPresenceCount >= 2, 'HUD rally action must record two local tester presences.');
  assert(snapshot.state.rallyKnotClaimed === true, 'HUD rally action must mark the no-real-value rally knot proof.');
  assert(snapshot.questLedger.includes('Jade Quest Ledger'), 'HUD quest ledger label must show the completed no-real-value quest ledger.');
  assert(snapshot.state.questLedgerProof === true, 'HUD quest ledger action must record quest ledger proof.');
  assert(snapshot.state.questLedgerId === 'jade-quest-ledger', 'HUD quest ledger action must record the Jade Quest Ledger id.');
  assert(snapshot.state.questLedgerName === 'Jade Quest Ledger', 'HUD quest ledger action must record the Jade Quest Ledger name.');
  assert(snapshot.state.questLedgerScore >= 40, 'HUD quest ledger action must record a passing ledger score.');
  assert(snapshot.state.questLedgerRequiredScore === 40, 'HUD quest ledger action must record the ledger score requirement.');
  assert(Array.isArray(snapshot.state.questLedgerAcceptedQuestIds) && snapshot.state.questLedgerAcceptedQuestIds.length === 3, 'HUD quest ledger action must record all accepted quest ids.');
  assert(Array.isArray(snapshot.state.questLedgerCompletedQuestIds) && snapshot.state.questLedgerCompletedQuestIds.length === 3, 'HUD quest ledger action must record all completed quest ids.');
  assert(snapshot.state.questLedgerSealClaimed === true, 'HUD quest ledger action must mark the no-real-value quest ledger seal proof.');
  assert(snapshot.story.includes('Jade Scroll Story Chapter'), 'HUD story label must show the completed no-real-value roleplay chapter.');
  assert(snapshot.state.storyChapterProof === true, 'HUD story action must record story chapter proof.');
  assert(snapshot.state.storyChapterId === 'jade-scroll-story-chapter', 'HUD story action must record the Jade Scroll Story Chapter id.');
  assert(snapshot.state.storyChapterName === 'Jade Scroll Story Chapter', 'HUD story action must record the Jade Scroll Story Chapter name.');
  assert(snapshot.state.storyChapterScore >= 42, 'HUD story action must record a passing story score.');
  assert(snapshot.state.storyChapterRequiredScore === 42, 'HUD story action must record the story score requirement.');
  assert(Array.isArray(snapshot.state.storyChapterRouteIds) && snapshot.state.storyChapterRouteIds.includes('moonbridge-bamboo-trail'), 'HUD story action must record the Moonbridge route proof.');
  assert(Array.isArray(snapshot.state.storyChapterRouteIds) && snapshot.state.storyChapterRouteIds.includes('cloudbell-reed-bank'), 'HUD story action must record the Cloudbell route proof.');
  assert(Array.isArray(snapshot.state.storyChapterQuestIds) && snapshot.state.storyChapterQuestIds.length === 3, 'HUD story action must record all three quest proofs.');
  assert(snapshot.state.storyScrollClaimed === true, 'HUD story action must mark the no-real-value story scroll proof.');
  assert(snapshot.insignia.includes('Jade Insignia Case'), 'HUD insignia label must show the completed progression case.');
  assert(snapshot.state.insigniaCaseProof === true, 'HUD insignia action must record insignia case proof.');
  assert(snapshot.state.insigniaCaseId === 'jade-insignia-case', 'HUD insignia action must record the Jade Insignia Case id.');
  assert(snapshot.state.insigniaCaseName === 'Jade Insignia Case', 'HUD insignia action must record the Jade Insignia Case name.');
  assert(snapshot.state.insigniaCaseScore >= 34, 'HUD insignia action must record a passing insignia case score.');
  assert(snapshot.state.insigniaCaseRequiredScore === 34, 'HUD insignia action must record the insignia case requirement.');
  assert(Array.isArray(snapshot.state.insigniaCaseSpiritIds) && snapshot.state.insigniaCaseSpiritIds.includes('lirabao'), 'HUD insignia action must record Lirabao in the case roster.');
  assert(Array.isArray(snapshot.state.insigniaCaseSpiritIds) && snapshot.state.insigniaCaseSpiritIds.includes('jintari'), 'HUD insignia action must record Jintari in the case roster.');
  assert(Array.isArray(snapshot.state.insigniaCaseSpiritIds) && snapshot.state.insigniaCaseSpiritIds.includes('aozhen'), 'HUD insignia action must record Aozhen in the case roster.');
  assert(Array.isArray(snapshot.state.insigniaCasePartyIds) && snapshot.state.insigniaCasePartyIds.length === 3, 'HUD insignia action must record the full case party.');
  assert(snapshot.state.insigniaCaseClaimed === true, 'HUD insignia action must mark the no-real-value insignia case proof.');
  assert(snapshot.chronicle.includes('Jade Wayfarer Chronicle'), 'HUD chronicle label must show the completed first-court alpha chronicle.');
  assert(snapshot.state.wayfarerChronicleProof === true, 'HUD chronicle action must record first-court alpha chronicle proof.');
  assert(snapshot.state.wayfarerChronicleId === 'jade-wayfarer-chronicle', 'HUD chronicle action must record the Jade Wayfarer Chronicle id.');
  assert(snapshot.state.wayfarerChronicleName === 'Jade Wayfarer Chronicle', 'HUD chronicle action must record the Jade Wayfarer Chronicle name.');
  assert(snapshot.state.wayfarerChronicleScore >= 77, 'HUD chronicle action must record a passing chronicle score.');
  assert(snapshot.state.wayfarerChronicleRequiredScore === 77, 'HUD chronicle action must record the chronicle requirement.');
  assert(snapshot.state.wayfarerChronicleClaspClaimed === true, 'HUD chronicle action must mark the no-real-value chronicle clasp proof.');
  assert(snapshot.ascension.includes('Jade Court Ascension Trial'), 'HUD ascension label must show the completed guild capstone trial.');
  assert(snapshot.state.guildAscensionProof === true, 'HUD ascension action must record closed-alpha guild capstone proof.');
  assert(snapshot.state.guildAscensionTrialId === 'jade-court-ascension-trial', 'HUD ascension action must record the Jade Court Ascension Trial id.');
  assert(snapshot.state.guildAscensionTrialName === 'Jade Court Ascension Trial', 'HUD ascension action must record the Jade Court Ascension Trial name.');
  assert(snapshot.state.guildAscensionScore >= 66, 'HUD ascension action must record a passing ascension score.');
  assert(snapshot.state.guildAscensionRequiredScore === 66, 'HUD ascension action must record the ascension score requirement.');
  assert(snapshot.state.guildAscensionRibbonClaimed === true, 'HUD ascension action must mark the no-real-value ascension ribbon proof.');
  assert(snapshot.harmony.includes('Triune Jade Harmony'), 'HUD harmony label must show the completed party form.');
  assert(snapshot.state.harmonyFormProof === true, 'HUD harmony action must record party harmony proof.');
  assert(snapshot.state.harmonyFormId === 'triune-jade-harmony', 'HUD harmony action must record the harmony form id.');
  assert(snapshot.state.harmonyFormName === 'Triune Jade Harmony', 'HUD harmony action must record the harmony form name.');
  assert(snapshot.state.harmonyFormScore >= 27, 'HUD harmony action must record a passing harmony score.');
  assert(snapshot.state.harmonySashClaimed === true, 'HUD harmony action must mark the no-real-value sash proof.');
  assert(snapshot.concord.includes('Jade Echo Concord Trial'), 'HUD concord label must show the completed harmony trial.');
  assert(snapshot.state.harmonyTrialProof === true, 'HUD concord action must record harmony trial proof.');
  assert(snapshot.state.harmonyTrialId === 'jade-echo-concord', 'HUD concord action must record the trial id.');
  assert(snapshot.state.harmonyTrialName === 'Jade Echo Concord Trial', 'HUD concord action must record the trial name.');
  assert(snapshot.state.harmonyTrialScore >= 24, 'HUD concord action must record a passing trial score.');
  assert(snapshot.state.concordTallyClaimed === true, 'HUD concord action must mark the no-real-value concord tally proof.');
  assert(snapshot.teamMatch.includes('Jade Mirror Team Match'), 'HUD team match label must show the completed full-party match.');
  assert(snapshot.state.teamSparMatchProof === true, 'HUD team match action must record team spar match proof.');
  assert(snapshot.state.teamSparMatchId === 'jade-mirror-team-match', 'HUD team match action must record the match id.');
  assert(snapshot.state.teamSparMatchName === 'Jade Mirror Team Match', 'HUD team match action must record the match name.');
  assert(snapshot.state.teamSparMatchScore >= 30, 'HUD team match action must record a passing match score.');
  assert(snapshot.state.teamMatchRibbonClaimed === true, 'HUD team match action must mark the no-real-value match ribbon proof.');
  assert(snapshot.mentor.includes('Silk Banner Mentor Drill'), 'HUD mentor label must show the cleared mentor challenge.');
  assert(snapshot.state.mentorChallengeProof === true, 'HUD mentor action must record mentor challenge proof.');
  assert(snapshot.state.mentorChallengeId === 'silk-banner-mentor-drill', 'HUD mentor action must record the Silk Banner Mentor Drill id.');
  assert(snapshot.state.mentorChallengeName === 'Silk Banner Mentor Drill', 'HUD mentor action must record the mentor challenge name.');
  assert(snapshot.state.mentorChallengeScore >= 28, 'HUD mentor action must record a passing mentor challenge score.');
  assert(snapshot.state.mentorSealClaimed === true, 'HUD mentor action must mark the no-real-value mentor seal proof.');
  assert(snapshot.technique.includes('Technique:'), 'HUD technique label must show mastery state.');
  assert(snapshot.state.techniqueProof === true, 'HUD technique action must record technique proof.');
  assert(snapshot.state.techniqueMoveId === 'goldleaf-feint', 'HUD technique action must record the practiced route-spirit move.');
  assert(snapshot.state.techniqueMasteryXp >= 1, 'HUD technique action must record mastery XP.');
  assert(snapshot.tactic.includes('Tactic:'), 'HUD tactic label must show battle tactic state.');
  assert(snapshot.state.tacticProof === true, 'HUD tactic action must record tactic scroll proof.');
  assert(snapshot.state.lastTacticId === 'goldleaf-opening', 'HUD tactic action must record the Goldleaf tactic.');
  assert(snapshot.state.lastTacticSpiritId === 'jintari', 'HUD tactic action must record Jintari as the tactic spirit.');
  assert(snapshot.state.lastTacticMoveId === 'goldleaf-feint', 'HUD tactic action must record the Goldleaf Feint move.');
  assert(snapshot.state.tacticStance === 'feint', 'HUD tactic action must record the feint stance.');
  assert(snapshot.state.tacticFocusScore >= 1, 'HUD tactic action must record a focus score.');
  assert(snapshot.state.tacticMasteryXp >= 1, 'HUD tactic action must record tactic mastery XP.');
  assert(snapshot.loadout.includes('Jade Step Loadout'), 'HUD loadout label must show the prepared move loadout.');
  assert(snapshot.state.techniqueLoadoutProof === true, 'HUD loadout action must record technique loadout proof.');
  assert(snapshot.state.techniqueLoadoutId === 'jade-step-loadout', 'HUD loadout action must record the Jade Step Loadout id.');
  assert(snapshot.state.techniqueLoadoutName === 'Jade Step Loadout', 'HUD loadout action must record the loadout name.');
  assert(snapshot.state.techniqueLoadoutScore >= 22, 'HUD loadout action must record a passing loadout score.');
  assert(snapshot.state.loadoutSlipClaimed === true, 'HUD loadout action must mark the no-real-value loadout slip proof.');
  assert(Array.isArray(snapshot.state.techniqueLoadoutMoves) && snapshot.state.techniqueLoadoutMoves.includes('lirabao:lantern-pulse'), 'HUD loadout action must include Lirabao Lantern Pulse.');
  assert(Array.isArray(snapshot.state.techniqueLoadoutMoves) && snapshot.state.techniqueLoadoutMoves.includes('jintari:goldleaf-feint'), 'HUD loadout action must include Jintari Goldleaf Feint.');
  assert(Array.isArray(snapshot.state.techniqueLoadoutMoves) && snapshot.state.techniqueLoadoutMoves.includes('aozhen:skybell-guard'), 'HUD loadout action must include Aozhen Skybell Guard.');
  assert(snapshot.techniqueCodex.includes('Jade Technique Codex'), 'HUD technique codex label must show the sealed move library.');
  assert(snapshot.state.techniqueCodexProof === true, 'HUD technique codex action must record codex proof.');
  assert(snapshot.state.techniqueCodexId === 'jade-technique-codex', 'HUD technique codex action must record the Jade Technique Codex id.');
  assert(snapshot.state.techniqueCodexName === 'Jade Technique Codex', 'HUD technique codex action must record the codex name.');
  assert(snapshot.state.techniqueCodexScore >= 46, 'HUD technique codex action must record a passing codex score.');
  assert(snapshot.state.techniqueCodexRequiredScore === 46, 'HUD technique codex action must record the codex requirement.');
  assert(Array.isArray(snapshot.state.techniqueCodexPartyIds) && snapshot.state.techniqueCodexPartyIds.includes('lirabao'), 'HUD technique codex action must include Lirabao in the codex party.');
  assert(Array.isArray(snapshot.state.techniqueCodexPartyIds) && snapshot.state.techniqueCodexPartyIds.includes('jintari'), 'HUD technique codex action must include Jintari in the codex party.');
  assert(Array.isArray(snapshot.state.techniqueCodexPartyIds) && snapshot.state.techniqueCodexPartyIds.includes('aozhen'), 'HUD technique codex action must include Aozhen in the codex party.');
  assert(Array.isArray(snapshot.state.techniqueCodexMoveIds) && snapshot.state.techniqueCodexMoveIds.includes('lantern-pulse'), 'HUD technique codex action must include Lantern Pulse.');
  assert(Array.isArray(snapshot.state.techniqueCodexMoveIds) && snapshot.state.techniqueCodexMoveIds.includes('goldleaf-feint'), 'HUD technique codex action must include Goldleaf Feint.');
  assert(Array.isArray(snapshot.state.techniqueCodexMoveIds) && snapshot.state.techniqueCodexMoveIds.includes('skybell-guard'), 'HUD technique codex action must include Skybell Guard.');
  assert(Array.isArray(snapshot.state.techniqueCodexTacticIds) && snapshot.state.techniqueCodexTacticIds.includes('lantern-anchor'), 'HUD technique codex action must include Lantern Anchor.');
  assert(Array.isArray(snapshot.state.techniqueCodexTacticIds) && snapshot.state.techniqueCodexTacticIds.includes('goldleaf-opening'), 'HUD technique codex action must include Goldleaf Opening.');
  assert(Array.isArray(snapshot.state.techniqueCodexTacticIds) && snapshot.state.techniqueCodexTacticIds.includes('skybell-ward'), 'HUD technique codex action must include Skybell Ward.');
  assert(snapshot.state.techniqueCodexSealClaimed === true, 'HUD technique codex action must mark the no-real-value codex seal proof.');
  assert(snapshot.trait.includes('Skybell Wayfinder'), 'HUD trait label must show the attuned spirit trait.');
  assert(snapshot.state.traitAttunementProof === true, 'HUD trait action must record trait attunement proof.');
  assert(snapshot.state.traitAttunementId === 'jade-heart-trait', 'HUD trait action must record the Jade Heart trait id.');
  assert(snapshot.state.traitAttunementName === 'Jade Heart Trait Attunement', 'HUD trait action must record the trait attunement name.');
  assert(snapshot.state.traitLabel === 'Skybell Wayfinder', 'HUD trait action must record the active spirit trait label.');
  assert(snapshot.state.traitAttunementScore >= 31, 'HUD trait action must record a passing trait score.');
  assert(snapshot.state.traitThreadClaimed === true, 'HUD trait action must mark the no-real-value trait thread proof.');
  assert(snapshot.condition.includes('Jade Mirror Condition Weave'), 'HUD condition label must show the condition weave proof.');
  assert(snapshot.state.conditionWeaveProof === true, 'HUD condition action must record condition weave proof.');
  assert(snapshot.state.conditionWeaveId === 'jade-mirror-condition-weave', 'HUD condition action must record the Jade Mirror condition weave id.');
  assert(snapshot.state.conditionWeaveName === 'Jade Mirror Condition Weave', 'HUD condition action must record the condition weave name.');
  assert(snapshot.state.conditionWeaveScore >= 34, 'HUD condition action must record a passing condition weave score.');
  assert(Array.isArray(snapshot.state.conditionIds) && snapshot.state.conditionIds.includes('lantern-ward'), 'HUD condition action must include Lantern Ward.');
  assert(Array.isArray(snapshot.state.conditionIds) && snapshot.state.conditionIds.includes('goldleaf-tempo'), 'HUD condition action must include Goldleaf Tempo.');
  assert(Array.isArray(snapshot.state.conditionIds) && snapshot.state.conditionIds.includes('skybell-guard'), 'HUD condition action must include Skybell Guard.');
  assert(snapshot.state.conditionCharmClaimed === true, 'HUD condition action must mark the no-real-value condition charm proof.');
  assert(snapshot.affinityMatrix.includes('Jade Affinity Matrix'), 'HUD affinity matrix label must show the mapped no-real-value matchup matrix.');
  assert(snapshot.state.affinityMatrixProof === true, 'HUD affinity matrix action must record matrix proof.');
  assert(snapshot.state.affinityMatrixId === 'jade-affinity-matrix', 'HUD affinity matrix action must record the Jade Affinity Matrix id.');
  assert(snapshot.state.affinityMatrixName === 'Jade Affinity Matrix', 'HUD affinity matrix action must record the matrix name.');
  assert(snapshot.state.affinityMatrixScore >= 44, 'HUD affinity matrix action must record a passing matrix score.');
  assert(snapshot.state.affinityMatrixRequiredScore === 44, 'HUD affinity matrix action must record the matrix requirement.');
  assert(Array.isArray(snapshot.state.affinityMatrixSpiritIds) && snapshot.state.affinityMatrixSpiritIds.includes('lirabao'), 'HUD affinity matrix action must record Lirabao in the matrix party.');
  assert(Array.isArray(snapshot.state.affinityMatrixSpiritIds) && snapshot.state.affinityMatrixSpiritIds.includes('jintari'), 'HUD affinity matrix action must record Jintari in the matrix party.');
  assert(Array.isArray(snapshot.state.affinityMatrixSpiritIds) && snapshot.state.affinityMatrixSpiritIds.includes('aozhen'), 'HUD affinity matrix action must record Aozhen in the matrix party.');
  assert(Array.isArray(snapshot.state.affinityMatrixAffinityLabels) && snapshot.state.affinityMatrixAffinityLabels.includes('blossom'), 'HUD affinity matrix action must record the blossom affinity.');
  assert(Array.isArray(snapshot.state.affinityMatrixAffinityLabels) && snapshot.state.affinityMatrixAffinityLabels.includes('citrus-gold'), 'HUD affinity matrix action must record the citrus-gold affinity.');
  assert(Array.isArray(snapshot.state.affinityMatrixAffinityLabels) && snapshot.state.affinityMatrixAffinityLabels.includes('sky-jade'), 'HUD affinity matrix action must record the sky-jade affinity.');
  assert(Array.isArray(snapshot.state.affinityMatrixConditionIds) && snapshot.state.affinityMatrixConditionIds.includes('lantern-ward'), 'HUD affinity matrix action must record Lantern Ward.');
  assert(Array.isArray(snapshot.state.affinityMatrixConditionIds) && snapshot.state.affinityMatrixConditionIds.includes('goldleaf-tempo'), 'HUD affinity matrix action must record Goldleaf Tempo.');
  assert(Array.isArray(snapshot.state.affinityMatrixConditionIds) && snapshot.state.affinityMatrixConditionIds.includes('skybell-guard'), 'HUD affinity matrix action must record Skybell Guard.');
  assert(snapshot.state.affinityMatrixSealClaimed === true, 'HUD affinity matrix action must mark the no-real-value matrix seal proof.');
  assert(snapshot.starterVow.includes('Jade Starter Vow'), 'HUD starter label must show the completed first companion vow.');
  assert(snapshot.state.starterVowProof === true, 'HUD starter action must record starter vow proof.');
  assert(snapshot.state.starterVowId === 'jade-starter-vow', 'HUD starter action must record the Jade Starter Vow id.');
  assert(snapshot.state.starterVowName === 'Jade Starter Vow', 'HUD starter action must record the starter vow name.');
  assert(snapshot.state.starterVowScore >= 18, 'HUD starter action must record a passing starter vow score.');
  assert(snapshot.state.starterVowRequiredScore === 18, 'HUD starter action must record the starter vow requirement.');
  assert(snapshot.state.starterKnotClaimed === true, 'HUD starter action must mark the no-real-value starter knot proof.');
  assert(['lirabao', 'jintari', 'aozhen'].includes(snapshot.state.starterSpiritId), 'HUD starter action must record a valid original Mochirii starter spirit.');
  assert(Array.isArray(snapshot.state.starterVowItemIds) && snapshot.state.starterVowItemIds.includes('mochirii-guild-seal'), 'HUD starter action must record the Mochirii Guild Seal input.');
  assert(snapshot.relicAttunement.includes('Jade Relic Attunement'), 'HUD relic attunement label must show the completed held-charm proof.');
  assert(snapshot.state.relicAttunementProof === true, 'HUD relic attunement action must record relic proof.');
  assert(snapshot.state.relicAttunementId === 'jade-relic-attunement', 'HUD relic attunement action must record the Jade Relic Attunement id.');
  assert(snapshot.state.relicAttunementName === 'Jade Relic Attunement', 'HUD relic attunement action must record the relic attunement name.');
  assert(snapshot.state.relicAttunementScore >= 57, 'HUD relic attunement action must record a passing relic score.');
  assert(snapshot.state.relicAttunementRequiredScore === 57, 'HUD relic attunement action must record the relic requirement.');
  assert(Array.isArray(snapshot.state.relicAttunementSpiritIds) && snapshot.state.relicAttunementSpiritIds.includes('lirabao'), 'HUD relic attunement action must record Lirabao in the relic party.');
  assert(Array.isArray(snapshot.state.relicAttunementSpiritIds) && snapshot.state.relicAttunementSpiritIds.includes('jintari'), 'HUD relic attunement action must record Jintari in the relic party.');
  assert(Array.isArray(snapshot.state.relicAttunementSpiritIds) && snapshot.state.relicAttunementSpiritIds.includes('aozhen'), 'HUD relic attunement action must record Aozhen in the relic party.');
  assert(Array.isArray(snapshot.state.relicAttunementItemIds) && snapshot.state.relicAttunementItemIds.includes('jade-thread-charm'), 'HUD relic attunement action must record the Jade Thread Charm input.');
  assert(Array.isArray(snapshot.state.relicAttunementItemIds) && snapshot.state.relicAttunementItemIds.includes('lantern-harmony-tea'), 'HUD relic attunement action must record the Lantern Harmony Tea input.');
  assert(Array.isArray(snapshot.state.relicAttunementItemIds) && snapshot.state.relicAttunementItemIds.includes('jade-court-provision-satchel'), 'HUD relic attunement action must record the provision satchel input.');
  assert(snapshot.state.relicLabel === 'Skybell Thread Cord', 'HUD relic attunement action must record the active spirit relic label.');
  assert(snapshot.state.relicSilkCordClaimed === true, 'HUD relic attunement action must mark the no-real-value relic silk cord proof.');
  assert(snapshot.affinity.includes('Affinity:'), 'HUD affinity label must show trial state.');
  assert(snapshot.state.affinityProof === true, 'HUD affinity action must record affinity trial proof.');
  assert(snapshot.state.lastAffinityTrialId === 'silk-cinder-trial', 'HUD affinity action must record the Silk Cinder trial.');
  assert(snapshot.state.affinityAdvantage === true, 'HUD affinity action must record move affinity advantage.');
  assert(snapshot.state.affinityFocusScore >= 1, 'HUD affinity action must record a focus score.');
  assert(snapshot.state.affinityTrialScore === 18, 'HUD affinity action must record the Silk Cinder trial score.');
  assert(snapshot.party.includes('Party:'), 'HUD party label must show party state.');
  assert(Array.isArray(snapshot.state.partyIds) && snapshot.state.partyIds.includes('aozhen') && snapshot.state.partyIds.includes('jintari') && snapshot.state.partyIds.includes('lirabao'), 'HUD party action must form a three-spirit Mochirii party.');
  assert(snapshot.training.includes('Training:'), 'HUD training label must show training state.');
  assert(snapshot.state.trainingXp >= 1, 'HUD training action must record training XP.');
  assert(snapshot.state.sparLadderXp >= 1, 'HUD spar ladder action must record ladder XP.');
  assert(snapshot.state.lastSparOpponentId === 'jade-echo-apprentice', 'HUD spar ladder action must record the first spar opponent.');
  assert(typeof snapshot.state.raisingMilestoneLabel === 'string' && snapshot.state.raisingMilestoneLabel.length > 4, 'HUD raising action must record a named bond milestone.');
  assert(snapshot.training.includes(snapshot.state.raisingMilestoneLabel), 'HUD training label must display the current bond milestone.');
  assert(snapshot.battleRound.includes('Battle Round:'), 'HUD battle round label must show transcript state.');
  assert(snapshot.battleRound.includes('Jade Echo Apprentice'), 'HUD battle round label must name the spar opponent.');
  assert(!snapshot.battleRound.includes('pending'), 'HUD battle round label must leave the pending state after spar/training.');
  assert(snapshot.state.battleRoundProof === true, 'HUD battle round action must record transcript proof.');
  assert(snapshot.state.battleRoundId === 'jade-echo-apprentice-round-1', 'HUD battle round action must record the first Jade Echo round id.');
  assert(snapshot.state.battleRoundOpponentName === 'Jade Echo Apprentice', 'HUD battle round action must record the opponent name.');
  assert(snapshot.state.battleRoundFocusScore >= snapshot.state.battleRoundOpponentScore, 'HUD battle round action must record a no-injury clear.');
  assert(snapshot.state.battleRoundOpponentScore >= 1, 'HUD battle round action must record an opponent score.');
  assert(snapshot.state.battleRoundVictory === true, 'HUD battle round action must mark the round as cleared.');
  assert(Array.isArray(snapshot.state.battleRoundTranscript) && snapshot.state.battleRoundTranscript.length >= 1, 'HUD battle round action must record at least one transcript participant.');
  assert(snapshot.state.battleRoundTranscript.every((entry) => String(entry).includes(':')), 'HUD battle round transcript entries must include spirit and move details.');
  assert(snapshot.state.raisingProof === true, 'HUD raising action must record raising proof.');
  assert(snapshot.growth.includes('Moonwell Bloom Form'), 'HUD growth label must show the growth rite form.');
  assert(snapshot.state.growthRiteProof === true, 'HUD growth rite action must record growth proof.');
  assert(snapshot.state.growthRiteId === 'moonwell-bloom-rite', 'HUD growth rite action must record the Moonwell rite id.');
  assert(snapshot.state.growthForm === 'Moonwell Bloom Form', 'HUD growth rite action must record the Moonwell growth form.');
  assert(snapshot.state.growthSigilClaimed === true, 'HUD growth rite action must mark the no-real-value growth sigil proof.');
  assert(snapshot.quest.includes('Quest Chain'), 'HUD quest label must show the completed quest chain.');
  assert(snapshot.state.activeQuestId === 'skybell-spar', 'HUD quest chain must finish on the Skybell Spar posting.');
  assert(Array.isArray(snapshot.state.completedQuestSteps) && snapshot.state.completedQuestSteps.includes('complete-raising-care'), 'HUD quest progress must record the final Skybell Spar step.');
  assert(Array.isArray(snapshot.state.completedQuestIds) && snapshot.state.completedQuestIds.length === 3, 'HUD quest chain must record all three completed quest ids.');
  assert(snapshot.state.questChainProof === true, 'HUD quest chain must record questChainProof.');
  assert(snapshot.profile.includes('Profile: reviewed'), 'HUD profile label must show a viewed profile state.');
  assert(snapshot.state.profileViewed === true, 'HUD profile action must record local profile proof.');
  assert(snapshot.guild.includes('Guild: 1 local buddy'), 'HUD guild label must show a local guild buddy proof.');
  assert(snapshot.state.guildBuddyProof === true, 'HUD guild action must record local social proof.');
  assert(snapshot.rank.includes('Jade Court Initiate'), 'HUD rank label must show the guild rank proof.');
  assert(snapshot.state.guildRankProof === true, 'HUD rank action must record guild rank proof.');
  assert(snapshot.state.guildRankId === 'jade-court-initiate', 'HUD rank action must record the Jade Court trial id.');
  assert(snapshot.state.guildRankTitle === 'Jade Court Initiate', 'HUD rank action must record the Jade Court rank title.');
  assert(snapshot.state.guildRankScore >= 9, 'HUD rank action must record a passing rank score.');
  assert(snapshot.state.guildRankSealClaimed === true, 'HUD rank action must mark the no-real-value rank seal proof.');
  assert(snapshot.status.includes('Status: cozy'), 'HUD status label must show the local mood/status proof.');
  assert(snapshot.state.statusMood === 'cozy', 'HUD status action must record local social status proof.');
  assert(snapshot.state.lastInspectedSpiritId === 'aozhen', 'HUD inspect action must record an Aozhen spirit inspection proof.');
  assert(snapshot.state.charmListed === true, 'HUD market action must mark a fixed listing proof.');
  assert(snapshot.state.marketReceiptProof === true, 'HUD market receipt action must record fixed-price purchase proof.');
  assert(snapshot.state.marketReceiptId === 'jade-court-market-receipt', 'HUD market receipt action must record the receipt id.');
  assert(snapshot.state.marketReceiptName === 'Jade Court Market Receipt', 'HUD market receipt action must record the receipt name.');
  assert(snapshot.state.marketReceiptItemId === 'jade-thread-charm', 'HUD market receipt action must record the purchased item.');
  assert(snapshot.state.marketReceiptQuantity === 1, 'HUD market receipt action must record the purchased quantity.');
  assert(snapshot.state.marketReceiptPrice === 5, 'HUD market receipt action must record the test price.');
  assert(snapshot.state.marketReceiptCurrency === 'guild-seals', 'HUD market receipt action must record the test currency.');
  assert(snapshot.state.marketReceiptScore >= 16, 'HUD market receipt action must record a passing receipt score.');
  assert(snapshot.state.marketReceiptRequiredScore === 16, 'HUD market receipt action must record the receipt requirement.');
  assert(snapshot.state.marketReceiptClaimed === true, 'HUD market receipt action must mark the no-real-value receipt proof.');
  assert(snapshot.state.tradeProof === true, 'HUD trade action must mark a direct trade proof.');
  assert(snapshot.state.canaryRequested === true, 'HUD Canary action must stage a certificate request.');
  assert(snapshot.state.canaryReturnRequested === true, 'HUD Canary return action must stage a no-real-value return preview.');
  const chat = Array.isArray(snapshot.state.chat) ? snapshot.state.chat : [];
  assert(chat.some((line) => String(line).includes('Cloudbell Reed Bank')), 'HUD chat state must record the second field expedition action.');
  assert(chat.some((line) => String(line).includes('Cloudbell Skyvow Accord cleared')), 'HUD chat state must record the no-injury field accord action.');
  assert(chat.some((line) => String(line).includes('Skybell Vow Invitation') || String(line).includes('already trusts your Mochirii roster')), 'HUD chat state must record the Aozhen route invitation action.');
  assert(chat.some((line) => String(line).includes('Jade Cloudbell Circuit mastered')), 'HUD chat state must record the route mastery action.');
  assert(chat.some((line) => String(line).includes('Jade Cloudbell Patrol complete')), 'HUD chat state must record the route patrol action.');
  assert(chat.some((line) => String(line).includes('Jade Court Habitat Bond recorded')), 'HUD chat state must record the habitat bond action.');
  assert(chat.some((line) => String(line).includes('Jade Court Sanctuary Rite complete')), 'HUD chat state must record the sanctuary rite action.');
  assert(chat.some((line) => String(line).includes('Jade Court Research Folio recorded')), 'HUD chat state must record the research folio action.');
  assert(chat.some((line) => String(line).includes('Jade Court Spirit Compendium complete')), 'HUD chat state must record the compendium action.');
  assert(chat.some((line) => String(line).includes('Jade Court Roster Archive sealed')), 'HUD chat state must record the roster archive action.');
  assert(chat.some((line) => String(line).includes('Jade Roster Cabinet organized')), 'HUD chat state must record the roster cabinet action.');
  assert(chat.some((line) => String(line).includes('Jade Blossom Cradle settled')), 'HUD chat state must record the blossom cradle action.');
  assert(chat.some((line) => String(line).includes('Jade Court Market Receipt recorded')), 'HUD chat state must record the no-real-value market receipt action.');
  assert(chat.some((line) => String(line).includes('Jade Court Provision Satchel stocked')), 'HUD chat state must record the provision satchel action.');
  assert(chat.some((line) => String(line).includes('Jade Court Care Cycle complete')), 'HUD chat state must record the full-roster care cycle action.');
  assert(chat.some((line) => String(line).includes('Jade Temperament Concord complete')), 'HUD chat state must record the temperament concord action.');
  assert(chat.some((line) => String(line).includes('Jade Field Almanac recorded')), 'HUD chat state must record the field almanac action.');
  assert(chat.some((line) => String(line).includes('Jade Route Ecology Survey complete')), 'HUD chat state must record the route ecology survey action.');
  assert(chat.some((line) => String(line).includes('Jade Court Craft Writ complete')), 'HUD chat state must record the craft writ action.');
  assert(chat.some((line) => String(line).includes('Jade Exchange Accord complete')), 'HUD chat state must record the exchange accord action.');
  assert(chat.some((line) => String(line).includes('Jade Cloudbell Waystone activated')), 'HUD chat state must record the route waystone action.');
  assert(chat.some((line) => String(line).includes('Jade Route Charter recorded')), 'HUD chat state must record the route charter action.');
  assert(chat.some((line) => String(line).includes('Jade Moonwell Nurture Rite complete')), 'HUD chat state must record the nurture rite action.');
  assert(chat.some((line) => String(line).includes('Jade Teahouse Recovery complete')), 'HUD chat state must record the recovery tea action.');
  assert(chat.some((line) => String(line).includes('Jade Kinship Album recorded')), 'HUD chat state must record the kinship album action.');
  assert(chat.some((line) => String(line).includes('Jade Nursery Grove cultivated')), 'HUD chat state must record the nursery grove action.');
  assert(chat.some((line) => String(line).includes('Jade Bloom Ascendance complete')), 'HUD chat state must record the bloom ascendance action.');
  assert(chat.some((line) => String(line).includes('Jade Lineage Register recorded')), 'HUD chat state must record the lineage register action.');
  assert(chat.some((line) => String(line).includes('Jade Capture Rite recorded')), 'HUD chat state must record the capture rite action.');
  assert(chat.some((line) => String(line).includes('Jade Encounter Rotation recorded')), 'HUD chat state must record the encounter rotation action.');
  assert(chat.some((line) => String(line).includes('Jade Encounter Atlas recorded')), 'HUD chat state must record the encounter atlas action.');
  assert(chat.some((line) => String(line).includes('Jade Habitat Census recorded')), 'HUD chat state must record the habitat census action.');
  assert(chat.some((line) => String(line).includes('Jade Banner Tournament cleared')), 'HUD chat state must record the tournament bracket action.');
  assert(chat.some((line) => String(line).includes('Jade Rival Circle cleared')), 'HUD chat state must record the rival circle action.');
  assert(chat.some((line) => String(line).includes('Jade Sifu Council cleared')), 'HUD chat state must record the sifu council action.');
  assert(chat.some((line) => String(line).includes('Jade Summit Circuit cleared')), 'HUD chat state must record the summit circuit action.');
  assert(chat.some((line) => String(line).includes('Jade Court Commission Ledger complete')), 'HUD chat state must record the guild commission action.');
  assert(chat.some((line) => String(line).includes('Jade Courtyard Rally complete')), 'HUD chat state must record the guild rally action.');
  assert(chat.some((line) => String(line).includes('Jade Insignia Case sealed')), 'HUD chat state must record the insignia case action.');
  assert(chat.some((line) => String(line).includes('Jade Wayfarer Chronicle complete')), 'HUD chat state must record the wayfarer chronicle action.');
  assert(chat.some((line) => String(line).includes('Jade Court Ascension Trial complete')), 'HUD chat state must record the guild ascension trial action.');
  assert(chat.some((line) => String(line).includes('Jade Step Loadout prepared')), 'HUD chat state must record the technique loadout action.');
  assert(chat.some((line) => String(line).includes('Jade Technique Codex sealed')), 'HUD chat state must record the technique codex action.');
  assert(chat.some((line) => String(line).includes('Jade Heart Trait Attunement')), 'HUD chat state must record the trait attunement action.');
  assert(chat.some((line) => String(line).includes('Jade Mirror Condition Weave complete')), 'HUD chat state must record the condition weave action.');
  assert(chat.some((line) => String(line).includes('Jade Affinity Matrix mapped')), 'HUD chat state must record the affinity matrix action.');
  assert(chat.some((line) => String(line).includes('Jade Relic Attunement complete')), 'HUD chat state must record the relic attunement action.');
  assert(chat.some((line) => String(line).includes('Triune Jade Harmony formed')), 'HUD chat state must record the party harmony action.');
  assert(chat.some((line) => String(line).includes('Jade Echo Concord Trial cleared')), 'HUD chat state must record the harmony trial action.');
  assert(chat.some((line) => String(line).includes('Jade Mirror Team Match cleared')), 'HUD chat state must record the team spar match action.');
  assert(chat.some((line) => String(line).includes('Silk Banner Mentor Drill cleared')), 'HUD chat state must record the mentor challenge action.');
  assert(chat.some((line) => String(line).includes('Quest chain complete')), 'HUD chat state must record the completed quest chain.');
  assert(chat.some((line) => String(line).includes('Inspect Aozhen')), 'HUD chat state must record the spirit inspect action.');
  assert(chat.some((line) => String(line).includes('You wave')), 'HUD chat state must record the emote action.');
  assert(chat.some((line) => String(line).includes('Jade Thread Charm listed')), 'HUD chat state must record the fixed-list action.');
  assert(chat.some((line) => String(line).includes('Direct trade proof')), 'HUD chat state must record the trade action.');
  assert(chat.some((line) => String(line).includes('Canary certificate request staged')), 'HUD chat state must record the Canary action.');
  assert(chat.some((line) => String(line).includes('Jade Vault Return Proof staged')), 'HUD chat state must record the Canary return preview action.');

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
