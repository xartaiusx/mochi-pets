using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MochiSocial.Auth;
using MochiSocial.Bridge;
using MochiSocial.Core;
using MochiSocial.Data;
using MochiSocial.Networking;
using MochiSocial.Services;
using Unity.Netcode;
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
        private bool networkAvatarAdopted;
        private string characterCreationMessage = "Choose a character preset.";
        private string localSocialSignalLabel = "Settling in";
        private readonly List<string> localSocialFeed = new List<string> { "Room signal ready." };
        private const int MaxLocalSocialFeedLines = 4;

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
                lirabao.LocalInteractionRequested += OnLocalPetInteractionRequested;
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
                lirabao.LocalInteractionRequested -= OnLocalPetInteractionRequested;
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

            if (!AuthenticationService.Instance.IsSignedIn || stateStore == null)
            {
                bridge.EmitError("shared_pet_signed_out", "Sign in before caring for Lirabao.");
                return;
            }

            if (!SharedPetState.TryNormalizeActorId(alphaUserId, out var actorId))
            {
                bridge.EmitError("shared_pet_actor_unverified", "Sign in again before caring for Lirabao.");
                return;
            }

            if (!lirabao.TryRequestInteraction(interactionType, actorId, lirabao.CurrentState.revision, out var error))
            {
                bridge.EmitError(error, "Lirabao did not accept that interaction.");
                return;
            }
        }

        private void Update()
        {
            if (roomSession?.CurrentSession != null && characterState != null && !networkAvatarAdopted)
            {
                TryAdoptNetworkPlayerAvatar();
            }

            if (characterCreationRequired || roomSession?.CurrentSession == null)
            {
                return;
            }

            if (Input.GetKeyDown(KeyCode.Alpha1))
            {
                SetLocalSocialSignal("settling-in");
            }
            else if (Input.GetKeyDown(KeyCode.Alpha2))
            {
                SetLocalSocialSignal("caring-for-lirabao");
            }
            else if (Input.GetKeyDown(KeyCode.Alpha3))
            {
                SetLocalSocialSignal("waving");
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
                SetLocalSocialSignal("settling-in");
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
            await SaveCurrentCharacterSpawnAsync();
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
            networkAvatarAdopted = false;
            bridge.EmitAuthState("signed-out", "Signed out of Mochi Social.");
        }

        private async Task SaveCurrentCharacterSpawnAsync()
        {
            if (characterState == null || localAvatar == null || stateStore == null || !AuthenticationService.Instance.IsSignedIn)
            {
                return;
            }

            var updated = CharacterPresetCatalog.WithLastSpawnPoint(characterState, localAvatar.transform.position);
            if (!CharacterPresetCatalog.IsValid(updated))
            {
                bridge.EmitError("character_save_failed", "Your latest room spot could not be saved.");
                return;
            }

            try
            {
                await stateStore.SaveCharacterAsync(updated);
                characterState = updated;
            }
            catch (Exception ex)
            {
                bridge.EmitError("character_save_failed", ex.Message);
            }
        }

        private async Task EnterSharedRoomAsync()
        {
            await roomSession.JoinSharedRoomAsync();
            TryAdoptNetworkPlayerAvatar();
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
                SetLocalSocialSignal("settling-in");
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
                lirabao.ShowUnavailable();
                bridge.EmitError("shared_pet_unavailable", "Lirabao is resting. Try again soon.");
            }
        }

        private async void OnLocalPetInteractionRequested(SharedPetState state, string interactionType)
        {
            if (!AuthenticationService.Instance.IsSignedIn || stateStore == null)
            {
                return;
            }

            try
            {
                if (!SharedPetState.TryNormalizeActorId(alphaUserId, out var actorId))
                {
                    bridge.EmitError("shared_pet_actor_unverified", "Sign in again before caring for Lirabao.");
                    return;
                }

                var updated = await stateStore.InteractWithSharedPetAsync(state, interactionType, actorId);
                lirabao.SetState(updated);
                RecordAcceptedPetInteraction(interactionType);
            }
            catch (Exception ex) when (ex.Message.Contains("shared_pet_revision_conflict", StringComparison.OrdinalIgnoreCase))
            {
                lirabao.ShowStaleRevisionReload();
                bridge.EmitError("shared_pet_revision_conflict", "Another tester cared for Lirabao first. The room refreshed Lirabao's latest mood.");
                await LoadSharedPetOrDefaultAsync();
            }
            catch (Exception ex)
            {
                lirabao.ShowUnavailable();
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
            ApplyAvatarAppearance(localAvatar, state);
            cameraFollow?.SetTarget(localAvatar.transform);
            networkAvatarAdopted = false;
        }

        private bool TryAdoptNetworkPlayerAvatar()
        {
            var networkAvatar = FindLocalNetworkAvatar();
            if (networkAvatar == null)
            {
                return false;
            }

            if (localAvatar != null && localAvatar != networkAvatar && !IsSpawnedNetworkAvatar(localAvatar))
            {
                Destroy(localAvatar);
            }

            localAvatar = networkAvatar;
            localAvatar.name = "Local Mochirii Avatar";
            if (characterState != null)
            {
                localAvatar.transform.position = characterState.lastSpawnPoint;
            }

            ApplyAvatarAppearance(localAvatar, characterState);
            cameraFollow?.SetTarget(localAvatar.transform);
            networkAvatarAdopted = true;
            return true;
        }

        private static GameObject FindLocalNetworkAvatar()
        {
            var manager = NetworkManager.Singleton;
            if (manager == null || !manager.IsListening)
            {
                return null;
            }

            var playerObject = manager.LocalClient?.PlayerObject ?? manager.SpawnManager?.GetLocalPlayerObject();
            return playerObject == null ? null : playerObject.gameObject;
        }

        private static bool IsSpawnedNetworkAvatar(GameObject avatar)
        {
            var networkObject = avatar == null ? null : avatar.GetComponent<NetworkObject>();
            return networkObject != null && networkObject.IsSpawned;
        }

        private static void ApplyAvatarAppearance(GameObject avatar, CharacterState state)
        {
            if (avatar == null || state == null)
            {
                return;
            }

            var controller = avatar.GetComponent<MochiAvatarController>();
            if (controller != null && controller.ApplyCharacterState(state))
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

        private void SetLocalSocialSignal(string signalId)
        {
            if (!LocalSocialSignalCatalog.TryGetSignal(signalId, out var signal))
            {
                bridge.EmitError("invalid_social_signal", "Choose one of the room signals.");
                return;
            }

            localSocialSignalLabel = signal.label;
            AppendLocalSocialFeed($"Signal: {signal.label}.");
        }

        private void RecordAcceptedPetInteraction(string interactionType)
        {
            switch ((interactionType ?? string.Empty).Trim().ToLowerInvariant())
            {
                case "care":
                    SetLocalSocialSignal("caring-for-lirabao");
                    break;
                case "wave":
                    SetLocalSocialSignal("waving");
                    break;
                case "approach":
                    AppendLocalSocialFeed("You approach Lirabao.");
                    break;
            }
        }

        private void AppendLocalSocialFeed(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            localSocialFeed.Add(message);
            while (localSocialFeed.Count > MaxLocalSocialFeedLines)
            {
                localSocialFeed.RemoveAt(0);
            }
        }

        private void OnGUI()
        {
            if (characterCreationRequired)
            {
                DrawCharacterCreationPanel();
                return;
            }

            if (roomSession?.CurrentSession != null)
            {
                DrawLocalSocialSignalPanel();
            }
        }

        private void DrawCharacterCreationPanel()
        {
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

        private void DrawLocalSocialSignalPanel()
        {
            var width = Mathf.Min(360f, Mathf.Max(260f, Screen.width - 32f));
            var height = 210f;
            var rect = new Rect(16f, Mathf.Max(24f, Screen.height - height - 16f), width, height);
            GUILayout.BeginArea(rect, GUI.skin.box);
            GUILayout.Label("Room signal");
            GUILayout.Label($"Status: {localSocialSignalLabel}");
            GUILayout.Label($"Room: {roomSession?.CurrentSession?.PlayerCount ?? 1}/{MochiSocialConstants.RoomCapacity}");
            GUILayout.Label("1 Settling in  |  2 Caring  |  3 Waving");

            foreach (var signal in LocalSocialSignalCatalog.All)
            {
                if (GUILayout.Button(signal.label, GUILayout.Height(28f)))
                {
                    SetLocalSocialSignal(signal.id);
                }
            }

            foreach (var line in localSocialFeed)
            {
                GUILayout.Label(line);
            }

            GUILayout.EndArea();
        }

        private T EnsureComponent<T>(T existing) where T : Component
        {
            return existing != null ? existing : gameObject.GetComponent<T>() ?? gameObject.AddComponent<T>();
        }
    }
}
