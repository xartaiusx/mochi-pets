import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const sharedRoomParams = {
  roomSessionId: 'jade-lantern-room-alpha',
  sharedPetKey: 'lirabao',
  stateKey: 'room:jade-lantern-room/sharedPet.v1'
};
const projectId = 'local-cloud-code-contract-project';
const validActorId = '00000000-0000-4000-8000-000000000010';

await run();

async function run() {
  await verifiesLoadBootstrapsSharedLirabao();
  await verifiesInteractAppliesAuthoritativeCare();
  await verifiesRevisionConflictAndInvalidIntent();
  await verifiesSupabaseMirrorPayloadAndFailOpenBehavior();
  console.log('Mochi Social Unity Cloud Code contract check passed.');
}

async function verifiesLoadBootstrapsSharedLirabao() {
  const harness = createHarness('unity/Assets/MochiSocial/CloudCode/mochiSocialLoadSharedPet.js');
  const state = await harness.handler({
    params: sharedRoomParams,
    context: { projectId },
    logger: harness.logger
  });

  assertValidSharedPetState(state, 'bootstrapped shared pet');
  assert(state.petId === 'lirabao', 'load function must bootstrap Lirabao only.');
  assert(state.state === 'idle', 'load function must bootstrap idle state.');
  assert(state.revision === 0, 'load function must bootstrap revision 0.');
  assert(state.writeLock === 'single-shared-room:0', 'load function must bootstrap the single-room write lock.');
  assert(harness.cloudSave.sets.length === 1, 'load function must persist the bootstrapped shared pet state.');
  assert(harness.cloudSave.sets[0].customItemId === 'room:jade-lantern-room', 'load function must use the shared room custom item.');
  assert(harness.cloudSave.sets[0].item.key === 'sharedPet.v1', 'load function must use the shared pet item key.');

  const wrongRoom = await expectRejects(() => harness.handler({
    params: { ...sharedRoomParams, roomSessionId: 'other-room' },
    context: { projectId },
    logger: harness.logger
  }));
  assert(wrongRoom.message === 'invalid_unity_room_pet', 'load function must reject non-Jade Lantern room params.');
}

