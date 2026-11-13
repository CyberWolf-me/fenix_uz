/* ═══════════ ANALYTICS · SETTINGS ═══════════ */

function Analytics({ t }) {
  const hours = FX.revenue.map((_, i) => (11 + i) + ':00');
  const total = FX.revenue.reduce((a, b) => a + b, 0) * 1000;
  const prev = FX.prevRevenue.reduce((a, b) => a + b, 0) * 1000;
  const growth = ((total - prev) / prev) * 100;

  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'revenue_today', v: summ(total), f: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}% ${t('compare')}`, icon: 'wallet', delta: growth },
          { l: 'avg_check', v: summ(186000), f: '−3.2% к прошлой неделе', icon: 'receipt', delta: -3.2 },
          { l: 'completed', v: 96, f: 'Из 104 заказов · 92%', icon: 'check' },
          { l: 'cancellations', v: 8, f: '7.7% от всех заказов', icon: 'x', warn: true },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top"><span className="label">{t(c.l)}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--danger)', background: 'var(--danger-soft)' } : undefined}>
                <Icon name={c.icon} size={14} /></span></div>
            <div className="kpi-body">
              <div className="stat-num">{c.v}</div>
              {c.delta != null && <span className="delta" data-up={c.delta > 0 ? '1' : '0'}>
                <Icon name={c.delta > 0 ? 'arrowUp' : 'arrowDown'} size={10} stroke={2.2} />{Math.abs(c.delta).toFixed(1)}%</span>}
            </div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 12, marginTop: 13 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <div>
              <div className="label">{t('rev_by_hour')}</div>
              <div className="money-lg" style={{ fontSize: 21, marginTop: 2 }}>{summ(total)} <span style={{ fontSize: 10, fontFamily: 'var(--f-body)', fontWeight: 600, color: 'var(--text-3)' }}>сум</span></div>
            </div>
            <span className="grow" />
            <div className="row" style={{ gap: 10, fontSize: 9.5 }}>
              <span className="row" style={{ gap: 4, color: 'var(--text-2)' }}>
                <span style={{ width: 14, height: 2, background: 'var(--accent)', display: 'block', borderRadius: 2 }} />Сегодня
              </span>
              <span className="row" style={{ gap: 4, color: 'var(--text-3)' }}>
                <span style={{ width: 14, height: 2, background: 'var(--text-3)', display: 'block', borderRadius: 2 }} />Неделю назад
              </span>
            </div>
          </div>
          <LineChart
            labels={hours}
            series={[
              { data: FX.prevRevenue, color: 'var(--text-3)', dash: true },
              { data: FX.revenue, color: 'var(--accent)', fill: true },
            ]} height={168} />
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div className="label">{t('kitchen_load')}</div>
          <div className="dim" style={{ fontSize: 10, marginTop: 2, marginBottom: 11 }}>Заказов в час · % загрузки цеха</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {FX.kitchenLoad.slice(-6).map((k) => (
              <div key={k.h} className="row" style={{ gap: 8 }}>
                <span className="mono dim" style={{ fontSize: 9.5, width: 38 }}>{k.h}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: k.load + '%', height: '100%', borderRadius: 99,
                    background: k.load > 85 ? 'var(--danger)' : k.load > 65 ? 'var(--warn)' : 'var(--ok)',
                    transition: 'width .4s var(--ease)',
                  }} />
                </div>
                <span className="mono" style={{ fontSize: 9.5, width: 22, textAlign: 'right', color: 'var(--text-2)' }}>{k.load}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 13, paddingTop: 11, borderTop: '1px solid var(--line-soft)' }}>
            <div className="label">{t('top_items')}</div>
            <div className="col-flex" style={{ marginTop: 7, gap: 6 }}>
              {[['Плов «Феникс»', 34], ['Мясо по-французски', 28], ['Сельдерей с мясом', 19], ['Лапша с тефтелькой', 15]].map(([n, v]) => (
                <div key={n} className="row" style={{ gap: 7, fontSize: 10.5 }}>
                  <span className="grow trunc">{n}</span>
                  <div style={{ width: 52, height: 4, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: (v / 34) * 100 + '%', height: '100%', background: 'var(--accent)', opacity: .8 }} />
                  </div>
                  <span className="mono dim" style={{ fontSize: 9, width: 16, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
        {[
          { l: 'delivery', v: 54, c: 'var(--info)', f: '52% заказов · ср. 28 мин' },
          { l: 'pickup', v: 27, c: 'var(--warn)', f: '26% заказов · ср. 18 мин' },
          { l: 'hall', v: 23, c: 'var(--violet)', f: '22% заказов · ср. 42 мин' },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: 13 }}>
            <div className="row">
              <span className="label">{t(s.l)}</span>
              <span className="grow" />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-2)' }}>{s.v}%</span>
            </div>
            <div style={{ marginTop: 9, height: 5, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: s.v + '%', height: '100%', background: s.c, opacity: .85, borderRadius: 99 }} />
            </div>
            <div className="dim" style={{ fontSize: 9.5, marginTop: 7 }}>{s.f}</div>
          </div>
        ))}
      </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9 }}>
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
        <SettingRow label={t('language_lbl')} hint="Русский · O‘zbekcha · Ўзбекча">
          <div className="seg">
            {[['ru', 'RU'], ['uz', 'UZ'], ['uzc', 'ЎЗ']].map(([k, l]) => (
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
