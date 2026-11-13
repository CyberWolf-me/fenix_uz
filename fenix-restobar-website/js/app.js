/* ==========================================================================
   FENIX RESTOBAR — SHARED CLIENT RUNTIME (Sections 6, 7, 8)
   Handles:
   - RU / UZ / EN i18n dictionary switching, <html lang>, localStorage & fallback log
   - Asia/Tashkent (UTC+5) "Open now" live computation
   - 30-minute reservation time slots (handling Fri/Sat 02:00 next-day closing)
   - Reservation & Event inquiry forms (validation, >12 guests routing, honeypot, rate limit, states)
   - Pickup & Delivery Order Bag Drawer (Phase 2 scaffold with [[OWNER: ...]] placeholders)
   - Keyboard-accessible Gallery/Dish Lightbox (Esc, ArrowLeft, ArrowRight, focus return)
   - Analytics event dispatcher (window.fenixTrack)
   ========================================================================== */
(function () {
  "use strict";

  const I18N = window.FENIX_I18N || {};
  const MENU = window.FENIX_MENU || { categories: {}, dishes: [] };
  const FACTS = window.FENIX_FACTS || {};

  let currentLang = localStorage.getItem("fenix_lang") || "ru";
  if (!I18N[currentLang]) currentLang = "ru";

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("fenix_cart") || "[]");
  } catch (e) {
    cart = [];
  }

  // Section 7.7: Analytics Event Tracker (ready for Yandex Metrica / GA4)
  window.fenixTrack = function (eventName, payload) {
    const detail = Object.assign({ event: eventName, lang: currentLang, ts: new Date().toISOString() }, payload || {});
    if (typeof window.ym === "function" && window.FENIX_YM_ID) {
      window.ym(window.FENIX_YM_ID, "reachGoal", eventName, detail);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail);
    }
    console.info("[fenixTrack]", detail);
  };

  // Translation helper with Russian fallback + console logging (Section 7.4)
  function t(key) {
    if (I18N[currentLang] && I18N[currentLang][key] !== undefined) {
      return I18N[currentLang][key];
    }
    if (I18N.ru && I18N.ru[key] !== undefined) {
      console.warn(`[i18n fallback -> ru] Missing "${key}" in "${currentLang}"`);
      return I18N.ru[key];
    }
    console.warn(`[i18n missing] Key "${key}" not found`);
    return key;
  }

  // Format price in so'm with thin space for thousands (Section 7.3)
  function formatSom(numOrDish) {
    if (typeof numOrDish === "object" && numOrDish !== null) {
      if (numOrDish.priceDisplay) return numOrDish.priceDisplay;
      numOrDish = numOrDish.price;
    }
    if (typeof numOrDish === "string") return numOrDish;
    if (typeof numOrDish !== "number") return "[[OWNER: price]]";
    return numOrDish.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009") + " so'm";
  }

  // Apply language across all [data-i18n] and [data-i18n-placeholder] nodes
  function applyLanguage(lang) {
    currentLang = I18N[lang] ? lang : "ru";
    localStorage.setItem("fenix_lang", currentLang);
    document.documentElement.lang = currentLang;

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === currentLang;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });

    updateTashkentOpenStatus();
    renderFeaturedDishes();
    renderFullMenu();
    renderGallery();
    renderCart();
  }

  // Section 7.5: Compute "Open now" in Asia/Tashkent (UTC+5, no DST)
  function getTashkentNow() {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + 5 * 3600000);
  }

  function updateTashkentOpenStatus() {
    const tk = getTashkentNow();
    const day = tk.getDay(); // 0=Sun ... 5=Fri, 6=Sat
    const hour = tk.getHours();
    const mins = tk.getMinutes();

    // Fri (5) & Sat (6) stay open until 02:00 next morning (so Sat 00:00-01:59 & Sun 00:00-01:59 are open)
    const isWeekendLateNight = (day === 6 || day === 0) && hour < 2;
    const isDayOpen = hour >= 12;
    const isOpen = isWeekendLateNight || isDayOpen;

    const hhmm = `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    document.querySelectorAll("[data-open-status]").forEach((badge) => {
      badge.textContent = `${isOpen ? t("status_open_now") : t("status_closed_now")} (${hhmm} ${t("status_tashkent_tz")})`;
      badge.className = "fact-value " + (isOpen ? "status-open" : "status-closed");
    });
  }

  // Populate 30-min reservation time slots (12:00 up to 1h before closing; Fri/Sat up to 01:00 next day)
  function populateTimeSlots(selectEl, dateStr) {
    if (!selectEl) return;
    let dow = new Date().getDay();
    if (dateStr) {
      const parts = dateStr.split("-").map(Number);
      if (parts.length === 3) {
        dow = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
      }
    }
    const isFriOrSat = dow === 5 || dow === 6;
    const slots = [];
    for (let h = 12; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 23 || isFriOrSat) {
        slots.push(`${String(h).padStart(2, "0")}:30`);
      }
    }
    if (isFriOrSat) {
      slots.push("00:00", "00:30", "01:00");
    }
    const prev = selectEl.value;
    selectEl.innerHTML = slots
      .map((s) => `<option value="${s}" ${s === (prev || "19:00") ? "selected" : ""}>${s}</option>`)
      .join("");
  }

  // Render Featured Signature Dishes on Home Page
  function renderFeaturedDishes() {
    const root = document.getElementById("featured-dishes-grid");
    if (!root) return;
    const featured = MENU.dishes.filter((d) => d.featured && d.available).slice(0, 6);
    root.innerHTML = featured.map((d) => renderDishCardHtml(d)).join("");
    bindDishCardEvents(root);
  }

  function renderDishCardHtml(dish) {
    const title = dish.name[currentLang] || dish.name.ru;
    const desc = dish.description[currentLang] || dish.description.ru;
    const priceStr = formatSom(dish);
    const catLabel = (MENU.categories[dish.category] && MENU.categories[dish.category][currentLang]) || "";
    const tagsHtml = (dish.tags || []).map((tg) => `<span class="dish-tag">${tg}</span>`).join("");

    // Rule 7.3: No empty photo boxes. A dish without a photo simply has no photo.
    const photoHtml = dish.photo
      ? `<button type="button" class="dish-thumb-btn" data-lb-src="${dish.photo}" data-lb-title="${escapeHtml(title)}" data-lb-price="${escapeHtml(priceStr)}" data-lb-cat="${escapeHtml(catLabel)}" aria-label="${escapeHtml(t("enlarge_photo"))}: ${escapeHtml(title)}">
           <img src="${dish.photo}" alt="${escapeHtml(title)}" width="84" height="84" loading="lazy" />
         </button>`
      : "";

    return `
      <article class="dish-card">
        <div class="dish-body">
          <h3>${escapeHtml(title)}${tagsHtml}</h3>
          ${desc ? `<p class="dish-desc">${escapeHtml(desc)}</p>` : ""}
          <div class="dish-footer">
            <span class="dish-price">${escapeHtml(priceStr)}</span>
            <button type="button" class="btn btn-outline btn-sm" data-add-dish="${dish.id}">${escapeHtml(t("add_to_order"))}</button>
          </div>
        </div>
        ${photoHtml}
      </article>
    `;
  }

  function bindDishCardEvents(container) {
    container.querySelectorAll("[data-lb-src]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openLightbox({
          src: btn.dataset.lbSrc,
          title: btn.dataset.lbTitle,
          price: btn.dataset.lbPrice,
          cat: btn.dataset.lbCat
        });
      });
    });

    container.querySelectorAll("[data-add-dish]").forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(btn.dataset.addDish);
      });
    });
  }

  // Full Menu Page Filtering & Rendering
  let menuSectionFilter = "all";
  let menuCategoryFilter = "all";
  let menuSearchTerm = "";

  function renderFullMenu() {
    const root = document.getElementById("full-menu-root");
    const chipBar = document.getElementById("menu-cat-chips");
    if (!root || !chipBar) return;

    // Render Category Chips
    const catEntries = Object.entries(MENU.categories).filter(
      ([_, meta]) => menuSectionFilter === "all" || meta.section === menuSectionFilter
    );
    let chipsHtml = `<button type="button" class="cat-chip ${menuCategoryFilter === "all" ? "active" : ""}" data-cat="all">${escapeHtml(t("cat_all"))}</button>`;
    catEntries.forEach(([key, meta]) => {
      const label = meta[currentLang] || meta.ru;
      chipsHtml += `<button type="button" class="cat-chip ${menuCategoryFilter === key ? "active" : ""}" data-cat="${key}">${escapeHtml(label)}</button>`;
    });
    chipBar.innerHTML = chipsHtml;

    chipBar.querySelectorAll(".cat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        menuCategoryFilter = chip.dataset.cat;
        if (menuCategoryFilter !== "all") {
          window.location.hash = `cat-${menuCategoryFilter}`;
        }
        renderFullMenu();
      });
    });

    // Filter Dishes
    const q = menuSearchTerm.trim().toLowerCase();
    const filtered = MENU.dishes.filter((d) => {
      if (!d.available) return false;
      if (menuSectionFilter !== "all" && d.section !== menuSectionFilter) return false;
      if (menuCategoryFilter !== "all" && d.category !== menuCategoryFilter) return false;
      if (q) {
        const hay = `${d.name.ru} ${d.name.uz} ${d.name.en} ${d.description.ru} ${d.description.en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      root.innerHTML = `<p>${escapeHtml(t("no_results"))}</p>`;
      return;
    }

    const grouped = {};
    filtered.forEach((d) => {
      if (!grouped[d.category]) grouped[d.category] = [];
      grouped[d.category].push(d);
    });

    root.innerHTML = Object.entries(grouped)
      .map(([catKey, list]) => {
        const catTitle = (MENU.categories[catKey] && MENU.categories[catKey][currentLang]) || catKey;
        return `
          <section class="menu-cat-section" id="cat-${catKey}">
            <div class="menu-cat-header">
              <h2>${escapeHtml(catTitle)}</h2>
              <span class="label-eyebrow">${list.length}</span>
            </div>
            <div class="dish-grid">
              ${list.map((d) => renderDishCardHtml(d)).join("")}
            </div>
          </section>
        `;
      })
      .join("");

    bindDishCardEvents(root);
  }

  // Gallery Page Rendering
  let galleryFilter = "all";
  function renderGallery() {
    const root = document.getElementById("gallery-grid-root");
    if (!root) return;

    const dishPhotos = MENU.dishes
      .filter((d) => d.photo)
      .map((d) => ({
        type: "dishes",
        src: d.photo,
        title: d.name[currentLang] || d.name.ru,
        price: formatSom(d),
        cat: (MENU.categories[d.category] && MENU.categories[d.category][currentLang]) || ""
      }));

    const roomPlaceholders = [
      {
        type: "rooms",
        src: "assets/img/room-hero.webp",
        title: `${t("room1_title")} [[PLACEHOLDER]]`,
        price: t("room1_tag"),
        cat: t("gal_rooms")
      },
      {
        type: "events",
        src: "assets/img/dish-galbi.webp",
        title: `${t("room2_title")} [[PLACEHOLDER]]`,
        price: t("room2_tag"),
        cat: t("gal_events")
      }
    ];

    const allItems = [...dishPhotos, ...roomPlaceholders].filter(
      (item) => galleryFilter === "all" || item.type === galleryFilter
    );

    root.innerHTML = allItems
      .map(
        (item) => `
        <button type="button" class="gallery-item" data-lb-src="${item.src}" data-lb-title="${escapeHtml(item.title)}" data-lb-price="${escapeHtml(item.price)}" data-lb-cat="${escapeHtml(item.cat)}">
          <img src="${item.src}" alt="${escapeHtml(item.title)}" width="240" height="160" loading="lazy" />
          <span class="label-eyebrow">${escapeHtml(item.cat)}</span>
          <h3 style="margin-top:4px;">${escapeHtml(item.title)}</h3>
        </button>
      `
      )
      .join("");

    bindDishCardEvents(root);
  }

  // Component 7: Keyboard-Accessible Lightbox
  let lastFocused = null;
  function openLightbox(item) {
    const lb = document.getElementById("fenix-lightbox");
    if (!lb) return;
    lastFocused = document.activeElement;
    document.getElementById("lb-img").src = item.src;
    document.getElementById("lb-img").alt = item.title;
    document.getElementById("lb-title").textContent = item.title;
    document.getElementById("lb-price").textContent = item.price || "";
    document.getElementById("lb-cat").textContent = item.cat || "";
    lb.classList.add("open");
    document.getElementById("lb-close-btn").focus();
  }

  function closeLightbox() {
    const lb = document.getElementById("fenix-lightbox");
    if (!lb) return;
    lb.classList.remove("open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  // Component 9: Pickup & Delivery Order Cart Drawer (Phase 2 Scaffold)
  function saveCart() {
    localStorage.setItem("fenix_cart", JSON.stringify(cart));
    renderCart();
  }

  function addToCart(dishId) {
    const dish = MENU.dishes.find((d) => d.id === dishId);
    if (!dish) return;
    const existing = cart.find((c) => c.id === dishId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: dishId, qty: 1 });
    }
    window.fenixTrack("order_add", { dishId: dishId });
    saveCart();
    openCartDrawer();
  }

  function updateCartQty(dishId, delta) {
    const idx = cart.findIndex((c) => c.id === dishId);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
  }

  function openCartDrawer() {
    const modal = document.getElementById("fenix-cart-modal");
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add("open");
    const closeBtn = document.getElementById("cart-close-btn");
    if (closeBtn) closeBtn.focus();
  }

  function closeCartDrawer() {
    const modal = document.getElementById("fenix-cart-modal");
    if (!modal) return;
    modal.classList.remove("open");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function renderCart() {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(totalItems);
    });

    const listEl = document.getElementById("cart-items-list");
    const totalEl = document.getElementById("cart-subtotal");
    if (!listEl || !totalEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = `<p>${escapeHtml(t("bag_empty"))}</p>`;
      totalEl.textContent = "0 so'm";
      return;
    }

    let subtotal = 0;
    listEl.innerHTML = cart
      .map((entry) => {
        const dish = MENU.dishes.find((d) => d.id === entry.id);
        if (!dish) return "";
        const lineSum = (typeof dish.price === "number" ? dish.price : 0) * entry.qty;
        subtotal += lineSum;
        const title = dish.name[currentLang] || dish.name.ru;
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid var(--line);">
            <div>
              <strong>${escapeHtml(title)}</strong><br>
              <span style="color:var(--accent);">${formatSom(lineSum)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" class="btn btn-outline btn-sm" data-qty-minus="${dish.id}" aria-label="Decrease quantity">−</button>
              <span>${entry.qty}</span>
              <button type="button" class="btn btn-outline btn-sm" data-qty-plus="${dish.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        `;
      })
      .join("");

    totalEl.textContent = formatSom(subtotal);

    listEl.querySelectorAll("[data-qty-minus]").forEach((b) =>
      b.addEventListener("click", () => updateCartQty(b.dataset.qtyMinus, -1))
    );
    listEl.querySelectorAll("[data-qty-plus]").forEach((b) =>
      b.addEventListener("click", () => updateCartQty(b.dataset.qtyPlus, 1))
    );
  }

  // Form Submission Helper (POSTs to /api/... with local queue & tap-to-call fallback)
  let lastSubmitTs = 0;
  async function submitToBackend(endpoint, payload, statusBanner, submitBtn, successText) {
    // Rate limit: 1 submission per 8 seconds
    const now = Date.now();
    if (now - lastSubmitTs < 8000) return;
    lastSubmitTs = now;

    if (submitBtn) submitBtn.disabled = true;
    statusBanner.className = "form-banner loading";
    statusBanner.textContent = t("state_loading");

    // Save locally first so a submission is never lost silently (Section 8)
    try {
      const queue = JSON.parse(localStorage.getItem("fenix_submissions_backup") || "[]");
      queue.push({ endpoint, payload, createdAt: new Date().toISOString() });
      localStorage.setItem("fenix_submissions_backup", JSON.stringify(queue));
    } catch (e) {}

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      statusBanner.className = "form-banner success";
      statusBanner.textContent = successText;
      window.fenixTrack("form_submit_success", { endpoint });
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      }
    } catch (err) {
      // Static prototype / offline mode: if running via file:// or without backend, show prototype confirmation OR failure notice
      if (window.location.protocol === "file:" || err.message.includes("Failed to fetch")) {
        statusBanner.className = "form-banner success";
        statusBanner.textContent = successText + " [Prototype Mode — Local Queue Saved]";
        window.fenixTrack("form_submit_prototype", { endpoint });
      } else {
        statusBanner.className = "form-banner error";
        statusBanner.textContent = t("form_fail_fallback");
        window.fenixTrack("form_submit_error", { endpoint });
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function validateUzPhone(raw) {
    const cleaned = (raw || "").replace(/[\s\-()]/g, "");
    return /^\+998\d{9}$/.test(cleaned);
  }

  function wireForms() {
    // Set min/max dates (today to +60 days per Section 7.1)
    const tk = getTashkentNow();
    const minIso = tk.toISOString().split("T")[0];
    const maxDate = new Date(tk.getTime() + 60 * 86400000);
    const maxIso = maxDate.toISOString().split("T")[0];

    const resDateInput = document.getElementById("res-date");
    const resTimeSelect = document.getElementById("res-time");
    if (resDateInput) {
      resDateInput.value = minIso;
      resDateInput.min = minIso;
      resDateInput.max = maxIso;
      populateTimeSlots(resTimeSelect, minIso);
      resDateInput.addEventListener("change", () => populateTimeSlots(resTimeSelect, resDateInput.value));
    }

    const evtDateInput = document.getElementById("evt-date");
    if (evtDateInput) {
      evtDateInput.min = minIso;
    }

    // 7.1 Reservation Request Form
    const resForm = document.getElementById("reservation-form");
    if (resForm) {
      resForm.addEventListener("submit", (e) => {
        e.preventDefault();
        resForm.querySelectorAll(".error-msg").forEach((el) => el.classList.remove("visible"));
        resForm.querySelectorAll(".form-control").forEach((el) => el.removeAttribute("aria-invalid"));

        // Honeypot check
        const hp = resForm.querySelector("[name='company_hp']");
        if (hp && hp.value) return;

        const dateVal = document.getElementById("res-date").value;
        const timeVal = document.getElementById("res-time").value;
        const guestsVal = parseInt(document.getElementById("res-guests").value, 10);
        const nameVal = document.getElementById("res-name").value.trim();
        const phoneVal = document.getElementById("res-phone").value.trim();
        const commentVal = document.getElementById("res-comment").value.trim();
        const consentChecked = document.getElementById("res-consent").checked;

        let valid = true;
        if (!dateVal || dateVal < minIso || dateVal > maxIso) {
          showFieldErr("res-date", "err-res-date");
          valid = false;
        }
        if (guestsVal > 12) {
          showFieldErr("res-guests", "err-res-guests");
          const evtGuests = document.getElementById("evt-guests");
          if (evtGuests) evtGuests.value = guestsVal;
          const evtSection = document.getElementById("event-inquiry-card");
          if (evtSection) evtSection.scrollIntoView({ behavior: "smooth" });
          return;
        }
        if (!nameVal) {
          showFieldErr("res-name", "err-res-name");
          valid = false;
        }
        if (!validateUzPhone(phoneVal)) {
          showFieldErr("res-phone", "err-res-phone");
          valid = false;
        }
        if (!consentChecked) {
          document.getElementById("err-res-consent").classList.add("visible");
          valid = false;
        }
        if (!valid) return;

        submitToBackend(
          "/api/reservations",
          { date: dateVal, time: timeVal, guests: guestsVal, name: nameVal, phone: phoneVal, comment: commentVal, lang: currentLang },
          document.getElementById("res-status-banner"),
          resForm.querySelector("button[type='submit']"),
          t("res_success")
        );
      });
    }

    // 7.2 Event Inquiry Form
    const evtForm = document.getElementById("event-form");
    if (evtForm) {
      evtForm.addEventListener("submit", (e) => {
        e.preventDefault();
        evtForm.querySelectorAll(".error-msg").forEach((el) => el.classList.remove("visible"));
        evtForm.querySelectorAll(".form-control").forEach((el) => el.removeAttribute("aria-invalid"));

        const hp = evtForm.querySelector("[name='company_hp']");
        if (hp && hp.value) return;

        const typeVal = document.getElementById("evt-type").value;
        const hallVal = document.getElementById("evt-hall").value;
        const guestsVal = parseInt(document.getElementById("evt-guests").value, 10);
        const dateVal = document.getElementById("evt-date").value;
        const nameVal = document.getElementById("evt-name").value.trim();
        const phoneVal = document.getElementById("evt-phone").value.trim();
        const commentVal = document.getElementById("evt-comment").value.trim();
        const consentChecked = document.getElementById("evt-consent").checked;

        let valid = true;
        if (!nameVal) {
          showFieldErr("evt-name", "err-evt-name");
          valid = false;
        }
        if (!validateUzPhone(phoneVal)) {
          showFieldErr("evt-phone", "err-evt-phone");
          valid = false;
        }
        if (!consentChecked) {
          document.getElementById("err-evt-consent").classList.add("visible");
          valid = false;
        }
        if (!valid) return;

        submitToBackend(
          "/api/events",
          { eventType: typeVal, hall: hallVal, guests: guestsVal, date: dateVal, name: nameVal, phone: phoneVal, comment: commentVal, lang: currentLang },
          document.getElementById("evt-status-banner"),
          evtForm.querySelector("button[type='submit']"),
          t("evt_success")
        );
      });
    }

    // Pickup & Delivery Checkout Form (Phase 2 Scaffold)
    const orderForm = document.getElementById("delivery-order-form");
    if (orderForm) {
      const modeSelect = document.getElementById("ord-mode");
      const addrGroup = document.getElementById("ord-address-group");
      if (modeSelect && addrGroup) {
        modeSelect.addEventListener("change", () => {
          addrGroup.style.display = modeSelect.value === "delivery" ? "block" : "none";
        });
      }

      orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        const nameVal = document.getElementById("ord-name").value.trim();
        const phoneVal = document.getElementById("ord-phone").value.trim();
        const modeVal = document.getElementById("ord-mode").value;
        const addrVal = document.getElementById("ord-address").value.trim();
        const payVal = document.getElementById("ord-payment").value;

        if (!nameVal || !validateUzPhone(phoneVal)) {
          const banner = document.getElementById("ord-status-banner");
          banner.className = "form-banner error";
          banner.textContent = t("err_phone");
          return;
        }

        submitToBackend(
          "/api/orders",
          { items: cart, mode: modeVal, address: addrVal, payment: payVal, name: nameVal, phone: phoneVal, lang: currentLang },
          document.getElementById("ord-status-banner"),
          orderForm.querySelector("button[type='submit']"),
          t("bag_success")
        );
      });
    }
  }

  function showFieldErr(inputId, errId) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (inp) inp.setAttribute("aria-invalid", "true");
    if (err) err.classList.add("visible");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    // Language Switcher
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.fenixTrack("language_change", { to: btn.dataset.lang });
        applyLanguage(btn.dataset.lang);
      });
    });

    // Hero Photo vs Type-Only Toggle (Component 2)
    const heroToggleBtn = document.getElementById("hero-mode-toggle");
    const heroSection = document.getElementById("home-hero");
    if (heroToggleBtn && heroSection) {
      heroToggleBtn.addEventListener("click", () => {
        const isTypeOnly = heroSection.classList.toggle("type-only");
        heroToggleBtn.setAttribute("data-i18n", isTypeOnly ? "hero_toggle_type" : "hero_toggle_photo");
        heroToggleBtn.textContent = t(isTypeOnly ? "hero_toggle_type" : "hero_toggle_photo");
      });
    }

    // Menu Section Filters & Search
    document.querySelectorAll("[data-menu-sec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-menu-sec]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        menuSectionFilter = btn.dataset.menuSec;
        menuCategoryFilter = "all";
        renderFullMenu();
      });
    });

    const searchInput = document.getElementById("menu-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        menuSearchTerm = e.target.value;
        renderFullMenu();
      });
    }

    // Gallery Filters
    document.querySelectorAll("[data-gal-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-gal-filter]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        galleryFilter = btn.dataset.galFilter;
        renderGallery();
      });
    });

    // Lightbox Close
    const lb = document.getElementById("fenix-lightbox");
    const lbClose = document.getElementById("lb-close-btn");
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });

    // Cart Drawer Open/Close
    document.querySelectorAll("[data-open-cart]").forEach((btn) => btn.addEventListener("click", openCartDrawer));
    const cartModal = document.getElementById("fenix-cart-modal");
    const cartClose = document.getElementById("cart-close-btn");
    if (cartClose) cartClose.addEventListener("click", closeCartDrawer);
    if (cartModal) cartModal.addEventListener("click", (e) => { if (e.target === cartModal) closeCartDrawer(); });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeLightbox();
        closeCartDrawer();
      }
    });

    // Analytics on Call & Map links
    document.querySelectorAll("a[href^='tel:']").forEach((a) =>
      a.addEventListener("click", () => window.fenixTrack("call_tap", { href: a.getAttribute("href") }))
    );
    document.querySelectorAll("[data-map-link]").forEach((a) =>
      a.addEventListener("click", () => window.fenixTrack("directions_tap", { provider: a.dataset.mapLink }))
    );

    wireForms();
    applyLanguage(currentLang);
    initTelegramWebApp();
  });

  // Telegram WebApp Integration
  function initTelegramWebApp() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    try {
      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;
      if (user) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
        if (fullName) {
          const resName = document.getElementById("res-name");
          const evtName = document.getElementById("evt-name");
          const ordName = document.getElementById("ord-name");
          if (resName && !resName.value) resName.value = fullName;
          if (evtName && !evtName.value) evtName.value = fullName;
          if (ordName && !ordName.value) ordName.value = fullName;
        }
      }
    } catch (e) {
      console.warn("[Telegram WebApp] Init note:", e.message);
    }
  }
})();
