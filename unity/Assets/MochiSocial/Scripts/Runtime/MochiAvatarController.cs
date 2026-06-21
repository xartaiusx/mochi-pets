using System.Collections;
using UnityEngine;

namespace MochiSocial.Runtime
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class MochiAvatarController : MonoBehaviour
    {
        [SerializeField] private float moveSpeed = 3.2f;
        [SerializeField] private float turnSpeed = 12f;
        [SerializeField] private Transform visualRoot;

        private CharacterController controller;
        private bool waving;

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (visualRoot == null)
            {
                visualRoot = transform;
            }
        }

        private void Update()
        {
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
    }
}
