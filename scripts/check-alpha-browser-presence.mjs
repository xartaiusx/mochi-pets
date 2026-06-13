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
  await page.click('[data-alpha-action="party.harmony_form"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.harmony_trial"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.team_spar_match"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="battle.mentor_challenge"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="spirit.trait_attune"]', { timeout: timeoutMs });
  await page.fill('[data-chat-input]', chatMessage, { timeout: timeoutMs });
  await page.press('[data-chat-input]', 'Enter', { timeout: timeoutMs });
  await page.click('[data-alpha-action="emote.send"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="market.fixed_list"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="trade.direct_offer"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="item.provision_satchel"]', { timeout: timeoutMs });
  await page.click('[data-alpha-action="chain.withdraw_request"]', { timeout: timeoutMs });

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
      const routeMastery = document.querySelector('[data-route-mastery-label]')?.textContent || '';
      const habitatBond = document.querySelector('[data-habitat-bond-label]')?.textContent || '';
      const research = document.querySelector('[data-research-label]')?.textContent || '';
      const compendium = document.querySelector('[data-compendium-label]')?.textContent || '';
      const provision = document.querySelector('[data-provision-label]')?.textContent || '';
      const technique = document.querySelector('[data-technique-label]')?.textContent || '';
      const tactic = document.querySelector('[data-tactic-label]')?.textContent || '';
      const loadout = document.querySelector('[data-loadout-label]')?.textContent || '';
      const trait = document.querySelector('[data-trait-label]')?.textContent || '';
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
        && routeMastery.includes('Jade Cloudbell Circuit')
        && habitatBond.includes('Jade Court Habitat Bond')
        && research.includes('Jade Court Research Folio')
        && compendium.includes('Jade Court Spirit Compendium')
        && provision.includes('Jade Court Provision Satchel')
        && technique.includes('Technique:')
        && technique.includes('XP')
        && tactic.includes('Tactic:')
        && tactic.includes('goldleaf-opening')
        && loadout.includes('Jade Step Loadout')
        && trait.includes('Skybell Wayfinder')
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
        && battleRound.includes('Battle Round:')
        && battleRound.includes('Jade Echo Apprentice')
        && !battleRound.includes('pending')
        && growth.includes('Moonwell Bloom Form')
        && quest.includes('Quest Chain')
        && market.includes('Canary: requested')
        && state.spiritId === 'aozhen'
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
        && state.routeMasteryProof === true
        && state.routeMasteryId === 'jade-cloudbell-circuit'
        && state.routeMasteryTitle === 'Jade Cloudbell Circuit'
        && state.routeMasteryScore >= 21
        && state.routeMasteryKnotClaimed === true
        && state.habitatBondProof === true
        && state.habitatBondId === 'jade-court-habitat-bond'
        && state.habitatBondName === 'Jade Court Habitat Bond'
        && state.habitatBondScore >= 15
        && state.habitatTasselClaimed === true
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
        && state.provisionProof === true
        && state.provisionSatchelId === 'jade-court-provision-satchel'
        && state.provisionSatchelName === 'Jade Court Provision Satchel'
        && state.provisionScore >= 24
        && Array.isArray(state.provisionStockItemIds)
        && state.provisionStockItemIds.includes('jade-thread-charm')
        && state.provisionStockItemIds.includes('lantern-harmony-tea')
        && state.provisionStockItemIds.includes('jade-mooncake-box')
        && state.provisionSatchelClaimed === true
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
        && state.tradeProof === true
        && state.canaryRequested === true
        && chat.includes('Inspect Aozhen')
        && chat.includes('You wave')
        && chat.includes('Jade Thread Charm listed')
        && chat.includes('Direct trade proof')
        && chat.includes('Canary certificate request staged')
        && chat.includes('Cloudbell Reed Bank')
        && chat.includes('Skybell Vow Invitation')
        && chat.includes('Jade Cloudbell Circuit mastered')
        && chat.includes('Jade Court Habitat Bond recorded')
        && chat.includes('Jade Court Research Folio recorded')
        && chat.includes('Jade Court Spirit Compendium complete')
        && chat.includes('Jade Court Provision Satchel stocked')
        && chat.includes('Jade Step Loadout prepared')
        && chat.includes('Jade Heart Trait Attunement')
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
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      spirit: document.querySelector('[data-spirit-label]')?.textContent || '',
      journal: document.querySelector('[data-journal-label]')?.textContent || '',
      expedition: document.querySelector('[data-expedition-label]')?.textContent || '',
      routeInvite: document.querySelector('[data-route-invite-label]')?.textContent || '',
      routeMastery: document.querySelector('[data-route-mastery-label]')?.textContent || '',
      habitatBond: document.querySelector('[data-habitat-bond-label]')?.textContent || '',
      research: document.querySelector('[data-research-label]')?.textContent || '',
      compendium: document.querySelector('[data-compendium-label]')?.textContent || '',
      provision: document.querySelector('[data-provision-label]')?.textContent || '',
      loadout: document.querySelector('[data-loadout-label]')?.textContent || '',
      trait: document.querySelector('[data-trait-label]')?.textContent || '',
      harmony: document.querySelector('[data-harmony-label]')?.textContent || '',
      concord: document.querySelector('[data-harmony-trial-label]')?.textContent || '',
      teamMatch: document.querySelector('[data-team-match-label]')?.textContent || '',
      mentor: document.querySelector('[data-mentor-label]')?.textContent || '',
      battleRound: document.querySelector('[data-battle-round-label]')?.textContent || '',
      quest: document.querySelector('[data-quest-label]')?.textContent || '',
      state: JSON.parse(localStorage.getItem('mochiSocial.alphaState') || '{}')
    }));
    console.error(`HUD action diagnostic before timeout:\n${JSON.stringify(diagnostic, null, 2)}`);
    throw error;
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
      journal: document.querySelector('[data-journal-label]')?.textContent?.trim() || '',
      expedition: document.querySelector('[data-expedition-label]')?.textContent?.trim() || '',
      routeInvite: document.querySelector('[data-route-invite-label]')?.textContent?.trim() || '',
      routeMastery: document.querySelector('[data-route-mastery-label]')?.textContent?.trim() || '',
      habitatBond: document.querySelector('[data-habitat-bond-label]')?.textContent?.trim() || '',
      research: document.querySelector('[data-research-label]')?.textContent?.trim() || '',
      compendium: document.querySelector('[data-compendium-label]')?.textContent?.trim() || '',
      provision: document.querySelector('[data-provision-label]')?.textContent?.trim() || '',
      technique: document.querySelector('[data-technique-label]')?.textContent?.trim() || '',
      tactic: document.querySelector('[data-tactic-label]')?.textContent?.trim() || '',
      loadout: document.querySelector('[data-loadout-label]')?.textContent?.trim() || '',
      trait: document.querySelector('[data-trait-label]')?.textContent?.trim() || '',
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
  assert(snapshot.routeMastery.includes('Jade Cloudbell Circuit'), 'HUD route mastery label must show the completed circuit.');
  assert(snapshot.state.routeMasteryProof === true, 'HUD route mastery action must record route mastery proof.');
  assert(snapshot.state.routeMasteryId === 'jade-cloudbell-circuit', 'HUD route mastery action must record the circuit id.');
  assert(snapshot.state.routeMasteryTitle === 'Jade Cloudbell Circuit', 'HUD route mastery action must record the circuit title.');
  assert(snapshot.state.routeMasteryScore >= 21, 'HUD route mastery action must record a passing circuit score.');
  assert(snapshot.state.routeMasteryKnotClaimed === true, 'HUD route mastery action must mark the no-real-value route knot proof.');
  assert(snapshot.habitatBond.includes('Jade Court Habitat Bond'), 'HUD habitat bond label must show the completed shared habitat proof.');
  assert(snapshot.state.habitatBondProof === true, 'HUD habitat bond action must record habitat bond proof.');
  assert(snapshot.state.habitatBondId === 'jade-court-habitat-bond', 'HUD habitat bond action must record the habitat bond id.');
  assert(snapshot.state.habitatBondName === 'Jade Court Habitat Bond', 'HUD habitat bond action must record the habitat bond name.');
  assert(snapshot.state.habitatBondScore >= 15, 'HUD habitat bond action must record a passing habitat score.');
  assert(snapshot.state.habitatTasselClaimed === true, 'HUD habitat bond action must mark the no-real-value habitat tassel proof.');
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
  assert(snapshot.provision.includes('Jade Court Provision Satchel'), 'HUD provision label must show the stocked no-real-value satchel.');
  assert(snapshot.state.provisionProof === true, 'HUD provision action must record provision satchel proof.');
  assert(snapshot.state.provisionSatchelId === 'jade-court-provision-satchel', 'HUD provision action must record the provision satchel id.');
  assert(snapshot.state.provisionSatchelName === 'Jade Court Provision Satchel', 'HUD provision action must record the provision satchel name.');
  assert(snapshot.state.provisionScore >= 24, 'HUD provision action must record a passing provision score.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('jade-thread-charm'), 'HUD provision action must stock the Jade Thread Charm.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('lantern-harmony-tea'), 'HUD provision action must stock Lantern Harmony Tea.');
  assert(Array.isArray(snapshot.state.provisionStockItemIds) && snapshot.state.provisionStockItemIds.includes('jade-mooncake-box'), 'HUD provision action must stock the Jade Mooncake Box.');
  assert(snapshot.state.provisionSatchelClaimed === true, 'HUD provision action must mark the no-real-value satchel proof.');
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
  assert(snapshot.trait.includes('Skybell Wayfinder'), 'HUD trait label must show the attuned spirit trait.');
  assert(snapshot.state.traitAttunementProof === true, 'HUD trait action must record trait attunement proof.');
  assert(snapshot.state.traitAttunementId === 'jade-heart-trait', 'HUD trait action must record the Jade Heart trait id.');
  assert(snapshot.state.traitAttunementName === 'Jade Heart Trait Attunement', 'HUD trait action must record the trait attunement name.');
  assert(snapshot.state.traitLabel === 'Skybell Wayfinder', 'HUD trait action must record the active spirit trait label.');
  assert(snapshot.state.traitAttunementScore >= 31, 'HUD trait action must record a passing trait score.');
  assert(snapshot.state.traitThreadClaimed === true, 'HUD trait action must mark the no-real-value trait thread proof.');
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
  assert(snapshot.state.tradeProof === true, 'HUD trade action must mark a direct trade proof.');
  assert(snapshot.state.canaryRequested === true, 'HUD Canary action must stage a certificate request.');
  const chat = Array.isArray(snapshot.state.chat) ? snapshot.state.chat : [];
  assert(chat.some((line) => String(line).includes('Cloudbell Reed Bank')), 'HUD chat state must record the second field expedition action.');
  assert(chat.some((line) => String(line).includes('Skybell Vow Invitation')), 'HUD chat state must record the Aozhen route invitation action.');
  assert(chat.some((line) => String(line).includes('Jade Cloudbell Circuit mastered')), 'HUD chat state must record the route mastery action.');
  assert(chat.some((line) => String(line).includes('Jade Court Habitat Bond recorded')), 'HUD chat state must record the habitat bond action.');
  assert(chat.some((line) => String(line).includes('Jade Court Research Folio recorded')), 'HUD chat state must record the research folio action.');
  assert(chat.some((line) => String(line).includes('Jade Court Spirit Compendium complete')), 'HUD chat state must record the compendium action.');
  assert(chat.some((line) => String(line).includes('Jade Court Provision Satchel stocked')), 'HUD chat state must record the provision satchel action.');
  assert(chat.some((line) => String(line).includes('Jade Step Loadout prepared')), 'HUD chat state must record the technique loadout action.');
  assert(chat.some((line) => String(line).includes('Jade Heart Trait Attunement')), 'HUD chat state must record the trait attunement action.');
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
