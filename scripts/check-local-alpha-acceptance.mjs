import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(currentDir, '..');
const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const saveDir = process.env.RPG_SAVE_DIR ?? '.local/saves';
const ledgerPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ALPHA_LEDGER_PATH ?? join(saveDir, 'alpha-ledger.jsonl'));
const reportPath = resolveFromRoot(process.env.MOCHI_SOCIAL_ACCEPTANCE_REPORT ?? 'reports/alpha-local-acceptance.json');
const allowEdgeMode = process.env.MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE === 'true';
const requestTimeoutMs = Number(process.env.MOCHI_SOCIAL_ACCEPTANCE_REQUEST_TIMEOUT_MS || 10000);
const runId = `local-accept-${Date.now().toString(36)}`;

const report = {
  ok: false,
  baseUrl,
  checkedAt: new Date().toISOString(),
  runId,
  endpoints: [],
  actions: [],
  ledgerPath,
  reportPath,
  manualGates: [
    'Run npm run alpha:browser-presence and verify reports/alpha-browser-presence.json contains canvasMovement.changedAfterFirstTabMove=true.',
    'Use the in-game NPC/chest/habitat interactions once before marking Alpha RC Ready.'
  ]
};

try {
  await run();
  report.ok = true;
  await writeReport();
  console.log(`Mochi Social local alpha acceptance passed for ${baseUrl}`);
  console.log(`Report: ${reportPath}`);
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport();
  console.error('Mochi Social local alpha acceptance failed:');
  console.error(report.error);
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

async function run() {
  const health = await getJson('/healthz', 'health');
  assert(health.body.ok === true && health.body.name === 'Mochi Social', '/healthz did not identify Mochi Social.');

  const manifest = await getJson('/integration/game-manifest.json', 'manifest');
  assert(manifest.body.name === 'Mochi Social', 'Manifest name changed.');
  assert(manifest.body.auth?.tokenPolicy === 'access-token-only', 'Manifest must keep access-token-only auth policy.');
  assert(manifest.body.alpha?.noRealValue === true, 'Manifest must keep alpha no-real-value.');
  assert(manifest.body.chain?.provider === 'enjin', 'Manifest must keep Enjin as chain provider.');
  assert(manifest.body.chain?.network === 'CANARY', 'Manifest must keep Canary network.');
  assert(manifest.body.market?.fixedPrice === true, 'Manifest must keep fixed-price market enabled.');
  assert(manifest.body.market?.guildReceipts === true, 'Manifest must expose no-real-value market receipts.');
  assert(manifest.body.market?.auctions === false, 'Manifest must keep auctions disabled.');
  assert(manifest.body.gameplay?.spiritCapture === true, 'Manifest must expose Mochi Spirit capture.');
  assert(manifest.body.gameplay?.spiritStarterVows === true, 'Manifest must expose Mochi Spirit starter vows.');
  assert(manifest.body.gameplay?.spiritCaptureRites === true, 'Manifest must expose Mochi Spirit capture rites.');
  assert(manifest.body.gameplay?.spiritAttunement === true, 'Manifest must expose Mochi Spirit attunement.');
  assert(manifest.body.gameplay?.routeInvitations === true, 'Manifest must expose Mochi Spirit route invitations.');
  assert(manifest.body.gameplay?.routeMastery === true, 'Manifest must expose Mochi Spirit route mastery.');
  assert(manifest.body.gameplay?.routePatrols === true, 'Manifest must expose Mochi Spirit route patrols.');
  assert(manifest.body.gameplay?.habitatBonds === true, 'Manifest must expose Mochi Spirit habitat bonds.');
  assert(manifest.body.gameplay?.spiritSanctuaryRites === true, 'Manifest must expose Mochi Spirit sanctuary rites.');
  assert(manifest.body.gameplay?.spiritResearch === true, 'Manifest must expose Mochi Spirit research folios.');
  assert(manifest.body.gameplay?.spiritCompendium === true, 'Manifest must expose Mochi Spirit compendium completion.');
  assert(manifest.body.gameplay?.spiritRosterArchives === true, 'Manifest must expose Mochi Spirit roster archives.');
  assert(manifest.body.gameplay?.spiritRosterCabinets === true, 'Manifest must expose Mochi Spirit roster cabinets.');
  assert(manifest.body.gameplay?.spiritBlossomCradles === true, 'Manifest must expose Mochi Spirit blossom cradles.');
  assert(manifest.body.gameplay?.spiritCareCycles === true, 'Manifest must expose Mochi Spirit care cycles.');
  assert(manifest.body.gameplay?.spiritTemperamentConcords === true, 'Manifest must expose Mochi Spirit temperament concords.');
  assert(manifest.body.gameplay?.spiritFieldAlmanacs === true, 'Manifest must expose Mochi Spirit field almanacs.');
  assert(manifest.body.gameplay?.routeEcologySurveys === true, 'Manifest must expose Mochi Spirit route ecology surveys.');
  assert(manifest.body.gameplay?.spiritWeatherVeils === true, 'Manifest must expose Mochi Spirit weather veils.');
  assert(manifest.body.gameplay?.spiritEncounterRotations === true, 'Manifest must expose Mochi Spirit encounter rotations.');
  assert(manifest.body.gameplay?.spiritEncounterAtlases === true, 'Manifest must expose Mochi Spirit encounter atlases.');
  assert(manifest.body.gameplay?.spiritHabitatCensuses === true, 'Manifest must expose Mochi Spirit habitat censuses.');
  assert(manifest.body.gameplay?.spiritCraftWrits === true, 'Manifest must expose Mochi Spirit craft writs.');
  assert(manifest.body.gameplay?.tradeExchangeAccords === true, 'Manifest must expose Mochirii trade exchange accords.');
  assert(manifest.body.gameplay?.spiritRivalCircles === true, 'Manifest must expose Mochi Spirit rival circles.');
  assert(manifest.body.gameplay?.routeWaystones === true, 'Manifest must expose Mochi Spirit route waystones.');
  assert(manifest.body.gameplay?.routeCharters === true, 'Manifest must expose Mochi Spirit route charters.');
  assert(manifest.body.gameplay?.spiritNurtureRites === true, 'Manifest must expose Mochi Spirit nurture rites.');
  assert(manifest.body.gameplay?.spiritKinshipAlbums === true, 'Manifest must expose Mochi Spirit kinship albums.');
  assert(manifest.body.gameplay?.spiritBloomAscendances === true, 'Manifest must expose Mochi Spirit bloom ascendance proofs.');
  assert(manifest.body.gameplay?.spiritLineageRegisters === true, 'Manifest must expose Mochi Spirit lineage register proofs.');
  assert(manifest.body.gameplay?.itemProvisions === true, 'Manifest must expose Mochirii item provision satchels.');
  assert(manifest.body.gameplay?.itemProvisionCatalogs === true, 'Manifest must expose Mochirii item provision catalogs.');
  assert(manifest.body.gameplay?.battleItemKits === true, 'Manifest must expose Mochirii no-real-value battle item kits.');
  assert(manifest.body.gameplay?.remedyPouches === true, 'Manifest must expose Mochirii no-real-value remedy pouch proofs.');
  assert(manifest.body.gameplay?.questLedgers === true, 'Manifest must expose Mochirii quest ledger proofs.');
  assert(manifest.body.gameplay?.guildCommissions === true, 'Manifest must expose Mochirii guild commissions.');
  assert(manifest.body.gameplay?.socialRallies === true, 'Manifest must expose Mochirii social rallies.');
  assert(manifest.body.gameplay?.spiritStoryChapters === true, 'Manifest must expose Mochi Spirit story chapters.');
  assert(manifest.body.gameplay?.guildInsigniaCases === true, 'Manifest must expose the Mochirii guild insignia case.');
  assert(manifest.body.gameplay?.wayfarerChronicles === true, 'Manifest must expose the Mochirii wayfarer chronicle.');
  assert(manifest.body.gameplay?.guildAscensionTrials === true, 'Manifest must expose the Mochirii guild ascension trial.');
  assert(manifest.body.gameplay?.partyFormation === true, 'Manifest must expose Mochi Spirit party formation.');
  assert(manifest.body.gameplay?.partyHarmony === true, 'Manifest must expose Mochi Spirit party harmony.');
  assert(manifest.body.gameplay?.harmonyTrials === true, 'Manifest must expose Mochi Spirit harmony trials.');
  assert(manifest.body.gameplay?.teamSparMatches === true, 'Manifest must expose Mochi Spirit team spar matches.');
  assert(manifest.body.gameplay?.mentorChallenges === true, 'Manifest must expose Mochi Spirit mentor challenges.');
  assert(manifest.body.gameplay?.dojoLadders === true, 'Manifest must expose Mochi Spirit dojo ladders.');
  assert(manifest.body.gameplay?.spiritTournamentBrackets === true, 'Manifest must expose Mochi Spirit tournament brackets.');
  assert(manifest.body.gameplay?.sifuCouncils === true, 'Manifest must expose Mochi Spirit sifu councils.');
  assert(manifest.body.gameplay?.summitCircuits === true, 'Manifest must expose Mochi Spirit summit circuits.');
  assert(manifest.body.gameplay?.battleRoundTranscripts === true, 'Manifest must expose Mochi Spirit battle round transcripts.');
  assert(manifest.body.gameplay?.conditionWeaves === true, 'Manifest must expose Mochi Spirit condition weaves.');
  assert(manifest.body.gameplay?.fieldExpeditions === true, 'Manifest must expose Mochi Spirit field expeditions.');
  assert(manifest.body.gameplay?.sparringLadder === true, 'Manifest must expose Mochi Spirit sparring ladder.');
  assert(manifest.body.gameplay?.spiritJournal === true, 'Manifest must expose Mochi Spirit journal.');
  assert(manifest.body.gameplay?.techniqueMastery === true, 'Manifest must expose Mochi Spirit technique mastery.');
  assert(manifest.body.gameplay?.battleTactics === true, 'Manifest must expose Mochi Spirit battle tactics.');
  assert(manifest.body.gameplay?.techniqueLoadouts === true, 'Manifest must expose Mochi Spirit technique loadouts.');
  assert(manifest.body.gameplay?.techniqueCodexes === true, 'Manifest must expose Mochi Spirit technique codexes.');
  assert(manifest.body.gameplay?.spiritTraits === true, 'Manifest must expose Mochi Spirit trait attunements.');
  assert(manifest.body.gameplay?.spiritRelicAttunements === true, 'Manifest must expose Mochi Spirit relic attunements.');
  assert(manifest.body.gameplay?.guildRankTrials === true, 'Manifest must expose Mochirii guild rank trials.');
  assert(manifest.body.gameplay?.spiritGrowthRites === true, 'Manifest must expose Mochi Spirit growth rites.');
  assert(manifest.body.gameplay?.affinityTrials === true, 'Manifest must expose Mochi Spirit affinity trials.');
  assert(manifest.body.gameplay?.affinityMatrices === true, 'Manifest must expose Mochi Spirit affinity matrix planning.');
  assert(manifest.body.gameplay?.copiedUpstreamContent === false, 'Manifest must reject copied upstream content.');
  assert(Array.isArray(manifest.body.routes?.public) && manifest.body.routes.public.includes('/play'), 'Manifest must expose /play as a public route.');
  assert(Array.isArray(manifest.body.routes?.public) && manifest.body.routes.public.includes('/embed'), 'Manifest must expose /embed as a public route.');
  assert(manifest.body.alphaPreview?.stopPoint === 'alpha-preview-ready', 'Manifest must expose Alpha Preview Ready as the website stop point.');
  assert(manifest.body.alphaPreview?.websiteEntryPath === '/games/mochi-social', 'Manifest must expose the Mochirii website entry path.');
  assert(manifest.body.alphaPreview?.testerPasswordOwner === 'parent-website', 'Manifest must keep tester password ownership in the parent website.');
  assert(manifest.body.alphaPreview?.providerMutationAllowedByDefault === false, 'Manifest must reject provider mutation by default.');
  assert(manifest.body.alphaPreview?.fundedChainRequiredForPreview === false, 'Manifest must not require funded-chain gates for Alpha Preview Ready.');
  assert(manifest.body.alphaPreview?.enjinCanaryModeBeforeFunding === 'configured-preview-stub', 'Manifest must keep Enjin Canary as configured-preview-stub before funding approval.');
  assert(manifest.body.cleanRoom?.restrictedSourceReferences === false, 'Manifest must declare zero restricted-source references.');
  assert(manifest.body.cleanRoom?.copiedRestrictedSourceNames === false, 'Manifest must declare zero copied restricted-source names.');
  assert(manifest.body.cleanRoom?.copiedRestrictedSourceAssets === false, 'Manifest must declare zero copied restricted-source assets.');
  assert(manifest.body.cleanRoom?.restrictedSourceVisualDerivatives === false, 'Manifest must declare zero restricted-source visual derivatives.');
  assert(manifest.body.cleanRoom?.scanner === 'npm run clean-room-scan', 'Manifest must point to the clean-room scanner.');
  assert(manifest.body.brand?.world === 'Mochirii', 'Manifest must expose Mochirii branding.');
  assert(manifest.body.brand?.town === 'Jade Lantern Court', 'Manifest must expose the original first-town name.');
  assert(manifest.body.brand?.artDirection === 'Mochirii High-Fidelity Wuxia', 'Manifest must expose the high-fidelity wuxia art direction.');
  assert(manifest.body.runtimeArt?.pixelArt === false, 'Manifest must reject pixel-art direction.');
  assert(manifest.body.runtimeArt?.retro === false, 'Manifest must reject retro art direction.');
  assert(manifest.body.runtimeArt?.tileSizePx === 64, 'Manifest must expose 64px logical tile contracts.');
  assert(manifest.body.runtimeArt?.eventSpritesheet?.width === 384, 'Manifest must expose 384px event spritesheet width.');
  assert(manifest.body.runtimeArt?.eventSpritesheet?.height === 768, 'Manifest must expose 768px event spritesheet height.');
  assert(manifest.body.runtimeArt?.eventSpritesheet?.frameWidth === 128, 'Manifest must expose 128px event frame width.');
  assert(manifest.body.runtimeArt?.eventSpritesheet?.frameHeight === 192, 'Manifest must expose 192px event frame height.');
  assert(manifest.body.spirits?.system === 'Mochi Spirits', 'Manifest must expose Mochi Spirits as the canonical creature system.');
  assert(Array.isArray(manifest.body.spirits?.roster) && manifest.body.spirits.roster.length === 3, 'Manifest must expose exactly three first-court Mochi Spirits.');
  assert(manifest.body.spirits.roster.map((spirit) => spirit.id).join(',') === 'lirabao,jintari,aozhen', 'Manifest must expose the original Lirabao/Jintari/Aozhen roster.');
  assert(manifest.body.spirits.roster.filter((spirit) => spirit.certificateEligible).map((spirit) => spirit.id).join(',') === 'lirabao', 'Manifest must keep only Lirabao certificate-eligible for Canary preview.');
  assert(manifest.body.manualReview?.requiredBeforeAlphaPreviewReady === true, 'Manifest must keep manual prompt review required before Alpha Preview Ready.');
  assert(Array.isArray(manifest.body.manualReview?.requiredTargets) && manifest.body.manualReview.requiredTargets.map((target) => target.id).join(',') === 'welcome-npc,guild-seal-chest,care-shrine', 'Manifest must expose the manual prompt review target list.');
  assert(manifest.body.playableContent?.contentPolicy === 'original-mochirii-feature-parity', 'Manifest must expose original Mochirii feature-parity content policy.');
  assert(manifest.body.playableContent?.capture?.captureRiteIds?.includes('jade-court-capture-rite'), 'Manifest must catalog the Jade Capture Rite.');
  assert(manifest.body.playableContent?.capture?.fieldAccordIds?.length === 2, 'Manifest must catalog both first-court field accord proofs.');
  assert(manifest.body.playableContent?.raising?.bondMilestoneIds?.length === 9, 'Manifest must catalog all first-court bond milestones.');
  assert(manifest.body.playableContent?.raising?.bloomAscendanceIds?.includes('jade-bloom-ascendance'), 'Manifest must catalog bloom ascendance growth proof.');
  assert(manifest.body.playableContent?.raising?.lineageRegisterIds?.includes('jade-lineage-register'), 'Manifest must catalog lineage register growth proof.');
  assert(manifest.body.playableContent?.raising?.blossomCradleIds?.includes('jade-blossom-cradle'), 'Manifest must catalog blossom cradle raising proof.');
  assert(manifest.body.playableContent?.battle?.moveIds?.length === 3, 'Manifest must catalog all first-court battle moves.');
  assert(manifest.body.playableContent?.battle?.tacticIds?.length === 3, 'Manifest must catalog all first-court battle tactics.');
  assert(manifest.body.playableContent?.battle?.summitCircuitIds?.includes('jade-summit-circuit'), 'Manifest must catalog the summit circuit battle proof.');
  assert(manifest.body.playableContent?.roleplay?.questChainIds?.length === 3, 'Manifest must catalog the first Mochirii quest chain.');
  assert(manifest.body.playableContent?.roleplay?.questLedgerIds?.includes('jade-quest-ledger'), 'Manifest must catalog the Jade Quest Ledger proof.');
  assert(manifest.body.playableContent?.roleplay?.rosterCabinetIds?.includes('jade-roster-cabinet'), 'Manifest must catalog the Jade Roster Cabinet proof.');
  assert(manifest.body.playableContent?.roleplay?.nameBannerRiteIds?.includes('jade-name-banner-rite'), 'Manifest must catalog the Jade Name Banner Rite proof.');
  assert(manifest.body.playableContent?.roleplay?.routeCharterIds?.includes('jade-route-charter'), 'Manifest must catalog the Jade Route Charter proof.');
  assert(manifest.body.playableContent?.roleplay?.guildAscensionTrialIds?.includes('jade-court-ascension-trial'), 'Manifest must catalog the guild ascension capstone.');
  assert(manifest.body.playableContent?.economyAndCanary?.marketReceiptIds?.includes('jade-court-market-receipt'), 'Manifest must catalog the no-real-value market receipt.');
  assert(manifest.body.playableContent?.economyAndCanary?.provisionCatalogIds?.includes('jade-provision-catalog'), 'Manifest must catalog the no-real-value provision catalog.');
  assert(manifest.body.playableContent?.economyAndCanary?.battleKitIds?.includes('jade-battle-kit'), 'Manifest must catalog the no-real-value battle item kit.');
  assert(manifest.body.playableContent?.economyAndCanary?.remedyPouchIds?.includes('jade-remedy-pouch'), 'Manifest must catalog the no-real-value remedy pouch.');
  assert(manifest.body.playableContent?.economyAndCanary?.tradeExchangeAccordIds?.includes('jade-exchange-accord'), 'Manifest must catalog the no-real-value exchange accord.');
  assert(manifest.body.playableContent?.economyAndCanary?.canaryCertificateItemIds?.join(',') === 'lirabao-canary-certificate', 'Manifest must catalog only the Lirabao Canary certificate preview item.');
  assert(manifest.body.playableContent?.runtimeAssets?.spritesheets?.length === 21, 'Manifest must catalog all runtime spritesheets.');

  const alphaStatus = await getJson('/integration/alpha/status', 'alpha status');
  assert(alphaStatus.body.alpha?.stopPoint === 'alpha-rc-ready', 'Alpha status must expose the RC stop point.');
  assert(alphaStatus.body.market?.fixedPrice === true, 'Alpha status must keep fixed-price enabled.');
  assert(alphaStatus.body.market?.guildReceipts === true, 'Alpha status must expose no-real-value market receipts.');
  assert(alphaStatus.body.market?.auctions === false, 'Alpha status must keep auctions disabled.');
  assert(alphaStatus.body.gameplay?.spiritCapture === true, 'Alpha status must expose Mochi Spirit capture.');
  assert(alphaStatus.body.gameplay?.spiritCaptureRites === true, 'Alpha status must expose Mochi Spirit capture rites.');
  assert(alphaStatus.body.gameplay?.spiritAttunement === true, 'Alpha status must expose Mochi Spirit attunement.');
  assert(alphaStatus.body.gameplay?.spiritStarterVows === true, 'Alpha status must expose Mochi Spirit starter vows.');
  assert(alphaStatus.body.gameplay?.routeInvitations === true, 'Alpha status must expose Mochi Spirit route invitations.');
  assert(alphaStatus.body.gameplay?.routeMastery === true, 'Alpha status must expose Mochi Spirit route mastery.');
  assert(alphaStatus.body.gameplay?.routePatrols === true, 'Alpha status must expose Mochi Spirit route patrols.');
  assert(alphaStatus.body.gameplay?.habitatBonds === true, 'Alpha status must expose Mochi Spirit habitat bonds.');
  assert(alphaStatus.body.gameplay?.spiritSanctuaryRites === true, 'Alpha status must expose Mochi Spirit sanctuary rites.');
  assert(alphaStatus.body.gameplay?.spiritResearch === true, 'Alpha status must expose Mochi Spirit research folios.');
  assert(alphaStatus.body.gameplay?.spiritCompendium === true, 'Alpha status must expose Mochi Spirit compendium completion.');
  assert(alphaStatus.body.gameplay?.spiritRosterArchives === true, 'Alpha status must expose Mochi Spirit roster archives.');
  assert(alphaStatus.body.gameplay?.spiritRosterCabinets === true, 'Alpha status must expose Mochi Spirit roster cabinets.');
  assert(alphaStatus.body.gameplay?.spiritBlossomCradles === true, 'Alpha status must expose Mochi Spirit blossom cradles.');
  assert(alphaStatus.body.gameplay?.spiritCareCycles === true, 'Alpha status must expose Mochi Spirit care cycles.');
  assert(alphaStatus.body.gameplay?.spiritTemperamentConcords === true, 'Alpha status must expose Mochi Spirit temperament concords.');
  assert(alphaStatus.body.gameplay?.spiritFieldAlmanacs === true, 'Alpha status must expose Mochi Spirit field almanacs.');
  assert(alphaStatus.body.gameplay?.routeEcologySurveys === true, 'Alpha status must expose Mochi Spirit route ecology surveys.');
  assert(alphaStatus.body.gameplay?.spiritWeatherVeils === true, 'Alpha status must expose Mochi Spirit weather veils.');
  assert(alphaStatus.body.gameplay?.spiritEncounterRotations === true, 'Alpha status must expose Mochi Spirit encounter rotations.');
  assert(alphaStatus.body.gameplay?.spiritEncounterAtlases === true, 'Alpha status must expose Mochi Spirit encounter atlases.');
  assert(alphaStatus.body.gameplay?.spiritHabitatCensuses === true, 'Alpha status must expose Mochi Spirit habitat censuses.');
  assert(alphaStatus.body.gameplay?.spiritCraftWrits === true, 'Alpha status must expose Mochi Spirit craft writs.');
  assert(alphaStatus.body.gameplay?.tradeExchangeAccords === true, 'Alpha status must expose Mochirii trade exchange accords.');
  assert(alphaStatus.body.gameplay?.spiritRivalCircles === true, 'Alpha status must expose Mochi Spirit rival circles.');
  assert(alphaStatus.body.gameplay?.routeWaystones === true, 'Alpha status must expose Mochi Spirit route waystones.');
  assert(alphaStatus.body.gameplay?.routeCharters === true, 'Alpha status must expose Mochi Spirit route charters.');
  assert(alphaStatus.body.gameplay?.spiritNurtureRites === true, 'Alpha status must expose Mochi Spirit nurture rites.');
  assert(alphaStatus.body.gameplay?.spiritRecoveryTeas === true, 'Alpha status must expose Mochi Spirit recovery tea proofs.');
  assert(alphaStatus.body.gameplay?.spiritKinshipAlbums === true, 'Alpha status must expose Mochi Spirit kinship albums.');
  assert(alphaStatus.body.gameplay?.spiritNurseryGroves === true, 'Alpha status must expose Mochi Spirit nursery grove proofs.');
  assert(alphaStatus.body.gameplay?.spiritBloomAscendances === true, 'Alpha status must expose Mochi Spirit bloom ascendance proofs.');
  assert(alphaStatus.body.gameplay?.spiritLineageRegisters === true, 'Alpha status must expose Mochi Spirit lineage register proofs.');
  assert(alphaStatus.body.gameplay?.itemProvisions === true, 'Alpha status must expose Mochirii item provision satchels.');
  assert(alphaStatus.body.gameplay?.itemProvisionCatalogs === true, 'Alpha status must expose Mochirii item provision catalogs.');
  assert(alphaStatus.body.gameplay?.battleItemKits === true, 'Alpha status must expose Mochirii no-real-value battle item kits.');
  assert(alphaStatus.body.gameplay?.remedyPouches === true, 'Alpha status must expose Mochirii no-real-value remedy pouch proofs.');
  assert(alphaStatus.body.gameplay?.questLedgers === true, 'Alpha status must expose Mochirii quest ledger proofs.');
  assert(alphaStatus.body.gameplay?.guildCommissions === true, 'Alpha status must expose Mochirii guild commissions.');
  assert(alphaStatus.body.gameplay?.socialRallies === true, 'Alpha status must expose Mochirii social rallies.');
  assert(alphaStatus.body.gameplay?.spiritStoryChapters === true, 'Alpha status must expose Mochi Spirit story chapters.');
  assert(alphaStatus.body.gameplay?.guildInsigniaCases === true, 'Alpha status must expose the Mochirii guild insignia case.');
  assert(alphaStatus.body.gameplay?.wayfarerChronicles === true, 'Alpha status must expose the Mochirii wayfarer chronicle.');
  assert(alphaStatus.body.gameplay?.guildAscensionTrials === true, 'Alpha status must expose the Mochirii guild ascension trial.');
  assert(alphaStatus.body.gameplay?.partyFormation === true, 'Alpha status must expose Mochi Spirit party formation.');
  assert(alphaStatus.body.gameplay?.partyHarmony === true, 'Alpha status must expose Mochi Spirit party harmony.');
  assert(alphaStatus.body.gameplay?.harmonyTrials === true, 'Alpha status must expose Mochi Spirit harmony trials.');
  assert(alphaStatus.body.gameplay?.teamSparMatches === true, 'Alpha status must expose Mochi Spirit team spar matches.');
  assert(alphaStatus.body.gameplay?.mentorChallenges === true, 'Alpha status must expose Mochi Spirit mentor challenges.');
  assert(alphaStatus.body.gameplay?.dojoLadders === true, 'Alpha status must expose Mochi Spirit dojo ladders.');
  assert(alphaStatus.body.gameplay?.spiritTournamentBrackets === true, 'Alpha status must expose Mochi Spirit tournament brackets.');
  assert(alphaStatus.body.gameplay?.sifuCouncils === true, 'Alpha status must expose Mochi Spirit sifu councils.');
  assert(alphaStatus.body.gameplay?.summitCircuits === true, 'Alpha status must expose Mochi Spirit summit circuits.');
  assert(alphaStatus.body.gameplay?.battleRoundTranscripts === true, 'Alpha status must expose Mochi Spirit battle round transcripts.');
  assert(alphaStatus.body.gameplay?.conditionWeaves === true, 'Alpha status must expose Mochi Spirit condition weaves.');
  assert(alphaStatus.body.gameplay?.fieldExpeditions === true, 'Alpha status must expose Mochi Spirit field expeditions.');
  assert(alphaStatus.body.gameplay?.sparringLadder === true, 'Alpha status must expose Mochi Spirit sparring ladder.');
  assert(alphaStatus.body.gameplay?.spiritJournal === true, 'Alpha status must expose Mochi Spirit journal.');
  assert(alphaStatus.body.gameplay?.techniqueMastery === true, 'Alpha status must expose Mochi Spirit technique mastery.');
  assert(alphaStatus.body.gameplay?.battleTactics === true, 'Alpha status must expose Mochi Spirit battle tactics.');
  assert(alphaStatus.body.gameplay?.techniqueLoadouts === true, 'Alpha status must expose Mochi Spirit technique loadouts.');
  assert(alphaStatus.body.gameplay?.techniqueCodexes === true, 'Alpha status must expose Mochi Spirit technique codexes.');
  assert(alphaStatus.body.gameplay?.spiritTraits === true, 'Alpha status must expose Mochi Spirit trait attunements.');
  assert(alphaStatus.body.gameplay?.spiritRelicAttunements === true, 'Alpha status must expose Mochi Spirit relic attunements.');
  assert(alphaStatus.body.gameplay?.guildRankTrials === true, 'Alpha status must expose Mochirii guild rank trials.');
  assert(alphaStatus.body.gameplay?.spiritGrowthRites === true, 'Alpha status must expose Mochi Spirit growth rites.');
  assert(alphaStatus.body.gameplay?.affinityTrials === true, 'Alpha status must expose Mochi Spirit affinity trials.');
  assert(alphaStatus.body.gameplay?.affinityMatrices === true, 'Alpha status must expose Mochi Spirit affinity matrix planning.');
  assert(alphaStatus.body.gameplay?.trainingBattles === true, 'Alpha status must expose training battles.');
  assert(alphaStatus.body.gameplay?.raisingCare === true, 'Alpha status must expose raising care.');
  assert(alphaStatus.body.gameplay?.roleplayQuests === true, 'Alpha status must expose roleplay quests.');
  assert(alphaStatus.body.gameplay?.questChains === true, 'Alpha status must expose roleplay quest chains.');
  assert(alphaStatus.body.gameplay?.copiedUpstreamContent === false, 'Alpha status must reject copied upstream content.');
  assert(alphaStatus.body.chain?.network === 'CANARY', 'Alpha status must stay Canary-only.');
  assert(alphaStatus.body.edgeFunctions?.action === 'mochi-social-alpha-action', 'Alpha status must expose the Mochirii action function name.');
  assert(alphaStatus.body.edgeFunctions?.progress === 'mochi-social-alpha-progress', 'Alpha status must expose the Mochirii progress function name.');
  assert(alphaStatus.body.chainRuntime?.network === 'CANARY', 'Alpha status must expose Enjin Canary runtime details.');
  if (alphaStatus.body.enjinCanaryConfigured === false) {
    assert(alphaStatus.body.chainRuntime?.mode === 'configured-preview-stub', 'Missing Enjin env must expose configured-preview-stub mode.');
    assert(
      String(alphaStatus.body.chainRuntime?.message || '').includes('configured preview stub'),
      'Configured preview stub mode must explain the missing Enjin operator setup.'
    );
  }

  if (alphaStatus.body.supabaseEdgeConfigured && !allowEdgeMode) {
    throw new Error(
      'Local acceptance expects the fallback ledger path. Unset MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL and MOCHI_SOCIAL_GAME_SERVER_TOKEN, or set MOCHI_SOCIAL_ACCEPTANCE_ALLOW_EDGE=true for preview-only endpoint checks.'
    );
  }

  await getOk('/play', 'play');
  await getOk('/embed', 'embed');

  const invalidAction = await postJson('/integration/alpha/action', {
    type: 'chat.send',
    payload: {}
  }, 'invalid action');
  assert(invalidAction.status === 400, 'Invalid alpha action should return 400.');
  assert(invalidAction.body.error === 'invalid_alpha_action', 'Invalid alpha action must use invalid_alpha_action error.');

  const privateEnjinSubmit = await postJson('/integration/alpha/enjin/submit', {
    operation: 'poll-transaction',
    requestId: `${runId}-enjin-private`,
    playerId: 'local-acceptance-player',
    tokenId: '1',
    amount: 1,
    enjinTransactionUuid: 'tx-local-proof',
    confirmNoRealValue: true
  }, 'private enjin operator submit without token');
  assert([401, 503].includes(privateEnjinSubmit.status), 'Private Enjin operator submit must fail closed without the game server token.');
  assert(
    ['invalid_game_server_token', 'enjin_operator_disabled'].includes(privateEnjinSubmit.body.error),
    'Private Enjin operator submit must use a token-gating error.'
  );

  if (allowEdgeMode && alphaStatus.body.supabaseEdgeConfigured) {
    return;
  }

  const actions = [
    {
      requestId: `${runId}-chat`,
      type: 'chat.send',
      payload: { channel: 'local', message: 'Alpha local acceptance hello' }
    },
    {
      requestId: `${runId}-emote`,
      type: 'emote.send',
      payload: { emote: 'wave' }
    },
    {
      requestId: `${runId}-starter-vow`,
      type: 'spirit.starter_vow',
      payload: {
        vowId: 'jade-starter-vow',
        selectedSpiritId: 'lirabao',
        itemIds: ['mochirii-guild-seal'],
        localPresenceCount: 1,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-starter-knot',
        chatLines: ['Local acceptance starter vow proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-capture`,
      type: 'spirit.capture',
      payload: { spiritId: 'lirabao', offeredItemId: 'lantern-harmony-tea', harmonyScore: 2, source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-attune`,
      type: 'spirit.attune',
      payload: { spiritId: 'lirabao', offeredItemId: 'mochirii-guild-seal', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-party`,
      type: 'party.set',
      payload: { partyIds: ['lirabao'], activeSpiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-journal`,
      type: 'spirit.journal',
      payload: { roster: ['lirabao'], activeSpiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-expedition`,
      type: 'world.expedition',
      payload: { routeId: 'moonbridge-bamboo-trail', roster: ['lirabao'], activeSpiritId: 'lirabao', harmonyScore: 2, discoveredRoutes: [] }
    },
    {
      requestId: `${runId}-route-invite`,
      type: 'spirit.route_invite',
      payload: {
        routeId: 'moonbridge-bamboo-trail',
        offeredItemId: 'jade-thread-charm',
        harmonyScore: 3,
        roster: ['lirabao'],
        discoveredRoutes: ['moonbridge-bamboo-trail'],
        fieldAccordProof: true,
        fieldAccordId: 'moonbridge-goldleaf-accord',
        fieldAccordScore: 7,
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-cloudbell-expedition`,
      type: 'world.expedition',
      payload: { routeId: 'cloudbell-reed-bank', roster: ['lirabao', 'jintari'], activeSpiritId: 'jintari', harmonyScore: 4, discoveredRoutes: ['moonbridge-bamboo-trail'] }
    },
    {
      requestId: `${runId}-cloudbell-route-invite`,
      type: 'spirit.route_invite',
      payload: {
        routeId: 'cloudbell-reed-bank',
        offeredItemId: 'lantern-harmony-tea',
        harmonyScore: 4,
        roster: ['lirabao', 'jintari'],
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        fieldAccordScore: 12,
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-mastery`,
      type: 'world.route_mastery',
      payload: {
        masteryId: 'jade-cloudbell-circuit',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        roster: ['lirabao', 'jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        guildRankProof: true,
        rankTrialId: 'jade-court-initiate',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-patrol`,
      type: 'world.route_patrol',
      payload: {
        patrolId: 'jade-cloudbell-patrol',
        routeId: 'cloudbell-reed-bank',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 18,
        battleRoundOpponentScore: 8,
        harmonyFormProof: true,
        teamSparMatchProof: true,
        mentorChallengeProof: true,
        chatLines: ['Local acceptance route patrol proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-habitat-bond`,
      type: 'spirit.habitat_bond',
      payload: {
        bondId: 'jade-court-habitat-bond',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        careProof: true,
        bond: 3,
        growth: 'sprout',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-sanctuary-rite`,
      type: 'spirit.sanctuary_rite',
      payload: {
        riteId: 'jade-court-sanctuary-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careStreak: 1,
        trainingXp: 3,
        habitatBondProof: true,
        conditionWeaveProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-research`,
      type: 'spirit.research',
      payload: {
        folioId: 'jade-court-research-folio',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        techniqueProof: true,
        tacticProof: true,
        affinityProof: true,
        trainingXp: 3,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-compendium`,
      type: 'spirit.compendium_complete',
      payload: {
        compendiumId: 'jade-court-spirit-compendium',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        researchProof: true,
        researchFolioId: 'jade-court-research-folio',
        routeMasteryProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-roster-archive`,
      type: 'spirit.roster_archive',
      payload: {
        archiveId: 'jade-court-roster-archive',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['aozhen', 'lirabao'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-technique`,
      type: 'spirit.technique',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', currentMasteryXp: 0, bond: 3, noInjury: true }
    },
    {
      requestId: `${runId}-tactic`,
      type: 'battle.tactic_scroll',
      payload: { spiritId: 'jintari', moveId: 'goldleaf-feint', tacticId: 'goldleaf-opening', currentMasteryXp: 10, bond: 3, noInjury: true }
    },
    {
      requestId: `${runId}-technique-loadout`,
      type: 'spirit.technique_loadout',
      payload: {
        loadoutId: 'jade-step-loadout',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        preferredMoveIdBySpiritId: {
          lirabao: 'lantern-pulse',
          jintari: 'goldleaf-feint',
          aozhen: 'skybell-guard'
        },
        techniqueProof: true,
        tacticProof: true,
        tacticId: 'goldleaf-opening',
        techniqueMasteryXp: 17,
        routeMasteryProof: true,
        journalProof: true,
        journalDiscoveredCount: 3,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-rank`,
      type: 'guild.rank_trial',
      payload: { roster: ['lirabao', 'jintari'], activeSpiritId: 'jintari', bond: 3, completedQuestSteps: ['attune-spirit'], tacticProof: true, affinityWins: 1, sparWins: 0, journalDiscoveredCount: 2, noRealValue: true }
    },
    {
      requestId: `${runId}-growth-rite`,
      type: 'spirit.growth_rite',
      payload: { spiritId: 'jintari', bond: 5, growth: 'glow', trainingXp: 3, raisingProof: true, rankTrialProof: true, rankTrialId: 'jade-court-initiate', noRealValue: true }
    },
    {
      requestId: `${runId}-affinity`,
      type: 'battle.affinity_trial',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', trialId: 'jade-mirror-trial', bond: 3, techniqueMasteryXp: 7, noInjury: true }
    },
    {
      requestId: `${runId}-spar`,
      type: 'battle.spar_ladder',
      payload: { partyIds: ['lirabao'], opponentId: 'jade-echo-apprentice', priorWins: 0, noInjury: true }
    },
    {
      requestId: `${runId}-harmony-form`,
      type: 'party.harmony_form',
      payload: {
        formId: 'triune-jade-harmony',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        tacticProof: true,
        affinityProof: true,
        trainingXp: 3,
        sparLadderXp: 5,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-harmony-trial`,
      type: 'battle.harmony_trial',
      payload: {
        trialId: 'jade-echo-concord',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        harmonyFormProof: true,
        harmonyFormId: 'triune-jade-harmony',
        tacticProof: true,
        affinityProof: true,
        sparLadderWins: 1,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance concord proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-team-spar-match`,
      type: 'battle.team_spar_match',
      payload: {
        matchId: 'jade-mirror-team-match',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        harmonyTrialProof: true,
        harmonyTrialId: 'jade-echo-concord',
        harmonyTrialScore: 24,
        routeMasteryProof: true,
        tacticProof: true,
        growthRiteProof: true,
        questChainProof: true,
        trainingXp: 3,
        sparLadderWins: 1,
        chatLines: ['Local acceptance team spar match proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-mentor-challenge`,
      type: 'battle.mentor_challenge',
      payload: {
        challengeId: 'silk-banner-mentor-drill',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        battleRoundProof: true,
        battleRoundId: 'jade-echo-apprentice-round-1',
        battleRoundVictory: true,
        techniqueMasteryXp: 17,
        tacticMasteryXp: 14,
        raisingCareStreak: 1,
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-technique-codex`,
      type: 'battle.technique_codex',
      payload: {
        codexId: 'jade-technique-codex',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        masteredMoveIds: ['lantern-pulse', 'goldleaf-feint', 'skybell-guard'],
        tacticIds: ['lantern-anchor', 'goldleaf-opening', 'skybell-ward'],
        techniqueProof: true,
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        techniqueMasteryXp: 18,
        tacticProof: true,
        trainingXp: 3,
        battleRoundProof: true,
        battleRoundVictory: true,
        journalProof: true,
        journalDiscoveredCount: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-technique-codex-seal',
        chatLines: ['Local acceptance technique codex proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-trait-attune`,
      type: 'spirit.trait_attune',
      payload: {
        traitId: 'jade-heart-trait',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        battleRoundProof: true,
        battleRoundVictory: true,
        growthRiteProof: true,
        careStreak: 2,
        journalProof: true,
        journalDiscoveredCount: 3,
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 4 },
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-condition-weave`,
      type: 'battle.condition_weave',
      payload: {
        weaveId: 'jade-mirror-condition-weave',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        tacticProof: true,
        affinityProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        sparLadderWins: 1,
        trainingXp: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance condition weave proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-affinity-matrix`,
      type: 'battle.affinity_matrix',
      payload: {
        matrixId: 'jade-affinity-matrix',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        affinityLabels: ['blossom', 'citrus-gold', 'sky-jade'],
        conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
        affinityProof: true,
        affinityTrialId: 'silk-cinder-trial',
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        tacticProof: true,
        harmonyFormProof: true,
        sparLadderWins: 1,
        trainingXp: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-affinity-matrix-seal',
        chatLines: ['Local acceptance affinity matrix proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-relic-attunement`,
      type: 'spirit.relic_attune',
      payload: {
        relicAttunementId: 'jade-relic-attunement',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        itemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-court-provision-satchel'],
        techniqueLoadoutProof: true,
        techniqueLoadoutId: 'jade-step-loadout',
        techniqueCodexProof: true,
        techniqueCodexId: 'jade-technique-codex',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        exchangeAccordProof: true,
        exchangeAccordId: 'jade-exchange-accord',
        careCycleProof: true,
        temperamentConcordProof: true,
        growthRiteProof: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-relic-silk-cord',
        chatLines: ['Local acceptance relic attunement proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-capture-rite`,
      type: 'spirit.capture_rite',
      payload: {
        riteId: 'jade-court-capture-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        capturedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        lureItemIds: ['lantern-harmony-tea', 'jade-thread-charm'],
        journalDiscoveredCount: 3,
        localPresenceCount: 2,
        captureProof: true,
        routeInviteProof: true,
        fieldAccordProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance capture rite proof.'],
        rewardItemId: 'jade-capture-rite-tally',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-bond`,
      type: 'spirit.bond',
      payload: { spiritId: 'lirabao', source: 'acceptance-script' }
    },
    {
      requestId: `${runId}-care`,
      type: 'spirit.care',
      payload: { spiritId: 'lirabao', careType: 'jade-tea', bondDelta: 1 }
    },
    {
      requestId: `${runId}-train`,
      type: 'spirit.train',
      payload: { spiritId: 'lirabao', moveId: 'lantern-pulse', bond: 3, round: 1, noInjury: true }
    },
    {
      requestId: `${runId}-raise`,
      type: 'spirit.raise',
      payload: { spiritId: 'lirabao', needId: 'jade-brush-groom', currentBond: 3 }
    },
    {
      requestId: `${runId}-quest-accept`,
      type: 'quest.accept',
      payload: { questId: 'first-lantern-vow' }
    },
    {
      requestId: `${runId}-quest-progress`,
      type: 'quest.progress',
      payload: { questId: 'first-lantern-vow', stepId: 'attune-spirit' }
    },
    {
      requestId: `${runId}-quest-first-complete`,
      type: 'quest.progress',
      payload: { questId: 'first-lantern-vow', stepId: 'open-journal', completedSteps: ['attune-spirit', 'greet-sifu-narao'] }
    },
    {
      requestId: `${runId}-quest-market-accept`,
      type: 'quest.accept',
      payload: { questId: 'silk-market-kindness' }
    },
    {
      requestId: `${runId}-quest-market-complete`,
      type: 'quest.progress',
      payload: { questId: 'silk-market-kindness', stepId: 'thank-local-buddy', completedSteps: ['list-jade-thread-charm', 'offer-direct-trade'] }
    },
    {
      requestId: `${runId}-quest-skybell-accept`,
      type: 'quest.accept',
      payload: { questId: 'skybell-spar' }
    },
    {
      requestId: `${runId}-quest-skybell-complete`,
      type: 'quest.progress',
      payload: { questId: 'skybell-spar', stepId: 'complete-raising-care', completedSteps: ['choose-training-move', 'finish-training-bout'] }
    },
    {
      requestId: `${runId}-market`,
      type: 'market.fixed_list',
      payload: { itemId: 'jade-thread-charm', quantity: 1, currency: 'guild-seals', price: 5, noRealValue: true }
    },
    {
      requestId: `${runId}-market-receipt`,
      type: 'market.guild_receipt',
      payload: { receiptId: 'jade-court-market-receipt', itemId: 'jade-thread-charm', quantity: 1, currency: 'guild-seals', price: 5, marketProof: true, profileViewed: true, guildBuddyProof: true, statusMood: 'cozy', chatLines: ['Local acceptance market receipt proof.'], rewardItemId: 'jade-market-receipt', noRealValue: true }
    },
    {
      requestId: `${runId}-trade`,
      type: 'trade.direct_offer',
      payload: { targetPlayerId: 'local-acceptance-peer', offered: ['jade-thread-charm'], requested: ['guild-seals:5'] }
    },
    {
      requestId: `${runId}-provision-satchel`,
      type: 'item.provision_satchel',
      payload: {
        satchelId: 'jade-court-provision-satchel',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        marketProof: true,
        marketReceiptProof: true,
        tradeProof: true,
        routeInviteProof: true,
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        fieldAccordRewardItemId: 'jade-field-accord-talisman',
        careStreak: 1,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-care-cycle`,
      type: 'spirit.care_cycle',
      payload: {
        cycleId: 'jade-court-care-cycle',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careStreak: 1,
        trainingXp: 3,
        raisingProof: true,
        raisingMilestoneLabel: 'Skybell Whisper Spark',
        rosterArchiveProof: true,
        rosterArchiveId: 'jade-court-roster-archive',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        profileViewed: true,
        guildBuddyProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-bond-gift`,
      type: 'item.bond_gift',
      payload: {
        riteId: 'jade-bond-gift-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        giftItemIds: ['jade-mooncake-box', 'lantern-harmony-tea', 'jade-thread-charm'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        marketReceiptProof: true,
        marketReceiptId: 'jade-court-market-receipt',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance Jade Bond Gift Rite proof.'],
        rewardItemId: 'jade-bond-gift-ribbon',
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-temperament-concord`,
      type: 'spirit.temperament_concord',
      payload: {
        concordId: 'jade-temperament-concord',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        bondBySpiritId: { lirabao: 5, jintari: 4, aozhen: 3 },
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Temperament concord ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-field-almanac`,
      type: 'spirit.field_almanac',
      payload: {
        almanacId: 'jade-field-almanac',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Field almanac ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-ecology`,
      type: 'world.route_ecology',
      payload: {
        surveyId: 'jade-route-ecology-survey',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-route-ecology-map',
        chatLines: ['Route ecology ready.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-weather-veil`,
      type: 'world.weather_veil',
      payload: {
        weatherVeilId: 'jade-weather-veil',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        weatherConditionIds: ['moonlit-mist', 'goldleaf-rain', 'skybell-crosswind'],
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-weather-veil-chart',
        chatLines: ['Local acceptance weather veil proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-encounter-rotation`,
      type: 'world.encounter_rotation',
      payload: {
        rotationId: 'jade-encounter-rotation',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        encounterSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        lureItemIds: ['lantern-harmony-tea', 'jade-thread-charm'],
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        fieldAccordProof: true,
        fieldAccordId: 'cloudbell-skyvow-accord',
        captureRiteProof: true,
        captureRiteId: 'jade-court-capture-rite',
        weatherVeilProof: true,
        weatherVeilId: 'jade-weather-veil',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-encounter-rotation-scroll',
        chatLines: ['Local acceptance encounter rotation proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-encounter-atlas`,
      type: 'world.encounter_atlas',
      payload: {
        atlasId: 'jade-encounter-atlas',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        encounteredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        capturedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        rarityTiers: ['common', 'uncommon', 'rare'],
        journalDiscoveredCount: 3,
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        captureRiteProof: true,
        captureRiteId: 'jade-court-capture-rite',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        encounterRotationProof: true,
        encounterRotationId: 'jade-encounter-rotation',
        weatherVeilProof: true,
        weatherVeilId: 'jade-weather-veil',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-encounter-atlas',
        chatLines: ['Local acceptance encounter atlas proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-habitat-census`,
      type: 'spirit.habitat_census',
      payload: {
        censusId: 'jade-habitat-census',
        roster: ['lirabao', 'jintari', 'aozhen'],
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        observedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        careLoggedSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        encounterAtlasProof: true,
        encounterAtlasId: 'jade-encounter-atlas',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        weatherVeilProof: true,
        weatherVeilId: 'jade-weather-veil',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-habitat-census-seal',
        chatLines: ['Local acceptance habitat census proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-craft-writ`,
      type: 'item.craft_writ',
      payload: {
        writId: 'jade-court-craft-writ',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'jintari',
        recipeIds: ['lantern-tea-threading', 'moonbridge-provision-wrap'],
        stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        fieldAlmanacProof: true,
        fieldAlmanacId: 'jade-field-almanac',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        marketProof: true,
        tradeProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-court-craft-writ',
        chatLines: ['Local acceptance craft writ proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-exchange-accord`,
      type: 'trade.exchange_accord',
      payload: {
        accordId: 'jade-exchange-accord',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        listedItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
        offeredItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
        marketProof: true,
        tradeProof: true,
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-exchange-accord-tally',
        chatLines: ['Local acceptance exchange accord proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-waystone`,
      type: 'world.route_waystone',
      payload: {
        waystoneId: 'jade-cloudbell-waystone',
        activeSpiritId: 'aozhen',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        routeInvitedSpiritIds: ['jintari', 'aozhen'],
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-waystone-travel-seal',
        chatLines: ['Local acceptance route waystone proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-route-charter`,
      type: 'world.route_charter',
      payload: {
        charterId: 'jade-route-charter',
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        routeWaystoneProof: true,
        routeWaystoneId: 'jade-cloudbell-waystone',
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        weatherVeilProof: true,
        weatherVeilId: 'jade-weather-veil',
        encounterAtlasProof: true,
        encounterAtlasId: 'jade-encounter-atlas',
        habitatCensusProof: true,
        habitatCensusId: 'jade-habitat-census',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-route-charter-slip',
        chatLines: ['Local acceptance route charter proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-nurture-rite`,
      type: 'spirit.nurture_rite',
      payload: {
        riteId: 'jade-moonwell-nurture-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        temperamentConcordProof: true,
        temperamentConcordId: 'jade-temperament-concord',
        raisingProof: true,
        raisingMilestoneLabel: 'Lacquer Luck Glow',
        bond: 5,
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-moonwell-nurture-ribbon',
        chatLines: ['Local acceptance nurture rite proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-recovery-tea`,
      type: 'spirit.recovery_tea',
      payload: {
        teaId: 'jade-teahouse-recovery',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-teahouse-recovery-cup',
        chatLines: ['Local acceptance recovery tea proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-provision-catalog`,
      type: 'item.provision_catalog',
      payload: {
        catalogId: 'jade-provision-catalog',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'jintari',
        stockItemIds: ['jade-thread-charm', 'lantern-harmony-tea', 'jade-mooncake-box'],
        careItemIds: ['jade-mooncake-box', 'lantern-harmony-tea'],
        routeItemIds: ['lantern-harmony-tea', 'jade-thread-charm'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        marketReceiptProof: true,
        marketReceiptId: 'jade-court-market-receipt',
        tradeProof: true,
        craftWritProof: true,
        craftWritId: 'jade-court-craft-writ',
        recoveryTeaProof: true,
        recoveryTeaId: 'jade-teahouse-recovery',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        habitatCensusProof: true,
        habitatCensusId: 'jade-habitat-census',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-provision-catalog-seal',
        chatLines: ['Local acceptance provision catalog proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-battle-kit`,
      type: 'item.battle_kit',
      payload: {
        kitId: 'jade-battle-kit',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        itemIds: ['lantern-harmony-tea', 'jade-thread-charm', 'jade-mooncake-box'],
        provisionCatalogProof: true,
        provisionCatalogId: 'jade-provision-catalog',
        techniqueCodexProof: true,
        techniqueCodexId: 'jade-technique-codex',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        recoveryTeaProof: true,
        recoveryTeaId: 'jade-teahouse-recovery',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 41,
        battleRoundOpponentScore: 19,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-battle-kit-tag',
        chatLines: ['Local acceptance battle kit proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-remedy-pouch`,
      type: 'item.remedy_pouch',
      payload: {
        pouchId: 'jade-remedy-pouch',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'lirabao',
        conditionIds: ['lantern-ward', 'goldleaf-tempo', 'skybell-guard'],
        itemIds: ['lantern-harmony-tea', 'jade-thread-charm', 'jade-mooncake-box'],
        recoveryTeaProof: true,
        recoveryTeaId: 'jade-teahouse-recovery',
        battleKitProof: true,
        battleKitId: 'jade-battle-kit',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        sanctuaryRiteProof: true,
        sanctuaryRiteId: 'jade-court-sanctuary-rite',
        battleRoundProof: true,
        battleRoundVictory: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-remedy-pouch-tag',
        chatLines: ['Local acceptance remedy pouch proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-kinship-album`,
      type: 'spirit.kinship_album',
      payload: {
        albumId: 'jade-kinship-album',
        roster: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        habitatBondProof: true,
        habitatBondId: 'jade-court-habitat-bond',
        raisingProof: true,
        raisingMilestoneLabel: 'Moonwell Bloom Form',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-kinship-album',
        chatLines: ['Local acceptance kinship album proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-nursery-grove`,
      type: 'spirit.nursery_grove',
      payload: {
        nurseryId: 'jade-nursery-grove',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        recoveryTeaProof: true,
        recoveryTeaId: 'jade-teahouse-recovery',
        kinshipAlbumProof: true,
        kinshipAlbumId: 'jade-kinship-album',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        raisingProof: true,
        raisingMilestoneLabel: 'Moonwell Bloom Form',
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-nursery-sprout',
        chatLines: ['Local acceptance nursery grove proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-bloom-ascendance`,
      type: 'spirit.bloom_ascendance',
      payload: {
        ascendanceId: 'jade-bloom-ascendance',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        nurseryGroveProof: true,
        nurseryGroveId: 'jade-nursery-grove',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        kinshipAlbumProof: true,
        kinshipAlbumId: 'jade-kinship-album',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        traitAttunementProof: true,
        traitAttunementId: 'jade-heart-trait',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        battleRoundProof: true,
        battleRoundVictory: true,
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-bloom-ascendance-sigil',
        chatLines: ['Local acceptance bloom ascendance proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-lineage-register`,
      type: 'spirit.lineage_register',
      payload: {
        registerId: 'jade-lineage-register',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        bondBySpiritId: { lirabao: 5, jintari: 5, aozhen: 5 },
        localPresenceCount: 2,
        kinshipAlbumProof: true,
        kinshipAlbumId: 'jade-kinship-album',
        nurseryGroveProof: true,
        nurseryGroveId: 'jade-nursery-grove',
        bloomAscendanceProof: true,
        bloomAscendanceId: 'jade-bloom-ascendance',
        captureRiteProof: true,
        captureRiteId: 'jade-court-capture-rite',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        raisingProof: true,
        raisingMilestoneLabel: 'Moonwell Bloom Form',
        trainingXp: 3,
        sparLadderXp: 5,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-lineage-register-seal',
        chatLines: ['Local acceptance lineage register proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-roster-cabinet`,
      type: 'spirit.roster_cabinet',
      payload: {
        cabinetId: 'jade-roster-cabinet',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        storageSlotLabels: ['1-lirabao-guild-slot', '2-jintari-guild-slot', '3-aozhen-guild-slot'],
        activeSpiritId: 'aozhen',
        rosterArchiveProof: true,
        rosterArchiveId: 'jade-court-roster-archive',
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        nurseryGroveProof: true,
        nurseryGroveId: 'jade-nursery-grove',
        lineageRegisterProof: true,
        lineageRegisterId: 'jade-lineage-register',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-roster-cabinet-tag',
        chatLines: ['Local acceptance roster cabinet proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-name-banner`,
      type: 'spirit.name_banner',
      payload: {
        riteId: 'jade-name-banner-rite',
        roster: ['lirabao', 'jintari', 'aozhen'],
        nameRecords: [
          { spiritId: 'lirabao', title: 'Lirabao Lanternheart' },
          { spiritId: 'jintari', title: 'Jintari Goldleaf Step' },
          { spiritId: 'aozhen', title: 'Aozhen Skybell Veil' }
        ],
        journalSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        compendiumProof: true,
        compendiumId: 'jade-court-spirit-compendium',
        rosterArchiveProof: true,
        rosterArchiveId: 'jade-court-roster-archive',
        rosterCabinetProof: true,
        rosterCabinetId: 'jade-roster-cabinet',
        bondGiftProof: true,
        bondGiftRiteId: 'jade-bond-gift-rite',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-name-banner-tag',
        chatLines: ['Local acceptance Jade Name Banner Rite proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-blossom-cradle`,
      type: 'spirit.blossom_cradle',
      payload: {
        cradleId: 'jade-blossom-cradle',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        caredSpiritIds: ['lirabao', 'jintari', 'aozhen'],
        raisingMilestoneLabels: ['Lantern Spark', 'Goldleaf Step', 'Moonwell Bloom Form'],
        activeSpiritId: 'lirabao',
        totalBond: 15,
        kinshipAlbumProof: true,
        kinshipAlbumId: 'jade-kinship-album',
        nurseryGroveProof: true,
        nurseryGroveId: 'jade-nursery-grove',
        bloomAscendanceProof: true,
        bloomAscendanceId: 'jade-bloom-ascendance',
        lineageRegisterProof: true,
        lineageRegisterId: 'jade-lineage-register',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        careCycleProof: true,
        careCycleId: 'jade-court-care-cycle',
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-blossom-cradle-ribbon',
        chatLines: ['Local acceptance blossom cradle proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-dojo-ladder`,
      type: 'battle.dojo_ladder',
      payload: {
        ladderId: 'jade-dojo-ladder',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        clearedOpponentIds: ['jade-echo-apprentice', 'silk-river-disciple'],
        sparLadderWins: 2,
        sparLadderXp: 5,
        trainingXp: 3,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        techniqueCodexProof: true,
        techniqueCodexId: 'jade-technique-codex',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-dojo-ladder-seal',
        chatLines: ['Local acceptance dojo ladder proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-tournament-bracket`,
      type: 'battle.tournament_bracket',
      payload: {
        bracketId: 'jade-banner-tournament',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        dojoLadderProof: true,
        dojoLadderId: 'jade-dojo-ladder',
        dojoLadderScore: 56,
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        mentorChallengeScore: 28,
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        harmonyTrialProof: true,
        harmonyTrialId: 'jade-echo-concord',
        conditionWeaveProof: true,
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        localPresenceCount: 2,
        routePatrolProof: true,
        nurtureRiteProof: true,
        guildRankProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-banner-tournament-pennant',
        chatLines: ['Local acceptance tournament bracket proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-rival-circle`,
      type: 'battle.rival_circle',
      payload: {
        circleId: 'jade-rival-circle',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        tournamentScore: 57,
        dojoLadderProof: true,
        dojoLadderId: 'jade-dojo-ladder',
        dojoLadderScore: 56,
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        mentorChallengeScore: 28,
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        teamSparMatchScore: 32,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        techniqueLoadoutProof: true,
        traitAttunementProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-rival-circle-mark',
        chatLines: ['Local acceptance rival circle proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-sifu-council`,
      type: 'battle.sifu_council',
      payload: {
        councilId: 'jade-sifu-council',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        clearedCouncilMemberIds: ['sifu-narao', 'warden-meilin', 'keeper-haoran'],
        dojoLadderProof: true,
        dojoLadderId: 'jade-dojo-ladder',
        dojoLadderScore: 56,
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        tournamentScore: 57,
        rivalCircleProof: true,
        rivalCircleId: 'jade-rival-circle',
        rivalCircleScore: 63,
        techniqueCodexProof: true,
        techniqueCodexId: 'jade-technique-codex',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        guildRankProof: true,
        routePatrolProof: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-sifu-council-crest',
        chatLines: ['Local acceptance sifu council proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-summit-circuit`,
      type: 'battle.summit_circuit',
      payload: {
        circuitId: 'jade-summit-circuit',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        summitSealIds: ['jade-dojo-seal', 'banner-ring-seal', 'qinghei-rival-seal', 'sifu-council-seal'],
        dojoLadderProof: true,
        dojoLadderId: 'jade-dojo-ladder',
        dojoLadderScore: 56,
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        tournamentScore: 57,
        rivalCircleProof: true,
        rivalCircleId: 'jade-rival-circle',
        rivalCircleScore: 63,
        sifuCouncilProof: true,
        sifuCouncilId: 'jade-sifu-council',
        sifuCouncilScore: 74,
        techniqueCodexProof: true,
        techniqueCodexId: 'jade-technique-codex',
        conditionWeaveProof: true,
        conditionWeaveId: 'jade-mirror-condition-weave',
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        relicAttunementProof: true,
        relicAttunementId: 'jade-relic-attunement',
        harmonyFormProof: true,
        harmonyFormId: 'triune-jade-harmony',
        harmonyTrialProof: true,
        harmonyTrialId: 'jade-echo-concord',
        teamSparMatchProof: true,
        teamSparMatchId: 'jade-mirror-team-match',
        mentorChallengeProof: true,
        mentorChallengeId: 'silk-banner-mentor-drill',
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 31,
        battleRoundOpponentScore: 18,
        guildRankProof: true,
        growthRiteProof: true,
        routePatrolProof: true,
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-summit-circuit-laurel',
        chatLines: ['Local acceptance summit circuit proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-guild-commission`,
      type: 'guild.commission_complete',
      payload: {
        commissionId: 'jade-court-commission-ledger',
        roster: ['lirabao', 'jintari', 'aozhen'],
        activeSpiritId: 'aozhen',
        journalDiscoveredCount: 3,
        questChainProof: true,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        marketProof: true,
        tradeProof: true,
        trainingXp: 3,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance commission proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-guild-rally`,
      type: 'guild.social_rally',
      payload: {
        rallyId: 'jade-courtyard-rally',
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance rally proof.'],
        emoteProof: true,
        commissionProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-quest-ledger`,
      type: 'quest.ledger_record',
      payload: {
        ledgerId: 'jade-quest-ledger',
        roster: ['lirabao', 'jintari', 'aozhen'],
        acceptedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        journalDiscoveredCount: 3,
        localPresenceCount: 2,
        questChainProof: true,
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        marketReceiptProof: true,
        marketReceiptId: 'jade-court-market-receipt',
        provisionProof: true,
        provisionSatchelId: 'jade-court-provision-satchel',
        commissionProof: true,
        commissionId: 'jade-court-commission-ledger',
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-quest-ledger-seal',
        chatLines: ['Local acceptance quest ledger proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-story-chapter`,
      type: 'story.chapter_complete',
      payload: {
        chapterId: 'jade-scroll-story-chapter',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        discoveredRoutes: ['moonbridge-bamboo-trail', 'cloudbell-reed-bank'],
        journalDiscoveredCount: 3,
        localPresenceCount: 2,
        routeEcologyProof: true,
        routeEcologyId: 'jade-route-ecology-survey',
        routeWaystoneProof: true,
        routeWaystoneId: 'jade-cloudbell-waystone',
        questLedgerProof: true,
        questLedgerId: 'jade-quest-ledger',
        nurtureRiteProof: true,
        nurtureRiteId: 'jade-moonwell-nurture-rite',
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        commissionProof: true,
        commissionId: 'jade-court-commission-ledger',
        rallyProof: true,
        rallyId: 'jade-courtyard-rally',
        profileViewed: true,
        guildBuddyProof: true,
        emoteProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-scroll-story-chapter',
        chatLines: ['Local acceptance story chapter proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-canary`,
      type: 'chain.withdraw_request',
      payload: { assetId: 'lirabao-canary-certificate', chainNetwork: 'CANARY', noRealValue: true }
    },
    {
      requestId: `${runId}-canary-return`,
      type: 'chain.deposit_request',
      payload: {
        assetId: 'lirabao-canary-certificate',
        chainNetwork: 'CANARY',
        noRealValue: true,
        priorRequestStaged: true,
        confirmNoCreditUntilFinalized: true
      }
    },
    {
      requestId: `${runId}-canary-finality-review`,
      type: 'chain.operation_update',
      payload: {
        chainRequestId: `${runId}-canary`,
        transactionState: 'PENDING',
        itemId: 'lirabao-canary-certificate',
        tokenId: '1',
        amount: 1,
        chainNetwork: 'CANARY',
        noRealValue: true,
        previewStub: true,
        priorRequestStaged: true,
        priorReturnStaged: true,
        confirmNoCreditUntilFinalized: true
      }
    },
    {
      requestId: `${runId}-insignia-case`,
      type: 'guild.insignia_case',
      payload: {
        caseId: 'jade-insignia-case',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        routeMasteryProof: true,
        routeMasteryId: 'jade-cloudbell-circuit',
        routePatrolProof: true,
        routePatrolId: 'jade-cloudbell-patrol',
        guildRankProof: true,
        guildRankId: 'jade-court-initiate',
        growthRiteProof: true,
        growthRiteId: 'moonwell-bloom-rite',
        tournamentProof: true,
        tournamentId: 'jade-banner-tournament',
        storyChapterProof: true,
        storyChapterId: 'jade-scroll-story-chapter',
        harmonyFormProof: true,
        harmonyFormId: 'triune-jade-harmony',
        profileViewed: true,
        guildBuddyProof: true,
        emoteProof: true,
        statusMood: 'cozy',
        rewardItemId: 'jade-insignia-case',
        chatLines: ['Local acceptance insignia case proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-wayfarer-chronicle`,
      type: 'guild.wayfarer_chronicle',
      payload: {
        chronicleId: 'jade-wayfarer-chronicle',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        journalDiscoveredCount: 3,
        completedQuestIds: ['first-lantern-vow', 'silk-market-kindness', 'skybell-spar'],
        localPresenceCount: 2,
        starterVowProof: true,
        captureProof: true,
        captureRiteProof: true,
        encounterRotationProof: true,
        encounterAtlasProof: true,
        habitatCensusProof: true,
        routeMasteryProof: true,
        routePatrolProof: true,
        routeEcologyProof: true,
        habitatBondProof: true,
        researchProof: true,
        compendiumProof: true,
        provisionProof: true,
        provisionCatalogProof: true,
        battleKitProof: true,
        remedyPouchProof: true,
        questLedgerProof: true,
        rosterCabinetProof: true,
        blossomCradleProof: true,
        craftWritProof: true,
        routeWaystoneProof: true,
        routeCharterProof: true,
        nurtureRiteProof: true,
        kinshipAlbumProof: true,
        nurseryGroveProof: true,
        bloomAscendanceProof: true,
        lineageRegisterProof: true,
        exchangeAccordProof: true,
        exchangeAccordId: 'jade-exchange-accord',
        commissionProof: true,
        rallyProof: true,
        storyChapterProof: true,
        insigniaCaseProof: true,
        techniqueLoadoutProof: true,
        traitAttunementProof: true,
        conditionWeaveProof: true,
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        techniqueCodexProof: true,
        relicAttunementProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        mentorChallengeProof: true,
        dojoLadderProof: true,
        tournamentProof: true,
        sifuCouncilProof: true,
        summitCircuitProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        questChainProof: true,
        marketProof: true,
        marketReceiptProof: true,
        tradeProof: true,
        canaryPreviewProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance wayfarer chronicle proof.'],
        noRealValue: true
      }
    },
    {
      requestId: `${runId}-ascension-trial`,
      type: 'guild.ascension_trial',
      payload: {
        trialId: 'jade-court-ascension-trial',
        roster: ['lirabao', 'jintari', 'aozhen'],
        partyIds: ['lirabao', 'jintari', 'aozhen'],
        localPresenceCount: 2,
        starterVowProof: true,
        wayfarerChronicleProof: true,
        kinshipAlbumProof: true,
        nurseryGroveProof: true,
        bloomAscendanceProof: true,
        lineageRegisterProof: true,
        exchangeAccordProof: true,
        exchangeAccordId: 'jade-exchange-accord',
        provisionCatalogProof: true,
        battleKitProof: true,
        remedyPouchProof: true,
        questLedgerProof: true,
        rosterCabinetProof: true,
        blossomCradleProof: true,
        routeCharterProof: true,
        storyChapterProof: true,
        insigniaCaseProof: true,
        routePatrolProof: true,
        mentorChallengeProof: true,
        dojoLadderProof: true,
        tournamentProof: true,
        sifuCouncilProof: true,
        summitCircuitProof: true,
        rivalCircleProof: true,
        battleRoundProof: true,
        battleRoundVictory: true,
        battleRoundFocusScore: 18,
        battleRoundOpponentScore: 8,
        conditionWeaveProof: true,
        affinityMatrixProof: true,
        affinityMatrixId: 'jade-affinity-matrix',
        techniqueCodexProof: true,
        relicAttunementProof: true,
        harmonyFormProof: true,
        harmonyTrialProof: true,
        teamSparMatchProof: true,
        guildRankProof: true,
        growthRiteProof: true,
        questChainProof: true,
        marketProof: true,
        marketReceiptProof: true,
        tradeProof: true,
        canaryPreviewProof: true,
        profileViewed: true,
        guildBuddyProof: true,
        statusMood: 'cozy',
        chatLines: ['Local acceptance guild ascension proof.'],
        noRealValue: true
      }
    }
  ];

  for (const action of actions) {
    const response = await postJson('/integration/alpha/action', action, action.type);
    assert(response.status === 202, `${action.type} should record to the local fallback ledger with 202.`);
    assert(response.body.ok === true, `${action.type} did not return ok=true.`);
    assert(response.body.mode === 'local-alpha-ledger', `${action.type} did not use the local alpha ledger.`);
    assert(response.body.noRealValue === true, `${action.type} did not preserve no-real-value response.`);
    if (action.type.startsWith('chain.')) {
      assert(response.body.chainRuntime?.network === 'CANARY', `${action.type} did not return Enjin Canary runtime details.`);
      assert(response.body.chainRuntime?.mode === 'configured-preview-stub', `${action.type} must explain configured-preview-stub mode locally.`);
    }
    report.actions.push({ requestId: action.requestId, type: action.type, status: response.status });
  }

  const entries = await readLedgerEntries();
  const entriesById = new Map(entries.map((entry) => [entry.requestId, entry]));

  for (const action of actions) {
    const entry = entriesById.get(action.requestId);
    assert(entry, `Missing local ledger entry for ${action.type}. Expected requestId ${action.requestId}.`);
    assert(entry.type === action.type, `Ledger entry ${action.requestId} recorded type ${entry.type}, expected ${action.type}.`);
    assert(entry.ledgerVersion === 1, `Ledger entry ${action.requestId} must use ledgerVersion=1.`);
    assert(entry.source === 'local-alpha-ledger', `Ledger entry ${action.requestId} must identify the local fallback ledger source.`);
    assert(entry.alphaStopPoint === 'alpha-rc-ready', `Ledger entry ${action.requestId} must keep the alpha RC stop point.`);
    assert(entry.chainNetwork === 'CANARY', `Ledger entry ${action.requestId} must stay Canary-scoped.`);
    assert(entry.noRealValue === true, `Ledger entry ${action.requestId} must be no-real-value.`);
    assert(entry.payload && typeof entry.payload === 'object', `Ledger entry ${action.requestId} must preserve the action payload.`);
    assert(typeof entry.receivedAt === 'string', `Ledger entry ${action.requestId} must include receivedAt.`);
  }

  const cloudbellInvite = entriesById.get(`${runId}-cloudbell-route-invite`);
  assert(cloudbellInvite?.payload?.fieldAccordProof === true, 'Cloudbell route invite ledger entry must preserve field accord proof.');
  assert(cloudbellInvite?.payload?.fieldAccordId === 'cloudbell-skyvow-accord', 'Cloudbell route invite ledger entry must preserve the field accord id.');
  assert(cloudbellInvite?.payload?.fieldAccordRewardItemId === 'jade-field-accord-talisman', 'Cloudbell route invite ledger entry must preserve the no-real-value field accord talisman proof.');
  const routePatrol = entriesById.get(`${runId}-route-patrol`);
  assert(routePatrol?.payload?.patrolId === 'jade-cloudbell-patrol', 'Route patrol ledger entry must preserve the Jade Cloudbell Patrol id.');
  assert(routePatrol?.payload?.localPresenceCount === 2, 'Route patrol ledger entry must preserve the two-tester presence proof.');
  assert(routePatrol?.payload?.routeMasteryProof === true, 'Route patrol ledger entry must preserve route mastery proof.');
  assert(routePatrol?.payload?.fieldAccordProof === true, 'Route patrol ledger entry must preserve field accord proof.');
  assert(routePatrol?.payload?.battleRoundProof === true, 'Route patrol ledger entry must preserve battle round proof.');
  assert(routePatrol?.payload?.noRealValue === true, 'Route patrol ledger entry must remain no-real-value.');
  const canaryFinality = entriesById.get(`${runId}-canary-finality-review`);
  assert(canaryFinality?.payload?.chainRequestId === `${runId}-canary`, 'Canary finality review ledger entry must point at the staged certificate request.');
  assert(canaryFinality?.payload?.transactionState === 'PENDING', 'Canary finality review ledger entry must preserve the pending preview state.');
  assert(canaryFinality?.payload?.itemId === 'lirabao-canary-certificate', 'Canary finality review ledger entry must preserve the Lirabao certificate item.');
  assert(canaryFinality?.payload?.chainNetwork === 'CANARY', 'Canary finality review ledger entry must stay on Canary.');
  assert(canaryFinality?.payload?.previewStub === true, 'Canary finality review ledger entry must remain a configured preview stub.');
  assert(canaryFinality?.payload?.priorRequestStaged === true, 'Canary finality review ledger entry must preserve the request-stage proof.');
  assert(canaryFinality?.payload?.priorReturnStaged === true, 'Canary finality review ledger entry must preserve the return-stage proof.');
  assert(canaryFinality?.payload?.confirmNoCreditUntilFinalized === true, 'Canary finality review ledger entry must confirm no inventory credit before FINALIZED.');
  assert(canaryFinality?.payload?.noRealValue === true, 'Canary finality review ledger entry must remain no-real-value.');
  const sanctuary = entriesById.get(`${runId}-sanctuary-rite`);
  assert(sanctuary?.payload?.riteId === 'jade-court-sanctuary-rite', 'Sanctuary rite ledger entry must preserve the Jade Court Sanctuary Rite id.');
  assert(Array.isArray(sanctuary?.payload?.partyIds) && sanctuary.payload.partyIds.length === 3, 'Sanctuary rite ledger entry must preserve full-party proof.');
  assert(sanctuary?.payload?.habitatBondProof === true, 'Sanctuary rite ledger entry must preserve habitat bond proof.');
  assert(sanctuary?.payload?.conditionWeaveProof === true, 'Sanctuary rite ledger entry must preserve condition weave proof.');
  assert(sanctuary?.payload?.battleRoundVictory === true, 'Sanctuary rite ledger entry must preserve no-injury battle victory proof.');
  assert(sanctuary?.payload?.noRealValue === true, 'Sanctuary rite ledger entry must remain no-real-value.');
  const rosterArchive = entriesById.get(`${runId}-roster-archive`);
  assert(rosterArchive?.payload?.archiveId === 'jade-court-roster-archive', 'Roster archive ledger entry must preserve the Jade Court Roster Archive id.');
  assert(Array.isArray(rosterArchive?.payload?.roster) && rosterArchive.payload.roster.length === 3, 'Roster archive ledger entry must preserve full roster proof.');
  assert(Array.isArray(rosterArchive?.payload?.partyIds) && rosterArchive.payload.partyIds.length === 2, 'Roster archive ledger entry must preserve archive party proof.');
  assert(rosterArchive?.payload?.compendiumProof === true, 'Roster archive ledger entry must preserve compendium proof.');
  assert(rosterArchive?.payload?.sanctuaryRiteProof === true, 'Roster archive ledger entry must preserve sanctuary rite proof.');
  assert(rosterArchive?.payload?.noRealValue === true, 'Roster archive ledger entry must remain no-real-value.');
  const rosterCabinet = entriesById.get(`${runId}-roster-cabinet`);
  assert(rosterCabinet?.payload?.cabinetId === 'jade-roster-cabinet', 'Roster cabinet ledger entry must preserve the Jade Roster Cabinet id.');
  assert(Array.isArray(rosterCabinet?.payload?.roster) && rosterCabinet.payload.roster.length === 3, 'Roster cabinet ledger entry must preserve full roster proof.');
  assert(Array.isArray(rosterCabinet?.payload?.partyIds) && rosterCabinet.payload.partyIds.length === 3, 'Roster cabinet ledger entry must preserve full-party proof.');
  assert(Array.isArray(rosterCabinet?.payload?.storageSlotLabels) && rosterCabinet.payload.storageSlotLabels.length === 3, 'Roster cabinet ledger entry must preserve three storage slot labels.');
  assert(rosterCabinet?.payload?.rosterArchiveProof === true, 'Roster cabinet ledger entry must preserve roster archive proof.');
  assert(rosterCabinet?.payload?.rosterArchiveId === 'jade-court-roster-archive', 'Roster cabinet ledger entry must preserve the roster archive id.');
  assert(rosterCabinet?.payload?.compendiumProof === true, 'Roster cabinet ledger entry must preserve compendium proof.');
  assert(rosterCabinet?.payload?.compendiumId === 'jade-court-spirit-compendium', 'Roster cabinet ledger entry must preserve the compendium id.');
  assert(rosterCabinet?.payload?.nurseryGroveProof === true, 'Roster cabinet ledger entry must preserve nursery grove proof.');
  assert(rosterCabinet?.payload?.nurseryGroveId === 'jade-nursery-grove', 'Roster cabinet ledger entry must preserve the nursery grove id.');
  assert(rosterCabinet?.payload?.lineageRegisterProof === true, 'Roster cabinet ledger entry must preserve lineage register proof.');
  assert(rosterCabinet?.payload?.lineageRegisterId === 'jade-lineage-register', 'Roster cabinet ledger entry must preserve the lineage register id.');
  assert(rosterCabinet?.payload?.localPresenceCount === 2, 'Roster cabinet ledger entry must preserve two-tester presence proof.');
  assert(rosterCabinet?.payload?.rewardItemId === 'jade-roster-cabinet-tag', 'Roster cabinet ledger entry must preserve the no-real-value cabinet tag proof.');
  assert(rosterCabinet?.payload?.noRealValue === true, 'Roster cabinet ledger entry must remain no-real-value.');
  const nameBanner = entriesById.get(`${runId}-name-banner`);
  assert(nameBanner?.payload?.riteId === 'jade-name-banner-rite', 'Name banner ledger entry must preserve the Jade Name Banner Rite id.');
  assert(Array.isArray(nameBanner?.payload?.roster) && nameBanner.payload.roster.length === 3, 'Name banner ledger entry must preserve full roster proof.');
  assert(Array.isArray(nameBanner?.payload?.nameRecords) && nameBanner.payload.nameRecords.some((record) => record.spiritId === 'lirabao' && record.title === 'Lirabao Lanternheart'), 'Name banner ledger entry must preserve the Lirabao Lanternheart title.');
  assert(Array.isArray(nameBanner?.payload?.nameRecords) && nameBanner.payload.nameRecords.some((record) => record.spiritId === 'jintari' && record.title === 'Jintari Goldleaf Step'), 'Name banner ledger entry must preserve the Jintari Goldleaf Step title.');
  assert(Array.isArray(nameBanner?.payload?.nameRecords) && nameBanner.payload.nameRecords.some((record) => record.spiritId === 'aozhen' && record.title === 'Aozhen Skybell Veil'), 'Name banner ledger entry must preserve the Aozhen Skybell Veil title.');
  assert(Array.isArray(nameBanner?.payload?.journalSpiritIds) && nameBanner.payload.journalSpiritIds.length === 3, 'Name banner ledger entry must preserve 3/3 journal identity proof.');
  assert(nameBanner?.payload?.compendiumProof === true, 'Name banner ledger entry must preserve compendium proof.');
  assert(nameBanner?.payload?.compendiumId === 'jade-court-spirit-compendium', 'Name banner ledger entry must preserve compendium id.');
  assert(nameBanner?.payload?.rosterArchiveProof === true, 'Name banner ledger entry must preserve roster archive proof.');
  assert(nameBanner?.payload?.rosterArchiveId === 'jade-court-roster-archive', 'Name banner ledger entry must preserve roster archive id.');
  assert(nameBanner?.payload?.rosterCabinetProof === true, 'Name banner ledger entry must preserve roster cabinet proof.');
  assert(nameBanner?.payload?.rosterCabinetId === 'jade-roster-cabinet', 'Name banner ledger entry must preserve roster cabinet id.');
  assert(nameBanner?.payload?.bondGiftProof === true, 'Name banner ledger entry must preserve bond gift proof.');
  assert(nameBanner?.payload?.bondGiftRiteId === 'jade-bond-gift-rite', 'Name banner ledger entry must preserve bond gift rite id.');
  assert(nameBanner?.payload?.localPresenceCount === 2, 'Name banner ledger entry must preserve two-tester name witness proof.');
  assert(nameBanner?.payload?.rewardItemId === 'jade-name-banner-tag', 'Name banner ledger entry must preserve the no-real-value name banner tag proof.');
  assert(nameBanner?.payload?.noRealValue === true, 'Name banner ledger entry must remain no-real-value.');
  const blossomCradle = entriesById.get(`${runId}-blossom-cradle`);
  assert(blossomCradle?.payload?.cradleId === 'jade-blossom-cradle', 'Blossom cradle ledger entry must preserve the Jade Blossom Cradle id.');
  assert(Array.isArray(blossomCradle?.payload?.roster) && blossomCradle.payload.roster.length === 3, 'Blossom cradle ledger entry must preserve full roster proof.');
  assert(Array.isArray(blossomCradle?.payload?.partyIds) && blossomCradle.payload.partyIds.length === 3, 'Blossom cradle ledger entry must preserve full-party proof.');
  assert(Array.isArray(blossomCradle?.payload?.caredSpiritIds) && blossomCradle.payload.caredSpiritIds.length === 3, 'Blossom cradle ledger entry must preserve full-care proof.');
  assert(Array.isArray(blossomCradle?.payload?.raisingMilestoneLabels) && blossomCradle.payload.raisingMilestoneLabels.length === 3, 'Blossom cradle ledger entry must preserve three raising milestone labels.');
  assert(blossomCradle?.payload?.totalBond === 15, 'Blossom cradle ledger entry must preserve total bond proof.');
  assert(blossomCradle?.payload?.kinshipAlbumProof === true, 'Blossom cradle ledger entry must preserve kinship album proof.');
  assert(blossomCradle?.payload?.kinshipAlbumId === 'jade-kinship-album', 'Blossom cradle ledger entry must preserve the kinship album id.');
  assert(blossomCradle?.payload?.nurseryGroveProof === true, 'Blossom cradle ledger entry must preserve nursery grove proof.');
  assert(blossomCradle?.payload?.nurseryGroveId === 'jade-nursery-grove', 'Blossom cradle ledger entry must preserve the nursery grove id.');
  assert(blossomCradle?.payload?.bloomAscendanceProof === true, 'Blossom cradle ledger entry must preserve bloom ascendance proof.');
  assert(blossomCradle?.payload?.bloomAscendanceId === 'jade-bloom-ascendance', 'Blossom cradle ledger entry must preserve the bloom ascendance id.');
  assert(blossomCradle?.payload?.lineageRegisterProof === true, 'Blossom cradle ledger entry must preserve lineage register proof.');
  assert(blossomCradle?.payload?.lineageRegisterId === 'jade-lineage-register', 'Blossom cradle ledger entry must preserve the lineage register id.');
  assert(blossomCradle?.payload?.nurtureRiteProof === true, 'Blossom cradle ledger entry must preserve nurture rite proof.');
  assert(blossomCradle?.payload?.nurtureRiteId === 'jade-moonwell-nurture-rite', 'Blossom cradle ledger entry must preserve the nurture rite id.');
  assert(blossomCradle?.payload?.growthRiteProof === true, 'Blossom cradle ledger entry must preserve growth rite proof.');
  assert(blossomCradle?.payload?.growthRiteId === 'moonwell-bloom-rite', 'Blossom cradle ledger entry must preserve the growth rite id.');
  assert(blossomCradle?.payload?.careCycleProof === true, 'Blossom cradle ledger entry must preserve care cycle proof.');
  assert(blossomCradle?.payload?.careCycleId === 'jade-court-care-cycle', 'Blossom cradle ledger entry must preserve the care cycle id.');
  assert(blossomCradle?.payload?.localPresenceCount === 2, 'Blossom cradle ledger entry must preserve two-tester presence proof.');
  assert(blossomCradle?.payload?.rewardItemId === 'jade-blossom-cradle-ribbon', 'Blossom cradle ledger entry must preserve the no-real-value cradle ribbon proof.');
  assert(blossomCradle?.payload?.noRealValue === true, 'Blossom cradle ledger entry must remain no-real-value.');
  const marketReceipt = entriesById.get(`${runId}-market-receipt`);
  assert(marketReceipt?.payload?.receiptId === 'jade-court-market-receipt', 'Market receipt ledger entry must preserve the Jade Court Market Receipt id.');
  assert(marketReceipt?.payload?.itemId === 'jade-thread-charm', 'Market receipt ledger entry must preserve the purchased Jade Thread Charm id.');
  assert(marketReceipt?.payload?.quantity === 1, 'Market receipt ledger entry must preserve the purchased quantity.');
  assert(marketReceipt?.payload?.price === 5, 'Market receipt ledger entry must preserve the fixed test price.');
  assert(marketReceipt?.payload?.currency === 'guild-seals', 'Market receipt ledger entry must preserve the test currency.');
  assert(marketReceipt?.payload?.marketProof === true, 'Market receipt ledger entry must preserve fixed listing proof.');
  assert(marketReceipt?.payload?.profileViewed === true, 'Market receipt ledger entry must preserve profile proof.');
  assert(marketReceipt?.payload?.guildBuddyProof === true, 'Market receipt ledger entry must preserve guild buddy proof.');
  assert(marketReceipt?.payload?.statusMood === 'cozy', 'Market receipt ledger entry must preserve social status proof.');
  assert(marketReceipt?.payload?.rewardItemId === 'jade-market-receipt', 'Market receipt ledger entry must preserve the no-real-value Jade Market Receipt item.');
  assert(marketReceipt?.payload?.noRealValue === true, 'Market receipt ledger entry must remain no-real-value.');
  const provision = entriesById.get(`${runId}-provision-satchel`);
  assert(provision?.payload?.satchelId === 'jade-court-provision-satchel', 'Provision satchel ledger entry must preserve the Jade Court Provision Satchel id.');
  assert(provision?.payload?.marketProof === true, 'Provision satchel ledger entry must preserve fixed market proof.');
  assert(provision?.payload?.marketReceiptProof === true, 'Provision satchel ledger entry must preserve market receipt proof.');
  assert(provision?.payload?.tradeProof === true, 'Provision satchel ledger entry must preserve direct trade proof.');
  assert(provision?.payload?.routeInviteProof === true, 'Provision satchel ledger entry must preserve route invitation proof.');
  assert(Array.isArray(provision?.payload?.completedQuestIds) && provision.payload.completedQuestIds.length === 3, 'Provision satchel ledger entry must preserve completed quest proof.');
  assert(provision?.payload?.noRealValue === true, 'Provision satchel ledger entry must remain no-real-value.');
  const careCycle = entriesById.get(`${runId}-care-cycle`);
  assert(careCycle?.payload?.cycleId === 'jade-court-care-cycle', 'Care cycle ledger entry must preserve the Jade Court Care Cycle id.');
  assert(Array.isArray(careCycle?.payload?.roster) && careCycle.payload.roster.length === 3, 'Care cycle ledger entry must preserve full roster proof.');
  assert(careCycle?.payload?.bondBySpiritId?.lirabao >= 3, 'Care cycle ledger entry must preserve Lirabao care bond proof.');
  assert(careCycle?.payload?.bondBySpiritId?.jintari >= 3, 'Care cycle ledger entry must preserve Jintari care bond proof.');
  assert(careCycle?.payload?.bondBySpiritId?.aozhen >= 3, 'Care cycle ledger entry must preserve Aozhen care bond proof.');
  assert(careCycle?.payload?.rosterArchiveProof === true, 'Care cycle ledger entry must preserve roster archive proof.');
  assert(careCycle?.payload?.provisionProof === true, 'Care cycle ledger entry must preserve provision satchel proof.');
  assert(careCycle?.payload?.sanctuaryRiteProof === true, 'Care cycle ledger entry must preserve sanctuary rite proof.');
  assert(careCycle?.payload?.raisingProof === true, 'Care cycle ledger entry must preserve raising proof.');
  assert(careCycle?.payload?.noRealValue === true, 'Care cycle ledger entry must remain no-real-value.');
  const bondGift = entriesById.get(`${runId}-bond-gift`);
  assert(bondGift?.payload?.riteId === 'jade-bond-gift-rite', 'Bond gift ledger entry must preserve the Jade Bond Gift Rite id.');
  assert(Array.isArray(bondGift?.payload?.roster) && bondGift.payload.roster.length === 3, 'Bond gift ledger entry must preserve full roster proof.');
  assert(Array.isArray(bondGift?.payload?.giftItemIds) && bondGift.payload.giftItemIds.includes('jade-mooncake-box'), 'Bond gift ledger entry must preserve the Jade Mooncake Box gift.');
  assert(Array.isArray(bondGift?.payload?.giftItemIds) && bondGift.payload.giftItemIds.includes('lantern-harmony-tea'), 'Bond gift ledger entry must preserve the Lantern Harmony Tea gift.');
  assert(Array.isArray(bondGift?.payload?.giftItemIds) && bondGift.payload.giftItemIds.includes('jade-thread-charm'), 'Bond gift ledger entry must preserve the Jade Thread Charm gift.');
  assert(bondGift?.payload?.provisionProof === true, 'Bond gift ledger entry must preserve provision satchel proof.');
  assert(bondGift?.payload?.provisionSatchelId === 'jade-court-provision-satchel', 'Bond gift ledger entry must preserve provision satchel id.');
  assert(bondGift?.payload?.careCycleProof === true, 'Bond gift ledger entry must preserve care cycle proof.');
  assert(bondGift?.payload?.careCycleId === 'jade-court-care-cycle', 'Bond gift ledger entry must preserve care cycle id.');
  assert(bondGift?.payload?.marketReceiptProof === true, 'Bond gift ledger entry must preserve market receipt proof.');
  assert(bondGift?.payload?.marketReceiptId === 'jade-court-market-receipt', 'Bond gift ledger entry must preserve market receipt id.');
  assert(bondGift?.payload?.localPresenceCount === 2, 'Bond gift ledger entry must preserve two-tester gift witness proof.');
  assert(bondGift?.payload?.rewardItemId === 'jade-bond-gift-ribbon', 'Bond gift ledger entry must preserve the no-real-value gift ribbon proof.');
  assert(bondGift?.payload?.noRealValue === true, 'Bond gift ledger entry must remain no-real-value.');
  const temperamentConcord = entriesById.get(`${runId}-temperament-concord`);
  assert(temperamentConcord?.payload?.concordId === 'jade-temperament-concord', 'Temperament concord ledger entry must preserve the Jade Temperament Concord id.');
  assert(Array.isArray(temperamentConcord?.payload?.roster) && temperamentConcord.payload.roster.length === 3, 'Temperament concord ledger entry must preserve full roster proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.lirabao >= 3, 'Temperament concord ledger entry must preserve Lirabao bond proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.jintari >= 3, 'Temperament concord ledger entry must preserve Jintari bond proof.');
  assert(temperamentConcord?.payload?.bondBySpiritId?.aozhen >= 3, 'Temperament concord ledger entry must preserve Aozhen bond proof.');
  assert(temperamentConcord?.payload?.careCycleProof === true, 'Temperament concord ledger entry must preserve care cycle proof.');
  assert(temperamentConcord?.payload?.traitAttunementProof === true, 'Temperament concord ledger entry must preserve trait attunement proof.');
  assert(temperamentConcord?.payload?.conditionWeaveProof === true, 'Temperament concord ledger entry must preserve condition weave proof.');
  assert(temperamentConcord?.payload?.profileViewed === true, 'Temperament concord ledger entry must preserve profile proof.');
  assert(temperamentConcord?.payload?.guildBuddyProof === true, 'Temperament concord ledger entry must preserve guild buddy proof.');
  assert(temperamentConcord?.payload?.statusMood === 'cozy', 'Temperament concord ledger entry must preserve social status proof.');
  assert(temperamentConcord?.payload?.noRealValue === true, 'Temperament concord ledger entry must remain no-real-value.');
  const fieldAlmanac = entriesById.get(`${runId}-field-almanac`);
  assert(fieldAlmanac?.payload?.almanacId === 'jade-field-almanac', 'Field almanac ledger entry must preserve the Jade Field Almanac id.');
  assert(Array.isArray(fieldAlmanac?.payload?.roster) && fieldAlmanac.payload.roster.length === 3, 'Field almanac ledger entry must preserve full roster proof.');
  assert(Array.isArray(fieldAlmanac?.payload?.discoveredRoutes) && fieldAlmanac.payload.discoveredRoutes.length === 2, 'Field almanac ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(fieldAlmanac?.payload?.fieldAccordProof === true, 'Field almanac ledger entry must preserve field accord proof.');
  assert(fieldAlmanac?.payload?.routePatrolProof === true, 'Field almanac ledger entry must preserve route patrol proof.');
  assert(fieldAlmanac?.payload?.compendiumProof === true, 'Field almanac ledger entry must preserve compendium proof.');
  assert(fieldAlmanac?.payload?.temperamentConcordProof === true, 'Field almanac ledger entry must preserve temperament proof.');
  assert(fieldAlmanac?.payload?.conditionWeaveProof === true, 'Field almanac ledger entry must preserve condition weave proof.');
  assert(fieldAlmanac?.payload?.noRealValue === true, 'Field almanac ledger entry must remain no-real-value.');
  const routeEcology = entriesById.get(`${runId}-route-ecology`);
  assert(routeEcology?.payload?.surveyId === 'jade-route-ecology-survey', 'Route ecology ledger entry must preserve the Jade Route Ecology Survey id.');
  assert(Array.isArray(routeEcology?.payload?.roster) && routeEcology.payload.roster.length === 3, 'Route ecology ledger entry must preserve full roster proof.');
  assert(Array.isArray(routeEcology?.payload?.discoveredRoutes) && routeEcology.payload.discoveredRoutes.length === 2, 'Route ecology ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(routeEcology?.payload?.routeInvitedSpiritIds) && routeEcology.payload.routeInvitedSpiritIds.includes('jintari') && routeEcology.payload.routeInvitedSpiritIds.includes('aozhen'), 'Route ecology ledger entry must preserve both route spirit invitation proofs.');
  assert(routeEcology?.payload?.fieldAlmanacProof === true, 'Route ecology ledger entry must preserve field almanac proof.');
  assert(routeEcology?.payload?.routePatrolProof === true, 'Route ecology ledger entry must preserve route patrol proof.');
  assert(routeEcology?.payload?.routeMasteryProof === true, 'Route ecology ledger entry must preserve route mastery proof.');
  assert(routeEcology?.payload?.conditionWeaveProof === true, 'Route ecology ledger entry must preserve condition weave proof.');
  assert(routeEcology?.payload?.rewardItemId === 'jade-route-ecology-map', 'Route ecology ledger entry must preserve the no-real-value ecology map proof.');
  assert(routeEcology?.payload?.noRealValue === true, 'Route ecology ledger entry must remain no-real-value.');
  const weatherVeil = entriesById.get(`${runId}-weather-veil`);
  assert(weatherVeil?.payload?.weatherVeilId === 'jade-weather-veil', 'Weather veil ledger entry must preserve the Jade Weather Veil id.');
  assert(Array.isArray(weatherVeil?.payload?.discoveredRoutes) && weatherVeil.payload.discoveredRoutes.length === 2, 'Weather veil ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(weatherVeil?.payload?.weatherConditionIds) && weatherVeil.payload.weatherConditionIds.includes('moonlit-mist') && weatherVeil.payload.weatherConditionIds.includes('goldleaf-rain') && weatherVeil.payload.weatherConditionIds.includes('skybell-crosswind'), 'Weather veil ledger entry must preserve first-court route condition proof.');
  assert(weatherVeil?.payload?.routeEcologyProof === true, 'Weather veil ledger entry must preserve route ecology proof.');
  assert(weatherVeil?.payload?.fieldAlmanacProof === true, 'Weather veil ledger entry must preserve field almanac proof.');
  assert(weatherVeil?.payload?.fieldAccordProof === true, 'Weather veil ledger entry must preserve field accord proof.');
  assert(weatherVeil?.payload?.routePatrolProof === true, 'Weather veil ledger entry must preserve route patrol proof.');
  assert(weatherVeil?.payload?.localPresenceCount === 2, 'Weather veil ledger entry must preserve two-tester witness proof.');
  assert(weatherVeil?.payload?.rewardItemId === 'jade-weather-veil-chart', 'Weather veil ledger entry must preserve the no-real-value weather veil chart proof.');
  assert(weatherVeil?.payload?.noRealValue === true, 'Weather veil ledger entry must remain no-real-value.');
  const encounterRotation = entriesById.get(`${runId}-encounter-rotation`);
  assert(encounterRotation?.payload?.rotationId === 'jade-encounter-rotation', 'Encounter rotation ledger entry must preserve the Jade Encounter Rotation id.');
  assert(Array.isArray(encounterRotation?.payload?.discoveredRoutes) && encounterRotation.payload.discoveredRoutes.length === 2, 'Encounter rotation ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(encounterRotation?.payload?.encounterSpiritIds) && encounterRotation.payload.encounterSpiritIds.length === 3, 'Encounter rotation ledger entry must preserve full encounter species proof.');
  assert(Array.isArray(encounterRotation?.payload?.lureItemIds) && encounterRotation.payload.lureItemIds.includes('lantern-harmony-tea') && encounterRotation.payload.lureItemIds.includes('jade-thread-charm'), 'Encounter rotation ledger entry must preserve lure planning proof.');
  assert(encounterRotation?.payload?.routeEcologyProof === true, 'Encounter rotation ledger entry must preserve route ecology proof.');
  assert(encounterRotation?.payload?.fieldAlmanacProof === true, 'Encounter rotation ledger entry must preserve field almanac proof.');
  assert(encounterRotation?.payload?.fieldAccordProof === true, 'Encounter rotation ledger entry must preserve field accord proof.');
  assert(encounterRotation?.payload?.captureRiteProof === true, 'Encounter rotation ledger entry must preserve capture rite proof.');
  assert(encounterRotation?.payload?.weatherVeilProof === true, 'Encounter rotation ledger entry must preserve weather veil proof.');
  assert(encounterRotation?.payload?.weatherVeilId === 'jade-weather-veil', 'Encounter rotation ledger entry must preserve the Jade Weather Veil id.');
  assert(encounterRotation?.payload?.localPresenceCount === 2, 'Encounter rotation ledger entry must preserve two-tester witness proof.');
  assert(encounterRotation?.payload?.rewardItemId === 'jade-encounter-rotation-scroll', 'Encounter rotation ledger entry must preserve the no-real-value encounter rotation proof.');
  assert(encounterRotation?.payload?.noRealValue === true, 'Encounter rotation ledger entry must remain no-real-value.');
  const encounterAtlas = entriesById.get(`${runId}-encounter-atlas`);
  assert(encounterAtlas?.payload?.atlasId === 'jade-encounter-atlas', 'Encounter atlas ledger entry must preserve the Jade Encounter Atlas id.');
  assert(Array.isArray(encounterAtlas?.payload?.discoveredRoutes) && encounterAtlas.payload.discoveredRoutes.length === 2, 'Encounter atlas ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(encounterAtlas?.payload?.encounteredSpiritIds) && encounterAtlas.payload.encounteredSpiritIds.length === 3, 'Encounter atlas ledger entry must preserve full encounter species proof.');
  assert(Array.isArray(encounterAtlas?.payload?.capturedSpiritIds) && encounterAtlas.payload.capturedSpiritIds.length === 3, 'Encounter atlas ledger entry must preserve full captured species proof.');
  assert(Array.isArray(encounterAtlas?.payload?.rarityTiers) && encounterAtlas.payload.rarityTiers.includes('common') && encounterAtlas.payload.rarityTiers.includes('uncommon') && encounterAtlas.payload.rarityTiers.includes('rare'), 'Encounter atlas ledger entry must preserve all first-court rarity tiers.');
  assert(encounterAtlas?.payload?.routeEcologyProof === true, 'Encounter atlas ledger entry must preserve route ecology proof.');
  assert(encounterAtlas?.payload?.captureRiteProof === true, 'Encounter atlas ledger entry must preserve capture rite proof.');
  assert(encounterAtlas?.payload?.fieldAlmanacProof === true, 'Encounter atlas ledger entry must preserve field almanac proof.');
  assert(encounterAtlas?.payload?.encounterRotationProof === true, 'Encounter atlas ledger entry must preserve encounter rotation proof.');
  assert(encounterAtlas?.payload?.encounterRotationId === 'jade-encounter-rotation', 'Encounter atlas ledger entry must preserve the Jade Encounter Rotation id.');
  assert(encounterAtlas?.payload?.weatherVeilProof === true, 'Encounter atlas ledger entry must preserve weather veil proof.');
  assert(encounterAtlas?.payload?.weatherVeilId === 'jade-weather-veil', 'Encounter atlas ledger entry must preserve the Jade Weather Veil id.');
  assert(encounterAtlas?.payload?.localPresenceCount === 2, 'Encounter atlas ledger entry must preserve two-tester witness proof.');
  assert(encounterAtlas?.payload?.rewardItemId === 'jade-encounter-atlas', 'Encounter atlas ledger entry must preserve the no-real-value encounter atlas proof.');
  assert(encounterAtlas?.payload?.noRealValue === true, 'Encounter atlas ledger entry must remain no-real-value.');
  const habitatCensus = entriesById.get(`${runId}-habitat-census`);
  assert(habitatCensus?.payload?.censusId === 'jade-habitat-census', 'Habitat census ledger entry must preserve the Jade Habitat Census id.');
  assert(Array.isArray(habitatCensus?.payload?.roster) && habitatCensus.payload.roster.length === 3, 'Habitat census ledger entry must preserve full roster proof.');
  assert(Array.isArray(habitatCensus?.payload?.discoveredRoutes) && habitatCensus.payload.discoveredRoutes.length === 2, 'Habitat census ledger entry must preserve Moonbridge and Cloudbell route proof.');
  assert(Array.isArray(habitatCensus?.payload?.observedSpiritIds) && habitatCensus.payload.observedSpiritIds.includes('lirabao') && habitatCensus.payload.observedSpiritIds.includes('jintari') && habitatCensus.payload.observedSpiritIds.includes('aozhen'), 'Habitat census ledger entry must preserve all first-court spirit observations.');
  assert(Array.isArray(habitatCensus?.payload?.careLoggedSpiritIds) && habitatCensus.payload.careLoggedSpiritIds.includes('lirabao') && habitatCensus.payload.careLoggedSpiritIds.includes('jintari') && habitatCensus.payload.careLoggedSpiritIds.includes('aozhen'), 'Habitat census ledger entry must preserve all first-court care logs.');
  assert(habitatCensus?.payload?.encounterAtlasProof === true, 'Habitat census ledger entry must preserve encounter atlas proof.');
  assert(habitatCensus?.payload?.encounterAtlasId === 'jade-encounter-atlas', 'Habitat census ledger entry must preserve the encounter atlas id.');
  assert(habitatCensus?.payload?.routeEcologyProof === true, 'Habitat census ledger entry must preserve route ecology proof.');
  assert(habitatCensus?.payload?.weatherVeilProof === true, 'Habitat census ledger entry must preserve weather veil proof.');
  assert(habitatCensus?.payload?.compendiumProof === true, 'Habitat census ledger entry must preserve compendium proof.');
  assert(habitatCensus?.payload?.careCycleProof === true, 'Habitat census ledger entry must preserve care cycle proof.');
  assert(habitatCensus?.payload?.localPresenceCount === 2, 'Habitat census ledger entry must preserve two-tester witness proof.');
  assert(habitatCensus?.payload?.rewardItemId === 'jade-habitat-census-seal', 'Habitat census ledger entry must preserve the no-real-value habitat census seal.');
  assert(habitatCensus?.payload?.noRealValue === true, 'Habitat census ledger entry must remain no-real-value.');
  const craftWrit = entriesById.get(`${runId}-craft-writ`);
  assert(craftWrit?.payload?.writId === 'jade-court-craft-writ', 'Craft writ ledger entry must preserve the Jade Court Craft Writ id.');
  assert(Array.isArray(craftWrit?.payload?.roster) && craftWrit.payload.roster.length === 3, 'Craft writ ledger entry must preserve full roster proof.');
  assert(Array.isArray(craftWrit?.payload?.recipeIds) && craftWrit.payload.recipeIds.includes('lantern-tea-threading'), 'Craft writ ledger entry must preserve the lantern tea recipe proof.');
  assert(Array.isArray(craftWrit?.payload?.recipeIds) && craftWrit.payload.recipeIds.includes('moonbridge-provision-wrap'), 'Craft writ ledger entry must preserve the Moonbridge provision recipe proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('jade-thread-charm'), 'Craft writ ledger entry must preserve the Jade Thread Charm stock proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('lantern-harmony-tea'), 'Craft writ ledger entry must preserve Lantern Harmony Tea stock proof.');
  assert(Array.isArray(craftWrit?.payload?.stockItemIds) && craftWrit.payload.stockItemIds.includes('jade-mooncake-box'), 'Craft writ ledger entry must preserve Jade Mooncake Box stock proof.');
  assert(craftWrit?.payload?.provisionProof === true, 'Craft writ ledger entry must preserve provision proof.');
  assert(craftWrit?.payload?.routeEcologyProof === true, 'Craft writ ledger entry must preserve route ecology proof.');
  assert(craftWrit?.payload?.fieldAlmanacProof === true, 'Craft writ ledger entry must preserve field almanac proof.');
  assert(craftWrit?.payload?.careCycleProof === true, 'Craft writ ledger entry must preserve care cycle proof.');
  assert(craftWrit?.payload?.temperamentConcordProof === true, 'Craft writ ledger entry must preserve temperament concord proof.');
  assert(craftWrit?.payload?.rewardItemId === 'jade-court-craft-writ', 'Craft writ ledger entry must preserve the no-real-value craft writ proof.');
  assert(craftWrit?.payload?.noRealValue === true, 'Craft writ ledger entry must remain no-real-value.');
  const exchangeAccord = entriesById.get(`${runId}-exchange-accord`);
  assert(exchangeAccord?.payload?.accordId === 'jade-exchange-accord', 'Exchange accord ledger entry must preserve the Jade Exchange Accord id.');
  assert(Array.isArray(exchangeAccord?.payload?.roster) && exchangeAccord.payload.roster.length === 3, 'Exchange accord ledger entry must preserve full roster proof.');
  assert(Array.isArray(exchangeAccord?.payload?.listedItemIds) && exchangeAccord.payload.listedItemIds.includes('jade-thread-charm'), 'Exchange accord ledger entry must preserve listed Jade Thread Charm proof.');
  assert(Array.isArray(exchangeAccord?.payload?.listedItemIds) && exchangeAccord.payload.listedItemIds.includes('lantern-harmony-tea'), 'Exchange accord ledger entry must preserve listed Lantern Harmony Tea proof.');
  assert(Array.isArray(exchangeAccord?.payload?.listedItemIds) && exchangeAccord.payload.listedItemIds.includes('jade-mooncake-box'), 'Exchange accord ledger entry must preserve listed Jade Mooncake Box proof.');
  assert(Array.isArray(exchangeAccord?.payload?.offeredItemIds) && exchangeAccord.payload.offeredItemIds.includes('jade-thread-charm'), 'Exchange accord ledger entry must preserve offered Jade Thread Charm proof.');
  assert(Array.isArray(exchangeAccord?.payload?.offeredItemIds) && exchangeAccord.payload.offeredItemIds.includes('lantern-harmony-tea'), 'Exchange accord ledger entry must preserve offered Lantern Harmony Tea proof.');
  assert(Array.isArray(exchangeAccord?.payload?.offeredItemIds) && exchangeAccord.payload.offeredItemIds.includes('jade-mooncake-box'), 'Exchange accord ledger entry must preserve offered Jade Mooncake Box proof.');
  assert(exchangeAccord?.payload?.marketProof === true, 'Exchange accord ledger entry must preserve fixed market proof.');
  assert(exchangeAccord?.payload?.tradeProof === true, 'Exchange accord ledger entry must preserve direct trade proof.');
  assert(exchangeAccord?.payload?.provisionProof === true, 'Exchange accord ledger entry must preserve provision proof.');
  assert(exchangeAccord?.payload?.provisionSatchelId === 'jade-court-provision-satchel', 'Exchange accord ledger entry must preserve provision satchel id.');
  assert(exchangeAccord?.payload?.craftWritProof === true, 'Exchange accord ledger entry must preserve craft writ proof.');
  assert(exchangeAccord?.payload?.craftWritId === 'jade-court-craft-writ', 'Exchange accord ledger entry must preserve craft writ id.');
  assert(exchangeAccord?.payload?.localPresenceCount === 2, 'Exchange accord ledger entry must preserve two-tester presence proof.');
  assert(exchangeAccord?.payload?.rewardItemId === 'jade-exchange-accord-tally', 'Exchange accord ledger entry must preserve the no-real-value accord tally proof.');
  assert(exchangeAccord?.payload?.noRealValue === true, 'Exchange accord ledger entry must remain no-real-value.');
  const routeWaystone = entriesById.get(`${runId}-route-waystone`);
  assert(routeWaystone?.payload?.waystoneId === 'jade-cloudbell-waystone', 'Route waystone ledger entry must preserve the Jade Cloudbell Waystone id.');
  assert(Array.isArray(routeWaystone?.payload?.discoveredRoutes) && routeWaystone.payload.discoveredRoutes.includes('moonbridge-bamboo-trail'), 'Route waystone ledger entry must preserve the Moonbridge route.');
  assert(Array.isArray(routeWaystone?.payload?.discoveredRoutes) && routeWaystone.payload.discoveredRoutes.includes('cloudbell-reed-bank'), 'Route waystone ledger entry must preserve the Cloudbell route.');
  assert(Array.isArray(routeWaystone?.payload?.routeInvitedSpiritIds) && routeWaystone.payload.routeInvitedSpiritIds.includes('jintari'), 'Route waystone ledger entry must preserve Jintari route invitation proof.');
  assert(Array.isArray(routeWaystone?.payload?.routeInvitedSpiritIds) && routeWaystone.payload.routeInvitedSpiritIds.includes('aozhen'), 'Route waystone ledger entry must preserve Aozhen route invitation proof.');
  assert(routeWaystone?.payload?.routeMasteryProof === true, 'Route waystone ledger entry must preserve route mastery proof.');
  assert(routeWaystone?.payload?.routePatrolProof === true, 'Route waystone ledger entry must preserve route patrol proof.');
  assert(routeWaystone?.payload?.routeEcologyProof === true, 'Route waystone ledger entry must preserve route ecology proof.');
  assert(routeWaystone?.payload?.craftWritProof === true, 'Route waystone ledger entry must preserve craft writ proof.');
  assert(routeWaystone?.payload?.rewardItemId === 'jade-waystone-travel-seal', 'Route waystone ledger entry must preserve the no-real-value waystone travel seal proof.');
  assert(routeWaystone?.payload?.noRealValue === true, 'Route waystone ledger entry must remain no-real-value.');
  const routeCharter = entriesById.get(`${runId}-route-charter`);
  assert(routeCharter?.payload?.charterId === 'jade-route-charter', 'Route charter ledger entry must preserve the Jade Route Charter id.');
  assert(Array.isArray(routeCharter?.payload?.discoveredRoutes) && routeCharter.payload.discoveredRoutes.includes('moonbridge-bamboo-trail'), 'Route charter ledger entry must preserve the Moonbridge route.');
  assert(Array.isArray(routeCharter?.payload?.discoveredRoutes) && routeCharter.payload.discoveredRoutes.includes('cloudbell-reed-bank'), 'Route charter ledger entry must preserve the Cloudbell route.');
  assert(Array.isArray(routeCharter?.payload?.partyIds) && routeCharter.payload.partyIds.length === 3, 'Route charter ledger entry must preserve the three-spirit party.');
  assert(routeCharter?.payload?.routeMasteryProof === true, 'Route charter ledger entry must preserve route mastery proof.');
  assert(routeCharter?.payload?.routeMasteryId === 'jade-cloudbell-circuit', 'Route charter ledger entry must preserve the route mastery id.');
  assert(routeCharter?.payload?.routePatrolProof === true, 'Route charter ledger entry must preserve route patrol proof.');
  assert(routeCharter?.payload?.routePatrolId === 'jade-cloudbell-patrol', 'Route charter ledger entry must preserve the route patrol id.');
  assert(routeCharter?.payload?.routeWaystoneProof === true, 'Route charter ledger entry must preserve route waystone proof.');
  assert(routeCharter?.payload?.routeWaystoneId === 'jade-cloudbell-waystone', 'Route charter ledger entry must preserve the route waystone id.');
  assert(routeCharter?.payload?.routeEcologyProof === true, 'Route charter ledger entry must preserve route ecology proof.');
  assert(routeCharter?.payload?.routeEcologyId === 'jade-route-ecology-survey', 'Route charter ledger entry must preserve the route ecology id.');
  assert(routeCharter?.payload?.weatherVeilProof === true, 'Route charter ledger entry must preserve weather veil proof.');
  assert(routeCharter?.payload?.weatherVeilId === 'jade-weather-veil', 'Route charter ledger entry must preserve the weather veil id.');
  assert(routeCharter?.payload?.encounterAtlasProof === true, 'Route charter ledger entry must preserve encounter atlas proof.');
  assert(routeCharter?.payload?.encounterAtlasId === 'jade-encounter-atlas', 'Route charter ledger entry must preserve the encounter atlas id.');
  assert(routeCharter?.payload?.habitatCensusProof === true, 'Route charter ledger entry must preserve habitat census proof.');
  assert(routeCharter?.payload?.habitatCensusId === 'jade-habitat-census', 'Route charter ledger entry must preserve the habitat census id.');
  assert(routeCharter?.payload?.provisionProof === true, 'Route charter ledger entry must preserve provision proof.');
  assert(routeCharter?.payload?.provisionSatchelId === 'jade-court-provision-satchel', 'Route charter ledger entry must preserve the provision satchel id.');
  assert(routeCharter?.payload?.craftWritProof === true, 'Route charter ledger entry must preserve craft writ proof.');
  assert(routeCharter?.payload?.craftWritId === 'jade-court-craft-writ', 'Route charter ledger entry must preserve the craft writ id.');
  assert(routeCharter?.payload?.localPresenceCount === 2, 'Route charter ledger entry must preserve two-tester presence proof.');
  assert(routeCharter?.payload?.rewardItemId === 'jade-route-charter-slip', 'Route charter ledger entry must preserve the no-real-value route charter slip.');
  assert(routeCharter?.payload?.noRealValue === true, 'Route charter ledger entry must remain no-real-value.');
  const nurtureRite = entriesById.get(`${runId}-nurture-rite`);
  assert(nurtureRite?.payload?.riteId === 'jade-moonwell-nurture-rite', 'Nurture rite ledger entry must preserve the Jade Moonwell Nurture Rite id.');
  assert(Array.isArray(nurtureRite?.payload?.roster) && nurtureRite.payload.roster.length === 3, 'Nurture rite ledger entry must preserve full roster proof.');
  assert(Array.isArray(nurtureRite?.payload?.caredSpiritIds) && nurtureRite.payload.caredSpiritIds.length === 3, 'Nurture rite ledger entry must preserve full care-cycle proof.');
  assert(nurtureRite?.payload?.careCycleProof === true, 'Nurture rite ledger entry must preserve care cycle proof.');
  assert(nurtureRite?.payload?.growthRiteProof === true, 'Nurture rite ledger entry must preserve growth rite proof.');
  assert(nurtureRite?.payload?.provisionProof === true, 'Nurture rite ledger entry must preserve provision proof.');
  assert(nurtureRite?.payload?.craftWritProof === true, 'Nurture rite ledger entry must preserve craft writ proof.');
  assert(nurtureRite?.payload?.temperamentConcordProof === true, 'Nurture rite ledger entry must preserve temperament concord proof.');
  assert(nurtureRite?.payload?.raisingProof === true, 'Nurture rite ledger entry must preserve raising proof.');
  assert(nurtureRite?.payload?.raisingMilestoneLabel === 'Lacquer Luck Glow', 'Nurture rite ledger entry must preserve the raising milestone label.');
  assert(nurtureRite?.payload?.bond >= 5, 'Nurture rite ledger entry must preserve max bond proof.');
  assert(nurtureRite?.payload?.trainingXp >= 3, 'Nurture rite ledger entry must preserve training XP proof.');
  assert(nurtureRite?.payload?.sparLadderXp >= 5, 'Nurture rite ledger entry must preserve spar ladder XP proof.');
  assert(nurtureRite?.payload?.rewardItemId === 'jade-moonwell-nurture-ribbon', 'Nurture rite ledger entry must preserve the no-real-value nurture ribbon proof.');
  assert(nurtureRite?.payload?.noRealValue === true, 'Nurture rite ledger entry must remain no-real-value.');
  const recoveryTea = entriesById.get(`${runId}-recovery-tea`);
  assert(recoveryTea?.payload?.teaId === 'jade-teahouse-recovery', 'Recovery tea ledger entry must preserve the Jade Teahouse Recovery id.');
  assert(Array.isArray(recoveryTea?.payload?.roster) && recoveryTea.payload.roster.length === 3, 'Recovery tea ledger entry must preserve full-roster proof.');
  assert(Array.isArray(recoveryTea?.payload?.partyIds) && recoveryTea.payload.partyIds.length === 3, 'Recovery tea ledger entry must preserve full-party proof.');
  assert(Array.isArray(recoveryTea?.payload?.caredSpiritIds) && recoveryTea.payload.caredSpiritIds.length === 3, 'Recovery tea ledger entry must preserve full care proof.');
  assert(recoveryTea?.payload?.careCycleProof === true, 'Recovery tea ledger entry must preserve care cycle proof.');
  assert(recoveryTea?.payload?.sanctuaryRiteProof === true, 'Recovery tea ledger entry must preserve sanctuary rite proof.');
  assert(recoveryTea?.payload?.nurtureRiteProof === true, 'Recovery tea ledger entry must preserve nurture rite proof.');
  assert(recoveryTea?.payload?.battleRoundVictory === true, 'Recovery tea ledger entry must preserve no-injury battle victory proof.');
  assert(recoveryTea?.payload?.localPresenceCount === 2, 'Recovery tea ledger entry must preserve two-tester presence proof.');
  assert(recoveryTea?.payload?.rewardItemId === 'jade-teahouse-recovery-cup', 'Recovery tea ledger entry must preserve the no-real-value recovery cup proof.');
  assert(recoveryTea?.payload?.noRealValue === true, 'Recovery tea ledger entry must remain no-real-value.');
  const provisionCatalog = entriesById.get(`${runId}-provision-catalog`);
  assert(provisionCatalog?.payload?.catalogId === 'jade-provision-catalog', 'Provision catalog ledger entry must preserve the Jade Provision Catalog id.');
  assert(Array.isArray(provisionCatalog?.payload?.roster) && provisionCatalog.payload.roster.length === 3, 'Provision catalog ledger entry must preserve full roster proof.');
  assert(Array.isArray(provisionCatalog?.payload?.stockItemIds) && provisionCatalog.payload.stockItemIds.includes('jade-thread-charm') && provisionCatalog.payload.stockItemIds.includes('lantern-harmony-tea') && provisionCatalog.payload.stockItemIds.includes('jade-mooncake-box'), 'Provision catalog ledger entry must preserve stocked item proof.');
  assert(Array.isArray(provisionCatalog?.payload?.careItemIds) && provisionCatalog.payload.careItemIds.includes('jade-mooncake-box') && provisionCatalog.payload.careItemIds.includes('lantern-harmony-tea'), 'Provision catalog ledger entry must preserve care item proof.');
  assert(Array.isArray(provisionCatalog?.payload?.routeItemIds) && provisionCatalog.payload.routeItemIds.includes('lantern-harmony-tea') && provisionCatalog.payload.routeItemIds.includes('jade-thread-charm'), 'Provision catalog ledger entry must preserve route item proof.');
  assert(provisionCatalog?.payload?.provisionProof === true, 'Provision catalog ledger entry must preserve provision satchel proof.');
  assert(provisionCatalog?.payload?.provisionSatchelId === 'jade-court-provision-satchel', 'Provision catalog ledger entry must preserve provision satchel id.');
  assert(provisionCatalog?.payload?.marketReceiptProof === true, 'Provision catalog ledger entry must preserve market receipt proof.');
  assert(provisionCatalog?.payload?.marketReceiptId === 'jade-court-market-receipt', 'Provision catalog ledger entry must preserve market receipt id.');
  assert(provisionCatalog?.payload?.tradeProof === true, 'Provision catalog ledger entry must preserve direct trade proof.');
  assert(provisionCatalog?.payload?.craftWritProof === true, 'Provision catalog ledger entry must preserve craft writ proof.');
  assert(provisionCatalog?.payload?.craftWritId === 'jade-court-craft-writ', 'Provision catalog ledger entry must preserve craft writ id.');
  assert(provisionCatalog?.payload?.recoveryTeaProof === true, 'Provision catalog ledger entry must preserve recovery tea proof.');
  assert(provisionCatalog?.payload?.recoveryTeaId === 'jade-teahouse-recovery', 'Provision catalog ledger entry must preserve recovery tea id.');
  assert(provisionCatalog?.payload?.careCycleProof === true, 'Provision catalog ledger entry must preserve care cycle proof.');
  assert(provisionCatalog?.payload?.habitatCensusProof === true, 'Provision catalog ledger entry must preserve habitat census proof.');
  assert(provisionCatalog?.payload?.habitatCensusId === 'jade-habitat-census', 'Provision catalog ledger entry must preserve habitat census id.');
  assert(provisionCatalog?.payload?.localPresenceCount === 2, 'Provision catalog ledger entry must preserve two-tester presence proof.');
  assert(provisionCatalog?.payload?.rewardItemId === 'jade-provision-catalog-seal', 'Provision catalog ledger entry must preserve the no-real-value catalog seal proof.');
  assert(provisionCatalog?.payload?.noRealValue === true, 'Provision catalog ledger entry must remain no-real-value.');
  const battleKit = entriesById.get(`${runId}-battle-kit`);
  assert(battleKit?.payload?.kitId === 'jade-battle-kit', 'Battle kit ledger entry must preserve the Jade Battle Kit id.');
  assert(Array.isArray(battleKit?.payload?.roster) && battleKit.payload.roster.length === 3, 'Battle kit ledger entry must preserve full roster proof.');
  assert(Array.isArray(battleKit?.payload?.partyIds) && battleKit.payload.partyIds.length === 3, 'Battle kit ledger entry must preserve full-party proof.');
  assert(Array.isArray(battleKit?.payload?.itemIds) && battleKit.payload.itemIds.includes('lantern-harmony-tea') && battleKit.payload.itemIds.includes('jade-thread-charm') && battleKit.payload.itemIds.includes('jade-mooncake-box'), 'Battle kit ledger entry must preserve all kit item ids.');
  assert(battleKit?.payload?.provisionCatalogProof === true, 'Battle kit ledger entry must preserve provision catalog proof.');
  assert(battleKit?.payload?.provisionCatalogId === 'jade-provision-catalog', 'Battle kit ledger entry must preserve provision catalog id.');
  assert(battleKit?.payload?.techniqueCodexProof === true, 'Battle kit ledger entry must preserve technique codex proof.');
  assert(battleKit?.payload?.techniqueCodexId === 'jade-technique-codex', 'Battle kit ledger entry must preserve technique codex id.');
  assert(battleKit?.payload?.conditionWeaveProof === true, 'Battle kit ledger entry must preserve condition weave proof.');
  assert(battleKit?.payload?.conditionWeaveId === 'jade-mirror-condition-weave', 'Battle kit ledger entry must preserve condition weave id.');
  assert(battleKit?.payload?.affinityMatrixProof === true, 'Battle kit ledger entry must preserve affinity matrix proof.');
  assert(battleKit?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Battle kit ledger entry must preserve affinity matrix id.');
  assert(battleKit?.payload?.recoveryTeaProof === true, 'Battle kit ledger entry must preserve recovery tea proof.');
  assert(battleKit?.payload?.recoveryTeaId === 'jade-teahouse-recovery', 'Battle kit ledger entry must preserve recovery tea id.');
  assert(battleKit?.payload?.battleRoundProof === true, 'Battle kit ledger entry must preserve battle round proof.');
  assert(battleKit?.payload?.battleRoundVictory === true, 'Battle kit ledger entry must preserve no-injury battle victory proof.');
  assert(battleKit?.payload?.battleRoundFocusScore === 41, 'Battle kit ledger entry must preserve focus score proof.');
  assert(battleKit?.payload?.battleRoundOpponentScore === 19, 'Battle kit ledger entry must preserve opponent score proof.');
  assert(battleKit?.payload?.localPresenceCount === 2, 'Battle kit ledger entry must preserve two-tester presence proof.');
  assert(battleKit?.payload?.rewardItemId === 'jade-battle-kit-tag', 'Battle kit ledger entry must preserve the no-real-value kit tag proof.');
  assert(battleKit?.payload?.noRealValue === true, 'Battle kit ledger entry must remain no-real-value.');
  const remedyPouch = entriesById.get(`${runId}-remedy-pouch`);
  assert(remedyPouch?.payload?.pouchId === 'jade-remedy-pouch', 'Remedy pouch ledger entry must preserve the Jade Remedy Pouch id.');
  assert(Array.isArray(remedyPouch?.payload?.roster) && remedyPouch.payload.roster.length === 3, 'Remedy pouch ledger entry must preserve full roster proof.');
  assert(Array.isArray(remedyPouch?.payload?.partyIds) && remedyPouch.payload.partyIds.length === 3, 'Remedy pouch ledger entry must preserve full-party proof.');
  assert(Array.isArray(remedyPouch?.payload?.conditionIds) && remedyPouch.payload.conditionIds.includes('lantern-ward') && remedyPouch.payload.conditionIds.includes('goldleaf-tempo') && remedyPouch.payload.conditionIds.includes('skybell-guard'), 'Remedy pouch ledger entry must preserve condition care ids.');
  assert(Array.isArray(remedyPouch?.payload?.itemIds) && remedyPouch.payload.itemIds.includes('lantern-harmony-tea') && remedyPouch.payload.itemIds.includes('jade-thread-charm') && remedyPouch.payload.itemIds.includes('jade-mooncake-box'), 'Remedy pouch ledger entry must preserve all remedy item ids.');
  assert(remedyPouch?.payload?.recoveryTeaProof === true, 'Remedy pouch ledger entry must preserve recovery tea proof.');
  assert(remedyPouch?.payload?.recoveryTeaId === 'jade-teahouse-recovery', 'Remedy pouch ledger entry must preserve recovery tea id.');
  assert(remedyPouch?.payload?.battleKitProof === true, 'Remedy pouch ledger entry must preserve battle kit proof.');
  assert(remedyPouch?.payload?.battleKitId === 'jade-battle-kit', 'Remedy pouch ledger entry must preserve battle kit id.');
  assert(remedyPouch?.payload?.careCycleProof === true, 'Remedy pouch ledger entry must preserve care cycle proof.');
  assert(remedyPouch?.payload?.careCycleId === 'jade-court-care-cycle', 'Remedy pouch ledger entry must preserve care cycle id.');
  assert(remedyPouch?.payload?.sanctuaryRiteProof === true, 'Remedy pouch ledger entry must preserve sanctuary rite proof.');
  assert(remedyPouch?.payload?.sanctuaryRiteId === 'jade-court-sanctuary-rite', 'Remedy pouch ledger entry must preserve sanctuary rite id.');
  assert(remedyPouch?.payload?.battleRoundProof === true, 'Remedy pouch ledger entry must preserve battle round proof.');
  assert(remedyPouch?.payload?.battleRoundVictory === true, 'Remedy pouch ledger entry must preserve no-injury battle victory proof.');
  assert(remedyPouch?.payload?.localPresenceCount === 2, 'Remedy pouch ledger entry must preserve two-tester presence proof.');
  assert(remedyPouch?.payload?.rewardItemId === 'jade-remedy-pouch-tag', 'Remedy pouch ledger entry must preserve the no-real-value pouch tag proof.');
  assert(remedyPouch?.payload?.noRealValue === true, 'Remedy pouch ledger entry must remain no-real-value.');
  const kinshipAlbum = entriesById.get(`${runId}-kinship-album`);
  assert(kinshipAlbum?.payload?.albumId === 'jade-kinship-album', 'Kinship album ledger entry must preserve the Jade Kinship Album id.');
  assert(Array.isArray(kinshipAlbum?.payload?.roster) && kinshipAlbum.payload.roster.length === 3, 'Kinship album ledger entry must preserve full roster proof.');
  assert(Array.isArray(kinshipAlbum?.payload?.caredSpiritIds) && kinshipAlbum.payload.caredSpiritIds.length === 3, 'Kinship album ledger entry must preserve full care proof.');
  assert(kinshipAlbum?.payload?.activeSpiritId === 'aozhen', 'Kinship album ledger entry must preserve the active spirit proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.lirabao === 5, 'Kinship album ledger entry must preserve Lirabao bond proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.jintari === 5, 'Kinship album ledger entry must preserve Jintari bond proof.');
  assert(kinshipAlbum?.payload?.bondBySpiritId?.aozhen === 5, 'Kinship album ledger entry must preserve Aozhen bond proof.');
  assert(kinshipAlbum?.payload?.localPresenceCount === 2, 'Kinship album ledger entry must preserve two-tester presence proof.');
  assert(kinshipAlbum?.payload?.careCycleProof === true, 'Kinship album ledger entry must preserve care cycle proof.');
  assert(kinshipAlbum?.payload?.nurtureRiteProof === true, 'Kinship album ledger entry must preserve nurture rite proof.');
  assert(kinshipAlbum?.payload?.growthRiteProof === true, 'Kinship album ledger entry must preserve growth rite proof.');
  assert(kinshipAlbum?.payload?.compendiumProof === true, 'Kinship album ledger entry must preserve compendium proof.');
  assert(kinshipAlbum?.payload?.habitatBondProof === true, 'Kinship album ledger entry must preserve habitat bond proof.');
  assert(kinshipAlbum?.payload?.raisingProof === true, 'Kinship album ledger entry must preserve raising proof.');
  assert(kinshipAlbum?.payload?.rewardItemId === 'jade-kinship-album', 'Kinship album ledger entry must preserve the no-real-value album proof.');
  assert(kinshipAlbum?.payload?.noRealValue === true, 'Kinship album ledger entry must remain no-real-value.');
  const nurseryGrove = entriesById.get(`${runId}-nursery-grove`);
  assert(nurseryGrove?.payload?.nurseryId === 'jade-nursery-grove', 'Nursery grove ledger entry must preserve the Jade Nursery Grove id.');
  assert(Array.isArray(nurseryGrove?.payload?.roster) && nurseryGrove.payload.roster.length === 3, 'Nursery grove ledger entry must preserve full roster proof.');
  assert(Array.isArray(nurseryGrove?.payload?.partyIds) && nurseryGrove.payload.partyIds.length === 3, 'Nursery grove ledger entry must preserve full party proof.');
  assert(Array.isArray(nurseryGrove?.payload?.caredSpiritIds) && nurseryGrove.payload.caredSpiritIds.length === 3, 'Nursery grove ledger entry must preserve full care proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.lirabao === 5, 'Nursery grove ledger entry must preserve Lirabao bond proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.jintari === 5, 'Nursery grove ledger entry must preserve Jintari bond proof.');
  assert(nurseryGrove?.payload?.bondBySpiritId?.aozhen === 5, 'Nursery grove ledger entry must preserve Aozhen bond proof.');
  assert(nurseryGrove?.payload?.localPresenceCount === 2, 'Nursery grove ledger entry must preserve two-tester presence proof.');
  assert(nurseryGrove?.payload?.careCycleProof === true, 'Nursery grove ledger entry must preserve care cycle proof.');
  assert(nurseryGrove?.payload?.nurtureRiteProof === true, 'Nursery grove ledger entry must preserve nurture rite proof.');
  assert(nurseryGrove?.payload?.recoveryTeaProof === true, 'Nursery grove ledger entry must preserve recovery tea proof.');
  assert(nurseryGrove?.payload?.kinshipAlbumProof === true, 'Nursery grove ledger entry must preserve kinship album proof.');
  assert(nurseryGrove?.payload?.growthRiteProof === true, 'Nursery grove ledger entry must preserve growth rite proof.');
  assert(nurseryGrove?.payload?.raisingProof === true, 'Nursery grove ledger entry must preserve raising proof.');
  assert(nurseryGrove?.payload?.trainingXp >= 3, 'Nursery grove ledger entry must preserve training XP proof.');
  assert(nurseryGrove?.payload?.sparLadderXp >= 5, 'Nursery grove ledger entry must preserve spar ladder XP proof.');
  assert(nurseryGrove?.payload?.rewardItemId === 'jade-nursery-sprout', 'Nursery grove ledger entry must preserve the no-real-value nursery sprout proof.');
  assert(nurseryGrove?.payload?.noRealValue === true, 'Nursery grove ledger entry must remain no-real-value.');
  const bloomAscendance = entriesById.get(`${runId}-bloom-ascendance`);
  assert(bloomAscendance?.payload?.ascendanceId === 'jade-bloom-ascendance', 'Bloom ascendance ledger entry must preserve the Jade Bloom Ascendance id.');
  assert(Array.isArray(bloomAscendance?.payload?.roster) && bloomAscendance.payload.roster.length === 3, 'Bloom ascendance ledger entry must preserve full roster proof.');
  assert(Array.isArray(bloomAscendance?.payload?.partyIds) && bloomAscendance.payload.partyIds.length === 3, 'Bloom ascendance ledger entry must preserve full party proof.');
  assert(Array.isArray(bloomAscendance?.payload?.caredSpiritIds) && bloomAscendance.payload.caredSpiritIds.length === 3, 'Bloom ascendance ledger entry must preserve full care proof.');
  assert(bloomAscendance?.payload?.bondBySpiritId?.lirabao === 5, 'Bloom ascendance ledger entry must preserve Lirabao bond proof.');
  assert(bloomAscendance?.payload?.bondBySpiritId?.jintari === 5, 'Bloom ascendance ledger entry must preserve Jintari bond proof.');
  assert(bloomAscendance?.payload?.bondBySpiritId?.aozhen === 5, 'Bloom ascendance ledger entry must preserve Aozhen bond proof.');
  assert(bloomAscendance?.payload?.localPresenceCount === 2, 'Bloom ascendance ledger entry must preserve two-tester presence proof.');
  assert(bloomAscendance?.payload?.nurseryGroveProof === true, 'Bloom ascendance ledger entry must preserve nursery grove proof.');
  assert(bloomAscendance?.payload?.nurtureRiteProof === true, 'Bloom ascendance ledger entry must preserve nurture rite proof.');
  assert(bloomAscendance?.payload?.kinshipAlbumProof === true, 'Bloom ascendance ledger entry must preserve kinship album proof.');
  assert(bloomAscendance?.payload?.growthRiteProof === true, 'Bloom ascendance ledger entry must preserve growth rite proof.');
  assert(bloomAscendance?.payload?.traitAttunementProof === true, 'Bloom ascendance ledger entry must preserve trait attunement proof.');
  assert(bloomAscendance?.payload?.conditionWeaveProof === true, 'Bloom ascendance ledger entry must preserve condition weave proof.');
  assert(bloomAscendance?.payload?.affinityMatrixProof === true, 'Bloom ascendance ledger entry must preserve affinity matrix proof.');
  assert(bloomAscendance?.payload?.battleRoundProof === true, 'Bloom ascendance ledger entry must preserve battle round proof.');
  assert(bloomAscendance?.payload?.battleRoundVictory === true, 'Bloom ascendance ledger entry must preserve no-injury battle victory proof.');
  assert(bloomAscendance?.payload?.trainingXp >= 3, 'Bloom ascendance ledger entry must preserve training XP proof.');
  assert(bloomAscendance?.payload?.sparLadderXp >= 5, 'Bloom ascendance ledger entry must preserve spar ladder XP proof.');
  assert(bloomAscendance?.payload?.rewardItemId === 'jade-bloom-ascendance-sigil', 'Bloom ascendance ledger entry must preserve the no-real-value ascendance sigil proof.');
  assert(bloomAscendance?.payload?.noRealValue === true, 'Bloom ascendance ledger entry must remain no-real-value.');
  const lineageRegister = entriesById.get(`${runId}-lineage-register`);
  assert(lineageRegister?.payload?.registerId === 'jade-lineage-register', 'Lineage register ledger entry must preserve the Jade Lineage Register id.');
  assert(Array.isArray(lineageRegister?.payload?.roster) && lineageRegister.payload.roster.length === 3, 'Lineage register ledger entry must preserve full roster proof.');
  assert(Array.isArray(lineageRegister?.payload?.partyIds) && lineageRegister.payload.partyIds.length === 3, 'Lineage register ledger entry must preserve full party proof.');
  assert(Array.isArray(lineageRegister?.payload?.caredSpiritIds) && lineageRegister.payload.caredSpiritIds.length === 3, 'Lineage register ledger entry must preserve full care proof.');
  assert(lineageRegister?.payload?.bondBySpiritId?.lirabao === 5, 'Lineage register ledger entry must preserve Lirabao bond proof.');
  assert(lineageRegister?.payload?.bondBySpiritId?.jintari === 5, 'Lineage register ledger entry must preserve Jintari bond proof.');
  assert(lineageRegister?.payload?.bondBySpiritId?.aozhen === 5, 'Lineage register ledger entry must preserve Aozhen bond proof.');
  assert(lineageRegister?.payload?.localPresenceCount === 2, 'Lineage register ledger entry must preserve two-tester presence proof.');
  assert(lineageRegister?.payload?.kinshipAlbumProof === true, 'Lineage register ledger entry must preserve kinship album proof.');
  assert(lineageRegister?.payload?.nurseryGroveProof === true, 'Lineage register ledger entry must preserve nursery grove proof.');
  assert(lineageRegister?.payload?.bloomAscendanceProof === true, 'Lineage register ledger entry must preserve bloom ascendance proof.');
  assert(lineageRegister?.payload?.captureRiteProof === true, 'Lineage register ledger entry must preserve capture rite proof.');
  assert(lineageRegister?.payload?.careCycleProof === true, 'Lineage register ledger entry must preserve care cycle proof.');
  assert(lineageRegister?.payload?.growthRiteProof === true, 'Lineage register ledger entry must preserve growth rite proof.');
  assert(lineageRegister?.payload?.raisingProof === true, 'Lineage register ledger entry must preserve raising proof.');
  assert(lineageRegister?.payload?.raisingMilestoneLabel === 'Moonwell Bloom Form', 'Lineage register ledger entry must preserve the raising milestone label.');
  assert(lineageRegister?.payload?.trainingXp >= 3, 'Lineage register ledger entry must preserve training XP proof.');
  assert(lineageRegister?.payload?.sparLadderXp >= 5, 'Lineage register ledger entry must preserve spar ladder XP proof.');
  assert(lineageRegister?.payload?.rewardItemId === 'jade-lineage-register-seal', 'Lineage register ledger entry must preserve the no-real-value lineage seal proof.');
  assert(lineageRegister?.payload?.noRealValue === true, 'Lineage register ledger entry must remain no-real-value.');
  const techniqueCodex = entriesById.get(`${runId}-technique-codex`);
  assert(techniqueCodex?.payload?.codexId === 'jade-technique-codex', 'Technique codex ledger entry must preserve the Jade Technique Codex id.');
  assert(Array.isArray(techniqueCodex?.payload?.partyIds) && techniqueCodex.payload.partyIds.length === 3, 'Technique codex ledger entry must preserve full-party proof.');
  assert(Array.isArray(techniqueCodex?.payload?.masteredMoveIds) && techniqueCodex.payload.masteredMoveIds.includes('lantern-pulse') && techniqueCodex.payload.masteredMoveIds.includes('goldleaf-feint') && techniqueCodex.payload.masteredMoveIds.includes('skybell-guard'), 'Technique codex ledger entry must preserve all first-court move ids.');
  assert(Array.isArray(techniqueCodex?.payload?.tacticIds) && techniqueCodex.payload.tacticIds.includes('lantern-anchor') && techniqueCodex.payload.tacticIds.includes('goldleaf-opening') && techniqueCodex.payload.tacticIds.includes('skybell-ward'), 'Technique codex ledger entry must preserve all battle tactic ids.');
  assert(techniqueCodex?.payload?.techniqueProof === true, 'Technique codex ledger entry must preserve technique mastery proof.');
  assert(techniqueCodex?.payload?.techniqueLoadoutProof === true, 'Technique codex ledger entry must preserve technique loadout proof.');
  assert(techniqueCodex?.payload?.techniqueLoadoutId === 'jade-step-loadout', 'Technique codex ledger entry must preserve the Jade Step Loadout id.');
  assert(techniqueCodex?.payload?.tacticProof === true, 'Technique codex ledger entry must preserve tactic scroll proof.');
  assert(techniqueCodex?.payload?.trainingXp >= 3, 'Technique codex ledger entry must preserve training XP proof.');
  assert(techniqueCodex?.payload?.battleRoundVictory === true, 'Technique codex ledger entry must preserve no-injury battle victory proof.');
  assert(techniqueCodex?.payload?.rewardItemId === 'jade-technique-codex-seal', 'Technique codex ledger entry must preserve the no-real-value codex seal proof.');
  assert(techniqueCodex?.payload?.noRealValue === true, 'Technique codex ledger entry must remain no-real-value.');
  const starterVow = entriesById.get(`${runId}-starter-vow`);
  assert(starterVow?.payload?.vowId === 'jade-starter-vow', 'Starter vow ledger entry must preserve the Jade Starter Vow id.');
  assert(starterVow?.payload?.selectedSpiritId === 'lirabao', 'Starter vow ledger entry must preserve the selected first companion.');
  assert(Array.isArray(starterVow?.payload?.itemIds) && starterVow.payload.itemIds.includes('mochirii-guild-seal'), 'Starter vow ledger entry must preserve the Mochirii Guild Seal proof.');
  assert(starterVow?.payload?.localPresenceCount === 1, 'Starter vow ledger entry must preserve local social presence proof.');
  assert(starterVow?.payload?.rewardItemId === 'jade-starter-knot', 'Starter vow ledger entry must preserve the no-real-value Jade Starter Knot proof.');
  assert(starterVow?.payload?.noRealValue === true, 'Starter vow ledger entry must remain no-real-value.');
  const captureRite = entriesById.get(`${runId}-capture-rite`);
  assert(captureRite?.payload?.riteId === 'jade-court-capture-rite', 'Capture rite ledger entry must preserve the Jade Capture Rite id.');
  assert(Array.isArray(captureRite?.payload?.roster) && captureRite.payload.roster.length === 3, 'Capture rite ledger entry must preserve full roster proof.');
  assert(Array.isArray(captureRite?.payload?.capturedSpiritIds) && captureRite.payload.capturedSpiritIds.length === 3, 'Capture rite ledger entry must preserve all captured spirit ids.');
  assert(Array.isArray(captureRite?.payload?.routeInvitedSpiritIds) && captureRite.payload.routeInvitedSpiritIds.includes('jintari') && captureRite.payload.routeInvitedSpiritIds.includes('aozhen'), 'Capture rite ledger entry must preserve both route invitation spirits.');
  assert(Array.isArray(captureRite?.payload?.lureItemIds) && captureRite.payload.lureItemIds.includes('lantern-harmony-tea'), 'Capture rite ledger entry must preserve Lantern Harmony Tea lure proof.');
  assert(Array.isArray(captureRite?.payload?.lureItemIds) && captureRite.payload.lureItemIds.includes('jade-thread-charm'), 'Capture rite ledger entry must preserve Jade Thread Charm lure proof.');
  assert(captureRite?.payload?.journalDiscoveredCount === 3, 'Capture rite ledger entry must preserve full journal proof.');
  assert(captureRite?.payload?.localPresenceCount === 2, 'Capture rite ledger entry must preserve two-tester presence proof.');
  assert(captureRite?.payload?.captureProof === true, 'Capture rite ledger entry must preserve basic capture proof.');
  assert(captureRite?.payload?.routeInviteProof === true, 'Capture rite ledger entry must preserve route invite proof.');
  assert(captureRite?.payload?.fieldAccordProof === true, 'Capture rite ledger entry must preserve field accord proof.');
  assert(captureRite?.payload?.battleRoundVictory === true, 'Capture rite ledger entry must preserve no-injury battle victory proof.');
  assert(captureRite?.payload?.rewardItemId === 'jade-capture-rite-tally', 'Capture rite ledger entry must preserve the no-real-value capture rite tally proof.');
  assert(captureRite?.payload?.noRealValue === true, 'Capture rite ledger entry must remain no-real-value.');
  const affinityMatrix = entriesById.get(`${runId}-affinity-matrix`);
  assert(affinityMatrix?.payload?.matrixId === 'jade-affinity-matrix', 'Affinity matrix ledger entry must preserve the Jade Affinity Matrix id.');
  assert(Array.isArray(affinityMatrix?.payload?.partyIds) && affinityMatrix.payload.partyIds.length === 3, 'Affinity matrix ledger entry must preserve full-party proof.');
  assert(Array.isArray(affinityMatrix?.payload?.affinityLabels) && affinityMatrix.payload.affinityLabels.includes('blossom') && affinityMatrix.payload.affinityLabels.includes('citrus-gold') && affinityMatrix.payload.affinityLabels.includes('sky-jade'), 'Affinity matrix ledger entry must preserve all first-court affinity labels.');
  assert(Array.isArray(affinityMatrix?.payload?.conditionIds) && affinityMatrix.payload.conditionIds.includes('lantern-ward') && affinityMatrix.payload.conditionIds.includes('goldleaf-tempo') && affinityMatrix.payload.conditionIds.includes('skybell-guard'), 'Affinity matrix ledger entry must preserve all battle condition ids.');
  assert(affinityMatrix?.payload?.affinityTrialId === 'silk-cinder-trial', 'Affinity matrix ledger entry must preserve the Silk Cinder trial proof.');
  assert(affinityMatrix?.payload?.techniqueLoadoutProof === true, 'Affinity matrix ledger entry must preserve loadout proof.');
  assert(affinityMatrix?.payload?.traitAttunementProof === true, 'Affinity matrix ledger entry must preserve trait proof.');
  assert(affinityMatrix?.payload?.conditionWeaveProof === true, 'Affinity matrix ledger entry must preserve condition weave proof.');
  assert(affinityMatrix?.payload?.battleRoundVictory === true, 'Affinity matrix ledger entry must preserve no-injury battle victory proof.');
  assert(affinityMatrix?.payload?.rewardItemId === 'jade-affinity-matrix-seal', 'Affinity matrix ledger entry must preserve the no-real-value matrix seal proof.');
  assert(affinityMatrix?.payload?.noRealValue === true, 'Affinity matrix ledger entry must remain no-real-value.');
  const relicAttunement = entriesById.get(`${runId}-relic-attunement`);
  assert(relicAttunement?.payload?.relicAttunementId === 'jade-relic-attunement', 'Relic attunement ledger entry must preserve the Jade Relic Attunement id.');
  assert(Array.isArray(relicAttunement?.payload?.partyIds) && relicAttunement.payload.partyIds.length === 3, 'Relic attunement ledger entry must preserve full-party proof.');
  assert(Array.isArray(relicAttunement?.payload?.itemIds) && relicAttunement.payload.itemIds.includes('jade-thread-charm') && relicAttunement.payload.itemIds.includes('lantern-harmony-tea') && relicAttunement.payload.itemIds.includes('jade-court-provision-satchel'), 'Relic attunement ledger entry must preserve all held-charm item ids.');
  assert(relicAttunement?.payload?.techniqueLoadoutProof === true, 'Relic attunement ledger entry must preserve loadout proof.');
  assert(relicAttunement?.payload?.techniqueCodexProof === true, 'Relic attunement ledger entry must preserve technique codex proof.');
  assert(relicAttunement?.payload?.traitAttunementProof === true, 'Relic attunement ledger entry must preserve trait proof.');
  assert(relicAttunement?.payload?.conditionWeaveProof === true, 'Relic attunement ledger entry must preserve condition weave proof.');
  assert(relicAttunement?.payload?.affinityMatrixProof === true, 'Relic attunement ledger entry must preserve affinity matrix proof.');
  assert(relicAttunement?.payload?.craftWritProof === true, 'Relic attunement ledger entry must preserve craft writ proof.');
  assert(relicAttunement?.payload?.exchangeAccordProof === true, 'Relic attunement ledger entry must preserve exchange accord proof.');
  assert(relicAttunement?.payload?.careCycleProof === true, 'Relic attunement ledger entry must preserve care cycle proof.');
  assert(relicAttunement?.payload?.temperamentConcordProof === true, 'Relic attunement ledger entry must preserve temperament proof.');
  assert(relicAttunement?.payload?.localPresenceCount === 2, 'Relic attunement ledger entry must preserve two-tester presence proof.');
  assert(relicAttunement?.payload?.rewardItemId === 'jade-relic-silk-cord', 'Relic attunement ledger entry must preserve the no-real-value relic silk cord proof.');
  assert(relicAttunement?.payload?.noRealValue === true, 'Relic attunement ledger entry must remain no-real-value.');
  const dojoLadder = entriesById.get(`${runId}-dojo-ladder`);
  assert(dojoLadder?.payload?.ladderId === 'jade-dojo-ladder', 'Dojo ladder ledger entry must preserve the Jade Dojo Ladder id.');
  assert(Array.isArray(dojoLadder?.payload?.partyIds) && dojoLadder.payload.partyIds.length === 3, 'Dojo ladder ledger entry must preserve full-party proof.');
  assert(Array.isArray(dojoLadder?.payload?.clearedOpponentIds) && dojoLadder.payload.clearedOpponentIds.includes('jade-echo-apprentice') && dojoLadder.payload.clearedOpponentIds.includes('silk-river-disciple'), 'Dojo ladder ledger entry must preserve both cleared spar opponent ids.');
  assert(dojoLadder?.payload?.sparLadderWins >= 2, 'Dojo ladder ledger entry must preserve two spar ladder wins.');
  assert(dojoLadder?.payload?.sparLadderXp >= 5, 'Dojo ladder ledger entry must preserve spar ladder XP proof.');
  assert(dojoLadder?.payload?.trainingXp >= 3, 'Dojo ladder ledger entry must preserve training XP proof.');
  assert(dojoLadder?.payload?.battleRoundVictory === true, 'Dojo ladder ledger entry must preserve no-injury battle victory proof.');
  assert(dojoLadder?.payload?.techniqueCodexProof === true, 'Dojo ladder ledger entry must preserve technique codex proof.');
  assert(dojoLadder?.payload?.techniqueCodexId === 'jade-technique-codex', 'Dojo ladder ledger entry must preserve the technique codex id.');
  assert(dojoLadder?.payload?.conditionWeaveProof === true, 'Dojo ladder ledger entry must preserve condition weave proof.');
  assert(dojoLadder?.payload?.conditionWeaveId === 'jade-mirror-condition-weave', 'Dojo ladder ledger entry must preserve the condition weave id.');
  assert(dojoLadder?.payload?.affinityMatrixProof === true, 'Dojo ladder ledger entry must preserve affinity matrix proof.');
  assert(dojoLadder?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Dojo ladder ledger entry must preserve the affinity matrix id.');
  assert(dojoLadder?.payload?.mentorChallengeProof === true, 'Dojo ladder ledger entry must preserve mentor challenge proof.');
  assert(dojoLadder?.payload?.teamSparMatchProof === true, 'Dojo ladder ledger entry must preserve team spar match proof.');
  assert(dojoLadder?.payload?.rewardItemId === 'jade-dojo-ladder-seal', 'Dojo ladder ledger entry must preserve the no-real-value dojo ladder seal proof.');
  assert(dojoLadder?.payload?.noRealValue === true, 'Dojo ladder ledger entry must remain no-real-value.');
  const tournament = entriesById.get(`${runId}-tournament-bracket`);
  assert(tournament?.payload?.bracketId === 'jade-banner-tournament', 'Tournament ledger entry must preserve the Jade Banner Tournament id.');
  assert(Array.isArray(tournament?.payload?.partyIds) && tournament.payload.partyIds.length === 3, 'Tournament ledger entry must preserve full-party proof.');
  assert(tournament?.payload?.dojoLadderProof === true, 'Tournament ledger entry must preserve dojo ladder proof.');
  assert(tournament?.payload?.dojoLadderId === 'jade-dojo-ladder', 'Tournament ledger entry must preserve the dojo ladder id.');
  assert(tournament?.payload?.dojoLadderScore === 56, 'Tournament ledger entry must preserve the dojo ladder score.');
  assert(tournament?.payload?.mentorChallengeProof === true, 'Tournament ledger entry must preserve mentor challenge proof.');
  assert(tournament?.payload?.mentorChallengeId === 'silk-banner-mentor-drill', 'Tournament ledger entry must preserve the mentor challenge id.');
  assert(tournament?.payload?.teamSparMatchProof === true, 'Tournament ledger entry must preserve team spar match proof.');
  assert(tournament?.payload?.teamSparMatchId === 'jade-mirror-team-match', 'Tournament ledger entry must preserve the team spar match id.');
  assert(tournament?.payload?.harmonyTrialProof === true, 'Tournament ledger entry must preserve harmony trial proof.');
  assert(tournament?.payload?.conditionWeaveProof === true, 'Tournament ledger entry must preserve condition weave proof.');
  assert(tournament?.payload?.affinityMatrixProof === true, 'Tournament ledger entry must preserve affinity matrix proof.');
  assert(tournament?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Tournament ledger entry must preserve the affinity matrix id.');
  assert(tournament?.payload?.battleRoundVictory === true, 'Tournament ledger entry must preserve no-injury battle victory proof.');
  assert(tournament?.payload?.localPresenceCount === 2, 'Tournament ledger entry must preserve two-tester presence proof.');
  assert(tournament?.payload?.routePatrolProof === true, 'Tournament ledger entry must preserve route patrol proof.');
  assert(tournament?.payload?.nurtureRiteProof === true, 'Tournament ledger entry must preserve nurture rite proof.');
  assert(tournament?.payload?.guildRankProof === true, 'Tournament ledger entry must preserve guild rank proof.');
  assert(tournament?.payload?.rewardItemId === 'jade-banner-tournament-pennant', 'Tournament ledger entry must preserve the no-real-value tournament pennant proof.');
  assert(tournament?.payload?.noRealValue === true, 'Tournament ledger entry must remain no-real-value.');
  const rivalCircle = entriesById.get(`${runId}-rival-circle`);
  assert(rivalCircle?.payload?.circleId === 'jade-rival-circle', 'Rival circle ledger entry must preserve the Jade Rival Circle id.');
  assert(Array.isArray(rivalCircle?.payload?.partyIds) && rivalCircle.payload.partyIds.length === 3, 'Rival circle ledger entry must preserve full-party proof.');
  assert(rivalCircle?.payload?.tournamentProof === true, 'Rival circle ledger entry must preserve tournament proof.');
  assert(rivalCircle?.payload?.tournamentId === 'jade-banner-tournament', 'Rival circle ledger entry must preserve tournament id.');
  assert(rivalCircle?.payload?.dojoLadderProof === true, 'Rival circle ledger entry must preserve dojo ladder proof.');
  assert(rivalCircle?.payload?.dojoLadderId === 'jade-dojo-ladder', 'Rival circle ledger entry must preserve dojo ladder id.');
  assert(rivalCircle?.payload?.dojoLadderScore === 56, 'Rival circle ledger entry must preserve dojo ladder score.');
  assert(rivalCircle?.payload?.mentorChallengeProof === true, 'Rival circle ledger entry must preserve mentor proof.');
  assert(rivalCircle?.payload?.teamSparMatchProof === true, 'Rival circle ledger entry must preserve team match proof.');
  assert(rivalCircle?.payload?.conditionWeaveProof === true, 'Rival circle ledger entry must preserve condition weave proof.');
  assert(rivalCircle?.payload?.conditionWeaveId === 'jade-mirror-condition-weave', 'Rival circle ledger entry must preserve condition weave id.');
  assert(rivalCircle?.payload?.affinityMatrixProof === true, 'Rival circle ledger entry must preserve affinity matrix proof.');
  assert(rivalCircle?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Rival circle ledger entry must preserve the affinity matrix id.');
  assert(rivalCircle?.payload?.battleRoundVictory === true, 'Rival circle ledger entry must preserve no-injury battle victory proof.');
  assert(rivalCircle?.payload?.techniqueLoadoutProof === true, 'Rival circle ledger entry must preserve technique loadout proof.');
  assert(rivalCircle?.payload?.traitAttunementProof === true, 'Rival circle ledger entry must preserve trait proof.');
  assert(rivalCircle?.payload?.guildRankProof === true, 'Rival circle ledger entry must preserve rank proof.');
  assert(rivalCircle?.payload?.growthRiteProof === true, 'Rival circle ledger entry must preserve growth proof.');
  assert(rivalCircle?.payload?.localPresenceCount === 2, 'Rival circle ledger entry must preserve two-tester presence proof.');
  assert(rivalCircle?.payload?.rewardItemId === 'jade-rival-circle-mark', 'Rival circle ledger entry must preserve the no-real-value rival mark proof.');
  assert(rivalCircle?.payload?.noRealValue === true, 'Rival circle ledger entry must remain no-real-value.');
  const sifuCouncil = entriesById.get(`${runId}-sifu-council`);
  assert(sifuCouncil?.payload?.councilId === 'jade-sifu-council', 'Sifu council ledger entry must preserve the Jade Sifu Council id.');
  assert(Array.isArray(sifuCouncil?.payload?.partyIds) && sifuCouncil.payload.partyIds.length === 3, 'Sifu council ledger entry must preserve full-party proof.');
  assert(Array.isArray(sifuCouncil?.payload?.clearedCouncilMemberIds) && sifuCouncil.payload.clearedCouncilMemberIds.includes('sifu-narao') && sifuCouncil.payload.clearedCouncilMemberIds.includes('warden-meilin') && sifuCouncil.payload.clearedCouncilMemberIds.includes('keeper-haoran'), 'Sifu council ledger entry must preserve all council member ids.');
  assert(sifuCouncil?.payload?.dojoLadderProof === true, 'Sifu council ledger entry must preserve dojo ladder proof.');
  assert(sifuCouncil?.payload?.dojoLadderId === 'jade-dojo-ladder', 'Sifu council ledger entry must preserve dojo ladder id.');
  assert(sifuCouncil?.payload?.tournamentProof === true, 'Sifu council ledger entry must preserve tournament proof.');
  assert(sifuCouncil?.payload?.tournamentId === 'jade-banner-tournament', 'Sifu council ledger entry must preserve tournament id.');
  assert(sifuCouncil?.payload?.rivalCircleProof === true, 'Sifu council ledger entry must preserve rival circle proof.');
  assert(sifuCouncil?.payload?.rivalCircleId === 'jade-rival-circle', 'Sifu council ledger entry must preserve rival circle id.');
  assert(sifuCouncil?.payload?.techniqueCodexProof === true, 'Sifu council ledger entry must preserve technique codex proof.');
  assert(sifuCouncil?.payload?.conditionWeaveProof === true, 'Sifu council ledger entry must preserve condition weave proof.');
  assert(sifuCouncil?.payload?.affinityMatrixProof === true, 'Sifu council ledger entry must preserve affinity matrix proof.');
  assert(sifuCouncil?.payload?.mentorChallengeProof === true, 'Sifu council ledger entry must preserve mentor challenge proof.');
  assert(sifuCouncil?.payload?.battleRoundVictory === true, 'Sifu council ledger entry must preserve no-injury battle victory proof.');
  assert(sifuCouncil?.payload?.localPresenceCount === 2, 'Sifu council ledger entry must preserve two-tester presence proof.');
  assert(sifuCouncil?.payload?.rewardItemId === 'jade-sifu-council-crest', 'Sifu council ledger entry must preserve the no-real-value sifu council crest proof.');
  assert(sifuCouncil?.payload?.noRealValue === true, 'Sifu council ledger entry must remain no-real-value.');
  const summitCircuit = entriesById.get(`${runId}-summit-circuit`);
  assert(summitCircuit?.payload?.circuitId === 'jade-summit-circuit', 'Summit circuit ledger entry must preserve the Jade Summit Circuit id.');
  assert(Array.isArray(summitCircuit?.payload?.partyIds) && summitCircuit.payload.partyIds.length === 3, 'Summit circuit ledger entry must preserve full-party proof.');
  assert(Array.isArray(summitCircuit?.payload?.summitSealIds) && summitCircuit.payload.summitSealIds.includes('jade-dojo-seal') && summitCircuit.payload.summitSealIds.includes('banner-ring-seal') && summitCircuit.payload.summitSealIds.includes('qinghei-rival-seal') && summitCircuit.payload.summitSealIds.includes('sifu-council-seal'), 'Summit circuit ledger entry must preserve all summit seal ids.');
  assert(summitCircuit?.payload?.dojoLadderProof === true, 'Summit circuit ledger entry must preserve dojo ladder proof.');
  assert(summitCircuit?.payload?.dojoLadderId === 'jade-dojo-ladder', 'Summit circuit ledger entry must preserve dojo ladder id.');
  assert(summitCircuit?.payload?.tournamentProof === true, 'Summit circuit ledger entry must preserve tournament proof.');
  assert(summitCircuit?.payload?.tournamentId === 'jade-banner-tournament', 'Summit circuit ledger entry must preserve tournament id.');
  assert(summitCircuit?.payload?.rivalCircleProof === true, 'Summit circuit ledger entry must preserve rival circle proof.');
  assert(summitCircuit?.payload?.rivalCircleId === 'jade-rival-circle', 'Summit circuit ledger entry must preserve rival circle id.');
  assert(summitCircuit?.payload?.sifuCouncilProof === true, 'Summit circuit ledger entry must preserve sifu council proof.');
  assert(summitCircuit?.payload?.sifuCouncilId === 'jade-sifu-council', 'Summit circuit ledger entry must preserve sifu council id.');
  assert(summitCircuit?.payload?.relicAttunementProof === true, 'Summit circuit ledger entry must preserve relic attunement proof.');
  assert(summitCircuit?.payload?.relicAttunementId === 'jade-relic-attunement', 'Summit circuit ledger entry must preserve the relic attunement id.');
  assert(summitCircuit?.payload?.harmonyFormProof === true, 'Summit circuit ledger entry must preserve harmony form proof.');
  assert(summitCircuit?.payload?.harmonyTrialProof === true, 'Summit circuit ledger entry must preserve concord proof.');
  assert(summitCircuit?.payload?.teamSparMatchProof === true, 'Summit circuit ledger entry must preserve team match proof.');
  assert(summitCircuit?.payload?.mentorChallengeProof === true, 'Summit circuit ledger entry must preserve mentor challenge proof.');
  assert(summitCircuit?.payload?.battleRoundVictory === true, 'Summit circuit ledger entry must preserve no-injury battle victory proof.');
  assert(summitCircuit?.payload?.localPresenceCount === 2, 'Summit circuit ledger entry must preserve two-tester presence proof.');
  assert(summitCircuit?.payload?.rewardItemId === 'jade-summit-circuit-laurel', 'Summit circuit ledger entry must preserve the no-real-value summit laurel proof.');
  assert(summitCircuit?.payload?.noRealValue === true, 'Summit circuit ledger entry must remain no-real-value.');
  const questLedger = entriesById.get(`${runId}-quest-ledger`);
  assert(questLedger?.payload?.ledgerId === 'jade-quest-ledger', 'Quest ledger entry must preserve the Jade Quest Ledger id.');
  assert(Array.isArray(questLedger?.payload?.roster) && questLedger.payload.roster.length === 3, 'Quest ledger entry must preserve full roster proof.');
  assert(Array.isArray(questLedger?.payload?.acceptedQuestIds) && questLedger.payload.acceptedQuestIds.length === 3, 'Quest ledger entry must preserve all accepted quest proofs.');
  assert(Array.isArray(questLedger?.payload?.completedQuestIds) && questLedger.payload.completedQuestIds.length === 3, 'Quest ledger entry must preserve all completed quest proofs.');
  assert(questLedger?.payload?.journalDiscoveredCount === 3, 'Quest ledger entry must preserve full journal proof.');
  assert(questLedger?.payload?.localPresenceCount === 2, 'Quest ledger entry must preserve two-tester presence proof.');
  assert(questLedger?.payload?.routeMasteryProof === true, 'Quest ledger entry must preserve route mastery proof.');
  assert(questLedger?.payload?.routePatrolProof === true, 'Quest ledger entry must preserve route patrol proof.');
  assert(questLedger?.payload?.marketReceiptProof === true, 'Quest ledger entry must preserve market receipt proof.');
  assert(questLedger?.payload?.provisionProof === true, 'Quest ledger entry must preserve provision proof.');
  assert(questLedger?.payload?.commissionProof === true, 'Quest ledger entry must preserve commission proof.');
  assert(questLedger?.payload?.rewardItemId === 'jade-quest-ledger-seal', 'Quest ledger entry must preserve the no-real-value quest ledger seal.');
  assert(questLedger?.payload?.noRealValue === true, 'Quest ledger entry must remain no-real-value.');
  const storyChapter = entriesById.get(`${runId}-story-chapter`);
  assert(storyChapter?.payload?.chapterId === 'jade-scroll-story-chapter', 'Story chapter ledger entry must preserve the Jade Scroll Story Chapter id.');
  assert(Array.isArray(storyChapter?.payload?.roster) && storyChapter.payload.roster.length === 3, 'Story chapter ledger entry must preserve full roster proof.');
  assert(Array.isArray(storyChapter?.payload?.partyIds) && storyChapter.payload.partyIds.length === 3, 'Story chapter ledger entry must preserve full-party proof.');
  assert(Array.isArray(storyChapter?.payload?.completedQuestIds) && storyChapter.payload.completedQuestIds.length === 3, 'Story chapter ledger entry must preserve full quest proof.');
  assert(Array.isArray(storyChapter?.payload?.discoveredRoutes) && storyChapter.payload.discoveredRoutes.includes('cloudbell-reed-bank'), 'Story chapter ledger entry must preserve Cloudbell route proof.');
  assert(storyChapter?.payload?.routeEcologyProof === true, 'Story chapter ledger entry must preserve route ecology proof.');
  assert(storyChapter?.payload?.routeWaystoneProof === true, 'Story chapter ledger entry must preserve route waystone proof.');
  assert(storyChapter?.payload?.questLedgerProof === true, 'Story chapter ledger entry must preserve quest ledger proof.');
  assert(storyChapter?.payload?.questLedgerId === 'jade-quest-ledger', 'Story chapter ledger entry must preserve the quest ledger id.');
  assert(storyChapter?.payload?.nurtureRiteProof === true, 'Story chapter ledger entry must preserve nurture rite proof.');
  assert(storyChapter?.payload?.tournamentProof === true, 'Story chapter ledger entry must preserve tournament proof.');
  assert(storyChapter?.payload?.commissionProof === true, 'Story chapter ledger entry must preserve commission proof.');
  assert(storyChapter?.payload?.rallyProof === true, 'Story chapter ledger entry must preserve social rally proof.');
  assert(storyChapter?.payload?.rewardItemId === 'jade-scroll-story-chapter', 'Story chapter ledger entry must preserve the no-real-value story scroll proof.');
  assert(storyChapter?.payload?.noRealValue === true, 'Story chapter ledger entry must remain no-real-value.');
  const insigniaCase = entriesById.get(`${runId}-insignia-case`);
  assert(insigniaCase?.payload?.caseId === 'jade-insignia-case', 'Insignia case ledger entry must preserve the Jade Insignia Case id.');
  assert(Array.isArray(insigniaCase?.payload?.roster) && insigniaCase.payload.roster.length === 3, 'Insignia case ledger entry must preserve full roster proof.');
  assert(Array.isArray(insigniaCase?.payload?.partyIds) && insigniaCase.payload.partyIds.length === 3, 'Insignia case ledger entry must preserve full-party proof.');
  assert(insigniaCase?.payload?.routeMasteryProof === true, 'Insignia case ledger entry must preserve route mastery proof.');
  assert(insigniaCase?.payload?.routePatrolProof === true, 'Insignia case ledger entry must preserve route patrol proof.');
  assert(insigniaCase?.payload?.guildRankProof === true, 'Insignia case ledger entry must preserve guild rank proof.');
  assert(insigniaCase?.payload?.growthRiteProof === true, 'Insignia case ledger entry must preserve growth rite proof.');
  assert(insigniaCase?.payload?.tournamentProof === true, 'Insignia case ledger entry must preserve tournament proof.');
  assert(insigniaCase?.payload?.storyChapterProof === true, 'Insignia case ledger entry must preserve story chapter proof.');
  assert(insigniaCase?.payload?.harmonyFormProof === true, 'Insignia case ledger entry must preserve harmony proof.');
  assert(insigniaCase?.payload?.rewardItemId === 'jade-insignia-case', 'Insignia case ledger entry must preserve the no-real-value insignia case proof.');
  assert(insigniaCase?.payload?.noRealValue === true, 'Insignia case ledger entry must remain no-real-value.');
  const chronicle = entriesById.get(`${runId}-wayfarer-chronicle`);
  assert(chronicle?.payload?.chronicleId === 'jade-wayfarer-chronicle', 'Wayfarer chronicle ledger entry must preserve the Jade Wayfarer Chronicle id.');
  assert(chronicle?.payload?.localPresenceCount === 2, 'Wayfarer chronicle ledger entry must preserve two-tester presence proof.');
  assert(chronicle?.payload?.starterVowProof === true, 'Wayfarer chronicle ledger entry must preserve starter vow proof.');
  assert(chronicle?.payload?.captureRiteProof === true, 'Wayfarer chronicle ledger entry must preserve capture rite proof.');
  assert(chronicle?.payload?.encounterRotationProof === true, 'Wayfarer chronicle ledger entry must preserve encounter rotation proof.');
  assert(chronicle?.payload?.encounterAtlasProof === true, 'Wayfarer chronicle ledger entry must preserve encounter atlas proof.');
  assert(chronicle?.payload?.habitatCensusProof === true, 'Wayfarer chronicle ledger entry must preserve habitat census proof.');
  assert(chronicle?.payload?.routePatrolProof === true, 'Wayfarer chronicle ledger entry must preserve route patrol proof.');
  assert(chronicle?.payload?.routeEcologyProof === true, 'Wayfarer chronicle ledger entry must preserve route ecology proof.');
  assert(chronicle?.payload?.craftWritProof === true, 'Wayfarer chronicle ledger entry must preserve craft writ proof.');
  assert(chronicle?.payload?.routeWaystoneProof === true, 'Wayfarer chronicle ledger entry must preserve route waystone proof.');
  assert(chronicle?.payload?.routeCharterProof === true, 'Wayfarer chronicle ledger entry must preserve route charter proof.');
  assert(chronicle?.payload?.nurtureRiteProof === true, 'Wayfarer chronicle ledger entry must preserve nurture rite proof.');
  assert(chronicle?.payload?.kinshipAlbumProof === true, 'Wayfarer chronicle ledger entry must preserve kinship album proof.');
  assert(chronicle?.payload?.nurseryGroveProof === true, 'Wayfarer chronicle ledger entry must preserve nursery grove proof.');
  assert(chronicle?.payload?.bloomAscendanceProof === true, 'Wayfarer chronicle ledger entry must preserve bloom ascendance proof.');
  assert(chronicle?.payload?.lineageRegisterProof === true, 'Wayfarer chronicle ledger entry must preserve lineage register proof.');
  assert(chronicle?.payload?.exchangeAccordProof === true, 'Wayfarer chronicle ledger entry must preserve exchange accord proof.');
  assert(chronicle?.payload?.exchangeAccordId === 'jade-exchange-accord', 'Wayfarer chronicle ledger entry must preserve the exchange accord id.');
  assert(chronicle?.payload?.provisionCatalogProof === true, 'Wayfarer chronicle ledger entry must preserve provision catalog proof.');
  assert(chronicle?.payload?.battleKitProof === true, 'Wayfarer chronicle ledger entry must preserve battle kit proof.');
  assert(chronicle?.payload?.remedyPouchProof === true, 'Wayfarer chronicle ledger entry must preserve remedy pouch proof.');
  assert(chronicle?.payload?.questLedgerProof === true, 'Wayfarer chronicle ledger entry must preserve quest ledger proof.');
  assert(chronicle?.payload?.rosterCabinetProof === true, 'Wayfarer chronicle ledger entry must preserve roster cabinet proof.');
  assert(chronicle?.payload?.blossomCradleProof === true, 'Wayfarer chronicle ledger entry must preserve blossom cradle proof.');
  assert(chronicle?.payload?.dojoLadderProof === true, 'Wayfarer chronicle ledger entry must preserve dojo ladder proof.');
  assert(chronicle?.payload?.tournamentProof === true, 'Wayfarer chronicle ledger entry must preserve tournament proof.');
  assert(chronicle?.payload?.sifuCouncilProof === true, 'Wayfarer chronicle ledger entry must preserve sifu council proof.');
  assert(chronicle?.payload?.summitCircuitProof === true, 'Wayfarer chronicle ledger entry must preserve summit circuit proof.');
  assert(chronicle?.payload?.affinityMatrixProof === true, 'Wayfarer chronicle ledger entry must preserve affinity matrix proof.');
  assert(chronicle?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Wayfarer chronicle ledger entry must preserve the affinity matrix id.');
  assert(chronicle?.payload?.relicAttunementProof === true, 'Wayfarer chronicle ledger entry must preserve relic attunement proof.');
  assert(chronicle?.payload?.rallyProof === true, 'Wayfarer chronicle ledger entry must preserve social rally proof.');
  assert(chronicle?.payload?.storyChapterProof === true, 'Wayfarer chronicle ledger entry must preserve story chapter proof.');
  assert(chronicle?.payload?.insigniaCaseProof === true, 'Wayfarer chronicle ledger entry must preserve insignia case proof.');
  assert(chronicle?.payload?.techniqueCodexProof === true, 'Wayfarer chronicle ledger entry must preserve technique codex proof.');
  assert(chronicle?.payload?.marketReceiptProof === true, 'Wayfarer chronicle ledger entry must preserve market receipt proof.');
  assert(chronicle?.payload?.canaryPreviewProof === true, 'Wayfarer chronicle ledger entry must preserve Canary preview proof.');
  assert(chronicle?.payload?.noRealValue === true, 'Wayfarer chronicle ledger entry must remain no-real-value.');
  const ascension = entriesById.get(`${runId}-ascension-trial`);
  assert(ascension?.payload?.trialId === 'jade-court-ascension-trial', 'Ascension trial ledger entry must preserve the Jade Court Ascension Trial id.');
  assert(ascension?.payload?.localPresenceCount === 2, 'Ascension trial ledger entry must preserve two-tester presence proof.');
  assert(ascension?.payload?.starterVowProof === true, 'Ascension trial ledger entry must preserve starter vow proof.');
  assert(ascension?.payload?.wayfarerChronicleProof === true, 'Ascension trial ledger entry must preserve wayfarer chronicle proof.');
  assert(ascension?.payload?.kinshipAlbumProof === true, 'Ascension trial ledger entry must preserve kinship album proof.');
  assert(ascension?.payload?.nurseryGroveProof === true, 'Ascension trial ledger entry must preserve nursery grove proof.');
  assert(ascension?.payload?.bloomAscendanceProof === true, 'Ascension trial ledger entry must preserve bloom ascendance proof.');
  assert(ascension?.payload?.lineageRegisterProof === true, 'Ascension trial ledger entry must preserve lineage register proof.');
  assert(ascension?.payload?.exchangeAccordProof === true, 'Ascension trial ledger entry must preserve exchange accord proof.');
  assert(ascension?.payload?.exchangeAccordId === 'jade-exchange-accord', 'Ascension trial ledger entry must preserve the exchange accord id.');
  assert(ascension?.payload?.provisionCatalogProof === true, 'Ascension trial ledger entry must preserve provision catalog proof.');
  assert(ascension?.payload?.battleKitProof === true, 'Ascension trial ledger entry must preserve battle kit proof.');
  assert(ascension?.payload?.remedyPouchProof === true, 'Ascension trial ledger entry must preserve remedy pouch proof.');
  assert(ascension?.payload?.questLedgerProof === true, 'Ascension trial ledger entry must preserve quest ledger proof.');
  assert(ascension?.payload?.rosterCabinetProof === true, 'Ascension trial ledger entry must preserve roster cabinet proof.');
  assert(ascension?.payload?.blossomCradleProof === true, 'Ascension trial ledger entry must preserve blossom cradle proof.');
  assert(ascension?.payload?.routeCharterProof === true, 'Ascension trial ledger entry must preserve route charter proof.');
  assert(ascension?.payload?.storyChapterProof === true, 'Ascension trial ledger entry must preserve story chapter proof.');
  assert(ascension?.payload?.insigniaCaseProof === true, 'Ascension trial ledger entry must preserve insignia case proof.');
  assert(ascension?.payload?.mentorChallengeProof === true, 'Ascension trial ledger entry must preserve mentor challenge proof.');
  assert(ascension?.payload?.dojoLadderProof === true, 'Ascension trial ledger entry must preserve dojo ladder proof.');
  assert(ascension?.payload?.tournamentProof === true, 'Ascension trial ledger entry must preserve tournament proof.');
  assert(ascension?.payload?.rivalCircleProof === true, 'Ascension trial ledger entry must preserve rival circle proof.');
  assert(ascension?.payload?.sifuCouncilProof === true, 'Ascension trial ledger entry must preserve sifu council proof.');
  assert(ascension?.payload?.summitCircuitProof === true, 'Ascension trial ledger entry must preserve summit circuit proof.');
  assert(ascension?.payload?.battleRoundVictory === true, 'Ascension trial ledger entry must preserve no-injury battle victory proof.');
  assert(ascension?.payload?.affinityMatrixProof === true, 'Ascension trial ledger entry must preserve affinity matrix proof.');
  assert(ascension?.payload?.affinityMatrixId === 'jade-affinity-matrix', 'Ascension trial ledger entry must preserve the affinity matrix id.');
  assert(ascension?.payload?.relicAttunementProof === true, 'Ascension trial ledger entry must preserve relic attunement proof.');
  assert(ascension?.payload?.techniqueCodexProof === true, 'Ascension trial ledger entry must preserve technique codex proof.');
  assert(ascension?.payload?.marketReceiptProof === true, 'Ascension trial ledger entry must preserve market receipt proof.');
  assert(ascension?.payload?.canaryPreviewProof === true, 'Ascension trial ledger entry must preserve Canary preview proof.');
  assert(ascension?.payload?.noRealValue === true, 'Ascension trial ledger entry must remain no-real-value.');
}

async function getOk(path, name) {
  const response = await request(path, { method: 'GET' }, name);
  assert(response.status >= 200 && response.status < 300, `${name} endpoint failed with ${response.status}.`);
  return response;
}

async function getJson(path, name) {
  const response = await getOk(path, name);
  assert(response.body && typeof response.body === 'object', `${name} endpoint did not return JSON.`);
  return response;
}

async function postJson(path, body, name) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }, name);
}

async function request(path, init, name) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(requestTimeoutMs)
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${name} request to ${path} failed: ${reason}`);
  }

  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  const result = { name, path, status: response.status, body };
  report.endpoints.push({ name, path, status: response.status });
  return result;
}

async function readLedgerEntries() {
  let text = '';
  try {
    text = await readFile(ledgerPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Local alpha ledger was not created at ${ledgerPath}. Is the server using a different RPG_SAVE_DIR?`);
    }
    throw error;
  }

  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => typeof entry.requestId === 'string' && entry.requestId.startsWith(runId));
}

async function writeReport() {
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function resolveFromRoot(value) {
  return isAbsolute(value) ? value : resolve(root, value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
