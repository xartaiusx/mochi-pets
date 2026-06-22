using MochiSocial.Core;
using MochiSocial.Data;
using NUnit.Framework;
using UnityEngine;

namespace MochiSocial.Tests
{
    public sealed class MochiSocialContractTests
    {
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
        public void CharacterPresetCatalogAllowsOnlyCuratedPresets()
        {
            Assert.That(CharacterPresetCatalog.All.Count, Is.EqualTo(3));
            Assert.That(CharacterPresetCatalog.TryGetPreset("jade_wayfarer", out _), Is.True);
            Assert.That(CharacterPresetCatalog.TryGetPreset("avatar_upload", out _), Is.False);
            Assert.That(CharacterPresetCatalog.TryGetPreset("../custom", out _), Is.False);
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
            Assert.That(message.type, Is.EqualTo("MOCHI_SOCIAL_AUTH"));
            Assert.That(message.protocolVersion, Is.EqualTo(1));
            Assert.That(message.accessToken, Is.EqualTo("sb-token"));
            Assert.That(message.functionsUrl, Does.Contain("functions.supabase.co"));
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
        public void SharedPetRejectsUnknownStateNames()
        {
            var pet = SharedPetState.CreateDefault();
            pet.state = "custom_upload_state";

            Assert.That(pet.IsValid(), Is.False);
        }
    }
}
