import { readFileSync } from 'node:fs';

const bridgePath = 'apps/game/src/integration/browser-bridge.ts';
const protocolPath = 'apps/game/src/integration/protocol.ts';
const bridge = readFileSync(bridgePath, 'utf8');
const protocol = readFileSync(protocolPath, 'utf8');
const failures = [];

requireSnippet(protocol, 'accessToken: string;', 'AuthPayload must expose only the short-lived access token field as required input.');
requireSnippet(protocol, 'expiresAt?: number;', 'AuthPayload may carry optional expiry metadata only.');
requireSnippet(bridge, "const TOKEN_KEY = 'mochiPets.accessToken';", 'Bridge must store the access token under the expected alpha key.');
requireSnippet(bridge, "const EXPIRES_KEY = 'mochiPets.accessTokenExpiresAt';", 'Bridge must store only optional access-token expiry metadata.');
requireSnippet(bridge, 'writeLocalStore(TOKEN_KEY, payload.accessToken);', 'setAuth must persist only payload.accessToken as the token value.');
requireSnippet(bridge, "postToParent(BRIDGE_EVENTS.authState, { state: 'linked' });", 'Linked auth response must report state only, not token values.');
requireSnippet(bridge, 'removeLocalStore(TOKEN_KEY);', 'sign-out must clear stored access token.');
requireSnippet(bridge, 'removeLocalStore(EXPIRES_KEY);', 'sign-out must clear stored access-token expiry metadata.');
requireSnippet(bridge, "postToParent(BRIDGE_EVENTS.authState, { state: 'guest' });", 'Guest auth response must report state only, not token values.');
requireSnippet(bridge, "postToParent(BRIDGE_EVENTS.error, { message: 'Missing Supabase access token.' });", 'Missing auth must report an error message without token data.');
requireSnippet(bridge, 'setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });', 'MOCHI_PETS_AUTH handler must pass only accessToken and expiresAt into auth state.');
requireSnippet(bridge, 'headers.Authorization = `Bearer ${accessToken}`;', 'Alpha action requests must derive Authorization from the stored access token only.');

const authBlock = blockAround(bridge, 'if (event.data.type === BRIDGE_EVENTS.auth)', 'if (event.data.type === BRIDGE_EVENTS.signOut)');
if (!authBlock) {
  failures.push('MOCHI_PETS_AUTH handler block was not found.');
} else {
  requireSnippet(authBlock, 'payload.accessToken', 'MOCHI_PETS_AUTH handler must require payload.accessToken.');
  requireSnippet(authBlock, 'setAuth({ accessToken: payload.accessToken, expiresAt: payload.expiresAt });', 'MOCHI_PETS_AUTH handler must not forward arbitrary payload fields.');
  assertNoForbiddenBridgeMaterial('MOCHI_PETS_AUTH handler', authBlock);
}

for (const [label, text] of [
  ['browser bridge', bridge],
  ['bridge protocol', protocol],
]) {
  assertNoForbiddenBridgeMaterial(label, text);
}

if (/\bpostToParent\([^)]*accessToken/.test(bridge) || /\bpostToParent\([^)]*TOKEN_KEY/.test(bridge)) {
  failures.push('Bridge must not post access token values back to the parent window.');
}

if (failures.length) {
  console.error('Mochi Social browser bridge auth check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Mochi Social browser bridge auth check passed.');

function blockAround(text, startNeedle, endNeedle) {
  const start = text.indexOf(startNeedle);
  if (start === -1) return '';
  const end = text.indexOf(endNeedle, start + startNeedle.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

function requireSnippet(text, snippet, message) {
  if (!text.includes(snippet)) failures.push(`${message} Missing snippet: ${snippet}`);
}

function assertNoForbiddenBridgeMaterial(label, value) {
  for (const forbidden of [
    'refresh_token',
    'refreshToken',
    'provider_token',
    'providerToken',
    'provider_refresh_token',
    'service_role',
    'serviceRole',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DISCORD_BOT_TOKEN',
    'ENJIN_PLATFORM_TOKEN',
    'KEY_PASS',
    'PLATFORM_KEY',
  ]) {
    if (value.includes(forbidden)) {
      failures.push(`${label} must not include ${forbidden}.`);
    }
  }
}
