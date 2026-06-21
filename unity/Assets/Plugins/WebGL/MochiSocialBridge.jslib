var MochiSocialBridgeRuntime = typeof MochiSocialBridgeRuntime !== "undefined" ? MochiSocialBridgeRuntime : {
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
      window.parent.postMessage(message, "*");
    }
  }
};

mergeInto(LibraryManager.library, {
  MochiSocialBridgeReady: function (payloadPtr) {
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_READY", payloadPtr);
  },
  MochiSocialBridgeAuthState: function (payloadPtr) {
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_AUTH_STATE", payloadPtr);
  },
  MochiSocialBridgeError: function (payloadPtr) {
    MochiSocialBridgeRuntime.post("MOCHI_SOCIAL_ERROR", payloadPtr);
  }
});

(function () {
  if (typeof window === "undefined" || window.__mochiSocialBridgeInstalled) {
    return;
  }

  window.__mochiSocialBridgeInstalled = true;
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type !== "MOCHI_SOCIAL_AUTH" && data.type !== "MOCHI_SOCIAL_SIGN_OUT") {
      return;
    }

    var payload = data.payload || {};
    var normalized = {
      type: data.type,
      protocolVersion: data.protocolVersion || 1,
      accessToken: payload.accessToken || data.accessToken || "",
      expiresAt: payload.expiresAt || data.expiresAt || "",
      functionsUrl: payload.functionsUrl || payload.supabaseFunctionsUrl || data.functionsUrl || "",
      unityAuthUrl: payload.unityAuthUrl || data.unityAuthUrl || "",
      supabaseUrl: payload.supabaseUrl || data.supabaseUrl || ""
    };

    var json = JSON.stringify(normalized);
    if (typeof SendMessage === "function") {
      SendMessage("MochiSocialBootstrap", "OnParentBridgeMessage", json);
    }
  });
})();
