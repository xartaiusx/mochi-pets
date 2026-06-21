using System.IO;
using MochiSocial.Core;
using MochiSocial.Runtime;
using Unity.Netcode;
using Unity.Netcode.Components;
using Unity.Netcode.Transports.UTP;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MochiSocial.Editor
{
    public static class MochiSocialProjectBootstrap
    {
        private const string ScenePath = "Assets/MochiSocial/Scenes/JadeLanternRoom.unity";
        private const string AvatarPrefabPath = "Assets/MochiSocial/Prefabs/MochiAvatar.prefab";
        private const string MaterialFolder = "Assets/MochiSocial/Art/Materials";

        public static void RunAll()
        {
            ConfigureProject();
            EnsureFolders();
            var materials = CreateMaterials();
            var avatarPrefab = CreateAvatarPrefab(materials);
            CreateJadeLanternRoom(materials, avatarPrefab);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[Mochi Social] Unity project bootstrap complete.");
        }

        public static void BuildWebGL()
        {
            RunAll();
            var outputPath = "Builds/WebGL";
            Directory.CreateDirectory(outputPath);
            var report = BuildPipeline.BuildPlayer(
                new[] { ScenePath },
                outputPath,
                BuildTarget.WebGL,
                BuildOptions.None);

            if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
            {
                throw new System.InvalidOperationException($"WebGL build failed: {report.summary.result}");
            }
        }

        private static void ConfigureProject()
        {
            PlayerSettings.companyName = "Mochirii";
            PlayerSettings.productName = "Mochi Social";
            EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.WebGL, BuildTarget.WebGL);
        }

        private static void EnsureFolders()
        {
            foreach (var folder in new[]
                     {
                         "Assets/MochiSocial",
                         "Assets/MochiSocial/Scenes",
                         "Assets/MochiSocial/Scripts",
                         "Assets/MochiSocial/Prefabs",
                         "Assets/MochiSocial/ScriptableObjects",
                         "Assets/MochiSocial/Art",
                         MaterialFolder,
                         "Assets/MochiSocial/UI",
                         "Assets/Plugins/WebGL",
                         "Assets/MochiSocial/Tests"
                     })
            {
                if (!AssetDatabase.IsValidFolder(folder))
                {
                    var parent = Path.GetDirectoryName(folder)?.Replace('\\', '/');
                    var name = Path.GetFileName(folder);
                    AssetDatabase.CreateFolder(string.IsNullOrWhiteSpace(parent) ? "Assets" : parent, name);
                }
            }
        }

        private static MaterialSet CreateMaterials()
        {
            return new MaterialSet
            {
                Jade = SaveMaterial("JadeMat", new Color(0.23f, 0.57f, 0.49f), 0.35f),
                DeepJade = SaveMaterial("DeepJadeMat", new Color(0.10f, 0.33f, 0.31f), 0.2f),
                Timber = SaveMaterial("TimberMat", new Color(0.38f, 0.18f, 0.12f), 0.15f),
                Stone = SaveMaterial("StoneMat", new Color(0.47f, 0.50f, 0.47f), 0.1f),
                Lantern = SaveMaterial("LanternMat", new Color(0.95f, 0.42f, 0.23f), 0.25f),
                Paper = SaveMaterial("PaperMat", new Color(0.88f, 0.78f, 0.58f), 0.1f),
                Rock = SaveMaterial("ScholarRockMat", new Color(0.16f, 0.19f, 0.18f), 0.05f),
                Lirabao = SaveMaterial("LirabaoMat", new Color(0.98f, 0.82f, 0.86f), 0.35f),
                Avatar = SaveMaterial("AvatarMat", new Color(0.20f, 0.56f, 0.48f), 0.3f)
            };
        }

        private static Material SaveMaterial(string name, Color color, float smoothness)
        {
            var path = $"{MaterialFolder}/{name}.mat";
            var material = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (material == null)
            {
                material = new Material(Shader.Find("Universal Render Pipeline/Lit"));
                AssetDatabase.CreateAsset(material, path);
            }

            material.color = color;
            material.SetFloat("_Smoothness", smoothness);
            EditorUtility.SetDirty(material);
            return material;
        }

        private static GameObject CreateAvatarPrefab(MaterialSet materials)
        {
            var root = new GameObject("MochiAvatar");
            root.tag = "Player";
            root.AddComponent<CharacterController>();
            root.AddComponent<MochiAvatarController>();
            root.AddComponent<NetworkObject>();
            root.AddComponent<NetworkTransform>();

            var body = CreatePrimitive(PrimitiveType.Capsule, "Body", new Vector3(0f, 0.9f, 0f), new Vector3(0.72f, 0.9f, 0.72f), materials.Avatar, root.transform);
            var head = CreatePrimitive(PrimitiveType.Sphere, "Head", new Vector3(0f, 1.75f, 0f), new Vector3(0.52f, 0.52f, 0.52f), materials.Paper, root.transform);
            var sash = CreatePrimitive(PrimitiveType.Cube, "Jade Sash", new Vector3(0f, 1.02f, -0.36f), new Vector3(0.76f, 0.12f, 0.08f), materials.DeepJade, root.transform);
            body.isStatic = false;
            head.isStatic = false;
            sash.isStatic = false;

            var prefab = PrefabUtility.SaveAsPrefabAsset(root, AvatarPrefabPath);
            Object.DestroyImmediate(root);
            return prefab;
        }

        private static void CreateJadeLanternRoom(MaterialSet materials, GameObject avatarPrefab)
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "JadeLanternRoom";

            RenderSettings.ambientLight = new Color(0.42f, 0.36f, 0.30f);
            Lightmapping.giWorkflowMode = Lightmapping.GIWorkflowMode.OnDemand;
            LightmapEditorSettings.lightmapper = LightmapEditorSettings.Lightmapper.ProgressiveCPU;

            var roomRoot = new GameObject("Jade Lantern Room");
            CreateFloorAndWalls(materials, roomRoot.transform);
            CreateMoonGate(materials, roomRoot.transform);
            CreateTimberFrame(materials, roomRoot.transform);
            CreateLanterns(materials, roomRoot.transform);
            CreateScholarRock(materials, roomRoot.transform);
            CreateJadeAccents(materials, roomRoot.transform);

            var spawnPoint = new GameObject("Avatar Spawn Point").transform;
            spawnPoint.position = new Vector3(0f, 0.05f, -2.9f);

            var lirabao = CreateLirabao(materials);
            var bootstrap = CreateBootstrap(avatarPrefab, spawnPoint, lirabao);
            CreateNetworkManager(avatarPrefab);
            CreateCamera(bootstrap);
            CreateLighting();

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };
        }

        private static void CreateFloorAndWalls(MaterialSet materials, Transform parent)
        {
            CreatePrimitive(PrimitiveType.Cube, "Stone Floor", new Vector3(0f, -0.05f, 0f), new Vector3(16f, 0.1f, 12f), materials.Stone, parent);
            CreatePrimitive(PrimitiveType.Cube, "North Paper Wall", new Vector3(0f, 2f, 5.9f), new Vector3(16f, 4f, 0.18f), materials.Paper, parent);
            CreatePrimitive(PrimitiveType.Cube, "West Paper Wall", new Vector3(-7.9f, 2f, 0f), new Vector3(0.18f, 4f, 12f), materials.Paper, parent);
            CreatePrimitive(PrimitiveType.Cube, "East Paper Wall", new Vector3(7.9f, 2f, 0f), new Vector3(0.18f, 4f, 12f), materials.Paper, parent);
            CreatePrimitive(PrimitiveType.Cube, "Stone Step Path", new Vector3(0f, 0.02f, -1.1f), new Vector3(3.2f, 0.08f, 7.6f), materials.DeepJade, parent);
        }

        private static void CreateMoonGate(MaterialSet materials, Transform parent)
        {
            var gate = new GameObject("Moon Gate Ring");
            gate.transform.SetParent(parent);
            const int segments = 18;
            const float radius = 2.2f;
            for (var i = 0; i < segments; i++)
            {
                var angle = i * Mathf.PI * 2f / segments;
                var position = new Vector3(Mathf.Cos(angle) * radius, 2.35f + Mathf.Sin(angle) * radius, 5.55f);
                var block = CreatePrimitive(PrimitiveType.Cube, $"Moon Gate Block {i:00}", position, new Vector3(0.82f, 0.22f, 0.48f), materials.Jade, gate.transform);
                block.transform.rotation = Quaternion.Euler(0f, 0f, angle * Mathf.Rad2Deg);
            }
        }

        private static void CreateTimberFrame(MaterialSet materials, Transform parent)
        {
            for (var x = -7f; x <= 7f; x += 7f)
            {
                CreatePrimitive(PrimitiveType.Cube, $"Timber Pillar {x}", new Vector3(x, 2f, -5.2f), new Vector3(0.38f, 4f, 0.38f), materials.Timber, parent);
                CreatePrimitive(PrimitiveType.Cube, $"Back Timber Pillar {x}", new Vector3(x, 2f, 5.45f), new Vector3(0.38f, 4f, 0.38f), materials.Timber, parent);
            }

            CreatePrimitive(PrimitiveType.Cube, "Front Timber Beam", new Vector3(0f, 4.1f, -5.2f), new Vector3(15f, 0.32f, 0.32f), materials.Timber, parent);
            CreatePrimitive(PrimitiveType.Cube, "Back Timber Beam", new Vector3(0f, 4.1f, 5.45f), new Vector3(15f, 0.32f, 0.32f), materials.Timber, parent);
            CreatePrimitive(PrimitiveType.Cube, "Left Timber Beam", new Vector3(-7.2f, 4.1f, 0f), new Vector3(0.32f, 0.32f, 11f), materials.Timber, parent);
            CreatePrimitive(PrimitiveType.Cube, "Right Timber Beam", new Vector3(7.2f, 4.1f, 0f), new Vector3(0.32f, 0.32f, 11f), materials.Timber, parent);
        }

        private static void CreateLanterns(MaterialSet materials, Transform parent)
        {
            foreach (var position in new[] { new Vector3(-4.8f, 3.1f, -4.1f), new Vector3(4.8f, 3.1f, -4.1f), new Vector3(-5.8f, 3.2f, 3.8f), new Vector3(5.8f, 3.2f, 3.8f) })
            {
                var lantern = CreatePrimitive(PrimitiveType.Sphere, "Warm Lantern", position, new Vector3(0.48f, 0.62f, 0.48f), materials.Lantern, parent);
                var light = lantern.AddComponent<Light>();
                light.type = LightType.Point;
                light.color = new Color(1f, 0.64f, 0.32f);
                light.intensity = 2.2f;
                light.range = 5.2f;
                light.lightmapBakeType = LightmapBakeType.Baked;
            }
        }

        private static void CreateScholarRock(MaterialSet materials, Transform parent)
        {
            var rockRoot = new GameObject("Scholar Rock Silhouette");
            rockRoot.transform.SetParent(parent);
            CreatePrimitive(PrimitiveType.Sphere, "Scholar Rock Base", new Vector3(-5.1f, 0.55f, 2.2f), new Vector3(1.0f, 1.1f, 0.8f), materials.Rock, rockRoot.transform);
            CreatePrimitive(PrimitiveType.Sphere, "Scholar Rock Middle", new Vector3(-5.25f, 1.35f, 2.15f), new Vector3(0.72f, 1.0f, 0.62f), materials.Rock, rockRoot.transform);
            CreatePrimitive(PrimitiveType.Sphere, "Scholar Rock Top", new Vector3(-5.0f, 2.12f, 2.05f), new Vector3(0.48f, 0.72f, 0.42f), materials.Rock, rockRoot.transform);
        }

        private static void CreateJadeAccents(MaterialSet materials, Transform parent)
        {
            CreatePrimitive(PrimitiveType.Cylinder, "Jade Offering Table", new Vector3(3.8f, 0.42f, 2.1f), new Vector3(1.4f, 0.22f, 1.4f), materials.Jade, parent);
            CreatePrimitive(PrimitiveType.Cube, "Low Tea Bench", new Vector3(-2.8f, 0.28f, 2.6f), new Vector3(2.2f, 0.28f, 0.8f), materials.Timber, parent);
        }

        private static LirabaoPetController CreateLirabao(MaterialSet materials)
        {
            var root = new GameObject("Lirabao Shared Spirit");
            root.transform.position = new Vector3(0f, 0.62f, 1.5f);

            var body = CreatePrimitive(PrimitiveType.Sphere, "Lirabao Body", root.transform.position, new Vector3(0.9f, 0.72f, 0.9f), materials.Lirabao, root.transform);
            body.transform.localPosition = Vector3.zero;
            CreatePrimitive(PrimitiveType.Sphere, "Lirabao Left Ear", new Vector3(-0.28f, 0.42f, 0f), new Vector3(0.28f, 0.28f, 0.28f), materials.Lirabao, root.transform);
            CreatePrimitive(PrimitiveType.Sphere, "Lirabao Right Ear", new Vector3(0.28f, 0.42f, 0f), new Vector3(0.28f, 0.28f, 0.28f), materials.Lirabao, root.transform);

            var controller = root.AddComponent<LirabaoPetController>();
            var prompt = root.AddComponent<LirabaoInteractionPrompt>();
            var labelObject = new GameObject("Interaction Prompt");
            labelObject.transform.SetParent(root.transform);
            labelObject.transform.localPosition = new Vector3(0f, 1.15f, 0f);
            var label = labelObject.AddComponent<TextMesh>();
            label.text = "E";
            label.anchor = TextAnchor.MiddleCenter;
            label.alignment = TextAlignment.Center;
            label.characterSize = 0.28f;
            label.color = Color.white;
            label.gameObject.SetActive(false);

            var serializedPrompt = new SerializedObject(prompt);
            serializedPrompt.FindProperty("promptLabel").objectReferenceValue = label;
            serializedPrompt.ApplyModifiedPropertiesWithoutUndo();

            var serializedController = new SerializedObject(controller);
            serializedController.FindProperty("bodyRenderer").objectReferenceValue = body.GetComponent<Renderer>();
            serializedController.ApplyModifiedPropertiesWithoutUndo();
            return controller;
        }

        private static MochiSocialBootstrap CreateBootstrap(GameObject avatarPrefab, Transform spawnPoint, LirabaoPetController lirabao)
        {
            var bootstrapObject = new GameObject(MochiSocialConstants.BootstrapObjectName);
            var bootstrap = bootstrapObject.AddComponent<MochiSocialBootstrap>();
            var serialized = new SerializedObject(bootstrap);
            serialized.FindProperty("avatarPrefab").objectReferenceValue = avatarPrefab;
            serialized.FindProperty("spawnPoint").objectReferenceValue = spawnPoint;
            serialized.FindProperty("lirabao").objectReferenceValue = lirabao;
            serialized.ApplyModifiedPropertiesWithoutUndo();

            var prompt = lirabao.GetComponent<LirabaoInteractionPrompt>();
            var promptSerialized = new SerializedObject(prompt);
            promptSerialized.FindProperty("bootstrap").objectReferenceValue = bootstrap;
            promptSerialized.ApplyModifiedPropertiesWithoutUndo();
            return bootstrap;
        }

        private static void CreateNetworkManager(GameObject avatarPrefab)
        {
            var networkObject = new GameObject("NetworkManager");
            var networkManager = networkObject.AddComponent<NetworkManager>();
            networkObject.AddComponent<UnityTransport>();
            networkManager.NetworkConfig.NetworkTopology = NetworkTopologyTypes.DistributedAuthority;
            networkManager.NetworkConfig.PlayerPrefab = avatarPrefab;
            networkManager.NetworkConfig.EnableSceneManagement = true;
        }

        private static void CreateCamera(MochiSocialBootstrap bootstrap)
        {
            var cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";
            cameraObject.transform.position = new Vector3(0f, 5.7f, -7.8f);
            cameraObject.transform.rotation = Quaternion.Euler(54f, 0f, 0f);
            var camera = cameraObject.AddComponent<Camera>();
            camera.fieldOfView = 48f;
            camera.clearFlags = CameraClearFlags.Skybox;
            var follow = cameraObject.AddComponent<MochiCameraFollow>();

            var serialized = new SerializedObject(bootstrap);
            serialized.FindProperty("cameraFollow").objectReferenceValue = follow;
            serialized.ApplyModifiedPropertiesWithoutUndo();
        }

        private static void CreateLighting()
        {
            var sunObject = new GameObject("Dusk Directional Light");
            sunObject.transform.rotation = Quaternion.Euler(48f, -32f, 0f);
            var sun = sunObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.color = new Color(1f, 0.78f, 0.58f);
            sun.intensity = 1.2f;
            sun.lightmapBakeType = LightmapBakeType.Mixed;
        }

        private static GameObject CreatePrimitive(PrimitiveType type, string name, Vector3 position, Vector3 scale, Material material, Transform parent)
        {
            var obj = GameObject.CreatePrimitive(type);
            obj.name = name;
            obj.transform.SetParent(parent);
            obj.transform.position = position;
            obj.transform.localScale = scale;
            var renderer = obj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.sharedMaterial = material;
            }
            return obj;
        }

        private sealed class MaterialSet
        {
            public Material Jade;
            public Material DeepJade;
            public Material Timber;
            public Material Stone;
            public Material Lantern;
            public Material Paper;
            public Material Rock;
            public Material Lirabao;
            public Material Avatar;
        }
    }
}
