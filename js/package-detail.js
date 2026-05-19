(function () {
  "use strict";

  var SELECTED_KEY = "bettyverse-selected-package";
  var BOOKING_KEY = "bettyverse-booking-package";
  var CATALOG_KEY = "bettyverse-package-catalog";

  function formatPounds(value) {
    var amount = Number(value || 0);
    var fixed = amount.toFixed(2);
    return fixed.slice(-3) === ".00" ? "\u00A3" + fixed.slice(0, -3) : "\u00A3" + fixed;
  }

  function readJson(key, fallback) {
    try {
      var stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getPackageId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function findPackageData() {
    var selected = readJson(SELECTED_KEY, null);
    var id = getPackageId();
    if (selected && (!id || selected.id === id)) {
      return selected;
    }
    var catalog = readJson(CATALOG_KEY, []);
    if (Array.isArray(catalog)) {
      return catalog.find(function (item) {
        return item && item.id === id;
      }) || null;
    }
    return null;
  }

  function normalizePackageData(data) {
    var images = Array.isArray(data.images) && data.images.length ? data.images : [data.image].filter(Boolean);
    var basePrice = Number(data.basePrice || data.price || 0);
    return {
      id: data.id || "",
      name: data.name || "Package",
      category: data.category || "Package",
      summary: data.summary || "",
      image: data.image || images[0] || "",
      images: images,
      basePrice: basePrice,
      price: Number(data.price || basePrice),
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      addons: Array.isArray(data.addons) ? data.addons : [],
      selectedAddons: Array.isArray(data.selectedAddons) ? data.selectedAddons : []
    };
  }

  function setText(selector, text) {
    var node = document.querySelector(selector);
    if (node) {
      node.textContent = text;
    }
  }

  function openLightbox(data, index) {
    var lightbox = document.querySelector("[data-detail-lightbox]");
    var image = document.querySelector("[data-detail-lightbox-image]");
    if (!lightbox || !image) {
      return;
    }
    var safeIndex = Math.max(0, Math.min(index, data.images.length - 1));
    image.src = data.images[safeIndex] || data.image;
    image.alt = data.name + " image preview";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("package-detail-lightbox-open");
    var closeButton = lightbox.querySelector("[data-detail-lightbox-close]");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeLightbox() {
    var lightbox = document.querySelector("[data-detail-lightbox]");
    var image = document.querySelector("[data-detail-lightbox-image]");
    if (!lightbox || lightbox.hidden) {
      return;
    }
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("package-detail-lightbox-open");
    if (image) {
      image.removeAttribute("src");
      image.alt = "";
    }
  }

  function bindLightboxControls() {
    document.querySelectorAll("[data-detail-lightbox-close]").forEach(function (control) {
      control.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeLightbox();
      }
    });
  }

  function renderGallery(data) {
    var mainImage = document.querySelector("[data-detail-main-image]");
    var thumbs = document.querySelector("[data-detail-thumbs]");
    var lightboxButton = document.querySelector("[data-detail-lightbox-open]");
    if (!mainImage || !thumbs) {
      return;
    }
    var activeIndex = 0;
    function setImage(src, index) {
      activeIndex = index;
      mainImage.src = src;
      mainImage.alt = data.name + " image " + (index + 1);
      if (lightboxButton) {
        lightboxButton.setAttribute("aria-label", "Open " + data.name + " image " + (index + 1));
      }
      thumbs.querySelectorAll("button").forEach(function (button, buttonIndex) {
        var active = buttonIndex === index;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    thumbs.innerHTML = "";
    data.images.forEach(function (src, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "package-page-thumb";
      button.setAttribute("aria-label", "Show image " + (index + 1));
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      var image = document.createElement("img");
      image.src = src;
      image.alt = "";
      button.appendChild(image);
      button.addEventListener("click", function () {
        setImage(src, index);
      });
      thumbs.appendChild(button);
    });
    if (lightboxButton) {
      lightboxButton.addEventListener("click", function () {
        openLightbox(data, activeIndex);
      });
    }
    setImage(data.images[0] || data.image, 0);
  }

  function renderHighlights(data) {
    var list = document.querySelector("[data-detail-highlights]");
    if (!list) {
      return;
    }
    list.innerHTML = "";
    data.highlights.forEach(function (text) {
      var item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    list.hidden = data.highlights.length === 0;
  }

  function selectedAddonNames(data) {
    return data.selectedAddons.reduce(function (map, addon) {
      if (addon && addon.name) {
        map[addon.name] = true;
      }
      return map;
    }, {});
  }

  function renderAddons(card, data) {
    var list = document.querySelector("[data-detail-addons]");
    var empty = document.querySelector("[data-detail-no-addons]");
    if (!list) {
      return;
    }
    var selected = selectedAddonNames(data);
    list.innerHTML = "";
    data.addons.forEach(function (addon) {
      var label = document.createElement("label");
      label.className = "package-addon-option";
      var input = document.createElement("input");
      input.className = "package-addon-input";
      input.type = "checkbox";
      input.dataset.addonName = addon.name;
      input.dataset.addonPrice = String(Number(addon.price || 0));
      input.checked = Boolean(selected[addon.name]);
      var copy = document.createElement("span");
      copy.className = "package-addon-copy";
      copy.innerHTML = '<span class="package-addon-name"></span><span class="package-addon-price"></span>';
      copy.querySelector(".package-addon-name").textContent = addon.name;
      copy.querySelector(".package-addon-price").textContent = "+" + formatPounds(addon.price);
      label.appendChild(input);
      label.appendChild(copy);
      list.appendChild(label);
      input.addEventListener("change", function () {
        updateTotals(card, data);
      });
    });
    if (empty) {
      empty.hidden = data.addons.length > 0;
    }
  }

  function getSelectedAddons(card) {
    return Array.prototype.slice.call(card.querySelectorAll(".package-addon-input:checked")).map(function (input) {
      return {
        name: input.dataset.addonName || "Add-on",
        price: Number(input.dataset.addonPrice || 0)
      };
    });
  }

  function updateTotals(card, data) {
    var selected = getSelectedAddons(card);
    var addonTotal = selected.reduce(function (total, addon) {
      return total + (Number(addon.price) || 0);
    }, 0);
    var finalPrice = data.basePrice + addonTotal;
    card.dataset.packageAddonTotal = addonTotal.toFixed(2);
    card.dataset.packageFinalPrice = finalPrice.toFixed(2);
    card.dataset.packagePrice = finalPrice.toFixed(2);
    card.dataset.packageSelectedAddons = JSON.stringify(selected);
    setText("[data-detail-price]", formatPounds(finalPrice));
    setText("[data-detail-addon-total]", formatPounds(addonTotal));
  }

  function buildBookingPackage(card, data) {
    var selected = getSelectedAddons(card);
    var addonTotal = selected.reduce(function (total, addon) {
      return total + (Number(addon.price) || 0);
    }, 0);
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      summary: data.summary,
      basePrice: data.basePrice,
      addonTotal: addonTotal,
      finalPrice: data.basePrice + addonTotal,
      addons: selected
    };
  }

  function bindStartBooking(card, data) {
    var link = document.querySelector("[data-start-booking]");
    if (!link) {
      return;
    }
    link.addEventListener("click", function () {
      try {
        window.localStorage.setItem(BOOKING_KEY, JSON.stringify(buildBookingPackage(card, data)));
      } catch (error) {
        return;
      }
    });
  }

  function hydrateCartCard(card, data) {
    card.dataset.packageId = data.id;
    card.dataset.packageName = data.name;
    card.dataset.packageCategory = data.category;
    card.dataset.packageImage = data.image;
    card.dataset.packageSummary = data.summary;
    card.dataset.packageBasePrice = data.basePrice.toFixed(2);
    card.dataset.packageAddonTotal = "0.00";
    card.dataset.packageSelectedAddons = "[]";
    card.dataset.packagePrice = data.basePrice.toFixed(2);
    card.dataset.packageFinalPrice = data.basePrice.toFixed(2);
  }

  function renderPackage(data) {
    var card = document.querySelector("[data-detail-card]");
    if (!card) {
      return;
    }
    hydrateCartCard(card, data);
    document.title = data.name + " | BettyVerse";
    setText("[data-detail-category]", data.category);
    setText("[data-detail-title]", data.name);
    setText("[data-detail-summary]", data.summary);
    setText("[data-detail-base-price]", formatPounds(data.basePrice));
    renderGallery(data);
    renderHighlights(data);
    renderAddons(card, data);
    updateTotals(card, data);
    bindStartBooking(card, data);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindLightboxControls();
    var data = findPackageData();
    var page = document.querySelector("[data-package-detail-page]");
    var fallback = document.querySelector("[data-package-detail-empty]");
    if (!data) {
      if (page) {
        page.hidden = true;
      }
      if (fallback) {
        fallback.hidden = false;
      }
      return;
    }
    if (fallback) {
      fallback.hidden = true;
    }
    renderPackage(normalizePackageData(data));
  });
})();
