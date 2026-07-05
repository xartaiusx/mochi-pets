using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MochiSocial.Core;
using MochiSocial.Data;
using Unity.Services.CloudCode;
using Unity.Services.CloudSave;
using UnityEngine;

namespace MochiSocial.Services
{
    public sealed class MochiSocialUgsStateStore : MonoBehaviour
    {
        public async Task<CharacterState> LoadCharacterAsync()
        {
            var keys = new HashSet<string> { MochiSocialConstants.CharacterSaveKey };
            var data = await CloudSaveService.Instance.Data.Player.LoadAsync(keys);
            if (!data.TryGetValue(MochiSocialConstants.CharacterSaveKey, out var item))
            {
                return null;
            }

            var json = item.Value.GetAsString();
            if (string.IsNullOrWhiteSpace(json))
            {
                return null;
            }

            return JsonUtility.FromJson<CharacterState>(json);
        }

        public async Task SaveCharacterAsync(CharacterState character)
        {
            if (!CharacterPresetCatalog.IsValid(character))
            {
                throw new InvalidOperationException("Refusing to save invalid character preset state.");
            }

            var json = JsonUtility.ToJson(character);
            await CloudSaveService.Instance.Data.Player.SaveAsync(new Dictionary<string, object>
            {
                [MochiSocialConstants.CharacterSaveKey] = json
            });
        }

        public async Task<SharedPetState> LoadSharedPetAsync()
        {
            var args = new Dictionary<string, object>
            {
                ["roomSessionId"] = MochiSocialConstants.RoomSessionId,
                ["sharedPetKey"] = MochiSocialConstants.SharedPetKey,
                ["stateKey"] = MochiSocialConstants.SharedPetSaveKey
            };

            return await CloudCodeService.Instance.CallEndpointAsync<SharedPetState>(
                MochiSocialConstants.SharedPetLoadFunction,
                args);
        }

        public async Task<SharedPetState> InteractWithSharedPetAsync(SharedPetState current, string interactionType, string actorId)
        {
            if (current == null || !current.IsValid())
            {
                throw new InvalidOperationException("Cannot interact with invalid shared pet state.");
            }

            var args = new Dictionary<string, object>
            {
                ["roomSessionId"] = MochiSocialConstants.RoomSessionId,
                ["sharedPetKey"] = MochiSocialConstants.SharedPetKey,
                ["stateKey"] = MochiSocialConstants.SharedPetSaveKey,
                ["interactionType"] = interactionType,
                ["expectedRevision"] = current.revision,
                ["actorId"] = actorId
            };

            return await CloudCodeService.Instance.CallEndpointAsync<SharedPetState>(
                MochiSocialConstants.SharedPetInteractFunction,
                args);
        }
    }
}
