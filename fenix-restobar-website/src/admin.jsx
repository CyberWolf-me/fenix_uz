/* ═══════════ COURIERS & DELIVERY DISPATCH · REAL MENU & PRICES · STAFF ═══════════ */

// Approximate coordinate map for Tashkent districts & addresses
const TASHKENT_DISTRICT_COORDS = {
  yashnabad: [41.2858, 69.3402], // FENIX Restobar Hub
  mirabad: [41.2985, 69.2789],
  chilanzar: [41.2721, 69.2045],
  yunusabad: [41.3645, 69.2885],
  sergeli: [41.2215, 69.2205],
  shaykhontohur: [41.3255, 69.2395],
  mirzoulugbek: [41.3325, 69.3385],
  olmazar: [41.3515, 69.2215],
  uchtepa: [41.2925, 69.1765],
  center: [41.3111, 69.2797],
};

function getCoordsForAddress(addr) {
  const str = String(addr || '');
  const match = str.match(/([0-9]{2}\.[0-9]+)[\s,]+([0-9]{2}\.[0-9]+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (lat > 40 && lat < 43 && lon > 68 && lon < 71) {
      return [lat, lon];
    }
  }
  const s = str.toLowerCase();
  if (s.includes('чиланзар') || s.includes('chilonzor')) return TASHKENT_DISTRICT_COORDS.chilanzar;
  if (s.includes('юнусабад') || s.includes('yunusobod')) return TASHKENT_DISTRICT_COORDS.yunusabad;
  if (s.includes('мирабад') || s.includes('mirobod')) return TASHKENT_DISTRICT_COORDS.mirabad;
  if (s.includes('сергели') || s.includes('sergeli')) return TASHKENT_DISTRICT_COORDS.sergeli;
  if (s.includes('шайхантахур') || s.includes('shayxontohur')) return TASHKENT_DISTRICT_COORDS.shaykhontohur;
  if (s.includes('улугбек') || s.includes('ulug')) return TASHKENT_DISTRICT_COORDS.mirzoulugbek;
  if (s.includes('яшнабад') || s.includes('yashnobod') || s.includes('хуснобод')) return [41.2890, 69.3350];
  // Default offset around Tashkent center
  const hash = s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) * 0.0008;
  const lngOffset = (((hash * 7) % 100) - 50) * 0.0010;
  return [41.3111 + latOffset, 69.2797 + lngOffset];
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. COURIERS & DELIVERY DISPATCH (Real Orders + Real Tashkent Map)
   ───────────────────────────────────────────────────────────────────────────── */
function Couriers({ t, toast, orders = [] }) {
  const deliveryOrders = orders.filter((o) => o.type === 'delivery');
  const [selId, setSelId] = useState(null);
  const [filterMode, setFilterMode] = useState('active'); // active | all
  const [couriersList, setCouriersList] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('106');
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    fetch('/api/admin/couriers')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok && Array.isArray(res.couriers)) {
          setCouriersList(res.couriers);
          if (res.couriers.length > 0) setSelectedCourier(String(res.couriers[0].user_id));
        }
      })
      .catch(() => {});
  }, []);

  // Find currently active delivery
  const activeDeliveries = deliveryOrders.filter((o) => o.col !== 'done');
  const completedDeliveries = deliveryOrders.filter((o) => o.col === 'done');
  const displayedOrders = filterMode === 'active' ? activeDeliveries : deliveryOrders;

  const currentOrder = deliveryOrders.find((o) => o.id === selId) || displayedOrders[0] || deliveryOrders[0];

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L || !mapRef.current) return;

    if (!leafletInstance.current) {
      const map = window.L.map(mapRef.current, {
        center: [41.2995, 69.3000],
        zoom: 12,
        zoomControl: true,
      });

      // Dark Matter CartoDB tiles
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // FENIX Restobar Hub Marker
      const fenixIcon = window.L.divIcon({
        className: 'fenix-map-pin',
        html: `
          <div style="
            width: 38px; height: 38px; border-radius: 50%;
            background: linear-gradient(135deg, #d3aa63, #b8860b);
            border: 2px solid #fff; box-shadow: 0 0 16px rgba(211, 170, 99, 0.7);
            display: flex; align-items: center; justify-content: center; color: #111;
            font-size: 13px; font-weight: 800; letter-spacing: 0.04em; cursor: pointer;
            font-family: var(--f-body, sans-serif);
          ">FX</div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      window.L.marker(TASHKENT_DISTRICT_COORDS.yashnabad, { icon: fenixIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; color: #111; padding: 4px;">
            <b style="color: #b8860b;">FENIX Restobar & Lounge</b><br/>
            <span>Яшнабадский район, 5-й проезд Хуснобод, 1</span><br/>
            <small style="color: #666;">Центр отправки заказов</small>
          </div>
        `);

      leafletInstance.current = map;
    }

    const map = leafletInstance.current;

    // Clear old order markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Add marker for each delivery order
    deliveryOrders.forEach((ord) => {
      const coords = getCoordsForAddress(ord.addr);
      const isSel = currentOrder && currentOrder.id === ord.id;
      const isDone = ord.col === 'done';

      const orderIcon = window.L.divIcon({
        className: 'order-map-pin',
        html: `
          <div style="
            width: ${isSel ? 36 : 28}px; height: ${isSel ? 36 : 28}px; border-radius: 50%;
            background: ${isDone ? '#57a877' : isSel ? '#d3aa63' : '#4a7fc1'};
            border: 2px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center; color: #fff;
            cursor: pointer; transition: all 0.2s ease;
          ">
            <svg width="${isSel ? 18 : 14}" height="${isSel ? 18 : 14}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M14 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M6 13l3.5-5.5H13 M9.5 7.5 12 13 M13 5h3"/>
            </svg>
          </div>
        `,
        iconSize: [isSel ? 36 : 28, isSel ? 36 : 28],
        iconAnchor: [isSel ? 18 : 14, isSel ? 18 : 14],
      });

      const marker = window.L.marker(coords, { icon: orderIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #111; padding: 4px; min-width: 170px;">
          <b style="color: #d3aa63;">Заказ #${ord.id}</b><br/>
          <b>${ord.client || 'Клиент'}</b> · ${ord.phone || '—'}<br/>
          <span style="font-size: 11px; color: #444;">${ord.addr || 'Адрес доставки'}</span><br/>
          <b>${summ(ord.total)} сум</b>
        </div>
      `);

      marker.on('click', () => setSelId(ord.id));
      markersRef.current.push(marker);
    });

    // If current order selected, pan to it
    if (currentOrder && currentOrder.addr) {
      const targetCoords = getCoordsForAddress(currentOrder.addr);
      map.setView(targetCoords, 14, { animate: true });
    }
  }, [deliveryOrders, selId, currentOrder]);

  const advanceDeliveryStatus = async (ord, nextCol, nextRu) => {
    try {
      await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ord.dbId,
          orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, '')),
          status: nextRu,
        }),
      });
      ord.col = nextCol;
      toast(`Заказ #${ord.id} переведён в статус "${nextRu}"`, 'ok', 'check');
    } catch (e) {
      toast('Ошибка обновления статуса: ' + e.message, 'err');
    }
  };

  const dispatchToCourierTelegram = async (ord) => {
    try {
      const courier = couriersList.find((c) => String(c.user_id) === String(selectedCourier));
      const res = await fetch('/api/admin/orders/dispatch-courier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ord.dbId,
          orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, '')),
          courierId: selectedCourier,
          courierName: courier ? courier.full_name : 'Курьер Fenix',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        ord.col = 'way';
        toast(`Заказ #${ord.id} отправлен в Telegram курьеру с маршрутом!`, 'ok', 'truck');
      }
    } catch (e) {
      toast('Ошибка отправки курьеру: ' + e.message, 'err');
    }
  };

  return (
    <div className="page">
      {/* Real KPI Row */}
      <div className="kpis">
        {[
          { l: 'Всего доставок', v: deliveryOrders.length, f: 'Заказов курьером из базы', icon: 'truck' },
          { l: 'В пути к клиенту', v: deliveryOrders.filter((o) => o.col === 'way').length, f: 'Передано курьеру', icon: 'bike', warn: true },
          { l: 'Успешно доставлено', v: completedDeliveries.length, f: 'Выполненные заказы', icon: 'check' },
          { l: 'База Fenix Hub', v: 'Яшнабад', f: 'ул. Хуснобод 5-й проезд, 1', icon: 'pin' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top">
              <span className="label">{c.l}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.icon} size={14} />
              </span>
            </div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      {/* Main Delivery Layout: Interactive Map + Real Orders List */}
      <div className="couriers-layout">
        {/* Left: Map of Tashkent */}
        <div className="card" style={{ position: 'relative', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            position: 'absolute', top: 12, left: 14, zIndex: 999,
            background: 'rgba(18, 17, 13, 0.88)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--line-strong)', borderRadius: '10px',
            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>Ташкент · Карта логистики Fenix</span>
          </div>

          {/* Leaflet DOM container */}
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 480, background: '#0b0a08' }} />

          {/* Legend bar */}
          <div style={{
            position: 'absolute', bottom: 12, left: 14, zIndex: 999,
            background: 'rgba(18, 17, 13, 0.92)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--line)', borderRadius: '8px',
            padding: '6px 12px', display: 'flex', gap: 14, fontSize: 11
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d3aa63' }} /> FENIX Hub
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a7fc1' }} /> На доставке
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#57a877' }} /> Доставлен
            </span>
          </div>
        </div>

        {/* Right: Active Delivery Orders List & Selected Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="label" style={{ margin: 0 }}>Заказы:</span>
            <button
              className="chip"
              data-on={filterMode === 'active' ? '1' : '0'}
              onClick={() => setFilterMode('active')}
            >
              Активные ({activeDeliveries.length})
            </button>
            <button
              className="chip"
              data-on={filterMode === 'all' ? '1' : '0'}
              onClick={() => setFilterMode('all')}
            >
              Все ({deliveryOrders.length})
            </button>
          </div>

          {/* Selected Order Card */}
          {currentOrder ? (
            <div className="card" style={{ padding: 14, border: '1px solid var(--line-strong)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div className="label">Выбранный заказ</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--f-mono)', color: 'var(--accent-2)' }}>
                    #{currentOrder.id}
                  </div>
                </div>
                <Pill tone={currentOrder.col === 'done' ? 'ok' : currentOrder.col === 'way' ? 'info' : 'warn'}>
                  {currentOrder.col === 'done' ? 'Доставлен' : currentOrder.col === 'way' ? 'В пути' : 'Кухня готовит'}
                </Pill>
              </div>

              <div style={{ fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 }}>
                <div><b>Клиент:</b> {currentOrder.client}</div>
                <div><b>Телефон:</b> <a href={`tel:${currentOrder.phone}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{currentOrder.phone}</a></div>
                <div style={{ marginTop: 4, padding: '6px 8px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <b>Адрес:</b> {currentOrder.addr || 'Ташкент'}
                </div>
                <div style={{ marginTop: 6 }}>
                  <b>Сумма:</b> <span className="mono" style={{ color: 'var(--accent-2)', fontWeight: 700 }}>{summ(currentOrder.total)} сум</span>
                  <span className="dim" style={{ marginLeft: 8 }}>({currentOrder.pay === 'cash' ? 'Наличными' : 'Картой'})</span>
                </div>
              </div>

              {/* Courier Assignment Selector (Option A) */}
              <div style={{ marginTop: 4, marginBottom: 10, padding: '8px 10px', background: 'var(--surface-3)', borderRadius: 8, border: '1px solid var(--line)' }}>
                <div className="label" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="bike" size={12} /> Назначить курьера (Telegram Bot):
                </div>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  style={{
                    width: '100%', height: 32, borderRadius: 6, border: '1px solid var(--line)',
                    background: 'var(--surface)', color: 'var(--text)', fontSize: 12, padding: '0 8px', outline: 'none'
                  }}
                >
                  {couriersList.map((c) => (
                    <option key={c.user_id} value={c.user_id}>
                      {c.full_name} ({c.role === 'courier' ? 'Курьер' : c.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons for Selected Order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {currentOrder.col !== 'way' && currentOrder.col !== 'done' && (
                  <Btn size="sm" variant="accent" icon="bike" onClick={() => dispatchToCourierTelegram(currentOrder)}>
                    🚀 Передать курьеру в Telegram (В пути)
                  </Btn>
                )}

                {currentOrder.col === 'way' && (
                  <Btn size="sm" variant="accent" icon="check" onClick={() => advanceDeliveryStatus(currentOrder, 'done', 'доставлен')}>
                    Подтвердить доставку клиенту
                  </Btn>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <a
                    href={`https://yandex.uz/maps/?rtext=41.2858,69.3402~${getCoordsForAddress(currentOrder.addr)[0]},${getCoordsForAddress(currentOrder.addr)[1]}&rtt=auto`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface-3)' }}
                  >
                    <Icon name="pin" size={13} /> Яндекс Карты
                  </a>
                  <a
                    href={`yandexnavi://build_route_on_map?lat_to=${getCoordsForAddress(currentOrder.addr)[0]}&lon_to=${getCoordsForAddress(currentOrder.addr)[1]}`}
                    className="btn btn-sm"
                    title="Запустить приложение Яндекс.Навигатор"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface-3)' }}
                  >
                    🧭 Навигатор
                  </a>
                </div>

                <a
                  href={`tel:${currentOrder.phone}`}
                  className="btn btn-sm"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--surface-3)' }}
                >
                  <Icon name="phone" size={13} /> Позвонить клиенту
                </a>
              </div>
            </div>
          ) : null}

          {/* Orders Scroll List */}
          <div className="card" style={{ flex: 1, padding: '10px 12px', overflowY: 'auto', maxHeight: '340px' }}>
            <div className="label" style={{ marginBottom: 8 }}>Список доставок ({displayedOrders.length})</div>
            {displayedOrders.length === 0 ? (
              <div className="empty" style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                Нет заказов в этой категории
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {displayedOrders.map((o) => {
                  const isSel = currentOrder && currentOrder.id === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelId(o.id)}
                      style={{
                        padding: '9px 10px', borderRadius: '8px', border: '1px solid ' + (isSel ? 'var(--accent)' : 'var(--line)'),
                        background: isSel ? 'var(--accent-soft)' : 'var(--surface)', textAlign: 'left',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12, color: isSel ? 'var(--accent-2)' : 'var(--text)' }}>
                          #{o.id}
                        </span>
                        <Pill tone={o.col === 'done' ? 'ok' : o.col === 'way' ? 'info' : 'warn'}>
                          {o.col === 'done' ? 'Доставлен' : o.col === 'way' ? 'В пути' : 'Кухня'}
                        </Pill>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-2)' }} className="trunc">
                        {o.client} · {o.addr || 'Адрес доставки'}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                        {summ(o.total)} сум
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. REAL MENU SCREEN (Aligned Prices · Real Dishes · Stop-List Controls)
   ───────────────────────────────────────────────────────────────────────────── */
function MenuScreen({ t, toast }) {
  const [data, setData] = useState(FX.menu);
  const [openCats, setOpenCats] = useState({});
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('all'); // all | europe | korea | bar
  const [editDish, setEditDish] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // Sync stop-list from SQLite backend
  useEffect(() => {
    fetch('/api/admin/menu/stoplist')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok && Array.isArray(res.stopped)) {
          const stopSet = new Set(res.stopped.map((s) => String(s).toLowerCase().trim()));
          setData((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.map((it) => {
                const isStop = stopSet.has(String(it.n).toLowerCase().trim());
                return { ...it, on: !isStop, stop: isStop };
              }),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Initialize all categories as expanded by default
  useEffect(() => {
    const o = {};
    data.forEach((c) => { o[c.cat] = true; });
    setOpenCats(o);
  }, [data.length]);

  const toggleStopList = (catName, dishIndex, dish) => {
    const willStop = dish.on; // if currently ON, toggling stops it
    setData((d) =>
      d.map((c) => {
        if (c.cat !== catName) return c;
        return {
          ...c,
          items: c.items.map((it, j) => {
            if (j !== dishIndex) return it;
            return { ...it, on: !willStop, stop: willStop };
          }),
        };
      })
    );

    toast(
      willStop ? `"${dish.n}" добавлен в стоп-лист кухни` : `"${dish.n}" возвращён в меню`,
      willStop ? 'warn' : 'ok',
      willStop ? 'alert' : 'check'
    );

    fetch('/api/admin/menu/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: dish.n, stop: willStop }),
    }).catch(() => {});
  };

  const handleSavePrice = () => {
    if (!editDish || !newPrice) return;
    const priceNum = parseInt(String(newPrice).replace(/\D/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast('Введите корректную сумму', 'err');
      return;
    }

    setData((d) =>
      d.map((c) => ({
        ...c,
        items: c.items.map((it) => (it.n === editDish.n ? { ...it, p: priceNum } : it)),
      }))
    );

    toast(`Цена "${editDish.n}" изменена на ${summ(priceNum)} сум`, 'ok', 'check');
    setEditDish(null);
  };

  // Filtered categories and dishes
  const allDishes = data.flatMap((c) => c.items);
  const totalCount = allDishes.length;
  const inStockCount = allDishes.filter((i) => i.on).length;
  const stoppedCount = totalCount - inStockCount;

  const filteredCategories = data
    .filter((c) => {
      if (activeCuisine === 'europe' && c.menuType !== 'europe') return false;
      if (activeCuisine === 'korea' && c.menuType !== 'korea') return false;
      if (activeCuisine === 'bar' && c.menuType !== 'bar') return false;
      return true;
    })
    .map((c) => {
      const q = search.trim().toLowerCase();
      if (!q) return c;
      const matched = c.items.filter(
        (it) =>
          it.n.toLowerCase().includes(q) ||
          (it.nUz && it.nUz.toLowerCase().includes(q)) ||
          (it.nEn && it.nEn.toLowerCase().includes(q))
      );
      return { ...c, items: matched };
    })
    .filter((c) => c.items.length > 0);

  return (
    <div className="page">
      {/* Real Statistics KPIs */}
      <div className="kpis">
        {[
          { l: 'Всего позиций в меню', v: totalCount, f: `${data.length} категорий кухни и бара`, icon: 'menuBook' },
          { l: 'В наличии на кухне', v: inStockCount, f: 'Доступно к заказу и доставке', icon: 'check' },
          { l: 'В стоп-листе', v: stoppedCount, f: 'Закончились ингредиенты', icon: 'alert', warn: stoppedCount > 0 },
          { l: 'Разделы меню', v: '3 кухни', f: 'Европейская · Корейская · Бар', icon: 'layers' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top">
              <span className="label">{c.l}</span>
              <span className="kpi-ico" style={c.warn ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.icon} size={14} />
              </span>
            </div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      {/* Cuisine Filter & Search Bar */}
      <div className="filters" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            ['all', `Все разделы (${totalCount})`],
            ['europe', 'Европейская кухня'],
            ['korea', 'Корейская кухня'],
            ['bar', 'Барная карта & Напитки'],
          ].map(([id, label]) => (
            <button
              key={id}
              className="chip"
              data-on={activeCuisine === id ? '1' : '0'}
              onClick={() => setActiveCuisine(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="grow" />

        {/* Real-time Search */}
        <div style={{ position: 'relative', width: 260 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex' }}>
            <Icon name="search" size={14} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск блюда..."
            style={{
              width: '100%', height: 34, paddingLeft: 32, paddingRight: 10,
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Menu Categories & Strictly Aligned Price Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filteredCategories.length === 0 ? (
          <div className="empty" style={{ padding: 48, textAlign: 'center' }}>
            <Icon name="search" size={28} />
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-2)' }}>По вашему запросу ничего не найдено</div>
          </div>
        ) : (
          filteredCategories.map((cat, ci) => {
            const open = openCats[cat.cat] !== false;
            return (
              <div key={cat.cat}>
                {/* Category Accordion Header */}
                <button
                  onClick={() => setOpenCats((o) => ({ ...o, [cat.cat]: !open }))}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                    background: 'var(--surface-2)', border: 0, borderTop: ci ? '1px solid var(--line)' : 0,
                    borderBottom: open ? '1px solid var(--line-soft)' : 0, textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <Icon name={open ? 'chevronD' : 'chevronR'} size={13} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 'var(--track-label)', textTransform: 'uppercase', color: 'var(--accent-2)' }}>
                    {cat.cat}
                  </span>
                  <span className="dim mono" style={{ fontSize: 10.5, marginLeft: 4 }}>
                    {cat.items.length} поз.
                  </span>
                  <span className="grow" />
                  {cat.items.some((i) => !i.on) && (
                    <Pill tone="warn">Есть позиции в стоп-листе</Pill>
                  )}
                </button>

                {open && (
                  <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table
                      className="tbl"
                      style={{
                        tableLayout: 'fixed',
                        width: '100%',
                        minWidth: 540,
                        borderCollapse: 'collapse',
                      }}
                    >
                    <colgroup>
                      <col style={{ width: '42%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '8%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 34, textAlign: 'left' }}>Наименование блюда</th>
                        <th style={{ textAlign: 'left' }}>Раздел меню</th>
                        <th style={{ textAlign: 'right', paddingRight: 24 }}>Цена</th>
                        <th style={{ textAlign: 'center' }}>Статус</th>
                        <th style={{ textAlign: 'center' }}>В продаже</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((it, i) => (
                        <tr
                          key={it.n}
                          style={{
                            cursor: 'default',
                            opacity: it.on ? 1 : 0.55,
                            background: it.on ? 'transparent' : 'rgba(213, 97, 79, 0.05)',
                          }}
                        >
                          {/* Dish Name */}
                          <td style={{ paddingLeft: 34, textAlign: 'left' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text)' }}>
                                {it.n}
                              </span>
                              {it.nUz && (
                                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                                  uz: {it.nUz}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Cuisine / Section */}
                          <td style={{ textAlign: 'left' }}>
                            <span className="dim" style={{ fontSize: 11 }}>
                              {it.section || cat.section || 'Кухня'}
                            </span>
                          </td>

                          {/* Price: Perfectly Right-Aligned With Tabular Figures */}
                          <td
                            style={{
                              textAlign: 'right',
                              paddingRight: 24,
                              fontFamily: 'var(--f-mono)',
                              fontVariantNumeric: 'tabular-nums',
                              fontWeight: 700,
                              fontSize: 12.5,
                              color: 'var(--accent-2)',
                            }}
                          >
                            <span
                              onClick={() => { setEditDish(it); setNewPrice(it.p); }}
                              title="Нажмите, чтобы изменить цену"
                              style={{ cursor: 'pointer', borderBottom: '1px dashed var(--line-strong)' }}
                            >
                              {summ(it.p)} сум
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td style={{ textAlign: 'center' }}>
                            <Pill tone={it.on ? 'ok' : 'danger'}>
                              {it.on ? 'В наличии' : 'Стоп-лист'}
                            </Pill>
                          </td>

                          {/* Toggle Switch */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                onClick={() => toggleStopList(cat.cat, i, it)}
                                role="switch"
                                aria-checked={it.on}
                                title={it.on ? 'Поместить в стоп-лист' : 'Вернуть в продажу'}
                                style={{
                                  width: 34, height: 19, borderRadius: 99, border: 0, padding: 2,
                                  background: it.on ? 'var(--ok)' : 'var(--surface-hi)',
                                  display: 'flex', justifyContent: it.on ? 'flex-end' : 'flex-start',
                                  cursor: 'pointer', transition: 'all .18s var(--ease)',
                                }}
                              >
                                <span
                                  style={{
                                    width: 15, height: 15, borderRadius: '50%',
                                    background: it.on ? '#fff' : 'var(--text-3)', display: 'block',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                  }}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            );
          })
        )}
      </div>

      {/* Price Edit Modal */}
      {editDish && (
        <div className="scrim" onClick={() => setEditDish(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 360, padding: 22, background: 'var(--surface-2)', border: '1px solid var(--line-strong)' }}
          >
            <div className="label">Редактирование цены</div>
            <div style={{ fontSize: 16, fontWeight: 700, margin: '6px 0 16px', color: 'var(--accent-2)' }}>
              {editDish.n}
            </div>

            <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
              Новая стоимость (в сумах):
            </label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              autoFocus
              style={{
                width: '100%', height: 42, padding: '0 12px',
                background: 'var(--surface)', border: '1px solid var(--line-strong)',
                borderRadius: '8px', color: 'var(--text)', fontSize: 15, fontFamily: 'var(--f-mono)',
                outline: 'none', boxSizing: 'border-box', marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditDish(null)}>Отмена</button>
              <Btn size="sm" variant="accent" icon="check" onClick={handleSavePrice}>Сохранить цену</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. STAFF (Operational Team)
   ───────────────────────────────────────────────────────────────────────────── */
function Staff({ t, toast }) {
  const [team, setTeam] = useState(FX.staff);

  const fetchStaff = () => {
    fetch('/api/admin/staff')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.staff) && data.staff.length > 0) {
          const mapped = data.staff.map((s) => {
            const initials = s.full_name
              ? s.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              : '??';
            return {
              name: s.full_name,
              role: s.role,
              shift: '11:00 – 23:00',
              status: 'online',
              initials,
              phone: s.user_name ? '@' + s.user_name : '+998 90 019 57 65',
            };
          });
          setTeam(mapped);
        }
      })
      .catch((err) => console.error('Staff fetch error:', err));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInvite = () => {
    const name = window.prompt('Введите ФИО сотрудника (например: Иброхимов А.):');
    if (!name || !name.trim()) return;
    const role = window.prompt('Должность (Диспетчер, Шеф-повар, Менеджер, Официант, Курьер):', 'Официант');
    if (!role || !role.trim()) return;

    fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name.trim(), role: role.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          toast(`Сотрудник ${name.trim()} добавлен в смену`, 'ok', 'users');
          fetchStaff();
        }
      })
      .catch((err) => toast('Ошибка добавления: ' + err.message, 'err'));
  };

  return (
    <div className="page">
      <div className="kpis">
        {[
          { l: 'Сотрудников на смене', v: team.length, f: 'Персонал Fenix Restobar', icon: 'users' },
          { l: 'Статус смены', v: '11:00 – 23:00', f: 'Основная смена ресторана', icon: 'clock' },
          { l: 'Кухня & Сервис', v: 'Активны', f: 'Все цеха работают', icon: 'check' },
        ].map((c) => (
          <div className="card kpi" key={c.l}>
            <div className="kpi-top">
              <span className="label">{c.l}</span>
              <span className="kpi-ico"><Icon name={c.icon} size={14} /></span>
            </div>
            <div className="kpi-body"><div className="stat-num">{c.v}</div></div>
            <div className="kpi-foot"><span className="trunc">{c.f}</span></div>
          </div>
        ))}
      </div>

      <div className="filters">
        <span className="label">Персонал смены Fenix</span>
        <span className="grow" />
        <Btn size="sm" variant="accent" icon="plus" onClick={handleInvite}>Добавить сотрудника</Btn>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '35%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ paddingLeft: 24, textAlign: 'left' }}>Сотрудник</th>
              <th style={{ textAlign: 'left' }}>Должность</th>
              <th style={{ textAlign: 'left' }}>График / Смена</th>
              <th style={{ textAlign: 'center' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.name}>
                <td style={{ paddingLeft: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="avatar" data-tone="accent">{m.initials}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                      <div className="dim mono" style={{ fontSize: 10.5 }}>{m.phone}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontWeight: 500 }}>{m.role}</span></td>
                <td><span className="mono dim">{m.shift}</span></td>
                <td style={{ textAlign: 'center' }}><Pill tone="ok" dot>На смене</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Couriers, MenuScreen, Staff });
