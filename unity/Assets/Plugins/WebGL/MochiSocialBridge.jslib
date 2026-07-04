mergeInto(LibraryManager.library, {
  $MochiPetsBridgeRuntime: {
    installed: false,
    config: function () {
      if (typeof window === "undefined" || !window.__MOCHI_PETS_UNITY_BRIDGE_CONFIG) {
        return {};
      }

      return window.__MOCHI_PETS_UNITY_BRIDGE_CONFIG;
    },
    normalizeUrl: function (value) {
      return typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
    },
    allowedParentOrigins: function () {
      var config = MochiPetsBridgeRuntime.config();
      return Array.isArray(config.allowedParentOrigins) ? config.allowedParentOrigins : [];
    },
    isAllowedParentOrigin: function (origin) {
      var allowed = MochiPetsBridgeRuntime.allowedParentOrigins();
      return allowed.indexOf(origin) !== -1;
    },
    targetParentOrigin: function () {
      var config = MochiPetsBridgeRuntime.config();
      var target = typeof config.targetParentOrigin === "string" ? config.targetParentOrigin.trim() : "";
      if (target) return target;

      var allowed = MochiPetsBridgeRuntime.allowedParentOrigins();
      return allowed.length ? allowed[0] : "";
    },
    post: function (type, payloadPtr) {
      var payload = {};
      if (payloadPtr) {
        try {
          payload = JSON.parse(UTF8ToString(payloadPtr));
        } catch (error) {
          payload = { parseError: String(error) };
        }
      }

      var message = {
        type: type,
        protocolVersion: 1,
        payload: payload
      };

      if (typeof window !== "undefined") {
        window.__MOCHI_PETS_UNITY_LAST_EVENT = message;
        if (type === "MOCHI_PETS_READY") {
          window.__MOCHI_PETS_UNITY_RUNTIME_READY = true;
        }
        if (typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
          window.dispatchEvent(new CustomEvent("mochi-pets-unity-event", { detail: message }));
        }
      }

      if (typeof window !== "undefined" && window.parent && window.parent !== window) {
        var targetOrigin = MochiPetsBridgeRuntime.targetParentOrigin();
        if (targetOrigin) {
          window.parent.postMessage(message, targetOrigin);
        }
      }
    },
    install: function () {
      if (typeof window === "undefined" || MochiPetsBridgeRuntime.installed) {
        return;
      }

      MochiPetsBridgeRuntime.installed = true;
      window.addEventListener("message", function (event) {
        var data = event.data || {};
        if (data.type !== "MOCHI_PETS_AUTH" && data.type !== "MOCHI_PETS_SIGN_OUT") {
          return;
        }

        if (!MochiPetsBridgeRuntime.isAllowedParentOrigin(event.origin)) {
          return;
        }

        var config = MochiPetsBridgeRuntime.config();
        var payload = data.payload || {};
        var normalized = {
          type: data.type,
          protocolVersion: data.protocolVersion || 1,
          accessToken: payload.accessToken || data.accessToken || "",
          expiresAt: payload.expiresAt || data.expiresAt || "",
          functionsUrl: MochiPetsBridgeRuntime.normalizeUrl(config.functionsUrl),
          unityAuthUrl: MochiPetsBridgeRuntime.normalizeUrl(config.unityAuthUrl),
          supabaseUrl: MochiPetsBridgeRuntime.normalizeUrl(config.supabaseUrl)
        };

        var json = JSON.stringify(normalized);
        if (typeof SendMessage === "function") {
          SendMessage("MochiSocialBootstrap", "OnParentBridgeMessage", json);
        }
      });
    }
  },
  MochiPetsBridgeReady__deps: ["$MochiPetsBridgeRuntime"],
  MochiPetsBridgeReady: function (payloadPtr) {
    MochiPetsBridgeRuntime.install();
    MochiPetsBridgeRuntime.post("MOCHI_PETS_READY", payloadPtr);
  },
  MochiPetsBridgeAuthState__deps: ["$MochiPetsBridgeRuntime"],
  MochiPetsBridgeAuthState: function (payloadPtr) {
    MochiPetsBridgeRuntime.install();
    MochiPetsBridgeRuntime.post("MOCHI_PETS_AUTH_STATE", payloadPtr);
  },
  MochiPetsBridgeError__deps: ["$MochiPetsBridgeRuntime"],
  MochiPetsBridgeError: function (payloadPtr) {
    MochiPetsBridgeRuntime.install();
    MochiPetsBridgeRuntime.post("MOCHI_PETS_ERROR", payloadPtr);
  }
});
