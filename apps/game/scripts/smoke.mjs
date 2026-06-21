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

if (
  manifest.engine !== 'unity-webgl' ||
  manifest.room?.mode !== 'single-shared-room' ||
  manifest.room?.capacity !== 25 ||
  manifest.room?.sharedPetKey !== 'lirabao' ||
  manifest.runtime?.realtimeAuthority !== 'ugs-distributed-authority' ||
  manifest.runtime?.stateAuthority !== 'ugs-cloud-save'
) {
  throw new Error('Manifest does not expose the Unity shared-room runtime contract.');
}

if (manifest.alpha?.noRealValue !== true || manifest.market?.enabled !== false || manifest.avatarUploads !== false) {
  throw new Error('Manifest does not keep the Unity alpha no-real-value, no-market, no-avatar-upload posture.');
}

const alphaStatus = await fetch(`${baseUrl}/integration/alpha/status`).then((response) => response.json());
if (
  alphaStatus.engine !== 'unity-webgl' ||
  alphaStatus.room?.mode !== 'single-shared-room' ||
  alphaStatus.room?.capacity !== 25 ||
  alphaStatus.room?.sharedPetKey !== 'lirabao' ||
  alphaStatus.runtime?.realtimeAuthority !== 'ugs-distributed-authority' ||
  alphaStatus.runtime?.stateAuthority !== 'ugs-cloud-save'
) {
  throw new Error('Alpha status does not expose the Unity shared-room runtime contract.');
}

if (alphaStatus.alpha?.noRealValue !== true || alphaStatus.market?.enabled !== false || alphaStatus.avatarUploads !== false) {
  throw new Error('Alpha status does not keep the Unity alpha no-real-value, no-market, no-avatar-upload posture.');
}

if (alphaStatus.chainRuntime?.network !== 'CANARY' || !['configured', 'configured-preview-stub'].includes(alphaStatus.chainRuntime?.mode)) {
  throw new Error('Alpha status does not expose the Enjin Canary runtime mode.');
}

if (alphaStatus.enjinCanaryConfigured === false && alphaStatus.chainRuntime?.mode !== 'configured-preview-stub') {
  throw new Error('Unconfigured Enjin Canary runtime must explain configured-preview-stub mode.');
}

console.log(`Mochi Social smoke checks passed for ${baseUrl}`);