async function verifiesInteractAppliesAuthoritativeCare() {
  const harness = createHarness('unity/Assets/MochiSocial/CloudCode/mochiSocialInteractSharedPet.js');
  harness.cloudSave.storeSharedPet(defaultSharedPetState());

  const state = await harness.handler({
    params: { ...sharedRoomParams, interactionType: 'care', expectedRevision: 0, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: null
  });

  assertValidSharedPetState(state, 'care interaction state');
  assert(state.state === 'care_received', 'care must set care_received state.');
  assert(state.mood === 'comforted', 'care must set comforted mood.');
  assert(state.careMeter === 58, `care must raise care meter to 58, got ${state.careMeter}.`);
  assert(state.bondTier === 3, `care must recompute bond tier to 3, got ${state.bondTier}.`);
  assert(state.revision === 1, `care must increment revision to 1, got ${state.revision}.`);
  assert(state.lastInteractionBy === validActorId, 'care must preserve the actor id.');
  assert(/^1:\d+$/.test(state.writeLock), 'care must update write lock with revision and timestamp.');

  const saved = harness.cloudSave.readSharedPet();
  assert(saved.revision === state.revision, 'care must save the next shared pet state.');
}

async function verifiesRevisionConflictAndInvalidIntent() {
  const harness = createHarness('unity/Assets/MochiSocial/CloudCode/mochiSocialInteractSharedPet.js');
  harness.cloudSave.storeSharedPet({ ...defaultSharedPetState(), revision: 4 });

  const conflict = await expectRejects(() => harness.handler({
    params: { ...sharedRoomParams, interactionType: 'care', expectedRevision: 3, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: null
  }));
  assert(conflict.message === 'shared_pet_revision_conflict', 'interact function must reject stale revisions.');
  assert(conflict.current?.revision === 4, 'stale revision error must expose the current shared pet state.');

  const invalid = await expectRejects(() => harness.handler({
    params: { ...sharedRoomParams, interactionType: 'upload-avatar', expectedRevision: 4, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: null
  }));
  assert(invalid.message === 'invalid_pet_interaction', 'interact function must reject non-curated pet intents.');

  const wrongPet = await expectRejects(() => harness.handler({
    params: { ...sharedRoomParams, sharedPetKey: 'other-pet', interactionType: 'care', expectedRevision: 4, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: null
  }));
  assert(wrongPet.message === 'invalid_unity_room_pet', 'interact function must reject non-Lirabao params.');
}

async function verifiesSupabaseMirrorPayloadAndFailOpenBehavior() {
  const harness = createHarness('unity/Assets/MochiSocial/CloudCode/mochiSocialInteractSharedPet.js');
  harness.cloudSave.storeSharedPet(defaultSharedPetState());
  harness.secretManager.set('MOCHI_SOCIAL_ALPHA_ACTION_URL', 'https://example.functions.supabase.co/mochi-social-alpha-action');
  harness.secretManager.set('MOCHI_SOCIAL_GAME_SERVER_TOKEN', 'local-server-token');

  const state = await harness.handler({
    params: { ...sharedRoomParams, interactionType: 'wave', expectedRevision: 0, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: harness.secretManager
  });

  assert(state.state === 'happy', 'wave must set happy state.');
  assert(harness.axios.posts.length === 1, 'valid actor interactions must mirror one Supabase audit event when configured.');
  const mirror = harness.axios.posts[0];
  assert(mirror.url === 'https://example.functions.supabase.co/mochi-social-alpha-action', 'mirror must post to the configured Edge Function URL.');
  assert(mirror.body.type === 'unity.pet.state_saved', 'mirror must use unity.pet.state_saved event type.');
  assert(mirror.body.playerId === validActorId, 'mirror must attribute the Supabase actor.');
  assert(mirror.body.payload.petKey === 'lirabao', 'mirror payload must use Lirabao key.');
  assert(mirror.body.payload.roomKey === 'jade-lantern-room-alpha', 'mirror payload must use Jade Lantern room key.');
  assert(mirror.body.payload.state.revision === 1, 'mirror payload must include the saved shared pet revision.');
  assert(mirror.options.headers['x-mochi-social-server-token'] === 'local-server-token', 'mirror must use only the server token header.');

  harness.cloudSave.storeSharedPet(defaultSharedPetState());
  harness.axios.failNext = true;
  const failOpenState = await harness.handler({
    params: { ...sharedRoomParams, interactionType: 'approach', expectedRevision: 0, actorId: validActorId },
    context: { projectId, playerId: validActorId },
    logger: harness.logger,
    secretManager: harness.secretManager
  });
  assert(failOpenState.state === 'approach', 'Supabase mirror failure must not block the UGS primary save.');
  assert(harness.logger.warns.some((message) => /audit mirror failed/i.test(message)), 'mirror failure must be logged without exposing secrets.');
}

function createHarness(relativePath) {
  const cloudSave = createCloudSaveHarness();
  const axios = createAxiosHarness();
  const logger = createLoggerHarness();
  const secretManager = createSecretManagerHarness();

  class DataApi {
    constructor(context) {
      this.context = context;
    }

    getCustomItems(project, customItemId, keys) {
      return cloudSave.getCustomItems(project, customItemId, keys);
    }

    setCustomItem(project, customItemId, item) {
      return cloudSave.setCustomItem(project, customItemId, item);
    }
  }

  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports,
    require(name) {
      if (name === '@unity-services/cloud-save-1.4') return { DataApi };
      if (name === 'axios-0.21') return axios;
      throw new Error(`Unexpected Cloud Code dependency: ${name}`);
    },
    console,
    Error,
    Math,
    Number,
    String,
    Date,
    JSON,
    RegExp,
    Set,
    Boolean
  };

  const code = readFileSync(resolve(root, relativePath), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: relativePath });
  assert(typeof module.exports === 'function', `${relativePath} must export a Cloud Code handler.`);
  return { handler: module.exports, cloudSave, axios, logger, secretManager };
}

function createCloudSaveHarness() {
  let value = null;
  return {
    sets: [],
    async getCustomItems(_projectId, customItemId, keys) {
      if (customItemId !== 'room:jade-lantern-room' || keys[0] !== 'sharedPet.v1') {
        throw new Error('Unexpected custom item lookup.');
      }

      return { data: { results: value === null ? [] : [{ key: 'sharedPet.v1', value }] } };
    },
    async setCustomItem(_projectId, customItemId, item) {
      this.sets.push({ customItemId, item });
      value = item.value;
      return { data: {} };
    },
    storeSharedPet(state) {
      value = JSON.stringify(state);
    },
    readSharedPet() {
      return value === null ? null : JSON.parse(value);
    }
  };
}

function createAxiosHarness() {
  return {
    posts: [],
    failNext: false,
    async post(url, body, options) {
      this.posts.push({ url, body, options });
      if (this.failNext) {
        this.failNext = false;
        throw new Error('mirror unavailable');
      }

      return { status: 200, data: { ok: true } };
    }
  };
}

function createLoggerHarness() {
  return {
    warns: [],
    warn(message) {
      this.warns.push(String(message));
    }
  };
}

function createSecretManagerHarness() {
  const values = new Map();
  return {
    set(name, value) {
      values.set(name, value);
    },
    async getSecret(name) {
      return { value: values.get(name) || '' };
    }
  };
}

function defaultSharedPetState() {
  return {
    version: 1,
    petId: 'lirabao',
    displayName: 'Lirabao',
    mood: 'curious',
    state: 'idle',
    careMeter: 50,
    bondTier: 1,
    lastInteractionUnixSeconds: 0,
    lastInteractionBy: null,
    revision: 0,
    writeLock: 'single-shared-room:0'
  };
}

function assertValidSharedPetState(state, label) {
  assert(state && typeof state === 'object', `${label} must be an object.`);
  assert(state.version === 1, `${label} must use version 1.`);
  assert(state.petId === 'lirabao', `${label} must be Lirabao.`);
  assert(['idle', 'approach', 'happy', 'care_received', 'stale_revision_reload', 'unavailable'].includes(state.state), `${label} has invalid state ${state.state}.`);
  assert(Number.isInteger(state.careMeter) && state.careMeter >= 0 && state.careMeter <= 100, `${label} care meter must be 0-100.`);
  assert(Number.isInteger(state.bondTier) && state.bondTier >= 1 && state.bondTier <= 5, `${label} bond tier must be 1-5.`);
  assert(Number.isInteger(state.revision) && state.revision >= 0, `${label} revision must be non-negative.`);
}

async function expectRejects(fn) {
  try {
    await fn();
  } catch (error) {
    return error;
  }

  throw new Error('Expected Cloud Code handler to reject.');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
