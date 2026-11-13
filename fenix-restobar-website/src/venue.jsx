/* ═══════════ BOOKINGS · BANQUETS · FLOOR ═══════════ */

const BOOK_TONE = { pending: 'warn', confirmed: 'ok', seated: 'info', cancelled: 'muted' };

function Bookings({ t, toast }) {
  const [date, setDate] = useState('today');
  const [zone, setZone] = useState('all');
  const [rows, setRows] = useState(FX.bookings);

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
              table: r.zone === 'VIP-кабина' ? 'VIP 1' : 'Стол 9',
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

  const list = rows.filter((b) => (date === 'all' || b.date === date) && (zone === 'all' || b.zone === zone));
  const pending = rows.filter((b) => b.status === 'pending').length;

  const act = async (id, status) => {
    setRows((r) => r.map((b) => (b.id === id ? { ...b, status } : b)));
    toast(
      status === 'confirmed' ? 'Бронь подтверждена' : status === 'seated' ? 'Гости посажены' : 'Бронь отменена',
      status === 'cancelled' ? 'warn' : 'ok'
    );

    const backendStatus = status === 'confirmed' ? 'подтверждена' : status === 'seated' ? 'посажен' : 'отменена';
    const target = rows.find((b) => b.id === id);
    const code = target?.code || parseInt(String(id).replace(/\D/g, ''));
    try {
      await fetch('/api/admin/reservations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: target?.dbId,
          code,
          status: backendStatus,
        }),
      });
    } catch (e) {
      console.error('Error updating reservation status:', e);
    }
  };

  return (
    <div className="page">
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { l: 'bookings_today', v: rows.filter((b) => b.date === 'today').length, f: 'Основной зал · VIP · Банкетный' },
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

      <div className="filters">
        <div className="row" style={{ gap: 6 }}>
          <span className="label">{t('date')}:</span>
          <div className="chips">
            {[['all', 'all_dates'], ['today', 'today'], ['tomorrow', 'tomorrow']].map(([k, l]) => (
              <button key={k} className="chip" data-on={date === k ? '1' : '0'} onClick={() => setDate(k)}>{t(l)}</button>
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <span className="label">{t('zone')}:</span>
          <div className="chips">
            {[['all', 'all_zones'], ['Основной зал', 'main_hall'], ['Банкетный зал', 'banquet_hall'], ['VIP-кабина', 'vip'], ['any', 'any']].map(([k, l]) => (
              <button key={k} className="chip" data-on={zone === k ? '1' : '0'} onClick={() => setZone(k)}>{l === 'any' ? 'Любой' : t(l)}</button>
            ))}
          </div>
        </div>
        <span className="grow" />
        <Btn size="sm" icon="plus" onClick={() => toast('Форма создания брони', 'ok', 'plus')}>{t('create')}</Btn>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('id')}</th><th>{t('date')}</th><th>{t('time')}</th><th>{t('client')}</th>
              <th>{t('phone')}</th><th>{t('zone')}</th><th>{t('guests')}</th><th>{t('table')}</th>
              <th>{t('status')}</th><th className="tbl-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id + b.time} style={{ cursor: 'default' }}>
                <td className="mono dim">#{b.id}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{b.date === 'today' ? t('today') : b.date === 'tomorrow' ? t('tomorrow') : b.date}</td>
                <td className="mono" style={{ fontWeight: 600 }}>{b.time}</td>
                <td style={{ fontWeight: 600 }}>{b.client}</td>
                <td className="mono dim" style={{ fontSize: 10.5 }}>{b.phone}</td>
                <td className="dim">{b.zone === 'any' ? 'Любой' : b.zone}</td>
                <td><span className="row" style={{ gap: 4 }}><Icon name="users" size={12} style={{ color: 'var(--text-3)' }} />{b.guests}</span></td>
                <td className="dim">{b.table || '—'}</td>
                <td><Pill tone={BOOK_TONE[b.status]} dot={b.status === 'pending'}>{t(b.status === 'pending' ? 'pending_b' : b.status)}</Pill></td>
                <td className="tbl-right">
                  {b.status === 'pending' ? (
                    <span className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      <Btn size="sm" variant="accent" icon="check" onClick={() => act(b.id, 'confirmed')}>{t('confirm')}</Btn>
                      <Btn size="sm" variant="ghost" className="btn-icon" onClick={() => act(b.id, 'cancelled')}><Icon name="x" size={12} /></Btn>
                    </span>
                  ) : <Btn size="sm" variant="ghost" icon="more" />}
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
        {!list.length && <div className="empty" style={{ padding: 40 }}><Icon name="calendar" size={24} /><span>{t('no_bookings')}</span></div>}
      </div>
    </div>
  );
}

function Banquets({ t, toast }) {
  const [rows, setRows] = useState(FX.banquets);

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

      <div className="filters">
        <span className="label">Предстоящие события</span>
        <span className="grow" />
        <Btn size="sm" icon="plus" onClick={() => toast('Новая банкетная заявка', 'ok', 'plus')}>{t('create')}</Btn>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr>
            <th>{t('id')}</th><th>{t('date')}</th><th>{t('client')}</th><th>{t('phone')}</th>
            <th>{t('kind')}</th><th>{t('guests_lbl')}</th><th>{t('hall_lbl')}</th>
            <th className="tbl-right">{t('deposit')}</th><th>{t('status')}</th><th className="tbl-right">{t('actions')}</th>
          </tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} style={{ cursor: 'default' }}>
                <td className="mono dim">{b.id}</td>
                <td className="mono" style={{ whiteSpace: 'nowrap' }}>{b.date}</td>
                <td style={{ fontWeight: 600 }}>{b.client}</td>
                <td className="mono dim" style={{ fontSize: 10.5 }}>{b.phone}</td>
                <td>{b.kind}</td>
                <td>{b.guests}</td>
                <td className="dim">{b.hall}</td>
                <td className="tbl-right mono" style={{ fontWeight: 600 }}>{summ(b.deposit)}</td>
                <td><Pill tone={b.status === 'waiting' ? 'warn' : b.status === 'confirmed' ? 'ok' : 'muted'} dot={b.status === 'waiting'}>
                  {t(b.status)}</Pill></td>
                <td className="tbl-right">
                  {b.status === 'waiting'
                    ? <Btn size="sm" variant="accent" icon="check" onClick={() => confirmBanquet(b)}>{t('confirm')}</Btn>
                    : <Btn size="sm" variant="ghost" icon="more" />}
                </td>
              </tr>
            ))}
            {!rows.length && (
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
  );
}

