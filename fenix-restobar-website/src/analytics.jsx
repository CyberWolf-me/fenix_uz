/* ═══════════ ANALYTICS · SETTINGS ═══════════ */

function Analytics({ t, orders = [] }) {
  const [tab, setTab] = useState('shift'); // 'shift' | '7d' | '30d' | 'archive'
  const [data, setData] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch summary or archive data whenever tab changes
  useEffect(() => {
    setLoading(true);
    if (tab === 'archive') {
      fetch('/api/admin/shifts/history')
        .then(r => r.json())
        .then(d => {
          if (d && d.ok && Array.isArray(d.shifts)) setArchive(d.shifts);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      fetch(`/api/admin/analytics/summary?period=${tab}`)
        .then(r => r.json())
        .then(d => {
          if (d && d.ok) setData(d);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const summary = data?.summary || {
    totalOrders: 0,
    totalRevenue: 0,
    avgCheck: 0,
    completedCount: 0,
    cancelledCount: 0,
    completionRate: 100,
    cashTotal: 0,
    cardTotal: 0,
    deliveryCount: 0,
    pickupCount: 0,
    hallCount: 0
  };

  const hours = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const hourlySeries = hours.map(h => {
    const found = (data?.hourly || []).find(x => x.hour === h);
    return found ? Math.round((found.revenue || 0) / 1000) : 0;
  });

  const topDishes = data?.topDishes || [];
  const maxDish = topDishes.length > 0 ? Math.max(...topDishes.map(x => x.count)) : 1;

  // 7-day daily series
  const dailyList = data?.daily || [];
  const maxDailyRev = dailyList.length > 0 ? Math.max(...dailyList.map(x => x.revenue || 0), 100000) : 100000;

  return (
    <div className="page">
      {/* 4 Views Sub-Navigation Bar */}
      <div className="analytics-subnav">
        {[
          { id: 'shift', label: t('analytics_current_shift') },
          { id: '7d', label: t('analytics_7_days') },
          { id: '30d', label: t('analytics_30_days') },
          { id: 'archive', label: t('analytics_archive') },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            className="analytics-tab-btn"
            data-active={tab === item.id ? '1' : '0'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>
          Загрузка аналитических данных...
        </div>
      ) : tab === 'archive' ? (
        /* 4. Saved Shifts Archive View */
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="label">Архив закрытых смен</div>
              <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>
                История всех завершённых смен ресторана FENIX с разбивкой по кассе
              </div>
            </div>
            <span className="grow" />
            <span className="badge">{archive.length} смен в архиве</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="shift-archive-tbl">
              <thead>
                <tr>
                  <th>Смена</th>
                  <th>Открыта</th>
                  <th>Закрыта</th>
                  <th>Кто закрыл</th>
                  <th style={{ textAlign: 'right' }}>Чеков</th>
                  <th style={{ textAlign: 'right' }}>Наличные</th>
                  <th style={{ textAlign: 'right' }}>Карты / Онлайн</th>
                  <th style={{ textAlign: 'right' }}>Итого выручка</th>
                </tr>
              </thead>
              <tbody>
                {archive.map(s => (
                  <tr key={s.id}>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                      #{s.shift_num}
                    </td>
                    <td>{s.opened_at ? new Date(s.opened_at.replace(' ', 'T')).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{s.closed_at ? new Date(s.closed_at.replace(' ', 'T')).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>
                      {s.auto_closed === 1 ? (
                        <span className="pill" style={{ background: 'var(--warn-soft)', color: 'var(--warn)', fontSize: 9.5, padding: '2px 6px', borderRadius: 4 }}>
                          Авто (04:00)
                        </span>
                      ) : (
                        <span>{s.closed_by || 'Администратор'}</span>
                      )}
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{s.total_orders || 0}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--ok)' }}>{summ(s.cash_total || 0)}</td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--info)' }}>{summ(s.card_total || 0)}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                      {summ(s.total_revenue || 0)} <small style={{ fontSize: 9.5 }}>сум</small>
                    </td>
                  </tr>
                ))}
                {!archive.length && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-3)' }}>
                      Закрытых смен пока нет. Текущая смена активна.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === '7d' ? (
        /* 2. Last 7 Days View */
        <>
          <div className="kpis">
            {[
              { l: 'Выручка за 7 дней', v: summ(summary.totalRevenue), f: `${summary.totalOrders} чеков`, icon: 'wallet' },
              { l: 'Средний чек (7д)', v: summ(summary.avgCheck), f: 'За заказ', icon: 'receipt' },
              { l: 'Наличные в кассу', v: summ(summary.cashTotal), f: 'От курьеров и самовывоза', icon: 'check' },
              { l: 'Онлайн / Карты', v: summ(summary.cardTotal), f: 'Безналичные платежи', icon: 'card' },
            ].map(c => (
              <div className="card kpi" key={c.l}>
                <div className="kpi-top">
                  <span className="label">{c.l}</span>
                  <span className="kpi-ico"><Icon name={c.icon} size={14} /></span>
                </div>
                <div className="kpi-body">
                  <div className="stat-num">{c.v}</div>
                </div>
                <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, marginTop: 13 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="label">Сравнение выручки по дням (последние 7 дней)</div>
              <div className="dim" style={{ fontSize: 10, marginTop: 2, marginBottom: 12 }}>
                Ежедневный доход от доставки, самовывоза и зала
              </div>

              <div className="bar-chart-container">
                {dailyList.map(d => {
                  const pct = Math.max(4, Math.round((d.revenue / maxDailyRev) * 100));
                  const dayName = new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' });
                  return (
                    <div className="bar-col" key={d.date}>
                      <div className="bar-val">{d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : '0'}</div>
                      <div className="bar-fill-track">
                        <div className="bar-fill" style={{ height: `${pct}%` }} />
                      </div>
                      <div className="bar-label">{dayName}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="label">Популярные блюда за неделю</div>
              <div className="dim" style={{ fontSize: 10, marginTop: 2, marginBottom: 11 }}>
                Лидеры заказов за 7 дней
              </div>
              <div className="col-flex" style={{ gap: 7, marginTop: 8 }}>
                {topDishes.map(it => (
                  <div key={it.name} className="row" style={{ gap: 7, fontSize: 11 }}>
                    <span className="grow trunc">{it.name}</span>
                    <div style={{ width: 52, height: 4, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${(it.count / maxDish) * 100}%`, height: '100%', background: 'var(--accent)', opacity: 0.8 }} />
                    </div>
                    <span className="mono dim" style={{ fontSize: 9.5, width: 20, textAlign: 'right' }}>{it.count}</span>
                  </div>
                ))}
                {!topDishes.length && (
                  <div className="dim" style={{ fontSize: 11 }}>Нет данных о продажах за период</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : tab === '30d' ? (
        /* 3. Monthly / Year View */
        <>
          <div className="kpis">
            {[
              { l: 'Выручка за 30 дней', v: summ(summary.totalRevenue), f: `${summary.totalOrders} чеков`, icon: 'wallet' },
              { l: 'Средний чек', v: summ(summary.avgCheck), f: 'В среднем за месяц', icon: 'receipt' },
              { l: 'Выполнено заказов', v: summary.completedCount, f: `${summary.completionRate}% успешных`, icon: 'check' },
              { l: 'Отмен заказов', v: summary.cancelledCount, f: 'По всем причинам', icon: 'x', warn: summary.cancelledCount > 0 },
            ].map(c => (
              <div className="card kpi" key={c.l}>
                <div className="kpi-top">
                  <span className="label">{c.l}</span>
                  <span className="kpi-ico" style={c.warn ? { color: 'var(--danger)', background: 'var(--danger-soft)' } : undefined}>
                    <Icon name={c.icon} size={14} />
                  </span>
                </div>
                <div className="kpi-body">
                  <div className="stat-num">{c.v}</div>
                </div>
                <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, marginTop: 13 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="label">Пиковые часы нагрузки (11:00 — 23:00)</div>
              <div className="money-lg" style={{ fontSize: 20, marginTop: 2, marginBottom: 12 }}>
                {summ(summary.totalRevenue)} <small style={{ fontSize: 10, color: 'var(--text-3)' }}>сум за 30 дней</small>
              </div>
              <LineChart
                labels={hours}
                series={[
                  { data: hourlySeries, color: 'var(--accent)', fill: true },
                ]} height={168} />
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="label">Топ позиций меню за 30 дней</div>
              <div className="dim" style={{ fontSize: 10, marginTop: 2, marginBottom: 11 }}>
                Самые заказываемые блюда ресторана
              </div>
              <div className="col-flex" style={{ gap: 7, marginTop: 8 }}>
                {topDishes.map(it => (
                  <div key={it.name} className="row" style={{ gap: 7, fontSize: 11 }}>
                    <span className="grow trunc">{it.name}</span>
                    <div style={{ width: 52, height: 4, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${(it.count / maxDish) * 100}%`, height: '100%', background: 'var(--accent)', opacity: 0.8 }} />
                    </div>
                    <span className="mono dim" style={{ fontSize: 9.5, width: 22, textAlign: 'right' }}>{it.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            {[
              { l: 'delivery', v: summary.deliveryCount, c: 'var(--info)', f: `${summary.totalOrders > 0 ? Math.round((summary.deliveryCount / summary.totalOrders) * 100) : 0}% всех заказов` },
              { l: 'pickup', v: summary.pickupCount, c: 'var(--warn)', f: `${summary.totalOrders > 0 ? Math.round((summary.pickupCount / summary.totalOrders) * 100) : 0}% всех заказов` },
              { l: 'hall', v: summary.hallCount, c: 'var(--violet)', f: `${summary.totalOrders > 0 ? Math.round((summary.hallCount / summary.totalOrders) * 100) : 0}% всех заказов` },
            ].map(s => (
              <div key={s.l} className="card" style={{ padding: 13 }}>
                <div className="row">
                  <span className="label">{t(s.l)}</span>
                  <span className="grow" />
                  <span className="stat-num" style={{ fontSize: 18, color: s.c }}>{s.v}</span>
                </div>
                <div className="dim trunc" style={{ fontSize: 10, marginTop: 4 }}>{s.f}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 1. Current Shift View */
        <>
          <div className="kpis">
            {[
              { l: 'Выручка смены', v: summ(summary.totalRevenue), f: `${summary.totalOrders} чеков за смену`, icon: 'wallet' },
              { l: 'Средний чек', v: summ(summary.avgCheck), f: 'Текущая смена', icon: 'receipt' },
              { l: 'Наличные в кассу', v: summ(summary.cashTotal), f: 'К сдаче курьерами', icon: 'check' },
              { l: 'Карта / Онлайн', v: summ(summary.cardTotal), f: 'Безналичная оплата', icon: 'card' },
            ].map(c => (
              <div className="card kpi" key={c.l}>
                <div className="kpi-top">
                  <span className="label">{c.l}</span>
                  <span className="kpi-ico"><Icon name={c.icon} size={14} /></span>
                </div>
                <div className="kpi-body">
                  <div className="stat-num">{c.v}</div>
                </div>
                <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, marginTop: 13 }}>
            <div className="card" style={{ padding: 14 }}>
              <div className="row" style={{ marginBottom: 12 }}>
                <div>
                  <div className="label">Динамика заказов текущей смены</div>
                  <div className="money-lg" style={{ fontSize: 21, marginTop: 2 }}>
                    {summ(summary.totalRevenue)} <span style={{ fontSize: 10, fontFamily: 'var(--f-body)', fontWeight: 600, color: 'var(--text-3)' }}>сум</span>
                  </div>
                </div>
                <span className="grow" />
                <div className="row" style={{ gap: 10, fontSize: 9.5 }}>
                  <span className="row" style={{ gap: 4, color: 'var(--text-2)' }}>
                    <span style={{ width: 14, height: 2, background: 'var(--accent)', display: 'block', borderRadius: 2 }} />
                    Смена #{data?.currentShift?.shiftNum || 1}
                  </span>
                </div>
              </div>
              <LineChart
                labels={hours}
                series={[
                  { data: hourlySeries, color: 'var(--accent)', fill: true },
                ]} height={168} />
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="label">Блюда текущей смены</div>
              <div className="dim" style={{ fontSize: 10, marginTop: 2, marginBottom: 11 }}>
                Заказы, приготовленные сегодня на кухне
              </div>
              <div className="col-flex" style={{ marginTop: 7, gap: 6 }}>
                {topDishes.map(it => (
                  <div key={it.name} className="row" style={{ gap: 7, fontSize: 10.5 }}>
                    <span className="grow trunc">{it.name}</span>
                    <div style={{ width: 52, height: 4, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${(it.count / maxDish) * 100}%`, height: '100%', background: 'var(--accent)', opacity: 0.8 }} />
                    </div>
                    <span className="mono dim" style={{ fontSize: 9, width: 16, textAlign: 'right' }}>{it.count}</span>
                  </div>
                ))}
                {!topDishes.length && (
                  <div className="dim" style={{ fontSize: 11, padding: '14px 0' }}>
                    В текущей смене блюда ещё не заказывались
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            {[
              { l: 'delivery', v: summary.deliveryCount, c: 'var(--info)', f: `${summary.totalOrders > 0 ? Math.round((summary.deliveryCount / summary.totalOrders) * 100) : 0}% заказов смены` },
              { l: 'pickup', v: summary.pickupCount, c: 'var(--warn)', f: `${summary.totalOrders > 0 ? Math.round((summary.pickupCount / summary.totalOrders) * 100) : 0}% заказов смены` },
              { l: 'hall', v: summary.hallCount, c: 'var(--violet)', f: `${summary.totalOrders > 0 ? Math.round((summary.hallCount / summary.totalOrders) * 100) : 0}% заказов смены` },
            ].map(s => (
              <div key={s.l} className="card" style={{ padding: 13 }}>
                <div className="row">
                  <span className="label">{t(s.l)}</span>
                  <span className="grow" />
                  <span className="stat-num" style={{ fontSize: 18, color: s.c }}>{s.v}</span>
                </div>
                <div className="dim trunc" style={{ fontSize: 10, marginTop: 4 }}>{s.f}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Settings({ t, theme, setTheme, dir, setDir, lang, setLang, sound, setSound, rail, setRail }) {
  const THEME_LABELS = { gold: 'Тёмное золото', graphite: 'Графит', oxblood: 'Оксблад', cream: 'Крем' };
  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="sect-title">{t('appearance_lbl')}</div>
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 9 }}>{t('themes')}</div>
        <div className="theme-grid">
          {THEMES.map((th) => (
            <button key={th.id} onClick={() => setTheme(th.id)}
                    style={{
                      padding: 0, border: '1.5px solid ' + (theme === th.id ? 'var(--accent)' : 'var(--line)'),
                      borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'none',
                      boxShadow: theme === th.id ? '0 0 0 3px var(--accent-soft)' : 'none',
                      transition: 'all var(--dur)',
                    }}>
              <div style={{ height: 52, background: THEME_SWATCH[th.id].bg, display: 'flex', padding: 6, gap: 4 }}>
                <div style={{ width: 13, background: THEME_SWATCH[th.id].s1, borderRadius: 2 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ height: 8, background: THEME_SWATCH[th.id].s1, borderRadius: 2, width: '45%' }} />
                  <div style={{ flex: 1, background: THEME_SWATCH[th.id].s2, borderRadius: 2,
                    borderTop: '2px solid ' + THEME_SWATCH[th.id].accent }} />
                  <div style={{ height: 4, background: THEME_SWATCH[th.id].accent, borderRadius: 2, width: '30%' }} />
                </div>
              </div>
              <div style={{ padding: '6px 8px', fontSize: 10, fontWeight: 600, textAlign: 'left',
                color: theme === th.id ? 'var(--accent)' : 'var(--text-2)' }}>{THEME_LABELS[th.id]}</div>
            </button>
          ))}
        </div>

        <div className="label" style={{ margin: '16px 0 9px' }}>{t('dirs')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
          {DIRECTIONS.map((d) => (
            <button key={d.id} onClick={() => setDir(d.id)}
                    style={{
                      textAlign: 'left', padding: '10px 11px',
                      border: '1.5px solid ' + (dir === d.id ? 'var(--accent)' : 'var(--line)'),
                      borderRadius: 'var(--r-sm)', background: dir === d.id ? 'var(--accent-soft)' : 'var(--surface-2)',
                      transition: 'all var(--dur)',
                    }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 18, height: 18, display: 'grid', placeItems: 'center', flex: 'none',
                  fontFamily: d.id === 'a' ? 'var(--f-display)' : d.id === 'b' ? 'var(--f-body)' : 'var(--f-mono)',
                  fontSize: 11, fontWeight: 700, borderRadius: d.id === 'a' ? 4 : d.id === 'b' ? 6 : 2,
                  background: dir === d.id ? 'var(--accent)' : 'var(--surface-3)',
                  color: dir === d.id ? 'var(--accent-ink)' : 'var(--text-2)',
                }}>Aa</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{d.label}</span>
              </div>
              <div className="dim" style={{ fontSize: 9.5, marginTop: 5, lineHeight: 1.4 }}>{d.note}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="sect-title">{t('ops_prefs')}</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <SettingRow label={t('language_lbl')} hint="Русский · O‘zbekcha · English · Ўзбекча">
          <div className="seg">
            {[['ru', 'RU'], ['uz', 'UZ'], ['en', 'EN'], ['uzc', 'ЎЗ']].map(([k, l]) => (
              <button key={k} data-on={lang === k ? '1' : '0'} onClick={() => setLang(k)} style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>{l}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label={t('sound')} hint="Короткий сигнал, когда заказ выходит за SLA">
          <Toggle on={sound} onChange={setSound} />
        </SettingRow>
        <SettingRow label={t('escalate')} hint="Подсвечивать просроченные карточки красным и поднимать вверх">
          <Toggle on onChange={() => {}} />
        </SettingRow>
        <SettingRow label={t('rail')} hint="Свернуть левое меню до иконок">
          <Toggle on={rail} onChange={setRail} />
        </SettingRow>
        <SettingRow label="Автопечать чеков" hint="Печатать фискальный чек при переводе в «Выполнено»">
          <Toggle on={false} onChange={() => {}} />
        </SettingRow>
      </div>

      <div className="sect-title" style={{ marginTop: 16 }}>Филиал</div>
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Название', 'FENIX RESTORAN'], ['ИНН', FX.restaurant.inn], ['Адрес', FX.restaurant.address], ['Телефон', FX.restaurant.phone]].map(([k, v]) => (
            <div key={k}>
              <div className="label">{k}</div>
              <div style={{ fontSize: 11.5, marginTop: 3, color: 'var(--text-2)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const THEME_SWATCH = {
  gold: { bg: '#0b0a08', s1: '#1e1b13', s2: '#12110d', accent: '#d3aa63' },
  graphite: { bg: '#0c0f13', s1: '#1d232c', s2: '#12161c', accent: '#78a6dc' },
  oxblood: { bg: '#100a0b', s1: '#251a1b', s2: '#171011', accent: '#dd9a72' },
  cream: { bg: '#f4f0e6', s1: '#eae2cf', s2: '#fffdf8', accent: '#9a6f1e' },
};

function SettingRow({ label, hint, children }) {
  return (
    <div className="row" style={{ padding: '11px 14px', borderBottom: '1px solid var(--line-soft)', gap: 14 }}>
      <div className="grow">
        <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
        {hint && <div className="dim" style={{ fontSize: 10, marginTop: 1 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on}
            style={{
              width: 34, height: 19, borderRadius: 99, border: 0, padding: 2, flex: 'none',
              background: on ? 'var(--accent)' : 'var(--surface-hi)',
              display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
              transition: 'all .18s var(--ease)',
            }}>
      <span style={{ width: 15, height: 15, borderRadius: 50, background: on ? 'var(--accent-ink)' : 'var(--text-3)', display: 'block' }} />
    </button>
  );
}

Object.assign(window, { Analytics, Settings, SettingRow, Toggle, THEME_SWATCH });
