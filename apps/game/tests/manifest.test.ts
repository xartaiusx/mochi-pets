import { describe, expect, it } from 'vitest';
import { createGameManifest } from '../src/integration/manifest';

describe('game manifest', () => {
  it('publishes the Unity WebGL shared-room contract for the website iframe', () => {
    const manifest = createGameManifest('https://mochi-pets-game.fly.dev/');

    expect(manifest).toMatchObject({
      name: 'Mochi Pets',
      slug: 'mochi-pets',
      engine: 'unity-webgl',
      origin: 'https://mochi-pets-game.fly.dev',
      playUrl: 'https://mochi-pets-game.fly.dev/play',
      embedUrl: 'https://mochi-pets-game.fly.dev/embed',
      bridge: {
        protocolVersion: 1,
        namespace: 'MOCHI_PETS',
        parentToGame: ['MOCHI_PETS_AUTH', 'MOCHI_PETS_SIGN_OUT'],
        gameToParent: ['MOCHI_PETS_READY', 'MOCHI_PETS_AUTH_STATE', 'MOCHI_PETS_ERROR']
      },
      auth: {
        provider: 'supabase',
        mode: 'guest-first',
        tokenPolicy: 'access-token-only'
      },
      room: {
        key: 'jade-lantern-room-alpha',
        scene: 'JadeLanternRoom',
        mode: 'single-shared-room',
        capacity: 25,
        sharedPetKey: 'lirabao'
      },
      runtime: {
        realtimeAuthority: 'ugs-distributed-authority',
        sessionService: 'unity-multiplayer-services',
        authentication: 'unity-authentication-custom-id',
        playerState: 'ugs-cloud-save-player-data',
        sharedState: 'ugs-cloud-code-cloud-save-game-data',
        multiplayerHosting: 'not-used-v1'
      },
      state: {
        playerCharacterKey: 'character.v1',
        sharedPetKey: 'room:jade-lantern-room/sharedPet.v1',
        liveAvatarTransformsDurable: false,
        liveEmotesDurable: false
      },
      characterPresets: {
        mode: 'curated-presets',
        count: 3,
        avatarUploads: false,
        presetIds: ['jade_wayfarer', 'lotus_guardian', 'lantern_scholar']
      },
      sharedPet: {
        key: 'lirabao',
        universalStarter: true,
        stateAuthority: 'cloud-code-authoritative-save'
      },
      edgeFunctions: {
        unityAuth: 'mochi-pets-unity-auth'
      },
      avatarUploads: false,
      alpha: {
        allowlistRequired: true,
        termsRequired: true,
        noRealValue: true
      },
      alphaPreview: {
        providerMutationAllowedByDefault: false,
        fundedChainRequiredForPreview: false
      },
      ugc: 'curated',
      routes: {
        public: ['/healthz', '/play', '/embed', '/integration/game-manifest.json']
      },
      cleanRoom: {
        policy: 'project-authored-original-content-only',
        restrictedSourceReferences: false
      }
    });
    expect(manifest).not.toHaveProperty('market');
    expect(JSON.stringify(manifest)).not.toMatch(/\b(?:market|trade|cashout)\b/i);
  });
});
