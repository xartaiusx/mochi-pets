const { DataApi } = require("@unity-services/cloud-save-1.4");

const ROOM_SESSION_ID = "jade-lantern-room-alpha";
const ROOM_MODE = "single-shared-room";
const SHARED_PET_KEY = "lirabao";
const CUSTOM_ITEM_ID = "room:jade-lantern-room";
const SHARED_PET_ITEM_KEY = "sharedPet.v1";
const FULL_STATE_KEY = "room:jade-lantern-room/sharedPet.v1";

module.exports = async ({ params, context, logger }) => {
  assertSharedRoomParams(params);

  const cloudSaveApi = new DataApi(context);
  const current = await loadSharedPetState(cloudSaveApi, context.projectId, logger);
  if (isValidSharedPetState(current)) {
    return current;
  }

  const initial = defaultSharedPetState();
  await saveSharedPetState(cloudSaveApi, context.projectId, initial);
  return initial;
};

async function loadSharedPetState(cloudSaveApi, projectId, logger) {
  try {
    const response = await cloudSaveApi.getCustomItems(projectId, CUSTOM_ITEM_ID, [SHARED_PET_ITEM_KEY]);
    const value = response && response.data && response.data.results && response.data.results[0]
      ? response.data.results[0].value
      : null;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (error) {
    logger.warn("Shared Lirabao state was not found; bootstrapping default state.");
    return null;
  }
}

async function saveSharedPetState(cloudSaveApi, projectId, state) {
  await cloudSaveApi.setCustomItem(projectId, CUSTOM_ITEM_ID, {
    key: SHARED_PET_ITEM_KEY,
    value: JSON.stringify(state),
  });
}

function assertSharedRoomParams(params) {
  if (params.roomSessionId !== ROOM_SESSION_ID || params.sharedPetKey !== SHARED_PET_KEY || params.stateKey !== FULL_STATE_KEY) {
    throw Error("invalid_unity_room_pet");
  }
}

function defaultSharedPetState() {
  return {
    version: 1,
    petId: SHARED_PET_KEY,
    displayName: "Lirabao",
    mood: "curious",
    state: "idle",
    careMeter: 50,
    bondTier: 1,
    lastInteractionUnixSeconds: Math.floor(Date.now() / 1000),
    lastInteractionBy: null,
    revision: 0,
    writeLock: `${ROOM_MODE}:0`,
  };
}

function isValidSharedPetState(state) {
  return Boolean(
    state &&
    state.version === 1 &&
    state.petId === SHARED_PET_KEY &&
    typeof state.displayName === "string" &&
    Number.isInteger(state.careMeter) &&
    state.careMeter >= 0 &&
    state.careMeter <= 100 &&
    Number.isInteger(state.bondTier) &&
    state.bondTier >= 1 &&
    state.bondTier <= 5 &&
    Number.isInteger(state.revision) &&
    state.revision >= 0
  );
}
