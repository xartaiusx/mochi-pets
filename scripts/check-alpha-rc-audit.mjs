import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveMochiSocialSiteRepoPath } from './mochi-social-site-repo-path.mjs';
import { readLocalPullRequestEvidence } from './github-pr-evidence.mjs';
import { readPublicPullRequest } from './github-public-prs.mjs';

const root = process.cwd();
const siteRepoPath = resolveMochiSocialSiteRepoPath(root);
const credsDir = resolve(process.env.MOCHI_SOCIAL_CREDS_DIR || defaultCredsDir());
const reportPath = resolve(root, process.env.MOCHI_SOCIAL_ALPHA_RC_AUDIT_REPORT || 'reports/alpha-rc-audit.json');
const checkedAt = new Date().toISOString();
const requirements = [];

addStaticRequirements();
addSiteRequirements();
addSitePreviewReadyReportRequirements();
addProviderGateRequirements();
addLocalEvidenceRequirements();
addReportHygieneRequirements();
addBranchInventoryRequirements();
addOperatorChecklistRequirements();
addProviderPreflightRequirements();
addSyncApprovalRequirements();
addManualPromptReviewRequirements();
addLocalBranchRequirements();
addSiteBranchRequirements();
await addPrRequirements();
addLocalHandoffRequirements();

