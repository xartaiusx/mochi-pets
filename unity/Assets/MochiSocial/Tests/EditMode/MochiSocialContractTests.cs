using System.Collections.Generic;
using System.Linq;
using MochiSocial.Core;
using MochiSocial.Data;
using MochiSocial.Runtime;
using NUnit.Framework;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MochiSocial.Tests
{
    public sealed class MochiSocialContractTests
    {
        private const string JadeLanternRoomPath = "Assets/MochiSocial/Scenes/JadeLanternRoom.unity";
        private const string AvatarPrefabPath = "Assets/MochiSocial/Prefabs/MochiAvatar.prefab";

        [Test]
        public void SharedRoomContractMatchesWebsitePlan()
        {
            Assert.That(MochiSocialConstants.RoomSessionId, Is.EqualTo("jade-lantern-room-alpha"));
            Assert.That(MochiSocialConstants.RoomMode, Is.EqualTo("single-shared-room"));
            Assert.That(MochiSocialConstants.RoomCapacity, Is.EqualTo(25));
            Assert.That(MochiSocialConstants.SharedPetKey, Is.EqualTo("lirabao"));
            Assert.That(MochiSocialConstants.CharacterSaveKey, Is.EqualTo("character.v1"));
            Assert.That(MochiSocialConstants.SharedPetSaveKey, Is.EqualTo("room:jade-lantern-room/sharedPet.v1"));
        }

        [Test]
        public void JadeLanternRoomSceneContainsAlphaRuntimeWiring()
        {
            var scene = EditorSceneManager.OpenScene(JadeLanternRoomPath, OpenSceneMode.Single);
            var components = GetSceneComponents(scene);

            Assert.That(scene.name, Is.EqualTo("JadeLanternRoom"));
            Assert.That(components.OfType<MochiSocialBootstrap>().Any(), Is.True, "Scene must include the Mochi Social bootstrap.");
            Assert.That(components.OfType<LirabaoPetController>().Any(), Is.True, "Scene must include shared Lirabao.");
            Assert.That(components.OfType<LirabaoInteractionPrompt>().Any(), Is.True, "Scene must include the Lirabao interaction prompt.");
            Assert.That(components.OfType<MochiCameraFollow>().Any(), Is.True, "Scene must include camera follow.");
            Assert.That(components.Any(component => IsComponent(component, "Unity.Netcode.NetworkManager")), Is.True, "Scene must include a NetworkManager.");
            Assert.That(components.Any(component => component != null && component.gameObject.name.Contains("Moon Gate")), Is.True, "Scene must keep the Jade Lantern room moon gate blockout.");
        }

        [Test]
        public void MochiAvatarPrefabIsNetworkedAndPlayerControllable()
        {
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(AvatarPrefabPath);
            Assert.That(prefab, Is.Not.Null, "Mochi avatar prefab must exist.");

            var components = prefab.GetComponentsInChildren<Component>(true);
            Assert.That(components.OfType<MochiAvatarController>().Any(), Is.True, "Avatar prefab must include desktop movement and wave/emote controller.");
            Assert.That(components.OfType<CharacterController>().Any(), Is.True, "Avatar prefab must include CharacterController movement support.");
            Assert.That(components.Any(component => IsComponent(component, "Unity.Netcode.NetworkObject")), Is.True, "Avatar prefab must include NetworkObject.");
            Assert.That(components.Any(component => IsComponent(component, "Unity.Netcode.Components.NetworkTransform")), Is.True, "Avatar prefab must sync live session transforms.");
        }

        [Test]
        public void CharacterPresetCatalogAllowsOnlyCuratedPresets()
        {
            Assert.That(CharacterPresetCatalog.All.Count, Is.EqualTo(3));
            Assert.That(CharacterPresetCatalog.TryGetPreset("jade_wayfarer", out _), Is.True);
            Assert.That(CharacterPresetCatalog.TryGetPreset("avatar_upload", out _), Is.False);
            Assert.That(CharacterPresetCatalog.TryGetPreset("../custom", out _), Is.False);
            Assert.That(CharacterPresetCatalog.TryGetPresetIndex("lotus_guardian", out var presetIndex), Is.True);
            Assert.That(CharacterPresetCatalog.TryGetPresetAt(presetIndex, out var indexedPreset), Is.True);
            Assert.That(indexedPreset.id, Is.EqualTo("lotus_guardian"));
            Assert.That(CharacterPresetCatalog.TryGetPresetAt(99, out _), Is.False);
        }

        [Test]
        public void CuratedCharacterPresetsCreateValidSavedStates()
        {
            foreach (var preset in CharacterPresetCatalog.All)
            {
                var state = CharacterPresetCatalog.FromPreset(preset, "tester-display", Vector3.zero, 0);

                Assert.That(CharacterPresetCatalog.IsValid(state), Is.True, preset.id);
                Assert.That(state.presetId, Is.EqualTo(preset.id));
            }
        }

        [Test]
        public void CharacterSpawnPointUpdatePreservesCuratedPreset()
        {
            var state = CharacterPresetCatalog.CreateDefault("tester-display");
            var spawn = new Vector3(2.5f, 0f, -1.25f);

            var updated = CharacterPresetCatalog.WithLastSpawnPoint(state, spawn);

            Assert.That(CharacterPresetCatalog.IsValid(updated), Is.True);
            Assert.That(updated.presetId, Is.EqualTo(state.presetId));
            Assert.That(updated.primaryColor, Is.EqualTo(state.primaryColor));
            Assert.That(updated.accentColor, Is.EqualTo(state.accentColor));
            Assert.That(updated.lastSpawnPoint, Is.EqualTo(spawn));
            Assert.That(updated.revision, Is.EqualTo(state.revision + 1));
        }

        [Test]
        public void CharacterStateRejectsAlteredPresetColorSwatches()
        {
            var invalidPrimary = CharacterPresetCatalog.CreateDefault();
            invalidPrimary.primaryColor = "FFFFFF";
            Assert.That(CharacterPresetCatalog.IsValid(invalidPrimary), Is.False);

            var invalidAccent = CharacterPresetCatalog.CreateDefault();
            invalidAccent.accentColor = "000000";
            Assert.That(CharacterPresetCatalog.IsValid(invalidAccent), Is.False);
        }

        [Test]
        public void LocalSocialSignalsStayCuratedAndSessionOnly()
        {
            Assert.That(LocalSocialSignalCatalog.All.Count, Is.EqualTo(3));
            Assert.That(LocalSocialSignalCatalog.TryGetSignal("settling-in", out _), Is.True);
            Assert.That(LocalSocialSignalCatalog.TryGetSignal("caring-for-lirabao", out _), Is.True);
            Assert.That(LocalSocialSignalCatalog.TryGetSignal("waving", out _), Is.True);
            Assert.That(LocalSocialSignalCatalog.TryGetSignal("custom-chat-upload", out _), Is.False);
        }

        [Test]
        public void CharacterStateRejectsInvalidPresetIds()
        {
            var invalid = CharacterPresetCatalog.CreateDefault();
            invalid.presetId = "freeform_upload";
            Assert.That(CharacterPresetCatalog.IsValid(invalid), Is.False);
        }

        [Test]
        public void BridgeParsesFlattenedAuthPayload()
        {
            var json = "{\"type\":\"MOCHI_SOCIAL_AUTH\",\"protocolVersion\":1,\"accessToken\":\"sb-token\",\"functionsUrl\":\"https://example.functions.supabase.co\"}";
            var message = JsonUtility.FromJson<BridgeIncomingMessage>(json);
            message.NormalizePayload();
            Assert.That(message.type, Is.EqualTo("MOCHI_SOCIAL_AUTH"));
            Assert.That(message.protocolVersion, Is.EqualTo(1));
            Assert.That(message.accessToken, Is.EqualTo("sb-token"));
            Assert.That(message.functionsUrl, Does.Contain("functions.supabase.co"));
        }

        [Test]
        public void BridgeParsesWebsiteNestedAuthPayload()
        {
            var json = "{\"type\":\"MOCHI_SOCIAL_AUTH\",\"protocolVersion\":1,\"payload\":{\"accessToken\":\"sb-token\"},\"functionsUrl\":\"https://example.supabase.co/functions/v1\"}";
            var message = JsonUtility.FromJson<BridgeIncomingMessage>(json);
            message.NormalizePayload();

            Assert.That(message.type, Is.EqualTo("MOCHI_SOCIAL_AUTH"));
            Assert.That(message.accessToken, Is.EqualTo("sb-token"));
            Assert.That(message.functionsUrl, Does.EndWith("/functions/v1"));
        }

        [Test]
        public void UnityAuthEnvelopeMatchesSupabaseBrokerShape()
        {
            var json = "{\"ok\":true,\"data\":{\"userId\":\"00000000-0000-4000-8000-000000000001\",\"unity\":{\"playerId\":\"unity-player\",\"unityPlayerId\":\"unity-player\",\"accessToken\":\"unity-access\",\"sessionToken\":\"unity-session\",\"environmentName\":\"preview\",\"roomKey\":\"jade-lantern-room-alpha\",\"sharedPetKey\":\"lirabao\"}}}";
            var envelope = JsonUtility.FromJson<UnityAuthEnvelope>(json);
            Assert.That(envelope.ok, Is.True);
            Assert.That(envelope.data.userId, Does.StartWith("00000000-"));
            Assert.That(envelope.data.unity.accessToken, Is.EqualTo("unity-access"));
            Assert.That(envelope.data.unity.sessionToken, Is.EqualTo("unity-session"));
            Assert.That(envelope.data.unity.environmentName, Is.EqualTo("preview"));
        }

        [Test]
        public void SharedPetRejectsInvalidState()
        {
            var pet = SharedPetState.CreateDefault();
            pet.careMeter = 250;
            Assert.That(pet.IsValid(), Is.False);
        }

        [Test]
        public void SharedPetCareUsesCareReceivedState()
        {
            var pet = SharedPetState.CreateDefault();

            var ok = SharedPetState.TryApplyInteraction(
                pet,
                "care",
                "tester-a",
                pet.revision,
                out var updated,
                out var error);

            Assert.That(ok, Is.True, error);
            Assert.That(updated.state, Is.EqualTo("care_received"));
            Assert.That(updated.mood, Is.EqualTo("comforted"));
            Assert.That(updated.careMeter, Is.GreaterThan(pet.careMeter));
            Assert.That(updated.revision, Is.EqualTo(pet.revision + 1));
        }

        [Test]
        public void SharedPetApproachUsesApproachState()
        {
            var pet = SharedPetState.CreateDefault();

            var ok = SharedPetState.TryApplyInteraction(
                pet,
                "approach",
                "tester-a",
                pet.revision,
                out var updated,
                out var error);

            Assert.That(ok, Is.True, error);
            Assert.That(updated.state, Is.EqualTo("approach"));
            Assert.That(updated.mood, Is.EqualTo("curious"));
            Assert.That(updated.careMeter, Is.GreaterThan(pet.careMeter));
        }

        [Test]
        public void SharedPetWaveUsesHappyState()
        {
            var pet = SharedPetState.CreateDefault();

            var ok = SharedPetState.TryApplyInteraction(
                pet,
                "wave",
                "tester-a",
                pet.revision,
                out var updated,
                out var error);

            Assert.That(ok, Is.True, error);
            Assert.That(updated.state, Is.EqualTo("happy"));
            Assert.That(updated.mood, Is.EqualTo("playful"));
            Assert.That(updated.careMeter, Is.GreaterThan(pet.careMeter));
        }

        [Test]
        public void SharedPetUnavailableStateIsValid()
        {
            var unavailable = SharedPetState.CreateUnavailable();

            Assert.That(unavailable.IsValid(), Is.True);
            Assert.That(unavailable.state, Is.EqualTo("unavailable"));
            Assert.That(unavailable.mood, Is.EqualTo("resting"));
        }

        [Test]
        public void SharedPetStaleReloadStateIsValidAndKeepsRevision()
        {
            var pet = SharedPetState.CreateDefault();
            pet.revision = 7;
            pet.careMeter = 72;
            pet.lastInteractionBy = "tester-a";

            var reload = SharedPetState.CreateStaleRevisionReload(pet);

            Assert.That(reload.IsValid(), Is.True);
            Assert.That(reload.state, Is.EqualTo("stale_revision_reload"));
            Assert.That(reload.mood, Is.EqualTo("reloading"));
            Assert.That(reload.revision, Is.EqualTo(pet.revision));
            Assert.That(reload.careMeter, Is.EqualTo(pet.careMeter));
            Assert.That(reload.lastInteractionBy, Is.EqualTo(pet.lastInteractionBy));
        }

        [Test]
        public void SharedPetRejectsUnknownStateNames()
        {
            var pet = SharedPetState.CreateDefault();
            pet.state = "custom_upload_state";

            Assert.That(pet.IsValid(), Is.False);
        }

        [Test]
        public void SharedPetRejectsImpostorDisplayNameAndMood()
        {
            var renamed = SharedPetState.CreateDefault();
            renamed.displayName = "Not Lirabao";
            Assert.That(renamed.IsValid(), Is.False);

            var invalidMood = SharedPetState.CreateDefault();
            invalidMood.mood = "market-ready";
            Assert.That(invalidMood.IsValid(), Is.False);
        }

        private static IReadOnlyList<Component> GetSceneComponents(Scene scene)
        {
            return scene.GetRootGameObjects()
                .SelectMany(root => root.GetComponentsInChildren<Component>(true))
                .Where(component => component != null)
                .ToArray();
        }

        private static bool IsComponent(Component component, string fullName)
        {
            return string.Equals(component?.GetType().FullName, fullName, System.StringComparison.Ordinal);
        }
    }
}
