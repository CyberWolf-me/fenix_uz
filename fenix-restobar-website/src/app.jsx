/* ═══════════ root ═══════════ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "gold",
  "dir": "a",
  "density": "balanced",
  "lang": "ru",
  "rail": false,
  "sound": true,
  "accentOverride": ""
}/*EDITMODE-END*/;

const ACCENTS = {
  gold: [['', 'Золото'], ['#b98d4a', 'Медь'], ['#9aa87a', 'Шалфей'], ['#c98b7a', 'Терракота'], ['#8fa4cd', 'Сталь']],
  graphite: [['', 'Сталь'], ['#6fb3a8', 'Тил'], ['#b6a3d8', 'Лаванда'], ['#d3a04b', 'Янтарь'], ['#d97f8e', 'Роза']],
  oxblood: [['', 'Медь'], ['#d9b06a', 'Латунь'], ['#a8b88d', 'Олива'], ['#c98fa8', 'Пыльная роза'], ['#8fa0c4', 'Слейт']],
  cream: [['', 'Охра'], ['#8a5a2b', 'Сепия'], ['#4a6b52', 'Мох'], ['#3a5f96', 'Индиго'], ['#8c4a52', 'Бордо']],
};

function mapBackendStatusToCol(status) {
  if (!status) return 'new';
  const s = String(status).toLowerCase();
  if (s.includes('выполнен') || s.includes('доставлен') || s.includes('завершен') || s === 'done') return 'done';
  if (s.includes('пути') || s.includes('выдаче') || s === 'way') return 'way';
  if (s.includes('кухн') || s.includes('готов') || s === 'kitchen') return 'kitchen';
  return 'new';
}

function mapOrderType(typeStr, addrStr) {
  const s = (String(typeStr) + ' ' + String(addrStr)).toLowerCase();
  if (s.includes('самовывоз') || s.includes('pickup')) return 'pickup';
  if (s.includes('зал') || s.includes('стол') || s.includes('hall')) return 'hall';
  return 'delivery';
}

const KNOWN_ID_MAP = {
  es_1: { n: 'Селёдка традиционная', p: 85000 },
  es_2: { n: 'Холодец', p: 75000 },
  es_3: { n: 'Овощная нарезка', p: 75000 },
  es_4: { n: 'Маринованное ассорти', p: 75000 },
  es_5: { n: 'Сельдерей с мясом', p: 185000 },
  esa_6: { n: 'Греческий салат', p: 89000 },
  esa_7: { n: 'Хрустящие баклажаны', p: 89000 },
  esa_8: { n: 'Салат «Закусочный»', p: 85000 },
  esa_9: { n: 'Итальянский VERDE', p: 89000 },
  esa_10: { n: 'Цезарь с курицей', p: 85000 },
  em_1: { n: 'Стейк Медальон', p: 285000 },
  em_2: { n: 'Стейк Классический', p: 299000 },
  em_3: { n: 'Стейк Миньон', p: 290000 },
  em_4: { n: 'Стейк Рибай', p: 375000 },
  sh_9: { n: 'Форель на гриле', p: 185000 },
  sh_10: { n: 'Скумбрия на гриле', p: 120000 },
  sh_11: { n: 'Овощи на мангале', p: 75000 },
  sh_12: { n: 'Грибы на мангале', p: 99000 },
  ka_1: { n: 'Ким-паб с сёмгой', p: 79000 },
  ka_2: { n: 'Ким-паб с мясом', p: 75000 },
  ka_3: { n: 'Ким-паб с креветками', p: 85000 },
  ka_4: { n: 'Ким-паб с крабовыми палочками', p: 65000 },
  ka_5: { n: 'Чапче', p: 75000 },
  ks_1: { n: 'Косари', p: 119000 },
  ks_2: { n: 'Мегича', p: 69000 },
  ks_3: { n: 'Чука салат', p: 99000 },
  ks_4: { n: 'Ве-ча', p: 69000 },
  km_1: { n: 'Самгепсаль', p: 200000 },
  km_2: { n: 'Моксаль', p: 240000 },
  km_3: { n: 'Тёк-паль', p: 475000 },
};

