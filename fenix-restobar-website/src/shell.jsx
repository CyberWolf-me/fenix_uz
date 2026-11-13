/* ═══════════ app shell: nav, topbar, cmdk ═══════════ */
const NAV = [
  { group: 'grp_ops', items: [
    { id: 'dispatch', icon: 'dpad', k: 'dispatch', badge: 'live' },
    { id: 'bookings', icon: 'calendar', k: 'bookings', badge: 4 },
    { id: 'banquets', icon: 'star', k: 'banquets' },
  ]},
  { group: 'grp_venue', items: [
    { id: 'floor', icon: 'grid', k: 'floor' },
    { id: 'couriers', icon: 'bike', k: 'couriers', badge: 3 },
  ]},
  { group: 'grp_admin', items: [
    { id: 'menu', icon: 'menuBook', k: 'menu' },
    { id: 'staff', icon: 'users', k: 'staff' },
    { id: 'analytics', icon: 'chart', k: 'analytics' },
    { id: 'settings', icon: 'gear', k: 'settings' },
  ]},
];

const PAGE_META = {
  dispatch: { eyebrow: 'FENIX · OPS', icon: 'dpad' },
  bookings: { eyebrow: 'FENIX · OPS', icon: 'calendar' },
  banquets: { eyebrow: 'FENIX · OPS', icon: 'star' },
  floor: { eyebrow: 'FENIX · VENUE', icon: 'grid' },
  couriers: { eyebrow: 'FENIX · VENUE', icon: 'bike' },
  menu: { eyebrow: 'FENIX · ADMIN', icon: 'menuBook' },
  staff: { eyebrow: 'FENIX · ADMIN', icon: 'users' },
  analytics: { eyebrow: 'FENIX · ADMIN', icon: 'chart' },
  settings: { eyebrow: 'FENIX · ADMIN', icon: 'gear' },
};

