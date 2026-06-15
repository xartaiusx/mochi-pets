import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const reportJsonPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_JSON || 'reports/alpha-visual-review.json');
const reportMdPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REVIEW_MD || 'reports/alpha-visual-review.md');
const visualSnapshotPath = resolve(root, process.env.MOCHI_SOCIAL_VISUAL_REPORT || 'reports/alpha-visual-snapshot.json');
const browserPresencePath = resolve(root, process.env.MOCHI_SOCIAL_BROWSER_PRESENCE_REPORT || 'reports/alpha-browser-presence.json');
const mapEventPath = resolve(root, 'apps/game/src/modules/main/event.ts');
const mapServerPath = resolve(root, 'apps/game/src/modules/main/server.ts');
const alphaContentPath = resolve(root, 'apps/game/src/alpha/content.ts');
const browserBridgePath = resolve(root, 'apps/game/src/integration/browser-bridge.ts');
const assetLedgerPath = resolve(root, 'docs/asset-ledger.md');

const failures = [];
const visualSnapshot = readJson(visualSnapshotPath);
const browserPresence = readJson(browserPresencePath);
const mapEventSource = readText(mapEventPath);
const mapServerSource = readText(mapServerPath);
const alphaContentSource = readText(alphaContentPath);
const browserBridgeSource = readText(browserBridgePath);
const assetLedgerSource = readText(assetLedgerPath);

