using System;
using UnityEditor;
using UnityEditor.PackageManager;
using UnityEditor.PackageManager.Requests;
using UnityEngine;

namespace MochiSocial.Editor
{
    public static class MochiSocialPackageInstaller
    {
        private static readonly string[] Packages =
        {
            "com.unity.netcode.gameobjects",
            "com.unity.services.multiplayer",
            "com.unity.services.cloudsave",
            "com.unity.services.cloudcode",
            "com.unity.services.deployment",
            "com.unity.cinemachine"
        };

        public static void InstallOfficialPackages()
        {
            try
            {
                foreach (var packageName in Packages)
                {
                    Debug.Log($"[Mochi Pets] Ensuring Unity package: {packageName}");
                    AddRequest request = Client.Add(packageName);
                    while (!request.IsCompleted)
                    {
                        System.Threading.Thread.Sleep(250);
                    }

                    if (request.Status == StatusCode.Failure)
                    {
                        throw new InvalidOperationException($"Failed to install {packageName}: {request.Error.message}");
                    }

                    Debug.Log($"[Mochi Pets] Installed {request.Result.packageId}");
                }

                AssetDatabase.Refresh();
                EditorApplication.Exit(0);
            }
            catch (Exception ex)
            {
                Debug.LogException(ex);
                EditorApplication.Exit(1);
            }
        }
    }
}
