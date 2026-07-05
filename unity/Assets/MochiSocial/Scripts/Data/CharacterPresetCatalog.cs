using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace MochiSocial.Data
{
    public static class CharacterPresetCatalog
    {
        private static readonly CharacterPreset[] Presets =
        {
            new CharacterPreset
            {
                id = "jade_wayfarer",
                label = "Jade Wayfarer",
                body = "soft-rounded",
                hair = "short-ribbon",
                outfit = "travel-robe",
                primaryColor = new Color(0.20f, 0.56f, 0.48f),
                accentColor = new Color(0.95f, 0.74f, 0.38f)
            },
            new CharacterPreset
            {
                id = "lotus_guardian",
                label = "Lotus Guardian",
                body = "steady",
                hair = "high-knot",
                outfit = "training-wrap",
                primaryColor = new Color(0.60f, 0.24f, 0.34f),
                accentColor = new Color(0.72f, 0.86f, 0.78f)
            },
            new CharacterPreset
            {
                id = "lantern_scholar",
                label = "Lantern Scholar",
                body = "slim",
                hair = "long-tie",
                outfit = "scholar-coat",
                primaryColor = new Color(0.18f, 0.27f, 0.42f),
                accentColor = new Color(0.86f, 0.55f, 0.30f)
            }
        };

        public static IReadOnlyList<CharacterPreset> All => Presets;

        public static IReadOnlyList<string> AllowedPresetIds => Presets.Select(preset => preset.id).ToArray();

        public static bool TryGetPreset(string presetId, out CharacterPreset preset)
        {
            preset = Presets.FirstOrDefault(candidate => string.Equals(candidate.id, presetId, StringComparison.Ordinal));
            return preset != null;
        }

        public static bool TryGetPresetAt(int index, out CharacterPreset preset)
        {
            if (index < 0 || index >= Presets.Length)
            {
                preset = null;
                return false;
            }

            preset = Presets[index];
            return true;
        }

        public static bool TryGetPresetIndex(string presetId, out int index)
        {
            for (var candidateIndex = 0; candidateIndex < Presets.Length; candidateIndex += 1)
            {
                if (string.Equals(Presets[candidateIndex].id, presetId, StringComparison.Ordinal))
                {
                    index = candidateIndex;
                    return true;
                }
            }

            index = -1;
            return false;
        }

        public static CharacterState CreateDefault(string displayNameReference = "member-display-name")
        {
            var preset = Presets[0];
            return FromPreset(preset, displayNameReference, Vector3.zero, 0);
        }

        public static CharacterState FromPreset(CharacterPreset preset, string displayNameReference, Vector3 spawnPoint, long revision)
        {
            return new CharacterState
            {
                presetId = preset.id,
                body = preset.body,
                hair = preset.hair,
                outfit = preset.outfit,
                primaryColor = ColorToHex(preset.primaryColor),
                accentColor = ColorToHex(preset.accentColor),
                displayNameReference = string.IsNullOrWhiteSpace(displayNameReference) ? "member-display-name" : displayNameReference,
                lastSpawnPoint = spawnPoint,
                revision = revision
            };
        }

        public static CharacterState WithLastSpawnPoint(CharacterState state, Vector3 spawnPoint)
        {
            if (!IsValid(state) || !TryGetPreset(state.presetId, out var preset))
            {
                return null;
            }

            return new CharacterState
            {
                presetId = state.presetId,
                body = preset.body,
                hair = preset.hair,
                outfit = preset.outfit,
                primaryColor = ColorToHex(preset.primaryColor),
                accentColor = ColorToHex(preset.accentColor),
                displayNameReference = state.displayNameReference,
                lastSpawnPoint = spawnPoint,
                revision = state.revision + 1
            };
        }

        public static bool IsValid(CharacterState state)
        {
            return state != null &&
                   state.version == 1 &&
                   TryGetPreset(state.presetId, out var preset) &&
                   string.Equals(state.body, preset.body, StringComparison.Ordinal) &&
                   string.Equals(state.hair, preset.hair, StringComparison.Ordinal) &&
                   string.Equals(state.outfit, preset.outfit, StringComparison.Ordinal) &&
                   string.Equals(state.primaryColor, ColorToHex(preset.primaryColor), StringComparison.OrdinalIgnoreCase) &&
                   string.Equals(state.accentColor, ColorToHex(preset.accentColor), StringComparison.OrdinalIgnoreCase) &&
                   !string.IsNullOrWhiteSpace(state.displayNameReference) &&
                   state.revision >= 0;
        }

        private static string ColorToHex(Color color)
        {
            return ColorUtility.ToHtmlStringRGB(color);
        }
    }
}
