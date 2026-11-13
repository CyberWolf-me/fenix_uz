/* ═══════════ shared helpers + primitives ═══════════ */
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;

/* ── formatters ───────────────────────────────────────── */
const nf = new Intl.NumberFormat('ru-RU');
function money(n, cur) { return nf.format(Math.round(n)) + (cur === false ? '' : ''); }
function summ(n) { return nf.format(Math.round(n)); }
function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* ── icons (stroke, 1.6, 18px) ────────────────────────── */
const ICON_PATHS = {
  receipt: 'M5 3v14l2-1.2L9 17l2-1.2L13 17l2-1.2L17 17V3l-2 1.2L13 3l-2 1.2L9 3 7 4.2 5 3Z M8 7h6 M8 10.5h6',
  book: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H16v14H5.5A1.5 1.5 0 0 0 4 18.5V4.5Z M4 18.5A1.5 1.5 0 0 0 5.5 20H16v-3',
  bookStack: 'M3 6h13 M3 11h13 M3 16h9',
  star: 'M10 2.6l2.3 4.9 5.2.7-3.8 3.7.9 5.3-4.6-2.5-4.6 2.5.9-5.3L2.5 8.2l5.2-.7L10 2.6Z',
  grid: 'M3 3h6v6H3z M11 3h6v6h-6z M3 11h6v6H3z M11 11h6v6h-6z',
  bike: 'M6 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M14 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M6 13l3.5-5.5H13 M9.5 7.5 12 13 M13 5h3',
  menuBook: 'M3 4h6a3 3 0 0 1 3 3v10a2.2 2.2 0 0 0-2.2-2.2H3V4Z M17 4h-3a3 3 0 0 0-3 3v10a2.2 2.2 0 0 1 2.2-2.2H17V4Z',
  users: 'M13 17v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 2 15.5V17 M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M18 17v-1.5a3.5 3.5 0 0 0-2.6-3.4 M13.5 3.3a3 3 0 0 1 0 5.4',
  chart: 'M3 17h14 M5.5 17V9 M9.5 17V5 M13.5 17v-4',
  gear: 'M10 12.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z M16.3 12a6.3 6.3 0 0 0 0-4l1.5-1-1.6-2.8-1.9.7a6.3 6.3 0 0 0-3.4-2l-.4-2H8.4l-.4 2a6.3 6.3 0 0 0-3.4 2l-1.9-.7L1.1 7l1.5 1a6.3 6.3 0 0 0 0 4l-1.5 1 1.6 2.8 1.9-.7a6.3 6.3 0 0 0 3.4 2l.4 2h4.2l.4-2a6.3 6.3 0 0 0 3.4-2l1.9.7 1.6-2.8-1.6-1Z',
  search: 'M9 15.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M14 14l4 4',
  clock: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 6v4.3l2.8 1.7',
  bell: 'M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 0 0 10 2.5Z M8.2 15a1.9 1.9 0 0 0 3.6 0',
  pie: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 2v8h8',
  dpad: 'M6.5 8.5h7a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3Z M7 10.4v2.2 M5.9 11.5h2.2 M12.4 11v.01 M13.9 12.5v.01',
  printer: 'M6 8V3h8v5 M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-4A1.5 1.5 0 0 1 4.5 8h11A1.5 1.5 0 0 1 17 9.5v4a1.5 1.5 0 0 1-1.5 1.5H14 M6 12h8v5H6z',
  phone: 'M4 3.5h3l1.5 3.7-1.9 1.4a10 10 0 0 0 4.8 4.8l1.4-1.9L16.5 13v3.5a1.5 1.5 0 0 1-1.7 1.5A13.5 13.5 0 0 1 2.5 5.2 1.5 1.5 0 0 1 4 3.5Z',
  check: 'M4 10.5 7.5 14 16 5.5',
  x: 'M5 5l10 10 M15 5 5 15',
  chevronR: 'M7.5 4.5 13 10l-5.5 5.5',
  chevronD: 'M5 7.5 10 13l5-5.5',
  chevronL: 'M12.5 4.5 7 10l5.5 5.5',
  arrowUp: 'M10 16V4 M5 9l5-5 5 5',
  arrowDown: 'M10 4v12 M5 11l5 5 5-5',
  arrowRight: 'M4 10h12 M11 5l5 5-5 5',
  pin: 'M10 17s5.5-5 5.5-9a5.5 5.5 0 1 0-11 0c0 4 5.5 9 5.5 9Z M10 9.7a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  wallet: 'M3 6.5A2.5 2.5 0 0 1 5.5 4H15v3 M3 6.5V15a2 2 0 0 0 2 2h11a1 1 0 0 0 1-1V7H4a1 1 0 0 0-1 1Z M14 11.5h.01',
  card: 'M2.5 6.5h15v8a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-8Z M2.5 9h15 M5 13h3',
  bank: 'M2.5 8 10 4l7.5 4 M4 8v7 M8 8v7 M12 8v7 M16 8v7 M2.5 17.5h15',
  alert: 'M10 3.2 18 16.5H2L10 3.2Z M10 8v3.5 M10 13.8v.01',
  box: 'M3 6.5h14v10H3z M3 9.5h14 M7 6.5v-3h6v3',
  truck: 'M2.5 5.5h9v8h-9z M11.5 8h3l3 3v2.5h-6 M6 16.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z M14.5 16.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
  loop: 'M15.5 8A6 6 0 0 0 4.6 6.2 M4.5 12A6 6 0 0 0 15.4 13.8 M15.5 4v4h-4 M4.5 16v-4h4',
  sliders: 'M3 6h9 M15 6h2 M3 14h3 M9 14h8 M13.5 6a1.5 1.5 0 1 0 0-.01 M7.5 14a1.5 1.5 0 1 0 0-.01',
  layers: 'M10 2.5 17 6.5l-7 4-7-4 7-4Z M3 10.5l7 4 7-4 M3 14.5l7 4 7-4',
  palette: 'M10 17.5a7.5 7.5 0 1 1 0-15c4.4 0 7.5 3 7.5 6.5 0 2-1.5 3-3 3h-1.6a1.6 1.6 0 0 0-1.1 2.7c.5.6.2 1.8-1.3 1.8Z M6.5 9.5v.01 M9 6.8v.01 M13 6.8v.01',
  globe: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M2.5 10h15 M10 2c2 2.4 3 4.9 3 8s-1 5.6-3 8c-2-2.4-3-4.9-3-8s1-5.6 3-8Z',
  plus: 'M10 4v12 M4 10h12',
  minus: 'M4 10h12',
  filter: 'M3 5h14 M6 10h8 M8.5 15h3',
  more: 'M4 10h.01 M10 10h.01 M16 10h.01',
  edit: 'M4 16v-3.2L14.2 2.6l3.2 3.2L7.2 16H4Z M12.6 4.2l3.2 3.2',
  trash: 'M3.5 5.5h13 M8 5.5V3.2h4V5.5 M5.5 5.5l.8 10.3a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.8-10.3',
  door: 'M4.5 17.5V3.5h11v14 M2.5 17.5h15 M12 10.5v.01',
  lock: 'M4.5 9V6.5a3 3 0 0 1 6 0V9 M3.5 9h8v7h-8z',
  eye: 'M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z M10 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z',
  flame: 'M10 17.5c3 0 5-1.9 5-4.6 0-3.4-3.2-5-4.3-8.4-1.6 1.4-1.7 3.4-1.2 5-1-.4-1.8-1.4-2-2.6-1 1.3-2.5 3.4-2.5 6 0 2.7 2 4.6 5 4.6Z',
  wifi: 'M2.5 7.5a11 11 0 0 1 15 0 M5.5 10.5a7 7 0 0 1 9 0 M8.4 13.4a3 3 0 0 1 3.2 0 M10 16.5v.01',
  terminal: 'M3 4.5h14v11H3z M6.5 8l2 2-2 2 M10.5 12.5h3',
  calendar: 'M3.5 5.5h13v11h-13z M3.5 9h13 M7 3v3 M13 3v3',
  copy: 'M7 7h9v9H7z M4 12.5V4h8.5',
  download: 'M10 3v9 M6 8.5l4 4 4-4 M3.5 16.5h13',
  bolt: 'M11.5 2.5 4.5 11.5h4L8 17.5l7-9h-4l.5-6Z',
  panel: 'M3 4.5h14v11H3z M8 4.5v11',
  status: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  eyeOff: 'M2 2l16 16 M8.4 8.5a2.6 2.6 0 0 0 3.1 3.1 M5.1 5.3C3.5 6.6 2 10 2 10s3 5.5 8 5.5c1.9 0 3.6-.6 5-1.6 M11.8 4.7C17 5.2 18.5 10 18.5 10s-1 1.9-2.5 3.3',
  logOut: 'M7 17.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 4.5 2.5H7 M12.5 14l4-4-4-4 M16.5 10H7',
  music: 'M9 18V5l8-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M17 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
};

