using System;
using System.Text;
using System.Threading.Tasks;
using MochiSocial.Core;
using MochiSocial.Data;
using Unity.Services.Authentication;
using Unity.Services.Core;
using Unity.Services.Core.Environments;
using UnityEngine;
using UnityEngine.Networking;

namespace MochiSocial.Auth
{
    public sealed class MochiSocialAuthClient : MonoBehaviour
    {
        public async Task<UnityAuthResponse> SignInWithSupabaseAsync(BridgeIncomingMessage message)
        {
            if (message == null || string.IsNullOrWhiteSpace(message.accessToken))
            {
                throw new InvalidOperationException("Missing Supabase access token.");
            }

            var endpoint = ResolveUnityAuthEndpoint(message);
            if (string.IsNullOrWhiteSpace(endpoint))
            {
                throw new InvalidOperationException("Missing mochi-social-unity-auth endpoint.");
            }

            var response = await RequestUnityTokensAsync(endpoint, message.accessToken);
            var unityAccessToken = string.IsNullOrWhiteSpace(response.accessToken) ? response.idToken : response.accessToken;
            if (!response.ok || string.IsNullOrWhiteSpace(unityAccessToken))
            {
                throw new InvalidOperationException(response.message ?? response.error ?? "Unity auth response did not include player tokens.");
            }

            if (string.IsNullOrWhiteSpace(response.sessionToken))
            {
                throw new InvalidOperationException("Unity auth response did not include a session token.");
            }

            if (string.IsNullOrWhiteSpace(response.environmentName))
            {
                await UnityServices.InitializeAsync();
            }
            else
            {
                await UnityServices.InitializeAsync(new InitializationOptions().SetEnvironmentName(response.environmentName));
            }

            AuthenticationService.Instance.ProcessAuthenticationTokens(unityAccessToken, response.sessionToken);
            return response;
        }

        private static string ResolveUnityAuthEndpoint(BridgeIncomingMessage message)
        {
            if (!string.IsNullOrWhiteSpace(message.unityAuthUrl))
            {
                return message.unityAuthUrl.Trim();
            }

            if (!string.IsNullOrWhiteSpace(message.functionsUrl))
            {
                return $"{message.functionsUrl.Trim().TrimEnd('/')}/{MochiSocialConstants.UnityAuthFunctionName}";
            }

            if (!string.IsNullOrWhiteSpace(message.supabaseUrl) &&
                Uri.TryCreate(message.supabaseUrl.Trim().TrimEnd('/'), UriKind.Absolute, out var supabaseUri))
            {
                var host = supabaseUri.Host.Replace(".supabase.co", ".functions.supabase.co", StringComparison.OrdinalIgnoreCase);
                return $"{supabaseUri.Scheme}://{host}/{MochiSocialConstants.UnityAuthFunctionName}";
            }

            return string.Empty;
        }

        private static async Task<UnityAuthResponse> RequestUnityTokensAsync(string endpoint, string supabaseAccessToken)
        {
            var body = Encoding.UTF8.GetBytes(JsonUtility.ToJson(new UnityAuthRequest()));
            using var request = new UnityWebRequest(endpoint, UnityWebRequest.kHttpVerbPOST)
            {
                uploadHandler = new UploadHandlerRaw(body),
                downloadHandler = new DownloadHandlerBuffer()
            };
            request.SetRequestHeader("Authorization", $"Bearer {supabaseAccessToken}");
            request.SetRequestHeader("Content-Type", "application/json");

            await SendAsync(request);

            if (request.result != UnityWebRequest.Result.Success)
            {
                throw new InvalidOperationException($"Unity auth failed: HTTP {request.responseCode} {request.error}");
            }

            var response = NormalizeAuthResponse(request.downloadHandler.text);
            if (response == null)
            {
                throw new InvalidOperationException("Unity auth returned an unreadable response.");
            }

            return response;
        }

        private static UnityAuthResponse NormalizeAuthResponse(string json)
        {
            var response = JsonUtility.FromJson<UnityAuthResponse>(json);
            if (response != null && (!string.IsNullOrWhiteSpace(response.accessToken) || !string.IsNullOrWhiteSpace(response.idToken)))
            {
                if (string.IsNullOrWhiteSpace(response.unityPlayerId))
                {
                    response.unityPlayerId = response.playerId;
                }

                return response;
            }

            var envelope = JsonUtility.FromJson<UnityAuthEnvelope>(json);
            var nested = envelope?.data?.unity;
            if (nested == null)
            {
                return response;
            }

            nested.ok = envelope.ok;
            nested.userId = envelope.data.userId;
            if (string.IsNullOrWhiteSpace(nested.unityPlayerId))
            {
                nested.unityPlayerId = nested.playerId;
            }

            nested.error = string.IsNullOrWhiteSpace(nested.error) ? envelope.error : nested.error;
            nested.message = string.IsNullOrWhiteSpace(nested.message) ? envelope.message : nested.message;
            return nested;
        }

        private static Task SendAsync(UnityWebRequest request)
        {
            var completion = new TaskCompletionSource<bool>();
            var operation = request.SendWebRequest();
            operation.completed += _ => completion.TrySetResult(true);
            return completion.Task;
        }
    }
}
