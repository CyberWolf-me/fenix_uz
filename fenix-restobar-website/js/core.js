/* Fenix prototype — core: state, i18n, helpers, hours, router shell. Vanilla JS, no framework. */
(function () {
  const I18N = window.FENIX_I18N, F = window.FENIX_FACTS, M = window.FENIX_MENU;
  const LANGS = ['ru', 'uz', 'en'];
  const qs = new URLSearchParams(location.search);
  const S = window.FX = {
    lang: LANGS.includes(qs.get('lang')) ? qs.get('lang') : (localStorage.getItem('fx.lang') || 'ru'),
    cart: JSON.parse(localStorage.getItem('fx.cart') || '{}'),
    tweaks: window.FX_TWEAKS || {},
    missing: new Set(),
    stoplist: new Set()
  };
  if (!LANGS.includes(S.lang)) S.lang = 'ru';

  /* ── i18n ─────────────────────────────────────────── */
  function get(obj, path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj); }
  S.t = function (key) {
    let v = get(I18N[S.lang], key);
    if (v == null) { v = get(I18N.ru, key); if (S.lang !== 'ru') { S.missing.add(S.lang + ':' + key); } }
    if (v == null) { console.warn('[i18n] missing key', key); return key; }
    return v;
  };
  S.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Escapes, then turns [[OWNER: …]] into a visible marker (brief §12) */
  S.fx = function (s) {
    return S.esc(s).replace(/\[\[OWNER:?\s*([^\]]*)\]\]/g, (m, what) => `<mark class="owner" title="Owner to confirm">◇ ${what || 'OWNER'}</mark>`);
  };
  S.tx = key => S.fx(S.t(key));
  S.dot = status => (status && status !== 'verified') ? `<span class="fact-d" title="${S.esc(S.t('markers.draft'))}" aria-hidden="true"></span>` : '';

  /* ── formatting ───────────────────────────────────── */
  const CUR = { ru: 'сум', uz: 'soʻm', en: 'so‘m' };
  S.num = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
  S.money = n => S.num(n) + '\u00A0' + CUR[S.lang];

  /* ── icons (simple line glyphs) ───────────────────── */
  const P = {
    arrow: '<svg class="arrow" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5h13M9 1l4 4-4 4"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    plus: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M7 1v12M1 7h12"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    pin: '<svg viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M12 31s10-11 10-19A10 10 0 0 0 2 12c0 8 10 19 10 19z"/><circle cx="12" cy="12" r="3.5"/></svg>',
    left: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" width="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    bang: '<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 6v8M12 17v1"/></svg>'
  };
  S.icon = n => P[n] || '';

  /* ── logo (inline the real traced SVG so it takes currentColor) ── */
  S.logos = {};
  S.loadLogos = () => Promise.all(['mark', 'wordmark', 'lockup'].map(n =>
    fetch('img/fenix-' + n + '.svg').then(r => r.text()).then(t => { S.logos[n] = t.replace('<svg ', '<svg aria-hidden="true" focusable="false" '); }).catch(() => { S.logos[n] = '<span style="font:300 26px var(--font-display);letter-spacing:.2em">FENIX</span>'; })
  ));

  /* ── hours, Asia/Tashkent (UTC+5, no DST) ─────────── */
  const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  S.tashNow = () => { const d = new Date(Date.now() + (F.hours.tzOffsetMin + new Date().getTimezoneOffset()) * 60000); return d; };
  S.dayRange = dow => { const [o, c] = F.hours.week[dow]; let cm = toMin(c); const om = toMin(o); if (cm <= om) cm += 1440; return [om, cm]; };
  S.fmtMin = m => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  S.openState = () => {
    const now = S.tashNow(), dow = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    const [o, c] = S.dayRange(dow);
    if (m >= o && m < c) return { open: true, until: S.fmtMin(c) };
    const [, yc] = S.dayRange((dow + 6) % 7);
    if (yc > 1440 && m < yc - 1440) return { open: true, until: S.fmtMin(yc) };
    if (m < o) return { open: false, opens: S.fmtMin(o), when: S.t('status.today') };
    return { open: false, opens: S.fmtMin(S.dayRange((dow + 1) % 7)[0]), when: S.t('status.tomorrow') };
  };
  S.statusHTML = () => {
    const st = S.openState();
    return st.open
      ? `<span class="status"><span class="dot on"></span>${S.esc(S.t('status.open'))} · ${S.esc(S.t('status.until'))} ${st.until}</span>`
      : `<span class="status"><span class="dot"></span>${S.esc(S.t('status.closed'))} · ${S.esc(S.t('status.opensAt'))} ${st.opens}</span>`;
  };
  /* Weekly table, grouped Mon-first */
  S.hoursRows = () => {
    const order = [1, 2, 3, 4, 5, 6, 0], today = S.tashNow().getDay();
    return order.map(d => {
      const [o, c] = F.hours.week[d];
      return `<li class="hrow${d === today ? ' today' : ''}"><span class="d">${S.esc(S.t('days')[d])}</span><span class="lead" aria-hidden="true"></span><span>${o} – ${c}</span></li>`;
    }).join('');
  };
  S.hoursCompact = () => {
    const w = F.hours.week, sh = S.t('daysShort');
    return `${sh[1]}–${sh[4]}, ${sh[0]} ${w[1][0]}–${w[1][1]}<br>${sh[5]}–${sh[6]} ${w[5][0]}–${w[5][1]}`;
  };
  /* Reservation slots for a yyyy-mm-dd date */
  S.slotsFor = (iso) => {
    if (!iso) return [];
    const d = new Date(iso + 'T12:00:00'), dow = d.getDay();
    const [o, c] = S.dayRange(dow), last = c - F.hours.lastSlotBeforeCloseMin;
    const now = S.tashNow(), todayIso = S.isoDate(now);
    const nowM = now.getHours() * 60 + now.getMinutes();
    const out = [];
    for (let m = o; m <= last; m += 30) {
      if (iso === todayIso && m < nowM + 30) continue;
      out.push({ value: S.fmtMin(m), label: S.fmtMin(m) + (m >= 1440 ? ' · +1' : ''), next: m >= 1440 });
    }
    return out;
  };
  S.isoDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  /* ── menu helpers ─────────────────────────────────── */
  const SEAS = /\s*\((по сезону|seasonal|mavsumiy)\)/i;
  S.items = M.items.map(r => {
    const [id, menu, section, ru, uz, en, price, priceAlt, size, nRu, nUz, nEn, tags, source] = r;
    const t = tags.slice();
    if (SEAS.test(ru)) t.push('seasonal');
    return { id, menu, section, name: { ru: ru.replace(SEAS, ''), uz: (uz || ru).replace(SEAS, ''), en: (en || ru).replace(SEAS, '') }, price, priceAlt, size, note: nRu ? { ru: nRu, uz: nUz, en: nEn } : null, tags: t, source };
  });
  S.byId = Object.fromEntries(S.items.map(i => [i.id, i]));
  /* Dish photos (owner-supplied and generated studio photography). */
  S.DISH_PHOTOS = new Set([
    'europe-001','europe-002','europe-003','europe-004','europe-005','europe-006','europe-007','europe-008','europe-009','europe-010',
    'europe-011','europe-012','europe-013','europe-014','europe-015',
    'europe-016','europe-017','europe-018','europe-019','europe-020','europe-021','europe-022','europe-023','europe-024','europe-025',
    'europe-026','europe-027','europe-028','europe-029','europe-030','europe-031',/* 032 lentil, 033 mushroom: hidden until real photos */'europe-034','europe-035',
    'europe-036','europe-037','europe-038','europe-039',
    'europe-040','europe-041','europe-042','europe-043','europe-044','europe-045','europe-046','europe-047','europe-048','europe-049',
    'europe-050','europe-051','europe-052','europe-053','europe-054','europe-055','europe-056','europe-057','europe-058','europe-059',
    'europe-060','europe-061','europe-062','europe-063','europe-064','europe-065','europe-066','europe-067','europe-068','europe-069',
    'europe-070','europe-071','europe-072','europe-073','europe-074','europe-075','europe-076','europe-077','europe-078','europe-079',
    'europe-080','europe-081','europe-082',
    'korea-090','korea-091','korea-094','korea-095','korea-099','korea-104','korea-106','korea-110','korea-116','korea-117','korea-119','korea-129',
    'korea-137','korea-139','korea-142','korea-145','korea-146','korea-147','korea-148','korea-152',
    'korea-112', 'korea-125', 'korea-126', 'korea-127', 'korea-128', 'korea-144',
    'korea-092', 'korea-093', 'korea-096', 'korea-097', 'korea-105', 'korea-143',
    'bar-179','bar-180','bar-181','bar-182','bar-183','bar-184',
    'tg-lem-01', 'tg-lem-02', 'tg-lem-03', 'tg-lem-04', 'tg-lem-05', 'tg-lem-06', 'tg-lem-07', 'tg-lem-08', 'tg-lem-09', 'tg-lem-10'
  ]);
  S.sections = M.sections;
  S.secLabel = (menu, sec) => { const s = M.sections[menu].find(x => x.id === sec); return s ? (s[S.lang] || s.ru) : sec; };
  S.iName = it => it.name[S.lang] || it.name.ru;
  S.iNote = it => { if (!it.note) return ''; const v = it.note[S.lang]; if (!v && S.lang !== 'ru') S.missing.add(S.lang + ':note:' + it.id); return v || it.note.ru; };
  S.iSize = it => it.size ? it.size.replace('гр', S.lang === 'ru' ? 'г' : 'g').replace(/^(\d)\.(\d)$/, '$1,$2 ' + (S.lang === 'ru' ? 'л' : 'l')) : '';
  S.iPrice = it => it.priceAlt ? `${S.num(it.price)} / ${S.money(it.priceAlt)}` : S.money(it.price);

  /* ── cart (Phase 2 preview) ───────────────────────── */
  S.isStopped = it => !!(S.stoplist && it && (S.stoplist.has(String(it.name?.ru || it.name || '').toLowerCase().trim()) || S.stoplist.has(String(it.id || '').toLowerCase().trim())));
  S.canOrder = it => !!(S.tweaks.ordering && it && it.menu !== 'bar' && !S.isStopped(it));
  S.cartCount = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
  S.cartTotal = () => Object.entries(S.cart).reduce((a, [id, q]) => a + (S.byId[id] ? S.byId[id].price * q : 0), 0);
  S.setQty = (id, q) => { if (q <= 0) delete S.cart[id]; else S.cart[id] = q; localStorage.setItem('fx.cart', JSON.stringify(S.cart)); document.dispatchEvent(new CustomEvent('fx:cart')); };

  /* ── toast ── */
  S.toast = msg => { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(S._tt); S._tt = setTimeout(() => el.classList.remove('show'), 1800); };

  /* ── analytics stub (brief §7.7) ── */
  S.track = (ev, data) => { (window.fxEvents = window.fxEvents || []).push({ ev, data, t: Date.now() }); };
})();
