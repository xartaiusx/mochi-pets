using System;
using System.Runtime.InteropServices;
using MochiSocial.Core;
using MochiSocial.Data;
using UnityEngine;

namespace MochiSocial.Bridge
{
    public sealed class MochiSocialWebBridge : MonoBehaviour
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void MochiSocialBridgeReady(string payloadJson);

        [DllImport("__Internal")]
        private static extern void MochiSocialBridgeAuthState(string payloadJson);

        [DllImport("__Internal")]
        private static extern void MochiSocialBridgeError(string payloadJson);
#endif

        public event Action<BridgeIncomingMessage> MessageReceived;

        public void EmitReady()
        {
            var payload = JsonUtility.ToJson(new BridgeReadyPayload());
#if UNITY_WEBGL && !UNITY_EDITOR
            MochiSocialBridgeReady(payload);
#else
            Debug.Log($"[Mochi Social Bridge] READY {payload}");
#endif
        }

        public void EmitAuthState(string state, string message = null, string playerId = null)
        {
            var payload = JsonUtility.ToJson(new BridgeAuthStatePayload
            {
                state = state,
                message = message,
                playerId = playerId,
                roomSessionId = MochiSocialConstants.RoomSessionId,
                sharedPetKey = MochiSocialConstants.SharedPetKey
            });
#if UNITY_WEBGL && !UNITY_EDITOR
            MochiSocialBridgeAuthState(payload);
#else
            Debug.Log($"[Mochi Social Bridge] AUTH_STATE {payload}");
#endif
        }

        public void EmitError(string code, string message)
        {
            var payload = JsonUtility.ToJson(new BridgeErrorPayload
            {
                code = code,
                message = message
            });
#if UNITY_WEBGL && !UNITY_EDITOR
            MochiSocialBridgeError(payload);
#else
            Debug.LogWarning($"[Mochi Social Bridge] ERROR {payload}");
#endif
        }

        public void ReceiveFromParent(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                EmitError("invalid_bridge_message", "Parent bridge message was empty.");
                return;
            }

            BridgeIncomingMessage message;
            try
            {
                message = JsonUtility.FromJson<BridgeIncomingMessage>(json);
            }
            catch (Exception ex)
            {
                EmitError("invalid_bridge_json", ex.Message);
                return;
            }

            if (message == null || string.IsNullOrWhiteSpace(message.type))
            {
                EmitError("invalid_bridge_message", "Parent bridge message did not include a type.");
                return;
            }

            if (message.protocolVersion != 0 && message.protocolVersion != MochiSocialConstants.BridgeProtocolVersion)
            {
                EmitError("unsupported_bridge_protocol", $"Unsupported bridge protocol version {message.protocolVersion}.");
                return;
            }

            MessageReceived?.Invoke(message);
        }
    }
}
