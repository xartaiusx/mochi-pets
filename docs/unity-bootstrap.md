# Unity WebGL Shared Room Bootstrap

This repo now contains the Unity runtime at `unity/`. It was created with the installed Unity editor `6000.5.0f1`, using the Unity Hub `3D Cross-Platform` template and WebGL support already present on the workstation.

## Runtime Scope

- Engine: Unity WebGL, URP, desktop browser target.
- Scene: `Assets/MochiSocial/Scenes/JadeLanternRoom.unity`.
- Room: `jade-lantern-room-alpha`, single shared room, capacity 25.
- Shared pet: universal starter Lirabao, state key `room:jade-lantern-room/sharedPet.v1`.
- Character save: UGS Player Data key `character.v1`.
- Character creation: three curated presets only, no avatar upload path.
- Live state: avatar transforms and emotes are session-only.

## Unity Packages

Installed through Unity Package Manager from the Unity registry:

- Netcode for GameObjects `2.12.0`
- Multiplayer Services `2.2.3`
- Cloud Save `3.4.1`
- Cloud Code `2.10.3`
- Deployment `1.7.2`
- Input System `1.19.0`
- Cinemachine `3.1.7`
- URP `17.5.0`

## Bridge And Auth

The WebGL bridge keeps protocol v1:

- Parent to Unity: `MOCHI_SOCIAL_AUTH`, `MOCHI_SOCIAL_SIGN_OUT`
- Unity to parent: `MOCHI_SOCIAL_READY`, `MOCHI_SOCIAL_AUTH_STATE`, `MOCHI_SOCIAL_ERROR`

Unity receives only a Supabase access token from the parent. It calls the server-side `mochi-social-unity-auth` Edge Function, then processes the returned Unity player tokens with Unity Authentication. Supabase service-role keys, Unity service credentials, game-server tokens, Enjin secrets, and provider admin credentials must never enter Unity code, browser code, logs, docs, or PR text.

## Cloud Code

Deployable JavaScript Cloud Code scripts live in `Assets/MochiSocial/CloudCode/`:

- `mochiSocialLoadSharedPet` reads or bootstraps the shared Lirabao Game Data item.
- `mochiSocialInteractSharedPet` validates the room/pet key, rejects stale revisions, applies `approach`, `care`, or `wave`, saves the next Lirabao state, and optionally mirrors `unity.pet.state_saved` to Supabase.

The Supabase audit mirror is optional until provider setup is approved. If enabled, store `MOCHI_SOCIAL_ALPHA_ACTION_URL` and `MOCHI_SOCIAL_GAME_SERVER_TOKEN` in Unity Secret Manager for Cloud Code access only. Do not pass the game-server token from Unity WebGL, browser code, docs, logs, or PR comments.

## Visual Reference Authority

The blockout uses project-authored primitives and materials. Visual direction should stay in the Cozy Wushu / Jade Lantern Room lane, with external references used only as architecture and atmosphere references:

- The Met Astor Chinese Garden Court
- UNESCO Classical Gardens of Suzhou
- V&A China collection

No third-party art package or museum image is copied into the runtime.

## Local Commands

Open the project:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.5.0f1\Editor\Unity.exe' -projectPath 'C:\Users\xtyty\Documents\mochi-social\unity'
```

Regenerate the bootstrap scene and prefab:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.5.0f1\Editor\Unity.exe' -batchmode -quit -projectPath 'C:\Users\xtyty\Documents\mochi-social\unity' -executeMethod MochiSocial.Editor.MochiSocialProjectBootstrap.RunAll -logFile 'C:\Users\xtyty\Documents\mochi-social\.local\unity-bootstrap.log'
```

Run Unity tests:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.5.0f1\Editor\Unity.exe' -batchmode -quit -projectPath 'C:\Users\xtyty\Documents\mochi-social\unity' -runTests -testPlatform EditMode -testResults 'C:\Users\xtyty\Documents\mochi-social\.local\unity-editmode-results.xml' -logFile 'C:\Users\xtyty\Documents\mochi-social\.local\unity-editmode.log'
& 'C:\Program Files\Unity\Hub\Editor\6000.5.0f1\Editor\Unity.exe' -batchmode -quit -projectPath 'C:\Users\xtyty\Documents\mochi-social\unity' -runTests -testPlatform PlayMode -testResults 'C:\Users\xtyty\Documents\mochi-social\.local\unity-playmode-results.xml' -logFile 'C:\Users\xtyty\Documents\mochi-social\.local\unity-playmode.log'
```

Build WebGL locally:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.5.0f1\Editor\Unity.exe' -batchmode -quit -projectPath 'C:\Users\xtyty\Documents\mochi-social\unity' -executeMethod MochiSocial.Editor.MochiSocialProjectBootstrap.BuildWebGL -logFile 'C:\Users\xtyty\Documents\mochi-social\.local\unity-webgl-build.log'
```

Provider setup, UGS dashboard changes, deployments, hosted checks, load tests, paid usage, and secret mutation still require explicit approval.
