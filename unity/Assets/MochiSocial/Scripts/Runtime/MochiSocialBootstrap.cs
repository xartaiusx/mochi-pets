using System;
using System.Threading.Tasks;
using MochiSocial.Auth;
using MochiSocial.Bridge;
using MochiSocial.Core;
using MochiSocial.Data;
using MochiSocial.Networking;
using MochiSocial.Services;
using Unity.Services.Authentication;
using UnityEngine;

namespace MochiSocial.Runtime
{
    public sealed class MochiSocialBootstrap : MonoBehaviour
    {
        [SerializeField] private MochiSocialWebBridge bridge;
        [SerializeField] private MochiSocialAuthClient authClient;
        [SerializeField] private MochiSocialRoomSession roomSession;
        [SerializeField] private MochiSocialUgsStateStore stateStore;
        [SerializeField] private LirabaoPetController lirabao;
        [SerializeField] private MochiCameraFollow cameraFollow;
        [SerializeField] private GameObject avatarPrefab;
        [SerializeField] private Transform spawnPoint;

        private CharacterState characterState;
        private GameObject localAvatar;
        private string alphaUserId;
        private string unityPlayerId;
        private bool authInFlight;

        private void Awake()
        {
            gameObject.name = MochiSocialConstants.BootstrapObjectName;
            bridge = EnsureComponent(bridge);
            authClient = EnsureComponent(authClient);
            roomSession = EnsureComponent(roomSession);
            stateStore = EnsureComponent(stateStore);
            bridge.MessageReceived += HandleBridgeMessage;
        }

        private void Start()
        {
            bridge.EmitReady();
            SpawnLocalPreviewAvatar(CharacterPresetCatalog.CreateDefault());
            if (lirabao != null)
            {
                lirabao.SetState(SharedPetState.CreateDefault());
                lirabao.LocalInteractionApplied += OnLocalPetInteractionApplied;
            }
        }

        private void OnDestroy()
        {
            if (bridge != null)
            {
                bridge.MessageReceived -= HandleBridgeMessage;
            }

            if (lirabao != null)
            {
                lirabao.LocalInteractionApplied -= OnLocalPetInteractionApplied;
            }
        }

        public void OnParentBridgeMessage(string json)
        {
            bridge.ReceiveFromParent(json);
        }

        public void InteractWithLirabao(string interactionType)
        {
            if (lirabao == null)
            {
                return;
            }

            var playerId = AuthenticationService.Instance.IsSignedIn ? AuthenticationService.Instance.PlayerId : "local-preview";
            if (!lirabao.TryApplyLocalInteraction(interactionType, playerId, lirabao.CurrentState.revision, out var error))
            {
                bridge.EmitError(error, "Lirabao did not accept that interaction.");
            }
        }

        private void HandleBridgeMessage(BridgeIncomingMessage message)
        {
            switch (message.type)
            {
                case "MOCHI_SOCIAL_AUTH":
                    _ = HandleAuthAsync(message);
                    break;
                case "MOCHI_SOCIAL_SIGN_OUT":
                    _ = HandleSignOutAsync();
                    break;
                default:
                    bridge.EmitError("unknown_bridge_message", $"Unsupported bridge message: {message.type}");
                    break;
            }
        }

        private async Task HandleAuthAsync(BridgeIncomingMessage message)
        {
            if (authInFlight)
            {
                return;
            }

            authInFlight = true;
            bridge.EmitAuthState("authenticating", "Signing into Unity services.");

            try
            {
                var authResponse = await authClient.SignInWithSupabaseAsync(message);
                alphaUserId = authResponse.userId;
                unityPlayerId = AuthenticationService.Instance.PlayerId;

                characterState = await LoadOrCreateCharacterAsync();
                SpawnLocalPreviewAvatar(characterState);

                await roomSession.JoinSharedRoomAsync();
                await LoadSharedPetOrDefaultAsync();

                bridge.EmitAuthState("signed-in", "Joined Jade Lantern Room.", string.IsNullOrWhiteSpace(unityPlayerId) ? authResponse.unityPlayerId : unityPlayerId);
            }
            catch (Exception ex)
            {
                bridge.EmitError("unity_auth_failed", ex.Message);
                bridge.EmitAuthState("signed-out", "Unity auth failed.");
            }
            finally
            {
                authInFlight = false;
            }
        }

