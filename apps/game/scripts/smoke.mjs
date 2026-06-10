const baseUrl = (process.env.MOCHI_SOCIAL_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const checks = [
  { path: '/healthz', name: 'health' },
  { path: '/integration/game-manifest.json', name: 'manifest' },
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

console.log(`Mochi Social smoke checks passed for ${baseUrl}`);