function parseOrderItems(raw) {
  if (!raw) return [{ n: 'Специальный заказ', q: 1, p: 0 }];
  if (Array.isArray(raw)) {
    return raw.map((it) => {
      const idKey = it.id || it.n;
      const known = KNOWN_ID_MAP[idKey];
      return {
        n: known ? known.n : (it.n || it.name || 'Блюдо'),
        q: it.q || it.quantity || it.count || 1,
        p: it.p || it.price || (known ? known.p : 0),
      };
    });
  }
  if (typeof raw === 'object') {
    const list = Object.entries(raw).map(([n, q]) => {
      const known = KNOWN_ID_MAP[n];
      const isObj = typeof q === 'object' && q !== null;
      return {
        n: known ? known.n : n,
        q: isObj ? (q.qty || q.count || 1) : (typeof q === 'number' ? q : 1),
        p: isObj ? (q.price || 0) : (known ? known.p : 0),
      };
    });
    if (list.length) return list;
  }
  return [{ n: 'Заказ по меню', q: 1, p: 0 }];
}

// Automatic auth interceptor for admin API requests
if (typeof window !== 'undefined' && !window.__fetchInterceptorInstalled) {
  window.__fetchInterceptorInstalled = true;
  const origFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    try {
      const token = localStorage.getItem('fenix_admin_auth') || sessionStorage.getItem('fenix_admin_auth');
      if (token && typeof input === 'string' && input.startsWith('/api/admin/')) {
        init = Object.assign({}, init);
        init.headers = Object.assign({}, init.headers || {}, { 'X-Admin-Key': token });
      }
    } catch (_) {}
    return origFetch.call(this, input, init);
  };
}

