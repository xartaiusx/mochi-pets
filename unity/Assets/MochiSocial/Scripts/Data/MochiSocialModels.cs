using System;
using System.Collections.Generic;
using MochiSocial.Core;
using UnityEngine;

namespace MochiSocial.Data
{
    [Serializable]
    public sealed class CharacterPreset
    {
        public string id;
        public string label;
        public string body;
        public string hair;
        public string outfit;
        public Color primaryColor;
        public Color accentColor;
    }

    [Serializable]
    public sealed class CharacterState
    {
        public int version = 1;
        public string presetId;
        public string body;
        public string hair;
        public string outfit;
        public string primaryColor;
        public string accentColor;
        public string displayNameReference;
        public Vector3 lastSpawnPoint;
        public long revision;
    }

    [Serializable]
    public sealed class SharedPetState
    {
        private static readonly HashSet<string> AllowedStates = new HashSet<string>(StringComparer.Ordinal)
        {
            "idle",
            "approach",
            "happy",
            "care_received",
            "stale_revision_reload",
            "unavailable"
        };

        public int version = 1;
        public string petId = MochiSocialConstants.SharedPetKey;
        public string displayName = MochiSocialConstants.SharedPetDisplayName;
        public string mood = "curious";
        public string state = "idle";
        public int careMeter = 50;
        public int bondTier = 1;
        public long lastInteractionUnixSeconds;
        public string lastInteractionBy;
        public long revision;
        public string writeLock;

        public static SharedPetState CreateDefault()
        {
            return new SharedPetState
            {
                lastInteractionUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }

        public static SharedPetState CreateUnavailable()
        {
            return new SharedPetState
            {
                mood = "resting",
                state = "unavailable",
                lastInteractionUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }

        public static SharedPetState CreateStaleRevisionReload(SharedPetState current)
        {
            var next = current != null && current.IsValid() ? current.Clone() : CreateDefault();
            next.mood = "reloading";
            next.state = "stale_revision_reload";
            return next;
        }

        public SharedPetState Clone()
        {
            return new SharedPetState
            {
                version = version,
                petId = petId,
                displayName = displayName,
                mood = mood,
                state = state,
                careMeter = careMeter,
                bondTier = bondTier,
                lastInteractionUnixSeconds = lastInteractionUnixSeconds,
                lastInteractionBy = lastInteractionBy,
                revision = revision,
                writeLock = writeLock
            };
        }

        public bool IsValid()
        {
            return version == 1 &&
                   petId == MochiSocialConstants.SharedPetKey &&
                   !string.IsNullOrWhiteSpace(displayName) &&
                   AllowedStates.Contains(state ?? string.Empty) &&
                   careMeter >= 0 &&
                   careMeter <= 100 &&
                   bondTier >= 1 &&
                   bondTier <= 5 &&
                   revision >= 0;
        }

        public static bool TryApplyInteraction(
            SharedPetState current,
            string interactionType,
            string actorId,
            long expectedRevision,
            out SharedPetState updated,
            out string error)
        {
            updated = null;
            error = null;

            if (current == null || !current.IsValid())
            {
                error = "invalid_shared_pet_state";
                return false;
            }

            if (expectedRevision >= 0 && current.revision != expectedRevision)
            {
                error = "shared_pet_revision_conflict";
                return false;
            }

            var next = current.Clone();
            next.lastInteractionBy = string.IsNullOrWhiteSpace(actorId) ? "unknown-player" : actorId;
            next.lastInteractionUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            next.revision += 1;

            if (!TryNormalizeInteraction(interactionType, out var normalizedInteraction, out error))
            {
                return false;
            }

            switch (normalizedInteraction)
            {
                case "approach":
                    next.state = "approach";
                    next.mood = "curious";
                    next.careMeter = Mathf.Clamp(next.careMeter + 2, 0, 100);
                    break;
                case "care":
                    next.state = "care_received";
                    next.mood = "comforted";
                    next.careMeter = Mathf.Clamp(next.careMeter + 8, 0, 100);
                    break;
                case "wave":
                    next.state = "happy";
                    next.mood = "playful";
                    next.careMeter = Mathf.Clamp(next.careMeter + 4, 0, 100);
                    break;
            }

            next.bondTier = Mathf.Clamp(1 + next.careMeter / 25, 1, 5);
            updated = next;
            return true;
        }

        public static bool TryNormalizeInteraction(string interactionType, out string normalizedInteraction, out string error)
        {
            normalizedInteraction = (interactionType ?? string.Empty).Trim().ToLowerInvariant();
            error = null;

            switch (normalizedInteraction)
            {
                case "approach":
                case "care":
                case "wave":
                    return true;
                default:
                    error = "invalid_pet_interaction";
                    return false;
            }
        }
    }

    [Serializable]
    public sealed class BridgeIncomingMessage
    {
        public string type;
        public int protocolVersion;
        public BridgeAuthPayload payload;
        public string accessToken;
        public string expiresAt;
        public string functionsUrl;
        public string unityAuthUrl;
        public string supabaseUrl;

        public void NormalizePayload()
        {
            if (payload == null)
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                accessToken = payload.accessToken;
            }

            if (string.IsNullOrWhiteSpace(expiresAt))
            {
                expiresAt = payload.expiresAt;
            }
        }
    }

    [Serializable]
    public sealed class BridgeAuthPayload
    {
        public string accessToken;
        public string expiresAt;
    }

    [Serializable]
    public sealed class BridgeAuthStatePayload
    {
        public string state;
        public string message;
        public string playerId;
        public string roomSessionId;
        public string sharedPetKey;
    }

    [Serializable]
    public sealed class BridgeErrorPayload
    {
        public string code;
        public string message;
    }

    [Serializable]
    public sealed class BridgeReadyPayload
    {
        public string engine = "unity-webgl";
        public string roomSessionId = MochiSocialConstants.RoomSessionId;
        public string sharedPetKey = MochiSocialConstants.SharedPetKey;
    }

    [Serializable]
    public sealed class UnityAuthRequest
    {
        public string roomSessionId = MochiSocialConstants.RoomSessionId;
    }

    [Serializable]
    public sealed class UnityAuthResponse
    {
        public bool ok;
        public string userId;
        public string idToken;
        public string accessToken;
        public string sessionToken;
        public string unityPlayerId;
        public string playerId;
        public string customId;
        public string environmentName;
        public int expiresIn;
        public string expiresAt;
        public string error;
        public string message;
    }

    [Serializable]
    public sealed class UnityAuthEnvelope
    {
        public bool ok;
        public UnityAuthEnvelopeData data;
        public string error;
        public string message;
    }

    [Serializable]
    public sealed class UnityAuthEnvelopeData
    {
        public string userId;
        public UnityAuthResponse unity;
    }
}
