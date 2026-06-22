using System.Collections;
using MochiSocial.Data;
using MochiSocial.Runtime;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace MochiSocial.Tests
{
    public sealed class MochiSocialPlayModeTests
    {
        [UnityTest]
        public IEnumerator LirabaoCareInteractionRequestsCloudCodeWithoutMutatingState()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();
            pet.SetState(SharedPetState.CreateDefault());
            var before = pet.CurrentState.Clone();
            var requested = false;
            SharedPetState requestedState = null;
            string requestedInteraction = null;
            pet.LocalInteractionRequested += (state, interactionType) =>
            {
                requested = true;
                requestedState = state;
                requestedInteraction = interactionType;
            };

            var accepted = pet.TryRequestInteraction("care", "tester", before.revision, out var error);

            Assert.That(accepted, Is.True, error);
            Assert.That(requested, Is.True);
            Assert.That(requestedInteraction, Is.EqualTo("care"));
            Assert.That(requestedState.revision, Is.EqualTo(before.revision));
            Assert.That(pet.CurrentState.revision, Is.EqualTo(before.revision));
            Assert.That(pet.CurrentState.state, Is.EqualTo(before.state));
            Assert.That(pet.CurrentState.mood, Is.EqualTo(before.mood));
            Object.Destroy(petObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator LirabaoRejectsConflictingInteractionRevision()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();
            pet.SetState(SharedPetState.CreateDefault());

            var accepted = pet.TryRequestInteraction("care", "tester", 99, out var error);

            Assert.That(accepted, Is.False);
            Assert.That(error, Is.EqualTo("shared_pet_revision_conflict"));
            Object.Destroy(petObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator LirabaoRejectsInvalidInteractionIntent()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();
            pet.SetState(SharedPetState.CreateDefault());
            var requested = false;
            pet.LocalInteractionRequested += (_, _) => requested = true;

            var accepted = pet.TryRequestInteraction("upload-avatar", "tester", pet.CurrentState.revision, out var error);

            Assert.That(accepted, Is.False);
            Assert.That(error, Is.EqualTo("invalid_pet_interaction"));
            Assert.That(requested, Is.False);
            Object.Destroy(petObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator LirabaoShowsUnavailableAndStaleReloadStates()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();

            pet.ShowUnavailable();
            Assert.That(pet.CurrentState.state, Is.EqualTo("unavailable"));
            Assert.That(pet.CurrentState.mood, Is.EqualTo("resting"));

            pet.ShowStaleRevisionReload();
            Assert.That(pet.CurrentState.state, Is.EqualTo("stale_revision_reload"));
            Assert.That(pet.CurrentState.mood, Is.EqualTo("reloading"));

            Object.Destroy(petObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator AvatarAppliesCuratedCharacterAppearanceBeforeNetworkSpawn()
        {
            var avatarObject = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            avatarObject.AddComponent<CharacterController>();
            var avatar = avatarObject.AddComponent<MochiAvatarController>();
            CharacterPresetCatalog.TryGetPreset("lotus_guardian", out var preset);
            var state = CharacterPresetCatalog.FromPreset(preset, "tester", Vector3.zero, 0);

            var accepted = avatar.ApplyCharacterState(state);

            Assert.That(accepted, Is.True);
            Assert.That(avatar.AcceptsLocalInput, Is.True);
            Assert.That(avatar.CurrentPresetId, Is.EqualTo("lotus_guardian"));
            Assert.That(ColorUtility.ToHtmlStringRGB(avatar.CurrentPrimaryColor), Is.EqualTo(state.primaryColor));
            Object.Destroy(avatarObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator AvatarRejectsInvalidCharacterPresetState()
        {
            var avatarObject = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            avatarObject.AddComponent<CharacterController>();
            var avatar = avatarObject.AddComponent<MochiAvatarController>();
            var invalid = CharacterPresetCatalog.CreateDefault();
            invalid.presetId = "avatar_upload";

            var accepted = avatar.ApplyCharacterState(invalid);

            Assert.That(accepted, Is.False);
            Assert.That(avatar.CurrentPresetId, Is.EqualTo("jade_wayfarer"));
            Object.Destroy(avatarObject);
            yield return null;
        }
    }
}