function Icon({ name, size = 16, stroke = 1.6, style, className }) {
  const d = ICON_PATHS[name] || ICON_PATHS.box;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
         style={style} className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ── buttons / pills ──────────────────────────────────── */
function Btn({ variant, size, icon, children, className = '', ...rest }) {
  const cls = ['btn', variant ? 'btn-' + variant : '', size ? 'btn-' + size : '', className].filter(Boolean).join(' ');
  return <button className={cls} {...rest}>{icon && <Icon name={icon} size={size === 'sm' ? 13 : 14} />}{children}</button>;
}

const PILL_TONES = ['ok', 'warn', 'danger', 'info', 'violet', 'muted', 'accent'];
function Pill({ tone = 'muted', dot, children, style }) {
  return <span className="pill" data-tone={tone} style={style}>{dot && <i />}{children}</span>;
}

const TYPE_META = {
  delivery: { icon: 'bike', tone: 'info', ru: 'Курьерская доставка' },
  pickup: { icon: 'box', tone: 'warn', ru: 'Самовывоз из ресторана' },
  hall: { icon: 'door', tone: 'violet', ru: 'В зале' },
};
function TypeTag({ type, t }) {
  const m = TYPE_META[type] || TYPE_META.delivery;
  return (
    <span className="pill" data-tone={m.tone} style={{ paddingLeft: 6 }}>
      <Icon name={m.icon} size={11} stroke={1.7} />{t(type)}
    </span>
  );
}

/* ── SLA logic ────────────────────────────────────────── */
function slaState(o) {
  const pct = o.elapsed / o.sla;
  const left = o.sla - o.elapsed;
  return { pct, left, late: left <= 0, warn: left > 0 && left <= 5,
           tone: left <= 0 ? 'danger' : pct > 0.72 ? 'warn' : 'ok' };
}
function fmtElapsed(min) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return m + 'м';
  const h = Math.floor(m / 60);
  return h + 'ч ' + (m % 60) + 'м';
}
function SlaBar({ o }) {
  const s = slaState(o);
  const w = Math.min(100, Math.round(s.pct * 100));
  return <div className="sla-bar"><div className="sla-fill" data-tone={s.tone} style={{ width: Math.max(3, w) + '%' }} /></div>;
}
function SlaTime({ o, t }) {
  const s = slaState(o);
  return (
    <span className="otime" data-late={s.late ? '1' : '0'} data-warn={s.warn ? '1' : '0'}>
      <Icon name={s.late ? 'alert' : 'clock'} size={10} stroke={1.9} />
      {s.late ? `${t('late')} ${fmtElapsed(-s.left)}` : `${fmtElapsed(s.left)}`}
    </span>
  );
}

