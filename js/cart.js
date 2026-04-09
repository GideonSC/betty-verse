(function () {
  "use strict";

  var CART_KEY = "bettyverse-cart";

  function normalizeAddons(addons) {
    if (!Array.isArray(addons)) {
      return [];
    }

    return addons.reduce(function (result, addon) {
      if (!addon || !addon.name) {
        return result;
      }
      var addonName = String(addon.name).trim();
      if (!addonName) {
        return result;
      }

      result.push({
        name: addonName,
        price: Number(addon.price || 0)
      });

      return result;
    }, []);
  }

  function normalizeCartItems(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.reduce(function (result, item) {
      if (!item || !item.id) {
        return result;
      }

      var normalizedAddons = normalizeAddons(item.addons);
      var addonTotal =
        Number(item.addonTotal || 0) ||
        normalizedAddons.reduce(function (total, addon) {
          return total + (Number(addon.price) || 0);
        }, 0);
      var basePrice =
        Number(item.basePrice || 0) ||
        (Number(item.price || 0) > 0 ? Number(item.price || 0) - addonTotal : 0);
      var finalPrice = Number(item.price || basePrice + addonTotal || 0);
      var normalizedItem = {
        id: item.id,
        name: item.name || "",
        category: item.category || "",
        price: finalPrice,
        basePrice: basePrice,
        addonTotal: addonTotal,
        addons: normalizedAddons,
        image: item.image || "",
        summary: item.summary || "",
        quantity: 1
      };
      var existingIndex = result.findIndex(function (entry) {
        return entry.id === item.id;
      });

      if (existingIndex >= 0) {
        result[existingIndex] = normalizedItem;
      } else {
        result.push(normalizedItem);
      }

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

  function getItemCount(items) {
    return normalizeCartItems(items).length;
  }

  function getSubtotal(items) {
    return items.reduce(function (total, item) {
      return total + (Number(item.price) || 0);
    }, 0);
  }

  function formatPrice(value) {
    return "\u00A3" + Number(value || 0).toFixed(2);
  }

  function updateCartBadges(items) {
    var count = getItemCount(items);

    document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
      badge.textContent = count;
      badge.classList.toggle("has-items", count > 0);
    });
  }

  function parseCardAddons(card) {
    if (!card || !card.dataset.packageSelectedAddons) {
      return [];
    }

    try {
      var parsed = JSON.parse(card.dataset.packageSelectedAddons);
      return normalizeAddons(parsed);
    } catch (error) {
      return [];
    }
  }

  function getCardData(button) {
    var card = button.closest(".package-card");
    if (!card) {
      return null;
    }

    var addons = parseCardAddons(card);
    var addonTotal =
      Number(card.dataset.packageAddonTotal || 0) ||
      addons.reduce(function (total, addon) {
        return total + (Number(addon.price) || 0);
      }, 0);
    var basePrice = Number(card.dataset.packageBasePrice || 0);
    var finalPrice =
      Number(card.dataset.packageFinalPrice || 0) ||
      Number(card.dataset.packagePrice || 0) ||
      basePrice + addonTotal;

    return {
      id: card.dataset.packageId,
      name: card.dataset.packageName,
      category: card.dataset.packageCategory,
      price: finalPrice,
      basePrice: basePrice,
      addonTotal: addonTotal,
      addons: addons,
      image: card.dataset.packageImage,
      summary: card.dataset.packageSummary,
      quantity: 1
    };
  }

  function addItem(item) {
    if (!item || !item.id) {
      return readCart();
    }

    var items = readCart();
    var existingIndex = items.findIndex(function (entry) {
      return entry.id === item.id;
    });

    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }

    saveCart(items);
    return items;
  }

  function removeItem(itemId) {
    var items = readCart().filter(function (item) {
      return item.id !== itemId;
    });

    saveCart(items);
    return items;
  }

  function updateAddButtonState(button) {
    var original = button.dataset.defaultLabel || button.textContent;
    button.dataset.defaultLabel = original;
    button.classList.add("is-added");
    button.textContent = "Added to Cart";

    window.setTimeout(function () {
      button.classList.remove("is-added");
      button.textContent = original;
    }, 1500);
  }

  function bindAddToCartButtons() {
    document.querySelectorAll("[data-add-to-cart]").forEach(function (button) {
      button.addEventListener("click", function () {
        var item = getCardData(button);
        var items = addItem(item);
        updateCartBadges(items);
        updateAddButtonState(button);
      });
    });
  }

  function createAddonDetails(item) {
    if (!item.addons || !item.addons.length) {
      return null;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "cart-item-addons";

    var heading = document.createElement("strong");
    heading.className = "cart-item-addon-title";
    heading.textContent = "Selected add-ons";
    wrapper.appendChild(heading);

    var list = document.createElement("ul");
    list.className = "cart-item-addon-list";

    item.addons.forEach(function (addon) {
      var row = document.createElement("li");

      var name = document.createElement("span");
      name.textContent = addon.name;

      var price = document.createElement("span");
      price.textContent = formatPrice(addon.price);

      row.appendChild(name);
      row.appendChild(price);
      list.appendChild(row);
    });

    wrapper.appendChild(list);

    var total = document.createElement("p");
    total.className = "cart-item-addon-total";
    total.textContent =
      "Base " + formatPrice(item.basePrice) + " + Add-ons " + formatPrice(item.addonTotal);
    wrapper.appendChild(total);

    return wrapper;
  }

  function createCartItem(item) {
    var article = document.createElement("article");
    article.className = "cart-item";

    var media = document.createElement("div");
    media.className = "cart-item-media";
    var image = document.createElement("img");
    image.src = item.image;
    image.alt = item.name;
    media.appendChild(image);

    var main = document.createElement("div");
    main.className = "cart-item-main";

    var head = document.createElement("div");
    head.className = "cart-item-head";

    var headCopy = document.createElement("div");

    var tag = document.createElement("span");
    tag.className = "blog_meta";
    tag.textContent = item.category;

    var title = document.createElement("h3");
    title.textContent = item.name;

    headCopy.appendChild(tag);
    headCopy.appendChild(title);

    var price = document.createElement("strong");
    price.className = "cart-item-price";
    price.textContent = formatPrice(item.price);

    head.appendChild(headCopy);
    head.appendChild(price);

    var summary = document.createElement("p");
    summary.className = "cart-item-copy";
    summary.textContent = item.summary;
    var addonDetails = createAddonDetails(item);

    var footer = document.createElement("div");
    footer.className = "cart-item-footer";

    var footerActions = document.createElement("div");
    footerActions.className = "cart-item-actions";

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      renderCart(removeItem(item.id));
    });

    footerActions.appendChild(remove);

    footer.appendChild(footerActions);

    main.appendChild(head);
    main.appendChild(summary);
    if (addonDetails) {
      main.appendChild(addonDetails);
    }
    main.appendChild(footer);

    article.appendChild(media);
    article.appendChild(main);

    return article;
  }

  function renderCart(items) {
    var list = document.querySelector("[data-cart-items]");
    if (!list) {
      updateCartBadges(items || readCart());
      return;
    }

    var emptyState = document.querySelector("[data-cart-empty]");
    var itemsCount = document.querySelector("[data-cart-items-count]");
    var total = document.querySelector("[data-cart-total]");
    var contactLink = document.querySelector("[data-cart-contact-link]");
    var currentItems = items || readCart();

    list.innerHTML = "";

    if (!currentItems.length) {
      if (emptyState) {
        emptyState.hidden = false;
      }
    } else {
      if (emptyState) {
        emptyState.hidden = true;
      }

      currentItems.forEach(function (item) {
        list.appendChild(createCartItem(item));
      });
    }

    if (itemsCount) {
      itemsCount.textContent = getItemCount(currentItems);
    }

    if (total) {
      total.textContent = formatPrice(getSubtotal(currentItems));
    }

    if (contactLink) {
      contactLink.classList.toggle("is-disabled", !currentItems.length);
      if (!currentItems.length) {
        contactLink.setAttribute("aria-disabled", "true");
      } else {
        contactLink.removeAttribute("aria-disabled");
      }
    }

    updateCartBadges(currentItems);
  }

  function bindClearCart() {
    var clearButton = document.querySelector("[data-clear-cart]");
    if (!clearButton) {
      return;
    }

    clearButton.addEventListener("click", function () {
      saveCart([]);
      renderCart([]);
    });
  }

  function buildContactMessage(items) {
    var lines = items.map(function (item) {
      var addonText = "";
      if (item.addons && item.addons.length) {
        addonText =
          " | Add-ons: " +
          item.addons
            .map(function (addon) {
              return addon.name + " (" + formatPrice(addon.price) + ")";
            })
            .join(", ");
      }
      return "- " + item.name + " (" + formatPrice(item.price) + ")" + addonText;
    });

    return [
      "Hello BettyVerse,",
      "",
      "I would like to book the following package selections:",
      lines.join("\n"),
      "",
      "Preferred date:",
      "Location:",
      "Additional notes:"
    ].join("\n");
  }

  function hydrateContactForm() {
    var messageField = document.querySelector('textarea[name="message"]');
    if (!messageField) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("cart") !== "1" || messageField.value.trim()) {
      return;
    }

    var items = readCart();
    if (!items.length) {
      return;
    }

    messageField.value = buildContactMessage(items);

    var note = document.querySelector("[data-cart-message-note]");
    if (note) {
      note.hidden = false;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var items = readCart();
    updateCartBadges(items);
    bindAddToCartButtons();
    bindClearCart();
    hydrateContactForm();
    renderCart(items);
  });

  document.addEventListener("bettyverse:cart-updated", function (event) {
    renderCart(event.detail.items);
  });
})();
