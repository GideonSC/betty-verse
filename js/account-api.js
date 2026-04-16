(function (window) {
  "use strict";

  var STORAGE_KEYS = {
    session: "bettyverse-auth-session",
    accountMock: "bettyverse-account-mock"
  };

  var config = window.BettyVerseConfig || {};
  window.BettyVerseConfig = config;

  if (typeof config.apiBaseUrl !== "string") {
    config.apiBaseUrl = "/api";
  }
  if (typeof config.useMockAccountData !== "boolean") {
    config.useMockAccountData = true;
  }
  if (typeof config.sendCredentials !== "boolean") {
    config.sendCredentials = true;
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function getSession() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEYS.session);
      if (!raw) {
        return null;
      }
      return safeJsonParse(raw, null);
    } catch (error) {
      return null;
    }
  }

  function setSession(session) {
    if (!session) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } catch (error) {
      return;
    }
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.session);
    } catch (error) {
      return;
    }
  }

  function buildUrl(path) {
    if (!path) {
      return config.apiBaseUrl;
    }
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    var base = String(config.apiBaseUrl || "").replace(/\/+$/, "");
    var cleanPath = String(path).charAt(0) === "/" ? String(path) : "/" + String(path);

    return base + cleanPath;
  }

  function normalizeErrorMessage(payload, fallback) {
    if (!payload) {
      return fallback;
    }
    if (typeof payload === "string") {
      return payload;
    }
    if (payload.message) {
      return String(payload.message);
    }
    if (payload.error) {
      return String(payload.error);
    }
    return fallback;
  }

  function createHttpClient() {
    function request(method, path, options) {
      var requestOptions = options || {};
      var body = requestOptions.body;
      var headers = requestOptions.headers || {};
      var session = getSession();
      var token = session && session.token ? session.token : "";
      var finalHeaders = {
        Accept: "application/json"
      };

      Object.keys(headers).forEach(function (key) {
        finalHeaders[key] = headers[key];
      });

      if (token && !finalHeaders.Authorization) {
        finalHeaders.Authorization = "Bearer " + token;
      }

      if (body && !(body instanceof window.FormData) && !finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
      }

      return window
        .fetch(buildUrl(path), {
          method: method,
          headers: finalHeaders,
          credentials: config.sendCredentials ? "include" : "same-origin",
          body: body && body instanceof window.FormData ? body : body ? JSON.stringify(body) : undefined
        })
        .then(function (response) {
          var contentType = response.headers.get("content-type") || "";
          var isJson = contentType.indexOf("application/json") >= 0;

          return (isJson ? response.json() : response.text()).then(function (payload) {
            if (!response.ok) {
              var error = new Error(
                normalizeErrorMessage(payload, "Request failed with status " + response.status + ".")
              );
              error.status = response.status;
              error.payload = payload;
              throw error;
            }

            return payload;
          });
        });
    }

    return {
      request: request,
      get: function (path, options) {
        return request("GET", path, options);
      },
      post: function (path, body, options) {
        var requestOptions = options || {};
        requestOptions.body = body;
        return request("POST", path, requestOptions);
      },
      patch: function (path, body, options) {
        var requestOptions = options || {};
        requestOptions.body = body;
        return request("PATCH", path, requestOptions);
      },
      put: function (path, body, options) {
        var requestOptions = options || {};
        requestOptions.body = body;
        return request("PUT", path, requestOptions);
      }
    };
  }

  var client = createHttpClient();

  var endpoints = {
    getProfile: function () {
      return client.get("/account/profile");
    },
    updateProfile: function (payload) {
      return client.patch("/account/profile", payload);
    },
    getOrders: function () {
      return client.get("/account/orders");
    },
    getBookings: function () {
      return client.get("/account/bookings");
    },
    getAddresses: function () {
      return client.get("/account/addresses");
    },
    createAddress: function (payload) {
      return client.post("/account/addresses", payload);
    },
    updateAddress: function (addressId, payload) {
      return client.put("/account/addresses/" + encodeURIComponent(addressId), payload);
    },
    changePassword: function (payload) {
      return client.post("/account/security/password", payload);
    }
  };

  window.BettyVerseAccountApi = {
    config: config,
    storageKeys: STORAGE_KEYS,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    client: client,
    endpoints: endpoints
  };
})(window);
