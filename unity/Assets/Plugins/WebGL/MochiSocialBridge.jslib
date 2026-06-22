mergeInto(LibraryManager.library, {
  $MochiSocialBridgeRuntime: {
    installed: false,
    config: function () {
      if (typeof window === "undefined" || !window.__MOCHI_SOCIAL_UNITY_BRIDGE_CONFIG) {
        return {};
      }

      return window.__MOCHI_SOCIAL_UNITY_BRIDGE_CONFIG;
    },
    normalizeUrl: function (value) {
      return typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
    },
    allowedParentOrigins: function () {
      var config = MochiSocialBridgeRuntime.config();
      return Array.isArray(config.allowedParentOrigins) ? config.allowedParentOrigins : [];
    },
    isAllowedParentOrigin: function (origin) {
      var allowed = MochiSocialBridgeRuntime.allowedParentOrigins();
      return allowed.indexOf(origin) !== -1;
    },
    targetParentOrigin: function () {
      var config = MochiSocialBridgeRuntime.config();
      var target = typeof config.targetParentOrigin === "string" ? config.targetParentOrigin.trim() : "";
      if (target) return target;

      var allowed = MochiSocialBridgeRuntime.allowedParentOrigins();
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

      if (typeof window !== "undefined" && window.parent) {
        var targetOrigin = MochiSocialBridgeRuntime.targetParentOrigin();
        if (targetOrigin) {
          window.parent.postMessage(message, targetOrigin);
        }
      }
    },
    install: function () {
      if (typeof window === "undefined" || MochiSocialBridgeRuntime.installed) {
        return;
      }

      MochiSocialBridgeRuntime.installed = true;
      window.addEventListener("message", function (event) {
        var data = event.data || {};
        if (data.type !== "MOCHI_SOCIAL_AUTH" && data.type !== "MOCHI_SOCIAL_SIGN_OUT") {
          return;
        }

        if (!MochiSocialBridgeRuntime.isAllowedParentOrigin(event.origin)) {
          return;
        }

        var config = MochiSocialBridgeRuntime.config();
        var payload = data.payload || {};
        var normalized = {
          type: data.type,
          protocolVersion: data.protocolVersion || 1,
          accessToken: payload.accessToken || data.accessToken || "",
          expiresAt: payload.expiresAt || data.expiresAt || "",
          functionsUrl: MochiSocialBridgeRuntime.normalizeUrl(config.functionsUrl),
          unityAuthUrl: MochiSocialBridgeRuntime.normalizeUrl(config.unityAuthUrl),
          supabaseUrl: MochiSocialBridgeRuntime.normalizeUrl(config.supabaseUrl)
        };

        var json = JSON.stringify(normalized);
        if (typeof SendMessage === "function") {
          SendMessage("MochiSocialBootstrap", "OnParentBridgeMessage", json);
        }
      });
    }
  },
  MochiSocialBridgeReady__deps: ["$MochiSocialBridgeRuntime"],
  MochiSocialBridgeReady: function (payloadPtr) {
    MochiSocialBridgeRuntime.install();
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_READY", payloadPtr);
  },
  MochiSocialBridgeAuthState__deps: ["$MochiSocialBridgeRuntime"],
  MochiSocialBridgeAuthState: function (payloadPtr) {
    MochiSocialBridgeRuntime.install();
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_AUTH_STATE", payloadPtr);
  },
  MochiSocialBridgeError__deps: ["$MochiSocialBridgeRuntime"],
  MochiSocialBridgeError: function (payloadPtr) {
    MochiSocialBridgeRuntime.install();
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_ERROR", payloadPtr);
  }
});
