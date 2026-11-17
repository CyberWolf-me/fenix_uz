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
  if (s.includes('отмен') || s === 'cancelled') return 'cancelled';
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

/* Auth: the server keeps the session in an HttpOnly cookie, so no token is handled here.
   Old builds stored the password in localStorage — wipe it. */
try { localStorage.removeItem('fenix_admin_auth'); sessionStorage.removeItem('fenix_admin_auth'); } catch (_) {}

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

  /* null = still checking with the server */
  const [isAuthenticated, setIsAuthenticated] = useState(null);

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
  const [pendingBookings, setPendingBookings] = useState(0);
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
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  const t = useCallback((k) => (FX_I18N[lang] && FX_I18N[lang][k]) || (FX_I18N.ru[k] || k), [lang]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    setIsAuthenticated(false);
    pushToast('Вы успешно вышли из системы', 'info', 'logOut');
  }, [pushToast]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setIsAuthenticated(!!(d && d.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
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
          const parsedTs = parseDbTime(r.createdAt);
          const createdTs = isNaN(parsedTs) ? Date.now() : parsedTs;
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
            addr: type === 'delivery' ? (stripCoords(r.address) || 'Адрес доставки') : undefined,
            addrRaw: type === 'delivery' ? (r.address || '') : undefined,
            table: type === 'hall' ? (r.address || 'Стол в зале') : undefined,
            elapsed: isNaN(elapsed) ? 3 : elapsed,
            sla: type === 'delivery' ? 45 : 25,
            pay: (r.paymentMethod || '').toLowerCase().includes('налич') ? 'cash' : 'card',
            note: r.comment || '',
            items,
            fee,
            total: r.totalPrice || (itemsTotal > 0 ? itemsTotal + fee : 0),
            createdAt: createdTs,
            isBackend: true,
            courier: r.courier || r.courierName || undefined,
            courierId: r.courierId || undefined,
          };
        }).filter((o) => o.col !== 'cancelled');

        if (!isInitial) {
          mapped.forEach((o) => {
            if (!seenOrderIds.current.has(o.id)) {
              seenOrderIds.current.add(o.id);
              pushToast(`Новый заказ #${o.id}!`, 'ok', 'dpad');
            }
          });
        } else {
          mapped.forEach((o) => seenOrderIds.current.add(o.id));
        }

        // ONLY real orders from SQLite
        setOrders(mapped);
      }
      fetch('/api/admin/shift/current')
        .then(r => r.json())
        .then(d => {
          if (d && d.ok && d.shift) setCurrentShift(d.shift);
        })
        .catch(() => {});
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
        const live = data.reservations.filter((r) => bookingStatus(r.status) !== 'cancelled');
        setBookingsCount(live.filter((r) => isTodayDate(r.date)).length);
        setPendingBookings(live.filter((r) => bookingStatus(r.status) === 'pending').length);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (isAuthenticated !== true) return;
    syncOrders(true);
    syncBookingsCount();
    const interval = setInterval(() => {
      syncOrders(false);
      syncBookingsCount();
    }, 6000);
    return () => clearInterval(interval);
  }, [syncOrders, syncBookingsCount, isAuthenticated]);

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

  const counts = {
    live: orders.filter((o) => o.col !== 'done').length,
    bookings: pendingBookings,
    couriers: orders.filter((o) => o.type === 'delivery' && o.col !== 'done').length,
  };
  const loaded = openOrder ? orders.find((o) => o.id === openOrder.id) || openOrder : null;

  /* New-order alarm: rings every 5 s while any order waits in "New", until someone accepts it */
  const waiting = orders.filter((o) => o.col === 'new').sort((a, b) => a.createdAt - b.createdAt);
  const [alarmMuteUntil, setAlarmMuteUntil] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);
  useEffect(() => {
    if (isAuthenticated !== true || !tw.sound || waiting.length === 0) return;
    const ring = () => {
      if (Date.now() < alarmMuteUntil) return;
      beep('order');
      setTimeout(() => setAudioBlocked(audioState() !== 'running'), 300);
    };
    ring();
    const iv = setInterval(ring, 5000);
    return () => clearInterval(iv);
  }, [isAuthenticated, tw.sound, waiting.length, alarmMuteUntil]);
  useEffect(() => {
    document.title = waiting.length ? `(${waiting.length}) Новый заказ — FENIX` : 'FENIX — Диспетчерская';
  }, [waiting.length]);
  useEffect(() => {
    const unlock = () => unlockAudio().then((st) => setAudioBlocked(st !== 'running'));
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const screens = {
    dispatch: <Dispatch t={t} orders={orders} dispatch={dispatch} view={view} setView={setView}
                        onOpen={setOpenOrder} onAdvance={(o) => advance(o)}
                        onPrint={setPrintOrder} toast={pushToast} lang={lang}
                        bookingsCount={bookingsCount}
                        onUpdateOrder={(updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)).filter((o) => o.col !== 'cancelled'))}
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

  if (isAuthenticated === null) {
    return <div className="auth-boot" aria-busy="true" />;
  }
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
          currentShift={currentShift}
          onOpenShiftModal={() => setShiftModalOpen(true)}
        />
        {waiting.length > 0 && (
          <div className="order-alarm" role="alert">
            <span className="order-alarm-bell" aria-hidden="true"><Icon name="bell" size={16} /></span>
            <div className="order-alarm-txt">
              <b>{waiting.length === 1 ? 'Новый заказ' : `Новых заказов: ${waiting.length}`}</b>
              <span>#{waiting[0].id} · {waiting[0].client} · {summ(waiting[0].total)} сум{waiting[0].type === 'delivery' ? ' · доставка' : ''}</span>
            </div>
            <div className="order-alarm-act">
              {audioBlocked && tw.sound && (
                <Btn size="sm" onClick={() => unlockAudio().then((st) => setAudioBlocked(st !== 'running'))}>Включить звук</Btn>
              )}
              <Btn size="sm" onClick={() => setOpenOrder(waiting[0])}>Открыть</Btn>
              <Btn size="sm" variant="accent" icon="check" onClick={() => advance(waiting[0])}>Принять</Btn>
              {Date.now() >= alarmMuteUntil && tw.sound && (
                <button type="button" className="order-alarm-mute" onClick={() => setAlarmMuteUntil(Date.now() + 120000)} title="Тишина на 2 минуты">Тише 2 мин</button>
              )}
            </div>
          </div>
        )}
        <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {screens[page]}
        </main>
        <ConfirmHost />
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

      <ShiftCloseModal
        isOpen={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        currentUser={currentUser}
        onShiftClosed={(data) => {
          syncOrders(false);
          pushToast(`Смена #${data.closedShift?.shiftNum || ''} успешно сохранена.`, 'ok', 'check');
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
