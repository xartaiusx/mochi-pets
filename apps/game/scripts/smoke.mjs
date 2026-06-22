const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const requireUnityWebgl = process.env.MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL === 'true';

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

if (manifest.activeRuntime !== 'unity-webgl' && manifest.activeRuntime !== 'legacy-fallback') {
  throw new Error('Manifest does not expose a recognized active runtime.');
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

if (manifest.alpha?.noRealValue !== true || manifest.avatarUploads !== false) {
  throw new Error('Manifest does not keep the Unity alpha no-real-value, curated-character posture.');
}

assertNoFutureSystemKeys(manifest, 'Manifest');

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

if (alphaStatus.alpha?.noRealValue !== true || alphaStatus.avatarUploads !== false) {
  throw new Error('Alpha status does not keep the Unity alpha no-real-value, curated-character posture.');
}

assertNoFutureSystemKeys(alphaStatus, 'Alpha status');

if (requireUnityWebgl) {
  if (manifest.activeRuntime !== 'unity-webgl' || manifest.unityWebglBuild?.present !== true) {
    throw new Error('Release smoke requires a present Unity WebGL build.');
  }

  const embedHtml = await fetch(`${baseUrl}/embed`).then((response) => response.text());
  if (!/createUnityInstance|Build\/.+\.loader\.js|Unity WebGL/i.test(embedHtml)) {
    throw new Error('/embed did not serve a Unity WebGL page while MOCHI_SOCIAL_REQUIRE_UNITY_WEBGL=true.');
  }
}

if ('chainRuntime' in alphaStatus || 'enjinCanaryConfigured' in alphaStatus) {
  throw new Error('Alpha status must not expose future asset provider state for the Unity shared-room alpha.');
}

console.log(`Mochi Social smoke checks passed for ${baseUrl}`);

function assertNoFutureSystemKeys(payload, label) {
  const json = JSON.stringify(payload);
  if (/\b(?:market|trade|cashout)\b/i.test(json)) {
    throw new Error(`${label} must not publish future economy keys for the Unity shared-room alpha.`);
  }
}
