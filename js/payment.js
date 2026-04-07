(function () {
  "use strict";

  var CART_KEY = "bettyverse-cart";
  var paypalSdkPromise;
  var paymentElements = {
    total: null,
    status: null,
    paypalButtons: null,
    applePayContainer: null,
    applePayNote: null
  };

  function readCart() {
    try {
      var stored = window.localStorage.getItem(CART_KEY);
      if (!stored) {
        return [];
      }

      var parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent("bettyverse:cart-updated", {
        detail: { items: items }
      })
    );
  }

  function getCount(items) {
    return items.reduce(function (total, item) {
      return total + (Number(item.quantity) || 0);
    }, 0);
  }

  function getTotal(items) {
    return items.reduce(function (total, item) {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
  }

  function formatMoney(value) {
    return "$" + Number(value || 0).toFixed(2);
  }

  function getConfig() {
    return window.BETTYVERSE_PAYMENT_CONFIG || {};
  }

  function isLocalHost() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === ""
    );
  }

  function buildDescription(items) {
    if (!items.length) {
      return "BettyVerse package order";
    }

    var names = items.map(function (item) {
      return item.name + " x" + item.quantity;
    });

    return "BettyVerse packages: " + names.join(", ");
  }

  function showStatus(type, message) {
    if (!paymentElements.status) {
      return;
    }

    paymentElements.status.className = "payment-status " + (type ? "is-" + type : "");
    paymentElements.status.textContent = message || "";
    paymentElements.status.style.display = message ? "block" : "none";
  }

  function updateDisplayedTotal(items) {
    if (paymentElements.total) {
      paymentElements.total.textContent = formatMoney(getTotal(items));
    }
  }

  function clearDynamicPaymentAreas() {
    if (paymentElements.paypalButtons) {
      paymentElements.paypalButtons.innerHTML = "";
    }

    if (paymentElements.applePayContainer) {
      paymentElements.applePayContainer.innerHTML = "";
    }
  }

  function setApplePayNote(message, tone) {
    if (!paymentElements.applePayNote) {
      return;
    }

    paymentElements.applePayNote.textContent = message;
    paymentElements.applePayNote.className = "payment-method-note" + (tone ? " is-" + tone : "");
  }

  function loadScriptOnce(src, attributeName) {
    if (attributeName && document.querySelector("script[" + attributeName + "]")) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      if (attributeName) {
        script.setAttribute(attributeName, "true");
      }
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadPayPalSdk(config) {
    if (window.paypal && window.paypal.Buttons) {
      return Promise.resolve(window.paypal);
    }

    if (paypalSdkPromise) {
      return paypalSdkPromise;
    }

    var params = new URLSearchParams({
      "client-id": config.paypalClientId,
      currency: config.currency || "USD",
      intent: "capture",
      components: "buttons,funding-eligibility,applepay",
      locale: config.locale || "en_US"
    });

    if (config.buyerCountry) {
      params.set("buyer-country", config.buyerCountry);
    }

    paypalSdkPromise = loadScriptOnce(
      "https://www.paypal.com/sdk/js?" + params.toString(),
      "data-bettyverse-paypal-sdk"
    ).then(function () {
      return window.paypal;
    });

    return paypalSdkPromise;
  }

  function renderPayPalFundingButton(fundingSource, labelClass, items, config) {
    if (!window.paypal || !window.paypal.Buttons || !paymentElements.paypalButtons) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "paypal-button-block";

    var label = document.createElement("div");
    label.className = "paypal-button-label";
    label.textContent = labelClass;
    wrapper.appendChild(label);

    var container = document.createElement("div");
    wrapper.appendChild(container);
    paymentElements.paypalButtons.appendChild(wrapper);

    var button = paypal.Buttons({
      fundingSource: fundingSource,
      style: {
        layout: "vertical",
        shape: "rect",
        height: 46,
        tagline: false
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              description: buildDescription(items),
              amount: {
                currency_code: config.currency || "USD",
                value: getTotal(items).toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        showStatus("info", "Payment approved. Finalizing your order now.");
        return actions.order.capture().then(function (details) {
          saveCart([]);
          clearDynamicPaymentAreas();
          showStatus(
            "success",
            "Payment completed successfully. Transaction reference: " + data.orderID + "."
          );
          setApplePayNote(
            "Your cart has been paid successfully. You can still use booking for follow-up details.",
            "success"
          );
        });
      },
      onCancel: function () {
        showStatus("info", "Payment was cancelled. Your cart is still saved.");
      },
      onError: function () {
        showStatus(
          "error",
          "We could not start secure checkout. Please try again or continue with booking."
        );
      }
    });

    if (button.isEligible()) {
      button.render(container);
    } else {
      paymentElements.paypalButtons.removeChild(wrapper);
    }
  }

  function renderPayPalCheckout(items, config) {
    if (!paymentElements.paypalButtons) {
      return;
    }

    paymentElements.paypalButtons.innerHTML = "";

    if (!items.length) {
      showStatus("info", "Add at least one package to the cart before starting payment.");
      return;
    }

    if (!config.paypalClientId) {
      if (isLocalHost()) {
        showStatus(
          "info",
          "Add your PayPal client ID in js/payment-config.js to enable live PayPal and card checkout on this cart page."
        );
      } else {
        showStatus(
          "info",
          "Secure online payment is being prepared. You can still continue with booking from this page."
        );
      }
      return;
    }

    loadPayPalSdk(config)
      .then(function () {
        showStatus("", "");
        renderPayPalFundingButton(paypal.FUNDING.PAYPAL, "PayPal", items, config);

        if (config.enableStandaloneCardButton && paypal.FUNDING && paypal.FUNDING.CARD) {
          renderPayPalFundingButton(paypal.FUNDING.CARD, "Card", items, config);
        }

        if (!paymentElements.paypalButtons.children.length) {
          showStatus(
            "info",
            "PayPal checkout is loaded, but no eligible payment buttons are available for this buyer right now."
          );
        }
      })
      .catch(function () {
        showStatus(
          "error",
          "The PayPal checkout library could not be loaded. Please try again later or continue with booking."
        );
      });
  }

  function loadApplePaySdk() {
    if (window.ApplePaySession) {
      return Promise.resolve();
    }

    return loadScriptOnce(
      "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js",
      "data-bettyverse-applepay-sdk"
    );
  }

  function startApplePaySession(items, config, applepay, applepayConfig) {
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
      setApplePayNote(
        "Apple Pay is not available on this device or browser. Customers need a supported Apple device.",
        "info"
      );
      return;
    }

    if (!config.applePayCreateOrderUrl || !config.applePayCaptureUrlBase) {
      setApplePayNote(
        "Apple Pay is enabled in the layout, but merchant order endpoints still need to be connected.",
        "info"
      );
      return;
    }

    var total = getTotal(items).toFixed(2);
    var paymentRequest = {
      countryCode: applepayConfig.countryCode,
      merchantCapabilities: applepayConfig.merchantCapabilities,
      supportedNetworks: applepayConfig.supportedNetworks,
      currencyCode: config.currency || "USD",
      requiredShippingContactFields: ["name", "phone", "email", "postalAddress"],
      requiredBillingContactFields: ["postalAddress"],
      total: {
        label: config.appleMerchantDisplayName || "BettyVerse",
        type: "final",
        amount: total
      }
    };

    var session = new ApplePaySession(4, paymentRequest);

    session.onvalidatemerchant = function (event) {
      applepay
        .validateMerchant({
          validationUrl: event.validationURL,
          displayName: config.appleMerchantDisplayName || "BettyVerse"
        })
        .then(function (validateResult) {
          session.completeMerchantValidation(validateResult.merchantSession);
        })
        .catch(function () {
          session.abort();
          showStatus("error", "Apple Pay merchant validation failed.");
        });
    };

    session.onpaymentauthorized = function (event) {
      fetch(config.applePayCreateOrderUrl, {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: items,
          total: total,
          currency: config.currency || "USD"
        })
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (orderData) {
          var orderId = orderData.id || orderData.orderID;
          if (!orderId) {
            throw new Error("Missing Apple Pay order ID.");
          }

          return applepay
            .confirmOrder({
              orderId: orderId,
              token: event.payment.token,
              billingContact: event.payment.billingContact,
              shippingContact: event.payment.shippingContact
            })
            .then(function () {
              return fetch(config.applePayCaptureUrlBase + "/" + orderId + "/capture", {
                method: "post"
              }).then(function (captureResponse) {
                return captureResponse.json();
              });
            });
        })
        .then(function () {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          saveCart([]);
          clearDynamicPaymentAreas();
          showStatus("success", "Apple Pay payment completed successfully.");
          setApplePayNote(
            "Apple Pay checkout completed successfully for this order.",
            "success"
          );
        })
        .catch(function () {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          showStatus(
            "error",
            "Apple Pay could not complete the transaction. Please try again or continue with booking."
          );
        });
    };

    session.begin();
  }

  function renderApplePay(items, config) {
    if (!paymentElements.applePayContainer || !paymentElements.applePayNote) {
      return;
    }

    paymentElements.applePayContainer.innerHTML = "";

    if (!items.length) {
      setApplePayNote(
        "Add at least one package to the cart before starting Apple Pay.",
        "info"
      );
      return;
    }

    if (!config.paypalClientId) {
      setApplePayNote(
        "Apple Pay depends on the PayPal merchant setup on this project. Add the PayPal client ID first.",
        "info"
      );
      return;
    }

    if (!config.applePayEnabled) {
      setApplePayNote(
        "Apple Pay will appear here after merchant onboarding and verified domain setup are completed.",
        "info"
      );
      return;
    }

    Promise.all([loadPayPalSdk(config), loadApplePaySdk()])
      .then(function () {
        if (!window.paypal || !paypal.Applepay || !window.ApplePaySession) {
          setApplePayNote(
            "Apple Pay is not available in this browser session. Use PayPal or booking instead.",
            "info"
          );
          return;
        }

        if (!ApplePaySession.canMakePayments()) {
          setApplePayNote(
            "Apple Pay is only available on supported Apple devices and browsers.",
            "info"
          );
          return;
        }

        var applepay = paypal.Applepay();
        applepay
          .config()
          .then(function (applepayConfig) {
            if (!applepayConfig.isEligible) {
              setApplePayNote(
                "Apple Pay is not eligible for this device or merchant configuration yet.",
                "info"
              );
              return;
            }

            setApplePayNote(
              "Apple Pay is available on this device. Tap to continue with secure checkout.",
              "success"
            );

            var button = document.createElement("apple-pay-button");
            button.setAttribute("buttonstyle", "black");
            button.setAttribute("type", "buy");
            button.setAttribute("locale", "en");
            button.className = "apple-pay-button";
            button.addEventListener("click", function () {
              startApplePaySession(items, config, applepay, applepayConfig);
            });

            paymentElements.applePayContainer.innerHTML = "";
            paymentElements.applePayContainer.appendChild(button);
          })
          .catch(function () {
            setApplePayNote(
              "Apple Pay configuration could not be loaded yet. Finish merchant setup and try again.",
              "info"
            );
          });
      })
      .catch(function () {
        setApplePayNote(
          "Apple Pay libraries could not be loaded right now. Please try again later.",
          "info"
        );
      });
  }

  function renderPaymentOptions(items) {
    var config = getConfig();
    updateDisplayedTotal(items);
    clearDynamicPaymentAreas();
    renderPayPalCheckout(items, config);
    renderApplePay(items, config);
  }

  function cacheElements() {
    paymentElements.total = document.querySelector("[data-payment-total]");
    paymentElements.status = document.querySelector("[data-payment-status]");
    paymentElements.paypalButtons = document.querySelector("[data-paypal-buttons]");
    paymentElements.applePayContainer = document.querySelector("[data-applepay-container]");
    paymentElements.applePayNote = document.querySelector("[data-applepay-note]");
  }

  document.addEventListener("DOMContentLoaded", function () {
    cacheElements();
    if (!paymentElements.total) {
      return;
    }

    renderPaymentOptions(readCart());
  });

  document.addEventListener("bettyverse:cart-updated", function (event) {
    if (!paymentElements.total) {
      return;
    }

    renderPaymentOptions(event.detail.items || []);
  });
})();
