const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const checks = [
  { path: '/healthz', name: 'health' },
  { path: '/integration/game-manifest.json', name: 'manifest' },
  { path: '/integration/alpha/status', name: 'alpha status' },
  { path: '/play', name: 'play' },
  { path: '/embed', name: 'embed' }
];

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`);
  if (!response.ok) {
    throw new Error(`${check.name} check failed: ${response.status} ${response.statusText}`);
  }
}

const manifest = await fetch(`${baseUrl}/integration/game-manifest.json`).then((response) => response.json());
if (manifest.name !== 'Mochi Social' || manifest.bridge?.namespace !== 'MOCHI_SOCIAL') {
  throw new Error('Manifest does not expose the Mochi Social integration contract.');
}

if (manifest.chain?.provider !== 'enjin' || manifest.chain?.network !== 'CANARY' || manifest.alpha?.noRealValue !== true) {
  throw new Error('Manifest does not expose the closed Enjin Canary alpha contract.');
}

const alphaStatus = await fetch(`${baseUrl}/integration/alpha/status`).then((response) => response.json());
if (alphaStatus.market?.fixedPrice !== true || alphaStatus.market?.auctions !== false) {
  throw new Error('Alpha status does not expose fixed-price/no-auction market scope.');
}

if (
  alphaStatus.gameplay?.spiritAttunement !== true ||
  alphaStatus.gameplay?.routeMastery !== true ||
  alphaStatus.gameplay?.trainingBattles !== true ||
  alphaStatus.gameplay?.raisingCare !== true ||
  alphaStatus.gameplay?.roleplayQuests !== true ||
  alphaStatus.gameplay?.questChains !== true ||
  alphaStatus.gameplay?.copiedUpstreamContent !== false
) {
  throw new Error('Alpha status does not expose the Mochirii-native creature loop scope.');
}

if (alphaStatus.chainRuntime?.network !== 'CANARY' || !['configured', 'configured-preview-stub'].includes(alphaStatus.chainRuntime?.mode)) {
  throw new Error('Alpha status does not expose the Enjin Canary runtime mode.');
}

if (alphaStatus.enjinCanaryConfigured === false && alphaStatus.chainRuntime?.mode !== 'configured-preview-stub') {
  throw new Error('Unconfigured Enjin Canary runtime must explain configured-preview-stub mode.');
}

console.log(`Mochi Social smoke checks passed for ${baseUrl}`);
