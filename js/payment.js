(function () {
  "use strict";

  var CART_KEY = "bettyverse-cart";
  var paypalSdkPromise;
  var paymentElements = {
    modal: null,
    liveArea: null,
    total: null,
    status: null,
    cardNote: null,
    paypalNote: null,
    googleNote: null,
    methodName: null,
    methodCaption: null,
    preview: null,
    cardBrand: null,
    cardType: null,
    cardNumber: null,
    cardLogo: null,
    confirmButton: null,
    cardSlot: null,
    paypalSlot: null,
    appleSlot: null,
    googleSlot: null,
    cardButtons: null,
    paypalButtons: null,
    applePayContainer: null,
    applePayNote: null,
    openButtons: [],
    closeButtons: [],
    methodButtons: []
  };
  var activeMethod = "card";
  var paymentMethodContent = {
    card: {
      name: "Card",
      confirmLabel: "Continue with Card",
      previewClass: "is-card",
      caption:
        "Card checkout can be completed with supported providers once your live payment credentials are connected.",
      note:
        "Card checkout may appear as a dedicated card button or inside PayPal secure checkout depending on buyer eligibility.",
      brand: "VISA",
      type: "Credit Card",
      number: "4315  0245448  00345",
      logoClass: "fa fa-cc-mastercard payment-card-logo"
    },
    paypal: {
      name: "PayPal",
      confirmLabel: "Continue with PayPal",
      previewClass: "is-paypal",
      caption:
        "PayPal gives customers a familiar one-tap wallet option with buyer protection and fast approval.",
      note:
        "Use the PayPal button below to continue with secure wallet checkout for the current cart total.",
      brand: "PAYPAL",
      type: "Digital Wallet",
      number: "FAST  .  SAFE  .  ONLINE",
      logoClass: "fa fa-paypal payment-card-logo"
    },
    apple: {
      name: "Apple Pay",
      confirmLabel: "Continue with Apple Pay",
      previewClass: "is-apple",
      caption:
        "Apple Pay keeps the same clean mobile feel as the reference and appears for supported Apple devices.",
      note:
        "Apple Pay is shown below when the browser, device, and merchant setup all support it.",
      brand: "APPLE",
      type: "Wallet Checkout",
      number: "APPLE  PAY  READY",
      logoClass: "fa fa-apple payment-card-logo"
    },
    google: {
      name: "Google Pay",
      confirmLabel: "Google Pay Soon",
      previewClass: "is-google",
      caption:
        "Google Pay is included in the method row to match the mobile-inspired layout and can be connected next.",
      note:
        "Google Pay is not wired into the current checkout flow yet, but this slot is ready for that integration.",
      brand: "G PAY",
      type: "Wallet Checkout",
      number: "GOOGLE  PAY  READY",
      logoClass: "fa fa-google-wallet payment-card-logo"
    }
  };

  function normalizeCartItems(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.reduce(function (result, item) {
      if (!item || !item.id) {
        return result;
      }

      var exists = result.some(function (entry) {
        return entry.id === item.id;
      });

      if (exists) {
        return result;
      }

      result.push({
        id: item.id,
        name: item.name || "",
        price: Number(item.price || 0),
        quantity: 1
      });

      return result;
    }, []);
  }

  function readCart() {
    try {
      var stored = window.localStorage.getItem(CART_KEY);
      if (!stored) {
        return [];
      }

      var parsed = JSON.parse(stored);
      return normalizeCartItems(parsed);
    } catch (error) {
      return [];
    }
  }

  function saveCart(items) {
    var normalizedItems = normalizeCartItems(items);

    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(normalizedItems));
    } catch (error) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent("bettyverse:cart-updated", {
        detail: { items: normalizedItems }
      })
    );
  }

  function getCount(items) {
    return normalizeCartItems(items).length;
  }

  function getTotal(items) {
    return items.reduce(function (total, item) {
      return total + (Number(item.price) || 0);
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
      return item.name;
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

  function updateLauncherState(items) {
    if (!paymentElements.openButtons.length) {
      return;
    }

    var hasItems = !!items.length;
    paymentElements.openButtons.forEach(function (button) {
      button.disabled = !hasItems;
      button.classList.toggle("is-disabled", !hasItems);
      button.setAttribute("aria-disabled", hasItems ? "false" : "true");
    });
  }

  function updateConfirmState(items) {
    if (!paymentElements.confirmButton) {
      return;
    }

    paymentElements.confirmButton.disabled = !items.length;
  }

  function clearDynamicPaymentAreas() {
    if (paymentElements.cardButtons) {
      paymentElements.cardButtons.innerHTML = "";
    }

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

  function setSlotNote(element, message) {
    if (!element) {
      return;
    }

    element.textContent = message || "";
  }

  function syncMethodPreview(method) {
    var content = paymentMethodContent[method] || paymentMethodContent.card;

    if (paymentElements.methodCaption) {
      paymentElements.methodCaption.textContent = content.caption;
    }

    if (paymentElements.methodName) {
      paymentElements.methodName.textContent = content.name;
    }

    if (paymentElements.preview) {
      paymentElements.preview.className = "payment-card-preview " + content.previewClass;
    }

    if (paymentElements.cardBrand) {
      paymentElements.cardBrand.textContent = content.brand;
    }

    if (paymentElements.cardType) {
      paymentElements.cardType.textContent = content.type;
    }

    if (paymentElements.cardNumber) {
      paymentElements.cardNumber.textContent = content.number;
    }

    if (paymentElements.cardLogo) {
      paymentElements.cardLogo.className = content.logoClass;
      paymentElements.cardLogo.setAttribute("aria-hidden", "true");
    }

    if (paymentElements.cardSlot) {
      paymentElements.cardSlot.hidden = method !== "card";
    }

    if (paymentElements.paypalSlot) {
      paymentElements.paypalSlot.hidden = method !== "paypal";
    }

    if (paymentElements.appleSlot) {
      paymentElements.appleSlot.hidden = method !== "apple";
    }

    if (paymentElements.googleSlot) {
      paymentElements.googleSlot.hidden = method !== "google";
    }

    if (paymentElements.confirmButton) {
      paymentElements.confirmButton.textContent = content.confirmLabel;
    }

    setSlotNote(paymentElements.cardNote, paymentMethodContent.card.note);
    setSlotNote(paymentElements.paypalNote, paymentMethodContent.paypal.note);
    setSlotNote(paymentElements.googleNote, paymentMethodContent.google.note);
  }

  function setActiveMethod(method) {
    activeMethod = paymentMethodContent[method] ? method : "card";

    paymentElements.methodButtons.forEach(function (button) {
      var isActive = button.getAttribute("data-payment-method") === activeMethod;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    syncMethodPreview(activeMethod);
  }

  function openPaymentModal() {
    if (!paymentElements.modal) {
      return;
    }

    paymentElements.modal.hidden = false;
    paymentElements.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("payment-modal-open");
    renderPaymentOptions(readCart());
  }

  function closePaymentModal() {
    if (!paymentElements.modal) {
      return;
    }

    paymentElements.modal.hidden = true;
    paymentElements.modal.setAttribute("aria-hidden", "true");
    if (paymentElements.liveArea) {
      paymentElements.liveArea.hidden = true;
    }
    showStatus("", "");
    document.body.classList.remove("payment-modal-open");
  }

  function handleConfirmAction() {
    var items = readCart();

    if (!items.length) {
      showStatus("info", "Add at least one package to the cart before starting payment.");
      return;
    }

    if (paymentElements.liveArea) {
      paymentElements.liveArea.hidden = false;
      paymentElements.liveArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (activeMethod === "google") {
      showStatus(
        "info",
        "Google Pay matches the design in this popup, but it still needs live gateway wiring on this project."
      );
      return;
    }

    if (activeMethod === "apple") {
      showStatus(
        "info",
        "Use the Apple Pay area below on supported Apple devices once merchant setup is complete."
      );
      return;
    }

    if (activeMethod === "paypal") {
      showStatus("", "");
      return;
    }

    showStatus("", "");
  }

  function bindPaymentModal() {
    paymentElements.openButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) {
          return;
        }

        openPaymentModal();
      });
    });

    paymentElements.closeButtons.forEach(function (button) {
      button.addEventListener("click", closePaymentModal);
    });

    paymentElements.methodButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setActiveMethod(button.getAttribute("data-payment-method"));
      });
    });

    if (paymentElements.confirmButton) {
      paymentElements.confirmButton.addEventListener("click", handleConfirmAction);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && paymentElements.modal && !paymentElements.modal.hidden) {
        closePaymentModal();
      }
    });
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

  function renderPayPalFundingButton(fundingSource, mountPoint, items, config) {
    if (!window.paypal || !window.paypal.Buttons || !mountPoint) {
      return;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "paypal-button-block";

    var container = document.createElement("div");
    wrapper.appendChild(container);
    mountPoint.appendChild(wrapper);

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
      mountPoint.removeChild(wrapper);
    }
  }

  function renderPayPalCheckout(items, config) {
    if (!paymentElements.cardButtons && !paymentElements.paypalButtons) {
      return;
    }

    if (paymentElements.cardButtons) {
      paymentElements.cardButtons.innerHTML = "";
    }

    if (paymentElements.paypalButtons) {
      paymentElements.paypalButtons.innerHTML = "";
    }

    if (!items.length) {
      return;
    }

    if (!config.paypalClientId) {
      setSlotNote(
        paymentElements.cardNote,
        isLocalHost()
          ? "Add your PayPal client ID in js/payment-config.js to enable live card checkout on this cart page."
          : "Secure card checkout is being prepared. You can still continue with booking from this page."
      );
      setSlotNote(
        paymentElements.paypalNote,
        isLocalHost()
          ? "Add your PayPal client ID in js/payment-config.js to enable the live PayPal wallet button."
          : "PayPal checkout is being prepared. You can still continue with booking from this page."
      );
      return;
    }

    loadPayPalSdk(config)
      .then(function () {
        renderPayPalFundingButton(paypal.FUNDING.PAYPAL, paymentElements.paypalButtons, items, config);

        if (
          config.enableStandaloneCardButton &&
          paypal.FUNDING &&
          paypal.FUNDING.CARD &&
          paymentElements.cardButtons
        ) {
          renderPayPalFundingButton(paypal.FUNDING.CARD, paymentElements.cardButtons, items, config);
        }

        if (paymentElements.paypalButtons && !paymentElements.paypalButtons.children.length) {
          setSlotNote(
            paymentElements.paypalNote,
            "PayPal checkout is loaded, but no eligible PayPal button is available for this buyer right now."
          );
        }

        if (paymentElements.cardButtons && !paymentElements.cardButtons.children.length) {
          setSlotNote(
            paymentElements.cardNote,
            "Card checkout is not eligible for this buyer right now, but PayPal wallet checkout may still be available."
          );
        }
      })
      .catch(function () {
        setSlotNote(
          paymentElements.cardNote,
          "The secure card checkout library could not be loaded. Please try again later or continue with booking."
        );
        setSlotNote(
          paymentElements.paypalNote,
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
    updateLauncherState(items);
    updateConfirmState(items);
    updateDisplayedTotal(items);
    clearDynamicPaymentAreas();
    renderPayPalCheckout(items, config);
    renderApplePay(items, config);
  }

  function cacheElements() {
    paymentElements.modal = document.querySelector("[data-payment-modal]");
    paymentElements.liveArea = document.querySelector("[data-payment-live-area]");
    paymentElements.total = document.querySelector("[data-payment-total]");
    paymentElements.status = document.querySelector("[data-payment-status]");
    paymentElements.cardNote = document.querySelector("[data-payment-card-note]");
    paymentElements.paypalNote = document.querySelector("[data-payment-paypal-note]");
    paymentElements.googleNote = document.querySelector("[data-payment-google-note]");
    paymentElements.methodName = document.querySelector("[data-payment-method-name]");
    paymentElements.methodCaption = document.querySelector("[data-payment-method-caption]");
    paymentElements.preview = document.querySelector("[data-payment-card-preview]");
    paymentElements.cardBrand = document.querySelector("[data-payment-card-brand]");
    paymentElements.cardType = document.querySelector("[data-payment-card-type]");
    paymentElements.cardNumber = document.querySelector(".payment-card-number");
    paymentElements.cardLogo = document.querySelector(".payment-card-logo");
    paymentElements.confirmButton = document.querySelector("[data-payment-confirm]");
    paymentElements.cardSlot = document.querySelector("[data-payment-card-slot]");
    paymentElements.paypalSlot = document.querySelector("[data-payment-paypal-slot]");
    paymentElements.appleSlot = document.querySelector("[data-payment-apple-slot]");
    paymentElements.googleSlot = document.querySelector("[data-payment-google-slot]");
    paymentElements.cardButtons = document.querySelector("[data-card-buttons]");
    paymentElements.paypalButtons = document.querySelector("[data-paypal-buttons]");
    paymentElements.applePayContainer = document.querySelector("[data-applepay-container]");
    paymentElements.applePayNote = document.querySelector("[data-applepay-note]");
    paymentElements.openButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-open-payment-modal]")
    );
    paymentElements.closeButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-payment-close]")
    );
    paymentElements.methodButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-payment-method]")
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    cacheElements();
    bindPaymentModal();
    setActiveMethod(activeMethod);
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