        private async Task HandleSignOutAsync()
        {
            await roomSession.LeaveAsync();
            if (AuthenticationService.Instance.IsSignedIn)
            {
                AuthenticationService.Instance.SignOut(true);
            }

            characterState = null;
            alphaUserId = null;
            unityPlayerId = null;
            bridge.EmitAuthState("signed-out", "Signed out of Unity services.");
        }

        private async Task<CharacterState> LoadOrCreateCharacterAsync()
        {
            var loaded = await stateStore.LoadCharacterAsync();
            if (CharacterPresetCatalog.IsValid(loaded))
            {
                return loaded;
            }

            var spawn = spawnPoint == null ? Vector3.zero : spawnPoint.position;
            var created = CharacterPresetCatalog.CreateDefault(AuthenticationService.Instance.PlayerId);
            created.lastSpawnPoint = spawn;
            await stateStore.SaveCharacterAsync(created);
            return created;
        }

        private async Task LoadSharedPetOrDefaultAsync()
        {
            if (lirabao == null)
            {
                return;
            }

            try
            {
                var shared = await stateStore.LoadSharedPetAsync();
                lirabao.SetState(shared);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[Mochi Social] Shared pet Cloud Code load fell back to local default: {ex.Message}");
                lirabao.SetState(SharedPetState.CreateDefault());
            }
        }

        private async void OnLocalPetInteractionApplied(SharedPetState state, string interactionType)
        {
            if (!AuthenticationService.Instance.IsSignedIn || stateStore == null)
            {
                return;
            }

            try
            {
                var actorId = string.IsNullOrWhiteSpace(alphaUserId) ? AuthenticationService.Instance.PlayerId : alphaUserId;
                var updated = await stateStore.InteractWithSharedPetAsync(state, interactionType, actorId);
                lirabao.SetState(updated);
            }
            catch (Exception ex) when (ex.Message.Contains("shared_pet_revision_conflict", StringComparison.OrdinalIgnoreCase))
            {
                await LoadSharedPetOrDefaultAsync();
                bridge.EmitError("shared_pet_revision_conflict", "Lirabao changed for another tester first. The shared pet state was reloaded.");
            }
            catch (Exception ex)
            {
                bridge.EmitError("shared_pet_save_failed", ex.Message);
            }
        }

        private void SpawnLocalPreviewAvatar(CharacterState state)
        {
            if (avatarPrefab == null)
            {
                return;
            }

            if (localAvatar != null)
            {
                Destroy(localAvatar);
            }

            var spawn = state?.lastSpawnPoint ?? (spawnPoint == null ? Vector3.zero : spawnPoint.position);
            localAvatar = Instantiate(avatarPrefab, spawn, Quaternion.identity);
            localAvatar.name = "Local Mochirii Avatar";
            ApplyAvatarColors(localAvatar, state);
            cameraFollow?.SetTarget(localAvatar.transform);
        }

        private static void ApplyAvatarColors(GameObject avatar, CharacterState state)
        {
            if (avatar == null || state == null)
            {
                return;
            }

            if (!ColorUtility.TryParseHtmlString($"#{state.primaryColor}", out var primary))
            {
                primary = new Color(0.20f, 0.56f, 0.48f);
            }

            foreach (var renderer in avatar.GetComponentsInChildren<Renderer>())
            {
                renderer.material.color = primary;
            }
        }

        private T EnsureComponent<T>(T existing) where T : Component
        {
            return existing != null ? existing : gameObject.GetComponent<T>() ?? gameObject.AddComponent<T>();
        }
    }
}