const summary = summarize(requirements);
const report = {
  ok: summary.failed === 0 && summary.unverified === 0,
  checkedAt,
  scope: 'Mochi Social Alpha RC requirement audit. This report is no-secret and points to evidence, not raw provider credentials.',
  git: readGitState(),
  summary,
  requirements
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (!report.ok) {
  console.error('Mochi Social Alpha RC audit is not ready:');
  for (const item of requirements.filter((entry) => entry.status !== 'pass')) {
    console.error(`- ${item.id}: ${item.status} - ${item.message}`);
  }
  console.error(`Report: ${reportPath}`);
  process.exit(1);
}

console.log(`Mochi Social Alpha RC audit passed. Report: ${reportPath}`);

function addStaticRequirements() {
  requireFileIncludes('game.contracts', 'Game runtime exposes required public routes and alpha contracts.', 'apps/game/src/entries/express.ts', [
    '/healthz',
    '/play',
    '/embed',
    '/integration/game-manifest.json',
    '/integration/alpha/status',
    '/integration/alpha/progress',
    '/integration/alpha/action'
  ]);
  requireFileIncludes('game.no-real-value', 'Game manifest and alpha status keep Preview Ready no-real-value shared-room scope.', 'apps/game/src/integration/alpha-contract.ts', [
    'noRealValue: true',
    "stopPoint: 'alpha-preview-ready'",
    'sharedRoom: true',
    'lirabaoCare: true',
    'staleRevisionReload: true',
    'avatarUploads: false',
    'multipleRooms: false',
    'mobileSpecificUi: false',
    "ugc: 'curated'",
    "'unity.pet.interaction'",
    "'unity.pet.state_saved'"
  ]);
  requireFileIncludes('game.bridge-protocol', 'Bridge protocol declares Supabase access-token auth and sign-out events.', 'apps/game/src/integration/protocol.ts', [
    'MOCHI_SOCIAL_AUTH',
    'MOCHI_SOCIAL_SIGN_OUT',
    'MOCHI_SOCIAL_READY',
    'MOCHI_SOCIAL_AUTH_STATE',
    'MOCHI_SOCIAL_ERROR'
  ]);
  requireFileIncludes('game.bridge-runtime', 'Unity WebGL wrapper consumes auth/sign-out protocol, validates parent origins, and injects browser-safe endpoint config.', 'apps/game/src/entries/express.ts', [
    'data-mochi-social-unity-bridge-config',
    'allowedParentOrigins',
    'MOCHI_SOCIAL_AUTH',
    'MOCHI_SOCIAL_SIGN_OUT',
    'accessToken',
    'unityAuthUrl',
    'mochi-social-unity-auth',
    'event.stopImmediatePropagation()'
  ]);
  requireFileIncludes('game.supabase-edge-bridge', 'Supabase Edge bridge uses the scoped game server token header and keeps service-role secrets out of game requests.', 'apps/game/src/integration/supabase-edge-client.ts', [
    'MOCHI_SOCIAL_SUPABASE_FUNCTIONS_URL',
    'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
    'x-mochi-social-server-token',
    'ALPHA_EDGE_FUNCTIONS.action',
    'ALPHA_EDGE_FUNCTIONS.progress',
    'buildAlphaProgressRequest',
    'JSON.stringify(action)'
  ]);
  requireFileIncludes('game.supabase-edge-tests', 'Supabase Edge bridge tests prove no service-role fallback and no server token in the action body.', 'apps/game/tests/supabase-edge-client.test.ts', [
    'scoped server token in a header only',
    'authoritative progress snapshot request',
    'not.toContain',
    'SUPABASE_SERVICE_ROLE_KEY',
    'mochi-social-alpha-action',
    'mochi-social-alpha-progress'
  ]);
  requireFileIncludes('game.no-future-economy-exports', 'Release-facing manifest and status reject future economy keys for the Unity shared-room alpha.', 'apps/game/src/entries/express.ts', [
    "assertNoFutureSystemKeys(manifest, 'game manifest')",
    "assertNoFutureSystemKeys(status, 'alpha status')",
    'must not publish future economy keys',
    'market|trade|cashout'
  ]);
  requireFileIncludes('game.local-acceptance', 'Local acceptance covers the Unity shared-room manifest, routes, character actions, Lirabao actions, and no-real-value ledger fallback.', 'scripts/check-local-alpha-acceptance.mjs', [
    'Unity WebGL Alpha Preview Ready contract acceptance',
    'jade-lantern-room-alpha',
    'JadeLanternRoom',
    'single-shared-room',
    'lirabao',
    'character.v1',
    'room:jade-lantern-room/sharedPet.v1',
    'unity.room.joined',
    'unity.character.created',
    'unity.character.updated',
    'unity.pet.interaction',
    'unity.pet.state_saved',
    'unity.room.left',
    'ledgerVersion=1',
    'alpha-preview-ready',
    'must not expose future asset network state'
  ]);
  requireFileIncludes('game.local-suite', 'Local Alpha suite builds, starts the built runtime, runs localhost smokes, strips live provider env, and writes one no-secret report.', 'scripts/check-alpha-local-suite.mjs', [
    'No-cost localhost Alpha RC suite',
    'readGitState',
    'localHead',
    'npmCommand',
    'alpha:wallet-daemon-check',
    'alpha:local-acceptance',
    'alpha:load-smoke',
    'alpha:browser-presence',
    'alpha:responsive-gameplay',
    'alpha:visual-snapshot',
    'alpha:visual-review',
    'alpha:enjin-operator-smoke',
    'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE',
    'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE',
    'MOCHI_SOCIAL_OPERATOR_SMOKE_TOKEN',
    'delete env.ENJIN_PLATFORM_TOKEN',
    'reports/alpha-local-suite.json'
  ]);
  requireFileIncludes('game.local-evidence-script', 'Local evidence summary validates ignored localhost reports and writes no-secret summary artifacts.', 'scripts/check-alpha-local-evidence.mjs', [
    'No-secret local Alpha RC evidence summary',
    'alpha-local-evidence.json',
    'alpha-local-evidence.md',
    'readGitState',
    'localHead',
    'same-suite evidence',
    'built server smoke report',
    'assertCurrentGitState',
    'current HEAD',
    'browser presence must prove observer-side movement',
    'responsive gameplay must cover the required nine-viewport matrix',
    'responsive gameplay must cover /play and /embed',
    'parent-iframe input ownership',
    'Mochirii site iframe status',
    'responsive gameplay must cover the Mochirii site iframe across all viewports when configured',
    'browser/visual sequence evidence',
    'summarizeBrowserVisualSequence',
    'visual snapshot canvas PNG must be non-empty',
    'visual review must keep rendered prompt interaction as a manual pre-RC gate',
    'Wallet Daemon local check must stay no-cost and metadata-only',
    'built server smoke must not activate the legacy fallback',
    'local-only'
  ]);
  requireFileIncludes('game.report-hygiene-script', 'Report hygiene scans ignored local reports and generated no-secret handoff artifacts for accidental secret leakage.', 'scripts/check-alpha-report-hygiene.mjs', [
    'No-secret hygiene scan',
    'alpha-report-hygiene.json',
    'alpha-operator-checklist.json',
    'alpha-provider-preflight.json',
    'alpha-responsive-gameplay.json',
    'wallet-daemon-local.json',
    'mochi-social-alpha-operator-next-steps.md',
    'mochi-social-alpha-provider-preflight.md',
    'mochi-social-alpha-sync-approval.md',
    'Unredacted local suite token',
    'Wallet daemon password assignment',
    'Supabase service role assignment'
  ]);
  requireFileIncludes('game.sync-approval-script', 'Sync approval packet summarizes local branch drift and external gates before cost-sensitive provider work.', 'scripts/write-alpha-sync-approval.mjs', [
    'mochi-social-alpha-sync-approval.md',
    'alpha-sync-approval.json',
    'This file is intentionally no-secret',
    'approvalsRequired',
    'approvalActions',
    'costRisk',
    'noCostAlternative',
    'Cost-Sensitive Action Matrix',
    'Verified Milestone Deploy Queue',
    'fly-verified-milestone-deploy',
    'vercel-verified-milestone-deploy',
    'GitHub Actions/PR checks',
    'Proceed with public-repo sync'
  ]);
  requireFileIncludes('game.operator-checklist-script', 'Operator checklist writes no-secret Markdown and current Git-state JSON evidence for handoff freshness.', 'scripts/write-alpha-operator-checklist.mjs', [
    'mochi-social-alpha-operator-next-steps.md',
    'alpha-operator-checklist.json',
    'providerActionQueue',
    'buildProviderActionQueue',
    'Provider Action Queue',
    'Alpha Preview Ready',
    'preview-live-gates',
    'funded-chain-gates',
    'github-site-branch-sync',
    'fly-funded-chain-secret-update',
    'fly-verified-milestone-deploy',
    'vercel-verified-milestone-deploy',
    'approvalText',
    'noCostFallback',
    'readGitState',
    'localHead',
    'alpha:responsive-gameplay',
    'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL',
    'No-cost rule',
    'noCostRule'
  ]);
  requireFileIncludes('game.provider-preflight-script', 'Provider preflight writes no-secret expected private-input filenames and approval queue evidence without reading private file contents.', 'scripts/write-alpha-provider-preflight.mjs', [
    'mochi-social-alpha-provider-preflight.md',
    'alpha-provider-preflight.json',
    'contentsRead: false',
    'providerActionQueue',
    'missingExpectedPrivateInputFiles',
    'does not read private credential file contents',
    'github-branch-sync',
    'github-site-branch-sync',
    'fly-secret-update',
    'fly-funded-chain-secret-update',
    'fly-live-game-contract',
    'Verified Milestone Deploy Queue',
    'fly-verified-milestone-deploy',
    'vercel-verified-milestone-deploy',
    'vercel-supabase-preview-contract',
    'enjin-canary-readiness'
  ]);
  requireFileIncludes('game.external-gates-script', 'External gate report records Git state and refuses hosted Fly/Vercel contract fetches without explicit hosted-check approval.', 'scripts/check-alpha-external-gates.mjs', [
    'MOCHI_SOCIAL_EXTERNAL_ALLOW_HOSTED_CHECKS',
    'previewFlySecrets',
    'fundedChainFlySecrets',
    'preview-live-gates',
    'funded-chain-gates',
    'summarizeGateLanes',
    'hostedChecksAllowed',
    'readGitState',
    'localHead',
    'requiresHostedApproval',
    'Hosted game contract checks require explicit approval'
  ]);
  requireFileIncludes('game.local-ledger-writer', 'Local fallback ledger rows are versioned, Preview Ready scoped, and no-real-value.', 'apps/game/src/entries/express.ts', [
    'ledgerVersion: 1',
    "source: 'local-alpha-ledger'",
    "alphaStopPoint: 'alpha-preview-ready'",
    'noRealValue: true',
    'receivedAt: new Date().toISOString()'
  ]);
  requireFileIncludes('game.browser-presence', 'Two-tab browser presence smoke verifies the Unity canvas, bridge surface, legacy HUD absence, and shared-room pulse.', 'scripts/check-alpha-browser-presence.mjs', [
    'Unity WebGL two-tab room smoke',
    'single-shared-room',
    "sharedPetKey === 'lirabao'",
    'unityWebglBuild?.present === true',
    'legacyFallback?.active === false',
    'inspectBridgeSurface',
    'hasCreateUnityInstance',
    'hasUnityCanvas',
    'assertLegacyHudAbsent',
    'data-alpha-action="market.fixed_list"',
    'data-alpha-action="trade.direct_offer"',
    'data-alpha-action^="chain."',
    'Second tab did not observe the local two-tab movement pulse.',
    'MOCHI_SOCIAL_BROWSER_ALLOW_HOSTED_SMOKE',
    'reports/alpha-browser-presence.json',
    'canvasMovement',
    'changedAfterFirstTabMove',
    'ArrowLeft',
    'createHash',
    'canvas'
  ]);
  requireFileIncludes('game.visual-snapshot', 'Visual snapshot captures ignored local page/canvas PNGs for first-screen review and blocks hosted snapshots by default.', 'scripts/check-alpha-visual-snapshot.mjs', [
    'playwright-core',
    'alpha-visual-snapshot.json',
    'alpha-visual-page.png',
    'alpha-visual-canvas.png',
    'MOCHI_SOCIAL_VISUAL_ALLOW_HOSTED_SNAPSHOT',
    'local-only by default',
    'manualReview',
    'createHash',
    'canvas'
  ]);
  requireFileIncludes('game.responsive-gameplay', 'Responsive gameplay smoke verifies /play, /embed, and parent-iframe input ownership across the alpha viewport matrix.', 'scripts/check-alpha-responsive-gameplay.mjs', [
    'playwright-core',
    'alpha-responsive-gameplay.json',
    'reports/responsive-gameplay',
    'MOCHI_SOCIAL_RESPONSIVE_ALLOW_HOSTED_SMOKE',
    'MOCHI_SOCIAL_RESPONSIVE_SITE_BASE_URL',
    'MOCHI_SOCIAL_TESTER_PASSWORD',
    'MOCHI_SOCIAL_RESPONSIVE_REQUIRE_SITE_IFRAME',
    '/games/mochi-social',
    'local-only by default',
    'viewports',
    '1920',
    '390',
    '/play',
    '/embed',
    'parent iframe',
    'siteIframeResults',
    'movementKeys',
    'interactionKeys',
    'legacyInteractionKeys',
    'gameplayKeys',
    'ArrowDown',
    'Space',
    'Enter',
    'Spacebar',
    'horizontalOverflow',
    'criticalRects',
    'legacyHits',
    'legacy RPGJS HUD selectors are present',
    'parentBefore',
    'parentAfter',
    'assertScrollUnchanged',
    'verifyInputOwnership',
    'legacy interaction key',
    'editable element'
  ]);
  requireFileIncludes('game.visual-review', 'Visual review bundle ties first-screen screenshots, two-tab room evidence, Lirabao contract, and absence of legacy player UI to current HEAD.', 'scripts/check-alpha-visual-review.mjs', [
    'alpha-visual-review.json',
    'alpha-visual-review.md',
    'readGitState',
    'manualPromptGate',
    'pending-human-review',
    'observerMovement',
    'Unity shared-room alpha',
    'legacyHudAbsent',
    'futureEconomyTextPresent === false',
    'single-shared-room',
    'lirabao',
    'Lirabao',
    'legacyFallback?.active === false',
    'No future economy copy'
  ]);
  requireFileIncludes('game.manual-prompt-review-script', 'Manual prompt review gate records operator confirmation for Unity character creation, Lirabao care, and saved progress prompts.', 'scripts/write-alpha-manual-prompt-review.mjs', [
    'alpha-manual-prompt-review.json',
    'alpha-manual-prompt-review.md',
    'pending-human-review',
    'MOCHI_SOCIAL_MANUAL_PROMPT_CHARACTER_CREATE_OK',
    'MOCHI_SOCIAL_MANUAL_PROMPT_LIRABAO_CARE_OK',
    'MOCHI_SOCIAL_MANUAL_PROMPT_SAVED_PROGRESS_OK',
    'MOCHI_SOCIAL_MANUAL_PROMPT_REVIEWER',
    'MOCHI_SOCIAL_MANUAL_PROMPT_BROWSER',
    'MOCHI_SOCIAL_MANUAL_PROMPT_ALLOW_HOSTED',
    'Unity WebGL',
    'JadeLanternRoom',
    'Create your character',
    'E Care  |  Q Wave',
    'character.v1',
    'room:jade-lantern-room/sharedPet.v1',
    'visualArtifacts',
    'Visual Review Evidence Bundle',
    'alpha-visual-page.png',
    'alpha-visual-canvas.png'
  ]);
  requireFileIncludes('game.wallet-daemon-local-check', 'Wallet Daemon local check verifies only binary metadata and help output without importing wallets, printing seeds, starting signers, or contacting Enjin.', 'scripts/check-wallet-daemon-local.mjs', [
    'wallet-daemon-local.json',
    'wallet-daemon-local.md',
    'No-cost local Wallet Daemon binary check',
    'never runs wallet-daemon import',
    'never runs wallet-daemon print-seed',
    'never starts a long-running signer process',
    'never contacts Enjin Platform',
    'MOCHI_SOCIAL_WALLET_DAEMON_PATH',
    'MOCHI_SOCIAL_WALLET_DAEMON_REQUIRED',
    'sha256'
  ]);
  requireFileIncludes('game.manifest-unity-contract-test', 'Manifest test proves the website iframe contract is Unity WebGL, single-room, Lirabao-only, curated, and free of market/trade/cashout exports.', 'apps/game/tests/manifest.test.ts', [
    'publishes the Unity WebGL shared-room contract for the website iframe',
    "engine: 'unity-webgl'",
    "mode: 'single-shared-room'",
    'capacity: 25',
    "sharedPetKey: 'lirabao'",
    "playerCharacterKey: 'character.v1'",
    "sharedPetKey: 'room:jade-lantern-room/sharedPet.v1'",
    "presetIds: ['jade_wayfarer', 'lotus_guardian', 'lantern_scholar']",
    'avatarUploads: false',
    "not.toMatch(/\\b(?:market|trade|cashout)\\b/i)"
  ]);
  requireFileIncludes('game.unity-editmode-tests', 'Unity EditMode tests prove JadeLanternRoom wiring, curated presets, bridge parsing, saved-state DTOs, and shared Lirabao states.', 'unity/Assets/MochiSocial/Tests/EditMode/MochiSocialContractTests.cs', [
    'SharedRoomContractMatchesWebsitePlan',
    'JadeLanternRoomSceneContainsAlphaRuntimeWiring',
    'MochiAvatarPrefabIsNetworkedAndPlayerControllable',
    'CharacterPresetCatalogAllowsOnlyCuratedPresets',
    'BridgeParsesWebsiteNestedAuthPayload',
    'UnityAuthEnvelopeMatchesSupabaseBrokerShape',
    'SharedPetCareUsesCareReceivedState',
    'SharedPetWaveUsesHappyState',
    'SharedPetUnavailableStateIsValid',
    'SharedPetStaleReloadStateIsValidAndKeepsRevision',
    'SharedPetRejectsUnknownStateNames'
  ]);
  requireFileIncludes('game.unity-playmode-tests', 'Unity PlayMode tests prove Lirabao interactions stay authoritative, stale revisions reload cleanly, and avatars reject invalid preset state.', 'unity/Assets/MochiSocial/Tests/PlayMode/MochiSocialPlayModeTests.cs', [
    'LirabaoCareInteractionRequestsCloudCodeWithoutMutatingState',
    'LirabaoRejectsConflictingInteractionRevision',
    'LirabaoRejectsInvalidInteractionIntent',
    'LirabaoShowsUnavailableAndStaleReloadStates',
    'AvatarAppliesCuratedCharacterAppearanceBeforeNetworkSpawn',
    'AvatarRejectsInvalidCharacterPresetState'
  ]);
  requireFileIncludes('game.unity-verify-runner', 'Unity verifier runs EditMode, PlayMode, and WebGL build checks through the installed Unity editor.', 'scripts/run-unity.mjs', [
    "['test-editmode'",
    "['test-playmode'",
    "['build-webgl'",
    'runUnityTests',
    'runBatch',
    'BuildWebGL',
    'result="Passed"',
    'failed="0"'
  ]);
  requireFileIncludes('game.acceptance-docs', 'Alpha acceptance docs name every local and preview gate.', 'docs/alpha-acceptance.md', [
    'alpha:local-acceptance',
    'alpha:load-smoke',
    'alpha:browser-presence',
    'alpha:responsive-gameplay',
    'alpha:enjin-operator-smoke',
    'alpha:external-gates',
    'alpha:operator-checklist',
    'Alpha Preview Ready',
    'preview-live-gates',
    'funded-chain-gates',
    'Funded-chain work is deferred'
  ]);
  requireFileIncludes('game.alpha-preview-ready-docs', 'Alpha Preview docs describe the player-facing shared-room playtest and rollback behavior.', 'docs/alpha-preview-ready.md', [
    'Mochi Social Alpha Preview',
    'shared Mochirii room',
    'create a curated character',
    'meet Lirabao',
    'care for the guild pet together',
    'tester password',
    'Mochirii member sign-in',
    'All progress has no real value',
    'There is only one shared room',
    'old room should not silently open'
  ]);
  requireFileIncludes('game.preview-live-ops-docs', 'Operator docs prioritize Preview Ready and leave funded-chain gates red until real Canary funding/proof approval.', 'docs/alpha-operator-handoff.md', [
    'Alpha Preview Ready',
    'Alpha RC Ready',
    'preview-live-gates',
    'funded-chain-gates',
    'deferred and absent from the player-facing alpha',
    'Do not set dummy'
  ]);
  requireFileIncludes('game.preview-live-integration-docs', 'Site integration docs allow preview embedding with funded-chain work deferred and no dummy Enjin IDs.', 'docs/site-integration.md', [
    'Alpha Preview Ready Contract',
    'funded-chain work remains deferred',
    'Do not set dummy',
    'preview-live-gates',
    'funded-chain-gates'
  ]);
}

function addSiteRequirements() {
  if (!existsSync(siteRepoPath)) {
    add('site.repo', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`);
    return;
  }

  requireSiteFileIncludes('site.route', 'Mochirii preview route embeds Mochi Social behind auth, allowlist, terms, and feedback UI.', 'apps/web/components/mochi-social/MochiSocialAlphaClient.tsx', [
    'NEXT_PUBLIC_MOCHI_SOCIAL_URL',
    'MOCHI_SOCIAL_AUTH',
    'resolveMochiSocialBridgeMessage',
    'Alpha allowlist required',
    'Alpha acknowledgement',
    'submitMochiSocialFeedback'
  ]);
  requireSiteFileIncludes('site.bridge-helper', 'Mochirii bridge helper resolves game postMessage replies without exposing secrets or arbitrary status text.', 'apps/web/lib/mochi-social/bridge.ts', [
    'resolveMochiSocialBridgeMessage',
    'MOCHI_SOCIAL_READY',
    'MOCHI_SOCIAL_AUTH_STATE',
    'MOCHI_SOCIAL_ERROR',
    'MOCHI_SOCIAL_AUTH_BRIDGE_ERROR_MESSAGE',
    'return { action: "ignore" }'
  ]);
  requireSiteFileIncludes('site.bridge-state-self-test', 'Mochirii repo locally self-tests bridge READY, AUTH_STATE, ERROR, malformed-message, and no-secret handling before manual browser gates.', 'scripts/check-mochi-social-bridge-state.mjs', [
    'Mochi Social bridge state self-test OK',
    'MOCHI_SOCIAL_READY',
    'MOCHI_SOCIAL_AUTH_STATE',
    'MOCHI_SOCIAL_ERROR',
    'access-token-only',
    'assertNoForbiddenMaterial'
  ]);
  requireSiteFileIncludes('site.auth-bridge-check', 'Mochirii auth bridge guard keeps iframe auth access-token-only and verifies the shared bridge resolver is wired into the preview client.', 'scripts/check-mochi-social-auth-bridge.mjs', [
    'payload: { accessToken: token }',
    'resolveMochiSocialBridgeMessage(event.data)',
    'MOCHI_SOCIAL_AUTH_BRIDGE_ERROR_MESSAGE',
    'refreshToken',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENJIN_PLATFORM_TOKEN'
  ]);
  requireSiteFileIncludes('site.admin', 'Leader dashboard exposes alpha grant, revoke, and audit controls.', 'apps/web/components/member-workflow/LeaderDashboard.tsx', [
    'Mochi Social Alpha',
    'Grant alpha access',
    'Revoke alpha access',
    'AlphaAuditPanel'
  ]);
  requireSiteFileIncludes('site.edge-functions', 'Mochirii Supabase config owns all alpha Edge Functions.', 'supabase/config.toml', [
    'mochi-social-alpha-session',
    'mochi-social-alpha-action',
    'mochi-social-alpha-progress',
    'mochi-social-alpha-admin',
    'submit-mochi-social-feedback'
  ]);
  requireSiteFileIncludes('site.schema', 'Mochirii migration owns member allowlist, terms, feedback, progress snapshots, and alpha audit rows for the closed shared-room playtest.', 'supabase/migrations/20260610090000_add_mochi_social_alpha.sql', [
    'mochi_social_alpha_testers',
    'mochi_social_terms_acknowledgements',
    'mochi_social_profiles',
    'mochi_social_feedback',
    'mochi_social_progress_snapshots',
    'mochi_social_ledger_events',
    'alter table public.mochi_social_alpha_testers enable row level security',
    'mochi_social_alpha_testers_read_own',
    'mochi_social_feedback_insert_own'
  ]);
  requireSiteFileIncludes('site.schema-grants', 'Mochirii migration makes alpha table access explicit for authenticated members and trusted Edge Functions without exposing future market or trade tables.', 'supabase/migrations/20260622204823_add_mochi_social_alpha_explicit_grants.sql', [
    'grant select on table public.mochi_social_alpha_testers to authenticated',
    'grant select on table public.mochi_social_terms_acknowledgements to authenticated',
    'grant select, insert, update on table public.mochi_social_profiles to authenticated',
    'grant select on table public.mochi_social_progress_snapshots to authenticated',
    'grant insert on table public.mochi_social_feedback to authenticated',
    'grant select, insert, update, delete on table public.mochi_social_alpha_testers to service_role',
    'grant select, insert, update, delete on table public.mochi_social_ledger_events to service_role',
    'grant select, insert, update, delete on table public.mochi_social_progress_snapshots to service_role',
    'grant select, insert, update, delete on table public.mochi_social_feedback to service_role'
  ]);
  requireSiteFileIncludes('site.unity-schema', 'Mochirii migration owns Unity player mapping and the latest shared Lirabao audit mirror with explicit authenticated reads, service-role writes, and RLS policies.', 'supabase/migrations/20260621120000_add_mochi_social_unity_room.sql', [
    'mochi_social_unity_players',
    'mochi_social_shared_pet_snapshots',
    "check (custom_id like 'mochirii:%')",
    "check (room_key = 'jade-lantern-room-alpha')",
    "check (pet_key = 'lirabao')",
    "check (jsonb_typeof(state) = 'object')",
    'alter table public.mochi_social_unity_players enable row level security',
    'alter table public.mochi_social_shared_pet_snapshots enable row level security',
    'grant select on public.mochi_social_unity_players to authenticated',
    'grant select on public.mochi_social_shared_pet_snapshots to authenticated',
    'grant select, insert, update, delete on public.mochi_social_unity_players to service_role',
    'grant select, insert, update, delete on public.mochi_social_shared_pet_snapshots to service_role',
    'mochi_social_unity_players_read_own',
    'mochi_social_shared_pet_read_authenticated'
  ]);
  requireSiteFileIncludes('site.action-finality', 'Mochirii action Edge Function gates allowlist/terms, idempotent Unity actions, progress snapshots, and shared Lirabao mirrors.', 'supabase/functions/mochi-social-alpha-action/index.ts', [
    'alphaAccess(adminClient, playerId)',
    'upsertAlphaProgressSnapshot(adminClient',
    'alpha_terms_required',
    '"unity.character.created"',
    '"unity.character.updated"',
    '"unity.pet.interaction"',
    '"unity.pet.state_saved"',
    '"unity.room.joined"',
    '"unity.room.left"',
    'recordSharedPetState',
    'upsertSharedPetSnapshot(adminClient',
    'noRealValue: true'
  ]);
  requireSiteFileIncludes('site.edge-authority-check', 'Mochirii repo has a local authority guard for the alpha action Edge Function.', 'scripts/check-mochi-social-edge-authority.mjs', [
    'MOCHI_SOCIAL_GAME_SERVER_TOKEN',
    'x-mochi-social-server-token',
    'mochi_social_ledger_events',
    'noRealValue: true',
    'unity.pet.state_saved',
    '"market.fixed_list"',
    'must not accept ${forbiddenAction}',
    'UNITY_ROOM_KEY = "jade-lantern-room-alpha"',
    'UNITY_SHARED_PET_KEY = "lirabao"',
    'upsertSharedPetSnapshot',
    'invalid_unity_custom_id',
    'Mochi Social Edge authority check passed'
  ]);
  requireSiteFileIncludes('site.progress-authority', 'Mochirii progress Edge Function loads account-linked alpha snapshots behind the game server token.', 'supabase/functions/mochi-social-alpha-progress/index.ts', [
    'requireGameServer(req)',
    'alphaAccess(adminClient, playerId)',
    'loadAlphaProgressSnapshot(adminClient, playerId)',
    'normalizeAlphaProgressSnapshot(data)'
  ]);
  requireSiteFileIncludes('site.preview-key-loader-self-test', 'Mochirii repo locally self-tests preview publishable-key loading without leaking key values before hosted Edge smoke.', 'scripts/check-mochi-social-preview-key-loader.mjs', [
    'MOCHI_SOCIAL_ALPHA_EDGE_PUBLISHABLE_KEY_FILE',
    'not-loaded-awaiting-hosted-approval',
    'publishableKeyPresent === true',
    'publishableKeySource',
    'assertNoLeak',
    'Mochi Social preview publishable-key loader self-test OK'
  ]);
  requireSiteFileIncludes('site.preview-url-self-test', 'Mochirii repo locally self-tests preview URL tracking without leaking unrelated local credential lines before hosted preview checks.', 'scripts/check-mochi-social-preview-url-self-test.mjs', [
    'Mochi Social preview URL self-test OK',
    'mochi-social-alpha-vercel-preview.local.txt',
    'MOCHI_SOCIAL_GAME_URL',
    'MOCHI_SOCIAL_SITE_PREVIEW_URL',
    'Local no-secret preview URL file',
    '## Local Preview URL File',
    'assertNoLeak',
    'fakeToken'
  ]);
  requireSiteFileIncludes('site.browser-gate-writer', 'Mochirii repo can persist no-secret manual Chrome browser-gate evidence for later Preview Ready audits.', 'scripts/write-mochi-social-browser-gates.mjs', [
    'Mochi Social browser gate evidence passed',
    'reports/mochi-social-browser-gates.json',
    'reports/mochi-social-browser-gates.md',
    'mochirii-mochi-social-browser-gates.md',
    'MOCHI_SOCIAL_SITE_BROWSER_GATES_ALLOW_HOSTED',
    'MOCHI_SOCIAL_SITE_BROWSER_GATES_NOTES',
    'assertNoForbiddenMaterial',
    'wallet\\.seed'
  ]);
  requireSiteFileIncludes('site.checklist', 'Mochirii repo can generate its no-secret website-side operator checklist.', 'scripts/prepare-mochi-social-alpha-operator-checklist.mjs', [
    'mochirii-mochi-social-alpha-operator-next-steps.md',
    'MOCHI_SOCIAL_PREVIEW_ENV_FILE',
    'Local no-secret preview URL file',
    'readPreviewEnvFile',
    'NEXT_PUBLIC_MOCHI_SOCIAL_URL',
    'MOCHI_SOCIAL_ALPHA_EDGE_URL',
    'MOCHI_SOCIAL_GAME_SERVER_TOKEN'
  ]);
  requireSiteFileIncludes('site.preview-ready-audit', 'Mochirii repo can audit the website tester-entry Preview Ready lane without requiring funded-chain gates.', 'scripts/check-mochi-social-preview-ready.mjs', [
    'Mochirii Mochi Social Alpha Preview Ready audit',
    'reports/mochi-social-preview-ready.json',
    'mochirii-mochi-social-preview-ready.md',
    'MOCHI_SOCIAL_SITE_PREVIEW_READY_ALLOW_HOSTED',
    'MOCHI_SOCIAL_SITE_PREVIEW_READY_SKIP_SELF_TEST_COMMANDS',
    'MOCHI_SOCIAL_PREVIEW_ENV_FILE',
    'Local Preview URL File',
    'readPreviewEnvFile',
    'MOCHI_SOCIAL_SITE_BROWSER_GATES_JSON',
    'addStoredManualBrowserGateRequirement',
    'stored browser gate report',
    'MOCHI_SOCIAL_SITE_REPORT_HYGIENE_JSON',
    'site.report-hygiene',
    'check:mochi-social-report-hygiene',
    'urlFieldsRead',
    'site.bridge-state',
    'check-mochi-social-bridge-state.mjs',
    'site.auth-bridge',
    'check-mochi-social-auth-bridge.mjs',
    'site.preview-key-loader',
    'check-mochi-social-preview-key-loader.mjs',
    'site.discord-oauth-detector',
    'check-mochi-social-discord-oauth-self-test.mjs',
    'site.edge-authority',
    'check-mochi-social-edge-authority.mjs',
    'site.game-contract',
    'site.edge-smoke',
    'site.discord-oauth',
    'site.manual-browser-gates',
    'site.branch-sync',
    'site.game-preview-ready'
  ]);
  requireSiteFileIncludes('site.discord-oauth-self-test', 'Mochirii repo locally self-tests Discord OAuth provider readiness detection before hosted checks.', 'scripts/check-mochi-social-discord-oauth-self-test.mjs', [
    'Mochi Social Discord OAuth provider self-test OK',
    'Unsupported provider: provider is not enabled',
    'site.discord-oauth',
    'discord.com',
    'MOCHI_SOCIAL_ALPHA_AUTH_URL'
  ]);
  requireSiteFileIncludes('site.browser-gate-self-test', 'Mochirii repo locally self-tests env and stored-report manual browser-gate evidence before a hosted Chrome pass.', 'scripts/check-mochi-social-browser-gate-self-test.mjs', [
    'Mochi Social browser gate self-test OK',
    'write-mochi-social-browser-gates.mjs',
    'stored browser gate report',
    'site.manual-browser-gates',
    'hosted browser gate confirmation requires',
    'fakeToken'
  ]);
  requireSiteFileIncludes('site.report-hygiene-check', 'Mochirii repo scans ignored Mochi Social site reports and no-secret handoff files for accidental secret material.', 'scripts/check-mochi-social-report-hygiene.mjs', [
    'Mochi Social report hygiene OK',
    'reports/mochi-social-report-hygiene.json',
    'reports/mochi-social-report-hygiene.md',
    'mochirii-mochi-social-alpha-operator-next-steps.md',
    'mochirii-mochi-social-preview-ready.md',
    'mochirii-mochi-social-browser-gates.md',
    'No secret values were printed',
    'Wallet seed file reference'
  ]);
  requireSiteFileIncludes('site.alpha-preview-docs', 'Mochirii alpha docs use player-facing shared-room wording for the closed playtest.', 'docs/mochi-social-alpha.md', [
    'closed Mochirii playtest',
    'one shared 3D guild room',
    'create a curated',
    'meet Lirabao',
    'care for the guild pet together',
    'tester password',
    'Saved play requires Mochirii member sign-in',
    'All alpha progress has no real value',
    'Avatar uploads, multiple rooms',
    'mobile-specific play are not part',
    'Do not open the page publicly during alpha'
  ]);
  requireSiteFileIncludes('site.alpha-preview-ops-docs', 'Mochirii maintainer ops runbook keeps website/Supabase work focused on the password-gated Unity shared-room alpha and no-cost boundaries.', 'docs/mochi-social-alpha-maintainer-ops.md', [
    'Alpha Preview Ready Lane',
    'tester password wall',
    'one shared room',
    'curated character presets',
    'Lirabao pet',
    'no market',
    'no trade',
    'no paid assets',
    'Do not set dummy IDs or fake readiness flags',
    'prepare:mochi-social-browser-gates',
    'check:mochi-social-report-hygiene',
    'check:mochi-social-game-contract',
    'check:mochi-social-tester-password-gate'
  ]);
}

function addSitePreviewReadyReportRequirements() {
  const sitePreviewReportPath = resolve(siteRepoPath, process.env.MOCHI_SOCIAL_SITE_PREVIEW_READY_JSON || 'reports/mochi-social-preview-ready.json');
  const sitePreviewReport = readJson(sitePreviewReportPath);
  if (!sitePreviewReport.ok) {
    add('site.preview-ready-report', 'fail', `Mochirii Preview Ready report is missing or invalid: ${sitePreviewReport.message}. Run npm run check:mochi-social-preview-ready in the Mochirii repo after approved hosted/browser checks.`, {
      path: sitePreviewReportPath
    });
    return;
  }

  const report = sitePreviewReport.data;
  const failures = [];
  if (report.ok !== true) {
    const failing = Array.isArray(report.requirements)
      ? report.requirements.filter((item) => item.status !== 'pass').map((item) => item.id).join(', ')
      : 'requirements missing';
    failures.push(`site Preview Ready report is not ok${failing ? `: ${failing}` : ''}`);
  }
  failures.push(...currentGitStateFailuresForRepo(siteRepoPath, report.git, 'site Preview Ready report'));
  failures.push(...currentGitStateFailuresForRepo(root, report.gameGit, 'site Preview Ready game snapshot'));
  if (report.hostedChecksAllowed !== true && report.ok === true) {
    failures.push('site Preview Ready cannot pass hosted gates without explicit hosted-check approval');
  }
  if (hasHostedUrl(report.gameUrl) && report.hostedChecksAllowed !== true && report.ok === true) {
    failures.push('site Preview Ready hosted game contract cannot pass without hosted-check approval');
  }
  if (hasHostedUrl(report.siteOrigin) && report.hostedChecksAllowed !== true && report.ok === true) {
    failures.push('site Preview Ready hosted site browser gates cannot pass without hosted-check approval');
  }

  add(
    'site.preview-ready-report',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Mochirii Preview Ready report is incomplete: ${failures.join(', ')}.`
      : 'Mochirii Preview Ready report is green, current, and backed by approved hosted/browser evidence.',
    {
      reportPath: sitePreviewReportPath,
      checkedAt: report.checkedAt,
      hostedChecksAllowed: report.hostedChecksAllowed,
      reportHead: report.git?.localHead,
      gameReportHead: report.gameGit?.localHead,
      failures
    }
  );
}

function addProviderGateRequirements() {
  const externalReportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
  const externalReport = readJson(externalReportPath);
  if (!externalReport.ok) {
    add('provider.external-gates', 'fail', `External gate report is missing or invalid: ${externalReport.message}.`, { path: externalReportPath });
    return;
  }
  const report = externalReport.data;
  const previewLane = report.lanes?.previewLive;
  const fundedLane = report.lanes?.fundedChain;
  const failures = Array.isArray(previewLane?.failingChecks)
    ? [...previewLane.failingChecks]
    : ['preview-live-gates summary missing'];
  const unverified = Array.isArray(previewLane?.unverifiedChecks)
    ? [...previewLane.unverifiedChecks]
    : [];
  const deferredFundedChain = Array.isArray(fundedLane?.failingChecks)
    ? [...fundedLane.failingChecks]
    : [];
  const deferredFundedChainUnverified = Array.isArray(fundedLane?.unverifiedChecks)
    ? [...fundedLane.unverifiedChecks]
    : [];
  failures.push(...currentGitStateFailures(report.git, 'external gate report'));
  if (typeof report.hostedChecksAllowed !== 'boolean') {
    failures.push('external gate report must include hostedChecksAllowed');
  }
  if (!report.lanes?.alphaPreviewReady || typeof report.lanes.alphaPreviewReady.ok !== 'boolean') {
    failures.push('external gate report must include alphaPreviewReady lane status');
  }
  if (hasHostedUrl(report.gameUrl) && report.hostedChecksAllowed !== true && report.ok === true) {
    failures.push('hosted game contract cannot pass without explicit hosted-check approval');
  }
  if (hasHostedUrl(report.sitePreviewUrl) && report.hostedChecksAllowed !== true && report.ok === true) {
    failures.push('hosted site contract cannot pass without explicit hosted-check approval');
  }
  add(report.ok === true ? 'provider.external-gates' : 'provider.external-gates',
    report.lanes?.alphaPreviewReady?.ok === true && failures.length === 0 ? 'pass' : 'fail',
    report.lanes?.alphaPreviewReady?.ok === true && failures.length === 0
      ? 'Preview live gates passed; funded-chain gates remain deferred for the no-real-value alpha.'
      : `Preview live gates still incomplete: ${failures.join(', ')}.`,
    {
      reportPath: externalReportPath,
      checkedAt: report.checkedAt,
      hostedChecksAllowed: report.hostedChecksAllowed,
      reportHead: report.git?.localHead,
      failingChecks: failures,
      unverifiedChecks: unverified,
      deferredFundedChainChecks: deferredFundedChain,
      deferredFundedChainUnverified
    });
}

function addLocalEvidenceRequirements() {
  const evidenceReportPath = resolve(root, process.env.MOCHI_SOCIAL_LOCAL_EVIDENCE_JSON || 'reports/alpha-local-evidence.json');
  const evidenceReport = readJson(evidenceReportPath);
  if (!evidenceReport.ok) {
    add('local.evidence-summary', 'fail', `Local evidence summary is missing or invalid: ${evidenceReport.message}. Run npm run alpha:local-suite, then npm run alpha:local-evidence.`, { path: evidenceReportPath });
    return;
  }

  const report = evidenceReport.data;
  const failures = Array.isArray(report.failures) ? report.failures : ['failures array missing'];
  failures.push(...currentGitStateFailures(report.git, 'local evidence summary'));
  add(
    'local.evidence-summary',
    report.ok === true && failures.length === 0 ? 'pass' : 'fail',
    report.ok === true && failures.length === 0
      ? 'Local no-secret evidence summary passed for localhost suite, browser, visual, load, built-server, and operator reports.'
      : `Local evidence summary still has failures: ${failures.join(', ')}.`,
    {
      reportPath: evidenceReportPath,
      checkedAt: report.checkedAt,
      failures
    }
  );
}

function addReportHygieneRequirements() {
  const hygieneReportPath = resolve(root, process.env.MOCHI_SOCIAL_REPORT_HYGIENE_JSON || 'reports/alpha-report-hygiene.json');
  const hygieneReport = readJson(hygieneReportPath);
  if (!hygieneReport.ok) {
    add('local.report-hygiene', 'fail', `Local report hygiene summary is missing or invalid: ${hygieneReport.message}. Run npm run alpha:local-evidence, npm run alpha:operator-checklist, then npm run alpha:report-hygiene.`, { path: hygieneReportPath });
    return;
  }

  const report = hygieneReport.data;
  const failures = Array.isArray(report.failures) ? report.failures : ['failures array missing'];
  failures.push(...currentGitStateFailures(report.git, 'report hygiene report'));
  add(
    'local.report-hygiene',
    report.ok === true && failures.length === 0 ? 'pass' : 'fail',
    report.ok === true && failures.length === 0
      ? 'Local report hygiene passed for ignored reports and generated no-secret handoff artifacts.'
      : `Local report hygiene still has failures: ${failures.join(', ')}.`,
    {
      reportPath: hygieneReportPath,
      checkedAt: report.checkedAt,
      scanned: report.scanned,
      failures
    }
  );
}

function addBranchInventoryRequirements() {
  const inventoryReportPath = resolve(root, process.env.MOCHI_SOCIAL_BRANCH_INVENTORY_JSON || 'reports/alpha-branch-inventory.json');
  const inventoryReport = readJson(inventoryReportPath);
  if (!inventoryReport.ok) {
    add('local.branch-inventory-current', 'fail', `Branch inventory report is missing or invalid: ${inventoryReport.message}. Run npm run alpha:branch-inventory.`, { path: inventoryReportPath });
    return;
  }

  const report = inventoryReport.data;
  const failures = Array.isArray(report.failures) ? [...report.failures] : ['failures array missing'];
  failures.push(...currentGitStateFailures(report.git, 'branch inventory report'));
  if (report.ok !== true) failures.push('branch inventory report is not ok');
  if (report.deletionPerformed !== false) failures.push('branch inventory must remain no-destructive');

  const repos = Array.isArray(report.repos) ? report.repos : [];
  const branchInventoryWarnings = [];
  for (const id of ['game', 'site']) {
    const repo = repos.find((entry) => entry?.id === id);
    if (!repo) {
      failures.push(`branch inventory missing ${id} repo entry`);
      continue;
    }
    if (repo.exists !== true) failures.push(`branch inventory ${id} repo must exist`);
    if (repo.ok !== true) failures.push(`branch inventory ${id} repo entry is not ok`);
    if (!repo.openPrRepository) failures.push(`branch inventory ${id} repo must record origin GitHub repository`);
    if (repo.openPrStatus !== 'checked') {
      const hasCleanupCandidates = Array.isArray(repo.cleanupCandidates) && repo.cleanupCandidates.length > 0;
      const message = `branch inventory ${id} repo open PR status is ${repo.openPrStatus || 'missing'}`;
      if (hasCleanupCandidates) {
        failures.push(message);
      } else {
        branchInventoryWarnings.push(message);
      }
    }
    if (!Array.isArray(repo.branches)) failures.push(`branch inventory ${id} repo branches list is missing`);
    if (!Array.isArray(repo.cleanupCandidates)) failures.push(`branch inventory ${id} repo cleanupCandidates list is missing`);
  }

  const cleanupCandidateCount = repos.reduce((total, repo) => total + (Array.isArray(repo?.cleanupCandidates) ? repo.cleanupCandidates.length : 0), 0);
  add(
    'local.branch-inventory-current',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Branch inventory report is stale or incomplete: ${failures.join(', ')}.`
      : 'Branch inventory report is current, origin-scoped, no-destructive, and records local-safe cleanup candidates.',
    {
      reportPath: inventoryReportPath,
      checkedAt: report.checkedAt,
      deletionPerformed: report.deletionPerformed,
      cleanupCandidateCount,
      repos: repos.map((repo) => ({
        id: repo.id,
        openPrRepository: repo.openPrRepository,
        openPrStatus: repo.openPrStatus,
        branchCount: repo.branchCount,
        cleanupCandidates: Array.isArray(repo.cleanupCandidates) ? repo.cleanupCandidates.length : null
      })),
      warnings: branchInventoryWarnings,
      failures
    }
  );
}

function addOperatorChecklistRequirements() {
  const operatorReportPath = resolve(root, process.env.MOCHI_SOCIAL_OPERATOR_CHECKLIST_JSON || 'reports/alpha-operator-checklist.json');
  const operatorReport = readJson(operatorReportPath);
  if (!operatorReport.ok) {
    add('local.operator-checklist-current', 'fail', `Operator checklist report is missing or invalid: ${operatorReport.message}. Run npm run alpha:operator-checklist.`, { path: operatorReportPath });
    return;
  }

  const report = operatorReport.data;
  const failures = [];
  if (report.ok !== true) failures.push('operator checklist report is not ok');
  failures.push(...currentGitStateFailures(report.git, 'operator checklist report'));
  failures.push(...currentGitStateFailuresForRepo(siteRepoPath, report.siteGit, 'operator checklist site snapshot'));
  if (!String(report.markdownPath || '').includes('mochi-social-alpha-operator-next-steps.md')) {
    failures.push('operator checklist report must point to the generated Markdown checklist');
  }
  if (!String(report.noCostRule || '').includes('Public-repo commits and pushes are allowed')) {
    failures.push('operator checklist report must include the public-repo push policy');
  }
  if (!report.externalGateSummary || typeof report.externalGateSummary !== 'object') {
    failures.push('operator checklist report must include the latest external gate summary');
  }
  const queue = Array.isArray(report.providerActionQueue) ? report.providerActionQueue : [];
  const requiredQueueIds = expectedProviderQueueIds(report.git, report.externalGateSummary?.failures || []);
  for (const id of requiredQueueIds) {
    if (!queue.some((item) => item?.id === id)) {
      failures.push(`operator checklist provider action queue missing ${id}`);
    }
  }
  for (const field of ['provider', 'title', 'blocker', 'approvalText', 'noCostFallback']) {
    if (queue.some((item) => !item?.[field])) {
      failures.push(`operator checklist provider action queue missing ${field}`);
    }
  }

  add(
    'local.operator-checklist-current',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Operator checklist report is stale or incomplete: ${failures.join(', ')}.`
      : 'Operator checklist report matches current local branch state and keeps no-secret handoff evidence current.',
    {
      reportPath: operatorReportPath,
      generatedAt: report.generatedAt,
      markdownPath: report.markdownPath,
      reportHead: report.git?.localHead,
      reportUpstream: report.git?.upstream,
      reportDirtyFiles: Array.isArray(report.git?.dirty) ? report.git.dirty.length : null,
      reportSiteHead: report.siteGit?.localHead,
      externalGatePresent: report.externalGateSummary?.present,
      providerActionQueueIds: queue.map((item) => item?.id).filter(Boolean),
      failures
    }
  );
}

function addProviderPreflightRequirements() {
  const preflightReportPath = resolve(root, process.env.MOCHI_SOCIAL_PROVIDER_PREFLIGHT_JSON || 'reports/alpha-provider-preflight.json');
  const preflightReport = readJson(preflightReportPath);
  if (!preflightReport.ok) {
    add('local.provider-preflight-current', 'fail', `Provider preflight report is missing or invalid: ${preflightReport.message}. Run npm run alpha:provider-preflight.`, { path: preflightReportPath });
    return;
  }

  const report = preflightReport.data;
  const failures = [];
  if (report.ok !== true) failures.push('provider preflight report is not ok');
  failures.push(...currentGitStateFailures(report.git, 'provider preflight report'));
  failures.push(...currentGitStateFailuresForRepo(siteRepoPath, report.sources?.operatorChecklist?.siteGit, 'provider preflight operator checklist site snapshot'));
  failures.push(...currentGitStateFailuresForRepo(siteRepoPath, report.sources?.syncApproval?.siteGit, 'provider preflight sync approval site snapshot'));
  if (!String(report.markdownPath || '').includes('mochi-social-alpha-provider-preflight.md')) {
    failures.push('provider preflight report must point to the generated Markdown preflight');
  }
  if (!String(report.noCostBoundary || '').includes('Preflight checks filenames')) {
    failures.push('provider preflight report must include the no-cost boundary');
  }
  const queue = Array.isArray(report.providerActionQueue) ? report.providerActionQueue : [];
  const requiredQueueIds = expectedProviderQueueIds(report.git, report.externalFailures || []);
  for (const id of requiredQueueIds) {
    if (!queue.some((item) => item?.id === id)) {
      failures.push(`provider preflight queue missing ${id}`);
    }
  }
  if (!Array.isArray(report.privateInputs) || report.privateInputs.some((input) => input?.contentsRead !== false)) {
    failures.push('provider preflight private inputs must record contentsRead=false');
  }

  add(
    'local.provider-preflight-current',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Provider preflight report is stale or incomplete: ${failures.join(', ')}.`
      : 'Provider preflight report matches current local branch state and records no-secret private-input filenames plus approval queue evidence.',
    {
      reportPath: preflightReportPath,
      generatedAt: report.generatedAt,
      markdownPath: report.markdownPath,
      reportHead: report.git?.localHead,
      operatorChecklistSiteHead: report.sources?.operatorChecklist?.siteGit?.localHead,
      syncApprovalSiteHead: report.sources?.syncApproval?.siteGit?.localHead,
      providerActionQueueIds: queue.map((item) => item?.id).filter(Boolean),
      missingExpectedPrivateInputFiles: report.missingExpectedPrivateInputFiles,
      failures
    }
  );
}

function currentGitStateFailures(gitState, label) {
  return currentGitStateFailuresForRepo(root, gitState, label);
}

function currentGitStateFailuresForRepo(repoPath, gitState, label) {
  const failures = [];
  const head = commandAt(repoPath, 'git', ['rev-parse', 'HEAD']);
  const upstream = commandAt(repoPath, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(repoPath, 'git', ['status', '--porcelain']);
  if (!gitState) failures.push(`${label} must include git state`);
  if (!head.ok) failures.push('current local HEAD could not be read');
  if (!upstream.ok) failures.push('current upstream could not be read');
  if (!worktree.ok) failures.push('current worktree status could not be read');
  if (!gitState || !head.ok || !upstream.ok || !worktree.ok) return failures;

  const currentHead = firstLine(head.stdout);
  const currentUpstream = firstLine(upstream.stdout);
  const currentDirty = worktree.stdout.split(/\r?\n/).filter(Boolean);
  if (gitState.localHead !== currentHead) failures.push(`${label} localHead does not match current HEAD`);
  if (gitState.upstream !== currentUpstream) failures.push(`${label} upstream does not match current upstream`);
  if (!Array.isArray(gitState.dirty) || gitState.dirty.length !== currentDirty.length) {
    failures.push(`${label} dirty state does not match current worktree`);
  }
  return failures;
}

function expectedProviderQueueIds(gitState, failures) {
  const ids = [];
  const messages = Array.isArray(failures) ? failures.map((failure) => String(failure || '')) : [];
  const hasFailure = (needle) => messages.some((message) => message.includes(needle));
  const hasFailurePrefix = (prefix) => messages.some((message) => message.startsWith(prefix));

  if ((Number(gitState?.ahead) || 0) > 0 || (Array.isArray(gitState?.dirty) && gitState.dirty.length > 0)) {
    ids.push('github-branch-sync');
  }
  const siteState = readSiteGitStateForQueue();
  if ((Number(siteState?.ahead) || 0) > 0 || (Array.isArray(siteState?.dirty) && siteState.dirty.length > 0)) {
    ids.push('github-site-branch-sync');
  }
  if (hasFailurePrefix('Fly secret names:')) ids.push('fly-secret-update');
  if (hasFailure('Fly preview secret names')) ids.push('fly-secret-update');
  if (hasFailure('Fly funded-chain secret names')) ids.push('fly-funded-chain-secret-update');
  if (hasFailure('Live game URL')) ids.push('fly-live-game-url');
  if (hasFailure('Live game contract')) ids.push('fly-live-game-contract');
  if (hasFailure('Site preview contract')) ids.push('vercel-supabase-preview-contract');
  if (hasFailure('Enjin Canary operator readiness')) ids.push('enjin-canary-readiness');

  return ids;
}

function readSiteGitStateForQueue() {
  if (!existsSync(siteRepoPath)) return null;
  const branch = commandAt(siteRepoPath, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const upstream = commandAt(siteRepoPath, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(siteRepoPath, 'git', ['status', '--porcelain']);
  if (!branch.ok || !upstream.ok || !worktree.ok) return null;
  const counts = commandAt(siteRepoPath, 'git', ['rev-list', '--left-right', '--count', `${firstLine(upstream.stdout)}...HEAD`]);
  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);
  return {
    branch: firstLine(branch.stdout),
    upstream: firstLine(upstream.stdout),
    ahead: counts.ok ? Number.parseInt(aheadText, 10) || 0 : 0,
    behind: counts.ok ? Number.parseInt(behindText, 10) || 0 : 0,
    dirty: worktree.stdout.split(/\r?\n/).filter(Boolean)
  };
}

function hasHostedUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(String(value));
    return !['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function addSyncApprovalRequirements() {
  const syncReportPath = resolve(root, process.env.MOCHI_SOCIAL_SYNC_APPROVAL_JSON || 'reports/alpha-sync-approval.json');
  const syncReport = readJson(syncReportPath);
  if (!syncReport.ok) {
    add('local.sync-approval-current', 'fail', `Sync approval report is missing or invalid: ${syncReport.message}. Run npm run alpha:sync-approval.`, { path: syncReportPath });
    return;
  }

  const report = syncReport.data;
  const head = commandAt(root, 'git', ['rev-parse', 'HEAD']);
  const upstream = commandAt(root, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(root, 'git', ['status', '--porcelain']);
  const failures = [];

  if (report.ok !== true) failures.push('sync approval report is not ok');
  if (!head.ok) failures.push('current local HEAD could not be read');
  if (!upstream.ok) failures.push('current upstream could not be read');
  if (!worktree.ok) failures.push('current worktree status could not be read');

  const currentHead = firstLine(head.stdout);
  const currentUpstream = firstLine(upstream.stdout);
  const currentDirty = worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line));

  if (head.ok && report.git?.localHead !== currentHead) failures.push('sync approval report localHead does not match current HEAD');
  if (upstream.ok && report.git?.upstream !== currentUpstream) failures.push('sync approval report upstream does not match current upstream');
  if (Array.isArray(report.git?.dirty) && report.git.dirty.length !== currentDirty.length) failures.push('sync approval report dirty state does not match current worktree');
  failures.push(...currentGitStateFailuresForRepo(siteRepoPath, report.siteGit, 'sync approval site snapshot'));
  failures.push(...currentGitStateFailures(report.audit?.git, 'sync approval audit snapshot'));
  failures.push(...syncExternalGateSnapshotFailures(report));
  if (!Array.isArray(report.approvalActions) || report.approvalActions.length < 5) failures.push('sync approval report must include provider approval actions');
  for (const field of ['costRisk', 'noCostAlternative', 'approvalText']) {
    if (!Array.isArray(report.approvalActions) || report.approvalActions.some((action) => !action?.[field])) {
      failures.push(`sync approval report approvalActions missing ${field}`);
    }
  }

  add(
    'local.sync-approval-current',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Sync approval packet is stale or incomplete: ${failures.join(', ')}.`
      : 'Sync approval packet matches current local branch state and includes cost-aware provider approval actions.',
    {
      reportPath: syncReportPath,
      generatedAt: report.generatedAt,
      currentHead,
      reportHead: report.git?.localHead,
      currentUpstream,
      reportUpstream: report.git?.upstream,
      reportSiteHead: report.siteGit?.localHead,
      currentDirtyFiles: currentDirty.length,
      reportDirtyFiles: Array.isArray(report.git?.dirty) ? report.git.dirty.length : null,
      approvalActionCount: Array.isArray(report.approvalActions) ? report.approvalActions.length : 0,
      auditCheckedAt: report.audit?.checkedAt,
      externalGateCheckedAt: report.externalGates?.checkedAt,
      failures
    }
  );
}

function addManualPromptReviewRequirements() {
  const promptReportPath = resolve(root, process.env.MOCHI_SOCIAL_MANUAL_PROMPT_REVIEW_JSON || 'reports/alpha-manual-prompt-review.json');
  const promptReport = readJson(promptReportPath);
  if (!promptReport.ok) {
    add('local.manual-prompt-review', 'fail', `Manual prompt review report is missing or invalid: ${promptReport.message}. Run npm run alpha:manual-prompt-review after local Unity character, Lirabao, and saved-progress review.`, { path: promptReportPath });
    return;
  }

  const report = promptReport.data;
  const failures = Array.isArray(report.failures) ? [...report.failures] : ['failures array missing'];
  const gitFailures = currentGitStateFailures(report.git, 'manual prompt review report');
  const sourceEvidence = manualPromptSourceEvidence(report);
  failures.push(...(sourceEvidence.matchesCurrentSource
    ? gitFailures.filter((failure) => !failure.includes('localHead does not match current HEAD'))
    : gitFailures
  ));
  if (!sourceEvidence.matchesCurrentSource) failures.push(...sourceEvidence.failures);
  if (report.ok !== true) failures.push('manual prompt review report is not ok');
  if (report.review?.status !== 'completed') failures.push(`manual prompt review status is ${report.review?.status || 'missing'}`);
  if (hasHostedUrl(report.review?.url) && report.review?.hostedAllowed !== true) {
    failures.push('hosted manual prompt review requires explicit hosted approval flag');
  }
  failures.push(...manualPromptReviewContextFailures(report.reviewContext, report.review?.url, report.review?.hostedAllowed === true));
  const checks = Array.isArray(report.checks) ? report.checks : [];
  for (const id of ['character-creation', 'lirabao-care', 'saved-progress']) {
    const check = checks.find((entry) => entry.id === id);
    if (!check?.ok) failures.push(`manual prompt review missing confirmation for ${id}`);
  }
  if (!report.review?.reviewer) failures.push('manual prompt review must record reviewer');
  if (!report.review?.browser) failures.push('manual prompt review must record browser');
  if (!report.review?.url) failures.push('manual prompt review must record reviewed URL');

  add(
    'local.manual-prompt-review',
    failures.length ? 'fail' : 'pass',
    failures.length
      ? `Manual Unity prompt review is incomplete: ${failures.join(', ')}.`
      : 'Manual Unity character, Lirabao care, and saved-progress review is complete and current.',
    {
      reportPath: promptReportPath,
      checkedAt: report.checkedAt,
      status: report.review?.status,
      url: report.review?.url,
      hostedAllowed: report.review?.hostedAllowed,
      completedChecks: report.completedChecks,
      pendingChecks: report.pendingChecks,
      sourceEvidence,
      reviewContext: summarizeManualPromptReviewContext(report.reviewContext),
      failures
    }
  );
}

function manualPromptReviewContextFailures(context, reviewUrl, hostedAllowed) {
  const failures = [];
  if (!context || typeof context !== 'object') {
    return ['manual prompt review must include review context'];
  }

  if (context.requiresSignedInTester !== true) failures.push('manual prompt review must require a signed-in tester');
  if (context.passwordOnlyIsInsufficient !== true) failures.push('manual prompt review must mark password-only access insufficient');
  if (context.requiresUnityAuthTokens !== true) failures.push('manual prompt review must require Unity auth tokens');
  if (context.requiresSharedPetAuthorityPath !== true) failures.push('manual prompt review must require the shared Lirabao authority path');
  if (context.localVisualOnlyIsInsufficient !== true) failures.push('manual prompt review must mark visual-only evidence insufficient');

  const reviewUrlIsHosted = hasHostedUrl(reviewUrl);
  if (reviewUrl && context.hostedUrl !== reviewUrlIsHosted) {
    failures.push('manual prompt review hosted URL context does not match reviewed URL');
  }
  if (context.hostedAllowed !== hostedAllowed) {
    failures.push('manual prompt review hosted approval context does not match review approval flag');
  }

  const preconditions = Array.isArray(context.completionPreconditions) ? context.completionPreconditions.join('\n') : '';
  const insufficient = Array.isArray(context.cannotBeCompletedBy) ? context.cannotBeCompletedBy.join('\n') : '';
  for (const snippet of [
    'allowlisted tester',
    'character.v1',
    'room:jade-lantern-room/sharedPet.v1',
    'reload/logout/login'
  ]) {
    if (!preconditions.includes(snippet)) failures.push(`manual prompt review context missing precondition: ${snippet}`);
  }
  for (const snippet of [
    'visual screenshots alone',
    'password wall alone',
    'legacy runtime',
    'static/mock token path',
    'hosted URL without explicit hosted-preview approval'
  ]) {
    if (!insufficient.includes(snippet)) failures.push(`manual prompt review context missing insufficiency: ${snippet}`);
  }
  return failures;
}

function summarizeManualPromptReviewContext(context) {
  if (!context || typeof context !== 'object') return null;
  return {
    reviewKind: sanitize(context.reviewKind || ''),
    requiresSignedInTester: context.requiresSignedInTester === true,
    passwordOnlyIsInsufficient: context.passwordOnlyIsInsufficient === true,
    requiresUnityAuthTokens: context.requiresUnityAuthTokens === true,
    requiresSharedPetAuthorityPath: context.requiresSharedPetAuthorityPath === true,
    localVisualOnlyIsInsufficient: context.localVisualOnlyIsInsufficient === true,
    hostedUrl: context.hostedUrl === true,
    hostedAllowed: context.hostedAllowed === true,
    completionPreconditions: sanitizeStringArray(context.completionPreconditions),
    cannotBeCompletedBy: sanitizeStringArray(context.cannotBeCompletedBy)
  };
}

function sanitizeStringArray(values) {
  return Array.isArray(values) ? values.map((value) => sanitize(value)).filter(Boolean).slice(0, 12) : [];
}

function manualPromptSourceEvidence(report) {
  const expected = Array.isArray(report?.sourceEvidence?.files)
    ? report.sourceEvidence.files.map((entry) => ({
        label: entry.id || entry.path,
        path: resolve(root, entry.path || ''),
        expectedHash: entry.sha256
      }))
    : [
        {
          label: 'eventSource',
          path: resolve(root, 'apps/game/src/modules/main/event.ts'),
          expectedHash: report?.sourceEvidence?.eventSource?.sha256
        },
        {
          label: 'mapServerSource',
          path: resolve(root, 'apps/game/src/modules/main/server.ts'),
          expectedHash: report?.sourceEvidence?.mapServerSource?.sha256
        }
      ];
  const failures = [];
  const files = expected.map((entry) => {
    const currentHash = fileSha256(entry.path);
    if (!entry.expectedHash) failures.push(`${entry.label} hash is missing from manual prompt review report`);
    if (!currentHash) failures.push(`${entry.label} source file is missing`);
    if (entry.expectedHash && currentHash && entry.expectedHash !== currentHash) {
      failures.push(`${entry.label} source hash changed since manual prompt review`);
    }
    return {
      label: entry.label,
      path: pathForReport(entry.path),
      matches: Boolean(entry.expectedHash && currentHash && entry.expectedHash === currentHash)
    };
  });
  return {
    matchesCurrentSource: failures.length === 0,
    files,
    failures
  };
}

function fileSha256(file) {
  if (!existsSync(file)) return '';
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function syncExternalGateSnapshotFailures(syncReport) {
  const failures = [];
  const externalReportPath = resolve(root, process.env.MOCHI_SOCIAL_EXTERNAL_GATES_REPORT || 'reports/alpha-external-gates.json');
  const externalReport = readJson(externalReportPath);
  if (!externalReport.ok) {
    failures.push(`external gate report is missing or invalid while checking sync approval: ${externalReport.message}`);
    return failures;
  }
  const currentExternal = externalReport.data;
  if (syncReport.externalGates?.checkedAt !== currentExternal.checkedAt) {
    failures.push('sync approval external gate snapshot does not match current external gate report checkedAt');
  }
  if (syncReport.externalGates?.hostedChecksAllowed !== currentExternal.hostedChecksAllowed) {
    failures.push('sync approval external gate hostedChecksAllowed does not match current external gate report');
  }
  if (syncReport.externalGates?.git?.localHead !== currentExternal.git?.localHead) {
    failures.push('sync approval external gate git head does not match current external gate report');
  }
  return failures;
}

async function addPrRequirements() {
  await checkPr('github.game-pr', 'xartaiusx/mochi-social', process.env.MOCHI_SOCIAL_GAME_PR_NUMBER || '', 'Verify Mochi Social', root);
  await checkPr('github.site-pr', 'Mochirii-Wushu/Mochirii', process.env.MOCHI_SOCIAL_SITE_PR_NUMBER || '', undefined, siteRepoPath);
}

function addLocalBranchRequirements() {
  addGitBranchSyncRequirement('github.local-branch-sync', root, 'Local game branch');
}

function addSiteBranchRequirements() {
  if (!existsSync(siteRepoPath)) {
    add('github.site-local-branch-sync', 'fail', `Mochirii site repo was not found at ${siteRepoPath}.`, { path: siteRepoPath });
    return;
  }
  addGitBranchSyncRequirement('github.site-local-branch-sync', siteRepoPath, 'Local Mochirii site branch');
}

function addGitBranchSyncRequirement(id, cwd, label) {
  const branch = commandAt(cwd, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = commandAt(cwd, 'git', ['rev-parse', 'HEAD']);
  const upstream = commandAt(cwd, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(cwd, 'git', ['status', '--porcelain']);
  const baseEvidence = {
    path: cwd,
    branch: firstLine(branch.stdout),
    localHead: firstLine(head.stdout),
    upstream: firstLine(upstream.stdout)
  };

  if (!branch.ok || !head.ok || !upstream.ok || !worktree.ok) {
    add(id, 'unverified', `${label} Git branch/upstream state could not be verified.`, {
      ...baseEvidence,
      branchError: sanitize(branch.stderr),
      headError: sanitize(head.stderr),
      upstreamError: sanitize(upstream.stderr),
      worktreeError: sanitize(worktree.stderr)
    });
    return;
  }

  const counts = commandAt(cwd, 'git', ['rev-list', '--left-right', '--count', `${baseEvidence.upstream}...HEAD`]);
  if (!counts.ok) {
    add(id, 'unverified', `${label} ahead/behind count could not be verified.`, {
      ...baseEvidence,
      stderr: sanitize(counts.stderr)
    });
    return;
  }

  const [behindText = '0', aheadText = '0'] = firstLine(counts.stdout).split(/\s+/);
  const behind = Number.parseInt(behindText, 10);
  const ahead = Number.parseInt(aheadText, 10);
  const dirtyStatus = worktree.stdout.split(/\r?\n/).filter(Boolean).map((line) => sanitize(line));
  const ok = Number.isFinite(ahead) && Number.isFinite(behind) && ahead === 0 && behind === 0 && dirtyStatus.length === 0;

  add(
    id,
    ok ? 'pass' : 'fail',
    ok
      ? `${label} matches upstream and the worktree is clean, so remote PR checks apply to this source.`
      : `${label} differs from upstream or has local changes; remote PR checks do not prove this source.`,
    {
      ...baseEvidence,
      ahead,
      behind,
      dirtyFiles: dirtyStatus.length,
      dirtyStatus: dirtyStatus.slice(0, 20)
    }
  );
}

function addLocalHandoffRequirements() {
  requireLocalFile('handoff.game-checklist', resolve(credsDir, 'mochi-social-alpha-operator-next-steps.md'), [
    'This file is intentionally no-secret',
    'Provider Action Queue',
    'Exact approval needed',
    'No-cost fallback',
    'Fly Gate',
    'Enjin Canary Gate',
    'Alpha Preview Verification After Preview Gates',
    'Funded Alpha RC Verification After Enjin Gates'
  ]);
  requireLocalFile('handoff.provider-preflight', resolve(credsDir, 'mochi-social-alpha-provider-preflight.md'), [
    'This file is intentionally no-secret',
    'Expected Private Input Filenames',
    'Approval Queue',
    'does not read private credential file contents'
  ]);
  requireLocalFile('handoff.sync-approval', resolve(credsDir, 'mochi-social-alpha-sync-approval.md'), [
    'This file is intentionally no-secret',
    'Current Branch',
    'Approval Required Before Continuing',
    'Cost-Sensitive Action Matrix',
    'No-cost alternative',
    'Proceed with public-repo sync'
  ]);
  requireLocalFile('handoff.site-checklist', resolve(credsDir, 'mochirii-mochi-social-alpha-operator-next-steps.md'), [
    'This file is intentionally no-secret',
    'Vercel Preview Gate',
    'Local no-secret preview URL file',
    'mochi-social-alpha-vercel-preview.local.txt',
    'Supabase Preview Gate',
    'Manual Website Gates'
  ]);
}

function requireFileIncludes(id, description, file, snippets) {
  requireTextIncludes(id, description, resolve(root, file), snippets, file);
}

function requireSiteFileIncludes(id, description, file, snippets) {
  requireTextIncludes(id, description, resolve(siteRepoPath, file), snippets, `Mochirii/${file}`);
}

function requireLocalFile(id, file, snippets) {
  requireTextIncludes(id, `${id} exists and contains no-secret operator handoff sections.`, file, snippets, file);
}

function requireTextIncludes(id, description, file, snippets, label) {
  if (!existsSync(file)) {
    add(id, 'fail', `${description} Missing file: ${label}.`, { file: label });
    return;
  }
  const text = readFileSync(file, 'utf8');
  const missing = snippets.filter((snippet) => !text.includes(snippet));
  add(id, missing.length ? 'fail' : 'pass',
    missing.length ? `${description} Missing snippets: ${missing.join(', ')}.` : description,
    { file: label, missing });
}

async function checkPr(id, repo, pr, requiredCheckName, localRepoPath) {
  const localState = localRepoPath ? readPrLocalGitState(localRepoPath) : null;
  const selector = String(pr || '').trim();
  const query = selector || localState?.branch || '';
  if (!query) {
    add(id, 'unverified', 'Current branch could not be resolved for GitHub PR verification.', { repo, localState });
    return;
  }

  const result = selector
    ? command(resolveGh(), ['pr', 'view', selector, '--repo', repo, '--json', 'number,url,state,headRefName,headRefOid,mergeStateStatus,statusCheckRollup,isDraft'])
    : command(resolveGh(), ['pr', 'list', '--repo', repo, '--head', query, '--state', 'open', '--limit', '5', '--json', 'number,url,state,headRefName,headRefOid,mergeStateStatus,statusCheckRollup,isDraft']);
  const localEvidence = result.ok
    ? null
    : readLocalPullRequestEvidence(repo, query, localState?.localHead || '');
  const fallback = result.ok
    ? null
    : localEvidence?.ok
      ? localEvidence
      : await readPublicPullRequest(repo, query, localState?.localHead || '');
  if (!result.ok && !fallback?.ok) {
    add(id, 'unverified', 'GitHub PR state could not be read from this shell or the public GitHub API.', {
      repo,
      selector: query,
      stderr: sanitize(result.stderr),
      localEvidenceError: sanitize(localEvidence?.message || ''),
      fallbackError: sanitize(fallback?.message || '')
    });
    return;
  }
  const parsed = result.ok ? parseJson(result.stdout) : fallback.data;
  const data = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!data) {
    add(id, 'fail', selector ? 'GitHub PR JSON could not be parsed.' : `No open GitHub PR was found for current branch ${query}.`, { repo, selector: query, localState });
    return;
  }
  if (Array.isArray(parsed) && parsed.length > 1) {
    add(id, 'fail', `Multiple open GitHub PRs were found for current branch ${query}; set ${id === 'github.game-pr' ? 'MOCHI_SOCIAL_GAME_PR_NUMBER' : 'MOCHI_SOCIAL_SITE_PR_NUMBER'} to choose one.`, {
      repo,
      selector: query,
      prNumbers: parsed.map((entry) => entry.number).filter(Boolean)
    });
    return;
  }
  const checks = Array.isArray(data.statusCheckRollup) ? data.statusCheckRollup : [];
  const failing = checks.filter((check) => !['SUCCESS', 'PASS'].includes(String(check.conclusion || check.state || '').toUpperCase()));
  const required = requiredCheckName ? checks.find((check) => check.name === requiredCheckName || check.context === requiredCheckName) : true;
  const localHead = localState?.localHead || '';
  const localHeadMatchesPrHead = Boolean(localHead && data.headRefOid && localHead === data.headRefOid);
  const failures = [
    data.state === 'OPEN' ? '' : `PR state is ${data.state || 'unknown'}`,
    data.mergeStateStatus === 'CLEAN' || data.isDraft === true ? '' : `merge state is ${data.mergeStateStatus || 'unknown'} and PR is not draft`,
    localHead && data.headRefOid && !localHeadMatchesPrHead ? 'PR head does not match current local HEAD' : '',
    required ? '' : `missing required check ${requiredCheckName}`,
    ...failing.map((check) => `failing check ${check.name || check.context || 'unknown'}`)
  ].filter(Boolean);
  const mergeableOrDraft = data.mergeStateStatus === 'CLEAN' || data.isDraft === true;
  const ok = data.state === 'OPEN' && mergeableOrDraft && failing.length === 0 && Boolean(required) && !failures.length;
  add(id, ok ? 'pass' : 'fail', ok ? `${repo}#${data.number || query} is open, matches local HEAD, and has green checks${data.isDraft === true ? ' while draft' : ''}.` : failures.join('; '), {
    url: data.url,
    number: data.number,
    state: data.state,
    headRefName: data.headRefName,
    headRefOid: data.headRefOid,
    localBranch: localState?.branch,
    localHead,
    localHeadMatchesPrHead,
    isDraft: data.isDraft === true,
    mergeStateStatus: data.mergeStateStatus,
    checks: checks.map((check) => check.name || check.context).filter(Boolean),
    failingChecks: failing.map((check) => check.name || check.context).filter(Boolean),
    source: result.ok ? 'gh' : data.evidenceSource || 'github-public-api'
  });
}

function readPrLocalGitState(cwd) {
  const branch = commandAt(cwd, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = commandAt(cwd, 'git', ['rev-parse', 'HEAD']);
  return {
    branch: branch.ok ? firstLine(branch.stdout) : '',
    localHead: head.ok ? firstLine(head.stdout) : '',
    errors: [branch, head].filter((result) => !result.ok).map((result) => sanitize(result.stderr || result.error || 'git command failed'))
  };
}

function add(id, status, message, evidence = {}) {
  requirements.push({ id, status, message, evidence });
}

function readGitState() {
  const branch = commandAt(root, 'git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const localHead = commandAt(root, 'git', ['rev-parse', 'HEAD']);
  const upstream = commandAt(root, 'git', ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const worktree = commandAt(root, 'git', ['status', '--porcelain']);
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

function summarize(items) {
  return {
    total: items.length,
    passed: items.filter((item) => item.status === 'pass').length,
    failed: items.filter((item) => item.status === 'fail').length,
    unverified: items.filter((item) => item.status === 'unverified').length
  };
}

function readJson(file) {
  if (!existsSync(file)) return { ok: false, message: 'not found' };
  try {
    return { ok: true, data: JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return { ok: false, message: 'parse failed' };
  }
}

function command(commandName, args) {
  return commandAt(root, commandName, args);
}

function commandAt(cwd, commandName, args) {
  const result = spawnSync(commandName, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
    shell: false
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || ''
  };
}

function resolveGh() {
  if (process.env.GH_CLI_PATH) return process.env.GH_CLI_PATH;
  return process.platform === 'win32' ? 'gh.exe' : 'gh';
}

function parseJson(text) {
  try {
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}

function defaultCredsDir() {
  if (process.env.USERPROFILE) return resolve(process.env.USERPROFILE, 'Desktop', 'Creds');
  if (process.env.HOME) return resolve(process.env.HOME, 'Desktop', 'Creds');
  return resolve(root, '.local', 'creds');
}

function pathForReport(file) {
  return String(file || '').startsWith(root)
    ? String(file).slice(root.length + 1).replace(/\\/g, '/')
    : String(file || '').replace(/\\/g, '/');
}

function sanitize(value) {
  return String(value || '')
    .replace(/\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}\b/g, '<redacted-github-token>')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{8,}\b/g, '<redacted-supabase-secret>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '<redacted-jwt>')
    .slice(0, 1000);
}
