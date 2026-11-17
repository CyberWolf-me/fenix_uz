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
  const exact = coordsOf(addr);
  if (exact && exact[0] > 40 && exact[0] < 43 && exact[1] > 68 && exact[1] < 71) return exact;
  const str = String(addr || '');
  const match = str.match(/([0-9]{2}\.[0-9]+)[\s,]+([0-9]{2}\.[0-9]+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (lat > 40 && lat < 43 && lon > 68 && lon < 71) return [lat, lon];
  }
  return null;
}
/* district centre — only used to label an approximate area, never as a delivery point */
function districtOf(addr) {
  const s = String(addr || '').toLowerCase();
  if (s.includes('чиланзар') || s.includes('chilonzor')) return TASHKENT_DISTRICT_COORDS.chilanzar;
  if (s.includes('юнусабад') || s.includes('yunusobod')) return TASHKENT_DISTRICT_COORDS.yunusabad;
  if (s.includes('мирабад') || s.includes('mirobod')) return TASHKENT_DISTRICT_COORDS.mirabad;
  if (s.includes('сергели') || s.includes('sergeli')) return TASHKENT_DISTRICT_COORDS.sergeli;
  if (s.includes('шайхантахур') || s.includes('shayxontohur')) return TASHKENT_DISTRICT_COORDS.shaykhontohur;
  if (s.includes('улугбек') || s.includes('ulug')) return TASHKENT_DISTRICT_COORDS.mirzoulugbek;
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. COURIERS & DELIVERY DISPATCH (Real Orders + Real Tashkent Map)
   ───────────────────────────────────────────────────────────────────────────── */
function Couriers({ t, toast, orders = [] }) {
  const deliveryOrders = orders.filter((o) => o.type === 'delivery');
  const [selId, setSelId] = useState(null);
  const [filterMode, setFilterMode] = useState('active'); // active | all
  const [couriersList, setCouriersList] = useState([]);
  const [courierGroupInfo, setCourierGroupInfo] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState('group');
  const [refreshTick, setRefreshTick] = useState(0);
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);
  const lastPannedIdRef = useRef(null);

  useEffect(() => {
    fetch('/api/admin/couriers')
      .then((r) => r.json())
      .then((res) => {
        if (res && res.ok) {
          if (Array.isArray(res.couriers)) setCouriersList(res.couriers);
          if (res.courierGroup) setCourierGroupInfo(res.courierGroup);
          setSelectedCourier('group');
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

      // OpenStreetMap tiles with dark luxury filter (100% free, no API key required, no watermark)
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: 'fenix-dark-map-tiles',
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
      const exact = getCoordsForAddress(ord.addrRaw || ord.addr);
      const approx = exact ? null : districtOf(ord.addr);
      const coords = exact || approx;
      if (!coords) return; /* no location — shown in the list only */
      const isSel = currentOrder && currentOrder.id === ord.id;
      const isDone = ord.col === 'done';

      const orderIcon = window.L.divIcon({
        className: 'order-map-pin',
        html: `
          <div style="
            width: ${isSel ? 36 : 28}px; height: ${isSel ? 36 : 28}px; border-radius: 50%;
            background: ${isDone ? '#57a877' : isSel ? '#d3aa63' : '#4a7fc1'};
            opacity: ${approx ? 0.55 : 1};
            border: 2px ${approx ? 'dashed' : 'solid'} #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);
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
          <b style="color: #d3aa63;">Заказ #${escHtml(ord.id)}</b><br/>
          <b>${escHtml(ord.client || 'Клиент')}</b> · ${escHtml(ord.phone || '—')}<br/>
          <span style="font-size: 11px; color: #444;">${escHtml(ord.addr || 'Адрес доставки')}</span><br/>
          ${approx ? '<span style="font-size: 11px; color: #b5651d;">Точка не указана — показан район</span><br/>' : ''}
          <b>${summ(ord.total)} сум</b>
        </div>
      `);

      marker.on('click', () => setSelId(ord.id));
      markersRef.current.push(marker);
    });

    // Only pan/fly to order when user explicitly clicks a different order in the list
    if (selId && selId !== lastPannedIdRef.current) {
      lastPannedIdRef.current = selId;
      const target = deliveryOrders.find((o) => o.id === selId);
      const targetCoords = target && (getCoordsForAddress(target.addrRaw || target.addr) || districtOf(target.addr));
      if (targetCoords) map.flyTo(targetCoords, Math.max(map.getZoom(), 14), { duration: 0.8 });
    } else if (!lastPannedIdRef.current && currentOrder && currentOrder.addr) {
      // One-time initial centering on first load
      lastPannedIdRef.current = currentOrder.id;
      const targetCoords = getCoordsForAddress(currentOrder.addrRaw || currentOrder.addr) || districtOf(currentOrder.addr);
      if (targetCoords) map.setView(targetCoords, 13);
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
      setRefreshTick((v) => v + 1);
      toast(`Заказ #${ord.id} переведён в статус "${nextRu}"`, 'ok', 'check');
    } catch (e) {
      toast('Ошибка обновления статуса: ' + e.message, 'err');
    }
  };

  const dispatchToCourierTelegram = async (ord) => {
    try {
      const isGroup = selectedCourier === 'group';
      const courier = isGroup ? null : couriersList.find((c) => String(c.user_id) === String(selectedCourier));
      const res = await fetch('/api/admin/orders/dispatch-courier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ord.dbId,
          orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, '')),
          courierId: selectedCourier,
          courierName: isGroup ? (courierGroupInfo?.title || 'Группа курьеров') : (courier ? courier.full_name : 'Курьер Fenix'),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        ord.col = 'way';
        setRefreshTick((v) => v + 1);
        const targetDesc = isGroup ? 'в группу курьеров FENIX' : `курьеру ${courier ? courier.full_name : ''}`;
        toast(`Заказ #${ord.id} отправлен ${targetDesc}!`, 'ok', 'truck');
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
            <button
              type="button"
              title="Показать Fenix Hub и все точки доставок на одной карте"
              onClick={() => {
                if (leafletInstance.current && markersRef.current.length) {
                  const group = window.L.featureGroup([
                    window.L.marker(TASHKENT_DISTRICT_COORDS.yashnabad),
                    ...markersRef.current
                  ]);
                  leafletInstance.current.fitBounds(group.getBounds().pad(0.2));
                }
              }}
              style={{
                marginLeft: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                color: 'var(--ink)',
                padding: '3px 9px',
                fontSize: 10.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Обзор города
            </button>
          </div>

          {/* Leaflet DOM container */}
          <div ref={mapRef} className="courier-map-el" style={{ width: '100%', height: '100%', background: '#0b0a08' }} />

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
                <Pill tone={currentOrder.col === 'done' ? 'ok' : currentOrder.col === 'way' ? 'info' : currentOrder.col === 'new' ? 'accent' : 'warn'}>
                  {currentOrder.col === 'done' ? 'Доставлен' : currentOrder.col === 'way' ? 'В пути' : currentOrder.col === 'new' ? 'Новый — не принят' : 'Кухня готовит'}
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
                {currentOrder.courier && (
                  <div style={{ marginTop: 8, padding: '5px 8px', background: 'var(--surface)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-2)', fontWeight: 600, fontSize: 12, border: '1px solid var(--line)' }}>
                    <Icon name="bike" size={13} /> Курьер: {currentOrder.courier}
                  </div>
                )}
              </div>

              {/* Courier Assignment Selector (Option 3 & Option A) */}
              <div style={{ marginTop: 4, marginBottom: 10, padding: '8px 10px', background: 'var(--surface-3)', borderRadius: 8, border: '1px solid var(--line)' }}>
                <div className="label" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon name="bike" size={12} /> Назначить доставку (Telegram):
                  </span>
                  {courierGroupInfo?.configured ? (
                    <span style={{ color: 'var(--ok)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} /> Группа активна
                    </span>
                  ) : (
                    <span style={{ color: 'var(--dim)', fontSize: 10 }}>/set_courier_group в чате</span>
                  )}
                </div>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  style={{
                    width: '100%', height: 32, borderRadius: 6, border: '1px solid var(--line)',
                    background: 'var(--surface)', color: 'var(--text)', fontSize: 12, padding: '0 8px', outline: 'none'
                  }}
                >
                  <option value="group">
                    {courierGroupInfo?.configured
                      ? `Группа курьеров (${courierGroupInfo.title || 'Взять заказ'})`
                      : 'Общая группа курьеров (Свободный разбор)'}
                  </option>
                  {couriersList.map((c) => (
                    <option key={c.user_id} value={c.user_id}>
                      {c.full_name} ({c.role === 'courier' ? 'Курьер' : c.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons for Selected Order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selectedCourier !== 'group' ? (
                  <Btn size="sm" variant="accent" icon="bike" onClick={() => dispatchToCourierTelegram(currentOrder)}>
                    {currentOrder.col === 'way' || currentOrder.col === 'done'
                      ? `Отправить курьеру (${couriersList.find((c) => String(c.user_id) === String(selectedCourier))?.full_name || 'Курьер'}) в Telegram`
                      : `Назначить курьеру (${couriersList.find((c) => String(c.user_id) === String(selectedCourier))?.full_name || 'Курьер'}) в Telegram`}
                  </Btn>
                ) : (
                  currentOrder.col !== 'way' && currentOrder.col !== 'done' ? (
                    <Btn size="sm" variant="accent" icon="bike" onClick={() => dispatchToCourierTelegram(currentOrder)}>
                      Передать в общую группу курьеров (Telegram)
                    </Btn>
                  ) : (
                    <Btn size="sm" variant="ghost" icon="bike" onClick={() => dispatchToCourierTelegram(currentOrder)}>
                      Отправить повторно в группу курьеров
                    </Btn>
                  )
                )}

                {currentOrder.col === 'way' && (
                  <Btn size="sm" variant="accent" icon="check" onClick={() => advanceDeliveryStatus(currentOrder, 'done', 'доставлен')}>
                    Подтвердить доставку клиенту
                  </Btn>
                )}

                {(() => { const cc = getCoordsForAddress(currentOrder.addrRaw || currentOrder.addr); const q = encodeURIComponent(stripCoords(currentOrder.addr) + ', Ташкент'); return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {!cc && <div style={{ gridColumn: '1 / -1', fontSize: 11.5, color: 'var(--warn)' }}>Клиент не отметил точку на карте — маршрут по тексту адреса</div>}
                  <a
                    href={cc ? `https://yandex.uz/maps/?rtext=${FENIX_GEO[0]},${FENIX_GEO[1]}~${cc[0]},${cc[1]}&rtt=auto` : `https://yandex.uz/maps/?text=${q}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface-3)' }}
                  >
                    <Icon name="pin" size={13} /> Яндекс Карты
                  </a>
                  <a
                    href={cc ? `yandexnavi://build_route_on_map?lat_to=${cc[0]}&lon_to=${cc[1]}` : `https://www.google.com/maps/search/?api=1&query=${q}`}
                    className="btn btn-sm"
                    title="Запустить приложение Яндекс.Навигатор"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface-3)' }}
                  >
                    <Icon name="pin" size={13} /> {cc ? 'Навигатор' : 'Google Maps'}
                  </a>
                </div>
                ); })()}

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
                        <Pill tone={o.col === 'done' ? 'ok' : o.col === 'way' ? 'info' : o.col === 'new' ? 'accent' : 'warn'}>
                          {o.col === 'done' ? 'Доставлен' : o.col === 'way' ? 'В пути' : o.col === 'new' ? 'Новый' : 'Кухня'}
                        </Pill>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-2)' }} className="trunc">
                        {o.client} · {o.courier ? `Курьер: ${o.courier}` : (o.addr || 'Адрес доставки')}
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDishData, setNewDishData] = useState({
    name: '',
    nameUz: '',
    nameEn: '',
    cuisine: 'europe',
    category: 'starters',
    price: '',
    size: '',
    note: ''
  });

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

    fetch('/api/admin/menu/price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editDish.id, name: editDish.n, price: priceNum })
    }).catch(() => {});

    toast(`Цена "${editDish.n}" сохранена: ${summ(priceNum)} сум`, 'ok', 'check');
    setEditDish(null);
  };

  const handleDeleteDish = async (dish) => {
    if (!dish) return;
    if (!(await fxConfirm(`Удалить блюдо «${dish.n}» из меню? Это действие нельзя отменить.`, { title: 'Удалить блюдо' }))) return;
    try {
      const res = await fetch('/api/admin/menu/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dish.id, name: dish.n })
      });
      const dataRes = await res.json();
      if (dataRes && dataRes.ok) {
        setData((prev) =>
          prev.map((c) => ({
            ...c,
            items: c.items.filter((it) => it.id !== dish.id && it.n !== dish.n)
          })).filter((c) => c.items.length > 0)
        );
        toast(`Блюдо "${dish.n}" удалено из меню`, 'ok', 'trash');
        setEditDish(null);
      } else {
        toast(dataRes?.error || 'Ошибка при удалении блюда', 'err');
      }
    } catch (err) {
      toast('Ошибка соединения с сервером', 'err');
    }
  };

  const handleCreateDish = async () => {
    if (!newDishData.name || !newDishData.price) {
      toast('Укажите название и цену блюда', 'err');
      return;
    }
    const priceNum = parseInt(String(newDishData.price).replace(/\D/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast('Введите корректную сумму', 'err');
      return;
    }

    try {
      const res = await fetch('/api/admin/menu/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDishData.name,
          name_uz: newDishData.nameUz,
          name_en: newDishData.nameEn,
          cuisine: newDishData.cuisine,
          category: newDishData.category,
          price: priceNum,
          size: newDishData.size,
          note: newDishData.note
        })
      });
      const dataRes = await res.json();
      if (dataRes && dataRes.ok) {
        toast(`Блюдо "${newDishData.name}" успешно добавлено в меню!`, 'ok', 'check');
        setIsAddModalOpen(false);
        const addedName = newDishData.name;
        const addedUz = newDishData.nameUz;
        const addedEn = newDishData.nameEn;
        const cuisineLabel = newDishData.cuisine === 'europe' ? 'Европейская кухня' : newDishData.cuisine === 'korea' ? 'Корейская кухня' : 'Барная карта';
        const catMap = {
          starters: 'Закуски', salads: 'Салаты', soups: 'Первые блюда', mains: 'Вторые блюда',
          kebabs: 'Шашлыки кавказские', 'mini-kebabs': 'Маленькие шашлыки', fish: 'Рыбные',
          'grilled-veg': 'Овощные', sides: 'Гарниры', bread: 'Хлеба', soft: 'Напитки',
          flour: 'Мучные изделия', tea: 'Чай', cocktails: 'Коктейли', lemonades: 'Лимонады',
          coffee: 'Кофе', whisky: 'Виски', vodka: 'Водка', beer: 'Пиво', tequila: 'Текила',
          rum: 'Ром', cognac: 'Коньяк', wine: 'Вино', snacks: 'Снеки'
        };
        const secRu = catMap[newDishData.category] || 'Другое';
        const groupKey = `${cuisineLabel} · ${secRu}`;

        const newDishObj = {
          id: dataRes.item?.id || `d-${Date.now()}`,
          n: addedName,
          nUz: addedUz,
          nEn: addedEn,
          p: priceNum,
          cuisine: cuisineLabel,
          section: secRu,
          on: true,
          stop: false
        };

        setData((prev) => {
          const found = prev.find((c) => c.cat === groupKey);
          if (found) {
            return prev.map((c) => (c.cat === groupKey ? { ...c, items: [newDishObj, ...c.items] } : c));
          }
          return [{ cat: groupKey, section: secRu, cuisine: cuisineLabel, menuType: newDishData.cuisine, items: [newDishObj] }, ...prev];
        });

        setActiveCuisine(newDishData.cuisine);

        setNewDishData({
          name: '',
          nameUz: '',
          nameEn: '',
          cuisine: 'europe',
          category: 'starters',
          price: '',
          size: '',
          note: ''
        });
      } else {
        toast(dataRes?.error || 'Ошибка при добавлении блюда', 'err');
      }
    } catch (err) {
      toast('Ошибка соединения с сервером', 'err');
    }
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

        {/* Add Dish Button */}
        <Btn size="sm" variant="accent" icon="plus" onClick={() => setIsAddModalOpen(true)}>
          Добавить блюдо
        </Btn>

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

            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
              <Btn size="sm" variant="danger" icon="trash" onClick={() => handleDeleteDish(editDish)}>Удалить блюдо</Btn>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setEditDish(null)}>Отмена</button>
                <Btn size="sm" variant="accent" icon="check" onClick={handleSavePrice}>Сохранить цену</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {isAddModalOpen && (
        <div className="scrim" onClick={() => setIsAddModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 440, maxWidth: '90vw', padding: 22, background: 'var(--surface-2)', border: '1px solid var(--line-strong)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-2)' }}>Добавить блюдо в меню</div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 0, color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}
              >
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Название блюда (RU) *
                </label>
                <input
                  type="text"
                  placeholder="Например: Стейк Нью-Йорк"
                  value={newDishData.name}
                  onChange={(e) => setNewDishData({ ...newDishData, name: e.target.value })}
                  style={{
                    width: '100%', height: 38, padding: '0 10px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: '8px', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Название (UZ)
                  </label>
                  <input
                    type="text"
                    placeholder="O'zbekcha"
                    value={newDishData.nameUz}
                    onChange={(e) => setNewDishData({ ...newDishData, nameUz: e.target.value })}
                    style={{
                      width: '100%', height: 36, padding: '0 10px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Название (EN)
                  </label>
                  <input
                    type="text"
                    placeholder="English"
                    value={newDishData.nameEn}
                    onChange={(e) => setNewDishData({ ...newDishData, nameEn: e.target.value })}
                    style={{
                      width: '100%', height: 36, padding: '0 10px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Кухня / Раздел *
                  </label>
                  <select
                    value={newDishData.cuisine}
                    onChange={(e) => {
                      const c = e.target.value;
                      const defaultCat = c === 'europe' ? 'starters' : c === 'korea' ? 'starters' : 'cocktails';
                      setNewDishData({ ...newDishData, cuisine: c, category: defaultCat });
                    }}
                    style={{
                      width: '100%', height: 36, padding: '0 8px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    <option value="europe">Европейская кухня</option>
                    <option value="korea">Корейская кухня</option>
                    <option value="bar">Барная карта & Напитки</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Категория *
                  </label>
                  <select
                    value={newDishData.category}
                    onChange={(e) => setNewDishData({ ...newDishData, category: e.target.value })}
                    style={{
                      width: '100%', height: 36, padding: '0 8px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  >
                    {newDishData.cuisine === 'europe' && [
                      ['starters', 'Закуски'],
                      ['salads', 'Салаты'],
                      ['soups', 'Первые блюда'],
                      ['mains', 'Вторые блюда'],
                      ['kebabs', 'Шашлыки кавказские'],
                      ['mini-kebabs', 'Маленькие шашлыки'],
                      ['fish', 'Рыбные'],
                      ['grilled-veg', 'Овощные'],
                      ['sides', 'Гарниры'],
                      ['bread', 'Хлеба'],
                      ['soft', 'Напитки']
                    ].map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}

                    {newDishData.cuisine === 'korea' && [
                      ['starters', 'Закуски'],
                      ['salads', 'Салаты'],
                      ['soups', 'Первые блюда'],
                      ['mains', 'Вторые блюда'],
                      ['flour', 'Мучные изделия'],
                      ['tea', 'Чай']
                    ].map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}

                    {newDishData.cuisine === 'bar' && [
                      ['cocktails', 'Коктейли'],
                      ['lemonades', 'Лимонады'],
                      ['coffee', 'Кофе'],
                      ['whisky', 'Виски'],
                      ['vodka', 'Водка'],
                      ['beer', 'Пиво'],
                      ['tequila', 'Текила'],
                      ['rum', 'Ром'],
                      ['cognac', 'Коньяк'],
                      ['wine', 'Вино'],
                      ['snacks', 'Снеки']
                    ].map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Стоимость (в сумах) *
                  </label>
                  <input
                    type="number"
                    placeholder="Например: 120000"
                    value={newDishData.price}
                    onChange={(e) => setNewDishData({ ...newDishData, price: e.target.value })}
                    style={{
                      width: '100%', height: 36, padding: '0 10px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--f-mono)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                    Порция / Размер
                  </label>
                  <input
                    type="text"
                    placeholder="1 порция / 300 гр / 0.5 л"
                    value={newDishData.size}
                    onChange={(e) => setNewDishData({ ...newDishData, size: e.target.value })}
                    style={{
                      width: '100%', height: 36, padding: '0 10px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>
                  Описание / Состав
                </label>
                <input
                  type="text"
                  placeholder="Ингредиенты, особенности подачи"
                  value={newDishData.note}
                  onChange={(e) => setNewDishData({ ...newDishData, note: e.target.value })}
                  style={{
                    width: '100%', height: 36, padding: '0 10px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: '8px', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => setIsAddModalOpen(false)}>Отмена</button>
                <Btn size="sm" variant="accent" icon="check" onClick={handleCreateDish}>Добавить в меню</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. STAFF (Operational Team & Telegram Integration)
   ───────────────────────────────────────────────────────────────────────────── */
const STAFF_ROLE_OPTIONS = [
  { value: 'Курьер', label: 'Курьер (Служба доставки)', icon: 'bike', group: 'courier' },
  { value: 'Диспетчер', label: 'Диспетчер смены', icon: 'sliders', group: 'mgmt' },
  { value: 'Шеф-повар', label: 'Шеф-повар кухни', icon: 'flame', group: 'kitchen' },
  { value: 'Официант', label: 'Официант зала', icon: 'door', group: 'hall' },
  { value: 'Бармен', label: 'Бармен', icon: 'palette', group: 'hall' },
  { value: 'Менеджер', label: 'Менеджер смены', icon: 'users', group: 'mgmt' },
  { value: 'Администратор', label: 'Администратор', icon: 'star', group: 'mgmt' },
];

const STAFF_SHIFT_OPTIONS = [
  '11:00 – 23:00 (Основная ресторанная)',
  '09:00 – 18:00 (Утренняя смена)',
  '18:00 – 02:00 (Вечерняя / Ночная)',
  'Свободный график'
];

const STAFF_VEHICLE_OPTIONS = [
  'Автомобиль',
  'Скутер / Мотоцикл',
  'Электровелосипед',
  'Пеший курьер'
];

function getRoleIcon(roleName = '') {
  const r = String(roleName).toLowerCase();
  if (r.includes('курьер') || r === 'courier') return 'bike';
  if (r.includes('повар') || r.includes('шеф')) return 'flame';
  if (r.includes('официант') || r.includes('бар')) return 'door';
  if (r.includes('диспетчер')) return 'sliders';
  if (r.includes('менеджер') || r.includes('админ')) return 'users';
  return 'users';
}

function StaffModal({ isOpen, onClose, onSave, initialStaff, toast }) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Курьер');
  const [userName, setUserName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [shift, setShift] = useState('11:00 – 23:00');
  const [status, setStatus] = useState('online');
  const [vehicle, setVehicle] = useState('Автомобиль');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(initialStaff && (initialStaff.id || initialStaff.user_id));

  useEffect(() => {
    if (isOpen) {
      if (initialStaff) {
        setFullName(initialStaff.name || initialStaff.full_name || '');
        setRole(initialStaff.role || 'Курьер');
        setUserName(initialStaff.user_name || '');
        setTelegramId(initialStaff.telegram_id ? String(initialStaff.telegram_id) : '');
        setPhone(initialStaff.phone || '+998 ');
        setShift(initialStaff.shift || '11:00 – 23:00');
        setStatus(initialStaff.status || 'online');
        setVehicle(initialStaff.vehicle || 'Автомобиль');
      } else {
        setFullName('');
        setRole('Курьер');
        setUserName('');
        setTelegramId('');
        setPhone('+998 ');
        setShift('11:00 – 23:00');
        setStatus('online');
        setVehicle('Автомобиль');
      }
      setSubmitting(false);
    }
  }, [isOpen, initialStaff]);

  if (!isOpen) return null;

  const isCourier = role === 'Курьер' || role.toLowerCase().includes('курьер') || role === 'courier';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast('Укажите ФИО сотрудника', 'warn', 'alert');
      return;
    }
    setSubmitting(true);
    try {
      const cleanShift = shift.split(' (')[0].trim();
      const payload = {
        user_id: isEditing ? (initialStaff.id || initialStaff.user_id) : undefined,
        full_name: fullName.trim(),
        role: role.trim(),
        user_name: userName.replace(/^@/, '').trim(),
        telegram_id: telegramId.trim(),
        phone: phone.trim(),
        shift: cleanShift,
        status,
        vehicle: isCourier ? vehicle : '',
      };
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        toast(isEditing ? `Данные сотрудника ${fullName.trim()} обновлены` : `Сотрудник ${fullName.trim()} успешно добавлен`, 'ok', 'check');
        onSave && onSave();
        onClose();
      } else {
        toast('Ошибка сохранения: ' + (data.error || 'Сбой сервера'), 'danger', 'alert');
      }
    } catch (err) {
      toast('Ошибка сети: ' + err.message, 'danger', 'alert');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scrim" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '95vw',
          maxHeight: '92vh',
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
        {/* Header */}
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
              {isEditing ? 'Редактирование сотрудника' : 'Новый сотрудник смены'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
              {isEditing ? `Обновление профиля: ${initialStaff.name || initialStaff.full_name}` : 'Штатное расписание Fenix & интеграция с Telegram-ботом'}
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

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>

            {/* Row 1: Full Name & Role */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ФИО сотрудника *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Иброхимов Алишер"
                  autoFocus
                  required
                  style={{
                    width: '100%', height: 40, padding: '0 12px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Должность *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%', height: 40, padding: '0 12px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13,
                    outline: 'none', boxSizing: 'border-box', cursor: 'pointer'
                  }}
                >
                  {STAFF_ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Courier Telegram Notice & Detailed Connection Card */}
            {isCourier && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.28)',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-2)' }}>
                  <Icon name="bike" size={16} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.02em' }}>
                    Синхронизация с ботом @FenixRestaurantCourierBot
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45 }}>
                  Для курьеров Telegram критически важен: через бота приходят персональные карточки доставки с адресом, составом блюд, суммой и быстрой кнопкой "Заказ доставлен", а также синхронизируется назначение заказов из админ-панели.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                      Telegram @username
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: 10, color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>@</span>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="courier_username"
                        style={{
                          width: '100%', height: 38, padding: '0 12px 0 24px',
                          background: 'var(--surface)', border: '1px solid var(--line-strong)',
                          borderRadius: 8, color: 'var(--text)', fontSize: 12.5, fontFamily: 'var(--f-mono)',
                          outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                      Telegram Chat ID (числовой)
                    </label>
                    <input
                      type="text"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      placeholder="Например: 682194812"
                      style={{
                        width: '100%', height: 38, padding: '0 12px',
                        background: 'var(--surface)', border: '1px solid var(--line-strong)',
                        borderRadius: 8, color: 'var(--text)', fontSize: 12.5, fontFamily: 'var(--f-mono)',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 4 }}>
                      Курьер узнает свой ID командой /start в боте
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                    Транспорт курьера
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    style={{
                      width: '100%', height: 38, padding: '0 12px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: 8, color: 'var(--text)', fontSize: 12.5,
                      outline: 'none', boxSizing: 'border-box', cursor: 'pointer'
                    }}
                  >
                    {STAFF_VEHICLE_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Non-courier Telegram field */}
            {!isCourier && (
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Telegram аккаунт (@username или числовой ID)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: 10, color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>@</span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="username"
                    style={{
                      width: '100%', height: 40, padding: '0 12px 0 24px',
                      background: 'var(--surface)', border: '1px solid var(--line-strong)',
                      borderRadius: 8, color: 'var(--text)', fontSize: 13, fontFamily: 'var(--f-mono)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Phone & Shift */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Контактный телефон *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  style={{
                    width: '100%', height: 40, padding: '0 12px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 13, fontFamily: 'var(--f-mono)',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  График / Смена
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  style={{
                    width: '100%', height: 40, padding: '0 12px',
                    background: 'var(--surface)', border: '1px solid var(--line-strong)',
                    borderRadius: 8, color: 'var(--text)', fontSize: 12.5,
                    outline: 'none', boxSizing: 'border-box', cursor: 'pointer'
                  }}
                >
                  {STAFF_SHIFT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shift Status */}
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Статус сотрудника
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setStatus('online')}
                  style={{
                    flex: 1, height: 38, borderRadius: 8,
                    border: status === 'online' ? '1px solid var(--ok)' : '1px solid var(--line)',
                    background: status === 'online' ? 'var(--ok-soft)' : 'var(--surface)',
                    color: status === 'online' ? 'var(--ok)' : 'var(--text-2)',
                    fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} />
                  На смене (Активен)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('off')}
                  style={{
                    flex: 1, height: 38, borderRadius: 8,
                    border: status === 'off' ? '1px solid var(--line-strong)' : '1px solid var(--line)',
                    background: status === 'off' ? 'var(--surface-3)' : 'var(--surface)',
                    color: status === 'off' ? 'var(--text)' : 'var(--text-3)',
                    fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)' }} />
                  Выходной
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10
          }}>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </button>
            <Btn
              type="submit"
              size="sm"
              variant="accent"
              icon="check"
              disabled={submitting}
            >
              {submitting ? 'Сохранение...' : (isEditing ? 'Сохранить изменения' : 'Сохранить сотрудника')}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function Staff({ t, toast }) {
  const [team, setTeam] = useState(FX.staff);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
              id: s.user_id,
              user_id: s.user_id,
              name: s.full_name,
              full_name: s.full_name,
              role: s.role,
              shift: s.shift || '11:00 – 23:00',
              status: s.status || 'online',
              initials,
              phone: s.phone || '+998 90 019 57 65',
              user_name: s.user_name || '',
              telegram_id: s.telegram_id || s.user_id,
              vehicle: s.vehicle || '',
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

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleEdit = (m) => {
    setEditingStaff(m);
    setModalOpen(true);
  };

  const toggleStatus = async (m) => {
    const nextStatus = m.status === 'online' ? 'off' : 'online';
    try {
      const res = await fetch('/api/admin/staff/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: m.id || m.user_id, status: nextStatus })
      });
      const data = await res.json();
      if (data.ok) {
        toast(`Статус сотрудника ${m.name} изменён на "${nextStatus === 'online' ? 'На смене' : 'Выходной'}"`, 'ok', 'check');
        fetchStaff();
      }
    } catch (e) {
      toast('Ошибка обновления статуса: ' + e.message, 'danger', 'alert');
    }
  };

  const handleDelete = async (m) => {
    if (!(await fxConfirm(`Удалить сотрудника ${m.name} (${m.role}) из штата ресторана?`, { title: 'Удалить сотрудника' }))) return;
    try {
      const res = await fetch('/api/admin/staff/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: m.id || m.user_id })
      });
      const data = await res.json();
      if (data.ok) {
        toast(`Сотрудник ${m.name} удалён из смены`, 'ok', 'trash');
        fetchStaff();
      }
    } catch (e) {
      toast('Ошибка удаления сотрудника: ' + e.message, 'danger', 'alert');
    }
  };

  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      // Role tab filter
      if (filterRole === 'courier') {
        const isC = m.role.toLowerCase().includes('курьер') || m.role === 'courier';
        if (!isC) return false;
      } else if (filterRole === 'kitchen') {
        const isK = m.role.toLowerCase().includes('повар') || m.role.toLowerCase().includes('шеф');
        if (!isK) return false;
      } else if (filterRole === 'hall') {
        const isH = m.role.toLowerCase().includes('официант') || m.role.toLowerCase().includes('бармен');
        if (!isH) return false;
      } else if (filterRole === 'mgmt') {
        const isM = m.role.toLowerCase().includes('диспетчер') || m.role.toLowerCase().includes('менеджер') || m.role.toLowerCase().includes('админ');
        if (!isM) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(q);
        const matchRole = m.role.toLowerCase().includes(q);
        const matchUser = m.user_name && m.user_name.toLowerCase().includes(q);
        const matchPhone = m.phone && m.phone.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchUser && !matchPhone) return false;
      }
      return true;
    });
  }, [team, filterRole, searchQuery]);

  const couriersOnline = team.filter((m) => (m.role.toLowerCase().includes('курьер') || m.role === 'courier') && m.status === 'online').length;
  const staffOnline = team.filter((m) => m.status === 'online').length;

  return (
    <div className="page">
      {/* KPIs */}
      <div className="kpis">
        {[
          { l: 'Всего в штате', v: team.length, f: 'Персонал Fenix Restobar', icon: 'users' },
          { l: 'На смене сейчас', v: staffOnline, f: 'Активный рабочий состав', icon: 'check' },
          { l: 'Курьеров активно', v: couriersOnline, f: 'Служба доставки на линии', icon: 'bike', warn: couriersOnline === 0 },
          { l: 'Статус смены', v: '11:00 – 23:00', f: 'Основная смена ресторана', icon: 'clock' },
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

      {/* Filter toolbar */}
      <div className="filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        {/* Role tabs */}
        <div style={{ display: 'inline-flex', gap: 6, background: 'var(--surface)', padding: 4, borderRadius: 8, border: '1px solid var(--line)' }}>
          {[
            { id: 'all', label: 'Все' },
            { id: 'courier', label: 'Курьеры' },
            { id: 'hall', label: 'Зал & Бар' },
            { id: 'kitchen', label: 'Кухня' },
            { id: 'mgmt', label: 'Менеджмент' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              style={{
                background: filterRole === tab.id ? 'var(--accent)' : 'transparent',
                color: filterRole === tab.id ? '#0b0a08' : 'var(--text-2)',
                fontWeight: filterRole === tab.id ? 700 : 500,
                fontSize: 11.5,
                border: 'none',
                borderRadius: 6,
                padding: '5px 11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--line-strong)',
          borderRadius: 8, padding: '0 10px', height: 34, minWidth: 200
        }}>
          <Icon name="search" size={13} style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, телефону, TG..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              color: 'var(--text)', fontSize: 11.5, width: '100%'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}
            >
              <Icon name="x" size={11} />
            </button>
          )}
        </div>

        <span className="grow" />

        {/* Add staff button */}
        <Btn size="sm" variant="accent" icon="plus" onClick={handleOpenAdd}>
          Добавить сотрудника
        </Btn>
      </div>

      {/* Staff Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ paddingLeft: 20, textAlign: 'left' }}>Сотрудник & Telegram</th>
                <th style={{ textAlign: 'left' }}>Должность & Транспорт</th>
                <th style={{ textAlign: 'left' }}>Контакт</th>
                <th style={{ textAlign: 'left' }}>График / Смена</th>
                <th style={{ textAlign: 'center' }}>Статус / Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-3)' }}>
                    Сотрудники не найдены
                  </td>
                </tr>
              ) : (
                filteredTeam.map((m) => {
                  const isCourier = m.role.toLowerCase().includes('курьер') || m.role === 'courier';
                  return (
                    <tr
                      key={m.id || m.name}
                      onClick={() => handleEdit(m)}
                      title="Нажмите на строку для редактирования сотрудника"
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ paddingLeft: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="avatar" data-tone={isCourier ? 'info' : 'accent'}>{m.initials}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{m.name}</span>
                              <span style={{ color: 'var(--text-3)', opacity: 0.6 }} title="Редактировать">
                                <Icon name="edit" size={10} />
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              {m.user_name ? (
                                <a
                                  href={`https://t.me/${m.user_name}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mono"
                                  style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 10.5 }}
                                >
                                  @{m.user_name}
                                </a>
                              ) : (
                                <span className="dim mono" style={{ fontSize: 10.5 }}>Без юзернейма</span>
                              )}
                              {m.telegram_id && String(m.telegram_id) !== String(m.id) && (
                                <span className="mono dim" style={{ fontSize: 9.5, background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 4 }}>
                                  TG ID: {m.telegram_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: isCourier ? 'var(--info)' : 'var(--text-2)' }}>
                            <Icon name={getRoleIcon(m.role)} size={13} />
                          </span>
                          <span style={{ fontWeight: 500, color: 'var(--text)' }}>{m.role}</span>
                        </div>
                        {isCourier && m.vehicle && (
                          <div className="dim mono" style={{ fontSize: 10, marginTop: 3 }}>
                            {m.vehicle}
                          </div>
                        )}
                      </td>
                      <td>
                        <a
                          href={`tel:${m.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mono"
                          style={{
                            color: 'var(--text-2)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11
                          }}
                        >
                          <Icon name="phone" size={11} />
                          {m.phone}
                        </a>
                      </td>
                      <td>
                        <span className="mono dim" style={{ fontSize: 11 }}>{m.shift}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleStatus(m); }}
                            title="Нажмите для переключения статуса смены"
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                          >
                            <Pill tone={m.status === 'online' ? 'ok' : 'muted'} dot>
                              {m.status === 'online' ? 'На смене' : 'Выходной'}
                            </Pill>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            title="Редактировать сотрудника"
                            onClick={(e) => { e.stopPropagation(); handleEdit(m); }}
                            style={{ width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Icon name="edit" size={12} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            title="Удалить сотрудника"
                            onClick={(e) => { e.stopPropagation(); handleDelete(m); }}
                            style={{ width: 28, height: 28, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Icon name="trash" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Modal (Add or Edit) */}
      <StaffModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingStaff(null); }}
        initialStaff={editingStaff}
        onSave={fetchStaff}
        toast={toast}
      />
    </div>
  );
}

Object.assign(window, { Couriers, MenuScreen, Staff });
