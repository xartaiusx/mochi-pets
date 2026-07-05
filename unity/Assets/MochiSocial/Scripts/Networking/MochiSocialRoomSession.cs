using System.Collections.Generic;
using System.Threading.Tasks;
using MochiSocial.Core;
using Unity.Services.Core;
using Unity.Services.Multiplayer;
using UnityEngine;

namespace MochiSocial.Networking
{
    public sealed class MochiSocialRoomSession : MonoBehaviour
    {
        public ISession CurrentSession { get; private set; }

        public async Task<ISession> JoinSharedRoomAsync()
        {
            await UnityServices.InitializeAsync();

            var options = new SessionOptions
            {
                Name = MochiSocialConstants.RoomDisplayName,
                MaxPlayers = MochiSocialConstants.RoomCapacity,
                IsPrivate = false,
                IsLocked = false,
                SessionProperties = new Dictionary<string, SessionProperty>
                {
                    ["roomMode"] = new SessionProperty(MochiSocialConstants.RoomMode),
                    ["sharedPetKey"] = new SessionProperty(MochiSocialConstants.SharedPetKey)
                }
            }.WithDistributedAuthorityNetwork();

            CurrentSession = await MultiplayerService.Instance.CreateOrJoinSessionAsync(MochiSocialConstants.RoomSessionId, options);
            Debug.Log($"[Mochi Pets] Joined shared room session {CurrentSession.Id} with {CurrentSession.PlayerCount}/{CurrentSession.MaxPlayers} players.");
            return CurrentSession;
        }

        public async Task LeaveAsync()
        {
            if (CurrentSession == null)
            {
                return;
            }

            await CurrentSession.LeaveAsync();
            CurrentSession = null;
        }
    }
}
