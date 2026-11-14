/* Fenix prototype — reservation + event forms (brief §7.1, §7.2). Validate, all 5 states, keep data on failure. */
(function () {
  const S = window.FX, F = window.FENIX_FACTS, t = S.t, e = S.esc, I = S.icon;
  const store = { reserve: JSON.parse(sessionStorage.getItem('fx.f.reserve') || '{}'), event: JSON.parse(sessionStorage.getItem('fx.f.event') || '{}') };
  const status = { reserve: 'idle', event: 'idle' };
  const save = k => sessionStorage.setItem('fx.f.' + k, JSON.stringify(store[k]));

  const today = () => S.isoDate(S.tashNow());
  const plusDays = n => { const d = S.tashNow(); d.setDate(d.getDate() + n); return S.isoDate(d); };

  function field(id, label, control, err, hint) {
    return `<div class="field${err ? ' err' : ''}" data-f="${id}">${label}${control}${hint ? `<p class="hint" id="${id}-hint">${hint}</p>` : ''}${err ? `<p class="msg" id="${id}-err">${e(err)}</p>` : ''}</div>`;
  }
  const aria = (id, err, hint) => `aria-invalid="${!!err}"${err || hint ? ` aria-describedby="${[err ? id + '-err' : '', hint ? id + '-hint' : ''].filter(Boolean).join(' ')}"` : ''}`;
  const phoneFmt = d => { d = d.replace(/\D/g, '').slice(0, 9); return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' '); };

  function validate(kind, v) {
    const er = {};
    if (!v.name || !v.name.trim()) er.name = t('err.required');
    if ((v.phone || '').replace(/\D/g, '').length !== 9) er.phone = t('err.phone');
    if (!v.consent) er.consent = t('err.consent');
    if (kind === 'reserve') {
      if (!v.date || v.date < today() || v.date > plusDays(60)) er.date = t('err.date');
      else if (!v.time || !S.slotsFor(v.date).some(s => s.value === v.time)) er.time = t('err.time');
      const g = +v.guests; if (!(g >= 1 && g <= 12)) er.guests = t('err.guests');
    } else {
      if (!v.type) er.type = t('err.required');
      if (!(+v.guests >= 1)) er.guests = t('err.required');
    }
    return er;
  }

  function renderReserve(host, errs = {}) {
    const v = store.reserve;
    if (!v.date) v.date = today();
    if (!v.guests) v.guests = 2;
    const slots = S.slotsFor(v.date);
    if (v.time && !slots.some(s => s.value === v.time)) v.time = '';
    if (status.reserve === 'success') return host.innerHTML = success('reserve');
    const busy = status.reserve === 'submitting';
    const errCount = Object.keys(errs).length;
    host.innerHTML = `
    <form class="form" novalidate data-kind="reserve" aria-labelledby="res-h">
      <h3 id="res-h" class="sr-only">${e(t('res.title'))}</h3>
      ${status.reserve === 'error' ? failure() : ''}
      ${errCount ? `<p class="full msg" role="alert" style="color:var(--danger)">${e(t('err.summary'))} (${errCount})</p>` : ''}
      ${field('r-date', `<label for="r-date">${e(t('res.date'))}</label>`, `<input id="r-date" name="date" type="date" min="${today()}" max="${plusDays(60)}" value="${v.date}" required ${aria('r-date', errs.date)}>`, errs.date)}
      ${field('r-time', `<label for="r-time">${e(t('res.time'))}</label>`, slots.length ? `<select id="r-time" name="time" required ${aria('r-time', errs.time)}><option value="">—</option>${slots.map(s => `<option value="${s.value}"${s.value === v.time ? ' selected' : ''}>${s.label}</option>`).join('')}</select>` : `<p class="hint" style="padding:14px 0">${e(t('res.noSlots'))}</p>`, errs.time)}
      <div class="field full${errs.guests ? ' err' : ''}" data-f="r-guests">
        <span class="lbl" id="r-guests-l">${e(t('res.guests'))}</span>
        <div class="chips-input" role="group" aria-labelledby="r-guests-l">${[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => `<button type="button" data-guests="${n}" aria-pressed="${+v.guests === n}">${n}</button>`).join('')}</div>
        <p class="hint">${e(t('res.bigGroup'))}<a class="link" href="#/events">${e(t('res.bigGroupLink'))}</a></p>
        ${errs.guests ? `<p class="msg">${e(errs.guests)}</p>` : ''}
      </div>
      ${field('r-name', `<label for="r-name">${e(t('res.name'))}</label>`, `<input id="r-name" name="name" type="text" autocomplete="name" value="${e(v.name || '')}" required ${aria('r-name', errs.name)}>`, errs.name)}
      ${field('r-phone', `<label for="r-phone">${e(t('res.phone'))}</label>`, `<div class="phone"><span aria-hidden="true">+998</span><input id="r-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="90 123 45 67" value="${e(v.phone || '')}" required ${aria('r-phone', errs.phone)}></div>`, errs.phone)}
      ${field('r-comment', `<label for="r-comment">${e(t('res.comment'))}</label>`, `<textarea id="r-comment" name="comment" rows="2" placeholder="${e(t('res.commentPh'))}">${e(v.comment || '')}</textarea>`, null)}
      <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      ${consent('r', v, errs)}
      <div class="full"><button class="btn btn-solid btn-block" type="submit" ${busy ? 'disabled aria-busy="true"' : ''}>${busy ? `<span>${e(t('res.sending'))}</span><span class="spinner"></span>` : `<span>${e(t('res.submit'))}</span>${I('arrow')}`}</button>
        <p class="form-note" style="margin-top:12px">${e(t('res.proto'))}</p></div>
    </form>`;
  }

  function renderEvent(host, errs = {}) {
    const v = store.event;
    if (status.event === 'success') return host.innerHTML = success('event');
    const busy = status.event === 'submitting';
    const types = ['wedding', 'anniversary', 'birthday', 'corporate', 'family', 'other'];
    host.innerHTML = `
    <form class="form" novalidate data-kind="event">
      ${status.event === 'error' ? failure() : ''}
      ${Object.keys(errs).length ? `<p class="full msg" role="alert" style="color:var(--danger)">${e(t('err.summary'))}</p>` : ''}
      <div class="field full${errs.type ? ' err' : ''}"><span class="lbl" id="e-type-l">${e(t('events.type'))}</span>
        <div class="chips-input" role="group" aria-labelledby="e-type-l">${types.map(k => `<button type="button" data-etype="${k}" aria-pressed="${v.type === k}">${e(t('events.t.' + k))}</button>`).join('')}</div>${errs.type ? `<p class="msg">${e(errs.type)}</p>` : ''}</div>
      ${field('e-guests', `<label for="e-guests">${e(t('events.approxGuests'))}</label>`, `<input id="e-guests" name="guests" type="number" inputmode="numeric" min="1" max="300" value="${e(v.guests || '')}" ${aria('e-guests', errs.guests)}>`, errs.guests)}
      ${field('e-date', `<label for="e-date">${e(t('events.approxDate'))}</label>`, `<input id="e-date" name="date" type="date" min="${today()}" value="${e(v.date || '')}">`, null)}
      ${field('e-hall', `<label for="e-hall">${e(t('events.hall'))}</label>`, `<select id="e-hall" name="hall">${[['any', t('events.hallAny')], ['first', t('events.first') + ' · 120'], ['second', t('events.second') + ' · 170']].map(([k, l]) => `<option value="${k}"${v.hall === k ? ' selected' : ''}>${e(l)}</option>`).join('')}</select>`, null)}
      ${field('e-name', `<label for="e-name">${e(t('res.name'))}</label>`, `<input id="e-name" name="name" autocomplete="name" value="${e(v.name || '')}" ${aria('e-name', errs.name)}>`, errs.name)}
      ${field('e-phone', `<label for="e-phone">${e(t('res.phone'))}</label>`, `<div class="phone"><span aria-hidden="true">+998</span><input id="e-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="90 123 45 67" value="${e(v.phone || '')}" ${aria('e-phone', errs.phone)}></div>`, errs.phone)}
      ${field('e-comment', `<label for="e-comment">${e(t('res.comment'))}</label>`, `<textarea id="e-comment" name="comment" rows="2">${e(v.comment || '')}</textarea>`, null)}
      <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      ${consent('e', v, errs)}
      <div class="full"><button class="btn btn-solid btn-block" type="submit" ${busy ? 'disabled aria-busy="true"' : ''}>${busy ? `<span>${e(t('res.sending'))}</span><span class="spinner"></span>` : `<span>${e(t('events.submit'))}</span>${I('arrow')}`}</button>
        <p class="form-note" style="margin-top:12px">${e(t('res.proto'))}</p></div>
    </form>`;
  }

  const consent = (p, v, errs) => `<div class="field full${errs.consent ? ' err' : ''}"><label class="check"><input type="checkbox" name="consent" ${v.consent ? 'checked' : ''} ${aria(p + '-consent', errs.consent)} id="${p}-consent"><span>${e(t('res.consent'))} <a class="link" href="#/privacy">${e(t('res.consentLink'))}</a></span></label>${errs.consent ? `<p class="msg" id="${p}-consent-err">${e(errs.consent)}</p>` : ''}</div>`;
  const failure = () => `<div class="notice bad full" role="alert"><span class="ic">${I('bang')}</span><h3>${e(t('res.failTitle'))}</h3><p class="body">${e(t('res.failBody'))}</p><div class="contact-lines" style="margin:0">${F.phones.map(p => `<a href="${p.href}">${I('phone')}<span>${p.display}</span></a>`).join('')}</div></div>`;
  function success(kind) {
    const v = store[kind];
    const lines = kind === 'reserve'
      ? `${e(v.name)} · ${v.date} · ${v.time} · ${v.guests} ${e(t('res.guests').toLowerCase())}`
      : `${e(t('events.t.' + v.type))} · ${e(v.guests)} ${e(t('events.guests'))}${v.date ? ' · ' + v.date : ''}`;
    return `<div class="notice ok" role="status" tabindex="-1" data-focus><span class="ic">${I('check')}</span>
      <h3>${e(t(kind === 'reserve' ? 'res.okTitle' : 'events.okTitle'))}</h3>
      <p class="lede">${lines}<br><span class="small">+998 ${e(v.phone)}</span></p>
      <p class="body">${e(t(kind === 'reserve' ? 'res.okBody' : 'events.okBody'))}${S.fx(t('res.okWindow'))}.</p>
      <div><button type="button" class="btn btn-line" data-again="${kind}">${e(t('res.okAgain'))}${I('arrow')}</button></div></div>`;
  }

  /* ── mount & events (delegated) ── */
  S.mountForms = () => {
    document.querySelectorAll('[data-form="reserve"]').forEach(h => renderReserve(h));
    document.querySelectorAll('[data-form="event"]').forEach(h => renderEvent(h));
  };
  const rerender = (kind, errs, focusSel) => {
    document.querySelectorAll(`[data-form="${kind}"]`).forEach(h => (kind === 'reserve' ? renderReserve : renderEvent)(h, errs));
    if (focusSel) { const el = document.querySelector(focusSel); if (el) el.focus({ preventScroll: false }); }
  };

  document.addEventListener('input', ev => {
    const f = ev.target.closest('form[data-kind]'); if (!f) return;
    const kind = f.dataset.kind, el = ev.target;
    if (!el.name || el.name === 'website') return;
    if (el.name === 'phone') { const pos = el.value.length; el.value = phoneFmt(el.value); }
    store[kind][el.name] = el.type === 'checkbox' ? el.checked : el.value;
    save(kind);
    if (status[kind] === 'idle' && !S._started) { S._started = 1; S.track('form_start', kind); }
  });
  document.addEventListener('change', ev => {
    const f = ev.target.closest('form[data-kind="reserve"]');
    if (f && ev.target.name === 'date') { store.reserve.date = ev.target.value; save('reserve'); rerender('reserve', {}, '#r-date'); }
    const fc = ev.target.closest('form[data-kind]');
    if (fc && ev.target.name === 'consent') { store[fc.dataset.kind].consent = ev.target.checked; save(fc.dataset.kind); }
  });
  document.addEventListener('click', ev => {
    const g = ev.target.closest('[data-guests]');
    if (g) { store.reserve.guests = +g.dataset.guests; save('reserve'); rerender('reserve', {}, `[data-guests="${g.dataset.guests}"]`); return; }
    const et = ev.target.closest('[data-etype]');
    if (et) { store.event.type = et.dataset.etype; save('event'); rerender('event', {}, `[data-etype="${et.dataset.etype}"]`); return; }
    const ag = ev.target.closest('[data-again]');
    if (ag) { const k = ag.dataset.again; status[k] = 'idle'; const keep = { name: store[k].name, phone: store[k].phone }; store[k] = keep; save(k); rerender(k); }
  });
  document.addEventListener('submit', ev => {
    const f = ev.target.closest('form[data-kind]'); if (!f) return;
    ev.preventDefault();
    const kind = f.dataset.kind;
    if (f.website && f.website.value) return; /* honeypot */
    const v = store[kind];
    const errs = validate(kind, v);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      const map = { date: '#r-date', time: '#r-time', guests: kind === 'reserve' ? '[data-guests]' : '#e-guests', name: kind === 'reserve' ? '#r-name' : '#e-name', phone: kind === 'reserve' ? '#r-phone' : '#e-phone', consent: kind === 'reserve' ? '#r-consent' : '#e-consent', type: '[data-etype]' };
      rerender(kind, errs, map[first]);
      return;
    }
    status[kind] = 'submitting'; rerender(kind);

    const endpoint = kind === 'reserve' ? '/api/reservations' : '/api/events';
    const payload = {
      name: v.name,
      phone: '+998' + (v.phone || '').replace(/\D/g, ''),
      date: v.date,
      time: v.time,
      guests: v.guests,
      comment: v.comment,
      hall: v.hall || 'any',
      eventType: v.type || 'Банкет',
      lang: S.lang,
      telegramUserId: S.tgUser ? S.tgUser.id : null,
      telegramUsername: S.tgUser ? (S.tgUser.username || S.tgUser.first_name) : null
    };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'Submission failed');
        status[kind] = 'success';
        S.track('form_complete', kind);
        rerender(kind, {}, '[data-focus]');
      })
      .catch((err) => {
        console.warn('[Fenix API] Submission error:', err);
        status[kind] = 'error';
        rerender(kind);
        const n = document.querySelector('.notice.bad');
        if (n && n.scrollIntoView) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
  });
})();