function Sidebar({ page, setPage, rail, t, counts, onLogout }) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-brand">
        <div className="brand-mark"><Icon name="layers" size={17} stroke={1.7} /></div>
        <div className="brand-txt">
          <div className="brand-name">Fenix</div>
          <div className="brand-sub">Terminal &amp; Dispatch OS</div>
        </div>
      </div>
      <div className="nav-scroll">
        {NAV.map((g) => (
          <div className="nav-group" key={g.group}>
            <div className="nav-group-label">{t(g.group)}</div>
            {g.items.map((it) => {
              const on = page === it.id;
              const b = it.badge === 'live' ? counts.live : it.badge;
              return (
                <button key={it.id} className="nav-item" data-on={on ? '1' : '0'}
                        onClick={() => setPage(it.id)} title={rail ? t(it.k) : undefined}>
                  <Icon name={it.icon} size={16} />
                  <span className="nav-item-txt">{t(it.k)}</span>
                  {b != null && (
                    <span className="nav-badge" data-tone={it.badge === 'live' ? 'accent' : 'muted'}>{b}</span>
                  )}
                  {rail && b != null && <span className="nav-dot" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="nav-foot" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="nav-user" style={{ flex: 1 }}>
          <span className="avatar" data-tone="accent">АШ</span>
          <span className="nav-user-txt">
            <span className="nav-user-name">Алмасов Ш.</span>
            <span className="nav-user-role">Диспетчер · Смена 1</span>
          </span>
        </button>
        {onLogout && (
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onLogout}
            title="Выйти из системы"
            style={{ color: 'var(--text-3)', padding: '8px', cursor: 'pointer' }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <Icon name="logOut" size={16} />
          </button>
        )}
      </div>
    </nav>
  );
}

function Topbar({ page, t, rail, setRail, now, onSearch, theme, setTheme, lang, setLang, onNew, toast, onLogout }) {
  const hh = new Date(now);
  const clock = [hh.getHours(), hh.getMinutes(), hh.getSeconds()]
    .map((x) => String(x).padStart(2, '0')).join(':');
  const meta = PAGE_META[page] || {};
  return (
    <header className="topbar">
      <button className="btn btn-ghost btn-icon" onClick={() => setRail(!rail)} title="Панель">
        <Icon name="panel" size={16} />
      </button>
      <div className="topbar-page">
        <div className="topbar-eyebrow">{meta.eyebrow}</div>
        <h1 className="topbar-title" data-screen-label={t(page)}>{t(page)}</h1>
      </div>

      <div className="topbar-mid">
        <span className="live"><i />{t('live')}</span>
        <span className="clock"><Icon name="clock" size={13} />{t('shift')}: <b>{clock}</b></span>
      </div>

      <div className="topbar-right">
        <button className="btn btn-ghost btn-sm" onClick={onSearch} title={t('search_short')} style={{ gap: 6 }}>
          <Icon name="search" size={14} />
          <span className="kbd">⌘K</span>
        </button>

        <div className="seg" role="group" aria-label={t('theme')}>
          {THEMES.map((th) => (
            <button key={th.id} data-on={theme === th.id ? '1' : '0'} onClick={() => setTheme(th.id)}
                    title={th.label} style={{ padding: '0 7px' }}>
              <span style={{
                width: 9, height: 9, borderRadius: 2, display: 'block',
                background: th.swatch, boxShadow: '0 0 0 1px var(--line)',
              }} />
            </button>
          ))}
        </div>

        <button className="btn btn-ghost btn-sm" onClick={() => setLang(lang === 'ru' ? 'uz' : lang === 'uz' ? 'uzc' : 'ru')}
                title={t('language')}
                style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.04em', padding: '0 6px' }}>
          {lang === 'ru' ? 'RU' : lang === 'uz' ? 'UZ' : 'ЎЗ'}
        </button>

        <button className="btn btn-ghost btn-icon btn-sm" title={t('attention')} onClick={() => toast('6 заказов требуют подтверждения', 'warn', 'alert')}>
          <Icon name="bell" size={15} />
        </button>
        <Btn size="sm" variant="accent" icon="plus" onClick={onNew}>{t('create')}</Btn>
        {onLogout && (
          <button className="btn btn-ghost btn-icon btn-sm" title="Выйти из системы" onClick={onLogout} style={{ color: 'var(--text-3)' }}>
            <Icon name="logOut" size={15} />
          </button>
        )}
      </div>
    </header>
  );
}

function CommandPalette({ t, onClose, go }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const cmds = [
    ...NAV.flatMap((g) => g.items.map((i) => ({ group: t(g.group), label: t(i.k), icon: i.icon, run: () => go(i.id) }))),
    { group: 'Действия', label: 'Принять все новые заказы', icon: 'check', run: () => { go('dispatch'); onClose(); } },
    { group: 'Действия', label: 'Найти заказ #WEB-3307', icon: 'search', run: () => go('dispatch') },
    { group: 'Действия', label: 'Распечатать фискальный чек', icon: 'printer', run: () => go('dispatch') },
  ];
  const filtered = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(filtered.map((c) => c.group))];

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(filtered.length - 1, i + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    if (e.key === 'Enter' && filtered[idx]) { filtered[idx].run(); onClose(); }
  };

  return (
    <Modal onClose={onClose} width={520} className="cmdk-scrim modal cmdk" label="Командная палитра">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 15px', borderBottom: '1px solid var(--line)' }}>
        <Icon name="search" size={15} />
        <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKey}
               placeholder={t('cmdk_ph')}
               style={{ flex: 1, background: 'none', border: 0, outline: 'none', fontSize: 13.5 }} />
        <span className="kbd">Esc</span>
      </div>
      <div className="modal-body" style={{ padding: 9, maxHeight: 330 }}>
        {groups.map((g) => (
          <div key={g}>
            <div className="cmdk-group">{g}</div>
            {filtered.filter((c) => c.group === g).map((c) => {
              const gi = filtered.indexOf(c);
              return (
                <div key={c.label} className="cmdk-row" data-on={gi === idx ? '1' : '0'}
                     onMouseEnter={() => setIdx(gi)}
                     onClick={() => { c.run(); onClose(); }}>
                  <Icon name={c.icon} size={14} />
                  <span>{c.label}</span>
                  {gi === idx && <span className="cmdk-row-hint">↵</span>}
                </div>
              );
            })}
          </div>
        ))}
        {!filtered.length && <div className="empty">Ничего не найдено</div>}
      </div>
      <div className="modal-foot" style={{ fontSize: 10, color: 'var(--text-3)' }}>
        <span className="kbd">↑↓</span> навигация <span className="kbd">↵</span> {t('cmdk_hint')}
      </div>
    </Modal>
  );
}

const THEMES = [
  { id: 'gold', label: 'Тёмное золото', swatch: '#d3aa63' },
  { id: 'graphite', label: 'Графит', swatch: '#78a6dc' },
  { id: 'oxblood', label: 'Оксблад', swatch: '#dd9a72' },
  { id: 'cream', label: 'Крем (день)', swatch: '#9a6f1e' },
];
const DIRECTIONS = [
  { id: 'a', label: 'Смола · luxury', note: 'Серифные цифры, тонкие рамки, много воздуха' },
  { id: 'b', label: 'Медь · hospitality', note: 'Крупный гротеск, скругления, мягкие карточки' },
  { id: 'c', label: 'Консоль · ops', note: 'Моно, жёсткие углы, максимум плотности' },
];

function CreateModal({ t, onClose, onCreatedOrder, onCreatedBooking, toast }) {
  const [tab, setTab] = useState('order');
  const [loading, setLoading] = useState(false);

  const [orderType, setOrderType] = useState('delivery');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [table, setTable] = useState('Стол 1 · Основной зал');
  const [itemsNote, setItemsNote] = useState('');
  const [pay, setPay] = useState('card');
  const [total, setTotal] = useState(150000);

  const [bDate, setBDate] = useState('today');
  const [bTime, setBTime] = useState('19:00');
  const [bGuests, setBGuests] = useState(4);
  const [bZone, setBZone] = useState('Основной зал');

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast('Введите имя клиента', 'warn'); return; }
    if (!phone.trim() || phone.length < 9) { toast('Введите корректный номер телефона', 'warn'); return; }
    setLoading(true);
    try {
      const itemsMap = {};
      if (itemsNote.trim()) {
        itemsNote.split(',').forEach(it => {
          const trimmed = it.trim();
          if (trimmed) itemsMap[trimmed] = 1;
        });
      } else {
        itemsMap['Специальный заказ шефа'] = 1;
      }

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        orderType: orderType === 'delivery' ? 'Доставка курьером (сайт)' : orderType === 'pickup' ? 'Самовывоз (сайт)' : 'Заказ в зале',
        address: orderType === 'delivery' ? (address || 'Адрес доставки') : orderType === 'hall' ? table : 'Самовывоз из ресторана',
        paymentMethod: pay === 'card' ? 'Онлайн / Карта' : 'Наличные',
        items: itemsMap,
        total: Number(total) || 150000,
        comment: 'Создано из FENIX Terminal'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.ok) {
        toast(`Заказ #${data.id || 'WEB-' + data.orderNum} создан!`, 'ok', 'check');
        if (onCreatedOrder) onCreatedOrder(data, payload);
        onClose();
      } else {
        toast('Ошибка создания заказа: ' + (data.error || 'попробуйте снова'), 'danger');
      }
    } catch (err) {
      toast('Сетевая ошибка при создании', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast('Введите имя гостя', 'warn'); return; }
    if (!phone.trim() || phone.length < 9) { toast('Введите корректный номер телефона', 'warn'); return; }
    setLoading(true);
    try {
      const nowD = new Date();
      let resDate = bDate;
      if (bDate === 'today') {
        resDate = nowD.toISOString().slice(0, 10);
      } else if (bDate === 'tomorrow') {
        const tomorrow = new Date(nowD.getTime() + 86400000);
        resDate = tomorrow.toISOString().slice(0, 10);
      }

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        date: resDate,
        time: bTime,
        guests: Number(bGuests) || 2,
        zone: bZone,
        hall: bZone,
        comment: 'Бронь из FENIX Terminal'
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.ok) {
        toast(`Бронь #${data.codeFormatted || 'WEB-' + data.code} оформлена!`, 'ok', 'check');
        if (onCreatedBooking) onCreatedBooking(data, payload);
        onClose();
      } else {
        toast('Ошибка создания брони: ' + (data.error || 'попробуйте снова'), 'danger');
      }
    } catch (err) {
      toast('Сетевая ошибка при создании', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} width={480} label="Создание заявки">
      <div className="modal-head">
        <Icon name="plus" size={16} style={{ color: 'var(--accent)' }} />
        <div className="modal-title grow">Новая заявка · FENIX OS</div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="seg" style={{ width: '100%' }}>
          <button style={{ flex: 1 }} data-on={tab === 'order' ? '1' : '0'} onClick={() => setTab('order')}>
            <Icon name="dpad" size={13} style={{ marginRight: 6 }} />Заказ на кухню
          </button>
          <button style={{ flex: 1 }} data-on={tab === 'booking' ? '1' : '0'} onClick={() => setTab('booking')}>
            <Icon name="calendar" size={13} style={{ marginRight: 6 }} />Бронь стола
          </button>
        </div>

        {tab === 'order' ? (
          <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label">Тип заказа</label>
              <div className="seg" style={{ marginTop: 4, width: '100%' }}>
                <button type="button" style={{ flex: 1 }} data-on={orderType === 'delivery' ? '1' : '0'} onClick={() => setOrderType('delivery')}>Доставка</button>
                <button type="button" style={{ flex: 1 }} data-on={orderType === 'pickup' ? '1' : '0'} onClick={() => setOrderType('pickup')}>Самовывоз</button>
                <button type="button" style={{ flex: 1 }} data-on={orderType === 'hall' ? '1' : '0'} onClick={() => setOrderType('hall')}>В зале</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Имя клиента *</label>
                <input required className="input" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={name} onChange={e => setName(e.target.value)} placeholder="Алмасов Ш." />
              </div>
              <div>
                <label className="label">Телефон *</label>
                <input required className="input mono" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 123 45 67" />
              </div>
            </div>

            {orderType === 'delivery' && (
              <div>
                <label className="label">Адрес доставки</label>
                <input className="input" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={address} onChange={e => setAddress(e.target.value)} placeholder="Юнусабад, 12 квартал, д. 4" />
              </div>
            )}
            {orderType === 'hall' && (
              <div>
                <label className="label">Номер стола / Зал</label>
                <input className="input" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={table} onChange={e => setTable(e.target.value)} placeholder="Стол 7 · Основной зал" />
              </div>
            )}

            <div>
              <label className="label">Позиции меню (через запятую)</label>
              <input className="input" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                     value={itemsNote} onChange={e => setItemsNote(e.target.value)} placeholder="Плов «Феникс», Салат Ачичук, Чай" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Оплата</label>
                <select style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                        value={pay} onChange={e => setPay(e.target.value)}>
                  <option value="card">Карта / Онлайн</option>
                  <option value="cash">Наличные</option>
                </select>
              </div>
              <div>
                <label className="label">Сумма (сум)</label>
                <input type="number" className="input mono" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={total} onChange={e => setTotal(e.target.value)} />
              </div>
            </div>

            <div className="modal-foot" style={{ marginTop: 8, padding: 0 }}>
              <Btn type="submit" variant="accent" icon="check" className="grow" disabled={loading}>
                {loading ? 'Создание...' : 'Отправить в кухню'}
              </Btn>
              <Btn type="button" variant="ghost" onClick={onClose}>Отмена</Btn>
            </div>
          </form>
        ) : (
          <form onSubmit={submitBooking} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Имя гостя *</label>
                <input required className="input" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={name} onChange={e => setName(e.target.value)} placeholder="Тимур С." />
              </div>
              <div>
                <label className="label">Телефон *</label>
                <input required className="input mono" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 999 88 77" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Дата</label>
                <select style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                        value={bDate} onChange={e => setBDate(e.target.value)}>
                  <option value="today">Сегодня</option>
                  <option value="tomorrow">Завтра</option>
                </select>
              </div>
              <div>
                <label className="label">Время</label>
                <input type="time" className="input mono" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={bTime} onChange={e => setBTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Количество гостей</label>
                <input type="number" min="1" max="40" className="input mono" style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                       value={bGuests} onChange={e => setBGuests(e.target.value)} />
              </div>
              <div>
                <label className="label">Зал / Зона</label>
                <select style={{ width: '100%', marginTop: 4, padding: '7px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', outline: 'none' }}
                        value={bZone} onChange={e => setBZone(e.target.value)}>
                  <option value="Основной зал">Основной зал</option>
                  <option value="Банкетный зал">Банкетный зал</option>
                  <option value="VIP-кабина">VIP-кабина</option>
                </select>
              </div>
            </div>

            <div className="modal-foot" style={{ marginTop: 8, padding: 0 }}>
              <Btn type="submit" variant="accent" icon="check" className="grow" disabled={loading}>
                {loading ? 'Бронирование...' : 'Забронировать стол'}
              </Btn>
              <Btn type="button" variant="ghost" onClick={onClose}>Отмена</Btn>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

Object.assign(window, { NAV, PAGE_META, Sidebar, Topbar, CommandPalette, CreateModal, THEMES, DIRECTIONS });
