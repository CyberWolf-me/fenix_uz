/* Fenix prototype — page templates. All copy comes from i18n/facts/menu data. */
(function () {
  const S = window.FX, F = window.FENIX_FACTS, t = S.t, tx = S.tx, e = S.esc, I = S.icon;
  const L = () => S.lang;
  const V = (ru, uz, en, cat, w = 800, h = 600) => ({ ru, uz, en, cat, w, h });
  const IMG = {
    'hall-wide': V('Основной зал', 'Asosiy zal', 'The main hall', 'rooms'),
    'banquet': V('Банкетная рассадка', 'Banket stollari', 'Banquet seating', 'rooms'),
    'stage': V('Сцена и танцпол', 'Sahna va raqs maydoni', 'Stage and dance floor', 'rooms'),
    'lounge': V('Диваны у окон', 'Deraza yonidagi divanlar', 'Sofas by the windows', 'rooms'),
    'banquet-2': V('Зал к празднику', 'Bayramga tayyor zal', 'The hall set for a celebration', 'rooms'),
    'hall-orange': V('Зал с оранжевыми креслами', 'Toʻq sariq kreslolar bilan zal', 'Hall with orange chairs', 'rooms'),
    'curtains': V('Столы у штор', 'Pardalar yonidagi stollar', 'Tables by the curtains', 'rooms'),
    'hall-long': V('Длинные столы', 'Uzun stollar', 'Long tables', 'rooms'),
    'chairs': V('Сервировка', 'Dasturxon', 'Table setting', 'rooms'),
    'stage-2': V('Сцена с логотипом', 'Logotipli sahna', 'Stage with the logo', 'rooms'),
    'sofas-2': V('Диваны и столы', 'Divanlar va stollar', 'Sofas and tables', 'rooms'),
    'entrance': V('Вход вечером', 'Kechki kirish', 'The entrance at night', 'rooms'),
    'hall-3': V('Зал под вечер', 'Kechki zal', 'The hall in the evening', 'rooms'),
    'sign-hall': V('Вывеска Fenix над залом', 'Zal ustidagi Fenix yozuvi', 'The Fenix sign above the hall', 'rooms', 720, 1200),
    'hall-red': V('Зал с красными креслами', 'Qizil kreslolar bilan zal', 'Hall with red chairs', 'rooms', 720, 1200),
    'hall-green': V('Живая зелень в зале', 'Zaldagi jonli koʻkatlar', 'Living greenery in the hall', 'rooms', 720, 1200),
    'table': V('Сервированный стол', 'Bezatilgan stol', 'A laid table', 'rooms', 720, 1200),
    'wall-logo': V('Стена с логотипом', 'Logotipli devor', 'The logo wall', 'rooms', 720, 1200),
    'facade-night': V('Фасад вечером', 'Kechki fasad', 'The façade at night', 'rooms'),
    'singer': V('Живой вокал', 'Jonli vokal', 'Live vocals', 'music', 720, 1200),
    'dj': V('DJ-сет', 'DJ-set', 'DJ set', 'music', 720, 1200),
    'dance': V('Танцпол', 'Raqs maydoni', 'Dance floor', 'music', 720, 1200),
    'bar-glow': V('Бар', 'Bar', 'The bar', 'bar', 720, 1200),
    'bottles': V('Барная полка', 'Bar javoni', 'Back bar', 'bar', 720, 1200),
    'beer-set': V('Пивной сет', 'Pivo seti', 'Beer set', 'bar', 451, 800),
    'hero-bg': V('Fenix Restaurant & Bar', 'Fenix Restaurant & Bar', 'Fenix Restaurant & Bar', 'rooms', 1864, 844)
  };
  /* dish photos (owner-supplied, t.me/realfeniximages) are added to the gallery as "food" */
  S.DISH_PHOTOS.forEach(id => { const it = S.byId[id]; if (it) IMG['dish/' + id] = { ru: it.name.ru, uz: it.name.uz, en: it.name.en, cat: 'food', w: 560, h: 560 }; });
  S.IMG = IMG;
  const img = (k, cls = '', eager = false) => `<img src="img/${k}.webp" width="${IMG[k].w}" height="${IMG[k].h}" alt="${e(IMG[k][L()])}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" class="${cls}">`;
  const eyebrow = (key, rule = true) => `<p class="eyebrow">${rule ? '<span class="rule"></span>' : ''}${e(t(key))}</p>`;
  const telLinks = (cls = '') => F.phones.map(p => `<a class="${cls}" href="${p.href}" data-track="call">${I('phone')}<span>${p.display}</span></a>`).join('');
  const pageHead = (kickerKey, titleKey, ledeKey, extra = '') => `
    <header class="page-head"><div class="wrap">${eyebrow(kickerKey)}<h1 class="h1">${tx(titleKey)}</h1>${ledeKey ? `<p class="lede">${tx(ledeKey)}</p>` : ''}${extra}</div></header>`;

  /* ── shell ── */
  S.renderHeader = (route) => {
    const nav = ['home', 'menu', 'events', 'gallery', 'contact'];
    const href = k => k === 'home' ? '#/' : '#/' + k;
    const cur = k => (route === k ? ' aria-current="page"' : '');
    const showCart = S.tweaks.ordering;
    return `
    <div class="hdr-in">
      <a class="logo" href="#/" aria-label="Fenix — ${e(t('nav.home'))}">${S.logos.lockup || ''}</a>
      <nav class="nav" aria-label="Main">${nav.map(k => `<a href="${href(k)}"${cur(k)}>${e(t('nav.' + k))}</a>`).join('')}</nav>
      <div class="hdr-tools">
        <div class="lang" role="group" aria-label="${e(t('a11y.lang'))}">${['ru', 'uz', 'en'].map(l => `<button type="button" data-lang="${l}" aria-pressed="${l === L()}" lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>
        <a class="icon-btn" href="${F.phones[0].href}" aria-label="${e(t('nav.call'))} ${F.phones[0].display}" data-track="call">${I('phone')}</a>
        ${showCart ? `<button class="icon-btn" type="button" data-open-cart aria-label="${e(t('a11y.cart'))}">${I('bag')}${S.cartCount() ? `<span class="badge">${S.cartCount()}</span>` : ''}</button>` : ''}
        <a class="btn btn-accent reserve" href="#/reserve" data-track="reserve">${e(t('nav.reserve'))}${I('arrow')}</a>
        <button class="icon-btn burger" type="button" data-drawer="open" aria-expanded="false" aria-controls="drawer" aria-label="${e(t('a11y.menu'))}">${I('menu')}</button>
      </div>
    </div>`;
  };
  S.renderDrawer = (route) => {
    const nav = ['home', 'menu', 'events', 'gallery', 'contact'];
    return `
    <div class="drawer-top"><a class="logo" href="#/" aria-label="Fenix">${S.logos.lockup || ''}</a>
      <button class="icon-btn" type="button" data-drawer="close" aria-label="${e(t('a11y.close'))}">${I('close')}</button></div>
    <nav aria-label="Mobile">${nav.map(k => `<a href="${k === 'home' ? '#/' : '#/' + k}"${route === k ? ' aria-current="page"' : ''}>${e(t('nav.' + k))}${I('arrow')}</a>`).join('')}</nav>
    <div class="foot">
      <p class="small">${S.statusHTML()}</p>
      <a class="btn btn-accent btn-block" href="#/reserve">${e(t('nav.reserve'))}${I('arrow')}</a>
      ${F.phones.map(p => `<a class="btn btn-line btn-block" href="${p.href}">${p.display}${I('phone')}</a>`).join('')}
    </div>`;
  };
  S.renderActbar = () => `
    <a href="${F.phones[0].href}" data-track="call">${I('phone')}<span>${e(t('nav.call'))}</span></a>
    <a href="#/menu">${I('book')}<span>${e(t('nav.menu'))}</span></a>
    <a class="primary" href="#/reserve" data-track="reserve">${I('cal')}<span>${e(t('nav.reserve'))}</span></a>`;
  S.renderFooter = () => `
    <div class="wrap">
      <div class="ftr-grid">
        <div><p class="label">${e(t('footer.find'))}</p><p><a class="link" style="border:0;color:var(--text-dim)" href="${F.maps.yandex}" target="_blank" rel="noopener" data-track="directions">${e(F.address[L()])}<span class="sr-only"> (${e(t('a11y.newTab'))})</span></a></p></div>
        <div><p class="label">${e(t('footer.call'))}</p><ul>${F.phones.map(p => `<li><a href="${p.href}" data-track="call">${p.display}</a></li>`).join('')}</ul></div>
        <div><p class="label">${e(t('footer.hours'))}${S.dot(F.hours.status)}</p><p>${S.hoursCompact()}</p></div>
        <div><p class="label">${e(t('footer.follow'))}</p><ul><li><a href="${F.telegram.href}" target="_blank" rel="noopener">Telegram · ${F.telegram.display}</a></li><li><a href="${F.bot ? F.bot.href : 'https://t.me/FenixRestaurantBot'}" target="_blank" rel="noopener">Telegram Bot · @FenixRestaurantBot</a></li><li><a href="${F.instagram.href}" target="_blank" rel="noopener">Instagram · ${F.instagram.display}</a></li><li><a href="#/privacy">${e(t('nav.privacy'))}</a></li></ul></div>
      </div>
      <div class="ftr-word">${S.logos.wordmark || ''}</div>
      <div class="ftr-bar"><span>${e(t('footer.rights'))}</span><span>${e(t('footer.city'))}</span></div>
    </div>`;

  /* ── home sections ── */
  const SIGS = ['europe-043', 'korea-129', 'korea-142', 'europe-025', 'korea-146', 'europe-059'];
  const H = {};
  H.hero = () => {
    const v = S.tweaks.hero || 'single';
    const wm = S.tweaks.wordmark === 'serif'
      ? `<span class="wordmark" aria-hidden="true">FENI<em>X</em></span>`
      : `<span class="wordmark-logo" aria-hidden="true" style="display:block;width:min(720px,88vw);color:var(--ink)">${S.logos.wordmark || ''}</span>`;
    return `
    <section class="hero" data-variant="${v}" data-screen-label="Home · hero">
      <div class="hero-media hero-single" aria-hidden="true"><figure>${img('hero-bg', '', true)}</figure></div>
      <div class="halo halo1" aria-hidden="true"></div><div class="halo halo2" aria-hidden="true"></div>
      <div class="hero-in">
        <div class="hero-mid">
          <h1><span class="sr-only">${e(t('meta.title'))}</span>${wm}</h1>
          <div class="hero-copy">
            ${eyebrow('hero.eyebrow')}
            <p class="lede">${tx('hero.lede')}</p>
            <div class="hero-ctas">
              <a class="btn btn-solid btn-block" href="#/reserve" data-track="reserve">${e(t('hero.reserve'))}${I('arrow')}</a>
              <a class="btn btn-line btn-block" href="#/menu">${e(t('hero.menu'))}${I('arrow')}</a>
            </div>
          </div>
        </div>
        <div class="hero-foot">
          <div><b>${S.statusHTML()}</b>${S.hoursCompact()}${S.dot(F.hours.status)}</div>
          <div><b>${e(t('hero.music'))}</b>${e(t('hero.musicVal'))}${S.dot(F.hours.music.status)}</div>
          <div><b>${e(t('hero.where'))}</b><a href="${F.maps.yandex}" target="_blank" rel="noopener" data-track="directions">${e(F.address[L()])}</a></div>
        </div>
      </div>
    </section>`;
  };
  H.facts = () => `
    <div class="wrap" data-screen-label="Home · facts"><div class="facts">
      ${[['kitchen', 'verified'], ['halls', 'verified'], ['music', 'draft']].map(([k, st]) => `<div><p class="label">${e(t('facts.' + k))}</p><p class="v">${e(t('facts.' + k + 'Val'))}${S.dot(st)}</p></div>`).join('')}
    </div></div>`;
  H.about = () => `
    <section class="sect" id="about" data-screen-label="Home · about"><div class="wrap about">
      <div>
        ${eyebrow('about.kicker')}
        <h2 class="h2" style="margin:20px 0 28px">${tx('about.title')}</h2>
        <div class="cols"><p class="body">${tx('about.p1')}</p><p class="body">${tx('about.p2')}</p><p class="body">${tx('about.p3')}</p></div>
        <div class="sig"><span class="ln"></span><span class="ital" style="font-size:22px">${e(t('about.sig'))}</span></div>
      </div>
      <div class="about-pair"><div class="shot about-main">${img('stage-2')}<div class="cap"><span>${e(IMG['stage-2'][L()])}</span><span>01</span></div></div><div class="shot about-inset">${img('hall-green')}</div></div>
    </div></section>`;
  H.sign = () => `
    <section class="sect" data-screen-label="Home · signatures"><div class="wrap sign">
      <div class="shot sign-img dish-stage" id="sig-photo"><img src="img/dish/${SIGS[0]}.webp" width="560" height="560" alt="${e(S.iName(S.byId[SIGS[0]]))}" loading="lazy"><div class="cap"><span id="sig-cap">${e(S.iName(S.byId[SIGS[0]]))}</span><span id="sig-n">01</span></div></div>
      <div>
        ${eyebrow('sign.kicker')}
        <h2 class="h2" style="margin:20px 0 10px">${tx('sign.title')}</h2>
        <div style="height:28px"></div>
        <ol>${SIGS.map((id, i) => { const it = S.byId[id]; return `<li class="sig-row${i === 0 ? ' on' : ''}" tabindex="0" data-sig="${id}" data-n="${String(i + 1).padStart(2, '0')}"><span class="i">${String(i + 1).padStart(2, '0')}</span><div><p class="n">${e(S.iName(it))}</p><p class="sub">${e(t('menu.tabs.' + it.menu))} · ${e(S.secLabel(it.menu, it.section))}</p></div><span class="price">${S.money(it.price)}</span></li>`; }).join('')}</ol>
        <a class="btn btn-line" style="margin-top:28px" href="#/menu">${e(t('sign.all'))}${I('arrow')}</a>
      </div>
    </div></section>`;
  H.room = () => `
    <section class="band" data-screen-label="Home · halls">
      <div class="band-media" aria-hidden="true">${img('hall-long')}${img('entrance')}</div>
      <p class="label tag">${e(t('room.tag'))}</p>
      <div class="band-in">
        ${eyebrow('room.kicker')}
        <h2 class="h2">${tx('room.title')}</h2>
        <p class="lede" style="max-width:520px">${tx('room.body')}</p>
        <div><a class="btn btn-solid" href="#/events">${e(t('room.cta'))}${I('arrow')}</a></div>
      </div>
    </section>`;
  H.tiles = () => `
    <section class="sect" data-screen-label="Home · evenings"><div class="wrap">
      ${eyebrow('tiles.kicker')}
      <div class="tiles" style="margin-top:32px">
        ${[['singer', 'a'], ['dj', 'b'], ['bottles', 'c']].map(([k, x]) => `<article class="tile"><div class="shot">${img(k)}</div><h3 class="h3">${e(t('tiles.' + x))}</h3>${x === 'b' ? '' : `<p class="small">${tx('tiles.' + x + 'T')}</p>`}</article>`).join('')}
      </div>
    </div></section>`;
  H.night = () => `
    <section class="sect raised" data-screen-label="Home · hours"><div class="wrap night">
      <div>${eyebrow('night.kicker')}<h2 class="h2" style="margin-top:20px">${tx('night.title')}</h2><p class="body" style="margin-top:20px">${e(t('night.music'))}${S.dot('draft')}</p><p style="margin-top:20px">${S.statusHTML()}</p></div>
      <ul aria-label="${e(t('night.kicker'))}">${S.hoursRows()}</ul>
    </div></section>`;
  H.reserve = () => `
    <section class="sect" id="reserve" data-screen-label="Home · reserve"><div class="wrap reserve-grid">
      <div>
        ${eyebrow('res.kicker')}
        <h2 class="h2" style="margin:20px 0 24px">${tx('res.title')}</h2>
        <p class="body" style="max-width:440px">${tx('res.body')}</p>
        <p class="label" style="margin-top:36px">${e(t('res.or'))}</p>
        <div class="contact-lines">${telLinks()}</div>
      </div>
      <div data-form="reserve"></div>
    </div></section>`;
  const ORDER = {
    dining: ['hero', 'facts', 'about', 'sign', 'room', 'tiles', 'night', 'reserve'],
    events: ['hero', 'facts', 'room', 'about', 'tiles', 'sign', 'night', 'reserve']
  };
  S.pages = {};
  S.pages.home = () => (ORDER[S.tweaks.homeOrder] || ORDER.dining).map(k => H[k]()).join('');

  /* ── menu page ── */
  S.pages.menu = (p) => {
    const menu = ['europe', 'korea', 'bar'].includes(p[0]) ? p[0] : 'europe';
    const secs = S.sections[menu];
    const count = S.items.filter(i => i.menu === menu).length;
    return `
    <div data-screen-label="Menu">
      ${pageHead('nav.menu', 'menu.title', 'menu.lede', `<div class="menu-tabs" role="tablist">${['europe', 'korea', 'bar'].map(m => `<button role="tab" type="button" aria-selected="${m === menu}" data-menu-tab="${m}">${e(t('menu.tabs.' + m))}</button>`).join('')}</div>`)}
      <div class="chipbar"><div class="wrap"><nav class="chipbar-in" aria-label="${e(t('menu.title'))}">
        ${secs.map(s => `<a class="chip" href="#/menu/${menu}/${s.id}" data-chip="${s.id}">${e(s[L()] || s.ru)}</a>`).join('')}
      </nav></div></div>
      <div class="wrap">
        <div class="menu-tools">
          <label class="search">${I('search')}<span class="sr-only">${e(t('menu.search'))}</span><input type="search" id="menu-q" placeholder="${e(t('menu.search'))}" autocomplete="off"></label>
          <p class="small">${count} ${e(t('menu.count'))} · ${e(t('menu.lede').split('. ').pop())}</p>
        </div>
        <div class="menu-cols" id="menu-list" data-menu="${menu}">${S.menuList(menu, '')}</div>
      </div>
    </div>`;
  };
  S.menuList = (menu, q) => {
    q = (q || '').trim().toLowerCase();
    const showAdd = S.tweaks.ordering && menu !== 'bar';
    const html = S.sections[menu].map(s => {
      let items = S.items.filter(i => i.menu === menu && i.section === s.id);
      if (q) items = items.filter(i => Object.values(i.name).some(n => n.toLowerCase().includes(q)));
      if (!items.length) return '';
      // Show items with photos first
      items.sort((a, b) => (S.DISH_PHOTOS.has(b.id) ? 1 : 0) - (S.DISH_PHOTOS.has(a.id) ? 1 : 0));

      return `<section class="mcat" id="m-${menu}-${s.id}" data-sec="${s.id}">
        <div class="mcat-h"><h2>${e(s[L()] || s.ru)}</h2><span>${items.length} ${e(t('menu.items'))}</span></div>
        ${items.map(it => {
          const hasPhoto = S.DISH_PHOTOS.has(it.id);
          const alt = L() !== 'ru' && it.name.ru !== S.iName(it) ? `<p class="alt" lang="ru">${e(it.name.ru)}</p>` : '';
          const tags = [it.tags.includes('preorder') ? `<span class="tag acc">${e(t('menu.preorder'))}</span>` : '', it.tags.includes('seasonal') ? `<span class="tag">${e(t('menu.seasonal'))}</span>` : '', it.source === 'tg' ? '' : ''].join('');
          const size = S.iSize(it);
          const q2 = S.cart[it.id] || 0;
          const ctl = !showAdd ? '' : (q2 ? `<span class="qty"><button type="button" data-qty="${it.id}" data-d="-1" aria-label="−1 ${e(S.iName(it))}">−</button><span aria-live="polite">${q2}</span><button type="button" data-qty="${it.id}" data-d="1" aria-label="+1 ${e(S.iName(it))}">+</button></span>` : `<button class="add" type="button" data-qty="${it.id}" data-d="1" aria-label="${e(t('menu.add'))}: ${e(S.iName(it))}">${I('plus')}</button>`);
          const thumb = hasPhoto ? `<button type="button" class="mi-thumb" data-dish="${it.id}" aria-label="${e(t('menu.photo'))}: ${e(S.iName(it))}"><img src="img/dish/${it.id}.webp" width="60" height="60" alt="" loading="lazy" decoding="async"></button>` : '';
          return `<div class="mi${hasPhoto ? ' has-thumb' : ''}">${thumb}<div><p class="n">${e(S.iName(it))}${tags ? `<span class="tags">${tags}</span>` : ''}</p>${alt}</div><div class="right"><span class="price">${size ? `<span style="color:var(--text-faint)">${e(size)} · </span>` : ''}${S.iPrice(it)}</span>${ctl}</div>${it.note ? `<p class="d">${e(S.iNote(it))}</p>` : ''}</div>`;
        }).join('')}
        ${s.id === 'coffee' || s.id === 'snacks' || (menu === 'bar' && s.id === 'lemonades') ? `<p class="label" style="margin-top:10px">${e(t('menu.srcTg'))}</p>` : ''}
      </section>`;
    }).join('');
    return html || `<p class="empty">${e(t('menu.none'))}</p>`;
  };

  /* ── events ── */
  S.pages.events = () => `
    <div data-screen-label="Events">
      ${pageHead('nav.events', 'events.title', 'events.lede')}
      <section class="sect" style="padding-top:0"><div class="wrap">
        <div class="halls">
          ${[['first', 'hall-orange', 120], ['second', 'hall-wide', 170]].map(([k, im, n]) => `
          <article class="hall"><div class="shot">${img(im)}</div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap"><h2 class="h3">${e(t('events.' + k))}</h2><p class="num">${n}<small>${e(t('events.guests'))}</small></p></div>
            <p class="small">${e(t('events.' + k + 'D'))}</p></article>`).join('')}
        </div>
      </div></section>
      <section class="sect"><div class="wrap">
        ${eyebrow('events.types')}
        <ul class="etypes" style="margin-top:24px">${['wedding', 'anniversary', 'birthday', 'corporate', 'family'].map((k, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${e(t('events.t.' + k))}</li>`).join('')}</ul>
        <p class="body" style="margin-top:24px;max-width:640px">${e(t('events.navruz'))}</p>
      </div></section>
      <section class="sect raised" id="enquiry"><div class="wrap reserve-grid">
        <div>${eyebrow('events.form')}<h2 class="h2" style="margin:20px 0 24px">${tx('events.form')}</h2><p class="label" style="margin-top:24px">${e(t('res.or'))}</p><div class="contact-lines">${telLinks()}</div></div>
        <div data-form="event"></div>
      </div></section>
    </div>`;

  /* ── gallery ── */
  S.pages.gallery = (p) => {
    const cat = ['rooms', 'music', 'bar', 'food'].includes(p[0]) ? p[0] : 'all';
    const keys = Object.keys(IMG).filter(k => cat === 'all' || IMG[k].cat === cat);
    S.galKeys = keys;
    return `
    <div data-screen-label="Gallery">
      ${pageHead('nav.gallery', 'gallery.title', 'gallery.lede')}
      <section class="sect" style="padding-top:0"><div class="wrap">
        <div class="gal-filter" role="group">${['all', 'rooms', 'music', 'bar', 'food'].map(c => `<a class="chip" href="#/gallery${c === 'all' ? '' : '/' + c}" aria-current="${c === cat}">${e(t('gallery.' + c))}</a>`).join('')}</div>
        <div class="gal">${keys.map((k, i) => `<button type="button" data-lb="${i}"${IMG[k].cat === 'food' ? ' data-food' : ''} aria-label="${e(IMG[k][L()])}">${img(k)}<span class="cap">${e(IMG[k][L()])}</span></button>`).join('')}</div>
      </div></section>
    </div>`;
  };

  /* ── contact ── */
  S.pages.contact = () => `
    <div data-screen-label="Contact">
      ${pageHead('nav.contact', 'contact.title', 'contact.lede')}
      <section class="sect" style="padding-top:0"><div class="wrap">
        <div class="contact">
          <div><h2 class="h3">${e(t('contact.address'))}</h2><p class="body">${e(F.address[L()])}</p>
            <div class="map-links"><a class="btn btn-line" href="${F.maps.yandex}" target="_blank" rel="noopener" data-track="directions">${e(t('contact.yandex'))}${I('arrow')}</a><a class="btn btn-line" href="${F.maps.google}" target="_blank" rel="noopener" data-track="directions">${e(t('contact.google'))}${I('arrow')}</a></div></div>
          <div><h2 class="h3">${e(t('contact.phones'))}</h2><p class="label">${e(t('contact.phonesNote'))}</p><div class="contact-lines" style="margin-top:8px">${telLinks()}</div>
            <h2 class="h3" style="margin-top:28px">${e(t('contact.social'))}</h2><p class="body"><a class="link" href="${F.telegram.href}" target="_blank" rel="noopener">Telegram</a> · <a class="link" href="${F.instagram.href}" target="_blank" rel="noopener">Instagram</a></p></div>
          <div><h2 class="h3">${e(t('contact.hours'))}${S.dot(F.hours.status)}</h2><p style="margin-bottom:8px">${S.statusHTML()}</p><ul>${S.hoursRows()}</ul></div>
        </div>
        <a class="map-card" style="margin-top:56px" href="${F.maps.yandex}" target="_blank" rel="noopener" data-track="directions" aria-label="${e(t('contact.route'))} — ${e(t('contact.yandex'))}">
          <span class="pin">${I('pin')}<span class="h3">Fenix</span><span class="small">${e(F.address[L()])}</span><span class="link">${e(t('contact.route'))}</span></span>
        </a>
      </div></section>
      ${H.reserve()}
    </div>`;

  /* ── reserve-focused page (deep link target for every Reserve button) ── */
  S.pages.reserve = () => `<div data-screen-label="Reserve"><div style="height:var(--header-h)"></div>${H.reserve()}${H.night()}</div>`;

  /* ── privacy ── */
  S.pages.privacy = () => `
    <div data-screen-label="Privacy">${pageHead('nav.privacy', 'legal.title', null)}
      <section class="sect" style="padding-top:0"><div class="wrap prose"><p class="body">${e(t('legal.p1'))}</p><p class="body">${e(t('legal.p2'))}</p></div></section></div>`;
})();