assertReport('visual snapshot', visualSnapshot);
assertReport('browser presence', browserPresence);
assert(visualSnapshot.data?.localOnlyDefault === true && visualSnapshot.data?.hostedAllowed === false, 'visual snapshot must remain local-only by default');
assert(browserPresence.data?.localOnlyDefault === true && browserPresence.data?.hostedAllowed === false, 'browser presence must remain local-only by default');
assert(Boolean(visualSnapshot.data?.dom?.hud), 'visual snapshot must show HUD DOM evidence');
assert(Boolean(visualSnapshot.data?.dom?.canvas), 'visual snapshot must show canvas DOM evidence');
assert(String(visualSnapshot.data?.dom?.title || '') === 'Mochi Social', 'visual snapshot page title must be Mochi Social');
assert(String(visualSnapshot.data?.dom?.presence || '').includes('Nearby:'), 'visual snapshot must show a Nearby presence label');
assert(Array.isArray(browserPresence.data?.tabs) && browserPresence.data.tabs.length === 2, 'browser presence must include two tabs');
assert(browserPresence.data?.tabs?.every((tab) => String(tab.presence || '').includes('Nearby: 2 testers')), 'browser presence tabs must show Nearby: 2 testers');
assert(browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true, 'browser presence must prove observer-side movement');
assert(browserPresence.data?.hudAction?.state?.spiritId === 'aozhen', 'HUD action proof must include the Aozhen second-route care loop');
assert(browserPresence.data?.hudAction?.state?.captureProof === true, 'HUD action proof must include the spirit invitation capture loop');
assert(browserPresence.data?.hudAction?.state?.journalProof === true, 'HUD action proof must include the spirit journal loop');
assert(browserPresence.data?.hudAction?.state?.journalDiscoveredCount === 3, 'HUD action proof must include all three discovered journal records');
assert(browserPresence.data?.hudAction?.state?.expeditionProof === true, 'HUD action proof must include the field expedition loop');
assert(browserPresence.data?.hudAction?.state?.lastExpeditionRouteId === 'cloudbell-reed-bank', 'HUD action proof must include the second field expedition route');
assert(browserPresence.data?.hudAction?.state?.routeInviteProof === true, 'HUD action proof must include the route spirit invitation loop');
assert(browserPresence.data?.hudAction?.state?.lastRouteInviteSpiritId === 'aozhen', 'HUD action proof must include Aozhen as the route-invited spirit');
assert(browserPresence.data?.hudAction?.state?.fieldAccordProof === true, 'HUD action proof must include the no-injury field accord loop');
assert(browserPresence.data?.hudAction?.state?.fieldAccordId === 'cloudbell-skyvow-accord', 'HUD action proof must include the Cloudbell field accord id');
assert(browserPresence.data?.hudAction?.state?.fieldAccordName === 'Cloudbell Skyvow Accord', 'HUD action proof must include the Cloudbell field accord name');
assert(browserPresence.data?.hudAction?.state?.fieldAccordScore >= 12, 'HUD action proof must include a passing field accord score');
assert(browserPresence.data?.hudAction?.state?.fieldAccordRequiredScore === 12, 'HUD action proof must include the Cloudbell field accord requirement');
assert(browserPresence.data?.hudAction?.state?.lastFieldAccordRouteId === 'cloudbell-reed-bank', 'HUD action proof must include the Cloudbell field accord route');
assert(browserPresence.data?.hudAction?.state?.lastFieldAccordSpiritId === 'aozhen', 'HUD action proof must include Aozhen as the field accord spirit');
assert(browserPresence.data?.hudAction?.state?.fieldAccordTalismanClaimed === true, 'HUD action proof must include the no-real-value field accord talisman proof');
assert(browserPresence.data?.hudAction?.state?.routeMasteryProof === true, 'HUD action proof must include route mastery proof');
assert(browserPresence.data?.hudAction?.state?.routeMasteryId === 'jade-cloudbell-circuit', 'HUD action proof must include the Jade Cloudbell Circuit id');
assert(browserPresence.data?.hudAction?.state?.routeMasteryKnotClaimed === true, 'HUD action proof must include the route mastery knot proof');
assert(browserPresence.data?.hudAction?.state?.routePatrolProof === true, 'HUD action proof must include route patrol proof');
assert(browserPresence.data?.hudAction?.state?.routePatrolId === 'jade-cloudbell-patrol', 'HUD action proof must include the Jade Cloudbell Patrol id');
assert(browserPresence.data?.hudAction?.state?.routePatrolName === 'Jade Cloudbell Patrol', 'HUD action proof must include the Jade Cloudbell Patrol name');
assert(browserPresence.data?.hudAction?.state?.routePatrolScore >= 24, 'HUD action proof must include a passing route patrol score');
assert(browserPresence.data?.hudAction?.state?.routePatrolRequiredScore === 24, 'HUD action proof must include the route patrol requirement');
assert(browserPresence.data?.hudAction?.state?.routePatrolPennantClaimed === true, 'HUD action proof must include the no-real-value route patrol pennant proof');
assert(browserPresence.data?.hudAction?.state?.habitatBondProof === true, 'HUD action proof must include the shared habitat bond proof');
assert(browserPresence.data?.hudAction?.state?.habitatBondId === 'jade-court-habitat-bond', 'HUD action proof must include the Jade Court Habitat Bond id');
assert(browserPresence.data?.hudAction?.state?.habitatTasselClaimed === true, 'HUD action proof must include the no-real-value habitat tassel proof');
assert(browserPresence.data?.hudAction?.state?.researchProof === true, 'HUD action proof must include the spirit research folio proof');
assert(browserPresence.data?.hudAction?.state?.researchFolioId === 'jade-court-research-folio', 'HUD action proof must include the Jade Court Research Folio id');
assert(browserPresence.data?.hudAction?.state?.researchFolioClaimed === true, 'HUD action proof must include the no-real-value research folio proof');
assert(browserPresence.data?.hudAction?.state?.compendiumProof === true, 'HUD action proof must include the spirit compendium proof');
assert(browserPresence.data?.hudAction?.state?.compendiumId === 'jade-court-spirit-compendium', 'HUD action proof must include the Jade Court Spirit Compendium id');
assert(browserPresence.data?.hudAction?.state?.compendiumSealClaimed === true, 'HUD action proof must include the no-real-value compendium seal proof');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveProof === true, 'HUD action proof must include the roster archive proof');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveId === 'jade-court-roster-archive', 'HUD action proof must include the Jade Court Roster Archive id');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveName === 'Jade Court Roster Archive', 'HUD action proof must include the Jade Court Roster Archive name');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveScore >= 22, 'HUD action proof must include a passing roster archive score');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveRequiredScore === 22, 'HUD action proof must include the roster archive requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.rosterArchiveReserveIds) && browserPresence.data.hudAction.state.rosterArchiveReserveIds.length >= 1, 'HUD action proof must include a reserve spirit archive slot');
assert(browserPresence.data?.hudAction?.state?.rosterArchiveSealClaimed === true, 'HUD action proof must include the no-real-value roster archive seal proof');
assert(browserPresence.data?.hudAction?.state?.provisionProof === true, 'HUD action proof must include the provision satchel proof');
assert(browserPresence.data?.hudAction?.state?.provisionSatchelId === 'jade-court-provision-satchel', 'HUD action proof must include the Jade Court Provision Satchel id');
assert(browserPresence.data?.hudAction?.state?.provisionSatchelClaimed === true, 'HUD action proof must include the no-real-value provision satchel proof');
assert(browserPresence.data?.hudAction?.state?.careCycleProof === true, 'HUD action proof must include the care cycle proof');
assert(browserPresence.data?.hudAction?.state?.careCycleId === 'jade-court-care-cycle', 'HUD action proof must include the Jade Court Care Cycle id');
assert(browserPresence.data?.hudAction?.state?.careCycleName === 'Jade Court Care Cycle', 'HUD action proof must include the Jade Court Care Cycle name');
assert(browserPresence.data?.hudAction?.state?.careCycleScore >= 32, 'HUD action proof must include a passing care cycle score');
assert(browserPresence.data?.hudAction?.state?.careCycleRequiredScore === 32, 'HUD action proof must include the care cycle requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.careCycleCaredSpiritIds) && browserPresence.data.hudAction.state.careCycleCaredSpiritIds.length === 3, 'HUD action proof must include every cared spirit');
assert(browserPresence.data?.hudAction?.state?.careCycleKnotClaimed === true, 'HUD action proof must include the no-real-value care cycle knot proof');
assert(browserPresence.data?.hudAction?.state?.temperamentConcordProof === true, 'HUD action proof must include the temperament concord proof');
assert(browserPresence.data?.hudAction?.state?.temperamentConcordId === 'jade-temperament-concord', 'HUD action proof must include the Jade Temperament Concord id');
assert(browserPresence.data?.hudAction?.state?.temperamentConcordName === 'Jade Temperament Concord', 'HUD action proof must include the Jade Temperament Concord name');
assert(browserPresence.data?.hudAction?.state?.temperamentConcordScore >= 36, 'HUD action proof must include a passing temperament concord score');
assert(browserPresence.data?.hudAction?.state?.temperamentConcordRequiredScore === 36, 'HUD action proof must include the temperament concord requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.temperamentConcordLabels) && browserPresence.data.hudAction.state.temperamentConcordLabels.includes('gentle'), 'HUD action proof must include the Lirabao temperament label');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.temperamentConcordLabels) && browserPresence.data.hudAction.state.temperamentConcordLabels.includes('bright'), 'HUD action proof must include the Jintari temperament label');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.temperamentConcordLabels) && browserPresence.data.hudAction.state.temperamentConcordLabels.includes('curious'), 'HUD action proof must include the Aozhen temperament label');
assert(browserPresence.data?.hudAction?.state?.temperamentCharmClaimed === true, 'HUD action proof must include the no-real-value temperament charm proof');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacProof === true, 'HUD action proof must include the field almanac proof');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacId === 'jade-field-almanac', 'HUD action proof must include the Jade Field Almanac id');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacName === 'Jade Field Almanac', 'HUD action proof must include the Jade Field Almanac name');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacScore >= 38, 'HUD action proof must include a passing field almanac score');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacRequiredScore === 38, 'HUD action proof must include the field almanac requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.fieldAlmanacRouteIds) && browserPresence.data.hudAction.state.fieldAlmanacRouteIds.includes('moonbridge-bamboo-trail'), 'HUD action proof must include the Moonbridge almanac route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.fieldAlmanacRouteIds) && browserPresence.data.hudAction.state.fieldAlmanacRouteIds.includes('cloudbell-reed-bank'), 'HUD action proof must include the Cloudbell almanac route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.fieldAlmanacSpeciesIds) && browserPresence.data.hudAction.state.fieldAlmanacSpeciesIds.includes('lirabao'), 'HUD action proof must include Lirabao in the field almanac');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.fieldAlmanacSpeciesIds) && browserPresence.data.hudAction.state.fieldAlmanacSpeciesIds.includes('jintari'), 'HUD action proof must include Jintari in the field almanac');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.fieldAlmanacSpeciesIds) && browserPresence.data.hudAction.state.fieldAlmanacSpeciesIds.includes('aozhen'), 'HUD action proof must include Aozhen in the field almanac');
assert(browserPresence.data?.hudAction?.state?.fieldAlmanacClaspClaimed === true, 'HUD action proof must include the no-real-value field almanac clasp proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeInvitedSpiritIds) && browserPresence.data.hudAction.state.routeInvitedSpiritIds.includes('jintari'), 'HUD action proof must preserve Jintari route invitation history');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeInvitedSpiritIds) && browserPresence.data.hudAction.state.routeInvitedSpiritIds.includes('aozhen'), 'HUD action proof must preserve Aozhen route invitation history');
assert(browserPresence.data?.hudAction?.state?.routeEcologyProof === true, 'HUD action proof must include the route ecology survey proof');
assert(browserPresence.data?.hudAction?.state?.routeEcologyId === 'jade-route-ecology-survey', 'HUD action proof must include the Jade Route Ecology Survey id');
assert(browserPresence.data?.hudAction?.state?.routeEcologyName === 'Jade Route Ecology Survey', 'HUD action proof must include the Jade Route Ecology Survey name');
assert(browserPresence.data?.hudAction?.state?.routeEcologyScore >= 42, 'HUD action proof must include a passing route ecology score');
assert(browserPresence.data?.hudAction?.state?.routeEcologyRequiredScore === 42, 'HUD action proof must include the route ecology requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologyRouteIds) && browserPresence.data.hudAction.state.routeEcologyRouteIds.includes('moonbridge-bamboo-trail'), 'HUD action proof must include the Moonbridge ecology route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologyRouteIds) && browserPresence.data.hudAction.state.routeEcologyRouteIds.includes('cloudbell-reed-bank'), 'HUD action proof must include the Cloudbell ecology route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologySpeciesIds) && browserPresence.data.hudAction.state.routeEcologySpeciesIds.includes('lirabao'), 'HUD action proof must include Lirabao in the route ecology survey');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologySpeciesIds) && browserPresence.data.hudAction.state.routeEcologySpeciesIds.includes('jintari'), 'HUD action proof must include Jintari in the route ecology survey');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologySpeciesIds) && browserPresence.data.hudAction.state.routeEcologySpeciesIds.includes('aozhen'), 'HUD action proof must include Aozhen in the route ecology survey');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologyInvitedSpiritIds) && browserPresence.data.hudAction.state.routeEcologyInvitedSpiritIds.includes('jintari'), 'HUD action proof must include Jintari ecology invitation proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeEcologyInvitedSpiritIds) && browserPresence.data.hudAction.state.routeEcologyInvitedSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen ecology invitation proof');
assert(browserPresence.data?.hudAction?.state?.routeEcologyMapClaimed === true, 'HUD action proof must include the no-real-value route ecology map proof');
assert(browserPresence.data?.hudAction?.state?.craftWritProof === true, 'HUD action proof must include the craft writ proof');
assert(browserPresence.data?.hudAction?.state?.craftWritId === 'jade-court-craft-writ', 'HUD action proof must include the Jade Court Craft Writ id');
assert(browserPresence.data?.hudAction?.state?.craftWritName === 'Jade Court Craft Writ', 'HUD action proof must include the Jade Court Craft Writ name');
assert(browserPresence.data?.hudAction?.state?.craftWritScore >= 44, 'HUD action proof must include a passing craft writ score');
assert(browserPresence.data?.hudAction?.state?.craftWritRequiredScore === 44, 'HUD action proof must include the craft writ requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.craftWritRecipeIds) && browserPresence.data.hudAction.state.craftWritRecipeIds.includes('lantern-tea-threading'), 'HUD action proof must include the lantern tea craft recipe');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.craftWritRecipeIds) && browserPresence.data.hudAction.state.craftWritRecipeIds.includes('moonbridge-provision-wrap'), 'HUD action proof must include the Moonbridge provision craft recipe');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.craftWritStockItemIds) && browserPresence.data.hudAction.state.craftWritStockItemIds.includes('jade-thread-charm'), 'HUD action proof must include the Jade Thread Charm craft stock');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.craftWritStockItemIds) && browserPresence.data.hudAction.state.craftWritStockItemIds.includes('lantern-harmony-tea'), 'HUD action proof must include Lantern Harmony Tea craft stock');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.craftWritStockItemIds) && browserPresence.data.hudAction.state.craftWritStockItemIds.includes('jade-mooncake-box'), 'HUD action proof must include Jade Mooncake Box craft stock');
assert(browserPresence.data?.hudAction?.state?.craftWritClaimed === true, 'HUD action proof must include the no-real-value craft writ proof');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordProof === true, 'HUD action proof must include the Jade Exchange Accord proof');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordId === 'jade-exchange-accord', 'HUD action proof must include the Jade Exchange Accord id');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordName === 'Jade Exchange Accord', 'HUD action proof must include the Jade Exchange Accord name');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordScore >= 34, 'HUD action proof must include a passing exchange accord score');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordRequiredScore === 34, 'HUD action proof must include the exchange accord requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.exchangeAccordItemIds) && browserPresence.data.hudAction.state.exchangeAccordItemIds.includes('jade-thread-charm'), 'HUD action proof must include the Jade Thread Charm exchange item');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.exchangeAccordItemIds) && browserPresence.data.hudAction.state.exchangeAccordItemIds.includes('lantern-harmony-tea'), 'HUD action proof must include Lantern Harmony Tea exchange item');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.exchangeAccordItemIds) && browserPresence.data.hudAction.state.exchangeAccordItemIds.includes('jade-mooncake-box'), 'HUD action proof must include Jade Mooncake Box exchange item');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordPresenceCount >= 2, 'HUD action proof must include two-tester exchange accord presence');
assert(browserPresence.data?.hudAction?.state?.exchangeAccordTallyClaimed === true, 'HUD action proof must include the no-real-value exchange accord tally');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneProof === true, 'HUD action proof must include the route waystone proof');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneId === 'jade-cloudbell-waystone', 'HUD action proof must include the Jade Cloudbell Waystone id');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneName === 'Jade Cloudbell Waystone', 'HUD action proof must include the Jade Cloudbell Waystone name');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneScore >= 30, 'HUD action proof must include a passing route waystone score');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneRequiredScore === 30, 'HUD action proof must include the route waystone requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeWaystoneRouteIds) && browserPresence.data.hudAction.state.routeWaystoneRouteIds.includes('moonbridge-bamboo-trail'), 'HUD action proof must include the Moonbridge route waystone route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeWaystoneRouteIds) && browserPresence.data.hudAction.state.routeWaystoneRouteIds.includes('cloudbell-reed-bank'), 'HUD action proof must include the Cloudbell route waystone route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeWaystoneInvitedSpiritIds) && browserPresence.data.hudAction.state.routeWaystoneInvitedSpiritIds.includes('jintari'), 'HUD action proof must include Jintari waystone invitation proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.routeWaystoneInvitedSpiritIds) && browserPresence.data.hudAction.state.routeWaystoneInvitedSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen waystone invitation proof');
assert(browserPresence.data?.hudAction?.state?.routeWaystoneSealClaimed === true, 'HUD action proof must include the no-real-value waystone travel seal proof');
assert(browserPresence.data?.hudAction?.state?.nurtureRiteProof === true, 'HUD action proof must include the nurture rite proof');
assert(browserPresence.data?.hudAction?.state?.nurtureRiteId === 'jade-moonwell-nurture-rite', 'HUD action proof must include the Jade Moonwell Nurture Rite id');
assert(browserPresence.data?.hudAction?.state?.nurtureRiteName === 'Jade Moonwell Nurture Rite', 'HUD action proof must include the Jade Moonwell Nurture Rite name');
assert(browserPresence.data?.hudAction?.state?.nurtureRiteScore >= 40, 'HUD action proof must include a passing nurture rite score');
assert(browserPresence.data?.hudAction?.state?.nurtureRiteRequiredScore === 40, 'HUD action proof must include the nurture rite requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteRosterIds) && browserPresence.data.hudAction.state.nurtureRiteRosterIds.includes('lirabao'), 'HUD action proof must include Lirabao in the nurture rite roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteRosterIds) && browserPresence.data.hudAction.state.nurtureRiteRosterIds.includes('jintari'), 'HUD action proof must include Jintari in the nurture rite roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteRosterIds) && browserPresence.data.hudAction.state.nurtureRiteRosterIds.includes('aozhen'), 'HUD action proof must include Aozhen in the nurture rite roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteCaredSpiritIds) && browserPresence.data.hudAction.state.nurtureRiteCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao nurture care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteCaredSpiritIds) && browserPresence.data.hudAction.state.nurtureRiteCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari nurture care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurtureRiteCaredSpiritIds) && browserPresence.data.hudAction.state.nurtureRiteCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen nurture care proof');
assert(browserPresence.data?.hudAction?.state?.nurtureRibbonClaimed === true, 'HUD action proof must include the no-real-value nurture ribbon proof');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaProof === true, 'HUD action proof must include the Jade Teahouse Recovery proof');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaId === 'jade-teahouse-recovery', 'HUD action proof must include the Jade Teahouse Recovery id');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaName === 'Jade Teahouse Recovery', 'HUD action proof must include the Jade Teahouse Recovery name');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaScore >= 36, 'HUD action proof must include a passing recovery tea score');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaRequiredScore === 36, 'HUD action proof must include the recovery tea requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaPartyIds) && browserPresence.data.hudAction.state.recoveryTeaPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao recovery tea party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaPartyIds) && browserPresence.data.hudAction.state.recoveryTeaPartyIds.includes('jintari'), 'HUD action proof must include Jintari recovery tea party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaPartyIds) && browserPresence.data.hudAction.state.recoveryTeaPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen recovery tea party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaCaredSpiritIds) && browserPresence.data.hudAction.state.recoveryTeaCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao recovery tea care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaCaredSpiritIds) && browserPresence.data.hudAction.state.recoveryTeaCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari recovery tea care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.recoveryTeaCaredSpiritIds) && browserPresence.data.hudAction.state.recoveryTeaCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen recovery tea care proof');
assert(browserPresence.data?.hudAction?.state?.recoveryTeaCupClaimed === true, 'HUD action proof must include the no-real-value recovery tea cup proof');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumProof === true, 'HUD action proof must include the kinship album proof');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumId === 'jade-kinship-album', 'HUD action proof must include the Jade Kinship Album id');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumName === 'Jade Kinship Album', 'HUD action proof must include the Jade Kinship Album name');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumScore >= 38, 'HUD action proof must include a passing kinship album score');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumRequiredScore === 38, 'HUD action proof must include the kinship album requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao in the kinship album roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumSpiritIds.includes('jintari'), 'HUD action proof must include Jintari in the kinship album roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen in the kinship album roster');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumCaredSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao kinship care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumCaredSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari kinship care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.kinshipAlbumCaredSpiritIds) && browserPresence.data.hudAction.state.kinshipAlbumCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen kinship care proof');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumTotalBond >= 15, 'HUD action proof must include full-roster kinship bond proof');
assert(browserPresence.data?.hudAction?.state?.kinshipAlbumClaimed === true, 'HUD action proof must include the no-real-value kinship album proof');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveProof === true, 'HUD action proof must include the Jade Nursery Grove proof');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveId === 'jade-nursery-grove', 'HUD action proof must include the Jade Nursery Grove id');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveName === 'Jade Nursery Grove', 'HUD action proof must include the Jade Nursery Grove name');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveScore >= 52, 'HUD action proof must include a passing nursery grove score');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveRequiredScore === 52, 'HUD action proof must include the nursery grove requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao nursery roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveSpiritIds.includes('jintari'), 'HUD action proof must include Jintari nursery roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen nursery roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGrovePartyIds) && browserPresence.data.hudAction.state.nurseryGrovePartyIds.includes('lirabao'), 'HUD action proof must include Lirabao nursery party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGrovePartyIds) && browserPresence.data.hudAction.state.nurseryGrovePartyIds.includes('jintari'), 'HUD action proof must include Jintari nursery party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGrovePartyIds) && browserPresence.data.hudAction.state.nurseryGrovePartyIds.includes('aozhen'), 'HUD action proof must include Aozhen nursery party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveCaredSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao nursery care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveCaredSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari nursery care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.nurseryGroveCaredSpiritIds) && browserPresence.data.hudAction.state.nurseryGroveCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen nursery care proof');
assert(browserPresence.data?.hudAction?.state?.nurseryGroveTotalBond >= 15, 'HUD action proof must include full-roster nursery bond proof');
assert(browserPresence.data?.hudAction?.state?.nurserySproutClaimed === true, 'HUD action proof must include the no-real-value nursery sprout proof');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceProof === true, 'HUD action proof must include the Jade Bloom Ascendance proof');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceId === 'jade-bloom-ascendance', 'HUD action proof must include the Jade Bloom Ascendance id');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceName === 'Jade Bloom Ascendance', 'HUD action proof must include the Jade Bloom Ascendance name');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceFormTitle === 'Jade Bloom Form', 'HUD action proof must include the Jade Bloom Form title');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceScore >= 58, 'HUD action proof must include a passing bloom ascendance score');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceRequiredScore === 58, 'HUD action proof must include the bloom ascendance requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao bloom ascendance roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceSpiritIds.includes('jintari'), 'HUD action proof must include Jintari bloom ascendance roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen bloom ascendance roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendancePartyIds) && browserPresence.data.hudAction.state.bloomAscendancePartyIds.includes('lirabao'), 'HUD action proof must include Lirabao bloom ascendance party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendancePartyIds) && browserPresence.data.hudAction.state.bloomAscendancePartyIds.includes('jintari'), 'HUD action proof must include Jintari bloom ascendance party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendancePartyIds) && browserPresence.data.hudAction.state.bloomAscendancePartyIds.includes('aozhen'), 'HUD action proof must include Aozhen bloom ascendance party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceCaredSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao bloom ascendance care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceCaredSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari bloom ascendance care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.bloomAscendanceCaredSpiritIds) && browserPresence.data.hudAction.state.bloomAscendanceCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen bloom ascendance care proof');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceTotalBond >= 15, 'HUD action proof must include full-roster bloom ascendance bond proof');
assert(browserPresence.data?.hudAction?.state?.bloomAscendanceSigilClaimed === true, 'HUD action proof must include the no-real-value bloom ascendance sigil proof');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterProof === true, 'HUD action proof must include the Jade Lineage Register proof');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterId === 'jade-lineage-register', 'HUD action proof must include the Jade Lineage Register id');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterName === 'Jade Lineage Register', 'HUD action proof must include the Jade Lineage Register name');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterScore >= 60, 'HUD action proof must include a passing lineage register score');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterRequiredScore === 60, 'HUD action proof must include the lineage register requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao lineage roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterSpiritIds.includes('jintari'), 'HUD action proof must include Jintari lineage roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen lineage roster proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterPartyIds) && browserPresence.data.hudAction.state.lineageRegisterPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao lineage party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterPartyIds) && browserPresence.data.hudAction.state.lineageRegisterPartyIds.includes('jintari'), 'HUD action proof must include Jintari lineage party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterPartyIds) && browserPresence.data.hudAction.state.lineageRegisterPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen lineage party proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterCaredSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterCaredSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao lineage care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterCaredSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterCaredSpiritIds.includes('jintari'), 'HUD action proof must include Jintari lineage care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterCaredSpiritIds) && browserPresence.data.hudAction.state.lineageRegisterCaredSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen lineage care proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.lineageRegisterMilestoneLabels) && browserPresence.data.hudAction.state.lineageRegisterMilestoneLabels.includes('Moonwell Bloom Form'), 'HUD action proof must include lineage milestone proof');
assert(browserPresence.data?.hudAction?.state?.lineageRegisterSealClaimed === true, 'HUD action proof must include the no-real-value lineage register seal proof');
assert(browserPresence.data?.hudAction?.state?.captureRiteProof === true, 'HUD action proof must include the capture rite proof');
assert(browserPresence.data?.hudAction?.state?.captureRiteId === 'jade-court-capture-rite', 'HUD action proof must include the Jade Capture Rite id');
assert(browserPresence.data?.hudAction?.state?.captureRiteName === 'Jade Capture Rite', 'HUD action proof must include the Jade Capture Rite name');
assert(browserPresence.data?.hudAction?.state?.captureRiteScore >= 38, 'HUD action proof must include a passing capture rite score');
assert(browserPresence.data?.hudAction?.state?.captureRiteRequiredScore === 38, 'HUD action proof must include the capture rite requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteSpiritIds) && browserPresence.data.hudAction.state.captureRiteSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao capture rite proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteSpiritIds) && browserPresence.data.hudAction.state.captureRiteSpiritIds.includes('jintari'), 'HUD action proof must include Jintari capture rite proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteSpiritIds) && browserPresence.data.hudAction.state.captureRiteSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen capture rite proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteRouteInvitedSpiritIds) && browserPresence.data.hudAction.state.captureRiteRouteInvitedSpiritIds.includes('jintari'), 'HUD action proof must include Jintari route invitation inside capture rite');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteRouteInvitedSpiritIds) && browserPresence.data.hudAction.state.captureRiteRouteInvitedSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen route invitation inside capture rite');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteLureItemIds) && browserPresence.data.hudAction.state.captureRiteLureItemIds.includes('lantern-harmony-tea'), 'HUD action proof must include Lantern Harmony Tea capture rite lure');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.captureRiteLureItemIds) && browserPresence.data.hudAction.state.captureRiteLureItemIds.includes('jade-thread-charm'), 'HUD action proof must include Jade Thread Charm capture rite lure');
assert(browserPresence.data?.hudAction?.state?.captureRiteClaimed === true, 'HUD action proof must include the no-real-value capture rite tally proof');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasProof === true, 'HUD action proof must include the encounter atlas proof');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasId === 'jade-encounter-atlas', 'HUD action proof must include the Jade Encounter Atlas id');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasName === 'Jade Encounter Atlas', 'HUD action proof must include the Jade Encounter Atlas name');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasScore >= 44, 'HUD action proof must include a passing encounter atlas score');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasRequiredScore === 44, 'HUD action proof must include the encounter atlas requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasRouteIds) && browserPresence.data.hudAction.state.encounterAtlasRouteIds.includes('moonbridge-bamboo-trail'), 'HUD action proof must include the Moonbridge encounter atlas route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasRouteIds) && browserPresence.data.hudAction.state.encounterAtlasRouteIds.includes('cloudbell-reed-bank'), 'HUD action proof must include the Cloudbell encounter atlas route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao encounter atlas proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasSpiritIds.includes('jintari'), 'HUD action proof must include Jintari encounter atlas proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen encounter atlas proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasCapturedSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasCapturedSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao encounter atlas capture proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasCapturedSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasCapturedSpiritIds.includes('jintari'), 'HUD action proof must include Jintari encounter atlas capture proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasCapturedSpiritIds) && browserPresence.data.hudAction.state.encounterAtlasCapturedSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen encounter atlas capture proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasRarityTiers) && browserPresence.data.hudAction.state.encounterAtlasRarityTiers.includes('common'), 'HUD action proof must include common encounter atlas rarity');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasRarityTiers) && browserPresence.data.hudAction.state.encounterAtlasRarityTiers.includes('uncommon'), 'HUD action proof must include uncommon encounter atlas rarity');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.encounterAtlasRarityTiers) && browserPresence.data.hudAction.state.encounterAtlasRarityTiers.includes('rare'), 'HUD action proof must include rare encounter atlas rarity');
assert(browserPresence.data?.hudAction?.state?.encounterAtlasClaimed === true, 'HUD action proof must include the no-real-value encounter atlas proof');
assert(browserPresence.data?.hudAction?.state?.dojoLadderProof === true, 'HUD action proof must include the Jade Dojo Ladder proof');
assert(browserPresence.data?.hudAction?.state?.dojoLadderId === 'jade-dojo-ladder', 'HUD action proof must include the Jade Dojo Ladder id');
assert(browserPresence.data?.hudAction?.state?.dojoLadderName === 'Jade Dojo Ladder', 'HUD action proof must include the Jade Dojo Ladder name');
assert(browserPresence.data?.hudAction?.state?.dojoLadderScore >= 44, 'HUD action proof must include a passing dojo ladder score');
assert(browserPresence.data?.hudAction?.state?.dojoLadderRequiredScore === 44, 'HUD action proof must include the dojo ladder requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.dojoLadderPartyIds) && browserPresence.data.hudAction.state.dojoLadderPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao dojo ladder proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.dojoLadderPartyIds) && browserPresence.data.hudAction.state.dojoLadderPartyIds.includes('jintari'), 'HUD action proof must include Jintari dojo ladder proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.dojoLadderPartyIds) && browserPresence.data.hudAction.state.dojoLadderPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen dojo ladder proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.dojoLadderOpponentIds) && browserPresence.data.hudAction.state.dojoLadderOpponentIds.includes('jade-echo-apprentice'), 'HUD action proof must include the Jade Echo Apprentice dojo ladder clear');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.dojoLadderOpponentIds) && browserPresence.data.hudAction.state.dojoLadderOpponentIds.includes('silk-river-disciple'), 'HUD action proof must include the Silk River Disciple dojo ladder clear');
assert(browserPresence.data?.hudAction?.state?.dojoLadderSealClaimed === true, 'HUD action proof must include the no-real-value dojo ladder seal proof');
assert(browserPresence.data?.hudAction?.state?.tournamentProof === true, 'HUD action proof must include the Jade Banner Tournament proof');
assert(browserPresence.data?.hudAction?.state?.tournamentId === 'jade-banner-tournament', 'HUD action proof must include the Jade Banner Tournament id');
assert(browserPresence.data?.hudAction?.state?.tournamentName === 'Jade Banner Tournament', 'HUD action proof must include the Jade Banner Tournament name');
assert(browserPresence.data?.hudAction?.state?.tournamentScore >= 38, 'HUD action proof must include a passing tournament score');
assert(browserPresence.data?.hudAction?.state?.tournamentRequiredScore === 38, 'HUD action proof must include the tournament requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.tournamentPartyIds) && browserPresence.data.hudAction.state.tournamentPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao tournament proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.tournamentPartyIds) && browserPresence.data.hudAction.state.tournamentPartyIds.includes('jintari'), 'HUD action proof must include Jintari tournament proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.tournamentPartyIds) && browserPresence.data.hudAction.state.tournamentPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen tournament proof');
assert(browserPresence.data?.hudAction?.state?.tournamentPresenceCount >= 2, 'HUD action proof must include two-tester tournament presence');
assert(browserPresence.data?.hudAction?.state?.tournamentPennantClaimed === true, 'HUD action proof must include the no-real-value tournament pennant proof');
assert(browserPresence.data?.hudAction?.state?.rivalCircleProof === true, 'HUD action proof must include the Jade Rival Circle proof');
assert(browserPresence.data?.hudAction?.state?.rivalCircleId === 'jade-rival-circle', 'HUD action proof must include the Jade Rival Circle id');
assert(browserPresence.data?.hudAction?.state?.rivalCircleName === 'Jade Rival Circle', 'HUD action proof must include the Jade Rival Circle name');
assert(browserPresence.data?.hudAction?.state?.rivalCircleRivalName === 'Qinghei Banner Circle', 'HUD action proof must include the rival circle opponent name');
assert(browserPresence.data?.hudAction?.state?.rivalCircleScore >= 46, 'HUD action proof must include a passing rival circle score');
assert(browserPresence.data?.hudAction?.state?.rivalCircleRequiredScore === 46, 'HUD action proof must include the rival circle requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.rivalCirclePartyIds) && browserPresence.data.hudAction.state.rivalCirclePartyIds.includes('lirabao'), 'HUD action proof must include Lirabao rival circle proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.rivalCirclePartyIds) && browserPresence.data.hudAction.state.rivalCirclePartyIds.includes('jintari'), 'HUD action proof must include Jintari rival circle proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.rivalCirclePartyIds) && browserPresence.data.hudAction.state.rivalCirclePartyIds.includes('aozhen'), 'HUD action proof must include Aozhen rival circle proof');
assert(browserPresence.data?.hudAction?.state?.rivalCircleMarkClaimed === true, 'HUD action proof must include the no-real-value rival circle mark proof');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilProof === true, 'HUD action proof must include the Jade Sifu Council proof');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilId === 'jade-sifu-council', 'HUD action proof must include the Jade Sifu Council id');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilName === 'Jade Sifu Council', 'HUD action proof must include the Jade Sifu Council name');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilScore >= 62, 'HUD action proof must include a passing sifu council score');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilRequiredScore === 62, 'HUD action proof must include the sifu council requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilPartyIds) && browserPresence.data.hudAction.state.sifuCouncilPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao sifu council proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilPartyIds) && browserPresence.data.hudAction.state.sifuCouncilPartyIds.includes('jintari'), 'HUD action proof must include Jintari sifu council proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilPartyIds) && browserPresence.data.hudAction.state.sifuCouncilPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen sifu council proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilMemberIds) && browserPresence.data.hudAction.state.sifuCouncilMemberIds.includes('sifu-narao'), 'HUD action proof must include Sifu Narao council seal proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilMemberIds) && browserPresence.data.hudAction.state.sifuCouncilMemberIds.includes('warden-meilin'), 'HUD action proof must include Warden Meilin council seal proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.sifuCouncilMemberIds) && browserPresence.data.hudAction.state.sifuCouncilMemberIds.includes('keeper-haoran'), 'HUD action proof must include Keeper Haoran council seal proof');
assert(browserPresence.data?.hudAction?.state?.sifuCouncilCrestClaimed === true, 'HUD action proof must include the no-real-value sifu council crest proof');
assert(browserPresence.data?.hudAction?.state?.summitCircuitProof === true, 'HUD action proof must include the Jade Summit Circuit proof');
assert(browserPresence.data?.hudAction?.state?.summitCircuitId === 'jade-summit-circuit', 'HUD action proof must include the Jade Summit Circuit id');
assert(browserPresence.data?.hudAction?.state?.summitCircuitName === 'Jade Summit Circuit', 'HUD action proof must include the Jade Summit Circuit name');
assert(browserPresence.data?.hudAction?.state?.summitCircuitScore >= 80, 'HUD action proof must include a passing summit circuit score');
assert(browserPresence.data?.hudAction?.state?.summitCircuitRequiredScore === 80, 'HUD action proof must include the summit circuit requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitPartyIds) && browserPresence.data.hudAction.state.summitCircuitPartyIds.includes('lirabao'), 'HUD action proof must include Lirabao summit circuit proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitPartyIds) && browserPresence.data.hudAction.state.summitCircuitPartyIds.includes('jintari'), 'HUD action proof must include Jintari summit circuit proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitPartyIds) && browserPresence.data.hudAction.state.summitCircuitPartyIds.includes('aozhen'), 'HUD action proof must include Aozhen summit circuit proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitSealIds) && browserPresence.data.hudAction.state.summitCircuitSealIds.includes('jade-dojo-seal'), 'HUD action proof must include the summit dojo seal proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitSealIds) && browserPresence.data.hudAction.state.summitCircuitSealIds.includes('banner-ring-seal'), 'HUD action proof must include the summit tournament seal proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitSealIds) && browserPresence.data.hudAction.state.summitCircuitSealIds.includes('qinghei-rival-seal'), 'HUD action proof must include the summit rival seal proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.summitCircuitSealIds) && browserPresence.data.hudAction.state.summitCircuitSealIds.includes('sifu-council-seal'), 'HUD action proof must include the summit council seal proof');
assert(browserPresence.data?.hudAction?.state?.summitCircuitLaurelClaimed === true, 'HUD action proof must include the no-real-value summit laurel proof');
assert(browserPresence.data?.hudAction?.state?.commissionProof === true, 'HUD action proof must include the guild commission proof');
assert(browserPresence.data?.hudAction?.state?.commissionId === 'jade-court-commission-ledger', 'HUD action proof must include the Jade Court Commission Ledger id');
assert(browserPresence.data?.hudAction?.state?.commissionKnotClaimed === true, 'HUD action proof must include the no-real-value commission knot proof');
assert(browserPresence.data?.hudAction?.state?.emoteProof === true, 'HUD action proof must include local emote proof for the guild rally');
assert(browserPresence.data?.hudAction?.state?.rallyProof === true, 'HUD action proof must include the two-tester social rally proof');
assert(browserPresence.data?.hudAction?.state?.rallyId === 'jade-courtyard-rally', 'HUD action proof must include the Jade Courtyard Rally id');
assert(browserPresence.data?.hudAction?.state?.rallyScore >= 22, 'HUD action proof must include a passing social rally score');
assert(browserPresence.data?.hudAction?.state?.rallyPresenceCount >= 2, 'HUD action proof must include two local presences for the social rally');
assert(browserPresence.data?.hudAction?.state?.rallyKnotClaimed === true, 'HUD action proof must include the no-real-value rally knot proof');
assert(browserPresence.data?.hudAction?.state?.storyChapterProof === true, 'HUD action proof must include the Jade Scroll Story Chapter proof');
assert(browserPresence.data?.hudAction?.state?.storyChapterId === 'jade-scroll-story-chapter', 'HUD action proof must include the Jade Scroll Story Chapter id');
assert(browserPresence.data?.hudAction?.state?.storyChapterName === 'Jade Scroll Story Chapter', 'HUD action proof must include the Jade Scroll Story Chapter name');
assert(browserPresence.data?.hudAction?.state?.storyChapterScore >= 42, 'HUD action proof must include a passing story chapter score');
assert(browserPresence.data?.hudAction?.state?.storyChapterRequiredScore === 42, 'HUD action proof must include the story chapter requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.storyChapterRouteIds) && browserPresence.data.hudAction.state.storyChapterRouteIds.includes('moonbridge-bamboo-trail'), 'HUD action proof must include the Moonbridge story route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.storyChapterRouteIds) && browserPresence.data.hudAction.state.storyChapterRouteIds.includes('cloudbell-reed-bank'), 'HUD action proof must include the Cloudbell story route');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.storyChapterQuestIds) && browserPresence.data.hudAction.state.storyChapterQuestIds.length === 3, 'HUD action proof must include all three story quest vows');
assert(browserPresence.data?.hudAction?.state?.storyScrollClaimed === true, 'HUD action proof must include the no-real-value story scroll proof');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseProof === true, 'HUD action proof must include the Jade Insignia Case proof');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseId === 'jade-insignia-case', 'HUD action proof must include the Jade Insignia Case id');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseName === 'Jade Insignia Case', 'HUD action proof must include the Jade Insignia Case name');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseScore >= 34, 'HUD action proof must include a passing insignia case score');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseRequiredScore === 34, 'HUD action proof must include the insignia case requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.insigniaCaseSpiritIds) && browserPresence.data.hudAction.state.insigniaCaseSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao insignia case proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.insigniaCaseSpiritIds) && browserPresence.data.hudAction.state.insigniaCaseSpiritIds.includes('jintari'), 'HUD action proof must include Jintari insignia case proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.insigniaCaseSpiritIds) && browserPresence.data.hudAction.state.insigniaCaseSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen insignia case proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.insigniaCasePartyIds) && browserPresence.data.hudAction.state.insigniaCasePartyIds.length === 3, 'HUD action proof must include the full insignia case party');
assert(browserPresence.data?.hudAction?.state?.insigniaCaseClaimed === true, 'HUD action proof must include the no-real-value insignia case proof');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleProof === true, 'HUD action proof must include the first-court wayfarer chronicle');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleId === 'jade-wayfarer-chronicle', 'HUD action proof must include the Jade Wayfarer Chronicle id');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleName === 'Jade Wayfarer Chronicle', 'HUD action proof must include the Jade Wayfarer Chronicle name');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleScore >= 75, 'HUD action proof must include a passing chronicle score');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleRequiredScore === 75, 'HUD action proof must include the wayfarer chronicle requirement');
assert(browserPresence.data?.hudAction?.state?.wayfarerChronicleClaspClaimed === true, 'HUD action proof must include the no-real-value chronicle clasp proof');
assert(browserPresence.data?.hudAction?.state?.guildAscensionProof === true, 'HUD action proof must include the closed-alpha guild ascension trial');
assert(browserPresence.data?.hudAction?.state?.guildAscensionTrialId === 'jade-court-ascension-trial', 'HUD action proof must include the Jade Court Ascension Trial id');
assert(browserPresence.data?.hudAction?.state?.guildAscensionTrialName === 'Jade Court Ascension Trial', 'HUD action proof must include the Jade Court Ascension Trial name');
assert(browserPresence.data?.hudAction?.state?.guildAscensionScore >= 64, 'HUD action proof must include a passing guild ascension score');
assert(browserPresence.data?.hudAction?.state?.guildAscensionRequiredScore === 64, 'HUD action proof must include the guild ascension score requirement');
assert(browserPresence.data?.hudAction?.state?.guildAscensionRibbonClaimed === true, 'HUD action proof must include the no-real-value ascension ribbon proof');
assert(browserPresence.data?.hudAction?.state?.sanctuaryRiteProof === true, 'HUD action proof must include the care-shrine sanctuary rite');
assert(browserPresence.data?.hudAction?.state?.sanctuaryRiteId === 'jade-court-sanctuary-rite', 'HUD action proof must include the Jade Court Sanctuary Rite id');
assert(browserPresence.data?.hudAction?.state?.sanctuaryRiteName === 'Jade Court Sanctuary Rite', 'HUD action proof must include the Jade Court Sanctuary Rite name');
assert(browserPresence.data?.hudAction?.state?.sanctuaryRiteScore >= 24, 'HUD action proof must include a passing sanctuary rite score');
assert(browserPresence.data?.hudAction?.state?.sanctuaryRiteRequiredScore === 24, 'HUD action proof must include the sanctuary rite requirement');
assert(browserPresence.data?.hudAction?.state?.sanctuaryBellClaimed === true, 'HUD action proof must include the no-real-value sanctuary bell proof');
assert(browserPresence.data?.hudAction?.state?.harmonyFormProof === true, 'HUD action proof must include party harmony proof');
assert(browserPresence.data?.hudAction?.state?.harmonyFormId === 'triune-jade-harmony', 'HUD action proof must include the Triune Jade Harmony id');
assert(browserPresence.data?.hudAction?.state?.harmonySashClaimed === true, 'HUD action proof must include the no-real-value harmony sash proof');
assert(browserPresence.data?.hudAction?.state?.harmonyTrialProof === true, 'HUD action proof must include harmony trial proof');
assert(browserPresence.data?.hudAction?.state?.harmonyTrialId === 'jade-echo-concord', 'HUD action proof must include the Jade Echo Concord id');
assert(browserPresence.data?.hudAction?.state?.concordTallyClaimed === true, 'HUD action proof must include the no-real-value concord tally proof');
assert(browserPresence.data?.hudAction?.state?.teamSparMatchProof === true, 'HUD action proof must include team spar match proof');
assert(browserPresence.data?.hudAction?.state?.teamSparMatchId === 'jade-mirror-team-match', 'HUD action proof must include the Jade Mirror Team Match id');
assert(browserPresence.data?.hudAction?.state?.teamMatchRibbonClaimed === true, 'HUD action proof must include the no-real-value team match ribbon proof');
assert(browserPresence.data?.hudAction?.state?.mentorChallengeProof === true, 'HUD action proof must include the mentor challenge proof');
assert(browserPresence.data?.hudAction?.state?.mentorChallengeId === 'silk-banner-mentor-drill', 'HUD action proof must include the Silk Banner Mentor Drill id');
assert(browserPresence.data?.hudAction?.state?.mentorChallengeName === 'Silk Banner Mentor Drill', 'HUD action proof must include the Silk Banner Mentor Drill name');
assert(browserPresence.data?.hudAction?.state?.mentorChallengeScore >= 28, 'HUD action proof must include a passing mentor challenge score');
assert(browserPresence.data?.hudAction?.state?.mentorSealClaimed === true, 'HUD action proof must include the no-real-value mentor seal proof');
assert(browserPresence.data?.hudAction?.state?.techniqueProof === true, 'HUD action proof must include the technique dojo loop');
assert(browserPresence.data?.hudAction?.state?.techniqueMasteryXp >= 1, 'HUD action proof must include technique mastery XP');
assert(browserPresence.data?.hudAction?.state?.tacticProof === true, 'HUD action proof must include the battle tactic scroll loop');
assert(browserPresence.data?.hudAction?.state?.lastTacticId === 'goldleaf-opening', 'HUD action proof must include the Goldleaf tactic');
assert(browserPresence.data?.hudAction?.state?.tacticMasteryXp >= 1, 'HUD action proof must include tactic mastery XP');
assert(browserPresence.data?.hudAction?.state?.techniqueLoadoutProof === true, 'HUD action proof must include the technique loadout loop');
assert(browserPresence.data?.hudAction?.state?.techniqueLoadoutId === 'jade-step-loadout', 'HUD action proof must include the Jade Step Loadout id');
assert(browserPresence.data?.hudAction?.state?.loadoutSlipClaimed === true, 'HUD action proof must include the no-real-value loadout slip proof');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexProof === true, 'HUD action proof must include the technique codex loop');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexId === 'jade-technique-codex', 'HUD action proof must include the Jade Technique Codex id');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexName === 'Jade Technique Codex', 'HUD action proof must include the Jade Technique Codex name');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexScore >= 46, 'HUD action proof must include a passing technique codex score');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexRequiredScore === 46, 'HUD action proof must include the technique codex requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.techniqueCodexMoveIds) && browserPresence.data.hudAction.state.techniqueCodexMoveIds.includes('lantern-pulse'), 'HUD action proof must include Lantern Pulse in the technique codex');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.techniqueCodexMoveIds) && browserPresence.data.hudAction.state.techniqueCodexMoveIds.includes('goldleaf-feint'), 'HUD action proof must include Goldleaf Feint in the technique codex');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.techniqueCodexMoveIds) && browserPresence.data.hudAction.state.techniqueCodexMoveIds.includes('skybell-guard'), 'HUD action proof must include Skybell Guard in the technique codex');
assert(browserPresence.data?.hudAction?.state?.techniqueCodexSealClaimed === true, 'HUD action proof must include the no-real-value technique codex seal proof');
assert(browserPresence.data?.hudAction?.state?.traitAttunementProof === true, 'HUD action proof must include the spirit trait attunement loop');
assert(browserPresence.data?.hudAction?.state?.traitAttunementId === 'jade-heart-trait', 'HUD action proof must include the Jade Heart trait id');
assert(browserPresence.data?.hudAction?.state?.traitLabel === 'Skybell Wayfinder', 'HUD action proof must include the active spirit trait label');
assert(browserPresence.data?.hudAction?.state?.traitThreadClaimed === true, 'HUD action proof must include the no-real-value trait thread proof');
assert(browserPresence.data?.hudAction?.state?.conditionWeaveProof === true, 'HUD action proof must include the battle condition weave loop');
assert(browserPresence.data?.hudAction?.state?.conditionWeaveId === 'jade-mirror-condition-weave', 'HUD action proof must include the Jade Mirror Condition Weave id');
assert(browserPresence.data?.hudAction?.state?.conditionWeaveScore >= 34, 'HUD action proof must include a passing condition weave score');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.conditionIds) && browserPresence.data.hudAction.state.conditionIds.includes('lantern-ward'), 'HUD action proof must include Lantern Ward');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.conditionIds) && browserPresence.data.hudAction.state.conditionIds.includes('goldleaf-tempo'), 'HUD action proof must include Goldleaf Tempo');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.conditionIds) && browserPresence.data.hudAction.state.conditionIds.includes('skybell-guard'), 'HUD action proof must include Skybell Guard');
assert(browserPresence.data?.hudAction?.state?.conditionCharmClaimed === true, 'HUD action proof must include the no-real-value condition charm proof');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixProof === true, 'HUD action proof must include the affinity matrix loop');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixId === 'jade-affinity-matrix', 'HUD action proof must include the Jade Affinity Matrix id');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixName === 'Jade Affinity Matrix', 'HUD action proof must include the Jade Affinity Matrix name');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixScore >= 44, 'HUD action proof must include a passing affinity matrix score');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixRequiredScore === 44, 'HUD action proof must include the affinity matrix requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixSpiritIds) && browserPresence.data.hudAction.state.affinityMatrixSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao in the affinity matrix');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixSpiritIds) && browserPresence.data.hudAction.state.affinityMatrixSpiritIds.includes('jintari'), 'HUD action proof must include Jintari in the affinity matrix');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixSpiritIds) && browserPresence.data.hudAction.state.affinityMatrixSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen in the affinity matrix');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixAffinityLabels) && browserPresence.data.hudAction.state.affinityMatrixAffinityLabels.includes('blossom'), 'HUD action proof must include the blossom affinity');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixAffinityLabels) && browserPresence.data.hudAction.state.affinityMatrixAffinityLabels.includes('citrus-gold'), 'HUD action proof must include the citrus-gold affinity');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixAffinityLabels) && browserPresence.data.hudAction.state.affinityMatrixAffinityLabels.includes('sky-jade'), 'HUD action proof must include the sky-jade affinity');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixConditionIds) && browserPresence.data.hudAction.state.affinityMatrixConditionIds.includes('lantern-ward'), 'HUD action proof must include Lantern Ward in the affinity matrix');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixConditionIds) && browserPresence.data.hudAction.state.affinityMatrixConditionIds.includes('goldleaf-tempo'), 'HUD action proof must include Goldleaf Tempo in the affinity matrix');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.affinityMatrixConditionIds) && browserPresence.data.hudAction.state.affinityMatrixConditionIds.includes('skybell-guard'), 'HUD action proof must include Skybell Guard in the affinity matrix');
assert(browserPresence.data?.hudAction?.state?.affinityMatrixSealClaimed === true, 'HUD action proof must include the no-real-value matrix seal proof');
assert(browserPresence.data?.hudAction?.state?.starterVowProof === true, 'HUD action proof must include the starter vow loop');
assert(browserPresence.data?.hudAction?.state?.starterVowId === 'jade-starter-vow', 'HUD action proof must include the Jade Starter Vow id');
assert(browserPresence.data?.hudAction?.state?.starterVowName === 'Jade Starter Vow', 'HUD action proof must include the Jade Starter Vow name');
assert(browserPresence.data?.hudAction?.state?.starterVowScore >= 18, 'HUD action proof must include a passing starter vow score');
assert(browserPresence.data?.hudAction?.state?.starterVowRequiredScore === 18, 'HUD action proof must include the starter vow requirement');
assert(browserPresence.data?.hudAction?.state?.starterKnotClaimed === true, 'HUD action proof must include the no-real-value starter knot proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.starterVowItemIds) && browserPresence.data.hudAction.state.starterVowItemIds.includes('mochirii-guild-seal'), 'HUD action proof must include the Mochirii Guild Seal starter input');
assert(browserPresence.data?.hudAction?.state?.relicAttunementProof === true, 'HUD action proof must include the relic attunement loop');
assert(browserPresence.data?.hudAction?.state?.relicAttunementId === 'jade-relic-attunement', 'HUD action proof must include the Jade Relic Attunement id');
assert(browserPresence.data?.hudAction?.state?.relicAttunementName === 'Jade Relic Attunement', 'HUD action proof must include the Jade Relic Attunement name');
assert(browserPresence.data?.hudAction?.state?.relicAttunementScore >= 57, 'HUD action proof must include a passing relic attunement score');
assert(browserPresence.data?.hudAction?.state?.relicAttunementRequiredScore === 57, 'HUD action proof must include the relic attunement requirement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementSpiritIds) && browserPresence.data.hudAction.state.relicAttunementSpiritIds.includes('lirabao'), 'HUD action proof must include Lirabao in the relic attunement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementSpiritIds) && browserPresence.data.hudAction.state.relicAttunementSpiritIds.includes('jintari'), 'HUD action proof must include Jintari in the relic attunement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementSpiritIds) && browserPresence.data.hudAction.state.relicAttunementSpiritIds.includes('aozhen'), 'HUD action proof must include Aozhen in the relic attunement');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementItemIds) && browserPresence.data.hudAction.state.relicAttunementItemIds.includes('jade-thread-charm'), 'HUD action proof must include the Jade Thread Charm relic input');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementItemIds) && browserPresence.data.hudAction.state.relicAttunementItemIds.includes('lantern-harmony-tea'), 'HUD action proof must include the Lantern Harmony Tea relic input');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.relicAttunementItemIds) && browserPresence.data.hudAction.state.relicAttunementItemIds.includes('jade-court-provision-satchel'), 'HUD action proof must include the provision satchel relic input');
assert(browserPresence.data?.hudAction?.state?.relicLabel === 'Skybell Thread Cord', 'HUD action proof must include the active spirit relic label');
assert(browserPresence.data?.hudAction?.state?.relicSilkCordClaimed === true, 'HUD action proof must include the no-real-value relic silk cord proof');
assert(browserPresence.data?.hudAction?.state?.guildRankProof === true, 'HUD action proof must include the guild rank trial loop');
assert(browserPresence.data?.hudAction?.state?.guildRankId === 'jade-court-initiate', 'HUD action proof must include the Jade Court rank trial');
assert(browserPresence.data?.hudAction?.state?.growthRiteProof === true, 'HUD action proof must include the growth rite loop');
assert(browserPresence.data?.hudAction?.state?.growthRiteId === 'moonwell-bloom-rite', 'HUD action proof must include the Moonwell growth rite');
assert(browserPresence.data?.hudAction?.state?.affinityProof === true, 'HUD action proof must include the affinity trial loop');
assert(browserPresence.data?.hudAction?.state?.lastAffinityTrialId === 'silk-cinder-trial', 'HUD action proof must include the Silk Cinder affinity trial');
assert(browserPresence.data?.hudAction?.state?.partyIds?.includes?.('jintari') && browserPresence.data?.hudAction?.state?.partyIds?.includes?.('aozhen'), 'HUD action proof must include three-spirit Mochi party formation');
assert(browserPresence.data?.hudAction?.state?.sparLadderXp >= 1, 'HUD action proof must include spar ladder XP');
assert(browserPresence.data?.hudAction?.state?.lastSparOpponentId === 'jade-echo-apprentice', 'HUD action proof must include the first spar ladder opponent');
assert(browserPresence.data?.hudAction?.state?.battleRoundProof === true, 'HUD action proof must include battle round transcript proof');
assert(browserPresence.data?.hudAction?.state?.battleRoundId === 'jade-echo-apprentice-round-1', 'HUD action proof must include the first Jade Echo battle round id');
assert(browserPresence.data?.hudAction?.state?.battleRoundOpponentName === 'Jade Echo Apprentice', 'HUD action proof must include the battle round opponent name');
assert(browserPresence.data?.hudAction?.state?.battleRoundFocusScore >= browserPresence.data?.hudAction?.state?.battleRoundOpponentScore, 'HUD action proof must include a cleared no-injury battle round');
assert(browserPresence.data?.hudAction?.state?.battleRoundVictory === true, 'HUD action proof must include battle round victory proof');
assert(Array.isArray(browserPresence.data?.hudAction?.state?.battleRoundTranscript) && browserPresence.data.hudAction.state.battleRoundTranscript.length >= 1, 'HUD action proof must include battle round transcript participants');
assert(browserPresence.data?.hudAction?.state?.profileViewed === true, 'HUD action proof must include profile view');
assert(browserPresence.data?.hudAction?.state?.guildBuddyProof === true, 'HUD action proof must include local guild buddy proof');
assert(browserPresence.data?.hudAction?.state?.statusMood === 'cozy', 'HUD action proof must include local status/mood proof');
assert(browserPresence.data?.hudAction?.state?.lastInspectedSpiritId === 'aozhen', 'HUD action proof must include spirit inspection');
assert(browserPresence.data?.hudAction?.state?.questChainProof === true, 'HUD action proof must include completed quest-chain proof');
assert(browserPresence.data?.hudAction?.state?.charmListed === true, 'HUD action proof must include fixed market listing');
assert(browserPresence.data?.hudAction?.state?.tradeProof === true, 'HUD action proof must include direct trade proof');
assert(browserPresence.data?.hudAction?.state?.canaryRequested === true, 'HUD action proof must include Canary certificate request');
assert(browserPresence.data?.hudAction?.state?.canaryReturnRequested === true, 'HUD action proof must include Canary return preview');

const screenshotEvidence = {
  page: inspectPng(visualSnapshot.data?.screenshots?.page),
  canvas: inspectPng(visualSnapshot.data?.screenshots?.canvas)
};

for (const [label, item] of Object.entries(screenshotEvidence)) {
  assert(item.exists, `${label} screenshot must exist`);
  assert(item.bytes > 1000, `${label} screenshot must be non-empty`);
  assert(item.width >= 600 && item.height >= 400, `${label} screenshot must be large enough for first-screen review`);
  assert(item.sha256 === item.reportedSha256, `${label} screenshot hash must match visual snapshot report`);
}

const mapObjects = ['welcome-npc', 'guild-seal-chest', 'journal-pavilion', 'expedition-gate', 'route-invitation-altar', 'technique-dojo', 'tactic-scroll-stand', 'affinity-dais', 'care-shrine', 'habitat-grove', 'training-ring', 'party-banner', 'quest-board', 'guild-rank-bell', 'growth-moonwell', 'market-board', 'trade-post', 'canary-shrine'];
for (const id of mapObjects) {
  assert(mapServerSource.includes(`id: '${id}'`), `map server placement missing ${id}`);
}

for (const snippet of [
  "this.setGraphic('sifu-narao')",
  "this.setGraphic('chest')",
  "this.setGraphic('journal-pavilion')",
  "this.setGraphic('expedition-gate')",
  "this.setGraphic('route-invitation-altar')",
  "this.setGraphic('technique-dojo')",
  "this.setGraphic('tactic-scroll-stand')",
  "this.setGraphic('affinity-dais')",
  "this.setGraphic('habitat-grove')",
  "this.setGraphic('party-banner')",
  "this.setGraphic('market-board')",
  "this.setGraphic('trade-post')",
  "this.setGraphic('training-ring')",
  "this.setGraphic('quest-board')",
  "this.setGraphic('guild-rank-bell')",
  "this.setGraphic('growth-moonwell')",
  "this.setGraphic('canary-shrine')",
  "source: 'guild-seal-chest'",
  "source: 'journal-pavilion'",
  "source: 'expedition-gate'",
  "source: 'route-invitation-altar'",
  "source: 'technique-dojo'",
  "source: 'tactic-scroll-stand'",
  "source: 'affinity-dais'",
  "source: 'habitat-grove'",
  "source: 'party-banner'",
  "source: 'training-ring'",
  "source: 'quest-board'",
  "source: 'guild-rank-bell'",
  "source: 'growth-moonwell'",
  "source: 'market-board'",
  "source: 'trade-post'",
  "source: 'canary-shrine'"
]) {
  assert(mapEventSource.includes(snippet), `map event source missing snippet: ${snippet}`);
}
assert(alphaContentSource.includes("jadeLanternCourt: 'Jade Lantern Court'"), 'Jade Lantern Court habitat constant must be present');
assert(alphaContentSource.includes('Jade Court Habitat Bond'), 'Jade Court Habitat Bond content must be present');
assert(alphaContentSource.includes('spirit-habitat-bond'), 'spirit habitat bond source id must be present');
assert(alphaContentSource.includes('Jade Court Research Folio'), 'Jade Court Research Folio content must be present');
assert(alphaContentSource.includes('spirit-research-folio'), 'spirit research folio source id must be present');
assert(alphaContentSource.includes('Jade Court Spirit Compendium'), 'Jade Court Spirit Compendium content must be present');
assert(alphaContentSource.includes('jade-court-compendium-seal'), 'Jade Court Compendium Seal reward must be present');
assert(alphaContentSource.includes('spirit-compendium'), 'spirit compendium source id must be present');
assert(alphaContentSource.includes('Jade Court Provision Satchel'), 'Jade Court Provision Satchel content must be present');
assert(alphaContentSource.includes('item-provision-satchel'), 'item provision satchel source id must be present');
assert(alphaContentSource.includes('jade-mooncake-box'), 'Jade Mooncake Box provision item must be present');
assert(alphaContentSource.includes('Jade Court Craft Writ'), 'Jade Court Craft Writ content must be present');
assert(alphaContentSource.includes('jade-court-craft-writ'), 'Jade Court Craft Writ item must be present');
assert(alphaContentSource.includes('spirit-craft-writ'), 'craft writ source id must be present');
assert(alphaContentSource.includes('Jade Exchange Accord'), 'Jade Exchange Accord content must be present');
assert(alphaContentSource.includes('jade-exchange-accord-tally'), 'Jade Exchange Accord Tally item must be present');
assert(alphaContentSource.includes('resolveTradeExchangeAccord'), 'exchange accord resolver must be present');
assert(alphaContentSource.includes('trade-exchange-accord'), 'exchange accord source id must be present');
assert(alphaContentSource.includes('exchangeAccordProof'), 'exchange accord proof must feed later guild capstones');
assert(alphaContentSource.includes('Jade Cloudbell Waystone'), 'Jade Cloudbell Waystone content must be present');
assert(alphaContentSource.includes('jade-waystone-travel-seal'), 'Jade Waystone Travel Seal item must be present');
assert(alphaContentSource.includes('world-route-waystone'), 'route waystone source id must be present');
assert(alphaContentSource.includes('Jade Moonwell Nurture Rite'), 'Jade Moonwell Nurture Rite content must be present');
assert(alphaContentSource.includes('jade-moonwell-nurture-ribbon'), 'Jade Moonwell Nurture Ribbon item must be present');
assert(alphaContentSource.includes('spirit-nurture-rite'), 'spirit nurture rite source id must be present');
assert(alphaContentSource.includes('Jade Teahouse Recovery'), 'Jade Teahouse Recovery content must be present');
assert(alphaContentSource.includes('jade-teahouse-recovery-cup'), 'Jade Teahouse Recovery Cup item must be present');
assert(alphaContentSource.includes('resolveSpiritRecoveryTea'), 'recovery tea resolver must be present');
assert(alphaContentSource.includes('spirit-recovery-tea'), 'recovery tea source id must be present');
assert(alphaContentSource.includes('Jade Kinship Album'), 'Jade Kinship Album content must be present');
assert(alphaContentSource.includes('jade-kinship-album'), 'Jade Kinship Album item/id must be present');
assert(alphaContentSource.includes('resolveSpiritKinshipAlbum'), 'kinship album resolver must be present');
assert(alphaContentSource.includes('spirit-kinship-album'), 'spirit kinship album source id must be present');
assert(alphaContentSource.includes('kinshipAlbumProof'), 'kinship album proof must feed later capstones');
assert(alphaContentSource.includes('Jade Nursery Grove'), 'Jade Nursery Grove content must be present');
assert(alphaContentSource.includes('jade-nursery-sprout'), 'Jade Nursery Sprout item must be present');
assert(alphaContentSource.includes('resolveSpiritNurseryGrove'), 'nursery grove resolver must be present');
assert(alphaContentSource.includes('spirit-nursery-grove'), 'spirit nursery grove source id must be present');
assert(alphaContentSource.includes('nurseryGroveProof'), 'nursery grove proof must feed later capstones');
assert(alphaContentSource.includes('Jade Bloom Ascendance'), 'Jade Bloom Ascendance content must be present');
assert(alphaContentSource.includes('jade-bloom-ascendance-sigil'), 'Jade Bloom Ascendance Sigil item must be present');
assert(alphaContentSource.includes('resolveSpiritBloomAscendance'), 'bloom ascendance resolver must be present');
assert(alphaContentSource.includes('spirit-bloom-ascendance'), 'spirit bloom ascendance source id must be present');
assert(alphaContentSource.includes('bloomAscendanceProof'), 'bloom ascendance proof must feed later capstones');
assert(alphaContentSource.includes('Jade Lineage Register'), 'Jade Lineage Register content must be present');
assert(alphaContentSource.includes('jade-lineage-register-seal'), 'Jade Lineage Register Seal item must be present');
assert(alphaContentSource.includes('resolveSpiritLineageRegister'), 'lineage register resolver must be present');
assert(alphaContentSource.includes('spirit-lineage-register'), 'lineage register source id must be present');
assert(alphaContentSource.includes('lineageRegisterProof'), 'lineage register proof must feed later capstones');
assert(alphaContentSource.includes('Jade Capture Rite'), 'Jade Capture Rite content must be present');
assert(alphaContentSource.includes('jade-court-capture-rite'), 'Jade Capture Rite id must be present');
assert(alphaContentSource.includes('jade-capture-rite-tally'), 'Jade Capture Rite Tally item must be present');
assert(alphaContentSource.includes('resolveSpiritCaptureRite'), 'capture rite resolver must be present');
assert(alphaContentSource.includes('spirit-capture-rite'), 'spirit capture rite source id must be present');
assert(alphaContentSource.includes('captureRiteProof'), 'capture rite proof must feed later capstones');
assert(alphaContentSource.includes('Jade Encounter Atlas'), 'Jade Encounter Atlas content must be present');
assert(alphaContentSource.includes('jade-encounter-atlas'), 'Jade Encounter Atlas id/item must be present');
assert(alphaContentSource.includes('resolveSpiritEncounterAtlas'), 'encounter atlas resolver must be present');
assert(alphaContentSource.includes('spirit-encounter-atlas'), 'spirit encounter atlas source id must be present');
assert(alphaContentSource.includes('encounterAtlasProof'), 'encounter atlas proof must feed later capstones');
assert(alphaContentSource.includes('Jade Dojo Ladder'), 'Jade Dojo Ladder content must be present');
assert(alphaContentSource.includes('jade-dojo-ladder-seal'), 'Jade Dojo Ladder Seal item must be present');
assert(alphaContentSource.includes('resolveSpiritDojoLadder'), 'dojo ladder resolver must be present');
assert(alphaContentSource.includes('battle-dojo-ladder'), 'dojo ladder source id must be present');
assert(alphaContentSource.includes('dojoLadderProof'), 'dojo ladder proof must feed later capstones');
assert(alphaContentSource.includes('Jade Banner Tournament'), 'Jade Banner Tournament content must be present');
assert(alphaContentSource.includes('jade-banner-tournament-pennant'), 'Jade Banner Tournament Pennant item must be present');
assert(alphaContentSource.includes('battle-tournament-bracket'), 'tournament bracket source id must be present');
assert(alphaContentSource.includes('Jade Rival Circle'), 'Jade Rival Circle content must be present');
assert(alphaContentSource.includes('jade-rival-circle-mark'), 'Jade Rival Circle Mark item must be present');
assert(alphaContentSource.includes('resolveSpiritRivalCircle'), 'rival circle resolver must be present');
assert(alphaContentSource.includes('battle-rival-circle'), 'rival circle source id must be present');
assert(alphaContentSource.includes('rivalCircleProof'), 'rival circle proof must feed later capstones');
assert(alphaContentSource.includes('Jade Sifu Council'), 'Jade Sifu Council content must be present');
assert(alphaContentSource.includes('jade-sifu-council-crest'), 'Jade Sifu Council Crest item must be present');
assert(alphaContentSource.includes('resolveSpiritSifuCouncil'), 'sifu council resolver must be present');
assert(alphaContentSource.includes('battle-sifu-council'), 'sifu council source id must be present');
assert(alphaContentSource.includes('sifuCouncilProof'), 'sifu council proof must feed later capstones');
assert(alphaContentSource.includes('SPIRIT_SUMMIT_CIRCUITS'), 'Jade Summit Circuit table must be present');
assert(alphaContentSource.includes('Jade Summit Circuit'), 'Jade Summit Circuit content must be present');
assert(alphaContentSource.includes('jade-summit-circuit-laurel'), 'Jade Summit Circuit Laurel item must be present');
assert(alphaContentSource.includes('resolveSpiritSummitCircuit'), 'summit circuit resolver must be present');
assert(alphaContentSource.includes('battle-summit-circuit'), 'summit circuit source id must be present');
assert(alphaContentSource.includes('summitCircuitProof'), 'summit circuit proof must feed later capstones');
assert(alphaContentSource.includes('guild-commission-ledger'), 'guild commission source id must be present');
assert(alphaContentSource.includes('jade-court-commission-knot'), 'Jade Court Commission Knot item must be present');
assert(alphaContentSource.includes('Triune Jade Harmony'), 'Triune Jade Harmony content must be present');
assert(alphaContentSource.includes('party-harmony-form'), 'party harmony source id must be present');
assert(alphaContentSource.includes('Jade Echo Concord Trial'), 'Jade Echo Concord Trial content must be present');
assert(alphaContentSource.includes('battle-harmony-trial'), 'battle harmony trial source id must be present');
assert(alphaContentSource.includes('Jade Mirror Team Match'), 'Jade Mirror Team Match content must be present');
assert(alphaContentSource.includes('battle-team-spar-match'), 'team spar match source id must be present');
assert(alphaContentSource.includes('Jade Step Loadout'), 'Jade Step Loadout content must be present');
assert(alphaContentSource.includes('spirit-technique-loadout'), 'technique loadout source id must be present');
assert(alphaContentSource.includes('Jade Technique Codex'), 'Jade Technique Codex content must be present');
assert(alphaContentSource.includes('jade-technique-codex-seal'), 'Jade Technique Codex Seal item must be present');
assert(alphaContentSource.includes('resolveSpiritTechniqueCodex'), 'technique codex resolver must be present');
assert(alphaContentSource.includes('spirit-technique-codex'), 'technique codex source id must be present');
assert(alphaContentSource.includes('techniqueCodexProof'), 'technique codex proof must feed later guild capstones');
assert(browserBridgeSource.includes('data-alpha-action="battle.technique_codex"'), 'HUD must expose the technique codex action button');
assert(browserBridgeSource.includes('data-technique-codex-label'), 'HUD must expose the technique codex label');
assert(browserBridgeSource.includes('resolveSpiritTechniqueCodex'), 'HUD bridge must call the technique codex resolver');
assert(alphaContentSource.includes('Jade Heart Trait Attunement'), 'Jade Heart Trait Attunement content must be present');
assert(alphaContentSource.includes('spirit-trait-attunement'), 'spirit trait attunement source id must be present');
assert(alphaContentSource.includes('Jade Mirror Condition Weave'), 'Jade Mirror Condition Weave content must be present');
assert(alphaContentSource.includes('jade-mirror-condition-charm'), 'Jade Mirror Condition Charm item must be present');
assert(alphaContentSource.includes('battle-condition-weave'), 'battle condition weave source id must be present');
assert(alphaContentSource.includes('Jade Affinity Matrix'), 'Jade Affinity Matrix content must be present');
assert(alphaContentSource.includes('jade-affinity-matrix-seal'), 'Jade Affinity Matrix Seal item must be present');
assert(alphaContentSource.includes('resolveSpiritAffinityMatrix'), 'affinity matrix resolver must be present');
assert(alphaContentSource.includes('battle-affinity-matrix'), 'affinity matrix source id must be present');
assert(alphaContentSource.includes('affinityMatrixProof'), 'affinity matrix proof must feed later combat and guild capstones');
assert(browserBridgeSource.includes('data-alpha-action="battle.affinity_matrix"'), 'HUD must expose the affinity matrix action button');
assert(browserBridgeSource.includes('data-affinity-matrix-label'), 'HUD must expose the affinity matrix label');
assert(browserBridgeSource.includes('resolveSpiritAffinityMatrix'), 'HUD bridge must call the affinity matrix resolver');
assert(alphaContentSource.includes('SPIRIT_STARTER_VOWS'), 'Jade Starter Vow table must be present');
assert(alphaContentSource.includes('Jade Starter Vow'), 'Jade Starter Vow content must be present');
assert(alphaContentSource.includes('jade-starter-knot'), 'Jade Starter Knot item must be present');
assert(alphaContentSource.includes('resolveSpiritStarterVow'), 'starter vow resolver must be present');
assert(alphaContentSource.includes('spirit-starter-vow'), 'starter vow source id must be present');
assert(alphaContentSource.includes('starterVowProof'), 'starter vow proof must feed later guild capstones');
assert(browserBridgeSource.includes('data-alpha-action="spirit.starter_vow"'), 'HUD must expose the starter vow action button');
assert(browserBridgeSource.includes('data-starter-vow-label'), 'HUD must expose the starter vow label');
assert(browserBridgeSource.includes('resolveSpiritStarterVow'), 'HUD bridge must call the starter vow resolver');
assert(browserBridgeSource.includes('starterKnotClaimed'), 'HUD bridge must persist the no-real-value starter knot proof');
assert(alphaContentSource.includes('SPIRIT_RELIC_ATTUNEMENTS'), 'Jade Relic Attunement table must be present');
assert(alphaContentSource.includes('Jade Relic Attunement'), 'Jade Relic Attunement content must be present');
assert(alphaContentSource.includes('jade-relic-silk-cord'), 'Jade Relic Silk Cord item must be present');
assert(alphaContentSource.includes('resolveSpiritRelicAttunement'), 'relic attunement resolver must be present');
assert(alphaContentSource.includes('spirit-relic-attunement'), 'relic attunement source id must be present');
assert(alphaContentSource.includes('relicAttunementProof'), 'relic attunement proof must feed later combat and guild capstones');
assert(browserBridgeSource.includes('data-alpha-action="spirit.relic_attune"'), 'HUD must expose the relic attunement action button');
assert(browserBridgeSource.includes('data-relic-attunement-label'), 'HUD must expose the relic attunement label');
assert(browserBridgeSource.includes('resolveSpiritRelicAttunement'), 'HUD bridge must call the relic attunement resolver');
assert(browserBridgeSource.includes('relicSilkCordClaimed'), 'HUD bridge must persist the no-real-value relic silk cord proof');
assert(browserBridgeSource.includes('data-alpha-action="trade.exchange_accord"'), 'HUD must expose the exchange accord action button');
assert(browserBridgeSource.includes('data-exchange-accord-label'), 'HUD must expose the exchange accord label');
assert(browserBridgeSource.includes('resolveTradeExchangeAccord'), 'HUD bridge must call the exchange accord resolver');
assert(browserBridgeSource.includes('data-alpha-action="spirit.bloom_ascendance"'), 'HUD must expose the bloom ascendance action button');
assert(browserBridgeSource.includes('data-bloom-ascendance-label'), 'HUD must expose the bloom ascendance label');
assert(browserBridgeSource.includes('resolveSpiritBloomAscendance'), 'HUD bridge must call the bloom ascendance resolver');
assert(browserBridgeSource.includes('data-alpha-action="spirit.lineage_register"'), 'HUD must expose the lineage register action button');
assert(browserBridgeSource.includes('data-lineage-register-label'), 'HUD must expose the lineage register label');
assert(browserBridgeSource.includes('resolveSpiritLineageRegister'), 'HUD bridge must call the lineage register resolver');
assert(browserBridgeSource.includes('data-alpha-action="battle.dojo_ladder"'), 'HUD must expose the dojo ladder action button');
assert(browserBridgeSource.includes('data-dojo-ladder-label'), 'HUD must expose the dojo ladder label');
assert(browserBridgeSource.includes('resolveSpiritDojoLadder'), 'HUD bridge must call the dojo ladder resolver');
assert(browserBridgeSource.includes('data-alpha-action="battle.sifu_council"'), 'HUD must expose the sifu council action button');
assert(browserBridgeSource.includes('data-sifu-council-label'), 'HUD must expose the sifu council label');
assert(browserBridgeSource.includes('resolveSpiritSifuCouncil'), 'HUD bridge must call the sifu council resolver');
assert(browserBridgeSource.includes('data-alpha-action="battle.summit_circuit"'), 'HUD must expose the summit circuit action button');
assert(browserBridgeSource.includes('data-summit-circuit-label'), 'HUD must expose the summit circuit label');
assert(browserBridgeSource.includes('resolveSpiritSummitCircuit'), 'HUD bridge must call the summit circuit resolver');
assert(alphaContentSource.includes('Silk Banner Mentor Drill'), 'Silk Banner Mentor Drill content must be present');
assert(alphaContentSource.includes('battle-mentor-challenge'), 'mentor challenge source id must be present');
assert(alphaContentSource.includes('Moonbridge Goldleaf Accord'), 'Moonbridge Goldleaf Accord content must be present');
assert(alphaContentSource.includes('Cloudbell Skyvow Accord'), 'Cloudbell Skyvow Accord content must be present');
assert(alphaContentSource.includes('jade-field-accord-talisman'), 'Jade Field Accord Talisman item must be present');
assert(alphaContentSource.includes('spirit-field-accord'), 'spirit field accord source id must be present');
assert(alphaContentSource.includes('Jade Cloudbell Circuit'), 'Jade Cloudbell Circuit content must be present');
assert(alphaContentSource.includes('cloudbell-route-knot'), 'Jade Cloudbell route knot item must be present');
assert(alphaContentSource.includes('world-route-mastery'), 'route mastery source id must be present');
assert(alphaContentSource.includes('Jade Cloudbell Patrol'), 'Jade Cloudbell Patrol content must be present');
assert(alphaContentSource.includes('jade-route-patrol-pennant'), 'Jade Route Patrol Pennant item must be present');
assert(alphaContentSource.includes('world-route-patrol'), 'route patrol source id must be present');
assert(alphaContentSource.includes('Jade Scroll Story Chapter'), 'Jade Scroll Story Chapter content must be present');
assert(alphaContentSource.includes('jade-scroll-story-chapter'), 'Jade Scroll Story Chapter item/id must be present');
assert(alphaContentSource.includes('resolveMochiStoryChapter'), 'story chapter resolver must be present');
assert(alphaContentSource.includes('story-chapter'), 'story chapter source id must be present');
assert(alphaContentSource.includes('storyChapterProof'), 'story chapter proof must feed later capstones');
assert(alphaContentSource.includes('Jade Insignia Case'), 'Jade Insignia Case content must be present');
assert(alphaContentSource.includes('jade-insignia-case'), 'Jade Insignia Case item/id must be present');
assert(alphaContentSource.includes('resolveGuildInsigniaCase'), 'insignia case resolver must be present');
assert(alphaContentSource.includes('guild-insignia-case'), 'insignia case source id must be present');
assert(alphaContentSource.includes('insigniaCaseProof'), 'insignia case proof must feed later capstones');
assert(alphaContentSource.includes('Jade Wayfarer Chronicle'), 'Jade Wayfarer Chronicle content must be present');
assert(alphaContentSource.includes('jade-wayfarer-chronicle-clasp'), 'Jade Wayfarer Chronicle Clasp item must be present');
assert(alphaContentSource.includes('guild-wayfarer-chronicle'), 'wayfarer chronicle source id must be present');
assert(alphaContentSource.includes('Jade Court Ascension Trial'), 'Jade Court Ascension Trial content must be present');
assert(alphaContentSource.includes('jade-court-ascension-ribbon'), 'Jade Court Ascension Ribbon item must be present');
assert(alphaContentSource.includes('guild-ascension-trial'), 'guild ascension trial source id must be present');
assert(alphaContentSource.includes('Jade Court Sanctuary Rite'), 'Jade Court Sanctuary Rite content must be present');
assert(alphaContentSource.includes('jade-sanctuary-bell'), 'Jade Sanctuary Bell item must be present');
assert(alphaContentSource.includes('spirit-sanctuary-rite'), 'sanctuary rite source id must be present');
assert(alphaContentSource.includes('Jade Court Roster Archive'), 'Jade Court Roster Archive content must be present');
assert(alphaContentSource.includes('jade-roster-archive-seal'), 'Jade Roster Archive Seal item must be present');
assert(alphaContentSource.includes('spirit-roster-archive'), 'spirit roster archive source id must be present');
assert(alphaContentSource.includes('Jade Court Care Cycle'), 'Jade Court Care Cycle content must be present');
assert(alphaContentSource.includes('jade-care-cycle-knot'), 'Jade Care Cycle Knot item must be present');
assert(alphaContentSource.includes('spirit-care-cycle'), 'spirit care cycle source id must be present');
assert(alphaContentSource.includes('Jade Temperament Concord'), 'Jade Temperament Concord content must be present');
assert(alphaContentSource.includes('jade-temperament-charm'), 'Jade Temperament Charm item must be present');
assert(alphaContentSource.includes('spirit-temperament-concord'), 'spirit temperament concord source id must be present');
assert(alphaContentSource.includes('Jade Field Almanac'), 'Jade Field Almanac content must be present');
assert(alphaContentSource.includes('jade-field-almanac-clasp'), 'Jade Field Almanac Clasp item must be present');
assert(alphaContentSource.includes('spirit-field-almanac'), 'spirit field almanac source id must be present');
assert(alphaContentSource.includes('Jade Route Ecology Survey'), 'Jade Route Ecology Survey content must be present');
assert(alphaContentSource.includes('jade-route-ecology-map'), 'Jade Route Ecology Map item must be present');
assert(alphaContentSource.includes('spirit-route-ecology'), 'route ecology source id must be present');
assert(
  Array.from(
    alphaContentSource.matchAll(
      /id:\s*'(lirabao|jintari|aozhen)'[\s\S]*?habitat:\s*SPIRIT_HABITATS\.jadeLanternCourt/g
    )
  ).length === 3,
  'three Mochi Spirits must share the Jade Lantern Court habitat'
);

const expectedAssetLedgerEntries = [
  'mochi-tiles.png',
  'wayfarer.png',
  'sifu-narao.png',
  'chest.png',
  'spirit-lirabao.png',
  'spirit-jintari.png',
  'spirit-aozhen.png',
  'habitat-grove.png',
  'party-banner.png',
  'journal-pavilion.png',
  'expedition-gate.png',
  'route-invitation-altar.png',
  'technique-dojo.png',
  'tactic-scroll-stand.png',
  'affinity-dais.png',
  'market-board.png',
  'trade-post.png',
  'training-ring.png',
  'quest-board.png',
  'guild-rank-bell.png',
  'growth-moonwell.png',
  'canary-shrine.png',
  'hd-source-export.md',
  'project-authored/generated-for-project'
];

for (const entry of expectedAssetLedgerEntries) {
  assert(assetLedgerSource.includes(entry), `asset ledger missing visual source entry: ${entry}`);
}

const visualChecklist = {
  firstScreenReadability: {
    status: failures.length === 0 ? 'machine-supported' : 'blocked',
    records: 'First screen has current page/canvas PNG evidence; human review must still confirm the town reads as polished within 3 seconds.'
  },
  interactableRecognition: {
    status: mapObjects.every((id) => mapServerSource.includes(`id: '${id}'`)) ? 'machine-supported' : 'blocked',
    records: 'Sifu Narao, guild seal chest, journal pavilion, expedition gate, route invitation altar, technique dojo, tactic scroll stand, affinity dais, care shrine, habitat grove, training ring, party banner, quest board, guild rank bell, growth moonwell, market board, trade post, and Canary shrine are present in the stable map-object contract.'
  },
  hudContrast: {
    status: Boolean(visualSnapshot.data?.dom?.hud) ? 'machine-supported' : 'blocked',
    records: 'HUD DOM is present in the first-screen snapshot; human review checks text contrast over the rendered map.'
  },
  canaryNoRealValueClarity: {
    status: browserPresence.data?.hudAction?.state?.canaryRequested === true && browserPresence.data?.hudAction?.state?.canaryReturnRequested === true ? 'machine-supported' : 'blocked',
    records: 'Canary request and return preview remain staged/no-real-value HUD flows; funded-chain gates stay out of this visual pass.'
  },
  twoTabPresence: {
    status: browserPresence.data?.tabs?.length === 2 ? 'machine-supported' : 'blocked',
    records: 'Two browser tabs report Nearby: 2 testers and observer-side movement.'
  },
  assetLedgerCoverage: {
    status: expectedAssetLedgerEntries.every((entry) => assetLedgerSource.includes(entry)) ? 'machine-supported' : 'blocked',
    records: 'Asset ledger covers runtime PNGs, source masters, HD export intent, and project-authored generation status.'
  }
};

const report = {
  ok: failures.length === 0,
  checkedAt: new Date().toISOString(),
  scope: 'No-secret local visual review bundle for Alpha RC. Verifies screenshot, presence, HUD action, and static map-object evidence; keeps rendered prompt interaction as a manual gate.',
  git: readGitState(),
  baseUrl: visualSnapshot.data?.baseUrl || browserPresence.data?.baseUrl || null,
  evidence: {
    visualSnapshot: summarizeReport(visualSnapshot),
    browserPresence: summarizeReport(browserPresence),
    screenshots: screenshotEvidence,
    mapObjects,
    habitat: 'Jade Lantern Court'
  },
  machineReview: {
    firstScreenRenderable: failures.length === 0,
    hudReadable: Boolean(visualSnapshot.data?.dom?.hud),
    townCanvasRenderable: Boolean(visualSnapshot.data?.dom?.canvas),
    twoTabPresence: browserPresence.data?.tabs?.length === 2,
    observerMovement: browserPresence.data?.canvasMovement?.observer?.changedAfterFirstTabMove === true,
    hudActionLoop: {
      spiritCare: browserPresence.data?.hudAction?.state?.spiritId === 'aozhen',
      spiritCapture: browserPresence.data?.hudAction?.state?.captureProof === true,
      spiritJournal: browserPresence.data?.hudAction?.state?.journalProof === true && browserPresence.data?.hudAction?.state?.journalDiscoveredCount === 3,
      fieldExpedition: browserPresence.data?.hudAction?.state?.expeditionProof === true,
      fieldAccord: browserPresence.data?.hudAction?.state?.fieldAccordProof === true,
      routeInvitation: browserPresence.data?.hudAction?.state?.routeInviteProof === true,
      routeMastery: browserPresence.data?.hudAction?.state?.routeMasteryProof === true,
      routePatrol: browserPresence.data?.hudAction?.state?.routePatrolProof === true,
      habitatBond: browserPresence.data?.hudAction?.state?.habitatBondProof === true,
      spiritResearch: browserPresence.data?.hudAction?.state?.researchProof === true,
      spiritCompendium: browserPresence.data?.hudAction?.state?.compendiumProof === true,
      rosterArchive: browserPresence.data?.hudAction?.state?.rosterArchiveProof === true,
      provisionSatchel: browserPresence.data?.hudAction?.state?.provisionProof === true,
      careCycle: browserPresence.data?.hudAction?.state?.careCycleProof === true,
      temperamentConcord: browserPresence.data?.hudAction?.state?.temperamentConcordProof === true,
      fieldAlmanac: browserPresence.data?.hudAction?.state?.fieldAlmanacProof === true,
      routeEcology: browserPresence.data?.hudAction?.state?.routeEcologyProof === true,
      craftWrit: browserPresence.data?.hudAction?.state?.craftWritProof === true,
      exchangeAccord: browserPresence.data?.hudAction?.state?.exchangeAccordProof === true && browserPresence.data?.hudAction?.state?.exchangeAccordScore >= 34,
      routeWaystone: browserPresence.data?.hudAction?.state?.routeWaystoneProof === true,
      nurtureRite: browserPresence.data?.hudAction?.state?.nurtureRiteProof === true,
      recoveryTea: browserPresence.data?.hudAction?.state?.recoveryTeaProof === true && browserPresence.data?.hudAction?.state?.recoveryTeaScore >= 36,
      kinshipAlbum: browserPresence.data?.hudAction?.state?.kinshipAlbumProof === true && browserPresence.data?.hudAction?.state?.kinshipAlbumScore >= 38,
      nurseryGrove: browserPresence.data?.hudAction?.state?.nurseryGroveProof === true && browserPresence.data?.hudAction?.state?.nurseryGroveScore >= 52,
      bloomAscendance: browserPresence.data?.hudAction?.state?.bloomAscendanceProof === true && browserPresence.data?.hudAction?.state?.bloomAscendanceScore >= 58,
      lineageRegister: browserPresence.data?.hudAction?.state?.lineageRegisterProof === true && browserPresence.data?.hudAction?.state?.lineageRegisterScore >= 60,
      captureRite: browserPresence.data?.hudAction?.state?.captureRiteProof === true && browserPresence.data?.hudAction?.state?.captureRiteScore >= 38,
      encounterAtlas: browserPresence.data?.hudAction?.state?.encounterAtlasProof === true && browserPresence.data?.hudAction?.state?.encounterAtlasScore >= 44,
      dojoLadder: browserPresence.data?.hudAction?.state?.dojoLadderProof === true && browserPresence.data?.hudAction?.state?.dojoLadderScore >= 44,
      tournamentBracket: browserPresence.data?.hudAction?.state?.tournamentProof === true && browserPresence.data?.hudAction?.state?.tournamentScore >= 38,
      rivalCircle: browserPresence.data?.hudAction?.state?.rivalCircleProof === true && browserPresence.data?.hudAction?.state?.rivalCircleScore >= 46,
      sifuCouncil: browserPresence.data?.hudAction?.state?.sifuCouncilProof === true && browserPresence.data?.hudAction?.state?.sifuCouncilScore >= 62,
      summitCircuit: browserPresence.data?.hudAction?.state?.summitCircuitProof === true && browserPresence.data?.hudAction?.state?.summitCircuitScore >= 80,
      guildCommission: browserPresence.data?.hudAction?.state?.commissionProof === true,
      socialRally: browserPresence.data?.hudAction?.state?.rallyProof === true && browserPresence.data?.hudAction?.state?.rallyPresenceCount >= 2,
      guildSocialRally: browserPresence.data?.hudAction?.state?.rallyProof === true && browserPresence.data?.hudAction?.state?.rallyPresenceCount >= 2,
      storyChapter: browserPresence.data?.hudAction?.state?.storyChapterProof === true && browserPresence.data?.hudAction?.state?.storyChapterScore >= 42,
      insigniaCase: browserPresence.data?.hudAction?.state?.insigniaCaseProof === true && browserPresence.data?.hudAction?.state?.insigniaCaseScore >= 34,
      starterVow: browserPresence.data?.hudAction?.state?.starterVowProof === true && browserPresence.data?.hudAction?.state?.starterVowScore >= 18,
      wayfarerChronicle: browserPresence.data?.hudAction?.state?.wayfarerChronicleProof === true && browserPresence.data?.hudAction?.state?.wayfarerChronicleScore >= 75,
      guildAscensionTrial: browserPresence.data?.hudAction?.state?.guildAscensionProof === true && browserPresence.data?.hudAction?.state?.guildAscensionScore >= 64,
      sanctuaryRite: browserPresence.data?.hudAction?.state?.sanctuaryRiteProof === true && browserPresence.data?.hudAction?.state?.sanctuaryRiteScore >= 24,
      partyHarmony: browserPresence.data?.hudAction?.state?.harmonyFormProof === true,
      harmonyTrial: browserPresence.data?.hudAction?.state?.harmonyTrialProof === true,
      teamSparMatch: browserPresence.data?.hudAction?.state?.teamSparMatchProof === true,
      mentorChallenge: browserPresence.data?.hudAction?.state?.mentorChallengeProof === true,
      techniqueMastery: browserPresence.data?.hudAction?.state?.techniqueProof === true,
      battleTactic: browserPresence.data?.hudAction?.state?.tacticProof === true,
      techniqueLoadout: browserPresence.data?.hudAction?.state?.techniqueLoadoutProof === true,
      techniqueCodex: browserPresence.data?.hudAction?.state?.techniqueCodexProof === true && browserPresence.data?.hudAction?.state?.techniqueCodexScore >= 46,
      spiritTrait: browserPresence.data?.hudAction?.state?.traitAttunementProof === true,
      battleConditionWeave: browserPresence.data?.hudAction?.state?.conditionWeaveProof === true,
      affinityMatrix: browserPresence.data?.hudAction?.state?.affinityMatrixProof === true && browserPresence.data?.hudAction?.state?.affinityMatrixScore >= 44,
      relicAttunement: browserPresence.data?.hudAction?.state?.relicAttunementProof === true && browserPresence.data?.hudAction?.state?.relicAttunementScore >= 57,
      guildRank: browserPresence.data?.hudAction?.state?.guildRankProof === true,
      growthRite: browserPresence.data?.hudAction?.state?.growthRiteProof === true,
      affinityTrial: browserPresence.data?.hudAction?.state?.affinityProof === true,
      partyFormation: browserPresence.data?.hudAction?.state?.partyIds?.includes?.('jintari') === true && browserPresence.data?.hudAction?.state?.partyIds?.includes?.('aozhen') === true,
      sparLadder: browserPresence.data?.hudAction?.state?.sparLadderXp >= 1,
      battleRoundTranscript: browserPresence.data?.hudAction?.state?.battleRoundProof === true,
      questChain: browserPresence.data?.hudAction?.state?.questChainProof === true,
      profileView: browserPresence.data?.hudAction?.state?.profileViewed === true,
      guildBuddyProof: browserPresence.data?.hudAction?.state?.guildBuddyProof === true,
      emoteProof: browserPresence.data?.hudAction?.state?.emoteProof === true,
      statusMood: browserPresence.data?.hudAction?.state?.statusMood === 'cozy',
      spiritInspect: browserPresence.data?.hudAction?.state?.lastInspectedSpiritId === 'aozhen',
      fixedMarket: browserPresence.data?.hudAction?.state?.charmListed === true,
      directTrade: browserPresence.data?.hudAction?.state?.tradeProof === true,
      canaryRequest: browserPresence.data?.hudAction?.state?.canaryRequested === true,
      canaryReturnPreview: browserPresence.data?.hudAction?.state?.canaryReturnRequested === true
    }
  },
  visualChecklist,
  manualPromptGate: {
    requiredBeforeAlphaRcReady: true,
    status: 'pending-human-review',
    reason: 'Automated screenshots and DOM/HUD evidence do not replace the final rendered NPC/chest/habitat prompt review inside the canvas.',
    requiredChecks: [
      'Open the local playable game in a browser.',
      'Focus the game canvas, stand adjacent to the map object, and hold Space/Action for about 200ms.',
      'Interact with the welcome NPC and confirm the rendered prompt/dialog is coherent.',
      'Interact with the guild seal chest and confirm the rendered prompt/save feedback is coherent.',
      'Interact with the habitat/care loop and confirm the rendered prompt/status feedback is coherent.',
      'Run npm run alpha:manual-prompt-review with the explicit prompt confirmation env vars set.',
      'Record browser, date, URL, report hashes, and any issues in the PR or release checklist.'
    ]
  },
  failures
};

await mkdir(dirname(reportJsonPath), { recursive: true });
await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(reportMdPath, renderMarkdown(report), 'utf8');

if (!report.ok) {
  console.error('Mochi Social local visual review bundle failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Report: ${reportJsonPath}`);
  process.exit(1);
}

console.log(`Mochi Social local visual review bundle passed. Report: ${reportJsonPath}`);
console.log(`Markdown: ${reportMdPath}`);

function readJson(file) {
  if (!existsSync(file)) return { ok: false, pathForReport: pathForReport(file), message: 'missing report' };
  try {
    return { ok: true, pathForReport: pathForReport(file), data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, pathForReport: pathForReport(file), message: 'parse failed' };
  }
}

function readText(file) {
  if (!existsSync(file)) {
    failures.push(`${pathForReport(file)} is missing`);
    return '';
  }
  return readFileSync(file, 'utf8');
}

function assertReport(label, report) {
  if (!report.ok) {
    failures.push(`${label} report unavailable: ${report.message}`);
    return;
  }
  if (report.data?.ok !== true) failures.push(`${label} report is not ok`);
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function inspectPng(entry) {
  const absolutePath = resolve(root, entry?.path || '');
  const exists = existsSync(absolutePath);
  const result = {
    path: entry?.path ? pathForReport(absolutePath) : null,
    exists,
    bytes: 0,
    width: 0,
    height: 0,
    sha256: null,
    reportedSha256: entry?.sha256 || null
  };
  if (!exists) return result;

  const buffer = readFileSync(absolutePath);
  const png = pngDimensions(buffer);
  result.bytes = buffer.length;
  result.width = png.width;
  result.height = png.height;
  result.sha256 = createHash('sha256').update(buffer).digest('hex');
  return result;
}

function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== signature) return { width: 0, height: 0 };
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function summarizeReport(report) {
  return {
    path: report.pathForReport,
    ok: report.data?.ok === true,
    checkedAt: report.data?.checkedAt,
    baseUrl: report.data?.baseUrl
  };
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

function pathForReport(absolutePath) {
  return absolutePath.startsWith(root)
    ? absolutePath.slice(root.length + 1).replace(/\\/g, '/')
    : absolutePath;
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}

function renderMarkdown(summary) {
  const failureText = summary.failures.length
    ? summary.failures.map((failure) => `- ${failure}`).join('\n')
    : '- None';
  const manualChecks = summary.manualPromptGate.requiredChecks.map((item) => `- ${item}`).join('\n');

  return `# Mochi Social Local Visual Review

Generated: ${summary.checkedAt}

This file is intentionally no-secret and local-only. It ties together first-screen PNG evidence, two-tab browser presence, HUD action proof, and static map-object coverage.

## Evidence

- Base URL: ${summary.baseUrl || 'not recorded'}
- Page PNG: ${summary.evidence.screenshots.page.path || 'missing'} (${summary.evidence.screenshots.page.width}x${summary.evidence.screenshots.page.height})
- Canvas PNG: ${summary.evidence.screenshots.canvas.path || 'missing'} (${summary.evidence.screenshots.canvas.width}x${summary.evidence.screenshots.canvas.height})
- Two-tab presence: ${summary.machineReview.twoTabPresence ? 'yes' : 'no'}
- Observer movement: ${summary.machineReview.observerMovement ? 'yes' : 'no'}
- HUD action loop: spirit capture ${summary.machineReview.hudActionLoop.spiritCapture ? 'yes' : 'no'}, starter vow ${summary.machineReview.hudActionLoop.starterVow ? 'yes' : 'no'}, spirit care ${summary.machineReview.hudActionLoop.spiritCare ? 'yes' : 'no'}, spirit journal ${summary.machineReview.hudActionLoop.spiritJournal ? 'yes' : 'no'}, field expedition ${summary.machineReview.hudActionLoop.fieldExpedition ? 'yes' : 'no'}, field accord ${summary.machineReview.hudActionLoop.fieldAccord ? 'yes' : 'no'}, route invitation ${summary.machineReview.hudActionLoop.routeInvitation ? 'yes' : 'no'}, route mastery ${summary.machineReview.hudActionLoop.routeMastery ? 'yes' : 'no'}, route patrol ${summary.machineReview.hudActionLoop.routePatrol ? 'yes' : 'no'}, habitat bond ${summary.machineReview.hudActionLoop.habitatBond ? 'yes' : 'no'}, sanctuary rite ${summary.machineReview.hudActionLoop.sanctuaryRite ? 'yes' : 'no'}, spirit research ${summary.machineReview.hudActionLoop.spiritResearch ? 'yes' : 'no'}, spirit compendium ${summary.machineReview.hudActionLoop.spiritCompendium ? 'yes' : 'no'}, roster archive ${summary.machineReview.hudActionLoop.rosterArchive ? 'yes' : 'no'}, provision satchel ${summary.machineReview.hudActionLoop.provisionSatchel ? 'yes' : 'no'}, care cycle ${summary.machineReview.hudActionLoop.careCycle ? 'yes' : 'no'}, temperament concord ${summary.machineReview.hudActionLoop.temperamentConcord ? 'yes' : 'no'}, field almanac ${summary.machineReview.hudActionLoop.fieldAlmanac ? 'yes' : 'no'}, route ecology ${summary.machineReview.hudActionLoop.routeEcology ? 'yes' : 'no'}, encounter atlas ${summary.machineReview.hudActionLoop.encounterAtlas ? 'yes' : 'no'}, dojo ladder ${summary.machineReview.hudActionLoop.dojoLadder ? 'yes' : 'no'}, craft writ ${summary.machineReview.hudActionLoop.craftWrit ? 'yes' : 'no'}, exchange accord ${summary.machineReview.hudActionLoop.exchangeAccord ? 'yes' : 'no'}, route waystone ${summary.machineReview.hudActionLoop.routeWaystone ? 'yes' : 'no'}, nurture rite ${summary.machineReview.hudActionLoop.nurtureRite ? 'yes' : 'no'}, recovery tea ${summary.machineReview.hudActionLoop.recoveryTea ? 'yes' : 'no'}, kinship album ${summary.machineReview.hudActionLoop.kinshipAlbum ? 'yes' : 'no'}, nursery grove ${summary.machineReview.hudActionLoop.nurseryGrove ? 'yes' : 'no'}, bloom ascendance ${summary.machineReview.hudActionLoop.bloomAscendance ? 'yes' : 'no'}, lineage register ${summary.machineReview.hudActionLoop.lineageRegister ? 'yes' : 'no'}, capture rite ${summary.machineReview.hudActionLoop.captureRite ? 'yes' : 'no'}, tournament bracket ${summary.machineReview.hudActionLoop.tournamentBracket ? 'yes' : 'no'}, rival circle ${summary.machineReview.hudActionLoop.rivalCircle ? 'yes' : 'no'}, sifu council ${summary.machineReview.hudActionLoop.sifuCouncil ? 'yes' : 'no'}, summit circuit ${summary.machineReview.hudActionLoop.summitCircuit ? 'yes' : 'no'}, guild commission ${summary.machineReview.hudActionLoop.guildCommission ? 'yes' : 'no'}, social rally ${summary.machineReview.hudActionLoop.socialRally ? 'yes' : 'no'}, story chapter ${summary.machineReview.hudActionLoop.storyChapter ? 'yes' : 'no'}, insignia case ${summary.machineReview.hudActionLoop.insigniaCase ? 'yes' : 'no'}, wayfarer chronicle ${summary.machineReview.hudActionLoop.wayfarerChronicle ? 'yes' : 'no'}, guild ascension trial ${summary.machineReview.hudActionLoop.guildAscensionTrial ? 'yes' : 'no'}, technique mastery ${summary.machineReview.hudActionLoop.techniqueMastery ? 'yes' : 'no'}, battle tactic ${summary.machineReview.hudActionLoop.battleTactic ? 'yes' : 'no'}, technique loadout ${summary.machineReview.hudActionLoop.techniqueLoadout ? 'yes' : 'no'}, technique codex ${summary.machineReview.hudActionLoop.techniqueCodex ? 'yes' : 'no'}, spirit trait ${summary.machineReview.hudActionLoop.spiritTrait ? 'yes' : 'no'}, battle condition weave ${summary.machineReview.hudActionLoop.battleConditionWeave ? 'yes' : 'no'}, affinity matrix ${summary.machineReview.hudActionLoop.affinityMatrix ? 'yes' : 'no'}, relic attunement ${summary.machineReview.hudActionLoop.relicAttunement ? 'yes' : 'no'}, guild rank ${summary.machineReview.hudActionLoop.guildRank ? 'yes' : 'no'}, growth rite ${summary.machineReview.hudActionLoop.growthRite ? 'yes' : 'no'}, affinity trial ${summary.machineReview.hudActionLoop.affinityTrial ? 'yes' : 'no'}, party formation ${summary.machineReview.hudActionLoop.partyFormation ? 'yes' : 'no'}, mentor challenge ${summary.machineReview.hudActionLoop.mentorChallenge ? 'yes' : 'no'}, spar ladder ${summary.machineReview.hudActionLoop.sparLadder ? 'yes' : 'no'}, battle round transcript ${summary.machineReview.hudActionLoop.battleRoundTranscript ? 'yes' : 'no'}, profile view ${summary.machineReview.hudActionLoop.profileView ? 'yes' : 'no'}, guild buddy proof ${summary.machineReview.hudActionLoop.guildBuddyProof ? 'yes' : 'no'}, emote proof ${summary.machineReview.hudActionLoop.emoteProof ? 'yes' : 'no'}, status mood ${summary.machineReview.hudActionLoop.statusMood ? 'yes' : 'no'}, spirit inspect ${summary.machineReview.hudActionLoop.spiritInspect ? 'yes' : 'no'}, fixed market ${summary.machineReview.hudActionLoop.fixedMarket ? 'yes' : 'no'}, direct trade ${summary.machineReview.hudActionLoop.directTrade ? 'yes' : 'no'}, Canary request ${summary.machineReview.hudActionLoop.canaryRequest ? 'yes' : 'no'}, Canary return ${summary.machineReview.hudActionLoop.canaryReturnPreview ? 'yes' : 'no'}
- Map objects: ${summary.evidence.mapObjects.join(', ')}
- Habitat: ${summary.evidence.habitat}

## Visual Checklist

- First-screen readability: ${summary.visualChecklist.firstScreenReadability.status}
- Interactable recognition: ${summary.visualChecklist.interactableRecognition.status}
- HUD contrast: ${summary.visualChecklist.hudContrast.status}
- Canary no-real-value clarity: ${summary.visualChecklist.canaryNoRealValueClarity.status}
- Two-tab presence: ${summary.visualChecklist.twoTabPresence.status}
- Asset ledger coverage: ${summary.visualChecklist.assetLedgerCoverage.status}

## Manual Prompt Gate

Status: ${summary.manualPromptGate.status}

${summary.manualPromptGate.reason}

${manualChecks}

## Failures

${failureText}
`;
}