/* ── charts (pure SVG) ────────────────────────────────── */
function Spark({ data, w = 96, h = 40, color, fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 3 - ((v - min) / rng) * (h - 8)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const gid = 'sg' + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color || 'var(--accent)'} stopOpacity=".28" />
        <stop offset="100%" stopColor={color || 'var(--accent)'} stopOpacity="0" />
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color || 'var(--accent)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0] - 1} cy={pts[pts.length - 1][1]} r="2" fill={color || 'var(--accent)'} />
    </svg>
  );
}

function Bars({ data, labels, height = 130, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 2px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%', height: Math.max(4, (v / max) * 100) + '%',
              background: color || 'var(--accent)', opacity: 0.35 + 0.65 * (v / max),
              borderRadius: '3px 3px 1px 1px', transition: 'height .4s var(--ease)',
            }} title={String(v)} />
          </div>
          <span style={{ fontSize: 8.5, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{labels ? labels[i] : ''}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ series, labels, height = 150 }) {
  const w = 640, h = height, padL = 30, padB = 20, padT = 8;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all) * 1.12;
  const iw = w - padL, ih = h - padB - padT;
  const px = (i, n) => padL + (i / (n - 1)) * iw;
  const py = (v) => padT + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      {[0, .25, .5, .75, 1].map((g, i) => (
        <line key={i} x1={padL} x2={w} y1={padT + ih * g} y2={padT + ih * g}
              stroke="var(--line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [px(i, s.data.length), py(v)]);
        const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        return (
          <g key={si}>
            {s.fill && <path d={line + ` L${px(s.data.length - 1, s.data.length)} ${padT + ih} L${padL} ${padT + ih} Z`}
                  fill={s.color} opacity=".1" />}
            <path d={line} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round"
                  strokeLinecap="round" strokeDasharray={s.dash ? '4 4' : 'none'}
                  vectorEffect="non-scaling-stroke" />
            {s.data.map((v, i) => <circle key={i} cx={px(i, s.data.length)} cy={py(v)} r="2.4" fill={s.color} />)}
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={i} x={px(i, labels.length)} y={h - 4} fill="var(--text-3)" fontSize="9"
              textAnchor="middle" fontFamily="var(--f-mono)">{l}</text>
      ))}
    </svg>
  );
}