/* ── floor plan ─────────────────────────────────────── */
const FLOOR_TABLES = [
  { id: 'T1', label: '1', x: 7, y: 12, seats: 4, st: 'free' },
  { id: 'T2', label: '2', x: 7, y: 40, seats: 4, st: 'occupied' },
  { id: 'T3', label: '3', x: 7, y: 68, seats: 2, st: 'booked' },
  { id: 'T4', label: '4', x: 26, y: 12, seats: 6, st: 'occupied' },
  { id: 'T5', label: '5', x: 26, y: 40, seats: 4, st: 'free' },
  { id: 'T6', label: '6', x: 26, y: 68, seats: 4, st: 'cleaning' },
  { id: 'T7', label: '7', x: 46, y: 26, seats: 8, st: 'occupied' },
  { id: 'T9', label: '9', x: 46, y: 66, seats: 2, st: 'booked' },
  { id: 'VIP1', label: 'VIP 1', x: 72, y: 10, seats: 8, st: 'free', vip: true },
  { id: 'VIP2', label: 'VIP 2', x: 72, y: 44, seats: 6, st: 'booked', vip: true },
  { id: 'BAR', label: 'Бар', x: 88, y: 74, seats: 6, st: 'occupied', bar: true },
];
const FLOOR_TONE = { free: 'ok', occupied: 'danger', booked: 'warn', cleaning: 'info' };

