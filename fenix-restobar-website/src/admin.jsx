/* ═══════════ COURIERS · MENU · STAFF ═══════════ */

function Couriers({ t, toast }) {
  const [sel, setSel] = useState('C-1');
  const active = FX.couriers.find((c) => c.id === sel);
  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'couriers', v: FX.couriers.length, f: 'Три на линии · два свободны', icon: 'bike' },
          { l: 'active_orders', v: 3, f: 'В доставке прямо сейчас', icon: 'truck' },
          { l: 'sla_avg', v: '28', f: 'мин · цель 35 мин', icon: 'clock' },
          { l: 'completed', v: 17, f: 'Доставлено за смену', icon: 'check' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top"><span className="label">{t(c.l)}</span>
              <span className="kpi-ico"><Icon name={c.icon} size={14} /></span></div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, marginTop: 13, minHeight: 420 }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden', background: 'var(--surface-2)' }}>
          {/* stylised city map */}
          <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <rect width="600" height="400" fill="var(--surface-2)" />
            {[30, 90, 150, 210, 270, 330].map((y) => (
              <path key={y} d={`M0 ${y} H600`} stroke="var(--line-soft)" strokeWidth="7" />
            ))}
            {[70, 170, 260, 350, 450, 540].map((x) => (
              <path key={x} d={`M${x} 0 V400`} stroke="var(--line-soft)" strokeWidth="7" />
            ))}
            {[[20, 20, 120, 60], [200, 100, 90, 90], [340, 40, 150, 110], [430, 200, 120, 70], [80, 300, 140, 60], [300, 290, 100, 80]]
              .map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="var(--surface-3)" opacity=".55" rx="3" />
              ))}
            {/* route */}
            <path d="M204 176 L272 132 L372 120 L426 252" fill="none" stroke="var(--accent)" strokeWidth="2"
                  strokeDasharray="6 4" opacity=".8" />
            {/* restaurant */}
            <g>
              <circle cx="204" cy="176" r="14" fill="var(--accent-soft)" />
              <circle cx="204" cy="176" r="6" fill="var(--accent)" />
              <text x="204" y="156" fill="var(--accent)" fontSize="9" textAnchor="middle" fontWeight="700" fontFamily="var(--f-mono)">FENIX</text>
            </g>
          </svg>
          {FX.couriers.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)}
                    style={{
                      position: 'absolute', left: c.x + '%', top: c.y + '%', transform: 'translate(-50%,-50%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      background: 'none', border: 0, padding: 0, cursor: 'pointer', zIndex: 2,
                    }}>
              <span style={{
                width: sel === c.id ? 34 : 28, height: sel === c.id ? 34 : 28, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                background: c.status === 'free' ? 'var(--ok-soft)' : 'var(--accent-soft)',
                color: c.status === 'free' ? 'var(--ok)' : 'var(--accent)',
                boxShadow: `0 0 0 ${sel === c.id ? 3 : 2}px var(--surface-2), 0 0 0 ${sel === c.id ? 4.5 : 3.5}px ${c.status === 'free' ? 'var(--ok)' : 'var(--accent)'}`,
                transition: 'all .16s var(--ease)',
              }}>
                <Icon name="bike" size={sel === c.id ? 17 : 14} stroke={1.8} />
              </span>
              <span style={{
                fontSize: 8.5, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-2)',
                whiteSpace: 'nowrap', fontFamily: 'var(--f-mono)',
              }}>{c.name.split(' ')[1] || c.name}</span>
            </button>
          ))}
          <div style={{
            position: 'absolute', left: 11, bottom: 11, display: 'flex', gap: 8, padding: '6px 9px',
            background: 'color-mix(in srgb, var(--surface) 88%, transparent)', borderRadius: 'var(--r-sm)',
            border: '1px solid var(--line)', fontSize: 9.5,
          }}>
            <span className="row" style={{ gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: 50, background: 'var(--ok)' }} />{t('free')}</span>
            <span className="row" style={{ gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: 50, background: 'var(--accent)' }} />{t('busy')}</span>
          </div>
        </div>

        <div className="card" style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {active && (
            <>
              <div>
                <div className="label">{t('courier')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <span className="avatar" data-tone={active.status === 'free' ? undefined : 'accent'}>{initials(active.name)}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{active.name}</div>
                    <div className="dim" style={{ fontSize: 10 }}>
                      {active.status === 'free' ? t('free') : `${active.load} ${t('orders')} · ${active.eta}`}
                    </div>
                  </div>
                </div>
              </div>
              {active.job && (
                <>
                  <div className="sect-title" style={{ margin: 0 }}>{t('route')}</div>
                  <div className="card" style={{ padding: 9, background: 'var(--surface-2)' }}>
                    <div className="mono" style={{ fontSize: 10.5, fontWeight: 700 }}>#{active.job}</div>
                    <div className="dim" style={{ fontSize: 10, marginTop: 3 }}>Ниёзбек Йули кўчаси, 1а</div>
                    <div className="row" style={{ marginTop: 7, gap: 4 }}>
                      <Pill tone="ok" dot>ETA {active.eta}</Pill>
                    </div>
                  </div>
                  <Btn icon="phone" onClick={() => toast('Звонок курьеру ' + active.name)}>{t('call_client')}</Btn>
                </>
              )}
              <div className="sect-title" style={{ margin: 0 }}>{t('couriers')}</div>
              <div className="col-flex" style={{ gap: 3 }}>
                {FX.couriers.map((c) => (
                  <button key={c.id} onClick={() => setSel(c.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 7, padding: '6px 7px',
                            borderRadius: 'var(--r-xs)', border: 0, textAlign: 'left',
                            background: sel === c.id ? 'var(--accent-soft)' : 'transparent',
                          }}>
                    <span style={{ width: 6, height: 6, borderRadius: 50, flex: 'none',
                      background: c.status === 'free' ? 'var(--ok)' : 'var(--accent)' }} />
                    <span className="grow trunc" style={{ fontSize: 11, fontWeight: 500 }}>{c.name}</span>
                    <span className="mono dim" style={{ fontSize: 9 }}>{c.load || '—'}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuScreen({ t, toast }) {
  const [data, setData] = useState(FX.menu);
  const [openCats, setOpenCats] = useState({ 'Горячее': true, 'Салаты': true });

  useEffect(() => {
    fetch('/api/admin/menu/stoplist')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok && Array.isArray(res.stopped)) {
          const stopSet = new Set(res.stopped);
          setData((d) =>
            d.map((c) => ({
              ...c,
              items: c.items.map((it) => (stopSet.has(it.n) ? { ...it, on: false, stop: true } : it)),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (cat, i) => {
    let targetDish = null;
    setData((d) =>
      d.map((c) => {
        if (c.cat !== cat) return c;
        return {
          ...c,
          items: c.items.map((it, j) => {
            if (j !== i) return it;
            targetDish = it;
            const nextOn = !it.on;
            return { ...it, on: nextOn, stop: !nextOn };
          }),
        };
      })
    );
    if (targetDish) {
      const willStop = targetDish.on;
      toast(
        willStop ? `${targetDish.n} добавлен в стоп-лист` : `${targetDish.n} включён в меню`,
        willStop ? 'warn' : 'ok'
      );
      fetch('/api/admin/menu/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetDish.n, stop: willStop }),
      }).catch(() => {});
    }
  };
  const total = data.flatMap((c) => c.items);
  const onCount = total.filter((i) => i.on).length;

  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'menu_items', v: total.length, f: `${data.length} категорий`, icon: 'menuBook' },
          { l: 'available', v: onCount, f: 'Доступно к заказу', icon: 'check' },
          { l: 'unavailable', v: total.length - onCount, f: 'В стоп-листе', icon: 'alert', warn: true },
          { l: 'margin', v: '62%', f: 'Средняя маржа по меню', icon: 'chart' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top"><span className="label">{t(c.l)}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.icon} size={14} /></span></div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div className="filters">
        <span className="label">Прайс-лист · обновлён сегодня 09:41</span>
        <span className="grow" />
        <Btn size="sm" icon="plus" onClick={() => toast('Новая позиция меню', 'ok', 'plus')}>{t('create')}</Btn>
        <Btn size="sm" variant="accent" icon="check" onClick={() => toast('Изменения сохранены')}>{t('save')}</Btn>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {data.map((cat, ci) => {
          const open = openCats[cat.cat];
          return (
            <div key={cat.cat}>
              <button onClick={() => setOpenCats((o) => ({ ...o, [cat.cat]: !o[cat.cat] }))}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px',
                        background: 'var(--surface-2)', border: 0, borderTop: ci ? '1px solid var(--line)' : 0,
                        borderBottom: open ? '1px solid var(--line-soft)' : 0, textAlign: 'left',
                      }}>
                <Icon name={open ? 'chevronD' : 'chevronR'} size={12} style={{ color: 'var(--text-3)' }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 'var(--track-label)', textTransform: 'uppercase' }}>{cat.cat}</span>
                <span className="dim mono" style={{ fontSize: 9.5 }}>{cat.items.length}</span>
                <span className="grow" />
                {cat.items.some((i) => !i.on) && <Pill tone="warn">{t('unavailable')}</Pill>}
              </button>
              {open && (
                <table className="tbl">
                  <thead><tr>
                    <th style={{ paddingLeft: 34 }}>Наименование</th><th className="tbl-right">{t('price')}</th>
                    <th className="tbl-right">{t('cost')}</th><th className="tbl-right">{t('margin')}</th>
                    <th style={{ width: 100 }}>{t('available')}</th><th className="tbl-right" style={{ width: 70 }} />
                  </tr></thead>
                  <tbody>
                    {cat.items.map((it, i) => {
                      const margin = Math.round((1 - it.cost / it.p) * 100);
                      return (
                        <tr key={it.n} style={{ cursor: 'default', opacity: it.on ? 1 : .55 }}>
                          <td style={{ paddingLeft: 34 }}>
                            <span className="row" style={{ gap: 6 }}>
                              <span style={{ fontWeight: 600 }}>{it.n}</span>
                              {it.star && <Icon name="star" size={10} style={{ color: 'var(--accent)' }} />}
                            </span>
                          </td>
                          <td className="tbl-right mono" style={{ fontWeight: 600 }}>{summ(it.p)}</td>
                          <td className="tbl-right mono dim">{summ(it.cost)}</td>
                          <td className="tbl-right">
                            <span className="mono" style={{ fontSize: 10.5, color: margin > 55 ? 'var(--ok)' : margin > 40 ? 'var(--warn)' : 'var(--danger)', fontWeight: 600 }}>{margin}%</span>
                          </td>
                          <td>
                            <button onClick={() => toggle(cat.cat, i)}
                                    role="switch" aria-checked={it.on}
                                    style={{
                                      width: 32, height: 18, borderRadius: 99, border: 0, padding: 2,
                                      background: it.on ? 'var(--ok)' : 'var(--surface-hi)',
                                      display: 'flex', justifyContent: it.on ? 'flex-end' : 'flex-start',
                                      transition: 'all .18s var(--ease)',
                                    }}>
                              <span style={{ width: 14, height: 14, borderRadius: 50, background: it.on ? '#fff' : 'var(--text-3)', display: 'block' }} />
                            </button>
                          </td>
                          <td className="tbl-right">
                            <Btn size="sm" variant="ghost" className="btn-icon"><Icon name="edit" size={12} /></Btn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Staff({ t, toast }) {
  const [tab, setTab] = useState('team');
  const roles = [
    { r: 'Диспетчер', p: ['Заказы', 'Брони', 'Курьеры'] },
    { r: 'Менеджер', p: ['Заказы', 'Брони', 'Банкеты', 'Аналитика', 'Меню'] },
    { r: 'Шеф-повар', p: ['Кухня', 'Стоп-лист'] },
    { r: 'Официант', p: ['Зал', 'Брони'] },
    { r: 'Курьер', p: ['Мои доставки'] },
  ];
  return (
    <div className="page">
      <div className="filters" style={{ marginTop: 0 }}>
        <div className="seg">
          <button data-on={tab === 'team' ? '1' : '0'} onClick={() => setTab('team')}>{t('on_shift')}</button>
          <button data-on={tab === 'perm' ? '1' : '0'} onClick={() => setTab('perm')}>{t('permissions')}</button>
        </div>
        <span className="grow" />
        <Btn size="sm" icon="plus" onClick={() => toast('Приглашение отправлено', 'ok', 'users')}>{t('invite')}</Btn>
      </div>

      {tab === 'team' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(238px, 1fr))', gap: 11 }}>
          {FX.staff.map((s) => (
            <div key={s.name} className="card" style={{ padding: 12 }}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <span className="avatar" style={{ width: 33, height: 33, fontSize: 11 }} data-tone={s.status === 'online' ? 'accent' : undefined}>{s.initials}</span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '-.01em' }}>{s.name}</div>
                  <div className="dim" style={{ fontSize: 10 }}>{s.role}</div>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: 50, marginTop: 5, flex: 'none',
                  background: s.status === 'online' ? 'var(--ok)' : s.status === 'busy' ? 'var(--warn)' : 'var(--text-3)' }} />
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                <Pill tone={s.status === 'online' ? 'ok' : s.status === 'busy' ? 'warn' : 'muted'}>{t(s.status)}</Pill>
                <Pill tone="muted"><Icon name="clock" size={9} /> {s.shift}</Pill>
              </div>
              {s.deliver > 0 && (
                <div className="row" style={{ marginTop: 9, paddingTop: 8, borderTop: '1px solid var(--line-soft)', fontSize: 10, color: 'var(--text-2)' }}>
                  <Icon name="bike" size={11} /><span>{s.deliver} {t('active_orders').toLowerCase()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead><tr><th>{t('role')}</th><th>Доступ к разделам</th><th className="tbl-right">{t('access')}</th></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.r} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 600 }}>{r.r}</td>
                  <td><span className="row" style={{ gap: 4, flexWrap: 'wrap' }}>
                    {r.p.map((p) => <Pill key={p} tone="muted">{p}</Pill>)}
                  </span></td>
                  <td className="tbl-right"><Btn size="sm" variant="ghost" icon="edit">{t('edit')}</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Couriers, MenuScreen, Staff });
