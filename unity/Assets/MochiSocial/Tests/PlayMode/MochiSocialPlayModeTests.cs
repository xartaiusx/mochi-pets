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
        public IEnumerator LirabaoLocalCareInteractionUpdatesRevisionAndMood()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();
            pet.SetState(SharedPetState.CreateDefault());

            var before = pet.CurrentState.revision;
            var accepted = pet.TryApplyLocalInteraction("care", "tester", before, out var error);

            Assert.That(accepted, Is.True, error);
            Assert.That(pet.CurrentState.revision, Is.EqualTo(before + 1));
            Assert.That(pet.CurrentState.mood, Is.EqualTo("comforted"));
            Object.Destroy(petObject);
            yield return null;
        }

        [UnityTest]
        public IEnumerator LirabaoRejectsConflictingInteractionRevision()
        {
            var petObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            var pet = petObject.AddComponent<LirabaoPetController>();
            pet.SetState(SharedPetState.CreateDefault());

            var accepted = pet.TryApplyLocalInteraction("care", "tester", 99, out var error);

            Assert.That(accepted, Is.False);
            Assert.That(error, Is.EqualTo("shared_pet_revision_conflict"));
            Object.Destroy(petObject);
            yield return null;
        }
    }
}