/* ── live clock hook ──────────────────────────────────── */
function useTick(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
  return now;
}

/* ── modal shell ──────────────────────────────────────── */
function Modal({ children, onClose, width = 460, drawer = false, className = '', label }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={'scrim' + (drawer ? ' drawer-scrim' : '')} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className={'modal' + (drawer ? ' drawer' : '') + ' ' + className} role="dialog" aria-label={label}
           data-screen-label={label} style={drawer ? undefined : { width, maxWidth: '100%' }}>
        {children}
      </div>
    </div>
  );
}

/* ── toast ────────────────────────────────────────────── */
function useToasts() {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = 'ok', icon) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, msg, tone, icon }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2600);
  }, []);
  return [items, push];
}
function Toasts({ items }) {
  return (
    <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center', pointerEvents: 'none' }}>
      {items.map((t) => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 13px', borderRadius: 'var(--r-sm)',
          background: 'var(--surface-hi)', border: '1px solid var(--line-strong)', color: 'var(--text)',
          fontSize: 11.5, fontWeight: 600, boxShadow: 'var(--shadow-pop)', animation: 'rise .2s var(--ease)',
        }}>
          <span style={{ color: t.tone === 'danger' ? 'var(--danger)' : t.tone === 'warn' ? 'var(--warn)' : 'var(--ok)', display: 'flex' }}>
            <Icon name={t.icon || (t.tone === 'danger' ? 'alert' : 'check')} size={14} stroke={2} />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── beep (WebAudio, no asset) ────────────────────────── */
let audioCtx = null;
function beep(kind = 'alert') {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    const tones = kind === 'danger' ? [740, 560] : [560, 740];
    tones.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t0 + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.05, t0 + i * 0.13 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.13 + 0.11);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(t0 + i * 0.13); osc.stop(t0 + i * 0.13 + 0.12);
    });
  } catch (e) { /* no audio */ }
}

Object.assign(window, {
  useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect,
  nf, money, summ, initials, Icon, Btn, Pill, PILL_TONES, TYPE_META, TypeTag,
  slaState, fmtElapsed, SlaBar, SlaTime, Spark, Bars, LineChart, useTick, Modal, useToasts, Toasts, beep,
});
