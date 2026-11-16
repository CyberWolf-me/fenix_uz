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
    if (route === 'menu' && params[2]) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`mi-${params[2]}`) || document.getElementById(`m-${params[0]}-${params[1]}`); if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - Math.max(160, innerHeight * 0.35), behavior: 'auto' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      });
    } else if (route === 'menu' && params[1]) {
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
    if (a.hasAttribute('data-open-cart') || a.id === 'fab') { closeLb(); return openSheet(); }
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
    }, 3000);
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
      <div class="lb-stage${k.startsWith('dish/') ? ' dish-lb' : ''}"><img src="img/${k}.webp?v=2" onerror="this.onerror=null;this.src='img/' + '${k}' + '.png?v=2'" alt="${e(S.IMG[k][S.lang])}"></div>
      ${lbOrder(k)}
      <div class="lb-nav"><button type="button" data-lbp aria-label="${e(t('a11y.prev'))}">${I('left')}</button><button type="button" data-lbn aria-label="${e(t('a11y.next'))}">${I('right')}</button></div>`;
    lb.querySelector('[data-lbx]').onclick = closeLb;
    lb.querySelector('[data-lbp]').onclick = () => stepLb(-1);
    lb.querySelector('[data-lbn]').onclick = () => stepLb(1);
  }
  function lbOrder(k) {
    if (!k.startsWith('dish/')) return '';
    const id = k.slice(5), it = S.byId[id]; if (!it || !S.tweaks.ordering || it.menu === 'bar') return '';
    const q = S.cart[id] || 0, n = S.cartCount(), size = S.iSize(it);
    const ctl = S.isStopped(it)
      ? `<p class="small lb-stop">${e(t('order.stopped'))}</p>`
      : q
        ? `<div class="lb-row"><span class="qty"><button type="button" data-qty="${id}" data-d="-1" aria-label="−1 ${e(S.iName(it))}">−</button><span aria-live="polite">${q}</span><button type="button" data-qty="${id}" data-d="1" aria-label="+1 ${e(S.iName(it))}">+</button></span><span class="small">${e(t('order.inOrder'))}</span></div>`
        : `<button class="btn btn-accent btn-block" type="button" data-qty="${id}" data-d="1">${e(t('order.addTo'))} · ${S.iPrice(it)}</button>`;
    return `<div class="lb-order" id="lb-order">
      <div class="lb-info"><h3 class="h3">${e(S.iName(it))}</h3><p class="price">${size ? `<span style="color:var(--text-faint)">${e(size)} · </span>` : ''}${S.iPrice(it)}</p>${it.note ? `<p class="small">${e(S.iNote(it))}</p>` : ''}</div>
      <div class="lb-act">${ctl}${n ? `<button class="btn btn-line btn-block" type="button" data-open-cart>${e(t('order.goTo'))} (${n})${I('arrow')}</button>` : ''}</div>
    </div>`;
  }
  function stepLb(d) { lbI = (lbI + d + S.galKeys.length) % S.galKeys.length; const foc = document.activeElement && document.activeElement.hasAttribute('data-lbn') ? '[data-lbn]' : document.activeElement && document.activeElement.hasAttribute('data-lbp') ? '[data-lbp]' : '[data-lbx]'; drawLb(); $('#lb').querySelector(foc).focus(); }
  function closeLb() { const lb = $('#lb'); if (lb.hidden) return; lb.hidden = true; document.body.style.overflow = ''; lbTrigger && lbTrigger.focus(); }

  /* ── checkout sheet: cart → delivery/pickup (map) → contact → status ── */
  const CO_KEY = 'fx.co';
  const coLoad = () => { try { return JSON.parse(localStorage.getItem(CO_KEY) || '{}') || {}; } catch (_) { return {}; } };
  const co = Object.assign({ mode: 'delivery', comment: '', lat: null, lon: null, street: '', full: '', district: '', entrance: '', floor: '', apt: '', note: '', name: '', phone: '' }, coLoad());
  if (!co.name) co.name = localStorage.getItem('fx_c_name') || '';
  if (!co.phone) co.phone = (localStorage.getItem('fx_c_phone') || '').replace(/\D/g, '').replace(/^998/, '').slice(0, 9);
  const coSave = () => { try { const { comment, ...keep } = co; localStorage.setItem(CO_KEY, JSON.stringify(keep)); } catch (_) {} };
  const CO_DEFAULT = [41.2995, 69.2401]; // Tashkent centre
  const FREE_FROM = 250000, DEL_FEE = 20000; // must match server/server.mjs
  let sheetStep = 'cart', lastOrderId = null, coMap = null, coGeoT = null, coSearchT = null, coErr = {};
  const ct = k => t('co.' + k);
  const fee = sub => co.mode === 'delivery' ? (sub >= FREE_FROM ? 0 : DEL_FEE) : 0;
  const fmtPhone = d => { d = String(d).replace(/\D/g, '').slice(0, 9); return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' '); };
  const dishImg = id => S.DISH_PHOTOS.has(id) ? `<img src="img/dish/${id}.webp?v=2" onerror="this.onerror=null;this.src='img/dish/${id}.png?v=2'" alt="" loading="lazy" decoding="async">` : `<img src="img/fenix-mark.svg" alt="" class="ph">`;

  function openSheet() { lastFocus = document.activeElement; if (sheetStep !== 'status') sheetStep = 'cart'; coErr = {}; drawSheet(); $('#sheet').classList.add('open'); $('#sheet').removeAttribute('inert'); $('#sheet-bg').classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(() => { const b = $('#sheet').querySelector('button'); b && b.focus({ preventScroll: true }); }, 60); }
  function closeSheet() { const s = $('#sheet'); if (!s.classList.contains('open')) return; s.classList.remove('open'); s.setAttribute('inert', ''); $('#sheet-bg').classList.remove('open'); document.body.style.overflow = ''; if (sheetStep === 'status') sheetStep = 'cart'; if (coMap) { coMap.remove(); coMap = null; } lastFocus && lastFocus.focus && lastFocus.focus(); }
  $('#sheet-bg').addEventListener('click', closeSheet);

  function stepper() {
    const st = ['cart', 'where', 'contact'], cur = st.indexOf(sheetStep);
    return `<ol class="co-steps">${st.map((s, i) => `<li class="${i < cur ? 'done' : i === cur ? 'now' : ''}"><span>${i + 1}</span>${e(ct('s' + (i + 1)))}</li>`).join('')}</ol>`;
  }
  function totals(btn) {
    const sub = S.cartTotal(), f = fee(sub);
    let h = `<div class="sumrow"><span>${e(t('order.subtotal'))}</span><span>${S.money(sub)}</span></div>`;
    if (co.mode === 'delivery') h += `<div class="sumrow"><span>${e(t('order.delivery'))}</span><span>${f === 0 ? e(ct('free')) : S.money(f)}</span></div>`;
    return h + `<div class="sumrow tot"><span>${e(t('order.total'))}</span><span>${S.money(sub + f)}</span></div>` + (btn || '');
  }
  function freeBar(sub) {
    if (co.mode !== 'delivery') return '';
    const left = FREE_FROM - sub, pct = Math.min(100, Math.round(sub / FREE_FROM * 100));
    return `<div class="co-free"><p class="small">${left > 0 ? `${e(ct('toFree'))} <b>${S.money(left)}</b>` : e(ct('freeOk'))}</p><span class="co-bar"><i style="width:${pct}%"></i></span></div>`;
  }
  function coAddress(withCoords) {
    const d = [];
    if (co.entrance) d.push((S.lang === 'uz' ? 'kirish ' : 'под. ') + co.entrance);
    if (co.floor) d.push((S.lang === 'uz' ? 'qavat ' : 'эт. ') + co.floor);
    if (co.apt) d.push((S.lang === 'uz' ? 'xonadon ' : 'кв. ') + co.apt);
    let a = co.full || co.street || '';
    if (d.length) a += ', ' + d.join(', ');
    if (co.note) a += ' (' + co.note + ')';
    if (withCoords && co.lat != null) a += ` [${co.lat.toFixed(6)}, ${co.lon.toFixed(6)}]`;
    return a;
  }

  function drawSheet() {
    if (coMap) { coMap.remove(); coMap = null; }
    const items = Object.entries(S.cart).filter(([id]) => S.byId[id]);
    const back = ['where', 'contact'].includes(sheetStep) ? `<button class="icon-btn" type="button" data-co-back aria-label="${e(ct('back'))}">${I('left')}</button>` : '';
    const head = `<div class="sheet-h co-head"><div class="co-top">${back}<h2 class="h3">${e(t('order.title'))}</h2><button class="icon-btn" type="button" data-sheet-close aria-label="${e(t('a11y.close'))}">${I('close')}</button></div>${sheetStep !== 'status' && items.length ? stepper() : ''}</div>`;
    let body = '', foot = '';
    const sub = S.cartTotal();

    if (sheetStep === 'status') {
      const del = co.lastMode === 'delivery';
      body = `<div class="notice ok" style="margin-top:20px"><span class="ic">${I('check')}</span><h3>№ ${e(lastOrderId || 'WEB-OK')}</h3><p class="body">${e(del ? t('order.note') : ct('pickupDone'))}</p></div>
        <p class="label" style="margin-top:28px">${e(t('order.statusT'))}</p>
        <ol class="track"><li class="done"><span></span><span>${e(t('order.s1'))}</span></li><li class="now"><span></span><span>${e(t('order.s2'))}</span></li>${del ? `<li><span></span><span>${e(t('order.s3'))}</span></li><li><span></span><span>${e(t('order.s4'))}</span></li>` : `<li><span></span><span>${e(ct('ready'))}</span></li>`}</ol>
        <p class="form-note">${e(ct('questions'))} <a class="link" href="${F.phones[0].href}">${F.phones[0].display}</a></p>`;
      foot = `<button class="btn btn-line btn-block" type="button" data-sheet-close>${e(t('order.back'))}${I('arrow')}</button>`;
    } else if (!items.length) {
      body = `<div class="co-empty">${I('bag')}<p class="body">${e(t('order.empty'))}</p></div>`;
      foot = `<a class="btn btn-solid btn-block" href="#/menu" data-sheet-close>${e(t('order.toMenu'))}${I('arrow')}</a>`;
    } else if (sheetStep === 'cart') {
      body = `<ul class="co-list">${items.map(([id, q]) => { const it = S.byId[id], stop = S.isStopped(it); return `<li class="co-item${stop ? ' is-stopped' : ''}">
          <span class="co-thumb">${dishImg(id)}</span>
          <div class="co-info"><p class="n">${e(S.iName(it))}</p><p class="price">${S.money(it.price * q)}${q > 1 ? ` <span>${q} × ${S.money(it.price)}</span>` : ''}</p>${stop ? `<p class="co-stop">${e(t('order.stopped'))}</p>` : ''}</div>
          <span class="qty"><button type="button" data-sq="${id}" data-d="-1" aria-label="${q === 1 ? e(ct('remove')) : '−1'} ${e(S.iName(it))}">${q === 1 ? '×' : '−'}</button><span aria-live="polite">${q}</span><button type="button" data-sq="${id}" data-d="1" aria-label="+1 ${e(S.iName(it))}">+</button></span>
        </li>`; }).join('')}</ul>
        <a class="co-more" href="#/menu" data-sheet-close>${I('plus')}<span>${e(ct('more'))}</span></a>
        <div class="field" style="margin-top:22px"><label for="co-comment">${e(ct('comment'))}</label><textarea id="co-comment" data-co="comment" rows="2" maxlength="300" placeholder="${e(ct('commentPh'))}">${e(co.comment)}</textarea></div>
        ${coErr.stop ? `<p class="co-msg">${e(coErr.stop)}</p>` : ''}`;
      foot = totals(`<button class="btn btn-accent btn-block" type="button" data-co-next="where">${e(ct('next'))}${I('arrow')}</button>`);
    } else if (sheetStep === 'where') {
      const del = co.mode === 'delivery';
      body = `<p class="label" style="margin-top:16px">${e(ct('how'))}</p>
        <div class="seg" role="group" style="margin-top:10px"><button type="button" data-mode="delivery" aria-pressed="${del}">${e(t('order.deliveryMode'))}</button><button type="button" data-mode="pickup" aria-pressed="${!del}">${e(t('order.pickup'))}</button></div>
        ${freeBar(sub)}
        ${del ? `
        <div class="co-search"><label class="co-search-in">${I('search')}<input id="co-q" type="search" autocomplete="off" placeholder="${e(ct('search'))}" aria-label="${e(ct('search'))}"></label><div class="co-results" id="co-results" hidden></div></div>
        <div class="co-map-wrap"><div id="co-map" class="co-map" aria-label="${e(ct('mapHint'))}"></div><span class="co-pin" aria-hidden="true"></span>
          <button type="button" class="co-gps" data-co-gps>${I('pin')}<span>${e(ct('gps'))}</span></button></div>
        <p class="small co-hint">${e(ct('mapHint'))}</p>
        <div class="co-addr${coErr.addr ? ' err' : ''}" id="co-addr" aria-live="polite"><b>${e(co.full || ct('pickOnMap'))}</b>${co.district ? `<span>${e(co.district)}</span>` : ''}</div>
        ${coErr.addr ? `<p class="co-msg">${e(coErr.addr)}</p>` : ''}
        <div class="co-grid3">
          <div class="field"><label for="co-ent">${e(ct('entrance'))}</label><input id="co-ent" data-co="entrance" inputmode="numeric" maxlength="6" value="${e(co.entrance)}"></div>
          <div class="field"><label for="co-floor">${e(ct('floor'))}</label><input id="co-floor" data-co="floor" inputmode="numeric" maxlength="4" value="${e(co.floor)}"></div>
          <div class="field"><label for="co-apt">${e(ct('apt'))}</label><input id="co-apt" data-co="apt" maxlength="10" value="${e(co.apt)}"></div>
        </div>
        <div class="field" style="margin-top:14px"><label for="co-note">${e(ct('courier'))}</label><input id="co-note" data-co="note" maxlength="160" placeholder="${e(ct('courierPh'))}" value="${e(co.note)}"></div>` : `
        <p class="label" style="margin-top:22px">${e(ct('pickupT'))}</p>
        <div class="co-map-wrap co-pickup-map"><div id="co-pmap" class="co-map" aria-label="Fenix — ${e(F.address[S.lang] || F.address.ru)}"></div></div>
        <div class="co-addr"><b>Fenix</b><span>${e(F.address[S.lang] || F.address.ru)}</span><span>${e(ct('hours'))}: ${e((F.hours.week[1] || []).join('–'))}</span></div>
        <div class="map-links co-pickup-l"><a class="btn btn-line" href="${F.maps.google}" target="_blank" rel="noopener" data-track="directions">${e(t('contact.google'))}${I('arrow')}</a><a class="btn btn-line" href="${F.maps.yandex}" target="_blank" rel="noopener" data-track="directions">${e(t('contact.yandex'))}${I('arrow')}</a></div>`}`;
      foot = totals(`<button class="btn btn-accent btn-block" type="button" data-co-next="contact">${e(ct('next'))}${I('arrow')}</button>`);
    } else if (sheetStep === 'contact') {
      const del = co.mode === 'delivery';
      body = `<div style="display:grid;gap:18px;margin-top:16px">
          <div class="field${coErr.name ? ' err' : ''}"><label for="co-name">${e(ct('name'))} *</label><input id="co-name" data-co="name" autocomplete="name" maxlength="60" value="${e(co.name)}">${coErr.name ? `<span class="msg">${e(coErr.name)}</span>` : ''}</div>
          <div class="field${coErr.phone ? ' err' : ''}"><label for="co-phone">${e(ct('phone'))} *</label><div class="phone"><span>+998</span><input id="co-phone" data-co="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="90 123 45 67" value="${e(fmtPhone(co.phone))}"></div>${coErr.phone ? `<span class="msg">${e(coErr.phone)}</span>` : ''}</div>
        </div>
        <p class="label" style="margin-top:26px">${e(t('order.pay'))}</p>
        <div class="co-cash">${I('check')}<span>${e(t('order.cash'))} — ${e(del ? ct('cashCourier') : ct('cashPickup'))}</span></div>
        <div class="co-sum">
          <p class="label">${e(ct('summary'))}</p>
          <p class="co-sum-l"><b>${e(del ? t('order.deliveryMode') : t('order.pickup'))}</b> · ${e(del ? coAddress(false) : (F.address[S.lang] || F.address.ru))}</p>
          <p class="co-sum-l">${items.map(([id, q]) => e(S.iName(S.byId[id])) + (q > 1 ? ' ×' + q : '')).join(', ')}</p>
          ${co.comment.trim() ? `<p class="co-sum-l">“${e(co.comment.trim())}”</p>` : ''}
          <button type="button" class="link" data-co-goto="cart">${e(ct('change'))}</button>
        </div>
        ${coErr.send ? `<p class="co-msg">${e(coErr.send)}</p>` : ''}`;
      foot = totals(`<button class="btn btn-accent btn-block" type="button" data-checkout>${e(ct('place'))}${I('arrow')}</button>
        <a class="small" style="text-align:center" href="${F.phones[0].href}">${e(t('order.apps'))}: ${F.phones[0].display}</a>`);
    }
    $('#sheet').innerHTML = head + `<div class="sheet-b">${body}</div><div class="sheet-f">${foot}</div>`;
    if (sheetStep === 'where' && co.mode === 'delivery' && items.length) initCoMap();
    if (sheetStep === 'where' && co.mode === 'pickup' && items.length) initPickupMap();
  }

  /* map — Leaflet is loaded only when the delivery step opens */
  let leafletP = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletP) return leafletP;
    leafletP = new Promise((res, rej) => {
      if (!document.querySelector('link[data-leaflet]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'css/leaflet.css'; l.dataset.leaflet = ''; document.head.appendChild(l); }
      const s = document.createElement('script'); s.src = 'js/leaflet.js'; s.onload = res; s.onerror = () => { leafletP = null; rej(); }; document.head.appendChild(s);
    });
    return leafletP;
  }
  function initCoMap() {
    loadLeaflet().then(() => {
      const el = document.getElementById('co-map'); if (!el || coMap) return;
      const has = co.lat != null;
      coMap = L.map(el, { center: has ? [co.lat, co.lon] : CO_DEFAULT, zoom: has ? 17 : 12 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(coMap);
      coMap.on('movestart', () => { const p = document.querySelector('.co-pin'); p && p.classList.add('up'); });
      coMap.on('moveend', () => {
        const p = document.querySelector('.co-pin'); p && p.classList.remove('up');
        if (coMap._coSkip) { coMap._coSkip = false; return; }
        const c = coMap.getCenter(); setPoint(c.lat, c.lng);
      });
      setTimeout(() => coMap && coMap.invalidateSize(), 300);
    }).catch(() => { const el = document.getElementById('co-map'); if (el) el.innerHTML = `<p class="small" style="padding:20px">${e(ct('mapErr'))}</p>`; });
  }
  function initPickupMap() {
    loadLeaflet().then(() => {
      const el = document.getElementById('co-pmap'); if (!el || coMap) return;
      const pt = [F.geo.lat, F.geo.lon];
      coMap = L.map(el, { center: pt, zoom: 16, scrollWheelZoom: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(coMap);
      L.marker(pt, { icon: L.divIcon({ className: 'co-rmark', html: '<span class="co-pin" aria-hidden="true"></span><b>Fenix</b>', iconSize: [30, 42], iconAnchor: [15, 42] }), keyboard: false }).addTo(coMap);
      setTimeout(() => coMap && coMap.invalidateSize(), 300);
    }).catch(() => { const el = document.getElementById('co-pmap'); if (el) el.innerHTML = `<p class="small" style="padding:20px">${e(F.address[S.lang] || F.address.ru)}</p>`; });
  }
  function setAddrBox(main, sub, loading) { const b = document.getElementById('co-addr'); if (!b) return; b.classList.toggle('loading', !!loading); b.classList.remove('err'); b.innerHTML = `<b>${e(main)}</b>${sub ? `<span>${e(sub)}</span>` : ''}`; }
  function setPoint(lat, lon, known) {
    co.lat = lat; co.lon = lon; delete coErr.addr;
    const m = $('#sheet .co-msg'); m && m.remove();
    if (known) { co.street = known.title; co.full = known.title + (known.sub ? ', ' + known.sub : ''); co.district = ''; setAddrBox(co.full, ''); coSave(); return; }
    co.full = ''; setAddrBox(ct('addrLoading'), '', true);
    clearTimeout(coGeoT);
    coGeoT = setTimeout(() => {
      fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}&lang=${S.lang}`).then(r => r.json()).then(r => {
        if (co.lat !== lat || co.lon !== lon) return;
        if (!r || !r.ok) throw 0;
        co.street = r.street || ''; co.district = r.district || ''; co.full = r.full || [r.district, r.street].filter(Boolean).join(', ');
        setAddrBox(co.full, co.district); coSave();
      }).catch(() => {
        if (co.lat !== lat || co.lon !== lon) return;
        co.full = `${S.lang === 'uz' ? 'Toshkent' : 'Ташкент'} (${lat.toFixed(4)}, ${lon.toFixed(4)})`; co.district = ''; setAddrBox(co.full, ''); coSave();
      });
    }, 350);
  }
  function coSearch(q) {
    const box = document.getElementById('co-results'); if (!box) return;
    clearTimeout(coSearchT);
    if (q.trim().length < 3) { box.hidden = true; box.innerHTML = ''; return; }
    coSearchT = setTimeout(() => {
      fetch(`/api/geo/search?q=${encodeURIComponent(q.trim())}&lang=${S.lang}`).then(r => r.json()).then(r => {
        const list = (r && r.results) || [];
        box.innerHTML = list.length ? list.slice(0, 6).map(x => `<button type="button" data-co-hit data-lat="${x.lat}" data-lon="${x.lon}" data-title="${e(x.title)}" data-sub="${e(x.subtitle || '')}"><b>${e(x.title)}</b><span>${e(x.subtitle || '')}</span></button>`).join('') : `<p class="small">${e(ct('notFound'))}</p>`;
        box.hidden = false;
      }).catch(() => { box.hidden = true; });
    }, 300);
  }

  function validate(step) {
    if (step === 'cart') { const bad = Object.keys(S.cart).map(id => S.byId[id]).filter(it => it && S.isStopped(it)); if (bad.length) coErr.stop = ct('stopErr') + ': ' + bad.map(S.iName).join(', '); }
    if (step === 'where' && co.mode === 'delivery' && (co.lat == null || !co.full)) coErr.addr = ct('errAddr');
    if (step === 'contact') {
      if (co.name.trim().length < 2) coErr.name = ct('errName');
      if (co.phone.replace(/\D/g, '').length !== 9) coErr.phone = ct('errPhone');
    }
    return !Object.keys(coErr).length;
  }
  function goStep(s) { sheetStep = s; drawSheet(); const b = $('#sheet .sheet-b'); if (b) b.scrollTop = 0; const h = $('#sheet h2'); h && h.setAttribute('tabindex', '-1'); h && h.focus({ preventScroll: true }); }
  function showErr() { drawSheet(); const el = $('#sheet').querySelector('.field.err input, .co-msg, .co-addr.err'); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (el.tagName === 'INPUT') el.focus({ preventScroll: true }); } }

  $('#sheet').addEventListener('input', ev => {
    const k = ev.target.dataset.co;
    if (k === 'phone') { let d = ev.target.value.replace(/\D/g, ''); if (d.length > 9 && d.startsWith('998')) d = d.slice(3); d = d.slice(0, 9); co.phone = d; ev.target.value = fmtPhone(d); }
    else if (k) co[k] = ev.target.value;
    if (k) { coSave(); const f = ev.target.closest('.field.err'); if (f) { f.classList.remove('err'); const m = f.querySelector('.msg'); m && m.remove(); delete coErr[k]; } }
    if (ev.target.id === 'co-q') coSearch(ev.target.value);
  });
  $('#sheet').addEventListener('click', async ev => {
    const b = ev.target.closest('button,a'); if (!b) return;
    if (b.hasAttribute('data-sheet-close')) { closeSheet(); return; }
    if (b.dataset.sq) { S.setQty(b.dataset.sq, (S.cart[b.dataset.sq] || 0) + (+b.dataset.d)); coErr = {}; drawSheet(); return; }
    if (b.dataset.mode) { co.mode = b.dataset.mode; coSave(); coErr = {}; drawSheet(); return; }
    if (b.hasAttribute('data-co-back')) { coErr = {}; goStep(sheetStep === 'contact' ? 'where' : 'cart'); return; }
    if (b.dataset.coGoto) { coErr = {}; goStep(b.dataset.coGoto); return; }
    if (b.dataset.coNext) { coErr = {}; if (!validate(sheetStep)) return showErr(); goStep(b.dataset.coNext); return; }
    if (b.hasAttribute('data-co-hit')) {
      const lat = +b.dataset.lat, lon = +b.dataset.lon, box = document.getElementById('co-results'), q = document.getElementById('co-q');
      box.hidden = true; if (q) q.value = '';
      if (coMap) { coMap._coSkip = true; coMap.setView([lat, lon], 17); }
      setPoint(lat, lon, { title: b.dataset.title, sub: b.dataset.sub }); return;
    }
    if (b.hasAttribute('data-co-gps')) {
      const lbl = b.querySelector('span');
      if (!navigator.geolocation) { setAddrBox(ct('gpsErr'), ''); return; }
      b.disabled = true; lbl.textContent = ct('locating');
      navigator.geolocation.getCurrentPosition(p => {
        b.disabled = false; lbl.textContent = ct('gps');
        const { latitude: la, longitude: lo } = p.coords;
        if (coMap) { coMap._coSkip = true; coMap.setView([la, lo], 17); }
        setPoint(la, lo);
      }, () => { b.disabled = false; lbl.textContent = ct('gps'); setAddrBox(ct('gpsErr'), ''); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      return;
    }
    if (b.hasAttribute('data-checkout')) {
      coErr = {};
      if (!validate('cart')) { sheetStep = 'cart'; return showErr(); }
      if (!validate('where')) { sheetStep = 'where'; return showErr(); }
      if (!validate('contact')) return showErr();
      localStorage.setItem('fx_c_name', co.name.trim()); localStorage.setItem('fx_c_phone', '+998' + co.phone);
      b.disabled = true; b.innerHTML = `<span>${e(t('order.placing'))}</span><span class="spinner"></span>`;
      const items = Object.entries(S.cart).filter(([id]) => S.byId[id]).map(([id, q]) => ({ id, name: S.byId[id].name, price: S.byId[id].price, qty: q }));
      const payload = {
        items, mode: co.mode,
        orderType: co.mode === 'delivery' ? 'Доставка курьером (сайт)' : 'Самовывоз (сайт)',
        address: co.mode === 'delivery' ? coAddress(true) : 'Самовывоз',
        comment: co.comment.trim(),
        payment: 'Наличными',
        name: co.name.trim(), phone: '+998' + co.phone,
        telegramUserId: S.tgUser ? S.tgUser.id : 0,
        lang: S.lang
      };
      try {
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const r = await res.json().catch(() => ({}));
        if (r && r.ok) {
          lastOrderId = r.id || `WEB-${r.orderNum}`; co.lastMode = co.mode; co.comment = ''; coSave();
          sheetStep = 'status'; S.cart = {}; S.setQty('_', 0); drawSheet(); return;
        }
        coErr.send = (r && r.error) || ct('sendErr');
      } catch (_) { coErr.send = ct('netErr'); }
      drawSheet();
    }
  });
  document.addEventListener('fx:cart', () => {
    const lbo = $('#lb-order'); if (lbo && !$('#lb').hidden) { const fq = document.activeElement && document.activeElement.closest('#lb-order') ? (document.activeElement.dataset.d || 'cart') : null; lbo.outerHTML = lbOrder(S.galKeys[lbI]); if (fq) { const b = $('#lb-order').querySelector(fq === 'cart' ? '[data-open-cart]' : `[data-d="${fq}"]`) || $('#lb-order').querySelector('button'); b && b.focus(); } }
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
  fetch('/api/menu/stoplist')
    .then(r => r.json())
    .then(data => {
      if (data && Array.isArray(data.stopped)) {
        S.stoplist = new Set(data.stopped.map(x => String(x).toLowerCase().trim()));
        if (location.hash.startsWith('#/menu') || location.hash.startsWith('#/delivery')) {
          const ml = document.getElementById('menu-list');
          if (ml) render(false);
        }
      }
    })
    .catch(() => {});

  S.loadLogos().then(() => {
    if (!location.hash && localStorage.getItem('fx.route')) history.replaceState(null, '', localStorage.getItem('fx.route'));
    applyBody(); render(false);
    if (S.missing.size) console.info('[i18n] fell back to ru for', S.missing.size, 'strings');
  });
})();