function Floor({ t, toast }) {
  const [tables, setTables] = useState(FLOOR_TABLES);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);

  useEffect(() => {
    fetch('/api/admin/reservations')
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.reservations)) {
          setLiveBookings(data.reservations.map(r => ({
            id: r.id || r.code,
            time: r.res_time || '19:00',
            date: r.res_date || '',
            client: r.customer_name || 'Гость',
            guests: r.guests || 2,
            zone: r.zone || 'Основной зал',
            table: r.table || r.zone || 'Основной зал',
            status: r.status || 'confirmed'
          })));
        }
      })
      .catch(err => console.error('Floor reservations fetch error:', err));
  }, []);

  const onDrop = (e) => {
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right) { setDrag(null); return; }
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setTables((ts) => ts.map((tb) => (tb.id === drag ? { ...tb, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(88, y)) } : tb)));
    setDrag(null);
  };

  const cycle = { free: 'occupied', occupied: 'cleaning', cleaning: 'booked', booked: 'free' };

  return (
    <div className="page">
      <div className="filters" style={{ marginTop: 0 }}>
        {Object.entries(FLOOR_TONE).map(([k, tone]) => (
          <span key={k} className="row" style={{ gap: 5, fontSize: 10.5, color: 'var(--text-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--' + tone + ')' }} />
            {t(k === 'booked' ? 'booked' : k === 'occupied' ? 'occupied' : k === 'cleaning' ? 'cleaning' : 'free')}
          </span>
        ))}
        <span className="grow" />
        <span className="dim" style={{ fontSize: 10 }}>{t('floor_hint')}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 288px', gap: 12, flex: 1, minHeight: 0 }}>
        <div className="card" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
             style={{
               position: 'relative', padding: 0, overflow: 'hidden',
               background: 'radial-gradient(circle at 50% 0%, var(--surface-2), var(--surface) 70%)',
               minHeight: 430,
             }}>
          {/* room outline */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: .5 }}>
            <defs>
              <pattern id="gridp" width="26" height="26" patternUnits="userSpaceOnUse">
                <path d="M26 0H0v26" fill="none" stroke="var(--line-soft)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridp)" />
          </svg>
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 8.5, letterSpacing: 'var(--track-label)', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 700 }}>
            Вход · Яшнабадский район, ул. Хуснобод 5-й проезд, 1
          </div>
          {tables.map((tb) => {
            const tone = 'var(--' + FLOOR_TONE[tb.st] + ')';
            const on = sel === tb.id;
            return (
              <button key={tb.id} draggable
                      onDragStart={() => setDrag(tb.id)}
                      onClick={() => setSel(on ? null : tb.id)}
                      onDoubleClick={() => { setTables((ts) => ts.map((x) => x.id === tb.id ? { ...x, st: cycle[x.st] } : x)); toast('Стол ' + tb.label + ' → ' + tb.st, 'warn'); }}
                      style={{
                        position: 'absolute', left: tb.x + '%', top: tb.y + '%',
                        width: tb.bar ? 92 : tb.vip ? 86 : tb.seats >= 6 ? 82 : 60,
                        height: tb.seats >= 6 || tb.vip || tb.bar ? 74 : 60,
                        borderRadius: tb.vip ? 'var(--r-sm)' : tb.seats >= 6 ? '10px' : '50%',
                        border: '1.5px solid ' + (on ? tone : 'var(--line)'),
                        borderLeftWidth: tb.vip ? 4 : undefined,
                        background: 'var(--surface)',
                        backgroundColor: on ? `color-mix(in srgb, ${tone} 15%, var(--surface))` : 'var(--surface)',
                        color: 'var(--text)', cursor: 'grab', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                        boxShadow: on ? '0 0 0 3px color-mix(in srgb, ' + tone + ' 18%, transparent)' : 'var(--shadow)',
                        transition: 'all .16s var(--ease)', fontFamily: 'var(--f-body)',
                      }}>
                    <span style={{ fontSize: tb.vip || tb.bar ? 11 : 15, fontWeight: 700, fontFamily: tb.vip || tb.bar ? 'var(--f-body)' : 'var(--f-display)', letterSpacing: tb.vip ? '.04em' : 0 }}>
                      {tb.label}
                    </span>
                    <span style={{ fontSize: 8.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon name="users" size={8} /> {tb.seats}
                    </span>
                    <span style={{ width: 5, height: 5, borderRadius: 50, background: tone, marginTop: 1 }} />
                  </button>
                );
              })}
        </div>

        <div className="card" style={{ padding: 13, overflowY: 'auto' }}>
          {sel ? (() => {
            const tb = tables.find((x) => x.id === sel);
            const tone = 'var(--' + FLOOR_TONE[tb.st] + ')';
            return (
              <div className="col-flex" style={{ gap: 11 }}>
                <div>
                  <div className="label">{t('table')}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
                    {tb.vip || tb.bar ? tb.label : 'Стол ' + tb.label}
                  </div>
                  <div className="row" style={{ marginTop: 5, gap: 5 }}>
                    <Pill tone={FLOOR_TONE[tb.st]} dot>{t(tb.st === 'free' ? 'free' : tb.st === 'booked' ? 'booked' : tb.st === 'occupied' ? 'occupied' : 'cleaning')}</Pill>
                    <Pill tone="muted"><Icon name="users" size={9} /> {tb.seats}</Pill>
                  </div>
                </div>
                <div className="sect-title" style={{ margin: 0 }}>{t('actions')}</div>
                <Btn icon="users" onClick={() => toast('Гости посажены за ' + tb.label)}>{t('seat')}</Btn>
                <Btn icon="calendar" onClick={() => toast('Бронь на этот стол')}>{t('bookings')}</Btn>
                <Btn icon="gear" variant="ghost" onClick={() => { setTables((ts) => ts.map((x) => x.id === tb.id ? { ...x, st: cycle[x.st] } : x)); }}>Изменить статус</Btn>
                <div style={{ paddingTop: 9, borderTop: '1px solid var(--line-soft)' }}>
                  <div className="label">{t('today')}</div>
                  <div className="col-flex" style={{ marginTop: 6, gap: 6 }}>
                    {liveBookings.filter((b) => (b.table && b.table.includes(tb.label)) || (b.zone && b.zone.includes(tb.label))).slice(0, 3).map((b) => (
                      <div key={b.id} style={{ fontSize: 10.5, display: 'flex', gap: 6 }}>
                        <span className="mono dim">{b.time}</span>
                        <span className="trunc">{b.client}</span>
                        <span className="dim" style={{ marginLeft: 'auto' }}>{b.guests} чел.</span>
                      </div>
                    ))}
                    {!liveBookings.filter((b) => (b.table && b.table.includes(tb.label)) || (b.zone && b.zone.includes(tb.label))).length && (
                      <span className="dim" style={{ fontSize: 10.5 }}>Броней нет</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="empty" style={{ height: '100%' }}>
              <Icon name="grid" size={24} />
              <span>Выберите стол на плане</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Bookings, Banquets, Floor, BOOK_TONE });
