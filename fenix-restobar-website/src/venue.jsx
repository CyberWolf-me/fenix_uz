/* ═══════════ BOOKINGS · BANQUETS · FLOOR ═══════════ */

const BOOK_TONE = { pending: 'warn', confirmed: 'ok', seated: 'info', cancelled: 'muted' };

function isTodayDate(dStr) {
  if (!dStr) return false;
  if (dStr === 'today') return true;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const iso = `${yyyy}-${mm}-${dd}`;
  const ru = `${dd}.${mm}.${yyyy}`;
  return String(dStr).includes(iso) || String(dStr).includes(ru);
}

function isTomorrowDate(dStr) {
  if (!dStr) return false;
  if (dStr === 'tomorrow') return true;
  const tom = new Date(Date.now() + 86400000);
  const yyyy = tom.getFullYear();
  const mm = String(tom.getMonth() + 1).padStart(2, '0');
  const dd = String(tom.getDate()).padStart(2, '0');
  const iso = `${yyyy}-${mm}-${dd}`;
  const ru = `${dd}.${mm}.${yyyy}`;
  return String(dStr).includes(iso) || String(dStr).includes(ru);
}

function Bookings({ t, toast }) {
  const [date, setDate] = useState('all');
  const [zone, setZone] = useState('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(FX.bookings);
  const [actionMenuBooking, setActionMenuBooking] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchReservations = async () => {
      try {
        const res = await fetch('/api/admin/reservations');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && data.ok && Array.isArray(data.reservations)) {
          const mapped = data.reservations.map((r) => {
            let status = 'pending';
            const s = (r.status || '').toLowerCase();
            if (s.includes('подтвержд') || s === 'confirmed') status = 'confirmed';
            else if (s.includes('посажен') || s === 'seated') status = 'seated';
            else if (s.includes('отменен') || s === 'cancelled') status = 'cancelled';

            return {
              id: r.codeFormatted || `WEB-${r.code}`,
              code: r.code,
              dbId: r.id,
              date: r.date || 'today',
              client: r.customerName || 'Гость',
              phone: r.customerPhone || '—',
              guests: parseInt(r.guests) || 2,
              zone: r.zone || 'Основной зал',
              time: r.time || '19:00',
              status,
              table: r.table || '—',
            };
          });

          setRows(mapped);
        }
      } catch (e) {
        console.error('Error fetching reservations:', e);
      }
    };
    fetchReservations();
    const iv = setInterval(fetchReservations, 7000);
    return () => { active = false; clearInterval(iv); };
  }, []);

  const matchesDate = (b) => {
    if (date === 'all') return true;
    if (date === 'today') return isTodayDate(b.date);
    if (date === 'tomorrow') return isTomorrowDate(b.date);
    return b.date === date;
  };
  const list = rows.filter((b) => {
    if (!matchesDate(b)) return false;
    if (zone !== 'all' && b.zone !== zone) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchClient = (b.client || '').toLowerCase().includes(q);
      const matchPhone = (b.phone || '').toLowerCase().includes(q);
      const matchId = (b.id || '').toLowerCase().includes(q);
      const matchTable = (b.table || '').toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchId && !matchTable) return false;
    }
    return true;
  });
  const pending = rows.filter((b) => b.status === 'pending').length;
  const bookingsTodayCount = rows.filter((b) => isTodayDate(b.date)).length;

  const act = async (id, status, newTable = null) => {
    setRows((r) => r.map((b) => (b.id === id ? { ...b, status, ...(newTable !== null ? { table: newTable || '—' } : {}) } : b)));
    const msg = status === 'confirmed'
      ? 'Бронь подтверждена'
      : status === 'seated'
      ? 'Гости посажены'
      : status === 'pending'
      ? 'Бронь возвращена в ожидание'
      : 'Бронь отменена';
    toast(msg, status === 'cancelled' ? 'warn' : 'ok');

    const backendStatus = status === 'confirmed'
      ? 'подтверждена'
      : status === 'seated'
      ? 'посажен'
      : status === 'pending'
      ? 'ожидает подтверждения'
      : 'отменена';
    const target = rows.find((b) => b.id === id);
    const code = target?.code || parseInt(String(id).replace(/\D/g, ''));
    const tableToPersist = newTable !== null ? (newTable || '') : (target?.table && target?.table !== '—' ? target.table : '');
    try {
      await fetch('/api/admin/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: target?.dbId,
          code,
          status: backendStatus,
          table: tableToPersist,
        }),
      });
    } catch (e) {
      console.error('Error updating reservation status:', e);
    }
  };

  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'bookings_today', v: bookingsTodayCount, f: 'Основной зал · VIP · Банкетный' },
          { l: 'pending', v: pending, f: 'Требуют ответа сейчас', warn: true },
          { l: 'guests', v: rows.reduce((s, b) => s + b.guests, 0), f: 'Суммарно по всем броням' },
          { l: 'confirmed', v: rows.filter((b) => b.status === 'confirmed').length, f: 'Подтверждено менеджером' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top"><span className="label">{t(c.l)}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.warn ? 'alert' : 'calendar'} size={14} /></span></div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div className="venue-toolbar">
        <div className="venue-toolbar-filters">
          <div className="filter-group">
            <span className="filter-group-tag">
              <Icon name="calendar" size={13} />
              <span>{t('date')}</span>
            </span>
            <div className="filter-pills">
              {[['all', 'all_dates'], ['today', 'today'], ['tomorrow', 'tomorrow']].map(([k, l]) => (
                <button
                  key={k}
                  className="filter-pill"
                  data-on={date === k ? '1' : '0'}
                  onClick={() => setDate(k)}
                >
                  {t(l)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider" />

          <div className="filter-group">
            <span className="filter-group-tag">
              <Icon name="layers" size={13} />
              <span>{t('zone')}</span>
            </span>
            <div className="filter-pills">
              {[
                ['all', 'all_zones'],
                ['Основной зал', 'main_hall'],
                ['Банкетный зал', 'banquet_hall'],
                ['VIP-кабина', 'vip'],
                ['any', 'any']
              ].map(([k, l]) => (
                <button
                  key={k}
                  className="filter-pill"
                  data-on={zone === k ? '1' : '0'}
                  onClick={() => setZone(k)}
                >
                  {l === 'any' ? 'Любой' : t(l)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="venue-toolbar-search">
          <div className="search" style={{ height: 34, width: '100%', maxWidth: '100%', borderRadius: 8 }}>
            <Icon name="search" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по гостю, телефону, столу..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 0, background: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}
                title="Очистить"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="venue-toolbar-actions">
          <Pill tone="neutral">{list.length} броней</Pill>
          <Btn size="sm" variant="accent" icon="plus" onClick={() => toast('Форма создания брони', 'ok', 'plus')}>
            {t('create')}
          </Btn>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="tbl" style={{ tableLayout: 'fixed', width: '100%', minWidth: 920 }}>
            <colgroup>
              <col style={{ width: '75px' }} />
              <col style={{ width: '95px' }} />
              <col style={{ width: '65px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '115px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '75px' }} />
              <col style={{ width: '105px' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
          <thead>
            <tr>
              <th style={{ paddingLeft: 18, textAlign: 'left' }}>{t('id')}</th>
              <th style={{ textAlign: 'left' }}>{t('date')}</th>
              <th style={{ textAlign: 'left' }}>{t('time')}</th>
              <th style={{ textAlign: 'left' }}>{t('client')}</th>
              <th style={{ textAlign: 'left' }}>{t('phone')}</th>
              <th style={{ textAlign: 'left' }}>{t('zone')}</th>
              <th style={{ textAlign: 'right', paddingRight: 16 }}>{t('guests')}</th>
              <th style={{ textAlign: 'left' }}>{t('table')}</th>
              <th style={{ textAlign: 'center' }}>{t('status')}</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id + b.time} style={{ cursor: 'default' }}>
                <td className="mono dim" style={{ paddingLeft: 18 }}>#{b.id}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{b.date === 'today' ? t('today') : b.date === 'tomorrow' ? t('tomorrow') : b.date}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{b.time}</td>
                <td style={{ fontWeight: 600 }} className="trunc">{b.client}</td>
                <td className="mono dim" style={{ fontSize: 11 }}>{b.phone}</td>
                <td className="dim trunc">{b.zone === 'any' ? 'Любой' : b.zone}</td>
                <td style={{ textAlign: 'right', paddingRight: 16, fontFamily: 'var(--f-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  <span className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                    <Icon name="users" size={12} style={{ color: 'var(--text-3)' }} />
                    {b.guests}
                  </span>
                </td>
                <td className="dim trunc">{b.table || '—'}</td>
                <td style={{ textAlign: 'center' }}><Pill tone={BOOK_TONE[b.status]} dot={b.status === 'pending'}>{t(b.status === 'pending' ? 'pending_b' : b.status)}</Pill></td>
                <td style={{ textAlign: 'right', paddingRight: 18 }}>
                  {b.status === 'pending' ? (
                    <span className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      <Btn size="sm" variant="accent" icon="check" onClick={() => act(b.id, 'confirmed')}>{t('confirm')}</Btn>
                      <Btn size="sm" variant="ghost" className="btn-icon" onClick={() => act(b.id, 'cancelled')}><Icon name="x" size={12} /></Btn>
                      <Btn size="sm" variant="ghost" icon="more" onClick={() => setActionMenuBooking(b)} />
                    </span>
                  ) : (
                    <Btn size="sm" variant="ghost" icon="more" onClick={() => setActionMenuBooking(b)} />
                  )}
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '38px 12px', color: 'var(--text-3)' }}>
                  <Icon name="calendar" size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Броней на выбранную дату нет</div>
                  <div style={{ fontSize: 11, marginTop: 3 }}>Новые заявки на бронирование столов появятся здесь автоматически</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        {!list.length && <div className="empty" style={{ padding: 40 }}><Icon name="calendar" size={24} /><span>{t('no_bookings')}</span></div>}
      </div>

      {actionMenuBooking && (
        <Modal onClose={() => setActionMenuBooking(null)} width={460} label="Действия с бронью">
          <div style={{ padding: '6px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Бронь #{actionMenuBooking.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>
                  {actionMenuBooking.client} · {actionMenuBooking.phone}
                </div>
              </div>
              <Pill tone={BOOK_TONE[actionMenuBooking.status]}>
                {actionMenuBooking.status === 'seated'
                  ? 'Посажен в зале'
                  : actionMenuBooking.status === 'confirmed'
                  ? 'Подтверждено'
                  : actionMenuBooking.status === 'pending'
                  ? 'В ожидании'
                  : 'Отменено'}
              </Pill>
            </div>

            <div className="card" style={{ background: 'var(--surface-2)', padding: '12px 14px', marginBottom: 16, fontSize: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px' }}>
                <div><span style={{ color: 'var(--dim)' }}>Дата:</span> <b>{actionMenuBooking.date}</b></div>
                <div><span style={{ color: 'var(--dim)' }}>Время:</span> <b>{actionMenuBooking.time}</b></div>
                <div><span style={{ color: 'var(--dim)' }}>Зал:</span> <b>{actionMenuBooking.zone}</b></div>
                <div><span style={{ color: 'var(--dim)' }}>Гостей:</span> <b>{actionMenuBooking.guests} чел.</b></div>
              </div>

              {/* Table assignment selector */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Назначенный стол:
                </label>
                <select
                  value={actionMenuBooking.table && actionMenuBooking.table !== '—' ? actionMenuBooking.table : ''}
                  onChange={(e) => {
                    const newTb = e.target.value;
                    act(actionMenuBooking.id, actionMenuBooking.status, newTb);
                    setActionMenuBooking((prev) => ({ ...prev, table: newTb }));
                  }}
                  style={{
                    width: '100%', height: 32, borderRadius: 6, border: '1px solid var(--line)',
                    background: 'var(--surface)', color: 'var(--text)', fontSize: 12, padding: '0 8px', outline: 'none'
                  }}
                >
                  <option value="">-- Выберите стол --</option>
                  {['Стол 1', 'Стол 2', 'Стол 3', 'Стол 4', 'Стол 5', 'Стол 6', 'Стол 7', 'Стол 8', 'Стол 9', 'Стол 10', 'Стол 11', 'Стол 12', 'VIP 1', 'VIP 2', 'Банкетный зал'].map((tName) => (
                    <option key={tName} value={tName}>{tName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Seating / Arrival action */}
              {actionMenuBooking.status !== 'seated' && (
                <Btn
                  size="md"
                  variant="accent"
                  icon="users"
                  onClick={() => {
                    act(actionMenuBooking.id, 'seated');
                    setActionMenuBooking(null);
                  }}
                >
                  Посадить гостей (Гости в зале)
                </Btn>
              )}

              {actionMenuBooking.status !== 'confirmed' && (
                <Btn
                  size="md"
                  variant="ghost"
                  icon="check"
                  onClick={() => {
                    act(actionMenuBooking.id, 'confirmed');
                    setActionMenuBooking(null);
                  }}
                >
                  Подтвердить бронь
                </Btn>
              )}

              {actionMenuBooking.status !== 'pending' && (
                <Btn
                  size="md"
                  variant="ghost"
                  icon="clock"
                  onClick={() => {
                    act(actionMenuBooking.id, 'pending');
                    setActionMenuBooking(null);
                  }}
                >
                  Вернуть в ожидание
                </Btn>
              )}

              {actionMenuBooking.status !== 'cancelled' && (
                <Btn
                  size="md"
                  variant="ghost"
                  icon="x"
                  style={{ color: 'var(--err)' }}
                  onClick={() => {
                    act(actionMenuBooking.id, 'cancelled');
                    setActionMenuBooking(null);
                  }}
                >
                  Отменить бронирование
                </Btn>
              )}

              {/* Direct call button */}
              <a
                href={`tel:${actionMenuBooking.phone}`}
                className="btn btn-md"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'var(--surface-3)',
                  color: 'var(--text)',
                  borderRadius: 8,
                  fontWeight: 600,
                  marginTop: 4
                }}
              >
                <Icon name="phone" size={14} />
                Позвонить гостю ({actionMenuBooking.phone})
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Banquets({ t, toast }) {
  const [rows, setRows] = useState(FX.banquets);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/admin/events');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && data.ok && Array.isArray(data.events)) {
          const mapped = data.events.map((ev) => ({
            id: ev.eventId ? `BNQ-${ev.eventId}` : `BNQ-${ev.id}`,
            eventId: ev.eventId || ev.id,
            dbId: ev.id,
            date: ev.eventDate || '2026-11-20',
            client: ev.customerName || 'Заказчик',
            phone: ev.customerPhone || '—',
            kind: ev.eventType || 'Банкет',
            guests: parseInt(ev.guests) || 30,
            hall: ev.hall || 'Банкетный зал',
            deposit: 5000000,
            status: (ev.status || '').includes('подтвержд') ? 'confirmed' : 'waiting',
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error('Error fetching events:', e);
      }
    };
    fetchEvents();
    const iv = setInterval(fetchEvents, 10000);
    return () => { active = false; clearInterval(iv); };
  }, []);

  const confirmBanquet = async (b) => {
    setRows((r) => r.map((x) => x.id === b.id ? { ...x, status: 'confirmed' } : x));
    toast('Банкет подтверждён', 'ok');
    try {
      await fetch('/api/admin/events/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: b.dbId,
          eventId: b.eventId || parseInt(String(b.id).replace(/\D/g, '')),
          status: 'подтверждена',
        }),
      });
    } catch (_) {}
  };

  const filteredRows = rows.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchClient = (b.client || '').toLowerCase().includes(q);
      const matchPhone = (b.phone || '').toLowerCase().includes(q);
      const matchId = (b.id || '').toLowerCase().includes(q);
      const matchHall = (b.hall || '').toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchId && !matchHall) return false;
    }
    return true;
  });

  const total = rows.reduce((s, b) => s + b.deposit, 0);
  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'banquets', v: rows.length, f: 'Ноябрь — декабрь 2026' },
          { l: 'pending', v: rows.filter((b) => b.status === 'waiting').length, f: 'Ждут подтверждения менеджера', warn: true },
          { l: 'deposit', v: summ(total), f: 'Сумма депозитов', serif: true },
          { l: 'guests', v: rows.reduce((s, b) => s + b.guests, 0), f: 'Заявленных гостей' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top"><span className="label">{t(c.l)}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.warn ? 'alert' : 'star'} size={14} /></span></div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div className="venue-toolbar">
        <div className="venue-toolbar-filters">
          <div className="filter-group">
            <span className="filter-group-tag">
              <Icon name="star" size={13} />
              <span>Статус</span>
            </span>
            <div className="filter-pills">
              {[
                ['all', 'Все события'],
                ['waiting', 'Ожидают'],
                ['confirmed', 'Подтверждены']
              ].map(([k, label]) => (
                <button
                  key={k}
                  className="filter-pill"
                  data-on={statusFilter === k ? '1' : '0'}
                  onClick={() => setStatusFilter(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="venue-toolbar-search">
          <div className="search" style={{ height: 34, width: '100%', maxWidth: '100%', borderRadius: 8 }}>
            <Icon name="search" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск банкета по клиенту, залу..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 0, background: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}
                title="Очистить"
              >
                <Icon name="x" size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="venue-toolbar-actions">
          <Pill tone="neutral">{filteredRows.length} событий</Pill>
          <Btn size="sm" variant="accent" icon="plus" onClick={() => toast('Новая банкетная заявка', 'ok', 'plus')}>
            {t('create')}
          </Btn>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="tbl" style={{ tableLayout: 'fixed', width: '100%', minWidth: 920 }}>
            <colgroup>
              <col style={{ width: '75px' }} />
              <col style={{ width: '95px' }} />
              <col style={{ width: '155px' }} />
              <col style={{ width: '125px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '115px' }} />
              <col style={{ width: '105px' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
          <thead>
            <tr>
              <th style={{ paddingLeft: 18, textAlign: 'left' }}>{t('id')}</th>
              <th style={{ textAlign: 'left' }}>{t('date')}</th>
              <th style={{ textAlign: 'left' }}>{t('client')}</th>
              <th style={{ textAlign: 'left' }}>{t('phone')}</th>
              <th style={{ textAlign: 'left' }}>{t('kind')}</th>
              <th style={{ textAlign: 'right', paddingRight: 16 }}>{t('guests_lbl')}</th>
              <th style={{ textAlign: 'left' }}>{t('hall_lbl')}</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>{t('deposit')}</th>
              <th style={{ textAlign: 'center' }}>{t('status')}</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((b) => (
              <tr key={b.id} style={{ cursor: 'default' }}>
                <td className="mono dim" style={{ paddingLeft: 18 }}>{b.id}</td>
                <td className="mono" style={{ whiteSpace: 'nowrap' }}>{b.date}</td>
                <td style={{ fontWeight: 600 }} className="trunc">{b.client}</td>
                <td className="mono dim" style={{ fontSize: 11 }}>{b.phone}</td>
                <td>{b.kind}</td>
                <td style={{ textAlign: 'right', paddingRight: 16, fontFamily: 'var(--f-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{b.guests}</td>
                <td className="dim trunc">{b.hall}</td>
                <td style={{ textAlign: 'right', paddingRight: 18, fontFamily: 'var(--f-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--accent-2)' }}>{summ(b.deposit)} сум</td>
                <td style={{ textAlign: 'center' }}><Pill tone={b.status === 'waiting' ? 'warn' : b.status === 'confirmed' ? 'ok' : 'muted'} dot={b.status === 'waiting'}>{t(b.status)}</Pill></td>
                <td style={{ textAlign: 'right', paddingRight: 18 }}>
                  {b.status === 'waiting'
                    ? <Btn size="sm" variant="accent" icon="check" onClick={() => confirmBanquet(b)}>{t('confirm')}</Btn>
                    : <Btn size="sm" variant="ghost" icon="more" />}
                </td>
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '38px 12px', color: 'var(--text-3)' }}>
                  <Icon name="star" size={24} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Заявок на банкеты пока нет</div>
                  <div style={{ fontSize: 11, marginTop: 3 }}>Входящие заявки на банкеты и торжества будут отображаться здесь</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

/* ── floor plan (Real Two-Floor Scheme: 120 + 170 seats) ─── */
const FLOOR_1_TABLES = [
  { id: 'T1', label: 'Стол 1', x: 8, y: 14, seats: 4, st: 'free' },
  { id: 'T2', label: 'Стол 2', x: 8, y: 42, seats: 4, st: 'occupied' },
  { id: 'T3', label: 'Стол 3', x: 8, y: 70, seats: 2, st: 'booked' },
  { id: 'T4', label: 'Стол 4', x: 26, y: 14, seats: 6, st: 'occupied' },
  { id: 'T5', label: 'Стол 5', x: 26, y: 42, seats: 4, st: 'free' },
  { id: 'T6', label: 'Стол 6', x: 26, y: 70, seats: 4, st: 'cleaning' },
  { id: 'T7', label: 'Стол 7', x: 45, y: 14, seats: 8, st: 'free' },
  { id: 'T8', label: 'Стол 8', x: 45, y: 42, seats: 6, st: 'occupied' },
  { id: 'T9', label: 'Стол 9', x: 45, y: 70, seats: 4, st: 'booked' },
  { id: 'T10', label: 'Стол 10', x: 64, y: 14, seats: 4, st: 'free' },
  { id: 'T11', label: 'Стол 11', x: 64, y: 42, seats: 6, st: 'free' },
  { id: 'T12', label: 'Стол 12', x: 64, y: 70, seats: 4, st: 'free' },
  { id: 'STAGE', label: 'Сцена & DJ', x: 83, y: 12, seats: 0, st: 'special', stage: true },
  { id: 'BAR', label: 'Барная стойка', x: 83, y: 55, seats: 8, st: 'occupied', bar: true },
];

const FLOOR_2_TABLES = [
  { id: 'B1', label: 'Банкет Б-1', x: 8, y: 16, seats: 20, st: 'booked', banquet: true },
  { id: 'B2', label: 'Банкет Б-2', x: 8, y: 58, seats: 20, st: 'free', banquet: true },
  { id: 'B3', label: 'Банкет Б-3', x: 36, y: 16, seats: 24, st: 'free', banquet: true },
  { id: 'B4', label: 'Банкет Б-4', x: 36, y: 58, seats: 24, st: 'occupied', banquet: true },
  { id: 'B5', label: 'Банкет Б-5', x: 62, y: 16, seats: 16, st: 'free', banquet: true },
  { id: 'B6', label: 'Банкет Б-6', x: 62, y: 58, seats: 16, st: 'cleaning', banquet: true },
  { id: 'VIP1', label: 'VIP 1 Караоке', x: 84, y: 10, seats: 10, st: 'booked', vip: true },
  { id: 'VIP2', label: 'VIP 2 Лаунж', x: 84, y: 42, seats: 8, st: 'occupied', vip: true },
  { id: 'VIP3', label: 'VIP 3 Премиум', x: 84, y: 74, seats: 12, st: 'free', vip: true },
];

const FLOOR_TONE = { free: 'ok', occupied: 'danger', booked: 'warn', cleaning: 'info', special: 'accent' };

function Floor({ t, toast }) {
  const [currentFloor, setCurrentFloor] = useState(1); // 1 = 1-й этаж (Основной), 2 = 2-й этаж (Банкетный)
  const [floor1Tables, setFloor1Tables] = useState(FLOOR_1_TABLES);
  const [floor2Tables, setFloor2Tables] = useState(FLOOR_2_TABLES);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);

  const activeTables = currentFloor === 1 ? floor1Tables : floor2Tables;
  const setActiveTables = currentFloor === 1 ? setFloor1Tables : setFloor2Tables;

  useEffect(() => {
    fetch('/api/admin/reservations')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.reservations)) {
          setLiveBookings(
            data.reservations.map((r) => ({
              id: r.id || r.code,
              time: r.res_time || '19:00',
              date: r.res_date || '',
              client: r.customer_name || 'Гость',
              phone: r.customer_phone || '',
              guests: r.guests || 2,
              zone: r.zone || 'Основной зал',
              table: r.table || r.zone || 'Основной зал',
              status: r.status || 'confirmed',
            }))
          );
        }
      })
      .catch((err) => console.error('Floor reservations fetch error:', err));
  }, []);

  const onDrop = (e) => {
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right) { setDrag(null); return; }
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setActiveTables((ts) => ts.map((tb) => (tb.id === drag ? { ...tb, x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(86, y)) } : tb)));
    setDrag(null);
  };

  const cycleStatus = (tbId) => {
    const cycle = { free: 'occupied', occupied: 'cleaning', cleaning: 'booked', booked: 'free', special: 'special' };
    setActiveTables((ts) =>
      ts.map((tb) => {
        if (tb.id !== tbId || tb.stage) return tb;
        const nextSt = cycle[tb.st] || 'free';
        toast(`Стол ${tb.label}: статус изменён на "${t(nextSt)}"`, nextSt === 'occupied' ? 'warn' : 'ok');
        return { ...tb, st: nextSt };
      })
    );
  };

  const selectedTable = activeTables.find((x) => x.id === sel);

  // Filter bookings matching selected table/zone
  const matchingBookings = selectedTable
    ? liveBookings.filter((b) => {
        const lbl = selectedTable.label.toLowerCase();
        const tid = selectedTable.id.toLowerCase();
        const bTable = (b.table || '').toLowerCase();
        const bZone = (b.zone || '').toLowerCase();
        return bTable.includes(lbl) || bTable.includes(tid) || bZone.includes(lbl) || (currentFloor === 2 && (bZone.includes('банкет') || bZone.includes('vip')));
      })
    : [];

  const freeCount = activeTables.filter((x) => x.st === 'free' && !x.stage).length;
  const occupiedCount = activeTables.filter((x) => x.st === 'occupied').length;
  const bookedCount = activeTables.filter((x) => x.st === 'booked').length;

  return (
    <div className="page">
      {/* Floor & Zone Switcher Header */}
      <div className="filters" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="chip"
            data-on={currentFloor === 1 ? '1' : '0'}
            onClick={() => { setCurrentFloor(1); setSel(null); }}
            style={{ fontWeight: 700 }}
          >
            1-й этаж · Основной зал (120 мест)
          </button>
          <button
            className="chip"
            data-on={currentFloor === 2 ? '1' : '0'}
            onClick={() => { setCurrentFloor(2); setSel(null); }}
            style={{ fontWeight: 700 }}
          >
            2-й этаж · Банкетный зал & VIP (170 мест)
          </button>
        </div>

        <span className="grow" />

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: 'var(--text-2)' }}>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--ok)' }} />
            Свободен ({freeCount})
          </span>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--danger)' }} />
            Занят ({occupiedCount})
          </span>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--warn)' }} />
            Бронь ({bookedCount})
          </span>
          <span className="row" style={{ gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--info)' }} />
            Уборка
          </span>
        </div>
      </div>

      <div className="venue-floor-grid">
        {/* Interactive Floor Scheme Canvas */}
        <div
          className="card"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          style={{
            position: 'relative',
            padding: 0,
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 0%, var(--surface-2), var(--surface) 75%)',
            minHeight: 520,
            border: '1px solid var(--line)',
          }}
        >
          {/* Subtle architectural grid pattern */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
            <defs>
              <pattern id="gridp" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0v28" fill="none" stroke="var(--line-soft)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridp)" />
          </svg>

          {/* Hall Title Watermark */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 18,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--accent-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            {currentFloor === 1 ? '1-й этаж · Основной зал (120 мест) · Живая музыка и Бар' : '2-й этаж · Банкетный зал (170 мест) · Банкеты и VIP-залы'}
          </div>

          {/* Entrance Marker */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 9.5,
              letterSpacing: 'var(--track-label)',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="door" size={11} />
            <span>Главный вход · ул. Хуснобод 5-й проезд, 1</span>
          </div>

          {/* Render All Tables on Current Floor */}
          {activeTables.map((tb) => {
            const isStage = !!tb.stage;
            const isVip = !!tb.vip;
            const isBanquet = !!tb.banquet;
            const isBar = !!tb.bar;
            const tone = isStage ? 'var(--accent)' : 'var(--' + FLOOR_TONE[tb.st] + ')';
            const on = sel === tb.id;

            const w = isStage ? 120 : isBanquet ? 116 : isBar ? 110 : isVip ? 96 : tb.seats >= 6 ? 84 : 64;
            const h = isStage ? 86 : isBanquet ? 84 : isBar ? 78 : isVip ? 80 : tb.seats >= 6 ? 74 : 64;
            const borderRadius = isStage ? '12px' : isVip ? '10px' : isBanquet ? '14px' : tb.seats >= 6 ? '12px' : '50%';

            return (
              <button
                key={tb.id}
                draggable={!isStage}
                onDragStart={() => setDrag(tb.id)}
                onClick={() => setSel(on ? null : tb.id)}
                onDoubleClick={() => cycleStatus(tb.id)}
                title={isStage ? 'Сцена живой музыки' : `${tb.label} (${tb.seats} мест) — Дважды кликните для смены статуса`}
                style={{
                  position: 'absolute',
                  left: `${tb.x}%`,
                  top: `${tb.y}%`,
                  width: w,
                  height: h,
                  borderRadius,
                  border: '1.5px solid ' + (on ? tone : isStage ? 'var(--accent-line)' : 'var(--line)'),
                  borderLeftWidth: isVip || isBanquet ? 4 : undefined,
                  borderLeftColor: isVip || isBanquet ? tone : undefined,
                  backgroundColor: on
                    ? `color-mix(in srgb, ${tone} 18%, var(--surface))`
                    : isStage
                    ? 'rgba(211, 170, 99, 0.08)'
                    : 'var(--surface)',
                  color: 'var(--text)',
                  cursor: isStage ? 'default' : 'grab',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${tone} 25%, transparent)` : 'var(--shadow)',
                  transition: 'all .16s var(--ease)',
                  fontFamily: 'var(--f-body)',
                  zIndex: on ? 10 : 2,
                }}
              >
                {isStage ? (
                  <>
                    <Icon name="music" size={18} style={{ color: 'var(--accent-2)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-2)', marginTop: 2 }}>Сцена & DJ</span>
                    <span style={{ fontSize: 8.5, color: 'var(--text-3)' }}>Живой звук</span>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontSize: isBanquet || isVip || isBar ? 11 : 13,
                        fontWeight: 700,
                        fontFamily: 'var(--f-body)',
                        letterSpacing: isVip ? '.03em' : 0,
                      }}
                    >
                      {tb.label}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="users" size={8.5} /> {tb.seats} мест
                    </span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone, marginTop: 1 }} />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Details Sidebar for Selected Table */}
        <div className="card" style={{ padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {selectedTable ? (
            <div className="col-flex" style={{ gap: 12 }}>
              <div>
                <div className="label">
                  {currentFloor === 1 ? '1-й этаж · Основной зал' : '2-й этаж · Банкетный зал'}
                </div>
                <div style={{ fontFamily: 'var(--f-body)', fontSize: 18, fontWeight: 700, lineHeight: 1.1, marginTop: 3 }}>
                  {selectedTable.label}
                </div>
                {!selectedTable.stage && (
                  <div className="row" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                    <Pill tone={FLOOR_TONE[selectedTable.st]} dot>
                      {t(selectedTable.st === 'free' ? 'free' : selectedTable.st === 'booked' ? 'booked' : selectedTable.st === 'occupied' ? 'occupied' : selectedTable.st === 'cleaning' ? 'cleaning' : 'ok')}
                    </Pill>
                    <Pill tone="muted">
                      <Icon name="users" size={10} /> Вместимость: {selectedTable.seats} гостей
                    </Pill>
                  </div>
                )}
              </div>

              {!selectedTable.stage && (
                <>
                  <div className="sect-title" style={{ margin: 0 }}>Управление столом</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Btn
                      icon="users"
                      variant="accent"
                      onClick={() => {
                        setActiveTables((ts) => ts.map((x) => (x.id === selectedTable.id ? { ...x, st: 'occupied' } : x)));
                        toast(`Гости посажены за "${selectedTable.label}"`, 'ok', 'check');
                      }}
                    >
                      Посадить гостей (Занят)
                    </Btn>
                    <Btn
                      icon="check"
                      onClick={() => {
                        setActiveTables((ts) => ts.map((x) => (x.id === selectedTable.id ? { ...x, st: 'free' } : x)));
                        toast(`Стол "${selectedTable.label}" освобождён`, 'ok', 'check');
                      }}
                    >
                      Освободить стол (Свободен)
                    </Btn>
                    <Btn
                      icon="rotate"
                      variant="ghost"
                      onClick={() => cycleStatus(selectedTable.id)}
                    >
                      Сменить статус (Уборка/Бронь)
                    </Btn>
                  </div>

                  {/* Matching Customer Bookings */}
                  <div style={{ paddingTop: 10, borderTop: '1px solid var(--line-soft)' }}>
                    <div className="label">Бронирования из базы данных</div>
                    <div className="col-flex" style={{ marginTop: 8, gap: 8 }}>
                      {matchingBookings.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          style={{
                            background: 'var(--surface-2)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            border: '1px solid var(--line-soft)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, fontSize: 12 }}>{b.client}</span>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--accent-2)', fontWeight: 700 }}>
                              {b.time}
                            </span>
                          </div>
                          {b.phone && (
                            <div className="mono dim" style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="phone" size={10} /> {b.phone}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-3)' }}>
                            <span>Гостей: {b.guests} чел.</span>
                            <span>{b.date || 'Сегодня'}</span>
                          </div>
                        </div>
                      ))}
                      {!matchingBookings.length && (
                        <div style={{ padding: '14px 8px', textAlign: 'center', color: 'var(--text-3)', fontSize: 11 }}>
                          На этот стол нет активных броней
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty" style={{ height: '100%', padding: '40px 10px' }}>
              <Icon name="grid" size={26} />
              <span style={{ fontWeight: 600, marginTop: 8 }}>Выберите стол</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 4 }}>
                Кликните по любому столу или VIP-залу на плане для управления статусом посадки
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Bookings, Banquets, Floor, BOOK_TONE });
