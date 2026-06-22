using System;
using MochiSocial.Data;
using UnityEngine;

namespace MochiSocial.Runtime
{
    public sealed class LirabaoPetController : MonoBehaviour
    {
        [SerializeField] private Renderer bodyRenderer;
        [SerializeField] private Color idleColor = new Color(0.98f, 0.82f, 0.86f);
        [SerializeField] private Color happyColor = new Color(1.00f, 0.72f, 0.58f);
        [SerializeField] private Color curiousColor = new Color(0.77f, 0.95f, 0.86f);
        [SerializeField] private Color reloadColor = new Color(0.74f, 0.80f, 0.96f);
        [SerializeField] private Color unavailableColor = new Color(0.66f, 0.68f, 0.70f);

        private Vector3 startPosition;

        public SharedPetState CurrentState { get; private set; } = SharedPetState.CreateDefault();
        public event Action<SharedPetState, string> LocalInteractionApplied;

        private void Awake()
        {
            startPosition = transform.position;
            ApplyVisualState();
        }

        private void Update()
        {
            var bob = Mathf.Sin(Time.time * 2.2f) * 0.08f;
            transform.position = startPosition + Vector3.up * bob;
            transform.Rotate(Vector3.up, 18f * Time.deltaTime, Space.World);
        }

        public void SetState(SharedPetState state)
        {
            if (state == null || !state.IsValid())
            {
                CurrentState = SharedPetState.CreateDefault();
            }
            else
            {
                CurrentState = state;
            }

            ApplyVisualState();
        }

        public void ShowStaleRevisionReload()
        {
            SetState(SharedPetState.CreateStaleRevisionReload(CurrentState));
        }

        public void ShowUnavailable()
        {
            SetState(SharedPetState.CreateUnavailable());
        }

        public bool TryApplyLocalInteraction(string interactionType, string actorId, long expectedRevision, out string error)
        {
            if (!SharedPetState.TryApplyInteraction(CurrentState, interactionType, actorId, expectedRevision, out var updated, out error))
            {
                return false;
            }

            SetState(updated);
            LocalInteractionApplied?.Invoke(CurrentState, interactionType);
            return true;
        }

        private void ApplyVisualState()
        {
            if (bodyRenderer == null)
            {
                bodyRenderer = GetComponentInChildren<Renderer>();
            }

            if (bodyRenderer == null)
            {
                return;
            }

            var targetColor = CurrentState.state switch
            {
                "stale_revision_reload" => reloadColor,
                "unavailable" => unavailableColor,
                _ => CurrentState.mood switch
                {
                    "comforted" => happyColor,
                    "playful" => happyColor,
                    "curious" => curiousColor,
                    _ => idleColor
                }
            };

            bodyRenderer.sharedMaterial.color = targetColor;
        }
    }
}
