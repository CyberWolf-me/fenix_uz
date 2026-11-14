/* ═══════════ DISPATCH — kanban, order drawer, receipt ═══════════ */

const COLUMNS = [
  { id: 'new', idx: '01', label: 'new', tone: 'var(--accent)' },
  { id: 'kitchen', idx: '02', label: 'kitchen', tone: 'var(--info)' },
  { id: 'way', idx: '03', label: 'way', tone: 'var(--violet)' },
  { id: 'done', idx: '04', label: 'done', tone: 'var(--ok)' },
];

function Kpis({ t, orders = [], bookingsCount = 0 }) {
  const [expandedMobile, setExpandedMobile] = useState(false);
  const active = orders.filter((o) => o.col !== 'done').length;
  const inKitchen = orders.filter((o) => o.col === 'kitchen').length;
  const rev = orders.reduce((s, o) => s + (o.total || 0), 0);
  const late = orders.filter((o) => slaState(o).late && o.col !== 'done').length;
  const newOrdersCount = orders.filter((o) => o.col === 'new').length;
  const attentionCount = newOrdersCount + late;

  const cards = [
    {
      label: 'active_orders',
      icon: 'dpad',
      num: active,
      foot: inKitchen > 0 ? `${inKitchen} на кухне` : active > 0 ? `${active} в обработке` : 'Кухня свободна',
      pills: [{ tone: active > 6 ? 'warn' : 'ok', text: active > 0 ? 'Кухня в норме' : 'Ожидание' }],
    },
    {
      label: 'revenue',
      icon: 'wallet',
      num: summ(rev),
      suffix: 'сум',
      serif: true,
      foot: `${t('checks')}: ${orders.length}`,
      pills: [{ tone: 'ok', text: t('today') }],
      delta: orders.length > 0 ? `${orders.length} заказов` : null,
      up: true,
    },
    {
      label: 'bookings_today',
      icon: 'calendar',
      num: bookingsCount,
      foot: bookingsCount > 0 ? `${bookingsCount} активных броней` : 'Броней на сегодня нет',
      pills: [{ tone: 'info', text: '3 зала' }],
    },
    {
      label: 'attention',
      icon: 'alert',
      num: attentionCount,
      foot: newOrdersCount > 0 ? `${newOrdersCount} новых требуют ответа` : 'Все заказы в работе',
      pills: [{ tone: attentionCount > 0 ? 'warn' : 'ok', text: attentionCount > 0 ? 'Внимание' : 'В норме' }],
      alert: attentionCount > 0,
    },
  ];

  return (
    <div className="kpis-container">
      {/* Mobile Compact Metric Strip (Saves ~190px of vertical space on phones) */}
      <div className="kpis-mobile-strip">
        <button
          type="button"
          className="kpis-mobile-summary"
          onClick={() => setExpandedMobile((v) => !v)}
          aria-expanded={expandedMobile}
          title="Нажмите, чтобы развернуть подробные метрики"
        >
          <div className="kpis-mobile-items">
            <span className="kpis-mobile-pill active">
              <span className="kpis-dot active" />
              <b className="mono">{active}</b> в работе
            </span>
            <span className="kpis-mobile-pill rev">
              <span className="kpis-dot rev" />
              <b className="mono">{summ(rev)}</b> сум
            </span>
            {attentionCount > 0 ? (
              <span className="kpis-mobile-pill warn">
                <span className="kpis-dot warn" />
                <b className="mono">{attentionCount}</b> вним.
              </span>
            ) : (
              <span className="kpis-mobile-pill">
                <span className="kpis-dot info" />
                <b className="mono">{bookingsCount}</b> брон.
              </span>
            )}
          </div>
          <span className="kpis-mobile-toggle">
            <span>{expandedMobile ? 'Скрыть' : 'Сводка'}</span>
            <Icon name={expandedMobile ? 'chevronU' : 'chevronD'} size={12} />
          </span>
        </button>
      </div>

      {/* Full Metric Cards Grid (Standard on Desktop, Accordion on Mobile) */}
      <div className={`kpis ${expandedMobile ? 'mobile-expanded' : ''}`}>
        {cards.map((c) => (
          <div className="card kpi" key={c.label}>
            <div className="kpi-top">
              <span className="label">{t(c.label)}</span>
              <span className="kpi-ico" style={c.alert ? { color: 'var(--warn)', background: 'var(--warn-soft)' } : undefined}>
                <Icon name={c.icon} size={14} />
              </span>
            </div>
            <div className="kpi-body">
              <div className="stat-num">
                {c.num}{c.suffix && <small>{c.suffix}</small>}
              </div>
              {c.delta && (
                <span className="delta" data-up={c.up ? '1' : '0'}>
                  <Icon name="arrowUp" size={10} stroke={2.2} />{c.delta}
                </span>
              )}
            </div>
            <div className="kpi-foot">
              <span className="trunc">{c.foot}</span>
              {c.pills.map((p) => (
                <Pill key={p.text} tone={p.tone} dot={p.tone === 'ok'}>
                  <span>{p.text}</span>
                </Pill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderCard({ o, t, onOpen, onAdvance, sel, onPrint, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = slaState(o);
  const nextLabel = { new: 'accept', kitchen: 'ready', way: 'mark_done', done: null }[o.col];
  return (
    <article className="ocard" data-sel={sel ? '1' : '0'} data-late={s.late ? '1' : '0'}
             onClick={() => onOpen(o)} tabIndex={0}
             onKeyDown={(e) => { if (e.key === 'Enter') onOpen(o); }}>
      <div className="ocard-top">
        <span className="oid">#{o.id}</span>
        {o.col !== 'done' && <SlaTime o={o} t={t} />}
        {o.col === 'done' && <span className="otime"><Icon name="check" size={10} stroke={2.4} />{fmtElapsed(o.elapsed)}</span>}
      </div>

      <div className="ocard-tags"><TypeTag type={o.type} t={t} /></div>

      <div className="ocard-client">
        <span className="oclient">{o.client}</span>
      </div>
      <div className="ophone" style={{ marginTop: 2 }}>{o.phone}</div>

      {o.addr && (
        <div className="oaddr">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
            <span className="oaddr-lbl">{t('address')}</span>
            <span className="oaddr-txt">{o.addr}</span>
          </div>
        </div>
      )}
      {o.courier && (
        <div className="oaddr" style={{ padding: '4px 8px', background: 'var(--surface-3)', border: '1px solid var(--accent-line, var(--line))', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Icon name="bike" size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent-2)' }}>Курьер: {o.courier}</span>
        </div>
      )}
      {o.table && (
        <div className="oaddr" style={{ padding: '5px 8px' }}>
          <Icon name="grid" size={11} style={{ color: 'var(--text-3)', marginTop: 1 }} />
          <span className="oaddr-txt">{o.table}</span>
        </div>
      )}

      <div className="oitems">
        {o.items.slice(0, 3).map((it, i) => (
          <div className="oitem" key={i}>
            <span className="oitem-n">{it.n}</span>
            <span className="oitem-q">× {it.q}</span>
          </div>
        ))}
        {o.items.length > 3 && <div className="oitem"><span className="oitem-n dim">+{o.items.length - 3} ещё</span></div>}
      </div>

      {o.col !== 'done' && <SlaBar o={o} />}

      <div className="ocard-foot">
        <span className="opay">
          <Icon name={o.pay === 'card' ? 'card' : 'wallet'} size={11} />{t(o.pay)}
        </span>
        <span className="ototal">{summ(o.total)}<small>сум</small></span>
      </div>

      <div className="ocard-actions" onClick={(e) => e.stopPropagation()}>
        {nextLabel ? (
          <Btn size="sm" variant={o.col === 'new' ? 'accent' : undefined} icon={o.col === 'new' ? 'check' : o.col === 'kitchen' ? 'printer' : 'check'}
               onClick={() => onAdvance(o)}>{t(nextLabel)}</Btn>
        ) : (
          <span className="grow" />
        )}
        <div style={{ position: 'relative' }}>
          <Btn
            size="sm"
            variant="ghost"
            className="btn-icon"
            title="Действия с заказом"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          >
            <Icon name="more" size={13} />
          </Btn>
          {menuOpen && (
            <>
              <div
                className="order-menu-scrim"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
              />
              <div className="order-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit && onEdit(o); }}
                >
                  <Icon name="edit" size={13} />
                  <span>Редактировать заказ</span>
                </button>
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onPrint && onPrint(o); }}
                >
                  <Icon name="printer" size={13} />
                  <span>Печать чека</span>
                </button>
                {o.phone && (
                  <a
                    href={'tel:' + String(o.phone).replace(/\s/g, '')}
                    className="context-menu-item"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
                  >
                    <Icon name="phone" size={13} />
                    <span>Позвонить клиенту</span>
                  </a>
                )}
                <button
                  type="button"
                  className="context-menu-item"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onOpen && onOpen(o); }}
                >
                  <Icon name="bookStack" size={13} />
                  <span>Карточка заказа</span>
                </button>
                <div className="context-menu-divider" />
                <button
                  type="button"
                  className="context-menu-item danger"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete && onDelete(o); }}
                >
                  <Icon name="trash" size={13} />
                  <span>Удалить заказ</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function OrderDrawer({ o, t, onClose, onAdvance, onPrint, onToast }) {
  const s = slaState(o);
  const steps = [
    { id: 'new', label: t('accepted') || 'Принят' }, { id: 'kitchen', label: t('kitchen') },
    { id: 'way', label: t('way') }, { id: 'done', label: t('done') },
  ];
  const curIdx = steps.findIndex((x) => x.id === o.col);
  return (
    <Modal drawer onClose={onClose} label={t('order_card')}>
      <div className="modal-head">
        <Icon name="receipt" size={15} style={{ color: 'var(--accent)' }} />
        <div className="grow">
          <div className="modal-title">#{o.id}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
        </div>
        {s.late ? <Pill tone="danger" dot>{t('late')}</Pill> : <Pill tone="ok" dot>{t('on_time')}</Pill>}
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {/* stage tracker */}
        <div>
          <div className="sect-title">{t('stage')}</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {steps.map((st, i) => (
              <div key={st.id} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 2,
                  background: i <= curIdx ? 'var(--accent)' : 'var(--surface-3)',
                }} />
                <div style={{
                  fontSize: 9, marginTop: 5, fontWeight: 600,
                  color: i <= curIdx ? 'var(--text)' : 'var(--text-3)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
          <div className="row" style={{ marginBottom: 7 }}>
            <TypeTag type={o.type} t={t} />
            <span className="grow" />
            <SlaTime o={o} t={t} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <div>
              <div className="label">{t('client')}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{o.client}</div>
            </div>
            <div>
              <div className="label">{t('phone')}</div>
              <a href={'tel:' + o.phone.replace(/\s/g, '')} className="mono" style={{ fontSize: 11, marginTop: 2, display: 'block', color: 'var(--accent)', textDecoration: 'none' }}>{o.phone}</a>
            </div>
            {o.addr && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="label">{t('address')}</div>
                <div style={{ fontSize: 11.5, marginTop: 2, color: 'var(--text-2)' }}>{o.addr}</div>
              </div>
            )}
            {o.table && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="label">{t('table')}</div>
                <div style={{ fontSize: 11.5, marginTop: 2 }}>{o.table}</div>
              </div>
            )}
            {o.courier && (
              <div>
                <div className="label">{t('courier')}</div>
                <div style={{ fontSize: 11.5, marginTop: 2 }}>{o.courier}</div>
              </div>
            )}
            <div>
              <div className="label">{t('status')}</div>
              <div style={{ marginTop: 3 }}><Pill tone={s.late ? 'danger' : 'ok'}>{s.late ? t('late') : t('on_time')}</Pill></div>
            </div>
          </div>
        </div>

        <div>
          <div className="sect-title">{t('items')}</div>
          <div className="card" style={{ padding: '4px 11px' }}>
            {o.items.map((it, i) => (
              <div key={i} className="row" style={{ padding: '8px 0', borderBottom: i < o.items.length - 1 ? '1px solid var(--line-soft)' : 0 }}>
                <span className="grow" style={{ fontSize: 11.5 }}>{it.n}</span>
                <span className="mono dim" style={{ fontSize: 10 }}>× {it.q}</span>
                <span className="mono" style={{ fontSize: 11, minWidth: 62, textAlign: 'right' }}>{summ(it.q * it.p)}</span>
              </div>
            ))}
          </div>
        </div>

        {o.note && (
          <div style={{ padding: '9px 11px', borderRadius: 'var(--r-sm)', background: 'var(--warn-soft)', border: '1px solid color-mix(in srgb, var(--warn) 24%, transparent)' }}>
            <div className="label" style={{ color: 'var(--warn)' }}>{t('notes')}</div>
            <div style={{ fontSize: 11.5, marginTop: 2 }}>{o.note}</div>
          </div>
        )}

        <div className="card" style={{ padding: 11 }}>
          <div className="row" style={{ fontSize: 11.5, color: 'var(--text-2)', marginBottom: 5 }}>
            <span className="grow">{t('subtotal')}</span><span className="mono">{summ(o.total - o.fee)}</span>
          </div>
          <div className="row" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
            <span className="grow">{t('delivery_fee')}</span><span className="mono">{o.fee ? summ(o.fee) : '—'}</span>
          </div>
          <div className="row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <span className="grow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-2)' }}>{t('total')}</span>
            <span className="ototal" style={{ fontSize: 17 }}>{summ(o.total)}<small>сум</small></span>
          </div>
        </div>

        <div className="row" style={{ gap: 6 }}>
          <Btn icon="phone" onClick={() => onToast('Звонок: ' + o.phone)} style={{ flex: 1 }}>{t('call_client')}</Btn>
          <Btn icon="printer" onClick={() => onPrint(o)} style={{ flex: 1 }}>{t('print')}</Btn>
        </div>
      </div>
      <div className="modal-foot">
        <Btn variant="accent" icon="check" className="grow" onClick={() => onAdvance(o)}>
          {o.col === 'new' ? t('accept') : o.col === 'kitchen' ? t('ready') : o.col === 'way' ? t('mark_done') : t('done')}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>{t('close')}</Btn>
      </div>
    </Modal>
  );
}

function ReceiptModal({ o, onClose, t }) {
  const r = FX.restaurant;
  const pad = (s, n) => String(s).padEnd(n, ' ');
  const lpad = (s, n) => String(s).padStart(n, ' ');
  const line = '='.repeat(44);
  const thin = '-'.repeat(44);
  const dt = new Date();
  const body = [
    line,
    '            FENIX RESTORAN',
    '        ' + r.address.split(',')[0],
    '    ' + r.address.slice(r.address.indexOf(',') + 1, 52),
    '       ИНН: ' + r.inn,
    '      Тел: ' + r.phone,
    line,
    'ЧЕК ЗАКАЗА: #' + o.id,
    'ВРЕМЯ:   ' + dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    'КЛИЕНТ:  ' + o.client,
    'ТЕЛЕФОН: ' + o.phone,
    'СМЕНА:   1 (открыта)',
    'КАССИР:  Диспетчер 01',
    'ОФИЦИАНТ:' + (o.courier || ' —'),
    thin,
    'НАИМЕНОВАНИЕ              КОЛ-ВО',
    thin,
    ...o.items.map((it) => pad(it.n.slice(0, 26), 26) + '×' + lpad(it.q, 4)),
    thin,
    'СУММА:            ' + lpad(summ(o.total - o.fee), 8),
    'ДОСТАВКА:         ' + lpad(summ(o.fee), 8),
    'СПОСОБ ОПЛАТЫ:    ' + (o.pay === 'card' ? 'Карта' : 'Наличные'),
    line,
    'ИТОГО К ОПЛАТЕ:   ' + lpad(summ(o.total) + ' сум', 8),
    line,
    '   Спасибо за заказ!',
    '   ' + r.site,
    line,
  ].join('\n');
  return (
    <Modal onClose={onClose} width={430} label={t('print_fiscal')}>
      <div className="modal-head">
        <Icon name="printer" size={15} style={{ color: 'var(--accent)' }} />
        <div className="modal-title grow">{t('print_fiscal')}</div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="receipt-wrap" style={{ padding: '13px', maxHeight: '58vh', overflow: 'auto' }}>
        <div className="receipt">{body}</div>
      </div>
      <div className="modal-foot">
        <Btn variant="accent" icon="printer" className="grow" onClick={() => { window.print(); onClose(); }}>{t('print_btn')}</Btn>
        <Btn variant="ghost" onClick={onClose}>{t('close')}</Btn>
      </div>
    </Modal>
  );
}

function EditOrderModal({ o, onClose, onSave, toast }) {
  const [client, setClient] = useState(o.client || '');
  const [phone, setPhone] = useState(o.phone || '');
  const [addr, setAddr] = useState(o.addr || o.table || '');
  const [total, setTotal] = useState(o.total || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: o.dbId,
          orderNum: o.orderNum,
          client,
          phone,
          addr,
          total: Number(total),
        }),
      });
      if (res.ok) {
        onSave && onSave({
          ...o,
          client,
          phone,
          addr: o.type === 'delivery' ? addr : undefined,
          table: o.type === 'hall' ? addr : undefined,
          total: Number(total),
        });
        toast && toast(`Заказ #${o.id} успешно обновлён`, 'ok', 'check');
        onClose();
      } else {
        toast && toast('Ошибка при сохранении заказа', 'err', 'alert');
      }
    } catch (err) {
      toast && toast('Ошибка связи с сервером: ' + err.message, 'err', 'alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} label={`Редактирование #${o.id}`}>
      <div className="modal-head">
        <Icon name="edit" size={16} style={{ color: 'var(--accent)' }} />
        <div className="grow">
          <div className="modal-title">Редактировать заказ #{o.id}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Изменение данных клиента и суммы</div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Имя клиента *</label>
            <input
              required
              className="input"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Тимур"
              style={{ width: '100%', marginTop: 5, padding: '8px 11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="label">Телефон клиента *</label>
            <input
              required
              className="input mono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
              style={{ width: '100%', marginTop: 5, padding: '8px 11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="label">{o.type === 'delivery' ? 'Адрес доставки' : 'Стол в зале'}</label>
            <input
              className="input"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder={o.type === 'delivery' ? 'ул. Навои, 15' : 'Стол 4'}
              style={{ width: '100%', marginTop: 5, padding: '8px 11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="label">Итоговая сумма заказа (сум)</label>
            <input
              type="number"
              className="input mono"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={{ width: '100%', marginTop: 5, padding: '8px 11px', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xs)', color: 'var(--text)', fontWeight: 700 }}
            />
          </div>
        </div>
        <div className="modal-foot">
          <Btn type="submit" variant="accent" icon="check" className="grow" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Btn>
          <Btn type="button" variant="ghost" onClick={onClose}>Отмена</Btn>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({ o, onClose, onDeleted, toast }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: o.dbId,
          orderNum: o.orderNum,
        }),
      });
      if (res.ok) {
        onDeleted && onDeleted(o.id);
        toast && toast(`Заказ #${o.id} удалён из базы`, 'warn', 'trash');
        onClose();
      } else {
        toast && toast('Ошибка при удалении заказа', 'err', 'alert');
      }
    } catch (err) {
      toast && toast('Ошибка связи с сервером: ' + err.message, 'err', 'alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} label={`Удалить заказ #${o.id}`}>
      <div className="modal-head">
        <Icon name="trash" size={16} style={{ color: 'var(--danger)' }} />
        <div className="grow">
          <div className="modal-title" style={{ color: 'var(--danger)' }}>Удаление заказа #{o.id}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Подтверждение удаления</div>
        </div>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
          Вы уверены, что хотите удалить заказ <b>#{o.id}</b> клиента <b>{o.client}</b> на сумму <b>{summ(o.total)} сум</b>?
        </p>
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '8px 12px', borderRadius: 'var(--r-xs)' }}>
          Это действие безвозвратно удалит запись из базы данных SQLite ресторана.
        </p>
      </div>
      <div className="modal-foot">
        <Btn type="button" variant="danger" icon="trash" className="grow" disabled={loading} onClick={handleDelete}>
          {loading ? 'Удаление...' : 'Да, удалить заказ'}
        </Btn>
        <Btn type="button" variant="ghost" onClick={onClose}>Отмена</Btn>
      </div>
    </Modal>
  );
}

function Dispatch({ t, orders, dispatch, view, setView, onOpen, onAdvance, onPrint, toast, lang, bookingsCount = 0, onUpdateOrder, onDeleteOrder }) {
  const [q, setQ] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [sort, setSort] = useState('sla');
  const [mobileStage, setMobileStage] = useState('new');
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);

  const filtered = useMemo(() => {
    let list = orders.filter((o) => {
      if (q) {
        const hay = (o.id + o.client + o.phone + (o.addr || '')).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (typeF !== 'all' && o.type !== typeF) return false;
      return true;
    });
    if (sort === 'sla') list = [...list].sort((a, b) => (b.elapsed / b.sla) - (a.elapsed / a.sla));
    if (sort === 'total') list = [...list].sort((a, b) => b.total - a.total);
    return list;
  }, [orders, q, typeF, sort]);

  const lateCount = filtered.filter((o) => slaState(o).late && o.col !== 'done').length;
  const newCount = filtered.filter((o) => o.col === 'new').length;

  return (
    <div className="page page-flush dispatch-page">
      <Kpis t={t} orders={orders} bookingsCount={bookingsCount} />

      {/* Spacious Unified Toolbar (Single Elegant Row on Desktop, Adaptive on Mobile) */}
      <div className="dispatch-toolbar">
        {/* Left: Filter Chips + Late Warning */}
        <div className="dispatch-toolbar-left">
          <div className="chips">
            {['all', 'delivery', 'pickup', 'hall'].map((k) => (
              <button key={k} className="chip" data-on={typeF === k ? '1' : '0'} onClick={() => setTypeF(k)}>
                {k === 'all' ? t('all') : t(k)}
              </button>
            ))}
          </div>

          {lateCount > 0 && (
            <Pill tone="danger" dot>{lateCount} {t('late')}</Pill>
          )}
        </div>

        {/* Center: Search Input */}
        <div className="dispatch-toolbar-center">
          <div className="search">
            <Icon name="search" size={13} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по номеру, имени или адресу..."
            />
            {q ? (
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setQ('')} title="Очистить">
                <Icon name="x" size={11} />
              </button>
            ) : (
              <span className="kbd hide-mobile">⌘K</span>
            )}
          </div>
        </div>

        {/* Right: Sort Controls + View Toggle + Quick Action */}
        <div className="dispatch-toolbar-right">
          <div className="seg hide-mobile">
            <button data-on={sort === 'sla' ? '1' : '0'} onClick={() => setSort('sla')} title="Сортировка по срочности SLA">SLA</button>
            <button data-on={sort === 'total' ? '1' : '0'} onClick={() => setSort('total')} title="По сумме чека">Σ</button>
          </div>

          <div className="seg">
            <button data-on={view === 'board' ? '1' : '0'} onClick={() => setView('board')} title={t('board')}>
              <Icon name="grid" size={12} />
            </button>
            <button data-on={view === 'list' ? '1' : '0'} onClick={() => setView('list')} title={t('list')}>
              <Icon name="bookStack" size={12} />
            </button>
          </div>

          {newCount > 0 && (
            <Btn size="sm" variant="accent" icon="check" onClick={() => dispatch('acceptAll')} title={t('accept_all')}>
              <span>{t('accept_all')}</span>
            </Btn>
          )}
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (Purpose-built for handheld touch ergonomics) */}
      {view === 'board' && (
        <div className="mobile-stage-tabs" role="tablist" aria-label="Статусы заказов">
          {COLUMNS.map((c) => {
            const list = filtered.filter((o) => o.col === c.id);
            const on = mobileStage === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                className="mobile-stage-tab"
                data-on={on ? '1' : '0'}
                onClick={() => setMobileStage(c.id)}
                style={{ '--stage-tone': c.tone }}
              >
                <span className="mobile-stage-tab-name">{t(c.label)}</span>
                <span className="mobile-stage-tab-badge" data-tone={c.id === 'new' && list.length > 0 ? 'accent' : 'normal'}>
                  {list.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingBottom: 14 }}>
        {view === 'board' ? (
          <div className="board dispatch-board" data-mobile-stage={mobileStage}>
            {COLUMNS.map((c) => {
              const list = filtered.filter((o) => o.col === c.id);
              const isMobileActive = mobileStage === c.id;
              return (
                <section
                  className={`col ${isMobileActive ? 'mobile-active-stage' : 'mobile-inactive-stage'}`}
                  key={c.id}
                  data-screen-label={t(c.label)}
                >
                  <div className="col-head" style={{ '--col-tone': c.tone }}>
                    <span className="col-idx">{c.idx}</span>
                    <span className="col-name">{t(c.label)}</span>
                    <span className="col-count">{list.length}</span>
                  </div>
                  <div className="col-body">
                    {list.map((o) => (
                      <OrderCard
                        key={o.id}
                        o={o}
                        t={t}
                        onOpen={onOpen}
                        onAdvance={onAdvance}
                        onPrint={onPrint}
                        onEdit={(ord) => setEditingOrder(ord)}
                        onDelete={(ord) => setDeletingOrder(ord)}
                      />
                    ))}
                    {!list.length && (
                      <div className="empty">
                        <Icon name="box" size={22} />
                        <span>{c.id === 'new' ? 'Новых заказов нет' : c.id === 'kitchen' ? 'На кухне свободно' : c.id === 'way' ? 'Нет заказов в пути' : 'Выполненных заказов нет'}</span>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="card tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th><th>{t('client')}</th><th>{t('status')}</th><th>{t('items')}</th>
                  <th>SLA</th><th>{t('courier')} / {t('address')}</th><th className="tbl-right">{t('total')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const s = slaState(o);
                  return (
                    <tr key={o.id} data-late={s.late ? '1' : '0'} onClick={() => onOpen(o)}>
                      <td className="mono">#{o.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.client}</div>
                        <div className="dim mono" style={{ fontSize: 9.5 }}>{o.phone}</div>
                      </td>
                      <td><Pill tone={COL_TONE[o.col]}>{t(o.col)}</Pill></td>
                      <td className="dim">{o.items.length} поз.</td>
                      <td><SlaTime o={o} t={t} /></td>
                      <td className="dim trunc" style={{ maxWidth: 190 }}>{o.courier || o.addr || o.table || '—'}</td>
                      <td className="tbl-right mono" style={{ fontWeight: 700 }}>{summ(o.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingOrder && (
        <EditOrderModal
          o={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={(updated) => {
            onUpdateOrder && onUpdateOrder(updated);
          }}
          toast={toast}
        />
      )}
      {deletingOrder && (
        <DeleteConfirmModal
          o={deletingOrder}
          onClose={() => setDeletingOrder(null)}
          onDeleted={(id) => {
            onDeleteOrder && onDeleteOrder(id);
          }}
          toast={toast}
        />
      )}
    </div>
  );
}

const COL_TONE = { new: 'accent', kitchen: 'info', way: 'violet', done: 'ok' };

Object.assign(window, { Dispatch, OrderDrawer, ReceiptModal, EditOrderModal, DeleteConfirmModal, Kpis, COLUMNS, COL_TONE, OrderCard });