function SwitchOperatorModal({ isOpen, onClose, currentUser, onSelectUser, toast }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/admin/staff')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.ok && Array.isArray(data.staff)) {
            setStaffList(data.staff);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultAdmin = { user_id: 'admin', full_name: 'Администратор Fenix', role: 'Администратор', status: 'online' };
  const allOperators = [defaultAdmin, ...staffList.filter((s) => s.full_name !== 'Администратор Fenix')];

  return (
    <div className="scrim" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 500,
          maxWidth: '95vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: 'var(--surface-2)',
          border: '1px solid var(--line-strong)',
          boxShadow: 'var(--shadow-pop)',
          borderRadius: 14,
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
              Дежурный оператор смены
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
              Выберите сотрудника, который сейчас работает за пультом терминала
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3)', fontSize: 12 }}>
              Загрузка списка персонала...
            </div>
          )}
          {!loading && allOperators.map((s) => {
            const isCurrent = (currentUser?.user_id && String(currentUser.user_id) === String(s.user_id)) || (currentUser?.name === s.full_name);
            const inits = s.full_name
              ? s.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              : '??';
            return (
              <div
                key={s.user_id || s.full_name}
                onClick={() => {
                  onSelectUser({
                    user_id: s.user_id,
                    name: s.full_name,
                    full_name: s.full_name,
                    role: s.role,
                    initials: inits
                  });
                  onClose();
                  toast && toast(`Активный оператор изменён на "${s.full_name}"`, 'ok', 'users');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--line)',
                  background: isCurrent ? 'rgba(211, 170, 99, 0.12)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="avatar" data-tone={isCurrent ? 'accent' : 'muted'}>{inits}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: isCurrent ? 'var(--accent-2)' : 'var(--text)', fontSize: 13 }}>
                      {s.full_name}
                    </div>
                    <div className="dim mono" style={{ fontSize: 11 }}>
                      {s.role} {s.user_name ? `(@${s.user_name})` : ''}
                    </div>
                  </div>
                </div>
                <div>
                  {isCurrent ? (
                    <Pill tone="accent" dot>Активен</Pill>
                  ) : (
                    <Pill tone={s.status === 'online' ? 'ok' : 'muted'}>{s.status === 'online' ? 'На смене' : 'Выходной'}</Pill>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = tw.theme, dir = tw.dir, lang = tw.lang;

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)fenix_admin_auth=([^;]+)/);
      if (match) return true;
      return Boolean(localStorage.getItem('fenix_admin_auth') || sessionStorage.getItem('fenix_admin_auth'));
    } catch (_) {
      return false;
    }
  });

  const [page, setPage] = useState(() => {
    try { return localStorage.getItem('fx.page') || 'dispatch'; } catch (e) { return 'dispatch'; }
  });
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('fx.view') || 'board'; } catch (e) { return 'board'; }
  });
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [cmdk, setCmdk] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, pushToast] = useToasts();
  const now = useTick(1000);
  const seenOrderIds = useRef(new Set());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fenix_current_user');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { user_id: 'admin', name: 'Администратор Fenix', role: 'Администратор', initials: 'АД' };
  });
  const [switchUserModalOpen, setSwitchUserModalOpen] = useState(false);

  const t = useCallback((k) => (FX_I18N[lang] && FX_I18N[lang][k]) || (FX_I18N.ru[k] || k), [lang]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    try {
      localStorage.removeItem('fenix_admin_auth');
      sessionStorage.removeItem('fenix_admin_auth');
      document.cookie = 'fenix_admin_auth=; path=/; max-age=0; SameSite=Lax';
    } catch (_) {}
    setIsAuthenticated(false);
    pushToast('Вы успешно вышли из системы', 'info', 'logOut');
  }, [pushToast]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d && d.authenticated) {
          setIsAuthenticated(true);
        } else {
          const localToken = localStorage.getItem('fenix_admin_auth') || sessionStorage.getItem('fenix_admin_auth');
          if (!localToken) setIsAuthenticated(false);
        }
      })
      .catch(() => {});
  }, []);

  // Live Sync with Backend Orders
  const syncOrders = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.orders)) {
        const mapped = data.orders.map((r) => {
          const type = mapOrderType(r.orderType, r.address);
          const col = mapBackendStatusToCol(r.status);
          const createdTs = r.createdAt ? new Date(r.createdAt.replace(' ', 'T')).getTime() : Date.now();
          const elapsed = Math.max(1, Math.round((Date.now() - createdTs) / 60000));
          const items = parseOrderItems(r.items);
          const itemsTotal = items.reduce((sum, it) => sum + (Number(it.p || 0) * Number(it.q || 1)), 0);
          const fee = type === 'delivery' ? (itemsTotal >= 250000 && itemsTotal > 0 ? 0 : 20000) : 0;
          const id = r.code || `WEB-${r.orderNum || r.id}`;

          return {
            id,
            orderNum: r.orderNum,
            dbId: r.id,
            type,
            col,
            client: r.customerName || 'Клиент',
            phone: r.customerPhone || '—',
            addr: type === 'delivery' ? (r.address || 'Адрес доставки') : undefined,
            table: type === 'hall' ? (r.address || 'Стол в зале') : undefined,
            elapsed: isNaN(elapsed) ? 3 : elapsed,
            sla: type === 'delivery' ? 45 : 25,
            pay: (r.paymentMethod || '').toLowerCase().includes('налич') ? 'cash' : 'card',
            note: '',
            items,
            fee,
            total: r.totalPrice || (itemsTotal > 0 ? itemsTotal + fee : 120000),
            createdAt: createdTs,
            isBackend: true,
            courier: r.courier || r.courierName || undefined,
            courierId: r.courierId || undefined,
          };
        });

        if (!isInitial) {
          mapped.forEach((o) => {
            if (!seenOrderIds.current.has(o.id)) {
              seenOrderIds.current.add(o.id);
              if (tw.sound) beep('alert');
              pushToast(`Новый заказ #${o.id}!`, 'ok', 'dpad');
            }
          });
        } else {
          mapped.forEach((o) => seenOrderIds.current.add(o.id));
        }

        // ONLY real orders from SQLite
        setOrders(mapped);
      }
    } catch (e) {
      console.error('Error syncing orders:', e);
    }
  }, [pushToast, tw.sound]);

  // Sync bookings count for header KPI
  const syncBookingsCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reservations');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.reservations)) {
        setBookingsCount(data.reservations.length);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    syncOrders(true);
    syncBookingsCount();
    const interval = setInterval(() => {
      syncOrders(false);
      syncBookingsCount();
    }, 6000);
    return () => clearInterval(interval);
  }, [syncOrders, syncBookingsCount]);

  /* persist */
  useEffect(() => { try { localStorage.setItem('fx.page', page); } catch (e) {} }, [page]);
  useEffect(() => { try { localStorage.setItem('fx.view', view); } catch (e) {} }, [view]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.dir = dir;
    document.documentElement.dataset.density = tw.density;
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'uz';
  }, [theme, dir, tw.density, lang]);

  /* accent override */
  useEffect(() => {
    const root = document.documentElement;
    if (tw.accentOverride) {
      root.style.setProperty('--accent', tw.accentOverride);
      root.style.setProperty('--accent-soft', tw.accentOverride + '22');
      root.style.setProperty('--accent-glow', tw.accentOverride + '38');
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-soft');
      root.style.removeProperty('--accent-glow');
    }
  }, [tw.accentOverride]);

  /* live SLA escalation */
  const latePrev = useRef(0);
  useEffect(() => {
    const late = orders.filter((o) => o.col !== 'done' && slaState(o).late).length;
    if (late > latePrev.current && tw.sound) beep(late > latePrev.current + 1 ? 'danger' : 'alert');
    latePrev.current = late;
  }, [orders, tw.sound]);

  /* keyboard */
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdk((v) => !v); return; }
      if (e.key === 'Escape') { setCmdk(false); setOpenOrder(null); setPrintOrder(null); setCreateOpen(false); }
      if (['1', '2', '3', '4'].includes(e.key) && page === 'dispatch') {
        const col = ['new', 'kitchen', 'way', 'done'][Number(e.key) - 1];
        pushToast(t(COLUMNS.find((c) => c.id === col).label) + ' · фильтр', 'ok', 'grid');
      }
      if (e.key === 'g') setPage('dispatch');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, t, pushToast]);

  const advance = useCallback(async (o) => {
    const next = { new: 'kitchen', kitchen: 'way', way: 'done', done: 'done' }[o.col];
    const backendStatus = {
      kitchen: 'в кухне',
      way: o.type === 'pickup' ? 'готов к выдаче' : 'в пути',
      done: 'выполнен',
    }[next];

    setOrders((list) =>
      list.map((x) =>
        x.id === o.id ? { ...x, col: next, elapsed: next === 'done' ? x.elapsed : x.elapsed } : x
      )
    );
    pushToast(`#${o.id} → ${t(COLUMNS.find((c) => c.id === next).label)}`, 'ok', next === 'done' ? 'check' : 'arrowRight');
    if (openOrder && openOrder.id === o.id) setOpenOrder({ ...openOrder, col: next });

    if (backendStatus) {
      try {
        await fetch('/api/admin/orders/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: o.dbId,
            orderNum: o.orderNum || parseInt(String(o.id).replace(/\D/g, '')),
            status: backendStatus,
          }),
        });
      } catch (e) {
        console.error('Error advancing order:', e);
      }
    }
  }, [t, pushToast, openOrder]);

  const dispatch = useCallback(async (action, o) => {
    if (action === 'acceptAll') {
      const newOrders = orders.filter((x) => x.col === 'new');
      setOrders((list) => list.map((x) => (x.col === 'new' ? { ...x, col: 'kitchen' } : x)));
      pushToast('Все новые заказы приняты', 'ok', 'check');
      for (const ord of newOrders) {
        try {
          await fetch('/api/admin/orders/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: ord.dbId,
              orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, '')),
              status: 'в кухне',
            }),
          });
        } catch (_) {}
      }
    } else if (action === 'advance') advance(o);
    else if (action === 'print') setPrintOrder(o);
  }, [advance, pushToast, orders]);

  const counts = { live: orders.filter((o) => o.col !== 'done').length };
  const loaded = openOrder ? orders.find((o) => o.id === openOrder.id) || openOrder : null;

  const screens = {
    dispatch: <Dispatch t={t} orders={orders} dispatch={dispatch} view={view} setView={setView}
                        onOpen={setOpenOrder} onAdvance={(o) => advance(o)}
                        onPrint={setPrintOrder} toast={pushToast} lang={lang}
                        bookingsCount={bookingsCount}
                        onUpdateOrder={(updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))}
                        onDeleteOrder={(deletedId) => setOrders((prev) => prev.filter((o) => o.id !== deletedId))} />,
    bookings: <Bookings t={t} toast={pushToast} />,
    banquets: <Banquets t={t} toast={pushToast} />,
    floor: <Floor t={t} toast={pushToast} />,
    couriers: <Couriers t={t} toast={pushToast} orders={orders} />,
    menu: <MenuScreen t={t} toast={pushToast} />,
    staff: <Staff t={t} toast={pushToast} />,
    analytics: <Analytics t={t} orders={orders} />,
    settings: <Settings t={t} theme={theme} setTheme={(v) => setTweak('theme', v)} dir={dir} setDir={(v) => setTweak('dir', v)}
                       lang={lang} setLang={(v) => setTweak('lang', v)} sound={tw.sound} setSound={(v) => setTweak('sound', v)}
                       rail={tw.rail} setRail={(v) => setTweak('rail', v)} />,
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(token, user) => {
          setIsAuthenticated(true);
          if (user) {
            const resolvedUser = {
              user_id: user.username || 'admin',
              name: user.name || 'Администратор Fenix',
              full_name: user.name || 'Администратор Fenix',
              role: user.role || 'Администратор',
              initials: initials(user.name || 'Администратор Fenix')
            };
            setCurrentUser(resolvedUser);
            try { localStorage.setItem('fenix_current_user', JSON.stringify(resolvedUser)); } catch (_) {}
          }
          pushToast(`С возвращением! Добро пожаловать в FENIX OS.`, 'ok', 'check');
        }}
      />
    );
  }

  return (
    <div className="app" data-rail={tw.rail ? '1' : '0'}>
      <Sidebar
        page={page}
        setPage={(p) => { setPage(p); setMobileMenuOpen(false); }}
        rail={tw.rail}
        t={t}
        counts={counts}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        user={currentUser}
        onSwitchUser={() => setSwitchUserModalOpen(true)}
      />
      <div className="main">
        <Topbar
          page={page}
          t={t}
          rail={tw.rail}
          setRail={(v) => setTweak('rail', v)}
          now={now}
          onSearch={() => setCmdk(true)}
          theme={theme}
          setTheme={(v) => setTweak('theme', v)}
          lang={lang}
          setLang={(v) => setTweak('lang', v)}
          onNew={() => setCreateOpen(true)}
          toast={pushToast}
          onLogout={handleLogout}
          onToggleMenu={() => setMobileMenuOpen((v) => !v)}
        />
        <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {screens[page]}
        </main>
        <MobileBottomNav
          page={page}
          setPage={(p) => { setPage(p); setMobileMenuOpen(false); }}
          counts={counts}
          onOpenDrawer={() => setMobileMenuOpen(true)}
        />
      </div>

      {loaded && (
        <OrderDrawer o={loaded} t={t} onClose={() => setOpenOrder(null)}
                     onAdvance={(o) => advance(o)} onPrint={(o) => { setPrintOrder(o); }}
                     onToast={(m) => pushToast(m, 'ok', 'phone')} />
      )}
      {printOrder && <ReceiptModal o={printOrder} t={t} onClose={() => setPrintOrder(null)} />}
      {createOpen && (
        <CreateModal
          t={t}
          onClose={() => setCreateOpen(false)}
          onCreatedOrder={() => {
            syncOrders(false);
            setPage('dispatch');
          }}
          onCreatedBooking={() => {
            setPage('bookings');
          }}
          toast={pushToast}
        />
      )}
      {cmdk && <CommandPalette t={t} onClose={() => setCmdk(false)} go={(p) => { setPage(p); setCmdk(false); }} />}
      <Toasts items={toasts} />

      <SwitchOperatorModal
        isOpen={switchUserModalOpen}
        onClose={() => setSwitchUserModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          try { localStorage.setItem('fenix_current_user', JSON.stringify(u)); } catch (_) {}
        }}
        toast={pushToast}
      />

      {new URLSearchParams(window.location.search).get('tweaks') === '1' && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Тема">
            <TweakSelect label="Тема оформления" value={theme} onChange={(v) => setTweak('theme', v)}
              options={THEMES.map((x) => ({ value: x.id, label: x.label }))} />
            <TweakColor label="Акцент" value={tw.accentOverride}
              options={(ACCENTS[theme] || ACCENTS.gold).map((a) => a[0] || THEME_FALLBACK[theme])}
              onChange={(v) => setTweak('accentOverride', v === THEME_FALLBACK[theme] ? '' : v)} />
          </TweakSection>
          <TweakSection label="Форма">
            <TweakRadio label="Направление" value={dir} onChange={(v) => setTweak('dir', v)}
              options={[['a', 'Luxury'], ['b', 'Медь'], ['c', 'Консоль']]} />
            <TweakRadio label="Плотность" value={tw.density} onChange={(v) => setTweak('density', v)}
              options={[['compact', 'Плотно'], ['balanced', 'Баланс'], ['airy', 'Воздух']]} />
            <TweakToggle label="Свёрнутая панель" value={tw.rail} onChange={(v) => setTweak('rail', v)} />
          </TweakSection>
          <TweakSection label="Операции">
            <TweakRadio label="Язык" value={lang} onChange={(v) => setTweak('lang', v)}
              options={[['ru', 'RU'], ['uz', 'UZ'], ['uzc', 'ЎЗ']]} />
            <TweakToggle label="Звук при просрочке" value={tw.sound} onChange={(v) => setTweak('sound', v)} />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}

const THEME_FALLBACK = { gold: '#d3aa63', graphite: '#78a6dc', oxblood: '#dd9a72', cream: '#9a6f1e' };

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
