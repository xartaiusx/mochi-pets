using System.Collections;
using MochiSocial.Data;
using Unity.Netcode;
using UnityEngine;

namespace MochiSocial.Runtime
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class MochiAvatarController : NetworkBehaviour
    {
        [SerializeField] private float moveSpeed = 3.2f;
        [SerializeField] private float turnSpeed = 12f;
        [SerializeField] private Transform visualRoot;

        private readonly NetworkVariable<int> networkPresetIndex = new NetworkVariable<int>(
            0,
            NetworkVariableReadPermission.Everyone,
            NetworkVariableWritePermission.Owner);

        private readonly NetworkVariable<Color32> networkPrimaryColor = new NetworkVariable<Color32>(
            DefaultPrimaryColor(),
            NetworkVariableReadPermission.Everyone,
            NetworkVariableWritePermission.Owner);

        private readonly NetworkVariable<Color32> networkAccentColor = new NetworkVariable<Color32>(
            DefaultAccentColor(),
            NetworkVariableReadPermission.Everyone,
            NetworkVariableWritePermission.Owner);

        private CharacterController controller;
        private bool waving;

        public bool AcceptsLocalInput => !IsSpawned || IsOwner;
        public string CurrentPresetId { get; private set; } = CharacterPresetCatalog.All[0].id;
        public Color CurrentPrimaryColor { get; private set; } = CharacterPresetCatalog.All[0].primaryColor;
        public Color CurrentAccentColor { get; private set; } = CharacterPresetCatalog.All[0].accentColor;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (visualRoot == null)
            {
                visualRoot = transform;
            }

            ApplyAppearance(CurrentPresetId, CurrentPrimaryColor, CurrentAccentColor);
        }

        public override void OnNetworkSpawn()
        {
            networkPresetIndex.OnValueChanged += OnNetworkPresetChanged;
            networkPrimaryColor.OnValueChanged += OnNetworkPrimaryColorChanged;
            networkAccentColor.OnValueChanged += OnNetworkAccentColorChanged;
            ApplyNetworkAppearance();
        }

        public override void OnNetworkDespawn()
        {
            networkPresetIndex.OnValueChanged -= OnNetworkPresetChanged;
            networkPrimaryColor.OnValueChanged -= OnNetworkPrimaryColorChanged;
            networkAccentColor.OnValueChanged -= OnNetworkAccentColorChanged;
        }

        private void Update()
        {
            if (!AcceptsLocalInput)
            {
                return;
            }

            var input = new Vector3(Input.GetAxisRaw("Horizontal"), 0f, Input.GetAxisRaw("Vertical"));
            if (input.sqrMagnitude > 1f)
            {
                input.Normalize();
            }

            if (input.sqrMagnitude > 0.001f)
            {
                var targetRotation = Quaternion.LookRotation(input, Vector3.up);
                visualRoot.rotation = Quaternion.Slerp(visualRoot.rotation, targetRotation, turnSpeed * Time.deltaTime);
                controller.SimpleMove(input * moveSpeed);
            }
            else
            {
                controller.SimpleMove(Vector3.zero);
            }

            if (Input.GetKeyDown(KeyCode.Space) && !waving)
            {
                StartCoroutine(WaveRoutine());
            }
        }

        public bool ApplyCharacterState(CharacterState state)
        {
            if (!CharacterPresetCatalog.IsValid(state) || !CharacterPresetCatalog.TryGetPreset(state.presetId, out var preset))
            {
                return false;
            }

            var primary = ParseColorOrFallback(state.primaryColor, preset.primaryColor);
            var accent = ParseColorOrFallback(state.accentColor, preset.accentColor);
            ApplyAppearance(preset.id, primary, accent);

            if (IsSpawned && IsOwner && CharacterPresetCatalog.TryGetPresetIndex(preset.id, out var presetIndex))
            {
                networkPresetIndex.Value = presetIndex;
                networkPrimaryColor.Value = (Color32)primary;
                networkAccentColor.Value = (Color32)accent;
            }

            return true;
        }

        private IEnumerator WaveRoutine()
        {
            waving = true;
            var originalScale = visualRoot.localScale;
            visualRoot.localScale = originalScale * 1.08f;
            yield return new WaitForSeconds(0.18f);
            visualRoot.localScale = originalScale;
            yield return new WaitForSeconds(0.18f);
            waving = false;
        }

        private void OnNetworkPresetChanged(int previousValue, int newValue)
        {
            ApplyNetworkAppearance();
        }

        private void OnNetworkPrimaryColorChanged(Color32 previousValue, Color32 newValue)
        {
            ApplyNetworkAppearance();
        }

        private void OnNetworkAccentColorChanged(Color32 previousValue, Color32 newValue)
        {
            ApplyNetworkAppearance();
        }

        private void ApplyNetworkAppearance()
        {
            var preset = CharacterPresetCatalog.TryGetPresetAt(networkPresetIndex.Value, out var networkPreset)
                ? networkPreset
                : CharacterPresetCatalog.All[0];
            ApplyAppearance(preset.id, networkPrimaryColor.Value, networkAccentColor.Value);
        }

        private void ApplyAppearance(string presetId, Color primary, Color accent)
        {
            CurrentPresetId = presetId;
            CurrentPrimaryColor = primary;
            CurrentAccentColor = accent;

            foreach (var renderer in GetComponentsInChildren<Renderer>())
            {
                var targetColor = renderer.gameObject.name.ToLowerInvariant().Contains("sash") ? accent : primary;
                renderer.material.color = targetColor;
            }
        }

        private static Color ParseColorOrFallback(string rgb, Color fallback)
        {
            return ColorUtility.TryParseHtmlString($"#{rgb}", out var parsed) ? parsed : fallback;
        }

        private static Color32 DefaultPrimaryColor()
        {
            return CharacterPresetCatalog.All[0].primaryColor;
        }

        private static Color32 DefaultAccentColor()
        {
            return CharacterPresetCatalog.All[0].accentColor;
        }
    }
}
