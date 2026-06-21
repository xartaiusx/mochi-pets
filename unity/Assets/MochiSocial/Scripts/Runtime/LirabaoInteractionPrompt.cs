using UnityEngine;

namespace MochiSocial.Runtime
{
    public sealed class LirabaoInteractionPrompt : MonoBehaviour
    {
        [SerializeField] private MochiSocialBootstrap bootstrap;
        [SerializeField] private Transform target;
        [SerializeField] private TextMesh promptLabel;
        [SerializeField] private float interactionDistance = 2.4f;

        private Transform player;

        private void Awake()
        {
            if (target == null)
            {
                target = transform;
            }

            if (bootstrap == null)
            {
                bootstrap = FindFirstObjectByType<MochiSocialBootstrap>();
            }
        }

        private void Update()
        {
            if (player == null)
            {
                var playerObject = GameObject.FindWithTag("Player");
                if (playerObject != null)
                {
                    player = playerObject.transform;
                }
            }

            var canInteract = player != null && Vector3.Distance(player.position, target.position) <= interactionDistance;
            if (promptLabel != null)
            {
                promptLabel.gameObject.SetActive(canInteract);
            }

            if (canInteract && (Input.GetKeyDown(KeyCode.E) || Input.GetKeyDown(KeyCode.Return)))
            {
                bootstrap?.InteractWithLirabao("care");
            }
        }
    }
}
