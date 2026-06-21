namespace MochiSocial.Core
{
    public static class MochiSocialConstants
    {
        public const int BridgeProtocolVersion = 1;
        public const string RoomSessionId = "jade-lantern-room-alpha";
        public const string RoomDisplayName = "Jade Lantern Room Alpha";
        public const string RoomMode = "single-shared-room";
        public const int RoomCapacity = 25;
        public const string SharedPetKey = "lirabao";
        public const string SharedPetDisplayName = "Lirabao";
        public const string CharacterSaveKey = "character.v1";
        public const string SharedPetSaveKey = "room:jade-lantern-room/sharedPet.v1";
        public const string UnityAuthFunctionName = "mochi-social-unity-auth";
        public const string SharedPetLoadFunction = "mochiSocialLoadSharedPet";
        public const string SharedPetInteractFunction = "mochiSocialInteractSharedPet";
        public const string BootstrapObjectName = "MochiSocialBootstrap";
    }
}
