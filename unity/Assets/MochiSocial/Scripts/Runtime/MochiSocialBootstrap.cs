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
        private bool characterCreationRequired;
        private bool characterCreationBusy;
        private string characterCreationMessage = "Choose a character preset.";

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
            bridge.EmitAuthState("authenticating", "Signing into Mochi Social.");

            try
            {
                var authResponse = await authClient.SignInWithSupabaseAsync(message);
                alphaUserId = authResponse.userId;
                unityPlayerId = AuthenticationService.Instance.PlayerId;

                var loaded = await stateStore.LoadCharacterAsync();
                if (CharacterPresetCatalog.IsValid(loaded))
                {
                    characterCreationRequired = false;
                    characterCreationBusy = false;
                    characterState = loaded;
                    SpawnLocalPreviewAvatar(characterState);
                    await EnterSharedRoomAsync();
                    bridge.EmitAuthState("signed-in", "Joined Jade Lantern Room.", string.IsNullOrWhiteSpace(unityPlayerId) ? authResponse.unityPlayerId : unityPlayerId);
                    return;
                }

                characterCreationRequired = true;
                characterCreationBusy = false;
                characterCreationMessage = "Choose a character preset.";
                SpawnLocalPreviewAvatar(CharacterPresetCatalog.CreateDefault(AuthenticationService.Instance.PlayerId));
                bridge.EmitAuthState("creating-character", "Choose your character.");
            }
            catch (Exception ex)
            {
                bridge.EmitError("unity_auth_failed", ex.Message);
                bridge.EmitAuthState("signed-out", "Sign-in failed.");
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
            characterCreationRequired = false;
            characterCreationBusy = false;
            bridge.EmitAuthState("signed-out", "Signed out of Mochi Social.");
        }

        private async Task EnterSharedRoomAsync()
        {
            await roomSession.JoinSharedRoomAsync();
            await LoadSharedPetOrDefaultAsync();
        }

        private async Task CreateCharacterFromPresetAsync(string presetId)
        {
            if (characterCreationBusy)
            {
                return;
            }

            if (!AuthenticationService.Instance.IsSignedIn)
            {
                bridge.EmitError("character_create_signed_out", "Sign in before creating a character.");
                return;
            }

            if (!CharacterPresetCatalog.TryGetPreset(presetId, out var preset))
            {
                bridge.EmitError("invalid_character_preset", "Choose one of the curated character presets.");
                return;
            }

            characterCreationBusy = true;
            characterCreationMessage = $"Saving {preset.label}.";

            try
            {
                var spawn = spawnPoint == null ? Vector3.zero : spawnPoint.position;
                var created = CharacterPresetCatalog.FromPreset(preset, AuthenticationService.Instance.PlayerId, spawn, 0);
                await stateStore.SaveCharacterAsync(created);

                characterState = created;
                characterCreationRequired = false;
                characterCreationBusy = false;
                SpawnLocalPreviewAvatar(characterState);
                await EnterSharedRoomAsync();
                bridge.EmitAuthState("signed-in", $"Joined Jade Lantern Room as {preset.label}.", unityPlayerId);
            }
            catch (Exception ex)
            {
                characterCreationBusy = false;
                characterCreationMessage = "That character could not be saved. Try another preset.";
                bridge.EmitError("character_save_failed", ex.Message);
            }
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
                Debug.LogWarning($"[Mochi Social] Shared Lirabao state could not be loaded: {ex.Message}");
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

        private void OnGUI()
        {
            if (!characterCreationRequired)
            {
                return;
            }

            var width = Mathf.Min(420f, Mathf.Max(260f, Screen.width - 32f));
            var rect = new Rect((Screen.width - width) * 0.5f, 24f, width, 220f);
            GUILayout.BeginArea(rect, GUI.skin.box);
            GUILayout.Label("Create your character");
            GUILayout.Label(characterCreationMessage);

            GUI.enabled = !characterCreationBusy;
            foreach (var preset in CharacterPresetCatalog.All)
            {
                if (GUILayout.Button(preset.label, GUILayout.Height(36f)))
                {
                    _ = CreateCharacterFromPresetAsync(preset.id);
                }
            }

            GUI.enabled = true;
            GUILayout.Label("Saved play uses one of these curated Mochirii presets.");
            GUILayout.EndArea();
        }

        private T EnsureComponent<T>(T existing) where T : Component
        {
            return existing != null ? existing : gameObject.GetComponent<T>() ?? gameObject.AddComponent<T>();
        }
    }
}
