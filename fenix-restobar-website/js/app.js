/* Fenix prototype — router, chrome behaviour, menu interactions, cart sheet, lightbox, tweaks. */
(function () {
  const S = window.FX, F = window.FENIX_FACTS, t = S.t, e = S.esc, I = S.icon;
  const $ = s => document.querySelector(s);
  const ROUTES = ['home', 'menu', 'events', 'gallery', 'contact', 'reserve', 'privacy'];
  let route = 'home', params = [];

  // Telegram Mini App (WebApp) initialization
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        S.tgUser = tg.initDataUnsafe.user;
      }
    } catch (_) {}
  }

  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    route = ROUTES.includes(parts[0]) ? parts[0] : 'home';
    params = parts.slice(1);
  }

  function applyBody() {
    const tw = S.tweaks;
    document.body.dataset.frame = tw.frame ? 'on' : 'off';
    document.body.dataset.grain = tw.grain ? 'on' : 'off';
    document.body.dataset.markers = tw.markers ? 'on' : 'off';
    document.documentElement.style.setProperty('--accent', tw.accent || '#C08A3E');
    document.documentElement.style.setProperty('--accent-hi', tw.accentHi || '#D9A75B');
  }

  function renderChrome() {
    document.documentElement.lang = S.lang;
    document.title = (route === 'home' ? '' : t('nav.' + (route === 'reserve' ? 'reserve' : route === 'privacy' ? 'privacy' : route)) + ' · ') + t('meta.title');
    $('#skip').textContent = t('a11y.skip');
    $('#hdr').innerHTML = S.renderHeader(route);
    $('#drawer').innerHTML = S.renderDrawer(route);
    $('#actbar').innerHTML = S.renderActbar();
    $('#ftr').innerHTML = S.renderFooter();
    renderFab();
  }
  function renderFab() {
    const n = S.cartCount(), fab = $('#fab');
    if (S.tweaks.ordering && n && route === 'menu') { fab.hidden = false; fab.innerHTML = `${I('bag')}<span>${n} · ${S.money(S.cartTotal())}</span>`; fab.querySelector('svg').style.width = '18px'; }
    else fab.hidden = true;
  }

  function render(scrollTop = true) {
    parse();
    renderChrome();
    const main = $('#main');
    main.innerHTML = `<div class="page">${S.pages[route](params)}</div>`;
    S.mountForms();
    if (route === 'menu') initMenu();
    if (route === 'home') initSigAutoRotation();
    else if (sigInterval) { clearInterval(sigInterval); sigInterval = null; }
    onScroll();
    if (route === 'menu' && params[1]) {
      requestAnimationFrame(() => { const el = document.getElementById(`m-${params[0]}-${params[1]}`); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 130, behavior: 'auto' }); });
    } else if (route === 'reserve') {
      window.scrollTo(0, 0);
    } else if (scrollTop) window.scrollTo(0, 0);
    S.track('view', route);
    localStorage.setItem('fx.route', location.hash);
  }

  /* ── header scroll state ── */
  function onScroll() {
    const solid = route !== 'home' || scrollY > (window.innerHeight * 0.55);
    $('#hdr').classList.toggle('solid', solid);
    if (route === 'menu') spy();
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ── menu ── */
  let secs = [];
  function initMenu() {
    secs = [...document.querySelectorAll('.mcat')];
    const q = $('#menu-q');
    q && q.addEventListener('input', () => {
      const ml = $('#menu-list');
      if (!ml) return;
      ml.innerHTML = S.menuList(ml.dataset.menu, q.value);
      secs = [...document.querySelectorAll('.mcat')];
      spy();
    });
    spy();
  }
  function spy() {
    if (!secs.length) return;
    let cur = secs[0].dataset.sec;
    for (const s of secs) if (s.getBoundingClientRect().top < 170) cur = s.dataset.sec;
    document.querySelectorAll('[data-chip]').forEach(c => {
      const on = c.dataset.chip === cur;
      if (on && c.getAttribute('aria-current') !== 'true') {
        const bar = c.parentElement; bar.scrollTo({ left: c.offsetLeft - bar.clientWidth / 2 + c.clientWidth / 2, behavior: 'smooth' });
      }
      c.setAttribute('aria-current', on);
    });
  }

  /* ── delegated clicks ── */
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a,button'); if (!a) return;
    if (a.dataset.lang) { S.lang = a.dataset.lang; localStorage.setItem('fx.lang', S.lang); S.track('lang', S.lang); render(false); return; }
    if (a.dataset.drawer === 'open') return openDrawer();
    if (a.dataset.drawer === 'close') return closeDrawer();
    if (a.closest('#drawer') && a.tagName === 'A') closeDrawer();
    if (a.dataset.menuTab) { location.hash = '#/menu/' + a.dataset.menuTab; return; }
    if (a.dataset.chip) {
      ev.preventDefault();
      const el = document.getElementById(`m-${$('#menu-list').dataset.menu}-${a.dataset.chip}`);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 128, behavior: 'smooth' });
      history.replaceState(null, '', a.getAttribute('href'));
      return;
    }
    if (a.dataset.qty) {
      const id = a.dataset.qty, before = S.cart[id] || 0;
      S.setQty(id, before + (+a.dataset.d));
      if (!before) S.toast(t('order.added') + ': ' + S.iName(S.byId[id]));
      return;
    }
    if (a.hasAttribute('data-open-cart') || a.id === 'fab') return openSheet();
    if (a.dataset.track) S.track(a.dataset.track);
    if (a.dataset.lb != null) return openLb(+a.dataset.lb, a);
    if (a.dataset.dish) { S.galKeys = [...S.DISH_PHOTOS].map(id => 'dish/' + id); return openLb(S.galKeys.indexOf('dish/' + a.dataset.dish), a); }
  });
  let sigInterval = null;
  let sigPaused = false;
  function initSigAutoRotation() {
    if (sigInterval) clearInterval(sigInterval);
    sigPaused = false;
    const container = document.querySelector('.sign');
    if (!container) return;
    container.addEventListener('mouseenter', () => { sigPaused = true; }, { passive: true });
    container.addEventListener('mouseleave', () => { sigPaused = false; }, { passive: true });
    sigInterval = setInterval(() => {
      if (sigPaused) return;
      const rows = [...document.querySelectorAll('.sig-row')];
      if (!rows.length) return;
      let idx = rows.findIndex(r => r.classList.contains('on'));
      if (idx === -1) idx = 0;
      const nextIdx = (idx + 1) % rows.length;
      sig(rows[nextIdx]);
    }, 3600);
  }

  function sig(row) {
    const ph = document.getElementById('sig-photo'); if (!ph || !row) return;
    document.querySelectorAll('.sig-row').forEach(r => r.classList.toggle('on', r === row));
    const id = row.dataset.sig, im = ph.querySelector('img');
    if (im.getAttribute('src').includes(id)) return;
    im.style.opacity = 0;
    setTimeout(() => { im.src = 'img/dish/' + id + '.webp'; im.alt = S.iName(S.byId[id]); document.getElementById('sig-cap').textContent = S.iName(S.byId[id]); document.getElementById('sig-n').textContent = row.dataset.n; im.onload = () => { im.style.opacity = 1; }; }, 180);
  }
  document.addEventListener('mouseover', ev => { const r = ev.target.closest('.sig-row'); if (r) sig(r); });
  document.addEventListener('click', ev => { const r = ev.target.closest('.sig-row'); if (r) sig(r); });
  document.addEventListener('focusin', ev => { const r = ev.target.closest('.sig-row'); if (r) sig(r); });
  addEventListener('hashchange', () => { closeDrawer(); render(); });

  /* ── drawer (focus-trapped, Esc) ── */
  let lastFocus = null;
  function openDrawer() { lastFocus = document.activeElement; const d = $('#drawer'); d.classList.add('open'); d.removeAttribute('inert'); document.body.style.overflow = 'hidden'; setTimeout(() => d.querySelector('button,a').focus(), 50); }
  function closeDrawer() { const d = $('#drawer'); if (!d.classList.contains('open')) return; d.classList.remove('open'); d.setAttribute('inert', ''); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  function trap(container, ev) {
    const f = [...container.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')].filter(x => x.offsetParent !== null);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', ev => {
    const d = $('#drawer'), lb = $('#lb'), sh = $('#sheet');
    if (ev.key === 'Escape') { closeDrawer(); closeLb(); closeSheet(); }
    if (ev.key === 'Tab') { if (d.classList.contains('open')) trap(d, ev); else if (!lb.hidden) trap(lb, ev); else if (sh.classList.contains('open')) trap(sh, ev); }
    if (!lb.hidden && ev.key === 'ArrowRight') stepLb(1);
    if (!lb.hidden && ev.key === 'ArrowLeft') stepLb(-1);
  });

  /* ── lightbox ── */
  let lbI = 0, lbTrigger = null;
  function openLb(i, trig) { lbI = i; lbTrigger = trig; const lb = $('#lb'); lb.hidden = false; drawLb(); document.body.style.overflow = 'hidden'; lb.querySelector('[data-lbx]').focus(); }
  function drawLb() {
    const k = S.galKeys[lbI], lb = $('#lb');
    lb.innerHTML = `<div class="lb-top"><span aria-live="polite">${lbI + 1} ${e(t('gallery.of'))} ${S.galKeys.length} · ${e(S.IMG[k][S.lang])}</span><button type="button" data-lbx aria-label="${e(t('a11y.close'))}">${I('close').replace('<svg', '<svg width="20"')}</button></div>
      <div class="lb-stage${k.startsWith('dish/') ? ' dish-lb' : ''}"><img src="img/${k}.webp" alt="${e(S.IMG[k][S.lang])}"></div>
      <div class="lb-nav"><button type="button" data-lbp aria-label="${e(t('a11y.prev'))}">${I('left')}</button><button type="button" data-lbn aria-label="${e(t('a11y.next'))}">${I('right')}</button></div>`;
    lb.querySelector('[data-lbx]').onclick = closeLb;
    lb.querySelector('[data-lbp]').onclick = () => stepLb(-1);
    lb.querySelector('[data-lbn]').onclick = () => stepLb(1);
  }
  function stepLb(d) { lbI = (lbI + d + S.galKeys.length) % S.galKeys.length; const foc = document.activeElement && document.activeElement.hasAttribute('data-lbn') ? '[data-lbn]' : document.activeElement && document.activeElement.hasAttribute('data-lbp') ? '[data-lbp]' : '[data-lbx]'; drawLb(); $('#lb').querySelector(foc).focus(); }
  function closeLb() { const lb = $('#lb'); if (lb.hidden) return; lb.hidden = true; document.body.style.overflow = ''; lbTrigger && lbTrigger.focus(); }

  /* ── order sheet (Phase 2 preview) ── */
  let sheetMode = 'pickup', sheetStep = 'cart', lastOrderId = null;
  function openSheet() { lastFocus = document.activeElement; sheetStep = 'cart'; drawSheet(); $('#sheet').classList.add('open'); $('#sheet').removeAttribute('inert'); $('#sheet-bg').classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(() => $('#sheet').querySelector('button').focus(), 60); }
  function closeSheet() { const s = $('#sheet'); if (!s.classList.contains('open')) return; s.classList.remove('open'); s.setAttribute('inert', ''); $('#sheet-bg').classList.remove('open'); document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  $('#sheet-bg').addEventListener('click', closeSheet);
  function drawSheet() {
    const items = Object.entries(S.cart).filter(([id]) => S.byId[id]);
    const head = `<div class="sheet-h"><div><h2 class="h3">${e(t('order.title'))}</h2><span class="phase">${e(t('order.phase'))}</span></div><button class="icon-btn" type="button" data-sheet-close aria-label="${e(t('a11y.close'))}">${I('close')}</button></div>`;
    let body = '', foot = '';
    if (sheetStep === 'status') {
      body = `<div class="notice ok" style="margin-top:20px"><span class="ic">${I('check')}</span><h3>№ ${e(lastOrderId || 'WEB-OK')}</h3><p class="body">${e(t('order.note'))}</p></div>
        <p class="label" style="margin-top:28px">${e(t('order.statusT'))}</p>
        <ol class="track"><li class="done"><span></span><span>${e(t('order.s1'))}</span></li><li class="now"><span></span><span>${e(t('order.s2'))}</span></li><li><span></span><span>${e(t('order.s3'))}</span></li><li><span></span><span>${e(t('order.s4'))}</span></li></ol>`;
      foot = `<button class="btn btn-line btn-block" type="button" data-sheet-close>${e(t('order.back'))}${I('arrow')}</button>`;
    } else if (!items.length) {
      body = `<p class="body" style="padding:32px 0">${e(t('order.empty'))}</p>`;
      foot = `<a class="btn btn-solid btn-block" href="#/menu" data-sheet-close>${e(t('order.toMenu'))}${I('arrow')}</a>`;
    } else {
      const savedName = localStorage.getItem('fx_c_name') || '';
      const savedPhone = localStorage.getItem('fx_c_phone') || '+998 ';
      body = `<ul>${items.map(([id, q]) => { const it = S.byId[id]; return `<li class="ci"><div><p class="n">${e(S.iName(it))}</p><p class="price">${S.money(it.price)}</p></div><span class="qty"><button type="button" data-sq="${id}" data-d="-1" aria-label="−1">−</button><span>${q}</span><button type="button" data-sq="${id}" data-d="1" aria-label="+1">+</button></span></li>`; }).join('')}</ul>
        <div style="margin-top:24px;display:grid;gap:12px">
          <div class="field"><label for="o-name">${S.lang === 'uz' ? 'Ismingiz' : S.lang === 'en' ? 'Your Name' : 'Ваше имя'} *</label><input id="o-name" required placeholder="${S.lang === 'uz' ? 'Ismingizni kiriting' : 'Например, Азиз'}" value="${e(savedName)}"></div>
          <div class="field"><label for="o-phone">${S.lang === 'uz' ? 'Telefon raqam' : S.lang === 'en' ? 'Phone Number' : 'Номер телефона'} *</label><input id="o-phone" type="tel" required placeholder="+998 90 123 45 67" value="${e(savedPhone)}"></div>
          <p class="label">${e(t('order.mode'))}</p>
          <div class="seg" role="group"><button type="button" data-mode="pickup" aria-pressed="${sheetMode === 'pickup'}">${e(t('order.pickup'))}</button><button type="button" data-mode="delivery" aria-pressed="${sheetMode === 'delivery'}">${e(t('order.deliveryMode'))}</button></div>
          ${sheetMode === 'delivery' ? `<div class="field"><label for="o-addr">${e(t('order.addr'))}</label><input id="o-addr" autocomplete="street-address" placeholder="${S.lang === 'uz' ? 'Yetkazish manzili (koʻcha, uy)' : 'Адрес доставки (улица, дом)'}"></div>` : ''}
          <p class="label" style="margin-top:8px">${e(t('order.pay'))}</p>
          <div class="pay">${['Payme', 'Click', 'Uzum', t('order.cash')].map((p, i) => `<label><input type="radio" name="pay" ${i === 0 ? 'checked' : ''}>${e(p)}</label>`).join('')}</div>
          <p class="form-note">${e(t('order.note'))}</p>
        </div>`;
      const sub = S.cartTotal();
      const delFee = sheetMode === 'delivery' ? (sub >= 250000 ? 0 : 20000) : 0;
      const grandTotal = sub + delFee;
      foot = `<div class="sumrow"><span>${e(t('order.subtotal'))}</span><span>${S.money(sub)}</span></div>`;
      if (sheetMode === 'delivery') {
        foot += `<div class="sumrow"><span>${e(t('order.delivery'))}</span><span>${delFee === 0 ? (S.lang === 'uz' ? 'Bepul' : S.lang === 'en' ? 'Free' : 'Бесплатно') : S.money(delFee)}</span></div>`;
      }
      foot += `<div class="sumrow tot"><span>${e(t('order.total'))}</span><span>${S.money(grandTotal)}</span></div>
        <button class="btn btn-accent btn-block" type="button" data-checkout>${e(t('order.checkout'))}${I('arrow')}</button>
        <a class="small" style="text-align:center" href="${F.phones[0].href}">${e(t('order.apps'))}: ${F.phones[0].display}</a>`;
    }
    $('#sheet').innerHTML = head + `<div class="sheet-b">${body}</div><div class="sheet-f">${foot}</div>`;
  }
  $('#sheet').addEventListener('click', async ev => {
    const b = ev.target.closest('button,a'); if (!b) return;
    if (b.hasAttribute('data-sheet-close')) { closeSheet(); if (sheetStep === 'status') { S.cart = {}; S.setQty('_', 0); } return; }
    if (b.dataset.sq) { S.setQty(b.dataset.sq, (S.cart[b.dataset.sq] || 0) + (+b.dataset.d)); drawSheet(); return; }
    if (b.dataset.mode) { sheetMode = b.dataset.mode; drawSheet(); return; }
    if (b.hasAttribute('data-checkout')) {
      const nameInput = $('#o-name');
      const phoneInput = $('#o-phone');
      const cName = nameInput ? nameInput.value.trim() : '';
      const cPhone = phoneInput ? phoneInput.value.trim() : '';
      if (!cName) {
        alert(S.lang === 'uz' ? 'Iltimos, ismingizni kiriting' : S.lang === 'en' ? 'Please enter your name' : 'Пожалуйста, введите ваше имя');
        if (nameInput) nameInput.focus();
        return;
      }
      const cleanPhone = cPhone.replace(/[\s\-()]/g, '');
      if (!cleanPhone.startsWith('+998') || cleanPhone.length !== 13) {
        alert(S.lang === 'uz' ? 'Iltimos, toʻliq telefon raqamini kiriting (+998XXXXXXXXX)' : 'Пожалуйста, введите корректный номер телефона (+998 XX XXX XX XX)');
        if (phoneInput) phoneInput.focus();
        return;
      }
      localStorage.setItem('fx_c_name', cName);
      localStorage.setItem('fx_c_phone', cPhone);

      b.disabled = true;
      b.innerHTML = `<span>${e(t('order.placing'))}</span><span class="spinner"></span>`;
      const items = Object.entries(S.cart).map(([id, q]) => ({
        id,
        name: S.byId[id]?.name,
        price: S.byId[id]?.price,
        qty: q
      }));
      const sub = S.cartTotal();
      const delFee = sheetMode === 'delivery' ? (sub >= 250000 ? 0 : 20000) : 0;
      const grandTotal = sub + delFee;

      const payload = {
        items,
        mode: sheetMode,
        orderType: sheetMode === 'delivery' ? 'Доставка курьером (сайт)' : 'Самовывоз (сайт)',
        address: $('#o-addr') ? $('#o-addr').value : (sheetMode === 'delivery' ? 'Уточняется' : 'Самовывоз'),
        payment: $('input[name="pay"]:checked') ? $('input[name="pay"]:checked').parentElement.textContent.trim() : 'Payme',
        name: cName,
        phone: cleanPhone,
        lang: S.lang,
        total: grandTotal
      };
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData && resData.ok) {
          lastOrderId = resData.id || `WEB-${resData.orderNum}`;
          sheetStep = 'status';
          S.cart = {};
          drawSheet();
        } else {
          alert('Ошибка оформления: ' + (resData?.error || 'Попробуйте снова'));
          b.disabled = false;
          b.innerHTML = `${e(t('order.checkout'))}${I('arrow')}`;
        }
      } catch (err) {
        alert('Сетевая ошибка при оформлении заказа. Пожалуйста, позвоните нам напрямую.');
        b.disabled = false;
        b.innerHTML = `${e(t('order.checkout'))}${I('arrow')}`;
      }
    }
  });
  document.addEventListener('fx:cart', () => {
    if (route === 'menu') { const list = $('#menu-list'); const y = scrollY; list.innerHTML = S.menuList(list.dataset.menu, ($('#menu-q') || {}).value); secs = [...document.querySelectorAll('.mcat')]; window.scrollTo(0, y); }
    const hdr = $('#hdr'); const foc = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.qty;
    hdr.innerHTML = S.renderHeader(route); renderFab();
  });

  /* ── open-now refresh ── */
  setInterval(() => document.querySelectorAll('.status').forEach(s => { s.outerHTML = S.statusHTML(); }), 60000);

  /* ── tweaks (host protocol) ── */
  function tweaksPanel() {
    const tw = S.tweaks, p = $('#tw');
    const seg = (key, opts) => `<div class="tw-seg">${opts.map(([v, l]) => `<button type="button" data-tw="${key}" data-v="${v}" aria-pressed="${String(tw[key]) === String(v)}">${l}</button>`).join('')}</div>`;
    p.innerHTML = `<div class="tw-h"><span>Tweaks</span><button type="button" data-twclose aria-label="Close" style="color:var(--text-dim)">${I('close').replace('<svg', '<svg width="16"')}</button></div>
    <div class="tw-b">
      <div class="tw-g"><span>Hero</span>${seg('hero', [['triptych', 'Triptych'], ['single', 'Single'], ['type', 'Type only']])}</div>
      <div class="tw-g"><span>Hero wordmark</span>${seg('wordmark', [['logo', 'Real logo'], ['serif', 'Serif FENIX']])}</div>
      <div class="tw-g"><span>Homepage priority (brief §13.1)</span>${seg('homeOrder', [['dining', 'Dining first'], ['events', 'Events first']])}</div>
      <div class="tw-g"><span>Accent</span><div class="tw-sw">${[['#C08A3E', '#D9A75B'], ['#C9A15A', '#E0BD7A'], ['#B8694A', '#D08667'], ['#8FA36A', '#A9BC84']].map(([a, h]) => `<button type="button" data-tw-accent="${a}" data-hi="${h}" style="background:${a}" aria-pressed="${tw.accent === a}" aria-label="${a}"></button>`).join('')}</div></div>
      <div class="tw-g"><span>Phase 2 ordering preview</span>${seg('ordering', [[true, 'On'], [false, 'Off']])}</div>
      <div class="tw-g"><span>Owner/draft markers</span>${seg('markers', [[true, 'Show'], [false, 'Hide']])}</div>
      <div class="tw-g"><span>Printed frame</span>${seg('frame', [[true, 'On'], [false, 'Off']])}</div>
      <div class="tw-g"><span>Film grain</span>${seg('grain', [[true, 'On'], [false, 'Off']])}</div>
    </div>`;
  }
  function setTweak(k, v) {
    S.tweaks[k] = v;
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*'); } catch (_) {}
    applyBody(); render(false); tweaksPanel();
  }
  $('#tw').addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-twclose')) { $('#tw').hidden = true; try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (_) {} return; }
    if (b.dataset.tw) { let v = b.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false; setTweak(b.dataset.tw, v); }
    if (b.dataset.twAccent) { S.tweaks.accentHi = b.dataset.hi; try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { accentHi: b.dataset.hi } }, '*'); } catch (_) {} setTweak('accent', b.dataset.twAccent); }
  });
  addEventListener('message', ev => {
    const d = ev.data || {};
    if (d.type === '__activate_edit_mode') { tweaksPanel(); $('#tw').hidden = false; }
    if (d.type === '__deactivate_edit_mode') $('#tw').hidden = true;
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}

  /* ── boot ── */
  S.loadLogos().then(() => {
    if (!location.hash && localStorage.getItem('fx.route')) history.replaceState(null, '', localStorage.getItem('fx.route'));
    applyBody(); render(false);
    if (S.missing.size) console.info('[i18n] fell back to ru for', S.missing.size, 'strings');
  });
})();
