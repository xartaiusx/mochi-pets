const { DataApi } = require("@unity-services/cloud-save-1.4");
const axios = require("axios-0.21");

const ROOM_SESSION_ID = "jade-lantern-room-alpha";
const SHARED_PET_KEY = "lirabao";
const CUSTOM_ITEM_ID = "room:jade-lantern-room";
const SHARED_PET_ITEM_KEY = "sharedPet.v1";
const FULL_STATE_KEY = "room:jade-lantern-room/sharedPet.v1";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_STATES = new Set(["idle", "approach", "happy", "care_received", "stale_revision_reload", "unavailable"]);

module.exports = async ({ params, context, logger, secretManager }) => {
  assertSharedRoomParams(params);

  const cloudSaveApi = new DataApi(context);
  const current = await loadSharedPetState(cloudSaveApi, context.projectId);
  if (!isValidSharedPetState(current)) {
    throw Error("invalid_shared_pet_state");
  }

  const expectedRevision = Number.isInteger(params.expectedRevision) ? params.expectedRevision : -1;
  if (expectedRevision >= 0 && current.revision !== expectedRevision) {
    const error = Error("shared_pet_revision_conflict");
    error.current = current;
    throw error;
  }

  const next = applyInteraction(current, String(params.interactionType || ""), String(params.actorId || context.playerId || "unknown-player"));
  await saveSharedPetState(cloudSaveApi, context.projectId, next);
  await mirrorToSupabaseIfConfigured({ params, logger, secretManager }, next);
  return next;
};

async function loadSharedPetState(cloudSaveApi, projectId) {
  const response = await cloudSaveApi.getCustomItems(projectId, CUSTOM_ITEM_ID, [SHARED_PET_ITEM_KEY]);
  const value = response && response.data && response.data.results && response.data.results[0]
    ? response.data.results[0].value
    : null;
  return typeof value === "string" ? JSON.parse(value) : value;
}

async function saveSharedPetState(cloudSaveApi, projectId, state) {
  await cloudSaveApi.setCustomItem(projectId, CUSTOM_ITEM_ID, {
    key: SHARED_PET_ITEM_KEY,
    value: JSON.stringify(state),
  });
}

function applyInteraction(current, interactionType, actorId) {
  const next = {
    ...current,
    lastInteractionBy: actorId || "unknown-player",
    lastInteractionUnixSeconds: Math.floor(Date.now() / 1000),
    revision: current.revision + 1,
  };

  if (interactionType === "approach") {
    next.state = "approach";
    next.mood = "curious";
    next.careMeter = clamp(current.careMeter + 2, 0, 100);
  } else if (interactionType === "care") {
    next.state = "care_received";
    next.mood = "comforted";
    next.careMeter = clamp(current.careMeter + 8, 0, 100);
  } else if (interactionType === "wave") {
    next.state = "happy";
    next.mood = "playful";
    next.careMeter = clamp(current.careMeter + 4, 0, 100);
  } else {
    throw Error("invalid_pet_interaction");
  }

  next.bondTier = clamp(1 + Math.floor(next.careMeter / 25), 1, 5);
  next.writeLock = `${next.revision}:${next.lastInteractionUnixSeconds}`;
  return next;
}

async function mirrorToSupabaseIfConfigured({ params, logger, secretManager }, state) {
  if (!secretManager || !UUID_RE.test(String(state.lastInteractionBy || ""))) {
    return;
  }

  const actionUrlSecret = await readSecret(secretManager, "MOCHI_SOCIAL_ALPHA_ACTION_URL");
  const tokenSecret = await readSecret(secretManager, "MOCHI_SOCIAL_GAME_SERVER_TOKEN");
  if (!actionUrlSecret || !tokenSecret) {
    return;
  }

  try {
    await axios.post(
      actionUrlSecret.replace(/\/+$/, ""),
      {
        requestId: `ugs-lirabao-${state.revision}-${state.lastInteractionUnixSeconds}`,
        type: "unity.pet.state_saved",
        playerId: state.lastInteractionBy,
        payload: {
          petKey: SHARED_PET_KEY,
          roomKey: ROOM_SESSION_ID,
          entityType: "shared_pet",
          entityId: SHARED_PET_KEY,
          interactionType: params.interactionType,
          state,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-mochi-social-server-token": tokenSecret,
        },
        timeout: 5000,
      },
    );
  } catch (error) {
    logger.warn("Supabase shared pet audit mirror failed without blocking UGS primary save.");
  }
}

async function readSecret(secretManager, name) {
  try {
    const secret = await secretManager.getSecret(name);
    return secret && typeof secret.value === "string" ? secret.value : "";
  } catch {
    return "";
  }
}

function assertSharedRoomParams(params) {
  if (params.roomSessionId !== ROOM_SESSION_ID || params.sharedPetKey !== SHARED_PET_KEY || params.stateKey !== FULL_STATE_KEY) {
    throw Error("invalid_unity_room_pet");
  }
}

function isValidSharedPetState(state) {
  return Boolean(
    state &&
    state.version === 1 &&
    state.petId === SHARED_PET_KEY &&
    typeof state.displayName === "string" &&
    ALLOWED_STATES.has(state.state) &&
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
